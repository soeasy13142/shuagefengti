const storage = require('../../utils/storage');
const { generateId, formatTime } = require('../../utils/util');

Page({
  data: {
    name: '',
    questions: [],
    typeStats: {}
  },

  onLoad() {
    const paperData = storage.getTempImportData();
    if (!paperData || !paperData.questions) {
      wx.showToast({ title: '数据加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    const typeStats = this.calcTypeStats(paperData.questions);
    this.setData({
      name: paperData.name,
      questions: paperData.questions,
      typeStats
    });
  },

  calcTypeStats(questions) {
    const stats = { single: 0, multi: 0, judge: 0, fill: 0, essay: 0 };
    questions.forEach(q => { stats[q.type] = (stats[q.type] || 0) + 1; });
    return stats;
  },

  onConfirm() {
    const paper = {
      id: generateId(),
      name: this.data.name,
      importTime: formatTime(new Date()),
      questionCount: this.data.questions.length,
      questions: this.data.questions
    };
    storage.savePaper(paper);
    storage.clearTempImportData();
    wx.showToast({ title: '导入成功' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  onCancel() {
    wx.navigateBack();
  }
});
