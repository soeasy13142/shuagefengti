/**
 * B+ tree node data structures + layout algorithm.
 *
 * Node types:
 * - LeafNode: { type: 'leaf', keys, next, prev }
 * - InternalNode: { type: 'internal', keys, children }  // children.length = keys.length + 1
 */

const NODE_H_GAP = 90;
const NODE_V_GAP = 100;

function createLeafNode(keys, next, prev) {
  keys = keys || [];
  next = next === undefined ? null : next;
  prev = prev === undefined ? null : prev;
  return {
    type: 'leaf',
    keys: keys.slice().sort(function(a, b) { return a - b; }),
    next: next,
    prev: prev
  };
}

function createInternalNode(keys, children) {
  keys = keys || [];
  children = children || [];
  if (children.length !== keys.length + 1) {
    throw new Error('InternalNode: children.length must equal keys.length + 1');
  }
  return {
    type: 'internal',
    keys: keys.slice(),
    children: children.slice()
  };
}

function isLeaf(node) {
  return node !== null && node !== undefined && node.type === 'leaf';
}

function isInternal(node) {
  return node !== null && node !== undefined && node.type === 'internal';
}

function leafCount(root) {
  if (!root) return 0;
  if (isLeaf(root)) return 1;
  var count = 0;
  for (var i = 0; i < root.children.length; i++) {
    count += leafCount(root.children[i]);
  }
  return count;
}

/**
 * Compute positions of all nodes for WXML rendering.
 * Algorithm: assign x to leaves (in next-pointer order), then internal x = mean of children x.
 * @param {object|null} root
 * @returns {{ levels, edges, leaves, width, height }}
 */
function buildLayout(root) {
  if (!root) return { levels: [], edges: [], leaves: [], width: 0, height: 0 };

  var levels = [];
  var edges = [];
  var leaves = [];

  // Pass 1: collect leaves in left-to-right order via in-order tree traversal
  function collectLeavesInOrder(node) {
    if (isLeaf(node)) {
      leaves.push(node);
      return;
    }
    if (isInternal(node)) {
      for (var i = 0; i < node.children.length; i++) {
        collectLeavesInOrder(node.children[i]);
      }
    }
  }
  collectLeavesInOrder(root);

  // assign x to leaves
  leaves.forEach(function(leaf, idx) {
    leaf._layoutX = idx * NODE_H_GAP;
    leaf._layoutY = (depthOf(root, leaf)) * NODE_V_GAP;
  });

  // assign x to internals: mean of children x, y = children y - NODE_V_GAP
  function assignInternalX(node) {
    if (isLeaf(node)) return;
    for (var i = 0; i < node.children.length; i++) {
      assignInternalX(node.children[i]);
    }
    var sum = 0;
    for (var i = 0; i < node.children.length; i++) {
      sum += node.children[i]._layoutX;
    }
    node._layoutX = sum / node.children.length;
    node._layoutY = node.children[0]._layoutY - NODE_V_GAP;
  }
  assignInternalX(root);

  // Pass 2: cluster by y coordinate into levels
  var byY = new Map();
  function collect(node) {
    if (!node) return;
    if (!byY.has(node._layoutY)) byY.set(node._layoutY, []);
    byY.get(node._layoutY).push(node);
    if (isInternal(node)) {
      for (var i = 0; i < node.children.length; i++) collect(node.children[i]);
    }
  }
  collect(root);

  var sortedYs = Array.from(byY.keys()).sort(function(a, b) { return a - b; });
  var nodeIdCounter = 0;
  sortedYs.forEach(function(y, levelIdx) {
    var nodes = byY.get(y).slice().sort(function(a, b) { return a._layoutX - b._layoutX; });
    var level = { y: y, nodes: nodes.map(function(n) {
      return {
        id: 'n' + (nodeIdCounter++),
        keys: n.keys.slice(),
        x: n._layoutX,
        type: n.type,
        ref: n
      };
    }) };
    levels.push(level);
  });

  // compute edges: one per internal->child connection
  function buildEdges(node) {
    if (!isInternal(node)) return;
    var parentLevel = levels.find(function(lvl) { return lvl.nodes.some(function(n) { return n.ref === node; }); });
    if (!parentLevel) return;
    var parentNode = parentLevel.nodes.find(function(n) { return n.ref === node; });
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      var childLevel = levels.find(function(lvl) { return lvl.nodes.some(function(n) { return n.ref === child; }); });
      if (!childLevel) continue;
      var childNode = childLevel.nodes.find(function(n) { return n.ref === child; });
      edges.push({
        x1: parentNode.x, y1: parentNode.ref._layoutY,
        x2: childNode.x, y2: childNode.ref._layoutY
      });
      buildEdges(child);
    }
  }
  buildEdges(root);

  // compute width/height
  var minX = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (var i = 0; i < levels.length; i++) {
    for (var j = 0; j < levels[i].nodes.length; j++) {
      var n = levels[i].nodes[j];
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
    }
    if (levels[i].y > maxY) maxY = levels[i].y;
  }
  var width = levels.length > 0 ? maxX - minX + NODE_H_GAP : 0;
  var height = levels.length > 0 ? maxY + NODE_V_GAP : 0;

  return { levels: levels, edges: edges, leaves: leaves, width: width, height: height };
}

function depthOf(root, target) {
  return _depthOf(root, target, 0);
}

function _depthOf(node, target, d) {
  if (node === target) return d;
  if (isInternal(node)) {
    for (var i = 0; i < node.children.length; i++) {
      var found = _depthOf(node.children[i], target, d + 1);
      if (found >= 0) return found;
    }
  }
  return -1;
}

module.exports = {
  createLeafNode: createLeafNode,
  createInternalNode: createInternalNode,
  isLeaf: isLeaf,
  isInternal: isInternal,
  leafCount: leafCount,
  buildLayout: buildLayout,
  NODE_H_GAP: NODE_H_GAP,
  NODE_V_GAP: NODE_V_GAP
};
