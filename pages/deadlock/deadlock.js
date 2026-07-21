// pages/deadlock/deadlock.js
const { createRag, addProcess, addResource, addEdge, removeNode, removeEdge, getRagErrors, detectDeadlock } = require('../../utils/rag');
const { calculateNeed, isSafeState } = require('../../utils/bankers');

// ── 帮助面板内容 ──
const HELP_CONTENT = [
  {
    mode: 'rag',
    title: 'RAG 操作速查',
    summary: [
      '▸ 添加节点：点击 [+进程] 或 [+资源]（各上限 5 个）',
      '▸ 建立连线：选择边类型 → 点起点 → 点终点',
      '▸ 切换边类型：「边: 请求」↔「边: 分配」交替切换',
      '▸ 检测死锁：点击「检测死锁」按钮',
      '▸ 重置/预设：使用「↻ 重置」或内置预设场景'
    ],
    details: [
      '• 请求边需 P→R 方向，分配边需 R→P 方向',
      '• 点击选中节点（高亮环），再次点击取消选中',
      '• 死锁进程会标红 + 红色脉冲光晕',
      '• 检测结果会显示死锁进程名和环路路径',
      '• 图例说明：红虚线=请求边 / 蓝实线=分配边 / 圆=进程 / 方=资源'
    ]
  },
  {
    mode: 'bankers',
    title: '银行家算法操作速查',
    summary: [
      '▸ 调整进程数 / 资源类型数用 ± 按钮',
      '▸ Max / Allocation 矩阵：点击单元格输入数值',
      '▸ Available 向量：点击输入各类型可用实例数',
      '▸ Need 矩阵自动计算（Max − Allocation）',
      '▸ 点击「检查安全状态」运行算法'
    ],
    details: [
      '• 安全状态 = 存在"安全序列"使所有进程可完成',
      '• 不安全 ≠ 死锁 —— 只是可能在未来导致死锁',
      '• 检查过程：逐进程比对 Need ≤ Work',
      '• 步骤追踪：[满足]=绿色边框，[不满足]=红色边框',
      '• 预设场景提供 3 种经典案例'
    ]
  }
];

// ── Presets ──
const RAG_PRESETS = [
  {
    name: '安全状态',
    hint: '无环路',
    processes: ['P1', 'P2', 'P3'],
    resources: [{ id: 'R1', total: 2 }],
    edges: [
      { from: 'R1', to: 'P1', type: 'allocation', count: 1 },
      { from: 'R1', to: 'P2', type: 'allocation', count: 1 }
    ]
  },
  {
    name: '死锁示例',
    hint: '2 进程环路',
    processes: ['P1', 'P2'],
    resources: [{ id: 'R1', total: 1 }, { id: 'R2', total: 1 }],
    edges: [
      { from: 'P1', to: 'R1', type: 'request', count: 1 },
      { from: 'R1', to: 'P2', type: 'allocation', count: 1 },
      { from: 'P2', to: 'R2', type: 'request', count: 1 },
      { from: 'R2', to: 'P1', type: 'allocation', count: 1 }
    ]
  },
  {
    name: '三进程循环',
    hint: '3 进程环路',
    processes: ['P1', 'P2', 'P3'],
    resources: [{ id: 'R1', total: 1 }, { id: 'R2', total: 1 }, { id: 'R3', total: 1 }],
    edges: [
      { from: 'P1', to: 'R1', type: 'request', count: 1 },
      { from: 'R1', to: 'P2', type: 'allocation', count: 1 },
      { from: 'P2', to: 'R2', type: 'request', count: 1 },
      { from: 'R2', to: 'P3', type: 'allocation', count: 1 },
      { from: 'P3', to: 'R3', type: 'request', count: 1 },
      { from: 'R3', to: 'P1', type: 'allocation', count: 1 }
    ]
  }
];

const BANKER_PRESETS = [
  {
    name: '安全 (经典)',
    max: [[7, 5, 3], [3, 2, 2], [9, 0, 2]],
    allocation: [[0, 1, 0], [2, 0, 0], [3, 0, 2]],
    available: [3, 3, 2]
  },
  {
    name: '不安全',
    max: [[1, 2], [2, 3], [3, 1]],
    allocation: [[1, 0], [1, 1], [2, 1]],
    available: [0, 1]
  },
  {
    name: '安全 (5进程)',
    max: [[5, 2, 1, 3], [3, 4, 2, 1], [4, 1, 3, 2], [2, 3, 1, 4], [1, 2, 4, 3]],
    allocation: [[2, 1, 0, 1], [1, 2, 1, 0], [2, 0, 1, 1], [1, 1, 0, 2], [0, 1, 2, 1]],
    available: [2, 2, 2, 2]
  }
];

Page({
  data: {
    mode: 'rag',
    helpVisible: false,
    helpContent: HELP_CONTENT,
    // ── RAG ──
    rag: createRag(),
    selectedNode: null,
    edgeType: 'request',
    nodePositions: {},
    visualEdges: [],
    ragResult: null,
    ragError: '',
    deadlockSet: [],
    presets: RAG_PRESETS,
    // ── Banker's ──
    processCount: 3,
    resourceCount: 3,
    bankerMax: [[7,5,3],[3,2,2],[9,0,2]],
    bankerAllocation: [[0,1,0],[2,0,0],[3,0,2]],
    bankerAvailable: [3,3,2],
    bankerNeed: [],
    bankerResult: null,
    bankerPresets: BANKER_PRESETS
  },

  _nodeCounter: { p: 0, r: 0 },

  _checkFirstVisit: function() {
    try {
      const seen = wx.getStorageSync('help_seen_deadlock');
      if (!seen) {
        this.setData({ helpVisible: true });
        const timer = setTimeout(() => {
          this.setData({ helpVisible: false });
          try {
            wx.setStorageSync('help_seen_deadlock', true);
          } catch (e) { /* 静默降级 */ }
          clearTimeout(timer);
        }, 5000);
      }
    } catch (e) {
      // storage 异常静默降级
    }
  },

  onHelpToggle: function(e) {
    this.setData({ helpVisible: e.detail.visible });
  },

  onLoad: function() {
    this._computeNodePositions();
    this._updateVisualEdges();
    this._computeNeed();
    this._checkFirstVisit();
  },

  // ── Tab Switching ──
  switchMode: function(e) {
    this.setData({ mode: e.currentTarget.dataset.mode, ragResult: null, bankerResult: null });
  },

  // ═══════════════ RAG Mode ═══════════════

  onAddProcess: function() {
    if (this.data.rag.processes.length >= 5) {
      wx.showToast({ title: '最多 5 个进程', icon: 'none' });
      return;
    }
    this._nodeCounter.p++;
    const pid = 'P' + this._nodeCounter.p;
    const newRag = addProcess(this.data.rag, pid, pid);
    this.setData({ rag: newRag, ragResult: null, ragError: '' });
    this._computeNodePositions();
    this._updateVisualEdges();
  },

  onAddResource: function() {
    if (this.data.rag.resources.length >= 5) {
      wx.showToast({ title: '最多 5 个资源', icon: 'none' });
      return;
    }
    this._nodeCounter.r++;
    const rid = 'R' + this._nodeCounter.r;
    const newRag = addResource(this.data.rag, rid, rid, 1);
    this.setData({ rag: newRag, ragResult: null, ragError: '' });
    this._computeNodePositions();
    this._updateVisualEdges();
  },

  onSetEdgeType: function() {
    const newType = this.data.edgeType === 'request' ? 'allocation' : 'request';
    this.setData({ edgeType: newType });
  },

  onNodeTap: function(e) {
    const id = e.currentTarget.dataset.id;
    const sel = this.data.selectedNode;

    if (sel === null) {
      // First selection
      this.setData({ selectedNode: id });
    } else if (sel === id) {
      // Deselect
      this.setData({ selectedNode: null });
    } else {
      // Second selection → try to create edge
      this._createEdge(sel, id);
      this.setData({ selectedNode: null });
    }
  },

  _createEdge: function(from, to) {
    try {
      const newRag = addEdge(this.data.rag, from, to, this.data.edgeType, 1);
      this.setData({ rag: newRag, ragResult: null, ragError: '' });
      this._updateVisualEdges();
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  onRemoveNode: function(e) {
    const id = e.currentTarget.dataset.id;
    const newRag = removeNode(this.data.rag, id);
    this.setData({ rag: newRag, selectedNode: null, ragResult: null, ragError: '' });
    this._computeNodePositions();
    this._updateVisualEdges();
  },

  onClearSelection: function() {
    this.setData({ selectedNode: null });
  },

  onDetectDeadlock: function() {
    const errors = getRagErrors(this.data.rag);
    if (errors.length > 0) {
      this.setData({ ragError: errors.join('；'), ragResult: null });
      return;
    }

    const result = detectDeadlock(this.data.rag);
    const deadlockSet = result.hasDeadlock ? result.deadlockedProcesses : [];
    this.setData({ ragResult: result, ragError: '', deadlockSet: deadlockSet });
  },

  onResetRag: function() {
    this._nodeCounter = { p: 0, r: 0 };
    this.setData({ rag: createRag(), selectedNode: null, ragResult: null, ragError: '', deadlockSet: [], nodePositions: {}, visualEdges: [] });
  },

  loadPreset: function(e) {
    const preset = RAG_PRESETS[e.currentTarget.dataset.index];
    this._nodeCounter.p = preset.processes.length;
    this._nodeCounter.r = preset.resources.length;

    let rag = createRag();
    preset.processes.forEach(function(pid) { rag = addProcess(rag, pid, pid); });
    preset.resources.forEach(function(r) { rag = addResource(rag, r.id, r.id, r.total); });
    preset.edges.forEach(function(ed) { rag = addEdge(rag, ed.from, ed.to, ed.type, ed.count); });

    this.setData({ rag: rag, selectedNode: null, ragResult: null, ragError: '', deadlockSet: [] });
    this._computeNodePositions();
    this._updateVisualEdges();
  },

  onNodeTouchStart: function(e) {
    const id = e.currentTarget.dataset.id;
    this._dragTarget = id;
    const touch = e.touches[0];
    if (touch) {
      this._dragStartX = touch.clientX;
      this._dragStartY = touch.clientY;
      const pos = this.data.nodePositions[id];
      this._dragOrigX = pos ? pos.x : 0;
      this._dragOrigY = pos ? pos.y : 0;
    }
  },

  onNodeTouchMove: function(e) {
    if (!this._dragTarget) return;
    const touch = e.touches[0];
    if (!touch) return;

    const id = this._dragTarget;
    const dx = touch.clientX - this._dragStartX;
    const dy = touch.clientY - this._dragStartY;

    // Convert px to rpx (roughly 2x)
    const newX = Math.max(10, Math.min(600, this._dragOrigX + dx * 2));
    const newY = Math.max(10, Math.min(500, this._dragOrigY + dy * 2));

    const positions = JSON.parse(JSON.stringify(this.data.nodePositions));
    positions[id] = { x: newX, y: newY };
    this.setData({ nodePositions: positions });
    this._updateVisualEdges();
  },

  onNodeTouchEnd: function() {
    this._dragTarget = null;
  },

  _computeNodePositions: function() {
    const rag = this.data.rag;
    const positions = {};
    const canvasWidth = 650; // approximate canvas width in rpx
    const padding = 80;

    // Layout: processes on left, resources on right
    const pCount = rag.processes.length;
    const rCount = rag.resources.length;
    const pGap = Math.min(120, pCount > 1 ? (400 - padding * 2) / (pCount + 1) : 200);
    const rGap = Math.min(120, rCount > 1 ? (400 - padding * 2) / (rCount + 1) : 200);

    rag.processes.forEach(function(p, i) {
      positions[p.id] = {
        x: padding,
        y: padding + (i + 1) * pGap
      };
    });

    rag.resources.forEach(function(r, i) {
      positions[r.id] = {
        x: canvasWidth - padding - 100,
        y: padding + (i + 1) * rGap
      };
    });

    this.setData({ nodePositions: positions });
  },

  _updateVisualEdges: function() {
    const edges = [];
    const pos = this.data.nodePositions;
    const rag = this.data.rag;

    rag.edges.forEach(function(e) {
      const fromPos = pos[e.from];
      const toPos = pos[e.to];
      if (!fromPos || !toPos) return;

      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      edges.push({
        x1: fromPos.x + 40,
        y1: fromPos.y + 40,
        length: length - 80,
        angle: angle,
        type: e.type
      });
    });

    this.setData({ visualEdges: edges });
  },

  // ═══════════════ Banker's Mode ═══════════════

  adjustProcessCount: function(e) {
    const delta = parseInt(e.currentTarget.dataset.delta);
    const newCount = this.data.processCount + delta;
    if (newCount < 1 || newCount > 10) return;

    const max = this._resizeMatrix(this.data.bankerMax, newCount, this.data.resourceCount, 0);
    const alloc = this._resizeMatrix(this.data.bankerAllocation, newCount, this.data.resourceCount, 0);

    this.setData({
      processCount: newCount,
      bankerMax: max,
      bankerAllocation: alloc,
      bankerResult: null
    });
    this._computeNeed();
  },

  adjustResourceCount: function(e) {
    const delta = parseInt(e.currentTarget.dataset.delta);
    const newCount = this.data.resourceCount + delta;
    if (newCount < 1 || newCount > 6) return;

    const max = this._resizeMatrix(this.data.bankerMax, this.data.processCount, newCount, 0);
    const alloc = this._resizeMatrix(this.data.bankerAllocation, this.data.processCount, newCount, 0);
    const avail = this._resizeArray(this.data.bankerAvailable, newCount, 0);

    this.setData({
      resourceCount: newCount,
      bankerMax: max,
      bankerAllocation: alloc,
      bankerAvailable: avail,
      bankerResult: null
    });
    this._computeNeed();
  },

  _resizeMatrix: function(mat, newRows, newCols, fill) {
    const result = [];
    for (let i = 0; i < newRows; i++) {
      const row = [];
      for (let j = 0; j < newCols; j++) {
        row.push((i < mat.length && j < mat[i].length) ? mat[i][j] : fill);
      }
      result.push(row);
    }
    return result;
  },

  _resizeArray: function(arr, newLen, fill) {
    const result = [];
    for (let i = 0; i < newLen; i++) {
      result.push(i < arr.length ? arr[i] : fill);
    }
    return result;
  },

  onBankerInput: function(e) {
    const matrix = e.currentTarget.dataset.matrix;
    const row = parseInt(e.currentTarget.dataset.row);
    const col = parseInt(e.currentTarget.dataset.col);
    const val = parseInt(e.detail.value) || 0;

    const key = matrix === 'max' ? 'bankerMax' : 'bankerAllocation';
    const data = JSON.parse(JSON.stringify(this.data[key]));
    data[row][col] = val;
    this.setData({ [key]: data, bankerResult: null });
    this._computeNeed();
  },

  onBankerAvailableInput: function(e) {
    const col = parseInt(e.currentTarget.dataset.col);
    const val = parseInt(e.detail.value) || 0;

    const data = this.data.bankerAvailable.slice();
    data[col] = val;
    this.setData({ bankerAvailable: data, bankerResult: null });
  },

  _computeNeed: function() {
    try {
      const need = calculateNeed(this.data.bankerMax, this.data.bankerAllocation);
      this.setData({ bankerNeed: need });
    } catch (err) {
      this.setData({ bankerNeed: [], bankerResult: null });
    }
  },

  onRunBankers: function() {
    try {
      const result = isSafeState(
        this.data.bankerMax,
        this.data.bankerAllocation,
        this.data.bankerAvailable
      );
      this.setData({ bankerResult: result });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  onResetBankers: function() {
    const defaultMax = [[7,5,3],[3,2,2],[9,0,2]];
    const defaultAlloc = [[0,1,0],[2,0,0],[3,0,2]];
    const defaultAvail = [3,3,2];
    this.setData({
      processCount: 3,
      resourceCount: 3,
      bankerMax: defaultMax,
      bankerAllocation: defaultAlloc,
      bankerAvailable: defaultAvail,
      bankerResult: null
    });
    this._computeNeed();
  },

  loadBankerPreset: function(e) {
    const preset = BANKER_PRESETS[e.currentTarget.dataset.index];
    this.setData({
      processCount: preset.max.length,
      resourceCount: preset.max[0].length,
      bankerMax: JSON.parse(JSON.stringify(preset.max)),
      bankerAllocation: JSON.parse(JSON.stringify(preset.allocation)),
      bankerAvailable: preset.available.slice(),
      bankerResult: null
    });
    this._computeNeed();
  }
});
