/**
 * TCP 协议状态与步骤数据模块
 *
 * 纯函数，无副作用，便于测试。
 * 提供三次握手、四次挥手、数据传输（滑动窗口）的步骤数据生成。
 */

// ======================== 常量 ========================

const TCP_STATES = {
  CLOSED:      { label: 'CLOSED',      color: '#9ca3af' },
  LISTEN:      { label: 'LISTEN',      color: '#60a5fa' },
  SYN_SENT:    { label: 'SYN_SENT',    color: '#f59e0b' },
  SYN_RCVD:    { label: 'SYN_RCVD',    color: '#f59e0b' },
  ESTABLISHED: { label: 'ESTABLISHED', color: '#34d399' },
  FIN_WAIT_1:  { label: 'FIN_WAIT_1',  color: '#f97316' },
  FIN_WAIT_2:  { label: 'FIN_WAIT_2',  color: '#f97316' },
  TIME_WAIT:   { label: 'TIME_WAIT',   color: '#ef4444' },
  CLOSE_WAIT:  { label: 'CLOSE_WAIT',  color: '#8b5cf6' },
  LAST_ACK:    { label: 'LAST_ACK',    color: '#ef4444' }
};

const TCP_FLAGS = {
  SYN: 'SYN',
  ACK: 'ACK',
  FIN: 'FIN',
  RST: 'RST',
  PSH: 'PSH',
  URG: 'URG'
};

// ======================== 辅助函数 ========================

function _makeFlags(overrides) {
  return Object.assign({ SYN: false, ACK: false, FIN: false, RST: false, PSH: false, URG: false }, overrides);
}

// ======================== 三次握手 ========================

function getHandshakeSteps() {
  return [
    {
      step: 1,
      type: 'handshake',
      name: '第一次握手',
      direction: 'client→server',
      flags: _makeFlags({ SYN: true }),
      seq: 100,
      ack: 0,
      clientState: { from: 'CLOSED', to: 'SYN_SENT' },
      serverState: null,
      explanation: '客户端发送 SYN 报文，请求建立连接。seq=100 是客户端随机选择的初始序列号（ISN）。',
      highlight: ['SYN', 'seq'],
      examTip: '面试高频：为什么不是两次握手？因为两次握手无法防止历史重复连接的初始化。'
    },
    {
      step: 2,
      type: 'handshake',
      name: '第二次握手',
      direction: 'server→client',
      flags: _makeFlags({ SYN: true, ACK: true }),
      seq: 300,
      ack: 101,
      clientState: null,
      serverState: { from: 'LISTEN', to: 'SYN_RCVD' },
      explanation: '服务端回复 SYN+ACK。ack=101 表示"期望收到客户端下一个字节的序号"（100+1）。seq=300 是服务端的 ISN。',
      highlight: ['SYN', 'ACK', 'seq', 'ack'],
      examTip: 'SYN 报文消耗一个序列号，ACK 报文不消耗。'
    },
    {
      step: 3,
      type: 'handshake',
      name: '第三次握手',
      direction: 'client→server',
      flags: _makeFlags({ ACK: true }),
      seq: 101,
      ack: 301,
      clientState: { from: 'SYN_SENT', to: 'ESTABLISHED' },
      serverState: { from: 'SYN_RCVD', to: 'ESTABLISHED' },
      explanation: '客户端发送 ACK 确认服务端的 SYN。双方进入 ESTABLISHED 状态，连接建立完成，可以开始传输数据。',
      highlight: ['ACK', 'seq', 'ack'],
      examTip: '第三次握手可以携带数据，前两次不行。'
    }
  ];
}

// ======================== 四次挥手 ========================

function getTeardownSteps() {
  return [
    {
      step: 1,
      type: 'teardown',
      name: '第一次挥手',
      direction: 'client→server',
      flags: _makeFlags({ FIN: true, ACK: true }),
      seq: 500,
      ack: 800,
      clientState: { from: 'ESTABLISHED', to: 'FIN_WAIT_1' },
      serverState: null,
      explanation: '客户端发送 FIN 报文，表示"我没有数据要发了"。seq=500 是客户端当前序列号。注意 FIN 也消耗一个序列号。',
      highlight: ['FIN', 'ACK', 'seq'],
      examTip: 'FIN 只表示发送方不再发送数据，但仍可接收数据（半关闭）。'
    },
    {
      step: 2,
      type: 'teardown',
      name: '第二次挥手',
      direction: 'server→client',
      flags: _makeFlags({ ACK: true }),
      seq: 800,
      ack: 501,
      clientState: { from: 'FIN_WAIT_1', to: 'FIN_WAIT_2' },
      serverState: { from: 'ESTABLISHED', to: 'CLOSE_WAIT' },
      explanation: '服务端发送 ACK 确认收到客户端的 FIN。客户端进入 FIN_WAIT_2，服务端进入 CLOSE_WAIT。此时服务端可能还有数据要发送。',
      highlight: ['ACK', 'ack'],
      examTip: '四次挥手的原因：TCP 是全双工，两个方向的关闭需要分别确认。服务端可能还有数据未发完。'
    },
    {
      step: 3,
      type: 'teardown',
      name: '第三次挥手',
      direction: 'server→client',
      flags: _makeFlags({ FIN: true, ACK: true }),
      seq: 800,
      ack: 501,
      clientState: null,
      serverState: { from: 'CLOSE_WAIT', to: 'LAST_ACK' },
      explanation: '服务端发送自己的 FIN，表示"我也没有数据要发了"。服务端进入 LAST_ACK 状态，等待客户端的最终确认。',
      highlight: ['FIN', 'ACK', 'seq'],
      examTip: '为什么是四次？因为 TCP 是全双工，每个方向需要独立关闭。服务端的 ACK 和 FIN 通常不能合并（可能还有数据要发）。'
    },
    {
      step: 4,
      type: 'teardown',
      name: '第四次挥手',
      direction: 'client→server',
      flags: _makeFlags({ ACK: true }),
      seq: 501,
      ack: 801,
      clientState: { from: 'FIN_WAIT_2', to: 'TIME_WAIT' },
      serverState: { from: 'LAST_ACK', to: 'CLOSED' },
      explanation: '客户端发送 ACK 确认服务端的 FIN，进入 TIME_WAIT 状态。等待 2MSL（最大报文生存时间）后关闭，确保服务端收到最终 ACK。',
      highlight: ['ACK', 'ack'],
      examTip: 'TIME_WAIT 等待 2MSL 的原因：①确保最后一个 ACK 能到达服务端；②让旧连接的报文在网络中消失，防止影响新连接。'
    }
  ];
}

// ======================== 数据传输（滑动窗口） ========================

/**
 * 生成数据传输场景参数
 * @param {'normal'|'loss'} type - 场景类型
 * @returns {object} 场景参数
 */
function generateDataScenario(type) {
  if (type === 'loss') {
    return {
      type: 'loss',
      initialSeq: 100,
      windowSize: 400,
      segmentSize: 100,
      segments: [
        { seq: 100, dataLen: 100, lost: false },
        { seq: 200, dataLen: 100, lost: true },
        { seq: 300, dataLen: 100, lost: false },
        { seq: 400, dataLen: 100, lost: false }
      ],
      description: '报文 seq=200 丢失，触发超时重传。展示滑动窗口的可靠传输机制。'
    };
  }

  return {
    type: 'normal',
    initialSeq: 100,
    windowSize: 400,
    segmentSize: 100,
    segments: [
      { seq: 100, dataLen: 100, lost: false },
      { seq: 200, dataLen: 100, lost: false },
      { seq: 300, dataLen: 100, lost: false },
      { seq: 400, dataLen: 100, lost: false }
    ],
    description: '正常传输：4 个报文段依次发送，ACK 依次返回，窗口顺利滑动。'
  };
}

/**
 * 根据场景生成数据传输步骤
 * @param {object} scenario - 由 generateDataScenario 生成
 * @returns {Array} 步骤数组
 */
function getDataTransferSteps(scenario) {
  const steps = [];
  let stepNum = 0;
  let base = scenario.initialSeq;
  const windowSize = scenario.windowSize;
  const segSize = scenario.segmentSize;

  if (scenario.type === 'normal') {
    scenario.segments.forEach(function(seg) {
      stepNum++;
      steps.push({
        step: stepNum,
        type: 'data',
        name: '发送报文段',
        direction: 'client→server',
        flags: _makeFlags({ PSH: true, ACK: true }),
        seq: seg.seq,
        ack: null,
        dataLen: seg.dataLen,
        senderWindow: { base: base, nextSeq: seg.seq + seg.dataLen, size: windowSize },
        receiverWindow: { expectedSeq: base },
        explanation: '发送方发送数据，seq=' + seg.seq + '，数据长度 ' + seg.dataLen + ' 字节。发送窗口 [' + base + ', ' + (base + windowSize) + ')。',
        highlight: ['seq', 'dataLen', 'PSH']
      });
    });

    scenario.segments.forEach(function(seg) {
      stepNum++;
      const ackNum = seg.seq + seg.dataLen;
      base = Math.max(base, ackNum - windowSize + segSize);
      steps.push({
        step: stepNum,
        type: 'data',
        name: '接收确认（ACK）',
        direction: 'server→client',
        flags: _makeFlags({ ACK: true }),
        seq: null,
        ack: ackNum,
        dataLen: null,
        senderWindow: { base: base, nextSeq: ackNum, size: windowSize },
        receiverWindow: { expectedSeq: ackNum },
        explanation: '接收方返回 ACK=' + ackNum + '（累积确认）。发送窗口滑动到 [' + base + ', ' + (base + windowSize) + ')。',
        highlight: ['ACK', 'ack']
      });
    });

  } else if (scenario.type === 'loss') {
    scenario.segments.forEach(function(seg) {
      stepNum++;
      steps.push({
        step: stepNum,
        type: 'data',
        name: seg.lost ? '发送报文段（丢失！）' : '发送报文段',
        direction: 'client→server',
        flags: _makeFlags({ PSH: true, ACK: true }),
        seq: seg.seq,
        ack: null,
        dataLen: seg.dataLen,
        senderWindow: { base: base, nextSeq: seg.seq + seg.dataLen, size: windowSize },
        receiverWindow: { expectedSeq: base },
        explanation: seg.lost
          ? '发送方发送数据，seq=' + seg.seq + '。但该报文在网络中丢失！接收方不会收到。'
          : '发送方发送数据，seq=' + seg.seq + '，数据长度 ' + seg.dataLen + ' 字节。',
        highlight: seg.lost ? ['seq'] : ['seq', 'dataLen', 'PSH']
      });
    });

    stepNum++;
    steps.push({
      step: stepNum,
      type: 'data',
      name: '接收确认（ACK）',
      direction: 'server→client',
      flags: _makeFlags({ ACK: true }),
      seq: null,
      ack: 200,
      dataLen: null,
      senderWindow: { base: base, nextSeq: 500, size: windowSize },
      receiverWindow: { expectedSeq: 200 },
      explanation: '接收方收到 seq=100 的报文，返回 ACK=200（累积确认）。但 seq=200 的报文已丢失，后续报文被接收方缓存但不交付。',
      highlight: ['ACK', 'ack']
    });

    stepNum++;
    steps.push({
      step: stepNum,
      type: 'data',
      name: '重复确认（第 2 个重复 ACK）',
      direction: 'server→client',
      flags: _makeFlags({ ACK: true }),
      seq: null,
      ack: 200,
      dataLen: null,
      senderWindow: { base: base, nextSeq: 500, size: windowSize },
      receiverWindow: { expectedSeq: 200 },
      explanation: '接收方收到 seq=300，但因为 seq=200 缺失，返回重复的 ACK=200。这是第 2 个重复 ACK。',
      highlight: ['ACK', 'ack']
    });

    stepNum++;
    steps.push({
      step: stepNum,
      type: 'data',
      name: '重复确认（第 3 个重复 ACK）',
      direction: 'server→client',
      flags: _makeFlags({ ACK: true }),
      seq: null,
      ack: 200,
      dataLen: null,
      senderWindow: { base: base, nextSeq: 500, size: windowSize },
      receiverWindow: { expectedSeq: 200 },
      explanation: '接收方收到 seq=400，返回第 3 个重复 ACK=200。发送方收到 3 个重复 ACK，触发快重传（Fast Retransmit）。',
      highlight: ['ACK', 'ack'],
      examTip: '快重传：收到 3 个重复 ACK 立即重传，不用等超时。这比等待 RTO 超时更快恢复。'
    });

    stepNum++;
    steps.push({
      step: stepNum,
      type: 'data',
      name: '超时重传',
      direction: 'client→server',
      flags: _makeFlags({ PSH: true, ACK: true }),
      seq: 200,
      ack: null,
      dataLen: 100,
      senderWindow: { base: base, nextSeq: 500, size: windowSize },
      receiverWindow: { expectedSeq: 200 },
      explanation: '发送方定时器超时，重传 seq=200 的报文。超时时间 RTO 基于 RTT 动态计算。重传后发送方将窗口缩小（拥塞控制）。',
      highlight: ['seq', 'dataLen'],
      examTip: '快重传：收到 3 个重复 ACK 立即重传，不用等超时。快恢复：窗口减半而非从 1 开始。'
    });

    stepNum++;
    steps.push({
      step: stepNum,
      type: 'data',
      name: '累积确认（全部到达）',
      direction: 'server→client',
      flags: _makeFlags({ ACK: true }),
      seq: null,
      ack: 500,
      dataLen: null,
      senderWindow: { base: 500, nextSeq: 500, size: windowSize },
      receiverWindow: { expectedSeq: 500 },
      explanation: '接收方收到重传的 seq=200，所有报文段完整，返回 ACK=500（累积确认）。窗口滑动到 [500, 900)。',
      highlight: ['ACK', 'ack']
    });
  }

  return steps;
}

// ======================== 完整连接生命周期 ========================

function getFullConnectionSteps() {
  const handshake = getHandshakeSteps();
  const dataScenario = generateDataScenario('normal');
  const dataTransfer = getDataTransferSteps(dataScenario);
  const teardown = getTeardownSteps();

  const allSteps = [];
  let num = 0;

  handshake.forEach(function(s) {
    num++;
    const step = JSON.parse(JSON.stringify(s));
    step.step = num;
    step.type = 'full';
    allSteps.push(step);
  });

  dataTransfer.forEach(function(s) {
    num++;
    const step = JSON.parse(JSON.stringify(s));
    step.step = num;
    step.type = 'full';
    allSteps.push(step);
  });

  teardown.forEach(function(s) {
    num++;
    const step = JSON.parse(JSON.stringify(s));
    step.step = num;
    step.type = 'full';
    allSteps.push(step);
  });

  return allSteps;
}

// ======================== 导出 ========================

module.exports = {
  TCP_STATES: TCP_STATES,
  TCP_FLAGS: TCP_FLAGS,
  getHandshakeSteps: getHandshakeSteps,
  getTeardownSteps: getTeardownSteps,
  getFullConnectionSteps: getFullConnectionSteps,
  getDataTransferSteps: getDataTransferSteps,
  generateDataScenario: generateDataScenario
};
