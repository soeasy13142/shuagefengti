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
  const limit = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= limit; i += 2) {
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
  let aAbs = Math.abs(a);
  let bAbs = Math.abs(b);
  while (bAbs) {
    const t = bAbs;
    bAbs = aAbs % bAbs;
    aAbs = t;
  }
  return aAbs;
}

/**
 * 扩展欧几里得算法：ax + by = gcd(a, b)
 *
 * 参考：Knuth, TAOCP Vol. 2, Section 4.5.2
 * 返回结果中包含 Euclidean 除法步骤（dividend = quotient x divisor + remainder）
 * @param {number} a
 * @param {number} b
 * @returns {{ gcd: number, x: number, y: number, steps: Array<{dividend: number, quotient: number, divisor: number, remainder: number}> }}
 */
function extendedGcd(a, b) {
  if (b === 0) return { gcd: a, x: 1, y: 0, steps: [] };
  let _a = a;
  let _b = b;
  let x0 = 1, x1 = 0;
  let y0 = 0, y1 = 1;
  const steps = [];
  let stepNum = 0;
  while (_b !== 0) {
    const q = Math.floor(_a / _b);
    const temp = _b;
    const remainder = _a - q * _b;
    _b = remainder;
    _a = temp;

    // Record Euclidean division step (skip trivial q=0 swap steps)
    if (q > 0) {
      stepNum++;
      steps.push({
        dividend: temp,
        quotient: q,
        divisor: _b === 0 ? temp : _b,
        remainder: remainder
      });
    }

    const tx = x1;
    x1 = x0 - q * x1;
    x0 = tx;

    const ty = y1;
    y1 = y0 - q * y1;
    y0 = ty;
  }
  // Replace last step's divisor (which was set to temp before the update)
  // with the actual divisor that produced remainder 0
  if (steps.length > 0) {
    const last = steps[steps.length - 1];
    last.divisor = last.dividend;
    last.remainder = 0;
  }
  return { gcd: _a, x: x0, y: y0, steps: steps };
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
  let result = 1;
  let curBase = base % mod;
  let curExp = exp;
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
  const steps = [];
  const binary = exp.toString(2);
  let result = 1;
  let curBase = base % mod;
  let curExp = exp;
  while (curExp > 0) {
    const bit = curExp & 1 ? '1' : '0';
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
  const eg = extendedGcd(a, m);
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

  const n = p * q;
  const phiVal = phi(p, q);

  // 公钥指数：从 3 开始寻找与 phi 互素的数（教学演示用小 e）
  let e = 3;
  while (gcd(e, phiVal) !== 1 && e < phiVal) {
    e++;
  }
  if (e >= phiVal) throw new Error('Cannot find e coprime to phi(n). Try different p/q');

  // 扩展欧几里得求 d
  const egcd = extendedGcd(e, phiVal);
  const d = ((egcd.x % phiVal) + phiVal) % phiVal;

  // 步骤记录
  const steps = {
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
