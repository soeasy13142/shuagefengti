# TLS 动画机 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`tls-viz.available = false` → `true`）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **TLS 1.3 握手协议** 的可视化教学页面：用户选择一个握手场景，step-by-step 观看从 ClientHello 到证书验证再到密钥派生的完整流程，每步骤展示简化报文内容和状态变化。帮助 CS 学习者直观理解 TLS 如何在不可信网络上建立安全信道。

## 2. 范围

包含：
- TLS 1.3 完整握手链路动画（ClientHello → ServerHello → 证书 → 密钥派生 → Finished）
- 3 种预设场景：初次握手 / 恢复 PSK / 中间人警告
- 每步骤报文 payload 简化展示（CipherSuites、支持的群组、证书链层级、密钥派生参数）
- 密钥生成可视化（ECDHE 共享密钥 → HKDF → 4 组对称密钥 + IV）
- 页面底部的 wbx 关键字段列对比

不包含（明确不做）：
- 真实网络通信（纯模拟动画，无实际加密/解密计算）
- TLS 1.2 或更早版本（聚焦 1.3 以减少状态数）
- 证书链深度验证（仅展示证书层级结构，不做实际签名校验）
- 对抓包功能（如 Wireshark）的替代

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/tls-viz/tls-viz.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/tls-handshake.js` | 新增 | 纯函数：生成握手 step[] |
| `utils/tls-crypto.js` | 新增 | 密钥派生逻辑（ECDHE → HKDF 简化模拟） |
| `utils/tls-data.js` | 新增 | TLS 1.3 预设数据（CipherSuites、群组、证书模板） |
| `utils/tool-registry.js` | 修改 | `tls-viz.available = true` |
| `app.json` | 修改 | 注册 `pages/tls-viz/tls-viz` |
| `tests/utils/tls-handshake.test.js` | 新增 | step 生成、覆盖 3 种场景 |
| `tests/utils/tls-crypto.test.js` | 新增 | 密钥派生广度测试 |
| `docs/handoff/modules/tls-viz.md` | 新增 | 模块专题文档 |

## 4. 核心交互

```
┌─────────────────────────────────────────────────────────┐
│ [初次握手 ▼] [▶ 开始] [⏸ 暂停] [◀ ⟩⟩] [进度 3 / 12]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Client                         Server                  │
│  ┌──────┐                     ┌──────┐                 │
│  │       │ ── ClientHello ──▶ │       │                 │
│  │       │ ◀── ServerHello ── │       │                 │
│  │       │ ◀─ EncryptedExts ─ │       │                 │
│  │       │ ◀── Certificate ── │       │                 │
│  │       │ ◀── CertVerify ─── │       │                 │
│  │       │ ◀── Finished ───── │       │                 │
│  │       │ ──── Finished ───▶ │       │                 │
│  │       │ ═══ Application ═══ ▶       │                 │
│  └──────┘                     └──────┘                 │
│                                                         │
│  当前步骤: ServerHello                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │  version: TLS 1.3                              │    │
│  │  cipher_suite: TLS_AES_128_GCM_SHA256          │    │
│  │  key_share: X25519 (公钥: ab:cd:... )           │    │
│  │ 随机数: e2:3a:...                                │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

用户操作流程：
1. 下拉选择场景（初次握手 / PSK 恢复 / MITM 警告）
2. 点「开始」播放动画，报文从客户端飞向服务器（或反向）
3. 右侧/底部面板同步更新当前步骤的 payload 字段
4. 密钥派生阶段展示 EC 点乘 → HKDF 链条 → 4 组对称密钥
5. 完成时显示「安全连接已建立」摘要

## 5. 数据模型 / 核心逻辑

```js
// 握手步骤
{
  step: number,
  from: 'client' | 'server',
  to: 'client' | 'server',
  type: 'handshake' | 'alert' | 'keyDerive' | 'summary',
  payload: {
    label: string,          // 'ClientHello'
    fields: [               // 字段列表
      { name, value, highlight?: boolean, note?: string }
    ],
    extra?: {               // 扩展信息
      keyLabel?: string,    // 如 'key_share (X25519)'
      certChain?: string[]  // 证书层级列表（证书场景）
    }
  },
  derivedKeys?: {           // 仅在 keyDerive 阶段出现
    handshakeSecret: string,
    serverTrafficKey: string,
    serverTrafficIV: string,
    clientTrafficKey: string,
    clientTrafficIV: string,
    appTrafficKey: string,
    appTrafficIV: string
  },
  explanation: string,
  examTip?: string
}

// 场景预设
{
  id: 'full',              // 初次握手
  steps: 12,
  description: ''
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 场景场景切换时动画进行中 | 重置→重新加载新场景步骤序列 |
| 密钥派生数据量过大 | 字段仅展示前 8 字节 + `...` |
| 播放到中途切换场景 | toast "正在播放，请先重置" |
| PSK 场景无证书 | 跳过 Certificate / CertVerify 步骤，文案标注"PSK 模式无证书交换" |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/tls-handshake.test.js` | 3 种场景 step 生成、step 字段完整性、数量与 label 匹配 |
| `tests/utils/tls-crypto.test.js` | 密钥派生函数结果结构正确（4 组 key+IV）、同一输入幂等 |
