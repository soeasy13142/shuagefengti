/**
 * AST 构建器 — 树形布局坐标计算
 *
 * 使用简化版 Reingold-Tilford 算法计算树节点位置，
 * 输出适合于 WXML 渲染的定位数据。
 */

/**
 * @typedef {{ id: number, type: string, lexeme?: string, children: ASTNode[], attributes: object, production?: string, stepCreated: number }} ASTNode
 */

/**
 * @typedef {{ x: number, y: number, w: number, h: number }} NodePosition
 */

/** 节点宽度 (rpx) */
var NODE_WIDTH = 120;

/** 节点高度 (rpx) */
var NODE_HEIGHT = 60;

/** 兄弟节点水平间距 (rpx) */
var H_GAP = 60;

/** 父子节点垂直间距 (rpx) */
var V_GAP = 100;

/**
 * @typedef {Object} LayoutResult
 * @property {Object<number, NodePosition>} nodePositions - Map of node ID to position
 * @property {number} width - Total width of the layout
 * @property {number} height - Total height of the layout
 */

/**
 * Compute tree layout positions using simplified Reingold-Tilford algorithm.
 * Returns a map of node ID to {x, y, w, h}.
 *
 * @param {ASTNode} root
 * @param {{ nodeWidth?: number, nodeHeight?: number, hGap?: number, vGap?: number }} [options]
 * @returns {LayoutResult}
 */
function layoutTree(root, options) {
  var nodeWidth = (options && options.nodeWidth) || NODE_WIDTH;
  var nodeHeight = (options && options.nodeHeight) || NODE_HEIGHT;
  var hGap = (options && options.hGap) || H_GAP;
  var vGap = (options && options.vGap) || V_GAP;

  if (!root) {
    return { nodePositions: {}, width: 0, height: 0 };
  }

  /** @type {Object<number, NodePosition>} */
  var positions = {};

  // First pass: assign preliminary x positions and mod values
  var modifier = {};

  function firstPass(node, depth) {
    if (!node) { return; }

    if (node.children.length === 0) {
      // Leaf node
      positions[node.id] = { x: 0, y: depth * (nodeHeight + vGap), w: nodeWidth, h: nodeHeight };
      modifier[node.id] = 0;
      return;
    }

    // Process children recursively
    for (var i = 0; i < node.children.length; i++) {
      firstPass(node.children[i], depth + 1);
    }

    // Position this node based on children
    if (node.children.length === 1) {
      // Single child: center parent over child
      var childPos = positions[node.children[0].id];
      positions[node.id] = {
        x: childPos.x,
        y: depth * (nodeHeight + vGap),
        w: nodeWidth,
        h: nodeHeight
      };
      modifier[node.id] = 0;
    } else {
      // Multiple children: average their positions
      var minX = Infinity;
      var maxX = -Infinity;
      for (var j = 0; j < node.children.length; j++) {
        var cp = positions[node.children[j].id];
        if (cp.x < minX) { minX = cp.x; }
        if (cp.x > maxX) { maxX = cp.x; }
      }
      var avgX = (minX + maxX) / 2;
      // Adjust for left-side contour (prevent overlaps)
      var leftContour = minX - nodeWidth / 2;
      var rightContour = maxX + nodeWidth / 2;
      if (leftContour < 0) {
        // Shift entire subtree right
        var shift = -leftContour;
        for (var k = 0; k < node.children.length; k++) {
          positions[node.children[k].id].x += shift;
        }
        avgX += shift;
        rightContour += shift;
      }
      positions[node.id] = {
        x: avgX,
        y: depth * (nodeHeight + vGap),
        w: nodeWidth,
        h: nodeHeight
      };
      modifier[node.id] = 0;
    }
  }

  firstPass(root, 0);

  // Second pass: detect and resolve overlapping subtrees
  function resolveOverlaps(node, depth) {
    if (!node || node.children.length < 2) { return; }

    for (var i = 0; i < node.children.length; i++) {
      resolveOverlaps(node.children[i], depth + 1);
    }

    // Check each pair of adjacent children for overlap
    for (var m = 0; m < node.children.length - 1; m++) {
      // Get right contour of left subtree
      var rightmost = getRightContour(node.children[m], positions);
      // Get left contour of right subtree
      var leftmost = getLeftContour(node.children[m + 1], positions);

      var overlap = rightmost + nodeWidth / 2 + hGap - leftmost;
      if (overlap > 0) {
        // Shift the right subtree right by overlap amount
        shiftSubtree(node.children[m + 1], overlap, positions);
      }
    }

    // Re-center parent over children
    var minX = Infinity;
    var maxX = -Infinity;
    for (var n = 0; n < node.children.length; n++) {
      var cp2 = positions[node.children[n].id];
      if (cp2.x < minX) { minX = cp2.x; }
      if (cp2.x > maxX) { maxX = cp2.x; }
    }
    positions[node.id].x = (minX + maxX) / 2;
  }

  resolveOverlaps(root, 0);

  // Calculate total width and height
  var totalWidth = 0;
  var totalHeight = 0;
  var keys = Object.keys(positions);
  for (var p = 0; p < keys.length; p++) {
    var pos = positions[keys[p]];
    var rightEdge = pos.x + nodeWidth / 2;
    var bottomEdge = pos.y + nodeHeight;
    if (rightEdge > totalWidth) { totalWidth = rightEdge; }
    if (bottomEdge > totalHeight) { totalHeight = bottomEdge; }
  }

  // Get leftmost edge for offset
  var leftmostX = Infinity;
  for (var q = 0; q < keys.length; q++) {
    var leftEdge = positions[keys[q]].x - nodeWidth / 2;
    if (leftEdge < leftmostX) { leftmostX = leftEdge; }
  }

  // Offset all positions to be non-negative
  if (leftmostX < 0) {
    for (var r = 0; r < keys.length; r++) {
      positions[keys[r]].x -= leftmostX;
    }
    totalWidth -= leftmostX;
  }

  return {
    nodePositions: positions,
    width: Math.ceil(totalWidth + nodeWidth / 2),
    height: Math.ceil(totalHeight)
  };
}

/**
 * Get the rightmost X coordinate of a node's subtree
 * @param {ASTNode} node
 * @param {Object<number, NodePosition>} positions
 * @returns {number}
 */
function getRightContour(node, positions) {
  if (!node) { return -Infinity; }
  var pos = positions[node.id];
  if (!pos) { return -Infinity; }
  var rightmost = pos.x;
  for (var i = 0; i < node.children.length; i++) {
    var childRight = getRightContour(node.children[i], positions);
    if (childRight > rightmost) { rightmost = childRight; }
  }
  return rightmost;
}

/**
 * Get the leftmost X coordinate of a node's subtree
 * @param {ASTNode} node
 * @param {Object<number, NodePosition>} positions
 * @returns {number}
 */
function getLeftContour(node, positions) {
  if (!node) { return Infinity; }
  var pos = positions[node.id];
  if (!pos) { return Infinity; }
  var leftmost = pos.x;
  for (var i = 0; i < node.children.length; i++) {
    var childLeft = getLeftContour(node.children[i], positions);
    if (childLeft < leftmost) { leftmost = childLeft; }
  }
  return leftmost;
}

/**
 * Shift an entire subtree by a delta
 * @param {ASTNode} node
 * @param {number} delta
 * @param {Object<number, NodePosition>} positions
 */
function shiftSubtree(node, delta, positions) {
  if (!node) { return; }
  var pos = positions[node.id];
  if (pos) { pos.x += delta; }
  for (var i = 0; i < node.children.length; i++) {
    shiftSubtree(node.children[i], delta, positions);
  }
}

module.exports = {
  layoutTree: layoutTree,
  NODE_WIDTH: NODE_WIDTH,
  NODE_HEIGHT: NODE_HEIGHT,
  H_GAP: H_GAP,
  V_GAP: V_GAP
};
