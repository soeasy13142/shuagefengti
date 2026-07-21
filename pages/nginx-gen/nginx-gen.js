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
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const form = this._copyForm();
    form[field] = value;
    this.setData({ form: form });
  },

  // ── Toggle Switch ──
  onToggleSwitch: function (e) {
    const field = e.currentTarget.dataset.field;
    const form = this._copyForm();
    form[field] = !form[field];
    this.setData({ form: form });
  },

  // ── Port Picker ──
  onPortChange: function (e) {
    const index = parseInt(e.detail.value, 10);
    const form = this._copyForm();
    const isSSL = index === 0; // 443 = SSL
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
    const index = parseInt(e.detail.value, 10);
    const form = this._copyForm();
    form.nginxVersion = index === 0 ? 'modern' : 'legacy';
    this.setData({
      versionIndex: index,
      form: form,
    });
  },

  // ── Cipher Profile Picker ──
  onCipherChange: function (e) {
    const index = parseInt(e.detail.value, 10);
    const form = this._copyForm();
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
    const form = this._copyForm();
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
    const form = this.data.form;

    // Collect inputs for validation + generation
    const inputs = {
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

    // Auto-prefix proxyPass if missing protocol
    if (inputs.proxyPass && !/^https?:\/\//.test(inputs.proxyPass)) {
      inputs.proxyPass = 'http://' + inputs.proxyPass;
    }

    // Validate
    const validationErrors = validateInputs(inputs);
    const errorsMap = {};
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
    const config = generateConfig(inputs);
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
    const labels = ['443 (HTTPS)', '80 (HTTP)', '自定义'];
    const portLabel = labels[this.data.portIndex] || '443 (HTTPS)';
    this.setData({ portLabel: portLabel });
  },
});
