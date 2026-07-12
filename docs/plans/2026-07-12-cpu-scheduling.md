# CPU 进程调度可视化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `pages/cpu-sched/` 页面，演示 4 种 CPU 进程调度算法（FCFS / SJF / RR / MFQ），含进程输入、甘特图渲染、性能指标计算（avg TAT / avg WT / CPU 利用率 / 吞吐量）、动画播放控制。

**Architecture:** 纯前端 + 3 个 utils 纯函数模块（process / scheduling / scheduling-metrics）+ 1 个页面（4 文件：js/wxml/wxss/json）。WXML/WXSS 实现动画，不引第三方库。Jest 全测。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest + CommonJS（require/module.exports）。

**Spec:** `docs/superpowers/specs/2026-07-12-cpu-scheduling-design.md`

## Global Constraints

- 所有代码使用 `const`/`let`，**禁用 `var`**（CLAUDE.md §代码风格）
- 文件命名：小写 + kebab-case（CLAUDE.md §命名约定）
- 私有函数 / 模块状态：`_underscore` 前缀
- 异步优先：`Promise` / `async-await`
- 错误处理：所有 `catch` 必须显式处理或 `throw`，禁止静默吞
- 注释：`/** */` JSDoc 用于公开 API；行内 `//` 仅用于解释 why
- 测试命令：`cd /Users/charliepan/Downloads/my-miniapp && npm test`（必须全绿）
- 设计风格：Claude Design 暖奶油画布（背景 `#faf9f5`、卡片 `#efe9de`、CTA `#cc785c`、Georgia 标题；CLAUDE.md §设计风格约束）
- 不引入第三方依赖（无新 npm 包）
- 中文 UI 文案；变量名 / 函数名 / 注释 / commit 英文

---

## Task 1: 进程数据模块

**Files:**
- Create: `utils/process.js`
- Test: `tests/utils/process.test.js`

**Interfaces:**
- Consumes: 无（独立模块）
- Produces:
  - `PALETTE`: `string[]` （10 个颜色字符串，用于按 pid 哈希取色）
  - `validateProcess(process, existingProcesses)`: `→ { valid: boolean, errors: string[] }`
  - `randomProcesses(n, seed?)`: `→ Process[]` (生成 n 个随机进程)
  - `pidColor(pid)`: `→ string` （按 pid 字符串哈希在 PALETTE 中取色）
  - `MAX_PROCESSES`: 10（UI 上限）

`Process` 数据结构：

```js
{ pid: string, arrival: number, burst: number, priority?: number }
```

- [ ] **Step 1: Write failing test**

`tests/utils/process.test.js`:

```js
const {
  validateProcess,
  randomProcesses,
  pidColor,
  PALETTE,
  MAX_PROCESSES
} = require('../../utils/process');

describe('PALETTE', () => {
  test('contains exactly 10 colors', () => {
    expect(PALETTE).toHaveLength(10);
    for (const c of PALETTE) {
      expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('pidColor', () => {
  test('returns a valid palette color', () => {
    expect(PALETTE).toContain(pidColor('P1'));
    expect(PALETTE).toContain(pidColor('P100'));
  });

  test('same pid yields same color (deterministic)', () => {
    expect(pidColor('P1')).toBe(pidColor('P1'));
  });

  test('different pids distribute across palette', () => {
    const seen = new Set();
    for (let i = 1; i <= 20; i++) {
      seen.add(pidColor('P' + i));
    }
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });
});

describe('validateProcess', () => {
  const empty = [];
  test('accepts a valid process', () => {
    const r = validateProcess({ pid: 'P1', arrival: 0, burst: 5 }, empty);
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  test('rejects missing pid', () => {
    const r = validateProcess({ pid: '', arrival: 0, burst: 5 }, empty);
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  test('rejects negative arrival', () => {
    const r = validateProcess({ pid: 'P1', arrival: -1, burst: 5 }, empty);
    expect(r.valid).toBe(false);
  });

  test('rejects non-integer arrival', () => {
    const r = validateProcess({ pid: 'P1', arrival: 1.5, burst: 5 }, empty);
    expect(r.valid).toBe(false);
  });

  test('rejects burst <= 0', () => {
    expect(validateProcess({ pid: 'P1', arrival: 0, burst: 0 }, empty).valid).toBe(false);
    expect(validateProcess({ pid: 'P1', arrival: 0, burst: -1 }, empty).valid).toBe(false);
  });

  test('rejects non-integer burst', () => {
    const r = validateProcess({ pid: 'P1', arrival: 0, burst: 3.5 }, empty);
    expect(r.valid).toBe(false);
  });

  test('rejects duplicate pid against existing processes', () => {
    const existing = [{ pid: 'P1', arrival: 0, burst: 5 }];
    const r = validateProcess({ pid: 'P1', arrival: 2, burst: 3 }, existing);
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.indexOf('重复') !== -1 || e.indexOf('重复') !== -1)).toBe(true);
  });

  test('rejects duplicate pid within the same input (non-array, single check)', () => {
    const existing = [{ pid: 'P2', arrival: 0, burst: 5 }];
    const r = validateProcess({ pid: 'P2', arrival: 2, burst: 3 }, existing);
    expect(r.valid).toBe(false);
  });
});

describe('randomProcesses', () => {
  test('returns n processes', () => {
    const ps = randomProcesses(5);
    expect(ps).toHaveLength(5);
  });

  test('each process has unique pid matching P1..Pn', () => {
    const ps = randomProcesses(5);
    const pids = ps.map(p => p.pid);
    expect(new Set(pids).size).toBe(5);
    expect(pids.sort()).toEqual(['P1', 'P2', 'P3', 'P4', 'P5']);
  });

  test('arrival and burst are within expected ranges', () => {
    const ps = randomProcesses(50);
    for (const p of ps) {
      expect(p.arrival).toBeGreaterThanOrEqual(0);
      expect(p.arrival).toBeLessThanOrEqual(10);
      expect(p.burst).toBeGreaterThanOrEqual(1);
      expect(p.burst).toBeLessThanOrEqual(10);
      expect(Number.isInteger(p.arrival)).toBe(true);
      expect(Number.isInteger(p.burst)).toBe(true);
    }
  });
});

describe('MAX_PROCESSES', () => {
  test('is 10', () => {
    expect(MAX_PROCESSES).toBe(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/process.test.js`
Expected: FAIL with "Cannot find module '../../utils/process'"

- [ ] **Step 3: Implement `utils/process.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/process.test.js`
Expected: PASS (16 tests)

- [ ] **Step 5: Commit**

```bash
git add utils/process.js tests/utils/process.test.js
git commit -m "feat(process): 进程校验 + 随机生成 + 10 色调色板"
```

---

## Task 2: FCFS + SJF 调度算法

**Files:**
- Create: `utils/scheduling.js`
- Test: `tests/utils/scheduling.test.js`

**Interfaces:**
- Consumes: 无（独立模块；后续任务会补充 RR / MFQ）
- Produces:
  - `fcfs(processes)`: `→ GanttStep[]`
  - `sjf(processes)`: `→ GanttStep[]`
  - `rr(processes, quantum)`: `→ GanttStep[]`（本任务占位 throw，Task 3 实现）
  - `mfq(processes, queues?)`: `→ GanttStep[]`（本任务占位 throw，Task 3 实现）

`GanttStep` 数据结构：

```js
{ pid: string, start: number, end: number }
```

`processes`: `Array<{ pid: string, arrival: number, burst: number }>`

- [ ] **Step 1: Write failing test**

`tests/utils/scheduling.test.js`:

```js
const { fcfs, sjf, rr, mfq } = require('../../utils/scheduling');

describe('fcfs', () => {
  test('3 processes: serial execution by arrival', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 1, burst: 3 },
      { pid: 'P3', arrival: 2, burst: 8 }
    ];
    expect(fcfs(ps)).toEqual([
      { pid: 'P1', start: 0, end: 5 },
      { pid: 'P2', start: 5, end: 8 },
      { pid: 'P3', start: 8, end: 16 }
    ]);
  });

  test('orders input by arrival when arrival increases', () => {
    const ps = [
      { pid: 'P3', arrival: 4, burst: 2 },
      { pid: 'P1', arrival: 0, burst: 3 },
      { pid: 'P2', arrival: 2, burst: 1 }
    ];
    expect(fcfs(ps).map(s => s.pid)).toEqual(['P1', 'P2', 'P3']);
  });

  test('ties on arrival fall back to pid lexicographic', () => {
    const ps = [
      { pid: 'P3', arrival: 0, burst: 1 },
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 0, burst: 3 }
    ];
    expect(fcfs(ps).map(s => s.pid)).toEqual(['P1', 'P2', 'P3']);
  });

  test('idle gap when next process has not arrived', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 2 },
      { pid: 'P2', arrival: 5, burst: 3 }
    ];
    expect(fcfs(ps)).toEqual([
      { pid: 'P1', start: 0, end: 2 },
      { pid: 'P2', start: 5, end: 8 }
    ]);
  });

  test('single process', () => {
    expect(fcfs([{ pid: 'P1', arrival: 0, burst: 5 }])).toEqual([
      { pid: 'P1', start: 0, end: 5 }
    ]);
  });

  test('empty input returns empty gantt', () => {
    expect(fcfs([])).toEqual([]);
  });
});

describe('sjf (non-preemptive)', () => {
  test('shortest burst first (same arrival)', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 0, burst: 3 },
      { pid: 'P3', arrival: 0, burst: 8 }
    ];
    expect(sjf(ps).map(s => s.pid)).toEqual(['P2', 'P1', 'P3']);
  });

  test('matches spec example: P2(3) → P1(5) → P3(8)', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 1, burst: 3 },
      { pid: 'P3', arrival: 2, burst: 8 }
    ];
    // At t=0 only P1; runs P1 [0,5]. Then ready: P2(1,3), P3(2,8). Pick P2. Then P3.
    expect(sjf(ps)).toEqual([
      { pid: 'P1', start: 0, end: 5 },
      { pid: 'P2', start: 5, end: 8 },
      { pid: 'P3', start: 8, end: 16 }
    ]);
  });

  test('same burst, same arrival → break by pid lexicographic', () => {
    const ps = [
      { pid: 'P3', arrival: 0, burst: 4 },
      { pid: 'P1', arrival: 0, burst: 4 },
      { pid: 'P2', arrival: 0, burst: 4 }
    ];
    expect(sjf(ps).map(s => s.pid)).toEqual(['P1', 'P2', 'P3']);
  });

  test('idle gap when no process has arrived', () => {
    const ps = [
      { pid: 'P1', arrival: 5, burst: 2 }
    ];
    expect(sjf(ps)).toEqual([
      { pid: 'P1', start: 5, end: 7 }
    ]);
  });

  test('empty input returns empty gantt', () => {
    expect(sjf([])).toEqual([]);
  });
});

describe('rr / mfq placeholders (full impl in Task 3)', () => {
  test('rr throws until implemented', () => {
    expect(() => rr([], 1)).toThrow(/not implemented/i);
  });

  test('mfq throws until implemented', () => {
    expect(() => mfq([])).toThrow(/not implemented/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/scheduling.test.js`
Expected: FAIL with "Cannot find module '../../utils/scheduling'"

- [ ] **Step 3: Implement `utils/scheduling.js` (FCFS + SJF + placeholders)**

```js
/**
 * CPU 调度算法（纯函数）
 *
 * 4 个算法输入 {pid, arrival, burst}[] 输出 GanttStep[]
 * 完全无副作用，便于测试。
 *
 * GanttStep = { pid, start, end }
 */

const DEFAULT_MFQ_QUEUES = [2, 4, 8];

/**
 * 比较函数：先 arrival，再 pid 字典序
 */
function _byArrivalThenPid(a, b) {
  if (a.arrival !== b.arrival) return a.arrival - b.arrival;
  return a.pid.localeCompare(b.pid);
}

/**
 * 找下一个未完成且已到达的进程最早到达时间
 */
function _nextArrivalTime(processes, completed) {
  let t = Infinity;
  for (const p of processes) {
    if (!completed.has(p.pid) && p.arrival < t) {
      t = p.arrival;
    }
  }
  return t;
}

/**
 * FCFS（First-Come First-Served）：按 arrival 排序，串行执行
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @returns {Array<{ pid: string, start: number, end: number }>}
 */
function fcfs(processes) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  const sorted = processes.slice().sort(_byArrivalThenPid);
  const gantt = [];
  let t = 0;
  for (const p of sorted) {
    if (t < p.arrival) t = p.arrival;
    gantt.push({ pid: p.pid, start: t, end: t + p.burst });
    t += p.burst;
  }
  return gantt;
}

/**
 * SJF（非抢占）：每次从 ready 队列里选 burst 最小的；同 arrival 时按 pid 字典序
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @returns {Array<{ pid: string, start: number, end: number }>}
 */
function sjf(processes) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  const completed = new Set();
  const gantt = [];
  let t = 0;

  while (completed.size < processes.length) {
    const ready = processes.filter(p =>
      !completed.has(p.pid) && p.arrival <= t
    );
    if (ready.length === 0) {
      t = _nextArrivalTime(processes, completed);
      continue;
    }
    ready.sort((a, b) => {
      if (a.burst !== b.burst) return a.burst - b.burst;
      return a.pid.localeCompare(b.pid);
    });
    const p = ready[0];
    gantt.push({ pid: p.pid, start: t, end: t + p.burst });
    t += p.burst;
    completed.add(p.pid);
  }
  return gantt;
}

/* ── 下列算法在 Task 3 中补全 ── */

function rr(processes, quantum) {
  throw new Error('rr: not implemented yet (see Task 3)');
}

function mfq(processes, queues) {
  throw new Error('mfq: not implemented yet (see Task 3)');
}

module.exports = {
  fcfs,
  sjf,
  rr,
  mfq,
  DEFAULT_MFQ_QUEUES
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/scheduling.test.js`
Expected: PASS (~13 tests, rr/mfq placeholder 测试通过因为它们抛错)

- [ ] **Step 5: Commit**

```bash
git add utils/scheduling.js tests/utils/scheduling.test.js
git commit -m "feat(scheduling): FCFS + SJF（占位导出 rr/mfq）"
```

---

## Task 3: RR + MFQ 调度算法

**Files:**
- Modify: `utils/scheduling.js`（替换 rr/mfq）
- Modify: `tests/utils/scheduling.test.js`（新增 rr/mfq 用例，删除占位测试）

**Interfaces:**
- Consumes: 已有的 `fcfs` / `sjf`（同一文件）
- Produces:
  - `rr(processes, quantum)`: `→ GanttStep[]`
  - `mfq(processes, queues?)`: `→ GanttStep[]`（默认 `[2, 4, 8]`）

- [ ] **Step 1: Append rr/mfq tests, remove placeholder tests**

Replace the bottom `describe('rr / mfq placeholders ...')` block in `tests/utils/scheduling.test.js` with:

```js
describe('rr (Round-Robin)', () => {
  test('quantum=2: each process gets 2-unit slices, last slice may be smaller', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 5 },
      { pid: 'P2', arrival: 1, burst: 3 },
      { pid: 'P3', arrival: 2, burst: 8 }
    ];
    expect(rr(ps, 2)).toEqual([
      { pid: 'P1', start: 0, end: 2 },
      { pid: 'P1', start: 2, end: 4 },
      { pid: 'P2', start: 4, end: 6 },
      { pid: 'P3', start: 6, end: 8 },
      { pid: 'P1', start: 8, end: 9 },
      { pid: 'P2', start: 9, end: 10 },
      { pid: 'P3', start: 10, end: 12 },
      { pid: 'P3', start: 12, end: 14 },
      { pid: 'P3', start: 14, end: 16 }
    ]);
  });

  test('single process: runs straight through', () => {
    const ps = [{ pid: 'P1', arrival: 0, burst: 5 }];
    expect(rr(ps, 2)).toEqual([
      { pid: 'P1', start: 0, end: 2 },
      { pid: 'P1', start: 2, end: 4 },
      { pid: 'P1', start: 4, end: 5 }
    ]);
  });

  test('quantum >= burst: single slice per process', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 3 },
      { pid: 'P2', arrival: 1, burst: 2 }
    ];
    // P1 starts at t=0; after slice (3 units), P2 (arr=1) is admitted.
    // queue becomes [P2] after P1 done. P2 runs to completion.
    expect(rr(ps, 10)).toEqual([
      { pid: 'P1', start: 0, end: 3 },
      { pid: 'P2', start: 3, end: 5 }
    ]);
  });

  test('idle gap when no process ready', () => {
    const ps = [
      { pid: 'P1', arrival: 5, burst: 2 }
    ];
    expect(rr(ps, 1)).toEqual([
      { pid: 'P1', start: 5, end: 6 },
      { pid: 'P1', start: 6, end: 7 }
    ]);
  });

  test('empty input returns empty gantt', () => {
    expect(rr([], 2)).toEqual([]);
  });
});

describe('mfq (Multi-Level Feedback Queue)', () => {
  test('default 3-level queues [2, 4, 8]: new process at q0, demote on quantum exhaustion', () => {
    // P1 burst=1 fits in one q0 slice, completes at q0.
    // P2 burst=2 fits in one q0 slice, completes at q0.
    // P3 burst=3 exhausts q0 quantum (2), demoted to q1, finishes in q1.
    const ps = [
      { pid: 'P1', arrival: 0, burst: 1 },
      { pid: 'P2', arrival: 0, burst: 2 },
      { pid: 'P3', arrival: 0, burst: 3 }
    ];
    expect(mfq(ps)).toEqual([
      { pid: 'P1', start: 0, end: 1 },
      { pid: 'P2', start: 1, end: 3 },
      { pid: 'P3', start: 3, end: 5 },
      { pid: 'P3', start: 5, end: 6 }
    ]);
  });

  test('higher-priority queue always runs first (q0 > q1 > q2)', () => {
    // P1 short job to keep q0 busy; P2 long job will be demoted; check interleaving.
    const ps = [
      { pid: 'P1', arrival: 0, burst: 1 },
      { pid: 'P2', arrival: 1, burst: 5 }
    ];
    // t=0: admit P1, q0=[P1]. Run P1 (slice=1, done). t=1.
    // t=1: admit P2, q0=[P2]. Run P2 quantum=2 (slice=2, remaining=3). demote to q1. t=3.
    // t=3: q0 empty, q1=[P2]. Run P2 quantum=4 (slice=3, done). t=6.
    expect(mfq(ps)).toEqual([
      { pid: 'P1', start: 0, end: 1 },
      { pid: 'P2', start: 1, end: 3 },
      { pid: 'P2', start: 3, end: 6 }
    ]);
  });

  test('idle gap: jump to next arrival', () => {
    const ps = [
      { pid: 'P1', arrival: 5, burst: 1 }
    ];
    expect(mfq(ps)).toEqual([
      { pid: 'P1', start: 5, end: 6 }
    ]);
  });

  test('custom queues [1, 1, 1] behave like RR(1)', () => {
    const ps = [
      { pid: 'P1', arrival: 0, burst: 2 },
      { pid: 'P2', arrival: 0, burst: 1 }
    ];
    // q0=[P1,P2]. Run P1 q1=1 (slice=1). q0=[P2]. demote P1 to q1.
    //   q0=[P2]. Run P2 q1=1 (slice=1). P2 done.
    //   q0 empty. q1=[P1]. Run P1 q1=1 (slice=1). P1 done.
    expect(mfq(ps, [1, 1, 1])).toEqual([
      { pid: 'P1', start: 0, end: 1 },
      { pid: 'P2', start: 1, end: 2 },
      { pid: 'P1', start: 2, end: 3 }
    ]);
  });

  test('empty input returns empty gantt', () => {
    expect(mfq([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify new tests fail**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/scheduling.test.js`
Expected: rr/mfq tests FAIL with "rr: not implemented yet" / "mfq: not implemented yet"

- [ ] **Step 3: Replace rr/mfq placeholders in `utils/scheduling.js`**

Replace the bottom block (`/* ── 下列算法在 Task 3 中补全 ── */` and `function rr` + `function mfq`) with the full implementations. The full final file (for reference, after both edits, looks like the following — write it whole):

```js
/**
 * CPU 调度算法（纯函数）
 *
 * 4 个算法输入 {pid, arrival, burst}[] 输出 GanttStep[]
 * 完全无副作用，便于测试。
 *
 * GanttStep = { pid, start, end }
 */

const DEFAULT_MFQ_QUEUES = [2, 4, 8];

/**
 * 比较函数：先 arrival，再 pid 字典序
 */
function _byArrivalThenPid(a, b) {
  if (a.arrival !== b.arrival) return a.arrival - b.arrival;
  return a.pid.localeCompare(b.pid);
}

/**
 * 找下一个未完成且已到达的进程最早到达时间
 */
function _nextArrivalTime(processes, completed) {
  let t = Infinity;
  for (const p of processes) {
    if (!completed.has(p.pid) && p.arrival < t) {
      t = p.arrival;
    }
  }
  return t;
}

/**
 * FCFS（First-Come First-Served）：按 arrival 排序，串行执行
 */
function fcfs(processes) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  const sorted = processes.slice().sort(_byArrivalThenPid);
  const gantt = [];
  let t = 0;
  for (const p of sorted) {
    if (t < p.arrival) t = p.arrival;
    gantt.push({ pid: p.pid, start: t, end: t + p.burst });
    t += p.burst;
  }
  return gantt;
}

/**
 * SJF（非抢占）：每次从 ready 队列里选 burst 最小的；同 burst 时按 pid 字典序
 */
function sjf(processes) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  const completed = new Set();
  const gantt = [];
  let t = 0;

  while (completed.size < processes.length) {
    const ready = processes.filter(p =>
      !completed.has(p.pid) && p.arrival <= t
    );
    if (ready.length === 0) {
      t = _nextArrivalTime(processes, completed);
      continue;
    }
    ready.sort((a, b) => {
      if (a.burst !== b.burst) return a.burst - b.burst;
      return a.pid.localeCompare(b.pid);
    });
    const p = ready[0];
    gantt.push({ pid: p.pid, start: t, end: t + p.burst });
    t += p.burst;
    completed.add(p.pid);
  }
  return gantt;
}

/**
 * 在 (arrivedIdx 之后, currentTime 之前或等于) 的进程中找出已到达但未在 readyQueue 里出现的，全部入队
 */
function _admitNew(queue, sorted, admitIdx, currentTime, inQueue) {
  while (admitIdx < sorted.length && sorted[admitIdx].arrival <= currentTime) {
    if (!inQueue.has(sorted[admitIdx].pid)) {
      queue.push(sorted[admitIdx].pid);
      inQueue.add(sorted[admitIdx].pid);
    }
    admitIdx++;
  }
  return admitIdx;
}

/**
 * Round-Robin：用 quantum 切片，到时间片放回 ready 队尾
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @param {number} quantum ≥ 1
 * @returns {Array<{ pid: string, start: number, end: number }>}
 */
function rr(processes, quantum) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  if (typeof quantum !== 'number' || quantum < 1 || !Number.isInteger(quantum)) {
    throw new Error('rr: quantum must be a positive integer');
  }
  const sorted = processes.slice().sort(_byArrivalThenPid);
  const remaining = new Map();
  for (const p of sorted) remaining.set(p.pid, p.burst);

  const queue = [];
  const inQueue = new Set();
  let admitIdx = 0;
  let t = 0;
  const gantt = [];
  let completed = 0;

  while (completed < sorted.length) {
    admitIdx = _admitNew(queue, sorted, admitIdx, t, inQueue);
    if (queue.length === 0) {
      t = sorted[admitIdx].arrival;
      continue;
    }
    const pid = queue.shift();
    inQueue.delete(pid);
    const remainingBurst = remaining.get(pid);
    const slice = Math.min(remainingBurst, quantum);
    gantt.push({ pid, start: t, end: t + slice });
    t += slice;
    remaining.set(pid, remainingBurst - slice);

    admitIdx = _admitNew(queue, sorted, admitIdx, t, inQueue);
    if (remaining.get(pid) === 0) {
      completed++;
    } else {
      queue.push(pid);
      inQueue.add(pid);
    }
  }
  return gantt;
}

/**
 * 多级反馈队列：默认 3 层 quantum = [2, 4, 8]
 * - 新进程入 q0
 * - 每层内部 RR（同一 quantum）
 * - 用完本层 quantum 且未完成 → 降级到下一层（最低层保持）
 * - 每刻度先选低层（高优先级）运行
 *
 * @param {Array<{ pid: string, arrival: number, burst: number }>} processes
 * @param {number[]} [queues] 各层 quantum；默认 [2, 4, 8]
 * @returns {Array<{ pid: string, start: number, end: number }>}
 */
function mfq(processes, queues) {
  if (!Array.isArray(processes) || processes.length === 0) return [];
  const q = Array.isArray(queues) && queues.length > 0 ? queues : DEFAULT_MFQ_QUEUES;
  for (const n of q) {
    if (typeof n !== 'number' || n < 1 || !Number.isInteger(n)) {
      throw new Error('mfq: each queue quantum must be a positive integer');
    }
  }
  const sorted = processes.slice().sort(_byArrivalThenPid);
  const remaining = new Map();
  for (const p of sorted) remaining.set(p.pid, p.burst);

  const queueLayers = q.map(() => []);
  let admitIdx = 0;
  let t = 0;
  const gantt = [];
  let completed = 0;

  const admit = () => {
    while (admitIdx < sorted.length && sorted[admitIdx].arrival <= t) {
      const pid = sorted[admitIdx].pid;
      // already in some layer? skip (should not happen post-execution)
      let inLayer = false;
      for (const layer of queueLayers) {
        if (layer.indexOf(pid) !== -1) { inLayer = true; break; }
      }
      if (!inLayer) queueLayers[0].push(pid);
      admitIdx++;
    }
  };

  while (completed < sorted.length) {
    admit();
    // find lowest nonempty queue
    let layerIdx = -1;
    for (let i = 0; i < queueLayers.length; i++) {
      if (queueLayers[i].length > 0) { layerIdx = i; break; }
    }
    if (layerIdx === -1) {
      t = sorted[admitIdx].arrival;
      continue;
    }
    const pid = queueLayers[layerIdx].shift();
    const remainingBurst = remaining.get(pid);
    const slice = Math.min(remainingBurst, q[layerIdx]);
    gantt.push({ pid, start: t, end: t + slice });
    t += slice;
    remaining.set(pid, remainingBurst - slice);

    admit();
    if (remaining.get(pid) === 0) {
      completed++;
    } else if (layerIdx < queueLayers.length - 1) {
      queueLayers[layerIdx + 1].push(pid);   // demote
    } else {
      queueLayers[layerIdx].push(pid);        // stay at bottom
    }
  }
  return gantt;
}

module.exports = {
  fcfs,
  sjf,
  rr,
  mfq,
  DEFAULT_MFQ_QUEUES
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/scheduling.test.js`
Expected: PASS (6 fcfs + 5 sjf + 5 rr + 5 mfq = 21 tests)

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add utils/scheduling.js tests/utils/scheduling.test.js
git commit -m "feat(scheduling): RR + MFQ 完整实现（含降级逻辑）"
```

---

## Task 4: 调度指标计算模块

**Files:**
- Create: `utils/scheduling-metrics.js`
- Test: `tests/utils/scheduling-metrics.test.js`

**Interfaces:**
- Consumes: `GanttStep[]` + `Process[]`（不依赖 scheduling.js，便于独立测试）
- Produces:
  - `calculate(gantt, processes)`: `→ { avgTAT, avgWT, cpuUtil, throughput }`

```js
{
  avgTAT: number,    // 平均周转时间 = Σ(completion - arrival) / n
  avgWT: number,     // 平均等待时间 = Σ(TAT - burst) / n
  cpuUtil: number,   // CPU 利用率 = Σburst / maxCompletion
  throughput: number // 吞吐量 = n / maxCompletion
}
```

- [ ] **Step 1: Write failing test**

`tests/utils/scheduling-metrics.test.js`:

```js
const { calculate } = require('../../utils/scheduling-metrics');

describe('calculate - empty / null', () => {
  test('empty gantt returns zeros', () => {
    expect(calculate([], [{ pid: 'P1', arrival: 0, burst: 5 }])).toEqual({
      avgTAT: 0, avgWT: 0, cpuUtil: 0, throughput: 0
    });
  });
  test('empty processes returns zeros', () => {
    expect(calculate([{ pid: 'P1', start: 0, end: 5 }], [])).toEqual({
      avgTAT: 0, avgWT: 0, cpuUtil: 0, throughput: 0
    });
  });
});

describe('calculate - FCFS single process', () => {
  test('P1 arr=0 burst=5 → avg TAT=5, avg WT=0, util=1, throughput=1/5', () => {
    const r = calculate(
      [{ pid: 'P1', start: 0, end: 5 }],
      [{ pid: 'P1', arrival: 0, burst: 5 }]
    );
    expect(r.avgTAT).toBe(5);
    expect(r.avgWT).toBe(0);
    expect(r.cpuUtil).toBe(1);
    expect(r.throughput).toBeCloseTo(0.2, 5);
  });
});

describe('calculate - FCFS 3-process example from spec', () => {
  // P1(0,5) P2(1,3) P3(2,8) → gantt: P1[0,5] P2[5,8] P3[8,16]
  // completions: P1=5, P2=8, P3=16
  // TAT: P1=5-0=5, P2=8-1=7, P3=16-2=14; avg=26/3 ≈ 8.667
  // WT : P1=5-5=0, P2=7-3=4, P3=14-8=6; avg=10/3 ≈ 3.333
  // Σburst=16, maxCompletion=16 → cpuUtil=1
  // throughput=3/16=0.1875
  test('computes all four metrics correctly', () => {
    const r = calculate(
      [
        { pid: 'P1', start: 0, end: 5 },
        { pid: 'P2', start: 5, end: 8 },
        { pid: 'P3', start: 8, end: 16 }
      ],
      [
        { pid: 'P1', arrival: 0, burst: 5 },
        { pid: 'P2', arrival: 1, burst: 3 },
        { pid: 'P3', arrival: 2, burst: 8 }
      ]
    );
    expect(r.avgTAT).toBeCloseTo(26 / 3, 5);
    expect(r.avgWT).toBeCloseTo(10 / 3, 5);
    expect(r.cpuUtil).toBe(1);
    expect(r.throughput).toBeCloseTo(3 / 16, 5);
  });
});

describe('calculate - RR with idle gap', () => {
  // P1 (arr=0, burst=2) runs, then idle until P2 (arr=5, burst=3)
  // gantt: P1[0,2], P2[5,8]. Σburst=5, maxCompletion=8 → cpuUtil=5/8=0.625
  // completions: P1=2, P2=8
  // TAT: P1=2-0=2, P2=8-5=3; avg=2.5
  // WT : P1=2-2=0, P2=3-3=0; avg=0
  test('accounts for idle gap in cpuUtil', () => {
    const r = calculate(
      [
        { pid: 'P1', start: 0, end: 2 },
        { pid: 'P2', start: 5, end: 8 }
      ],
      [
        { pid: 'P1', arrival: 0, burst: 2 },
        { pid: 'P2', arrival: 5, burst: 3 }
      ]
    );
    expect(r.avgTAT).toBeCloseTo(2.5, 5);
    expect(r.avgWT).toBe(0);
    expect(r.cpuUtil).toBeCloseTo(5 / 8, 5);
    expect(r.throughput).toBeCloseTo(2 / 8, 5);
  });
});

describe('calculate - RR / MFQ with multiple slices per pid', () => {
  // RR(2): P1 runs 0-2, 2-4, 8-9 (5 total). P2: 4-6, 9-10 (3 total).
  //        P3: 6-8, 10-12, 12-14, 14-16 (8 total).
  // completions: P1=9, P2=10, P3=16
  // TAT: P1=9-0=9, P2=10-1=9, P3=16-2=14; avg=32/3 ≈ 10.667
  // WT : P1=9-5=4, P2=9-3=6, P3=14-8=6; avg=16/3 ≈ 5.333
  // Σburst=16, maxCompletion=16 → cpuUtil=1
  test('uses LAST occurrence end as completion', () => {
    const r = calculate(
      [
        { pid: 'P1', start: 0, end: 2 },
        { pid: 'P1', start: 2, end: 4 },
        { pid: 'P2', start: 4, end: 6 },
        { pid: 'P3', start: 6, end: 8 },
        { pid: 'P1', start: 8, end: 9 },
        { pid: 'P2', start: 9, end: 10 },
        { pid: 'P3', start: 10, end: 12 },
        { pid: 'P3', start: 12, end: 14 },
        { pid: 'P3', start: 14, end: 16 }
      ],
      [
        { pid: 'P1', arrival: 0, burst: 5 },
        { pid: 'P2', arrival: 1, burst: 3 },
        { pid: 'P3', arrival: 2, burst: 8 }
      ]
    );
    expect(r.avgTAT).toBeCloseTo(32 / 3, 5);
    expect(r.avgWT).toBeCloseTo(16 / 3, 5);
    expect(r.cpuUtil).toBe(1);
    expect(r.throughput).toBeCloseTo(3 / 16, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/scheduling-metrics.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `utils/scheduling-metrics.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/utils/scheduling-metrics.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add utils/scheduling-metrics.js tests/utils/scheduling-metrics.test.js
git commit -m "feat(scheduling-metrics): 4 项调度指标计算（avgTAT/avgWT/cpuUtil/throughput）"
```

---

## Task 5: 页面 4 文件（json / wxml / wxss / js）

**Files:**
- Create: `pages/cpu-sched/cpu-sched.json`
- Create: `pages/cpu-sched/cpu-sched.wxml`
- Create: `pages/cpu-sched/cpu-sched.wxss`
- Create: `pages/cpu-sched/cpu-sched.js`

**Interfaces:**
- Consumes:
  - `fcfs` / `sjf` / `rr` / `mfq` from `utils/scheduling.js`
  - `calculate` from `utils/scheduling-metrics.js`
  - `validateProcess`, `randomProcesses`, `pidColor`, `MAX_PROCESSES` from `utils/process.js`
- Produces: 完整的 `pages/cpu-sched/` 页面（4 文件）

- [ ] **Step 1: Write `pages/cpu-sched/cpu-sched.json`**

```json
{
  "navigationBarTitleText": "进程调度可视化",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black"
}
```

- [ ] **Step 2: Write `pages/cpu-sched/cpu-sched.wxml`**

```xml
<view class="page">

  <!-- 算法切换 -->
  <view class="algo-band">
    <text class="band-label">进程调度可视化</text>
    <view class="algo-tabs">
      <view class="algo-tab {{algorithm === 'FCFS' ? 'algo-active' : ''}}" bindtap="onAlgorithmChange" data-algo="FCFS">FCFS</view>
      <view class="algo-tab {{algorithm === 'SJF' ? 'algo-active' : ''}}" bindtap="onAlgorithmChange" data-algo="SJF">SJF</view>
      <view class="algo-tab {{algorithm === 'RR' ? 'algo-active' : ''}}" bindtap="onAlgorithmChange" data-algo="RR">RR</view>
      <view class="algo-tab {{algorithm === 'MFQ' ? 'algo-active' : ''}}" bindtap="onAlgorithmChange" data-algo="MFQ">MFQ</view>
    </view>
    <view class="algo-options" wx:if="{{algorithm === 'RR'}}">
      <text class="option-label">RR 量子</text>
      <slider class="option-slider" min="1" max="4" step="1" value="{{quantum}}" activeColor="#cc785c" backgroundColor="#e6dfd8" bindchange="onQuantumChange" />
      <text class="option-value">{{quantum}}</text>
    </view>
    <view class="algo-options" wx:elif="{{algorithm === 'MFQ'}}">
      <text class="option-label">MFQ 量子 (固定)</text>
      <text class="option-static">q0=2 / q1=4 / q2=8</text>
    </view>
    <text wx:if="{{errorMessage}}" class="error-text">{{errorMessage}}</text>
  </view>

  <!-- 进程列表 -->
  <view class="proc-band">
    <view class="proc-header">
      <text class="proc-title">进程列表</text>
      <view class="proc-actions">
        <view class="icon-btn" bindtap="onAddProcess"><text class="icon-btn-text">+</text></view>
        <view class="icon-btn" bindtap="onRandomGenerate"><text class="icon-btn-text">🎲</text></view>
      </view>
    </view>
    <view class="proc-table">
      <view class="proc-row proc-row-head">
        <text class="proc-cell proc-pid">pid</text>
        <text class="proc-cell proc-arr">arrival</text>
        <text class="proc-cell proc-bur">burst</text>
        <text class="proc-cell proc-del">×</text>
      </view>
      <view wx:for="{{processes}}" wx:key="pid" class="proc-row {{item.invalid ? 'proc-row-invalid' : ''}}">
        <input class="proc-cell-input proc-pid" value="{{item.pid}}" data-index="{{index}}" data-field="pid" bindinput="onProcessInput" />
        <input class="proc-cell-input proc-arr" type="number" value="{{item.arrival}}" data-index="{{index}}" data-field="arrival" bindinput="onProcessInput" />
        <input class="proc-cell-input proc-bur" type="number" value="{{item.burst}}" data-index="{{index}}" data-field="burst" bindinput="onProcessInput" />
        <view class="proc-del-btn" bindtap="onDeleteProcess" data-index="{{index}}"><text>×</text></view>
      </view>
    </view>
    <text class="proc-hint">最多 {{maxProcesses}} 个进程。点击单元格编辑。</text>
  </view>

  <!-- 甘特图 -->
  <view class="gantt-band">
    <view class="gantt-ticks">
      <text wx:for="{{ticks}}" wx:key="t" class="gantt-tick-text" style="left: {{item.leftPx}}px;">{{item.t}}</text>
    </view>
    <view wx:for="{{ganttRows}}" wx:key="pid" class="gantt-row">
      <view class="gantt-pid-tag" style="background: {{item.color}};">
        <text class="gantt-pid-text">{{item.pid}}</text>
      </view>
      <view class="gantt-track">
        <view wx:for="{{item.segments}}" wx:key="start" wx:for-item="seg"
              class="gantt-bar"
              style="left: {{seg.leftPx}}px; width: {{seg.widthPx}}px; background: {{item.color}};"
              data-start="{{seg.start}}"
              data-end="{{seg.end}}">
          <text wx:if="{{seg.widthPx >= 40}}" class="gantt-bar-label">{{item.pid}}</text>
        </view>
      </view>
    </view>
    <view wx:if="{{gantt.length === 0}}" class="gantt-empty">
      <text class="gantt-empty-text">选择算法后点击 ▶ 开始</text>
    </view>
  </view>

  <!-- 性能指标 -->
  <view class="metric-band" wx:if="{{metrics.avgTAT !== undefined}}">
    <view class="metric-card">
      <text class="metric-label">平均周转时间</text>
      <view class="metric-value-row">
        <text class="metric-value">{{metrics.avgTAT.toFixed(2)}}</text>
        <text class="metric-unit">{{fcfsComparison.tatArrow}} {{fcfsComparison.tatText}}</text>
      </view>
    </view>
    <view class="metric-card">
      <text class="metric-label">平均等待时间</text>
      <view class="metric-value-row">
        <text class="metric-value">{{metrics.avgWT.toFixed(2)}}</text>
        <text class="metric-unit">{{fcfsComparison.wtArrow}} {{fcfsComparison.wtText}}</text>
      </view>
    </view>
    <view class="metric-card">
      <text class="metric-label">CPU 利用率</text>
      <view class="metric-value-row">
        <text class="metric-value">{{(metrics.cpuUtil * 100).toFixed(1)}}</text>
        <text class="metric-unit">% {{fcfsComparison.utilArrow}} {{fcfsComparison.utilText}}</text>
      </view>
    </view>
    <view class="metric-card">
      <text class="metric-label">吞吐量</text>
      <view class="metric-value-row">
        <text class="metric-value">{{metrics.throughput.toFixed(3)}}</text>
        <text class="metric-unit">/s {{fcfsComparison.tpArrow}} {{fcfsComparison.tpText}}</text>
      </view>
    </view>
  </view>

  <!-- 控制栏 -->
  <view class="ctrl-band">
    <view class="ctrl-btn ctrl-reset" bindtap="onReset">
      <text class="ctrl-icon">↻</text>
    </view>
    <view class="ctrl-btn ctrl-play" bindtap="onTogglePlay">
      <text class="ctrl-icon">{{playing ? '⏸' : '▶'}}</text>
    </view>
    <view class="ctrl-btn" bindtap="onStepNext">
      <text class="ctrl-icon">▶</text>
    </view>
    <view class="speed-area">
      <text class="speed-label">速度</text>
      <view class="speed-buttons">
        <view class="speed-btn {{speedIndex === 0 ? 'speed-active' : ''}}" bindtap="onSpeedChange" data-index="0">0.5x</view>
        <view class="speed-btn {{speedIndex === 1 ? 'speed-active' : ''}}" bindtap="onSpeedChange" data-index="1">1x</view>
        <view class="speed-btn {{speedIndex === 2 ? 'speed-active' : ''}}" bindtap="onSpeedChange" data-index="2">2x</view>
      </view>
    </view>
  </view>

</view>
```

- [ ] **Step 3: Write `pages/cpu-sched/cpu-sched.wxss`**

```css
/* ======================== 页面基础 ======================== */
.page {
  min-height: 100vh;
  background: #faf9f5;
  padding: 20rpx 24rpx 40rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Georgia', serif;
  color: #141413;
}

.band-label {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 32rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  color: #141413;
  margin-bottom: 16rpx;
}

.error-text {
  display: block;
  margin-top: 12rpx;
  color: #c0392b;
  font-size: 24rpx;
}

/* ======================== 算法选择 ======================== */
.algo-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
}

.algo-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.algo-tab {
  display: inline-block;
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: #faf9f5;
  color: #6c6a64;
  font-size: 26rpx;
  font-weight: 600;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.algo-active {
  background: #cc785c;
  color: #fff;
}

.algo-options {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 16rpx;
  background: #faf9f5;
  border-radius: 16rpx;
}

.option-label {
  font-size: 24rpx;
  color: #6c6a64;
  flex-shrink: 0;
}

.option-slider {
  flex: 1;
  margin: 0;
}

.option-value,
.option-static {
  font-size: 24rpx;
  font-family: 'SF Mono', 'Menlo', monospace;
  color: #141413;
  flex-shrink: 0;
}

/* ======================== 进程列表 ======================== */
.proc-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.proc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.proc-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #141413;
  font-family: Georgia, serif;
}

.proc-actions {
  display: flex;
  gap: 12rpx;
}

.icon-btn {
  width: 56rpx;
  height: 56rpx;
  background: #faf9f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:active { background: #e8e0d2; }
.icon-btn-text {
  font-size: 28rpx;
  color: #141413;
}

.proc-table {
  background: #faf9f5;
  border-radius: 16rpx;
  padding: 12rpx 16rpx;
}

.proc-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 0;
  border-bottom: 2rpx solid #e6dfd8;
}

.proc-row:last-child { border-bottom: none; }
.proc-row-head {
  border-bottom: 2rpx solid #d4cfc2;
}

.proc-row-invalid {
  background: #f5d9d3;
  border-radius: 8rpx;
}

.proc-cell {
  font-size: 22rpx;
  color: #6c6a64;
  text-align: center;
}

.proc-pid   { width: 30%; }
.proc-arr   { width: 30%; }
.proc-bur   { width: 30%; }
.proc-del   { width: 10%; }

.proc-cell-input {
  background: #faf9f5;
  border: 2rpx solid #e6dfd8;
  border-radius: 8rpx;
  padding: 8rpx 12rpx;
  font-size: 24rpx;
  color: #141413;
  text-align: center;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.proc-del-btn {
  flex: 0 0 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #faf9f5;
  color: #c0392b;
  font-size: 28rpx;
}

.proc-del-btn:active { background: #e8e0d2; }

.proc-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #8e8b82;
}

/* ======================== 甘特图 ======================== */
.gantt-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.gantt-ticks {
  position: relative;
  height: 40rpx;
  margin-left: 130rpx;
  margin-bottom: 12rpx;
}

.gantt-tick-text {
  position: absolute;
  font-size: 20rpx;
  color: #8e8b82;
  font-family: 'SF Mono', 'Menlo', monospace;
  transform: translateX(-50%);
}

.gantt-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.gantt-pid-tag {
  width: 110rpx;
  flex-shrink: 0;
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  text-align: center;
}

.gantt-pid-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.gantt-track {
  flex: 1;
  position: relative;
  height: 48rpx;
  background: #faf9f5;
  border-radius: 8rpx;
}

.gantt-bar {
  position: absolute;
  top: 4rpx;
  height: 40rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: left 0.3s ease, width 0.3s ease, opacity 0.3s ease;
}

.gantt-bar-label {
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.gantt-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200rpx;
}

.gantt-empty-text {
  font-size: 26rpx;
  color: #8e8b82;
}

/* ======================== 指标卡片 ======================== */
.metric-band {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.metric-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
}

.metric-label {
  display: block;
  font-size: 22rpx;
  color: #6c6a64;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.metric-value {
  font-size: 40rpx;
  font-weight: 700;
  font-family: Georgia, serif;
  color: #141413;
  letter-spacing: -2rpx;
}

.metric-unit {
  font-size: 22rpx;
  color: #8e8b82;
  font-family: 'SF Mono', 'Menlo', monospace;
}

/* ======================== 控制栏 ======================== */
.ctrl-band {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #efe9de;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 40rpx;
}

.ctrl-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #faf9f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctrl-btn:active { background: #e8e0d2; }

.ctrl-play {
  background: #cc785c;
  width: 88rpx;
  height: 88rpx;
}

.ctrl-play:active { background: #a9583e; }

.ctrl-play .ctrl-icon { color: #fff; font-size: 32rpx; }

.ctrl-icon {
  font-size: 28rpx;
  color: #141413;
}

.ctrl-reset {
  background: #faf9f5;
}

.speed-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-left: 8rpx;
}

.speed-label {
  font-size: 22rpx;
  color: #6c6a64;
  flex-shrink: 0;
}

.speed-buttons {
  display: flex;
  gap: 6rpx;
  flex: 1;
}

.speed-btn {
  flex: 1;
  padding: 12rpx 16rpx;
  background: #faf9f5;
  border-radius: 12rpx;
  text-align: center;
  font-size: 22rpx;
  color: #6c6a64;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.speed-active {
  background: #cc785c;
  color: #fff;
}
```

- [ ] **Step 4: Write `pages/cpu-sched/cpu-sched.js`**

```js
const { fcfs, sjf, rr, mfq } = require('../../utils/scheduling');
const { calculate } = require('../../utils/scheduling-metrics');
const { validateProcess, randomProcesses, pidColor, MAX_PROCESSES } = require('../../utils/process');

const ALGORITHMS = ['FCFS', 'SJF', 'RR', 'MFQ'];
const SPEED_OPTIONS = [
  { label: '0.5x', delayMs: 800 },
  { label: '1x',   delayMs: 400 },
  { label: '2x',   delayMs: 200 }
];
const GANTT_PX_PER_UNIT = 28;

Page({
  data: {
    algorithm: 'FCFS',
    quantum: 2,
    processes: [],
    errorMessage: '',
    gantt: [],
    ganttRows: [],
    ticks: [],
    metrics: {},
    fcfsComparison: {},
    playing: false,
    speedIndex: 1,
    maxProcesses: MAX_PROCESSES,
    simTime: 0
  },

  _animTimer: null,

  onLoad() {
    this._seedProcesses();
  },

  onUnload() {
    this._stopAnim();
  },

  _seedProcesses() {
    const ps = randomProcesses(3);
    this.setData({ processes: ps.map(p => ({ ...p, invalid: false })) });
  },

  onAddProcess() {
    const ps = this.data.processes.slice();
    if (ps.length >= MAX_PROCESSES) {
      this.setData({ errorMessage: `进程数已达上限 ${MAX_PROCESSES}` });
      return;
    }
    const nextPid = 'P' + (ps.length + 1);
    ps.push({ pid: nextPid, arrival: 0, burst: 1, invalid: false });
    this.setData({ processes: ps, errorMessage: '' });
  },

  onDeleteProcess(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const ps = this.data.processes.slice();
    ps.splice(idx, 1);
    this.setData({ processes: ps });
  },

  onRandomGenerate() {
    const n = Math.max(3, Math.min(MAX_PROCESSES, 5));
    const ps = randomProcesses(n);
    this.setData({ processes: ps.map(p => ({ ...p, invalid: false })), errorMessage: '' });
  },

  onProcessInput(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const ps = this.data.processes.slice();
    const updated = Object.assign({}, ps[idx]);
    if (field === 'pid') {
      updated.pid = value;
    } else {
      updated[field] = Number(value);
    }
    const otherPs = ps.filter((_, i) => i !== idx);
    const v = validateProcess(updated, otherPs);
    updated.invalid = !v.valid;
    ps[idx] = updated;
    this.setData({ processes: ps, errorMessage: v.valid ? '' : v.errors[0] });
  },

  onAlgorithmChange(e) {
    const algo = e.currentTarget.dataset.algo;
    if (algo === this.data.algorithm) return;
    this._stopAnim();
    this.setData({
      algorithm: algo,
      gantt: [],
      ganttRows: [],
      ticks: [],
      metrics: {},
      fcfsComparison: {},
      simTime: 0
    });
  },

  onQuantumChange(e) {
    this.setData({ quantum: Number(e.detail.value) });
  },

  onSpeedChange(e) {
    this.setData({ speedIndex: Number(e.currentTarget.dataset.index) });
  },

  onTogglePlay() {
    if (this.data.playing) {
      this._stopAnim();
    } else {
      this._startAnim();
    }
  },

  onStepNext() {
    if (!this.data.gantt.length) return;
    this._stopAnim();
    const maxT = this._maxEnd(this.data.gantt);
    const nextT = Math.min(maxT, this.data.simTime + 1);
    this.setData({ simTime: nextT });
    this._renderGanttUpTo(nextT);
  },

  onReset() {
    this._stopAnim();
    this.setData({
      gantt: [],
      ganttRows: [],
      ticks: [],
      metrics: {},
      fcfsComparison: {},
      simTime: 0,
      errorMessage: ''
    });
  },

  _startAnim() {
    if (this._animTimer) return;
    const validPs = this.data.processes.filter(p => !p.invalid);
    if (validPs.length === 0) {
      this.setData({ errorMessage: '请添加有效进程' });
      return;
    }
    let gantt = [];
    try {
      gantt = this._runAlgorithm(validPs);
    } catch (err) {
      this.setData({ errorMessage: '算法运行失败：' + (err && err.message ? err.message : String(err)) });
      return;
    }
    if (!gantt.length) return;

    const metrics = calculate(gantt, validPs);
    const fcfsGantt = fcfs(validPs);
    const fcfsMetrics = calculate(fcfsGantt, validPs);
    const fcfsComparison = this._compareWithFcfs(metrics, fcfsMetrics);

    this.setData({
      gantt,
      metrics,
      fcfsComparison,
      simTime: 0,
      playing: true
    });

    this._renderGanttUpTo(0);
    this._tickAnim();
  },

  _tickAnim() {
    if (!this.data.playing) return;
    const delay = SPEED_OPTIONS[this.data.speedIndex].delayMs;
    this._animTimer = setTimeout(() => {
      const maxT = this._maxEnd(this.data.gantt);
      const nextT = this.data.simTime + 1;
      if (nextT > maxT) {
        this._stopAnim();
        return;
      }
      this.setData({ simTime: nextT });
      this._renderGanttUpTo(nextT);
      this._tickAnim();
    }, delay);
  },

  _stopAnim() {
    if (this._animTimer) {
      clearTimeout(this._animTimer);
      this._animTimer = null;
    }
    if (this.data.playing) this.setData({ playing: false });
  },

  _runAlgorithm(processes) {
    switch (this.data.algorithm) {
      case 'FCFS': return fcfs(processes);
      case 'SJF':  return sjf(processes);
      case 'RR':   return rr(processes, this.data.quantum);
      case 'MFQ':  return mfq(processes);
      default:     return fcfs(processes);
    }
  },

  _maxEnd(gantt) {
    let m = 0;
    for (const s of gantt) if (s.end > m) m = s.end;
    return m;
  },

  _renderGanttUpTo(upToTime) {
    const { gantt, processes } = this.data;
    if (!gantt.length) return;
    const pidSet = new Set(processes.filter(p => !p.invalid).map(p => p.pid));
    const ganttRows = [];
    for (const pid of pidSet) {
      const segments = [];
      for (const step of gantt) {
        if (step.pid !== pid) continue;
        const segEnd = Math.min(step.end, upToTime);
        if (segEnd <= step.start) continue;
        segments.push({
          start: step.start,
          end: step.end,
          visibleEnd: segEnd,
          leftPx: step.start * GANTT_PX_PER_UNIT,
          widthPx: (step.end - step.start) * GANTT_PX_PER_UNIT
        });
      }
      ganttRows.push({
        pid,
        color: pidColor(pid),
        segments
      });
    }

    const maxT = this._maxEnd(gantt);
    const ticks = [];
    for (let t = 0; t <= maxT; t++) {
      ticks.push({ t, leftPx: t * GANTT_PX_PER_UNIT });
    }

    this.setData({ ganttRows, ticks });
  },

  _compareWithFcfs(metrics, fcfsMetrics) {
    const arrow = (delta, eps = 1e-6) => {
      if (Math.abs(delta) < eps) return '↑';   // equal (still shown as up but yellow)
      return delta > 0 ? '↑' : '↓';
    };
    const color = (a, b, lowerBetter) => {
      if (Math.abs(a - b) < 1e-6) return '#f59e0b';
      const better = lowerBetter ? a < b : a > b;
      return better ? '#34d399' : '#c0392b';
    };

    const tatDelta = metrics.avgTAT - fcfsMetrics.avgTAT;
    const wtDelta  = metrics.avgWT  - fcfsMetrics.avgWT;
    const utilDelta = metrics.cpuUtil - fcfsMetrics.cpuUtil;
    const tpDelta  = metrics.throughput - fcfsMetrics.throughput;

    return {
      tatArrow:  arrow(tatDelta) + '',
      tatText:   (tatDelta > 0 ? '+' : '') + tatDelta.toFixed(2),
      wtArrow:   arrow(wtDelta) + '',
      wtText:    (wtDelta > 0 ? '+' : '') + wtDelta.toFixed(2),
      utilArrow: arrow(utilDelta) + '',
      utilText:  (utilDelta > 0 ? '+' : '') + (utilDelta * 100).toFixed(1) + '%',
      tpArrow:   arrow(tpDelta) + '',
      tpText:    (tpDelta > 0 ? '+' : '') + tpDelta.toFixed(3)
    };
  }
});
```

- [ ] **Step 5: Verify utils tests still pass**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS（页面没新增 js 测试，但现有 utils 测试仍应全绿）

- [ ] **Step 6: Commit**

```bash
git add pages/cpu-sched/
git commit -m "feat(cpu-sched): 页面 4 文件（json/wxml/wxss/js），含甘特图 + 指标对比 + 动画控制"
```

---

## Task 6: 注册 + tool-registry + 模块文档

**Files:**
- Modify: `app.json`（添加 `pages/cpu-sched/cpu-sched`）
- Modify: `utils/tool-registry.js`（`cpu-sched.available = true`）
- Create: `docs/handoff/modules/cpu-sched.md`

**Interfaces:**
- Consumes: `cpu-sched` 工具的现有元数据（已在 tool-registry.js 占位）
- Produces: 工具在首页可见，模块文档就位

- [ ] **Step 1: Modify `app.json`**

在 `pages` 数组中按字母序插入 `"pages/cpu-sched/cpu-sched"`（位置：`dashboard` 之后，`subnet-calc` 之前）。完成后 `pages` 数组应为：

```json
[
  "pages/index/index",
  "pages/quiz-list/quiz-list",
  "pages/import-preview/import-preview",
  "pages/quiz/quiz",
  "pages/result/result",
  "pages/records/records",
  "pages/record-detail/record-detail",
  "pages/wrong-questions/wrong-questions",
  "pages/dashboard/dashboard",
  "pages/cpu-sched/cpu-sched",
  "pages/subnet-calc/subnet-calc",
  "pages/sort-viz/sort-viz",
  "pages/tcp-viz/tcp-viz",
  "pages/ds-viz/ds-viz"
]
```

- [ ] **Step 2: Modify `utils/tool-registry.js`**

把 `cpu-sched` 工具对象中的 `available: false` 改为 `available: true`；其余字段（id / category / name / icon / description / route / order）保持不变。

- [ ] **Step 3: Write `docs/handoff/modules/cpu-sched.md`**

```md
# 进程调度可视化（CPU Scheduling Visualization）

> 由 `2026-07-12-cpu-scheduling-design.md` spec 实施落盘。

## 概览

交互式展示 4 种 CPU 进程调度算法（FCFS / SJF / RR / MFQ），支持进程编辑、甘特图渲染、性能指标计算（含 vs FCFS 对比）和动画回放。

## 数据驱动

| 模块 | 内容 |
|---|---|
| `utils/process.js` | 进程校验（pid 唯一 / arrival≥0 / burst>0）、随机生成（5 个进程）、10 色调色板 |
| `utils/scheduling.js` | 4 个调度算法纯函数：`fcfs` / `sjf`（非抢占）/ `rr`（量子可配）/ `mfq`（默认 `[2,4,8]` 三层） |
| `utils/scheduling-metrics.js` | 4 项指标：`avgTAT` / `avgWT` / `cpuUtil` / `throughput` |

## 4 个算法要点

| 算法 | 行为 |
|---|---|
| FCFS | 按 arrival 排序串行执行，同 arrival 按 pid 字典序 |
| SJF | 每次从 ready 选 burst 最短，非抢占；同 burst 按 pid 字典序 |
| RR  | 单层 RR，quantum 滑块 1~4；到时放回队尾 |
| MFQ | 3 层量子固定 `[2,4,8]`；新进程入 q0；用完本层量子降级，最低层保持 |

## 性能指标

| 指标 | 公式 |
|---|---|
| avg TAT | `Σ(completion - arrival) / n` |
| avg WT  | `Σ(TAT - burst) / n` |
| CPU 利用率 | `Σburst / maxCompletion` |
| 吞吐量 | `n / maxCompletion` |

页面右下面板始终额外计算 FCFS 指标并显示对比箭头（绿 = 更好；红 = 更差；黄 = 相同；语义按指标"低好/高好"区分）。

## 甘特图渲染

横向时间轴，每单位 `28px`。每个进程一行绝对定位 `<view>` 色条（按 pid 哈希取色）。色条宽度等于 `(end - start) × 28px`，`transition: left 0.3s, width 0.3s` 实现渐进填充。

## 测试

- `tests/utils/process.test.js` —— 校验 / 随机生成 / 调色板（16 测试）
- `tests/utils/scheduling.test.js` —— 4 个算法 gantt 快照（21 测试）
- `tests/utils/scheduling-metrics.test.js` —— 4 个指标（6 测试）

`npm test` 全绿。

## 设计风格

完全 Claude Design 暖奶油画布（参见 `docs/DESIGN.md`）。算法色条按 10 色调色板循环（珊瑚 / 赭石 / 鼠尾草 / 钢蓝等暖中性色）。
```

- [ ] **Step 4: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS（utils / tcp-states / subnet / dns 全部测试 + cpu-sched 3 个测试文件）

- [ ] **Step 5: Commit**

```bash
git add app.json utils/tool-registry.js docs/handoff/modules/cpu-sched.md
git commit -m "feat(cpu-sched): 注册页面 + tool-registry 可用化 + 模块文档"
```

---

## Task 7: 验证完成 + PROJECT_HANDOFF 同步

**Files:**
- Modify: `PROJECT_HANDOFF.md`
- Modify: `docs/handoff/future-plans.md`

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: ALL PASS

- [ ] **Step 2: Verify util modules behave correctly via Jest**

Run:

```bash
cd /Users/charliepan/Downloads/my-miniapp && \
  npx jest tests/utils/process.test.js && \
  npx jest tests/utils/scheduling.test.js && \
  npx jest tests/utils/scheduling-metrics.test.js
```

Expected: All three test files pass.

- [ ] **Step 3: Append to `PROJECT_HANDOFF.md`**

在 `## 8. 最近重大变更`（如不存在则在文件末尾追加 `## 8. 最近重大变更` 段）顶部插入：

```md
### 2026-07-12 · CPU 进程调度可视化上线

**变更内容**

- 新增 `pages/cpu-sched/` 页面（4 文件：json/wxml/wxss/js）
- 新增 3 个 utils 纯函数模块：`process.js` / `scheduling.js`（4 算法）/ `scheduling-metrics.js`
- 新增 3 个测试文件（共 43 个测试：process 16 + scheduling 21 + metrics 6）
- `utils/tool-registry.js` 把 `cpu-sched.available` 改为 `true`
- `app.json` 注册新页面
- 新增 `docs/handoff/modules/cpu-sched.md` 模块文档

**理由**

- 承接 `tool-registry.js` 中 OS 模块的第一个占位
- 4 种调度算法 + 甘特图 + 4 指标 vs FCFS 对比，覆盖冯·诺依曼/OS 教学核心
- 纯函数 + Jest 全测，与 TCP-viz / DNS-viz 一致风格

**影响**

- spec: `docs/superpowers/specs/2026-07-12-cpu-scheduling-design.md`
- plan: `docs/plans/2026-07-12-cpu-scheduling.md`
- `npm test` 全绿
```

- [ ] **Step 4: Append to `docs/handoff/future-plans.md`**

在文件末尾追加：

```md
## P8 · OS 模块 backlog（cpu-sched 上线后）

CPU 进程调度可视化已上线（2026-07-12）。其余 OS 占位（`tool-registry.js` 中 `available: false`）待后续 plan：

- 内存分页可视化（页表 + 缺页中断 + LRU/FIFO 替换算法）
- 死锁模拟器（资源分配图 + 银行家算法）
- 磁盘调度可视化（FCFS / SSTF / SCAN / C-SCAN）
- 同步互斥演示（生产者/消费者 + 信号量 + PV 操作）
```

- [ ] **Step 5: Commit**

```bash
git add PROJECT_HANDOFF.md docs/handoff/future-plans.md
git commit -m "docs(handoff): CPU 进程调度可视化上线记录 + OS 模块 backlog"
```

---

## 验收清单（实施完成后）

- [ ] `npm test` 全绿
- [ ] `tests/utils/process.test.js` / `scheduling.test.js` / `scheduling-metrics.test.js` 全部独立运行通过
- [ ] 微信开发者工具中，`pages/cpu-sched/` 加载无报错
- [ ] 默认 3 进程 + FCFS → gantt 显示三段连续色条，avgTAT ≈ 8.67
- [ ] 切换到 SJF → 同输入下 gantt 与 FCFS 不同时开始更短的进程更早
- [ ] 切换到 RR(quantum=2) → 每个进程被切片，首尾可能不是 2
- [ ] 切换到 MFQ → 长进程先在 q0 跑 2 单位，再降级到 q1
- [ ] 修改 RR 量子滑块 → 重置并重播后 gantt 切片粒度改变
- [ ] 点击 🎲 → 生成 5 个随机进程，pid 颜色变化
- [ ] 输入非法（如 burst=0）→ 行变红，▶ 报错
- [ ] 首页「操作系统」分类 → 进程调度可视化卡片可点击
- [ ] PROJECT_HANDOFF.md / future-plans.md 已更新
