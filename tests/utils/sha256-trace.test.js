const { trace, hammingDistance } = require('../../utils/sha256-trace');
const { sha256 } = require('../../utils/sha256');

describe('trace - structure', () => {
  test('returns 64 rounds for a single-block message', () => {
    const result = trace('abc', 'utf-8');
    expect(result.rounds.length).toBe(64);
    expect(result.numBlocks).toBe(1);
  });

  test('each round has full state (W, a-h, T1, T2, K)', () => {
    const result = trace('abc', 'utf-8');
    const r0 = result.rounds[0];
    expect(r0.round).toBe(0);
    expect(r0.W.length).toBe(64);
    expect(r0.W.every(w => Number.isInteger(w) && w >= 0 && w < 0x100000000)).toBe(true);
    expect(r0.K).toBe(0x428a2f98);
    for (const k of ['a','b','c','d','e','f','g','h','T1','T2']) {
      expect(typeof r0[k]).toBe('number');
      expect(r0[k]).toBeGreaterThanOrEqual(0);
      expect(r0[k]).toBeLessThan(0x100000000);
    }
  });

  test('W[0..15] for round 0 equal big-endian words of padded block', () => {
    const result = trace('abc', 'utf-8');
    expect(result.rounds[0].W[0]).toBe(0x61626380 >>> 0);
    expect(result.rounds[0].W[1]).toBe(0);
  });

  test('K values match FIPS 180-4 §4.2.2', () => {
    const result = trace('abc', 'utf-8');
    const expectedK = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5
    ];
    for (let t = 0; t < 8; t++) {
      expect(result.rounds[t].K).toBe(expectedK[t]);
    }
    expect(result.rounds[63].K).toBe(0xc67178f2);
  });

  test('trace final hash matches sha256()', () => {
    const msg = 'hello world';
    const result = trace(msg, 'utf-8');
    expect(result.finalHash).toBe(sha256(msg, 'utf-8'));
  });

  test('initial round 0 uses H_INIT values for a-h', () => {
    const result = trace('', 'utf-8');
    expect(result.rounds[0].a).toBe(0x6a09e667);
    expect(result.rounds[0].b).toBe(0xbb67ae85);
    expect(result.rounds[0].h).toBe(0x5be0cd19);
  });
});

describe('trace - multi-block', () => {
  test('records 64 rounds per block (still 64 for multi-block since we expose last)', () => {
    const result = trace('x'.repeat(120), 'utf-8');
    expect(result.numBlocks).toBeGreaterThanOrEqual(2);
    expect(result.rounds.length).toBe(64);
  });
});

describe('hammingDistance', () => {
  test('identical hex strings have distance 0', () => {
    expect(hammingDistance('abc123', 'abc123')).toBe(0);
  });

  test('flipped bit shows distance 1', () => {
    expect(hammingDistance('00000001', '00000003')).toBe(1);
  });

  test('128 hex chars = 512 bits (sha256 output is 256 bits, but the helper accepts any hex)', () => {
    expect(hammingDistance(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )).toBe(0);
  });
});
