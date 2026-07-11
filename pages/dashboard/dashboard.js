const storage = require('../../utils/storage');
const analytics = require('../../utils/analytics');

Page({
  data: {
    dashboard: null,
    maxTrendCount: 1,
    hasData: false
  },

  onShow: function () {
    this._loadDashboard();
  },

  _loadDashboard: function () {
    const records = storage.getRecords();
    const wrongQuestions = storage.getWrongQuestions();
    const papers = storage.getPapers();
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
      hasData: dashboard.overview.totalSessions > 0
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
