const storage = require('../../utils/storage');
const { generateId, formatTime } = require('../../utils/util');

Page({
  data: {
    loading: true,
    name: '',
    questions: [],
    typeStats: {}
  },

  async onLoad() {
    try {
      const paperData = await storage.getTempImportDataAsync();
      if (!paperData || !paperData.questions) {
        wx.showToast({ title: '数据加载失败', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      const typeStats = this.calcTypeStats(paperData.questions);
      this.setData({
        loading: false,
        name: paperData.name,
        questions: paperData.questions,
        typeStats
      });
    } catch (e) {
      wx.showToast({ title: '数据加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
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
