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
      valueProp: '输入 IP 和前缀长度，工具自动算出网络号、广播地址和可用主机范围，二进制位也逐段展示。',
      features: [
        '输入 IP 和前缀长度，实时算出网络号、广播地址、可用主机范围',
        '32 位二进制逐段展示，理解 CIDR 编址和 AND 运算的原理'
      ],
      prerequisites: '知道 IP 和掩码是什么就够了。',
      useCases: [
        '计网面试准备',
        '排障时确认 IP 配置是否正确',
        '学习二进制 AND 运算'
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
      valueProp: 'TCP 连接怎么建立、怎么断开、丢了包怎么重传——动画一步步演给你看。',
      features: [
        '三次握手与四次挥手的完整交互过程',
        '数据传输和丢包重传的模拟',
        'SEQ/ACK 号变化和状态迁移的标注'
      ],
      prerequisites: '大概知道 TCP 是"面向连接"的就行。',
      useCases: [
        '计网面试复习',
        '理解状态机和序列号机制',
        '给别人讲 TCP 工作原理'
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
      valueProp: '输入一个域名，看它从根服务器一路查到权威服务器。',
      features: [
        '模拟完整递归查询：根→顶级域→权威服务器',
        '展示缓存如何加速解析',
        '支持普通查询、缓存命中、CNAME 链三种场景'
      ],
      prerequisites: '知道域名有层级（如 .com → example.com）就行。',
      useCases: [
        '计网面试复习',
        '排查 DNS 解析延迟的根源',
        '对比递归和迭代查询的区别'
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
  {
    id: 'nginx-gen',
    category: 'network',
    name: 'Nginx 配置生成器',
    icon: '',
    description: '填表即出 nginx 配置',
    route: '/pages/nginx-gen/nginx-gen',
    available: true,
    featured: true,
    tagline: '填表即出 nginx 配置，复制就能用',
    taglineDetail: '输入域名、端口、SSL 证书路径等必要信息，自动生成格式化 nginx server block 配置，支持 HTTPS 站点、反向代理、HTTP→HTTPS 跳转等场景，一键复制部署',
    tags: ['#实用工具'],
    difficulty: 'easy',
    intro: {
      valueProp: '配 nginx 不用查文档手写，填表即出。',
      features: [
        '输入域名、端口、证书路径，自动生成完整 server block',
        '支持 HTTPS、HTTP、反向代理、HTTP→HTTPS 跳转四种场景',
        '一键复制配置，粘贴即用'
      ],
      prerequisites: '知道 server block、SSL 配置是什么就够了。',
      useCases: [
        '配置新站点的 nginx 和 SSL',
        '给后端服务生成反向代理配置',
        '学 nginx server block 的常用指令'
      ]
    },
    order: 8
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
      valueProp: '四种调度算法来回切，Gantt 图逐单位回放，指标实时对比 FCFS 基准。',
      features: [
        '四种调度算法：FCFS、SJF、RR（量子可配）、MFQ（三层降级）',
        '甘特图逐单位动画回放，速度可调',
        '计算 avg TAT、avg WT、CPU 利用率、吞吐量，对比 FCFS 基准'
      ],
      prerequisites: '知道 pid、到达时间、CPU 突发时间就够了。',
      useCases: [
        'OS 课程调度算法章节',
        '面试前对比各算法的周转和等待时间',
        '用甘特图直观展示算法差异'
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
    available: true,
    featured: false,
    tagline: '构建资源分配图，检测死锁；输入矩阵，运行银行家算法',
    taglineDetail: '添加进程和资源节点，拖拽建立分配边和请求边，一键检测死锁；切换到银行家算法模式，输入 Max/Allocation/Available 矩阵，自动计算 Need 并检查安全状态',
    tags: ['#可视化', '#交互式', '#操作系统'],
    difficulty: 'medium',
    intro: {
      valueProp: '画资源分配图、跑银行家算法，死锁检测和安全判断一次看懂。',
      features: [
        '可视化资源分配图（RAG），自由编辑节点与边',
        '一键检测死锁，高亮死锁进程与环路',
        '银行家算法：矩阵输入 → Need 自动计算 → 安全状态判断'
      ],
      prerequisites: '知道进程和资源是什么就行。',
      useCases: [
        'OS 课程死锁章节',
        '理解死锁检测和银行家算法的工作流程',
        '用 RAG 图展示循环等待条件'
      ]
    },
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
      valueProp: '输入一段文本，跟踪 SHA-256 全部 64 轮压缩函数的运算过程。',
      features: [
        '展示 64 轮压缩函数运算的全过程',
        '雪崩效应对比：改 1 bit 如何扩散到整个摘要',
        '逐字节显示消息填充、初始向量和轮常数的变化'
      ],
      prerequisites: '了解哈希函数（输入→固定长度摘要），能读十六进制。',
      useCases: [
        '密码学课程辅助学习',
        '理解 SHA-256 的内部工作机制',
        '感受雪崩效应和迭代压缩的过程'
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
      valueProp: '选择、冒泡、快排——三种排序逐步骤动画演示，看清每一步的比较和交换。',
      features: [
        '三种排序逐步骤动画演示',
        '可调速播放，看清比较和交换的过程',
        '直观对比不同算法的时间复杂度和行为差异'
      ],
      prerequisites: '知道数组是什么就够了。',
      useCases: [
        '数据结构课程辅助学习',
        '理解时间复杂度和算法稳定性',
        '给初学者演示排序过程'
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
      valueProp: 'BST、栈、队列、哈希表、图——交互操作，实时展示内部状态变化。',
      features: [
        '交互操作 BST、栈、队列、哈希表、图四种结构',
        '每一步操作后实时展示内部状态变化',
        '图搜索支持 BFS 和 DFS 的可视化对比'
      ],
      prerequisites: '大概知道树、栈、队列、哈希表、图是什么即可。',
      useCases: [
        '数据结构课程实操练习',
        '复习各数据结构的核心操作',
        '建立数据结构的空间直觉'
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
      valueProp: '阶数可调，看 B+ 树节点怎么分裂和合并，支持范围查询路径高亮。',
      features: [
        '4~32 阶可调，观察不同阶数下的树形变化',
        '插入时展示节点分裂的完整过程',
        '单 key 查询和范围查询的路径高亮'
      ],
      prerequisites: '建议先了解二叉搜索树（BST）是什么，知道「阶数」的含义。',
      useCases: [
        '数据库索引原理学习',
        '系统设计面试准备',
        '可视化树形结构的平衡机制'
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
