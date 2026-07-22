/**
 * Tests for lexer-highlight.js — Syntax highlighting helpers
 */

const {
  CATEGORY_CLASS_MAP,
  tokenTypeToClass,
  tokensToHighlightRanges,
  posToIndex
} = require('../../utils/lexer-highlight');

describe('lexer-highlight: CATEGORY_CLASS_MAP', () => {
  test('has entries for all token categories', () => {
    expect(CATEGORY_CLASS_MAP.keyword).toBe('hl-keyword');
    expect(CATEGORY_CLASS_MAP.identifier).toBe('hl-identifier');
    expect(CATEGORY_CLASS_MAP.literal).toBe('hl-literal');
    expect(CATEGORY_CLASS_MAP.operator).toBe('hl-operator');
    expect(CATEGORY_CLASS_MAP.separator).toBe('hl-separator');
    expect(CATEGORY_CLASS_MAP.comment).toBe('hl-comment');
  });
});

describe('lexer-highlight: tokenTypeToClass()', () => {
  test('returns keyword class for KW_ types', () => {
    expect(tokenTypeToClass('KW_INT')).toBe('hl-keyword');
    expect(tokenTypeToClass('KW_RETURN')).toBe('hl-keyword');
  });

  test('returns identifier class for ID', () => {
    expect(tokenTypeToClass('ID')).toBe('hl-identifier');
  });

  test('returns literal class for NUMBER and STRING', () => {
    expect(tokenTypeToClass('NUMBER')).toBe('hl-literal');
    expect(tokenTypeToClass('STRING')).toBe('hl-literal');
  });

  test('returns operator class for OP_ types', () => {
    expect(tokenTypeToClass('OP_PLUS')).toBe('hl-operator');
    expect(tokenTypeToClass('OP_GE')).toBe('hl-operator');
  });

  test('returns separator class for SEP_ types', () => {
    expect(tokenTypeToClass('SEP_SEMI')).toBe('hl-separator');
    expect(tokenTypeToClass('SEP_LPAREN')).toBe('hl-separator');
  });

  test('returns comment class for COMMENT_ types', () => {
    expect(tokenTypeToClass('COMMENT_LINE')).toBe('hl-comment');
    expect(tokenTypeToClass('COMMENT_BLOCK')).toBe('hl-comment');
  });

  test('returns empty string for unknown type', () => {
    expect(tokenTypeToClass('UNKNOWN')).toBe('');
    expect(tokenTypeToClass('')).toBe('');
  });
});

describe('lexer-highlight: posToIndex()', () => {
  test('converts line 1 col 1 to index 0', () => {
    expect(posToIndex('hello', 1, 1)).toBe(0);
  });

  test('converts line 1 col 3 to index 2', () => {
    expect(posToIndex('hello', 1, 3)).toBe(2);
  });

  test('handles multi-line string', () => {
    expect(posToIndex('abc\ndef', 2, 1)).toBe(4);
    expect(posToIndex('abc\ndef', 2, 2)).toBe(5);
  });

  test('returns -1 for out of range', () => {
    expect(posToIndex('hi', 5, 1)).toBe(-1);
  });

  test('returns -1 for invalid line/col', () => {
    expect(posToIndex('hi', 0, 1)).toBe(-1);
    expect(posToIndex('hi', 1, 0)).toBe(-1);
  });

  test('handles empty string', () => {
    expect(posToIndex('', 1, 1)).toBe(-1);
  });
});

describe('lexer-highlight: tokensToHighlightRanges()', () => {
  test('returns empty array for empty tokens', () => {
    const ranges = tokensToHighlightRanges([], '');
    expect(Array.isArray(ranges)).toBe(true);
    expect(ranges.length).toBe(0);
  });

  test('maps single token to range', () => {
    const tokens = [
      { type: 'KW_INT', lexeme: 'int', line: 1, colStart: 1, colEnd: 4 }
    ];
    const ranges = tokensToHighlightRanges(tokens, 'int');
    expect(ranges.length).toBe(1);
    expect(ranges[0].start).toBe(0);
    expect(ranges[0].end).toBe(3);
    expect(ranges[0].className).toBe('hl-keyword');
    expect(ranges[0].lexeme).toBe('int');
  });

  test('maps multiple tokens in order', () => {
    const tokens = [
      { type: 'KW_INT', lexeme: 'int', line: 1, colStart: 1, colEnd: 4 },
      { type: 'ID', lexeme: 'x', line: 1, colStart: 5, colEnd: 6 },
      { type: 'SEP_SEMI', lexeme: ';', line: 1, colStart: 7, colEnd: 8 }
    ];
    const ranges = tokensToHighlightRanges(tokens, 'int x;');
    expect(ranges.length).toBe(3);
    expect(ranges[0].className).toBe('hl-keyword');
    expect(ranges[1].className).toBe('hl-identifier');
    expect(ranges[2].className).toBe('hl-separator');
  });

  test('skips tokens with unknown type', () => {
    const tokens = [
      { type: 'KW_INT', lexeme: 'int', line: 1, colStart: 1, colEnd: 4 },
      { type: 'UNKNOWN', lexeme: '?', line: 1, colStart: 5, colEnd: 6 }
    ];
    const ranges = tokensToHighlightRanges(tokens, 'int ?');
    expect(ranges.length).toBe(1);
  });
});
