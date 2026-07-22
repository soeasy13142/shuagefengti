const { createSemaphore, semWait, semSignal } = require('../../utils/semaphore');

describe('createSemaphore', () => {
  test('creates with given initial value', () => {
    const s = createSemaphore(1);
    expect(s.value).toBe(1);
    expect(s.initial).toBe(1);
    expect(s.queue).toEqual([]);
    expect(s.history).toEqual([]);
  });

  test('creates with zero value', () => {
    const s = createSemaphore(0);
    expect(s.value).toBe(0);
  });

  test('creates with negative value (blocked state)', () => {
    const s = createSemaphore(-2);
    expect(s.value).toBe(-2);
  });

  test('throws for non-integer value', () => {
    expect(() => createSemaphore(1.5)).toThrow(/integer/i);
  });
});

describe('semWait (P operation)', () => {
  test('P on positive semaphore: decrements value, not blocked', () => {
    const s = createSemaphore(1);
    const { semaphore, blocked } = semWait(s, 'P1');
    expect(semaphore.value).toBe(0);
    expect(blocked).toBe(false);
    expect(semaphore.queue).toEqual([]);
  });

  test('P on zero semaphore: value becomes -1, owner blocked and added to queue', () => {
    const s = createSemaphore(0);
    const { semaphore, blocked } = semWait(s, 'P1');
    expect(semaphore.value).toBe(-1);
    expect(blocked).toBe(true);
    expect(semaphore.queue).toEqual(['P1']);
  });

  test('P on negative semaphore: value decreases, owner blocked', () => {
    const s = { value: -1, initial: 0, queue: ['P0'], history: [] };
    const { semaphore, blocked } = semWait(s, 'P2');
    expect(semaphore.value).toBe(-2);
    expect(blocked).toBe(true);
    expect(semaphore.queue).toEqual(['P0', 'P2']);
  });

  test('P records history entry', () => {
    const s = createSemaphore(2);
    const { semaphore } = semWait(s, 'P1');
    expect(semaphore.history).toHaveLength(1);
    expect(semaphore.history[0].type).toBe('P');
    expect(semaphore.history[0].ownerId).toBe('P1');
    expect(semaphore.history[0].valueBefore).toBe(2);
    expect(semaphore.history[0].valueAfter).toBe(1);
    expect(semaphore.history[0].blocked).toBe(false);
  });

  test('P preserves immutability (original semaphore unchanged)', () => {
    const s = createSemaphore(1);
    const originalValue = s.value;
    semWait(s, 'P1');
    expect(s.value).toBe(originalValue);
  });
});

describe('semSignal (V operation)', () => {
  test('V on positive semaphore: increments value, no wake', () => {
    const s = createSemaphore(0);
    const { semaphore, woken } = semSignal(s);
    expect(semaphore.value).toBe(1);
    expect(woken).toBeNull();
    expect(semaphore.queue).toEqual([]);
  });

  test('V with waiting process: increments value, wakes the first in queue', () => {
    const s = { value: -1, initial: 0, queue: ['P1'], history: [] };
    const { semaphore, woken } = semSignal(s);
    expect(semaphore.value).toBe(0);
    expect(woken).toBe('P1');
    expect(semaphore.queue).toEqual([]);
  });

  test('V wakes processes in FIFO order', () => {
    const s = { value: -2, initial: 0, queue: ['P1', 'P2'], history: [] };
    const first = semSignal(s);
    expect(first.woken).toBe('P1');
    expect(first.semaphore.queue).toEqual(['P2']);
    expect(first.semaphore.value).toBe(-1);

    const second = semSignal(first.semaphore);
    expect(second.woken).toBe('P2');
    expect(second.semaphore.queue).toEqual([]);
    expect(second.semaphore.value).toBe(0);
  });

  test('V with queue empty but value 0: increments, no wake', () => {
    const s = createSemaphore(0);
    const { semaphore, woken } = semSignal(s);
    expect(semaphore.value).toBe(1);
    expect(woken).toBeNull();
  });

  test('V records history entry', () => {
    const s = createSemaphore(0);
    const { semaphore } = semSignal(s);
    expect(semaphore.history).toHaveLength(1);
    expect(semaphore.history[0].type).toBe('V');
    expect(semaphore.history[0].valueBefore).toBe(0);
    expect(semaphore.history[0].valueAfter).toBe(1);
  });

  test('V preserves immutability (original semaphore unchanged)', () => {
    const s = createSemaphore(0);
    const originalValue = s.value;
    semSignal(s);
    expect(s.value).toBe(originalValue);
  });
});

describe('P and V interaction', () => {
  test('P then V returns to original state', () => {
    const s = createSemaphore(1);
    const afterP = semWait(s, 'P1');
    expect(afterP.semaphore.value).toBe(0);
    const afterV = semSignal(afterP.semaphore);
    expect(afterV.semaphore.value).toBe(1);
  });

  test('two Ps then two Vs: value returns to initial', () => {
    const s = createSemaphore(2);
    const r1 = semWait(s, 'P1');
    const r2 = semWait(r1.semaphore, 'P2');
    expect(r2.semaphore.value).toBe(0);

    const r3 = semSignal(r2.semaphore);
    expect(r3.semaphore.value).toBe(1);
    const r4 = semSignal(r3.semaphore);
    expect(r4.semaphore.value).toBe(2);
  });

  test('blocking and wake cycle: P on 0 blocks, V wakes', () => {
    const s = createSemaphore(0);
    const pResult = semWait(s, 'P1');
    expect(pResult.blocked).toBe(true);

    const vResult = semSignal(pResult.semaphore);
    expect(vResult.woken).toBe('P1');
    expect(vResult.semaphore.value).toBe(0);
  });
});
