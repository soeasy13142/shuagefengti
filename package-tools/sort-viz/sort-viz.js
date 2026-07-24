/**
 * 排序可视化页面
 * 排序算法步骤生成器已抽到 utils/sort-algorithms.js
 */
const sortAlgos = require('../../utils/sort-algorithms.js');

Page({
  data: {
    algorithms: [
      { key: 'selection', name: '选择排序' },
      { key: 'bubble', name: '冒泡排序' },
      { key: 'quick', name: '快速排序' }
    ],
    currentAlgo: 'selection',
    bars: [],
    barCount: 0,
    inputText: '',
    ready: false,
    playing: false,
    paused: false,
    stepIndex: -1,
    totalSteps: 0,
    stepDesc: '就绪',
    compareCount: 0,
    swapCount: 0,
    speed: 5,
    // ℹ︎ 介绍
    toolId: 'sort-viz',
    showIntro: false
  },

  /* ========== 排序算法步骤生成器 ========== */

  _getStepGenerator: function(algo) {
    if (algo === 'selection') return sortAlgos.selectionSort;
    if (algo === 'bubble') return sortAlgos.bubbleSort;
    if (algo === 'quick') return sortAlgos.quickSort;
    return sortAlgos.selectionSort;
  },

  /* ========== 可视化辅助 ========== */

  _buildBars: function(values) {
    let max = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] > max) max = values[i];
    }
    if (max === 0) max = 1;
    const count = values.length;
    const bars = [];
    for (let j = 0; j < count; j++) {
      const pct = values[j] / max;
      const height = Math.round(60 + pct * 320);
      bars.push({
        value: values[j],
        left: j * 68,
        height: height,
        color: 'bar-default'
      });
    }
    return bars;
  },

  _resetBarColors: function() {
    const bars = this.data.bars.map(function(b) {
      return Object.assign({}, b, { color: 'bar-default' });
    });
    this.setData({ bars: bars });
  },

  _applyStep: function(step) {
    let compareCount = this.data.compareCount;
    let swapCount = this.data.swapCount;

    // Reset all non-sorted bars to default, creating new objects
    const resetBars = this.data.bars.map(function(b) {
      const newColor = b.color !== 'bar-sorted' ? 'bar-default' : 'bar-sorted';
      return Object.assign({}, b, { color: newColor });
    });

    // Apply step-specific changes immutably
    let bars;
    if (step.type === 'compare') {
      compareCount++;
      bars = resetBars.map(function(b, i) {
        if (step.indices.indexOf(i) !== -1 && b.color !== 'bar-sorted') {
          return Object.assign({}, b, { color: 'bar-compare' });
        }
        return b;
      });
    } else if (step.type === 'swap') {
      swapCount++;
      const idx1 = step.indices[0];
      const idx2 = step.indices[1];
      bars = resetBars.map(function(b, i) {
        if (i === idx1) {
          return Object.assign({}, resetBars[idx2], { color: 'bar-swap' });
        }
        if (i === idx2) {
          return Object.assign({}, resetBars[idx1], { color: 'bar-swap' });
        }
        return b;
      });
    } else if (step.type === 'sorted') {
      bars = resetBars.map(function(b, i) {
        if (step.indices.indexOf(i) !== -1) {
          return Object.assign({}, b, { color: 'bar-sorted' });
        }
        return b;
      });
    } else if (step.type === 'pivot') {
      bars = resetBars.map(function(b, i) {
        if (step.indices.indexOf(i) !== -1) {
          return Object.assign({}, b, { color: 'bar-pivot' });
        }
        return b;
      });
    } else if (step.type === 'done') {
      bars = resetBars.map(function(b) {
        return Object.assign({}, b, { color: 'bar-sorted' });
      });
    }

    this.setData({
      bars: bars,
      compareCount: compareCount,
      swapCount: swapCount
    });
  },

  /* ========== 动画控制 ========== */

  selectAlgo: function(e) {
    if (this.data.playing) return;
    const algo = e.currentTarget.dataset.algo;
    this.setData({ currentAlgo: algo });
    if (this.data.ready) {
      this._initSteps();
    }
  },

  _initSteps: function() {
    const values = [];
    const bars = this.data.bars;
    for (let i = 0; i < bars.length; i++) {
      values.push(bars[i].value);
    }
    const generator = this._getStepGenerator(this.data.currentAlgo);
    const steps = generator(values);
    this._resetBarColors();
    this.setData({
      steps: steps,
      totalSteps: steps.length,
      stepIndex: -1,
      stepDesc: '就绪，点击 ▶ 开始',
      compareCount: 0,
      swapCount: 0,
      playing: false,
      paused: false
    });
  },

  onPlay: function() {
    if (!this.data.ready) {
      wx.showToast({ title: '请先输入数字', icon: 'none' });
      return;
    }
    if (!this.data.steps || this.data.steps.length === 0) {
      this._initSteps();
    }
    if (this.data.stepIndex >= this.data.totalSteps - 1) {
      this._initSteps();
    }
    this.setData({ playing: true, paused: false });
    this._playNext();
  },

  _playNext: function() {
    if (!this.data.playing || this.data.paused) return;
    const nextIdx = this.data.stepIndex + 1;
    if (nextIdx >= this.data.totalSteps) {
      this.setData({ playing: false });
      return;
    }
    const step = this.data.steps[nextIdx];
    this.setData({ stepIndex: nextIdx, stepDesc: step.desc });
    this._applyStep(step);
    if (step.type !== 'done') {
      const speed = this.data.speed;
      const delay = Math.max(50, 800 - speed * 80);
      this._timer = setTimeout(() => {
        this._playNext();
      }, delay);
    } else {
      this.setData({ playing: false });
    }
  },

  onPause: function() {
    this.setData({ paused: true, playing: false });
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  },

  onStepPrev: function() {
    if (!this.data.ready || !this.data.steps) return;
    const idx = this.data.stepIndex - 1;
    if (idx < 0) return;
    this.onPause();
    this._replayToIndex(idx);
  },

  onStepNext: function() {
    if (!this.data.ready) return;
    if (!this.data.steps || this.data.steps.length === 0) {
      this._initSteps();
    }
    this.onPause();
    const idx = this.data.stepIndex + 1;
    if (idx >= this.data.totalSteps) return;
    this._replayToIndex(idx);
  },

  _applyReplayStep: function(step, currentBars, compareCount, swapCount) {
    // Reset non-sorted bars to default, creating new objects
    const resetBars = currentBars.map(function(b) {
      const newColor = b.color !== 'bar-sorted' ? 'bar-default' : 'bar-sorted';
      return Object.assign({}, b, { color: newColor });
    });

    let bars;
    if (step.type === 'compare') {
      compareCount++;
      bars = resetBars.map(function(b, i) {
        if (step.indices.indexOf(i) !== -1 && b.color !== 'bar-sorted') {
          return Object.assign({}, b, { color: 'bar-compare' });
        }
        return b;
      });
    } else if (step.type === 'swap') {
      swapCount++;
      const idx1 = step.indices[0];
      const idx2 = step.indices[1];
      bars = resetBars.map(function(b, i) {
        if (i === idx1) {
          return Object.assign({}, resetBars[idx2], { color: 'bar-swap' });
        }
        if (i === idx2) {
          return Object.assign({}, resetBars[idx1], { color: 'bar-swap' });
        }
        return b;
      });
    } else if (step.type === 'sorted') {
      bars = resetBars.map(function(b, i) {
        if (step.indices.indexOf(i) !== -1) {
          return Object.assign({}, b, { color: 'bar-sorted' });
        }
        return b;
      });
    } else if (step.type === 'pivot') {
      bars = resetBars.map(function(b, i) {
        if (step.indices.indexOf(i) !== -1) {
          return Object.assign({}, b, { color: 'bar-pivot' });
        }
        return b;
      });
    } else if (step.type === 'done') {
      bars = resetBars.map(function(b) {
        return Object.assign({}, b, { color: 'bar-sorted' });
      });
    }

    return { bars: bars, compareCount: compareCount, swapCount: swapCount };
  },

  _replayToIndex: function(targetIdx) {
    let bars = this._buildBars(this._getOriginalValues());
    const steps = this.data.steps;
    let compareCount = 0;
    let swapCount = 0;

    this.setData({ bars: bars, compareCount: 0, swapCount: 0 });

    for (let i = 0; i <= targetIdx; i++) {
      const step = steps[i];
      const result = this._applyReplayStep(step, bars, compareCount, swapCount);
      bars = result.bars;
      compareCount = result.compareCount;
      swapCount = result.swapCount;
      this.setData({ bars: bars, compareCount: compareCount, swapCount: swapCount });
    }

    this.setData({
      stepIndex: targetIdx,
      stepDesc: steps[targetIdx].desc
    });
  },

  _getOriginalValues: function() {
    const values = [];
    const initBars = this.data.steps ? null : this.data.bars;
    if (!initBars) {
      const bars = this.data.bars;
      for (let i = 0; i < bars.length; i++) {
        values.push(bars[i].value);
      }
      return values;
    }
    return values;
  },

  onReset: function() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this.data.bars.length > 0) {
      const bars = this._buildBars(this._getOriginalValues());
      this.setData({
        bars: bars,
        steps: null,
        stepIndex: -1,
        stepDesc: '就绪',
        compareCount: 0,
        swapCount: 0,
        playing: false,
        paused: false,
        totalSteps: 0
      });
    }
  },

  onSpeedChange: function(e) {
    this.setData({ speed: e.detail.value });
  },

  // ℹ︎ 介绍入口
  showIntro: function() {
    this.setData({ showIntro: true });
  },
  onIntroClose: function() {
    this.setData({ showIntro: false });
  },
  onIntroEnter: function() {
    this.setData({ showIntro: false });
  },

  /* ========== 用户输入 ========== */

  onInputChange: function(e) {
    this.setData({ inputText: e.detail.value });
  },

  onConfirmInput: function() {
    const text = this.data.inputText.replace(/\s+/g, '');
    if (!text) {
      wx.showToast({ title: '请输入数字', icon: 'none' });
      return;
    }
    const parts = text.split(/[,，、\s]+/);
    const values = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '') continue;
      const num = parseInt(parts[i], 10);
      if (isNaN(num)) {
        wx.showToast({ title: '请输入有效数字', icon: 'none' });
        return;
      }
      if (num < 1 || num > 99) {
        wx.showToast({ title: '数字范围 1-99', icon: 'none' });
        return;
      }
      values.push(num);
    }
    if (values.length < 2) {
      wx.showToast({ title: '至少需要 2 个数字', icon: 'none' });
      return;
    }
    if (values.length > 20) {
      wx.showToast({ title: '最多 20 个数字', icon: 'none' });
      return;
    }
    const bars = this._buildBars(values);
    this.setData({
      bars: bars,
      barCount: values.length,
      ready: true,
      steps: null,
      stepIndex: -1,
      stepDesc: '就绪，点击 ▶ 开始',
      compareCount: 0,
      swapCount: 0,
      playing: false,
      paused: false,
      totalSteps: 0
    });
    this._initSteps();
  },

  onRandom: function(e) {
    const count = parseInt(e.currentTarget.dataset.count, 10);
    const values = [];
    for (let i = 0; i < count; i++) {
      values.push(Math.floor(Math.random() * 95) + 5);
    }
    const bars = this._buildBars(values);
    this.setData({
      bars: bars,
      barCount: count,
      inputText: values.join(','),
      ready: true,
      steps: null,
      stepIndex: -1,
      stepDesc: '就绪，点击 ▶ 开始',
      compareCount: 0,
      swapCount: 0,
      playing: false,
      paused: false,
      totalSteps: 0
    });
    this._initSteps();
  }
});
