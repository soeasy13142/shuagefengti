const { sha256 } = require('../../utils/sha256');
const { trace } = require('../../utils/sha256-trace');
const { flipFirstBit, avalancheReport } = require('../../utils/sha256-avalanche');

const SPEED_OPTIONS = ['0.5x', '1x', '2x'];
const SPEED_DELAY_MS = [1600, 800, 400];
const MAX_INPUT_BYTES = 100 * 1024;  // 100 KB hard cap

Page({
  data: {
    message: 'The quick brown fox jumps over the lazy dog',
    byteLength: 0,
    numBlocks: 0,
    rounds: [],
    currentRound: 0,
    currentRoundData: null,
    wGrid: [],
    finalHash: '',
    isPlaying: false,
    speedOptions: SPEED_OPTIONS,
    speedIndex: 1,
    speedLabel: '1x',
    avalanche: {},
    // ℹ︎ 介绍
    toolId: 'sha256-viz',
    showIntro: false
  },

  _rounds: [],
  _playTimer: null,

  onLoad() {
    this._refreshMeta(this.data.message);
  },

  onUnload() {
    this._stopPlay();
  },

  onMessageInput(e) {
    this.setData({ message: e.detail.value });
    this._refreshMeta(e.detail.value);
  },

  onSpeedChange(e) {
    const idx = Number(e.detail.value);
    this.setData({
      speedIndex: idx,
      speedLabel: SPEED_OPTIONS[idx]
    });
  },

  onCompute() {
    const { message } = this.data;
    const bytes = this._utf8ByteLength(message);
    if (bytes > MAX_INPUT_BYTES) {
      wx.showToast({
        title: '输入过大（>100KB），请缩小',
        icon: 'none',
        duration: 3000
      });
      return;
    }

    this._stopPlay();

    let result;
    try {
      result = trace(message, 'utf-8');
    } catch (err) {
      wx.showToast({ title: '计算失败', icon: 'none' });
      return;
    }

    this._rounds = result.rounds;

    // Avalanche comparison: flip 1 bit of input
    let avalanche = {};
    try {
      const flipped = flipFirstBit(message, 'utf-8');
      const report = avalancheReport(message, flipped.flippedStr, 'utf-8');
      avalanche = this._buildAvalancheData(report, flipped.flippedStr);
    } catch (err) {
      avalanche = { error: String(err.message) };
    }

    this.setData({
      rounds: result.rounds,
      currentRound: 0,
      finalHash: result.finalHash,
      numBlocks: result.numBlocks,
      byteLength: bytes,
      avalanche,
      isPlaying: false
    });
    this._renderRound(0);
    this._startPlay();
  },

  onReset() {
    this._stopPlay();
    this._rounds = [];
    this.setData({
      rounds: [],
      currentRound: 0,
      currentRoundData: null,
      wGrid: [],
      finalHash: '',
      avalanche: {},
      isPlaying: false
    });
    this._refreshMeta(this.data.message);
  },

  onPrevRound() {
    this._stopPlay();
    const next = Math.max(0, this.data.currentRound - 1);
    this._renderRound(next);
  },

  onNextRound() {
    this._stopPlay();
    const next = Math.min(this._rounds.length - 1, this.data.currentRound + 1);
    this._renderRound(next);
  },

  onTogglePlay() {
    if (this.data.isPlaying) {
      this._stopPlay();
    } else {
      this._startPlay();
    }
  },

  /* ── 内部辅助 ── */

  _utf8ByteLength(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) len += 1;
      else if (code < 0x800) len += 2;
      else if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
        const low = str.charCodeAt(i + 1);
        if (low >= 0xdc00 && low <= 0xdfff) {
          len += 4;
          i++;
        } else {
          len += 3;
        }
      } else {
        len += 3;
      }
    }
    return len;
  },

  _refreshMeta(text) {
    const bytes = this._utf8ByteLength(text);
    const blocks = Math.ceil((bytes + 9) / 64);
    this.setData({
      byteLength: bytes,
      numBlocks: blocks
    });
  },

  _renderRound(idx) {
    const r = this._rounds[idx];
    if (!r) return;
    const wGrid = this._buildWGrid(r.W, idx);
    const toHex = (v) => v.toString(16).padStart(8, '0');
    const currentRoundData = {
      aHex: toHex(r.a), bHex: toHex(r.b), cHex: toHex(r.c), dHex: toHex(r.d),
      eHex: toHex(r.e), fHex: toHex(r.f), gHex: toHex(r.g), hHex: toHex(r.h),
      T1Hex: toHex(r.T1), T2Hex: toHex(r.T2), KHex: toHex(r.K)
    };
    this.setData({
      currentRound: idx,
      currentRoundData,
      wGrid
    });
  },

  _buildWGrid(W, currentT) {
    const grid = [];
    for (let i = 0; i < 64; i++) {
      grid.push({
        index: i,
        value: W[i].toString(16).padStart(8, '0').slice(0, 6),
        highlight: i === currentT
      });
    }
    return grid;
  },

  _buildAvalancheData(report, flippedStr) {
    const diffBits = [];
    for (let i = 0; i < 256; i++) {
      const nibbleA = parseInt(report.originalHash[Math.floor(i / 4)], 16);
      const nibbleB = parseInt(report.flippedHash[Math.floor(i / 4)], 16);
      const aBit = (nibbleA >> (3 - (i % 4))) & 1;
      const bBit = (nibbleB >> (3 - (i % 4))) & 1;
      diffBits.push(aBit ^ bBit ? 1 : 0);
    }
    return {
      bitDistance: report.bitDistance,
      diffPercent: Math.round(report.diffRatio * 100),
      diffBits,
      flippedText: flippedStr
    };
  },

  _startPlay() {
    if (this._rounds.length === 0) return;
    if (this._playTimer) return;
    this.setData({ isPlaying: true });
    this._scheduleNext();
  },

  _scheduleNext() {
    if (!this.data.isPlaying) return;
    const delay = SPEED_DELAY_MS[this.data.speedIndex] || 800;
    this._playTimer = setTimeout(() => {
      const next = this.data.currentRound + 1;
      if (next >= this._rounds.length) {
        this._stopPlay();
        return;
      }
      this._renderRound(next);
      this._scheduleNext();
    }, delay);
  },

  _stopPlay() {
    if (this._playTimer) {
      clearTimeout(this._playTimer);
      this._playTimer = null;
    }
    this.setData({ isPlaying: false });
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
  }
});
