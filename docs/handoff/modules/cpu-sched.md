# 进程调度可视化（CPU Scheduling Visualization）

> 由 `2026-07-12-cpu-scheduling-design.md` spec 实施落盘。

## 概览

交互式展示 4 种 CPU 进程调度算法（FCFS / SJF / RR / MFQ），支持进程编辑、甘特图渲染、性能指标计算（含 vs FCFS 对比）和动画回放。

## 数据驱动

| 模块 | 内容 |
|---|---|
| `utils/process.js` | 进程校验（pid 唯一 / arrival≥0 / burst>0）、随机生成（5 个进程）、10 色调色板 |
| `utils/scheduling.js` | 4 个调度算法纯函数：`fcfs` / `sjf`（非抢占）/ `rr`（量子可配）/ `mfq`（默认 `[2,4,8]` 三层） |
| `utils/scheduling-metrics.js` | 4 项指标：`avgTAT` / `avgWT` / `cpuUtil` / `throughput` |

## 4 个算法要点

| 算法 | 行为 |
|---|---|
| FCFS | 按 arrival 排序串行执行，同 arrival 按 pid 字典序 |
| SJF | 每次从 ready 选 burst 最短，非抢占；同 burst 按 pid 字典序 |
| RR  | 单层 RR，quantum 滑块 1~4；到时放回队尾 |
| MFQ | 3 层量子固定 `[2,4,8]`；新进程入 q0；用完本层量子降级，最低层保持 |

## 性能指标

| 指标 | 公式 |
|---|---|
| avg TAT | `Σ(completion - arrival) / n` |
| avg WT  | `Σ(TAT - burst) / n` |
| CPU 利用率 | `Σburst / maxCompletion` |
| 吞吐量 | `n / maxCompletion` |

页面右下面板始终额外计算 FCFS 指标并显示对比箭头（绿 = 更好；红 = 更差；黄 = 相同；语义按指标"低好/高好"区分）。

## 甘特图渲染

横向时间轴，每单位 `28px`。每个进程一行绝对定位 `<view>` 色条（按 pid 哈希取色）。色条宽度等于 `(end - start) × 28px`，`transition: left 0.3s, width 0.3s` 实现渐进填充。

## 测试

- `tests/utils/process.test.js` —— 校验 / 随机生成 / 调色板（16 测试）
- `tests/utils/scheduling.test.js` —— 4 个算法 gantt 快照（21 测试）
- `tests/utils/scheduling-metrics.test.js` —— 4 个指标（6 测试）

`npm test` 全绿。

## 设计风格

完全 Claude Design 暖奶油画布（参见 `docs/DESIGN.md`）。算法色条按 10 色调色板循环（珊瑚 / 赭石 / 鼠尾草 / 钢蓝等暖中性色）。
