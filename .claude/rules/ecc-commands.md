---
description: ECC 命令和 Agent 触发清单
---

# ECC 必用命令与自动触发清单

配套仓库：<https://github.com/affaan-m/ECC/blob/main/README.zh-CN.md>

## 强制自动触发（任何时候都要跑）

| 时机 | 命令 / Agent | 用途 |
|---|---|---|
| 任何代码改动完成 | `ecc:code-reviewer` | 代码审查（必修） |
| 新功能 / 修复 / 重构开始前 | `ecc:tdd-guide` | 强制 write-tests-first |
| 任何"完成"声明前 | `superpowers:verification-before-completion` | 端到端验证 |
| 复杂任务开始（见 D1） | `superpowers:writing-plans` | 落 plans 到 `docs/plans/` |
| 复杂任务方案探索 | `superpowers:brainstorming` | 创意发散 |
| 涉及 Git/PR 流程结束 | `code-review:code-review` 或 `/code-review` | PR 提交前 |

## 条件性触发

| 条件 | 命令 |
|---|---|
| 涉及第三方库 / API（即使认为知道） | `context7-mcp` |
| 构建 / `npm test` 报错 | `ecc:build-error-resolver` |
| 用户输入 / 认证 / 敏感数据 / 外部 API | `ecc:security-reviewer` |
| JS 文件改动 | `ecc:typescript-reviewer` |
| 死代码 / 重复 / 重构清理 | `ecc:refactor-cleaner` |
| 功能完成后文档落后 | `ecc:doc-updater` |
| 一次性配置 / hooks / 权限 | `update-config` 或 `fewer-permission-prompts` |

## 不主动使用（本项目不适用）

语言专项审查（python/go/java/rust 等）、多端编排、AgentShield 全量扫描、PM2/运维、continuous-learning、电商/金融/医疗等领域 agent。

## 速记别名

| 对话中直接说 | 等价命令 |
|---|---|
| "跑 code-reviewer" | `ecc:code-reviewer` |
| "用 TDD 写" | `ecc:tdd-guide` |
| "查文档 / 用 context7 查 X" | `context7-mcp` |
| "先 brainstorm" | `superpowers:brainstorming` |
| "先写 plans" | `superpowers:writing-plans` |
| "完成前 verify" | `superpowers:verification-before-completion` |
