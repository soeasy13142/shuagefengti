# SHA-256 演示（SHA-256 Visualization）

> 由 `2026-07-12-sha256-design.md` spec 实施落盘。

## 概览

交互式展示 SHA-256 哈希算法的完整 64 轮压缩函数 trace：消息扩展 W[0..63]、a-h 8 个寄存器、T1/T2 中间值、雪崩效应（1-bit 差异输入 → ~50% hash 位差异）。

## 数据驱动

- `utils/sha256.js`：FIPS 180-4 §6.2 兼容实现，32-bit 无符号算术（`(x + y) >>> 0`），无 BigInt
- `utils/sha256-trace.js`：64 轮 trace 记录器 + `hammingDistance` 工具
- `utils/sha256-avalanche.js`：1-bit 翻转 + 雪崩报告

## 特性

| 特性 | 说明 |
|---|---|
| 任意文本输入 | UTF-8 编码，最大 100KB |
| 64 轮 trace | W[0..63] + 8 寄存器 + T1/T2 + K[t]，最后一 block 完整可见 |
| 步进控制 | 前 / 后 / 跳轮（显示当前轮 W 高亮） |
| 连续播放 | 速度 0.5x / 1x / 2x |
| 雪崩对比 | 自动翻转第 1 bit，逐位标红对比 |
| 已知向量 | FIPS 180-4 附录 B 全测试通过 |

## 测试

`tests/utils/{sha256,sha256-trace,sha256-avalanche}.test.js` 全覆盖。`npm test` 全绿。
