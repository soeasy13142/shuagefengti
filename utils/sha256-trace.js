/**
 * SHA-256 trace recorder.
 *
 * `trace(message)` returns the per-round state for the LAST 512-bit block
 * (each round has W[0..63] + a-h registers + T1/T2 + K[t]).
 * For multi-block messages, intermediate block state is not exposed to keep
 * the dataset bounded; the final hash still matches `sha256(message)`.
 */

const { sha256, _K, _H_INIT } = require('./sha256');

/* ── UTF-8 + padding helpers (mirror utils/sha256.js to expose block bytes) ── */

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

function _rotr(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }
function _Ch(x, y, z)  { return ((x & y) ^ ((~x) & z)) >>> 0; }
function _Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)) >>> 0; }
function _Sigma0(x)    { return (_rotr(x, 2) ^ _rotr(x, 13) ^ _rotr(x, 22)) >>> 0; }
function _Sigma1(x)    { return (_rotr(x, 6) ^ _rotr(x, 11) ^ _rotr(x, 25)) >>> 0; }
function _sigma0(x)    { return (_rotr(x, 7) ^ _rotr(x, 18) ^ (x >>> 3)) >>> 0; }
function _sigma1(x)    { return (_rotr(x, 17) ^ _rotr(x, 19) ^ (x >>> 10)) >>> 0; }

function _add32(...args) {
  let sum = 0;
  for (let i = 0; i < args.length; i++) sum = (sum + args[i]) >>> 0;
  return sum;
}

function _padMessage(msgBytes) {
  const msgLenBits = msgBytes.length * 8;
  const padLen = (56 - (msgBytes.length + 1) % 64 + 64) % 64;
  const padded = new Uint8Array(msgBytes.length + 1 + padLen + 8);
  padded.set(msgBytes, 0);
  padded[msgBytes.length] = 0x80;
  const lenHigh = Math.floor(msgLenBits / 0x100000000);
  const lenLow = msgLenBits >>> 0;
  const lenOffset = padded.length - 8;
  padded[lenOffset]     = (lenHigh >>> 24) & 0xff;
  padded[lenOffset + 1] = (lenHigh >>> 16) & 0xff;
  padded[lenOffset + 2] = (lenHigh >>> 8)  & 0xff;
  padded[lenOffset + 3] = lenHigh & 0xff;
  padded[lenOffset + 4] = (lenLow >>> 24) & 0xff;
  padded[lenOffset + 5] = (lenLow >>> 16) & 0xff;
  padded[lenOffset + 6] = (lenLow >>> 8)  & 0xff;
  padded[lenOffset + 7] = lenLow & 0xff;
  return padded;
}

/**
 * Process one block AND record each of the 64 rounds.
 * Caller passes a starting H (8-elem Uint32Array-like, mutated in place).
 * @returns {Array<Object>} 64 round records
 */
function _processBlockTraced(H, block) {
  const W = new Uint32Array(64);
  for (let t = 0; t < 16; t++) {
    W[t] = ((block[t * 4] << 24) |
            (block[t * 4 + 1] << 16) |
            (block[t * 4 + 2] << 8) |
            (block[t * 4 + 3])) >>> 0;
  }
  for (let t = 16; t < 64; t++) {
    W[t] = _add32(_sigma1(W[t - 2]), W[t - 7], _sigma0(W[t - 15]), W[t - 16]);
  }

  let a = H[0], b = H[1], c = H[2], d = H[3];
  let e = H[4], f = H[5], g = H[6], h = H[7];

  const rounds = [];
  for (let t = 0; t < 64; t++) {
    const T1 = _add32(h, _Sigma1(e), _Ch(e, f, g), _K[t], W[t]);
    const T2 = _add32(_Sigma0(a), _Maj(a, b, c));
    rounds.push({
      round: t,
      W: Array.from(W),
      a: a >>> 0, b: b >>> 0, c: c >>> 0, d: d >>> 0,
      e: e >>> 0, f: f >>> 0, g: g >>> 0, h: h >>> 0,
      T1: T1 >>> 0,
      T2: T2 >>> 0,
      K: _K[t]
    });
    h = g;
    g = f;
    f = e;
    e = _add32(d, T1);
    d = c;
    c = b;
    b = a;
    a = _add32(T1, T2);
  }

  H[0] = _add32(H[0], a);
  H[1] = _add32(H[1], b);
  H[2] = _add32(H[2], c);
  H[3] = _add32(H[3], d);
  H[4] = _add32(H[4], e);
  H[5] = _add32(H[5], f);
  H[6] = _add32(H[6], g);
  H[7] = _add32(H[7], h);

  return rounds;
}

/**
 * Compute SHA-256 and return round traces.
 *
 * @param {string} message
 * @param {'utf-8'} [encoding]
 * @returns {{ rounds: Array<Object>, finalHash: string, numBlocks: number }}
 */
function trace(message, encoding) {
  if (encoding && encoding !== 'utf-8') {
    throw new Error('Only utf-8 encoding is supported');
  }
  const msgBytes = _utf8Encode(String(message === undefined ? '' : message));
  const padded = _padMessage(msgBytes);

  let lastRounds = [];
  const H = new Uint32Array(_H_INIT);
  const numBlocks = padded.length / 64;
  for (let offset = 0; offset < padded.length; offset += 64) {
    lastRounds = _processBlockTraced(H, padded.subarray(offset, offset + 64));
  }

  let hex = '';
  for (let i = 0; i < 8; i++) {
    hex += H[i].toString(16).padStart(8, '0');
  }

  return { rounds: lastRounds, finalHash: hex, numBlocks };
}

/**
 * Compute Hamming distance between two equal-length hex strings, in bits.
 *
 * @param {string} hexA
 * @param {string} hexB
 * @returns {number}
 */
function hammingDistance(hexA, hexB) {
  if (typeof hexA !== 'string' || typeof hexB !== 'string') {
    throw new Error('hammingDistance: both args must be hex strings');
  }
  if (hexA.length !== hexB.length) {
    throw new Error('hammingDistance: hex strings must be equal length');
  }
  let distance = 0;
  for (let i = 0; i < hexA.length; i += 8) {
    const a = parseInt(hexA.substr(i, 8), 16);
    const b = parseInt(hexB.substr(i, 8), 16);
    let x = (a ^ b) >>> 0;
    while (x) {
      distance += x & 1;
      x >>>= 1;
    }
  }
  return distance;
}

module.exports = {
  trace,
  hammingDistance
};
