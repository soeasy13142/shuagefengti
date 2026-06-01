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
    speed: 5
  },

  /* ========== 排序算法步骤生成器 ========== */

  _getStepGenerator: function(algo) {
    if (algo === 'selection') return this._selectionSortSteps;
    if (algo === 'bubble') return this._bubbleSortSteps;
    if (algo === 'quick') return this._quickSortSteps;
    return this._selectionSortSteps;
  },

  _selectionSortSteps: function(arr) {
    var steps = [];
    var a = arr.slice();
    var n = a.length;
    for (var i = 0; i < n - 1; i++) {
      var minIdx = i;
      steps.push({ type: 'compare', indices: [minIdx], desc: '从位置 ' + i + ' 开始寻找最小值' });
      for (var j = i + 1; j < n; j++) {
        steps.push({ type: 'compare', indices: [minIdx, j], desc: '比较 a[' + minIdx + ']=' + a[minIdx] + ' 和 a[' + j + ']=' + a[j] });
        if (a[j] < a[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        steps.push({ type: 'swap', indices: [i, minIdx], desc: '交换 a[' + i + ']=' + a[i] + ' 和 a[' + minIdx + ']=' + a[minIdx] });
        var temp = a[i];
        a[i] = a[minIdx];
        a[minIdx] = temp;
      }
      steps.push({ type: 'sorted', indices: [i], desc: '位置 ' + i + ' 确定为 ' + a[i] });
    }
    steps.push({ type: 'sorted', indices: [n - 1], desc: '最后一个元素 ' + a[n - 1] + ' 自动归位' });
    steps.push({ type: 'done', indices: [], desc: '选择排序完成！共 ' + steps.length + ' 步' });
    return steps;
  },

  _bubbleSortSteps: function(arr) {
    var steps = [];
    var a = arr.slice();
    var n = a.length;
    var sortedCount = 0;
    for (var i = 0; i < n - 1; i++) {
      var swapped = false;
      steps.push({ type: 'compare', indices: [], desc: '第 ' + (i + 1) + ' 轮冒泡开始' });
      for (var j = 0; j < n - 1 - i; j++) {
        steps.push({ type: 'compare', indices: [j, j + 1], desc: '比较相邻元素 a[' + j + ']=' + a[j] + ' 和 a[' + (j + 1) + ']=' + a[j + 1] });
        if (a[j] > a[j + 1]) {
          steps.push({ type: 'swap', indices: [j, j + 1], desc: '交换 a[' + j + ']=' + a[j] + ' 和 a[' + (j + 1) + ']=' + a[j + 1] });
          var temp = a[j];
          a[j] = a[j + 1];
          a[j + 1] = temp;
          swapped = true;
        }
      }
      steps.push({ type: 'sorted', indices: [n - 1 - i], desc: '位置 ' + (n - 1 - i) + ' 确定为 ' + a[n - 1 - i] });
      if (!swapped) {
        for (var k = n - 2 - i; k >= 0; k--) {
          steps.push({ type: 'sorted', indices: [k], desc: '位置 ' + k + ' 确定为 ' + a[k] });
        }
        break;
      }
    }
    steps.push({ type: 'sorted', indices: [0], desc: '第一个元素 ' + a[0] + ' 自动归位' });
    steps.push({ type: 'done', indices: [], desc: '冒泡排序完成！共 ' + steps.length + ' 步' });
    return steps;
  },

  _quickSortSteps: function(arr) {
    var steps = [];
    var a = arr.slice();

    function partition(low, high) {
      var pivot = a[high];
      steps.push({ type: 'pivot', indices: [high], desc: '选择基准 a[' + high + ']=' + pivot });
      var i = low - 1;
      for (var j = low; j < high; j++) {
        steps.push({ type: 'compare', indices: [j, high], desc: '比较 a[' + j + ']=' + a[j] + ' 和基准 ' + pivot });
        if (a[j] <= pivot) {
          i++;
          if (i !== j) {
            steps.push({ type: 'swap', indices: [i, j], desc: '交换 a[' + i + ']=' + a[i] + ' 和 a[' + j + ']=' + a[j] });
            var temp = a[i];
            a[i] = a[j];
            a[j] = temp;
          }
        }
      }
      if (i + 1 !== high) {
        steps.push({ type: 'swap', indices: [i + 1, high], desc: '将基准放到正确位置 a[' + (i + 1) + ']=' + a[i + 1] + ' 和 a[' + high + ']=' + a[high] });
        var temp2 = a[i + 1];
        a[i + 1] = a[high];
        a[high] = temp2;
      }
      steps.push({ type: 'sorted', indices: [i + 1], desc: '基准 ' + a[i + 1] + ' 归位到位置 ' + (i + 1) });
      return i + 1;
    }

    function quickSort(low, high) {
      if (low < high) {
        var pi = partition(low, high);
        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
      } else if (low === high) {
        steps.push({ type: 'sorted', indices: [low], desc: '单元素 a[' + low + ']=' + a[low] + ' 已有序' });
      }
    }

    quickSort(0, a.length - 1);
    steps.push({ type: 'done', indices: [], desc: '快速排序完成！共 ' + steps.length + ' 步' });
    return steps;
  },

  /* ========== 可视化辅助 ========== */

  _buildBars: function(values) {
    var max = 0;
    for (var i = 0; i < values.length; i++) {
      if (values[i] > max) max = values[i];
    }
    if (max === 0) max = 1;
    var count = values.length;
    var bars = [];
    for (var j = 0; j < count; j++) {
      var pct = values[j] / max;
      var height = Math.round(60 + pct * 320);
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
    var bars = this.data.bars.slice();
    for (var i = 0; i < bars.length; i++) {
      bars[i].color = 'bar-default';
    }
    this.setData({ bars: bars });
  },

  _applyStep: function(step) {
    var bars = this.data.bars.slice();
    var compareCount = this.data.compareCount;
    var swapCount = this.data.swapCount;

    for (var i = 0; i < bars.length; i++) {
      if (bars[i].color !== 'bar-sorted') {
        bars[i].color = 'bar-default';
      }
    }

    if (step.type === 'compare') {
      compareCount++;
      for (var c = 0; c < step.indices.length; c++) {
        if (bars[step.indices[c]].color !== 'bar-sorted') {
          bars[step.indices[c]].color = 'bar-compare';
        }
      }
    } else if (step.type === 'swap') {
      swapCount++;
      var idx1 = step.indices[0];
      var idx2 = step.indices[1];
      bars[idx1].color = 'bar-swap';
      bars[idx2].color = 'bar-swap';
      var tempLeft = bars[idx1].left;
      bars[idx1].left = bars[idx2].left;
      bars[idx2].left = tempLeft;
      var tempBar = bars[idx1];
      bars[idx1] = bars[idx2];
      bars[idx2] = tempBar;
    } else if (step.type === 'sorted') {
      for (var s = 0; s < step.indices.length; s++) {
        bars[step.indices[s]].color = 'bar-sorted';
      }
    } else if (step.type === 'pivot') {
      for (var p = 0; p < step.indices.length; p++) {
        bars[step.indices[p]].color = 'bar-pivot';
      }
    } else if (step.type === 'done') {
      for (var d = 0; d < bars.length; d++) {
        bars[d].color = 'bar-sorted';
      }
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
    var algo = e.currentTarget.dataset.algo;
    this.setData({ currentAlgo: algo });
    if (this.data.ready) {
      this._initSteps();
    }
  },

  _initSteps: function() {
    var values = [];
    var bars = this.data.bars;
    for (var i = 0; i < bars.length; i++) {
      values.push(bars[i].value);
    }
    var generator = this._getStepGenerator(this.data.currentAlgo);
    var steps = generator(values);
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
    var nextIdx = this.data.stepIndex + 1;
    if (nextIdx >= this.data.totalSteps) {
      this.setData({ playing: false });
      return;
    }
    var step = this.data.steps[nextIdx];
    this.setData({ stepIndex: nextIdx, stepDesc: step.desc });
    this._applyStep(step);
    if (step.type !== 'done') {
      var speed = this.data.speed;
      var delay = Math.max(50, 800 - speed * 80);
      var self = this;
      this._timer = setTimeout(function() {
        self._playNext();
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
    var idx = this.data.stepIndex - 1;
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
    var idx = this.data.stepIndex + 1;
    if (idx >= this.data.totalSteps) return;
    this._replayToIndex(idx);
  },

  _replayToIndex: function(targetIdx) {
    var bars = this._buildBars(this._getOriginalValues());
    var steps = this.data.steps;
    var compareCount = 0;
    var swapCount = 0;

    this.setData({ bars: bars, compareCount: 0, swapCount: 0 });

    for (var i = 0; i <= targetIdx; i++) {
      var step = steps[i];
      bars = this.data.bars.slice();

      for (var j = 0; j < bars.length; j++) {
        if (bars[j].color !== 'bar-sorted') {
          bars[j].color = 'bar-default';
        }
      }

      if (step.type === 'compare') {
        compareCount++;
        for (var c = 0; c < step.indices.length; c++) {
          if (bars[step.indices[c]].color !== 'bar-sorted') {
            bars[step.indices[c]].color = 'bar-compare';
          }
        }
      } else if (step.type === 'swap') {
        swapCount++;
        var idx1 = step.indices[0];
        var idx2 = step.indices[1];
        bars[idx1].color = 'bar-swap';
        bars[idx2].color = 'bar-swap';
        var tempLeft = bars[idx1].left;
        bars[idx1].left = bars[idx2].left;
        bars[idx2].left = tempLeft;
        var tempBar = bars[idx1];
        bars[idx1] = bars[idx2];
        bars[idx2] = tempBar;
      } else if (step.type === 'sorted') {
        for (var s = 0; s < step.indices.length; s++) {
          bars[step.indices[s]].color = 'bar-sorted';
        }
      } else if (step.type === 'pivot') {
        for (var p = 0; p < step.indices.length; p++) {
          bars[step.indices[p]].color = 'bar-pivot';
        }
      } else if (step.type === 'done') {
        for (var d = 0; d < bars.length; d++) {
          bars[d].color = 'bar-sorted';
        }
      }

      this.setData({ bars: bars, compareCount: compareCount, swapCount: swapCount });
    }

    this.setData({
      stepIndex: targetIdx,
      stepDesc: steps[targetIdx].desc
    });
  },

  _getOriginalValues: function() {
    var values = [];
    var initBars = this.data.steps ? null : this.data.bars;
    if (!initBars) {
      var bars = this.data.bars;
      for (var i = 0; i < bars.length; i++) {
        values.push(bars[i].value);
      }
      return values;
    }
    for (var j = 0; j < initBars.length; j++) {
      values.push(initBars[j].value);
    }
    return values;
  },

  onReset: function() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this.data.bars.length > 0) {
      var bars = this._buildBars(this._getOriginalValues());
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

  /* ========== 用户输入 ========== */

  onInputChange: function(e) {
    this.setData({ inputText: e.detail.value });
  },

  onConfirmInput: function() {
    var text = this.data.inputText.replace(/\s+/g, '');
    if (!text) {
      wx.showToast({ title: '请输入数字', icon: 'none' });
      return;
    }
    var parts = text.split(/[,，、\s]+/);
    var values = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === '') continue;
      var num = parseInt(parts[i], 10);
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
    var bars = this._buildBars(values);
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
    var count = parseInt(e.currentTarget.dataset.count, 10);
    var values = [];
    for (var i = 0; i < count; i++) {
      values.push(Math.floor(Math.random() * 95) + 5);
    }
    var bars = this._buildBars(values);
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
