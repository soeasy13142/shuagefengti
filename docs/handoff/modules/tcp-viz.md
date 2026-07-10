# TCP 状态机动画（TCP Visualization）

> 本节在 `PROJECT_HANDOFF.md` 中**没有对应章节**，由本整理任务基于 `pages/tcp-viz/` + `utils/tcp-states.js` 实际代码补写。

## 概览

交互式展示 TCP 状态机迁移，配合三次握手、四次挥手、数据传输（含滑动窗口与快重传）的逐步骤动画。

## 数据驱动（utils/tcp-states.js）

状态转换表 + 步骤生成器都是纯函数，无副作用，便于测试。

**TCP 状态**（共 10 个）：

| 状态 | 颜色 |
|---|---|
| `CLOSED` | 灰 `#9ca3af` |
| `LISTEN` | 蓝 `#60a5fa` |
| `SYN_SENT` | 黄 `#f59e0b` |
| `SYN_RCVD` | 黄 `#f59e0b` |
| `ESTABLISHED` | 绿 `#34d399` |
| `FIN_WAIT_1` | 橙 `#f97316` |
| `FIN_WAIT_2` | 橙 `#f97316` |
| `TIME_WAIT` | 红 `#ef4444` |
| `CLOSE_WAIT` | 紫 `#8b5cf6` |
| `LAST_ACK` | 红 `#ef4444` |

**TCP 标志**：`SYN` / `ACK` / `FIN` / `RST` / `PSH` / `URG`。

## 四个场景模式

页面通过 `pages/tcp-viz/tcp-viz.js` 选择场景，调用以下导出函数：

| 场景 | 函数 | 步数 |
|---|---|---|
| 三次握手 | `getHandshakeSteps()` | 3 |
| 四次挥手 | `getTeardownSteps()` | 4 |
| 数据传输（正常） | `getDataTransferSteps(generateDataScenario('normal'))` | 8（4 报文 + 4 ACK） |
| 数据传输（丢包 + 快重传） | `getDataTransferSteps(generateDataScenario('loss'))` | 7（含 3 个重复 ACK + 超时重传） |
| 完整生命周期 | `getFullConnectionSteps()` | 3 + 8 + 4 = 15 步 |

## 步骤字段

每步骤对象结构：

```js
{
  step: number,
  type: 'handshake' | 'teardown' | 'data' | 'full',
  name: '第一次握手',
  direction: 'client→server',
  flags: { SYN: true, ACK: false, ... },
  seq: 100, ack: 101,
  clientState: { from: 'CLOSED', to: 'SYN_SENT' } | null,
  serverState: { from: 'LISTEN', to: 'SYN_RCVD' } | null,
  explanation: '...',
  highlight: ['SYN', 'seq'],
  examTip: '面试高频提示'   // 可选
}
```

## 丢包场景特色

`loss` 场景演示：
- 4 个报文段（seq 100/200/300/400），第 2 个丢失
- 接收方累计确认 ACK=200（因为 200 缺失）
- 触发 3 个重复 ACK
- 发送方快重传 seq=200
- 接收方最终返回 ACK=500
- 字段 `examTip` 提供面试高频考点（快重传 / 快恢复 / RTO / TIME_WAIT 等）

## 测试

`utils/tcp-states.js` 是纯函数模块，可独立测试。当前**暂未**为该模块添加 Jest 测试覆盖（见 `future-plans.md` P3 或后续 task）。

## 设计风格

页面已切到 Claude Design 暖奶油画布（参见 `docs/DESIGN.md`）。深色科技风已替换。
