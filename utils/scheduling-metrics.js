/**
 * 调度指标计算（纯函数）
 *
 * 输入 GanttStep[] + Process[] → 输出 { avgTAT, avgWT, cpuUtil, throughput }
 *
 * avgTAT    = Σ(completion - arrival) / n
 * avgWT     = Σ(TAT - burst) / n
 * cpuUtil   = Σburst / maxCompletion
 * throughput = n / maxCompletion
 *
 * completion = gantt 中该 pid 最后一次出现的 end 值。
 */

/**
 * 计算 4 个调度指标
 * @param {Array<{ pid: string, start: number, end: number }>} gantt
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @returns {{ avgTAT: number, avgWT: number, cpuUtil: number, throughput: number }}
 */
function calculate(gantt, processes) {
  if (!Array.isArray(gantt) || !Array.isArray(processes) || gantt.length === 0 || processes.length === 0) {
    return { avgTAT: 0, avgWT: 0, cpuUtil: 0, throughput: 0 };
  }

  const completion = {};
  for (const step of gantt) {
    if (step.end > (completion[step.pid] || 0)) {
      completion[step.pid] = step.end;
    }
  }

  let totalTAT = 0;
  let totalWT = 0;
  for (const p of processes) {
    const c = completion[p.pid] || 0;
    const tat = c - p.arrival;
    const wt = tat - p.burst;
    totalTAT += tat;
    totalWT += wt;
  }

  const n = processes.length;
  const totalBurst = processes.reduce((sum, p) => sum + p.burst, 0);
  let maxCompletion = 0;
  for (const c of Object.values(completion)) {
    if (c > maxCompletion) maxCompletion = c;
  }

  return {
    avgTAT: totalTAT / n,
    avgWT: totalWT / n,
    cpuUtil: maxCompletion === 0 ? 0 : totalBurst / maxCompletion,
    throughput: maxCompletion === 0 ? 0 : n / maxCompletion
  };
}

module.exports = {
  calculate
};
