const { createRag, addProcess, addResource, addEdge, removeNode, removeEdge, getRagErrors, toWaitForGraph, detectCycle, detectDeadlock } = require('../../utils/rag');

describe('createRag', () => {
  test('returns empty RAG with no processes, resources, or edges', () => {
    const rag = createRag();
    expect(rag.processes).toEqual([]);
    expect(rag.resources).toEqual([]);
    expect(rag.edges).toEqual([]);
  });
});

describe('addProcess', () => {
  test('adds a process to the RAG and returns new RAG (immutable)', () => {
    const rag = createRag();
    const updated = addProcess(rag, 'P1', 'P1');
    expect(updated.processes).toEqual([{ id: 'P1', name: 'P1' }]);
    expect(rag.processes).toEqual([]); // original unchanged
  });

  test('throws if process id already exists', () => {
    const rag = addProcess(createRag(), 'P1', 'P1');
    expect(() => addProcess(rag, 'P1', 'P1')).toThrow('Process P1 already exists');
  });

  test('throws if more than 5 processes', () => {
    let rag = createRag();
    for (let i = 1; i <= 5; i++) rag = addProcess(rag, 'P' + i, 'P' + i);
    expect(() => addProcess(rag, 'P6', 'P6')).toThrow('Maximum 5 processes');
  });
});

describe('addResource', () => {
  test('adds a resource with total count', () => {
    const rag = addResource(createRag(), 'R1', 'R1', 2);
    expect(rag.resources).toEqual([{ id: 'R1', label: 'R1', total: 2 }]);
  });

  test('throws if resource id already exists', () => {
    const rag = addResource(createRag(), 'R1', 'R1', 2);
    expect(() => addResource(rag, 'R1', 'R1', 3)).toThrow('Resource R1 already exists');
  });

  test('throws if more than 5 resources', () => {
    let rag = createRag();
    for (let i = 1; i <= 5; i++) rag = addResource(rag, 'R' + i, 'R' + i, 1);
    expect(() => addResource(rag, 'R6', 'R6', 1)).toThrow('Maximum 5 resources');
  });
});

describe('addEdge', () => {
  test('adds a request edge', () => {
    const rag = addEdge(
      addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2),
      'P1', 'R1', 'request', 1
    );
    expect(rag.edges).toEqual([{ from: 'P1', to: 'R1', type: 'request', count: 1 }]);
  });

  test('adds an allocation edge', () => {
    const rag = addEdge(
      addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2),
      'R1', 'P1', 'allocation', 1
    );
    expect(rag.edges).toEqual([{ from: 'R1', to: 'P1', type: 'allocation', count: 1 }]);
  });

  test('throws if request count exceeds resource total', () => {
    const rag = addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2);
    expect(() => addEdge(rag, 'P1', 'R1', 'request', 3))
      .toThrow('Request count 3 exceeds total 2 for R1');
  });

  test('throws if from node does not exist', () => {
    const rag = addResource(createRag(), 'R1', 'R1', 2);
    expect(() => addEdge(rag, 'P1', 'R1', 'request', 1)).toThrow('Node P1 not found');
  });

  test('throws if to node does not exist', () => {
    const rag = addProcess(createRag(), 'P1', 'P1');
    expect(() => addEdge(rag, 'P1', 'R1', 'request', 1)).toThrow('Node R1 not found');
  });

  test('throws if edge type is invalid', () => {
    const rag = addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2);
    expect(() => addEdge(rag, 'P1', 'R1', 'invalid', 1)).toThrow('Invalid edge type');
  });

  test('throws if duplicate edge exists', () => {
    const rag = addEdge(
      addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2),
      'P1', 'R1', 'request', 1
    );
    expect(() => addEdge(rag, 'P1', 'R1', 'request', 1)).toThrow('Edge already exists');
  });
});

describe('removeNode', () => {
  test('removes a process and its edges', () => {
    const rag = addEdge(
      addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2),
      'P1', 'R1', 'request', 1
    );
    const updated = removeNode(rag, 'P1');
    expect(updated.processes).toEqual([]);
    expect(updated.edges).toEqual([]);
    expect(rag.processes.length).toBe(1); // original unchanged
  });

  test('removes a resource and its edges', () => {
    const rag = addEdge(
      addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2),
      'P1', 'R1', 'request', 1
    );
    const updated = removeNode(rag, 'R1');
    expect(updated.resources).toEqual([]);
    expect(updated.edges).toEqual([]);
  });

  test('throws if node does not exist', () => {
    expect(() => removeNode(createRag(), 'P1')).toThrow('Node P1 not found');
  });
});

describe('removeEdge', () => {
  test('removes an edge', () => {
    const rag = addEdge(
      addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2),
      'P1', 'R1', 'request', 1
    );
    const updated = removeEdge(rag, 'P1', 'R1', 'request');
    expect(updated.edges).toEqual([]);
    expect(rag.edges.length).toBe(1); // original unchanged
  });

  test('throws if edge does not exist', () => {
    const rag = addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2);
    expect(() => removeEdge(rag, 'P1', 'R1', 'request')).toThrow('Edge not found');
  });
});

describe('getRagErrors', () => {
  test('returns error when no processes', () => {
    const errors = getRagErrors(createRag());
    expect(errors).toContain('请至少添加一个进程');
  });

  test('returns error when no resources', () => {
    const errors = getRagErrors(addProcess(createRag(), 'P1', 'P1'));
    expect(errors).toContain('请至少添加一个资源');
  });

  test('returns empty array for valid RAG', () => {
    const rag = addEdge(
      addResource(addProcess(createRag(), 'P1', 'P1'), 'R1', 'R1', 2),
      'P1', 'R1', 'request', 1
    );
    expect(getRagErrors(rag)).toEqual([]);
  });
});

// ── Deadlock Detection ──

describe('toWaitForGraph', () => {
  test('converts simple RAG to wait-for graph: P1→R1←P2, R1→P1', () => {
    // P1 requests R1, R1 allocated to P2 → P1 waits for P2
    let rag = createRag();
    rag = addProcess(rag, 'P1', 'P1');
    rag = addProcess(rag, 'P2', 'P2');
    rag = addResource(rag, 'R1', 'R1', 1);
    rag = addEdge(rag, 'P1', 'R1', 'request', 1);
    rag = addEdge(rag, 'R1', 'P2', 'allocation', 1);

    const wfg = toWaitForGraph(rag);
    expect(wfg.nodes).toEqual(['P1', 'P2']);
    expect(wfg.edges).toEqual([{ from: 'P1', to: 'P2' }]);
  });

  test('multiple resources: P1→R1→P2 and P2→R2→P1 → cycle', () => {
    let rag = createRag();
    rag = addProcess(rag, 'P1', 'P1');
    rag = addProcess(rag, 'P2', 'P2');
    rag = addResource(rag, 'R1', 'R1', 1);
    rag = addResource(rag, 'R2', 'R2', 1);
    rag = addEdge(rag, 'P1', 'R1', 'request', 1);
    rag = addEdge(rag, 'R1', 'P2', 'allocation', 1);
    rag = addEdge(rag, 'P2', 'R2', 'request', 1);
    rag = addEdge(rag, 'R2', 'P1', 'allocation', 1);

    const wfg = toWaitForGraph(rag);
    expect(wfg.edges).toContainEqual({ from: 'P1', to: 'P2' });
    expect(wfg.edges).toContainEqual({ from: 'P2', to: 'P1' });
  });

  test('no edges when no resource contention', () => {
    let rag = createRag();
    rag = addProcess(rag, 'P1', 'P1');
    rag = addProcess(rag, 'P2', 'P2');
    rag = addResource(rag, 'R1', 'R1', 2);
    rag = addEdge(rag, 'R1', 'P1', 'allocation', 1);
    rag = addEdge(rag, 'R1', 'P2', 'allocation', 1);

    const wfg = toWaitForGraph(rag);
    expect(wfg.edges).toEqual([]);
  });
});

describe('detectCycle', () => {
  test('detects simple cycle: P1→P2→P1', () => {
    const result = detectCycle({
      nodes: ['P1', 'P2'],
      edges: [{ from: 'P1', to: 'P2' }, { from: 'P2', to: 'P1' }]
    });
    expect(result.hasCycle).toBe(true);
    expect(result.cycles[0]).toContain('P1');
    expect(result.cycles[0]).toContain('P2');
  });

  test('no cycle in linear graph: P1→P2→P3', () => {
    const result = detectCycle({
      nodes: ['P1', 'P2', 'P3'],
      edges: [{ from: 'P1', to: 'P2' }, { from: 'P2', to: 'P3' }]
    });
    expect(result.hasCycle).toBe(false);
    expect(result.cycles).toEqual([]);
  });

  test('single node self-loop is a cycle', () => {
    const result = detectCycle({
      nodes: ['P1'],
      edges: [{ from: 'P1', to: 'P1' }]
    });
    expect(result.hasCycle).toBe(true);
  });

  test('no nodes returns no cycle', () => {
    const result = detectCycle({ nodes: [], edges: [] });
    expect(result.hasCycle).toBe(false);
  });
});

describe('detectDeadlock', () => {
  test('detects deadlock: P1→R1→P2→R2→P1', () => {
    // Single resource of each type, circular wait
    let rag = createRag();
    rag = addProcess(rag, 'P1', 'P1');
    rag = addProcess(rag, 'P2', 'P2');
    rag = addResource(rag, 'R1', 'R1', 1);
    rag = addResource(rag, 'R2', 'R2', 1);
    rag = addEdge(rag, 'P1', 'R1', 'request', 1);
    rag = addEdge(rag, 'R1', 'P2', 'allocation', 1);
    rag = addEdge(rag, 'P2', 'R2', 'request', 1);
    rag = addEdge(rag, 'R2', 'P1', 'allocation', 1);

    const result = detectDeadlock(rag);
    expect(result.hasDeadlock).toBe(true);
    expect(result.deadlockedProcesses).toContain('P1');
    expect(result.deadlockedProcesses).toContain('P2');
    expect(result.cycle).toBeDefined();
    expect(result.cycle.length).toBeGreaterThanOrEqual(2);
  });

  test('no deadlock when all processes can proceed', () => {
    let rag = createRag();
    rag = addProcess(rag, 'P1', 'P1');
    rag = addProcess(rag, 'P2', 'P2');
    rag = addResource(rag, 'R1', 'R1', 2);
    rag = addEdge(rag, 'R1', 'P1', 'allocation', 1);
    rag = addEdge(rag, 'R1', 'P2', 'allocation', 1);

    const result = detectDeadlock(rag);
    expect(result.hasDeadlock).toBe(false);
    expect(result.deadlockedProcesses).toEqual([]);
  });

  test('no deadlock with no edges', () => {
    let rag = createRag();
    rag = addProcess(rag, 'P1', 'P1');
    rag = addResource(rag, 'R1', 'R1', 1);

    const result = detectDeadlock(rag);
    expect(result.hasDeadlock).toBe(false);
  });

  test('deadlock with 3 processes circular wait', () => {
    // Classic: P1→R1→P2→R2→P3→R3→P1
    let rag = createRag();
    for (let i = 1; i <= 3; i++) rag = addProcess(rag, 'P' + i, 'P' + i);
    for (let i = 1; i <= 3; i++) rag = addResource(rag, 'R' + i, 'R' + i, 1);
    rag = addEdge(rag, 'P1', 'R1', 'request', 1);
    rag = addEdge(rag, 'R1', 'P2', 'allocation', 1);
    rag = addEdge(rag, 'P2', 'R2', 'request', 1);
    rag = addEdge(rag, 'R2', 'P3', 'allocation', 1);
    rag = addEdge(rag, 'P3', 'R3', 'request', 1);
    rag = addEdge(rag, 'R3', 'P1', 'allocation', 1);

    const result = detectDeadlock(rag);
    expect(result.hasDeadlock).toBe(true);
    expect(result.deadlockedProcesses).toEqual(['P1', 'P2', 'P3']);
  });
});
