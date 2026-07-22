var { fragment, randomId } = require('../../utils/ip-fragment');
var { reassemble } = require('../../utils/ip-reassemble');

var IP_HEADER = 20;
var SLIDER_DEBOUNCE_MS = 300;

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
    var mtu = this.data.mtu;
    var payload = mtu - IP_HEADER;
    var estFragments = Math.ceil(this.data.datagramSize / payload);
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
    var self = this;
    this._debounceTimer = setTimeout(function() {
      self._updateParams();
      self._debounceTimer = null;
    }, SLIDER_DEBOUNCE_MS);
  },

  // ── 核心操作 ──

  onFragmentTap: function() {
    this._stopAnim();
    var result = fragment(this.data.datagramSize, this.data.mtu);

    var id = result.id;
    var mfSummary = result.fragments
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
    var assembled = reassemble(this.data.fragments);

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
    var delayMs = 800;
    var self = this;
    this._animTimer = setInterval(function() {
      var idx = self.data.currentReassembleIdx;
      if (idx === null || idx < 0) {
        idx = 0;
      } else {
        idx = idx + 1;
      }

      if (idx >= self.data.mergeSteps.length) {
        self._stopAnim();
        self.setData({
          reassembling: false,
          reassembleComplete: true,
          reassemblePercent: 100
        });
        return;
      }

      var step = self.data.mergeSteps[idx];
      var percent = Math.round(((idx + 1) / self.data.mergeSteps.length) * 100);
      self.setData({
        currentReassembleIdx: idx,
        currentMergeStep: step,
        reassemblePercent: percent
      });
    }, delayMs);
  },

  onPrevStep: function() {
    if (this.data.mergeSteps.length === 0) return;
    var idx = this.data.currentReassembleIdx;
    if (idx === null || idx < 0) {
      idx = 0;
    }
    var prevIdx = Math.max(0, idx - 1);
    var step = this.data.mergeSteps[prevIdx];
    var percent = Math.round(((prevIdx + 1) / this.data.mergeSteps.length) * 100);
    this.setData({
      currentReassembleIdx: prevIdx,
      currentMergeStep: step,
      reassemblePercent: percent,
      reassembleComplete: prevIdx === this.data.mergeSteps.length - 1
    });
  },

  onNextStep: function() {
    if (this.data.mergeSteps.length === 0) return;
    var idx = this.data.currentReassembleIdx;
    if (idx === null || idx < 0) {
      idx = -1;
    }
    var nextIdx = idx + 1;
    if (nextIdx >= this.data.mergeSteps.length) {
      this.setData({
        reassembleComplete: true,
        reassemblePercent: 100
      });
      return;
    }
    var step = this.data.mergeSteps[nextIdx];
    var percent = Math.round(((nextIdx + 1) / this.data.mergeSteps.length) * 100);
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
