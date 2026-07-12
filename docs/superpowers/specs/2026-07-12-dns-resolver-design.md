# DNS 解析可视化 · 设计文档

> 日期：2026-07-12
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js` (`dns-viz` 占位)、`app.json`、`docs/handoff/future-plans.md`

## 1. 目标

为「刷个冯题」小程序新增一个 **DNS 域名解析过程**的可视化教学页面：用户输入域名，可看到从客户端到根服务器 → TLD → 权威服务器的完整查询链路（含缓存命中场景），帮助 CS 学习者直观理解 DNS 协议的工作机制。

## 2. 范围

包含：
- 完整递归 / 迭代查询链路的 step-by-step 动画
- 内置 13 个根服务器 + 6 个常见 TLD（.com/.org/.cn/.io/.net/.edu）+ 5 个示例权威域名
- 解析器 LRU 缓存层（含 cache hit 场景）
- 3 种场景：首次查询 / 再次查询命中缓存 / CNAME 链
- 每步骤的 Query / Response payload 简化展示
- 关键节点的「考试提示」(`examTip`)

不包含（明确不做）：
- 真实 DNS 网络请求（小程序无网络权限且会引入超时/重试复杂度）
- DNS 安全扩展（DNSSEC、DoH、DoT）
- 国际化（DNS over QUIC 等）
- 任意 TLD 全覆盖（仅内置 6 个，未命中时 fallback `.com`）
- DNS 报文二进制解析（用简化字段展示）

## 3. 架构

新增 / 修改文件：

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/dns-viz/dns-viz.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/dns-resolver.js` | 新增 | 纯函数：生成 step[] |
| `utils/dns-data.js` | 新增 | 内置 DNS 服务器数据 |
| `utils/dns-cache.js` | 新增 | LRU 缓存（独立模块） |
| `utils/tool-registry.js` | 修改 | `dns-viz.available = true` |
| `app.json` | 修改 | 注册 `pages/dns-viz/dns-viz` |
| `tests/utils/dns-resolver.test.js` | 新增 | resolveSteps 单测 |
| `tests/utils/dns-cache.test.js` | 新增 | LRU 单测 |
| `tests/utils/dns-data.test.js` | 新增 | 数据完整性测 |
| `docs/handoff/modules/dns-viz.md` | 新增 | 模块专题文档 |

## 4. 组件

### 4.1 输入条
- 域名 `input`：占位符 `example.com`
- 场景下拉：3 选项（首次查询 / 再次查询命中缓存 / CNAME 链）
- 按钮：▶ 开始 / ↻ 重置 / ⏸ 暂停 / 上一步 / 下一步

### 4.2 主视图（5 条水平泳道）

```
┌────────────────────────────────────────────────────────┐
│ Client (192.168.1.1)                                  │
├────────────────────────────────────────────────────────┤
│ Recursive Resolver (8.8.8.8)                          │
├────────────────────────────────────────────────────────┤
│ Root Server (a.root-servers.net · 198.41.0.4)         │
├────────────────────────────────────────────────────────┤
│ TLD Server (.com) (192.5.6.30)                        │
├────────────────────────────────────────────────────────┤
│ Authoritative (example.com) (93.184.216.34)           │
└────────────────────────────────────────────────────────┘
```

泳道头部显示服务器名 + IP。报文以曲线动画从源泳道流向目标泳道。

### 4.3 报文流动画
- `query` 蓝色箭头（向下） · `response` 绿色箭头（向上） · `cacheHit` 红色高亮
- 曲线动画通过 WXML `animation` 实现，600ms / step

### 4.4 右侧详情面板
当前步骤的 Query / Response payload（简化展示）：
- DNS Header（ID, RD/RAC, QD/AN/NS/AR counts）
- Question（QNAME, QTYPE, QCLASS）
- Answer（NAME, TYPE, CLASS, TTL, RDATA）
- 关键字段高亮（与 `highlight` 数组对应）

### 4.5 底部进度条
- 步骤序号 / 总步骤数
- 当前步骤的文案说明
- `examTip` 折叠面板（如 "为什么 TTL 影响缓存？"）

## 5. 数据流

```text
用户输入 { domain, scenario }
  ↓
dns-resolver.resolveSteps({ domain, scenario, cache })
  ├─ 校验 domain（utils/util.js 已有 validateDomain 思路）
  ├─ 检查 cache：
  │    ├─ 命中 → 1 step：{ type: 'cacheHit', ... }
  │    └─ 未命中 → 进入完整链路
  ├─ 完整链路（递归模式）：
  │    Client → Resolver.query(根)
  │    Resolver → Root.query
  │    Root → Resolver.response（返回 .com TLD 列表）
  │    Resolver → TLD.query
  │    TLD → Resolver.response（返回 example.com NS）
  │    Resolver → Authoritative.query
  │    Authoritative → Resolver.response（返回 A 记录）
  │    Resolver → Client.response（最终结果）
  │    Resolver.cache.set(domain, { ip, ttl })
  │    返回 step[]（8-10 steps）
  └─ CNAME 场景：在 Authoritative 步骤后插入额外 CNAME 跳转
  ↓
页面拿到 step[]，按 600ms/步播放动画
  ├─ 每步更新报文动画
  ├─ 更新右侧详情面板
  └─ 结束时显示总耗时 + 缓存命中率
```

`Step` 数据结构：

```js
{
  step: number,           // 序号
  from: string,           // 源泳道 key
  to: string,             // 目标泳道 key
  type: 'query' | 'response' | 'cacheHit',
  payload: {              // 简化展示
    header: { id, rd, rac, qdcount, ancount },
    question?: { qname, qtype, qclass },
    answer?: { name, type, class, ttl, rdata }
  },
  durationMs: number,     // 此步耗时
  explanation: string,    // 文案
  examTip?: string,       // 面试考点（可选）
  highlight: string[]     // 高亮字段名
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 域名非法（不匹配 `/^([a-z0-9-]+\.)+[a-z]{2,}$/i`） | toast "请输入合法域名"，不开始动画 |
| TLD 不在 `DNS_TLD_SERVERS` | fallback 到 `.com` 链路 + 文案 "演示模式：未覆盖 TLD（{tld}）" |
| 查询过程中 cache 被外部清空 | catch 后显示 "缓存异常" 错误步骤 |
| 动画进行中用户再次点击 ▶ 开始 | 忽略点击 + toast "请先重置" |
| 域名查询递归过深（防御） | 限制最大递归 5 层，超出报错 |
| 缓存容量满 | LRU 淘汰最旧条目（utils/dns-cache.js 内部处理） |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/dns-resolver.test.js` | step 生成（递归 vs 缓存 hit vs CNAME）、step 字段完整性、payload 结构、durationMs 累加 |
| `tests/utils/dns-cache.test.js` | LRU 命中 / 淘汰 / 容量边界（0/1/50/51）、TTL 过期处理 |
| `tests/utils/dns-data.test.js` | 13 个根服务器 IP 合法（IPv4 格式）、TLD 列表完整、权威数据非空 |
| `tests/pages/dns-viz.test.js`（可选） | 页面初始化、缓存注入交互 |

所有测试必须通过 `npm test`；覆盖率目标 ≥ 80%。

## 8. 实施注意事项

1. **风格统一**：完全遵循 Claude Design 暖奶油画布（`#faf9f5` 背景 / `#efe9de` 卡片 / `#cc785c` CTA / Georgia 标题）。深色科技风已废弃。
2. **纯函数优先**：`dns-resolver.js` / `dns-cache.js` / `dns-data.js` 全部无副作用，便于测试。
3. **动画规范**：使用 WXML `animation` + WXSS `transition`，**不**引入第三方动画库。
4. **错误信息**：UI 面向用户用中文，console 用英文；不带敏感数据。
5. **不主动 push**：本地 commit 后等用户决定是否 push。
6. **更新 PROJECT_HANDOFF**：完成时追加变更记录到 `docs/handoff/decisions.md` / `future-plans.md`，新建 `docs/handoff/modules/dns-viz.md`。

## 9. 风险与未来工作

| 风险 | 缓解 |
|---|---|
| 内置数据量维护成本（新增 TLD 需手动加） | 仅覆盖最常见的 6 个 TLD，其他 fallback `.com` |
| CNAME 链场景实现复杂度 | 第一版仅支持 1 层 CNAME，多层进 backlog |
| 真实 DNS 报文格式教学价值更高 | 留待第二版（需要二进制解析），当前版本用简化字段 |
| 缓存策略教学价值（TTL 过期） | 第一版 LRU + 固定 TTL，第二版考虑时间衰减 |

未来可拓展：
- DNSSEC 验证链动画
- DNS over HTTPS / TLS 模式切换
- 多语言（i18n，P6 future-plans）

## 10. 实施路线

按 `superpowers:writing-plans` 输出独立 plan `docs/plans/2026-07-12-dns-resolver.md`，按 RED → GREEN → IMPROVE 分阶段实施。