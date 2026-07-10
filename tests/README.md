# Tests

[English](README_EN.md)

Jest 测试目录，覆盖所有纯 JS 逻辑。

## 测试结构

```text
tests/
├── utils/                              工具函数测试（11 个文件覆盖 6 个）
│   ├── util.test.js                    通用工具函数
│   ├── storage.test.js                 本地存储封装
│   ├── markdown-parser.test.js         Markdown 解析器
│   ├── analytics.test.js               学习分析
│   ├── subnet.test.js                  子网计算
│   └── (bst.test.js / graph.test.js / hash-table.test.js /
│       tcp-states.test.js / tool-registry.test.js 暂无, 见 future-plans.md §P4)
│
└── pages/                              页面逻辑测试
    ├── quiz-engine.test.js             刷题引擎
    └── sort-viz.test.js                排序可视化
```

## 运行测试

```bash
npm test
```

## 当前状态（2026-07-10 核对）

- 12 个测试套件 / 236 个测试用例
- 全部通过 ✓

> 早期文档声称"11 suites / 218 tests"，已与实测对齐。

## 约定

- 测试文件命名：`<module>.test.js`
- 纯逻辑必须尽可能覆盖（目标 ≥ 80%）
- 页面逻辑尽量抽到 `utils/` 后测试
- 微信 API 通过 `__mocks__/wx.js` 模拟

## 详细说明

被测模块的上下文与算法说明见 `docs/handoff/modules/`，架构全局见 [`docs/handoff/architecture.md`](../docs/handoff/architecture.md)。
