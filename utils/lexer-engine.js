/**
 * 词法分析引擎 — 核心循环
 *
 * 接受源码字符串和 Token 规则集，执行词法分析，返回 Token 列表、
 * 错误列表和分析步骤记录（用于步进动画）。
 *
 * 所有函数为纯函数，无副作用。
 */

const { TOKEN_RULES: DEFAULT_RULES } = require('./lexer-token');

/**
 * @typedef {Object} Token
 * @property {string} type     — Token 类型名，如 'KW_INT', 'ID', 'NUMBER'
 * @property {string} lexeme   — 原始词素
 * @property {number} line     — 行号（从 1 开始）
 * @property {number} colStart — 起始列号（从 1 开始）
 * @property {number} colEnd   — 结束列号（从 1 开始，exclusive）
 * @property {string} [regexRule] — 匹配的正则规则名称
 */

/**
 * @typedef {Object} LexError
 * @property {number} line    — 行号
 * @property {number} col     — 列号
 * @property {string} char    — 非法字符
 * @property {string} message — 错误描述
 */

/**
 * @typedef {Object} Step
 * @property {number} sourceIndex  — 当前字符位置（光标）
 * @property {Token}  [token]      — 刚识别的 Token
 * @property {string} buffer       — 当前积累的字符
 * @property {string} [matchedRule] — 当前匹配到的规则名
 * @property {LexError} [error]    — 当前错误
 */

/**
 * 对源码执行词法分析。
 *
 * @param {string} source — 源码字符串
 * @param {Array}  [rules] — 规则数组，默认使用 lexer-token 的 TOKEN_RULES
 * @returns {{ tokens: Token[], errors: LexError[], steps: Step[] }}
 */
function tokenize(source, rules) {
  const activeRules = rules || DEFAULT_RULES;
  var tokens = [];
  var errors = [];
  var steps = [];

  var pos = 0;
  var line = 1;
  var col = 1;

  while (pos < source.length) {
    // 记录当前步骤
    var step = {
      sourceIndex: pos,
      buffer: source.slice(Math.max(0, pos - 5), pos + 5)
    };

    // 跳过空白字符（空格、制表符、换行符、回车）
    var ch = source[pos];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      if (ch === '\n') {
        line++;
        col = 1;
      } else if (ch === '\r') {
        if (pos + 1 < source.length && source[pos + 1] === '\n') {
          pos++;
        }
        line++;
        col = 1;
      } else {
        col++;
      }
      pos++;
      steps.push(step);
      continue;
    }

    // 检测未闭合的块注释：当前位置是 /* 但后方没有 */
    if (ch === '/' && pos + 1 < source.length && source[pos + 1] === '*') {
      var closingIdx = source.indexOf('*/', pos + 2);
      if (closingIdx === -1) {
        // 未闭合的块注释 — 报错并跳过
        var lexeme = source.slice(pos);
        // 只贡献到行末
        var lineEndIdx = lexeme.indexOf('\n');
        if (lineEndIdx === -1) {
          lineEndIdx = lexeme.length;
        }
        var errLexeme = lexeme.slice(0, lineEndIdx);
        var err = {
          line: line,
          col: col,
          char: source[pos],
          message: '未闭合的多行注释'
        };
        errors.push(err);
        step.error = err;
        step.matchedRule = 'COMMENT_BLOCK';

        // 跳过到行末（或文件末尾）
        pos += errLexeme.length;
        col += errLexeme.length;
        steps.push(step);
        continue;
      }
    }

    // 尝试匹配所有规则，使用最长匹配原则
    var bestMatch = null;
    var bestRule = null;
    var bestLen = -1;

    for (var i = 0; i < activeRules.length; i++) {
      var rule = activeRules[i];
      var m = rule.pattern.exec(source.slice(pos));
      if (m) {
        var matchLen = m[0].length;
        // 最长匹配：选择匹配字符最多的规则
        // 相同长度：选择优先级高的规则
        if (matchLen > bestLen || (matchLen === bestLen && rule.priority > (bestRule ? bestRule.priority : -1))) {
          bestMatch = m;
          bestRule = rule;
          bestLen = matchLen;
        }
      }
    }

    if (bestMatch && bestRule) {
      var lexeme = bestMatch[0];

      // 注释不产生 Token，直接跳过
      if (bestRule.category === 'comment') {
        // 更新位置
        var newlines = countNewlines(lexeme);
        if (newlines > 0) {
          line += newlines;
          col = lexeme.length - lexeme.lastIndexOf('\n');
        } else {
          col += lexeme.length;
        }
        pos += lexeme.length;
        step.matchedRule = bestRule.name;
        steps.push(step);
        continue;
      }

      var token = {
        type: bestRule.name,
        lexeme: lexeme,
        line: line,
        colStart: col,
        colEnd: col + lexeme.length,
        regexRule: bestRule.name
      };

      tokens.push(token);
      step.token = token;
      step.matchedRule = bestRule.name;

      // 更新位置（处理多行 Token，如多行字符串）
      var newlinesInToken = countNewlines(lexeme);
      if (newlinesInToken > 0) {
        line += newlinesInToken;
        col = lexeme.length - lexeme.lastIndexOf('\n');
      } else {
        col += lexeme.length;
      }
      pos += lexeme.length;
    } else {
      // 非法字符
      var err = {
        line: line,
        col: col,
        char: source[pos],
        message: '非法字符: \'' + source[pos] + '\''
      };
      errors.push(err);
      step.error = err;

      // 跳过非法字符
      if (source[pos] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
      pos++;
    }

    steps.push(step);
  }

  // 添加终态步骤（光标在末尾）
  if (source.length > 0) {
    var finalStep = {
      sourceIndex: source.length,
      buffer: source.slice(-5)
    };
    steps.push(finalStep);
  }

  return {
    tokens: tokens,
    errors: errors,
    steps: steps
  };
}

/**
 * 计算字符串中的换行符数量。
 * @param {string} str
 * @returns {number}
 */
function countNewlines(str) {
  var count = 0;
  for (var i = 0; i < str.length; i++) {
    if (str[i] === '\n') {
      count++;
    }
  }
  return count;
}

module.exports = {
  tokenize
};
