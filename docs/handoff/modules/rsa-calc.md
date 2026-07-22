# RSA 演算器（RSA Calculator）

> 由 `2026-07-19-rsa-calc-design.md` spec 实施落盘。

## 概览

RSA 密码算法的交互式教学工具：输入素数 p/q 生成密钥对，加密/解密短消息，展示欧拉函数、扩展欧几里得、快速幂等数论计算的中间过程。

## 数据驱动

- `utils/rsa-primes.js`：内置素数表（2-997，共 168 个）
- `utils/rsa-core.js`：纯函数集合（isPrime / gcd / extendedGcd / modPow / modInverse / generateKeypair / encrypt / decrypt）

## 特性

| 特性 | 说明 |
|---|---|
| 密钥生成 | 素数校验 + p/q 不同校验，自动计算 n/phi/e/d |
| 加密/解密 | 数值或 ASCII 文本，模幂过程逐位展开 |
| 数论细节 | phi 计算 + 扩展欧几里得求模逆 + 快速幂二进制分解 |
| 弱密钥检测 | Wiener 攻击条件提示（d 过小） |
| 演示限制 | p/q ≤ 997，教科式 RSA（无 OAEP） |
