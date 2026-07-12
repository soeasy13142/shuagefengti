/**
 * DNS 解析器（纯函数 step 生成器）
 *
 * 输入 { domain, scenario, cache, now } → step[]
 * 不发起任何网络请求；所有数据来自 utils/dns-data.js 内置。
 *
 * 三种场景：
 * - `'first'`：完整 8 步递归链路（client → resolver → root → tld → auth → client）
 * - `'cached'`：本地缓存命中（1 步 `cacheHit`）；若未命中则降级为首次查询
 * - `'cname'`：CNAME 链（仅当 domain 以 `www.` 开头且 target 在权威表中）
 *
 * Step 数据结构（详见 README §DNS Step）：
 * @typedef {Object} DnsStep
 * @property {number} step            步骤序号（从 1 起）
 * @property {string} from            源泳道 key: 'client' | 'resolver' | 'root' | 'tld' | 'auth'
 * @property {string} to              目标泳道 key（同上）
 * @property {string} type            消息类型: 'query' | 'response' | 'cacheHit' | 'error'
 * @property {Object} payload         报文内容（header / question / answer / error）
 * @property {number} durationMs      持续时间（ms）
 * @property {string} explanation     教学讲解
 * @property {string} [examTip]       考试小贴士（可选）
 * @property {string[]} highlight     高亮字段 key（如 'qname' / 'rdata' / 'ttl'）
 */

const { LRUCache, DEFAULT_TTL } = require('./dns-cache');
const {
  DNS_ROOT_SERVERS,
  DNS_TLD_SERVERS,
  DNS_AUTHORITATIVE_SERVERS
} = require('./dns-data');

/**
 * 域名格式正则（RFC 1035 简化版）：
 * - 每个 label 以字母/数字开头结尾，中间允许 `-`，长度 1-63
 * - 至少一个 label，最后一个 label（TLD）必须全字母且 ≥2 字符
 * @type {RegExp}
 */
const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * 校验域名格式是否合法（RFC 1035 简化版）。
 *
 * @param {string} domain 待校验的域名
 * @returns {boolean} 合法返回 true；非字符串或格式不合法返回 false
 */
function validateDomain(domain) {
  if (typeof domain !== 'string') return false;
  return DOMAIN_REGEX.test(domain.trim());
}

/**
 * 生成 DNS 解析步骤序列（核心入口）。
 *
 * - 非法域名：返回 1 步 `error`
 * - 缓存命中（且场景不为 `'first'`）：返回 1 步 `cacheHit`
 * - CNAME 场景（domain 以 `www.` 开头）：返回 6 步 CNAME 链
 * - 其他：返回 8 步完整递归链路（client → resolver → root → tld → auth → resolver → client）
 *
 * 副作用：成功路径会写入 `cache`（write-through）。
 *
 * @param {Object} args
 * @param {string} args.domain         查询域名（须通过 `validateDomain`）
 * @param {'first'|'cached'|'cname'} [args.scenario='first'] 查询场景
 * @param {LRUCache} args.cache        LRU 缓存实例（write-through 写入 + cacheHit 读取）
 * @param {number} [args.now]          当前时间戳（秒），便于测试；默认 `Math.floor(Date.now()/1000)`
 * @returns {DnsStep[]} step 数组
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

/** @private 自增的 16 位查询 ID（模拟真实 DNS header.id） */
let _queryId = 0;
function nextQueryId() {
  _queryId = (_queryId + 1) & 0xffff;
  return _queryId;
}

/**
 * 提取域名 TLD（小写）。
 * @param {string} domain
 * @returns {string} TLD（例如 'com' / 'org' / 'cn'）
 * @private
 */
function getTld(domain) {
  const parts = domain.split('.');
  return parts[parts.length - 1].toLowerCase();
}

/**
 * 构建首次查询的 8 步完整链路。
 * TLD 未覆盖时降级为 `.com`，并在第 3 步说明演示模式。
 *
 * @param {Object} args
 * @param {string} args.domain
 * @param {number} args.now
 * @param {LRUCache} args.cache  会写入最终 A 记录（write-through）
 * @returns {DnsStep[]}
 * @private
 */
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

/**
 * 构建 CNAME 链的 6 步（www.<target> 场景）。
 * 简化模型：1 条 CNAME → 1 条 A 记录，不递归解析完整链路。
 *
 * @param {Object} args
 * @param {string} args.domain   原始域名（如 'www.example.com'）
 * @param {string} args.target   CNAME 目标（如 'example.com'）
 * @param {{name:string,ipv4:string}} args.authInfo  权威信息
 * @returns {DnsStep[]}
 * @private
 */
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