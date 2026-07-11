# 全项目 Code Review 设计 Spec · 2026-07-11

> **设计阶段**：brainstorming → writing-plans（待进入）
> **目标用户**：项目 owner（自身 + 朋友 + 长效运营产品）
> **设计原则**：复用 06-13 清单、并行 fan-out、Low 自动修、Medium 及以上询问

---

## 1. 目标（Goal）

对 `/Users/charliepan/Downloads/my-miniapp` 项目做一次完整 code review，覆盖 **2026-06-15 全量审查之后的所有变更** + 当下存量代码，产出可执行、可与 06-15 报告并列对照的审查结论。

**关键输入**：
- 上次全量审查报告：`docs/review/2026-06-15-full-project-review.md`
- 审查清单：`docs/review/2026-06-13-code-review-checklist.md`
- 关键变更（2026-06-15 之后）：b9a543b var→const/let 全清零、sort-viz 抽 utils、TCP/DS 文档同步、docs cleanup

**关键输出**：
- `docs/review/2026-07-11-full-review.md` —— 单份完整审查报告
- Low 级别修复的代码 + 对应 commit
- Medium 及以上问题的 AskUserQuestion 决策记录
- `PROJECT_HANDOFF.md` §9 追加的变更记录

---

## 2. 范围（Scope）

### 2.1 包含（In Scope）

- 全量 `pages/`（13 个页面 / ~3000 行）
- 全量 `utils/`（14 个模块 / ~2800 行）
- `app.js`、`app.json`、`app.wxss`、`project.config.json`、`project.private.config.json`
- `tests/__mocks__/wx.js`
- 重点回归：2026-06-15 报告里**未修复**的发现
- 重点专项：2026-07-11 var→const/let 全清零 refactor 的回归

### 2.2 不包含（Out of Scope）

- 不动 `docs/`、`design-methods/`、`design-previews/`、`README*`（除追加变更记录）
- 不引入新依赖（不装 miniprogram-automator 等）
- 不重构现有架构（review 只报告 + Low 级别小修；Medium 及以上需用户批准）
- 不动历史 review 文档（`docs/review/2026-06-*`）
- 不评审 `node_modules/`、`miniprogram_npm/`

---

## 3. 审查维度（Review Dimensions）

| 编号 | 维度 | 来源 | 重点关注 |
|---|---|---|---|
| A | 安全（SEC） | 06-13 清单 SEC-01~18 | 新模块的文件读取、图数据加载 |
| B | 正确性（COR） | 06-13 清单 COR-01~29 | 06-15 未修项回归 + var 迁移后作用域/闭包/this 回归 |
| C | 性能（PERF） | 06-13 清单 PERF-01~08 | TCP 动画、DS 可视化、sort-viz 的 setData 频率 |
| D | **业务一致性（BUS）** | 新增 | 三模块数据联动、级联清理一致性、setData↔WXML 键名一致性、tool-registry ↔ app.json 一致性 |
| E | **i18n 兼容性（I18N）** | 新增 | 中文/英文硬编码、混合输入解析、格式化函数兼容、备案号硬编码位置 |
| F | 代码质量（QUAL） | 06-15 风格 | 命名、console 残留、`var` 遗漏、文件大小、重复代码、注释密度 |

---

## 4. 输出格式（Output Format）

**单份 Markdown 报告**：`docs/review/2026-07-11-full-review.md`

**结构**（与 06-15 报告对齐 + 新增 BUS / I18N / 回归对照 / var 专项）：

```text
# 全项目综合审查报告 · 2026-07-11

> 审查时间 / 范围 / 方式 / 测试状态 / 审查结论

## 一、安全审查结果
## 二、正确性与健壮性审查结果
## 三、性能审查结果
## 四、业务一致性审查结果（BUS）           ← 新维度
## 五、i18n 兼容性审查结果（I18N）          ← 新维度
## 六、测试覆盖缺口
## 七、代码质量审查
## 八、未修复问题回归对照（vs 2026-06-15）  ← 06-15 遗留项逐条标注
## 九、var→const/let 迁移专项回归           ← 2026-07-11 refactor 专项
## 十、审查结论
   - 统计表
   - 需修复项 / 建议修复项 / 代码质量优化项 三档清单
   - 审查结论勾选
```

**每条发现表格行格式**：
```
| 编号 | 严重级 | 文件:行号 | 问题 | 修复建议 | vs 06-15 状态 |
```

**附加产物**：
- `PROJECT_HANDOFF.md` §9 追加变更记录
- 章节末尾"是否需要建 follow-up plan 修复"小节

---

## 5. 执行流（Execution Flow）

```
Phase 0: 准备
  - 主 agent 读 PROJECT_HANDOFF.md / CLAUDE.md / 06-15 报告
  - 跑 npm test 取基线（12 suites / 236 tests）
  - git status --short 取待审快照

Phase 1: 并行 fan-out（Workflow）
  6 个 subagent 并行（各自用对应清单逐文件审）：
    - SEC（安全）
    - COR（正确性）
    - PERF（性能）
    - BUS（业务一致性）
    - I18N（i18n 兼容性）
    - QUAL（代码质量）

Phase 2: 主 agent 汇总
  - 合并 6 份发现
  - 去重（同文件:行号 + 同问题只保留最严重级）
  - 与 06-15 报告交叉对照，标注"新 / 已修 / 仍存 / 恶化"
  - 按 §4 模板填充报告

Phase 3: 交叉验证
  - 跑 npm test 全量，确认基线
  - 跑 grep 静态扫描（eval / innerHTML / console.log / 硬编码密钥）
  - 对 06-15 遗留项逐一 grep 验证当前状态

Phase 4: Low 级自动修
  - 主 agent 自动应用 Low 修复
  - 每个修复后跑 npm test
  - 修复列表追加到报告 §7
  - 每个修复一个 commit（commit message 前缀 `auto-fix(low):`）

Phase 5: Medium 及以上逐项询问
  - AskUserQuestion 逐条问（一次 ≤ 4 条合并）
  - 不擅自修改代码

Phase 6: 收尾
  - 追加 PROJECT_HANDOFF.md §9 变更记录
  - 本地 commit（按 Git 提交规范）
  - 等用户明确要求才 push
```

---

## 6. 风险与回退（Risk & Rollback）

| 风险 | 缓解 | 回退方案 |
|---|---|---|
| 并行 subagent 产生重复发现 | Phase 2 去重 | 重新汇总即可 |
| 并行 subagent 漏掉跨维度发现 | Phase 3 交叉验证 | 主 agent 补查单维度 |
| Low 自动修误改 | 每修一处跑 npm test；commit 前缀标注 | `git reset --hard HEAD~n` 回退 |
| spec / plan 不完整 | spec 自审 + 用户审 spec 双关 | 修订 spec 后重新走 writing-plans |
| 主对话 context 吃满 | 6 subagent 各自带工作集；主 agent 只读发现 JSON | 拆分报告落到多轮 |

**模型分配**（按 performance.md）：
- 主 agent（汇总 / 写报告 / Low 修）：Sonnet
- 6 subagent（并行 fan-out）：Sonnet（每个维度工作量适中）
- Haiku 仅在最后静态扫描等轻活使用

---

## 7. 完成判定（Done Criteria）

- [ ] 报告 `docs/review/2026-07-11-full-review.md` 落地
- [ ] 与 06-15 报告对齐结构 + 新增 BUS / I18N 两章
- [ ] 6 维度全部产出发现（哪怕"无发现"也要明确写"通过"）
- [ ] 06-15 遗留项逐条对照标注
- [ ] var→const 迁移专项回归完成
- [ ] `npm test` 全绿（12 suites / 236 tests）
- [ ] 静态扫描通过（eval / innerHTML / 硬编码密钥 / console.log 残留）
- [ ] Low 修复全部落地（每个修复带 commit 引用）
- [ ] Medium 及以上问题逐条 AskUserQuestion 处理完毕
- [ ] `PROJECT_HANDOFF.md` §9 追加变更记录

**不做**：
- 不重做项目级重构（除非用户明确要求）
- 不动 docs 体系（除追加变更记录）
- 不评估产品方向 / UI 设计
- 不引入新依赖

---

## 8. 待用户确认项（Open Questions）

无 —— 5 项关键决策（范围 / 维度 / 格式 / 处理 / 执行模式）均已在 brainstorming 阶段确认。

---

## 9. 与既有体系的对接（Integration）

- **CLAUDE.md D1**：本文满足"复杂任务先写 plans"要求
- **CLAUDE.md D2**：Medium 及以上问题逐条 AskUserQuestion，不擅做决策
- **CLAUDE.md D3**：完成后追加 PROJECT_HANDOFF.md §9
- **CLAUDE.md D5**：npm test 全绿 + verification-before-completion
- **CLAUDE.md X1**：不替用户做决策；Low 修复是用户在 brainstorming 时已批准的子集
- **CLAUDE.md X5**：不主动 push；push 前必须用户明确要求
- **ECC 必用命令**：`ecc:code-reviewer` 不直接调用（本次 review 已经是 code review 本身），但报告产出后建议同步跑 `ecc:refactor-cleaner` 做死代码复核