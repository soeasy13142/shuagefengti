const { calculate } = require('../../utils/scheduling-metrics');

describe('calculate - empty / null', () => {
  test('empty gantt returns zeros', () => {
    expect(calculate([], [{ pid: 'P1', arrival: 0, burst: 5 }])).toEqual({
      avgTAT: 0, avgWT: 0, cpuUtil: 0, throughput: 0
    });
  });
  test('empty processes returns zeros', () => {
    expect(calculate([{ pid: 'P1', start: 0, end: 5 }], [])).toEqual({
      avgTAT: 0, avgWT: 0, cpuUtil: 0, throughput: 0
    });
  });
});

describe('calculate - FCFS single process', () => {
  test('P1 arr=0 burst=5 → avg TAT=5, avg WT=0, util=1, throughput=1/5', () => {
    const r = calculate(
      [{ pid: 'P1', start: 0, end: 5 }],
      [{ pid: 'P1', arrival: 0, burst: 5 }]
    );
    expect(r.avgTAT).toBe(5);
    expect(r.avgWT).toBe(0);
    expect(r.cpuUtil).toBe(1);
    expect(r.throughput).toBeCloseTo(0.2, 5);
  });
});

describe('calculate - FCFS 3-process example from spec', () => {
  test('computes all four metrics correctly', () => {
    const r = calculate(
      [
        { pid: 'P1', start: 0, end: 5 },
        { pid: 'P2', start: 5, end: 8 },
        { pid: 'P3', start: 8, end: 16 }
      ],
      [
        { pid: 'P1', arrival: 0, burst: 5 },
        { pid: 'P2', arrival: 1, burst: 3 },
        { pid: 'P3', arrival: 2, burst: 8 }
      ]
    );
    expect(r.avgTAT).toBeCloseTo(26 / 3, 5);
    expect(r.avgWT).toBeCloseTo(10 / 3, 5);
    expect(r.cpuUtil).toBe(1);
    expect(r.throughput).toBeCloseTo(3 / 16, 5);
  });
});

describe('calculate - RR with idle gap', () => {
  test('accounts for idle gap in cpuUtil', () => {
    const r = calculate(
      [
        { pid: 'P1', start: 0, end: 2 },
        { pid: 'P2', start: 5, end: 8 }
      ],
      [
        { pid: 'P1', arrival: 0, burst: 2 },
        { pid: 'P2', arrival: 5, burst: 3 }
      ]
    );
    expect(r.avgTAT).toBeCloseTo(2.5, 5);
    expect(r.avgWT).toBe(0);
    expect(r.cpuUtil).toBeCloseTo(5 / 8, 5);
    expect(r.throughput).toBeCloseTo(2 / 8, 5);
  });
});

describe('calculate - RR / MFQ with multiple slices per pid', () => {
  test('uses LAST occurrence end as completion', () => {
    const r = calculate(
      [
        { pid: 'P1', start: 0, end: 2 },
        { pid: 'P1', start: 2, end: 4 },
        { pid: 'P2', start: 4, end: 6 },
        { pid: 'P3', start: 6, end: 8 },
        { pid: 'P1', start: 8, end: 9 },
        { pid: 'P2', start: 9, end: 10 },
        { pid: 'P3', start: 10, end: 12 },
        { pid: 'P3', start: 12, end: 14 },
        { pid: 'P3', start: 14, end: 16 }
      ],
      [
        { pid: 'P1', arrival: 0, burst: 5 },
        { pid: 'P2', arrival: 1, burst: 3 },
        { pid: 'P3', arrival: 2, burst: 8 }
      ]
    );
    expect(r.avgTAT).toBeCloseTo(32 / 3, 5);
    expect(r.avgWT).toBeCloseTo(16 / 3, 5);
    expect(r.cpuUtil).toBe(1);
    expect(r.throughput).toBeCloseTo(3 / 16, 5);
  });
});
