# 刷个冯题 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个微信小程序，支持导入 Markdown 试题文件，以一题一页的方式刷题，支持练习/考试两种模式，记录答题历史和错题。

**Architecture:** 纯前端小程序，使用 wx.setStorageSync 本地存储。Markdown 解析用纯正则实现。页面结构：首页卡片入口 → 题目列表 → 刷题引擎 → 结果/记录/错题。

**Tech Stack:** 微信小程序原生框架、WXML/WXSS、wx.setStorageSync、Jest（测试）

---

## 文件结构

```
my-miniapp/
├── app.js                         # 入口，全局数据
├── app.json                       # 页面路由、窗口配置
├── app.wxss                       # 全局样式
├── project.config.json            # (已有)
├── sitemap.json                   # (已有)
├── package.json                   # Jest 测试依赖
├── jest.config.js                 # Jest 配置
├── __mocks__/
│   └── wx.js                      # wx API mock
├── tests/
│   ├── utils/
│   │   ├── util.test.js
│   │   ├── storage.test.js
│   │   └── markdown-parser.test.js
│   └── pages/
│       └── quiz-engine.test.js
├── utils/
│   ├── util.js                    # uuid、formatTime
│   ├── storage.js                 # 本地存储 CRUD 封装
│   └── markdown-parser.js         # Markdown 正则解析器
├── pages/
│   ├── index/                     # 首页：功能卡片入口
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── quiz-list/                 # 题目列表 + 导入入口
│   │   ├── quiz-list.js
│   │   ├── quiz-list.json
│   │   ├── quiz-list.wxml
│   │   └── quiz-list.wxss
│   ├── import-preview/            # 导入预览确认页
│   │   ├── import-preview.js
│   │   ├── import-preview.json
│   │   ├── import-preview.wxml
│   │   └── import-preview.wxss
│   ├── quiz/                      # 刷题引擎
│   │   ├── quiz.js
│   │   ├── quiz.json
│   │   ├── quiz.wxml
│   │   └── quiz.wxss
│   ├── result/                    # 结果页
│   │   ├── result.js
│   │   ├── result.json
│   │   ├── result.wxml
│   │   └── result.wxss
│   ├── records/                   # 答题记录列表
│   │   ├── records.js
│   │   ├── records.json
│   │   ├── records.wxml
│   │   └── records.wxss
│   ├── record-detail/             # 记录详情（逐题回顾）
│   │   ├── record-detail.js
│   │   ├── record-detail.json
│   │   ├── record-detail.wxml
│   │   └── record-detail.wxss
│   └── wrong-questions/           # 错题本
│       ├── wrong-questions.js
│       ├── wrong-questions.json
│       ├── wrong-questions.wxml
│       └── wrong-questions.wxss
```

---

## Task 1：项目初始化与测试环境

**Files:**
- Create: `package.json`
- Create: `jest.config.js`
- Create: `__mocks__/wx.js`

- [ ] **Step 1: 创建 package.json**

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

- [ ] **Step 2: 创建 jest.config.js**

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  setupFiles: ['<rootDir>/__mocks__/wx.js']
};
```

- [ ] **Step 3: 创建 wx mock**

```javascript
// __mocks__/wx.js
const storage = {};

global.wx = {
  getStorageSync(key) {
    return storage[key] || '';
  },
  setStorageSync(key, value) {
    storage[key] = value;
  },
  removeStorageSync(key) {
    delete storage[key];
  },
  clearStorageSync() {
    Object.keys(storage).forEach(k => delete storage[k]);
  },
  showToast(options) {},
  showModal(options) {},
  navigateTo(options) {},
  redirectTo(options) {},
  switchTab(options) {},
  navigateBack() {},
  chooseMessageFile(options) {},
  getFileSystemManager() {
    return {
      readFileSync(filePath, encoding) {
        return '';
      }
    };
  },
  getStorageSync_info() {
    return { keys: Object.keys(storage) };
  }
};

// Helper to clear storage between tests
global.__clearMockStorage = () => {
  Object.keys(storage).forEach(k => delete storage[k]);
};
```

- [ ] **Step 4: 安装依赖并验证**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm install`
Expected: node_modules 创建成功，无报错

- [ ] **Step 5: 运行空测试套件验证环境**

Run: `npm test`
Expected: "No tests found" 或类似提示，无错误

---

## Task 2：工具函数 (utils/util.js)

**Files:**
- Create: `utils/util.js`
- Create: `tests/utils/util.test.js`

- [ ] **Step 1: 写失败测试**

```javascript
// tests/utils/util.test.js
const { generateId, formatTime, formatDuration } = require('../../utils/util');

describe('generateId', () => {
  test('生成唯一 ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });
});

describe('formatTime', () => {
  test('格式化 Date 对象', () => {
    const date = new Date('2026-05-31T14:30:00');
    const result = formatTime(date);
    expect(result).toBe('2026-05-31 14:30:00');
  });
});

describe('formatDuration', () => {
  test('格式化秒数为分秒', () => {
    expect(formatDuration(65)).toBe('1分5秒');
  });
  test('格式化整分钟', () => {
    expect(formatDuration(120)).toBe('2分0秒');
  });
  test('不到一分钟', () => {
    expect(formatDuration(45)).toBe('45秒');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx jest tests/utils/util.test.js --verbose`
Expected: FAIL — Cannot find module '../../utils/util'

- [ ] **Step 3: 实现 util.js**

```javascript
// utils/util.js
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${s}秒`;
}

module.exports = { generateId, formatTime, formatDuration };
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx jest tests/utils/util.test.js --verbose`
Expected: 3 tests passed

- [ ] **Step 5: 提交**

```bash
git add utils/util.js tests/utils/util.test.js package.json jest.config.js __mocks__/wx.js
git commit -m "feat: add utility functions with tests"
```

---

## Task 3：本地存储封装 (utils/storage.js)

**Files:**
- Create: `utils/storage.js`
- Create: `tests/utils/storage.test.js`

- [ ] **Step 1: 写失败测试**

```javascript
// tests/utils/storage.test.js
const storage = require('../../utils/storage');

beforeEach(() => {
  global.__clearMockStorage();
});

describe('papers 存储', () => {
  test('初始获取返回空数组', () => {
    expect(storage.getPapers()).toEqual([]);
  });

  test('保存和获取试卷', () => {
    const paper = { id: 'p1', name: '测试试卷', questions: [] };
    storage.savePaper(paper);
    const papers = storage.getPapers();
    expect(papers).toHaveLength(1);
    expect(papers[0].id).toBe('p1');
  });

  test('获取单张试卷', () => {
    const paper = { id: 'p1', name: '测试试卷', questions: [] };
    storage.savePaper(paper);
    expect(storage.getPaperById('p1')).toEqual(paper);
    expect(storage.getPaperById('p2')).toBeNull();
  });

  test('删除试卷', () => {
    storage.savePaper({ id: 'p1', name: '试卷1', questions: [] });
    storage.savePaper({ id: 'p2', name: '试卷2', questions: [] });
    storage.deletePaper('p1');
    expect(storage.getPapers()).toHaveLength(1);
    expect(storage.getPapers()[0].id).toBe('p2');
  });
});

describe('records 存储', () => {
  test('保存和获取记录', () => {
    const record = { id: 'r1', paperId: 'p1', accuracy: 80 };
    storage.saveRecord(record);
    expect(storage.getRecords()).toHaveLength(1);
  });

  test('按试卷获取记录', () => {
    storage.saveRecord({ id: 'r1', paperId: 'p1' });
    storage.saveRecord({ id: 'r2', paperId: 'p2' });
    storage.saveRecord({ id: 'r3', paperId: 'p1' });
    expect(storage.getRecordsByPaperId('p1')).toHaveLength(2);
  });
});

describe('wrongQuestions 存储', () => {
  test('添加错题', () => {
    storage.addWrongQuestion({
      questionId: 'q1',
      paperId: 'p1',
      question: { stem: '题目1' }
    });
    const wrongs = storage.getWrongQuestions();
    expect(wrongs).toHaveLength(1);
    expect(wrongs[0].wrongCount).toBe(1);
  });

  test('重复添加同一题增加计数', () => {
    storage.addWrongQuestion({ questionId: 'q1', paperId: 'p1', question: {} });
    storage.addWrongQuestion({ questionId: 'q1', paperId: 'p1', question: {} });
    expect(storage.getWrongQuestions()[0].wrongCount).toBe(2);
  });

  test('标记已掌握', () => {
    storage.addWrongQuestion({ questionId: 'q1', paperId: 'p1', question: {} });
    storage.markMastered('q1');
    expect(storage.getWrongQuestions()[0].mastered).toBe(true);
    expect(storage.getUnmasteredWrongQuestions()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx jest tests/utils/storage.test.js --verbose`
Expected: FAIL — Cannot find module

- [ ] **Step 3: 实现 storage.js**

```javascript
// utils/storage.js
const KEYS = {
  PAPERS: 'papers',
  RECORDS: 'records',
  WRONG_QUESTIONS: 'wrongQuestions'
};

function _get(key) {
  try {
    const data = wx.getStorageSync(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function _set(key, data) {
  wx.setStorageSync(key, JSON.stringify(data));
}

// === 试卷 ===
function getPapers() {
  return _get(KEYS.PAPERS);
}

function savePaper(paper) {
  const papers = getPapers();
  const idx = papers.findIndex(p => p.id === paper.id);
  if (idx >= 0) {
    papers[idx] = paper;
  } else {
    papers.push(paper);
  }
  _set(KEYS.PAPERS, papers);
}

function getPaperById(id) {
  return getPapers().find(p => p.id === id) || null;
}

function deletePaper(id) {
  const papers = getPapers().filter(p => p.id !== id);
  _set(KEYS.PAPERS, papers);
}

// === 记录 ===
function getRecords() {
  return _get(KEYS.RECORDS);
}

function saveRecord(record) {
  const records = getRecords();
  records.push(record);
  _set(KEYS.RECORDS, records);
}

function getRecordsByPaperId(paperId) {
  return getRecords().filter(r => r.paperId === paperId);
}

// === 错题 ===
function getWrongQuestions() {
  return _get(KEYS.WRONG_QUESTIONS);
}

function getUnmasteredWrongQuestions() {
  return getWrongQuestions().filter(q => !q.mastered);
}

function addWrongQuestion({ questionId, paperId, question }) {
  const wrongs = getWrongQuestions();
  const existing = wrongs.find(w => w.questionId === questionId);
  if (existing) {
    existing.wrongCount += 1;
    existing.lastWrongTime = new Date().toISOString();
  } else {
    wrongs.push({
      questionId,
      paperId,
      question,
      wrongCount: 1,
      mastered: false,
      lastWrongTime: new Date().toISOString()
    });
  }
  _set(KEYS.WRONG_QUESTIONS, wrongs);
}

function markMastered(questionId) {
  const wrongs = getWrongQuestions();
  const item = wrongs.find(w => w.questionId === questionId);
  if (item) {
    item.mastered = true;
    _set(KEYS.WRONG_QUESTIONS, wrongs);
  }
}

module.exports = {
  getPapers, savePaper, getPaperById, deletePaper,
  getRecords, saveRecord, getRecordsByPaperId,
  getWrongQuestions, getUnmasteredWrongQuestions, addWrongQuestion, markMastered
};
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx jest tests/utils/storage.test.js --verbose`
Expected: 全部测试通过

- [ ] **Step 5: 提交**

```bash
git add utils/storage.js tests/utils/storage.test.js
git commit -m "feat: add local storage CRUD with tests"
```

---

## Task 4：Markdown 解析器 (utils/markdown-parser.js)

**Files:**
- Create: `utils/markdown-parser.js`
- Create: `tests/utils/markdown-parser.test.js`

- [ ] **Step 1: 写失败测试**

```javascript
// tests/utils/markdown-parser.test.js
const { parseMarkdown } = require('../../utils/markdown-parser');

describe('parseMarkdown', () => {
  test('解析标准格式单选题', () => {
    const md = `1. 以下哪个是正确的？
A. 选项一
B. 选项二
C. 选项三
D. 选项四
答案：A

2. 第二题
A. 甲
B. 乙
答案：B`;
    const result = parseMarkdown(md);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('single');
    expect(result[0].stem).toContain('以下哪个是正确的');
    expect(result[0].options).toHaveLength(4);
    expect(result[0].answer).toBe('A');
    expect(result[1].answer).toBe('B');
  });

  test('解析增强格式（## 标题）', () => {
    const md = `## 第1题
以下哪个排序算法最优？
A. 冒泡
B. 快速
C. 选择
D. 插入
**答案：B**`;
    const result = parseMarkdown(md);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('single');
    expect(result[0].answer).toBe('B');
  });

  test('解析多选题', () => {
    const md = `1. 多选题
A. 选项A
B. 选项B
C. 选项C
D. 选项D
答案：AB`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('multi');
    expect(result[0].answer).toBe('AB');
  });

  test('解析多选题（逗号分隔）', () => {
    const md = `1. 多选题
A. 选项A
B. 选项B
C. 选项C
答案：A,C`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('multi');
    expect(result[0].answer).toBe('AC');
  });

  test('解析判断题', () => {
    const md = `1. 地球是圆的
A. 对
B. 错
答案：A`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('judge');
  });

  test('解析填空题', () => {
    const md = `1. 中国的首都是___。
答案：北京`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('fill');
    expect(result[0].answer).toBe('北京');
  });

  test('解析填空题（多空）', () => {
    const md = `1. ___和___是两大直辖市。
答案：北京,上海`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('fill');
    expect(result[0].answer).toBe('北京,上海');
  });

  test('解析简答题', () => {
    const md = `1. 请解释什么是递归。
答案：递归是指函数调用自身的过程`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('essay');
  });

  test('解析含解析的题目', () => {
    const md = `1. 1+1=?
A. 1
B. 2
C. 3
D. 4
答案：B
解析：1加1等于2`;
    const result = parseMarkdown(md);
    expect(result[0].explanation).toContain('1加1等于2');
  });

  test('空内容返回空数组', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown(null)).toEqual([]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx jest tests/utils/markdown-parser.test.js --verbose`
Expected: FAIL — Cannot find module

- [ ] **Step 3: 实现 markdown-parser.js**

```javascript
// utils/markdown-parser.js
const { generateId } = require('./util');

function parseMarkdown(text) {
  if (!text || typeof text !== 'string') return [];

  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into question blocks
  const blocks = splitIntoBlocks(text);
  const questions = [];

  for (const block of blocks) {
    const q = parseBlock(block);
    if (q) questions.push(q);
  }

  return questions;
}

function splitIntoBlocks(text) {
  // Split by numbered questions: "1." "2." or "## 第N题"
  const pattern = /(?=^\d+[\.\、\)]\s)|(?=^##\s*第?\d+题)/gm;
  const blocks = text.split(pattern).filter(b => b.trim());
  return blocks;
}

function parseBlock(block) {
  const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);

  if (lines.length === 0) return null;

  // Extract stem (first line, remove number prefix)
  let stem = lines[0]
    .replace(/^\d+[\.\、\)]\s*/, '')
    .replace(/^##\s*第?\d+题\s*/, '')
    .trim();

  if (!stem) return null;

  // Extract options
  const options = [];
  let answerLine = '';
  let explanationLine = '';
  let optionEndIdx = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const optionMatch = line.match(/^([A-Z])[\.\、\)]\s*(.+)/);
    const answerMatch = line.match(/(?:答案|answer)[：:]\s*(.+)/i);
    const explanationMatch = line.match(/(?:解析|explanation|解释|说明)[：:]\s*(.+)/i);

    if (optionMatch) {
      options.push(line);
      optionEndIdx = i;
    } else if (answerMatch) {
      answerLine = answerMatch[1].trim();
    } else if (explanationMatch) {
      explanationLine = explanationMatch[1].trim();
    } else if (options.length > 0 && !answerLine) {
      // Continuation of stem (multi-line stem)
      stem += '\n' + line;
    } else if (!options.length && !answerLine) {
      stem += '\n' + line;
    }
  }

  // Parse answer (remove markdown bold markers)
  let answer = answerLine.replace(/\*\*/g, '').trim();
  // Normalize comma-separated answers: "A,C" → "AC"
  answer = answer.replace(/,/g, '').replace(/\s+/g, '');

  // Determine question type
  let type = 'essay';
  if (options.length >= 2) {
    const optionLetters = options.map(o => o.match(/^([A-Z])/)[1]);
    const isJudge = options.length === 2 &&
      ((optionLetters.includes('A') && optionLetters.includes('B')) ||
       options.some(o => /[对错是否真假]/.test(o)));

    if (isJudge) {
      type = 'judge';
    } else if (answer.length > 1 || /[A-Z].*[A-Z]/.test(answer)) {
      type = 'multi';
    } else {
      type = 'single';
    }
  } else if (answer && (stem.includes('___') || stem.includes('（ ）') || stem.includes('____'))) {
    type = 'fill';
  }

  return {
    id: generateId(),
    type,
    stem,
    options,
    answer,
    explanation: explanationLine
  };
}

module.exports = { parseMarkdown };
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx jest tests/utils/markdown-parser.test.js --verbose`
Expected: 全部测试通过

- [ ] **Step 5: 提交**

```bash
git add utils/markdown-parser.js tests/utils/markdown-parser.test.js
git commit -m "feat: add markdown parser with multi-format support"
```

---

## Task 5：全局配置与首页

**Files:**
- Modify: `app.json`
- Modify: `app.js`
- Modify: `app.wxss`
- Create: `pages/index/index.js`
- Create: `pages/index/index.json`
- Create: `pages/index/index.wxml`
- Create: `pages/index/index.wxss`

- [ ] **Step 1: 更新 app.json — 注册所有页面**

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
    "pages/wrong-questions/wrong-questions"
  ],
  "window": {
    "navigationBarBackgroundColor": "#07c160",
    "navigationBarTitleText": "刷个冯题",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f5f5f5"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

- [ ] **Step 2: 更新 app.js**

```javascript
App({
  onLaunch() {
    console.log('刷个冯题 启动');
  },
  globalData: {}
});
```

- [ ] **Step 3: 更新 app.wxss — 全局通用样式**

```css
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  color: #333;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.container {
  padding: 30rpx;
}

.btn-primary {
  background-color: #07c160;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 30rpx;
  text-align: center;
}

.btn-primary::after {
  border: none;
}

.btn-secondary {
  background-color: #fff;
  color: #07c160;
  border: 2rpx solid #07c160;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 30rpx;
  text-align: center;
}

.tag {
  display: inline-block;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
}

.tag-green {
  background-color: #e6f9ef;
  color: #07c160;
}

.tag-gray {
  background-color: #f0f0f0;
  color: #999;
}

.tag-red {
  background-color: #fef0f0;
  color: #e64340;
}
```

- [ ] **Step 4: 创建首页 index.js**

```javascript
Page({
  data: {
    features: [
      {
        id: 'quiz',
        name: '刷题',
        desc: '导入试题，一题一题刷',
        icon: '📝',
        available: true
      },
      {
        id: 'sort-viz',
        name: '排序可视化',
        desc: '排序算法动画演示',
        icon: '📊',
        available: false
      },
      {
        id: 'vocab',
        name: '单词记忆',
        desc: '高效记忆英语单词',
        icon: '📖',
        available: false
      }
    ]
  },

  onFeatureTap(e) {
    const { id, available } = e.currentTarget.dataset;
    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    if (id === 'quiz') {
      wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
    }
  }
});
```

- [ ] **Step 5: 创建首页 index.json**

```json
{
  "navigationBarTitleText": "刷个冯题",
  "usingComponents": {}
}
```

- [ ] **Step 6: 创建首页 index.wxml**

```html
<view class="container">
  <view class="app-header">
    <text class="app-title">刷个冯题</text>
    <text class="app-subtitle">你的学习工具箱</text>
  </view>
  <view class="feature-grid">
    <view
      class="feature-card {{item.available ? '' : 'card-disabled'}}"
      wx:for="{{features}}"
      wx:key="id"
      data-id="{{item.id}}"
      data-available="{{item.available}}"
      bindtap="onFeatureTap"
    >
      <text class="feature-icon">{{item.icon}}</text>
      <text class="feature-name">{{item.name}}</text>
      <text class="feature-desc">{{item.desc}}</text>
      <text class="feature-tag" wx:if="{{!item.available}}">即将上线</text>
    </view>
  </view>
</view>
```

- [ ] **Step 7: 创建首页 index.wxss**

```css
.app-header {
  text-align: center;
  padding: 60rpx 0 40rpx;
}

.app-title {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #07c160;
}

.app-subtitle {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}

.feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.feature-card {
  width: calc(50% - 12rpx);
  background: #fff;
  border-radius: 16rpx;
  padding: 36rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.card-disabled {
  opacity: 0.5;
}

.feature-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.feature-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

.feature-tag {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  font-size: 20rpx;
  background: #f0f0f0;
  color: #999;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
```

- [ ] **Step 8: 验证首页渲染**

在微信开发者工具中查看首页是否正常显示三个功能卡片。点击"刷题"能跳转（虽然目标页还没创建会报错，这是预期的）。点击"排序可视化"弹出 toast。

- [ ] **Step 9: 提交**

```bash
git add app.json app.js app.wxss pages/index/
git commit -m "feat: add home page with feature card grid"
```

---

## Task 6：题目列表页 (pages/quiz-list)

**Files:**
- Create: `pages/quiz-list/quiz-list.js`
- Create: `pages/quiz-list/quiz-list.json`
- Create: `pages/quiz-list/quiz-list.wxml`
- Create: `pages/quiz-list/quiz-list.wxss`

- [ ] **Step 1: 创建 quiz-list.js**

```javascript
const storage = require('../../utils/storage');
const { parseMarkdown } = require('../../utils/markdown-parser');
const { generateId } = require('../../utils/util');

Page({
  data: {
    papers: []
  },

  onShow() {
    this.loadPapers();
  },

  loadPapers() {
    this.setData({ papers: storage.getPapers() });
  },

  onImport() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['md'],
      success: (res) => {
        const file = res.tempFiles[0];
        const fs = wx.getFileSystemManager();
        try {
          const content = fs.readFileSync(file.path, 'utf-8');
          const questions = parseMarkdown(content);
          if (questions.length === 0) {
            wx.showToast({ title: '未识别到题目', icon: 'none' });
            return;
          }
          // Navigate to preview
          const paperData = JSON.stringify({
            name: file.name.replace(/\.md$/i, ''),
            questions
          });
          wx.navigateTo({
            url: `/pages/import-preview/import-preview?data=${encodeURIComponent(paperData)}`
          });
        } catch (e) {
          wx.showToast({ title: '文件读取失败', icon: 'none' });
        }
      }
    });
  },

  onTapPaper(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/quiz/quiz?paperId=${id}`
    });
  },

  onDeletePaper(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这套题吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deletePaper(id);
          this.loadPapers();
          wx.showToast({ title: '已删除' });
        }
      }
    });
  },

  goToRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goToWrongQuestions() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  }
});
```

- [ ] **Step 2: 创建 quiz-list.json**

```json
{
  "navigationBarTitleText": "题目列表",
  "usingComponents": {}
}
```

- [ ] **Step 3: 创建 quiz-list.wxml**

```html
<view class="container">
  <view class="toolbar">
    <view class="toolbar-left">
      <text class="paper-count">共 {{papers.length}} 套题</text>
    </view>
    <view class="toolbar-right">
      <view class="tool-link" bindtap="goToRecords">答题记录</view>
      <view class="tool-link" bindtap="goToWrongQuestions">错题本</view>
    </view>
  </view>

  <view class="paper-list" wx:if="{{papers.length > 0}}">
    <view
      class="paper-item"
      wx:for="{{papers}}"
      wx:key="id"
    >
      <view class="paper-info" data-id="{{item.id}}" bindtap="onTapPaper">
        <text class="paper-name">{{item.name}}</text>
        <view class="paper-meta">
          <text class="paper-count-text">{{item.questionCount}} 题</text>
          <text class="paper-time">{{item.importTime}}</text>
        </view>
      </view>
      <view class="paper-delete" data-id="{{item.id}}" catchtap="onDeletePaper">
        <text class="delete-text">删除</text>
      </view>
    </view>
  </view>

  <view class="empty" wx:else>
    <text class="empty-icon">📂</text>
    <text class="empty-text">还没有导入任何试题</text>
    <text class="empty-hint">点击下方按钮导入 .md 文件</text>
  </view>

  <view class="fab" bindtap="onImport">
    <text class="fab-text">+</text>
  </view>
</view>
```

- [ ] **Step 4: 创建 quiz-list.wxss**

```css
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.paper-count {
  font-size: 26rpx;
  color: #999;
}

.toolbar-right {
  display: flex;
  gap: 24rpx;
}

.tool-link {
  font-size: 26rpx;
  color: #07c160;
}

.paper-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.paper-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.paper-info {
  flex: 1;
}

.paper-name {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.paper-meta {
  display: flex;
  gap: 24rpx;
}

.paper-count-text, .paper-time {
  font-size: 24rpx;
  color: #999;
}

.paper-delete {
  padding: 12rpx 20rpx;
}

.delete-text {
  font-size: 24rpx;
  color: #e64340;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 80rpx;
  width: 100rpx;
  height: 100rpx;
  background: #07c160;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.4);
}

.fab-text {
  color: #fff;
  font-size: 48rpx;
  line-height: 1;
}
```

- [ ] **Step 5: 在开发者工具中验证**

从首页点击"刷题"进入题目列表页，应显示空状态。右下角有"+"按钮。

- [ ] **Step 6: 提交**

```bash
git add pages/quiz-list/
git commit -m "feat: add quiz list page with import button"
```

---

## Task 7：导入预览页 (pages/import-preview)

**Files:**
- Create: `pages/import-preview/import-preview.js`
- Create: `pages/import-preview/import-preview.json`
- Create: `pages/import-preview/import-preview.wxml`
- Create: `pages/import-preview/import-preview.wxss`

- [ ] **Step 1: 创建 import-preview.js**

```javascript
const storage = require('../../utils/storage');
const { generateId, formatTime } = require('../../utils/util');

Page({
  data: {
    name: '',
    questions: [],
    typeStats: {}
  },

  onLoad(options) {
    const paperData = JSON.parse(decodeURIComponent(options.data));
    const typeStats = this.calcTypeStats(paperData.questions);
    this.setData({
      name: paperData.name,
      questions: paperData.questions,
      typeStats
    });
  },

  calcTypeStats(questions) {
    const stats = { single: 0, multi: 0, judge: 0, fill: 0, essay: 0 };
    questions.forEach(q => { stats[q.type] = (stats[q.type] || 0) + 1; });
    return stats;
  },

  onConfirm() {
    const paper = {
      id: generateId(),
      name: this.data.name,
      importTime: formatTime(new Date()),
      questionCount: this.data.questions.length,
      questions: this.data.questions
    };
    storage.savePaper(paper);
    wx.showToast({ title: '导入成功' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  onCancel() {
    wx.navigateBack();
  }
});
```

- [ ] **Step 2: 创建 import-preview.json**

```json
{
  "navigationBarTitleText": "导入预览",
  "usingComponents": {}
}
```

- [ ] **Step 3: 创建 import-preview.wxml**

```html
<view class="container">
  <view class="preview-card">
    <text class="preview-title">确认导入</text>

    <view class="stat-row">
      <text class="stat-label">试卷名称</text>
      <text class="stat-value">{{name}}</text>
    </view>
    <view class="stat-row">
      <text class="stat-label">题目总数</text>
      <text class="stat-value highlight">{{questions.length}} 题</text>
    </view>

    <view class="type-breakdown">
      <view class="type-item" wx:if="{{typeStats.single > 0}}">
        <text class="type-dot dot-blue"></text>
        <text>单选 {{typeStats.single}} 题</text>
      </view>
      <view class="type-item" wx:if="{{typeStats.multi > 0}}">
        <text class="type-dot dot-purple"></text>
        <text>多选 {{typeStats.multi}} 题</text>
      </view>
      <view class="type-item" wx:if="{{typeStats.judge > 0}}">
        <text class="type-dot dot-orange"></text>
        <text>判断 {{typeStats.judge}} 题</text>
      </view>
      <view class="type-item" wx:if="{{typeStats.fill > 0}}">
        <text class="type-dot dot-green"></text>
        <text>填空 {{typeStats.fill}} 题</text>
      </view>
      <view class="type-item" wx:if="{{typeStats.essay > 0}}">
        <text class="type-dot dot-gray"></text>
        <text>简答 {{typeStats.essay}} 题</text>
      </view>
    </view>
  </view>

  <view class="actions">
    <button class="btn-secondary" bindtap="onCancel">取消</button>
    <button class="btn-primary" bindtap="onConfirm">确认导入</button>
  </view>
</view>
```

- [ ] **Step 4: 创建 import-preview.wxss**

```css
.preview-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
}

.preview-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 32rpx;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.stat-label {
  color: #666;
}

.stat-value {
  color: #333;
  font-weight: bold;
}

.highlight {
  color: #07c160;
}

.type-breakdown {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.type-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.dot-blue { background: #1890ff; }
.dot-purple { background: #722ed1; }
.dot-orange { background: #fa8c16; }
.dot-green { background: #07c160; }
.dot-gray { background: #999; }

.actions {
  display: flex;
  gap: 24rpx;
}

.actions button {
  flex: 1;
}
```

- [ ] **Step 5: 验证导入流程**

在开发者工具中：点击"+" → 选择 .md 文件 → 跳转到预览页 → 显示题目统计 → 点击确认 → 返回列表页

- [ ] **Step 6: 提交**

```bash
git add pages/import-preview/
git commit -m "feat: add import preview page"
```

---

## Task 8：刷题引擎 (pages/quiz)

**Files:**
- Create: `pages/quiz/quiz.js`
- Create: `pages/quiz/quiz.json`
- Create: `pages/quiz/quiz.wxml`
- Create: `pages/quiz/quiz.wxss`
- Create: `tests/pages/quiz-engine.test.js`

- [ ] **Step 1: 写刷题逻辑的单元测试**

```javascript
// tests/pages/quiz-engine.test.js
// Test the scoring logic extracted for testability

function checkAnswer(question, userAnswer) {
  if (!userAnswer || userAnswer === '') return false;
  switch (question.type) {
    case 'single':
    case 'judge':
      return userAnswer === question.answer;
    case 'multi': {
      const correct = question.answer.split('').sort().join('');
      const user = userAnswer.split('').sort().join('');
      return correct === user;
    }
    case 'fill': {
      const correctParts = question.answer.split(',').map(s => s.trim().toLowerCase());
      const userParts = userAnswer.split(',').map(s => s.trim().toLowerCase());
      if (correctParts.length !== userParts.length) return false;
      return correctParts.every((c, i) => c === userParts[i]);
    }
    case 'essay':
      return userAnswer.trim().length > 0;
    default:
      return false;
  }
}

describe('checkAnswer', () => {
  test('单选正确', () => {
    expect(checkAnswer({ type: 'single', answer: 'A' }, 'A')).toBe(true);
  });
  test('单选错误', () => {
    expect(checkAnswer({ type: 'single', answer: 'A' }, 'B')).toBe(false);
  });
  test('多选正确（顺序不同）', () => {
    expect(checkAnswer({ type: 'multi', answer: 'ABD' }, 'DAB')).toBe(true);
  });
  test('多选错误', () => {
    expect(checkAnswer({ type: 'multi', answer: 'ABD' }, 'ABC')).toBe(false);
  });
  test('判断正确', () => {
    expect(checkAnswer({ type: 'judge', answer: 'A' }, 'A')).toBe(true);
  });
  test('填空正确（忽略大小写）', () => {
    expect(checkAnswer({ type: 'fill', answer: '北京' }, '北京')).toBe(true);
    expect(checkAnswer({ type: 'fill', answer: '北京' }, 'BEIJING')).toBe(false);
  });
  test('填空多空正确', () => {
    expect(checkAnswer({ type: 'fill', answer: '北京,上海' }, '北京,上海')).toBe(true);
    expect(checkAnswer({ type: 'fill', answer: '北京,上海' }, '上海,北京')).toBe(false);
  });
  test('简答有内容即为已作答', () => {
    expect(checkAnswer({ type: 'essay' }, '这是答案')).toBe(true);
    expect(checkAnswer({ type: 'essay' }, '')).toBe(false);
  });
  test('空答案返回 false', () => {
    expect(checkAnswer({ type: 'single', answer: 'A' }, '')).toBe(false);
    expect(checkAnswer({ type: 'single', answer: 'A' }, null)).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试确认通过**

Run: `npx jest tests/pages/quiz-engine.test.js --verbose`
Expected: 全部通过（纯函数，无需 mock）

- [ ] **Step 3: 创建 quiz.js**

```javascript
const storage = require('../../utils/storage');
const { generateId, formatTime } = require('../../utils/util');

Page({
  data: {
    paper: null,
    questions: [],
    currentIdx: 0,
    currentQuestion: null,
    mode: 'practice',        // practice | exam
    modeSelected: false,
    userAnswer: '',
    answered: false,          // 练习模式：当前题是否已提交
    showExplanation: false,
    answers: {},              // { questionId: { userAnswer, correct } }
    startTime: null,
    totalQuestions: 0
  },

  onLoad(options) {
    const paper = storage.getPaperById(options.paperId);
    if (!paper) {
      wx.showToast({ title: '试卷不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({
      paper,
      questions: paper.questions,
      totalQuestions: paper.questions.length
    });
  },

  // 模式选择
  selectMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      mode,
      modeSelected: true,
      currentQuestion: this.data.questions[0],
      startTime: Date.now()
    });
  },

  // 选择答案（单选/判断）
  onSelectOption(e) {
    if (this.data.answered && this.data.mode === 'practice') return;
    const answer = e.currentTarget.dataset.option;
    this.setData({ userAnswer: answer });
  },

  // 多选切换
  onToggleMulti(e) {
    if (this.data.answered && this.data.mode === 'practice') return;
    const option = e.currentTarget.dataset.option;
    let current = this.data.userAnswer || '';
    if (current.includes(option)) {
      current = current.replace(option, '');
    } else {
      current = (current + option).split('').sort().join('');
    }
    this.setData({ userAnswer: current });
  },

  // 判断选择
  onJudge(e) {
    if (this.data.answered && this.data.mode === 'practice') return;
    this.setData({ userAnswer: e.currentTarget.dataset.value });
  },

  // 填空/简答输入
  onTextInput(e) {
    this.setData({ userAnswer: e.detail.value });
  },

  // 判分
  checkAnswer(question, userAnswer) {
    if (!userAnswer || userAnswer === '') return false;
    switch (question.type) {
      case 'single':
      case 'judge':
        return userAnswer === question.answer;
      case 'multi': {
        const correct = question.answer.split('').sort().join('');
        const user = userAnswer.split('').sort().join('');
        return correct === user;
      }
      case 'fill': {
        const correctParts = question.answer.split(',').map(s => s.trim().toLowerCase());
        const userParts = userAnswer.split(',').map(s => s.trim().toLowerCase());
        if (correctParts.length !== userParts.length) return false;
        return correctParts.every((c, i) => c === userParts[i]);
      }
      case 'essay':
        return userAnswer.trim().length > 0;
      default:
        return false;
    }
  },

  // 提交当前题
  onSubmit() {
    const { currentQuestion, userAnswer, mode, answers } = this.data;
    if (!userAnswer || userAnswer === '') {
      wx.showToast({ title: '请先作答', icon: 'none' });
      return;
    }

    const correct = this.checkAnswer(currentQuestion, userAnswer);
    const newAnswers = { ...answers };
    newAnswers[currentQuestion.id] = { userAnswer, correct };

    if (mode === 'practice') {
      this.setData({
        answers: newAnswers,
        answered: true,
        showExplanation: true
      });
    } else {
      // 考试模式：记录答案，不显示结果
      this.setData({
        answers: newAnswers,
        userAnswer: ''
      });
      this.goNext();
    }
  },

  // 下一题
  goNext() {
    const { currentIdx, questions } = this.data;
    if (currentIdx >= questions.length - 1) {
      this.finishQuiz();
      return;
    }
    const nextIdx = currentIdx + 1;
    const nextQ = questions[nextIdx];
    const existingAnswer = this.data.answers[nextQ.id];
    this.setData({
      currentIdx: nextIdx,
      currentQuestion: nextQ,
      userAnswer: existingAnswer ? existingAnswer.userAnswer : '',
      answered: !!existingAnswer,
      showExplanation: !!existingAnswer
    });
  },

  // 上一题
  goPrev() {
    const { currentIdx, questions } = this.data;
    if (currentIdx <= 0) return;
    const prevIdx = currentIdx - 1;
    const prevQ = questions[prevIdx];
    const existingAnswer = this.data.answers[prevQ.id];
    this.setData({
      currentIdx: prevIdx,
      currentQuestion: prevQ,
      userAnswer: existingAnswer ? existingAnswer.userAnswer : '',
      answered: !!existingAnswer,
      showExplanation: this.data.mode === 'practice' && !!existingAnswer
    });
  },

  // 完成刷题
  finishQuiz() {
    const { answers, questions, paper, mode, startTime } = this.data;
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] && answers[q.id].correct) correctCount++;
    });

    const accuracy = Math.round((correctCount / questions.length) * 100);

    // 保存记录
    const record = {
      id: generateId(),
      paperId: paper.id,
      paperName: paper.name,
      mode,
      startTime: formatTime(new Date(startTime)),
      endTime: formatTime(new Date(endTime)),
      duration,
      totalQuestions: questions.length,
      correctCount,
      accuracy,
      answers
    };
    storage.saveRecord(record);

    // 更新错题本
    questions.forEach(q => {
      const a = answers[q.id];
      if (a && !a.correct) {
        storage.addWrongQuestion({
          questionId: q.id,
          paperId: paper.id,
          question: q
        });
      }
    });

    // 跳转结果页
    const resultData = JSON.stringify({
      paperName: paper.name,
      mode,
      accuracy,
      correctCount,
      total: questions.length,
      duration,
      recordId: record.id
    });
    wx.redirectTo({
      url: `/pages/result/result?data=${encodeURIComponent(resultData)}`
    });
  },

  // 最后一题的按钮文案
  isLastQuestion() {
    return this.data.currentIdx >= this.data.totalQuestions - 1;
  }
});
```

- [ ] **Step 4: 创建 quiz.json**

```json
{
  "navigationBarTitleText": "刷题",
  "usingComponents": {}
}
```

- [ ] **Step 5: 创建 quiz.wxml**

```html
<view class="container">
  <!-- 模式选择弹窗 -->
  <view class="mode-overlay" wx:if="{{!modeSelected}}">
    <view class="mode-dialog">
      <text class="mode-title">选择刷题模式</text>
      <view class="mode-option" data-mode="practice" bindtap="selectMode">
        <text class="mode-name">练习模式</text>
        <text class="mode-desc">答完立刻显示对错和解析</text>
      </view>
      <view class="mode-option" data-mode="exam" bindtap="selectMode">
        <text class="mode-name">考试模式</text>
        <text class="mode-desc">全部答完后统一批改</text>
      </view>
    </view>
  </view>

  <!-- 刷题主体 -->
  <block wx:if="{{modeSelected && currentQuestion}}">
    <!-- 顶部信息栏 -->
    <view class="top-bar">
      <text class="question-num">第 {{currentIdx + 1}} / {{totalQuestions}} 题</text>
      <text class="type-tag tag {{currentQuestion.type === 'single' ? 'tag-blue' : currentQuestion.type === 'multi' ? 'tag-purple' : currentQuestion.type === 'judge' ? 'tag-orange' : currentQuestion.type === 'fill' ? 'tag-green' : 'tag-gray'}}">
        {{currentQuestion.type === 'single' ? '单选' : currentQuestion.type === 'multi' ? '多选' : currentQuestion.type === 'judge' ? '判断' : currentQuestion.type === 'fill' ? '填空' : '简答'}}
      </text>
    </view>

    <!-- 题干 -->
    <view class="stem-area">
      <text class="stem-text">{{currentQuestion.stem}}</text>
    </view>

    <!-- 选项区域：单选 -->
    <view class="options-area" wx:if="{{currentQuestion.type === 'single'}}">
      <view
        class="option-item {{userAnswer === item ? 'option-selected' : ''}} {{answered && mode === 'practice' ? (item === currentQuestion.answer ? 'option-correct' : (userAnswer === item && item !== currentQuestion.answer ? 'option-wrong' : '')) : ''}}"
        wx:for="{{currentQuestion.options}}"
        wx:key="*this"
        data-option="{{item}}"
        bindtap="onSelectOption"
      >
        <text class="option-radio {{userAnswer === item ? 'radio-selected' : ''}}"></text>
        <text class="option-text">{{item}}</text>
      </view>
    </view>

    <!-- 选项区域：多选 -->
    <view class="options-area" wx:if="{{currentQuestion.type === 'multi'}}">
      <view
        class="option-item {{userAnswer && userAnswer.includes(item.charAt(0)) ? 'option-selected' : ''}}"
        wx:for="{{currentQuestion.options}}"
        wx:key="*this"
        data-option="{{item.charAt(0)}}"
        bindtap="onToggleMulti"
      >
        <text class="option-checkbox {{userAnswer && userAnswer.includes(item.charAt(0)) ? 'checkbox-selected' : ''}}"></text>
        <text class="option-text">{{item}}</text>
      </view>
    </view>

    <!-- 判断题 -->
    <view class="judge-area" wx:if="{{currentQuestion.type === 'judge'}}">
      <view class="judge-btn {{userAnswer === 'A' ? 'judge-selected' : ''}}" data-value="A" bindtap="onJudge">
        <text>对</text>
      </view>
      <view class="judge-btn {{userAnswer === 'B' ? 'judge-selected' : ''}}" data-value="B" bindtap="onJudge">
        <text>错</text>
      </view>
    </view>

    <!-- 填空题 -->
    <view class="fill-area" wx:if="{{currentQuestion.type === 'fill'}}">
      <input
        class="fill-input"
        placeholder="请输入答案"
        value="{{userAnswer}}"
        bindinput="onTextInput"
        disabled="{{answered && mode === 'practice'}}"
      />
    </view>

    <!-- 简答题 -->
    <view class="essay-area" wx:if="{{currentQuestion.type === 'essay'}}">
      <textarea
        class="essay-input"
        placeholder="请输入你的答案"
        value="{{userAnswer}}"
        bindinput="onTextInput"
        disabled="{{answered && mode === 'practice'}}"
        auto-height
      />
    </view>

    <!-- 解析区域（练习模式） -->
    <view class="explanation-area" wx:if="{{showExplanation && currentQuestion.explanation}}">
      <text class="explanation-label">解析</text>
      <text class="explanation-text">{{currentQuestion.explanation}}</text>
    </view>

    <!-- 正确答案提示（练习模式填空/简答） -->
    <view class="correct-answer-hint" wx:if="{{answered && mode === 'practice' && (currentQuestion.type === 'fill' || currentQuestion.type === 'essay')}}">
      <text class="hint-label">参考答案：</text>
      <text class="hint-value">{{currentQuestion.answer}}</text>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="btn-nav" disabled="{{currentIdx === 0}}" bindtap="goPrev">上一题</button>
      <button
        class="btn-submit {{answered && mode === 'practice' ? 'btn-disabled' : ''}}"
        disabled="{{answered && mode === 'practice'}}"
        bindtap="onSubmit"
      >
        {{answered && mode === 'practice' ? '已提交' : '提交'}}
      </button>
      <button
        class="btn-nav"
        wx:if="{{currentIdx < totalQuestions - 1}}"
        disabled="{{mode === 'practice' && !answered}}"
        bindtap="goNext"
      >
        下一题
      </button>
      <button
        class="btn-finish"
        wx:if="{{currentIdx >= totalQuestions - 1}}"
        bindtap="finishQuiz"
      >
        {{mode === 'exam' ? '交卷并查看结果' : '查看结果'}}
      </button>
    </view>
  </block>
</view>
```

- [ ] **Step 6: 创建 quiz.wxss**

```css
/* 模式选择弹窗 */
.mode-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.mode-dialog {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  width: 80%;
}

.mode-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
}

.mode-option {
  padding: 28rpx;
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.mode-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.mode-desc {
  font-size: 24rpx;
  color: #999;
}

/* 顶部信息 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 0 10rpx;
}

.question-num {
  font-size: 28rpx;
  color: #666;
}

.type-tag {
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 8rpx;
}

.tag-blue { background: #e6f7ff; color: #1890ff; }
.tag-purple { background: #f9f0ff; color: #722ed1; }
.tag-orange { background: #fff7e6; color: #fa8c16; }
.tag-green { background: #e6f9ef; color: #07c160; }
.tag-gray { background: #f5f5f5; color: #999; }

/* 题干 */
.stem-area {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
}

.stem-text {
  font-size: 32rpx;
  line-height: 1.6;
  color: #333;
}

/* 选项 */
.options-area {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.option-item {
  background: #fff;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.option-selected {
  border-color: #07c160;
  background: #e6f9ef;
}

.option-correct {
  border-color: #07c160;
  background: #e6f9ef;
}

.option-wrong {
  border-color: #e64340;
  background: #fef0f0;
}

.option-radio {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ccc;
  border-radius: 50%;
  flex-shrink: 0;
}

.radio-selected {
  border-color: #07c160;
  background: #07c160;
}

.option-checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ccc;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.checkbox-selected {
  border-color: #07c160;
  background: #07c160;
}

.option-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

/* 判断题 */
.judge-area {
  display: flex;
  gap: 24rpx;
  margin-bottom: 30rpx;
}

.judge-btn {
  flex: 1;
  background: #fff;
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
}

.judge-selected {
  border-color: #07c160;
  background: #e6f9ef;
  color: #07c160;
}

/* 填空题 */
.fill-area {
  margin-bottom: 30rpx;
}

.fill-input {
  background: #fff;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

/* 简答题 */
.essay-area {
  margin-bottom: 30rpx;
}

.essay-input {
  background: #fff;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  width: 100%;
  min-height: 200rpx;
  box-sizing: border-box;
}

/* 解析区域 */
.explanation-area {
  background: #fffbe6;
  border: 2rpx solid #ffe58f;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.explanation-label {
  display: block;
  font-size: 24rpx;
  color: #fa8c16;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.explanation-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 正确答案提示 */
.correct-answer-hint {
  background: #f0fff0;
  border: 2rpx solid #b7eb8f;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 30rpx;
  display: flex;
  gap: 12rpx;
}

.hint-label {
  font-size: 26rpx;
  color: #666;
  flex-shrink: 0;
}

.hint-value {
  font-size: 26rpx;
  color: #07c160;
  font-weight: bold;
}

/* 底部按钮栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 16rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-nav {
  flex: 1;
  background: #fff;
  color: #333;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx 0;
  font-size: 28rpx;
}

.btn-nav[disabled] {
  opacity: 0.4;
}

.btn-submit {
  flex: 1;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 0;
  font-size: 28rpx;
}

.btn-submit::after {
  border: none;
}

.btn-disabled {
  background: #ccc;
}

.btn-finish {
  flex: 1;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 0;
  font-size: 28rpx;
}

.btn-finish::after {
  border: none;
}
```

- [ ] **Step 7: 在开发者工具中验证**

从题目列表进入刷题 → 选择模式 → 做题 → 提交 → 查看解析/下一题 → 最后一题交卷 → 跳转结果页

- [ ] **Step 8: 提交**

```bash
git add pages/quiz/ tests/pages/quiz-engine.test.js
git commit -m "feat: add quiz engine with practice/exam modes"
```

---

## Task 9：结果页 (pages/result)

**Files:**
- Create: `pages/result/result.js`
- Create: `pages/result/result.json`
- Create: `pages/result/result.wxml`
- Create: `pages/result/result.wxss`

- [ ] **Step 1: 创建 result.js**

```javascript
Page({
  data: {
    paperName: '',
    mode: '',
    accuracy: 0,
    correctCount: 0,
    total: 0,
    duration: 0,
    recordId: '',
    durationText: ''
  },

  onLoad(options) {
    const resultData = JSON.parse(decodeURIComponent(options.data));
    const minutes = Math.floor(resultData.duration / 60);
    const seconds = resultData.duration % 60;
    this.setData({
      ...resultData,
      durationText: minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`
    });
  },

  onReviewWrong() {
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?recordId=${this.data.recordId}`
    });
  },

  onRetry() {
    wx.navigateBack({ delta: 2 });
  },

  onGoHome() {
    wx.navigateBack({ delta: 3 });
  }
});
```

- [ ] **Step 2: 创建 result.json**

```json
{
  "navigationBarTitleText": "答题结果",
  "usingComponents": {}
}
```

- [ ] **Step 3: 创建 result.wxml**

```html
<view class="container">
  <view class="result-card">
    <view class="score-ring">
      <text class="score-num">{{accuracy}}</text>
      <text class="score-unit">%</text>
    </view>
    <text class="score-label">正确率</text>

    <view class="stats-grid">
      <view class="stat-item">
        <text class="stat-value">{{correctCount}}/{{total}}</text>
        <text class="stat-label">答对题数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{durationText}}</text>
        <text class="stat-label">用时</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{mode === 'practice' ? '练习' : '考试'}}</text>
        <text class="stat-label">模式</text>
      </view>
    </view>
  </view>

  <view class="actions">
    <button class="btn-secondary" bindtap="onReviewWrong">查看错题</button>
    <button class="btn-primary" bindtap="onGoHome">返回首页</button>
  </view>
</view>
```

- [ ] **Step 4: 创建 result.wxss**

```css
.result-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  margin-bottom: 40rpx;
}

.score-ring {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 16rpx;
}

.score-num {
  font-size: 96rpx;
  font-weight: bold;
  color: #07c160;
}

.score-unit {
  font-size: 40rpx;
  color: #07c160;
  margin-left: 4rpx;
}

.score-label {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 48rpx;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 32rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.actions button {
  width: 100%;
}
```

- [ ] **Step 5: 验证结果页**

刷完一套题后自动跳转到结果页，显示正确率、答对题数、用时。点击"查看错题"跳转记录详情，点击"返回首页"回到首页。

- [ ] **Step 6: 提交**

```bash
git add pages/result/
git commit -m "feat: add result page with score display"
```

---

## Task 10：答题记录页 (pages/records + pages/record-detail)

**Files:**
- Create: `pages/records/records.js`
- Create: `pages/records/records.json`
- Create: `pages/records/records.wxml`
- Create: `pages/records/records.wxss`
- Create: `pages/record-detail/record-detail.js`
- Create: `pages/record-detail/record-detail.json`
- Create: `pages/record-detail/record-detail.wxml`
- Create: `pages/record-detail/record-detail.wxss`

- [ ] **Step 1: 创建 records.js**

```javascript
const storage = require('../../utils/storage');

Page({
  data: {
    records: []
  },

  onShow() {
    const records = storage.getRecords().sort((a, b) => {
      return new Date(b.endTime) - new Date(a.endTime);
    });
    this.setData({ records });
  },

  onTapRecord(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?recordId=${id}`
    });
  }
});
```

- [ ] **Step 2: 创建 records.json**

```json
{
  "navigationBarTitleText": "答题记录",
  "usingComponents": {}
}
```

- [ ] **Step 3: 创建 records.wxml**

```html
<view class="container">
  <view class="record-list" wx:if="{{records.length > 0}}">
    <view
      class="record-item"
      wx:for="{{records}}"
      wx:key="id"
      data-id="{{item.id}}"
      bindtap="onTapRecord"
    >
      <view class="record-header">
        <text class="record-name">{{item.paperName}}</text>
        <text class="mode-tag {{item.mode === 'practice' ? 'tag-green' : 'tag-blue'}}">
          {{item.mode === 'practice' ? '练习' : '考试'}}
        </text>
      </view>
      <view class="record-stats">
        <text class="record-accuracy {{item.accuracy >= 60 ? 'text-green' : 'text-red'}}">{{item.accuracy}}%</text>
        <text class="record-detail">{{item.correctCount}}/{{item.totalQuestions}} 题</text>
        <text class="record-time">{{item.endTime}}</text>
      </view>
    </view>
  </view>

  <view class="empty" wx:else>
    <text class="empty-icon">📋</text>
    <text class="empty-text">暂无答题记录</text>
  </view>
</view>
```

- [ ] **Step 4: 创建 records.wxss**

```css
.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.record-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.mode-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}

.tag-green { background: #e6f9ef; color: #07c160; }
.tag-blue { background: #e6f7ff; color: #1890ff; }

.record-stats {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.record-accuracy {
  font-size: 36rpx;
  font-weight: bold;
}

.text-green { color: #07c160; }
.text-red { color: #e64340; }

.record-detail, .record-time {
  font-size: 24rpx;
  color: #999;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
```

- [ ] **Step 5: 创建 record-detail.js**

```javascript
const storage = require('../../utils/storage');

Page({
  data: {
    record: null,
    paper: null,
    questions: [],
    currentIdx: 0,
    currentQuestion: null,
    currentAnswer: null
  },

  onLoad(options) {
    const records = storage.getRecords();
    const record = records.find(r => r.id === options.recordId);
    if (!record) {
      wx.showToast({ title: '记录不存在', icon: 'none' });
      return;
    }
    const paper = storage.getPaperById(record.paperId);
    const questions = paper ? paper.questions : [];
    this.setData({
      record,
      paper,
      questions,
      currentQuestion: questions[0],
      currentAnswer: record.answers[questions[0]?.id]
    });
  },

  goNext() {
    const { currentIdx, questions, record } = this.data;
    if (currentIdx >= questions.length - 1) return;
    const nextIdx = currentIdx + 1;
    const q = questions[nextIdx];
    this.setData({
      currentIdx: nextIdx,
      currentQuestion: q,
      currentAnswer: record.answers[q.id]
    });
  },

  goPrev() {
    const { currentIdx, questions, record } = this.data;
    if (currentIdx <= 0) return;
    const prevIdx = currentIdx - 1;
    const q = questions[prevIdx];
    this.setData({
      currentIdx: prevIdx,
      currentQuestion: q,
      currentAnswer: record.answers[q.id]
    });
  }
});
```

- [ ] **Step 6: 创建 record-detail.json**

```json
{
  "navigationBarTitleText": "答题回顾",
  "usingComponents": {}
}
```

- [ ] **Step 7: 创建 record-detail.wxml**

```html
<view class="container" wx:if="{{currentQuestion}}">
  <view class="top-bar">
    <text class="question-num">第 {{currentIdx + 1}} / {{questions.length}} 题</text>
    <text class="result-tag {{currentAnswer.correct ? 'tag-correct' : 'tag-wrong'}}">
      {{currentAnswer.correct ? '正确' : '错误'}}
    </text>
  </view>

  <view class="stem-area">
    <text class="stem-text">{{currentQuestion.stem}}</text>
  </view>

  <!-- 选项展示 -->
  <view class="options-area" wx:if="{{currentQuestion.type === 'single' || currentQuestion.type === 'multi'}}">
    <view
      class="option-item {{currentAnswer.userAnswer.includes(item.charAt(0)) ? (currentQuestion.answer.includes(item.charAt(0)) ? 'option-correct' : 'option-wrong') : (currentQuestion.answer.includes(item.charAt(0)) ? 'option-correct' : '')}}"
      wx:for="{{currentQuestion.options}}"
      wx:key="*this"
    >
      <text class="option-text">{{item}}</text>
    </view>
  </view>

  <!-- 判断题 -->
  <view class="judge-area" wx:if="{{currentQuestion.type === 'judge'}}">
    <view class="judge-item {{currentAnswer.userAnswer === 'A' ? (currentAnswer.correct ? 'option-correct' : 'option-wrong') : (currentQuestion.answer === 'A' ? 'option-correct' : '')}}">
      <text>对</text>
    </view>
    <view class="judge-item {{currentAnswer.userAnswer === 'B' ? (currentAnswer.correct ? 'option-correct' : 'option-wrong') : (currentQuestion.answer === 'B' ? 'option-correct' : '')}}">
      <text>错</text>
    </view>
  </view>

  <!-- 填空/简答 -->
  <view class="answer-compare" wx:if="{{currentQuestion.type === 'fill' || currentQuestion.type === 'essay'}}">
    <view class="compare-row">
      <text class="compare-label">你的答案：</text>
      <text class="compare-value {{currentAnswer.correct ? 'text-green' : 'text-red'}}">{{currentAnswer.userAnswer}}</text>
    </view>
    <view class="compare-row">
      <text class="compare-label">正确答案：</text>
      <text class="compare-value text-green">{{currentQuestion.answer}}</text>
    </view>
  </view>

  <!-- 解析 -->
  <view class="explanation-area" wx:if="{{currentQuestion.explanation}}">
    <text class="explanation-label">解析</text>
    <text class="explanation-text">{{currentQuestion.explanation}}</text>
  </view>

  <view class="bottom-bar">
    <button class="btn-nav" disabled="{{currentIdx === 0}}" bindtap="goPrev">上一题</button>
    <button class="btn-nav" disabled="{{currentIdx >= questions.length - 1}}" bindtap="goNext">下一题</button>
  </view>
</view>
```

- [ ] **Step 8: 创建 record-detail.wxss**

```css
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.question-num {
  font-size: 28rpx;
  color: #666;
}

.result-tag {
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 8rpx;
}

.tag-correct { background: #e6f9ef; color: #07c160; }
.tag-wrong { background: #fef0f0; color: #e64340; }

.stem-area {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
}

.stem-text {
  font-size: 32rpx;
  line-height: 1.6;
}

.options-area {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.option-item {
  background: #fff;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 24rpx;
}

.option-correct {
  border-color: #07c160;
  background: #e6f9ef;
}

.option-wrong {
  border-color: #e64340;
  background: #fef0f0;
}

.option-text {
  font-size: 28rpx;
}

.judge-area {
  display: flex;
  gap: 24rpx;
  margin-bottom: 30rpx;
}

.judge-item {
  flex: 1;
  background: #fff;
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  font-size: 32rpx;
}

.answer-compare {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.compare-row {
  display: flex;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.compare-row:last-child {
  border-bottom: none;
}

.compare-label {
  font-size: 26rpx;
  color: #666;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.compare-value {
  font-size: 26rpx;
}

.text-green { color: #07c160; }
.text-red { color: #e64340; }

.explanation-area {
  background: #fffbe6;
  border: 2rpx solid #ffe58f;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.explanation-label {
  display: block;
  font-size: 24rpx;
  color: #fa8c16;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.explanation-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-nav {
  flex: 1;
  background: #fff;
  color: #333;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx 0;
  font-size: 28rpx;
}

.btn-nav[disabled] {
  opacity: 0.4;
}
```

- [ ] **Step 9: 验证**

答题记录列表 → 点击某条记录 → 进入逐题回顾 → 上下翻页查看每题对错

- [ ] **Step 10: 提交**

```bash
git add pages/records/ pages/record-detail/
git commit -m "feat: add answer records and record detail pages"
```

---

## Task 11：错题本 (pages/wrong-questions)

**Files:**
- Create: `pages/wrong-questions/wrong-questions.js`
- Create: `pages/wrong-questions/wrong-questions.json`
- Create: `pages/wrong-questions/wrong-questions.wxml`
- Create: `pages/wrong-questions/wrong-questions.wxss`

- [ ] **Step 1: 创建 wrong-questions.js**

```javascript
const storage = require('../../utils/storage');

Page({
  data: {
    wrongQuestions: [],
    displayList: [],
    sortBy: 'time',       // time | paper
    showMastered: false
  },

  onShow() {
    this.loadWrongQuestions();
  },

  loadWrongQuestions() {
    const all = storage.getWrongQuestions();
    const wrongQuestions = this.data.showMastered ? all : all.filter(q => !q.mastered);
    this.setData({ wrongQuestions });
    this.updateDisplayList();
  },

  updateDisplayList() {
    const { wrongQuestions, sortBy } = this.data;
    let displayList = [...wrongQuestions];

    if (sortBy === 'time') {
      displayList.sort((a, b) => new Date(b.lastWrongTime) - new Date(a.lastWrongTime));
    } else {
      displayList.sort((a, b) => a.paperId.localeCompare(b.paperId));
    }

    this.setData({ displayList });
  },

  switchSort(e) {
    this.setData({ sortBy: e.currentTarget.dataset.sort });
    this.updateDisplayList();
  },

  toggleShowMastered() {
    this.setData({ showMastered: !this.data.showMastered });
    this.loadWrongQuestions();
  },

  onMarkMastered(e) {
    const { id } = e.currentTarget.dataset;
    storage.markMastered(id);
    this.loadWrongQuestions();
    wx.showToast({ title: '已标记掌握' });
  },

  onRedoWrong() {
    const unmastered = storage.getUnmasteredWrongQuestions();
    if (unmastered.length === 0) {
      wx.showToast({ title: '没有未掌握的错题', icon: 'none' });
      return;
    }
    // Create a temporary paper from wrong questions
    const questions = unmastered.map(w => w.question);
    const paperData = JSON.stringify({
      name: '错题重做',
      questions
    });
    wx.navigateTo({
      url: `/pages/import-preview/import-preview?data=${encodeURIComponent(paperData)}`
    });
  }
});
```

- [ ] **Step 2: 创建 wrong-questions.json**

```json
{
  "navigationBarTitleText": "错题本",
  "usingComponents": {}
}
```

- [ ] **Step 3: 创建 wrong-questions.wxml**

```html
<view class="container">
  <view class="toolbar">
    <view class="sort-tabs">
      <text class="sort-tab {{sortBy === 'time' ? 'tab-active' : ''}}" data-sort="time" bindtap="switchSort">按时间</text>
      <text class="sort-tab {{sortBy === 'paper' ? 'tab-active' : ''}}" data-sort="paper" bindtap="switchSort">按试卷</text>
    </view>
    <view class="toolbar-actions">
      <text class="toggle-link" bindtap="toggleShowMastered">
        {{showMastered ? '隐藏已掌握' : '显示已掌握'}}
      </text>
    </view>
  </view>

  <view class="wrong-list" wx:if="{{displayList.length > 0}}">
    <view class="wrong-item {{item.mastered ? 'mastered' : ''}}" wx:for="{{displayList}}" wx:key="questionId">
      <view class="wrong-info">
        <text class="wrong-stem">{{item.question.stem}}</text>
        <view class="wrong-meta">
          <text class="wrong-count">错误 {{item.wrongCount}} 次</text>
          <text class="wrong-time">{{item.lastWrongTime}}</text>
        </view>
      </view>
      <view class="wrong-actions" wx:if="{{!item.mastered}}">
        <text class="master-btn" data-id="{{item.questionId}}" catchtap="onMarkMastered">已掌握</text>
      </view>
      <view class="mastered-badge" wx:else>
        <text>已掌握</text>
      </view>
    </view>
  </view>

  <view class="empty" wx:else>
    <text class="empty-icon">🎉</text>
    <text class="empty-text">{{showMastered ? '暂无错题' : '没有未掌握的错题'}}</text>
  </view>

  <view class="redo-btn" wx:if="{{wrongQuestions.length > 0}}" bindtap="onRedoWrong">
    <text class="redo-text">重做错题</text>
  </view>
</view>
```

- [ ] **Step 4: 创建 wrong-questions.wxss**

```css
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.sort-tabs {
  display: flex;
  gap: 8rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  padding: 4rpx;
}

.sort-tab {
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 6rpx;
  color: #666;
}

.tab-active {
  background: #fff;
  color: #07c160;
  font-weight: bold;
}

.toggle-link {
  font-size: 24rpx;
  color: #1890ff;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.wrong-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.mastered {
  opacity: 0.5;
}

.wrong-info {
  flex: 1;
  margin-right: 20rpx;
}

.wrong-stem {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.wrong-meta {
  display: flex;
  gap: 24rpx;
}

.wrong-count {
  font-size: 22rpx;
  color: #e64340;
}

.wrong-time {
  font-size: 22rpx;
  color: #999;
}

.master-btn {
  font-size: 24rpx;
  color: #07c160;
  padding: 8rpx 20rpx;
  border: 1rpx solid #07c160;
  border-radius: 8rpx;
}

.mastered-badge {
  font-size: 22rpx;
  color: #999;
  background: #f0f0f0;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.redo-btn {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  background: #07c160;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
}

.redo-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}
```

- [ ] **Step 5: 验证错题本**

做完一套有错题的卷子 → 进入错题本 → 看到错题列表 → 切换排序方式 → 标记已掌握 → 重做错题

- [ ] **Step 6: 提交**

```bash
git add pages/wrong-questions/
git commit -m "feat: add wrong questions book with redo"
```

---

## Task 12：最终集成验证

- [ ] **Step 1: 运行所有测试**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: 所有测试通过

- [ ] **Step 2: 完整流程测试**

在开发者工具中走一遍完整流程：
1. 首页显示三个功能卡片，"刷题"可点击
2. 进入题目列表，空状态
3. 点击"+"导入一个 .md 文件
4. 预览页显示题目统计
5. 确认导入，返回列表
6. 点击试卷 → 选择练习模式 → 刷题
7. 答题 → 提交 → 看解析 → 下一题 → 交卷
8. 结果页显示正确率
9. 查看答题记录
10. 查看错题本
11. 重做错题

- [ ] **Step 3: 考试模式测试**

重复上述流程，选择考试模式，验证：
- 答题时不显示对错
- 交卷后统一显示结果

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: complete brushfengti v1.0 - markdown quiz import and practice"
```
