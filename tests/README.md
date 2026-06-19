# Tests

[English](README_EN.md)

Jest 测试目录，覆盖所有纯 JS 逻辑。

## 测试结构

```
tests/
├── utils/                              # 工具函数测试
│   ├── util.test.js                    # 通用工具函数
│   ├── storage.test.js                 # 本地存储封装
│   ├── markdown-parser.test.js         # Markdown 解析器
│   ├── analytics.test.js               # 学习分析
│   ├── subnet.test.js                  # 子网计算
│   ├── bst.test.js                     # 二叉搜索树
│   ├── graph.test.js                   # 图算法
│   ├── hash-table.test.js              # 哈希表
│   ├── tcp-states.test.js              # TCP 状态机
│   └── tool-registry.test.js           # 工具注册表
│
└── pages/                              # 页面逻辑测试
    ├── quiz-engine.test.js             # 刷题引擎
    └── sort-viz.test.js                # 排序可视化
```

## 运行测试

```bash
npm test
```

## 当前状态

- 11 个测试套件
- 218 个测试用例
- 全部通过 ✓

## 约定

- 测试文件命名：`<module>.test.js`
- 纯逻辑必须 100% 覆盖
- 页面逻辑尽量抽到 `utils/` 后测试
- 微信 API 通过 `__mocks__/wx.js` 模拟
