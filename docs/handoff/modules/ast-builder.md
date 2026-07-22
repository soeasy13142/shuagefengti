# AST 构建器 (ast-builder)

## 概述

「AST 构建器」是一个编译原理辅助学习工具，展示算术表达式从 Token 流到抽象语法树的构建过程，以及语法制导翻译（SDT）的求值过程。

## 文件结构

```
utils/ast-parser.js          # 词法分析 + LL(1) 递归下降解析器
utils/ast-eval.js            # AST 遍历工具 + 表达式求值 + 类型标注
utils/ast-draw.js            # Reingold-Tilford 简化版树形布局
tests/utils/ast-parser.test.js   # 解析器测试 (21 tests)
tests/utils/ast-eval.test.js     # 求值器测试 (25 tests)
tests/utils/ast-draw.test.js     # 布局测试 (7 tests)
pages/ast-builder/ast-builder.json   # 页面配置
pages/ast-builder/ast-builder.wxml   # 页面模板
pages/ast-builder/ast-builder.wxss   # 页面样式
pages/ast-builder/ast-builder.js     # 页面逻辑
```

## 数据流

```
输入表达式
  → tokenize() → Token 流
  → parseExpression() → 递归下降解析 → AST
  → annotateTypes() → 类型标注
  → layoutTree() → 坐标计算 → WXML 渲染
  → evaluateAST() → 数值结果
  → applySdtStep() → 步进求值
```

## 文法

LL(1) 版本，支持四则运算、括号、变量标识符：

```
E  → T E'
E' → + T E' | - T E' | ε
T  → F T'
T' → * F T' | / F T' | ε
F  → ( E ) | num | id
```

## 约定

- 节点颜色：数字 `#6b8c3e`，操作符 `#cc785c`，括号 `#5a7d9a`，标识符 `#996644`
- AST 为纯净的运算符/叶子节点结构（无非终结符包装节点）
- 所有 util 函数为纯函数，不修改输入
- Token 数量上限 50（防止渲染卡顿）
- 预设示例 5 个：简单加法、乘法优先、括号优先、除零测试、复杂嵌套

## 测试

```bash
npx jest tests/utils/ast-parser.test.js tests/utils/ast-eval.test.js tests/utils/ast-draw.test.js
```

共 53 个测试用例，覆盖词法分析、语法解析、AST 树操作、表达式求值、类型标注、树形布局。

## 页面 UI

- 输入区：表达式输入框 + 预设示例 Picker + 构建/单步/后退/重置按钮
- Token 流：横向展示，当前 Token 高亮
- 解析步骤：列表展示产生式应用过程
- AST 树视图：滚动容器内绝对定位渲染，节点颜色编码，支持属性显示切换
- SDT 规则：语义动作列表
- 求值结果：大号展示，错误红色显示

## 依赖

- `utils/ast-parser.js` — 无外部依赖
- `utils/ast-eval.js` — 依赖 `ast-parser.js`（测试中）
- `utils/ast-draw.js` — 依赖 `ast-parser.js`（测试中）
