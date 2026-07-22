/**
 * NAT 场景预设数据
 *
 * 3 个预设场景：单台主机外出、多台主机共享公网 IP、端口映射 Web 服务器
 * 所有步骤为手动构造的预设序列，保证教学内容可控
 */

/**
 * @typedef {Object} Scenario
 * @property {string} id
 * @property {string} label
 * @property {{ subnet: string }} internalNetwork
 * @property {string} publicIp
 * @property {number[]} portRange
 * @property {Array} steps
 * @property {{ externalPort: number, internalIp: string, internalPort: number }} [staticMapping]
 */

const SCENARIO_LABELS = ['单台主机外出', '多台主机共享公网 IP', '端口映射 Web 服务器'];

const SCENARIOS = [
  {
    id: 'single-host',
    label: '单台主机外出',
    internalNetwork: { subnet: '192.168.1.0/24' },
    publicIp: '203.0.113.1',
    portRange: [50000, 50001, 50002],
    steps: [
      {
        step: 1,
        zone: 'lan',
        packet: { srcIp: '192.168.1.2', srcPort: 40000, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' },
        tableUpdate: { action: 'noop' },
        explanation: '内网主机 192.168.1.2 发起对 203.0.113.5:80 的 TCP 连接。'
      },
      {
        step: 2,
        zone: 'router',
        packet: { srcIp: '203.0.113.1', srcPort: 50000, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' },
        translated: { srcIp: '192.168.1.2', srcPort: 40000 },
        tableUpdate: {
          action: 'add',
          entry: { internalIp: '192.168.1.2', internalPort: 40000, externalPort: 50000, remoteHost: '203.0.113.5', protocol: 'TCP', timeout: 60, state: 'Active' }
        },
        explanation: 'NAT 路由器将源地址 192.168.1.2:40000 替换为公网 203.0.113.1:50000，并在映射表中添加条目。',
        examTip: 'NAPT 同时转换 IP 和端口，多个内网主机可共享同一公网 IP。'
      },
      {
        step: 3,
        zone: 'wan',
        packet: { srcIp: '203.0.113.1', srcPort: 50000, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' },
        tableUpdate: { action: 'noop' },
        explanation: '报文到达外网目标 203.0.113.5:80，源地址已替换为公网 IP。'
      },
      {
        step: 4,
        zone: 'wan',
        packet: { srcIp: '203.0.113.5', srcPort: 80, dstIp: '203.0.113.1', dstPort: 50000, protocol: 'TCP', direction: 'inbound' },
        tableUpdate: { action: 'noop' },
        explanation: '外网服务器响应，目标为 NAT 路由器的公网 IP:50000。'
      },
      {
        step: 5,
        zone: 'router',
        packet: { srcIp: '203.0.113.5', srcPort: 80, dstIp: '192.168.1.2', dstPort: 40000, protocol: 'TCP', direction: 'inbound' },
        translated: { dstIp: '203.0.113.1', dstPort: 50000 },
        tableUpdate: { action: 'noop' },
        explanation: 'NAT 路由器查映射表，将目标恢复为 192.168.1.2:40000，转发给内网主机。',
        examTip: 'NAT 必须维护映射表才能正确回送响应报文——这就是"有状态"的含义。'
      },
      {
        step: 6,
        zone: 'lan',
        packet: { srcIp: '203.0.113.5', srcPort: 80, dstIp: '192.168.1.2', dstPort: 40000, protocol: 'TCP', direction: 'inbound' },
        tableUpdate: { action: 'noop' },
        explanation: '内网主机收到响应，对应用程序透明——主机并不知道 NAT 的存在。'
      }
    ]
  },
  {
    id: 'multi-host',
    label: '多台主机共享公网 IP',
    internalNetwork: { subnet: '192.168.1.0/24' },
    publicIp: '203.0.113.1',
    portRange: [50000, 50001, 50002, 50003, 50004],
    steps: [
      {
        step: 1,
        zone: 'lan',
        packet: { srcIp: '192.168.1.2', srcPort: 40000, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' },
        tableUpdate: { action: 'noop' },
        explanation: '主机 A（192.168.1.2）发起 HTTP 请求。'
      },
      {
        step: 2,
        zone: 'router',
        packet: { srcIp: '203.0.113.1', srcPort: 50000, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' },
        tableUpdate: {
          action: 'add',
          entry: { internalIp: '192.168.1.2', internalPort: 40000, externalPort: 50000, remoteHost: '203.0.113.5', protocol: 'TCP', timeout: 60, state: 'Active' }
        },
        explanation: 'NAT 将主机 A 映射到公网端口 50000。'
      },
      {
        step: 3,
        zone: 'lan',
        packet: { srcIp: '192.168.1.3', srcPort: 41000, dstIp: '8.8.8.8', dstPort: 53, protocol: 'UDP', direction: 'outbound' },
        tableUpdate: { action: 'noop' },
        explanation: '主机 B（192.168.1.3）同时发起 DNS 查询。'
      },
      {
        step: 4,
        zone: 'router',
        packet: { srcIp: '203.0.113.1', srcPort: 50001, dstIp: '8.8.8.8', dstPort: 53, protocol: 'UDP', direction: 'outbound' },
        tableUpdate: {
          action: 'add',
          entry: { internalIp: '192.168.1.3', internalPort: 41000, externalPort: 50001, remoteHost: '8.8.8.8', protocol: 'UDP', timeout: 60, state: 'Active' }
        },
        explanation: 'NAT 将主机 B 映射到不同的公网端口 50001——两台主机共享同一公网 IP 203.0.113.1。',
        examTip: 'NAPT 通过端口号区分同一公网 IP 后的不同内网主机，端口是关键复用因子。'
      },
      {
        step: 5,
        zone: 'wan',
        packet: { srcIp: '203.0.113.1', srcPort: 50000, dstIp: '203.0.113.5', dstPort: 80, protocol: 'TCP', direction: 'outbound' },
        tableUpdate: { action: 'noop' },
        explanation: '主机 A 的 HTTP 报文经 NAT 后发往外网。'
      },
      {
        step: 6,
        zone: 'wan',
        packet: { srcIp: '8.8.8.8', srcPort: 53, dstIp: '203.0.113.1', dstPort: 50001, protocol: 'UDP', direction: 'inbound' },
        tableUpdate: { action: 'noop' },
        explanation: '主机 B 的 DNS 响应返回 NAT 路由器。'
      },
      {
        step: 7,
        zone: 'router',
        packet: { srcIp: '8.8.8.8', srcPort: 53, dstIp: '192.168.1.3', dstPort: 41000, protocol: 'UDP', direction: 'inbound' },
        tableUpdate: { action: 'noop' },
        explanation: 'NAT 根据映射表将 DNS 响应转发给主机 B（192.168.1.3:41000）。'
      },
      {
        step: 8,
        zone: 'lan',
        packet: { srcIp: '8.8.8.8', srcPort: 53, dstIp: '192.168.1.3', dstPort: 41000, protocol: 'UDP', direction: 'inbound' },
        tableUpdate: { action: 'noop' },
        explanation: '主机 B 收到 DNS 响应。每个主机的流量被 NAT 正确分离。'
      }
    ]
  },
  {
    id: 'port-forward',
    label: '端口映射 Web 服务器',
    internalNetwork: { subnet: '192.168.1.0/24' },
    publicIp: '203.0.113.1',
    portRange: [],
    staticMapping: { externalPort: 8080, internalIp: '192.168.1.10', internalPort: 80 },
    steps: [
      {
        step: 1,
        zone: 'wan',
        packet: { srcIp: '203.0.113.100', srcPort: 30000, dstIp: '203.0.113.1', dstPort: 8080, protocol: 'TCP', direction: 'inbound' },
        tableUpdate: { action: 'noop' },
        explanation: '外网用户访问 NAT 公网 IP 的 8080 端口。'
      },
      {
        step: 2,
        zone: 'router',
        packet: { srcIp: '203.0.113.100', srcPort: 30000, dstIp: '192.168.1.10', dstPort: 80, protocol: 'TCP', direction: 'inbound' },
        tableUpdate: {
          action: 'add',
          entry: { internalIp: '192.168.1.10', internalPort: 80, externalPort: 8080, remoteHost: '203.0.113.100', protocol: 'TCP', timeout: 60, state: 'Active' }
        },
        explanation: 'NAT 路由器根据预配的静态端口映射，将目标地址改为内网服务器 192.168.1.10:80。',
        examTip: '端口映射是 DNAT 的典型应用——外网无法直接访问内网，但通过静态映射可以暴露特定服务。'
      },
      {
        step: 3,
        zone: 'lan',
        packet: { srcIp: '203.0.113.100', srcPort: 30000, dstIp: '192.168.1.10', dstPort: 80, protocol: 'TCP', direction: 'inbound' },
        tableUpdate: { action: 'noop' },
        explanation: '内网 Web 服务器收到请求，开始处理。'
      },
      {
        step: 4,
        zone: 'lan',
        packet: { srcIp: '192.168.1.10', srcPort: 80, dstIp: '203.0.113.100', dstPort: 30000, protocol: 'TCP', direction: 'outbound' },
        tableUpdate: { action: 'noop' },
        explanation: 'Web 服务器响应请求，源地址为内网 IP。'
      },
      {
        step: 5,
        zone: 'router',
        packet: { srcIp: '203.0.113.1', srcPort: 8080, dstIp: '203.0.113.100', dstPort: 30000, protocol: 'TCP', direction: 'outbound' },
        tableUpdate: { action: 'noop' },
        explanation: 'NAT 将响应源地址替换为公网 IP:8080，外网用户感知到的是 NAT 路由器的地址。'
      },
      {
        step: 6,
        zone: 'wan',
        packet: { srcIp: '203.0.113.1', srcPort: 8080, dstIp: '203.0.113.100', dstPort: 30000, protocol: 'TCP', direction: 'outbound' },
        tableUpdate: { action: 'noop' },
        explanation: '外网用户收到来自 203.0.113.1:8080 的响应，整个过程内网服务器对外透明。'
      }
    ]
  }
];

/**
 * 根据 ID 获取场景
 * @param {string} id
 * @returns {Scenario|undefined}
 */
function getScenarioById(id) {
  return SCENARIOS.find(function(s) { return s.id === id; });
}

/**
 * 验证所有场景数据完整性
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateScenarios() {
  const errors = [];
  const zoneValues = ['lan', 'router', 'wan'];
  const protocolValues = ['TCP', 'UDP'];
  const tableActions = ['add', 'remove', 'noop'];

  SCENARIOS.forEach(function(s) {
    if (!s.id) errors.push('Scenario missing id');
    if (!s.label) errors.push('Scenario missing label: ' + s.id);
    if (!s.internalNetwork || !s.internalNetwork.subnet) errors.push(s.id + ': missing internalNetwork.subnet');
    if (!s.publicIp) errors.push(s.id + ': missing publicIp');
    if (!Array.isArray(s.steps) || s.steps.length === 0) errors.push(s.id + ': steps is empty or not array');

    s.steps.forEach(function(step, i) {
      if (typeof step.step !== 'number') errors.push(s.id + ' step ' + i + ': missing step number');
      if (!zoneValues.includes(step.zone)) errors.push(s.id + ' step ' + i + ': invalid zone ' + step.zone);
      if (!step.packet) errors.push(s.id + ' step ' + i + ': missing packet');
      if (step.packet) {
        if (!step.packet.srcIp) errors.push(s.id + ' step ' + i + ': packet missing srcIp');
        if (typeof step.packet.srcPort !== 'number') errors.push(s.id + ' step ' + i + ': packet missing srcPort');
        if (!step.packet.dstIp) errors.push(s.id + ' step ' + i + ': packet missing dstIp');
        if (typeof step.packet.dstPort !== 'number') errors.push(s.id + ' step ' + i + ': packet missing dstPort');
        if (!protocolValues.includes(step.packet.protocol)) errors.push(s.id + ' step ' + i + ': invalid protocol');
      }
      if (!tableActions.includes(step.tableUpdate.action)) errors.push(s.id + ' step ' + i + ': invalid tableUpdate action');
      if (!step.explanation) errors.push(s.id + ' step ' + i + ': missing explanation');
    });

    // 端口映射场景必须有 staticMapping
    if (s.id === 'port-forward' && !s.staticMapping) {
      errors.push('port-forward: missing staticMapping');
    }
  });

  return { valid: errors.length === 0, errors: errors };
}

module.exports = {
  SCENARIOS,
  SCENARIO_LABELS,
  getScenarioById,
  validateScenarios
};
