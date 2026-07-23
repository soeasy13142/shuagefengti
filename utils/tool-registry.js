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
    description: 'IP 和掩码一块儿算，二进制也有',
    route: '/package-tools/subnet-calc/subnet-calc',
    available: true,
    featured: true,
    tagline: '输个 IP 和子网，结果一把算完',
    taglineDetail: '填个 IP 和前缀长度，网络号、广播地址、可用主机范围全给你摆出来。想看看二进制怎么对的？一段段对照着看',
    tags: ['#可视化', '#交互式'],
    difficulty: 'medium',
    intro: {
      valueProp: '给个 IP 和子网长度，网络号、广播地址、可用主机范围一把算好，二进制位也摊开给你看。',
      features: [
        '输个 IP 和掩码，网络号、广播地址、主机范围全自动算好',
        '32 位二进制一段段摆出来，CIDR 怎么编址、AND 怎么算的，一眼就明白'
      ],
      prerequisites: '知道 IP 和子网掩码是干嘛的就够了。',
      useCases: [
        '面试前刷一下子网划分',
        '排查 IP 配得合不合理',
        '搞懂二进制 AND 到底怎么算的'
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
    tagline: '三次握手、四次挥手、丢包重传，看动画就能记住',
    taglineDetail: '建连、断连、丢包重传——整个 TCP 过程串起来走一遍。SEQ/ACK 号和状态变到哪，每一帧都标着，看看就记住了',
    tags: ['#可视化', '#交互式', '#面试必考'],
    difficulty: 'medium',
    intro: {
      valueProp: 'TCP 怎么建连、怎么断连、丢包了怎么重传——动画一步一步放给你看。',
      features: [
        '三次握手和四次挥手的完整过程，看动画就能记住',
        '传输过程模拟丢包，看 TCP 怎么重传',
        'SEQ/ACK 号和连接状态每一步都标着，复习就对着看'
      ],
      prerequisites: '大概知道 TCP 是"面向连接"的就行。',
      useCases: [
        '计网面试前过一遍 TCP 流程',
        '搞懂状态机和序列号到底怎么回事',
        '给别人讲 TCP，有个动画指着讲'
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
    tagline: 'TLS 1.3 握手协议，看完动画就懂了',
    taglineDetail: '初次握手、PSK 恢复、中间人警告——三种场景来回切，看客户端和服务器之间报文怎么飞来飞去。payload 拆到字段级，密钥从 ECDHE 到 HKDF 怎么一步步派生的，追着看就明白了',
    tags: ['#可视化', '#交互式', '#计算机网络'],
    difficulty: 'medium',
    intro: {
      valueProp: 'TLS 1.3 握手三步走给你看，证书和密钥交换不再是个黑盒。',
      features: [
        '三种握手场景：初次握手、PSK 恢复、中间人告警，来回切着看',
        '客户端和服务器双向动画，报文里每个字段都标出来了',
        'ECDHE→HKDF 密钥派生的全链路，4 组密钥 + IV 怎么来的都清楚'
      ],
      prerequisites: '知道 HTTPS 和"握手"大概是什么就够了。',
      useCases: [
        '面试前弄懂 TLS 到底怎么握手的',
        '搞清楚 ECDHE 密钥交换和 HKDF 派生的流程',
        '对比一下完整握手和 PSK 恢复差在哪'
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
    tagline: '输入域名，看它从根一路查到权威',
    taglineDetail: '输个域名进去，从根服务器一路追到权威——哪一步踩了缓存、哪一步碰上了 CNAME 别名链，都给你标出来',
    tags: ['#可视化', '#交互式'],
    difficulty: 'medium',
    intro: {
      valueProp: '输个域名进去，看它从根服务器一路查到权威服务器，每一步都看得到。',
      features: [
        '递归查询完整走一遍：根→顶级域→权威服务器',
        '看看缓存怎么让解析变快的',
        '三种场景：普通查询、缓存命中、CNAME 链'
      ],
      prerequisites: '知道域名有层级（.com → example.com）就行。',
      useCases: [
        '面试前复习 DNS 怎么工作的',
        '排查 DNS 解析慢到底慢在哪一步',
        '弄懂递归查询和迭代查询的区别'
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
    tagline: '粘一段 HTTP 报文，自动拆给你看',
    taglineDetail: '粘一段 HTTP 报文进去——或者直接选个现成的例子——它自动认出是请求还是响应，然后一行行拆开：请求行、状态行、头部字段（每个都标了干啥用的、面试爱考啥）。还送了 16 个状态码速查',
    tags: ['#可视化', '#交互式', '#计算机网络'],
    difficulty: 'easy',
    intro: {
      valueProp: '粘一段 HTTP 报文，自动分解成结构化的展示，每个字段都有说明，不用自己去翻文档。',
      features: [
        '粘报文进去，自动认出是请求还是响应，拆成首行/头部/报文体',
        '每个字段都有 inline 说明——干什么用的、面试爱考啥',
        '8 个预置例子：GET、POST、200、404、500、重定向……直接选',
        '16 个状态码速查卡，按分类翻'
      ],
      prerequisites: '知道 HTTP 是干嘛的就行。',
      useCases: [
        '面试前对着报文熟悉格式',
        '查一个状态码到底啥意思',
        '学 HTTP 协议的时候，有一个实际报文拆开看'
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
    tagline: '调调报文大小和 MTU，看 IP 层怎么切又怎么拼',
    taglineDetail: '两个滑块调报文大小和 MTU，分片列表跟着自动算（ID/MF/偏移量）。算偏移量那步能展开看过程，最后还有重组动画——从最后一片往前播，看怎么拼回去的',
    tags: ['#可视化', '#交互式'],
    difficulty: 'medium',
    intro: {
      valueProp: '拖拽滑块调参数，看 IP 层怎么把大报文切成小片、接收端又怎么一片片拼回来。',
      features: [
        '两个滑块调报文大小和 MTU，头部/载荷/分片数实时更新',
        '分片列表逐片展示 ID、MF 标志、片偏移、数据范围',
        '偏移量怎么算的，点一下就展开了',
        '重组动画从最后一片往前播，看怎么拼回去的'
      ],
      prerequisites: '了解 IP 协议的基本概念（头部、MTU）。',
      useCases: [
        '计网课程学 IP 协议的时候对着看',
        '搞懂片偏移那个 8 字节对齐到底是啥意思',
        '面试前复习一下分片和重组的过程'
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
    tagline: 'SNAT/DNAT 模拟，看报文怎么穿 NAT',
    taglineDetail: '单机上网、多机挤一个公网 IP、端口映射——三种场景随便玩。报文在 LAN/NAT/WAN 三个区域之间飞来飞去，NAT 映射表跟着实时变',
    tags: ['#可视化', '#交互式', '#计算机网络'],
    difficulty: 'medium',
    intro: {
      valueProp: '选个 NAT 场景，看内网报文怎么经过 NAT 转换到达外网，回来的响应又是怎么找到你的。',
      features: [
        '三种场景：单主机、多主机共享 IP、端口映射 Web 服务器',
        '报文在 LAN/NAT 路由器/WAN 三个区域之间跑动画',
        'NAT 映射表实时刷新，看端口复用在干啥'
      ],
      prerequisites: '知道 IP 和端口是什么，了解"内网""外网"的区别。',
      useCases: [
        '面试前搞懂 NAT 到底转了个啥',
        '理解 NAPT 怎么用一个公网 IP 带多台设备的',
        '对比 SNAT 和 DNAT（端口映射）分别怎么工作的'
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
    tagline: '填个表，nginx 配置就出来了',
    taglineDetail: '把域名、端口、证书路径往表里一填，格式排好的 nginx server block 就出来了。HTTPS、反向代理、HTTP→HTTPS 跳转——常用的都有，复制就能往服务器贴',
    tags: ['#实用工具'],
    difficulty: 'easy',
    intro: {
      valueProp: '配 nginx 不用查文档手写了，填个表就出来。',
      features: [
        '填域名、端口、证书路径，自动生成完整的 server block',
        '支持 HTTPS、HTTP、反向代理、HTTP→HTTPS 跳转四种场景',
        '一键复制，粘到服务器就能用'
      ],
      prerequisites: '知道 server block、SSL 配置大概是什么就行。',
      useCases: [
        '新站点配 nginx 和 SSL',
        '给后端服务配反向代理',
        '学 nginx server block 有哪些常用指令'
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
    tagline: '4 种调度算法用甘特图对比，看看哪个快',
    taglineDetail: '四种调度算法来回切，甘特图一步一步回放。周转时间、等待时间、CPU 利用率、吞吐量直接跟 FCFS 基准放在一起比，哪个快哪个慢用不着猜',
    tags: ['#可视化', '#交互式', '#操作系统'],
    difficulty: 'medium',
    intro: {
      valueProp: '四种调度算法来回切，甘特图逐单位回放，指标直接对比 FCFS 基准，哪个快哪个慢一眼看清。',
      features: [
        '四种算法：FCFS、SJF、RR（时间片可调）、MFQ（三层降级）',
        '甘特图逐单位回放，速度可以调快调慢',
        '实时算 avg TAT、avg WT、CPU 利用率、吞吐量，和 FCFS 基准放一起比'
      ],
      prerequisites: '知道 pid、到达时间、CPU 突发时间是啥就行。',
      useCases: [
        'OS 课学到调度算法了，对比看看差异',
        '面试前比一比各算法的周转和等待时间',
        '用甘特图直观跟别人讲明白调度区别'
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
    tagline: '逻辑地址到物理地址，缺页中断和置换，走一遍就懂了',
    taglineDetail: '调好页大小和帧数，输一串逻辑地址进去——地址怎么拆、页表怎么查、缺页了怎么置换，动画一步步播。缺页率实时算，LRU 和 FIFO 换着看哪个缺页少',
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
    tagline: '画资源分配图，跑银行家算法，死锁不藏着',
    taglineDetail: '往图上加进程和资源节点，拖拽画分配边和请求边，一键检测死锁——死锁进程和环路高亮标出来。切到银行家算法模式，输个矩阵进去 Need 自动就算好了，安不安全一眼看见',
    tags: ['#可视化', '#交互式', '#操作系统'],
    difficulty: 'medium',
    intro: {
      valueProp: '画资源分配图、跑银行家算法，死锁检测和安全判断一次看懂，不用死记硬背。',
      features: [
        '可视化资源分配图（RAG），自由拖拽加点加边',
        '一键检测死锁，死锁进程和环路高亮标出来',
        '银行家算法：矩阵输进去 → Need 自动算 → 判断是否安全'
      ],
      prerequisites: '知道进程和资源是啥就行。',
      useCases: [
        'OS 课学死锁的时候动手试试',
        '搞懂死锁检测和银行家算法到底怎么工作的',
        '画 RAG 图直观看看循环等待条件长啥样'
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
    tagline: '4 种磁盘调度算法，看磁头怎么跑的',
    taglineDetail: 'SCAN、C-SCAN、LOOK、C-LOOK 四种算法来回切，看磁头在盘面上来来回回。总寻道长度和平均寻道长度实时算，想比几个算法一键拉一起看',
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
    tagline: '生产者-消费者问题，信号量 P/V 操作的每一步都给你看',
    taglineDetail: 'full/empty/mutex 三个信号量实时蹦数字，缓冲区每个格子里生产了什么、消费了什么，每一步都看得见。P/V 操作日志一条不落，自动播、一步一走、调速都行',
    tags: ['#可视化', '#交互式', '#操作系统'],
    difficulty: 'medium',
    intro: {
      valueProp: '用生产者-消费者问题来演示信号量 P/V 操作怎么控制同步，看完就懂了。',
      features: [
        '三个信号量 full / empty / mutex 数值实时变化，一眼看清',
        '环形缓冲区逐格展示物品怎么生产、怎么消费',
        'P/V 操作序列完整日志，阻塞和唤醒高亮标出来'
      ],
      prerequisites: '知道进程同步和信号量的基本概念。',
      useCases: [
        'OS 课学信号量的时候动手试试',
        '搞懂 P/V 操作是怎么控制临界区访问的',
        '区分计数信号量和互斥信号量分别干啥的'
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
    tagline: '输两个素数，看 RSA 从头算到尾',
    taglineDetail: '三步走完：选两个素数→生成密钥→加密解密。欧拉函数怎么算的、模逆怎么求的、幂运算怎么拆的，中间每一步都敞开给你看',
    tags: ['#交互式', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: '输两个小素数，RSA 的密钥生成、加密和解密整个过程算给你看，中间一步都不省略。',
      features: [
        '内置素数表（2-997），下拉选或者手输都行',
        '密钥生成过程逐行展示：欧拉函数、扩展欧几里得求模逆，一步不落',
        '加密/解密展示模幂运算，快速幂二进制分解过程清清楚楚'
      ],
      prerequisites: '知道 RSA 是"非对称加密"就够了。',
      useCases: [
        '密码学课上学到 RSA 了，跟着算一遍',
        '搞懂模幂和扩展欧几里得算法到底怎么用的',
        '面试 RSA 原理前实操一下'
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
    available: true,
    featured: false,
    tagline: '128-bit 密钥，10 轮加密，每步都拆给你看',
    taglineDetail: '输 16 个字节的明文和密钥进去，SubBytes、ShiftRows、MixColumns、AddRoundKey 每轮四步自动走完。密钥扩展那边 W[0] 到 W[43] 一共 44 个字，一个字都没落下',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: '输 16 字节明文和密钥，看 AES 怎么把数据一步一步变成密文的。',
      features: [
        '每轮展示 SubBytes、ShiftRows、MixColumns、AddRoundKey 四步，一步不落',
        '4×4 字节网格实时高亮，哪些字节被改了看得清清楚楚',
        '密钥扩展面板展示 W[0..43] 44 个字怎么一步步生成的'
      ],
      prerequisites: '知道 AES 是"对称加密算法"就够了。',
      useCases: [
        '密码学课上学到 AES 的时候对着看',
        '搞懂 AES 四步操作和密钥扩展到底在干嘛',
        '对照 FIPS 197 标准向量验证实现是否正确'
      ]
    },
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
    tagline: 'Alice 和 Bob 在不安全信道上怎么约定密钥？',
    taglineDetail: '设好素数和生成元，Alice 和 Bob 自己就跑起来了——生私钥、换公钥、算共享密钥。切到 MITM 模式还能看 Eve 怎么在中间捣鬼',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: '选个素数和本原根，看 Alice 和 Bob 在全程被窃听的信道上怎么约好一个只有他俩知道的密钥。',
      features: [
        'Alice 和 Bob 双方面板，私钥可以手输也可以随机，公钥自动算',
        '公钥交换过程动画展示，模幂展开也给你看',
        'MITM 攻击模拟：Eve 拦截篡改，密钥不一样了会有警示'
      ],
      prerequisites: '知道"密钥交换"的概念，了解模幂运算基本知识。',
      useCases: [
        '密码学课上学密钥交换的时候跟着看',
        '搞懂 DH 协议到底怎么防止窃听的',
        '演示中间人攻击怎么工作，为什么有危害'
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
    tagline: '输段文本，跟踪 SHA-256 每轮压缩函数怎么算的',
    taglineDetail: '输一段话进去，64 轮压缩函数全部走一遍——消息怎么填充、轮常数怎么对上去的、改一个 bit 摘要怎么面目全非的，一路追到底',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: '输一段文本，跟踪 SHA-256 全部 64 轮压缩函数的运算过程，看输入怎么变成那个固定长度的摘要。',
      features: [
        '完整展示 64 轮压缩函数的全部运算过程',
        '雪崩效应对比：改 1 bit 看它怎么扩散到整个摘要的',
        '消息填充、初始向量、轮常数的变化逐字节展示'
      ],
      prerequisites: '了解哈希函数（输入→固定长度摘要），能读十六进制。',
      useCases: [
        '密码学课上学哈希的时候跟着算一遍',
        '搞懂 SHA-256 内部到底怎么工作的',
        '感受一下雪崩效应和迭代压缩的过程'
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
    tagline: '凯撒/维吉尼亚/栅栏——加密、解密、暴力破解',
    taglineDetail: '三种密码一键切换。凯撒 25 种移位全列出来，维吉尼亚密钥怎么逐字母循环给你看，栅栏的点阵结构直接画出来。还带个字母频率柱状图，能跟英文标准频率叠在一起比',
    tags: ['#交互式', '#实用工具'],
    difficulty: 'easy',
    intro: {
      valueProp: '凯撒、维吉尼亚、栅栏——三种古典密码的加密/解密/暴力破解，频率分析一眼看清。',
      features: [
        '三种密码一键切换：凯撒（1-25 移位）、维吉尼亚（密钥循环）、栅栏（2-20 栏）',
        '暴力破解：凯撒全部 25 种结果列出来，栅栏枚举所有栏数',
        '字母频率柱状图，跟标准英文频率放一起对比'
      ],
      prerequisites: '知道"加密就是把字母变一下"就够了。',
      useCases: [
        '密码学入门，试一下古典密码',
        '搞懂凯撒、维吉尼亚、栅栏分别怎么加密的',
        '看看字母频率分析怎么帮助破解'
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
    tagline: '选择、冒泡、快排——动画对比排序过程',
    taglineDetail: '选排、冒泡、快排——三种排序一步步动画演示，每一步在比什么、换了谁都看得见。速度还能调，想慢放细看就慢放',
    tags: ['#可视化', '#交互式'],
    difficulty: 'easy',
    intro: {
      valueProp: '选择、冒泡、快排——三种排序一步步动画回放，看清每一步是怎么比较和交换的。',
      features: [
        '三种排序一步步动画演示',
        '播放速度可以调，慢放看清比较和交换',
        '直观对比不同排序算法的时间复杂度差异'
      ],
      prerequisites: '知道数组是啥就够了。',
      useCases: [
        '数据结构课上学排序的时候跟着看',
        '理解时间复杂度和算法稳定性到底啥意思',
        '给初学者演示排序过程，指着动画讲'
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
    tagline: 'BST 到图搜索，每一步内部状态都看得见',
    taglineDetail: 'BST、栈、队列、哈希表、图——四种结构上手操作，插个数据或删个数据，内部状态跟着实时变。BFS 和 DFS 还能拉到一起比着看',
    tags: ['#可视化', '#交互式', '#面试必考'],
    difficulty: 'medium',
    intro: {
      valueProp: 'BST、栈、队列、哈希表、图——动手操作，每一步内部状态变化都实时展示，不靠想象。',
      features: [
        '交互操作 BST、栈、队列、哈希表、图四种结构',
        '每一步操作后内部状态实时刷新，能看到数据的移动',
        '图搜索支持 BFS 和 DFS 放一起对比'
      ],
      prerequisites: '大概知道树、栈、队列、哈希表、图是啥就行。',
      useCases: [
        '数据结构课上动手实操',
        '复习各数据结构的增删查改核心操作',
        '建立空间直觉，不用全靠背'
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
    tagline: '调调阶数，看 B+ 树节点怎么分裂合并',
    taglineDetail: '阶数从 4 到 32 随便调，节点什么时候分裂、什么时候合并，过程全摊在眼前。查单个 key 或者查范围都行，查询路径高亮跟着走',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: '阶数可调，看 B+ 树节点怎么分裂和合并，范围查询路径高亮，数据库索引原理一下就看懂了。',
      features: [
        '4~32 阶可调，不同阶数树形变化一目了然',
        '插入数据时展示节点分裂的完整过程',
        '单 key 查询和范围查询的路径都能高亮'
      ],
      prerequisites: '建议先了解二叉搜索树（BST）是啥，知道"阶数"的意思。',
      useCases: [
        '学数据库索引原理的时候对着看',
        '系统设计面试前过一遍 B+ 树',
        '可视化看看树形结构怎么保持平衡的'
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
    available: true,
    featured: false,
    tagline: '输入正则，看它怎么变成 NFA 再变成 DFA',
    taglineDetail: '支持 * | . () ? + 这些常用正则语法。三阶段走：先生成 NFA 状态图，再一步步子集构造变成 DFA，最后给出转移表和状态图。还能在 DFA 上输个字符串跑跑，看匹不匹配',
    tags: ['#可视化', '#交互式', '#编译原理'],
    difficulty: 'advanced',
    intro: {
      valueProp: '输个正则表达式，看 Thompson 构造法怎么生成 NFA、子集构造法怎么转成 DFA，整个过程不靠想象。',
      features: [
        '支持常用正则语法：* / | / . / () / ? / +',
        'NFA 状态图和转移列表，Thompson 构造法一步不省',
        '子集构造过程逐步骤展开：ε-闭包 → move → 新 DFA 状态',
        'DFA 转移表和状态图，接受态醒目标出来',
        'DFA 模拟运行：输个测试串，逐字符追踪路径，看看匹不匹配'
      ],
      prerequisites: '了解正则表达式的基本语法，知道 NFA 和 DFA 是"有限自动机"就够了。',
      useCases: [
        '编译原理课上学到词法分析了，跟着走一遍',
        '搞懂 Thompson 构造法和子集构造法到底怎么工作的',
        '面试前复习正则表达式到 DFA 的转化流程'
      ]
    },
    order: 1
  },
  {
    id: 'll1-parser',
    category: 'compiler',
    name: 'LL(1) 分析器',
    icon: '',
    description: '预测分析表 · FIRST/FOLLOW集',
    route: '/pages/ll1-parser/ll1-parser',
    available: true,
    featured: false,
    tagline: '输文法，算 FIRST/FOLLOW，构造预测分析表',
    taglineDetail: '输个文法进去（→ 分隔，| 多选，ε 空串），FIRST 和 FOLLOW 集自动就算好了，预测分析表也给你画出来，有 LL(1) 冲突的地方高亮标着。再输个字符串一步步走分析器，看栈怎么动、输入怎么吃、输出怎么吐',
    tags: ['#可视化', '#交互式', '#编译原理'],
    difficulty: 'advanced',
    intro: {
      valueProp: '输个上下文无关文法，自动走完 LL(1) 分析全流程：FIRST/FOLLOW → 分析表 → 串分析。',
      features: [
        '支持产生式输入（→ 分隔，| 多选，ε 空串）',
        '自动算 FIRST 集（含 ε 传播链）和 FOLLOW 集（含 start 符号的 $）',
        '构造 LL(1) 预测分析表，检测冲突格子并高亮',
        '一步步回放预测分析过程：栈、输入缓冲、输出序列同步展示'
      ],
      prerequisites: '了解上下文无关文法的基本概念，知道 FIRST/FOLLOW 集是啥。',
      useCases: [
        '编译原理课上学 LL(1) 的时候跟着走一遍',
        '验证自己的文法是不是 LL(1) 的',
        '搞懂预测分析器到底怎么工作的'
      ]
    },
    order: 2
  },
  {
    id: 'lexer-viz',
    category: 'compiler',
    name: '词法分析器',
    icon: '',
    description: 'Token化 · 正则匹配 · 符号表',
    route: '/pages/lexer-viz/lexer-viz',
    available: true,
    featured: false,
    tagline: '输段代码，看它怎么变成 Token 流',
    taglineDetail: '输一段类 C 代码（或者选个现成的例子），自动做词法分析——源码里面 Token 按类型着色，点开 Token 卡片看详情，符号表汇总每个标识符在哪出现过。可以步进模式一步步走，也能一下子跑完。最长匹配 >= 怎么认的、关键字优先级怎么处理的，边看边明白',
    tags: ['#可视化', '#编译原理'],
    difficulty: 'medium',
    intro: {
      valueProp: '输一段类 C 代码，看词法分析器怎么把字符流变成 Token 流、符号表怎么构建的。',
      features: [
        '源码视图逐字符高亮，Token 按类型着色（关键字/标识符/数字/运算符等）',
        'Token 卡片可点击查看详情——类型、词素、行列号、匹配规则',
        '符号表自动汇总标识符出现位置和次数',
        '步进模式：单步、一键全跑、重置，看光标在源码上移动',
        '最长匹配原则演示：>= 被识别为一个运算符，不是 > + ='
      ],
      prerequisites: '知道"词法分析"是编译前端的第一步就够了。',
      useCases: [
        '编译原理课上学词法分析的时候跟着看',
        '搞懂正则匹配和最长匹配原则',
        '看看词法分析器怎么处理注释、字符串和非法字符'
      ]
    },
    order: 3
  },
  {
    id: 'ast-builder',
    category: 'compiler',
    name: 'AST 构建器',
    icon: '',
    description: '语法分析树 · 语法制导翻译',
    route: '/pages/ast-builder/ast-builder',
    available: true,
    featured: false,
    tagline: '输入一个算术表达式，看它怎么变成 AST',
    taglineDetail: '从词法分析到 LL(1) 解析到 AST 树再到 SDT 求值——三步走完一个表达式从输入到算出结果的全过程。Token 流高亮着走，递归下降用了哪个产生式每一步都记下来了，AST 树带节点颜色编码，还能步进看求值过程',
    tags: ['#可视化', '#交互式', '#编译原理'],
    difficulty: 'medium',
    intro: {
      valueProp: '输个算术表达式，跟踪它从字符到 Token 流、再到抽象语法树的完整构建过程。',
      features: [
        '词法分析展示 Token 流，逐步高亮当前 Token',
        'LL(1) 递归下降解析，每一步用了哪个产生式都记下来',
        'AST 树视图带节点颜色编码（数字/操作符/标识符）',
        '语法制导翻译（SDT）步进求值，节点属性实时标出来'
      ],
      prerequisites: '知道表达式和四则运算就行。',
      useCases: [
        '编译原理课上学语法分析的时候跟着走',
        '搞懂 LL(1) 自顶向下解析怎么工作的',
        '看看语法制导翻译（SDT）怎么边解析边求值'
      ]
    },
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
