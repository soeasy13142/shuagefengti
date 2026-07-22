const { modPow, isPrimitiveRoot, findPrimitiveRoots, generateKeypair, computeSharedKey, bruteForceDiscreteLog } = require('../../utils/dh-core');
const { generateMitmScenario } = require('../../utils/dh-mitm');

describe('isPrimitiveRoot', () => {
  test('2 is primitive root modulo 13', () => {
    expect(isPrimitiveRoot(2, 13)).toBe(true);
  });
  test('3 is NOT primitive root modulo 13', () => {
    expect(isPrimitiveRoot(3, 13)).toBe(false);
  });
  test('6 is primitive root modulo 13 (in the list [2,6,7,11])', () => {
    expect(isPrimitiveRoot(6, 13)).toBe(true);
  });
  test('7 is primitive root modulo 13 (in the list [2,6,7,11])', () => {
    expect(isPrimitiveRoot(7, 13)).toBe(true);
  });
  test('g must be > 1 and < p', () => {
    expect(isPrimitiveRoot(1, 13)).toBe(false);
    expect(isPrimitiveRoot(13, 13)).toBe(false);
  });
});

describe('findPrimitiveRoots', () => {
  test('p=13 has 4 primitive roots', () => {
    const roots = findPrimitiveRoots(13);
    expect(roots.length).toBe(4);
    expect(roots).toEqual(expect.arrayContaining([2, 6, 7, 11]));
  });
  test('p=7 has 2 primitive roots: 3, 5', () => {
    const roots = findPrimitiveRoots(7);
    expect(roots).toEqual(expect.arrayContaining([3, 5]));
    expect(roots.length).toBe(2);
  });
  test('p=5 has 2 primitive roots: 2, 3', () => {
    const roots = findPrimitiveRoots(5);
    expect(roots).toEqual(expect.arrayContaining([2, 3]));
  });
});

describe('generateKeypair', () => {
  test('generates correct public key from given private key', () => {
    const key = generateKeypair(997, 7, 123);
    expect(key.privateKey).toBe(123);
    expect(key.publicKey).toBe(modPow(7, 123, 997));
  });
  test('generates random private key if not specified', () => {
    const key = generateKeypair(997, 7);
    expect(key.privateKey).toBeGreaterThan(1);
    expect(key.privateKey).toBeLessThan(996);
    expect(key.publicKey).toBeGreaterThan(0);
  });
  test('private key must be > 1', () => {
    expect(() => generateKeypair(997, 7, 0)).toThrow();
    expect(() => generateKeypair(997, 7, 1)).toThrow();
  });
  test('private key must be < p', () => {
    expect(() => generateKeypair(997, 7, 997)).toThrow();
  });
});

describe('computeSharedKey', () => {
  test('Alice and Bob compute same shared key', () => {
    const p = 997, g = 7;
    const alice = generateKeypair(p, g, 123);
    const bob = generateKeypair(p, g, 456);
    const sharedA = computeSharedKey(bob.publicKey, alice.privateKey, p);
    const sharedB = computeSharedKey(alice.publicKey, bob.privateKey, p);
    expect(sharedA).toBe(sharedB);
  });
  test('multiple key pairs produce consistent shared keys', () => {
    const p = 991, g = 6; // 6 is a primitive root of 991
    const alice = generateKeypair(p, g, 234);
    const bob = generateKeypair(p, g, 567);
    expect(computeSharedKey(bob.publicKey, alice.privateKey, p))
      .toBe(computeSharedKey(alice.publicKey, bob.privateKey, p));
  });
});

describe('bruteForceDiscreteLog', () => {
  test('finds known discrete log', () => {
    const result = bruteForceDiscreteLog(7, 997, 312);
    expect(result.foundX).toBe(193);
    expect(result.attempts).toBe(193);
    expect(result.totalSpace).toBe(996);
  });
  test('returns null when not found', () => {
    const result = bruteForceDiscreteLog(7, 997, 999);
    expect(result.foundX).toBeNull();
  });
  test('generates steps array', () => {
    const result = bruteForceDiscreteLog(7, 23, 17);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].x).toBe(1);
    expect(result.steps[0].result).toBeDefined();
  });
});

describe('generateMitmScenario', () => {
  test('produces 3 participants', () => {
    const scenario = generateMitmScenario(997, 7, 123, 456, 789);
    expect(scenario.alice).toBeDefined();
    expect(scenario.bob).toBeDefined();
    expect(scenario.eve).toBeDefined();
    expect(scenario.alice.name).toBe('Alice');
    expect(scenario.eve.name).toBe('Eve');
  });
  test('Alice and Bob have different shared keys under MITM', () => {
    const scenario = generateMitmScenario(997, 7, 123, 456, 789);
    expect(scenario.alice.sharedKey).not.toBe(scenario.bob.sharedKey);
    expect(scenario.alice.sharedKey).toBe(scenario.eve.sharedKeyAlice);
    expect(scenario.bob.sharedKey).toBe(scenario.eve.sharedKeyBob);
  });
  test('mitm steps include intercept messages', () => {
    const scenario = generateMitmScenario(997, 7, 123, 456, 789);
    const mitmSteps = scenario.steps.filter(s => s.type === 'mitmIntercept');
    expect(mitmSteps.length).toBe(2);
  });
});
