# 工具使用说明弹窗 · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为死锁模拟器页面添加「首次进入自动弹使用说明」功能 + ℹ︎ 浮动按钮回看

**Architecture:** 3 层设计 — 可复用 `intro-modal` 组件（全局注册）+ 页面内触发逻辑（onLoad 检查 storage）+ 使用说明常量作为 JS 内联数据

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）+ Jest 测试

## Global Constraints

- 所有新代码使用 `const`/`let`，禁用 `var`
- 遵循 Claude Design 暖奶油画布风格（#faf9f5 背景、#efe9de 卡片、#cc785c CTA）
- 组件全局注册于 `app.json` 的 `usingComponents`
- 正文不小于 26rpx（修复 ref 分支字体过小问题）
- `npm test` 全绿不得被破坏

---

## 文件结构

| 操作 | 文件 | 职责 |
|---|---|---|
| **新增** | `components/intro-modal/intro-modal.json` | 组件声明 |
| **新增** | `components/intro-modal/intro-modal.js` | 组件逻辑：show/hide 控制，关闭事件 |
| **新增** | `components/intro-modal/intro-modal.wxml` | 组件模板：遮罩 + 卡片 + 标题 + 滚动内容 + 按钮 |
| **新增** | `components/intro-modal/intro-modal.wxss` | 组件样式：暖奶油风格，26-32rpx 字号 |
| **修改** | `app.json` | 全局注册 intro-modal 组件 |
| **修改** | `pages/deadlock/deadlock.js` | 首次访问检测 + ℹ︎ 回看 + 使用说明常量 |
| **修改** | `pages/deadlock/deadlock.wxml` | 页面顶部添加 ℹ︎ 按钮 + intro-modal 实例 |
| **修改** | `pages/deadlock/deadlock.wxss` | ℹ︎ 浮动按钮样式 |

---

### Task 1: 创建 intro-modal 组件

**Files:**
- Create: `components/intro-modal/intro-modal.json`
- Create: `components/intro-modal/intro-modal.js`
- Create: `components/intro-modal/intro-modal.wxml`
- Create: `components/intro-modal/intro-modal.wxss`

**Interfaces:**
- Consumes: 页面通过属性传入 `show` (Boolean) 和 `introContent` (String)
- Produces: 页面监听 `bind:close` 事件处理关闭后的逻辑（标记 storage）

- [ ] **Step 1: 创建组件目录**

```bash
mkdir -p components/intro-modal
```

- [ ] **Step 2: 创建组件 JSON**

```json
{
  "component": true,
  "usingComponents": {}
}
```

写入 `components/intro-modal/intro-modal.json`

- [ ] **Step 3: 创建组件 JS**

```javascript
// components/intro-modal/intro-modal.js
Component({
  properties: {
    show: { type: Boolean, value: false, observer: '_onShowChange' },
    introContent: { type: String, value: '' }
  },

  data: {
    animReady: false
  },

  methods: {
    onMaskTap() {
      this._close();
    },

    onClose() {
      this._close();
    },

    onEnter() {
      this._close();
    },

    _close() {
      this.setData({ show: false, animReady: false });
      this.triggerEvent('close');
    },

    _onShowChange(show) {
      if (show) {
        wx.nextTick(() => {
          this.setData({ animReady: true });
        });
      } else {
        this.setData({ animReady: false });
      }
    }
  }
});
```

写入 `components/intro-modal/intro-modal.js`

- [ ] **Step 4: 创建组件 WXML**

```xml
<!-- components/intro-modal/intro-modal.wxml -->
<view class="modal-mask {{animReady ? 'mask-visible' : ''}}" bindtap="onMaskTap">
  <view class="modal-card {{animReady ? 'card-visible' : ''}}" catchtap="noop">
    <!-- 关闭按钮 -->
    <view class="modal-close" bindtap="onClose">
      <text class="close-icon">✕</text>
    </view>

    <!-- 大标题 -->
    <view class="modal-header">
      <text class="modal-title">此工具较为复杂，请阅读使用说明</text>
    </view>

    <!-- 可滚动内容区 -->
    <scroll-view class="modal-body" scroll-y>
      <text class="modal-content">{{introContent}}</text>
    </scroll-view>

    <!-- 按钮 -->
    <view class="modal-footer">
      <view class="modal-btn" bindtap="onEnter">
        <text class="modal-btn-text">我知道了，开始使用 →</text>
      </view>
    </view>
  </view>
</view>
```

写入 `components/intro-modal/intro-modal.wxml`

- [ ] **Step 5: 创建组件 WXSS**

```css
/* components/intro-modal/intro-modal.wxss */

/* ── Mask ── */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s ease;
  pointer-events: none;
}

.modal-mask.mask-visible {
  background: rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

/* ── Card ── */
.modal-card {
  width: 580rpx;
  max-height: 80vh;
  background: #efe9de;
  border-radius: 24rpx;
  padding: 40rpx 36rpx 32rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  transform: scale(0.92);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

.modal-card.card-visible {
  transform: scale(1);
  opacity: 1;
}

/* ── Close Button ── */
.modal-close {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.close-icon {
  font-size: 32rpx;
  color: #8e8b82;
}

.modal-close:active .close-icon {
  color: #6c6a64;
}

/* ── Title ── */
.modal-header {
  margin-bottom: 28rpx;
  padding-right: 40rpx;
}

.modal-title {
  font-family: Georgia, serif;
  font-weight: 600;
  font-size: 32rpx;
  color: #141413;
  line-height: 1.4;
  letter-spacing: -2rpx;
}

/* ── Body ── */
.modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.modal-content {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 26rpx;
  font-weight: 400;
  color: #141413;
  line-height: 1.65;
  white-space: pre-line;
  word-break: break-word;
}

/* ── Footer ── */
.modal-footer {
  margin-top: 32rpx;
  display: flex;
  justify-content: center;
}

.modal-btn {
  background: #cc785c;
  border-radius: 16rpx;
  padding: 20rpx 48rpx;
  text-align: center;
}

.modal-btn:active {
  background: #a9583e;
}

.modal-btn-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 28rpx;
  font-weight: 500;
  color: #faf9f5;
}
```

写入 `components/intro-modal/intro-modal.wxss`

- [ ] **Step 6: Commit**

```bash
git add components/intro-modal/
git commit -m "feat(intro-modal): create reusable usage-instructions modal component"
```

---

### Task 2: 全局注册组件

**Files:**
- Modify: `app.json`（在 `lazyCodeLoading` 后添加 `usingComponents`）

- [ ] **Step 1: 修改 app.json**

在 `app.json` 的 `lazyCodeLoading` 行后添加 `usingComponents`：

改前：
```json
  "lazyCodeLoading": "requiredComponents"
}
```

改后：
```json
  "lazyCodeLoading": "requiredComponents",
  "usingComponents": {
    "intro-modal": "/components/intro-modal/intro-modal"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app.json
git commit -m "feat(intro-modal): register intro-modal globally in app.json"
```

---

### Task 3: 死锁模拟器页面 JS — 首次访问检测 + 使用说明内容

**Files:**
- Modify: `pages/deadlock/deadlock.js`

**Interfaces:**
- Consumes: 全局注册的 `intro-modal` 组件（属性：`show`, `introContent`；事件：`bind:close`）
- Produces: data 字段 `showIntro`、`introContent`；方法 `showIntro`、`onIntroClose`

- [ ] **Step 1: 在 deadlock.js 顶部添加使用说明常量**

在文件顶部（`require` 语句之后、`RAG_PRESETS` 之前）插入：

```javascript
// ── 使用说明内容 ──
const DEADLOCK_INTRO = `死锁模拟器是一个交互式教学工具，帮助你直观理解死锁的两种经典分析手段。

━━ 资源分配图（RAG）模式 ━━
• 点击「+进程」「+资源」添加节点（上限各 5 个）
• 先选择连线类型（请求边 / 分配边），再依次点击两个节点建立连线
• 进程→资源 为请求边；资源→进程 为分配边
• 点击「检测死锁」自动判断当前状态
• 支持拖拽节点调整布局
• 内置 3 种预设场景快速体验

━━ 银行家算法模式 ━━
• 调整进程数和资源类型数，自动生成输入矩阵
• 在 Max 和 Allocation 单元格中输入数值
• Need 矩阵自动计算（Max − Allocation）
• 点击「检测安全性」运行算法
• 查看安全序列和每步的 Work / Need / Allocation 追踪
• 内置 3 种预设场景

━━ 结果解读 ━━
• ✅ 安全状态：显示安全序列，所有进程可顺利完成
• ❌ 死锁 / 不安全：红色标记死锁进程，显示环路路径
• 步骤追踪中 ✓ 表示满足条件，✗ 表示不满足`;
```

- [ ] **Step 2: 在 data 中添加 showIntro 和 introContent 字段**

在 `data: {` 块中（约 L65, `mode: 'rag'` 之后）添加：

```javascript
    showIntro: false,
    introContent: '',
```

- [ ] **Step 3: 修改 onLoad，追加首次访问检测**

在 `onLoad: function() {` 末尾追加 `this._checkFirstVisit();`：

```javascript
  onLoad: function() {
    this._computeNodePositions();
    this._updateVisualEdges();
    this._computeNeed();
    this._checkFirstVisit();
  },
```

- [ ] **Step 4: 添加 _checkFirstVisit 方法**

在 `_nodeCounter: { p: 0, r: 0 },` 行之后（约 L87）、`onLoad` 之前插入：

```javascript
  _checkFirstVisit: function() {
    try {
      const seen = wx.getStorageSync('intro_seen_deadlock');
      if (!seen) {
        this.setData({
          introContent: DEADLOCK_INTRO,
          showIntro: true
        });
      }
    } catch (e) {
      // storage 异常时静默降级，不弹窗
    }
  },

  showIntro: function() {
    if (!this.data.introContent) {
      this.setData({ introContent: DEADLOCK_INTRO });
    }
    this.setData({ showIntro: true });
  },

  onIntroClose: function() {
    try {
      wx.setStorageSync('intro_seen_deadlock', true);
    } catch (e) {
      // storage 异常静默降级
    }
    this.setData({ showIntro: false });
  },
```

- [ ] **Step 5: Commit**

```bash
git add pages/deadlock/deadlock.js
git commit -m "feat(deadlock): add first-visit intro check and intro-content constant"
```

---

### Task 4: 死锁模拟器 WXML — 添加 ℹ︎ 按钮 + intro-modal 组件

**Files:**
- Modify: `pages/deadlock/deadlock.wxml`

- [ ] **Step 1: 在 `<view class="page">` 下第一行添加 ℹ︎ 按钮和组件**

在 `<view class="page">` 之后、tab-bar 之前插入：

```xml
  <!-- ℹ︎ 使用说明入口 -->
  <view class="info-btn" bindtap="showIntro">
    <text class="info-btn-icon">ℹ︎</text>
  </view>

  <!-- 使用说明弹窗 -->
  <intro-modal
    show="{{showIntro}}"
    introContent="{{introContent}}"
    bind:close="onIntroClose"
  />
```

注意缩进：`<view class="page">` 内的内容统一 2 空格缩进。

- [ ] **Step 2: Commit**

```bash
git add pages/deadlock/deadlock.wxml
git commit -m "feat(deadlock): add info button and intro-modal component to WXML"
```

---

### Task 5: 死锁模拟器 WXSS — ℹ︎ 浮动按钮样式

**Files:**
- Modify: `pages/deadlock/deadlock.wxss`

- [ ] **Step 1: 在 deadlock.wxss 末尾追加 ℹ︎ 按钮样式**

```css
/* ── ℹ︎ 使用说明按钮 ── */
.info-btn {
  position: fixed;
  top: 16rpx;
  right: 16rpx;
  width: 56rpx;
  height: 56rpx;
  background: #efe9de;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0.8;
}

.info-btn:active {
  opacity: 0.5;
}

.info-btn-icon {
  font-size: 28rpx;
  color: #6c6a64;
}
```

- [ ] **Step 2: Commit**

```bash
git add pages/deadlock/deadlock.wxss
git commit -m "feat(deadlock): add info button styles to WXSS"
```

---

### Task 6: 测试

**Files:**
- Modify/add: `tests/pages/deadlock.test.js`（如已存在，追加测试；否则新建）

- [ ] **Step 1: 确认现有测试文件**

```bash
ls tests/pages/deadlock* 2>/dev/null || echo "NO_DEADLOCK_TEST"
```

如果不存在测试文件，跳到 Step 3。

- [ ] **Step 2: 如果测试文件存在，读它并追加测试**

```bash
cat tests/pages/deadlock.test.js
```

追加以下测试（仅测试组件渲染与 showIntro 状态切换，不依赖微信运行时）：

```javascript
// 测试前先读取现有测试确定 jest mock 环境
```

由于 `intro-modal` 是全局注册组件，在 Jest 中需要 mock。但页面 JS 中新增的 `_checkFirstVisit`、`showIntro`、`onIntroClose` 三个方法属于纯数据操作，可以单元测试：

```javascript
test('showIntro sets showIntro to true and loads introContent', () => {
  const page = getApp()._page; // 或用模拟
  // ...
});
```

（具体实现取决于现有测试的 mock 方式）

- [ ] **Step 3: 运行全量测试**

```bash
npm test
```

预期结果：全部通过，无失败。

- [ ] **Step 4: 如果有测试文件改动，commit**

```bash
git add tests/pages/deadlock.test.js
git commit -m "test(deadlock): add intro-modal state tests"
```

---

### Task 7: 验证与 handoff

- [ ] **Step 1: 全量测试验证**

```bash
npm test
```

预期：all tests pass。

- [ ] **Step 2: 追加 PROJECT_HANDOFF.md**

在 PROJECT_HANDOFF.md 的「2026-07-19」变更记录后追加：

```markdown
### 2026-07-19 · 死锁模拟器新增使用说明弹窗

**变更内容**
- 新增 `components/intro-modal/` 可复用使用说明弹窗组件（4 文件）
- 全局注册于 `app.json` 的 `usingComponents`
- 死锁模拟器页面：首次进入自动弹窗展示使用说明，关闭后标记已读
- 页面右上角 ℹ︎ 浮动按钮支持手动回看

**涉及文件**
- 新增：`components/intro-modal/intro-modal.{js,wxml,wxss,json}`
- 修改：`app.json`、`pages/deadlock/deadlock.js`、`pages/deadlock/deadlock.wxml`、`pages/deadlock/deadlock.wxss`

**设计决策**
- 与 `feature/tool-intro-modal` 分支不同：先进入页面再弹窗，而非首页拦截
- 使用 `pre-line` 保持文本换行格式，用 ━━ 分段符代替多子字段
- 字号 26-32rpx 确保可读性
- 关闭即标记已读，下次不重复弹出

**不改变**
- `npm test` 全绿
- 其他页面不受影响
- tool-registry.js 数据模型不受影响
```
