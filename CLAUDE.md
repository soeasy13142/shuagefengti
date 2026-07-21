# CLAUDE.md

> **任何开始**：先读本文 → 再读 `PROJECT_HANDOFF.md` 相关章节 → 再动手。
> **任何结束**：追加 `PROJECT_HANDOFF.md`（决策 / 新约定 / 踩过的坑）。

## 项目交接文档

`/Users/charliepan/Downloads/my-miniapp/PROJECT_HANDOFF.md` — **每次改前必读，改后必追加**。

---

## 核心红线（DO / DON'T）

### ✅ 必做

**D1. Plans 先行** — ≥3 步 / ≥2 文件 / 涉及架构或数据决策 → 必须先写 `docs/plans/`，等用户确认再动手。

**🚨 D1a. 每步必 commit** — plan 每完成一个步骤 → **立即 `git commit`**（分支上可自由提交，不等用户许可）。不得攒到全部做完才提交。

**D2. 必问原则** — 任何不确定 → 立即 `AskUserQuestion`。禁止替用户决策。详见 D2 三档触发清单（DO/DON'T 内）。

**D3. 改前读 / 改后写** — 每次修改前后都查 `PROJECT_HANDOFF.md`，新约定回写。

**D4. TDD** — 先测试（RED）→ 最小实现（GREEN）→ 重构（IMPROVE），覆盖率 ≥ 80%。

**D5. 完成前验证** — `npm test` 全绿 + `superpowers:verification-before-completion`。

**D6. 保持主会话轻量** — 大量读写 → 开 SubAgent。

**D7. 调试/审查优先 wechatide-skill** — 调试小程序或 code review 时，优先使用 `wechatide-skill`（`.claude/skills/wechatide-skill/`），它提供模拟器截图、console/network 日志、自动化点击、页面导航、编译验证等能力，比手动操作更高效。

**D8. 默认用 SubAgent，不问** — 凡能派 SubAgent 处理的（`.claude/rules/subagent-usage.md` 中列出的场景），**直接派，不询问用户**。包括但不限于：独立 utils + 测试开发、批量化重构、全库搜索替换、全量测试、代码审查、查文档/API。主会话保持轻量。仅当任务需要频繁来回确认/视觉迭代/用户决策时才留在主会话。

### ❌ 禁止

**X1** 替用户决策 | **X2** 跳过 plans | **X3** 不经询问创建/删除文件 | **X4** 硬编码 secrets
**X5** 未要求就 `git push`（分支上 commit 不受限） | **X6** 残留 `console.log`
**X7** 测试未过就称完成 | **X8** 擅定 UI/命名/数值

### D2 三档触发（必读）

**🔴 必须问**：库/框架选型、UI 风格/配色/字体/文案、命名约定、方案 A vs B、CSS 数值、改动程度/边界、看似细枝末节的偏好。
**🟡 可问可不问**：用户/CLAUDE.md/PROJECT_HANDOFF.md 中已明文约定的，直接执行。
**🟢 不问**：刻意空置。觉得属于此档 → 回到 🔴。

> 错误成本：问 10 次多问的损失 << 擅自拍板一次的重做代价。

---

## 技术栈

微信小程序原生（WXML+WXSS+JS）| 纯本地存储 | 无后端无云 | Jest 测试 | 纯 WXML/WXSS 可视化 | 无第三方 Markdown/图表库

## 测试

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```
- 任何改动不得导致现有测试失败
- 新增功能必须伴随测试；纯逻辑（`utils/`）必须有单元测试

## 设计风格

暖奶油画布（Claude Design）：

| 元素 | 值 |
|---|---|
| 页面底色 | `#faf9f5` |
| 卡片底色 | `#efe9de`，圆角 24rpx |
| 主色 CTA | `#cc785c`（Active `#a9583e`） |
| 标题 | Georgia 衬线，400 weight，letter-spacing -3rpx |
| 正文 | `#141413`（暖墨） |
| 次要文字 | `#6c6a64` |
| 深色面 | `#181715` / 文字 `#faf9f5` |
| 阴影 | 零阴影（靠色块对比表达深度） |

参考技能：`claude-design`、`ui-ux-pro-max`

---

## 开发工作流

```
读 PROJECT_HANDOFF.md
→ 判断任务类型（UI/UX → 技能路由；一般代码 → 直接实现）
→ 复杂任务？写 plans（docs/plans/）
→ 等用户确认 → 按 plan 逐步骤实现（每步结尾: git commit → npm test）
→ 全步骤完成 → 审查（ecc:code-reviewer）→ 验证完成 → 更新 handoff
→ rebase 整理 commit → push（需用户明确要求）
```

---

## 文件命名约定

| 类型 | 格式 | 示例 |
|---|---|---|
| utils | `<module>.js` | `markdown-parser.js` |
| pages | `<name>/` 4 文件 | `pages/subnet-calc/` |
| tests/utils | `<module>.test.js` | `subnet.test.js` |
| tests/pages | `<engine>.test.js` | `quiz-engine.test.js` |
| plans | `docs/plans/<YYYY-MM-DD-name>.md` | `2026-07-11-normalization.md` |
| 设计 spec | `docs/superpowers/specs/<fmt-name>-design.md` | `2026-07-11-dh-viz-design.md` |
| mocks | `tests/__mocks__/<name>.js` | `wx.js` |

**代码风格**：`const` / `let`，禁用 `var`。顶层常量 `UPPER_SNAKE_CASE`，私有 `_prefix`。异步优先 async-await。所有 catch 显式处理。

---

## 微信开发者工具调试（MCP 服务器）

项目配置了 `wechat-devtools` MCP 服务器，可通过 Claude 直接调用微信开发者工具进行调试。

### 前置条件
1. 打开 微信开发者工具 → 设置 → 安全设置 → **服务端口**（开启）
2. 项目中已安装 `miniprogram-automator`（通过 `npm install --save-dev miniprogram-automator`）
3. 目标项目已在开发者工具中打开

### 可用工具

| 工具名 | 用途 | 常用场景 |
|--------|------|----------|
| `devtools_connect` | 连接 DevTools（自动启动 WebSocket） | 最开始调用一次 |
| `devtools_navigate` | 导航到指定页面 | 编译后验证页面加载无报错 |
| `devtools_logs` | 读取控制台日志 | 检查编译错误、运行时异常 |
| `devtools_get_data` | 获取页面 data 状态 | 验证 metrics、进程列表等 |
| `devtools_call_method` | 调用页面方法 | 触发算法运行、增删进程等 |
| `devtools_system_info` | 获取设备/系统信息 | 查看 SDK 版本、设备参数 |
| `devtools_screenshot` | 截取模拟器截图 | 视觉验证 |
| `devtools_disconnect` | 断开连接 | 调试完毕清理 |

### 典型调试流程

```
1. 改完代码 → devtools_connect → 确认连接成功
2. devtools_navigate({url: "/pages/cpu-sched/cpu-sched"}) → 验证编译无错
3. devtools_logs → 看控制台有无报错
4. devtools_call_method({method: "onRandomGenerate"}) → 触发操作
5. devtools_get_data → 检查页面状态
6. devtools_logs → 再看有没有运行时异常
```

### HTTP API（手动调用）

当 MCP 服务器不可用时，也可通过 HTTP 接口操作：
- `http://localhost:<port>/v2/islogin` — 检查登录
- `http://localhost:<port>/v2/open?project=<path>` — 打开项目
- `http://localhost:<port>/v2/close?project=<path>` — 关闭项目
- `http://localhost:<port>/v2/auto?project=<path>&auto-port=9420` — 开启自动化
- `http://localhost:<port>/v2/quit` — 退出工具

端口存储在 `~/Library/Application Support/微信开发者工具/<MD5>/Default/.ide`

### CLI 命令（终端直接使用）

```
# 工具路径
/Applications/wechatwebdevtools.app/Contents/MacOS/cli <command>

# 常用命令
cli login                    # 登录（二维码）
cli islogin                  # 检查登录状态
cli open --project <path>    # 打开项目
cli close --project <path>   # 关闭项目
cli auto --project <path> --auto-port 9420  # 启动自动化接口
cli preview --project <path> # 预览（生成二维码）
cli upload --project <path> -v 1.0.0 -d "描述"  # 上传代码
cli build-npm --project <path>  # 构建 npm
cli cache --clean all --project <path>  # 清除全部缓存
cli quit                     # 退出开发者工具
```

---

## 规则文件索引（详见各文件）

| 文件 | 内容 |
|---|---|
| `.claude/rules/git-workflow.md` | 提交规范、分支策略、push 流程 |
| `.claude/rules/subagent-usage.md` | Subagent/Workflow 使用规范与适用场景 |
| `.claude/rules/skill-routing.md` | 技能路由（UI/UX 任务分类与技能匹配） |
| `.claude/rules/ecc-commands.md` | ECC 命令触发清单与速记别名 |
