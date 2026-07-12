/**
 * DNS 内置数据
 *
 * 13 个根服务器 + 6 个常见 TLD + 5+ 个示例权威域名
 * 第一版使用真实 IP（基于 IANA / Wikipedia 公开数据），但避免使用任何外部网络
 */

/** @type {Array<{name: string, ipv4: string}>} 13 个根服务器（a.root-servers.net 至 m.root-servers.net） */
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

/** @type {Record<string, Array<{name: string, ipv4: string}>>} 6 个 TLD（com / org / cn / io / net / edu），每个 key 至少 1 个 TLD 服务器 */
const DNS_TLD_SERVERS = {
  com:  [{ name: 'a.gtld-servers.net',  ipv4: '192.5.6.30' }],
  org:  [{ name: 'a0.org.afilias-nst.info', ipv4: '199.19.56.1' }],
  cn:   [{ name: 'a.dns.cn',           ipv4: '203.119.25.1' }],
  io:   [{ name: 'a0.nic.io',           ipv4: '65.22.160.17' }],
  net:  [{ name: 'a.gtld-servers.net',  ipv4: '192.5.6.30' }],
  edu:  [{ name: 'a.edu-servers.net',   ipv4: '192.5.6.30' }]
};

/** @type {Record<string, {name: string, ipv4: string, cname?: string}>} 6 个示例权威域名（example.com / google.com / github.com / baidu.com / mit.edu / wikipedia.org） */
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