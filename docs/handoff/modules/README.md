# 模块详解（Modules）

> 每个模块一份独立文件。详细实现见对应文件。

| 模块 | 文件 | 摘要 |
|---|---|---|
| 刷题主链路 | `quiz.md` | Markdown 解析、本地存储、试卷列表、刷题引擎、判分、记录、错题本 |
| 学习驾驶舱 | `dashboard.md` | 累计统计、题型雷达、7 天趋势、智能建议 |
| 子网计算器 | `subnet-calc.md` | IP/CIDR 计算、二进制位可视化、AND 运算动画、地址分类 |
| TCP 动画机 | `tcp-viz.md` | TCP 状态机交互、三次握手/四次挥手逐步骤动画 |
| 数据结构可视化 | `ds-viz.md` | BST、栈&队列、哈希表、图 BFS/DFS 四种模式 |
| 排序可视化 | `sort-viz.md` | 选择/冒泡/快速排序 + 步骤回放 |
| B+ 树可视化 | `bplus-viz.md` | B+ 树插入/删除/查找动画、阶数调节 |
| CPU 调度可视化 | `cpu-sched.md` | FCFS/SJF/优先级/RR 调度算法、甘特图、指标对比 |
| DNS 解析可视化 | `dns-viz.md` | DNS 递归/迭代查询全过程动画 |
| 内存分页可视化 | `mem-paging.md` | 分页映射、TLB 缓存、页面置换算法模拟 |
| 死锁模拟器 | `deadlock.md` | 死锁检测/银行家算法、资源分配图 |
| 磁盘调度可视化 | `disk-sched.md` | FCFS/SSTF/SCAN/C-SCAN 磁头寻道模拟 |
| Nginx 配置生成器 | `nginx-gen.md` | Nginx 反向代理/负载均衡/SSL 配置可视化生成 |
| SHA-256 演示 | `sha256-viz.md` | SHA-256 哈希计算分步骤可视化 |
| IP 分片可视化 | `ip-fragment.md` | IP 数据报分片与重组动画、MTU 滑块、进度控制 |
| NAT 模拟器 | `nat-viz.md` | NAT 地址转换模拟、内外网映射表、连接追踪 |
| HTTP 解析器 | `http-parser.md` | HTTP 请求/响应报文解析、状态码速查、预置示例 |
| TLS 动画机 | `tls-viz.md` | TLS 握手协议逐步骤动画、密码套件选择、证书验证 |

## 阅读顺序建议

1. 先看 `quiz.md` 理解主链路数据流
2. 看 `dashboard.md` 了解本地统计与建议规则
3. 看 `subnet-calc.md` 或 `tcp-viz.md` 或 `ds-viz.md` 了解可视化模块的标准分层
4. 看 `sort-viz.md` 了解算法步骤生成 + UI 回放分离模式
