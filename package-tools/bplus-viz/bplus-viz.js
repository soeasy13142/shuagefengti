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
    bplusHelpItems: [
      '在输入框中输入数字，点击「插入」添加节点',
      '点击「查找」可查看从根到目标节点的路径',
      '范围查询：输入起始值到结束值，查看覆盖范围',
      '调大「阶数」(m) 让树更矮胖，调小更瘦高',
      '插入时节点会自动分裂，删除时节点会尝试合并'
    ]
  },

  _tree: null,

  onLoad: function() {
    var bpt = require('../../utils/bplus-tree');
    var bpn = require('../../utils/bplus-node');
    this._BPlusTree = bpt.BPlusTree;
    this._buildLayout = bpn.buildLayout;
    this._leafCount = bpn.leafCount;
    this._tree = new this._BPlusTree(4);
    this._refreshRender();
  },

  onMChange: function(e) {
    var newM = Number(e.detail.value);
    if (newM === this.data.m) return;
    this._tree = new this._BPlusTree(newM);
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
      var key = parseInt(this.data.keyInput, 10);
      if (isNaN(key)) {
        this.setData({ errorMessage: '请输入数字 key' });
        return;
      }
      this._doInsert(key);
    } else if (this.data.operation === 'search') {
      var key = parseInt(this.data.keyInput, 10);
      if (isNaN(key)) {
        this.setData({ errorMessage: '请输入数字 key' });
        return;
      }
      this._doSearch(key);
    } else if (this.data.operation === 'range') {
      var lo = parseInt(this.data.loInput, 10);
      var hi = parseInt(this.data.hiInput, 10);
      if (isNaN(lo) || isNaN(hi)) {
        this.setData({ errorMessage: '请输入数字 lo / hi' });
        return;
      }
      this._doRange(lo, hi);
    }
  },

  _doInsert: function(key) {
    var result = this._tree.insert(key);
    this._refreshRender();
    this._appendLog('插入 key=' + key + '：' + this._summarizeSteps(result.steps));
    this.setData({ keyInput: '', errorMessage: '' });
  },

  _doSearch: function(key) {
    var result = this._tree.search(key);
    this._refreshRender({ highlightKey: key, highlightType: 'search' });
    var foundText = result.found === null ? '未找到' : '找到 key=' + result.found;
    this._appendLog('查询 key=' + key + '：' + foundText + '。' + this._summarizeSteps(result.steps));
    this.setData({ keyInput: '', errorMessage: '' });
  },

  _doRange: function(lo, hi) {
    var result = this._tree.rangeQuery(lo, hi);
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
    this._tree = new this._BPlusTree(this.data.m);
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
    var key = this._randomKey();
    this.setData({ keyInput: String(key) });
    this._doInsert(key);
  },

  onBatchInsert: function() {
    var inserted = [];
    for (var i = 0; i < 5; i++) {
      var key = this._randomKey();
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
    var layout = this._buildLayout(this._tree.root);
    var levels = layout.levels.map(function(level) {
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
    var edges = layout.edges.map(function(e) { return this._computeEdgeStyle(e); }, this);
    var leaves = layout.leaves.map(function(leaf, idx) {
      return {
        id: 'lf' + idx,
        keys: leaf.keys,
        state: this._leafState(leaf, opts)
      };
    }, this);
    var canvasWidth = Math.max(600, layout.width + 100);
    var canvasHeight = Math.max(300, layout.height + 60);
    this.setData({
      levels: levels,
      edges: edges,
      leaves: leaves,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      nodeCount: this._countNodes(this._tree.root),
      leafCount: this._leafCount(this._tree.root)
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
    var leaves = opts.rangeQuery.leaves;
    if (leaves.length === 0) return '';
    if (leaves.length === 1) return 'start';
    var idx = leaves.indexOf(leaf);
    if (idx === 0) return 'start';
    if (idx === leaves.length - 1) return 'end';
    return 'middle';
  },

  _computeEdgeStyle: function(e) {
    var dx = e.x2 - e.x1;
    var dy = e.y2 - e.y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
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
    var count = 1;
    for (var i = 0; i < node.children.length; i++) {
      count += this._countNodes(node.children[i]);
    }
    return count;
  },

  _appendLog: function(text) {
    var now = new Date();
    var time = now.getHours().toString().padStart(2, '0') + ':' +
               now.getMinutes().toString().padStart(2, '0') + ':' +
               now.getSeconds().toString().padStart(2, '0');
    var log = this.data.log.slice();
    log.unshift({ time: time, text: text });
    if (log.length > 50) log.pop();
    this.setData({ log: log });
  },

  _summarizeSteps: function(steps) {
    var splitCount = steps.filter(function(s) { return s.type === 'split' || s.type === 'rootSplit'; }).length;
    return splitCount > 0 ? '触发 ' + splitCount + ' 次分裂' : '无分裂';
  }
});
