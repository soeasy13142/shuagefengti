const registry = require('../../utils/tool-registry');

Page({
  data: {
    activeCategory: 'all',
    categories: [],
    allSections: [],
    currentTools: [],
    availableTools: [],
    unavailableTools: []
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
    return categories.map(function(cat) {
      const allTools = registry.getToolsByCategory(cat.id);
      return {
        category: cat,
        tools: allTools
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
  }
});
