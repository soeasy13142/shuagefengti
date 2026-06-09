# 刷个冯题项目交接文档

> 生成时间：2026-06-08  
> 项目路径：`/Users/charliepan/Downloads/my-miniapp`  
> 目的：让下一次继续开发时，Claude/开发者可以快速恢复上下文，理解项目进度、整体思路、已完成内容、关键文件、测试状态和后续方向。

---

## 1. 一句话概述

`刷个冯题` 是一个微信小程序学习工具箱。当前已完成核心的 **Markdown 试题导入 + 本地刷题 + 练习/考试模式 + 答题记录 + 错题本**，并额外上线了 **排序可视化** 模块。项目采用微信小程序原生框架，纯前端、本地存储、无后端。

---

## 2. 当前开发进行到哪了

### 当前状态结论

项目已经不是初始化阶段，而是进入了 **MVP 功能完整 + 第二功能模块已初步上线** 的状态。

已完成：

1. 微信小程序基础工程搭建。
2. Jest 测试环境搭建。
3. 工具函数、本地存储封装、Markdown 解析器。
4. 首页/主菜单 UI 重设计。
5. 刷题模块全流程：
   - 导入 Markdown 文件；
   - 导入预览；
   - 试卷列表；
   - 一题一页刷题；
   - 练习模式；
   - 考试模式；
   - 结果页；
   - 答题记录；
   - 记录详情；
   - 错题本；
   - 错题重做。
6. 多个历史 bug 已修复。
7. 排序可视化模块已作为第二个工具入口上线。
8. 当前测试全部通过：**5 个测试套件，54 个测试用例全部通过**。

### Git 当前状态

当前分支：`master`

最近提交：

```text
42944d1 feat: 排序可视化模块
1ff3d52 v2.0: 全面UI重设计 + 多选修复 + 审计修复
c2900bd feat: add quiz engine, result, records, and wrong questions pages
3b598e3 feat: add quiz list and import preview pages
e762449 feat: add home page with feature card grid
43b0359 feat: add markdown parser with multi-format support
44e30fb feat: add local storage CRUD with tests
819f97c feat: add utility functions with tests
b0666db feat: add Jest test infrastructure
6f39cdc init: scaffold mini program project
```

当前有一个未提交变更：

- `project.config.json` 有微信开发者工具自动写入的配置项变更，例如 `compileWorklet`、`localPlugins`、`swc`、`disableSWC`、`packOptions`、`editorSetting` 等。
- 这看起来像微信开发者工具自动补充的本地项目配置，不是业务代码改动。

---

## 3. 项目整体思路

### 产品定位

这是一个 **多功能学习工具箱小程序**。

第一阶段重点是刷题：用户把 Markdown 试题文件导入到小程序，之后可以像刷题 App 一样逐题作答、查看结果、复盘历史记录和错题。

后续方向是继续扩展首页工具箱，目前已经扩展了排序可视化，单词记忆仍是预留入口。

### 技术路线

项目采用非常轻量的技术路线：

- 微信小程序原生框架；
- WXML + WXSS + JS；
- `wx.setStorageSync` / `wx.getStorageSync` 做纯本地存储；
- 不接后端；
- Markdown 解析使用纯正则，不引入 Markdown 第三方库；
- Jest 做纯 JS 逻辑测试。

这种方案的目标是：

1. 先快速跑通功能闭环；
2. 避免后端成本和账号体系复杂度；
3. 让试题、记录、错题都保存在用户本机；
4. 方便后续继续增加工具模块。

### 数据流主线

刷题模块的数据流如下：

```text
用户选择 .md 文件
  ↓
quiz-list 调用 wx.chooseMessageFile
  ↓
读取文件内容 wx.getFileSystemManager().readFileSync
  ↓
utils/markdown-parser.js 解析题目
  ↓
utils/storage.js 暂存 tempImportData
  ↓
import-preview 显示题型统计和确认导入
  ↓
确认后保存到 papers 本地存储
  ↓
quiz-list 展示试卷列表
  ↓
点击试卷进入 quiz 刷题页
  ↓
选择练习/考试模式
  ↓
答题过程中 answers 记录每题答案和正确性
  ↓
交卷后生成 record 并保存 records
  ↓
错题写入 wrongQuestions
  ↓
result 展示成绩
  ↓
records / record-detail / wrong-questions 用于复盘
```

### 首页工具箱结构

首页现在不是简单列表，而是重设计后的工具箱入口：

- 顶部品牌区：`刷个冯题`；
- 主功能 Hero 卡片：`开始刷题`；
- 功能卡片：
  - `排序可视化`：已可点击进入；
  - `单词记忆`：仍是即将上线；
- 底部快捷入口：
  - 答题记录；
  - 错题本。

---

## 4. 需求文档与实现计划位置

项目已有两份需求/计划文档：

1. `docs/superpowers/specs/2026-05-31-brushfengti-design.md`
   - 刷题小程序设计文档；
   - 描述产品概述、页面结构、模块拆分、数据结构和技术要点。

2. `docs/superpowers/plans/2026-05-31-brushfengti.md`
   - 实现计划；
   - 明确写了 agentic workers 应使用：
     - `superpowers:subagent-driven-development`，推荐；
     - 或 `superpowers:executing-plans`。
   - 原计划按任务拆分实现工具函数、存储、Markdown 解析、首页、试题列表、导入预览、刷题页、结果页、记录页、错题本等。

注意：原设计文档里说共 7 个页面，当前实际项目已经扩展到 9 个页面，新增了 `pages/sort-viz/sort-viz`，并且刷题模块实际包含 `import-preview`、`result`、`record-detail` 等完整页面。

---

## 5. 当前实际文件结构

核心文件如下：

```text
my-miniapp/
├── app.js
├── app.json
├── app.wxss
├── project.config.json
├── project.private.config.json
├── sitemap.json
├── package.json
├── package-lock.json
├── jest.config.js
├── test-questions.md
├── __mocks__/
│   └── wx.js
├── docs/
│   └── superpowers/
│       ├── plans/
│       │   └── 2026-05-31-brushfengti.md
│       └── specs/
│           └── 2026-05-31-brushfengti-design.md
├── utils/
│   ├── util.js
│   ├── storage.js
│   ├── markdown-parser.js
│   └── sample-questions.js
├── pages/
│   ├── index/
│   ├── quiz-list/
│   ├── import-preview/
│   ├── quiz/
│   ├── result/
│   ├── records/
│   ├── record-detail/
│   ├── wrong-questions/
│   └── sort-viz/
└── tests/
    ├── utils/
    │   ├── util.test.js
    │   ├── storage.test.js
    │   └── markdown-parser.test.js
    └── pages/
        ├── quiz-engine.test.js
        └── sort-viz.test.js
```

---

## 6. 页面注册状态

`app.json` 当前注册了 9 个页面：

```json
{
  "pages": [
    "pages/index/index",
    "pages/quiz-list/quiz-list",
    "pages/import-preview/import-preview",
    "pages/quiz/quiz",
    "pages/result/result",
    "pages/records/records",
    "pages/record-detail/record-detail",
    "pages/wrong-questions/wrong-questions",
    "pages/sort-viz/sort-viz"
  ]
}
```

窗口主题仍然是绿色：

- `navigationBarBackgroundColor`: `#07c160`
- `navigationBarTitleText`: `刷个冯题`
- `navigationBarTextStyle`: `white`

---

## 7. 已完成模块详解

### 7.1 基础工程与测试环境

相关文件：

- `package.json`
- `jest.config.js`
- `__mocks__/wx.js`

当前 `package.json`：

```json
{
  "name": "brushfengti",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "jest --verbose"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

测试命令：

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```

当前测试结果：

```text
Test Suites: 5 passed, 5 total
Tests:       54 passed, 54 total
Snapshots:   0 total
```

### 7.2 工具函数

文件：`utils/util.js`

提供：

- `generateId()`：基于 `Date.now()` 和 `Math.random()` 生成字符串 ID；
- `formatTime(date)`：格式化为 `YYYY-MM-DD HH:mm:ss`；
- `formatDuration(seconds)`：格式化为 `N分N秒` 或 `N秒`。

测试文件：`tests/utils/util.test.js`

### 7.3 本地存储封装

文件：`utils/storage.js`

核心 storage key：

```js
const KEYS = {
  PAPERS: 'papers',
  RECORDS: 'records',
  WRONG_QUESTIONS: 'wrongQuestions',
  TEMP_IMPORT: 'tempImportData'
};
```

提供能力：

- 试卷：
  - `getPapers()`
  - `savePaper(paper)`
  - `getPaperById(id)`
  - `deletePaper(id)`
- 记录：
  - `getRecords()`
  - `saveRecord(record)`
  - `getRecordsByPaperId(paperId)`
- 错题：
  - `getWrongQuestions()`
  - `getUnmasteredWrongQuestions()`
  - `addWrongQuestion({ questionId, paperId, question })`
  - `markMastered(questionId)`
- 临时导入数据：
  - `setTempImportData(data)`
  - `getTempImportData()`
  - `clearTempImportData()`

实现细节：

- `_get(key)` 读取 storage 后做 `JSON.parse`，异常返回空数组；
- `_set(key, data)` 使用 `JSON.stringify` 写入，异常时 toast `存储空间不足`；
- `deletePaper(id)` 已经做了级联删除：删除对应试卷、答题记录和错题；
- `TEMP_IMPORT` 是后来为了解决 URL 参数传大对象可能超长而加的临时存储。

测试文件：`tests/utils/storage.test.js`

### 7.4 Markdown 解析器

文件：`utils/markdown-parser.js`

入口函数：

```js
parseMarkdown(text)
```

支持格式：

1. 标准数字编号：

```md
1. 题干
A. 选项A
B. 选项B
答案：A
```

2. 增强标题格式：

```md
## 第1题
题干
A. 选项A
B. 选项B
**答案：B**
```

支持题型：

- `single`：单选；
- `multi`：多选；
- `judge`：判断；
- `fill`：填空；
- `essay`：简答。

解析逻辑摘要：

- 先统一换行；
- 使用正则按题号或 `## 第N题` 分块；
- 每块提取题干、选项、答案、解析；
- 选项现在存为对象：

```js
{ letter: 'A', text: 'A. xxx' }
```

- 对选择题：
  - 如果答案去掉逗号后长度大于 1，则判为多选；
  - 多选答案会把 `A,C` 归一化为 `AC`；
- 对填空题：
  - 只有非选择题且题干含 `___`、`____` 或 `（ ）` 时判为填空；
  - 填空答案里的逗号会被保留，用于多空答案，例如 `北京,上海`；
- 否则默认为简答。

测试文件：`tests/utils/markdown-parser.test.js`

### 7.5 示例题

文件：`utils/sample-questions.js`

用途：

- `quiz-list` 页面提供 `onImportSample()`，允许导入示例题；
- 便于在没有真实 `.md` 文件时快速体验刷题流程。

另有 `test-questions.md`，内容是前端基础、Git、HTTP、RESTful API 等示例题。

### 7.6 首页/主菜单

目录：`pages/index/`

文件：

- `pages/index/index.js`
- `pages/index/index.wxml`
- `pages/index/index.wxss`
- `pages/index/index.json`

当前功能：

- 展示动态渐变背景；
- 展示标题 `刷个冯题` 和 slogan；
- Hero 卡片 `开始刷题`；
- 点击 Hero 进入 `/pages/quiz-list/quiz-list`；
- 功能卡片：
  - `排序可视化`：`available: true`，点击进入 `/pages/sort-viz/sort-viz`；
  - `单词记忆`：`available: false`，点击 toast `功能开发中`；
- 底部入口：
  - 答题记录；
  - 错题本。

注意：`features` 数组里只有排序可视化和单词记忆，刷题作为 Hero 主卡片单独存在。

### 7.7 试卷列表与导入入口

目录：`pages/quiz-list/`

文件：

- `pages/quiz-list/quiz-list.js`
- `pages/quiz-list/quiz-list.wxml`
- `pages/quiz-list/quiz-list.wxss`
- `pages/quiz-list/quiz-list.json`

当前功能：

- `onShow()` 加载本地 `papers`；
- 展示已导入试卷列表；
- 点击试卷进入刷题页；
- 删除试卷，删除时级联清理相关记录和错题；
- 从聊天文件选择 `.md` 导入：
  - `wx.chooseMessageFile`；
  - `wx.getFileSystemManager().readFileSync`；
  - `parseMarkdown`；
  - 成功后通过 `storage.setTempImportData` 暂存；
  - 跳转导入预览页；
- 支持导入示例题：`onImportSample()`；
- 可跳转答题记录和错题本。

重要实现改动：

- 原计划是把题目 JSON 作为 URL 参数传给 `import-preview`；
- 当前实现改为使用 `TEMP_IMPORT` 本地临时存储，避免题目过多时 URL 超长。

### 7.8 导入预览页

目录：`pages/import-preview/`

文件：

- `pages/import-preview/import-preview.js`
- `pages/import-preview/import-preview.wxml`
- `pages/import-preview/import-preview.wxss`
- `pages/import-preview/import-preview.json`

当前功能：

- 从 `storage.getTempImportData()` 读取临时导入数据；
- 如果数据缺失，toast `数据加载失败` 并返回；
- 计算题型统计：
  - single；
  - multi；
  - judge；
  - fill；
  - essay；
- 显示试卷名、题目数量和题型分布；
- 确认导入后组装 paper：

```js
{
  id,
  name,
  importTime,
  questionCount,
  questions
}
```

- 保存到 `papers`；
- 清除 `tempImportData`；
- 返回上一页。

### 7.9 刷题页/刷题引擎

目录：`pages/quiz/`

文件：

- `pages/quiz/quiz.js`
- `pages/quiz/quiz.wxml`
- `pages/quiz/quiz.wxss`
- `pages/quiz/quiz.json`

当前功能：

- 根据 `paperId` 读取试卷；
- 首次进入显示模式选择：
  - `practice`：练习模式；
  - `exam`：考试模式；
- 当前题状态：
  - `currentIdx`
  - `currentQuestion`
  - `userAnswer`
  - `selectedMap`
  - `answered`
  - `showExplanation`
  - `answers`
  - `startTime`
- 单选：点击选项保存答案；
- 多选：使用 `selectedMap` 管理选择状态，修复了多选切换问题；
- 判断：A 表示对，B 表示错；
- 填空/简答：输入框/文本域；
- `checkAnswer(question, userAnswer)` 负责判分；
- `onSubmit()`：
  - 未作答 toast；
  - 保存答案；
  - 练习模式显示解析；
  - 考试模式只提示 `答案已保存`，不自动跳题；
- `_autoSave()`：切题前自动保存当前答案；
- `goNext()` / `goPrev()`：
  - 自动保存当前题；
  - 恢复历史答案；
  - 恢复多选 selectedMap；
- `finishQuiz()`：
  - 若未答完，弹窗确认；
  - 若已答完，也弹窗确认；
- `_doFinishQuiz()`：
  - 计算用时；
  - 统计正确数和正确率；
  - 保存答题记录；
  - 将错题写入错题本；
  - 跳转结果页。

判分规则：

| 题型 | 判分逻辑 |
|---|---|
| 单选 | `userAnswer === question.answer` |
| 判断 | `userAnswer === question.answer` |
| 多选 | 答案排序后全等，顺序无关 |
| 填空 | 按逗号分隔，多空逐项比较，trim + lowercase |
| 简答 | 只要非空即算已作答 |

### 7.10 结果页

目录：`pages/result/`

文件：

- `pages/result/result.js`
- `pages/result/result.wxml`
- `pages/result/result.wxss`
- `pages/result/result.json`

当前功能：

- 从 URL 参数读取 `resultData`；
- 展示：
  - 试卷名；
  - 模式；
  - 正确率；
  - 正确数；
  - 总题数；
  - 用时；
- `onReviewWrong()` 跳转到记录详情页复盘；
- `onGoHome()` 回到首页。

### 7.11 答题记录列表

目录：`pages/records/`

文件：

- `pages/records/records.js`
- `pages/records/records.wxml`
- `pages/records/records.wxss`
- `pages/records/records.json`

当前功能：

- 从 `storage.getRecords()` 读取记录；
- 按 `endTime` 倒序排序；
- 点击记录进入 `record-detail`。

### 7.12 记录详情页

目录：`pages/record-detail/`

文件：

- `pages/record-detail/record-detail.js`
- `pages/record-detail/record-detail.wxml`
- `pages/record-detail/record-detail.wxss`
- `pages/record-detail/record-detail.json`

当前功能：

- 根据 `recordId` 找答题记录；
- 再根据 `paperId` 找原试卷；
- 如果试卷已删除，会设置 `paperDeleted: true`；
- 可逐题查看：
  - 当前题；
  - 用户答案；
  - 正确/错误状态；
  - selectedMap 用于多选展示；
- 支持上一题/下一题。

注意：由于 `deletePaper` 当前会级联删除记录，正常情况下试卷删除后关联记录也会消失；`paperDeleted` 分支是容错逻辑。

### 7.13 错题本

目录：`pages/wrong-questions/`

文件：

- `pages/wrong-questions/wrong-questions.js`
- `pages/wrong-questions/wrong-questions.wxml`
- `pages/wrong-questions/wrong-questions.wxss`
- `pages/wrong-questions/wrong-questions.json`

当前功能：

- 读取 `wrongQuestions`；
- 支持隐藏/显示已掌握错题；
- 支持按时间排序或按试卷分组逻辑排序；
- 可标记已掌握；
- 可重做未掌握错题。

重做错题当前实现方式：

```text
wrong-questions
  ↓
取 unmastered wrongQuestions
  ↓
提取 question 列表
  ↓
写入 tempImportData，name = 错题重做
  ↓
跳转 import-preview
  ↓
用户确认后，错题会被保存成一套新试卷
```

这个实现可用，但从产品语义上说，它更像“把错题重新导入为临时试卷/新试卷”。如果后续要优化，可以让错题重做直接进入 `quiz`，不经过导入确认，也不产生新 paper。

### 7.14 排序可视化模块

目录：`pages/sort-viz/`

文件：

- `pages/sort-viz/sort-viz.js`
- `pages/sort-viz/sort-viz.wxml`
- `pages/sort-viz/sort-viz.wxss`
- `pages/sort-viz/sort-viz.json`

当前功能：

- 首页卡片可进入；
- 支持三种排序算法：
  - 选择排序；
  - 冒泡排序；
  - 快速排序；
- 用户可输入数字，支持逗号/中文逗号/顿号等分隔；
- 数字范围：1-99；
- 数量限制：2-20；
- 支持随机生成 5/10/15/20 个数字；
- 可视化柱状图；
- 步骤状态：
  - compare；
  - swap；
  - sorted；
  - pivot；
  - done；
- 动画控制：
  - 播放；
  - 暂停；
  - 上一步；
  - 下一步；
  - 重置；
  - 调整速度；
- 展示步骤描述、比较次数、交换次数。

测试文件：`tests/pages/sort-viz.test.js`

测试覆盖：

- 选择排序最终排序正确；
- 冒泡排序最终排序正确；
- 快速排序最终排序正确；
- done 步骤存在；
- sorted 标记存在；
- 冒泡排序对已排序数组不产生 swap；
- 快速排序包含 pivot；
- step 格式正确；
- swap 步骤索引数量正确。

---

## 8. 数据结构

### 8.1 试卷 paper

```js
{
  id: 'uuid-like-id',
  name: '试卷名称',
  importTime: '2026-06-08 12:00:00',
  questionCount: 50,
  questions: [Question]
}
```

### 8.2 题目 question

当前实际结构：

```js
{
  id: 'question-id',
  type: 'single' | 'multi' | 'judge' | 'fill' | 'essay',
  stem: '题干',
  options: [
    { letter: 'A', text: 'A. 选项内容' },
    { letter: 'B', text: 'B. 选项内容' }
  ],
  answer: 'A',
  explanation: '解析内容'
}
```

注意：早期设计文档里 `options` 是字符串数组，但当前实现是对象数组。后续开发要以当前代码为准。

### 8.3 答题记录 record

```js
{
  id: 'record-id',
  paperId: 'paper-id',
  paperName: '试卷名称',
  mode: 'practice' | 'exam',
  startTime: '2026-06-08 12:00:00',
  endTime: '2026-06-08 12:10:00',
  duration: 600,
  totalQuestions: 50,
  correctCount: 42,
  accuracy: 84,
  answers: {
    'question-id': {
      userAnswer: 'A',
      correct: true
    }
  }
}
```

### 8.4 错题 wrongQuestion

```js
{
  questionId: 'question-id',
  paperId: 'paper-id',
  question: Question,
  wrongCount: 2,
  mastered: false,
  lastWrongTime: '2026-06-08T12:00:00.000Z'
}
```

### 8.5 临时导入数据 tempImportData

```js
{
  name: '试卷名称',
  questions: [Question]
}
```

用途：页面间传递导入结果，避免 URL 参数过长。

---

## 9. 已修复的关键问题

根据记忆和代码状态，已修复过这些问题：

1. Markdown 解析器不支持 `## 第1题` 格式；
   - 已通过 stem 提取逻辑修复。
2. 填空题答案里的逗号被清理；
   - 当前只对选择题多选答案清理逗号，填空题保留逗号用于多空。
3. 考试模式多选题无法选择；
   - 当前 `onToggleMulti` 在考试模式不会被 `answered` 阻塞；
   - 使用 `selectedMap` 管理多选状态。
4. 考试模式提交后自动清空/跳题导致体验问题；
   - 当前考试模式提交只保存答案并 toast，不自动跳题。
5. 允许未答完直接交卷；
   - 当前 `finishQuiz()` 会弹窗提示未答数量。
6. URL 传导入数据可能过长；
   - 当前改用 `tempImportData` 本地临时存储。
7. 删除试卷遗留记录/错题；
   - 当前 `deletePaper()` 做了级联删除。

---

## 10. 测试状态

### 测试命令

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```

### 当前测试结果

最近一次运行结果：

```text
PASS tests/pages/sort-viz.test.js
PASS tests/utils/storage.test.js
PASS tests/utils/markdown-parser.test.js
PASS tests/utils/util.test.js
PASS tests/pages/quiz-engine.test.js

Test Suites: 5 passed, 5 total
Tests:       54 passed, 54 total
Snapshots:   0 total
```

### 测试覆盖范围

已覆盖：

- 工具函数：ID、时间格式、时长格式；
- 本地存储：试卷、记录、错题；
- Markdown 解析：标准题、增强题、多选、判断、填空、简答、解析；
- 刷题引擎关键纯逻辑：
  - 多选切换；
  - WXML 模板兼容性相关字符串逻辑；
  - 各题型判分；
- 排序可视化算法步骤生成。

未覆盖或覆盖较弱：

- 小程序页面真实交互流程没有端到端测试；
- WXML/WXSS 渲染没有自动化测试；
- 文件导入真实 `wx.chooseMessageFile` 流程没有集成测试；
- 本地存储容量不足场景只在代码里 toast，没有测试；
- 排序可视化测试中步骤生成器是复制出来的测试函数，不是直接 import 页面中的实现；后续可考虑抽出纯函数到 `utils/sort-algorithms.js` 后测试真实实现。

---

## 11. 当前可见风险和注意点

### 11.1 `project.config.json` 有未提交改动

这是微信开发者工具常见自动配置变更。继续开发前建议先看一下是否要提交或忽略。

当前 diff 包括：

- `compileWorklet`
- `localPlugins`
- `condition`
- `swc`
- `disableSWC`
- `simulatorPluginLibVersion`
- `packOptions`
- `editorSetting`

如果只是本机工具生成，可以不作为业务变更处理。

### 11.2 错题重做流程语义可以优化

当前错题重做会跳到 `import-preview`，确认后保存为一套新试卷。这能跑通，但不够自然。

后续更好的方案：

```text
wrong-questions 直接创建临时 quiz session
  ↓
quiz 页面支持 source=wrong 或 tempQuestions
  ↓
直接进入刷题，不生成新 paper
```

### 11.3 排序可视化算法逻辑与测试逻辑重复

`tests/pages/sort-viz.test.js` 复制了排序步骤生成器，而不是直接测试 `pages/sort-viz/sort-viz.js` 的函数。

后续可以：

1. 把算法步骤生成器抽到 `utils/sort-algorithms.js`；
2. 页面调用这个工具模块；
3. 测试直接 import 该模块。

这样能避免测试与真实实现分叉。

### 11.4 `Date.now()` + `Math.random()` ID 对小项目够用，但不是强 UUID

目前纯本地使用没问题。如果未来引入云同步/多端合并，建议换更稳的 ID 方案。

### 11.5 解析器仍是正则解析，格式扩展要谨慎

当前 Markdown 解析器适合固定试题格式，但不是完整 Markdown parser。

新增格式时建议补测试，例如：

- 答案在同一行标题后；
- 选项跨行；
- 小写选项；
- 题干里包含 `A.` 字样；
- 答案有空格、顿号、中文逗号；
- 判断题答案是 `对/错` 而不是 `A/B`。

### 11.6 简答题现在“非空即正确”

这符合原计划中的“显示参考答案，用户自行判断（标记已作答）”的轻量方案，但从统计角度可能让简答题正确率偏高。

后续可优化为：

- 简答提交后显示参考答案；
- 用户点击“我答对了 / 我答错了”；
- 再写入 records 和 wrongQuestions。

### 11.7 记录详情依赖原试卷存在

`record-detail` 当前主要从 paper 里取 questions。如果试卷被删除，理论上记录也被级联删除，所以通常没问题。

如果未来希望“删除试卷但保留历史记录”，就需要在 record 里冗余保存完整 questions 快照。

---

## 12. 下一步开发建议

### 优先级 P0：继续前先做的检查

1. 运行测试：

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```

2. 查看工作区：

```bash
git -C /Users/charliepan/Downloads/my-miniapp status --short
```

3. 确认 `project.config.json` 的未提交变化是否要保留。

### 优先级 P1：完善已有刷题模块

建议方向：

1. 优化错题重做：不再经过导入预览，不生成新试卷。
2. 简答题改为自评模式。
3. 增加按试卷筛选记录/错题。
4. 增加导入失败时的错误详情，例如提示第几题解析失败。
5. 增加试卷重命名功能。
6. 增加清空记录、清空错题、导出数据等本地数据管理。
7. 改进 Markdown 解析兼容性。

### 优先级 P2：完善排序可视化

建议方向：

1. 抽出排序算法纯函数到 `utils/sort-algorithms.js`。
2. 增加插入排序、归并排序、堆排序。
3. 增加算法复杂度说明卡片。
4. 增加每一步伪代码高亮。
5. 修复/确认上一步回放的原始数组恢复逻辑是否完全可靠。
6. 在首页卡片上加入更详细描述。

### 优先级 P3：新模块

当前首页仍预留：

- `单词记忆`

可开发方向：

1. 单词卡片；
2. 自定义单词本；
3. 本地导入 CSV/Markdown；
4. 记忆状态；
5. 拼写测试；
6. 错词复习。

---

## 13. 建议下一次调用/使用的 skills

原计划文档明确写了 superpowers 相关建议：

- `superpowers:subagent-driven-development`：推荐用于按计划任务拆分实现；
- `superpowers:executing-plans`：适合按已有 plan 的 checkbox 逐项执行。

当前 Claude Code 会话里可见的相关 skills/命令包括：

### 13.1 继续开发时推荐

- `code-review`  
  用于审查当前 diff，找 correctness bug、复用/简化/效率问题。适合完成一批改动后调用。

- `simplify`  
  用于专门做复用、简化、效率、代码高度整理。不主要找 bug。

- `verify`  
  用于要求验证某个改动是否真的工作。比如“验证错题重做不再创建新试卷”。

- `run`  
  用户要求启动、运行、截图、观察真实 App 时使用。

- `code-reviewer`  
  可作为审阅子 agent/skill，用于复杂变更后的代码审阅。

### 13.2 设计/UI 相关推荐

- `ui-ux-pro-max`  
  适合继续优化首页、刷题页、排序可视化 UI。

- `ux-designer`  
  适合先梳理用户流程和交互方案。

- `ckm-design` / `ckm-ui-styling` / `ckm-design-system`  
  适合做视觉规范、设计 token、组件规范和统一样式。

### 13.3 配置/自动化相关

- `update-config`  
  如果需要改 Claude Code settings、权限、hooks、环境变量等。

- `fewer-permission-prompts`  
  如果开发中频繁出现只读命令权限确认，可扫描并加入 allowlist。

### 13.4 文档/研究相关

- `deep-research`  
  如果要调研竞品、学习工具设计、记忆算法等，可用。

- `context7-mcp` / Context7 MCP  
  当涉及微信小程序 API、Jest、或其他库/API 文档时，应先查最新文档再回答。当前用户全局规则也要求：凡是库、框架、SDK、API、CLI、云服务相关问题，都使用 Context7。

---

## 14. 如果下一次要继续开发，建议开场流程

下一次继续开发时，建议 Claude 先做：

```text
1. 阅读本文件 PROJECT_HANDOFF.md。
2. 查看 git status。
3. 运行 npm test。
4. 根据用户具体需求，读取相关页面和 utils 文件。
5. 如果是较大功能，先进入 plan mode 给出实施计划。
6. 修改代码。
7. 运行相关测试和全量测试。
8. 必要时调用 code-review / verify / run。
9. 更新本交接文档。
```

推荐命令：

```bash
cd /Users/charliepan/Downloads/my-miniapp
npm test
git status --short
git log --oneline --decorate -n 10
```

---

## 15. 关键文件速查

| 目的 | 文件 |
|---|---|
| 页面注册 | `app.json` |
| 首页入口 | `pages/index/index.js` / `.wxml` / `.wxss` |
| 试卷列表与导入 | `pages/quiz-list/quiz-list.js` |
| 导入预览 | `pages/import-preview/import-preview.js` |
| 刷题核心逻辑 | `pages/quiz/quiz.js` |
| 结果页 | `pages/result/result.js` |
| 记录列表 | `pages/records/records.js` |
| 记录详情 | `pages/record-detail/record-detail.js` |
| 错题本 | `pages/wrong-questions/wrong-questions.js` |
| 排序可视化 | `pages/sort-viz/sort-viz.js` |
| 本地存储 | `utils/storage.js` |
| Markdown 解析 | `utils/markdown-parser.js` |
| 工具函数 | `utils/util.js` |
| 示例题 | `utils/sample-questions.js` / `test-questions.md` |
| 项目设计文档 | `docs/superpowers/specs/2026-05-31-brushfengti-design.md` |
| 实现计划 | `docs/superpowers/plans/2026-05-31-brushfengti.md` |
| 测试配置 | `jest.config.js` |
| wx mock | `__mocks__/wx.js` |

---

## 16. 本次交接文档生成时实际核验过的内容

本次生成本文档时已实际做过：

1. 浏览项目文件结构，排除 `.git` 和 `node_modules` 后确认关键文件。
2. 阅读 docs 下两份文档：
   - `docs/superpowers/plans/2026-05-31-brushfengti.md`
   - `docs/superpowers/specs/2026-05-31-brushfengti-design.md`
3. 阅读关键源码：
   - `app.js`
   - `app.json`
   - `utils/storage.js`
   - `utils/markdown-parser.js`
   - `utils/util.js`
   - 首页、刷题列表、导入预览、刷题页、结果页、记录页、记录详情、错题本、排序可视化页面 JS/WXML。
4. 搜索 TODO/待办/即将上线相关文本。
5. 查看 git status 和最近提交。
6. 运行全量测试，确认 54 个测试全部通过。

---

## 17. 当前最短恢复摘要

如果只想用 30 秒恢复上下文，请看这段：

```text
这是 /Users/charliepan/Downloads/my-miniapp 下的微信小程序“刷个冯题”。
它是一个本地学习工具箱，核心刷题模块已经完成：Markdown 导入、题型解析、试卷列表、练习/考试刷题、结果页、答题记录、记录详情、错题本、错题重做。
项目无后端，使用 wx.setStorageSync；Markdown 解析在 utils/markdown-parser.js；本地数据 CRUD 在 utils/storage.js；刷题核心逻辑在 pages/quiz/quiz.js。
首页已经 UI 重设计，刷题是 Hero 主入口，排序可视化模块也已经上线，单词记忆仍是即将上线。
当前测试：npm test 通过，5 suites / 54 tests。
当前唯一可见未提交变化是 project.config.json 的微信开发者工具配置项。
下一步适合做：优化错题重做流程、简答题自评、增强 Markdown 解析、完善排序可视化、开发单词记忆模块。
```

---

## 18. 用户最新产品定位与偏好（2026-06-09 补充）

这部分来自用户对“下一阶段新增功能”的明确回答，应作为后续规划的重要约束。

### 18.1 目标用户

用户希望这个小程序：

1. **主要给自己学习使用**；
2. **有时会给朋友使用**；
3. **后期希望做成长效运营产品**，甚至具备盈利可能。

这意味着当前阶段不必过早引入复杂后端、账号体系或商业化系统，但每次新增功能都应该尽量避免“只能自己临时用”的硬编码，最好保留未来产品化空间。

### 18.2 功能兴趣方向

用户明确感兴趣的方向：

1. **学习效率类**
   - 今日复习；
   - 间隔重复；
   - 错题巩固；
   - 学习计划；
   - 薄弱点分析。

2. **可视化学习类**
   - 算法/数据结构可视化；
   - 学习数据图表；
   - 知识图谱；
   - 题目掌握度可视化。

3. **AI 辅助类**
   - AI 出题；
   - AI 讲解错题；
   - AI 从笔记生成题库；
   - AI 修复不规范 Markdown；
   - AI 学习建议。

### 18.3 下一阶段偏好

用户明确说：

- 下一步更偏向增加 **炫技功能**；
- 暂时继续 **本地存储**；
- 后期做成长效运营产品时，再转向 **云存储/云开发**；
- 下一开发周期控制在 **一周左右**。

### 18.4 规划原则

因此下一阶段规划应满足：

1. 一周内可以做出明显可展示效果；
2. 尽量复用现有刷题、错题、记录、排序可视化基础；
3. 不引入后端依赖；
4. 保留未来 AI/云端扩展接口；
5. 能让朋友看到时觉得“这个小程序有亮点”；
6. 不破坏现有 54 个测试全部通过的基础。

---

## 19. 使用 superpowers brainstorming 后的功能脑暴与收敛

本节按 `superpowers/brainstorming` 的思路整理：先探索上下文，再结合用户偏好发散方案，最后收敛为推荐路线。

### 19.1 当前项目上下文复盘

当前项目已经具备三个基础资产：

1. **刷题资产**
   - 题库导入；
   - 五种题型；
   - 练习/考试模式；
   - 记录和错题。

2. **本地数据资产**
   - `papers`；
   - `records`；
   - `wrongQuestions`；
   - `tempImportData`。

3. **可视化资产**
   - 首页已经重设计；
   - 排序可视化已上线；
   - 已有动画步骤、播放控制、统计信息。

所以下一步最适合的不是另起炉灶，而是把“刷题数据”和“可视化炫技”结合起来。

### 19.2 候选方向 A：学习数据驾驶舱（推荐）

一句话：把用户刷题记录、正确率、错题、题型表现做成一个酷炫的数据可视化中心。

#### 功能内容

新增一个“学习数据驾驶舱”页面，展示：

- 累计刷题数；
- 累计练习次数；
- 总体正确率；
- 错题数量；
- 已掌握错题数量；
- 最近 7 天刷题趋势；
- 最近 7 天正确率趋势；
- 各题型正确率；
- 最薄弱题型；
- 学习热力图；
- 学习建议卡片。

#### 炫技点

- 首页增加类似“数据大屏”的入口；
- 页面可做成深色科技风；
- 用纯 WXML/WXSS 做柱状图、环形进度、雷达/条形替代图；
- 不引入图表库也能展示很强的视觉效果；
- 后续可以接 AI 生成学习建议。

#### 优点

- 一周内可完成；
- 完全本地化；
- 复用现有 records/wrongQuestions；
- 给朋友展示时观感强；
- 为后期运营产品的数据分析能力打基础。

#### 缺点

- 如果本地记录很少，页面数据会显得空；
- 需要设计空状态和示例数据模式；
- 图表如果纯手写，需要控制复杂度。

#### 适合程度

非常适合当前阶段。它兼顾学习效率、可视化学习、炫技展示和未来 AI 建议扩展。

### 19.3 候选方向 B：AI 学习助手壳子 + 本地模拟 AI

一句话：先做一个“AI 学习助手”入口和交互体验，但暂时不接真实大模型，先用规则引擎基于本地数据生成建议。

#### 功能内容

新增“AI 学习助手”页面，展示：

- 今日学习总结；
- 根据错题生成薄弱点；
- 根据正确率生成复习建议；
- 根据题型表现生成下一步计划；
- 预留“AI 讲解错题”“AI 生成题目”入口。

当前阶段不调用真实 AI，只用本地规则模拟：

```text
如果多选正确率低于 70%，提示：多选题是当前薄弱点，建议开启多选专项训练。
如果错题超过 10 道，提示：建议先完成错题复习。
如果 7 天没有记录，提示：建议今天完成一次 10 题速刷。
```

#### 炫技点

- 看起来像 AI 助手；
- 可以做聊天卡片式 UI；
- 未来真实接入 AI 时页面和数据接口可复用。

#### 优点

- 很贴合用户对 AI 辅助类的兴趣；
- 不需要后端；
- 可以快速做出产品感；
- 为后期云端/AI 付费功能埋点。

#### 缺点

- 当前不是“真 AI”，如果文案过度包装容易误导；
- 真实 AI 后续仍需要后端或云函数保护 API Key；
- 如果一周内同时做数据驾驶舱和 AI 助手，范围可能偏大。

#### 适合程度

适合作为学习数据驾驶舱中的一个模块，而不是单独作为第一优先级大功能。

### 19.4 候选方向 C：算法可视化升级包

一句话：继续扩展现有排序可视化，把它做成更完整的算法学习模块。

#### 功能内容

在现有 `sort-viz` 基础上增加：

- 插入排序；
- 归并排序；
- 堆排序；
- 伪代码高亮；
- 算法复杂度说明；
- 每步解释；
- 算法对比页。

#### 炫技点

- 动画明显；
- 适合展示；
- 与“学习工具箱”定位一致。

#### 优点

- 当前已有排序可视化基础；
- 一周内可以扩展不少效果；
- 对编程学习很有价值。

#### 缺点

- 与刷题核心数据关系较弱；
- 对“长期运营刷题产品”的帮助不如数据驾驶舱；
- 如果继续堆算法，可维护性需要先重构步骤生成器。

#### 适合程度

适合作为第二优先级，或在数据驾驶舱之后继续做。

### 19.5 最终推荐路线

综合用户偏好和当前项目状态，推荐下一开发周期做：

```text
学习数据驾驶舱 + 轻量 AI 学习建议
```

理由：

1. 它是炫技功能：视觉上比普通表单/列表更有冲击力；
2. 它是学习效率功能：能帮助用户知道自己哪里弱；
3. 它是 AI 辅助功能的前置基础：先做本地规则建议，未来替换为真实 AI；
4. 它不需要云端：符合当前继续本地存储的约束；
5. 它一周内可完成：范围可控；
6. 它适合未来产品化：数据分析和学习建议是长期运营产品的重要模块。

---

## 20. 下一阶段推荐功能：学习数据驾驶舱 + 轻量 AI 学习建议

### 20.1 功能名称

建议命名为：

```text
学习驾驶舱
```

或者更有产品感：

```text
学习雷达
```

推荐使用：**学习驾驶舱**。

原因：

- 比“数据统计”更有科技感；
- 比“学习报告”更适合做常驻入口；
- 后续可以承载 AI 助手、趋势分析、复习建议。

### 20.2 一句话目标

基于本地答题记录和错题数据，生成一个可视化学习数据中心，让用户快速看到学习成果、薄弱题型、最近趋势，并获得本地规则生成的“AI 风格学习建议”。

### 20.3 MVP 范围

一周版本只做本地 MVP，不接真实 AI，不接云端。

必须包含：

1. 首页新增入口：`学习驾驶舱`；
2. 新增页面：`pages/dashboard/dashboard`；
3. 新增统计模块：`utils/analytics.js`；
4. 从 `records` 和 `wrongQuestions` 计算数据；
5. 展示关键指标卡片；
6. 展示最近 7 天刷题趋势；
7. 展示题型正确率；
8. 展示错题掌握情况；
9. 展示规则生成的学习建议；
10. 添加单元测试。

暂不包含：

1. 真实 AI API；
2. 微信云开发；
3. 登录系统；
4. 多人排行榜；
5. 复杂图表库；
6. 导出 PDF/图片报告；
7. 复杂知识图谱。

### 20.4 页面体验

页面建议采用深色科技风，与当前首页的渐变玻璃风呼应。

页面结构：

```text
学习驾驶舱
├── 顶部总览区
│   ├── 总刷题数
│   ├── 总练习次数
│   ├── 平均正确率
│   └── 当前错题数
├── 学习雷达区
│   ├── 最强题型
│   ├── 最弱题型
│   └── 题型正确率条形图
├── 7天趋势区
│   ├── 每日刷题量柱状图
│   └── 每日正确率折线/条形图
├── 错题掌握区
│   ├── 未掌握错题
│   ├── 已掌握错题
│   └── 错题掌握率
└── AI学习建议区
    ├── 今日建议
    ├── 薄弱点提醒
    └── 下一步行动按钮
```

### 20.5 数据来源

不新增主业务数据来源，只读取现有 storage：

- `storage.getRecords()`；
- `storage.getWrongQuestions()`；
- 必要时读取 `storage.getPapers()` 计算题库数。

### 20.6 新增 analytics 数据模型

建议 `utils/analytics.js` 暴露一个主函数：

```js
function buildDashboardData(records, wrongQuestions, papers, now) {
  return {
    overview: {
      totalSessions: 0,
      totalQuestions: 0,
      averageAccuracy: 0,
      totalCorrect: 0,
      wrongCount: 0,
      masteredWrongCount: 0,
      paperCount: 0
    },
    typeStats: [
      {
        type: 'single',
        label: '单选',
        total: 0,
        correct: 0,
        accuracy: 0
      }
    ],
    sevenDayTrend: [
      {
        date: '06-09',
        count: 0,
        accuracy: 0
      }
    ],
    weakSpot: {
      type: 'multi',
      label: '多选',
      accuracy: 0
    },
    strengths: {
      type: 'judge',
      label: '判断',
      accuracy: 0
    },
    suggestions: [
      {
        level: 'warning',
        title: '多选题需要加强',
        content: '最近多选题正确率偏低，建议进行多选专项训练。',
        actionText: '去刷错题',
        actionType: 'wrongQuestions'
      }
    ]
  };
}
```

### 20.7 本地“AI 风格建议”规则

先不接真实 AI，使用规则引擎生成建议。建议命名上避免写死“AI 已分析”，可以用：

```text
智能建议
```

规则示例：

1. 如果没有记录：
   - 标题：`先完成一次练习`
   - 内容：`当前还没有答题记录，建议先导入示例题或自己的题库完成一次练习。`
   - 操作：`去刷题`

2. 如果平均正确率低于 60：
   - 标题：`先稳住基础正确率`
   - 内容：`当前平均正确率低于 60%，建议优先使用练习模式，答完立即看解析。`
   - 操作：`开始练习`

3. 如果某题型正确率最低：
   - 标题：`${题型} 是当前薄弱点`
   - 内容：`该题型正确率为 ${accuracy}%，建议后续增加专项练习。`
   - 操作：`查看错题`

4. 如果未掌握错题数量大于 0：
   - 标题：`你还有 ${n} 道未掌握错题`
   - 内容：`建议先完成一轮错题重做，减少重复犯错。`
   - 操作：`重做错题`

5. 如果最近 7 天没有学习记录：
   - 标题：`学习节奏中断`
   - 内容：`最近 7 天没有新的答题记录，可以从 10 道题速刷开始恢复状态。`
   - 操作：`开始刷题`

6. 如果平均正确率高于 85 且未掌握错题为 0：
   - 标题：`状态很好，可以挑战考试模式`
   - 内容：`你的整体正确率较高，可以尝试考试模式或随机组卷。`
   - 操作：`开始考试`

### 20.8 与未来真实 AI 的衔接

当前本地规则建议可以设计成与未来 AI 返回结构一致：

```js
suggestions: [
  {
    level: 'info' | 'warning' | 'success',
    title: string,
    content: string,
    actionText: string,
    actionType: string
  }
]
```

未来接入真实 AI 时，只需要新增：

- `utils/ai-advisor.js`；
- 云函数或后端 API；
- 把本地 analytics summary 发给后端；
- 后端返回同样结构的 suggestions。

小程序页面不必大改。

---

## 21. 使用 superpowers writing-plans 风格整理的一周实施计划

> 说明：本节不是已经单独生成的 `docs/superpowers/plans/*.md` 文件，而是把 writing-plans 的关键格式和颗粒度直接写进交接文档，便于下一次快速继续开发。正式开工前，如果用户确认该方向，建议再拆出独立计划文件：`docs/superpowers/plans/2026-06-09-learning-dashboard.md`。

# Learning Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建“学习驾驶舱”，基于本地答题记录和错题数据生成可视化学习统计与智能学习建议。

**Architecture:** 新增 `utils/analytics.js` 作为纯函数统计层，页面 `pages/dashboard/dashboard` 只负责展示和导航。统计数据全部来自现有 `storage.getRecords()`、`storage.getWrongQuestions()`、`storage.getPapers()`，暂不引入后端和真实 AI。

**Tech Stack:** 微信小程序原生框架、WXML/WXSS、wx 本地存储、Jest。

---

### Task 1: 增加 analytics 纯函数统计模块

**Files:**

- Create: `utils/analytics.js`
- Create: `tests/utils/analytics.test.js`

- [ ] **Step 1: 写 dashboard 空数据测试**

测试目标：没有记录时也能返回完整结构，页面不用做大量空判断。

```js
const { buildDashboardData } = require('../../utils/analytics');

describe('buildDashboardData', () => {
  test('没有任何数据时返回完整空状态', () => {
    const result = buildDashboardData([], [], [], new Date('2026-06-09T12:00:00'));

    expect(result.overview.totalSessions).toBe(0);
    expect(result.overview.totalQuestions).toBe(0);
    expect(result.overview.averageAccuracy).toBe(0);
    expect(result.overview.wrongCount).toBe(0);
    expect(result.overview.masteredWrongCount).toBe(0);
    expect(result.overview.paperCount).toBe(0);
    expect(result.typeStats).toHaveLength(5);
    expect(result.sevenDayTrend).toHaveLength(7);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0].actionType).toBe('quiz');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/charliepan/Downloads/my-miniapp
npx jest tests/utils/analytics.test.js --verbose
```

预期：失败，提示找不到 `../../utils/analytics`。

- [ ] **Step 3: 实现最小 analytics 模块**

`utils/analytics.js` 初始实现：

```js
const TYPE_LABELS = {
  single: '单选',
  multi: '多选',
  judge: '判断',
  fill: '填空',
  essay: '简答'
};

function _round(num) {
  return Math.round(num || 0);
}

function _formatDay(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

function _buildEmptyTypeStats() {
  return Object.keys(TYPE_LABELS).map(type => ({
    type,
    label: TYPE_LABELS[type],
    total: 0,
    correct: 0,
    accuracy: 0
  }));
}

function _buildSevenDayTrend(records, now) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime());
    d.setDate(d.getDate() - i);
    days.push({ date: _formatDay(d), count: 0, correct: 0, total: 0, accuracy: 0 });
  }

  records.forEach(record => {
    const raw = record.endTime || record.startTime || '';
    const matched = days.find(day => raw.indexOf(day.replace('-', '-')) >= 0 || raw.slice(5, 10) === day.date);
    if (matched) {
      matched.count += 1;
      matched.correct += record.correctCount || 0;
      matched.total += record.totalQuestions || 0;
    }
  });

  days.forEach(day => {
    day.accuracy = day.total > 0 ? _round((day.correct / day.total) * 100) : 0;
    delete day.correct;
    delete day.total;
  });

  return days;
}

function _buildSuggestions(overview, typeStats, weakSpot) {
  const suggestions = [];

  if (overview.totalSessions === 0) {
    suggestions.push({
      level: 'info',
      title: '先完成一次练习',
      content: '当前还没有答题记录，建议先导入示例题或自己的题库完成一次练习。',
      actionText: '去刷题',
      actionType: 'quiz'
    });
    return suggestions;
  }

  if (overview.averageAccuracy < 60) {
    suggestions.push({
      level: 'warning',
      title: '先稳住基础正确率',
      content: '当前平均正确率低于 60%，建议优先使用练习模式，答完立即看解析。',
      actionText: '开始练习',
      actionType: 'quiz'
    });
  }

  if (weakSpot && weakSpot.total > 0 && weakSpot.accuracy < 80) {
    suggestions.push({
      level: 'warning',
      title: `${weakSpot.label} 是当前薄弱点`,
      content: `该题型正确率为 ${weakSpot.accuracy}%，建议后续增加专项练习。`,
      actionText: '查看错题',
      actionType: 'wrongQuestions'
    });
  }

  const unmastered = overview.wrongCount - overview.masteredWrongCount;
  if (unmastered > 0) {
    suggestions.push({
      level: 'info',
      title: `你还有 ${unmastered} 道未掌握错题`,
      content: '建议先完成一轮错题重做，减少重复犯错。',
      actionText: '重做错题',
      actionType: 'wrongQuestions'
    });
  }

  if (overview.averageAccuracy >= 85 && unmastered === 0) {
    suggestions.push({
      level: 'success',
      title: '状态很好，可以挑战考试模式',
      content: '你的整体正确率较高，可以尝试考试模式或随机组卷。',
      actionText: '开始考试',
      actionType: 'quiz'
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      level: 'info',
      title: '保持稳定练习',
      content: '继续保持当前节奏，优先复习错题并定期进行考试模式自测。',
      actionText: '继续刷题',
      actionType: 'quiz'
    });
  }

  return suggestions;
}

function buildDashboardData(records, wrongQuestions, papers, now) {
  records = records || [];
  wrongQuestions = wrongQuestions || [];
  papers = papers || [];
  now = now || new Date();

  const totalSessions = records.length;
  const totalQuestions = records.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);
  const totalCorrect = records.reduce((sum, r) => sum + (r.correctCount || 0), 0);
  const averageAccuracy = totalQuestions > 0 ? _round((totalCorrect / totalQuestions) * 100) : 0;
  const wrongCount = wrongQuestions.length;
  const masteredWrongCount = wrongQuestions.filter(q => q.mastered).length;

  const typeStats = _buildEmptyTypeStats();
  const typeMap = {};
  typeStats.forEach(item => { typeMap[item.type] = item; });

  records.forEach(record => {
    const paper = papers.find(p => p.id === record.paperId);
    if (!paper || !paper.questions || !record.answers) return;
    paper.questions.forEach(q => {
      const stat = typeMap[q.type];
      if (!stat) return;
      const answer = record.answers[q.id];
      if (!answer) return;
      stat.total += 1;
      if (answer.correct) stat.correct += 1;
    });
  });

  typeStats.forEach(stat => {
    stat.accuracy = stat.total > 0 ? _round((stat.correct / stat.total) * 100) : 0;
  });

  const activeTypeStats = typeStats.filter(s => s.total > 0);
  const weakSpot = activeTypeStats.length > 0
    ? activeTypeStats.slice().sort((a, b) => a.accuracy - b.accuracy)[0]
    : null;
  const strength = activeTypeStats.length > 0
    ? activeTypeStats.slice().sort((a, b) => b.accuracy - a.accuracy)[0]
    : null;

  const overview = {
    totalSessions,
    totalQuestions,
    averageAccuracy,
    totalCorrect,
    wrongCount,
    masteredWrongCount,
    paperCount: papers.length
  };

  return {
    overview,
    typeStats,
    sevenDayTrend: _buildSevenDayTrend(records, now),
    weakSpot,
    strength,
    suggestions: _buildSuggestions(overview, typeStats, weakSpot)
  };
}

module.exports = { buildDashboardData, TYPE_LABELS };
```

- [ ] **Step 4: 运行 analytics 测试**

```bash
npx jest tests/utils/analytics.test.js --verbose
```

预期：新增空状态测试通过。

- [ ] **Step 5: 补充有记录时的统计测试**

追加测试：

```js
test('根据记录、错题和试卷计算总览与题型正确率', () => {
  const papers = [{
    id: 'p1',
    name: '测试题库',
    questions: [
      { id: 'q1', type: 'single' },
      { id: 'q2', type: 'multi' },
      { id: 'q3', type: 'multi' }
    ]
  }];
  const records = [{
    id: 'r1',
    paperId: 'p1',
    endTime: '2026-06-09 12:00:00',
    totalQuestions: 3,
    correctCount: 2,
    answers: {
      q1: { userAnswer: 'A', correct: true },
      q2: { userAnswer: 'AB', correct: false },
      q3: { userAnswer: 'AC', correct: true }
    }
  }];
  const wrongQuestions = [
    { questionId: 'q2', mastered: false }
  ];

  const result = buildDashboardData(records, wrongQuestions, papers, new Date('2026-06-09T12:00:00'));

  expect(result.overview.totalSessions).toBe(1);
  expect(result.overview.totalQuestions).toBe(3);
  expect(result.overview.totalCorrect).toBe(2);
  expect(result.overview.averageAccuracy).toBe(67);
  expect(result.overview.wrongCount).toBe(1);

  const single = result.typeStats.find(s => s.type === 'single');
  const multi = result.typeStats.find(s => s.type === 'multi');
  expect(single.accuracy).toBe(100);
  expect(multi.total).toBe(2);
  expect(multi.correct).toBe(1);
  expect(multi.accuracy).toBe(50);
  expect(result.weakSpot.type).toBe('multi');
});
```

- [ ] **Step 6: 运行测试确认通过**

```bash
npx jest tests/utils/analytics.test.js --verbose
```

预期：全部通过。

- [ ] **Step 7: 提交**

```bash
git add utils/analytics.js tests/utils/analytics.test.js
git commit -m "feat: add learning analytics module"
```

### Task 2: 注册 dashboard 页面并在首页增加入口

**Files:**

- Modify: `app.json`
- Modify: `pages/index/index.js`
- Modify: `pages/index/index.wxml`
- Modify: `pages/index/index.wxss`

- [ ] **Step 1: 在 app.json 注册页面**

在 `pages` 数组中加入：

```json
"pages/dashboard/dashboard"
```

建议放在 `pages/sort-viz/sort-viz` 前后均可。为了首页工具顺序清晰，可放在 `wrong-questions` 后、`sort-viz` 前。

- [ ] **Step 2: 修改首页 features**

在 `pages/index/index.js` 的 `features` 数组中加入：

```js
{
  id: 'dashboard',
  name: '学习驾驶舱',
  icon: '📈',
  gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
  available: true
}
```

并在 `onFeatureTap` 中加入：

```js
} else if (id === 'dashboard') {
  wx.navigateTo({ url: '/pages/dashboard/dashboard' });
}
```

- [ ] **Step 3: 调整首页卡片顺序**

建议顺序：

```js
features: [
  { id: 'dashboard', name: '学习驾驶舱', ... },
  { id: 'sort-viz', name: '排序可视化', ... },
  { id: 'vocab', name: '单词记忆', ... }
]
```

这样首页形成：

```text
Hero：开始刷题
卡片：学习驾驶舱 / 排序可视化 / 单词记忆
底部：答题记录 / 错题本
```

- [ ] **Step 4: 检查首页 WXML 是否支持三张卡片**

当前 `pages/index/index.wxml` 使用 `wx:for="{{features}}"` 渲染，原则上不用改。如果样式按两列布局，三张卡片会自动换行。

- [ ] **Step 5: 如需优化三卡片布局，调整 WXSS**

如果三张玻璃卡片在视觉上不协调，可在 `pages/index/index.wxss` 里让卡片保持两列流式排列，第三张占半宽即可。避免本阶段过度改首页布局。

- [ ] **Step 6: 运行测试**

```bash
npm test
```

预期：原有测试仍全部通过。

- [ ] **Step 7: 提交**

```bash
git add app.json pages/index/index.js pages/index/index.wxml pages/index/index.wxss
git commit -m "feat: add learning dashboard entry"
```

### Task 3: 创建 dashboard 页面基础结构

**Files:**

- Create: `pages/dashboard/dashboard.js`
- Create: `pages/dashboard/dashboard.json`
- Create: `pages/dashboard/dashboard.wxml`
- Create: `pages/dashboard/dashboard.wxss`

- [ ] **Step 1: 创建 dashboard.json**

```json
{
  "navigationBarTitleText": "学习驾驶舱",
  "navigationBarBackgroundColor": "#101828",
  "navigationBarTextStyle": "white",
  "usingComponents": {}
}
```

- [ ] **Step 2: 创建 dashboard.js**

```js
const storage = require('../../utils/storage');
const { buildDashboardData } = require('../../utils/analytics');

Page({
  data: {
    dashboard: null,
    maxTrendCount: 1,
    hasData: false
  },

  onShow() {
    this.loadDashboard();
  },

  loadDashboard() {
    const records = storage.getRecords();
    const wrongQuestions = storage.getWrongQuestions();
    const papers = storage.getPapers();
    const dashboard = buildDashboardData(records, wrongQuestions, papers, new Date());
    const maxTrendCount = dashboard.sevenDayTrend.reduce((max, item) => {
      return item.count > max ? item.count : max;
    }, 1);

    this.setData({
      dashboard,
      maxTrendCount,
      hasData: dashboard.overview.totalSessions > 0
    });
  },

  goQuiz() {
    wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
  },

  goWrongQuestions() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  },

  goRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  onSuggestionTap(e) {
    const actionType = e.currentTarget.dataset.action;
    if (actionType === 'wrongQuestions') {
      this.goWrongQuestions();
    } else if (actionType === 'records') {
      this.goRecords();
    } else {
      this.goQuiz();
    }
  }
});
```

- [ ] **Step 3: 创建 dashboard.wxml**

基础结构：

```html
<view class="dashboard-page" wx:if="{{dashboard}}">
  <view class="dash-bg">
    <view class="dash-blob dash-blob-1"></view>
    <view class="dash-blob dash-blob-2"></view>
  </view>

  <view class="dash-content">
    <view class="dash-header">
      <text class="dash-title">学习驾驶舱</text>
      <text class="dash-subtitle">本地数据分析 · 智能学习建议</text>
    </view>

    <view class="overview-grid">
      <view class="metric-card">
        <text class="metric-value">{{dashboard.overview.totalQuestions}}</text>
        <text class="metric-label">累计刷题</text>
      </view>
      <view class="metric-card">
        <text class="metric-value">{{dashboard.overview.totalSessions}}</text>
        <text class="metric-label">练习次数</text>
      </view>
      <view class="metric-card">
        <text class="metric-value">{{dashboard.overview.averageAccuracy}}%</text>
        <text class="metric-label">平均正确率</text>
      </view>
      <view class="metric-card">
        <text class="metric-value">{{dashboard.overview.wrongCount}}</text>
        <text class="metric-label">错题总数</text>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title-row">
        <text class="section-title">题型雷达</text>
        <text class="section-tag" wx:if="{{dashboard.weakSpot}}">薄弱：{{dashboard.weakSpot.label}}</text>
      </view>
      <view class="type-list">
        <view class="type-row" wx:for="{{dashboard.typeStats}}" wx:key="type">
          <view class="type-info">
            <text class="type-name">{{item.label}}</text>
            <text class="type-meta">{{item.correct}} / {{item.total}}</text>
          </view>
          <view class="type-bar-bg">
            <view class="type-bar-fill" style="width: {{item.accuracy}}%;"></view>
          </view>
          <text class="type-accuracy">{{item.accuracy}}%</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title-row">
        <text class="section-title">7天学习趋势</text>
      </view>
      <view class="trend-chart">
        <view class="trend-item" wx:for="{{dashboard.sevenDayTrend}}" wx:key="date">
          <view class="trend-bar-wrap">
            <view class="trend-bar" style="height: {{item.count === 0 ? 8 : (item.count * 160 / maxTrendCount)}}rpx;"></view>
          </view>
          <text class="trend-count">{{item.count}}</text>
          <text class="trend-date">{{item.date}}</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title-row">
        <text class="section-title">错题掌握</text>
      </view>
      <view class="wrong-summary">
        <view class="wrong-item">
          <text class="wrong-value">{{dashboard.overview.wrongCount - dashboard.overview.masteredWrongCount}}</text>
          <text class="wrong-label">未掌握</text>
        </view>
        <view class="wrong-item">
          <text class="wrong-value mastered">{{dashboard.overview.masteredWrongCount}}</text>
          <text class="wrong-label">已掌握</text>
        </view>
      </view>
      <view class="action-button" bindtap="goWrongQuestions">查看错题本</view>
    </view>

    <view class="section-card ai-card">
      <view class="section-title-row">
        <text class="section-title">智能建议</text>
        <text class="section-tag">本地规则</text>
      </view>
      <view
        class="suggestion-item suggestion-{{item.level}}"
        wx:for="{{dashboard.suggestions}}"
        wx:key="title"
        data-action="{{item.actionType}}"
        bindtap="onSuggestionTap"
      >
        <text class="suggestion-title">{{item.title}}</text>
        <text class="suggestion-content">{{item.content}}</text>
        <text class="suggestion-action">{{item.actionText}} →</text>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 4: 创建 dashboard.wxss**

可先写基础深色科技风样式：

```css
.dashboard-page {
  min-height: 100vh;
  background: #101828;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.dash-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.dash-blob {
  position: absolute;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  filter: blur(80rpx);
  opacity: 0.35;
}

.dash-blob-1 {
  top: -120rpx;
  right: -120rpx;
  background: #667eea;
}

.dash-blob-2 {
  bottom: 80rpx;
  left: -160rpx;
  background: #00f2fe;
}

.dash-content {
  position: relative;
  z-index: 1;
  padding: 40rpx 28rpx 60rpx;
}

.dash-header {
  margin-bottom: 32rpx;
}

.dash-title {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.dash-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.65);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.metric-card,
.section-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1rpx solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 16rpx 60rpx rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(20rpx);
  border-radius: 28rpx;
}

.metric-card {
  padding: 30rpx 24rpx;
}

.metric-value {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #7dd3fc;
}

.metric-label {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.65);
}

.section-card {
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
}

.section-tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(125, 211, 252, 0.18);
  color: #7dd3fc;
  font-size: 22rpx;
}

.type-row {
  display: grid;
  grid-template-columns: 130rpx 1fr 80rpx;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 22rpx;
}

.type-name {
  display: block;
  font-size: 26rpx;
  color: #fff;
}

.type-meta {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4rpx;
}

.type-bar-bg {
  height: 16rpx;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999rpx;
  overflow: hidden;
}

.type-bar-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

.type-accuracy {
  font-size: 24rpx;
  text-align: right;
  color: #7dd3fc;
}

.trend-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 240rpx;
}

.trend-item {
  width: 13%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.trend-bar-wrap {
  height: 170rpx;
  display: flex;
  align-items: flex-end;
}

.trend-bar {
  width: 34rpx;
  min-height: 8rpx;
  border-radius: 999rpx 999rpx 8rpx 8rpx;
  background: linear-gradient(180deg, #f093fb, #f5576c);
}

.trend-count {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #fff;
}

.trend-date {
  margin-top: 4rpx;
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.45);
}

.wrong-summary {
  display: flex;
  gap: 20rpx;
}

.wrong-item {
  flex: 1;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.08);
}

.wrong-value {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: #fb7185;
}

.wrong-value.mastered {
  color: #34d399;
}

.wrong-label {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.action-button {
  margin-top: 24rpx;
  height: 76rpx;
  line-height: 76rpx;
  text-align: center;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.ai-card {
  border-color: rgba(125, 211, 252, 0.32);
}

.suggestion-item {
  padding: 24rpx;
  border-radius: 22rpx;
  margin-bottom: 18rpx;
  background: rgba(255, 255, 255, 0.08);
}

.suggestion-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.suggestion-content {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.68);
}

.suggestion-action {
  display: block;
  margin-top: 14rpx;
  color: #7dd3fc;
  font-size: 24rpx;
}
```

- [ ] **Step 5: 在微信开发者工具中预览页面**

检查：

- 页面能打开；
- 无记录时不崩溃；
- 卡片布局正常；
- 建议卡片能点击跳转。

- [ ] **Step 6: 运行测试**

```bash
npm test
```

预期：全部通过。

- [ ] **Step 7: 提交**

```bash
git add pages/dashboard/ app.json
/g（不要执行这一行，这是提醒：实际提交命令不要包含这个错误字符）
git commit -m "feat: add learning dashboard page"
```

实际应执行：

```bash
git add pages/dashboard/ app.json
git commit -m "feat: add learning dashboard page"
```

### Task 4: 增强趋势统计和建议规则测试

**Files:**

- Modify: `tests/utils/analytics.test.js`
- Modify: `utils/analytics.js`

- [ ] **Step 1: 增加 7 天趋势测试**

```js
test('生成最近 7 天趋势数据', () => {
  const records = [
    { endTime: '2026-06-08 10:00:00', totalQuestions: 10, correctCount: 8 },
    { endTime: '2026-06-09 10:00:00', totalQuestions: 5, correctCount: 5 }
  ];

  const result = buildDashboardData(records, [], [], new Date('2026-06-09T12:00:00'));

  expect(result.sevenDayTrend).toHaveLength(7);
  expect(result.sevenDayTrend[5].date).toBe('06-08');
  expect(result.sevenDayTrend[5].count).toBe(1);
  expect(result.sevenDayTrend[5].accuracy).toBe(80);
  expect(result.sevenDayTrend[6].date).toBe('06-09');
  expect(result.sevenDayTrend[6].count).toBe(1);
  expect(result.sevenDayTrend[6].accuracy).toBe(100);
});
```

- [ ] **Step 2: 如测试失败，修复 `_buildSevenDayTrend` 日期匹配**

建议使用 `record.endTime.slice(5, 10)` 匹配 `MM-DD`：

```js
const dayKey = raw && raw.length >= 10 ? raw.slice(5, 10) : '';
const matched = days.find(day => day.date === dayKey);
```

- [ ] **Step 3: 增加建议规则测试**

```js
test('低正确率时生成基础正确率建议', () => {
  const records = [{
    id: 'r1',
    paperId: 'p1',
    endTime: '2026-06-09 12:00:00',
    totalQuestions: 10,
    correctCount: 4,
    answers: {}
  }];

  const result = buildDashboardData(records, [], [], new Date('2026-06-09T12:00:00'));

  expect(result.suggestions.some(s => s.title === '先稳住基础正确率')).toBe(true);
});
```

- [ ] **Step 4: 运行测试**

```bash
npx jest tests/utils/analytics.test.js --verbose
npm test
```

预期：analytics 测试和全量测试全部通过。

- [ ] **Step 5: 提交**

```bash
git add utils/analytics.js tests/utils/analytics.test.js
git commit -m "test: cover learning dashboard analytics"
```

### Task 5: 体验打磨和空状态优化

**Files:**

- Modify: `pages/dashboard/dashboard.wxml`
- Modify: `pages/dashboard/dashboard.wxss`
- Modify: `pages/dashboard/dashboard.js`

- [ ] **Step 1: 增加空状态提示**

当 `hasData` 为 false 时，在页面顶部或建议区提示：

```html
<view class="empty-hint" wx:if="{{!hasData}}">
  <text class="empty-title">还没有学习数据</text>
  <text class="empty-desc">导入题库并完成一次练习后，这里会生成你的学习趋势和智能建议。</text>
  <view class="empty-button" bindtap="goQuiz">去导入题库</view>
</view>
```

- [ ] **Step 2: 增加空状态样式**

```css
.empty-hint {
  padding: 32rpx;
  border-radius: 28rpx;
  margin-bottom: 24rpx;
  background: rgba(125, 211, 252, 0.12);
  border: 1rpx solid rgba(125, 211, 252, 0.28);
}

.empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.65);
}

.empty-button {
  margin-top: 22rpx;
  display: inline-block;
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
  background: #7dd3fc;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 700;
}
```

- [ ] **Step 3: 检查所有 action 跳转**

手动验证：

- `去刷题` 跳 `quiz-list`；
- `查看错题` 跳 `wrong-questions`；
- `查看记录` 如果后续加 action，跳 `records`。

- [ ] **Step 4: 运行测试**

```bash
npm test
```

预期：全部通过。

- [ ] **Step 5: 提交**

```bash
git add pages/dashboard/
git commit -m "polish: improve dashboard empty state"
```

### Task 6: 更新交接文档和后续 AI 扩展说明

**Files:**

- Modify: `PROJECT_HANDOFF.md`
- Optional Create: `docs/superpowers/plans/2026-06-09-learning-dashboard.md`

- [ ] **Step 1: 更新 PROJECT_HANDOFF.md**

新增实际完成情况：

```md
## 学习驾驶舱模块

已完成：
- 新增 pages/dashboard/dashboard
- 新增 utils/analytics.js
- 首页新增学习驾驶舱入口
- 支持总览指标、题型正确率、7天趋势、错题掌握、智能建议
- 当前智能建议为本地规则生成，未接真实 AI
```

- [ ] **Step 2: 如果正式开始该功能，建议生成独立计划文件**

路径：

```text
docs/superpowers/plans/2026-06-09-learning-dashboard.md
```

内容可从本节 `Learning Dashboard Implementation Plan` 拆出。

- [ ] **Step 3: 运行测试并查看 git 状态**

```bash
npm test
git status --short
```

- [ ] **Step 4: 提交文档更新**

```bash
git add PROJECT_HANDOFF.md docs/superpowers/plans/2026-06-09-learning-dashboard.md
git commit -m "docs: add learning dashboard plan"
```

---

## 22. 一周开发排期建议

### Day 1：统计层与测试

目标：先把数据算准。

任务：

- 新建 `utils/analytics.js`；
- 新建 `tests/utils/analytics.test.js`；
- 完成 overview、typeStats、sevenDayTrend、suggestions；
- 跑通 analytics 测试。

验收：

- 无数据、有数据、低正确率、错题未掌握等场景都有测试；
- `npm test` 通过。

### Day 2：页面骨架与首页入口

目标：页面能打开，数据能展示。

任务：

- 注册 `pages/dashboard/dashboard`；
- 首页新增 `学习驾驶舱` 卡片；
- 创建 dashboard 页面；
- 接入 analytics 数据。

验收：

- 首页可以进入学习驾驶舱；
- 无数据时不崩溃；
- 有记录时能显示统计。

### Day 3：视觉打磨

目标：做出“炫技感”。

任务：

- 深色科技风背景；
- 玻璃拟态卡片；
- 指标卡片；
- 题型正确率条；
- 7 天柱状趋势；
- 错题掌握卡片。

验收：

- 页面看起来明显区别于普通列表页；
- 在手机预览下布局不溢出。

### Day 4：智能建议和跳转动作

目标：让页面不仅展示数据，还能给行动建议。

任务：

- 完善 suggestions 规则；
- 建议卡片点击跳转；
- 空状态引导去刷题；
- 错题建议跳错题本。

验收：

- 不同数据状态出现不同建议；
- 点击建议能去对应页面。

### Day 5：边界处理与测试补强

目标：减少异常状态。

任务：

- 处理记录引用已删除试卷；
- 处理 0 题、0 正确率；
- 处理只有错题但没有 records；
- 补充 Jest 测试。

验收：

- `npm test` 全部通过；
- 页面空数据、少量数据、多记录数据都不崩溃。

### Day 6：整体体验检查

目标：真实走一遍用户流程。

任务：

- 导入示例题；
- 完成一次练习；
- 查看结果；
- 查看学习驾驶舱；
- 产生错题；
- 查看建议变化。

验收：

- 数据流闭环成立；
- 学习驾驶舱能随记录变化刷新。

### Day 7：文档、review、收尾

目标：稳定交付。

任务：

- 更新 `PROJECT_HANDOFF.md`；
- 可选生成独立 plan 文件；
- 调用 `code-review` 或手动审阅 diff；
- 最终运行测试；
- 准备提交。

验收：

- 文档说明最新进度；
- Git 工作区只包含预期文件；
- 测试全部通过。

---

## 23. 后续 AI 与云端产品化路线图

### 23.1 当前阶段：本地规则智能建议

当前不接真实 AI，先做本地规则建议。

优点：

- 无成本；
- 无 API Key 风险；
- 无后端复杂度；
- 可以快速验证交互和产品价值。

### 23.2 下一阶段：云函数 AI 建议

当学习驾驶舱数据结构稳定后，可以新增云端能力：

```text
小程序端生成 analytics summary
  ↓
调用微信云函数
  ↓
云函数调用大模型 API
  ↓
返回 suggestions 数组
  ↓
页面复用现有建议卡片展示
```

建议云函数只接收摘要，不上传完整题库：

```js
{
  totalQuestions: 120,
  averageAccuracy: 76,
  typeStats: [...],
  wrongCount: 18,
  sevenDayTrend: [...]
}
```

这样能降低隐私风险和 token 成本。

### 23.3 再下一阶段：AI 讲解错题

可在错题详情里增加：

```text
AI 讲一下这题
```

需要注意：

- 小程序不能直接暴露 API Key；
- 必须通过云函数或后端中转；
- 需要限流；
- 需要缓存讲解结果；
- 需要显示“AI 内容仅供参考”。

### 23.4 长期运营阶段：云存储与账号

当项目从个人工具转向运营产品，可以再引入：

1. 微信登录；
2. 云数据库保存题库、记录、错题；
3. 多端同步；
4. 共享题库；
5. 排行榜；
6. 订阅/付费能力；
7. AI 额度体系。

当前一周版本不要做这些，只保留结构上的扩展空间。

---

## 24. 下一次继续开发学习驾驶舱时的提示词

如果下一次要直接开始实现，可以这样对 Claude 说：

```text
请阅读 /Users/charliepan/Downloads/my-miniapp/PROJECT_HANDOFF.md，重点看第 18-24 节。我们要实现“学习驾驶舱 + 轻量智能建议”这一周版本。先不要写代码，先根据第 21 节计划核对当前代码状态，确认是否需要拆出 docs/superpowers/plans/2026-06-09-learning-dashboard.md，然后进入实现。实现时优先做 utils/analytics.js 和 tests/utils/analytics.test.js，保持 npm test 全部通过。
```

如果要先生成独立 plan 文件，可以这样说：

```text
请把 PROJECT_HANDOFF.md 第 21 节的 Learning Dashboard Implementation Plan 拆成正式计划文件 docs/superpowers/plans/2026-06-09-learning-dashboard.md，按 superpowers:writing-plans 的格式补齐任务和验收标准，先不要实现代码。
```

如果要先做 UI 设计，可以这样说：

```text
请基于 PROJECT_HANDOFF.md 第 20 节，为学习驾驶舱设计微信小程序页面结构和视觉方案，偏深色科技风、玻璃拟态、数据大屏感。先给 WXML/WXSS 结构方案，不要实现业务逻辑。
```

---

## 25. Claude Design 暖奶油画布改造（2026-06-09）

### 25.1 改造范围

仅改造首页（`pages/index/`）和全局导航栏。用 `.claude/skills/claude-design.md` 设计系统替换了此前的 BMW Corporate 设计。

### 25.2 设计参考

使用项目 skills 中的 `.claude/skills/claude-design.md`，Claude.com 暖奶油画布编辑式设计语言。

### 25.3 设计核心

- **暖奶油画布**：`#faf9f5` 作为全局页面背景，区别于冷灰白
- **衬线标题**：Georgia 衬线字体 400 weight + 负字间距（-3rpx），文学编辑感
- **珊瑚主色**：`#cc785c` 作为 CTA 和链接色，Active `#a9583e`
- **奶油卡片**：`#efe9de` 作为功能卡片背景，圆角 24rpx
- **深色点缀**：快捷入口用深海军蓝 `#181715`，提供节奏对比
- **零阴影**：深度靠色块对比（奶油画布 vs 奶油卡片 vs 深海军蓝）
- **UPPERCASE 标签**：工具区标签用大写 + 3rpx letter-spacing

### 25.4 色彩系统

| 用途 | 色值 |
|---|---|
| 画布 | `#faf9f5`（暖奶油） |
| 卡片底板 | `#efe9de`（奶油卡片） |
| 卡片 Active | `#e8e0d2` |
| 主色（珊瑚） | `#cc785c` |
| 主色 Active | `#a9583e` |
| 文字（标题） | `#141413`（暖墨） |
| 次要文字 | `#6c6a64` |
| 最次要文字 | `#8e8b82` |
| 深色表面 | `#181715`（深海军蓝） |
| 深色面上文字 | `#faf9f5` |
| 深色面次要 | `#a09d96` |
| 深色面分割线 | `#252320` |
| 浅面分割线 | `#e6dfd8` |

### 25.5 修改的文件

| 文件 | 改动 |
|---|---|
| `app.json` | 导航栏改为暖奶油 `#faf9f5`，黑字；页面背景同步 |
| `app.wxss` | 全局背景色改为 `#faf9f5` |
| `pages/index/index.json` | 页面导航栏暖奶油，黑字 |
| `pages/index/index.wxml` | 简化结构：去掉 `tool-photo` 包裹层，标签改 `TOOLS` |
| `pages/index/index.wxss` | 全部重写：Claude 色彩/衬线标题/奶油卡片/圆角 |

### 25.6 未改动

- `pages/index/index.js`：业务逻辑不变
- 其他页面：未触碰

### 25.7 设计节奏

页面遵循 Claude 设计的 surface 交替节奏：

```text
奶油画布（Hero + 工具区 + 备案号）
  ↓
奶油卡片（工具卡片 + 快捷入口）
  ↓
全页面包在暖奶油色中，视觉统一
```

### 25.8 历史记录

- 2026-06-09：首页先用 BMW Corporate 设计语言改造（深海军蓝 Hero + 蓝色 CTA + 零圆角）
- 2026-06-09：替换为 Claude Design 暖奶油画布风格

