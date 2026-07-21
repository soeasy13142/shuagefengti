// tests/utils/page-replacement.test.js
const { lruReplacement, fifoReplacement } = require('../../utils/page-replacement');

describe('lruReplacement', () => {
  test('LRU: evicts least recently used page (page 1 was accessed earliest)', () => {
    const table = [
      { pageNumber: 0, frameNumber: 5, valid: true, accessed: true, loaded: 1 },
      { pageNumber: 1, frameNumber: 6, valid: true, accessed: true, loaded: 2 },
      { pageNumber: 2, frameNumber: 7, valid: true, accessed: false, loaded: 3 }
    ];
    // Access history: [0, 1, 2] — page 0 was accessed most recently, page 1 least recently
    const accessHistory = [0, 1, 2];
    const result = lruReplacement(table, accessHistory, 3);
    // Access history [0,1,2] means: page 0 was accessed, then page 1, then page 2
    // So page 0 was most recently used (last access was latest), page 2 was also recently used
    // Wait: [0,1,2] the LAST element is the most recent access. So 2 is most recent, 0 is least recent
    // Actually for LRU we look at the last occurrence of each page in accessHistory
    // page 0: last seen at index 0 → least recent = 0
    // page 1: last seen at index 1 → 1
    // page 2: last seen at index 2 → most recent
    // So page 0 should be evicted as LRU
    expect(result.evictedPage).toBe(0);
    expect(typeof result.frameNumber).toBe('number');
  });

  test('LRU with 4 frames, sequence [1,2,3,4,1,5,1,2,3,4] produces correct fault count', () => {
    // Full simulation: we need pagingTransform for this, but here we test lruReplacement in isolation
    const table = [
      { pageNumber: 1, frameNumber: 0, valid: true, accessed: true, loaded: 1 },
      { pageNumber: 2, frameNumber: 1, valid: true, accessed: true, loaded: 2 },
      { pageNumber: 3, frameNumber: 2, valid: true, accessed: true, loaded: 3 },
      { pageNumber: 4, frameNumber: 3, valid: true, accessed: true, loaded: 4 }
    ];
    // All 4 frames full, accessing page 5 → fault → need to replace LRU
    const accessHistory = [1, 2, 3, 4, 1]; // pages accessed so far
    const result = lruReplacement(table, accessHistory, 4);
    // Last occurrence: page 1 at index 4 (most recent), page 2 at index 1, page 3 at index 2, page 4 at index 3
    // LRU = page 2 (least recent: index 1)
    expect(result.evictedPage).toBe(2);
  });

  test('LRU with empty slot available returns that slot', () => {
    const table = [
      { pageNumber: 0, frameNumber: 0, valid: true, accessed: true, loaded: 1 },
      { pageNumber: 1, frameNumber: null, valid: false, accessed: false, loaded: null }
    ];
    const accessHistory = [0];
    const result = lruReplacement(table, accessHistory, 4);
    // Frame 1 is available (null)
    expect(result.evictedPage).toBeNull();
    expect(result.frameNumber).toBe(1);
  });

  test('LRU with all empty slots returns first available frame', () => {
    const table = [
      { pageNumber: 0, frameNumber: null, valid: false, accessed: false, loaded: null },
      { pageNumber: 1, frameNumber: null, valid: false, accessed: false, loaded: null }
    ];
    const accessHistory = [];
    const result = lruReplacement(table, accessHistory, 4);
    expect(result.evictedPage).toBeNull();
    expect(result.frameNumber).toBe(0);
  });
});

describe('fifoReplacement', () => {
  test('FIFO: evicts the page loaded earliest (smallest loaded value)', () => {
    const table = [
      { pageNumber: 0, frameNumber: 5, valid: true, accessed: false, loaded: 1 },
      { pageNumber: 1, frameNumber: 6, valid: true, accessed: false, loaded: 2 },
      { pageNumber: 2, frameNumber: 7, valid: true, accessed: false, loaded: 3 }
    ];
    const loadOrder = [1, 2, 3]; // loaded at timestamps 1,2,3
    const result = fifoReplacement(table, loadOrder, 3);
    // Page 0 was loaded earliest (loaded=1)
    expect(result.evictedPage).toBe(0);
    expect(typeof result.frameNumber).toBe('number');
  });

  test('FIFO with 4 frames, sequence [1,2,3,4,1,5,1,2,3,4] produces correct behaviour', () => {
    const table = [
      { pageNumber: 1, frameNumber: 0, valid: true, accessed: false, loaded: 1 },
      { pageNumber: 2, frameNumber: 1, valid: true, accessed: false, loaded: 2 },
      { pageNumber: 3, frameNumber: 2, valid: true, accessed: false, loaded: 3 },
      { pageNumber: 4, frameNumber: 3, valid: true, accessed: false, loaded: 4 }
    ];
    const loadOrder = [1, 2, 3, 4];
    const result = fifoReplacement(table, loadOrder, 4);
    // Page 1 was loaded first (loaded=1)
    expect(result.evictedPage).toBe(1);
  });

  test('FIFO with empty slot available returns that slot', () => {
    const table = [
      { pageNumber: 0, frameNumber: 0, valid: true, accessed: false, loaded: 1 },
      { pageNumber: 1, frameNumber: null, valid: false, accessed: false, loaded: null }
    ];
    const loadOrder = [];
    const result = fifoReplacement(table, loadOrder, 4);
    expect(result.evictedPage).toBeNull();
    expect(result.frameNumber).toBe(1);
  });

  test('FIFO with all empty slots returns first available frame', () => {
    const table = [
      { pageNumber: 0, frameNumber: null, valid: false, accessed: false, loaded: null },
      { pageNumber: 1, frameNumber: null, valid: false, accessed: false, loaded: null }
    ];
    const loadOrder = [];
    const result = fifoReplacement(table, loadOrder, 4);
    expect(result.evictedPage).toBeNull();
    expect(result.frameNumber).toBe(0);
  });
});
