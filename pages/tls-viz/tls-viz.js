const { generateSteps } = require('../../utils/tls-handshake');
const { SCENARIOS } = require('../../utils/tls-data');

const PLAY_INTERVAL_MS = 1200;

Page({
  data: {
    // 配置
    scenarioIndex: 0,
    scenarioNames: SCENARIOS.map(function(s) { return s.name; }),
    scenarioDescription: SCENARIOS[0].description,
    errorMessage: '',

    // 动画状态
    steps: [],
    currentStep: null,
    currentStepObj: null,
    isPlaying: false,
    isComplete: false,
    activeMessage: null,

    // 进度
    progressPercent: 0
  },

  _playTimer: null,

  onLoad() {
    // 初始化时不做任何事，等待用户操作
  },

  onUnload() {
    this._stopPlay();
  },

  // ── 场景切换 ──

  onScenarioChange(e) {
    if (this.data.isPlaying) {
      this.setData({ errorMessage: '正在播放，请先重置' });
      return;
    }
    const idx = Number(e.detail.value);
    const scenario = SCENARIOS[idx];
    // 重置所有状态
    this._stopPlay();
    this.setData({
      scenarioIndex: idx,
      scenarioDescription: scenario.description,
      steps: [],
      currentStep: null,
      currentStepObj: null,
      activeMessage: null,
      progressPercent: 0,
      isComplete: false,
      errorMessage: ''
    });
  },

  // ── 播放控制 ──

  onTogglePlay() {
    if (this.data.isPlaying) {
      this._stopPlay();
      return;
    }

    // 如果已完成，重置后再播放
    if (this.data.isComplete) {
      this.setData({ isComplete: false, currentStep: null, currentStepObj: null, activeMessage: null, progressPercent: 0 });
    }

    // 如果还没有步骤数据，先生成
    if (this.data.steps.length === 0) {
      this._loadScenario();
    }

    if (this.data.steps.length === 0) return;

    this.setData({ isPlaying: true });
    this._playTimer = setInterval(() => {
      this._advanceStep();
    }, PLAY_INTERVAL_MS);
  },

  onStepPrev() {
    if (this.data.isPlaying) return;
    const { currentStep } = this.data;
    if (currentStep === null || currentStep <= 0) return;
    this._renderStep(currentStep - 1);
  },

  onStepNext() {
    if (this.data.isPlaying) return;
    if (this.data.isComplete) {
      this.setData({ isComplete: false, currentStep: null, currentStepObj: null, activeMessage: null, progressPercent: 0 });
    }
    if (this.data.steps.length === 0) {
      this._loadScenario();
    }
    if (this.data.steps.length === 0) return;
    this._advanceStep();
  },

  onReset() {
    this._stopPlay();
    this.setData({
      steps: [],
      currentStep: null,
      currentStepObj: null,
      activeMessage: null,
      progressPercent: 0,
      isPlaying: false,
      isComplete: false,
      errorMessage: ''
    });
  },

  // ── 内部方法 ──

  _loadScenario() {
    const scenario = SCENARIOS[this.data.scenarioIndex];
    if (!scenario) {
      this.setData({ errorMessage: '场景未找到' });
      return;
    }
    const steps = generateSteps(scenario.id);
    if (!steps || steps.length === 0) {
      this.setData({ errorMessage: '步骤生成失败' });
      return;
    }
    this.setData({
      steps,
      errorMessage: '',
      currentStep: null,
      currentStepObj: null,
      progressPercent: 0,
      activeMessage: null,
      isComplete: false
    });
  },

  _advanceStep() {
    const { steps, currentStep } = this.data;
    let next = currentStep === null ? 0 : currentStep + 1;

    if (next >= steps.length) {
      this._stopPlay();
      this.setData({
        isComplete: true,
        activeMessage: null,
        progressPercent: 100
      });
      return;
    }

    this._renderStep(next);
  },

  _renderStep(idx) {
    const { steps } = this.data;
    if (idx < 0 || idx >= steps.length) return;

    const step = steps[idx];
    const progressPercent = Math.round(((idx + 1) / steps.length) * 100);

    // 构建动画消息
    let activeMessage = null;
    if (step.from !== '-' && step.to !== '-') {
      activeMessage = {
        label: step.payload.label,
        direction: step.from === 'client' ? 'client-to-server' : 'server-to-client',
        type: step.type
      };
    }

    // 预处理 certChain：WXML 不支持 .repeat() 等方法调用，需提前算好缩进字符串
    let currentStepObj = step;
    if (step.payload && step.payload.extra && step.payload.extra.certChain) {
      currentStepObj = {
        ...step,
        payload: {
          ...step.payload,
          extra: {
            ...step.payload.extra,
            certChain: step.payload.extra.certChain.map(function(subject, i) {
              return { subject: subject, indentStr: '  '.repeat(i) };
            })
          }
        }
      };
    }

    this.setData({
      currentStep: idx,
      currentStepObj,
      activeMessage,
      progressPercent
    });
  },

  _stopPlay() {
    if (this._playTimer) {
      clearInterval(this._playTimer);
      this._playTimer = null;
    }
    this.setData({ isPlaying: false });
  }
});
