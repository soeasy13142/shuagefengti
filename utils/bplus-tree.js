/**
 * B+ tree class (insert / search / rangeQuery + step generation).
 *
 * Conventions (consistent with Header):
 * - m: order; max m-1 keys per node, max m children per internal node
 * - Leaf split (Convention A): splitIdx = ceil(m/2); promote first key of right leaf
 * - Internal split: splitIdx = ceil(m/2); remove middle key (promoted)
 * - Duplicate key: overwrite
 * - Range query: inclusive lo and hi; lo > hi returns error
 */

const {
  createLeafNode,
  createInternalNode,
  isLeaf,
  isInternal
} = require('./bplus-node');
const { splitLeaf, splitInternal, MAX_KEYS } = require('./bplus-split');

function BPlusTree(m) {
  if (!Number.isInteger(m) || m < 3) {
    throw new Error('B+ tree order m must be an integer >= 3');
  }
  this.m = m;
  this.root = createLeafNode([], null, null);
}

/**
 * Insert key (overwrite if duplicate).
 * @param {number} key
 * @returns {{ root: object, steps: Array }}
 */
BPlusTree.prototype.insert = function(key) {
  const steps = [];
  const splitResult = this._insertIntoLeaf(this.root, key, steps, null, -1);
  if (splitResult) {
    // Root split: create new root
    const newRoot = createInternalNode(
      [splitResult.promotedKey],
      [splitResult.leftNode, splitResult.rightNode]
    );
    this.root = newRoot;
    steps.push({
      type: 'rootSplit',
      promotedKey: splitResult.promotedKey,
      newRoot: newRoot,
      explanation: '根节点分裂，创建新根 [' + splitResult.promotedKey + ']'
    });
  }
  steps.push({ type: 'done', explanation: '插入完成' });
  return { root: this.root, steps: steps };
};

/**
 * Recursively insert key into appropriate leaf; splits bubble up.
 * @returns {object|null} If this node splits, returns { leftNode, rightNode, promotedKey }
 */
BPlusTree.prototype._insertIntoLeaf = function(node, key, steps, parent, childIndex) {
  if (isLeaf(node)) {
    return this._insertIntoGivenLeaf(node, key, steps, parent, childIndex);
  }
  // Internal node: find next child
  const childIdx = this._findChildIndex(node, key);
  steps.push({
    type: 'compare',
    nodeKeys: node.keys.slice(),
    childIndex: childIdx,
    explanation: 'In internal node [' + node.keys.join(', ') + '], descend to child #' + childIdx
  });
  const childSplit = this._insertIntoLeaf(node.children[childIdx], key, steps, node, childIdx);
  if (childSplit) {
    // Child split: keep leftNode in place, insert rightNode at children[childIdx+1]
    // Insert promotedKey at keys[childIdx]
    node.children.splice(childIdx, 1, childSplit.leftNode);
    node.children.splice(childIdx + 1, 0, childSplit.rightNode);
    node.keys.splice(childIdx, 0, childSplit.promotedKey);
    steps.push({
      type: 'split',
      nodeKeys: node.keys.slice(),
      promotedKey: childSplit.promotedKey,
      leftNode: childSplit.leftNode,
      rightNode: childSplit.rightNode,
      explanation: 'Child split; key ' + childSplit.promotedKey + ' promoted to this node'
    });
    // Does this node also overflow?
    if (node.keys.length > MAX_KEYS(this.m)) {
      return this._splitAndPromote(node, steps);
    }
  }
  return null;
};

BPlusTree.prototype._insertIntoGivenLeaf = function(leaf, key, steps, parent, childIndex) {
  // Duplicate key: overwrite
  const existingIdx = leaf.keys.indexOf(key);
  if (existingIdx >= 0) {
    leaf.keys[existingIdx] = key;
    steps.push({
      type: 'insert',
      leafKeys: leaf.keys.slice(),
      explanation: 'key ' + key + ' exists; overwriting'
    });
    return null;
  }
  leaf.keys.push(key);
  leaf.keys.sort(function(a, b) { return a - b; });
  steps.push({
    type: 'insert',
    leafKeys: leaf.keys.slice(),
    explanation: 'Inserted key ' + key + ' into leaf'
  });
  if (leaf.keys.length > MAX_KEYS(this.m)) {
    return this._splitAndPromote(leaf, steps);
  }
  return null;
};

BPlusTree.prototype._splitAndPromote = function(node, steps) {
  if (isLeaf(node)) {
    const split = splitLeaf(node, this.m);
    // Rewire leaf linked list
    split.leftNode.next = split.rightNode;
    split.rightNode.prev = split.leftNode;
    split.leftNode.prev = node.prev;
    split.rightNode.next = node.next;
    if (node.prev) node.prev.next = split.leftNode;
    if (node.next) node.next.prev = split.rightNode;
    steps.push({
      type: 'split',
      promotedKey: split.promotedKey,
      leftNode: split.leftNode,
      rightNode: split.rightNode,
      explanation: '叶子分裂：左 [' + split.leftNode.keys.join(',') +
                  ']，右 [' + split.rightNode.keys.join(',') +
                  ']，提升 ' + split.promotedKey
    });
    return split;
  }
  const split = splitInternal(node, this.m);
  steps.push({
    type: 'split',
    promotedKey: split.promotedKey,
    leftNode: split.leftNode,
    rightNode: split.rightNode,
    explanation: '内部节点分裂，提升 ' + split.promotedKey
  });
  return split;
};

BPlusTree.prototype._findChildIndex = function(internal, key) {
  // Find first i where keys[i] > key; descend to children[i]; if all <= key, use children[keys.length]
  for (let i = 0; i < internal.keys.length; i++) {
    if (key < internal.keys[i]) return i;
  }
  return internal.keys.length;
};

/**
 * Search for key.
 * @param {number} key
 * @returns {{ found: number|null, steps: Array }}
 */
BPlusTree.prototype.search = function(key) {
  const steps = [];
  const found = this._search(this.root, key, steps);
  steps.push({
    type: found === null ? 'not-found' : 'found',
    found: found,
    explanation: found === null ? '未找到 key ' + key : '找到 key ' + found
  });
  return { found: found, steps: steps };
};

BPlusTree.prototype._search = function(node, key, steps) {
  if (isLeaf(node)) {
    steps.push({
      type: 'findLeaf',
      leafKeys: node.keys.slice(),
      explanation: '到达叶子 [' + node.keys.join(',') + ']，查找 ' + key
    });
    const idx = node.keys.indexOf(key);
    if (idx >= 0) return node.keys[idx];
    return null;
  }
  const childIdx = this._findChildIndex(node, key);
  steps.push({
    type: 'compare',
    nodeKeys: node.keys.slice(),
    childIndex: childIdx,
    explanation: '比较 ' + key + ' 与 [' + node.keys.join(',') + ']，走到子节点 #' + childIdx
  });
  return this._search(node.children[childIdx], key, steps);
};

/**
 * Range query [lo, hi] (both inclusive).
 * @param {number} lo
 * @param {number} hi
 * @returns {{ result: number[], leaves: object[], steps: Array, error?: string }}
 */
BPlusTree.prototype.rangeQuery = function(lo, hi) {
  if (lo > hi) {
    return { result: [], leaves: [], steps: [{ type: 'error', explanation: 'lo 必须 ≤ hi' }], error: 'lo must be <= hi' };
  }
  const steps = [];
  const startLeaf = this._findLeaf(this.root, lo);
  steps.push({
    type: 'findLeaf',
    leafKeys: startLeaf.keys.slice(),
    explanation: '找到包含 lo=' + lo + ' 的叶子 [' + startLeaf.keys.join(',') + ']'
  });

  const result = [];
  const visitedLeaves = [];
  let cursor = startLeaf;
  while (cursor) {
    visitedLeaves.push(cursor);
    let addedThisLeaf = 0;
    for (let i = 0; i < cursor.keys.length; i++) {
      if (cursor.keys[i] >= lo && cursor.keys[i] <= hi) {
        result.push(cursor.keys[i]);
        addedThisLeaf++;
      }
      if (cursor.keys[i] > hi) {
        steps.push({
          type: 'walkLeaf',
          leafKeys: cursor.keys.slice(),
          addedCount: addedThisLeaf,
          explanation: '在叶子 [' + cursor.keys.join(',') + '] 中收集 ' + addedThisLeaf + ' 个 key，当前 key 超过 hi=' + hi + '，停止'
        });
        return { result: result, leaves: visitedLeaves, steps: steps };
      }
    }
    steps.push({
      type: 'walkLeaf',
      leafKeys: cursor.keys.slice(),
      addedCount: addedThisLeaf,
      next: cursor.next ? cursor.next.keys.slice() : null,
      explanation: cursor.next
        ? '在叶子 [' + cursor.keys.join(',') + '] 中收集 ' + addedThisLeaf + ' 个 key，沿 next 走到下一叶子'
        : '在叶子 [' + cursor.keys.join(',') + '] 中收集 ' + addedThisLeaf + ' 个 key，已是最后叶子'
    });
    cursor = cursor.next;
  }
  steps.push({ type: 'done', explanation: '范围查询完成，共 ' + result.length + ' 个 key' });
  return { result: result, leaves: visitedLeaves, steps: steps };
};

BPlusTree.prototype._findLeaf = function(node, key) {
  if (isLeaf(node)) return node;
  const childIdx = this._findChildIndex(node, key);
  return this._findLeaf(node.children[childIdx], key);
};

module.exports = { BPlusTree: BPlusTree };
