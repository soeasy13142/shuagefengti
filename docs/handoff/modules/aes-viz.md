# AES 演示（AES Visualization）

> 由 `2026-07-19-aes-viz-design.md` spec 实施落盘。

## 概览

AES-128 加密算法的交互式教学页面：输入 16 字节明文和密钥，逐轮展示 SubBytes、ShiftRows、MixColumns、AddRoundKey 四步操作及密钥扩展的完整过程。

## 数据驱动

- `utils/aes-core.js`：S-box（FIPS 197 Figure 7）、GF(2^8) 乘法、hex 工具
- `utils/aes-state.js`：State 矩阵操作（subBytes/shiftRows/mixColumns/addRoundKey）
- `utils/aes-key-expansion.js`：密钥扩展 W[0..43] 生成

## 特性

| 特性 | 说明 |
|---|---|
| AES-128 | ECB 模式，FIPS 197 兼容，10 轮加密 |
| 逐步展示 | SubBytes → ShiftRows → MixColumns → AddRoundKey，每步 State 快照 |
| 步进控制 | 轮次前进/后退，子步单步 |
| 密钥扩展 | W[0..43] 44 个字，区分 direct 和 rotSubRcon 类型 |
| 预设向量 | FIPS 197 标准向量、全零、全 0xFF |
| 已知向量验证 | FIPS 197 Appendix B/C 全测试通过 |
