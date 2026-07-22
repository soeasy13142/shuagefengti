const { CIPHER_SUITES, SUPPORTED_GROUPS, CERT_TEMPLATES, SCENARIOS } = require('./tls-data');
const { simulateEcdhe, deriveTrafficKeys } = require('./tls-crypto');

/**
 * 为指定场景生成握手步骤序列
 * @param {'full'|'psk'|'mitm'} scenarioId
 * @returns {Array} HandshakeStep[]
 */
function generateSteps(scenarioId) {
  switch (scenarioId) {
    case 'full': return _buildFullHandshake();
    case 'psk': return _buildPskResumption();
    case 'mitm': return _buildMitmWarning();
    default: return [];
  }
}

function _buildFullHandshake() {
  const ecdhe = simulateEcdhe();
  const keys = deriveTrafficKeys(ecdhe.sharedSecret);

  return [
    {
      step: 0, from: 'client', to: 'server', type: 'handshake',
      payload: {
        label: 'ClientHello',
        fields: [
          { name: 'version', value: 'TLS 1.3 (0x0304)', highlight: true },
          { name: 'cipher_suites', value: CIPHER_SUITES.map(c => c.code + ' ' + c.name).join('; ') },
          { name: 'key_share', value: 'X25519: ' + ecdhe.clientPublic },
          { name: 'supported_groups', value: SUPPORTED_GROUPS.map(g => g.name).join(', ') },
          { name: 'random', value: 'e2:3a:4f:8b:1c:7d:9a:2e...', note: '客户端随机数' }
        ]
      },
      explanation: '客户端发起握手，提供支持的密码套件列表和密钥交换参数。',
      examTip: 'TLS 1.3 在 ClientHello 中直接携带 key_share，减少 1-RTT'
    },
    {
      step: 1, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'ServerHello',
        fields: [
          { name: 'version', value: 'TLS 1.3 (0x0304)' },
          { name: 'cipher_suite', value: 'TLS_AES_128_GCM_SHA256 (0x1301)', highlight: true },
          { name: 'key_share', value: 'X25519: ' + ecdhe.serverPublic },
          { name: 'random', value: 'b7:1c:3d:5e:8f:0a:2b:4c...', note: '服务端随机数' }
        ]
      },
      explanation: '服务端选定密码套件并返回其密钥交换参数，双方此时可计算 ECDHE 共享密钥。',
      examTip: 'ServerHello 中的 cipher_suite 决定了后续所有加密参数的算法选择'
    },
    {
      step: 2, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'EncryptedExtensions',
        fields: [
          { name: 'server_name', value: 'example.com' },
          { name: 'supported_versions', value: 'TLS 1.3' },
          { name: 'max_fragment_length', value: '2^14 = 16384 bytes' }
        ]
      },
      explanation: '服务端发送加密扩展信息，从此时起所有 Server 消息已被握手密钥加密。'
    },
    {
      step: 3, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'Certificate',
        fields: [
          { name: 'certificate_type', value: 'X.509 v3' },
          { name: 'cert_chain_length', value: String(CERT_TEMPLATES.length) }
        ],
        extra: {
          certChain: CERT_TEMPLATES.map(t => t.subject)
        }
      },
      explanation: '服务端发送证书链，包含站点证书和中间 CA 证书。',
      examTip: 'TLS 1.3 的 Certificate 消息始终被加密，提升了握手阶段的隐私性'
    },
    {
      step: 4, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'CertificateVerify',
        fields: [
          { name: 'signature_algorithm', value: 'rsa_pss_rsae_sha256' },
          { name: 'signature', value: 'ab:cd:ef:01:23:45:67:89...', note: '仅展示前 8 字节' }
        ]
      },
      explanation: '服务端用证书私钥对握手上下文签名，客户端验证签名确认真实性。'
    },
    {
      step: 5, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'Finished',
        fields: [
          { name: 'verify_data', value: '4a:1e:8c:3b:7f:02:6d:5a...', note: 'HMAC of handshake transcript' }
        ]
      },
      explanation: '服务端发送 Finished 消息，提供整个握手过程的 MAC 校验值。'
    },
    {
      step: 6, from: 'client', to: 'server', type: 'handshake',
      payload: {
        label: 'Finished',
        fields: [
          { name: 'verify_data', value: '3a:8b:5c:7d:2f:9a:4e:6c...', note: 'HMAC of handshake transcript' }
        ]
      },
      explanation: '客户端发送 Finished 消息，双方完成握手认证。'
    },
    {
      step: 7, from: 'client', to: 'server', type: 'keyDerive',
      payload: {
        label: '密钥派生',
        fields: [
          { name: '协商曲线', value: 'X25519' },
          { name: '密钥交换', value: 'ECDHE' },
          { name: 'KDF', value: 'HKDF-SHA256' }
        ]
      },
      derivedKeys: {
        handshakeSecret: keys.handshakeSecret,
        serverTrafficKey: keys.serverTrafficKey,
        serverTrafficIV: keys.serverTrafficIV,
        clientTrafficKey: keys.clientTrafficKey,
        clientTrafficIV: keys.clientTrafficIV,
        appTrafficKey: keys.appTrafficKey,
        appTrafficIV: keys.appTrafficIV
      },
      explanation: '双方基于 ECDHE 共享密钥，通过 HKDF-Extract + HKDF-Expand 派生出 4 组对称密钥 + IV。',
      examTip: 'TLS 1.3 每次握手独立派生密钥，前向安全性（Forward Secrecy）由此保证'
    },
    {
      step: 8, from: 'client', to: 'server', type: 'handshake',
      payload: {
        label: 'Application Data',
        fields: [
          { name: 'protocol', value: 'HTTP/1.1 (over TLS)' },
          { name: 'encrypted', value: 'yes - 使用 clientTrafficKey 加密' }
        ]
      },
      explanation: '安全连接已建立，开始加密通信。',
      examTip: 'TLS 1.3 初次握手仅需 1-RTT 即可开始发送应用数据'
    },
    {
      step: 9, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'Application Data',
        fields: [
          { name: 'protocol', value: 'HTTP/1.1 (over TLS)' },
          { name: 'encrypted', value: 'yes - 使用 serverTrafficKey 加密' }
        ]
      },
      explanation: '服务端发送加密响应。'
    },
    {
      step: 10, from: 'client', to: 'server', type: 'handshake',
      payload: {
        label: 'Change Cipher Spec',
        fields: [
          { name: 'message', value: '1 (0x01)', note: '表示后续记录将使用新密码参数' }
        ]
      },
      explanation: '客户端通知切换到已协商的安全参数。'
    },
    {
      step: 11, from: '-', to: '-', type: 'summary',
      payload: {
        label: '安全连接已建立',
        fields: [
          { name: '版本', value: 'TLS 1.3' },
          { name: '密码套件', value: 'TLS_AES_128_GCM_SHA256' },
          { name: '密钥交换', value: 'ECDHE X25519' },
          { name: '总 RTT', value: '1-RTT (初次握手)' }
        ]
      },
      explanation: 'TLS 1.3 握手完成。双方使用派生的对称密钥进行加密通信，中间人无法解密。'
    }
  ];
}

function _buildPskResumption() {
  return [
    {
      step: 0, from: 'client', to: 'server', type: 'handshake',
      payload: {
        label: 'ClientHello (with PSK)',
        fields: [
          { name: 'version', value: 'TLS 1.3 (0x0304)' },
          { name: 'pre_shared_key', value: 'ticket: a1:b2:c3:d4:e5:f6...', note: '会话票证' },
          { name: 'psk_key_exchange_modes', value: 'psk_dhe_ke' },
          { name: 'cipher_suites', value: 'TLS_AES_128_GCM_SHA256' }
        ]
      },
      explanation: '客户端在 ClientHello 中携带 PSK 会话票证，请求快速恢复会话。',
      examTip: 'PSK 模式无需证书交换，适合短连接频繁的场景（如 HTTP/2）'
    },
    {
      step: 1, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'ServerHello (with PSK)',
        fields: [
          { name: 'version', value: 'TLS 1.3 (0x0304)' },
          { name: 'cipher_suite', value: 'TLS_AES_128_GCM_SHA256' },
          { name: 'pre_shared_key', value: 'selected: index 0' }
        ]
      },
      explanation: '服务端确认使用 PSK 模式，跳过证书交换与验证。',
      note: 'PSK 模式无证书交换'
    },
    {
      step: 2, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'EncryptedExtensions',
        fields: [
          { name: 'early_data', value: 'not permitted' }
        ]
      },
      explanation: '服务端发送加密扩展，指示不支持 0-RTT 早发数据。'
    },
    {
      step: 3, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'Finished',
        fields: [
          { name: 'verify_data', value: '8e:1d:3c:5a:7f:2b:4e:9c...' }
        ]
      },
      explanation: '服务端发送 Finished 消息。'
    },
    {
      step: 4, from: 'client', to: 'server', type: 'handshake',
      payload: {
        label: 'Finished',
        fields: [
          { name: 'verify_data', value: '2d:9a:4e:7c:1b:3f:8e:5a...' }
        ]
      },
      explanation: '客户端发送 Finished 消息，完成 PSK 握手。'
    },
    {
      step: 5, from: 'client', to: 'server', type: 'keyDerive',
      payload: {
        label: '密钥派生 (PSK)',
        fields: [
          { name: '密钥来源', value: 'PSK + (optional) ECDHE' }
        ]
      },
      derivedKeys: {
        handshakeSecret: 'fh:3a:8c:1e:6d:9b:4f:2a:7e:5c:0d:8f:3a:1b:7e:4c',
        serverTrafficKey: '2a:7e:4c:9d:1f:8b:3a:5e:6c:0d:4f:8a:1e:7b:3c:9d',
        serverTrafficIV: '1c:5e:8a:3d:7f:2b:4e:9a',
        clientTrafficKey: '3e:8c:1a:5d:7f:2b:9a:4e:6c:0d:8f:1b:3a:7e:4c:9d',
        clientTrafficIV: '4a:8d:1c:5f:9e:2b:7a:3e',
        appTrafficKey: '5c:9d:2e:7a:1f:8b:3c:4e:6a:0d:8f:1e:4b:7c:3a:9d',
        appTrafficIV: '2e:7a:4c:8d:0b:3f:1a:5e'
      },
      explanation: '基于 PSK 派生会话密钥，无需完整的 ECDHE 密钥交换。',
      examTip: 'PSK 恢复可在 0-RTT 内完成（如果支持 early_data），比初次握手快一个往返'
    },
    {
      step: 6, from: 'client', to: 'server', type: 'handshake',
      payload: {
        label: 'Application Data',
        fields: [{ name: 'encrypted', value: 'yes' }]
      },
      explanation: '安全连接已恢复，开始加密通信。'
    },
    {
      step: 7, from: '-', to: '-', type: 'summary',
      payload: {
        label: 'PSK 恢复完成',
        fields: [
          { name: '模式', value: 'PSK (Pre-Shared Key)' },
          { name: '证书交换', value: '跳过', note: 'PSK 模式无证书交换' },
          { name: 'RTT', value: '1-RTT (支持 0-RTT early_data)' }
        ]
      },
      explanation: 'TLS 1.3 PSK 恢复握手完成，显著节省了证书传输的带宽和验证时间。'
    }
  ];
}

function _buildMitmWarning() {
  return [
    {
      step: 0, from: 'client', to: 'server', type: 'handshake',
      payload: {
        label: 'ClientHello',
        fields: [
          { name: 'version', value: 'TLS 1.3 (0x0304)' },
          { name: 'cipher_suites', value: 'TLS_AES_128_GCM_SHA256' },
          { name: 'key_share', value: 'X25519: ab:cd:ef:01:23:45...' }
        ]
      },
      explanation: '客户端发起握手。'
    },
    {
      step: 1, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'ServerHello',
        fields: [
          { name: 'version', value: 'TLS 1.3 (0x0304)' },
          { name: 'cipher_suite', value: 'TLS_AES_128_GCM_SHA256' }
        ]
      },
      explanation: '服务端响应握手。'
    },
    {
      step: 2, from: 'server', to: 'client', type: 'handshake',
      payload: {
        label: 'Certificate',
        fields: [
          { name: 'certificate_type', value: 'X.509 v3' },
          { name: 'subject', value: 'CN=evil-proxy.com', highlight: true, note: '⚠ 证书域名与请求不匹配' }
        ],
        extra: {
          certChain: ['CN=evil-proxy.com', 'CN=Fake CA']
        }
      },
      explanation: '服务端返回的证书域名与客户端请求的域名不匹配，可能正在遭受中间人攻击。',
      examTip: '浏览器遇到证书域名不匹配时会显示安全警告，但低层 API 可能直接拒绝连接'
    },
    {
      step: 3, from: 'client', to: 'server', type: 'alert',
      payload: {
        label: 'Alert: Bad Certificate',
        fields: [
          { name: 'alert_level', value: 'fatal (2)', highlight: true },
          { name: 'alert_description', value: 'bad_certificate (42)' },
          { name: 'message', value: '证书域名不匹配，连接终止' }
        ]
      },
      explanation: '客户端验证证书失败，发送 fatal 级别 Alert 消息并立即终止连接。'
    },
    {
      step: 4, from: 'server', to: 'client', type: 'alert',
      payload: {
        label: 'Alert: Close Notify',
        fields: [
          { name: 'alert_level', value: 'warning (1)' },
          { name: 'alert_description', value: 'close_notify (0)' }
        ]
      },
      explanation: '服务端收到 Bad Certificate 告警后发送 Close Notify 确认关闭。'
    },
    {
      step: 5, from: '-', to: '-', type: 'handshake',
      payload: {
        label: '连接终止',
        fields: [
          { name: '状态', value: '握手失败', highlight: true },
          { name: '原因', value: '证书验证失败' }
        ]
      },
      explanation: '由于证书验证失败，TLS 握手未能完成，安全连接未建立。'
    },
    {
      step: 6, from: '-', to: '-', type: 'summary',
      payload: {
        label: '攻击已被拦截',
        fields: [
          { name: '攻击类型', value: '中间人 / 证书欺骗' },
          { name: '阻断机制', value: '证书域名校验' },
          { name: '用户操作', value: '检查网络环境，确认 HTTPS 证书有效性' }
        ]
      },
      explanation: 'TLS 的证书验证机制成功阻止了中间人攻击——客户端未与攻击者建立安全连接。',
      examTip: '中间人攻击是 TLS 最经典的威胁场景，证书颁发机构（CA）是信任链的基石'
    }
  ];
}

module.exports = { generateSteps };
