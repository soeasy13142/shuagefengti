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
const NODE_WIDTH = 120;

/** 节点高度 (rpx) */
const NODE_HEIGHT = 60;

/** 兄弟节点水平间距 (rpx) */
const H_GAP = 60;

/** 父子节点垂直间距 (rpx) */
const V_GAP = 100;

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
  const nodeWidth = (options && options.nodeWidth) || NODE_WIDTH;
  const nodeHeight = (options && options.nodeHeight) || NODE_HEIGHT;
  const hGap = (options && options.hGap) || H_GAP;
  const vGap = (options && options.vGap) || V_GAP;

  if (!root) {
    return { nodePositions: {}, width: 0, height: 0 };
  }

  const positions = _firstPass(root, 0, nodeWidth, nodeHeight, vGap);
  const resolvedPositions = _resolveOverlaps(root, 0, positions, nodeWidth, nodeHeight, hGap);
  const { positions: finalPositions, width: totalWidth, height: totalHeight } = _calculateBounds(resolvedPositions, nodeWidth, nodeHeight);

  return {
    nodePositions: finalPositions,
    width: Math.ceil(totalWidth + nodeWidth / 2),
    height: Math.ceil(totalHeight)
  };
}

/**
 * First pass: assign preliminary x positions using a simplified Reingold-Tilford approach.
 * Returns a new positions object (immutable pattern).
 *
 * @param {ASTNode} node
 * @param {number} depth
 * @param {number} nodeWidth
 * @param {number} nodeHeight
 * @param {number} vGap
 * @returns {Object<number, NodePosition>}
 * @private
 */
function _firstPass(node, depth, nodeWidth, nodeHeight, vGap) {
  if (!node) { return {}; }

  if (node.children.length === 0) {
    // Leaf node
    return { [node.id]: { x: 0, y: depth * (nodeHeight + vGap), w: nodeWidth, h: nodeHeight } };
  }

  // Process children recursively, merging their positions immutably
  let positions = {};
  for (let i = 0; i < node.children.length; i++) {
    const childPositions = _firstPass(node.children[i], depth + 1, nodeWidth, nodeHeight, vGap);
    positions = { ...positions, ...childPositions };
  }

  // Position this node based on children
  if (node.children.length === 1) {
    // Single child: center parent over child
    const childPos = positions[node.children[0].id];
    return {
      ...positions,
      [node.id]: {
        x: childPos.x,
        y: depth * (nodeHeight + vGap),
        w: nodeWidth,
        h: nodeHeight
      }
    };
  }

  // Multiple children: average their positions
  let minX = Infinity;
  let maxX = -Infinity;
  for (let j = 0; j < node.children.length; j++) {
    const cp = positions[node.children[j].id];
    if (cp.x < minX) { minX = cp.x; }
    if (cp.x > maxX) { maxX = cp.x; }
  }
  let avgX = (minX + maxX) / 2;
  // Adjust for left-side contour (prevent overlaps)
  const leftContour = minX - nodeWidth / 2;
  if (leftContour < 0) {
    // Shift entire subtree right (immutable: create new position objects)
    const shift = -leftContour;
    for (let k = 0; k < node.children.length; k++) {
      const childId = node.children[k].id;
      const cp = positions[childId];
      positions = { ...positions, [childId]: { ...cp, x: cp.x + shift } };
    }
    avgX += shift;
  }

  return {
    ...positions,
    [node.id]: {
      x: avgX,
      y: depth * (nodeHeight + vGap),
      w: nodeWidth,
      h: nodeHeight
    }
  };
}

/**
 * Second pass: detect and resolve overlapping subtrees.
 * Returns a new positions object (immutable pattern).
 *
 * @param {ASTNode} node
 * @param {number} depth
 * @param {Object<number, NodePosition>} positions
 * @param {number} nodeWidth
 * @param {number} nodeHeight
 * @param {number} hGap
 * @returns {Object<number, NodePosition>}
 * @private
 */
function _resolveOverlaps(node, depth, positions, nodeWidth, nodeHeight, hGap) {
  if (!node || node.children.length < 2) { return positions; }

  let newPositions = positions;

  for (let i = 0; i < node.children.length; i++) {
    newPositions = _resolveOverlaps(node.children[i], depth + 1, newPositions, nodeWidth, nodeHeight, hGap);
  }

  // Check each pair of adjacent children for overlap
  for (let m = 0; m < node.children.length - 1; m++) {
    // Get right contour of left subtree
    const rightmost = getRightContour(node.children[m], newPositions);
    // Get left contour of right subtree
    const leftmost = getLeftContour(node.children[m + 1], newPositions);

    const overlap = rightmost + nodeWidth / 2 + hGap - leftmost;
    if (overlap > 0) {
      // Shift the right subtree right by overlap amount (returns new positions)
      newPositions = shiftSubtree(node.children[m + 1], overlap, newPositions);
    }
  }

  // Re-center parent over children (immutable: create new parent position)
  let minX = Infinity;
  let maxX = -Infinity;
  for (let n = 0; n < node.children.length; n++) {
    const cp2 = newPositions[node.children[n].id];
    if (cp2.x < minX) { minX = cp2.x; }
    if (cp2.x > maxX) { maxX = cp2.x; }
  }
  const parentPos = newPositions[node.id];
  return { ...newPositions, [node.id]: { ...parentPos, x: (minX + maxX) / 2 } };
}

/**
 * Calculate total width and height, and offset all positions to be non-negative.
 * Returns a new positions object (immutable pattern).
 *
 * @param {Object<number, NodePosition>} positions
 * @param {number} nodeWidth
 * @param {number} nodeHeight
 * @returns {{ positions: Object<number, NodePosition>, width: number, height: number }}
 * @private
 */
function _calculateBounds(positions, nodeWidth, nodeHeight) {
  const keys = Object.keys(positions);

  // Calculate total width and height
  let totalWidth = 0;
  let totalHeight = 0;
  for (let p = 0; p < keys.length; p++) {
    const pos = positions[keys[p]];
    const rightEdge = pos.x + nodeWidth / 2;
    const bottomEdge = pos.y + nodeHeight;
    if (rightEdge > totalWidth) { totalWidth = rightEdge; }
    if (bottomEdge > totalHeight) { totalHeight = bottomEdge; }
  }

  // Get leftmost edge for offset
  let leftmostX = Infinity;
  for (let q = 0; q < keys.length; q++) {
    const leftEdge = positions[keys[q]].x - nodeWidth / 2;
    if (leftEdge < leftmostX) { leftmostX = leftEdge; }
  }

  // Offset all positions to be non-negative (immutable: create new position objects)
  let finalPositions = positions;
  if (leftmostX < 0) {
    finalPositions = {};
    for (let r = 0; r < keys.length; r++) {
      const key = keys[r];
      finalPositions[key] = { ...positions[key], x: positions[key].x - leftmostX };
    }
    totalWidth -= leftmostX;
  }

  return { positions: finalPositions, width: totalWidth, height: totalHeight };
}

/**
 * Get the rightmost X coordinate of a node's subtree
 * @param {ASTNode} node
 * @param {Object<number, NodePosition>} positions
 * @returns {number}
 */
function getRightContour(node, positions) {
  if (!node) { return -Infinity; }
  const pos = positions[node.id];
  if (!pos) { return -Infinity; }
  let rightmost = pos.x;
  for (let i = 0; i < node.children.length; i++) {
    const childRight = getRightContour(node.children[i], positions);
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
  const pos = positions[node.id];
  if (!pos) { return Infinity; }
  let leftmost = pos.x;
  for (let i = 0; i < node.children.length; i++) {
    const childLeft = getLeftContour(node.children[i], positions);
    if (childLeft < leftmost) { leftmost = childLeft; }
  }
  return leftmost;
}

/**
 * Shift an entire subtree by a delta (immutable: returns new positions object).
 *
 * @param {ASTNode} node
 * @param {number} delta
 * @param {Object<number, NodePosition>} positions
 * @returns {Object<number, NodePosition>}
 */
function shiftSubtree(node, delta, positions) {
  if (!node) { return positions; }
  let newPositions = positions;
  const pos = newPositions[node.id];
  if (pos) {
    newPositions = { ...newPositions, [node.id]: { ...pos, x: pos.x + delta } };
  }
  for (let i = 0; i < node.children.length; i++) {
    newPositions = shiftSubtree(node.children[i], delta, newPositions);
  }
  return newPositions;
}

module.exports = {
  layoutTree: layoutTree,
  NODE_WIDTH: NODE_WIDTH,
  NODE_HEIGHT: NODE_HEIGHT,
  H_GAP: H_GAP,
  V_GAP: V_GAP
};
