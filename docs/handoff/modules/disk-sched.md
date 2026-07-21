# 磁盘调度可视化 — 模块文档

**上线日期:** 2026-07-21

## 概述

磁盘调度可视化工具，展示 SCAN / C-SCAN / LOOK / C-LOOK 四种算法在磁道间的移动路径与性能对比。

## 页面

`package-tools/disk-sched/disk-sched`

## 核心逻辑

`utils/disk-scheduling.js` — 4 个调度算法 + 对比函数，纯函数无副作用。

| 函数 | 说明 |
|---|---|
| `scan(requests, start, direction)` | 电梯算法，扫到底再反向 |
| `cScan(requests, start, direction)` | 循环扫描，跳回对侧起点 |
| `look(requests, start, direction)` | 到最远请求即转向 |
| `cLook(requests, start, direction)` | 循环到最远请求，跳回对侧 |
| `compareAlgorithms(reqs, start, names)` | 多算法同参数对比 |

## 交互

- 输入柱面序列（逗号分隔或随机生成）
- 配置磁头起点和方向
- 4 种算法一键切换
- ▶ 播放 / ⏸ 暂停 / 步进 / ↻ 重置
- 动画结束后自动进行 4 算法对比

## 数据约束

- 柱面范围 0~199
- 请求上限 15 个
- 磁头起点 ≥ 0

## 测试

`tests/utils/disk-scheduling.test.js` — 全量算法 + 对比函数单元测试。
