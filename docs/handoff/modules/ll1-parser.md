# LL(1) 分析器模块

> 状态: 已上线
> 页面: `pages/ll1-parser/ll1-parser`

## 概览

LL(1) 分析器是一个可视化的编译原理教学工具，帮助学习者理解自顶向下语法分析的工作机制。用户输入上下文无关文法，工具自动计算 FIRST/FOLLOW 集、构造预测分析表，并支持输入串的预测分析过程逐步回放。

## 架构

| 文件 | 说明 |
|---|---|
| `utils/ll1-grammar.js` | 文法解析：产生式文本 → 内部 Grammar 表示；左递归检测 |
| `utils/ll1-core.js` | 核心算法：FIRST 集、FOLLOW 集、预测分析表、预测分析器 |
| `pages/ll1-parser/` | 页面（4 文件：js/wxml/wxss/json） |

## 数据流

```
文法文本 → parseGrammar() → Grammar
Grammar → computeFIRST() → FIRST 集
Grammar + FIRST → computeFOLLOW() → FOLLOW 集
Grammar + FIRST + FOLLOW → buildParseTable() → 分析表 + 冲突
Grammar + 分析表 + 输入串 → parseInput() → 步进列表
```

## 约定

| 项 | 值 |
|---|---|
| 文法输入格式 | 每行 `A → α \| β`，支持 `->` 替代 `→` |
| 空串表示 | `ε` 或 `epsilon` |
| 输入结束符 | `$`（自动添加） |
| 非终结符 | 出现在产生式左部的符号 |
| 终结符 | 其余非空白符号（不含 `→`、`\|`、`ε`） |
| FIRST 集 | 含 `ε` 表示该符号可推导出空串 |
| FOLLOW 集 | 不含 `ε`；start 符号的 FOLLOW 含 `$` |
| 不动点迭代 | 最多 100 轮，超限报错 |

## 左递归检测

当前仅检测**立即左递归**（`A → A α`）。间接左递归（`A → B β, B → A γ`）不在当前检测范围内。

## 冲突检测

LL(1) 冲突 = 预测分析表同一格子 >1 条产生式。当检测到冲突时：
- 该格子红色背景高亮
- 所有冲突的产生式堆叠显示
- 该文法被标记为「非 LL(1)」

## 页面 Tab

1. **文法总览** — 产生式列表、非终结符/终结符分类标识
2. **FIRST/FOLLOW** — 表格展示每个非终结符的 FIRST 和 FOLLOW 集
3. **分析表** — 二维网格表（非终结符 × 终结符），冲突格子红色
4. **串分析** — 栈视图 + 输入缓冲 + 输出序列 + 步进控制

## 预设示例

1. **表达式文法** — LL(1) 经典示例，无冲突
2. **括号匹配** — `S → ( S ) S \| ε`，简单递归文法
3. **if-else 文法** — 含 dangling-else 歧义，可观察 LL(1) 冲突

## 测试

```bash
npx jest tests/utils/ll1-grammar.test.js tests/utils/ll1-core.test.js
```

覆盖：
- 文法解析（标准文法、ε 产生式、多行处理、非法格式）
- FIRST 集（终结符、传播链、多层 ε）
- FOLLOW 集（$ 标记、ε 传播、多层链）
- 分析表（正确构造、冲突检测、无冲突验证）
- 预测分析（接受串、拒绝串、步进结构、空串）

## 设计风格

遵循 Claude Design 暖奶油画布：
- 页面底色 `#faf9f5`
- 卡片底色 `#efe9de`，圆角 24rpx
- CTA `#cc785c`（Active `#a9583e`）
- 冲突格子 `#f5d6d6`
- 接受状态 `#27ae60`
- 错误状态 `#c0392b`
