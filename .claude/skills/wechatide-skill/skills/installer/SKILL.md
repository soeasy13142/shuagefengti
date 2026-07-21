---
name: installer
description: >-
  检查、下载或更新微信开发者工具。识别未安装、wechatide CLI 不可用、NW.js 版及过低的 Electron
  版本并强制进入更新流程；也处理 agent_ahead 后出现的明确版本兼容 blocker。支持手动或主动下载。
---

# installer

## 触发条件

以下任一情况进入本 scene：

- 用户要求下载、安装或更新微信开发者工具
- 当前系统没有微信开发者工具
- 已安装开发者工具，但 `wechatide -h` 不可用, 返回 `command not found`、`not recognized` 或等价的命令不存在错误
- 安装目录存在 NW.js 版的 `package.nw/package.json`
- Electron 版 `app.asar.unpacked/package.json` 的 `version` 低于 `2.02.2607152`
- `versionRelation: agent_ahead`，且后续任务因工具或参数不受支持等明确版本兼容问题无法继续

安装缺失或不兼容时无需执行根 SKILL 的登录与版本检查。安装检查结果优先于 `versionRelation`：NW.js、Electron 版本过低或 CLI 不可用时，即使 `agent_ahead` 也必须进入本 scene。仅有 `agent_ahead` 不进入；发生明确版本兼容 blocker 后再进入，且不要重复调用 `check_wechatide_status`。

本 scene 负责更新提醒、获取安装包和安装指引，不调用 `wechatide` 业务工具。

## 安装状态检查

在本 skill 目录执行：

```bash
node skills/installer/scripts/check-installation.mjs
```

检查顺序：

1. macOS 检查标准应用目录；Windows 优先从卸载信息和 App Paths 注册表定位安装目录，再检查常见目录
2. 检查 NW.js 标记，存在即返回 `nw_runtime_incompatible`
3. 检查 Electron `package.json` 并读取 `version`
4. 版本低于 `2.02.2607152` 时返回 `electron_version_too_old`
5. 执行 `wechatide -h`；已安装但命令不可用时返回 `cli_unavailable`
6. 仅 Electron 版本不低于门槛且 CLI 可用时返回 `compatible: true`

标准文件位置：

| 系统 | NW.js 标记 | Electron 版本文件 |
|------|-------------|-------------------|
| macOS | `/Applications/wechatwebdevtools.app/Contents/Resources/package.nw/package.json` | `/Applications/wechatwebdevtools.app/Contents/Resources/app.asar.unpacked/package.json` |
| Windows | `%Program Files(x86)%\Tencent\微信web开发者工具\code\package.nw\package.json` | `%Program Files(x86)%\Tencent\微信web开发者工具\resources\app.asar.unpacked\package.json` |

Windows 安装目录可自定义；脚本会从注册表读取 `InstallLocation`、`DisplayIcon`、`UninstallString` 和 App Paths，并向上定位运行时标记。`%ProgramFiles(x86)%` / `%ProgramFiles%` 仅作为注册表未命中时的备用目录。未注册的便携安装无法自动发现，用户提供路径后用以下命令重查：

```bash
node skills/installer/scripts/check-installation.mjs --install-root "<安装目录>"
```

## 决策

1. 用户明确要求手动下载：打开官方下载页并引导选择，不运行解析脚本。
2. 其他情况默认主动解析并下载；失败后回退手动下载。
3. 按用户原话选择版本：
   - 只说“下载”“安装”“更新”或“稳定版” → `stable`
   - 说“最新开发版”“开发版”“Nightly”或“最新版” → `latest`

所有平台只下载版本号**严格大于** `2.02.2607152` 的安装包；比较无点号版本时门槛为 `2022607152`。`stable` 在满足门槛的候选中选择最大的 `download_version`，并把 `from` 改为 `skillauto`；没有合格稳定版时改选更高版本的开发版。`latest` 选择满足门槛且版本号最大的开发版。macOS 只允许下载 `.pkg`；若稳定版重定向最终指向 `.dmg`，拒绝该链接并从页面配置中改选版本更高的 `.pkg`。不要猜测或拼接未在官方下载配置中出现的链接。

## 主动下载

脚本只依赖 Node.js 内置模块。在本 skill 目录执行：

```bash
node skills/installer/scripts/resolve-download.mjs --channel stable
```

脚本会：

1. 获取官方下载页及页面加载的脚本
2. 从页面脚本定位下载配置
3. 根据用户意图只接受稳定版或最新开发版的规定链接前缀
4. 按本机系统与架构筛选，并排除版本号不大于 `2.02.2607152`（`2022607152`）的安装包
5. 稳定版将查询参数 `from` 改为 `skillauto`
6. macOS 探测重定向最终文件；非 `.pkg` 时改选更高版本的官方 `.pkg`

架构优先级：

| 系统 | 架构 | `type` |
|------|------|--------|
| macOS | Apple Silicon / arm64 | 优先 `darwin_arm64`，兼容 `darwin_arm` |
| macOS | Intel / x64 | `darwin_x64` |
| Windows | x64 | `win32_x64` |
| Windows | x86 | `win32_ia32` |

以下载配置中的实际 `type` 为准，不因固定映射与页面不一致而改写官方下载链接。

稳定版仅输出 URL：

```bash
node skills/installer/scripts/resolve-download.mjs --channel stable --url-only
```

用户要求最新开发版或最新版时：

```bash
node skills/installer/scripts/resolve-download.mjs --channel latest
# 仅输出 URL
node skills/installer/scripts/resolve-download.mjs --channel latest --url-only
```

拿到 URL 后，下载到用户指定目录；未指定时使用系统 Downloads 目录。把 shell 工作目录切换到目标目录后执行：

```bash
curl --fail --location --remote-header-name --remote-name "<resolvedUrl>"
```

下载完成后报告安装包绝对路径、版本、渠道和架构。用户只要求下载时不要自动运行安装包；用户明确要求安装或更新时，再启动安装包并说明需要完成的系统确认。

## 手动下载

打开：

```text
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
```

根据本机选择 macOS Apple Silicon、macOS Intel 或 Windows x64。macOS 只选择 `.pkg`，不要下载 `.dmg`。稳定版适合日常使用；用户要求最新版或开发版时选择开发版，不要误选预发布版。

如果不能直接打开浏览器，返回可点击链接并清楚写出应选择的系统、架构和版本。

## 更新场景

更新与首次下载使用相同的选包规则。不要仅因本机已有旧版本就降低 `download_version`；下载完成后提示用户退出正在运行的微信开发者工具，再运行安装包覆盖更新。

`agent_ahead` 时：

1. 先确认失败与旧版开发者工具缺少对应工具、参数或能力直接相关；不要把普通业务错误归因于版本。
2. 建议用户尝试更新，并说明原任务卡在哪项兼容能力；用户同意后再按本 scene 规则解析和下载安装包。
3. 用户暂不更新时，保留具体兼容性问题作为 blocker，不要只写 `agent_ahead`。

不得把 agent 侧 skill 复制、覆盖或写回微信开发者工具安装目录。内置 skill 只能随开发者工具安装包更新；更新完成后，如需对齐 agent 侧内容，只能从新安装目录返回的 `skillPath` 单向导入到 agent。

安装完成后先重新执行 `check-installation.mjs`；只有 `compatible: true` 才进入根 SKILL 的登录与 skill 版本检查。再执行一次 `check_wechatide_status --skill-version <skillVersion>`，确认 `loginExpired: false` 后返回原业务 scene 重试一次。`versionRelation: equal` 可直接继续，仍为 `agent_ahead` 时按根 SKILL 的兼容规则继续尝试。若新版本已安装但命令仍不存在，保留 `cli_unavailable` blocker 并提示检查 PATH；不要循环重复下载安装。

## 失败处理

- 页面、脚本或下载配置请求失败：转手动下载
- 参数缺失或 `channel` 不是 `stable` / `latest` / `nightly`：修正参数后重试一次
- 没有版本号严格大于 `2.02.2607152` 的匹配安装包：不要下载，转手动下载并说明最低版本要求
- 没有对应系统/架构的官方重定向链接：转手动下载并说明缺少的目标
- 稳定版链接不以 `https://servicewechat.com/wxa-dev-logic/download_redirect` 开头：拒绝下载
- 最新开发版链接不以 `https://devtools.wxqcloud.qq.com.cn/WechatWebDev/nightly/` 开头：拒绝下载
- macOS 候选是 `.dmg`，且页面配置中没有版本更高的 `.pkg`：不要下载，转手动下载并说明原因
- 下载中断：保留错误信息，允许重试；不要把部分文件声称为成功安装包
- Linux 或其他未提供桌面安装包的平台：不要选择 Windows/macOS 包，改为提供官方下载页
