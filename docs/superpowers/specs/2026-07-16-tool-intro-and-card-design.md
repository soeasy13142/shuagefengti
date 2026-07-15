# 工具介绍页 & 首页卡片重设计 · 设计文档

> 对应脑暴：2026-07-16 tool-intro-and-card brainstorming
> 项目：刷个冯题 · 微信小程序

---

## 目录

1. [概述](#1-概述)
2. [分支一：工具介绍模态弹窗](#2-分支一工具介绍模态弹窗)
3. [分支二：首页卡片放大重设计](#3-分支二首页卡片放大重设计)
4. [数据模型](#4-数据模型)
5. [组件架构](#5-组件架构)
6. [导航流程详图](#6-导航流程详图)
7. [涉及文件清单](#7-涉及文件清单)
8. [不涉及的范围](#8-不涉及的范围)

---

## 1. 概述

为小程序的 7 个已上线硬核工具添加介绍页（居中模态弹窗，首次访问时展示），同时将首页 & 工具大全页的工具卡片放大，展示更丰富的信息（tagline、标签、难度等级）。

**两个分支同时推进，互不阻塞。**

### 覆盖的工具（7 个）

| ID | 名称 |
|---|---|
| `subnet-calc` | 子网计算器 |
| `tcp-viz` | TCP 动画机 |
| `dns-viz` | DNS 解析器 |
| `sort-viz` | 排序可视化 |
| `ds-viz` | 数据结构可视化 |
| `bplus-viz` | B+ 树可视化 |
| `sha256-viz` | SHA-256 演示 |

### 设计风格

遵循 Claude Design 暖奶油画布规范（详见 `CLAUDE.md` 及 `docs/DESIGN.md`）：

| 令牌 | 值 |
|---|---|
| 页面背景 | `#faf9f5` |
| 卡片/模态背景 | `#efe9de` |
| 主色（CTA） | `#cc785c`，Active `#a9583e` |
| 标题字体 | Georgia 衬线，weight 400 |
| 正文字色 | `#141413`（暖墨） |
| 次要文字 | `#6c6a64` |
| 圆角 | 24rpx（卡片/模态），12rpx（标签胶囊） |
| 阴影 | 零阴影，靠色块对比表达深度 |

---

## 2. 分支一：工具介绍模态弹窗

### 2.1 触发时机

| 场景 | 行为 |
|---|---|
| 首次从首页/工具大全页点击工具 | 弹出模态弹窗 |
| 非首次从首页/工具大全页点击工具 | 直接 `wx.navigateTo` 到工具页 |
| 工具页内点击 ℹ︎ 按钮 | 弹出同一模态弹窗（不受首次标记限制） |

### 2.2 首次访问追踪

- 存储 key：`intro_v2_${toolId}`（如 `intro_v2_subnet-calc`）
- 存储值：`true`（Boolean）
- 存储方式：`wx.setStorageSync` / `wx.getStorageSync`
- 作用域：前缀 `intro_v2_` 避免与旧 key 冲突
- 标记时机：用户点击模态中的「开始体验」按钮时写入

### 2.3 UI 布局

```
┌──────────────────────────────────┐
│  ✕                              │
│                                  │
│  子网计算器                       │  ← 工具名（Georgia 16rpx, #6c6a64）
│                                  │
│  ─── 间距 12rpx ───             │
│                                  │
│  IP 地址和子网掩码到底怎么算？     │  ← tagline（Georgia 28rpx, #141413 粗体）
│  一张图看明白                     │
│                                  │
│  ─── 间距 16rpx ───             │
│                                  │
│  子网划分是网络工程师的基本功，     │  ← valueProp（系统字体 14rpx, #141413）
│  也是计网面试的必考题。            │
│                                  │
│  ─── 间距 20rpx ───             │
│                                  │
│  ┌─ 功能 ─────────────────────┐  │
│  │ • 实时计算网络号/广播地址    │  │  ← section（标题 #cc785c 12rpx）
│  │ • 逐位展示二进制转换        │  │     列表项 #141413 14rpx 行高1.8
│  │ • 完整显示子网掩码/主机数    │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌─ 前置知识 ─────────────────┐  │
│  │ 了解 IP 地址和子网掩码的    │  │
│  │ 基本概念即可                │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌─ 适合场景 ─────────────────┐  │
│  │ • 计网面试练习              │  │
│  │ • 网络排障快速确认          │  │
│  │ • 学习 CIDR 编址原理        │  │
│  └────────────────────────────┘  │
│                                  │
│       ┌──────────────┐          │
│       │ 开始体验 →    │          │  ← CTA（#cc785c 底色, 白字, 圆角24rpx）
│       └──────────────┘          │
│                                  │
│   ── 底部微提示 ───              │
│   下次进入将直接打开工具           │  ← 12rpx #6c6a64
│                                  │
└──────────────────────────────────┘
```

### 2.4 尺寸 & 交互参数

| 属性 | 值 |
|---|---|
| 弹窗最大宽度 | 560rpx |
| 弹窗最大高度 | 85vh |
| 弹窗内部滚动 | 内容超出时纵向滚动（仅内容区，非整个弹窗） |
| 圆角 | 24rpx |
| 遮罩层 | rgba(0,0,0,0.4) |
| 弹出动画 | 遮罩 fadeIn 200ms + 弹窗 scale(0.9→1) cubic-bezier |
| 关闭方式 | 点遮罩层 / 点 ✕ 按钮 |
| CTA 按钮 | 珊瑚色 `#cc785c`，active 态 `#a9583e` |

### 2.5 工具页内回看入口

- 每个工具页的 WXML 顶部添加一个 ℹ︎ 图标按钮，定位在页面右上角（position: fixed，top: 16rpx，right: 16rpx）
- 点击后展示相同的 intro-modal 组件（传入当前 toolId）
- 回看时不受首次标记影响，始终展示模态

---

## 3. 分支二：首页卡片放大重设计

### 3.1 影响页面

| 页面 | 改动内容 |
|---|---|
| `pages/index/index` | 卡片尺寸放大，展示 tagline + tags + difficulty |
| `pages/tools-all/tools-all` | 同上 |

### 3.2 卡片新布局

```
  ┌──────────────────────┐
  │                       │
  │  TCP 动画机            │  ← Georgia 18rpx, #141413
  │                       │
  │  三次握手、四次挥手、    │  ← tagline 14rpx, #6c6a64（替换原 description）
  │  丢包重传一看就懂       │
  │                       │
  │  #可视化  #交互式       │  ← tag 胶囊 10rpx
  │  ★★☆  中等            │  ← difficulty 10rpx
  │                       │
  │       进入 →           │  ← 珊瑚色 14rpx
  └──────────────────────┘
```

### 3.3 尺寸变化

| 维度 | 当前卡片 | 新卡片 |
|---|---|---|
| 高度 | ~130rpx | ~230rpx（+100rpx） |
| 宽度 | 2 列，间距 16rpx | 不变 |
| 列数 | 2 | 2（不变） |

### 3.4 与现有样式关系

| 元素 | 变化 |
|---|---|
| 卡片容器 | padding 增加，高度自适应 |
| tool-name | 不变（Georgia 衬线） |
| tool-desc（原） | 替换为 tool-tagline |
| tool-link | 不变（位置下移） |
| 新增 tag 行 | 浅灰圆角胶囊，背景 `#faf9f5` 或透明，边框 1px `#d0ccc0` |
| 新增 difficulty 行 | 星级 ★☆☆/★★☆/★★★ + 文字标签 |

---

## 4. 数据模型

### 4.1 tool-registry.js 扩展

每条现有工具记录新增以下字段：

```js
{
  // 现有字段...
  id: 'subnet-calc',
  name: '子网计算器',
  description: 'IP/CIDR 计算 · 二进制位可视化',

  // ★ 新增 — 卡片用
  tagline: 'IP 地址和子网掩码到底怎么算？一张图看明白',
  tags: ['#可视化', '#交互式'],
  difficulty: 'medium',            // 'easy' | 'medium' | 'advanced'

  // ★ 新增 — 模态用
  intro: {
    valueProp: '子网划分是网络工程师的基本功，也是计网面试的必考题。',
    features: [
      '输入 IP 和前缀长度，实时计算网络号、广播地址、可用主机范围',
      '逐位展示二进制与十进制转换，理解 CIDR 编址原理',
      '完整显示子网掩码、通配符掩码、主机数量等关键信息'
    ],
    prerequisites: '了解 IP 地址和子网掩码的基本概念即可，无需深入二进制计算。',
    useCases: [
      '计网面试：子网划分、CIDR 相关题目练习',
      '网络排障：快速确认 IP 配置是否正确',
      '学习辅助：可视化位运算，理解「与」操作的含义'
    ]
  }
}
```

### 4.2 difficulty 映射表

| 代码 | 显示 | 星级 |
|---|---|---|
| `easy` | 简单 | ★☆☆ |
| `medium` | 中等 | ★★☆ |
| `advanced` | 进阶 | ★★★ |

---

### 5.0 组件注册

intro-modal 组件在 `app.json` 中全局注册，所有页面可直接使用，无需逐页声明：

```json
{
  "usingComponents": {
    "intro-modal": "/components/intro-modal/intro-modal"
  }
}
```

## 5. 组件架构

### 5.1 新增文件

```
components/
  intro-modal/
    intro-modal.js        ← 组件逻辑
    intro-modal.wxml      ← 模态弹窗模板
    intro-modal.wxss      ← 模态弹窗样式
    intro-modal.json      ← 组件声明

utils/
  intro-data.js           ← 7 个工具的介绍文案数据（集中管理）
```

### 5.2 组件接口

intro-modal 组件属性（properties）：

| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `toolId` | String | 是 | 工具 ID，用于从 registry 读取数据 |
| `show` | Boolean | 是 | 控制显示/隐藏 |

intro-modal 组件事件：

| 事件名 | 触发时机 | 返回 |
|---|---|---|
| `close` | 用户点 ✕ 或遮罩 | `{ toolId }` |
| `enter` | 用户点「开始体验」 | `{ toolId }` |

### 5.3 组件使用示例

```html
<!-- pages/index/index.wxml -->
<intro-modal 
  toolId="{{pendingToolId}}"
  show="{{showIntro}}"
  bind:close="onIntroClose"
  bind:enter="onIntroEnter"
/>
```

```js
// pages/index/index.js — onToolTap 增加首次判断
onToolTap(e) {
  const toolId = e.currentTarget.dataset.id;
  const tool = registry.TOOLS.find(t => t.id === toolId);
  if (!tool || !tool.available) return;

  // 检查是否首次（无 intro 的老工具直接跳转，兼容）
  if (!tool.intro) {
    wx.navigateTo({ url: tool.route });
    return;
  }

  const seen = wx.getStorageSync('intro_v2_' + toolId);
  if (seen) {
    wx.navigateTo({ url: tool.route });
  } else {
    this.setData({ pendingToolId: toolId, showIntro: true });
  }
},

onIntroEnter(e) {
  const { toolId } = e.detail;
  const tool = registry.TOOLS.find(t => t.id === toolId);
  wx.setStorageSync('intro_v2_' + toolId, true);
  this.setData({ showIntro: false });
  wx.navigateTo({ url: tool.route });
},

onIntroClose() {
  this.setData({ showIntro: false, pendingToolId: null });
}
```

### 5.4 工具页回看

每个工具页在 .json 中注册 `intro-modal` 组件，在页面顶部添加 ℹ︎ 按钮：

```html
<!-- 每个工具页 .wxml 顶部 -->
<view class="info-bar">
  <view class="info-btn" bindtap="showIntro">
    <text>ℹ︎ 关于此工具</text>
  </view>
</view>

<intro-modal 
  toolId="{{toolId}}" 
  show="{{showIntro}}" 
  bind:close="onIntroClose" 
  bind:enter="onIntroEnter"
/>
```

```js
// 每个工具页 .js
Page({
  data: {
    toolId: 'subnet-calc',  // 每个工具写自己的 ID
    showIntro: false
  },
  showIntro() {
    this.setData({ showIntro: true });
  },
  onIntroClose() {
    this.setData({ showIntro: false });
  },
  onIntroEnter() {
    // 已在工具页内，关闭模态即可，不需要跳转
    this.setData({ showIntro: false });
  }
})
```

---

## 6. 导航流程详图

```
[首页 / 工具大全页]
      │
      │ 用户点工具卡片
      │
      ├── 工具有 intro 数据？─── 否 ──→ wx.navigateTo(工具页)
      │
      │ 是
      │
      ├── wx.getStorageSync('intro_v2_' + id) 为 true？
      │   是 ──→ wx.navigateTo(工具页)
      │   否 ──→ 弹出 intro-modal
      │               │
      │          ┌─────┴─────┐
      │          │           │
      │       点 ✕/遮罩     点「开始体验」
      │          │           │
      │       关闭模态      wx.setStorageSync(id, true)
      │          │           │
      │       留在当前页    wx.navigateTo(工具页)
      │          │           │
      │          └─────┬─────┘
      │                │
      ▼                ▼
  首页             [工具页]
                      │
                      │ 点 ℹ︎ 按钮
                      │
                      ▼
                 弹出 intro-modal（回看模式）
                      │
                 ┌─────┴─────┐
                 │           │
              点 ✕/遮罩     点「开始体验」
                 │           │
              关闭模态      关闭模态（已在工具页内）
```

---

## 7. 涉及文件清单

### 7.1 新增文件

| 文件 | 用途 |
|---|---|
| `components/intro-modal/intro-modal.js` | 模态组件逻辑 |
| `components/intro-modal/intro-modal.wxml` | 模态组件模板 |
| `components/intro-modal/intro-modal.wxss` | 模态组件样式 |
| `components/intro-modal/intro-modal.json` | 模态组件声明 |

### 7.2 修改文件

| 文件 | 改动内容 |
|---|---|
| `app.json` | usingComponents 中全局注册 intro-modal 组件 |
| `utils/tool-registry.js` | 7 个工具新增 tagline / tags / difficulty / intro 字段 |
| `pages/index/index.js` | onToolTap 增加首次判断，新增 onIntroEnter / onIntroClose |
| `pages/index/index.wxml` | 引入 intro-modal 组件，卡片模板增加 tagline/tags/difficulty |
| `pages/index/index.wxss` | 新卡片样式 + 新元素样式 |
| `pages/tools-all/tools-all.js` | 同 index.js — onToolTap 增加首次判断 |
| `pages/tools-all/tools-all.wxml` | 引入 intro-modal，卡片模板更新 |
| `pages/tools-all/tools-all.wxss` | 新卡片样式 |

### 7.3 工具页修改（7 页）

| 文件 | 改动内容 |
|---|---|
| `pages/subnet-calc/subnet-calc.*` | .json 注册组件 + .wxml 加 ℹ︎ 按钮 + .js 加 showIntro |
| `pages/tcp-viz/tcp-viz.*` | 同上 |
| `pages/dns-viz/dns-viz.*` | 同上 |
| `pages/sort-viz/sort-viz.*` | 同上 |
| `pages/ds-viz/ds-viz.*` | 同上 |
| `pages/bplus-viz/bplus-viz.*` | 同上 |
| `pages/sha256-viz/sha256-viz.*` | 同上 |

---

## 8. 不涉及的范围

- 不修改刷题链路（quiz / result / records / wrong-questions / import-preview）
- 不修改 dashboard 页面
- 不改存储层（只新增 `wx.setStorageSync` key，不改现有结构）
- 不修改任何测试文件
- 不修改 `app.json` 页面注册（无新页面）
- 不改 `utils/tool-registry.js` 的导出函数签名（只加数据字段）
- 不改现有工具页面的核心功能（只加 ℹ︎ 按钮）
