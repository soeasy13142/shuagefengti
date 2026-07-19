# 词法分析器 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`lexer-viz` 占位）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **词法分析器可视化** 教学页面：用户输入代码片段（如类 C 语言子集），实时展示 Token 化过程，包括正则匹配、符号表管理、以及最长匹配 / 回退规则。帮助编译原理学习者直观理解词法分析器如何将字符流转换为 Token 流。

## 2. 范围

包含：
- 类 C 语言词法规则（标识符、关键字、数字、字符串、运算符、分隔符、注释）
- 逐字符 Token 化过程动画（光标在源码上移动，识别的 Token 逐个出现）
- Token 流展示（按行显示，每个 Token 可点击查看详情）
- 符号表（标识符 → 属性条目，含行号、作用域等）
- 最长匹配原则演示（如 `>=` 优于 `>` 后匹配 `=`）
- 正则规则编辑与匹配测试（用户可自定义简单 Token 正则）
- 错误处理（非法字符、未闭合字符串等，带定位）

不包含（明确不做）：
- C 语言完整词法规范（仅核心子集，不含预处理指令、trigraph、双字符等）
- C++ / Java / Python 等完整词法（语言可切换后续版本）
- 自动机状态图可视化（这部分由 `regex-dfa` 工具覆盖）
- 语法分析（Token 流不进入语法分析器）
- 代码高亮 / IDE 功能（仅词法分析教学）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/lexer-viz/lexer-viz.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/lexer-engine.js` | 新增 | 词法分析引擎（核心循环） |
| `utils/lexer-token.js` | 新增 | Token 类型定义 + 正则规则集 |
| `utils/lexer-symbol-table.js` | 新增 | 符号表管理 |
| `utils/tool-registry.js` | 修改 | `lexer-viz.available = true` |
| `app.json` | 修改 | 注册页面 |
| `tests/utils/lexer-engine.test.js` | 新增 | 词法分析测试 |
| `tests/utils/lexer-token.test.js` | 新增 | Token 正则测试 |
| `tests/utils/lexer-symbol-table.test.js` | 新增 | 符号表测试 |
| `docs/handoff/modules/lexer-viz.md` | 新增 | 模块文档 |

## 4. 核心交互

用户输入一段代码或选择一个预设示例，点击「分析」，页面分为四个区域：

1. **源码视图**——逐字符高亮，光标当前位置用下划线闪烁标识，已识别的 Token 用不同颜色标记
2. **Token 流**——横向排列的 Token 卡片，点击可查看 Token 的详细属性（类型、文字、行号、列号）
3. **符号表**——表格形式展示标识符及其属性（名称、类型、出现行号列表）
4. **错误输出**——若遇非法字符，在源码对应位置标红，列表显示错误详情

```text
示例代码（可编辑）：                     [▶ 单步]  [▶▶ 全部]  [↻ 重置]
┌──────────────────────────────────────────────────────┐
│ int main() {                                          │
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔  │
│ ██ 关键字  █████ 标识符 ██ 运算符 ██ 分隔符 ██    │
│   int        main       (        )        {         │
│     ↑ 光标当前位置                                  │
│    回复: int → <KW_INT, "int", L1:C1-C3>            │
└──────────────────────────────────────────────────────┘

┌─ Token 流 ─────────────────────────────────────────┐
│ <KW_INT, "int"> → <ID, "main"> → <SEP, "(">        │
│ → <SEP, ")"> → <SEP, "{"> → <KW_RETURN, "return">  │
│ ...                                                  │
│   └─ 点击可看详情:                                   │
│      Token: ID                                       │
│      值: "main"                                      │
│      行号: 1                                         │
│      列号: 5-8                                       │
└──────────────────────────────────────────────────────┘

┌─ 符号表 ───────────────────────────────────────────┐
│ 标识符    │ 行号         │ 次数                     │
│ main      │ 1            │ 1                        │
│ a         │ 3, 5         │ 2                        │
│ result    │ 4, 6, 7      │ 3                        │
└──────────────────────────────────────────────────────┘
```

步进模式下，点击「单步」前进一个字符的处理（或一个 Token 的完整匹配），源码区光标随之移动，当前匹配的正则规则高亮显示在底部信息栏。

## 5. 数据模型 / 核心逻辑

```js
// Token
{
  type: string,           // 'KW_INT' | 'ID' | 'NUMBER' | 'OPERATOR' | 'SEP' | ...
  lexeme: string,         // 原始词素
  line: number,
  colStart: number,
  colEnd: number,
  regexRule?: string      // 匹配的正则规则名称（调试用）
}

// 符号表条目
{
  name: string,
  occurrences: { line: number, col: number }[],
  count: number
}

// 词法规则
{
  name: string,           // 如 'KW_IF', 'ID', 'NUMBER'
  pattern: RegExp,        // 匹配模式
  priority: number,       // 优先级（关键字 > 标识符）
  category: 'keyword' | 'identifier' | 'literal' |
            'operator' | 'separator' | 'comment'
}

// 分析步骤（用于动画回放）
{
  sourceIndex: number,     // 当前字符位置
  token?: Token,           // nil 表示正在匹配中
  buffer: string,          // 当前积累的字符
  matchedRule?: string,    // 当前匹配到的规则名
  error?: string,          // 当前错误（非法字符等）
  symbolTable: Map         // 快照
}

// 核心函数
function tokenize(source: string, rules: Rule[]):
  { tokens: Token[], errors: LexError[], steps: Step[] }

function buildSymbolTable(tokens: Token[]): SymbolEntry[]
// 从 Token 流中提取所有标识符，汇总出现位置
```

规则优先级：
- **最长匹配**：同时匹配多个规则时，选择匹配字符最多的规则
- **关键字优先**：相同长度时，关键字规则优先于标识符规则
- **注释忽略**：注释内容不产生 Token，直接跳过
- **空白跳过**：空格、制表符、换行符不产生 Token

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 非法字符（如 `@`、`#` 等不在任何规则中的字符） | 记录 LexError { line, col, char }，跳过该字符继续分析 |
| 未闭合字符串（行末未遇到 `"`） | 报错 "未闭合的字符串常量"，标记到行末 |
| 数字格式异常（如 `12a34`） | 数字视为完整 NUMBER Token，`a34` 重新开始匹配（正常最长匹配行为） |
| 多行注释未闭合 | 持续到文件末尾，报错 "未闭合的注释" |
| 空输入 | 返回空 Token 列表，提示 "请输入代码" |
| 输入过长（>5000 字符） | 限制输入长度，toast "输入过长，请输入 5000 字符以内" |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/lexer-token.test.js` | 各规则正则的正确性（关键字/标识符/数字/字符串/运算符/分隔符/注释）、规则优先级（关键字 vs 标识符）、最长匹配（`>=` vs `>` + `=`） |
| `tests/utils/lexer-engine.test.js` | 完整程序 Token 化（变量声明 + 赋值 + return 语句）、注释跳过、空白处理、非法字符处理、字符串常量识别、多行输入 |
| `tests/utils/lexer-symbol-table.test.js` | 标识符去重、出现行号收集、名称排序 |

**关键测试用例**：

```js
// 基础 Token 化
const result = tokenize('int main() { return 42; }')
expect(result.tokens.length).toBe(8)
expect(result.tokens[0].type).toBe('KW_INT')
expect(result.tokens[1].type).toBe('ID')
expect(result.tokens[1].lexeme).toBe('main')
expect(result.tokens[4].type).toBe('SEP')  // '{'
expect(result.tokens[6].type).toBe('NUMBER')
expect(result.tokens[6].lexeme).toBe('42')

// 最长匹配：>= 应为一个 OPERATOR 而非 '>' + '='
const t = tokenize('a >= b')
expect(t.tokens[1].type).toBe('OPERATOR')
expect(t.tokens[1].lexeme).toBe('>=')

// 注释跳过
const c = tokenize('/* comment */ int x')
expect(c.tokens[0].type).toBe('KW_INT')
expect(c.tokens.length).toBe(2)   // int, x

// 非法字符
const e = tokenize('int @ x')
expect(e.errors.length).toBe(1)
expect(e.errors[0].char).toBe('@')

// 符号表
const tokens = tokenize('int a; a = 1; return a').tokens
const symTable = buildSymbolTable(tokens)
expect(symTable.find(s => s.name === 'a').count).toBe(3)
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布。
2. **纯函数优先**：`lexer-engine.js` / `lexer-token.js` / `lexer-symbol-table.js` 全部无副作用。
3. **Token 颜色方案**：关键字=珊瑚 `#cc785c`，标识符=暖墨 `#141413`，数字=橄榄 `#6b8c3e`，字符串=蓝灰 `#5a7d9a`，运算符=棕 `#996644`，注释=灰 `#8e8b82`。
4. **步进动画**：每次「单步」前进到下一个 Token 的结束位置，源码区用 `<text>` 组件逐字包裹，动态绑定 class。
5. **规则可扩展**：`lexer-token.js` 中的规则数组设计为纯数据，新增语言只需新增规则集。
6. **预设示例**：提供 3-5 个预设代码片段（变量声明、函数调用、嵌套注释、多行字符串）。
7. **更新 PROJECT_HANDOFF**：完成时追加变更记录。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| 正则回溯导致性能问题（长输入） | 输入上限 5000 字符，单个规则禁止贪婪量词嵌套？ |
| 步进动画步骤过多 | 提供「跳至结尾」按钮，可切换到「全部分析」模式 |
| Token 颜色与背景不协调 | 使用低饱和度色彩 + 浅背景，确保 WCAG AA 对比度 |
| 预设语言子系统设计不够通用 | 规则集定义为 `{ name, pattern, priority }` 纯数据，语言可切换 |

未来可拓展：
- 多语言词法（C / Java / Python / 简易）切换
- 正则规则自定义（用户添加自己的 Token 模式）
- 与 `ll1-parser` 联动（Token 流注入语法分析器）
- 词法错误修正建议（如 `@` 是否应为 `=`）
- 自动机状态图嵌入（复用 `regex-dfa` 输出）

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-19-lexer-viz.md`，按 RED → GREEN → IMPROVE 分阶段实施。
