var bst = require('../../utils/bst');
var hashTable = require('../../utils/hash-table');
var graph = require('../../utils/graph');

var NODE_R = 20;
var CANVAS_W = 600;
var CANVAS_H = 500;
var PAD = 50;

Page({
  data: {
    modes: [
      { key: 'bst', name: 'BST 树' },
      { key: 'stack-queue', name: '栈&队列' },
      { key: 'hash', name: '哈希表' },
      { key: 'graph', name: '图搜索' }
    ],
    currentMode: 'bst',

    // BST
    bstRoot: null,
    bstNodes: [],
    bstEdges: [],
    bstInput: '',

    // Stack & Queue
    sqType: 'stack',
    sqElements: [],
    sqInput: '',

    // Hash Table
    hashTable: null,
    hashBuckets: [],
    hashInput: '',
    hashTableSize: 7,

    // Graph
    graphData: null,
    graphNodes: [],
    graphEdges: [],
    graphType: 'simple',

    // Drag
    dragX: 0,
    dragY: 0,

    // Control
    ready: false,
    playing: false,
    paused: false,
    steps: [],
    stepIndex: -1,
    totalSteps: 0,
    stepDesc: '',
    speed: 5
  },

  _canvasReady: false,
  _ctx: null,

  onLoad: function() {
    var self = this;
    this._ctx = wx.createCanvasContext('vizCanvas', this);
    setTimeout(function() { self._canvasReady = true; }, 200);
  },

  /* ========== Mode Switching ========== */

  onModeChange: function(e) {
    if (this.data.playing) return;
    var mode = e.currentTarget.dataset.mode;
    this._stopTimer();
    this.setData({ currentMode: mode, ready: false, playing: false, paused: false, steps: [], stepIndex: -1, stepDesc: '', dragX: 0, dragY: 0 });
    if (mode === 'hash' && !this.data.hashTable) {
      this.setData({ hashTable: hashTable.createHashTable(this.data.hashTableSize) });
    }
    if (mode === 'graph' && !this.data.graphData) {
      this._initGraph();
    }
  },


  /* ========== Canvas Drag ========== */

  onCanvasTouchStart: function(e) {
    var t = e.touches[0];
    this._dragStartX = t.clientX;
    this._dragStartY = t.clientY;
    this._dragOriginX = this.data.dragX;
    this._dragOriginY = this.data.dragY;
    this._isDragging = false;
  },

  onCanvasTouchMove: function(e) {
    var t = e.touches[0];
    var dx = t.clientX - this._dragStartX;
    var dy = t.clientY - this._dragStartY;
    if (!this._isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      this._isDragging = true;
    }
    if (this._isDragging) {
      this.setData({
        dragX: this._dragOriginX + dx * 2,
        dragY: this._dragOriginY + dy * 2
      });
      this._drawCanvas();
    }
  },

  onCanvasTouchEnd: function() {
    this._isDragging = false;
  },

  /* ========== Canvas Drawing ========== */

  _drawCanvas: function() {
    if (!this._canvasReady || !this._ctx) return;
    var ctx = this._ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (this.data.currentMode === 'bst') {
      this._drawTree(ctx);
    } else if (this.data.currentMode === 'graph') {
      this._drawGraphOnCanvas(ctx);
    }

    ctx.draw();
  },

  _computeScale: function(nodes) {
    if (nodes.length === 0) return { scale: 1, ox: 0, oy: 0 };
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].x < minX) minX = nodes[i].x;
      if (nodes[i].x > maxX) maxX = nodes[i].x;
      if (nodes[i].y < minY) minY = nodes[i].y;
      if (nodes[i].y > maxY) maxY = nodes[i].y;
    }
    var treeW = maxX - minX + 80;
    var treeH = maxY - minY + 80;
    var scale = Math.min((CANVAS_W - 2 * PAD) / treeW, (CANVAS_H - 2 * PAD) / treeH);
    var ox = PAD + ((CANVAS_W - 2 * PAD) - treeW * scale) / 2 - minX * scale;
    var oy = PAD + ((CANVAS_H - 2 * PAD) - treeH * scale) / 2 - minY * scale;
    return { scale: scale, ox: ox, oy: oy };
  },

  /* ========== BST Visualization ========== */

  _syncBstRender: function(root) {
    if (!root) {
      this.setData({ bstNodes: [], bstEdges: [], ready: false });
      this._drawCanvas();
      return;
    }
    var layout = bst.layoutTree(root);
    this.setData({
      bstNodes: layout.nodes,
      bstEdges: layout.edges,
      ready: layout.nodes.length > 0
    });
    this._drawCanvas();
  },

  _drawTree: function(ctx) {
    var nodes = this.data.bstNodes;
    var edges = this.data.bstEdges;
    if (nodes.length === 0) return;

    var t = this._computeScale(nodes);
    var s = t.scale, ox = t.ox + (this.data.dragX || 0), oy = t.oy + (this.data.dragY || 0);

    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      ctx.beginPath();
      ctx.moveTo(e.x1 * s + ox, e.y1 * s + oy);
      ctx.lineTo(e.x2 * s + ox, e.y2 * s + oy);
      ctx.setStrokeStyle(e.state === 'highlight' ? '#cc785c' : '#8a8580');
      ctx.setLineWidth(e.state === 'highlight' ? 3 : 2);
      ctx.stroke();
    }

    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j];
      var cx = n.x * s + ox;
      var cy = n.y * s + oy;
      var st = n.state || 'normal';

      ctx.beginPath();
      ctx.arc(cx, cy, NODE_R, 0, 2 * Math.PI);
      if (st === 'comparing') {
        ctx.setFillStyle('#5db8a6');
      } else if (st === 'inserting') {
        ctx.setFillStyle('#cc785c');
      } else if (st === 'deleting') {
        ctx.setFillStyle('#c64545');
      } else if (st === 'visited') {
        ctx.setFillStyle('#7bb8d4');
      } else if (st === 'found') {
        ctx.setFillStyle('#5db872');
      } else {
        ctx.setFillStyle('#efe9de');
      }
      ctx.fill();
      ctx.setStrokeStyle(st === 'normal' ? '#8a8580' : 'transparent');
      ctx.setLineWidth(2);
      ctx.stroke();

      ctx.setFillStyle(st === 'normal' ? '#141413' : '#ffffff');
      ctx.setFontSize(14);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText(String(n.value), cx, cy);
    }
  },

  _highlightPath: function(path, state) {
    var nodes = this.data.bstNodes.slice();
    var edges = this.data.bstEdges.slice();
    for (var i = 0; i < nodes.length; i++) {
      if (path.indexOf(nodes[i].value) !== -1) {
        nodes[i].state = state;
      } else if (nodes[i].state !== 'visited') {
        nodes[i].state = 'normal';
      }
    }
    for (var j = 0; j < edges.length; j++) {
      var e = edges[j];
      var n1 = null, n2 = null;
      for (var k = 0; k < nodes.length; k++) {
        if (Math.abs(nodes[k].x - e.x1) < 1 && Math.abs(nodes[k].y - e.y1) < 1) n1 = nodes[k];
        if (Math.abs(nodes[k].x - e.x2) < 1 && Math.abs(nodes[k].y - e.y2) < 1) n2 = nodes[k];
      }
      if (n1 && n2 && path.indexOf(n1.value) !== -1 && path.indexOf(n2.value) !== -1) {
        edges[j].state = 'highlight';
      } else {
        edges[j].state = 'normal';
      }
    }
    this.setData({ bstNodes: nodes, bstEdges: edges });
    this._drawCanvas();
  },

  _resetHighlights: function() {
    var nodes = this.data.bstNodes.slice();
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].state !== 'visited') nodes[i].state = 'normal';
    }
    var edges = this.data.bstEdges.slice();
    for (var j = 0; j < edges.length; j++) edges[j].state = 'normal';
    this.setData({ bstNodes: nodes, bstEdges: edges });
  },

  _applyBstStep: function(step) {
    if (step.type === 'compare' || step.type === 'found' || step.type === 'not-found') {
      this._highlightPath(step.path || [], 'comparing');
    } else if (step.type === 'insert') {
      if (step.treeSnapshot) {
        this._syncBstRender(step.treeSnapshot);
      }
      this._highlightPath(step.path || [], 'inserting');
    } else if (step.type === 'delete' || step.type === 'replace') {
      this._highlightPath(step.path || [], 'deleting');
    } else if (step.type === 'visit') {
      this._highlightPath(step.path || [], 'visited');
    } else if (step.type === 'done') {
      var nodes = this.data.bstNodes.slice();
      for (var i = 0; i < nodes.length; i++) nodes[i].state = 'normal';
      var edges = this.data.bstEdges.slice();
      for (var j = 0; j < edges.length; j++) edges[j].state = 'normal';
      this.setData({ bstNodes: nodes, bstEdges: edges });
      this._drawCanvas();
    }
  },

  onBstInput: function(e) { this.setData({ bstInput: e.detail.value }); },

  onBstInsert: function() {
    var num = parseInt(this.data.bstInput, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      wx.showToast({ title: '请输入 1-99 的数字', icon: 'none' });
      return;
    }
    this._stopTimer();
    var result = bst.insertNode(this.data.bstRoot, num);
    this.setData({ bstRoot: result.root, bstInput: '' });
    this._syncBstRender(result.root);
    this.setData({ steps: result.steps, totalSteps: result.steps.length, stepIndex: -1, stepDesc: '插入 ' + num + '，点击 ▶ 播放', playing: false, paused: false });
  },

  onBstSearch: function() {
    var num = parseInt(this.data.bstInput, 10);
    if (isNaN(num)) { wx.showToast({ title: '请输入数字', icon: 'none' }); return; }
    if (!this.data.bstRoot) { wx.showToast({ title: '树为空', icon: 'none' }); return; }
    this._stopTimer();
    var steps = bst.searchNode(this.data.bstRoot, num);
    this._resetHighlights();
    this.setData({ steps: steps, totalSteps: steps.length, stepIndex: -1, stepDesc: '查找 ' + num + '，点击 ▶ 播放', playing: false, paused: false });
  },

  onBstDelete: function() {
    var num = parseInt(this.data.bstInput, 10);
    if (isNaN(num)) { wx.showToast({ title: '请输入数字', icon: 'none' }); return; }
    if (!this.data.bstRoot) { wx.showToast({ title: '树为空', icon: 'none' }); return; }
    this._stopTimer();
    var result = bst.deleteNode(this.data.bstRoot, num);
    this.setData({ bstRoot: result.root, bstInput: '' });
    this._syncBstRender(result.root);
    this.setData({ steps: result.steps, totalSteps: result.steps.length, stepIndex: -1, stepDesc: '删除 ' + num + '，点击 ▶ 播放', playing: false, paused: false });
  },

  onBstTraverse: function(e) {
    if (!this.data.bstRoot) { wx.showToast({ title: '树为空', icon: 'none' }); return; }
    this._stopTimer();
    var order = e.currentTarget.dataset.order;
    var steps = bst.traverseTree(this.data.bstRoot, order);
    this._resetHighlights();
    var names = { pre: '前序', in: '中序', post: '后序', level: '层序' };
    this.setData({ steps: steps, totalSteps: steps.length, stepIndex: -1, stepDesc: names[order] + '遍历，点击 ▶ 播放', playing: false, paused: false });
  },


  _bstRandomNum: function() {
    var existing = {};
    (function collect(n) {
      if (!n) return;
      existing[n.value] = true;
      collect(n.left);
      collect(n.right);
    })(this.data.bstRoot);
    var tries = 0, num;
    do {
      num = Math.floor(Math.random() * 99) + 1;
      tries++;
    } while (existing[num] && tries < 100);
    return num;
  },

  onBstRandom: function() {
    var num = this._bstRandomNum();
    this.setData({ bstInput: String(num) });
    this.onBstInsert();
  },

  onBstRandomBatch: function() {
    var count = 5;
    var inserted = [];
    for (var i = 0; i < count; i++) {
      var num = this._bstRandomNum();
      var result = bst.insertNode(this.data.bstRoot, num);
      this.setData({ bstRoot: result.root });
      inserted.push(num);
    }
    this._syncBstRender(this.data.bstRoot);
    this._stopTimer();
    this.setData({
      bstInput: '',
      steps: [],
      totalSteps: 0,
      stepIndex: -1,
      stepDesc: '批量插入 ' + inserted.join(', ') + '，共 ' + inserted.length + ' 个',
      playing: false,
      paused: false,
      ready: true
    });
  },


  onSqRandom: function() {
    var num = Math.floor(Math.random() * 99) + 1;
    this.setData({ sqInput: String(num) });
    if (this.data.sqType === 'stack') {
      this.onSqPush();
    } else {
      this.onSqEnqueue();
    }
  },

  onSqRandomBatch: function() {
    var count = 5;
    var elems = this.data.sqElements.slice();
    var inserted = [];
    for (var i = 0; i < count; i++) {
      var num = Math.floor(Math.random() * 99) + 1;
      elems.push({ value: num, state: 'normal' });
      inserted.push(num);
    }
    this._stopTimer();
    var label = this.data.sqType === 'stack' ? 'Push' : 'Enqueue';
    this.setData({
      sqElements: elems,
      sqInput: '',
      steps: [],
      totalSteps: 0,
      stepIndex: -1,
      stepDesc: label + ' ' + inserted.join(', ') + '，共 ' + inserted.length + ' 个',
      ready: true,
      playing: false,
      paused: false
    });
  },

  /* ========== Stack & Queue ========== */

  onSqTypeChange: function(e) {
    if (this.data.playing) return;
    this._stopTimer();
    this.setData({ sqType: e.currentTarget.dataset.type, sqElements: [], steps: [], stepIndex: -1, stepDesc: '', ready: false, playing: false, paused: false });
  },

  onSqInput: function(e) { this.setData({ sqInput: e.detail.value }); },

  onSqPush: function() {
    var num = parseInt(this.data.sqInput, 10);
    if (isNaN(num) || num < 1 || num > 99) { wx.showToast({ title: '请输入 1-99', icon: 'none' }); return; }
    this._stopTimer();
    var elems = this.data.sqElements.slice();
    var steps = [];
    elems.push({ value: num, state: 'normal' });
    steps.push({ type: 'push', value: num, elements: JSON.parse(JSON.stringify(elems)), description: 'Push ' + num + ' 到栈顶' });
    steps.push({ type: 'done', description: '操作完成' });
    elems[elems.length - 1].state = 'highlight';
    this.setData({ sqElements: elems, sqInput: '', steps: steps, totalSteps: steps.length, stepIndex: -1, stepDesc: 'Push ' + num + '，点击 ▶ 播放', ready: true, playing: false, paused: false });
  },

  onSqPop: function() {
    if (this.data.sqElements.length === 0) { wx.showToast({ title: '栈为空', icon: 'none' }); return; }
    this._stopTimer();
    var elems = this.data.sqElements.slice();
    var steps = [];
    var val = elems[elems.length - 1].value;
    elems[elems.length - 1].state = 'removing';
    steps.push({ type: 'pop', value: val, elements: JSON.parse(JSON.stringify(elems)), description: 'Pop ' + val + ' 从栈顶' });
    elems.pop();
    steps.push({ type: 'done', elements: JSON.parse(JSON.stringify(elems)), description: '操作完成' });
    this.setData({ sqElements: elems, steps: steps, totalSteps: steps.length, stepIndex: -1, stepDesc: 'Pop ' + val + '，点击 ▶ 播放', ready: elems.length > 0, playing: false, paused: false });
  },

  onSqEnqueue: function() {
    var num = parseInt(this.data.sqInput, 10);
    if (isNaN(num) || num < 1 || num > 99) { wx.showToast({ title: '请输入 1-99', icon: 'none' }); return; }
    this._stopTimer();
    var elems = this.data.sqElements.slice();
    var steps = [];
    elems.push({ value: num, state: 'normal' });
    steps.push({ type: 'enqueue', value: num, elements: JSON.parse(JSON.stringify(elems)), description: 'Enqueue ' + num + ' 到队尾' });
    steps.push({ type: 'done', description: '操作完成' });
    elems[elems.length - 1].state = 'highlight';
    this.setData({ sqElements: elems, sqInput: '', steps: steps, totalSteps: steps.length, stepIndex: -1, stepDesc: 'Enqueue ' + num + '，点击 ▶ 播放', ready: true, playing: false, paused: false });
  },

  onSqDequeue: function() {
    if (this.data.sqElements.length === 0) { wx.showToast({ title: '队列为空', icon: 'none' }); return; }
    this._stopTimer();
    var elems = this.data.sqElements.slice();
    var steps = [];
    var val = elems[0].value;
    elems[0].state = 'removing';
    steps.push({ type: 'dequeue', value: val, elements: JSON.parse(JSON.stringify(elems)), description: 'Dequeue ' + val + ' 从队首' });
    elems.shift();
    steps.push({ type: 'done', elements: JSON.parse(JSON.stringify(elems)), description: '操作完成' });
    this.setData({ sqElements: elems, steps: steps, totalSteps: steps.length, stepIndex: -1, stepDesc: 'Dequeue ' + val + '，点击 ▶ 播放', ready: elems.length > 0, playing: false, paused: false });
  },


  _hashRandomKey: function() {
    var chars = 'abcdefghijklmnopqrstuvwxyz';
    var len = Math.floor(Math.random() * 4) + 3;
    var key = '';
    for (var i = 0; i < len; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
  },

  onHashRandom: function() {
    var key = this._hashRandomKey();
    this.setData({ hashInput: key });
    this.onHashInsert();
  },

  onHashRandomBatch: function() {
    var count = 5;
    var table = this.data.hashTable || hashTable.createHashTable(this.data.hashTableSize);
    var inserted = [];
    for (var i = 0; i < count; i++) {
      var key = this._hashRandomKey();
      var result = hashTable.htInsert(table, key, key);
      table = result.table;
      inserted.push(key);
    }
    this._stopTimer();
    this.setData({
      hashTable: table,
      hashBuckets: table.buckets,
      hashInput: '',
      steps: [],
      totalSteps: 0,
      stepIndex: -1,
      stepDesc: '批量插入 ' + inserted.join(', ') + '，共 ' + inserted.length + ' 个',
      ready: true,
      playing: false,
      paused: false
    });
  },

  /* ========== Hash Table ========== */

  onHashInput: function(e) { this.setData({ hashInput: e.detail.value }); },

  onHashInsert: function() {
    var key = this.data.hashInput.trim();
    if (!key) { wx.showToast({ title: '请输入 key', icon: 'none' }); return; }
    this._stopTimer();
    var table = this.data.hashTable || hashTable.createHashTable(this.data.hashTableSize);
    var result = hashTable.htInsert(table, key, key);
    this.setData({ hashTable: result.table, hashBuckets: result.table.buckets, hashInput: '', steps: result.steps, totalSteps: result.steps.length, stepIndex: -1, stepDesc: '插入 "' + key + '"，点击 ▶ 播放', ready: true, playing: false, paused: false });
  },

  onHashSearch: function() {
    var key = this.data.hashInput.trim();
    if (!key) { wx.showToast({ title: '请输入 key', icon: 'none' }); return; }
    var table = this.data.hashTable;
    if (!table || table.count === 0) { wx.showToast({ title: '表为空', icon: 'none' }); return; }
    this._stopTimer();
    var result = hashTable.htSearch(table, key);
    this.setData({ hashInput: '', steps: result.steps, totalSteps: result.steps.length, stepIndex: -1, stepDesc: '查找 "' + key + '"，点击 ▶ 播放', playing: false, paused: false });
  },

  _applyHashStep: function(step) {
    if (step.tableSnapshot) {
      this.setData({ hashBuckets: step.tableSnapshot.buckets });
    }
  },

  /* ========== Graph ========== */

  _initGraph: function(type) {
    var t = type || this.data.graphType;
    var g = graph.createSampleGraph(t);
    this.setData({ graphData: g, graphType: t, graphNodes: g.nodes, graphEdges: g.edges, ready: true });
    this._drawCanvas();
  },

  onGraphTypeChange: function(e) {
    if (this.data.playing) return;
    this._stopTimer();
    this._initGraph(e.currentTarget.dataset.type);
    this.setData({ steps: [], stepIndex: -1, stepDesc: '', playing: false, paused: false });
  },

  onGraphBfs: function() {
    if (!this.data.graphData) return;
    this._stopTimer();
    var steps = graph.bfs(this.data.graphData, this.data.graphData.nodes[0].id);
    this.setData({ steps: steps, totalSteps: steps.length, stepIndex: -1, stepDesc: 'BFS 从 ' + this.data.graphData.nodes[0].id + ' 开始，点击 ▶ 播放', playing: false, paused: false });
  },

  onGraphDfs: function() {
    if (!this.data.graphData) return;
    this._stopTimer();
    var steps = graph.dfs(this.data.graphData, this.data.graphData.nodes[0].id);
    this.setData({ steps: steps, totalSteps: steps.length, stepIndex: -1, stepDesc: 'DFS 从 ' + this.data.graphData.nodes[0].id + ' 开始，点击 ▶ 播放', playing: false, paused: false });
  },

  _drawGraphOnCanvas: function(ctx) {
    var nodes = this.data.graphNodes;
    var edges = this.data.graphEdges;
    if (nodes.length === 0) return;

    var t = this._computeScale(nodes);
    var s = t.scale, ox = t.ox + (this.data.dragX || 0), oy = t.oy + (this.data.dragY || 0);

    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var n1 = null, n2 = null;
      for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].id === e.from) n1 = nodes[j];
        if (nodes[j].id === e.to) n2 = nodes[j];
      }
      if (n1 && n2) {
        ctx.beginPath();
        ctx.moveTo(n1.x * s + ox, n1.y * s + oy);
        ctx.lineTo(n2.x * s + ox, n2.y * s + oy);
        ctx.setStrokeStyle(e.state === 'visited' ? '#7bb8d4' : '#8a8580');
        ctx.setLineWidth(e.state === 'visited' ? 3 : 2);
        ctx.stroke();
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var cx = n.x * s + ox;
      var cy = n.y * s + oy;
      var st = n.state || 'normal';

      ctx.beginPath();
      ctx.arc(cx, cy, NODE_R, 0, 2 * Math.PI);
      if (st === 'current') {
        ctx.setFillStyle('#cc785c');
      } else if (st === 'visited') {
        ctx.setFillStyle('#7bb8d4');
      } else {
        ctx.setFillStyle('#efe9de');
      }
      ctx.fill();
      ctx.setStrokeStyle(st === 'normal' ? '#8a8580' : 'transparent');
      ctx.setLineWidth(2);
      ctx.stroke();

      ctx.setFillStyle(st === 'normal' ? '#141413' : '#ffffff');
      ctx.setFontSize(14);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText(n.id, cx, cy);

      if (n.visitOrder > 0) {
        ctx.setFillStyle('#cc785c');
        ctx.setFontSize(10);
        ctx.fillText(String(n.visitOrder), cx, cy - NODE_R - 8);
      }
    }
  },

  _applyGraphStep: function(step) {
    if (step.graphSnapshot) {
      var snap = step.graphSnapshot;
      var nodes = snap.nodes;
      var t = this._computeScale(nodes);
      this.setData({ graphNodes: snap.nodes, graphEdges: snap.edges });
      this._drawCanvas();
    }
  },

  /* ========== Common Controls ========== */

  onSpeedChange: function(e) { this.setData({ speed: e.detail.value }); },

  _stopTimer: function() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  },

  onPlay: function() {
    if (!this.data.ready || !this.data.steps || this.data.steps.length === 0) return;
    if (this.data.stepIndex >= this.data.totalSteps - 1) this._resetPlayback();
    this.setData({ playing: true, paused: false });
    this._playNext();
  },

  _playNext: function() {
    if (!this.data.playing || this.data.paused) return;
    var idx = this.data.stepIndex + 1;
    if (idx >= this.data.totalSteps) { this.setData({ playing: false }); return; }
    var step = this.data.steps[idx];
    this.setData({ stepIndex: idx, stepDesc: step.description || step.desc || '' });
    this._applyStep(step);
    if (step.type !== 'done') {
      var delay = Math.max(50, 800 - this.data.speed * 80);
      var self = this;
      this._timer = setTimeout(function() { self._playNext(); }, delay);
    } else {
      this.setData({ playing: false });
    }
  },

  _applyStep: function(step) {
    var mode = this.data.currentMode;
    if (mode === 'bst') this._applyBstStep(step);
    else if (mode === 'stack-queue') this._applySqStep(step);
    else if (mode === 'hash') this._applyHashStep(step);
    else if (mode === 'graph') this._applyGraphStep(step);
  },

  _applySqStep: function(step) {
    if (step.elements) this.setData({ sqElements: step.elements });
  },

  onPause: function() {
    this.setData({ paused: true, playing: false });
    this._stopTimer();
  },

  onStepPrev: function() {
    if (!this.data.steps || this.data.stepIndex < 0) return;
    this.onPause();
    this._replayToIndex(this.data.stepIndex - 1);
  },

  onStepNext: function() {
    if (!this.data.steps) return;
    this.onPause();
    var idx = this.data.stepIndex + 1;
    if (idx >= this.data.totalSteps) return;
    this._replayToIndex(idx);
  },

  _replayToIndex: function(targetIdx) {
    if (targetIdx < 0 || targetIdx >= this.data.totalSteps) return;
    this._resetPlayback();
    for (var i = 0; i <= targetIdx; i++) {
      this.setData({ stepIndex: i, stepDesc: this.data.steps[i].description || this.data.steps[i].desc || '' });
      this._applyStep(this.data.steps[i]);
    }
  },

  _resetPlayback: function() {
    var mode = this.data.currentMode;
    if (mode === 'bst') {
      this._syncBstRender(this.data.bstRoot);
    } else if (mode === 'stack-queue') {
      this.setData({ sqElements: [] });
    } else if (mode === 'hash') {
      this.setData({ hashBuckets: this.data.hashTable ? this.data.hashTable.buckets : [] });
    } else if (mode === 'graph') {
      if (this.data.graphData) {
        this.setData({ graphNodes: this.data.graphData.nodes, graphEdges: this.data.graphData.edges });
        this._drawCanvas();
      }
    }
    this.setData({ stepIndex: -1 });
  },

  onReset: function() {
    this._stopTimer();
    var mode = this.data.currentMode;
    if (mode === 'bst') {
      this.setData({ bstRoot: null, bstNodes: [], bstEdges: [], ready: false });
      this._drawCanvas();
    } else if (mode === 'stack-queue') {
      this.setData({ sqElements: [], ready: false });
    } else if (mode === 'hash') {
      var table = hashTable.createHashTable(this.data.hashTableSize);
      this.setData({ hashTable: table, hashBuckets: table.buckets, ready: false });
    } else if (mode === 'graph') {
      this._initGraph();
    }
    this.setData({ steps: [], stepIndex: -1, totalSteps: 0, stepDesc: '', playing: false, paused: false, dragX: 0, dragY: 0 });
  }
});
