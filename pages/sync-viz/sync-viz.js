const {
  createSimulation: createSimulation,
  producerStep: producerStep,
  consumerStep: consumerStep,
  addRandomItems: addRandomItems,
  resetSimulation: resetSimulation
} = require('../../utils/producer-consumer');

var ITEMS = ['🍎', '🍊', '🍇', '🍋', '🍉', '🍓', '🍑', '🍒'];
var SPEED_OPTIONS = [
  { label: '0.5x', delayMs: 2000 },
  { label: '1x',   delayMs: 1000 },
  { label: '2x',   delayMs: 500 }
];

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
    producerIndex: 0,
    consumerIndex: 0,
    running: false,
    paused: false,
    speedIndex: 1
  },

  _sim: null,
  _timer: null,
  _producerTimer: null,
  _consumerTimer: null,
  _stepCounter: 0,

  onLoad: function() {
    this._initSimulation();
  },

  onUnload: function() {
    this._stopAll();
  },

  _initSimulation: function() {
    this._sim = createSimulation(this.data.bufferSize);
    this._stepCounter = 0;
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
      waiting: {
        producer: this._sim.semaphores.empty.value <= 0,
        consumer: this._sim.semaphores.full.value <= 0
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
      // pause
      this._pauseAll();
    } else if (this.data.running && this.data.paused) {
      // resume
      this._resumeAll();
    } else {
      // start
      this._startAuto();
    }
  },

  onStep: function() {
    this._stopAll();
    // reset if simulation has run past limit
    if (this._stepCounter > 50) {
      this._initSimulation();
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
    // if running, restart with new speed
    if (this.data.running && !this.data.paused) {
      this._stopTimers();
      this._startTimers();
    }
  },

  _doOneStep: function() {
    if (!this._sim) return;
    // alternate: producer then consumer
    var isProducer = this._stepCounter % 2 === 0;
    var result;
    if (isProducer) {
      var item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      result = producerStep(this._sim, item);
    } else {
      result = consumerStep(this._sim);
    }
    if (!result.blocked) {
      this._sim = result.state;
    }
    this._stepCounter++;
    this._syncState();
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

    var self = this;

    this._producerTimer = setInterval(function() {
      if (!self._sim) return;
      var item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      var result = producerStep(self._sim, item);
      if (!result.blocked) {
        self._sim = result.state;
        self._stepCounter++;
      }
      self._syncState();
      if (self._stepCounter > 100) {
        self._stopAll();
      }
    }, producerDelay);

    this._consumerTimer = setInterval(function() {
      if (!self._sim) return;
      var result = consumerStep(self._sim);
      if (!result.blocked) {
        self._sim = result.state;
        self._stepCounter++;
      }
      self._syncState();
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
