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
