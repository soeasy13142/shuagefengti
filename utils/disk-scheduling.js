/**
 * @typedef {Object} SeekStep
 * @property {number} from
 * @property {number} to
 * @property {number} seek
 */

/**
 * @typedef {Object} SchedResult
 * @property {number[]} path
 * @property {number} totalSeek
 * @property {SeekStep[]} steps
 */

/**
 * 电梯算法（SCAN）
 * @param {number[]} requests - 柱面号数组
 * @param {number} start - 磁头起始位置
 * @param {'up'|'down'} direction - 初始方向
 * @returns {SchedResult}
 */
function scan(requests, start, direction) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return { path: [start], totalSeek: 0, steps: [] };
  }

  const sorted = [...requests].sort((a, b) => a - b);
  const up = sorted.filter(r => r >= start);
  const down = sorted.filter(r => r < start).reverse();

  const path = [start];
  const steps = [];
  let current = start;

  // Helper to move to next target
  function moveTo(target) {
    const seek = Math.abs(target - current);
    steps.push({ from: current, to: target, seek });
    path.push(target);
    current = target;
  }

  if (direction === 'up') {
    // Go up to end boundary, then down
    for (const r of up) moveTo(r);
    moveTo(199); // go to end
    for (const r of down) moveTo(r);
  } else {
    // Go down to end boundary (0), then up
    for (const r of down) moveTo(r);
    moveTo(0);
    for (const r of up) moveTo(r);
  }

  const totalSeek = steps.reduce((sum, s) => sum + s.seek, 0);
  return { path, totalSeek, steps };
}

module.exports = { scan };
