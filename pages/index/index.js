var storage = require('../../utils/storage');
var analytics = require('../../utils/analytics');
var registry = require('../../utils/tool-registry');

Page({
  data: {
    // ── 动画 ──
    show: false,
    heroTapped: false,

    // ── Zone 2：学习状态条 ──
    stats: {
      totalQuestions: 0,
      totalSessions: 0,
      averageAccuracy: 0,
      wrongCount: 0,
      hasData: false
    },

    // ── Zone 3：工具箱 ──
    activeCategory: 'all',
    activeCategories: [],
    allViewData: [],
    currentTools: [],
    availableTools: [],
    unavailableTools: []
  },

  onShow() {
    this.setData({ heroTapped: false });
    this.loadStats();
    this.loadTools();
  },

  onReady() {
    var self = this;
    setTimeout(function() {
      self.setData({ show: true });
    }, 100);
  },

  loadStats() {
    var records = storage.getRecords();
    var wrongQuestions = storage.getWrongQuestions();
    var papers = storage.getPapers();
    var dashboard = analytics.buildDashboardData(records, wrongQuestions, papers, new Date());

    this.setData({
      stats: {
        totalQuestions: dashboard.overview.totalQuestions,
        totalSessions: dashboard.overview.totalSessions,
        averageAccuracy: dashboard.overview.averageAccuracy,
        wrongCount: dashboard.overview.wrongCount,
        hasData: dashboard.overview.totalSessions > 0
      }
    });
  },

  loadTools() {
    var activeCategories = registry.getActiveCategories();
    var allViewData = this._buildAllViewData(activeCategories);

    this.setData({
      activeCategories: activeCategories,
      allViewData: allViewData,
      currentTools: []
    });
  },

  _buildAllViewData(activeCategories) {
    return activeCategories.map(function(cat) {
      var tools = registry.getFeaturedToolsByCategory(cat.id, 4);
      if (tools.length === 0) {
        tools = registry.getToolsByCategory(cat.id).filter(function(t) { return t.available; });
      }
      return {
        category: cat,
        tools: tools.slice(0, 4)
      };
    });
  },

  onCategoryTap(e) {
    var categoryId = e.currentTarget.dataset.id;
    var currentTools = [];
    var availableTools = [];
    var unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter(function (t) { return t.available; });
      unavailableTools = currentTools.filter(function (t) { return !t.available; });
    }

    this.setData({
      activeCategory: categoryId,
      currentTools: currentTools,
      availableTools: availableTools,
      unavailableTools: unavailableTools
    });
  },

  onToolTap(e) {
    var id = e.currentTarget.dataset.id;
    var available = e.currentTarget.dataset.available;

    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }

    var tool = registry.TOOLS.find(function(t) { return t.id === id; });
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  },

  onHeroTap() {
    var self = this;
    this.setData({ heroTapped: true });
    setTimeout(function() {
      self.setData({ heroTapped: false });
      wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
    }, 350);
  },

  goDashboard() {
    wx.navigateTo({ url: '/pages/dashboard/dashboard' });
  },

  goToRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goToWrongQuestions() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  }
});
