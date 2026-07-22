# DH 密钥交换（Diffie-Hellman Key Exchange）

> 由 `2026-07-19-dh-viz-design.md` spec 实施落盘。

## 概览

Diffie-Hellman 密钥交换协议的可视化教学页面：设定公共参数（素数 p、本原根 g），模拟 Alice 和 Bob 从生成私钥到共享密钥的完整过程，并展示离散对数搜索难度和中间人攻击。

## 数据驱动

- `utils/dh-core.js`：本原根判定 / 密钥对生成 / 共享密钥计算 / 离散对数暴力搜索
- `utils/dh-mitm.js`：MITM 攻击场景模拟
- `utils/dh-core.js` 内置 `modPow`（快速模幂运算）

## 特性

| 特性 | 说明 |
|---|---|
| 公共参数 | 素数 p 下拉 + 本原根 g 自动计算列表 |
| 双方面板 | Alice/Bob 私钥、公钥、共享密钥完整计算过程 |
| MITM 模拟 | Eve 拦截公钥并替换，展示密钥不一致 |
| 离散对数 | 暴力搜索 g^x ≡ A 的过程动画 + 进度条 |
| 步进控制 | 前/后/自动播放，公钥交换过程动画 |

## 注意事项

- 复用 `utils/dh-core.js` 内置的 `modPow`，未提取到公共模块（`utils/rsa-core.js` 不存在）
- 验证发现 `isPrimitiveRoot(6, 13)` 和 `isPrimitiveRoot(7, 13)` 均为 `true`（6 和 7 是模 13 的本原根，`findPrimitiveRoots(13)` 结果为 `[2, 6, 7, 11]`）
- 离散对数测试向量：`bruteForceDiscreteLog(7, 997, 312)` 找到 `x=193`，而非第 123 次迭代
- 本原根判定算法：对 p-1 的每个素因子 q，检查 g^((p-1)/q) ≠ 1 mod p
- p ≤ 997 小素数限制，暴力搜索在合理时间内完成
