# NAT 模拟器 — 模块文档

**上线日期:** 2026-07-22

## 概述

NAT 模拟器交互式展示网络地址转换过程，支持 SNAT（源地址转换）和 DNAT（端口映射）两种场景。

## 页面

`package-tools/nat-viz/nat-viz`

## 核心逻辑

`utils/nat-engine.js` — SNAT/DNAT 转换 + 端口分配 + 映射表管理，纯函数无副作用。

`utils/nat-data.js` — 3 个预设场景的 step 序列数据。

| 函数 | 说明 |
|---|---|
| `snat(packet, portPool, table, publicIp)` | SNAT 转换：替换源 IP/端口，分配公网端口 |
| `dnat(packet, staticMapping)` | DNAT 端口映射：根据静态映射替换目标 IP/端口 |
| `allocatePort(portPool, usedPorts)` | 从端口池分配一个未使用的端口 |
| `createMappingEntry(internalIp, internalPort, externalPort, remoteHost, protocol)` | 创建映射表条目 |
| `removeExpiredEntries(table, now)` | 移除超时条目 |

## 场景

| 场景 | step 数 | 说明 |
|---|---|---|
| 单台主机外出 | 6 | 内网主机 → NAT → 外网 → 响应回送 |
| 多台主机共享公网 IP | 8 | 两台内网主机同时发出不同协议请求，NAT 用不同端口区分 |
| 端口映射 Web 服务器 | 6 | 外网访问 NAT 公网 IP 的 8080，被转发到内网 80 |

## 交互

- 3 个预设场景一键切换
- ▶ 播放 / ⏸ 暂停 / 步进 / 重置
- 报文在 LAN / NAT 路由器 / WAN 三区间动画移动
- NAT 映射表实时更新条目
- 会话结束时显示摘要（转换次数、活跃映射数）
- 面试考点提示

## 数据约束

- 端口池范围 50000~50100（演示用）
- 映射超时固定 60s
- 所有步骤为预设序列，确保教学内容可控

## 测试

`tests/utils/nat-engine.test.js` — 端口分配 / SNAT / DNAT / 映射表超时管理。
`tests/utils/nat-data.test.js` — 3 个场景数据完整性验证。
