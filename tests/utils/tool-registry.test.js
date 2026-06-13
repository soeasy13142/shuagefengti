const {
  TOOL_CATEGORIES,
  TOOLS,
  getAvailableTools,
  getToolsByCategory,
  getActiveCategories,
  getFeaturedToolsByCategory
} = require('../../utils/tool-registry');

describe('tool-registry', () => {

  describe('数据完整性', () => {
    test('TOOLS 中所有 category 都在 TOOL_CATEGORIES 中定义', () => {
      const categoryIds = TOOL_CATEGORIES.map(function(c) { return c.id; });
      TOOLS.forEach(function(tool) {
        expect(categoryIds).toContain(tool.category);
      });
    });

    test('TOOLS 中所有 id 唯一', () => {
      var ids = TOOLS.map(function(t) { return t.id; });
      var unique = ids.filter(function(v, i, a) { return a.indexOf(v) === i; });
      expect(ids.length).toBe(unique.length);
    });

    test('TOOL_CATEGORIES 按 order 排序无重复', () => {
      var orders = TOOL_CATEGORIES.map(function(c) { return c.order; });
      var unique = orders.filter(function(v, i, a) { return a.indexOf(v) === i; });
      expect(orders.length).toBe(unique.length);
    });
  });

  describe('getAvailableTools', () => {
    test('只返回 available: true 的工具', () => {
      var result = getAvailableTools();
      result.forEach(function(tool) {
        expect(tool.available).toBe(true);
      });
    });

    test('返回当前已实现的 4 个工具', () => {
      var result = getAvailableTools();
      expect(result.length).toBe(4);
      var ids = result.map(function(t) { return t.id; });
      expect(ids).toContain('subnet-calc');
      expect(ids).toContain('tcp-viz');
      expect(ids).toContain('sort-viz');
      expect(ids).toContain('ds-viz');
    });
  });

  describe('getToolsByCategory', () => {
    test('返回指定分类下的所有工具，按 order 排序', () => {
      var result = getToolsByCategory('network');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(function(tool) {
        expect(tool.category).toBe('network');
      });
      for (var i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
      }
    });

    test('返回不存在的分类时返回空数组', () => {
      var result = getToolsByCategory('nonexistent');
      expect(result).toEqual([]);
    });

    test('network 分类包含子网计算器和 TCP 动画机', () => {
      var result = getToolsByCategory('network');
      var ids = result.map(function(t) { return t.id; });
      expect(ids).toContain('subnet-calc');
      expect(ids).toContain('tcp-viz');
    });

    test('algo 分类包含排序可视化和数据结构可视化', () => {
      var result = getToolsByCategory('algo');
      var ids = result.map(function(t) { return t.id; });
      expect(ids).toContain('sort-viz');
      expect(ids).toContain('ds-viz');
    });
  });

  describe('getActiveCategories', () => {
    test('只返回有已实现工具的分类', () => {
      var result = getActiveCategories();
      result.forEach(function(cat) {
        var hasAvailable = TOOLS.some(function(t) {
          return t.category === cat.id && t.available;
        });
        expect(hasAvailable).toBe(true);
      });
    });

    test('当前包含 network 和 algo 两个分类', () => {
      var result = getActiveCategories();
      var ids = result.map(function(c) { return c.id; });
      expect(ids).toContain('network');
      expect(ids).toContain('algo');
    });

    test('不包含没有已实现工具的分类（如 os、crypto、compiler）', () => {
      var result = getActiveCategories();
      var ids = result.map(function(c) { return c.id; });
      expect(ids).not.toContain('os');
      expect(ids).not.toContain('crypto');
      expect(ids).not.toContain('compiler');
    });

    test('结果按 order 排序', () => {
      var result = getActiveCategories();
      for (var i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
      }
    });
  });

  describe('getFeaturedToolsByCategory', () => {
    test('返回指定分类的 featured + available 工具', () => {
      var result = getFeaturedToolsByCategory('network', 10);
      result.forEach(function(tool) {
        expect(tool.category).toBe('network');
        expect(tool.available).toBe(true);
        expect(tool.featured).toBe(true);
      });
    });

    test('返回数量不超过 maxCount', () => {
      var result = getFeaturedToolsByCategory('network', 1);
      expect(result.length).toBeLessThanOrEqual(1);
    });

    test('maxCount 为 0 时返回空数组', () => {
      var result = getFeaturedToolsByCategory('network', 0);
      expect(result).toEqual([]);
    });

    test('不存在的分类返回空数组', () => {
      var result = getFeaturedToolsByCategory('nonexistent', 10);
      expect(result).toEqual([]);
    });
  });

  describe('「单词记忆」已移除', () => {
    test('TOOLS 中不包含单词记忆', () => {
      var ids = TOOLS.map(function(t) { return t.id; });
      expect(ids).not.toContain('vocab');
      expect(ids).not.toContain('word-memory');
    });
  });
});
