# B+ 树可视化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `pages/bplus-viz/` 页面，提供可调阶数 m（4-32）的 B+ 树交互式可视化教学工具，支持插入 / 查询 / 范围查询，展示节点分裂动画与叶子链表遍历。

**Architecture:** 纯前端 + 3 个 utils 纯函数模块（bplus-node / bplus-split / bplus-tree）+ 1 个页面（4 文件：js/wxml/wxss/json）。WXML 用嵌套 `<view>` 渲染树层级，底部横向链表用 `<view>` row 渲染。Jest 全测。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest + CommonJS（require/module.exports）。

**Spec:** `docs/superpowers/specs/2026-07-12-bplus-tree-design.md`

## Global Constraints

- 所有代码使用 `const`/`let`，**禁用 `var`**（CLAUDE.md §代码风格）
- 文件命名：小写 + kebab-case（CLAUDE.md §命名约定）
- 私有函数 / 模块状态：`_underscore` 前缀
- 异步优先：`Promise` / `async-await`
- 错误处理：所有 `catch` 必须显式处理或 `throw`，禁止静默吞
- 注释：`/** */` JSDoc 用于公开 API；行内 `//` 仅用于解释 why
- 测试命令：`cd /Users/charliepan/Downloads/my-miniapp && npm test`（必须全绿）
- 设计风格：Claude Design 暖奶油画布（背景 `#faf9f5`、卡片 `#efe9de`、CTA `#cc785c`、Georgia 标题；CLAUDE.md §设计风格约束）
- 不引入第三方依赖（无新 npm 包）
- 中文 UI 文案；变量名 / 函数名 / 注释 / commit 英文

---

## B+ 树约定（统一规格，避免后续任务偏离）

| 项 | 取值 |
|---|---|
| 阶数 m 含义 | `m` = 内部节点最多 m 个 children；**每个节点最多 m-1 个 keys** |
| 叶子上限 | `m - 1` 个 keys |
| 内部上限 | `m - 1` 个 keys / `m` 个 children |
| 非根下限 | `ceil(m/2) - 1` 个 keys（叶子和内部通用） |
| 根下限 | 至少 1 个 key（除非整棵树为空） |
| 分裂触发 | 节点 keys 数量 > `m-1`（即达到 `m` 个） |
| **Leaf 分裂规则** | splitIdx = `ceil(m/2)`；左叶 keys[0..splitIdx-1]（长度 splitIdx），右叶 keys[splitIdx..m-1]（长度 m-splitIdx），**提升 keys[splitIdx]**（右叶首个 key，**保留在右叶**：Convention A 标准做法） |
| **Internal 分裂规则** | splitIdx = `ceil(m/2)`；左节点 keys[0..splitIdx-2] + children[0..splitIdx-1]；**提升 keys[splitIdx-1]**（移除、不属于任何子节点）；右节点 keys[splitIdx..m-1] + children[splitIdx..m] |
| 重复 key | 找到已存在的 key 替换（覆盖语义）；不影响树结构 |
| 范围查询 | 含 lo、含 hi（左闭右闭） |
| lo > hi | 返回 `{ error: 'lo must be <= hi' }` |

**关键不变量**：叶子的 keys 始终升序；叶子通过 next/prev 双向链表串联；内部节点 keys[i] 是 children[i] 与 children[i+1] 之间的分隔键。

---

## Task 1: 节点数据结构 + 布局算法

**Files:**
- Create: `utils/bplus-node.js`
- Test: `tests/utils/bplus-node.test.js`

**Interfaces:**
- Consumes: 无
- Produces:
  - `createLeafNode(keys = [], next = null, prev = null)` → `LeafNode`
  - `createInternalNode(keys = [], children = [])` → `InternalNode`
  - `isLeaf(node)` → `boolean`
  - `isInternal(node)` → `boolean`
  - `leafCount(root)` → `number`
  - `buildLayout(root)` → `{ levels, edges, leaves, width, height }`（用于 WXML 渲染）

`LeafNode` 形状：

```js
{ type: 'leaf', keys: number[], next: LeafNode|null, prev: LeafNode|null }
```

`InternalNode` 形状：

```js
{ type: 'internal', keys: number[], children: Node[] }
```

`buildLayout` 形状：

```js
{
  levels: Array<{ y: number, nodes: Array<{ id, keys, x, type, ref }> }>,
  edges: Array<{ x1, y1, x2, y2 }>,
  leaves: Array<{ id, keys, x, y, ref }>,
  width: number,
  height: number
}
```

- [ ] **Step 1: Write failing test**

`tests/utils/bplus-node.test.js`:

```js
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
    const xs = layout.leaves.map(l => l.x);
    const sorted = xs.slice().sort((a, b) => a - b);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/bplus-node.test.js`
Expected: FAIL with "Cannot find module '../../utils/bplus-node'"

- [ ] **Step 3: Implement `utils/bplus-node.js`**

```js
/**
 * B+ tree node data structures + layout algorithm.
 *
 * Node types:
 * - LeafNode: { type: 'leaf', keys, next, prev }
 * - InternalNode: { type: 'internal', keys, children }  // children.length = keys.length + 1
 */

const NODE_H_GAP = 90;
const NODE_V_GAP = 100;

function createLeafNode(keys = [], next = null, prev = null) {
  return {
    type: 'leaf',
    keys: keys.slice().sort((a, b) => a - b),
    next: next,
    prev: prev
  };
}

function createInternalNode(keys = [], children = []) {
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
  let count = 0;
  for (let i = 0; i < root.children.length; i++) {
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

  const levels = [];
  const edges = [];
  const leaves = [];

  // Pass 1: collect leaves in order (walk next pointers from leftmost leaf)
  let firstLeaf = root;
  while (!isLeaf(firstLeaf)) {
    firstLeaf = firstLeaf.children[0];
  }
  let cursor = firstLeaf;
  while (cursor) {
    leaves.push(cursor);
    cursor = cursor.next;
  }

  // assign x to leaves
  leaves.forEach((leaf, idx) => {
    leaf._layoutX = idx * NODE_H_GAP;
    leaf._layoutY = (depthOf(root, leaf)) * NODE_V_GAP;
  });

  // assign x to internals: mean of children x, y = children y - NODE_V_GAP
  function assignInternalX(node) {
    if (isLeaf(node)) return;
    for (let i = 0; i < node.children.length; i++) {
      assignInternalX(node.children[i]);
    }
    let sum = 0;
    for (let i = 0; i < node.children.length; i++) {
      sum += node.children[i]._layoutX;
    }
    node._layoutX = sum / node.children.length;
    node._layoutY = node.children[0]._layoutY - NODE_V_GAP;
  }
  assignInternalX(root);

  // Pass 2: cluster by y coordinate into levels
  const byY = new Map();
  function collect(node) {
    if (!node) return;
    if (!byY.has(node._layoutY)) byY.set(node._layoutY, []);
    byY.get(node._layoutY).push(node);
    if (isInternal(node)) {
      for (let i = 0; i < node.children.length; i++) collect(node.children[i]);
    }
  }
  collect(root);

  const sortedYs = Array.from(byY.keys()).sort((a, b) => a - b);
  let nodeIdCounter = 0;
  sortedYs.forEach((y, levelIdx) => {
    const nodes = byY.get(y).slice().sort((a, b) => a._layoutX - b._layoutX);
    const level = { y: y, nodes: nodes.map(n => ({
      id: 'n' + (nodeIdCounter++),
      keys: n.keys.slice(),
      x: n._layoutX,
      type: n.type,
      ref: n
    })) };
    levels.push(level);
  });

  // compute edges: one per internal->child connection
  function buildEdges(node) {
    if (!isInternal(node)) return;
    const parentLevel = levels.find(lvl => lvl.nodes.some(n => n.ref === node));
    if (!parentLevel) return;
    const parentNode = parentLevel.nodes.find(n => n.ref === node);
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childLevel = levels.find(lvl => lvl.nodes.some(n => n.ref === child));
      if (!childLevel) continue;
      const childNode = childLevel.nodes.find(n => n.ref === child);
      edges.push({
        x1: parentNode.x, y1: parentNode.ref._layoutY,
        x2: childNode.x, y2: childNode.ref._layoutY
      });
      buildEdges(child);
    }
  }
  buildEdges(root);

  // compute width/height
  let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < levels.length; i++) {
    for (let j = 0; j < levels[i].nodes.length; j++) {
      const n = levels[i].nodes[j];
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
    }
    if (levels[i].y > maxY) maxY = levels[i].y;
  }
  const width = levels.length > 0 ? maxX - minX + NODE_H_GAP : 0;
  const height = levels.length > 0 ? maxY + NODE_V_GAP : 0;

  return { levels: levels, edges: edges, leaves: leaves, width: width, height: height };
}

function depthOf(root, target) {
  return _depthOf(root, target, 0);
}

function _depthOf(node, target, d) {
  if (node === target) return d;
  if (isInternal(node)) {
    for (let i = 0; i < node.children.length; i++) {
      const found = _depthOf(node.children[i], target, d + 1);
      if (found >= 0) return found;
    }
  }
  return -1;
}

module.exports = {
  createLeafNode,
  createInternalNode,
  isLeaf,
  isInternal,
  leafCount,
  buildLayout,
  NODE_H_GAP,
  NODE_V_GAP
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/bplus-node.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add utils/bplus-node.js tests/utils/bplus-node.test.js
git commit -m "feat(bplus-node): LeafNode/InternalNode 数据结构 + buildLayout 布局算法"
```

---

## Task 2: 节点分裂纯函数

**Files:**
- Create: `utils/bplus-split.js`
- Test: `tests/utils/bplus-split.test.js`

**Interfaces:**
- Consumes: 无（纯函数）
- Produces:
  - `splitLeaf(leaf, m)` → `{ leftNode, rightNode, promotedKey, leftNext: null }`（调用方负责链表重接）
  - `splitInternal(node, m)` → `{ leftNode, rightNode, promotedKey }`
  - `MAX_KEYS(m)` → `m - 1`（常量）
  - `MIN_KEYS(m)` → `Math.ceil(m / 2) - 1`

约定（已在 Header 统一）：
- Leaf split (Convention A): splitIdx = ceil(m/2)；left = keys[0..splitIdx-1]；right = keys[splitIdx..m-1]；promoted = keys[splitIdx]
- Internal split: splitIdx = ceil(m/2)；left.keys = keys[0..splitIdx-2]、left.children = children[0..splitIdx-1]；promoted = keys[splitIdx-1]（**移除**，不属于任何子节点）；right.keys = keys[splitIdx..m-1]、right.children = children[splitIdx..m]

- [ ] **Step 1: Write failing test**

`tests/utils/bplus-split.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/bplus-split.test.js`
Expected: FAIL with "Cannot find module '../../utils/bplus-split'"

- [ ] **Step 3: Implement `utils/bplus-split.js`**

```js
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
    throw new Error(`splitLeaf called with ${leaf.keys.length} keys, expected ${m}`);
  }
  const splitIdx = Math.ceil(m / 2);
  const sortedKeys = leaf.keys.slice().sort((a, b) => a - b);
  const leftKeys = sortedKeys.slice(0, splitIdx);
  const rightKeys = sortedKeys.slice(splitIdx);
  const promotedKey = rightKeys[0];

  const leftNode = createLeafNode(leftKeys);
  const rightNode = createLeafNode(rightKeys);

  return { leftNode, rightNode, promotedKey };
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
    throw new Error(`splitInternal called with ${node.keys.length} keys, expected ${m}`);
  }
  const splitIdx = Math.ceil(m / 2);
  const leftKeys = node.keys.slice(0, splitIdx - 1);
  const leftChildren = node.children.slice(0, splitIdx);
  const promotedKey = node.keys[splitIdx - 1];
  const rightKeys = node.keys.slice(splitIdx);
  const rightChildren = node.children.slice(splitIdx);

  const leftNode = createInternalNode(leftKeys, leftChildren);
  const rightNode = createInternalNode(rightKeys, rightChildren);

  return { leftNode, rightNode, promotedKey };
}

module.exports = {
  splitLeaf,
  splitInternal,
  MAX_KEYS,
  MIN_KEYS
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/bplus-split.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add utils/bplus-split.js tests/utils/bplus-split.test.js
git commit -m "feat(bplus-split): Leaf/Internal 节点分裂纯函数（Convention A 提升右叶首 key）"
```

---

## Task 3: B+ 树类（insert / search / rangeQuery + step 生成）

**Files:**
- Create: `utils/bplus-tree.js`
- Test: `tests/utils/bplus-tree.test.js`

**Interfaces:**
- Consumes:
  - `createLeafNode`, `createInternalNode`, `isLeaf`, `isInternal` from `utils/bplus-node.js`
  - `splitLeaf`, `splitInternal`, `MAX_KEYS` from `utils/bplus-split.js`
- Produces:
  - `class BPlusTree { constructor(m), insert(key), search(key), rangeQuery(lo, hi), root, steps }`

**操作返回值**：

```js
// insert
{ root, steps: Array<{type, ...}> }

// search
{ found: number | null, steps: Array<{type, ...}> }

// rangeQuery
{ result: number[], leaves: LeafNode[], steps: Array<{type, ...}> }
// or error: { error: string, steps: [] }
```

`step.type` 取值：
- `'search'`：插入前的搜索路径
- `'findLeaf'`：search/rangeQuery 找叶子
- `'compare'`：search 中比较
- `'found'` / `'not-found'`：search 结果
- `'insert'`：插入完成
- `'split'`：节点分裂（含 promotedKey、leftNode、rightNode）
- `'rootSplit'`：根分裂 + 新根创建
- `'walkLeaf'`：rangeQuery 中遍历下一个叶子

- [ ] **Step 1: Write failing test**

`tests/utils/bplus-tree.test.js`:

```js
const { BPlusTree } = require('../../utils/bplus-tree');

describe('BPlusTree constructor', () => {
  test('rejects m < 3', () => {
    expect(() => new BPlusTree(2)).toThrow();
    expect(() => new BPlusTree(1)).toThrow();
  });

  test('initializes empty leaf as root for valid m', () => {
    const tree = new BPlusTree(4);
    expect(tree.root.type).toBe('leaf');
    expect(tree.root.keys).toEqual([]);
  });
});

describe('BPlusTree.insert — basic', () => {
  test('inserts single key into empty tree', () => {
    const tree = new BPlusTree(4);
    const { root } = tree.insert(10);
    expect(root.type).toBe('leaf');
    expect(root.keys).toEqual([10]);
  });

  test('inserts multiple keys without split (m=4, 3 keys)', () => {
    const tree = new BPlusTree(4);
    tree.insert(20);
    tree.insert(10);
    tree.insert(30);
    expect(tree.root.type).toBe('leaf');
    expect(tree.root.keys).toEqual([10, 20, 30]);
  });

  test('maintains sorted order in leaf', () => {
    const tree = new BPlusTree(8);
    [50, 10, 80, 30, 20, 70, 40, 60].forEach(k => tree.insert(k));
    expect(tree.root.keys).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
  });
});

describe('BPlusTree.insert — leaf split', () => {
  test('m=4: 4th insert triggers leaf split, root becomes internal', () => {
    const tree = new BPlusTree(4);
    tree.insert(10);
    tree.insert(20);
    tree.insert(30);
    tree.insert(40);
    expect(tree.root.type).toBe('internal');
    expect(tree.root.keys.length).toBe(1);
    expect(tree.root.children.length).toBe(2);
    const leaves = [tree.root.children[0], tree.root.children[1]];
    expect(leaves[0].type).toBe('leaf');
    expect(leaves[1].type).toBe('leaf');
    // Convention A: left = [10,20], right = [30,40], promoted = 30
    expect(leaves[0].keys).toEqual([10, 20]);
    expect(leaves[1].keys).toEqual([30, 40]);
    expect(tree.root.keys[0]).toBe(30);
  });

  test('split sets up leaf linked list (next/prev)', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30, 40].forEach(k => tree.insert(k));
    const left = tree.root.children[0];
    const right = tree.root.children[1];
    expect(left.next).toBe(right);
    expect(right.prev).toBe(left);
    expect(left.prev).toBeNull();
    expect(right.next).toBeNull();
  });
});

describe('BPlusTree.insert — multi-level split', () => {
  test('m=4: 7 inserts cause root split + internal split', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30, 40, 50, 60, 70].forEach(k => tree.insert(k));
    // root internal with 2 keys (after multi splits)
    expect(tree.root.type).toBe('internal');
    expect(tree.root.keys.length).toBeGreaterThanOrEqual(2);
    // leaf chain has 3 leaves
    let cursor = tree.root;
    while (cursor.type !== 'leaf') cursor = cursor.children[0];
    let leafCount = 0;
    let c = cursor;
    while (c) { leafCount++; c = c.next; }
    expect(leafCount).toBe(3);
  });

  test('all keys are reachable via in-order leaf traversal', () => {
    const tree = new BPlusTree(4);
    const keys = [10, 20, 30, 40, 50, 60, 70];
    keys.forEach(k => tree.insert(k));
    const collected = [];
    let leaf = tree.root;
    while (leaf.type !== 'leaf') leaf = leaf.children[0];
    let c = leaf;
    while (c) {
      collected.push(...c.keys);
      c = c.next;
    }
    expect(collected).toEqual(keys);
  });
});

describe('BPlusTree.insert — different m values', () => {
  test('m=8 supports 7 keys without split', () => {
    const tree = new BPlusTree(8);
    for (let k = 1; k <= 7; k++) tree.insert(k);
    expect(tree.root.type).toBe('leaf');
    expect(tree.root.keys).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('m=16 supports 15 keys without split', () => {
    const tree = new BPlusTree(16);
    for (let k = 1; k <= 15; k++) tree.insert(k * 2);
    expect(tree.root.type).toBe('leaf');
  });

  test('m=32 supports 31 keys without split', () => {
    const tree = new BPlusTree(32);
    for (let k = 1; k <= 31; k++) tree.insert(k * 3);
    expect(tree.root.type).toBe('leaf');
  });
});

describe('BPlusTree.search', () => {
  test('returns null for empty tree', () => {
    const tree = new BPlusTree(4);
    const { found } = tree.search(10);
    expect(found).toBeNull();
  });

  test('finds existing key', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30].forEach(k => tree.insert(k));
    const { found } = tree.search(20);
    expect(found).toBe(20);
  });

  test('returns null for missing key', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30].forEach(k => tree.insert(k));
    const { found } = tree.search(25);
    expect(found).toBeNull();
  });

  test('search works after splits', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30, 40, 50, 60, 70].forEach(k => tree.insert(k));
    expect(tree.search(10).found).toBe(10);
    expect(tree.search(40).found).toBe(40);
    expect(tree.search(70).found).toBe(70);
    expect(tree.search(25).found).toBeNull();
    expect(tree.search(75).found).toBeNull();
  });

  test('search records path steps', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30, 40, 50].forEach(k => tree.insert(k));
    const { steps, found } = tree.search(40);
    expect(found).toBe(40);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some(s => s.type === 'compare' || s.type === 'found')).toBe(true);
  });
});

describe('BPlusTree.rangeQuery', () => {
  test('returns [] for empty tree', () => {
    const tree = new BPlusTree(4);
    const { result } = tree.rangeQuery(10, 50);
    expect(result).toEqual([]);
  });

  test('returns [] when no keys in range', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30].forEach(k => tree.insert(k));
    const { result } = tree.rangeQuery(100, 200);
    expect(result).toEqual([]);
  });

  test('returns matching keys in single leaf (inclusive bounds)', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30, 40].forEach(k => tree.insert(k));
    expect(tree.rangeQuery(15, 35).result).toEqual([20, 30]);
    expect(tree.rangeQuery(20, 30).result).toEqual([20, 30]); // both bounds inclusive
    expect(tree.rangeQuery(10, 40).result).toEqual([10, 20, 30, 40]);
  });

  test('returns [] when lo > hi', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30].forEach(k => tree.insert(k));
    const result = tree.rangeQuery(30, 10);
    expect(result.error).toBeDefined();
    expect(result.result).toEqual([]);
  });

  test('walks leaf linked list across multiple leaves', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30, 40, 50, 60, 70].forEach(k => tree.insert(k));
    const { result } = tree.rangeQuery(25, 55);
    expect(result).toEqual([30, 40, 50]);
  });

  test('range starting before first key and ending after last', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30, 40, 50].forEach(k => tree.insert(k));
    const { result } = tree.rangeQuery(0, 1000);
    expect(result).toEqual([10, 20, 30, 40, 50]);
  });

  test('records walkLeaf steps', () => {
    const tree = new BPlusTree(4);
    [10, 20, 30, 40, 50, 60, 70].forEach(k => tree.insert(k));
    const { steps } = tree.rangeQuery(25, 55);
    expect(steps.some(s => s.type === 'walkLeaf')).toBe(true);
  });
});

describe('BPlusTree.insert — duplicate key', () => {
  test('overwrites existing key without changing structure', () => {
    const tree = new BPlusTree(4);
    tree.insert(10);
    tree.insert(20);
    tree.insert(10); // duplicate
    expect(tree.root.keys).toEqual([10, 20]);
    expect(tree.root.keys.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/bplus-tree.test.js`
Expected: FAIL with "Cannot find module '../../utils/bplus-tree'"

- [ ] **Step 3: Implement `utils/bplus-tree.js`**

```js
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

class BPlusTree {
  constructor(m) {
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
  insert(key) {
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
  }

  /**
   * Recursively insert key into appropriate leaf; splits bubble up.
   * @returns {object|null} If this node splits, returns { leftNode, rightNode, promotedKey }
   */
  _insertIntoLeaf(node, key, steps, parent, childIndex) {
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
  }

  _insertIntoGivenLeaf(leaf, key, steps, parent, childIndex) {
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
    leaf.keys.sort((a, b) => a - b);
    steps.push({
      type: 'insert',
      leafKeys: leaf.keys.slice(),
      explanation: 'Inserted key ' + key + ' into leaf'
    });
    if (leaf.keys.length > MAX_KEYS(this.m)) {
      return this._splitAndPromote(leaf, steps);
    }
    return null;
  }

  _splitAndPromote(node, steps) {
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
  }

  _findChildIndex(internal, key) {
    // Find first i where keys[i] > key; descend to children[i]; if all <= key, use children[keys.length]
    for (let i = 0; i < internal.keys.length; i++) {
      if (key < internal.keys[i]) return i;
    }
    return internal.keys.length;
  }

  /**
   * Search for key.
   * @param {number} key
   * @returns {{ found: number|null, steps: Array }}
   */
  search(key) {
    const steps = [];
    const found = this._search(this.root, key, steps);
    steps.push({
      type: found === null ? 'not-found' : 'found',
      found: found,
      explanation: found === null ? '未找到 key ' + key : '找到 key ' + found
    });
    return { found, steps };
  }

  _search(node, key, steps) {
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
  }

  /**
   * Range query [lo, hi] (both inclusive).
   * @param {number} lo
   * @param {number} hi
   * @returns {{ result: number[], leaves: object[], steps: Array, error?: string }}
   */
  rangeQuery(lo, hi) {
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
    let walkCount = 0;
    while (cursor) {
      walkCount++;
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
          return { result, leaves: visitedLeaves, steps };
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
    return { result, leaves: visitedLeaves, steps };
  }

  _findLeaf(node, key) {
    if (isLeaf(node)) return node;
    const childIdx = this._findChildIndex(node, key);
    return this._findLeaf(node.children[childIdx], key);
  }
}

module.exports = { BPlusTree };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/bplus-tree.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS（之前所有测试 + 新增 3 个 bplus 测试文件全部通过）

- [ ] **Step 6: Commit**

```bash
git add utils/bplus-tree.js tests/utils/bplus-tree.test.js
git commit -m "feat(bplus-tree): BPlusTree 类（insert/search/rangeQuery + step 生成）"
```

---

## Task 4: 页面骨架（4 文件 + 渲染器）

**Files:**
- Create: `pages/bplus-viz/bplus-viz.json`
- Create: `pages/bplus-viz/bplus-viz.wxml`
- Create: `pages/bplus-viz/bplus-viz.wxss`
- Create: `pages/bplus-viz/bplus-viz.js`

**Interfaces:**
- Consumes:
  - `BPlusTree` from `utils/bplus-tree.js`
  - `buildLayout` from `utils/bplus-node.js`
- Produces: 完整的 `pages/bplus-viz/` 页面（4 文件），无外部依赖

- [ ] **Step 1: Write `pages/bplus-viz/bplus-viz.json`**

```json
{
  "navigationBarTitleText": "B+ 树可视化",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#faf9f5",
  "usingComponents": {}
}
```

- [ ] **Step 2: Write `pages/bplus-viz/bplus-viz.wxml`**

```xml
<view class="page">
  <view class="content">
    <view class="title-band">
      <text class="title-text">B+ 树可视化</text>
      <text class="subtitle-text">阶数 m={{m}} · 节点数 {{nodeCount}} · 叶子数 {{leafCount}}</text>
    </view>

    <!-- 控制条 -->
    <view class="control-band">
      <view class="slider-row">
        <text class="slider-label">阶数 m</text>
        <slider class="m-slider" min="4" max="32" step="1" value="{{m}}"
                activeColor="#cc785c" backgroundColor="#e6dfd8" block-size="20"
                bindchange="onMChange" />
        <text class="slider-value">{{m}}</text>
      </view>

      <view class="op-tabs">
        <view class="op-tab {{operation === 'insert' ? 'op-active' : ''}}"
              data-op="insert" bindtap="onOpChange">
          <text>插入</text>
        </view>
        <view class="op-tab {{operation === 'search' ? 'op-active' : ''}}"
              data-op="search" bindtap="onOpChange">
          <text>查询</text>
        </view>
        <view class="op-tab {{operation === 'range' ? 'op-active' : ''}}"
              data-op="range" bindtap="onOpChange">
          <text>范围查询</text>
        </view>
      </view>

      <view class="input-row">
        <input wx:if="{{operation === 'range'}}"
               class="input-field"
               placeholder="lo"
               value="{{loInput}}"
               bindinput="onLoInput"
               type="number" />
        <input wx:if="{{operation === 'range'}}"
               class="input-field"
               placeholder="hi"
               value="{{hiInput}}"
               bindinput="onHiInput"
               type="number" />
        <input wx:if="{{operation !== 'range'}}"
               class="input-field"
               placeholder="输入 key（数字）"
               value="{{keyInput}}"
               bindinput="onKeyInput"
               type="number" />
        <view class="action-btn" bindtap="onExecute">
          <text class="btn-text">▶ 执行</text>
        </view>
      </view>

      <view class="quick-row">
        <view class="quick-btn" bindtap="onReset">
          <text>↻ 清空</text>
        </view>
        <view class="quick-btn" bindtap="onRandomInsert">
          <text>🎲 随机插入</text>
        </view>
        <view class="quick-btn" bindtap="onBatchInsert">
          <text>🎲 批量 5 个</text>
        </view>
      </view>

      <text wx:if="{{errorMessage}}" class="error-text">{{errorMessage}}</text>
    </view>

    <!-- 树状视图 -->
    <view class="tree-band">
      <text class="band-label">树状结构</text>
      <view class="tree-scroll">
        <view class="tree-canvas" style="width: {{canvasWidth}}rpx; height: {{canvasHeight}}rpx;">
          <view wx:for="{{levels}}" wx:key="y" wx:for-item="level" class="level-row" style="top: {{level.y}}rpx;">
            <view wx:for="{{level.nodes}}" wx:key="id" wx:for-item="n"
                  class="node {{n.type}} {{n.state}}"
                  style="left: {{n.x}}rpx;">
              <view wx:for="{{n.keys}}" wx:key="*this" wx:for-item="k" class="key-cell">
                <text class="key-text">{{k}}</text>
              </view>
            </view>
          </view>
          <view wx:for="{{edges}}" wx:key="*this" wx:for-item="e" class="edge"
                style="left: {{e.x1}}rpx; top: {{e.y1}}rpx; width: {{e.lenX}}rpx; height: {{e.lenY}}rpx; transform: rotate({{e.angle}}deg);"></view>
          <view wx:if="{{levels.length === 0}}" class="empty-text">
            <text>空树 — 输入 key 后点击「插入」</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 叶子链表视图 -->
    <view class="leaf-band" wx:if="{{leaves.length > 0}}">
      <text class="band-label">叶子链表（顺序遍历范围查询路径）</text>
      <view class="leaf-scroll">
        <view class="leaf-row">
          <block wx:for="{{leaves}}" wx:key="id" wx:for-item="leaf" wx:for-index="li">
            <view class="leaf {{leaf.state}}">
              <view wx:for="{{leaf.keys}}" wx:key="*this" wx:for-item="k" class="leaf-key">
                <text>{{k}}</text>
              </view>
            </view>
            <text wx:if="{{li < leaves.length - 1}}" class="leaf-arrow">↔</text>
          </block>
        </view>
      </view>
    </view>

    <!-- 操作日志 -->
    <view class="log-band" wx:if="{{log.length > 0}}">
      <text class="band-label">操作日志</text>
      <view class="log-list">
        <view wx:for="{{log}}" wx:key="time" wx:for-item="entry" class="log-entry">
          <text class="log-time">{{entry.time}}</text>
          <text class="log-text">{{entry.text}}</text>
        </view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: Write `pages/bplus-viz/bplus-viz.wxss`**

```css
.page {
  min-height: 100vh;
  background: #faf9f5;
  padding-bottom: 60rpx;
}

.content {
  padding: 24rpx 32rpx;
}

.title-band {
  margin-bottom: 20rpx;
}

.title-text {
  display: block;
  font-family: Georgia, serif;
  font-size: 40rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  color: #141413;
  margin-bottom: 6rpx;
}

.subtitle-text {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 22rpx;
  color: #6c6a64;
}

.control-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.slider-label {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  color: #6c6a64;
  flex-shrink: 0;
}

.m-slider {
  flex: 1;
}

.slider-value {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 28rpx;
  font-weight: 500;
  color: #cc785c;
  width: 60rpx;
  text-align: right;
}

.op-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.op-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 16rpx;
  background: #f5f0e8;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  color: #6c6a64;
}

.op-active {
  background: #cc785c;
  color: #faf9f5;
  font-weight: 500;
}

.input-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.input-field {
  flex: 1;
  height: 72rpx;
  background: #faf9f5;
  border: 1rpx solid #e6dfd8;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 26rpx;
  color: #141413;
}

.action-btn {
  padding: 0 24rpx;
  height: 72rpx;
  background: #cc785c;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:active {
  background: #a9583e;
}

.btn-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
}

.quick-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 12rpx 24rpx;
  background: #f5f0e8;
  border-radius: 999rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  color: #3d3d3a;
}

.quick-btn:active {
  background: #e8e0d2;
  color: #cc785c;
}

.error-text {
  display: block;
  margin-top: 12rpx;
  color: #c64545;
  font-size: 22rpx;
}

.band-label {
  display: block;
  font-family: Georgia, serif;
  font-size: 28rpx;
  letter-spacing: -1rpx;
  color: #141413;
  margin-bottom: 12rpx;
}

/* Tree view */
.tree-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.tree-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.tree-canvas {
  position: relative;
  min-width: 100%;
}

.level-row {
  position: absolute;
  left: 0;
  display: flex;
  align-items: flex-start;
}

.node {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 12rpx;
  border-radius: 16rpx;
  background: #faf9f5;
  border: 2rpx solid #8a8580;
  transform: translateX(-50%);
  transition: all 0.3s ease;
}

.node.internal {
  background: #f5ede2;
}

.node.leaf {
  background: #faf9f5;
}

.node.highlight {
  background: #cc785c;
  border-color: #cc785c;
}

.node.highlight .key-cell {
  background: #ffffff;
  color: #cc785c;
}

.node.range {
  background: #5db8a6;
  border-color: #5db8a6;
}

.node.range .key-cell {
  background: #ffffff;
  color: #5db8a6;
}

.node.splitting {
  background: #7bb8d4;
  border-color: #7bb8d4;
}

.key-cell {
  background: #ffffff;
  border-radius: 8rpx;
  padding: 6rpx 12rpx;
  min-width: 50rpx;
  text-align: center;
}

.key-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 22rpx;
  font-weight: 500;
  color: #141413;
}

.edge {
  position: absolute;
  background: #8a8580;
  transform-origin: 0 50%;
  pointer-events: none;
}

.empty-text {
  padding: 40rpx 0;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  color: #8e8b82;
}

/* Leaf linked list */
.leaf-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.leaf-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.leaf-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 0;
}

.leaf {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #faf9f5;
  border: 2rpx solid #8a8580;
  border-radius: 16rpx;
  padding: 12rpx;
  transition: all 0.3s ease;
}

.leaf.start {
  background: #5db872;
  border-color: #5db872;
}

.leaf.start .leaf-key {
  background: #ffffff;
  color: #5db872;
}

.leaf.end {
  background: #e6a030;
  border-color: #e6a030;
}

.leaf.end .leaf-key {
  background: #ffffff;
  color: #e6a030;
}

.leaf.middle {
  background: #7bb8d4;
  border-color: #7bb8d4;
}

.leaf.middle .leaf-key {
  background: #ffffff;
  color: #7bb8d4;
}

.leaf-key {
  background: #ffffff;
  border-radius: 8rpx;
  padding: 6rpx 12rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 22rpx;
  font-weight: 500;
  color: #141413;
}

.leaf-arrow {
  font-size: 28rpx;
  color: #6c6a64;
}

/* Operation log */
.log-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
}

.log-list {
  max-height: 320rpx;
  overflow-y: auto;
}

.log-entry {
  padding: 8rpx 0;
  border-bottom: 1rpx solid #e6dfd8;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 20rpx;
  color: #8e8b82;
  margin-right: 12rpx;
}

.log-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 22rpx;
  color: #141413;
  line-height: 1.5;
}
```

- [ ] **Step 4: Write `pages/bplus-viz/bplus-viz.js`**

```js
const { BPlusTree } = require('../../utils/bplus-tree');
const { buildLayout, leafCount } = require('../../utils/bplus-node');

const PX_PER_RPX = 1;

Page({
  data: {
    m: 4,
    operation: 'insert',
    keyInput: '',
    loInput: '',
    hiInput: '',
    levels: [],
    edges: [],
    leaves: [],
    canvasWidth: 600,
    canvasHeight: 400,
    nodeCount: 0,
    leafCount: 0,
    errorMessage: '',
    log: []
  },

  _tree: null,

  onLoad() {
    this._tree = new BPlusTree(4);
    this._refreshRender();
  },

  onMChange(e) {
    const newM = Number(e.detail.value);
    if (newM === this.data.m) return;
    this._tree = new BPlusTree(newM);
    this.setData({
      m: newM,
      keyInput: '',
      loInput: '',
      hiInput: '',
      errorMessage: '',
      log: []
    });
    this._refreshRender();
    wx.showToast({ title: '阶数已变，树已重置', icon: 'none' });
  },

  onOpChange(e) {
    this.setData({ operation: e.currentTarget.dataset.op, errorMessage: '' });
  },

  onKeyInput(e) {
    this.setData({ keyInput: e.detail.value });
  },

  onLoInput(e) {
    this.setData({ loInput: e.detail.value });
  },

  onHiInput(e) {
    this.setData({ hiInput: e.detail.value });
  },

  onExecute() {
    if (this.data.operation === 'insert') {
      const key = parseInt(this.data.keyInput, 10);
      if (isNaN(key)) {
        this.setData({ errorMessage: '请输入数字 key' });
        return;
      }
      this._doInsert(key);
    } else if (this.data.operation === 'search') {
      const key = parseInt(this.data.keyInput, 10);
      if (isNaN(key)) {
        this.setData({ errorMessage: '请输入数字 key' });
        return;
      }
      this._doSearch(key);
    } else if (this.data.operation === 'range') {
      const lo = parseInt(this.data.loInput, 10);
      const hi = parseInt(this.data.hiInput, 10);
      if (isNaN(lo) || isNaN(hi)) {
        this.setData({ errorMessage: '请输入数字 lo / hi' });
        return;
      }
      this._doRange(lo, hi);
    }
  },

  _doInsert(key) {
    const result = this._tree.insert(key);
    this._refreshRender();
    this._appendLog('插入 key=' + key + '：' + this._summarizeSteps(result.steps));
    this.setData({ keyInput: '', errorMessage: '' });
  },

  _doSearch(key) {
    const result = this._tree.search(key);
    this._refreshRender({ highlightKey: key, highlightType: 'search' });
    const foundText = result.found === null ? '未找到' : '找到 key=' + result.found;
    this._appendLog('查询 key=' + key + '：' + foundText + '。' + this._summarizeSteps(result.steps));
    this.setData({ keyInput: '', errorMessage: '' });
  },

  _doRange(lo, hi) {
    const result = this._tree.rangeQuery(lo, hi);
    if (result.error) {
      this.setData({ errorMessage: result.error });
      return;
    }
    this._refreshRender({ rangeQuery: { lo, hi, leaves: result.leaves } });
    this._appendLog('范围查询 [' + lo + ', ' + hi + ']：' +
                    (result.result.length === 0 ? '无匹配' : '结果 ' + JSON.stringify(result.result)));
    this.setData({ loInput: '', hiInput: '', errorMessage: '' });
  },

  onReset() {
    this._tree = new BPlusTree(this.data.m);
    this.setData({
      keyInput: '',
      loInput: '',
      hiInput: '',
      errorMessage: '',
      log: []
    });
    this._refreshRender();
  },

  onRandomInsert() {
    const key = this._randomKey();
    this.setData({ keyInput: String(key) });
    this._doInsert(key);
  },

  onBatchInsert() {
    const inserted = [];
    for (let i = 0; i < 5; i++) {
      const key = this._randomKey();
      this._tree.insert(key);
      inserted.push(key);
    }
    this._refreshRender();
    this._appendLog('批量插入：' + inserted.join(', '));
  },

  _randomKey() {
    return Math.floor(Math.random() * 99) + 1;
  },

  _refreshRender(opts) {
    opts = opts || {};
    const layout = buildLayout(this._tree.root);
    const levels = layout.levels.map(level => ({
      y: level.y,
      nodes: level.nodes.map(n => ({
        id: n.id,
        keys: n.keys,
        x: n.x,
        type: n.type,
        state: this._nodeState(n.ref, opts)
      }))
    }));
    const edges = layout.edges.map(e => this._computeEdgeStyle(e));
    const leaves = layout.leaves.map((leaf, idx) => ({
      id: 'lf' + idx,
      keys: leaf.keys,
      state: this._leafState(leaf, opts)
    }));
    const canvasWidth = Math.max(600, layout.width + 100);
    const canvasHeight = Math.max(300, layout.height + 60);
    this.setData({
      levels,
      edges,
      leaves,
      canvasWidth,
      canvasHeight,
      nodeCount: this._countNodes(this._tree.root),
      leafCount: leafCount(this._tree.root)
    });
  },

  _nodeState(node, opts) {
    if (opts.rangeQuery) {
      return opts.rangeQuery.leaves.indexOf(node) >= 0 ? 'range' : '';
    }
    if (opts.highlightKey !== undefined) {
      if (!node.keys) return '';
      return node.keys.indexOf(opts.highlightKey) >= 0 ? 'highlight' : '';
    }
    return '';
  },

  _leafState(leaf, opts) {
    if (!opts.rangeQuery) return '';
    const leaves = opts.rangeQuery.leaves;
    if (leaves.length === 0) return '';
    if (leaves.length === 1) return 'start';
    const idx = leaves.indexOf(leaf);
    if (idx === 0) return 'start';
    if (idx === leaves.length - 1) return 'end';
    return 'middle';
  },

  _computeEdgeStyle(e) {
    const dx = e.x2 - e.x1;
    const dy = e.y2 - e.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return {
      lenX: Math.abs(dx),
      lenY: 2,
      angle: angle,
      x1: e.x1,
      y1: e.y1
    };
  },

  _countNodes(node) {
    if (!node) return 0;
    if (node.type === 'leaf') return 1;
    let count = 1;
    for (let i = 0; i < node.children.length; i++) {
      count += this._countNodes(node.children[i]);
    }
    return count;
  },

  _appendLog(text) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' +
                 now.getMinutes().toString().padStart(2, '0') + ':' +
                 now.getSeconds().toString().padStart(2, '0');
    const log = this.data.log.slice();
    log.unshift({ time: time, text: text });
    if (log.length > 50) log.pop();
    this.setData({ log: log });
  },

  _summarizeSteps(steps) {
    const splitCount = steps.filter(s => s.type === 'split' || s.type === 'rootSplit').length;
    return splitCount > 0 ? '触发 ' + splitCount + ' 次分裂' : '无分裂';
  }
});
```

- [ ] **Step 5: Verify page renders**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/bplus-tree.test.js`
Expected: PASS（utils 测试未受影响）

- [ ] **Step 6: Commit**

```bash
git add pages/bplus-viz/
git commit -m "feat(bplus-viz): 页面骨架 + 控制条 + 树视图 + 叶子链表 + 操作日志"
```

---

## Task 5: 注册 + 首页集成 + 模块文档

**Files:**
- Modify: `app.json`（在 `pages` 数组中按字母序插入 `pages/bplus-viz/bplus-viz`）
- Modify: `utils/tool-registry.js`（在 algo 分类下新增 `bplus-viz` 工具，`available: true`）
- Create: `docs/handoff/modules/bplus-viz.md`

**Interfaces:**
- Consumes: 无
- Produces: 工具在首页可见

- [ ] **Step 1: Modify `app.json`**

在 `pages` 数组中按字母序插入 `"pages/bplus-viz/bplus-viz"`（在 `dashboard` 之后，`ds-viz` 之前）。完成后 `pages` 数组应为：

```json
[
  "pages/index/index",
  "pages/quiz-list/quiz-list",
  "pages/import-preview/import-preview",
  "pages/quiz/quiz",
  "pages/result/result",
  "pages/records/records",
  "pages/record-detail/record-detail",
  "pages/wrong-questions/wrong-questions",
  "pages/dashboard/dashboard",
  "pages/bplus-viz/bplus-viz",
  "pages/subnet-calc/subnet-calc",
  "pages/sort-viz/sort-viz",
  "pages/tcp-viz/tcp-viz",
  "pages/ds-viz/ds-viz"
]
```

- [ ] **Step 2: Modify `utils/tool-registry.js`**

在 `algo` 分类中（`ds-viz` 之后）插入新工具条目：

```js
{
  id: 'bplus-viz',
  category: 'algo',
  name: 'B+ 树可视化',
  icon: '🌲',
  description: '阶数 m 可调 · 节点分裂 · 范围查询',
  route: '/pages/bplus-viz/bplus-viz',
  available: true,
  featured: false,
  order: 3
},
```

- [ ] **Step 3: Write `docs/handoff/modules/bplus-viz.md`**

```md
# B+ 树可视化（B+ Tree Visualization）

> 由 `2026-07-12-bplus-tree-design.md` spec 实施落盘。

## 概览

交互式 B+ 树可视化教学工具：阶数 m 可调（4-32），支持插入 / 查询 / 范围查询操作，展示节点分裂动画与叶子链表遍历路径。

## 数据驱动

- `utils/bplus-node.js`：LeafNode / InternalNode 数据结构 + buildLayout 布局算法
- `utils/bplus-split.js`：splitLeaf / splitInternal 纯函数（Convention A 提升右叶首 key）
- `utils/bplus-tree.js`：`BPlusTree` 类，暴露 `insert(key)` / `search(key)` / `rangeQuery(lo, hi)` 三个方法，均返回 steps 数组用于可视化

## 约定

| 项 | 取值 |
|---|---|
| 阶数 m 含义 | m-1 keys / node，m children / internal |
| Leaf split | splitIdx = ceil(m/2)；提升右叶首个 key（Convention A） |
| Internal split | splitIdx = ceil(m/2)；移除中间 key |
| 重复 key | 覆盖 |
| 范围查询 | 含 lo / 含 hi（左闭右闭） |
| lo > hi | 返回 error |

## 测试

`tests/utils/{bplus-node,bplus-split,bplus-tree}.test.js` 全覆盖（边界用例：m-th key 触发分裂、多层分裂、范围查询跨叶子）。`npm test` 全绿。

## UI

页面布局：顶部控制条（m 滑块 + 操作 tabs + 输入） + 树视图（嵌套 `<view>` 层级渲染） + 叶子链表（横向 row 渲染） + 操作日志（最多 50 条）。

风格遵循 Claude Design 暖奶油画布。
```

- [ ] **Step 4: Verify homepage shows the new tool**

打开微信开发者工具，导航到首页 → 「算法 & 数据结构」分类 → 应看到 B+ 树可视化卡片已可点击（不再是「即将上线」）。

Expected: 卡片显示「进入 ›」链接。

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS（之前所有测试 + bplus 3 个测试文件的所有测试）

- [ ] **Step 6: Commit**

```bash
git add app.json utils/tool-registry.js docs/handoff/modules/bplus-viz.md
git commit -m "feat(bplus-viz): 注册页面 + tool-registry 可用化 + 模块文档"
```

---

## Task 6: 验证完成 + PROJECT_HANDOFF 同步

**Files:**
- Modify: `PROJECT_HANDOFF.md`

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 2: Verify page renders without errors**

打开微信开发者工具，导入 `pages/bplus-viz/`，阶数 m=4，插入 10 → 20 → 30 → 40（触发首次分裂）。

Expected:
- 4 次插入后，根变为 internal
- 树视图显示 1 个 internal 节点 + 2 个 leaf 节点
- 叶子链表显示 2 个叶子，中间以 ↔ 连接
- 操作日志记录 4 条插入 + 1 条分裂

- [ ] **Step 3: Append to `PROJECT_HANDOFF.md`**

在 `## 8. 最近重大变更` 顶部插入：

```md
### 2026-07-12 · B+ 树可视化上线

**变更内容**

- 新增 `pages/bplus-viz/` 页面（4 文件）
- 新增 3 个 utils 纯函数模块：`bplus-node.js` / `bplus-split.js` / `bplus-tree.js`
- 新增 3 个测试文件（共 ~30 个测试）
- `utils/tool-registry.js` 在 algo 分类下新增 `bplus-viz`（available: true）
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/bplus-viz.md` 模块文档

**理由**

- 数据库 / 数据结构教学需求：B+ 树是数据库索引的核心
- 与 `ds-viz` (BST) 互补，覆盖两类经典树形结构
- Convention A 提升规则（提升右叶首 key）匹配大多数数据库教材

**影响**

- spec: `docs/superpowers/specs/2026-07-12-bplus-tree-design.md`
- plan: `docs/plans/2026-07-12-bplus-tree.md`
- `npm test` 全绿
```

- [ ] **Step 4: Commit**

```bash
git add PROJECT_HANDOFF.md
git commit -m "docs(handoff): B+ 树可视化上线记录"
```

---

## 验收清单（实施完成后）

- [ ] `npm test` 全绿
- [ ] 微信开发者工具中，`pages/bplus-viz/` 加载无报错
- [ ] 阶数 m=4 插入 10, 20, 30, 40 → 第 4 次触发分裂，根变 internal
- [ ] 范围查询 [25, 55] 在 7 个 key 后正确返回 [30, 40, 50]
- [ ] 阶数变化 → 树自动清空 + toast 提示
- [ ] lo > hi → 显示错误信息
- [ ] 首页「算法 & 数据结构」分类 → B+ 树可视化卡片可点击
- [ ] PROJECT_HANDOFF.md 已更新