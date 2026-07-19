/**
 * CPU 调度算法（纯函数）
 *
 * 4 个算法输入 {pid, arrival, burst}[] 输出 GanttStep[]
 * 完全无副作用，便于测试。
 *
 * GanttStep = { pid, start, end }
 */

const DEFAULT_MFQ_QUEUES = [2, 4, 8];

/**
 * 比较函数：先 arrival，再 pid 字典序
 */
function _byArrivalThenPid(a, b) {
  if (a.arrival !== b.arrival) return a.arrival - b.arrival;
  return a.pid.localeCompare(b.pid);
}

/**
 * 找下一个未完成且已到达的进程最早到达时间
 */
function _nextArrivalTime(processes, completed) {
  let t = Infinity;
  for (const p of processes) {
    if (!completed.has(p.pid) && p.arrival < t) {
      t = p.arrival;
    }
  }
  return t;
}

/**
 * FCFS（First-Come First-Served）：按 arrival 排序，串行执行
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @returns {Array<{ pid: string, start: number, end: number }>}
 */
function fcfs(processes) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  const sorted = processes.slice().sort(_byArrivalThenPid);
  const gantt = [];
  let t = 0;
  for (const p of sorted) {
    if (t < p.arrival) t = p.arrival;
    gantt.push({ pid: p.pid, start: t, end: t + p.burst });
    t += p.burst;
  }
  return gantt;
}

/**
 * SJF（非抢占）：每次从 ready 队列里选 burst 最短的；同 burst 时按 pid 字典序
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @returns {Array<{ pid: string, start: number, end: number }>}
 */
function sjf(processes) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  const completed = new Set();
  const gantt = [];
  let t = 0;

  while (completed.size < processes.length) {
    const ready = processes.filter(p =>
      !completed.has(p.pid) && p.arrival <= t
    );
    if (ready.length === 0) {
      t = _nextArrivalTime(processes, completed);
      continue;
    }
    ready.sort((a, b) => {
      if (a.burst !== b.burst) return a.burst - b.burst;
      return a.pid.localeCompare(b.pid);
    });
    const p = ready[0];
    gantt.push({ pid: p.pid, start: t, end: t + p.burst });
    t += p.burst;
    completed.add(p.pid);
  }
  return gantt;
}

/**
 * 在 (admitIdx 之后, currentTime 之前或等于) 的进程中找出已到达但未在 readyQueue 里出现的，全部入队
 */
function _admitNew(queue, sorted, admitIdx, currentTime, inQueue) {
  while (admitIdx < sorted.length && sorted[admitIdx].arrival <= currentTime) {
    if (!inQueue.has(sorted[admitIdx].pid)) {
      queue.push(sorted[admitIdx].pid);
      inQueue.add(sorted[admitIdx].pid);
    }
    admitIdx++;
  }
  return admitIdx;
}

/**
 * Round-Robin：用 quantum 切片，到时间片放回 ready 队尾
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @param {number} quantum ≥ 1
 * @returns {Array<{ pid: string, start: number, end: number }>}
 */
function rr(processes, quantum) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  if (typeof quantum !== 'number' || quantum < 1 || !Number.isInteger(quantum)) {
    throw new Error('rr: quantum must be a positive integer');
  }
  const sorted = processes.slice().sort(_byArrivalThenPid);
  const remaining = new Map();
  for (const p of sorted) remaining.set(p.pid, p.burst);

  const queue = [];
  const inQueue = new Set();
  let admitIdx = 0;
  let t = 0;
  const gantt = [];
  let completed = 0;

  while (completed < sorted.length) {
    admitIdx = _admitNew(queue, sorted, admitIdx, t, inQueue);
    if (queue.length === 0) {
      t = sorted[admitIdx].arrival;
      continue;
    }
    const pid = queue.shift();
    inQueue.delete(pid);
    const remainingBurst = remaining.get(pid);
    const slice = Math.min(remainingBurst, quantum);
    gantt.push({ pid, start: t, end: t + slice });
    t += slice;
    remaining.set(pid, remainingBurst - slice);

    // 先放回队尾（如果未完成），再准入新进程 —— 保证同时间片原进程优先于新到达
    const done = remaining.get(pid) === 0;
    if (!done) {
      queue.push(pid);
      inQueue.add(pid);
    }
    admitIdx = _admitNew(queue, sorted, admitIdx, t, inQueue);
    if (done) completed++;
  }
  return gantt;
}

/**
 * 多级反馈队列：默认 3 层 quantum = [2, 4, 8]
 * - 新进程入 q0
 * - 每层内部 RR（同一 quantum）
 * - 用完本层 quantum 且未完成 → 降级到下一层（最低层保持）
 * - 每刻度先选低层（高优先级）运行
 *
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @param {number[]} [queues] 各层 quantum；默认 [2, 4, 8]
 * @returns {Array<{ pid: string, start: number, end: number }>}
 */
function mfq(processes, queues) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  const q = Array.isArray(queues) && queues.length > 0 ? queues : DEFAULT_MFQ_QUEUES;
  for (const n of q) {
    if (typeof n !== 'number' || n < 1 || !Number.isInteger(n)) {
      throw new Error('mfq: each queue quantum must be a positive integer');
    }
  }
  const sorted = processes.slice().sort(_byArrivalThenPid);
  const remaining = new Map();
  for (const p of sorted) remaining.set(p.pid, p.burst);

  const queueLayers = q.map(() => []);
  let admitIdx = 0;
  let t = 0;
  const gantt = [];
  let completed = 0;

  const admit = () => {
    while (admitIdx < sorted.length && sorted[admitIdx].arrival <= t) {
      const pid = sorted[admitIdx].pid;
      let inLayer = false;
      for (const layer of queueLayers) {
        if (layer.indexOf(pid) !== -1) { inLayer = true; break; }
      }
      if (!inLayer) queueLayers[0].push(pid);
      admitIdx++;
    }
  };

  while (completed < sorted.length) {
    admit();
    let layerIdx = -1;
    for (let i = 0; i < queueLayers.length; i++) {
      if (queueLayers[i].length > 0) { layerIdx = i; break; }
    }
    if (layerIdx === -1) {
      t = sorted[admitIdx].arrival;
      continue;
    }
    const pid = queueLayers[layerIdx].shift();
    const remainingBurst = remaining.get(pid);
    const slice = Math.min(remainingBurst, q[layerIdx]);
    gantt.push({ pid, start: t, end: t + slice });
    t += slice;
    remaining.set(pid, remainingBurst - slice);

    admit();
    if (remaining.get(pid) === 0) {
      completed++;
    } else if (layerIdx < queueLayers.length - 1) {
      queueLayers[layerIdx + 1].push(pid);   // demote
    } else {
      queueLayers[layerIdx].push(pid);        // stay at bottom
    }
  }
  return gantt;
}

module.exports = {
  fcfs,
  sjf,
  rr,
  mfq,
  DEFAULT_MFQ_QUEUES
};
