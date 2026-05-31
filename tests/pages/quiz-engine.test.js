function checkAnswer(question, userAnswer) {
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
}

describe('checkAnswer', () => {
  test('单选正确', () => {
    expect(checkAnswer({ type: 'single', answer: 'A' }, 'A')).toBe(true);
  });
  test('单选错误', () => {
    expect(checkAnswer({ type: 'single', answer: 'A' }, 'B')).toBe(false);
  });
  test('多选正确（顺序不同）', () => {
    expect(checkAnswer({ type: 'multi', answer: 'ABD' }, 'DAB')).toBe(true);
  });
  test('多选错误', () => {
    expect(checkAnswer({ type: 'multi', answer: 'ABD' }, 'ABC')).toBe(false);
  });
  test('判断正确', () => {
    expect(checkAnswer({ type: 'judge', answer: 'A' }, 'A')).toBe(true);
  });
  test('填空正确', () => {
    expect(checkAnswer({ type: 'fill', answer: '北京' }, '北京')).toBe(true);
  });
  test('填空多空正确', () => {
    expect(checkAnswer({ type: 'fill', answer: '北京,上海' }, '北京,上海')).toBe(true);
    expect(checkAnswer({ type: 'fill', answer: '北京,上海' }, '上海,北京')).toBe(false);
  });
  test('简答有内容即为已作答', () => {
    expect(checkAnswer({ type: 'essay' }, '这是答案')).toBe(true);
    expect(checkAnswer({ type: 'essay' }, '')).toBe(false);
  });
  test('空答案返回 false', () => {
    expect(checkAnswer({ type: 'single', answer: 'A' }, '')).toBe(false);
    expect(checkAnswer({ type: 'single', answer: 'A' }, null)).toBe(false);
  });
});
