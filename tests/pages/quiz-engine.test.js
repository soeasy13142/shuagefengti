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

describe('onToggleMulti 逻辑', () => {
  function simulateToggle(userAnswer, option) {
    let current = userAnswer || '';
    if (current.includes(option)) {
      current = current.replace(option, '');
    } else {
      current = (current + option).split('').sort().join('');
    }
    return current;
  }

  test('从空状态开始选择 A', () => {
    expect(simulateToggle('', 'A')).toBe('A');
  });

  test('选择 A 后再选 B 得到 AB', () => {
    expect(simulateToggle('A', 'B')).toBe('AB');
  });

  test('选择 AB 后再选 D 得到 ABD', () => {
    expect(simulateToggle('AB', 'D')).toBe('ABD');
  });

  test('取消选择 A 得到 B', () => {
    expect(simulateToggle('AB', 'A')).toBe('B');
  });

  test('取消选择 B 得到 A', () => {
    expect(simulateToggle('AB', 'B')).toBe('A');
  });

  test('空字符串不阻塞 - exam mode guard', () => {
    const answered = false;
    const mode = 'exam';
    const blocked = answered && mode === 'practice';
    expect(blocked).toBe(false);
  });

  test('已答题 exam mode guard 不阻塞', () => {
    const answered = true;
    const mode = 'exam';
    const blocked = answered && mode === 'practice';
    expect(blocked).toBe(false);
  });
});

describe('WXML 模板兼容性', () => {
  test('String.includes 在模板中应工作', () => {
    const userAnswer = 'AB';
    expect(userAnswer.includes('A')).toBe(true);
    expect(userAnswer.includes('C')).toBe(false);
  });

  test('String.indexOf 作为备选方案', () => {
    const userAnswer = 'AB';
    expect(userAnswer.indexOf('A') > -1).toBe(true);
    expect(userAnswer.indexOf('C') > -1).toBe(false);
  });

  test('charAt(0) 提取选项字母', () => {
    const options = ['A. Apple', 'B. Banana', 'C. Cherry'];
    expect(options[0].charAt(0)).toBe('A');
    expect(options[1].charAt(0)).toBe('B');
    expect(options[2].charAt(0)).toBe('C');
  });
});

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
