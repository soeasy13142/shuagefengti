const { railFenceEncrypt, railFenceDecrypt, railFenceBruteForce, railFenceStructure } = require('../../utils/cipher-railfence');

describe('railFenceEncrypt', () => {
  test('rails=3 classic example', () => {
    const text = 'WEAREDISCOVEREDFLEEATONCE';
    expect(railFenceEncrypt(text, 3)).toBe('WECRLTEERDSOEEFEAOCAIVDEN');
  });
  test('rails=2', () => {
    expect(railFenceEncrypt('HELLO', 2)).toBe('HLOEL');
  });
  test('rails=4 short text', () => {
    expect(railFenceEncrypt('HELLO', 4)).toBe('HELOL');
  });
  test('preserves non-alpha characters', () => {
    expect(railFenceEncrypt('HELLO, WORLD!', 3).length).toBe('HELLO, WORLD!'.length);
  });
  test('handles single character', () => {
    expect(railFenceEncrypt('A', 3)).toBe('A');
  });
  test('handles rails=1 (no change)', () => {
    expect(railFenceEncrypt('HELLO', 1)).toBe('HELLO');
  });
});

describe('railFenceDecrypt', () => {
  test('rails=3 classic example', () => {
    const encrypted = 'WECRLTEERDSOEEFEAOCAIVDEN';
    expect(railFenceDecrypt(encrypted, 3)).toBe('WEAREDISCOVEREDFLEEATONCE');
  });
  test('rails=2 round-trip', () => {
    const text = 'HELLOWORLD';
    expect(railFenceDecrypt(railFenceEncrypt(text, 2), 2)).toBe(text);
  });
  test('rails=4 round-trip', () => {
    const text = 'THEQUICKBROWNFOX';
    expect(railFenceDecrypt(railFenceEncrypt(text, 4), 4)).toBe(text);
  });
  test('rails=5 round-trip', () => {
    const text = 'CIPHERTEXTFORTEST';
    expect(railFenceDecrypt(railFenceEncrypt(text, 5), 5)).toBe(text);
  });
  test('round-trip with spaces and punctuation', () => {
    const text = 'HELLO, WORLD! THIS IS TEST.';
    const encrypted = railFenceEncrypt(text, 3);
    expect(railFenceDecrypt(encrypted, 3)).toBe(text);
  });
});

describe('railFenceBruteForce', () => {
  test('returns rails 2-20', () => {
    const results = railFenceBruteForce('WECRLTEERDSOEEFEAOCAIVDEN');
    expect(results.length).toBe(19);
    expect(results[0].rails).toBe(2);
    expect(results[18].rails).toBe(20);
  });
  test('rails=3 produces original text', () => {
    const results = railFenceBruteForce('WECRLTEERDSOEEFEAOCAIVDEN');
    const r3 = results.find(r => r.rails === 3);
    expect(r3.result).toBe('WEAREDISCOVEREDFLEEATONCE');
  });
});

describe('railFenceStructure', () => {
  test('returns grid and readingOrder', () => {
    const s = railFenceStructure('HELLO', 3);
    expect(s.rails).toBe(3);
    expect(s.grid.length).toBe(3);
    expect(s.grid[0].length).toBe(5);
    expect(s.readingOrder.length).toBe(5);
  });
});
