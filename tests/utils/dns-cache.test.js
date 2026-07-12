const LRUCache = require('../../utils/dns-cache').LRUCache;

describe('LRUCache', () => {
  test('stores and retrieves a value', () => {
    const cache = new LRUCache(3);
    cache.set('a', { ip: '1.2.3.4' });
    expect(cache.get('a')).toEqual({ ip: '1.2.3.4' });
  });

  test('returns null for missing keys', () => {
    const cache = new LRUCache(3);
    expect(cache.get('missing')).toBeNull();
  });

  test('evicts least-recently-used when capacity exceeded', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);  // evicts 'a'
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  test('get() refreshes recency', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');  // 'a' is now most recent
    cache.set('c', 3);  // evicts 'b'
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeNull();
  });

  test('has() returns boolean', () => {
    const cache = new LRUCache(3);
    cache.set('x', 'v');
    expect(cache.has('x')).toBe(true);
    expect(cache.has('y')).toBe(false);
  });

  test('delete() removes entry', () => {
    const cache = new LRUCache(3);
    cache.set('x', 'v');
    cache.delete('x');
    expect(cache.get('x')).toBeNull();
  });

  test('clear() empties cache', () => {
    const cache = new LRUCache(3);
    cache.set('a', 1);
    cache.clear();
    expect(cache.get('a')).toBeNull();
  });

  test('TTL expiration: entry past ttl returns null', () => {
    const cache = new LRUCache(3);
    const now = 1000;
    cache.set('a', 1, 10, now);
    expect(cache.get('a', now)).toBe(1);
    expect(cache.get('a', now + 5)).toBe(1);
    expect(cache.get('a', now + 11)).toBeNull();
  });
});
