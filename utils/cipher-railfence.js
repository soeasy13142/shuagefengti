/**
 * Rail Fence cipher utilities
 * @module utils/cipher-railfence
 */

/**
 * Encrypt text using Rail Fence cipher
 * @param {string} text - plaintext
 * @param {number} rails - number of rails (>= 1)
 * @returns {string} ciphertext
 */
function railFenceEncrypt(text, rails) {
  if (rails <= 1 || text.length <= 1) return text;

  // Build the fence by placing each char in the appropriate rail
  const fence = [];
  for (let r = 0; r < rails; r++) {
    fence[r] = [];
  }

  let rail = 0;
  let direction = 1; // 1 = down, -1 = up

  for (let i = 0; i < text.length; i++) {
    fence[rail].push(text.charAt(i));
    if (rail === 0) direction = 1;
    else if (rail === rails - 1) direction = -1;
    rail += direction;
  }

  // Read off by rail order
  let result = '';
  for (let r = 0; r < rails; r++) {
    for (let j = 0; j < fence[r].length; j++) {
      result += fence[r][j];
    }
  }
  return result;
}

/**
 * Decrypt text using Rail Fence cipher
 * @param {string} text - ciphertext
 * @param {number} rails - number of rails (>= 1)
 * @returns {string} plaintext
 */
function railFenceDecrypt(text, rails) {
  if (rails <= 1 || text.length <= 1) return text;

  // Step 1: Determine the rail lengths
  const railLengths = [];
  for (let r = 0; r < rails; r++) {
    railLengths[r] = 0;
  }

  let rail = 0;
  let direction = 1;
  for (let i = 0; i < text.length; i++) {
    railLengths[rail]++;
    if (rail === 0) direction = 1;
    else if (rail === rails - 1) direction = -1;
    rail += direction;
  }

  // Step 2: Fill each rail with the ciphertext characters
  const fence = [];
  let pos = 0;
  for (let r = 0; r < rails; r++) {
    fence[r] = [];
    for (let j = 0; j < railLengths[r]; j++) {
      fence[r].push(text.charAt(pos));
      pos++;
    }
  }

  // Step 3: Read off in zigzag order
  let result = '';
  rail = 0;
  direction = 1;
  const indices = [];
  for (let r = 0; r < rails; r++) {
    indices[r] = 0;
  }

  for (let i = 0; i < text.length; i++) {
    result += fence[rail][indices[rail]];
    indices[rail]++;
    if (rail === 0) direction = 1;
    else if (rail === rails - 1) direction = -1;
    rail += direction;
  }

  return result;
}

/**
 * Brute-force decrypt by trying all rail counts 2-20
 * @param {string} text - ciphertext
 * @returns {Array<{rails: number, result: string}>}
 */
function railFenceBruteForce(text) {
  const results = [];
  for (let rails = 2; rails <= 20; rails++) {
    results.push({
      rails: rails,
      result: railFenceDecrypt(text, rails)
    });
  }
  return results;
}

/**
 * Get rail fence structure (grid and reading order)
 * @param {string} text - plaintext
 * @param {number} rails - number of rails
 * @returns {{ rails: number, grid: (string|null)[][], readingOrder: number[] }}
 */
function railFenceStructure(text, rails) {
  if (rails <= 1) {
    const grid1 = [];
    for (let r = 0; r < 1; r++) {
      grid1[r] = [];
      for (let j = 0; j < text.length; j++) {
        grid1[r].push(text.charAt(j));
      }
    }
    const order1 = [];
    for (let j = 0; j < text.length; j++) order1.push(j);
    return { rails: rails, grid: grid1, readingOrder: order1 };
  }

  // Build the grid with null for empty positions
  const grid = [];
  for (let r = 0; r < rails; r++) {
    grid[r] = [];
    for (let j = 0; j < text.length; j++) {
      grid[r].push(null);
    }
  }

  let rail = 0;
  let direction = 1;
  for (let i = 0; i < text.length; i++) {
    grid[rail][i] = text.charAt(i);
    if (rail === 0) direction = 1;
    else if (rail === rails - 1) direction = -1;
    rail += direction;
  }

  // Reading order: which original index goes to which output position
  const readingOrder = [];
  for (let r = 0; r < rails; r++) {
    for (let j = 0; j < text.length; j++) {
      if (grid[r][j] !== null) {
        readingOrder.push(j);
      }
    }
  }

  return { rails: rails, grid: grid, readingOrder: readingOrder };
}

module.exports = { railFenceEncrypt, railFenceDecrypt, railFenceBruteForce, railFenceStructure };
