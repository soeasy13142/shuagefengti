const { getScenarioById } = require('../../utils/nat-data');
const { snat, dnat } = require('../../utils/nat-engine');

Page({
  data: {
    // 场景
    scenarios: [],
    selectedScenario: 'single-host',
    publicIp: '',

    // 步骤
    steps: [],
    currentStep: 0,
    isPlaying: false,
    currentStepObj: null,
    currentPacket: null,
    translatedPacket: null,
    currentZone: '',
    currentDirection: '',

    // 映射表
    mappingTable: [],
    activeMappingCount: 0,

    // 主机状态
    lanHosts: [],
    wanHosts: [],

    // 端口映射
    staticMapping: null,

    // 控制
    errorMessage: '',
    showSummary: false,
    totalTranslations: 0
  },

  _playTimer: null,
  _mappingTable: [],
  _translationCount: 0,

  onLoad() {
    // 加载场景列表
    const allScenarios = [
      getScenarioById('single-host'),
      getScenarioById('multi-host'),
      getScenarioById('port-forward')
    ];
    this.setData({
      scenarios: allScenarios,
      selectedScenario: 'single-host',
      publicIp: allScenarios[0].publicIp,
      staticMapping: allScenarios[0].staticMapping || null
    });
    this._initHosts('single-host');
  },

  onUnload() {
    this._stopPlay();
  },

  _initHosts(scenarioId) {
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return;

    // 从 step 中收集所有不同的内网和外网 IP
    const lanIps = [];
    const wanIps = [];
    scenario.steps.forEach(function(s) {
      const p = s.packet;
      if (s.zone === 'lan' || (s.zone === 'router' && p.direction === 'inbound' && p.dstIp.startsWith('192.168.'))) {
        if (!lanIps.find(function(h) { return h.ip === p.dstIp; })) {
          if (p.dstIp.startsWith('192.168.')) {
            lanIps.push({ ip: p.dstIp, port: p.dstPort, active: false });
          }
        }
      }
      if (s.zone === 'wan' || (s.zone === 'router' && p.direction === 'outbound' && !p.dstIp.startsWith('192.168.'))) {
        if (!wanIps.find(function(h) { return h.ip === p.dstIp; })) {
          if (!p.dstIp.startsWith('192.168.') && p.dstIp !== scenario.publicIp) {
            wanIps.push({ ip: p.dstIp, port: p.dstPort, active: false });
          }
        }
      }
      // Also collect srcIp hosts
      if (!lanIps.find(function(h) { return h.ip === p.srcIp; }) && p.srcIp.startsWith('192.168.')) {
        lanIps.push({ ip: p.srcIp, port: p.srcPort, active: false });
      }
      if (!wanIps.find(function(h) { return h.ip === p.srcIp; }) && !p.srcIp.startsWith('192.168.') && p.srcIp !== scenario.publicIp) {
        wanIps.push({ ip: p.srcIp, port: p.srcPort, active: false });
      }
    });

    this.setData({
      lanHosts: lanIps,
      wanHosts: wanIps,
      publicIp: scenario.publicIp,
      staticMapping: scenario.staticMapping || null
    });
  },

  onScenarioSelect(e) {
    if (this.data.isPlaying) return;
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedScenario: id,
      steps: [],
      currentStep: 0,
      currentStepObj: null,
      currentPacket: null,
      translatedPacket: null,
      currentZone: '',
      currentDirection: '',
      mappingTable: [],
      errorMessage: '',
      showSummary: false,
      totalTranslations: 0,
      activeMappingCount: 0
    });
    this._mappingTable = [];
    this._translationCount = 0;
    this._initHosts(id);
  },

  onStartTap() {
    const scenario = getScenarioById(this.data.selectedScenario);
    if (!scenario) {
      this.setData({ errorMessage: '场景数据加载失败' });
      return;
    }

    this._mappingTable = [];
    this._translationCount = 0;

    this.setData({
      steps: scenario.steps,
      currentStep: 0,
      errorMessage: '',
      showSummary: false,
      totalTranslations: 0,
      activeMappingCount: 0,
      mappingTable: []
    });

    this._renderStep(0);
    this._startPlay();
  },

  onResetTap() {
    this._stopPlay();
    this._mappingTable = [];
    this._translationCount = 0;
    this.setData({
      steps: [],
      currentStep: 0,
      currentStepObj: null,
      currentPacket: null,
      translatedPacket: null,
      currentZone: '',
      currentDirection: '',
      mappingTable: [],
      errorMessage: '',
      showSummary: false,
      totalTranslations: 0,
      activeMappingCount: 0
    });
    // Reset host active states
    const lanHosts = this.data.lanHosts.map(function(h) { return { ip: h.ip, port: h.port, active: false }; });
    const wanHosts = this.data.wanHosts.map(function(h) { return { ip: h.ip, port: h.port, active: false }; });
    this.setData({ lanHosts, wanHosts });
  },

  onNextStep() {
    const { currentStep, steps } = this.data;
    if (steps.length === 0) return;
    if (currentStep < steps.length - 1) {
      this._renderStep(currentStep + 1);
    } else {
      this._stopPlay();
      this._showSummary();
    }
  },

  onTogglePlay() {
    if (this.data.isPlaying) {
      this._stopPlay();
    } else {
      this._startPlay();
    }
  },

  _renderStep(idx) {
    const step = this.data.steps[idx];
    if (!step) return;

    // 处理映射表更新
    const tableUpdate = step.tableUpdate;
    if (tableUpdate && tableUpdate.action === 'add' && tableUpdate.entry) {
      this._mappingTable.push({
        internalIp: tableUpdate.entry.internalIp,
        internalPort: tableUpdate.entry.internalPort,
        externalPort: tableUpdate.entry.externalPort,
        remoteHost: tableUpdate.entry.remoteHost,
        protocol: tableUpdate.entry.protocol,
        timeout: tableUpdate.entry.timeout,
        state: tableUpdate.entry.state
      });
      this._translationCount++;
    } else if (tableUpdate && tableUpdate.action === 'remove') {
      this._mappingTable = this._mappingTable.filter(function(e) {
        return e.externalPort !== (tableUpdate.entry ? tableUpdate.entry.externalPort : -1);
      });
    }

    // 构建报文显示
    const packet = step.packet;
    const translated = step.translated || null;

    // 更新活跃主机
    const newLanHosts = this.data.lanHosts.map(function(h) {
      return { ip: h.ip, port: h.port, active: h.ip === packet.dstIp || h.ip === packet.srcIp };
    });
    const newWanHosts = this.data.wanHosts.map(function(h) {
      return { ip: h.ip, port: h.port, active: h.ip === packet.dstIp || h.ip === packet.srcIp };
    });

    this.setData({
      currentStep: idx,
      currentStepObj: step,
      currentPacket: packet,
      translatedPacket: translated,
      currentZone: step.zone,
      currentDirection: packet.direction,
      mappingTable: [].concat(this._mappingTable),
      activeMappingCount: this._mappingTable.length,
      totalTranslations: this._translationCount,
      lanHosts: newLanHosts,
      wanHosts: newWanHosts,
      errorMessage: ''
    });
  },

  _startPlay() {
    if (this._playTimer) return;
    this.setData({ isPlaying: true });
    const { currentStep, steps } = this.data;
    // If at end, reset
    if (currentStep >= steps.length - 1) {
      this.onStartTap();
      return;
    }
    this._playTimer = setInterval(function() {
      const current = this.data.currentStep;
      const steps = this.data.steps;
      if (current >= steps.length - 1) {
        this._stopPlay();
        this._showSummary();
        return;
      }
      this._renderStep(current + 1);
    }.bind(this), 1200);
  },

  _stopPlay() {
    if (this._playTimer) {
      clearInterval(this._playTimer);
      this._playTimer = null;
    }
    this.setData({ isPlaying: false });
  },

  _showSummary() {
    this.setData({
      showSummary: true
    });
  }
});
