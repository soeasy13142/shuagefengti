const { hexToBytes, bytesToHex, sBox, xtime, gfMul, subWord, rotWord, rcon } = require('../../utils/aes-core');
const { bytesToState, stateToBytes, subBytes, shiftRows, mixColumns, addRoundKey, encryptBlock } = require('../../utils/aes-state');
const { keyExpansion, getRoundKey, keyExpansionWithSteps } = require('../../utils/aes-key-expansion');

describe('hex helpers', () => {
  test('hexToBytes round-trip', () => {
    const hex = '00112233445566778899aabbccddeeff';
    const bytes = hexToBytes(hex);
    expect(bytes.length).toBe(16);
    expect(bytesToHex(bytes)).toBe(hex);
  });
  test('hexToBytes with spaces', () => {
    expect(hexToBytes('00 11 22')).toEqual([0x00, 0x11, 0x22]);
  });
  test('throws on odd hex length', () => {
    expect(() => hexToBytes('001')).toThrow();
  });
  test('throws on invalid hex char', () => {
    expect(() => hexToBytes('00xx')).toThrow();
  });
});

describe('S-box (FIPS 197 Figure 7)', () => {
  test('S-box[0x00] = 0x63', () => expect(sBox[0x00]).toBe(0x63));
  test('S-box[0x01] = 0x7c', () => expect(sBox[0x01]).toBe(0x7c));
  test('S-box[0x53] = 0xed', () => expect(sBox[0x53]).toBe(0xed));
  test('S-box[0xff] = 0x16', () => expect(sBox[0xff]).toBe(0x16));
  test('S-box length is 256', () => expect(sBox.length).toBe(256));
});

describe('xtime (GF(2^8) x2)', () => {
  test('xtime(0x57) = 0xae', () => expect(xtime(0x57)).toBe(0xae));
  test('xtime(0xae) = 0x47', () => expect(xtime(0xae)).toBe(0x47));
  test('xtime(0x47) = 0x8e', () => expect(xtime(0x47)).toBe(0x8e));
  test('xtime(0x00) = 0x00', () => expect(xtime(0x00)).toBe(0x00));
});

describe('gfMul (GF(2^8) general multiply)', () => {
  test('0x57 x 0x13 = 0xfe (FIPS 197 example)', () => {
    expect(gfMul(0x57, 0x13)).toBe(0xfe);
  });
  test('0x01 x any = any', () => {
    expect(gfMul(0x01, 0x63)).toBe(0x63);
  });
  test('0x02 x any = xtime(any)', () => {
    expect(gfMul(0x02, 0x57)).toBe(xtime(0x57));
  });
  test('0x03 x any = xtime(any) XOR any', () => {
    expect(gfMul(0x03, 0x57)).toBe(xtime(0x57) ^ 0x57);
  });
});

describe('subWord', () => {
  test('subWord([0x00, 0x01, 0x02, 0x03]) = [0x63, 0x7c, 0x77, 0x7b]', () => {
    expect(subWord([0x00, 0x01, 0x02, 0x03])).toEqual([0x63, 0x7c, 0x77, 0x7b]);
  });
});

describe('rotWord', () => {
  test('rotWord([0x09, 0x0a, 0x0b, 0x0c]) = [0x0a, 0x0b, 0x0c, 0x09]', () => {
    expect(rotWord([0x09, 0x0a, 0x0b, 0x0c])).toEqual([0x0a, 0x0b, 0x0c, 0x09]);
  });
});

describe('rcon', () => {
  test('rcon(1) = [0x01, 0x00, 0x00, 0x00]', () => {
    expect(rcon(1)).toEqual([0x01, 0x00, 0x00, 0x00]);
  });
  test('rcon(10) = [0x36, 0x00, 0x00, 0x00]', () => {
    expect(rcon(10)).toEqual([0x36, 0x00, 0x00, 0x00]);
  });
});

describe('state helper', () => {
  // Column-major: bytes[0..3] -> column 0, bytes[4..7] -> column 1, etc.
  // Column 0 visually = [0x00, 0x11, 0x22, 0x33]
  const bytes = [0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff];
  test('bytesToState produces 4x4 column-major', () => {
    const s = bytesToState(bytes);
    // FIPS 197 column-major: state[row][col], bytes fill column first
    expect(s[0][0]).toBe(0x00);
    expect(s[1][0]).toBe(0x11);
    expect(s[2][0]).toBe(0x22);
    expect(s[3][0]).toBe(0x33);
  });
  test('stateToBytes round-trip', () => {
    const s = bytesToState(bytes);
    expect(stateToBytes(s)).toEqual(bytes);
  });
});

describe('subBytes', () => {
  test('input state produces correct S-box output', () => {
    const input = bytesToState([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
    const out = subBytes(input);
    const expectedBytes = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76];
    expect(stateToBytes(out)).toEqual(expectedBytes);
  });
});

describe('shiftRows', () => {
  test('shifts rows correctly for known state', () => {
    // Column-major: bytes[0..3]=col0=[0x00,0x10,0x20,0x30], bytes[4..7]=col1=[0x01,0x11,0x21,0x31], ...
    // Visual rows: row0=[0x00,0x01,0x02,0x03], row1=[0x10,0x11,0x12,0x13], row2=[0x20,0x21,0x22,0x23], row3=[0x30,0x31,0x32,0x33]
    const input = bytesToState([0x00, 0x10, 0x20, 0x30, 0x01, 0x11, 0x21, 0x31, 0x02, 0x12, 0x22, 0x32, 0x03, 0x13, 0x23, 0x33]);
    const out = shiftRows(input);
    const actual = stateToBytes(out);
    // Row 0 unchanged, Row 1 left-1, Row 2 left-2, Row 3 left-3
    expect(actual[0]).toBe(0x00);
    expect(actual[5]).toBe(0x12);
    expect(actual[10]).toBe(0x20);
    expect(actual[15]).toBe(0x32);
  });
});

describe('mixColumns', () => {
  test('FIPS 197 example column mixing', () => {
    // Column-major input: state after ShiftRows in FIPS 197 Appendix C Round 1
    // Visual grid: [[d4,e0,b8,1e],[bf,b4,41,27],[5d,52,11,98],[30,ae,f1,e5]]
    const input = bytesToState([
      0xd4, 0xbf, 0x5d, 0x30,
      0xe0, 0xb4, 0x52, 0xae,
      0xb8, 0x41, 0x11, 0xf1,
      0x1e, 0x27, 0x98, 0xe5
    ]);
    const out = mixColumns(input);
    const actual = stateToBytes(out);
    // First byte of result should be 0x04 (FIPS 197: (02·d4) XOR (03·bf) XOR 5d XOR 30 = 04)
    expect(actual[0]).toBe(0x04);
  });
});

describe('addRoundKey', () => {
  test('XOR state with round key', () => {
    const state = bytesToState(Array(16).fill(0xff));
    const key = Array(16).fill(0x01);
    const out = addRoundKey(state, key);
    const actual = stateToBytes(out);
    expect(actual.every(function(b) { return b === 0xfe; })).toBe(true);
  });
});

describe('keyExpansion', () => {
  test('FIPS 197 first 8 words', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const w = keyExpansion(key);
    expect(w[0]).toEqual([0x00, 0x01, 0x02, 0x03]);
    expect(w[1]).toEqual([0x04, 0x05, 0x06, 0x07]);
    expect(w[2]).toEqual([0x08, 0x09, 0x0a, 0x0b]);
    expect(w[3]).toEqual([0x0c, 0x0d, 0x0e, 0x0f]);
    expect(w[4]).toEqual([0xd6, 0xaa, 0x74, 0xfd]);
    expect(w[5]).toEqual([0xd2, 0xaf, 0x72, 0xfa]);
    expect(w[6]).toEqual([0xda, 0xa6, 0x78, 0xf1]);
    expect(w[7]).toEqual([0xd6, 0xab, 0x76, 0xfe]);
  });
  test('W[40..43] (last round key)', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const w = keyExpansion(key);
    // Actual values verified via FIPS 197 Appendix B full encryption match
    expect(w[40]).toEqual([0x13, 0x11, 0x1d, 0x7f]);
    expect(w[41]).toEqual([0xe3, 0x94, 0x4a, 0x17]);
    expect(w[42]).toEqual([0xf3, 0x07, 0xa7, 0x8b]);
    expect(w[43]).toEqual([0x4d, 0x2b, 0x30, 0xc5]);
  });
  test('returns 44 words', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const w = keyExpansion(key);
    expect(w.length).toBe(44);
  });
});

describe('keyExpansionWithSteps', () => {
  test('returns steps including type and rcon', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const result = keyExpansionWithSteps(key);
    expect(result.words.length).toBe(44);
    expect(result.steps.length).toBe(44);
    expect(result.steps[4].type).toBe('rotSubRcon');
    expect(result.steps[4].rcon).toBeDefined();
    expect(result.steps[5].type).toBe('direct');
  });
});

describe('AES-128 FIPS 197 Appendix B full encryption', () => {
  test('full AES-128 encrypt matches known ciphertext', () => {
    const plaintext = hexToBytes('00112233445566778899aabbccddeeff');
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const w = keyExpansion(key);
    const state = encryptBlock(plaintext, w);
    expect(bytesToHex(stateToBytes(state))).toBe('69c4e0d86a7b0430d8cdb78070b4c55a');
  });
});

describe('getRoundKey', () => {
  test('returns 16 bytes for round 0', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const w = keyExpansion(key);
    const rk = getRoundKey(w, 0);
    expect(rk.length).toBe(16);
    expect(rk).toEqual([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
  });
  test('returns 16 bytes for round 1', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const w = keyExpansion(key);
    const rk = getRoundKey(w, 1);
    expect(rk.length).toBe(16);
    expect(rk).toEqual([0xd6, 0xaa, 0x74, 0xfd, 0xd2, 0xaf, 0x72, 0xfa, 0xda, 0xa6, 0x78, 0xf1, 0xd6, 0xab, 0x76, 0xfe]);
  });
});
