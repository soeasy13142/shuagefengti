# Session Handoff — 刷个冯题

**Status:** ACTIVE
**Working directory:** `/Users/charliepan/Downloads/my-miniapp`
**Updated:** 2026-07-21
**变更日志：**[`docs/changelog.md`](/Users/charliepan/Downloads/my-miniapp/docs/changelog.md)

---

## Goal

微信小程序学习工具箱 — 刷题引擎 + 计算机科学可视化工具集。
纯前端、纯本地存储、无后端、无第三方库。

---

## Done

- **刷题引擎闭环** — Markdown 导入、五题型（单选/多选/判断/填空/简答）、练习/考试模式、答题记录、错题本、历史统计
- **已上线 12 个工具**（`utils/tool-registry.js`）：
  - 驾驶舱 `dashboard` · 子网计算器 `subnet-calc` · TCP 动画机 `tcp-viz`
  - 数据结构可视化 `ds-viz` · 排序可视化 `sort-viz` · CPU 调度 `cpu-sched`
  - SHA-256 演示 `sha256-viz` · DNS 解析 `dns-viz` · B+ 树 `bplus-viz`
  - Nginx 生成器 `nginx-gen` · 死锁模拟器 `deadlock` · **磁盘调度** `disk-sched`
  - **内存分页** `mem-paging`
- **首页重设计** — 工具箱优先布局 · 分类标签栏 · 2 列网格 · 简洁/详细双模式
- **设计系统** — Claude Design 暖奶油画布 · intro-modal 向导式分步组件 · 底部固定底栏
- **工程规范** — var→const/let 清零 · 纯函数 + 不可变 · TDD（47 suites / 748 tests 全绿）

---

## Current State

| | |
|---|---|
| **Working** | 全部 12 个工具 + 刷题主链路。`npm test` 748 tests / 47 suites 全绿 |
| **Broken** | 无已知问题 |
| **Blocked** | 无 |
| **待上线** | 12 个已设计未实现（`tool-registry.js` 中 `available: false`）：TLS/AES/RSA/DH/密码工具箱/HTTP 解析/IP 分片/NAT/磁盘调度/同步互斥/编译原理 4 个 |
| **分包** | 10 个工具页已移入 `package-tools/` 分包，首包从 20 页降到 10 页 |
| **Storage** | 6 个页面已改为异步读取 + loading-skeleton 骨架屏 |
| **require** | 3 个可视化页面（ds-viz, deadlock, bplus-viz）改为动态 require |

---

## Key Decisions

| 维度 | 决策 |
|---|---|
| **设计** | Claude Design 暖奶油画布（`#faf9f5` / `#efe9de` / `#cc785c`），零阴影 |
| **架构** | 纯函数 + 不可变 · 纯 WXML/WXSS 可视化 · 无后端/无第三方库 |
| **测试** | Jest + TDD · 覆盖率 ≥ 80% |
| **调试** | wechat-devtools MCP 服务器（miniprogram-automator） |
| **Files** | 多文件小模块（200-400 行） · 按功能组织 |

---

## Quick Start

```bash
cd /Users/charliepan/Downloads/my-miniapp
npm test                        # 跑全量测试
git status --short              # 检查未提交变更
```

### 新会话开场

1. 读本文（30 秒恢复上下文）
2. `npm test && git status --short`
3. 按需求读 `docs/handoff/` 对应专题
4. 大功能 → 先写 `docs/plans/` 等用户批准
5. 写代码 → 每步 commit → 跑测试 → 审查 → 更新 handoff

详情见 [CLAUDE.md](./CLAUDE.md) 完整开发流程。

---

## Next Step

按用户需求从 tool-registry 中选择下一工具上线（12 个待开发）。

---

## References

| 用途 | 位置 |
|---|---|
| **交接索引** | `PROJECT_HANDOFF.md`（根目录，精简索引） |
| **变更记录** | `docs/changelog.md` |
| **模块文档** | `docs/handoff/modules/<name>.md` |
| **设计规范** | `docs/DESIGN.md` |
| **决策记录** | `docs/handoff/decisions.md` |
| **架构文档** | `docs/handoff/architecture.md` |
