/**
 * Tests for lexer-token.js — Token type definitions + regex rules
 */

const {
  TOKEN_RULES,
  getRules,
  classifyToken
} = require('../../utils/lexer-token');

describe('lexer-token: TOKEN_RULES', () => {
  test('exports TOKEN_RULES as non-empty array', () => {
    expect(Array.isArray(TOKEN_RULES)).toBe(true);
    expect(TOKEN_RULES.length).toBeGreaterThan(0);
  });

  test('each rule has required fields', () => {
    TOKEN_RULES.forEach(function(rule) {
      expect(rule).toHaveProperty('name');
      expect(rule).toHaveProperty('pattern');
      expect(rule).toHaveProperty('priority');
      expect(rule).toHaveProperty('category');
      expect(rule.pattern instanceof RegExp).toBe(true);
    });
  });

  test('keywords match correctly', () => {
    const kwRules = TOKEN_RULES.filter(function(r) { return r.category === 'keyword'; });
    expect(kwRules.length).toBeGreaterThanOrEqual(8);

    // Test each keyword matches its own name
    const kwTests = ['int', 'return', 'if', 'else', 'while', 'for', 'void', 'char', 'float', 'double', 'const', 'struct'];
    kwTests.forEach(function(kw) {
      const matched = kwRules.some(function(r) {
        const m = r.pattern.exec(kw);
        return m && m[0] === kw;
      });
      expect(matched).toBe(true);
    });
  });

  test('keywords do not match identifiers starting with them (\\b boundary)', () => {
    const intRule = TOKEN_RULES.find(function(r) { return r.name === 'KW_INT'; });
    expect(intRule).toBeDefined();
    // \b ensures 'int' doesn't match when followed by another word char
    const m = intRule.pattern.exec('integer');
    expect(m).toBeNull();
    // But matches 'int' when followed by non-word char or end
    const m2 = intRule.pattern.exec('int ');
    expect(m2).not.toBeNull();
    expect(m2[0]).toBe('int');
  });

  test('identifier rule matches valid identifiers', () => {
    const idRule = TOKEN_RULES.find(function(r) { return r.name === 'ID'; });
    expect(idRule).toBeDefined();
    expect(idRule.pattern.exec('foo')[0]).toBe('foo');
    expect(idRule.pattern.exec('_underscore')[0]).toBe('_underscore');
    expect(idRule.pattern.exec('a123')[0]).toBe('a123');
  });

  test('identifier rule does not match starting with digit', () => {
    const idRule = TOKEN_RULES.find(function(r) { return r.name === 'ID'; });
    expect(idRule.pattern.exec('123abc')).toBeNull();
  });

  test('number rule matches integers and decimals', () => {
    const numRule = TOKEN_RULES.find(function(r) { return r.name === 'NUMBER'; });
    expect(numRule).toBeDefined();
    expect(numRule.pattern.exec('42')[0]).toBe('42');
    expect(numRule.pattern.exec('3.14')[0]).toBe('3.14');
    expect(numRule.pattern.exec('0')[0]).toBe('0');
  });

  test('string rule matches double-quoted strings', () => {
    const strRule = TOKEN_RULES.find(function(r) { return r.name === 'STRING'; });
    expect(strRule).toBeDefined();
    expect(strRule.pattern.exec('"hello"')[0]).toBe('"hello"');
    expect(strRule.pattern.exec('"hello\\nworld"')[0]).toBe('"hello\\nworld"');
    expect(strRule.pattern.exec('"escaped\\"quote"')[0]).toBe('"escaped\\"quote"');
  });

  test('string rule does not match unterminated strings', () => {
    const strRule = TOKEN_RULES.find(function(r) { return r.name === 'STRING'; });
    expect(strRule.pattern.exec('"unterminated')).toBeNull();
  });

  test('operator rules match single and multi-character operators', () => {
    const opRules = TOKEN_RULES.filter(function(r) { return r.category === 'operator'; });
    expect(opRules.length).toBeGreaterThan(0);

    // Single char operators: test each with simple operator chars
    const singleOps = ['+', '-', '*', '/', '=', '<', '>', '!', '%', '&', '|', '^', '~'];
    singleOps.forEach(function(op) {
      const matched = opRules.some(function(r) {
        const m = r.pattern.exec(op + ' ');
        return m && m[0] === op;
      });
      expect(matched).toBe(true);
    });
  });

  test('operator rules match multi-char operators correctly', () => {
    // Find rules by matching their regex source against known patterns
    const geRule = TOKEN_RULES.find(function(r) { return r.name === 'OP_GE'; });
    expect(geRule).toBeDefined();
    expect(geRule.pattern.exec('>= ')[0]).toBe('>=');

    const eqRule = TOKEN_RULES.find(function(r) { return r.name === 'OP_EQ'; });
    expect(eqRule).toBeDefined();
    expect(eqRule.pattern.exec('== ')[0]).toBe('==');

    const andRule = TOKEN_RULES.find(function(r) { return r.name === 'OP_AND'; });
    expect(andRule).toBeDefined();
    expect(andRule.pattern.exec('&& ')[0]).toBe('&&');
  });

  test('delimiter rules match parentheses, braces, semicolons etc.', () => {
    const sepRules = TOKEN_RULES.filter(function(r) { return r.category === 'separator'; });
    const sepPatterns = sepRules.map(function(r) { return r.pattern; });

    const delimiters = ['(', ')', '{', '}', ';', ',', '[', ']'];
    delimiters.forEach(function(d) {
      const matched = sepPatterns.some(function(p) {
        return p.exec(d) && p.exec(d)[0] === d;
      });
      expect(matched).toBe(true);
    });
  });

  test('comment rules match single-line and block comments', () => {
    const lineRule = TOKEN_RULES.find(function(r) { return r.name === 'COMMENT_LINE'; });
    const blockRule = TOKEN_RULES.find(function(r) { return r.name === 'COMMENT_BLOCK'; });

    if (lineRule) {
      const m = lineRule.pattern.exec('// this is a comment\n');
      expect(m).not.toBeNull();
      expect(m[0]).toBe('// this is a comment');
    }

    if (blockRule) {
      const m = blockRule.pattern.exec('/* block comment */');
      expect(m).not.toBeNull();
      expect(m[0]).toBe('/* block comment */');
    }
  });
});

describe('lexer-token: getRules()', () => {
  test('returns a copy of TOKEN_RULES', () => {
    const rules = getRules();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBe(TOKEN_RULES.length);
    // Should be a different reference
    expect(rules).not.toBe(TOKEN_RULES);
  });
});

describe('lexer-token: classifyToken()', () => {
  test('classifies keyword types', () => {
    expect(classifyToken('KW_INT')).toBe('keyword');
    expect(classifyToken('KW_RETURN')).toBe('keyword');
    expect(classifyToken('KW_IF')).toBe('keyword');
  });

  test('classifies identifier type', () => {
    expect(classifyToken('ID')).toBe('identifier');
  });

  test('classifies literal types', () => {
    expect(classifyToken('NUMBER')).toBe('literal');
    expect(classifyToken('STRING')).toBe('literal');
  });

  test('classifies operator types', () => {
    expect(classifyToken('OP_PLUS')).toBe('operator');
    expect(classifyToken('OP_GE')).toBe('operator');
  });

  test('classifies separator types', () => {
    expect(classifyToken('SEP_LPAREN')).toBe('separator');
    expect(classifyToken('SEP_SEMI')).toBe('separator');
  });

  test('classifies comment types', () => {
    expect(classifyToken('COMMENT_LINE')).toBe('comment');
    expect(classifyToken('COMMENT_BLOCK')).toBe('comment');
  });

  test('returns null for unknown type', () => {
    expect(classifyToken('UNKNOWN')).toBeNull();
    expect(classifyToken('')).toBeNull();
  });
});
