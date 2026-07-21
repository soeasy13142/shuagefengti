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
