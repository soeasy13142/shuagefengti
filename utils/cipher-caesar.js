/**
 * Caesar cipher utilities
 * @module utils/cipher-caesar
 */

const A_CODE = 'A'.charCodeAt(0);
const Z_CODE = 'Z'.charCodeAt(0);
const a_CODE = 'a'.charCodeAt(0);
const z_CODE = 'z'.charCodeAt(0);

/**
 * Shift a single uppercase letter by given offset
 * @param {number} code - char code of uppercase letter
 * @param {number} shift - shift amount (1-25)
 * @returns {number} shifted char code
 */
function _shiftChar(code, shift, baseCode) {
  return ((code - baseCode + shift) % 26 + 26) % 26 + baseCode;
}

/**
 * Encrypt text using Caesar cipher
 * @param {string} text - plaintext
 * @param {number} shift - shift amount (1-25)
 * @returns {string} ciphertext
 */
function caesarEncrypt(text, shift) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    const code = text.charCodeAt(i);
    if (code >= A_CODE && code <= Z_CODE) {
      result += String.fromCharCode(_shiftChar(code, shift, A_CODE));
    } else if (code >= a_CODE && code <= z_CODE) {
      result += String.fromCharCode(_shiftChar(code, shift, a_CODE));
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Decrypt text using Caesar cipher
 * @param {string} text - ciphertext
 * @param {number} shift - shift amount used during encryption
 * @returns {string} plaintext
 */
function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, 26 - (shift % 26));
}

/**
 * Brute-force decrypt by trying all 25 possible shifts
 * @param {string} text - ciphertext
 * @returns {Array<{shift: number, result: string}>}
 */
function caesarBruteForce(text) {
  const results = [];
  for (let shift = 1; shift <= 25; shift++) {
    results.push({
      shift: shift,
      result: caesarDecrypt(text, shift)
    });
  }
  return results;
}

module.exports = { caesarEncrypt, caesarDecrypt, caesarBruteForce };
