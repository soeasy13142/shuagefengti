# 首页卡片简化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 首页卡片从 5 元素（名称+tagline+tags chip+难度+CTA）简化为两档可切换模式，tools-all 页同步简化。

**Architecture:** 首页通过 `cardMode` 状态控制卡片渲染，切换时仅更新渲染不重新请求数据；偏好写入 `wx.setStorageSync`。Tools-all 页固定详细模式。

**Tech Stack:** 微信小程序原生（WXML + WXSS + JS），`wx.getStorageSync` / `wx.setStorageSync`

## Global Constraints

- 遵循 Claude Design 暖奶油画布规范：背景 `#faf9f5`、卡片 `#efe9de`、圆角 24rpx、主色 `#cc785c`
- 不修改 `utils/tool-registry.js`
- 不修改入场动画系统
- `npm test` 必须在每一步后全绿
- 新代码禁止 `var`，使用 `const`/`let`
- 纯文本 tags 去掉 `border` + `background`

---

### Task 1: Homepage JS — 添加 cardMode 状态 + 持久化 + 切换事件

**Files:**
- Modify: `pages/index/index.js`

**Interfaces:**
- Consumes: 无（独立逻辑）
- Produces: `data.cardMode: 'simple'|'detail'`、`onToggleCardMode(e)`、`loadCardMode()`

- [ ] **Step 1: 在 data 中添加 cardMode 初始值**

在 `pages/index/index.js` 的 `data` 对象中添加 `cardMode` 字段：

```js
data: {
  // ── 入场动画 ──
  show: false,

  // ── 分类 ──
  activeCategory: 'all',
  activeCategories: [],
  allViewData: [],
  currentTools: [],
  availableTools: [],
  unavailableTools: [],

  // ── 卡片模式 ──
  cardMode: 'simple',   // 'simple' | 'detail'

  // ── 工具总数 ──
  toolsCount: 0
},
```

- [ ] **Step 2: 添加 loadCardMode 方法**

在 `onShow` 中调用 `loadCardMode()`，在 `loadTools()` 调用之后：

```js
onShow() {
  this.loadTools();
  this.loadCardMode();
},
```

在 `_buildAllViewData` 方法之后、`onCategoryTap` 之前添加 `loadCardMode`：

```js
loadCardMode() {
  try {
    const mode = wx.getStorageSync('cardDisplayMode');
    if (mode === 'simple' || mode === 'detail') {
      this.setData({ cardMode: mode });
    }
  } catch (e) {
    // 默认 'simple'
  }
},
```

- [ ] **Step 3: 添加 onToggleCardMode 事件处理**

在 `onCategoryTap` 之后、`_enrichTool` 之前添加 `onToggleCardMode`：

```js
onToggleCardMode(e) {
  const newMode = e.currentTarget.dataset.mode;
  if (newMode === this.data.cardMode) return;
  this.setData({ cardMode: newMode });
  wx.setStorageSync('cardDisplayMode', newMode);
},
```

- [ ] **Step 4: 运行测试验证不破坏已有逻辑**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```

Expected: All tests pass (no regressions).

- [ ] **Step 5: Commit**

```bash
git add pages/index/index.js
git commit -m "feat: add cardMode state with persistence and toggle handler"
```

---

### Task 2: Homepage WXML — 卡片模板双模式渲染

**Files:**
- Modify: `pages/index/index.wxml`

**Interfaces:**
- Consumes: `cardMode` (from index.js Task 1), `tool._diffStars` (from existing `_enrichTool`)
- Produces: 双模式卡片渲染、切换开关

- [ ] **Step 1: 重写可用工具卡片模板（简洁模式 + 详细模式）**

将 WXML 中所有 `.tool-card` 内部替换为：

简洁模式直接渲染（默认），详细模式额外显示 tags + 星级。

**"全部"视图中的可用工具卡片：**

```html
<view
  class="tool-card"
  wx:for="{{section.tools}}"
  wx:key="id"
  wx:for-item="tool"
  data-id="{{tool.id}}"
  data-available="true"
  bindtap="onToolTap"
  hover-class="tool-hover"
  hover-stay-time="100"
>
  <text class="tool-name">{{tool.name}}</text>
  <text class="tool-tagline">{{tool.tagline || tool.description}}</text>
  <!-- 详细模式：tags + 难度 -->
  <view class="tool-meta-row" wx:if="{{cardMode === 'detail' && (tool.tags && tool.tags.length > 0 || tool.difficulty)}}">
    <text class="tool-tags-inline" wx:if="{{tool.tags && tool.tags.length > 0}}">
      <text wx:for="{{tool.tags}}" wx:for-item="tag" wx:for-index="i" wx:key="*this"><text wx:if="{{i > 0}}"> </text>{{tag}}</text>
    </text>
    <text class="tool-difficulty-stars" wx:if="{{tool.difficulty}}">{{tool._diffStars}}</text>
  </view>
</view>
```

**"全部"视图中的预告卡片（不影响简洁模式，两种模式下不变）：**

```html
<view
  class="tool-card tool-card-preview"
  wx:for="{{section.previews}}"
  wx:key="id"
  wx:for-item="preview"
>
  <text class="tool-name">{{preview.name}}</text>
  <text class="tool-tagline">{{preview.tagline || preview.description}}</text>
  <text class="tool-tag">即将上线</text>
</view>
```

**单一分类视图中的可用工具卡片：**

```html
<view
  class="tool-card"
  wx:for="{{availableTools}}"
  wx:key="id"
  data-id="{{item.id}}"
  data-available="true"
  bindtap="onToolTap"
  hover-class="tool-hover"
  hover-stay-time="100"
>
  <text class="tool-name">{{item.name}}</text>
  <text class="tool-tagline">{{item.tagline || item.description}}</text>
  <!-- 详细模式：tags + 难度 -->
  <view class="tool-meta-row" wx:if="{{cardMode === 'detail' && (item.tags && item.tags.length > 0 || item.difficulty)}}">
    <text class="tool-tags-inline" wx:if="{{item.tags && item.tags.length > 0}}">
      <text wx:for="{{item.tags}}" wx:for-item="tag" wx:for-index="i" wx:key="*this"><text wx:if="{{i > 0}}"> </text>{{tag}}</text>
    </text>
    <text class="tool-difficulty-stars" wx:if="{{item.difficulty}}">{{item._diffStars}}</text>
  </view>
</view>
```

**单一分类视图中的预告卡片（不变）：**

```html
<view
  class="tool-card tool-card-preview"
  wx:for="{{unavailableTools}}"
  wx:key="id"
>
  <text class="tool-name">{{item.name}}</text>
  <text class="tool-tagline">{{item.tagline || item.description}}</text>
  <text class="tool-tag">即将上线</text>
</view>
```

- [ ] **Step 2: 添加切换开关 UI**

将现有的 `<scroll-view class="category-tabs">` 包裹在一个 flex 容器中，右侧加上模式切换文字：

```html
<view class="tools-header">
  <!-- 分类标签栏（横向滚动） -->
  <scroll-view class="category-tabs" scroll-x show-scrollbar="{{false}}" enable-flex>
    <view class="category-tab {{activeCategory === 'all' ? 'active' : ''}}" data-id="all" bindtap="onCategoryTap">
      <text>全部</text>
    </view>
    <view
      class="category-tab {{activeCategory === item.id ? 'active' : ''}}"
      wx:for="{{activeCategories}}"
      wx:key="id"
      data-id="{{item.id}}"
      bindtap="onCategoryTap"
    >
      <text>{{item.name}}</text>
    </view>
  </scroll-view>

  <!-- 模式切换 -->
  <view class="mode-toggle">
    <text class="mode-toggle-item {{cardMode === 'simple' ? 'active' : ''}}" data-mode="simple" bindtap="onToggleCardMode">简洁</text>
    <text class="mode-toggle-sep">·</text>
    <text class="mode-toggle-item {{cardMode === 'detail' ? 'active' : ''}}" data-mode="detail" bindtap="onToggleCardMode">详细</text>
  </view>
</view>
```

注意：**同时移除**原有的 `tool-meta-row`（含 `.tool-tags` + `.tool-tag-item` + `.tool-difficulty`）和 `.tool-link`（CTA "进入 →"）相关的 WXML——它们被上面的新模板替代。

- [ ] **Step 3: 运行测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add pages/index/index.wxml
git commit -m "feat: dual-mode card rendering with mode toggle on homepage"
```

---

### Task 3: Homepage WXSS — 简化卡片样式 + 切换开关样式

**Files:**
- Modify: `pages/index/index.wxss`

- [ ] **Step 1: 添加 tools-header 布局 + 模式切换开关样式**

在 `/* ── 分类标签栏 ── */` 之前添加：

```css
/* ── 头部行：标签栏 + 模式切换 ── */
.tools-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.mode-toggle {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.mode-toggle-item {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 22rpx;
  font-weight: 500;
  color: #6c6a64;
  line-height: 1.4;
}

.mode-toggle-item.active {
  color: #cc785c;
}

.mode-toggle-item:active {
  opacity: 0.6;
}

.mode-toggle-sep {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 22rpx;
  color: #6c6a64;
  margin: 0 6rpx;
}
```

同时调整 `.category-tabs` 的 `margin-bottom` 从 `16rpx` 改为 `0`（因为外层 `.tools-header` 有 `margin-bottom: 16rpx`）：

```css
.category-tabs {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 0;
  flex: 1;
}
```

- [ ] **Step 2: 更新卡片内边距**

```css
.tool-card {
  flex: 0 0 48%;
  margin-bottom: 20rpx;
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;                    /* 从 28rpx 24rpx 20rpx 改为统一 24rpx */
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}
```

- [ ] **Step 3: 替换 tag/难度 chip 样式为纯文字样式**

将原有的 `.tool-tags`、`.tool-tag-item`、`.tool-difficulty` 替换为：

```css
/* ── 详细模式：tags 纯文字 ── */
.tool-tags-inline {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18rpx;
  font-weight: 400;
  color: #6c6a64;
  line-height: 1.4;
}

.tool-difficulty-stars {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18rpx;
  font-weight: 400;
  color: #8e8b82;
  line-height: 1.4;
  margin-left: 8rpx;
}

/* ── 详细模式：元信息行 ── */
.tool-meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8rpx;
}
```

- [ ] **Step 4: 删除不再使用的样式**

删除以下 CSS 规则（被 step 3 替换）：

```
.tool-icon           ← 不再使用
.tool-link           ← 不再使用（CTA "进入 →" 已去掉）
.tool-tags           ← 替换为 .tool-tags-inline
.tool-tag-item       ← 替换为纯文字
.tool-difficulty     ← 替换为 .tool-difficulty-stars
```

保留 `.tool-tag`（"即将上线"标签，预告卡片仍使用）。

- [ ] **Step 5: 运行测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add pages/index/index.wxss
git commit -m "refactor: simplify card styles and add mode toggle styles"
```

---

### Task 4: Tools-all 页 — 简化为详细模式卡片

**Files:**
- Modify: `pages/tools-all/tools-all.wxml`
- Modify: `pages/tools-all/tools-all.wxss`

- [ ] **Step 1: 重写 tools-all WXML 卡片模板**

将 `pages/tools-all/tools-all.wxml` 中的卡片内容替换为（去 chip、去 CTA）：

可用工具卡片：
```html
<view
  class="tool-card {{!tool.available ? 'tool-card-preview' : ''}}"
  wx:for="{{section.tools}}"
  wx:key="id"
  wx:for-item="tool"
  data-id="{{tool.id}}"
  data-available="{{tool.available}}"
  bindtap="onToolTap"
  hover-class="tool-hover"
  hover-stay-time="100"
>
  <text class="tool-name">{{tool.name}}</text>
  <text class="tool-tagline">{{tool.tagline || tool.description}}</text>
  <!-- tags + 难度（详细模式） -->
  <!-- tags + 难度（仅可用工具且有数据时） -->
  <view class="tool-meta-row" wx:if="{{tool.available && (tool.tags && tool.tags.length > 0 || tool.difficulty)}}">
    <text class="tool-tags-inline" wx:if="{{tool.tags && tool.tags.length > 0}}">
      <text wx:for="{{tool.tags}}" wx:for-item="tag" wx:for-index="i" wx:key="*this"><text wx:if="{{i > 0}}"> </text>{{tag}}</text>
    </text>
    <text class="tool-difficulty-stars" wx:if="{{tool.difficulty}}">{{tool._diffStars}}</text>
  </view>
  <!-- 即将上线（仅不可用工具） -->
  <text class="tool-tag" wx:if="{{!tool.available}}">即将上线</text>
</view>
```

单一分类视图中的可用工具卡片（同样替换）：

```html
<view
  class="tool-card"
  wx:for="{{availableTools}}"
  wx:key="id"
  data-id="{{item.id}}"
  data-available="true"
  bindtap="onToolTap"
  hover-class="tool-hover"
  hover-stay-time="100"
>
  <text class="tool-name">{{item.name}}</text>
  <text class="tool-tagline">{{item.tagline || item.description}}</text>
  <!-- tags + 难度（仅可用工具且有数据时） -->
  <view class="tool-meta-row" wx:if="{{item.available && (item.tags && item.tags.length > 0 || item.difficulty)}}">
    <text class="tool-tags-inline" wx:if="{{item.tags && item.tags.length > 0}}">
      <text wx:for="{{item.tags}}" wx:for-item="tag" wx:for-index="i" wx:key="*this"><text wx:if="{{i > 0}}"> </text>{{tag}}</text>
    </text>
    <text class="tool-difficulty-stars" wx:if="{{item.difficulty}}">{{item._diffStars}}</text>
  </view>
  <!-- 即将上线（仅不可用工具） -->
  <text class="tool-tag" wx:if="{{!item.available}}">即将上线</text>
</view>
```

单一分类视图中的不可用工具卡片：

```html
<view
  class="tool-card tool-card-preview"
  wx:for="{{unavailableTools}}"
  wx:key="id"
>
  <text class="tool-name">{{item.name}}</text>
  <text class="tool-tagline">{{item.tagline || item.description}}</text>
  <text class="tool-tag">即将上线</text>
</view>
```

- [ ] **Step 2: 更新 tools-all WXSS**

添加与首页相同的纯文字 tags + 难度星级样式，删除 chip 样式：

```css
/* ── 详细模式：tags 纯文字 ── */
.tool-tags-inline {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18rpx;
  font-weight: 400;
  color: #6c6a64;
  line-height: 1.4;
}

.tool-difficulty-stars {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18rpx;
  font-weight: 400;
  color: #8e8b82;
  line-height: 1.4;
  margin-left: 8rpx;
}

.tool-meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8rpx;
}
```

删除 tools-all.wxss 中的旧样式：

```
.tool-icon           ← 删除
.tool-tags           ← 删除（被 .tool-tags-inline 替代）
.tool-tag-item       ← 删除（被纯文字替代）
.tool-difficulty     ← 删除（被 .tool-difficulty-stars 替代）
.tool-link           ← 删除（CTA 已去掉）
```

保留 `.tool-tag`（"即将上线"标签仍使用）。

- [ ] **Step 3: 运行测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add pages/tools-all/tools-all.wxml pages/tools-all/tools-all.wxss
git commit -m "refactor: simplify tools-all page cards to detail mode"
```

---

### Task 5: 端到端验证

**Files:** 无代码改动

- [ ] **Step 1: 验证 WXML 语法**

检查首页和 tools-all 页的 WXML 中 wx:for / wx:if / wx:for-index 嵌套是否正确——wx:for 内的 wx:if 是否使用了正确的变量名（`tool.` 还是 `item.`）。

- [ ] **Step 2: 全量测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```

Expected: All tests pass, no warnings.

- [ ] **Step 3: 更新 PROJECT_HANDOFF.md**

在 `docs/handoff/decisions.md` 或 PROJECT_HANDOFF.md 首页重设计条目中追加本次简化决策：

```
### 2026-07-19 · 首页卡片简化（双模式切换）

- 首页默认简洁模式（名称+tagline），可切换至详细模式（+纯文字tags+星级）
- tools-all 页固定详细模式
- 切换开关在分类标签栏右侧外部，偏好持久化到 wx.setStorageSync
- 去掉 chip 样式（border+background）、CTA "进入 →"
- 详见 `docs/superpowers/specs/2026-07-19-card-simplification-design.md`
```

- [ ] **Step 4: Commit**

```bash
git add PROJECT_HANDOFF.md
git commit -m "docs: record homepage card simplification decisions"
```
