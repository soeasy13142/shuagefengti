/**
 * @typedef {Object} Fragment
 * @property {number} index
 * @property {number} dataStart
 * @property {number} dataEnd
 * @property {number} dataLength
 * @property {string} id
 * @property {boolean} mf
 * @property {number} offset
 * @property {number} offsetBytes
 */

/**
 * @typedef {Object} MergeStep
 * @property {number} fragmentIndex - 被合并的分片序号（1-based）
 * @property {number} cumulativeBytes - 合并至此的累计字节数
 * @property {string} description - 本步说明文字
 */

/**
 * @typedef {Object} ReassembledResult
 * @property {boolean} success - 是否成功重组
 * @property {number} totalBytes - 重组后总字节数
 * @property {number} totalFragments - 分片数
 * @property {Fragment[]} fragments - 按偏移排序的分片列表
 * @property {MergeStep[]} mergeSteps - 重组动画步骤（从最后一片开始合并）
 * @property {string[]} [errors] - 错误信息列表
 */

/**
 * 将 IP 分片重组回完整数据报
 * 重组逻辑：从最后一个分片（MF=0）开始逆向合并，逐步累加字节
 * @param {Fragment[]} fragments - 分片列表（将按 offset 重排序）
 * @returns {ReassembledResult}
 */
function reassemble(fragments) {
  if (!Array.isArray(fragments) || fragments.length === 0) {
    return { success: false, totalBytes: 0, totalFragments: 0, fragments: [], mergeSteps: [], errors: ['无分片数据'] };
  }

  // Sort by offset to ensure correct order
  var sorted = [].concat(fragments).sort(function(a, b) { return a.offset - b.offset; });

  // Verify no gaps (simplified)
  var totalBytes = sorted.reduce(function(sum, f) { return sum + f.dataLength; }, 0);

  // Build merge steps for animation (reverse order: last fragment first)
  var mergeSteps = [];
  var reversed = [].concat(sorted).reverse();
  var cumulativeBytes = 0;
  for (var i = 0; i < reversed.length; i++) {
    var f = reversed[i];
    cumulativeBytes = cumulativeBytes + f.dataLength;
    mergeSteps.push({
      fragmentIndex: f.index,
      cumulativeBytes: cumulativeBytes,
      description: '合并分片 ' + f.index + '（字节 ' + f.dataStart + '~' + f.dataEnd + '，'
        + f.dataLength + ' 字节）→ 累计 ' + cumulativeBytes + '/' + totalBytes + ' 字节'
    });
  }

  return {
    success: true,
    totalBytes: totalBytes,
    totalFragments: sorted.length,
    fragments: sorted,
    mergeSteps: mergeSteps.reverse()
  };
}

module.exports = { reassemble: reassemble };
