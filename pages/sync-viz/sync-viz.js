const {
  createSimulation: createSimulation,
  producerStep: producerStep,
  consumerStep: consumerStep,
  addRandomItems: addRandomItems,
  resetSimulation: resetSimulation
} = require('../../utils/producer-consumer');

const { semWait, semSignal } = require('../../utils/semaphore');

var ITEMS = ['🍎', '🍊', '🍇', '🍋', '🍉', '🍓', '🍑', '🍒'];
var SPEED_OPTIONS = [
  { label: '0.5x', delayMs: 2000 },
  { label: '1x',   delayMs: 1000 },
  { label: '2x',   delayMs: 500 }
];
var LOG_ID_OFFSET = 10000;

Page({
  data: {
    bufferSize: 6,
    producerInterval: 3,
    consumerInterval: 5,
    simulation: null,
    buffer: [],
    semaphores: { full: 0, empty: 6, mutex: 1 },
    semaphoreBars: {
      full: { value: 0, max: 6, percent: 0, color: '#81b29a' },
      empty: { value: 6, max: 6, percent: 100, color: '#8d99ae' },
      mutex: { value: 1, max: 1, percent: 100, color: '#cc785c' }
    },
    steps: [],
    waiting: { producer: false, consumer: false },
    blockedProducer: false,
    blockedConsumer: false,
    producerIndex: 0,
    consumerIndex: 0,
    running: false,
    paused: false,
    speedIndex: 1
  },

  _sim: null,
  _producerTimer: null,
  _consumerTimer: null,
  _stepCounter: 0,
  _stepActor: 'producer',
  _stepSubIdx: 0,
  _stepItem: '',
  _stepLogId: LOG_ID_OFFSET,
  _blockedProducer: false,
  _blockedConsumer: false,

  onLoad: function() {
    this._initSimulation();
  },

  onUnload: function() {
    this._stopAll();
  },

  _initSimulation: function() {
    this._sim = createSimulation(this.data.bufferSize);
    this._stepCounter = 0;
    this._stepActor = 'producer';
    this._stepSubIdx = 0;
    this._stepItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    this._stepLogId = LOG_ID_OFFSET;
    this._blockedProducer = false;
    this._blockedConsumer = false;
    this._syncState();
  },

  _syncState: function() {
    if (!this._sim) return;
    var buffer = this._sim.buffer.slice();
    var bufferSize = this._sim.bufferSize;
    var sems = this._sim.semaphores;

    var fullPercent = bufferSize > 0 ? (sems.full.value / bufferSize) * 100 : 0;
    var emptyPercent = bufferSize > 0 ? (sems.empty.value / bufferSize) * 100 : 0;
    var mutexPercent = sems.mutex.value >= 0 ? sems.mutex.value * 100 : 0;

    this.setData({
      simulation: this._sim,
      buffer: buffer,
      semaphores: {
        full: sems.full.value,
        empty: sems.empty.value,
        mutex: sems.mutex.value
      },
      semaphoreBars: {
        full: { value: sems.full.value, max: bufferSize, percent: Math.max(0, fullPercent), color: '#81b29a' },
        empty: { value: sems.empty.value, max: bufferSize, percent: Math.max(0, emptyPercent), color: '#8d99ae' },
        mutex: { value: sems.mutex.value, max: 1, percent: Math.max(0, mutexPercent), color: '#cc785c' }
      },
      steps: this._sim.steps,
      producerIndex: this._sim.producerIndex,
      consumerIndex: this._sim.consumerIndex,
      blockedProducer: this._blockedProducer,
      blockedConsumer: this._blockedConsumer,
      waiting: {
        producer: this._blockedProducer,
        consumer: this._blockedConsumer
      }
    });
  },

  onBufferSizeChange: function(e) {
    var val = Number(e.detail.value);
    if (val === this.data.bufferSize) return;
    this._stopAll();
    this.setData({ bufferSize: val });
    this._initSimulation();
  },

  onProducerIntervalChange: function(e) {
    this.setData({ producerInterval: Number(e.detail.value) });
  },

  onConsumerIntervalChange: function(e) {
    this.setData({ consumerInterval: Number(e.detail.value) });
  },

  onTogglePlay: function() {
    if (this.data.running && !this.data.paused) {
      this._pauseAll();
    } else if (this.data.running && this.data.paused) {
      this._resumeAll();
    } else {
      this._startAuto();
    }
  },

  onStep: function() {
    this._stopAll();
    if (this._stepCounter > 50) {
      this._initSimulation();
    }
    if (this._stepLogId < this._sim.steps.length + LOG_ID_OFFSET) {
      this._stepLogId = this._sim.steps.length + LOG_ID_OFFSET;
    }
    this._doOneStep();
    this.setData({
      running: false,
      paused: false
    });
  },

  onReset: function() {
    this._stopAll();
    this._initSimulation();
    this._stepCounter = 0;
    this.setData({
      running: false,
      paused: false
    });
  },

  onSpeedChange: function(e) {
    this.setData({ speedIndex: Number(e.currentTarget.dataset.index) });
    if (this.data.running && !this.data.paused) {
      this._stopTimers();
      this._startTimers();
    }
  },

  /**
   * 执行一步原子 P/V 操作（步进模式）
   *
   * 每个生产者/消费者周期分为 5 个子步骤：
   *   生产者: 0=P(empty) 1=P(mutex) 2=produce 3=V(mutex) 4=V(full)
   *   消费者: 0=P(full)  1=P(mutex) 2=consume 3=V(mutex) 4=V(empty)
   *
   * 若 P 操作阻塞，立即切换 actor；5 步完成后自然切换。
   */
  _doOneStep: function() {
    if (!this._sim) return;

    var isProducer = this._stepActor === 'producer';
    var sub = this._stepSubIdx;
    var sim = this._sim;
    var newSim = null;
    var blocked = false;

    if (isProducer) {
      if (sub === 0) {
        // P(empty)
        var pEmpty = semWait(sim.semaphores.empty, 'producer');
        newSim = Object.assign({}, sim, {
          semaphores: Object.assign({}, sim.semaphores, { empty: pEmpty.semaphore }),
          steps: sim.steps.concat([this._makeLog('producer', 'P(empty)', sim.stepCount, 'empty', sim.semaphores.empty.value, pEmpty.semaphore.value, pEmpty.blocked, false)]),
          stepCount: sim.stepCount + 1
        });
        blocked = pEmpty.blocked;
        if (blocked) this._blockedProducer = true;
      } else if (sub === 1) {
        // P(mutex)
        var pMutex = semWait(sim.semaphores.mutex, 'producer');
        newSim = Object.assign({}, sim, {
          semaphores: Object.assign({}, sim.semaphores, { mutex: pMutex.semaphore }),
          steps: sim.steps.concat([this._makeLog('producer', 'P(mutex)', sim.stepCount, 'mutex', sim.semaphores.mutex.value, pMutex.semaphore.value, false, false)]),
          stepCount: sim.stepCount + 1
        });
      } else if (sub === 2) {
        // Produce item
        var newBuffer = sim.buffer.slice();
        newBuffer[sim.producerIndex] = this._stepItem;
        var newProdIdx = (sim.producerIndex + 1) % sim.bufferSize;
        newSim = Object.assign({}, sim, {
          buffer: newBuffer,
          producerIndex: newProdIdx,
          steps: sim.steps.concat([this._makeLog('producer', '生产 ' + this._stepItem, sim.stepCount, null, null, null, false, false)]),
          stepCount: sim.stepCount + 1
        });
      } else if (sub === 3) {
        // V(mutex)
        var vMutex = semSignal(sim.semaphores.mutex);
        var wokenProducer = vMutex.woken === 'producer' || vMutex.woken === 'consumer';
        newSim = Object.assign({}, sim, {
          semaphores: Object.assign({}, sim.semaphores, { mutex: vMutex.semaphore }),
          steps: sim.steps.concat([this._makeLog('producer', 'V(mutex)', sim.stepCount, 'mutex', sim.semaphores.mutex.value, vMutex.semaphore.value, false, vMutex.woken !== null)]),
          stepCount: sim.stepCount + 1
        });
        if (vMutex.woken === 'consumer') this._blockedConsumer = false;
        if (vMutex.woken === 'producer') this._blockedProducer = false;
      } else if (sub === 4) {
        // V(full) — cycle complete
        var vFull = semSignal(sim.semaphores.full);
        newSim = Object.assign({}, sim, {
          semaphores: Object.assign({}, sim.semaphores, { full: vFull.semaphore }),
          steps: sim.steps.concat([this._makeLog('producer', 'V(full)', sim.stepCount, 'full', sim.semaphores.full.value, vFull.semaphore.value, false, vFull.woken !== null)]),
          stepCount: sim.stepCount + 1
        });
        if (vFull.woken === 'consumer') this._blockedConsumer = false;
        if (vFull.woken === 'producer') this._blockedProducer = false;
      }
    } else {
      // Consumer steps
      if (sub === 0) {
        // P(full)
        var pFull = semWait(sim.semaphores.full, 'consumer');
        newSim = Object.assign({}, sim, {
          semaphores: Object.assign({}, sim.semaphores, { full: pFull.semaphore }),
          steps: sim.steps.concat([this._makeLog('consumer', 'P(full)', sim.stepCount, 'full', sim.semaphores.full.value, pFull.semaphore.value, pFull.blocked, false)]),
          stepCount: sim.stepCount + 1
        });
        blocked = pFull.blocked;
        if (blocked) this._blockedConsumer = true;
      } else if (sub === 1) {
        // P(mutex)
        var pMutexC = semWait(sim.semaphores.mutex, 'consumer');
        newSim = Object.assign({}, sim, {
          semaphores: Object.assign({}, sim.semaphores, { mutex: pMutexC.semaphore }),
          steps: sim.steps.concat([this._makeLog('consumer', 'P(mutex)', sim.stepCount, 'mutex', sim.semaphores.mutex.value, pMutexC.semaphore.value, false, false)]),
          stepCount: sim.stepCount + 1
        });
      } else if (sub === 2) {
        // Consume item
        var newBufferC = sim.buffer.slice();
        var item = newBufferC[sim.consumerIndex] || '';
        newBufferC[sim.consumerIndex] = null;
        var newConsIdx = (sim.consumerIndex + 1) % sim.bufferSize;
        newSim = Object.assign({}, sim, {
          buffer: newBufferC,
          consumerIndex: newConsIdx,
          steps: sim.steps.concat([this._makeLog('consumer', '消费 ' + (item || '?'), sim.stepCount, null, null, null, false, false)]),
          stepCount: sim.stepCount + 1
        });
      } else if (sub === 3) {
        // V(mutex)
        var vMutexC = semSignal(sim.semaphores.mutex);
        newSim = Object.assign({}, sim, {
          semaphores: Object.assign({}, sim.semaphores, { mutex: vMutexC.semaphore }),
          steps: sim.steps.concat([this._makeLog('consumer', 'V(mutex)', sim.stepCount, 'mutex', sim.semaphores.mutex.value, vMutexC.semaphore.value, false, vMutexC.woken !== null)]),
          stepCount: sim.stepCount + 1
        });
        if (vMutexC.woken === 'producer') this._blockedProducer = false;
        if (vMutexC.woken === 'consumer') this._blockedConsumer = false;
      } else if (sub === 4) {
        // V(empty) — cycle complete
        var vEmpty = semSignal(sim.semaphores.empty);
        newSim = Object.assign({}, sim, {
          semaphores: Object.assign({}, sim.semaphores, { empty: vEmpty.semaphore }),
          steps: sim.steps.concat([this._makeLog('consumer', 'V(empty)', sim.stepCount, 'empty', sim.semaphores.empty.value, vEmpty.semaphore.value, false, vEmpty.woken !== null)]),
          stepCount: sim.stepCount + 1
        });
        if (vEmpty.woken === 'producer') this._blockedProducer = false;
        if (vEmpty.woken === 'consumer') this._blockedConsumer = false;
      }
    }

    if (!newSim) return;
    this._sim = newSim;

    // Advance sub-step
    this._stepSubIdx++;
    var cycleDone = sub >= 4;
    if (cycleDone || blocked) {
      this._stepSubIdx = 0;
      this._stepActor = isProducer ? 'consumer' : 'producer';
      if (this._stepActor === 'producer') {
        this._stepItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      }
    }
    this._stepCounter++;
    this._syncState();
  },

  /**
   * 在页面层生成日志条目（ID 从 LOG_ID_OFFSET 开始，避免与模块层日志 ID 冲突）
   */
  _makeLog: function(actor, action, timestamp, semName, semBefore, semAfter, blocked, woken) {
    var log = {
      id: this._stepLogId++,
      timestamp: timestamp,
      actor: actor,
      action: action,
      blocked: blocked || false,
      woken: woken || false
    };
    if (semName !== null && semName !== undefined) {
      log.semaphoreName = semName;
      log.semaphoreBefore = semBefore;
      log.semaphoreAfter = semAfter;
    }
    return log;
  },

  _startAuto: function() {
    if (this._stepCounter > 50) {
      this._initSimulation();
    }
    this.setData({ running: true, paused: false });
    this._startTimers();
  },

  _startTimers: function() {
    var speedIdx = this.data.speedIndex;
    var producerDelay = this.data.producerInterval * SPEED_OPTIONS[speedIdx].delayMs / 1000;
    var consumerDelay = this.data.consumerInterval * SPEED_OPTIONS[speedIdx].delayMs / 1000;

    this._producerTimer = setInterval(() => {
      if (!this._sim) return;
      var item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      var result = producerStep(this._sim, item);
      if (result.blocked) {
        this._blockedProducer = true;
      } else {
        this._sim = result.state;
        this._stepCounter++;
        this._blockedProducer = false;
      }
      this._syncState();
      if (this._stepCounter > 100) {
        this._stopAll();
      }
    }, producerDelay);

    this._consumerTimer = setInterval(() => {
      if (!this._sim) return;
      var result = consumerStep(this._sim);
      if (result.blocked) {
        this._blockedConsumer = true;
      } else {
        this._sim = result.state;
        this._stepCounter++;
        this._blockedConsumer = false;
      }
      this._syncState();
    }, consumerDelay);
  },

  _pauseAll: function() {
    this._stopTimers();
    this.setData({ paused: true });
  },

  _resumeAll: function() {
    this.setData({ paused: false });
    this._startTimers();
  },

  _stopTimers: function() {
    if (this._producerTimer) {
      clearInterval(this._producerTimer);
      this._producerTimer = null;
    }
    if (this._consumerTimer) {
      clearInterval(this._consumerTimer);
      this._consumerTimer = null;
    }
  },

  _stopAll: function() {
    this._stopTimers();
    this.setData({ running: false, paused: false });
  }
});
