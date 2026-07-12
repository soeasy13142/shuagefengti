/**
 * SHA-256 implementation (FIPS 180-4 §6.2 compatible)
 *
 * Pure JavaScript, 32-bit unsigned arithmetic.
 * Every bitwise result is normalized with `>>> 0` to prevent
 * negative-number propagation through the `+` operator.
 * No BigInt, no external dependencies.
 */

/**
 * Round constants K[0..63] — first 32 bits of fractional parts of
 * cube roots of the first 64 primes (2..311). FIPS 180-4 §4.2.2.
 * @private
 */
const _K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

/**
 * Initial hash value H[0..7] — first 32 bits of fractional parts of
 * square roots of the first 8 primes. FIPS 180-4 §5.3.3.
 * @private
 */
const _H_INIT = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);

/* ── Bitwise helpers ── */

/**
 * 32-bit unsigned right rotation — always returns a positive u32.
 */
function _rotr(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * SHA-256 functions (FIPS 180-4 §4.1.2).
 * Each result is explicitly normalized to u32 via >>> 0.
 */
function _Ch(x, y, z)   { return ((x & y) ^ ((~x) & z)) >>> 0; }
function _Maj(x, y, z)  { return ((x & y) ^ (x & z) ^ (y & z)) >>> 0; }
function _Sigma0(x)     { return (_rotr(x, 2) ^ _rotr(x, 13) ^ _rotr(x, 22)) >>> 0; }
function _Sigma1(x)     { return (_rotr(x, 6) ^ _rotr(x, 11) ^ _rotr(x, 25)) >>> 0; }
function _sigma0(x)     { return (_rotr(x, 7) ^ _rotr(x, 18) ^ (x >>> 3)) >>> 0; }
function _sigma1(x)     { return (_rotr(x, 17) ^ _rotr(x, 19) ^ (x >>> 10)) >>> 0; }

/**
 * 32-bit unsigned addition with wrap-around.
 */
function _add32(...args) {
  let sum = 0;
  for (let i = 0; i < args.length; i++) sum = (sum + args[i]) >>> 0;
  return sum;
}

/* ── UTF-8 encoding ── */

/**
 * Encode a JS string to UTF-8 bytes.
 * WeChat mini-program lacks TextEncoder in some contexts; manual implementation.
 * @param {string} str
 * @returns {Uint8Array}
 */
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

/* ── Compression ── */

/**
 * Process a single 512-bit (64-byte) block, mutating H in-place.
 *
 * @param {Uint32Array} H    — length 8, mutated in place
 * @param {Uint8Array} block — length 64
 */
function _processBlock(H, block) {
  // Message schedule W[0..63]
  const W = new Uint32Array(64);
  for (let t = 0; t < 16; t++) {
    W[t] = (block[t * 4] << 24) | (block[t * 4 + 1] << 16) |
           (block[t * 4 + 2] << 8) | (block[t * 4 + 3]);
    W[t] >>>= 0;
  }
  for (let t = 16; t < 64; t++) {
    W[t] = _add32(_sigma1(W[t - 2]), W[t - 7], _sigma0(W[t - 15]), W[t - 16]);
  }

  // Working variables
  let a = H[0], b = H[1], c = H[2], d = H[3];
  let e = H[4], f = H[5], g = H[6], h = H[7];

  // 64 rounds
  for (let t = 0; t < 64; t++) {
    const T1 = _add32(h, _Sigma1(e), _Ch(e, f, g), _K[t], W[t]);
    const T2 = _add32(_Sigma0(a), _Maj(a, b, c));
    h = g;
    g = f;
    f = e;
    e = _add32(d, T1);
    d = c;
    c = b;
    b = a;
    a = _add32(T1, T2);
  }

  // Update H
  H[0] = _add32(H[0], a);
  H[1] = _add32(H[1], b);
  H[2] = _add32(H[2], c);
  H[3] = _add32(H[3], d);
  H[4] = _add32(H[4], e);
  H[5] = _add32(H[5], f);
  H[6] = _add32(H[6], g);
  H[7] = _add32(H[7], h);
}

/* ── Public API ── */

/**
 * Compute SHA-256 of a message string.
 *
 * @param {string} message
 * @param {'utf-8'} [encoding] — only utf-8 supported
 * @returns {string} 64-character lowercase hex digest
 */
function sha256(message, encoding) {
  if (encoding !== undefined && encoding !== 'utf-8') {
    throw new Error('Only utf-8 encoding is supported');
  }

  // 1. UTF-8 encode
  const msgBytes = _utf8Encode(message === undefined || message === null ? '' : String(message));
  const msgLenBits = msgBytes.length * 8;

  // 2. Pad
  const padLen = (56 - ((msgBytes.length + 1) % 64) + 64) % 64;
  const padded = new Uint8Array(msgBytes.length + 1 + padLen + 8);
  padded.set(msgBytes, 0);
  padded[msgBytes.length] = 0x80;
  // + padLen zeros (already zero)
  // Append 64-bit big-endian bit length
  const lenHigh = Math.floor(msgLenBits / 0x100000000);
  const lenLow  = msgLenBits >>> 0;
  const off = padded.length - 8;
  padded[off]     = (lenHigh >>> 24) & 0xff;
  padded[off + 1] = (lenHigh >>> 16) & 0xff;
  padded[off + 2] = (lenHigh >>> 8)  & 0xff;
  padded[off + 3] = lenHigh & 0xff;
  padded[off + 4] = (lenLow >>> 24) & 0xff;
  padded[off + 5] = (lenLow >>> 16) & 0xff;
  padded[off + 6] = (lenLow >>> 8)  & 0xff;
  padded[off + 7] = lenLow & 0xff;

  // 3. Initialize H
  const H = new Uint32Array(_H_INIT);

  // 4. Process blocks
  for (let pos = 0; pos < padded.length; pos += 64) {
    _processBlock(H, padded.subarray(pos, pos + 64));
  }

  // 5. Hex output (big-endian)
  let hex = '';
  for (let i = 0; i < 8; i++) {
    hex += H[i].toString(16).padStart(8, '0');
  }
  return hex;
}

module.exports = {
  sha256,
  _K,
  _H_INIT
};
