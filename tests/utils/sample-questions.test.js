const { sampleMarkdown } = require('../../utils/sample-questions');
const { parseMarkdown } = require('../../utils/markdown-parser');

describe('sample questions', () => {
  test('sampleMarkdown parses into at least 1 question', () => {
    const questions = parseMarkdown(sampleMarkdown);
    expect(questions.length).toBeGreaterThanOrEqual(1);
  });

  test('sampleMarkdown parses into 10 questions', () => {
    const questions = parseMarkdown(sampleMarkdown);
    expect(questions).toHaveLength(10);
  });

  test('each question has required fields', () => {
    const questions = parseMarkdown(sampleMarkdown);
    for (const q of questions) {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('type');
      expect(q).toHaveProperty('stem');
      expect(q).toHaveProperty('options');
      expect(q).toHaveProperty('answer');
      expect(typeof q.stem).toBe('string');
      expect(q.stem.length).toBeGreaterThan(0);
      expect(Array.isArray(q.options)).toBe(true);
      expect(typeof q.answer).toBe('string');
      expect(q.answer.length).toBeGreaterThan(0);
    }
  });

  test('covers multiple question types', () => {
    const questions = parseMarkdown(sampleMarkdown);
    const types = new Set(questions.map(q => q.type));
    expect(types.has('single')).toBe(true);
    expect(types.has('multi')).toBe(true);
    expect(types.has('fill')).toBe(true);
    expect(types.has('essay')).toBe(true);
  });

  test('first question is a single-choice with correct answer', () => {
    const questions = parseMarkdown(sampleMarkdown);
    const first = questions[0];
    expect(first.type).toBe('single');
    expect(first.stem).toContain('JavaScript');
    expect(first.answer).toBe('C');
  });
});
