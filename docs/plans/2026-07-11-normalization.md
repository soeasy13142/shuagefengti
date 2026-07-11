# 刷个冯题 · 规范化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**关联 spec：** `docs/superpowers/specs/2026-07-11-normalization-design.md`
**关联变更：** 本计划敲定时 HEAD 为 `84a7875`（commit spec doc）；baseline 为 `0d0ac01`（CLAUDE.md D2 极致版）。
**计划仓库位置决策：** 按 spec § 设计 2 #2，plans 落 `docs/plans/`（不落 `docs/superpowers/plans/`，那个目录迁移后将仅保留 specs）。

**Goal:** 把项目从"能跑但散乱"提升到"易维护、易扩展、约定文档化"——完成结构层（10 项）+ 代码风格层（3 项）共 13 项变更。

**Architecture:** 分 7 个 Phase、11 个 Task 实施。每 Task 内按 2-5 分钟 bite-sized 步骤拆解；每步有可独立验证的产物；Phase 间以 `npm test` 全绿为 gate；commit 按 Conventional Commits 分组、单一关注点。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest ^29.7.0；仅本地文件 + `wx.setStorageSync` 本地存储（无后端）；Node.js + CommonJS `module.exports`；git。

## Global Constraints

- baseline commit: `0d0ac01`（CLAUDE.md D2 极致版）
- `npm test` 必须 12 suites, 236 tests 全绿为 gate，任何节点不能 regress
- commit 按 Conventional Commits：`docs:` / `feat:` / `fix:` / `refactor:` / `chore:` / `test:`
- 一个 Task 可能多个 commit，按"单一关注点"拆
- 全程不主动 `git push`（用户未要求）
- 全程仅在 `master` 分支；`legacy-homepage` 分支本计划不动
- 失败回退：单 Task 失败 → `git reset --hard HEAD~1`；全 plan 失败 → `git reset --hard 0d0ac01`
- 设计 / 命名 / commit / 测试约定详见 `CLAUDE.md`

---

## Phase 0 · 准备

### Task 0: Baseline 检查

**Files:**
- Modify: 无
- Test: 无

- [ ] **Step 1: 确认 baseline commit 存在**

```bash
git log --oneline -1 0d0ac01
```

Expected: 出现一行 commit 信息（`docs: 升级 CLAUDE.md D2 为极致版 + 嵌入三档触发清单`）。

- [ ] **Step 2: 确认当前 HEAD 与 spec 敲定一致**

```bash
git rev-parse HEAD
```

Expected: SHA 应为 `84a7875` 或后续的 spec 微调 commit。如果不是，请停下来核对 `git status`。

- [ ] **Step 3: 确认工作区干净**

```bash
git status --short
```

Expected: 输出为空。如果有 `M .claude/settings.json`（已知的历史遗留），继续；其他任何文件 dirty 必须停下。

- [ ] **Step 4: 确认测试基线通过**

```bash
npm test 2>&1 | tail -20
```

Expected: `Tests: <N> passed, <M> total` + `Test Suites: 12 passed, 12 total`。如果失败，不要进入 Task 1，先 baseline 修复。

- [ ] **Step 5: 确认分支状态**

```bash
git branch -a
```

Expected: 当前在 `master`；存在 `legacy-homepage` 分支（保留不动）。其他分支若有，先与用户对齐。

- [ ] **Step 6: 记录开始 SHA**

```bash
git rev-parse HEAD > /tmp/normalization-baseline-sha.txt
```

Expected: 命令无输出（写入成功）。

---

## Phase 1 · 入库规则（Task 1）

### Task 1: `.gitignore` 加 `design-methods/` + `design-previews/` + 全局 `.DS_Store`；并清理已 tracked 文件

**Files:**
- Modify: `.gitignore`（顶部追加 4 行）
- Modify: `design-methods/`, `design-previews/`（仅 `git rm --cached`；本地保留）
- Modify: 任何已 tracked 的 `.DS_Store` 文件（仅 `git rm --cached`）

- [ ] **Step 1: 读当前 `.gitignore` 内容**

```bash
cat .gitignore
```

Expected: 输出当前忽略规则。

- [ ] **Step 2: 检查要 ignore 的目录是否已被 tracked**

```bash
git ls-files design-methods | head -5
git ls-files design-previews | head -5
git ls-files | grep -E '\.DS_Store$' | head -5
```

Expected: 每个命令都有输出文件列表（说明确实入库了）。

- [ ] **Step 3: 编辑 `.gitignore`，在末尾追加**

```gitignore
# Local-only design skill reference (not part of the project)
design-methods/
design-previews/

# macOS filesystem noise (覆盖子目录)
.DS_Store
```

如果原文件结尾无空行，请先加一个空行再追加。

- [ ] **Step 4: 从 git index 移除 tracked 文件（本地保留）**

```bash
git rm --cached -r design-methods/ design-previews/
git ls-files | grep -E '\.DS_Store$' | xargs -r git rm --cached
```

Expected: 命令输出被取消追踪的文件名。设计目录会有大量输出。

- [ ] **Step 5: 验证 ignore 生效**

```bash
git status --short | head -10
```

Expected: 出现 `D design-methods/...`、`D design-previews/...`、`D .DS_Store` 等 untracked-tracked 删除项；同时 `.gitignore` 文件被识别为 modified。

- [ ] **Step 6: 验证本地文件仍存在**

```bash
ls design-methods/ | head -3
ls design-previews/ | head -3
```

Expected: 两个目录仍可列出文件。

- [ ] **Step 7: 跑测试，确认无回归**

```bash
npm test 2>&1 | tail -5
```

Expected: 仍 12 suites passed。

- [ ] **Step 8: Commit**

```bash
git add .gitignore
git add -u  # 仅添加已 tracked 文件的删除
git status --short
git commit -m "chore: gitignore design-methods/ design-previews/ .DS_Store" -m "本地保留文件 · 仅取消入库追踪"
```

Expected: 一个 commit，SHA 变化。

---

## Phase 2 · 目录迁移（Tasks 2-5）

### Task 2: `__mocks__/wx.js` → `tests/__mocks__/wx.js`；更新 `jest.config.js`

**Files:**
- Create: `tests/__mocks__/wx.js`（从 `__mocks__/wx.js` 复制）
- Modify: `jest.config.js`（更新 `setupFiles` 路径）
- Delete: `__mocks__/wx.js`（用 `git rm`）
- Test: 全套 12 suites（验证 mock 仍生效）

- [ ] **Step 1: 创建目标目录**

```bash
mkdir -p tests/__mocks__
```

Expected: 命令无输出（目录创建成功）。

- [ ] **Step 2: 移动 mock 文件并保持 git history（用 `git mv`）**

```bash
git mv __mocks__/wx.js tests/__mocks__/wx.js
ls tests/__mocks__/wx.js __mocks__/wx.js 2>&1
```

Expected: 第一个路径存在；第二个报错 `No such file or directory`。

- [ ] **Step 3: 读当前 `jest.config.js`**

```bash
cat jest.config.js
```

Expected: 找到 `setupFiles: ['<rootDir>/__mocks__/wx.js']` 或等效路径。

- [ ] **Step 4: 编辑 `jest.config.js`，把 setupFiles 路径改为 `<rootDir>/tests/__mocks__/wx.js`**

```js
// before
setupFiles: ['<rootDir>/__mocks__/wx.js']

// after
setupFiles: ['<rootDir>/tests/__mocks__/wx.js']
```

- [ ] **Step 5: 跑测试，验证 mock 仍生效**

```bash
npm test 2>&1 | tail -10
```

Expected: 12 suites passed。如果任何 suite 失败（通常是 storage / analytics / 这些用 `wx.*` 的），说明 mock 路径未生效，停下检查。

- [ ] **Step 6: 确认 `__mocks__/` 目录已清空**

```bash
ls __mocks__ 2>&1
git ls-files __mocks__/ 2>&1
```

Expected: 两个命令都不输出任何文件（目录已不存在或空目录）。

- [ ] **Step 7: Commit**

```bash
git add jest.config.js tests/__mocks__/wx.js
# 如果 __mocks__/ 已空目录，单独移除
[ -d __mocks__ ] && rmdir __mocks__ && git rm -r __mocks__ 2>/dev/null || true
git status --short
git commit -m "refactor: 下移 __mocks__/wx.js 到 tests/__mocks__/（合 Jest 官方约定）"
```

Expected: 一个 commit；如果 __mocks__/ 空目录残留则包含其删除。

---

### Task 3: `test-questions.md` → `tests/fixtures/`；更新引用

**Files:**
- Create: `tests/fixtures/test-questions.md`
- Delete: `test-questions.md`（用 `git rm`，仅当 tracked；如果 gitignored 则直接 mv）
- Test: 相关 suite（如有引用）

- [ ] **Step 1: 检查 `test-questions.md` 是否被 tracked**

```bash
git ls-files test-questions.md
```

Expected: 如果输出文件路径，说明 tracked；如果空，说明未入库（直接 mv 即可）。

- [ ] **Step 2: 创建 fixtures 目录**

```bash
mkdir -p tests/fixtures
```

- [ ] **Step 3: 移动文件**

```bash
if git ls-files --error-unmatch test-questions.md >/dev/null 2>&1; then
  git mv test-questions.md tests/fixtures/test-questions.md
else
  mv test-questions.md tests/fixtures/test-questions.md
fi
ls tests/fixtures/test-questions.md
```

- [ ] **Step 4: 搜索代码中是否有硬引用 `'test-questions.md'` 等**

```bash
grep -rn 'test-questions' utils/ pages/ tests/ 2>&1
```

Expected: 无输出。如果有引用，按下文编辑替换；常见的引用路径格式：
- `'../../test-questions.md'` → `'../fixtures/test-questions.md'`（视调用方位置而定）
- `./test-questions.md` → `./fixtures/test-questions.md`

⚠️ **注意：** 如果发现引用，停下来报告并请求用户对齐路径更新方案。

- [ ] **Step 5: 跑测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。

- [ ] **Step 6: Commit**

```bash
git add -A tests/fixtures/ 2>/dev/null
git add -u test-questions.md 2>/dev/null
git status --short
git commit -m "refactor: 迁 test-questions.md 到 tests/fixtures/" -m "如更新了任何代码引用，同提交一并加入"
```

Expected: 一个 commit；如未发生代码引用更新，则只动 fixtures/ 与删根目录文件。

---

### Task 4: 新建 `docs/plans/` + `README.md`；从 `docs/superpowers/plans/` 迁 2 文件

**Files:**
- Create: `docs/plans/README.md`
- Create: `docs/plans/2026-05-31-brushfengti.md`（从 `docs/superpowers/plans/` 迁）
- Create: `docs/plans/2026-07-10-docs-cleanup.md`（同上）
- Delete: `docs/superpowers/plans/` 目录（清空后 `git rm -r`）
- Test: 无（纯文档）

- [ ] **Step 1: 创建 `docs/plans/` 目录**

```bash
mkdir -p docs/plans
```

- [ ] **Step 2: 用 `git mv` 迁 2 个 plans 文件，保留日期前缀**

```bash
git mv docs/superpowers/plans/2026-05-31-brushfengti.md docs/plans/2026-05-31-brushfengti.md
git mv docs/superpowers/plans/2026-07-10-docs-cleanup.md docs/plans/2026-07-10-docs-cleanup.md
ls docs/superpowers/plans/ docs/plans/
```

Expected: 第一个路径下应空；第二个路径下有 2 个文件 + 即将创建的 README.md。

- [ ] **Step 3: 创建 `docs/plans/README.md`**

```markdown
# 项目级实施计划（Plans）

> 目录用途：本目录存放**项目级**实施计划（complex task 的实施步骤）。
> 区别于 `docs/superpowers/specs/` 的设计 spec，`docs/superpowers/plans/` 已停止使用。

## 命名约定

- 格式：`YYYY-MM-DD-<feature-or-fix-name>.md`
- 例：`2026-07-11-normalization.md`（本目录由本次规范化产生）

## 当前内容

- `2026-05-31-brushfengti.md` —— 项目初始实施计划（迁自 superpowers/plans/）
- `2026-07-10-docs-cleanup.md` —— 文档清理实施计划（迁自 superpowers/plans/）
- `2026-07-11-normalization.md` —— 本次规范化实施计划（即你正在读的这个 plan 的对面）

## 与 specs 的关系

每个 plan 都关联一个或多个 spec：
- 写 plan 前先有 spec：`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- plan 内首行明示 spec 路径

## 何时新建

按 CLAUDE.md § D1：复杂任务（≥3 步骤 / 涉及 ≥2 文件 / 涉及架构或约定决策）必须先有 spec，再写 plan，才能动手。
```

- [ ] **Step 4: 如果 `docs/superpowers/plans/` 已空，移除**

```bash
[ -z "$(ls -A docs/superpowers/plans/ 2>/dev/null)" ] && rmdir docs/superpowers/plans/ && echo 'removed empty plans dir' || echo 'plans dir not empty'
```

Expected: 输出 `removed empty plans dir`。如果输出 `plans dir not empty`，列出残留文件并停下。

- [ ] **Step 5: Commit**

```bash
git add docs/plans/ docs/superpowers/plans/
git status --short
git commit -m "refactor(docs): 新建 docs/plans/ 项目级实施计划目录，迁入 superpowers/plans 内容" -m "superpowers/plans/ 与 plans/ 职责划分：specs/ 只放 spec；plans/ 只放项目级 plan；superpowers/ 旧 plans 目录已停用"
```

---

### Task 5: `PROJECT_HANDOFF.full-archive.md` → `docs/archive/`；更新 `PROJECT_HANDOFF.md` 引用

**Files:**
- Modify: `PROJECT_HANDOFF.md`（更新 § 顶部 "完整备份见" 行）
- Create: `docs/archive/PROJECT_HANDOFF.full-archive.md`（迁入）
- Delete: 项目根 `PROJECT_HANDOFF.full-archive.md`（`git rm`）

- [ ] **Step 1: 读当前 `PROJECT_HANDOFF.md` 顶部**

```bash
head -10 PROJECT_HANDOFF.md
```

Expected: 找到 "完整备份见 `PROJECT_HANDOFF.full-archive.md`（保留至少 1 周）。" 之类。

- [ ] **Step 2: 检查文件是否被 tracked**

```bash
git ls-files PROJECT_HANDOFF.full-archive.md
ls -lh PROJECT_HANDOFF.full-archive.md
```

Expected: 文件路径输出，且大小约 125 KB。

- [ ] **Step 3: 创建目标目录（如果不存在）**

```bash
ls docs/archive/ 2>&1 | head -5
```

Expected: `docs/archive/` 已存在（spec 提到的）。如果没有：

```bash
mkdir -p docs/archive
```

- [ ] **Step 4: 迁文件**

```bash
git mv PROJECT_HANDOFF.full-archive.md docs/archive/PROJECT_HANDOFF.full-archive.md
ls PROJECT_HANDOFF.full-archive.md docs/archive/PROJECT_HANDOFF.full-archive.md 2>&1
```

Expected: 第一个报错；第二个路径存在。

- [ ] **Step 5: 编辑 `PROJECT_HANDOFF.md`，更新引用路径**

把：
```markdown
> 完整备份见 `PROJECT_HANDOFF.full-archive.md`（保留至少 1 周）。
```
改为：
```markdown
> 完整备份见 `docs/archive/PROJECT_HANDOFF.full-archive.md`（已归档；保留 ≥ 1 周承诺已于 2026-07-11 转入 docs/archive/）。
```

- [ ] **Step 6: 检查 `.gitignore` 是否需要调整**

`.gitignore` 现状应忽略 `idea.md` / `TCP.pdf` 等本地文件。`PROJECT_HANDOFF.full-archive.md` 在 tracked 状态没问题。

- [ ] **Step 7: 跑测试（确保未引起回归）**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed（修改的是文档和归档，测试应不变）。

- [ ] **Step 8: 同步更新 `docs/archive/README.md`**（如果存在）

```bash
cat docs/archive/README.md 2>&1 | head -20
```

如果 README 已存在，添加一行：
```markdown
- `PROJECT_HANDOFF.full-archive.md` —— 2026-05-31 → 2026-07-10 期间的完整交接文档归档（迁自项目根）
```

- [ ] **Step 9: Commit**

```bash
git add PROJECT_HANDOFF.md docs/archive/
git status --short
git commit -m "refactor(docs): 归档 PROJECT_HANDOFF.full-archive.md 到 docs/archive/" -m "1 周保留承诺到期（2026-07-11），归档比保留更合适；改 PROJECT_HANDOFF.md 引用路径"
```

---

## Phase 3 · 文档双源（Task 6）

### Task 6: `docs/DESIGN.md` 收敛；CLAUDE.md 加代码风格 + 命名约定

**Files:**
- Rewrite: `docs/DESIGN.md`（改为 5 行指向 CLAUDE.md）
- Modify: `CLAUDE.md`（在「文件结构约定」section 后追加「代码风格」+「命名约定」两个 section）
- Test: 无

- [ ] **Step 1: 读当前 `docs/DESIGN.md`**

```bash
cat docs/DESIGN.md
```

Expected: 5 行左右。

- [ ] **Step 2: 用以下 5 行完全替换**

```markdown
# 设计风格（Design Tokens）

> **唯一源 = [`CLAUDE.md`「设计风格约束」](../CLAUDE.md)。**
> 本文件不再单独维护。设计变更请同步 CLAUDE.md。
> 最后同步：2026-07-11。
```

- [ ] **Step 3: 读 `CLAUDE.md` 找到插入点**

```bash
grep -n '^## ' CLAUDE.md
```

Expected: 找到「## 文件结构约定」section。

- [ ] **Step 4: 在「文件结构约定」section 后追加两个 section**

插入位置示例（CLAUDE.md 中「## 文件结构约定」段结束之后、「## 开发工作流」段之前）：

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add docs/DESIGN.md CLAUDE.md
git status --short
git commit -m "docs: 收敛 docs/DESIGN.md 到 CLAUDE.md；追加代码风格 + 命名约定 section" -m "docs/DESIGN.md 改为 5 行指向源；CLAUDE.md 加 D 设计层次 § 代码风格 · D 命名约定两块" -m "决策见 docs/handoff/decisions.md 与 docs/superpowers/specs/2026-07-11-normalization-design.md"
```

---

## Phase 4 · `var` → `const`/`let`（Tasks 7）

### Task 7: 8 文件 `var` → `const`/`let` 全迁移（逐文件 5 步）

**Files:**
- Modify: `utils/analytics.js`, `utils/bst.js`, `utils/graph.js`, `utils/hash-table.js`, `utils/sample-questions.js`, `utils/subnet.js`, `utils/tcp-states.js`, `pages/dashboard/dashboard.js`（共 8 文件）
- Test: 全部 12 suites 跨阶段验证

**Interfaces:**
- Consumes: 项目已有测试套件（12 suites / 236 tests）
- Produces: 8 文件内不再出现 `var`（除注释 / 字符串外）；测试仍全绿；语义不变

⚠️ **执行子策略**：本 Task 内分 8 个 sub-task（每个文件 1 个），每 sub-task 内按"5 步走：跑测试基线 → 替换 → 跑测试 → grep 自查 → commit"。

#### Sub-task 7.1: `utils/analytics.js`

- [ ] **Step 1: 跑基线测试，确认当前绿**

```bash
npm test -- tests/utils/analytics.test.js 2>&1 | tail -3
```

Expected: `1 passed`（或 N passed，N ≥ 1）。

- [ ] **Step 2: 编辑文件，逐个替换 `var` → `const` / `let`**

打开 `utils/analytics.js`，扫描所有 `var` 声明：
- 只读绑定（声明后不再赋值）→ `const`
- 会被重新赋值的（循环 `i`、累加等）→ `let`

常用 sed 范式（不通用，慎用）：
```bash
# 仅替换顶层、函数内的 var；不替换注释、字符串
# 推荐手动逐行检查
```

⚠️ 不要用全文 `sed -i 's/var /const /g'`，会破坏字符串内的 `"var "`。

- [ ] **Step 3: 跑测试，验证语义不变**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。如果 analytics.test.js 失败，回退 `git checkout utils/analytics.js` 并报告。

- [ ] **Step 4: grep 残留**

```bash
grep -nE '\bvar\b' utils/analytics.js
```

Expected: 无输出（除注释外不应有）。如果有，逐个 fix 后回到 Step 2。

- [ ] **Step 5: Commit**

```bash
git add utils/analytics.js
git commit -m "refactor(utils/analytics): var → const/let 全迁移（CLAUDE.md 代码风格约定）"
```

#### Sub-task 7.2: `utils/bst.js`

- [ ] **Step 1: 跑基线测试**

```bash
npm test -- tests/utils/bst.test.js 2>&1 | tail -3
```

Expected: `1 passed`（或 N passed，N ≥ 1）。

- [ ] **Step 2: 编辑 `utils/bst.js`，逐行替换 `var` → `const` / `let`**

打开 `utils/bst.js`，扫描所有 `var` 声明：
- 只读绑定（声明后不再赋值）→ `const`
- 会被重新赋值的（循环 `i`、累加等）→ `let`

⚠️ 不要用全文 `sed -i 's/var /const /g'`，会破坏字符串内的 `"var "`。

- [ ] **Step 3: 跑全套测试，验证语义不变**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。如果 bst.test.js 失败，回退 `git checkout utils/bst.js` 并报告。

- [ ] **Step 4: grep 残留**

```bash
grep -nE '\bvar\b' utils/bst.js
```

Expected: 无输出（除注释外不应有）。

- [ ] **Step 5: Commit**

```bash
git add utils/bst.js
git commit -m "refactor(utils/bst): var → const/let 全迁移"
```

#### Sub-task 7.3: `utils/graph.js`

- [ ] **Step 1: 跑基线测试**

```bash
npm test -- tests/utils/graph.test.js 2>&1 | tail -3
```

- [ ] **Step 2: 编辑 `utils/graph.js`，逐行替换 `var` → `const` / `let`**

打开 `utils/graph.js`，按 Sub-task 7.1 Step 2 的判定原则替换。

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。

- [ ] **Step 4: grep 残留**

```bash
grep -nE '\bvar\b' utils/graph.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add utils/graph.js
git commit -m "refactor(utils/graph): var → const/let 全迁移"
```

#### Sub-task 7.4: `utils/hash-table.js`

- [ ] **Step 1: 跑基线测试**

```bash
npm test -- tests/utils/hash-table.test.js 2>&1 | tail -3
```

- [ ] **Step 2: 编辑 `utils/hash-table.js`，逐行替换 `var` → `const` / `let`**

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。

- [ ] **Step 4: grep 残留**

```bash
grep -nE '\bvar\b' utils/hash-table.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add utils/hash-table.js
git commit -m "refactor(utils/hash-table): var → const/let 全迁移"
```

#### Sub-task 7.5: `utils/sample-questions.js`

- [ ] **Step 1: 跑基线测试**

⚠️ **特殊**：`utils/sample-questions.js` 没有 test（intentional orphan per spec）。只跑全套测试确认 baseline。

```bash
npm test 2>&1 | tail -3
```

- [ ] **Step 2: 编辑 `utils/sample-questions.js`，逐行替换 `var` → `const` / `let`**

- [ ] **Step 3: 跑全套测试（验证无回归）**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。

- [ ] **Step 4: grep 残留**

```bash
grep -nE '\bvar\b' utils/sample-questions.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add utils/sample-questions.js
git commit -m "refactor(utils/sample-questions): var → const/let 全迁移"
```

#### Sub-task 7.6: `utils/subnet.js`

- [ ] **Step 1: 跑基线测试**

```bash
npm test -- tests/utils/subnet.test.js 2>&1 | tail -3
```

- [ ] **Step 2: 编辑 `utils/subnet.js`，逐行替换 `var` → `const` / `let`**

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。

- [ ] **Step 4: grep 残留**

```bash
grep -nE '\bvar\b' utils/subnet.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add utils/subnet.js
git commit -m "refactor(utils/subnet): var → const/let 全迁移"
```

#### Sub-task 7.7: `utils/tcp-states.js`

- [ ] **Step 1: 跑基线测试**

```bash
npm test -- tests/utils/tcp-states.test.js 2>&1 | tail -3
```

- [ ] **Step 2: 编辑 `utils/tcp-states.js`，逐行替换 `var` → `const` / `let`**

注意：`tcp-states.js` 已有顶层 `TCP_STATES` / `TCP_FLAGS` 用 const，确认一致性。

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。

- [ ] **Step 4: grep 残留**

```bash
grep -nE '\bvar\b' utils/tcp-states.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add utils/tcp-states.js
git commit -m "refactor(utils/tcp-states): var → const/let 全迁移"
```

#### Sub-task 7.8: `pages/dashboard/dashboard.js`（pages 第一批）

- [ ] **Step 1: 跑基线测试**

⚠️ `pages/dashboard/dashboard.js` 没有 page-level test（per spec，dashbaord 无 page 测试属正常）。跑全套测试：

```bash
npm test 2>&1 | tail -3
```

- [ ] **Step 2: 编辑 `pages/dashboard/dashboard.js`，逐行替换 `var` → `const` / `let`**

⚠️ **特别**：这是 pages 上的 var 迁移第一批。注意循环与 `setData` 调用是否依赖 var hoisting；如有，逐个改 `let`。

- [ ] **Step 3: 跑全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。

- [ ] **Step 4: grep 残留**

```bash
grep -nE '\bvar\b' pages/dashboard/dashboard.js
```

Expected: 空。

- [ ] **Step 5: Commit**

```bash
git add pages/dashboard/dashboard.js
git commit -m "refactor(pages/dashboard): var → const/let 全迁移（pages 第一批）"
```

- [ ] **Task 7 完成态：仓库 utils + pages 内无 `var`（除 `docs/archive/` 等历史文档不计入）**

```bash
grep -rnE '\bvar\b' utils/ pages/ | grep -v '\.git' | grep -v '\.md:'
```

Expected: 输出为空。如果有任何残留，按文件重复 Step 2-5。

---

## Phase 5 · sort-viz r.3 修复（Tasks 8-9）

### Task 8: 抽 `utils/sort-algorithms.js` + `pages/sort-viz/sort-viz.js` 改 import

**Files:**
- Create: `utils/sort-algorithms.js`（从 `pages/sort-viz/sort-viz.js` 抽出纯 sort-step 函数）
- Modify: `pages/sort-viz/sort-viz.js`（改为 `require('../../utils/sort-algorithms')`）
- Test: `tests/pages/sort-viz.test.js`（Step 9 修复）

**Interfaces:**
- Consumes: `pages/sort-viz/sort-viz.js` 内的纯函数 sort-step 生成器（bubble / selection / insertion / ...)
- Produces: `utils/sort-algorithms.js` 导出与原实现行为相同的 `module.exports = { bubbleSort, selectionSort, insertionSort, ... }`（具体导出名以 step 1 扫描结果为准）

- [ ] **Step 1: 读 `pages/sort-viz/sort-viz.js` 找到纯 sort-step 函数**

```bash
grep -nE '^(function|const) .*Sort' pages/sort-viz/sort-viz.js
```

Expected: 列出 sort 函数名（`bubbleSort`, `selectionSort`, 等）。⚠️ 把所有 sort 函数名记下来。

- [ ] **Step 2: 把这些 sort-step 函数原样复制到新文件 `utils/sort-algorithms.js`**

```js
// utils/sort-algorithms.js
// 抽自 pages/sort-viz/sort-viz.js · 仅纯 sort-step 函数 · 与 WeChat mini-program runtime 无关
[...原样复制 sort 函数...]

module.exports = {
  // 与原 pages/sort-viz/sort-viz.js 一致的导出名
  bubbleSort: bubbleSort,
  // ...
};
```

⚠️ 不要修改函数体；只搬运 + 加 export。

- [ ] **Step 3: 编辑 `pages/sort-viz/sort-viz.js` 删除被搬走的函数，加 import**

```js
// pages/sort-viz/sort-viz.js 顶部
const sortAlgos = require('../../utils/sort-algorithms.js');
// 之后 usage: sortAlgos.bubbleSort(...) 替换原 bubbleSort(...)
```

然后逐个替换函数调用：`bubbleSort(arr)` → `sortAlgos.bubbleSort(arr)`；同理 selection/insertion。

- [ ] **Step 4: 跑测试，确认 sort-viz 业务流仍正常**

```bash
npm test -- tests/pages/sort-viz.test.js 2>&1 | tail -10
```

⚠️ 注意：此阶段 sort-viz.test.js 仍是 duplicating 实现（r.3 还没修），它的"测试"其实在测自己的 duplicating 实现。我们要做的是：保证 sortAlgos 调用通过 = 不打乱内部页调用即可。这是 Task 8 的边界。

Expected: 测试仍绿（duplicating 测试仅验证自己 duplicating 实现）。如果失败，回退 `git checkout pages/sort-viz/sort-viz.js utils/sort-algorithms.js` 重做。

- [ ] **Step 5: 跑全套测试，确认无其他回归**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed（duplicating sort-viz test 因自测仍绿）。

- [ ] **Step 6: Commit**

```bash
git add utils/sort-algorithms.js pages/sort-viz/sort-viz.js
git status --short
git commit -m "refactor(pages/sort-viz): 抽纯 sort-step 函数到 utils/sort-algorithms.js" -m "修 r.3 sort-viz 测试 duplicating 实现的前提条件 · pages/sort-viz/ 改为 import utils/sort-algorithms.js"
```

---

### Task 9: `tests/pages/sort-viz.test.js` 改为 import 真实实现（修 r.3）

**Files:**
- Modify: `tests/pages/sort-viz.test.js`（删 duplicating 实现 + 改为 import 真实）
- Test: `tests/pages/sort-viz.test.js` 必须仍通过

**Interfaces:**
- Consumes: `utils/sort-algorithms.js` 导出的 sort 函数
- Produces: 测试断言一致，但函数实现来自真实模块（不再 duplicating）

- [ ] **Step 1: 读当前 test 文件**

```bash
cat tests/pages/sort-viz.test.js | head -50
```

Expected: 看到 duplicating 实现部分。

- [ ] **Step 2: 把 duplicating 实现部分删除/注释掉，文件顶部加 import**

```js
const { bubbleSort, selectionSort, /* ... */ } = require('../../utils/sort-algorithms.js');
```

具体导出名以 Task 8 Step 1 扫到的为准。

- [ ] **Step 3: 如果旧文件用了 `describe('X')`，注意抹去同名 const**

可能会出现 `const bubbleSort = ...` 与 `const { bubbleSort } = require(...)` 冲突。删除原 const。

- [ ] **Step 4: 跑 sort-viz 测试**

```bash
npm test -- tests/pages/sort-viz.test.js 2>&1 | tail -10
```

Expected: 测试通过；如果失败（通常是断言改了）回退 Step 2 重做。

- [ ] **Step 5: 跑全套测试，确认无回归**

```bash
npm test 2>&1 | tail -5
```

Expected: 12 suites passed。

- [ ] **Step 6: 验证 r.3 修复证据**

```bash
diff <(grep -A 100 'bubbleSort' tests/pages/sort-viz.test.js | head -30) <(grep -A 30 'bubbleSort' utils/sort-algorithms.js | head -30)
```

Expected: 算法实现仅在 `utils/sort-algorithms.js` 中；test 文件仅引用，不重写。

- [ ] **Step 7: Commit**

```bash
git add tests/pages/sort-viz.test.js
git status --short
git commit -m "test(pages/sort-viz): 改为 import utils/sort-algorithms.js 不再 duplicating 排序实现（修 r.3）"
```

---

## Phase 6 · 验证（Task 10）

### Task 10: 全仓库最终 checklist + 处理遗留 `.claude/settings.json`

**Files:**
- Modify: 无（仅校验 + 一次性整理 git status）
- Test: 全套 12 suites / 236 tests

- [ ] **Step 1: 全仓库 grep `var` 残留**

```bash
grep -rnE '\bvar\b' utils/ pages/ | grep -v '\.git' | grep -v '\.md:'
```

Expected: 输出为空。

- [ ] **Step 2: 全仓库校验目录迁移**

```bash
[ ! -e __mocks__/wx.js ] && echo 'PASS: __mocks__/wx.js removed' || echo 'FAIL'
[ -e tests/__mocks__/wx.js ] && echo 'PASS: tests/__mocks__/wx.js exists' || echo 'FAIL'
[ -d docs/plans ] && echo 'PASS: docs/plans/ exists' || echo 'FAIL'
[ ! -d docs/superpowers/plans ] && echo 'PASS: docs/superpowers/plans/ removed' || echo 'FAIL'
[ ! -e PROJECT_HANDOFF.full-archive.md ] && echo 'PASS: project root archive removed' || echo 'FAIL'
[ -e docs/archive/PROJECT_HANDOFF.full-archive.md ] && echo 'PASS: archive version exists' || echo 'FAIL'
[ ! -e test-questions.md ] && echo 'PASS: root test-questions.md removed' || echo 'FAIL'
[ -e tests/fixtures/test-questions.md ] && echo 'PASS: fixtures version exists' || echo 'FAIL'
```

Expected: 8 行 `PASS`。

- [ ] **Step 3: `.gitignore` 校验**

```bash
grep -E '^(design-methods|design-previews|\.DS_Store)' .gitignore
```

Expected: 出现这 3 行（或至少其中存在 rules 在生效）。验证设计目录不入库：

```bash
git ls-files design-methods | head -3
git ls-files design-previews | head -3
git ls-files | grep -E '\.DS_Store$' | head -3
```

Expected: 三个命令都无输出。

- [ ] **Step 4: CLAUDE.md 校验**

```bash
grep -E '^## (代码风格|命名约定)' CLAUDE.md
```

Expected: 2 行匹配。

- [ ] **Step 5: 文档双源收敛校验**

```bash
wc -l docs/DESIGN.md
cat docs/DESIGN.md
```

Expected: ≤ 5 行；首行应包含 "CLAUDE.md" 字样。

- [ ] **Step 6: 全套测试**

```bash
npm test 2>&1 | tail -5
```

Expected: `Test Suites: 12 passed, 12 total`。

- [ ] **Step 7: 处理遗留 `.claude/settings.json`（用户决定保留在 unstaged）**

```bash
git diff .claude/settings.json | head -30
```

Expected: 输出之前会话的修改。如果用户要求保留 unstaged 状态，跳过本步；否则：

```bash
# 在用户授权的情况下
git checkout .claude/settings.json
```

⚠️ 默认不动 `.claude/settings.json`，等用户决定。

- [ ] **Step 8: 最终 git status 汇总**

```bash
git status
git log --oneline 84a7875..HEAD
```

Expected: `git status` 仅可能显示 `.claude/settings.json` unstaged；`git log` 显示 12-15 个新 commit（包括 Task 0 baseline 测试 + 8 sub-task commits + 结构性 commits）。

- [ ] **Step 9: 整理提交历史（按 CLAUDE.md Git 提交规范）**

⚠️ **不执行**：本 Task 仅作为用户决策提示——是否要把多个 sub-task commit squash 为更大的批次 commit。等用户拍板。

- [ ] **Step 10: 通知用户 + 等指示**

⚠️ 不 push（用户未要求 push）。把 plan 实施总结（包含 commit 列表 + 最终 checklist 结果）以单条消息发回用户，等用户决策（push / squash / 继续 / 回退）。

---

## Failure / Recovery

| 失败 | 操作 |
|---|---|
| Task 内某 Step 失败 | 回退该 Task commit（`git reset --hard HEAD~1`），重做 |
| Task 内 `npm test` 失败 | 停止实施；回退 + diff 分析 + 改 plan |
| var→let 后循环语义破坏 | 回退该文件（`git checkout <file>`）；manual 转回 var |
| sort-viz 抽离失败 | 暂留 r.3；记录到 `docs/handoff/future-plans.md`；不在本 plan 强求 |
| 全 plan 失败 | `git reset --hard 0d0ac01`（baseline）；spec doc 不动 |

---

## Plan 完成态（参考）

- 所有 11 个 Task 全部 ✅
- `npm test` 12 suites / 236 tests 全绿
- 全 13 项 spec 变更落地
- commit log 含本计划所有 commit
- 未 push，等用户指示
