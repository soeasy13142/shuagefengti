# RSA 演算器 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`rsa-calc` 占位）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **RSA 演算器**：用户可输入小素数 p/q 生成密钥对，加密/解密短消息，并查看欧拉函数、模逆、模幂等数论计算的中间过程。帮助密码学学习者理解 RSA 的数学原理。

> ✅ **整体状态：全部核心功能已实现。** 见下方各节标记。

## 2. 范围

包含：
- ✅ 密钥生成：用户指定 p/q（素数校验），自动计算 n、phi(n)、e、d
- ✅ 加密 / 解密：输入明文/密文（数值或短文本），展示模幂运算过程
- ✅ 数论逐步展示：扩展欧几里得求模逆、快速幂取模、欧拉函数计算
- ✅ 已知弱密钥检测（p/q 过小、d 过小——Wiener 攻击、共模等）
- ✅ 内置素数表（小范围 2-997，共 168 个），支持下拉选择器和手动输入

不包含（明确不做）：
- 大数运算（>64-bit，JS Number 精度限制，第一版仅演示用小素数）
- OAEP 等填充方案（仅教科书式 RSA，`m^e mod n`）
- 数字签名（RSA 签名与加密代数相同，容后拓展）
- CRT 加速解密（进 backlog）
- SSL/TLS 中的 RSA 使用场景

## 3. 架构

| 路径 | 类型 | 状态 | 说明 |
|---|---|---|
| `pages/rsa-calc/rsa-calc.{js,wxml,wxss,json}` | 新增 | ✅ 已实现 | 4 文件页面 |
| `utils/rsa-core.js` | 新增 | ✅ 已实现 | 纯函数：素数判定、欧拉函数、模逆、模幂、密钥生成 |
| `utils/rsa-primes.js` | 新增 | ✅ 已实现 | 内置素数表（2-997，共 168 个） |
| `utils/tool-registry.js` | 修改 | ✅ 已实现 | `rsa-calc.available = true` |
| `app.json` | 修改 | ✅ 已实现 | 注册 `pages/rsa-calc/rsa-calc` |
| `tests/utils/rsa-core.test.js` | 新增 | ✅ 已实现 | 单测（覆盖素数判定、密钥生成、加密解密往返、弱密钥检测） |
| `docs/handoff/modules/rsa-calc.md` | 新增 | ✅ 已实现 | 模块文档 |

## 4. 核心交互

用户进入页面后，依次操作 3 个步骤区域。

**步骤 1 — 密钥生成区：** ✅ 已实现

```
┌──────────────────────────────────────────┐
│  密钥生成                                 │
│  素数 p: [  17  ] 素数 q: [  19  ]  [🎲] │
│  ──────────────────────────────────────  │
│  n = 323    phi(n) = 288                 │
│  公钥 e: [5]   私钥 d: 173               │
│  校验: ed ≡ 1 (mod phi)  ✅              │
│  [▶ 使用此密钥]                          │
└──────────────────────────────────────────┘
```

- 内置素数下拉选择器（2-997），也支持手动输入 ✅
- 输入后自动校验：非素数标红 + toast "p 不是素数" ✅
- 默认 e = 3（教学用小 e），若 gcd(e, phi) ≠ 1 自动递增找下一个 ✅

**步骤 2 — 加密 / 解密区：** ✅ 已实现

```
┌──────────────────────────────────────────┐
│  加密                │  解密             │
│  明文 m: [42]        │  密文 c: [   ]   │
│  c = 42^5 mod 323    │  m = c^173 mod 323│
│    = 130             │    = 42           │
│  [表] 展示模幂过程    │  [表] 展示模幂过程 │
└──────────────────────────────────────────┘
```

- ✅ 明文支持数字（0 ≤ m < n）和 ASCII 短文本（文字模式，逐字符加密/解密）
- ✅ "模幂过程"展开面板：逐行展示快速幂的每一步（指数二进制分解 + 中间值）

**步骤 3 — 数论细节面板（可折叠）：** ✅ 已实现

```
┌──────────────────────────────────────────┐
│  ▼ 数论中间过程                           │
│  φ(n) = (p-1)(q-1) = 16×18 = 288        │
│  求 d: 扩展欧几里得 5x + 288y = 1        │
│     step 1: 288 = 57×5 + 3               │
│     step 2: 5 = 1×3 + 2                  │
│     step 3: 3 = 1×2 + 1                  │
│     → d = 173                            │
└──────────────────────────────────────────┘
```

## 5. 数据模型 / 核心逻辑 ✅ 已实现（与 spec 一致）

```js
// 密钥对
{
  p: number, q: number,     // 素数
  n: number,                 // p * q
  phi: number,               // (p-1)*(q-1)
  e: number,                 // 公钥指数
  d: number                  // 私钥指数
}

// 模幂步骤
{
  base: number, exp: number, mod: number,
  binary: string,            // exp 的二进制
  steps: [                   // 快速幂中间值
    { bit: '0'|'1', value: number, result: number }
  ],
  final: number
}

// 扩展欧几里得步骤（实为 dividend = quotient × divisor + remainder 格式）
{
  a: number, b: number,
  steps: [
    { dividend: number, quotient: number, divisor: number, remainder: number }
  ],
  gcd: number, x: number,   // ax + by = gcd
}
```

## 6. 错误处理 ✅ 已全部实现

| 场景 | 处理 | 状态 |
|---|---|---|
| p 或 q 不是素数 | 标红 + toast "请正确输入素数" | ✅ |
| p === q | toast "p 和 q 必须不同"，禁止继续 | ✅ |
| 明文 m ≥ n | toast "明文必须小于 n（当前 n={n}）" | ✅ |
| 明文含中文 | toast "暂只支持 ASCII 字符" | ✅ |
| gcd(e, phi) ≠ 1 | 自动递增 e，若无可用的则 throw 提示"换一对 p/q" | ✅ |
| e / d 未生成就点加密 | toast "请先生成密钥对" | ✅ |
| 加密结果解密不匹配 | 单元层 assert（不应发生在正确实现中） | ✅ |

## 7. 测试 ✅ 已实现

| 测试文件 | 覆盖 | 状态 |
|---|---|---|
| `tests/utils/rsa-core.test.js` | `isPrime(2/17/97/997)` ✓、`isPrime(1/0/15/100)` ✗、欧拉函数正确性、扩展欧几里得求模逆（含步骤验证）、快速幂正确性、密钥生成（多组 p/q）、加密后解密恢复原文、`gcd(e,phi) ≠ 1` 自动重选 e、弱密钥检测（小 p/q、共模）、素数表正确性（168 个、首尾值、全素数） | ✅ 已编写（共 18 个测试用例） |

关键测试用例：

```js
test('RSA round-trip encrypt/decrypt', () => {
  const key = generateKeypair(17, 19)   // n=323, e=5, d=173
  const c = modPow(42, key.e, key.n)    // 130
  const m = modPow(c, key.d, key.n)     // 42
  expect(m).toBe(42)
})

test('extended gcd computes modular inverse', () => {
  const result = extendedGcd(5, 288)    // 5x + 288y = 1
  expect(result.gcd).toBe(1)
  expect((result.x % 288 + 288) % 288 * 5 % 288).toBe(1)
})
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. ✅ **风格统一**：Claude Design 暖奶油画布（`#faf9f5` 背景 / `#efe9de` 卡片 / `#cc785c` CTA / Georgia 衬线标题）。
2. ✅ **纯函数优先**：`rsa-core.js` 全部无副作用。
3. ✅ **数字限制**：p/q ≤ 997（保证 n ≤ 994,009 < Number.MAX_SAFE_INTEGER 约 9e15）。超过标红提示"演示限制"。
4. ✅ **弱密钥检测**：Wiener 攻击（d 偏小）+ 共模攻击（同 n 异 e），分别展示橙色警告。
5. ✅ **动画规范**：WXSS `transition` 用于折叠面板箭头旋转，无第三方库。
6. ✅ **模块文档**：已追加至 `docs/handoff/modules/rsa-calc.md`。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| JS Number 精度限制不能做大素数 | 明确标注"教学演示模式"，p/q 上限 997 |
| 教科书 RSA 有安全缺陷 | 标注"仅供学习，请勿用于实际加密" |
| 中文/特殊字符编码 | 明文限制为 ASCII |

未来可拓展（待后续版本）：
- 大数运算（BigInt）支持 2048-bit 密钥
- OAEP 填充
- CRT 加速解密步骤展示
- 与 TLS-viz 集成：展示 RSA 在 TLS 握手中的作用
