# 死锁模拟器模块文档

> 日期：2026-07-19
> 关联 Spec：`docs/superpowers/specs/2026-07-19-deadlock-design.md`
> 关联 Plan：`docs/superpowers/plans/2026-07-19-deadlock.md`

## 文件结构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/deadlock/deadlock.js` | 页面逻辑 | 两模式切换、节点编辑、矩阵输入、结果展示 |
| `pages/deadlock/deadlock.wxml` | 页面模板 | RAG 画布、控件栏、结果面板、银行家表格 |
| `pages/deadlock/deadlock.wxss` | 页面样式 | Claude Design 暖奶油画布风格 |
| `pages/deadlock/deadlock.json` | 页面配置 | 标题栏、背景色 |
| `utils/rag.js` | 工具库 | RAG 数据结构 + 死锁检测（纯函数） |
| `utils/bankers.js` | 工具库 | 银行家算法（纯函数） |
| `tests/utils/rag.test.js` | 测试 | RAG CRUD + 死锁检测 (33 tests) |
| `tests/utils/bankers.test.js` | 测试 | 银行家算法安全检查 (12 tests) |

## 核心接口

### rag.js

| 函数 | 签名 | 说明 |
|---|---|---|
| `createRag()` | `() → Rag` | 创建空 RAG |
| `addProcess(rag, id, name)` | `(Rag, string, string) → Rag` | 添加进程节点（上限 5） |
| `addResource(rag, id, label, total)` | `(Rag, string, string, number) → Rag` | 添加资源节点（上限 5） |
| `addEdge(rag, from, to, type, count)` | `(Rag, string, string, 'request'\|'allocation', number) → Rag` | 添加边 |
| `removeNode(rag, id)` | `(Rag, string) → Rag` | 删除节点及关联边 |
| `removeEdge(rag, from, to, type)` | `(Rag, string, string, string) → Rag` | 删除单条边 |
| `getRagErrors(rag)` | `(Rag) → string[]` | 获取校验错误 |
| `toWaitForGraph(rag)` | `(Rag) → { nodes, edges }` | 转等待图 |
| `detectCycle(graph)` | `({ nodes, edges }) → { hasCycle, cycles }` | DFS 环检测 |
| `detectDeadlock(rag)` | `(Rag) → { hasDeadlock, cycle, deadlockedProcesses }` | RAG 死锁检测 |

### bankers.js

| 函数 | 签名 | 说明 |
|---|---|---|
| `calculateNeed(max, allocation)` | `(number[][], number[][]) → number[][]` | Need = Max − Allocation |
| `isSafeState(max, allocation, available)` | `(number[][], number[][], number[]) → { safe, safeSequence, steps }` | 银行家安全性检查 |

## 技术决策

1. **RAG 布局**：进程节点纵向排列在画布左侧，资源节点在右侧，通过 `_computeNodePositions()` 自动计算位置。
2. **边绘制**：用 CSS `transform:rotate()` 实现有向线段，根据 from/to 坐标计算角度和长度。
3. **死锁检测**：RAG → Wait-For Graph → DFS 环检测（三色标记法），复杂度 O(P²·R·E)。
4. **银行家算法步骤记录**：每轮检查每进程的 Need ≤ Work 比较，记录完整的 Work 变化轨迹。
5. **节点上限 5+5**：Canvas 区域固定大小，保证在小屏上布局清晰。
6. **资源校验**：分配边校验累计分配量 ≤ 总量；请求边校验单次请求 ≤ 总量（允许多进程同时请求同一资源——死锁的必要条件）。

## 预置示例

| 名称 | 模式 | 说明 |
|---|---|---|
| 安全状态 | RAG | 3 进程共享 1 种资源，无循环等待 |
| 死锁示例 | RAG | 2 进程 2 资源，经典循环等待 |
| 三进程循环 | RAG | 3 进程 3 资源，较长循环链 |
| 安全 (经典) | 银行家 | 3 进程 3 资源，标准安全态 |
| 不安全 | 银行家 | 3 进程 2 资源，Need > Work |
| 安全 (5进程) | 银行家 | 5 进程 4 资源的安全态示例 |

## 注意事项

- 所有工具函数为纯函数，不得引入副作用
- 页面资源上限：进程 ≤ 5，资源 ≤ 5，保证布局清晰
- 边添加时自动校验资源总量约束：分配边 (R→P) 检查累计 ≤ total；请求边 (P→R) 检查单次 ≤ total
- `getRagErrors()` 在检测前调用，确保有进程和资源
- 边创建通过两次点击节点实现（先选源节点，再选目标节点）
