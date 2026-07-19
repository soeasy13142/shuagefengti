# DH 密钥交换 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`dh-viz` 占位）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **Diffie-Hellman 密钥交换**的可视化教学页面：用户设定公共参数（素数 p、本原根 g），模拟 Alice 和 Bob 双方从生成私钥 → 计算公钥 → 交换公钥 → 得到共享密钥的完整过程，并展示离散对数计算的难度。帮助密码学学习者理解 DH 密钥交换的核心思想。

## 2. 范围

包含：
- 完整 DH 密钥交换流程动画（Alice + Bob 双边视图）
- 公共参数 p（素数）和 g（模 p 的本原根）可调
- 私钥随机生成（或手动指定），公钥自动计算（快速幂）
- 共享密钥一致性验证（双方独立计算的结果对比）
- 离散对数难度演示：给定 g、p、公钥 A，暴力搜索私钥 a 的步骤数
- 中间人攻击（MITM）模拟：Eve 拦截并篡改公钥

不包含（明确不做）：
- 椭圆曲线 Diffie-Hellman（ECDH，进 backlog）
- 认证 / 数字签名（DH 本身不防 MITM，本页通过 MITM 模拟来教学）
- 实际密钥派生（KDF），直展示裸共享密钥 `g^(ab) mod p`
- 大数运算（p ≤ 997，与 RSA 一致的小素数演示限制）
- 群论理论证明（仅展示计算层面）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/dh-viz/dh-viz.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/dh-core.js` | 新增 | 纯函数：本原根判定、快速幂、密钥交换、离散对数暴力搜索 |
| `utils/dh-mitm.js` | 新增 | MITM 模拟步骤生成 |
| `utils/tool-registry.js` | 修改 | `dh-viz.available = true` |
| `app.json` | 修改 | 注册 `pages/dh-viz/dh-viz` |
| `tests/utils/dh-core.test.js` | 新增 | 单测 |
| `docs/handoff/modules/dh-viz.md` | 新增 | 模块文档 |

## 4. 核心交互

**顶部参数区：**

```
┌────────────────────────────────────────────────────┐
│ 公共参数                                            │
│ 素数 p: [ 997 ]   (内置素数下拉 ▾)                  │
│ 本原根 g: [  7 ]  (自动计算可供选择的本原根列表 ▾)   │
│ 场景: [正常交换 ▾] | [MITM 攻击 ▾]                  │
│ [▶ 开始交换] [↻ 重置] [⏸ 暂停]                     │
└────────────────────────────────────────────────────┘
```

- 选择 p 后自动计算并列出所有模 p 的本原根供选择
- 场景切换：正常交换 / MITM 攻击

**主视图 — 双方面板：**

```
┌───────── Alice ─────────┐  ┌────────── Bob ─────────┐
│                          │  │                         │
│  私钥 a: [ 123 ]  [🎲]   │  │  私钥 b: [ 456 ]  [🎲]  │
│  公钥 A = g^a mod p      │  │  公钥 B = g^b mod p      │
│        = 7^123 mod 997   │  │        = 7^456 mod 997   │
│        = 312              │  │        = 889             │
│                          │  │                         │
│  ┌─── 收到的公钥 ───┐   │  │  ┌─── 收到的公钥 ───┐   │
│  │  B = 889         │   │  │  │  A = 312         │   │
│  └──────────────────┘   │  │  └──────────────────┘   │
│                          │  │                         │
│  共享密钥 K = B^a mod p  │  │  共享密钥 K = A^b mod p  │
│            = 889^123     │  │            = 312^456     │
│            = 587         │  │            = 587         │
│                          │  │                         │
│  ✅ 双方密钥一致!        │  │  ✅ 双方密钥一致!       │
└──────────────────────────┘  └─────────────────────────┘
```

- 私钥可手动输入（1 < a,b < p-1）或点击 🎲 随机生成
- 每步计算的模幂展开面板（同 rsa-calc 的快速幂过程展示）
- MITM 场景：中间出现 Eve 面板，显示拦截和伪造公钥

**步进动画 — 连接线：**

```
  Alice ─── A=312 ──────→ Bob        (Alice 发送公钥)
  Alice ←── B=889 ─────── Bob        (Bob 发送公钥)
  Alice ─── K=587 ──────→ Bob (验证) (双方计算共享密钥)
```

- 报文流动画：公钥交换阶段用蓝色箭头，MITM 场景红色虚线箭头
- 每步下方显示当前步骤的文案说明

**底部 — 离散对数演示面板（可折叠）：**

```
┌────────────────────────────────────────────────────┐
│ ▼ 离散对数难度                                     │
│  已知: g=7, p=997, A=312                           │
│  求 a: 暴力搜索 g^? ≡ 312 (mod 997)               │
│  ┌────────────────────────────────────────────┐    │
│  │ 7^1=7  7^2=49  7^3=343  7^4=410  ... 跳过│    │
│  │ 7^120=830  7^121=804  7^122=634  7^123=312│    │
│  │                                         ✓  |    │
│  │ 搜索次数: 123/996  (12.4%)                     │    │
│  │ ████████░░░░░░░░░░░░░░░░░░░░                │    │
│  └────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

- 展示暴力搜索的实际迭代过程
- 进度条显示搜索进度
- 文案提示：p 增大时搜索空间指数增长（参考行）

## 5. 数据模型 / 核心逻辑

```js
// 公共参数
{
  p: number,        // 素数
  g: number,        // 模 p 的本原根
}

// 参与者状态
{
  name: 'Alice' | 'Bob' | 'Eve',
  privateKey: number,           // 私钥
  publicKey: number,            // 公钥 = g^priv mod p
  receivedPublicKey: number,    // 收到的对方公钥
  sharedKey: number,            // 共享密钥 = received^priv mod p
}

// 交换步骤
{
  step: number,
  from: string,
  to: string,
  type: 'generateKey' | 'sendPublicKey' | 'computeSharedKey' | 'mitmIntercept',
  payload: {
    key?: number,
    explanation: string
  },
  mitm?: boolean
}

// 离散对数搜索结果
{
  givenG: number, givenP: number, givenA: number,
  foundX: number | null,
  attempts: number,
  totalSpace: number,           // p-1
  steps: { x: number, result: number }[]  // 用于动画展示
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| p 不是素数 | 下拉列表只含素数，手动输入非法时 toast 提醒 |
| g 不是模 p 的本原根 | 下拉列表只含有效本原根 |
| 私钥 a/b ≥ p | 输入校验 + clamp 到 [2, p-2] |
| 私钥 a/b ≤ 1 | 校验后 toast "私钥需大于 1" |
| g^a mod p 计算 | 复用 rsa-core 的 modPow (快速幂) |
| MITM 场景下 Alice/Bob 密钥不一致 | 故意为之：MITM 演示时密钥一定不一致，显示 ⚠️ 警告 |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/dh-core.test.js` | 本原根判定（已知小素数）、快速幂正确性、完整 DH 交换（多组 p/g）、共享密钥双方一致、离散对数暴力搜索（已知小空间） |

关键测试用例：

```js
test('DH full exchange produces matching keys', () => {
  const p = 997, g = 7
  const aliceKey = dhGenerateKeypair(p, g, 123)   // a=123
  const bobKey = dhGenerateKeypair(p, g, 456)      // b=456
  // 交换公钥
  const aliceShared = modPow(bobKey.publicKey, aliceKey.privateKey, p)
  const bobShared = modPow(aliceKey.publicKey, bobKey.privateKey, p)
  expect(aliceShared).toBe(bobShared)              // 双方一致
})

test('primitive root detection', () => {
  expect(isPrimitiveRoot(2, 13)).toBe(true)    // 2^12 ≡ 1, 2^6≠1, 2^4≠1, 2^3≠1, 2^2≠1
  expect(isPrimitiveRoot(3, 13)).toBe(false)   // 3^3 ≡ 1 mod 13
  expect(isPrimitiveRoot(6, 13)).toBe(false)
  expect(isPrimitiveRoot(7, 13)).toBe(false)
})
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. **风格统一**：Claude Design 暖奶油画布。
2. **纯函数优先**：`dh-core.js` / `dh-mitm.js` 无副作用。
3. **复用 modPow**：与 `rsa-core.js` 共享快速幂实现（提取到 `utils/modular-arithmetic.js` 或直接复用）。
4. **本原根判定**：对素数 p，遍历 g^(p-1)/q ≠ 1 对 p-1 的每个素因子 q。
5. **MITM 教学价值**：展示 Eve 拦截 A、替换为 E_a、拦截 B、替换为 E_b 的过程，最终 Alice 与 Eve 共享 K_ae、Bob 与 Eve 共享 K_be，Alice 和 Bob 无法直接通信。
6. **动画规范**：交换过程的箭头动画用 WXML `animation` + WXSS `transition` 300ms。
7. **更新 PROJECT_HANDOFF**：完成时追加。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| 本原根判定对 p-1 的因子分解 | p ≤ 997，暴力枚举因子即可 |
| 学生误以为 DH 可防 MITM | MITM 场景专门展示不安全之处，并提示"实际中需要认证" |
| modPow 与 rsa-calc 重复 | 决定是否提取公共 `utils/modular-arithmetic.js` |

未来可拓展：
- ECDH（椭圆曲线 DH）
- 与 TLS-viz 集成（展示 DH 在 TLS 1.3 中的 key_share）
- 静态-静态 DH /  ephemeral DH 模式对比
- 群参数的安全强度可视化（p 位数 vs 破解难度）
