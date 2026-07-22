const tcpStates = require('../../utils/tcp-states');
const TCP_STATES = tcpStates.TCP_STATES;
const getHandshakeSteps = tcpStates.getHandshakeSteps;
const getTeardownSteps = tcpStates.getTeardownSteps;
const getDataTransferSteps = tcpStates.getDataTransferSteps;
const generateDataScenario = tcpStates.generateDataScenario;

const KNOWLEDGE_ITEMS = [
  {
    title: '为什么是三次握手？',
    content: '两次握手不安全：历史连接请求可能被服务器误认为新连接，造成资源浪费。四次握手浪费：第三次握手已经可以确认双方收发正常，不需要第四次。三次是安全与效率的最小平衡。'
  },
  {
    title: '为什么是四次挥手？',
    content: 'TCP 是全双工协议，两个方向的连接需要分别关闭。服务端收到 FIN 后可能还有数据要发送，所以 ACK 和 FIN 通常不能合并为一次发送。因此需要四次交互才能完全关闭连接。'
  },
  {
    title: 'TIME_WAIT 等待 2MSL',
    content: '①确保最后一个 ACK 能到达服务端：如果 ACK 丢失，服务端会重传 FIN，客户端需要在 TIME_WAIT 状态等待并处理。②让旧连接的报文在网络中消失，防止影响新连接。MSL 是最大报文生存时间，2MSL 通常是 60 秒。'
  },
  {
    title: '滑动窗口的作用',
    content: '流量控制：接收方通过窗口大小告诉发送方自己还能接收多少数据，避免发送方发送过快导致接收方缓冲区溢出。窗口滑动：当收到 ACK 确认后，发送窗口向前移动，允许发送新的数据。'
  },
  {
    title: 'GBN vs SR',
    content: 'GBN（Go-Back-N）：接收方只接受按序到达的报文，丢弃乱序报文。发送方超时后从丢失报文开始重传所有后续报文。SR（Selective Repeat）：接收方缓存乱序报文，发送方只重传丢失的报文。SR 更高效但实现更复杂。'
  }
];

Page({
  data: {
    mode: 'handshake',
    steps: [],
    stepIndex: -1,
    totalSteps: 0,
    playing: false,
    speed: 5,
    currentStep: null,
    visibleArrows: [],
    clientStateLabel: 'CLOSED',
    clientStateColor: '#9ca3af',
    serverStateLabel: 'LISTEN',
    serverStateColor: '#60a5fa',
    flagItems: [],
    showKnowledge: false,
    knowledgeItems: KNOWLEDGE_ITEMS,
    dataScenarioDesc: '',
    // ℹ︎ 介绍
    toolId: 'tcp-viz',
    showIntro: false
  },

  onLoad: function() {
    this._loadSteps('handshake');
  },

  onUnload: function() {
    this._stopTimer();
  },

  _loadSteps: function(mode) {
    let steps;
    let clientInit, serverInit;
    let scenarioDesc = '';

    if (mode === 'handshake') {
      steps = getHandshakeSteps();
      clientInit = 'CLOSED';
      serverInit = 'LISTEN';
    } else if (mode === 'teardown') {
      steps = getTeardownSteps();
      clientInit = 'ESTABLISHED';
      serverInit = 'ESTABLISHED';
    } else if (mode === 'data') {
      const scenario = generateDataScenario('normal');
      steps = getDataTransferSteps(scenario);
      clientInit = 'ESTABLISHED';
      serverInit = 'ESTABLISHED';
      scenarioDesc = scenario.description;
    } else if (mode === 'data-loss') {
      const lossScenario = generateDataScenario('loss');
      steps = getDataTransferSteps(lossScenario);
      clientInit = 'ESTABLISHED';
      serverInit = 'ESTABLISHED';
      scenarioDesc = lossScenario.description;
    }

    this._stopTimer();
    this.setData({
      mode: mode,
      steps: steps,
      totalSteps: steps.length,
      stepIndex: -1,
      playing: false,
      currentStep: null,
      visibleArrows: [],
      clientStateLabel: clientInit,
      clientStateColor: TCP_STATES[clientInit].color,
      serverStateLabel: serverInit,
      serverStateColor: TCP_STATES[serverInit].color,
      flagItems: [],
      dataScenarioDesc: scenarioDesc
    });
  },

  onModeChange: function(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode === this.data.mode) return;
    this._loadSteps(mode);
  },

  onPlay: function() {
    this.setData({ playing: true });
    this._playNext();
  },

  onPause: function() {
    this._stopTimer();
    this.setData({ playing: false });
  },

  onStepNext: function() {
    this.onPause();
    this._applyStep(this.data.stepIndex + 1);
  },

  onStepPrev: function() {
    this.onPause();
    this._replayToIndex(this.data.stepIndex - 1);
  },

  onReset: function() {
    this._loadSteps(this.data.mode);
  },

  onSpeedChange: function(e) {
    this.setData({ speed: e.detail.value });
  },

  onToggleKnowledge: function() {
    this.setData({ showKnowledge: !this.data.showKnowledge });
  },

  // ℹ︎ 介绍入口
  showIntro: function() {
    this.setData({ showIntro: true });
  },
  onIntroClose: function() {
    this.setData({ showIntro: false });
  },
  onIntroEnter: function() {
    this.setData({ showIntro: false });
  },

  _stopTimer: function() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  },

  _playNext: function() {
    if (!this.data.playing) return;
    if (this.data.stepIndex >= this.data.totalSteps - 1) {
      this.onPause();
      return;
    }
    this._applyStep(this.data.stepIndex + 1);
    const delay = Math.max(200, 1500 - this.data.speed * 150);
    this._timer = setTimeout(() => {
      this._playNext();
    }, delay);
  },

  _applyStep: function(index) {
    if (index < 0 || index >= this.data.totalSteps) return;
    const step = this.data.steps[index];
    const arrows = this._buildArrows(index);
    const flagItems = this._buildFlagItems(step);
    const clientState = this._getStateAt(index, 'client');
    const serverState = this._getStateAt(index, 'server');

    this.setData({
      stepIndex: index,
      currentStep: step,
      visibleArrows: arrows,
      flagItems: flagItems,
      clientStateLabel: clientState.label,
      clientStateColor: clientState.color,
      serverStateLabel: serverState.label,
      serverStateColor: serverState.color
    });
  },

  _replayToIndex: function(targetIndex) {
    if (targetIndex < 0) {
      this._loadSteps(this.data.mode);
      return;
    }
    let clientInit, serverInit;
    if (this.data.mode === 'handshake') {
      clientInit = 'CLOSED'; serverInit = 'LISTEN';
    } else {
      clientInit = 'ESTABLISHED'; serverInit = 'ESTABLISHED';
    }
    this.setData({
      stepIndex: -1,
      visibleArrows: [],
      clientStateLabel: clientInit,
      clientStateColor: TCP_STATES[clientInit].color,
      serverStateLabel: serverInit,
      serverStateColor: TCP_STATES[serverInit].color
    });
    for (let i = 0; i <= targetIndex; i++) {
      this._applyStep(i);
    }
  },

  _buildArrows: function(upToIndex) {
    const arrows = [];
    for (let i = 0; i <= upToIndex; i++) {
      const step = this.data.steps[i];
      arrows.push({
        step: step.step,
        direction: step.direction === 'client→server' ? 'left-to-right' : 'right-to-left',
        label: this._buildArrowLabel(step),
        arrowType: this._getArrowType(step),
        isCurrent: i === upToIndex
      });
    }
    return arrows;
  },

  _buildArrowLabel: function(step) {
    const parts = [];
    if (step.flags.SYN) parts.push('SYN');
    if (step.flags.FIN) parts.push('FIN');
    if (step.flags.PSH) parts.push('PSH');
    if (step.flags.ACK) parts.push('ACK');
    if (step.seq !== null && step.seq !== undefined) parts.push('seq=' + step.seq);
    if (step.ack !== null && step.ack !== undefined) parts.push('ack=' + step.ack);
    if (step.dataLen) parts.push('len=' + step.dataLen);
    return parts.join(' ');
  },

  _getArrowType: function(step) {
    if (step.flags.SYN && step.flags.ACK) return 'syn-ack';
    if (step.flags.SYN) return 'syn';
    if (step.flags.FIN) return 'fin';
    if (step.flags.PSH) return 'data';
    return 'ack';
  },

  _buildFlagItems: function(step) {
    const flagNames = ['SYN', 'ACK', 'FIN', 'RST', 'PSH', 'URG'];
    const items = [];
    for (let i = 0; i < flagNames.length; i++) {
      items.push({ name: flagNames[i], active: step.flags[flagNames[i]] });
    }
    return items;
  },

  _getStateAt: function(upToIndex, side) {
    let initState;
    if (this.data.mode === 'handshake') {
      initState = side === 'client' ? 'CLOSED' : 'LISTEN';
    } else {
      initState = 'ESTABLISHED';
    }
    let state = initState;
    for (let i = 0; i <= upToIndex; i++) {
      const step = this.data.steps[i];
      const stateChange = side === 'client' ? step.clientState : step.serverState;
      if (stateChange) {
        state = stateChange.to;
      }
    }
    return TCP_STATES[state] || { label: state, color: '#9ca3af' };
  }
});
