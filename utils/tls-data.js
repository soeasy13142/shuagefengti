/** TLS 1.3 密码套件 */
const CIPHER_SUITES = [
  { code: '0x1301', name: 'TLS_AES_128_GCM_SHA256', description: 'AES-128-GCM + SHA-256' },
  { code: '0x1302', name: 'TLS_AES_256_GCM_SHA384', description: 'AES-256-GCM + SHA-384' },
  { code: '0x1303', name: 'TLS_CHACHA20_POLY1305_SHA256', description: 'ChaCha20-Poly1305 + SHA-256' }
];

/** 支持的密钥交换群组 */
const SUPPORTED_GROUPS = [
  { code: '0x001d', name: 'X25519' },
  { code: '0x0017', name: 'secp256r1 (P-256)' },
  { code: '0x0018', name: 'secp384r1 (P-384)' }
];

/** 场景预设 */
const SCENARIOS = [
  {
    id: 'full',
    name: '初次握手',
    steps: 12,
    description: '完整的 TLS 1.3 初次握手：ClientHello → ServerHello → 证书 → 密钥派生 → Finished'
  },
  {
    id: 'psk',
    name: 'PSK 恢复',
    steps: 8,
    description: '基于 Pre-Shared Key 的会话恢复，跳过证书交换和完整的密钥派生'
  },
  {
    id: 'mitm',
    name: '中间人警告',
    steps: 7,
    description: '模拟中间人攻击场景：证书不匹配 → 客户端报警 → 握手终止'
  }
];

/** 证书链模板 */
const CERT_TEMPLATES = [
  { level: 0, subject: 'CN=example.com', issuer: 'CN=R3, O=Let\'s Encrypt' },
  { level: 1, subject: 'CN=R3, O=Let\'s Encrypt', issuer: 'CN=ISRG Root X1' },
  { level: 2, subject: 'CN=ISRG Root X1', issuer: 'CN=ISRG Root X1 (self-signed)' }
];

/** 随机种子值（简化模拟用，固定输出保证可预测） */
const SEED_VALUES = {
  clientRandom: 'e2:3a:4f:8b:1c:7d:9a:2e',
  serverRandom: 'b7:1c:3d:5e:8f:0a:2b:4c',
  clientKeyShare: 'ab:cd:ef:01:23:45:67:89',
  serverKeyShare: '98:76:54:32:10:fe:dc:ba'
};

module.exports = { CIPHER_SUITES, SUPPORTED_GROUPS, SCENARIOS, CERT_TEMPLATES, SEED_VALUES };
