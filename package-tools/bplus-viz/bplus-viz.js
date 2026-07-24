const { BPlusTree } = require('../../utils/bplus-tree');
const { buildLayout, leafCount } = require('../../utils/bplus-node');

Page({
  data: {
    m: 4,
    operation: 'insert',
    keyInput: '',
    loInput: '',
    hiInput: '',
    levels: [],
    edges: [],
    leaves: [],
    canvasWidth: 600,
    canvasHeight: 400,
    nodeCount: 0,
    leafCount: 0,
    errorMessage: '',
    log: [],
    // ℹ︎ 介绍
    toolId: 'bplus-viz',
    showIntro: false
  },

  _tree: null,

  onLoad: function() {
    this._tree = new BPlusTree(4);
    this._refreshRender();
  },

  onMChange: function(e) {
    const newM = Number(e.detail.value);
    if (newM === this.data.m) return;
    this._tree = new BPlusTree(newM);
    this.setData({
      m: newM,
      keyInput: '',
      loInput: '',
      hiInput: '',
      errorMessage: '',
      log: []
    });
    this._refreshRender();
    wx.showToast({ title: '阶数已变，树已重置', icon: 'none' });
  },

  onOpChange: function(e) {
    this.setData({ operation: e.currentTarget.dataset.op, errorMessage: '' });
  },

  onKeyInput: function(e) {
    this.setData({ keyInput: e.detail.value });
  },

  onLoInput: function(e) {
    this.setData({ loInput: e.detail.value });
  },

  onHiInput: function(e) {
    this.setData({ hiInput: e.detail.value });
  },

  onExecute: function() {
    if (this.data.operation === 'insert') {
      const key = parseInt(this.data.keyInput, 10);
      if (isNaN(key)) {
        this.setData({ errorMessage: '请输入数字 key' });
        return;
      }
      this._doInsert(key);
    } else if (this.data.operation === 'search') {
      const key = parseInt(this.data.keyInput, 10);
      if (isNaN(key)) {
        this.setData({ errorMessage: '请输入数字 key' });
        return;
      }
      this._doSearch(key);
    } else if (this.data.operation === 'range') {
      const lo = parseInt(this.data.loInput, 10);
      const hi = parseInt(this.data.hiInput, 10);
      if (isNaN(lo) || isNaN(hi)) {
        this.setData({ errorMessage: '请输入数字 lo / hi' });
        return;
      }
      this._doRange(lo, hi);
    }
  },

  _doInsert: function(key) {
    const result = this._tree.insert(key);
    this._refreshRender();
    this._appendLog('插入 key=' + key + '：' + this._summarizeSteps(result.steps));
    this.setData({ keyInput: '', errorMessage: '' });
  },

  _doSearch: function(key) {
    const result = this._tree.search(key);
    this._refreshRender({ highlightKey: key, highlightType: 'search' });
    const foundText = result.found === null ? '未找到' : '找到 key=' + result.found;
    this._appendLog('查询 key=' + key + '：' + foundText + '。' + this._summarizeSteps(result.steps));
    this.setData({ keyInput: '', errorMessage: '' });
  },

  _doRange: function(lo, hi) {
    const result = this._tree.rangeQuery(lo, hi);
    if (result.error) {
      this.setData({ errorMessage: result.error });
      return;
    }
    this._refreshRender({ rangeQuery: { lo: lo, hi: hi, leaves: result.leaves } });
    this._appendLog('范围查询 [' + lo + ', ' + hi + ']：' +
                    (result.result.length === 0 ? '无匹配' : '结果 ' + JSON.stringify(result.result)));
    this.setData({ loInput: '', hiInput: '', errorMessage: '' });
  },

  onReset: function() {
    this._tree = new BPlusTree(this.data.m);
    this.setData({
      keyInput: '',
      loInput: '',
      hiInput: '',
      errorMessage: '',
      log: []
    });
    this._refreshRender();
  },

  onRandomInsert: function() {
    const key = this._randomKey();
    this.setData({ keyInput: String(key) });
    this._doInsert(key);
  },

  onBatchInsert: function() {
    const inserted = [];
    for (let i = 0; i < 5; i++) {
      const key = this._randomKey();
      this._tree.insert(key);
      inserted.push(key);
    }
    this._refreshRender();
    this._appendLog('批量插入：' + inserted.join(', '));
  },

  _randomKey: function() {
    return Math.floor(Math.random() * 99) + 1;
  },

  _refreshRender: function(opts) {
    opts = opts || {};
    const layout = buildLayout(this._tree.root);
    const levels = layout.levels.map(function(level) {
      return {
        y: level.y,
        nodes: level.nodes.map(function(n) {
          return {
            id: n.id,
            keys: n.keys,
            x: n.x,
            type: n.type,
            state: this._nodeState(n.ref, opts)
          };
        }, this)
      };
    }, this);
    const edges = layout.edges.map(function(e) { return this._computeEdgeStyle(e); }, this);
    const leaves = layout.leaves.map(function(leaf, idx) {
      return {
        id: 'lf' + idx,
        keys: leaf.keys,
        state: this._leafState(leaf, opts)
      };
    }, this);
    const canvasWidth = Math.max(600, layout.width + 100);
    const canvasHeight = Math.max(300, layout.height + 60);
    this.setData({
      levels: levels,
      edges: edges,
      leaves: leaves,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      nodeCount: this._countNodes(this._tree.root),
      leafCount: leafCount(this._tree.root)
    });
  },

  _nodeState: function(node, opts) {
    if (opts.rangeQuery) {
      return opts.rangeQuery.leaves.indexOf(node) >= 0 ? 'range' : '';
    }
    if (opts.highlightKey !== undefined) {
      if (!node.keys) return '';
      return node.keys.indexOf(opts.highlightKey) >= 0 ? 'highlight' : '';
    }
    return '';
  },

  _leafState: function(leaf, opts) {
    if (!opts.rangeQuery) return '';
    const leaves = opts.rangeQuery.leaves;
    if (leaves.length === 0) return '';
    if (leaves.length === 1) return 'start';
    const idx = leaves.indexOf(leaf);
    if (idx === 0) return 'start';
    if (idx === leaves.length - 1) return 'end';
    return 'middle';
  },

  _computeEdgeStyle: function(e) {
    const dx = e.x2 - e.x1;
    const dy = e.y2 - e.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return {
      lenX: Math.abs(dx),
      lenY: 2,
      angle: angle,
      x1: e.x1,
      y1: e.y1
    };
  },

  _countNodes: function(node) {
    if (!node) return 0;
    if (node.type === 'leaf') return 1;
    let count = 1;
    for (let i = 0; i < node.children.length; i++) {
      count += this._countNodes(node.children[i]);
    }
    return count;
  },

  _appendLog: function(text) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' +
               now.getMinutes().toString().padStart(2, '0') + ':' +
               now.getSeconds().toString().padStart(2, '0');
    const log = this.data.log.slice();
    log.unshift({ time: time, text: text });
    if (log.length > 50) log.pop();
    this.setData({ log: log });
  },

  _summarizeSteps: function(steps) {
    const splitCount = steps.filter(function(s) { return s.type === 'split' || s.type === 'rootSplit'; }).length;
    return splitCount > 0 ? '触发 ' + splitCount + ' 次分裂' : '无分裂';
  },

  // ℹ︎ 介绍入口
  showIntro: function() {
    this.setData({ showIntro: true });
  },
  onIntroClose: function() {
    this.setData({ showIntro: false });
  },
  onIntroEnter: function() {
    this.setData({ showIntro: false });
  },
});
