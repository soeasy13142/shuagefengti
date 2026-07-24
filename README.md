# 刷个冯题

[English](README_EN.md)

微信小程序计算机科学教育工具集：Markdown 刷题 + 25 个交互式教学工具，涵盖计算机网络、操作系统、密码学、算法与编译原理。

所有数据都在本机。不接后端、不需要账号——你导进去的题、刷过的记录、错题本都保存在你的手机里。

最初只想做一个本地刷题工具；后来陆续加了 25 个交互式教学工具，分计算机网络、操作系统、密码学、算法与数据结构、编译原理五大门类，逐渐变成了一个有点"瑞士军刀"感觉的学习助手。

## 1. 功能清单（25 个计算机科学教育工具）

### 刷题核心

| 模块 | 简介 |
|---|---|
| 刷题 | MVP 核心。Markdown 导入，五种题型，练习/考试模式，自动错题入栈 |
| 学习驾驶舱 | 累计统计、题型雷达、7 天趋势、本地规则智能建议 |

### 计算机网络（8 个）

| 工具 | 简介 |
|---|---|
| 子网计算器 | IP/CIDR 计算 + 32 位二进制可视化 + AND 运算动画 |
| TCP 动画机 | TCP 状态机交互，三次握手/四次挥手逐步骤演示 |
| TLS 动画机 | TLS 1.3 握手协议 step-by-step 动画，ECDHE→HKDF 密钥派生 |
| DNS 解析器 | 域名解析过程模拟，递归/迭代查询，缓存命中与 CNAME 追踪 |
| HTTP 解析器 | HTTP 请求/响应报文逐字段拆解，16 个核心状态码速查 |
| IP 分片可视化 | MTU 分片过程动画，片偏移 8 字节对齐规则演示 |
| NAT 模拟器 | SNAT/DNAT 多场景模拟，NAT 映射表实时更新 |
| Nginx 配置生成器 | 填表即出 nginx server block 配置，一键复制部署 |

### 操作系统（5 个）

| 工具 | 简介 |
|---|---|
| 进程调度可视化 | FCFS/SJF/RR/MFQ 四种算法，甘特图回放，多维指标对比 |
| 内存分页可视化 | 逻辑地址→物理地址转换，LRU/FIFO 置换算法动画 |
| 死锁模拟器 | 资源分配图编辑 + 银行家算法安全状态判断 |
| 磁盘调度可视化 | SCAN/C-SCAN/LOOK/C-LOOK 磁头移动动画 |
| 同步互斥演示 | 生产者-消费者问题，信号量 P/V 操作可视化 |

### 密码学（5 个）

| 工具 | 简介 |
|---|---|
| RSA 演算器 | 密钥生成→加密解密，扩展欧几里得求模逆逐行推导 |
| AES 演示 | 128-bit 密钥 10 轮加密，SubBytes→ShiftRows→MixColumns→AddRoundKey 逐轮展示 |
| DH 密钥交换 | Diffie-Hellman 协议可视化，附 MITM 中间人攻击模拟 |
| SHA-256 演示 | 64 轮压缩函数运算全过程，雪崩效应对比 |
| 密码工具箱 | 凯撒/维吉尼亚/栅栏密码加解密 + 暴力破解 + 频率分析 |

### 算法 & 数据结构（3 个）

| 工具 | 简介 |
|---|---|
| 排序可视化 | 选择/冒泡/快速排序 + 步骤回放，速度可调 |
| 数据结构可视化 | BST、栈队列、哈希表、图 BFS/DFS 四种模式 |
| B+ 树可视化 | 阶数 m 可调，节点分裂与合并，范围查询路径高亮 |

### 编译原理（4 个）

| 工具 | 简介 |
|---|---|
| Regex→DFA | Thompson 构造法 NFA→子集构造法 DFA，DFA 模拟运行 |
| LL(1) 分析器 | FIRST/FOLLOW 集计算，预测分析表构造，串分析过程回放 |
| 词法分析器 | 逐字符 Token 化，最长匹配原则，符号表构建 |
| AST 构建器 | 递归下降解析 → 抽象语法树 → 语法制导翻译求值 |

## 2. 设计风格

整体采用 **Claude Design 暖奶油画布**：暖奶油背景 `#faf9f5`、奶油卡片 `#efe9de`、珊瑚色 CTA `#cc785c`。零阴影，靠色块对比表达层次。详细规范见 [docs/DESIGN.md](docs/DESIGN.md)。

## 3. 技术栈

- 微信小程序原生框架（WXML + WXSS + JS）
- 纯本地存储（`wx.setStorageSync`）
- Markdown 解析：纯正则手写（不引第三方库，控包大小）
- 测试：Jest 单元测试（当前 62 suites / 977+ tests）
- 详见 [docs/handoff/architecture.md](docs/handoff/architecture.md)

## 4. 快速开始

```bash
npm install
npm test
```

然后用微信开发者工具打开项目根目录即可。

导入试题：进入"开始刷题"→"导入试卷"，选一个 Markdown 文件（格式参考根目录的 `test-questions.md`）。

## 5. 文档导航

| 文档 | 用途 |
|---|---|
| [.claude/HANDOFF.md](.claude/HANDOFF.md) | 30 秒恢复上下文 |
| [docs/handoff/](docs/handoff/) | 各模块详解、架构、决策、风险、未来计划 |
| [docs/DESIGN.md](docs/DESIGN.md) | Claude Design 设计规范 |
| [docs/superpowers/specs/](docs/superpowers/specs/) | 原始设计 |
| [docs/superpowers/plans/](docs/superpowers/plans/) | 原始实施计划 |
| [CLAUDE.md](CLAUDE.md) | 项目 Claude 指令（do/don't 红线） |

## 6. 项目目录

```text
├── app.{js,json,wxss}           入口和全局配置
├── pages/                       22 个主包页面
│   ├── index/                   首页（Hero + 工具箱）
│   ├── quiz-list/               试卷列表 + 导入入口
│   ├── import-preview/          导入预览（含题型统计）
│   ├── quiz/                    刷题核心
│   ├── result/                  成绩结果
│   ├── records/                 答题记录列表
│   ├── record-detail/           记录详情（逐题复盘）
│   ├── wrong-questions/         错题本
│   ├── dashboard/               学习驾驶舱
│   ├── tls-viz/                 TLS 动画机
│   ├── tools-all/               全部工具（分类视图）
│   ├── http-parser/             HTTP 解析器
│   ├── ip-fragment/             IP 分片可视化
│   ├── lexer-viz/               词法分析器
│   ├── ll1-parser/              LL(1) 分析器
│   ├── regex-dfa/               Regex→DFA
│   ├── dh-viz/                  DH 密钥交换
│   ├── sync-viz/                同步互斥演示
│   ├── crypto-tools/            密码工具箱
│   ├── rsa-calc/                RSA 演算器
│   ├── aes-viz/                 AES 演示
│   └── ast-builder/             AST 构建器
├── package-tools/               13 个分包页面
│   ├── subnet-calc/            子网计算器
│   ├── tcp-viz/                TCP 动画机
│   ├── dns-viz/                DNS 解析器
│   ├── sort-viz/               排序可视化
│   ├── ds-viz/                 数据结构可视化
│   ├── bplus-viz/              B+ 树可视化
│   ├── cpu-sched/              进程调度可视化
│   ├── mem-paging/             内存分页可视化
│   ├── deadlock/               死锁模拟器
│   ├── disk-sched/             磁盘调度可视化
│   ├── nat-viz/                NAT 模拟器
│   ├── nginx-gen/              Nginx 配置生成器
│   └── sha256-viz/             SHA-256 演示
├── components/                  5 个公共组件
│   ├── inline-collapse/        内联折叠
│   ├── intro-modal/            功能介绍弹窗
│   ├── loading-skeleton/       骨架屏加载
│   ├── quick-tip-bubble/       快捷提示气泡
│   └── tool-help-panel/        工具帮助面板
├── utils/                       65+ 工具模块（纯 JS）
├── tests/                       Jest（62 suites / 977+ tests）
└── docs/                        设计 / 文档规范
```

## 7. 仓库说明

以下文件仅保留在本地，不入 git（已在 `.gitignore`）：

- `TCP.pdf` — 网络协议参考资料（3 MB 二进制）
- `idea.md` — 个人想法草稿

历史归档与过期文档位于 [docs/archive/](docs/archive/)。
