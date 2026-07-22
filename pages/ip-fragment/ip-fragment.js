const { fragment, randomId } = require('../../utils/ip-fragment');
const { reassemble } = require('../../utils/ip-reassemble');

const IP_HEADER = 20;
const SLIDER_DEBOUNCE_MS = 300;
const ANIM_DELAY_MS = 800;

Page({
  data: {
    datagramSize: 1500,
    mtu: 1500,
    headerSize: IP_HEADER,
    payloadPerFragment: 0,
    totalFragments: 0,

    fragments: [],
    fragmentId: '',
    mfSummary: '',
    infoMessage: '',
    errorMessage: '',
    hasFragments: false,

    showCalc: false,

    mergeSteps: [],
    reassembling: false,
    reassemblePercent: 0,
    currentMergeStep: null,
    reassembleComplete: false,
    currentReassembleIdx: -1
  },

  _debounceTimer: null,
  _animTimer: null,

  onLoad: function() {
    this._updateParams();
  },

  onUnload: function() {
    this._stopAnim();
  },

  // ── 参数更新 ──

  _updateParams: function() {
    const mtu = this.data.mtu;
    const payload = mtu - IP_HEADER;
    const estFragments = Math.ceil(this.data.datagramSize / payload);
    this.setData({
      payloadPerFragment: payload,
      totalFragments: estFragments,
      infoMessage: this.data.datagramSize <= mtu
        ? '报文未超过 MTU，无需分片'
        : ''
    });
  },

  // ── 滑块事件（带防抖） ──

  onSizeSliding: function(e) {
    this.setData({ datagramSize: Number(e.detail.value) });
  },

  onSizeChange: function(e) {
    this.setData({ datagramSize: Number(e.detail.value) });
    this._debounceUpdate();
  },

  onMtuSliding: function(e) {
    this.setData({ mtu: Number(e.detail.value) });
  },

  onMtuChange: function(e) {
    this.setData({ mtu: Number(e.detail.value) });
    this._debounceUpdate();
  },

  _debounceUpdate: function() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._updateParams();
      this._debounceTimer = null;
    }, SLIDER_DEBOUNCE_MS);
  },

  // ── 核心操作 ──

  onFragmentTap: function() {
    this._stopAnim();
    let result;
    try {
      result = fragment(this.data.datagramSize, this.data.mtu);
    } catch (e) {
      this.setData({ errorMessage: '分片计算失败: ' + e.message });
      return;
    }

    const id = result.id;
    const mfSummary = result.fragments
      .map(function(f) { return f.mf ? '1' : '0'; })
      .join(' → ');

    this.setData({
      fragments: result.fragments,
      totalBytes: result.totalBytes,
      fragmentId: id,
      mfSummary: mfSummary,
      hasFragments: true,
      showCalc: false,
      mergeSteps: [],
      reassembling: false,
      reassemblePercent: 0,
      currentMergeStep: null,
      reassembleComplete: false,
      currentReassembleIdx: -1,
      infoMessage: result.totalFragments === 1
        ? '无需分片（报文不超过 MTU）'
        : '',
      errorMessage: ''
    });

    this._updateParams();
  },

  onReassembleTap: function() {
    if (this.data.fragments.length === 0) return;

    this._stopAnim();
    let assembled;
    try {
      assembled = reassemble(this.data.fragments);
    } catch (e) {
      this.setData({ errorMessage: '重组失败: ' + e.message });
      return;
    }

    this.setData({
      mergeSteps: assembled.mergeSteps,
      reassembling: false,
      reassemblePercent: 0,
      currentMergeStep: null,
      reassembleComplete: false,
      currentReassembleIdx: -1
    });
  },

  onToggleCalc: function() {
    this.setData({ showCalc: !this.data.showCalc });
  },

  // ── 重组动画 ──

  onToggleReassemble: function() {
    if (this.data.mergeSteps.length === 0) {
      this.onReassembleTap();
      if (this.data.mergeSteps.length === 0) return;
    }

    if (this.data.reassembling) {
      this._stopAnim();
      this.setData({ reassembling: false });
      return;
    }

    if (this.data.reassembleComplete) {
      this.setData({
        reassemblePercent: 0,
        currentMergeStep: null,
        reassembleComplete: false,
        currentReassembleIdx: -1
      });
    }

    this.setData({ reassembling: true });
    this._animTimer = setInterval(() => {
      let idx = this.data.currentReassembleIdx;
      if (idx === null || idx < 0) {
        idx = 0;
      } else {
        idx = idx + 1;
      }

      if (idx >= this.data.mergeSteps.length) {
        this._stopAnim();
        this.setData({
          reassembling: false,
          reassembleComplete: true,
          reassemblePercent: 100
        });
        return;
      }

      const step = this.data.mergeSteps[idx];
      const percent = Math.round(((idx + 1) / this.data.mergeSteps.length) * 100);
      this.setData({
        currentReassembleIdx: idx,
        currentMergeStep: step,
        reassemblePercent: percent
      });
    }, ANIM_DELAY_MS);
  },

  onPrevStep: function() {
    if (this.data.mergeSteps.length === 0) return;
    let idx = this.data.currentReassembleIdx;
    if (idx === null || idx < 0) {
      idx = 0;
    }
    const prevIdx = Math.max(0, idx - 1);
    const step = this.data.mergeSteps[prevIdx];
    const percent = Math.round(((prevIdx + 1) / this.data.mergeSteps.length) * 100);
    this.setData({
      currentReassembleIdx: prevIdx,
      currentMergeStep: step,
      reassemblePercent: percent,
      reassembleComplete: prevIdx === this.data.mergeSteps.length - 1
    });
  },

  onNextStep: function() {
    if (this.data.mergeSteps.length === 0) return;
    let idx = this.data.currentReassembleIdx;
    if (idx === null || idx < 0) {
      idx = -1;
    }
    const nextIdx = idx + 1;
    if (nextIdx >= this.data.mergeSteps.length) {
      this.setData({
        reassembleComplete: true,
        reassemblePercent: 100
      });
      return;
    }
    const step = this.data.mergeSteps[nextIdx];
    const percent = Math.round(((nextIdx + 1) / this.data.mergeSteps.length) * 100);
    this.setData({
      currentReassembleIdx: nextIdx,
      currentMergeStep: step,
      reassemblePercent: percent
    });
  },

  onResetTap: function() {
    this._stopAnim();
    this.setData({
      fragments: [],
      fragmentId: '',
      mfSummary: '',
      hasFragments: false,
      showCalc: false,
      mergeSteps: [],
      reassembling: false,
      reassemblePercent: 0,
      currentMergeStep: null,
      reassembleComplete: false,
      currentReassembleIdx: -1,
      infoMessage: '',
      errorMessage: ''
    });
    this._updateParams();
  },

  _stopAnim: function() {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
  }
});
