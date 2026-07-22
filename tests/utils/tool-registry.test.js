const {
  TOOL_CATEGORIES,
  TOOLS,
  getAvailableTools,
  getToolsByCategory,
  getActiveCategories,
  getFeaturedToolsByCategory,
  getHomepageFeaturedTools,
  getCategoryNameMap,
  getDifficultyInfo
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
      let ids = TOOLS.map(function(t) { return t.id; });
      let unique = ids.filter(function(v, i, a) { return a.indexOf(v) === i; });
      expect(ids.length).toBe(unique.length);
    });

    test('TOOL_CATEGORIES 按 order 排序无重复', () => {
      let orders = TOOL_CATEGORIES.map(function(c) { return c.order; });
      let unique = orders.filter(function(v, i, a) { return a.indexOf(v) === i; });
      expect(orders.length).toBe(unique.length);
    });
  });

  describe('deadlock', () => {
    test('deadlock tool is now available', () => {
      const deadlock = TOOLS.find(function(t) { return t.id === 'deadlock'; });
      expect(deadlock.available).toBe(true);
    });
  });

  describe('nat-viz', () => {
    test('nat-viz tool is now available', () => {
      const natViz = TOOLS.find(function(t) { return t.id === 'nat-viz'; });
      expect(natViz.available).toBe(true);
    });
  });

  describe('getAvailableTools', () => {
    test('只返回 available: true 的工具', () => {
      let result = getAvailableTools();
      result.forEach(function(tool) {
        expect(tool.available).toBe(true);
      });
    });

    test('返回当前已实现的 25 个工具', () => {
      let result = getAvailableTools();
      expect(result.length).toBe(25);
      let ids = result.map(function(t) { return t.id; });
      expect(ids).toContain('subnet-calc');
      expect(ids).toContain('tcp-viz');
      expect(ids).toContain('tls-viz');
      expect(ids).toContain('dns-viz');
      expect(ids).toContain('http-parser');
      expect(ids).toContain('ip-fragment');
      expect(ids).toContain('nat-viz');
      expect(ids).toContain('nginx-gen');
      expect(ids).toContain('cpu-sched');
      expect(ids).toContain('mem-paging');
      expect(ids).toContain('deadlock');
      expect(ids).toContain('disk-sched');
      expect(ids).toContain('sync-viz');
      expect(ids).toContain('sort-viz');
      expect(ids).toContain('ds-viz');
      expect(ids).toContain('bplus-viz');
      expect(ids).toContain('sha256-viz');
      expect(ids).toContain('crypto-tools');
      expect(ids).toContain('dh-viz');
      expect(ids).toContain('rsa-calc');
      expect(ids).toContain('aes-viz');
      expect(ids).toContain('ll1-parser');
      expect(ids).toContain('ast-builder');
      expect(ids).toContain('lexer-viz');
    });
  });

  describe('getToolsByCategory', () => {
    test('返回指定分类下的所有工具，按 order 排序', () => {
      let result = getToolsByCategory('network');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(function(tool) {
        expect(tool.category).toBe('network');
      });
      for (let i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
      }
    });

    test('返回不存在的分类时返回空数组', () => {
      let result = getToolsByCategory('nonexistent');
      expect(result).toEqual([]);
    });

    test('network 分类包含子网计算器和 TCP 动画机', () => {
      let result = getToolsByCategory('network');
      let ids = result.map(function(t) { return t.id; });
      expect(ids).toContain('subnet-calc');
      expect(ids).toContain('tcp-viz');
    });

    test('algo 分类包含排序可视化和数据结构可视化', () => {
      let result = getToolsByCategory('algo');
      let ids = result.map(function(t) { return t.id; });
      expect(ids).toContain('sort-viz');
      expect(ids).toContain('ds-viz');
    });
  });

  describe('getActiveCategories', () => {
    test('只返回有已实现工具的分类', () => {
      let result = getActiveCategories();
      result.forEach(function(cat) {
        let hasAvailable = TOOLS.some(function(t) {
          return t.category === cat.id && t.available;
        });
        expect(hasAvailable).toBe(true);
      });
    });

    test('当前包含 network、os、crypto、algo、compiler 五个分类', () => {
      let result = getActiveCategories();
      let ids = result.map(function(c) { return c.id; });
      expect(ids).toContain('network');
      expect(ids).toContain('os');
      expect(ids).toContain('crypto');
      expect(ids).toContain('algo');
      expect(ids).toContain('compiler');
    });

    test('不包含没有已实现工具的分类', () => {
      let result = getActiveCategories();
      let ids = result.map(function(c) { return c.id; });
      // all categories have at least one available tool now
      expect(ids.length).toBe(5);
    });

    test('结果按 order 排序', () => {
      let result = getActiveCategories();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
      }
    });
  });

  describe('getFeaturedToolsByCategory', () => {
    test('返回指定分类的 featured + available 工具', () => {
      let result = getFeaturedToolsByCategory('network', 10);
      result.forEach(function(tool) {
        expect(tool.category).toBe('network');
        expect(tool.available).toBe(true);
        expect(tool.featured).toBe(true);
      });
    });

    test('返回数量不超过 maxCount', () => {
      let result = getFeaturedToolsByCategory('network', 1);
      expect(result.length).toBeLessThanOrEqual(1);
    });

    test('maxCount 为 0 时返回空数组', () => {
      let result = getFeaturedToolsByCategory('network', 0);
      expect(result).toEqual([]);
    });

    test('不存在的分类返回空数组', () => {
      let result = getFeaturedToolsByCategory('nonexistent', 10);
      expect(result).toEqual([]);
    });
  });

  describe('getHomepageFeaturedTools', () => {
    test('返回首页精选工具列表，按配置顺序排列', () => {
      const featured = getHomepageFeaturedTools();
      expect(Array.isArray(featured)).toBe(true);
      expect(featured.length).toBeGreaterThan(0);
      // All returned tools should be available
      featured.forEach(function(tool) {
        expect(tool.available).toBe(true);
      });
    });

    test('返回顺序与 HOMEPAGE_FEATURED_IDS 配置一致', () => {
      const featured = getHomepageFeaturedTools();
      // tcp-viz should come first
      expect(featured[0].id).toBe('tcp-viz');
      expect(featured[1].id).toBe('nginx-gen');
    });

    test('所有精选工具都是 available: true', () => {
      const featured = getHomepageFeaturedTools();
      featured.forEach(function(tool) {
        expect(tool.available).toBe(true);
      });
    });
  });

  describe('getCategoryNameMap', () => {
    test('返回分类 id 到 name 的映射', () => {
      const map = getCategoryNameMap();
      expect(map.network).toBe('计算机网络');
      expect(map.os).toBe('操作系统');
      expect(map.crypto).toBe('密码学');
      expect(map.algo).toBe('算法 & 数据结构');
      expect(map.compiler).toBe('编译原理');
    });

    test('映射中不包含不存在的分类', () => {
      const map = getCategoryNameMap();
      expect(map.nonexistent).toBeUndefined();
    });
  });

  describe('getDifficultyInfo', () => {
    test('返回 easy 的正确信息', () => {
      const info = getDifficultyInfo('easy');
      expect(info.label).toBe('简单');
      expect(info.stars).toBe('★☆☆');
    });

    test('返回 advanced 的正确信息', () => {
      const info = getDifficultyInfo('advanced');
      expect(info.label).toBe('进阶');
      expect(info.stars).toBe('★★★');
    });

    test('无效输入回退到 medium 默认值', () => {
      const info = getDifficultyInfo('invalid');
      expect(info.label).toBe('中等');
      expect(info.stars).toBe('★★☆');
    });

    test('undefined 输入回退到 medium 默认值', () => {
      const info = getDifficultyInfo(undefined);
      expect(info.label).toBe('中等');
      expect(info.stars).toBe('★★☆');
    });
  });

  describe('「单词记忆」已移除', () => {
    test('TOOLS 中不包含单词记忆', () => {
      let ids = TOOLS.map(function(t) { return t.id; });
      expect(ids).not.toContain('vocab');
      expect(ids).not.toContain('word-memory');
    });
  });
});
