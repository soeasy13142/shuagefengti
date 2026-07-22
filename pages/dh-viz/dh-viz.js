/**
 * DH 密钥交换 页面逻辑
 */

const { modPow, isPrimitiveRoot, findPrimitiveRoots, generateKeypair, computeSharedKey, bruteForceDiscreteLog } = require('../../utils/dh-core');
const { generateMitmScenario } = require('../../utils/dh-mitm');

// 可用素数列表（与 RSA 一致的 p ≤ 997 限制）
const PRESET_PRIMES = [13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];

const ANIM_INTERVAL_MS = 1500;

Page({
  data: {
    // 参数
    presetPrimes: PRESET_PRIMES,
    p: 997,
    g: 7,
    availableRoots: [],
    scene: 'normal',  // 'normal' | 'mitm'

    // 参与者
    alice: null,
    bob: null,
    eve: null,

    // 密钥一致性
    keysMatch: null,

    // 步进
    steps: [],
    currentStep: 0,
    totalSteps: 0,
    isPlaying: false,
    playSpeed: 1,

    // 离散对数
    showDiscreteLog: false,
    discreteLogResult: null,
    discreteLogPct: '0.0',

    // 面板间箭头状态（Alice↔Eve/Bob）
    arrowState: { visible: false, direction: 'right', label: '', isMitm: false },
    // 面板间箭头状态（Eve↔Bob，MITM 模式专用）
    arrowEveState: { visible: false, direction: 'right', label: '', isMitm: false },

    // 状态
    hasExchanged: false,

    // DH 提示浮层
    dhTipVisible: false,
    dhTipTitle: '',
    dhTipBody: '',
    dhTips: {
      alice: { title: 'Alice 的私钥', body: 'Alice 随机选择一个私密数字 a（或手动输入），计算公钥 A = g^a mod p 发送给 Bob。公钥公开，私钥绝不泄露。' },
      bob: { title: 'Bob 的私钥', body: 'Bob 随机选择私密数字 b，计算公钥 B = g^b mod p 发送给 Alice。即使 Eve 监听到公钥 A 和 B，也无法反推私钥 a 和 b。' },
      channel: { title: '公共信道与 MITM', body: '所有通信在公共信道上传输，Eve 可以看到公钥 A 和 B。但是因为没有私钥 a 或 b，Eve 无法计算共享密钥。⛔ 如果开启 MITM 模式，Eve 会拦截公钥并替换为自己的，导致 Alice 和 Bob 的密钥不一致。' }
    }
  },

  _playTimer: null,

  onLoad: function() {
    this._updateAvailableRoots();
  },

  onUnload: function() {
    this._stopAutoPlay();
  },

  // ── 参数更新 ──

  _updateAvailableRoots: function() {
    const p = this.data.p;
    const roots = findPrimitiveRoots(p);
    const defaultG = roots.length > 0 ? roots[0] : 2;
    this.setData({
      availableRoots: roots,
      g: defaultG
    });
  },

  // ── 事件处理 ──

  onPrimeChange: function(e) {
    const p = parseInt(e.detail.value, 10);
    this.setData({ p: p });
    this._updateAvailableRoots();
    this._resetExchange();
  },

  onGChange: function(e) {
    const g = parseInt(e.detail.value, 10);
    this.setData({ g: g });
  },

  onSceneChange: function(e) {
    const scene = e.detail.value;
    this.setData({ scene: scene });
    this._resetExchange();
  },

  onRandomAlice: function() {
    const p = this.data.p;
    const priv = Math.floor(Math.random() * (p - 3)) + 2;
    this.setData({
      'alice.privateKey': priv
    });
  },

  onRandomBob: function() {
    const p = this.data.p;
    const priv = Math.floor(Math.random() * (p - 3)) + 2;
    this.setData({
      'bob.privateKey': priv
    });
  },

  onAlicePrivInput: function(e) {
    const val = parseInt(e.detail.value, 10);
    if (!isNaN(val) && val > 1 && val < this.data.p) {
      this.setData({ 'alice.privateKey': val });
    }
  },

  onBobPrivInput: function(e) {
    const val = parseInt(e.detail.value, 10);
    if (!isNaN(val) && val > 1 && val < this.data.p) {
      this.setData({ 'bob.privateKey': val });
    }
  },

  // ── 主操作 ──

  onStartExchange: function() {
    this._stopAutoPlay();

    const p = this.data.p;
    const g = this.data.g;
    const scene = this.data.scene;

    // 自动生成私钥（若未设定）
    const alicePriv = this.data.alice && this.data.alice.privateKey > 1
      ? this.data.alice.privateKey
      : Math.floor(Math.random() * (p - 3)) + 2;
    const bobPriv = this.data.bob && this.data.bob.privateKey > 1
      ? this.data.bob.privateKey
      : Math.floor(Math.random() * (p - 3)) + 2;

    if (scene === 'mitm') {
      const evePriv = Math.floor(Math.random() * (p - 3)) + 2;
      const scenario = generateMitmScenario(p, g, alicePriv, bobPriv, evePriv);
      this.setData({
        alice: scenario.alice,
        bob: scenario.bob,
        eve: scenario.eve,
        steps: scenario.steps,
        currentStep: 0,
        totalSteps: scenario.steps.length,
        keysMatch: false,
        hasExchanged: true,
        isPlaying: true
      });
    } else {
      // 正常交换
      const aliceKey = generateKeypair(p, g, alicePriv);
      const bobKey = generateKeypair(p, g, bobPriv);

      const sharedA = computeSharedKey(bobKey.publicKey, alicePriv, p);
      const sharedB = computeSharedKey(aliceKey.publicKey, bobPriv, p);

      const alice = {
        name: 'Alice',
        privateKey: alicePriv,
        publicKey: aliceKey.publicKey,
        receivedPublicKey: bobKey.publicKey,
        sharedKey: sharedA
      };
      const bob = {
        name: 'Bob',
        privateKey: bobPriv,
        publicKey: bobKey.publicKey,
        receivedPublicKey: aliceKey.publicKey,
        sharedKey: sharedB
      };

      const steps = [
        {
          step: 1,
          from: 'Alice',
          to: 'Bob',
          type: 'sendPublicKey',
          payload: { key: aliceKey.publicKey, explanation: 'Alice 发送公钥 A=' + aliceKey.publicKey + ' 给 Bob' }
        },
        {
          step: 2,
          from: 'Bob',
          to: 'Alice',
          type: 'sendPublicKey',
          payload: { key: bobKey.publicKey, explanation: 'Bob 发送公钥 B=' + bobKey.publicKey + ' 给 Alice' }
        },
        {
          step: 3,
          from: 'Alice',
          to: 'Alice',
          type: 'computeSharedKey',
          payload: { key: sharedA, explanation: 'Alice 计算共享密钥 K = B^a mod p = ' + sharedA }
        },
        {
          step: 4,
          from: 'Bob',
          to: 'Bob',
          type: 'computeSharedKey',
          payload: { key: sharedB, explanation: 'Bob 计算共享密钥 K = A^b mod p = ' + sharedB }
        }
      ];

      this.setData({
        alice: alice,
        bob: bob,
        eve: null,
        steps: steps,
        currentStep: 0,
        totalSteps: steps.length,
        keysMatch: sharedA === sharedB,
        hasExchanged: true,
        isPlaying: true
      });
    }

    // 开始自动步进
    this._startAutoPlay();
  },

  onReset: function() {
    this._stopAutoPlay();
    this._resetExchange();
  },

  onPause: function() {
    this._stopAutoPlay();
    this.setData({ isPlaying: false });
  },

  onResume: function() {
    if (this.data.currentStep >= this.data.totalSteps) return;
    this.setData({ isPlaying: true });
    this._startAutoPlay();
  },

  onStepPrev: function() {
    this._stopAutoPlay();
    const prev = Math.max(0, this.data.currentStep - 1);
    this.setData({
      currentStep: prev,
      isPlaying: false
    });
    this._updateArrowState();
  },

  onStepNext: function() {
    this._stopAutoPlay();
    const next = Math.min(this.data.totalSteps, this.data.currentStep + 1);
    this.setData({
      currentStep: next,
      isPlaying: false
    });
    this._updateArrowState();
    if (next >= this.data.totalSteps) {
      this._onExchangeComplete();
    }
  },

  onSliderStepChange: function(e) {
    const step = parseInt(e.detail.value, 10);
    this.setData({ currentStep: step, isPlaying: false });
    this._stopAutoPlay();
    this._updateArrowState();
    if (step >= this.data.totalSteps) {
      this._onExchangeComplete();
    }
  },

  onToggleDiscreteLog: function() {
    this.setData({
      showDiscreteLog: !this.data.showDiscreteLog
    });

    if (!this.data.showDiscreteLog && !this.data.discreteLogResult) {
      this._computeDiscreteLog();
    }
  },

  // ── 离散对数 ──

  _computeDiscreteLog: function() {
    if (!this.data.alice || !this.data.hasExchanged) return;

    const g = this.data.g;
    const p = this.data.p;
    const target = this.data.alice.publicKey;

    const result = bruteForceDiscreteLog(g, p, target);
    const pct = result.totalSpace > 0 ? (result.attempts / result.totalSpace * 100) : 0;
    this.setData({ discreteLogResult: result, discreteLogPct: pct.toFixed(1) });
  },

  // ── 面板间箭头状态 ──

  _updateArrowState: function() {
    const { currentStep, steps, scene } = this.data;
    let arrowState = { visible: false, direction: 'right', label: '', isMitm: false };
    let arrowEveState = { visible: false, direction: 'right', label: '', isMitm: false };

    if (!steps || steps.length === 0 || currentStep <= 0 || currentStep > steps.length) {
      this.setData({ arrowState: arrowState, arrowEveState: arrowEveState });
      return;
    }

    const step = steps[currentStep - 1];
    const isMessageStep = step.type === 'sendPublicKey' || step.type === 'mitmIntercept';

    if (!isMessageStep) {
      this.setData({ arrowState: arrowState, arrowEveState: arrowEveState });
      return;
    }

    const from = step.from;
    const to = step.to;
    const direction = (to === 'Bob' || to === 'Eve') ? 'right' : 'left';
    const isMitm = scene === 'mitm';

    // Build label
    var label = '';
    if (step.type === 'mitmIntercept') {
      label = '✕ 拦截';
    } else if (step.payload && step.payload.key !== undefined) {
      var prefix = from === 'Alice' ? 'A' : from === 'Bob' ? 'B' : 'E';
      label = prefix + '=' + step.payload.key;
    }

    var arrowData = { visible: true, direction: direction, label: label, isMitm: isMitm };

    // Route arrow to the correct gap between panels
    if (scene === 'mitm') {
      if ((from === 'Alice' && to === 'Eve') || (from === 'Eve' && to === 'Alice')) {
        arrowState = arrowData;
      } else if ((from === 'Eve' && to === 'Bob') || (from === 'Bob' && to === 'Eve')) {
        arrowEveState = arrowData;
      }
    } else {
      // Normal mode: single arrow between Alice and Bob
      arrowState = arrowData;
    }

    this.setData({ arrowState: arrowState, arrowEveState: arrowEveState });
  },

  // ── 动画控制 ──

  _startAutoPlay: function() {
    this._stopAutoPlay();
    const interval = ANIM_INTERVAL_MS / this.data.playSpeed;

    this._playTimer = setInterval(() => {
      const next = this.data.currentStep + 1;
      if (next >= this.data.totalSteps) {
        this.setData({
          currentStep: next,
          isPlaying: false
        });
        this._updateArrowState();
        this._onExchangeComplete();
        this._stopAutoPlay();
        return;
      }
      this.setData({ currentStep: next });
      this._updateArrowState();
    }, interval);
  },

  _stopAutoPlay: function() {
    if (this._playTimer) {
      clearInterval(this._playTimer);
      this._playTimer = null;
    }
  },

  _onExchangeComplete: function() {
    // 完成时自动计算离散对数
    if (!this.data.discreteLogResult) {
      this._computeDiscreteLog();
    }
  },

  // ── 私有 ──

  _resetExchange: function() {
    this.setData({
      alice: null,
      bob: null,
      eve: null,
      steps: [],
      currentStep: 0,
      totalSteps: 0,
      keysMatch: null,
      hasExchanged: false,
      discreteLogResult: null,
      showDiscreteLog: false,
      isPlaying: false
    });
  },

  // ── DH 提示浮层 ──

  onDhTipTap: function(e) {
    var tipKey = e.currentTarget.dataset.tip;
    var tip = this.data.dhTips[tipKey];
    if (!tip) return;
    this.setData({
      dhTipTitle: tip.title,
      dhTipBody: tip.body,
      dhTipVisible: true
    });
  },

  onDhTipClose: function() {
    this.setData({ dhTipVisible: false });
  },

  noop: function() {}
});
