const {
  createSimulation,
  producerStep,
  consumerStep,
  addRandomItems,
  resetSimulation
} = require('../../utils/producer-consumer');

describe('createSimulation', () => {
  test('creates simulation with correct buffer size', () => {
    const sim = createSimulation(4);
    expect(sim.buffer).toHaveLength(4);
    expect(sim.bufferSize).toBe(4);
    expect(sim.buffer.every(function(slot) { return slot === null; })).toBe(true);
    expect(sim.producerIndex).toBe(0);
    expect(sim.consumerIndex).toBe(0);
    expect(sim.semaphores.empty.value).toBe(4);
    expect(sim.semaphores.full.value).toBe(0);
    expect(sim.semaphores.mutex.value).toBe(1);
    expect(sim.steps).toEqual([]);
    expect(sim.stepCount).toBe(0);
  });

  test('creates simulation with size 2 (minimum)', () => {
    const sim = createSimulation(2);
    expect(sim.buffer).toHaveLength(2);
  });

  test('creates simulation with size 8 (maximum)', () => {
    const sim = createSimulation(8);
    expect(sim.buffer).toHaveLength(8);
  });

  test('clamps bufferSize < 2 to 2', () => {
    const sim = createSimulation(1);
    expect(sim.buffer).toHaveLength(2);
  });

  test('clamps bufferSize > 8 to 8', () => {
    const sim = createSimulation(10);
    expect(sim.buffer).toHaveLength(8);
  });
});

describe('producerStep', () => {
  test('single produce: places item, decrements empty, increments full', () => {
    const sim = createSimulation(4);
    const result = producerStep(sim, '🍎');
    expect(result.blocked).toBe(false);
    expect(result.state.buffer[0]).toBe('🍎');
    expect(result.state.producerIndex).toBe(1);
    expect(result.state.semaphores.empty.value).toBe(3);
    expect(result.state.semaphores.full.value).toBe(1);
    expect(result.state.semaphores.mutex.value).toBe(1);
    expect(result.state.stepCount).toBe(1);
  });

  test('produce fills buffer to capacity', () => {
    let sim = createSimulation(3);
    for (let i = 0; i < 3; i++) {
      const r = producerStep(sim, 'item' + i);
      expect(r.blocked).toBe(false);
      sim = r.state;
    }
    expect(sim.buffer.filter(function(s) { return s !== null; })).toHaveLength(3);
    expect(sim.semaphores.empty.value).toBe(0);
    expect(sim.semaphores.full.value).toBe(3);

    // 第 4 次生产阻塞（缓冲区满）
    const blocked = producerStep(sim, 'overflow');
    expect(blocked.blocked).toBe(true);
    // 状态不变
    expect(blocked.state.semaphores.empty.value).toBe(0);
  });

  test('produce generates log entries for each operation', () => {
    const sim = createSimulation(3);
    const result = producerStep(sim, '🍊');
    expect(result.state.steps.length).toBeGreaterThan(0);
    const stepActions = result.state.steps.map(function(s) { return s.action; });
    expect(stepActions.some(function(a) { return a.indexOf('P(empty)') !== -1; })).toBe(true);
    expect(stepActions.some(function(a) { return a.indexOf('V(full)') !== -1; })).toBe(true);
  });

  test('produce wraps around buffer (circular)', () => {
    const sim = createSimulation(3);
    let s = sim;
    for (let i = 0; i < 3; i++) {
      const r = producerStep(s, 'x');
      s = r.state;
    }
    expect(s.producerIndex).toBe(0); // wrapped
  });
});

describe('consumerStep', () => {
  test('cannot consume from empty buffer (blocks)', () => {
    const sim = createSimulation(3);
    const result = consumerStep(sim);
    expect(result.blocked).toBe(true);
    expect(result.state.buffer.every(function(s) { return s === null; })).toBe(true);
  });

  test('consumes after produce', () => {
    let sim = createSimulation(3);
    const produced = producerStep(sim, '🍇');
    sim = produced.state;

    const consumed = consumerStep(sim);
    expect(consumed.blocked).toBe(false);
    expect(consumed.state.buffer[0]).toBe(null); // slot freed
    expect(consumed.state.consumerIndex).toBe(1);
    expect(consumed.state.semaphores.empty.value).toBe(3); // back to 3
    expect(consumed.state.semaphores.full.value).toBe(0);
  });

  test('alternating produce/consume cycle', () => {
    let sim = createSimulation(3);

    // produce 2 items
    sim = producerStep(sim, '🍎').state;
    sim = producerStep(sim, '🍊').state;
    expect(sim.semaphores.full.value).toBe(2);
    expect(sim.semaphores.empty.value).toBe(1);

    // consume 1
    sim = consumerStep(sim).state;
    expect(sim.semaphores.full.value).toBe(1);
    expect(sim.semaphores.empty.value).toBe(2);
    expect(sim.buffer[0]).toBe(null);
    expect(sim.buffer[1]).toBe('🍊');
  });

  test('consumer wraps around circular buffer', () => {
    let sim = createSimulation(3);
    // fill buffer
    sim = producerStep(sim, 'a').state;
    sim = producerStep(sim, 'b').state;
    sim = producerStep(sim, 'c').state;
    // producer idx = 0 (wrapped)

    // consume all 3
    sim = consumerStep(sim).state;
    sim = consumerStep(sim).state;
    sim = consumerStep(sim).state;
    expect(sim.consumerIndex).toBe(0); // wrapped
    expect(sim.semaphores.full.value).toBe(0);
    expect(sim.semaphores.empty.value).toBe(3);
  });
});

describe('full cycle sequence', () => {
  test('producer then consumer full cycle with buffer=4', () => {
    let sim = createSimulation(4);

    // produce 4 items (fill buffer)
    const items = ['🍎', '🍊', '🍇', '🍋'];
    for (let i = 0; i < 4; i++) {
      const r = producerStep(sim, items[i]);
      expect(r.blocked).toBe(false);
      sim = r.state;
    }
    expect(sim.semaphores.empty.value).toBe(0);
    expect(sim.semaphores.full.value).toBe(4);

    // try producing — blocks
    const blockedP = producerStep(sim, '🍉');
    expect(blockedP.blocked).toBe(true);

    // consume 1 — frees a slot
    const c = consumerStep(sim);
    expect(c.blocked).toBe(false);
    sim = c.state;
    expect(sim.semaphores.empty.value).toBe(1);
    expect(sim.semaphores.full.value).toBe(3);

    // producer can now proceed
    const p2 = producerStep(sim, '🍉');
    expect(p2.blocked).toBe(false);
    sim = p2.state;
    expect(sim.semaphores.empty.value).toBe(0);
    expect(sim.semaphores.full.value).toBe(4);

    // consume all 4
    for (let i = 0; i < 4; i++) {
      const cr = consumerStep(sim);
      if (cr.blocked) break;
      sim = cr.state;
    }
    expect(sim.semaphores.empty.value).toBe(4);
    expect(sim.semaphores.full.value).toBe(0);
    expect(sim.buffer.every(function(s) { return s === null; })).toBe(true);
  });

  test('consumer blocks when empty, producer unblocks it', () => {
    let sim = createSimulation(3);

    // try consuming — blocks
    const c1 = consumerStep(sim);
    expect(c1.blocked).toBe(true);

    // producer puts item
    sim = producerStep(sim, '🍎').state;
    expect(sim.semaphores.full.value).toBe(1);

    // consumer can now consume
    const c2 = consumerStep(sim);
    expect(c2.blocked).toBe(false);
    expect(c2.state.buffer[0]).toBe(null);
  });
});

describe('addRandomItems', () => {
  test('adds default count (bufferSize) items', () => {
    const sim = createSimulation(4);
    const result = addRandomItems(sim);
    expect(result.state.semaphores.empty.value).toBe(0);
    expect(result.state.semaphores.full.value).toBe(4);
    expect(result.state.steps.length).toBeGreaterThan(0);
  });

  test('adds specified number of items', () => {
    const sim = createSimulation(6);
    const result = addRandomItems(sim, 3);
    expect(result.state.semaphores.full.value).toBe(3);
    expect(result.state.semaphores.empty.value).toBe(3);
  });

  test('stops when buffer is full', () => {
    const sim = createSimulation(3);
    const result = addRandomItems(sim, 10);
    // only 3 fit
    expect(result.state.semaphores.empty.value).toBe(0);
    expect(result.state.semaphores.full.value).toBe(3);
  });
});

describe('resetSimulation', () => {
  test('resets to initial state', () => {
    let sim = createSimulation(4);
    sim = producerStep(sim, '🍎').state;
    sim = producerStep(sim, '🍊').state;
    sim = consumerStep(sim).state;
    expect(sim.stepCount).toBeGreaterThan(0);

    const reset = resetSimulation(sim);
    expect(reset.buffer.every(function(s) { return s === null; })).toBe(true);
    expect(reset.producerIndex).toBe(0);
    expect(reset.consumerIndex).toBe(0);
    expect(reset.semaphores.empty.value).toBe(4);
    expect(reset.semaphores.full.value).toBe(0);
    expect(reset.semaphores.mutex.value).toBe(1);
    expect(reset.steps).toEqual([]);
    expect(reset.stepCount).toBe(0);
  });
});
