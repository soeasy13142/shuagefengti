const { simulateEcdhe, deriveTrafficKeys } = require('../../utils/tls-crypto');

describe('simulateEcdhe', () => {
  test('returns clientPublic, serverPublic, sharedSecret', () => {
    const result = simulateEcdhe();
    expect(result).toHaveProperty('clientPublic');
    expect(result).toHaveProperty('serverPublic');
    expect(result).toHaveProperty('sharedSecret');
    expect(typeof result.sharedSecret).toBe('string');
    expect(result.sharedSecret.length).toBeGreaterThan(0);
  });

  test('idempotent: same seed produces same output', () => {
    const seed = { clientKeyShare: 'aa:bb', serverKeyShare: 'cc:dd' };
    const r1 = simulateEcdhe(seed);
    const r2 = simulateEcdhe(seed);
    expect(r1).toEqual(r2);
  });

  test('uses default seed when none provided', () => {
    const result = simulateEcdhe();
    expect(result.clientPublic).toBeDefined();
    expect(result.serverPublic).toBeDefined();
  });
});

describe('deriveTrafficKeys', () => {
  test('returns 6 key/IV fields', () => {
    const keys = deriveTrafficKeys('df:4a:1e:8c:3b:7f:02:6d');
    expect(keys).toHaveProperty('handshakeSecret');
    expect(keys).toHaveProperty('serverTrafficKey');
    expect(keys).toHaveProperty('serverTrafficIV');
    expect(keys).toHaveProperty('clientTrafficKey');
    expect(keys).toHaveProperty('clientTrafficIV');
    expect(keys).toHaveProperty('appTrafficKey');
    expect(keys).toHaveProperty('appTrafficIV');
  });

  test('serverTrafficIV is shorter than serverTrafficKey', () => {
    const keys = deriveTrafficKeys('test');
    expect(keys.serverTrafficIV.length).toBeLessThan(keys.serverTrafficKey.length);
  });

  test('idempotent: same input produces same output', () => {
    const k1 = deriveTrafficKeys('ab:cd:ef:01');
    const k2 = deriveTrafficKeys('ab:cd:ef:01');
    expect(k1).toEqual(k2);
  });

  test('different inputs produce different outputs', () => {
    const k1 = deriveTrafficKeys('aa:bb:cc:dd');
    const k2 = deriveTrafficKeys('ee:ff:00:11');
    expect(k1.handshakeSecret).not.toEqual(k2.handshakeSecret);
  });
});
