const subnet = require('../../utils/subnet');

// 快捷 CIDR 按钮
const QUICK_CIDRS = [8, 16, 24, 25, 26, 27, 28, 29, 30];
const IP_BIT_COUNT = 32;
const BITS_PER_OCTET = 8;

Page({
  data: {
    // IP 四段输入
    ip0: '192',
    ip1: '168',
    ip2: '1',
    ip3: '100',
    // CIDR
    cidr: 26,
    // 快捷按钮
    quickCidrs: QUICK_CIDRS,
    // 计算结果
    result: null,
    // 二进制可视化数据
    ipBits: [],
    maskBits: [],
    networkBits: [],
    broadcastBits: [],
    hostBitStart: 0,
    // 帮助说明
    showHelp: false,
    // ℹ︎ 介绍
    toolId: 'subnet-calc',
    showIntro: false,
    // 错误提示
    error: '',
    // AND 动画
    andSteps: [],
    andStepIndex: -1,
    andPlaying: false,
    andPaused: false,
    andMode: 'octet',
    andStepDesc: '点击 ▶ 演示 AND 运算',
    andIpDisplay: [],
    andMaskDisplay: [],
    andResultDisplay: []
  },

  onLoad() {
    this.calculate();
  },

  // IP 段输入
  onIp0Input(e) { this.setData({ ip0: e.detail.value }); this.calculate(); },
  onIp1Input(e) { this.setData({ ip1: e.detail.value }); this.calculate(); },
  onIp2Input(e) { this.setData({ ip2: e.detail.value }); this.calculate(); },
  onIp3Input(e) { this.setData({ ip3: e.detail.value }); this.calculate(); },

  // CIDR 滑块
  onCidrChange(e) {
    this.setData({ cidr: e.detail.value });
    this.calculate();
  },

  // 快捷 CIDR 按钮
  onQuickCidr(e) {
    const cidr = e.currentTarget.dataset.cidr;
    this.setData({ cidr: cidr });
    this.calculate();
  },

  // 切换帮助说明
  toggleHelp() {
    this.setData({ showHelp: !this.data.showHelp });
  },

  // ℹ︎ 介绍入口
  showIntro() {
    this.setData({ showIntro: true });
  },
  onIntroClose() {
    this.setData({ showIntro: false });
  },
  onIntroEnter() {
    this.setData({ showIntro: false });
  },

  // 核心计算
  calculate() {
    const { ip0, ip1, ip2, ip3, cidr } = this.data;
    const ipStr = `${ip0}.${ip1}.${ip2}.${ip3}`;

    // 校验 IP
    if (!subnet.validateIp(ipStr)) {
      this.setData({
        result: null,
        error: 'IP 地址格式不正确',
        ipBits: [],
        maskBits: [],
        networkBits: [],
        broadcastBits: []
      });
      return;
    }

    // 计算子网
    const result = subnet.calculateSubnet(ipStr, cidr);
    if (!result) {
      this.setData({
        result: null,
        error: '计算失败，请检查输入',
        ipBits: [],
        maskBits: [],
        networkBits: [],
        broadcastBits: []
      });
      return;
    }

    // 构建二进制位可视化数据
    this.setData({
      result: result,
      error: '',
      ipBits: this._buildBits(result.ipBinary, cidr),
      maskBits: this._buildBits(result.maskBinary, cidr),
      networkBits: this._buildBits(result.networkBinary, cidr),
      broadcastBits: this._buildBits(result.broadcastBinary, cidr)
    });

    // 初始化 AND 动画
    this._initAndSteps();
  },

  // 构建 32 位格子数据，标记网络位/主机位
  _buildBits(binaryArr, cidr) {
    const bits = [];
    const fullStr = binaryArr.join('');
    for (let i = 0; i < IP_BIT_COUNT; i++) {
      bits.push({
        value: fullStr[i],
        isNetwork: i < cidr,
        isOctetEnd: (i + 1) % BITS_PER_OCTET === 0 && i < IP_BIT_COUNT - 1
      });
    }
    return bits;
  },

  /* ========== AND 动画控制 ========== */

  // 初始化 AND 动画步骤
  _initAndSteps() {
    if (this._andTimer) {
      clearTimeout(this._andTimer);
      this._andTimer = null;
    }
    const { result, andMode } = this.data;
    if (!result) return;

    const steps = subnet.generateAndSteps(result.ipBinary, result.maskBinary, andMode);
    const ipFull = result.ipBinary.join('');
    const maskFull = result.maskBinary.join('');

    // 初始化三行显示数据
    const andIpDisplay = [];
    const andMaskDisplay = [];
    const andResultDisplay = [];
    for (let i = 0; i < IP_BIT_COUNT; i++) {
      andIpDisplay.push({ value: ipFull[i], state: 'and-bit-dim' });
      andMaskDisplay.push({ value: maskFull[i], state: 'and-bit-dim' });
      andResultDisplay.push({ value: '?', state: 'and-bit-dim' });
    }

    this.setData({
      andSteps: steps,
      andStepIndex: -1,
      andPlaying: false,
      andPaused: false,
      andStepDesc: '点击 ▶ 演示 AND 运算',
      andIpDisplay: andIpDisplay,
      andMaskDisplay: andMaskDisplay,
      andResultDisplay: andResultDisplay
    });
  },

  // 构建全新显示数组
  _buildDisplayArrays() {
    const ipFull = this.data.result.ipBinary.join('');
    const maskFull = this.data.result.maskBinary.join('');
    const andIpDisplay = [];
    const andMaskDisplay = [];
    const andResultDisplay = [];
    for (let i = 0; i < IP_BIT_COUNT; i++) {
      andIpDisplay.push({ value: ipFull[i], state: 'and-bit-dim' });
      andMaskDisplay.push({ value: maskFull[i], state: 'and-bit-dim' });
      andResultDisplay.push({ value: '?', state: 'and-bit-dim' });
    }
    return { andIpDisplay: andIpDisplay, andMaskDisplay: andMaskDisplay, andResultDisplay: andResultDisplay };
  },

  // 回放历史步骤到 targetIdx，标记已完成的位
  _applyHistory(allSteps, targetIdx, display) {
    for (let s = 0; s <= targetIdx; s++) {
      const st = allSteps[s];
      if (st.type === 'and-octet') {
        for (let b = 0; b < BITS_PER_OCTET; b++) {
          const idx = st.octetIndex * BITS_PER_OCTET + b;
          display.andIpDisplay[idx].state = 'and-bit-done';
          display.andMaskDisplay[idx].state = 'and-bit-done';
          display.andResultDisplay[idx] = { value: st.resultBits[b], state: st.resultBits[b] === '1' ? 'and-bit-done-1' : 'and-bit-done-0' };
        }
      } else if (st.type === 'and-bit') {
        const idx = st.bitIndex;
        display.andIpDisplay[idx].state = 'and-bit-done';
        display.andMaskDisplay[idx].state = 'and-bit-done';
        display.andResultDisplay[idx] = { value: st.resultBit, state: st.resultBit === '1' ? 'and-bit-done-1' : 'and-bit-done-0' };
      } else if (st.type === 'done') {
        for (let d = 0; d < IP_BIT_COUNT; d++) {
          display.andResultDisplay[d] = { value: st.resultBinary[Math.floor(d / BITS_PER_OCTET)][d % BITS_PER_OCTET], state: 'and-bit-done-1' };
        }
      }
    }
  },

  // 高亮当前操作位
  _highlightCurrentStep(step, display) {
    if (step.type === 'and-octet') {
      for (let b = 0; b < BITS_PER_OCTET; b++) {
        const idx = step.octetIndex * BITS_PER_OCTET + b;
        display.andIpDisplay[idx].state = 'and-bit-active';
        display.andMaskDisplay[idx].state = 'and-bit-active';
        display.andResultDisplay[idx].state = 'and-bit-active';
      }
    } else if (step.type === 'and-bit') {
      display.andIpDisplay[step.bitIndex].state = 'and-bit-active';
      display.andMaskDisplay[step.bitIndex].state = 'and-bit-active';
      display.andResultDisplay[step.bitIndex].state = 'and-bit-active';
    } else if (step.type === 'done') {
      for (let d = 0; d < IP_BIT_COUNT; d++) {
        display.andResultDisplay[d].state = 'and-bit-done-1';
      }
    }
  },

  // 应用单步到显示数据
  _applyAndStep(step, allSteps, targetIdx) {
    const display = this._buildDisplayArrays();
    this._applyHistory(allSteps, targetIdx, display);
    this._highlightCurrentStep(step, display);
    this.setData({
      andIpDisplay: display.andIpDisplay,
      andMaskDisplay: display.andMaskDisplay,
      andResultDisplay: display.andResultDisplay
    });
  },

  // 播放
  onAndPlay() {
    if (!this.data.result) return;
    if (!this.data.andSteps || this.data.andSteps.length === 0) {
      this._initAndSteps();
    }
    if (this.data.andStepIndex >= this.data.andSteps.length - 1) {
      this._initAndSteps();
    }
    this.setData({ andPlaying: true, andPaused: false });
    this._playAndNext();
  },

  _playAndNext() {
    if (!this.data.andPlaying || this.data.andPaused) return;
    const nextIdx = this.data.andStepIndex + 1;
    if (nextIdx >= this.data.andSteps.length) {
      this.setData({ andPlaying: false });
      return;
    }
    const step = this.data.andSteps[nextIdx];
    this.setData({ andStepIndex: nextIdx, andStepDesc: step.desc });
    this._applyAndStep(step, this.data.andSteps, nextIdx);
    if (step.type !== 'done') {
      const delay = this.data.andMode === 'octet' ? 800 : 200;
      this._andTimer = setTimeout(() => { this._playAndNext(); }, delay);
    } else {
      this.setData({ andPlaying: false });
    }
  },

  onAndPause() {
    this.setData({ andPaused: true, andPlaying: false });
    if (this._andTimer) {
      clearTimeout(this._andTimer);
      this._andTimer = null;
    }
  },

  onAndStepNext() {
    if (!this.data.result) return;
    if (!this.data.andSteps || this.data.andSteps.length === 0) {
      this._initAndSteps();
    }
    this.onAndPause();
    const idx = this.data.andStepIndex + 1;
    if (idx >= this.data.andSteps.length) return;
    const step = this.data.andSteps[idx];
    this.setData({ andStepIndex: idx, andStepDesc: step.desc });
    this._applyAndStep(step, this.data.andSteps, idx);
  },

  onAndStepPrev() {
    if (!this.data.result || !this.data.andSteps) return;
    this.onAndPause();
    const idx = this.data.andStepIndex - 1;
    if (idx < -1) return;
    if (idx === -1) {
      this._initAndSteps();
      return;
    }
    const step = this.data.andSteps[idx];
    this.setData({ andStepIndex: idx, andStepDesc: step.desc });
    this._applyAndStep(step, this.data.andSteps, idx);
  },

  onAndReset() {
    if (this._andTimer) {
      clearTimeout(this._andTimer);
      this._andTimer = null;
    }
    this._initAndSteps();
  },

  onAndModeChange(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode === this.data.andMode) return;
    this.setData({ andMode: mode });
    this._initAndSteps();
  }
});
