const { parseHttp } = require('../../utils/http-parser');
const { SAMPLES } = require('../../utils/http-samples');
const { STATUS_CODES, getStatusCodesByCategory } = require('../../utils/http-status-codes');

const STATUS_CATEGORIES = [
  { cat: '1xx', label: '1xx 信息' },
  { cat: '2xx', label: '2xx 成功' },
  { cat: '3xx', label: '3xx 重定向' },
  { cat: '4xx', label: '4xx 客户端错误' },
  { cat: '5xx', label: '5xx 服务器错误' }
];

Page({
  data: {
    rawInput: '',
    sampleLabels: [],
    sampleIndex: -1,
    errorMessage: '',
    parsed: null,
    rawLines: [],

    // 状态码速查
    statusCategories: STATUS_CATEGORIES,
    activeStatusCat: '2xx',
    activeStatusCodes: []
  },

  onLoad() {
    const labels = SAMPLES.map(s => s.label);
    this.setData({
      sampleLabels: ['（自定义输入）', ...labels],
      activeStatusCodes: getStatusCodesByCategory('2xx')
    });
  },

  // ── Event Handlers ──

  onSampleChange(e) {
    const idx = parseInt(e.detail.value, 10);
    if (idx === 0) {
      // 自定义输入 — 不清空已有文本
      this.setData({ sampleIndex: 0 });
      return;
    }
    const sample = SAMPLES[idx - 1];
    if (sample) {
      this.setData({
        rawInput: sample.raw,
        sampleIndex: idx,
        errorMessage: '',
        parsed: null,
        rawLines: []
      });
    }
  },

  onRawInput(e) {
    this.setData({ rawInput: e.detail.value });
  },

  onParseTap() {
    const { rawInput } = this.data;
    if (!rawInput || rawInput.trim().length === 0) {
      this.setData({ errorMessage: '请输入 HTTP 报文', parsed: null, rawLines: [] });
      return;
    }

    try {
      const result = parseHttp(rawInput);
      const lines = rawInput.split(/\r?\n/);
      const rawLines = lines.map((text, idx) => ({
        num: idx + 1,
        text: text || '⏎',
        hasError: result.errors.some(e => e.line === idx + 1 && e.type === 'error')
      }));

      this.setData({
        parsed: result,
        rawLines,
        errorMessage: ''
      });
    } catch (e) {
      this.setData({ errorMessage: '解析失败: ' + e.message, parsed: null, rawLines: [] });
    }
  },

  onClearTap() {
    this.setData({
      rawInput: '',
      sampleIndex: -1,
      errorMessage: '',
      parsed: null,
      rawLines: []
    });
  },

  onStatusCatTap(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({
      activeStatusCat: cat,
      activeStatusCodes: getStatusCodesByCategory(cat)
    });
  }
});
