const { createRag, addProcess, addResource, addEdge, removeNode, removeEdge, getRagErrors } = require('../../utils/rag');

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
