/**
 * TCP 协议状态模块测试
 */

const {
  TCP_STATES,
  TCP_FLAGS,
  getHandshakeSteps,
  getTeardownSteps,
  getFullConnectionSteps,
  getDataTransferSteps,
  generateDataScenario
} = require('../../utils/tcp-states');

// ======================== TCP_STATES 常量 ========================

describe('TCP_STATES', () => {
  test('包含所有标准 TCP 状态', () => {
    const expectedStates = [
      'CLOSED', 'LISTEN', 'SYN_SENT', 'SYN_RCVD', 'ESTABLISHED',
      'FIN_WAIT_1', 'FIN_WAIT_2', 'TIME_WAIT', 'CLOSE_WAIT', 'LAST_ACK'
    ];
    expectedStates.forEach(state => {
      expect(TCP_STATES[state]).toBeDefined();
      expect(TCP_STATES[state].label).toBe(state);
      expect(typeof TCP_STATES[state].color).toBe('string');
    });
  });

  test('ESTABLISHED 状态为绿色', () => {
    expect(TCP_STATES.ESTABLISHED.color).toBe('#34d399');
  });

  test('TIME_WAIT 状态为红色', () => {
    expect(TCP_STATES.TIME_WAIT.color).toBe('#ef4444');
  });
});

// ======================== 三次握手 ========================

describe('getHandshakeSteps', () => {
  const steps = getHandshakeSteps();

  test('返回 3 个步骤', () => {
    expect(steps).toHaveLength(3);
  });

  test('第一次握手：SYN=true, ACK=false', () => {
    const s = steps[0];
    expect(s.flags.SYN).toBe(true);
    expect(s.flags.ACK).toBe(false);
    expect(s.direction).toBe('client→server');
  });

  test('第二次握手：SYN=true, ACK=true', () => {
    const s = steps[1];
    expect(s.flags.SYN).toBe(true);
    expect(s.flags.ACK).toBe(true);
    expect(s.direction).toBe('server→client');
  });

  test('第三次握手：SYN=false, ACK=true', () => {
    const s = steps[2];
    expect(s.flags.SYN).toBe(false);
    expect(s.flags.ACK).toBe(true);
    expect(s.direction).toBe('client→server');
  });

  test('seq/ack 数值递推正确', () => {
    expect(steps[0].seq).toBe(100);
    expect(steps[1].seq).toBe(300);
    expect(steps[1].ack).toBe(101);
    expect(steps[2].seq).toBe(101);
    expect(steps[2].ack).toBe(301);
  });

  test('状态转换正确', () => {
    expect(steps[0].clientState).toEqual({ from: 'CLOSED', to: 'SYN_SENT' });
    expect(steps[0].serverState).toBeNull();
    expect(steps[1].clientState).toBeNull();
    expect(steps[1].serverState).toEqual({ from: 'LISTEN', to: 'SYN_RCVD' });
    expect(steps[2].clientState).toEqual({ from: 'SYN_SENT', to: 'ESTABLISHED' });
    expect(steps[2].serverState).toEqual({ from: 'SYN_RCVD', to: 'ESTABLISHED' });
  });

  test('所有步骤都有 explanation 和 highlight 字段', () => {
    steps.forEach(s => {
      expect(typeof s.explanation).toBe('string');
      expect(s.explanation.length).toBeGreaterThan(0);
      expect(Array.isArray(s.highlight)).toBe(true);
      expect(s.highlight.length).toBeGreaterThan(0);
    });
  });

  test('所有步骤都有 examTip 字段', () => {
    steps.forEach(s => {
      expect(typeof s.examTip).toBe('string');
      expect(s.examTip.length).toBeGreaterThan(0);
    });
  });

  test('所有步骤都有 flags 对象，包含 6 个标志位', () => {
    steps.forEach(s => {
      expect(s.flags).toBeDefined();
      expect(s.flags.SYN).toBeDefined();
      expect(s.flags.ACK).toBeDefined();
      expect(s.flags.FIN).toBeDefined();
      expect(s.flags.RST).toBeDefined();
      expect(s.flags.PSH).toBeDefined();
      expect(s.flags.URG).toBeDefined();
    });
  });
});

// ======================== 四次挥手 ========================

describe('getTeardownSteps', () => {
  const steps = getTeardownSteps();

  test('返回 4 个步骤', () => {
    expect(steps).toHaveLength(4);
  });

  test('第一次挥手：FIN=true, ACK=true', () => {
    const s = steps[0];
    expect(s.flags.FIN).toBe(true);
    expect(s.flags.ACK).toBe(true);
    expect(s.direction).toBe('client→server');
  });

  test('第二次挥手：ACK=true, FIN=false', () => {
    const s = steps[1];
    expect(s.flags.ACK).toBe(true);
    expect(s.flags.FIN).toBe(false);
    expect(s.direction).toBe('server→client');
  });

  test('第三次挥手：FIN=true, ACK=true', () => {
    const s = steps[2];
    expect(s.flags.FIN).toBe(true);
    expect(s.flags.ACK).toBe(true);
    expect(s.direction).toBe('server→client');
  });

  test('第四次挥手：ACK=true, FIN=false', () => {
    const s = steps[3];
    expect(s.flags.ACK).toBe(true);
    expect(s.flags.FIN).toBe(false);
    expect(s.direction).toBe('client→server');
  });

  test('状态转换包含 TIME_WAIT', () => {
    const states = steps.map(s => {
      const cs = s.clientState ? s.clientState.to : null;
      const ss = s.serverState ? s.serverState.to : null;
      return [cs, ss];
    }).flat();

    expect(states).toContain('TIME_WAIT');
  });

  test('状态转换包含 CLOSE_WAIT 和 LAST_ACK', () => {
    const allStates = [];
    steps.forEach(s => {
      if (s.clientState) { allStates.push(s.clientState.from, s.clientState.to); }
      if (s.serverState) { allStates.push(s.serverState.from, s.serverState.to); }
    });

    expect(allStates).toContain('CLOSE_WAIT');
    expect(allStates).toContain('LAST_ACK');
    expect(allStates).toContain('FIN_WAIT_1');
    expect(allStates).toContain('FIN_WAIT_2');
  });

  test('最终状态：client=TIME_WAIT, server=CLOSED', () => {
    const last = steps[3];
    expect(last.clientState).toEqual({ from: 'FIN_WAIT_2', to: 'TIME_WAIT' });
    expect(last.serverState).toEqual({ from: 'LAST_ACK', to: 'CLOSED' });
  });

  test('所有步骤都有 explanation 和 highlight 字段', () => {
    steps.forEach(s => {
      expect(typeof s.explanation).toBe('string');
      expect(s.explanation.length).toBeGreaterThan(0);
      expect(Array.isArray(s.highlight)).toBe(true);
    });
  });

  test('所有步骤都有 examTip 字段', () => {
    steps.forEach(s => {
      expect(typeof s.examTip).toBe('string');
      expect(s.examTip.length).toBeGreaterThan(0);
    });
  });
});

// ======================== 数据传输场景 ========================

describe('generateDataScenario', () => {
  test('normal 场景：4 个报文段，无丢失', () => {
    const s = generateDataScenario('normal');
    expect(s.type).toBe('normal');
    expect(s.segments).toHaveLength(4);
    expect(s.segments.every(seg => seg.lost === false)).toBe(true);
  });

  test('loss 场景：4 个报文段，1 个丢失', () => {
    const s = generateDataScenario('loss');
    expect(s.type).toBe('loss');
    expect(s.segments).toHaveLength(4);
    expect(s.segments.filter(seg => seg.lost)).toHaveLength(1);
    expect(s.segments[1].lost).toBe(true);
  });

  test('两种场景都有 description', () => {
    expect(generateDataScenario('normal').description.length).toBeGreaterThan(0);
    expect(generateDataScenario('loss').description.length).toBeGreaterThan(0);
  });
});

describe('getDataTransferSteps', () => {
  test('normal 场景：包含发送和确认步骤', () => {
    const scenario = generateDataScenario('normal');
    const steps = getDataTransferSteps(scenario);
    const names = steps.map(s => s.name);

    expect(names).toContain('发送报文段');
    expect(names).toContain('接收确认（ACK）');
    expect(steps.length).toBeGreaterThan(0);
  });

  test('normal 场景：步骤数 = 发送数 + ACK 数', () => {
    const scenario = generateDataScenario('normal');
    const steps = getDataTransferSteps(scenario);
    expect(steps).toHaveLength(8);
  });

  test('loss 场景：包含超时重传步骤', () => {
    const scenario = generateDataScenario('loss');
    const steps = getDataTransferSteps(scenario);
    const names = steps.map(s => s.name);

    expect(names).toContain('发送报文段（丢失！）');
    expect(names).toContain('超时重传');
    expect(names.some(n => n.indexOf('重复确认') >= 0)).toBe(true);
  });

  test('loss 场景：步骤数 > normal 场景', () => {
    const normalSteps = getDataTransferSteps(generateDataScenario('normal'));
    const lossSteps = getDataTransferSteps(generateDataScenario('loss'));
    expect(lossSteps.length).toBeGreaterThan(normalSteps.length);
  });

  test('所有步骤都有 explanation 字段', () => {
    const steps = getDataTransferSteps(generateDataScenario('normal'));
    steps.forEach(s => {
      expect(typeof s.explanation).toBe('string');
      expect(s.explanation.length).toBeGreaterThan(0);
    });
  });

  test('所有步骤都有 flags 对象', () => {
    const steps = getDataTransferSteps(generateDataScenario('loss'));
    steps.forEach(s => {
      expect(s.flags).toBeDefined();
      expect(typeof s.flags.ACK).toBe('boolean');
    });
  });

  test('滑动窗口 base 值在 ACK 后递增', () => {
    const steps = getDataTransferSteps(generateDataScenario('normal'));
    const ackSteps = steps.filter(s => s.name === '接收确认（ACK）');

    for (let i = 1; i < ackSteps.length; i++) {
      expect(ackSteps[i].senderWindow.base).toBeGreaterThanOrEqual(ackSteps[i - 1].senderWindow.base);
    }
  });

  test('超时重传步骤有 examTip', () => {
    const steps = getDataTransferSteps(generateDataScenario('loss'));
    const retransmit = steps.find(s => s.name === '超时重传');
    expect(retransmit).toBeDefined();
    expect(typeof retransmit.examTip).toBe('string');
  });
});

// ======================== 完整连接 ========================

describe('getFullConnectionSteps', () => {
  const steps = getFullConnectionSteps();

  test('步骤数 = 握手 3 + 数据 8 + 挥手 4 = 15', () => {
    expect(steps).toHaveLength(15);
  });

  test('步骤编号连续', () => {
    steps.forEach((s, i) => {
      expect(s.step).toBe(i + 1);
    });
  });

  test('第一步是 SYN，最后一步是 ACK', () => {
    expect(steps[0].flags.SYN).toBe(true);
    const last = steps[steps.length - 1];
    expect(last.flags.ACK).toBe(true);
    expect(last.flags.FIN).toBe(false);
  });

  test('所有步骤 type 都是 full', () => {
    steps.forEach(s => {
      expect(s.type).toBe('full');
    });
  });
});
