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
    icon: '🌐',
    order: 1
  },
  {
    id: 'os',
    name: '操作系统',
    icon: '💻',
    order: 2
  },
  {
    id: 'crypto',
    name: '密码学',
    icon: '🔐',
    order: 3
  },
  {
    id: 'algo',
    name: '算法 & 数据结构',
    icon: '📊',
    order: 4
  },
  {
    id: 'compiler',
    name: '编译原理',
    icon: '⚙️',
    order: 5
  }
];

const TOOLS = [
  // ── 计算机网络 ──
  {
    id: 'subnet-calc',
    category: 'network',
    name: '子网计算器',
    icon: '🌐',
    description: 'IP/CIDR 计算 · 二进制位可视化',
    route: '/pages/subnet-calc/subnet-calc',
    available: true,
    featured: true,
    order: 1
  },
  {
    id: 'tcp-viz',
    category: 'network',
    name: 'TCP 动画机',
    icon: '🔗',
    description: '三次握手 · 四次挥手 · 丢包重传',
    route: '/pages/tcp-viz/tcp-viz',
    available: true,
    featured: true,
    order: 2
  },
  {
    id: 'tls-viz',
    category: 'network',
    name: 'TLS 动画机',
    icon: '🔒',
    description: 'TLS 1.3 握手 · 证书链 · 密钥交换',
    route: '/pages/tls-viz/tls-viz',
    available: false,
    featured: false,
    order: 3
  },
  {
    id: 'dns-viz',
    category: 'network',
    name: 'DNS 解析器',
    icon: '🌍',
    description: '域名解析过程 · 递归/迭代查询',
    route: '/pages/dns-viz/dns-viz',
    available: true,
    featured: false,
    order: 4
  },
  {
    id: 'http-parser',
    category: 'network',
    name: 'HTTP 解析器',
    icon: '📡',
    description: '请求/响应报文 · 状态码 · 头部',
    route: '/pages/http-parser/http-parser',
    available: false,
    featured: false,
    order: 5
  },
  {
    id: 'ip-fragment',
    category: 'network',
    name: 'IP 分片可视化',
    icon: '🧩',
    description: '分片过程 · MTU · 偏移量计算',
    route: '/pages/ip-fragment/ip-fragment',
    available: false,
    featured: false,
    order: 6
  },
  {
    id: 'nat-viz',
    category: 'network',
    name: 'NAT 模拟器',
    icon: '🔀',
    description: '网络地址转换 · 端口映射',
    route: '/pages/nat-viz/nat-viz',
    available: false,
    featured: false,
    order: 7
  },

  // ── 操作系统 ──
  {
    id: 'cpu-sched',
    category: 'os',
    name: '进程调度可视化',
    icon: '⏱️',
    description: 'FCFS/SJF/RR · 甘特图 · 周转时间',
    route: '/pages/cpu-sched/cpu-sched',
    available: false,
    featured: false,
    order: 1
  },
  {
    id: 'mem-paging',
    category: 'os',
    name: '内存分页可视化',
    icon: '💾',
    description: '页表 · 缺页中断 · LRU/FIFO',
    route: '/pages/mem-paging/mem-paging',
    available: false,
    featured: false,
    order: 2
  },
  {
    id: 'deadlock',
    category: 'os',
    name: '死锁模拟器',
    icon: '🔒',
    description: '资源分配图 · 银行家算法',
    route: '/pages/deadlock/deadlock',
    available: false,
    featured: false,
    order: 3
  },
  {
    id: 'disk-sched',
    category: 'os',
    name: '磁盘调度可视化',
    icon: '💿',
    description: 'SCAN/C-SCAN/LOOK · 磁头移动',
    route: '/pages/disk-sched/disk-sched',
    available: false,
    featured: false,
    order: 4
  },
  {
    id: 'sync-viz',
    category: 'os',
    name: '同步互斥演示',
    icon: '🔄',
    description: '生产者消费者 · 信号量 · PV操作',
    route: '/pages/sync-viz/sync-viz',
    available: false,
    featured: false,
    order: 5
  },

  // ── 密码学 ──
  {
    id: 'rsa-calc',
    category: 'crypto',
    name: 'RSA 演算器',
    icon: '🔑',
    description: '密钥生成 · 加密解密 · 数论',
    route: '/pages/rsa-calc/rsa-calc',
    available: false,
    featured: false,
    order: 1
  },
  {
    id: 'aes-viz',
    category: 'crypto',
    name: 'AES 演示',
    icon: '🛡️',
    description: '轮密钥 · 字节替换 · 列混合',
    route: '/pages/aes-viz/aes-viz',
    available: false,
    featured: false,
    order: 2
  },
  {
    id: 'dh-viz',
    category: 'crypto',
    name: 'DH 密钥交换',
    icon: '🤝',
    description: 'Diffie-Hellman · 离散对数',
    route: '/pages/dh-viz/dh-viz',
    available: false,
    featured: false,
    order: 3
  },
  {
    id: 'sha256-viz',
    category: 'crypto',
    name: 'SHA-256 演示',
    icon: '🔢',
    description: '哈希运算 · 压缩函数 · 雪崩效应',
    route: '/pages/sha256-viz/sha256-viz',
    available: false,
    featured: false,
    order: 4
  },
  {
    id: 'crypto-tools',
    category: 'crypto',
    name: '密码工具箱',
    icon: '🧰',
    description: '凯撒/维吉尼亚/栅栏密码',
    route: '/pages/crypto-tools/crypto-tools',
    available: false,
    featured: false,
    order: 5
  },

  // ── 算法 & 数据结构 ──
  {
    id: 'sort-viz',
    category: 'algo',
    name: '排序可视化',
    icon: '📊',
    description: '选择/冒泡/快速排序 · 动画回放',
    route: '/pages/sort-viz/sort-viz',
    available: true,
    featured: true,
    order: 1
  },
  {
    id: 'ds-viz',
    category: 'algo',
    name: '数据结构可视化',
    icon: '🌳',
    description: 'BST/栈队列/哈希表/图搜索',
    route: '/pages/ds-viz/ds-viz',
    available: true,
    featured: true,
    order: 2
  },
  {
    id: 'bplus-viz',
    category: 'algo',
    name: 'B+ 树可视化',
    icon: '🌲',
    description: '阶数 m 可调 · 节点分裂 · 范围查询',
    route: '/pages/bplus-viz/bplus-viz',
    available: true,
    featured: false,
    order: 3
  },

  // ── 编译原理 ──
  {
    id: 'regex-dfa',
    category: 'compiler',
    name: 'Regex→DFA',
    icon: '🔤',
    description: '正则转NFA·DFA·状态图',
    route: '/pages/regex-dfa/regex-dfa',
    available: false,
    featured: false,
    order: 1
  },
  {
    id: 'll1-parser',
    category: 'compiler',
    name: 'LL(1) 分析器',
    icon: '📐',
    description: '预测分析表 · FIRST/FOLLOW集',
    route: '/pages/ll1-parser/ll1-parser',
    available: false,
    featured: false,
    order: 2
  },
  {
    id: 'lexer-viz',
    category: 'compiler',
    name: '词法分析器',
    icon: '✂️',
    description: 'Token化 · 正则匹配 · 符号表',
    route: '/pages/lexer-viz/lexer-viz',
    available: false,
    featured: false,
    order: 3
  },
  {
    id: 'ast-builder',
    category: 'compiler',
    name: 'AST 构建器',
    icon: '🌲',
    description: '语法分析树 · 语法制导翻译',
    route: '/pages/ast-builder/ast-builder',
    available: false,
    featured: false,
    order: 4
  }
];

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

module.exports = {
  TOOL_CATEGORIES,
  TOOLS,
  getAvailableTools,
  getToolsByCategory,
  getActiveCategories,
  getFeaturedToolsByCategory
};
