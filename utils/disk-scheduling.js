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
 * 磁头移动辅助函数
 * @param {number} target - 目标柱面
 * @param {number} current - 当前柱面
 * @param {number[]} path - 路径数组（会被追加）
 * @param {SeekStep[]} steps - 步骤数组（会被追加）
 * @returns {number} 新的当前柱面
 */
function _moveTo(target, current, path, steps) {
  const seek = Math.abs(target - current);
  steps.push({ from: current, to: target, seek });
  path.push(target);
  return target;
}

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
  const up = sorted.filter(r => r > start);
  const down = [...sorted.filter(r => r < start)].reverse();

  const path = [start];
  const steps = [];
  let current = start;

  if (direction === 'up') {
    // Go up to end boundary, then down
    for (const r of up) current = _moveTo(r, current, path, steps);
    current = _moveTo(199, current, path, steps); // go to end
    for (const r of down) current = _moveTo(r, current, path, steps);
  } else {
    // Go down to end boundary (0), then up
    for (const r of down) current = _moveTo(r, current, path, steps);
    current = _moveTo(0, current, path, steps);
    for (const r of up) current = _moveTo(r, current, path, steps);
  }

  const totalSeek = steps.reduce((sum, s) => sum + s.seek, 0);
  return { path, totalSeek, steps };
}

/**
 * 循环扫描算法（C-SCAN）
 * 向指定方向扫描到底，跳回起点对侧再扫描
 */
function cScan(requests, start, direction) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return { path: [start], totalSeek: 0, steps: [] };
  }

  const sorted = [...requests].sort((a, b) => a - b);
  const up = sorted.filter(r => r > start);
  const down = sorted.filter(r => r < start);

  const path = [start];
  const steps = [];
  let current = start;

  if (direction === 'up') {
    for (const r of up) current = _moveTo(r, current, path, steps);
    current = _moveTo(199, current, path, steps);
    current = _moveTo(0, current, path, steps);
    for (const r of down) current = _moveTo(r, current, path, steps);
  } else {
    for (const r of [...down].reverse()) current = _moveTo(r, current, path, steps);
    current = _moveTo(0, current, path, steps);
    current = _moveTo(199, current, path, steps);
    for (const r of up) current = _moveTo(r, current, path, steps);
  }

  const totalSeek = steps.reduce((sum, s) => sum + s.seek, 0);
  return { path, totalSeek, steps };
}

/**
 * LOOK 算法
 * 扫描到最远请求即转向，不扫到底
 */
function look(requests, start, direction) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return { path: [start], totalSeek: 0, steps: [] };
  }

  const sorted = [...requests].sort((a, b) => a - b);
  const up = sorted.filter(r => r > start);
  const down = [...sorted.filter(r => r < start)].reverse();

  const path = [start];
  const steps = [];
  let current = start;

  if (direction === 'up') {
    for (const r of up) current = _moveTo(r, current, path, steps);
    for (const r of down) current = _moveTo(r, current, path, steps);
  } else {
    for (const r of down) current = _moveTo(r, current, path, steps);
    for (const r of up) current = _moveTo(r, current, path, steps);
  }

  const totalSeek = steps.reduce((sum, s) => sum + s.seek, 0);
  return { path, totalSeek, steps };
}

/**
 * C-LOOK 算法
 * 向指定方向到最远请求，跳回对侧最远请求继续
 */
function cLook(requests, start, direction) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return { path: [start], totalSeek: 0, steps: [] };
  }

  const sorted = [...requests].sort((a, b) => a - b);
  const up = sorted.filter(r => r > start);
  const down = sorted.filter(r => r < start);

  const path = [start];
  const steps = [];
  let current = start;

  if (direction === 'up') {
    for (const r of up) current = _moveTo(r, current, path, steps);
    if (down.length > 0) {
      current = _moveTo(down[0], current, path, steps); // jump to smallest
      for (let i = 1; i < down.length; i++) current = _moveTo(down[i], current, path, steps);
    }
  } else {
    for (const r of [...down].reverse()) current = _moveTo(r, current, path, steps);
    if (up.length > 0) {
      current = _moveTo(up[up.length - 1], current, path, steps); // jump to biggest
      for (let i = up.length - 2; i >= 0; i--) current = _moveTo(up[i], current, path, steps);
    }
  }

  const totalSeek = steps.reduce((sum, s) => sum + s.seek, 0);
  return { path, totalSeek, steps };
}

const _ALGO_MAP = { scan, cScan, look, cLook };

/**
 * 对比多个算法的性能
 * @param {number[]} requests
 * @param {number} start
 * @param {string[]} algorithms - ['scan', 'cScan', 'look', 'cLook']
 * @param {'up'|'down'} [direction='up'] - 方向
 * @returns {Object<string, { totalSeek: number, path: number[] }>}
 */
function compareAlgorithms(requests, start, algorithms, direction) {
  const dir = direction || 'up';
  const result = {};
  for (const name of algorithms) {
    const fn = _ALGO_MAP[name];
    if (fn) {
      const r = fn(requests, start, dir);
      result[name] = { totalSeek: r.totalSeek, path: r.path };
    }
  }
  return result;
}

module.exports = { scan, cScan, look, cLook, compareAlgorithms };
