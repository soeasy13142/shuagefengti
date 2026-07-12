const { resolveSteps, validateDomain } = require('../../utils/dns-resolver');
const { LRUCache } = require('../../utils/dns-cache');

describe('validateDomain', () => {
  test('accepts valid domains', () => {
    expect(validateDomain('example.com')).toBe(true);
    expect(validateDomain('sub.example.com')).toBe(true);
    expect(validateDomain('a-b.example.org')).toBe(true);
  });
  test('rejects invalid domains', () => {
    expect(validateDomain('')).toBe(false);
    expect(validateDomain('example')).toBe(false);          // 无 TLD
    expect(validateDomain('-example.com')).toBe(false);     // 不能以 - 开头
    expect(validateDomain('example-.com')).toBe(false);     // 不能以 - 结尾
    expect(validateDomain('ex ample.com')).toBe(false);     // 不能有空格
  });
});

describe('resolveSteps - first query scenario', () => {
  test('generates full recursive chain for example.com', () => {
    const cache = new LRUCache(50);
    const steps = resolveSteps({ domain: 'example.com', scenario: 'first', cache, now: 1000 });
    expect(steps.length).toBeGreaterThanOrEqual(8);

    const firstStep = steps[0];
    expect(firstStep.from).toBe('client');
    expect(firstStep.to).toBe('resolver');
    expect(firstStep.type).toBe('query');
    expect(firstStep.payload.question.qname).toBe('example.com');

    const lastStep = steps[steps.length - 1];
    expect(lastStep.to).toBe('client');
    expect(lastStep.type).toBe('response');
    expect(lastStep.payload.answer.rdata).toMatch(/^\d/);
  });

  test('falls back to .com for unknown TLD', () => {
    const cache = new LRUCache(50);
    const steps = resolveSteps({ domain: 'example.xyz', scenario: 'first', cache, now: 1000 });
    const fallbackStep = steps.find(s => s.explanation && s.explanation.includes('未覆盖'));
    expect(fallbackStep).toBeDefined();
  });
});

describe('resolveSteps - cache hit scenario', () => {
  test('pre-populated cache produces a single cacheHit step', () => {
    const cache = new LRUCache(50);
    cache.set('example.com', { ip: '93.184.216.34', ttl: 300 }, 300);
    const steps = resolveSteps({ domain: 'example.com', scenario: 'cached', cache, now: 1000 });
    expect(steps.length).toBe(1);
    expect(steps[0].type).toBe('cacheHit');
    expect(steps[0].payload.answer.rdata).toBe('93.184.216.34');
  });
});

describe('resolveSteps - CNAME chain scenario', () => {
  test('CNAME domain triggers additional step', () => {
    const cache = new LRUCache(50);
    // 'www.example.com' 在 CNAME 链场景里被建模为 → example.com
    const steps = resolveSteps({ domain: 'www.example.com', scenario: 'cname', cache, now: 1000 });
    const cnameStep = steps.find(s =>
      s.payload && s.payload.answer && s.payload.answer.type === 'CNAME'
    );
    expect(cnameStep).toBeDefined();
  });
});

describe('resolveSteps - write-through cache', () => {
  test('first query writes to cache, second query hits cache', () => {
    const cache = new LRUCache(50);
    const steps1 = resolveSteps({ domain: 'example.com', scenario: 'first', cache, now: 1000 });
    expect(steps1.length).toBeGreaterThanOrEqual(8);

    const steps2 = resolveSteps({ domain: 'example.com', scenario: 'cached', cache, now: 1000 });
    expect(steps2.length).toBe(1);
    expect(steps2[0].type).toBe('cacheHit');
  });
});

describe('resolveSteps - error handling', () => {
  test('invalid domain returns error step', () => {
    const cache = new LRUCache(50);
    const steps = resolveSteps({ domain: 'not valid', scenario: 'first', cache, now: 1000 });
    expect(steps.length).toBe(1);
    expect(steps[0].type).toBe('error');
  });
});