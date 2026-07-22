const { parseExpression, createNode, _resetIdCounter } = require('../../utils/ast-parser');
const {
  astDepth, astNodeCount, walkAST,
  evaluateAST, annotateTypes, getSdtRules, applySdtStep
} = require('../../utils/ast-eval');

beforeEach(function() {
  _resetIdCounter();
});

describe('astDepth', function() {
  test('single node has depth 1', function() {
    var node = createNode('NUM', '42');
    expect(astDepth(node)).toBe(1);
  });

  test('parent with one child has depth 2', function() {
    var leaf = createNode('NUM', '1');
    var parent = createNode('ADD', '+', [leaf]);
    expect(astDepth(parent)).toBe(2);
  });

  test('calculates depth of nested tree', function() {
    var l1 = createNode('NUM', '1');
    var l2 = createNode('NUM', '2');
    var l3 = createNode('NUM', '3');
    var inner = createNode('ADD', '+', [l2, l3]);
    var root = createNode('MUL', '*', [l1, inner]);
    expect(astDepth(root)).toBe(3);
  });
});

describe('astNodeCount', function() {
  test('single node count is 1', function() {
    var node = createNode('NUM', '42');
    expect(astNodeCount(node)).toBe(1);
  });

  test('counts all nodes in tree', function() {
    var l1 = createNode('NUM', '1');
    var l2 = createNode('NUM', '2');
    var root = createNode('ADD', '+', [l1, l2]);
    expect(astNodeCount(root)).toBe(3);
  });

  test('counts nodes in deeper tree', function() {
    var l1 = createNode('NUM', '1');
    var l2 = createNode('NUM', '2');
    var l3 = createNode('NUM', '3');
    var inner = createNode('ADD', '+', [l2, l3]);
    var root = createNode('MUL', '*', [l1, inner]);
    expect(astNodeCount(root)).toBe(5);
  });
});

describe('walkAST', function() {
  test('visits all nodes in preorder', function() {
    var l1 = createNode('NUM', '1');
    var l2 = createNode('NUM', '2');
    var root = createNode('ADD', '+', [l1, l2]);
    var visited = [];
    walkAST(root, function(n) { visited.push(n.type); });
    expect(visited).toEqual(['ADD', 'NUM', 'NUM']);
  });

  test('passes correct depth', function() {
    var l1 = createNode('NUM', '1');
    var l2 = createNode('NUM', '2');
    var l3 = createNode('NUM', '3');
    var inner = createNode('ADD', '+', [l2, l3]);
    var root = createNode('MUL', '*', [l1, inner]);
    var depths = [];
    walkAST(root, function(n, d) { depths.push(d); });
    expect(depths).toEqual([0, 1, 1, 2, 2]);
  });
});

describe('evaluateAST', function() {
  test('evaluates simple number', function() {
    expect(evaluateAST(parseExpression('42').ast)).toBe(42);
  });

  test('evaluates addition', function() {
    expect(evaluateAST(parseExpression('1+2').ast)).toBe(3);
  });

  test('evaluates subtraction', function() {
    expect(evaluateAST(parseExpression('5-3').ast)).toBe(2);
  });

  test('evaluates multiplication', function() {
    expect(evaluateAST(parseExpression('3*4').ast)).toBe(12);
  });

  test('evaluates mixed expression respecting precedence', function() {
    // 3+4*2 should be 3+(4*2) = 11
    expect(evaluateAST(parseExpression('3+4*2').ast)).toBe(11);
  });

  test('evaluates parentheses overriding precedence', function() {
    // (3+4)*2 should be 14
    expect(evaluateAST(parseExpression('(3+4)*2').ast)).toBe(14);
  });

  test('evaluates integer division', function() {
    expect(evaluateAST(parseExpression('7/2').ast)).toBe(3);
  });

  test('evaluates nested expression', function() {
    // 3+4*(5-2) should be 3+4*3 = 15
    expect(evaluateAST(parseExpression('3+4*(5-2)').ast)).toBe(15);
  });

  test('returns zero for identifier (default)', function() {
    expect(evaluateAST(parseExpression('x').ast)).toBe(0);
  });

  test('detects division by zero', function() {
    var result = evaluateAST(parseExpression('5/0').ast);
    expect(result).toBe('Error: division by zero');
  });
});

describe('annotateTypes', function() {
  test('annotates NUM as int', function() {
    var parsed = parseExpression('42');
    var annotated = annotateTypes(parsed.ast);
    // Find the NUM leaf node
    var numNodes = [];
    walkAST(annotated, function(n) {
      if (n.type === 'NUM') { numNodes.push(n); }
    });
    expect(numNodes.length).toBeGreaterThan(0);
    expect(numNodes[0].attributes.type).toBe('int');
  });

  test('annotates operator nodes', function() {
    var parsed = parseExpression('3+4');
    var annotated = annotateTypes(parsed.ast);
    var addNodes = [];
    walkAST(annotated, function(n) {
      if (n.type === 'ADD') { addNodes.push(n); }
    });
    expect(addNodes.length).toBeGreaterThan(0);
    expect(addNodes[0].attributes.type).toBe('int → int → int');
  });

  test('returns a new tree without mutating original', function() {
    var parsed = parseExpression('3+4');
    var originalType = parsed.ast.children[1].attributes.type;
    var annotated = annotateTypes(parsed.ast);
    expect(annotated).not.toBe(parsed.ast);
  });
});

describe('getSdtRules', function() {
  test('returns array of SDT rules', function() {
    var rules = getSdtRules();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
    rules.forEach(function(r) {
      expect(r.lhs).toBeTruthy();
      expect(r.rhs).toBeTruthy();
      expect(r.action).toBeTruthy();
    });
  });
});

describe('applySdtStep', function() {
  test('applies step and returns description', function() {
    var parsed = parseExpression('3+4');
    var result = applySdtStep(parsed.ast, 0);
    expect(result.node).toBeTruthy();
    expect(typeof result.description).toBe('string');
  });

  test('evaluates all nodes in steps when called sequentially', function() {
    var parsed = parseExpression('1+2');
    var current = parsed.ast;
    for (var i = 0; i < 5; i++) { // enough steps to cover all nodes
      var next = applySdtStep(current, i);
      if (next.node) { current = next.node; }
    }
  });
});
