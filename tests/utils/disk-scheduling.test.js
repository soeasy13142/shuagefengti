const { scan, cScan, look } = require('../../utils/disk-scheduling');

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
  });

  test('C-SCAN empty requests returns path with start only', () => {
    const result = cScan([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
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
});
