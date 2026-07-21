const { generateConfig, validateInputs } = require('../../utils/nginx-generator');

// We test the page's consumed pure functions directly since
// Mini Program Page() methods aren't easily testable in Jest.
// Page-specific behavior (form state, events, clipboard) is
// verified via the integration of pure functions.

describe('nginx-gen page integration', () => {
  describe('full flow: form input → validate → generate → valid config', () => {
    test('minimal HTTPS site flow', () => {
      const inputs = {
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

      const errors = validateInputs(inputs);
      expect(errors).toEqual([]);

      const config = generateConfig(inputs);
      expect(config).toContain('server_name example.com;');
      expect(config).toContain('listen 443 ssl;');
      expect(config).toContain('ssl_certificate /etc/certs/fullchain.pem;');
    });

    test('full proxy + redirect + catch-all flow', () => {
      const inputs = {
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

      const errors = validateInputs(inputs);
      expect(errors).toEqual([]);

      const config = generateConfig(inputs);
      expect(config).toContain('proxy_pass http://127.0.0.1:8080;');
      expect(config).toContain('listen 80;'); // redirect block
      expect(config).toContain('default_server'); // catch-all
      expect(config).toContain('client_max_body_size 50m;');
      expect(config).toContain('http2 on;');
      expect(config).toContain('access_log /var/log/nginx/app.log;');
    });

    test('invalid input blocks generation', () => {
      const inputs = {
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

      const errors = validateInputs(inputs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(function (e) { return e.field === 'serverName'; })).toBe(true);
      expect(errors.some(function (e) { return e.field === 'sslCertPath'; })).toBe(true);
      expect(errors.some(function (e) { return e.field === 'sslKeyPath'; })).toBe(true);
    });
  });
});
