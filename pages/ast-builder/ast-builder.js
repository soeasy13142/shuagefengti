const { tokenize, parseExpression, _resetIdCounter } = require('../../utils/ast-parser');
const {
  astDepth, astNodeCount, walkAST,
  evaluateAST, annotateTypes, getSdtRules, applySdtStep
} = require('../../utils/ast-eval');
const { layoutTree, NODE_WIDTH, NODE_HEIGHT } = require('../../utils/ast-draw');

const PRESETS = [
  { label: '简单加法', expr: '3 + 4' },
  { label: '乘法优先', expr: '3 + 4 * 2' },
  { label: '括号优先', expr: '(3 + 4) * 2' },
  { label: '除零测试', expr: '7 / 0' },
  { label: '复杂嵌套', expr: '3 + 4 * (5 - 2)' }
];

const PRESET_LABELS = PRESETS.map(function(p) { return p.label; });

/** Node type to color mapping */
const NODE_COLORS = {
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
    isEvalError: false,
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
    const rules = getSdtRules();
    this.setData({
      sdtRules: rules,
      canvasWidth: this._getCanvasWidth()
    });
  },

  _getCanvasWidth: function() {
    try {
      const sysInfo = wx.getSystemInfoSync();
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
    const idx = parseInt(e.detail.value, 10);
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
    const expr = this.data.exprInput.trim();
    if (!expr) {
      this.setData({ showError: true, errorText: '请输入表达式' });
      return;
    }

    _resetIdCounter();

    try {
      const result = parseExpression(expr);
    } catch (e) {
      this.setData({ showError: true, errorText: e.message || '解析错误' });
      return;
    }

    const ast = result.ast;
    const annotatedAst = annotateTypes(ast);
    const evalVal = evaluateAST(ast);
    let layout = layoutTree(annotatedAst, {
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT,
      hGap: 60,
      vGap: 100
    });

    let flatTree = this._flattenTree(annotatedAst, layout.nodePositions);

    this.setData({
      tokens: result.tokens,
      highlightedToken: -1,
      ast: annotatedAst,
      astData: flatTree,
      evalResult: evalVal,
      isEvalError: typeof evalVal === 'string',
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
      isEvalError: false,
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
      const nextTok = this.data.highlightedToken + 1;
      if (nextTok < this.data.tokens.length) {
        this.setData({ highlightedToken: nextTok });
        if (nextTok === this.data.tokens.length - 1) {
          this.setData({ parsePhase: 'ast' });
        }
      }
      return;
    }

    if (this.data.parsePhase === 'ast') {
      const nextStep = this.data.currentStep + 1;
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
      const stepIdx = this.data.currentStep + 1;
      const sdtResult = applySdtStep(this.data.ast, stepIdx);
      if (sdtResult.node) {
        const layout = layoutTree(sdtResult.node, {
          nodeWidth: NODE_WIDTH,
          nodeHeight: NODE_HEIGHT,
          hGap: 60,
          vGap: 100
        });
        const flatTree = this._flattenTree(sdtResult.node, layout.nodePositions);
        const evalVal = evaluateAST(sdtResult.node);
        this.setData({
          ast: sdtResult.node,
          astData: flatTree,
          currentStep: stepIdx,
          nodePositions: layout.nodePositions,
          treeWidth: layout.width,
          treeHeight: layout.height,
          evalResult: evalVal,
          isEvalError: typeof evalVal === 'string'
        });
      }
      return;
    }
  },

  onStepBackward: function() {
    if (this.data.parsePhase === 'input') { return; }

    if (this.data.parsePhase === 'tokens') {
      const prevTok = this.data.highlightedToken - 1;
      if (prevTok < 0) {
        this.setData({ parsePhase: 'input', highlightedToken: -1 });
      } else {
        this.setData({ highlightedToken: prevTok });
      }
      return;
    }

    if (this.data.parsePhase === 'ast') {
      const prevStep = this.data.currentStep - 1;
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
      const prevSdt = this.data.currentStep - 1;
      if (prevSdt < 0) {
        this.setData({ parsePhase: 'ast', currentStep: this.data.totalSteps - 1 });
      } else {
        this._rebuildToSdtStep(prevSdt);
      }
    }
  },

  _rebuildToSdtStep: function(targetStep) {
    const expr = this.data.exprInput.trim();
    if (!expr) { return; }
    _resetIdCounter();
    try {
      const result = parseExpression(expr);
    } catch (e) {
      this.setData({ showError: true, errorText: e.message || '解析错误', parsePhase: 'input', currentStep: -1 });
      return;
    }
    let current = result.ast;
    for (let i = 0; i <= targetStep; i++) {
      const stepResult = applySdtStep(current, i);
      if (stepResult.node) { current = stepResult.node; }
    }
    const layout = layoutTree(current, {
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT,
      hGap: 60,
      vGap: 100
    });
    const flatTree = this._flattenTree(current, layout.nodePositions);
    const evalVal = evaluateAST(current);
    this.setData({
      ast: current,
      astData: flatTree,
      currentStep: targetStep,
      nodePositions: layout.nodePositions,
      treeWidth: layout.width,
      treeHeight: layout.height,
      evalResult: evalVal,
      isEvalError: typeof evalVal === 'string'
    });
  },

  // ── 折叠/展开 ──

  onToggleFold: function(e) {
    const nodeIdStr = e.currentTarget.dataset.nodeId;
    if (!nodeIdStr) { return; }
    const nodeId = parseInt(nodeIdStr, 10);
    if (isNaN(nodeId)) { return; }

    const newData = this.data.astData.map(function(n) {
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
    const flat = [];
    function flatten(n, depth) {
      if (!n) { return; }
      const pos = positions[n.id] || { x: 0, y: 0, w: 120, h: 60 };
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
      for (let i = 0; i < n.children.length; i++) {
        flatten(n.children[i], depth + 1);
      }
    }
    flatten(node, 0);
    return flat;
  }
});
