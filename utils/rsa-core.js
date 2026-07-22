/**
 * RSA 教学演示核心数论模块
 *
 * 纯函数集合：素数判定、欧拉函数、扩展欧几里得、快速幂、模逆、密钥生成
 * 所有算术在 JS Number 安全范围内（p/q ≤ 997，n ≤ 994,009）
 *
 * CREDITS:
 * - 扩展欧几里得算法（extendedGcd）参考自 Knuth, D.E., "The Art of Computer Programming",
 *   Vol. 2: Seminumerical Algorithms, 3rd ed., Addison-Wesley, 1997, Section 4.5.2.
 * - 快速幂取模（modPow）采用经典二进制平方-乘算法（Square-and-Multiply），
 *   见 Cormen, T.H. et al., "Introduction to Algorithms", 3rd ed., MIT Press, 2009, Section 31.6.
 * - RSA 密钥生成遵循 PKCS #1 v2.2 (RFC 8017) 第 3 节规范，仅以教学演示为目的，
 *   省略 OAEP 填充、大素数生成等安全关键步骤。
 */

/**
 * 素数判定（试除法）
 * @param {number} n
 * @returns {boolean}
 */
function isPrime(n) {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0) return false;
  var limit = Math.floor(Math.sqrt(n));
  for (var i = 3; i <= limit; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * 最大公约数（辗转相除法）
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function gcd(a, b) {
  var aAbs = Math.abs(a);
  var bAbs = Math.abs(b);
  while (bAbs) {
    var t = bAbs;
    bAbs = aAbs % bAbs;
    aAbs = t;
  }
  return aAbs;
}

/**
 * 扩展欧几里得算法：ax + by = gcd(a, b)
 *
 * 参考：Knuth, TAOCP Vol. 2, Section 4.5.2
 * @param {number} a
 * @param {number} b
 * @returns {{ gcd: number, x: number, y: number }}
 */
function extendedGcd(a, b) {
  if (b === 0) return { gcd: a, x: 1, y: 0 };
  var _a = a;
  var _b = b;
  var x0 = 1, x1 = 0;
  var y0 = 0, y1 = 1;
  while (_b !== 0) {
    var q = Math.floor(_a / _b);
    var temp = _b;
    _b = _a - q * _b;
    _a = temp;

    var tx = x1;
    x1 = x0 - q * x1;
    x0 = tx;

    var ty = y1;
    y1 = y0 - q * y1;
    y0 = ty;
  }
  return { gcd: _a, x: x0, y: y0 };
}

/**
 * 快速幂取模（快速幂算法 - Square-and-Multiply）
 *
 * 参考：CLRS, "Introduction to Algorithms", 3rd ed., Section 31.6
 * @param {number} base
 * @param {number} exp
 * @param {number} mod
 * @returns {number}
 */
function modPow(base, exp, mod) {
  if (mod === 0) throw new Error('Modulus cannot be zero');
  var result = 1;
  var curBase = base % mod;
  var curExp = exp;
  while (curExp > 0) {
    if (curExp & 1) result = (result * curBase) % mod;
    curExp = curExp >>> 1;
    curBase = (curBase * curBase) % mod;
  }
  return result;
}

/**
 * 快速幂取模（带步骤追踪）
 * @param {number} base
 * @param {number} exp
 * @param {number} mod
 * @returns {{ base: number, exp: number, mod: number, binary: string, steps: Array<{bit: string, value: number, result: number}>, final: number }}
 */
function modPowWithSteps(base, exp, mod) {
  if (mod === 0) throw new Error('Modulus cannot be zero');
  var steps = [];
  var binary = exp.toString(2);
  var result = 1;
  var curBase = base % mod;
  var curExp = exp;
  while (curExp > 0) {
    var bit = curExp & 1 ? '1' : '0';
    if (bit === '1') result = (result * curBase) % mod;
    steps.push({ bit: bit, value: curBase, result: result });
    curExp = curExp >>> 1;
    curBase = (curBase * curBase) % mod;
  }
  return { base: base, exp: exp, mod: mod, binary: binary, steps: steps, final: result };
}

/**
 * 欧拉函数 φ(n) = (p-1)*(q-1)
 * @param {number} p
 * @param {number} q
 * @returns {number}
 */
function phi(p, q) {
  return (p - 1) * (q - 1);
}

/**
 * 模逆：a 在模 m 下的乘法逆元
 * 要求 gcd(a, m) = 1
 * @param {number} a
 * @param {number} m
 * @returns {number}
 */
function modInverse(a, m) {
  var eg = extendedGcd(a, m);
  if (eg.gcd !== 1) throw new Error('Modular inverse does not exist (gcd(a, m) != 1)');
  return ((eg.x % m) + m) % m;
}

/**
 * 生成 RSA 密钥对
 * @param {number} p - 素数
 * @param {number} q - 素数
 * @returns {{ p: number, q: number, n: number, phi: number, e: number, d: number, steps: object }}
 */
function generateKeypair(p, q) {
  if (!isPrime(p)) throw new Error('p is not prime');
  if (!isPrime(q)) throw new Error('q is not prime');
  if (p === q) throw new Error('p and q must be different');

  var n = p * q;
  var phiVal = phi(p, q);

  // 公钥指数：从 3 开始寻找与 phi 互素的数（教学演示用小 e）
  var e = 3;
  while (gcd(e, phiVal) !== 1 && e < phiVal) {
    e++;
  }
  if (e >= phiVal) throw new Error('Cannot find e coprime to phi(n). Try different p/q');

  // 扩展欧几里得求 d
  var egcd = extendedGcd(e, phiVal);
  var d = ((egcd.x % phiVal) + phiVal) % phiVal;

  // 步骤记录
  var steps = {
    phiCalculation: {
      p: p,
      q: q,
      phi: phiVal,
      detail: 'φ(n) = (' + p + '-1)×(' + q + '-1) = ' + phiVal
    },
    extendedEuclid: {
      a: e,
      b: phiVal,
      gcd: egcd.gcd,
      x: egcd.x,
      y: egcd.y,
      detail: e + '·x + ' + phiVal + '·y = 1 → x = ' + egcd.x + ', y = ' + egcd.y
    }
  };

  return { p: p, q: q, n: n, phi: phiVal, e: e, d: d, steps: steps };
}

/**
 * RSA 加密：c = m^e mod n
 * @param {number} m - 明文数值（0 ≤ m < n）
 * @param {number} e - 公钥指数
 * @param {number} n - 模数
 * @returns {number}
 */
function encrypt(m, e, n) {
  return modPow(m, e, n);
}

/**
 * RSA 解密：m = c^d mod n
 * @param {number} c - 密文数值
 * @param {number} d - 私钥指数
 * @param {number} n - 模数
 * @returns {number}
 */
function decrypt(c, d, n) {
  return modPow(c, d, n);
}

module.exports = {
  isPrime: isPrime,
  gcd: gcd,
  extendedGcd: extendedGcd,
  modPow: modPow,
  modPowWithSteps: modPowWithSteps,
  phi: phi,
  modInverse: modInverse,
  generateKeypair: generateKeypair,
  encrypt: encrypt,
  decrypt: decrypt
};
