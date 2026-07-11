/**
 * 子网计算器纯函数模块
 * 提供 IP 地址解析、CIDR 子网计算、二进制转换、地址分类等功能
 */

/**
 * 验证 IP 地址格式
 * @param {string} ipStr - IP 地址字符串（四段十进制，用 . 分隔）
 * @returns {boolean}
 */
function validateIp(ipStr) {
  if (!ipStr || typeof ipStr !== 'string') return false;
  const parts = ipStr.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    if (!/^\d+$/.test(p)) return false;
    const n = Number(p);
    return n >= 0 && n <= 255;
  });
}

/**
 * 验证 CIDR 前缀长度
 * @param {number} cidr
 * @returns {boolean}
 */
function validateCidr(cidr) {
  return typeof cidr === 'number' && cidr >= 0 && cidr <= 32 && Number.isInteger(cidr);
}

/**
 * 解析 IP 地址字符串为四段数组
 * @param {string} ipStr
 * @returns {number[]|null} 四段数组或 null
 */
function parseIp(ipStr) {
  if (!validateIp(ipStr)) return null;
  return ipStr.split('.').map(Number);
}

/**
 * 将四段 IP 转为 32 位二进制字符串数组（每段 8 位）
 * @param {number[]} ipArr - 四段数组
 * @returns {string[]} 4 个 8 位二进制字符串
 */
function ipToBinary(ipArr) {
  return ipArr.map(n => n.toString(2).padStart(8, '0'));
}

/**
 * 将 CIDR 前缀长度转为子网掩码四段数组
 * @param {number} cidr - 0~32
 * @returns {number[]} 四段掩码
 */
function cidrToMask(cidr) {
  if (!validateCidr(cidr)) return null;
  // 用 >>> 0 确保无符号右移
  const mask = cidr === 0 ? 0 : (~((1 << (32 - cidr)) - 1)) >>> 0;
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff
  ];
}

/**
 * 两组四段数组按位 AND
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function _and(a, b) {
  return a.map((v, i) => v & b[i]);
}

/**
 * 两组四段数组按位 OR
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function _or(a, b) {
  return a.map((v, i) => v | b[i]);
}

/**
 * 按位取反（对 32 位掩码）
 * @param {number[]} arr
 * @returns {number[]}
 */
function _not(arr) {
  return arr.map(v => (~v) & 0xff);
}

/**
 * 四段数组转十进制字符串
 * @param {number[]} arr
 * @returns {string}
 */
function _toStr(arr) {
  return arr.join('.');
}

/**
 * 计算子网信息
 * @param {string} ipStr - IP 地址字符串
 * @param {number} cidr - CIDR 前缀长度
 * @returns {object|null} 计算结果对象，输入非法返回 null
 */
function calculateSubnet(ipStr, cidr) {
  const ipArr = parseIp(ipStr);
  if (!ipArr) return null;
  if (!validateCidr(cidr)) return null;

  const maskArr = cidrToMask(cidr);
  const networkArr = _and(ipArr, maskArr);
  const wildcardArr = _not(maskArr);
  const broadcastArr = _or(networkArr, wildcardArr);

  // 首末可用主机
  const firstHostArr = networkArr.slice();
  firstHostArr[3] = (firstHostArr[3] | 1) & 0xff;

  const lastHostArr = broadcastArr.slice();
  lastHostArr[3] = (lastHostArr[3] & 0xfe) & 0xff;

  // 可用主机数
  const hostBits = 32 - cidr;
  let totalHosts;
  if (cidr === 32) {
    totalHosts = 1;
  } else if (cidr === 31) {
    totalHosts = 2;
  } else {
    totalHosts = Math.pow(2, hostBits) - 2;
  }

  const ipBinary = ipToBinary(ipArr);
  const maskBinary = ipToBinary(maskArr);
  const networkBinary = ipToBinary(networkArr);
  const broadcastBinary = ipToBinary(broadcastArr);

  const classification = classifyIp(ipArr);

  return {
    inputIp: ipArr,
    cidr: cidr,
    ipBinary: ipBinary,
    maskBinary: maskBinary,
    networkBinary: networkBinary,
    broadcastBinary: broadcastBinary,
    subnetMask: _toStr(maskArr),
    networkAddress: _toStr(networkArr),
    broadcastAddress: _toStr(broadcastArr),
    firstHost: _toStr(firstHostArr),
    lastHost: _toStr(lastHostArr),
    totalHosts: totalHosts,
    ipClass: classification.ipClass,
    isPrivate: classification.isPrivate,
    description: classification.description
  };
}

/**
 * IP 地址分类
 * @param {number[]} ipArr - 四段数组
 * @returns {object} { ipClass, isPrivate, description }
 */
function classifyIp(ipArr) {
  const a = ipArr[0];
  const b = ipArr[1];

  let ipClass = '';
  let isPrivate = false;
  let description = '';

  // 特殊地址判断
  if (a === 0) {
    return { ipClass: '特殊', isPrivate: false, description: '当前网络（保留地址）' };
  }
  if (a === 127) {
    return { ipClass: '特殊', isPrivate: true, description: '环回地址（Loopback）' };
  }
  if (a === 169 && b === 254) {
    return { ipClass: '特殊', isPrivate: false, description: '链路本地地址（Link-Local）' };
  }
  if (a === 255 && ipArr[1] === 255 && ipArr[2] === 255 && ipArr[3] === 255) {
    return { ipClass: '特殊', isPrivate: false, description: '受限广播地址' };
  }

  // A/B/C/D/E 类
  if (a >= 1 && a <= 126) {
    ipClass = 'A';
    isPrivate = a === 10;
    description = isPrivate ? 'A 类私有地址' : 'A 类公有地址';
  } else if (a >= 128 && a <= 191) {
    ipClass = 'B';
    isPrivate = (a === 172 && b >= 16 && b <= 31);
    description = isPrivate ? 'B 类私有地址' : 'B 类公有地址';
  } else if (a >= 192 && a <= 223) {
    ipClass = 'C';
    isPrivate = (a === 192 && b === 168);
    description = isPrivate ? 'C 类私有地址' : 'C 类公有地址';
  } else if (a >= 224 && a <= 239) {
    ipClass = 'D';
    description = 'D 类组播地址';
  } else if (a >= 240 && a <= 255) {
    ipClass = 'E';
    description = 'E 类保留地址';
  }

  return { ipClass, isPrivate, description };
}

/**
 * 生成 AND 运算步骤（用于动画演示）
 * @param {string[]} ipBinary - IP 二进制数组（4 个 8 位字符串）
 * @param {string[]} maskBinary - 掩码二进制数组
 * @param {string} mode - 'octet'（逐字节，4步）或 'bit'（逐位，32步）
 * @returns {object[]} 步骤数组
 */
function generateAndSteps(ipBinary, maskBinary, mode) {
  if (!Array.isArray(ipBinary) || !Array.isArray(maskBinary)) return [];
  if (ipBinary.length !== 4 || maskBinary.length !== 4) return [];
  if (mode !== 'octet' && mode !== 'bit') return [];

  const steps = [];

  if (mode === 'octet') {
    for (let i = 0; i < 4; i++) {
      const ipOctet = ipBinary[i];
      const maskOctet = maskBinary[i];
      let resultOctet = '';
      for (let b = 0; b < 8; b++) {
        resultOctet += (ipOctet[b] === '1' && maskOctet[b] === '1') ? '1' : '0';
      }
      steps.push({
        type: 'and-octet',
        octetIndex: i,
        ipBits: ipOctet,
        maskBits: maskOctet,
        resultBits: resultOctet,
        ipDecimal: parseInt(ipOctet, 2),
        maskDecimal: parseInt(maskOctet, 2),
        resultDecimal: parseInt(resultOctet, 2),
        desc: '第' + (i + 1) + '段 AND：' + parseInt(ipOctet, 2) + ' AND ' + parseInt(maskOctet, 2) + ' = ' + parseInt(resultOctet, 2)
      });
    }
  } else {
    for (let octet = 0; octet < 4; octet++) {
      for (let bit = 0; bit < 8; bit++) {
        const globalIdx = octet * 8 + bit;
        const ipBit = ipBinary[octet][bit];
        const maskBit = maskBinary[octet][bit];
        const resultBit = (ipBit === '1' && maskBit === '1') ? '1' : '0';
        steps.push({
          type: 'and-bit',
          bitIndex: globalIdx,
          octetIndex: octet,
          ipBit: ipBit,
          maskBit: maskBit,
          resultBit: resultBit,
          desc: '第' + (globalIdx + 1) + '位：' + ipBit + ' AND ' + maskBit + ' = ' + resultBit
        });
      }
    }
  }

  // 计算最终网络地址
  const resultBinary = [];
  for (let oi = 0; oi < 4; oi++) {
    let res = '';
    for (let bi = 0; bi < 8; bi++) {
      res += (ipBinary[oi][bi] === '1' && maskBinary[oi][bi] === '1') ? '1' : '0';
    }
    resultBinary.push(res);
  }
  const resultDecimal = resultBinary.map(function(s) { return parseInt(s, 2); }).join('.');

  steps.push({
    type: 'done',
    resultBinary: resultBinary,
    resultDecimal: resultDecimal,
    desc: 'AND 运算完成！网络地址 = ' + resultDecimal
  });

  return steps;
}

module.exports = {
  validateIp,
  validateCidr,
  parseIp,
  ipToBinary,
  cidrToMask,
  calculateSubnet,
  classifyIp,
  generateAndSteps
};
