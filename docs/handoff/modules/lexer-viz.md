# 词法分析器 — 模块文档

**上线日期:** 2026-07-22

## 概述

词法分析器可视化教学工具：用户输入类 C 语言代码，工具执行词法分析并展示完整的 Token 化过程，包括源码高亮、Token 流展示、符号表管理、步进动画。

## 页面

`pages/lexer-viz/lexer-viz`

## 核心逻辑

| 文件 | 说明 |
|---|---|
| `utils/lexer-token.js` | Token 类型定义 + 正则规则集。定义 `TOKEN_RULES` 数组（12 个关键字 + 字符串/数字/运算符/分隔符/注释/标识符），`getRules()` 返回拷贝，`classifyToken(type)` 映射分类 |
| `utils/lexer-engine.js` | `tokenize(source, rules?)` — 纯函数词法分析引擎。返回 `{ tokens, errors, steps }`，支持最长匹配和自定义规则 |
| `utils/lexer-symbol-table.js` | `buildSymbolTable(tokens)` — 从 Token 流构建符号表，按首次出现行号排序 |
| `utils/lexer-highlight.js` | `tokenTypeToClass(type)` / `tokensToHighlightRanges(tokens, source)` — 语法高亮 CSS 类映射 |

### Token 形状

```js
{ type, lexeme, line, colStart, colEnd, regexRule? }
```

### Error 形状

```js
{ line, col, char, message }
```

### 符号表条目

```js
{ name, occurrences: [{ line, col }], count }
```

## 规则优先级

- **最长匹配**：同时匹配多个规则时，选择匹配字符最多的规则
- **关键字优先**：相同长度时，关键字规则优先于标识符规则
- **注释忽略**：注释内容不产生 Token，直接跳过
- **空白跳过**：空格、制表符、换行符不产生 Token

## Token 颜色方案

| 分类 | 颜色 | CSS 类 |
|---|---|---|
| 关键字 | `#cc785c` (珊瑚) | `hl-keyword` |
| 标识符 | `#141413` (暖墨) | `hl-identifier` |
| 字面量 (数字/字符串) | `#6b8c3e` (橄榄) / `#5a7d9a` (蓝灰) | `hl-literal` |
| 运算符 | `#996644` (棕) | `hl-operator` |
| 分隔符 | `#141413` (暖墨) | `hl-separator` |
| 注释 | `#8e8b82` (灰) | `hl-comment` |

## 交互

- 5 个预设示例：变量声明、函数调用、嵌套注释、多行字符串、完整程序
- textarea 编辑/粘贴代码（上限 5000 字符）
- 「分析」→ 执行完整 Token 化
- 「单步」→ 每次前进一个步骤（光标在源码上移动）
- 「全部」→ 跳至分析完成
- 「重置」→ 回到初始状态
- Token 卡片点击 → 模态框显示详情（类型、词素、行号、列号、分类、匹配规则）

## 数据约束

- 单次输入 max 5000 字符
- 支持类 C 语言子集（12 个关键字 + 基础类型）
- 纯本地分析，不联网

## 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/lexer-token.test.js` | 21 个用例：规则正则、优先级、最长匹配、分类函数 |
| `tests/utils/lexer-engine.test.js` | 34 个用例：Token 化、注释跳过、空白处理、非法字符、多行输入、自定义规则、步骤记录 |
| `tests/utils/lexer-symbol-table.test.js` | 9 个用例：标识符去重、出现位置收集、排序 |
| `tests/utils/lexer-highlight.test.js` | 18 个用例：分类映射、位置转换、高亮区间 |
