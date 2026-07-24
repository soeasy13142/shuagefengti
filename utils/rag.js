/**
 * @typedef {{ id: string, name: string }} ProcessNode
 * @typedef {{ id: string, label: string, total: number }} ResourceNode
 * @typedef {{ from: string, to: string, type: 'request'|'allocation', count: number }} Edge
 * @typedef {{ processes: ProcessNode[], resources: ResourceNode[], edges: Edge[] }} Rag
 */

const MAX_PROCESSES = 5;
const MAX_RESOURCES = 5;

/**
 * Create an empty RAG
 * @returns {Rag}
 */
function createRag() {
  return { processes: [], resources: [], edges: [] };
}

/**
 * Add a process node (immutable)
 * @param {Rag} rag
 * @param {string} id
 * @param {string} name
 * @returns {Rag}
 */
function addProcess(rag, id, name) {
  if (rag.processes.some(function(p) { return p.id === id; })) {
    throw new Error('Process ' + id + ' already exists');
  }
  if (rag.processes.length >= MAX_PROCESSES) {
    throw new Error('Maximum 5 processes');
  }
  return {
    processes: rag.processes.concat([{ id: id, name: name }]),
    resources: rag.resources,
    edges: rag.edges
  };
}

/**
 * Add a resource node (immutable)
 * @param {Rag} rag
 * @param {string} id
 * @param {string} label
 * @param {number} total
 * @returns {Rag}
 */
function addResource(rag, id, label, total) {
  if (rag.resources.some(function(r) { return r.id === id; })) {
    throw new Error('Resource ' + id + ' already exists');
  }
  if (rag.resources.length >= MAX_RESOURCES) {
    throw new Error('Maximum 5 resources');
  }
  return {
    processes: rag.processes,
    resources: rag.resources.concat([{ id: id, label: label, total: total }]),
    edges: rag.edges
  };
}

function _findNode(rag, id) {
  return rag.processes.some(function(p) { return p.id === id; }) ||
         rag.resources.some(function(r) { return r.id === id; });
}

function _getResourceTotal(rag, rid) {
  const res = rag.resources.find(function(r) { return r.id === rid; });
  return res ? res.total : 0;
}

function _sumAllocations(rag, rid) {
  let sum = 0;
  rag.edges.forEach(function(e) {
    if (e.from === rid && e.type === 'allocation') sum += e.count;
  });
  return sum;
}

/**
 * Add an edge (immutable)
 * @param {Rag} rag
 * @param {string} from
 * @param {string} to
 * @param {'request'|'allocation'} type
 * @param {number} count
 * @returns {Rag}
 */
function addEdge(rag, from, to, type, count) {
  if (!_findNode(rag, from)) throw new Error('Node ' + from + ' not found');
  if (!_findNode(rag, to)) throw new Error('Node ' + to + ' not found');
  if (type !== 'request' && type !== 'allocation') throw new Error('Invalid edge type');
  if (rag.edges.some(function(e) { return e.from === from && e.to === to && e.type === type; })) {
    throw new Error('Edge already exists');
  }

  // Validate edge direction semantics
  if (type === 'request') {
    const isFromProcess = rag.processes.some(function(p) { return p.id === from; });
    const isToResource = rag.resources.some(function(r) { return r.id === to; });
    if (!isFromProcess || !isToResource) {
      throw new Error('Request edge must go from process to resource');
    }
  } else if (type === 'allocation') {
    const isFromResource = rag.resources.some(function(r) { return r.id === from; });
    const isToProcess = rag.processes.some(function(p) { return p.id === to; });
    if (!isFromResource || !isToProcess) {
      throw new Error('Allocation edge must go from resource to process');
    }
  }

  if (type === 'request' || (type === 'allocation' && rag.resources.some(function(r) { return r.id === from; }))) {
    const rid = (type === 'request') ? to : from;
    const total = _getResourceTotal(rag, rid);

    if (type === 'allocation') {
      const used = _sumAllocations(rag, rid) + count;
      if (used > total) {
        throw new Error('Allocation count ' + count + ' exceeds total ' + total + ' for ' + rid);
      }
    } else {
      // For requests, only check that the request count itself does not exceed the resource total
      if (count > total) {
        throw new Error('Request count ' + count + ' exceeds total ' + total + ' for ' + rid);
      }
    }
  }

  return {
    processes: rag.processes,
    resources: rag.resources,
    edges: rag.edges.concat([{ from: from, to: to, type: type, count: count }])
  };
}

/**
 * Remove a node and its edges (immutable)
 * @param {Rag} rag
 * @param {string} id
 * @returns {Rag}
 */
function removeNode(rag, id) {
  if (!_findNode(rag, id)) throw new Error('Node ' + id + ' not found');
  return {
    processes: rag.processes.filter(function(p) { return p.id !== id; }),
    resources: rag.resources.filter(function(r) { return r.id !== id; }),
    edges: rag.edges.filter(function(e) { return e.from !== id && e.to !== id; })
  };
}

/**
 * Remove an edge (immutable)
 * @param {Rag} rag
 * @param {string} from
 * @param {string} to
 * @param {'request'|'allocation'} type
 * @returns {Rag}
 */
function removeEdge(rag, from, to, type) {
  const idx = rag.edges.findIndex(function(e) { return e.from === from && e.to === to && e.type === type; });
  if (idx === -1) throw new Error('Edge not found');
  return {
    processes: rag.processes,
    resources: rag.resources,
    edges: rag.edges.filter(function(_, i) { return i !== idx; })
  };
}

/**
 * Get validation errors for a RAG
 * @param {Rag} rag
 * @returns {string[]}
 */
function getRagErrors(rag) {
  const errors = [];
  if (rag.processes.length === 0) errors.push('请至少添加一个进程');
  if (rag.resources.length === 0) errors.push('请至少添加一个资源');
  return errors;
}

/**
 * Convert RAG to wait-for graph (process-to-process edges)
 * Pi waits for Pj if Pi requests Rk AND Rk is allocated to Pj
 * @param {Rag} rag
 * @returns {{ nodes: string[], edges: { from: string, to: string }[] }}
 */
function toWaitForGraph(rag) {
  const pids = rag.processes.map(function(p) { return p.id; });
  const edges = [];

  rag.processes.forEach(function(pi) {
    rag.processes.forEach(function(pj) {
      if (pi.id === pj.id) return;
      // Does Pi request any resource that is allocated to Pj?
      const piRequests = rag.edges.filter(function(e) {
        return e.from === pi.id && e.type === 'request';
      });
      const pjAllocated = rag.edges.filter(function(e) {
        return e.to === pj.id && e.type === 'allocation';
      });

      piRequests.forEach(function(req) {
        pjAllocated.forEach(function(alloc) {
          if (req.to === alloc.from) {
            edges.push({ from: pi.id, to: pj.id });
          }
        });
      });
    });
  });

  // Deduplicate edges
  const uniqueEdges = [];
  edges.forEach(function(e) {
    if (!uniqueEdges.some(function(u) { return u.from === e.from && u.to === e.to; })) {
      uniqueEdges.push(e);
    }
  });

  return { nodes: pids, edges: uniqueEdges };
}

/**
 * Detect cycles in a directed graph using DFS with coloring
 * @param {{ nodes: string[], edges: { from: string, to: string }[] }} graph
 * @returns {{ hasCycle: boolean, cycles: string[][] }}
 */
function detectCycle(graph) {
  const adjList = {};
  graph.nodes.forEach(function(n) { adjList[n] = []; });
  graph.edges.forEach(function(e) {
    if (adjList[e.from]) {
      adjList[e.from] = [...adjList[e.from], e.to];
    }
  });

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};
  const parent = {};
  graph.nodes.forEach(function(n) {
    color[n] = WHITE;
    parent[n] = null;
  });

  const cycles = [];

  function dfs(node) {
    color[node] = GRAY;
    (adjList[node] || []).forEach(function(neighbor) {
      if (color[neighbor] === GRAY) {
        // Found a cycle, reconstruct it
        const cycle = [neighbor, node];
        let cur = node;
        while (cur !== neighbor && parent[cur] !== null) {
          cur = parent[cur];
          cycle.push(cur);
        }
        cycles.push([...cycle].reverse());
      } else if (color[neighbor] === WHITE) {
        parent[neighbor] = node;
        dfs(neighbor);
      }
    });
    color[node] = BLACK;
  }

  graph.nodes.forEach(function(n) {
    if (color[n] === WHITE) dfs(n);
  });

  return {
    hasCycle: cycles.length > 0,
    cycles: cycles
  };
}

/**
 * Detect deadlock in a RAG
 * @param {Rag} rag
 * @returns {{ hasDeadlock: boolean, cycle: string[]|null, deadlockedProcesses: string[] }}
 */
function detectDeadlock(rag) {
  const wfg = toWaitForGraph(rag);
  const result = detectCycle(wfg);
  let deadlocked = [];
  const processIdMap = {};
  rag.processes.forEach(function(p) { processIdMap[p.id] = true; });

  if (result.hasCycle) {
    // Collect unique deadlocked process IDs from all cycles
    const seen = {};
    result.cycles.forEach(function(cycle) {
      cycle.forEach(function(n) {
        if (processIdMap[n]) seen[n] = true;
      });
    });
    deadlocked = Object.keys(seen).sort();
  }

  return {
    hasDeadlock: result.hasCycle,
    cycle: result.cycles.length > 0 ? result.cycles[0] : null,
    deadlockedProcesses: deadlocked
  };
}

module.exports = {
  createRag,
  addProcess,
  addResource,
  addEdge,
  removeNode,
  removeEdge,
  getRagErrors,
  toWaitForGraph,
  detectCycle,
  detectDeadlock,
  MAX_PROCESSES,
  MAX_RESOURCES
};
