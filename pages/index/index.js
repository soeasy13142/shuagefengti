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

    // ── 卡片模式 ──
    cardMode: 'simple',   // 'simple' | 'detail'

    // ── 工具总数 ──
    toolsCount: 0
  },

  onShow() {
    this.loadTools();
    this.loadCardMode();
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
    const self = this;
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

      // 预处理难度显示字段
      const enrichedTools = tools.map(function(t) {
        return self._enrichTool(t);
      });

      return {
        category: cat,
        tools: enrichedTools.slice(0, 4),
        previews: previews
      };
    });
  },

  loadCardMode() {
    try {
      const mode = wx.getStorageSync('cardDisplayMode');
      if (mode === 'simple' || mode === 'detail') {
        this.setData({ cardMode: mode });
      }
    } catch (e) {
      // 默认 'simple'
    }
  },

  onCategoryTap(e) {
    const self = this;
    const categoryId = e.currentTarget.dataset.id;
    let currentTools = [];
    let availableTools = [];
    let unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter(function(t) { return t.available; });
      unavailableTools = currentTools.filter(function(t) { return !t.available; });
      // 为可用工具补充难度显示字段
      availableTools = availableTools.map(function(t) { return self._enrichTool(t); });
    }

    this.setData({
      activeCategory: categoryId,
      currentTools: currentTools,
      availableTools: availableTools,
      unavailableTools: unavailableTools
    });
  },

  onToggleCardMode(e) {
    const newMode = e.currentTarget.dataset.mode;
    if (newMode === this.data.cardMode) return;
    this.setData({ cardMode: newMode });
    wx.setStorageSync('cardDisplayMode', newMode);
  },

  // 为工具对象补充难度展示字段
  _enrichTool(tool) {
    if (!tool.difficulty) return tool;
    const info = registry.getDifficultyInfo(tool.difficulty);
    return Object.assign({}, tool, {
      _diffStars: info.stars,
      _diffLabel: info.label
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
