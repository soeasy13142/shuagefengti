# LL(1) 分析器 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`ll1-parser` 占位）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **LL(1) 预测分析器** 的可视化教学页面：用户输入上下文无关文法，自动计算 FIRST 集与 FOLLOW 集、构造预测分析表，并可输入待分析串，逐步演示 LL(1) 预测分析的入栈、出栈、匹配过程。帮助编译原理学习者理解自顶向下语法分析的工作机制。

## 2. 范围

包含：
- 文法输入（产生式列表，`A → α | β` 形式，支持 ε 产生式）
- FIRST 集计算（含 ε 传播链）
- FOLLOW 集计算（含 ε 传播链与 start 符号的 `$` 标记）
- 预测分析表构造（二维表：非终结符 × 终结符）
- LL(1) 冲突检测（表中任意格子 >1 条产生式 → 报告冲突）
- 串的预测分析过程动画（栈、输入缓冲、输出同步展示）
- 分析树构建（同步生成左推导的语法树）

不包含（明确不做）：
- 左递归消除（要求用户输入已消除左递归的文法）
- 左因子提取（要求用户输入已提取左因子的文法）
- LR/SLR/LALR 等自底向上分析
- 语义动作（纯语法分析，不含语法制导翻译）
- 二义性文法检测（仅检测 LL(1) 冲突）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/ll1-parser/ll1-parser.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/ll1-grammar.js` | 新增 | 文法解析：文本 → 内部表示 |
| `utils/ll1-first.js` | 新增 | FIRST 集计算（不动点迭代） |
| `utils/ll1-follow.js` | 新增 | FOLLOW 集计算（不动点迭代） |
| `utils/ll1-table.js` | 新增 | 预测分析表构造 + 冲突检测 |
| `utils/ll1-parse.js` | 新增 | 预测分析器（栈 + 输入缓冲 + 输出） |
| `utils/tool-registry.js` | 修改 | `ll1-parser.available = true` |
| `app.json` | 修改 | 注册页面 |
| `tests/utils/ll1-grammar.test.js` | 新增 | 文法解析测试 |
| `tests/utils/ll1-first.test.js` | 新增 | FIRST 集测试 |
| `tests/utils/ll1-follow.test.js` | 新增 | FOLLOW 集测试 |
| `tests/utils/ll1-table.test.js` | 新增 | 分析表 + 冲突测试 |
| `tests/utils/ll1-parse.test.js` | 新增 | 预测分析测试 |
| `docs/handoff/modules/ll1-parser.md` | 新增 | 模块文档 |

## 4. 核心交互

用户输入一组产生式，点击「计算」，页面分四步展示：

1. **文法总览**——展示解析后的产生式列表，非终结符与终结符自动分类标识
2. **FIRST / FOLLOW 集**——每步迭代展开，最终集合以表格形式展示
3. **预测分析表**——二维网格表，行 = 非终结符，列 = 终结符（含 `$`），格子内为产生式或 `err`
4. **串分析动画**——页面上方为栈视图 + 输入缓冲 + 输出序列，步进前进

```text
文法输入:
┌──────────────────────────────────────────────────┐
│ E → T E'                                          │
│ E' → + T E' | ε                                   │
│ T → F T'                                          │
│ T' → * F T' | ε                                   │
│ F → ( E ) | id                                    │
│                                                    │
│ [▶ 计算 FIRST/FOLLOW]  [▶ 构造分析表]  [▶ 分析串]  │
└──────────────────────────────────────────────────┘

┌─ FIRST / FOLLOW ─────────────────────────────────┐
│ 非终结符  │ FIRST           │ FOLLOW             │
│ E         │ { (, id }       │ { $, ) }           │
│ E'        │ { +, ε }        │ { $, ) }           │
│ T         │ { (, id }       │ { +, $, ) }        │
│ ...       │ ...             │ ...                │
└──────────────────────────────────────────────────┘

┌─ 分析表 ─────────────────────────────────────────┐
│      │ id      │ +       │ (       │ )    │ $    │
│ E    │ E→TE'   │ err     │ E→TE'   │ err  │ err  │
│ E'   │ err     │ E'→+TE' │ err     │ E'→ε │ E'→ε │
│ T    │ T→FT'   │ err     │ T→FT'   │ err  │ err  │
│ ...  │ ...     │ ...     │ ...     │ ...  │ ...  │
└──────────────────────────────────────────────────┘

┌─ 分析动画 ────────────────────────────────────────┐
│ 栈               │ 输入缓冲    │ 输出               │
│ [$, E]           │ id + id $   │                   │
│ [$, E', T]       │ id + id $   │ E → T E'          │
│ [$, E', T', F]   │ id + id $   │ T → F T'          │
│ [$, E', T', id]  │ id + id $   │ F → id            │
│ [$, E', T']      │ + id $      │ 匹配 id           │
│ ...              │ ...         │ ...               │
└──────────────────────────────────────────────────┘
```

每一步前进时，栈顶元素若为终结符则比较与输入第一个字符是否匹配；若为非终结符则查表展开。当前匹配的符号用绿色高亮，冲突位置用红色闪烁。

## 5. 数据模型 / 核心逻辑

```js
// 产生式
{
  lhs: string,          // 左部非终结符
  rhs: string[],        // 右部符号序列
  index: number         // 产生式编号
}

// 文法
{
  nonTerminals: Set<string>,
  terminals: Set<string>,
  startSymbol: string,
  productions: Production[],
  // key = lhs, value = 产生式列表
  productionMap: { [lhs: string]: Production[] }
}

// FIRST/FOLLOW 集
{
  FIRST:  { [symbol: string]: Set<string> },   // 含 ε
  FOLLOW: { [symbol: string]: Set<string> }     // 不含 ε，含 $
}

// 分析表
// 行 = 非终结符, 列 = 终结符 | $
// table[N][T] = Production | null (error)
// conflicts[N][T] = Production[] (仅冲突时非空)

// 核心函数
function parseGrammar(text: string): Grammar
function computeFIRST(grammar: Grammar): { FIRST }
function computeFOLLOW(grammar: Grammar, FIRST): { FOLLOW }
function buildParseTable(grammar, FIRST, FOLLOW):
  { table, conflicts }
function parseInput(grammar, table, input: string[]):
  { steps: ParseStep[], accepted: boolean }
  
// ParseStep
{
  stack: string[],
  input: string[],        // 剩余输入
  output: string[],       // 已产生的左推导
  action: 'match' | 'expand' | 'error' | 'accept'
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 文法未消除左递归 | 检测到左递归 → toast "存在左递归，LL(1) 无法处理，请消除左递归"，指出递归符号 |
| 文法未提取左因子 | 产生式选择冲突（非 LL(1)）→ 在分析表中标红冲突格子，显示冲突的多个产生式 |
| ε 产生式导致 FOLLOW 集传播循环 | 不动点迭代最多 100 轮，超限报 "FIRST/FOLLOW 计算未收敛" |
| 输入串含未在文法中定义的符号 | toast "未识别的符号：X"，在输入串中用红色标记 |
| 空输入串 | 合法输入：分析器尝试从 start 符号 ε-派生，接受当且仅当 start 符号可推导出 ε |
| 分析过程中栈变空但输入未耗尽 | 标记为错误，显示剩余未匹配的输入 |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/ll1-grammar.test.js` | 标准文法解析（`A → a B | c`）、ε 产生式、多行/空行/注释行、非法格式报告 |
| `tests/utils/ll1-first.test.js` | 简单 FIRST（`E → T E'`，`T → F T'` 链）、含 ε 的 FIRST（`E' → +T E' | ε`）、终结符 FIRST 为其自身 |
| `tests/utils/ll1-follow.test.js` | start 符号的 $、ε 传播（`E' → ε` 导致 FOLLOW 传播到 T'）、多层 ε 链 |
| `tests/utils/ll1-table.test.js` | 标准表达式文法的分析表、冲突检测（二义性文法 `A → a | a`）、无冲突 LL(1) 验证 |
| `tests/utils/ll1-parse.test.js` | 接受串（`id + id * id`）、拒绝串（`id +` 未完成）、空串接受/拒绝、每一步的栈/输入/输出正确性 |

**关键测试用例**：

```js
// 表达式文法
const grammar = parseGrammar(`
  E → T E'
  E' → + T E' | ε
  T → F T'
  T' → * F T' | ε
  F → ( E ) | id
`)
const { FIRST } = computeFIRST(grammar)
expect(FIRST['E'].has('id')).toBe(true)
expect(FIRST['E'].has('(')).toBe(true)
expect(FIRST['E'].has('+')).toBe(false)
expect(FIRST["E'"].has('ε')).toBe(true)

const { FOLLOW } = computeFOLLOW(grammar, FIRST)
expect(FOLLOW['E'].has('$')).toBe(true)
expect(FOLLOW['E'].has(')')).toBe(true)
expect(FOLLOW["E'"].has('$')).toBe(true)
expect(FOLLOW["E'"].has(')')).toBe(true)
expect(FOLLOW['T'].has('+')).toBe(true)

const { table, conflicts } = buildParseTable(grammar, FIRST, FOLLOW)
expect(Object.keys(conflicts).length).toBe(0)

const { steps, accepted } = parseInput(grammar, table, ['id', '+', 'id', '$'])
expect(accepted).toBe(true)
expect(steps.length).toBeGreaterThan(0)
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布。
2. **纯函数优先**：所有 `utils/ll1-*.js` 模块无副作用。
3. **不动点迭代**：FIRST 与 FOLLOW 都用 while 循环迭代直到集合不再变化（确保终止）。
4. **动画步进**：每次前进/后退都记录完整的 ParseStep，不依赖中间状态计算。
5. **冲突可视化**：分析表中冲突格子用红色背景 + 多个产生式堆叠显示。
6. **预设示例**：首页提供 2-3 个预设文法按钮（表达式文法、括号匹配文法、简单 if-else 文法）。
7. **更新 PROJECT_HANDOFF**：完成时追加变更记录。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| FIRST/FOLLOW 不收敛（循环 ε 链） | 最多 100 轮不动点迭代，超限报错 |
| 分析表过大（非终结符 × 终结符） | 限制非终结符 ≤ 20，终结符 ≤ 20 |
| 用户输入复杂的非 LL(1) 文法 | 冲突检查 + 友好建议（提取左因子/消除左递归） |
| 动画步骤过多 | 提供「跳到最后」按钮，不强制逐步骤看完 |

未来可拓展：
- 自动左递归消除与左因子提取
- 分析树（Parse Tree）可视化
- 多串批量测试
- 文法示例库（预置常见文法模板）
- 与 `lexer-viz` 联动（词法输出作为语法分析输入）

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-19-ll1-parser.md`，按 RED → GREEN → IMPROVE 分阶段实施。
