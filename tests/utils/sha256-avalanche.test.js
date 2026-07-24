const { sha256 } = require('../../utils/sha256');
const {
  flipFirstBit,
  avalancheReport
} = require('../../utils/sha256-avalanche');

describe('sha256 multi-byte UTF-8', () => {
  test('handles multi-byte UTF-8 characters', () => {
    const result = sha256('你好世界');
    expect(result).toBeDefined();
    expect(result.length).toBe(64);
  });

  test('handles emoji characters', () => {
    const result = sha256('hello 🌍 world');
    expect(result).toBeDefined();
    expect(result.length).toBe(64);
  });

  test('different Chinese texts produce different hashes', () => {
    const hash1 = sha256('你好');
    const hash2 = sha256('您好');
    expect(hash1).not.toBe(hash2);
  });

  test('empty string produces valid hash', () => {
    const result = sha256('');
    expect(result.length).toBe(64);
  });

  test('long Chinese text produces valid hash', () => {
    const text = '先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。'.repeat(10);
    const result = sha256(text);
    expect(result.length).toBe(64);
  });
});

describe('flipFirstBit', () => {
  test('ASCII string: flips bit 0 of byte 0', () => {
    const result = flipFirstBit('A', 'utf-8');  // 0x41 = 0100 0001
    expect(result.originalStr).toBe('A');
    // Flip bit 0 -> 0x40 = '@'
    expect(result.flipped[0]).toBe(0x40);
    expect(result.flippedBitOffset).toBe(0);
  });

  test('first bit offset is reported', () => {
    const result = flipFirstBit('hello', 'utf-8');
    expect(result.flippedBitOffset).toBe(0);
    // 'h' = 0x68 = 0110 1000, flip bit 0 -> 0x69 = 'i'
    expect(result.flipped[0]).toBe(0x69);
  });

  test('rejects empty input (cannot flip bit when no bits)', () => {
    expect(() => flipFirstBit('', 'utf-8')).toThrow();
  });
});

describe('avalancheReport', () => {
  test('1-bit input flip causes hamming distance around 50% (80-180 range)', () => {
    const report = avalancheReport('hello', 'hellp');
    expect(report.bitDistance).toBeGreaterThanOrEqual(80);
    expect(report.bitDistance).toBeLessThanOrEqual(180);
    expect(report.diffRatio).toBeGreaterThan(0.3);
    expect(report.diffRatio).toBeLessThan(0.7);
  });

  test('reports both hashes', () => {
    const report = avalancheReport('abc', 'abd');
    expect(report.originalHash).toMatch(/^[0-9a-f]{64}$/);
    expect(report.flippedHash).toMatch(/^[0-9a-f]{64}$/);
    expect(report.originalHash).not.toBe(report.flippedHash);
  });

  test('identical inputs produce distance 0 (no avalanche)', () => {
    const report = avalancheReport('abc', 'abc');
    expect(report.bitDistance).toBe(0);
  });

  test('diffRatio is bitDistance / 256', () => {
    const report = avalancheReport('hello', 'hellp');
    expect(report.diffRatio).toBeCloseTo(report.bitDistance / 256, 5);
  });
});

describe('flipFirstBit with multi-byte UTF-8', () => {
  test('2-byte UTF-8 character (ñ = 0xC3 0xB1) flips first byte bit 0', () => {
    const result = flipFirstBit('ñ', 'utf-8');
    expect(result.original[0]).toBe(0xC3);
    expect(result.flipped[0]).toBe(0xC2);
    expect(result.flippedBitOffset).toBe(0);
  });

  test('3-byte UTF-8 character (你 = 0xE4 0xBD 0xA0) flips first byte', () => {
    const result = flipFirstBit('你', 'utf-8');
    expect(result.original[0]).toBe(0xE4);
    expect(result.flipped[0]).toBe(0xE5);
    expect(result.flippedBitOffset).toBe(0);
  });

  test('encoding !== utf-8 throws error', () => {
    expect(() => flipFirstBit('hello', 'latin-1')).toThrow('Only utf-8 encoding is supported');
  });
});

describe('avalancheReport with multi-byte UTF-8', () => {
  test('2-byte characters produce avalanche around 50%', () => {
    const report = avalancheReport('mañana', 'ma�ana');
    expect(report.bitDistance).toBeGreaterThanOrEqual(80);
    expect(report.bitDistance).toBeLessThanOrEqual(180);
  });

  test('3-byte characters produce avalanche around 50%', () => {
    const report = avalancheReport('你好世界', '你好世');
    expect(report.originalHash).not.toBe(report.flippedHash);
    expect(report.diffRatio).toBeGreaterThan(0.3);
    expect(report.diffRatio).toBeLessThanOrEqual(1);
  });
});

