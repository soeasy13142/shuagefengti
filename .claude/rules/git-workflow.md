---
description: Git 提交规范、分支策略、commit 纪律
---

# Git 工作流

## 总原则

**本地可以密，远程必须整**。分支上自由 commit，push 前整理合并。

## 提交纪律（🚨 关键红线）

### 执行 plans 时的 commit 纪律

**每完成 plan 中的一个步骤 → 立即 `git commit`**，不得攒到全部做完再提交。

原因：长周期 plan 可能因会话截断、无 checkpoint 回退、临时切换任务而导致改动丢失。

做法：
- Plan 步骤拆解中，每个步骤的收尾动作必须是 `git commit`
- 提交信息用 Conventional Commits 类型（`feat:` / `fix:` / `refactor:` / `test:` / `docs:` / `chore:`）
- 分支上 commit 不受 X5 约束，无需等用户许可
- 后续步骤完成后可 `git rebase -i` 整理合并

示例：
```
### Step 1: 实现核心排序算法
1. 写测试（RED）
2. 实现算法使其通过（GREEN）
3. 重构（IMPROVE）
4. ✅ git commit: `feat: 实现优先级调度排序算法`
```

### 本地 commit
- 频率尽量高：每个 RED→GREEN 转换、小步重构都可以 commit
- 每个 commit 单一关注点，用 Conventional Commits
- ✅ `feat: 实现 Markdown 解析器支持三级标题嵌套` | ❌ `update`、`tmp`

## 分支策略

### 原则
多文件改动 → **必须从 master 开分支**。可直接在 master 提交的例外：
- 单文件 ≤10 行 / typo / 纯文档或配置变更 / 纯测试代码添加

### 命名：`<type>/<kebab-case-description>`
- `feature/` `fix/` `refactor/` `docs/` `test/`

### 生命周期
1. 从最新 master 开分支
2. 在分支上自由 commit（不受 X5 约束）
3. 合入准备：`npm test` 全绿 → `git rebase -i master` 整理 commit → 同步 PROJECT_HANDOFF.md
4. 合并：切回 master → `git merge --no-ff` → 删分支
5. 推送（需用户明确要求）

## 推送规范

- 一次 push = 一个完整逻辑单元，1 天 1-3 次
- 推送前自查：
  ```
  □ git log origin/<branch>..HEAD         —— 看清待推 commits
  □ 必要时 git rebase -i origin/<branch>  —— squash / 拆分
  □ npm test                              —— 全绿
  □ PROJECT_HANDOFF.md                    —— 同步新约定
  □ git push -u                           —— 仅在用户要求时
  ```
- 整理原则：WIP commits → squash 成有意义的一个；调试/实验痕迹必须消失
