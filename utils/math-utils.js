/**
 * Shared math utilities.
 *
 * Extracted from rsa-core.js and dh-core.js to eliminate DRY violation.
 */

/**
 * Fast modular exponentiation (Square-and-Multiply).
 *
 * Computes (base^exp) % mod using binary exponentiation.
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

module.exports = { modPow };
