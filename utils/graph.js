/**
 * 图搜索纯函数模块
 *
 * 提供 BFS/DFS 搜索和预设图结构，
 * 每个搜索返回步骤数组用于可视化回放。
 */

// ======================== 预设图结构 ========================

/**
 * 创建预设图结构
 * @param {string} type - 图类型：'simple'|'tree'|'cycle'
 * @returns {object} 图对象 { nodes, edges, adjList }
 */
function createSampleGraph(type) {
  if (type === 'simple') {
    return _buildGraph(
      ['A', 'B', 'C', 'D', 'E'],
      [['A','B'], ['A','C'], ['B','D'], ['C','D'], ['D','E']]
    );
  } else if (type === 'tree') {
    return _buildGraph(
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      [['A','B'], ['A','C'], ['B','D'], ['B','E'], ['C','F'], ['C','G']]
    );
  } else if (type === 'cycle') {
    return _buildGraph(
      ['A', 'B', 'C', 'D', 'E'],
      [['A','B'], ['B','C'], ['C','D'], ['D','E'], ['E','A'], ['A','D']]
    );
  }
  return _buildGraph(['A'], []);
}

/**
 * 从节点 ID 列表和边列表构建完整图对象
 * 节点自动布局为圆形排列
 */
function _buildGraph(nodeIds, edgePairs) {
  var NODE_RADIUS = 150;
  var CENTER_X = 200;
  var CENTER_Y = 180;
  var nodes = [];
  var adjList = {};

  for (var i = 0; i < nodeIds.length; i++) {
    var angle = (2 * Math.PI * i / nodeIds.length) - Math.PI / 2;
    nodes.push({
      id: nodeIds[i],
      x: CENTER_X + NODE_RADIUS * Math.cos(angle),
      y: CENTER_Y + NODE_RADIUS * Math.sin(angle),
      state: 'normal',
      visitOrder: 0
    });
    adjList[nodeIds[i]] = [];
  }

  var edges = [];
  for (var j = 0; j < edgePairs.length; j++) {
    var from = edgePairs[j][0];
    var to = edgePairs[j][1];
    edges.push({ from: from, to: to, state: 'normal' });
    adjList[from].push(to);
    adjList[to].push(from);
  }

  return { nodes: nodes, edges: edges, adjList: adjList };
}

// ======================== 辅助函数 ========================

/**
 * 深拷贝图（用于步骤快照）
 */
function cloneGraph(graph) {
  var nodes = [];
  for (var i = 0; i < graph.nodes.length; i++) {
    var n = graph.nodes[i];
    nodes.push({ id: n.id, x: n.x, y: n.y, state: n.state, visitOrder: n.visitOrder });
  }
  var edges = [];
  for (var j = 0; j < graph.edges.length; j++) {
    var e = graph.edges[j];
    edges.push({ from: e.from, to: e.to, state: e.state });
  }
  var adjList = {};
  for (var key in graph.adjList) {
    adjList[key] = graph.adjList[key].slice();
  }
  return { nodes: nodes, edges: edges, adjList: adjList };
}

/**
 * 获取已访问节点 ID 列表
 */
function _getVisitedList(nodes, visited) {
  var list = [];
  for (var i = 0; i < nodes.length; i++) {
    if (visited[nodes[i].id]) {
      list.push(nodes[i].id);
    }
  }
  return list;
}

/**
 * 将访问状态应用到图快照
 */
function _applyVisitState(graph, visited, currentNode, visitOrder) {
  var snapshot = cloneGraph(graph);
  for (var i = 0; i < snapshot.nodes.length; i++) {
    var n = snapshot.nodes[i];
    if (visited[n.id]) {
      n.state = 'visited';
      n.visitOrder = visitOrder;
    }
    if (n.id === currentNode) {
      n.state = 'current';
    }
  }
  for (var j = 0; j < snapshot.edges.length; j++) {
    var e = snapshot.edges[j];
    if (visited[e.from] && visited[e.to]) {
      e.state = 'visited';
    }
  }
  return snapshot;
}

// ======================== BFS ========================

/**
 * 广度优先搜索
 * @param {object} graph - 图对象
 * @param {string} startNode - 起始节点 ID
 * @returns {Array} 操作步骤
 */
function bfs(graph, startNode) {
  var steps = [];
  var visited = {};
  var queue = [];
  var visitOrder = 0;

  queue.push(startNode);
  steps.push({
    type: 'enqueue',
    node: startNode,
    queue: queue.slice(),
    visited: [],
    description: '将起始节点 ' + startNode + ' 加入队列',
    graphSnapshot: cloneGraph(graph)
  });

  while (queue.length > 0) {
    var current = queue.shift();

    if (visited[current]) continue;
    visited[current] = true;
    visitOrder++;

    steps.push({
      type: 'visit',
      node: current,
      visitOrder: visitOrder,
      queue: queue.slice(),
      visited: _getVisitedList(graph.nodes, visited),
      description: '访问节点 ' + current + '（第 ' + visitOrder + ' 个）',
      graphSnapshot: _applyVisitState(graph, visited, current, visitOrder)
    });

    var neighbors = graph.adjList[current] || [];
    var newNeighbors = [];
    for (var i = 0; i < neighbors.length; i++) {
      if (!visited[neighbors[i]]) {
        queue.push(neighbors[i]);
        newNeighbors.push(neighbors[i]);
      }
    }

    if (newNeighbors.length > 0) {
      steps.push({
        type: 'enqueue-neighbors',
        node: current,
        neighbors: newNeighbors,
        queue: queue.slice(),
        visited: _getVisitedList(graph.nodes, visited),
        description: '将 ' + current + ' 的邻居 ' + newNeighbors.join('、') + ' 加入队列',
        graphSnapshot: _applyVisitState(graph, visited, current, visitOrder)
      });
    }
  }

  steps.push({
    type: 'done',
    visited: _getVisitedList(graph.nodes, visited),
    description: 'BFS 遍历完成，共访问 ' + visitOrder + ' 个节点',
    graphSnapshot: _applyVisitState(graph, visited, null, visitOrder)
  });

  return steps;
}

// ======================== DFS ========================

/**
 * 深度优先搜索
 * @param {object} graph - 图对象
 * @param {string} startNode - 起始节点 ID
 * @returns {Array} 操作步骤
 */
function dfs(graph, startNode) {
  var steps = [];
  var visited = {};
  var visitOrder = { val: 0 };
  var stack = [];

  stack.push(startNode);
  steps.push({
    type: 'push',
    node: startNode,
    stack: stack.slice(),
    visited: [],
    description: '将起始节点 ' + startNode + ' 压入栈',
    graphSnapshot: cloneGraph(graph)
  });

  _dfsRecursive(graph, startNode, visited, steps, stack, visitOrder);

  steps.push({
    type: 'done',
    visited: _getVisitedList(graph.nodes, visited),
    description: 'DFS 遍历完成，共访问 ' + visitOrder.val + ' 个节点',
    graphSnapshot: _applyVisitState(graph, visited, null, visitOrder.val)
  });

  return steps;
}

function _dfsRecursive(graph, node, visited, steps, stack, visitOrder) {
  if (visited[node]) return;

  visited[node] = true;
  visitOrder.val++;

  steps.push({
    type: 'visit',
    node: node,
    visitOrder: visitOrder.val,
    stack: stack.slice(),
    visited: _getVisitedList(graph.nodes, visited),
    description: '访问节点 ' + node + '（第 ' + visitOrder.val + ' 个）',
    graphSnapshot: _applyVisitState(graph, visited, node, visitOrder.val)
  });

  var neighbors = graph.adjList[node] || [];
  for (var i = 0; i < neighbors.length; i++) {
    var neighbor = neighbors[i];
    if (!visited[neighbor]) {
      stack.push(neighbor);
      steps.push({
        type: 'explore',
        from: node,
        to: neighbor,
        stack: stack.slice(),
        visited: _getVisitedList(graph.nodes, visited),
        description: '从 ' + node + ' 探索到 ' + neighbor,
        graphSnapshot: _applyVisitState(graph, visited, node, visitOrder.val)
      });

      _dfsRecursive(graph, neighbor, visited, steps, stack, visitOrder);

      stack.pop();
      steps.push({
        type: 'backtrack',
        from: neighbor,
        to: node,
        stack: stack.slice(),
        visited: _getVisitedList(graph.nodes, visited),
        description: '从 ' + neighbor + ' 回溯到 ' + node,
        graphSnapshot: _applyVisitState(graph, visited, node, visitOrder.val)
      });
    }
  }
}

// ======================== 导出 ========================

module.exports = {
  createSampleGraph: createSampleGraph,
  bfs: bfs,
  dfs: dfs,
  cloneGraph: cloneGraph
};
