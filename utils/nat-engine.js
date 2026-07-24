/**
 * NAT 转换引擎（纯函数，无副作用）
 *
 * SNAT：源地址转换（内网→外网）
 * DNAT：端口映射（外网→内网）
 * 端口分配 + 映射表管理
 */

/**
 * @typedef {Object} Packet
 * @property {string} srcIp
 * @property {number} srcPort
 * @property {string} dstIp
 * @property {number} dstPort
 * @property {'TCP'|'UDP'} protocol
 * @property {'outbound'|'inbound'} direction
 */

/**
 * @typedef {Object} MappingEntry
 * @property {string} internalIp
 * @property {number} internalPort
 * @property {number} externalPort
 * @property {string} remoteHost
 * @property {'TCP'|'UDP'} protocol
 * @property {number} time
 * @property {number} timeout
 * @property {'Active'|'Expired'} state
 */

/**
 * @typedef {Object} TableUpdate
 * @property {'add'|'remove'|'noop'} action
 * @property {MappingEntry} [entry]
 */

/**
 * 从端口池分配一个可用端口
 * @param {number[]} portPool - 可用端口列表
 * @param {number[]} usedPorts - 当前已使用的端口
 * @returns {number|null}
 */
function allocatePort(portPool, usedPorts) {
  for (const port of portPool) {
    if (!usedPorts.includes(port)) return port;
  }
  return null;
}

/**
 * 创建映射表条目
 */
function createMappingEntry(internalIp, internalPort, externalPort, remoteHost, protocol) {
  return {
    internalIp,
    internalPort,
    externalPort,
    remoteHost,
    protocol,
    time: Math.floor(Date.now() / 1000),
    timeout: 60,
    state: 'Active'
  };
}

/**
 * SNAT：源地址转换（内网→外网）
 * @param {Packet} packet - 原始报文
 * @param {number[]} portPool - 公网端口池
 * @param {MappingEntry[]} mappingTable - 当前映射表
 * @param {string} publicIp - 公网 IP 地址
 * @returns {{ packet: Packet|null, tableUpdate: TableUpdate|null, error?: string }}
 */
function snat(packet, portPool, mappingTable, publicIp) {
  // 先查是否有现有映射
  const existing = mappingTable.find(function(e) {
    return e.internalIp === packet.srcIp &&
           e.internalPort === packet.srcPort &&
           e.remoteHost === packet.dstIp;
  });

  if (existing) {
    return {
      packet: {
        srcIp: publicIp,
        srcPort: existing.externalPort,
        dstIp: packet.dstIp,
        dstPort: packet.dstPort,
        protocol: packet.protocol,
        direction: packet.direction
      },
      tableUpdate: { action: 'noop' }
    };
  }

  // 分配新端口
  const usedPorts = mappingTable.map(function(e) { return e.externalPort; });
  const externalPort = allocatePort(portPool, usedPorts);
  if (externalPort === null) {
    return {
      packet: null,
      tableUpdate: null,
      error: '端口池耗尽，新连接无法建立'
    };
  }

  const entry = createMappingEntry(packet.srcIp, packet.srcPort, externalPort, packet.dstIp, packet.protocol);

  return {
    packet: {
      srcIp: publicIp,
      srcPort: externalPort,
      dstIp: packet.dstIp,
      dstPort: packet.dstPort,
      protocol: packet.protocol,
      direction: packet.direction
    },
    tableUpdate: { action: 'add', entry: entry }
  };
}

/**
 * DNAT：目标地址转换（端口映射，外网→内网）
 * @param {Packet} packet - 入站报文
 * @param {{ externalPort: number, internalIp: string, internalPort: number }} staticMapping
 * @returns {{ packet: Packet|null, tableUpdate: { action: 'noop' }, error?: string }}
 */
function dnat(packet, staticMapping) {
  if (packet.dstPort !== staticMapping.externalPort) {
    return {
      packet: null,
      tableUpdate: { action: 'noop' },
      error: 'NAT 丢弃：无映射条目'
    };
  }

  return {
    packet: {
      srcIp: packet.srcIp,
      srcPort: packet.srcPort,
      dstIp: staticMapping.internalIp,
      dstPort: staticMapping.internalPort,
      protocol: packet.protocol,
      direction: packet.direction
    },
    tableUpdate: { action: 'noop' }
  };
}

/**
 * 移除超时的映射条目
 * @param {MappingEntry[]} table
 * @param {number} now - 当前时间（秒）
 * @returns {MappingEntry[]} 保留下来的条目
 */
function removeExpiredEntries(table, now) {
  return table.filter(function(e) {
    return e.time + e.timeout > now;
  });
}

module.exports = {
  allocatePort,
  createMappingEntry,
  snat,
  dnat,
  removeExpiredEntries
};
