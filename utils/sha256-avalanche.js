/**
 * SHA-256 avalanche effect tools.
 *
 * Compares hash outputs of two inputs differing by 1 bit.
 * Expected: ~128 of 256 bits differ (50%), per diffusion property.
 */

const { sha256 } = require('./sha256');
const { hammingDistance } = require('./sha256-trace');
const { utf8Encode } = require('./encoding');

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
  const original = utf8Encode(text);
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
