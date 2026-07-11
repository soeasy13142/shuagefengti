# 规范化 Design Spec · `刷个冯题`

> 日期：2026-07-11 · 状态：用户已批准（4 节 design 全部 OK）
> 基线 commit：`0d0ac01`（CLAUDE.md D2 极致版）
> 设计者：Claude（superpowers:brainstorming 输出）

---

## 0. TL;DR

把项目从"能跑但散乱"提升到"易维护、易扩展、约定文档化"。范围 = 结构层 + 代码风格层。基线 commit：`0d0ac01`。

---

## 1. 目标与范围

### 目标

清理物理结构、消除文档双源、统一命名风格、补齐 CLAUDE.md 缺失约束、修一处已知测试反模式。

### 范围

- **结构层**（10 项变更）
- **代码风格层**（3 项变更）

### 不做

- 业务逻辑重构
- 模块功能新增
- UI 改版
- 测试新增（除 r.3 sort-viz 修复这一已知风险）
- `docs/handoff/*` 主题文档内容改写
- 双语 README 现状保留（pages/、utils/、tests/ 仍各保留 README + README_EN）

### 关键约束

- `npm test` 任何节点都不能 regress（12 套件 236 测试全绿作为 gate）
- commit 按 conventional commits 分组 squash
- 仅本地 commit，不主动 `git push`
- baseline = `0d0ac01`

### 依赖

纯本地。无外部依赖、无云、无第三方库。

### 回退原则

整个 spec 失败 → `git reset --hard 0d0ac01`

---

## 2. 结构层变更（10 项）

### A. 目录迁移（4 项）

| # | 现状 | 目标 | 联动 |
|---|---|---|---|
| 1 | `__mocks__/wx.js` 在项目根 | `tests/__mocks__/wx.js` | `jest.config.js` 的 `setupFiles` 由 `<rootDir>/__mocks__/wx.js` 改为 `<rootDir>/tests/__mocks__/wx.js` |
| 2 | `docs/plans/` 不存在 | `docs/plans/` + `README.md` | 从 `docs/superpowers/plans/` 迁 2 个文件并重命名为 `YYYY-MM-DD-name.md` 通用名；`docs/superpowers/plans/` 仅留 specs 同级 |
| 3 | `PROJECT_HANDOFF.full-archive.md`（125KB）在项目根 | `docs/archive/PROJECT_HANDOFF.full-archive.md` | `PROJECT_HANDOFF.md` 引用路径同步 |
| 4 | `test-questions.md` 在项目根 | `tests/fixtures/test-questions.md` | 检查 `utils/sample-questions.js` 是否硬引用，决定要不要更新；并存放 README 标识其作用 |

### B. 入库规则收紧（3 项）

| # | 现状 | 目标 |
|---|---|---|
| 5 | `design-methods/` + `design-previews/` 共 152 文件入库 | 加 `.gitignore` + `git rm --cached -r`；本地保留 |
| 6 | `.DS_Store` 根 ignore 但子目录可见 | `.gitignore` 强化 + `git rm --cached` 现有 tracked 文件清理 |
| 7 | `legacy-homepage` 分支现状 | **保留**（用户决定） |

### C. 文档双源收敛（1 项）

| # | 现状 | 目标 |
|---|---|---|
| 8 | `docs/DESIGN.md` 是 CLAUDE.md 设计风格约束的副本（r.10） | 缩为 5 行：`本文件以 CLAUDE.md「设计风格约束」为唯一源。本文件不再单独维护。` |

### D. CLAUDE.md 补完整约束（2 项）

| # | 现状 | 目标 |
|---|---|---|
| 9 | `var` vs `const` 无文档化规则 | 在 CLAUDE.md「文件结构约定」或新加「代码风格」section 中明确：项目统一 `const` + `let`，禁用 `var`；legacy 例外允许暂时保留但逐步迁移 |
| 10 | 文档/测试命名未文档化 | 在 CLAUDE.md「文件结构约定」明确命名分级规则：<br>• 非时间敏感 docs → `<topic>.md`<br>• 历史/过程文档 → `YYYY-MM-DD-name.md`<br>• 测试 fixtures → `tests/fixtures/`<br>• tests 文件 → `tests/{utils,pages}/<name>.test.js` |

---

## 3. 代码风格层变更（3 项）

### A. `var` → `const`/`let` 全仓库迁移（8 文件）

涉及文件（事实来自 2026-07-11 Explore 扫描）：

```
utils/analytics.js
utils/bst.js
utils/graph.js
utils/hash-table.js
utils/sample-questions.js
utils/subnet.js
utils/tcp-states.js
pages/dashboard/dashboard.js
```

**做法**

| 步骤 | 操作 | 注意 |
|---|---|---|
| 1 | 机械替换 `var` → `const`（只读绑定） | 大部分变量是初始赋值 + 不再赋值，直接 `const` |
| 2 | 循环/累加等可重赋值 → `let` | 逐行判断 |
| 3 | 顶层模块级 `var CONST_NAME` 检查是否有遗漏 | `tcp-states.js` 有 `TCP_STATES` / `TCP_FLAGS` 已用 const，确认一致性 |
| 4 | 每文件 commit，跑 `npm test` 验绿 | 单文件粒度 |

**风险与缓解**

- `for (var i ...)` 改为 `let` 是行为不变；但若曾在 `setTimeout` / 闭包里依赖 `var` hoisting → 行为变化，必须逐个 fix
- 微信小程序 JS 引擎对 ES2015+ 标准支持完整（wxs/wxml 运行层除外）
- 验证：迁移后 `grep -rn '\bvar\b' utils pages | grep -v '\.git'` 应仅剩 legacy 标记或空
- **批次 4 完成态**：仓库内对 `utils/` 和 `pages/` 的 `var` grep 必须为 0；`docs/archive/` 等历史文档不计入

### B. CLAUDE.md「代码风格」section 新增

```
## 代码风格

- 统一使用 const 与 let，禁用 var（遗留代码迁移过程中允许暂时保留，但新代码不得引入 var）
- 顶层模块常量：UPPER_SNAKE_CASE
- 私有函数 / 私有模块状态：_underscore 前缀
- 异步优先：Promise / async-await，避免回调地狱（如适用）
- 错误处理：所有 catch 必须显式处理或 throw，禁止静默吞
- 注释：JSDoc /** */ 用于公开 API；行内 // 仅用于解释 why
```

### C. sort-viz 测试从 duplicating 改为 import（修 r.3）

**现状**：`tests/pages/sort-viz.test.js` 重写了一遍 sort-step generator，没测真实页面逻辑（r.3 已记录）。

**修法**

```
1. 新建 utils/sort-algorithms.js
   - 把 pages/sort-viz/ 内纯 sort-step 生成器（bubble / selection / insertion / ...）抽出
2. pages/sort-viz/sort-viz.js
   - 改为 const { bubbleSort, ... } = require('../../utils/sort-algorithms.js')
   - 同步更新页面绑定（this.setData 等业务流不动）
3. tests/pages/sort-viz.test.js
   - const { ... } = require('../../utils/sort-algorithms.js')
   - 删 duplicating 实现
4. 测试断言不变（覆盖原行为）
```

**风险与缓解**

- 抽离 export/import 跨 page/utils 边界 — 需测试 mock `utils/sort-algorithms.js` 的 wx 副作用（如果 page 在该函数调用时有 wx.toast 之类）
- 若 page 把 sort 逻辑深度耦合 UI state → 抽离可能要补一个适配层（按需，不预设）
- 实际改前先扫 `pages/sort-viz/sort-viz.js` 是否有 wx 副作用，但代码层面只是 import + 删除 duplicating

---

## 4. 执行批次、回退、提交

### A. 执行批次

| 批次 | 内容 | 风险 | Gate |
|---|---|---|---|
| 0 · 准备 | `git status` 干净；记录 HEAD sha | 0 | git status --short = 空 |
| 1 · 入库规则 | 加 `.gitignore`；`git rm --cached -r` | 低 | `git ls-files \| grep -E 'design-(methods\|previews)\|DS_Store'` 为空 |
| 2 · 目录迁移 | `__mocks__/` 下移；`test-questions.md` 迁 `tests/fixtures/`；`docs/plans/` 建 + 迁；`PROJECT_HANDOFF.full-archive.md` 迁 `docs/archive/`；改 `jest.config.js` / `PROJECT_HANDOFF.md` / CLAUDE.md 路径引用 | 低-中 | `npm test` 全绿 |
| 3 · 文档双源收敛 | `docs/DESIGN.md` 改 5 行；CLAUDE.md 加「代码风格」+ 命名约定 | 低 | 文档渲染 OK |
| 4 · `var`→`const`/`let` | 8 文件逐一迁移；每文件跑 `npm test` | 中 | `npm test` 全绿 |
| 5 · sort-viz 修复 | 抽 `utils/sort-algorithms.js`；改 import | 中-高 | `npm test` 全绿 + 测试覆盖原行为 |
| 6 · 验证 | `npm test`；`git status --short`；入口索引同步；grep 残留检查 | 0 | 全绿 |

### B. 回退原则

| 触发 | 操作 |
|---|---|
| 任何批次 `npm test` 失败 | `git reset --hard HEAD~1` 回退该批次 |
| 文档/metadata 批次失败 | 同上 |
| 全 spec 失败 | `git reset --hard 0d0ac01` |
| `legacy-homepage` 分支 | 本次不动 |

### C. 提交策略

- 一个批次可能多个 commit，按"单一关注点"拆
- 例：`__mocks__/` 移动 + `jest.config.js` 改路径 = 1 commit；`test-questions.md` 迁 = 另 1 commit
- 每 commit 后 `npm test`
- 全 spec 完成后，按 Git 提交规范**整理一个 squash view**（不主动 push，等用户指示）

### D. 自动校验 checklist

```text
□ 全仓库 grep '\bvar\b' 仅剩 .DS_Store / docs/archive/ 等遗留
□ __mocks__/ 不在项目根
□ tests/__mocks__/wx.js 存在
□ docs/plans/ 存在 + 含 README.md + 含 2 个迁过来的 plans 文件
□ docs/superpowers/plans/ 仅留 specs 同级目录（plans 文件已迁）
□ PROJECT_HANDOFF.full-archive.md 不在项目根
□ design-methods/ + design-previews/ 不被 git track
□ docs/DESIGN.md ≤ 5 行
□ CLAUDE.md 含「代码风格」section
□ npm test：12 suites, 236 tests, all green
□ legacy-homepage 分支保留
```

---

## 5. 不在范围 / 后续

下列议题**不在本次 spec 范围**，留待后续 spec 处理：

- 模块功能新增（P3 单词记忆模块）
- parser edge case 修复（r.6）
- essay 自评分机制（r.7）
- 项目转云存储（P5 + future-plans）
- AI 学习建议增强（与 utils/analytics.js 的 suggestions 形状协同）

---

## 6. 关联文档

- `CLAUDE.md` § D2（极致版 AskUserQuestion 原则）—— 任何不在本 spec 明文记载的决策，都走 D2 🔴 档
- `PROJECT_HANDOFF.md` § 8 变更记录 —— 后续实施完成后追加 § 9 记录本 spec 执行总结
- `docs/handoff/decisions.md` —— 实施过程中遇见的具体技术决策追加到此
- `docs/handoff/risks.md` —— 实施过程中遇见的具体风险追加到此
- `docs/handoff/future-plans.md` —— r.3 sort-viz 修完后，对应条目状态更新
