/**
 * Tests for lexer-engine.js — Core tokenization engine
 */

const { tokenize } = require('../../utils/lexer-engine');

describe('lexer-engine: tokenize() basic', () => {
  test('returns { tokens, errors, steps }', () => {
    const result = tokenize('');
    expect(result).toHaveProperty('tokens');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('steps');
    expect(Array.isArray(result.tokens)).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.steps)).toBe(true);
  });

  test('returns empty results for empty input', () => {
    const result = tokenize('');
    expect(result.tokens.length).toBe(0);
    expect(result.errors.length).toBe(0);
  });

  test('tokenizes basic variable declaration', () => {
    const result = tokenize('int x = 42;');
    expect(result.tokens.length).toBe(5);
    expect(result.tokens[0].type).toBe('KW_INT');
    expect(result.tokens[0].lexeme).toBe('int');
    expect(result.tokens[1].type).toBe('ID');
    expect(result.tokens[1].lexeme).toBe('x');
    expect(result.tokens[2].type).toBe('OP_ASSIGN');
    expect(result.tokens[2].lexeme).toBe('=');
    expect(result.tokens[3].type).toBe('NUMBER');
    expect(result.tokens[3].lexeme).toBe('42');
    expect(result.tokens[4].type).toBe('SEP_SEMI');
    expect(result.tokens[4].lexeme).toBe(';');
  });

  test('tokenizes function definition', () => {
    const result = tokenize('int main() { return 42; }');
    // int, main, (, ), {, return, 42, ;, } = 9 tokens
    expect(result.tokens.length).toBe(9);
    expect(result.tokens[0].type).toBe('KW_INT');
    expect(result.tokens[1].type).toBe('ID');
    expect(result.tokens[1].lexeme).toBe('main');
    expect(result.tokens[2].type).toBe('SEP_LPAREN');
    expect(result.tokens[3].type).toBe('SEP_RPAREN');
    expect(result.tokens[4].type).toBe('SEP_LBRACE');
    expect(result.tokens[5].type).toBe('KW_RETURN');
    expect(result.tokens[6].type).toBe('NUMBER');
    expect(result.tokens[6].lexeme).toBe('42');
    expect(result.tokens[7].type).toBe('SEP_SEMI');
    expect(result.tokens[8].type).toBe('SEP_RBRACE');
  });
});

describe('lexer-engine: longest match', () => {
  test('>= is matched as one operator token', () => {
    const result = tokenize('a >= b');
    // tokens: ID('a'), OPERATOR('>='), ID('b')
    expect(result.tokens.length).toBe(3);
    expect(result.tokens[1].type).toBe('OP_GE');
    expect(result.tokens[1].lexeme).toBe('>=');
  });

  test('== is matched as one operator token', () => {
    const result = tokenize('a == b');
    expect(result.tokens[1].type).toBe('OP_EQ');
    expect(result.tokens[1].lexeme).toBe('==');
  });

  test('&& is matched as one operator token', () => {
    const result = tokenize('a && b');
    expect(result.tokens[1].type).toBe('OP_AND');
    expect(result.tokens[1].lexeme).toBe('&&');
  });

  test('|| is matched as one operator token', () => {
    const result = tokenize('a || b');
    expect(result.tokens[1].type).toBe('OP_OR');
    expect(result.tokens[1].lexeme).toBe('||');
  });

  test('<= is matched as one operator token', () => {
    const result = tokenize('a <= b');
    expect(result.tokens[1].type).toBe('OP_LE');
    expect(result.tokens[1].lexeme).toBe('<=');
  });

  test('!= is matched as one operator token', () => {
    const result = tokenize('a != b');
    expect(result.tokens[1].type).toBe('OP_NE');
    expect(result.tokens[1].lexeme).toBe('!=');
  });
});

describe('lexer-engine: comments', () => {
  test('skips single-line comment', () => {
    const result = tokenize('// comment\nint x');
    expect(result.tokens.length).toBe(2);
    expect(result.tokens[0].type).toBe('KW_INT');
    expect(result.tokens[1].type).toBe('ID');
    expect(result.tokens[1].lexeme).toBe('x');
  });

  test('skips block comment', () => {
    const result = tokenize('/* comment */ int x');
    expect(result.tokens.length).toBe(2);
    expect(result.tokens[0].type).toBe('KW_INT');
    expect(result.tokens[1].type).toBe('ID');
    expect(result.tokens[1].lexeme).toBe('x');
  });

  test('skips block comment with inner content', () => {
    const result = tokenize('/* int x = 42; */ int y');
    expect(result.tokens.length).toBe(2);
  });

  test('handles comment at end of input', () => {
    const result = tokenize('int x // trailing comment');
    expect(result.tokens.length).toBe(2);
  });
});

describe('lexer-engine: whitespace handling', () => {
  test('skips spaces and tabs', () => {
    const result = tokenize('int\t  x');
    expect(result.tokens.length).toBe(2);
    expect(result.tokens[0].lexeme).toBe('int');
    expect(result.tokens[1].lexeme).toBe('x');
  });

  test('skips newlines', () => {
    const result = tokenize('int\nx\n');
    expect(result.tokens.length).toBe(2);
  });

  test('handles multiple blank lines', () => {
    const result = tokenize('int\n\n\nx');
    expect(result.tokens.length).toBe(2);
  });
});

describe('lexer-engine: string literals', () => {
  test('recognizes string literal', () => {
    const result = tokenize('"hello world"');
    expect(result.tokens.length).toBe(1);
    expect(result.tokens[0].type).toBe('STRING');
    expect(result.tokens[0].lexeme).toBe('"hello world"');
  });

  test('recognizes string with escape sequences', () => {
    const result = tokenize('"hello\\nworld"');
    expect(result.tokens.length).toBe(1);
    expect(result.tokens[0].lexeme).toBe('"hello\\nworld"');
  });
});

describe('lexer-engine: error handling', () => {
  test('reports illegal character (@)', () => {
    const result = tokenize('int @ x');
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].char).toBe('@');
    // Tokenization should still produce surrounding tokens
    expect(result.tokens.length).toBe(2); // int, x
  });

  test('reports multiple illegal characters', () => {
    const result = tokenize('int @ # x');
    expect(result.errors.length).toBe(2);
    expect(result.errors[0].char).toBe('@');
    expect(result.errors[1].char).toBe('#');
  });

  test('illegal character has position info', () => {
    const result = tokenize('@');
    expect(result.errors[0]).toHaveProperty('line');
    expect(result.errors[0]).toHaveProperty('col');
    expect(result.errors[0]).toHaveProperty('char');
    expect(result.errors[0]).toHaveProperty('message');
  });
});

describe('lexer-engine: token position info', () => {
  test('each token has position metadata', () => {
    const result = tokenize('int x;');
    result.tokens.forEach(function(t) {
      expect(t).toHaveProperty('type');
      expect(t).toHaveProperty('lexeme');
      expect(t).toHaveProperty('line');
      expect(t).toHaveProperty('colStart');
      expect(t).toHaveProperty('colEnd');
    });
  });

  test('tokens have correct line/col positions', () => {
    const result = tokenize('int x;');
    expect(result.tokens[0].line).toBe(1);
    expect(result.tokens[0].colStart).toBe(1);
    expect(result.tokens[0].colEnd).toBe(4);
    expect(result.tokens[1].line).toBe(1);
    expect(result.tokens[1].colStart).toBe(5);
    expect(result.tokens[1].colEnd).toBe(6);
    expect(result.tokens[2].line).toBe(1);
    expect(result.tokens[2].colStart).toBe(6);
    expect(result.tokens[2].colEnd).toBe(7);
  });

  test('multi-line input tracks line numbers', () => {
    const result = tokenize('int\nreturn');
    expect(result.tokens[0].line).toBe(1);
    expect(result.tokens[1].line).toBe(2);
  });
});

describe('lexer-engine: steps', () => {
  test('produces step records for animation', () => {
    const result = tokenize('int');
    expect(result.steps.length).toBeGreaterThan(0);
    result.steps.forEach(function(s) {
      expect(s).toHaveProperty('sourceIndex');
      expect(s).toHaveProperty('buffer');
    });
  });

  test('first step starts at sourceIndex 0', () => {
    const result = tokenize('int');
    expect(result.steps[0].sourceIndex).toBe(0);
  });

  test('last step ends at end of source', () => {
    const result = tokenize('int');
    var steps = result.steps;
    var lastStep = steps[steps.length - 1];
    expect(lastStep.sourceIndex).toBe(3);
  });
});

describe('lexer-engine: more complex cases', () => {
  test('expression with mixed operators', () => {
    const result = tokenize('x + y * 3');
    expect(result.tokens.length).toBe(5);
    expect(result.tokens[0].lexeme).toBe('x');
    expect(result.tokens[1].lexeme).toBe('+');
    expect(result.tokens[2].lexeme).toBe('y');
    expect(result.tokens[3].lexeme).toBe('*');
    expect(result.tokens[4].lexeme).toBe('3');
  });

  test('condition expression', () => {
    const result = tokenize('if (a >= b)');
    expect(result.tokens.length).toBe(6);
    expect(result.tokens[0].type).toBe('KW_IF');
    expect(result.tokens[1].type).toBe('SEP_LPAREN');
    expect(result.tokens[2].type).toBe('ID');
    expect(result.tokens[2].lexeme).toBe('a');
    expect(result.tokens[3].type).toBe('OP_GE');
    expect(result.tokens[4].type).toBe('ID');
    expect(result.tokens[4].lexeme).toBe('b');
    expect(result.tokens[5].type).toBe('SEP_RPAREN');
  });

  test('for loop header', () => {
    const result = tokenize('for (i = 0; i < 10; i = i + 1)');
    expect(result.tokens.length).toBe(16);
    expect(result.tokens[0].type).toBe('KW_FOR');
  });

  test('number with decimal point', () => {
    const result = tokenize('float x = 3.14;');
    expect(result.tokens.length).toBe(5);
    expect(result.tokens[3].type).toBe('NUMBER');
    expect(result.tokens[3].lexeme).toBe('3.14');
  });
});

describe('lexer-engine: error edge cases', () => {
  test('unclosed block comment at EOF', () => {
    const result = tokenize('/* unclosed');
    // Should produce an error for unclosed comment
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0].message).toMatch(/未闭合/);
  });

  test('custom rules parameter overrides default', () => {
    const customRules = [
      { name: 'FOO', pattern: /^foo/, priority: 1, category: 'keyword' }
    ];
    const result = tokenize('foo bar', customRules);
    expect(result.tokens.length).toBe(1);
    expect(result.tokens[0].type).toBe('FOO');
    // 'bar' doesn't match any custom rule, should be an error
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });
});
