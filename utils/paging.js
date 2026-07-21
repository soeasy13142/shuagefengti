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

/**
 * 创建新页表条目
 * @param {number} pageNumber
 * @param {number} frameNumber
 * @param {number} loadTime
 * @returns {PageTableEntry}
 */
function _createEntry(pageNumber, frameNumber, loadTime) {
  return {
    pageNumber,
    frameNumber,
    valid: true,
    accessed: true,
    loaded: loadTime
  };
}

/**
 * 深拷贝页表
 * @param {PageTableEntry[]} table
 * @returns {PageTableEntry[]}
 */
function _cloneTable(table) {
  return table.map(e => ({ ...e }));
}

/**
 * 地址转换完整流程
 * @param {number[]} addresses - 逻辑地址数组
 * @param {number} pageSize - 页大小
 * @param {PageTableEntry[]} initialPageTable - 初始页表
 * @param {'lru'|'fifo'} algorithm - 置换算法
 * @param {number} frameCount - 帧总数
 * @param {Function} lruFn - LRU 置换函数
 * @param {Function} fifoFn - FIFO 置换函数
 * @returns {{ steps: StepResult[], stats: { totalFaults: number, faultRate: number } }}
 */
function pagingTransform(addresses, pageSize, initialPageTable, algorithm, frameCount,
  lruFn, fifoFn) {
  const steps = [];
  let pageTable = _cloneTable(initialPageTable);
  const accessHistory = [];
  const loadOrder = [];
  let loadCounter = pageTable.filter(e => e.valid && e.loaded !== null).length;
  let totalFaults = 0;

  for (const addr of addresses) {
    const { pageNumber, offset } = decomposeAddress(addr, pageSize);
    const { hit, entry } = queryPageTable(pageTable, pageNumber);

    let frameNumber = null;
    let physicalAddress = null;
    let evictedPage = null;

    if (hit && entry) {
      // 命中：已有帧号
      frameNumber = entry.frameNumber;
      physicalAddress = frameNumber * pageSize + offset;
      entry.accessed = true;
    } else {
      // 缺页
      totalFaults++;

      // 选择置换函数
      const replaceFn = algorithm === 'lru' ? lruFn : fifoFn;
      const accessSeq = algorithm === 'lru' ? accessHistory : loadOrder;
      const replaceResult = replaceFn(pageTable, accessSeq, frameCount);

      frameNumber = replaceResult.frameNumber;
      evictedPage = replaceResult.evictedPage;

      // 如果被置换，移除旧条目
      if (evictedPage !== null) {
        const existingIdx = pageTable.findIndex(e => e.pageNumber === evictedPage);
        if (existingIdx !== -1) {
          // 不可变：创建新数组替换旧条目
          pageTable = pageTable.map((e, idx) =>
            idx === existingIdx
              ? { pageNumber: e.pageNumber, frameNumber: null, valid: false, accessed: false, loaded: null }
              : e
          );
        }
      }

      // 添加新条目（不可变：创建新数组）
      loadCounter++;
      const existingIdx = pageTable.findIndex(e => e.pageNumber === pageNumber);
      if (existingIdx !== -1) {
        pageTable = pageTable.map((e, idx) =>
          idx === existingIdx
            ? _createEntry(pageNumber, frameNumber, loadCounter)
            : e
        );
      } else {
        pageTable = [...pageTable, _createEntry(pageNumber, frameNumber, loadCounter)];
      }

      physicalAddress = frameNumber * pageSize + offset;
    }

    accessHistory.push(pageNumber);
    loadOrder.push(loadCounter);

    steps.push({
      logicalAddress: addr,
      pageNumber,
      offset,
      hit,
      frameNumber,
      physicalAddress,
      evictedPage,
      pageTableSnapshot: _cloneTable(pageTable)
    });
  }

  const total = addresses.length;
  const faultRate = total > 0 ? totalFaults / total : 0;

  return {
    steps,
    stats: { totalFaults, faultRate }
  };
}

module.exports = { decomposeAddress, queryPageTable, pagingTransform };
