/**
 * 词法分析器页面逻辑
 *
 * 提供代码输入、Token 化、步进动画、符号表展示等功能。
 */

const { tokenize } = require('../../utils/lexer-engine');
const { buildSymbolTable } = require('../../utils/lexer-symbol-table');
const { tokenTypeToClass } = require('../../utils/lexer-highlight');
const { classifyToken } = require('../../utils/lexer-token');

/** 预设示例 */
var SAMPLES = [
  {
    label: '变量声明与赋值',
    code: 'int x = 42;\nfloat pi = 3.14;\nchar c = \'a\';'
  },
  {
    label: '函数调用',
    code: 'int result = add(a, b);\nreturn result;'
  },
  {
    label: '嵌套注释',
    code: '/* outer\n * inner\n */\nint x = 1;'
  },
  {
    label: '多行字符串',
    code: 'char* msg = "hello\\nworld";\nint len = 42;'
  },
  {
    label: '完整程序',
    code: 'int main() {\n  int x = 42;\n  return x;\n}'
  }
];

Page({
  data: {
    rawInput: '',
    sampleLabels: [],
    sampleIndex: -1,
    inputTooLong: false,
    hasResult: false,

    // Tokenization results
    tokens: [],
    errors: [],
    steps: [],
    stepIndex: -1, // -1 = not started, >=0 = current step index

    // Source view
    sourceLines: [],

    // Token display
    displayTokens: [],
    currentStepDisplay: '0 / 0',

    // Symbol table
    symbolTable: [],

    // Status
    currentRule: '',

    // Token detail modal
    showTokenDetail: false,
    selectedToken: null
  },

  _result: null,

  onLoad() {
    var labels = SAMPLES.map(function(s) { return s.label; });
    this.setData({
      sampleLabels: ['（自定义输入）', ...labels]
    });
  },

  // ── Event Handlers ──

  onSampleChange(e) {
    var idx = parseInt(e.detail.value, 10);
    if (idx === 0) {
      this.setData({ sampleIndex: 0 });
      return;
    }
    var sample = SAMPLES[idx - 1];
    if (sample) {
      this.setData({
        rawInput: sample.code,
        sampleIndex: idx,
        inputTooLong: false,
        hasResult: false,
        tokens: [],
        errors: [],
        steps: [],
        stepIndex: -1,
        sourceLines: [],
        displayTokens: [],
        symbolTable: [],
        currentRule: '',
        currentStepDisplay: '0 / 0'
      });
      this._result = null;
    }
  },

  onCodeInput(e) {
    var val = e.detail.value;
    if (val.length > 5000) {
      this.setData({ inputTooLong: true });
      return;
    }
    this.setData({
      rawInput: val,
      inputTooLong: false
    });
  },

  onTokenize() {
    var source = this.data.rawInput;
    if (!source || source.trim().length === 0) {
      wx.showToast({ title: '请输入代码', icon: 'none' });
      return;
    }
    if (this.data.inputTooLong) {
      wx.showToast({ title: '输入过长，请输入 5000 字符以内', icon: 'none' });
      return;
    }

    var result = tokenize(source);
    this._result = result;

    // Build symbol table from all tokens
    var symTable = buildSymbolTable(result.tokens);

    var totalSteps = result.steps.length;

    this.setData({
      tokens: result.tokens,
      errors: result.errors,
      steps: result.steps,
      stepIndex: -1,
      hasResult: true,
      displayTokens: this._buildTokenCards([]),
      symbolTable: this._buildSymbolDisplay(symTable),
      currentStepDisplay: '0 / ' + totalSteps,
      currentRule: ''
    });

    this._updateSourceView(-1);
  },

  onStep() {
    if (!this._result) return;
    var steps = this._result.steps;
    var nextIdx = this.data.stepIndex + 1;

    if (nextIdx >= steps.length) {
      wx.showToast({ title: '已到末尾', icon: 'none' });
      return;
    }

    this.setData({ stepIndex: nextIdx });
    this._updateSourceView(nextIdx);
    this._updateTokenDisplay(nextIdx);
    this._updateStatus(nextIdx);
  },

  onStepAll() {
    if (!this._result) return;
    var steps = this._result.steps;
    var lastIdx = steps.length - 1;

    if (lastIdx < 0) return;

    this.setData({ stepIndex: lastIdx });
    this._updateSourceView(lastIdx);
    this._updateTokenDisplay(lastIdx);
    this._updateStatus(lastIdx);
  },

  onReset() {
    this.setData({
      stepIndex: -1,
      sourceLines: [],
      displayTokens: [],
      currentStepDisplay: '0 / ' + (this._result ? this._result.steps.length : 0),
      currentRule: ''
    });
    if (this._result) {
      this._updateSourceView(-1);
    }
  },

  onTokenClick(e) {
    var index = e.currentTarget.dataset.index;
    var token = this.data.displayTokens[index];
    if (!token) return;

    // Build full detail
    var detail = {
      type: token.type,
      lexeme: token.lexeme,
      line: token.line,
      colStart: token.colStart,
      colEnd: token.colEnd,
      category: token.category || classifyToken(token.type) || 'unknown',
      regexRule: token.regexRule || '-'
    };

    this.setData({
      showTokenDetail: true,
      selectedToken: detail
    });
  },

  onCloseDetail() {
    this.setData({
      showTokenDetail: false,
      selectedToken: null
    });
  },

  noop() {
    // Prevent tap propagation
  },

  // ── Internal ──

  /**
   * 根据当前步骤索引更新源码视图。
   * @param {number} stepIndex — -1 表示初始状态（全部未处理）
   */
  _updateSourceView(stepIndex) {
    var source = this.data.rawInput;
    if (!source) {
      this.setData({ sourceLines: [] });
      return;
    }

    var tokens = this.data.tokens;
    var steps = this.data.steps;
    var cursorPos = 0;

    // Determine cursor position based on current step
    if (stepIndex >= 0 && stepIndex < steps.length) {
      cursorPos = steps[stepIndex].sourceIndex;
    } else if (stepIndex === -1) {
      cursorPos = 0;
    } else {
      cursorPos = source.length;
    }

    // Determine which tokens are "revealed" (token's end <= cursorPos)
    var revealedTokens = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var tEnd = posToGlobalIndex(source, t.line, t.colEnd);
      if (tEnd !== -1 && tEnd <= cursorPos) {
        revealedTokens.push(t);
      }
    }

    // Build character-to-class mapping
    var charClasses = new Array(source.length);
    for (var i = 0; i < source.length; i++) {
      charClasses[i] = 'hl-unprocessed';
    }

    for (var i = 0; i < revealedTokens.length; i++) {
      var t = revealedTokens[i];
      var tStart = posToGlobalIndex(source, t.line, t.colStart);
      var tEnd = posToGlobalIndex(source, t.line, t.colEnd);
      if (tStart === -1 || tEnd === -1) continue;
      var cls = tokenTypeToClass(t.type) || 'hl-plain';
      for (var j = tStart; j < tEnd && j < source.length; j++) {
        charClasses[j] = cls;
      }
    }

    // Build lines with segments
    var lines = source.split('\n');
    var sourceLines = [];
    var globalIdx = 0;

    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      var segments = [];
      var showCursor = false;

      for (var ci = 0; ci < line.length; ci++) {
        // Check if cursor should be shown before this character
        if (globalIdx === cursorPos && cursorPos < source.length) {
          showCursor = true;
        }

        var cls = charClasses[globalIdx] || 'hl-plain';
        var text = line[ci];

        // Merge consecutive chars with same class
        var lastSeg = segments[segments.length - 1];
        if (lastSeg && lastSeg.className === cls && !showCursor) {
          lastSeg.text += text;
        } else {
          if (showCursor) {
            // Start new segment after cursor
            segments.push({ text: text, className: cls, showCursor: false });
          } else {
            segments.push({ text: text, className: cls });
          }
        }

        globalIdx++;
      }

      // Check for cursor at end of line
      if (globalIdx === cursorPos && cursorPos < source.length) {
        // Cursor at end of this line (beginning of next line's content)
        // We handle this by adding cursor to the last segment or as a line property
        // The cursor is shown between chars - for end of line it's after the last char
        if (segments.length > 0) {
          segments[segments.length - 1].showCursor = true;
        }
      }

      sourceLines.push({
        idx: li,
        segments: segments,
        showCursor: showCursor
      });
    }

    // Handle cursor at end of source
    if (cursorPos >= source.length && sourceLines.length > 0) {
      var lastLine = sourceLines[sourceLines.length - 1];
      if (lastLine.segments.length > 0) {
        lastLine.segments[lastLine.segments.length - 1].showCursor = true;
      }
    }

    this.setData({ sourceLines: sourceLines });
  },

  /**
   * 根据当前步骤更新 Token 流显示。
   * @param {number} stepIndex
   */
  _updateTokenDisplay(stepIndex) {
    var tokens = this.data.tokens;
    var steps = this.data.steps;
    if (!tokens || !steps) return;

    var visibleCount = 0;
    if (stepIndex >= 0 && stepIndex < steps.length) {
      var cursorPos = steps[stepIndex].sourceIndex;
      for (var i = 0; i < tokens.length; i++) {
        var tEnd = posToGlobalIndex(this.data.rawInput, tokens[i].line, tokens[i].colEnd);
        if (tEnd !== -1 && tEnd <= cursorPos) {
          visibleCount = i + 1;
        }
      }
    } else if (stepIndex >= steps.length) {
      visibleCount = tokens.length;
    }

    var visibleTokens = tokens.slice(0, visibleCount);
    this.setData({
      displayTokens: this._buildTokenCards(visibleTokens)
    });
  },

  /**
   * 更新状态栏信息。
   * @param {number} stepIndex
   */
  _updateStatus(stepIndex) {
    var steps = this.data.steps;
    if (!steps || stepIndex < 0 || stepIndex >= steps.length) {
      this.setData({
        currentStepDisplay: (stepIndex + 1) + ' / ' + (steps ? steps.length : 0),
        currentRule: ''
      });
      return;
    }

    var step = steps[stepIndex];
    var totalSteps = steps.length;
    this.setData({
      currentStepDisplay: (stepIndex + 1) + ' / ' + totalSteps,
      currentRule: step.matchedRule || ''
    });
  },

  /**
   * 构建 Token 卡片显示数据。
   * @param {Array} tokens
   * @returns {Array}
   */
  _buildTokenCards(tokens) {
    return tokens.map(function(t) {
      var cls = tokenTypeToClass(t.type) || 'hl-plain';
      return {
        type: t.type,
        lexeme: t.lexeme,
        line: t.line,
        colStart: t.colStart,
        colEnd: t.colEnd,
        regexRule: t.regexRule || '',
        className: cls
      };
    });
  },

  /**
   * 构建符号表显示数据。
   * @param {Array} symTable
   * @returns {Array}
   */
  _buildSymbolDisplay(symTable) {
    return symTable.map(function(entry) {
      var occStr = entry.occurrences
        .map(function(o) { return o.line + ':' + o.col; })
        .join(', ');
      return {
        name: entry.name,
        occDisplay: occStr,
        count: entry.count
      };
    });
  }
});

/**
 * 将 Token 的行/列位置转换为全局字符索引。
 * @param {string} source
 * @param {number} line
 * @param {number} col
 * @returns {number}
 */
function posToGlobalIndex(source, line, col) {
  if (line < 1 || col < 1) return -1;
  var currentLine = 1;
  for (var i = 0; i < source.length; i++) {
    if (currentLine === line) {
      return i + col - 1;
    }
    if (source[i] === '\n') {
      currentLine++;
    }
  }
  if (currentLine === line && col === 1) {
    return source.length;
  }
  return -1;
}
