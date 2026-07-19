# NAT 模拟器 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`nat-viz.available = false` → `true`）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **网络地址转换（NAT）** 的可视化教学页面：用户选择一个 NAT 场景，观察内网主机发出的数据包在 NAT 路由器上如何转换源 IP 与端口、如何维护映射表，以及外网响应包如何回送。帮助 CS 学习者理解 NAT 如何解决 IPv4 地址短缺问题以及端口映射的原理。

## 2. 范围

包含：
- SNAT 场景：内网 → 外网（源地址 + 源端口转换）
- DNAT / 端口映射场景：外网 → 内网服务器（目标地址转换 + 端口映射配置）
- NAT 映射表的实时展示（添加 / 超时删除条目动画）
- 3 种预设配置：单台内网主机、多台内网主机共享公网 IP、端口映射（内网 Web 服务器）
- 报文在 3 个区域（内网 / NAT 路由器 / 外网）之间的流向动画

不包含（明确不做）：
- NAPT/PAT 与 Basic NAT 的深度分类讨论（聚焦最常用 NAPT 实现）
- UDP/TCP 超时差异（统一用固定超时 60s 演示）
- NAT 穿透（STUN/TURN/ICE，属于高级专题）
- IPv6 NAT（IPv6 设计上不依赖 NAT）
- 真实网络发包（纯模拟动画）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/nat-viz/nat-viz.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/nat-engine.js` | 新增 | 纯函数：NAT 转换逻辑 |
| `utils/nat-data.js` | 新增 | 预设场景配置 |
| `utils/tool-registry.js` | 修改 | `nat-viz.available = true` |
| `app.json` | 修改 | 注册 `pages/nat-viz/nat-viz` |
| `tests/utils/nat-engine.test.js` | 新增 | SNAT/DNAT 转换、映射表增删 |
| `tests/utils/nat-data.test.js` | 新增 | 场景数据完整性 |
| `docs/handoff/modules/nat-viz.md` | 新增 | 模块专题文档 |

## 4. 核心交互

```
场景: [单台主机外出 ▼] [▶ 开始] [⏸ 暂停] [进度: 5 / 9]

┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  内网         │          │  NAT 路由器    │          │  外网         │
│  192.168.1.2  │          │  192.168.1.1  │          │  203.0.113.5 │
│  端口 40000   │          │  203.0.113.1  │          │  端口 80     │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
       │  (1) src: 192.168.1.2   │                         │
       │      :40000 → :80       │                         │
       │  ────────────────────────────▶                    │
       │                         │  (2) 转换源地址         │
       │                         │  src: 203.0.113.1:50000 │
       │                         │  ────────────────────────────▶
       │                         │     外网响应              │
       │                         │  ◀────────────────────────────
       │                         │  (3) 查映射表 ← 恢复     │
       │  ◀───────────────────────────                       │
       │  dst: 192.168.1.2:40000│                          │
       │                        │                           │

NAT 映射表
┌──────────────────────────────────────────────────────────────┐
│ 协议 │ 内网地址        │ 内网端口 │ 公网端口 │ 外网地址  │ 状态 │
├──────────────────────────────────────────────────────────────┤
│ TCP  │ 192.168.1.2     │ 40000   │ 50000   │ 203.0.113.5│ Active │
└──────────────────────────────────────────────────────────────┘
```

用户操作流程：
1. 选择预设场景（单主机 / 多主机共享 IP / 端口映射）
2. 点击「开始」逐步骤观看报文穿越 3 个区域
3. 每步高亮当前活跃的报文 + 更新 NAT 映射表中的条目
4. 端口映射场景：预先展示路由器的静态映射配置（公网 8080 → 内网 80）
5. 结束时显示 NAT 会话摘要（转换次数、活跃映射数）

## 5. 数据模型 / 核心逻辑

```js
// NAT 转换步骤
{
  step: number,
  zone: 'lan' | 'router' | 'wan',   // 当前所在区
  packet: {
    srcIp: string,
    srcPort: number,
    dstIp: string,
    dstPort: number,
    protocol: 'TCP' | 'UDP',
    direction: 'outbound' | 'inbound'
  },
  translated: {                      // 转换后的报文（仅在路由器区有变化）
    srcIp: string,
    srcPort: number
  },
  tableUpdate: {                     // 映射表变更
    action: 'add' | 'remove' | 'noop',
    entry?: {
      internalIp: string,
      internalPort: number,
      externalPort: number,
      remoteHost: string,
      protocol: 'TCP' | 'UDP',
      timeout: number,
      state: 'Active' | 'Expired'
    }
  },
  explanation: string,
  examTip?: string
}

// 场景预设
{
  id: 'single-host',
  label: '单台主机外出',
  internalNetwork: { subnet: '192.168.1.0/24' },
  externalIp: '203.0.113.1',
  portRange: [50000, 50100],        // 可用公网端口池
  steps: [
    { /* 手动构造的 step 序列 */ }
  ]
}

// 核心转换逻辑
function snat(packet, portPool, mappingTable) {
  // 1. 查找 mappingTable 中是否有已有条目
  // 2. 无 → 从 portPool 分配一个公网端口
  // 3. 写入 mappingTable
  // 4. 返回转换后的 packet + tableUpdate
}

function dnat(packet, portMapping) {
  // 端口映射：查 portMapping 静态表，替换 dstIp/dstPort
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 端口池耗尽（多主机场景） | 展示 "端口耗尽，新连接无法建立" 状态 + 提示 NAPT 限制 |
| 外网发包无对应映射条目 | 展示 "NAT 丢弃：无映射条目" 红色告警 |
| 映射条目超时（60s） | 定时器到后条目消失动画 + 说明 "NAT 超时回收" |
| 端口映射冲突（两个内网主机争用同一映射端口） | 提示 "端口映射冲突，请更换外部端口" |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/nat-engine.test.js` | SNAT 端口分配唯一性、DNAT 端口映射正确、映射表增/删/超时、端口池耗尽处理 |
| `tests/utils/nat-data.test.js` | 3 个场景的 step 数量非空、所有 step 字段完整、端口不重叠 |
