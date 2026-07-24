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
    wx.showToast({ title: '数据读取异常', icon: 'none' });
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

// ---------- Async internal helpers ----------

function _getAsync(key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key,
      success(res) {
        try {
          resolve(res.data ? JSON.parse(res.data) : null);
        } catch (e) {
          console.warn('[storage] JSON.parse failed for key:', key, e);
          resolve(null);
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

function _setAsync(key, data) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key,
      data: JSON.stringify(data),
      success: resolve,
      fail(err) {
        wx.showToast({ title: '存储空间不足', icon: 'none' });
        reject(err);
      }
    });
  });
}

function getPapers() {
  return _get(KEYS.PAPERS);
}

function savePaper(paper) {
  if (!paper || !paper.id) {
    console.warn('[storage] savePaper: invalid paper (missing id)', paper);
    return;
  }
  const papers = getPapers();
  const idx = papers.findIndex(p => p.id === paper.id);
  const newPapers = idx >= 0
    ? [...papers.slice(0, idx), paper, ...papers.slice(idx + 1)]
    : [...papers, paper];
  _set(KEYS.PAPERS, newPapers);
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
  const existingIndex = records.findIndex(r => r.id === record.id);
  const newRecords = existingIndex >= 0
    ? records.map((r, i) => i === existingIndex ? record : r)
    : [...records, record];
  _set(KEYS.RECORDS, newRecords);
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
  if (!questionId) {
    console.warn('[storage] addWrongQuestion: invalid questionId');
    return;
  }
  const wrongs = getWrongQuestions();
  const existing = wrongs.find(w => w.questionId === questionId);
  const newWrongs = existing
    ? wrongs.map(w =>
        w.questionId === questionId
          ? { ...w, wrongCount: w.wrongCount + 1, lastWrongTime: new Date().toISOString() }
          : w
      )
    : [...wrongs, {
        questionId,
        paperId,
        question,
        wrongCount: 1,
        mastered: false,
        lastWrongTime: new Date().toISOString()
      }];
  _set(KEYS.WRONG_QUESTIONS, newWrongs);
}

function markMastered(questionId) {
  if (!questionId) return false;
  const wrongs = getWrongQuestions();
  const item = wrongs.find(w => w.questionId === questionId);
  if (item) {
    const newWrongs = wrongs.map(w =>
      w.questionId === questionId ? { ...w, mastered: true } : w
    );
    _set(KEYS.WRONG_QUESTIONS, newWrongs);
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
  } catch (e) {
    console.warn('[storage] error clearing temp import:', e);
  }
}

function _removeAsync(key) {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      key,
      success: resolve,
      fail(err) {
        reject(err);
      }
    });
  });
}

// ---------- Async public methods ----------

async function getPapersAsync() {
  try {
    return (await _getAsync(KEYS.PAPERS)) ?? [];
  } catch {
    return [];
  }
}

async function getPaperByIdAsync(id) {
  const papers = await getPapersAsync();
  return papers.find(p => p.id === id) || null;
}

async function savePaperAsync(paper) {
  if (!paper || !paper.id) {
    console.warn('[storage] savePaperAsync: invalid paper (missing id)', paper);
    return;
  }
  const papers = await getPapersAsync();
  const idx = papers.findIndex(p => p.id === paper.id);
  const newPapers = idx >= 0
    ? [...papers.slice(0, idx), paper, ...papers.slice(idx + 1)]
    : [...papers, paper];
  await _setAsync(KEYS.PAPERS, newPapers);
}

async function getRecordsAsync() {
  try {
    return (await _getAsync(KEYS.RECORDS)) ?? [];
  } catch {
    return [];
  }
}

async function saveRecordAsync(record) {
  const records = await getRecordsAsync();
  const existingIndex = records.findIndex(r => r.id === record.id);
  const newRecords = existingIndex >= 0
    ? records.map((r, i) => i === existingIndex ? record : r)
    : [...records, record];
  await _setAsync(KEYS.RECORDS, newRecords);
}

async function getRecordsByPaperIdAsync(paperId) {
  const records = await getRecordsAsync();
  return records.filter(r => r.paperId === paperId);
}

async function getWrongQuestionsAsync() {
  try {
    return (await _getAsync(KEYS.WRONG_QUESTIONS)) ?? [];
  } catch {
    return [];
  }
}

async function getUnmasteredWrongQuestionsAsync() {
  const wrongs = await getWrongQuestionsAsync();
  return wrongs.filter(q => !q.mastered);
}

async function addWrongQuestionAsync({ questionId, paperId, question }) {
  if (!questionId) {
    console.warn('[storage] addWrongQuestionAsync: invalid questionId');
    return;
  }
  const wrongs = await getWrongQuestionsAsync();
  const existing = wrongs.find(w => w.questionId === questionId);
  let newWrongs;
  if (existing) {
    newWrongs = wrongs.map(w =>
      w.questionId === questionId
        ? { ...w, wrongCount: w.wrongCount + 1, lastWrongTime: new Date().toISOString() }
        : w
    );
  } else {
    newWrongs = [...wrongs, {
      questionId,
      paperId,
      question,
      wrongCount: 1,
      mastered: false,
      lastWrongTime: new Date().toISOString()
    }];
  }
  await _setAsync(KEYS.WRONG_QUESTIONS, newWrongs);
}

async function markMasteredAsync(questionId) {
  if (!questionId) return false;
  const wrongs = await getWrongQuestionsAsync();
  const item = wrongs.find(w => w.questionId === questionId);
  if (item) {
    const newWrongs = wrongs.map(w =>
      w.questionId === questionId ? { ...w, mastered: true } : w
    );
    await _setAsync(KEYS.WRONG_QUESTIONS, newWrongs);
    return true;
  }
  return false;
}

async function setTempImportDataAsync(data) {
  await _setAsync(KEYS.TEMP_IMPORT, data);
}

async function getTempImportDataAsync() {
  try {
    return await _getAsync(KEYS.TEMP_IMPORT);
  } catch {
    return null;
  }
}

async function clearTempImportDataAsync() {
  try {
    await _removeAsync(KEYS.TEMP_IMPORT);
  } catch (e) {
    console.warn('[storage] error clearing temp import:', e);
  }
}

async function deletePaperAsync(id) {
  if (!id) return;
  const papers = await getPapersAsync();
  const newPapers = papers.filter(p => p.id !== id);
  await _setAsync(KEYS.PAPERS, newPapers);
  // Cascade delete associated records
  const records = await getRecordsAsync();
  const newRecords = records.filter(r => r.paperId !== id);
  await _setAsync(KEYS.RECORDS, newRecords);
  // Cascade delete associated wrong questions
  const wrongs = await getWrongQuestionsAsync();
  const newWrongs = wrongs.filter(w => w.paperId !== id);
  await _setAsync(KEYS.WRONG_QUESTIONS, newWrongs);
}

module.exports = {
  getPapers, savePaper, getPaperById, deletePaper,
  getRecords, saveRecord, getRecordsByPaperId,
  getWrongQuestions, getUnmasteredWrongQuestions, addWrongQuestion, markMastered,
  setTempImportData, getTempImportData, clearTempImportData,
  // Async versions
  getPapersAsync, getPaperByIdAsync, savePaperAsync, deletePaperAsync,
  getRecordsAsync, saveRecordAsync, getRecordsByPaperIdAsync,
  getWrongQuestionsAsync, getUnmasteredWrongQuestionsAsync, addWrongQuestionAsync, markMasteredAsync,
  setTempImportDataAsync, getTempImportDataAsync, clearTempImportDataAsync
};
