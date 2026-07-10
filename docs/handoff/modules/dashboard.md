# 学习驾驶舱（Learning Dashboard）

> 派生自 `PROJECT_HANDOFF.md` §7.15。

## 概览

基于本地 `records` / `wrongQuestions` / `papers` 做统计与可视化学习的入口页。深色科技风格，**作为唯一突破暖奶油画布全局规范的功能模块**，决策记录见 `decisions.md`。

## 统计模块（utils/analytics.js）

入口：`buildDashboardData(records, wrongQuestions, papers, now)`，返回：

```js
{
  overview: { totalSessions, totalQuestions, averageAccuracy, totalCorrect, wrongCount, masteredWrongCount, paperCount },
  typeStats: [ { type, label, total, correct, accuracy } x 5 ],
  sevenDayTrend: [ { date, count, accuracy } x 7 ],
  weakSpot: { type, label, accuracy } | null,
  strength: { type, label, accuracy } | null,
  suggestions: [ { level, title, content, actionText, actionType } ]
}
```

## 页面区

```text
顶部总览 → 学习雷达（题型正确率）→ 7 天趋势 → 错题掌握 → 智能建议
```

## 智能建议（本地规则引擎）

不接真实 AI。基于规则的 6 种文案：
1. 无记录 → "先完成一次练习"
2. 平均正确率 < 60 → "先稳住基础正确率"
3. 某题型正确率最低 → "${label} 是当前薄弱点"
4. 未掌握错题 > 0 → "你还有 N 道未掌握错题"
5. 7 天无学习 → "学习节奏中断"
6. 平均正确率 ≥ 85 且无未掌握 → "状态很好，可以挑战考试模式"

每条建议含 `actionType` (`quiz` / `wrongQuestions` / `records`) 触发跳转。

## 测试

- `tests/utils/analytics.test.js`
- 覆盖：空状态 / 有记录统计 / 7 天趋势 / 建议规则
