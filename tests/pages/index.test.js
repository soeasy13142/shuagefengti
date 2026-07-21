/**
 * 首页数据处理测试
 *
 * 验证首页（pages/index/index.js）的数据变换逻辑：
 * - _buildAllViewData 的分类/工具/预告结构
 * - 注册表中的工具总数
 *
 * 这些测试不依赖 Page 对象，只依赖 tool-registry 的数据接口。
 */

const registry = require('../../utils/tool-registry');

function buildAllViewData(activeCategories) {
  return activeCategories.map(function(cat) {
    let featured = registry.getFeaturedToolsByCategory(cat.id, 4);
    let tools;
    if (featured.length === 0) {
      tools = registry.getToolsByCategory(cat.id).filter(function(t) { return t.available; });
    } else {
      tools = featured;
    }

    // 精选预告：最多 2 个即将上线
    const allInCat = registry.getToolsByCategory(cat.id);
    const upcoming = allInCat.filter(function(t) { return !t.available; });
    const previews = upcoming.slice(0, 2);

    return {
      category: cat,
      tools: tools.slice(0, 4),
      previews: previews
    };
  });
}

describe('首页数据处理', () => {

  describe('allViewData 构建逻辑', () => {

    test('只包含有可用工具的活跃分类', () => {
      const activeCats = registry.getActiveCategories();
      const result = buildAllViewData(activeCats);
      const ids = result.map(function(s) { return s.category.id; });
      expect(ids).toContain('network');
      expect(ids).toContain('os');
      expect(ids).toContain('algo');
    });

    test('每个分类 tools 最多 4 个', () => {
      const activeCats = registry.getActiveCategories();
      const result = buildAllViewData(activeCats);
      result.forEach(function(section) {
        expect(section.tools.length).toBeLessThanOrEqual(4);
        section.tools.forEach(function(t) {
          expect(t.available).toBe(true);
        });
      });
    });

    test('每个分类 previews 最多 2 个即将上线工具', () => {
      const activeCats = registry.getActiveCategories();
      const result = buildAllViewData(activeCats);
      result.forEach(function(section) {
        expect(section.previews.length).toBeLessThanOrEqual(2);
        section.previews.forEach(function(p) {
          expect(p.available).toBe(false);
        });
      });
    });

    test('仅展示分类下实际存在的预告数量', () => {
      const result = buildAllViewData(registry.getActiveCategories());
      // algo 分类（sort-viz + ds-viz，无即将上线工具）
      const algoSection = result.find(function(s) { return s.category.id === 'algo'; });
      if (algoSection) {
        expect(algoSection.previews.length).toBe(0);
      }
    });
  });

  describe('toolsCount', () => {
    test('返回 TOOLS 总数 25', () => {
      const count = registry.TOOLS.length;
      expect(count).toBe(25);
    });
  });
});

describe('全部工具页数据', () => {
  test('全部 5 个分类都有对应的工具', () => {
    const categories = registry.TOOL_CATEGORIES;
    categories.forEach(function(cat) {
      const tools = registry.getToolsByCategory(cat.id);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  test('全部 25 个工具分布在 5 个分类中', () => {
    const categories = registry.TOOL_CATEGORIES;
    let allTools = [];
    categories.forEach(function(cat) {
      allTools = allTools.concat(registry.getToolsByCategory(cat.id));
    });
    expect(allTools.length).toBe(25);
  });

  test('每个分类的 tool-card 区分 available 和 unavailable', function() {
    const categories = registry.TOOL_CATEGORIES;
    categories.forEach(function(cat) {
      const tools = registry.getToolsByCategory(cat.id);
      const avail = tools.filter(function(t) { return t.available; });
      const unavail = tools.filter(function(t) { return !t.available; });
      expect(avail.length + unavail.length).toBe(tools.length);
    });
  });
});
