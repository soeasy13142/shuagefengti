# Regex→DFA 可视化

> 由 `2026-07-19-regex-dfa-design.md` spec 实施落盘。

## 概览

交互式正则表达式到有限自动机教学工具：支持常见正则语法（`* | . () ? +`），逐步展示 Thompson 构造法生成 ε-NFA、子集构造法转换为 DFA、以及 DFA 状态转移表与模拟运行。

## 数据驱动

- `utils/regex-nfa.js`：递归下降解析器 + Thompson 构造法生成 ε-NFA
- `utils/nfa-dfa.js`：ε-闭包 + 子集构造法转换为 DFA
- `utils/dfa-simulate.js`：DFA 逐字符模拟运行

## 约定

| 项 | 取值 |
|---|---|
| 正则语法 | `* | . () ? +` |
| NFA 构造 | Thompson 构造法 |
| DFA 构造 | 子集构造法（ε-闭包 → move） |
| 状态数上限 | 50 |
| 递归深度上限 | 50 |

## 测试

`tests/utils/{regex-nfa,nfa-dfa,dfa-simulate}.test.js` 全覆盖。`npm test` 全绿。

## UI

页面布局：顶部正则输入 + 三步 Tab（NFA 状态图 / 子集构造 / DFA 转移表+状态图）+ 模拟运行入口。风格遵循 Claude Design 暖奶油画布。
