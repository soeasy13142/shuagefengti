# 运行前检查

除下载/更新专用的 `installer` scene 外，调用 `wechatide` 工具前按本文完成安装兼容、登录和 skill 版本检查。每个会话成功检查一次即可。

## 1. 安装兼容性

在本 skill 根目录执行：

```bash
node skills/installer/scripts/check-installation.mjs
```

| 结果 | 处理 |
|------|------|
| `compatible: true` | 继续检查登录与 skill 版本 |
| `reason: not_installed` | 用户未说明自定义安装时进入 installer；否则询问安装目录并用 `--install-root` 重查 |
| `reason: nw_runtime_incompatible` | 强制进入 installer 更新 |
| `reason: electron_version_too_old` | 强制进入 installer 更新 |
| `reason: cli_unavailable` | 强制进入 installer；安装后仍不可用则排查 PATH，不循环下载 |
| 其他 `mustEnterInstaller: true` | 无法确认兼容性，进入 installer |

安装兼容检查优先于 `versionRelation`。即使为 `agent_ahead`，`mustEnterInstaller: true` 时也不得继续业务工具。

## 2. 登录与 skill 版本

```bash
wechatide -c <clientName> check_wechatide_status --skill-version <skillVersionFromSkillYaml> [--token <cliAccessToken>]
```

`<skillVersionFromSkillYaml>` 必须取当前 agent 已加载的 `wechatide-skill/skill.yaml` 顶层 `version`。会话首次检查必须传；不传时 `versionRelation` 为 `skip_check`，不得当作就绪。

| 返回 | 处理 |
|------|------|
| `loginExpired: false` 且 `versionRelation: equal` | 就绪 |
| `loginExpired: false` 且 `versionRelation: agent_ahead` | 记录风险后继续；任务结束时建议升级 |
| `versionRelation: skip_check` | 补传 `--skill-version` 后重查 |
| `versionRelation: agent_behind` | 按下方步骤单向导入 agent 侧 skill，重载后再查 |
| `loginExpired: true` | `wechatide -c <clientName> login`，扫码成功后再查 |
| `CONNECT_ERROR` / `AUTH_*` | 必要时手动执行 `wechatide auth -c <clientName>` |

CLI 自动授权需要用户交互时，按 [异步任务轮询](async-task-polling.md) 处理。启用访问令牌校验后，auth 只返回 `tokenRequired: true`；须由用户提供安全设置中的访问令牌，不得从本地工具数据读取、写入项目或输出到日志。

## 3. 单向导入与版本关系

`skillPath` 指向微信开发者工具安装目录内的只读 skill：

- 只允许 `skillPath`（安装目录）→ 当前 agent 的 skills 目录
- 禁止 agent skills 目录 → `skillPath`
- 不得修改、覆盖或删除 `.app`、`app.asar.unpacked` 等安装目录内容

| `versionRelation` | 处理 |
|-------------------|------|
| `equal` | 继续，不复制 |
| `agent_ahead` | 安装兼容时记录风险并继续；不得写入安装目录 |
| `agent_behind` | 从 `skillPath` 整目录覆盖 agent 侧，重载 skill 后重查 |

首次导入或 `agent_behind`：

1. 确认 `wechatide -h` 可用。
2. 调用 `check_wechatide_status --skill-version <version>`；尚未导入时可临时传 `0.0.0` 取得 `skillPath`。
3. 从返回的 `skillPath` 绝对路径整目录复制到 agent 侧，不要只修改 `version`。
4. 重新加载 skill 或新开会话。
5. 用新 `skill.yaml` 的版本重查，直到 `equal`。
