/**
 * 词法分析器 — Token 类型定义 + 正则规则集
 *
 * 定义类 C 语言子集的 Token 类型和匹配规则。
 * 所有规则按优先级降序排列（关键字 > 运算符 > 分隔符 > 字面量 > 注释 > 标识符）。
 * 所有函数为纯函数，无副作用。
 */

/**
 * @typedef {Object} TokenRule
 * @property {string} name      — 规则名称，如 'KW_INT', 'ID', 'NUMBER'
 * @property {RegExp} pattern   — 匹配模式，以 ^ 开头确保从当前位置匹配
 * @property {number} priority  — 优先级（数值越大越优先）
 * @property {'keyword'|'identifier'|'literal'|'operator'|'separator'|'comment'} category
 */

/**
 * Token 规则数组。
 * 按优先级降序排列：关键字 > 运算符 > 分隔符 > 字面量 > 注释 > 标识符。
 * 相同优先级时，数组顺序靠前的优先匹配。
 *
 * @type {TokenRule[]}
 */
const TOKEN_RULES = [
  // ── 关键字（优先级 3，优先于标识符） ──
  { name: 'KW_INT',    pattern: /^int\b/,     priority: 3, category: 'keyword' },
  { name: 'KW_RETURN', pattern: /^return\b/,  priority: 3, category: 'keyword' },
  { name: 'KW_IF',     pattern: /^if\b/,      priority: 3, category: 'keyword' },
  { name: 'KW_ELSE',   pattern: /^else\b/,    priority: 3, category: 'keyword' },
  { name: 'KW_WHILE',  pattern: /^while\b/,   priority: 3, category: 'keyword' },
  { name: 'KW_FOR',    pattern: /^for\b/,     priority: 3, category: 'keyword' },
  { name: 'KW_VOID',   pattern: /^void\b/,    priority: 3, category: 'keyword' },
  { name: 'KW_CHAR',   pattern: /^char\b/,    priority: 3, category: 'keyword' },
  { name: 'KW_FLOAT',  pattern: /^float\b/,   priority: 3, category: 'keyword' },
  { name: 'KW_DOUBLE', pattern: /^double\b/,  priority: 3, category: 'keyword' },
  { name: 'KW_CONST',  pattern: /^const\b/,   priority: 3, category: 'keyword' },
  { name: 'KW_STRUCT', pattern: /^struct\b/,  priority: 3, category: 'keyword' },

  // ── 字符串常量（优先级 2） ──
  { name: 'STRING',    pattern: /^"(?:[^"\\]|\\.)*"/, priority: 2, category: 'literal' },

  // ── 数字（优先级 2） ──
  { name: 'NUMBER',    pattern: /^\d+(?:\.\d+)?/,     priority: 2, category: 'literal' },

  // ── 运算符（优先级 2），多字符在前以满足最长匹配 ──
  { name: 'OP_GE',     pattern: /^>=/,  priority: 2, category: 'operator' },
  { name: 'OP_LE',     pattern: /^<=/,  priority: 2, category: 'operator' },
  { name: 'OP_EQ',     pattern: /^==/,  priority: 2, category: 'operator' },
  { name: 'OP_NE',     pattern: /^!=/,  priority: 2, category: 'operator' },
  { name: 'OP_AND',    pattern: /^&&/,  priority: 2, category: 'operator' },
  { name: 'OP_OR',     pattern: /^\|\|/, priority: 2, category: 'operator' },
  { name: 'OP_PLUS',   pattern: /^\+/,  priority: 2, category: 'operator' },
  { name: 'OP_MINUS',  pattern: /^-/,   priority: 2, category: 'operator' },
  { name: 'OP_MUL',    pattern: /^\*/,  priority: 2, category: 'operator' },
  { name: 'OP_DIV',    pattern: /^\//,  priority: 2, category: 'operator' },
  { name: 'OP_MOD',    pattern: /^%/,   priority: 2, category: 'operator' },
  { name: 'OP_LT',     pattern: /^</,   priority: 2, category: 'operator' },
  { name: 'OP_GT',     pattern: /^>/,   priority: 2, category: 'operator' },
  { name: 'OP_ASSIGN', pattern: /^=/,   priority: 2, category: 'operator' },
  { name: 'OP_NOT',    pattern: /^!/,   priority: 2, category: 'operator' },
  { name: 'OP_BITAND', pattern: /^&/,   priority: 2, category: 'operator' },
  { name: 'OP_BITOR',  pattern: /^\|/,  priority: 2, category: 'operator' },
  { name: 'OP_BITXOR', pattern: /^\^/,  priority: 2, category: 'operator' },
  { name: 'OP_TILDE',  pattern: /^~/,   priority: 2, category: 'operator' },

  // ── 分隔符（优先级 2） ──
  { name: 'SEP_LPAREN', pattern: /^\(/, priority: 2, category: 'separator' },
  { name: 'SEP_RPAREN', pattern: /^\)/, priority: 2, category: 'separator' },
  { name: 'SEP_LBRACE', pattern: /^\{/, priority: 2, category: 'separator' },
  { name: 'SEP_RBRACE', pattern: /^\}/, priority: 2, category: 'separator' },
  { name: 'SEP_SEMI',   pattern: /^;/,  priority: 2, category: 'separator' },
  { name: 'SEP_COMMA',  pattern: /^,/,  priority: 2, category: 'separator' },
  { name: 'SEP_LBRACK', pattern: /^\[/, priority: 2, category: 'separator' },
  { name: 'SEP_RBRACK', pattern: /^\]/, priority: 2, category: 'separator' },

  // ── 注释（优先级 1） ──
  { name: 'COMMENT_LINE', pattern: /^\/\/[^\n]*/,     priority: 1, category: 'comment' },
  { name: 'COMMENT_BLOCK', pattern: /^\/\*[\s\S]*?\*\//, priority: 1, category: 'comment' },

  // ── 标识符（优先级 1，兜底） ──
  { name: 'ID', pattern: /^[a-zA-Z_]\w*/, priority: 1, category: 'identifier' },
];

/**
 * 返回规则数组的浅拷贝。
 * @returns {TokenRule[]}
 */
function getRules() {
  return TOKEN_RULES.slice();
}

/**
 * 根据 Token 类型名返回分类。
 * @param {string} type — Token 类型名，如 'KW_INT', 'ID'
 * @returns {string|null} — 分类名或 null
 */
function classifyToken(type) {
  if (!type) return null;
  if (type.startsWith('KW_')) return 'keyword';
  if (type === 'ID') return 'identifier';
  if (type === 'NUMBER' || type === 'STRING') return 'literal';
  if (type.startsWith('OP_')) return 'operator';
  if (type.startsWith('SEP_')) return 'separator';
  if (type.startsWith('COMMENT_')) return 'comment';
  return null;
}

module.exports = {
  TOKEN_RULES,
  getRules,
  classifyToken
};
