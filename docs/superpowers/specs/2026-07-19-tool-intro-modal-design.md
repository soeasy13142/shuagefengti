# 工具使用说明弹窗 · Design Spec

> 为复杂工具页面（如死锁模拟器）新增「首次进入时自动弹出使用说明 + ℹ︎ 按钮回看」功能。

---

## 1. 目标与范围

### 目标
- 用户点击工具卡片 → 进入工具页面 → 页面加载后自动弹出使用说明模态框
- 大标题：「此工具较为复杂，请阅读使用说明」
- 正文：针对该工具的具体操作指引
- 首次阅读并关闭后不再自动弹出，可通过 ℹ︎ 浮动按钮手动回看

### MVP 范围（本次）
- ✅ **死锁模拟器**（`pages/deadlock/`）—— 操刀工具
- 后续工具待扩展（不在本次范围）

### 与 `feature/tool-intro-modal` 分支的关键差异

| 维度 | Ref 分支 | 本次方案 |
|---|---|---|
| 触发时机 | 首页拦截弹窗，再导航进页面 | **先进入页面 → 再弹窗** |
| 弹窗标题 | 无统一大标题 | **「此工具较为复杂，请阅读使用说明」** |
| 正文字号 | 12-16rpx（过小，≈6-8px） | 26-28rpx（标准可读） |
| 弹窗内容 | `valueProp/features/prerequisites/useCases`（通用介绍） | **定制化使用说明**（操作指引） |
| 关闭行为 | 关闭不标记已读，需点「开始体验」 | 关闭即标记已读，下次不自动弹 |
| ℹ︎ 按钮样式 | 跨 7 页面复制 CSS | 组件自带样式，零重复 |

---

## 2. 架构

### 分层设计（3 层）

```
┌─────────────────────────────────────────┐
│  第 3 层 · 页面层                         │
│  pages/deadlock/deadlock.{js,wxml,wxss}  │
│  - onLoad 检查首次访问 → 自动弹窗         │
│  - ℹ︎ 按钮 → 手动回看                    │
│  - onIntroClose → 标记已读               │
├─────────────────────────────────────────┤
│  第 2 层 · 组件层                         │
│  components/intro-modal/                 │
│  - 全局注册（app.json）                   │
│  - 接收 toolId → 从 registry 读 intro 数据 │
│  - 渲染模态框（遮罩 + 卡片 + 内容）        │
├─────────────────────────────────────────┤
│  第 1 层 · 数据层                         │
│  utils/tool-registry.js                  │
│  - 每个工具新增 intro 字段（使用说明内容）  │
└─────────────────────────────────────────┘
```

### 数据流

```
onLoad()
  └→ _checkFirstVisit()
       └→ wx.getStorageSync('intro_seen_deadlock')
            ├─ false → setData({ showIntro: true })
            │           └→ <intro-modal show="{{showIntro}}" />
            │               ├─ 用户点「我知道了」/ 遮罩 / ✕
            │               │   └→ wx.setStorageSync('intro_seen_deadlock', true)
            │               │   └→ setData({ showIntro: false })
            │               └─ 用户点 ℹ︎ 回看
            │                   └→ setData({ showIntro: true })
            └─ true → 不弹窗，正常显示页面
```

---

## 3. 组件设计：`intro-modal`

### 3.1 WXML 结构

```
<view class="modal-mask {{show ? 'mask-visible' : ''}}" bindtap="onMaskTap">
  <view class="modal-card {{show ? 'card-visible' : ''}}" catchtap="noop">
    <!-- 关闭按钮 ✕ -->
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

    <!-- 底部按钮 -->
    <view class="modal-footer">
      <view class="modal-btn" bindtap="onEnter">
        <text class="modal-btn-text">我知道了，开始使用 →</text>
      </view>
    </view>
  </view>
</view>
```

说明：使用 `introContent` 单字段富文本，而非分多个子字段（valueProp/features/prerequisites/useCases）。原因是使用说明是连续叙述性文本，拆成多个子段落在模板中反而难以灵活排版。

### 3.2 WXSS 要点（修正 ref 分支的字体问题）

| 选择器 | 字号 | 字重 | 字体 |
|---|---|---|---|
| `.modal-title` | **32rpx** | 600 | Georgia, serif |
| `.modal-content` | **26rpx** | 400 | -apple-system, sans-serif |
| `.modal-btn-text` | 28rpx | 500 | -apple-system, sans-serif |
| `.close-icon` | 32rpx | — | — |

- 卡片尺寸：宽 580rpx，max-height 80vh
- 背景 #efe9de，圆角 24rpx
- 入场：scale(0.92)→scale(1) + fadeIn，cubic-bezier(0.34,1.56,0.64,1) 弹性曲线
- 遮罩：rgba(0,0,0,0.4)，z-index 999

### 3.3 JS 逻辑

```javascript
Component({
  properties: {
    show: { type: Boolean, value: false, observer: '_onShowChange' },
    introContent: { type: String, value: '' }  // 由页面传入
  },
  methods: {
    onMaskTap() { this._close(); },
    onClose() { this._close(); },
    onEnter() { this._close(); },
    _close() {
      this.setData({ show: false });
      this.triggerEvent('close');
    },
    _onShowChange(show) {
      // 用 wx.nextTick 代替 setTimeout 避免竞态
      wx.nextTick(() => this.setData({ animReady: show }));
    }
  }
})
```

关键改进：
- 页面通过 `introContent` 直接传入，而非内部查 registry（更灵活、更可控）
- 用 `wx.nextTick` 替代任意的 `setTimeout(30)` 避免动画竞态

### 3.4 组件注册

在 `app.json` 的 `usingComponents` 中全局注册：

```json
"usingComponents": {
  "intro-modal": "/components/intro-modal/intro-modal"
}
```

---

## 4. 页面层改动：死锁模拟器

### 4.1 deadlock.js

```javascript
// 新增 data 字段
data: {
  // ...原有 data
  showIntro: false,
  introContent: ''  // 使用说明内容
}

// onLoad 追加
onLoad: function() {
  // 原有初始化
  this._computeNodePositions();
  this._updateVisualEdges();
  this._computeNeed();
  // 新增：检查首次访问
  this._checkFirstVisit();
}

_checkFirstVisit() {
  const seen = wx.getStorageSync('intro_seen_deadlock');
  if (!seen) {
    // 读取使用说明内容
    this.setData({
      introContent: DEADLOCK_INTRO,
      showIntro: true
    });
  }
}

// ℹ︎ 按钮回看
showIntro() {
  if (!this.data.introContent) {
    this.setData({ introContent: DEADLOCK_INTRO });
  }
  this.setData({ showIntro: true });
}

// 关闭弹窗
onIntroClose() {
  wx.setStorageSync('intro_seen_deadlock', true);
  this.setData({ showIntro: false });
}
```

### 4.2 deadlock.wxml

在页面顶部增加：

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

### 4.3 deadlock.wxss

```css
/* ℹ︎ 浮动按钮 */
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
.info-btn:active { opacity: 0.5; }
.info-btn-icon { font-size: 28rpx; color: #6c6a64; }
```

---

## 5. 使用说明内容：死锁模拟器

定义为常量 `DEADLOCK_INTRO`（在 deadlock.js 顶部或独立 `const` 文件）：

```javascript
const DEADLOCK_INTRO = `死锁模拟器是一个交互式教学工具，帮助你直观理解死锁的两种经典分析手段。

━━ 资源分配图（RAG）模式 ━━
• 点击「+进程」「+资源」添加节点（上限各 5 个）
• 先点「请求边」或「分配边」选择连线类型
• 依次点击两个节点建立连线（进程→资源为请求边，资源→进程为分配边）
• 点击「检测死锁」自动判断当前状态是否死锁
• 支持拖拽节点调整布局
• 内置 3 种预设场景快速体验

━━ 银行家算法模式 ━━
• 调整进程数和资源类型数，自动生成输入矩阵
• 在 Max 和 Allocation 单元格中输入数值
• Need 矩阵自动计算（Max - Allocation）
• 点击「检测安全性」运行算法
• 查看安全序列和每步的 Work/Need/Allocation 追踪
• 内置 3 种预设场景

━━ 结果解读 ━━
• ✅ 安全状态：显示安全序列，所有进程可顺利完成
• ❌ 死锁/不安全：红色标记死锁进程，显示环路路径
• 步骤追踪中 ✓ 表示满足条件，✗ 表示不满足

💡 节点上限各 5 个，超出后添加按钮自动禁用
💡 选中节点后再次点击可取消选择`;
```

---

## 6. 错误处理

| 场景 | 处理方式 |
|---|---|
| `wx.getStorageSync` 异常 | 静默降级，视为已阅读（不弹窗），不影响页面正常使用 |
| 快速连续开关弹窗 | `wx.nextTick` 防抖，避免动画竞态 |
| 组件注册失败 | 页面 `setData` 不报错，ℹ︎ 按钮失效但不影响核心功能 |
| `introContent` 为空 | 弹窗不展示，静默降级 |

---

## 7. 测试方案

| 测试类型 | 内容 |
|---|---|
| 组件渲染测试 | intro-modal 在 show=true/false 时正确显示/隐藏 |
| 存储检查测试 | 首次访问弹出，再次访问不弹出 |
| ℹ︎ 按钮测试 | 点击后弹出模态框，再次关闭 |
| 关闭标记测试 | 关闭弹窗后设置 storage，下次进入不弹 |
| 兼容性 | pages 页面在不注册组件时不会崩溃 |

---

## 8. 文件清单

| 操作 | 文件 | 说明 |
|---|---|---|
| **新增** | `components/intro-modal/intro-modal.js` | 组件逻辑 |
| **新增** | `components/intro-modal/intro-modal.wxml` | 组件模板 |
| **新增** | `components/intro-modal/intro-modal.wxss` | 组件样式 |
| **新增** | `components/intro-modal/intro-modal.json` | 组件配置 |
| **修改** | `app.json` | 全局注册组件 |
| **修改** | `pages/deadlock/deadlock.js` | 首次访问检测 + ℹ︎ 逻辑 + 说明内容 |
| **修改** | `pages/deadlock/deadlock.wxml` | 引入组件 + ℹ︎ 按钮 |
| **修改** | `pages/deadlock/deadlock.wxss` | ℹ︎ 按钮样式 |

---

## 9. 后续扩展（不在本次范围）

- 扩展到其他复杂工具页面（CPU 调度、SHA-256、TCP 等）
- 组件支持 Markdown 渲染（当前用纯文本）
- 支持更丰富的排版（多段落、代码块、图示等）
- 多语言支持
