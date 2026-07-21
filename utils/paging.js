/**
 * @typedef {Object} PageTableEntry
 * @property {number} pageNumber
 * @property {number|null} frameNumber - null 表示缺页
 * @property {boolean} valid - 有效位
 * @property {boolean} accessed - 访问位（LRU 使用）
 * @property {number|null} loaded - 加载顺序（FIFO 使用）
 */

/**
 * @typedef {Object} StepResult
 * @property {number} logicalAddress
 * @property {number} pageNumber
 * @property {number} offset
 * @property {boolean} hit
 * @property {number|null} frameNumber
 * @property {number|null} physicalAddress
 * @property {number|null} evictedPage
 * @property {PageTableEntry[]} pageTableSnapshot
 */

/**
 * 分解逻辑地址为页号和偏移量
 * @param {number} address - 逻辑地址
 * @param {number} pageSize - 页大小（必须为 2 的幂）
 * @returns {{ pageNumber: number, offset: number }}
 */
function decomposeAddress(address, pageSize) {
  if (address < 0) {
    throw new Error('地址不能为负');
  }
  if (pageSize <= 0 || (pageSize & (pageSize - 1)) !== 0) {
    throw new Error('页大小必须是 2 的幂');
  }
  const offsetBits = Math.log2(pageSize);
  const pageNumber = address >> offsetBits;
  const offset = address & (pageSize - 1);
  return { pageNumber, offset };
}

/**
 * 查询页表
 * @param {PageTableEntry[]} pageTable
 * @param {number} pageNumber
 * @returns {{ hit: boolean, entry: PageTableEntry|null }}
 */
function queryPageTable(pageTable, pageNumber) {
  const entry = pageTable.find(e => e.pageNumber === pageNumber) || null;
  if (!entry) {
    return { hit: false, entry: null };
  }
  return { hit: entry.valid && entry.frameNumber !== null, entry };
}

module.exports = { decomposeAddress, queryPageTable };
