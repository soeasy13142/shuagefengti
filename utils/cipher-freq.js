/**
 * Frequency analysis utilities
 * @module utils/cipher-freq
 */

/**
 * Standard English letter frequencies (percentages)
 * Source: https://en.wikipedia.org/wiki/Letter_frequency
 * @type {Array<{letter: string, pct: number}>}
 */
const STANDARD_ENGLISH_FREQ = [
  { letter: 'A', pct: 8.2 },
  { letter: 'B', pct: 1.5 },
  { letter: 'C', pct: 2.8 },
  { letter: 'D', pct: 4.3 },
  { letter: 'E', pct: 12.7 },
  { letter: 'F', pct: 2.2 },
  { letter: 'G', pct: 2.0 },
  { letter: 'H', pct: 6.1 },
  { letter: 'I', pct: 7.0 },
  { letter: 'J', pct: 0.15 },
  { letter: 'K', pct: 0.8 },
  { letter: 'L', pct: 4.0 },
  { letter: 'M', pct: 2.5 },
  { letter: 'N', pct: 6.7 },
  { letter: 'O', pct: 7.5 },
  { letter: 'P', pct: 1.9 },
  { letter: 'Q', pct: 0.10 },
  { letter: 'R', pct: 6.0 },
  { letter: 'S', pct: 6.3 },
  { letter: 'T', pct: 9.1 },
  { letter: 'U', pct: 2.8 },
  { letter: 'V', pct: 1.0 },
  { letter: 'W', pct: 2.4 },
  { letter: 'X', pct: 0.15 },
  { letter: 'Y', pct: 2.0 },
  { letter: 'Z', pct: 0.07 }
];

const A_CODE = 'A'.charCodeAt(0);
const Z_CODE = 'Z'.charCodeAt(0);
const a_CODE = 'a'.charCodeAt(0);
const z_CODE = 'z'.charCodeAt(0);

/**
 * Analyze letter frequency in text
 * @param {string} text - input text
 * @returns {Array<{letter: string, count: number, pct: number}>} 26 entries, alphabetically sorted
 */
function analyzeFrequency(text) {
  // Initialize counts for A-Z
  const counts = [];
  for (let i = 0; i < 26; i++) {
    counts[i] = 0;
  }

  // Count alpha characters (case-insensitive)
  let totalLetters = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= A_CODE && code <= Z_CODE) {
      counts[code - A_CODE]++;
      totalLetters++;
    } else if (code >= a_CODE && code <= z_CODE) {
      counts[code - a_CODE]++;
      totalLetters++;
    }
  }

  // Build result array
  const result = [];
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(A_CODE + i);
    const pct = totalLetters > 0 ? (counts[i] / totalLetters) * 100 : 0;
    result.push({
      letter: letter,
      count: counts[i],
      pct: Math.round(pct * 100) / 100 // round to 2 decimal places
    });
  }
  return result;
}

module.exports = { analyzeFrequency, STANDARD_ENGLISH_FREQ };
