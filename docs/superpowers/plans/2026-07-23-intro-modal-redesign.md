# intro-modal 重设计 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重写 intro-modal 组件样式和模板，解决字小、排版难看、易读性低的问题。

**Architecture:** 纯前端改造，不改 JS 逻辑。只动 components/intro-modal/ 下 wxml 和 wxss 两个文件。数据流不变，父组件传 toolId/show，子组件从 registry 读数据后渲染。

**Tech Stack:** 微信小程序原生 WXML + WXSS

**Spec:** `docs/superpowers/specs/2026-07-23-intro-modal-redesign.md`

## 全局约束

- 所有字号 >= 20rpx
- 保持遮罩淡入 + 卡片缩放弹出动画不变
- 不改 intro-modal.js 一行代码
- 不改任何调用方（首页、tools-all、各工具页面）
- 使用 Claude Design 配色：#faf9f5（卡片底色）、#efe9de（弹窗底色）、#cc785c（主色）、#141413（正文）、#6c6a64（次要）

---

### Task 1: 重写 intro-modal.wxml 模板

**Files:**
- Modify: `components/intro-modal/intro-modal.wxml`（全部重写）

**Interfaces:**
- Consumes: `tool` 对象（含 name, tagline, tags, difficulty）、`toolData` 对象（含 valueProp, features, prerequisites, useCases）、`difficultyStars`、`difficultyLabel` — 均来自已有 JS 逻辑
- Produces: 新模板结构供 wxss 渲染

- [ ] **Step 1: 重写 wxml**

将当前平铺列表结构改为：头部区（不滚动）+ 卡片列表区（可滚动）+ 底部按钮区。

```xml
<view class="modal-mask {{animClass}}" wx:if="{{show}}" bindtap="onMaskTap">
  <view class="modal-card {{animClass}}" catchtap="_noop">

    <!-- 关闭按钮 -->
    <view class="modal-close" bindtap="onClose">
      <text class="close-icon">✕</text>
    </view>

    <!-- 头部区：工具名 + tagline + 标签（不滚动） -->
    <view class="modal-header">
      <text class="modal-tool-name">{{tool.name || ''}}</text>
      <text class="modal-tagline" wx:if="{{tool.tagline}}">{{tool.tagline}}</text>
      <view class="modal-tags-row" wx:if="{{difficultyStars || (tool.tags && tool.tags.length > 0)}}">
        <text class="modal-chip modal-chip-diff" wx:if="{{difficultyStars}}">{{difficultyStars}} {{difficultyLabel}}</text>
        <text class="modal-chip modal-chip-tag" wx:for="{{tool.tags}}" wx:for-item="tag" wx:key="*this">{{tag}}</text>
      </view>
    </view>

    <!-- 内容区（滚动） -->
    <scroll-view class="modal-body" scroll-y>

      <!-- 核心价值卡片 -->
      <view class="info-card" wx:if="{{toolData.valueProp}}">
        <view class="info-card-accent"></view>
        <view class="info-card-body">
          <text class="info-card-title">核心价值</text>
          <text class="info-card-text">{{toolData.valueProp}}</text>
        </view>
      </view>

      <!-- 功能列表卡片 -->
      <view class="info-card" wx:if="{{toolData.features && toolData.features.length > 0}}">
        <view class="info-card-accent"></view>
        <view class="info-card-body">
          <text class="info-card-title">功能</text>
          <view class="info-card-list">
            <view class="info-card-list-item" wx:for="{{toolData.features}}" wx:key="*this">
              <text class="info-card-bullet">•</text>
              <text class="info-card-text">{{item}}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 前置知识卡片 -->
      <view class="info-card" wx:if="{{toolData.prerequisites}}">
        <view class="info-card-accent"></view>
        <view class="info-card-body">
          <text class="info-card-title">前置知识</text>
          <text class="info-card-text">{{toolData.prerequisites}}</text>
        </view>
      </view>

      <!-- 适合场景卡片 -->
      <view class="info-card" wx:if="{{toolData.useCases && toolData.useCases.length > 0}}">
        <view class="info-card-accent"></view>
        <view class="info-card-body">
          <text class="info-card-title">适合场景</text>
          <view class="info-card-list">
            <view class="info-card-list-item" wx:for="{{toolData.useCases}}" wx:key="*this">
              <text class="info-card-arrow">▸</text>
              <text class="info-card-text">{{item}}</text>
            </view>
          </view>
        </view>
      </view>

    </scroll-view>

    <!-- 底部按钮区 -->
    <view class="modal-footer">
      <view class="modal-btn" bindtap="onEnter" hover-class="modal-btn-hover">
        <text class="modal-btn-text">开始体验 →</text>
      </view>
      <text class="modal-hint">下次进入将直接打开工具</text>
    </view>

  </view>
</view>
```

- [ ] **Step 2: Commit**

```bash
git add components/intro-modal/intro-modal.wxml
git commit -m "feat: 重写 intro-modal wxml 为卡片布局结构"
```

---

### Task 2: 重写 intro-modal.wxss 样式

**Files:**
- Modify: `components/intro-modal/intro-modal.wxss`（全部重写）

**Interfaces:**
- Consumes: Task 1 生成的 wxml 模板中的 class 名称
- Produces: 完整的弹窗样式

- [ ] **Step 1: 重写 wxss**

完全重写样式，应用新字号体系和卡片布局。

```css
/* ── 遮罩层 ── */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  transition: opacity 200ms ease;
}
.modal-mask.modal-visible {
  opacity: 1;
}

/* ── 弹窗卡片 ── */
.modal-card {
  width: 560rpx;
  max-height: 85vh;
  background: #efe9de;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  transform: scale(0.9);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-card.modal-visible {
  transform: scale(1);
}

/* ── 关闭按钮 ── */
.modal-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.close-icon {
  font-size: 28rpx;
  color: #6c6a64;
  line-height: 1;
}

/* ── 头部区（不滚动） ── */
.modal-header {
  padding: 40rpx 36rpx 0;
  flex-shrink: 0;
}
.modal-tool-name {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 36rpx;
  font-weight: 700;
  color: #141413;
  margin-bottom: 8rpx;
  padding-right: 48rpx;
}
.modal-tagline {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 26rpx;
  font-weight: 400;
  color: #141413;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

/* ── 标签 chips ── */
.modal-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 20rpx;
}
.modal-chip {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20rpx;
  line-height: 1;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}
.modal-chip-diff {
  background: #efe9de;
  color: #6c6a64;
  border: 2rpx solid #ddd7cc;
}
.modal-chip-tag {
  background: rgba(204, 120, 92, 0.1);
  color: #cc785c;
  border: 2rpx solid rgba(204, 120, 92, 0.25);
}

/* ── 内容区域（滚动） ── */
.modal-body {
  padding: 0 36rpx;
  max-height: 60vh;
  overflow-y: auto;
  box-sizing: border-box;
}

/* ── 信息卡片 ── */
.info-card {
  background: #faf9f5;
  border-radius: 16rpx;
  display: flex;
  flex-direction: row;
  margin-bottom: 24rpx;
  overflow: hidden;
}
.info-card:last-child {
  margin-bottom: 0;
}
.info-card-accent {
  width: 4rpx;
  background: #cc785c;
  flex-shrink: 0;
}
.info-card-body {
  flex: 1;
  padding: 24rpx;
}
.info-card-title {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 22rpx;
  font-weight: 600;
  color: #141413;
  margin-bottom: 12rpx;
}
.info-card-text {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 26rpx;
  font-weight: 400;
  color: #141413;
  line-height: 1.7;
}
.info-card-list {
  display: flex;
  flex-direction: column;
}
.info-card-list-item {
  display: flex;
  flex-direction: row;
  margin-bottom: 12rpx;
}
.info-card-list-item:last-child {
  margin-bottom: 0;
}
.info-card-bullet {
  font-size: 26rpx;
  color: #cc785c;
  margin-right: 12rpx;
  line-height: 1.7;
  flex-shrink: 0;
}
.info-card-arrow {
  font-size: 24rpx;
  color: #cc785c;
  margin-right: 12rpx;
  line-height: 1.8;
  flex-shrink: 0;
}

/* ── 底部 ── */
.modal-footer {
  padding: 20rpx 36rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.modal-btn {
  width: 100%;
  height: 88rpx;
  background: #cc785c;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}
.modal-btn-hover {
  background: #a9583e;
}
.modal-btn-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}
.modal-hint {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20rpx;
  color: #6c6a64;
}
```

- [ ] **Step 2: 验证基本渲染**

用 wechatide-skill 截个图确认弹窗能正常打开、内容显示正确。

- [ ] **Step 3: Commit**

```bash
git add components/intro-modal/intro-modal.wxss
git commit -m "feat: 重写 intro-modal wxss 字号体系和卡片布局"
```

---

### Task 3: 端到端验证

**Files:**
- 无代码修改，仅验证

- [ ] **Step 1: 用微信开发者工具验证**

打开首页 → 点击一个有 intro 的工具 → 确认弹窗显示正确。
检查要点：
- 头部区显示工具名、tagline、难度标签、分类标签
- 每张信息卡片有左侧色条
- 所有字号 >= 20rpx（可用肉眼判断）
- 内容可滚动
- CTA 按钮可点击跳转
- 关闭按钮和遮罩点击关闭正常
- 第二次点击同工具不再弹窗

- [ ] **Step 2: 运行 npm test**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```
Expected: 全部通过。
