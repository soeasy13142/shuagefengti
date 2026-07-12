# DNS 解析可视化（DNS Visualization）

> 由 `2026-07-12-dns-resolver-design.md` spec 实施落盘。

## 概览

交互式展示 DNS 域名解析过程：完整递归查询链 + 缓存命中场景 + CNAME 链场景，参照 TCP-viz 的 step-by-step 动画风格。

## 数据驱动

- `utils/dns-data.js`：13 个根服务器 + 6 个 TLD + 6 个权威域名（内置真实 IP，无外部网络请求）
- `utils/dns-cache.js`：LRU 缓存（容量 50，TTL 默认 300s）
- `utils/dns-resolver.js`：`resolveSteps({ domain, scenario, cache })` → `Step[]`，纯函数无副作用

## 场景

| 场景 | step 数 | 说明 |
|---|---|---|
| 首次查询 | 8 | 客户端 → 解析器 → 根 → TLD → 权威 → 解析器 → 客户端 |
| 再次查询命中缓存 | 1 | 解析器直接返回缓存 |
| CNAME 链 | 6 | www.example.com → example.com 的两步查询 |

## 测试

`tests/utils/{dns-data,dns-cache,dns-resolver}.test.js` 全覆盖。`npm test` 全绿。
