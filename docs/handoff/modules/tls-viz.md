# TLS 动画机 — 模块文档

**上线日期:** 2026-07-22

## 概述

TLS 1.3 握手协议可视化教学工具，step-by-step 展示 3 种握手场景的完整流程。

## 页面

`pages/tls-viz/tls-viz`

## 核心逻辑

| 文件 | 说明 |
|---|---|
| `utils/tls-handshake.js` | 3 种场景的手握步骤序列生成（full/psk/mitm） |
| `utils/tls-crypto.js` | ECDHE 模拟 + HKDF 密钥派生（简化版） |
| `utils/tls-data.js` | TLS 1.3 预设数据（密码套件、群组、证书模板） |

## 交互

- 下拉选择握手场景（初次握手 / PSK 恢复 / 中间人警告）
- ▶ 播放自动走完全部步骤 / ⏸ 暂停 / ◀ 上一步 / ⟩⟩ 下一步
- ↻ 重置场景
- 每一步显示报文类型、方向、关键字段列表
- 密钥派生步骤展示 ECDHE → HKDF → 4 组对称密钥 + IV
- 证书步骤展示证书链层级结构
- 每个步骤附带面试考点提示

## 场景

| 场景 | 步骤数 | 说明 |
|---|---|---|
| full (初次握手) | 12 | ClientHello → ServerHello → EncryptedExts → Certificate → CertVerify → Finished → 密钥派生 → 应用数据 |
| psk (PSK 恢复) | 8 | 基于 Pre-Shared Key 的快速恢复，跳过证书交换 |
| mitm (中间人警告) | 7 | 证书不匹配 → Bad Certificate Alert → 握手终止 |

## 测试

`tests/utils/tls-handshake.test.js` — step 生成覆盖 3 种场景、字段完整性、label 匹配。
`tests/utils/tls-crypto.test.js` — 密钥派生函数结果结构、幂等性。
