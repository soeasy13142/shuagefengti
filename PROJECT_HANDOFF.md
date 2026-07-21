# 刷个冯题 · 交接文档（INDEX）

> 最后更新：2026-07-21 · 使用说明弹窗重设计（向导式分步）
> 完整备份见 `docs/archive/PROJECT_HANDOFF.full-archive.md`（已归档；保留 ≥ 1 周承诺已于 2026-07-11 转入 docs/archive/）。
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
算法：utils/bst.js / utils/graph.js / utils/hash-table.js
测试命令：npm test
模块入口：根 README.md → docs/handoff/modules/<module>.md
```

## 3. 新能力：微信开发者工具调试

项目配置了 `wechat-devtools` MCP 服务器，Claude 可以直接通过 miniprogram-automator 实时连接开发者工具进行调试：
- 导航页面验证编译错误、读取控制台日志、获取页面数据、调用页面方法等
- 详见 `CLAUDE.md` 中「微信开发者工具调试（MCP 服务器）」章节
- MCP 服务脚本：`scripts/devtools-mcp.mjs`
- 前置条件：服务端口开启 + 项目在开发者工具中打开

## 4. 当前进度

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
| 测试配置 | `jest.config.js`、`tests/__mocks__/wx.js` |

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
├─ docs/superpowers/specs/2026-05-31-brushfengti-design.md   原始设计
├─ docs/plans/                          项目级实施计划目录（含 2026-05-31 原始计划）
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

## 8. 最近重大变更（变更记录）

### 2026-07-21 · CLAUDE.md 新增 D8：默认用 SubAgent，不问

**变更内容**

- CLAUDE.md ✅ 必做 新增 **D8**：「默认用 SubAgent，不问」
- 凡能派 SubAgent 处理的（subagent-usage.md 中列出的场景），直接派，不询问用户

**理由**

- 减少不必要的来回确认，提升开发效率
- 主会话保持轻量，SubAgent 后台执行

**涉及文件**
| 文件 | 变更 |
|------|------|
| `CLAUDE.md` | ✅ 必做新增 D8 |

---

### 2026-07-21 · 使用说明弹窗重设计（向导式分步）

**变更内容**

- `intro-modal` 组件从纯文字弹窗改为 3 步向导式分步引导：
  - 步骤 1 📖 概述 — 工具定位说明
  - 步骤 2 🔧 操作指南 — RAG + 银行家算法操作要点
  - 步骤 3 📊 结果解读 — 安全/不安全/步骤追踪怎么看
- 轮播式内容切换：水平滑动过渡动画（`transform: translateX()`）
- 底部圆点进度指示 `● ○ ○` + `第 N/3 步` 计数
- 双按钮导航：第 1 步「上一步」置灰、第 3 步「下一步」变为「开始使用 ✓」
- 标题/图标/内容卡片分层布局，告别纯文字 `━━` 分隔线

**涉及文件**

| 文件 | 变更 |
|------|------|
| `components/intro-modal/intro-modal.js` | property `introContent` 从 String 改为 Array；新增 currentStep/slideClass/totalSteps data；新增 onPrev/onNext/\_goToStep 方法 |
| `components/intro-modal/intro-modal.wxml` | 改为分步布局：图标 → 标题 → 内容轮播 → 进度点 → 底部导航 |
| `components/intro-modal/intro-modal.wxss` | 全量重写，新增轮播/进度点/导航按钮/动画等样式 |
| `pages/deadlock/deadlock.js` | `DEADLOCK_INTRO` → `DEADLOCK_STEPS` 对象数组；introContent 默认值 `''` → `[]` |

**理由**

- 原有纯文字弹窗（`━━` 分隔线 + 全文堆叠）看起来不正式
- 向导式分步参考成熟 onboarding 模式：一次只看一段，减少认知负担
- 类型化数据（数组+对象）为后续其他工具复用组件打下基础

**验证**

- `npm test` 705 全绿，44 suites 通过
- spec: `docs/superpowers/specs/2026-07-21-intro-modal-redesign.md`
- commit: `4c909ac`

### 2026-07-21 · 死锁模拟器帮助按钮改为底部固定栏

**变更内容**

- 移除右上角 `ℹ︎` 浮动圆形按钮（`.info-btn`）
- 新增底部固定栏 `? 使用说明`（88rpx，`#efe9de` 底色，`2rpx #ddd7cc` 顶部分割线）
- 将帮助入口从浮动位置改为页面底部边界，视觉上融入页面结构而非覆盖在内容上

**涉及文件**

| 文件 | 变更 |
|------|------|
| `pages/deadlock/deadlock.wxml` | 删除 info-btn 块，新增 .bottom-help-bar |
| `pages/deadlock/deadlock.wxss` | 删除 info-btn/info-btn-icon 样式，新增 bottom-help-bar 系列样式，.page padding-bottom 调整为 88rpx |

**理由**

- 右上角 `ℹ︎` 按钮视觉突兀，像后贴的补丁
- 底部固定栏参考 iOS Settings / macOS 偏好设置的设计模式，帮助入口与页面结构融为一体
- 底栏固定在页面底部，拇指操作更自然（vs 右上角需要手指上移）

**验证**

- `npm test` 705 全绿，44 suites 通过
- spec: `docs/superpowers/specs/2026-07-21-deadlock-help-button-redesign.md`
- commit: `c3e00c9`
- 不主动 `git push`

### 2026-07-19 · 合并 feature/card-redesign → master（首页/工具大全页卡片 tagline/tags/difficulty 展示 + 新样式）合并入 `master`
- `feature/tool-intro-modal` 分支保留不动，作为另一版设计方案

### 2026-07-19 · CPU 进程调度可视化上线

**变更内容**

- 新增 `pages/cpu-sched/` 页面（4 文件：json/wxml/wxss/js）
- 新增 3 个 utils 纯函数模块：`process.js` / `scheduling.js`（4 算法）/ `scheduling-metrics.js`
- 新增 3 个测试文件（共 43 个测试：process 16 + scheduling 21 + metrics 6）
- `utils/tool-registry.js` 把 `cpu-sched.available` 改为 `true`，补齐 tagline/tags/difficulty/intro 元数据
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/cpu-sched.md` 模块文档

**理由**

- 承接 `tool-registry.js` 中 OS 模块的第一个占位
- 4 种调度算法 + 甘特图 + 4 指标 vs FCFS 对比，覆盖冯·诺依曼/OS 教学核心
- 纯函数 + Jest 全测，与 TCP-viz / DNS-viz 一致风格

**影响**

- spec: `docs/superpowers/specs/2026-07-12-cpu-scheduling-design.md`
- plan: `docs/plans/2026-07-12-cpu-scheduling.md`
- `npm test` 全绿（639 tests, 40 suites）

### 2026-07-12 · SHA-256 演示上线

**变更内容**

- 新增 `pages/sha256-viz/` 页面（4 文件）
- 新增 3 个 utils 纯函数模块：`sha256.js` / `sha256-trace.js` / `sha256-avalanche.js`
- 新增 3 个测试文件（共 25 个测试，覆盖 FIPS 180-4 附录 B 已知向量）
- `utils/tool-registry.js` 把 `sha256-viz.available` 改为 `true`
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/sha256-viz.md` 模块文档

**理由**

- 承接 `tool-registry.js` 中密码学分类的占位（`sha256-viz`）
- 完整 64 轮 trace + 雪崩效应可视化，参考 TCP-viz 风格
- 纯前端、纯 JS 实现（无 BigInt，32-bit 无符号算术），无网络请求

**影响**

- spec: `docs/superpowers/specs/2026-07-12-sha256-design.md`
- plan: `docs/plans/2026-07-12-sha256.md`
- **修复 K[63] 常量错误**：原值为 0xC6719F08，正确值为 0xC67178F2（错位一个十六进制位）
- `npm test` 全绿（596 tests, 37 suites）

### 2026-07-12 · 首页重设计——工具箱优先

**变更内容**

- 首页定位改为「工具箱优先」：紧凑品牌头 + 分类标签栏 + 2 列大网格卡片
- 去掉 Hero 大标题区、学习概览统计卡片、底部快捷入口
- 顶部模块：小号衬线品牌名「刷个冯题」+ 内联「开始刷题」按钮 + 答题记录/错题本链接
- 「全部」视图：每分类最多 4 个可用工具 + 2 个精选预告（半透明）；底部「查看全部 N 个工具 →」链接
- 单一分类视图：可用工具 + 即将上线工具两组展示
- 新增 `pages/tools-all/tools-all` 二级页面，全量展示 24 个工具
- 保留原入场动画体系（fadeSlideIn 0.4s / fadeSlideUp 0.5s）
- 所有样式按 Claude Design 暖奶油画布规范

**涉及文件**

- 修改：`pages/index/index.js`、`pages/index/index.wxml`、`pages/index/index.wxss`、`app.json`
- 新增：`pages/tools-all/tools-all.js`、`.wxml`、`.wxss`、`.json`
- 新增：`tests/pages/index.test.js`

**不改变**

- 刷题流程、tool-registry 数据、存储层、app.json 其余配置

参见：
- spec: `docs/superpowers/specs/2026-07-12-homepage-redesign.md`
- plan: `docs/plans/2026-07-12-homepage-redesign.md`

### 2026-07-19 · 首页卡片简化（双模式切换）

**变更内容**

- 首页卡片简化为两档可切换模式：
  - **简洁模式（默认）**：仅工具名称 + tagline，无 tags/难度/CTA
  - **详细模式**：名称 + tagline + 纯文字 tags + 难度星级
- 分类标签栏右侧添加「简洁·详细」文字切换开关
- 偏好通过 `wx.setStorageSync('cardDisplayMode')` 持久化
- `pages/tools-all/tools-all` 固定为详细模式，无切换开关
- 去掉所有 chip 样式（`border` + `background`），tags 改为纯文字
- 去掉 CTA "进入 →"（整卡可点）
- 统一卡片内边距为 `24rpx`

**涉及文件**
- 修改：`pages/index/index.js`、`pages/index/index.wxml`、`pages/index/index.wxss`
- 修改：`pages/tools-all/tools-all.wxml`、`pages/tools-all/tools-all.wxss`

**修复**
- Tools-all 页 `wx:else` 条件修复：改用 `tool.available` 判断而非元数据是否存在

### 2026-07-19 · 双模式描述差异化 + tagline Humanize

**变更内容**
- 简洁模式 tagline 全部 Humanize：剪短、去 AI 味（促销收尾/夸大/填充词）
- 新增 `taglineDetail` 字段（完整的描述句），仅详细模式使用
- 首页详细模式改用 `taglineDetail`，简洁模式保持 `tagline`
- `pages/tools-all/tools-all` 固定使用 `taglineDetail`
- 新增 `.tool-tagline-detail` 样式，移除 `-webkit-line-clamp: 2` 防止长文截断

**涉及文件**
- 修改：`utils/tool-registry.js`（7 条 tagline humanize + 7 条 taglineDetail 新增）
- 修改：`pages/index/index.wxml`、`pages/index/index.wxss`
- 修改：`pages/tools-all/tools-all.wxml`、`pages/tools-all/tools-all.wxss`

**不改变**
- `utils/tool-registry.js` 数据模型、入场动画系统、工具详情页

参见：
- spec: `docs/superpowers/specs/2026-07-19-card-simplification-design.md`
- plan: `docs/superpowers/plans/2026-07-19-card-simplification.md`

### 2026-07-19 · 17 个未上线工具 specs 全部补齐

**变更内容**

- 利用 `superpowers:brainstorming` + 4 个并行 subagent，为 `tool-registry.js` 中所有 `available: false` 的工具补齐 design spec
- 16 份新 spec + 1 份已有 spec（cpu-sched，2026-07-12 脑暴产出）引用确认
- 按分类并行产出：

| 分类 | 工具 | spec |
|---|---|---|
| 计算机网络 | TLS / HTTP 解析 / IP 分片 / NAT | `2026-07-19-{tls-viz,http-parser,ip-fragment,nat-viz}-design.md` |
| 操作系统 | 内存分页 / 死锁 / 磁盘调度 / 同步互斥 | `2026-07-19-{mem-paging,deadlock,disk-sched,sync-viz}-design.md` |
| 密码学 | RSA / AES / DH / 密码工具箱 | `2026-07-19-{rsa-calc,aes-viz,dh-viz,crypto-tools}-design.md` |
| 编译原理 | Regex→DFA / LL(1) / 词法分析 / AST | `2026-07-19-{regex-dfa,ll1-parser,lexer-viz,ast-builder}-design.md` |

**影响**

- 当前 tool-registry 中 24 个工具全部有 design spec（8 已上线 + 16 新 spec）
- 每份 spec 含：目标/范围、文件清单、核心交互、数据模型、错误处理、测试方案
- 风格统一：Claude Design 暖奶油画布 / 纯函数优先 / WXSS transition 动画

参见：
- 全部 spec 位于 `docs/superpowers/specs/2026-07-19-*.md`

### 2026-07-21 · Nginx 最小配置生成器上线

**变更内容**
- 新增 `pages/nginx-gen/` 页面（4 文件）
- 新增 `utils/nginx-generator.js` 纯函数模块（generateConfig + validateInputs）
- 新增 2 个测试文件（generator 单元 + 页面集成）
- `utils/tool-registry.js` 在 network 分类下新增 `nginx-gen`（available: true, featured: true）
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/nginx-gen.md` 模块文档

**功能**
- 3 段折叠式表单：必填→常用→高级
- 支持 HTTPS 站点 / HTTP 站点 / 反向代理 / HTTP→HTTPS 跳转
- 条件输出 SSL / root / proxy / redirect / catch-all 各区块
- Mozilla Intermediate SSL 默认配置 + OCSP / HSTS / 安全头
- 一键复制到剪贴板 + 部署检查清单

### 2026-07-12 · B+ 树可视化上线

**变更内容**

- 新增 `pages/bplus-viz/` 页面（4 文件）
- 新增 3 个 utils 纯函数模块：`bplus-node.js` / `bplus-split.js` / `bplus-tree.js`
- 新增 3 个测试文件（共 ~49 个测试）
- `utils/tool-registry.js` 在 algo 分类下新增 `bplus-viz`（available: true，order: 3）
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/bplus-viz.md` 模块文档

**理由**

- 数据库 / 数据结构教学需求：B+ 树是数据库索引的核心
- 与 `ds-viz` (BST) 互补，覆盖两类经典树形结构
- Convention A 提升规则（提升右叶首 key）匹配大多数数据库教材

**影响**

- spec: `docs/superpowers/specs/2026-07-12-bplus-tree-design.md`
- plan: `docs/plans/2026-07-12-bplus-tree.md`
- `npm test` 全绿

### 2026-07-12 · DNS 解析可视化上线

**变更内容**

- 新增 `pages/dns-viz/` 页面（4 文件）
- 新增 3 个 utils 纯函数模块：`dns-data.js` / `dns-cache.js` / `dns-resolver.js`
- 新增 3 个测试文件（共 ~24 个测试）
- `utils/tool-registry.js` 把 `dns-viz.available` 改为 `true`
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/dns-viz.md` 模块文档

**理由**

- 承接 `tool-registry.js` 中网络协议族的占位
- 完整递归 + 缓存 + CNAME 链 3 场景，参考 TCP-viz 风格
- 纯前端 + 内置 DNS 数据，无网络请求

**影响**

- spec: `docs/superpowers/specs/2026-07-12-dns-resolver-design.md`
- plan: `docs/plans/2026-07-12-dns-resolver.md`
- baseline = `31d7f97`（specs commit）；实施 commit 数 = 7（T1: e3ae45b+96147b7 / T2: 2caaa1d / T3: 949e8b5 / T4: 35c3d57+1cb298e / T5: 2df813a — data + JSDoc + cache + resolver + page + page-fix + registry）
- `npm test` 全绿

### 2026-07-12 · 4 个 lead tool 脑暴 + specs + plans（DNS · CPU 调度 · SHA-256 · B+ 树）

**变更内容**

- 走完 superpowers:brainstorming → superpowers:writing-plans 全流程
- 选定 4 个 lead tool 深入设计 + 实施：
  1. **DNS 解析可视化**（`pages/dns-viz/`）：完整递归链 + LRU 缓存 + CNAME 链
  2. **进程调度可视化**（`pages/cpu-sched/`）：FCFS / SJF / RR / MFQ 4 算法 + 甘特图 + 4 指标
  3. **SHA-256 演示**（`pages/sha256-viz/`）：完整 64 轮 trace + 雪崩效应
  4. **B+ 树可视化**（`pages/bplus-viz/`）：阶数可调 + 插入 / 查询 / 范围查询
- 4 份 spec 落 `docs/superpowers/specs/2026-07-12-*.md`（commit `31d7f97`）
- 4 份 plan 落 `docs/plans/2026-07-12-*.md`：
  - DNS plan (1534 行) — commit `4f41935`
  - CPU 调度 plan (2210 行) + SHA-256 plan (1791 行) — commit `d527074`
  - B+ 树 plan (2218 行) — commit `00c5db2`
- 3 份 plan 由 3 个并行 subagent 同时撰写，单 agent 平均 ~3 分钟完成

**理由**

- 用户主动开启脑暴流程（"利用superpowers来脑暴下可以增添的设计"），且主题不限
- 4 个 lead tool 选取平衡了「低风险扩展已有占位」与「全新方向探索」
- 其余 24 个 tool-registry 占位（TLS / HTTP / 内存分页 / 死锁 / 磁盘调度 / 同步互斥 / RSA / AES / DH / 密码工具箱 / 编译原理 4 个 / NAT / IP 分片等）继续作为 P7+ backlog

**影响**

- 4 个 lead tool 全部走「spec → plan → TDD 实施 → code-review → commit」标准流程
- 4 份 plan 全部落地，共 **15 task**（DNS 6 / CPU 7 / SHA-256 6 / B+ 6），随时可启动 superpowers:subagent-driven-development
- baseline spec commit = `31d7f97`；plan commits = `4f41935` + `d527074` + `00c5db2`
- 4 份 plan 均通过 grep 自检：无 TODO / TBD / FIXME / "similar to Task" 占位；无 `var ` 顶层声明
- 不主动 `git push`：等用户决定

参见：
- 4 份 spec：`docs/superpowers/specs/2026-07-12-{dns-resolver,cpu-scheduling,sha256,bplus-tree}-design.md`
- 4 份 plan：`docs/plans/2026-07-12-{dns-resolver,cpu-scheduling,sha256,bplus-tree}.md`

### 2026-07-11 · CLAUDE.md D2 升级「极致版 + 三档场景清单」

**变更内容**

- D2 措辞升级为**极致版**：「Claude 不得在未得到用户明确答复的情况下擅自做出任何决策」
- 新增**三档触发清单**（内嵌于 D2 段内）：
  - 🔴 **必须问**：默认行为；列了 8 类典型场景
  - 🟡 **可问可不问**：仅限「用户已明文约定过」一类；引用不出来就走回 🔴
  - 🟢 **不问**：刻意为空，防止「绕开口子」

**理由**

- 此前 D2 已存在「宁问十遍，不擅一次」，但实操中偶有「擅自拍板」倾向
- 用户要求强化默认行为；分场景清单为 Claude 提供清晰判断口径
- 🟢 档刻意为空，反向避免漏问

**影响**

- 后续所有会话遇到灰色地带默认先 `AskUserQuestion` 再动手
- 唯一豁免：用户已明文约定的事实（必须引用出处）

参见：`CLAUDE.md` § D2

### 2026-07-11 · 项目规范化 plan 实施完成（11 Task）

**变更内容**

- **结构层（10 项）**全部落地：
  - `__mocks__/wx.js` → `tests/__mocks__/wx.js`（Task 2，jest setupFiles 路径同步）
  - `test-questions.md` → `tests/fixtures/test-questions.md`（Task 3）
  - 新建 `docs/plans/` + 迁移 `docs/superpowers/plans/` 全部内容（Task 4）
  - `PROJECT_HANDOFF.full-archive.md`（125 KB）→ `docs/archive/`（Task 5）
  - 加 `.gitignore` 丢弃 `design-methods/`、`design-previews/`、`.DS_Store`，并 `git rm --cached`（Task 1）
  - `docs/DESIGN.md` 收敛为 4 行指向 CLAUDE.md 唯一源（Task 6）
  - CLAUDE.md 新增 `## 代码风格` + `## 命名约定` 两节（Task 6）
  - PROJECT_HANDOFF.md §4 / §5 索引同步（Task 10）
- **代码风格层（3 项）**全部落地：
  - `var` → `const`/`let` 全迁移（Task 7，8 文件：utils/analytics、utils/bst、utils/graph、utils/hash-table、utils/sample-questions、utils/subnet、utils/tcp-states、pages/dashboard/dashboard.js）
  - `pages/sort-viz/sort-viz.js` 抽出 sort-step 生成器到 `utils/sort-algorithms.js`（Task 8；导出 `bubbleSort / selectionSort / quickSort`）
  - `tests/pages/sort-viz.test.js` 改为 import 真实实现，删除 92 行 duplicating（Task 9，**修 r.3**）

**理由**

- spec `docs/superpowers/specs/2026-07-11-normalization-design.md` 经 brainstorming → writing-plans → 用户批准全流程
- 全程保持 12 suites / 236 tests 全绿
- baseline = `0d0ac01`；HEAD = `87dbe2f`；共 17 个 commit

**影响**

- 项目进入「约定文档化」状态：新人读 CLAUDE.md 即知命名 / 风格 / 文件结构
- 仍 deferred（**已在 2026-07-11 var-cleanup 范围外**，留待后续 plan）：
  - ~~`pages/quiz / record-detail / sort-viz / tcp-viz / ds-viz / index` 的 `var` 迁移（pages 第一批仅 dashboard 完成；其余 5 个 pages 文件含 ~190 处 var，**r.7 候选**）~~ → **已完成（见下方 §8 · 2026-07-11 var 全清零 plan 实施完成）**
  - ~~`utils/sort-algorithms.js` 内 24 处 `var`（随 Task 8 byte-for-byte 搬迁；**r.6 候选**）~~ → **已完成（见下方 §8 · 2026-07-11 var 全清零 plan 实施完成）**
  - `tests/` 下 ~222 处 `var`（**r.8 候选**；tests/ 不在 var-cleanup 范围）
- 不主动 `git push`：等待用户决定（squash / 直推 / 回退 / 继续修 `tests/` 内 var）

参见：`docs/plans/2026-07-11-normalization.md` 实施计划 · `.superpowers/sdd/progress.md` 任务账本 · `docs/superpowers/specs/2026-07-11-normalization-design.md` design spec

### 2026-07-11 · var 全清零 plan 实施完成（8 Task · 7 commit）

**变更内容**

- 范围：仅 `utils/` + `pages/`（`tests/` 不在范围内，r.8 候选）
- 7 文件 / **283 处 var → const/let**（24 + 1 + 9 + 65 + 34 + 131 + 19），按方案 B 每文件 1 commit：
  - `727a3f1` `refactor(utils/sort-algorithms): var → const/let 全迁移`
  - `a7faf99` `refactor(pages/quiz): var → const/let 全迁移`
  - `ceb46bf` `refactor(pages/record-detail): var → const/let 全迁移`
  - `2864f78` `refactor(pages/sort-viz): var → const/let 全迁移`
  - `681879e` `refactor(pages/tcp-viz): var → const/let 全迁移`
  - `e3e0e8f` `refactor(pages/ds-viz): var → const/let 全迁移`
  - `39a2f8d` `refactor(pages/index): var → const/let 全迁移`
- 全程 `npm test` gate 全绿（12 suites / 236 tests）不变
- subagent 正确判定了 4 个「再次赋值」变量（`tools` / `currentTools` / `availableTools` / `unavailableTools`）改 `let`，其他改 `const`；纠正了 brief 里两条与文件实际不符的判定规则（`pages/index` 不存在 `for (var i)` 循环；该用 `let` 不能 `const`）

**理由**

- 接续上次 normalization 计划末尾 deferred 的 r.6（`utils/sort-algorithms.js`）+ r.7（5 个 pages 文件），一次性清理
- spec `docs/superpowers/specs/2026-07-11-var-cleanup-design.md` 经 brainstorming → writing-plans → 用户批准；计划文档 `docs/plans/2026-07-11-var-cleanup.md`（619 行 / 50 checkbox）
- 严格按 CLAUDE.md「## 代码风格」section 约定 —— `var` 全替为 `const` 或 `let`，不加新逻辑、不改空白风格
- subagent 主动识别 brief 错误而非机械执行，避免运行时 `TypeError: Assignment to constant variable`

**影响**

- 本次上下文清理后，`utils/` + `pages/` 内 `grep -rnE '\bvar\b'` 已无输出（仅历史 docs 与 tests/ 仍含）
- `tests/` 内 ~222 处 `var` 仍待清理（r.8 候选）；不在本次 plan 范围
- baseline = `1f59fba`；共 7 个 refactor commit + 1 个 handoff docs commit（前置 spec/plan 共 3 commit 计入实施准备）
- pre-docs-commit HEAD = `39a2f8d`；handoff docs commit HEAD = `b629afb`
- 不主动 `git push`：等待用户决定

参见：`docs/plans/2026-07-11-var-cleanup.md` 实施计划 · `docs/superpowers/specs/2026-07-11-var-cleanup-design.md` design spec · `.superpowers/sdd/progress.md` var-cleanup 账本段

### 2026-07-11 · 全项目 code review 完成

**变更内容**

- 6 维度并行 Workflow fan-out（SEC / COR / PERF / BUS / I18N / QUAL），各 1 个 Sonnet level agent，共 571k tokens / 248 tool calls / ~4 分钟
- 产出 `docs/review/2026-07-11-full-review.md`（154 条发现：2 Critical / 47 High / 53 Medium / 27 Low / 16 Info）
- 与 2026-06-15 报告并列对照：24 项仍存，4 项已修（GAP-10/13、COR-13/20），1 项回归（COR-32 ds-viz `const key` TypeError）

**已修复**（用户审批后）

| 类型 | 数量 | 内容 |
|---|---|---|
| Critical | 1 | ds-viz.js `const key → let key`（var→const 迁移回归） |
| P1 High | 4 | finishQuiz autoSave、onLoad 参数校验 3 处、storage 守卫 2 处 |
| Medium | 3 | COR-12 startTime、COR-15 onHide/unload、COR-19 questionTypes 快照 |
| Low | 6 | console.log、catch 空块、deletePaper id、markMastered return、sort 比较器、quickSort 阴影 |
| Test var | 222 | 6 个测试文件 var→let 全迁移 |

**Follow-up**

- I18N：追加到 `docs/handoff/future-plans.md` §P6，独立 plan 实施
- 剩余 47 High + 53 Medium 项：详见报告 `docs/review/2026-07-11-full-review.md` §10

**理由**

- 覆盖 2026-06-15 之后所有变更（含 b9a543b var→const/let 全清零 refactor 专项回归）
- 新增业务一致性（BUS）/ i18n 兼容性（I18N）两个维度
- spec `docs/superpowers/specs/2026-07-11-code-review-design.md` → plan `docs/plans/2026-07-11-full-code-review.md`

**影响**

- 当前 HEAD=`a134be3`
- 18 项 06-15 遗留未修中，已修 6 项（COR-01/03/05、BUS-10-01、QUAL-01-001/05-001），仍存 12 项
- 不主动 `git push`

---

## 2026-07-19：死锁模拟器上线

**新增文件**

| 路径 | 说明 |
|---|---|
| `pages/deadlock/deadlock.{js,wxml,wxss,json}` | 死锁模拟器页面（双模式：RAG / 银行家算法） |
| `utils/rag.js` | RAG 数据结构 + 死锁检测（纯函数） |
| `utils/bankers.js` | 银行家算法（纯函数） |
| `tests/utils/rag.test.js` | RAG CRUD + 死锁检测 33 测试 |
| `tests/utils/bankers.test.js` | 银行家算法 12 测试 |
| `docs/handoff/modules/deadlock.md` | 模块文档 |

**关键决策**
- RAG→Wait-For 图→DFS 三色标记法环检测
- 请求边单次请求 ≤ 总量；分配边累计分配 ≤ 总量（不混算）
- 边缘语义校验：request 必须 P→R，allocation 必须 R→P
- JS 工具函数全部纯函数 + 不可变
- 节点上限 5+5（进程 + 资源）

**影响**
- `tool-registry.js`：`deadlock.available = true`
- `app.json`：注册 `pages/deadlock/deadlock`
- 当前 HEAD = `bfbddb3`
- 687 测试通过，42 suites 全绿
- 不主动 `git push`

### 2026-07-19 · 修复 deadlock WXML 编译错误

**问题**
- 编译时报错 `177:69:unexpected character {`，导致预览失败
- 根因：`pages/deadlock/deadlock.wxml` 第 177 行，内层 `wx:for` 循环中，`{{item}}` 放错了位置 —— 写在了标签属性区而非内容区

**变更**
- `pages/deadlock/deadlock.wxml` L177：`{{item}}</view>` 中的 `{{item}}` 从属性区移到 `<view>` 标签内容区

**验证**
- `cli preview` 编译通过 ✅

### 2026-07-19 · 死锁模拟器新增使用说明弹窗

**变更内容**
- 新增 `components/intro-modal/` 可复用使用说明弹窗组件（4 文件）
- 全局注册于 `app.json` 的 `usingComponents`
- 死锁模拟器页面：首次进入自动弹窗展示使用说明，关闭后标记已读
- 页面右上角 ℹ︎ 浮动按钮支持手动回看

**涉及文件**
| 操作 | 文件 |
|---|---|
| 新增 | `components/intro-modal/intro-modal.{js,wxml,wxss,json}` |
| 修改 | `app.json` |
| 修改 | `pages/deadlock/deadlock.js` |
| 修改 | `pages/deadlock/deadlock.wxml` |
| 修改 | `pages/deadlock/deadlock.wxss` |

**设计决策**
- 与 `feature/tool-intro-modal` 分支不同：先进入页面再弹窗，而非首页拦截
- 使用 `pre-line` 保持文本换行格式，用 ━━ 分段符代替多子字段
- 正文 26rpx / 标题 32rpx 确保可读性（ref 分支正文仅 14rpx）
- 关闭即标记已读，下次不重复弹出

**验证**
- `npm test` 687 全绿 ✅
- spec: `docs/superpowers/specs/2026-07-19-tool-intro-modal-design.md`
- plan: `docs/superpowers/plans/2026-07-19-tool-intro-modal.md`
- `npm test` 687 全绿 ✅
