# 刷题主链路（Quiz Pipeline）

> 派生自 `PROJECT_HANDOFF.md` §7.2-§7.13。

## 概览

刷题模块是项目最核心、最早成型的模块。从用户导入 `.md` 试题文件开始，经过解析、预览、练习/考试刷题、判分、记录保存、错题入栈的全链路闭环。

链路：`quiz-list → import-preview → quiz → result / records → record-detail → wrong-questions`

## 7.2 工具函数（utils/util.js）

- `generateId()`：基于 `Date.now()` + `Math.random()` 生成字符串 ID
- `formatTime(date)`：格式化为 `YYYY-MM-DD HH:mm:ss`
- `formatDuration(seconds)`：格式化为 `N分N秒` 或 `N秒`
- 测试：`tests/utils/util.test.js`

## 7.3 本地存储封装（utils/storage.js）

四个核心 key：

```js
const KEYS = {
  PAPERS: 'papers',
  RECORDS: 'records',
  WRONG_QUESTIONS: 'wrongQuestions',
  TEMP_IMPORT: 'tempImportData'
};
```

能力：试卷 CRUD / 记录 CRUD / 错题 CRUD / 临时导入数据。`deletePaper()` 级联删除对应记录与错题。详见 `tests/utils/storage.test.js`。

## 7.4 Markdown 解析器（utils/markdown-parser.js）

入口 `parseMarkdown(text)`。支持两种格式：

```md
1. 题干
A. 选项A
B. 选项B
答案：A
```

```md
## 第1题
题干
A. 选项A
B. 选项B
**答案：B**
```

支持的题型：`single` / `multi` / `judge` / `fill` / `essay`。判型规则：选择题答案 `,` 去后 > 1 字符视为多选；非选择题含 `___` / `____` / `（ ）` 视为填空；其他为简答。详见 `tests/utils/markdown-parser.test.js`。

## 7.5 示例题

- `utils/sample-questions.js`：程序化注入的示例题
- `test-questions.md`：根目录的 Markdown 示例题，作为导入源测试用例
- `quiz-list` 提供 `onImportSample()` 一键导入示例题

## 7.6 首页（pages/index/）

工具箱布局的入口页。Hero 卡片为"开始刷题"主入口，其他功能卡片按顺序平铺，底部为记录与错题快捷入口。详见全局规范 `docs/DESIGN.md`。

## 7.7 试卷列表与导入（pages/quiz-list/）

- `onShow()` 加载本地 `papers`
- 点击试卷进入刷题页
- 删除试卷触发 `deletePaper()` 级联清理
- 导入路径：`wx.chooseMessageFile` → `readFileSync` → `parseMarkdown` → `setTempImportData` → 跳转 `import-preview`
- 提供 `onImportSample()` 一键导入示例题

## 7.8 导入预览（pages/import-preview/）

- 从 `tempImportData` 读取数据
- 缺失时 toast 数据加载失败并返回
- 计算并展示题型统计（single/multi/judge/fill/essay）
- 确认后组装 paper 并写入 `papers`，清掉 `tempImportData`

## 7.9 刷题页 / 刷题引擎（pages/quiz/）

核心状态：`currentIdx` / `currentQuestion` / `userAnswer` / `selectedMap` / `answered` / `showExplanation` / `answers` / `startTime`。

判分规则：

| 题型 | 判分 |
|---|---|
| 单选 | `userAnswer === question.answer` |
| 判断 | `userAnswer === question.answer` |
| 多选 | 答案排序后全等，顺序无关 |
| 填空 | 逗号分隔多空逐项 trim + lowercase |
| 简答 | 非空即"已作答" |

模式差异：
- practice：每答一题立即显示解析
- exam：提交只 toast，不自动跳题

`finishQuiz()` 必弹窗提示未答数量；`_doFinishQuiz()` 计算用时并写入 records 与 wrongQuestions。

## 7.10 结果页（pages/result/）

展示试卷名、模式、正确率、正确数、总题数、用时。提供"复盘错题"与"回首页"按钮。

## 7.11-7.13 答题记录、记录详情、错题本

- **records**：按 `endTime` 倒序加载所有记录
- **record-detail**：根据 `recordId` 找记录 + `paperId` 找原试卷，逐题展示用户答案与对错
- **wrong-questions**：支持隐藏已掌握、按时间/按试卷分组排序、标记掌握、重做未掌握错题

重做错题当前实现：将未掌握题作为临时试卷走 `import-preview`，确认为新 paper。语义可优化（见 `risks.md` 与 `future-plans.md`）。
