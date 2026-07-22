const { STATUS_CODES, getStatusCodesByCategory, getStatusCodeInfo } = require('../../utils/http-status-codes');

describe('HTTP status codes', () => {
  test('contains at least 13 status codes', () => {
    const allCodes = Object.values(STATUS_CODES).flat();
    expect(allCodes.length).toBeGreaterThanOrEqual(13);
  });

  test('all codes have required fields', () => {
    const allCodes = Object.values(STATUS_CODES).flat();
    for (const entry of allCodes) {
      expect(typeof entry.code).toBe('number');
      expect(entry.phrase).toBeTruthy();
      expect(entry.category).toMatch(/^\dx{2}$/);
      expect(entry.info).toBeTruthy();
    }
  });

  test('no duplicate codes', () => {
    const allCodes = Object.values(STATUS_CODES).flat();
    const codes = allCodes.map(e => e.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  test('codes are grouped by category correctly', () => {
    for (const [category, entries] of Object.entries(STATUS_CODES)) {
      for (const entry of entries) {
        expect(entry.category).toBe(category);
        expect(entry.code.toString().charAt(0) + 'xx').toBe(category);
      }
    }
  });

  test('getStatusCodesByCategory returns correct entries', () => {
    const codes = getStatusCodesByCategory('2xx');
    expect(codes.length).toBeGreaterThan(0);
    expect(codes.every(c => c.category === '2xx')).toBe(true);
  });

  test('getStatusCodeInfo returns single code info', () => {
    const info = getStatusCodeInfo(200);
    expect(info.code).toBe(200);
    expect(info.phrase).toBe('OK');
  });

  test('getStatusCodeInfo returns undefined for unknown code', () => {
    expect(getStatusCodeInfo(999)).toBeUndefined();
  });

  test('covers at least 1 code per category (1xx-5xx)', () => {
    for (const cat of ['1xx', '2xx', '3xx', '4xx', '5xx']) {
      expect(STATUS_CODES[cat]).toBeDefined();
      expect(STATUS_CODES[cat].length).toBeGreaterThanOrEqual(1);
    }
  });
});
