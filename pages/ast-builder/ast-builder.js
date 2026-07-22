const { tokenize, parseExpression, _resetIdCounter } = require('../../utils/ast-parser');
const {
  astDepth, astNodeCount, walkAST,
  evaluateAST, annotateTypes, getSdtRules, applySdtStep
} = require('../../utils/ast-eval');
const { layoutTree, NODE_WIDTH, NODE_HEIGHT } = require('../../utils/ast-draw');

var PRESETS = [
  { label: '简单加法', expr: '3 + 4' },
  { label: '乘法优先', expr: '3 + 4 * 2' },
  { label: '括号优先', expr: '(3 + 4) * 2' },
  { label: '除零测试', expr: '7 / 0' },
  { label: '复杂嵌套', expr: '3 + 4 * (5 - 2)' }
];

var PRESET_LABELS = PRESETS.map(function(p) { return p.label; });

/** Node type to color mapping */
var NODE_COLORS = {
  NUM: '#6b8c3e',
  ID: '#996644',
  PAREN: '#5a7d9a',
  ADD: '#cc785c',
  SUB: '#cc785c',
  MUL: '#cc785c',
  DIV: '#cc785c'
};

function getNodeColor(type) {
  return NODE_COLORS[type] || '#8a8580';
}

Page({
  data: {
    // 输入
    exprInput: '',
    presetLabels: PRESET_LABELS,
    presetIndex: -1,

    // 解析结果
    tokens: [],
    highlightedToken: -1,
    ast: null,
    astData: null,   // flat list for wxml rendering
    evalResult: null,
    errorMessage: '',

    // 步骤
    steps: [],
    currentStep: -1,
    totalSteps: 0,
    parsePhase: 'input', // 'input' | 'tokens' | 'ast' | 'sdt'
    sdtRules: [],

    // 树渲染
    canvasWidth: 700,
    nodePositions: {},
    treeWidth: 0,
    treeHeight: 0,

    // UI 状态
    showAttributes: true,
    showTypes: true,

    // 语法错误
    showError: false,
    errorText: ''
  },

  onLoad: function() {
    var rules = getSdtRules();
    this.setData({
      sdtRules: rules,
      canvasWidth: this._getCanvasWidth()
    });
  },

  _getCanvasWidth: function() {
    try {
      var sysInfo = wx.getSystemInfoSync();
      return sysInfo.windowWidth || 375;
    } catch (e) {
      return 375;
    }
  },

  // ── 输入事件 ──

  onExprInput: function(e) {
    this.setData({
      exprInput: e.detail.value,
      showError: false,
      errorText: ''
    });
  },

  onPresetChange: function(e) {
    var idx = parseInt(e.detail.value, 10);
    if (idx >= 0 && idx < PRESETS.length) {
      this.setData({
        exprInput: PRESETS[idx].expr,
        presetIndex: idx,
        showError: false,
        errorText: ''
      });
    }
  },

  // ── 构建 AST ──

  onBuild: function() {
    var expr = this.data.exprInput.trim();
    if (!expr) {
      this.setData({ showError: true, errorText: '请输入表达式' });
      return;
    }

    _resetIdCounter();

    try {
      var result = parseExpression(expr);
    } catch (e) {
      this.setData({ showError: true, errorText: e.message || '解析错误' });
      return;
    }

    var ast = result.ast;
    var annotatedAst = annotateTypes(ast);
    var evalVal = evaluateAST(ast);
    var layout = layoutTree(annotatedAst, {
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT,
      hGap: 60,
      vGap: 100
    });

    var flatTree = this._flattenTree(annotatedAst, layout.nodePositions);

    this.setData({
      tokens: result.tokens,
      highlightedToken: -1,
      ast: annotatedAst,
      astData: flatTree,
      evalResult: evalVal,
      steps: result.steps,
      currentStep: -1,
      totalSteps: result.steps.length,
      parsePhase: 'tokens',
      errorMessage: '',
      showError: false,
      errorText: '',
      nodePositions: layout.nodePositions,
      treeWidth: layout.width,
      treeHeight: layout.height,
      showAttributes: true,
      showTypes: true
    });
  },

  onReset: function() {
    this.setData({
      tokens: [],
      highlightedToken: -1,
      ast: null,
      astData: null,
      evalResult: null,
      steps: [],
      currentStep: -1,
      totalSteps: 0,
      parsePhase: 'input',
      nodePositions: {},
      treeWidth: 0,
      treeHeight: 0,
      showError: false,
      errorText: '',
      exprInput: ''
    });
  },

  // ── 步进 ──

  onStepForward: function() {
    if (this.data.parsePhase === 'input') {
      this.onBuild();
      if (this.data.errorText) { return; }
      this.setData({ parsePhase: 'tokens' });
      return;
    }

    if (this.data.parsePhase === 'tokens') {
      var nextTok = this.data.highlightedToken + 1;
      if (nextTok < this.data.tokens.length) {
        this.setData({ highlightedToken: nextTok });
        if (nextTok === this.data.tokens.length - 1) {
          this.setData({ parsePhase: 'ast' });
        }
      }
      return;
    }

    if (this.data.parsePhase === 'ast') {
      var nextStep = this.data.currentStep + 1;
      if (nextStep < this.data.totalSteps) {
        this.setData({ currentStep: nextStep, parsePhase: 'ast' });
        if (nextStep === this.data.totalSteps - 1) {
          this.setData({ parsePhase: 'sdt' });
        }
      }
      return;
    }

    if (this.data.parsePhase === 'sdt') {
      if (!this.data.ast) { return; }
      var stepIdx = this.data.currentStep + 1;
      var sdtResult = applySdtStep(this.data.ast, stepIdx);
      if (sdtResult.node) {
        var layout = layoutTree(sdtResult.node, {
          nodeWidth: NODE_WIDTH,
          nodeHeight: NODE_HEIGHT,
          hGap: 60,
          vGap: 100
        });
        var flatTree = this._flattenTree(sdtResult.node, layout.nodePositions);
        this.setData({
          ast: sdtResult.node,
          astData: flatTree,
          currentStep: stepIdx,
          nodePositions: layout.nodePositions,
          treeWidth: layout.width,
          treeHeight: layout.height,
          evalResult: evaluateAST(sdtResult.node)
        });
      }
      return;
    }
  },

  onStepBackward: function() {
    if (this.data.parsePhase === 'input') { return; }

    if (this.data.parsePhase === 'tokens') {
      var prevTok = this.data.highlightedToken - 1;
      if (prevTok < 0) {
        this.setData({ parsePhase: 'input', highlightedToken: -1 });
      } else {
        this.setData({ highlightedToken: prevTok });
      }
      return;
    }

    if (this.data.parsePhase === 'ast') {
      var prevStep = this.data.currentStep - 1;
      if (prevStep < 0) {
        this.setData({
          parsePhase: 'tokens',
          currentStep: -1,
          highlightedToken: this.data.tokens.length - 1
        });
      } else {
        this.setData({ currentStep: prevStep });
      }
      return;
    }

    if (this.data.parsePhase === 'sdt') {
      var prevSdt = this.data.currentStep - 1;
      if (prevSdt < 0) {
        this.setData({ parsePhase: 'ast', currentStep: this.data.totalSteps - 1 });
      } else {
        this._rebuildToSdtStep(prevSdt);
      }
    }
  },

  _rebuildToSdtStep: function(targetStep) {
    var expr = this.data.exprInput.trim();
    if (!expr) { return; }
    _resetIdCounter();
    try {
      var result = parseExpression(expr);
    } catch (e) { return; }
    var current = result.ast;
    for (var i = 0; i <= targetStep; i++) {
      var stepResult = applySdtStep(current, i);
      if (stepResult.node) { current = stepResult.node; }
    }
    var layout = layoutTree(current, {
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT,
      hGap: 60,
      vGap: 100
    });
    var flatTree = this._flattenTree(current, layout.nodePositions);
    this.setData({
      ast: current,
      astData: flatTree,
      currentStep: targetStep,
      nodePositions: layout.nodePositions,
      treeWidth: layout.width,
      treeHeight: layout.height,
      evalResult: evaluateAST(current)
    });
  },

  // ── 折叠/展开 ──

  onToggleFold: function(e) {
    var nodeIdStr = e.currentTarget.dataset.nodeId;
    if (!nodeIdStr) { return; }
    var nodeId = parseInt(nodeIdStr, 10);
    if (isNaN(nodeId)) { return; }

    var newData = this.data.astData.map(function(n) {
      if (n.id === nodeId) {
        return Object.assign({}, n, { folded: !n.folded });
      }
      return n;
    });

    this.setData({ astData: newData });
  },

  onToggleAttributes: function() {
    this.setData({ showAttributes: !this.data.showAttributes });
  },

  // ── 内部方法 ──

  _flattenTree: function(node, positions) {
    var flat = [];
    function flatten(n, depth) {
      if (!n) { return; }
      var pos = positions[n.id] || { x: 0, y: 0, w: 120, h: 60 };
      flat.push({
        id: n.id,
        type: n.type,
        lexeme: n.lexeme,
        children: n.children,
        depth: depth,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        val: n.attributes ? n.attributes.val : undefined,
        typeAttr: n.attributes ? n.attributes.type : undefined,
        isLeaf: n.children.length === 0,
        folded: false,
        color: getNodeColor(n.type)
      });
      for (var i = 0; i < n.children.length; i++) {
        flatten(n.children[i], depth + 1);
      }
    }
    flatten(node, 0);
    return flat;
  }
});
