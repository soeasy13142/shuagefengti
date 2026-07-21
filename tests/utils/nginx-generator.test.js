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
    expect(config).toContain('ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256');
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

  test('returns error when SSL enabled on non-443 port', () => {
    const errors = validateInputs({
      serverName: 'example.com',
      listenPort: '80',
      enableSSL: true,
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

  test('accepts proxyPass without protocol (auto-prefixed in page JS)', () => {
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
    expect(errors.some(e => e.field === 'proxyPass')).toBe(false);
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
