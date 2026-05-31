const storage = require('../../utils/storage');
const { generateId, formatTime } = require('../../utils/util');

Page({
  data: {
    paper: null,
    questions: [],
    currentIdx: 0,
    currentQuestion: null,
    mode: 'practice',
    modeSelected: false,
    userAnswer: '',
    answered: false,
    showExplanation: false,
    answers: {},
    startTime: null,
    totalQuestions: 0
  },

  onLoad(options) {
    const paper = storage.getPaperById(options.paperId);
    if (!paper) {
      wx.showToast({ title: '试卷不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({
      paper,
      questions: paper.questions,
      totalQuestions: paper.questions.length
    });
  },

  selectMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      mode,
      modeSelected: true,
      currentQuestion: this.data.questions[0],
      startTime: Date.now()
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
    let current = this.data.userAnswer || '';
    if (current.includes(option)) {
      current = current.replace(option, '');
    } else {
      current = (current + option).split('').sort().join('');
    }
    this.setData({ userAnswer: current });
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
        answers: newAnswers,
        userAnswer: ''
      });
      this.goNext();
    }
  },

  goNext() {
    const { currentIdx, questions } = this.data;
    if (currentIdx >= questions.length - 1) {
      this.finishQuiz();
      return;
    }
    const nextIdx = currentIdx + 1;
    const nextQ = questions[nextIdx];
    const existingAnswer = this.data.answers[nextQ.id];
    this.setData({
      currentIdx: nextIdx,
      currentQuestion: nextQ,
      userAnswer: existingAnswer ? existingAnswer.userAnswer : '',
      answered: !!existingAnswer,
      showExplanation: !!existingAnswer
    });
  },

  goPrev() {
    const { currentIdx, questions } = this.data;
    if (currentIdx <= 0) return;
    const prevIdx = currentIdx - 1;
    const prevQ = questions[prevIdx];
    const existingAnswer = this.data.answers[prevQ.id];
    this.setData({
      currentIdx: prevIdx,
      currentQuestion: prevQ,
      userAnswer: existingAnswer ? existingAnswer.userAnswer : '',
      answered: !!existingAnswer,
      showExplanation: this.data.mode === 'practice' && !!existingAnswer
    });
  },

  finishQuiz() {
    const { answers, questions, paper, mode, startTime } = this.data;
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
      answers
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
  }
});
