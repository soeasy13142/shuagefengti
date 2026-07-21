const { scan, cScan, look, cLook, compareAlgorithms } = require('../../utils/disk-scheduling');

describe('scan', () => {
  test('SCAN(up) from 50 with requests [98,37,183,14,122]', () => {
    const result = scan([98, 37, 183, 14, 122], 50, 'up');
    // path: 50→98→122→183→(到199)→37→14
    expect(result.path).toEqual([50, 98, 122, 183, 199, 37, 14]);
    expect(result.steps).toEqual([
      { from: 50, to: 98, seek: 48 },
      { from: 98, to: 122, seek: 24 },
      { from: 122, to: 183, seek: 61 },
      { from: 183, to: 199, seek: 16 },
      { from: 199, to: 37, seek: 162 },
      { from: 37, to: 14, seek: 23 }
    ]);
    expect(result.totalSeek).toBe(48 + 24 + 61 + 16 + 162 + 23);
  });

  test('SCAN(down) from 50 with same requests', () => {
    const result = scan([98, 37, 183, 14, 122], 50, 'down');
    // path: 50→37→14→(到0)→98→122→183
    expect(result.path).toEqual([50, 37, 14, 0, 98, 122, 183]);
    expect(result.steps).toEqual([
      { from: 50, to: 37, seek: 13 },
      { from: 37, to: 14, seek: 23 },
      { from: 14, to: 0, seek: 14 },
      { from: 0, to: 98, seek: 98 },
      { from: 98, to: 122, seek: 24 },
      { from: 122, to: 183, seek: 61 }
    ]);
    expect(result.totalSeek).toBe(13 + 23 + 14 + 98 + 24 + 61);
  });

  test('SCAN(up) with single request', () => {
    const result = scan([75], 50, 'up');
    expect(result.path).toEqual([50, 75, 199]);
    expect(result.totalSeek).toBe(25 + 124);
  });

  test('SCAN request at start position is not visited twice', () => {
    const result = scan([50, 98], 50, 'up');
    // 50 is the start position — should not appear again in path
    expect(result.path).toEqual([50, 98, 199]);
    expect(result.totalSeek).toBe(48 + 101);
  });

  test('SCAN empty requests returns path with start only', () => {
    const result = scan([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
  });

  test('SCAN ensures end boundary when turning around', () => {
    const result = scan([10], 50, 'up');
    // no request above 50 → go to 199, then back to 10
    expect(result.path).toEqual([50, 199, 10]);
    expect(result.totalSeek).toBe(149 + 189);
  });
});

describe('cScan', () => {
  test('C-SCAN(up) from 50 with requests [98,37,183,14,122]', () => {
    const result = cScan([98, 37, 183, 14, 122], 50, 'up');
    // path: 50→98→122→183→(到199)→(跳回0)→14→37
    expect(result.path).toEqual([50, 98, 122, 183, 199, 0, 14, 37]);
    expect(result.totalSeek).toBe(385);
  });

  test('C-SCAN(down) from 50 with same requests', () => {
    const result = cScan([98, 37, 183, 14, 122], 50, 'down');
    // path: 50→37→14→(到0)→(跳回199)→98→122→183
    expect(result.path).toEqual([50, 37, 14, 0, 199, 98, 122, 183]);
    expect(result.steps).toEqual([
      { from: 50, to: 37, seek: 13 },
      { from: 37, to: 14, seek: 23 },
      { from: 14, to: 0, seek: 14 },
      { from: 0, to: 199, seek: 199 },
      { from: 199, to: 98, seek: 101 },
      { from: 98, to: 122, seek: 24 },
      { from: 122, to: 183, seek: 61 }
    ]);
    expect(result.totalSeek).toBe(13 + 23 + 14 + 199 + 101 + 24 + 61);
  });

  test('C-SCAN empty requests returns path with start only', () => {
    const result = cScan([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
  });

  test('C-SCAN request at start position is not visited twice', () => {
    const result = cScan([50, 98], 50, 'up');
    expect(result.path).toEqual([50, 98, 199, 0]);
    expect(result.totalSeek).toBe(48 + 101 + 199);
  });
});

describe('look', () => {
  test('LOOK(up) from 50 with requests [98,37,183,14,122]', () => {
    const result = look([98, 37, 183, 14, 122], 50, 'up');
    // path: 50→98→122→183→(转向)→37→14
    // 注意：不到 199
    expect(result.path).toEqual([50, 98, 122, 183, 37, 14]);
    expect(result.totalSeek).toBe(48 + 24 + 61 + 146 + 23);
  });

  test('LOOK(down) from 50 with same requests', () => {
    const result = look([98, 37, 183, 14, 122], 50, 'down');
    // path: 50→37→14→(转向)→98→122→183
    // 注意：不到 0
    expect(result.path).toEqual([50, 37, 14, 98, 122, 183]);
  });

  test('LOOK(up) single request above start', () => {
    const result = look([120], 50, 'up');
    expect(result.path).toEqual([50, 120]);
    expect(result.totalSeek).toBe(70);
  });

  test('LOOK(up) single request below start', () => {
    const result = look([20], 50, 'up');
    // go up first but nothing above → still go find below
    expect(result.path).toEqual([50, 20]);
    expect(result.totalSeek).toBe(30);
  });

  test('LOOK empty requests returns path with start only', () => {
    const result = look([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
  });

  test('LOOK request at start position is not visited twice', () => {
    const result = look([50, 98], 50, 'up');
    expect(result.path).toEqual([50, 98]);
    expect(result.totalSeek).toBe(48);
  });
});

describe('cLook', () => {
  test('C-LOOK(up) from 50 with requests [98,37,183,14,122]', () => {
    const result = cLook([98, 37, 183, 14, 122], 50, 'up');
    // path: 50→98→122→183→(跳回14)→37
    // 注意：不到 199 也不到 0
    expect(result.path).toEqual([50, 98, 122, 183, 14, 37]);
    expect(result.steps).toEqual([
      { from: 50, to: 98, seek: 48 },
      { from: 98, to: 122, seek: 24 },
      { from: 122, to: 183, seek: 61 },
      { from: 183, to: 14, seek: 169 },
      { from: 14, to: 37, seek: 23 }
    ]);
    expect(result.totalSeek).toBe(48 + 24 + 61 + 169 + 23);
  });

  test('C-LOOK(down) from 50 with same requests', () => {
    const result = cLook([98, 37, 183, 14, 122], 50, 'down');
    // path: 50→37→14→(跳回183)→122→98
    // Wait: going down → touch 37, 14 → jump to biggest request below start?
    // Actually C-LOOK: serve direction → jump to opposite FARTHEST and serve opposite direction
    // down: visit 14, 37 (in descending order), then jump to 183 (far end), serve 122, 98
    expect(result.path).toEqual([50, 37, 14, 183, 122, 98]);
    expect(result.steps).toEqual([
      { from: 50, to: 37, seek: 13 },
      { from: 37, to: 14, seek: 23 },
      { from: 14, to: 183, seek: 169 },
      { from: 183, to: 122, seek: 61 },
      { from: 122, to: 98, seek: 24 }
    ]);
    expect(result.totalSeek).toBe(13 + 23 + 169 + 61 + 24);
  });

  test('C-LOOK(up) single request below start', () => {
    const result = cLook([20], 50, 'up');
    // go up → nothing above → jump to 20
    expect(result.path).toEqual([50, 20]);
    expect(result.steps).toEqual([
      { from: 50, to: 20, seek: 30 }
    ]);
    expect(result.totalSeek).toBe(30);
  });

  test('C-LOOK empty requests returns path with start only', () => {
    const result = cLook([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
  });

  test('C-LOOK request at start position is not visited twice', () => {
    const result = cLook([50, 98], 50, 'up');
    expect(result.path).toEqual([50, 98]);
    expect(result.totalSeek).toBe(48);
  });
});

describe('compareAlgorithms', () => {
  test('returns result for all 4 algorithms with same input', () => {
    const result = compareAlgorithms([98, 37, 183, 14, 122], 50, ['scan', 'cScan', 'look', 'cLook']);
    expect(Object.keys(result)).toEqual(['scan', 'cScan', 'look', 'cLook']);
    expect(typeof result.scan.totalSeek).toBe('number');
    expect(typeof result.cScan.totalSeek).toBe('number');
    expect(typeof result.look.totalSeek).toBe('number');
    expect(typeof result.cLook.totalSeek).toBe('number');
  });

  test('returns only requested algorithms', () => {
    const result = compareAlgorithms([98, 37], 50, ['scan', 'look']);
    expect(Object.keys(result)).toEqual(['scan', 'look']);
  });

  test('returns empty object for empty algorithms list', () => {
    const result = compareAlgorithms([98, 37], 50, []);
    expect(result).toEqual({});
  });
});
