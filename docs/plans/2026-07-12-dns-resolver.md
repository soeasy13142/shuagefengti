# DNS 解析可视化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `pages/dns-viz/` 页面，演示 DNS 域名解析的完整递归 / 迭代查询链（含缓存命中 / CNAME 链场景）。

**Architecture:** 纯前端 + 3 个 utils 纯函数模块（dns-data / dns-cache / dns-resolver）+ 1 个页面（4 文件：js/wxml/wxss/json）。WXML/WXSS 实现动画，不引第三方库。Jest 全测。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest + CommonJS（require/module.exports）。

**Spec:** `docs/superpowers/specs/2026-07-12-dns-resolver-design.md`

## Global Constraints

- 所有代码使用 `const`/`let`，**禁用 `var`**（CLAUDE.md §代码风格）
- 文件命名：小写 + kebab-case（CLAUDE.md §命名约定）
- 私有函数 / 模块状态：`_underscore` 前缀
- 异步优先：`Promise` / `async-await`
- 错误处理：所有 `catch` 必须显式处理或 `throw`，禁止静默吞
- 注释：`/** */` JSDoc 用于公开 API；行内 `//` 仅用于解释 why
- 测试命令：`cd /Users/charliepan/Downloads/my-miniapp && npm test`（必须全绿）
- 设计风格：Claude Design 暖奶油画布（背景 `#faf9f5`、卡片 `#efe9de`、CTA `#cc785c`、Georgia 标题；CLAUDE.md §设计风格约束）
- 不引入第三方依赖（无新 npm 包）
- 中文 UI 文案；变量名 / 函数名 / 注释 / commit 英文

---

## Task 1: 内置 DNS 数据模块

**Files:**
- Create: `utils/dns-data.js`
- Test: `tests/utils/dns-data.test.js`

**Interfaces:**
- Consumes: 无
- Produces:
  - `DNS_ROOT_SERVERS`: `Array<{ name: string, ipv4: string }>` （13 个）
  - `DNS_TLD_SERVERS`: `Record<string, Array<{ name: string, ipv4: string }>>`（按 TLD key）
  - `DNS_AUTHORITATIVE_SERVERS`: `Record<string, { name: string, ipv4: string, cname?: string }>`（按 domain key）

- [ ] **Step 1: Write failing test**

`tests/utils/dns-data.test.js`:

```js
const data = require('../../utils/dns-data');

describe('DNS_ROOT_SERVERS', () => {
  test('contains exactly 13 root servers (a.root-servers.net through m.root-servers.net)', () => {
    expect(data.DNS_ROOT_SERVERS).toHaveLength(13);
    const names = data.DNS_ROOT_SERVERS.map(r => r.name);
    for (const letter of 'abcdefghijklm') {
      expect(names).toContain(`${letter}.root-servers.net`);
    }
  });

  test('each root server has a valid IPv4 address', () => {
    for (const r of data.DNS_ROOT_SERVERS) {
      expect(r.ipv4).toMatch(/^\d{1,3}(\.\d{1,3}){3}$/);
      const parts = r.ipv4.split('.').map(Number);
      expect(parts.every(p => p >= 0 && p <= 255)).toBe(true);
    }
  });
});

describe('DNS_TLD_SERVERS', () => {
  test('contains the 6 supported TLDs: com, org, cn, io, net, edu', () => {
    const expected = ['com', 'org', 'cn', 'io', 'net', 'edu'];
    for (const tld of expected) {
      expect(data.DNS_TLD_SERVERS[tld]).toBeDefined();
      expect(data.DNS_TLD_SERVERS[tld].length).toBeGreaterThan(0);
    }
  });
});

describe('DNS_AUTHORITATIVE_SERVERS', () => {
  test('contains at least 5 example domains', () => {
    expect(Object.keys(data.DNS_AUTHORITATIVE_SERVERS).length).toBeGreaterThanOrEqual(5);
  });

  test('each entry has a name and IPv4', () => {
    for (const [domain, info] of Object.entries(data.DNS_AUTHORITATIVE_SERVERS)) {
      expect(info.name).toBeTruthy();
      expect(info.ipv4).toMatch(/^\d{1,3}(\.\d{1,3}){3}$/);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/dns-data.test.js`
Expected: FAIL with "Cannot find module '../../utils/dns-data'"

- [ ] **Step 3: Implement `utils/dns-data.js`**

```js
/**
 * DNS 内置数据
 *
 * 13 个根服务器 + 6 个常见 TLD + 5+ 个示例权威域名
 * 第一版使用真实 IP（基于 IANA / Wikipedia 公开数据），但避免使用任何外部网络
 */

const DNS_ROOT_SERVERS = [
  { name: 'a.root-servers.net', ipv4: '198.41.0.4' },
  { name: 'b.root-servers.net', ipv4: '170.247.170.2' },
  { name: 'c.root-servers.net', ipv4: '192.33.4.12' },
  { name: 'd.root-servers.net', ipv4: '199.7.91.13' },
  { name: 'e.root-servers.net', ipv4: '192.203.230.10' },
  { name: 'f.root-servers.net', ipv4: '192.5.5.241' },
  { name: 'g.root-servers.net', ipv4: '192.112.36.4' },
  { name: 'h.root-servers.net', ipv4: '198.97.190.53' },
  { name: 'i.root-servers.net', ipv4: '192.36.148.17' },
  { name: 'j.root-servers.net', ipv4: '192.58.128.30' },
  { name: 'k.root-servers.net', ipv4: '193.0.14.129' },
  { name: 'l.root-servers.net', ipv4: '199.7.83.42' },
  { name: 'm.root-servers.net', ipv4: '202.12.27.33' }
];

const DNS_TLD_SERVERS = {
  com:  [{ name: 'a.gtld-servers.net',  ipv4: '192.5.6.30' }],
  org:  [{ name: 'a0.org.afilias-nst.info', ipv4: '199.19.56.1' }],
  cn:   [{ name: 'a.dns.cn',           ipv4: '203.119.25.1' }],
  io:   [{ name: 'a0.nic.io',           ipv4: '65.22.160.17' }],
  net:  [{ name: 'a.gtld-servers.net',  ipv4: '192.5.6.30' }],
  edu:  [{ name: 'a.edu-servers.net',   ipv4: '192.5.6.30' }]
};

const DNS_AUTHORITATIVE_SERVERS = {
  'example.com':    { name: 'a.iana-servers.net',   ipv4: '93.184.216.34' },
  'google.com':     { name: 'ns1.google.com',       ipv4: '216.239.32.10' },
  'github.com':     { name: 'ns-1283.awsdns-32.org', ipv4: '52.94.116.113' },
  'baidu.com':      { name: 'ns1.baidu.com',        ipv4: '220.181.38.10' },
  'mit.edu':        { name: 'ns1.mit.edu',          ipv4: '18.0.1.42' },
  'wikipedia.org':  { name: 'ns0.wikimedia.org',    ipv4: '208.80.152.208' }
};

module.exports = {
  DNS_ROOT_SERVERS,
  DNS_TLD_SERVERS,
  DNS_AUTHORITATIVE_SERVERS
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/dns-data.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add utils/dns-data.js tests/utils/dns-data.test.js
git commit -m "feat(dns-data): 内置 13 个根 + 6 个 TLD + 6 个权威域名"
```

---

## Task 2: LRU 缓存模块

**Files:**
- Create: `utils/dns-cache.js`
- Test: `tests/utils/dns-cache.test.js`

**Interfaces:**
- Consumes: 无（独立模块）
- Produces:
  - `class LRUCache { constructor(capacity), get(key), set(key, value, ttl), has(key), delete(key), clear() }`
  - `TTL` 默认 300 秒

- [ ] **Step 1: Write failing test**

`tests/utils/dns-cache.test.js`:

```js
const LRUCache = require('../../utils/dns-cache').LRUCache;

describe('LRUCache', () => {
  test('stores and retrieves a value', () => {
    const cache = new LRUCache(3);
    cache.set('a', { ip: '1.2.3.4' });
    expect(cache.get('a')).toEqual({ ip: '1.2.3.4' });
  });

  test('returns null for missing keys', () => {
    const cache = new LRUCache(3);
    expect(cache.get('missing')).toBeNull();
  });

  test('evicts least-recently-used when capacity exceeded', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);  // evicts 'a'
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  test('get() refreshes recency', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');  // 'a' is now most recent
    cache.set('c', 3);  // evicts 'b'
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeNull();
  });

  test('has() returns boolean', () => {
    const cache = new LRUCache(3);
    cache.set('x', 'v');
    expect(cache.has('x')).toBe(true);
    expect(cache.has('y')).toBe(false);
  });

  test('delete() removes entry', () => {
    const cache = new LRUCache(3);
    cache.set('x', 'v');
    cache.delete('x');
    expect(cache.get('x')).toBeNull();
  });

  test('clear() empties cache', () => {
    const cache = new LRUCache(3);
    cache.set('a', 1);
    cache.clear();
    expect(cache.get('a')).toBeNull();
  });

  test('TTL expiration: entry past ttl returns null', () => {
    const cache = new LRUCache(3);
    const now = 1000;
    cache.set('a', 1, 10);  // ttl=10s
    expect(cache.get('a', now)).toBe(1);
    expect(cache.get('a', now + 5000)).toBe(1);
    expect(cache.get('a', now + 11000)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/dns-cache.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `utils/dns-cache.js`**

```js
/**
 * LRU 缓存（带 TTL）
 *
 * 用 Map 的插入顺序保证 LRU 语义：尾部最新，头部最旧。
 * 容量满时删除头部；get 时删除后重新插入以刷新 recency。
 */

const DEFAULT_TTL = 300;  // 5 分钟

class LRUCache {
  constructor(capacity = 50) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('capacity must be a positive integer');
    }
    this._capacity = capacity;
    this._map = new Map();  // key -> { value, expiresAt }
  }

  /**
   * 获取值，过期返回 null
   * @param {string} key
   * @param {number} now 当前时间戳（秒），便于测试
   * @returns {*} value 或 null
   */
  get(key, now = Math.floor(Date.now() / 1000)) {
    const entry = this._map.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= now) {
      this._map.delete(key);
      return null;
    }
    // 刷新 recency：删除后重新插入（Map 保持插入顺序）
    this._map.delete(key);
    this._map.set(key, entry);
    return entry.value;
  }

  /**
   * 设置值
   * @param {string} key
   * @param {*} value
   * @param {number} [ttl] 秒，默认 300
   */
  set(key, value, ttl = DEFAULT_TTL) {
    if (this._map.has(key)) {
      this._map.delete(key);
    } else if (this._map.size >= this._capacity) {
      // 淘汰最旧（头部）
      const oldestKey = this._map.keys().next().value;
      this._map.delete(oldestKey);
    }
    const now = Math.floor(Date.now() / 1000);
    this._map.set(key, {
      value,
      expiresAt: now + ttl
    });
  }

  has(key) {
    return this._map.has(key);
  }

  delete(key) {
    return this._map.delete(key);
  }

  clear() {
    this._map.clear();
  }

  get size() {
    return this._map.size;
  }
}

module.exports = {
  LRUCache,
  DEFAULT_TTL
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/dns-cache.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add utils/dns-cache.js tests/utils/dns-cache.test.js
git commit -m "feat(dns-cache): LRU 缓存（带 TTL，容量可配）"
```

---

## Task 3: DNS 解析器（核心 step 生成器）

**Files:**
- Create: `utils/dns-resolver.js`
- Test: `tests/utils/dns-resolver.test.js`

**Interfaces:**
- Consumes:
  - `LRUCache` from `utils/dns-cache.js`
  - `DNS_ROOT_SERVERS`, `DNS_TLD_SERVERS`, `DNS_AUTHORITATIVE_SERVERS` from `utils/dns-data.js`
- Produces:
  - `resolveSteps({ domain, scenario, cache, now })` → `Array<Step>`
  - `validateDomain(domain)` → `boolean`

`Step` 数据结构：

```js
{
  step: number,
  from: string,    // 源泳道 key: 'client' | 'resolver' | 'root' | 'tld' | 'auth'
  to: string,
  type: 'query' | 'response' | 'cacheHit',
  payload: {
    header?: { id, rd, rac, qdcount, ancount },
    question?: { qname, qtype, qclass },
    answer?: { name, type, class, ttl, rdata }
  },
  durationMs: number,
  explanation: string,
  examTip?: string,
  highlight: string[]
}
```

- [ ] **Step 1: Write failing test**

`tests/utils/dns-resolver.test.js`:

```js
const { resolveSteps, validateDomain } = require('../../utils/dns-resolver');
const { LRUCache } = require('../../utils/dns-cache');

describe('validateDomain', () => {
  test('accepts valid domains', () => {
    expect(validateDomain('example.com')).toBe(true);
    expect(validateDomain('sub.example.com')).toBe(true);
    expect(validateDomain('a-b.example.org')).toBe(true);
  });
  test('rejects invalid domains', () => {
    expect(validateDomain('')).toBe(false);
    expect(validateDomain('example')).toBe(false);          // 无 TLD
    expect(validateDomain('-example.com')).toBe(false);     // 不能以 - 开头
    expect(validateDomain('example-.com')).toBe(false);     // 不能以 - 结尾
    expect(validateDomain('ex ample.com')).toBe(false);     // 不能有空格
  });
});

describe('resolveSteps - first query scenario', () => {
  test('generates full recursive chain for example.com', () => {
    const cache = new LRUCache(50);
    const steps = resolveSteps({ domain: 'example.com', scenario: 'first', cache, now: 1000 });
    expect(steps.length).toBeGreaterThanOrEqual(8);

    const firstStep = steps[0];
    expect(firstStep.from).toBe('client');
    expect(firstStep.to).toBe('resolver');
    expect(firstStep.type).toBe('query');
    expect(firstStep.payload.question.qname).toBe('example.com');

    const lastStep = steps[steps.length - 1];
    expect(lastStep.to).toBe('client');
    expect(lastStep.type).toBe('response');
    expect(lastStep.payload.answer.rdata).toMatch(/^\d/);
  });

  test('falls back to .com for unknown TLD', () => {
    const cache = new LRUCache(50);
    const steps = resolveSteps({ domain: 'example.xyz', scenario: 'first', cache, now: 1000 });
    const fallbackStep = steps.find(s => s.explanation && s.explanation.includes('未覆盖'));
    expect(fallbackStep).toBeDefined();
  });
});

describe('resolveSteps - cache hit scenario', () => {
  test('pre-populated cache produces a single cacheHit step', () => {
    const cache = new LRUCache(50);
    cache.set('example.com', { ip: '93.184.216.34', ttl: 300 }, 300);
    const steps = resolveSteps({ domain: 'example.com', scenario: 'cached', cache, now: 1000 });
    expect(steps.length).toBe(1);
    expect(steps[0].type).toBe('cacheHit');
    expect(steps[0].payload.answer.rdata).toBe('93.184.216.34');
  });
});

describe('resolveSteps - CNAME chain scenario', () => {
  test('CNAME domain triggers additional step', () => {
    const cache = new LRUCache(50);
    // 'www.example.com' 在 CNAME 链场景里被建模为 → example.com
    const steps = resolveSteps({ domain: 'www.example.com', scenario: 'cname', cache, now: 1000 });
    const cnameStep = steps.find(s =>
      s.payload && s.payload.answer && s.payload.answer.type === 'CNAME'
    );
    expect(cnameStep).toBeDefined();
  });
});

describe('resolveSteps - write-through cache', () => {
  test('first query writes to cache, second query hits cache', () => {
    const cache = new LRUCache(50);
    const steps1 = resolveSteps({ domain: 'example.com', scenario: 'first', cache, now: 1000 });
    expect(steps1.length).toBeGreaterThanOrEqual(8);

    const steps2 = resolveSteps({ domain: 'example.com', scenario: 'cached', cache, now: 1000 });
    expect(steps2.length).toBe(1);
    expect(steps2[0].type).toBe('cacheHit');
  });
});

describe('resolveSteps - error handling', () => {
  test('invalid domain returns error step', () => {
    const cache = new LRUCache(50);
    const steps = resolveSteps({ domain: 'not valid', scenario: 'first', cache, now: 1000 });
    expect(steps.length).toBe(1);
    expect(steps[0].type).toBe('error');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/dns-resolver.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `utils/dns-resolver.js`**

```js
/**
 * DNS 解析器（纯函数）
 *
 * 输入 { domain, scenario, cache, now } → step[]
 * 不发起任何网络请求；所有数据来自 utils/dns-data.js 内置。
 */

const { LRUCache, DEFAULT_TTL } = require('./dns-cache');
const {
  DNS_ROOT_SERVERS,
  DNS_TLD_SERVERS,
  DNS_AUTHORITATIVE_SERVERS
} = require('./dns-data');

const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

function validateDomain(domain) {
  if (typeof domain !== 'string') return false;
  return DOMAIN_REGEX.test(domain.trim());
}

/**
 * 生成 step 序列
 * @param {{ domain: string, scenario: 'first'|'cached'|'cname', cache: LRUCache, now?: number }} args
 * @returns {Array<Object>}
 */
function resolveSteps({ domain, scenario = 'first', cache, now = Math.floor(Date.now() / 1000) }) {
  if (!validateDomain(domain)) {
    return [{
      step: 1,
      from: 'client',
      to: 'client',
      type: 'error',
      payload: { error: '域名格式非法' },
      durationMs: 0,
      explanation: `非法域名：${domain}`,
      highlight: []
    }];
  }

  // 场景 1：缓存命中
  const cached = cache.get(domain, now);
  if (cached && scenario !== 'first') {
    return [{
      step: 1,
      from: 'resolver',
      to: 'client',
      type: 'cacheHit',
      payload: {
        header: { id: nextQueryId(), rd: true, rac: true, qdcount: 0, ancount: 1 },
        answer: {
          name: domain,
          type: 'A',
          class: 'IN',
          ttl: cached.ttl || DEFAULT_TTL,
          rdata: cached.ip
        }
      },
      durationMs: 5,
      explanation: `命中本地缓存，TTL 还剩 ${cached.ttl || DEFAULT_TTL} 秒`,
      examTip: '为什么需要 TTL？TTL 影响缓存一致性与查询延迟的权衡。',
      highlight: ['ttl', 'rdata']
    }];
  }

  // 场景 2：CNAME 链
  if (scenario === 'cname' && domain.startsWith('www.')) {
    const target = domain.slice(4);
    const authInfo = DNS_AUTHORITATIVE_SERVERS[target];
    if (!authInfo) {
      return [{
        step: 1, from: 'client', to: 'client', type: 'error',
        payload: { error: 'CNAME 目标未覆盖' }, durationMs: 0,
        explanation: `CNAME 目标 ${target} 未在演示数据中`, highlight: []
      }];
    }
    return buildCnameSteps({ domain, target, authInfo, now });
  }

  // 场景 0：首次查询完整链路
  return buildFirstQuerySteps({ domain, now, cache });
}

/* ── 内部辅助函数 ── */

let _queryId = 0;
function nextQueryId() {
  _queryId = (_queryId + 1) & 0xffff;
  return _queryId;
}

function getTld(domain) {
  const parts = domain.split('.');
  return parts[parts.length - 1].toLowerCase();
}

function buildFirstQuerySteps({ domain, now, cache }) {
  const tld = getTld(domain);
  const tldServers = DNS_TLD_SERVERS[tld];
  const useFallback = !tldServers;
  const tldInfo = useFallback
    ? DNS_TLD_SERVERS.com[0]
    : tldServers[0];
  const authInfo = DNS_AUTHORITATIVE_SERVERS[domain] ||
                   DNS_AUTHORITATIVE_SERVERS['example.com'];

  const steps = [];
  let stepNum = 0;
  const id = nextQueryId();

  // 1. Client → Resolver (query)
  steps.push({
    step: ++stepNum,
    from: 'client', to: 'resolver',
    type: 'query',
    payload: {
      header: { id, rd: true, rac: false, qdcount: 1, ancount: 0 },
      question: { qname: domain, qtype: 'A', qclass: 'IN' }
    },
    durationMs: 20,
    explanation: '客户端向本地递归解析器发起查询',
    highlight: ['qname']
  });

  // 2. Resolver → Root (query)
  steps.push({
    step: ++stepNum,
    from: 'resolver', to: 'root',
    type: 'query',
    payload: {
      header: { id, rd: true, rac: false, qdcount: 1, ancount: 0 },
      question: { qname: domain, qtype: 'A', qclass: 'IN' }
    },
    durationMs: 50,
    explanation: '解析器向根服务器查询',
    examTip: '全球 13 组根服务器，由 a.root-servers.net 至 m.root-servers.net。',
    highlight: ['qname']
  });

  // 3. Root → Resolver (response: 返回 TLD 服务器列表)
  steps.push({
    step: ++stepNum,
    from: 'root', to: 'resolver',
    type: 'response',
    payload: {
      header: { id, rd: true, rac: true, qdcount: 1, ancount: 0 },
      answer: {
        name: domain, type: 'NS', class: 'IN', ttl: 172800,
        rdata: useFallback ? `${tldInfo.name}（fallback）` : tldInfo.name
      }
    },
    durationMs: 80,
    explanation: useFallback
      ? `根服务器返回 .com TLD 服务器列表（演示模式：TLD .${tld} 未覆盖）`
      : `根服务器返回 .${tld} TLD 服务器列表`,
    highlight: ['rdata']
  });

  // 4. Resolver → TLD (query)
  steps.push({
    step: ++stepNum,
    from: 'resolver', to: 'tld',
    type: 'query',
    payload: {
      header: { id, rd: true, rac: false, qdcount: 1, ancount: 0 },
      question: { qname: domain, qtype: 'A', qclass: 'IN' }
    },
    durationMs: 60,
    explanation: '解析器向 TLD 服务器查询',
    highlight: ['qname']
  });

  // 5. TLD → Resolver (response: 返回权威 NS 记录)
  steps.push({
    step: ++stepNum,
    from: 'tld', to: 'resolver',
    type: 'response',
    payload: {
      header: { id, rd: true, rac: true, qdcount: 1, ancount: 1 },
      answer: {
        name: domain, type: 'NS', class: 'IN', ttl: 86400,
        rdata: authInfo.name
      }
    },
    durationMs: 90,
    explanation: `TLD 服务器返回 ${domain} 的权威 NS 记录`,
    highlight: ['rdata']
  });

  // 6. Resolver → Auth (query)
  steps.push({
    step: ++stepNum,
    from: 'resolver', to: 'auth',
    type: 'query',
    payload: {
      header: { id, rd: true, rac: false, qdcount: 1, ancount: 0 },
      question: { qname: domain, qtype: 'A', qclass: 'IN' }
    },
    durationMs: 70,
    explanation: '解析器向权威服务器查询',
    highlight: ['qname']
  });

  // 7. Auth → Resolver (response: 返回 A 记录)
  steps.push({
    step: ++stepNum,
    from: 'auth', to: 'resolver',
    type: 'response',
    payload: {
      header: { id, rd: true, rac: true, qdcount: 1, ancount: 1 },
      answer: {
        name: domain, type: 'A', class: 'IN', ttl: 86400,
        rdata: authInfo.ipv4
      }
    },
    durationMs: 100,
    explanation: `权威服务器返回 A 记录：${authInfo.ipv4}`,
    examTip: 'A 记录将域名映射到 IPv4 地址；AAAA 记录映射到 IPv6。',
    highlight: ['rdata']
  });

  // 8. Resolver → Client (response: 最终结果 + 写入缓存)
  cache.set(domain, { ip: authInfo.ipv4, ttl: 86400 }, 86400);
  steps.push({
    step: ++stepNum,
    from: 'resolver', to: 'client',
    type: 'response',
    payload: {
      header: { id, rd: true, rac: true, qdcount: 1, ancount: 1 },
      answer: {
        name: domain, type: 'A', class: 'IN', ttl: 86400,
        rdata: authInfo.ipv4
      }
    },
    durationMs: 10,
    explanation: `解析器返回最终结果给客户端，并写入缓存（TTL=86400）`,
    examTip: '缓存 TTL 由权威 NS 决定，影响后续查询是否命中本地。',
    highlight: ['rdata', 'ttl']
  });

  return steps;
}

function buildCnameSteps({ domain, target, authInfo, now }) {
  const steps = [];
  let stepNum = 0;
  const id = nextQueryId();

  // 1. Client → Resolver
  steps.push({
    step: ++stepNum, from: 'client', to: 'resolver', type: 'query',
    payload: {
      header: { id, rd: true, rac: false, qdcount: 1, ancount: 0 },
      question: { qname: domain, qtype: 'A', qclass: 'IN' }
    },
    durationMs: 20,
    explanation: `客户端查询 ${domain}`,
    highlight: ['qname']
  });

  // 2. Resolver → Auth (向权威查询 www 记录)
  steps.push({
    step: ++stepNum, from: 'resolver', to: 'auth', type: 'query',
    payload: {
      header: { id, rd: true, rac: false, qdcount: 1, ancount: 0 },
      question: { qname: domain, qtype: 'A', qclass: 'IN' }
    },
    durationMs: 70,
    explanation: '解析器向权威服务器查询 www 子域',
    highlight: ['qname']
  });

  // 3. Auth → Resolver (返回 CNAME)
  steps.push({
    step: ++stepNum, from: 'auth', to: 'resolver', type: 'response',
    payload: {
      header: { id, rd: true, rac: true, qdcount: 1, ancount: 1 },
      answer: {
        name: domain, type: 'CNAME', class: 'IN', ttl: 3600,
        rdata: target
      }
    },
    durationMs: 100,
    explanation: `权威服务器返回 CNAME：${domain} → ${target}`,
    examTip: 'CNAME（Canonical Name）将一个域名指向另一个域名，常用于 CDN / 别名。',
    highlight: ['rdata']
  });

  // 4. Resolver → Auth (再查 target)
  steps.push({
    step: ++stepNum, from: 'resolver', to: 'auth', type: 'query',
    payload: {
      header: { id, rd: true, rac: false, qdcount: 1, ancount: 0 },
      question: { qname: target, qtype: 'A', qclass: 'IN' }
    },
    durationMs: 70,
    explanation: `解析器继续查询 CNAME 目标 ${target}`,
    highlight: ['qname']
  });

  // 5. Auth → Resolver (返回 target 的 A 记录)
  steps.push({
    step: ++stepNum, from: 'auth', to: 'resolver', type: 'response',
    payload: {
      header: { id, rd: true, rac: true, qdcount: 1, ancount: 1 },
      answer: {
        name: target, type: 'A', class: 'IN', ttl: 86400,
        rdata: authInfo.ipv4
      }
    },
    durationMs: 100,
    explanation: `权威返回 A 记录：${authInfo.ipv4}`,
    highlight: ['rdata']
  });

  // 6. Resolver → Client (返回最终结果)
  steps.push({
    step: ++stepNum, from: 'resolver', to: 'client', type: 'response',
    payload: {
      header: { id, rd: true, rac: true, qdcount: 1, ancount: 1 },
      answer: {
        name: domain, type: 'A', class: 'IN', ttl: 86400,
        rdata: authInfo.ipv4
      }
    },
    durationMs: 10,
    explanation: '解析器返回最终结果',
    highlight: ['rdata']
  });

  return steps;
}

module.exports = {
  resolveSteps,
  validateDomain
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/dns-resolver.test.js`
Expected: PASS (~10 tests)

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add utils/dns-resolver.js tests/utils/dns-resolver.test.js
git commit -m "feat(dns-resolver): resolveSteps 纯函数 + validateDomain + CNAME 场景"
```

---

## Task 4: 页面骨架 + 输入条 + 场景选择

**Files:**
- Create: `pages/dns-viz/dns-viz.json`
- Create: `pages/dns-viz/dns-viz.js`
- Create: `pages/dns-viz/dns-viz.wxml`
- Create: `pages/dns-viz/dns-viz.wxss`

**Interfaces:**
- Consumes:
  - `resolveSteps`, `validateDomain` from `utils/dns-resolver.js`
  - `LRUCache` from `utils/dns-cache.js`
- Produces: 完整的 `pages/dns-viz/` 页面（4 文件）

- [ ] **Step 1: Write `pages/dns-viz/dns-viz.json`**

```json
{
  "navigationBarTitleText": "DNS 解析可视化",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#faf9f5",
  "usingComponents": {}
}
```

- [ ] **Step 2: Write `pages/dns-viz/dns-viz.wxml`**

```xml
<view class="page">

  <!-- 输入区 -->
  <view class="input-band">
    <text class="band-label">DNS 解析可视化</text>
    <view class="input-row">
      <input class="domain-input"
             placeholder="example.com"
             value="{{domain}}"
             bindinput="onDomainInput" />
      <picker mode="selector" range="{{scenarios}}" value="{{scenarioIndex}}" bindchange="onScenarioChange">
        <view class="scenario-picker">
          <text>{{scenarios[scenarioIndex]}}</text>
          <text class="picker-arrow">▾</text>
        </view>
      </picker>
    </view>
    <view class="action-row">
      <button class="btn-primary" bindtap="onStartTap" hover-class="btn-hover">▶ 开始</button>
      <button class="btn-secondary" bindtap="onResetTap" hover-class="btn-hover">↻ 重置</button>
    </view>
    <text wx:if="{{errorMessage}}" class="error-text">{{errorMessage}}</text>
  </view>

  <!-- 5 条泳道 -->
  <view class="lanes-band">
    <view class="lane lane-client">
      <text class="lane-name">Client</text>
      <text class="lane-ip">192.168.1.1</text>
    </view>
    <view class="lane lane-resolver">
      <text class="lane-name">Recursive Resolver</text>
      <text class="lane-ip">8.8.8.8</text>
    </view>
    <view class="lane lane-root">
      <text class="lane-name">Root Server</text>
      <text class="lane-ip">a.root-servers.net · 198.41.0.4</text>
    </view>
    <view class="lane lane-tld">
      <text class="lane-name">TLD Server (.com)</text>
      <text class="lane-ip">192.5.6.30</text>
    </view>
    <view class="lane lane-auth">
      <text class="lane-name">Authoritative</text>
      <text class="lane-ip">{{authServerText}}</text>
    </view>
  </view>

  <!-- 步骤控制 -->
  <view wx:if="{{steps.length > 0}}" class="control-band">
    <button class="btn-secondary" bindtap="onPrevStep" hover-class="btn-hover">◀ 上一步</button>
    <text class="step-counter">{{currentStep + 1}} / {{steps.length}}</text>
    <button class="btn-secondary" bindtap="onNextStep" hover-class="btn-hover">下一步 ▶</button>
    <button class="btn-secondary" bindtap="onTogglePlay" hover-class="btn-hover">
      {{isPlaying ? '⏸ 暂停' : '⏯ 播放'}}
    </button>
  </view>

  <!-- 当前步骤详情 -->
  <view wx:if="{{currentStepObj}}" class="detail-band">
    <text class="detail-title">{{currentStepObj.explanation}}</text>
    <view class="payload-block">
      <text class="payload-label">{{currentStepObj.type === 'query' ? 'Query' : (currentStepObj.type === 'cacheHit' ? 'Cache Hit' : 'Response')}}</text>
      <text class="payload-text">{{payloadText}}</text>
    </view>
    <view wx:if="{{currentStepObj.examTip}}" class="exam-tip">
      <text class="exam-tip-label">💡 面试考点</text>
      <text class="exam-tip-text">{{currentStepObj.examTip}}</text>
    </view>
  </view>

  <!-- 进度条 -->
  <view wx:if="{{steps.length > 0}}" class="progress-band">
    <progress percent="{{progressPercent}}" stroke-width="4" color="#cc785c" backgroundColor="#efe9de" />
  </view>

</view>
```

- [ ] **Step 3: Write `pages/dns-viz/dns-viz.wxss`**

```css
.page {
  background-color: #faf9f5;
  min-height: 100vh;
  padding: 24rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Georgia', serif;
  color: #141413;
}

.band-label {
  display: block;
  font-family: Georgia, serif;
  font-size: 32rpx;
  letter-spacing: -3rpx;
  color: #141413;
  margin-bottom: 16rpx;
}

.input-band {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.domain-input {
  flex: 1;
  background-color: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  color: #141413;
}

.scenario-picker {
  background-color: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #141413;
}

.picker-arrow {
  color: #6c6a64;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.btn-primary {
  flex: 1;
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: none;
}

.btn-secondary {
  flex: 1;
  background-color: #faf9f5;
  color: #141413;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: 1rpx solid #d4cfc2;
}

.btn-hover {
  opacity: 0.7;
}

.error-text {
  display: block;
  margin-top: 12rpx;
  color: #c0392b;
  font-size: 24rpx;
}

.lanes-band {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
}

.lane {
  background-color: #faf9f5;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 8rpx;
}

.lane:last-child {
  margin-bottom: 0;
}

.lane.active {
  border: 2rpx solid #cc785c;
  background-color: #f5ede2;
}

.lane-name {
  display: block;
  font-family: Georgia, serif;
  font-size: 28rpx;
  color: #141413;
}

.lane-ip {
  display: block;
  font-size: 22rpx;
  color: #6c6a64;
  font-family: monospace;
}

.control-band {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.step-counter {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #6c6a64;
}

.detail-band {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.detail-title {
  display: block;
  font-size: 28rpx;
  color: #141413;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.payload-block {
  background-color: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
}

.payload-label {
  display: block;
  font-size: 22rpx;
  color: #6c6a64;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
}

.payload-text {
  display: block;
  font-size: 24rpx;
  color: #141413;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.exam-tip {
  background-color: #f5ede2;
  border-radius: 12rpx;
  padding: 16rpx;
  border-left: 4rpx solid #cc785c;
}

.exam-tip-label {
  display: block;
  font-size: 22rpx;
  color: #cc785c;
  margin-bottom: 8rpx;
  font-weight: bold;
}

.exam-tip-text {
  display: block;
  font-size: 24rpx;
  color: #141413;
  line-height: 1.6;
}

.progress-band {
  margin-bottom: 24rpx;
}
```

- [ ] **Step 4: Write `pages/dns-viz/dns-viz.js`**

```js
const { resolveSteps, validateDomain } = require('../../utils/dns-resolver');
const { LRUCache, DEFAULT_TTL } = require('../../utils/dns-cache');
const { DNS_AUTHORITATIVE_SERVERS } = require('../../utils/dns-data');

const SCENARIOS = ['首次查询', '再次查询命中缓存', 'CNAME 链'];

Page({
  data: {
    domain: 'example.com',
    scenarios: SCENARIOS,
    scenarioIndex: 0,
    steps: [],
    currentStep: 0,
    isPlaying: false,
    currentStepObj: null,
    payloadText: '',
    progressPercent: 0,
    authServerText: '',
    errorMessage: ''
  },

  _cache: null,
  _playTimer: null,

  onLoad() {
    this._cache = new LRUCache(50);
    this._refreshAuthServer();
  },

  onUnload() {
    this._stopPlay();
  },

  onDomainInput(e) {
    this.setData({ domain: e.detail.value });
  },

  onScenarioChange(e) {
    this.setData({ scenarioIndex: Number(e.detail.value) });
  },

  onStartTap() {
    const { domain, scenarioIndex } = this.data;
    if (!validateDomain(domain)) {
      this.setData({ errorMessage: `域名格式非法：${domain}` });
      return;
    }
    this.setData({ errorMessage: '' });

    const scenario = ['first', 'cached', 'cname'][scenarioIndex];
    const steps = resolveSteps({
      domain,
      scenario,
      cache: this._cache,
      now: Math.floor(Date.now() / 1000)
    });

    if (steps.length === 1 && steps[0].type === 'error') {
      this.setData({ errorMessage: steps[0].payload.error });
      return;
    }

    this.setData({ steps, currentStep: 0, isPlaying: false });
    this._renderStep(0);
    this._startPlay();
  },

  onResetTap() {
    this._stopPlay();
    this._cache.clear();
    this.setData({
      steps: [],
      currentStep: 0,
      currentStepObj: null,
      payloadText: '',
      progressPercent: 0,
      errorMessage: ''
    });
    this._refreshAuthServer();
  },

  onPrevStep() {
    const { currentStep, steps } = this.data;
    if (currentStep > 0) {
      this._renderStep(currentStep - 1);
    }
  },

  onNextStep() {
    const { currentStep, steps } = this.data;
    if (currentStep < steps.length - 1) {
      this._renderStep(currentStep + 1);
    } else {
      this._stopPlay();
    }
  },

  onTogglePlay() {
    if (this.data.isPlaying) {
      this._stopPlay();
    } else {
      this._startPlay();
    }
  },

  _refreshAuthServer() {
    const domain = this.data.domain;
    const auth = DNS_AUTHORITATIVE_SERVERS[domain] || DNS_AUTHORITATIVE_SERVERS['example.com'];
    this.setData({
      authServerText: `${auth.name} · ${auth.ipv4}`
    });
  },

  _renderStep(idx) {
    const step = this.data.steps[idx];
    if (!step) return;
    const payloadText = this._formatPayload(step);
    const progressPercent = Math.round(((idx + 1) / this.data.steps.length) * 100);
    this.setData({
      currentStep: idx,
      currentStepObj: step,
      payloadText,
      progressPercent
    });
  },

  _formatPayload(step) {
    if (!step.payload) return '';
    const lines = [];
    if (step.payload.header) {
      const h = step.payload.header;
      lines.push(`Header: ID=${h.id} RD=${h.rd} RAC=${h.rac} QD=${h.qdcount} AN=${h.ancount}`);
    }
    if (step.payload.question) {
      const q = step.payload.question;
      lines.push(`Question: ${q.qname} ${q.qtype} ${q.qclass}`);
    }
    if (step.payload.answer) {
      const a = step.payload.answer;
      lines.push(`Answer: ${a.name} ${a.type} ${a.class} TTL=${a.ttl} RDATA=${a.rdata}`);
    }
    if (step.payload.error) {
      lines.push(`Error: ${step.payload.error}`);
    }
    return lines.join('\n');
  },

  _startPlay() {
    if (this._playTimer) return;
    this.setData({ isPlaying: true });
    this._playTimer = setInterval(() => {
      const { currentStep, steps } = this.data;
      if (currentStep >= steps.length - 1) {
        this._stopPlay();
        return;
      }
      this._renderStep(currentStep + 1);
    }, 800);
  },

  _stopPlay() {
    if (this._playTimer) {
      clearInterval(this._playTimer);
      this._playTimer = null;
    }
    this.setData({ isPlaying: false });
  }
});
```

- [ ] **Step 5: Verify page renders**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/dns-resolver.test.js`
Expected: PASS（utils 测试未受影响）

- [ ] **Step 6: Commit**

```bash
git add pages/dns-viz/
git commit -m "feat(dns-viz): 页面骨架 + 输入条 + 步骤播放器 + 详情面板"
```

---

## Task 5: 注册 + 首页集成 + 文档

**Files:**
- Modify: `app.json` (添加 `pages/dns-viz/dns-viz`)
- Modify: `utils/tool-registry.js` (把 `dns-viz.available` 改为 `true`)
- Create: `docs/handoff/modules/dns-viz.md`

**Interfaces:**
- Consumes: `dns-viz` tool metadata
- Produces: 工具在首页可见

- [ ] **Step 1: Modify `app.json`**

在 `pages` 数组中按字母序插入 `"pages/dns-viz/dns-viz"`（位置：`dashboard` 之后，`ds-viz` 之前或保持现有顺序）。完成后 `pages` 数组应为：

```json
[
  "pages/index/index",
  "pages/quiz-list/quiz-list",
  "pages/import-preview/import-preview",
  "pages/quiz/quiz",
  "pages/result/result",
  "pages/records/records",
  "pages/record-detail/record-detail",
  "pages/wrong-questions/wrong-questions",
  "pages/dashboard/dashboard",
  "pages/dns-viz/dns-viz",
  "pages/subnet-calc/subnet-calc",
  "pages/sort-viz/sort-viz",
  "pages/tcp-viz/tcp-viz",
  "pages/ds-viz/ds-viz"
]
```

- [ ] **Step 2: Modify `utils/tool-registry.js`**

在 `dns-viz` 工具对象中，把 `available: false` 改为 `available: true`。其他字段（icon / description / route / order）保持不变。

- [ ] **Step 3: Write `docs/handoff/modules/dns-viz.md`**

```md
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
```

- [ ] **Step 4: Verify homepage shows the new tool**

Open the WeChat devtools and navigate to homepage → 「计算机网络」分类 → 应看到 DNS 解析可视化卡片已可点击（不再是「即将上线」）。

Expected: 卡片显示「进入 ›」链接（而非「即将上线」tag）。

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS（之前 N 个测试 + dns 3 个测试文件的所有测试）

- [ ] **Step 6: Commit**

```bash
git add app.json utils/tool-registry.js docs/handoff/modules/dns-viz.md
git commit -m "feat(dns-viz): 注册页面 + tool-registry 可用化 + 模块文档"
```

---

## Task 6: 验证完成 + PROJECT_HANDOFF 同步

**Files:**
- Modify: `PROJECT_HANDOFF.md`
- Modify: `docs/handoff/decisions.md`
- Modify: `docs/handoff/future-plans.md`

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 2: Verify DNS page renders without errors**

Run: 打开微信开发者工具，导入 `pages/dns-viz/`，输入 `example.com`，点击「开始」。

Expected:
- 8 个 step 依次播放动画
- 缓存命中率显示 "0%"（首次查询）
- 第二次点开始应直接 cache hit

- [ ] **Step 3: Append to `PROJECT_HANDOFF.md`**

在 `## 8. 最近重大变更` 顶部插入：

```md
### 2026-07-12 · DNS 解析可视化上线

**变更内容**

- 新增 `pages/dns-viz/` 页面（4 文件）
- 新增 3 个 utils 纯函数模块：`dns-data.js` / `dns-cache.js` / `dns-resolver.js`
- 新增 3 个测试文件（共 ~24 个测试）
- `utils/tool-registry.js` 把 `dns-viz.available` 改为 `true`
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/dns-viz.md` 模块文档

**理由**

- 承接 `tool-registry.js` 中网络协议族的占位
- 完整递归 + 缓存 + CNAME 链 3 场景，参考 TCP-viz 风格
- 纯前端 + 内置 DNS 数据，无网络请求

**影响**

- spec: `docs/superpowers/specs/2026-07-12-dns-resolver-design.md`
- plan: `docs/plans/2026-07-12-dns-resolver.md`
- baseline = `31d7f97`（specs commit）；实施 commit 数 = 5（每个 utils 模块 1 commit + 页面 1 commit + 注册/文档 1 commit）
- `npm test` 全绿
```

- [ ] **Step 4: Append to `docs/handoff/decisions.md`**

```md
## 2026-07-12 · DNS 内置数据策略

**决策**：使用硬编码的 13 个根 + 6 个 TLD + 6 个权威域名的真实 IP，**不**调用任何外部 API。

**理由**：
- 微信小程序无网络权限（即便有，重试/超时/隐私也会复杂化）
- 真实 IP 基于 IANA / Wikipedia 公开数据，教学准确性高
- 6 个 TLD 覆盖最常见场景，未覆盖的 TLD fallback 到 `.com`

**影响**：DNS 数据维护需手动同步；新增 TLD 需修改 `utils/dns-data.js`。
```

- [ ] **Step 5: Append to `docs/handoff/future-plans.md`**

在 `## P3 · 新模块` 段后追加：

```md
## P7 · 网络协议族 backlog（DNS 上线后）

DNS 解析可视化已上线。其余网络协议族占位（tool-registry.js 内 `available: false`）待后续 plan：

- TLS 1.3 握手动画（handshake + certificate + key exchange）
- HTTP 报文解析器（真实请求/响应字段解析）
- IP 分片计算器（MTU + 偏移量计算）
- NAT 端口映射模拟器
```

- [ ] **Step 6: Commit**

```bash
git add PROJECT_HANDOFF.md docs/handoff/decisions.md docs/handoff/future-plans.md
git commit -m "docs(handoff): DNS 解析可视化上线记录 + 网络协议族 backlog"
```

---

## 验收清单（实施完成后）

- [ ] `npm test` 全绿
- [ ] 微信开发者工具中，`pages/dns-viz/` 加载无报错
- [ ] 域名 `example.com` 首次查询 → 8 step 动画正常播放
- [ ] 「再次查询命中缓存」场景 → 1 step cacheHit 红色高亮
- [ ] 「CNAME 链」场景（输入 `www.example.com`）→ 6 step 包含 CNAME type
- [ ] 首页「计算机网络」分类 → DNS 解析可视化卡片可点击
- [ ] PROJECT_HANDOFF.md / decisions.md / future-plans.md 已更新