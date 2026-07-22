const { scan, cScan, look, cLook, compareAlgorithms } = require('../../utils/disk-scheduling');

const ALGO_DISPLAY = {
  scan: 'SCAN',
  cScan: 'C-SCAN',
  look: 'LOOK',
  cLook: 'C-LOOK'
};
const MAX_REQUESTS = 15;
const CYLINDER_MAX = 199;
const HEAD_COLORS = ['#cc785c', '#a0b4c8', '#8ab88a', '#d4a574'];

Page({
  data: {
    startPos: 50,
    direction: 'up',
    requestInput: '',
    selectedAlgo: 'scan',
    errorMessage: '',

    // 算法结果
    path: [],
    steps: [],
    totalSeek: 0,
    avgSeek: '0.0',
    currentStep: null,

    // 渲染数据
    headLeftPct: 0,
    requestMarkers: [],
    pathSegments: [],
    visitedLabels: [],

    // 对比
    comparison: [],

    // 控制
    playing: false,
    diskHelpItems: [
      '点击「随机生成」快速获取磁道请求序列',
      '在 4 种算法间切换，观察磁头移动路径的变化',
      '绿色点表示当前位置，蓝色线条表示磁头轨迹',
      '总寻道长度和平均寻道长度实时计算并对比',
      '启动位置（START）可手动输入修改'
    ]
  },

  _animTimer: null,

  onLoad() {
    this._seedRequests();
  },

  onUnload() {
    this._stopAnim();
  },

  _seedRequests() {
    const count = 4 + Math.floor(Math.random() * 4);
    const reqs = [];
    for (let i = 0; i < count; i++) {
      reqs.push(Math.floor(Math.random() * (CYLINDER_MAX + 1)));
    }
    this.setData({
      requestInput: reqs.join(', '),
      errorMessage: ''
    });
  },

  _parseRequests() {
    const raw = this.data.requestInput;
    const nums = raw.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (nums.length === 0) {
      this.setData({ errorMessage: '请添加柱面号' });
      return null;
    }
    if (nums.some(n => n < 0)) {
      this.setData({ errorMessage: '柱面号不能为负' });
      return null;
    }
    if (nums.some(n => n > CYLINDER_MAX)) {
      this.setData({ errorMessage: '柱面号不能超过 ' + CYLINDER_MAX });
      return null;
    }
    if (nums.length > MAX_REQUESTS) {
      this.setData({ errorMessage: '最多 ' + MAX_REQUESTS + ' 个请求' });
      return null;
    }
    return nums;
  },

  _compute(start, direction, algo) {
    const requests = this._parseRequests();
    if (!requests) return;

    let result;
    switch (algo) {
      case 'scan': result = scan(requests, start, direction); break;
      case 'cScan': result = cScan(requests, start, direction); break;
      case 'look': result = look(requests, start, direction); break;
      case 'cLook': result = cLook(requests, start, direction); break;
    }

    const steps = result.steps;
    const totalSeek = result.totalSeek;
    const avgSeek = steps.length > 0 ? (totalSeek / steps.length).toFixed(1) : '0.0';

    // Build request markers
    const uniqueReqs = [...new Set(requests)];
    const requestMarkers = uniqueReqs.map(track => ({
      track,
      leftPct: (track / CYLINDER_MAX) * 100
    }));

    // Build path segments for initial state (all at start)
    const pathSegments = [];
    let fromPos = start;
    for (let i = 0; i < steps.length; i++) {
      const seg = steps[i];
      const fromLeft = (fromPos / CYLINDER_MAX) * 100;
      const toLeft = (seg.to / CYLINDER_MAX) * 100;
      const widthPct = Math.abs(toLeft - fromLeft);
      pathSegments.push({
        fromLeft: Math.min(fromLeft, toLeft),
        widthPct,
        color: HEAD_COLORS[i % HEAD_COLORS.length],
        topOffset: 0
      });
      fromPos = seg.to;
    }

    // Visited labels (exclude start)
    const visitedLabels = result.path.slice(1).map((track, idx) => ({
      leftPct: (track / CYLINDER_MAX) * 100,
      order: idx + 1
    }));

    this.setData({
      path: result.path,
      steps,
      totalSeek,
      avgSeek,
      requestMarkers,
      pathSegments,
      visitedLabels,
      errorMessage: '',
      currentStep: null,
      headLeftPct: (start / CYLINDER_MAX) * 100,
      comparison: []
    });
  },

  _updateStepDisplay(stepIdx) {
    const { steps } = this.data;
    if (stepIdx < 0 || stepIdx >= steps.length) return;

    const step = steps[stepIdx];
    this.setData({
      currentStep: stepIdx,
      headLeftPct: (step.to / CYLINDER_MAX) * 100
    });
  },

  _runAllComparison() {
    const requests = this._parseRequests();
    if (!requests) return;

    const results = compareAlgorithms(requests, parseInt(this.data.startPos, 10) || 0,
      ['scan', 'cScan', 'look', 'cLook'], this.data.direction);
    const comparison = Object.entries(results).map(([name, r]) => ({
      name,
      displayName: ALGO_DISPLAY[name] || name,
      totalSeek: r.totalSeek
    })).sort((a, b) => a.totalSeek - b.totalSeek);

    this.setData({ comparison });
  },

  _stopAnim() {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
  },

  // ── Event Handlers ──

  onStartInput(e) {
    const val = parseInt(e.detail.value, 10);
    this.setData({ startPos: (isNaN(val) || val < 0) ? 0 : Math.min(val, CYLINDER_MAX) });
  },

  onDirectionChange(e) {
    const dir = e.currentTarget.dataset.dir;
    this.setData({ direction: dir });
  },

  onRequestInput(e) {
    this.setData({ requestInput: e.detail.value });
  },

  onRandomGenerate() {
    this._seedRequests();
  },

  onAlgoSelect(e) {
    if (this.data.playing) return;
    const algo = e.currentTarget.dataset.algo;
    this.setData({ selectedAlgo: algo });
    // Re-run with new algo if already have valid input
    this._compute(
      parseInt(this.data.startPos, 10) || 0,
      this.data.direction,
      algo
    );
  },

  onReset() {
    this._stopAnim();
    this.setData({
      path: [],
      steps: [],
      totalSeek: 0,
      avgSeek: '0.0',
      currentStep: null,
      requestMarkers: [],
      pathSegments: [],
      visitedLabels: [],
      headLeftPct: (parseInt(this.data.startPos, 10) || 0) / CYLINDER_MAX * 100,
      comparison: [],
      playing: false
    });
  },

  onTogglePlay() {
    if (this.data.playing) {
      this._stopAnim();
      this.setData({ playing: false });
      return;
    }

    // If no result yet, compute first
    if (this.data.steps.length === 0) {
      const start = parseInt(this.data.startPos, 10) || 0;
      this._compute(start, this.data.direction, this.data.selectedAlgo);
    }

    if (this.data.steps.length === 0) return;

    // If already at end, reset to beginning
    if (this.data.currentStep !== null && this.data.currentStep >= this.data.steps.length - 1) {
      this._resetAnimationState();
    }

    this.setData({ playing: true });

    const delayMs = 600;
    this._animTimer = setInterval(() => {
      let current = this.data.currentStep;
      if (current === null) {
        current = -1;
      }
      const nextIdx = current + 1;
      if (nextIdx >= this.data.steps.length) {
        this._stopAnim();
        this.setData({ playing: false });
        // Run comparison when animation completes
        this._runAllComparison();
        return;
      }
      this._updateStepDisplay(nextIdx);
    }, delayMs);
  },

  _resetAnimationState() {
    const start = parseInt(this.data.startPos, 10) || 0;
    this.setData({
      currentStep: null,
      headLeftPct: (start / CYLINDER_MAX) * 100,
      comparison: []
    });
  },

  onStepNext() {
    // If no result yet, compute first
    if (this.data.steps.length === 0) {
      const start = parseInt(this.data.startPos, 10) || 0;
      this._compute(start, this.data.direction, this.data.selectedAlgo);
    }

    if (this.data.steps.length === 0) return;

    let current = this.data.currentStep;
    if (current === null) {
      current = -1;
    }
    const nextIdx = current + 1;
    if (nextIdx >= this.data.steps.length) {
      // Run comparison when reaching end
      this._runAllComparison();
      return;
    }
    this._updateStepDisplay(nextIdx);
  }
});
