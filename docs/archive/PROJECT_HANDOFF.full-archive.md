# 刷个冯题项目交接文档

> 生成时间：2026-06-08  
> 项目路径：`/Users/charliepan/Downloads/my-miniapp`  
> 目的：让下一次继续开发时，Claude/开发者可以快速恢复上下文，理解项目进度、整体思路、已完成内容、关键文件、测试状态和后续方向。

---

## 1. 一句话概述

`刷个冯题` 是一个微信小程序学习工具箱。当前已完成核心的 **Markdown 试题导入 + 本地刷题 + 练习/考试模式 + 答题记录 + 错题本**，并额外上线了 **排序可视化**、**学习驾驶舱**、**子网计算器**、**TCP 动画机** 和 **数据结构可视化** 模块。项目采用微信小程序原生框架，纯前端、本地存储、无后端。

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
8. 学习驾驶舱模块已上线（统计 + 7 天趋势 + 智能建议）。
9. 子网计算器模块已上线（IP/CIDR 计算 + 二进制位可视化 + 地址分类）。
10. 数据结构可视化模块已上线（BST / 栈&队列 / 哈希表 / 图 BFS&DFS 四种模式）。
11. 当前测试全部通过：**11 个测试套件，218 个测试用例全部通过**。

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
- 全宽功能卡片：`学习驾驶舱`：已可点击进入；
- 功能卡片（按顺序）：
  - `子网计算器`：已可点击进入；
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
│   ├── sample-questions.js
│   ├── analytics.js
│   └── subnet.js
├── pages/
│   ├── index/
│   ├── quiz-list/
│   ├── import-preview/
│   ├── quiz/
│   ├── result/
│   ├── records/
│   ├── record-detail/
│   ├── wrong-questions/
│   ├── dashboard/
│   ├── subnet-calc/
│   └── sort-viz/
└── tests/
    ├── utils/
    │   ├── util.test.js
    │   ├── storage.test.js
    │   ├── markdown-parser.test.js
    │   ├── analytics.test.js
    │   └── subnet.test.js
    └── pages/
        ├── quiz-engine.test.js
        └── sort-viz.test.js
```

---

## 6. 页面注册状态

`app.json` 当前注册了 11 个页面：

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
    "pages/dashboard/dashboard",
    "pages/subnet-calc/subnet-calc",
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

设计：已改为 Claude Design 暖奶油画布风格（2026-06-09），与首页统一。深色科技风已替换。

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

### 7.15 学习驾驶舱模块

目录：`pages/dashboard/`

文件：

- `pages/dashboard/dashboard.js`
- `pages/dashboard/dashboard.wxml`
- `pages/dashboard/dashboard.wxss`
- `pages/dashboard/dashboard.json`

统计模块：`utils/analytics.js`

测试文件：`tests/utils/analytics.test.js`

功能：

- 首页全宽入口卡片进入；
- 从 `records`、`wrongQuestions`、`papers` 计算统计数据；
- 总览指标：累计刷题数、练习次数、平均正确率、错题总数；
- 题型雷达：5 种题型的正确率条形图，标记最薄弱题型；
- 7 天学习趋势：柱状图展示每日刷题量；
- 错题掌握：未掌握/已掌握数量，可跳转错题本；
- 智能建议（嵌入式）：本地规则引擎生成学习建议，支持跳转对应页面；
- 空状态：无记录时显示引导卡片。

设计风格：Claude Design 暖奶油画布，与首页统一。

### 7.16 子网计算器模块

目录：`pages/subnet-calc/`

文件：

- `pages/subnet-calc/subnet-calc.js`
- `pages/subnet-calc/subnet-calc.wxml`
- `pages/subnet-calc/subnet-calc.wxss`
- `pages/subnet-calc/subnet-calc.json`

纯函数模块：`utils/subnet.js`

测试文件：`tests/utils/subnet.test.js`

功能：

- 首页卡片可进入（工具区第一张卡片）；
- IP 地址四段独立输入框；
- CIDR 前缀长度滑块（0-32）；
- 快捷 CIDR 按钮：/8、/16、/24、/25、/26、/27、/28、/29、/30；
- 实时计算结果：
  - 子网掩码；
  - 网络地址；
  - 广播地址；
  - 可用主机范围；
  - 可用主机数；
- 二进制位可视化（核心炫技点）：
  - 32 bit 格子，每 8 个一组空格分隔；
  - 网络位：珊瑚色 `#cc785c`；
  - 主机位：浅蓝 `#7dd3fc`；
  - IP / 子网掩码 / 网络地址 / 广播地址 四行 bit 条；
  - 网络 | 主机分界标注；
- AND 运算动画演示（2026-06-13 新增）：
  - 独立区域，位于二进制区和计算结果之间；
  - 支持两种粒度：逐字节（4 步，默认）、逐位（32 步）；
  - 播放/暂停/上一步/下一步/重置控制；
  - 当前操作位珊瑚色高亮 + 微缩放动效；
  - 纯函数 `generateAndSteps()` 在 `utils/subnet.js`，6 个测试用例；
- 地址分类信息：
  - A/B/C/D/E 类判断；
  - 私有地址判断；
  - 特殊地址说明（环回、链路本地、广播等）；
- 帮助说明（可折叠）：CIDR 含义、子网掩码作用、主机数公式；
- 非法输入提示。

测试覆盖（43 个用例）：

- IP 验证：合法/非法格式；
- CIDR 验证：合法/非法范围；
- IP 解析和二进制转换；
- CIDR 到子网掩码转换（/0、/8、/16、/24、/25、/26、/27、/28、/30、/32）；
- 子网计算：192.168.1.0/24、10.0.0.0/8、172.16.0.0/12、192.168.1.100/26；
- 特殊地址：127.0.0.1/8（环回）、255.255.255.255/32（广播）；
- 边界情况：/31 点对点链路、/32 单主机；
- 非法输入处理；
- 地址分类：A/B/C/D/E 类、私有/公有、特殊地址。
- AND 运算步骤生成：逐字节模式步骤数、逐位模式步骤数、AND 结果正确性、done 步骤网络地址、空输入处理。

设计风格：Claude Design 暖奶油画布，与首页统一。

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
PASS tests/utils/subnet.test.js
PASS tests/utils/analytics.test.js
PASS tests/pages/sort-viz.test.js
PASS tests/utils/storage.test.js
PASS tests/utils/markdown-parser.test.js
PASS tests/utils/util.test.js
PASS tests/pages/quiz-engine.test.js

Test Suites: 7 passed, 7 total
Tests:       102 passed, 102 total
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
- 排序可视化算法步骤生成；
- 子网计算：IP 验证、CIDR 验证、二进制转换、子网掩码、子网计算、地址分类、AND 运算步骤生成（逐字节/逐位）；
- 学习驾驶舱统计：空数据、有数据统计、7 天趋势、建议规则。

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
| `pages/sort-viz/sort-viz.json` | 导航栏暖奶油，黑字 |
| `pages/sort-viz/sort-viz.wxml` | 去掉 blob 背景层，简化结构 |
| `pages/sort-viz/sort-viz.wxss` | 全部重写：暖奶油背景 + 奶油卡片 + 珊瑚 CTA + 暖色柱状图 |

### 25.6 未改动

- `pages/index/index.js`：业务逻辑不变
- `pages/sort-viz/sort-viz.js`：业务逻辑不变
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
- 2026-06-09：首页替换为 Claude Design 暖奶油画布风格
- 2026-06-09：排序可视化页面同步改为 Claude Design 暖奶油画布风格

---

## 26. 创意规划一：子网划分计算器（Subnet Calculator）

### 26.1 一句话定位

输入 IP 地址和 CIDR 前缀长度，实时可视化二进制位运算过程，展示子网掩码、网络地址、广播地址、可用主机范围、子网数量，支持 VLSM 可变长子网划分。

### 26.2 展示的专业素养

- IP 地址结构与分类（A/B/C/D/E 类）
- 二进制与十进制转换
- 子网掩码的本质（连续 1 + 连续 0）
- CIDR 无类别域间路由
- 网络地址、广播地址的计算原理
- 可用主机数公式：2^host_bits - 2
- VLSM 可变长子网划分（进阶）
- 超网聚合（CIDR 聚合）

这是网络工程课程最核心的实操技能之一，面试和考试高频考点。

### 26.3 目标用户场景

1. 计网课学生做作业时验证子网划分结果；
2. 准备面试/考试时快速练习；
3. 网络工程师日常快速计算；
4. 向他人展示自己对 IP 子网的深度理解。

### 26.4 MVP 功能范围（一周版本）

> **实现状态标注说明**（2026-06-13 更新）：
> - ~~删除线~~ + ✅ = 已实现
> - ❌ = 未实现，需下一个 agent 补充

**必须包含：**

1. ~~首页新增入口卡片：`子网计算器`~~ ✅ 已实现；
2. ~~新增页面：`pages/subnet-calc/subnet-calc`~~ ✅ 已实现；
3. 输入区域：
   - ~~IP 地址输入框（四段十进制，自动校验 0-255）~~ ✅ 已实现；
   - ~~CIDR 前缀长度滑块或输入框（/1 ~ /30）~~ ✅ 已实现（实际范围 /0 ~ /32，比需求更宽）；
   - ~~快捷按钮：/8、/16、/24、/25、/26、/27、/28、/29、/30~~ ✅ 已实现；
4. 实时计算结果：
   - ~~子网掩码（四段十进制 + 二进制）~~ ✅ 已实现；
   - ~~网络地址~~ ✅ 已实现；
   - ~~广播地址~~ ✅ 已实现；
   - ~~第一个可用主机地址~~ ✅ 已实现；
   - ~~最后一个可用主机地址~~ ✅ 已实现；
   - ~~可用主机总数~~ ✅ 已实现；
   - ~~网络地址的二进制表示~~ ✅ 已实现；
5. 二进制位可视化（核心炫技点）：
   - ~~32 个 bit 格子，每 8 个一组用空格分隔~~ ✅ 已实现；
   - ~~网络位用一种颜色高亮（如珊瑚色）~~ ✅ 已实现（`#cc785c`）；
   - ~~主机位用另一种颜色（如浅蓝）~~ ✅ 已实现（`#7dd3fc`）；
   - ~~输入 IP 时实时显示其 32 位二进制~~ ✅ 已实现；
   - ~~子网掩码的 1 和 0 对应颜色显示~~ ✅ 已实现；
   - ~~**网络地址 = IP AND Mask 的位运算过程动画**~~ ✅ 已实现 — 支持逐字节（4步）和逐位（32步）两种模式，带播放/暂停/上一步/下一步/重置控制；
6. 子网信息卡片：
   - ~~子网类型判断（A/B/C 类，私有地址判断）~~ ✅ 已实现（含 D/E 类）；
   - ~~地址用途说明（如 127.x.x.x 是环回地址）~~ ✅ 已实现（环回、链路本地、广播、保留等）；

**暂不包含（可后续扩展）：**

1. VLSM 可变长子网划分（输入多个子网需求，自动分配）；
2. 超网聚合（多个子网合并为一个 CIDR）；
3. IPv6 地址计算；
4. 批量子网规划；
5. 子网间路由计算。

### 26.5 页面结构设计

```text
子网计算器
├── 输入区
│   ├── IP 地址输入（四段，每段独立输入框）
│   ├── 斜杠分隔符
│   ├── CIDR 前缀长度输入/滑块
│   └── 快捷 CIDR 按钮行（/8 /16 /24 /25 /26 /27 /28）
├── 二进制可视化区（核心视觉区）
│   ├── IP 地址 32 bit 条
│   │   ├── 网络位（珊瑚色块）
│   │   └── 主机位（蓝色块）
│   ├── 子网掩码 32 bit 条
│   │   ├── 1 的位置（珊瑚色）
│   │   └── 0 的位置（蓝色）
│   ├── 网络地址 32 bit 条（AND 运算结果）
│   └── 标注线：网络部分 | 主机部分分界
├── 计算结果卡片
│   ├── 子网掩码：255.255.255.192
│   ├── 网络地址：192.168.1.0
│   ├── 广播地址：192.168.1.63
│   ├── 可用范围：192.168.1.1 ~ 192.168.1.62
│   ├── 可用主机数：62
│   └── 子网类型：C 类 · 私有地址
└── 说明/帮助区（可折叠）
    ├── CIDR 含义说明
    ├── 位运算公式
    └── 常见子网掩码速查表
```

### 26.6 核心数据模型

```js
// 计算结果对象
{
  inputIp: [192, 168, 1, 100],
  cidr: 26,
  // 二进制表示（字符串数组，每段 8 位）
  ipBinary: ['11000000', '10101000', '00000001', '01100100'],
  maskBinary: ['11111111', '11111111', '11111111', '11000000'],
  networkBinary: ['11000000', '10101000', '00000001', '01000000'],
  broadcastBinary: ['11000000', '10101000', '00000001', '01111111'],
  // 十进制结果
  subnetMask: '255.255.255.192',
  networkAddress: '192.168.1.64',
  broadcastAddress: '192.168.1.127',
  firstHost: '192.168.1.65',
  lastHost: '192.168.1.126',
  totalHosts: 62,
  // 分类信息
  ipClass: 'C',
  isPrivate: true,
  description: 'C 类私有地址'
}
```

### 26.7 核心计算函数

建议新建 `utils/subnet.js`，纯函数，便于测试：

```js
// 核心函数
function parseIp(ipString) → [number, number, number, number] | null
function ipToBinary(ipArray) → string[]  // 4 个 8 位二进制字符串
function cidrToMask(cidr) → number[]
function calculateSubnet(ipString, cidr) → SubnetResult
function classifyIp(ipArray) → { ipClass, isPrivate, description }
function validateIp(ipString) → boolean
function validateCidr(cidr) → boolean
```

### 26.8 测试计划

新建 `tests/utils/subnet.test.js`：

```text
测试用例：
- 192.168.1.0/24 → 网络地址 192.168.1.0，广播 192.168.1.255，主机数 254
- 10.0.0.0/8 → A 类私有，主机数 16777214
- 172.16.0.0/12 → B 类私有
- 192.168.1.100/26 → 网络 192.168.1.64，广播 192.168.1.127，主机 62
- 127.0.0.1/8 → 环回地址
- 255.255.255.255/32 → 广播专用，主机数 0
- 10.0.0.1/32 → 单主机地址，主机数 1
- 非法 IP（如 256.1.1.1）→ 返回 null
- 非法 CIDR（如 33）→ 返回 null
- 二进制转换正确性
- 位运算 AND 正确性
```

### 26.9 视觉风格

沿用 Claude Design 暖奶油画布风格：

- 页面背景：`#faf9f5`；
- 输入区：奶油卡片 `#efe9de`；
- 二进制位格子：
  - 网络位：珊瑚色 `#cc785c` 背景 + 白字；
  - 主机位：浅蓝 `#7dd3fc` 背景 + 深色字；
  - 分界线：竖线标记 + 标注 "网络 | 主机"；
- 结果卡片：奶油卡片，数值用大字加粗；
- 快捷 CIDR 按钮：圆角胶囊，选中态珊瑚色；
- 整体风格：干净、信息密度高、专业感强。

### 26.10 实现排期建议

| 天数 | 任务 | 产出 |
|---|---|---|
| Day 1 | `utils/subnet.js` 纯函数 + 测试 | 计算逻辑完成，测试通过 |
| Day 2 | 页面注册 + 首页入口 + 页面骨架 | 能打开页面，能输入 IP/CIDR |
| Day 3 | 二进制位可视化核心 UI | 32 bit 格子渲染，颜色区分 |
| Day 4 | 计算结果展示 + 实时联动 | 输入变化 → 结果实时更新 |
| Day 5 | 边界处理 + 快捷按钮 + 私有地址判断 | 体验完善 |
| Day 6 | 帮助说明 + 视觉打磨 | 信息密度和美感平衡 |
| Day 7 | 测试补全 + 文档更新 + 提交 | 稳定交付 |

### 26.11 文件清单

| 文件 | 类型 | 说明 |
|---|---|---|
| `utils/subnet.js` | 新建 | 子网计算纯函数 |
| `tests/utils/subnet.test.js` | 新建 | 子网计算测试 |
| `pages/subnet-calc/subnet-calc.js` | 新建 | 页面逻辑 |
| `pages/subnet-calc/subnet-calc.wxml` | 新建 | 页面结构 |
| `pages/subnet-calc/subnet-calc.wxss` | 新建 | 页面样式 |
| `pages/subnet-calc/subnet-calc.json` | 新建 | 页面配置 |
| `app.json` | 修改 | 注册新页面 |
| `pages/index/index.js` | 修改 | 添加首页入口 |
| `pages/index/index.wxml` | 修改 | 添加首页卡片 |
| `pages/index/index.wxss` | 修改 | 卡片样式调整 |

### 26.12 未来扩展方向

1. **VLSM 子网规划器**：输入多个子网的主机需求（如：需要 50 台、20 台、10 台），自动从大到小分配子网；
2. **超网聚合**：输入多个子网，自动计算最小覆盖的 CIDR；
3. **子网间路由表生成**：根据子网划分结果，生成静态路由表；
4. **IPv6 地址计算器**：扩展到 128 位地址空间；
5. **导出结果图片**：把计算结果和二进制可视化导出为图片，方便分享或写作业附图。

---

## 27. 创意规划二：TCP 三握四挥动画机（TCP Handshake Visualizer）

### 27.1 一句话定位

以序列图动画的形式，逐步演示 TCP 三次握手（SYN → SYN-ACK → ACK）和四次挥手（FIN → ACK → FIN → ACK + TIME_WAIT）的完整过程，每一步展示报文字段（seq、ack、flags），用户可手动控制节奏。

### 27.2 展示的专业素养

- TCP 面向连接的特性
- 三次握手的原理和必要性（为什么不是两次或四次）
- 四次挥手的原因（全双工 → 半关闭）
- SYN Flood 攻击原理（可选扩展）
- TCP 状态机（LISTEN、SYN_SENT、ESTABLISHED、FIN_WAIT、TIME_WAIT、CLOSE_WAIT 等）
- seq/ack 序列号的作用
- TCP 标志位（SYN、ACK、FIN、RST、PSH、URG）
- TIME_WAIT 的 2MSL 等待原因

这是计算机网络课程最经典的图示之一，做成交互动画极具教学价值。

### 27.3 目标用户场景

1. 计网课学生理解三次握手/四次挥手的过程；
2. 面试前复习 TCP 连接管理；
3. 向非技术人员解释"网络连接是怎么建立的"；
4. 展示对传输层协议的深入理解。

### 27.4 MVP 功能范围（一周版本）

**必须包含：**

1. 首页入口卡片：`TCP 动画机`；
2. 新增页面：`pages/tcp-viz/tcp-viz`；
3. 模式选择：
   - 三次握手模式；
   - 四次挥手模式；
   - 完整连接生命周期模式（握手 + 数据传输 + 挥手）；
4. 序列图核心元素：
   - 左侧客户端（Client）竖线 + 标签；
   - 右侧服务端（Server）竖线 + 标签；
   - 箭头表示报文方向（左→右 或 右→左）；
   - 箭头旁边标注报文内容（SYN, seq=100）；
5. 步骤控制：
   - 播放/暂停按钮；
   - 上一步/下一步按钮；
   - 重置按钮；
   - 速度调节（慢/中/快）；
6. 每步详情面板：
   - 当前步骤名称（如 "第一次握手"）；
   - 报文字段表格：
     - SYN / ACK / FIN 标志位（打勾或高亮）；
     - seq 序列号；
     - ack 确认号；
   - 客户端状态变化（如 SYN_SENT → ESTABLISHED）；
   - 服务端状态变化（如 LISTEN → SYN_RCVD）；
   - 文字解释（为什么需要这一步）；
7. 状态栏：
   - 客户端当前状态（彩色标签）；
   - 服务端当前状态（彩色标签）；
   - 状态变化时有过渡动画；

**暂不包含：**

1. SYN Flood 攻击模拟；
2. 拥塞控制动画（慢启动、拥塞避免）；
3. 滑动窗口可视化；
4. 超时重传模拟；
5. TCP 状态机完整图（所有状态的转换关系图）。

### 27.5 页面结构设计

```text
TCP 动画机
├── 模式选择区
│   ├── [三次握手] [四次挥手] [完整连接]
│   └── 当前模式标签
├── 序列图区域（核心视觉区）
│   ├── 客户端标签 + 竖线（左侧）
│   ├── 服务端标签 + 竖线（右侧）
│   ├── 报文箭头（带动画）
│   │   ├── 箭头方向（→ 或 ←）
│   │   ├── 箭头样式（实线/虚线，不同颜色）
│   │   └── 报文标签（SYN seq=100）
│   ├── 客户端状态标签（在线状态条旁）
│   └── 服务端状态标签（在线状态条旁）
├── 步骤详情面板
│   ├── 步骤标题（"第 N 次握手"）
│   ├── 报文字段卡片
│   │   ├── 标志位：[SYN ✓] [ACK] [FIN]
│   │   ├── seq: 100
│   │   └── ack: 0
│   ├── 状态变化箭头
│   │   ├── 客户端：SYN_SENT → ESTABLISHED
│   │   └── 服务端：LISTEN → SYN_RCVD
│   └── 解释文字
├── 控制栏
│   ├── [⏮ 重置] [◀ 上一步] [▶ 播放/暂停] [下一步 ▶]
│   └── 速度：[慢] [中] [快]
└── 底部状态栏
    ├── 客户端状态：ESTABLISHED（绿色标签）
    └── 服务端状态：ESTABLISHED（绿色标签）
```

### 27.6 核心数据模型

```js
// 三次握手步骤数据
const TCP_STEPS = {
  handshake: [
    {
      step: 1,
      name: '第一次握手',
      direction: 'client→server',
      flags: { SYN: true, ACK: false, FIN: false },
      seq: 100,
      ack: 0,
      clientState: { from: 'CLOSED', to: 'SYN_SENT' },
      serverState: { from: 'LISTEN', to: 'SYN_RCVD' },
      explanation: '客户端发送 SYN 报文，请求建立连接。seq=100 是客户端随机选择的初始序列号。',
      arrowStyle: 'solid'  // 实线
    },
    {
      step: 2,
      name: '第二次握手',
      direction: 'server→client',
      flags: { SYN: true, ACK: true, FIN: false },
      seq: 300,
      ack: 101,  // 100 + 1
      clientState: null,  // 客户端状态不变
      serverState: null,  // 服务端状态不变（仍是 SYN_RCVD）
      explanation: '服务端回复 SYN+ACK，确认客户端的 SYN 并发送自己的 SYN。ack=101 表示期望收到客户端下一个字节的序号。',
      arrowStyle: 'solid'
    },
    {
      step: 3,
      name: '第三次握手',
      direction: 'client→server',
      flags: { SYN: false, ACK: true, FIN: false },
      seq: 101,
      ack: 301,
      clientState: { from: 'SYN_SENT', to: 'ESTABLISHED' },
      serverState: { from: 'SYN_RCVD', to: 'ESTABLISHED' },
      explanation: '客户端发送 ACK 确认服务端的 SYN。双方进入 ESTABLISHED 状态，连接建立完成，可以开始传输数据。',
      arrowStyle: 'solid'
    }
  ],
  // 四次挥手步骤数据结构类似...
  // 完整连接生命周期 = handshake + data_transfer + teardown
};

// TCP 状态定义
const TCP_STATES = {
  CLOSED: { label: 'CLOSED', color: '#9ca3af' },
  LISTEN: { label: 'LISTEN', color: '#60a5fa' },
  SYN_SENT: { label: 'SYN_SENT', color: '#f59e0b' },
  SYN_RCVD: { label: 'SYN_RCVD', color: '#f59e0b' },
  ESTABLISHED: { label: 'ESTABLISHED', color: '#34d399' },
  FIN_WAIT_1: { label: 'FIN_WAIT_1', color: '#f97316' },
  FIN_WAIT_2: { label: 'FIN_WAIT_2', color: '#f97316' },
  TIME_WAIT: { label: 'TIME_WAIT', color: '#ef4444' },
  CLOSE_WAIT: { label: 'CLOSE_WAIT', color: '#8b5cf6' },
  LAST_ACK: { label: 'LAST_ACK', color: '#ef4444' }
};
```

### 27.7 核心函数

建议新建 `utils/tcp-states.js`：

```js
// 核心函数
function getHandshakeSteps() → Step[]
function getTeardownSteps() → Step[]
function getFullConnectionSteps() → Step[]
function getStateLabel(state) → { label, color }
function getStepByIndex(steps, index) → Step
function validateStepTransition(fromState, toState) → boolean
```

### 27.8 测试计划

新建 `tests/utils/tcp-states.test.js`：

```text
测试用例：
- 三次握手返回 3 个步骤
- 四次挥手返回 4 个步骤（含 TIME_WAIT）
- 完整连接步骤数 > 7（握手 + 数据 + 挥手）
- 第一次握手：SYN=true, ACK=false
- 第二次握手：SYN=true, ACK=true
- 第三次握手：SYN=false, ACK=true
- seq/ack 数值递推正确（ack = 对方 seq + 1）
- 状态转换正确（LISTEN → SYN_RCVD → ESTABLISHED）
- TIME_WAIT 状态存在
- 所有步骤都有 explanation 字段
- 所有步骤都有 flags 对象
```

### 27.9 视觉风格

沿用 Claude Design 暖奶油画布风格：

- 页面背景：`#faf9f5`；
- 序列图区域：奶油卡片 `#efe9de` 底板；
- 客户端竖线：珊瑚色 `#cc785c`；
- 服务端竖线：深海军蓝 `#181715`；
- 报文箭头：
  - 普通报文：深灰色实线；
  - SYN 报文：珊瑚色；
  - SYN-ACK 报文：渐变（珊瑚→蓝）；
  - FIN 报文：橙色虚线；
  - ACK 报文：灰色细线；
- 状态标签：圆角胶囊，颜色按状态定义（绿=ESTABLISHED，黄=握手中间态，红=关闭过程）；
- 步骤详情面板：奶油卡片，字段用 monospace 字体；
- 控制按钮：珊瑚色 CTA 风格；
- 箭头动画：从起点滑动到终点，速度可调。

### 27.10 交互细节

1. **步骤切换动画**：箭头从发出端滑向接收端，用时约 0.5s（慢速）/ 0.2s（快速）；
2. **状态变化高亮**：状态标签变化时闪烁一次；
3. **已走过的步骤**：保留为半透明，当前步骤全亮；
4. **未走过的步骤**：不显示或显示为虚线占位；
5. **自动播放**：每步间隔 1.5s（慢）/ 0.8s（中）/ 0.3s（快）；
6. **点击步骤**：点击已走过的步骤可以回看详情。

### 27.11 实现排期建议

| 天数 | 任务 | 产出 |
|---|---|---|
| Day 1 | `utils/tcp-states.js` 步骤数据 + 测试 | 数据结构完成，测试通过 |
| Day 2 | 页面注册 + 首页入口 + 页面骨架 | 能打开页面 |
| Day 3 | 序列图核心渲染（双竖线 + 箭头） | 基本序列图可见 |
| Day 4 | 步骤控制 + 动画播放 | 能逐步/自动播放 |
| Day 5 | 步骤详情面板 + 状态栏 | 报文字段和状态可见 |
| Day 6 | 模式切换 + 视觉打磨 | 三种模式可切换 |
| Day 7 | 测试补全 + 文档更新 + 提交 | 稳定交付 |

### 27.12 文件清单

| 文件 | 类型 | 说明 |
|---|---|---|
| `utils/tcp-states.js` | 新建 | TCP 步骤数据和状态定义 |
| `tests/utils/tcp-states.test.js` | 新建 | TCP 数据测试 |
| `pages/tcp-viz/tcp-viz.js` | 新建 | 页面逻辑 |
| `pages/tcp-viz/tcp-viz.wxml` | 新建 | 页面结构 |
| `pages/tcp-viz/tcp-viz.wxss` | 新建 | 页面样式 |
| `pages/tcp-viz/tcp-viz.json` | 新建 | 页面配置 |
| `app.json` | 修改 | 注册新页面 |
| `pages/index/index.js` | 修改 | 添加首页入口 |
| `pages/index/index.wxml` | 修改 | 添加首页卡片 |
| `pages/index/index.wxss` | 修改 | 卡片样式调整 |

### 27.13 未来扩展方向

1. **SYN Flood 攻击模拟**：展示攻击者大量发送 SYN 不回复 ACK，导致服务端半连接队列溢出；
2. **滑动窗口动画**：展示发送窗口的移动、流量控制；
3. **拥塞控制曲线**：慢启动 → 拥塞避免 → 快重传 → 快恢复的 cwnd 变化图；
4. **TCP vs UDP 对比模式**：并排展示 TCP 的可靠连接 vs UDP 的无连接发送；
5. **完整状态机图**：可交互的 TCP 状态机，点击任意状态高亮其出边和入边；
6. **Wireshark 风格报文详情**：展开看完整的 TCP 头部 20 字节，逐字段高亮。

---

## 28. 创意规划三：数据结构可视化（Data Structure Visualizer）

### 28.1 一句话定位

在现有排序可视化基础上扩展，支持二叉搜索树、图的 BFS/DFS、哈希表冲突解决、栈/队列操作的交互动画，每个数据结构支持增删查操作的可视化过程。

### 28.2 展示的专业素养

- 数据结构的底层实现原理（不是只会调 API）
- 树的遍历算法（前序/中序/后序/层序）
- 图的搜索算法（BFS 广度优先 / DFS 深度优先）
- 哈希表的冲突解决（链地址法 / 开放寻址法）
- 时间复杂度的直观感受（O(1) vs O(log n) vs O(n)）
- 栈和队列的 LIFO/FIFO 特性
- 二叉搜索树的有序性

数据结构是计算机科学的核心基础，也是考研 408 和面试的重点。

### 28.3 目标用户场景

1. 数据结构课程学习时理解算法执行过程；
2. 考研 408 备考复习；
3. 面试前复习数据结构操作；
4. 向他人展示"我不只是会用 API，我理解底层原理"。

### 28.4 MVP 功能范围（一周版本）

**必须包含：**

1. 首页入口卡片：`数据结构`（替换或并列排序可视化）；
2. 新增页面：`pages/ds-viz/ds-viz`；
3. 模式选择：四种数据结构可切换；
4. **二叉搜索树（BST）模式**：
   - 输入数字，逐个插入；
   - 可视化树形结构（节点 + 连线）；
   - 插入过程动画：从根节点比较，左小右大，找到空位插入；
   - 查找过程动画：从根节点比较，路径高亮；
   - 删除操作动画（三种情况：叶子、单子、双子）；
   - 前序/中序/后序/层序遍历动画；
   - 显示每步比较结果；
5. **栈 & 队列模式**：
   - 可视化栈（竖向排列，顶部在上）；
   - 可视化队列（横向排列，左进右出）；
   - Push/Pop/Enqueue/Dequeue 操作动画；
   - 溢出/下溢提示；
6. **哈希表模式**：
   - 可视化哈希桶（数组 + 链表）；
   - 输入 key，展示哈希计算过程（key % tableSize）；
   - 插入动画：计算哈希值 → 找到桶 → 插入链表头；
   - 冲突动画：两个 key 哈希到同一桶，链表变长；
   - 查找动画：计算哈希 → 遍历链表；
7. **图 BFS/DFS 模式**：
   - 预设几个图结构（可选）或用户手动创建节点和边；
   - BFS 动画：队列可视化 + 逐层访问 + 已访问标记；
   - DFS 动画：栈可视化（或递归调用栈）+ 深度优先 + 回溯；
   - 访问顺序编号；
8. 通用控制栏：
   - 播放/暂停/上一步/下一步/重置；
   - 速度调节；
   - 步骤描述文字；

**暂不包含：**

1. 红黑树 / AVL 树（自平衡）；
2. B 树 / B+ 树；
3. 最小堆 / 最大堆；
4. Dijkstra / Prim / Kruskal 图算法；
5. 并查集；
6. 线段树 / 树状数组。

### 28.5 页面结构设计

```text
数据结构可视化
├── 模式选择区
│   ├── [BST 树] [栈&队列] [哈希表] [图搜索]
│   └── 当前模式标签
├── 操作输入区（根据模式变化）
│   ├── BST 模式：[数字输入] [插入] [删除] [查找] [遍历 ▼]
│   ├── 栈&队列模式：[数字输入] [Push] [Pop] [Enqueue] [Dequeue]
│   ├── 哈希表模式：[Key 输入] [插入] [查找] [桶数量 ▼]
│   └── 图搜索模式：[节点数 ▼] [BFS] [DFS] [重置图]
├── 可视化区域（核心视觉区，根据模式变化）
│   ├── BST 模式：
│   │   └── 树形图（节点圆形 + 连线，高亮当前操作路径）
│   ├── 栈&队列模式：
│   │   ├── 栈：竖向方块堆叠（顶部在上）
│   │   └── 队列：横向方块排列（左进右出）
│   ├── 哈希表模式：
│   │   └── 桶数组（横向）+ 每个桶下的链表（纵向）
│   └── 图搜索模式：
│       └── 节点 + 边的力导向布局或手动布局
├── 步骤描述区
│   └── "比较 42 < 50，走向左子树"
├── 控制栏
│   ├── [⏮ 重置] [◀ 上一步] [▶ 播放] [下一步 ▶]
│   └── 速度：[慢] [中] [快]
└── 信息面板
    ├── BST：节点数、树高、当前遍历序列
    ├── 栈&队列：元素数量、栈顶/队首/队尾
    ├── 哈希表：负载因子、冲突次数
    └── 图：已访问节点数、访问顺序
```

### 28.6 核心数据模型

```js
// BST 节点
{
  value: 42,
  left: TreeNode | null,
  right: TreeNode | null,
  x: 200,      // 渲染坐标
  y: 100,
  state: 'comparing' | 'inserting' | 'found' | 'deleting' | 'normal' | 'visited'
}

// BST 操作步骤
{
  type: 'compare' | 'go-left' | 'go-right' | 'insert' | 'delete' | 'found' | 'not-found',
  value: 42,
  currentNode: 50,
  description: '比较 42 < 50，走向左子树',
  treeState: { /* 整棵树的快照，用于回退 */ }
}

// 栈操作步骤
{
  type: 'push' | 'pop',
  value: 42,
  stack: [10, 20, 30, 42],
  description: 'Push 42 到栈顶'
}

// 哈希表操作步骤
{
  type: 'hash-calc' | 'insert' | 'collision' | 'find' | 'not-found',
  key: 'apple',
  hashValue: 3,
  bucketIndex: 3,
  description: 'hash("apple") = 3，插入到桶 3',
  tableState: [ /* 所有桶的快照 */ ]
}

// 图 BFS 步骤
{
  type: 'enqueue' | 'dequeue' | 'visit' | 'enqueue-neighbors' | 'done',
  node: 'A',
  queue: ['B', 'C'],
  visited: ['A'],
  description: '访问节点 A，将邻居 B、C 加入队列',
  graphState: { /* 节点和边的状态快照 */ }
}
```

### 28.7 核心函数

建议拆分为多个工具模块：

```js
// utils/bst.js
function insertNode(root, value) → { root, steps[] }
function deleteNode(root, value) → { root, steps[] }
function searchNode(root, value) → steps[]
function traverseTree(root, order) → steps[]  // order: 'pre'|'in'|'post'|'level'
function layoutTree(root) → { nodes[], edges[] }  // 计算渲染坐标

// utils/hash-table.js
function hash(key, tableSize) → number
function insert(table, key, value) → { table, steps[] }
function search(table, key) → { result, steps[] }
function calculateLoadFactor(table) → number

// utils/graph.js
function bfs(graph, startNode) → steps[]
function dfs(graph, startNode) → steps[]
function createSampleGraph(type) → graph  // 预设图结构
```

### 28.8 测试计划

新建 `tests/utils/bst.test.js`、`tests/utils/hash-table.test.js`、`tests/utils/graph.test.js`：

```text
BST 测试用例：
- 插入 5 个节点后树结构正确
- 中序遍历结果有序
- 查找存在的节点返回正确路径
- 查找不存在的节点返回完整搜索路径
- 删除叶子节点
- 删除单子节点
- 删除双子节点（用后继替换）
- 空树插入第一个节点
- 树高计算正确

哈希表测试用例：
- 哈希函数对同一 key 返回一致结果
- 插入不冲突时直接落入正确桶
- 插入冲突时链表变长
- 查找存在的 key
- 查找不存在的 key
- 负载因子计算正确

图搜索测试用例：
- BFS 访问顺序正确（层序）
- DFS 访问顺序正确（深度优先）
- 孤立节点被访问
- 环不会导致死循环
- 空图返回空结果
```

### 28.9 视觉风格

沿用 Claude Design 暖奶油画布风格：

- 页面背景：`#faf9f5`；
- 可视化区域：奶油卡片 `#efe9de` 底板；
- BST 节点：圆形，正常态奶油色边框，当前操作态珊瑚色填充 + 白字，已访问态浅蓝；
- BST 连线：深灰色，当前路径高亮为珊瑚色；
- 栈/队列方块：圆角矩形，正常态奶油色，栈顶/队首珊瑚色高亮；
- 哈希表桶：矩形格子，链表节点用小圆角矩形连接；
- 图节点：圆形，边为直线或曲线，BFS/DFS 时已访问节点渐变色；
- 动画过渡：节点状态变化用 0.3s 过渡；
- 步骤描述：monospace 字体，深色文字。

### 28.10 与现有排序可视化的复用

当前 `pages/sort-viz/sort-viz.js` 已经具备：

- 步骤生成器模式（每步记录数组状态）；
- 播放/暂停/步进控制；
- 速度调节；
- 步骤描述展示。

复用策略：

1. **控制栏组件**：抽取通用的播放控制逻辑，排序和数据结构共用；
2. **动画框架**：步骤回放机制一致，只是可视化内容不同；
3. **设计语言**：卡片、按钮、配色保持一致；
4. **首页入口**：可以考虑将"排序可视化"和"数据结构可视化"合并为一个"算法 & 数据结构"入口，内含子导航。

### 28.11 实现排期建议

一周版本建议只做 BST 模式（最完整、最能展示能力），其他模式作为扩展：

| 天数 | 任务 | 产出 |
|---|---|---|
| Day 1 | `utils/bst.js` 纯函数 + 测试 | BST 增删查+遍历逻辑完成 |
| Day 2 | 页面注册 + 首页入口 + 页面骨架 | 能打开页面，模式选择可切换 |
| Day 3 | BST 树形渲染（节点 + 连线布局算法） | 树结构可视化可见 |
| Day 4 | BST 操作动画（插入/查找路径高亮） | 能插入节点并看到路径 |
| Day 5 | 遍历动画 + 删除动画 | 四种遍历 + 三种删除情况 |
| Day 6 | 控制栏 + 步骤描述 + 速度调节 | 可逐步/自动播放 |
| Day 7 | 测试补全 + 文档更新 + 提交 | 稳定交付 |

### 28.12 文件清单

| 文件 | 类型 | 说明 |
|---|---|---|
| `utils/bst.js` | 新建 | BST 纯函数（增删查+遍历+布局） |
| `utils/hash-table.js` | 新建 | 哈希表纯函数（后续扩展） |
| `utils/graph.js` | 新建 | 图搜索纯函数（后续扩展） |
| `tests/utils/bst.test.js` | 新建 | BST 测试 |
| `pages/ds-viz/ds-viz.js` | 新建 | 页面逻辑 |
| `pages/ds-viz/ds-viz.wxml` | 新建 | 页面结构 |
| `pages/ds-viz/ds-viz.wxss` | 新建 | 页面样式 |
| `pages/ds-viz/ds-viz.json` | 新建 | 页面配置 |
| `app.json` | 修改 | 注册新页面 |
| `pages/index/index.js` | 修改 | 添加首页入口 |
| `pages/index/index.wxml` | 修改 | 添加首页卡片 |
| `pages/index/index.wxss` | 修改 | 卡片样式调整 |

### 28.13 未来扩展方向

1. **栈 & 队列模式**：Push/Pop/Enqueue/Dequeue 动画；
2. **哈希表模式**：链地址法冲突解决可视化；
3. **图 BFS/DFS 模式**：力导向布局 + 搜索动画；
4. **红黑树**：插入时的旋转和重新着色动画；
5. **最小堆**：插入时的上浮、删除时的下沉动画；
6. **Dijkstra 最短路径**：带权重图 + 优先队列 + 最短路径高亮；
7. **排序算法对比**：在数据结构框架下重新实现排序，支持同时运行两个算法做对比。

---

## 28.14 数据结构可视化 — 实施记录

> 实施时间：2026-06-13
> 状态：✅ MVP 完成（四种模式全部实现）

### 已创建文件

| 文件 | 说明 |
|---|---|
| `utils/bst.js` | BST 纯函数：插入、删除、查找、遍历、布局（42 个测试） |
| `utils/hash-table.js` | 哈希表纯函数：哈希计算、插入、查找、负载因子（20 个测试） |
| `utils/graph.js` | 图搜索纯函数：BFS、DFS、预设图结构（17 个测试） |
| `tests/utils/bst.test.js` | BST 测试文件 |
| `tests/utils/hash-table.test.js` | 哈希表测试文件 |
| `tests/utils/graph.test.js` | 图搜索测试文件 |
| `pages/ds-viz/ds-viz.js` | 页面逻辑（模式切换 + 四种可视化） |
| `pages/ds-viz/ds-viz.wxml` | 页面模板 |
| `pages/ds-viz/ds-viz.wxss` | 页面样式 |
| `pages/ds-viz/ds-viz.json` | 页面配置 |

### 已修改文件

| 文件 | 改动 |
|---|---|
| `app.json` | 注册 `pages/ds-viz/ds-viz` 页面 |
| `pages/index/index.js` | 添加「数据结构」入口卡片 + 路由 |

### 测试状态

- **11 个测试套件，218 个测试用例全部通过**
- 新增 79 个测试（BST 42 + 哈希表 20 + 图搜索 17）

### 技术实现要点

1. **BST 渲染**：Canvas 画连线 + WXML 绝对定位 view 画节点（混合方案）
2. **步骤回放**：复用 sort-viz 的步骤生成器 + setTimeout 递归回放模式
3. **布局算法**：中序遍历索引法（x = 索引 × 间距，y = 深度 × 层高）
4. **哈希表**：链地址法冲突解决，桶数组 + 链表可视化
5. **图搜索**：圆形布局预设图，BFS/DFS 步骤记录队列/栈状态
6. **设计风格**：沿用 Claude Design 暖奶油画布（#faf9f5 / #efe9de / #cc785c）

### 功能更新：随机生成 & 批量操作（2026-06-13）

BST、栈&队列、哈希表三种模式均新增随机生成按钮：

| 模式 | 按钮 | 功能 |
|---|---|---|
| BST | 🎲 随机 | 插入一个 1-99 的随机数（自动去重） |
| BST | 批量生成 | 一次插入 5 个随机数，直接显示结果 |
| 栈&队列 | 🎲 随机入栈/入队 | Push/Enqueue 一个随机数 |
| 栈&队列 | 批量生成 | 一次 Push/Enqueue 5 个随机数 |
| 哈希表 | 🎲 随机 key | 插入一个随机字母 key（3-6 位） |
| 哈希表 | 批量插入 | 一次插入 5 个随机 key |

用户仍可通过输入框手动输入数字或 key。

### 待优化

- BST 删除操作后树的重绘可能需要调整（当前依赖 snapshot）
- 图的节点布局为固定圆形，可考虑力导向布局
- 可添加更多预设图结构
- 栈&队列的动画可以更流畅（当前为即时切换）

---

## 29. 三个创意的横向对比与优先级建议

### 29.1 对比维度

| 维度 | 子网计算器 | TCP 动画机 | 数据结构可视化 |
|---|---|---|---|
| **网络工程相关度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **视觉炫技程度** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **技术深度展示** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **面试/考试实用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **一周可完成度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **现有代码复用** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **用户使用频率** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **朋友圈展示效果** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 29.2 推荐实现顺序

```text
第一优先：子网计算器
  → 最快完成（2-3 天可出 MVP）
  → 网络工程最直接的技能证明
  → 面试/考试立即可用

第二优先：TCP 动画机
  → 视觉冲击力最强
  → 序列图动画适合展示
  → 与子网计算器形成"网络工程工具集"

第三优先：数据结构可视化
  → 最能展示 CS 综合素养
  → 工作量最大但基础最好（复用排序可视化架构）
  → 适合作为"大招"功能
```

### 29.3 如果只能做一个

推荐：**子网计算器 + TCP 动画机组合**。

理由：

1. 两个都属于网络工程方向，形成专业特色；
2. 子网计算器偏工具实用，TCP 动画机偏教学炫技，互补；
3. 两个加起来一周内可以完成；
4. 首页形成"刷题 + 排序可视化 + 子网计算 + TCP 动画 + 学习驾驶舱"的工具矩阵，专业感很强。

### 29.4 首页最终形态预览

如果三个全部完成，首页工具区将变成：

```text
Hero：开始刷题

工具区：
┌─────────────┬─────────────┬─────────────┐
│  学习驾驶舱  │  子网计算器  │  TCP 动画机  │
│     📈       │     🌐       │     🔗       │
├─────────────┼─────────────┼─────────────┤
│  排序可视化  │  数据结构    │  单词记忆    │
│     📊       │     🌲       │     📝       │
└─────────────┴─────────────┴─────────────┘

快捷入口：答题记录 | 错题本
```

这样首页就是一个真正的 **CS 专业学习工具箱**，而不只是刷题工具。

---

## 30. TCP 动画机模块实现记录（2026-06-13）

### 30.1 实现状态

**已实现** ✅

### 30.2 模块定位

TCP 协议可视化教学工具。以序列图动画形式演示 TCP 三次握手、四次挥手、数据传输（滑动窗口）和丢包重传过程。每步展示报文字段（flags、seq、ack）、状态变化和教学解释。

### 30.3 已完成功能

1. **四种模式**：
   - 三次握手（3 步）
   - 数据传输 — 正常（8 步：4 发送 + 4 ACK）
   - 数据传输 — 丢包重传（9 步：含重复 ACK 和超时重传）
   - 四次挥手（4 步，含 TIME_WAIT）

2. **序列图可视化**：
   - Client/Server 双竖线布局
   - 报文箭头按类型着色（SYN 珊瑚色、SYN-ACK 渐变、ACK 灰色、FIN 橙色、数据绿色）
   - 当前步骤动画（fade-in），过去步骤半透明
   - 底部状态标签（彩色胶囊，随步骤变化）

3. **步骤详情面板**：
   - 步骤编号和标题
   - 6 个标志位高亮（SYN/ACK/FIN/RST/PSH/URG）
   - seq/ack/len 数值展示
   - 状态变化箭头（from → to）
   - 教学解释文字
   - 面试提示（examTip，带 💡 图标）

4. **播放控制**：
   - 播放/暂停
   - 上一步/下一步
   - 重置
   - 速度滑块（1-10）

5. **知识点卡片**（可折叠）：
   - 为什么是三次握手？
   - 为什么是四次挥手？
   - TIME_WAIT 的 2MSL
   - 滑动窗口的作用
   - GBN vs SR

### 30.4 文件清单

| 文件 | 类型 | 说明 |
|---|---|---|
| `utils/tcp-states.js` | 新建 | TCP 步骤数据、状态定义、场景生成纯函数 |
| `tests/utils/tcp-states.test.js` | 新建 | TCP 数据测试（35 个用例） |
| `pages/tcp-viz/tcp-viz.js` | 新建 | 页面逻辑 |
| `pages/tcp-viz/tcp-viz.wxml` | 新建 | 页面结构 |
| `pages/tcp-viz/tcp-viz.wxss` | 新建 | 页面样式（暖奶油画布） |
| `pages/tcp-viz/tcp-viz.json` | 新建 | 页面配置 |
| `app.json` | 修改 | 注册 `pages/tcp-viz/tcp-viz` |
| `pages/index/index.js` | 修改 | 添加 TCP 动画机卡片 + 导航 |

### 30.5 测试覆盖（35 个用例）

- TCP_STATES 常量：10 个状态定义完整、颜色正确
- 三次握手：3 步、flags 正确、seq/ack 递推、状态转换、explanation/highlight/examTip 字段
- 四次挥手：4 步、flags 正确、TIME_WAIT/CLOSE_WAIT/LAST_ACK 状态存在
- 数据传输：normal 场景 8 步、loss 场景 9 步、超时重传步骤存在、窗口 base 递增
- 完整连接：15 步、编号连续、首步 SYN 末步 ACK

### 30.6 设计风格

沿用 Claude Design 暖奶油画布风格：
- 页面背景：`#faf9f5`
- 卡片背景：`#efe9de`，圆角 24rpx
- CTA：`#cc785c`（珊瑚色）
- Client 竖线/箭头：珊瑚色系
- Server 端点：深海军蓝
- 标志位激活态：珊瑚色胶囊
- 状态标签：按 TCP_STATES 颜色定义
- 控制栏：与 sort-viz 统一设计语言

### 30.7 与创意规划二的对比

| 规划项 | 状态 | 说明 |
|---|---|---|
| 首页入口卡片 | ✅ | `TCP 动画机`，🔗 图标 |
| 三次握手模式 | ✅ | 3 步序列图 |
| 四次挥手模式 | ✅ | 4 步序列图 |
| 完整连接生命周期 | ❌ | 未单独实现（可组合握手+数据+挥手） |
| 步骤详情面板 | ✅ | flags + seq/ack + 状态变化 + 解释 |
| 状态栏 | ✅ | 底部彩色状态标签 |
| 播放控制 | ✅ | 播放/暂停/步进/重置/速度 |
| 知识点卡片 | ✅ | 5 个可折叠知识点 |
| 数据传输（滑动窗口） | ✅ | 序列图方式展示，含正常和丢包场景 |
| SYN Flood 攻击模拟 | ❌ | 暂不包含 |
| 拥塞控制动画 | ❌ | 暂不包含 |
| 滑动窗口可视化 | ⚠️ | 使用序列图展示，未做独立窗口条视图 |

### 30.8 未来扩展方向

1. **完整连接生命周期模式**：组合握手 + 数据传输 + 挥手为一个连续动画
2. **滑动窗口条可视化**：独立的发送方窗口条 + 窗口框滑动动画
3. **SYN Flood 攻击模拟**：展示半连接队列溢出
4. **拥塞控制曲线**：cwnd/ssthresh 变化图
5. **TCP vs UDP 对比模式**：并排展示可靠连接 vs 无连接发送
6. **Wireshark 风格报文详情**：展开 TCP 头部 20 字节逐字段高亮

### 30.9 当前测试状态

```text
Test Suites: 8 passed, 8 total
Tests:       139 passed, 139 total
```

新增 35 个 TCP 测试用例，原有 104 个测试全部通过。

---

## 31. 首页信息架构重构（2026-06-13）

### 31.1 背景

首页原有 6 个架构问题（详见 `docs/design/2026-06-13-homepage-redesign.md`）：

1. 学习驾驶舱放在「工具」区域，语义错误
2. 只有 4 个工具就分了 2 个子类，过早抽象
3. 工具增长无承载空间
4. 刷题模块与工具模块权重失衡
5. 「单词记忆」是 dead space
6. 缺少「工具发现」机制

### 31.2 改动内容

#### 新建文件

| 文件 | 说明 |
|---|---|
| `utils/tool-registry.js` | 工具注册表：5 个分类 + 23 个工具（4 个已实现 + 19 个预注册） |
| `tests/utils/tool-registry.test.js` | 注册表测试：18 个用例 |

#### 修改文件

| 文件 | 改动 |
|---|---|
| `pages/index/index.js` | 重写：引入 tool-registry + analytics，新增 loadStats/onCategoryTap |
| `pages/index/index.wxml` | 重写：5 Zone 结构（Hero/状态条/工具箱/快捷入口/备案号） |
| `pages/index/index.wxss` | 重写：新增 stats-band、category-tabs、tool-desc 样式 |

#### 未修改文件

`app.json`、`app.wxss`、所有 `pages/` 子页面、所有 `utils/` 工具模块——完全未动。

### 31.3 新首页结构

```
Zone 1 — Hero（不变）
  刷个冯题 · Tagline · 开始刷题 CTA

Zone 2 — 学习状态条（新增）
  📊 学习概览 + 4 个指标（累计刷题/练习次数/正确率/错题数）
  点击 → Dashboard
  空数据时显示引导文案

Zone 3 — 工具箱（重构）
  分类标签栏：[全部工具] [计算机网络] [算法&数据结构] ...
  全部工具视图：按分类分组，每分类最多 4 张卡片
  单一分类视图：2 列完整网格（含未实现工具灰显）

Zone 4 — 快捷入口（不变）
  答题记录 › | 错题本 ›

Zone 5 — 备案号（不变）
```

### 31.4 工具分类体系

| 分类 | ID | 已实现工具 |
|---|---|---|
| 计算机网络 | `network` | 子网计算器、TCP 动画机 |
| 操作系统 | `os` | 无（5 个预注册） |
| 密码学 | `crypto` | 无（5 个预注册） |
| 算法 & 数据结构 | `algo` | 排序可视化、数据结构可视化 |
| 编译原理 | `compiler` | 无（4 个预注册） |

### 31.5 测试状态

```text
Test Suites: 12 passed, 12 total
Tests:       236 passed, 236 total
```

新增 18 个 tool-registry 测试，原有 218 个测试全部通过。

---

## 32. 设计方法论文档库（2026-06-15）

### 32.1 概述

在 `design-methods/` 文件夹中创建了 **74 份设计方法论文档**，每份对应 `.claude/skills/` 中的一个大厂设计方案。

这些文档不是直接的设计稿，而是"如何设计"的方法论——告诉 agent：
- 该方案的核心设计思想是什么
- 哪些设计决策可以迁移到本项目
- 哪些需要改造、为什么
- 具体的色彩/字体/组件映射参数（rpx 单位）
- WXSS 实现示例

### 32.2 文件列表

共 74 个文件，命名规则：`{品牌名小写}-method.md`

涵盖品牌：Airbnb、Airtable、Apple、Binance、BMW、BMW M、Bugatti、Cal、Claude、Clay、ClickHouse、Cohere、Coinbase、Composio、Cursor、Dell 1996、ElevenLabs、Expo、Ferrari、Figma、Framer、HashiCorp、HP、IBM、Intercom、Kraken、Lamborghini、Linear、Lovable、Mastercard、Meta、MiniMax、Mintlify、Miro、Mistral、MongoDB、Nike、Nintendo 2001、Notion、NVIDIA、Ollama、OpenCode、Pinterest、PlayStation、PostHog、Raycast、Renault、Replicate、Resend、Revolut、RunwayML、Sanity、Sentry、Shopify、Slack、SpaceX、Spotify、Starbucks、Stripe、Supabase、Superhuman、Tesla、The Verge、Together AI、Uber、Vercel、Vodafone、Voltagent、Warp、Webflow、Wired、Wise、xAI、Zapier

### 32.3 文档结构

每份文档包含 6 个章节：
1. **原方案核心提取** — 设计哲学、视觉 DNA、色彩/字体/布局策略
2. **适配分析** — 可迁移 / 需改造 / 不可迁移的设计决策
3. **具体实施方法** — 色彩映射表、字体映射、组件规范、布局模板、WXSS 示例
4. **适用场景建议** — 最适合哪些页面、混搭建议
5. **实施检查清单** — 该方案特有的检查项
6. **参考文件** — 源文件和相关文档链接

### 32.4 使用方式

当 agent 需要为某个页面做设计时：
1. 确定要参考的设计风格（从 `design-methods/` 选择）
2. 读取对应的 `-method.md` 文件
3. 按照"具体实施方法"章节的规范编写 WXSS
4. 对照"实施检查清单"验证

### 32.5 与现有设计系统的关系

- **当前主力风格**：Claude Design 暖奶油画布（见 §25）
- **本文档库**：提供 74 种备选风格的实施方法论
- **混搭参考**：每份文档的 §4.3 提供与暖奶油画布的混搭建议
