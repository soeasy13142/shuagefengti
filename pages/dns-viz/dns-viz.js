const { resolveSteps, validateDomain } = require('../../utils/dns-resolver');
const { LRUCache, DEFAULT_TTL } = require('../../utils/dns-cache');
const { DNS_AUTHORITATIVE_SERVERS } = require('../../utils/dns-data');

const SCENARIOS = ['首次查询', '再次查询命中缓存', 'CNAME 链'];

Page({
  data: {
    domain: 'example.com',
    scenarios: SCENARIOS,
    scenarioIndex: 0,
    steps: [],
    currentStep: 0,
    isPlaying: false,
    currentStepObj: null,
    payloadText: '',
    progressPercent: 0,
    authServerText: '',
    errorMessage: ''
  },

  _cache: null,
  _playTimer: null,

  onLoad() {
    this._cache = new LRUCache(50);
    this._refreshAuthServer();
  },

  onUnload() {
    this._stopPlay();
  },

  onDomainInput(e) {
    this.setData({ domain: e.detail.value });
  },

  onScenarioChange(e) {
    this.setData({ scenarioIndex: Number(e.detail.value) });
  },

  onStartTap() {
    const { domain, scenarioIndex } = this.data;
    if (!validateDomain(domain)) {
      this.setData({
        errorMessage: `域名格式非法：${domain}`,
        steps: [],
        currentStep: 0,
        currentStepObj: null,
        payloadText: '',
        progressPercent: 0
      });
      return;
    }
    this.setData({ errorMessage: '' });

    const scenario = ['first', 'cached', 'cname'][scenarioIndex];
    const steps = resolveSteps({
      domain,
      scenario,
      cache: this._cache,
      now: Math.floor(Date.now() / 1000)
    });

    if (steps.length === 1 && steps[0].type === 'error') {
      this.setData({
        errorMessage: steps[0].payload.error,
        steps: [],
        currentStep: 0,
        currentStepObj: null,
        payloadText: '',
        progressPercent: 0
      });
      return;
    }

    this.setData({ steps, currentStep: 0, isPlaying: false });
    this._renderStep(0);
    this._startPlay();
  },

  onResetTap() {
    this._stopPlay();
    this._cache.clear();
    this.setData({
      steps: [],
      currentStep: 0,
      currentStepObj: null,
      payloadText: '',
      progressPercent: 0,
      errorMessage: ''
    });
    this._refreshAuthServer();
  },

  onPrevStep() {
    const { currentStep, steps } = this.data;
    if (currentStep > 0) {
      this._renderStep(currentStep - 1);
    }
  },

  onNextStep() {
    const { currentStep, steps } = this.data;
    if (currentStep < steps.length - 1) {
      this._renderStep(currentStep + 1);
    } else {
      this._stopPlay();
    }
  },

  onTogglePlay() {
    if (this.data.isPlaying) {
      this._stopPlay();
    } else {
      this._startPlay();
    }
  },

  _refreshAuthServer() {
    const domain = this.data.domain;
    const auth = DNS_AUTHORITATIVE_SERVERS[domain] || DNS_AUTHORITATIVE_SERVERS['example.com'];
    this.setData({
      authServerText: `${auth.name} · ${auth.ipv4}`
    });
  },

  _renderStep(idx) {
    const step = this.data.steps[idx];
    if (!step) return;
    const payloadText = this._formatPayload(step);
    const progressPercent = Math.round(((idx + 1) / this.data.steps.length) * 100);
    this.setData({
      currentStep: idx,
      currentStepObj: step,
      payloadText,
      progressPercent
    });
  },

  _formatPayload(step) {
    if (!step.payload) return '';
    const lines = [];
    if (step.payload.header) {
      const h = step.payload.header;
      lines.push(`Header: ID=${h.id} RD=${h.rd} RAC=${h.rac} QD=${h.qdcount} AN=${h.ancount}`);
    }
    if (step.payload.question) {
      const q = step.payload.question;
      lines.push(`Question: ${q.qname} ${q.qtype} ${q.qclass}`);
    }
    if (step.payload.answer) {
      const a = step.payload.answer;
      lines.push(`Answer: ${a.name} ${a.type} ${a.class} TTL=${a.ttl} RDATA=${a.rdata}`);
    }
    if (step.payload.error) {
      lines.push(`Error: ${step.payload.error}`);
    }
    return lines.join('\n');
  },

  _startPlay() {
    if (this._playTimer) return;
    this.setData({ isPlaying: true });
    this._playTimer = setInterval(() => {
      const { currentStep, steps } = this.data;
      if (currentStep >= steps.length - 1) {
        this._stopPlay();
        return;
      }
      this._renderStep(currentStep + 1);
    }, 800);
  },

  _stopPlay() {
    if (this._playTimer) {
      clearInterval(this._playTimer);
      this._playTimer = null;
    }
    this.setData({ isPlaying: false });
  }
});
