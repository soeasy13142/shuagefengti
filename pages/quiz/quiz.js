const storage = require('../../utils/storage');
const { generateId, formatTime } = require('../../utils/util');

Page({
  data: {
    loading: true,
    paper: null,
    questions: [],
    currentIdx: 0,
    currentQuestion: null,
    mode: 'practice',
    modeSelected: false,
    userAnswer: '',
    selectedMap: {},
    answered: false,
    showExplanation: false,
    answers: {},
    startTime: null,
    totalQuestions: 0
  },

  onLoad(options) {
    if (!options || !options.paperId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    storage.getPaperByIdAsync(options.paperId).then(paper => {
      if (!paper) {
        wx.showToast({ title: '试卷不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      this.setData({
        loading: false,
        paper,
        questions: paper.questions,
        totalQuestions: paper.questions.length
      });
    });
  },

  selectMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      mode,
      modeSelected: true,
      currentQuestion: this.data.questions[0],
      startTime: Date.now(),
      selectedMap: {}
    });
  },

  onSelectOption(e) {
    if (this.data.answered && this.data.mode === 'practice') return;
    const answer = e.currentTarget.dataset.option;
    this.setData({ userAnswer: answer });
  },

  onToggleMulti(e) {
    if (this.data.answered && this.data.mode === 'practice') return;
    const option = e.currentTarget.dataset.option;
    const map = Object.assign({}, this.data.selectedMap || {});
    if (map[option]) {
      delete map[option];
    } else {
      map[option] = true;
    }
    const userAnswer = Object.keys(map).sort().join('');
    this.setData({ selectedMap: map, userAnswer: userAnswer });
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

  onJudge(e) {
    if (this.data.answered && this.data.mode === 'practice') return;
    this.setData({ userAnswer: e.currentTarget.dataset.value });
  },

  onTextInput(e) {
    this.setData({ userAnswer: e.detail.value });
  },

  checkAnswer(question, userAnswer) {
    if (!userAnswer || userAnswer === '') return false;
    switch (question.type) {
      case 'single':
      case 'judge':
        return userAnswer === question.answer;
      case 'multi': {
        const correct = question.answer.split('').sort().join('');
        const user = userAnswer.split('').sort().join('');
        return correct === user;
      }
      case 'fill': {
        const correctParts = question.answer.split(',').map(s => s.trim().toLowerCase());
        const userParts = userAnswer.split(',').map(s => s.trim().toLowerCase());
        if (correctParts.length !== userParts.length) return false;
        return correctParts.every((c, i) => c === userParts[i]);
      }
      case 'essay':
        return userAnswer.trim().length > 0;
      default:
        return false;
    }
  },

  onSubmit() {
    const { currentQuestion, userAnswer, mode, answers } = this.data;
    if (!userAnswer || userAnswer === '') {
      wx.showToast({ title: '请先作答', icon: 'none' });
      return;
    }

    const correct = this.checkAnswer(currentQuestion, userAnswer);
    const newAnswers = { ...answers };
    newAnswers[currentQuestion.id] = { userAnswer, correct };

    if (mode === 'practice') {
      this.setData({
        answers: newAnswers,
        answered: true,
        showExplanation: true
      });
    } else {
      this.setData({
        answers: newAnswers
      });
      wx.showToast({ title: '答案已保存', icon: 'success', duration: 800 });
    }
  },

  // 自动保存当前答案（切题前调用）
  _autoSave() {
    const { currentQuestion, userAnswer, answers } = this.data;
    if (userAnswer && userAnswer !== '' && currentQuestion) {
      const correct = this.checkAnswer(currentQuestion, userAnswer);
      const newAnswers = Object.assign({}, answers);
      newAnswers[currentQuestion.id] = { userAnswer: userAnswer, correct: correct };
      this.setData({ answers: newAnswers });
    }
  },

  goNext() {
    const { currentIdx, questions } = this.data;
    if (currentIdx >= questions.length - 1) {
      this.finishQuiz();
      return;
    }

    this._autoSave();

    const nextIdx = currentIdx + 1;
    const nextQ = questions[nextIdx];
    const existingAnswer = this.data.answers[nextQ.id];
    const restoredAnswer = existingAnswer ? existingAnswer.userAnswer : '';
    this.setData({
      currentIdx: nextIdx,
      currentQuestion: nextQ,
      userAnswer: restoredAnswer,
      selectedMap: this._buildSelectedMap(restoredAnswer),
      answered: !!existingAnswer,
      showExplanation: this.data.mode === 'practice' && !!existingAnswer
    });
  },

  goPrev() {
    const { currentIdx, questions } = this.data;
    if (currentIdx <= 0) return;

    this._autoSave();

    const prevIdx = currentIdx - 1;
    const prevQ = questions[prevIdx];
    const existingAnswer = this.data.answers[prevQ.id];
    const restoredAnswer = existingAnswer ? existingAnswer.userAnswer : '';
    this.setData({
      currentIdx: prevIdx,
      currentQuestion: prevQ,
      userAnswer: restoredAnswer,
      selectedMap: this._buildSelectedMap(restoredAnswer),
      answered: !!existingAnswer,
      showExplanation: this.data.mode === 'practice' && !!existingAnswer
    });
  },

  finishQuiz() {
    this._autoSave();
    const { answers, questions } = this.data;
    const answeredCount = Object.keys(answers).length;
    const total = questions.length;

    if (answeredCount < total) {
      wx.showModal({
        title: '确认交卷',
        content: `你还有 ${total - answeredCount} 题未作答，确定要交卷吗？`,
        confirmText: '确认交卷',
        cancelText: '继续答题',
        success: (res) => {
          if (res.confirm) {
            this._doFinishQuiz();
          }
        }
      });
    } else {
      wx.showModal({
        title: '确认交卷',
        content: '你已完成所有题目，确定要交卷吗？',
        confirmText: '确认交卷',
        cancelText: '返回检查',
        success: (res) => {
          if (res.confirm) {
            this._doFinishQuiz();
          }
        }
      });
    }
  },

  _doFinishQuiz() {
    const { answers, questions, paper, mode } = this.data;
    const startTime = this.data.startTime || Date.now();
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] && answers[q.id].correct) correctCount++;
    });

    const accuracy = Math.round((correctCount / questions.length) * 100);

    const record = {
      id: generateId(),
      paperId: paper.id,
      paperName: paper.name,
      mode,
      startTime: formatTime(new Date(startTime)),
      endTime: formatTime(new Date(endTime)),
      duration,
      totalQuestions: questions.length,
      correctCount,
      accuracy,
      answers,
      questionTypes: questions.map(q => ({ id: q.id, type: q.type }))
    };
    storage.saveRecord(record);

    questions.forEach(q => {
      const a = answers[q.id];
      if (a && !a.correct) {
        storage.addWrongQuestion({
          questionId: q.id,
          paperId: paper.id,
          question: q
        });
      }
    });

    const resultData = JSON.stringify({
      paperName: paper.name,
      mode,
      accuracy,
      correctCount,
      total: questions.length,
      duration,
      recordId: record.id
    });
    wx.redirectTo({
      url: `/pages/result/result?data=${encodeURIComponent(resultData)}`
    });
  },

  onHide() {
    this._autoSave();
  },

  onUnload() {
    this._autoSave();
  }
});
