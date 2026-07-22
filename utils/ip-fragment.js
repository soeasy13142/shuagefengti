const MAX_DATAGRAM = 65535;
const MIN_MTU = 68;
const IP_HEADER = 20;

let _idCounter = 0;

/**
 * Generate a random 16-bit fragment ID in 0x format
 * @returns {string}
 */
function randomId() {
  _idCounter = (_idCounter + 1) % 65536;
  const val = (Date.now() & 0xffff) ^ (_idCounter << 4);
  return '0x' + ((val & 0xffff) >>> 0).toString(16).padStart(4, '0');
}

/**
 * @typedef {Object} Fragment
 * @property {number} index - 分片序号（1-based）
 * @property {number} dataStart - 在原始报文中的起始字节
 * @property {number} dataEnd - 在原始报文中的结束字节
 * @property {number} dataLength - 本片数据长度（字节）
 * @property {string} id - 标识符（同一报文所有分片相同）
 * @property {boolean} mf - 还有更多分片（More Fragments）
 * @property {number} offset - 片偏移（8 字节为单位）
 * @property {number} offsetBytes - 片偏移 × 8 = 实际字节偏移
 * @property {string} explanation - 人类可读说明
 */

/**
 * @typedef {Object} FragmentResult
 * @property {number} totalBytes - 原始报文大小（可能被 clamp）
 * @property {number} headerSize - IP 头部固定 20 字节
 * @property {number} mtu - MTU 值（可能被 clamp）
 * @property {number} payloadPerFragment - 每片最大数据载荷
 * @property {Fragment[]} fragments - 分片列表
 * @property {number} totalFragments - 总分片数
 * @property {string} id - 所有分片共享的标识符
 */

/**
 * 将数据报按 MTU 拆分为 IP 分片
 * @param {number} datagramSize - 原始报文大小（字节）
 * @param {number} mtu - 最大传输单元（字节）
 * @returns {FragmentResult}
 */
function fragment(datagramSize, mtu) {
  // Clamp inputs
  const totalBytes = Math.min(Math.max(datagramSize, 0), MAX_DATAGRAM);
  const clampedMtu = Math.max(mtu, MIN_MTU);
  const payloadPerFragment = clampedMtu - IP_HEADER;
  const totalFragments = Math.ceil(totalBytes / payloadPerFragment);
  const id = randomId();

  const fragments = [];
  for (let i = 0; i < totalFragments; i++) {
    const dataStart = i * payloadPerFragment;
    const dataEnd = Math.min(dataStart + payloadPerFragment, totalBytes) - 1;
    const dataLength = dataEnd - dataStart + 1;
    const offset = Math.floor(dataStart / 8);
    const mf = i < totalFragments - 1;

    fragments.push({
      index: i + 1,
      dataStart: dataStart,
      dataEnd: dataEnd,
      dataLength: dataLength,
      id: id,
      mf: mf,
      offset: offset,
      offsetBytes: offset * 8,
      explanation: i < totalFragments - 1
        ? '分片 ' + (i + 1) + '：字节 ' + dataStart + '~' + dataEnd + '（' + dataLength + ' 字节）'
        : '分片 ' + (i + 1) + '（最后）：字节 ' + dataStart + '~' + dataEnd + '（' + dataLength + ' 字节）'
    });
  }

  return {
    totalBytes: totalBytes,
    headerSize: IP_HEADER,
    mtu: clampedMtu,
    payloadPerFragment: payloadPerFragment,
    fragments: fragments,
    totalFragments: totalFragments,
    id: id
  };
}

module.exports = { fragment: fragment, randomId: randomId };
