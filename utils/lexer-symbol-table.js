/**
 * 词法分析器 — 符号表管理
 *
 * 从 Token 流中提取所有标识符，汇总出现位置。
 * 所有函数为纯函数，无副作用。
 */

/**
 * @typedef {Object} SymbolEntry
 * @property {string} name        — 标识符名称
 * @property {{ line: number, col: number }[]} occurrences — 出现位置列表
 * @property {number} count       — 出现总次数
 */

/**
 * 从 Token 列表中构建符号表。
 * 只提取 type 为 'ID' 的 Token，按名称去重，按首次出现行号排序。
 *
 * @param {Array} tokens — Token 列表
 * @returns {SymbolEntry[]}
 */
function buildSymbolTable(tokens) {
  /** @type {Map<string, { line: number, col: number }[]>} */
  var entries = new Map();

  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (t.type !== 'ID') continue;

    var existing = entries.get(t.lexeme) || [];
    existing.push({
      line: t.line,
      col: t.colStart
    });
    entries.set(t.lexeme, existing);
  }

  // 转换为数组，按首次出现行号排序
  var result = [];
  entries.forEach(function(occurrences, name) {
    result.push({
      name: name,
      occurrences: occurrences,
      count: occurrences.length
    });
  });

  result.sort(function(a, b) {
    return a.occurrences[0].line - b.occurrences[0].line;
  });

  return result;
}

module.exports = {
  buildSymbolTable
};
