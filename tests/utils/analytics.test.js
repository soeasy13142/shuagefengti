var buildDashboardData = require('../../utils/analytics').buildDashboardData;

describe('buildDashboardData', function () {
  test('没有任何数据时返回完整空状态', function () {
    var result = buildDashboardData([], [], [], new Date('2026-06-09T12:00:00'));

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

  test('根据记录、错题和试卷计算总览与题型正确率', function () {
    var papers = [{
      id: 'p1',
      name: '测试题库',
      questions: [
        { id: 'q1', type: 'single' },
        { id: 'q2', type: 'multi' },
        { id: 'q3', type: 'multi' }
      ]
    }];
    var records = [{
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
    var wrongQuestions = [
      { questionId: 'q2', mastered: false }
    ];

    var result = buildDashboardData(records, wrongQuestions, papers, new Date('2026-06-09T12:00:00'));

    expect(result.overview.totalSessions).toBe(1);
    expect(result.overview.totalQuestions).toBe(3);
    expect(result.overview.totalCorrect).toBe(2);
    expect(result.overview.averageAccuracy).toBe(67);
    expect(result.overview.wrongCount).toBe(1);

    var single = result.typeStats.find(function (s) { return s.type === 'single'; });
    var multi = result.typeStats.find(function (s) { return s.type === 'multi'; });
    expect(single.accuracy).toBe(100);
    expect(multi.total).toBe(2);
    expect(multi.correct).toBe(1);
    expect(multi.accuracy).toBe(50);
    expect(result.weakSpot.type).toBe('multi');
  });

  test('生成最近 7 天趋势数据', function () {
    var records = [
      { endTime: '2026-06-08 10:00:00', totalQuestions: 10, correctCount: 8 },
      { endTime: '2026-06-09 10:00:00', totalQuestions: 5, correctCount: 5 }
    ];

    var result = buildDashboardData(records, [], [], new Date('2026-06-09T12:00:00'));

    expect(result.sevenDayTrend).toHaveLength(7);
    expect(result.sevenDayTrend[5].date).toBe('06-08');
    expect(result.sevenDayTrend[5].count).toBe(1);
    expect(result.sevenDayTrend[5].accuracy).toBe(80);
    expect(result.sevenDayTrend[6].date).toBe('06-09');
    expect(result.sevenDayTrend[6].count).toBe(1);
    expect(result.sevenDayTrend[6].accuracy).toBe(100);
  });

  test('低正确率时生成基础正确率建议', function () {
    var papers = [{
      id: 'p1',
      name: '测试',
      questions: [{ id: 'q1', type: 'single' }]
    }];
    var records = [{
      id: 'r1',
      paperId: 'p1',
      endTime: '2026-06-09 12:00:00',
      totalQuestions: 10,
      correctCount: 4,
      answers: { q1: { userAnswer: 'A', correct: false } }
    }];

    var result = buildDashboardData(records, [], papers, new Date('2026-06-09T12:00:00'));

    expect(result.suggestions.some(function (s) { return s.title === '先稳住基础正确率'; })).toBe(true);
  });

  test('未掌握错题生成错题建议', function () {
    var records = [{
      id: 'r1',
      paperId: 'p1',
      endTime: '2026-06-09 12:00:00',
      totalQuestions: 10,
      correctCount: 9,
      answers: {}
    }];
    var wrongQuestions = [
      { questionId: 'q1', mastered: false },
      { questionId: 'q2', mastered: true }
    ];

    var result = buildDashboardData(records, wrongQuestions, [], new Date('2026-06-09T12:00:00'));

    var wrongSuggestion = result.suggestions.find(function (s) {
      return s.title.indexOf('未掌握错题') >= 0;
    });
    expect(wrongSuggestion).toBeTruthy();
    expect(wrongSuggestion.title).toContain('1');
  });
});
