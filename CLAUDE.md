# CLAUDE.md

Project instructions and memory for Claude Code.

## 项目交接文档

`/Users/charliepan/Downloads/my-miniapp/PROJECT_HANDOFF.md` 是项目的交接文档。

- **每次做出修改前**，务必先阅读这个文档
- **修改完成后**，务必追加和修改这个交接文档

---

## 技能路由（强制 · 不可跳过）

**在任何用户请求开始处理之前，必须完成以下路由步骤。未完成路由前禁止生成代码、禁止调用工具（除读取本文件外）。**

### 第一步：任务分类

将用户请求归入以下类别之一（可多选）：

| 类别 | 触发关键词/场景 |
|---|---|
| **UI/页面设计** | 新建页面、改 UI、布局、样式、配色、卡片、按钮、表单、响应式 |
| **UX/交互设计** | 用户流程、交互方案、信息架构、可用性、无障碍、用户研究 |
| **品牌/设计系统** | 品牌标识、设计 token、Logo、企业 VI、设计规范 |
| **代码审查** | 完成一批改动后、PR review、找 bug、安全审计、代码质量 |
| **文档/API 查询** | 库、框架、SDK、API、CLI 工具、配置、迁移、版本（即使是 React/Next.js 等已知库） |
| **规划/架构** | 大功能规划、多文件改动、架构决策、实现方案设计 |
| **纯逻辑/工具函数** | 工具函数、存储封装、解析器、算法实现 |
| **微信小程序页面** | 小程序页面开发（WXML/WXSS/JS） |

### 第二步：查表匹配技能

根据类别，使用以下决策矩阵：

| 类别 | 优先技能 | 备选技能 | 说明 |
|---|---|---|---|
| **UI/页面设计** | `ui-ux-pro-max` | `claude-design`、`ckm-design` | `ui-ux-pro-max` 最全面；`claude-design` 是本项目当前使用的暖奶油画布风格 |
| **UX/交互设计** | `ux-designer` | `ui-ux-pro-max` | `ux-designer` 专注用户研究和信息架构 |
| **品牌/设计系统** | `ckm-design-system` | `ckm-brand`、`ckm-design` | 适合设计 token、组件规范、品牌一致性 |
| **代码审查** | `code-reviewer` | — | 完成改动后必须调用 |
| **文档/API 查询** | `context7-mcp` | — | **即使你认为自己知道答案，也必须查最新文档** |
| **规划/架构** | `superpowers:brainstorming` | `superpowers:writing-plans` | 大功能先 brainstorming 再 writing-plans |
| **纯逻辑/工具函数** | 无特定技能 | `code-reviewer`（完成后） | 直接实现，完成后 code-review |
| **微信小程序页面** | `ui-ux-pro-max`（UI 部分） | `claude-design`（风格参考） | 业务逻辑直接实现 |

### 第三步：执行路由

```
路由检查清单（每次对话开头必须打勾）：
□ 已完成任务分类
□ 已查表确定需要的技能
□ 如有匹配技能 → 使用 Skill 工具加载
□ 如无匹配技能 → 在回复开头说明"未找到适用技能"
□ 已在回复开头说明：使用的技能 / 未使用的原因
```

### 第四步：技能使用后的收尾

- **UI 技能**（`ui-ux-pro-max`、`claude-design` 等）：确保实现符合技能中的设计规范
- **`code-reviewer`**：在每批代码改动完成后调用，审查 correctness、security、performance
- **`context7-mcp`**：每次涉及第三方库/API 时必须先 resolve-library-id 再 query-docs

---

## 已安装技能速查表

以下是本项目实际可用的技能，按用途分组。**不要猜测技能名，只使用下表中列出的。**

### 设计类技能

| 技能名 | 用途 | 何时使用 |
|---|---|---|
| `ui-ux-pro-max` | 综合 UI/UX 设计指南（50+ 风格、161 色板、57 字体对） | 新建/重构页面、组件设计、配色、布局、响应式 |
| `ux-designer` | 用户研究、线框图、原型、用户流、信息架构 | 设计用户流程、交互方案、可用性审查 |
| `claude-design` | Claude.com 暖奶油画布编辑式设计语言 | **本项目当前使用的设计风格**，做新页面时参考 |
| `ckm-design` | 综合设计：品牌标识、设计 token、UI 样式、Logo | 品牌相关设计 |
| `ckm-design-system` | 设计系统：token、组件规范、模板 | 建立/维护设计规范 |
| `ckm-brand` | 品牌身份 | Logo、VI、品牌一致性 |
| `ckm-ui-styling` | UI 样式细节 | 具体组件的样式打磨 |
| `ckm-banner-design` | Banner 设计（22 种风格） | 需要 Banner/广告图时 |
| `ckm-slides` | 演示文稿设计 | 需要制作 PPT/幻灯片时 |
| `*—design.md`（80+ 个） | 各品牌设计语言参考（Apple、BMW、Tesla 等） | 需要模仿某品牌风格时，如 `apple-design.md` |

### 开发类技能

| 技能名 | 用途 | 何时使用 |
|---|---|---|
| `code-reviewer` | 代码审查（安全、性能、最佳实践） | **每批代码改动完成后必须调用** |
| `context7-mcp` | 查最新文档（库、框架、API） | 涉及任何第三方库/API 时，**即使你认为自己知道** |
| `find-skills` | 搜索可用技能 | 不确定哪个技能适用时 |

### 规划类技能

| 技能名 | 用途 | 何时使用 |
|---|---|---|
| `superpowers:brainstorming` | 创意发散、方案探索 | 大功能的前期探索 |
| `superpowers:writing-plans` | 编写结构化实施计划 | 确定方向后拆分任务 |
| `superpowers:subagent-driven-development` | 子 agent 驱动开发 | 按计划逐步实现 |
| `superpowers:executing-plans` | 执行已有计划 | 按 checkbox 逐项执行 |

### ECC 子 Agent（通过 Agent 工具调用）

| Agent 类型 | 用途 | 何时使用 |
|---|---|---|
| `ecc:code-reviewer` | 专业代码审查 | 复杂改动的深度审查 |
| `ecc:planner` | 规划专家 | 复杂功能的实施规划 |
| `ecc:typescript-reviewer` | TypeScript 审查 | TS/JS 代码改动时 |
| `ecc:security-reviewer` | 安全审查 | 涉及用户输入、认证、API 时 |
| `ecc:performance-optimizer` | 性能优化 | 性能问题排查 |
| `ecc:code-explorer` | 代码探索 | 理解现有代码结构 |
| `ecc:code-architect` | 架构设计 | 设计新功能架构 |

---

## 设计风格约束

本项目当前使用 **Claude Design 暖奶油画布** 风格（见 `PROJECT_HANDOFF.md` §25）。

新建或修改页面时，必须遵守：

| 元素 | 规范 |
|---|---|
| 页面背景 | `#faf9f5`（暖奶油） |
| 卡片背景 | `#efe9de`（奶油卡片），圆角 24rpx |
| 主色（CTA） | `#cc785c`（珊瑚色），Active `#a9583e` |
| 标题字体 | Georgia 衬线，400 weight，letter-spacing -3rpx |
| 正文字色 | `#141413`（暖墨） |
| 次要文字 | `#6c6a64` |
| 深色表面 | `#181715`（深海军蓝），文字 `#faf9f5` |
| 阴影 | 零阴影，靠色块对比表达深度 |

参考技能：`claude-design`、`ui-ux-pro-max`

---

## 开发工作流

每次开发任务的标准流程：

```
1. 技能路由（本节，强制）
   ↓
2. 阅读 PROJECT_HANDOFF.md 相关章节
   ↓
3. 如为大功能 → 进入 plan mode，使用 superpowers:writing-plans
   ↓
4. 实现代码
   ↓
5. 运行测试：npm test（必须全部通过）
   ↓
6. 代码审查：调用 code-reviewer 或 ecc:code-reviewer
   ↓
7. 更新 PROJECT_HANDOFF.md
   ↓
8. 提交
```

---

## 测试约束

- 测试命令：`cd /Users/charliepan/Downloads/my-miniapp && npm test`
- **任何改动不得导致现有测试失败**
- 新增功能必须伴随对应测试
- 纯逻辑（utils/）必须有单元测试
- 页面逻辑尽量抽取纯函数到 utils/ 后测试

---

## 技术栈约束

- 微信小程序原生框架（WXML + WXSS + JS）
- 纯本地存储（`wx.setStorageSync` / `wx.getStorageSync`）
- 无后端、无云服务（当前阶段）
- Markdown 解析用纯正则，不引入第三方 Markdown 库
- Jest 做纯 JS 逻辑测试
- 不引入图表库，用纯 WXML/WXSS 实现可视化

---

## 文件结构约定

- 新增页面：`pages/<page-name>/`（4 个文件：.js / .wxml / .wxss / .json）
- 新增工具函数：`utils/<module-name>.js`
- 新增测试：`tests/utils/<module>.test.js` 或 `tests/pages/<module>.test.js`
- 新增后必须在 `app.json` 注册页面
- 首页入口修改：`pages/index/index.js` + `.wxml` + `.wxss`
