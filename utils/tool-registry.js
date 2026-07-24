/**
 * 工具注册表
 *
 * 所有工具在此注册。新增工具只需在此文件追加一条记录。
 * 首页、分类页、搜索等全部读取此注册表。
 */

const TOOL_CATEGORIES = [
  {
    id: 'network',
    name: '计算机网络',
    icon: '',
    order: 1
  },
  {
    id: 'os',
    name: '操作系统',
    icon: '',
    order: 2
  },
  {
    id: 'crypto',
    name: '密码学',
    icon: '',
    order: 3
  },
  {
    id: 'algo',
    name: '算法 & 数据结构',
    icon: '',
    order: 4
  },
  {
    id: 'compiler',
    name: '编译原理',
    icon: '',
    order: 5
  }
];

const { TOOLS } = require("./tool-data");

/**
 * 获取所有已实现的工具
 */
function getAvailableTools() {
  return TOOLS.filter(function(t) { return t.available; });
}

/**
 * 获取指定分类下的所有工具（含未实现），按 order 排序
 */
function getToolsByCategory(categoryId) {
  return TOOLS
    .filter(function(t) { return t.category === categoryId; })
    .sort(function(a, b) { return a.order - b.order; });
}

/**
 * 获取所有有已实现工具的分类（用于「全部工具」视图）
 */
function getActiveCategories() {
  return TOOL_CATEGORIES.filter(function(cat) {
    return TOOLS.some(function(t) { return t.category === cat.id && t.available; });
  }).sort(function(a, b) { return a.order - b.order; });
}

/**
 * 获取指定分类的已实现 + featured 工具，最多 maxCount 个
 */
function getFeaturedToolsByCategory(categoryId, maxCount) {
  return TOOLS
    .filter(function(t) { return t.category === categoryId && t.available && t.featured; })
    .sort(function(a, b) { return a.order - b.order; })
    .slice(0, maxCount);
}

// ── 首页精选工具配置 ──
const HOMEPAGE_FEATURED_IDS = [
  'tcp-viz',
  'nginx-gen',
  'cpu-sched',
  'deadlock',
  'dh-viz',
  'ds-viz',
  'ast-builder'
];

/**
 * 获取首页精选工具列表（按配置顺序）
 */
function getHomepageFeaturedTools() {
  const result = [];
  const idMap = {};
  // 构建 ID→tool 的映射
  for (let i = 0; i < TOOLS.length; i++) {
    idMap[TOOLS[i].id] = TOOLS[i];
  }
  // 按配置顺序取
  for (let j = 0; j < HOMEPAGE_FEATURED_IDS.length; j++) {
    const tool = idMap[HOMEPAGE_FEATURED_IDS[j]];
    if (tool && tool.available) {
      result.push(tool);
    }
  }
  return result;
}

/**
 * 获取分类名映射（id → name）
 */
function getCategoryNameMap() {
  const map = {};
  for (let i = 0; i < TOOL_CATEGORIES.length; i++) {
    map[TOOL_CATEGORIES[i].id] = TOOL_CATEGORIES[i].name;
  }
  return map;
}

// ── 难度等级映射 ──
const DIFFICULTY_MAP = {
  easy: { label: '简单', stars: '★☆☆' },
  medium: { label: '中等', stars: '★★☆' },
  advanced: { label: '进阶', stars: '★★★' }
};

/**
 * 获取难度等级的中文标签和星级显示
 * @param {'easy'|'medium'|'advanced'} code
 * @returns {{ label: string, stars: string }}
 */
function getDifficultyInfo(code) {
  return DIFFICULTY_MAP[code] || DIFFICULTY_MAP.medium;
}

module.exports = {
  TOOL_CATEGORIES,
  TOOLS,
  getAvailableTools,
  getToolsByCategory,
  getActiveCategories,
  getFeaturedToolsByCategory,
  getDifficultyInfo,
  getHomepageFeaturedTools,
  getCategoryNameMap
};
