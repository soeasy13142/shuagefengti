# AES 演示 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 阶段：待用户审核
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`aes-viz` 占位）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **AES 加密算法**的可视化教学页面：用户输入 128-bit 明文和密钥，逐轮展示 SubBytes、ShiftRows、MixColumns、AddRoundKey 四个操作，以及密钥扩展（KeyExpansion）的完整过程。帮助密码学学习者理解 AES 的内部结构。

## 2. 范围

包含：
- ✅ AES-128 完整实现（10 轮，FIPS 197 兼容，纯 Number 模拟字节运算）
- ✅ 逐轮状态矩阵（State）的 4×4 字节网格可视化（修改字节高亮）
- ✅ 四步分解显示：SubBytes、ShiftRows、MixColumns、AddRoundKey
- ✅ 密钥扩展：展示从初始密钥生成 10 个轮密钥（W[0..43]）的过程
- ✅ 步进控制：单轮前进 / 后退、跳轮
- ✅ 已知测试向量验证（FIPS 197 Appendix B/C）

不包含（明确不做）：
- AES-192 / AES-256（仅 AES-128，密钥扩展逻辑不同但原理一致）
- GCM / CBC / CTR 等工作模式（仅 ECB 模式，第一版）
- 解密过程（加密的逆向流程，解密可容后在"逆向模式"添加）
- 字节代换表 S-box 的数学构造（GF(2^8) 逆元 + 仿射变换）
- 硬件加速 / WebAssembly

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/aes-viz/aes-viz.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/aes-core.js` | 新增 | AES-128 纯函数实现 |
| `utils/aes-state.js` | 新增 | 状态矩阵操作（State 网格） |
| `utils/aes-key-expansion.js` | 新增 | 密钥扩展（W 数组生成） |
| `utils/tool-registry.js` | 修改 | `aes-viz.available = true` |
| `app.json` | 修改 | 注册 `pages/aes-viz/aes-viz` |
| `tests/utils/aes-core.test.js` | 新增 | 单测（FIPS 197 向量） |
| `docs/handoff/modules/aes-viz.md` | 新增 | 模块文档 |

## 4. 核心交互

页面分为 4 个区域，从上到下展示 AES 单轮的四步操作。

**顶部输入区：**

```
┌───────────────────────────────────────────────────┐
│ 明文 (16 字节 HEX): [ 00112233445566778899... ]   │
│ 密钥 (16 字节 HEX): [ 00010203040506070809... ]   │
│ [▶ 开始] [↻ 重置]  轮次: [◀ 0 / 10 ▶]           │
└───────────────────────────────────────────────────┘
```

- 支持十六进制输入，每 2 字符 = 1 字节，空格可选
- ✅ 内置 3 组预设：FIPS 197 标准向量、"全零"、"全 0xFF"
- ✅ 步进控制器控制当前轮次（0 = AddRoundKey with 初始密钥，1-10 = 完整轮）

**主视图 — 状态矩阵 4×4 网格：**

```
┌─────────────── 当前轮: AddRoundKey ───────────────┐
│                                                    │
│   ┌────┬────┬────┬────┐                            │
│   │ 00 │ 44 │ 88 │ cc │    State 4×4 字节         │
│   ├────┼────┼────┼────┤    每个格子 = 2 hex 字符   │
│   │ 11 │ 55 │ 99 │ dd │                            │
│   ├────┼────┼────┼────┤    当前轮操作高亮：        │
│   │ 22 │ 66 │ aa │ ee │    █ 被修改的字节           │
│   ├────┼────┼────┼────┤    █ 参与计算的字节         │
│   │ 33 │ 77 │ bb │ ff │                            │
│   └────┴────┴────┴────┘                            │
│                                                    │
│   SubBytes  ShiftRows  MixColumns  AddRoundKey     │
│     [✓]       [✓]        [→]        [ ]            │
│                                                    │
│   SubBytes ❯ 每个字节查 S-box 替换                  │
│   00 → 63    44 → 1c    88 → c4    cc → 4b         │
└────────────────────────────────────────────────────┘
```

- ✅ 每轮展开 4 步：当前步高亮显示，已执行的步骤打勾
- ✅ 每一步下方显示操作细节（如 SubBytes 显示每个字节的 S-box 映射）
- ✅ MixColumns 步骤展开显示矩阵乘法过程

**密钥扩展面板（侧边或下方可折叠）：**

```
┌─────────────────────────────────────────────────┐
│ ▼ 密钥扩展 W[0..43]                             │
│  W[0]  00010203 │ W[4]  d6aa74fd │ ...          │
│  W[1]  04050607 │ W[5]  b8af01f0 │              │
│  ...            │                               │
│  每轮使用的轮密钥:                               │
│  Round 1: W[0..3] → AddRoundKey                │
│  Round 2: W[4..7] → 由 RotWord+SubWord+Rcon 生成│
└─────────────────────────────────────────────────┘
```

**底部细节面板：**

```
┌─────────────────────────────────────────────────┐
│ ▼ 当前步展开                                     │
│ MixColumns:                                     │
│  ┌─┐   ┌──────────┐   ┌─┐                      │
│  │s0│   │02 03 01 01│   │s0'│                   │
│  │s1│ = │01 02 03 01│ × │s1'│  (GF(2^8) 乘法)  │
│  │s2│   │01 01 02 03│   │s2'│                   │
│  │s3│   │03 01 01 02│   │s3'│                   │
│  └─┘   └──────────┘   └─┘                      │
│  详细: s0' = (02•s0) ⊕ (03•s1) ⊕ s2 ⊕ s3       │
│       = (02•0x63) ⊕ (03•0x1c) ⊕ 0xc4 ⊕ 0x4b   │
│       = 0xc6 ⊕ 0x54 ⊕ 0xc4 ⊕ 0x4b = 0x89      │
└─────────────────────────────────────────────────┘
```

## 5. 数据模型 / 核心逻辑

```js
// 状态矩阵 (4×4 bytes, 列优先)
type State = number[][]  // state[row][col], 每值 0-255

// AES-128 密钥
type Key = number[]      // 16 bytes

// 轮密钥
type RoundKey = number[] // 16 bytes (4 words × 4 bytes)

// 单轮 Trace
{
  round: number,          // 0-10
  before: State,          // 本轮开始前状态
  afterSubBytes: State,
  afterShiftRows: State,
  afterMixColumns: State, // round 0 无 MixColumns
  afterAddRoundKey: State,
  roundKey: RoundKey,
  detail: {
    subBytes?:  [{ row, col, before, after, sboxValue }],
    shiftRows?: [{ row, shift }],
    mixColumns?: [{ col, matrix, result }]
  }
}

// 密钥扩展 Trace
{
  words: number[][]       // W[0..43], 每 word 4 bytes
  steps: [{
    index: number,         // word index
    type: 'direct' | 'rotSubRcon',  // 4 的倍数时有 RotWord+SubWord+Rcon
    input: number[],
    output: number[],
    rcon?: number
  }]
}
```

## 6. 错误处理

> ✅ **已实现**：Hex 输入校验、非法字符检测、轮次 clamp、GF(2^8) 溢出掩码处理

| 场景 | 处理 |
|---|---|
| 密钥/明文非 32 hex 字符 | 输入校验 + toast "请输入 32 个十六进制字符" |
| 输入含非法 hex 字符 | 红色边框 + toast "包含非法十六进制字符" |
| 手动输入非 0x00-0xFF 范围 | 输入校验 + 标红 |
| 步进到非法轮次（<0 或 >10） | clamp 到 [0, 10] |
| MixColumns 的 GF(2^8) 乘法 x * 0x02 溢出 | `(x << 1) ^ (x & 0x80 ? 0x1b : 0)` 掩码处理 |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/aes-core.test.js` | FIPS 197 Appendix B 已知向量：明文 `00112233445566778899aabbccddeeff`、密钥 `000102030405060708090a0b0c0d0e0f` → 密文 `69c4e0d86a7b0430d8cdb78070b4c55a`；每轮中间状态匹配 Appendix C；空输入边界 |

关键测试用例：

```js
test('AES-128 FIPS 197 Appendix B', () => {
  const plaintext = hexToBytes('00112233445566778899aabbccddeeff')
  const key = hexToBytes('000102030405060708090a0b0c0d0e0f')
  const ciphertext = aesEncrypt(plaintext, key)
  expect(bytesToHex(ciphertext)).toBe('69c4e0d86a7b0430d8cdb78070b4c55a')
})

test('KeyExpansion first round key', () => {
  const key = hexToBytes('000102030405060708090a0b0c0d0e0f')
  const w = keyExpansion(key)
  // W[0] = 00010203, W[1] = 04050607, W[2] = 08090a0b, W[3] = 0c0d0e0f
  expect(w[0]).toEqual([0x00, 0x01, 0x02, 0x03])
  expect(w[4]).toEqual([0xd6, 0xaa, 0x74, 0xfd]) // FIPS 197
})
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. ✅ **风格统一**：Claude Design 暖奶油画布。
2. **纯函数优先**：所有 aes 模块无副作用。
3. **GF(2^8) 乘法**：预先计算 `xtime(x)`（×2）表，×3 = ×2 ⊕ x，避免实时循环。
4. **S-box**：硬编码 256 字节数组（FIPS 197 Figure 7），不运行时计算。
5. **State 列优先**：严格遵循 FIPS 197 的列优先约定（`state[row][col]`），保证 ShiftRows 语义正确。
6. **动画规范**：状态矩阵格子的值变化用 WXSS `transition` 200ms 淡入。
7. **更新 PROJECT_HANDOFF**：完成时追加。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| GF(2^8) 乘法实现错误 | FIPS 197 已知向量严格验证 |
| State 行列顺序混淆 | 每步 trace 与 FIPS 197 Appendix C 逐字节对照 |
| S-box 录入错误 | 对照 FIPS 197 Figure 7 逐行校验 |

未来可拓展：
- AES-192 / AES-256
- 解密过程（逆向四步）
- GCM / CBC / CTR 工作模式动画
- S-box 数学构造展示（GF(2^8) 逆元 + 仿射变换）
- 侧信道攻击教学场景（简单功耗分析）
