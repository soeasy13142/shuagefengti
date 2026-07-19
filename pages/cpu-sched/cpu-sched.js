const { fcfs, sjf, rr, mfq } = require('../../utils/scheduling');
const { calculate } = require('../../utils/scheduling-metrics');
const { validateProcess, randomProcesses, pidColor, MAX_PROCESSES } = require('../../utils/process');

const ALGORITHMS = ['FCFS', 'SJF', 'RR', 'MFQ'];
const SPEED_OPTIONS = [
  { label: '0.5x', delayMs: 800 },
  { label: '1x',   delayMs: 400 },
  { label: '2x',   delayMs: 200 }
];
const GANTT_PX_PER_UNIT = 28;

Page({
  data: {
    algorithm: 'FCFS',
    quantum: 2,
    processes: [],
    errorMessage: '',
    gantt: [],
    ganttRows: [],
    ticks: [],
    metrics: {},
    fcfsComparison: {},
    playing: false,
    speedIndex: 1,
    maxProcesses: MAX_PROCESSES,
    simTime: 0
  },

  _animTimer: null,

  onLoad() {
    this._seedProcesses();
  },

  onUnload() {
    this._stopAnim();
  },

  _seedProcesses() {
    const ps = randomProcesses(3);
    this.setData({ processes: ps.map(p => ({ ...p, invalid: false })) });
  },

  onAddProcess() {
    const ps = this.data.processes.slice();
    if (ps.length >= MAX_PROCESSES) {
      this.setData({ errorMessage: '进程数已达上限 ' + MAX_PROCESSES });
      return;
    }
    const nextPid = 'P' + (ps.length + 1);
    ps.push({ pid: nextPid, arrival: 0, burst: 1, invalid: false });
    this.setData({ processes: ps, errorMessage: '' });
  },

  onDeleteProcess(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const ps = this.data.processes.slice();
    ps.splice(idx, 1);
    this.setData({ processes: ps });
  },

  onRandomGenerate() {
    const n = Math.max(3, Math.min(MAX_PROCESSES, 5));
    const ps = randomProcesses(n);
    this.setData({ processes: ps.map(p => ({ ...p, invalid: false })), errorMessage: '' });
  },

  onProcessInput(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const ps = this.data.processes.slice();
    const updated = Object.assign({}, ps[idx]);
    if (field === 'pid') {
      updated.pid = value;
    } else {
      updated[field] = Number(value);
    }
    const otherPs = ps.filter((_, i) => i !== idx);
    const v = validateProcess(updated, otherPs);
    updated.invalid = !v.valid;
    ps[idx] = updated;
    this.setData({ processes: ps, errorMessage: v.valid ? '' : v.errors[0] });
  },

  onAlgorithmChange(e) {
    const algo = e.currentTarget.dataset.algo;
    if (algo === this.data.algorithm) return;
    this._stopAnim();
    this.setData({
      algorithm: algo,
      gantt: [],
      ganttRows: [],
      ticks: [],
      metrics: {},
      fcfsComparison: {},
      simTime: 0
    });
  },

  onQuantumChange(e) {
    this.setData({ quantum: Number(e.detail.value) });
  },

  onSpeedChange(e) {
    this.setData({ speedIndex: Number(e.currentTarget.dataset.index) });
  },

  onTogglePlay() {
    if (this.data.playing) {
      this._stopAnim();
    } else {
      this._startAnim();
    }
  },

  onStepNext() {
    if (!this.data.gantt.length) return;
    this._stopAnim();
    const maxT = this._maxEnd(this.data.gantt);
    const nextT = Math.min(maxT, this.data.simTime + 1);
    this.setData({ simTime: nextT });
    this._renderGanttUpTo(nextT);
  },

  onReset() {
    this._stopAnim();
    this.setData({
      gantt: [],
      ganttRows: [],
      ticks: [],
      metrics: {},
      fcfsComparison: {},
      simTime: 0,
      errorMessage: ''
    });
  },

  _startAnim() {
    if (this._animTimer) return;
    const validPs = this.data.processes.filter(p => !p.invalid);
    if (validPs.length === 0) {
      this.setData({ errorMessage: '请添加有效进程' });
      return;
    }
    let gantt = [];
    try {
      gantt = this._runAlgorithm(validPs);
    } catch (err) {
      this.setData({ errorMessage: '算法运行失败：' + (err && err.message ? err.message : String(err)) });
      return;
    }
    if (!gantt.length) return;

    const metrics = calculate(gantt, validPs);
    const fcfsGantt = fcfs(validPs);
    const fcfsMetrics = calculate(fcfsGantt, validPs);
    const fcfsComparison = this._compareWithFcfs(metrics, fcfsMetrics);

    this.setData({
      gantt,
      metrics,
      fcfsComparison,
      simTime: 0,
      playing: true
    });

    this._renderGanttUpTo(0);
    this._tickAnim();
  },

  _tickAnim() {
    if (!this.data.playing) return;
    const delay = SPEED_OPTIONS[this.data.speedIndex].delayMs;
    this._animTimer = setTimeout(() => {
      const maxT = this._maxEnd(this.data.gantt);
      const nextT = this.data.simTime + 1;
      if (nextT > maxT) {
        this._stopAnim();
        return;
      }
      this.setData({ simTime: nextT });
      this._renderGanttUpTo(nextT);
      this._tickAnim();
    }, delay);
  },

  _stopAnim() {
    if (this._animTimer) {
      clearTimeout(this._animTimer);
      this._animTimer = null;
    }
    if (this.data.playing) this.setData({ playing: false });
  },

  _runAlgorithm(processes) {
    switch (this.data.algorithm) {
      case 'FCFS': return fcfs(processes);
      case 'SJF':  return sjf(processes);
      case 'RR':   return rr(processes, this.data.quantum);
      case 'MFQ':  return mfq(processes);
      default:     return fcfs(processes);
    }
  },

  _maxEnd(gantt) {
    let m = 0;
    for (const s of gantt) if (s.end > m) m = s.end;
    return m;
  },

  _renderGanttUpTo(upToTime) {
    const { gantt, processes } = this.data;
    if (!gantt.length) return;
    const pidSet = new Set(processes.filter(p => !p.invalid).map(p => p.pid));
    const ganttRows = [];
    for (const pid of pidSet) {
      const segments = [];
      for (const step of gantt) {
        if (step.pid !== pid) continue;
        const segEnd = Math.min(step.end, upToTime);
        if (segEnd <= step.start) continue;
        segments.push({
          start: step.start,
          end: step.end,
          visibleEnd: segEnd,
          leftPx: step.start * GANTT_PX_PER_UNIT,
          widthPx: (step.end - step.start) * GANTT_PX_PER_UNIT
        });
      }
      ganttRows.push({
        pid,
        color: pidColor(pid),
        segments
      });
    }

    const maxT = this._maxEnd(gantt);
    const ticks = [];
    for (let t = 0; t <= maxT; t++) {
      ticks.push({ t, leftPx: t * GANTT_PX_PER_UNIT });
    }

    this.setData({ ganttRows, ticks });
  },

  _compareWithFcfs(metrics, fcfsMetrics) {
    const arrow = (delta, eps) => {
      if (Math.abs(delta) < eps) return '↑';
      return delta > 0 ? '↑' : '↓';
    };
    const color = (a, b, lowerBetter) => {
      if (Math.abs(a - b) < 1e-6) return '#f59e0b';
      const better = lowerBetter ? a < b : a > b;
      return better ? '#34d399' : '#c0392b';
    };

    const tatDelta = metrics.avgTAT - fcfsMetrics.avgTAT;
    const wtDelta  = metrics.avgWT  - fcfsMetrics.avgWT;
    const utilDelta = metrics.cpuUtil - fcfsMetrics.cpuUtil;
    const tpDelta  = metrics.throughput - fcfsMetrics.throughput;

    return {
      tatArrow:  arrow(tatDelta, 1e-6) + '',
      tatText:   (tatDelta > 0 ? '+' : '') + tatDelta.toFixed(2),
      wtArrow:   arrow(wtDelta, 1e-6) + '',
      wtText:    (wtDelta > 0 ? '+' : '') + wtDelta.toFixed(2),
      utilArrow: arrow(utilDelta, 1e-6) + '',
      utilText:  (utilDelta > 0 ? '+' : '') + (utilDelta * 100).toFixed(1) + '%',
      tpArrow:   arrow(tpDelta, 1e-6) + '',
      tpText:    (tpDelta > 0 ? '+' : '') + tpDelta.toFixed(3)
    };
  }
});
