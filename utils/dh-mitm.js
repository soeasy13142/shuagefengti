/**
 * DHCP 中间人攻击（MITM）模拟
 *
 * 生成完整的 MITM 场景：
 * - Alice 发公钥 A → Eve 拦截 → Eve 替换为 E_a → 转发给 Bob
 * - Bob 发公钥 B → Eve 拦截 → Eve 替换为 E_b → 转发给 Alice
 * - Alice 计算 K_ae = E_b^a mod p
 * - Bob 计算 K_be = E_a^b mod p
 * - Eve 同时计算两个共享密钥
 */

const { modPow, generateKeypair, computeSharedKey } = require('./dh-core');

/**
 * 生成 MITM 攻击场景
 *
 * @param {number} p - 素数
 * @param {number} g - 本原根
 * @param {number} alicePriv - Alice 私钥
 * @param {number} bobPriv - Bob 私钥
 * @param {number} evePriv - Eve 私钥
 * @returns {{
 *   alice: { name: string, privateKey: number, publicKey: number, receivedPublicKey: number, sharedKey: number },
 *   bob: { name: string, privateKey: number, publicKey: number, receivedPublicKey: number, sharedKey: number },
 *   eve: { name: string, privateKey: number, publicKey: number, sharedKeyAlice: number, sharedKeyBob: number },
 *   steps: Array<{ step: number, from: string, to: string, type: string, payload: { key?: number, explanation: string }, mitm?: boolean }>
 * }}
 */
function generateMitmScenario(p, g, alicePriv, bobPriv, evePriv) {
  // 生成各参与者的密钥对
  const aliceKey = generateKeypair(p, g, alicePriv);
  const bobKey = generateKeypair(p, g, bobPriv);
  const eveKey = generateKeypair(p, g, evePriv);

  // Alice 发送公钥 A → Eve 拦截 → 转发 E_a（Eve 的公钥）给 Bob
  // Alice 以为收到了 Bob 的公钥，实际收到了 E_b（Eve 的另一身份）
  // Bob 以为收到了 Alice 的公钥，实际收到了 E_a

  // Eve 计算与 Alice 和 Bob 的共享密钥
  const eveSharedAlice = computeSharedKey(aliceKey.publicKey, evePriv, p);
  const eveSharedBob = computeSharedKey(bobKey.publicKey, evePriv, p);

  // Alice 计算共享密钥（Eve 冒用 Bob 身份）
  const aliceShared = computeSharedKey(eveKey.publicKey, alicePriv, p);

  // Bob 计算共享密钥（Eve 冒用 Alice 身份）
  const bobShared = computeSharedKey(eveKey.publicKey, bobPriv, p);

  // 构建步骤数组
  const steps = [
    {
      step: 1,
      from: 'Alice',
      to: 'Eve',
      type: 'sendPublicKey',
      payload: {
        key: aliceKey.publicKey,
        explanation: 'Alice 发送公钥 A=' + aliceKey.publicKey + ' 给 Bob'
      }
    },
    {
      step: 2,
      from: 'Eve',
      to: 'Alice',
      type: 'mitmIntercept',
      mitm: true,
      payload: {
        explanation: 'Eve 拦截 Alice 的公钥 A=' + aliceKey.publicKey + '，将自身公钥 E_a=' + eveKey.publicKey + ' 伪装成 Alice 的公钥发给 Bob'
      }
    },
    {
      step: 3,
      from: 'Eve',
      to: 'Bob',
      type: 'sendPublicKey',
      mitm: true,
      payload: {
        key: eveKey.publicKey,
        explanation: 'Bob 收到伪装公钥 E_a=' + eveKey.publicKey + '，以为是 Alice 的公钥'
      }
    },
    {
      step: 4,
      from: 'Bob',
      to: 'Eve',
      type: 'sendPublicKey',
      payload: {
        key: bobKey.publicKey,
        explanation: 'Bob 发送公钥 B=' + bobKey.publicKey + ' 给 Alice'
      }
    },
    {
      step: 5,
      from: 'Eve',
      to: 'Bob',
      type: 'mitmIntercept',
      mitm: true,
      payload: {
        explanation: 'Eve 拦截 Bob 的公钥 B=' + bobKey.publicKey + '，将自身公钥 E_b=' + eveKey.publicKey + ' 伪装成 Bob 的公钥发给 Alice'
      }
    },
    {
      step: 6,
      from: 'Eve',
      to: 'Alice',
      type: 'sendPublicKey',
      mitm: true,
      payload: {
        key: eveKey.publicKey,
        explanation: 'Alice 收到伪装公钥 E_b=' + eveKey.publicKey + '，以为是 Bob 的公钥'
      }
    },
    {
      step: 7,
      from: 'Alice',
      to: 'Alice',
      type: 'computeSharedKey',
      payload: {
        key: aliceShared,
        explanation: 'Alice 计算共享密钥 K_ae = E_b^a mod p = ' + aliceShared
      }
    },
    {
      step: 8,
      from: 'Bob',
      to: 'Bob',
      type: 'computeSharedKey',
      payload: {
        key: bobShared,
        explanation: 'Bob 计算共享密钥 K_be = E_a^b mod p = ' + bobShared
      }
    },
    {
      step: 9,
      from: 'Eve',
      to: 'Eve',
      type: 'computeSharedKey',
      mitm: true,
      payload: {
        key: eveSharedAlice,
        explanation: 'Eve 计算与 Alice 的共享密钥 K_ae = A^e mod p = ' + eveSharedAlice
      }
    },
    {
      step: 10,
      from: 'Eve',
      to: 'Eve',
      type: 'computeSharedKey',
      mitm: true,
      payload: {
        key: eveSharedBob,
        explanation: 'Eve 计算与 Bob 的共享密钥 K_be = B^e mod p = ' + eveSharedBob
      }
    }
  ];

  return {
    alice: {
      name: 'Alice',
      privateKey: alicePriv,
      publicKey: aliceKey.publicKey,
      receivedPublicKey: eveKey.publicKey,
      sharedKey: aliceShared
    },
    bob: {
      name: 'Bob',
      privateKey: bobPriv,
      publicKey: bobKey.publicKey,
      receivedPublicKey: eveKey.publicKey,
      sharedKey: bobShared
    },
    eve: {
      name: 'Eve',
      privateKey: evePriv,
      publicKey: eveKey.publicKey,
      sharedKeyAlice: eveSharedAlice,
      sharedKeyBob: eveSharedBob
    },
    steps: steps
  };
}

module.exports = {
  generateMitmScenario
};
