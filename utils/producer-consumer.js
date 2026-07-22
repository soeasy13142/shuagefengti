/**
 * 生产者-消费者模拟引擎（纯函数，不可变操作）
 *
 * 基于信号量（utils/semaphore.js）实现经典生产者-消费者问题：
 * - 有界缓冲区（环形队列）
 * - 三个信号量：mutex（互斥）/ empty（空闲槽计数）/ full（已满槽计数）
 * - P/V 序列：P(empty) → P(mutex) → 生产/消费 → V(mutex) → V(full)
 *
 * 所有操作返回新状态，不修改入参。
 */

const { createSemaphore, semWait, semSignal } = require('./semaphore');

const MIN_BUFFER = 2;
const MAX_BUFFER = 8;
const ITEMS = ['🍎', '🍊', '🍇', '🍋', '🍉', '🍓', '🍑', '🍒'];

var _nextLogId = 0;

/**
 * 创建初始模拟状态
 * @param {number} bufferSize 缓冲区大小（自动 clamp 到 [2, 8]）
 * @returns {Object} SimulationState
 */
function createSimulation(bufferSize) {
  var size = Math.max(MIN_BUFFER, Math.min(MAX_BUFFER, Math.floor(bufferSize) || MIN_BUFFER));
  _nextLogId = 0;
  return {
    buffer: Array(size).fill(null),
    bufferSize: size,
    producerIndex: 0,
    consumerIndex: 0,
    semaphores: {
      mutex: createSemaphore(1),
      empty: createSemaphore(size),
      full: createSemaphore(0)
    },
    steps: [],
    stepCount: 0
  };
}

/**
 * 生成日志条目
 * @param {string} actor
 * @param {string} action
 * @param {Object} opts
 * @returns {Object} LogEntry
 */
function _makeLog(actor, action, opts) {
  var log = {
    id: _nextLogId++,
    timestamp: opts.stepCount,
    actor: actor,
    action: action,
    blocked: opts.blocked || false,
    woken: opts.woken || false
  };
  if (opts.semaphoreName !== undefined) {
    log.semaphoreName = opts.semaphoreName;
    log.semaphoreBefore = opts.semaphoreBefore;
    log.semaphoreAfter = opts.semaphoreAfter;
  }
  if (opts.item !== undefined) {
    log.item = opts.item;
  }
  return log;
}

/**
 * 执行一次 PV 操作并记录日志
 * @param {Object} semaphores
 * @param {string} semName
 * @param {'P'|'V'} type
 * @param {string} owner
 * @param {number} stepCount
 * @returns {Object}
 */
function _doPV(semaphores, semName, type, owner, stepCount) {
  var sem = semaphores[semName];
  var result;
  if (type === 'P') {
    result = semWait(sem, owner);
  } else {
    result = semSignal(sem);
  }
  var newSems = Object.assign({}, semaphores, { [semName]: result.semaphore });
  var log = _makeLog(owner, type + '(' + semName + ')', {
    stepCount: stepCount,
    semaphoreName: semName,
    semaphoreBefore: sem.value,
    semaphoreAfter: result.semaphore.value,
    blocked: result.blocked || false,
    woken: result.woken !== null && result.woken !== undefined
  });
  return { semaphores: newSems, log: log, blocked: result.blocked, woken: result.woken };
}

/**
 * 生产者执行一次生产
 * @param {Object} state 当前模拟状态
 * @param {string} item 生产的物品（emoji 字符串）
 * @returns {{ state: Object, logs: Array, blocked: boolean }}
 */
function producerStep(state, item) {
  if (state.semaphores.empty.value <= 0) {
    // 缓冲区满，生产者阻塞
    var blockedLog = _makeLog('producer', '阻塞等待 empty', {
      stepCount: state.stepCount,
      blocked: true
    });
    return {
      state: Object.assign({}, state, {
        steps: state.steps.concat([blockedLog])
      }),
      logs: [blockedLog],
      blocked: true
    };
  }

  var stepCount = state.stepCount;
  var logs = [];
  var curSems = state.semaphores;

  // 1. P(empty)
  var pEmpty = _doPV(curSems, 'empty', 'P', 'producer', stepCount);
  curSems = pEmpty.semaphores;
  logs.push(pEmpty.log);

  // 2. P(mutex)
  var pMutex = _doPV(curSems, 'mutex', 'P', 'producer', stepCount);
  curSems = pMutex.semaphores;
  logs.push(pMutex.log);

  // 3. 放入缓冲区
  var newBuffer = state.buffer.slice();
  var prodIdx = state.producerIndex;
  newBuffer[prodIdx] = item;
  var newProdIdx = (prodIdx + 1) % state.bufferSize;
  var produceLog = _makeLog('producer', '生产 ' + item, {
    stepCount: stepCount,
    item: item
  });
  logs.push(produceLog);

  // 4. V(mutex)
  var vMutex = _doPV(curSems, 'mutex', 'V', 'producer', stepCount);
  curSems = vMutex.semaphores;
  logs.push(vMutex.log);

  // 5. V(full)
  var vFull = _doPV(curSems, 'full', 'V', 'producer', stepCount);
  curSems = vFull.semaphores;
  logs.push(vFull.log);

  return {
    state: {
      buffer: newBuffer,
      bufferSize: state.bufferSize,
      producerIndex: newProdIdx,
      consumerIndex: state.consumerIndex,
      semaphores: curSems,
      steps: state.steps.concat(logs),
      stepCount: stepCount + 1
    },
    logs: logs,
    blocked: false
  };
}

/**
 * 消费者执行一次消费
 * @param {Object} state 当前模拟状态
 * @returns {{ state: Object, logs: Array, blocked: boolean }}
 */
function consumerStep(state) {
  if (state.semaphores.full.value <= 0) {
    // 缓冲区空，消费者阻塞
    var blockedLog = _makeLog('consumer', '阻塞等待 full', {
      stepCount: state.stepCount,
      blocked: true
    });
    return {
      state: Object.assign({}, state, {
        steps: state.steps.concat([blockedLog])
      }),
      logs: [blockedLog],
      blocked: true
    };
  }

  var stepCount = state.stepCount;
  var logs = [];
  var curSems = state.semaphores;

  // 1. P(full)
  var pFull = _doPV(curSems, 'full', 'P', 'consumer', stepCount);
  curSems = pFull.semaphores;
  logs.push(pFull.log);

  // 2. P(mutex)
  var pMutex = _doPV(curSems, 'mutex', 'P', 'consumer', stepCount);
  curSems = pMutex.semaphores;
  logs.push(pMutex.log);

  // 3. 取出物品
  var newBuffer = state.buffer.slice();
  var consIdx = state.consumerIndex;
  var item = newBuffer[consIdx];
  newBuffer[consIdx] = null;
  var newConsIdx = (consIdx + 1) % state.bufferSize;
  var consumeLog = _makeLog('consumer', '消费 ' + (item || '?'), {
    stepCount: stepCount,
    item: item || ''
  });
  logs.push(consumeLog);

  // 4. V(mutex)
  var vMutex = _doPV(curSems, 'mutex', 'V', 'consumer', stepCount);
  curSems = vMutex.semaphores;
  logs.push(vMutex.log);

  // 5. V(empty)
  var vEmpty = _doPV(curSems, 'empty', 'V', 'consumer', stepCount);
  curSems = vEmpty.semaphores;
  logs.push(vEmpty.log);

  return {
    state: {
      buffer: newBuffer,
      bufferSize: state.bufferSize,
      producerIndex: state.producerIndex,
      consumerIndex: newConsIdx,
      semaphores: curSems,
      steps: state.steps.concat(logs),
      stepCount: stepCount + 1
    },
    logs: logs,
    blocked: false
  };
}

/**
 * 批量执行多次生产（随机物品）
 * @param {Object} state
 * @param {number} [count] 生产次数，默认 fill buffer
 * @returns {{ state: Object, logs: Array }}
 */
function addRandomItems(state, count) {
  var s = state;
  var allLogs = [];
  var total = count !== undefined ? count : state.bufferSize;
  for (var i = 0; i < total; i++) {
    if (s.semaphores.empty.value <= 0) break;
    var item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    var r = producerStep(s, item);
    s = r.state;
    allLogs.push.apply(allLogs, r.logs);
  }
  return { state: s, logs: allLogs };
}

/**
 * 重置模拟状态到初始
 * @param {Object} state
 * @returns {Object} 新的初始状态
 */
function resetSimulation(state) {
  _nextLogId = 0;
  return createSimulation(state.bufferSize);
}

module.exports = {
  createSimulation: createSimulation,
  producerStep: producerStep,
  consumerStep: consumerStep,
  addRandomItems: addRandomItems,
  resetSimulation: resetSimulation
};
