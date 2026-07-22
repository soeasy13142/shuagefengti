const { vigenereEncrypt, vigenereDecrypt, vigenereWithSteps } = require('../../utils/cipher-vigenere');

describe('vigenereEncrypt', () => {
  test('classic example: ATTACKATDAWN with LEMON → LXFOPVEFRNHR', () => {
    expect(vigenereEncrypt('ATTACKATDAWN', 'LEMON')).toBe('LXFOPVEFRNHR');
  });
  test('key repeats to match text length', () => {
    expect(vigenereEncrypt('AAA', 'KEY')).toBe('KEY');
  });
  test('preserves non-alpha characters', () => {
    expect(vigenereEncrypt('HELLO, WORLD!', 'KEY')).toBe('RIJVS, UYVJN!');
  });
  test('handles empty string', () => {
    expect(vigenereEncrypt('', 'KEY')).toBe('');
  });
  test('converts key to uppercase', () => {
    expect(vigenereEncrypt('HELLO', 'key')).toBe('RIJVS');
  });
  test('ignores non-alpha in key (silently filters)', () => {
    expect(vigenereEncrypt('HELLO', 'KEY123')).toBe('RIJVS');
  });
});

describe('vigenereDecrypt', () => {
  test('LXFOPVEFRNHR with LEMON → ATTACKATDAWN', () => {
    expect(vigenereDecrypt('LXFOPVEFRNHR', 'LEMON')).toBe('ATTACKATDAWN');
  });
  test('round-trip encrypt/decrypt', () => {
    expect(vigenereDecrypt(vigenereEncrypt('HELLO WORLD', 'TEST'), 'TEST')).toBe('HELLO WORLD');
  });
  test('throws on empty key', () => {
    expect(() => vigenereEncrypt('HELLO', '')).toThrow();
  });
});

describe('vigenereWithSteps', () => {
  test('returns keyRepeated and mapping', () => {
    const steps = vigenereWithSteps('ATTACKATDAWN', 'LEMON');
    expect(steps.result).toBe('LXFOPVEFRNHR');
    expect(steps.keyRepeated).toBe('LEMONLEMONLE');
    expect(steps.mapping.length).toBe(12);
    expect(steps.offsets.length).toBeGreaterThan(0);
  });
});
