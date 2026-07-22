const registry = require('../../utils/tool-registry');

Page({
  data: {
    activeCategory: 'all',
    categories: [],
    allSections: [],
    currentTools: [],
    availableTools: [],
    unavailableTools: [],
    pendingToolId: null,
    showIntro: false
  },

  onLoad() {
    const categories = registry.TOOL_CATEGORIES;
    const allSections = this._buildAllSections(categories);
    this.setData({
      categories: categories,
      allSections: allSections
    });
  },

  _buildAllSections(categories) {
    const self = this;
    return categories.map(function(cat) {
      const allTools = registry.getToolsByCategory(cat.id);
      const enrichedTools = allTools.map(function(t) { return self._enrichTool(t); });
      return {
        category: cat,
        tools: enrichedTools
      };
    });
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

  onCategoryTap(e) {
    const self = this;
    const categoryId = e.currentTarget.dataset.id;
    let currentTools = [];
    let availableTools = [];
    let unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter(function(t) { return t.available; }).map(function(t) { return self._enrichTool(t); });
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

  onIntroEnter(e) {
    const toolId = e.detail.toolId;
    const tool = registry.TOOLS.find(function(t) { return t.id === toolId; });
    wx.setStorageSync('intro_v2_' + toolId, true);
    this.setData({ showIntro: false, pendingToolId: null });
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  },

  onIntroClose() {
    this.setData({ showIntro: false, pendingToolId: null });
  }
});
