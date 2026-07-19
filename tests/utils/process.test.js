const {
  validateProcess,
  randomProcesses,
  pidColor,
  PALETTE,
  MAX_PROCESSES
} = require('../../utils/process');

describe('PALETTE', () => {
  test('contains exactly 10 colors', () => {
    expect(PALETTE).toHaveLength(10);
    for (const c of PALETTE) {
      expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('pidColor', () => {
  test('returns a valid palette color', () => {
    expect(PALETTE).toContain(pidColor('P1'));
    expect(PALETTE).toContain(pidColor('P100'));
  });

  test('same pid yields same color (deterministic)', () => {
    expect(pidColor('P1')).toBe(pidColor('P1'));
  });

  test('different pids distribute across palette', () => {
    const seen = new Set();
    for (let i = 1; i <= 20; i++) {
      seen.add(pidColor('P' + i));
    }
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });
});

describe('validateProcess', () => {
  const empty = [];
  test('accepts a valid process', () => {
    const r = validateProcess({ pid: 'P1', arrival: 0, burst: 5 }, empty);
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  test('rejects missing pid', () => {
    const r = validateProcess({ pid: '', arrival: 0, burst: 5 }, empty);
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  test('rejects negative arrival', () => {
    const r = validateProcess({ pid: 'P1', arrival: -1, burst: 5 }, empty);
    expect(r.valid).toBe(false);
  });

  test('rejects non-integer arrival', () => {
    const r = validateProcess({ pid: 'P1', arrival: 1.5, burst: 5 }, empty);
    expect(r.valid).toBe(false);
  });

  test('rejects burst <= 0', () => {
    expect(validateProcess({ pid: 'P1', arrival: 0, burst: 0 }, empty).valid).toBe(false);
    expect(validateProcess({ pid: 'P1', arrival: 0, burst: -1 }, empty).valid).toBe(false);
  });

  test('rejects non-integer burst', () => {
    const r = validateProcess({ pid: 'P1', arrival: 0, burst: 3.5 }, empty);
    expect(r.valid).toBe(false);
  });

  test('rejects duplicate pid against existing processes', () => {
    const existing = [{ pid: 'P1', arrival: 0, burst: 5 }];
    const r = validateProcess({ pid: 'P1', arrival: 2, burst: 3 }, existing);
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.indexOf('重复') !== -1 || e.indexOf('重复') !== -1)).toBe(true);
  });

  test('rejects duplicate pid within the same input (non-array, single check)', () => {
    const existing = [{ pid: 'P2', arrival: 0, burst: 5 }];
    const r = validateProcess({ pid: 'P2', arrival: 2, burst: 3 }, existing);
    expect(r.valid).toBe(false);
  });
});

describe('randomProcesses', () => {
  test('returns n processes', () => {
    const ps = randomProcesses(5);
    expect(ps).toHaveLength(5);
  });

  test('each process has unique pid matching P1..Pn', () => {
    const ps = randomProcesses(5);
    const pids = ps.map(p => p.pid);
    expect(new Set(pids).size).toBe(5);
    expect(pids.sort()).toEqual(['P1', 'P2', 'P3', 'P4', 'P5']);
  });

  test('arrival and burst are within expected ranges', () => {
    const ps = randomProcesses(50);
    for (const p of ps) {
      expect(p.arrival).toBeGreaterThanOrEqual(0);
      expect(p.arrival).toBeLessThanOrEqual(10);
      expect(p.burst).toBeGreaterThanOrEqual(1);
      expect(p.burst).toBeLessThanOrEqual(10);
      expect(Number.isInteger(p.arrival)).toBe(true);
      expect(Number.isInteger(p.burst)).toBe(true);
    }
  });
});

describe('MAX_PROCESSES', () => {
  test('is 10', () => {
    expect(MAX_PROCESSES).toBe(10);
  });
});
