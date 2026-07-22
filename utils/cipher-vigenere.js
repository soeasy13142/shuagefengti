/**
 * Vigenere cipher utilities
 * @module utils/cipher-vigenere
 */

const A_CODE = 'A'.charCodeAt(0);
const Z_CODE = 'Z'.charCodeAt(0);
const a_CODE = 'a'.charCodeAt(0);
const z_CODE = 'z'.charCodeAt(0);

/**
 * Filter key to only uppercase alpha chars
 * @param {string} key
 * @returns {string}
 */
function _filterKey(key) {
  let result = '';
  for (let i = 0; i < key.length; i++) {
    const code = key.charCodeAt(i);
    if (code >= A_CODE && code <= Z_CODE) {
      result += key.charAt(i);
    } else if (code >= a_CODE && code <= z_CODE) {
      result += String.fromCharCode(code - 32); // to uppercase
    }
  }
  return result;
}

/**
 * Encrypt plaintext using Vigenere cipher
 * @param {string} plaintext
 * @param {string} key
 * @returns {string}
 */
function vigenereEncrypt(plaintext, key) {
  const cleanKey = _filterKey(key);
  if (cleanKey.length === 0) {
    throw new Error('Key must contain at least one alphabetic character');
  }
  let result = '';
  let keyIndex = 0;
  for (let i = 0; i < plaintext.length; i++) {
    const ch = plaintext.charAt(i);
    const code = plaintext.charCodeAt(i);
    if (code >= A_CODE && code <= Z_CODE) {
      const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - A_CODE;
      result += String.fromCharCode((code - A_CODE + shift) % 26 + A_CODE);
      keyIndex++;
    } else if (code >= a_CODE && code <= z_CODE) {
      const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - A_CODE;
      result += String.fromCharCode((code - a_CODE + shift) % 26 + a_CODE);
      keyIndex++;
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Decrypt ciphertext using Vigenere cipher
 * @param {string} ciphertext
 * @param {string} key
 * @returns {string}
 */
function vigenereDecrypt(ciphertext, key) {
  const cleanKey = _filterKey(key);
  if (cleanKey.length === 0) {
    throw new Error('Key must contain at least one alphabetic character');
  }
  let result = '';
  let keyIndex = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    const ch = ciphertext.charAt(i);
    const code = ciphertext.charCodeAt(i);
    if (code >= A_CODE && code <= Z_CODE) {
      const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - A_CODE;
      result += String.fromCharCode((code - A_CODE - shift + 26) % 26 + A_CODE);
      keyIndex++;
    } else if (code >= a_CODE && code <= z_CODE) {
      const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - A_CODE;
      result += String.fromCharCode((code - a_CODE - shift + 26) % 26 + a_CODE);
      keyIndex++;
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Encrypt with step-by-step details
 * @param {string} plaintext
 * @param {string} key
 * @returns {{ result: string, keyRepeated: string, offsets: number[], mapping: Array<{input: string, keyChar: string, offset: number, output: string}> }}
 */
function vigenereWithSteps(plaintext, key) {
  const cleanKey = _filterKey(key);
  let result = '';
  let keyRepeated = '';
  const offsets = [];
  const mapping = [];
  let keyIndex = 0;
  for (let i = 0; i < plaintext.length; i++) {
    const ch = plaintext.charAt(i);
    const code = plaintext.charCodeAt(i);
    if (code >= A_CODE && code <= Z_CODE || code >= a_CODE && code <= z_CODE) {
      const isUpper = code >= A_CODE && code <= Z_CODE;
      const base = isUpper ? A_CODE : a_CODE;
      const keyChar = cleanKey.charAt(keyIndex % cleanKey.length);
      const shift = keyChar.charCodeAt(0) - A_CODE;
      const outputCode = (code - base + shift) % 26 + base;
      const outputChar = String.fromCharCode(outputCode);
      result += outputChar;
      keyRepeated += keyChar;
      offsets.push(shift);
      mapping.push({
        input: ch,
        keyChar: keyChar,
        offset: shift,
        output: outputChar
      });
      keyIndex++;
    } else {
      result += ch;
      keyRepeated += ' ';
      offsets.push(0);
      mapping.push({
        input: ch,
        keyChar: ' ',
        offset: 0,
        output: ch
      });
    }
  }
  return { result: result, keyRepeated: keyRepeated, offsets: offsets, mapping: mapping };
}

module.exports = { vigenereEncrypt, vigenereDecrypt, vigenereWithSteps };
