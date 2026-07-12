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