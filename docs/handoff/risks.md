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

## r.11 TCP 模块与 DS 模块暂无测试覆盖

`utils/tcp-states.js` / `utils/bst.js` / `utils/graph.js` / `utils/hash-table.js` 是纯函数模块，理论上可测，但当前 Jest 配置只覆盖到 `tests/{pages,utils}/` 中的现有测试。新增测试路径建议见 `future-plans.md`。
