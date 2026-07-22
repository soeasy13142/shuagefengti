# AST 构建器 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `pages/ast-builder/` 页面，提供抽象语法树（AST）构建器的可视化教学工具，支持算术表达式解析、AST 构建展示、语法制导翻译（SDT）求值与类型标注、步进模式。帮助编译原理学习者理解自顶向下语法分析树构建以及语法制导定义的应用。

**Architecture:** 纯前端 + 4 个 utils 纯函数模块（ast-grammar / ast-tree / ast-sdt / ast-layout）+ 1 个页面（4 文件：js/wxml/wxss/json）。WXML 用嵌套 `<view>` 渲染树形结构（递归定位）。Jest 全测。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest + CommonJS（require/module.exports）。

**Spec:** `docs/superpowers/specs/2026-07-19-ast-builder-design.md`

## Global Constraints

- 所有代码使用 `const`/`let`，**禁用 `var`**（CLAUDE.md 代码风格）
- 文件命名：小写 + kebab-case（CLAUDE.md 命名约定）
- 私有函数 / 模块状态：`_underscore` 前缀
- 异步优先：`Promise` / `async-await`
- 错误处理：所有 `catch` 必须显式处理或 `throw`，禁止静默吞
- 注释：`/** */` JSDoc 用于公开 API；行内 `//` 仅用于解释 why
- 测试命令：`cd /Users/charliepan/Downloads/my-miniapp && npm test`（必须全绿）
- 设计风格：Claude Design 暖奶油画布（背景 `#faf9f5`、卡片 `#efe9de`、CTA `#cc785c`、Georgia 标题；CLAUDE.md 设计风格约束）
- 不引入第三方依赖（无新 npm 包）
- 中文 UI 文案；变量名 / 函数名 / 注释 / commit 英文
- 路径使用 `pages/ast-builder/`（主包，非 subpackage）

---

## AST 构建器约定（统一规格）

| 项 | 取值 |
|---|---|
| 语言 | 算术表达式（四则运算 + 括号 + 赋值） |
| 文法 | LL(1) 版本（`E → T E'`, `E' → + T E' | - T E' | ε`, `T → F T'`, `T' → * F T' | / F T' | ε`, `F → ( E ) | num | id`）|
| 节点颜色 | 数字=#6b8c3e, 操作符=#cc785c, 括号节点=#5a7d9a, 标识符=#996644 |
| 节点数上限 | 50 个（防渲染卡顿） |
| 树布局 | Reingold-Tilford 简化版 |
| 预设示例 | 5 个：简单算术、含括号、含除法、复杂嵌套、含变量 |
| 步进阶段 | 词法 → 解析 → SDT |

---

## Task 1: 表达式解析器（词法 + LL(1) 解析）

**Files:**
- Create: `utils/ast-grammar.js`
- Test: `tests/utils/ast-grammar.test.js`

**Interfaces:**
- Consumes: 无
- Produces:
  - `parseExpression(input)` → `{ tokens: Token[], ast: ASTNode, steps: BuildStep[] }`
  - `Token`：`{ type: 'NUM'|'ID'|'ADD'|'SUB'|'MUL'|'DIV'|'LPAREN'|'RPAREN'|'ASSIGN', lexeme, line, col }`
  - `ASTNode`：`{ id, type, lexeme?, children, attributes, production?, stepCreated }`

- [ ] **Step 1: Write failing test**

`tests/utils/ast-grammar.test.js` — 覆盖：
- 简单数字（`42`）
- 加减（`1+2-3`）
- 乘除优先（`3+4*2`）
- 括号（`(1+2)*3`）
- 嵌套括号
- 语法错误检测（括号不匹配、缺少操作数）

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-grammar.test.js`
Expected: FAIL with "Cannot find module '../../utils/ast-grammar'"

- [ ] **Step 3: Implement `utils/ast-grammar.js`**

核心逻辑：
- 词法化：简单扫描器（数字、标识符、操作符、括号），Token 流
- LL(1) 递归下降解析器：
  - `parseE()` / `parseEprime()` / `parseT()` / `parseTprime()` / `parseF()`
- 每个解析函数返回 AST 节点（子树）
- 产生式应用到节点时记录到 `steps[]`（用于步进回放）
- 错误处理：括号不匹配、缺失操作数

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-grammar.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add utils/ast-grammar.js tests/utils/ast-grammar.test.js
git commit -m "feat(ast-grammar): 表达式解析器 — 词法 + LL(1) 递归下降 + 步进记录"
```

---

## Task 2: AST 节点数据结构 + 构建器

**Files:**
- Create: `utils/ast-tree.js`
- Test: `tests/utils/ast-tree.test.js`

**Interfaces:**
- Consumes: 无（独立纯数据结构）
- Produces:
  - `createNode(type, lexeme?, children?)` → `ASTNode`
  - `astDepth(node)` → `number`
  - `astNodeCount(node)` → `number`
  - `walkAST(node, callback)` → 前序遍历

- [ ] **Step 1: Write failing test**

`tests/utils/ast-tree.test.js` — 覆盖：
- 创建各种类型节点
- 节点深度计算
- 节点计数
- 前序遍历
- 节点不可变性（创建新节点，不修改原节点）

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-tree.test.js`
Expected: FAIL with "Cannot find module '../../utils/ast-tree'"

- [ ] **Step 3: Implement `utils/ast-tree.js`**

核心结构：
```js
// AST 节点
{
  id: number,              // 自增 ID
  type: string,            // 'NUM' | 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'ASSIGN' | 'ID'
  lexeme: string,          // 词素，仅叶节点有
  children: ASTNode[],     // 子节点
  attributes: {            // 综合/继承属性（SDT 结果）
    val: undefined | number,
    type: undefined | string
  },
  production: string,      // 产生该节点的产生式
  stepCreated: number      // 构建步骤索引
}
```

- `createNode`: 返回新对象，不修改输入
- `walkAST`: 递归前序遍历

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-tree.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add utils/ast-tree.js tests/utils/ast-tree.test.js
git commit -m "feat(ast-tree): AST 节点数据结构 + 遍历工具"
```

---

## Task 3: 语法制导翻译（求值 + 类型标注）

**Files:**
- Create: `utils/ast-sdt.js`
- Test: `tests/utils/ast-sdt.test.js`

**Interfaces:**
- Consumes: ASTNode（来自 ast-tree.js）
- Produces:
  - `evaluateAST(node)` → `number | string`（成功返回值，除零返回 'Error: division by zero'）
  - `annotateTypes(node)` → `string`（递归标注类型）
  - `getSdtRules()` → 语义规则列表（用于展示）
  - `applySdtStep(node, stepIndex)` → 单步 SDT 执行

- [ ] **Step 1: Write failing test**

`tests/utils/ast-sdt.test.js` — 覆盖：
- 表达式求值（`3+4*2` → 11）
- 整数除法（`7/2` → 3）
- 括号覆盖优先级（`(3+4)*2` → 14）
- 嵌套求值
- 除零标注
- 类型标注正确性

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-sdt.test.js`
Expected: FAIL with "Cannot find module '../../utils/ast-sdt'"

- [ ] **Step 3: Implement `utils/ast-sdt.js`**

核心逻辑：
- `evaluateAST`: 后序遍历，每个节点计算 `val` 属性
  - NUM → lexeme 转数字
  - ADD → left.val + right.val
  - SUB → left.val - right.val
  - MUL → left.val * right.val
  - DIV → left.val / right.val（除零检测）
  - ID → 0（默认，变量未赋值）

- `annotateTypes`: 递归标注
  - NUM → 'int'
  - ADD → 'int → int → int'
  - 类似

- `getSdtRules`: 返回语义规则数组（用于页面展示）

- `applySdtStep`: 单步执行一个节点的 SDT，返回修改后的节点副本

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-sdt.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add utils/ast-sdt.js tests/utils/ast-sdt.test.js
git commit -m "feat(ast-sdt): 语法制导翻译 — 表达式求值 + 类型标注 + 步进"
```

---

## Task 4: 树形布局坐标计算

**Files:**
- Create: `utils/ast-layout.js`
- Test: `tests/utils/ast-layout.test.js`（可选，布局算法测试）

**Interfaces:**
- Consumes: ASTNode（来自 ast-tree.js）
- Produces:
  - `layoutTree(root, options)` → `{ nodePositions: Map<id, {x, y, w, h}>, width, height }`
  - `NODE_WIDTH` / `NODE_HEIGHT` / `H_GAP` / `V_GAP` — 布局常量

- [ ] **Step 1: Write failing test**

`tests/utils/ast-layout.test.js` — 覆盖：
- 单节点布局
- 二子节点布局
- 三子节点布局
- 边界（空树）

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-layout.test.js`
Expected: FAIL with "Cannot find module '../../utils/ast-layout'"

- [ ] **Step 3: Implement `utils/ast-layout.js`**

核心算法（Reingold-Tilford 简化版）：
1. 叶子节点：x = 前一个叶子 x + NODE_WIDTH + H_GAP
2. 内部节点：x = 子节点 x 的平均值
3. y = 深度 × (NODE_HEIGHT + V_GAP)
4. 后处理：检测子树重叠 → 平移

布局常量：
- `NODE_WIDTH = 120`（rpx）
- `NODE_HEIGHT = 60`（rpx）
- `H_GAP = 60`（rpx，兄弟节点间水平间距）
- `V_GAP = 100`（rpx，父子节点间垂直间距）

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-layout.test.js`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add utils/ast-layout.js tests/utils/ast-layout.test.js
git commit -m "feat(ast-layout): 树形布局坐标计算 — Reingold-Tilford 简化版"
```

---

## Task 5: 页面骨架（4 文件）

**Files:**
- Create: `pages/ast-builder/ast-builder.json`
- Create: `pages/ast-builder/ast-builder.wxml`
- Create: `pages/ast-builder/ast-builder.wxss`
- Create: `pages/ast-builder/ast-builder.js`

- [ ] **Step 1: Write `pages/ast-builder/ast-builder.json`**

```json
{
  "navigationBarTitleText": "AST 构建器",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#faf9f5",
  "usingComponents": {}
}
```

- [ ] **Step 2: Write `pages/ast-builder/ast-builder.wxml`**

页面结构：
1. 标题 + 表达式输入框 + 按钮（构建/单步/重置）+ 预设示例按钮（5 个）
2. Token 流显示区（高亮当前 Token）
3. AST 树视图区
   - 节点卡片（圆角，带类型标签 + 值/lexeme）
   - 父子连线（CSS 实现）
   - 当前活动子树高亮
   - 折叠/展开按钮
4. SDT 信息区
   - 语义规则列表
   - 当前步骤的计算过程文字说明
   - 节点属性标注（val, type）
5. 步骤控制区（当前步骤 / 总步骤数 + 前进/后退）

- [ ] **Step 3: Write `pages/ast-builder/ast-builder.wxss`**

样式遵循 Claude Design 暖奶油画布：
- 节点颜色：数字 `#6b8c3e`（橄榄绿），操作符 `#cc785c`（珊瑚色），标识符 `#996644`（棕色）
- 节点卡片：圆角 16rpx，阴影（或浅边框），居中显示值和类型
- 连线：`#8a8580`，粗细 2rpx
- 当前节点：高亮边框
- Token 流：高亮当前 Token 背景

- [ ] **Step 4: Write `pages/ast-builder/ast-builder.js`**

页面逻辑：
- `onLoad`: 初始化，加载预设示例
- `onExprInput`: 更新表达式
- `onPreset`: 加载预设示例
- `onBuild`: 调用 parseExpression，渲染 AST
- `onStepForward`: 前进一个构建步骤
- `onStepBackward`: 后退
- `onReset`: 重置
- `onToggleFold`: 折叠/展开子树
- `_renderTree`: 使用 layoutTree 计算坐标，渲染到 WXML
- `_renderTokenStream`: 渲染 Token 流，高亮当前 Token
- `_renderSDT`: 渲染 SDT 规则和当前计算过程
- 预设示例 5 个：
  1. `3 + 4`
  2. `3 + 4 * 2`
  3. `(3 + 4) * 2`
  4. `7 / 0`（除零测试）
  5. `3 + 4 * (5 - 2)`

- [ ] **Step 5: Verify utils still pass**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/ast-grammar.test.js tests/utils/ast-tree.test.js tests/utils/ast-sdt.test.js tests/utils/ast-layout.test.js`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add pages/ast-builder/
git commit -m "feat(ast-builder): 页面骨架 — 输入/Token 流/AST 树视图/SDT 信息"
```

---

## Task 6: 注册 + 首页集成 + 模块文档

**Files:**
- Modify: `app.json`（在 `pages` 数组中插入 `"pages/ast-builder/ast-builder"`）
- Modify: `utils/tool-registry.js`（将 `ast-builder` 的 `available` 改为 `true`，补齐字段）
- Create: `docs/handoff/modules/ast-builder.md`

- [ ] **Step 1: Modify `app.json`**

在 `pages` 数组中按字母序插入 `"pages/ast-builder/ast-builder"`。

- [ ] **Step 2: Modify `utils/tool-registry.js`**

在 compiler 分类下 `ast-builder` 条目中：
- `available: true`
- 补齐 tagline, taglineDetail, tags, difficulty, intro 等字段

- [ ] **Step 3: Write `docs/handoff/modules/ast-builder.md`**

模块文档，涵盖概览、数据驱动、约定、测试、UI。

- [ ] **Step 4: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add app.json utils/tool-registry.js docs/handoff/modules/ast-builder.md
git commit -m "feat(ast-builder): 注册页面 + tool-registry 可用化 + 模块文档"
```

---

## Task 7: 验证完成 + PROJECT_HANDOFF 同步

**Files:**
- Modify: `PROJECT_HANDOFF.md`

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 2: Append to `PROJECT_HANDOFF.md`**

在 `## 最近重大变更` 顶部插入 AST 构建器上线记录。

- [ ] **Step 3: Commit**

```bash
git add PROJECT_HANDOFF.md
git commit -m "docs(handoff): AST 构建器上线记录"
```

---

## 验收清单

- [ ] `npm test` 全绿
- [ ] 首页「编译原理」分类 → AST 构建器卡片可点击
- [ ] 输入 `3 + 4 * 2` → AST 结构为 `+(3, *(4, 2))`（乘法优先）
- [ ] 括号改变优先级：`(3+4)*2` → 结构为 `*((+3,4), 2)`
- [ ] 求值结果正确（`3+4*2` → 11）
- [ ] 除零错误标注（`7/0` → 显示错误）
- [ ] 步进模式（词法→解析→SDT）正常
- [ ] 预设示例按钮可用
- [ ] 语法错误（括号不匹配）→ toast 提示
- [ ] 空输入 → toast 提示
- [ ] 表达式过长（>50 Token）→ toast 提示简化
- [ ] 树视图可折叠/展开子树
- [ ] PROJECT_HANDOFF.md 已更新
