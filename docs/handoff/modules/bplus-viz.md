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
