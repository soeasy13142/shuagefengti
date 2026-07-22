const { SAMPLES } = require('../../utils/http-samples');
const { parseHttp } = require('../../utils/http-parser');

describe('HTTP sample library', () => {
  test('contains at least 6 samples', () => {
    expect(SAMPLES.length).toBeGreaterThanOrEqual(6);
  });

  test('all samples have required fields', () => {
    for (const s of SAMPLES) {
      expect(s.id).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.raw).toBeTruthy();
      expect(s.expectedType).toMatch(/^(request|response)$/);
    }
  });

  test('all samples have unique IDs', () => {
    const ids = SAMPLES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all samples parse without errors', () => {
    for (const s of SAMPLES) {
      const result = parseHttp(s.raw);
      expect(result.type).toBe(s.expectedType);
      const hasFatalError = result.errors.some(e => e.type === 'error');
      expect(hasFatalError).toBe(false);
    }
  });
});
