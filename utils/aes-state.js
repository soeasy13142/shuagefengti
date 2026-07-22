/**
 * AES State Matrix Operations
 *
 * State is a 4x4 byte matrix stored column-major: state[row][col].
 * All operations are pure functions returning new state copies.
 */

const { sBox, xtime, gfMul } = require('./aes-core');

const AES_ROWS = 4;
const AES_COLS = 4;

/**
 * @typedef {number[][]} State - 4x4 byte matrix, state[row][col]
 */

/**
 * Create an empty 4x4 state matrix filled with zeros.
 * @returns {State}
 */
function _emptyState() {
  return Array.from({ length: AES_ROWS }, function() { return Array(AES_COLS).fill(0); });
}

/**
 * Clone a state matrix (deep copy).
 * @param {State} state
 * @returns {State}
 */
function _cloneState(state) {
  return state.map(function(row) { return row.slice(); });
}

/**
 * Convert 16 bytes to a 4x4 state matrix (column-major).
 * Input[0..3] -> column 0, input[4..7] -> column 1, etc.
 * @param {number[]} bytes - 16-element array
 * @returns {State}
 */
function bytesToState(bytes) {
  const s = _emptyState();
  for (let col = 0; col < AES_COLS; col++) {
    for (let row = 0; row < AES_ROWS; row++) {
      s[row][col] = bytes[col * AES_COLS + row];
    }
  }
  return s;
}

/**
 * Convert a 4x4 state matrix back to 16 bytes (column-major).
 * @param {State} state
 * @returns {number[]}
 */
function stateToBytes(state) {
  const bytes = [];
  for (let col = 0; col < AES_COLS; col++) {
    for (let row = 0; row < AES_ROWS; row++) {
      bytes.push(state[row][col]);
    }
  }
  return bytes;
}

/**
 * SubBytes: apply S-box substitution to every byte in the state.
 * @param {State} state
 * @returns {State}
 */
function subBytes(state) {
  const s = _cloneState(state);
  for (let row = 0; row < AES_ROWS; row++) {
    for (let col = 0; col < AES_COLS; col++) {
      s[row][col] = sBox[s[row][col]];
    }
  }
  return s;
}

/**
 * ShiftRows: cyclically shift rows left.
 * Row 0: 0 shifts, Row 1: 1 shift, Row 2: 2 shifts, Row 3: 3 shifts.
 * @param {State} state
 * @returns {State}
 */
function shiftRows(state) {
  const s = _cloneState(state);

  // Row 1: left shift by 1
  const r1 = [s[1][1], s[1][2], s[1][3], s[1][0]];

  // Row 2: left shift by 2
  const r2 = [s[2][2], s[2][3], s[2][0], s[2][1]];

  // Row 3: left shift by 3
  const r3 = [s[3][3], s[3][0], s[3][1], s[3][2]];

  s[1][0] = r1[0]; s[1][1] = r1[1]; s[1][2] = r1[2]; s[1][3] = r1[3];
  s[2][0] = r2[0]; s[2][1] = r2[1]; s[2][2] = r2[2]; s[2][3] = r2[3];
  s[3][0] = r3[0]; s[3][1] = r3[1]; s[3][2] = r3[2]; s[3][3] = r3[3];

  return s;
}

/**
 * MixColumns: apply MixColumns transformation to each column.
 * Uses GF(2^8) multiplication with the fixed polynomial:
 *   s0' = (2 * s0) XOR (3 * s1) XOR s2 XOR s3
 *   s1' = s0 XOR (2 * s1) XOR (3 * s2) XOR s3
 *   s2' = s0 XOR s1 XOR (2 * s2) XOR (3 * s3)
 *   s3' = (3 * s0) XOR s1 XOR s2 XOR (2 * s3)
 * @param {State} state
 * @returns {State}
 */
function mixColumns(state) {
  const s = _cloneState(state);

  for (let col = 0; col < AES_COLS; col++) {
    const s0 = s[0][col];
    const s1 = s[1][col];
    const s2 = s[2][col];
    const s3 = s[3][col];

    // 2 * s0, 3 * s1, etc. using precomputed GF(2^8) via xtime
    s[0][col] = gfMul(0x02, s0) ^ gfMul(0x03, s1) ^ s2 ^ s3;
    s[1][col] = s0 ^ gfMul(0x02, s1) ^ gfMul(0x03, s2) ^ s3;
    s[2][col] = s0 ^ s1 ^ gfMul(0x02, s2) ^ gfMul(0x03, s3);
    s[3][col] = gfMul(0x03, s0) ^ s1 ^ s2 ^ gfMul(0x02, s3);
  }

  return s;
}

/**
 * AddRoundKey: XOR state with a 16-byte round key.
 * @param {State} state
 * @param {number[]} roundKey - 16-byte array
 * @returns {State}
 */
function addRoundKey(state, roundKey) {
  const s = _cloneState(state);
  for (let col = 0; col < AES_COLS; col++) {
    for (let row = 0; row < AES_ROWS; row++) {
      s[row][col] ^= roundKey[col * AES_COLS + row];
    }
  }
  return s;
}

/**
 * AES-128 encrypt a single block (ECB mode).
 * Orchestrates the full 10-round encryption using SubBytes,
 * ShiftRows, MixColumns, and AddRoundKey.
 * @param {number[]} plaintext - 16 bytes
 * @param {number[][]} w - expanded key schedule (44 words)
 * @returns {State} final encrypted state
 */
function encryptBlock(plaintext, w) {
  const { getRoundKey } = require('./aes-key-expansion');

  // Initial AddRoundKey
  let state = addRoundKey(bytesToState(plaintext), getRoundKey(w, 0));

  // Rounds 1-9 (with MixColumns)
  for (let round = 1; round <= 9; round++) {
    state = subBytes(state);
    state = shiftRows(state);
    state = mixColumns(state);
    state = addRoundKey(state, getRoundKey(w, round));
  }

  // Round 10 (no MixColumns)
  state = subBytes(state);
  state = shiftRows(state);
  state = addRoundKey(state, getRoundKey(w, 10));

  return state;
}

module.exports = {
  AES_ROWS,
  AES_COLS,
  bytesToState,
  stateToBytes,
  subBytes,
  shiftRows,
  mixColumns,
  addRoundKey,
  encryptBlock
};
