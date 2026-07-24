const storage = require('../../utils/storage');

beforeEach(() => {
  global.__clearMockStorage();
});

describe('papers 存储', () => {
  test('初始获取返回空数组', () => {
    expect(storage.getPapers()).toEqual([]);
  });

  test('保存和获取试卷', () => {
    const paper = { id: 'p1', name: '测试试卷', questions: [] };
    storage.savePaper(paper);
    const papers = storage.getPapers();
    expect(papers).toHaveLength(1);
    expect(papers[0].id).toBe('p1');
  });

  test('获取单张试卷', () => {
    const paper = { id: 'p1', name: '测试试卷', questions: [] };
    storage.savePaper(paper);
    expect(storage.getPaperById('p1')).toEqual(paper);
    expect(storage.getPaperById('p2')).toBeNull();
  });

  test('删除试卷', () => {
    storage.savePaper({ id: 'p1', name: '试卷1', questions: [] });
    storage.savePaper({ id: 'p2', name: '试卷2', questions: [] });
    storage.deletePaper('p1');
    expect(storage.getPapers()).toHaveLength(1);
    expect(storage.getPapers()[0].id).toBe('p2');
  });
});

describe('records 存储', () => {
  test('保存和获取记录', () => {
    const record = { id: 'r1', paperId: 'p1', accuracy: 80 };
    storage.saveRecord(record);
    expect(storage.getRecords()).toHaveLength(1);
  });

  test('按试卷获取记录', () => {
    storage.saveRecord({ id: 'r1', paperId: 'p1' });
    storage.saveRecord({ id: 'r2', paperId: 'p2' });
    storage.saveRecord({ id: 'r3', paperId: 'p1' });
    expect(storage.getRecordsByPaperId('p1')).toHaveLength(2);
  });
});

describe('wrongQuestions 存储', () => {
  test('添加错题', () => {
    storage.addWrongQuestion({
      questionId: 'q1',
      paperId: 'p1',
      question: { stem: '题目1' }
    });
    const wrongs = storage.getWrongQuestions();
    expect(wrongs).toHaveLength(1);
    expect(wrongs[0].wrongCount).toBe(1);
  });

  test('重复添加同一题增加计数', () => {
    storage.addWrongQuestion({ questionId: 'q1', paperId: 'p1', question: {} });
    storage.addWrongQuestion({ questionId: 'q1', paperId: 'p1', question: {} });
    expect(storage.getWrongQuestions()[0].wrongCount).toBe(2);
  });

  test('标记已掌握', () => {
    storage.addWrongQuestion({ questionId: 'q1', paperId: 'p1', question: {} });
    storage.markMastered('q1');
    expect(storage.getWrongQuestions()[0].mastered).toBe(true);
    expect(storage.getUnmasteredWrongQuestions()).toHaveLength(0);
  });
});

describe('async storage methods', () => {
  test('getPapersAsync returns empty array when no papers exist', async () => {
    const papers = await storage.getPapersAsync();
    expect(papers).toEqual([]);
  });

  test('savePaperAsync saves and getPapersAsync retrieves papers', async () => {
    const paper = { id: 'p1', name: '测试试卷', questions: [] };
    await storage.savePaperAsync(paper);
    const papers = await storage.getPapersAsync();
    expect(papers).toHaveLength(1);
    expect(papers[0].id).toBe('p1');
  });

  test('deletePaperAsync removes paper and cascades to records and wrong questions', async () => {
    // Create paper
    await storage.savePaperAsync({ id: 'p1', name: '试卷1', questions: [] });
    await storage.savePaperAsync({ id: 'p2', name: '试卷2', questions: [] });
    // Add record and wrong question for p1
    const { saveRecord, addWrongQuestion } = require('../../utils/storage');
    saveRecord({ id: 'r1', paperId: 'p1' });
    addWrongQuestion({ questionId: 'q1', paperId: 'p1', question: {} });

    await storage.deletePaperAsync('p1');

    const papers = await storage.getPapersAsync();
    expect(papers).toHaveLength(1);
    expect(papers[0].id).toBe('p2');

    // Verify cascade delete
    expect(storage.getRecordsByPaperId('p1')).toHaveLength(0);
    expect(storage.getWrongQuestions().filter(w => w.paperId === 'p1')).toHaveLength(0);
  });

  test('savePaperAsync updates existing paper', async () => {
    await storage.savePaperAsync({ id: 'p1', name: '原试卷', questions: [] });
    await storage.savePaperAsync({ id: 'p1', name: '更新后试卷', questions: [] });
    const papers = await storage.getPapersAsync();
    expect(papers).toHaveLength(1);
    expect(papers[0].name).toBe('更新后试卷');
  });

  test('getPaperByIdAsync returns null for missing paper', async () => {
    const paper = await storage.getPaperByIdAsync('nonexistent');
    expect(paper).toBeNull();
  });

  test('getRecordsAsync returns empty array when no records exist', async () => {
    const records = await storage.getRecordsAsync();
    expect(records).toEqual([]);
  });

  test('saveRecordAsync and getRecordsAsync round-trips a record', async () => {
    const record = { id: 'r1', paperId: 'p1', accuracy: 80 };
    await storage.saveRecordAsync(record);
    const records = await storage.getRecordsAsync();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('r1');
  });

  test('getRecordsByPaperIdAsync filters correctly', async () => {
    await storage.saveRecordAsync({ id: 'r1', paperId: 'p1' });
    await storage.saveRecordAsync({ id: 'r2', paperId: 'p2' });
    await storage.saveRecordAsync({ id: 'r3', paperId: 'p1' });
    const result = await storage.getRecordsByPaperIdAsync('p1');
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id).sort()).toEqual(['r1', 'r3']);
  });

  test('getWrongQuestionsAsync returns empty array initially', async () => {
    const wrongs = await storage.getWrongQuestionsAsync();
    expect(wrongs).toEqual([]);
  });

  test('addWrongQuestionAsync adds a wrong question', async () => {
    await storage.addWrongQuestionAsync({ questionId: 'q1', paperId: 'p1', question: { stem: 'test' } });
    const wrongs = await storage.getWrongQuestionsAsync();
    expect(wrongs).toHaveLength(1);
    expect(wrongs[0].wrongCount).toBe(1);
    expect(wrongs[0].mastered).toBe(false);
  });

  test('addWrongQuestionAsync increments count on duplicate', async () => {
    await storage.addWrongQuestionAsync({ questionId: 'q1', paperId: 'p1', question: {} });
    await storage.addWrongQuestionAsync({ questionId: 'q1', paperId: 'p1', question: {} });
    const wrongs = await storage.getWrongQuestionsAsync();
    expect(wrongs[0].wrongCount).toBe(2);
  });

  test('markMasteredAsync marks question as mastered', async () => {
    await storage.addWrongQuestionAsync({ questionId: 'q1', paperId: 'p1', question: {} });
    const result = await storage.markMasteredAsync('q1');
    expect(result).toBe(true);
    const wrongs = await storage.getWrongQuestionsAsync();
    expect(wrongs[0].mastered).toBe(true);
  });

  test('markMasteredAsync returns false for unknown questionId', async () => {
    const result = await storage.markMasteredAsync('nonexistent');
    expect(result).toBe(false);
  });

  describe('temp import data async', () => {
    test('setTempImportDataAsync and getTempImportDataAsync round-trips', async () => {
      const data = { questions: [{ stem: 'test' }] };
      await storage.setTempImportDataAsync(data);
      const result = await storage.getTempImportDataAsync();
      expect(result).toEqual(data);
    });

    test('clearTempImportDataAsync removes data', async () => {
      await storage.setTempImportDataAsync({ foo: 'bar' });
      await storage.clearTempImportDataAsync();
      const result = await storage.getTempImportDataAsync();
      expect(result).toBeNull();
    });
  });

  describe('clearTempImportData (sync)', () => {
    test('clears stored temp import data', () => {
      storage.setTempImportData({ foo: 'bar' });
      storage.clearTempImportData();
      expect(storage.getTempImportData()).toBeNull();
    });
  });

  describe('error handling in _get', () => {
    test('returns empty array when JSON.parse throws on records key', () => {
      wx.setStorageSync('records', 'not-valid-json');
      const records = storage.getRecords();
      expect(records).toEqual([]);
    });

    test('returns empty array when JSON.parse throws on papers key', () => {
      wx.setStorageSync('papers', '{invalid json}');
      const papers = storage.getPapers();
      expect(papers).toEqual([]);
    });
  });
});
