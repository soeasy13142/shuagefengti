/**
 * AST 构建器 — 求值器 / 树操作 / 语法制导翻译
 *
 * 提供 AST 树遍历工具、表达式求值（SDT）、类型标注。
 * 所有函数为纯函数，不修改输入节点。
 */

/**
 * @typedef {{ id: number, type: string, lexeme?: string, children: ASTNode[], attributes: { val: (number|string|undefined), type: (string|undefined) }, production?: string, stepCreated: number }} ASTNode
 */

const INT_ARROW_TYPE = 'int → int → int';

/**
 * Calculate the depth (height) of an AST
 * @param {ASTNode} node
 * @returns {number}
 */
function astDepth(node) {
  if (!node || !node.children || node.children.length === 0) {
    return 1;
  }
  let maxDepth = 0;
  for (let i = 0; i < node.children.length; i++) {
    const d = astDepth(node.children[i]);
    if (d > maxDepth) { maxDepth = d; }
  }
  return maxDepth + 1;
}

/**
 * Count total number of nodes in the AST
 * @param {ASTNode} node
 * @returns {number}
 */
function astNodeCount(node) {
  if (!node) { return 0; }
  let count = 1;
  for (let i = 0; i < node.children.length; i++) {
    count += astNodeCount(node.children[i]);
  }
  return count;
}

/**
 * Pre-order traversal of AST
 * @param {ASTNode} node
 * @param {function(ASTNode, number): void} callback - callback(node, depth)
 * @param {number} [depth]
 */
function walkAST(node, callback, depth) {
  if (!node) { return; }
  const d = depth || 0;
  callback(node, d);
  for (let i = 0; i < node.children.length; i++) {
    walkAST(node.children[i], callback, d + 1);
  }
}

/**
 * Evaluate an AST expression tree (post-order traversal / SDT).
 * Returns the computed numeric value, or a string error message.
 * @param {ASTNode} node
 * @returns {number|string}
 */
function evaluateAST(node) {
  if (!node) { return 0; }

  switch (node.type) {
    case 'NUM':
      return parseInt(node.lexeme, 10);

    case 'ID':
      return 0; // default uninitialized variable

    case 'ADD': {
      if (node.children.length < 2) { return 0; }
      const l = evaluateAST(node.children[0]);
      const r = evaluateAST(node.children[1]);
      if (typeof l === 'string') { return l; }
      if (typeof r === 'string') { return r; }
      return l + r;
    }

    case 'SUB': {
      if (node.children.length < 2) { return 0; }
      const ls = evaluateAST(node.children[0]);
      const rs = evaluateAST(node.children[1]);
      if (typeof ls === 'string') { return ls; }
      if (typeof rs === 'string') { return rs; }
      return ls - rs;
    }

    case 'MUL': {
      if (node.children.length < 2) { return 0; }
      const lm = evaluateAST(node.children[0]);
      const rm = evaluateAST(node.children[1]);
      if (typeof lm === 'string') { return lm; }
      if (typeof rm === 'string') { return rm; }
      return lm * rm;
    }

    case 'DIV': {
      if (node.children.length < 2) { return 0; }
      const ld = evaluateAST(node.children[0]);
      const rd = evaluateAST(node.children[1]);
      if (typeof ld === 'string') { return ld; }
      if (typeof rd === 'string') { return rd; }
      if (rd === 0) {
        return 'Error: division by zero';
      }
      return Math.floor(ld / rd);
    }

    case 'PAREN': {
      if (node.children.length < 1) { return 0; }
      return evaluateAST(node.children[0]);
    }

    default:
      return 0;
  }
}

/**
 * Annotate types on AST nodes (recursive).
 * Returns a new node with type annotations in attributes without mutating original.
 * @param {ASTNode} node
 * @returns {ASTNode}
 */
function annotateTypes(node) {
  if (!node) { return null; }

  const newNode = {
    id: node.id,
    type: node.type,
    lexeme: node.lexeme,
    children: node.children.map(function(c) { return annotateTypes(c); }),
    attributes: Object.assign({}, node.attributes),
    production: node.production,
    stepCreated: node.stepCreated
  };

  switch (node.type) {
    case 'NUM':
      newNode.attributes.type = 'int';
      break;
    case 'ID':
      newNode.attributes.type = 'int';
      break;
    case 'ADD':
      newNode.attributes.type = INT_ARROW_TYPE;
      break;
    case 'SUB':
      newNode.attributes.type = INT_ARROW_TYPE;
      break;
    case 'MUL':
      newNode.attributes.type = INT_ARROW_TYPE;
      break;
    case 'DIV':
      newNode.attributes.type = INT_ARROW_TYPE;
      break;
    case 'PAREN':
      if (newNode.children.length > 0) {
        newNode.attributes.type = newNode.children[0].attributes.type || 'int';
      }
      break;
    default:
      break;
  }

  return newNode;
}

/**
 * Get SDT semantic rules for display
 * @returns {Array<{ lhs: string, rhs: string, action: string }>}
 */
function getSdtRules() {
  return [
    { lhs: 'E', rhs: 'E1 + T', action: 'E.val = E1.val + T.val' },
    { lhs: 'E', rhs: 'E1 - T', action: 'E.val = E1.val - T.val' },
    { lhs: 'E', rhs: 'T', action: 'E.val = T.val' },
    { lhs: 'T', rhs: 'T1 * F', action: 'T.val = T1.val * F.val' },
    { lhs: 'T', rhs: 'T1 / F', action: 'T.val = T1.val / F.val' },
    { lhs: 'T', rhs: 'F', action: 'T.val = F.val' },
    { lhs: 'F', rhs: '( E )', action: 'F.val = E.val' },
    { lhs: 'F', rhs: 'num', action: 'F.val = num.val' },
    { lhs: 'F', rhs: 'id', action: 'F.val = id.val (default 0)' }
  ];
}

/**
 * Apply a single SDT step to a node.
 * Collects evaluatable nodes in post-order, evaluates the one at stepIndex.
 * Returns updated node (immutable copy) and a description.
 * @param {ASTNode} node
 * @param {number} stepIndex
 * @returns {{ node: ASTNode, description: string }}
 */
function applySdtStep(node, stepIndex) {
  // Collect evaluatable nodes via post-order
  /** @type {ASTNode[]} */
  const evalNodes = [];
  function collectPostOrder(n) {
    if (!n) { return; }
    for (let i = 0; i < n.children.length; i++) {
      collectPostOrder(n.children[i]);
    }
    if (n.type === 'NUM' || n.type === 'ID' || n.type === 'ADD' ||
        n.type === 'SUB' || n.type === 'MUL' || n.type === 'DIV' ||
        n.type === 'PAREN') {
      evalNodes.push(n);
    }
  }
  collectPostOrder(node);

  if (stepIndex >= evalNodes.length) {
    return { node: node, description: '所有节点已求值完毕' };
  }

  const target = evalNodes[stepIndex];
  const val = evaluateAST(target);
  const desc = '节点 ' + target.id + ' (' + target.type +
    (target.lexeme ? ' ' + target.lexeme : '') + ')' + ' → ' + val;

  // Create updated tree with the target node's attributes set
  function updateNode(n) {
    if (!n) { return null; }
    if (n.id === target.id) {
      return {
        id: n.id,
        type: n.type,
        lexeme: n.lexeme,
        children: n.children.map(function(c) { return updateNode(c); }),
        attributes: Object.assign({}, n.attributes, { val: val }),
        production: n.production,
        stepCreated: n.stepCreated
      };
    }
    return {
      id: n.id,
      type: n.type,
      lexeme: n.lexeme,
      children: n.children.map(function(c) { return updateNode(c); }),
      attributes: Object.assign({}, n.attributes),
      production: n.production,
      stepCreated: n.stepCreated
    };
  }

  return { node: updateNode(node), description: desc };
}

module.exports = {
  astDepth: astDepth,
  astNodeCount: astNodeCount,
  walkAST: walkAST,
  evaluateAST: evaluateAST,
  annotateTypes: annotateTypes,
  getSdtRules: getSdtRules,
  applySdtStep: applySdtStep
};
