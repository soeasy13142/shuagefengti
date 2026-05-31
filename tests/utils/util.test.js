const { generateId, formatTime, formatDuration } = require('../../utils/util');

describe('generateId', () => {
  test('生成唯一 ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });
});

describe('formatTime', () => {
  test('格式化 Date 对象', () => {
    const date = new Date('2026-05-31T14:30:00');
    const result = formatTime(date);
    expect(result).toBe('2026-05-31 14:30:00');
  });
});

describe('formatDuration', () => {
  test('格式化秒数为分秒', () => {
    expect(formatDuration(65)).toBe('1分5秒');
  });
  test('格式化整分钟', () => {
    expect(formatDuration(120)).toBe('2分0秒');
  });
  test('不到一分钟', () => {
    expect(formatDuration(45)).toBe('45秒');
  });
});
