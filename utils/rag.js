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

function _sumAllocationsAndRequests(rag, rid) {
  let sum = 0;
  rag.edges.forEach(function(e) {
    if (e.to === rid || e.from === rid) sum += e.count;
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

  if (type === 'request' || (type === 'allocation' && rag.resources.some(function(r) { return r.id === from; }))) {
    const rid = (type === 'request') ? to : from;
    const total = _getResourceTotal(rag, rid);
    const used = _sumAllocationsAndRequests(rag, rid) + count;
    if (used > total) {
      throw new Error('Request count ' + count + ' exceeds total ' + total + ' for ' + rid);
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

module.exports = {
  createRag,
  addProcess,
  addResource,
  addEdge,
  removeNode,
  removeEdge,
  getRagErrors,
  MAX_PROCESSES,
  MAX_RESOURCES
};
