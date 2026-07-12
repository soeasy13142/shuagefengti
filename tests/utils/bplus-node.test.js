const {
  createLeafNode,
  createInternalNode,
  isLeaf,
  isInternal,
  leafCount,
  buildLayout
} = require('../../utils/bplus-node');

describe('createLeafNode', () => {
  test('creates empty leaf with null neighbors', () => {
    const leaf = createLeafNode();
    expect(leaf.type).toBe('leaf');
    expect(leaf.keys).toEqual([]);
    expect(leaf.next).toBeNull();
    expect(leaf.prev).toBeNull();
  });

  test('creates leaf with sorted keys and linked neighbors', () => {
    const a = createLeafNode([1, 3, 5]);
    const b = createLeafNode([7, 9]);
    a.next = b;
    b.prev = a;
    expect(a.keys).toEqual([1, 3, 5]);
    expect(a.next).toBe(b);
    expect(b.prev).toBe(a);
  });
});

describe('createInternalNode', () => {
  test('creates internal with keys and children', () => {
    const left = createLeafNode([1]);
    const right = createLeafNode([5]);
    const node = createInternalNode([3], [left, right]);
    expect(node.type).toBe('internal');
    expect(node.keys).toEqual([3]);
    expect(node.children.length).toBe(2);
  });

  test('throws when children.length !== keys.length + 1', () => {
    const left = createLeafNode([1]);
    const right = createLeafNode([5]);
    expect(() => createInternalNode([3], [left])).toThrow();
    expect(() => createInternalNode([3], [left, right, left])).toThrow();
  });
});

describe('isLeaf / isInternal', () => {
  test('discriminates by type', () => {
    expect(isLeaf(createLeafNode())).toBe(true);
    expect(isInternal(createInternalNode([], [createLeafNode()]))).toBe(true);
    expect(isLeaf(createInternalNode([], [createLeafNode()]))).toBe(false);
  });
});

describe('leafCount', () => {
  test('counts leaves in single-leaf tree', () => {
    expect(leafCount(createLeafNode())).toBe(1);
  });

  test('counts leaves in 2-level tree', () => {
    const l1 = createLeafNode([1, 2]);
    const l2 = createLeafNode([5, 6]);
    const l3 = createLeafNode([9]);
    const root = createInternalNode([4, 7], [l1, l2, l3]);
    expect(leafCount(root)).toBe(3);
  });
});

describe('buildLayout', () => {
  test('empty tree returns empty layout', () => {
    const layout = buildLayout(null);
    expect(layout.levels).toEqual([]);
    expect(layout.edges).toEqual([]);
    expect(layout.leaves).toEqual([]);
    expect(layout.width).toBe(0);
    expect(layout.height).toBe(0);
  });

  test('single leaf returns one level with one node', () => {
    const leaf = createLeafNode([10, 20]);
    const layout = buildLayout(leaf);
    expect(layout.levels.length).toBe(1);
    expect(layout.levels[0].nodes.length).toBe(1);
    expect(layout.levels[0].nodes[0].keys).toEqual([10, 20]);
    expect(layout.leaves.length).toBe(1);
  });

  test('2-level tree has 2 levels with internal above leaves', () => {
    const l1 = createLeafNode([1, 2]);
    const l2 = createLeafNode([5, 6]);
    l1.next = l2;
    l2.prev = l1;
    const root = createInternalNode([3], [l1, l2]);
    const layout = buildLayout(root);
    expect(layout.levels.length).toBe(2);
    expect(layout.levels[0].nodes.length).toBe(1);
    expect(layout.levels[1].nodes.length).toBe(2);
    expect(layout.edges.length).toBe(2);
    expect(layout.leaves.length).toBe(2);
  });

  test('3-level tree has 3 levels and leaf order matches in-order', () => {
    // root -> [a, b, c], each internal has 2 leaves
    const a1 = createLeafNode([1]); const a2 = createLeafNode([3]);
    const b1 = createLeafNode([5]); const b2 = createLeafNode([7]);
    const c1 = createLeafNode([9]); const c2 = createLeafNode([11]);
    const a = createInternalNode([2], [a1, a2]);
    const b = createInternalNode([6], [b1, b2]);
    const c = createInternalNode([10], [c1, c2]);
    const root = createInternalNode([4, 8], [a, b, c]);
    const layout = buildLayout(root);
    expect(layout.levels.length).toBe(3);
    expect(layout.levels[0].nodes.length).toBe(1);
    expect(layout.levels[1].nodes.length).toBe(3);
    expect(layout.levels[2].nodes.length).toBe(6);
    // leaves ordered by x
    const xs = layout.leaves.map(function(l) { return l.x; });
    const sorted = xs.slice().sort(function(a, b) { return a - b; });
    expect(xs).toEqual(sorted);
  });

  test('layout has positive width and height for non-empty tree', () => {
    const l1 = createLeafNode([1]);
    const l2 = createLeafNode([5]);
    const root = createInternalNode([3], [l1, l2]);
    const layout = buildLayout(root);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });
});
