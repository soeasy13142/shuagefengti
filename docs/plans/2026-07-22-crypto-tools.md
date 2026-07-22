# 密码工具箱 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `pages/crypto-tools/` 页面，集成凯撒密码、维吉尼亚密码、栅栏密码三种古典密码的加密/解密/暴力破解功能，展示字母频率分析和移位规律。

**Architecture:** 纯前端 + 4 个 utils 纯函数模块（cipher-caesar / cipher-vigenere / cipher-railfence / cipher-freq）+ 1 个页面（4 文件：js/wxml/wxss/json）。页面内 3 个 Tab 用 `wx:if` / `wx:elif` 切换。Jest 全测。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest + CommonJS（require/module.exports）。

**Spec:** `docs/superpowers/specs/2026-07-19-crypto-tools-design.md`

## Global Constraints

- 所有代码使用 `const`/`let`，**禁用 `var`**
- 文件命名：小写 + kebab-case
- 私有函数：`_underscore` 前缀
- 异步优先：`Promise` / `async-await`
- 错误处理：所有 `catch` 必须显式处理或 `throw`
- 注释：`/** */` JSDoc 用于公开 API；行内 `//` 仅用于 why
- 测试命令：`cd /Users/charliepan/Downloads/my-miniapp && npm test`
- 设计风格：Claude Design 暖奶油画布（`#faf9f5` / `#efe9de` / `#cc785c` / Georgia）
- 不引入第三方依赖
- 中文 UI 文案；变量名/函数名/注释/commit 英文
- **字母处理**：统一转大写，仅 A-Z 参与运算，非字母保留原位置和大小写
- **频率柱状图**：纯 WXML View 渲染（width% 表示比例），不引入图表库
- **Tab 切换**：页面内 3 个 Tab 用 `wx:if` / `wx:elif`，不占独立路由
- **输入上限**：≤ 5000 字符

---

## Task 1: 凯撒密码

**Files:**
- Create: `utils/cipher-caesar.js`
- Test: `tests/utils/cipher-caesar.test.js`

**Interfaces:**
- `caesarEncrypt(text: string, shift: number)`: `string`
- `caesarDecrypt(text: string, shift: number)`: `string`
- `caesarBruteForce(text: string)`: `Array<{ shift: number, result: string }>`（25 项）

**Test vectors:**

```js
caesarEncrypt('HELLO', 3) === 'KHOOR'
caesarDecrypt('KHOOR', 3) === 'HELLO'
caesarEncrypt('HELLO, WORLD!', 3) === 'KHOOR, ZRUOG!'
caesarEncrypt('XYZ', 3) === 'ABC'  // 回绕
caesarBruteForce('KHOOR').length === 25
caesarBruteForce('KHOOR')[3].result === 'HELLO'
```

- [ ] **Step 1: Write failing test**

`tests/utils/cipher-caesar.test.js`:

```js
const { caesarEncrypt, caesarDecrypt, caesarBruteForce } = require('../../utils/cipher-caesar');

describe('caesarEncrypt', () => {
  test('shift=3: HELLO → KHOOR', () => {
    expect(caesarEncrypt('HELLO', 3)).toBe('KHOOR');
  });
  test('preserves non-alpha characters', () => {
    expect(caesarEncrypt('HELLO, WORLD!', 3)).toBe('KHOOR, ZRUOG!');
  });
  test('wraps around Z→C (shift=3)', () => {
    expect(caesarEncrypt('XYZ', 3)).toBe('ABC');
  });
  test('shift=25: B → A', () => {
    expect(caesarEncrypt('B', 25)).toBe('A');
  });
  test('handles empty string', () => {
    expect(caesarEncrypt('', 3)).toBe('');
  });
  test('handles lowercase by preserving case', () => {
    expect(caesarEncrypt('Hello', 3)).toBe('Khoor');
  });
});

describe('caesarDecrypt', () => {
  test('shift=3: KHOOR → HELLO', () => {
    expect(caesarDecrypt('KHOOR', 3)).toBe('HELLO');
  });
  test('round-trip encrypt/decrypt', () => {
    const text = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
    expect(caesarDecrypt(caesarEncrypt(text, 13), 13)).toBe(text);
  });
});

describe('caesarBruteForce', () => {
  test('returns 25 results', () => {
    const results = caesarBruteForce('KHOOR');
    expect(results.length).toBe(25);
    // shift 3 should decrypt to HELLO
    const shift3 = results.find(r => r.shift === 3);
    expect(shift3.result).toBe('HELLO');
  });
  test('brute force all shifts are unique', () => {
    const results = caesarBruteForce('HELLO');
    const unique = new Set(results.map(r => r.result));
    expect(unique.size).toBe(25);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/cipher-caesar.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `utils/cipher-caesar.js`**

包含：
- `caesarEncrypt(text, shift)`: 逐字符处理，A-Z 移位回绕，保留大小写和非字母
- `caesarDecrypt(text, shift)`: encrypt(text, 26 - shift)
- `caesarBruteForce(text)`: shifts [1..25] 的 decrypt 结果

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/cipher-caesar.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/cipher-caesar.js tests/utils/cipher-caesar.test.js
git commit -m "feat(cipher-caesar): 凯撒密码（加密/解密/暴力破解）"
```

---

## Task 2: 维吉尼亚密码

**Files:**
- Create: `utils/cipher-vigenere.js`
- Test: `tests/utils/cipher-vigenere.test.js`

**Interfaces:**
- `vigenereEncrypt(plaintext: string, key: string)`: `string`
- `vigenereDecrypt(ciphertext: string, key: string)`: `string`
- `vigenereWithSteps(plaintext: string, key: string)`: `{ result: string, keyRepeated: string, offsets: number[], mapping: Array<{ input, keyChar, offset, output }> }`

**Test vectors:**

```js
vigenereEncrypt('ATTACKATDAWN', 'LEMON') === 'LXFOPVEFRNHR'
vigenereDecrypt('LXFOPVEFRNHR', 'LEMON') === 'ATTACKATDAWN'
vigenereEncrypt('HELLO', 'KEY') === 'RIJVS'
vigenereEncrypt('hello', 'key') === 'rijvs'  // lowercase preserved
vigenereEncrypt('HELLO, WORLD!', 'KEY') === 'RIJVS, UYVJN!'  // non-alpha preserved
```

- [ ] **Step 1: Write failing test**

`tests/utils/cipher-vigenere.test.js`:

```js
const { vigenereEncrypt, vigenereDecrypt, vigenereWithSteps } = require('../../utils/cipher-vigenere');

describe('vigenereEncrypt', () => {
  test('classic example: ATTACKATDAWN with LEMON → LXFOPVEFRNHR', () => {
    expect(vigenereEncrypt('ATTACKATDAWN', 'LEMON')).toBe('LXFOPVEFRNHR');
  });
  test('key repeats to match text length', () => {
    expect(vigenereEncrypt('AAA', 'KEY')).toBe('KEX');
  });
  test('preserves non-alpha characters', () => {
    expect(vigenereEncrypt('HELLO, WORLD!', 'KEY')).toBe('RIJVS, UYVJN!');
  });
  test('handles empty string', () => {
    expect(vigenereEncrypt('', 'KEY')).toBe('');
  });
  test('converts key to uppercase', () => {
    expect(vigenereEncrypt('HELLO', 'key')).toBe('RIJVS');
  });
  test('ignores non-alpha in key with toast (silently filters)', () => {
    expect(vigenereEncrypt('HELLO', 'KEY123')).toBe('RIJVS');
  });
});

describe('vigenereDecrypt', () => {
  test('LXFOPVEFRNHR with LEMON → ATTACKATDAWN', () => {
    expect(vigenereDecrypt('LXFOPVEFRNHR', 'LEMON')).toBe('ATTACKATDAWN');
  });
  test('round-trip encrypt/decrypt', () => {
    expect(vigenereDecrypt(vigenereEncrypt('HELLO WORLD', 'TEST'), 'TEST')).toBe('HELLO WORLD');
  });
  test('throws on empty key', () => {
    expect(() => vigenereEncrypt('HELLO', '')).toThrow();
  });
});

describe('vigenereWithSteps', () => {
  test('returns keyRepeated and mapping', () => {
    const steps = vigenereWithSteps('ATTACKATDAWN', 'LEMON');
    expect(steps.result).toBe('LXFOPVEFRNHR');
    expect(steps.keyRepeated).toBe('LEMONLEMONLE');
    expect(steps.mapping.length).toBe(12); // 12 characters match text length (ignoring non-alpha)
    expect(steps.offsets.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/cipher-vigenere.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `utils/cipher-vigenere.js`**

包含：
- `_filterKey(key)`: 移除非字母字符，大写，返回纯字母密钥
- `_extendKey(key, length)`: 循环密钥至目标长度
- `vigenereEncrypt(plaintext, key)`: 逐字母加密，非字母保留
- `vigenereDecrypt(ciphertext, key)`: 逐字母解密
- `vigenereWithSteps(plaintext, key)`: 带过程记录

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/cipher-vigenere.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/cipher-vigenere.js tests/utils/cipher-vigenere.test.js
git commit -m "feat(cipher-vigenere): 维吉尼亚密码（加密/解密/过程记录）"
```

---

## Task 3: 栅栏密码

**Files:**
- Create: `utils/cipher-railfence.js`
- Test: `tests/utils/cipher-railfence.test.js`

**Interfaces:**
- `railFenceEncrypt(text: string, rails: number)`: `string`
- `railFenceDecrypt(text: string, rails: number)`: `string`
- `railFenceBruteForce(text: string)`: `Array<{ rails: number, result: string }>`（rails 2-20）
- `railFenceStructure(text: string, rails: number)`: `{ rails: number, grid: (string|null)[][], readingOrder: number[] }`

**Test vectors:**

```js
// 经典 3-rail 示例
railFenceEncrypt('WEAREDISCOVEREDFLEEATONCE', 3) === 'WECRLTEERDSOEEFEAOCAIVDEN'
railFenceDecrypt('WECRLTEERDSOEEFEAOCAIVDEN', 3) === 'WEAREDISCOVEREDFLEEATONCE'

// round-trip with multiple rail counts
rails=2, rails=4, rails=5 的 round-trip 可验证
```

- [ ] **Step 1: Write failing test**

`tests/utils/cipher-railfence.test.js`:

```js
const { railFenceEncrypt, railFenceDecrypt, railFenceBruteForce, railFenceStructure } = require('../../utils/cipher-railfence');

describe('railFenceEncrypt', () => {
  test('rails=3 classic example', () => {
    const text = 'WEAREDISCOVEREDFLEEATONCE';
    expect(railFenceEncrypt(text, 3)).toBe('WECRLTEERDSOEEFEAOCAIVDEN');
  });
  test('rails=2', () => {
    expect(railFenceEncrypt('HELLO', 2)).toBe('HLOEL');
  });
  test('rails=4 short text', () => {
    expect(railFenceEncrypt('HELLO', 4)).toBe('HEOLL');
  });
  test('preserves non-alpha characters', () => {
    expect(railFenceEncrypt('HELLO, WORLD!', 3).length).toBe('HELLO, WORLD!'.length);
  });
  test('handles single character', () => {
    expect(railFenceEncrypt('A', 3)).toBe('A');
  });
  test('handles rails=1 (no change)', () => {
    expect(railFenceEncrypt('HELLO', 1)).toBe('HELLO');
  });
});

describe('railFenceDecrypt', () => {
  test('rails=3 classic example', () => {
    const encrypted = 'WECRLTEERDSOEEFEAOCAIVDEN';
    expect(railFenceDecrypt(encrypted, 3)).toBe('WEAREDISCOVEREDFLEEATONCE');
  });
  test('rails=2 round-trip', () => {
    const text = 'HELLOWORLD';
    expect(railFenceDecrypt(railFenceEncrypt(text, 2), 2)).toBe(text);
  });
  test('rails=4 round-trip', () => {
    const text = 'THEQUICKBROWNFOX';
    expect(railFenceDecrypt(railFenceEncrypt(text, 4), 4)).toBe(text);
  });
  test('rails=5 round-trip', () => {
    const text = 'CIPHERTEXTFORTEST';
    expect(railFenceDecrypt(railFenceEncrypt(text, 5), 5)).toBe(text);
  });
  test('round-trip with spaces and punctuation', () => {
    const text = 'HELLO, WORLD! THIS IS TEST.';
    const encrypted = railFenceEncrypt(text, 3);
    expect(railFenceDecrypt(encrypted, 3)).toBe(text);
  });
});

describe('railFenceBruteForce', () => {
  test('returns rails 2-20', () => {
    const results = railFenceBruteForce('WECRLTEERDSOEEFEAOCAIVDEN');
    expect(results.length).toBe(19); // 2..20 = 19 items
    expect(results[0].rails).toBe(2);
    expect(results[18].rails).toBe(20);
  });
  test('rails=3 produces original text', () => {
    const results = railFenceBruteForce('WECRLTEERDSOEEFEAOCAIVDEN');
    const r3 = results.find(r => r.rails === 3);
    expect(r3.result).toBe('WEAREDISCOVEREDFLEEATONCE');
  });
});

describe('railFenceStructure', () => {
  test('returns grid and readingOrder', () => {
    const s = railFenceStructure('HELLO', 3);
    expect(s.rails).toBe(3);
    expect(s.grid.length).toBe(3);
    expect(s.grid[0].length).toBe(5);
    expect(s.readingOrder.length).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/cipher-railfence.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `utils/cipher-railfence.js`**

包含：
- `railFenceEncrypt(text, rails)`: 模拟锯齿形填充 → 按行读取
- `railFenceDecrypt(text, rails)`: 计算每行字符数 → 按行填充 → 按锯齿读取
- `railFenceBruteForce(text)`: rails [2..20] 的 decrypt 结果
- `railFenceStructure(text, rails)`: 网格和读取顺序

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/cipher-railfence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/cipher-railfence.js tests/utils/cipher-railfence.test.js
git commit -m "feat(cipher-railfence): 栅栏密码（加密/解密/暴力枚举/结构展示）"
```

---

## Task 4: 字母频率统计

**Files:**
- Create: `utils/cipher-freq.js`
- Test: `tests/utils/cipher-freq.test.js`

**Interfaces:**
- `analyzeFrequency(text: string)`: `Array<{ letter: string, count: number, pct: number }>` — 26 项，按字母顺序
- `STANDARD_ENGLISH_FREQ`: `Array<{ letter: string, pct: number }>` — 标准英文频率

**Test vectors:**

```js
analyzeFrequency('HELLO WORLD') 的总和 ≈ 100%
STANDARD_ENGLISH_FREQ[0] 应该是 { letter: 'E', pct: 12.7 } 左右
STANDARD_ENGLISH_FREQ 长度 === 26
空字符串返回全 0 频率数组
```

- [ ] **Step 1: Write failing test**

`tests/utils/cipher-freq.test.js`:

```js
const { analyzeFrequency, STANDARD_ENGLISH_FREQ } = require('../../utils/cipher-freq');

describe('STANDARD_ENGLISH_FREQ', () => {
  test('has 26 entries', () => {
    expect(STANDARD_ENGLISH_FREQ.length).toBe(26);
  });
  test('first entry is E with ~12.7%', () => {
    const e = STANDARD_ENGLISH_FREQ.find(f => f.letter === 'E');
    expect(e).toBeDefined();
    expect(e.pct).toBeCloseTo(12.7, 0);
  });
  test('sums to 100%', () => {
    const total = STANDARD_ENGLISH_FREQ.reduce((s, f) => s + f.pct, 0);
    expect(total).toBeCloseTo(100, 0);
  });
});

describe('analyzeFrequency', () => {
  test('counts letters correctly', () => {
    const result = analyzeFrequency('AABBCC');
    const a = result.find(f => f.letter === 'A');
    expect(a.count).toBe(2);
    expect(a.pct).toBeCloseTo(33.33, 0);
  });
  test('ignores non-alpha characters', () => {
    const result = analyzeFrequency('A A B B C C');
    const total = result.reduce((s, f) => s + f.count, 0);
    expect(total).toBe(6); // spaces ignored
  });
  test('returns 26 entries', () => {
    const result = analyzeFrequency('HELLO WORLD');
    expect(result.length).toBe(26);
  });
  test('frequency sums to 100%', () => {
    const result = analyzeFrequency('HELLO WORLD THIS IS A TEST MESSAGE');
    const total = result.reduce((s, f) => s + f.pct, 0);
    expect(total).toBeCloseTo(100, 1);
  });
  test('handles empty string (all zero)', () => {
    const result = analyzeFrequency('');
    expect(result.every(f => f.count === 0 && f.pct === 0)).toBe(true);
  });
  test('handles non-alpha-only string', () => {
    const result = analyzeFrequency('123 !@#');
    expect(result.every(f => f.count === 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/cipher-freq.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `utils/cipher-freq.js`**

包含：
- `STANDARD_ENGLISH_FREQ`: E=12.7%, T=9.1%, A=8.2%, O=7.5%, I=7.0%, N=6.7%, S=6.3%, H=6.1%, R=6.0%, D=4.3%, L=4.0%, C=2.8%, U=2.8%, M=2.5%, W=2.4%, F=2.2%, G=2.0%, Y=2.0%, P=1.9%, B=1.5%, V=1.0%, K=0.8%, J=0.15%, X=0.15%, Q=0.10%, Z=0.07%
- `analyzeFrequency(text)`: 统计字母（A-Z 忽略大小写），计算频率百分比

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/cipher-freq.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/cipher-freq.js tests/utils/cipher-freq.test.js
git commit -m "feat(cipher-freq): 字母频率统计（analyzeFrequency + 标准英文频率）"
```

---

## Task 5: 密码工具箱页面（4 文件）

**Files:**
- Create: `pages/crypto-tools/crypto-tools.json`
- Create: `pages/crypto-tools/crypto-tools.wxml`
- Create: `pages/crypto-tools/crypto-tools.wxss`
- Create: `pages/crypto-tools/crypto-tools.js`

**Interfaces:**
- Consumes:
  - `caesarEncrypt`, `caesarDecrypt`, `caesarBruteForce` from `utils/cipher-caesar.js`
  - `vigenereEncrypt`, `vigenereDecrypt`, `vigenereWithSteps` from `utils/cipher-vigenere.js`
  - `railFenceEncrypt`, `railFenceDecrypt`, `railFenceBruteForce`, `railFenceStructure` from `utils/cipher-railfence.js`
  - `analyzeFrequency`, `STANDARD_ENGLISH_FREQ` from `utils/cipher-freq.js`
- Produces: 完整的密码工具箱页面

**页面结构（Tab 切换）：**

1. **凯撒密码 Tab**：
   - 移位滑块/输入（1-25）
   - 加密/解密按钮
   - 输入文本区
   - 结果输出
   - 暴力破解面板（可折叠，显示全部 25 种移位）
   - 字母频率分析（柱状图）

2. **维吉尼亚密码 Tab**：
   - 密钥输入
   - 加密/解密按钮
   - 输入文本区
   - 密钥循环展示
   - 逐字母偏移对照表
   - 结果输出

3. **栅栏密码 Tab**：
   - 栏数输入（2-20）
   - 加密/解密按钮
   - 输入文本区
   - 栅栏结构可视化（点阵表示）
   - 结果输出
   - 暴力枚举栏数面板（可折叠）

- [ ] **Step 1: Write `pages/crypto-tools/crypto-tools.json`**

```json
{
  "navigationBarTitleText": "密码工具箱",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#faf9f5",
  "usingComponents": {}
}
```

- [ ] **Step 2: Write `pages/crypto-tools/crypto-tools.wxml`**

布局：
1. Tab 切换栏（凯撒 / 维吉尼亚 / 栅栏）
2. 三个 Tab 内容各自用 `wx:if` / `wx:elif` / `wx:else` 包裹
3. 每个 Tab 包含：输入区 → 操作按钮 → 结果展示 → 可折叠面板（暴力破解/频率分析/结构展示）
4. 频率柱状图用内联 style width 百分比实现（纯 View 渲染）

- [ ] **Step 3: Write `pages/crypto-tools/crypto-tools.wxss`**

Claude Design 风格：
- Tab 栏样式（当前 Tab 下划线高亮）
- 输入框/文本区样式
- 结果输出卡片样式
- 柱状图样式（色块宽度 = 比例）
- 暴力破解结果用 scroll-view 包裹
- 栅栏结构点阵展示
- 维吉尼亚偏移对照表格

- [ ] **Step 4: Write `pages/crypto-tools/crypto-tools.js`**

页面逻辑：
- `data`：activeTab, inputText, 各 Tab 参数（shift/key/rails）, 结果, 展开面板状态
- Tab 切换：setData activeTab
- 每种密码的加密/解密：调用对应 util 函数
- 暴力破解/频率分析/结构展示：点击展开时计算
- 预设文本下拉：3-5 组内置示例
- 错误处理：空输入 toast

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add pages/crypto-tools/
git commit -m "feat(crypto-tools): 页面（3 Tab 切换/凯撒/维吉尼亚/栅栏/频率分析）"
```

---

## Task 6: 注册页面 + tool-registry + 模块文档

**Files:**
- Modify: `app.json`（添加 `pages/crypto-tools/crypto-tools` 到主 pages 数组）
- Modify: `utils/tool-registry.js`（`crypto-tools.available` → `true`，补充字段）
- Create: `docs/handoff/modules/crypto-tools.md`

- [ ] **Step 1: Modify `app.json`**

在主 pages 数组中追加 `"pages/crypto-tools/crypto-tools"`。

- [ ] **Step 2: Modify `utils/tool-registry.js`**

找到密码学分类下 `crypto-tools` 工具对象，`available: false` → `true`，补充字段。

```js
tagline: '凯撒/维吉尼亚/栅栏——三种古典密码加密/解密/暴力破解',
taglineDetail: '三种密码一键切换。凯撒移位破解所有 25 种可能，维吉尼亚密钥循环逐字母展示，栅栏密码点阵结构可视化，附带字母频率柱状图',
tags: ['#交互式', '#实用工具'],
difficulty: 'easy',
intro: {
  valueProp: '凯撒、维吉尼亚、栅栏——三种古典密码的加密/解密/暴力破解，频率分析一眼看清。',
  features: [
    '三种密码一键切换：凯撒（1-25 移位）、维吉尼亚（密钥循环）、栅栏（2-20 栏）',
    '暴力破解：凯撒展示全部 25 种移位结果，栅栏枚举所有栏数',
    '字母频率柱状图，对比标准英文频率'
  ],
  prerequisites: '知道"加密就是把字母变一下"就够了。',
  useCases: [
    '密码学入门学习',
    '理解古典密码的移位和替换原理',
    '认识字母频率分析在破译中的作用'
  ]
}
```

- [ ] **Step 3: Write `docs/handoff/modules/crypto-tools.md`**

```md
# 密码工具箱（Crypto Tools）

> 由 `2026-07-19-crypto-tools-design.md` spec 实施落盘。

## 概览

集成凯撒密码、维吉尼亚密码、栅栏密码三种古典密码的加密/解密/暴力破解功能，展示字母频率分析和移位规律。

## 数据驱动

- `utils/cipher-caesar.js`：凯撒密码（加密/解密/暴力破解）
- `utils/cipher-vigenere.js`：维吉尼亚密码（加密/解密/过程记录）
- `utils/cipher-railfence.js`：栅栏密码（加密/解密/暴力枚举/结构展示）
- `utils/cipher-freq.js`：字母频率统计 + 标准英文频率数据

## 特性

| 特性 | 说明 |
|---|---|
| 凯撒密码 | 1-25 移位可调，暴力破解展示全部 25 种结果 |
| 维吉尼亚 | 密钥循环逐字母偏移对照 |
| 栅栏密码 | 2-20 栏可调，点阵结构可视化 |
| 频率分析 | 柱状图对比标准英文频率 |
| 预设文本 | 内置多组示例方便体验 |
| 输入限制 | ≤ 5000 字符 |
```

- [ ] **Step 4: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add app.json utils/tool-registry.js docs/handoff/modules/crypto-tools.md
git commit -m "feat(crypto-tools): 注册页面 + tool-registry 可用化 + 模块文档"
```

---

## 验收清单（实施完成后）

- [ ] `npm test` 全绿
- [ ] `caesarEncrypt('HELLO', 3)` → `'KHOOR'` round-trip 正确
- [ ] `caesarBruteForce` 返回 25 项，shift=3 解析正确
- [ ] `vigenereEncrypt('ATTACKATDAWN', 'LEMON')` → `'LXFOPVEFRNHR'`
- [ ] `railFenceEncrypt` 3-rail 经典向量正确
- [ ] `analyzeFrequency` 总和 ≈ 100%，忽略非字母
- [ ] 页面加载无报错
- [ ] Tab 切换流畅
- [ ] 凯撒暴力破解面板展示正常
- [ ] 维吉尼亚偏移对照表展示
- [ ] 栅栏结构点阵可视化
- [ ] 频率柱状图渲染正常
- [ ] 首页「密码学」分类 → 密码工具箱卡片可点击
