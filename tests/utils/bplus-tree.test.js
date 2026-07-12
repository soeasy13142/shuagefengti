const { BPlusTree } = require('../../utils/bplus-tree');

describe('BPlusTree constructor', () => {
  test('rejects m < 3', () => {
    expect(function() { return new BPlusTree(2); }).toThrow();
    expect(function() { return new BPlusTree(1); }).toThrow();
  });

  test('initializes empty leaf as root for valid m', () => {
    var tree = new BPlusTree(4);
    expect(tree.root.type).toBe('leaf');
    expect(tree.root.keys).toEqual([]);
  });
});

describe('BPlusTree.insert — basic', () => {
  test('inserts single key into empty tree', () => {
    var tree = new BPlusTree(4);
    var result = tree.insert(10);
    expect(result.root.type).toBe('leaf');
    expect(result.root.keys).toEqual([10]);
  });

  test('inserts multiple keys without split (m=4, 3 keys)', () => {
    var tree = new BPlusTree(4);
    tree.insert(20);
    tree.insert(10);
    tree.insert(30);
    expect(tree.root.type).toBe('leaf');
    expect(tree.root.keys).toEqual([10, 20, 30]);
  });

  test('maintains sorted order in leaf', () => {
    var tree = new BPlusTree(9);
    [50, 10, 80, 30, 20, 70, 40, 60].forEach(function(k) { tree.insert(k); });
    expect(tree.root.type).toBe('leaf');
    expect(tree.root.keys).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
  });
});

describe('BPlusTree.insert — leaf split', () => {
  test('m=4: 4th insert triggers leaf split, root becomes internal', () => {
    var tree = new BPlusTree(4);
    tree.insert(10);
    tree.insert(20);
    tree.insert(30);
    tree.insert(40);
    expect(tree.root.type).toBe('internal');
    expect(tree.root.keys.length).toBe(1);
    expect(tree.root.children.length).toBe(2);
    var leaves = [tree.root.children[0], tree.root.children[1]];
    expect(leaves[0].type).toBe('leaf');
    expect(leaves[1].type).toBe('leaf');
    // Convention A: left = [10,20], right = [30,40], promoted = 30
    expect(leaves[0].keys).toEqual([10, 20]);
    expect(leaves[1].keys).toEqual([30, 40]);
    expect(tree.root.keys[0]).toBe(30);
  });

  test('split sets up leaf linked list (next/prev)', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30, 40].forEach(function(k) { tree.insert(k); });
    var left = tree.root.children[0];
    var right = tree.root.children[1];
    expect(left.next).toBe(right);
    expect(right.prev).toBe(left);
    expect(left.prev).toBeNull();
    expect(right.next).toBeNull();
  });
});

describe('BPlusTree.insert — multi-level split', () => {
  test('m=4: 7 inserts cause root split + internal split', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30, 40, 50, 60, 70].forEach(function(k) { tree.insert(k); });
    // root internal with 2 keys (after multi splits)
    expect(tree.root.type).toBe('internal');
    expect(tree.root.keys.length).toBeGreaterThanOrEqual(2);
    // leaf chain has 3 leaves
    var cursor = tree.root;
    while (cursor.type !== 'leaf') cursor = cursor.children[0];
    var leafCount = 0;
    var c = cursor;
    while (c) { leafCount++; c = c.next; }
    expect(leafCount).toBe(3);
  });

  test('all keys are reachable via in-order leaf traversal', () => {
    var tree = new BPlusTree(4);
    var keys = [10, 20, 30, 40, 50, 60, 70];
    keys.forEach(function(k) { tree.insert(k); });
    var collected = [];
    var leaf = tree.root;
    while (leaf.type !== 'leaf') leaf = leaf.children[0];
    var c = leaf;
    while (c) {
      collected.push.apply(collected, c.keys);
      c = c.next;
    }
    expect(collected).toEqual(keys);
  });
});

describe('BPlusTree.insert — different m values', () => {
  test('m=8 supports 7 keys without split', () => {
    var tree = new BPlusTree(8);
    for (var k = 1; k <= 7; k++) tree.insert(k);
    expect(tree.root.type).toBe('leaf');
    expect(tree.root.keys).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('m=16 supports 15 keys without split', () => {
    var tree = new BPlusTree(16);
    for (var k = 1; k <= 15; k++) tree.insert(k * 2);
    expect(tree.root.type).toBe('leaf');
  });

  test('m=32 supports 31 keys without split', () => {
    var tree = new BPlusTree(32);
    for (var k = 1; k <= 31; k++) tree.insert(k * 3);
    expect(tree.root.type).toBe('leaf');
  });
});

describe('BPlusTree.search', () => {
  test('returns null for empty tree', () => {
    var tree = new BPlusTree(4);
    var result = tree.search(10);
    expect(result.found).toBeNull();
  });

  test('finds existing key', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30].forEach(function(k) { tree.insert(k); });
    var result = tree.search(20);
    expect(result.found).toBe(20);
  });

  test('returns null for missing key', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30].forEach(function(k) { tree.insert(k); });
    var result = tree.search(25);
    expect(result.found).toBeNull();
  });

  test('search works after splits', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30, 40, 50, 60, 70].forEach(function(k) { tree.insert(k); });
    expect(tree.search(10).found).toBe(10);
    expect(tree.search(40).found).toBe(40);
    expect(tree.search(70).found).toBe(70);
    expect(tree.search(25).found).toBeNull();
    expect(tree.search(75).found).toBeNull();
  });

  test('search records path steps', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30, 40, 50].forEach(function(k) { tree.insert(k); });
    var result = tree.search(40);
    expect(result.found).toBe(40);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.some(function(s) { return s.type === 'compare' || s.type === 'found'; })).toBe(true);
  });
});

describe('BPlusTree.rangeQuery', () => {
  test('returns [] for empty tree', () => {
    var tree = new BPlusTree(4);
    var result = tree.rangeQuery(10, 50);
    expect(result.result).toEqual([]);
  });

  test('returns [] when no keys in range', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30].forEach(function(k) { tree.insert(k); });
    var result = tree.rangeQuery(100, 200);
    expect(result.result).toEqual([]);
  });

  test('returns matching keys in single leaf (inclusive bounds)', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30, 40].forEach(function(k) { tree.insert(k); });
    expect(tree.rangeQuery(15, 35).result).toEqual([20, 30]);
    expect(tree.rangeQuery(20, 30).result).toEqual([20, 30]); // both bounds inclusive
    expect(tree.rangeQuery(10, 40).result).toEqual([10, 20, 30, 40]);
  });

  test('returns [] when lo > hi', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30].forEach(function(k) { tree.insert(k); });
    var result = tree.rangeQuery(30, 10);
    expect(result.error).toBeDefined();
    expect(result.result).toEqual([]);
  });

  test('walks leaf linked list across multiple leaves', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30, 40, 50, 60, 70].forEach(function(k) { tree.insert(k); });
    var result = tree.rangeQuery(25, 55);
    expect(result.result).toEqual([30, 40, 50]);
  });

  test('range starting before first key and ending after last', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30, 40, 50].forEach(function(k) { tree.insert(k); });
    var result = tree.rangeQuery(0, 1000);
    expect(result.result).toEqual([10, 20, 30, 40, 50]);
  });

  test('records walkLeaf steps', () => {
    var tree = new BPlusTree(4);
    [10, 20, 30, 40, 50, 60, 70].forEach(function(k) { tree.insert(k); });
    var result = tree.rangeQuery(25, 55);
    expect(result.steps.some(function(s) { return s.type === 'walkLeaf'; })).toBe(true);
  });
});

describe('BPlusTree.insert — duplicate key', () => {
  test('overwrites existing key without changing structure', () => {
    var tree = new BPlusTree(4);
    tree.insert(10);
    tree.insert(20);
    tree.insert(10); // duplicate
    expect(tree.root.keys).toEqual([10, 20]);
    expect(tree.root.keys.length).toBe(2);
  });
});
