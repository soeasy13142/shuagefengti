const {
  splitLeaf,
  splitInternal,
  MAX_KEYS,
  MIN_KEYS
} = require('../../utils/bplus-split');
const { createLeafNode, createInternalNode } = require('../../utils/bplus-node');

describe('MAX_KEYS / MIN_KEYS', () => {
  test('m=4: max=3, min=1', () => {
    expect(MAX_KEYS(4)).toBe(3);
    expect(MIN_KEYS(4)).toBe(1);
  });
  test('m=5: max=4, min=2', () => {
    expect(MAX_KEYS(5)).toBe(4);
    expect(MIN_KEYS(5)).toBe(2);
  });
  test('m=8: max=7, min=3', () => {
    expect(MAX_KEYS(8)).toBe(7);
    expect(MIN_KEYS(8)).toBe(3);
  });
});

describe('splitLeaf', () => {
  test('m=4: split [10,20,30,40] into [10,20] and [30,40], promote 30', () => {
    const leaf = createLeafNode([10, 20, 30, 40]);
    const result = splitLeaf(leaf, 4);
    expect(result.leftNode.keys).toEqual([10, 20]);
    expect(result.rightNode.keys).toEqual([30, 40]);
    expect(result.promotedKey).toBe(30);
  });

  test('m=5: split [1,2,3,4,5] into [1,2,3] and [4,5], promote 4', () => {
    const leaf = createLeafNode([1, 2, 3, 4, 5]);
    const result = splitLeaf(leaf, 5);
    expect(result.leftNode.keys).toEqual([1, 2, 3]);
    expect(result.rightNode.keys).toEqual([4, 5]);
    expect(result.promotedKey).toBe(4);
  });

  test('m=8: split 8 keys into 4 + 4', () => {
    const keys = [1, 3, 5, 7, 9, 11, 13, 15];
    const leaf = createLeafNode(keys);
    const result = splitLeaf(leaf, 8);
    expect(result.leftNode.keys).toEqual([1, 3, 5, 7]);
    expect(result.rightNode.keys).toEqual([9, 11, 13, 15]);
    expect(result.promotedKey).toBe(9);
  });

  test('result nodes are fresh (no shared references)', () => {
    const leaf = createLeafNode([1, 2, 3, 4]);
    const result = splitLeaf(leaf, 4);
    expect(result.leftNode).not.toBe(leaf);
    expect(result.rightNode).not.toBe(leaf);
    expect(result.leftNode.keys).not.toBe(leaf.keys);
  });

  test('preserves order in both leaves', () => {
    const leaf = createLeafNode([5, 1, 3, 2]);
    const result = splitLeaf(leaf, 4);
    expect(result.leftNode.keys).toEqual([1, 2]);
    expect(result.rightNode.keys).toEqual([3, 5]);
  });
});

describe('splitInternal', () => {
  test('m=4: split internal with 4 keys + 5 children', () => {
    // 4 keys + 5 children: keys [10,20,30,40], children c0..c4
    const c0 = createLeafNode([1]);
    const c1 = createLeafNode([5]);
    const c2 = createLeafNode([15]);
    const c3 = createLeafNode([25]);
    const c4 = createLeafNode([35]);
    const node = createInternalNode([10, 20, 30, 40], [c0, c1, c2, c3, c4]);
    const result = splitInternal(node, 4);
    // splitIdx = 2; left.keys = [10]; left.children = [c0, c1]; promoted = 20
    // right.keys = [30, 40]; right.children = [c2, c3, c4]
    expect(result.leftNode.keys).toEqual([10]);
    expect(result.leftNode.children).toEqual([c0, c1]);
    expect(result.promotedKey).toBe(20);
    expect(result.rightNode.keys).toEqual([30, 40]);
    expect(result.rightNode.children).toEqual([c2, c3, c4]);
  });

  test('m=5: split internal with 5 keys + 6 children, promote middle', () => {
    const c0 = createLeafNode([1]);
    const c1 = createLeafNode([5]);
    const c2 = createLeafNode([15]);
    const c3 = createLeafNode([25]);
    const c4 = createLeafNode([35]);
    const c5 = createLeafNode([45]);
    const node = createInternalNode([10, 20, 30, 40, 50], [c0, c1, c2, c3, c4, c5]);
    const result = splitInternal(node, 5);
    // splitIdx = 3; left.keys = [10, 20]; left.children = [c0, c1, c2]; promoted = 30
    // right.keys = [40, 50]; right.children = [c3, c4, c5]
    expect(result.leftNode.keys).toEqual([10, 20]);
    expect(result.leftNode.children.length).toBe(3);
    expect(result.promotedKey).toBe(30);
    expect(result.rightNode.keys).toEqual([40, 50]);
    expect(result.rightNode.children.length).toBe(3);
  });

  test('promoted key is not in either child', () => {
    const c0 = createLeafNode([1]);
    const c1 = createLeafNode([5]);
    const c2 = createLeafNode([15]);
    const c3 = createLeafNode([25]);
    const c4 = createLeafNode([35]);
    const node = createInternalNode([10, 20, 30, 40], [c0, c1, c2, c3, c4]);
    const result = splitInternal(node, 4);
    expect(result.leftNode.keys).not.toContain(20);
    expect(result.rightNode.keys).not.toContain(20);
  });

  test('result nodes are fresh', () => {
    const c0 = createLeafNode([1]);
    const c1 = createLeafNode([5]);
    const c2 = createLeafNode([15]);
    const c3 = createLeafNode([25]);
    const c4 = createLeafNode([35]);
    const node = createInternalNode([10, 20, 30, 40], [c0, c1, c2, c3, c4]);
    const result = splitInternal(node, 4);
    expect(result.leftNode).not.toBe(node);
    expect(result.rightNode).not.toBe(node);
  });
});
