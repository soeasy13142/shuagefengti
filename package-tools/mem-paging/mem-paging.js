const { decomposeAddress, queryPageTable, pagingTransform } = require('../../utils/paging');
const { lruReplacement, fifoReplacement } = require('../../utils/page-replacement');

const PAGE_SIZES = [64, 128, 256, 512, 1024, 2048, 4096];
const FRAME_COUNTS = [2, 3, 4, 5, 6, 7, 8];
const MAX_ADDRESSES = 20;

Page({
  data: {
    // 配置
    pageSize: 256,
    frameCount: 4,
    algorithm: 'lru',
    addressInput: '',

    // pageSizes / frameCounts for picker
    pageSizes: PAGE_SIZES.map(s => String(s)),
    frameCounts: FRAME_COUNTS.map(s => String(s)),

    errorMessage: '',

    // 算法结果
    steps: [],
    totalFaults: 0,
    faultRatePct: '0%',
    addressCount: 0,
    currentStep: null,

    // 渲染数据
    pageTableDisplay: [],
    currentLogicalHex: '',
    currentPageNumber: 0,
    currentOffsetHex: '',
    currentStepHit: true,
    currentStepEvicted: null,
    currentPhysicalHex: '',
    addressLabels: [],

    // 控制
    playing: false,

    // 帮助面板
    helpVisible: false,
    memPagingHelp: [
      {
        mode: 'default',
        title: '内存分页操作速查',
        summary: [
          '▸ 调整页大小和帧数来配置内存参数',
          '▸ 输入逻辑地址序列（逗号分隔的十进制数）',
          '▸ 点击「开始模拟」观看地址转换过程'
        ],
        details: [
          '• 逻辑地址分解为：页号(高位) + 页内偏移(低位)',
          '• 页表查询：从页号找到对应的物理帧号',
          '• 缺页中断：目标页不在内存中时触发',
          '• 置换算法：LRU（最近最少使用）或 FIFO（先进先出）',
          '• 缺页率实时计算：缺页次数 / 总访问次数',
          '• 切换「步进模式」可逐条执行地址转换'
        ]
      }
    ]
  },

  _animTimer: null,

  onLoad() {
    this._seedAddresses();
    this._checkFirstVisit();
  },

  onUnload() {
    this._stopAnim();
  },

  _seedAddresses() {
    const count = 4 + Math.floor(Math.random() * 4);
    const addrs = [];
    for (let i = 0; i < count; i++) {
      addrs.push(Math.floor(Math.random() * 0x2000));
    }
    this.setData({
      addressInput: addrs.map(a => '0x' + a.toString(16).toUpperCase().padStart(4, '0')).join(' '),
      errorMessage: ''
    });
  },

  _parseAddresses() {
    const raw = this.data.addressInput;
    const tokens = raw.split(/[\s,，]+/);
    const addrs = [];
    for (const t of tokens) {
      const trimmed = t.trim();
      if (!trimmed) continue;
      const parsed = parseInt(trimmed, 16);
      if (isNaN(parsed)) {
        this.setData({ errorMessage: '无法解析地址: ' + trimmed });
        return null;
      }
      addrs.push(parsed);
    }
    if (addrs.length === 0) {
      this.setData({ errorMessage: '请添加地址' });
      return null;
    }
    if (addrs.some(a => a < 0)) {
      this.setData({ errorMessage: '地址不能为负' });
      return null;
    }
    if (addrs.length > MAX_ADDRESSES) {
      this.setData({ errorMessage: '最多 ' + MAX_ADDRESSES + ' 个地址' });
      return null;
    }
    return addrs;
  },

  _buildPageTableDisplay(snapshot, highlightPage, evictedPage) {
    return snapshot.map(entry => ({
      pageNumber: entry.pageNumber,
      frameDisplay: entry.frameNumber !== null ? String(entry.frameNumber) : '—',
      validDisplay: entry.valid ? '1' : '0',
      accessedDisplay: entry.accessed ? '1' : '0',
      highlight: entry.pageNumber === highlightPage,
      fault: entry.valid && entry.frameNumber === null,
      evicted: entry.pageNumber === evictedPage
    }));
  },

  _buildAddressLabels(steps, currentIdx) {
    return steps.map((s, idx) => ({
      label: '0x' + s.logicalAddress.toString(16).toUpperCase().padStart(4, '0'),
      hit: s.hit,
      index: idx,
      isCurrent: idx === currentIdx
    }));
  },

  _run() {
    const addresses = this._parseAddresses();
    if (!addresses) return;

    const pageSize = this.data.pageSize;
    const frameCount = this.data.frameCount;
    const algorithm = this.data.algorithm;

    // 先验证页大小是 2 的幂
    if (pageSize <= 0 || (pageSize & (pageSize - 1)) !== 0) {
      this.setData({ errorMessage: '页大小必须是 2 的幂' });
      return;
    }

    const result = pagingTransform(
      addresses, pageSize, [],
      algorithm, frameCount,
      lruReplacement, fifoReplacement
    );

    const faultPct = (result.stats.faultRate * 100).toFixed(1);
    const pageTableDisplay = this._buildPageTableDisplay(result.steps[0].pageTableSnapshot, null, null);
    const addressLabels = this._buildAddressLabels(result.steps, null);

    this.setData({
      steps: result.steps,
      totalFaults: result.stats.totalFaults,
      faultRatePct: faultPct + '%',
      addressCount: addresses.length,
      addressLabels,
      pageTableDisplay,
      currentStep: null,
      errorMessage: '',
      currentLogicalHex: '',
      currentPageNumber: 0,
      currentOffsetHex: '',
      currentStepHit: true,
      currentStepEvicted: null,
      currentPhysicalHex: ''
    });
  },

  _updateStepDisplay(stepIdx) {
    const { steps } = this.data;
    if (stepIdx < 0 || stepIdx >= steps.length) return;

    const step = steps[stepIdx];

    // 解析地址分解信息
    const logicalHex = step.logicalAddress.toString(16).toUpperCase().padStart(4, '0');
    const offsetHex = step.offset.toString(16).toUpperCase().padStart(2, '0');
    const physicalHex = step.physicalAddress !== null
      ? step.physicalAddress.toString(16).toUpperCase().padStart(4, '0')
      : '—';

    const pageTableDisplay = this._buildPageTableDisplay(
      step.pageTableSnapshot,
      step.pageNumber,
      step.evictedPage
    );
    const addressLabels = this._buildAddressLabels(steps, stepIdx);

    this.setData({
      currentStep: stepIdx,
      currentLogicalHex: logicalHex,
      currentPageNumber: step.pageNumber,
      currentOffsetHex: offsetHex,
      currentStepHit: step.hit,
      currentStepEvicted: step.evictedPage,
      currentPhysicalHex: physicalHex,
      pageTableDisplay,
      addressLabels
    });
  },

  _stopAnim() {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
  },

  // ── 首次访问帮助面板 ──

  _checkFirstVisit: function() {
    var seen = false;
    try { seen = wx.getStorageSync('help_seen_mem_paging'); } catch(e) {}
    if (!seen) {
      this.setData({ helpVisible: true });
      var self = this;
      setTimeout(function() {
        if (!self.data.helpVisible) return;
        self.setData({ helpVisible: false });
        try { wx.setStorageSync('help_seen_mem_paging', true); } catch(e) {}
      }, 5000);
    }
  },

  onMemHelpToggle: function(e) {
    this.setData({ helpVisible: e.detail.visible });
  },

  // ── Event Handlers ──

  onPageSizeChange(e) {
    const idx = parseInt(e.detail.value, 10);
    this.setData({ pageSize: PAGE_SIZES[idx] });
  },

  onFrameCountChange(e) {
    const idx = parseInt(e.detail.value, 10);
    this.setData({ frameCount: FRAME_COUNTS[idx] });
  },

  onAlgoChange(e) {
    if (this.data.playing) return;
    const algo = e.currentTarget.dataset.algo;
    this.setData({ algorithm: algo });
  },

  onAddressInput(e) {
    this.setData({ addressInput: e.detail.value });
  },

  onRandomGenerate() {
    this._seedAddresses();
  },

  onReset() {
    this._stopAnim();
    this.setData({
      steps: [],
      totalFaults: 0,
      faultRatePct: '0%',
      addressCount: 0,
      currentStep: null,
      pageTableDisplay: [],
      currentLogicalHex: '',
      currentPageNumber: 0,
      currentOffsetHex: '',
      currentStepHit: true,
      currentStepEvicted: null,
      currentPhysicalHex: '',
      addressLabels: [],
      playing: false,
      errorMessage: ''
    });
  },

  onTogglePlay() {
    if (this.data.playing) {
      this._stopAnim();
      this.setData({ playing: false });
      return;
    }

    // If no result yet, compute first
    if (this.data.steps.length === 0) {
      this._run();
    }

    if (this.data.steps.length === 0) return;

    // If already at end, reset to beginning
    if (this.data.currentStep !== null && this.data.currentStep >= this.data.steps.length - 1) {
      this.setData({ currentStep: null });
    }

    this.setData({ playing: true });

    const delayMs = 800;
    this._animTimer = setInterval(() => {
      let current = this.data.currentStep;
      if (current === null) {
        current = -1;
      }
      const nextIdx = current + 1;
      if (nextIdx >= this.data.steps.length) {
        this._stopAnim();
        this.setData({ playing: false });
        return;
      }
      this._updateStepDisplay(nextIdx);
    }, delayMs);
  },

  onStepNext() {
    if (this.data.playing) return;

    // If no result yet, compute first
    if (this.data.steps.length === 0) {
      this._run();
    }

    if (this.data.steps.length === 0) return;

    let current = this.data.currentStep;
    if (current === null) {
      current = -1;
    }
    const nextIdx = current + 1;
    if (nextIdx >= this.data.steps.length) return;
    this._updateStepDisplay(nextIdx);
  },

  onJumpToStep(e) {
    if (this.data.playing) return;
    const idx = parseInt(e.currentTarget.dataset.index, 10);
    if (idx >= 0 && idx < this.data.steps.length) {
      this._updateStepDisplay(idx);
    }
  }
});
