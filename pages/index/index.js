const registry = require('../../utils/tool-registry');

Page({
  data: {
    // ── 入场动画 ──
    show: false,

    // ── 分类 ──
    activeCategory: 'all',
    activeCategories: [],
    allViewData: [],
    currentTools: [],
    availableTools: [],
    unavailableTools: [],

    // ── 工具总数 ──
    toolsCount: 0
  },

  onShow() {
    this.loadTools();
  },

  onReady() {
    const self = this;
    setTimeout(function() {
      self.setData({ show: true });
    }, 100);
  },

  loadTools() {
    const activeCategories = registry.getActiveCategories();
    const allViewData = this._buildAllViewData(activeCategories);

    this.setData({
      activeCategories: activeCategories,
      allViewData: allViewData,
      currentTools: [],
      toolsCount: registry.TOOLS.length
    });
  },

  _buildAllViewData(activeCategories) {
    return activeCategories.map(function(cat) {
      const featured = registry.getFeaturedToolsByCategory(cat.id, 4);
      let tools;
      if (featured.length === 0) {
        tools = registry.getToolsByCategory(cat.id).filter(function(t) { return t.available; });
      } else {
        tools = featured;
      }

      // 精选预告：从同分类取最多 2 个即将上线工具
      const allInCat = registry.getToolsByCategory(cat.id);
      const upcoming = allInCat.filter(function(t) { return !t.available; });
      const previews = upcoming.slice(0, 2);

      return {
        category: cat,
        tools: tools.slice(0, 4),
        previews: previews
      };
    });
  },

  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    let currentTools = [];
    let availableTools = [];
    let unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter(function(t) { return t.available; });
      unavailableTools = currentTools.filter(function(t) { return !t.available; });
    }

    this.setData({
      activeCategory: categoryId,
      currentTools: currentTools,
      availableTools: availableTools,
      unavailableTools: unavailableTools
    });
  },

  onToolTap(e) {
    const id = e.currentTarget.dataset.id;
    const available = e.currentTarget.dataset.available;

    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }

    const tool = registry.TOOLS.find(function(t) { return t.id === id; });
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  },

  onHeroTap() {
    const self = this;
    setTimeout(function() {
      wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
    }, 350);
  },

  goToRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goToWrongQuestions() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  },

  goToAllTools() {
    wx.navigateTo({ url: '/pages/tools-all/tools-all' });
  }
});
