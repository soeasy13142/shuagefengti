# 刷个冯题

[English](README_EN.md)

微信小程序学习工具箱，集刷题练习、算法可视化、网络计算于一体的多功能学习助手。

## 功能模块

### 刷题系统

- **Markdown 试题导入**: 支持多格式 Markdown 试题文件解析，自动识别题型（单选、多选、判断、填空、简答）
- **试卷管理**: 试卷列表、导入预览、题型统计
- **双模式刷题**: 练习模式（即时反馈）、考试模式（限时作答，统一交卷）
- **答题记录**: 历史记录查看、每次作答详细报告
- **错题本**: 自动收录错题，支持错题重做

### 可视化工具

- **排序可视化**: 冒泡排序、选择排序、插入排序、快速排序等算法的动画演示
- **数据结构可视化**: BST（二叉搜索树）、栈与队列、哈希表、图（BFS/DFS）四种模式的交互演示
- **TCP 动画机**: TCP 状态机动画，展示三次握手、四次挥手等协议状态转换
- **子网计算器**: IP/CIDR 计算、二进制位可视化、地址分类判断

### 学习驾驶舱

- 刷题统计数据总览
- 7 天学习趋势图
- 智能学习建议

## 技术栈

- **框架**: 微信小程序原生（WXML + WXSS + JS）
- **存储**: wx.setStorageSync / wx.getStorageSync 纯本地存储
- **解析**: 纯正则 Markdown 解析，无第三方依赖
- **测试**: Jest（11 个测试套件，218 个测试用例全部通过）
- **设计风格**: Claude Design 暖奶油画布风格

无后端、无云服务、无账号体系。所有数据存在用户本地。

## 项目结构

```
my-miniapp/
├── app.js / app.json / app.wxss      # 小程序入口及全局配置
├── project.config.json                # 微信开发者工具配置
├── package.json                       # npm 依赖（Jest 等）
├── jest.config.js                     # Jest 测试配置
├── test-questions.md                  # 测试用试题样例
│
├── pages/                             # 页面目录（13 个页面）
│   ├── index/                         # 首页 / 工具箱入口
│   ├── quiz-list/                     # 试卷列表
│   ├── import-preview/                # 导入预览
│   ├── quiz/                          # 刷题页（一题一页）
│   ├── result/                        # 交卷结果
│   ├── records/                       # 答题记录列表
│   ├── record-detail/                 # 记录详情
│   ├── wrong-questions/               # 错题本
│   ├── dashboard/                     # 学习驾驶舱
│   ├── sort-viz/                      # 排序可视化
│   ├── subnet-calc/                   # 子网计算器
│   ├── tcp-viz/                       # TCP 动画机
│   └── ds-viz/                        # 数据结构可视化
│
├── utils/                             # 工具函数库
│   ├── util.js                        # 通用工具函数
│   ├── storage.js                     # 本地存储 CRUD 封装
│   ├── markdown-parser.js             # Markdown 试题解析器
│   ├── sample-questions.js            # 示例试题数据
│   ├── analytics.js                   # 学习数据分析
│   ├── subnet.js                      # 子网计算逻辑
│   ├── bst.js                         # 二叉搜索树算法
│   ├── graph.js                       # 图论算法
│   ├── hash-table.js                  # 哈希表实现
│   ├── tcp-states.js                  # TCP 状态机
│   └── tool-registry.js              # 首页工具注册表
│
├── tests/                             # 测试文件
│   ├── utils/                         # 工具函数测试
│   └── pages/                         # 页面逻辑测试
│
├── docs/                              # 设计文档
├── design-previews/                   # 品牌设计预览（74 个品牌）
└── __mocks__/                         # Jest mock（wx API 等）
```

## 快速开始

### 前置要求

- 微信开发者工具
- Node.js ≥ 16

### 本地运行

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 用微信开发者工具打开项目根目录
```

### 导入试题

1. 准备 Markdown 格式试题文件（参考 `test-questions.md` 格式）
2. 在微信开发者工具中运行小程序
3. 首页点击「开始刷题」→「导入试卷」→ 选择文件

## 设计风格

采用 **Claude Design 暖奶油画布** 风格：

| 元素 | 颜色 |
|---|---|
| 页面背景 | `#faf9f5` 暖奶油 |
| 卡片背景 | `#efe9de` 奶油卡片 |
| 主色调 | `#cc785c` 珊瑚色 |
| 正文 | `#141413` 暖墨 |
| 深色表面 | `#181715` |

详见 `PROJECT_HANDOFF.md`。

## 测试

```bash
npm test
```

当前状态：11 个测试套件，218 个测试用例，全部通过。

## 相关文档

- `PROJECT_HANDOFF.md` — 项目交接文档，包含完整的架构设计、数据流、开发进度
- `docs/superpowers/specs/` — 设计规格说明
- `docs/superpowers/plans/` — 实现计划
