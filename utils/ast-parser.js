/**
 * AST 构建器 — 表达式解析器
 *
 * 词法分析 + LL(1) 递归下降解析器，将算术表达式解析为 AST。
 *
 * 文法 (LL(1)):
 *   E  → T E'
 *   E' → + T E' | - T E' | ε
 *   T  → F T'
 *   T' → * F T' | / F T' | ε
 *   F  → ( E ) | num | id
 */

/**
 * @typedef {'NUM'|'ID'|'ADD'|'SUB'|'MUL'|'DIV'|'LPAREN'|'RPAREN'|'ASSIGN'|'E'|'T'|'F'|'EPSILON'|'PAREN'} NodeType
 */

/**
 * @typedef {{ type: string, lexeme: string, line: number, col: number }} Token
 */

/**
 * @typedef {{ id: number, type: string, lexeme?: string, children: ASTNode[], attributes: { val: (number|string|undefined), type: (string|undefined) }, production?: string, stepCreated: number }} ASTNode
 */

/** @type {number} */
let _nextId = 1;

/** Reset internal node ID counter (for testing) */
function _resetIdCounter() {
  _nextId = 1;
}

/**
 * Create an AST node
 * @param {string} type
 * @param {string} [lexeme]
 * @param {ASTNode[]} [children]
 * @returns {ASTNode}
 */
function createNode(type, lexeme, children) {
  const id = _nextId++;
  return {
    id: id,
    type: type,
    lexeme: lexeme || '',
    children: children || [],
    attributes: { val: undefined, type: undefined },
    production: '',
    stepCreated: 0
  };
}

/**
 * Tokenize input string into a token array
 * @param {string} input
 * @returns {Token[]}
 */
function tokenize(input) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;

  function advance() {
    const ch = input[i];
    i++;
    if (ch === '\n') { line++; col = 1; } else { col++; }
    return ch;
  }

  function peekCh() {
    return i < input.length ? input[i] : '\0';
  }

  while (i < input.length) {
    let ch = input[i];

    // Skip whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      advance();
      continue;
    }

    // Number
    if (ch >= '0' && ch <= '9') {
      const startCol = col;
      let numStr = '';
      while (i < input.length && peekCh() >= '0' && peekCh() <= '9') {
        numStr += advance();
      }
      tokens.push({ type: 'NUM', lexeme: numStr, line: line, col: startCol });
      continue;
    }

    // Identifier
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      const startColId = col;
      let idStr = '';
      while (i < input.length && ((peekCh() >= 'a' && peekCh() <= 'z') || (peekCh() >= 'A' && peekCh() <= 'Z') || (peekCh() >= '0' && peekCh() <= '9') || peekCh() === '_')) {
        idStr += advance();
      }
      tokens.push({ type: 'ID', lexeme: idStr, line: line, col: startColId });
      continue;
    }

    switch (ch) {
      case '+':
        tokens.push({ type: 'ADD', lexeme: '+', line: line, col: col });
        advance();
        break;
      case '-':
        tokens.push({ type: 'SUB', lexeme: '-', line: line, col: col });
        advance();
        break;
      case '*':
        tokens.push({ type: 'MUL', lexeme: '*', line: line, col: col });
        advance();
        break;
      case '/':
        tokens.push({ type: 'DIV', lexeme: '/', line: line, col: col });
        advance();
        break;
      case '(':
        tokens.push({ type: 'LPAREN', lexeme: '(', line: line, col: col });
        advance();
        break;
      case ')':
        tokens.push({ type: 'RPAREN', lexeme: ')', line: line, col: col });
        advance();
        break;
      case '=':
        tokens.push({ type: 'ASSIGN', lexeme: '=', line: line, col: col });
        advance();
        break;
      default:
        throw new Error('词法错误：不支持的字符 "' + ch + '"');
    }
  }

  return tokens;
}

/**
 * LL(1) Recursive Descent Parser
 * Produces a clean AST (abstract syntax tree) with only operator and leaf nodes.
 */
function Parser(tokens) {
  this.tokens = tokens;
  this.pos = 0;
  this.steps = [];
}

Parser.prototype._peek = function() {
  return this.pos < this.tokens.length
    ? this.tokens[this.pos]
    : { type: 'EOF', lexeme: '', line: 0, col: 0 };
};

Parser.prototype._consume = function() {
  return this.tokens[this.pos++];
};

Parser.prototype._expect = function(type) {
  const tok = this._peek();
  if (tok.type !== type) {
    const msg = tok.type === 'EOF'
      ? '语法错误：表达式不完整'
      : '语法错误：期望 ' + type + ' 但遇到 "' + tok.lexeme + '"';
    throw new Error(msg);
  }
  return this._consume();
};

/**
 * Parse E → T E'
 * Returns clean AST with operator/leaf nodes only
 */
Parser.prototype.parseE = function() {
  const stepIdx = this.steps.length;
  this.steps.push({ action: 'parse', description: '应用 E → T E\'' });
  const left = this.parseT();
  const result = this.parseEprime(left);
  return result;
};

/**
 * Parse E' → + T E' | - T E' | ε
 * @param {ASTNode} leftOp - The left operand (from T)
 * @returns {ASTNode}
 */
Parser.prototype.parseEprime = function(leftOp) {
  const tok = this._peek();

  if (tok.type === 'ADD' || tok.type === 'SUB') {
    this._consume();
    const opType = tok.type === 'ADD' ? 'ADD' : 'SUB';
    const stepIdx = this.steps.length;
    const right = this.parseT();
    const node = createNode(opType, tok.lexeme, [leftOp, right]);
    node.production = 'E\' → ' + tok.lexeme + ' T E\'';
    node.stepCreated = stepIdx;
    this.steps.push({ action: 'parse', description: '应用 E\' → ' + tok.lexeme + ' T E\'', nodeId: node.id });
    // Chain for left-associativity: remaining operators bind to this node
    return this.parseEprime(node);
  }

  // ε (end of expression)
  return leftOp;
};

/**
 * Parse T → F T'
 * @returns {ASTNode}
 */
Parser.prototype.parseT = function() {
  this.steps.push({ action: 'parse', description: '应用 T → F T\'' });
  const left = this.parseF();
  return this.parseTprime(left);
};

/**
 * Parse T' → * F T' | / F T' | ε
 * @param {ASTNode} leftOp - The left operand (from F)
 * @returns {ASTNode}
 */
Parser.prototype.parseTprime = function(leftOp) {
  const tok = this._peek();

  if (tok.type === 'MUL' || tok.type === 'DIV') {
    this._consume();
    const opType = tok.type === 'MUL' ? 'MUL' : 'DIV';
    const stepIdx = this.steps.length;
    const right = this.parseF();
    const node = createNode(opType, tok.lexeme, [leftOp, right]);
    node.production = 'T\' → ' + tok.lexeme + ' F T\'';
    node.stepCreated = stepIdx;
    this.steps.push({ action: 'parse', description: '应用 T\' → ' + tok.lexeme + ' F T\'', nodeId: node.id });
    // Chain for left-associativity
    return this.parseTprime(node);
  }

  // ε
  return leftOp;
};

/**
 * Parse F → ( E ) | num | id
 * @returns {ASTNode}
 */
Parser.prototype.parseF = function() {
  const tok = this._peek();

  if (tok.type === 'NUM') {
    this._consume();
    const stepIdx = this.steps.length;
    const node = createNode('NUM', tok.lexeme);
    node.production = 'F → num';
    node.stepCreated = stepIdx;
    node.attributes.val = parseInt(tok.lexeme, 10);
    this.steps.push({ action: 'parse', description: '应用 F → num (' + tok.lexeme + ')', nodeId: node.id });
    return node;
  }

  if (tok.type === 'ID') {
    this._consume();
    const stepIdx2 = this.steps.length;
    const idNode = createNode('ID', tok.lexeme);
    idNode.production = 'F → id';
    idNode.stepCreated = stepIdx2;
    idNode.attributes.val = 0;
    this.steps.push({ action: 'parse', description: '应用 F → id (' + tok.lexeme + ')', nodeId: idNode.id });
    return idNode;
  }

  if (tok.type === 'LPAREN') {
    this._consume();
    const stepIdx3 = this.steps.length;
    const inner = this.parseE();
    this._expect('RPAREN');
    const parenNode = createNode('PAREN', '()', [inner]);
    parenNode.production = 'F → ( E )';
    parenNode.stepCreated = stepIdx3;
    this.steps.push({ action: 'parse', description: '应用 F → ( E )', nodeId: parenNode.id });
    return parenNode;
  }

  throw new Error('语法错误：意外的 Token "' + tok.lexeme + '"');
};

/**
 * Parse an arithmetic expression
 * @param {string} input
 * @returns {{ tokens: Token[], ast: ASTNode, steps: object[] }}
 */
function parseExpression(input) {
  if (!input || input.trim() === '') {
    throw new Error('请输入表达式');
  }

  const tokens = tokenize(input);

  if (tokens.length > 50) {
    throw new Error('表达式过长，请简化（最多 50 个 Token）');
  }

  const parser = new Parser(tokens);
  const ast = parser.parseE();

  // Check all tokens consumed
  if (parser.pos < tokens.length) {
    throw new Error('语法错误：多余的 Token "' + tokens[parser.pos].lexeme + '"');
  }

  return { tokens: tokens, ast: ast, steps: parser.steps };
}

module.exports = {
  tokenize: tokenize,
  parseExpression: parseExpression,
  createNode: createNode,
  _resetIdCounter: _resetIdCounter
};
