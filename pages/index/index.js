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
    toolsCount: 0,

    // ── 介绍模态弹窗 ──
    showIntro: false,
    pendingToolId: null
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
    if (!tool || !tool.route) return;

    // 首次访问：展示介绍模态弹窗
    if (tool.intro) {
      const seen = wx.getStorageSync('intro_v2_' + id);
      if (!seen) {
        this.setData({ pendingToolId: id, showIntro: true });
        return;
      }
    }

    wx.navigateTo({ url: tool.route });
  },

  // 点「开始体验」
  onIntroEnter(e) {
    const toolId = e.detail.toolId;
    const tool = registry.TOOLS.find(function(t) { return t.id === toolId; });
    wx.setStorageSync('intro_v2_' + toolId, true);
    this.setData({ showIntro: false, pendingToolId: null });
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  },

  // 关闭模态
  onIntroClose() {
    this.setData({ showIntro: false, pendingToolId: null });
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
