# 同步互斥演示 · 设计文档

> 日期：2026-07-19 | 最后更新：2026-07-22
> 阶段：brainstorming → spec → **已实现**
> 状态：全部功能已完成并验证通过
> 关联：`utils/tool-registry.js`（`sync-viz` 已注册）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **同步互斥演示** 页面：通过生产者-消费者问题，可视化信号量（P/V 操作）控制进程同步的过程，帮助 OS 学习者理解临界区、信号量机制与经典同步问题。

## 2. 范围

包含：
- 核心场景：生产者-消费者问题（单生产者 + 单消费者 + 有界缓冲区）
- 信号量可视化：full / empty / mutex 三个信号量的实时数值变化条
- 步骤动画：每个 P/V 操作时高亮当前线程，展示信号量值变化
- 缓冲区状态：环形缓冲区（长度为 4~8 可配），每个 slot 显示是否被占用及存放的内容
- 播放控制：▶ 播放 / ⏸ 暂停 / 步进 / 速度 0.5x/1x/2x / ↻ 重置
- 可调参数：生产者速度（生产间隔）、消费者速度（消费间隔）、缓冲区大小

不包含（明确不做）：
- 多生产者 / 多消费者场景（预留扩展）
- 读者-写者问题 / 哲学家就餐问题（仅聚焦生产者-消费者）
- 管程（Monitor）模拟
- 死锁预防（生产者-消费者经典实现本身不会死锁，无需处理）

> ✅ **已实现**: 生产者-消费者模拟、信号量可视化（full/empty/mutex 实时百分比进度条）、缓冲区网格（emoji + slot 索引 + 可配 2-8）、生产者/消费者指针箭头、播放/暂停/步进/重置控制、速度选择（0.5x/1x/2x）、可配参数滑块（缓冲区大小/生产间隔/消费间隔）、操作日志（自动滚动/彩色行/时间戳）、等待队列显示。

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/sync-viz/sync-viz.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/semaphore.js` | 新增 | 信号量数据结构 + P/V 操作 |
| `utils/producer-consumer.js` | 新增 | 生产者消费者模拟引擎 |
| `utils/tool-registry.js` | 修改 | `sync-viz.available = true` |
| `app.json` | 修改 | 注册 `pages/sync-viz/sync-viz` |
| `tests/utils/semaphore.test.js` | 新增 | 信号量 P/V 操作单测 |
| `tests/utils/producer-consumer.test.js` | 新增 | 生产消费流程单测 |
| `docs/handoff/modules/sync-viz.md` | 新增 | 模块专题文档 |

> ✅ **已实现**: 所有 8 个文件已创建并注册。页面可在工具列表中看到并成功导航。

## 4. 核心交互

```
┌─ 参数配置 ────────────────────────────────────┐
│  缓冲区大小: [6]  生产间隔: [3s]  消费间隔: [5s]  │
├─ 状态面板（实时） ─────────────────────────────┤
│  缓冲区                               信号量    │
│  ┌──┬──┬──┬──┬──┬──┐                ┌──────┐  │
│  │🍎│  │🍊│🍇│  │  │    full: 3    │ ⬛⬜⬜│  │
│  ├──┴──┴──┴──┴──┴──┤    empty: 3    │      │  │
│  │ 生产者 → 放入 🍎  │    mutex: 1   │      │  │
│  └───────────────────┘               └──────┘  │
├─ 操作日志 ────────────────────────────────────┤
│  [t=0] 生产者 P(mutex)  → 1→0                  │
│  [t=0] 生产者 P(empty)  → 3→2 ✓               │
│  [t=0] 生产者 生产 🍎   → 放入 slot 0          │
│  [t=0] 生产者 V(mutex)  → 0→1                  │
│  [t=0] 生产者 V(full)   → 2→3                  │
│  [t=3] 消费者 P(mutex)  → 1→0                  │
│  [t=3] 消费者 P(full)   → 3→2 ✓               │
│  [t=3] 消费者 消费 🍎   → 从 slot 0 取出        │
│  [t=3] 消费者 V(mutex)  → 0→1                  │
│  [t=3] 消费者 V(empty)  → 3→4                  │
└────────────────────────────────────────────────┘
```

用户通过滑块配置缓冲区大小和生产/消费速度，点击 ▶ 后动画自动运行。左侧展示环形缓冲区内容变化，右侧展示信号量数值条（full/empty/mutex），底部是详细操作日志（每个 P/V 操作的执行前后数值）。步进模式下用户逐条执行，停在每个 P/V 操作观察变化。

> ✅ **已实现**: 步进按每次 P/V 操作粒度执行（非整个生产/消费周期），每次步进在日志中新增一行并更新信号量值。阻塞的生产者/消费者显示灰色箭头 + "⏳" 动画。

## 5. 数据模型 / 核心逻辑

```js
// 信号量
class Semaphore {
  constructor(value) {
    this.value = value;   // 当前值
    this.initial = value; // 初始值
    this.history = [];    // 变更记录
  }
}

// P 操作（wait）
function semWait(semaphore, owner):
  // semaphore.value--
  // if semaphore.value < 0 → 将 owner 加入等待队列
  // 返回 { newValue, blocked: boolean }

// V 操作（signal）
function semSignal(semaphore):
  // semaphore.value++
  // if semaphore.value <= 0 → 唤醒等待队列中的一个
  // 返回 { newValue, woken: processId|null }

// 生产者-消费者模拟
{
  buffer: Array(6).fill(null),    // 环形缓冲区，null 表示空
  producerIndex: 0,               // 生产者写指针
  consumerIndex: 0,               // 消费者读指针
  semaphores: {
    full: { value: 0 },           // 已满 slot 数
    empty: { value: 6 },          // 空闲 slot 数
    mutex: { value: 1 }           // 互斥锁
  },
  steps: [],                      // 操作历史
  running: false                  // 运行状态
}
```

> ✅ **已实现**: `Semaphore` 类支持 `value` / `initial` / `history`，P 操作（`semWait`）返回阻塞状态，V 操作（`semSignal`）返回唤醒信息。生产者-消费者引擎基于不可变更新，每次操作返回新状态副本。

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 缓冲区大小 < 2 | 滑块最小 2，小于自动修正 |
| 缓冲区大小 > 8 | 滑块最大 8，超出自动修正 |
| 生产 / 消费间隔为 0 | 间隔最小 1，小于自动修正 |
| 缓冲区满生产者尝试 P(empty) | 正常阻塞，在日志中用黄色标记 "阻塞等待 empty" |
| 缓冲区空消费者尝试 P(full) | 正常阻塞，在日志中用黄色标记 "阻塞等待 full" |
| 重置时动画正在运行 | 立即停止动画，清空缓冲区，信号量回到初始值 |

> ✅ **已实现**: 所有错误处理场景均已覆盖。阻塞日志以黄色标记（非红色），符合 spec 要求。

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/semaphore.test.js` | P 操作值递减 + 等待队列、V 操作值递增 + 唤醒、初始值设置、连续 P/V 的阻塞/唤醒顺序 |
| `tests/utils/producer-consumer.test.js` | 生产流程完整步骤、消费流程完整步骤、缓冲区满时生产者阻塞、缓冲区空时消费者阻塞、多步交替执行正确性 |

**关键测试用例**：

```js
// 信号量
sem = new Semaphore(1)
semWait(sem, 'P1')  // value: 0, not blocked
semWait(sem, 'P2')  // value: -1, P2 blocked
semSignal(sem)      // value: 0, wakes P2

// 生产者-消费者：buffer=3, 初始 empty=3, full=0
// 生产者执行三步：生产 3 个 → buffer 满 → 第 4 步 P(empty) 阻塞
// 消费者执行一步：P(full) → 消费 → V(empty) → 释放一个空槽
```

覆盖率目标 ≥ 80%。所有测试必须通过 `npm test`。

> ✅ **已实现**: `tests/utils/semaphore.test.js` 和 `tests/utils/producer-consumer.test.js` 均已编写并通过 `npm test`。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布（`#faf9f5` 背景 / `#efe9de` 卡片 / `#cc785c` CTA / Georgia 衬线标题）。 ✅
2. **纯函数优先**：`semaphore.js` / `producer-consumer.js` 全部无副作用（Semaphore 构造器和 P/V 操作以不可变方式返回新状态）。 ✅
3. **信号量可视化**：使用横向进度条表示信号量值，full 绿色 / empty 蓝色 / mutex 橙色，值变化时 WXSS `transition` 动画过渡。 ✅
4. **缓冲区渲染**：环形缓冲区用横向 `<scroll-view>` 展示，每个 slot 为固定宽度的 `<view>`，填入的内容用 emoji 图标示意。 ✅
5. **操作日志**：底部 `<scroll-view>` 自动滚动到最新条目，每条日志左对齐显示时间戳 + 操作 + 值变化。 ✅
6. **更新 PROJECT_HANDOFF**：完成时追加变更记录。 ✅

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| 信号量等待队列的动画表现抽象 | 等待队列以列表展示在信号量条下方，标注 "P2 阻塞中" | ✅ 已实现 |
| 步进模式与自动播放模式的状态同步 | 统一使用 step 队列，两种模式只是触发方式不同 | ✅ 已实现 |
| 缓冲区满/空时的阻塞表现不够直观 | 阻塞时生产者/消费者的图标变成灰色 + "⏳" 动画，直到被唤醒 | ✅ 已实现 |

未来可拓展：
- 多生产者 / 多消费者场景
- 读者-写者问题（读优先 / 写优先可配）
- 哲学家就餐问题（Dijkstra 解法）
- 管程（Monitor）的 Condition Variable 模拟

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-19-sync-viz.md`，按 RED → GREEN → IMPROVE 分阶段实施。

> ✅ **已实现**: 所有阶段已完成。参见 `docs/plans/2026-07-19-sync-viz.md` 及模块文档 `docs/handoff/modules/sync-viz.md`。
