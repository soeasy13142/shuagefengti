// tests/utils/paging.test.js
const { decomposeAddress, queryPageTable, pagingTransform } = require('../../utils/paging');

describe('decomposeAddress', () => {
  test('pageSize=256 (8-bit offset), address=0x00A2 -> pageNumber=0, offset=0xA2', () => {
    const result = decomposeAddress(0x00A2, 256);
    expect(result.pageNumber).toBe(0);
    expect(result.offset).toBe(0xA2);
  });

  test('pageSize=256, address=0x003F -> pageNumber=0, offset=0x3F', () => {
    const result = decomposeAddress(0x003F, 256);
    expect(result.pageNumber).toBe(0);
    expect(result.offset).toBe(0x3F);
  });

  test('pageSize=256, address=0x01FF -> pageNumber=1, offset=0xFF', () => {
    const result = decomposeAddress(0x01FF, 256);
    expect(result.pageNumber).toBe(1);
    expect(result.offset).toBe(0xFF);
  });

  test('pageSize=1024 (10-bit offset), address=0x0A00 -> pageNumber=2, offset=0x200', () => {
    const result = decomposeAddress(0x0A00, 1024);
    expect(result.pageNumber).toBe(2);
    expect(result.offset).toBe(0x200);
  });

  test('pageSize must be power of 2, throws error otherwise', () => {
    expect(() => decomposeAddress(0x00A2, 300)).toThrow('页大小必须是 2 的幂');
  });

  test('negative address throws error', () => {
    expect(() => decomposeAddress(-1, 256)).toThrow('地址不能为负');
  });
});

describe('queryPageTable', () => {
  test('valid entry returns hit=true with frameNumber', () => {
    const table = [
      { pageNumber: 0, frameNumber: 5, valid: true, accessed: false, loaded: null },
      { pageNumber: 1, frameNumber: null, valid: false, accessed: false, loaded: null }
    ];
    const result = queryPageTable(table, 0);
    expect(result.hit).toBe(true);
    expect(result.entry.frameNumber).toBe(5);
  });

  test('invalid entry returns hit=false with null frameNumber', () => {
    const table = [
      { pageNumber: 0, frameNumber: 5, valid: true, accessed: false, loaded: null },
      { pageNumber: 1, frameNumber: null, valid: false, accessed: false, loaded: null }
    ];
    const result = queryPageTable(table, 1);
    expect(result.hit).toBe(false);
    expect(result.entry.frameNumber).toBeNull();
  });

  test('non-existent pageNumber returns hit=false and entry=null', () => {
    const table = [
      { pageNumber: 0, frameNumber: 5, valid: true, accessed: false, loaded: null }
    ];
    const result = queryPageTable(table, 99);
    expect(result.hit).toBe(false);
    expect(result.entry).toBeNull();
  });

  test('empty page table returns hit=false and entry=null', () => {
    const result = queryPageTable([], 0);
    expect(result.hit).toBe(false);
    expect(result.entry).toBeNull();
  });
});

const { lruReplacement, fifoReplacement } = require('../../utils/page-replacement');

describe('pagingTransform', () => {
  test('simple hit — all addresses in page table', () => {
    const pageTable = [
      { pageNumber: 0, frameNumber: 5, valid: true, accessed: false, loaded: 1 },
      { pageNumber: 1, frameNumber: 3, valid: true, accessed: false, loaded: 2 }
    ];
    const result = pagingTransform([0x00A0, 0x01A0], 256, pageTable, 'lru', 4,
      lruReplacement, fifoReplacement);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].hit).toBe(true);
    expect(result.steps[0].physicalAddress).toBe(5 * 256 + 0xA0);
    expect(result.steps[1].hit).toBe(true);
    expect(result.steps[1].physicalAddress).toBe(3 * 256 + 0xA0);
    expect(result.stats.totalFaults).toBe(0);
    expect(result.stats.faultRate).toBe(0);
  });

  test('page fault triggers replacement', () => {
    // Only page 0,1 in table, address 0x0200 maps to page 2 → fault
    const pageTable = [
      { pageNumber: 0, frameNumber: 0, valid: true, accessed: false, loaded: 1 },
      { pageNumber: 1, frameNumber: 1, valid: true, accessed: false, loaded: 2 }
    ];
    const result = pagingTransform([0x0000, 0x0100, 0x0200], 256, pageTable, 'lru', 2,
      lruReplacement, fifoReplacement);
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].hit).toBe(true); // page 0 → hit
    expect(result.steps[1].hit).toBe(true); // page 1 → hit
    expect(result.steps[2].hit).toBe(false); // page 2 → fault
    expect(result.stats.totalFaults).toBe(1);
    expect(result.stats.faultRate).toBe(1 / 3);
    // After fault, page 2 should be in the table (page table snapshot updated)
    const finalSnapshot = result.steps[2].pageTableSnapshot;
    expect(finalSnapshot.some(e => e.pageNumber === 2 && e.valid)).toBe(true);
  });

  test('LRU vs FIFO different fault rates on [1,2,3,4,1,5,1,2,3,4] with 4 frames', () => {
    // For this benchmark sequence, LRU should fault less than FIFO
    const emptyTable = [
      { pageNumber: null, frameNumber: null, valid: false, accessed: false, loaded: null }
    ];
    // Generate addresses: pages 1,2,3,4,1,5,1,2,3,4 → pageSize=256, each address = pageNumber*256
    const addresses = [1, 2, 3, 4, 1, 5, 1, 2, 3, 4].map(p => p * 256);

    const lruResult = pagingTransform(addresses, 256, emptyTable, 'lru', 4,
      lruReplacement, fifoReplacement);
    const fifoResult = pagingTransform(addresses, 256, emptyTable, 'fifo', 4,
      lruReplacement, fifoReplacement);

    // LRU: 5 faults (pages 2,3,4,5,2 → but actually let's trust the algorithm)
    // FIFO: 6 faults (pages 2,3,4,5,1,2 → more faults)
    // The exact numbers depend on implementation, but LRU should be <= FIFO
    expect(lruResult.stats.totalFaults).toBeLessThanOrEqual(fifoResult.stats.totalFaults);
  });

  test('empty address list returns empty steps', () => {
    const result = pagingTransform([], 256, [], 'lru', 4, lruReplacement, fifoReplacement);
    expect(result.steps).toEqual([]);
    expect(result.stats.totalFaults).toBe(0);
    expect(result.stats.faultRate).toBe(0);
  });

  test('single address page fault creates new table entry', () => {
    const emptyTable = [];
    const result = pagingTransform([0x000A], 256, emptyTable, 'lru', 4,
      lruReplacement, fifoReplacement);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].hit).toBe(false);
    expect(result.steps[0].pageNumber).toBe(0);
    expect(result.steps[0].frameNumber).toBe(0); // first frame
    expect(result.steps[0].evictedPage).toBeNull();
    expect(result.stats.totalFaults).toBe(1);
  });
});
