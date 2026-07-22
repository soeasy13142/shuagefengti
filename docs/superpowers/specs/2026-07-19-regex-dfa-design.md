# Regex→DFA · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec → **已实现** ✅
> 状态：已实现
> 关联：`utils/tool-registry.js`（`regex-dfa` 占位）、`app.json`
>
> 实现状态速览:
> - ✅ 正则解析（字符类、`*`、`|`、`.`、`?`、`+`、转义）
> - ✅ Thompson 构造法（ε-NFA）
> - ✅ 子集构造法（ε-闭包、move、NFA→DFA）
> - ✅ DFA 模拟运行（路径记录）
> - ✅ 带箭头连线的状态图（定位圆 + CSS 箭头）
> - ✅ 逐步动画与高亮（上一步/下一步按钮、高亮元素）
> - ✅ ε 转移以虚线显示
> - ✅ 错误处理（最多 50 个 DFA 状态、递归限制）
> - ✅ 3 个预设示例
> - ✅ Claude Design 色调

## 1. 目标

为「刷个冯题」小程序新增一个 **正则表达式→NFA→DFA** 的可视化教学页面：用户输入正则表达式，逐步展示 Thompson 构造法生成 NFA、子集构造法转换为 DFA、以及最终 DFA 的状态转移表与状态图。帮助编译原理学习者理解正则表达式到有限自动机的完整转化过程。

## 2. 范围

包含：
- ✅ 支持常用正则语法：`*`（克林闭包）、`|`（选择）、`.`（连接）、`()`（分组）、`?`（0 或 1）、`+`（1 或多次）
- ✅ Thompson 构造法生成 ε-NFA（状态节点 + ε/输入转移）
- ✅ 子集构造法（ε-闭包 → DFA 状态）
- ✅ DFA 状态转移表展示（表格视图 + 状态图）
- ✅ 步进控制：ε-NFA 构造→ε-闭包展开→DFA 状态生成，每一步高亮
- ✅ 测试输入串在 DFA 上的模拟运行（逐字符转移路径高亮）

不包含（明确不做）：
- 字符类扩展（`[a-z]`、`\d`、`\w` 等——纯 ASCII 基本语法）
- DFA 最小化（Hopcroft 算法）
- 回引用（`\1`、`(.*)\1`——已超出正则语言范畴）
- 前瞻/后顾断言（零宽断言）
- Unicode 支持（仅 ASCII 可见字符）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/regex-dfa/regex-dfa.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/regex-nfa.js` | 新增 | Thompson 构造法：parse → ε-NFA |
| `utils/nfa-dfa.js` | 新增 | 子集构造法：ε-闭包 → DFA |
| `utils/dfa-simulate.js` | 新增 | DFA 模拟运行 |
| `utils/tool-registry.js` | 修改 | `regex-dfa.available = true` |
| `app.json` | 修改 | 注册页面 |
| `tests/utils/regex-nfa.test.js` | 新增 | NFA 构造测试 |
| `tests/utils/nfa-dfa.test.js` | 新增 | DFA 转换测试 |
| `tests/utils/dfa-simulate.test.js` | 新增 | 模拟运行测试 |
| `docs/handoff/modules/regex-dfa.md` | 新增 | 模块文档 |

## 4. 核心交互

用户输入一个正则表达式（如 `a(b|c)*`），点击「构造」，页面分三步展示：

1. **NFA 状态图**——用节点 + 箭头展示 Thompson 构造结果，ε 转移以虚线标出
2. **子集构造过程**——列出 ε-闭包计算步骤，逐步建立 DFA 状态集合
3. **DFA 状态转移表**——表格形式展示每个状态在每个输入上的转移，底部绘出 DFA 状态图

```text
输入: [a(b|c)*     ]  [▶ 构造]  [▶ 模拟运行]  测试串: [abc      ]

┌─ Step 1: ε-NFA ──────────────────────────────┐
│   ┌───┐  ε   ┌───┐  a   ┌───┐  ε   ┌───┐     │
│   │ 0 │──→──│ 1 │──→──│ 2 │──→──│ 3 │     │
│   └───┘      └───┘      └───┘      └───┘     │
│                              ↑                │
│                            [ε 转移]           │
└────────────────────────────────────────────────┘

┌─ Step 2: 子集构造 ────────────────────────────┐
│  ε-闭包({0}) = {0,1,3,4,...}  →  DFA 状态 A   │
│  ε-闭包({2}) = {2,5,...}      →  DFA 状态 B   │
│  ...                                           │
└────────────────────────────────────────────────┘

┌─ Step 3: DFA 状态图 ──────────────────────────┐
│         a         b|c                          │
│    A ─────→ B ─────→ C (接受)                  │
│    ↑         │         │                       │
│    └─────────┴─────────┘                       │
│          b|c  （回到自身）                       │
└────────────────────────────────────────────────┘
```

顶部保留「模拟运行」入口：输入测试串后，逐字符高亮 DFA 路径，绿色 = 接受，红色 = 拒绝。

## 5. 数据模型 / 核心逻辑

```js
// NFA 状态
{
  id: number,
  transitions: {                    // key = 输入字符或 'ε'
    'a': [stateId, ...],
    'ε': [stateId, ...]
  },
  isAccept: boolean
}

// DFA 状态 = NFA 状态集合
{
  id: string,                       // 如 'A', 'B'
  nfaStates: Set<number>,           // ε-闭包结果
  transitions: {                    // key = 输入字符
    'a': dfaStateId,
    'b': dfaStateId,
    ...
  },
  isAccept: boolean
}

// 核心函数
function regexToNFA(regex: string): { start, accept, states: NFAState[] }
// Thompson 构造：递归解析 regex，构造 ε-NFA

function nfaToDFA(nfa): { start, states: DFAState[], alphabet }
// 子集构造：ε-闭包 → 转移 → 新状态，直到没有新状态

function simulateDFA(dfa, input: string): { path, accepted }
// 逐字符沿 DFA 转移，记录路径
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 正则语法错误（括号不匹配、连续操作符） | toast 提示 "语法错误：xxx"，不清除输入 |
| 空输入 | toast "请输入正则表达式" |
| 包含不支持的语法（如 `\d`、`[a-z]`） | 友好的 toast "目前不支持：xxx"，建议用等价形式 |
| 模拟运行时输入的字符不在字母表中 | toast "字符 'X' 不在字母表中"，红色高亮该字符 |
| 正则导致 DFA 状态过多（>50 个） | toast "正则产生过多状态，请尝试简化"（防止渲染卡顿） |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/regex-nfa.test.js` | 单字符 NFA、连接（`ab`）、选择（`a|b`）、闭包（`a*`）、组合（`a(b|c)*`）、ε 转移正确性、NFA 状态计数 |
| `tests/utils/nfa-dfa.test.js` | ε-闭包计算、子集构造不遗漏状态、DFA 无 ε 转移、接受状态正确继承 |
| `tests/utils/dfa-simulate.test.js` | 接受串路径、拒绝串（路径不完整/终止于非接受态）、空串（仅当起始状态为接受态）、字母表外字符报错 |

**关键测试用例**：

```js
// Thompson 构造：a* 的 ε-NFA 应有 3 个状态（起始/接受/循环）
const nfa = regexToNFA('a*')
expect(nfa.states.length).toBe(3)
expect(nfa.states[0].transitions['ε']).toContain(nfa.states[1].id)
expect(nfa.states[0].transitions['ε']).toContain(nfa.states[2].id)

// DFA 无 ε 转移
const dfa = nfaToDFA(nfa)
dfa.states.forEach(s => {
  Object.values(s.transitions).forEach(t => {
    expect(t).not.toBe('ε')
  })
})

// 模拟运行
expect(simulateDFA(dfa, 'aaa').accepted).toBe(true)
expect(simulateDFA(dfa, '').accepted).toBe(true)    // a* 接受空串
expect(simulateDFA(dfa, 'b').accepted).toBe(false)
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. ✅ **风格统一**：完全遵循 Claude Design 暖奶油画布。
2. **纯函数优先**：`regex-nfa.js` / `nfa-dfa.js` / `dfa-simulate.js` 全部无副作用。
3. **NFA/DFA 节点坐标**：在页面层计算布局坐标（避免纯函数模块依赖 wx API），用简易分层布局（topological 排序）。
4. **动画渲染**：用 WXML `<canvas>` 或嵌套 `<view>` 实现状态节点圆圈 + 转移箭头，简化版本用 CSS border + transform 模拟箭头。
5. **正则语法解析**：直接递归下降，不引入第三方解析库。
6. **更新 PROJECT_HANDOFF**：完成时追加变更记录。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| 正则解析递归过深（极端嵌套） | 设递归深度上限 50，超限 toast |
| DFA 状态指数爆炸（如 `(a|b)*a(a|b)(a|b)`） | 设状态数上限 50，超限提示简化 |
| 状态图渲染布局混乱 | 简单拓扑排序 + 层间均匀分布，复杂情况可 fallback 到表格视图 |

未来可拓展：
- DFA 最小化（Hopcroft 算法）
- 字符类支持（`[a-z]`、`\d` 等）
- 正则表达式历史记录
- 与 `lexer-viz` 联动（正则作为 Token 定义输入）

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-19-regex-dfa.md`，按 RED → GREEN → IMPROVE 分阶段实施。
