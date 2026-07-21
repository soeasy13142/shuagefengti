# 死锁模拟器帮助面板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将死锁模拟器帮助从阻断式弹窗 (`intro-modal`) 改为可收起底部参考面板 (`tool-help-panel`) + 操作区微标注

**Architecture:** 新建 `tool-help-panel` 通用组件（内容数据驱动 + mode 自动匹配），集成到死锁页替换 `intro-modal`；同时更新空态引导文案和预设按钮标注

**Tech Stack:** 微信小程序原生组件（WXML/WXSS/JS），无新依赖

## 全局约束

- 页面底色 `#faf9f5`，卡片底色 `#efe9de`，主色 CTA `#cc785c`
- 正文 `#141413`，次要文字 `#6c6a64`，分割线 `#ddd7cc`
- 纯 CSS transition 动画，无第三方动画库
- 组件为可复用，但首次仅为死锁页面服务

---

### Task 1: 创建 tool-help-panel 组件（4 文件）

**文件：**
- Create: `components/tool-help-panel/tool-help-panel.json`
- Create: `components/tool-help-panel/tool-help-panel.js`
- Create: `components/tool-help-panel/tool-help-panel.wxml`
- Create: `components/tool-help-panel/tool-help-panel.wxss`

**接口：**
- Consumes: 无
- Produces: `<tool-help-panel>` 组件（properties: content/activeMode/visible; events: toggle/close）

- [ ] **Step 1: 创建组件声明**

`components/tool-help-panel/tool-help-panel.json`:
```json
{
  "component": true,
  "usingComponents": {}
}
```

- [ ] **Step 2: 创建组件 JS——属性、事件、模式匹配逻辑**

`components/tool-help-panel/tool-help-panel.js`:
```js
// components/tool-help-panel/tool-help-panel.js
Component({
  properties: {
    content: { type: Array, value: [] },
    activeMode: { type: String, value: '', observer: '_onModeChange' },
    visible: { type: Boolean, value: false }
  },

  data: {
    currentContent: null,
    expansionOpen: false,
    animClass: ''
  },

  methods: {
    _onModeChange() {
      const match = (this.data.content || []).find(c => c.mode === this.data.activeMode);
      const newContent = match || null;
      if (newContent !== this.data.currentContent) {
        this.setData({ animClass: 'fade-out' });
        const timer = setTimeout(() => {
          this.setData({ currentContent: newContent, expansionOpen: false, animClass: 'fade-in' });
          clearTimeout(timer);
          const timer2 = setTimeout(() => {
            this.setData({ animClass: '' });
            clearTimeout(timer2);
          }, 150);
        }, 150);
      }
    },

    onTriggerTap() {
      const newVisible = !this.data.visible;
      this.setData({ visible: newVisible });
      this.triggerEvent('toggle', { visible: newVisible });
    },

    onToggleExpansion() {
      this.setData({ expansionOpen: !this.data.expansionOpen });
    },

    onMaskTap() {
      if (this.data.visible) {
        this.setData({ visible: false, expansionOpen: false });
        this.triggerEvent('toggle', { visible: false });
        this.triggerEvent('close');
      }
    },

    noop() {}
  },

  lifetimes: {
    attached() {
      this._onModeChange();
    }
  }
});
```

- [ ] **Step 3: 创建组件 WXML**

`components/tool-help-panel/tool-help-panel.wxml`:
```xml
<!-- components/tool-help-panel/tool-help-panel.wxml -->
<!-- 遮罩层 -->
<view class="help-mask {{visible ? 'mask-visible' : ''}}" bindtap="onMaskTap"></view>

<!-- 面板容器 -->
<view class="help-container {{visible ? 'panel-open' : 'panel-closed'}}" catchtap="noop">
  <!-- Trigger 栏 -->
  <view class="help-trigger" bindtap="onTriggerTap">
    <text class="trigger-title">{{currentContent ? currentContent.title : '使用说明'}}</text>
    <text class="trigger-arrow {{visible ? 'arrow-up' : 'arrow-down'}}">▸</text>
  </view>

  <!-- 面板内容 -->
  <view class="help-body {{visible ? 'body-visible' : ''}}">
    <view class="help-content {{animClass}}">
      <!-- 没有内容时的兜底 -->
      <block wx:if="{{!currentContent}}">
        <view class="help-empty">暂无使用说明</view>
      </block>

      <block wx:else>
        <!-- 速查条目 -->
        <view class="help-summary">
          <view class="summary-item" wx:for="{{currentContent.summary}}" wx:key="index" wx:for-item="item">
            <text class="summary-text">{{item}}</text>
          </view>
        </view>

        <!-- 展开/收起切换 -->
        <view class="expansion-toggle" bindtap="onToggleExpansion">
          <view class="expansion-divider"></view>
          <text class="expansion-cta">{{expansionOpen ? '收起完整说明 ▴' : '查看完整说明 →'}}</text>
        </view>

        <!-- 完整说明 -->
        <view class="help-details {{expansionOpen ? 'details-open' : 'details-closed'}}">
          <view class="details-item" wx:for="{{currentContent.details}}" wx:key="index" wx:for-item="item">
            <text class="details-text">{{item}}</text>
          </view>
        </view>
      </block>
    </view>
  </view>
</view>
```

- [ ] **Step 4: 创建组件 WXSS**

`components/tool-help-panel/tool-help-panel.wxss`:
```css
/* components/tool-help-panel/tool-help-panel.wxss */

/* ── 遮罩 ── */
.help-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 99;
  pointer-events: none;
  transition: background 0.25s ease;
}

.help-mask.mask-visible {
  background: rgba(0, 0, 0, 0.08);
  pointer-events: auto;
}

/* ── 面板容器 ── */
.help-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #efe9de;
  border-radius: 24rpx 24rpx 0 0;
  transition: transform 0.3s ease-out;
}

.help-container.panel-closed {
  transform: translateY(calc(100% - 88rpx));
}

.help-container.panel-open {
  transform: translateY(0);
}

/* ── Trigger 栏 ── */
.help-trigger {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  border-top: 2rpx solid #ddd7cc;
  cursor: pointer;
}

.help-trigger:active {
  opacity: 0.6;
}

.trigger-title {
  font-size: 26rpx;
  color: #6c6a64;
}

.trigger-arrow {
  font-size: 20rpx;
  color: #cc785c;
  transition: transform 0.2s ease;
}

.trigger-arrow.arrow-down {
  transform: rotate(90deg);
}

.trigger-arrow.arrow-up {
  transform: rotate(-90deg);
}

/* ── 面板体 ── */
.help-body {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-out;
}

.help-body.body-visible {
  max-height: 800rpx;
}

.help-content {
  padding: 16rpx 24rpx 32rpx;
  transition: opacity 0.15s ease;
}

.help-content.fade-out {
  opacity: 0;
}

.help-content.fade-in {
  opacity: 1;
}

/* ── 空态 ── */
.help-empty {
  text-align: center;
  color: #6c6a64;
  font-size: 26rpx;
  padding: 20rpx 0;
}

/* ── 速查条目 ── */
.help-summary {
  background: #faf9f5;
  border-radius: 16rpx;
  padding: 24rpx;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-text {
  font-size: 26rpx;
  color: #6c6a64;
  line-height: 1.7;
  white-space: pre-line;
}

/* ── 展开/收起 ── */
.expansion-toggle {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
  cursor: pointer;
}

.expansion-toggle:active {
  opacity: 0.6;
}

.expansion-divider {
  flex: 1;
  height: 2rpx;
  background: #ddd7cc;
}

.expansion-cta {
  font-size: 24rpx;
  color: #cc785c;
  white-space: nowrap;
}

/* ── 完整说明 ── */
.help-details {
  background: #faf9f5;
  border-radius: 16rpx;
  padding: 0 24rpx;
  overflow: hidden;
  transition: max-height 0.25s ease, padding 0.25s ease;
}

.help-details.details-closed {
  max-height: 0;
  padding: 0 24rpx;
}

.help-details.details-open {
  max-height: 600rpx;
  padding: 24rpx;
}

.details-item {
  margin-bottom: 10rpx;
}

.details-item:last-child {
  margin-bottom: 0;
}

.details-text {
  font-size: 24rpx;
  color: #6c6a64;
  line-height: 1.6;
  white-space: pre-line;
}
```

- [ ] **Step 5: Commit Task 1**

```bash
git add components/tool-help-panel/
git commit -m "feat: 创建 tool-help-panel 可复用帮助面板组件"
```

---

### Task 2: 死锁页面 JS 改造——替换帮助数据和方法

**文件：**
- Modify: `pages/deadlock/deadlock.js`（全文件内容替换以下段）

**接口：**
- Consumes: `tool-help-panel` 组件（已在 pages/deadlock/deadlock.json 中引用）
- Produces: 页面 data 含 `helpVisible`/`helpContent`，方法 `onHelpTrigger`/`onFirstVisit`/`onHelpToggle`/`onHelpMaskTap`

- [ ] **Step 1: 替换 DEADLOCK_STEPS → HELP_CONTENT**

在 `pages/deadlock/deadlock.js` 中，用以下内容替换 `DEADLOCK_STEPS`（L6-L22）：

```js
// ── 帮助面板内容 ──
const HELP_CONTENT = [
  {
    mode: 'rag',
    title: 'RAG 操作速查',
    summary: [
      '▸ 添加节点：点击 [+进程] 或 [+资源]（各上限 5 个）',
      '▸ 建立连线：选择边类型 → 点起点 → 点终点',
      '▸ 切换边类型：「边: 请求」↔「边: 分配」交替切换',
      '▸ 检测死锁：点击「检测死锁」按钮',
      '▸ 重置/预设：使用「↻ 重置」或内置预设场景'
    ],
    details: [
      '• 请求边需 P→R 方向，分配边需 R→P 方向',
      '• 点击选中节点（高亮环），再次点击取消选中',
      '• 死锁进程会标红 + 红色脉冲光晕',
      '• 检测结果会显示死锁进程名和环路路径',
      '• 图例说明：红虚线=请求边 / 蓝实线=分配边 / 圆=进程 / 方=资源'
    ]
  },
  {
    mode: 'bankers',
    title: '银行家算法操作速查',
    summary: [
      '▸ 调整进程数 / 资源类型数用 ± 按钮',
      '▸ Max / Allocation 矩阵：点击单元格输入数值',
      '▸ Available 向量：点击输入各类型可用实例数',
      '▸ Need 矩阵自动计算（Max − Allocation）',
      '▸ 点击「检查安全状态」运行算法'
    ],
    details: [
      '• 安全状态 = 存在"安全序列"使所有进程可完成',
      '• 不安全 ≠ 死锁 —— 只是可能在未来导致死锁',
      '• 检查过程：逐进程比对 Need ≤ Work',
      '• 步骤追踪：[满足]=绿色边框，[不满足]=红色边框',
      '• 预设场景提供 3 种经典案例'
    ]
  }
];
```

- [ ] **Step 2: 替换 data 中的旧字段**

在 `data: {` 块中（L83-L106），将：
```js
showIntro: false,
introContent: [],
```
替换为：
```js
helpVisible: false,
helpContent: HELP_CONTENT,
```

- [ ] **Step 3: 替换方法——删除旧方法，新增新方法**

删除 L110-L138 的三个方法（`_checkFirstVisit`、`showIntro`、`onIntroClose`），替换为：

```js
  onHelpTrigger: function() {
    this.setData({ helpVisible: !this.data.helpVisible });
  },

  onHelpToggle: function(e) {
    this.setData({ helpVisible: e.detail.visible });
  },

  _checkFirstVisit: function() {
    try {
      const seen = wx.getStorageSync('help_seen_deadlock');
      if (!seen) {
        this.setData({ helpVisible: true });
        const timer = setTimeout(() => {
          this.setData({ helpVisible: false });
          try {
            wx.setStorageSync('help_seen_deadlock', true);
          } catch (e) { /* 静默降级 */ }
          clearTimeout(timer);
        }, 5000);
      }
    } catch (e) {
      // storage 异常静默降级
    }
  },
```

注意：原 `_checkFirstVisit` 方法名保留（用于 `onLoad` 调用），但实现改为非阻断式面板展开 5 秒后自动收回。

- [ ] **Step 4: 预设数据新增 hint 字段**

在 `RAG_PRESETS`（L25-L58）中，每个预设对象新增 `hint` 字段：
```js
{
  name: '安全状态',
  hint: '无环路',
  ...
},
{
  name: '死锁示例',
  hint: '2 进程环路',
  ...
},
{
  name: '三进程循环',
  hint: '3 进程环路',
  ...
}
```

- [ ] **Step 5: Commit Task 2**

```bash
git add pages/deadlock/deadlock.js
git commit -m "refactor(deadlock): 替换帮助面板数据和预设 hint 字段"
```

---

### Task 3: deadlock 页面 WXML/WXSS 改造——替换组件引用 + 微标注

**文件：**
- Modify: `pages/deadlock/deadlock.wxml`
- Modify: `pages/deadlock/deadlock.wxss`

**接口：**
- Consumes: Task 1 的 `tool-help-panel` 组件，Task 2 的 `helpContent`/`helpVisible`/`mode` data

- [ ] **Step 1: 替换 WXML 中的 intro-modal + bottom-help-bar**

替换 `deadlock.wxml` 顶部 8 行：
```xml
  <!-- 使用说明弹窗 -->
  <intro-modal
    show="{{showIntro}}"
    introContent="{{introContent}}"
    bind:close="onIntroClose"
  />
```
替换为：
```xml
  <!-- 帮助面板 -->
  <tool-help-panel
    content="{{helpContent}}"
    activeMode="{{mode}}"
    visible="{{helpVisible}}"
    bind:toggle="onHelpToggle"
  />
```

替换底部 6 行（L230-L235）：
```xml
<!-- 底部帮助栏 -->
<view class="bottom-help-bar" bindtap="showIntro">
  <text class="help-bar-icon">?</text>
  <text class="help-bar-text">使用说明</text>
</view>
```
删掉——trigger 栏已内置在 `tool-help-panel` 组件中。

- [ ] **Step 2: 修改空态提示**

在 `deadlock.wxml` 中，找到 L49-L51 的空态区域：
```xml
<view wx:if="{{rag.processes.length === 0 && rag.resources.length === 0}}" class="canvas-empty">
  点击 [+ 进程] 和 [+ 资源] 开始构建资源分配图
</view>
```
替换为：
```xml
<view wx:if="{{rag.processes.length === 0 && rag.resources.length === 0}}" class="canvas-empty">
  <text class="empty-step">① 点击 [+进程] 添加进程节点</text>
  <text class="empty-step">② 点击 [+资源] 添加资源节点</text>
  <text class="empty-step">③ 选择边类型 → 依次点两个节点建立连线</text>
</view>
```

- [ ] **Step 3: 预设按钮加 hint 标注**

替换 `deadlock.wxml` L19-L21 的预设按钮区域：
```xml
<view class="preset-btn" wx:for="{{presets}}" wx:key="index" bindtap="loadPreset" data-index="{{index}}">{{item.name}}</view>
```
替换为：
```xml
<view class="preset-wrapper" wx:for="{{presets}}" wx:key="index" bindtap="loadPreset" data-index="{{index}}">
  <view class="preset-btn">{{item.name}}</view>
  <text class="preset-hint">{{item.hint}}</text>
</view>
```

- [ ] **Step 4: 删除 WXSS 中底部帮助栏样式**

从 `deadlock.wxss` 中删除 L385-L414 的整个 `.bottom-help-bar`、`.help-bar-icon`、`.help-bar-text` 块。

- [ ] **Step 5: 新增预设包装器和空态步骤样式**

在 `deadlock.wxss` 中 `.presets-row` 段后（L338 附近）追加：

```css
.preset-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.preset-hint {
  font-size: 20rpx;
  color: #6c6a64;
  opacity: 0.7;
}
```

在 `.canvas-empty` 块（L88-L93）中追加空态步骤样式：

```css
.empty-step {
  display: block;
  font-size: 26rpx;
  color: #6c6a64;
  line-height: 1.8;
}
```

- [ ] **Step 6: Commit Task 3**

```bash
git add pages/deadlock/deadlock.wxml pages/deadlock/deadlock.wxss
git commit -m "refactor(deadlock): 替换帮助组件引用 + 空态/预设微标注"
```

---

### Task 4: 注册组件 + 跑测试验证

**文件：**
- Modify: `app.json`

- [ ] **Step 1: 在 app.json 中注册 tool-help-panel 组件**

在 `app.json` 的 `usingComponents` 段追加：
```json
"tool-help-panel": "components/tool-help-panel/tool-help-panel"
```

- [ ] **Step 2: 跑测试验证**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```
Expected: 全绿，suites/测试数不变（无逻辑变更涉及工具函数）

- [ ] **Step 3: 更新 PROJECT_HANDOFF.md**

在 `PROJECT_HANDOFF.md` 最近变更（2026-07-21 段）追加本次变更记录。

- [ ] **Step 4: Commit Task 4**

```bash
git add app.json PROJECT_HANDOFF.md
git commit -m "feat: 注册 tool-help-panel 组件 + 同步 handoff"
```
