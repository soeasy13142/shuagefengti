const storage = require('../../utils/storage');
const { parseMarkdown } = require('../../utils/markdown-parser');
const { sampleMarkdown } = require('../../utils/sample-questions');

Page({
  data: {
    papers: []
  },

  onShow() {
    this.loadPapers();
  },

  loadPapers() {
    this.setData({ papers: storage.getPapers() });
  },

  onImport() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['md'],
      success: (res) => {
        const file = res.tempFiles[0];
        const fs = wx.getFileSystemManager();
        try {
          const content = fs.readFileSync(file.path, 'utf-8');
          const questions = parseMarkdown(content);
          if (questions.length === 0) {
            wx.showToast({ title: '未识别到题目', icon: 'none' });
            return;
          }
          storage.setTempImportData({
            name: file.name.replace(/\.md$/i, ''),
            questions: questions
          });
          wx.navigateTo({ url: '/pages/import-preview/import-preview' });
        } catch (e) {
          wx.showToast({ title: '文件读取失败', icon: 'none' });
        }
      }
    });
  },

  onImportSample() {
    const questions = parseMarkdown(sampleMarkdown);
    if (questions.length === 0) {
      wx.showToast({ title: '示例数据异常', icon: 'none' });
      return;
    }
    storage.setTempImportData({
      name: '前端基础示例题',
      questions: questions
    });
    wx.navigateTo({ url: '/pages/import-preview/import-preview' });
  },

  onTapPaper(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/quiz/quiz?paperId=${id}`
    });
  },

  onDeletePaper(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这套题吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deletePaper(id);
          this.loadPapers();
          wx.showToast({ title: '已删除' });
        }
      }
    });
  },

  goToRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goToWrongQuestions() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  }
});
