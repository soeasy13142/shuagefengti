const { fcfs, sjf, rr, mfq } = require('../../utils/scheduling');

describe('fcfs', () => {
  test('3 processes: serial execution by arrival', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 1, burst: 3 },
      { pid: 'P3', arrival: 2, burst: 8 }
    ];
    expect(fcfs(ps)).toEqual([
      { pid: 'P1', start: 0, end: 5 },
      { pid: 'P2', start: 5, end: 8 },
      { pid: 'P3', start: 8, end: 16 }
    ]);
  });

  test('orders input by arrival when arrival increases', () => {
    const ps = [
      { pid: 'P3', arrival: 4, burst: 2 },
      { pid: 'P1', arrival: 0, burst: 3 },
      { pid: 'P2', arrival: 2, burst: 1 }
    ];
    expect(fcfs(ps).map(s => s.pid)).toEqual(['P1', 'P2', 'P3']);
  });

  test('ties on arrival fall back to pid lexicographic', () => {
    const ps = [
      { pid: 'P3', arrival: 0, burst: 1 },
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 0, burst: 3 }
    ];
    expect(fcfs(ps).map(s => s.pid)).toEqual(['P1', 'P2', 'P3']);
  });

  test('idle gap when next process has not arrived', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 2 },
      { pid: 'P2', arrival: 5, burst: 3 }
    ];
    expect(fcfs(ps)).toEqual([
      { pid: 'P1', start: 0, end: 2 },
      { pid: 'P2', start: 5, end: 8 }
    ]);
  });

  test('single process', () => {
    expect(fcfs([{ pid: 'P1', arrival: 0, burst: 5 }])).toEqual([
      { pid: 'P1', start: 0, end: 5 }
    ]);
  });

  test('empty input returns empty gantt', () => {
    expect(fcfs([])).toEqual([]);
  });
});

describe('sjf (non-preemptive)', () => {
  test('shortest burst first (same arrival)', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 0, burst: 3 },
      { pid: 'P3', arrival: 0, burst: 8 }
    ];
    expect(sjf(ps).map(s => s.pid)).toEqual(['P2', 'P1', 'P3']);
  });

  test('matches spec example: P2(3) → P1(5) → P3(8)', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 1, burst: 3 },
      { pid: 'P3', arrival: 2, burst: 8 }
    ];
    expect(sjf(ps)).toEqual([
      { pid: 'P1', start: 0, end: 5 },
      { pid: 'P2', start: 5, end: 8 },
      { pid: 'P3', start: 8, end: 16 }
    ]);
  });

  test('same burst, same arrival → break by pid lexicographic', () => {
    const ps = [
      { pid: 'P3', arrival: 0, burst: 4 },
      { pid: 'P1', arrival: 0, burst: 4 },
      { pid: 'P2', arrival: 0, burst: 4 }
    ];
    expect(sjf(ps).map(s => s.pid)).toEqual(['P1', 'P2', 'P3']);
  });

  test('idle gap when no process has arrived', () => {
    const ps = [
      { pid: 'P1', arrival: 5, burst: 2 }
    ];
    expect(sjf(ps)).toEqual([
      { pid: 'P1', start: 5, end: 7 }
    ]);
  });

  test('empty input returns empty gantt', () => {
    expect(sjf([])).toEqual([]);
  });
});

describe('rr (Round-Robin)', () => {
  test('quantum=2: each process gets 2-unit slices, last slice may be smaller', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 1, burst: 3 },
      { pid: 'P3', arrival: 2, burst: 8 }
    ];
    expect(rr(ps, 2)).toEqual([
      { pid: 'P1', start: 0, end: 2 },
      { pid: 'P1', start: 2, end: 4 },
      { pid: 'P2', start: 4, end: 6 },
      { pid: 'P3', start: 6, end: 8 },
      { pid: 'P1', start: 8, end: 9 },
      { pid: 'P2', start: 9, end: 10 },
      { pid: 'P3', start: 10, end: 12 },
      { pid: 'P3', start: 12, end: 14 },
      { pid: 'P3', start: 14, end: 16 }
    ]);
  });

  test('single process: runs straight through', () => {
    const ps = [{ pid: 'P1', arrival: 0, burst: 5 }];
    expect(rr(ps, 2)).toEqual([
      { pid: 'P1', start: 0, end: 2 },
      { pid: 'P1', start: 2, end: 4 },
      { pid: 'P1', start: 4, end: 5 }
    ]);
  });

  test('quantum >= burst: single slice per process', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 3 },
      { pid: 'P2', arrival: 1, burst: 2 }
    ];
    expect(rr(ps, 10)).toEqual([
      { pid: 'P1', start: 0, end: 3 },
      { pid: 'P2', start: 3, end: 5 }
    ]);
  });

  test('idle gap when no process ready', () => {
    const ps = [
      { pid: 'P1', arrival: 5, burst: 2 }
    ];
    expect(rr(ps, 1)).toEqual([
      { pid: 'P1', start: 5, end: 6 },
      { pid: 'P1', start: 6, end: 7 }
    ]);
  });

  test('empty input returns empty gantt', () => {
    expect(rr([], 2)).toEqual([]);
  });
});

describe('mfq (Multi-Level Feedback Queue)', () => {
  test('default 3-level queues [2, 4, 8]: new process at q0, demote on quantum exhaustion', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 1 },
      { pid: 'P2', arrival: 0, burst: 2 },
      { pid: 'P3', arrival: 0, burst: 3 }
    ];
    expect(mfq(ps)).toEqual([
      { pid: 'P1', start: 0, end: 1 },
      { pid: 'P2', start: 1, end: 3 },
      { pid: 'P3', start: 3, end: 5 },
      { pid: 'P3', start: 5, end: 6 }
    ]);
  });

  test('higher-priority queue always runs first (q0 > q1 > q2)', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 1 },
      { pid: 'P2', arrival: 1, burst: 5 }
    ];
    expect(mfq(ps)).toEqual([
      { pid: 'P1', start: 0, end: 1 },
      { pid: 'P2', start: 1, end: 3 },
      { pid: 'P2', start: 3, end: 6 }
    ]);
  });

  test('idle gap: jump to next arrival', () => {
    const ps = [
      { pid: 'P1', arrival: 5, burst: 1 }
    ];
    expect(mfq(ps)).toEqual([
      { pid: 'P1', start: 5, end: 6 }
    ]);
  });

  test('custom queues [1, 1, 1] behave like RR(1)', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 2 },
      { pid: 'P2', arrival: 0, burst: 1 }
    ];
    expect(mfq(ps, [1, 1, 1])).toEqual([
      { pid: 'P1', start: 0, end: 1 },
      { pid: 'P2', start: 1, end: 2 },
      { pid: 'P1', start: 2, end: 3 }
    ]);
  });

  test('empty input returns empty gantt', () => {
    expect(mfq([])).toEqual([]);
  });
});
