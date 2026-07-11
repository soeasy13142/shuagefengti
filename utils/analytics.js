/**
 * 学习驾驶舱 — 数据分析模块
 * 纯函数，从 records/wrongQuestions/papers 计算统计数据
 */

const TYPE_LABELS = {
  single: '单选',
  multi: '多选',
  judge: '判断',
  fill: '填空',
  essay: '简答'
};

const TYPE_KEYS = ['single', 'multi', 'judge', 'fill', 'essay'];

function _round(num) {
  return Math.round(num || 0);
}

function _formatDay(date) {
  let m = String(date.getMonth() + 1);
  let d = String(date.getDate());
  if (m.length < 2) m = '0' + m;
  if (d.length < 2) d = '0' + d;
  return m + '-' + d;
}

function _buildEmptyTypeStats() {
  return TYPE_KEYS.map(function (type) {
    return { type: type, label: TYPE_LABELS[type], total: 0, correct: 0, accuracy: 0 };
  });
}

function _buildSevenDayTrend(records, now) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime());
    d.setDate(d.getDate() - i);
    days.push({ date: _formatDay(d), count: 0, correct: 0, total: 0, accuracy: 0 });
  }

  records.forEach(function (record) {
    const raw = record.endTime || record.startTime || '';
    const dayKey = raw.length >= 10 ? raw.slice(5, 10) : '';
    let matched = null;
    for (let j = 0; j < days.length; j++) {
      if (days[j].date === dayKey) {
        matched = days[j];
        break;
      }
    }
    if (matched) {
      matched.count += 1;
      matched.correct += record.correctCount || 0;
      matched.total += record.totalQuestions || 0;
    }
  });

  days.forEach(function (day) {
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
      title: weakSpot.label + ' 是当前薄弱点',
      content: '该题型正确率为 ' + weakSpot.accuracy + '%，建议后续增加专项练习。',
      actionText: '查看错题',
      actionType: 'wrongQuestions'
    });
  }

  const unmastered = overview.wrongCount - overview.masteredWrongCount;
  if (unmastered > 0) {
    suggestions.push({
      level: 'info',
      title: '你还有 ' + unmastered + ' 道未掌握错题',
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
  let totalQuestions = 0;
  let totalCorrect = 0;

  for (let i = 0; i < records.length; i++) {
    totalQuestions += records[i].totalQuestions || 0;
    totalCorrect += records[i].correctCount || 0;
  }

  const averageAccuracy = totalQuestions > 0 ? _round((totalCorrect / totalQuestions) * 100) : 0;
  const wrongCount = wrongQuestions.length;
  let masteredWrongCount = 0;
  for (let i = 0; i < wrongQuestions.length; i++) {
    if (wrongQuestions[i].mastered) masteredWrongCount++;
  }

  // 题型统计
  const typeStats = _buildEmptyTypeStats();
  const typeMap = {};
  for (let i = 0; i < typeStats.length; i++) {
    typeMap[typeStats[i].type] = typeStats[i];
  }

  records.forEach(function (record) {
    let paper = null;
    for (let p = 0; p < papers.length; p++) {
      if (papers[p].id === record.paperId) { paper = papers[p]; break; }
    }
    if (!paper || !paper.questions || !record.answers) return;
    paper.questions.forEach(function (q) {
      const stat = typeMap[q.type];
      if (!stat) return;
      const answer = record.answers[q.id];
      if (!answer) return;
      stat.total += 1;
      if (answer.correct) stat.correct += 1;
    });
  });

  for (let i = 0; i < typeStats.length; i++) {
    const s = typeStats[i];
    s.accuracy = s.total > 0 ? _round((s.correct / s.total) * 100) : 0;
  }

  // 最薄弱 / 最强题型
  const activeTypeStats = typeStats.filter(function (s) { return s.total > 0; });
  let weakSpot = null;
  let strength = null;
  if (activeTypeStats.length > 0) {
    const sorted = activeTypeStats.slice().sort(function (a, b) { return a.accuracy - b.accuracy; });
    weakSpot = sorted[0];
    strength = sorted[sorted.length - 1];
  }

  const overview = {
    totalSessions: totalSessions,
    totalQuestions: totalQuestions,
    averageAccuracy: averageAccuracy,
    totalCorrect: totalCorrect,
    wrongCount: wrongCount,
    masteredWrongCount: masteredWrongCount,
    paperCount: papers.length
  };

  return {
    overview: overview,
    typeStats: typeStats,
    sevenDayTrend: _buildSevenDayTrend(records, now),
    weakSpot: weakSpot,
    strength: strength,
    suggestions: _buildSuggestions(overview, typeStats, weakSpot)
  };
}

module.exports = {
  buildDashboardData: buildDashboardData,
  TYPE_LABELS: TYPE_LABELS
};
