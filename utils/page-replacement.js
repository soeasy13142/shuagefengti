/**
 * @typedef {import('./paging').PageTableEntry} PageTableEntry
 */

/**
 * LRU 页面置换：置换最久未访问的页面
 * @param {PageTableEntry[]} pageTable - 当前页表
 * @param {number[]} accessHistory - 已访问的页号序列（按时间顺序，最新在末尾）
 * @param {number} frameCount - 总帧数
 * @returns {{ evictedPage: number|null, frameNumber: number }}
 */
function lruReplacement(pageTable, accessHistory, frameCount) {
  // 找空帧（valid=false 或 frameNumber=null）
  const emptySlot = pageTable.findIndex(e => !e.valid || e.frameNumber === null);
  if (emptySlot !== -1) {
    return { evictedPage: null, frameNumber: emptySlot };
  }

  const validPages = pageTable.filter(e => e.valid && e.frameNumber !== null);

  // 如果有效页数少于总帧数，说明有空闲帧
  if (validPages.length < frameCount) {
    const usedFrames = new Set(validPages.map(e => e.frameNumber));
    for (let f = 0; f < frameCount; f++) {
      if (!usedFrames.has(f)) {
        return { evictedPage: null, frameNumber: f };
      }
    }
  }

  // 所有帧都用满了：找 LRU 页面
  // 对每个有效页，找它最后一次出现的位置
  let leastRecentPage = null;
  let leastRecentIndex = Infinity;

  for (const entry of validPages) {
    const lastIdx = accessHistory.lastIndexOf(entry.pageNumber);
    if (lastIdx < leastRecentIndex) {
      leastRecentIndex = lastIdx;
      leastRecentPage = entry.pageNumber;
    }
  }

  // 如果在 accessHistory 中找不到任何页（不应该发生），使用 loaded 值最小的
  if (leastRecentPage === null) {
    let earliestLoaded = Infinity;
    for (const entry of validPages) {
      if (entry.loaded !== null && entry.loaded < earliestLoaded) {
        earliestLoaded = entry.loaded;
        leastRecentPage = entry.pageNumber;
      }
    }
  }

  const evictedEntry = pageTable.find(e => e.pageNumber === leastRecentPage);
  return {
    evictedPage: leastRecentPage,
    frameNumber: evictedEntry ? evictedEntry.frameNumber : 0
  };
}

/**
 * FIFO 页面置换：置换最早加载的页面
 * @param {PageTableEntry[]} pageTable - 当前页表
 * @param {number[]} loadOrder - 页号加载顺序（按时间顺序）
 * @param {number} frameCount - 总帧数
 * @returns {{ evictedPage: number|null, frameNumber: number }}
 */
function fifoReplacement(pageTable, loadOrder, frameCount) {
  // 找空帧
  const emptySlot = pageTable.findIndex(e => !e.valid || e.frameNumber === null);
  if (emptySlot !== -1) {
    return { evictedPage: null, frameNumber: emptySlot };
  }

  const validPages = pageTable.filter(e => e.valid && e.frameNumber !== null);

  // 如果有效页数少于总帧数，说明有空闲帧
  if (validPages.length < frameCount) {
    const usedFrames = new Set(validPages.map(e => e.frameNumber));
    for (let f = 0; f < frameCount; f++) {
      if (!usedFrames.has(f)) {
        return { evictedPage: null, frameNumber: f };
      }
    }
  }

  // 都满了：找 loaded 值最小的页（最早加载的）
  let earliestPage = null;
  let earliestLoaded = Infinity;

  for (const entry of validPages) {
    if (entry.loaded !== null && entry.loaded < earliestLoaded) {
      earliestLoaded = entry.loaded;
      earliestPage = entry.pageNumber;
    }
  }

  const evictedEntry = pageTable.find(e => e.pageNumber === earliestPage);
  return {
    evictedPage: earliestPage,
    frameNumber: evictedEntry ? evictedEntry.frameNumber : 0
  };
}

module.exports = { lruReplacement, fifoReplacement };
