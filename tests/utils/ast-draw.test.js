const { createNode, _resetIdCounter } = require('../../utils/ast-parser');
const { layoutTree, NODE_WIDTH, NODE_HEIGHT, H_GAP, V_GAP } = require('../../utils/ast-draw');

beforeEach(function() {
  _resetIdCounter();
});

describe('layoutTree', function() {
  test('returns empty result for null root', function() {
    var result = layoutTree(null);
    expect(result.nodePositions).toEqual({});
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  test('positions a single node', function() {
    var node = createNode('NUM', '42');
    var result = layoutTree(node);
    var keys = Object.keys(result.nodePositions);
    expect(keys).toHaveLength(1);
    var pos = result.nodePositions[node.id];
    expect(pos).toBeTruthy();
    expect(pos.w).toBe(NODE_WIDTH);
    expect(pos.h).toBe(NODE_HEIGHT);
    expect(pos.y).toBe(0);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test('positions parent and child vertically', function() {
    var child = createNode('NUM', '1');
    var parent = createNode('ADD', '+', [child]);
    var result = layoutTree(parent);
    expect(result.nodePositions[parent.id]).toBeTruthy();
    expect(result.nodePositions[child.id]).toBeTruthy();
    // Parent should be above child (smaller y value)
    expect(result.nodePositions[parent.id].y).toBeLessThan(result.nodePositions[child.id].y);
  });

  test('positions two children side by side', function() {
    var left = createNode('NUM', '1');
    var right = createNode('NUM', '2');
    var parent = createNode('ADD', '+', [left, right]);
    var result = layoutTree(parent);
    var leftPos = result.nodePositions[left.id];
    var rightPos = result.nodePositions[right.id];
    // Left should be to the left of right
    expect(leftPos.x).toBeLessThan(rightPos.x);
    // Both children at same depth
    expect(leftPos.y).toBe(rightPos.y);
  });

  test('computes positions for deeper tree', function() {
    var l1 = createNode('NUM', '1');
    var l2 = createNode('NUM', '2');
    var l3 = createNode('NUM', '3');
    var inner = createNode('ADD', '+', [l2, l3]);
    var root = createNode('MUL', '*', [l1, inner]);
    var result = layoutTree(root);
    expect(result.nodePositions[root.id]).toBeTruthy();
    expect(result.nodePositions[inner.id]).toBeTruthy();
    expect(result.nodePositions[l1.id]).toBeTruthy();
    expect(result.nodePositions[l2.id]).toBeTruthy();
    expect(result.nodePositions[l3.id]).toBeTruthy();
    expect(Object.keys(result.nodePositions)).toHaveLength(5);
  });

  test('respects custom options', function() {
    var node = createNode('NUM', '42');
    var result = layoutTree(node, { nodeWidth: 200, nodeHeight: 80, hGap: 100, vGap: 150 });
    expect(result.nodePositions[node.id].w).toBe(200);
    expect(result.nodePositions[node.id].h).toBe(80);
  });

  test('returns non-negative dimensions', function() {
    var left = createNode('NUM', '1');
    var right = createNode('NUM', '2');
    var parent = createNode('ADD', '+', [left, right]);
    var result = layoutTree(parent);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });
});
