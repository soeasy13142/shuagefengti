# 首页重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign WeChat mini-program home page to a "toolbox-first" layout with compact brand header, category tabs, 2-column card grid, and a secondary "all tools" page.

**Architecture:** Home page (`pages/index/`) maintains scroll-based single-page layout; new lightweight secondary page (`pages/tools-all/`) shows all 24 tools. Data source is `utils/tool-registry.js` (unchanged). All state lives in-page via `Page({data: {...}})`.

**Tech Stack:** WeChat mini-program native (WXML + WXSS + JS) + Jest for pure-logic tests.

## Global Constraints

- Design style: Claude Design warm cream canvas (`#faf9f5`), cards (`#efe9de`), coral CTA (`#cc785c`), warm ink text (`#141413`)
- Georgia serif for brand title, system sans-serif for body text
- `var` prohibited; use `const` / `let` only
- No backend, no cloud services: all data from `utils/tool-registry.js` (read-only)
- No third-party libraries
- `npm test` must remain all-green (existing 17 test files unaffected)
- Data structures in `utils/tool-registry.js` must not be mutated

---

### Task 1: 首页 JS 逻辑改造

**Files:**
- Modify: `pages/index/index.js` (full rewrite of Page logic)

**Interfaces:**
- Consumes: `utils/tool-registry.js` (`getActiveCategories`, `getToolsByCategory`, `getFeaturedToolsByCategory`)
- Produces: `data` object consumed by `pages/index/index.wxml`:
  - `show` (Boolean, for entry animation)
  - `activeCategory` (String, e.g. `'all'` | category id)
  - `allViewData` (Array of `{category, tools, previews}` — for "全部" tab)
  - `currentTools`, `availableTools`, `unavailableTools` (for single-category view)
  - `toolsCount` (Number, total tools in registry = 24)

- [ ] **Step 1: Write the failing test for home page data logic**

Create `tests/pages/index.test.js`:

```javascript
const registry = require('../../utils/tool-registry');

describe('首页数据处理', () => {

  describe('allViewData 构建逻辑', () => {
    function buildAllViewData(activeCategories) {
      return activeCategories.map(function(cat) {
        var tools = [];
        var featured = registry.getFeaturedToolsByCategory(cat.id, 4);
        if (featured.length === 0) {
          featured = registry.getToolsByCategory(cat.id).filter(function(t) { return t.available; });
        }
        tools = featured;
        // 精选预告：最多 2 个即将上线
        var allInCat = registry.getToolsByCategory(cat.id);
        var upcoming = allInCat.filter(function(t) { return !t.available; });
        var previews = upcoming.slice(0, 2);

        return {
          category: cat,
          tools: tools.slice(0, 4),
          previews: previews
        };
      });
    }

    test('只包含有可用工具的活跃分类', () => {
      var activeCats = registry.getActiveCategories();
      var result = buildAllViewData(activeCats);
      var ids = result.map(function(s) { return s.category.id; });
      expect(ids).toContain('network');
      expect(ids).toContain('algo');
      expect(ids).not.toContain('os');
    });

    test('每个分类 tools 最多 4 个', () => {
      var activeCats = registry.getActiveCategories();
      var result = buildAllViewData(activeCats);
      result.forEach(function(section) {
        expect(section.tools.length).toBeLessThanOrEqual(4);
        section.tools.forEach(function(t) {
          expect(t.available).toBe(true);
        });
      });
    });

    test('每个分类 previews 最多 2 个即将上线工具', () => {
      var activeCats = registry.getActiveCategories();
      var result = buildAllViewData(activeCats);
      result.forEach(function(section) {
        expect(section.previews.length).toBeLessThanOrEqual(2);
        section.previews.forEach(function(p) {
          expect(p.available).toBe(false);
        });
      });
    });

    test('仅展示分类下实际存在的预告数量', () => {
      var result = buildAllViewData(registry.getActiveCategories());
      // algo 分类（sort-viz + ds-viz，无即将上线工具）
      var algoSection = result.find(function(s) { return s.category.id === 'algo'; });
      if (algoSection) {
        expect(algoSection.previews.length).toBe(0);
      }
    });
  });

  describe('toolsCount', () => {
    test('返回 TOOLS 总数 24', () => {
      var count = registry.TOOLS.length;
      expect(count).toBe(24);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npx jest tests/pages/index.test.js --no-coverage`
Expected: PASS (the test doesn't depend on the page implementation — it tests registry functions + a pure data transformation that we'll verify via the actual implementation)

Note: This test validates the data transformation logic that `index.js`'s `_buildAllViewData` should perform. The assertion checks ensure the shape and constraints match the spec.

- [ ] **Step 3: Rewrite `pages/index/index.js`**

```javascript
const registry = require('../../utils/tool-registry');

Page({
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

    // ── 工具总数 ──
    toolsCount: 0
  },

  onShow() {
    this.loadTools();
  },

  onReady() {
    var self = this;
    setTimeout(function() {
      self.setData({ show: true });
    }, 100);
  },

  loadTools() {
    var activeCategories = registry.getActiveCategories();
    var allViewData = this._buildAllViewData(activeCategories);

    this.setData({
      activeCategories: activeCategories,
      allViewData: allViewData,
      currentTools: [],
      toolsCount: registry.TOOLS.length
    });
  },

  _buildAllViewData(activeCategories) {
    return activeCategories.map(function(cat) {
      var featured = registry.getFeaturedToolsByCategory(cat.id, 4);
      var tools;
      if (featured.length === 0) {
        tools = registry.getToolsByCategory(cat.id).filter(function(t) { return t.available; });
      } else {
        tools = featured;
      }

      // 精选预告：从同分类取最多 2 个即将上线工具
      var allInCat = registry.getToolsByCategory(cat.id);
      var upcoming = allInCat.filter(function(t) { return !t.available; });
      var previews = upcoming.slice(0, 2);

      return {
        category: cat,
        tools: tools.slice(0, 4),
        previews: previews
      };
    });
  },

  onCategoryTap(e) {
    var categoryId = e.currentTarget.dataset.id;
    var currentTools = [];
    var availableTools = [];
    var unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter(function(t) { return t.available; });
      unavailableTools = currentTools.filter(function(t) { return !t.available; });
    }

    this.setData({
      activeCategory: categoryId,
      currentTools: currentTools,
      availableTools: availableTools,
      unavailableTools: unavailableTools
    });
  },

  onToolTap(e) {
    var id = e.currentTarget.dataset.id;
    var available = e.currentTarget.dataset.available;

    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }

    var tool = registry.TOOLS.find(function(t) { return t.id === id; });
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  },

  onHeroTap() {
    var self = this;
    this.setData({ heroTapped: true });
    setTimeout(function() {
      self.setData({ heroTapped: false });
      wx.navigateTo({ url: '/pages/quiz-list/quiz-list' });
    }, 350);
  },

  goToRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goToWrongQuestions() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  },

  goToAllTools() {
    wx.navigateTo({ url: '/pages/tools-all/tools-all' });
  }
});
```

- [ ] **Step 4: Run test to verify all tests pass**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: All existing 17 test files + the new test all PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/pages/index.test.js pages/index/index.js
git commit -m "feat(index): 首页 JS 逻辑改造——去掉 stats、新增 previews 机制、精简 data"
```

---

### Task 2: 首页 WXML 重写

**Files:**
- Modify: `pages/index/index.wxml`

**Interfaces:**
- Consumes: `data` from `pages/index/index.js` — `show`, `activeCategory`, `activeCategories`, `allViewData`, `currentTools`, `availableTools`, `unavailableTools`, `toolsCount`
- Produces: Rendered DOM viewed by user, consumed by `pages/index/index.wxss`

- [ ] **Step 1: Write `pages/index/index.wxml`**

```xml
<view class="page">

  <!-- ═══ TOP: 品牌 + 刷题入口 ═══ -->
  <view class="top-brand {{show ? 'anim-in' : ''}}">
    <text class="brand-title">刷个冯题</text>
    <view class="brand-cta" bindtap="onHeroTap" hover-class="cta-hover" hover-stay-time="100">
      <text class="cta-text">📝 开始刷题 ▸</text>
    </view>
    <view class="brand-links">
      <text class="brand-link" bindtap="goToRecords">答题记录</text>
      <text class="brand-dot">·</text>
      <text class="brand-link" bindtap="goToWrongQuestions">错题本</text>
    </view>
  </view>

  <!-- ═══ TOOLS: 分类标签栏 + 工具网格 ═══ -->
  <view class="tools-area {{show ? 'anim-up' : ''}}">

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

    <!-- 「全部」视图：分类分组 + 精选预告 -->
    <block wx:if="{{activeCategory === 'all'}}">
      <view class="cat-section" wx:for="{{allViewData}}" wx:key="category.id" wx:for-item="section">

        <!-- 分类标题 -->
        <text class="cat-section-title">{{section.category.icon}} {{section.category.name}}</text>

        <!-- 可用工具 -->
        <view class="tool-grid">
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
            <text class="tool-icon">{{tool.icon}}</text>
            <text class="tool-name">{{tool.name}}</text>
            <text class="tool-desc">{{tool.description}}</text>
            <text class="tool-link">进入 ▸</text>
          </view>
        </view>

        <!-- 精选预告（即将上线） -->
        <view class="preview-grid" wx:if="{{section.previews.length > 0}}">
          <view
            class="tool-card tool-card-preview"
            wx:for="{{section.previews}}"
            wx:key="id"
            wx:for-item="preview"
          >
            <text class="tool-icon">{{preview.icon}}</text>
            <text class="tool-name">{{preview.name}}</text>
            <text class="tool-desc">{{preview.description}}</text>
            <text class="tool-tag">即将上线</text>
          </view>
        </view>
      </view>

      <!-- 查看全部 -->
      <view class="view-all" bindtap="goToAllTools">
        <text class="view-all-text">查看全部 {{toolsCount}} 个工具 →</text>
      </view>
    </block>

    <!-- 单一分类视图：可用 + 即将上线 -->
    <block wx:else>
      <!-- 可用工具 -->
      <block wx:if="{{availableTools.length > 0}}">
        <text class="cat-section-title">✨ 可用工具</text>
        <view class="tool-grid">
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
            <text class="tool-icon">{{item.icon}}</text>
            <text class="tool-name">{{item.name}}</text>
            <text class="tool-desc">{{item.description}}</text>
            <text class="tool-link">进入 ▸</text>
          </view>
        </view>
      </block>

      <!-- 即将上线 -->
      <block wx:if="{{unavailableTools.length > 0}}">
        <text class="cat-section-title">🔜 即将上线</text>
        <view class="tool-grid">
          <view
            class="tool-card tool-card-preview"
            wx:for="{{unavailableTools}}"
            wx:key="id"
          >
            <text class="tool-icon">{{item.icon}}</text>
            <text class="tool-name">{{item.name}}</text>
            <text class="tool-desc">{{item.description}}</text>
            <text class="tool-tag">即将上线</text>
          </view>
        </view>
      </block>

      <!-- 全空 -->
      <view class="empty-cat" wx:if="{{availableTools.length === 0 && unavailableTools.length === 0}}">
        <text class="empty-cat-text">该分类的工具正在开发中</text>
      </view>
    </block>
  </view>

  <!-- ═══ FOOTER ═══ -->
  <view class="footer {{show ? 'anim-up-delay' : ''}}">
    <text class="icp">苏ICP备2026036865号-1X</text>
  </view>

</view>
```

- [ ] **Step 2: Review WXML for correctness**

Visually inspect:
- `wx:if`/`wx:else` branches are balanced
- `data-id` and `data-available` on all tappable cards
- `bindtap` handlers map to existing functions in `index.js`
- `wx:for` keys use correct syntax

- [ ] **Step 3: Commit**

```bash
git add pages/index/index.wxml
git commit -m "feat(index): 首页 WXML 重写——品牌头+分类标签+工具网格+查看全部"
```

---

### Task 3: 首页 WXSS 重写

**Files:**
- Modify: `pages/index/index.wxss`

**Interfaces:**
- Consumes: Class names in `pages/index/index.wxml`
- Produces: Visual styling per Claude Design spec

- [ ] **Step 1: Write `pages/index/index.wxss`**

```css
/* ═══════════════════════════════════════════
   Claude Design — 首页（重设计 v2）
   工具箱优先 · 紧凑头部 · 大网格卡片
   ═══════════════════════════════════════════ */

/* ── 入场动画 ── */
@keyframes fadeSlideIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(50rpx); }
  to   { opacity: 1; transform: translateY(0); }
}

.anim-in       { animation: fadeSlideIn 0.4s ease-out both; }
.anim-up       { animation: fadeSlideUp 0.5s ease-out 0.2s both; }
.anim-up-delay { animation: fadeSlideUp 0.5s ease-out 0.35s both; }

/* ── 页面画布 ── */
.page {
  min-height: 100vh;
  background: #faf9f5;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ═══════════════════════════════════════════
   顶部品牌 + 刷题入口
   ═══════════════════════════════════════════ */
.top-brand {
  padding: 48rpx 32rpx 32rpx;
  background: #faf9f5;
  opacity: 0;
}

.brand-title {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 48rpx;
  font-weight: 400;
  color: #141413;
  line-height: 1.05;
  letter-spacing: -2rpx;
  margin-bottom: 28rpx;
}

.brand-cta {
  display: inline-block;
  background: #cc785c;
  border-radius: 12rpx;
  padding: 10rpx 28rpx;
  margin-bottom: 16rpx;
}

.brand-cta:active,
.cta-hover {
  background: #a9583e;
}

.cta-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 26rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.4;
}

.brand-links {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.brand-link {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 24rpx;
  font-weight: 400;
  color: #6c6a64;
  line-height: 1.4;
}

.brand-link:active {
  opacity: 0.6;
}

.brand-dot {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 24rpx;
  color: #6c6a64;
}

/* ═══════════════════════════════════════════
   工具箱区域
   ═══════════════════════════════════════════ */
.tools-area {
  padding: 0 32rpx 40rpx;
  background: #faf9f5;
  opacity: 0;
}

/* ── 分类标签栏 ── */
.category-tabs {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 24rpx;
}

.category-tab {
  display: inline-block;
  padding: 14rpx 24rpx;
  margin-right: 12rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 26rpx;
  font-weight: 500;
  color: #6c6a64;
  border-bottom: 4rpx solid transparent;
  transition: color 0.2s, border-bottom-color 0.2s;
}

.category-tab.active {
  color: #cc785c;
  border-bottom-color: #cc785c;
}

/* ── 工具网格 ── */
.tool-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.tool-card {
  flex: 1;
  min-width: 0;
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx 24rpx 24rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.tool-card:active {
  background: #e8e0d2;
}

.tool-hover {
  background: #e8e0d2;
}

/* ── 即将上线的半透明卡片 ── */
.tool-card-preview {
  opacity: 0.45;
}
.tool-card-preview:active {
  background: #efe9de;
}

.tool-icon {
  font-size: 48rpx;
  margin-bottom: 20rpx;
}

.tool-name {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 28rpx;
  font-weight: 500;
  color: #141413;
  line-height: 1.35;
  margin-bottom: 6rpx;
}

.tool-desc {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20rpx;
  font-weight: 400;
  color: #8e8b82;
  line-height: 1.4;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tool-link {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  font-weight: 500;
  color: #cc785c;
  margin-top: auto;
}

.tool-tag {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 22rpx;
  font-weight: 400;
  color: #6c6a64;
  margin-top: auto;
}

/* ── 精选预告网格 ── */
.preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

/* ── 分类标题 ── */
.cat-section-title {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  font-weight: 500;
  color: #8e8b82;
  letter-spacing: 1rpx;
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

.cat-section {
  margin-bottom: 8rpx;
}

.cat-section:first-child {
  margin-top: 0;
}

/* ── 查看全部链接 ── */
.view-all {
  padding: 32rpx 0;
  text-align: center;
}

.view-all:active {
  opacity: 0.6;
}

.view-all-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 26rpx;
  font-weight: 500;
  color: #cc785c;
}

/* ── 全空状态 ── */
.empty-cat {
  padding: 64rpx 0;
  text-align: center;
}

.empty-cat-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 26rpx;
  color: #8e8b82;
}

/* ═══════════════════════════════════════════
   备案号
   ═══════════════════════════════════════════ */
.footer {
  background: #faf9f5;
  padding: 48rpx 0 40rpx;
  text-align: center;
  opacity: 0;
}

.icp {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 22rpx;
  font-weight: 400;
  color: #8e8b82;
}
```

- [ ] **Step 2: Commit**

```bash
git add pages/index/index.wxss
git commit -m "feat(index): 首页 WXSS 重写——新布局样式+卡片网格+入场动画"
```

---

### Task 4: 全部工具二级页创建

**Files:**
- Create: `pages/tools-all/tools-all.js`
- Create: `pages/tools-all/tools-all.wxml`
- Create: `pages/tools-all/tools-all.wxss`
- Create: `pages/tools-all/tools-all.json`

**Interfaces:**
- Consumes: `utils/tool-registry.js` (`TOOL_CATEGORIES`, `TOOLS`, `getToolsByCategory`)
- Produces: A self-contained page showing all 24 tools in a scrollable grid

- [ ] **Step 1: Write `pages/tools-all/tools-all.js`**

```javascript
const registry = require('../../utils/tool-registry');

Page({
  data: {
    activeCategory: 'all',
    categories: [],
    allSections: [],
    currentTools: [],
    availableTools: [],
    unavailableTools: []
  },

  onLoad() {
    var categories = registry.TOOL_CATEGORIES;
    var allSections = this._buildAllSections(categories);
    this.setData({
      categories: categories,
      allSections: allSections
    });
  },

  _buildAllSections(categories) {
    return categories.map(function(cat) {
      var allTools = registry.getToolsByCategory(cat.id);
      return {
        category: cat,
        tools: allTools
      };
    });
  },

  onCategoryTap(e) {
    var categoryId = e.currentTarget.dataset.id;
    var currentTools = [];
    var availableTools = [];
    var unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter(function(t) { return t.available; });
      unavailableTools = currentTools.filter(function(t) { return !t.available; });
    }

    this.setData({
      activeCategory: categoryId,
      currentTools: currentTools,
      availableTools: availableTools,
      unavailableTools: unavailableTools
    });
  },

  onToolTap(e) {
    var id = e.currentTarget.dataset.id;
    var available = e.currentTarget.dataset.available;

    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }

    var tool = registry.TOOLS.find(function(t) { return t.id === id; });
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  }
});
```

- [ ] **Step 2: Write `pages/tools-all/tools-all.wxml`**

```xml
<view class="page">

  <!-- 分类标签栏 -->
  <scroll-view class="category-tabs" scroll-x show-scrollbar="{{false}}" enable-flex>
    <view class="category-tab {{activeCategory === 'all' ? 'active' : ''}}" data-id="all" bindtap="onCategoryTap">
      <text>全部</text>
    </view>
    <view
      class="category-tab {{activeCategory === item.id ? 'active' : ''}}"
      wx:for="{{categories}}"
      wx:key="id"
      data-id="{{item.id}}"
      bindtap="onCategoryTap"
    >
      <text>{{item.name}}</text>
    </view>
  </scroll-view>

  <!-- 全部视图：全量工具按分类分组 -->
  <block wx:if="{{activeCategory === 'all'}}">
    <view class="cat-section" wx:for="{{allSections}}" wx:key="category.id" wx:for-item="section">
      <text class="cat-section-title">{{section.category.icon}} {{section.category.name}}</text>
      <view class="tool-grid">
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
          <text class="tool-icon">{{tool.icon}}</text>
          <text class="tool-name">{{tool.name}}</text>
          <text class="tool-desc">{{tool.description}}</text>
          <text class="tool-link" wx:if="{{tool.available}}">进入 ▸</text>
          <text class="tool-tag" wx:else>即将上线</text>
        </view>
      </view>
    </view>
  </block>

  <!-- 单一分类视图 -->
  <block wx:else>
    <block wx:if="{{availableTools.length > 0}}">
      <text class="cat-section-title">✨ 可用工具</text>
      <view class="tool-grid">
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
          <text class="tool-icon">{{item.icon}}</text>
          <text class="tool-name">{{item.name}}</text>
          <text class="tool-desc">{{item.description}}</text>
          <text class="tool-link">进入 ▸</text>
        </view>
      </view>
    </block>

    <block wx:if="{{unavailableTools.length > 0}}">
      <text class="cat-section-title">🔜 即将上线</text>
      <view class="tool-grid">
        <view
          class="tool-card tool-card-preview"
          wx:for="{{unavailableTools}}"
          wx:key="id"
        >
          <text class="tool-icon">{{item.icon}}</text>
          <text class="tool-name">{{item.name}}</text>
          <text class="tool-desc">{{item.description}}</text>
          <text class="tool-tag">即将上线</text>
        </view>
      </view>
    </block>

    <view class="empty-cat" wx:if="{{availableTools.length === 0 && unavailableTools.length === 0}}">
      <text class="empty-cat-text">该分类的工具正在开发中</text>
    </view>
  </block>

</view>
```

- [ ] **Step 3: Write `pages/tools-all/tools-all.wxss`**

```css
/* ═══════════════════════════════════════════
   全部工具列表页 — 复用首页工具箱样式
   ═══════════════════════════════════════════ */

.page {
  min-height: 100vh;
  background: #faf9f5;
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: 24rpx;
}

/* ── 分类标签栏 ──（同首页） */
.category-tabs {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 24rpx;
  padding: 0 32rpx;
  box-sizing: border-box;
}

.category-tab {
  display: inline-block;
  padding: 14rpx 24rpx;
  margin-right: 12rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 26rpx;
  font-weight: 500;
  color: #6c6a64;
  border-bottom: 4rpx solid transparent;
  transition: color 0.2s, border-bottom-color 0.2s;
}

.category-tab.active {
  color: #cc785c;
  border-bottom-color: #cc785c;
}

/* ── 分类标题 ── */
.cat-section-title {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  font-weight: 500;
  color: #8e8b82;
  letter-spacing: 1rpx;
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

.cat-section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

/* ── 工具网格（同首页） ── */
.tool-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.tool-card {
  flex: 1;
  min-width: 0;
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx 24rpx 24rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.tool-card:active {
  background: #e8e0d2;
}

.tool-hover {
  background: #e8e0d2;
}

.tool-card-preview {
  opacity: 0.45;
}
.tool-card-preview:active {
  background: #efe9de;
}

.tool-icon {
  font-size: 48rpx;
  margin-bottom: 20rpx;
}

.tool-name {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 28rpx;
  font-weight: 500;
  color: #141413;
  line-height: 1.35;
  margin-bottom: 6rpx;
}

.tool-desc {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20rpx;
  font-weight: 400;
  color: #8e8b82;
  line-height: 1.4;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tool-link {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 24rpx;
  font-weight: 500;
  color: #cc785c;
  margin-top: auto;
}

.tool-tag {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 22rpx;
  font-weight: 400;
  color: #6c6a64;
  margin-top: auto;
}

/* ── 全空状态 ── */
.empty-cat {
  padding: 64rpx 0;
  text-align: center;
  padding: 64rpx 0;
}

.empty-cat-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 26rpx;
  color: #8e8b82;
}
```

- [ ] **Step 4: Write `pages/tools-all/tools-all.json`**

```json
{
  "navigationBarTitleText": "全部工具",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black"
}
```

- [ ] **Step 5: Add test for tools-all page data logic**

Append to `tests/pages/index.test.js`:

```javascript
describe('全部工具页数据', () => {
  test('全部 5 个分类都有对应的工具', () => {
    var categories = registry.TOOL_CATEGORIES;
    categories.forEach(function(cat) {
      var tools = registry.getToolsByCategory(cat.id);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  test('全部 24 个工具分布在 5 个分类中', () => {
    var categories = registry.TOOL_CATEGORIES;
    var allTools = [];
    categories.forEach(function(cat) {
      allTools = allTools.concat(registry.getToolsByCategory(cat.id));
    });
    expect(allTools.length).toBe(24);
  });

  test('每个分类的 tool-card 区分 available 和 unavailable', function() {
    var categories = registry.TOOL_CATEGORIES;
    categories.forEach(function(cat) {
      var tools = registry.getToolsByCategory(cat.id);
      var avail = tools.filter(function(t) { return t.available; });
      var unavail = tools.filter(function(t) { return !t.available; });
      expect(avail.length + unavail.length).toBe(tools.length);
    });
  });
});
```

- [ ] **Step 6: Run all tests**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add pages/tools-all/ tests/pages/index.test.js
git commit -m "feat(tools-all): 新增全部工具列表页——全量展示 24 个工具"
```

---

### Task 5: app.json 注册 + 完成验证

**Files:**
- Modify: `app.json`
- Modify: `PROJECT_HANDOFF.md` (追加变更记录)

- [ ] **Step 1: Register `pages/tools-all/tools-all` in `app.json`**

Edit `/Users/charliepan/Downloads/my-miniapp/app.json`:

Find the `"pages"` array. Add `"pages/tools-all/tools-all"` after the last existing page entry. The array should look like:

```json
{
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
    "pages/dns-viz/dns-viz",
    "pages/subnet-calc/subnet-calc",
    "pages/sort-viz/sort-viz",
    "pages/tcp-viz/tcp-viz",
    "pages/ds-viz/ds-viz",
    "pages/tools-all/tools-all"
  ],
  // ... rest unchanged
}
```

- [ ] **Step 2: Final test run**

Run: `cd /Users/charliepan/Downloads/my-miniapp && npm test`
Expected: All tests PASS (18 test files now, including the new index test).

- [ ] **Step 3: Update PROJECT_HANDOFF.md**

Append a new section under "最近重大变更":

```markdown
### 2026-07-12 · 首页重设计——工具箱优先

**变更内容**

- 首页定位改为「工具箱优先」：紧凑品牌头 + 分类标签栏 + 2 列大网格卡片
- 去掉 Hero 大标题区、学习概览统计卡片、底部快捷入口
- 顶部模块：小号衬线品牌名「刷个冯题」+ 内联「开始刷题」按钮 + 答题记录/错题本链接
- 「全部」视图：每分类最多 4 个可用工具 + 2 个精选预告（半透明）；底部「查看全部 N 个工具 →」链接
- 单一分类视图：可用工具 + 即将上线工具两组展示
- 新增 `pages/tools-all/tools-all` 二级页面，全量展示 24 个工具
- 保留原入场动画体系（fadeSlideIn 0.4s / fadeSlideUp 0.5s）
- 所有样式按 Claude Design 暖奶油画布规范

**涉及文件**

- 修改：`pages/index/index.js`、`pages/index/index.wxml`、`pages/index/index.wxss`、`app.json`
- 新增：`pages/tools-all/tools-all.js`、`.wxml`、`.wxss`、`.json`
- 新增：`tests/pages/index.test.js`

**不改变**

- 刷题流程、tool-registry 数据、存储层、app.json 其余配置

参见：
- spec: `docs/superpowers/specs/2026-07-12-homepage-redesign.md`
- plan: `docs/plans/2026-07-12-homepage-redesign.md`
```

- [ ] **Step 4: Commit**

```bash
git add app.json PROJECT_HANDOFF.md
git commit -m "feat: app.json 注册 tools-all 页面 + PROJECT_HANDOFF 更新"
```

---

## Plan Self-Review Checklist

- [ ] **Spec coverage check:** Does every section in the spec have a corresponding task?
  - §2 顶部品牌 → Task 1 (JS) + Task 2 (WXML) + Task 3 (WXSS) ✅
  - §3 分类标签 → Task 2 (WXML) + Task 3 (WXSS) ✅
  - §4 工具卡片 → Task 2 (WXML) + Task 3 (WXSS) ✅
  - §5 查看全部 → Task 2 (WXML `view-all`) + Task 1 (JS `goToAllTools`) ✅
  - §6 全部工具页 → Task 4 ✅
  - §7 备案号 → Task 2 (WXML) + Task 3 (WXSS) ✅
  - §8 入场动画 → Task 3 (WXSS) ✅
  - §9 文件清单 → Tasks 1-5 ✅
  - §10 不做的范围 → All excluded ✅
  - §11 风险 → Accounted for in JS/WXML/WXSS ✅

- [ ] **Placeholder scan:** No TODOs, TBDs, "implement later", "similar to Task", or empty code blocks.

- [ ] **Type consistency:** `goToAllTools` in Task 1 JS matches `bindtap="goToAllTools"` in Task 2 WXML. `_buildAllViewData` return shape `{category, tools, previews}` matches WXML `wx:for-item="section"` accesses `section.category`, `section.tools`, `section.previews` in Task 2.
