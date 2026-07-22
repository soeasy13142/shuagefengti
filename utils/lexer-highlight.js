/**
 * 词法分析器 — 语法高亮数据
 *
 * 将 Token 映射为显示类名，用于源码区逐字符高亮渲染。
 * 所有函数为纯函数，无副作用。
 */

const { classifyToken } = require('./lexer-token');

/**
 * Token 分类到 CSS class 的映射表。
 * @type {Object<string, string>}
 */
var CATEGORY_CLASS_MAP = {
  'keyword': 'hl-keyword',
  'identifier': 'hl-identifier',
  'literal': 'hl-literal',
  'operator': 'hl-operator',
  'separator': 'hl-separator',
  'comment': 'hl-comment'
};

/**
 * 返回指定 Token type 对应的 CSS 高亮 class 名。
 *
 * @param {string} tokenType — Token 类型名（如 'KW_INT', 'ID', 'NUMBER'）
 * @returns {string} — CSS class 名，未知类型返回空字符串
 */
function tokenTypeToClass(tokenType) {
  var category = classifyToken(tokenType);
  if (!category) return '';
  return CATEGORY_CLASS_MAP[category] || '';
}

/**
 * 将 Token 列表转换为高亮区间数组。
 * 每个区间包含起始索引、长度和对应的 CSS class 名。
 *
 * 适用于在逐字符渲染的源码视图中标记颜色。
 *
 * @param {Array} tokens — Token 列表（含 line, colStart, colEnd 等属性）
 * @param {string} [source] — 原始源码（用于将行/列映射为字符索引）
 * @returns {Array<{ start: number, end: number, className: string, tokenType: string, lexeme: string }>}
 */
function tokensToHighlightRanges(tokens, source) {
  var ranges = [];

  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    var className = tokenTypeToClass(t.type);
    if (!className) continue;

    // 使用 Token 中的位置信息
    // 需要将行/列转为全局字符索引
    var startIdx = posToIndex(source || '', t.line, t.colStart);
    var endIdx = posToIndex(source || '', t.line, t.colEnd);

    if (startIdx === -1 || endIdx === -1) continue;

    ranges.push({
      start: startIdx,
      end: endIdx,
      className: className,
      tokenType: t.type,
      lexeme: t.lexeme
    });
  }

  return ranges;
}

/**
 * 将行/列位置转换为字符串中的字符索引。
 * 行和列从 1 开始计数。
 *
 * @param {string} source — 源码字符串
 * @param {number} line — 行号（从 1 开始）
 * @param {number} col — 列号（从 1 开始）
 * @returns {number} — 字符索引（从 0 开始），未找到返回 -1
 */
function posToIndex(source, line, col) {
  if (line < 1 || col < 1) return -1;
  if (source.length === 0) return -1;

  var currentLine = 1;
  for (var i = 0; i < source.length; i++) {
    if (currentLine === line) {
      return i + col - 1;
    }
    if (source[i] === '\n') {
      currentLine++;
    }
  }
  // 如果 line 超出范围，检查是否正好在末尾
  if (currentLine === line && col === 1) {
    return source.length;
  }
  return -1;
}

module.exports = {
  CATEGORY_CLASS_MAP,
  tokenTypeToClass,
  tokensToHighlightRanges,
  posToIndex
};
