const KEYS = {
  PAPERS: 'papers',
  RECORDS: 'records',
  WRONG_QUESTIONS: 'wrongQuestions',
  TEMP_IMPORT: 'tempImportData'
};

function _get(key) {
  try {
    const data = wx.getStorageSync(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('[storage] JSON.parse failed for key:', key, e);
    return [];
  }
}

function _set(key, data) {
  try {
    wx.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    wx.showToast({ title: '存储空间不足', icon: 'none' });
  }
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
  if (!id) return;
  const papers = getPapers().filter(p => p.id !== id);
  _set(KEYS.PAPERS, papers);
  // 级联删除关联的答题记录
  const records = getRecords().filter(r => r.paperId !== id);
  _set(KEYS.RECORDS, records);
  // 级联删除关联的错题
  const wrongs = getWrongQuestions().filter(w => w.paperId !== id);
  _set(KEYS.WRONG_QUESTIONS, wrongs);
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
  if (!questionId) return false;
  const wrongs = getWrongQuestions();
  const item = wrongs.find(w => w.questionId === questionId);
  if (item) {
    item.mastered = true;
    _set(KEYS.WRONG_QUESTIONS, wrongs);
    return true;
  }
  return false;
}

// 临时存储：用于页面间传递大数据（避免 URL 长度限制）
function setTempImportData(data) {
  _set(KEYS.TEMP_IMPORT, data);
}

function getTempImportData() {
  try {
    const data = wx.getStorageSync(KEYS.TEMP_IMPORT);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function clearTempImportData() {
  try {
    wx.removeStorageSync(KEYS.TEMP_IMPORT);
  } catch (e) {}
}

module.exports = {
  getPapers, savePaper, getPaperById, deletePaper,
  getRecords, saveRecord, getRecordsByPaperId,
  getWrongQuestions, getUnmasteredWrongQuestions, addWrongQuestion, markMastered,
  setTempImportData, getTempImportData, clearTempImportData
};
