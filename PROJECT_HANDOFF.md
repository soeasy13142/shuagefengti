# 刷个冯题 · 交接文档（INDEX）

> 最后更新：2026-07-10 · 文档规范化整理
> 完整备份见 `docs/archive/PROJECT_HANDOFF.full-archive.md`（已归档；保留 ≥ 1 周承诺已于 2026-07-11 转入 docs/archive/）。
> 详情见 `docs/handoff/` 专题文档。

## 1. 一句话概述

`刷个冯题` 是一个微信小程序学习工具箱。MVP 刷题已完整闭环（Markdown 导入、五题型、练习/考试模式、答题记录、错题本），并扩展了学习驾驶舱、子网计算器、TCP 动画机、数据结构可视化、排序可视化等模块。纯前端、纯本地存储、无后端。

## 2. 30 秒恢复上下文

```text
项目路径：/Users/charliepan/Downloads/my-miniapp
技术栈：微信小程序原生（WXML/WXSS/JS）+ Jest
存储：wx.setStorageSync（无后端）
解析：utils/markdown-parser.js（纯正则）
刷题引擎：pages/quiz/quiz.js
存储封装：utils/storage.js
统计：utils/analytics.js
网络：utils/subnet.js / utils/tcp-states.js
算法：utils/bst.js / utils/graph.js / utils/hash-table.js
测试命令：npm test
模块入口：根 README.md → docs/handoff/modules/<module>.md
```

## 3. 当前进度

- **测试**：见 `docs/handoff/architecture.md` §7（每次开发前必跑 `npm test`）
- **未提交变更**：`git status --short`
- **本次整理变更**：见 `git log --oneline docs/`

## 4. 关键文件速查

| 用途 | 文件 |
|---|---|
| 页面注册 | `app.json` |
| 首页 | `pages/index/index.{js,wxml,wxss,json}` |
| 刷题引擎 | `pages/quiz/quiz.js` |
| 工具注册表 | `utils/tool-registry.js` |
| 设计风格 | `docs/DESIGN.md` |
| 测试配置 | `jest.config.js`、`tests/__mocks__/wx.js` |

详细模块与文件清单见 `docs/handoff/architecture.md`。

## 5. 文档导航

```text
PROJECT_HANDOFF.md                       ← 本文件（INDEX）
├─ docs/handoff/
│  ├─ architecture.md                    架构、数据流、文件结构、测试状态
│  ├─ modules/
│  │  ├─ quiz.md                         刷题主链路
│  │  ├─ dashboard.md                    学习驾驶舱
│  │  ├─ subnet-calc.md                  子网计算器
│  │  ├─ tcp-viz.md                      TCP 状态机动画
│  │  ├─ ds-viz.md                       数据结构可视化
│  │  └─ sort-viz.md                     排序可视化
│  ├─ data-structures.md                 数据模型
│  ├─ decisions.md                       决策记录
│  ├─ risks.md                           风险与注意点
│  └─ future-plans.md                    下一步开发建议
├─ docs/DESIGN.md                        Claude Design 设计规范
├─ docs/superpowers/specs/2026-05-31-brushfengti-design.md   原始设计
├─ docs/plans/                          项目级实施计划目录（含 2026-05-31 原始计划）
├─ docs/brainstorming/2026-06-13-*.md   历史脑暴
├─ docs/design/2026-06-13-*.md          历史设计决策
├─ docs/review/2026-06-*.md             历史代码审查
└─ docs/archive/                         已归档的旧文档
```

## 6. 下次开场步骤

```text
1. 读本文 §2（30 秒恢复上下文）
2. cd /Users/charliepan/Downloads/my-miniapp && npm test && git status --short
3. 按需求读 docs/handoff/ 对应专题
4. 大功能 → superpowers:brainstorming → superpowers:writing-plans → 等用户批准
5. 写代码 → 跑测试 → 找用户审阅 → commit
6. 追加相关变更到 docs/handoff/decisions.md / risks.md / future-plans.md
```

## 7. 项目级 Claude 指令

参见 `CLAUDE.md`。它是项目级事实表，所有 do/don't 与风格约束以它为准。

## 8. 最近重大变更（变更记录）

### 2026-07-11 · CLAUDE.md D2 升级「极致版 + 三档场景清单」

**变更内容**

- D2 措辞升级为**极致版**：「Claude 不得在未得到用户明确答复的情况下擅自做出任何决策」
- 新增**三档触发清单**（内嵌于 D2 段内）：
  - 🔴 **必须问**：默认行为；列了 8 类典型场景
  - 🟡 **可问可不问**：仅限「用户已明文约定过」一类；引用不出来就走回 🔴
  - 🟢 **不问**：刻意为空，防止「绕开口子」

**理由**

- 此前 D2 已存在「宁问十遍，不擅一次」，但实操中偶有「擅自拍板」倾向
- 用户要求强化默认行为；分场景清单为 Claude 提供清晰判断口径
- 🟢 档刻意为空，反向避免漏问

**影响**

- 后续所有会话遇到灰色地带默认先 `AskUserQuestion` 再动手
- 唯一豁免：用户已明文约定的事实（必须引用出处）

参见：`CLAUDE.md` § D2

### 2026-07-11 · 项目规范化 plan 实施完成（11 Task）

**变更内容**

- **结构层（10 项）**全部落地：
  - `__mocks__/wx.js` → `tests/__mocks__/wx.js`（Task 2，jest setupFiles 路径同步）
  - `test-questions.md` → `tests/fixtures/test-questions.md`（Task 3）
  - 新建 `docs/plans/` + 迁移 `docs/superpowers/plans/` 全部内容（Task 4）
  - `PROJECT_HANDOFF.full-archive.md`（125 KB）→ `docs/archive/`（Task 5）
  - 加 `.gitignore` 丢弃 `design-methods/`、`design-previews/`、`.DS_Store`，并 `git rm --cached`（Task 1）
  - `docs/DESIGN.md` 收敛为 4 行指向 CLAUDE.md 唯一源（Task 6）
  - CLAUDE.md 新增 `## 代码风格` + `## 命名约定` 两节（Task 6）
  - PROJECT_HANDOFF.md §4 / §5 索引同步（Task 10）
- **代码风格层（3 项）**全部落地：
  - `var` → `const`/`let` 全迁移（Task 7，8 文件：utils/analytics、utils/bst、utils/graph、utils/hash-table、utils/sample-questions、utils/subnet、utils/tcp-states、pages/dashboard/dashboard.js）
  - `pages/sort-viz/sort-viz.js` 抽出 sort-step 生成器到 `utils/sort-algorithms.js`（Task 8；导出 `bubbleSort / selectionSort / quickSort`）
  - `tests/pages/sort-viz.test.js` 改为 import 真实实现，删除 92 行 duplicating（Task 9，**修 r.3**）

**理由**

- spec `docs/superpowers/specs/2026-07-11-normalization-design.md` 经 brainstorming → writing-plans → 用户批准全流程
- 全程保持 12 suites / 236 tests 全绿
- baseline = `0d0ac01`；HEAD = `87dbe2f`；共 17 个 commit

**影响**

- 项目进入「约定文档化」状态：新人读 CLAUDE.md 即知命名 / 风格 / 文件结构
- 仍 deferred（**已在 2026-07-11 normalization 范围外**，留待后续 plan）：
  - `pages/quiz / record-detail / sort-viz / tcp-viz / ds-viz / index` 的 `var` 迁移（pages 第一批仅 dashboard 完成；其余 5 个 pages 文件含 ~190 处 var，**r.7 候选**）
  - `utils/sort-algorithms.js` 内 24 处 `var`（随 Task 8 byte-for-byte 搬迁；**r.6 候选**）
- 不主动 `git push`：等待用户决定（squash / 直推 / 回退 / 继续修剩余 var）

参见：`docs/plans/2026-07-11-normalization.md` 实施计划 · `.superpowers/sdd/progress.md` 任务账本 · `docs/superpowers/specs/2026-07-11-normalization-design.md` design spec
