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
    route: '/package-tools/subnet-calc/subnet-calc',
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
    route: '/package-tools/tcp-viz/tcp-viz',
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
    available: true,
    featured: false,
    tagline: 'TLS 1.3 握手协议 step-by-step 动画，看完就懂',
    taglineDetail: '3 种握手场景切换（初次握手/PSK 恢复/中间人警告），客户端-服务器交互动画，报文 payload 逐字段展示，ECDHE→HKDF 密钥派生全过程',
    tags: ['#可视化', '#交互式', '#计算机网络'],
    difficulty: 'medium',
    intro: {
      valueProp: 'TLS 1.3 握手三步一歇走给你看，证书和密钥交换不再黑盒。',
      features: [
        '3 种握手场景：初次握手、PSK 会话恢复、中间人攻击告警',
        '客户端-服务器双向动画，报文 payload 逐字段展示',
        'ECDHE→HKDF 密钥派生链路可视化（4 组对称密钥 + IV）'
      ],
      prerequisites: '知道 HTTPS 和"握手"的概念就够了。',
      useCases: [
        '计网面试 TLS 章节复习',
        '理解 ECDHE 密钥交换和 HKDF 派生的流程',
        '对比完整握手与 PSK 恢复的性能差异'
      ]
    },
    order: 3
  },
  {
    id: 'dns-viz',
    category: 'network',
    name: 'DNS 解析器',
    icon: '',
    description: '域名解析过程 · 递归/迭代查询',
    route: '/package-tools/dns-viz/dns-viz',
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
    available: true,
    featured: false,
    tagline: '粘贴 HTTP 报文，逐字段拆解请求行/状态行、头部和报文体',
    taglineDetail: '输入或选择预置 HTTP 报文，自动识别请求/响应类型，拆解为请求行（方法/URI/版本）、状态行（状态码/短语）、头部字段（含 inline 说明与面试考点）和报文体，内置 16 个核心状态码速查卡',
    tags: ['#可视化', '#交互式', '#计算机网络'],
    difficulty: 'easy',
    intro: {
      valueProp: '粘贴一段 HTTP 报文，自动拆解为结构化展示，每个字段都有说明。',
      features: [
        '自动识别请求/响应类型，拆解首行、头部和报文体',
        '每个字段附 inline 说明（用途、语义、面试考点）',
        '内置 8 个预置示例，覆盖 GET/POST/200/404/500/重定向',
        '16 个核心状态码速查卡，按分类快速浏览'
      ],
      prerequisites: '知道 HTTP 是"超文本传输协议"就行。',
      useCases: [
        '计网面试复习',
        '学习 HTTP 报文格式',
        '快速查阅状态码含义'
      ]
    },
    order: 5
  },
  {
    id: 'ip-fragment',
    category: 'network',
    name: 'IP 分片可视化',
    icon: '',
    description: '分片过程 · MTU · 偏移量计算',
    route: '/pages/ip-fragment/ip-fragment',
    available: true,
    featured: false,
    tagline: '调整报文大小和 MTU，看 IP 层怎么切分和重组数据报',
    taglineDetail: '双滑块调整报文大小和 MTU，自动计算分片列表（ID/MF/偏移量），可折叠展示偏移量计算过程，从最后一片开始逐步回放重组过程',
    tags: ['#可视化', '#交互式'],
    difficulty: 'medium',
    intro: {
      valueProp: '拖到滑块调参数，看 IP 层怎么把大报文切成小片、接收端又怎么拼回来。',
      features: [
        '双滑块调节报文大小和 MTU，实时显示头部/载荷/分片数',
        '分片列表逐片展示 ID、MF 标志、片偏移、数据范围',
        '偏移量计算过程可折叠展开',
        '自后向前逐步回放重组动画'
      ],
      prerequisites: '了解 IP 协议的基本概念（头部、MTU）。',
      useCases: [
        '计网课程 IP 协议章节',
        '理解片偏移的 8 字节对齐规则',
        '面试前复习分片与重组机制'
      ]
    },
    order: 6
  },
  {
    id: 'nat-viz',
    category: 'network',
    name: 'NAT 模拟器',
    icon: '',
    description: '网络地址转换 · 端口映射',
    route: '/package-tools/nat-viz/nat-viz',
    available: true,
    featured: false,
    tagline: 'SNAT/DNAT 模拟，看报文如何穿越 NAT 路由器',
    taglineDetail: '单台主机外出、多台主机共享公网 IP、端口映射三种场景，报文在 3 个区域间流向动画，NAT 映射表实时更新',
    tags: ['#可视化', '#交互式', '#计算机网络'],
    difficulty: 'medium',
    intro: {
      valueProp: '选择 NAT 场景，观察内网报文怎么经过 NAT 转换到达外网，响应又如何回送。',
      features: [
        '三种预设场景：单主机、多主机共享 IP、端口映射 Web 服务器',
        '报文在 LAN / NAT 路由器 / WAN 三区间流向动画',
        'NAT 映射表实时更新，理解端口复用的原理'
      ],
      prerequisites: '知道 IP 地址和端口是什么，了解"内网"和"外网"的区别。',
      useCases: [
        '计网面试复习',
        '理解 NAPT 如何解决 IPv4 地址短缺',
        '对比 SNAT 和 DNAT（端口映射）的不同工作方式'
      ]
    },
    order: 7
  },
  {
    id: 'nginx-gen',
    category: 'network',
    name: 'Nginx 配置生成器',
    icon: '',
    description: '填表即出 nginx 配置',
    route: '/package-tools/nginx-gen/nginx-gen',
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
    route: '/package-tools/cpu-sched/cpu-sched',
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
    route: '/package-tools/mem-paging/mem-paging',
    available: true,
    featured: false,
    tagline: '逻辑地址到物理地址转换，缺页中断与置换算法动画',
    taglineDetail: '配置页大小/帧数，输入逻辑地址序列，逐步骤动画展示地址分解、页表查询、缺页中断、LRU/FIFO 置换过程，实时计算缺页率',
    tags: ['#可视化', '#交互式', '#操作系统'],
    difficulty: 'medium',
    order: 2
  },
  {
    id: 'deadlock',
    category: 'os',
    name: '死锁模拟器',
    icon: '',
    description: '资源分配图 · 银行家算法',
    route: '/package-tools/deadlock/deadlock',
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
    description: 'SCAN/C-SCAN/LOOK/C-LOOK · 磁头移动路径',
    route: '/package-tools/disk-sched/disk-sched',
    available: true,
    featured: false,
    tagline: '4 种磁盘调度算法，可视化磁头移动',
    taglineDetail: 'SCAN、C-SCAN、LOOK、C-LOOK 四种算法切换，磁头移动动画回放，总寻道长度/平均寻道长度实时计算，多算法一键对比',
    tags: ['#可视化', '#交互式', '#操作系统'],
    difficulty: 'medium',
    order: 4
  },
  {
    id: 'sync-viz',
    category: 'os',
    name: '同步互斥演示',
    icon: '',
    description: '生产者消费者 · 信号量 · PV操作',
    route: '/pages/sync-viz/sync-viz',
    available: true,
    featured: false,
    tagline: '生产者-消费者问题，信号量 P/V 操作可视化',
    taglineDetail: '信号量（full/empty/mutex）数值实时变化，缓冲区 slot 逐格展示生产与消费，完整 P/V 操作序列日志，支持自动播放/步进/速度调节',
    tags: ['#可视化', '#交互式', '#操作系统'],
    difficulty: 'medium',
    intro: {
      valueProp: '通过生产者-消费者问题，可视化信号量 P/V 操作控制进程同步的过程。',
      features: [
        '三个信号量（full / empty / mutex）数值实时变化条',
        '环形缓冲区逐格展示物品的生产与消费',
        '完整 P/V 操作序列日志，阻塞/唤醒高亮标识'
      ],
      prerequisites: '知道进程同步和信号量的基本概念。',
      useCases: [
        'OS 课程信号量与进程同步章节',
        '理解 P/V 操作如何控制临界区访问',
        '区分计数信号量与互斥信号量的作用'
      ]
    },
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
    available: true,
    featured: false,
    tagline: '输入素数 p/q，生成密钥对，加密解密，数论过程一步步展示',
    taglineDetail: '三步走：选素数→生成密钥→加密/解密。欧拉函数、模逆、快速幂的中间过程每一步都展开给你看',
    tags: ['#交互式', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: '输入两个小素数，看 RSA 的密钥生成、加密和解密的完整计算过程。',
      features: [
        '内置素数表（2-997），下拉选择或手动输入',
        '密钥生成展示欧拉函数、扩展欧几里得求模逆的逐行推导',
        '加密/解密展示模幂运算的快速幂二进制分解过程'
      ],
      prerequisites: '知道 RSA 是"非对称加密"就够了。',
      useCases: [
        '密码学课程辅助学习',
        '理解模幂和扩展欧几里得算法的实际应用',
        '面试 RSA 原理前快速实操'
      ]
    },
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
    available: true,
    featured: false,
    tagline: 'Alice 和 Bob 怎么在不安全信道上约定密钥？DH 密钥交换一步一步看',
    taglineDetail: '设定素数和本原根，Alice 和 Bob 自动生成私钥→交换公钥→计算共享密钥；切换 MITM 模式看 Eve 怎么拦截篡改',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: '选一个素数和一个本原根，看 Alice 和 Bob 怎么在不安全信道上约定共享密钥。',
      features: [
        'Alice/Bob 双方面板，私钥可手输可随机，公钥自动计算',
        '公钥交换过程动画展示（含模幂展开）',
        'MITM 攻击模拟：Eve 拦截篡改，密钥不一致警示'
      ],
      prerequisites: '知道"密钥交换"的概念，了解模幂运算基本知识。',
      useCases: [
        '密码学课程密钥交换章节',
        '理解 DH 协议如何防止窃听',
        '演示中间人攻击的工作原理和危害'
      ]
    },
    order: 3
  },
  {
    id: 'sha256-viz',
    category: 'crypto',
    name: 'SHA-256 演示',
    icon: '',
    description: '哈希运算 · 压缩函数 · 雪崩效应',
    route: '/package-tools/sha256-viz/sha256-viz',
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
    available: true,
    featured: false,
    tagline: '凯撒/维吉尼亚/栅栏——三种古典密码加密/解密/暴力破解',
    taglineDetail: '三种密码一键切换。凯撒移位破解所有 25 种可能，维吉尼亚密钥循环逐字母展示，栅栏密码点阵结构可视化，附带字母频率柱状图',
    tags: ['#交互式', '#实用工具'],
    difficulty: 'easy',
    intro: {
      valueProp: '凯撒、维吉尼亚、栅栏——三种古典密码的加密/解密/暴力破解，频率分析一眼看清。',
      features: [
        '三种密码一键切换：凯撒（1-25 移位）、维吉尼亚（密钥循环）、栅栏（2-20 栏）',
        '暴力破解：凯撒展示全部 25 种移位结果，栅栏枚举所有栏数',
        '字母频率柱状图，对比标准英文频率'
      ],
      prerequisites: '知道"加密就是把字母变一下"就够了。',
      useCases: [
        '密码学入门学习',
        '理解古典密码的移位和替换原理',
        '认识字母频率分析在破译中的作用'
      ]
    },
    order: 5
  },

  // ── 算法 & 数据结构 ──
  {
    id: 'sort-viz',
    category: 'algo',
    name: '排序可视化',
    icon: '',
    description: '选择/冒泡/快速排序 · 动画回放',
    route: '/package-tools/sort-viz/sort-viz',
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
    route: '/package-tools/ds-viz/ds-viz',
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
    route: '/package-tools/bplus-viz/bplus-viz',
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
