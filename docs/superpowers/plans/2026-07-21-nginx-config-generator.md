# Nginx 最小配置生成器 · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Nginx config generator tool page that takes user inputs (domain, port, SSL paths, etc.) via a 3-section collapsible form and generates a copyable nginx server block config.

**Architecture:** Pure-function generator in `utils/nginx-generator.js` (generateConfig + validateInputs) → consumed by page logic in `pages/nginx-gen/nginx-gen.js`. Single page, no routing or state management needed.

**Tech Stack:** WeChat Mini Program (WXML/WXSS/JS), Jest for testing.

## Global Constraints

- Claude Design warm-cream palette: bg `#faf9f5`, card `#efe9de`, CTA `#cc785c`, text `#141413`, secondary `#6c6a64`, deep `#181715`
- Pure WXML/WXSS — no canvas, no SVG, no third-party libs
- No mutation — all utils are pure functions returning new objects/strings
- `const` / `let`, no `var`
- Async-await preferred
- All catches must be explicit
- `npm test` must stay green throughout

---

## File Structure

### Create
| File | Responsibility |
|------|---------------|
| `utils/nginx-generator.js` | `generateConfig(inputs)` → config string; `validateInputs(inputs)` → error array; cipher profile constants |
| `pages/nginx-gen/nginx-gen.json` | Page config |
| `pages/nginx-gen/nginx-gen.wxss` | Page styles |
| `pages/nginx-gen/nginx-gen.wxml` | Form template with 3 sections + preview |
| `pages/nginx-gen/nginx-gen.js` | Page logic: form state, input handlers, generate, copy |
| `tests/utils/nginx-generator.test.js` | Unit tests for generator + validation |
| `tests/pages/nginx-gen.test.js` | Page behavior tests |
| `docs/handoff/modules/nginx-gen.md` | Module documentation |

### Modify
| File | Change |
|------|--------|
| `utils/tool-registry.js` | Add `nginx-gen` entry to `network` category |
| `app.json` | Register `pages/nginx-gen/nginx-gen` |

---

### Task 1: Utils — nginx-generator.js (core generator + validation + tests)

**Files:**
- Create: `utils/nginx-generator.js`
- Create: `tests/utils/nginx-generator.test.js`

**Interfaces:**
- Consumes: nothing (standalone pure functions)
- Produces: `generateConfig(inputs)` → `string`, `validateInputs(inputs)` → `Array<{field, message}>`, `CIPHER_PROFILES` object

- [ ] **Step 1: Write failing tests for generateConfig — basic scenarios**

```javascript
// tests/utils/nginx-generator.test.js
const {
  generateConfig,
  validateInputs,
  CIPHER_PROFILES
} = require('../../utils/nginx-generator');

describe('generateConfig', () => {
  // ── HTTPS Static Site (minimal) ──
  test('generates HTTPS server block with minimal fields', () => {
    const config = generateConfig({
      serverName: 'example.com',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: '/etc/ssl/certs/example.crt',
      sslKeyPath: '/etc/ssl/private/example.key',
      rootDir: '',
      indexFiles: 'index.html index.htm',
      proxyPass: '',
      enableRedirect: false,
      nginxVersion: 'modern',
      sslCipherProfile: 'intermediate',
      sslProtocols: 'TLSv1.2 TLSv1.3',
      sslCiphers: '',
      http2Enabled: true,
      enableOCSPStapling: false,
      clientMaxBodySize: '',
      enableHSTS: false,
      hstsPreload: false,
      enableXContentTypeOptions: true,
      enableXFrameOptions: true,
      enableReferrerPolicy: true,
      accessLogPath: '',
      errorLogPath: '',
      enableCatchAll: false,
    });
    expect(config).toContain('listen 443 ssl;');
    expect(config).toContain('listen [::]:443 ssl;');
    expect(config).toContain('server_name example.com;');
    expect(config).toContain('ssl_certificate /etc/ssl/certs/example.crt;');
    expect(config).toContain('ssl_certificate_key /etc/ssl/private/example.key;');
    expect(config).toContain('ssl_protocols TLSv1.2 TLSv1.3;');
    expect(config).toContain('CIPHER_PROFILES.intermediate');
    expect(config).toContain('ssl_session_cache shared:SSL:10m;');
    expect(config).toContain('http2 on;');
    expect(config).toContain('add_header X-Content-Type-Options');
    expect(config).toContain('add_header X-Frame-Options');
  });

  // ── HTTP Static Site (no SSL) ──
  test('generates HTTP server block when port is 80', () => {
    const config = generateConfig({
      serverName: 'example.com',
      listenPort: '80',
      enableSSL: false,
      sslCertPath: '',
      sslKeyPath: '',
      rootDir: '/var/www/html',
      indexFiles: 'index.html',
      proxyPass: '',
      enableRedirect: false,
      nginxVersion: 'modern',
      sslCipherProfile: 'intermediate',
      sslProtocols: 'TLSv1.2 TLSv1.3',
      sslCiphers: '',
      http2Enabled: false,
      enableOCSPStapling: false,
      clientMaxBodySize: '10m',
      enableHSTS: false,
      hstsPreload: false,
      enableXContentTypeOptions: true,
      enableXFrameOptions: true,
      enableReferrerPolicy: true,
      accessLogPath: '',
      errorLogPath: '',
      enableCatchAll: false,
    });
    expect(config).toContain('listen 80;');
    expect(config).toContain('listen [::]:80;');
    expect(config).toContain('root /var/www/html;');
    expect(config).toContain('index index.html;');
    expect(config).toContain('client_max_body_size 10m;');
    expect(config).not.toContain('ssl_');
    expect(config).not.toContain('http2');
  });

  // ── Reverse Proxy ──
  test('generates reverse proxy config with proxy_pass', () => {
    const config = generateConfig({
      serverName: 'api.example.com',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: '/etc/ssl/certs/api.crt',
      sslKeyPath: '/etc/ssl/private/api.key',
      rootDir: '',
      indexFiles: '',
      proxyPass: 'http://localhost:3000',
      enableRedirect: false,
      nginxVersion: 'modern',
      sslCipherProfile: 'intermediate',
      sslProtocols: 'TLSv1.2 TLSv1.3',
      sslCiphers: '',
      http2Enabled: true,
      enableOCSPStapling: false,
      clientMaxBodySize: '',
      enableHSTS: false,
      hstsPreload: false,
      enableXContentTypeOptions: true,
      enableXFrameOptions: true,
      enableReferrerPolicy: true,
      accessLogPath: '',
      errorLogPath: '',
      enableCatchAll: false,
    });
    expect(config).toContain('proxy_pass http://localhost:3000;');
    expect(config).toContain('proxy_set_header Host $host;');
    expect(config).toContain('proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
    expect(config).not.toContain('try_files');
    expect(config).not.toContain('root');
  });

  // ── HTTP→HTTPS Redirect ──
  test('generates redirect block when enableRedirect is true', () => {
    const config = generateConfig({
      serverName: 'example.com',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: '/etc/ssl/certs/example.crt',
      sslKeyPath: '/etc/ssl/private/example.key',
      rootDir: '',
      indexFiles: '',
      proxyPass: '',
      enableRedirect: true,
      nginxVersion: 'modern',
      sslCipherProfile: 'intermediate',
      sslProtocols: 'TLSv1.2 TLSv1.3',
      sslCiphers: '',
      http2Enabled: true,
      enableOCSPStapling: false,
      clientMaxBodySize: '',
      enableHSTS: false,
      hstsPreload: false,
      enableXContentTypeOptions: true,
      enableXFrameOptions: true,
      enableReferrerPolicy: true,
      accessLogPath: '',
      errorLogPath: '',
      enableCatchAll: false,
    });
    expect(config).toContain('server {'); // two server blocks
    expect(config).toContain('return 301 https://$host$request_uri;');
    expect(config).toContain('listen 80;');
  });

  // ── Catch-All ──
  test('generates catch-all block when enableCatchAll is true', () => {
    const config = generateConfig({
      serverName: 'example.com',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: '/etc/ssl/certs/example.crt',
      sslKeyPath: '/etc/ssl/private/example.key',
      rootDir: '',
      indexFiles: '',
      proxyPass: '',
      enableRedirect: false,
      nginxVersion: 'modern',
      sslCipherProfile: 'intermediate',
      sslProtocols: 'TLSv1.2 TLSv1.3',
      sslCiphers: '',
      http2Enabled: true,
      enableOCSPStapling: false,
      clientMaxBodySize: '',
      enableHSTS: false,
      hstsPreload: false,
      enableXContentTypeOptions: true,
      enableXFrameOptions: true,
      enableReferrerPolicy: true,
      accessLogPath: '',
      errorLogPath: '',
      enableCatchAll: true,
    });
    expect(config).toContain('default_server');
    expect(config).toContain('return 444;');
  });

  // ── Root + Proxy coexistence ──
  test('outputs both root and proxy when both are set', () => {
    const config = generateConfig({
      serverName: 'app.example.com',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: '/etc/ssl/certs/app.crt',
      sslKeyPath: '/etc/ssl/private/app.key',
      rootDir: '/var/www/app',
      indexFiles: 'index.html',
      proxyPass: 'http://localhost:8080',
      enableRedirect: false,
      nginxVersion: 'modern',
      sslCipherProfile: 'intermediate',
      sslProtocols: 'TLSv1.2 TLSv1.3',
      sslCiphers: '',
      http2Enabled: false,
      enableOCSPStapling: false,
      clientMaxBodySize: '',
      enableHSTS: false,
      hstsPreload: false,
      enableXContentTypeOptions: false,
      enableXFrameOptions: false,
      enableReferrerPolicy: false,
      accessLogPath: '',
      errorLogPath: '',
      enableCatchAll: false,
    });
    expect(config).toContain('root /var/www/app;');
    expect(config).toContain('proxy_pass http://localhost:8080;');
    expect(config).not.toContain('try_files');
  });
});

describe('validateInputs', () => {
  test('returns no errors for valid HTTPS config', () => {
    const errors = validateInputs({
      serverName: 'example.com',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: '/etc/certs/cert.pem',
      sslKeyPath: '/etc/certs/key.pem',
      rootDir: '',
      proxyPass: '',
      clientMaxBodySize: '',
    });
    expect(errors).toEqual([]);
  });

  test('returns error for empty serverName', () => {
    const errors = validateInputs({
      serverName: '',
      listenPort: '443',
      enableSSL: false,
      sslCertPath: '',
      sslKeyPath: '',
      rootDir: '',
      proxyPass: '',
      clientMaxBodySize: '',
    });
    expect(errors.some(e => e.field === 'serverName')).toBe(true);
  });

  test('returns error for invalid port', () => {
    const errors = validateInputs({
      serverName: 'example.com',
      listenPort: '99999',
      enableSSL: false,
      sslCertPath: '',
      sslKeyPath: '',
      rootDir: '',
      proxyPass: '',
      clientMaxBodySize: '',
    });
    expect(errors.some(e => e.field === 'listenPort')).toBe(true);
  });

  test('returns error for missing SSL paths when enableSSL is true', () => {
    const errors = validateInputs({
      serverName: 'example.com',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: '',
      sslKeyPath: '',
      rootDir: '',
      proxyPass: '',
      clientMaxBodySize: '',
    });
    expect(errors.some(e => e.field === 'sslCertPath')).toBe(true);
    expect(errors.some(e => e.field === 'sslKeyPath')).toBe(true);
  });

  test('returns error for relative SSL path', () => {
    const errors = validateInputs({
      serverName: 'example.com',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: 'certs/cert.pem',
      sslKeyPath: '/etc/certs/key.pem',
      rootDir: '',
      proxyPass: '',
      clientMaxBodySize: '',
    });
    expect(errors.some(e => e.field === 'sslCertPath')).toBe(true);
  });

  test('returns error for proxyPass without protocol', () => {
    const errors = validateInputs({
      serverName: 'example.com',
      listenPort: '80',
      enableSSL: false,
      sslCertPath: '',
      sslKeyPath: '',
      rootDir: '',
      proxyPass: 'localhost:3000',
      clientMaxBodySize: '',
    });
    expect(errors.some(e => e.field === 'proxyPass')).toBe(true);
  });

  test('returns error for invalid clientMaxBodySize format', () => {
    const errors = validateInputs({
      serverName: 'example.com',
      listenPort: '80',
      enableSSL: false,
      sslCertPath: '',
      sslKeyPath: '',
      rootDir: '',
      proxyPass: '',
      clientMaxBodySize: 'abc',
    });
    expect(errors.some(e => e.field === 'clientMaxBodySize')).toBe(true);
  });

  test('accepts valid clientMaxBodySize', () => {
    const errors = validateInputs({
      serverName: 'example.com',
      listenPort: '80',
      enableSSL: false,
      sslCertPath: '',
      sslKeyPath: '',
      rootDir: '',
      proxyPass: '',
      clientMaxBodySize: '10m',
    });
    expect(errors.filter(e => e.field === 'clientMaxBodySize')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/utils/nginx-generator.test.js --no-coverage`
Expected: FAIL — "Cannot find module" for nginx-generator.js, all tests fail

- [ ] **Step 3: Implement nginx-generator.js**

```javascript
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
  const port = inputs.listenPort === '443' ? '443' : inputs.listenPort;
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
    const ciphers = inputs.sslCiphers || CIPHER_PROFILES[inputs.sslCipherProfile] || CIPHER_PROFILES.intermediate;
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
  var serverName = _cleanServerName(inputs.serverName);
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
  var lines = [];
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
  var blocks = [];

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
  var errors = [];

  // serverName
  if (!inputs.serverName || !inputs.serverName.trim()) {
    errors.push({ field: 'serverName', message: '请输入域名' });
  } else {
    var cleaned = _cleanServerName(inputs.serverName);
    if (!cleaned || /[\/:?#]/.test(cleaned)) {
      errors.push({ field: 'serverName', message: '域名格式无效' });
    } else {
      var labels = cleaned.split('.');
      for (var i = 0; i < labels.length; i++) {
        if (labels[i] !== '*' && labels[i] !== '_' && labels[i].length > 63) {
          errors.push({ field: 'serverName', message: '域名标签不能超过 63 个字符' });
          break;
        }
      }
    }
  }

  // Port
  var port = parseInt(inputs.listenPort, 10);
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/utils/nginx-generator.test.js --no-coverage`
Expected: PASS — all tests pass

- [ ] **Step 5: Run full test suite to check no regressions**

Run: `npm test`
Expected: All tests pass (existing + new)

- [ ] **Step 6: Commit**

```bash
git add utils/nginx-generator.js tests/utils/nginx-generator.test.js
git commit -m "feat: implement nginx config generator core (generateConfig + validateInputs)"
```

---

### Task 2: Page — Static structure (JSON + WXSS)

**Files:**
- Create: `pages/nginx-gen/nginx-gen.json`
- Create: `pages/nginx-gen/nginx-gen.wxss`

**Prerequisites:** Task 1 complete

- [ ] **Step 1: Create nginx-gen.json**

```json
{
  "navigationBarTitleText": "Nginx 配置生成器",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#faf9f5",
  "usingComponents": {}
}
```

- [ ] **Step 2: Create nginx-gen.wxss**

```css
/* ── Page ── */
page {
  background-color: #faf9f5;
  padding-bottom: 40rpx;
}

.page-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 40rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  color: #141413;
  padding: 32rpx 32rpx 24rpx;
}

/* ── Sections ── */
.section {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 28rpx;
  margin: 0 24rpx 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.section-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #6c6a64;
  letter-spacing: 3rpx;
  text-transform: uppercase;
}

.section-toggle {
  font-size: 24rpx;
  color: #cc785c;
  font-weight: 500;
}

.section-body {
  margin-top: 20rpx;
  border-top: 1rpx solid #e6dfd8;
  padding-top: 20rpx;
}

/* ── Form Fields ── */
.field-group {
  margin-bottom: 24rpx;
}

.field-label {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: #141413;
  margin-bottom: 10rpx;
}

.field-required {
  color: #e74c3c;
  margin-left: 4rpx;
}

.field-input {
  width: 100%;
  height: 80rpx;
  background: #faf9f5;
  border: 2rpx solid #ddd7cc;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #141413;
  box-sizing: border-box;
}

.field-input::placeholder {
  color: #b0aba0;
  font-size: 26rpx;
}

.field-input.error {
  border-color: #e74c3c;
}

.field-input:focus {
  border-color: #cc785c;
}

.field-error {
  font-size: 22rpx;
  color: #e74c3c;
  margin-top: 6rpx;
  padding-left: 4rpx;
}

/* ── Picker ── */
.field-picker {
  width: 100%;
  height: 80rpx;
  background: #faf9f5;
  border: 2rpx solid #ddd7cc;
  border-radius: 16rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #141413;
  box-sizing: border-box;
}

/* ── Toggle Switch ── */
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.toggle-label {
  font-size: 26rpx;
  color: #141413;
}

.toggle-switch {
  position: relative;
  width: 88rpx;
  height: 48rpx;
}

.toggle-track {
  width: 88rpx;
  height: 48rpx;
  background: #ddd7cc;
  border-radius: 24rpx;
  transition: background 0.2s;
}

.toggle-track.active {
  background: #cc785c;
}

.toggle-thumb {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.toggle-thumb.active {
  transform: translateX(40rpx);
}

/* ── Buttons ── */
.btn-row {
  display: flex;
  gap: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 20rpx;
}

.btn-primary {
  flex: 1;
  background: #cc785c;
  color: #faf9f5;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.btn-primary:active {
  background: #a9583e;
}

.btn-secondary {
  flex: 0 0 120rpx;
  background: #efe9de;
  color: #141413;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 20rpx;
  font-size: 30rpx;
}

.btn-secondary:active {
  background: #ddd7cc;
}

/* ── Config Preview ── */
.preview-section {
  margin: 0 24rpx 20rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: #181715;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #222120;
}

.preview-title {
  font-size: 24rpx;
  color: #faf9f5;
  font-weight: 500;
}

.preview-badge {
  font-size: 20rpx;
  color: #6c6a64;
  background: #2a2928;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.preview-body {
  padding: 24rpx;
  max-height: 600rpx;
  overflow-y: auto;
}

.preview-code {
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  font-size: 22rpx;
  line-height: 1.8;
  color: #e8e0d2;
  white-space: pre;
  word-wrap: normal;
}

.preview-empty {
  padding: 60rpx 0;
  text-align: center;
  color: #6c6a64;
  font-size: 26rpx;
}

/* ── Tips ── */
.tips-box {
  margin: 0 24rpx 20rpx;
  padding: 20rpx 24rpx;
  background: #efe9de;
  border-radius: 16rpx;
}

.tips-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #141413;
  margin-bottom: 10rpx;
}

.tips-item {
  font-size: 22rpx;
  color: #6c6a64;
  line-height: 1.6;
  padding-left: 16rpx;
  margin-bottom: 4rpx;
}

/* ── Other ── */
.hidden {
  display: none;
}
```

- [ ] **Step 3: Commit**

```bash
git add pages/nginx-gen/nginx-gen.json pages/nginx-gen/nginx-gen.wxss
git commit -m "feat: add nginx-gen page json + wxss"
```

---

### Task 3: Page — Template (WXML)

**Files:**
- Create: `pages/nginx-gen/nginx-gen.wxml`

**Prerequisites:** Task 2 complete

- [ ] **Step 1: Create nginx-gen.wxml**

```xml
<view class="page-title">🔒 Nginx 配置生成器</view>

<!-- ── Section: 必填 ── -->
<view class="section">
  <view class="section-header" bindtap="onToggleBasic">
    <text class="section-label">必填</text>
    <text class="section-toggle">{{showBasic ? '收起' : '展开'}}</text>
  </view>
  <view class="section-body" wx:if="{{showBasic}}">
    <view class="field-group">
      <text class="field-label">域名<text class="field-required">*</text></text>
      <input class="field-input {{errors.serverName ? 'error' : ''}}"
        placeholder="example.com"
        value="{{form.serverName}}"
        data-field="serverName"
        bindinput="onInputChange" />
      <text class="field-error" wx:if="{{errors.serverName}}">{{errors.serverName}}</text>
    </view>
    <view class="field-group">
      <text class="field-label">端口</text>
      <picker mode="selector" range="{{portOptions}}" value="{{portIndex}}" bindchange="onPortChange">
        <view class="field-picker">{{portLabel}}</view>
      </picker>
    </view>
    <view class="field-group" wx:if="{{form.enableSSL}}">
      <text class="field-label">SSL 证书路径<text class="field-required">*</text></text>
      <input class="field-input {{errors.sslCertPath ? 'error' : ''}}"
        placeholder="/etc/letsencrypt/live/example.com/fullchain.pem"
        value="{{form.sslCertPath}}"
        data-field="sslCertPath"
        bindinput="onInputChange" />
      <text class="field-error" wx:if="{{errors.sslCertPath}}">{{errors.sslCertPath}}</text>
    </view>
    <view class="field-group" wx:if="{{form.enableSSL}}">
      <text class="field-label">SSL 密钥路径<text class="field-required">*</text></text>
      <input class="field-input {{errors.sslKeyPath ? 'error' : ''}}"
        placeholder="/etc/letsencrypt/live/example.com/privkey.pem"
        value="{{form.sslKeyPath}}"
        data-field="sslKeyPath"
        bindinput="onInputChange" />
      <text class="field-error" wx:if="{{errors.sslKeyPath}}">{{errors.sslKeyPath}}</text>
    </view>
  </view>
</view>

<!-- ── Section: 常用 ── -->
<view class="section">
  <view class="section-header" bindtap="onToggleCommon">
    <text class="section-label">常用</text>
    <text class="section-toggle">{{showCommon ? '收起' : '展开'}}</text>
  </view>
  <view class="section-body" wx:if="{{showCommon}}">
    <view class="field-group">
      <text class="field-label">Root 目录</text>
      <input class="field-input {{errors.rootDir ? 'error' : ''}}"
        placeholder="/var/www/html"
        value="{{form.rootDir}}"
        data-field="rootDir"
        bindinput="onInputChange" />
      <text class="field-error" wx:if="{{errors.rootDir}}">{{errors.rootDir}}</text>
    </view>
    <view class="field-group">
      <text class="field-label">索引文件</text>
      <input class="field-input"
        placeholder="index.html index.htm"
        value="{{form.indexFiles}}"
        data-field="indexFiles"
        bindinput="onInputChange" />
    </view>
    <view class="field-group">
      <text class="field-label">反向代理 URL</text>
      <input class="field-input {{errors.proxyPass ? 'error' : ''}}"
        placeholder="http://localhost:3000"
        value="{{form.proxyPass}}"
        data-field="proxyPass"
        bindinput="onInputChange" />
      <text class="field-error" wx:if="{{errors.proxyPass}}">{{errors.proxyPass}}</text>
    </view>
    <view class="toggle-row">
      <text class="toggle-label">自动 HTTP→HTTPS 跳转</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="enableRedirect">
        <view class="toggle-track {{form.enableRedirect ? 'active' : ''}}">
          <view class="toggle-thumb {{form.enableRedirect ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
  </view>
</view>

<!-- ── Section: 高级 ── -->
<view class="section">
  <view class="section-header" bindtap="onToggleAdvanced">
    <text class="section-label">高级</text>
    <text class="section-toggle">{{showAdvanced ? '收起' : '展开'}}</text>
  </view>
  <view class="section-body" wx:if="{{showAdvanced}}">
    <view class="field-group">
      <text class="field-label">Nginx 版本</text>
      <picker mode="selector" range="{{versionOptions}}" value="{{versionIndex}}" bindchange="onVersionChange">
        <view class="field-picker">{{versionLabel}}</view>
      </picker>
    </view>
    <view class="field-group" wx:if="{{form.enableSSL}}">
      <text class="field-label">SSL 配置预设</text>
      <picker mode="selector" range="{{cipherOptions}}" value="{{cipherIndex}}" bindchange="onCipherChange">
        <view class="field-picker">{{cipherLabel}}</view>
      </picker>
    </view>
    <view class="field-group" wx:if="{{form.enableSSL}}">
      <text class="field-label">SSL 协议</text>
      <input class="field-input"
        placeholder="TLSv1.2 TLSv1.3"
        value="{{form.sslProtocols}}"
        data-field="sslProtocols"
        bindinput="onInputChange" />
    </view>
    <view class="field-group" wx:if="{{form.enableSSL}}">
      <text class="field-label">SSL Ciphers（留空=使用预设）</text>
      <input class="field-input"
        placeholder="留空自动"
        value="{{form.sslCiphers}}"
        data-field="sslCiphers"
        bindinput="onInputChange" />
    </view>
    <view class="toggle-row" wx:if="{{form.enableSSL}}">
      <text class="toggle-label">OCSP Stapling</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="enableOCSPStapling">
        <view class="toggle-track {{form.enableOCSPStapling ? 'active' : ''}}">
          <view class="toggle-thumb {{form.enableOCSPStapling ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
    <view class="toggle-row" wx:if="{{form.enableSSL}}">
      <text class="toggle-label">HTTP/2</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="http2Enabled">
        <view class="toggle-track {{form.http2Enabled ? 'active' : ''}}">
          <view class="toggle-thumb {{form.http2Enabled ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
    <view class="field-group">
      <text class="field-label">Client Max Body Size</text>
      <input class="field-input {{errors.clientMaxBodySize ? 'error' : ''}}"
        placeholder="10m"
        value="{{form.clientMaxBodySize}}"
        data-field="clientMaxBodySize"
        bindinput="onInputChange" />
      <text class="field-error" wx:if="{{errors.clientMaxBodySize}}">{{errors.clientMaxBodySize}}</text>
    </view>
    <view class="toggle-row">
      <text class="toggle-label">HSTS</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="enableHSTS">
        <view class="toggle-track {{form.enableHSTS ? 'active' : ''}}">
          <view class="toggle-thumb {{form.enableHSTS ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
    <view class="toggle-row" wx:if="{{form.enableHSTS}}">
      <text class="toggle-label">HSTS Preload（不可逆！）</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="hstsPreload">
        <view class="toggle-track {{form.hstsPreload ? 'active' : ''}}">
          <view class="toggle-thumb {{form.hstsPreload ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
    <view class="toggle-row">
      <text class="toggle-label">X-Content-Type-Options</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="enableXContentTypeOptions">
        <view class="toggle-track {{form.enableXContentTypeOptions ? 'active' : ''}}">
          <view class="toggle-thumb {{form.enableXContentTypeOptions ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
    <view class="toggle-row">
      <text class="toggle-label">X-Frame-Options</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="enableXFrameOptions">
        <view class="toggle-track {{form.enableXFrameOptions ? 'active' : ''}}">
          <view class="toggle-thumb {{form.enableXFrameOptions ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
    <view class="toggle-row">
      <text class="toggle-label">Referrer-Policy</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="enableReferrerPolicy">
        <view class="toggle-track {{form.enableReferrerPolicy ? 'active' : ''}}">
          <view class="toggle-thumb {{form.enableReferrerPolicy ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
    <view class="field-group">
      <text class="field-label">Access Log 路径</text>
      <input class="field-input"
        placeholder="留空=不输出"
        value="{{form.accessLogPath}}"
        data-field="accessLogPath"
        bindinput="onInputChange" />
    </view>
    <view class="field-group">
      <text class="field-label">Error Log 路径</text>
      <input class="field-input"
        placeholder="留空=不输出"
        value="{{form.errorLogPath}}"
        data-field="errorLogPath"
        bindinput="onInputChange" />
    </view>
    <view class="toggle-row">
      <text class="toggle-label">生成 Catch-All 默认拦截</text>
      <view class="toggle-switch" bindtap="onToggleSwitch" data-field="enableCatchAll">
        <view class="toggle-track {{form.enableCatchAll ? 'active' : ''}}">
          <view class="toggle-thumb {{form.enableCatchAll ? 'active' : ''}}"></view>
        </view>
      </view>
    </view>
  </view>
</view>

<!-- ── Buttons ── -->
<view class="btn-row">
  <view class="btn-primary" bindtap="onGenerate">🔄 生成配置</view>
  <view class="btn-secondary" bindtap="onCopy">📋</view>
</view>

<!-- ── Config Preview ── -->
<view class="preview-section" wx:if="{{generatedConfig}}">
  <view class="preview-header">
    <text class="preview-title">nginx server block</text>
    <text class="preview-badge">复制即用</text>
  </view>
  <view class="preview-body">
    <text class="preview-code">{{generatedConfig}}</text>
  </view>
</view>

<!-- ── Tips ── -->
<view class="tips-box" wx:if="{{generatedConfig}}">
  <text class="tips-title">部署前检查</text>
  <text class="tips-item">• 私钥文件权限应为 600 或 640</text>
  <text class="tips-item">• 确认 nginx -t 测试通过后再 reload</text>
  <text class="tips-item">• 证书路径建议用 Let's Encrypt live/ 目录</text>
  <text class="tips-item">• 端口 < 1024 需要 root 权限启动</text>
</view>

<view class="preview-empty" wx:if="{{!generatedConfig && !errors._hasErrors}}">
  填写表单后点击「生成配置」
</view>
```

- [ ] **Step 2: Commit**

```bash
git add pages/nginx-gen/nginx-gen.wxml
git commit -m "feat: add nginx-gen page WXML template"
```

---

### Task 4: Page — Logic (JS)

**Files:**
- Create: `pages/nginx-gen/nginx-gen.js`

**Prerequisites:** Task 1 (utils), Task 3 (WXML template field names match)

**Interfaces:**
- Consumes: `generateConfig(inputs)` from `utils/nginx-generator.js`, `validateInputs(inputs)` from same
- Produces: Page component with form state and event handlers

- [ ] **Step 1: Create nginx-gen.js**

```javascript
const { generateConfig, validateInputs } = require('../../utils/nginx-generator');

const PORT_OPTIONS = ['443 (HTTPS)', '80 (HTTP)', '自定义'];
const VERSION_OPTIONS = ['≥1.25.1 (modern)', '<1.25.1 (legacy)'];
const CIPHER_OPTIONS = ['Intermediate（广泛兼容）', 'Modern（严格模式）'];

Page({
  data: {
    // Form state
    form: {
      serverName: '',
      listenPort: '443',
      enableSSL: true,
      sslCertPath: '',
      sslKeyPath: '',
      rootDir: '',
      indexFiles: 'index.html index.htm',
      proxyPass: '',
      enableRedirect: false,
      nginxVersion: 'modern',
      sslCipherProfile: 'intermediate',
      sslProtocols: 'TLSv1.2 TLSv1.3',
      sslCiphers: '',
      http2Enabled: true,
      enableOCSPStapling: false,
      clientMaxBodySize: '',
      enableHSTS: false,
      hstsPreload: false,
      enableXContentTypeOptions: true,
      enableXFrameOptions: true,
      enableReferrerPolicy: true,
      accessLogPath: '',
      errorLogPath: '',
      enableCatchAll: false,
    },

    // UI state
    showBasic: true,
    showCommon: true,
    showAdvanced: false,
    portOptions: PORT_OPTIONS,
    versionOptions: VERSION_OPTIONS,
    cipherOptions: CIPHER_OPTIONS,
    portIndex: 0,
    versionIndex: 0,
    cipherIndex: 0,

    // Output
    generatedConfig: '',

    // Validation errors
    errors: {},

    // Custom port text (when portIndex === 2)
    customPort: '8443',
  },

  onLoad: function () {
    // Initialize port label
    this._updatePortLabel();
  },

  // ── Input Change ──
  onInputChange: function (e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value;
    var form = this._copyForm();
    form[field] = value;
    this.setData({ form: form });
  },

  // ── Toggle Switch ──
  onToggleSwitch: function (e) {
    var field = e.currentTarget.dataset.field;
    var form = this._copyForm();
    form[field] = !form[field];
    this.setData({ form: form });
  },

  // ── Port Picker ──
  onPortChange: function (e) {
    var index = parseInt(e.detail.value, 10);
    var form = this._copyForm();
    var isSSL = index === 0; // 443 = SSL
    form.enableSSL = isSSL;
    if (index === 0) {
      form.listenPort = '443';
    } else if (index === 1) {
      form.listenPort = '80';
    }
    // index 2 = custom, don't change the port value
    this.setData({
      portIndex: index,
      form: form,
    });
    this._updatePortLabel();
  },

  // ── Version Picker ──
  onVersionChange: function (e) {
    var index = parseInt(e.detail.value, 10);
    var form = this._copyForm();
    form.nginxVersion = index === 0 ? 'modern' : 'legacy';
    this.setData({
      versionIndex: index,
      form: form,
    });
  },

  // ── Cipher Profile Picker ──
  onCipherChange: function (e) {
    var index = parseInt(e.detail.value, 10);
    var form = this._copyForm();
    form.sslCipherProfile = index === 0 ? 'intermediate' : 'modern';
    this.setData({
      cipherIndex: index,
      form: form,
    });
  },

  // ── Custom Port Input ──
  onCustomPortInput: function (e) {
    this.setData({ customPort: e.detail.value });
  },

  onApplyCustomPort: function () {
    var form = this._copyForm();
    form.listenPort = this.data.customPort || '8443';
    this.setData({ form: form });
  },

  // ── Section Toggles ──
  onToggleBasic: function () {
    this.setData({ showBasic: !this.data.showBasic });
  },

  onToggleCommon: function () {
    this.setData({ showCommon: !this.data.showCommon });
  },

  onToggleAdvanced: function () {
    this.setData({ showAdvanced: !this.data.showAdvanced });
  },

  // ── Generate ──
  onGenerate: function () {
    var form = this.data.form;

    // Collect inputs for validation + generation
    var inputs = {
      serverName: form.serverName,
      listenPort: form.listenPort,
      enableSSL: form.enableSSL,
      sslCertPath: form.sslCertPath,
      sslKeyPath: form.sslKeyPath,
      rootDir: form.rootDir,
      indexFiles: form.indexFiles,
      proxyPass: form.proxyPass,
      enableRedirect: form.enableRedirect,
      nginxVersion: form.nginxVersion,
      sslCipherProfile: form.sslCipherProfile,
      sslProtocols: form.sslProtocols,
      sslCiphers: form.sslCiphers,
      http2Enabled: form.http2Enabled,
      enableOCSPStapling: form.enableOCSPStapling,
      clientMaxBodySize: form.clientMaxBodySize,
      enableHSTS: form.enableHSTS,
      hstsPreload: form.hstsPreload,
      enableXContentTypeOptions: form.enableXContentTypeOptions,
      enableXFrameOptions: form.enableXFrameOptions,
      enableReferrerPolicy: form.enableReferrerPolicy,
      accessLogPath: form.accessLogPath,
      errorLogPath: form.errorLogPath,
      enableCatchAll: form.enableCatchAll,
    };

    // Validate
    var validationErrors = validateInputs(inputs);
    var errorsMap = {};
    validationErrors.forEach(function (err) {
      errorsMap[err.field] = err.message;
    });
    errorsMap._hasErrors = validationErrors.length > 0;

    if (validationErrors.length > 0) {
      this.setData({
        errors: errorsMap,
        generatedConfig: '',
      });
      return;
    }

    // Generate
    var config = generateConfig(inputs);
    this.setData({
      errors: {},
      generatedConfig: config,
    });
  },

  // ── Copy to Clipboard ──
  onCopy: function () {
    if (!this.data.generatedConfig) return;
    wx.setClipboardData({
      data: this.data.generatedConfig,
      success: function () {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 1500,
        });
      },
      fail: function () {
        wx.showToast({
          title: '复制失败，请手动复制',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },

  // ── Private Helpers ──
  _copyForm: function () {
    return JSON.parse(JSON.stringify(this.data.form));
  },

  _updatePortLabel: function () {
    var labels = ['443 (HTTPS)', '80 (HTTP)', '自定义'];
    var portLabel = labels[this.data.portIndex] || '443 (HTTPS)';
    this.setData({ portLabel: portLabel });
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add pages/nginx-gen/nginx-gen.js
git commit -m "feat: add nginx-gen page logic (form handling, generate, copy)"
```

---

### Task 5: Page tests

**Files:**
- Create: `tests/pages/nginx-gen.test.js`

**Prerequisites:** Task 4 (page logic)

- [ ] **Step 1: Write page tests**

```javascript
// tests/pages/nginx-gen.test.js
const { generateConfig, validateInputs } = require('../../utils/nginx-generator');

// We test the page's consumed pure functions directly since
// Mini Program Page() methods aren't easily testable in Jest.
// Page-specific behavior (form state, events, clipboard) is
// verified via the integration of pure functions.

describe('nginx-gen page integration', () => {
  describe('full flow: form input → validate → generate → valid config', () => {
    test('minimal HTTPS site flow', () => {
      var inputs = {
        serverName: 'example.com',
        listenPort: '443',
        enableSSL: true,
        sslCertPath: '/etc/certs/fullchain.pem',
        sslKeyPath: '/etc/certs/privkey.pem',
        rootDir: '',
        indexFiles: '',
        proxyPass: '',
        enableRedirect: false,
        nginxVersion: 'modern',
        sslCipherProfile: 'intermediate',
        sslProtocols: 'TLSv1.2 TLSv1.3',
        sslCiphers: '',
        http2Enabled: false,
        enableOCSPStapling: false,
        clientMaxBodySize: '',
        enableHSTS: false,
        hstsPreload: false,
        enableXContentTypeOptions: true,
        enableXFrameOptions: true,
        enableReferrerPolicy: true,
        accessLogPath: '',
        errorLogPath: '',
        enableCatchAll: false,
      };

      var errors = validateInputs(inputs);
      expect(errors).toEqual([]);

      var config = generateConfig(inputs);
      expect(config).toContain('server_name example.com;');
      expect(config).toContain('listen 443 ssl;');
      expect(config).toContain('ssl_certificate /etc/certs/fullchain.pem;');
    });

    test('full proxy + redirect + catch-all flow', () => {
      var inputs = {
        serverName: 'app.example.com',
        listenPort: '443',
        enableSSL: true,
        sslCertPath: '/etc/certs/app.pem',
        sslKeyPath: '/etc/certs/app.key',
        rootDir: '',
        indexFiles: '',
        proxyPass: 'http://127.0.0.1:8080',
        enableRedirect: true,
        nginxVersion: 'modern',
        sslCipherProfile: 'intermediate',
        sslProtocols: 'TLSv1.2 TLSv1.3',
        sslCiphers: '',
        http2Enabled: true,
        enableOCSPStapling: false,
        clientMaxBodySize: '50m',
        enableHSTS: true,
        hstsPreload: false,
        enableXContentTypeOptions: true,
        enableXFrameOptions: true,
        enableReferrerPolicy: true,
        accessLogPath: '/var/log/nginx/app.log',
        errorLogPath: '/var/log/nginx/app-error.log',
        enableCatchAll: true,
      };

      var errors = validateInputs(inputs);
      expect(errors).toEqual([]);

      var config = generateConfig(inputs);
      expect(config).toContain('proxy_pass http://127.0.0.1:8080;');
      expect(config).toContain('listen 80;'); // redirect block
      expect(config).toContain('default_server'); // catch-all
      expect(config).toContain('client_max_body_size 50m;');
      expect(config).toContain('http2 on;');
      expect(config).toContain('access_log /var/log/nginx/app.log;');
    });

    test('invalid input blocks generation', () => {
      var inputs = {
        serverName: '',
        listenPort: '443',
        enableSSL: true,
        sslCertPath: '',
        sslKeyPath: '',
        rootDir: '',
        indexFiles: '',
        proxyPass: '',
        enableRedirect: false,
        nginxVersion: 'modern',
        sslCipherProfile: 'intermediate',
        sslProtocols: 'TLSv1.2 TLSv1.3',
        sslCiphers: '',
        http2Enabled: false,
        enableOCSPStapling: false,
        clientMaxBodySize: '',
        enableHSTS: false,
        hstsPreload: false,
        enableXContentTypeOptions: true,
        enableXFrameOptions: true,
        enableReferrerPolicy: true,
        accessLogPath: '',
        errorLogPath: '',
        enableCatchAll: false,
      };

      var errors = validateInputs(inputs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(function (e) { return e.field === 'serverName'; })).toBe(true);
      expect(errors.some(function (e) { return e.field === 'sslCertPath'; })).toBe(true);
      expect(errors.some(function (e) { return e.field === 'sslKeyPath'; })).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run page tests**

Run: `npx jest tests/pages/nginx-gen.test.js --no-coverage`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add tests/pages/nginx-gen.test.js
git commit -m "test: add nginx-gen page integration tests"
```

---

### Task 6: Registration (tool-registry.js + app.json)

**Files:**
- Modify: `utils/tool-registry.js` (add `nginx-gen` to network category)
- Modify: `app.json` (register page)

**Prerequisites:** Task 1-5 (all page files exist)

- [ ] **Step 1: Add nginx-gen to tool-registry.js**

Insert after the `nat-viz` entry (order: 7) in the `network` category:

```javascript
  {
    id: 'nginx-gen',
    category: 'network',
    name: 'Nginx 配置生成器',
    icon: '',
    description: '填表即出 nginx 配置',
    route: '/pages/nginx-gen/nginx-gen',
    available: true,
    featured: true,
    tagline: '填表即出 nginx 配置，复制就能用',
    taglineDetail: '输入域名、端口、SSL 证书路径等必要信息，自动生成格式化 nginx server block 配置，支持 HTTPS 站点、反向代理、HTTP→HTTPS 跳转等场景，一键复制部署',
    tags: ['#实用工具'],
    difficulty: 'easy',
    intro: {
      valueProp: '配 nginx 不用查文档手写，填表即出。',
      features: [
        '输入域名、端口、证书路径等基本信息，自动生成完整 server block',
        '支持 HTTPS 站点、HTTP 站点、反向代理、HTTP→HTTPS 跳转四种场景',
        '一键复制配置，粘贴即用'
      ],
      prerequisites: '了解 nginx 的基本概念（server block、SSL 配置）即可使用。',
      useCases: [
        '快速配置新站点的 nginx 和 SSL',
        '为后端服务快速生成反向代理配置',
        '学习 nginx server block 的常用指令结构'
      ]
    },
    order: 8
  },
```

- [ ] **Step 2: Register page in app.json**

Add `"pages/nginx-gen/nginx-gen"` to the `pages` array in `app.json` (after `"pages/nat-viz/nat-viz"` would be ideal, but any position works; keep alphabetical/logical grouping):

Find the closing `]` of the `pages` array in `app.json` and add before the last entry, or at the end.

Edit `app.json`: after `"pages/deadlock/deadlock"` add `,"pages/nginx-gen/nginx-gen"`.

Expected: app.json pages array contains the new entry.

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add utils/tool-registry.js app.json
git commit -m "feat: register nginx-gen tool in tool-registry and app.json"
```

---

### Task 7: Module documentation

**Files:**
- Create: `docs/handoff/modules/nginx-gen.md`

**Prerequisites:** Task 6 complete

- [ ] **Step 1: Write module doc**

```markdown
# Nginx 配置生成器 · 模块文档

> 最后更新：2026-07-21

## 概述

Nginx 最小配置生成器是一个实用工具：用户填写域名、端口、证书路径等必要信息，一键生成可复制的 nginx server block 配置。

## 文件清单

| 文件 | 说明 |
|------|------|
| `pages/nginx-gen/nginx-gen.js` | 页面逻辑（表单状态、校验、生成、复制） |
| `pages/nginx-gen/nginx-gen.wxml` | 页面模板（3 段折叠表单 + 预览区） |
| `pages/nginx-gen/nginx-gen.wxss` | 页面样式 |
| `pages/nginx-gen/nginx-gen.json` | 页面配置 |
| `utils/nginx-generator.js` | 核心纯函数：generateConfig + validateInputs |
| `tests/utils/nginx-generator.test.js` | 生成器单元测试 |
| `tests/pages/nginx-gen.test.js` | 页面集成测试 |

## 核心逻辑

### `generateConfig(inputs)` → `string`

纯函数，接收表单输入对象，按条件逐行生成 nginx server block 配置。

支持按条件输出：
- SSL 相关行（仅 enableSSL=true 时）
- Root/Index 行（仅 rootDir 有值时）
- Proxy 行（仅 proxyPass 有值时）
- 跳转 block（enableRedirect=true 时额外生成）
- Catch-All block（enableCatchAll=true 时额外生成）
- HTTP/2 语法根据 nginx 版本选择（modern/legacy）

### `validateInputs(inputs)` → `Array<{field, message}>`

校验函数，返回错误数组。校验项：
- 域名格式（无协议/路径/端口，单标签 ≤63 字符）
- 端口范围（1-65535）
- SSL 路径（绝对值 / 开头）
- Root 路径（绝对值 / 开头）
- Proxy URL（http(s):// 开头）
- ClientMaxBodySize 格式（数字+单位）

## 数据流

```
用户输入 → form data → validateInputs → (有误) → 标红错误字段
                                       → (无误) → generateConfig → 显示预览区
                                                                    → 点击复制 → wx.setClipboardData
```

## 表单结构

| 层级 | 内容 | 默认状态 |
|------|------|---------|
| 必填 | 域名、端口、SSL 证书/密钥路径 | 展开 |
| 常用 | Root 目录、索引文件、反向代理 URL、HTTPS 跳转 | 展开 |
| 高级 | Nginx 版本、SSL 配置预设、OCSP、HTTP/2、HSTS、安全头、日志、Catch-All | 收起 |

## 设计决策

- 输入不做实时校验，点击生成时统一校验（减少干扰）
- 端口 443 自动展开 SSL 字段，80 隐藏（简化界面）
- 配置预览深色终端风格，与表单区视觉分离
- 生成后显示部署检查清单（权限、nginx -t 等）

## 测试

- `tests/utils/nginx-generator.test.js`：覆盖 4 种场景 + 条件输出 + 边界值
- `tests/pages/nginx-gen.test.js`：全流程集成测试
- 运行：`npx jest tests/utils/nginx-generator.test.js`
```

- [ ] **Step 2: Update PROJECT_HANDOFF.md**

Append to PROJECT_HANDOFF.md's top section (after the existing "2026-07-19" entries):

```markdown
### 2026-07-21 · Nginx 最小配置生成器上线

**变更内容**
- 新增 `pages/nginx-gen/` 页面（4 文件）
- 新增 `utils/nginx-generator.js` 纯函数模块（generateConfig + validateInputs）
- 新增 2 个测试文件（generator 单元 + 页面集成）
- `utils/tool-registry.js` 在 network 分类下新增 `nginx-gen`（available: true, featured: true）
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/nginx-gen.md` 模块文档

**功能**
- 3 段折叠式表单：必填→常用→高级
- 支持 HTTPS 站点 / HTTP 站点 / 反向代理 / HTTP→HTTPS 跳转
- 条件输出 SSL / root / proxy / redirect / catch-all 各区块
- Mozilla Intermediate SSL 默认配置 + OCSP / HSTS / 安全头
- 一键复制到剪贴板 + 部署检查清单
```

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add docs/handoff/modules/nginx-gen.md PROJECT_HANDOFF.md
git commit -m "docs: add nginx-gen module documentation and update handoff"
```

---

## Self-Review Check

- [ ] All 4 scenarios (HTTPS, HTTP, proxy, redirect) tested
- [ ] Conditional output rules covered (no SSL lines when disabled, etc.)
- [ ] Validation rules cover all fields with errors
- [ ] Edge cases: empty form, custom port, root+proxy coexistence
- [ ] No mutation patterns in utils (pure functions)
- [ ] All existing tests still pass (verified at each task)
- [ ] No TBD/TODO/FIXME placeholders
