# 刷个冯题 · 交接文档（INDEX）

> 最后更新：2026-07-11 · 全项目 code review 完成（6 维度并行 review + 修复落地）
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
- 仍 deferred（**已在 2026-07-11 var-cleanup 范围外**，留待后续 plan）：
  - ~~`pages/quiz / record-detail / sort-viz / tcp-viz / ds-viz / index` 的 `var` 迁移（pages 第一批仅 dashboard 完成；其余 5 个 pages 文件含 ~190 处 var，**r.7 候选**）~~ → **已完成（见下方 §8 · 2026-07-11 var 全清零 plan 实施完成）**
  - ~~`utils/sort-algorithms.js` 内 24 处 `var`（随 Task 8 byte-for-byte 搬迁；**r.6 候选**）~~ → **已完成（见下方 §8 · 2026-07-11 var 全清零 plan 实施完成）**
  - `tests/` 下 ~222 处 `var`（**r.8 候选**；tests/ 不在 var-cleanup 范围）
- 不主动 `git push`：等待用户决定（squash / 直推 / 回退 / 继续修 `tests/` 内 var）

参见：`docs/plans/2026-07-11-normalization.md` 实施计划 · `.superpowers/sdd/progress.md` 任务账本 · `docs/superpowers/specs/2026-07-11-normalization-design.md` design spec

### 2026-07-11 · var 全清零 plan 实施完成（8 Task · 7 commit）

**变更内容**

- 范围：仅 `utils/` + `pages/`（`tests/` 不在范围内，r.8 候选）
- 7 文件 / **283 处 var → const/let**（24 + 1 + 9 + 65 + 34 + 131 + 19），按方案 B 每文件 1 commit：
  - `727a3f1` `refactor(utils/sort-algorithms): var → const/let 全迁移`
  - `a7faf99` `refactor(pages/quiz): var → const/let 全迁移`
  - `ceb46bf` `refactor(pages/record-detail): var → const/let 全迁移`
  - `2864f78` `refactor(pages/sort-viz): var → const/let 全迁移`
  - `681879e` `refactor(pages/tcp-viz): var → const/let 全迁移`
  - `e3e0e8f` `refactor(pages/ds-viz): var → const/let 全迁移`
  - `39a2f8d` `refactor(pages/index): var → const/let 全迁移`
- 全程 `npm test` gate 全绿（12 suites / 236 tests）不变
- subagent 正确判定了 4 个「再次赋值」变量（`tools` / `currentTools` / `availableTools` / `unavailableTools`）改 `let`，其他改 `const`；纠正了 brief 里两条与文件实际不符的判定规则（`pages/index` 不存在 `for (var i)` 循环；该用 `let` 不能 `const`）

**理由**

- 接续上次 normalization 计划末尾 deferred 的 r.6（`utils/sort-algorithms.js`）+ r.7（5 个 pages 文件），一次性清理
- spec `docs/superpowers/specs/2026-07-11-var-cleanup-design.md` 经 brainstorming → writing-plans → 用户批准；计划文档 `docs/plans/2026-07-11-var-cleanup.md`（619 行 / 50 checkbox）
- 严格按 CLAUDE.md「## 代码风格」section 约定 —— `var` 全替为 `const` 或 `let`，不加新逻辑、不改空白风格
- subagent 主动识别 brief 错误而非机械执行，避免运行时 `TypeError: Assignment to constant variable`

**影响**

- 本次上下文清理后，`utils/` + `pages/` 内 `grep -rnE '\bvar\b'` 已无输出（仅历史 docs 与 tests/ 仍含）
- `tests/` 内 ~222 处 `var` 仍待清理（r.8 候选）；不在本次 plan 范围
- baseline = `1f59fba`；共 7 个 refactor commit + 1 个 handoff docs commit（前置 spec/plan 共 3 commit 计入实施准备）
- pre-docs-commit HEAD = `39a2f8d`；handoff docs commit HEAD = `b629afb`
- 不主动 `git push`：等待用户决定

参见：`docs/plans/2026-07-11-var-cleanup.md` 实施计划 · `docs/superpowers/specs/2026-07-11-var-cleanup-design.md` design spec · `.superpowers/sdd/progress.md` var-cleanup 账本段

### 2026-07-11 · 全项目 code review 完成

**变更内容**

- 6 维度并行 Workflow fan-out（SEC / COR / PERF / BUS / I18N / QUAL），各 1 个 Sonnet level agent，共 571k tokens / 248 tool calls / ~4 分钟
- 产出 `docs/review/2026-07-11-full-review.md`（154 条发现：2 Critical / 47 High / 53 Medium / 27 Low / 16 Info）
- 与 2026-06-15 报告并列对照：24 项仍存，4 项已修（GAP-10/13、COR-13/20），1 项回归（COR-32 ds-viz `const key` TypeError）

**已修复**（用户审批后）

| 类型 | 数量 | 内容 |
|---|---|---|
| Critical | 1 | ds-viz.js `const key → let key`（var→const 迁移回归） |
| P1 High | 4 | finishQuiz autoSave、onLoad 参数校验 3 处、storage 守卫 2 处 |
| Medium | 3 | COR-12 startTime、COR-15 onHide/unload、COR-19 questionTypes 快照 |
| Low | 6 | console.log、catch 空块、deletePaper id、markMastered return、sort 比较器、quickSort 阴影 |
| Test var | 222 | 6 个测试文件 var→let 全迁移 |

**Follow-up**

- I18N：追加到 `docs/handoff/future-plans.md` §P6，独立 plan 实施
- 剩余 47 High + 53 Medium 项：详见报告 `docs/review/2026-07-11-full-review.md` §10

**理由**

- 覆盖 2026-06-15 之后所有变更（含 b9a543b var→const/let 全清零 refactor 专项回归）
- 新增业务一致性（BUS）/ i18n 兼容性（I18N）两个维度
- spec `docs/superpowers/specs/2026-07-11-code-review-design.md` → plan `docs/plans/2026-07-11-full-code-review.md`

**影响**

- 当前 HEAD=`a134be3`
- 18 项 06-15 遗留未修中，已修 6 项（COR-01/03/05、BUS-10-01、QUAL-01-001/05-001），仍存 12 项
- 不主动 `git push`
