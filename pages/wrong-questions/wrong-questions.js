const storage = require('../../utils/storage');

Page({
  data: {
    wrongQuestions: [],
    displayList: [],
    sortBy: 'time',
    showMastered: false,
    loading: true
  },

  onShow() {
    this.loadWrongQuestions();
  },

  loadWrongQuestions() {
    this.setData({ loading: true });
    storage.getWrongQuestionsAsync().then(all => {
      const wrongQuestions = this.data.showMastered ? all : all.filter(q => !q.mastered);
      this.setData({ loading: false, wrongQuestions });
      this.updateDisplayList();
    }).catch(() => {
      this.setData({ loading: false, wrongQuestions: [] });
      this.updateDisplayList();
    });
  },

  updateDisplayList() {
    const { wrongQuestions, sortBy } = this.data;
    let displayList = [...wrongQuestions];

    if (sortBy === 'time') {
      displayList.sort((a, b) => new Date(b.lastWrongTime) - new Date(a.lastWrongTime));
    } else {
      displayList.sort((a, b) => a.paperId.localeCompare(b.paperId));
    }

    this.setData({ displayList });
  },

  switchSort(e) {
    this.setData({ sortBy: e.currentTarget.dataset.sort });
    this.updateDisplayList();
  },

  toggleShowMastered() {
    this.setData({ showMastered: !this.data.showMastered });
    this.loadWrongQuestions();
  },

  onMarkMastered(e) {
    const { id } = e.currentTarget.dataset;
    storage.markMastered(id);
    this.loadWrongQuestions();
    wx.showToast({ title: '已标记掌握' });
  },

  onRedoWrong() {
    const unmastered = storage.getUnmasteredWrongQuestions();
    if (unmastered.length === 0) {
      wx.showToast({ title: '没有未掌握的错题', icon: 'none' });
      return;
    }
    const questions = unmastered.map(w => w.question);
    storage.setTempImportData({
      name: '错题重做',
      questions: questions
    });
    wx.navigateTo({ url: '/pages/import-preview/import-preview' });
  }
});
