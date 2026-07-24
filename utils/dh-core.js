/**
 * Diffie-Hellman 密钥交换核心函数
 *
 * 本文件提供：
 * - modPow: 快速模幂运算（二进制指数扫描法）
 * - isPrimitiveRoot: 判断 g 是否为模 p 的本原根
 * - findPrimitiveRoots: 找出模 p 的所有本原根
 * - generateKeypair: 生成 DH 密钥对
 * - computeSharedKey: 计算共享密钥
 * - bruteForceDiscreteLog: 暴力搜索离散对数
 */

/**
 * 快速模幂运算（二进制指数扫描法）
 * 计算 (base^exp) % mod
 * @param {number} base
 * @param {number} exp
 * @param {number} mod
 * @returns {number}
 */
function modPow(base, exp, mod) {
  if (mod <= 1) return 0;
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) {
      result = (result * b) % mod;
    }
    e = e >> 1;
    b = (b * b) % mod;
  }
  return result;
}

/**
 * 获取 n 的所有素因子（去重）
 * @param {number} n
 * @returns {number[]}
 */
function _primeFactors(n) {
  const factors = [];
  let num = n;
  let d = 2;
  while (d * d <= num) {
    if (num % d === 0) {
      factors.push(d);
      while (num % d === 0) {
        num = Math.floor(num / d);
      }
    }
    d += d === 2 ? 1 : 2;
  }
  if (num > 1) {
    factors.push(num);
  }
  return factors;
}

/**
 * 判断 g 是否为模 p 的本原根
 *
 * 对 p-1 的每个素因子 q，检查 g^((p-1)/q) ≠ 1 mod p
 * @param {number} g
 * @param {number} p - 素数
 * @returns {boolean}
 */
function isPrimitiveRoot(g, p) {
  if (g <= 1 || g >= p) return false;
  if (p <= 2) return false;

  const factors = _primeFactors(p - 1);
  for (let i = 0; i < factors.length; i++) {
    const q = factors[i];
    const exp = (p - 1) / q;
    if (modPow(g, exp, p) === 1) {
      return false;
    }
  }
  return true;
}

// 模块级缓存：避免重复计算同一素数下的本原根列表
const _rootCache = {};

/**
 * 找出模 p 的所有本原根
 * @param {number} p - 素数
 * @returns {number[]}
 */
function findPrimitiveRoots(p) {
  if (_rootCache[p] !== undefined) {
    return _rootCache[p].slice();
  }
  const roots = [];
  for (let g = 2; g < p; g++) {
    if (isPrimitiveRoot(g, p)) {
      roots.push(g);
    }
  }
  _rootCache[p] = roots;
  return roots.slice();
}

/**
 * 生成 DH 密钥对
 *
 * 若 privateKey 未指定，自动在 [2, p-2] 范围内随机生成。
 * @param {number} p - 素数
 * @param {number} g - 模 p 的本原根
 * @param {number} [privateKey] - 可选私钥
 * @returns {{ privateKey: number, publicKey: number }}
 */
function generateKeypair(p, g, privateKey) {
  if (p <= 2) {
    throw new Error('p must be a prime larger than 2');
  }
  if (g <= 1 || g >= p) {
    throw new Error('g must be in (1, p)');
  }

  let priv;
  if (privateKey !== undefined) {
    if (privateKey <= 1) {
      throw new Error('private key must be > 1');
    }
    if (privateKey >= p) {
      throw new Error('private key must be < p');
    }
    priv = privateKey;
  } else {
    // 随机生成 [2, p-2]
    priv = Math.floor(Math.random() * (p - 3)) + 2;
  }

  const pub = modPow(g, priv, p);
  return { privateKey: priv, publicKey: pub };
}

/**
 * 计算共享密钥
 *
 * K = theirPublic^myPrivate mod p
 * @param {number} theirPublic - 对方公钥
 * @param {number} myPrivate - 我的私钥
 * @param {number} p - 素数
 * @returns {number}
 */
function computeSharedKey(theirPublic, myPrivate, p) {
  return modPow(theirPublic, myPrivate, p);
}

/**
 * 暴力搜索离散对数
 *
 * 从 1 到 p-1 遍历 x，寻找 g^x ≡ target (mod p) 的解。
 * @param {number} g
 * @param {number} p
 * @param {number} target
 * @returns {{ foundX: number | null, attempts: number, totalSpace: number, steps: Array<{ x: number, result: number }> }}
 */
function bruteForceDiscreteLog(g, p, target) {
  const totalSpace = p - 1;
  const steps = [];

  for (let x = 1; x < p; x++) {
    const result = modPow(g, x, p);
    steps.push({ x, result });
    if (result === target) {
      return { foundX: x, attempts: x, totalSpace, steps };
    }
  }

  return { foundX: null, attempts: totalSpace, totalSpace, steps };
}

module.exports = {
  modPow,
  isPrimitiveRoot,
  findPrimitiveRoots,
  generateKeypair,
  computeSharedKey,
  bruteForceDiscreteLog
};
