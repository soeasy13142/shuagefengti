# 死锁模拟器 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`deadlock` 占位）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **死锁模拟器**：用户配置进程与资源关系，可视化资源分配图，运行银行家算法判断系统是否处于安全状态，帮助 OS 学习者直观理解死锁的四个必要条件与死锁避免算法。

## 2. 范围

包含：
- 资源分配图（RAG）的可视化编辑：进程节点、资源节点、分配边、请求边
- 死锁检测：检测图中是否存在循环等待 → 标记死锁进程
- 银行家算法：输入 Max / Allocation / Available 矩阵，计算 Need 并判断安全状态
- 安全序列展示：银行家算法输出一个安全序列（如有）
- 预置示例：3 个经典案例（安全、不安全、死锁）

不包含（明确不做）：
- 死锁预防（破坏四个条件之一）的交互模拟
- 死锁恢复（终止进程 / 资源抢占）的模拟
- 多资源类型的复杂银行家算法（仅单资源类型）
- 分布式死锁检测

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/deadlock/deadlock.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/rag.js` | 新增 | 资源分配图数据结构 + 检测算法 |
| `utils/bankers.js` | 新增 | 银行家算法纯函数 |
| `utils/tool-registry.js` | 修改 | `deadlock.available = true` |
| `app.json` | 修改 | 注册 `pages/deadlock/deadlock` |
| `tests/utils/rag.test.js` | 新增 | RAG 检测单测 |
| `tests/utils/bankers.test.js` | 新增 | 银行家算法单测 |
| `docs/handoff/modules/deadlock.md` | 新增 | 模块专题文档 |

## 4. 核心交互

```
┌─ 模式 ─────────────────────────────────────┐
│  [资源分配图]   [银行家算法]                   │
├─ 编辑区域 ──────────────────────────────────┤
│  ┌───┐        ┌───┐                         │
│  │ P1│──→R1←──│ P2│   ① 点击添加进程/资源    │
│  └───┘        └───┘   ② 拖拽连接分配/请求边   │
│    ↑                  ③ 点击 ▶ 运行检测       │
│    R2                                         │
│  ┌───┐                                        │
│  │ P3│──→R3                                   │
│  └───┘                                        │
├─ 检测结果 ───────────────────────────────────┤
│  ❌ 检测到死锁!                                │
│  死锁进程: P1, P3                             │
│  循环: P1→R1→P3→R3→P1                        │
└──────────────────────────────────────────────┘
```

用户可在两种模式间切换：
1. **资源分配图模式**：通过添加进程/资源节点、拖拽建立分配边/请求边，点击检测按钮查看是否有死锁。用颜色标记死锁进程（红）和正常进程（绿）。
2. **银行家算法模式**：通过表格输入 Max / Allocation / Available，系统自动计算 Need 矩阵并执行安全性检查。输出安全序列或标记不安全。

预置示例按钮加载 3 个经典场景，一键对比。

## 5. 数据模型 / 核心逻辑

```js
// 资源分配图
{
  processes: [{ id: 'P1', name: string }],
  resources: [{ id: 'R1', label: string, total: number }],
  edges: [
    { from: 'P1', to: 'R1', type: 'request', count: 1 }, // 请求边
    { from: 'R1', to: 'P2', type: 'allocation', count: 1 } // 分配边
  ]
}

// 银行家算法输入
{
  max: [[7,5,3], [3,2,2], [9,0,2]],     // Max 矩阵
  allocation: [[0,1,0], [2,0,0], [3,0,2]], // Allocation 矩阵
  available: [3,3,2],                    // Available 向量
  need: [[7,4,3], [1,2,2], [6,0,0]]     // Need = Max - Allocation（自动计算）
}

// 算法输出
function detectDeadlock(rag):
  // 1. 将 RAG 转化为 wait-for 图
  // 2. 对每个进程节点运行 DFS 检测环
  // 3. 返回 { hasDeadlock, cycle: [nodeId...], deadlockedProcesses: [pid...] }

function bankersAlgorithm(max, allocation, available):
  // 1. Work = Available, Finish = [false...]
  // 2. 循环查找 Need[i] <= Work 且 !Finish[i] 的进程
  // 3. 执行 allocation[i] 后继续
  // 4. 返回 { safe: boolean, safeSequence: [pid...], steps: [...] }
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| RAG 中无进程或无资源 | 禁用检测，提示 "请至少添加一个进程和一个资源" |
| 请求边数量超过资源总量 | 边创建时校验，提示 "请求数超过资源总量" |
| 银行家算法矩阵维度不匹配 | 表格输入校验，行列数需一致 |
| Max < Allocation | 单元格标红提示 "Max 不能小于 Allocation" |
| Available 向量含负数 | 输入校验，提示 "可用资源不能为负" |
| 安全序列不存在 | 清晰标记 ❌ 不安全，列出检查过程中 Work 的变化 |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/rag.test.js` | RAG 构建、边类型校验、死锁检测（有环/无环/多环）、wait-for 图转换 |
| `tests/utils/bankers.test.js` | Need 矩阵计算、安全性检查（安全/不安全）、安全序列顺序正确性、预置示例快照 |

**关键测试用例**：

```js
// RAG 死锁检测：P1→R1→P2→R2→P1 形成环
// 期望：hasDeadlock=true, cycle=[P1,R1,P2,R2,P1]

// 银行家算法 - 安全状态
max=[[7,5,3],[3,2,2],[9,0,2]]
allocation=[[0,1,0],[2,0,0],[3,0,2]]
available=[3,3,2]
// 期望：safe=true, safeSequence=[P2,P1,P3]

// 银行家算法 - 不安全状态
max=[[1,2],[2,3],[3,1]]
allocation=[[1,0],[1,1],[2,1]]
available=[0,1]
// 期望：safe=false
```

覆盖率目标 ≥ 80%。所有测试必须通过 `npm test`。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布（`#faf9f5` 背景 / `#efe9de` 卡片 / `#cc785c` CTA / Georgia 衬线标题）。
2. **纯函数优先**：`rag.js` / `bankers.js` 全部无副作用。
3. **RAG 可视化**：使用 WXML 绝对定位布局，节点为 `<view>` 元素，边为 CSS（伪元素或用 SVG 内联），拖拽用 `bindtouchstart` / `bindtouchmove`。
4. **银行家算法表格**：使用基础 `<view>` 网格布局模拟表格，便于样式统一 + 行内编辑。
5. **节点上限**：进程最多 5 个，资源最多 5 个（页面布局清晰）。
6. **更新 PROJECT_HANDOFF**：完成时追加变更记录。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| RAG 图布局算法复杂 | 使用固定网格布局（进程左侧，资源右侧）+ 手动拖拽二次调整 |
| 死锁检测 DFS 在大图中的性能 | 节点上限 10，DFS 复杂度可接受 |
| 银行家算法理解门槛高 | 每条公式旁加文字说明（Need = Max - Allocation），步骤记录清晰 |

未来可拓展：
- 死锁预防策略模拟（破坏互斥 / 保持并等待 / 非剥夺 / 循环等待）
- 死锁恢复方案（终止进程 vs 资源抢占）
- 多资源类型银行家算法
- 分布式死锁检测

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-19-deadlock.md`，按 RED → GREEN → IMPROVE 分阶段实施。
