# 内存分页可视化 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`mem-paging` 占位）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **内存分页** 可视化教学页面：用户配置页大小与页表条目，模拟逻辑地址到物理地址的转换过程，观察缺页中断及 LRU/FIFO 置换算法的行为差异，帮助 OS 学习者直观理解分页内存管理。

## 2. 范围

包含：
- 手动输入 / 随机生成逻辑地址序列，模拟地址转换全过程
- 页表可视化：页号 → 帧号映射，有效位 / 访问位等标志展示
- 缺页中断模拟：地址转换遇到缺页 → 从磁盘换入页面
- LRU 与 FIFO 两种页面置换算法，对比缺页率
- 逐步骤动画：▶ 播放 / ⏸ 暂停 / 步进 / ↻ 重置

不包含（明确不做）：
- 请求分页的写时复制（COW）模拟
- 多级页表 / 倒排页表（仅单级页表）
- TLB（快表）模拟（预留扩展）
- 页面大小的动态切换（仅固定页大小，页大小 4KB 为默认）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/mem-paging/mem-paging.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/paging.js` | 新增 | 地址转换 + 页表管理纯函数 |
| `utils/page-replacement.js` | 新增 | LRU / FIFO 置换算法 |
| `utils/tool-registry.js` | 修改 | `mem-paging.available = true` |
| `app.json` | 修改 | 注册 `pages/mem-paging/mem-paging` |
| `tests/utils/paging.test.js` | 新增 | 地址转换 + 页表操作单测 |
| `tests/utils/page-replacement.test.js` | 新增 | LRU / FIFO 置换单测 |
| `docs/handoff/modules/mem-paging.md` | 新增 | 模块专题文档 |

## 4. 核心交互

```
┌─ 配置 ──────────────────────────────────┐
│  页大小: [256] B  页表大小: [4 页]  🎲随机  │
├─ 逻辑地址输入 ───────────────────────────┘
│  0x003F  0x00A2  0x01FF  0x0004  [+]
├─ 地址转换动画 ───────────────────────────┘
│  逻辑 0x00A2 → 页号 2，偏移 0x02
│          ↓ 查页表
│  页表 [0→5] [1→3] [2→✓] [3→✗]
│                   ↓ 缺页! 执行 LRU 置换
│  物理帧 8 + 偏移 0x02 → 物理地址 0x0802
├─ 性能指标 ───────────────────────────────┘
│  缺页率: 2/5 (40.0%)
│  算法: [LRU] [FIFO]  对比: LRU 4.0% ▾
└─────────────────────────────────────────
```

用户输入逻辑地址序列（十六进制或十进制），页面以步骤动画展示：地址分解（页号 + 偏移量）、查页表命中 / 缺页、缺页时 LRU/FIFO 选帧置换、组装物理地址。底部显示缺页率实时变化。

## 5. 数据模型 / 核心逻辑

```js
// 页表条目
{
  pageNumber: number,      // 页号
  frameNumber: number|null,// 帧号，null 表示缺页
  valid: boolean,          // 有效位
  accessed: boolean,       // 访问位（LRU 使用）
  loaded: number           // 加载顺序（FIFO 使用）
}

// 地址转换请求
{
  logicalAddress: number,  // 逻辑地址
  pageNumber: number,      // 分解后的页号
  offset: number,          // 页内偏移
  physicalAddress: number|null, // 转换结果
  hit: boolean             // 是否缺页
}

// 算法输出
function pagingTransform(addresses, pageSize, pageTable, algorithm):
  // 1. 每个地址 → 页号 + 偏移
  // 2. 查页表：valid ? 命中 : 缺页
  // 3. 缺页 → 调用置换算法
  // 4. 返回 [step1, step2, ..., stepN]
  // 每个 step: { address, pageNumber, offset, frame, ok, pageTableSnapshot }

function lruReplacement(pageTable, frameCount, accessSequence):
  // 置换最久未访问的帧
  // 返回 evictedPage, newFrame

function fifoReplacement(pageTable, frameCount, loadOrder):
  // 置换最早加载的帧
  // 返回 evictedPage, newFrame
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 地址序列为空 | 禁用 ▶ 按钮，提示 "请添加地址" |
| 页大小不是 2 的幂 | input 校验提示 "页大小必须是 2 的幂" |
| 页大小 < 16 B 或 > 4096 B | 滑块限制范围，超出自动修正 |
| 逻辑地址超过页表范围 | 提示 "地址超出页表范围" |
| 动画中切换置换算法 | 提示 "请先重置" |
| 所有帧都已填充但缺页循环 | 按算法置换后正常执行，不做特殊判断 |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/paging.test.js` | 地址分解（页号+偏移）、页表查询命中/缺页、完整地址转换链 |
| `tests/utils/page-replacement.test.js` | LRU 访问序列排序、FIFO 加载顺序出队、相同缺页率时两种算法输出差异 |

**关键测试用例**：

```js
// 地址分解
pageSize = 256  // 8 位偏移
address = 0x00A2  // 页号 2，偏移 0x02

// LRU vs FIFO：4 帧，序列 [1,2,3,4,1,5,1,2,3,4]
// LRU 缺页率 50.0%，FIFO 缺页率 60.0%

// 缺页中断
pageTable = [{ page:0, frame:1, valid:true }, { page:1, frame:null, valid:false }]
query(page=1) → { hit: false, fault: true }
```

覆盖率目标 ≥ 80%。所有测试必须通过 `npm test`。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布（`#faf9f5` 背景 / `#efe9de` 卡片 / `#cc785c` CTA / Georgia 衬线标题）。
2. **纯函数优先**：`paging.js` / `page-replacement.js` 全部无副作用。
3. **地址转换可视化**：使用嵌套 `<view>` 展示页号与偏移的位分解，不同颜色区分。
4. **动画**：WXSS `transition` 控制页表条目高亮与帧分配过程。
5. **地址序列上限**：最多 20 个地址（不含随机生成的数量限制）。
6. **更新 PROJECT_HANDOFF**：完成时追加变更记录。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| LRU 实现复杂度（需完整访问历史） | 使用计数器式 LRU（counter per page） |
| 地址分解可视化对用户理解门槛较高 | 在分解步骤旁标注二进制位分割示意 |
| 页表条目较多时 UI 拥挤 | 页表大小上限 8 帧，超出滚动显示 |

未来可拓展：
- TLB 快表模拟
- 多级页表可视化
- 写时复制（COW）演示
- 页面大小可调并展示影响

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-19-mem-paging.md`，按 RED → GREEN → IMPROVE 分阶段实施。
