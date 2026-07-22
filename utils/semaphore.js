/**
 * 信号量模块（纯函数，不可变操作）
 *
 * 实现 PV 信号量操作（Dijkstra 的 P/V 原语）：
 * - P 操作（semWait）：申请资源，value--，若 value<0 则阻塞
 * - V 操作（semSignal）：释放资源，value++，若 value<=0 则唤醒一个等待者
 *
 * 所有函数返回新状态，不修改入参。
 */

/**
 * 创建信号量
 * @param {number} initialValue 初始值
 * @returns {{ value: number, initial: number, queue: string[], history: Array }}
 */
function createSemaphore(initialValue) {
  if (typeof initialValue !== 'number' || !Number.isInteger(initialValue)) {
    throw new Error('createSemaphore: initialValue must be an integer');
  }
  return {
    value: initialValue,
    initial: initialValue,
    queue: [],
    history: []
  };
}

/**
 * P 操作（wait）：申请资源
 * @param {{ value: number, initial: number, queue: string[], history: Array }} semaphore
 * @param {string} ownerId 请求资源的进程/线程 ID
 * @returns {{ semaphore: { value: number, initial: number, queue: string[], history: Array }, blocked: boolean }}
 */
function semWait(semaphore, ownerId) {
  const newValue = semaphore.value - 1;
  const blocked = newValue < 0;
  const newQueue = blocked ? semaphore.queue.concat([ownerId]) : semaphore.queue.slice();
  const record = {
    type: 'P',
    ownerId,
    valueBefore: semaphore.value,
    valueAfter: newValue,
    blocked,
    woken: null,
    timestamp: Date.now()
  };
  return {
    semaphore: {
      value: newValue,
      initial: semaphore.initial,
      queue: newQueue,
      history: semaphore.history.concat([record])
    },
    blocked
  };
}

/**
 * V 操作（signal）：释放资源
 * @param {{ value: number, initial: number, queue: string[], history: Array }} semaphore
 * @returns {{ semaphore: { value: number, initial: number, queue: string[], history: Array }, woken: string|null }}
 */
function semSignal(semaphore) {
  const newValue = semaphore.value + 1;
  let woken = null;
  let newQueue = semaphore.queue.slice();
  if (newValue <= 0 && newQueue.length > 0) {
    woken = newQueue[0];
    newQueue = newQueue.slice(1);
  }
  const record = {
    type: 'V',
    ownerId: woken || '',
    valueBefore: semaphore.value,
    valueAfter: newValue,
    blocked: false,
    woken,
    timestamp: Date.now()
  };
  return {
    semaphore: {
      value: newValue,
      initial: semaphore.initial,
      queue: newQueue,
      history: semaphore.history.concat([record])
    },
    woken
  };
}

module.exports = {
  createSemaphore,
  semWait,
  semSignal
};
