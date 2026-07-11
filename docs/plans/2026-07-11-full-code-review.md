# 刷个冯题 · 全项目 Code Review 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**关联 spec：** `docs/superpowers/specs/2026-07-11-code-review-design.md`
**关联变更：** 覆盖 2026-06-15 全量审查之后所有变更，重点回归 2026-07-11 var→const/let 全清零 refactor（b9a543b）。
**计划仓库位置决策：** 按 CLAUDE.md 命名约定，plans 落 `docs/plans/`（不落 `docs/superpowers/plans/`）。

**Goal:** 对 `pages/`（13 页面）+ `utils/`（14 模块）+ `app.*` + mock 做一次全量 code review，产出与 2026-06-15 报告并列对照的单份 Markdown 报告，处理 Low 级别自动修复，逐条询问 Medium 及以上问题。

**Architecture:** 6 个 phase：Phase 0 准备 / Phase 1 六维度 Workflow 并行 fan-out / Phase 2 主 agent 汇总 / Phase 3 交叉验证 / Phase 4 Low 自动修 / Phase 5 Medium 及以上逐条询问 / Phase 6 收尾。每个 phase 内 2-5 分钟 bite-sized 步骤；以 `npm test` 全绿为 gate。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest ^29.7.0；`wx.setStorageSync` 本地存储（无后端）；git。

## Global Constraints

- baseline commit：`b9a543b`（refactor(var-cleanup): var → const/let 全清零）—— 本次 review 的起点
- `npm test` 必须 12 suites, 236 tests 全绿为任何节点 gate，不能 regress
- 全程不主动 `git push`（用户未要求）
- 全程仅在 `master` 分支；不动 `legacy-homepage`
- commit 按 Conventional Commits：
  - Low 自动修：`auto-fix(low): <一句话说明>`
  - 报告与 spec/plan：`docs: <一句话说明>`
- Medium 及以上问题用 `AskUserQuestion` 逐条问，一次 ≤ 4 条；不擅自修改代码
- 失败回退：单 Task 失败 → `git reset --hard HEAD~1`；全 plan 失败 → `git reset --hard b9a543b`
- 设计 / 命名 / commit / 测试约定详见 `CLAUDE.md` 与 `docs/review/2026-06-13-code-review-checklist.md`
- review 复用 06-13 清单（SEC-01~18 / COR-01~29 / PERF-01~08 / GAP-01~13 / Bug 模式）+ 新维度 BUS（业务一致性）+ I18N（i18n 兼容性）

---

## Phase 0 · 准备

### Task 0: Baseline 检查 & 上下文快照

**Files:**
- Modify: 无
- Test: 无

**Interfaces:**
- Consumes: 项目根目录 `/Users/charliepan/Downloads/my-miniapp`
- Produces: `/tmp/review-baseline-sha.txt`、`/tmp/review-baseline-test.txt`

- [ ] **Step 1: 确认 baseline commit**

```bash
git log --oneline -1 b9a543b
```

Expected: 出现一行 `refactor(var-cleanup): var → const/let 全清零（utils + pages · 7 文件 · 283 var）`。

- [ ] **Step 2: 确认工作区干净**

```bash
git status --short
```

Expected: 输出为空。如有 dirty 必须先 commit 或 stash。

- [ ] **Step 3: 确认测试基线通过**

```bash
npm test 2>&1 | tee /tmp/review-baseline-test.txt | tail -10
```

Expected: 末尾出现 `Tests: 236 passed, 236 total` + `Test Suites: 12 passed, 12 total`。

- [ ] **Step 4: 记录 baseline SHA**

```bash
git rev-parse HEAD > /tmp/review-baseline-sha.txt
cat /tmp/review-baseline-sha.txt
```

Expected: 输出一个 40 位 SHA。

- [ ] **Step 5: 重读三份关键文档**

依次完整读取以下三份并内部消化要点（不写文件）：

1. `PROJECT_HANDOFF.md` —— 当前进度、未提交变更
2. `docs/review/2026-06-13-code-review-checklist.md` —— SEC/COR/PERF/GAP/Bug 模式清单
3. `docs/review/2026-06-15-full-project-review.md` —— 06-15 的未修复项清单

Expected: 主 agent 已能在脑中列出 06-15 遗留未修项（SEC-09 / SEC-14 / COR-01~05 / COR-12 / COR-19 / COR-27 等）。

- [ ] **Step 6: 抓取 2026-06-15 之后的所有 commit 列表**

```bash
git log --oneline b9a543b~1..HEAD
```

Expected: 显示从 06-15 之后到当前的 commit 列表（用于 Phase 1 重点专项回归 + Phase 2 与 06-15 对照）。

---

## Phase 1 · 六维度 Workflow 并行 Fan-out

### Task 1: 调度 6 维度并行审查 subagent

**Files:**
- Modify: 无
- Create: 6 份临时发现 JSON 到 `/tmp/review-dim-{sec,cor,perf,bus,i18n,qual}.json`（subagent 输出）

**Interfaces:**
- Consumes: Phase 0 的 SHA + 06-13/06-15 清单 + spec 维度定义
- Produces: 6 份结构化发现 JSON（每条含编号 / 严重级 / 文件:行号 / 问题 / 修复建议）

**策略：** 调 Workflow 工具，6 个 subagent 并行执行。每个 subagent 的 prompt 模板如下，按维度替换 `[DIM]` / `[CHECKLIST]` / `[FILES]`：

```text
你是 code review subagent，专责 [DIM] 维度。
项目根：/Users/charliepan/Downloads/my-miniapp
baseline commit：b9a543b

任务：
1. 读取 docs/review/2026-06-13-code-review-checklist.md 中属于 [DIM] 的检查项
2. 读取 docs/review/2026-06-15-full-project-review.md 中属于 [DIM] 的未修复项
3. 重点回归 2026-07-11 b9a543b 之后的变更（git log b9a543b..HEAD）
4. 逐文件审 [FILES]，每条发现写为：
   {
     "id": "[DIM]-NN",
     "severity": "critical|high|medium|low|info",
     "file": "相对路径:行号",
     "issue": "一句话问题",
     "fix": "具体修复建议",
     "vs_06_15": "new|fixed|still|regressed|n/a",
     "evidence": "代码片段或 grep 输出"
   }
5. 输出 JSON 数组到 stdout；无发现时输出 []

约束：
- 不动代码
- 不漏检清单上的任一项
- 不擅自合并到 06-15 已修项
- 文件清单：
  [FILES]

[CHECKLIST]
```

#### 1.1 · SEC subagent（安全）

- [ ] **Step 1: 准备 SEC subagent prompt**

拼接清单：SEC-01 ~ SEC-18（06-13 §1）+ 06-15 未修 SEC-09 / SEC-14 + 06-15 后新模块（TCP/DS/sort-viz）的文件读取面。

文件清单：

```
app.js
app.json
app.wxss
pages/quiz-list/quiz-list.js
pages/quiz/quiz.js
pages/result/result.js
pages/import-preview/import-preview.js
pages/wrong-questions/wrong-questions.js
pages/record-detail/record-detail.js
pages/dashboard/dashboard.js
pages/index/index.js
pages/sort-viz/sort-viz.js
pages/ds-viz/ds-viz.js
pages/tcp-viz/tcp-viz.js
pages/subnet-calc/subnet-calc.js
utils/storage.js
utils/markdown-parser.js
utils/analytics.js
utils/subnet.js
utils/tcp-states.js
utils/sort-algorithms.js
utils/bst.js
utils/graph.js
utils/hash-table.js
utils/tool-registry.js
utils/util.js
utils/sample-questions.js
tests/__mocks__/wx.js
```

- [ ] **Step 2: 调 Workflow 并行 fan-out 全部 6 个 subagent**

```bash
# 主对话内调用 Workflow 工具，script 形如：
# pipeline 6 个 dim，每步 agent(prompt, {schema: FINDINGS_SCHEMA, phase: 'Review'})
# schema 定义见 spec §4：id/severity/file/issue/fix/vs_06_15/evidence
```

Expected: Workflow 返回 6 份 findings 数组。

- [ ] **Step 3: 落 6 份原始发现 JSON**

```bash
mkdir -p /tmp/review
# 每个 subagent 的 findings 落到 /tmp/review/dim-{name}.json
# 用 jq 验证 JSON 合法性：
for f in /tmp/review/dim-*.json; do echo "=== $f ==="; jq 'length' "$f"; done
```

Expected: 6 个文件，每个显示一个数字（发现数）。

#### 1.2 · COR subagent（正确性）

包含在 1.2 Step 2 同一 Workflow 内并行执行。

文件清单：同 1.1 Step 1。
清单项：COR-01 ~ COR-29 + 06-15 未修 COR-01/02/03/04/05/12/19/27。

#### 1.3 · PERF subagent（性能）

包含在 1.2 Step 2 同一 Workflow 内并行执行。

文件清单：同 1.1 Step 1。
清单项：PERF-01 ~ PER-08 + 06-15 未修 PERF-01~07 + 新模块（TCP 动画、DS、sort-viz）setData 频率专项。

#### 1.4 · BUS subagent（业务一致性 · 新维度）

包含在 1.2 Step 2 同一 Workflow 内并行执行。

文件清单：

```
pages/quiz/quiz.js
pages/result/result.js
pages/records/records.js
pages/record-detail/record-detail.js
pages/quiz-list/quiz-list.js
pages/wrong-questions/wrong-questions.js
pages/import-preview/import-preview.js
pages/dashboard/dashboard.js
utils/storage.js
utils/analytics.js
utils/tool-registry.js
app.json
```

清单项（spec §3 D 自定）：
- BUS-01 三模块（quiz/wrong/dashboard）联动：`markMastered` → dashboard 弱项统计刷新
- BUS-02 删除试卷的级联清理：`deletePaper` → records / wrongQuestions 同步清理
- BUS-03 错题重做的 tempImportData 写入：`wrong-questions` → `import-preview` → `quiz-list` 链路
- BUS-04 `tool-registry.js` 注册的工具与 `app.json` 实际页面是否一致
- BUS-05 `setData` 键名与 WXML `{{}}` 变量名交叉一致性
- BUS-06 `quiz` 模式（练习 / 考试）下的交卷行为一致性

#### 1.5 · I18N subagent（i18n 兼容性 · 新维度）

包含在 1.2 Step 2 同一 Workflow 内并行执行。

文件清单：

```
pages/**/*.wxml
pages/**/*.js
utils/*.js
app.wxss
pages/index/index.wxml
pages/index/index.js
```

清单项（spec §3 E 自定）：
- I18N-01 中英文文案硬编码位置（grep 含中文的 `title` / `toast` / `placeholder`）
- I18N-02 用户输入路径（`pages/quiz-list/quiz-list.js` 读 `.md` / `pages/wrong-questions` 错题重做）对中英文混合输入的解析
- I18N-03 `utils/util.js` 的 `formatTime` / `formatDuration` 对非中文 locale 的兼容性
- I18N-04 `pages/quiz/quiz.js` 的判分逻辑对英文判断题（Yes/No）的处理
- I18N-05 备案号 / 版权信息硬编码位置（已知：`pages/index/index.wxml:155` 硬编码备案号）
- I18N-06 数字 / 日期 / 货币格式硬编码（无 Intl/locale 抽象）

#### 1.6 · QUAL subagent（代码质量）

包含在 1.2 Step 2 同一 Workflow 内并行执行。

文件清单：同 1.1 Step 1。
清单项（06-15 §5 风格）：
- QUAL-01 `console.log` / `console.debug` 残留
- QUAL-02 `var` 残留（重点是 2026-07-11 var-cleanup 是否完整）
- QUAL-03 `catch` 块为空 / 静默吞异常
- QUAL-04 文件过大（> 800 行）
- QUAL-05 命名不一致（camelCase / PascalCase 混用）
- QUAL-06 注释密度（公开 API 是否缺 JSDoc）
- QUAL-07 TODO / FIXME / HACK 注释残留
- QUAL-08 重复代码（DRY）

---

## Phase 2 · 主 Agent 汇总

### Task 2: 合并去重并写报告 Markdown

**Files:**
- Create: `docs/review/2026-07-11-full-review.md`

**Interfaces:**
- Consumes: `/tmp/review/dim-{sec,cor,perf,bus,i18n,qual}.json`（6 份发现）
- Produces: 单份完整报告 `docs/review/2026-07-11-full-review.md`（spec §4 结构）

- [ ] **Step 1: 合并 6 份发现为单一数组**

```bash
jq -s 'add' /tmp/review/dim-*.json > /tmp/review/all-findings.json
jq 'length' /tmp/review/all-findings.json
```

Expected: 一个数字 ≥ 0。

- [ ] **Step 2: 按文件:行号 + 问题去重**

主 agent 在内存中执行：相同 `file:line` + 相似 `issue` 只保留最高严重级。

- [ ] **Step 3: 与 06-15 报告交叉对照**

对每条发现，标注 `vs_06_15` 字段：
- `new`：本次新发现
- `fixed`：06-15 标注未修，本次已修
- `still`：06-15 标注未修，本次仍存
- `regressed`：06-15 已过，本次出现回归
- `n/a`：跨维度发现，无 06-15 对应项

- [ ] **Step 4: 按严重级 + 文件排序**

排序规则：
1. severity：critical > high > medium > low > info
2. 同严重级按 `file` 字母序

- [ ] **Step 5: 按 spec §4 模板填充报告**

创建 `docs/review/2026-07-11-full-review.md`，结构：

```
# 全项目综合审查报告 · 2026-07-11

> 审查时间: 2026-07-11
> 审查范围: 全量 pages/ + utils/ + app.* + tests/__mocks__/wx.js
> 审查方式: 6 维度 Workflow 并行 fan-out + 主 agent 汇总 + 交叉验证
> 测试状态: 12 suites, 236 tests, 全部通过 ✅
> 审查结论: <由 Phase 3 后回填>

## 一、安全审查结果（SEC）
[SEC subagent 的发现表格，每条带 vs_06_15 标注]

## 二、正确性与健壮性审查结果（COR）
[COR subagent 的发现表格]

## 三、性能审查结果（PERF）
[PERF subagent 的发现表格]

## 四、业务一致性审查结果（BUS）           ← 新
[BUS subagent 的发现表格]

## 五、i18n 兼容性审查结果（I18N）          ← 新
[I18N subagent 的发现表格]

## 六、测试覆盖缺口
[QUAL subagent + GAP 列表]

## 七、代码质量审查（QUAL）
[QUAL subagent 的发现表格]

## 八、未修复问题回归对照（vs 2026-06-15）
[06-15 遗留未修项逐条标注当前状态：已修 / 仍存 / 恶化 / n/a]

## 九、var→const/let 迁移专项回归
[QUAL-02 var 残留专项回归 + 闭包/this 绑定回归]

## 十、审查结论
   - 统计表（按维度统计 Critical/High/Medium/Low/Info）
   - 需修复项清单（High + Medium）
   - 代码质量优化项清单（Low）
   - 审查结论勾选（通过/有条件通过/阻止合并）
   - follow-up plan 链接（如有）
```

Expected: 报告落地，无 placeholder。

- [ ] **Step 6: 报告落地 commit**

```bash
git add docs/review/2026-07-11-full-review.md
git commit -m "docs: 2026-07-11 全项目 code review 报告"
```

Expected: 1 个 commit 落地。

---

## Phase 3 · 交叉验证

### Task 3: 静态扫描 + 基线测试 + 遗留项验证

**Files:**
- Modify: `docs/review/2026-07-11-full-review.md`（追加"九、交叉验证结果"小节）
- Create: `/tmp/review/static-scan.txt`

- [ ] **Step 1: 跑全量测试确认基线**

```bash
npm test 2>&1 | tail -10
```

Expected: `Tests: 236 passed, 236 total` + `Test Suites: 12 passed, 12 total`。如果失败，先修再继续。

- [ ] **Step 2: 跑静态扫描**

```bash
{
  echo "=== eval / Function ==="
  grep -rn "\\beval\\|new Function(" --include="*.js" pages/ utils/ app.js || echo "(无)"
  echo "=== innerHTML / rich-text ==="
  grep -rn "rich-text\\|innerHTML" --include="*.wxml" pages/ || echo "(无)"
  echo "=== 硬编码密钥 ==="
  grep -rni "api_key\\|secret\\|password\\|token" --include="*.js" pages/ utils/ || echo "(无)"
  echo "=== console.log / console.debug 残留 ==="
  grep -rn "console\\.\\(log\\|debug\\)" --include="*.js" pages/ utils/ app.js || echo "(无)"
  echo "=== var 残留 ==="
  grep -rn "^\\s*var\\s\\|(\\s*var\\s\\|;\\s*var\\s" --include="*.js" pages/ utils/ || echo "(无)"
  echo "=== catch 空块 ==="
  grep -rn "catch\\s*([^)]*)\\s*{[\\s]*}" --include="*.js" pages/ utils/ || echo "(无)"
} > /tmp/review/static-scan.txt
cat /tmp/review/static-scan.txt
```

Expected: 每项输出包含 (无) 或若干匹配。捕获的项需在报告中明确处理。

- [ ] **Step 3: 对 06-15 遗留项逐一 grep 验证**

主 agent 读取 06-15 报告，逐条 grep 当前代码状态，标注到报告 §8。

每个遗留项格式：
```
| 06-15 编号 | 06-15 描述 | 当前状态 | 验证方式 |
|---|---|---|---|
| SEC-09 | readFileSync 前无文件大小检查 | 仍存 / 已修 | `grep -n "statSync\|file.size" pages/quiz-list/quiz-list.js` |
| ... |
```

- [ ] **Step 4: 更新报告审查结论**

把 §10 的"审查结论"行回填为：

```
- [ ] 通过（无阻塞性问题）
- [ ] 有条件通过（X 项需修，Y 项建议）
- [ ] 阻止合并（存在安全或正确性问题）
```

- [ ] **Step 5: 提交交叉验证结果**

```bash
git add docs/review/2026-07-11-full-review.md
git commit -m "docs: 2026-07-11 review 报告追加交叉验证结果"
```

Expected: 报告 §8 / §10 完成。

---

## Phase 4 · Low 级别自动修

### Task 4: 应用并提交 Low 级别修复

**Files:**
- Modify: 视具体发现而定（如 `app.js`、`utils/storage.js`、`pages/sort-viz/sort-viz.js` 等）
- Modify: `docs/review/2026-07-11-full-review.md`（追加"修复记录"小节）

**Interfaces:**
- Consumes: Phase 3 后报告 §7 / §9 中的 Low 发现
- Produces: 一组 commit（每个修复一个，前缀 `auto-fix(low):`）

- [ ] **Step 1: 从报告中提取 Low 级别发现**

主 agent 从报告 §7 / §9 中筛选所有 `severity == "low"` 的发现，列出 `id / file:line / issue / fix`，写入 `/tmp/review/low-fixes.md`。

- [ ] **Step 2: 对每条 Low 修复逐个应用 + 验证**

对每条 Low 发现执行以下循环：

```bash
# 1. 读相关文件
# 2. 应用最小修复（与 spec/原意一致；不重构）
# 3. 跑 npm test
npm test 2>&1 | tail -5
# 4. 如通过，commit
git add <modified files>
git commit -m "auto-fix(low): <一句话说明 — 对应 <id>>"
# 5. 任何一步失败 → git reset --hard HEAD~1 后跳过该项，标记到 /tmp/review/low-skipped.md
```

Expected: 全部 Low 修复要么 commit 落地，要么明确跳过。

- [ ] **Step 3: 追加修复记录到报告**

在报告 §7 末尾追加：

```markdown
## 修复记录（Low 级别自动修）

| 编号 | 文件:行号 | 修复内容 | Commit SHA |
|---|---|---|---|
| ... |
```

- [ ] **Step 4: 提交修复记录**

```bash
git add docs/review/2026-07-11-full-review.md /tmp/review/low-skipped.md 2>/dev/null || true
git commit -m "docs: 追加 Low 级别自动修修复记录"
```

Expected: 修复清单落地。

- [ ] **Step 5: 跑最终全量测试**

```bash
npm test 2>&1 | tail -10
```

Expected: `Tests: 236 passed, 236 total`。

---

## Phase 5 · Medium 及以上逐条询问

### Task 5: AskUserQuestion 逐条决策

**Files:**
- Modify: `docs/review/2026-07-11-full-review.md`（追加"用户决策记录"小节）

**Interfaces:**
- Consumes: 报告 §1 / §2 / §3 / §4 / §5 / §6 中所有 `severity ∈ {critical, high, medium}` 的发现
- Produces: 用户决策表

- [ ] **Step 1: 从报告提取 Medium 及以上发现**

主 agent 列出所有 `severity >= medium` 的发现，写入 `/tmp/review/medium-questions.md`，格式：

```markdown
# 待用户决策

1. <id> | <file:line> | <severity> | <issue>
2. ...
```

- [ ] **Step 2: 第一次 AskUserQuestion（≤ 4 条合并）**

调用 `AskUserQuestion`，每个 finding 一个 question，≤ 4 条。选项：

- 现在修（最小修复 + npm test + commit）
- 跳过（标记到 future-plans.md）
- 其他（用户提供自定义处理）

用户回答后逐项应用：
- 选"现在修"→ 走 TDD：先写测试（如适用）→ 最小实现 → npm test → commit
- 选"跳过"→ 主 agent 把该项追加到 `docs/handoff/future-plans.md`

- [ ] **Step 3: 循环 Step 2 直到 Medium 及以上全部决策**

每轮 ≤ 4 条；用户可随时叫停。

- [ ] **Step 4: 追加决策记录到报告**

```markdown
## 用户决策记录（Medium 及以上）

| 编号 | 严重级 | 文件:行号 | 问题 | 决策 | 落地形态 |
|---|---|---|---|---|---|
| ... |
```

- [ ] **Step 5: 提交决策记录**

```bash
git add docs/review/2026-07-11-full-review.md docs/handoff/future-plans.md
git commit -m "docs: 追加 Medium+ 用户决策记录 + 同步 future-plans"
```

Expected: 决策表完整；任何"现在修"项已 commit 落地。

- [ ] **Step 6: 最终全量测试**

```bash
npm test 2>&1 | tail -10
```

Expected: `Tests: 236 passed, 236 total`。任何失败立即处理。

---

## Phase 6 · 收尾

### Task 6: 同步 PROJECT_HANDOFF + 本地 commit

**Files:**
- Modify: `PROJECT_HANDOFF.md` §9

- [ ] **Step 1: 在 PROJECT_HANDOFF.md §9 追加变更记录**

新增条目：

```markdown
### 2026-07-11 · 全项目 code review（实施本计划）

**变更内容**
- 6 维度并行 fan-out 产出 docs/review/2026-07-11-full-review.md
- Low 级别 N 项自动修（commit 前缀 auto-fix(low):）
- Medium 及以上 N 项用户决策（详见报告"用户决策记录"）
- 与 2026-06-15 报告并列对照

**理由**
- 覆盖 2026-06-15 之后所有变更（含 b9a543b var→const/let 全清零 refactor 专项回归）
- 新增业务一致性（BUS）+ i18n 兼容性（I18N）两个维度

**遗留/Follow-up**
- 详见 docs/review/2026-07-11-full-review.md §8（vs 06-15 回归对照）
- 未来计划见 docs/handoff/future-plans.md（Phase 5 跳过的项）
```

- [ ] **Step 2: 跑最终全量测试**

```bash
npm test 2>&1 | tail -10
```

Expected: `Tests: 236 passed, 236 total`。

- [ ] **Step 3: 检查工作区状态**

```bash
git status --short
```

Expected: 仅 `PROJECT_HANDOFF.md` dirty（或 clean 如果已 commit）。

- [ ] **Step 4: 本地 commit**

```bash
git add PROJECT_HANDOFF.md
git commit -m "docs(handoff): 同步 2026-07-11 全项目 review 变更记录"
```

Expected: 1 个 commit 落地。

- [ ] **Step 5: 等用户明确要求再 push**

告知用户：本次 review 全部 commit 在本地，等待用户明确指示后再 `git push`（遵循 CLAUDE.md X5 红线）。

---

## 完成判定（Done Criteria）

- [ ] Phase 0：baseline SHA + 测试基线 + 06-15 遗留清单已抓取
- [ ] Phase 1：6 份发现 JSON 落地，无遗漏
- [ ] Phase 2：`docs/review/2026-07-11-full-review.md` 报告落地，与 06-15 报告同构 + 新增 BUS/I18N/回归对照/var 专项 4 章
- [ ] Phase 3：npm test 全绿 + 静态扫描通过 + 06-15 遗留项逐条对照
- [ ] Phase 4：所有 Low 级别修复 commit 落地或明确跳过
- [ ] Phase 5：所有 Medium 及以上发现 AskUserQuestion 决策完毕，"现在修"项已 commit 落地
- [ ] Phase 6：`PROJECT_HANDOFF.md` §9 变更记录已追加 + 本地 commit 落地
- [ ] 全程 `npm test` 12 suites / 236 tests 保持全绿

## 风险与回退（复述 spec §6）

| 风险 | 缓解 | 回退 |
|---|---|---|
| 并行 subagent 重复发现 | Phase 2 Task 2 Step 2 去重 | 重跑汇总 |
| Low 自动修误改 | 每步 npm test | `git reset --hard HEAD~n` |
| 用户随时叫停 Phase 5 | Step 3 循环即可暂停 | 决策表已记录，可恢复 |
| 主对话 context 溢出 | 6 subagent 并行带工作集；主 agent 只读 JSON | 拆 Phase 1 单维度重跑 |

---

> 计划批准后，按 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐步实施。