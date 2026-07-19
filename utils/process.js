/**
 * 进程数据模块（纯函数）
 *
 * 提供：
 * - PALETTE / pidColor：10 色调色板，按 pid 字符串哈希取色
 * - validateProcess：单进程校验（含 pid 唯一性）
 * - randomProcesses：随机生成测试进程
 * - MAX_PROCESSES：UI 上限
 *
 * 与 WeChat mini-program runtime 无关。
 */

const PALETTE = [
  '#cc785c', '#a9583e', '#d4a373', '#e07a5f', '#81b29a',
  '#8d99ae', '#c9ada7', '#9a8c98', '#7d6b91', '#a87b4d'
];

const MAX_PROCESSES = 10;

/**
 * 按 pid 字符串哈希从 PALETTE 取一种颜色
 * @param {string} pid
 * @returns {string} 颜色（#RRGGBB）
 */
function pidColor(pid) {
  if (typeof pid !== 'string' || pid.length === 0) {
    return PALETTE[0];
  }
  let hash = 0;
  for (let i = 0; i < pid.length; i++) {
    hash = ((hash * 31) + pid.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

/**
 * 校验单进程合法性
 * @param {{ pid: string, arrival: number, burst: number }} process
 * @param {Array<{ pid: string }>} existing 已存在的进程列表（用于 pid 唯一性）
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateProcess(process, existing) {
  const errors = [];
  if (!process || typeof process !== 'object') {
    return { valid: false, errors: ['进程对象不合法'] };
  }
  if (typeof process.pid !== 'string' || process.pid.trim() === '') {
    errors.push('pid 不能为空');
  }
  if (typeof process.arrival !== 'number' || !Number.isInteger(process.arrival) || process.arrival < 0) {
    errors.push('arrival 必须是非负整数');
  }
  if (typeof process.burst !== 'number' || !Number.isInteger(process.burst) || process.burst <= 0) {
    errors.push('burst 必须是正整数');
  }
  if (errors.length === 0 && Array.isArray(existing)) {
    for (const p of existing) {
      if (p && p.pid === process.pid) {
        errors.push('pid 重复');
        break;
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * 随机生成 n 个测试进程（pid = P1..Pn，arrival ∈ [0,10]，burst ∈ [1,10]）
 * @param {number} n
 * @returns {Array<{ pid: string, arrival: number, burst: number }>}
 */
function randomProcesses(n) {
  const count = Math.max(0, Math.min(MAX_PROCESSES, Number(n) || 0));
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      pid: 'P' + (i + 1),
      arrival: Math.floor(Math.random() * 11),  // 0..10 inclusive
      burst: Math.floor(Math.random() * 10) + 1   // 1..10 inclusive
    });
  }
  return out;
}

module.exports = {
  PALETTE,
  pidColor,
  validateProcess,
  randomProcesses,
  MAX_PROCESSES
};
