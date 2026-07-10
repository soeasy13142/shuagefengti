# Utils

[English](README_EN.md)

纯 JS 工具函数库，不依赖微信 API，可在 Jest 中独立测试。

## 文件列表

| 文件 | 说明 | 测试文件 |
|---|---|---|
| `util.js` | 通用工具函数（时间格式化、ID 生成、时长格式化） | `tests/utils/util.test.js` |
| `storage.js` | 本地存储 CRUD 封装（papers / records / wrongQuestions / tempImportData） | `tests/utils/storage.test.js` |
| `markdown-parser.js` | Markdown 试题解析器（纯正则，无第三方依赖） | `tests/utils/markdown-parser.test.js` |
| `sample-questions.js` | 示例试题数据，供开发和测试使用 | — |
| `analytics.js` | 学习数据分析（dashboard 数据聚合 + 智能建议规则） | `tests/utils/analytics.test.js` |
| `subnet.js` | 子网计算逻辑（IP 解析、CIDR 计算、地址分类、AND 步生成） | `tests/utils/subnet.test.js` |
| `bst.js` | 二叉搜索树算法（创建、克隆、遍历、最小值查找） | 暂无（ds-viz 用） |
| `graph.js` | 图论算法（BFS/DFS + 三种预设图） | 暂无（ds-viz 用） |
| `hash-table.js` | 哈希表实现（链地址法冲突解决） | 暂无（ds-viz 用） |
| `tcp-states.js` | TCP 状态机定义与步骤生成（握手/挥手/数据传输/丢包+快重传） | 暂无 |
| `tool-registry.js` | 首页工具注册表配置 | — |

> 测试覆盖建议见 `docs/handoff/future-plans.md` §P4。

## 约定

- 纯函数优先，避免依赖微信 API（`wx.*`）
- 每个文件**如有可能**对应一个 `tests/utils/<name>.test.js` 测试文件（部分算法模块尚未添加，见上表）
- 新增工具函数后同步新增测试
- 使用 CommonJS 导出（`module.exports`），兼容微信小程序环境

## 详细说明

各模块的设计与算法说明见 `docs/handoff/modules/`。架构全局说明见 [`docs/handoff/architecture.md`](../docs/handoff/architecture.md)。
