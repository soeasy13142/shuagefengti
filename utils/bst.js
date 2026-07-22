/**
 * 二叉搜索树（BST）纯函数模块
 *
 * 提供插入、删除、查找、遍历、布局等操作，
 * 每个操作返回步骤数组用于可视化回放。
 */

// ======================== 节点构造 ========================

/**
 * 创建 BST 节点
 * @param {number} value
 * @returns {{ value: number, left: object|null, right: object|null }}
 */
function createNode(value) {
  return { value: value, left: null, right: null };
}

// ======================== 辅助函数 ========================

/**
 * 深拷贝树（用于步骤快照）
 */
function cloneTree(node) {
  if (!node) return null;
  return {
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right)
  };
}

/**
 * 中序遍历，返回有序值数组
 */
function inOrderValues(node) {
  if (!node) return [];
  return inOrderValues(node.left).concat([node.value]).concat(inOrderValues(node.right));
}

/**
 * 在子树中查找最小值节点（用于删除后继）
 */
function findMin(node) {
  let current = node;
  while (current && current.left) {
    current = current.left;
  }
  return current;
}

// ======================== 插入 ========================

/**
 * 向 BST 插入一个值
 * @param {object|null} root - 树根节点
 * @param {number} value - 要插入的值
 * @returns {{ root: object, steps: Array }} 新的根节点和操作步骤
 */
function insertNode(root, value) {
  const steps = [];
  const result = _insert(root, value, steps);
  steps.push({
    type: 'done',
    value: value,
    path: [],
    description: '插入完成'
  });
  return { root: result, steps: steps };
}

function _insert(node, value, steps) {
  if (!node) {
    steps.push({
      type: 'insert',
      value: value,
      path: [value],
      description: '找到空位，插入 ' + value
    });
    return createNode(value);
  }

  steps.push({
    type: 'compare',
    value: value,
    currentNode: node.value,
    path: [node.value],
    description: '比较 ' + value + (value < node.value ? ' < ' : ' >= ') + node.value + '，走向' + (value < node.value ? '左' : '右') + '子树'
  });

  if (value < node.value) {
    return { ...node, left: _insert(node.left, value, steps) };
  } else {
    return { ...node, right: _insert(node.right, value, steps) };
  }
}

// ======================== 查找 ========================

/**
 * 在 BST 中查找一个值
 * @param {object|null} root - 树根节点
 * @param {number} value - 要查找的值
 * @returns {Array} 操作步骤
 */
function searchNode(root, value) {
  const steps = [];
  _search(root, value, steps, []);
  return steps;
}

function _search(node, value, steps, pathSoFar) {
  if (!node) {
    steps.push({
      type: 'not-found',
      value: value,
      path: pathSoFar.concat([]),
      description: '未找到 ' + value
    });
    return;
  }

  const currentPath = pathSoFar.concat([node.value]);

  if (value === node.value) {
    steps.push({
      type: 'found',
      value: value,
      currentNode: node.value,
      path: currentPath,
      description: '找到 ' + value + '！'
    });
    return;
  }

  steps.push({
    type: 'compare',
    value: value,
    currentNode: node.value,
    path: currentPath,
    description: '比较 ' + value + (value < node.value ? ' < ' : ' > ') + node.value + '，走向' + (value < node.value ? '左' : '右') + '子树'
  });

  if (value < node.value) {
    _search(node.left, value, steps, currentPath);
  } else {
    _search(node.right, value, steps, currentPath);
  }
}

// ======================== 删除 ========================

/**
 * 从 BST 删除一个值
 * @param {object|null} root - 树根节点
 * @param {number} value - 要删除的值
 * @returns {{ root: object|null, steps: Array }} 新的根节点和操作步骤
 */
function deleteNode(root, value) {
  const steps = [];
  const result = _delete(root, value, steps, []);

  if (steps.length === 0 || steps[steps.length - 1].type !== 'not-found') {
    steps.push({
      type: 'done',
      value: value,
      path: [],
      description: '删除完成'
    });
  }

  return { root: result, steps: steps };
}

function _delete(node, value, steps, pathSoFar) {
  if (!node) {
    steps.push({
      type: 'not-found',
      value: value,
      path: pathSoFar.concat([]),
      description: '未找到 ' + value + '，无法删除'
    });
    return null;
  }

  const currentPath = pathSoFar.concat([node.value]);

  if (value < node.value) {
    steps.push({
      type: 'compare',
      value: value,
      currentNode: node.value,
      path: currentPath,
      description: '比较 ' + value + ' < ' + node.value + '，走向左子树'
    });
    return { ...node, left: _delete(node.left, value, steps, currentPath) };
  } else if (value > node.value) {
    steps.push({
      type: 'compare',
      value: value,
      currentNode: node.value,
      path: currentPath,
      description: '比较 ' + value + ' > ' + node.value + '，走向右子树'
    });
    return { ...node, right: _delete(node.right, value, steps, currentPath) };
  } else {
    // 找到要删除的节点
    if (!node.left && !node.right) {
      // 情况 1：叶子节点
      steps.push({
        type: 'delete',
        value: value,
        path: currentPath,
        description: '删除叶子节点 ' + value,
        treeSnapshot: cloneTree(node)
      });
      return null;
    } else if (!node.left || !node.right) {
      // 情况 2：单子节点
      const child = node.left || node.right;
      steps.push({
        type: 'delete',
        value: value,
        path: currentPath,
        description: '删除单子节点 ' + value + '，用子节点 ' + child.value + ' 替换',
        treeSnapshot: cloneTree(node)
      });
      return child;
    } else {
      // 情况 3：双子节点 — 用后继替换
      const successor = findMin(node.right);
      steps.push({
        type: 'replace',
        value: value,
        successor: successor.value,
        path: currentPath,
        description: '删除双子节点 ' + value + '，用后继 ' + successor.value + ' 替换',
        treeSnapshot: cloneTree(node)
      });
      const newRight = _delete(node.right, successor.value, steps, currentPath);
      return { value: successor.value, left: node.left, right: newRight };
    }
  }
}

// ======================== 遍历 ========================

/**
 * 遍历 BST
 * @param {object|null} root - 树根节点
 * @param {string} order - 遍历顺序：'pre'|'in'|'post'|'level'
 * @returns {Array} 操作步骤
 */
function traverseTree(root, order) {
  const steps = [];
  if (!root) {
    steps.push({ type: 'done', path: [], description: '空树，遍历完成' });
    return steps;
  }

  if (order === 'pre') {
    _preOrder(root, steps);
  } else if (order === 'in') {
    _inOrder(root, steps);
  } else if (order === 'post') {
    _postOrder(root, steps);
  } else if (order === 'level') {
    _levelOrder(root, steps);
  }

  steps.push({ type: 'done', path: [], description: '遍历完成' });
  return steps;
}

function _preOrder(node, steps) {
  if (!node) return;
  steps.push({
    type: 'visit',
    value: node.value,
    path: [node.value],
    description: '访问节点 ' + node.value
  });
  _preOrder(node.left, steps);
  _preOrder(node.right, steps);
}

function _inOrder(node, steps) {
  if (!node) return;
  _inOrder(node.left, steps);
  steps.push({
    type: 'visit',
    value: node.value,
    path: [node.value],
    description: '访问节点 ' + node.value
  });
  _inOrder(node.right, steps);
}

function _postOrder(node, steps) {
  if (!node) return;
  _postOrder(node.left, steps);
  _postOrder(node.right, steps);
  steps.push({
    type: 'visit',
    value: node.value,
    path: [node.value],
    description: '访问节点 ' + node.value
  });
}

function _levelOrder(root, steps) {
  const queue = [{ node: root, depth: 0 }];
  while (queue.length > 0) {
    const item = queue.shift();
    const n = item.node;
    steps.push({
      type: 'visit',
      value: n.value,
      path: [n.value],
      description: '访问节点 ' + n.value + '（第 ' + (item.depth + 1) + ' 层）'
    });
    if (n.left) queue.push({ node: n.left, depth: item.depth + 1 });
    if (n.right) queue.push({ node: n.right, depth: item.depth + 1 });
  }
}

// ======================== 树属性 ========================

/**
 * 计算树高
 * @param {object|null} root
 * @returns {number}
 */
function treeHeight(root) {
  if (!root) return 0;
  return 1 + Math.max(treeHeight(root.left), treeHeight(root.right));
}

// ======================== 布局计算 ========================

/**
 * 计算树的渲染布局（节点坐标 + 连线坐标）
 * 使用中序遍历索引法：x = 索引 × 间距，y = 深度 × 层高
 * 生成固定间距的坐标，由渲染层统一缩放适配 canvas。
 * @param {object|null} root
 * @returns {{ nodes: Array, edges: Array, width: number, height: number }}
 */
function layoutTree(root) {
  const nodes = [];
  const edges = [];
  if (!root) return { nodes: nodes, edges: edges, width: 0, height: 0 };

  const NODE_H_GAP = 90;
  const NODE_V_GAP = 80;
  const index = { val: 0 };
  const maxIndex = { val: 0 };

  _layoutNodes(root, 0, index, maxIndex, NODE_H_GAP, NODE_V_GAP, nodes);

  // 计算实际边界
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let bi = 0; bi < nodes.length; bi++) {
    if (nodes[bi].x < minX) minX = nodes[bi].x;
    if (nodes[bi].x > maxX) maxX = nodes[bi].x;
    if (nodes[bi].y < minY) minY = nodes[bi].y;
    if (nodes[bi].y > maxY) maxY = nodes[bi].y;
  }

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.leftVal !== undefined) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].value === n.leftVal) {
          edges.push({
            x1: n.x, y1: n.y,
            x2: nodes[j].x, y2: nodes[j].y,
            state: 'normal'
          });
          break;
        }
      }
    }
    if (n.rightVal !== undefined) {
      for (let k = 0; k < nodes.length; k++) {
        if (nodes[k].value === n.rightVal) {
          edges.push({
            x1: n.x, y1: n.y,
            x2: nodes[k].x, y2: nodes[k].y,
            state: 'normal'
          });
          break;
        }
      }
    }
  }

  const treeW = nodes.length > 0 ? maxX + NODE_H_GAP : 0;
  const treeH = nodes.length > 0 ? maxY + NODE_V_GAP : 0;
  return { nodes: nodes, edges: edges, width: treeW, height: treeH };
}

function _layoutNodes(node, depth, index, maxIndex, hGap, vGap, result) {
  if (!node) return;
  _layoutNodes(node.left, depth + 1, index, maxIndex, hGap, vGap, result);
  const x = index.val * hGap;
  const y = depth * vGap;
  if (index.val > maxIndex.val) maxIndex.val = index.val;
  index.val++;
  result.push({
    value: node.value,
    x: x,
    y: y,
    state: 'normal',
    leftVal: node.left ? node.left.value : undefined,
    rightVal: node.right ? node.right.value : undefined
  });
  _layoutNodes(node.right, depth + 1, index, maxIndex, hGap, vGap, result);
}

// ======================== 导出 ========================

module.exports = {
  createNode: createNode,
  insertNode: insertNode,
  deleteNode: deleteNode,
  searchNode: searchNode,
  traverseTree: traverseTree,
  treeHeight: treeHeight,
  layoutTree: layoutTree,
  inOrderValues: inOrderValues,
  cloneTree: cloneTree
};
