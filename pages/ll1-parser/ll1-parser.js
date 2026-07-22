var { parseGrammar, detectLeftRecursion } = require('../../utils/ll1-grammar');
var {
  computeFIRST,
  computeFOLLOW,
  buildParseTable,
  parseInput,
  isLL1
} = require('../../utils/ll1-core');

var PRESETS = [
  {
    label: '表达式文法',
    text: [
      'E → T E\'',
      'E\' → + T E\' | ε',
      'T → F T\'',
      'T\' → * F T\' | ε',
      'F → ( E ) | id'
    ].join('\n')
  },
  {
    label: '括号匹配',
    text: [
      'S → ( S ) S | ε'
    ].join('\n')
  },
  {
    label: 'if-else 文法',
    text: [
      'S → i E t S S\' | a',
      'S\' → e S | ε',
      'E → b'
    ].join('\n')
  }
];

Page({
  data: {
    // Input
    grammarText: PRESETS[0].text,
    parseInputText: 'id + id * id',

    // Presets
    presets: PRESETS,

    // Error / status
    errorMessage: '',

    // Parsing results
    parsed: null,
    nonTerminalList: [],
    terminalList: [],
    productionList: [],
    hasLeftRecursion: false,
    leftRecursiveSymbols: [],

    // FIRST/FOLLOW display
    firstFollowData: [],

    // Parse table display
    tableColumns: [],
    tableRows: [],

    // Parse animation
    steps: [],
    currentStepIndex: -1,
    currentStep: null,
    parseAccepted: false,
    totalSteps: 0,
    parseErrorMessage: '',

    // Tab
    activeTab: 1,
    tabs: ['文法总览', 'FIRST/FOLLOW', '分析表', '串分析'],

    // Internal (not displayed directly)
    _grammar: null,
    _firstResult: null,
    _followResult: null,
    _tableResult: null
  },

  onLoad: function() {
    // Auto-compute on load
    this.onComputeTap();
  },

  // ── Input handlers ──

  onGrammarInput: function(e) {
    this.setData({ grammarText: e.detail.value });
  },

  onParseInputChange: function(e) {
    this.setData({ parseInputText: e.detail.value });
  },

  onPresetTap: function(e) {
    var idx = parseInt(e.currentTarget.dataset.index, 10);
    var preset = PRESETS[idx];
    if (preset) {
      this.setData({
        grammarText: preset.text,
        errorMessage: '',
        activeTab: 1
      });
      this.onComputeTap();
    }
  },

  // ── Computation ──

  onComputeTap: function() {
    var text = this.data.grammarText;
    if (!text || text.trim().length === 0) {
      this.setData({
        errorMessage: '请输入文法',
        parsed: null,
        _grammar: null
      });
      return;
    }

    try {
      var grammar = parseGrammar(text);
      var leftRec = detectLeftRecursion(grammar);

      var nonTerminalList = [];
      grammar.nonTerminals.forEach(function(nt) {
        nonTerminalList.push(nt);
      });
      var terminalList = [];
      grammar.terminals.forEach(function(t) {
        terminalList.push(t);
      });
      var productionList = grammar.productions.map(function(p) {
        return {
          index: p.index,
          lhs: p.lhs,
          rhsDisplay: p.rhs.length > 0 ? p.rhs.join(' ') : 'ε'
        };
      });

      var firstResult = computeFIRST(grammar);
      var followResult = computeFOLLOW(grammar, firstResult);
      var tableResult = buildParseTable(grammar, firstResult, followResult);

      // Build FIRST/FOLLOW display data
      var firstFollowData = [];
      nonTerminalList.forEach(function(nt) {
        var firstArr = [];
        firstResult.FIRST[nt].forEach(function(s) { firstArr.push(s); });
        var followArr = [];
        followResult.FOLLOW[nt].forEach(function(s) { followArr.push(s); });
        firstFollowData.push({
          nonTerminal: nt,
          firstArray: firstArr,
          followArray: followArr
        });
      });

      // Build parse table display data
      var tableColumns = [];
      grammar.terminals.forEach(function(t) { tableColumns.push(t); });
      tableColumns.push('$');

      var tableRows = nonTerminalList.map(function(nt) {
        var cells = tableColumns.map(function(col) {
          var prod = tableResult.table[nt] && tableResult.table[nt][col];
          var conflictList = tableResult.conflicts[nt] && tableResult.conflicts[nt][col];
          var hasConflict = conflictList && conflictList.length > 0;
          var prodStr = null;
          if (hasConflict) {
            prodStr = conflictList.map(function(p) {
              return p.lhs + ' → ' + (p.rhs.length > 0 ? p.rhs.join(' ') : 'ε');
            }).join(' / ');
          } else if (prod) {
            prodStr = prod.lhs + ' → ' + (prod.rhs.length > 0 ? prod.rhs.join(' ') : 'ε');
          }
          return {
            terminal: col,
            prodStr: prodStr,
            hasConflict: hasConflict,
            cellClass: hasConflict ? 'cell-conflict' : (prod ? 'cell-prod' : 'cell-error')
          };
        });
        return { nonTerminal: nt, cells: cells };
      });

      // Reset parse animation state
      this.setData({
        parsed: grammar,
        nonTerminalList: nonTerminalList,
        terminalList: terminalList,
        productionList: productionList,
        hasLeftRecursion: leftRec.hasLeftRecursion,
        leftRecursiveSymbols: leftRec.recursiveSymbols,
        firstFollowData: firstFollowData,
        tableColumns: tableColumns,
        tableRows: tableRows,
        steps: [],
        currentStepIndex: -1,
        currentStep: null,
        parseAccepted: false,
        totalSteps: 0,
        errorMessage: '',
        parseErrorMessage: '',
        _grammar: grammar,
        _firstResult: firstResult,
        _followResult: followResult,
        _tableResult: tableResult
      });
    } catch (e) {
      this.setData({
        errorMessage: '解析失败: ' + e.message,
        parsed: null,
        _grammar: null,
        firstFollowData: [],
        tableColumns: [],
        tableRows: []
      });
    }
  },

  onClearTap: function() {
    this.setData({
      grammarText: '',
      parseInputText: '',
      errorMessage: '',
      parseErrorMessage: '',
      parsed: null,
      nonTerminalList: [],
      terminalList: [],
      productionList: [],
      hasLeftRecursion: false,
      leftRecursiveSymbols: [],
      firstFollowData: [],
      tableColumns: [],
      tableRows: [],
      steps: [],
      currentStepIndex: -1,
      currentStep: null,
      parseAccepted: false,
      totalSteps: 0,
      _grammar: null,
      _firstResult: null,
      _followResult: null,
      _tableResult: null
    });
  },

  // ── Tab ──

  onTabTap: function(e) {
    var idx = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({ activeTab: idx });
  },

  // ── Parse ──

  onParseStringTap: function() {
    var _grammar = this.data._grammar;
    var _tableResult = this.data._tableResult;

    if (!_grammar) {
      this.setData({ parseErrorMessage: '请先输入并计算文法' });
      return;
    }

    var inputText = this.data.parseInputText.trim();
    if (inputText.length === 0) {
      this.setData({ parseErrorMessage: '请输入待分析串' });
      return;
    }

    // Split input by whitespace
    var tokens = inputText.split(/\s+/);

    // Validate tokens against grammar terminals
    var _validTerminals = {};
    _grammar.terminals.forEach(function(t) { _validTerminals[t] = true; });

    var invalidTokens = [];
    for (var i = 0; i < tokens.length; i++) {
      if (!_validTerminals[tokens[i]]) {
        invalidTokens.push(tokens[i]);
      }
    }

    if (invalidTokens.length > 0) {
      this.setData({
        parseErrorMessage: '未识别的符号: ' + invalidTokens.join(', ')
      });
      return;
    }

    try {
      var parseResult = parseInput(_grammar, _tableResult.table, tokens);

      this.setData({
        steps: parseResult.steps,
        currentStepIndex: 0,
        currentStep: parseResult.steps[0],
        parseAccepted: parseResult.accepted,
        totalSteps: parseResult.steps.length,
        parseErrorMessage: '',
        activeTab: 3
      });
    } catch (e) {
      this.setData({ parseErrorMessage: '分析出错: ' + e.message });
    }
  },

  // ── Step control ──

  onStepBackward: function() {
    var idx = this.data.currentStepIndex;
    if (idx > 0) {
      this.setData({
        currentStepIndex: idx - 1,
        currentStep: this.data.steps[idx - 1]
      });
    }
  },

  onStepForward: function() {
    var idx = this.data.currentStepIndex;
    if (idx < this.data.steps.length - 1) {
      this.setData({
        currentStepIndex: idx + 1,
        currentStep: this.data.steps[idx + 1]
      });
    }
  },

  onJumpEnd: function() {
    var len = this.data.steps.length;
    if (len > 0) {
      this.setData({
        currentStepIndex: len - 1,
        currentStep: this.data.steps[len - 1]
      });
    }
  }
});
