# IP 分片可视化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 IP 分片与重组的可视化教学页面，用户通过滑块调整原始报文大小和 MTU 参数，直观看到 IP 层如何将超大数据报切分为多个分片（标识符、标志位、片偏移三字段变化），以及接收端如何根据分片偏移量重组。

**Architecture:** 纯函数层（`utils/ip-fragment.js` + `utils/ip-reassemble.js`）封装分片与重组算法，4 文件页面（`pages/ip-fragment/`）处理交互与动画。与 subnet-calc、tcp-viz 等同属计算机网络分类，复用同一设计语言。

**Tech Stack:** 微信小程序原生（WXML+WXSS+JS）| Jest 测试 | Claude Design 暖奶油画布

**Spec:** `docs/superpowers/specs/2026-07-19-ip-fragment-design.md`

## Global Constraints

- Claude Design 暖奶油画布：背景 `#faf9f5`，卡片 `#efe9de` 圆角 24rpx，CTA `#cc785c`（active `#a9583e`），标题 Georgia 衬线 400 weight，正文 `#141413`，次要文字 `#6c6a64`
- 纯函数优先：`ip-fragment.js` 和 `ip-reassemble.js` 全部无副作用
- 报文大小范围 100~65535 字节（clamp），滑块默认 1500
- MTU 范围 68~2000 字节（clamp 到 68 最小 IPv4 MTU），默认 1500，滑块步进 50
- 滑块防抖 300ms
- IP 头部固定 20 字节（IPv4 无选项）
- 片偏移（offset）= 起始字节 ÷ 8，8 字节对齐
- 分片 ID 使用 `0x` 格式随机十六进制（同一报文所有分片 ID 相同）
- 动画使用 WXSS `transition` 或 `setInterval` 逐步展示
- 更新 tool-registry 时路由保持 `/pages/ip-fragment/ip-fragment`（tool-registry 中已存在占位记录，`available: false` → `true`）
- 页面文件放在 `pages/ip-fragment/`（非子包，需在 app.json 主 `pages` 数组注册）

---
### Task 1: 工具函数 — IP 分片计算 + 重组逻辑

**Files:**
- Create: `utils/ip-fragment.js`
- Create: `utils/ip-reassemble.js`
- Create: `tests/utils/ip-fragment.test.js`
- Create: `tests/utils/ip-reassemble.test.js`

**Interfaces:**
- Produces:
  - `fragment(datagramSize, mtu)` → `FragmentResult`
  - `reassemble(fragments)` → `{ totalBytes, success, fragments, errors? }`
  - `Fragment` type: `{ index, dataStart, dataEnd, dataLength, id, mf, offset, offsetBytes }`
  - `FragmentResult` type: `{ totalBytes, headerSize, mtu, payloadPerFragment, fragments: Fragment[], totalFragments }`
  - `randomId()` → `string` （生成 `0x` 格式随机十六进制 ID）

- [ ] **Step 1: Write failing tests for fragment()**

```js
// tests/utils/ip-fragment.test.js
const { fragment, randomId } = require('../../utils/ip-fragment');

describe('randomId', () => {
  test('returns string starting with 0x', () => {
    expect(randomId()).toMatch(/^0x[0-9a-f]{4}$/);
  });

  test('returns different values on successive calls', () => {
    const id1 = randomId();
    const id2 = randomId();
    expect(id1).not.toBe(id2);
  });
});

describe('fragment', () => {
  const HEADER = 20;

  test('single fragment when datagramSize <= MTU', () => {
    const result = fragment(1000, 1500);
    expect(result.totalFragments).toBe(1);
    expect(result.fragments[0].dataStart).toBe(0);
    expect(result.fragments[0].dataEnd).toBe(1000);
    expect(result.fragments[0].dataLength).toBe(1000);
    expect(result.fragments[0].mf).toBe(false);
    expect(result.fragments[0].offset).toBe(0);
    expect(result.payloadPerFragment).toBe(1480); // 1500 - 20
  });

  test('fragments when datagramSize > MTU', () => {
    const result = fragment(3000, 1000);
    expect(result.totalFragments).toBe(3);
    expect(result.payloadPerFragment).toBe(980); // 1000 - 20
    // 第一片: 0~979 (980 bytes)
    expect(result.fragments[0].dataStart).toBe(0);
    expect(result.fragments[0].dataEnd).toBe(979);
    expect(result.fragments[0].dataLength).toBe(980);
    expect(result.fragments[0].mf).toBe(true);
    expect(result.fragments[0].offset).toBe(0);

    // 第二片: 980~1959
    expect(result.fragments[1].dataStart).toBe(980);
    expect(result.fragments[1].dataEnd).toBe(1959);
    expect(result.fragments[1].dataLength).toBe(980);
    expect(result.fragments[1].mf).toBe(true);
    expect(result.fragments[1].offset).toBe(122); // 980 / 8

    // 第三片: 1960~(3000-1)
    expect(result.fragments[2].dataStart).toBe(1960);
    expect(result.fragments[2].dataEnd).toBe(2999);
    expect(result.fragments[2].dataLength).toBe(3000 - 1960);
    expect(result.fragments[2].mf).toBe(false);
    expect(result.fragments[2].offset).toBe(245); // 1960 / 8
  });

  test('all fragments share same ID', () => {
    const result = fragment(3000, 1000);
    const id = result.fragments[0].id;
    result.fragments.forEach(f => {
      expect(f.id).toBe(id);
    });
  });

  test('offset is 8-byte aligned (byteOffset / 8)', () => {
    const result = fragment(4000, 1500);
    result.fragments.forEach(f => {
      expect(f.offset * 8).toBeLessThanOrEqual(f.dataStart);
    });
  });

  test('last fragment has mf = false, others have mf = true', () => {
    const result = fragment(2500, 1000);
    for (let i = 0; i < result.totalFragments - 1; i++) {
      expect(result.fragments[i].mf).toBe(true);
    }
    expect(result.fragments[result.totalFragments - 1].mf).toBe(false);
  });

  test('exact multiple of MTU payload', () => {
    const result = fragment(1960, 1000); // 1960 / 980 = 2 exactly
    expect(result.totalFragments).toBe(2);
    expect(result.fragments[0].dataLength).toBe(980);
    expect(result.fragments[1].dataLength).toBe(980);
    expect(result.fragments[1].mf).toBe(false);
  });

  test('datagramSize equals MTU exactly', () => {
    const result = fragment(1000, 1000);
    expect(result.totalFragments).toBe(1);
    // payload = 1000 - 20 = 980, so 1000 bytes need ceil(1000/980) = 2 fragments
    // Actually: if datagramSize = 1000, mtu = 1000, payloadPerFragment = 980
    // ceil(1000/980) = 2 fragments
    expect(result.totalFragments).toBe(2);
  });

  test('clamp datagramSize to 65535', () => {
    const result = fragment(100000, 1500);
    expect(result.totalBytes).toBe(65535);
  });

  test('clamp MTU to minimum 68', () => {
    const result = fragment(1000, 50);
    expect(result.mtu).toBe(68);
    expect(result.headerSize).toBe(20);
    expect(result.payloadPerFragment).toBe(48); // 68 - 20
  });

  test('edge: minimum MTU 68 with small datagram', () => {
    const result = fragment(100, 68);
    expect(result.payloadPerFragment).toBe(48);
    expect(result.totalFragments).toBe(Math.ceil(100 / 48));
  });

  test('edge: datagramSize exactly 100 (minimum slider)', () => {
    const result = fragment(100, 1500);
    expect(result.totalFragments).toBe(1);
    expect(result.fragments[0].dataLength).toBe(100);
  });
});
```

- [ ] **Step 2: Run fragment tests to confirm they fail**

Run: `npx jest tests/utils/ip-fragment.test.js --no-coverage`

Expected: FAIL — `Cannot find module 'ip-fragment'` or function not defined.

- [ ] **Step 3: Implement fragment() and randomId()**

```js
// utils/ip-fragment.js

const MAX_DATAGRAM = 65535;
const MIN_MTU = 68;
const IP_HEADER = 20;

let _idCounter = 0;

/**
 * Generate a random 16-bit fragment ID in 0x format
 * @returns {string}
 */
function randomId() {
  _idCounter = (_idCounter + 1) % 65536;
  const val = (Date.now() & 0xffff) ^ (_idCounter << 4);
  return '0x' + ((val & 0xffff) >>> 0).toString(16).padStart(4, '0');
}

/**
 * @typedef {Object} Fragment
 * @property {number} index - 分片序号（1-based）
 * @property {number} dataStart - 在原始报文中的起始字节
 * @property {number} dataEnd - 在原始报文中的结束字节
 * @property {number} dataLength - 本片数据长度（字节）
 * @property {string} id - 标识符（同一报文所有分片相同）
 * @property {boolean} mf - 还有更多分片（More Fragments）
 * @property {number} offset - 片偏移（8 字节为单位）
 * @property {number} offsetBytes - 片偏移 × 8 = 实际字节偏移
 * @property {string} explanation - 人类可读说明
 */

/**
 * @typedef {Object} FragmentResult
 * @property {number} totalBytes - 原始报文大小（可能被 clamp）
 * @property {number} headerSize - IP 头部固定 20 字节
 * @property {number} mtu - MTU 值（可能被 clamp）
 * @property {number} payloadPerFragment - 每片最大数据载荷
 * @property {Fragment[]} fragments - 分片列表
 * @property {number} totalFragments - 总分片数
 * @property {string} id - 所有分片共享的标识符
 */

/**
 * 将数据报按 MTU 拆分为 IP 分片
 * @param {number} datagramSize - 原始报文大小（字节）
 * @param {number} mtu - 最大传输单元（字节）
 * @returns {FragmentResult}
 */
function fragment(datagramSize, mtu) {
  // Clamp inputs
  const totalBytes = Math.min(Math.max(datagramSize, 0), MAX_DATAGRAM);
  const clampedMtu = Math.max(mtu, MIN_MTU);
  const payloadPerFragment = clampedMtu - IP_HEADER;
  const totalFragments = Math.ceil(totalBytes / payloadPerFragment);
  const id = randomId();

  const fragments = [];
  for (let i = 0; i < totalFragments; i++) {
    const dataStart = i * payloadPerFragment;
    const dataEnd = Math.min(dataStart + payloadPerFragment, totalBytes) - 1;
    const dataLength = dataEnd - dataStart + 1;
    const offset = Math.floor(dataStart / 8);
    const mf = i < totalFragments - 1;

    fragments.push({
      index: i + 1,
      dataStart,
      dataEnd,
      dataLength,
      id,
      mf,
      offset,
      offsetBytes: offset * 8,
      explanation: i < totalFragments - 1
        ? `分片 ${i + 1}：字节 ${dataStart}~${dataEnd}（${dataLength} 字节）`
        : `分片 ${i + 1}（最后）：字节 ${dataStart}~${dataEnd}（${dataLength} 字节）`
    });
  }

  return {
    totalBytes,
    headerSize: IP_HEADER,
    mtu: clampedMtu,
    payloadPerFragment,
    fragments,
    totalFragments,
    id
  };
}

module.exports = { fragment, randomId };
```

- [ ] **Step 4: Run fragment tests to verify they pass**

Run: `npx jest tests/utils/ip-fragment.test.js --no-coverage`

Expected: PASS (all tests)

- [ ] **Step 5: Commit fragment implementation**

```bash
git add utils/ip-fragment.js tests/utils/ip-fragment.test.js
git commit -m "feat: IP 分片算法实现 + 测试"
```

- [ ] **Step 6: Write failing tests for reassemble()**

```js
// tests/utils/ip-reassemble.test.js
const { fragment } = require('../../utils/ip-fragment');
const { reassemble } = require('../../utils/ip-reassemble');

describe('reassemble', () => {
  test('reassembles 3 fragments back to original size', () => {
    const result = fragment(3000, 1000);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(3000);
    expect(reassembled.totalFragments).toBe(3);
  });

  test('reassembles single fragment', () => {
    const result = fragment(500, 1500);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(500);
  });

  test('reassembles fragment at exact payload multiple', () => {
    const result = fragment(1960, 1000); // 2 fragments
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(1960);
  });

  test('returns total bytes = sum of all fragment data lengths', () => {
    const result = fragment(4000, 1500);
    const reassembled = reassemble(result.fragments);
    const sumDataLengths = result.fragments.reduce((s, f) => s + f.dataLength, 0);
    expect(reassembled.totalBytes).toBe(sumDataLengths);
  });

  test('fragments maintain correct byte order', () => {
    const result = fragment(3000, 1000);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.fragments[0].dataStart).toBe(0);
    expect(reassembled.fragments[1].dataStart).toBeLessThan(reassembled.fragments[2].dataStart);
  });

  test('final fragment has mf = false', () => {
    const result = fragment(3000, 1000);
    const reassembled = reassemble(result.fragments);
    const last = reassembled.fragments[reassembled.fragments.length - 1];
    expect(last.mf).toBe(false);
  });

  test('edge: minimum size datagram', () => {
    const result = fragment(100, 1500);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(100);
  });

  test('edge: MTU = 68 (minimum)', () => {
    const result = fragment(200, 68);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(200);
  });

  test('returns structured progress for animation', () => {
    const result = fragment(3000, 1000);
    const reassembled = reassemble(result.fragments);
    // Should provide "merge steps" for animation
    expect(Array.isArray(reassembled.mergeSteps)).toBe(true);
    expect(reassembled.mergeSteps.length).toBe(result.totalFragments);
    // Each step shows cumulative size after merging that fragment
    reassembled.mergeSteps.forEach((step, i) => {
      expect(typeof step.cumulativeBytes).toBe('number');
      expect(typeof step.fragmentIndex).toBe('number');
      expect(typeof step.description).toBe('string');
    });
  });
});
```

- [ ] **Step 7: Run reassemble tests to confirm they fail**

Run: `npx jest tests/utils/ip-reassemble.test.js --no-coverage`

Expected: FAIL — `Cannot find module 'ip-reassemble'` or function not defined.

- [ ] **Step 8: Implement reassemble()**

```js
// utils/ip-reassemble.js

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
  const sorted = [...fragments].sort((a, b) => a.offset - b.offset);

  // Verify no gaps (simplified — real implementation would check offset continuity)
  const totalBytes = sorted.reduce((sum, f) => sum + f.dataLength, 0);

  // Build merge steps for animation (reverse order: last fragment first)
  const mergeSteps = [];
  const reversed = [...sorted].reverse();
  let cumulativeBytes = 0;
  for (const f of reversed) {
    cumulativeBytes += f.dataLength;
    mergeSteps.push({
      fragmentIndex: f.index,
      cumulativeBytes,
      description: `合并分片 ${f.index}（字节 ${f.dataStart}~${f.dataEnd}，` +
        `${f.dataLength} 字节）→ 累计 ${cumulativeBytes}/${totalBytes} 字节`
    });
  }

  return {
    success: true,
    totalBytes,
    totalFragments: sorted.length,
    fragments: sorted,
    mergeSteps: mergeSteps.reverse() // Return in forward order for forward animation
  };
}

module.exports = { reassemble };
```

- [ ] **Step 9: Run reassemble tests to verify they pass**

Run: `npx jest tests/utils/ip-reassemble.test.js --no-coverage`

Expected: PASS (all tests including `mergeSteps`)

- [ ] **Step 10: Commit reassemble implementation**

```bash
git add utils/ip-reassemble.js tests/utils/ip-reassemble.test.js
git commit -m "feat: IP 分片重组算法实现 + 测试"
```

- [ ] **Step 11: Run all utility tests**

Run: `npx jest tests/utils/ip-fragment.test.js tests/utils/ip-reassemble.test.js --no-coverage`

Expected: All PASS

- [ ] **Step 12: Run full test suite to ensure no regressions**

Run: `npm test`

Expected: All tests PASS (no regressions)

---
### Task 2: 页面骨架 — WXML + WXSS + JSON

**Files:**
- Create: `pages/ip-fragment/ip-fragment.wxml`
- Create: `pages/ip-fragment/ip-fragment.wxss`
- Create: `pages/ip-fragment/ip-fragment.json`

**Layout Sections (top to bottom):**
1. `config-band` — 双滑块（报文大小 + MTU）+ 实时参数（头部长度、每片载荷）
2. `action-band` — 「分片」和「重组回放」两个按钮
3. `viz-band` — 原始报文可视化 + 分片列表（每片卡片显示字段）
4. `calc-band` — 可折叠偏移量计算过程面板
5. `summary-band` — 关键字段小结（ID、Flags）
6. `ctrl-band` — 步进控制

- [ ] **Step 1: Create ip-fragment.json**

```json
{
  "navigationBarTitleText": "IP 分片可视化",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#faf9f5"
}
```

- [ ] **Step 2: Create ip-fragment.wxml**

```xml
<view class="page">
  <!-- 配置区 -->
  <view class="config-band">
    <text class="band-label">IP 分片可视化</text>

    <!-- 报文大小滑块 -->
    <view class="slider-row">
      <text class="slider-label">报文大小</text>
      <slider class="warm-slider" min="100" max="10000" value="{{datagramSize}}" step="100" bindchanging="onSizeSliding" bindchange="onSizeChange" backgroundColor="#e6dfd8" activeColor="#cc785c" block-size="16" />
      <text class="slider-value">{{datagramSize}} 字节</text>
    </view>

    <!-- MTU 滑块 -->
    <view class="slider-row">
      <text class="slider-label">MTU</text>
      <slider class="warm-slider" min="68" max="2000" value="{{mtu}}" step="50" bindchanging="onMtuSliding" bindchange="onMtuChange" backgroundColor="#e6dfd8" activeColor="#cc785c" block-size="16" />
      <text class="slider-value">{{mtu}} 字节</text>
    </view>

    <!-- 实时参数 -->
    <view class="params-row">
      <view class="param-chip">
        <text class="param-label">IP 头部</text>
        <text class="param-value">{{headerSize}} 字节</text>
      </view>
      <view class="param-chip">
        <text class="param-label">每片载荷</text>
        <text class="param-value">{{payloadPerFragment}} 字节</text>
      </view>
      <view class="param-chip">
        <text class="param-label">总分片数</text>
        <text class="param-value">{{totalFragments}}</text>
      </view>
    </view>
  </view>

  <!-- 操作按钮 -->
  <view class="action-band">
    <button class="btn-primary" bindtap="onFragmentTap" hover-class="btn-hover">▶ 分片</button>
    <button class="btn-primary" bindtap="onReassembleTap" hover-class="btn-hover" disabled="{{!hasFragments}}">↺ 重组回放</button>
    <button class="btn-secondary" bindtap="onResetTap" hover-class="btn-hover">重置</button>
  </view>

  <!-- 提示信息 -->
  <text wx:if="{{infoMessage}}" class="info-text">{{infoMessage}}</text>
  <text wx:if="{{errorMessage}}" class="error-text">{{errorMessage}}</text>

  <!-- ===== 原始报文可视化 ===== -->
  <view class="viz-band" wx:if="{{fragments.length > 0}}">
    <text class="section-title">原始报文（{{totalBytes}} 字节）</text>
    <view class="datagram-bar">
      <view class="datagram-fill" style="width: 100%;"></view>
    </view>

    <!-- 分片列表 -->
    <text class="section-title">分片列表（{{totalFragments}} 片）</text>
    <view class="fragment-list">
      <view wx:for="{{fragments}}" wx:key="index" class="fragment-card {{item.isHighlight ? 'fragment-highlight' : ''}}">
        <view class="fragment-header">
          <text class="fragment-index">分片 {{item.index}}</text>
          <text class="fragment-range">{{item.dataStart}}..{{item.dataEnd}}</text>
        </view>
        <view class="fragment-fields">
          <view class="field-row">
            <text class="field-label">ID</text>
            <text class="field-value mono">{{item.id}}</text>
          </view>
          <view class="field-row">
            <text class="field-label">MF</text>
            <text class="field-value {{item.mf ? 'flag-on' : 'flag-off'}}">{{item.mf ? '1（还有）' : '0（最后）'}}</text>
          </view>
          <view class="field-row">
            <text class="field-label">片偏移</text>
            <text class="field-value mono">{{item.offset}}（{{item.offsetBytes}} 字节）</text>
          </view>
          <view class="field-row">
            <text class="field-label">数据长度</text>
            <text class="field-value">{{item.dataLength}} 字节</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- ===== 偏移量计算过程（可折叠） ===== -->
  <view class="calc-band" wx:if="{{fragments.length > 0}}">
    <view class="calc-header" bindtap="onToggleCalc">
      <text class="section-title">偏移量计算过程</text>
      <text class="calc-toggle">{{showCalc ? '▲' : '▼'}}</text>
    </view>
    <view wx:if="{{showCalc}}" class="calc-body">
      <text class="calc-note">每片可携带最多 {{payloadPerFragment}} 字节（MTU {{mtu}} - IP 头 {{headerSize}}）</text>
      <view wx:for="{{fragments}}" wx:key="index" class="calc-line">
        <text class="calc-line-text">分片 {{item.index}}：字节 {{item.dataStart}}~{{item.dataEnd}} → 偏移 {{item.offset}}（{{item.dataStart}} / 8）</text>
      </view>
    </view>
  </view>

  <!-- ===== 关键字段小结 ===== -->
  <view class="summary-band" wx:if="{{fragments.length > 0}}">
    <text class="section-title">关键字段</text>
    <view class="summary-grid">
      <view class="summary-item">
        <text class="summary-label">标识符 (ID)</text>
        <text class="summary-value mono">{{fragmentId}}</text>
        <text class="summary-note">同一报文所有分片相同</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">标志 (Flags)</text>
        <text class="summary-value">MF = {{mfSummary}}</text>
        <text class="summary-note">1=还有分片 / 0=最后分片</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">片偏移</text>
        <text class="summary-value">= 起始字节 ÷ 8</text>
        <text class="summary-note">8 字节对齐</text>
      </view>
    </view>
  </view>

  <!-- ===== 重组动画区 ===== -->
  <view class="reassemble-band" wx:if="{{mergeSteps.length > 0}}">
    <text class="section-title">重组过程</text>

    <!-- 进度条 -->
    <view class="reassemble-progress">
      <progress percent="{{reassemblePercent}}" stroke-width="6" color="#cc785c" backgroundColor="#e6dfd8" />
    </view>

    <!-- 当前合并步骤详情 -->
    <view wx:if="{{currentMergeStep !== null}}" class="merge-step-detail">
      <text class="merge-step-text">{{currentMergeStep.description}}</text>
    </view>

    <!-- 最终结果 -->
    <view wx:if="{{reassembleComplete}}" class="reassemble-result">
      <text class="result-label">重组完成</text>
      <text class="result-value">{{totalBytes}} 字节 → 完整数据报</text>
    </view>
  </view>

  <!-- 空状态 -->
  <view class="empty-band" wx:if="{{fragments.length === 0 && !errorMessage}}">
    <text class="empty-text">调整参数后点击「分片」按钮</text>
  </view>

  <!-- 控制栏 -->
  <view class="ctrl-band" wx:if="{{fragments.length > 0}}">
    <view class="ctrl-btn" bindtap="onPrevStep">
      <text class="ctrl-icon">← 上一步</text>
    </view>
    <view class="ctrl-btn ctrl-play {{reassembling ? 'ctrl-active' : ''}}" bindtap="onToggleReassemble">
      <text class="ctrl-icon">{{reassembling ? '暂停' : '▶ 播放'}}</text>
    </view>
    <view class="ctrl-btn" bindtap="onNextStep">
      <text class="ctrl-icon">下一步 →</text>
    </view>
  </view>

</view>
```

- [ ] **Step 3: Create ip-fragment.wxss**

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
  margin-bottom: 20rpx;
}

.section-title {
  display: block;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
  letter-spacing: -2rpx;
  color: #141413;
  margin-bottom: 16rpx;
}

/* ======================== 配置区 ======================== */
.config-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.slider-row:last-child {
  margin-bottom: 0;
}

.slider-label {
  font-size: 24rpx;
  color: #141413;
  flex-shrink: 0;
  width: 120rpx;
}

/* WeChat slider custom styling */
.warm-slider {
  flex: 1;
}

.slider-value {
  font-size: 22rpx;
  color: #6c6a64;
  flex-shrink: 0;
  width: 110rpx;
  text-align: right;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.params-row {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  flex-wrap: wrap;
}

.param-chip {
  background: #faf9f5;
  border-radius: 12rpx;
  padding: 12rpx 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100rpx;
  flex: 1;
}

.param-label {
  font-size: 20rpx;
  color: #6c6a64;
  margin-bottom: 4rpx;
}

.param-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #141413;
  font-family: 'SF Mono', 'Menlo', monospace;
}

/* ======================== 操作按钮 ======================== */
.action-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.btn-primary {
  flex: 1;
  min-width: 150rpx;
  background: #cc785c;
  color: #faf9f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: none;
  text-align: center;
}

.btn-primary:active {
  background: #a9583e;
}

.btn-primary[disabled] {
  background: #d4cfc2;
  color: #8e8b82;
}

.btn-secondary {
  background: #faf9f5;
  color: #141413;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: none;
  min-width: 120rpx;
  text-align: center;
}

.btn-secondary:active {
  background: #e8e0d2;
}

.btn-hover {
  opacity: 0.7;
}

/* ======================== 提示信息 ======================== */
.info-text {
  display: block;
  background: #f5ede2;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #6c6a64;
}

.error-text {
  display: block;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #c0392b;
}

/* ======================== 可视化区 ======================== */
.viz-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.datagram-bar {
  height: 32rpx;
  background: #faf9f5;
  border-radius: 8rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.datagram-fill {
  height: 100%;
  background: #a0b4c8;
  border-radius: 8rpx;
  opacity: 0.6;
}

/* ── 分片列表 ── */
.fragment-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.fragment-card {
  background: #faf9f5;
  border-radius: 16rpx;
  padding: 20rpx;
  transition: all 0.3s ease;
}

.fragment-highlight {
  border: 2rpx solid #cc785c;
  background: #f5ede2;
}

.fragment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  padding-bottom: 10rpx;
  border-bottom: 2rpx solid #e6dfd8;
}

.fragment-index {
  font-family: Georgia, serif;
  font-size: 26rpx;
  font-weight: 600;
  color: #141413;
}

.fragment-range {
  font-size: 22rpx;
  color: #6c6a64;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.fragment-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rpx 16rpx;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.field-label {
  font-size: 22rpx;
  color: #6c6a64;
  flex-shrink: 0;
}

.field-value {
  font-size: 22rpx;
  color: #141413;
}

.mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}

.flag-on {
  color: #cc785c;
  font-weight: 600;
}

.flag-off {
  color: #6c6a64;
}

/* ======================== 偏移量计算面板 ======================== */
.calc-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.calc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calc-toggle {
  font-size: 24rpx;
  color: #6c6a64;
}

.calc-body {
  margin-top: 16rpx;
}

.calc-note {
  display: block;
  font-size: 22rpx;
  color: #6c6a64;
  margin-bottom: 12rpx;
  font-style: italic;
}

.calc-line {
  background: #faf9f5;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 8rpx;
}

.calc-line-text {
  font-size: 22rpx;
  color: #141413;
  font-family: 'SF Mono', 'Menlo', monospace;
  line-height: 1.6;
}

/* ======================== 关键字段小结 ======================== */
.summary-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12rpx;
}

.summary-item {
  background: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 20rpx;
  color: #6c6a64;
  margin-bottom: 6rpx;
}

.summary-value {
  display: block;
  font-size: 24rpx;
  color: #141413;
  margin-bottom: 4rpx;
  font-weight: 600;
}

.summary-note {
  display: block;
  font-size: 18rpx;
  color: #8e8b82;
}

/* ======================== 重组动画区 ======================== */
.reassemble-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.reassemble-progress {
  margin-bottom: 16rpx;
}

.merge-step-detail {
  background: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.merge-step-text {
  font-size: 24rpx;
  color: #141413;
  font-family: 'SF Mono', 'Menlo', monospace;
  line-height: 1.6;
}

.reassemble-result {
  background: #f5ede2;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  border: 2rpx solid #cc785c;
}

.result-label {
  display: block;
  font-size: 22rpx;
  color: #cc785c;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.result-value {
  display: block;
  font-size: 28rpx;
  color: #141413;
  font-family: Georgia, serif;
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
  flex: 1;
  padding: 14rpx 20rpx;
  border-radius: 12rpx;
  background: #faf9f5;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.ctrl-btn:active {
  background: #e8e0d2;
}

.ctrl-play {
  background: #cc785c;
}

.ctrl-play:active {
  background: #a9583e;
}

.ctrl-active {
  background: #a9583e;
}

.ctrl-play .ctrl-icon {
  color: #faf9f5;
}

.ctrl-icon {
  font-size: 24rpx;
  color: #141413;
}
```

- [ ] **Step 4: Commit page skeleton**

```bash
git add pages/ip-fragment/
git commit -m "feat: IP 分片页面骨架（WXML+WXSS+JSON）"
```

---
### Task 3: 页面逻辑 — JS

**Files:**
- Create: `pages/ip-fragment/ip-fragment.js`

**Interfaces:**
- Consumes: `utils/ip-fragment.js` exports (fragment, randomId)
- Consumes: `utils/ip-reassemble.js` exports (reassemble)
- Produces: Page object with data, lifecycle, and event handlers

**Data Model:**
```js
data: {
  datagramSize: 1500,      // 报文大小（滑块）
  mtu: 1500,               // MTU（滑块）
  headerSize: 20,          // IP 头部固定 20
  payloadPerFragment: 0,   // 当前 MTU 下每片最大载荷
  totalFragments: 0,       // 根据当前参数预估分片数

  fragments: [],           // 分片结果
  fragmentId: '',          // 标识符字符串
  mfSummary: '',           // 标志位说明
  infoMessage: '',         // 提示信息
  errorMessage: '',        // 错误信息
  hasFragments: false,     // 是否有分片结果

  // 计算面板
  showCalc: false,

  // 重组动画
  mergeSteps: [],
  reassembling: false,
  reassemblePercent: 0,
  currentMergeStep: null,
  reassembleComplete: false,
  currentReassembleIdx: -1
}
```

- [ ] **Step 1: Create ip-fragment.js**

```js
const { fragment, randomId } = require('../../utils/ip-fragment');
const { reassemble } = require('../../utils/ip-reassemble');

const IP_HEADER = 20;
const SLIDER_DEBOUNCE_MS = 300;

Page({
  data: {
    datagramSize: 1500,
    mtu: 1500,
    headerSize: IP_HEADER,
    payloadPerFragment: 0,
    totalFragments: 0,

    fragments: [],
    fragmentId: '',
    mfSummary: '',
    infoMessage: '',
    errorMessage: '',
    hasFragments: false,

    showCalc: false,

    mergeSteps: [],
    reassembling: false,
    reassemblePercent: 0,
    currentMergeStep: null,
    reassembleComplete: false,
    currentReassembleIdx: -1
  },

  _debounceTimer: null,
  _animTimer: null,

  onLoad() {
    this._updateParams();
  },

  onUnload() {
    this._stopAnim();
  },

  // ── 参数更新 ──

  _updateParams() {
    const mtu = this.data.mtu;
    const payload = mtu - IP_HEADER;
    const estFragments = Math.ceil(this.data.datagramSize / payload);
    this.setData({
      payloadPerFragment: payload,
      totalFragments: estFragments,
      infoMessage: this.data.datagramSize <= mtu
        ? '报文未超过 MTU，无需分片'
        : ''
    });
  },

  // ── 滑块事件（带防抖） ──

  onSizeSliding(e) {
    // Live preview without triggering computation
    this.setData({ datagramSize: Number(e.detail.value) });
  },

  onSizeChange(e) {
    this.setData({ datagramSize: Number(e.detail.value) });
    this._debounceUpdate();
  },

  onMtuSliding(e) {
    this.setData({ mtu: Number(e.detail.value) });
  },

  onMtuChange(e) {
    this.setData({ mtu: Number(e.detail.value) });
    this._debounceUpdate();
  },

  _debounceUpdate() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._updateParams();
      this._debounceTimer = null;
    }, SLIDER_DEBOUNCE_MS);
  },

  // ── 核心操作 ──

  onFragmentTap() {
    this._stopAnim();
    const result = fragment(this.data.datagramSize, this.data.mtu);

    const id = result.id;
    const mfSummary = result.fragments
      .map(f => f.mf ? '1' : '0')
      .join(' → ');

    this.setData({
      fragments: result.fragments,
      totalBytes: result.totalBytes,
      fragmentId: id,
      mfSummary,
      hasFragments: true,
      showCalc: false,
      mergeSteps: [],
      reassembling: false,
      reassemblePercent: 0,
      currentMergeStep: null,
      reassembleComplete: false,
      currentReassembleIdx: -1,
      infoMessage: result.totalFragments === 1
        ? '无需分片（报文不超过 MTU）'
        : '',
      errorMessage: ''
    });

    this._updateParams();
  },

  onReassembleTap() {
    if (this.data.fragments.length === 0) return;

    this._stopAnim();
    const assembled = reassemble(this.data.fragments);

    this.setData({
      mergeSteps: assembled.mergeSteps,
      reassembling: false,
      reassemblePercent: 0,
      currentMergeStep: null,
      reassembleComplete: false,
      currentReassembleIdx: -1
    });
  },

  onToggleCalc() {
    this.setData({ showCalc: !this.data.showCalc });
  },

  // ── 重组动画 ──

  onToggleReassemble() {
    if (this.data.mergeSteps.length === 0) {
      this.onReassembleTap();
      if (this.data.mergeSteps.length === 0) return;
    }

    if (this.data.reassembling) {
      this._stopAnim();
      this.setData({ reassembling: false });
      return;
    }

    // If already complete, reset
    if (this.data.reassembleComplete) {
      this.setData({
        reassemblePercent: 0,
        currentMergeStep: null,
        reassembleComplete: false,
        currentReassembleIdx: -1
      });
    }

    this.setData({ reassembling: true });
    const delayMs = 800;
    this._animTimer = setInterval(() => {
      let idx = this.data.currentReassembleIdx;
      if (idx === null || idx < 0) {
        idx = 0;
      } else {
        idx = idx + 1;
      }

      if (idx >= this.data.mergeSteps.length) {
        this._stopAnim();
        this.setData({
          reassembling: false,
          reassembleComplete: true,
          reassemblePercent: 100
        });
        return;
      }

      const step = this.data.mergeSteps[idx];
      const percent = Math.round(((idx + 1) / this.data.mergeSteps.length) * 100);
      this.setData({
        currentReassembleIdx: idx,
        currentMergeStep: step,
        reassemblePercent: percent
      });
    }, delayMs);
  },

  onPrevStep() {
    if (this.data.mergeSteps.length === 0) return;
    let idx = this.data.currentReassembleIdx;
    if (idx === null || idx < 0) {
      idx = 0;
    }
    const prevIdx = Math.max(0, idx - 1);
    const step = this.data.mergeSteps[prevIdx];
    const percent = Math.round(((prevIdx + 1) / this.data.mergeSteps.length) * 100);
    this.setData({
      currentReassembleIdx: prevIdx,
      currentMergeStep: step,
      reassemblePercent: percent,
      reassembleComplete: prevIdx === this.data.mergeSteps.length - 1
    });
  },

  onNextStep() {
    if (this.data.mergeSteps.length === 0) return;
    let idx = this.data.currentReassembleIdx;
    if (idx === null || idx < 0) {
      idx = -1;
    }
    const nextIdx = idx + 1;
    if (nextIdx >= this.data.mergeSteps.length) {
      this.setData({
        reassembleComplete: true,
        reassemblePercent: 100
      });
      return;
    }
    const step = this.data.mergeSteps[nextIdx];
    const percent = Math.round(((nextIdx + 1) / this.data.mergeSteps.length) * 100);
    this.setData({
      currentReassembleIdx: nextIdx,
      currentMergeStep: step,
      reassemblePercent: percent
    });
  },

  onResetTap() {
    this._stopAnim();
    this.setData({
      fragments: [],
      fragmentId: '',
      mfSummary: '',
      hasFragments: false,
      showCalc: false,
      mergeSteps: [],
      reassembling: false,
      reassemblePercent: 0,
      currentMergeStep: null,
      reassembleComplete: false,
      currentReassembleIdx: -1,
      infoMessage: '',
      errorMessage: ''
    });
    this._updateParams();
  },

  _stopAnim() {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
  }
});
```

- [ ] **Step 2: Commit page JS**

```bash
git add pages/ip-fragment/ip-fragment.js
git commit -m "feat: IP 分片页面逻辑（滑块/分片计算/重组动画/控制）"
```

- [ ] **Step 3: Run full test suite to ensure no regressions**

Run: `npm test`

Expected: All tests PASS

---
### Task 4: 注册上线 & Handoff

**Files:**
- Modify: `utils/tool-registry.js` — update `ip-fragment` entry: `available: false` → `true`, add detail fields
- Modify: `app.json` — add `"pages/ip-fragment/ip-fragment"` to main `pages` array
- Modify: `tests/utils/tool-registry.test.js` — update expected tool count and add ip-fragment assertion
- Create: `docs/handoff/modules/ip-fragment.md`
- Maybe modify: `docs/superpowers/specs/README.md` — move ip-fragment to 已实现 (if such file exists)

**Key Actions:**

- [ ] **Step 1: Update tool-registry.js**

The `ip-fragment` entry already exists in `TOOLS` array with `available: false`. Change:
1. `available: false` → `true`
2. Add `tagline`, `taglineDetail`, `intro`, `tags`, `difficulty` fields to match existing pattern

Updated entry:
```js
{
  id: 'ip-fragment',
  category: 'network',
  name: 'IP 分片可视化',
  icon: '',
  description: '分片过程 · MTU · 偏移量计算',
  route: '/pages/ip-fragment/ip-fragment',
  available: true,
  featured: false,
  tagline: '调整报文大小和 MTU，看 IP 层怎么切分和重组数据报',
  taglineDetail: '双滑块调整报文大小和 MTU，自动计算分片列表（ID/MF/偏移量），可折叠展示偏移量计算过程，从最后一片开始逐步回放重组过程',
  tags: ['#可视化', '#交互式'],
  difficulty: 'medium',
  intro: {
    valueProp: '拖到滑块调参数，看 IP 层怎么把大报文切成小片、接收端又怎么拼回来。',
    features: [
      '双滑块调节报文大小和 MTU，实时显示头部/载荷/分片数',
      '分片列表逐片展示 ID、MF 标志、片偏移、数据范围',
      '偏移量计算过程可折叠展开',
      '自后向前逐步回放重组动画'
    ],
    prerequisites: '了解 IP 协议的基本概念（头部、MTU）。',
    useCases: [
      '计网课程 IP 协议章节',
      '理解片偏移的 8 字节对齐规则',
      '面试前复习分片与重组机制'
    ]
  },
  order: 6
}
```

- [ ] **Step 2: Update app.json — add ip-fragment to pages array**

Add `"pages/ip-fragment/ip-fragment"` to the main `pages` array (not subPackages), after `"pages/tools-all/tools-all"`:

```json
"pages": [
  "pages/index/index",
  "pages/quiz-list/quiz-list",
  "pages/import-preview/import-preview",
  "pages/quiz/quiz",
  "pages/result/result",
  "pages/records/records",
  "pages/record-detail/record-detail",
  "pages/wrong-questions/wrong-questions",
  "pages/dashboard/dashboard",
  "pages/tools-all/tools-all",
  "pages/ip-fragment/ip-fragment"
]
```

- [ ] **Step 3: Update tool-registry test**

In `tests/utils/tool-registry.test.js`:
- Update the count from 12 to 13 in the "返回当前已实现的 12 个工具" test
- Add `expect(ids).toContain('ip-fragment');`

```js
test('返回当前已实现的 13 个工具', () => {
  let result = getAvailableTools();
  expect(result.length).toBe(13);
  let ids = result.map(function(t) { return t.id; });
  expect(ids).toContain('subnet-calc');
  // ... existing assertions ...
  expect(ids).toContain('ip-fragment');
});
```

- [ ] **Step 4: Run full test suite to verify**

Run: `npm test`

Expected: All tests PASS. Tool registry test should now expect 13 instead of 12.

- [ ] **Step 5: Create handoff document**

Create `docs/handoff/modules/ip-fragment.md`:

```markdown
# IP 分片可视化 — 模块文档

**上线日期:** 2026-07-22

## 概述

IP 分片与重组的可视化教学工具，展示 IP 层如何将超大数据报切分为多个分片（标识符、标志位、片偏移三字段的变化），以及接收端如何根据分片偏移重组。

## 页面

`pages/ip-fragment/ip-fragment`

## 核心逻辑

| 文件 | 说明 |
|---|---|
| `utils/ip-fragment.js` | `fragment(datagramSize, mtu)` — 分片计算，返回分片列表含 ID/MF/偏移 |
| `utils/ip-reassemble.js` | `reassemble(fragments)` — 重组逻辑，返回合并动画步骤 |

## 交互

- 双滑块调节报文大小（100~65535）和 MTU（68~2000）
- 实时参数展示：IP 头部 20 字节 / 每片载荷 / 预估分片数
- 「分片」按钮触发计算，展示分片列表
- 可折叠面板展示偏移量计算过程
- 「重组回放」自最后一片开始逐步合并动画
- 手动步进 / 自动播放控制

## 数据约束

- 报文大小 clamp 到 65535
- MTU clamp 到 68（IPv4 最小 MTU）
- 片偏移 = 起始字节 ÷ 8（8 字节对齐）
- IP 头部固定 20 字节

## 测试

`tests/utils/ip-fragment.test.js` — 边界值、偏移量对齐、MF 标志正确性
`tests/utils/ip-reassemble.test.js` — 重组完整性、合并步骤正确性
```

- [ ] **Step 6: Commit registration & handoff**

```bash
git add utils/tool-registry.js app.json tests/utils/tool-registry.test.js docs/handoff/modules/ip-fragment.md
git commit -m "feat: IP 分片可视化上线（注册 + handoff）"
```

- [ ] **Step 7: Run final full test suite**

Run: `npm test`

Expected: All 730+ tests PASS

---
## 自检清单

**1. Spec 覆盖：**
- [ ] 自定义原始报文大小滑块（100~65535）→ Task 3（`onSizeChange` / `onSizeSliding`）
- [ ] 自定义 MTU 滑块（68~2000）→ Task 3（`onMtuChange` / `onMtuSliding`）
- [ ] 实时参数：头部 / 每片载荷 / 分片数 → Task 2 & 3（`params-row` + `_updateParams`）
- [ ] 分片列表：ID / MF / 偏移 / 数据长度 / 数据范围 → Task 2（`fragment-card`）
- [ ] 偏移量计算过程（可折叠面板）→ Task 2 & 3（`calc-band` + `onToggleCalc`）
- [ ] 重组回放动画（自最后一片开始合并）→ Task 3（`onToggleReassemble` + `mergeSteps`）
- [ ] 边界值测试（MTU=68 / 数据≤MTU / 整数倍）→ Task 1（`ip-fragment.test.js`）
- [ ] 错误处理（clamp、无需分片提示、防抖）→ Task 1 & 3
- [ ] 纯函数 + 不可变 → Task 1（全部无副作用）

**2. 占位符检查：** 全部代码块包含完整实现，无 TBD / TODO / "后续实现" 占位。

**3. 类型一致性：** Task 1 定义的 `fragment(datagramSize, mtu)` 签名在 Task 3 的 `onFragmentTap` 中一致使用。`reassemble(fragments)` 返回 `{ mergeSteps: MergeStep[] }` 在 Task 3 的动画控制中正确消费。

**4. 路由一致性：** `tool-registry.js` 中原有 route `/pages/ip-fragment/ip-fragment` 与文件系统 `pages/ip-fragment/` 匹配，无需修改 route 字段。
