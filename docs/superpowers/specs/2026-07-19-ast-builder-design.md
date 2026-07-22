# AST 构建器 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec → **已实现** ✅
> 状态：已实现
> 关联：`utils/tool-registry.js`（`ast-builder` 占位）、`app.json`
>
> 实现状态速览:
> - ✅ 算术表达式解析（+、-、\*、/、括号、标识符）
> - ✅ LL(1) 自顶向下 AST 构建
> - ✅ **AST 树可视化**（带颜色编码的定位节点）
> - ✅ SDT 求值 + 类型标注
> - ✅ 步进模式（词法→解析→SDT 四阶段）
> - ✅ 树布局算法（Reingold-Tilford 简化版）
> - ✅ 交互式展开/折叠节点
> - ✅ 5 个预设示例
> - ✅ 错误处理
> - ✅ Claude Design 色调

## 1. 目标

为「刷个冯题」小程序新增一个 **抽象语法树（AST）构建器** 的可视化教学页面：用户输入代码片段（类 C 语言子集），展示从 Token 流到语法分析树的完整构建过程，同时演示语法制导翻译（SDT）如何计算表达式的值或类型。帮助编译原理学习者理解自顶向下/自底向上的语法分析树构建以及语法制导定义的应用。

## 2. 范围

包含：
- 类 C 算术表达式解析（四则运算 + 括号 + 赋值）
- 自顶向下（基于 LL(1) 文法）AST 构建流程
- 语法分析树可视化（嵌套的树形节点展示）
- 语法制导翻译（SDT）：表达式求值 + 类型标注
- 步进模式：每步归约/展开都对应树节点的新建或合并
- 树形布局：interactive 展开/折叠子树

不包含（明确不做）：
- 完整语言解析（仅表达式与简单语句，不含函数、循环、结构体）
- 自底向上（LR/LALR）解析树构建（仅 LL(1) 自顶向下）
- 中间代码生成（三地址码 / IR）
- 代码生成 / 汇编输出
- 类型检查 / 语义分析（仅 SDT 求值与简单类型标注）
- 作用域 / 符号表管理（这部分由 `lexer-viz` 覆盖）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/ast-builder/ast-builder.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/ast-grammar.js` | 新增 | 表达式文法定义 + 解析器 |
| `utils/ast-tree.js` | 新增 | AST 节点数据结构 + 构建器 |
| `utils/ast-sdt.js` | 新增 | 语法制导翻译（求值 + 类型） |
| `utils/ast-layout.js` | 新增 | 树形布局坐标计算 |
| `utils/tool-registry.js` | 修改 | `ast-builder.available = true` |
| `app.json` | 修改 | 注册页面 |
| `tests/utils/ast-grammar.test.js` | 新增 | 解析器测试 |
| `tests/utils/ast-tree.test.js` | 新增 | AST 构建测试 |
| `tests/utils/ast-sdt.test.js` | 新增 | SDT 求值测试 |
| `docs/handoff/modules/ast-builder.md` | 新增 | 模块文档 |

## 4. 核心交互

用户输入一个算术表达式（如 `3 + 4 * (5 - 2)`），点击「构建 AST」，页面分三部分展示：

1. **输入与 Token 流**——输入框上方展示词法分析结果（Token 列表），高亮当前处理到的 Token
2. **AST 树视图**——递归展示语法树，节点 = 带圆角的卡片，子节点连线，当前活动的子树高亮
3. **语法制导翻译**——底部卡片显示 SDT 的求值过程，树节点上标注综合属性/继承属性

```text
输入表达式: [3 + 4 * (5 - 2)                ] [▶ 构建] [▶ 单步] [↻ 重置]

Token 流: 3 → + → 4 → * → ( → 5 → - → 2 → )
          ██                             ██ ← 当前 Token

┌─ AST ─────────────────────────────────────────────┐
│                                                     │
│                  [+] (val=11)                       │
│                 /    \                              │
│              [3]     [*] (val=12)                   │
│              (3)    /    \                          │
│                  [4]    [-] (val=3)                 │
│                  (4)   /    \                       │
│                      [5]   [2]                     │
│                      (5)   (2)                     │
│                                                     │
│   □ 展开/折叠   ■ 当前节点   ◌ 待建节点            │
└─────────────────────────────────────────────────────┘

┌─ 语法制导翻译 ────────────────────────────────────┐
│  SDT 规则:                                         │
│    E → E1 + T   { E.val = E1.val + T.val }         │
│    E → T        { E.val = T.val }                  │
│    T → T1 * F   { T.val = T1.val * F.val }         │
│    T → F        { T.val = F.val }                  │
│    F → ( E )    { F.val = E.val }                  │
│    F → num      { F.val = num.val }                │
│                                                     │
│  计算过程（当前步骤）：                               │
│    T.val = T1.val * F.val = 4 * 3 = 12              │
│    其中 T1.val = 4, F.val = 3 (来自 (5-2))          │
└─────────────────────────────────────────────────────┘
```

步进模式下，每点击「单步」：
1. 如果当前处于词法 Token 化阶段 → 产生下一个 Token（高亮源码对应位置）
2. 如果处于解析阶段 → 应用一条文法产生式，在 AST 上新建/合并节点
3. 如果处于 SDT 阶段 → 执行一条语义规则，在对应节点上标注属性值

## 5. 数据模型 / 核心逻辑

```js
// AST 节点
{
  id: number,
  type: string,             // 'NUM' | 'ADD' | 'MUL' | 'SUB' | 'DIV' | 'ASSIGN' | ...
  lexeme?: string,          // 词素，仅叶节点有
  children: ASTNode[],      // 子节点，顺序视文法而定
  attributes: {             // 综合/继承属性（SDT 结果）
    val?: number,
    type?: string,
    // 其他自定义属性
  },
  production?: string,      // 产生该节点的产生式（用于教学展示）
  stepCreated: number       // 构建步骤索引
}

// 文法产生式 + 语义规则（语法制导定义）
{
  lhs: string,
  rhs: string[],
  semanticAction: (node: ASTNode, children: ASTNode[]) => void
  // 语义动作：计算综合属性，挂载到 node.attributes
}

// AST 构建步骤（用于回放）
{
  action: 'lex' | 'parse' | 'sdt',
  description: string,
  nodeId?: number,
  changedAttributes?: object
}

// 核心函数
function parseExpression(input: string):
  { tokens: Token[], ast: ASTNode, steps: BuildStep[] }

function evaluateAST(node: ASTNode): number
// 递归后序遍历，计算 expression val

function annotateTypes(node: ASTNode): string
// 递归标注类型（num → 'int', + → 'int → int → int'）

function layoutTree(node: ASTNode, canvasWidth: number):
  { x, y, width, height }[]
// 计算树形布局坐标（Reingold-Tilford 简化版）
```

文法（表达式的 LL(1) 版本）：

```
E  → T E'
E' → + T E' | - T E' | ε
T  → F T'
T' → * F T' | / F T' | ε
F  → ( E ) | num | id
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 语法错误（括号不匹配、缺少操作数） | toast "语法错误：xxx"，在源码中用红色波浪线标记错误位置 |
| 除数为零 | SDT 求值时检测 → 节点属性标注 `val: 'Error: division by zero'` |
| 不支持的操作符（如 `^`、`%`） | toast "不支持的操作符：^"，可选择忽略或用其他符号替代 |
| 空输入 | toast "请输入表达式" |
| 表达式过长（超过 50 个 Token） | toast "表达式过长，请简化"（防止树渲染卡顿）|
| 非法标识符（未声明的变量） | SDT 求值时标注为 'unknown'，以不同颜色显示 |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/ast-grammar.test.js` | 简单数字（`42`）、加减（`1+2-3`）、乘除优先（`3+4*2`）、括号（`(1+2)*3`）、嵌套括号、语法错误检测 |
| `tests/utils/ast-tree.test.js` | AST 树结构正确性（优先级的树形体现）、叶节点数字、内部节点操作符、子树深度 |
| `tests/utils/ast-sdt.test.js` | 表达式求值（`3+4*2` → 11）、整数除法（`7/2` → 3）、括号覆盖优先级、嵌套求值、除零标注 |

**关键测试用例**：

```js
// 基本解析
const ast = parseExpression('3 + 4 * 2')
// AST 结构应为：+(3, *(4, 2))，而非 *(+(3, 4), 2)
expect(ast.type).toBe('ADD')
expect(ast.children[0].type).toBe('NUM')
expect(ast.children[0].lexeme).toBe('3')
expect(ast.children[1].type).toBe('MUL')
expect(ast.children[1].children[0].lexeme).toBe('4')
expect(ast.children[1].children[1].lexeme).toBe('2')

// 求值
expect(evaluateAST(ast)).toBe(11)

// 括号改变优先级
const ast2 = parseExpression('(3 + 4) * 2')
expect(ast2.type).toBe('MUL')
expect(evaluateAST(ast2)).toBe(14)

// 除零
const ast3 = parseExpression('5 / 0')
expect(evaluateAST(ast3)).toBe(Infinity)  // JS 行为
```

覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布。
2. **纯函数优先**：所有 `utils/ast-*.js` 模块无副作用。
3. **树形布局**：用 Reingold-Tilford 简易算法计算节点坐标（不依赖 canvas，纯 WXML view 定位）。
4. **节点颜色**：数字节点 = `#6b8c3e`（橄榄绿），操作符节点 = `#cc785c`（珊瑚色），括号节点 = `#5a7d9a`（蓝灰），标识符节点 = `#996644`（棕色）。
5. **步进层级**：三个阶段的步进（词法→解析→SDT）可以按需合并或分离，页面通过 Tabs 切换展示重点。
6. **预设示例**：提供 3-5 个预设表达式（简单算术、含括号、含除法、复杂嵌套）。
7. **更新 PROJECT_HANDOFF**：完成时追加变更记录。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| 树形布局在深嵌套时节点重叠 | 简化 Reingold-Tilford 算法，节点数上限 50，超限提示简化 |
| SDT 属性标注过多导致视图杂乱 | 提供「显示属性」开关，默认仅显示 val，可选显示 type |
| 步进模式与「全部构建」模式切换 | 两种模式共享解析结果，步进只是控制渲染时机 |
| 与 ll1-parser 功能重叠 | ast-builder 重点在树构建 + SDT，ll1-parser 重点在分析表 + 预测分析过程 |

未来可拓展：
- 完整语句解析（`if`、`while`、`switch` 等控制流）
- 三地址码 / IR 生成
- 中间代码优化演示（常数折叠、死代码消除）
- 多语言前端切换（C / Python / JS 子集）
- 与 `lexer-viz` 和 `ll1-parser` 联动（完整编译管道）

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-19-ast-builder.md`，按 RED → GREEN → IMPROVE 分阶段实施。
