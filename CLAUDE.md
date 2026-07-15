# CLAUDE.md

Project instructions and memory for Claude Code.

> **任何开始**：先读本文 → 再读 `PROJECT_HANDOFF.md` 相关章节 → 再开始动手。
> **任何结束**：追加 `PROJECT_HANDOFF.md`（决策 / 新约定 / 踩过的坑）。

---

## 项目交接文档

`/Users/charliepan/Downloads/my-miniapp/PROJECT_HANDOFF.md` 是项目的交接文档。

- **每次做出修改前**，务必先阅读这个文档
- **修改完成后**，务必追加和修改这个交接文档

---

## DO / DON'T 必读规范（最高优先级 · 红线）

### ✅ DO —— 必做

> 🔴 **总铁律 · 优先级最高**：任何不确定 → **必须问**。禁止替用户决策。
> 见 **D2** —— 这是贯穿 D1-D5 的总原则，凌驾于一切具体动作之上。
> 一旦脑子里冒出"我觉得都行 / 选个默认就好 / 按惯例来吧"的念头 → 立即 `AskUserQuestion`，**不要犹豫、不要"先做着再说"**。

#### D1. 复杂任务必须先写 plans（落到 `docs/plans/`）
- **触发条件**（满足任一即视为"复杂任务"）：
  - 需要 ≥ 3 个步骤
  - 涉及 ≥ 2 个文件
  - 涉及架构 / 约定 / 数据模型决策
  - 用户明显表达了"先规划 / 想清楚再改 / 别上来就写"的意思
- **流程**：
  1. `superpowers:brainstorming` —— 探索方案、列选项
  2. `superpowers:writing-plans` —— 输出结构化 plans
  3. 写入 `docs/plans/<feature-or-fix-name>.md`（**必须落盘**）
  4. **等用户确认**后再开始动手
- **每个 plan 至少包含**：目标 / 范围 / 不做什么 / 涉及文件清单（精确到 .js / .wxml / .wxss / .json）/ 步骤拆解（含 RED→GREEN→IMPROVE 标记）/ 风险与回退 / 测试方案
- **不需要 plans 的例外**：单文件 ≤10 行改动 / typo 修复 / 用户明确指定的单点修改

#### D2. 🔴 必问原则 · 最高铁律 · AskUserQuestion 是默认行为

> **Claude 不得在未得到用户明确答复的情况下擅自做出任何决策。**
> 这条铁律凌驾于一切具体动作之上。

**默认行为 = AskUserQuestion**

在你决定动手之前，先问。除非本仓库 `CLAUDE.md` / `PROJECT_HANDOFF.md` / `README` 里**明文写过**该怎么做，否则一律先 `AskUserQuestion`。

---

**三档触发清单**

🔴 **必须问**（默认行为 · 出现以下任何一条，立即 `AskUserQuestion`）

- 库 / 框架 / 工具 / 包选型
- UI 风格、配色、字体、文案措辞、emoji
- 命名约定（变量 / 文件 / 函数 / 类 / 常量）
- 方案 A vs B、技术路线、架构取舍
- CSS 数值（字号、颜色、圆角、间距、阴影、字间距）
- 「看似细枝末节」的偏好：空格 / 单双引号 / 注释密度 / 分隔线 / 字段顺序
- 改动程度（是小改、重构还是重写）
- 改动边界（哪些文件 / 字段 / 行 / 章节不动）

🟡 **可问可不问**（仅限一类 · 几乎不开口子）

- 用户已在**本会话、或 `CLAUDE.md` / `PROJECT_HANDOFF.md` / `README` 中明文约定过**的事实 → 引用出处，直接执行
- 引用不出来 → 走回 🔴 档

🟢 **不问**（刻意为空 · 防止绕开口子）

- 此档刻意不列。任何场景都应通过 🔴 / 🟡 档处理
- 如果你觉得自己属于这一档，立即回到 🔴 档

---

**禁止的念头清单**

出现以下任何一条，立刻停下来，调用 `AskUserQuestion`：

- ❌「我觉得都行 / 选个默认就好 / 按惯例来吧」
- ❌「先这样做，后面再调整」
- ❌「这种小事应该不用问吧」
- ❌「为了显得能干活」自己拍一个
- ❌「我猜用户大概会选 X」然后直接执行 X

**错误成本判断**

问 10 次多问的损失 << 擅自拍板一次带来的重做代价。

**怎么问**

- 调用 `AskUserQuestion`，给 **2-4 个互斥选项**（含 `Other` 让用户填空）
- `label` 简洁、`description` 清晰说明取舍与影响
- 多个独立问题并存 → **一次性发**，不要一个问题问完等回答再问下一个

#### D3. 修改前查 PROJECT_HANDOFF.md，修改后追加
- 历史决策、命名、约定都在那里
- 任何新增约定也要回写到这里

#### D4. 测试驱动（TDD）
- 新功能 / Bug 修复 / 重构：先写测试（RED）→ 最小实现（GREEN）→ 重构（IMPROVE）
- 覆盖率目标 ≥ 80%
- 触发：`ecc:tdd-guide` 强制流程

#### D5. 任何"完成"声明前先验证
- `npm test` 必须全绿
- 必要时 `superpowers:verification-before-completion` 端到端验证
- 不能只看代码"像对"就宣称完成

#### D6.尽可能保持主会话的上下文不被塞满

- #### 如果遇到大量读写工作，就开SubAgent。

### ❌ DON'T —— 禁止

#### X1. 不要替用户做决策
- 见 D2；任何"自己能拍板"的场景都改成"先问"

#### X2. 不要跳过 plans 直接动复杂任务
- 见 D1；只有写明的例外可以跳过

#### X3. 不要未经询问就创建 / 删除 / 大幅重写文件
- 结构级变更（新建 / 删除文件、改目录结构、改 .json 配置）必须先 `AskUserQuestion`

#### X4. 不要硬编码 secrets / API keys
- 走环境变量或 `wx.getStorageSync`；提交前自查

#### X5. 不要在未明确要求时 `git commit` 或 `git push`
- 用户没说 commit → 只在本地改完即可
- 用户没说 push → **绝不** `git push`（见下方 Git 提交规范）

#### X6. 不要留下 `console.log` / `wx.*` 调试输出
- 生产代码必须清理

#### X7. 不要未经 `npm test` 通过就宣称"实现完成"
- 配合 D5

#### X8. 不要主动选 UI 风格 / 库 / 命名 / 数值
- 即便已有偏好，也走 `AskUserQuestion` 让用户再确认一次

---

## Git 提交规范

> 总原则：**本地可以密，远程必须整**。

### 本地 commit
- **频率、细粒度尽可能提高**：每个 RED→GREEN 转换、小步重构、临时试验点都可以 commit
- 每个 commit **单一关注点**
- 提交信息遵循 **Conventional Commits**：`feat: / fix: / refactor: / docs: / test: / chore: / perf: / ci:`
- 例：✅ `feat: 实现 Markdown 解析器支持三级标题嵌套`；❌ `update`、`tmp`、`asdf`

### 推送到远端（务必先整理合并）
- **一次 push = 一个完整的逻辑单元**（feature / fix / refactor / docs 块）
- 推荐节奏：每完成一个明确可独立运行的功能或修复，**1 天 1-3 次**
- 推送前自查清单：
  ```text
  □ git log origin/<branch>..HEAD         —— 看清楚待推送的所有 commits
  □ 必要时 git rebase -i origin/<branch>  —— squash / 拆分 / 改写消息
  □ npm test                              —— 相关测试全绿
  □ PROJECT_HANDOFF.md                    —— 是否需要同步（架构 / 约定 / 踩坑）
  □ git push -u                           —— 仅在用户明确要求时执行
  ```
- 整理原则：
  - 一组紧密关联的 WIP commits → squash 成一个 `feat:` 或 `fix:`
  - 中间的 "调试 / 实验 / 重做" 痕迹必须消失
  - 最终 commit message 要让协作者或半年后的自己看懂"这次提交是为了什么"

### 提交信息示例
- ✅ `feat: 实现 Markdown 解析器支持三级标题嵌套`
- ✅ `fix: 修复列表项含特殊字符时的解析错位`
- ✅ `refactor: 抽取 timeline 渲染为独立 utils`
- ❌ `update`、`修复bug`、`tmp`、`asdfasdf`

### 分支策略

#### 原则

新功能、Bug 修复、重构等涉及多文件的改动 → **必须从 master 开新分支开发**，禁止直接在 master 上提交。

可以直接在 master 上提交的例外（仅限便捷修改）：
- 单文件 ≤10 行的改动
- typo / 文案修正
- 纯文档或配置变更（.md / .json）
- 纯测试代码添加

#### 命名格式

```
<type>/<kebab-case-description>
```

| type | 用途 | 示例 |
|---|---|---|
| `feature` | 新功能 | `feature/dns-resolver` |
| `fix` | Bug 修复 | `fix/sha256-crash` |
| `refactor` | 重构 | `refactor/normalize-utils` |
| `docs` | 文档 | `docs/readme-update` |
| `test` | 测试 | `test/add-coverage` |

- 描述用英文 kebab-case，简短精确
- 用完即删：合并回 master 后删除本地和远程分支

#### 生命周期

```
master ──┬── feature/my-thing ── ... ──┬── master (合并后)
          │  (自由 commit)              │
          └─────────────────────────────┘
                                        ↓
                                  git branch -d feature/my-thing
```

1. **创建**：从最新 master 开分支 `git checkout -b feature/xxx master`
2. **开发**：在分支上自由 commit，**不限制频率和内容粒度**
3. **合入准备**：
   - `npm test` 全绿
   - `git rebase -i master` 整理分支 commits（squash / 拆分 / 改写）
   - 同步 `PROJECT_HANDOFF.md`（如有新约定 / 踩坑）
4. **合并**：
   - 切回 master：`git checkout master`
   - 合并：`git merge --no-ff feature/xxx`
   - 删除分支：`git branch -d feature/xxx`
5. **推送**：按下方推送规范执行（需用户明确要求）

#### 与 X5 红线的关系

- 分支上的 commit **不受 X5 限制**，可随时本地提交
- X5 的"未经要求不得 commit"仅约束 **master 分支**
- X5 的"未经要求不得 push"适用于所有分支（推送至远程需用户确认）

---

## Subagent / Workflow 使用规范

> **目的**：长任务用后台 subagent 不阻塞主会话 context；短任务不走子 agent 避免无谓开销。

### 核心原则

- **能不阻塞主会话的任务 → 默认派后台 subagent**
- **只需一句话回答 / 一眼能确认的改动 → 留在主会话**

### ✅ 建议用 subagent（`Agent` 工具）

| 场景 | 本项目案例 | 原因 |
|---|---|---|
| 新功能纯逻辑开发（utils + 对应测试） | `utils/sha256.js` + `sha256-trace.js` + 测试 | 独立模块，读完 plan 就能干，返回摘要即可 |
| 大规模批量化重构 | var→const/let 迁移（7 文件 · 283 var） | 改动量大但规律明确，一把梭完不占主 context |
| 全库搜索 + 批量替换 | grep + sed 清理 console.log / sort 比较器修复 | 输出量大，后台跑完汇报结论 |
| 跑全量测试 | `npm test`（jest --verbose 输出几百行） | 输出长，后台不阻塞 |
| 代码审查 | `ecc:code-reviewer` | 独立审查，不占主会话上下文 |
| 查文档 / API | `context7-mcp` resolve + query | 独立的信息获取，拿到结果回答即可 |
| 多工具并行探索代码库 | 同时查某个 API 在哪些文件出现 | 各自独立搜索，汇总给我 |

### ✅ 建议用 workflow（`Workflow` 工具）

workflow 比 subagent 重，适合**脚本化编排大量 agent**的场景。

| 场景 | 本项目案例 | 原因 |
|---|---|---|
| 全量代码审查·多维度并行 | 2026-07-11 安全 + 性能 + 正确性各一个 agent | 多个维度各一个 agent，汇总后出报告 |
| 新功能全链路自动化 | DNS 可视化：plan→impl→test→review→handoff | 多阶段有先后依赖，拿脚本编排 |
| 大范围多文件并行改动 + 工作树隔离 | 同时改 10 个文件的某个 pattern | 各干各的，互不干扰 |
| 深度多源交叉验证研究 | 查某个 RFC 实现 + 对比各语言实现 | 多 agent 独立查源，汇总交叉验证 |

### ❌ 不要用 subagent / workflow

| 场景 | 理由 |
|---|---|
| 单文件 ≤10 行改动 | agent 启动开销 > 改文件本身 |
| typo / 文案小修 | 直接改就行 |
| 需要频繁来回确认的任务 | subagent **不能** `AskUserQuestion`，会卡住 |
| CSS 微调、UI 微调（需看效果） | 需要迭代反馈，subagent 给不了 |
| 用户刚说完一句话立刻跟进的连续小修改 | 不必要地打断工作流 |
| 需要理解你完整意图才能决策的任务 | 主会话才有全部上下文 |

### 默认行为与使用约定

1. **subagent 默认后台执行** — 不阻塞主会话，除非我明确说"这个我在前台做"
2. 你也可以主动要求：*"用 subagent 做 X"* 或 *"这个在前台做"*
3. 如果某个 subagent 完成的结果有问题，我可以派新的 subagent 去修正，**不需要重跑整个任务**

### 本项目特定适用说明

| 任务类型 | 走 subagent？ | 原因 |
|---|---|---|
| **写 plans（`docs/plans/`）** | ❌ 主会话 | 需要跟你反复讨论确认，subagent 不能 AskUserQuestion |
| **画 UI（WXML / WXSS）** | ❌ 主会话 | 需要视觉上的迭代调整 |
| **并行写多个独立 utils + 测试** | ✅ 各一个 subagent | 互不依赖，可并发（需注意 worktree 隔离） |
| **写一个工具的全部文件（utils→page→test）** | ⚠️ 看情况 | 如果方案已确定 → subagent；如果途中要确认命名/结构 → 主会话 |
| **合并分支 + 推送** | ❌ 主会话 | 需要按 checklist 逐项确认 |
| **同步 PROJECT_HANDOFF.md** | ❌ 主会话 | 需要你确认哪些决策值得记 |
| **调研新技术 / 查文档** | ✅ subagent | 独立信息获取，回来告诉我结论即可 |

---

## 技能路由（强制 · 不可跳过 · UI/UX/设计任务专用）

> 本节只针对 **UI / 页面 / 交互 / 品牌 / 设计系统** 类任务；一般代码任务请直接看 "ECC 必用命令清单"。

### 第一步：任务分类

将用户请求归入以下类别之一（可多选）：

| 类别 | 触发关键词 / 场景 |
|---|---|
| **UI/页面设计** | 新建页面、改 UI、布局、样式、配色、卡片、按钮、表单、响应式 |
| **UX/交互设计** | 用户流程、交互方案、信息架构、可用性、无障碍、用户研究 |
| **品牌/设计系统** | 品牌标识、设计 token、Logo、企业 VI、设计规范 |
| **代码审查** | 完成一批改动后、PR review、找 bug、安全审计、代码质量 |
| **文档/API 查询** | 库、框架、SDK、API、CLI 工具、配置、迁移、版本（即使是 React/Next.js 等已知库） |
| **规划/架构** | 大功能规划、多文件改动、架构决策、实现方案设计 |
| **纯逻辑/工具函数** | 工具函数、存储封装、解析器、算法实现 |
| **微信小程序页面** | 小程序页面开发（WXML/WXSS/JS） |

### 第二步：查表匹配技能

| 类别 | 优先技能 | 备选技能 | 说明 |
|---|---|---|---|
| **UI/页面设计** | `ui-ux-pro-max` | `claude-design`、`ckm-design` | `ui-ux-pro-max` 最全面；`claude-design` 是本项目当前使用的暖奶油画布风格 |
| **UX/交互设计** | `ux-designer` | `ui-ux-pro-max` | `ux-designer` 专注用户研究和信息架构 |
| **品牌/设计系统** | `ckm-design-system` | `ckm-brand`、`ckm-design` | 适合设计 token、组件规范、品牌一致性 |
| **代码审查** | `code-reviewer` | — | 完成改动后必须调用 |
| **文档/API 查询** | `context7-mcp` | — | **即使你认为自己知道答案，也必须查最新文档** |
| **规划/架构** | `superpowers:brainstorming` | `superpowers:writing-plans` | 大功能先 brainstorming 再 writing-plans |
| **纯逻辑/工具函数** | 无特定技能 | `code-reviewer`（完成后） | 直接实现，完成后 code-review |
| **微信小程序页面** | `ui-ux-pro-max`（UI 部分） | `claude-design`（风格参考） | 业务逻辑直接实现 |

### 第三步：执行路由

```
路由检查清单（每次对话开头必须打勾）：
□ 已完成任务分类
□ 已查表确定需要的技能
□ 如有匹配技能 → 使用 Skill 工具加载
□ 如无匹配技能 → 在回复开头说明"未找到适用技能"
□ 已在回复开头说明：使用的技能 / 未使用的原因
```

### 第四步：技能使用后的收尾

- **UI 技能**（`ui-ux-pro-max`、`claude-design` 等）：确保实现符合技能中的设计规范
- **`code-reviewer`**：在每批代码改动完成后调用，审查 correctness、security、performance
- **`context7-mcp`**：每次涉及第三方库/API 时必须先 resolve-library-id 再 query-docs

---

## ECC 必用命令与自动触发清单（取代原"ECC 子 Agent"表）

> 聚焦 **本项目（微信小程序原生）实际需要** 的 ECC 命令。与本项目无关的语言专项 / 多端编排已剔除，避免 token 浪费。
> 配套原始仓库：<https://github.com/affaan-m/ECC/blob/main/README.zh-CN.md>

### 强制自动触发（任何时候都要跑）

| 时机 | 命令 / Agent | 用途 |
|---|---|---|
| 任何代码改动完成（哪怕一行） | `ecc:code-reviewer` | 代码审查（**必修**） |
| 新功能 / Bug 修复 / 重构开始前 | `ecc:tdd-guide` | 强制 write-tests-first |
| 任何"完成"声明之前 | `superpowers:verification-before-completion` | 端到端验证，不能口头"已完成" |
| 复杂任务开始（见 D1 触发条件） | `superpowers:writing-plans` | 落 plans 到 `docs/plans/` |
| 复杂任务方案探索阶段 | `superpowers:brainstorming` | 创意发散、列选项 |
| 涉及 Git/PR 流程结束 | `code-review:code-review` 或 `/code-review` | PR 提交前 |

### 条件性触发（按场景使用）

| 条件 | 命令 / Agent |
|---|---|
| 涉及第三方库 / API（任何时候，**即使你认为自己知道**） | `context7-mcp` → 先 `resolve-library-id` 再 `query-docs` |
| 构建 / `npm test` 报错 | `ecc:build-error-resolver` |
| 涉及用户输入 / 认证 / 敏感数据 / 外部 API | `ecc:security-reviewer` |
| `.js` / `.ts` 文件改动（含小程序 JS） | `ecc:typescript-reviewer` |
| 死代码 / 重复 / 重构清理 | `ecc:refactor-cleaner` |
| 功能完成后文档落后 | `ecc:doc-updater` |
| 一次性配置 / hooks / 权限调整 | `update-config` 或 `fewer-permission-prompts` 等工具提示 |

### 不主动使用（本项目不适用 · 避免浪费 token）

- **语言专项审查**：`python-reviewer` / `go-reviewer` / `java-reviewer` / `rust-reviewer` / `cpp-reviewer` / `kotlin-reviewer` / `swift-reviewer` / `csharp-reviewer` / `fsharp-reviewer` / `php-reviewer` / `vue-reviewer` / `react-reviewer` 等 —— 本项目是微信小程序原生框架，不涉及
- **多端 / 多后端编排**（`multi-plan` / `multi-execute` / `multi-backend` / `multi-frontend` / `multi-workflow`）—— 本项目无后端、单端
- **AgentShield 全量扫描**（`npx ecc-agentshield`）—— 个人项目，按需手动启用
- **PM2 / Linux 运维类** —— 与本项目无关
- **continuous-learning v2 / 本能系统**（`/instinct-status` / `/promote` 等）—— 个人项目不需要自动学习
- **电商 / 金融 / 医疗 / 网络架构 等领域 agent** —— 跨领域，不适用

### 速记（推荐别名，方便在对话里直接说）

| 对话中可直接说 | 等价命令 |
|---|---|
| "请跑 code-reviewer" | 启动 `ecc:code-reviewer` |
| "请用 TDD 写这个功能" | 启动 `ecc:tdd-guide` |
| "请用最新文档查 X" / "用 context7 查 X" | 启动 `context7-mcp` |
| "请先 brainstorm" | 启动 `superpowers:brainstorming` |
| "请先写 plans" | 启动 `superpowers:writing-plans`，落 `docs/plans/` |
| "完成前请 verify" | 启动 `superpowers:verification-before-completion` |

---

## 已安装技能速查表

> 仅作为索引；详细使用规范见 "技能路由" 和 "ECC 必用命令清单"。

### 设计类技能

| 技能名 | 用途 | 何时使用 |
|---|---|---|
| `ui-ux-pro-max` | 综合 UI/UX 设计指南（50+ 风格、161 色板、57 字体对） | 新建/重构页面、组件设计、配色、布局、响应式 |
| `ux-designer` | 用户研究、线框图、原型、用户流、信息架构 | 设计用户流程、交互方案、可用性审查 |
| `claude-design` | Claude.com 暖奶油画布编辑式设计语言 | **本项目当前使用的设计风格**，做新页面时参考 |
| `ckm-design` | 综合设计：品牌标识、设计 token、UI 样式、Logo | 品牌相关设计 |
| `ckm-design-system` | 设计系统：token、组件规范、模板 | 建立/维护设计规范 |
| `ckm-brand` | 品牌身份 | Logo、VI、品牌一致性 |
| `ckm-ui-styling` | UI 样式细节 | 具体组件的样式打磨 |
| `ckm-banner-design` | Banner 设计（22 种风格） | 需要 Banner / 广告图时 |
| `ckm-slides` | 演示文稿设计 | 需要制作 PPT / 幻灯片时 |
| `*—design.md`（80+ 个） | 各品牌设计语言参考（Apple、BMW、Tesla 等） | 需要模仿某品牌风格时，如 `apple-design.md` |

### 开发类技能

| 技能名 | 用途 | 何时使用 |
|---|---|---|
| `code-reviewer` | 代码审查（安全、性能、最佳实践） | **每批代码改动完成后必须调用** |
| `context7-mcp` | 查最新文档（库、框架、API） | 涉及任何第三方库 / API 时，**即使你认为自己知道** |
| `find-skills` | 搜索可用技能 | 不确定哪个技能适用时 |

### 规划类技能

| 技能名 | 用途 | 何时使用 |
|---|---|---|
| `superpowers:brainstorming` | 创意发散、方案探索 | 大功能的前期探索 |
| `superpowers:writing-plans` | 编写结构化实施计划 | 确定方向后拆分任务（落 `docs/plans/`） |
| `superpowers:subagent-driven-development` | 子 agent 驱动开发 | 按计划逐步实现 |
| `superpowers:executing-plans` | 执行已有计划 | 按 checkbox 逐项执行 |

---

## 设计风格约束

本项目当前使用 **Claude Design 暖奶油画布** 风格（见 `PROJECT_HANDOFF.md` §25）。

新建或修改页面时，必须遵守：

| 元素 | 规范 |
|---|---|
| 页面背景 | `#faf9f5`（暖奶油） |
| 卡片背景 | `#efe9de`（奶油卡片），圆角 24rpx |
| 主色（CTA） | `#cc785c`（珊瑚色），Active `#a9583e` |
| 标题字体 | Georgia 衬线，400 weight，letter-spacing -3rpx |
| 正文字色 | `#141413`（暖墨） |
| 次要文字 | `#6c6a64` |
| 深色表面 | `#181715`（深海军蓝），文字 `#faf9f5` |
| 阴影 | 零阴影，靠色块对比表达深度 |

参考技能：`claude-design`、`ui-ux-pro-max`

---

## 开发工作流

```
1. 读 PROJECT_HANDOFF.md（每次必读）
   ↓
2. 判断任务类型
   - UI/UX/设计 → 进入"技能路由"
   - 一般代码任务 → 直接进入 ECC 必用命令清单
   ↓
3. 复杂任务？用 superpowers:brainstorming → superpowers:writing-plans → 落 plans 到 docs/plans/
   ↓
4. 等用户确认 plan（X1、X3 红线：未确认不能动手）
   ↓
5. 实现代码：纯逻辑抽 utils/；新增功能走 TDD（RED → GREEN → IMPROVE）
   ↓
6. 运行测试：npm test（必须全部通过）
   ↓
7. 代码审查：ecc:code-reviewer（强制），按反馈修复
   ↓
8. 验证完成：superpowers:verification-before-completion
   ↓
9. 更新 PROJECT_HANDOFF.md（新约定 / 决策 / 踩坑）
   ↓
10. 本地 commit（按 Git 提交规范）
   ↓
11. 仅在用户明确要求时 git push（push 前 squash / 整理）
```

---

## 测试约束

- 测试命令：`cd /Users/charliepan/Downloads/my-miniapp && npm test`
- **任何改动不得导致现有测试失败**
- 新增功能必须伴随对应测试
- 纯逻辑（`utils/`）必须有单元测试
- 页面逻辑尽量抽取纯函数到 `utils/` 后测试

---

## 技术栈约束

- 微信小程序原生框架（WXML + WXSS + JS）
- 纯本地存储（`wx.setStorageSync` / `wx.getStorageSync`）
- 无后端、无云服务（当前阶段）
- Markdown 解析用纯正则，不引入第三方 Markdown 库
- Jest 做纯 JS 逻辑测试
- 不引入图表库，用纯 WXML/WXSS 实现可视化

---

## 文件结构约定

- 新增页面：`pages/<page-name>/`（4 个文件：`.js` / `.wxml` / `.wxss` / `.json`）
- 新增工具函数：`utils/<module-name>.js`
- 新增测试：`tests/utils/<module>.test.js` 或 `tests/pages/<module>.test.js`
- **新增 plans（复杂任务）**：`docs/plans/<feature-or-fix-name>.md` —— 必须落盘，让用户能直接看到
- 新增页面后必须在 `app.json` 注册页面
- 首页入口修改：`pages/index/index.js` + `.wxml` + `.wxss`

## 代码风格

- 统一使用 `const` 与 `let`，**禁用 `var`**（遗留代码迁移过程中允许暂时保留，但新代码不得引入 `var`）
- 顶层模块常量：`UPPER_SNAKE_CASE`
- 私有函数 / 私有模块状态：`_underscore` 前缀
- 异步优先：`Promise` / `async-await`，避免回调地狱
- 错误处理：所有 `catch` 必须显式处理或 `throw`，禁止静默吞
- 注释：`/** */` JSDoc 用于公开 API；行内 `//` 仅用于解释 why

## 命名约定

| 文件类型 | 命名格式 | 示例 |
|---|---|---|
| utils | `<module>.js`（小写 + kebab-case 复合词） | `markdown-parser.js` |
| pages | `<page-name>/` 目录 + 4 文件 | `pages/subnet-calc/` |
| tests/utils | `<module>.test.js` | `tests/utils/subnet.test.js` |
| tests/pages | `<engine>.test.js` | `tests/pages/quiz-engine.test.js` |
| 历史/过程 docs | `YYYY-MM-DD-name.md` | `2026-07-11-normalization-design.md` |
| 项目级主题 docs | `<topic>.md` | `docs/handoff/decisions.md` |
| 测试 fixtures | `tests/fixtures/<name>.md` | `tests/fixtures/test-questions.md` |
| mocks | `tests/__mocks__/<name>.js` | `tests/__mocks__/wx.js` |
| 项目级 plan | `docs/plans/YYYY-MM-DD-<name>.md` | `docs/plans/2026-07-11-normalization.md` |
| spec | `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` | `2026-07-11-normalization-design.md` |

**判定原则**：单字模块直接用单词（`quiz`, `result`）；复合概念用 kebab-case（`quiz-list`, `wrong-questions`）。目录名风格统一遵循 "lowercase + kebab-case for compound"。
