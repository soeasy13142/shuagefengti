const { isPrime, gcd, extendedGcd, modPow, phi, modInverse, generateKeypair, encrypt, decrypt, modPowWithSteps } = require('../../utils/rsa-core');
const { PRIMES_2_997 } = require('../../utils/rsa-primes');

describe('PRIMES_2_997', () => {
  test('contains 168 primes', () => {
    expect(PRIMES_2_997.length).toBe(168);
  });
  test('first prime is 2, last is 997', () => {
    expect(PRIMES_2_997[0]).toBe(2);
    expect(PRIMES_2_997[PRIMES_2_997.length - 1]).toBe(997);
  });
  test('all entries are prime', () => {
    PRIMES_2_997.forEach(function(p) {
      expect(isPrime(p)).toBe(true);
    });
  });
});

describe('isPrime', () => {
  test('returns true for known primes', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(17)).toBe(true);
    expect(isPrime(97)).toBe(true);
    expect(isPrime(997)).toBe(true);
  });
  test('returns false for non-primes', () => {
    expect(isPrime(1)).toBe(false);
    expect(isPrime(0)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });
});

describe('gcd', () => {
  test('gcd(12, 8) returns 4', function() { expect(gcd(12, 8)).toBe(4); });
  test('gcd(17, 5) returns 1', function() { expect(gcd(17, 5)).toBe(1); });
  test('gcd(0, 5) returns 5', function() { expect(gcd(0, 5)).toBe(5); });
});

describe('extendedGcd', () => {
  test('5x + 288y = 1', () => {
    const r = extendedGcd(5, 288);
    expect(r.gcd).toBe(1);
    expect((r.x * 5 + r.y * 288) % 288).toBe(1);
  });
  test('3x + 10y = 1', () => {
    const r = extendedGcd(3, 10);
    expect(r.gcd).toBe(1);
  });
});

describe('modPow', () => {
  test('42^5 mod 323 = 264', () => {
    expect(modPow(42, 5, 323)).toBe(264);
  });
  test('264^173 mod 323 = 42 (RSA round-trip)', () => {
    expect(modPow(264, 173, 323)).toBe(42);
  });
  test('2^10 mod 1000 = 24', function() { expect(modPow(2, 10, 1000)).toBe(24); });
});

describe('phi', () => {
  test('phi(17, 19) = 288', function() { expect(phi(17, 19)).toBe(288); });
  test('phi(5, 7) = 24', function() { expect(phi(5, 7)).toBe(24); });
});

describe('modInverse', () => {
  test('5^-1 mod 288 = 173', () => {
    const inv = modInverse(5, 288);
    expect((inv * 5) % 288).toBe(1);
  });
  test('throws when gcd != 1', () => {
    expect(function() { modInverse(6, 10); }).toThrow();
  });
});

describe('generateKeypair', () => {
  test('p=17, q=19', () => {
    const key = generateKeypair(17, 19);
    expect(key.n).toBe(323);
    expect(key.phi).toBe(288);
    expect(key.e).toBe(5);
    expect(key.d).toBe(173);
    // ed ≡ 1 (mod phi)
    expect((key.e * key.d) % key.phi).toBe(1);
  });
  test('gcd(e,phi)=1 auto-finds next e', () => {
    const key = generateKeypair(3, 11);
    expect(key.e).toBeGreaterThan(0);
    expect(gcd(key.e, key.phi)).toBe(1);
  });
  test('p=q throws', () => {
    expect(function() { generateKeypair(17, 17); }).toThrow();
  });
  test('non-prime p throws', () => {
    expect(function() { generateKeypair(15, 17); }).toThrow();
  });
  test('key generation includes steps', () => {
    const key = generateKeypair(17, 19);
    expect(key.steps).toBeDefined();
    expect(key.steps.phiCalculation).toBeDefined();
    expect(key.steps.extendedEuclid).toBeDefined();
  });
});

describe('encrypt/decrypt round-trip', () => {
  test('RSA round-trip encrypt/decrypt', () => {
    const key = generateKeypair(17, 19);
    const c = encrypt(42, key.e, key.n);
    const m = decrypt(c, key.d, key.n);
    expect(m).toBe(42);
  });
  test('multiple message values', () => {
    const key = generateKeypair(23, 29);
    for (const m of [1, 100, 200, 500]) {
      expect(decrypt(encrypt(m, key.e, key.n), key.d, key.n)).toBe(m);
    }
  });
});

describe('modPowWithSteps', () => {
  test('shows binary decomposition and steps', () => {
    const result = modPowWithSteps(42, 5, 323);
    expect(result.final).toBe(264);
    expect(result.binary).toBe('101');
    expect(result.steps.length).toBe(3);
  });
});
