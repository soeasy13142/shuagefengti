const { generateKeypair, encrypt, decrypt, modPowWithSteps, modPow, isPrime, gcd, extendedGcd } = require('../../utils/rsa-core');
const { PRIMES_2_997 } = require('../../utils/rsa-primes');

const PRIME_INDICES = PRIMES_2_997.map(function(p, i) {
  return { id: i, val: p, label: '' + p };
});

Page({
  data: {
    // 素数选择
    primeList: PRIME_INDICES,
    primeIndexP: -1,
    primeIndexQ: -1,
    inputP: '17',
    inputQ: '19',
    pError: '',
    qError: '',

    // 密钥对
    keypair: null,

    // 加密/解密
    plaintext: '42',
    ciphertext: '',
    encrypted: null,
    decrypted: null,
    modPowSteps: null,
    modPowLabel: '',

    // 数论细节面板
    showDetails: false,

    // 弱密钥提示
    wienerWarning: '',

    // 文字模式
    textModePlain: '',
    textModeResult: null,
    textModeType: 'encrypt', // 'encrypt' | 'decrypt'
    textModeOutput: ''
  },

  onLoad: function() {
    this._updateFromInputs();
  },

  // ── 素数输入 ──

  _updateFromInputs: function() {
    var pStr = this.data.inputP.trim();
    var qStr = this.data.inputQ.trim();
    var p = parseInt(pStr, 10);
    var q = parseInt(qStr, 10);
    var pError = '';
    var qError = '';

    if (pStr === '' || isNaN(p)) {
      pError = '请输入数值';
    } else if (p < 2 || p > 997) {
      pError = 'p 应在 2~997 之间（演示限制）';
    } else if (!isPrime(p)) {
      pError = 'p 不是素数';
    }

    if (qStr === '' || isNaN(q)) {
      qError = '请输入数值';
    } else if (q < 2 || q > 997) {
      qError = 'q 应在 2~997 之间（演示限制）';
    } else if (!isPrime(q)) {
      qError = 'q 不是素数';
    }

    if (!pError && !qError && p === q) {
      qError = 'p 和 q 必须不同';
    }

    this.setData({ pError: pError, qError: qError });
    return { p: p, q: q, valid: !pError && !qError };
  },

  onPInput: function(e) {
    this.setData({ inputP: e.detail.value, primeIndexP: -1 });
    this._updateFromInputs();
  },

  onQInput: function(e) {
    this.setData({ inputQ: e.detail.value, primeIndexQ: -1 });
    this._updateFromInputs();
  },

  onPSelect: function(e) {
    var idx = parseInt(e.detail.value, 10);
    var val = PRIMES_2_997[idx];
    this.setData({ primeIndexP: idx, inputP: '' + val });
    this._updateFromInputs();
  },

  onQSelect: function(e) {
    var idx = parseInt(e.detail.value, 10);
    var val = PRIMES_2_997[idx];
    this.setData({ primeIndexQ: idx, inputQ: '' + val });
    this._updateFromInputs();
  },

  // ── 随机选择 ──

  onRandomP: function() {
    var idx = Math.floor(Math.random() * PRIMES_2_997.length);
    var val = PRIMES_2_997[idx];
    this.setData({ primeIndexP: idx, inputP: '' + val });
    this._updateFromInputs();
  },

  onRandomQ: function() {
    var idx = Math.floor(Math.random() * PRIMES_2_997.length);
    var val = PRIMES_2_997[idx];
    this.setData({ primeIndexQ: idx, inputQ: '' + val });
    this._updateFromInputs();
  },

  // ── 密钥生成 ──

  onGenerateKeypair: function() {
    var result = this._updateFromInputs();
    if (!result.valid) {
      wx.showToast({ title: '请检查素数输入', icon: 'none' });
      return;
    }

    try {
      var key = generateKeypair(result.p, result.q);
      // 添加展示用计算字段
      var edProduct = key.e * key.d;
      var edQuotient = Math.floor(edProduct / key.phi);
      var edRemainder = edProduct % key.phi;
      var verifyDetail = key.e + '×' + key.d + ' = ' + edProduct + ' = ' + edQuotient + '×' + key.phi + ' + ' + edRemainder;
      key._verifyDetail = verifyDetail;
      // 弱密钥检测：Wiener 攻击条件 d < n^(1/4)/3
      var nRoot4 = Math.pow(key.n, 0.25);
      var wienerThreshold = nRoot4 / 3;
      var wienerWarning = '';
      if (key.d < wienerThreshold) {
        wienerWarning = '此私钥偏小（d=' + key.d + ' < n^(1/4)/3 ≈ ' + Math.round(wienerThreshold) + '），存在 Wiener 攻击风险';
      }
      this.setData({ keypair: key, wienerWarning: wienerWarning, encrypted: null, decrypted: null, modPowSteps: null });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  // ── 加密/解密 ──

  onEncrypt: function() {
    if (!this.data.keypair) {
      wx.showToast({ title: '请先生成密钥对', icon: 'none' });
      return;
    }
    var mStr = this.data.plaintext.trim();
    var m = parseInt(mStr, 10);
    if (isNaN(m) || mStr === '') {
      wx.showToast({ title: '请输入有效明文', icon: 'none' });
      return;
    }
    if (m >= this.data.keypair.n) {
      wx.showToast({ title: '明文必须小于 n（当前 n=' + this.data.keypair.n + '）', icon: 'none' });
      return;
    }

    var c = encrypt(m, this.data.keypair.e, this.data.keypair.n);
    var steps = modPowWithSteps(m, this.data.keypair.e, this.data.keypair.n);
    this.setData({
      encrypted: c,
      decrypted: null,
      modPowSteps: steps,
      modPowLabel: m + '^' + this.data.keypair.e + ' mod ' + this.data.keypair.n
    });
  },

  onDecrypt: function() {
    if (!this.data.keypair) {
      wx.showToast({ title: '请先生成密钥对', icon: 'none' });
      return;
    }
    var cStr = this.data.ciphertext.trim();
    var c = parseInt(cStr, 10);
    if (isNaN(c) || cStr === '') {
      wx.showToast({ title: '请输入有效密文', icon: 'none' });
      return;
    }

    var m = decrypt(c, this.data.keypair.d, this.data.keypair.n);
    var steps = modPowWithSteps(c, this.data.keypair.d, this.data.keypair.n);
    this.setData({
      decrypted: m,
      encrypted: null,
      modPowSteps: steps,
      modPowLabel: c + '^' + this.data.keypair.d + ' mod ' + this.data.keypair.n
    });
  },

  onPlaintextInput: function(e) {
    this.setData({ plaintext: e.detail.value });
  },

  onCiphertextInput: function(e) {
    this.setData({ ciphertext: e.detail.value });
  },

  // ── 模幂过程展开 ──

  onToggleDetails: function() {
    this.setData({ showDetails: !this.data.showDetails });
  },

  // ── 文字模式 ──

  onTextModePlainInput: function(e) {
    this.setData({ textModePlain: e.detail.value });
  },

  onTextModeTypeChange: function(e) {
    this.setData({ textModeType: e.detail.value });
  },

  onTextModeRun: function() {
    if (!this.data.keypair) {
      wx.showToast({ title: '请先生成密钥对', icon: 'none' });
      return;
    }
    var text = this.data.textModePlain;
    if (!text) {
      wx.showToast({ title: '请输入文本', icon: 'none' });
      return;
    }

    // 检查是否包含非 ASCII 字符
    for (var i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) > 127) {
        wx.showToast({ title: '暂只支持 ASCII 字符', icon: 'none' });
        return;
      }
    }

    var key = this.data.keypair;
    var results = [];
    var isEncrypt = this.data.textModeType === 'encrypt';

    for (var j = 0; j < text.length; j++) {
      var code = text.charCodeAt(j);
      if (code >= key.n) {
        wx.showToast({ title: '字符码值 (' + code + ') 超出 n=' + key.n + '，请换更大 p/q', icon: 'none' });
        return;
      }
      var out;
      if (isEncrypt) {
        out = encrypt(code, key.e, key.n);
      } else {
        out = decrypt(code, key.d, key.n);
      }
      results.push({ char: text[j], code: code, out: out });
    }

    this.setData({ textModeResult: results });
  },

  onTextModeClear: function() {
    this.setData({ textModePlain: '', textModeResult: null });
  }
});
