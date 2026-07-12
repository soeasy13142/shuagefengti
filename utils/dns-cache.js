/**
 * LRU 缓存（带 TTL）
 *
 * 用 Map 的插入顺序保证 LRU 语义：尾部最新，头部最旧。
 * 容量满时删除头部；get 时删除后重新插入以刷新 recency。
 */

/**
 * 默认 TTL（秒）：5 分钟。DNS 解析结果使用此值。
 * @type {number}
 */
const DEFAULT_TTL = 300;

/**
 * LRU 缓存（带过期时间）
 *
 * 用 Map 的插入顺序天然保证 LRU 语义：
 * - `set` 总是把最新条目放到末尾
 * - `get` 删除后重新插入以刷新 recency
 * - 容量满时淘汰头部（最旧）
 *
 * 每个条目附带 `expiresAt`（秒）。`get` 时若发现已过期则删除并返回 null。
 *
 * @example
 * const cache = new LRUCache(50);
 * cache.set('a.iana-servers.net', { ip: '93.184.216.34' });
 * const hit = cache.get('a.iana-servers.net');
 */
class LRUCache {
  /**
   * @param {number} [capacity=50] 最大容量（正整数）。超过则按 LRU 淘汰。
   * @throws {Error} 当 capacity 非正整数时
   */
  constructor(capacity = 50) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('capacity must be a positive integer');
    }
    /** @private */
    this._capacity = capacity;
    /** @private @type {Map<string, {value: any, expiresAt: number}>} */
    this._map = new Map();
  }

  /**
   * 获取值。过期或不存在则返回 null；命中时刷新 recency。
   *
   * @param {string} key 缓存键
   * @param {number} [now] 当前时间戳（秒），便于测试；默认 `Math.floor(Date.now()/1000)`
   * @returns {*} 缓存值或 null
   */
  get(key, now = Math.floor(Date.now() / 1000)) {
    const entry = this._map.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= now) {
      this._map.delete(key);
      return null;
    }
    // 刷新 recency：删除后重新插入（Map 保持插入顺序）
    this._map.delete(key);
    this._map.set(key, entry);
    return entry.value;
  }

  /**
   * 设置值。容量满时按 LRU 淘汰最旧条目；ttl 后过期。
   *
   * @param {string} key 缓存键
   * @param {*} value 任意可缓存值
   * @param {number} [ttl=DEFAULT_TTL] 过期时间（秒）
   * @param {number} [now] 当前时间戳（秒），便于测试；默认 `Math.floor(Date.now()/1000)`
   * @returns {void}
   */
  set(key, value, ttl = DEFAULT_TTL, now) {
    if (this._map.has(key)) {
      this._map.delete(key);
    } else if (this._map.size >= this._capacity) {
      // 淘汰最旧（头部）
      const oldestKey = this._map.keys().next().value;
      this._map.delete(oldestKey);
    }
    const nowSec = now !== undefined ? now : Math.floor(Date.now() / 1000);
    this._map.set(key, {
      value,
      expiresAt: nowSec + ttl
    });
  }

  /**
   * 判断键是否存在（不过滤过期）。
   *
   * @param {string} key 缓存键
   * @returns {boolean} 存在返回 true
   */
  has(key) {
    return this._map.has(key);
  }

  /**
   * 删除指定条目。
   *
   * @param {string} key 缓存键
   * @returns {boolean} 是否实际删除了条目
   */
  delete(key) {
    return this._map.delete(key);
  }

  /**
   * 清空所有条目。
   *
   * @returns {void}
   */
  clear() {
    this._map.clear();
  }

  /**
   * 当前条目数量（含未过期与已过期但未触发 `get` 的条目）。
   *
   * @returns {number} 条目数
   */
  get size() {
    return this._map.size;
  }
}

module.exports = {
  LRUCache,
  DEFAULT_TTL
};
