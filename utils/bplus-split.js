/**
 * B+ tree node split pure functions.
 *
 * Conventions (consistent with Header):
 * - m: order; max m-1 keys per node, max m children per internal node
 * - Leaf split (Convention A): splitIdx = ceil(m/2); left leaf = keys[0..splitIdx-1],
 *   right leaf = keys[splitIdx..m-1], promoted = keys[splitIdx] (still in right leaf).
 * - Internal split: splitIdx = ceil(m/2); left node = keys[0..splitIdx-2],
 *   promoted = keys[splitIdx-1] (removed), right node = keys[splitIdx..m-1].
 */

const { createLeafNode, createInternalNode } = require('./bplus-node');

function MAX_KEYS(m) {
  return m - 1;
}

function MIN_KEYS(m) {
  return Math.ceil(m / 2) - 1;
}

/**
 * Split a leaf node. Returns { leftNode, rightNode, promotedKey }.
 * Caller is responsible for rewiring rightNode into the leaf linked list (next/prev).
 * @param {LeafNode} leaf
 * @param {number} m
 * @returns {{ leftNode: LeafNode, rightNode: LeafNode, promotedKey: number }}
 */
function splitLeaf(leaf, m) {
  if (leaf.type !== 'leaf') {
    throw new Error('splitLeaf requires a leaf node');
  }
  if (leaf.keys.length !== m) {
    throw new Error('splitLeaf called with ' + leaf.keys.length + ' keys, expected ' + m);
  }
  const splitIdx = Math.ceil(m / 2);
  const sortedKeys = leaf.keys.slice().sort(function(a, b) { return a - b; });
  const leftKeys = sortedKeys.slice(0, splitIdx);
  const rightKeys = sortedKeys.slice(splitIdx);
  const promotedKey = rightKeys[0];

  const leftNode = createLeafNode(leftKeys);
  const rightNode = createLeafNode(rightKeys);

  return { leftNode: leftNode, rightNode: rightNode, promotedKey: promotedKey };
}

/**
 * Split an internal node. Returns { leftNode, rightNode, promotedKey }.
 * promotedKey is the "moved-out" middle key and belongs to neither child.
 * @param {InternalNode} node
 * @param {number} m
 * @returns {{ leftNode: InternalNode, rightNode: InternalNode, promotedKey: number }}
 */
function splitInternal(node, m) {
  if (node.type !== 'internal') {
    throw new Error('splitInternal requires an internal node');
  }
  if (node.keys.length !== m) {
    throw new Error('splitInternal called with ' + node.keys.length + ' keys, expected ' + m);
  }
  const splitIdx = Math.ceil(m / 2);
  const leftKeys = node.keys.slice(0, splitIdx - 1);
  const leftChildren = node.children.slice(0, splitIdx);
  const promotedKey = node.keys[splitIdx - 1];
  const rightKeys = node.keys.slice(splitIdx);
  const rightChildren = node.children.slice(splitIdx);

  const leftNode = createInternalNode(leftKeys, leftChildren);
  const rightNode = createInternalNode(rightKeys, rightChildren);

  return { leftNode: leftNode, rightNode: rightNode, promotedKey: promotedKey };
}

module.exports = {
  splitLeaf: splitLeaf,
  splitInternal: splitInternal,
  MAX_KEYS: MAX_KEYS,
  MIN_KEYS: MIN_KEYS
};
