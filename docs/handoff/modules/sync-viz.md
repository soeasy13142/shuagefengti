# 同步互斥演示（Sync Viz — Producer-Consumer + Semaphore PV）

> 由 `2026-07-19-sync-viz-design.md` spec 实施落盘。

## 概览

交互式演示经典生产者-消费者问题，通过信号量的 P/V 操作可视化进程同步过程。适合 OS 学习者理解临界区、信号量机制和经典同步问题。

## 数据驱动

| 模块 | 内容 |
|---|---|
| `utils/semaphore.js` | 信号量数据结构 + 不可变 P/V 操作（`semWait` / `semSignal`），含 FIFO 等待队列和操作历史 |
| `utils/producer-consumer.js` | 生产者-消费者模拟引擎：`createSimulation` / `producerStep` / `consumerStep` / `addRandomItems` / `resetSimulation` |

## 核心概念

| 概念 | 实现 |
|---|---|
| 信号量 | 三个信号量：`mutex`（互斥，初始 1）、`empty`（空闲槽，初始 = bufferSize）、`full`（已满槽，初始 0） |
| P 操作 | `semWait`：value--；若 value<0 则将当前线程加入等待队列（阻塞） |
| V 操作 | `semSignal`：value++；若 value<=0 则从等待队列 FIFO 唤醒一个线程 |
| 生产者流程 | P(empty) → P(mutex) → 放入物品 → V(mutex) → V(full) |
| 消费者流程 | P(full) → P(mutex) → 取出物品 → V(mutex) → V(empty) |
| 环形缓冲区 | 通过 `producerIndex` / `consumerIndex` 指针实现循环读写 |

## 信号量可视化

| 信号量 | 颜色 | 说明 |
|---|---|---|
| full  | `#81b29a`（鼠尾草绿） | 当前已占用的缓冲区 slot 数 |
| empty | `#8d99ae`（钢蓝） | 当前空闲的缓冲区 slot 数 |
| mutex | `#cc785c`（珊瑚） | 互斥锁状态（0=被占用，1=空闲） |

每个信号量以横向进度条显示当前值百分比，值变化时 WXSS `transition` 动画过渡。

## 缓冲区渲染

环形缓冲区使用 flex 横向排列 `<view>` 格子：
- 空 slot：虚线边框 + 半透明背景
- 已填充 slot：实线边框 + 浅色背景 + emoji 物品图标
- 生产者指针（V）和消费者指针（^）标注在当前操作位置

## 操作日志

底部 `<scroll-view>` 自动滚动到最新条目。每条日志显示：
- 时间戳 `[t=...]`
- 操作者（生产者 / 消费者）
- 操作描述（P(empty) / V(full) / 生产 emoji 等）
- 信号量值变化（before > after）
- 阻塞/唤醒标识（颜色高亮）

阻塞时日志条目标红色，唤醒时标绿色。

## 设计风格

完全 Claude Design 暖奶油画布（`#faf9f5` 背景 / `#efe9de` 卡片 / `#cc785c` CTA / Georgia 衬线标题）。信号量颜色沿用冷调（绿/蓝）以区别于主色珊瑚，避免语义冲突。

## 测试

- `tests/utils/semaphore.test.js` —— 信号量创建 / P/V 操作 / 阻塞 / FIFO 唤醒 / 不可变性（18 测试）
- `tests/utils/producer-consumer.test.js` —— 生产消费流程 / 缓冲区满阻塞 / 缓冲区空阻塞 / 环形 wrap / 重置（19 测试）

`npm test` 全绿。

## PV 操作序列（关键实现细节）

```
生产者                   消费者
P(empty)                  P(full)
P(mutex)                  P(mutex)
放入物品                   取出物品
V(mutex)                  V(mutex)
V(full)                   V(empty)
```

阻塞条件：
- 生产者：`empty.value <= 0`（缓冲区满）
- 消费者：`full.value <= 0`（缓冲区空）
