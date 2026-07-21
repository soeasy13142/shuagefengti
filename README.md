# 刷个冯题

[English](README_EN.md)

微信小程序学习工具箱：Markdown 刷题、学习驾驶舱、子网计算、TCP 状态机、数据结构可视化、排序可视化。

所有数据都在本机。不接后端、不需要账号——你导进去的题、刷过的记录、错题本都保存在你的手机里。

最初只想做一个本地刷题工具；后来陆续加了 5 个模块，逐渐变成了一个有点"瑞士军刀"感觉的学习助手。

## 1. 功能清单（7 大模块）

| 模块 | 简介 | 详细 |
|---|---|---|
| 刷题 | MVP 核心。Markdown 导入，五种题型，练习/考试模式，自动错题入栈 | [docs/handoff/modules/quiz.md](docs/handoff/modules/quiz.md) |
| 学习驾驶舱 | 累计统计、题型雷达、7 天趋势、本地规则智能建议 | [docs/handoff/modules/dashboard.md](docs/handoff/modules/dashboard.md) |
| 子网计算器 | IP/CIDR 计算 + 32 位二进制可视化 + AND 运算动画 | [docs/handoff/modules/subnet-calc.md](docs/handoff/modules/subnet-calc.md) |
| TCP 动画机 | TCP 状态机交互，三次握手/四次挥手逐步骤演示 | [docs/handoff/modules/tcp-viz.md](docs/handoff/modules/tcp-viz.md) |
| 数据结构可视化 | BST、栈&队列、哈希表、图 BFS/DFS 四种模式 | [docs/handoff/modules/ds-viz.md](docs/handoff/modules/ds-viz.md) |
| 排序可视化 | 选择/冒泡/快速排序 + 步骤回放 | [docs/handoff/modules/sort-viz.md](docs/handoff/modules/sort-viz.md) |
| 单词记忆 | 即将上线 | — |

## 2. 设计风格

整体采用 **Claude Design 暖奶油画布**：暖奶油背景 `#faf9f5`、奶油卡片 `#efe9de`、珊瑚色 CTA `#cc785c`。零阴影，靠色块对比表达层次。详细规范见 [docs/DESIGN.md](docs/DESIGN.md)。

## 3. 技术栈

- 微信小程序原生框架（WXML + WXSS + JS）
- 纯本地存储（`wx.setStorageSync`）
- Markdown 解析：纯正则手写（不引第三方库，控包大小）
- 测试：Jest 单元测试（当前 12 suites / 236 tests）
- 详见 [docs/handoff/architecture.md](docs/handoff/architecture.md)

## 4. 快速开始

```bash
npm install
npm test
```

然后用微信开发者工具打开项目根目录即可。

导入试题：进入"开始刷题"→"导入试卷"，选一个 Markdown 文件（格式参考根目录的 `test-questions.md`）。

## 5. 文档导航

| 文档 | 用途 |
|---|---|
| [.claude/HANDOFF.md](.claude/HANDOFF.md) | 30 秒恢复上下文 |
| [docs/handoff/](docs/handoff/) | 各模块详解、架构、决策、风险、未来计划 |
| [docs/DESIGN.md](docs/DESIGN.md) | Claude Design 设计规范 |
| [docs/superpowers/specs/](docs/superpowers/specs/) | 原始设计 |
| [docs/superpowers/plans/](docs/superpowers/plans/) | 原始实施计划 |
| [CLAUDE.md](CLAUDE.md) | 项目 Claude 指令（do/don't 红线） |

## 6. 项目目录

```text
├── app.{js,json,wxss}           入口和全局配置
├── pages/                       13 个页面
│   ├── index/                   首页
│   ├── quiz-list/               试卷列表
│   ├── import-preview/          导入预览
│   ├── quiz/                    刷题
│   ├── result/                  交卷结果
│   ├── records/                 答题记录
│   ├── record-detail/           记录详情
│   ├── wrong-questions/         错题本
│   ├── dashboard/               学习驾驶舱
│   ├── subnet-calc/             子网计算器
│   ├── sort-viz/                排序可视化
│   ├── tcp-viz/                 TCP 动画机
│   └── ds-viz/                  数据结构可视化
├── utils/                       工具函数
├── tests/                       Jest
└── docs/                        设计 / 文档规范
```

## 7. 仓库说明

以下文件仅保留在本地，不入 git（已在 `.gitignore`）：

- `TCP.pdf` — 网络协议参考资料（3 MB 二进制）
- `idea.md` — 个人想法草稿

历史归档与过期文档位于 [docs/archive/](docs/archive/)。
