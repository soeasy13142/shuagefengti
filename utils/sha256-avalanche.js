/**
 * SHA-256 avalanche effect tools.
 *
 * Compares hash outputs of two inputs differing by 1 bit.
 * Expected: ~128 of 256 bits differ (50%), per diffusion property.
 */

const { sha256 } = require('./sha256');
const { hammingDistance } = require('./sha256-trace');

function _utf8Encode(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + (((code & 0x3ff) << 10) | (low & 0x3ff));
        i++;
        bytes.push(
          0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f),
          0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f)
        );
      } else {
        bytes.push(0xef, 0xbf, 0xbd);
      }
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Flip bit 0 of the first byte of the UTF-8 encoding.
 *
 * @param {string} text
 * @param {'utf-8'} [encoding]
 * @returns {{ original: Uint8Array, flipped: Uint8Array, originalStr: string, flippedStr: string, flippedBitOffset: number }}
 */
function flipFirstBit(text, encoding) {
  if (encoding && encoding !== 'utf-8') {
    throw new Error('Only utf-8 encoding is supported');
  }
  const original = _utf8Encode(text);
  if (original.length === 0) {
    throw new Error('Cannot flip bit of empty input');
  }
  const flipped = new Uint8Array(original);
  flipped[0] = flipped[0] ^ 0x01;  // XOR with bit 0
  // Read flipped bytes back as Latin-1 string for display (lossy for multi-byte)
  let flippedStr = '';
  for (let i = 0; i < flipped.length; i++) {
    flippedStr += String.fromCharCode(flipped[i]);
  }
  return {
    original: original,
    flipped: flipped,
    originalStr: text,
    flippedStr: flippedStr,
    flippedBitOffset: 0
  };
}

/**
 * Compute avalanche effect between two inputs.
 *
 * @param {string} originalText
 * @param {string} flippedText
 * @param {'utf-8'} [encoding]
 * @returns {{ originalHash: string, flippedHash: string, bitDistance: number, diffRatio: number }}
 */
function avalancheReport(originalText, flippedText, encoding) {
  if (encoding && encoding !== 'utf-8') {
    throw new Error('Only utf-8 encoding is supported');
  }
  const originalHash = sha256(originalText, 'utf-8');
  const flippedHash = sha256(flippedText, 'utf-8');
  const bitDistance = hammingDistance(originalHash, flippedHash);
  const diffRatio = bitDistance / 256;
  return {
    originalHash,
    flippedHash,
    bitDistance,
    diffRatio
  };
}

module.exports = {
  flipFirstBit,
  avalancheReport
};
