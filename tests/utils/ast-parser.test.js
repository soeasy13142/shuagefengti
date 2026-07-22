const { tokenize, parseExpression, createNode, _resetIdCounter } = require('../../utils/ast-parser');

beforeEach(function() {
  _resetIdCounter();
});

describe('tokenize', function() {
  test('tokenizes simple number', function() {
    var tokens = tokenize('42');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe('NUM');
    expect(tokens[0].lexeme).toBe('42');
  });

  test('tokenizes addition and subtraction', function() {
    var tokens = tokenize('1+2-3');
    expect(tokens).toHaveLength(5);
    expect(tokens[0].type).toBe('NUM'); expect(tokens[0].lexeme).toBe('1');
    expect(tokens[1].type).toBe('ADD'); expect(tokens[1].lexeme).toBe('+');
    expect(tokens[2].type).toBe('NUM'); expect(tokens[2].lexeme).toBe('2');
    expect(tokens[3].type).toBe('SUB'); expect(tokens[3].lexeme).toBe('-');
    expect(tokens[4].type).toBe('NUM'); expect(tokens[4].lexeme).toBe('3');
  });

  test('tokenizes multiplication and division', function() {
    var tokens = tokenize('3*4/2');
    expect(tokens).toHaveLength(5);
    expect(tokens[1].type).toBe('MUL');
    expect(tokens[3].type).toBe('DIV');
  });

  test('tokenizes parentheses', function() {
    var tokens = tokenize('(1+2)*3');
    expect(tokens).toHaveLength(7);
    expect(tokens[0].type).toBe('LPAREN');
    expect(tokens[4].type).toBe('RPAREN');
  });

  test('tokenizes identifiers', function() {
    var tokens = tokenize('x + y');
    expect(tokens).toHaveLength(3);
    expect(tokens[0].type).toBe('ID'); expect(tokens[0].lexeme).toBe('x');
    expect(tokens[2].type).toBe('ID'); expect(tokens[2].lexeme).toBe('y');
  });

  test('skips whitespace', function() {
    var tokens = tokenize('  3  +  4  ');
    expect(tokens).toHaveLength(3);
    expect(tokens[0].lexeme).toBe('3');
  });

  test('throws on unsupported character', function() {
    expect(function() { tokenize('3 ^ 4'); }).toThrow('不支持的字符');
  });
});

describe('parseExpression', function() {
  test('parses simple number', function() {
    var result = parseExpression('42');
    expect(result.tokens).toHaveLength(1);
    expect(result.ast).toBeTruthy();
    expect(result.steps.length).toBeGreaterThan(0);
  });

  test('parses addition: 1+2 produces ADD node', function() {
    var result = parseExpression('1+2');
    expect(result.ast.type).toBe('ADD');
    expect(result.ast.lexeme).toBe('+');
    expect(result.ast.children).toHaveLength(2);
    expect(result.ast.children[0].type).toBe('NUM');
    expect(result.ast.children[0].lexeme).toBe('1');
    expect(result.ast.children[1].type).toBe('NUM');
    expect(result.ast.children[1].lexeme).toBe('2');
  });

  test('multiplication has higher precedence: 3+4*2', function() {
    var result = parseExpression('3+4*2');
    // AST: ADD(NUM(3), MUL(NUM(4), NUM(2)))
    expect(result.ast.type).toBe('ADD');
    expect(result.ast.children[0].type).toBe('NUM');
    expect(result.ast.children[0].lexeme).toBe('3');
    expect(result.ast.children[1].type).toBe('MUL');
    expect(result.ast.children[1].children[0].lexeme).toBe('4');
    expect(result.ast.children[1].children[1].lexeme).toBe('2');
  });

  test('parentheses override precedence: (1+2)*3', function() {
    var result = parseExpression('(1+2)*3');
    // AST: MUL(PAREN(ADD(NUM(1), NUM(2))), NUM(3))
    expect(result.ast.type).toBe('MUL');
    expect(result.ast.children[0].type).toBe('PAREN');
    expect(result.ast.children[0].children[0].type).toBe('ADD');
    expect(result.ast.children[1].type).toBe('NUM');
    expect(result.ast.children[1].lexeme).toBe('3');
  });

  test('parses nested parentheses', function() {
    var result = parseExpression('((3))');
    expect(result.ast.type).toBe('PAREN');
    expect(result.ast.children[0].type).toBe('PAREN');
    expect(result.ast.children[0].children[0].type).toBe('NUM');
    expect(result.ast.children[0].children[0].lexeme).toBe('3');
  });

  test('throws on mismatched parentheses', function() {
    expect(function() { parseExpression('(3+4'); }).toThrow();
  });

  test('throws on empty input', function() {
    expect(function() { parseExpression(''); }).toThrow('请输入表达式');
  });

  test('throws on whitespace-only input', function() {
    expect(function() { parseExpression('   '); }).toThrow('请输入表达式');
  });

  test('rejects too many tokens (>50)', function() {
    var longExpr = Array(30).fill('1+2').join('+');
    expect(function() { parseExpression(longExpr); }).toThrow('表达式过长');
  });

  test('preserves correct token count for 3+4*2', function() {
    var result = parseExpression('3+4*2');
    expect(result.tokens).toHaveLength(5);
    expect(result.tokens[0].type).toBe('NUM'); expect(result.tokens[0].lexeme).toBe('3');
    expect(result.tokens[1].type).toBe('ADD'); expect(result.tokens[1].lexeme).toBe('+');
    expect(result.tokens[2].type).toBe('NUM'); expect(result.tokens[2].lexeme).toBe('4');
    expect(result.tokens[3].type).toBe('MUL'); expect(result.tokens[3].lexeme).toBe('*');
    expect(result.tokens[4].type).toBe('NUM'); expect(result.tokens[4].lexeme).toBe('2');
  });

  test('parses expression with identifier', function() {
    var result = parseExpression('x + 1');
    expect(result.tokens).toHaveLength(3);
    expect(result.tokens[0].type).toBe('ID');
    expect(result.tokens[0].lexeme).toBe('x');
  });

  test('parses division: 7/2', function() {
    var result = parseExpression('7/2');
    expect(result.tokens).toHaveLength(3);
    expect(result.ast.type).toBe('DIV');
    expect(result.ast.children[0].lexeme).toBe('7');
    expect(result.ast.children[1].lexeme).toBe('2');
  });

  test('handles left associativity: 1-2-3', function() {
    var result = parseExpression('1-2-3');
    // AST: SUB(SUB(NUM(1), NUM(2)), NUM(3))
    expect(result.ast.type).toBe('SUB');
    expect(result.ast.children[0].type).toBe('SUB');
    expect(result.ast.children[0].children[0].lexeme).toBe('1');
    expect(result.ast.children[0].children[1].lexeme).toBe('2');
    expect(result.ast.children[1].lexeme).toBe('3');
  });
});

describe('createNode', function() {
  test('creates a node with default values', function() {
    var node = createNode('NUM', '42');
    expect(node.type).toBe('NUM');
    expect(node.lexeme).toBe('42');
    expect(node.children).toEqual([]);
    expect(node.attributes).toEqual({ val: undefined, type: undefined });
    expect(node.id).toBeGreaterThan(0);
  });

  test('creates a node with children', function() {
    var left = createNode('NUM', '1');
    var right = createNode('NUM', '2');
    var node = createNode('ADD', '+', [left, right]);
    expect(node.children).toHaveLength(2);
    expect(node.children[0].lexeme).toBe('1');
    expect(node.children[1].lexeme).toBe('2');
  });
});
