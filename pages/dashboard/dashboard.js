const storage = require('../../utils/storage');
const analytics = require('../../utils/analytics');

Page({
  data: {
    dashboard: null,
    maxTrendCount: 1,
    hasData: false,
    loading: true
  },

  onShow: function () {
    this.setData({ loading: true });
    Promise.all([
      storage.getRecordsAsync(),
      storage.getWrongQuestionsAsync(),
      storage.getPapersAsync()
    ]).then((results) => {
      const records = results[0];
      const wrongQuestions = results[1];
      const papers = results[2];
      const dashboard = analytics.buildDashboardData(records, wrongQuestions, papers, new Date());
      let maxTrendCount = 1;
      for (let i = 0; i < dashboard.sevenDayTrend.length; i++) {
        if (dashboard.sevenDayTrend[i].count > maxTrendCount) {
          maxTrendCount = dashboard.sevenDayTrend[i].count;
        }
      }
      this.setData({
        dashboard: dashboard,
        maxTrendCount: maxTrendCount,
        hasData: dashboard.overview.totalSessions > 0,
        loading: false
      });
    });
  },

  goQuiz: function () {
    wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
  },

  goWrongQuestions: function () {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  },

  goRecords: function () {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  onSuggestionTap: function (e) {
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
