const { snat, dnat, allocatePort, createMappingEntry, removeExpiredEntries } = require('../../utils/nat-engine');

describe('allocatePort', () => {
  test('allocates first available port from pool', () => {
    const port = allocatePort([50000, 50001, 50002], []);
    expect(port).toBe(50000);
  });

  test('skips used ports', () => {
    const port = allocatePort([50000, 50001, 50002], [50000, 50002]);
    expect(port).toBe(50001);
  });

  test('returns null when pool exhausted', () => {
    const port = allocatePort([50000], [50000]);
    expect(port).toBeNull();
  });
});

describe('createMappingEntry', () => {
  test('creates entry with correct fields and Active state', () => {
    const entry = createMappingEntry('192.168.1.2', 40000, 50000, '203.0.113.5', 'TCP');
    expect(entry.internalIp).toBe('192.168.1.2');
    expect(entry.internalPort).toBe(40000);
    expect(entry.externalPort).toBe(50000);
    expect(entry.remoteHost).toBe('203.0.113.5');
    expect(entry.protocol).toBe('TCP');
    expect(entry.state).toBe('Active');
    expect(typeof entry.timeout).toBe('number');
  });
});

describe('snat', () => {
  test('creates new mapping for outbound packet', () => {
    const packet = { srcIp: '192.168.1.2', srcPort: 40000, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' };
    const pool = [50000, 50001];
    const table = [];
    const result = snat(packet, pool, table, '203.0.113.1');
    expect(result.error).toBeUndefined();
    expect(result.packet.srcIp).toBe('203.0.113.1');
    expect(result.packet.srcPort).toBe(50000);
    expect(result.tableUpdate.action).toBe('add');
    expect(result.tableUpdate.entry.internalIp).toBe('192.168.1.2');
  });

  test('reuses existing mapping for same (srcIp, srcPort, remoteHost)', () => {
    const packet = { srcIp: '192.168.1.2', srcPort: 40000, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' };
    const existingEntry = { internalIp: '192.168.1.2', internalPort: 40000, externalPort: 50000, remoteHost: '203.0.113.5', protocol: 'TCP', timeout: 60, state: 'Active' };
    const table = [existingEntry];
    const pool = [50000, 50001];
    const result = snat(packet, pool, table, '203.0.113.1');
    expect(result.packet.srcPort).toBe(50000);
    expect(result.tableUpdate.action).toBe('noop');
  });

  test('returns error when port pool exhausted', () => {
    const packet = { srcIp: '192.168.1.3', srcPort: 40001, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' };
    const pool = [];
    const table = [];
    const result = snat(packet, pool, table, '203.0.113.1');
    expect(result.error).toBeDefined();
    expect(result.error).toContain('端口池耗尽');
  });
});

describe('dnat', () => {
  test('translates dstIp/dstPort according to static mapping', () => {
    const packet = { srcIp: '203.0.113.100', srcPort: 12345, dstIp: '203.0.113.1', dstPort: 8080, protocol: 'TCP', direction: 'inbound' };
    const staticMapping = { externalPort: 8080, internalIp: '192.168.1.10', internalPort: 80 };
    const result = dnat(packet, staticMapping);
    expect(result.packet.dstIp).toBe('192.168.1.10');
    expect(result.packet.dstPort).toBe(80);
  });

  test('returns error when no mapping matches', () => {
    const packet = { srcIp: '203.0.113.100', srcPort: 12345, dstIp: '203.0.113.1', dstPort: 9090, protocol: 'TCP', direction: 'inbound' };
    const staticMapping = { externalPort: 8080, internalIp: '192.168.1.10', internalPort: 80 };
    const result = dnat(packet, staticMapping);
    expect(result.error).toBeDefined();
  });
});

describe('removeExpiredEntries', () => {
  test('removes entries past their timeout', () => {
    const fresh = { externalPort: 50000, timeout: 100, state: 'Active' };
    const expired = { externalPort: 50001, timeout: 0, state: 'Active' };
    const result = removeExpiredEntries([fresh, expired], 50);
    expect(result.length).toBe(1);
    expect(result[0].externalPort).toBe(50000);
  });
});
