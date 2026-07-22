const { SEED_VALUES } = require('./tls-data');

/**
 * 模拟 ECDHE 密钥交换（简化版，固定输出）
 * @param {object} seed - 种子值（可选，缺省使用 SEED_VALUES）
 * @returns {{ sharedSecret: string, clientPublic: string, serverPublic: string }}
 */
function simulateEcdhe(seed) {
  const s = seed || SEED_VALUES;
  return {
    clientPublic: s.clientKeyShare,
    serverPublic: s.serverKeyShare,
    // 共享密钥 = clientPrivate * serverPublic （简化模拟）
    sharedSecret: 'df:4a:1e:8c:3b:7f:02:6d:5a:9e:1c:4f:8b:0d:3e:7a'
  };
}

/**
 * HKDF 派生 4 组对称密钥 + IV（简化模拟）
 * @param {string} sharedSecret - 共享密钥 hex
 * @returns {object} 派生密钥对象
 */
function deriveTrafficKeys(sharedSecret) {
  // 模拟 HKDF 展开：基于 sharedSecret 生成确定性输出
  // 实际实现中应使用 HKDF-Extract + HKDF-Expand，此处简化模拟
  const handshakeSecret = sharedSecret ? sharedSecret.slice(0, 10) + '5e:2a' : 'ff:00:00:00:00:00:00:01';

  return {
    handshakeSecret,
    serverTrafficKey: '3a:1f:8c:4d:7e:2b:9a:5c:1e:6d:8f:0a:3b:7c:4d:9e',
    serverTrafficIV: '5d:8a:3c:1e:7f:2b:9d:4a',
    clientTrafficKey: '1e:3a:8b:5c:7d:2f:9a:4e:6c:1d:8f:0b:3a:7e:4c:9d',
    clientTrafficIV: '2b:7e:4a:9d:1c:5f:8a:3d',
    appTrafficKey: '4c:9a:2e:7b:1f:8d:3a:5c:6e:0a:4f:8b:1d:7e:3c:9a',
    appTrafficIV: '7e:1d:4a:8c:0b:3f:6a:2d'
  };
}

module.exports = { simulateEcdhe, deriveTrafficKeys };
