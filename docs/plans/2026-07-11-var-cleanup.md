# 刷个冯题 · var 全清零实施计划（方案 B · subagent-driven）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**关联 spec：** `docs/superpowers/specs/2026-07-11-var-cleanup-design.md`
**关联变更：** 本计划敲定时 HEAD 为 `6fecffe`（var-cleanup spec commit）;project working baseline = `1f59fba`（normalization plan 最终 squash 后 HEAD = var-cleanup 起点）。
**计划仓库位置：** 按 spec § 1.2 + 历史约定，plans 落 `docs/plans/`，与 `2026-07-11-normalization.md` 同级。

**Goal:** 把 `utils/` + `pages/` 内 7 个文件、~283 处 `var` 全部替换为 `const`/`let`，遵守 CLAUDE.md `## 代码风格` 约定，语义不变，全程 12 suites / 236 tests gate 不 regress。

**Architecture:** 单 Phase · 8 Task（Task 0 baseline + Tasks 1-7 逐文件迁移 + Task 8 验证/文档同步）。每 Task 内按 2-5 分钟 bite-sized 步骤拆解；Task 1-7 每 Task 一个 commit（7 commit）；Task 0 不 commit；Task 8 一到两个 commit（验证 + 文档同步）。执行采用 subagent-driven：dispatch implementer subagent 跑全 5 步 → 跑 reviewer subagent 校验 gates → 通过进下一 Task。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest ^29.7.0；仅本地文件 + `wx.setStorageSync` 本地存储（无后端）；Node.js + CommonJS `module.exports`；git。

## Global Constraints

- baseline commit: `1f59fba`（normalization plan HEAD，var-cleanup 唯一可用起点）
- 起点 commit: `6fecffe`（仅含 spec commit · 不影响 test 基线）
- `npm test` 必须 12 suites, 236 tests 全绿为 gate，任何节点不能 regress
- commit 类型 = `refactor:` （统一消息体）
- 范围 = `utils/sort-algorithms.js` + 6 个 `pages/{quiz,record-detail,sort-viz,tcp-viz,ds-viz,index}/*.js`（7 文件 / ~283 处 var）
- `tests/` 不动；`docs/archive/` 不动
- 失败回退：单文件失败 → `git checkout <file>` 重做；全 plan 失败 → `git reset --hard 1f59fba`
- 全程不主动 `git push`（用户未要求；本 plan 仅本地 commit）
- 全程仅在 `master` 分支；`legacy-homepage` 分支本计划不动
- commit message 模板（每 Task 严格使用）：
  ```
  refactor(<scope>): var → const/let 全迁移（CLAUDE.md 代码风格约定）
  ```
  - `<scope>` 取值：`utils/sort-algorithms` / `pages/quiz` / `pages/record-detail` / `pages/sort-viz` / `pages/tcp-viz` / `pages/ds-viz` / `pages/index`
- 每 Task 的 5 步走不走样：
  1. 跑基线（如有 page test）
  2. 替换 `var → const/let`（逐行判定，见 Task 头部「判定速查」）
  3. grep 自查：`grep -nE '\bvar\b' <file>` 必须空（除注释/字符串）
  4. 跑全套 `npm test`：必须 12 / 236 全绿
  5. `git add <file>; git commit -m "<模板>"`
- 不允许 subagent 自行 init / push / amend / rebase；commit 后只允许 reviewer 跑 `git checkout <file>` 回退重新提交
- 设计 / 命名 / commit / 测试约定详见 `CLAUDE.md`

## 判定速查（所有 Task 共用）

| 模式 | 转换 | 依据 |
|---|---|---|
| `var FOO = literal` 仅声明 | `const FOO = literal` | 只读绑定 |
| `var x = ...; x = newVal` | `let x = ...; x = newVal` | 后续再赋值 |
| `for (var i = 0; i < N; i++)` | `for (let i = 0; i < N; i++)` | 循环变量 + hoisting |
| `var self = this` 闭包 | `const self = this` | 只读捕获 |
| 顶层模块常量候选（`var KNOWLEDGE_ITEMS = [...]`） | `const KNOWLEDGE_ITEMS = [...]` | 即使原 `var` 写法，按 const 语义对待 |
| 累加 / stepper | `let` | 再赋值 |

**严禁**：保留 `var` 残留 / 修改函数体 / 引入新代码 / 改空白 / 修改 `setData`/`wx.*` 调用顺序。

---

## Phase 0 · 准备 + 7 文件机械迁移

### Task 0: Baseline 检查

**Files:**
- Modify: 无
- Test: 无

- [ ] **Step 1: 确认 baseline + spec 起点**

```bash
git log --oneline -1 1f59fba
git log --oneline -1 6fecffe
```

Expected: 两行 commit 信息，分别对应 normalization plan 收尾 + var-cleanup spec。

- [ ] **Step 2: 确认当前 HEAD**

```bash
git rev-parse HEAD
```

Expected: `6fecffe` 或其后续（如 spec 微调 commit）。如果不对，先核对 `git status`。

- [ ] **Step 3: 确认工作区干净**

```bash
git status --short
```

Expected: 输出为空。如果有任何文件 dirty，停下来核对。

- [ ] **Step 4: 确认测试基线通过**

```bash
npm test 2>&1 | tail -5
```

Expected: `Test Suites: 12 passed, 12 total` / `Tests: 236 passed`。如果失败，先 baseline 修复再进入 Task 1。

- [ ] **Step 5: 确认分支状态**

```bash
git branch -a
```

Expected: 当前在 `master`；存在 `legacy-homepage` 分支（保留不动）。

- [ ] **Step 6: 记录开始 SHA**

```bash
git rev-parse HEAD > /tmp/var-cleanup-baseline-sha.txt
cat /tmp/var-cleanup-baseline-sha.txt
```

Expected: 命令无输出（写入成功），cat 出一行 SHA。

---

### Task 1: `utils/sort-algorithms.js`（r.6 · 24 处 var）

**Files:**
- Modify: `utils/sort-algorithms.js`
- Test: 现有 `tests/pages/sort-viz.test.js`（间接验证）

**判定速查（按本文件实际）**：
- 顶层 `var steps = []`、`var a = arr.slice()`、`var n = a.length` → `const`
- `var sortedCount = 0`（再赋值）→ `let`
- `for (var i = ...)` / `for (var j = ...)` / `for (var k = ...)` → `for (let i/...)`
- 临时 swap：`var temp = a[i]; a[j] = temp; a[i] = a[j]` → 拆 let
- 所有 `partition(low, high)` 内 closure 用的 `var pivot = a[high]` 等 → `let` 因内层闭包

- [ ] **Step 1: 跑基线测试**

```bash
npm test -- tests/pages/sort-viz.test.js 2>&1 | tail -5
```

Expected: 11 tests passed（sort-viz 直接验证本文件）。

- [ ] **Step 2: 替换 `var` → `const/let`（24 处）**

打开 `utils/sort-algorithms.js`，按顶部「判定速查」逐行替换。

⚠️ **不要全文 `sed -i 's/var /const /g'`**——会破坏字符串内的 `"var "`。手动逐行。

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: `Test Suites: 12 passed, 12 total` / `Tests: 236 passed`。如果失败，`git checkout utils/sort-algorithms.js` 重做。

- [ ] **Step 4: grep 自查**

```bash
grep -nE '\bvar\b' utils/sort-algorithms.js
```

Expected: 输出为空（除注释 / 字符串外不应有 `var`）。

- [ ] **Step 5: Commit**

```bash
git add utils/sort-algorithms.js
git commit -m "refactor(utils/sort-algorithms): var → const/let 全迁移（CLAUDE.md 代码风格约定）"
```

---

### Task 2: `pages/quiz/quiz.js`（r.7 · 1 处 var）

**Files:**
- Modify: `pages/quiz/quiz.js`
- Test: 无 page-level test（跑全套验证回归）

**判定速查**：
- `for (var i = 0; i < answerStr.length; i++)` → `for (let i = ...)`

- [ ] **Step 1: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿（基线确认）。

- [ ] **Step 2: 替换 `var` → `let`（1 处）**

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿。

- [ ] **Step 4: grep 自查**

```bash
grep -nE '\bvar\b' pages/quiz/quiz.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add pages/quiz/quiz.js
git commit -m "refactor(pages/quiz): var → const/let 全迁移（CLAUDE.md 代码风格约定）"
```

---

### Task 3: `pages/record-detail/record-detail.js`（r.7 · 9 处 var）

**Files:**
- Modify: `pages/record-detail/record-detail.js`
- Test: 无 page-level test（跑全套验证回归）

**判定速查**：
- 函数顶部 `var map = {}`（再赋值）→ `let map`
- `var q = this.data.questions[idx]`（再赋值候选）→ 实际只读 → `const`
- `var answer = ...` → `const`
- `var records = storage.getRecords()` → `const`
- `var record = records.find(...)` → `const`
- `var paper = storage.getPaperById(...)` → `const`
- `var questions = paper ? paper.questions : []` → `const`
- `var paperDeleted = !paper` → `const`
- `for (var i = 0; i < answerStr.length; i++)` → `for (let i = ...)`

- [ ] **Step 1: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿（基线）。

- [ ] **Step 2: 替换 `var` → `const/let`（9 处）**

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿。

- [ ] **Step 4: grep 自查**

```bash
grep -nE '\bvar\b' pages/record-detail/record-detail.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add pages/record-detail/record-detail.js
git commit -m "refactor(pages/record-detail): var → const/let 全迁移（CLAUDE.md 代码风格约定）"
```

---

### Task 4: `pages/sort-viz/sort-viz.js`（r.7 · 65 处 var）

**Files:**
- Modify: `pages/sort-viz/sort-viz.js`
- Test: 间接通过 `tests/pages/sort-viz.test.js`

**判定速查（sort 已抽离；剩 UI / 调度逻辑）**：
- `_buildBars / _replayToIndex / _applyStep / _onAlgoChange / _onSpeedChange / _onRandom / _onInput / _stepBack / _stepForward / _restart / _getOriginalValues` 等方法体内 var
- `var max = 0; for (var i ...) max = Math.max(...)` → `let max` + `for (let i)`
- `var count = values.length` → `const`
- `var bars = []` 再 push → `const bars = []`（数组引用不变）
- `var bars = this.data.bars.slice()` 再赋值 / 方法调用 → `let` 或 `const` 视后续
- `for (var j = 0; j < count; j++) { var pct = ...; var height = ... }` → `for (let j)` + `const pct` / `const height`
- `setTimeout(function(){... var self = this ...})` 内 `var self = this` → `const self = this`
- `var idx = this.data.stepIndex - 1` → `const idx`
- `var step = this.data.steps[nextIdx]` → `const step`
- `var tempLeft = bars[idx1].left; var tempBar = bars[idx1]` swap → 拆 let（被覆盖赋值）

⚠️ **闭包 / setTimeout**：文件中确认无 `var i` 被 `setTimeout` 闭包延迟捕获（`for (var i=0; i<N; i++) setTimeout(..., i)` 是经典陷阱；如有，必须改 `let`）。

- [ ] **Step 1: 跑基线测试**

```bash
npm test -- tests/pages/sort-viz.test.js 2>&1 | tail -5
```

Expected: 11 tests passed。

- [ ] **Step 2: 替换 `var` → `const/let`（65 处）**

逐行判定替换。注意 `_replayToIndex` 等较长函数的局部 var。

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿。

- [ ] **Step 4: grep 自查**

```bash
grep -nE '\bvar\b' pages/sort-viz/sort-viz.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add pages/sort-viz/sort-viz.js
git commit -m "refactor(pages/sort-viz): var → const/let 全迁移（CLAUDE.md 代码风格约定）"
```

---

### Task 5: `pages/tcp-viz/tcp-viz.js`（r.7 · 34 处 var）

**Files:**
- Modify: `pages/tcp-viz/tcp-viz.js`
- Test: 无 page-level test

**判定速查**：
- 文件顶部 `var tcpStates = require(...)` 等一系列导入 → `const tcpStates = require(...)`；`var TCP_STATES = tcpStates.TCP_STATES` → `const TCP_STATES = ...`
- `var KNOWLEDGE_ITEMS = [...]` 顶层常量数组 → `const KNOWLEDGE_ITEMS = [...]`
- `var steps; var clientInit, serverInit; var scenarioDesc = '';` 在 `_buildScenarioSteps` 中 → 拆 let/const：先未定义后赋值，用 `let`
- `var scenario = generateDataScenario('normal')` → `const scenario`
- `var lossScenario = generateDataScenario('loss')` → `const lossScenario`
- `var mode = e.currentTarget.dataset.mode`（事件回调）→ `const mode`
- `var delay = Math.max(200, 1500 - this.data.speed * 150)` → `const delay`
- `setTimeout(function(){... var self = this ...})` → `const self = this`
- `for (var i = 0; i <= targetIndex; i++)` → `for (let i)`
- `var arrows = []` push → `const arrows = []`
- `var step = this.data.steps[i]` → `const step`
- `var clientState = this._getStateAt(index, 'client')` → `const clientState`

⚠️ **本文件含多 setTimeout 闭包引用外部 var**——逐个 setTimeout 检查是否捕获外部 `var`，如有则需评估 hoisting 语义。

- [ ] **Step 1: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿（基线）。

- [ ] **Step 2: 替换 `var` → `const/let`（34 处）**

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿。

- [ ] **Step 4: grep 自查**

```bash
grep -nE '\bvar\b' pages/tcp-viz/tcp-viz.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add pages/tcp-viz/tcp-viz.js
git commit -m "refactor(pages/tcp-viz): var → const/let 全迁移（CLAUDE.md 代码风格约定）"
```

---

### Task 6: `pages/ds-viz/ds-viz.js`（r.7 · 131 处 var · 最大单点）

**Files:**
- Modify: `pages/ds-viz/ds-viz.js`
- Test: 无 page-level test

**判定速查**：
- 顶部 `var bst = require('../../utils/bst')` 等导入 → `const`
- 顶部 `var NODE_R = 20; var CANVAS_W = 600; var CANVAS_H = 500; var PAD = 50;` → `const`（顶层只读常量）
- 大多数 `_xxx: function() { var x ... }` 内 var，按局部判分
- `var self = this; setTimeout(...)}` → `const self = this`
- `var ctx = this._ctx` → `const ctx`
- `var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity`（多变量声明） → 拆 let（4 个都被循环内覆盖）
- 循环 `for (var i = 0; i < nodes.length; i++) { var e = edges[i]; }` → `for (let i)` + `const e`
- `var n = nodes[k]; var cx = n.x * s + ox; var cy = n.y * s + oy;` → 全部 const（只读）
- `var st = n.state || 'normal'` → `const st`
- `_hashRandomKey` 等：`var chars = 'abc...' var len = Math.floor(Math.random() * 4) + 3; var key = ''; for (var i = 0; i < len; i++) { ... var ch = chars[Math.floor...] }` → 拆 const/let
- `var key = this._hashRandomKey()` → `const`
- `var inserted = []` push → `const`
- `var steps = bst.searchNode(...)` → `const`

⚠️ **本文件最大**:131 处机械替换耗时较长。subagent 应分组按方法（`_onLoad` / `_drag*` / `_renderBst` / `_renderHash` / `_renderGraph` / `_renderReplay` / `_nextStep` / `_prevStep`）逐方法推进；不一次性全文 sed。

⚠️ **触摸 / 事件回调**：`_onTouchStart / _onTouchMove` 中可能有 var 来自闭包，逐处检查。

- [ ] **Step 1: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿（基线）。

- [ ] **Step 2: 替换 `var` → `const/let`（131 处）**

按方法分组逐行替换。建议实现顺序：
1. 顶部 require + 顶层常量
2. `_onLoad`
3. `_bind*` / `_onTouch*`
4. `_render*`（最重 `_renderBst` / `_renderHash` / `_renderGraph`）
5. `_replay*` / `_next*` / `_prev*`
6. 其余私有方法

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿。

- [ ] **Step 4: grep 自查**

```bash
grep -nE '\bvar\b' pages/ds-viz/ds-viz.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add pages/ds-viz/ds-viz.js
git commit -m "refactor(pages/ds-viz): var → const/let 全迁移（CLAUDE.md 代码风格约定）"
```

---

### Task 7: `pages/index/index.js`（r.7 · 19 处 var）

**Files:**
- Modify: `pages/index/index.js`
- Test: 无 page-level test（page 是 mini-app home entry）

**判定速查**：
- 顶部 `var storage = require(...)` / `var analytics = require(...)` / `var registry = require(...)` → `const`
- `var self = this;` → `const self = this`
- `var records = storage.getRecords()` 等只读 → `const`
- `var dashboard = analytics.buildDashboardData(...)` → `const dashboard`
- `var activeCategories = registry.getActiveCategories()` → `const`
- `var allViewData = this._buildAllViewData(activeCategories)` → `const`
- 循环 `for (var i = 0; i < categories.length; i++) { var cat = categories[i]; var tools = registry.getFeaturedToolsByCategory(...) }` → `for (let i)` + `const cat` + `const tools`
- `var currentTools = []; var availableTools = []; var unavailableTools = [];` → 三个 `const ... = []`
- `var id = e.currentTarget.dataset.id; var available = e.currentTarget.dataset.available` → `const` × 2
- `var tool = registry.TOOLS.find(function(t) { return t.id === id; })` → `const tool`
- `var self = this;` (再次出现) → `const self = this`

- [ ] **Step 1: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿（基线）。

- [ ] **Step 2: 替换 `var` → `const/let`（19 处）**

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 / 236 全绿。

- [ ] **Step 4: grep 自查**

```bash
grep -nE '\bvar\b' pages/index/index.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add pages/index/index.js
git commit -m "refactor(pages/index): var → const/let 全迁移（CLAUDE.md 代码风格约定）"
```

---

### Task 8: 终态验证 + 文档同步

**Files:**
- Modify: `PROJECT_HANDOFF.md` / `docs/handoff/risks.md` / `docs/handoff/future-plans.md` / `.superpowers/sdd/progress.md`
- Test: 全套

- [ ] **Step 1: 仓库内 utils + pages 零 var 终检**

```bash
grep -rnE '\bvar\b' utils/ pages/ | grep -v '\.md:' | head -10
```

Expected: 输出为空。如果有任何残留，按文件重复 Task 对应步骤。

- [ ] **Step 2: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: `Test Suites: 12 passed, 12 total` / `Tests: 236 passed`。

- [ ] **Step 3: 工作区干净**

```bash
git status --short
```

Expected: 空。

- [ ] **Step 4: PROJECT_HANDOFF.md § 9 追加 var-cleanup 实施记录**

在 `PROJECT_HANDOFF.md` 末尾（在最后一个 `###` 条目下）追加：

```markdown
### 2026-07-11 · var 全清零 plan 实施完成（r.6 + r.7）

**变更内容**

- 7 文件 × 1 commit，共 7 commit：
  - `refactor(utils/sort-algorithms): ...`
  - `refactor(pages/quiz): ...`
  - `refactor(pages/record-detail): ...`
  - `refactor(pages/sort-viz): ...`
  - `refactor(pages/tcp-viz): ...`
  - `refactor(pages/ds-viz): ...`
  - `refactor(pages/index): ...`
- ~283 处 var → const/let 全部迁移
- 闭包 / setTimeout / 顶层常量分别按 const/let 语义对待
- 12 suites / 236 tests 全程不 regress

**理由**

- spec `docs/superpowers/specs/2026-07-11-var-cleanup-design.md` 是 2026-07-11 normalization 的闭环
- 贯彻 CLAUDE.md `## 代码风格` 约定 · 新代码不得再引入 var
- 留待后续 plan：tests/ 内 var 迁移（r.8 候选 · 222 处）

参见：`docs/plans/2026-07-11-var-cleanup.md` · `.superpowers/sdd/progress.md`
```

- [ ] **Step 5: docs/handoff/risks.md 更新 r.6 + r.7 状态**

打开 `docs/handoff/risks.md`；把 r.6（`utils/sort-algorithms.js` 内 24 var）和 r.7（5 个 pages 文件 ~190 var）两条风险的状态改为 `✅ 已解决（2026-07-11 · var-cleanup plan）`；保留条目正文不动（保留历史风险记录）。

- [ ] **Step 6: docs/handoff/future-plans.md 删除已完成条目**

打开 `docs/handoff/future-plans.md`；找到「pages var 迁移」与「utils/sort-algorithms.js var 迁移」两条 future plan 条目，整段删除（已不再 future）。

- [ ] **Step 7: `.superpowers/sdd/progress.md` 新增 var-cleanup 账本段**

在文件末尾追加：

```markdown
## var-cleanup plan 账本（2026-07-11）

- [x] Task 0: Baseline
- [x] Task 1: utils/sort-algorithms.js
- [x] Task 2: pages/quiz/quiz.js
- [x] Task 3: pages/record-detail/record-detail.js
- [x] Task 4: pages/sort-viz/sort-viz.js
- [x] Task 5: pages/tcp-viz/tcp-viz.js
- [x] Task 6: pages/ds-viz/ds-viz.js
- [x] Task 7: pages/index/index.js
- [x] Task 8: 终态验证 + 文档同步

base `1f59fba` → HEAD = <本次填入>。12 suites / 236 tests 全绿。7 commit。
```

- [ ] **Step 8: 提交文档同步**

```bash
git add PROJECT_HANDOFF.md docs/handoff/risks.md docs/handoff/future-plans.md .superpowers/sdd/progress.md
git commit -m "docs(handoff): var-cleanup plan 完成记录 + r.6/r.7 标 ✅"
```

- [ ] **Step 9: 通知用户 + 等指示**

⚠️ 不 push。等用户决策（push / squash / 继续 / 回退）。

---

## Failure / Recovery

| 失败 | 操作 |
|---|---|
| 单 Task 内 Step 3 npm test 红 | `git checkout <file>` 重做该 Task |
| Step 4 grep 自查有残留 | 编辑文件补漏，重新 Step 3-5 |
| 全部失败 / 不可恢复 | `git reset --hard 1f59fba`（保留 normalization plan）|
| spec 改动需求 | 通过 AskUserQuestion 回到 brainstorming skill |

---

## Plan 完成态（参考）

- 7 文件 × 1 commit + 1 doc-sync commit = 8 commit
- `npm test` 12 suites / 236 tests 全程不 regress
- 仓库 utils + pages 内零 `var`
- `docs/handoff/risks.md` r.6 + r.7 标 ✅
- `docs/handoff/future-plans.md` 删除对应 future
- `PROJECT_HANDOFF.md` § 9 追加完整记录
- 未 push，等用户指示
