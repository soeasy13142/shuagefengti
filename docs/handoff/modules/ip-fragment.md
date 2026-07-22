# IP 分片可视化 — 模块文档

**上线日期:** 2026-07-22

## 概述

IP 分片与重组的可视化教学工具，展示 IP 层如何将超大数据报切分为多个分片（标识符、标志位、片偏移三字段的变化），以及接收端如何根据分片偏移重组。

## 页面

`pages/ip-fragment/ip-fragment`

## 核心逻辑

| 文件 | 说明 |
|---|---|
| `utils/ip-fragment.js` | `fragment(datagramSize, mtu)` — 分片计算，返回分片列表含 ID/MF/偏移 |
| `utils/ip-reassemble.js` | `reassemble(fragments)` — 重组逻辑，返回合并动画步骤 |

## 交互

- 双滑块调节报文大小（100~65535）和 MTU（68~2000）
- 实时参数展示：IP 头部 20 字节 / 每片载荷 / 预估分片数
- 「分片」按钮触发计算，展示分片列表
- 可折叠面板展示偏移量计算过程
- 「重组回放」自最后一片开始逐步合并动画
- 手动步进 / 自动播放控制

## 数据约束

- 报文大小 clamp 到 65535
- MTU clamp 到 68（IPv4 最小 MTU）
- 片偏移 = 起始字节 ÷ 8（8 字节对齐）
- IP 头部固定 20 字节

## 测试

`tests/utils/ip-fragment.test.js` — 边界值、偏移量对齐、MF 标志正确性
`tests/utils/ip-reassemble.test.js` — 重组完整性、合并步骤正确性
