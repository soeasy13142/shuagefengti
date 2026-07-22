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

    // ── 精选工具 ──
    featuredTools: [],

    // ── 工具总数 ──
    toolsCount: 0,

    // ── 介绍模态弹窗 ──
    showIntro: false,
    pendingToolId: null
  },

  onShow() {
    this.loadTools();
    this.loadCardMode();
  },

  onReady() {
    setTimeout(() => {
      this.setData({ show: true });
    }, 100);
  },

  loadTools() {
    const activeCategories = registry.getActiveCategories();
    const allViewData = this._buildAllViewData(activeCategories);

    // 获取首页精选工具
    const rawFeatured = registry.getHomepageFeaturedTools();
    const featuredTools = rawFeatured.map(function(t) {
      return this._enrichTool(t);
    }.bind(this));

    // 为精选工具补充分类名
    const catNameMap = registry.getCategoryNameMap();
    const enrichedFeatured = featuredTools.map(function(t) {
      const catName = catNameMap[t.category] || '';
      return Object.assign({}, t, { _catName: catName });
    });

    this.setData({
      activeCategories: activeCategories,
      allViewData: allViewData,
      featuredTools: enrichedFeatured,
      currentTools: [],
      toolsCount: registry.TOOLS.length
    });
  },

  _buildAllViewData(activeCategories) {
    return activeCategories.map((cat) => {
      const featured = registry.getFeaturedToolsByCategory(cat.id, 4);
      let tools;
      if (featured.length === 0) {
        tools = registry.getToolsByCategory(cat.id).filter((t) => { return t.available; });
      } else {
        tools = featured;
      }

      // 精选预告：从同分类取最多 2 个即将上线工具
      const allInCat = registry.getToolsByCategory(cat.id);
      const upcoming = allInCat.filter((t) => { return !t.available; });
      const previews = upcoming.slice(0, 2);

      // 预处理难度显示字段
      const enrichedTools = tools.map((t) => {
        return this._enrichTool(t);
      });

      return {
        id: cat.id,
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
    const categoryId = e.currentTarget.dataset.id;
    let currentTools = [];
    let availableTools = [];
    let unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter((t) => { return t.available; });
      unavailableTools = currentTools.filter((t) => { return !t.available; });
      // 为可用工具补充难度显示字段
      availableTools = availableTools.map((t) => { return this._enrichTool(t); });
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
    setTimeout(() => {
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
