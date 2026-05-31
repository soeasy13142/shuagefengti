const KEYS = {
  PAPERS: 'papers',
  RECORDS: 'records',
  WRONG_QUESTIONS: 'wrongQuestions'
};

function _get(key) {
  try {
    const data = wx.getStorageSync(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function _set(key, data) {
  wx.setStorageSync(key, JSON.stringify(data));
}

function getPapers() {
  return _get(KEYS.PAPERS);
}

function savePaper(paper) {
  const papers = getPapers();
  const idx = papers.findIndex(p => p.id === paper.id);
  if (idx >= 0) {
    papers[idx] = paper;
  } else {
    papers.push(paper);
  }
  _set(KEYS.PAPERS, papers);
}

function getPaperById(id) {
  return getPapers().find(p => p.id === id) || null;
}

function deletePaper(id) {
  const papers = getPapers().filter(p => p.id !== id);
  _set(KEYS.PAPERS, papers);
}

function getRecords() {
  return _get(KEYS.RECORDS);
}

function saveRecord(record) {
  const records = getRecords();
  records.push(record);
  _set(KEYS.RECORDS, records);
}

function getRecordsByPaperId(paperId) {
  return getRecords().filter(r => r.paperId === paperId);
}

function getWrongQuestions() {
  return _get(KEYS.WRONG_QUESTIONS);
}

function getUnmasteredWrongQuestions() {
  return getWrongQuestions().filter(q => !q.mastered);
}

function addWrongQuestion({ questionId, paperId, question }) {
  const wrongs = getWrongQuestions();
  const existing = wrongs.find(w => w.questionId === questionId);
  if (existing) {
    existing.wrongCount += 1;
    existing.lastWrongTime = new Date().toISOString();
  } else {
    wrongs.push({
      questionId,
      paperId,
      question,
      wrongCount: 1,
      mastered: false,
      lastWrongTime: new Date().toISOString()
    });
  }
  _set(KEYS.WRONG_QUESTIONS, wrongs);
}

function markMastered(questionId) {
  const wrongs = getWrongQuestions();
  const item = wrongs.find(w => w.questionId === questionId);
  if (item) {
    item.mastered = true;
    _set(KEYS.WRONG_QUESTIONS, wrongs);
  }
}

module.exports = {
  getPapers, savePaper, getPaperById, deletePaper,
  getRecords, saveRecord, getRecordsByPaperId,
  getWrongQuestions, getUnmasteredWrongQuestions, addWrongQuestion, markMastered
};
