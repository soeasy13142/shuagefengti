const { sha256 } = require('../../utils/sha256');

describe('sha256 - FIPS 180-4 Appendix B test vectors', () => {
  test('empty string', () => {
    expect(sha256('', 'utf-8')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });

  test('"abc"', () => {
    expect(sha256('abc', 'utf-8')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  test('two-block 56-byte message (Appendix B.2)', () => {
    expect(
      sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq', 'utf-8')
    ).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  });

  test('returns 64-char lowercase hex', () => {
    const h = sha256('hello', 'utf-8');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('sha256 - padding edge cases', () => {
  test('55-byte message just below 64-byte padding boundary', () => {
    const msg = 'a'.repeat(55);
    const h = sha256(msg, 'utf-8');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toBe(sha256('a'.repeat(54), 'utf-8'));
  });

  test('63-byte message (just below block boundary)', () => {
    const msg = 'a'.repeat(63);
    const h = sha256(msg, 'utf-8');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  test('120-byte message (crosses multiple blocks)', () => {
    const msg = 'x'.repeat(120);
    const h = sha256(msg, 'utf-8');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toBe(sha256('x'.repeat(119), 'utf-8'));
  });
});

describe('sha256 - UTF-8 multi-byte', () => {
  test('Chinese characters hash deterministically', () => {
    const h1 = sha256('中文', 'utf-8');
    const h2 = sha256('中文', 'utf-8');
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });
});
