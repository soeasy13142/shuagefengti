# 密码工具箱 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec → 已实现
> 状态：**全部实现**
> 关联：`utils/tool-registry.js`（`crypto-tools` 占位）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **密码工具箱**：集成凯撒密码、维吉尼亚密码、栅栏密码三种古典密码的加密 / 解密 / 暴力破解功能，展示字母频率分析和移位规律。帮助密码学初学者理解古典密码的机制与脆弱性。

## 2. 范围

包含：
- ✅ **凯撒密码**：加密/解密，可调移位（1-25），支持字母频率统计 + 暴力破解展示全部 25 种移位结果
- ✅ **维吉尼亚密码**：加密/解密，可密钥，自动对齐密钥循环，支持字母频率分析
- ✅ **栅栏密码**：加密/解密，可调栏数（2-20），支持暴力枚举栏数
- ✅ 明文字母频率统计柱状图（对比标准英文频率）
- ✅ 内置示例文本（"The quick brown fox..." 等多组预设）

不包含（明确不做）：
- 其他古典密码（Atbash、Playfair、Enigma 等，可后续扩展 tab 页）
- 中文输入（仅 ASCII 字母，非字母原样保留）
- 密文自动语言检测（仅英文）
- 维吉尼亚密码的 Kasiski 自动破解（容后迭代）
- 密钥长度自动猜测（仅人工指定密钥）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/crypto-tools/crypto-tools.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/cipher-caesar.js` | 新增 | 凯撒密码纯函数 |
| `utils/cipher-vigenere.js` | 新增 | 维吉尼亚密码纯函数 |
| `utils/cipher-railfence.js` | 新增 | 栅栏密码纯函数 |
| `utils/cipher-freq.js` | 新增 | 字母频率统计 + 柱状图数据生成 |
| `utils/tool-registry.js` | 修改 | `crypto-tools.available = true` |
| `app.json` | 修改 | 注册 `pages/crypto-tools/crypto-tools` |
| `tests/utils/cipher-caesar.test.js` | 新增 | 单测 |
| `tests/utils/cipher-vigenere.test.js` | 新增 | 单测 |
| `tests/utils/cipher-railfence.test.js` | 新增 | 单测 |
| `tests/utils/cipher-freq.test.js` | 新增 | 单测 |
| `docs/handoff/modules/crypto-tools.md` | 新增 | 模块文档 |

## 4. 核心交互

页面用 **Tab 切换** 三种密码模式。 ✅

### 4.1 凯撒密码

```
┌────────────────────────────────────────────────────┐
│  [凯撒]  维吉尼亚  栅栏                            │
├────────────────────────────────────────────────────┤
│  移位: [ 3 ]  [🔓 加密]  [🔒 解密]              │
│  输入: [_________________________________________] │
│  ┌────────────────────────────────────────────┐    │
│  │ HELLO WORLD                                │    │
│  └────────────────────────────────────────────┘    │
│  ── 结果 ──────────────────────────────────────    │
│  ┌────────────────────────────────────────────┐    │
│  │ KHOOR ZRUOG                               │    │
│  └────────────────────────────────────────────┘    │
│  [▼ 暴力破解]                                     │
│  ┌────────────────────────────────────────────┐    │
│  │  Shift 0: HELLO WORLD                      │    │
│  │  Shift 1: IFMMP XPSME                      │    │
│  │  Shift 2: JGNNQ YQTNF                      │    │
│  │  Shift 3: KHOOR ZRUOG  ← 看起来最像英文    │    │
│  │  ...                                       │    │
│  │  Shift 25: GDKKN VNQKC                     │    │
│  └────────────────────────────────────────────┘    │
│  [▼ 字母频率分析]                                  │
│  ┌────────────────────────────────────────────┐    │
│  │  ████ H (14.3%)    ██████ E (12.7% std)   │    │
│  │  ██████ R (12.2%)  ██████ T (9.1% std)    │    │
│  │  ████ L (12.2%)    ...                     │    │
│  └────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

> ✅ 已实现：凯撒密码全部功能（加密/解密/移位调节/暴力破解25行/频率分析）

### 4.2 维吉尼亚密码

```
┌────────────────────────────────────────────────────┐
│  凯撒  [维吉尼亚]  栅栏                            │
├────────────────────────────────────────────────────┤
│  密钥: [  KEY  ]  (仅字母，自动转大写)             │
│  输入: [_________________________________________] │
│  ┌────────────────────────────────────────────┐    │
│  │ ATTACK AT DAWN                            │    │
│  └────────────────────────────────────────────┘    │
│  ── 过程 ──────────────────────────────────────    │
│  密钥循环: KEYKEYKEYKEY...                          │
│  字母偏移对照:                                      │
│    A(0)+K(10)=K(10)    T(19)+E(4)=X(23)           │
│    T(19)+Y(24)=R(17)   A(0)+K(10)=K(10)           │
│    ...                                             │
│  ── 结果 ──────────────────────────────────────    │
│  ┌────────────────────────────────────────────┐    │
│  │ KXJEYK KD KDMW                             │    │
│  └────────────────────────────────────────────┘    │
│  [🔓 加密] [🔒 解密]                              │
└────────────────────────────────────────────────────┘
```

> ✅ 已实现：维吉尼亚密码（加密/解密/密钥输入/密钥循环显示/偏移对照表）
> ✅ 已实现：维吉尼亚频率分析（可折叠面板，范围属性支持）



- 密钥字母对应移位数：A=0, B=1, ..., Z=25
- 偏移对照表逐字母展示 ✅
- 非字母字符保留不变，不参与偏移

### 4.3 栅栏密码

```
┌────────────────────────────────────────────────────┐
│  凯撒  维吉尼亚  [栅栏]                            │
├────────────────────────────────────────────────────┤
│  栏数: [ 3 ]  [🔓 加密]  [🔒 解密]              │
│  输入: [_________________________________________] │
│  ┌────────────────────────────────────────────┐    │
│  │ WE ARE DISCOVERED FLEE AT ONCE             │    │
│  └────────────────────────────────────────────┘    │
│  ── 栅栏结构 ──────────────────────────────────    │
│  W . . . E . . . C . . . E . . . E . . . N .     │
│  . E . A . D . S . O . V . R . F . L . A . O .   │
│  . . R . . . I . . . D . . . T . . . C . . . E   │
│  ── 结果 ──────────────────────────────────────    │
│  ┌────────────────────────────────────────────┐    │
│  │ WECREE...                                  │    │
│  └────────────────────────────────────────────┘    │
│  [▼ 暴力枚举栏数]                                  │
│  ┌────────────────────────────────────────────┐    │
│  │  栏数 2: ...                               │    │
│  │  栏数 3: ...  ← 看起来正确                  │    │
│  │  栏数 4: ...                               │    │
│  │  ...                                       │    │
│  └────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

- 栅栏加密的"锯齿"结构用点阵 `.` 表示空格占位 ✅
- 暴力枚举栏数 2-20，显示所有结果供用户判断 ✅

## 5. 数据模型 / 核心逻辑

```js
// 凯撒
function caesarEncrypt(text: string, shift: number): string
function caesarDecrypt(text: string, shift: number): string
function caesarBruteForce(text: string): { shift: number, result: string }[]

// 维吉尼亚
function vigenereEncrypt(plaintext: string, key: string): string
function vigenereDecrypt(ciphertext: string, key: string): string
// 过程记录
{
  keyRepeated: string,  // 循环后的密钥
  offsets: number[],     // 每个字母的偏移量
  mapping: { input: string, keyChar: string, offset: number, output: string }[]
}

// 栅栏
function railFenceEncrypt(text: string, rails: number): string
function railFenceDecrypt(text: string, rails: number): string
function railFenceBruteForce(text: string): { rails: number, result: string }[]
// 栅栏结构
{
  rails: number,
  grid: (string | null)[][],  // rail × len, null = 空格占位
  readingOrder: number[]       // 按行读取的索引顺序
}

// 频率统计
{
  totalLetters: number,
  frequencies: { letter: string, count: number, pct: number }[],
  // 26 项，按字母顺序
  standardFreq: { letter: string, pct: number }[]
  // 标准英文频率参考 (ETAOIN SHRDLU...)
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 空输入 | toast "请输入文本" |
| 凯撒移位 ≤0 或 ≥26 | 输入校验，clamp 到 [1, 25] |
| 维吉尼亚密钥含非字母 | 密钥中非字母自动忽略 + toast "密钥已忽略非字母字符" |
| 密钥为空 | toast "请输入密钥" |
| 栅栏栏数 <2 | clamp 到 2 |
| 输入文本过长（>5000 字符） | toast "输入过长，请缩减"（性能限制） |
| 解密时密文格式异常 | 解密函数保持幂等性（`decrypt(encrypt(x)) === x`） |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/cipher-caesar.test.js` | 加密/解密正确性（shift=3 经典 case）、暴力破解返回 25 项、非字母字符保留、移位回绕（Z+3→C） |
| `tests/utils/cipher-vigenere.test.js` | 已知向量加密/解密、密钥循环正确性、大小写处理、非字母保留、加密后解密恢复原文 |
| `tests/utils/cipher-railfence.test.js` | 加密/解密已知向量（rails=3/4/5 经典示例）、暴力枚举、加密后解密恢复原文、单字符输入 |
| `tests/utils/cipher-freq.test.js` | 频率统计总和=100%、标准英文频率数据正确性、空字符串/纯空格 |

关键测试用例：

```js
// 凯撒
test('Caesar shift=3', () => {
  expect(caesarEncrypt('HELLO', 3)).toBe('KHOOR')
  expect(caesarDecrypt('KHOOR', 3)).toBe('HELLO')
})
test('Caesar preserves non-alpha', () => {
  expect(caesarEncrypt('HELLO, WORLD!', 3)).toBe('KHOOR, ZRUOG!')
})

// 维吉尼亚
test('Vigenere classic example', () => {
  expect(vigenereEncrypt('ATTACKATDAWN', 'LEMON')).toBe('LXFOPVEFRNHR')
  expect(vigenereDecrypt('LXFOPVEFRNHR', 'LEMON')).toBe('ATTACKATDAWN')
})

// 栅栏
test('Rail fence rails=3', () => {
  const text = 'WEAREDISCOVEREDFLEEATONCE'
  const encrypted = railFenceEncrypt(text, 3)
  expect(encrypted).toBe('WECRLTEERDSOEEFEAOCAIVDEN')
  expect(railFenceDecrypt(encrypted, 3)).toBe(text)
})

// 频率
test('frequency sums to 100%', () => {
  const freq = analyzeFrequency('HELLO WORLD')
  const total = freq.reduce((s, f) => s + f.pct, 0)
  expect(total).toBeCloseTo(100, 1)
})
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. **风格统一**：Claude Design 暖奶油画布。 ✅
2. **纯函数优先**：所有 cipher-* 模块无副作用。
3. **字母处理**：统一转大写、仅 A-Z 参与运算、非字母保留原位置和大小写。
4. **频率柱状图**：用纯 WXML View 渲染（width% 表示比例），不引入图表库。
5. **Tab 切换**：页面内 3 个 Tab 用 `wx:if` / `wx:elif` 切换，不占独立页面路由。
6. **暴力破解结果**：凯撒 25 行 + 栅栏 19 行（栏数 2-20），用 scroll-view 包裹避免页面溢出。
7. **预设文本**：内置 3-5 组预设下拉（如 "The quick brown fox..."、"I came I saw I conquered"），方便直接体验。
8. **更新 PROJECT_HANDOFF**：完成时追加。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| 维吉尼亚密钥循环对齐复杂 | TDD 覆盖 edge case（密钥比文本长、密钥含空格） |
| 栅栏解密索引计算易错 | 严格对照已知向量测试 |
| 频率柱状图性能（长文本） | 限制输入 ≤ 5000 字符 |

未来可拓展：
- Atbash 密码
- Playfair 密码（5×5 矩阵）
- 维吉尼亚 Kasiski 自动破解（猜测密钥长度 → 频率分析 → 推导密钥）
- 仿射密码（Affine cipher）
- 词频 / n-gram 评分辅助判断暴力破解结果
- 中文古典密码（如反切码）
