/**
 * LL(1) 文法解析模块
 *
 * 解析用户输入的产生式文本 → 内部 Grammar 表示，
 * 并提供左递归检测功能。
 */

const EPSILON = 'ε';

/**
 * @typedef {Object} Production
 * @property {string} lhs - 左部非终结符
 * @property {string[]} rhs - 右部符号序列（空数组 = epsilon）
 * @property {number} index - 产生式编号（0-based）
 */

/**
 * @typedef {Object} Grammar
 * @property {Set<string>} nonTerminals
 * @property {Set<string>} terminals
 * @property {string} startSymbol
 * @property {Production[]} productions
 * @property {Object<string, Production[]>} productionMap
 */

/**
 * Parse grammar text into internal representation.
 * @param {string} text - Grammar text with one production per line
 * @returns {Grammar}
 * @throws {Error} On invalid format or empty grammar
 */
function parseGrammar(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('未输入任何文法');
  }

  const lines = text.split('\n');
  const productions = [];
  const nonTerminals = new Set();
  const allSymbols = new Set();
  let startSymbol = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (line.length === 0) {
      continue;
    }

    // Match: A → α | β  or  A -> α | β
    const arrowMatch = line.match(/^([A-Za-z_]\w*(?:'|))?\s*(?:→|->)\s*(.*)$/);
    if (!arrowMatch) {
      throw new Error('第 ' + (i + 1) + ' 行格式错误: 缺少 "→" 或产生式格式不正确 ("' + raw + '")');
    }

    const lhs = arrowMatch[1].trim();
    if (lhs.length === 0) {
      throw new Error('第 ' + (i + 1) + ' 行格式错误: 左部为空');
    }

    const rhsPart = arrowMatch[2].trim();
    nonTerminals.add(lhs);
    if (startSymbol === null) {
      startSymbol = lhs;
    }

    // Split by | (not inside parentheses)
    const alternatives = _splitAlternatives(rhsPart);

    for (const alt of alternatives) {
      const trimmedAlt = alt.trim();
      const symbols = _parseRHS(trimmedAlt);
      const production = {
        lhs: lhs,
        rhs: symbols,
        index: productions.length
      };
      productions.push(production);

      for (var j = 0; j < symbols.length; j++) {
        allSymbols.add(symbols[j]);
      }
    }
  }

  if (productions.length === 0) {
    throw new Error('未解析到任何产生式');
  }

  // Terminals: all symbols not in nonTerminals and not epsilon
  var terminals = new Set();
  var symbolIterator = allSymbols.values
    ? allSymbols.values()
    : Array.from(allSymbols);

  allSymbols.forEach(function(sym) {
    if (!nonTerminals.has(sym) && sym !== EPSILON) {
      terminals.add(sym);
    }
  });

  // Build productionMap
  var productionMap = {};
  nonTerminals.forEach(function(nt) {
    productionMap[nt] = [];
  });
  for (var p = 0; p < productions.length; p++) {
    productionMap[productions[p].lhs].push(productions[p]);
  }

  return {
    nonTerminals: nonTerminals,
    terminals: terminals,
    startSymbol: startSymbol,
    productions: productions,
    productionMap: productionMap
  };
}

/**
 * Split RHS by | respecting parentheses depth.
 * @param {string} text
 * @returns {string[]}
 */
function _splitAlternatives(text) {
  var parts = [];
  var current = '';
  var depth = 0;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (ch === '(' || ch === '[') {
      depth++;
    } else if (ch === ')' || ch === ']') {
      depth--;
    } else if (ch === '|' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current.trim());
  return parts;
}

/**
 * Parse RHS text into symbol array.
 * @param {string} text
 * @returns {string[]}
 */
function _parseRHS(text) {
  if (text === 'ε' || text === 'epsilon') {
    return [];
  }
  if (text.length === 0) {
    return [];
  }
  return text.split(/\s+/);
}

/**
 * Detect immediate left recursion in grammar.
 * @param {Grammar} grammar
 * @returns {{ hasLeftRecursion: boolean, recursiveSymbols: string[] }}
 */
function detectLeftRecursion(grammar) {
  var recursive = [];

  for (var i = 0; i < grammar.productions.length; i++) {
    var prod = grammar.productions[i];
    if (prod.rhs.length > 0 && prod.rhs[0] === prod.lhs) {
      recursive.push(prod.lhs);
    }
  }

  var unique = [];
  var seen = {};
  for (var j = 0; j < recursive.length; j++) {
    if (!seen[recursive[j]]) {
      seen[recursive[j]] = true;
      unique.push(recursive[j]);
    }
  }

  return {
    hasLeftRecursion: unique.length > 0,
    recursiveSymbols: unique
  };
}

module.exports = {
  parseGrammar: parseGrammar,
  detectLeftRecursion: detectLeftRecursion,
  EPSILON: EPSILON
};
