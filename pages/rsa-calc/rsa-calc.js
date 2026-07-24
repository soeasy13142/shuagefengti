const { generateKeypair, encrypt, decrypt, modPowWithSteps, modPow, isPrime, gcd, extendedGcd, detectWeakKey } = require('../../utils/rsa-core');
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
    weakKeyWarnings: [],

    // 共模检测
    knownKeys: [],

    // 扩展欧几里得步骤展开
    showEeDetails: false,

    // 文字模式
    textModePlain: '',
    textModeResult: null,
    textModeType: 'encrypt', // 'encrypt' | 'decrypt'
    textModeOutput: '',

    // 引导弹窗
    showRsaIntro: false,
    rsaIntroContent: [
      {
        icon: '🔑',
        title: '选择素数',
        body: '从内置素数表中选择两个素数 p 和 q（或手动输入）。\n工具会自动计算 n = p × q 和 φ(n) = (p-1)(q-1)。\n\n提示：建议选小素数（2-100），计算过程更清晰。'
      },
      {
        icon: '⚙️',
        title: '生成密钥',
        body: '选择公钥指数 e（通常选 65537 或 3、5）。\n工具会用扩展欧几里得算法计算私钥 d ≡ e⁻¹ mod φ(n)。\n\n数学过程每一步都展开展示，可以跟踪模逆的计算。'
      },
      {
        icon: '🔐',
        title: '加密与解密',
        body: '输入明文消息（数字形式），点击「加密」查看密文。\n点击「解密」验证原始消息可以还原。\n\n模幂运算使用快速幂算法，二进制分解过程可逐位追踪。'
      }
    ]
  },

  onLoad: function() {
    this._updateFromInputs();
    let showIntro = false;
    try {
      showIntro = !wx.getStorageSync('intro_seen_rsa');
    } catch(e) {}
    this.setData({ showRsaIntro: showIntro });
  },

  // ── 素数输入 ──

  _updateFromInputs: function() {
    const pStr = this.data.inputP.trim();
    const qStr = this.data.inputQ.trim();
    const p = parseInt(pStr, 10);
    const q = parseInt(qStr, 10);
    let pError = '';
    let qError = '';

    if (pStr === '' || isNaN(p)) {
      pError = '请输入数值';
    } else if (p <= 2 || p > 997) {
      pError = 'p 应在 3~997 之间（演示限制，p=2 会导致 n 可被轻易分解）';
    } else if (!isPrime(p)) {
      pError = 'p 不是素数';
    }

    if (qStr === '' || isNaN(q)) {
      qError = '请输入数值';
    } else if (q <= 2 || q > 997) {
      qError = 'q 应在 3~997 之间（演示限制，q=2 会导致 n 可被轻易分解）';
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
    const idx = parseInt(e.detail.value, 10);
    const val = PRIMES_2_997[idx];
    this.setData({ primeIndexP: idx, inputP: '' + val });
    this._updateFromInputs();
  },

  onQSelect: function(e) {
    const idx = parseInt(e.detail.value, 10);
    const val = PRIMES_2_997[idx];
    this.setData({ primeIndexQ: idx, inputQ: '' + val });
    this._updateFromInputs();
  },

  // ── 随机选择 ──

  onRandomP: function() {
    const idx = Math.floor(Math.random() * PRIMES_2_997.length);
    const val = PRIMES_2_997[idx];
    this.setData({ primeIndexP: idx, inputP: '' + val });
    this._updateFromInputs();
  },

  onRandomQ: function() {
    const idx = Math.floor(Math.random() * PRIMES_2_997.length);
    const val = PRIMES_2_997[idx];
    this.setData({ primeIndexQ: idx, inputQ: '' + val });
    this._updateFromInputs();
  },

  // ── 密钥生成 ──

  onGenerateKeypair: function() {
    const result = this._updateFromInputs();
    if (!result.valid) {
      wx.showToast({ title: '请检查素数输入', icon: 'none' });
      return;
    }

    try {
      const key = generateKeypair(result.p, result.q);
      // 添加展示用计算字段
      const edProduct = key.e * key.d;
      const edQuotient = Math.floor(edProduct / key.phi);
      const edRemainder = edProduct % key.phi;
      const verifyDetail = key.e + '×' + key.d + ' = ' + edProduct + ' = ' + edQuotient + '×' + key.phi + ' + ' + edRemainder;
      key._verifyDetail = verifyDetail;

      // 弱密钥检测（含 Wiener + 共模）
      const knownKeys = this.data.knownKeys;
      const warnings = detectWeakKey(key, { knownKeys: knownKeys });
      let wienerWarning = '';
      const weakKeyWarnings = [];
      for (let i = 0; i < warnings.length; i++) {
        const w = warnings[i];
        if (w.indexOf('Wiener') !== -1) {
          wienerWarning = w;
        } else {
          weakKeyWarnings.push(w);
        }
      }

      // 记录已知密钥（用于共模检测），上限 50 条
      knownKeys.push({ n: key.n, e: key.e });
      if (knownKeys.length > 50) knownKeys.shift();

      this.setData({
        keypair: key,
        wienerWarning: wienerWarning,
        weakKeyWarnings: weakKeyWarnings,
        knownKeys: knownKeys,
        encrypted: null,
        decrypted: null,
        modPowSteps: null,
        showEeDetails: false
      });
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
    const mStr = this.data.plaintext.trim();
    const m = parseInt(mStr, 10);
    if (isNaN(m) || mStr === '') {
      wx.showToast({ title: '请输入有效明文', icon: 'none' });
      return;
    }
    if (m >= this.data.keypair.n) {
      wx.showToast({ title: '明文必须小于 n（当前 n=' + this.data.keypair.n + '）', icon: 'none' });
      return;
    }

    const c = encrypt(m, this.data.keypair.e, this.data.keypair.n);
    const steps = modPowWithSteps(m, this.data.keypair.e, this.data.keypair.n);
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
    const cStr = this.data.ciphertext.trim();
    const c = parseInt(cStr, 10);
    if (isNaN(c) || cStr === '') {
      wx.showToast({ title: '请输入有效密文', icon: 'none' });
      return;
    }

    const m = decrypt(c, this.data.keypair.d, this.data.keypair.n);
    const steps = modPowWithSteps(c, this.data.keypair.d, this.data.keypair.n);
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

  onToggleEeDetails: function() {
    this.setData({ showEeDetails: !this.data.showEeDetails });
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
    const text = this.data.textModePlain;
    if (!text) {
      wx.showToast({ title: '请输入文本', icon: 'none' });
      return;
    }

    // 检查是否包含非 ASCII 字符
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) > 127) {
        wx.showToast({ title: '暂只支持 ASCII 字符', icon: 'none' });
        return;
      }
    }

    const key = this.data.keypair;
    const results = [];
    const isEncrypt = this.data.textModeType === 'encrypt';

    for (let j = 0; j < text.length; j++) {
      const code = text.charCodeAt(j);
      if (code >= key.n) {
        wx.showToast({ title: '字符码值 (' + code + ') 超出 n=' + key.n + '，请换更大 p/q', icon: 'none' });
        return;
      }
      let out;
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
  },

  // ── 引导弹窗 ──

  onRsaIntroClose: function() {
    this.setData({ showRsaIntro: false });
    try { wx.setStorageSync('intro_seen_rsa', true); } catch(e) {}
  }
});
