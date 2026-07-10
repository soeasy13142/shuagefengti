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

## 阅读顺序建议

1. 先看 `quiz.md` 理解主链路数据流
2. 看 `dashboard.md` 了解本地统计与建议规则
3. 看 `subnet-calc.md` 或 `tcp-viz.md` 或 `ds-viz.md` 了解可视化模块的标准分层
4. 看 `sort-viz.md` 了解算法步骤生成 + UI 回放分离模式
