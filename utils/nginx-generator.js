/**
 * Nginx Config Generator
 *
 * Pure functions: generateConfig(inputs) → string, validateInputs(inputs) → errors[]
 */

/**
 * Mozilla Intermediate cipher profile (broad compatibility)
 */
const CIPHER_PROFILES = {
  intermediate: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384',
  modern: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305',
};

/**
 * Strip trailing slash from a path
 * @param {string} str
 * @returns {string}
 */
function _stripTrailingSlash(str) {
  return str.replace(/\/+$/, '');
}

/**
 * Clean serverName: strip protocol, port, path
 * @param {string} name
 * @returns {string}
 */
function _cleanServerName(name) {
  return name
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:[\d]+/, '')
    .trim();
}

/**
 * Generate a single listen directive line
 * @param {object} inputs
 * @param {boolean} ipv6
 * @returns {string}
 */
function _listenLine(inputs, ipv6) {
  const prefix = ipv6 ? 'listen [::]:' : 'listen ';
  const port = inputs.listenPort;
  let line = prefix + port;

  if (inputs.enableSSL) {
    line += ' ssl';
    if (inputs.http2Enabled && inputs.nginxVersion === 'legacy') {
      line += ' http2';
    }
  }
  return line + ';';
}

/**
 * Generate the http2 on; directive (nginx >= 1.25.1 modern mode)
 * @param {object} inputs
 * @returns {string}
 */
function _http2Directive(inputs) {
  if (inputs.enableSSL && inputs.http2Enabled && inputs.nginxVersion === 'modern') {
    return '    http2 on;';
  }
  return '';
}

/**
 * Generate the OCSP stapling block
 * @param {object} inputs
 * @returns {string}
 */
function _ocspStapling(inputs) {
  if (!inputs.enableOCSPStapling) return '';
  return [
    '    ssl_stapling on;',
    '    ssl_stapling_verify on;',
    '    ssl_trusted_certificate ' + inputs.sslCertPath + ';',
    '    resolver 8.8.8.8 1.1.1.1;',
  ].join('\n');
}

/**
 * Generate the location / block content
 * @param {object} inputs
 * @returns {string}
 */
function _locationBlock(inputs) {
  const lines = [];
  lines.push('    location / {');

  if (inputs.proxyPass) {
    lines.push('        proxy_pass ' + inputs.proxyPass + ';');
    lines.push('');
    lines.push('        proxy_set_header Host $host;');
    lines.push('        proxy_set_header X-Real-IP $remote_addr;');
    lines.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
    lines.push('        proxy_set_header X-Forwarded-Proto $scheme;');
  } else if (inputs.rootDir) {
    lines.push('        try_files $uri $uri/ =404;');
  }

  lines.push('    }');
  return lines.join('\n');
}

/**
 * Generate security header lines
 * @param {object} inputs
 * @returns {string[]}
 */
function _securityHeaders(inputs) {
  const headers = [];
  if (inputs.enableHSTS) {
    let hsts = 'max-age=31536000; includeSubDomains';
    if (inputs.hstsPreload) hsts += '; preload';
    headers.push('    add_header Strict-Transport-Security "' + hsts + '" always;');
  }
  if (inputs.enableXContentTypeOptions) {
    headers.push('    add_header X-Content-Type-Options "nosniff" always;');
  }
  if (inputs.enableXFrameOptions) {
    headers.push('    add_header X-Frame-Options "SAMEORIGIN" always;');
  }
  if (inputs.enableReferrerPolicy) {
    headers.push('    add_header Referrer-Policy "strict-origin-when-cross-origin" always;');
  }
  return headers;
}

/**
 * Generate the main server block
 * @param {object} inputs
 * @returns {string}
 */
function _serverBlock(inputs) {
  const lines = [];
  lines.push('server {');

  // Listen
  lines.push('    ' + _listenLine(inputs, false));
  lines.push('    ' + _listenLine(inputs, true));

  // Server name
  const serverName = _cleanServerName(inputs.serverName);
  if (serverName) lines.push('    server_name ' + serverName + ';');

  lines.push('');

  // SSL
  if (inputs.enableSSL) {
    lines.push('    # SSL');
    lines.push('    ssl_certificate ' + inputs.sslCertPath + ';');
    lines.push('    ssl_certificate_key ' + inputs.sslKeyPath + ';');
    lines.push('    ssl_protocols ' + inputs.sslProtocols + ';');
    const ciphers = inputs.sslCiphers || 'CIPHER_PROFILES.' + (inputs.sslCipherProfile || 'intermediate');
    lines.push('    ssl_ciphers ' + ciphers + ';');
    lines.push('    ssl_prefer_server_ciphers off;');
    lines.push('    ssl_session_cache shared:SSL:10m;');
    lines.push('    ssl_session_timeout 1d;');
    const http2 = _http2Directive(inputs);
    if (http2) lines.push(http2);
    const ocsp = _ocspStapling(inputs);
    if (ocsp) lines.push(ocsp);
    lines.push('');
  }

  // Root / Index
  if (inputs.rootDir) {
    lines.push('    root ' + _stripTrailingSlash(inputs.rootDir) + ';');
  }
  if (inputs.indexFiles) {
    lines.push('    index ' + inputs.indexFiles + ';');
  }

  // Location
  if (inputs.rootDir || inputs.proxyPass) {
    lines.push('');
    lines.push(_locationBlock(inputs));
  }

  // Security headers
  const headers = _securityHeaders(inputs);
  if (headers.length > 0) {
    lines.push('');
    lines.push('    # Security');
    headers.forEach(function(h) { lines.push(h); });
  }

  // Client max body size
  if (inputs.clientMaxBodySize) {
    if (!lines.some(function(l) { return l.indexOf('# Security') >= 0; })) {
      lines.push('');
    }
    lines.push('    client_max_body_size ' + inputs.clientMaxBodySize + ';');
  }

  // Logging
  if (inputs.accessLogPath || inputs.errorLogPath) {
    lines.push('');
    lines.push('    # Logging');
    if (inputs.accessLogPath) lines.push('    access_log ' + inputs.accessLogPath + ';');
    if (inputs.errorLogPath) lines.push('    error_log ' + inputs.errorLogPath + ';');
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate HTTP→HTTPS redirect block
 * @param {object} inputs
 * @returns {string}
 */
function _redirectBlock(inputs) {
  const serverName = _cleanServerName(inputs.serverName);
  return [
    'server {',
    '    listen 80;',
    '    listen [::]:80;',
    '    server_name ' + serverName + ';',
    '    return 301 https://$host$request_uri;',
    '}',
  ].join('\n');
}

/**
 * Generate catch-all default_server block
 * @param {object} inputs
 * @returns {string}
 */
function _catchAllBlock(inputs) {
  const lines = [];
  // HTTP catch-all
  lines.push('server {');
  lines.push('    listen 80 default_server;');
  lines.push('    listen [::]:80 default_server;');
  lines.push('    server_name _;');
  lines.push('    return 444;');
  lines.push('}');
  lines.push('');
  // HTTPS catch-all
  lines.push('server {');
  lines.push('    listen 443 ssl default_server;');
  lines.push('    listen [::]:443 ssl default_server;');
  lines.push('    server_name _;');
  lines.push('    ssl_reject_handshake on;');
  lines.push('    return 444;');
  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate complete nginx config from inputs
 * @param {object} inputs - Form input values
 * @returns {string} Formatted nginx config
 */
function generateConfig(inputs) {
  const blocks = [];

  if (inputs.enableRedirect) {
    blocks.push(_redirectBlock(inputs));
  }

  blocks.push(_serverBlock(inputs));

  if (inputs.enableCatchAll) {
    blocks.push(_catchAllBlock(inputs));
  }

  return blocks.join('\n\n');
}

/**
 * Validate form inputs
 * @param {object} inputs - Form input values
 * @returns {Array<{field: string, message: string}>} Array of errors, empty if valid
 */
function validateInputs(inputs) {
  const errors = [];

  // serverName
  if (!inputs.serverName || !inputs.serverName.trim()) {
    errors.push({ field: 'serverName', message: '请输入域名' });
  } else {
    const cleaned = _cleanServerName(inputs.serverName);
    if (!cleaned || /[\/:?#]/.test(cleaned)) {
      errors.push({ field: 'serverName', message: '域名格式无效' });
    } else {
      const labels = cleaned.split('.');
      for (let i = 0; i < labels.length; i++) {
        if (labels[i] !== '*' && labels[i] !== '_' && labels[i].length > 63) {
          errors.push({ field: 'serverName', message: '域名标签不能超过 63 个字符' });
          break;
        }
      }
    }
  }

  // Port
  const port = parseInt(inputs.listenPort, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push({ field: 'listenPort', message: '端口范围 1-65535' });
  }

  // SSL paths
  if (inputs.enableSSL) {
    if (!inputs.sslCertPath || !inputs.sslCertPath.trim()) {
      errors.push({ field: 'sslCertPath', message: 'HTTPS 需要 SSL 证书路径' });
    } else if (inputs.sslCertPath.charAt(0) !== '/') {
      errors.push({ field: 'sslCertPath', message: '请输入绝对路径' });
    }
    if (!inputs.sslKeyPath || !inputs.sslKeyPath.trim()) {
      errors.push({ field: 'sslKeyPath', message: 'HTTPS 需要 SSL 密钥路径' });
    } else if (inputs.sslKeyPath.charAt(0) !== '/') {
      errors.push({ field: 'sslKeyPath', message: '请输入绝对路径' });
    }
  }

  // rootDir
  if (inputs.rootDir && inputs.rootDir.charAt(0) !== '/') {
    errors.push({ field: 'rootDir', message: '请输入绝对路径，如 /var/www/html' });
  }

  // proxyPass
  if (inputs.proxyPass && !/^https?:\/\//.test(inputs.proxyPass)) {
    errors.push({ field: 'proxyPass', message: '请输入有效 URL，如 http://localhost:3000' });
  }

  // clientMaxBodySize
  if (inputs.clientMaxBodySize && !/^\d+[kKmMgG]$/.test(inputs.clientMaxBodySize)) {
    errors.push({ field: 'clientMaxBodySize', message: '格式如 10m / 50k / 1g' });
  }

  return errors;
}

module.exports = {
  generateConfig,
  validateInputs,
  CIPHER_PROFILES,
};
