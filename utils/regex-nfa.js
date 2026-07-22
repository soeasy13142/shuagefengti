/**
 * Regex - NFA 转换器
 *
 * 递归下降解析正则表达式 → AST → Thompson 构造法生成 ε-NFA
 *
 * 支持的语法：
 *   `*` 克林闭包  `|` 选择  `()` 分组
 *   `?` 0 或 1  `+` 1 或多次  `\` 转义
 */

const RECURSION_LIMIT = 50;

// ── AST 节点类型 ──
const AST_LITERAL = 'literal';
const AST_CONCAT = 'concat';
const AST_ALT = 'alt';
const AST_STAR = 'star';
const AST_PLUS = 'plus';
const AST_OPTIONAL = 'optional';
const AST_EPSILON = 'epsilon';

/**
 * 解析正则表达式字符串为 AST
 * @param {string} regex
 * @returns {object} AST 根节点
 */
function parseRegex(regex) {
  if (typeof regex !== 'string') {
    throw new Error('Input must be a string');
  }
  if (regex.length === 0) {
    return { type: AST_EPSILON };
  }

  let pos = 0;

  function parseExpr(depth) {
    if (depth > RECURSION_LIMIT) {
      throw new Error('Regex too deeply nested (max ' + RECURSION_LIMIT + ' levels)');
    }
    let left = parseTerm(depth + 1);
    while (pos < regex.length && regex[pos] === '|') {
      pos++;
      if (pos >= regex.length) {
        throw new Error('Empty alternation');
      }
      const right = parseTerm(depth + 1);
      left = { type: AST_ALT, left: left, right: right };
    }
    return left;
  }

  function parseTerm(depth) {
    const nodes = [];
    while (pos < regex.length && regex[pos] !== '|' && regex[pos] !== ')') {
      nodes.push(parseFactor(depth + 1));
    }
    if (nodes.length === 0) {
      return { type: AST_EPSILON };
    }
    if (nodes.length === 1) {
      return nodes[0];
    }
    // Right-associative concatenation
    let result = nodes[nodes.length - 1];
    for (let i = nodes.length - 2; i >= 0; i--) {
      result = { type: AST_CONCAT, left: nodes[i], right: result };
    }
    return result;
  }

  function parseFactor(depth) {
    let node = parseAtom(depth + 1);
    while (pos < regex.length) {
      const ch = regex[pos];
      if (ch === '*') {
        pos++;
        node = { type: AST_STAR, child: node };
      } else if (ch === '+') {
        pos++;
        node = { type: AST_PLUS, child: node };
      } else if (ch === '?') {
        pos++;
        node = { type: AST_OPTIONAL, child: node };
      } else {
        break;
      }
    }
    return node;
  }

  function parseAtom(depth) {
    if (pos >= regex.length) {
      throw new Error('Unexpected end of regex');
    }

    const ch = regex[pos];

    if (ch === '(') {
      pos++;
      const expr = parseExpr(depth + 1);
      if (pos >= regex.length || regex[pos] !== ')') {
        throw new Error('Unmatched opening parenthesis');
      }
      pos++;
      return expr;
    }

    if (ch === ')') {
      throw new Error('Unmatched closing parenthesis');
    }
    if (ch === '|') {
      throw new Error('Empty alternation');
    }
    if (ch === '*' || ch === '+' || ch === '?') {
      throw new Error('Unexpected operator "' + ch + '"');
    }

    // Escape sequence
    if (ch === '\\') {
      pos++;
      if (pos >= regex.length) {
        throw new Error('Trailing backslash');
      }
      const escaped = regex[pos];
      pos++;
      return { type: AST_LITERAL, char: escaped };
    }

    // Literal character
    pos++;
    return { type: AST_LITERAL, char: ch };
  }

  const ast = parseExpr(0);
  if (pos < regex.length) {
    if (regex[pos] === ')') {
      throw new Error('Unmatched closing parenthesis');
    }
    throw new Error('Unexpected characters after end of regex');
  }
  return ast;
}

// ── NFA 构建 ──

let _nextId = 0;

/**
 * 重置状态 ID 计数器（测试用）
 */
function resetStateId() {
  _nextId = 0;
}

/**
 * 创建一个新 NFA 状态
 * @param {boolean} isAccept
 * @returns {{ id: number, transitions: object, isAccept: boolean }}
 */
function newState(isAccept) {
  return {
    id: _nextId++,
    transitions: {},
    isAccept: !!isAccept
  };
}

/**
 * 添加 ε 转移
 */
function addEps(state, targetId) {
  if (!state.transitions['ε']) {
    state.transitions['ε'] = [];
  }
  state.transitions['ε'].push(targetId);
}

/**
 * 按 ID 查找状态并添加 ε 转移
 */
function addEpsToState(states, stateId, targetId) {
  const st = findState(states, stateId);
  if (st) {
    addEps(st, targetId);
  }
}

/**
 * 将指定状态设为非接受
 */
function setNonAccept(states, stateId) {
  const st = findState(states, stateId);
  if (st) {
    st.isAccept = false;
  }
}

/**
 * 按 ID 查找状态
 */
function findState(states, id) {
  for (let i = 0; i < states.length; i++) {
    if (states[i].id === id) return states[i];
  }
  return null;
}

/**
 * AST → ε-NFA（Thompson 构造法）
 * @param {object} ast
 * @returns {{ start: number, accept: number, states: object[] }}
 */
function astToNFA(ast) {
  if (!ast || !ast.type) {
    throw new Error('Invalid AST node');
  }

  switch (ast.type) {
    case AST_LITERAL: {
      const start = newState(false);
      const accept = newState(true);
      start.transitions[ast.char] = [accept.id];
      return { start: start.id, accept: accept.id, states: [start, accept] };
    }

    case AST_EPSILON: {
      const start = newState(false);
      const accept = newState(true);
      addEps(start, accept.id);
      return { start: start.id, accept: accept.id, states: [start, accept] };
    }

    case AST_ALT: {
      const left = astToNFA(ast.left);
      const right = astToNFA(ast.right);
      const start = newState(false);
      const accept = newState(true);
      addEps(start, left.start);
      addEps(start, right.start);
      setNonAccept(left.states, left.accept);
      setNonAccept(right.states, right.accept);
      addEpsToState(left.states, left.accept, accept.id);
      addEpsToState(right.states, right.accept, accept.id);
      return {
        start: start.id,
        accept: accept.id,
        states: [start, accept].concat(left.states).concat(right.states)
      };
    }

    case AST_CONCAT: {
      const left = astToNFA(ast.left);
      const right = astToNFA(ast.right);
      setNonAccept(left.states, left.accept);
      addEpsToState(left.states, left.accept, right.start);
      return {
        start: left.start,
        accept: right.accept,
        states: left.states.concat(right.states)
      };
    }

    case AST_STAR: {
      const child = astToNFA(ast.child);
      const start = newState(false);
      const accept = newState(true);
      addEps(start, child.start);
      addEps(start, accept.id);
      setNonAccept(child.states, child.accept);
      addEpsToState(child.states, child.accept, child.start);
      addEpsToState(child.states, child.accept, accept.id);
      return {
        start: start.id,
        accept: accept.id,
        states: [start, accept].concat(child.states)
      };
    }

    case AST_PLUS: {
      // a+ = one or more: like star but no direct ε from start to accept
      const child = astToNFA(ast.child);
      const start = newState(false);
      const accept = newState(true);
      addEps(start, child.start);
      setNonAccept(child.states, child.accept);
      addEpsToState(child.states, child.accept, child.start);
      addEpsToState(child.states, child.accept, accept.id);
      return {
        start: start.id,
        accept: accept.id,
        states: [start, accept].concat(child.states)
      };
    }

    case AST_OPTIONAL: {
      // a? = zero or one: a|ε
      const child = astToNFA(ast.child);
      const start = newState(false);
      const accept = newState(true);
      addEps(start, child.start);
      addEps(start, accept.id);
      setNonAccept(child.states, child.accept);
      addEpsToState(child.states, child.accept, accept.id);
      return {
        start: start.id,
        accept: accept.id,
        states: [start, accept].concat(child.states)
      };
    }

    default:
      throw new Error('Unknown AST node type: ' + ast.type);
  }
}

/**
 * 组合 parseRegex + astToNFA
 * @param {string} regex
 * @returns {{ start: number, accept: number, states: object[] }}
 */
function regexToNFA(regex) {
  resetStateId();
  const ast = parseRegex(regex);
  return astToNFA(ast);
}

module.exports = {
  parseRegex: parseRegex,
  regexToNFA: regexToNFA,
  resetStateId: resetStateId,
  AST_LITERAL: AST_LITERAL,
  AST_CONCAT: AST_CONCAT,
  AST_ALT: AST_ALT,
  AST_STAR: AST_STAR,
  AST_PLUS: AST_PLUS,
  AST_OPTIONAL: AST_OPTIONAL,
  AST_EPSILON: AST_EPSILON
};
