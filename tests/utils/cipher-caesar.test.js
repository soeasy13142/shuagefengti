const { caesarEncrypt, caesarDecrypt, caesarBruteForce } = require('../../utils/cipher-caesar');

describe('caesarEncrypt', () => {
  test('shift=3: HELLO → KHOOR', () => {
    expect(caesarEncrypt('HELLO', 3)).toBe('KHOOR');
  });
  test('preserves non-alpha characters', () => {
    expect(caesarEncrypt('HELLO, WORLD!', 3)).toBe('KHOOR, ZRUOG!');
  });
  test('wraps around Z→C (shift=3)', () => {
    expect(caesarEncrypt('XYZ', 3)).toBe('ABC');
  });
  test('shift=25: B → A', () => {
    expect(caesarEncrypt('B', 25)).toBe('A');
  });
  test('handles empty string', () => {
    expect(caesarEncrypt('', 3)).toBe('');
  });
  test('handles lowercase by preserving case', () => {
    expect(caesarEncrypt('Hello', 3)).toBe('Khoor');
  });
});

describe('caesarDecrypt', () => {
  test('shift=3: KHOOR → HELLO', () => {
    expect(caesarDecrypt('KHOOR', 3)).toBe('HELLO');
  });
  test('round-trip encrypt/decrypt', () => {
    const text = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
    expect(caesarDecrypt(caesarEncrypt(text, 13), 13)).toBe(text);
  });
});

describe('caesarBruteForce', () => {
  test('returns 25 results', () => {
    const results = caesarBruteForce('KHOOR');
    expect(results.length).toBe(25);
    const shift3 = results.find(r => r.shift === 3);
    expect(shift3.result).toBe('HELLO');
  });
  test('brute force all shifts are unique', () => {
    const results = caesarBruteForce('HELLO');
    const unique = new Set(results.map(r => r.result));
    expect(unique.size).toBe(25);
  });
});
