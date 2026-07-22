/**
 * 密码工具箱页面
 * 集成凯撒密码、维吉尼亚密码、栅栏密码三种古典密码
 * @module pages/crypto-tools/crypto-tools
 */

const {
  caesarEncrypt,
  caesarDecrypt,
  caesarBruteForce
} = require('../../utils/cipher-caesar');
const {
  vigenereEncrypt,
  vigenereDecrypt,
  vigenereWithSteps
} = require('../../utils/cipher-vigenere');
const {
  railFenceEncrypt,
  railFenceDecrypt,
  railFenceBruteForce,
  railFenceStructure
} = require('../../utils/cipher-railfence');
const {
  analyzeFrequency,
  STANDARD_ENGLISH_FREQ
} = require('../../utils/cipher-freq');

const MAX_INPUT_LENGTH = 5000;

/**
 * Preset examples for each cipher
 */
const PRESETS = {
  caesar: [
    { label: 'The quick brown fox', text: 'The quick brown fox jumps over the lazy dog' },
    { label: 'I came I saw', text: 'I came I saw I conquered' },
    { label: 'Hello World', text: 'Hello, World!' },
    { label: 'ALL UPPERCASE', text: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG' },
    { label: '密码学名言', text: 'Ciphers are the keys to secrets, old and new' }
  ],
  vigenere: [
    { label: 'Attack at dawn', text: 'ATTACK AT DAWN' },
    { label: 'Meet me at', text: 'Meet me at the usual place' },
    { label: 'Hello World', text: 'Hello, World!' },
    { label: 'Secret message', text: 'This is a secret message for you' },
    { label: 'Caesar quote', text: 'Veni vidi vici' }
  ],
  railfence: [
    { label: 'We are discovered', text: 'WE ARE DISCOVERED FLEE AT ONCE' },
    { label: 'Hello World', text: 'Hello, World!' },
    { label: 'Programming', text: 'Programming is fun' },
    { label: 'Secret code', text: 'This is a secret code' },
    { label: 'Long message', text: 'The quick brown fox jumps over the lazy dog' }
  ]
};

Page({
  data: {
    // Tab
    activeTab: 'caesar',

    // Caesar
    caesarShift: 3,
    caesarInput: '',
    caesarResult: '',
    caesarShowBruteForce: false,
    caesarBruteForceResults: [],
    caesarShowFreq: false,
    caesarFreqResults: [],
    caesarStdFreq: STANDARD_ENGLISH_FREQ,

    // Vigenere
    vigenereKey: '',
    vigenereInput: '',
    vigenereResult: '',
    vigenereShowSteps: false,
    vigenereStepData: null,

    // Rail Fence
    railFenceRails: 3,
    railFenceInput: '',
    railFenceResult: '',
    railFenceShowStructure: false,
    railFenceStructureData: null,
    railFenceShowBruteForce: false,
    railFenceBruteForceResults: [],

    // Common
    maxInputLength: MAX_INPUT_LENGTH
  },

  // ── Tab switching ──

  /** Switch active tab */
  onTabSwitch: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // ── Preset selection ──

  /** Select preset text for current tab */
  onPresetSelect: function (e) {
    const { tab } = e.currentTarget.dataset;
    const index = parseInt(e.detail.value, 10);
    const preset = PRESETS[tab][index];
    if (!preset) return;
    const key = tab + 'Input';
    this.setData({ [key]: preset.text });
  },

  // ── Input field handlers ──

  onCaesarInput: function (e) {
    this.setData({ caesarInput: e.detail.value });
  },

  onCaesarShiftInput: function (e) {
    this.setData({ caesarShift: parseInt(e.detail.value, 10) || 0 });
  },

  onVigenereInput: function (e) {
    this.setData({ vigenereInput: e.detail.value });
  },

  onVigenereKeyInput: function (e) {
    this.setData({ vigenereKey: e.detail.value });
  },

  onRailFenceInput: function (e) {
    this.setData({ railFenceInput: e.detail.value });
  },

  onRailFenceRailsInput: function (e) {
    this.setData({ railFenceRails: parseInt(e.detail.value, 10) || 2 });
  },

  // ── Caesar cipher operations ──

  /** Encrypt with Caesar cipher */
  onCaesarEncrypt: function () {
    const text = this.data.caesarInput;
    if (!text) {
      wx.showToast({ title: '请输入文本', icon: 'none' });
      return;
    }
    if (text.length > MAX_INPUT_LENGTH) {
      wx.showToast({ title: '输入过长，请缩减', icon: 'none' });
      return;
    }
    const shift = Math.max(1, Math.min(25, this.data.caesarShift || 3));
    const result = caesarEncrypt(text, shift);
    this.setData({ caesarResult: result, caesarShift: shift });
  },

  /** Decrypt with Caesar cipher */
  onCaesarDecrypt: function () {
    const text = this.data.caesarInput;
    if (!text) {
      wx.showToast({ title: '请输入文本', icon: 'none' });
      return;
    }
    if (text.length > MAX_INPUT_LENGTH) {
      wx.showToast({ title: '输入过长，请缩减', icon: 'none' });
      return;
    }
    const shift = Math.max(1, Math.min(25, this.data.caesarShift || 3));
    const result = caesarDecrypt(text, shift);
    this.setData({ caesarResult: result, caesarShift: shift });
  },

  /** Toggle brute force panel */
  onCaesarToggleBruteForce: function () {
    const show = !this.data.caesarShowBruteForce;
    let results = this.data.caesarBruteForceResults;
    if (show && results.length === 0 && this.data.caesarInput) {
      results = caesarBruteForce(this.data.caesarInput);
    }
    this.setData({
      caesarShowBruteForce: show,
      caesarBruteForceResults: results
    });
  },

  /** Toggle frequency analysis panel */
  onCaesarToggleFreq: function () {
    const show = !this.data.caesarShowFreq;
    let results = this.data.caesarFreqResults;
    if (show && results.length === 0 && this.data.caesarInput) {
      results = analyzeFrequency(this.data.caesarInput);
    }
    this.setData({
      caesarShowFreq: show,
      caesarFreqResults: results
    });
  },

  // ── Vigenere cipher operations ──

  /** Encrypt with Vigenere cipher */
  onVigenereEncrypt: function () {
    const text = this.data.vigenereInput;
    const key = this.data.vigenereKey;
    if (!text) {
      wx.showToast({ title: '请输入文本', icon: 'none' });
      return;
    }
    if (!key || !key.trim()) {
      wx.showToast({ title: '请输入密钥', icon: 'none' });
      return;
    }
    if (text.length > MAX_INPUT_LENGTH) {
      wx.showToast({ title: '输入过长，请缩减', icon: 'none' });
      return;
    }
    try {
      const result = vigenereEncrypt(text, key);
      this.setData({ vigenereResult: result });
    } catch (err) {
      wx.showToast({ title: err.message || '加密失败', icon: 'none' });
    }
  },

  /** Decrypt with Vigenere cipher */
  onVigenereDecrypt: function () {
    const text = this.data.vigenereInput;
    const key = this.data.vigenereKey;
    if (!text) {
      wx.showToast({ title: '请输入文本', icon: 'none' });
      return;
    }
    if (!key || !key.trim()) {
      wx.showToast({ title: '请输入密钥', icon: 'none' });
      return;
    }
    if (text.length > MAX_INPUT_LENGTH) {
      wx.showToast({ title: '输入过长，请缩减', icon: 'none' });
      return;
    }
    try {
      const result = vigenereDecrypt(text, key);
      this.setData({ vigenereResult: result });
    } catch (err) {
      wx.showToast({ title: err.message || '解密失败', icon: 'none' });
    }
  },

  /** Toggle step-by-step panel */
  onVigenereToggleSteps: function () {
    const show = !this.data.vigenereShowSteps;
    let stepData = this.data.vigenereStepData;
    if (show && (!stepData || !stepData.result) && this.data.vigenereInput && this.data.vigenereKey) {
      try {
        stepData = vigenereWithSteps(this.data.vigenereInput, this.data.vigenereKey);
      } catch (err) {
        wx.showToast({ title: err.message || '计算失败', icon: 'none' });
        stepData = this.data.vigenereStepData;
      }
    }
    this.setData({
      vigenereShowSteps: show,
      vigenereStepData: show ? stepData : this.data.vigenereStepData
    });
  },

  // ── Rail Fence cipher operations ──

  /** Encrypt with Rail Fence cipher */
  onRailFenceEncrypt: function () {
    const text = this.data.railFenceInput;
    if (!text) {
      wx.showToast({ title: '请输入文本', icon: 'none' });
      return;
    }
    if (text.length > MAX_INPUT_LENGTH) {
      wx.showToast({ title: '输入过长，请缩减', icon: 'none' });
      return;
    }
    const rails = Math.max(2, Math.min(20, this.data.railFenceRails || 2));
    const result = railFenceEncrypt(text, rails);
    this.setData({ railFenceResult: result, railFenceRails: rails });
  },

  /** Decrypt with Rail Fence cipher */
  onRailFenceDecrypt: function () {
    const text = this.data.railFenceInput;
    if (!text) {
      wx.showToast({ title: '请输入文本', icon: 'none' });
      return;
    }
    if (text.length > MAX_INPUT_LENGTH) {
      wx.showToast({ title: '输入过长，请缩减', icon: 'none' });
      return;
    }
    const rails = Math.max(2, Math.min(20, this.data.railFenceRails || 2));
    const result = railFenceDecrypt(text, rails);
    this.setData({ railFenceResult: result, railFenceRails: rails });
  },

  /** Toggle structure panel */
  onRailFenceToggleStructure: function () {
    const show = !this.data.railFenceShowStructure;
    let structData = this.data.railFenceStructureData;
    if (show && (!structData || !structData.grid) && this.data.railFenceInput) {
      const rails = Math.max(2, Math.min(20, this.data.railFenceRails || 2));
      structData = railFenceStructure(this.data.railFenceInput, rails);
    }
    this.setData({
      railFenceShowStructure: show,
      railFenceStructureData: show ? structData : this.data.railFenceStructureData
    });
  },

  /** Toggle brute force panel */
  onRailFenceToggleBruteForce: function () {
    const show = !this.data.railFenceShowBruteForce;
    let results = this.data.railFenceBruteForceResults;
    if (show && results.length === 0 && this.data.railFenceInput) {
      results = railFenceBruteForce(this.data.railFenceInput);
    }
    this.setData({
      railFenceShowBruteForce: show,
      railFenceBruteForceResults: results
    });
  }
});
