const { calculateNeed, isSafeState } = require('../../utils/bankers');

describe('calculateNeed', () => {
  test('Need = Max - Allocation', () => {
    const max = [[7, 5, 3], [3, 2, 2], [9, 0, 2]];
    const allocation = [[0, 1, 0], [2, 0, 0], [3, 0, 2]];
    const expected = [[7, 4, 3], [1, 2, 2], [6, 0, 0]];
    expect(calculateNeed(max, allocation)).toEqual(expected);
  });

  test('all zero allocation means Need = Max', () => {
    const max = [[5, 4], [3, 2]];
    const allocation = [[0, 0], [0, 0]];
    expect(calculateNeed(max, allocation)).toEqual([[5, 4], [3, 2]]);
  });

  test('throws if dimensions mismatch', () => {
    expect(function() { calculateNeed([[1, 2], [3, 4]], [[1, 2]]); })
      .toThrow('Dimension mismatch');
  });

  test('throws if Max < Allocation in any cell', () => {
    expect(function() { calculateNeed([[2, 3]], [[3, 2]]); })
      .toThrow('Max cannot be less than Allocation at [0][0]');
  });

  test('empty matrix', () => {
    expect(calculateNeed([], [])).toEqual([]);
  });
});

describe('isSafeState', () => {
  test('safe state with 3 processes (P2 -> P1 -> P3)', () => {
    const max = [[4, 2, 2], [3, 2, 1], [6, 1, 2]];
    const allocation = [[1, 1, 1], [2, 1, 0], [1, 0, 1]];
    const available = [2, 2, 2];

    const result = isSafeState(max, allocation, available);
    expect(result.safe).toBe(true);
    expect(result.safeSequence).toEqual(['P2', 'P1', 'P3']);
    expect(result.steps.length).toBe(3);
  });

  test('safe state with 5 processes', () => {
    const max = [
      [5, 2, 1, 3],
      [3, 4, 2, 1],
      [4, 1, 3, 2],
      [2, 3, 1, 4],
      [1, 2, 4, 3]
    ];
    const allocation = [
      [2, 1, 0, 1],
      [1, 2, 1, 0],
      [2, 0, 1, 1],
      [1, 1, 0, 2],
      [0, 1, 2, 1]
    ];
    const available = [2, 2, 2, 2];

    const result = isSafeState(max, allocation, available);
    expect(result.safe).toBe(true);
    expect(result.safeSequence.length).toBe(5);
    expect(result.steps.length).toBe(5);
  });

  test('unsafe state', () => {
    const max = [[1, 2], [2, 3], [3, 1]];
    const allocation = [[1, 0], [1, 1], [2, 1]];
    const available = [0, 1];

    const result = isSafeState(max, allocation, available);
    expect(result.safe).toBe(false);
    // Some processes may finish, but not all
    expect(result.safeSequence.length).toBeLessThan(3);
  });

  test('unsafe when no process can start', () => {
    // All processes need more than available
    const max = [[5, 5], [3, 3]];
    const allocation = [[2, 2], [1, 1]];
    const available = [0, 0];

    const result = isSafeState(max, allocation, available);
    expect(result.safe).toBe(false);
    expect(result.safeSequence).toEqual([]);
  });

  test('throws if dimension mismatch', () => {
    expect(function() { isSafeState([[1, 2], [3, 4]], [[1, 2]], [1, 1]); })
      .toThrow('Dimension mismatch');
  });

  test('empty process set is trivially safe', () => {
    const result = isSafeState([], [], [3, 3, 2]);
    expect(result.safe).toBe(true);
    expect(result.safeSequence).toEqual([]);
    expect(result.steps).toEqual([]);
  });

  test('each step records Need vs Work comparison', () => {
    const max = [[3, 3], [2, 2]];
    const allocation = [[1, 1], [1, 1]];
    const available = [1, 1];

    const result = isSafeState(max, allocation, available);
    expect(result.steps.length).toBeGreaterThanOrEqual(1);
    // Each step should have: process, need, work, needLEWork, newWork
    const step = result.steps[0];
    expect(step.process).toBeDefined();
    expect(step.need).toBeDefined();
    expect(step.work).toBeDefined();
    expect(typeof step.needLEWork).toBe('boolean');
    expect(step.newWork).toBeDefined();
  });
});
