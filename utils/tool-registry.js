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

const TOOLS = [
  // ── 计算机网络 ──
  {
    id: 'subnet-calc',
    category: 'network',
    name: '子网计算器',
    icon: '',
    description: 'IP/CIDR 计算 · 二进制位可视化',
    route: '/pages/subnet-calc/subnet-calc',
    available: true,
    featured: true,
    tagline: 'IP 和掩码计算，可视化逐位拆解',
    taglineDetail: '输入 IP 和前缀长度，网络号、广播地址、可用主机范围自动算好，二进制十进制逐位对照',
    tags: ['#可视化', '#交互式'],
    difficulty: 'medium',
    intro: {
      valueProp: '子网划分是网络工程师的基本功，也是计网面试的必考题。',
      features: [
        '输入 IP 和前缀长度，实时计算网络号、广播地址、可用主机范围',
        '逐位展示二进制与十进制转换，理解 CIDR 编址原理',
        '完整显示子网掩码、通配符掩码、主机数量等关键信息'
      ],
      prerequisites: '了解 IP 地址和子网掩码的基本概念即可，无需深入二进制计算。',
      useCases: [
        '计网面试：子网划分、CIDR 相关题目练习',
        '网络排障：快速确认 IP 配置是否正确',
        '学习辅助：可视化位运算，理解「与」操作的含义'
      ]
    },
    order: 1
  },
  {
    id: 'tcp-viz',
    category: 'network',
    name: 'TCP 动画机',
    icon: '',
    description: '三次握手 · 四次挥手 · 丢包重传',
    route: '/pages/tcp-viz/tcp-viz',
    available: true,
    featured: true,
    tagline: '三次握手、四次挥手、丢包重传，动效一步一步讲清楚',
    taglineDetail: '从三次握手建立连接到四次挥手释放连接，中间模拟丢包重传，SEQ/ACK 号和状态变化每一步都标清楚',
    tags: ['#可视化', '#交互式', '#面试必考'],
    difficulty: 'medium',
    intro: {
      valueProp: 'TCP 是互联网的基石协议，也是面试中的高频考点。',
      features: [
        '动画演示三次握手与四次挥手的完整交互过程',
        '模拟数据传输与丢包重传机制',
        '直观展示 SEQ/ACK 号变化与状态迁移'
      ],
      prerequisites: '了解 TCP 是"面向连接的可靠传输协议"即可。',
      useCases: [
        '计网面试：TCP 连接管理、可靠传输相关题目',
        '学习辅助：直观理解状态机与序列号机制',
        '教学演示：向他人解释 TCP 工作原理'
      ]
    },
    order: 2
  },
  {
    id: 'tls-viz',
    category: 'network',
    name: 'TLS 动画机',
    icon: '',
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
    icon: '',
    description: '域名解析过程 · 递归/迭代查询',
    route: '/pages/dns-viz/dns-viz',
    available: true,
    featured: false,
    tagline: '输入域名，追踪从根到权威服务器的完整路径',
    taglineDetail: '从根域名服务器到权威服务器逐级查询，缓存命中与 CNAME 链也能模拟追踪',
    tags: ['#可视化', '#交互式'],
    difficulty: 'medium',
    intro: {
      valueProp: 'DNS 是互联网的"电话本"，理解它的工作原理是网络工程师的基本素养。',
      features: [
        '模拟完整递归查询过程：根→顶级域→权威服务器',
        '展示缓存机制如何加速域名解析',
        '支持普通查询、缓存命中、CNAME 链三种场景'
      ],
      prerequisites: '了解域名层级结构（如 .com → example.com）即可。',
      useCases: [
        '计网面试：DNS 递归/迭代查询相关题目',
        '排障辅助：理解 DNS 解析延迟的根源',
        '学习辅助：直观对比递归与迭代查询的差异'
      ]
    },
    order: 4
  },
  {
    id: 'http-parser',
    category: 'network',
    name: 'HTTP 解析器',
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
    description: 'FCFS/SJF/RR · 甘特图 · 周转时间',
    route: '/pages/cpu-sched/cpu-sched',
    available: true,
    featured: false,
    tagline: '4 种调度算法，Gantt 图对比周转时间和等待时间',
    taglineDetail: 'FCFS、SJF、RR、MFQ 四种算法切换，Gantt 图逐步动画回放，平均周转时间、平均等待时间、CPU 利用率、吞吐量四维指标 vs FCFS 对比',
    tags: ['#可视化', '#交互式', '#操作系统'],
    difficulty: 'medium',
    intro: {
      valueProp: 'CPU 调度是操作系统的核心概念，也是面试中避不开的硬骨头。',
      features: [
        '四种调度算法切换：FCFS、SJF（非抢占）、RR（量子可配）、MFQ（三层降级）',
        '甘特图逐单位动画回放，播放速度可调',
        '计算四项指标（avg TAT / avg WT / CPU 利用率 / 吞吐量），实时对比 FCFS 基准'
      ],
      prerequisites: '了解进程的基本概念（pid、到达时间、CPU 突发时间）即可。',
      useCases: [
        'OS 课程：调度算法章节的配套交互工具',
        '面试准备：对比各算法的平均周转时间与等待时间',
        '教学演示：用甘特图直观展示 FCFS 与 SJF/RR/MFQ 的行为差异'
      ]
    },
    order: 1
  },
  {
    id: 'mem-paging',
    category: 'os',
    name: '内存分页可视化',
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
    description: '哈希运算 · 压缩函数 · 雪崩效应',
    route: '/pages/sha256-viz/sha256-viz',
    available: true,
    featured: false,
    tagline: '输入文本，跟踪 SHA-256 每轮压缩函数的运算过程',
    taglineDetail: '输入任意消息，演示 64 轮压缩函数的完整运算——消息填充、轮常数应用、雪崩效应，逐步追踪',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: 'SHA-256 是比特币和 HTTPS 的基石，理解它的压缩函数是理解密码学哈希的关键。',
      features: [
        '展示完整的 64 轮压缩函数运算过程',
        '雪崩效应对比：单 bit 差异如何扩散到整个摘要',
        '逐字节显示消息填充、初始向量、轮常数的变化'
      ],
      prerequisites: '了解哈希函数的基本概念（输入→固定长度摘要），熟悉十六进制表示法。',
      useCases: [
        '密码学课程：哈希函数章节的配套学习工具',
        '面试准备：理解 SHA-256 的内部工作机制',
        '学习辅助：直观感受雪崩效应与压缩函数的迭代过程'
      ]
    },
    order: 4
  },
  {
    id: 'crypto-tools',
    category: 'crypto',
    name: '密码工具箱',
    icon: '',
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
    icon: '',
    description: '选择/冒泡/快速排序 · 动画回放',
    route: '/pages/sort-viz/sort-viz',
    available: true,
    featured: true,
    tagline: '选择、冒泡、快排——动画对比三种排序的执行过程',
    taglineDetail: '选择排序、冒泡排序、快速排序逐步骤动画演示，看清每一步的比较和交换，播放速度可调节',
    tags: ['#可视化', '#交互式'],
    difficulty: 'easy',
    intro: {
      valueProp: '排序算法是数据结构与算法的入门必修课，理解它们的执行过程比背代码更重要。',
      features: [
        '三种排序算法的逐步骤动画演示',
        '可调速播放，看清每一步的比较与交换',
        '直观对比不同算法的时间复杂度与行为差异'
      ],
      prerequisites: '了解基本的数组概念即可，无需算法基础。',
      useCases: [
        '数据结构课程：排序算法章节的辅助学习工具',
        '面试准备：理解算法的时间复杂度与稳定性',
        '教学演示：向初学者解释排序的执行过程'
      ]
    },
    order: 1
  },
  {
    id: 'ds-viz',
    category: 'algo',
    name: '数据结构可视化',
    icon: '',
    description: 'BST/栈队列/哈希表/图搜索',
    route: '/pages/ds-viz/ds-viz',
    available: true,
    featured: true,
    tagline: 'BST 到图搜索，动手试每一步的内部状态变化',
    taglineDetail: 'BST、栈队列、哈希表、图四种结构交互操作，插入删除后实时展示内部状态变化，BFS 与 DFS 可视化对比',
    tags: ['#可视化', '#交互式', '#面试必考'],
    difficulty: 'medium',
    intro: {
      valueProp: '数据结构是程序的骨架，理解它们的内部机制能帮你写出更高效的代码。',
      features: [
        '交互式操作 BST、栈队列、哈希表、图四种数据结构',
        '每一步操作后实时展示内部状态变化',
        '图搜索支持 BFS 与 DFS 的可视化对比'
      ],
      prerequisites: '了解树、栈、队列、哈希表、图的基本概念即可。',
      useCases: [
        '数据结构课程：理论知识的配套实操练习',
        '面试准备：复习各数据结构的核心操作',
        '学习辅助：建立数据结构的空间直觉'
      ]
    },
    order: 2
  },
  {
    id: 'bplus-viz',
    category: 'algo',
    name: 'B+ 树可视化',
    icon: '',
    description: '阶数 m 可调 · 节点分裂 · 范围查询',
    route: '/pages/bplus-viz/bplus-viz',
    available: true,
    featured: false,
    tagline: '调整阶数，看 B+ 树节点怎么分裂和合并',
    taglineDetail: '4~32 阶可调，观察节点分裂与合并的完整过程，支持 Key 查询与范围查询的路径高亮',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: 'B+ 树是关系型数据库索引的核心数据结构，理解它对掌握数据库性能调优至关重要。',
      features: [
        '支持 4~32 阶可调，观察不同阶数下的树形变化',
        '插入操作时展示节点分裂的完整过程',
        '支持单key查询与范围查询的路径高亮'
      ],
      prerequisites: '建议先了解二叉搜索树（BST）的基本概念，熟悉"阶数"的含义。',
      useCases: [
        '数据库课程：索引原理章节的配套学习工具',
        '系统设计面试：加深对 B+ 树的理解',
        '学习辅助：可视化树形结构的平衡机制'
      ]
    },
    order: 3
  },

  // ── 编译原理 ──
  {
    id: 'regex-dfa',
    category: 'compiler',
    name: 'Regex→DFA',
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
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
  getDifficultyInfo
};
