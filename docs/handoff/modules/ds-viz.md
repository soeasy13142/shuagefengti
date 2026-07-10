# 数据结构可视化（Data Structure Visualization）

> 本节在 `PROJECT_HANDOFF.md` 中**没有对应章节**，由本整理任务基于 `pages/ds-viz/` + `utils/{bst,graph,hash-table}.js` 实际代码补写。

## 概览

四种数据结构的交互演示，集中在 `pages/ds-viz/ds-viz.js`：

| 模式 | 实现位置 | 说明 |
|---|---|---|
| BST（二叉搜索树） | `utils/bst.js` + 页面 | 插入 / 删除 / 三种遍历 |
| 栈 & 队列 | `pages/ds-viz/ds-viz.js` 页面内置 | push/pop/enqueue/dequeue 实时动画 |
| 哈希表 | `utils/hash-table.js` + 页面 | 冲突处理 + 链地址法可视化 |
| 图搜索 | `utils/graph.js` + 页面 | BFS / DFS + 三种预设图结构 |

页面通过 `data.currentMode` 切换模式：`bst` / `stack-queue` / `hash` / `graph`。

## 分层模式（标准做法）

- 算法步骤生成在 `utils/` 纯函数模块（bst / graph / hash-table）
- 栈&队列的逻辑较简单，直接在页面内实现（无独立工具模块）
- 页面只负责调用算法取步骤序列 + 渲染
- 这样算法可独立测试，UI 换风格不影响逻辑

## 4 种模式详解

### 1. BST（utils/bst.js）

- `createNode(value)`：构造节点
- `cloneTree(node)`：深拷贝（步骤快照用）
- `inOrderValues(node)`：中序遍历 → 有序值数组
- `findMin(node)`：找子树最小值节点（删除后继用）
- 插入 / 删除 / 三种遍历（前序 / 中序 / 后序）每步生成树快照
- 布局算法在页面中按值映射坐标

### 2. 栈 & 队列（页面内置）

- 切换 `sqType: 'stack' | 'queue'`
- 操作：`onSqPush` / `onSqPop` / `onSqEnqueue` / `onSqDequeue`
- 每步生成 elements 快照 + description
- 步骤格式 `{ type, value, elements, description }`

### 3. 哈希表（utils/hash-table.js）

- 链地址法（separate chaining）
- `createHashTable(size)`：初始化
- 哈希函数：字符串 key → 字符编码求和取模
- 插入 / 查找 / 冲突处理每步生成桶快照
- 默认桶数 7（页面 `hashTableSize`）

### 4. 图搜索（utils/graph.js）

- 三种预设图：
  - `simple`（5 节点 / 5 边）
  - `tree`（7 节点二叉树状 / 6 边）
  - `cycle`（5 节点有环 / 6 边）
- BFS / DFS 每步返回访问序列
- 邻接表 `adjList` 存储

## 测试

- `tests/pages/quiz-engine.test.js`
- `tests/pages/sort-viz.test.js`
- **暂无**：`tests/pages/ds-viz.test.js` / `tests/utils/bst.test.js` / `tests/utils/graph.test.js` / `tests/utils/hash-table.test.js`
- 测试覆盖建议见 `future-plans.md`（P3：算法模块独立测试）

## 设计风格

页面已切到 Claude Design 暖奶油画布（参见 `docs/DESIGN.md`）。
