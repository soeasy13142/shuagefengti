const { parseGrammar, detectLeftRecursion } = require('../../utils/ll1-grammar');
const {
  computeFIRST,
  computeFOLLOW,
  buildParseTable,
  parseInput,
  isLL1
} = require('../../utils/ll1-core');

const PRESETS = [
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
    leftRecursiveSymbolsStr: '',

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
    const idx = parseInt(e.currentTarget.dataset.index, 10);
    const preset = PRESETS[idx];
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
    const text = this.data.grammarText;
    if (!text || text.trim().length === 0) {
      this.setData({
        errorMessage: '请输入文法',
        parsed: null,
        _grammar: null
      });
      return;
    }

    try {
      const grammar = parseGrammar(text);
      const leftRec = detectLeftRecursion(grammar);

      const nonTerminalList = [];
      grammar.nonTerminals.forEach(function(nt) {
        nonTerminalList.push(nt);
      });
      const terminalList = [];
      grammar.terminals.forEach(function(t) {
        terminalList.push(t);
      });
      const productionList = grammar.productions.map(function(p) {
        return {
          index: p.index,
          lhs: p.lhs,
          rhsDisplay: p.rhs.length > 0 ? p.rhs.join(' ') : 'ε'
        };
      });

      const firstResult = computeFIRST(grammar);
      const followResult = computeFOLLOW(grammar, firstResult);
      const tableResult = buildParseTable(grammar, firstResult, followResult);

      // Build FIRST/FOLLOW display data
      const firstFollowData = [];
      nonTerminalList.forEach(function(nt) {
        const firstArr = [];
        firstResult.FIRST[nt].forEach(function(s) { firstArr.push(s); });
        const followArr = [];
        followResult.FOLLOW[nt].forEach(function(s) { followArr.push(s); });
        firstFollowData.push({
          nonTerminal: nt,
          firstArray: firstArr,
          followArray: followArr,
          firstStr: firstArr.join(', '),
          followStr: followArr.join(', ')
        });
      });

      // Build parse table display data
      const tableColumns = [];
      grammar.terminals.forEach(function(t) { tableColumns.push(t); });
      tableColumns.push('$');

      const tableRows = nonTerminalList.map(function(nt) {
        const cells = tableColumns.map(function(col) {
          const prod = tableResult.table[nt] && tableResult.table[nt][col];
          const conflictList = tableResult.conflicts[nt] && tableResult.conflicts[nt][col];
          const hasConflict = conflictList && conflictList.length > 0;
          let prodStr = null;
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
        leftRecursiveSymbolsStr: leftRec.recursiveSymbols.join(', '),
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
      leftRecursiveSymbolsStr: '',
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
    const idx = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({ activeTab: idx });
  },

  // ── Parse ──

  onParseStringTap: function() {
    const _grammar = this.data._grammar;
    const _tableResult = this.data._tableResult;

    if (!_grammar) {
      this.setData({ parseErrorMessage: '请先输入并计算文法' });
      return;
    }

    const inputText = this.data.parseInputText.trim();
    if (inputText.length === 0) {
      this.setData({ parseErrorMessage: '请输入待分析串' });
      return;
    }

    // Split input by whitespace
    const tokens = inputText.split(/\s+/);

    // Validate tokens against grammar terminals
    const _validTerminals = {};
    _grammar.terminals.forEach(function(t) { _validTerminals[t] = true; });

    const invalidTokens = [];
    for (let i = 0; i < tokens.length; i++) {
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
      const parseResult = parseInput(_grammar, _tableResult.table, tokens);

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
    const idx = this.data.currentStepIndex;
    if (idx > 0) {
      this.setData({
        currentStepIndex: idx - 1,
        currentStep: this.data.steps[idx - 1]
      });
    }
  },

  onStepForward: function() {
    const idx = this.data.currentStepIndex;
    if (idx < this.data.steps.length - 1) {
      this.setData({
        currentStepIndex: idx + 1,
        currentStep: this.data.steps[idx + 1]
      });
    }
  },

  onJumpEnd: function() {
    const len = this.data.steps.length;
    if (len > 0) {
      this.setData({
        currentStepIndex: len - 1,
        currentStep: this.data.steps[len - 1]
      });
    }
  }
});
