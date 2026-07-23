# Session Handoff — 刷个冯题

**Status:** ACTIVE
**Working directory:** `/Users/charliepan/Downloads/my-miniapp`
**Updated:** 2026-07-22
**变更日志：**[`docs/changelog.md`](/Users/charliepan/Downloads/my-miniapp/docs/changelog.md)

---

## Goal

微信小程序学习工具箱 — 刷题引擎 + 计算机科学可视化工具集。
纯前端、纯本地存储、无后端、无第三方库。

---

## Done

- **刷题引擎闭环** — Markdown 导入、五题型（单选/多选/判断/填空/简答）、练习/考试模式、答题记录、错题本、历史统计
- **已上线 25 个工具**（`utils/tool-registry.js`），测试 173 suites / 2719 tests 全绿
- **首页精选改造** — 默认只展示 7 个精选工具（tcp-viz/nginx-gen/cpu-sched/deadlock/dh-viz/ds-viz/ast-builder），覆盖 5 个分类，保留分类标签和「查看全部」入口
- **设计系统** — Claude Design 暖奶油画布 · 零阴影
- **工程规范** — var→const/let 清零 · 纯函数 + 不可变 · TDD（173 suites / 2719 tests 全绿）

### 使用说明弹窗系统（分支：feature/usage-instructions）

10 个冷门/偏难工具已加上差异化使用说明，每种交互模式不同：

| 模式 | 组件 | 工具 |
|------|------|------|
| 底部抽屉面板 | `tool-help-panel`（已有） | deadlock（原有）、mem-paging（新增） |
| 分步引导弹窗 | `intro-modal`（已有） | rsa-calc、regex-dfa |
| 浮动问号气泡 | `quick-tip-bubble`（新建） | bplus-viz、disk-sched |
| 内联折叠面板 | `inline-collapse`（新建） | sha256-viz、ll1-parser |
| 场景内嵌标注 | 页面内嵌（定制） | dh-viz（Alice/Bob ⓘ 标注） |
| 侧边滑入面板 | 页面内嵌（定制） | aes-viz（右侧滑入面板） |
| 首次覆盖引导 | 页面内嵌（定制） | ip-fragment（首次访问弹窗） |

### 2026-07-23 intro-modal 重设计

- **问题**：intro-modal 字体过小（工具名 16rpx、正文 14rpx）、排版平铺无层次、信息区块堆叠难读。
- **改动**：纯 WXML+WXSS 重写，不改 JS，不涉及调用方修改。
  - 字号整体提升 1.5-2x：工具名 36rpx Georgia、正文/列表 26rpx、标题 22rpx、最小字号 20rpx
  - 引入卡片化布局：每块信息（核心价值/功能/前置知识/适合场景）渲染为独立 info-card，暖白底色 #faf9f5，左侧 4rpx #cc785c 色条
  - 头部区新增标签 chips：难度星级 + 工具 tags 以圆角 badge 展示
  - 头部区与底部按钮区不参与滚动
  - 无 emoji，纯排版语言区分区块
- **文件**：`components/intro-modal/intro-modal.wxml` + `intro-modal.wxss`
- **测试**：996 tests 全绿，IDE 编译无错
- **Spec**：`docs/superpowers/specs/2026-07-23-intro-modal-redesign.md`
- **Plan**：`docs/superpowers/plans/2026-07-23-intro-modal-redesign.md`

---

## Current State

| | |
|---|---|
| **Working** | 全部 25 个工具 + 刷题主链路。`npm test` 62 suites / 996 tests 全绿 |
| **Broken** | 无已知问题 |
| **Blocked** | 无 |
| **分支** | `feature/usage-instructions` — 差异化使用说明弹窗开发中，master 已同步首页精选改造 |
| **待上线** | 已全部上线。25/25 工具 `available: true` |
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

- **新组件：inline-collapse** — 页面内联折叠面板，用于展开/收起说明内容。注册在 `app.json` usingComponents，已在 sha256-viz 和 ll1-parser 页面集成。

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

### 2026-07-22 首页「全部」视图卡片响应模式切换

- **问题**：首页「全部」视图的 `featured-card` 模板完全忽略 `cardMode` 变量，点击简洁/详细切换胶囊按钮仅按钮样式变化，卡片内容无响应，体验反人类。
- **根因**：`featured-card` 未添加任何 `wx:if="{{cardMode === 'detail'}}"` 条件渲染，而「分类」视图的 `tool-card` 已正确响应。
- **修复**：在 `featured-card` 中按 `cardMode` 切换 tagline 截断/非截断版本，详细模式下额外显示 tags 和难度文字标签。新增 WXSS 类 `.fc-tagline-detail` / `.fc-meta-row` / `.fc-tags-inline` / `.fc-diff-label`。

---

## Next Step

按用户需求从 tool-registry 中选择下一工具上线（9 个待开发）。

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

### 2026-07-22 新增 D9: Karpathy Guidelines 按需启用

- **新增** CLAUDE.md D9 规则 — 大型任务（specs/plans/superpowers 全流程/大型 code review）必须调用 `andrej-karpathy-skills:karpathy-guidelines`；日常琐碎修改禁止触发
- **背景**：安装了 karpathy-skills 插件，用户要求按任务粒度条件性启用
- **触发方式**：Claude 自行辨别任务大小，大型任务自动调用 Skill 加载；不确定时回退 D2 🔴 必问原则
