const storage = require('../../utils/storage');

Page({
  data: {
    loading: true,
    record: null,
    paper: null,
    questions: [],
    currentIdx: 0,
    currentQuestion: null,
    currentAnswer: null,
    selectedMap: {},
    paperDeleted: false
  },

  _buildSelectedMap(answerStr) {
    const map = {};
    if (answerStr) {
      for (let i = 0; i < answerStr.length; i++) {
        map[answerStr.charAt(i)] = true;
      }
    }
    return map;
  },

  _updateCurrent(idx) {
    const q = this.data.questions[idx];
    const answer = this.data.record.answers[q.id] || { userAnswer: '', correct: false };
    this.setData({
      currentIdx: idx,
      currentQuestion: q,
      currentAnswer: answer,
      selectedMap: this._buildSelectedMap(answer.userAnswer)
    });
  },

  onLoad(options) {
    if (!options || !options.recordId) {
      wx.showToast({ title: '记录参数缺失', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    Promise.all([storage.getRecordsAsync()]).then(([records]) => {
      const record = records.find(function(r) { return r.id === options.recordId; });
      if (!record) {
        wx.showToast({ title: '记录不存在', icon: 'none' });
        this.setData({ loading: false });
        return;
      }
      return storage.getPaperByIdAsync(record.paperId).then(paper => {
        const questions = paper ? paper.questions : [];
        const paperDeleted = !paper;
        this.setData({
          loading: false,
          record: record,
          paper: paper,
          questions: questions,
          paperDeleted: paperDeleted
        });
        if (questions.length > 0) {
          this._updateCurrent(0);
        }
      });
    }).catch(e => {
      console.error('[record-detail] load failed', e);
      this.setData({ loading: false });
    });
  },

  goNext() {
    if (this.data.currentIdx >= this.data.questions.length - 1) return;
    this._updateCurrent(this.data.currentIdx + 1);
  },

  goPrev() {
    if (this.data.currentIdx <= 0) return;
    this._updateCurrent(this.data.currentIdx - 1);
  }
});
