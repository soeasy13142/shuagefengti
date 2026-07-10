# 数据模型（Data Structures）

> 派生自 `PROJECT_HANDOFF.md` §8。最新版本以实际代码为准。

## 1. Paper（试卷）

```js
{
  id: 'uuid-like-id',
  name: '试卷名称',
  importTime: '2026-06-08 12:00:00',
  questionCount: 50,
  questions: [Question]
}
```

## 2. Question（题目）

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

> 注意：早期设计文档里 `options` 是字符串数组，但当前实现是对象数组（`{letter, text}`）。后续开发以当前代码为准。

## 3. Record（答题记录）

```js
{
  id: 'record-id',
  paperId: 'paper-id',
  paperName: '试卷名称',
  mode: 'practice' | 'exam',
  startTime: '...',
  endTime: '...',
  duration: 600,
  totalQuestions: 50,
  correctCount: 42,
  accuracy: 84,
  answers: {
    'question-id': { userAnswer: 'A', correct: true }
  }
}
```

## 4. WrongQuestion（错题）

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

## 5. TempImportData（临时导入数据）

```js
{
  name: '试卷名称',
  questions: [Question]
}
```

用于页面间传递导入结果，避开 URL 参数长度限制。读后即清。
