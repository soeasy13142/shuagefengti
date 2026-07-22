var { parseGrammar } = require('../../utils/ll1-grammar');
var {
  computeFIRST,
  computeFOLLOW,
  buildParseTable,
  parseInput,
  isLL1,
  buildParseTree,
  EPSILON,
  END_MARKER
} = require('../../utils/ll1-core');

function makeExprGrammar() {
  return parseGrammar([
    'E → T E\'',
    'E\' → + T E\' | ε',
    'T → F T\'',
    'T\' → * F T\' | ε',
    'F → ( E ) | id'
  ].join('\n'));
}

describe('computeFIRST', function() {
  test('terminals have FIRST = {themselves}', function() {
    var g = parseGrammar('A → a');
    var result = computeFIRST(g);
    expect(result.FIRST['a']).toBeDefined();
    expect(result.FIRST['a'].has('a')).toBe(true);
  });

  test('computes FIRST for expression grammar', function() {
    var g = makeExprGrammar();
    var result = computeFIRST(g);
    var FIRST = result.FIRST;

    expect(FIRST['E'].has('(')).toBe(true);
    expect(FIRST['E'].has('id')).toBe(true);
    expect(FIRST['E'].has('+')).toBe(false);
    expect(FIRST['E'].has(EPSILON)).toBe(false);

    expect(FIRST["E'"].has('+')).toBe(true);
    expect(FIRST["E'"].has(EPSILON)).toBe(true);

    expect(FIRST['T'].has('(')).toBe(true);
    expect(FIRST['T'].has('id')).toBe(true);

    expect(FIRST["T'"].has('*')).toBe(true);
    expect(FIRST["T'"].has(EPSILON)).toBe(true);

    expect(FIRST['F'].has('(')).toBe(true);
    expect(FIRST['F'].has('id')).toBe(true);
  });

  test('handles epsilon propagation chain', function() {
    var g = parseGrammar([
      'A → B C',
      'B → ε',
      'C → c'
    ].join('\n'));
    var result = computeFIRST(g);
    var FIRST = result.FIRST;

    expect(FIRST['B'].has(EPSILON)).toBe(true);
    expect(FIRST['A'].has('c')).toBe(true);
    expect(FIRST['A'].has(EPSILON)).toBe(false);
  });

  test('multiple nullable non-terminals with epsilon', function() {
    var g = parseGrammar([
      'S → A B',
      'A → a | ε',
      'B → b | ε'
    ].join('\n'));
    var result = computeFIRST(g);
    var FIRST = result.FIRST;

    expect(FIRST['S'].has('a')).toBe(true);
    expect(FIRST['S'].has('b')).toBe(true);
    expect(FIRST['S'].has(EPSILON)).toBe(true);
  });
});

describe('computeFOLLOW', function() {
  test('start symbol has end marker', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var FOLLOW = followResult.FOLLOW;

    expect(FOLLOW['E'].has(END_MARKER)).toBe(true);
    expect(FOLLOW['E'].has(')')).toBe(true);
    expect(FOLLOW["E'"].has(END_MARKER)).toBe(true);
    expect(FOLLOW["E'"].has(')')).toBe(true);
  });

  test('propagates FOLLOW through epsilon productions', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var FOLLOW = followResult.FOLLOW;

    // T appears in E → T E'. Since E' is nullable, FOLLOW[E] ⊆ FOLLOW[T]
    expect(FOLLOW['T'].has('+')).toBe(true);
    expect(FOLLOW['T'].has(END_MARKER)).toBe(true);
    expect(FOLLOW['T'].has(')')).toBe(true);

    // T' is at end of T → F T', and T' is nullable → FOLLOW[T] ⊆ FOLLOW[T']
    expect(FOLLOW["T'"].has('+')).toBe(true);
    expect(FOLLOW["T'"].has(END_MARKER)).toBe(true);
    expect(FOLLOW["T'"].has(')')).toBe(true);
  });

  test('multi-layer epsilon chain', function() {
    var g = parseGrammar([
      'S → A B',
      'A → a | ε',
      'B → b | ε'
    ].join('\n'));
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var FOLLOW = followResult.FOLLOW;

    expect(FOLLOW['S'].has(END_MARKER)).toBe(true);
    // Since A is nullable, FOLLOW[S] ⊆ FOLLOW[A]
    expect(FOLLOW['A'].has(END_MARKER)).toBe(true);
    expect(FOLLOW['A'].has('b')).toBe(true);
    // B is last in S → A B, so FOLLOW[S] ⊆ FOLLOW[B]
    expect(FOLLOW['B'].has(END_MARKER)).toBe(true);
  });
});

describe('buildParseTable', function() {
  test('builds complete table for expression grammar', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var result = buildParseTable(g, firstResult, followResult);
    var table = result.table;

    // Check specific entries
    expect(table['E']['id']).not.toBeNull();
    expect(table['E']['(']).not.toBeNull();
    expect(table['E']['+']).toBeNull();
    expect(table['E'][END_MARKER]).toBeNull();

    // E' has ε in FOLLOW positions
    expect(table["E'"][END_MARKER]).not.toBeNull();
    expect(table["E'"][')']).not.toBeNull();
    expect(table["E'"]['+']).not.toBeNull();
  });

  test('no conflicts for LL(1) expression grammar', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var result = buildParseTable(g, firstResult, followResult);

    expect(isLL1(result.conflicts)).toBe(true);
  });

  test('detects conflicts in ambiguous grammar', function() {
    var g = parseGrammar('A → a | a');
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var result = buildParseTable(g, firstResult, followResult);

    expect(result.conflicts['A']['a']).toBeDefined();
    expect(result.conflicts['A']['a'].length).toBe(2);
    expect(isLL1(result.conflicts)).toBe(false);
  });

  test('table columns include end marker', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var result = buildParseTable(g, firstResult, followResult);
    var table = result.table;

    // Check that the $ column exists for all non-terminals
    expect(table['E'][END_MARKER]).toBeDefined();
    expect(table["E'"][END_MARKER]).toBeDefined();
    expect(table['T'][END_MARKER]).toBeDefined();
    expect(table["T'"][END_MARKER]).toBeDefined();
    expect(table['F'][END_MARKER]).toBeDefined();
  });
});

describe('parseInput', function() {
  test('accepts valid input string', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var tableResult = buildParseTable(g, firstResult, followResult);
    var parseResult = parseInput(g, tableResult.table, ['id', '+', 'id']);

    expect(parseResult.accepted).toBe(true);
    expect(parseResult.steps.length).toBeGreaterThan(0);
  });

  test('accepts input with parentheses', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var tableResult = buildParseTable(g, firstResult, followResult);
    var parseResult = parseInput(g, tableResult.table, ['(', 'id', '+', 'id', ')']);

    expect(parseResult.accepted).toBe(true);
  });

  test('rejects invalid input string', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var tableResult = buildParseTable(g, firstResult, followResult);
    var parseResult = parseInput(g, tableResult.table, ['id', '+']);

    expect(parseResult.accepted).toBe(false);
  });

  test('steps have correct structure', function() {
    var g = parseGrammar('S → a');
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var tableResult = buildParseTable(g, firstResult, followResult);
    var parseResult = parseInput(g, tableResult.table, ['a']);

    expect(parseResult.steps.length).toBeGreaterThanOrEqual(3);
    expect(parseResult.steps[0].stack).toBeDefined();
    expect(parseResult.steps[0].input).toBeDefined();
    expect(parseResult.steps[0].output).toBeDefined();

    // First step (initial): no action
    expect(parseResult.steps[0].action).toBeNull();

    // Should end with accept
    var last = parseResult.steps[parseResult.steps.length - 1];
    expect(last.action).toBe('accept');
  });

  test('accepts empty string when start symbol is nullable', function() {
    var g = parseGrammar('S → ε');
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var tableResult = buildParseTable(g, firstResult, followResult);
    var parseResult = parseInput(g, tableResult.table, []);

    expect(parseResult.accepted).toBe(true);
  });

  test('handles multiplication expression', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var tableResult = buildParseTable(g, firstResult, followResult);
    var parseResult = parseInput(g, tableResult.table, ['id', '*', 'id']);

    expect(parseResult.accepted).toBe(true);
  });

  test('advanced expression: id + id * id', function() {
    var g = makeExprGrammar();
    var firstResult = computeFIRST(g);
    var followResult = computeFOLLOW(g, firstResult);
    var tableResult = buildParseTable(g, firstResult, followResult);
    var parseResult = parseInput(g, tableResult.table, ['id', '+', 'id', '*', 'id']);

    expect(parseResult.accepted).toBe(true);
    expect(parseResult.steps.length).toBeGreaterThan(10);
  });
});
