# 进程调度可视化 · 设计文档

> 日期：2026-07-12
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js` (`cpu-sched` 占位)、`app.json`、`docs/handoff/future-plans.md`

## 1. 目标

为「刷个冯题」小程序新增一个 **CPU 进程调度算法** 的可视化教学页面：用户输入进程列表，可选 4 种调度算法（FCFS / SJF / RR / MFQ），看到甘特图渲染 + 性能指标计算（平均周转时间 / 平均等待时间 / CPU 利用率 / 吞吐量），帮助 OS 学习者直观理解各调度算法的行为差异。

## 2. 范围

包含：
- 4 个调度算法：FCFS（非抢占）/ SJF（非抢占）/ RR（可调时间片）/ MFQ（3 层队列）
- 进程输入：手动添加 / 删除 / 编辑 + 一键随机生成
- 甘特图渲染（横向时间轴，每个进程一色条）
- 4 个性能指标计算 + 与 FCFS 对比箭头（↑↓）
- 动画控制：▶ 播放 / ⏸ 暂停 / 速度 0.5x/1x/2x / ↻ 重置

不包含（明确不做）：
- 抢占式 SJF（含 SRTF，预留扩展）
- 多级反馈队列的动态优先级提升（I/O 模拟）
- 多核 CPU 调度（限定单核）
- 实时调度（Rate Monotonic / EDF）
- 进程优先级数值配置（MFQ 仅按到达顺序降级）

## 3. 架构

新增 / 修改文件：

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/cpu-sched/cpu-sched.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/scheduling.js` | 新增 | 4 个算法纯函数 |
| `utils/process.js` | 新增 | Process 数据结构 + 工具函数 |
| `utils/scheduling-metrics.js` | 新增 | 指标计算函数 |
| `utils/tool-registry.js` | 修改 | `cpu-sched.available = true` |
| `app.json` | 修改 | 注册 `pages/cpu-sched/cpu-sched` |
| `tests/utils/scheduling.test.js` | 新增 | 4 个算法单测 |
| `tests/utils/scheduling-metrics.test.js` | 新增 | 指标计算单测 |
| `tests/utils/process.test.js` | 新增 | Process 校验 / 随机生成 |
| `docs/handoff/modules/cpu-sched.md` | 新增 | 模块专题文档 |

## 4. 组件

### 4.1 左面板：进程列表

```text
┌──────────────────────────┐
│ 进程列表              [+][🎲]│
├──────────────────────────┤
│ pid │ arrival │ burst  │ 🗑 │
│ P1  │ 0       │ 5      │ × │
│ P2  │ 1       │ 3      │ × │
│ P3  │ 2       │ 8      │ × │
└──────────────────────────┘
```

- 行内编辑（点击单元格 → 弹出 input）
- 校验：`arrival >= 0`、`burst > 0`、`pid` 唯一
- 🎲 随机生成：5 个进程（arrival 0~10，burst 1~10）

### 4.2 顶部算法选择

```text
[FCFS] [SJF] [RR] [MFQ]
                  └─ RR 量子滑块：1~4
                  └─ MFQ：3 层队列（量子 2/4/8，固定）
```

### 4.3 主视图：甘特图

```text
时间轴 0────5────10────15────20────25
P1   ███████░░░░░░░░░░░░░░░░░░░░░░░
P2   ░░░░██████░░░░░░░░░░░░░░░░░░░░
P3   ░░░░░░░░████████████░░░░░░░░░░
```

- 横向时间轴（每单位 30px）
- 每个进程一行，色条按 pid 哈希取色（10 色调色板循环）
- 色条上文字显示 pid
- 时间轴刻度自动调整（0~maxCompletion）

### 4.4 右面板：性能指标

4 张卡片，每张含数字 + 单位 + 与 FCFS 对比箭头：

| 指标 | 公式 |
|---|---|
| 平均周转时间 (avg TAT) | Σ(completion - arrival) / n |
| 平均等待时间 (avg WT) | Σ(TAT - burst) / n |
| CPU 利用率 | Σ(burst) / maxCompletion |
| 吞吐量 (throughput) | n / maxCompletion |

箭头：`↑` 红（比 FCFS 差）/ `↓` 绿（比 FCFS 好）/ `=` 黄（相同）。

### 4.5 底部动画控制

▶ 播放 / ⏸ 暂停 / 速度 [0.5x][1x][2x] / ↻ 重置

## 5. 数据流

```text
用户输入 processes[]
  ↓
算法选择 (FCFS/SJF/RR/MFQ)
  ↓
utils/scheduling.<algorithm>(processes, options)
  ├─ fcfs(processes)：
  │    按 arrival 排序 → 串行执行
  │    返回 gantt: [{pid, start, end}]
  ├─ sjf(processes)：
  │    每次选当前 ready 队列中 burst 最短
  │    arrival 相同则按 pid 字典序
  │    返回 gantt
  ├─ rr(processes, quantum)：
  │    用量子切片，到时放回 ready 队尾
  │    返回 gantt
  └─ mfq(processes, queues=[2,4,8])：
       3 层队列，新进程入 q0
       用完量子降级到下一层
       返回 gantt
  ↓
utils/scheduling-metrics.calculate(gantt, processes)
  ↓
返回 { gantt, metrics, totalTime }
  ↓
页面渲染甘特图 + 指标卡片
  ├─ 动画：从左到右填充色条，100ms / 单位时间
  └─ 实时更新指标
```

`Process` 数据结构：

```js
{
  pid: string,        // 进程标识，唯一
  arrival: number,    // 到达时间 ≥ 0
  burst: number,      // 服务时间 > 0
  priority?: number   // 可选，预留 MFQ 扩展
}
```

`GanttStep` 数据结构：

```js
{
  pid: string,
  start: number,
  end: number
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 进程列表为空 | 禁用 ▶ 按钮，提示 "请添加进程" |
| `pid` 重复 | input 校验失败 + 红色边框 |
| `arrival < 0` 或 `burst <= 0` | input 校验失败 |
| RR 量子 < 1 | 滑块限制 1~4 |
| MFQ 队列配置错误（仅允许 3 层） | 固定展示，不可编辑 |
| 动画进行中切换算法 | 提示 "请先重置" |
| 计算指标时 gantt 为空 | 返回 `{ avgTAT: 0, avgWT: 0, cpuUtil: 0, throughput: 0 }` |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/scheduling.test.js` | 4 个算法的 gantt 输出快照：FCFS 顺序、SJF 同 arrival 时 burst 短优先、RR 量子切片正确性、MFQ 降级行为 |
| `tests/utils/scheduling-metrics.test.js` | 4 个指标计算：单进程、空 CPU 间隙、多进程并发到达 |
| `tests/utils/process.test.js` | `validateProcess()` / `randomProcesses(n)` |

**关键测试用例**（snapshot 测试）：

```js
// FCFS：3 进程串行
processes = [
  { pid: 'P1', arrival: 0, burst: 5 },
  { pid: 'P2', arrival: 1, burst: 3 },
  { pid: 'P3', arrival: 2, burst: 8 }
]
// 期望 gantt: [{pid:P1,start:0,end:5},{pid:P2,start:5,end:8},{pid:P3,start:8,end:16}]

// SJF：同 arrival 时 burst 短优先
// 期望 P2 (burst:3) → P1 (burst:5) → P3 (burst:8)

// RR(quantum=2)：所有进程轮转
// 期望每个进程以 2 为单位切片
```

覆盖率目标 ≥ 80%。所有测试必须通过 `npm test`。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布。
2. **纯函数优先**：`scheduling.js` / `process.js` / `scheduling-metrics.js` 全部无副作用。
3. **甘特图渲染**：使用嵌套 `<view>` + `style="width: {px}px; left: {px}px"` 绝对定位，**不**用 canvas（保持包小）。
4. **动画**：色条从左到右用 WXSS `transition: width 100ms` 渐进填充。
5. **进程数限制**：UI 上限 10 个进程（性能 + 可视化清晰）。
6. **更新 PROJECT_HANDOFF**：完成时追加变更记录。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| MFQ 降级逻辑复杂、易出错 | 第一版仅按"到达 + 量子用尽"降级；I/O 模拟提升优先级留 backlog |
| 抢占式 SJF（SRTF）实现复杂 | 第一版仅非抢占；SRTF 进 backlog |
| 多核调度 | 当前版本单核，多核留 backlog |
| 算法数量扩展（多级反馈队列变体） | 抽象 queue 配置接口，便于扩展 |

未来可拓展：
- 抢占式 SJF（SRTF）
- 多核 CPU 调度
- 实时调度（RM / EDF）
- 进程优先级可视化
- 与 TCP-viz 类似的 step-by-step 状态机动画（每个进程一行生命周期）

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-12-cpu-scheduling.md`，按 RED → GREEN → IMPROVE 分阶段实施。