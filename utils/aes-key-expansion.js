/**
 * AES-128 Key Expansion
 *
 * Generates the round key schedule W[0..43] from a 16-byte key.
 * All pure functions, no mutation.
 */

const { subWord, rotWord, rcon } = require('./aes-core');

/**
 * XOR two 4-byte words element-wise.
 * @param {number[]} a - 4-element array
 * @param {number[]} b - 4-element array
 * @returns {number[]} new 4-element array
 */
function _xorWords(a, b) {
  return [
    a[0] ^ b[0],
    a[1] ^ b[1],
    a[2] ^ b[2],
    a[3] ^ b[3]
  ];
}

/**
 * Expand a 16-byte key into the full key schedule (44 words).
 * AES-128: first 4 words are the key itself, then generate 40 more.
 * For i >= 4:
 *   if i % 4 === 0: W[i] = W[i-4] XOR SubWord(RotWord(W[i-1])) XOR Rcon[i/4]
 *   else: W[i] = W[i-4] XOR W[i-1]
 * @param {number[]} key - 16-byte key array
 * @returns {number[][]} array of 44 4-byte words
 */
function keyExpansion(key) {
  /** @type {number[][]} */
  const w = [];

  // First 4 words from the key
  for (let i = 0; i < 4; i++) {
    w.push([
      key[i * 4],
      key[i * 4 + 1],
      key[i * 4 + 2],
      key[i * 4 + 3]
    ]);
  }

  // Generate remaining 40 words
  for (let i = 4; i < 44; i++) {
    let temp = w[i - 1];
    if (i % 4 === 0) {
      const rotated = rotWord(temp);
      const substituted = subWord(rotated);
      const rconVal = rcon(i / 4);
      temp = _xorWords(substituted, rconVal);
    }
    w.push(_xorWords(w[i - 4], temp));
  }

  return w;
}

/**
 * Get the round key for a specific round.
 * Each round key is 16 bytes (4 consecutive words).
 * @param {number[][]} w - expanded key schedule (44 words)
 * @param {number} round - round number 0-10
 * @returns {number[]} 16-byte round key
 */
function getRoundKey(w, round) {
  const start = round * 4;
  return [
    w[start][0], w[start][1], w[start][2], w[start][3],
    w[start + 1][0], w[start + 1][1], w[start + 1][2], w[start + 1][3],
    w[start + 2][0], w[start + 2][1], w[start + 2][2], w[start + 2][3],
    w[start + 3][0], w[start + 3][1], w[start + 3][2], w[start + 3][3]
  ];
}

/**
 * Key expansion with step-by-step trace for visualization.
 * @param {number[]} key - 16-byte key array
 * @returns {{ words: number[][], steps: Array<{ index: number, type: string, input: number[], output: number[], rcon?: number[] }> }}
 */
function keyExpansionWithSteps(key) {
  /** @type {number[][]} */
  const w = [];
  /** @type {Array<{ index: number, type: string, input: number[], output: number[], rcon?: number[] }>} */
  const steps = [];

  // First 4 words from the key
  for (let i = 0; i < 4; i++) {
    const word = [
      key[i * 4],
      key[i * 4 + 1],
      key[i * 4 + 2],
      key[i * 4 + 3]
    ];
    w.push(word);
    steps.push({
      index: i,
      type: 'initial',
      input: [],
      output: word
    });
  }

  // Generate remaining 40 words
  for (let i = 4; i < 44; i++) {
    const prev = w[i - 1];
    const prev4 = w[i - 4];

    if (i % 4 === 0) {
      const rotated = rotWord(prev);
      const substituted = subWord(rotated);
      const rconVal = rcon(i / 4);
      const temp = _xorWords(substituted, rconVal);
      const word = _xorWords(prev4, temp);

      w.push(word);
      steps.push({
        index: i,
        type: 'rotSubRcon',
        input: prev,
        output: word,
        rotatedWord: rotated,
        substitutedWord: substituted,
        rcon: rconVal
      });
    } else {
      const word = _xorWords(prev4, prev);
      w.push(word);
      steps.push({
        index: i,
        type: 'direct',
        input: prev,
        output: word
      });
    }
  }

  return { words: w, steps: steps };
}

module.exports = {
  keyExpansion,
  getRoundKey,
  keyExpansionWithSteps
};
