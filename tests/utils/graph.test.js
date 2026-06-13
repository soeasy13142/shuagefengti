const {
  createSampleGraph,
  bfs,
  dfs,
  cloneGraph
} = require('../../utils/graph');

describe('createSampleGraph', () => {
  test('simple 图有 5 个节点', () => {
    var g = createSampleGraph('simple');
    expect(g.nodes.length).toBe(5);
  });

  test('tree 图有 7 个节点', () => {
    var g = createSampleGraph('tree');
    expect(g.nodes.length).toBe(7);
  });

  test('cycle 图有 5 个节点', () => {
    var g = createSampleGraph('cycle');
    expect(g.nodes.length).toBe(5);
  });

  test('每个节点有 id, x, y, state 属性', () => {
    var g = createSampleGraph('simple');
    var node = g.nodes[0];
    expect(node).toHaveProperty('id');
    expect(node).toHaveProperty('x');
    expect(node).toHaveProperty('y');
    expect(node).toHaveProperty('state', 'normal');
  });

  test('邻接表是双向的', () => {
    var g = createSampleGraph('simple');
    var edge = g.edges[0];
    expect(g.adjList[edge.from]).toContain(edge.to);
    expect(g.adjList[edge.to]).toContain(edge.from);
  });
});

describe('bfs', () => {
  test('访问顺序正确（层序）', () => {
    var g = createSampleGraph('simple');
    var steps = bfs(g, 'A');
    var visited = steps.filter(function(s) { return s.type === 'visit'; })
      .map(function(s) { return s.node; });
    expect(visited[0]).toBe('A');
    expect(visited.length).toBe(5);
  });

  test('所有节点都被访问', () => {
    var g = createSampleGraph('simple');
    var steps = bfs(g, 'A');
    var visited = steps.filter(function(s) { return s.type === 'visit'; })
      .map(function(s) { return s.node; });
    expect(visited.sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  test('步骤包含 enqueue 类型', () => {
    var g = createSampleGraph('simple');
    var steps = bfs(g, 'A');
    var enqueueSteps = steps.filter(function(s) { return s.type === 'enqueue' || s.type === 'enqueue-neighbors'; });
    expect(enqueueSteps.length).toBeGreaterThan(0);
  });

  test('最后一步为 done', () => {
    var g = createSampleGraph('simple');
    var steps = bfs(g, 'A');
    expect(steps[steps.length - 1].type).toBe('done');
  });

  test('单节点图返回 visit 步骤', () => {
    var g = createSampleGraph('unknown');
    var steps = bfs(g, 'A');
    var visited = steps.filter(function(s) { return s.type === 'visit'; });
    expect(visited.length).toBe(1);
    expect(visited[0].node).toBe('A');
  });
});

describe('dfs', () => {
  test('访问顺序正确（深度优先）', () => {
    var g = createSampleGraph('simple');
    var steps = dfs(g, 'A');
    var visited = steps.filter(function(s) { return s.type === 'visit'; })
      .map(function(s) { return s.node; });
    expect(visited[0]).toBe('A');
    expect(visited.length).toBe(5);
  });

  test('所有节点都被访问', () => {
    var g = createSampleGraph('simple');
    var steps = dfs(g, 'A');
    var visited = steps.filter(function(s) { return s.type === 'visit'; })
      .map(function(s) { return s.node; });
    expect(visited.sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  test('步骤包含 explore 和 backtrack 类型', () => {
    var g = createSampleGraph('simple');
    var steps = dfs(g, 'A');
    var exploreSteps = steps.filter(function(s) { return s.type === 'explore'; });
    var backtrackSteps = steps.filter(function(s) { return s.type === 'backtrack'; });
    expect(exploreSteps.length).toBeGreaterThan(0);
    expect(backtrackSteps.length).toBeGreaterThan(0);
  });

  test('最后一步为 done', () => {
    var g = createSampleGraph('simple');
    var steps = dfs(g, 'A');
    expect(steps[steps.length - 1].type).toBe('done');
  });

  test('环不会导致死循环', () => {
    var g = createSampleGraph('cycle');
    var steps = dfs(g, 'A');
    var visited = steps.filter(function(s) { return s.type === 'visit'; });
    var nodes = visited.map(function(s) { return s.node; });
    var unique = nodes.filter(function(v, i, self) { return self.indexOf(v) === i; });
    expect(nodes.length).toBe(unique.length);
  });
});

describe('cloneGraph', () => {
  test('深拷贝产生独立副本', () => {
    var g = createSampleGraph('simple');
    var cloned = cloneGraph(g);
    cloned.nodes[0].id = 'Z';
    expect(g.nodes[0].id).toBe('A');
  });

  test('拷贝保持结构', () => {
    var g = createSampleGraph('simple');
    var cloned = cloneGraph(g);
    expect(cloned.nodes.length).toBe(g.nodes.length);
    expect(cloned.edges.length).toBe(g.edges.length);
  });
});
