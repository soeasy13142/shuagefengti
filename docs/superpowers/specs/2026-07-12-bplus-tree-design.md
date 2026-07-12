# B+ 树可视化 · 设计文档

> 日期：2026-07-12
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：项目目前 0 个数据库类工具，将作为「全新方向」在 `utils/tool-registry.js` 中新增分类或归入 `algo` 分类。

## 1. 目标

为「刷个冯题」小程序新增一个 **B+ 树** 的可视化教学页面：用户可调阶数 m，执行插入 / 查询 / 范围查询操作，看到 B+ 树的节点分裂动画和叶子链表遍历过程。帮助数据库 / 数据结构学习者直观理解 B+ 树的索引机制（与磁盘页对齐、范围查询友好的特性）。

## 2. 范围

包含：
- B+ 树类（内部节点 + 叶子节点 + 叶子双向链表）
- 操作：`insert(key)` / `search(key)` / `rangeQuery(lo, hi)`
- 阶数 m：UI 滑块 4-32 可调（调阶数后清空树）
- 节点分裂动画（左右滑开）
- 范围查询时沿叶子链表 next 指针的顺序高亮
- 路径动画（操作执行时的从根到叶子的路径）
- 操作日志（每步操作的状态变化记录）

不包含（明确不做）：
- 删除操作（合并 / 借键动画复杂度高，进 backlog）
- 持久化到磁盘（纯内存 B+ 树）
- 值存储（仅 key，无 value）
- 唯一约束 / 重复 key 拒绝
- 多列 / 复合 key
- 节点缓存 / Buffer Pool 模拟

## 3. 架构

新增 / 修改文件：

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/bplus-viz/bplus-viz.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/bplus-tree.js` | 新增 | BPlusTree 类 + 操作函数 |
| `utils/bplus-node.js` | 新增 | InternalNode / LeafNode 数据结构 |
| `utils/bplus-split.js` | 新增 | 节点分裂纯函数 |
| `utils/tool-registry.js` | 修改 | 新增 `bplus-viz` 工具（category: algo） |
| `app.json` | 修改 | 注册 `pages/bplus-viz/bplus-viz` |
| `tests/utils/bplus-tree.test.js` | 新增 | insert/search/rangeQuery 测试 |
| `tests/utils/bplus-split.test.js` | 新增 | 节点分裂测试 |
| `tests/utils/bplus-node.test.js` | 新增 | 节点数据结构测试 |
| `docs/handoff/modules/bplus-viz.md` | 新增 | 模块专题文档 |

## 4. 组件

### 4.1 顶部控制条

```text
阶数 m: [滑块 4 ────●──── 32] (当前 m=4)
操作:    [插入][查询][范围查询]
输入:    [input 输入框]  [▶ 执行]  [↻ 清空]  [🎲 随机插入 5 个]
```

- 阶数变化 → 自动清空树 + toast "阶数已变更，树已重置"

### 4.2 树状视图（嵌套 view 渲染层级）

```text
                  ┌─────────────────┐
                  │  [10  20]       │  ← 内部节点 (keys)
                  └────────┬────────┘
                ┌──────────┴──────────┐
         ┌──────▼──────┐      ┌───────▼─────┐
         │ [5  7]      │      │ [15  18]    │
         └──────┬──────┘      └───────┬─────┘
                │                     │
    ┌───────────┴────┐    ┌──────────┴──────────┐
    │ ↓→[5,7]→       │    │ ↓→[15,18]→         │  ← 叶子节点
    └────────────────┘    └─────────────────────┘
```

- 节点 = 圆角矩形卡片
- key = 卡片内的小矩形
- 当前操作路径 = 红色边框（插入 / 查询） / 黄色边框（范围查询）
- 节点分裂动画：300ms 滑开

### 4.3 叶子链表视图（底部横向链表）

```text
[5, 7] ←→ [15, 18] ←→ [25, 30, 35] ←→ [40, 50]
   ↑                       ↑                  ↑
   lo                      (中段)             hi
```

- 双向箭头 `←→`
- 范围查询时：从 lo 叶子到 hi 叶子顺序点亮（蓝 → 黄）

### 4.4 操作日志

```text
┌────────────────────────────────────────┐
│ 操作日志                                │
│ 12:34:56 插入 key=20                   │
│   → 路径: 根[10,20] → [15,18]          │
│   → 叶子节点 [15,18,20] 满了 (m=4 上限)│
│   → 分裂: 左节点 [15,18], 右节点 [20]   │
│   → key=18 提升到父节点                │
└────────────────────────────────────────┘
```

## 5. 数据流

```text
BPlusTree(m)
  ├─ root: LeafNode (空)
  ├─ m: 阶数（每个节点最多 m-1 个 key，最少 ceil(m/2)-1 个 key）
  │
  ├─ insert(key):
  │    1. findLeaf(root, key) → leaf
  │    2. leaf.keys.push(key) (按序插入)
  │    3. if leaf.keys.length > m-1:
  │         split(leaf) → { leftNode, rightNode, promotedKey }
  │         recursively insert promotedKey into parent
  │         if root splits: create new root
  │    4. record step: { type: 'insert', path, splits: [] }
  │    return { steps, tree }
  │
  ├─ search(key):
  │    1. start from root
  │    2. internalNode: find child index by binary search
  │    3. leaf: linear search in keys
  │    4. record step: { type: 'search', path, found }
  │    return { steps, found: key | null }
  │
  └─ rangeQuery(lo, hi):
       1. findLeaf(root, lo) → startLeaf
       2. startLeaf 起，按 next 指针遍历直到 key > hi
       3. 收集所有 keys in [lo, hi]
       4. record step: { type: 'range', path, leaves: [...] }
       return { steps, result: keys[] }
```

`InternalNode` 数据结构：

```js
{
  type: 'internal',
  keys: number[],         // 分隔子节点的 key，length = children.length - 1
  children: Node[]        // 子节点指针
}
```

`LeafNode` 数据结构：

```js
{
  type: 'leaf',
  keys: number[],         // 存储的 key
  values?: any[],         // 可选，第一版不用
  next: LeafNode | null,  // 双向链表后继
  prev: LeafNode | null   // 双向链表前驱
}
```

`Step` 数据结构：

```js
{
  type: 'insert' | 'search' | 'range' | 'split',
  path: Node[],           // 路径节点数组
  highlight: Node[],      // 当前高亮节点
  explanation: string,    // 文案说明
  splits?: { node, leftNode, rightNode, promotedKey }[]
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| m < 3 | 报错（B+ 树最少 3 阶才有意义），UI 限制 4 起 |
| m > 32 | UI 滑块上限 32（性能 + 可视化） |
| 重复 key | **覆盖**语义（与 B+ 树标准行为一致）：找到已存在的 key，替换 |
| 空树 search / rangeQuery | 合法返回：`search` → `null`，`rangeQuery` → `[]` |
| 输入非数字 | input 校验，红色边框 |
| 阶数变化 | 自动清空树 + toast 提示 |
| 操作执行中阶数变化 | 禁用阶数滑块 / 操作执行完再允许 |
| rangeQuery `lo > hi` | 报错 "lo 必须 ≤ hi" |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/bplus-tree.test.js` | 插入触发分裂（m-1 vs m 边界）、多层分裂（递归向上到根）、search 命中/未命中、rangeQuery 边界（含 lo / 含 hi / lo > hi / 空结果）、不同 m 值（4/8/16/32）的功能正确性 |
| `tests/utils/bplus-split.test.js` | split 后左右节点 keys 完整性、提升 key 正确性 |
| `tests/utils/bplus-node.test.js` | InternalNode / LeafNode 字段初始化、prev/next 指针 |

**关键测试用例**：

```js
// 插入触发分裂的边界
test('insert triggers split at m-th key', () => {
  const tree = new BPlusTree(4)
  tree.insert(10); tree.insert(20); tree.insert(30)
  // 此时叶子 [10,20,30] 不满
  tree.insert(40)
  // 此时叶子 [10,20,30,40] 满了 (m-1=3 已超)，分裂
  // 期望：分裂为 [10,20] 和 [30,40]，20 提升
  expect(tree.root.type).toBe('internal')
})

// rangeQuery 沿叶子链表
test('rangeQuery follows leaf linked list', () => {
  const tree = new BPlusTree(4)
  ;[10, 20, 30, 40, 50, 60, 70].forEach(k => tree.insert(k))
  // 期望叶子链表：[10,20,30] ←→ [40,50,60,70] ←→ null
  const result = tree.rangeQuery(25, 55)
  expect(result).toEqual([30, 40, 50])
})

// 多层分裂
test('insert causes root split and new root created', () => {
  const tree = new BPlusTree(4)
  ;[10, 20, 30, 40, 50, 60, 70].forEach(k => tree.insert(k))
  // 多次插入触发多层分裂
  expect(tree.root.type).toBe('internal')
  expect(tree.root.keys.length).toBeGreaterThan(0)
})
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布。
2. **纯函数优先**：`bplus-tree.js` / `bplus-node.js` / `bplus-split.js` 中类方法尽量返回新对象或 step 记录，不就地修改（除内部状态管理必要外）。
3. **节点数量限制**：UI 上限 100 个节点（性能 + 渲染清晰）。
4. **动画规范**：节点分裂用 WXSS `transition: transform 300ms`；路径高亮用 border + 背景色。
5. **叶子链表指针**：维护双向链表便于范围查询时的反向遍历。
6. **m 值与扇出**：UI 上限 m=32 是经验值（再大渲染会糊）。
7. **更新 PROJECT_HANDOFF**：完成时追加变更记录。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| 节点分裂逻辑易写错（边界条件多） | 严格的 unit test（m-1 / m / 多层分裂） |
| 树渲染性能（深嵌套 view） | m 上限 32，节点数上限 100，超过警告 |
| 重复 key 语义歧义 | 明确为"覆盖"语义 + 文档说明 |
| 范围查询的 prev/next 指针维护 | 单元测试覆盖边界 |

未来可拓展：
- 删除操作（合并 / 借键动画）
- Buffer Pool 模拟（节点 = 磁盘页）
- 持久化到本地存储
- 多列 / 复合 key
- 与 SQL JOIN 算法结合（用 B+ 树做索引扫描）
- 唯一约束 / 重复 key 拒绝
- 与 LSM 树对比（log-structured merge-tree）

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-12-bplus-tree.md`，按 RED → GREEN → IMPROVE 分阶段实施。