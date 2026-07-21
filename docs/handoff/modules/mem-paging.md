# 内存分页可视化 — 模块文档

**上线日期:** 2026-07-21

## 概述

内存分页可视化工具，模拟逻辑地址到物理地址的转换过程，展示页表查询、缺页中断、LRU/FIFO 页面置换算法的行为差异。

## 页面

`package-tools/mem-paging/mem-paging`

## 核心逻辑

### `utils/paging.js` — 地址转换 + 页表管理

| 函数 | 说明 |
|---|---|
| `decomposeAddress(address, pageSize)` | 将逻辑地址分解为页号 + 偏移量 |
| `queryPageTable(pageTable, pageNumber)` | 查询页表，返回是否命中及页表条目 |
| `pagingTransform(addresses, pageSize, pageTable, algorithm, frameCount, lruFn, fifoFn)` | 完整地址转换流程，返回逐步骤结果 |

### `utils/page-replacement.js` — 置换算法

| 函数 | 说明 |
|---|---|
| `lruReplacement(pageTable, accessHistory, frameCount)` | LRU 置换：淘汰最久未访问的页面 |
| `fifoReplacement(pageTable, loadOrder, frameCount)` | FIFO 置换：淘汰最早加载的页面 |

## 交互

- 配置页大小（64~4096 B）、帧数（2~8 帧）、置换算法（LRU/FIFO）
- 输入逻辑地址序列（十六进制，空格分隔，随机生成）
- ▶ 播放 / ⏸ 暂停 / 步进 / ↻ 重置
- 地址分解展示（逻辑地址 → 页号 + 偏移量）
- 页表可视化（页号/帧号/有效位/访问位）
- 命中/缺页状态 + 置换提示
- Timeline 地址序列点击跳转
- 缺页率实时计算

## 数据约束

- 页大小范围 64~4096 B，必须是 2 的幂
- 帧数 2~8
- 地址上限 20 个
- 地址使用十六进制输入

## 测试

`tests/utils/paging.test.js` — 地址分解、页表查询、完整地址转换流程
`tests/utils/page-replacement.test.js` — LRU/FIFO 置换算法单元测试
