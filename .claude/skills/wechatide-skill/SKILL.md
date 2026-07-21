---
name: wechatide-skill
description: >-
  微信开发者工具任务根入口。支持检查安装状态、下载与更新；工具兼容时完成环境与登录检查，再路由到
  创建项目、初始化、项目管理、项目配置、编译、预览、页面自动化、调试或云开发操作。适用于小程序与小游戏。
  用户提到微信开发者工具、下载安装、小程序/小游戏模拟器、新建项目、预览上传、自动化点击、
  console/network、云函数/云数据库时使用。
metadata:
  short-description: 微信开发者工具 skill 包
---

# wechatide-skill

## 用途

面向微信开发者工具工作流的根入口。**小程序与小游戏同等适用**（除非某工具参数或说明明确限定类型）。

**应使用**：检查、下载或更新微信开发者工具；小程序/小游戏项目的页面自动化与验证；运行时/截图/日志排查；云环境与云函数；编译、预览、上传、登录；项目管理与 `project.config.json` 配置。

**不应使用**：通用编码辅助；与小程序/小游戏无关的桌面自动化；任意 shell / 未注册工具调用。

## 运行前门禁（必须）

除下载/更新专用的 `installer` scene 和不调用 `wechatide` 的纯本地 scene 外，调用 `wechatide` 工具前每个会话完成一次：

1. 执行 `node skills/installer/scripts/check-installation.mjs`；不兼容时进入 installer。
2. 调用 `check_wechatide_status --skill-version <当前 skill.yaml version>`；必须确认已登录。
3. `equal` 直接继续；安装兼容的 `agent_ahead` 记录风险后继续；`agent_behind` 先从返回的 `skillPath` 单向覆盖 agent 侧并重载。

硬性约束：

- 未传 `--skill-version` 得到 `skip_check` 时不得继续业务工具。
- `skillPath` 是安装目录内的只读来源；只允许安装目录 → agent，严禁反向写入或修改安装目录。
- 授权、扫码或确认返回 `pending + taskId` 时，必须轮询到成功终态后再继续。
- `project-config` 只编辑本地 JSON，不执行安装兼容、登录或 skill 版本门禁；后续切换到调用 `wechatide` 的 scene 时再检查。
- 完整安装矩阵、版本处理与单向导入见 [运行前检查](references/environment-readiness.md)。

## 调用方式

```bash
wechatide -c <clientName> <toolName> [flags...] [--token <cliAccessToken>]
```

- `-c` / `<clientName>`：当前 agent 产品简称（如 `Cursor`、`Claude`、`CodeBuddy`），须与授权弹窗里的 client 一致；同一会话内保持不变
- `<toolName>`：工具名位置参数（下划线，勿用点号/驼峰）
- `--token`：安全设置中配置的 CLI 访问令牌；启用校验后每条 `wechatide` 工具命令都必须携带，未启用时可省略。不得从工具本地数据中读取，也不得写入项目文件或输出到日志
- `--skill-version`：**仅**用于 `check_wechatide_status` 做版本对齐；**不要**传给 `auto_preview` 等业务工具
- 本地路径传绝对路径；`object`/`array` 可用 JSON 或 `--<field>-file`
- **不要编造工具名或参数结构**；先查 [references/tool-index.md](references/tool-index.md)

clientName 授权与 CLI 访问令牌是两层独立校验；clientName 已授权不代表后续命令可以省略已启用的访问令牌。

异步任务统一按 [异步任务轮询](references/async-task-polling.md) 处理。

- **对工具名把握不高，或不确定参数/用法时**：先查帮助，再调用（勿猜 flag）：

```bash
wechatide <toolName> -h
# 等价
wechatide <toolName> --help
```

- 共享工具以 tool-index **主归属**为准（见下表）；次要 scene 仅可按本 scene 文档调用，勿跨 scene 随便混用

### 共享工具主归属

| 工具 | 主归属 | 说明 |
|------|--------|------|
| `automation_runtime_info` | initializer | automator / debugger 可只读取上下文，勿当「开窗」替代 |
| `automation_wx_api` | debugger | 自动化流程内 mock/调用可在 automator |
| `simulator_screenshot` | debugger | 诊断取证（含 StatusBar / Toast） |
| `automation_viewport_action`（`screenshot`） | automator | 写入自动化脚本的截图；勿与 `simulator_screenshot` 混用 |
| `simulator_refresh` / `build_npm` | compiler | debugger 可借用刷新，勿无差别反复刷 |
| `polling_task_result` | 通用 | 任意 scene 查询需要用户交互的 toolCall 最终结果 |

完整主归属以 [tool-index](references/tool-index.md) 的 scene 列为准（多 scene 时第一项为主）。

## 路由

| 用户意图 | Scene |
|----------|--------|
| 下载、安装或更新微信开发者工具；安装检查不兼容；`agent_ahead` 后遇到明确版本兼容 blocker | `skills/installer/SKILL.md` |
| 从零创建小程序/小游戏项目（目录 + 配置 + 导入列表；**非**独立 scene） | `wechatide-tools/references/create-project-guide.md` |
| 打开/关闭项目窗口、登录、AppID、运行时上下文 | `skills/initializer/SKILL.md` |
| 项目列表查询 / 导入 / 从列表删除（不开窗口） | `skills/project-manager/SKILL.md` |
| 改 `project.config.json`（修改基础库版本、域名校验、热重载、编译开关等，不调 MCP） | `skills/project-config/SKILL.md` |
| 编译页面、单文件编译、构建 npm、刷新模拟器 | `skills/compiler/SKILL.md` |
| 预览、二维码、上传体验版（预览优先 `auto_preview`；可不打开窗口） | `skills/previewer/SKILL.md` |
| 点击、输入、滚动、页面断言、自动化脚本 | `skills/automator/SKILL.md` |
| console / network / 截图取证 / 状态诊断 | `skills/debugger/SKILL.md` |
| 云环境、云函数、云数据库、云存储 | `skills/cloudbase-operator/SKILL.md` |
| 小程序地图组件 / 腾讯位置服务 API | `references/map-skill-index.md`（外部 skill） |

选择原则：按**当前主目标**进一个 scene；不要跨 scene 混用原子工具。多目标时先完成 blocker，再移交。

## 跨 scene 移交（必须）

切换 scene / 走完 create-project 后，带上下列上下文（可写入回复，勿丢）：

| 字段 | 要求 |
|------|------|
| `nextScene` | 目标 scene 名，或 `create-project-guide` / 结束 |
| `project` | 已有项目时必填：本地绝对路径 |
| `confirmed` | 已确认事实（如已登录、`versionRelation` 及兼容性风险、窗口已开、appid、env、当前页） |
| `blocker` | 未决项；无则省略 |
| `pendingTask` | 有未完成异步任务时必填：`taskId`、原工具名、非敏感参数摘要、最后状态；后续不得直接重发原操作 |
| 附加 | 见目标 scene「移交」表（页面、选择器、env 等） |

下一 scene：**不要**重复 `check_wechatide_status`；**不要**无故 `open_project_window`（除非 `confirmed` 表明窗口未开且目标需要窗口）。

## 标准工作流

1. 识别项目与目标：
   - 只改项目配置 → 直接进入 `project-config`，跳过运行前门禁
   - 从零创建项目 → `create-project-guide.md`（本地配置可先做；调用 `project_import` 前完成门禁）
   - 仅管理项目列表 → `project-manager`（不开窗口）
   - 预览 / 上传 → `previewer`（**可不打开项目窗口**）
   - 编译 / 调试 / 自动化 → `initializer` 打开窗口后再进对应 scene
2. 目标需要调用 `wechatide` 时执行安装兼容检查；任一不兼容结果直接进入 `installer`
3. 安装兼容后执行 `check_wechatide_status --skill-version <skill.yaml 的 version>`：须 `loginExpired: false`；`equal` 直接继续，`agent_ahead` 记录风险后继续，`agent_behind` 先单向导入
4. 进入目标 scene；有匹配的 `pendingTask` 时先查询旧 `taskId`，不得直接重发原操作

## 交互与失败

出现授权、扫码或操作确认弹窗时，按 [异步任务轮询](references/async-task-polling.md) 处理。安全边界见 [references/approval-policy.md](references/approval-policy.md)。

执行失败：原样抛出错误，不要吞掉或猜测修复。`PROJECT_PATH_NOT_FOUND` / `PROJECT_CONFIG_JSON_ERROR` / `APPID_ERROR` 的后置处理见 [project-tool-error-guide.md](wechatide-tools/references/project-tool-error-guide.md)（勿改成调用前预检）。各 scene「失败快表」只补充本场景特有处理。

## 参考

- 工具索引（含主归属）：[references/tool-index.md](references/tool-index.md)
- 运行前检查与版本对齐：[references/environment-readiness.md](references/environment-readiness.md)
- 异步任务轮询：[references/async-task-polling.md](references/async-task-polling.md)
- 工具注册表：`wechatide-tools/references/tools.yaml`（按需读单工具，勿整文件灌入）
- `--project` 配置/appid 错误：`wechatide-tools/references/project-tool-error-guide.md`
- 创建项目：`wechatide-tools/references/create-project-guide.md`
- 地图外部 skill：`references/map-skill-index.md`
