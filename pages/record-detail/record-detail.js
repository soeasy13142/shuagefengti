const storage = require('../../utils/storage');

Page({
  data: {
    record: null,
    paper: null,
    questions: [],
    currentIdx: 0,
    currentQuestion: null,
    currentAnswer: null
  },

  onLoad(options) {
    const records = storage.getRecords();
    const record = records.find(r => r.id === options.recordId);
    if (!record) {
      wx.showToast({ title: '记录不存在', icon: 'none' });
      return;
    }
    const paper = storage.getPaperById(record.paperId);
    const questions = paper ? paper.questions : [];
    this.setData({
      record,
      paper,
      questions,
      currentQuestion: questions[0],
      currentAnswer: record.answers[questions[0]?.id]
    });
  },

  goNext() {
    const { currentIdx, questions, record } = this.data;
    if (currentIdx >= questions.length - 1) return;
    const nextIdx = currentIdx + 1;
    const q = questions[nextIdx];
    this.setData({
      currentIdx: nextIdx,
      currentQuestion: q,
      currentAnswer: record.answers[q.id]
    });
  },

  goPrev() {
    const { currentIdx, questions, record } = this.data;
    if (currentIdx <= 0) return;
    const prevIdx = currentIdx - 1;
    const q = questions[prevIdx];
    this.setData({
      currentIdx: prevIdx,
      currentQuestion: q,
      currentAnswer: record.answers[q.id]
    });
  }
});
