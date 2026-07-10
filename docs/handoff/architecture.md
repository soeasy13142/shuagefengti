# 架构与数据流

> 派生自 `PROJECT_HANDOFF.md` §3、§5、§6、§7.1、§10。

## 1. 产品定位与现状

`刷个冯题` 是一个微信小程序学习工具箱。
- **MVP**：Markdown 试题导入 → 练习/考试刷题 → 答题记录 → 错题本
- **已扩展**：学习驾驶舱、子网计算器、TCP 状态机动画、数据结构可视化、排序可视化
- **未实现**：单词记忆（首页预留 `available: false`）

## 2. 技术路线

| 维度 | 选择 |
|---|---|
| 框架 | 微信小程序原生（WXML + WXSS + JS） |
| 存储 | `wx.setStorageSync` 本地存储，无后端 |
| Markdown 解析 | 纯正则手写，不引第三方 Markdown 库 |
| 测试 | Jest（仅纯 JS 逻辑） |
| 设计系统 | Claude Design 暖奶油画布（参见 `docs/DESIGN.md`） |
| 包大小策略 | 不引入图标库 / 字体文件 / 图表库 |

## 3. 数据流主线（刷题）

```text
用户选择 .md 文件
  ↓
quiz-list 调用 wx.chooseMessageFile
  ↓
读取文件内容 wx.getFileSystemManager().readFileSync
  ↓
utils/markdown-parser.js 解析题目
  ↓
utils/storage.js 暂存 tempImportData（避开 URL 超长）
  ↓
import-preview 显示题型统计和确认导入
  ↓
确认后保存到 papers 本地存储
  ↓
quiz-list 展示试卷列表
  ↓
点击试卷进入 quiz 刷题页
  ↓
选择 practice / exam 模式
  ↓
答题过程中 answers 记录每题答案和正确性
  ↓
交卷后生成 record 并保存 records
  ↓
错题写入 wrongQuestions
  ↓
result 展示成绩
  ↓
records / record-detail / wrong-questions 用于复盘
```

## 4. 首页工具箱结构

- 顶部品牌区：`刷个冯题`
- Hero 主入口：`开始刷题`
- 全宽卡片：`学习驾驶舱`
- 功能卡片（按顺序）：子网计算器 / 排序可视化 / 单词记忆（即将上线） / TCP 动画机 / 数据结构可视化
- 底部快捷入口：答题记录 / 错题本

## 5. 当前文件结构（核心）

```text
my-miniapp/
├── app.js / app.json / app.wxss
├── pages/
│   ├── index/                首页（Hero + 工具箱）
│   ├── quiz-list/            试卷列表 + 导入入口
│   ├── import-preview/       导入预览（含题型统计）
│   ├── quiz/                 刷题核心（支持 practice / exam 模式）
│   ├── result/               成绩结果
│   ├── records/              答题记录列表
│   ├── record-detail/        记录详情（逐题复盘）
│   ├── wrong-questions/      错题本
│   ├── dashboard/            学习驾驶舱
│   ├── subnet-calc/          子网计算器
│   ├── sort-viz/             排序可视化
│   ├── tcp-viz/              TCP 状态机动画
│   └── ds-viz/               数据结构可视化
├── utils/                    11 个工具模块（纯 JS）
├── tests/                    Jest
├── docs/                     设计 / 文档规范
└── PROJECT_HANDOFF.md        索引（≤100 行，详见本目录各专题）
```

`utils/` 下各模块的详细描述见 `docs/handoff/modules/<module>.md`。

## 6. 页面注册（app.json 共 13 个）

参见 `app.json` 的 `pages` 数组：

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
  "pages/subnet-calc/subnet-calc",
  "pages/sort-viz/sort-viz",
  "pages/tcp-viz/tcp-viz",
  "pages/ds-viz/ds-viz"
]
```

`window.navigationBarBackgroundColor` 已经是 `#faf9f5`（暖奶油）。

## 7. 测试状态

- **测试命令**：`cd /Users/charliepan/Downloads/my-miniapp && npm test`
- **当前结果**：12 suites / 236 tests，全部通过（2026-07-10 整理时核对）
- **覆盖**：utils 全覆盖；pages 引擎逻辑部分覆盖；WXML/WXSS 渲染无自动化测试
- **不在覆盖范围**：`wx.chooseMessageFile` 等小程序 API 真实调用、UI 渲染、文件存储容量错误
