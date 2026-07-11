const storage = require('../../utils/storage');

Page({
  data: {
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
    const records = storage.getRecords();
    const record = records.find(function(r) { return r.id === options.recordId; });
    if (!record) {
      wx.showToast({ title: '记录不存在', icon: 'none' });
      return;
    }
    const paper = storage.getPaperById(record.paperId);
    const questions = paper ? paper.questions : [];
    const paperDeleted = !paper;
    this.setData({
      record: record,
      paper: paper,
      questions: questions,
      paperDeleted: paperDeleted
    });
    if (questions.length > 0) {
      this._updateCurrent(0);
    }
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
