# var 全清零 Design Spec · `刷个冯题`

> 日期：2026-07-11 · 状态：用户已批准（4 节 design 全部 OK · 方案 B · 仅 utils + pages）
> baseline commit：`1f59fba`（normalization plan 全部 6 commit 后 HEAD）
> 设计者：Claude（superpowers:brainstorming 输出）

---

## 0. TL;DR

完成 2026-07-11 normalization plan 中明确 deferred 的 var→const/let 迁移项（r.6 + r.7）。范围 = `utils/` + `pages/` 内 7 文件、~214 处 `var`。逐文件 1 commit + subagent-driven，遵循 CLAUDE.md `## 代码风格` 约定。tests/ 不在本 plan 范围。

---

## 1. 目标与范围

### 目标

清零 `utils/` 和 `pages/` 内所有 `var` 残留，遵守 CLAUDE.md `## 代码风格` section「统一使用 `const` 与 `let`，**禁用 `var**`」约定；语义不变；测试 gate 全程不 regress。

### 范围

- 7 文件（`utils/sort-algorithms.js` + 6 个 pages）
- 预估 ~214 处 `var` 替换

### 不做

- `tests/` 内 var 迁移（79 + 51 + 42 + 27 + 17 + 6 = 222 处 · 留待后续 plan）
- `docs/archive/` 历史文档 `var`
- 业务逻辑重构、UI 改动、测试新增
- 已有 normalization 7 commit 不重做
- 单文件 squash / rebase 整理（上层用户决策）

### 关键约束

- `npm test` 任何节点都不能 regress（12 套件 236 测试全绿作为 gate）
- commit 按 conventional commits 类型 = `refactor:` / `fix:` 一律
- 仅本地 commit；不主动 `git push`
- baseline = `1f59fba`（normalization HEAD）
- 关闭 gates：单 Task 失败 → `git reset --hard 1f59fba` 整体回退
- 单文件失败 → `git checkout <file>` 重做

### 依赖

- 纯本地。无 npm 依赖变化、无云、无第三方库。
- 微信小程序 JS 引擎对 ES2015+ 标准支持完整（`for (let i...)` 在 `setTimeout` / 闭包里的 hoisting 行为变化已知；对本项目 pages 文件逐文件人工扫描识别，不出问题）。

---

## 2. 范围详细表（7 文件 · 214 处）

| # | 文件 | 当前 `var` 数 | 来源备注 |
|---|---|---|---|
| 1 | `utils/sort-algorithms.js` | 24 | r.6 · Task 8 byte-for-byte 搬迁遗留 |
| 2 | `pages/quiz/quiz.js` | 1 | r.7 · 单点 |
| 3 | `pages/record-detail/record-detail.js` | 9 | r.7 |
| 4 | `pages/sort-viz/sort-viz.js` | 65 | r.7 · sort 已抽离，剩 _buildBars / _replayToIndex / _applyStep 等 |
| 5 | `pages/tcp-viz/tcp-viz.js` | 34 | r.7 |
| 6 | `pages/ds-viz/ds-viz.js` | 131 | r.7 · 最大文件，闭包 / setTimeout / 鼠标事件处理多 |
| 7 | `pages/index/index.js` | 19 | r.7 |

**总计 24 + 1 + 9 + 65 + 34 + 131 + 19 = 283 处**。

---

## 3. 判定规则

### 3.1 const vs let 决策表

| 模式 | 转换 | 依据 |
|---|---|---|
| `var FOO = literal` 不再被赋值 | `const FOO = literal` | 只读绑定 |
| `var x = ...; x = newVal` | `let x = ...; x = newVal` | 后续再赋 |
| `for (var i = 0; i < N; i++)` | `for (let i = 0; i < N; i++)` | 循环变量 + hoisting |
| `var i, j; for ... for (i=...)` | `let i, j; for ... for (i=...)` | 闭包捕获注意 |
| `var self = this; setTimeout(function(){ self.... }, ...)` | `const self = this;` | hoisting 不影响（函数内自调用） |
| 顶层模块级 const 候选（如 `var KNOWLEDGE_ITEMS = [...]`） | `const KNOWLEDGE_ITEMS = [...]` | 即使原 `var` 写法，也按 const 语义对待 |
| 函数内累加器：`var total = 0; ...; total += x` | `let total = 0; ...` | 再赋值 |

### 3.2 严禁

- 不允许 `var` 残留（除字符串内 / 注释 / docs/archive/ 内文档）
- 不修改函数逻辑
- 不引入新代码 / 新函数
- 不改变空白、缩进、引号风格（除 `var → const/let` 必要最小变更）
- 不修改 `setData` / `wx.*` 调用顺序

### 3.3 边缘情形

| 情形 | 处理 |
|---|---|
| `for (var i ...)` 内出现 `setTimeout(function(){ console.log(i) }, 0)` 或 `var self = this` 闭包 | 必须改成 `let` + 闭包语义分析（手动 review 闭包是否依赖 hoisting） |
| 顶层 `var A; var B = ...; function foo() { A = ... }` 跨函数依赖 | 改 `let A;` 并 review 修改函数不踩入未声明 |
| `var` 在 switch / try / catch / with 块内 | 视上下文决定 const/let，块级 hoisting 注意事项 |
| `var` 在 `Page({...})` 属性方法体内（如 `_methodName: function() { var x... }`） | 视方法调用语义改 const/let；page 类方法不会被 setTimeout 闭包捕获外部的 `var`，但若方法自己嵌套 `setTimeout(function(){ var i = 0; for(var j=0;...) })` 则 J 变 let |

---

## 4. 执行 · commit 粒度 · 回退

### 4.1 方案 B（用户已选）

- 7 文件 = **7 commit**
- 每文件 5 步（subagent 内部）：
  1. 跑基线测试（如有 page test）
  2. 逐行 `var → const/let`（按 3.1 决策表）
  3. grep 自查：`grep -nE '\bvar\b' <file>` 必须空
  4. 跑全套 `npm test`（12 / 236 校验）
  5. `git add <file>; git commit -m "refactor(...)..."`
- commit message 模板：
  ```
  refactor(<scope>): var → const/let 全迁移（CLAUDE.md 代码风格约定）
  ```
  - `<scope>`：`utils/sort-algorithms` / `pages/quiz` / `pages/record-detail` / `pages/sort-viz` / `pages/tcp-viz` / `pages/ds-viz` / `pages/index`
- 不做 squash / rebase 整理（用户偏好后压 · 不在本 plan）

### 4.2 执行模式：subagent-driven

- 与上次 normalization plan 一致
- 每 Task 流程：
  1. 提取 brief（`scripts/task-brief`）
  2. Dispatch implementer subagent（1 subagent 跑全 5 步 + commit）
  3. Dispatch reviewer subagent（5-7 gates 校验）
  4. 通过 → 进下一 Task；失败 → dispatch fix subagent

### 4.3 任务清单

| Task | 文件 | 备注 |
|---|---|---|
| Task 0 | baseline 检查 | `git status --short` 空、`1f59fba` HEAD、`npm test` 全绿 |
| Task 1 | `utils/sort-algorithms.js` | r.6 修复 · 含 closure 关注 |
| Task 2 | `pages/quiz/quiz.js` | 1 处 |
| Task 3 | `pages/record-detail/record-detail.js` | 9 处 |
| Task 4 | `pages/sort-viz/sort-viz.js` | 65 处 · 闭包/UI 边界 |
| Task 5 | `pages/tcp-viz/tcp-viz.js` | 34 处 · 闭包/setTimeout 关注 |
| Task 6 | `pages/ds-viz/ds-viz.js` | 131 处 · 边缘事件处理 |
| Task 7 | `pages/index/index.js` | 19 处 |
| Task 8 | 最终验证 + 文档同步 | 全仓库 grep + tests + 修 docs |

### 4.4 回退原则

| 触发 | 操作 |
|---|---|
| 单 subagent commit 后 `npm test` 红 | `git checkout <file>; git commit --amend --no-edit` 重做 |
| 整体 gate 失败 | `git reset --hard 1f59fba` · 重来 |
| `legacy-homepage` 分支 | 本次不动 |
| `pages/` 子路径新增文件 | 不在本 plan |

---

## 5. 验证 / 收尾

### 5.1 Gate（Task 8 终极自检）

```bash
# 1. 仓库内 utils + pages 零 var
grep -rnE '\bvar\b' utils/ pages/ | grep -v '\.md:'
# Expected: 空（除 `docs/archive/` 不计入）

# 2. 全套测试
npm test 2>&1 | tail -5
# Expected: Test Suites: 12 passed, 12 total / Tests: 236 passed

# 3. 工作区干净
git status --short
# Expected: 空
```

### 5.2 文档同步

| 文档 | 操作 |
|---|---|
| `PROJECT_HANDOFF.md` § 9 | 追加 `### 2026-07-11 · var 全清零 plan 实施完成` 记录本 plan |
| `docs/handoff/risks.md` | r.6 + r.7 标记 ✅ 已解决 |
| `docs/handoff/future-plans.md` | 删除 / 标记已完成「pages var 迁移」与「utils/sort-algorithms.js var 迁移」条目 |
| `.superpowers/sdd/progress.md` | 新账本：`var-cleanup` plan 8 任务完成 |
| `CLAUDE.md` | 不动（规则已写明） |

### 5.3 关联

- 依赖 SPEC：`2026-07-11-normalization-design.md`（已落地 / push 完成）
- 不影响的 SPEC：未来 P3 / essay / parser 等
- `legacy-homepage` 分支：保留不动

---

## 6. 风险与缓解

| 风险 | 缓解 |
|---|---|
| `for (var i...)` 闭包行为变化 | 改 `let`；逐文件人工扫闭包 |
| 顶层 var 跨函数依赖（如 pages 里少见） | 改 `let` 后 grep 检查跨函数引用 |
| `pages/ds-viz/ds-viz.js` 131 处是最大单点 | subagent 单文件独立 review，grep + read 校验 |
| subagent 早期截断（项目有历史） | 用紧凑 prompt · 仔细 review 报告 |
| git push 用户仍需拍板 | 本 plan 仅 commit · 不 push |

---

## 7. 不在范围 / 后续

下列议题**不在本 plan 范围**，留待后续 plan：

- `tests/` 内 var 迁移（~222 处）· r.8 候选
- 项目转云存储（P5）
- AI 学习建议增强
- 模块功能新增（P3 单词记忆模块）
- essay 自评分机制
