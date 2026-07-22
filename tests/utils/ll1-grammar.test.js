const { parseGrammar, detectLeftRecursion, EPSILON } = require('../../utils/ll1-grammar');

describe('parseGrammar', function() {
  test('parses simple grammar with alternatives', function() {
    var g = parseGrammar('A → a B | c');
    expect(g.nonTerminals.has('A')).toBe(true);
    expect(g.terminals.has('a')).toBe(true);
    expect(g.terminals.has('c')).toBe(true);
    expect(g.terminals.has('B')).toBe(true);
    expect(g.productions).toHaveLength(2);
    expect(g.productions[0].lhs).toBe('A');
    expect(g.productions[0].rhs).toEqual(['a', 'B']);
    expect(g.productions[1].rhs).toEqual(['c']);
    expect(g.startSymbol).toBe('A');
  });

  test('handles epsilon productions', function() {
    var g = parseGrammar('A → a A | ε');
    expect(g.productions).toHaveLength(2);
    expect(g.productions[0].rhs).toEqual(['a', 'A']);
    expect(g.productions[1].rhs).toEqual([]);
  });

  test('handles epsilon keyword', function() {
    var g = parseGrammar('A → a A | epsilon');
    expect(g.productions[1].rhs).toEqual([]);
  });

  test('handles multi-line input with empty lines', function() {
    var g = parseGrammar([
      '',
      '  E → T E\'  ',
      '',
      '  E\' → + T E\' | ε  ',
      ''
    ].join('\n'));
    expect(g.productions).toHaveLength(3);
    expect(g.startSymbol).toBe('E');
  });

  test('parses expression grammar correctly', function() {
    var g = parseGrammar([
      'E → T E\'',
      'E\' → + T E\' | ε',
      'T → F T\'',
      'T\' → * F T\' | ε',
      'F → ( E ) | id'
    ].join('\n'));
    expect(g.nonTerminals.has('E')).toBe(true);
    expect(g.nonTerminals.has("E'")).toBe(true);
    expect(g.nonTerminals.has('T')).toBe(true);
    expect(g.nonTerminals.has("T'")).toBe(true);
    expect(g.nonTerminals.has('F')).toBe(true);
    expect(g.terminals.has('+')).toBe(true);
    expect(g.terminals.has('*')).toBe(true);
    expect(g.terminals.has('(')).toBe(true);
    expect(g.terminals.has(')')).toBe(true);
    expect(g.terminals.has('id')).toBe(true);
    expect(g.productions).toHaveLength(8);
    expect(g.startSymbol).toBe('E');
  });

  test('throws on line without arrow', function() {
    expect(function() { parseGrammar('E T E'); }).toThrow();
  });

  test('throws on empty input', function() {
    expect(function() { parseGrammar(''); }).toThrow();
    expect(function() { parseGrammar('  \n  \n  '); }).toThrow();
  });

  test('supports ASCII arrow ->', function() {
    var g = parseGrammar('A -> a b | c');
    expect(g.nonTerminals.has('A')).toBe(true);
    expect(g.productions[0].rhs).toEqual(['a', 'b']);
    expect(g.productions[1].rhs).toEqual(['c']);
  });

  test('builds production map correctly', function() {
    var g = parseGrammar([
      'E → T E\'',
      'E\' → + T E\' | ε'
    ].join('\n'));
    expect(g.productionMap['E']).toHaveLength(1);
    expect(g.productionMap["E'"]).toHaveLength(2);
  });

  test('single production without alternatives', function() {
    var g = parseGrammar('E → T E\'');
    expect(g.productions).toHaveLength(1);
    expect(g.productions[0].rhs).toEqual(['T', "E'"]);
  });

  test('single epsilon production', function() {
    var g = parseGrammar('A → ε');
    expect(g.productions).toHaveLength(1);
    expect(g.productions[0].rhs).toEqual([]);
  });
});

describe('detectLeftRecursion', function() {
  test('detects immediate left recursion', function() {
    var g = parseGrammar('A → A a | b');
    var result = detectLeftRecursion(g);
    expect(result.hasLeftRecursion).toBe(true);
    expect(result.recursiveSymbols).toContain('A');
  });

  test('no false positive for non-left-recursive grammar', function() {
    var g = parseGrammar([
      'E → T E\'',
      'E\' → + T E\' | ε',
      'T → F T\'',
      'T\' → * F T\' | ε',
      'F → ( E ) | id'
    ].join('\n'));
    var result = detectLeftRecursion(g);
    expect(result.hasLeftRecursion).toBe(false);
    expect(result.recursiveSymbols).toHaveLength(0);
  });

  test('detects left recursion in multiple symbols', function() {
    var g = parseGrammar([
      'A → A a | b',
      'B → B c | d'
    ].join('\n'));
    var result = detectLeftRecursion(g);
    expect(result.hasLeftRecursion).toBe(true);
    expect(result.recursiveSymbols).toContain('A');
    expect(result.recursiveSymbols).toContain('B');
  });
});
