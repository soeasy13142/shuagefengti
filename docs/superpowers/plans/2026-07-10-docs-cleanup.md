# 项目文档规范化整理 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `my-miniapp` 项目从 1 个 4241 行的交接文档 + 散落 README + 历史归档混乱的状态，整理为「PROJECT_HANDOFF.md (≤300 行 INDEX) + docs/handoff/ 专题 + 分层 README + 标准化目录」的可维护形态。本计划**只动 Markdown 文档，不动任何核心代码**。

**Architecture:**
- **PROJECT_HANDOFF.md 缩为 INDEX**：原 §3-§21 内容按主题拆到 `docs/handoff/` 目录下独立专题文件
- **README 分层**：根 README = 项目门面（≤200 行），子目录 README = 自己目录说明，删除冗余的 `docs/README.md`
- **新增 `docs/DESIGN.md`**：把 CLAUDE.md 中的设计风格约束抽出来作为独立规范
- **删除 `docs/README.md` / `docs/README_EN.md`**：内容并入根 README
- **保留所有过期文件**：旧需求文档 `git mv` 到 `docs/archive/` 加 banner；不动 `test-questions.md`、`idea.md`、设计参考目录

**Tech Stack:** 仅 Markdown 文件编辑 + `git mv` + `npm test` 验证无意外副作用。**不引入新依赖、不修改 package.json/jest.config/任何 .js/.wxml/.wxss/.json 业务配置文件**。

---

## Global Constraints

1. **绝对不动**：`pages/`、`utils/`、`app.*`、`jest.config.js`、`package.json`、`__mocks__/`、`project.config.json`、`project.private.config.json`、`sitemap.json`、`.gitignore`、任何 `.js/.wxml/.wxss/.json` 业务代码
2. **绝对保留**：`test-questions.md`（刷题引擎输入）、`idea.md`（gitignore）、`design-methods/`、`design-previews/`、`.claude/skills/`（参考资料）
3. **每个 task 必须通过验证**：`npm test` 全绿 + 用 `wc -l` 核对行数 + 用 `grep` 核对内容
4. **每个 task 用一次独立 commit**：`feat(docs):` / `refactor(docs):` / `chore(docs):` / `docs:` 前缀
5. **备份保留**：`PROJECT_HANDOFF.full-archive.md` 保留在仓库根目录，**至少观察 1 周后才考虑删除**（见 Task 25 备注）
6. **不接受占位**：每个 step 必须有具体命令或可粘贴的代码块；不许 `TBD` / `TODO` / `类似 Task X`

### 关键事实（写 plan 前已核对）

| 事实 | 值 |
|---|---|
| 当前注册页面数 | **13 个**（app.json） |
| 页面清单 | index, quiz-list, import-preview, quiz, result, records, record-detail, wrong-questions, dashboard, subnet-calc, sort-viz, **tcp-viz**, **ds-viz** |
| utils 数量 | 11 个：util, storage, markdown-parser, sample-questions, analytics, subnet, **bst, graph, hash-table, tcp-states, tool-registry** |
| tests 结构 | tests/{pages,utils}/ |
| PROJECT_HANDOFF.md 行数 | **4241** |
| 期望终态行数 | **≤ 300** |
| 当前测试结果 | 11 suites / 218 tests（README 声称，需核对） |
| 当前 git status | `M .claude/settings.json` + `M CLAUDE.md`（保持不动） |

**注意**：`docs/handoff/modules/quiz.md` 把 §7.2-§7.13 这 12 小节全部合并为 1 个文件；TCP/DS 两个模块虽然 README 提了但 PROJECT_HANDOFF §7 没有对应小节——Task 10、Task 11 会基于 `pages/tcp-viz/` 和 `pages/ds-viz/` 实际代码补写。

---

## Task 1: 基线测试 + 备份原 PROJECT_HANDOFF

**Files:**
- Create: `PROJECT_HANDOFF.full-archive.md`
- Touch: 无（仅创建副本）

- [ ] **Step 1: 运行基线测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test 2>&1 | tail -5
```

预期：所有 suites 通过；记录**实际**的 suites / tests 数字（不是 README 声称的）。

- [ ] **Step 2: 复制 PROJECT_HANDOFF.md 为完整备份**

```bash
cd /Users/charliepan/Downloads/my-miniapp && cp PROJECT_HANDOFF.md PROJECT_HANDOFF.full-archive.md
```

- [ ] **Step 3: 核对备份**

```bash
cd /Users/charliepan/Downloads/my-miniapp && md5 PROJECT_HANDOFF.md PROJECT_HANDOFF.full-archive.md
```

预期：两个文件的 MD5 **完全一致**。

- [ ] **Step 4: 验证 .gitignore 不误伤**

```bash
cd /Users/charliepan/Downloads/my-miniapp && grep -E "full-archive|PROJECT_HANDOFF" .gitignore || echo "OK: not gitignored"
```

预期：输出 `OK: not gitignored`（即 full-archive.md 会被 git 跟踪作为保险）。

- [ ] **Step 5: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add PROJECT_HANDOFF.full-archive.md && git commit -m "chore(docs): archive original PROJECT_HANDOFF.md before refactor"
```

---

## Task 2: 创建 docs/handoff/ 目录骨架与导览

**Files:**
- Create: `docs/handoff/README.md`
- Create: `docs/handoff/.gitkeep`（如需要）

- [ ] **Step 1: 创建 handoff 目录**

```bash
cd /Users/charliepan/Downloads/my-miniapp && mkdir -p docs/handoff/modules docs/handoff/archive_refs
```

- [ ] **Step 2: 写 docs/handoff/README.md**

写入（拷贝下方整段）：

```markdown
# Handoff Documentation（交接专题）

> 派生自 `PROJECT_HANDOFF.md`。最新版本以此目录下的专题文件为准，`PROJECT_HANDOFF.md` 仅作 INDEX。

## 目录

| 文件 | 主题 | 派生自 P.H. § |
|---|---|---|
| `architecture.md` | 架构、数据流、文件结构、页面注册、测试状态 | §3、§5、§6、§7.1、§10 |
| `modules/quiz.md` | 刷题主链路：解析、存储、列表、刷题、结果、记录、错题 | §7.2-§7.13 |
| `modules/sort-viz.md` | 排序可视化 | §7.14 |
| `modules/dashboard.md` | 学习驾驶舱 | §7.15 |
| `modules/subnet-calc.md` | 子网计算器 | §7.16 |
| `modules/tcp-viz.md` | TCP 状态机动画 | （P.H. 缺 → 由本整理补写，基于 `pages/tcp-viz/` 实际代码） |
| `modules/ds-viz.md` | 数据结构可视化（BST / 栈&队列 / 哈希表 / 图） | （P.H. 缺 → 由本整理补写，基于 `pages/ds-viz/` 实际代码） |
| `data-structures.md` | paper / question / record / wrongQuestion / tempImportData | §8 |
| `decisions.md` | 决策记录 + 用户偏好 + 脑暴收敛 | §9、§18、§19、§20、§21 |
| `risks.md` | 当前可见风险与注意点 | §11 |
| `future-plans.md` | 下一步开发建议 | §12 |
```

- [ ] **Step 3: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/ && git commit -m "feat(docs): scaffold docs/handoff/ structure"
```

---

## Task 3: 新增 docs/DESIGN.md（设计风格规范）

**Files:**
- Create: `docs/DESIGN.md`

- [ ] **Step 1: 写 docs/DESIGN.md**

写入（拷贝下方整段）：

```markdown
# 设计风格 · Claude Design 暖奶油画布

> 本文件派生自 `CLAUDE.md` 的「设计风格约束」章节。CLAUDE.md 是项目指令源；本文档是面向实现的完整规范。
> 当本文档与 CLAUDE.md 冲突时，以 **CLAUDE.md 为准**（项目级事实表优先），并通过 commit 同步两处。

## 1. 色彩 token

| 角色 | 色值 | 说明 |
|---|---|---|
| 页面背景 | `#faf9f5` | 暖奶油 |
| 卡片背景 | `#efe9de` | 奶油卡片 |
| 主色（CTA） | `#cc785c` | 珊瑚色 |
| 主色 Active | `#a9583e` | 按下态 |
| 标题/正文 | `#141413` | 暖墨 |
| 次要文字 | `#6c6a64` | 灰文字 |
| 深色表面 | `#181715` | 深海军蓝 |
| 深色文字 | `#faf9f5` | 深底白字 |

## 2. 字体

- 标题：**Georgia** 衬线
- 标题 weight：**400**
- 标题 letter-spacing：**-3rpx**
- 正文：系统默认无衬线
- **不引入自定义字体文件**

## 3. 卡片规范

- 圆角：**24rpx**
- 阴影：**零**（靠色块对比表达深度）
- 例外：dashboard、subnet-calc 中二进制位可视化等有专门配色语义的组件

## 4. 不做清单

- 不引入图标库
- 不引入自定义字体文件
- 不用 box-shadow 做层次
- 不用 emoji 当功能性图标（emoji 仅用于装饰性预占位可接受）

## 5. 适用场景

所有新建或重构的页面都必须遵守。
当某个模块需要偏离本规范（如 dashboard 数据大屏的深色玻璃风），需在 `docs/handoff/decisions.md` 记录决策。
```

- [ ] **Step 2: 校验**

```bash
cd /Users/charliepan/Downloads/my-miniapp && head -5 docs/DESIGN.md && echo "---" && wc -l docs/DESIGN.md
```

预期：首行是 `# 设计风格 · Claude Design 暖奶油画布`；总行数 ≈ 40-50 行。

- [ ] **Step 3: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/DESIGN.md && git commit -m "docs: add DESIGN.md with Claude Design 暖奶油画布 spec"
```

---

## Task 4: docs/handoff/architecture.md（架构 + 数据流 + 文件结构 + 页面注册 + 测试状态）

**Files:**
- Create: `docs/handoff/architecture.md`

> 派生自 PROJECT_HANDOFF §3、§5、§6、§7.1、§10。

- [ ] **Step 1: 写 docs/handoff/architecture.md**

写入（拷贝下方整段；把测试数字替换为 Task 1 步骤 1 记录的实际数字）：

```markdown
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
└── PROJECT_HANDOFF.md        索引（≤300 行，详见本目录各专题）
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
- **当前结果**：（首次跑时填入 Task 1 步骤 1 的实际数字）
- **覆盖**：utils 全覆盖；pages 引擎逻辑部分覆盖；WXML/WXSS 渲染无自动化测试
- **不在覆盖范围**：`wx.chooseMessageFile` 等小程序 API 真实调用、UI 渲染、文件存储容量错误
```

- [ ] **Step 2: 替换占位文字**

```bash
cd /Users/charliepan/Downloads/my-miniapp && sed -i '' 's|（首次跑时填入 Task 1 步骤 1 的实际数字）|<paste actual suite count from Task 1>|' docs/handoff/architecture.md
```

把 `<paste actual suite count from Task 1>` 替换为 Task 1 步骤 1 实际记录的数字（例如 `11 suites / 218 tests, 全部通过`）。

- [ ] **Step 3: 校验无未替换占位**

```bash
cd /Users/charliepan/Downloads/my-miniapp && grep -nE "TBD|TODO|首次跑|占位" docs/handoff/architecture.md && echo "FAIL" || echo "OK"
```

预期：`OK`。

- [ ] **Step 4: 行数 + 跑测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l docs/handoff/architecture.md && npm test 2>&1 | tail -3
```

预期：架构文档 < 100 行；测试全绿。

- [ ] **Step 5: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/architecture.md && git commit -m "docs: add architecture.md to handoff"
```

---

## Task 5: docs/handoff/modules/README.md（模块导览）

**Files:**
- Create: `docs/handoff/modules/README.md`

- [ ] **Step 1: 写模块导览**

写入：

```markdown
# 模块详解（Modules）

> 每个模块一份独立文件。详细实现见对应文件。

| 模块 | 文件 | 摘要 |
|---|---|---|
| 刷题主链路 | `quiz.md` | Markdown 解析、本地存储、试卷列表、刷题引擎、判分、记录、错题本 |
| 学习驾驶舱 | `dashboard.md` | 累计统计、题型雷达、7 天趋势、智能建议 |
| 子网计算器 | `subnet-calc.md` | IP/CIDR 计算、二进制位可视化、AND 运算动画、地址分类 |
| TCP 动画机 | `tcp-viz.md` | TCP 状态机交互、三次握手/四次挥手逐步骤动画 |
| 数据结构可视化 | `ds-viz.md` | BST、栈&队列、哈希表、图 BFS/DFS 四种模式 |
| 排序可视化 | `sort-viz.md` | 选择/冒泡/快速排序 + 步骤回放 |

## 阅读顺序建议

1. 先看 `quiz.md` 理解主链路数据流
2. 看 `dashboard.md` 了解本地统计与建议规则
3. 看 `subnet-calc.md` 或 `tcp-viz.md` 或 `ds-viz.md` 了解可视化模块的标准分层
4. 看 `sort-viz.md` 了解算法步骤生成 + UI 回放分离模式
```

- [ ] **Step 2: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/modules/README.md && git commit -m "docs: add modules README to handoff"
```

---

## Task 6: docs/handoff/modules/quiz.md（刷题主链路）

**Files:**
- Create: `docs/handoff/modules/quiz.md`

> 派生自 PROJECT_HANDOFF §7.2-§7.13（合并为一份文件）。

- [ ] **Step 1: 写刷题主链路模块文档**

> **重要**：直接基于实际代码与 PROJECT_HANDOFF §7.2-7.13 撰写。每个子节标题保留原 § 号锚点（如 `### 7.2 工具函数`），便于交叉检索。完整内容长度约 250-400 行。

写入：

```markdown
# 刷题主链路（Quiz Pipeline）

> 派生自 `PROJECT_HANDOFF.md` §7.2-§7.13。

## 概览

刷题模块是项目最核心、最早成型的模块。从用户导入 `.md` 试题文件开始，经过解析、预览、练习/考试刷题、判分、记录保存、错题入栈的全链路闭环。

链路：`quiz-list → import-preview → quiz → result / records → record-detail → wrong-questions`

## 7.2 工具函数（utils/util.js）

- `generateId()`：基于 `Date.now()` + `Math.random()` 生成字符串 ID
- `formatTime(date)`：格式化为 `YYYY-MM-DD HH:mm:ss`
- `formatDuration(seconds)`：格式化为 `N分N秒` 或 `N秒`
- 测试：`tests/utils/util.test.js`

## 7.3 本地存储封装（utils/storage.js）

四个核心 key：

```js
const KEYS = {
  PAPERS: 'papers',
  RECORDS: 'records',
  WRONG_QUESTIONS: 'wrongQuestions',
  TEMP_IMPORT: 'tempImportData'
};
```

能力：试卷 CRUD / 记录 CRUD / 错题 CRUD / 临时导入数据。`deletePaper()` 级联删除对应记录与错题。详见 `tests/utils/storage.test.js`。

## 7.4 Markdown 解析器（utils/markdown-parser.js）

入口 `parseMarkdown(text)`。支持两种格式：

```md
1. 题干
A. 选项A
B. 选项B
答案：A
```

```md
## 第1题
题干
A. 选项A
B. 选项B
**答案：B**
```

支持的题型：`single` / `multi` / `judge` / `fill` / `essay`。判型规则：选择题答案 `,` 去后 > 1 字符视为多选；非选择题含 `___` / `____` / `（ ）` 视为填空；其他为简答。详见 `tests/utils/markdown-parser.test.js`。

## 7.5 示例题

- `utils/sample-questions.js`：程序化注入的示例题
- `test-questions.md`：根目录的 Markdown 示例题，作为导入源测试用例
- `quiz-list` 提供 `onImportSample()` 一键导入示例题

## 7.6 首页（pages/index/）

工具箱布局的入口页。Hero 卡片为"开始刷题"主入口，其他功能卡片按顺序平铺，底部为记录与错题快捷入口。详见全局规范 `docs/DESIGN.md`。

## 7.7 试卷列表与导入（pages/quiz-list/）

- `onShow()` 加载本地 `papers`
- 点击试卷进入刷题页
- 删除试卷触发 `deletePaper()` 级联清理
- 导入路径：`wx.chooseMessageFile` → `readFileSync` → `parseMarkdown` → `setTempImportData` → 跳转 `import-preview`
- 提供 `onImportSample()` 一键导入示例题

## 7.8 导入预览（pages/import-preview/）

- 从 `tempImportData` 读取数据
- 缺失时 toast 数据加载失败并返回
- 计算并展示题型统计（single/multi/judge/fill/essay）
- 确认后组装 paper 并写入 `papers`，清掉 `tempImportData`

## 7.9 刷题页 / 刷题引擎（pages/quiz/）

核心状态：`currentIdx` / `currentQuestion` / `userAnswer` / `selectedMap` / `answered` / `showExplanation` / `answers` / `startTime`。

判分规则：

| 题型 | 判分 |
|---|---|
| 单选 | `userAnswer === question.answer` |
| 判断 | `userAnswer === question.answer` |
| 多选 | 答案排序后全等，顺序无关 |
| 填空 | 逗号分隔多空逐项 trim + lowercase |
| 简答 | 非空即"已作答" |

模式差异：
- practice：每答一题立即显示解析
- exam：提交只 toast，不自动跳题

`finishQuiz()` 必弹窗提示未答数量；`_doFinishQuiz()` 计算用时并写入 records 与 wrongQuestions。

## 7.10 结果页（pages/result/）

展示试卷名、模式、正确率、正确数、总题数、用时。提供"复盘错题"与"回首页"按钮。

## 7.11-7.13 答题记录、记录详情、错题本

- **records**：按 `endTime` 倒序加载所有记录
- **record-detail**：根据 `recordId` 找记录 + `paperId` 找原试卷，逐题展示用户答案与对错
- **wrong-questions**：支持隐藏已掌握、按时间/按试卷分组排序、标记掌握、重做未掌握错题

重做错题当前实现：将未掌握题作为临时试卷走 `import-preview`，确认为新 paper。语义可优化（见 `risks.md` 与 `future-plans.md`）。
```

- [ ] **Step 2: 行数 + 无占位**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l docs/handoff/modules/quiz.md && grep -nE "TBD|TODO|占位" docs/handoff/modules/quiz.md || echo "OK: no placeholders"
```

预期：< 150 行；输出 `OK: no placeholders`。

- [ ] **Step 3: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/modules/quiz.md && git commit -m "docs: add quiz.md to handoff modules"
```

---

## Task 7: docs/handoff/modules/sort-viz.md（排序可视化）

**Files:**
- Create: `docs/handoff/modules/sort-viz.md`

- [ ] **Step 1: 写 sort-viz 文档**

写入：

```markdown
# 排序可视化（Sort Visualization）

> 派生自 `PROJECT_HANDOFF.md` §7.14。

## 概览

提供三种排序算法的柱状图动画演示：选择 / 冒泡 / 快速。已切换至 Claude Design 暖奶油画布风格（参见 `docs/DESIGN.md`）。

## 输入与算法

- 用户输入：数字串（支持逗号、中文逗号、顿号分隔）
- 数字范围：1-99；数量 2-20
- 支持随机生成 5 / 10 / 15 / 20 个数
- 算法步骤生成器当前实现在 `pages/sort-viz/sort-viz.js`，**已知与测试代码重复**，参见 `risks.md` §r.3

## 步骤状态

```text
compare   → swap   → sorted   → pivot   → done
```

## UI 控制

播放 / 暂停 / 上一步 / 下一步 / 重置 / 调速；展示当前步骤描述、比较次数、交换次数。

## 测试

- 测试文件：`tests/pages/sort-viz.test.js`
- 覆盖：选择/冒泡/快速最终排序正确、done 步骤存在、sorted 标记、冒泡对已排序不产生 swap、快速包含 pivot、step 格式、swap 步骤索引数量
- **注**：测试函数目前为复制算法步骤生成器的版本。重构见 `future-plans.md`
```

- [ ] **Step 2: 校验 + 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l docs/handoff/modules/sort-viz.md && grep -nE "TBD|TODO|占位" docs/handoff/modules/sort-viz.md || echo "OK"
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/modules/sort-viz.md && git commit -m "docs: add sort-viz.md to handoff modules"
```

---

## Task 8: docs/handoff/modules/dashboard.md（学习驾驶舱）

**Files:**
- Create: `docs/handoff/modules/dashboard.md`

- [ ] **Step 1: 写 dashboard 文档**

写入：

```markdown
# 学习驾驶舱（Learning Dashboard）

> 派生自 `PROJECT_HANDOFF.md` §7.15。

## 概览

基于本地 `records` / `wrongQuestions` / `papers` 做统计与可视化学习的入口页。深色科技风格，**作为唯一突破暖奶油画布全局规范的功能模块**，决策记录见 `decisions.md`。

## 统计模块（utils/analytics.js）

入口：`buildDashboardData(records, wrongQuestions, papers, now)`，返回：

```js
{
  overview: { totalSessions, totalQuestions, averageAccuracy, totalCorrect, wrongCount, masteredWrongCount, paperCount },
  typeStats: [ { type, label, total, correct, accuracy } x 5 ],
  sevenDayTrend: [ { date, count, accuracy } x 7 ],
  weakSpot: { type, label, accuracy } | null,
  strength: { type, label, accuracy } | null,
  suggestions: [ { level, title, content, actionText, actionType } ]
}
```

## 页面区

```text
顶部总览 → 学习雷达（题型正确率）→ 7 天趋势 → 错题掌握 → 智能建议
```

## 智能建议（本地规则引擎）

不接真实 AI。基于规则的 6 种文案：
1. 无记录 → "先完成一次练习"
2. 平均正确率 < 60 → "先稳住基础正确率"
3. 某题型正确率最低 → "${label} 是当前薄弱点"
4. 未掌握错题 > 0 → "你还有 N 道未掌握错题"
5. 7 天无学习 → "学习节奏中断"
6. 平均正确率 ≥ 85 且无未掌握 → "状态很好，可以挑战考试模式"

每条建议含 `actionType` (`quiz` / `wrongQuestions` / `records`) 触发跳转。

## 测试

- `tests/utils/analytics.test.js`
- 覆盖：空状态 / 有记录统计 / 7 天趋势 / 建议规则
```

- [ ] **Step 2: 校验 + 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l docs/handoff/modules/dashboard.md
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/modules/dashboard.md && git commit -m "docs: add dashboard.md to handoff modules"
```

---

## Task 9: docs/handoff/modules/subnet-calc.md（子网计算器）

**Files:**
- Create: `docs/handoff/modules/subnet-calc.md`

- [ ] **Step 1: 写 subnet-calc 文档**

写入：

```markdown
# 子网计算器（Subnet Calculator）

> 派生自 `PROJECT_HANDOFF.md` §7.16。

## 概览

输入 IP 与 CIDR 前缀长度，实时计算子网掩码 / 网络地址 / 广播地址 / 可用主机范围。**核心炫技点是二进制位可视化**（32 bit 网格）。

## 纯函数模块（utils/subnet.js）

- IP 验证、解析、二进制转换
- CIDR → 子网掩码（覆盖 /0-/32 全部边界）
- 子网计算（192.168.1.0/24, 10.0.0.0/8 等）
- 地址分类 A/B/C/D/E、私有/公有、特殊地址（127.x.x.x 环回、255.255.255.255 广播等）
- `generateAndSteps()`：AND 运算步骤生成（逐字节 4 步 / 逐位 32 步）

## 二进制位可视化规范

| 位类别 | 颜色 |
|---|---|
| 网络位 | 珊瑚色 `#cc785c` |
| 主机位 | 浅蓝 `#7dd3fc` |

四行展示：IP / 子网掩码 / 网络地址 / 广播地址。网络 | 主机分界处加竖线分隔。

## AND 运算动画

独立区域。两种粒度：`byte`（4 步）/ `bit`（32 步）。当前操作位高亮 + 微缩放动效。控制：播放 / 暂停 / 上一步 / 下一步 / 重置。

## 测试

- `tests/utils/subnet.test.js`
- 覆盖：43 个测试用例（IP 验证、CIDR 验证、二进制转换、子网计算、地址分类、AND 步生成）

## 帮助区

可折叠说明：CIDR 含义、子网掩码作用、可用主机数公式（2^n - 2）。
```

- [ ] **Step 2: 校验 + 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l docs/handoff/modules/subnet-calc.md
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/modules/subnet-calc.md && git commit -m "docs: add subnet-calc.md to handoff modules"
```

---

## Task 10: docs/handoff/modules/tcp-viz.md（TCP 状态机动画）

**Files:**
- Create: `docs/handoff/modules/tcp-viz.md`

> 派生自 PROJECT_HANDOFF（**原文缺漏，需基于 `pages/tcp-viz/` + `utils/tcp-states.js` 实际代码补写**）。

- [ ] **Step 1: 浏览 tcp-viz 实际代码**

```bash
cd /Users/charliepan/Downloads/my-miniapp && ls pages/tcp-viz/ && echo "---" && cat utils/tcp-states.js | head -40
```

- [ ] **Step 2: 写 tcp-viz 文档**

写入（注意：以下为占位骨架，按 Step 1 浏览结果替换"状态点列表"与"动画控制"段为实际内容）：

```markdown
# TCP 状态机动画（TCP Visualization）

> 本节在 `PROJECT_HANDOFF.md` 中**没有对应章节**，由本整理任务基于 `pages/tcp-viz/` + `utils/tcp-states.js` 实际代码补写。

## 概览

交互式展示 TCP 状态机迁移，配合三次握手与四次挥手的逐步骤动画。

## 数据驱动（utils/tcp-states.js）

状态转换表是纯数据。`tcp-states.js` 定义所有状态点与合法迁移路径，便于后续扩展其他协议。

[描述此处的具体状态点列表 —— 来自 Step 1 实际浏览]

## 动画控制

[描述此处实际存在的控制 —— 来自 Step 1 实际浏览]

## 测试

[列出此模块已存在的测试 —— 如有，否则标 "暂无"]
```

- [ ] **Step 3: 替换占位为实际内容**

把 `[描述此处的具体状态点列表 —— 来自 Step 1 实际浏览]` 与 `[描述此处实际存在的控制 —— 来自 Step 1 实际浏览]` 两段替换为 Step 1 浏览到的实际状态点与控制。

- [ ] **Step 4: 无占位校验**

```bash
cd /Users/charliepan/Downloads/my-miniapp && grep -nE "TBD|TODO|占位|\[描述" docs/handoff/modules/tcp-viz.md && echo "FAIL: placeholder remains" || echo "OK"
```

预期：`OK`。

- [ ] **Step 5: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/modules/tcp-viz.md && git commit -m "docs: add tcp-viz.md to handoff modules (补写)"
```

---

## Task 11: docs/handoff/modules/ds-viz.md（数据结构可视化）

**Files:**
- Create: `docs/handoff/modules/ds-viz.md`

> 派生自 PROJECT_HANDOFF（**原文缺漏，需基于 `pages/ds-viz/` 实际代码补写**）。

- [ ] **Step 1: 浏览 ds-viz 实际代码**

```bash
cd /Users/charliepan/Downloads/my-miniapp && ls pages/ds-viz/ && echo "---" && head -50 utils/bst.js && echo "---" && head -30 utils/graph.js && echo "---" && head -30 utils/hash-table.js
```

- [ ] **Step 2: 写 ds-viz 文档**

写入：

```markdown
# 数据结构可视化（Data Structure Visualization）

> 本节在 `PROJECT_HANDOFF.md` 中**没有对应章节**，由本整理任务基于 `pages/ds-viz/` + `utils/{bst,graph,hash-table}.js` 实际代码补写。

## 概览

四种数据结构的交互演示：

| 模式 | 算法纯函数模块 | 说明 |
|---|---|---|
| BST（二叉搜索树） | `utils/bst.js` | 插入 / 删除 / 三种遍历 |
| 栈 & 队列 | （实现位于 `pages/ds-viz/` 中） | push / pop / enqueue / dequeue 实时动画 |
| 哈希表 | `utils/hash-table.js` | 冲突处理 + 链地址法可视化 |
| 图 BFS & DFS | `utils/graph.js` | 广度优先与深度优先搜索 |

## 分层模式

- 算法步骤生成在 `utils/` 纯函数模块
- 页面只负责调用算法取步骤序列 + 渲染
- 这样算法可独立测试，UI 换风格不影响逻辑

## 测试

[此处列出 `tests/` 下与 ds-viz 相关的测试 —— 如有]
```

- [ ] **Step 3: 替换占位为实际内容**

把 `[此处列出 `tests/` 下与 ds-viz 相关的测试 —— 如有]` 替换为实际测试文件路径列表（用 `ls tests/pages/` 核对）。

- [ ] **Step 4: 校验 + 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && grep -nE "TBD|TODO|占位|\[此处" docs/handoff/modules/ds-viz.md && echo "FAIL" || echo "OK"
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/modules/ds-viz.md && git commit -m "docs: add ds-viz.md to handoff modules (补写)"
```

---

## Task 12: docs/handoff/data-structures.md（数据模型）

**Files:**
- Create: `docs/handoff/data-structures.md`

> 派生自 PROJECT_HANDOFF §8。

- [ ] **Step 1: 写数据模型文档**

写入：

```markdown
# 数据模型（Data Structures）

> 派生自 `PROJECT_HANDOFF.md` §8。最新版本以实际代码为准。

## 1. Paper（试卷）

```js
{
  id: 'uuid-like-id',
  name: '试卷名称',
  importTime: '2026-06-08 12:00:00',
  questionCount: 50,
  questions: [Question]
}
```

## 2. Question（题目）

```js
{
  id: 'question-id',
  type: 'single' | 'multi' | 'judge' | 'fill' | 'essay',
  stem: '题干',
  options: [
    { letter: 'A', text: 'A. 选项内容' },
    { letter: 'B', text: 'B. 选项内容' }
  ],
  answer: 'A',
  explanation: '解析内容'
}
```

> 注意：早期设计文档里 `options` 是字符串数组，但当前实现是对象数组（`{letter, text}`）。后续开发以当前代码为准。

## 3. Record（答题记录）

```js
{
  id: 'record-id',
  paperId: 'paper-id',
  paperName: '试卷名称',
  mode: 'practice' | 'exam',
  startTime: '...',
  endTime: '...',
  duration: 600,
  totalQuestions: 50,
  correctCount: 42,
  accuracy: 84,
  answers: {
    'question-id': { userAnswer: 'A', correct: true }
  }
}
```

## 4. WrongQuestion（错题）

```js
{
  questionId: 'question-id',
  paperId: 'paper-id',
  question: Question,
  wrongCount: 2,
  mastered: false,
  lastWrongTime: '2026-06-08T12:00:00.000Z'
}
```

## 5. TempImportData（临时导入数据）

```js
{
  name: '试卷名称',
  questions: [Question]
}
```

用于页面间传递导入结果，避开 URL 参数长度限制。读后即清。
```

- [ ] **Step 2: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/data-structures.md && git commit -m "docs: add data-structures.md to handoff"
```

---

## Task 13: docs/handoff/decisions.md（决策记录）

**Files:**
- Create: `docs/handoff/decisions.md`

> 派生自 PROJECT_HANDOFF §9、§18、§19、§20、§21。

- [ ] **Step 1: 写决策记录**

写入：

```markdown
# 决策记录（Decisions）

> 聚合 `PROJECT_HANDOFF.md` §9（已修复问题）、§18（用户偏好）、§19-21（脑暴收敛）。
> 后续架构决策在此追加。

## 决策列表（按主题）

### 设计 / 视觉
- **2026-07-10** 项目文档规范化整理（本文即其产出）
- **2026-06-09** Claude Design 暖奶油画布风格定型（替代深色科技风）。例外：dashboard 数据大屏保持深色玻璃风（强约束）。
- **2026-06-13** TCP/DS 模块上线（README 与 PROJECT_HANDOFF 均未及时同步，见 `risks.md` §r.5）

### 刷题引擎
- **2026-06-04** 改用 `tempImportData` 本地临时存储替代 URL 参数传递（避免题目过多时 URL 超长）
- **2026-06-05** `deletePaper()` 增加级联删除试卷/记录/错题
- **2026-06-06** 填空题答案保留逗号用于多空答案（之前被错误清理）
- **2026-06-07** 多选题用 `selectedMap` 管理选择状态（修复考试模式多选无法切换）
- **2026-06-07** 考试模式提交不自动跳题，只 toast
- **2026-06-08** `finishQuiz()` 必弹窗提示未答题数

### 解析
- **2026-05-31** Markdown 解析器支持 `## 第N题` 标题格式
- **2026-06-01** 选项存储为 `{letter, text}` 对象而非字符串数组

### 产品方向
- **2026-06-09** 用户偏好：目标用户（自己 + 朋友 + 未来长效运营产品）
- **2026-06-09** 用户偏好：继续本地存储；后期转云
- **2026-06-09** 用户偏好：下一阶段偏向炫技功能
- **2026-06-09** 用户偏好：下一开发周期 ≈ 1 周
- **2026-06-09** 收敛：下一开发周期做"学习数据驾驶舱 + 轻量 AI 学习建议"

## 已修复的关键问题（迁移自 P.H. §9）

1. Markdown 解析器不支持 `## 第1题` 格式 → 已通过 stem 提取逻辑修复
2. 填空题答案里的逗号被清理 → 已修复
3. 考试模式多选题无法选择 → 已改用 `selectedMap`
4. 考试模式提交后自动跳题 → 已改为只 toast
5. 允许未答完直接交卷 → `finishQuiz()` 弹窗确认
6. URL 传导入数据可能过长 → 改用 `tempImportData`
7. 删除试卷遗留记录/错题 → 已级联清理
```

- [ ] **Step 2: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/decisions.md && git commit -m "docs: add decisions.md to handoff"
```

---

## Task 14: docs/handoff/risks.md（风险与注意点）

**Files:**
- Create: `docs/handoff/risks.md`

> 派生自 PROJECT_HANDOFF §11。

- [ ] **Step 1: 写风险文档**

写入：

```markdown
# 风险与注意点（Risks & Caveats）

> 派生自 `PROJECT_HANDOFF.md` §11。

## r.1 `project.config.json` 有未提交改动

微信开发者工具自动配置变更。建议继续开发前用 `git diff project.config.json` 看清楚内容，确认是否要 commit 或忽略。

## r.2 错题重做流程语义可优化

当前 `wrong-questions → import-preview → 新 paper`，能跑通但不够自然。更好方案：`wrong-questions` 直接创建临时 quiz session，不生成新 paper。

## r.3 排序可视化算法逻辑与测试逻辑重复

`tests/pages/sort-viz.test.js` 复制了排序步骤生成器，而非测试页面真实实现。
重构路径：
1. 抽到 `utils/sort-algorithms.js`
2. 页面改为调用工具模块
3. 测试直接 import 工具模块

## r.4 ID 方案偏弱

`Date.now() + Math.random()` 对纯本地项目够用。引入云同步 / 多端合并前，建议换更稳的方案（如 nanoid 或简单 uuid）。

## r.5 文档同步滞后

TCP/DS 模块已经在代码中存在并在 README 提及，但 PROJECT_HANDOFF §7 没有对应章节。**本整理任务已补全到 `docs/handoff/modules/tcp-viz.md` / `ds-viz.md`**，见 `decisions.md` 2026-07-10 条目。建议把"新增模块时同步追加 handoff 文档"加入开发者 checklist。

## r.6 解析器仍是正则解析

适合固定试题格式，**不是**完整 Markdown parser。新增格式前必须补测试用例：
- 答案在同一行标题后
- 选项跨行
- 小写选项
- 题干里包含 `A.` 字样
- 答案有空格、顿号、中文逗号
- 判断题答案是 `对/错` 而非 `A/B`

## r.7 简答题"非空即正确"

符合"显示参考答案，用户自评"的轻量方案，但统计意义上有偏（简答题正确率虚高）。
后续可优化为：提交后显示参考答案 + 用户标记"我答对/答错"才写入 records 与 wrongQuestions。

## r.8 记录详情依赖原试卷

`record-detail` 从 paper 取 questions。当前 `deletePaper` 级联删除记录，正常情况下没问题。
若未来希望"删试卷但保留历史"，需在 record 中冗余存完整 questions 快照。

## r.9 README 与实际注册的模块列表不一致

整理前根 README 说"13 个页面"但又没列出 TCP/DS。整理后的 `README.md` 已对齐 `app.json` 实际清单（13 个）。

## r.10 `docs/DESIGN.md` 与 `CLAUDE.md` 双源

`docs/DESIGN.md` 是从 `CLAUDE.md` 派生的事实表。当冲突时**以 CLAUDE.md 为准**（项目 Claude 指令优先级最高）。
后续每次更新设计风格，先改 CLAUDE.md，再同步 `docs/DESIGN.md`。
```

- [ ] **Step 2: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/risks.md && git commit -m "docs: add risks.md to handoff"
```

---

## Task 15: docs/handoff/future-plans.md（下一步开发建议）

**Files:**
- Create: `docs/handoff/future-plans.md`

> 派生自 PROJECT_HANDOFF §12。

- [ ] **Step 1: 写未来计划**

写入：

```markdown
# 下一步开发建议（Future Plans）

> 派生自 `PROJECT_HANDOFF.md` §12。优先级来自原 P.H. 分级。

## P0 · 继续前先做

1. 跑 `npm test`，确认全绿
2. `git status --short`，看未提交变更
3. 判断 `project.config.json` 的未提交变化是否要保留

## P1 · 完善刷题模块

1. 优化错题重做：直接进 quiz 而非走 import-preview，不生成新 paper
2. 简答题改为自评模式（提交后用户标记对错才入 record）
3. 增加按试卷筛选记录 / 错题
4. 增加导入失败时的错误详情（如"第 N 题解析失败"）
5. 试卷重命名功能
6. 清空记录、清空错题、导出数据等本地数据管理
7. Markdown 解析兼容性增强

## P2 · 完善排序可视化

1. 抽出排序算法纯函数到 `utils/sort-algorithms.js`（解 r.3）
2. 增加插入排序、归并排序、堆排序
3. 算法复杂度说明卡片
4. 每步伪代码高亮
5. 修复上一步回放的原始数组恢复逻辑可靠性
6. 首页卡片加更详细描述

## P3 · 新模块

首页仍预留 `单词记忆`，可开发方向：
- 单词卡片
- 自定义单词本
- 本地导入 CSV / Markdown
- 记忆状态
- 拼写测试
- 错词复习

## P4 · AI 化（远期）

`docs/handoff/decisions.md` 已记录"学习数据驾驶舱 + 轻量 AI 学习建议"为收敛方向。本地规则引擎已就位，远期可替换为云端大模型 API。建议设计 API 时保持 suggestions 结构与 `utils/analytics.js` 一致，便于不改动 dashboard 页面即可切换。
```

- [ ] **Step 2: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add docs/handoff/future-plans.md && git commit -m "docs: add future-plans.md to handoff"
```

---

## Task 16: 缩 PROJECT_HANDOFF.md 为 INDEX

**Files:**
- Modify: `PROJECT_HANDOFF.md`

- [ ] **Step 1: 写入新 PROJECT_HANDOFF.md**

写入（这是新的终态 INDEX）：

```markdown
# 刷个冯题 · 交接文档（INDEX）

> 最后更新：2026-07-10 · 文档规范化整理
> 完整备份见 `PROJECT_HANDOFF.full-archive.md`（保留至少 1 周）。
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
算法：utils/bst.js / graph.js / hash-table.js
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
| 测试配置 | `jest.config.js`、`__mocks__/wx.js` |

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
├─ docs/superpowers/
│  ├─ specs/2026-05-31-brushfengti-design.md   原始设计
│  └─ plans/2026-05-31-brushfengti.md          原始实施计划
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
```

- [ ] **Step 2: 核对行数**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l PROJECT_HANDOFF.md
```

预期：≤ 100 行（不含代码块的话 ≤ 60 行）。如超 100 行，回到 Step 1 精简 §2 与 §6。

- [ ] **Step 3: 跑测试确认未影响代码**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test 2>&1 | tail -5
```

预期：全部通过（这次只是文档修改，理论上不影响测试结果）。

- [ ] **Step 4: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add PROJECT_HANDOFF.md && git commit -m "refactor(docs): shrink PROJECT_HANDOFF.md to INDEX (split into handoff topics)"
```

---

## Task 17: 重写根 README.md 为项目门面

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 写入新根 README.md**

写入：

```markdown
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
- 测试：Jest 单元测试（11 suites / 218 tests）
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
| [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) | 30 秒恢复上下文 |
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
```

- [ ] **Step 2: 行数**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l README.md
```

预期：≤ 110 行。

- [ ] **Step 3: 跑测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test 2>&1 | tail -3
```

- [ ] **Step 4: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add README.md && git commit -m "docs: rewrite root README as project facade"
```

---

## Task 18: 重写根 README_EN.md（同步英文版）

**Files:**
- Modify: `README_EN.md`

- [ ] **Step 1: 写入新 README_EN.md**

写入：

```markdown
# Brush Up Questions (`刷个冯题`)

[中文](README.md)

A WeChat Mini Program learning toolkit: Markdown-based quiz, learning dashboard, subnet calculator, TCP state machine, data structure visualization, and sorting visualization.

All data is local. No backend, no account — every question you import, every record you make, lives in your phone.

## Modules

| Module | Description |
|---|---|
| Quiz | MVP. Markdown import, 5 question types, practice/exam modes, auto wrong-question capture |
| Learning Dashboard | Cumulative stats, question-type radar, 7-day trend, rule-based suggestions |
| Subnet Calculator | IP/CIDR + 32-bit binary visualization + AND animation |
| TCP State Machine | Interactive TCP FSM with handshake/teardown animation |
| Data Structure Viz | BST, stack/queue, hash table, graph BFS/DFS |
| Sorting Visualization | Selection/bubble/quick sort with step-by-step replay |
| Vocabulary Memory | Coming soon |

## Design

Uses **Claude Design Warm Canvas**: cream background `#faf9f5`, cream card `#efe9de`, coral CTA `#cc785c`. No shadows, depth expressed via color contrast. See [docs/DESIGN.md](docs/DESIGN.md).

## Tech Stack

- WeChat Mini Program native (WXML + WXSS + JS)
- Local storage only (`wx.setStorageSync`)
- Markdown parsing: hand-written regex (no third-party library)
- Jest for unit tests

## Quick Start

```bash
npm install
npm test
```

Open the project root in WeChat DevTools. To import questions: tap "Start Quiz" → "Import" → choose a Markdown file (see `test-questions.md` for format).

## Documentation

| Document | Purpose |
|---|---|
| [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) | 30-second context recovery |
| [docs/handoff/](docs/handoff/) | Module deep-dives, architecture, decisions, risks |
| [docs/DESIGN.md](docs/DESIGN.md) | Claude Design spec |
| [docs/superpowers/specs/](docs/superpowers/specs/) | Original design |
| [docs/superpowers/plans/](docs/superpowers/plans/) | Original implementation plan |

## Repository Notes

Files kept only locally (in `.gitignore`):

- `TCP.pdf` — Network protocol reference (3 MB binary)
- `idea.md` — Personal scratchpad

Archived/legacy documents live in [docs/archive/](docs/archive/).
```

- [ ] **Step 2: 行数 + 测试 + 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l README_EN.md
cd /Users/charliepan/Downloads/my-miniapp && npm test 2>&1 | tail -3
cd /Users/charliepan/Downloads/my-miniapp && git add README_EN.md && git commit -m "docs: rewrite English README as project facade"
```

---

## Task 19: 移动旧需求文档到 docs/archive/

**Files:**
- Move: `微信小程序需求.md` → `docs/archive/微信小程序需求.md`
- Create: `docs/archive/README.md`

- [ ] **Step 1: 创建 docs/archive/**

```bash
cd /Users/charliepan/Downloads/my-miniapp && mkdir -p docs/archive
```

- [ ] **Step 2: 用 git mv 移动旧文档（保留可追溯性）**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git mv 微信小程序需求.md docs/archive/微信小程序需求.md
```

- [ ] **Step 3: 在归档文件顶部加 banner**

使用 Edit：

- old_string:

```text
# 微信小程序需求
```

- new_string:

```markdown
<!--
⚠️ ARCHIVED · 2026-07-10

本文件是项目最初的需求草稿（2026-05-31 之前），已被以下文档替代：

- docs/superpowers/specs/2026-05-31-brushfengti-design.md（原始设计规格）
- docs/handoff/architecture.md（当前架构）
- docs/handoff/decisions.md（决策记录）
- docs/handoff/future-plans.md（下一步方向）

保留此文件仅作为历史归档参考。不再更新。
-->

# 微信小程序需求
```

- [ ] **Step 4: 写 docs/archive/README.md**

写入：

```markdown
# 归档（Archive）

> 存放已过时但保留作历史参考的文档。不再更新。

| 文件 | 起源 | 替代文档 |
|---|---|---|
| `微信小程序需求.md` | 2026-05-31 之前的需求草稿 | `docs/superpowers/specs/2026-05-31-brushfengti-design.md`、`docs/handoff/architecture.md` |
```

- [ ] **Step 5: 跑测试 + 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test 2>&1 | tail -3
cd /Users/charliepan/Downloads/my-miniapp && git status --short
cd /Users/charliepan/Downloads/my-miniapp && git add docs/archive/ && git commit -m "chore(docs): archive legacy 微信小程序需求.md"
```

预期 git status：只剩预期的 archive 目录变更；没有任何未跟踪代码文件。

---

## Task 20: 删除冗余的 docs/README.md 与 docs/README_EN.md

**Files:**
- Delete: `docs/README.md`
- Delete: `docs/README_EN.md`

- [ ] **Step 1: 验证冗余文件确实是冗余（没有内容被根 README 还没覆盖的）**

```bash
cd /Users/charliepan/Downloads/my-miniapp && diff <(grep -v '^#' README.md) <(grep -v '^#' docs/README.md) | head -20 || true
```

预期：差异微小或为 diff 退出码 1。**注意**：这步只 sanity check，不是阻塞。

- [ ] **Step 2: 确认 git 历史里能看到这两个文件**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git log --oneline -- docs/README.md docs/README_EN.md | head -5
```

预期：能看到历史 commits。

- [ ] **Step 3: 删除（用 git rm 而不是 rm，便于历史追溯）**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git rm docs/README.md docs/README_EN.md
```

- [ ] **Step 4: 验证根 README 仍有完整文档导航（已包含 docs/archive/ 等）**

```bash
cd /Users/charliepan/Downloads/my-miniapp && grep -n "docs/archive\|docs/handoff" README.md
```

预期：两处都能 grep 到。

- [ ] **Step 5: 测试 + 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test 2>&1 | tail -3
cd /Users/charliepan/Downloads/my-miniapp && git commit -m "chore(docs): remove redundant docs/README.md and docs/README_EN.md (folded into root README)"
```

---

## Task 21: 修订 pages/README.md（增加 TCP/DS 模块）

**Files:**
- Modify: `pages/README.md`

- [ ] **Step 1: 读现有 pages/README.md**

```bash
cd /Users/charliepan/Downloads/my-miniapp && cat pages/README.md
```

- [ ] **Step 2: 修订（用 Edit 替换目录清单）**

> 目标：在 pages 目录清单中补全 TCP/DS 模块，确认与实际目录一致。

```bash
cd /Users/charliepan/Downloads/my-miniapp && ls pages/
```

确认输出包含：`dashboard ds-viz import-preview index quiz quiz-list README_EN.md README.md record-detail records result sort-viz subnet-calc tcp-viz wrong-questions`。

- [ ] **Step 3: 把模块清单与权威说明对齐**

> 在 `pages/README.md` 末尾追加一行：

```markdown
## 详细说明

各模块实现细节见 [docs/handoff/modules/](docs/handoff/modules/)：
- quiz 主链路（含 quiz-list / import-preview / quiz / result / records / record-detail / wrong-questions）
- dashboard（学习驾驶舱）
- subnet-calc（子网计算器）
- tcp-viz（TCP 状态机动画）
- ds-viz（数据结构可视化）
- sort-viz（排序可视化）
```

- [ ] **Step 4: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add pages/README.md && git commit -m "docs: update pages/README.md to align with handoff modules"
```

---

## Task 22: 修订 utils/README.md（增加 BST/Graph/Hash/TCP/Tool-Registry）

**Files:**
- Modify: `utils/README.md`

- [ ] **Step 1: 读现有 utils/README.md**

```bash
cd /Users/charliepan/Downloads/my-miniapp && cat utils/README.md
```

- [ ] **Step 2: 在 utils/README.md 中追加完整模块清单**

在文件最后追加：

```markdown

## 当前 utils 模块清单（11 个）

| 模块 | 用途 |
|---|---|
| `util.js` | `generateId` / `formatTime` / `formatDuration` |
| `storage.js` | 本地存储封装（papers / records / wrongQuestions / tempImportData） |
| `markdown-parser.js` | 试题 Markdown 解析 |
| `sample-questions.js` | 示例题程序化注入 |
| `analytics.js` | 学习驾驶舱数据聚合（dashboard 用） |
| `subnet.js` | 子网计算 + IP/CIDR 二进制转换 + AND 步骤生成 |
| `tcp-states.js` | TCP 状态机数据表 |
| `bst.js` | 二叉搜索树算法步骤生成（ds-viz 用） |
| `graph.js` | 图 BFS / DFS 算法步骤生成（ds-viz 用） |
| `hash-table.js` | 哈希表算法步骤生成（ds-viz 用） |
| `tool-registry.js` | 首页工具卡片配置 |

详见 [docs/handoff/modules/](docs/handoff/modules/)。
```

- [ ] **Step 3: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add utils/README.md && git commit -m "docs: expand utils/README.md with all 11 modules"
```

---

## Task 23: 修订 tests/README.md（指向 handoff）

**Files:**
- Modify: `tests/README.md`

- [ ] **Step 1: 读现有 tests/README.md**

```bash
cd /Users/charliepan/Downloads/my-miniapp && cat tests/README.md
```

- [ ] **Step 2: 在末尾追加文档导航**

```markdown

## 文档

被测模块的上下文与算法说明见 [docs/handoff/modules/](docs/handoff/modules/)。
```

- [ ] **Step 3: 提交**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git add tests/README.md && git commit -m "docs: link tests/README.md to handoff docs"
```

---

## Task 24: 最终验证

**Files:**
- Touch: 无（仅运行验证）

- [ ] **Step 1: 测试全绿**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test 2>&1 | tail -5
```

预期：所有 suites 仍通过。如果失败，立即 stop 并按 TDD 反向定位问题。

- [ ] **Step 2: PROJECT_HANDOFF.md 行数核对**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l PROJECT_HANDOFF.md
```

预期：≤ 100 行。

- [ ] **Step 3: 所有根 README 文件行数核对**

```bash
cd /Users/charliepan/Downloads/my-miniapp && wc -l README.md README_EN.md pages/README.md tests/README.md utils/README.md
```

预期：根 README ≤ 110 行；子 README ≤ 60 行。

- [ ] **Step 4: 全 docs 目录无 TBD/TODO/占位字样**

```bash
cd /Users/charliepan/Downloads/my-miniapp && grep -rnE "TBD|TODO|占位|XXX" docs/ || echo "OK: clean"
```

预期：`OK: clean`。

- [ ] **Step 5: 关键链接可达**

```bash
cd /Users/charliepan/Downloads/my-miniapp && for f in docs/handoff/architecture.md docs/DESIGN.md docs/handoff/modules/quiz.md docs/handoff/decisions.md docs/handoff/risks.md docs/handoff/future-plans.md docs/archive/README.md; do test -f "$f" && echo "OK $f" || echo "MISSING $f"; done
```

预期：全部 `OK`。

- [ ] **Step 6: git status 干净**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git status --short
```

预期：只剩 `PROJECT_HANDOFF.full-archive.md`（保留作 safety net，不入进一步 commit）。

- [ ] **Step 7: git log 看出 24 个独立 commits**

```bash
cd /Users/charliepan/Downloads/my-miniapp && git log --oneline -24
```

预期：看到本次整理产出的所有 commits，每个 task 一个。

- [ ] **Step 8: 全 markdown H1 数量核对**

```bash
cd /Users/charliepan/Downloads/my-miniapp && for f in PROJECT_HANDOFF.md README.md README_EN.md docs/DESIGN.md docs/handoff/*.md docs/handoff/modules/*.md docs/archive/README.md; do count=$(grep -c "^# " "$f"); echo "$count $f"; done | sort
```

预期：每个文件 H1 数量为 1。

---

## Task 25: NOT TO COMMIT · 1 周后清理 PROJECT_HANDOFF.full-archive.md

> 此 Task **不是 commit**，而是 1 周后的清理提示。

- [ ] **🕐 1 周后（约 2026-07-17）手动操作**：

```bash
cd /Users/charliepan/Downloads/my-miniapp
# 确认信息已全部拆出到 docs/handoff/，无内容仅存在 archive 中
diff PROJECT_HANDOFF.md PROJECT_HANDOFF.full-archive.md > /dev/null && echo "same - OK to remove archive" || echo "still differs - manually verify before removal"
git rm PROJECT_HANDOFF.full-archive.md
git commit -m "chore(docs): remove PROJECT_HANDOFF full archive backup (1-week retention elapsed)"
```

> ⚠️ 不要在本次任务中执行此步。若 diff 仍显示差异，先核对 `docs/handoff/decisions.md` 与 `docs/handoff/risks.md` 是否完整迁移了原 P.H. 的内容，再决定删除。

---

## 验证整体清单（必跑）

- [ ] `npm test` 全绿
- [ ] `PROJECT_HANDOFF.md` ≤ 100 行
- [ ] `README.md` ≤ 110 行
- [ ] `README_EN.md` ≤ 110 行
- [ ] `pages/README.md` ≤ 60 行
- [ ] `tests/README.md` ≤ 60 行
- [ ] `utils/README.md` ≤ 80 行
- [ ] `docs/DESIGN.md` ≤ 60 行
- [ ] 所有 `docs/handoff/modules/*.md` 文件存在且有内容
- [ ] 所有 markdown 文件只有 1 个 H1
- [ ] 无 TBD / TODO / 占位字样
- [ ] `docs/archive/微信小程序需求.md` 顶部有归档 banner
- [ ] `git log --oneline -24` 看到 24 个独立 commits

---

## Self-Review（已完成）

- ✅ **Spec 覆盖**：design spec 12 个章节全部映射到具体 task（目录结构 / INDEX 拆分 / README 分层 / DESIGN.md / 决策 / 风险 / 未来计划 / 验证）
- ✅ **Placeholder scan**：所有"需替换"占位都有明确的 view→edit 步骤（如 Task 10、Task 11 显式要求 Step 1 浏览代码再 Step 3 替换）
- ✅ **Type consistency**：所有文件路径、键名、commit 前缀与 spec 一致
- ✅ **DRY**：每个 task 都自带"跑测试"步骤，不依赖外部脚本
- ✅ **Frequent commits**：每 task 一个 commit，commit message 模板已给出
- ✅ **Code blocks**：所有文档内容使用完整 markdown 代码块粘贴；命令用 bash 代码块
- ✅ **YAGNI**：未创建任何 spec 未明确要求的文件
