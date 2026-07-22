const { analyzeFrequency, STANDARD_ENGLISH_FREQ } = require('../../utils/cipher-freq');

describe('STANDARD_ENGLISH_FREQ', () => {
  test('has 26 entries', () => {
    expect(STANDARD_ENGLISH_FREQ.length).toBe(26);
  });
  test('first entry is E with ~12.7%', () => {
    const e = STANDARD_ENGLISH_FREQ.find(f => f.letter === 'E');
    expect(e).toBeDefined();
    expect(e.pct).toBeCloseTo(12.7, 0);
  });
  test('sums to 100%', () => {
    const total = STANDARD_ENGLISH_FREQ.reduce((s, f) => s + f.pct, 0);
    expect(total).toBeCloseTo(100, 0);
  });
});

describe('analyzeFrequency', () => {
  test('counts letters correctly', () => {
    const result = analyzeFrequency('AABBCC');
    const a = result.find(f => f.letter === 'A');
    expect(a.count).toBe(2);
    expect(a.pct).toBeCloseTo(33.33, 0);
  });
  test('ignores non-alpha characters', () => {
    const result = analyzeFrequency('A A B B C C');
    const total = result.reduce((s, f) => s + f.count, 0);
    expect(total).toBe(6);
  });
  test('returns 26 entries', () => {
    const result = analyzeFrequency('HELLO WORLD');
    expect(result.length).toBe(26);
  });
  test('frequency sums to 100%', () => {
    const result = analyzeFrequency('HELLO WORLD THIS IS A TEST MESSAGE');
    const total = result.reduce((s, f) => s + f.pct, 0);
    expect(total).toBeCloseTo(100, 1);
  });
  test('handles empty string (all zero)', () => {
    const result = analyzeFrequency('');
    expect(result.every(f => f.count === 0 && f.pct === 0)).toBe(true);
  });
  test('handles non-alpha-only string', () => {
    const result = analyzeFrequency('123 !@#');
    expect(result.every(f => f.count === 0)).toBe(true);
  });
});
