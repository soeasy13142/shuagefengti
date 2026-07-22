/**
 * Tests for lexer-symbol-table.js — Symbol table management
 */

const { buildSymbolTable } = require('../../utils/lexer-symbol-table');

describe('lexer-symbol-table: buildSymbolTable()', () => {
  test('returns empty array for empty token list', () => {
    const table = buildSymbolTable([]);
    expect(Array.isArray(table)).toBe(true);
    expect(table.length).toBe(0);
  });

  test('returns empty array when no identifiers present', () => {
    const tokens = [
      { type: 'KW_INT', lexeme: 'int', line: 1, colStart: 1, colEnd: 4 },
      { type: 'SEP_SEMI', lexeme: ';', line: 1, colStart: 5, colEnd: 6 }
    ];
    const table = buildSymbolTable(tokens);
    expect(table.length).toBe(0);
  });

  test('collects single identifier', () => {
    const tokens = [
      { type: 'KW_INT', lexeme: 'int', line: 1, colStart: 1, colEnd: 4 },
      { type: 'ID', lexeme: 'x', line: 1, colStart: 5, colEnd: 6 },
      { type: 'SEP_SEMI', lexeme: ';', line: 1, colStart: 6, colEnd: 7 }
    ];
    const table = buildSymbolTable(tokens);
    expect(table.length).toBe(1);
    expect(table[0].name).toBe('x');
    expect(table[0].count).toBe(1);
    expect(table[0].occurrences.length).toBe(1);
  });

  test('deduplicates same identifier', () => {
    const tokens = [
      { type: 'KW_INT', lexeme: 'int', line: 1, colStart: 1, colEnd: 4 },
      { type: 'ID', lexeme: 'x', line: 1, colStart: 5, colEnd: 6 },
      { type: 'OP_ASSIGN', lexeme: '=', line: 1, colStart: 7, colEnd: 8 },
      { type: 'NUMBER', lexeme: '1', line: 1, colStart: 9, colEnd: 10 },
      { type: 'SEP_SEMI', lexeme: ';', line: 1, colStart: 10, colEnd: 11 },
      { type: 'ID', lexeme: 'x', line: 2, colStart: 1, colEnd: 2 },
      { type: 'SEP_SEMI', lexeme: ';', line: 2, colStart: 2, colEnd: 3 }
    ];
    const table = buildSymbolTable(tokens);
    expect(table.length).toBe(1);
    expect(table[0].name).toBe('x');
    expect(table[0].count).toBe(2);
    expect(table[0].occurrences.length).toBe(2);
  });

  test('collects multiple identifiers', () => {
    const tokens = [
      { type: 'KW_INT', lexeme: 'int', line: 1, colStart: 1, colEnd: 4 },
      { type: 'ID', lexeme: 'a', line: 1, colStart: 5, colEnd: 6 },
      { type: 'SEP_SEMI', lexeme: ';', line: 1, colStart: 6, colEnd: 7 },
      { type: 'KW_INT', lexeme: 'int', line: 2, colStart: 1, colEnd: 4 },
      { type: 'ID', lexeme: 'b', line: 2, colStart: 5, colEnd: 6 },
      { type: 'SEP_SEMI', lexeme: ';', line: 2, colStart: 6, colEnd: 7 }
    ];
    const table = buildSymbolTable(tokens);
    expect(table.length).toBe(2);
    expect(table[0].name).toBe('a');
    expect(table[1].name).toBe('b');
  });

  test('collects occurrences with line and col info', () => {
    const tokens = [
      { type: 'ID', lexeme: 'result', line: 3, colStart: 5, colEnd: 11 },
      { type: 'ID', lexeme: 'result', line: 5, colStart: 1, colEnd: 7 }
    ];
    const table = buildSymbolTable(tokens);
    expect(table.length).toBe(1);
    expect(table[0].occurrences[0]).toEqual({ line: 3, col: 5 });
    expect(table[0].occurrences[1]).toEqual({ line: 5, col: 1 });
  });

  test('sorts by first occurrence line number', () => {
    const tokens = [
      { type: 'ID', lexeme: 'b', line: 2, colStart: 1, colEnd: 2 },
      { type: 'ID', lexeme: 'a', line: 1, colStart: 1, colEnd: 2 },
      { type: 'ID', lexeme: 'c', line: 3, colStart: 1, colEnd: 2 }
    ];
    const table = buildSymbolTable(tokens);
    expect(table.length).toBe(3);
    expect(table[0].name).toBe('a');
    expect(table[1].name).toBe('b');
    expect(table[2].name).toBe('c');
  });

  test('each entry has correct shape', () => {
    const tokens = [
      { type: 'ID', lexeme: 'counter', line: 1, colStart: 1, colEnd: 8 }
    ];
    const table = buildSymbolTable(tokens);
    expect(table[0]).toHaveProperty('name');
    expect(table[0]).toHaveProperty('occurrences');
    expect(table[0]).toHaveProperty('count');
    expect(table[0].name).toBe('counter');
    expect(table[0].count).toBe(1);
  });

  test('ignores non-identifier tokens', () => {
    const tokens = [
      { type: 'KW_RETURN', lexeme: 'return', line: 1, colStart: 1, colEnd: 7 },
      { type: 'NUMBER', lexeme: '0', line: 1, colStart: 8, colEnd: 9 },
      { type: 'SEP_SEMI', lexeme: ';', line: 1, colStart: 9, colEnd: 10 }
    ];
    const table = buildSymbolTable(tokens);
    expect(table.length).toBe(0);
  });
});
