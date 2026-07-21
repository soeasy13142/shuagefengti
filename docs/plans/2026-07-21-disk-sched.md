# 磁盘调度可视化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现磁盘调度可视化工具（disk-sched），支持 SCAN / C-SCAN / LOOK / C-LOOK 四种算法，磁头移动动画，性能指标对比。

**Architecture:** 纯函数层（`utils/disk-scheduling.js`）封装 4 种调度算法，4 文件页面（`package-tools/disk-sched/`）处理交互与动画渲染。与现有 cpu-sched、deadlock 同属操作系统分类，复用同一设计语言。

**Tech Stack:** 微信小程序原生（WXML+WXSS+JS）| Jest 测试 | Claude Design 暖奶油画布

**Spec:** `docs/superpowers/specs/2026-07-19-disk-sched-design.md`

## Global Constraints

- Claude Design 暖奶油画布：背景 `#faf9f5`，卡片 `#efe9de` 圆角 24rpx，CTA `#cc785c`（active `#a9583e`），标题 Georgia 衬线 400 weight
- 纯函数优先：`disk-scheduling.js` 全部无副作用
- 柱面范围 0~199
- 请求上限 15 个柱面
- 磁道轴使用横向 `<scroll-view>` + 绝对定位标记点
- 动画使用 WXSS `transition: left 300ms ease`
- 更新 tool-registry 时 route 格式为 `/package-tools/disk-sched/disk-sched`

---
### Task 1: 工具函数 — 四种磁盘调度算法

**Files:**
- Create: `utils/disk-scheduling.js`
- Create: `tests/utils/disk-scheduling.test.js`

**Interfaces:**
- Produces:
  - `scan(requests, start, direction)` → `{ path: number[], totalSeek: number, steps: SeekStep[] }`
  - `cScan(requests, start, direction)` → `{ path: number[], totalSeek: number, steps: SeekStep[] }`
  - `look(requests, start, direction)` → `{ path: number[], totalSeek: number, steps: SeekStep[] }`
  - `cLook(requests, start, direction)` → `{ path: number[], totalSeek: number, steps: SeekStep[] }`
  - `compareAlgorithms(requests, start, algorithms)` → `{ algorithmName: { totalSeek, path } }`
  - `SeekStep` type: `{ from: number, to: number, seek: number }`

- [ ] **Step 1: Write failing tests for SCAN algorithm**

```js
// tests/utils/disk-scheduling.test.js
const { scan, cScan, look, cLook, compareAlgorithms } = require('../../utils/disk-scheduling');

describe('scan', () => {
  test('SCAN(up) from 50 with requests [98,37,183,14,122]', () => {
    const result = scan([98, 37, 183, 14, 122], 50, 'up');
    // path: 50→98→122→183→(到199)→37→14
    expect(result.path).toEqual([50, 98, 122, 183, 199, 37, 14]);
    expect(result.steps).toEqual([
      { from: 50, to: 98, seek: 48 },
      { from: 98, to: 122, seek: 24 },
      { from: 122, to: 183, seek: 61 },
      { from: 183, to: 199, seek: 16 },
      { from: 199, to: 37, seek: 162 },
      { from: 37, to: 14, seek: 23 }
    ]);
    expect(result.totalSeek).toBe(48 + 24 + 61 + 16 + 162 + 23);
  });

  test('SCAN(down) from 50 with same requests', () => {
    const result = scan([98, 37, 183, 14, 122], 50, 'down');
    // path: 50→37→14→(到0)→98→122→183
    expect(result.path).toEqual([50, 37, 14, 0, 98, 122, 183]);
    expect(result.steps).toEqual([
      { from: 50, to: 37, seek: 13 },
      { from: 37, to: 14, seek: 23 },
      { from: 14, to: 0, seek: 14 },
      { from: 0, to: 98, seek: 98 },
      { from: 98, to: 122, seek: 24 },
      { from: 122, to: 183, seek: 61 }
    ]);
    expect(result.totalSeek).toBe(13 + 23 + 14 + 98 + 24 + 61);
  });

  test('SCAN(up) with single request', () => {
    const result = scan([75], 50, 'up');
    expect(result.path).toEqual([50, 75, 199]);
    expect(result.totalSeek).toBe(25 + 124);
  });

  test('SCAN empty requests returns path with start only', () => {
    const result = scan([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
  });

  test('SCAN ensures end boundary when turning around', () => {
    const result = scan([10], 50, 'up');
    // no request above 50 → go to 199, then back to 10
    expect(result.path).toEqual([50, 199, 10]);
    expect(result.totalSeek).toBe(149 + 189);
  });
});
```

- [ ] **Step 2: Run SCAN test to confirm it fails**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "SCAN" --no-coverage`

Expected: FAIL — `Cannot find module 'disk-scheduling'` or function not defined.

- [ ] **Step 3: Implement SCAN algorithm**

```js
// utils/disk-scheduling.js

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

module.exports = { scan, cScan, look, cLook, compareAlgorithms };
```

- [ ] **Step 4: Run SCAN test to verify it passes**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "SCAN" --no-coverage`

Expected: PASS (4 tests)

- [ ] **Step 5: Commit SCAN implementation**

```bash
git add utils/disk-scheduling.js tests/utils/disk-scheduling.test.js
git commit -m "feat: SCAN 磁盘调度算法实现 + 测试"
```

- [ ] **Step 6: Write failing tests for C-SCAN algorithm**

```js
// append to tests/utils/disk-scheduling.test.js

describe('cScan', () => {
  test('C-SCAN(up) from 50 with requests [98,37,183,14,122]', () => {
    const result = cScan([98, 37, 183, 14, 122], 50, 'up');
    // path: 50→98→122→183→(到199)→(跳回0)→14→37
    expect(result.path).toEqual([50, 98, 122, 183, 199, 0, 14, 37]);
    expect(result.totalSeek).toBe(149 + 199 + 14 + 23 + 48 + 24 + 61 + 16);
  });

  test('C-SCAN(down) from 50 with same requests', () => {
    const result = cScan([98, 37, 183, 14, 122], 50, 'down');
    // path: 50→37→14→(到0)→(跳回199)→98→122→183
    expect(result.path).toEqual([50, 37, 14, 0, 199, 98, 122, 183]);
  });

  test('C-SCAN empty requests returns path with start only', () => {
    const result = cScan([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
  });
});
```

- [ ] **Step 7: Run C-SCAN test to confirm it fails**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "C-SCAN" --no-coverage`

Expected: FAIL — `cScan is not a function` or similar.

- [ ] **Step 8: Implement C-SCAN algorithm**

```js
// append to utils/disk-scheduling.js

/**
 * 循环扫描算法（C-SCAN）
 * 向指定方向扫描到底，跳回起点对侧再扫描
 */
function cScan(requests, start, direction) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return { path: [start], totalSeek: 0, steps: [] };
  }

  const sorted = [...requests].sort((a, b) => a - b);
  const up = sorted.filter(r => r >= start);
  const down = sorted.filter(r => r < start);

  const path = [start];
  const steps = [];
  let current = start;

  function moveTo(target) {
    const seek = Math.abs(target - current);
    steps.push({ from: current, to: target, seek });
    path.push(target);
    current = target;
  }

  if (direction === 'up') {
    for (const r of up) moveTo(r);
    moveTo(199);
    moveTo(0);
    for (const r of down) moveTo(r);
  } else {
    for (const r of down.reverse()) moveTo(r);
    moveTo(0);
    moveTo(199);
    for (const r of up) moveTo(r);
  }

  const totalSeek = steps.reduce((sum, s) => sum + s.seek, 0);
  return { path, totalSeek, steps };
}
```

- [ ] **Step 9: Run C-SCAN tests to verify they pass**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "C-SCAN" --no-coverage`

Expected: PASS (3 tests)

- [ ] **Step 10: Commit C-SCAN implementation**

```bash
git add utils/disk-scheduling.js tests/utils/disk-scheduling.test.js
git commit -m "feat: C-SCAN 磁盘调度算法实现 + 测试"
```

- [ ] **Step 11: Write failing tests for LOOK algorithm**

```js
// append to tests/utils/disk-scheduling.test.js

describe('look', () => {
  test('LOOK(up) from 50 with requests [98,37,183,14,122]', () => {
    const result = look([98, 37, 183, 14, 122], 50, 'up');
    // path: 50→98→122→183→(转向)→37→14
    // 注意：不到 199
    expect(result.path).toEqual([50, 98, 122, 183, 37, 14]);
    expect(result.totalSeek).toBe(48 + 24 + 61 + 146 + 23);
  });

  test('LOOK(down) from 50 with same requests', () => {
    const result = look([98, 37, 183, 14, 122], 50, 'down');
    // path: 50→37→14→(转向)→98→122→183
    // 注意：不到 0
    expect(result.path).toEqual([50, 37, 14, 98, 122, 183]);
  });

  test('LOOK(up) single request above start', () => {
    const result = look([120], 50, 'up');
    expect(result.path).toEqual([50, 120]);
    expect(result.totalSeek).toBe(70);
  });

  test('LOOK(up) single request below start', () => {
    const result = look([20], 50, 'up');
    // go up first but nothing above → still go find below
    expect(result.path).toEqual([50, 20]);
    expect(result.totalSeek).toBe(30);
  });

  test('LOOK empty requests returns path with start only', () => {
    const result = look([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
  });
});
```

- [ ] **Step 12: Run LOOK test to confirm it fails**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "LOOK" --no-coverage`

Expected: FAIL — `look is not a function`

- [ ] **Step 13: Implement LOOK algorithm**

```js
// append to utils/disk-scheduling.js

/**
 * LOOK 算法
 * 扫描到最远请求即转向，不扫到底
 */
function look(requests, start, direction) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return { path: [start], totalSeek: 0, steps: [] };
  }

  const sorted = [...requests].sort((a, b) => a - b);
  const up = sorted.filter(r => r >= start);
  const down = sorted.filter(r => r < start).reverse();

  const path = [start];
  const steps = [];
  let current = start;

  function moveTo(target) {
    const seek = Math.abs(target - current);
    steps.push({ from: current, to: target, seek });
    path.push(target);
    current = target;
  }

  if (direction === 'up') {
    for (const r of up) moveTo(r);
    for (const r of down) moveTo(r);
  } else {
    for (const r of down) moveTo(r);
    for (const r of up) moveTo(r);
  }

  const totalSeek = steps.reduce((sum, s) => sum + s.seek, 0);
  return { path, totalSeek, steps };
}
```

- [ ] **Step 14: Run LOOK tests to verify they pass**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "LOOK" --no-coverage`

Expected: PASS (5 tests)

- [ ] **Step 15: Commit LOOK implementation**

```bash
git add utils/disk-scheduling.js tests/utils/disk-scheduling.test.js
git commit -m "feat: LOOK 磁盘调度算法实现 + 测试"
```

- [ ] **Step 16: Write failing tests for C-LOOK algorithm**

```js
// append to tests/utils/disk-scheduling.test.js

describe('cLook', () => {
  test('C-LOOK(up) from 50 with requests [98,37,183,14,122]', () => {
    const result = cLook([98, 37, 183, 14, 122], 50, 'up');
    // path: 50→98→122→183→(跳回14)→37
    // 注意：不到 199 也不到 0
    expect(result.path).toEqual([50, 98, 122, 183, 14, 37]);
  });

  test('C-LOOK(down) from 50 with same requests', () => {
    const result = cLook([98, 37, 183, 14, 122], 50, 'down');
    // path: 50→37→14→(跳回183)→122→98
    // Wait: going down → touch 37, 14 → jump to biggest request below start? 
    // Actually C-LOOK: serve direction → jump to opposite FARTHEST and serve opposite direction
    // down: visit 14, 37 (in descending order), then jump to 183 (far end), serve 122, 98
    expect(result.path).toEqual([50, 37, 14, 183, 122, 98]);
  });

  test('C-LOOK(up) single request below start', () => {
    const result = cLook([20], 50, 'up');
    // go up → nothing above → jump to 20
    expect(result.path).toEqual([50, 20]);
  });

  test('C-LOOK empty requests returns path with start only', () => {
    const result = cLook([], 50, 'up');
    expect(result.path).toEqual([50]);
    expect(result.totalSeek).toBe(0);
  });
});
```

- [ ] **Step 17: Run C-LOOK test to confirm it fails**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "C-LOOK" --no-coverage`

Expected: FAIL — `cLook is not a function`

- [ ] **Step 18: Implement C-LOOK algorithm**

```js
// append to utils/disk-scheduling.js

/**
 * C-LOOK 算法
 * 向指定方向到最远请求，跳回对侧最远请求继续
 */
function cLook(requests, start, direction) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return { path: [start], totalSeek: 0, steps: [] };
  }

  const sorted = [...requests].sort((a, b) => a - b);
  const up = sorted.filter(r => r >= start);
  const down = sorted.filter(r => r < start);

  const path = [start];
  const steps = [];
  let current = start;

  function moveTo(target) {
    const seek = Math.abs(target - current);
    steps.push({ from: current, to: target, seek });
    path.push(target);
    current = target;
  }

  if (direction === 'up') {
    for (const r of up) moveTo(r);
    if (down.length > 0) {
      moveTo(down[0]); // jump to smallest
      for (let i = 1; i < down.length; i++) moveTo(down[i]);
    }
  } else {
    for (const r of down.reverse()) moveTo(r);
    if (up.length > 0) {
      moveTo(up[up.length - 1]); // jump to biggest
      for (let i = up.length - 2; i >= 0; i--) moveTo(up[i]);
    }
  }

  const totalSeek = steps.reduce((sum, s) => sum + s.seek, 0);
  return { path, totalSeek, steps };
}
```

- [ ] **Step 19: Run C-LOOK tests to verify they pass**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "C-LOOK" --no-coverage`

Expected: PASS (4 tests)

- [ ] **Step 20: Write failing tests for compareAlgorithms**

```js
// append to tests/utils/disk-scheduling.test.js

describe('compareAlgorithms', () => {
  test('returns result for all 4 algorithms with same input', () => {
    const result = compareAlgorithms([98, 37, 183, 14, 122], 50, ['scan', 'cScan', 'look', 'cLook']);
    expect(Object.keys(result)).toEqual(['scan', 'cScan', 'look', 'cLook']);
    expect(typeof result.scan.totalSeek).toBe('number');
    expect(typeof result.cScan.totalSeek).toBe('number');
    expect(typeof result.look.totalSeek).toBe('number');
    expect(typeof result.cLook.totalSeek).toBe('number');
  });

  test('returns only requested algorithms', () => {
    const result = compareAlgorithms([98, 37], 50, ['scan', 'look']);
    expect(Object.keys(result)).toEqual(['scan', 'look']);
  });

  test('returns empty object for empty algorithms list', () => {
    const result = compareAlgorithms([98, 37], 50, []);
    expect(result).toEqual({});
  });
});
```

- [ ] **Step 21: Run compareAlgorithms test to confirm it fails**

Run: `npx jest tests/utils/disk-scheduling.test.js -t "compareAlgorithms" --no-coverage`

Expected: FAIL — `compareAlgorithms is not a function`

- [ ] **Step 22: Implement compareAlgorithms**

```js
// append to utils/disk-scheduling.js

const _ALGO_MAP = { scan, cScan, look, cLook };

/**
 * 对比多个算法的性能
 * @param {number[]} requests
 * @param {number} start
 * @param {string[]} algorithms - ['scan', 'cScan', 'look', 'cLook']
 * @returns {Object<string, { totalSeek: number, path: number[] }>}
 */
function compareAlgorithms(requests, start, algorithms) {
  const result = {};
  for (const name of algorithms) {
    const fn = _ALGO_MAP[name];
    if (fn) {
      const r = fn(requests, start, 'up');
      result[name] = { totalSeek: r.totalSeek, path: r.path };
    }
  }
  return result;
}
```

- [ ] **Step 23: Run all algorithm tests to confirm everything passes**

Run: `npx jest tests/utils/disk-scheduling.test.js --no-coverage`

Expected: All PASS

- [ ] **Step 24: Run full test suite to ensure no regressions**

Run: `npm test`

Expected: All tests PASS (no regressions)

- [ ] **Step 25: Commit all algorithms**

```bash
git add utils/disk-scheduling.js tests/utils/disk-scheduling.test.js
git commit -m "feat: 磁盘调度 4 算法全部实现（SCAN/C-SCAN/LOOK/C-LOOK）+ 对比函数"
```

---
### Task 2: 页面骨架 — WXML + WXSS

**Files:**
- Create: `package-tools/disk-sched/disk-sched.wxml`
- Create: `package-tools/disk-sched/disk-sched.wxss`
- Create: `package-tools/disk-sched/disk-sched.json`

**Interfaces:**
- Consumes: UI layout matching Claude Design spec
- Produces: wireframe with 4 sections: 配置区 / 磁道轴动画区 / 性能指标区 / 控制栏 + 算法对比

- [ ] **Step 1: Create disk-sched.json**

```json
{
  "navigationBarTitleText": "磁盘调度可视化",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black"
}
```

- [ ] **Step 2: Create disk-sched.wxml**

```xml
<view class="page">
  <!-- 配置区 -->
  <view class="config-band">
    <text class="band-label">磁盘调度可视化</text>

    <view class="config-row">
      <text class="config-label">磁头起点</text>
      <input class="config-input" type="number" value="{{startPos}}" bindinput="onStartInput" />
      <view class="dir-buttons">
        <view class="dir-btn {{direction === 'down' ? 'dir-active' : ''}}" bindtap="onDirectionChange" data-dir="down">← 小号</view>
        <view class="dir-btn {{direction === 'up' ? 'dir-active' : ''}}" bindtap="onDirectionChange" data-dir="up">大号 →</view>
      </view>
    </view>

    <view class="config-row">
      <text class="config-label">柱面序列</text>
      <input class="config-input-wide" placeholder="逗号分隔，如 98,183,37,122" value="{{requestInput}}" bindinput="onRequestInput" />
      <view class="icon-btn" bindtap="onRandomGenerate"><text class="icon-btn-text">🎲</text></view>
    </view>

    <text wx:if="{{errorMessage}}" class="error-text">{{errorMessage}}</text>
  </view>

  <!-- 算法选择 -->
  <view class="algo-band">
    <view class="algo-tabs">
      <view class="algo-tab {{selectedAlgo === 'scan' ? 'algo-active' : ''}}" bindtap="onAlgoSelect" data-algo="scan">SCAN</view>
      <view class="algo-tab {{selectedAlgo === 'cScan' ? 'algo-active' : ''}}" bindtap="onAlgoSelect" data-algo="cScan">C-SCAN</view>
      <view class="algo-tab {{selectedAlgo === 'look' ? 'algo-active' : ''}}" bindtap="onAlgoSelect" data-algo="look">LOOK</view>
      <view class="algo-tab {{selectedAlgo === 'cLook' ? 'algo-active' : ''}}" bindtap="onAlgoSelect" data-algo="cLook">C-LOOK</view>
    </view>
  </view>

  <!-- 磁道轴可视化 -->
  <view class="track-band" wx:if="{{steps.length > 0 || path.length > 0}}">
    <view class="track-container">
      <!-- 时间轴刻度 -->
      <view class="track-scale">
        <view class="scale-mark" style="left: 0%;"><text class="scale-label">0</text></view>
        <view class="scale-mark" style="left: 25%;"><text class="scale-label">50</text></view>
        <view class="scale-mark" style="left: 50%;"><text class="scale-label">100</text></view>
        <view class="scale-mark" style="left: 75%;"><text class="scale-label">150</text></view>
        <view class="scale-mark" style="left: 100%;"><text class="scale-label">199</text></view>
      </view>

      <!-- 磁道轴 -->
      <view class="track-axis">
        <!-- 请求标记点 -->
        <view wx:for="{{requestMarkers}}" wx:key="track" class="track-dot" style="left: {{item.leftPct}}%;">
          <text class="track-dot-val">{{item.track}}</text>
        </view>

        <!-- 磁头 -->
        <view class="track-head" style="left: {{headLeftPct}}%;">
          <text class="track-head-text">▼</text>
        </view>

        <!-- 已访问路径 -->
        <view wx:for="{{pathSegments}}" wx:key="index" class="path-segment" style="left: {{item.fromLeft}}%; width: {{item.widthPct}}%; top: {{item.topOffset}}px;">
          <view class="path-segment-fill" style="background: {{item.color}};"></view>
        </view>
      </view>

      <!-- 访问顺序标签 -->
      <view class="track-order">
        <view wx:for="{{visitedLabels}}" wx:key="index" class="order-label" style="left: {{item.leftPct}}%;">
          <text class="order-num">{{item.order}}</text>
        </view>
      </view>
    </view>
  </view>

  <!-- 空状态 -->
  <view class="empty-band" wx:if="{{steps.length === 0}}">
    <text class="empty-text">配置参数后点击 ▶ 运行</text>
  </view>

  <!-- 步进信息 -->
  <view class="step-info" wx:if="{{currentStep !== null && steps.length > 0}}">
    <view class="step-detail">
      <text class="step-from-to">{{steps[currentStep].from}} → {{steps[currentStep].to}}</text>
      <text class="step-seek">寻道长度: {{steps[currentStep].seek}}</text>
    </view>
    <view class="step-progress">
      <text class="step-progress-text">{{currentStep + 1}} / {{steps.length}}</text>
    </view>
  </view>

  <!-- 性能指标 -->
  <view class="metric-band" wx:if="{{totalSeek > 0}}">
    <view class="metric-card">
      <text class="metric-label">总寻道长度</text>
      <text class="metric-value">{{totalSeek}}</text>
    </view>
    <view class="metric-card">
      <text class="metric-label">平均寻道长度</text>
      <text class="metric-value">{{avgSeek}}</text>
    </view>
    <view class="metric-card metric-span-2">
      <text class="metric-label">移动路径</text>
      <view class="path-pills">
        <text wx:for="{{steps}}" wx:key="index" class="path-pill">→ {{item.to}}</text>
      </view>
    </view>
  </view>

  <!-- 算法对比 -->
  <view class="compare-band" wx:if="{{comparison.length > 0}}">
    <text class="band-label">算法对比</text>
    <view class="compare-grid">
      <view wx:for="{{comparison}}" wx:key="name" class="compare-card">
        <text class="compare-algo-name">{{item.displayName}}</text>
        <text class="compare-seek-num">{{item.totalSeek}}</text>
        <text class="compare-seek-label">寻道长度</text>
      </view>
    </view>
  </view>

  <!-- 控制栏 -->
  <view class="ctrl-band">
    <view class="ctrl-btn ctrl-reset" bindtap="onReset">
      <text class="ctrl-icon">重置</text>
    </view>
    <view class="ctrl-btn ctrl-play" bindtap="onTogglePlay">
      <text class="ctrl-icon">{{playing ? '暂停' : '▶'}}</text>
    </view>
    <view class="ctrl-btn" bindtap="onStepNext">
      <text class="ctrl-icon">步进</text>
    </view>
  </view>
</view>
```

- [ ] **Step 3: Create disk-sched.wxss**

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

/* ======================== 配置区 ======================== */
.config-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
}

.config-label {
  font-size: 24rpx;
  color: #6c6a64;
  flex-shrink: 0;
  width: 120rpx;
}

.config-input {
  width: 100rpx;
  background: #faf9f5;
  border: 2rpx solid #e6dfd8;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  color: #141413;
  text-align: center;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.config-input-wide {
  flex: 1;
  min-width: 200rpx;
  background: #faf9f5;
  border: 2rpx solid #e6dfd8;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  color: #141413;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.dir-buttons {
  display: flex;
  gap: 8rpx;
}

.dir-btn {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #faf9f5;
  color: #6c6a64;
  font-size: 22rpx;
  font-weight: 600;
}

.dir-active {
  background: #cc785c;
  color: #fff;
}

.icon-btn {
  width: 56rpx;
  height: 56rpx;
  background: #faf9f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-btn:active { background: #e8e0d2; }
.icon-btn-text { font-size: 28rpx; color: #141413; }

/* ======================== 算法选择 ======================== */
.algo-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
}

.algo-tabs {
  display: flex;
  gap: 12rpx;
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

/* ======================== 磁道轴 ======================== */
.track-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.track-container {
  position: relative;
  width: 100%;
}

.track-scale {
  display: flex;
  justify-content: space-between;
  height: 32rpx;
  position: relative;
  margin-bottom: 12rpx;
}

.scale-mark {
  position: absolute;
  transform: translateX(-50%);
}

.scale-label {
  font-size: 18rpx;
  color: #8e8b82;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.track-axis {
  position: relative;
  height: 80rpx;
  background: #faf9f5;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
}

.track-dot {
  position: absolute;
  top: 8rpx;
  width: 4rpx;
  height: 24rpx;
  background: #6c6a64;
  border-radius: 2rpx;
  transform: translateX(-50%);
}

.track-dot-val {
  position: absolute;
  top: 28rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18rpx;
  color: #6c6a64;
  font-family: 'SF Mono', 'Menlo', monospace;
  white-space: nowrap;
}

.track-head {
  position: absolute;
  top: -8rpx;
  transform: translateX(-50%);
  transition: left 300ms ease;
  z-index: 10;
}

.track-head-text {
  font-size: 36rpx;
  color: #cc785c;
}

.path-segment {
  position: absolute;
  height: 4rpx;
  top: 38rpx;
  z-index: 5;
}

.path-segment-fill {
  width: 100%;
  height: 100%;
  border-radius: 2rpx;
  opacity: 0.6;
}

.track-order {
  position: relative;
  height: 28rpx;
}

.order-label {
  position: absolute;
  transform: translateX(-50%);
}

.order-num {
  font-size: 18rpx;
  color: #cc785c;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-weight: 600;
}

/* ======================== 空状态 ======================== */
.empty-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 48rpx 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 26rpx;
  color: #8e8b82;
}

/* ======================== 步进信息 ======================== */
.step-info {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-detail {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.step-from-to {
  font-size: 36rpx;
  font-weight: 700;
  font-family: Georgia, serif;
  color: #141413;
  letter-spacing: -2rpx;
}

.step-seek {
  font-size: 24rpx;
  color: #6c6a64;
}

.step-progress-text {
  font-size: 22rpx;
  color: #8e8b82;
  font-family: 'SF Mono', 'Menlo', monospace;
}

/* ======================== 性能指标 ======================== */
.metric-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.metric-card {
  background: #faf9f5;
  border-radius: 16rpx;
  padding: 20rpx;
}

.metric-span-2 {
  grid-column: span 2;
}

.metric-label {
  display: block;
  font-size: 22rpx;
  color: #6c6a64;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.metric-value {
  font-size: 36rpx;
  font-weight: 700;
  font-family: Georgia, serif;
  color: #141413;
  letter-spacing: -2rpx;
}

.path-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
}

.path-pill {
  font-size: 20rpx;
  color: #141413;
  background: #e6dfd8;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  font-family: 'SF Mono', 'Menlo', monospace;
}

/* ======================== 算法对比 ======================== */
.compare-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.compare-card {
  background: #faf9f5;
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
}

.compare-algo-name {
  display: block;
  font-size: 22rpx;
  color: #6c6a64;
  margin-bottom: 8rpx;
}

.compare-seek-num {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #141413;
  font-family: Georgia, serif;
}

.compare-seek-label {
  display: block;
  font-size: 18rpx;
  color: #8e8b82;
  margin-top: 4rpx;
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

.ctrl-reset { background: #faf9f5; }
```

- [ ] **Step 4: Commit page skeleton**

```bash
git add package-tools/disk-sched/disk-sched.wxml package-tools/disk-sched/disk-sched.wxss package-tools/disk-sched/disk-sched.json
git commit -m "feat: 磁盘调度页面骨架（WXML+WXSS+JSON）"
```

---
### Task 3: 页面逻辑 — JS

**Files:**
- Create: `package-tools/disk-sched/disk-sched.js`

**Interfaces:**
- Consumes: `utils/disk-scheduling.js` exports (scan, cScan, look, cLook, compareAlgorithms)
- Produces: Page object with data, lifecycle, and event handlers

- [ ] **Step 1: Create disk-sched.js**

```js
const { scan, cScan, look, cLook, compareAlgorithms } = require('../../utils/disk-scheduling');

const ALGOS = ['scan', 'cScan', 'look', 'cLook'];
const ALGO_DISPLAY = {
  scan: 'SCAN',
  cScan: 'C-SCAN',
  look: 'LOOK',
  cLook: 'C-LOOK'
};
const MAX_REQUESTS = 15;
const CYLINDER_MAX = 199;
const HEAD_COLORS = ['#cc785c', '#a0b4c8', '#8ab88a', '#d4a574'];

Page({
  data: {
    startPos: 50,
    direction: 'up',
    requestInput: '',
    selectedAlgo: 'scan',
    errorMessage: '',

    // 算法结果
    path: [],
    steps: [],
    totalSeek: 0,
    avgSeek: '0.0',
    currentStep: null,

    // 渲染数据
    headLeftPct: 0,
    requestMarkers: [],
    pathSegments: [],
    visitedLabels: [],

    // 对比
    comparison: [],

    // 控制
    playing: false
  },

  _animTimer: null,

  onLoad() {
    this._seedRequests();
  },

  onUnload() {
    this._stopAnim();
  },

  _seedRequests() {
    const count = 4 + Math.floor(Math.random() * 4);
    const reqs = [];
    for (let i = 0; i < count; i++) {
      reqs.push(Math.floor(Math.random() * (CYLINDER_MAX + 1)));
    }
    this.setData({
      requestInput: reqs.join(', '),
      errorMessage: ''
    });
  },

  _parseRequests() {
    const raw = this.data.requestInput;
    const nums = raw.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (nums.length === 0) {
      this.setData({ errorMessage: '请添加柱面号' });
      return null;
    }
    if (nums.some(n => n < 0)) {
      this.setData({ errorMessage: '柱面号不能为负' });
      return null;
    }
    if (nums.length > MAX_REQUESTS) {
      this.setData({ errorMessage: '最多 ' + MAX_REQUESTS + ' 个请求' });
      return null;
    }
    return nums;
  },

  _compute(start, direction, algo) {
    const requests = this._parseRequests();
    if (!requests) return;

    let result;
    switch (algo) {
      case 'scan': result = scan(requests, start, direction); break;
      case 'cScan': result = cScan(requests, start, direction); break;
      case 'look': result = look(requests, start, direction); break;
      case 'cLook': result = cLook(requests, start, direction); break;
    }

    const steps = result.steps;
    const totalSeek = result.totalSeek;
    const avgSeek = steps.length > 0 ? (totalSeek / steps.length).toFixed(1) : '0.0';

    // Build request markers
    const uniqueReqs = [...new Set(requests)];
    const requestMarkers = uniqueReqs.map(track => ({
      track,
      leftPct: (track / CYLINDER_MAX) * 100
    }));

    // Build path segments for initial state (all at start)
    const pathSegments = [];
    let fromPos = start;
    for (let i = 0; i < steps.length; i++) {
      const seg = steps[i];
      const fromLeft = (fromPos / CYLINDER_MAX) * 100;
      const toLeft = (seg.to / CYLINDER_MAX) * 100;
      const widthPct = Math.abs(toLeft - fromLeft);
      pathSegments.push({
        fromLeft: Math.min(fromLeft, toLeft),
        widthPct,
        color: HEAD_COLORS[i % HEAD_COLORS.length],
        topOffset: 0
      });
      fromPos = seg.to;
    }

    // Visited labels (exclude start)
    const visitedLabels = result.path.slice(1).map((track, idx) => ({
      leftPct: (track / CYLINDER_MAX) * 100,
      order: idx + 1
    }));

    this.setData({
      path: result.path,
      steps,
      totalSeek,
      avgSeek,
      requestMarkers,
      pathSegments,
      visitedLabels,
      errorMessage: '',
      currentStep: null,
      headLeftPct: (start / CYLINDER_MAX) * 100,
      comparison: []
    });
  },

  _updateStepDisplay(stepIdx) {
    const { steps } = this.data;
    if (stepIdx < 0 || stepIdx >= steps.length) return;

    const step = steps[stepIdx];
    this.setData({
      currentStep: stepIdx,
      headLeftPct: (step.to / CYLINDER_MAX) * 100
    });
  },

  _runAllComparison() {
    const requests = this._parseRequests();
    if (!requests) return;

    const results = compareAlgorithms(requests, parseInt(this.data.startPos, 10) || 0,
      ['scan', 'cScan', 'look', 'cLook']);
    const comparison = Object.entries(results).map(([name, r]) => ({
      name,
      displayName: ALGO_DISPLAY[name] || name,
      totalSeek: r.totalSeek
    })).sort((a, b) => a.totalSeek - b.totalSeek);

    this.setData({ comparison });
  },

  _stopAnim() {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
  },

  // ── Event Handlers ──

  onStartInput(e) {
    this.setData({ startPos: parseInt(e.detail.value, 10) || 0 });
  },

  onDirectionChange(e) {
    const dir = e.currentTarget.dataset.dir;
    this.setData({ direction: dir });
  },

  onRequestInput(e) {
    this.setData({ requestInput: e.detail.value });
  },

  onRandomGenerate() {
    this._seedRequests();
  },

  onAlgoSelect(e) {
    if (this.data.playing) return;
    const algo = e.currentTarget.dataset.algo;
    this.setData({ selectedAlgo: algo });
    // Re-run with new algo if already have valid input
    this._compute(
      parseInt(this.data.startPos, 10) || 0,
      this.data.direction,
      algo
    );
  },

  onReset() {
    this._stopAnim();
    this.setData({
      path: [],
      steps: [],
      totalSeek: 0,
      avgSeek: '0.0',
      currentStep: null,
      requestMarkers: [],
      pathSegments: [],
      visitedLabels: [],
      headLeftPct: (parseInt(this.data.startPos, 10) || 0) / CYLINDER_MAX * 100,
      comparison: [],
      playing: false
    });
  },

  onTogglePlay() {
    if (this.data.playing) {
      this._stopAnim();
      this.setData({ playing: false });
      return;
    }

    // If no result yet, compute first
    if (this.data.steps.length === 0) {
      const start = parseInt(this.data.startPos, 10) || 0;
      this._compute(start, this.data.direction, this.data.selectedAlgo);
    }

    if (this.data.steps.length === 0) return;

    // If already at end, reset to beginning
    if (this.data.currentStep !== null && this.data.currentStep >= this.data.steps.length - 1) {
      this._resetAnimationState();
    }

    this.setData({ playing: true });

    const delayMs = 600;
    this._animTimer = setInterval(() => {
      let current = this.data.currentStep;
      if (current === null) {
        current = -1;
      }
      const nextIdx = current + 1;
      if (nextIdx >= this.data.steps.length) {
        this._stopAnim();
        this.setData({ playing: false });
        // Run comparison when animation completes
        this._runAllComparison();
        return;
      }
      this._updateStepDisplay(nextIdx);
    }, delayMs);
  },

  _resetAnimationState() {
    const start = parseInt(this.data.startPos, 10) || 0;
    this.setData({
      currentStep: null,
      headLeftPct: (start / CYLINDER_MAX) * 100,
      comparison: []
    });
  },

  onStepNext() {
    // If no result yet, compute first
    if (this.data.steps.length === 0) {
      const start = parseInt(this.data.startPos, 10) || 0;
      this._compute(start, this.data.direction, this.data.selectedAlgo);
    }

    if (this.data.steps.length === 0) return;

    let current = this.data.currentStep;
    if (current === null) {
      current = -1;
    }
    const nextIdx = current + 1;
    if (nextIdx >= this.data.steps.length) {
      // Run comparison when reaching end
      this._runAllComparison();
      return;
    }
    this._updateStepDisplay(nextIdx);
  }
});
```

- [ ] **Step 2: Commit page JS**

```bash
git add package-tools/disk-sched/disk-sched.js
git commit -m "feat: 磁盘调度页面逻辑（输入解析/算法调用/动画控制/对比）"
```

---
### Task 4: 注册上线 & Handoff

**Files:**
- Modify: `utils/tool-registry.js` — set disk-sched route & available
- Modify: `app.json` — add to subPackages
- Create: `docs/handoff/modules/disk-sched.md`
- Modify: `docs/superpowers/specs/README.md` — move disk-sched to 已实现

**Interfaces:**
- Consumes: tool-registry entry, app.json subpackage pattern, handoff doc template

- [ ] **Step 1: Update tool-registry.js — fix route & set available**

Change disk-sched entry:
```js
{
  id: 'disk-sched',
  category: 'os',
  name: '磁盘调度可视化',
  icon: '',
  description: 'SCAN/C-SCAN/LOOK/C-LOOK · 磁头移动路径',
  route: '/package-tools/disk-sched/disk-sched',
  available: true,
  featured: false,
  tagline: '4 种磁盘调度算法，可视化磁头移动',
  taglineDetail: 'SCAN、C-SCAN、LOOK、C-LOOK 四种算法切换，磁头移动动画回放，总寻道长度/平均寻道长度实时计算，多算法一键对比',
  tags: ['#可视化', '#交互式', '#操作系统'],
  difficulty: 'medium',
  order: 4
}
```

- [ ] **Step 2: Update app.json — add disk-sched to subPackages**

Add `"disk-sched/disk-sched"` to the `pages` array in the subPackage (after `"deadlock/deadlock"`).

- [ ] **Step 3: Run full test suite to verify**

Run: `npm test`

Expected: All tests PASS. Note: tool-registry test `getAvailableTools` expects `result.length === X` — update the expected count from 11 to 12 in `tests/utils/tool-registry.test.js`.

```js
// In tests/utils/tool-registry.test.js
// Update line: expect(result.length).toBe(11) → 12
// Add: expect(ids).toContain('disk-sched');
```

- [ ] **Step 4: Create handoff document**

Create `docs/handoff/modules/disk-sched.md`:

```markdown
# 磁盘调度可视化 — 模块文档

**上线日期:** 2026-07-21

## 概述

磁盘调度可视化工具，展示 SCAN / C-SCAN / LOOK / C-LOOK 四种算法在磁道间的移动路径与性能对比。

## 页面

`package-tools/disk-sched/disk-sched`

## 核心逻辑

`utils/disk-scheduling.js` — 4 个调度算法 + 对比函数，纯函数无副作用。

| 函数 | 说明 |
|---|---|
| `scan(requests, start, direction)` | 电梯算法，扫到底再反向 |
| `cScan(requests, start, direction)` | 循环扫描，跳回对侧起点 |
| `look(requests, start, direction)` | 到最远请求即转向 |
| `cLook(requests, start, direction)` | 循环到最远请求，跳回对侧 |
| `compareAlgorithms(reqs, start, names)` | 多算法同参数对比 |

## 交互

- 输入柱面序列（逗号分隔或随机生成）
- 配置磁头起点和方向
- 4 种算法一键切换
- ▶ 播放 / ⏸ 暂停 / 步进 / ↻ 重置
- 动画结束后自动进行 4 算法对比

## 数据约束

- 柱面范围 0~199
- 请求上限 15 个
- 磁头起点 ≥ 0

## 测试

`tests/utils/disk-scheduling.test.js` — 全量算法 + 对比函数单元测试。
```

- [ ] **Step 5: Commit registration & handoff**

```bash
git add utils/tool-registry.js app.json tests/utils/tool-registry.test.js docs/handoff/modules/disk-sched.md
git commit -m "feat: 磁盘调度可视化上线（注册 + handoff）"
```

- [ ] **Step 6: Run final full test suite**

Run: `npm test`

Expected: All 700+ tests PASS

---
## 自检清单

**1. Spec 覆盖：**
- [x] 4 个算法（SCAN / C-SCAN / LOOK / C-LOOK）→ Task 1
- [x] 柱面序列手动输入 + 🎲 随机生成 → Task 3（`onRequestInput`/`onRandomGenerate`/`_seedRequests`）
- [x] 磁头起点 + 方向配置 → Task 3（`onStartInput`/`onDirectionChange`）
- [x] 磁头移动动画 → Task 2 & 3（WXSS `transition: left 300ms ease` + `_updateStepDisplay`）
- [x] 性能指标（总寻道长度、平均寻道长度）→ Task 3（`totalSeek`/`avgSeek`）
- [x] 算法对比 → Task 3（`_runAllComparison` + `comparison` data）
- [x] ▶ 播放 / ⏸ 暂停 / 步进 / ↻ 重置 → Task 3（`onTogglePlay`/`onStepNext`/`onReset`）
- [x] 错误处理（空序列、负数、超上限）→ Task 3（`_parseRequests`）
- [x] 空状态提示 → Task 2 WXML（`empty-band`）
- [x] 纯函数 + 不可变 → Task 1（全部无副作用）

**2. 占位符检查：** 全部代码块包含完整实现，无 TBD / TODO / "后续实现" 占位。

**3. 类型一致性：** Task 1 定义的 `scan(requests, start, direction)` 签名在 Task 3 的 `switch` 中一致使用。`compareAlgorithms` 返回 `{ name: { totalSeek, path } }` 格式在 Task 3 的 `_runAllComparison` 中正确消费。
