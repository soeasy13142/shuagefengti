# 文档规范化整理 · 设计文档（Design Spec）

> **Status:** Draft — awaiting user approval
> **Date:** 2026-07-10
> **Scope:** Documentation reorganization only. No core code modifications.
> **Derived from:** User request "帮我整理一下本项目。把本项目规范化。早期开发太乱了。在不动核心代码的情况下，整理合并下文档。"

---

## 1. 目标

把 `/Users/charliepan/Downloads/my-miniapp` 当前混乱的文档体系规范化，让：

1. **新加入者（含 Claude）能在 30 秒内找到任何主题对应的文档**
2. **核心交接文档（PROJECT_HANDOFF.md）保持 ≤ 300 行**，只做 INDEX；详情外迁
3. **README 分层清楚**：根 README 是门面，子目录 README 只写自己
4. **核心代码、参考资源、git 历史 完全不动**

---

## 2. 范围

### ✅ IN SCOPE

- 创建、修改、删除、移动 Markdown 文档
- 重写 `PROJECT_HANDOFF.md`、`README.md`、`README_EN.md` 内容
- 新增 `docs/handoff/`、`docs/archive/`、`docs/DESIGN.md` 目录与文件
- 移动 `微信小程序需求.md` → `docs/archive/`
- 删除 `docs/README.md`、`docs/README_EN.md`（合并到根 README）

### ❌ OUT OF SCOPE

- 修改 `pages/`、`utils/`、`app.*`、`jest.config.js`、`package.json`、`__mocks__/`、`project.config.json`
- 修改 `test-questions.md`（刷题引擎示例输入数据）
- 修改 `design-methods/`、`design-previews/`、`.claude/skills/`（外部参考资料）
- 修改 `idea.md`、`TCP.pdf`（已 gitignore 的本地资源）
- 修改 `CLAUDE.md` 项目 Claude 指令（必要时反向同步约定）
- 修改 `docs/brainstorming/`、`docs/design/`、`docs/review/`、`docs/superpowers/{specs,plans}/`（历史归档保留）
- 重写 git 历史 / rebase / force push
- 在用户未明确要求时执行 `git push`

---

## 3. 目录终态结构

```text
my-miniapp/
├── CLAUDE.md                          ← 不动（项目 Claude 指令）
├── PROJECT_HANDOFF.md                 ← 大改：从 4241 行缩到 ≤300 行 INDEX
├── README.md                          ← 大改：根门面 ~150 行
├── README_EN.md                       ← 大改：同步英文版
├── 微信小程序需求.md                   ← 移动 → docs/archive/
├── idea.md                            ← 不动（gitignored）
├── test-questions.md                  ← 不动（业务数据）
│
├── docs/
│   ├── README.md                      ← 删除（并入根 README）
│   ├── README_EN.md                   ← 删除（并入根 README）
│   ├── DESIGN.md                      ← 新增：Claude Design 风格完整规范
│   │
│   ├── handoff/                       ← 新增：PROJECT_HANDOFF 拆分专题
│   │   ├── README.md                  ← 新增：目录导览
│   │   ├── architecture.md            ← §3、§5、§6、§10 拆分
│   │   ├── modules/                   ← §7 拆分（每个模块独立文件）
│   │   │   ├── README.md              ← 模块导览
│   │   │   ├── quiz.md                ← 刷题 + 题型 + 模式
│   │   │   ├── dashboard.md           ← 学习驾驶舱
│   │   │   ├── subnet-calc.md
│   │   │   ├── sort-viz.md
│   │   │   ├── tcp-viz.md
│   │   │   └── ds-viz.md
│   │   ├── data-structures.md         ← §8
│   │   ├── decisions.md               ← §9 + §18 + §19 + §20
│   │   ├── risks.md                   ← §11
│   │   └── future-plans.md            ← §12
│   │
│   ├── superpowers/                   ← 不动
│   │   ├── specs/2026-05-31-brushfengti-design.md
│   │   └── plans/2026-05-31-brushfengti.md
│   │
│   ├── brainstorming/                 ← 不动
│   │   └── 2026-06-13-new-features-brainstorm.md
│   ├── design/                        ← 不动
│   │   ├── 2026-06-13-ds-viz-improvements.md
│   │   └── 2026-06-13-homepage-redesign.md
│   ├── review/                        ← 不动
│   │   ├── 2026-06-13-code-review-checklist.md
│   │   └── 2026-06-15-full-project-review.md
│   │
│   └── archive/                       ← 新增：归档
│       ├── README.md                  ← 归档目录说明
│       └── 微信小程序需求.md          ← 从根目录移过来 + banner
│
├── pages/README.md / README_EN.md     ← 修订：增加 TCP/DS 模块
├── tests/README.md / README_EN.md     ← 微调
├── utils/README.md / README_EN.md     ← 微调
│
├── design-methods/                    ← 不动（参考资料）
├── design-previews/                   ← 不动（参考资料）
└── .claude/skills/                    ← 不动（参考资料）
```

---

## 4. PROJECT_HANDOFF.md 拆分映射

| 现状（§章节） | 拆分目标 |
|---|---|
| §1 一句话概述 | INDEX（顶部） |
| §2 当前开发进行到哪了 | INDEX |
| §3 项目整体思路 | `docs/handoff/architecture.md` |
| §4 需求文档位置 | INDEX（短指针） |
| §5 文件结构 | `docs/handoff/architecture.md` |
| §6 页面注册状态 | `docs/handoff/architecture.md` |
| §7.1 基础工程与测试 | `docs/handoff/architecture.md` |
| §7.2 工具函数 | `docs/handoff/modules/quiz.md`（工具函数部分） |
| §7.3 本地存储 | `docs/handoff/modules/quiz.md` |
| §7.4 Markdown 解析 | `docs/handoff/modules/quiz.md` |
| §7.5 示例题 | `docs/handoff/modules/quiz.md` |
| §7.6 首页 | `docs/handoff/modules/quiz.md`（首页属于刷题主链路） |
| §7.7 试卷列表与导入 | `docs/handoff/modules/quiz.md` |
| §7.8 导入预览 | `docs/handoff/modules/quiz.md` |
| §7.9 刷题页 | `docs/handoff/modules/quiz.md` |
| §7.10 结果页 | `docs/handoff/modules/quiz.md` |
| §7.11 答题记录 | `docs/handoff/modules/quiz.md` |
| §7.12 记录详情 | `docs/handoff/modules/quiz.md` |
| §7.13 错题本 | `docs/handoff/modules/quiz.md` |
| §7.14 排序可视化 | `docs/handoff/modules/sort-viz.md` |
| §7.15 学习驾驶舱 | `docs/handoff/modules/dashboard.md` |
| §7.16 子网计算器 | `docs/handoff/modules/subnet-calc.md` |
| §8 数据结构 | `docs/handoff/data-structures.md` |
| §9 已修复的关键问题 | `docs/handoff/decisions.md` |
| §10 测试状态 | `docs/handoff/architecture.md`（概要）+ 每个模块文件（细节） |
| §11 风险与注意点 | `docs/handoff/risks.md` |
| §12 下一步开发建议 | `docs/handoff/future-plans.md` |
| §13 skills 推荐 | **删除**（CLAUDE.md 已含） |
| §14 下次开场流程 | INDEX（精简 5 步列表） |
| §15 关键文件速查 | INDEX（精简版 + 指向专题） |
| §16 本次生成时实际核验过 | **删除**（一次性记录） |
| §17 30 秒恢复摘要 | INDEX（顶部） |
| §18 用户偏好 2026-06-09 | `docs/handoff/decisions.md` |
| §19-21 脑暴 + 下周计划 | `docs/handoff/decisions.md` + `future-plans.md` |

每份拆出的专题文档头部加指针：

```markdown
> 派生自 `PROJECT_HANDOFF.md` 的 §X。最新版本以此为准。
```

---

## 5. 新 PROJECT_HANDOFF.md 终态（≤ 300 行）

```text
# 刷个冯题 · 交接文档（INDEX）

> 最后更新：2026-07-10 · 文档规范化整理

## 1. 一句话概述
（≤ 80 字）

## 2. 30 秒恢复上下文
（从原 §17 提炼）

## 3. 当前进度
- 测试：见 `docs/handoff/architecture.md` 第 §测试状态 节（每次 commit 前必跑 `npm test` 验证）
- 未提交变更：见 `git status --short`
- 阻塞项：（如有）

## 4. 关键文件速查
（精简表格 + 指向专题详情）

## 5. 文档导航
- docs/handoff/architecture.md
- docs/handoff/modules/<module>.md
- docs/handoff/data-structures.md
- docs/handoff/decisions.md
- docs/handoff/risks.md
- docs/handoff/future-plans.md
- docs/DESIGN.md
- docs/superpowers/specs & plans/

## 6. 下次开场步骤
1. 读本文 §2
2. npm test && git status --short
3. 按需求读 docs/handoff/ 对应专题
4. 大功能 → superpowers:brainstorming → writing-plans
5. 修改后追加本文件
```

---

## 6. README 分层

| README | 角色 | 状态 | 体量 |
|---|---|---|---|
| `README.md` | 项目门面：背景 + 功能 + 快速开始 + 设计风格 + 文档导航 | 重写 | ~150 行 |
| `README_EN.md` | 英文同步版 | 重写 | ~150 行 |
| `docs/README.md` | — | **删除** | — |
| `docs/README_EN.md` | — | **删除** | — |
| `docs/handoff/README.md` | 新增：handoff 子目录导览 | 新写 | ~30 行 |
| `docs/DESIGN.md` | 新增：Claude Design 暖奶油画布完整规范 | 从 CLAUDE.md 提取 | ~80 行 |
| `pages/README.md` | pages 目录导览 | 修订（加 TCP/DS） | ~50 行 |
| `tests/README.md` | 测试说明 | 微调 | ~30 行 |
| `utils/README.md` | utils 目录导览 | 微调 | ~30 行 |

### 新 `README.md` 章节目录

```text
# 刷个冯题

[English](README_EN.md)

## 1. 项目介绍
- 一句话价值
- 目标用户（自己 + 朋友 + 未来运营）

## 2. 功能清单（7 大模块）
- 刷题（核心）
- 学习驾驶舱
- 子网计算器
- TCP 动画机
- 数据结构可视化
- 排序可视化
- （单词记忆 预留）

每个模块：2-3 行简介 + 链接到 docs/handoff/modules/

## 3. 设计风格
- 指向 docs/DESIGN.md
- 简述：暖奶油 + 珊瑚色 · Claude Design

## 4. 技术栈
- 微信小程序原生 · WXML/WXSS/JS
- 纯本地存储 · 无后端
- Jest 单元测试

## 5. 快速开始
- npm install
- npm test
- 微信开发者工具打开项目根目录
- 导入试题：test-questions.md

## 6. 文档导航
- PROJECT_HANDOFF.md（30 秒恢复上下文）
- docs/handoff/（架构、模块、数据结构、决策、风险、未来计划）
- docs/DESIGN.md（设计风格）
- docs/superpowers/specs/（原始设计）+ plans/（实施计划）
- docs/brainstorming、design、review（历史归档）

## 7. 仓库说明
- TCP.pdf / idea.md 不入 git
```

### README 关键修正

- **修复 "13 个页面" vs 实际清单不一致**：先核对 `app.json`（11 个）+ TCP/DS 模块是否存在（README 提到 TCP/DS 模块但未注册到 app.json）
- **修复完全没提 TCP / DS / Dashboard 模块的问题**
- **修复没指向 Claude Design 风格的问题**

---

## 7. docs/DESIGN.md 新增内容

```markdown
# 设计风格 · Claude Design 暖奶油画布

> 派生自 `CLAUDE.md` 的「设计风格约束」章节。
> CLAUDE.md 是项目指令，本文档是面向设计参考的实现规范。

## 1. 色彩 token
| 角色 | 色值 |
|---|---|
| 页面背景 | #faf9f5 |
| 卡片背景 | #efe9de |
| 主色（CTA） | #cc785c |
| 主色 Active | #a9583e |
| 标题/正文 | #141413 |
| 次要文字 | #6c6a64 |
| 深色表面 | #181715 |
| 深色文字 | #faf9f5 |

## 2. 字体
- 标题：Georgia 衬线
- 标题 weight：400
- 标题 letter-spacing：-3rpx
- 正文：系统默认无衬线

## 3. 卡片规范
- 圆角 24rpx
- 阴影：零（靠色块对比表达深度）

## 4. 适用场景
- 所有新建或重构的页面
- 例外：dashboard、subnet-calc 中二进制位可视化等有专门配色语义的组件

## 5. 不要做
- 不引入自定义字体文件
- 不用 box-shadow 做层次
- 不引入图标库
- 不用 emoji 当功能性图标
```

---

## 8. docs/handoff/decisions.md 内容来源

聚合自 PROJECT_HANDOFF §9、§18、§19、§20、§21：

```text
# 决策记录（Decisions）

> 本文件聚合所有架构 / 设计 / 产品方向的关键决策。
> 每条决策包含：日期 / 决策摘要 / 上下文 / 影响范围。

## 决策列表（按时间倒序）
- 2026-07-10 docs 结构重组（参见 DESIGN DOC 2026-07-10-docs-cleanup-design.md）
- 2026-06-13 增加 TCP 动画机与 DS 可视化
- 2026-06-09 学习驾驶舱 + 智能建议上线
- 2026-06-09 Claude Design 暖奶油画布风格定型（替代深色科技风）
- 2026-06-08 排序可视化模块上线
- 2026-06-08 删 answer 中 test-questions 文件不再使用的格式
- 2026-06-04 改用 tempImportData 解决 URL 超长
- ...（按 PROJECT_HANDOFF §9 一对一录入）

## 用户偏好（不变项）
- 目标用户：自己 + 朋友 + 未来长效运营产品
- 下一阶段偏好炫技功能
- 继续本地存储；后期转云
- 开发周期 ≈ 1 周
```

---

## 9. 风险与缓解

| 风险 | 缓解 |
|---|---|
| PROJECT_HANDOFF.md 拆分丢失信息 | 拆分前先做一份 `PROJECT_HANDOFF.full-archive.md` 作为最终备份（在 git 里），观察 1 周再决定是否真删 |
| README 与实际页面注册不一致 | 拆分前先 `cat app.json` 核对实际清单 |
| docs/archive/ 移动旧文档破坏 git blame | 用 `git mv` 而非直接删除，保留可追溯性 |
| docs/DESIGN.md 与 CLAUDE.md 双源不一致 | 决策记录里写明 `CLAUDE.md` 中"设计风格约束"指向 `docs/DESIGN.md` |
| 误改代码 | 全程只动 markdown 文档；任何对其他文件类型的操作前先 `AskUserQuestion` |
| git 历史被打乱 | 不 rebase，只用新的 commits 落地；删除操作改为 mv（用 `git mv`） |

---

## 10. 回退方案

每个阶段以独立 commit 落地：

```text
feat(docs): create docs/handoff/ structure
refactor(docs): split PROJECT_HANDOFF.md into INDEX + topics
docs: rewrite root README as project facade
docs: add docs/DESIGN.md
chore(docs): archive old requirement docs
chore(docs): remove redundant docs/README.md
```

回退方式：
- 整体回退：`git reset --hard HEAD~N`
- 单个 commit 回退：`git revert <commit>`
- 找回丢失内容：`git log --all --source --remotes --oneline | grep docs` 或 checkout 旧版 PROJECT_HANDOFF

---

## 11. 验证项（Mandatory Checklist）

每完成一组大动作后必须：

- [ ] `npm test` 全绿
- [ ] 变更文档总量行数从 4241 行（PROJECT_HANDOFF）减少到 ≤ 300 行
- [ ] 所有 `*.md` 顶部仅一个 H1
- [ ] `README.md`、`README_EN.md` ≤ 200 行
- [ ] 每个 `pages/tests/utils` 子目录的 README ≤ 60 行
- [ ] `git status --short` 只剩预期的新增/删除
- [ ] 没有 `TODO`、`TBD`、`占位` 字样散落在新文档中
- [ ] 所有指向专题文档的链接可达（无 404 错链）

---

## 12. 实施顺序（建议）

1. **`docs/superpowers/specs/`**：保存本 spec（已完成）
2. **`docs/handoff/` 创建**：先建好骨架（每文件头部 stub）
3. **`PROJECT_HANDOFF.full-archive.md` 备份**：先把原 HOFF 复制一份保留
4. **逐章拆 HOFF 内容到专题**：从 §3 开始向后，每个专题一次 commit
5. **重写 `PROJECT_HANDOFF.md` 为 INDEX**
6. **新增 `docs/DESIGN.md`**
7. **重写 `README.md`、`README_EN.md`**
8. **`git mv 微信小程序需求.md` → `docs/archive/`，加 banner**
9. **删除 `docs/README.md`、`docs/README_EN.md`**
10. **修订 `pages/README.md`**：增加 TCP/DS 模块说明
11. **修订 `tests/README.md`、`utils/README.md`**：补全指向专题文档
12. **每步后跑 `npm test` 验证**
13. **每个 step 一个独立 commit**

---

## 13. 设计完成确认

- [x] 用户已批准 4 个决策段（深度 / 拆分 / 分层 / 保留过期文件）
- [x] 用户已批准目录终态结构（A 段）
- [x] 用户已批准 PROJECT_HANDOFF 拆分映射（B 段）
- [x] 用户已批准 README 分层策略（C 段）
- [x] 用户已批准边界 / 风险 / 回退（D 段）
- [ ] 待用户审阅本文档
- [ ] 待调用 `superpowers:writing-plans` 编写实施计划
