# Utils

[English](README_EN.md)

纯 JS 工具函数库，不依赖微信 API，可在 Jest 中独立测试。

## 文件列表

| 文件 | 说明 | 测试文件 |
|---|---|---|
| `util.js` | 通用工具函数（时间格式化、数组去重、深拷贝等） | `tests/utils/util.test.js` |
| `storage.js` | 本地存储 CRUD 封装（set/get/remove/clear） | `tests/utils/storage.test.js` |
| `markdown-parser.js` | Markdown 试题解析器（纯正则，无第三方依赖） | `tests/utils/markdown-parser.test.js` |
| `sample-questions.js` | 示例试题数据，供开发和测试使用 | — |
| `analytics.js` | 学习数据分析（正确率、趋势、建议） | `tests/utils/analytics.test.js` |
| `subnet.js` | 子网计算逻辑（IP 解析、CIDR 计算、地址分类） | `tests/utils/subnet.test.js` |
| `bst.js` | 二叉搜索树算法（插入、删除、遍历等） | `tests/utils/bst.test.js` |
| `graph.js` | 图论算法（BFS、DFS、最短路径） | `tests/utils/graph.test.js` |
| `hash-table.js` | 哈希表实现 | `tests/utils/hash-table.test.js` |
| `tcp-states.js` | TCP 状态机定义和状态转换逻辑 | `tests/utils/tcp-states.test.js` |
| `tool-registry.js` | 首页工具注册表配置 | `tests/utils/tool-registry.test.js` |

## 约定

- 纯函数，不依赖微信 API（`wx.*`）
- 每个文件对应一个 `tests/utils/<name>.test.js` 测试文件
- 新增工具函数后同步新增测试
- 使用 CommonJS 导出（`module.exports`），兼容微信小程序环境
