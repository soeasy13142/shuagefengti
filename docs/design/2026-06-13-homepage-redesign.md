# 首页信息架构重设计 — 交接文档

> 生成时间：2026-06-13
> 项目：刷个冯题微信小程序
> 目的：解决当前首页功能分布不合理、入口设计不合理的架构问题，提供可扩展的首页信息架构方案，支持现有 8 个模块 + 未来 10-19 个新工具的平滑接入。
> 状态：设计文档，待用户审阅确认后进入实现。

---

## 1. 当前首页问题诊断

### 1.1 结构分析（现状）

```
当前首页层级：
┌─────────────────────────────────────┐
│ Hero: 刷个冯题 + 开始刷题 CTA        │  ← 正确：核心行为最突出
├─────────────────────────────────────┤
│ 工具 Tools 标签                      │
│  ├─ 学习驾驶舱（全宽卡片）            │  ← 问题：不是"工具"，是数据面板
│  ├─ 网工工具 NETools                 │
│  │   ├─ 子网计算器 | TCP 动画机      │
│  └─ 通用工具 Utilities               │
│      ├─ 排序可视化 | 单词记忆(灰)     │  ← 问题：单词记忆占位未实现
├─────────────────────────────────────┤
│ 快捷入口：答题记录 | 错题本           │  ← 正确：辅助入口收在底部
└─────────────────────────────────────┘
```

### 1.2 诊断出的六个架构问题

#### 问题 1：学习驾驶舱位置错乱

学习驾驶舱（Dashboard）是**数据统计面板**，不是"工具"。把它放在 `工具 Tools` 区域、用和工具卡片一样的视觉样式，语义上是错误的。用户会困惑：这是一个工具还是什么？

**根因**：首页缺乏「学习状态区」这个语义层。

#### 问题 2：分类出现太早

当前只有 4 个工具（子网、TCP、排序、单词记忆），就分了 2 个子类（网工工具 2 个 / 通用工具 2 个）。8 个模块就启用分类是一种**过早抽象**——当工具数量翻倍到 12-20 个时，当前分类体系必然需要重做。

**根因**：没有为未来扩展留出可伸缩的分类框架。

#### 问题 3：工具增长无承载空间

脑暴文档已有 19 个候选功能。即使只做第一梯队（TLS 动画机、进程调度、RSA 演算器、DNS 解析器、HTTP 解析器），也需要从 4 个工具扩展到 9 个工具。当前两列卡片网格最多容纳 6-8 个卡片（3-4 行），超出后页面过长，用户需要大量滚动。

**根因**：没有设计工具浏览的**渐进式信息披露**（Progressive Disclosure）。

#### 问题 4：刷题模块与工具模块权重失衡

刷题（Hero CTA）是核心功能，权重最高——正确。但当前设计中，刷题只占 Hero 区域，其子页面（quiz-list、records、wrong-questions）的入口散落在首页不同位置，缺乏**统一的「我的学习」入口感知**。

#### 问题 5：「单词记忆」是 dead space

首页有一张灰色不可点击的卡片占位，不仅浪费空间，还让用户感觉产品不完整。在产品没有实际计划开发该功能时，应该移除或用其他可用工具替代。

#### 问题 6：缺少「工具发现」机制

当工具超过 6 个时，用户无法一眼扫到所有工具。当前设计没有分类浏览、搜索、或"最近使用"等发现机制。

---

## 2. 设计目标

| 目标 | 说明 | 优先级 |
|---|---|---|
| **语义正确** | 学习功能（刷题、驾驶舱、记录、错题）和工具功能（子网、TCP、密码学等）在信息架构上有清晰区分 | P0 |
| **可伸缩** | 首页能承载 4 个工具（现状）、12 个工具（一期扩展）、20+ 个工具（远期），不需要再次重设计 | P0 |
| **视觉克制** | 继续 Claude Design 暖奶油画布风格，零阴影，靠色块区分层级。不引入新的设计语言 | P0 |
| **快速触达** | 核心行为（开始刷题）1 次点击可达。高频工具 1 次点击可达。低频工具最多 2 次点击可达 | P1 |
| **新用户友好** | 第一次打开首页就能理解"这个小程序能做什么"，而不是面对一堵工具墙 | P1 |
| **低实现成本** | 不动现有页面路由结构，不动 tabBar。首页改 WXML/WXSS/JS + 新增一个工具分类索引页 | P1 |

---

## 3. 信息架构设计

### 3.1 功能分区模型

将所有功能划分为**四个语义层**：

```
语义层 1：「我的学习」── 刷题相关的一切
  ├─ 开始刷题（核心 CTA）
  ├─ 答题记录
  └─ 错题本

语义层 2：「学习状态」── 数据可视化
  └─ 学习驾驶舱（Dashboard）

语义层 3：「工具箱」── 所有 CS 工具
  ├─ 计算机网络（子网、TCP、TLS、DNS、HTTP、IP分片、NAT）
  ├─ 操作系统（进程调度、内存分页、死锁、磁盘调度、同步互斥）
  ├─ 密码学（RSA、AES、DH、SHA-256、密码工具箱）
  ├─ 算法 & 数据结构（排序可视化、数据结构可视化）
  └─ 编译原理（Regex→DFA、LL(1)、词法、AST）

语义层 4：「系统」── 设置、关于、备案号
  └─ 备案号（当前唯一）
```

### 3.2 首页五个区域（Zone）

```
┌─────────────────────────────────────┐
│ ZONE 1 — HERO                       │  不变核心
│ 刷个冯题 · Tagline · 开始刷题 CTA    │
├─────────────────────────────────────┤
│ ZONE 2 — 学习状态条（STATUS BAR）     │  新增
│ 累计刷题 128 │ 练习 15次 │ 正确率 78% │  点击 → Dashboard
├─────────────────────────────────────┤
│ ZONE 3 — 工具箱（TOOLS）             │  重构
│ 分类标签栏（横向滚动/切换）            │
│ [全部] [计算机网络] [OS] [密码学] …   │
│ ┌──────────┬──────────┐             │
│ │ 工具卡片  │ 工具卡片  │             │  2 列网格
│ ├──────────┼──────────┤             │
│ │ 工具卡片  │ 工具卡片  │             │  每页 4-8 张卡片
│ └──────────┴──────────┘             │
├─────────────────────────────────────┤
│ ZONE 4 — 快捷入口（SHORTCUTS）        │  保持
│ 答题记录  ›  │  错题本  ›            │
├─────────────────────────────────────┤
│ ZONE 5 — 备案号                      │  保持
└─────────────────────────────────────┘
```

### 3.3 Zone 详解

#### Zone 1 — Hero（保持现有设计）

**不改动**。Hero 区域当前设计已经很好：
- Georgia 衬线大标题 `刷个冯题`
- 28rpx tagline
- 全宽珊瑚色 CTA 按钮 `开始刷题`
- 辅助描述文字

点击 CTA → `/pages/quiz-list/quiz-list`

#### Zone 2 — 学习状态条（STATUS BAR）

**新增**。一个紧凑的横向指标条，取代当前「学习驾驶舱」全宽工具卡片的位置。

```
┌──────────────────────────────────────┐
│  📊 学习概览                  进入 ›  │
│  ┌──────┬──────┬──────┬──────┐      │
│  │ 128  │  15  │ 78%  │  23  │      │
│  │累计刷题│练习次数│正确率 │错题数 │      │
│  └──────┴──────┴──────┴──────┘      │
└──────────────────────────────────────┘
```

**设计要点**：
- 奶油卡片背景 `#efe9de`，圆角 24rpx
- 4 个指标等宽排列，数值大号珊瑚色加粗，标签小号次要文字色
- 整条可点击 → 跳转 `/pages/dashboard/dashboard`
- 数据来源：`storage.getRecords()` + `storage.getWrongQuestions()` + `analytics.buildDashboardData()`
- 空状态处理：无数据时显示引导文案"完成一次练习后查看学习数据"（替代 4 个 0）
- **不再作为"工具卡片"出现**——学习驾驶舱退出工具区，进入它本应归属的「学习状态」层

#### Zone 3 — 工具箱（TOOLS）

**全面重构**。这是本次设计的核心。

##### 3.3.1 分类体系

```
工具分类层次（Hierarchical）：

计算机网络（network）
  ├─ 子网计算器         subnet-calc     ✅ 已实现
  ├─ TCP 动画机          tcp-viz         ✅ 已实现
  ├─ TLS 动画机          tls-viz         ⬜ 待实现 (A1)
  ├─ DNS 解析器          dns-viz         ⬜ 待实现 (A2)
  ├─ HTTP 解析器         http-parser     ⬜ 待实现 (A3)
  ├─ IP 分片可视化       ip-fragment     ⬜ 待实现 (A4)
  └─ NAT 模拟器          nat-viz         ⬜ 待实现 (A5)

操作系统（os）
  ├─ 进程调度可视化      cpu-sched       ⬜ 待实现 (B1)
  ├─ 内存分页可视化      mem-paging      ⬜ 待实现 (B2)
  ├─ 死锁模拟器          deadlock        ⬜ 待实现 (B3)
  ├─ 磁盘调度可视化      disk-sched      ⬜ 待实现 (B4)
  └─ 同步互斥演示        sync-viz        ⬜ 待实现 (B5)

密码学（crypto）
  ├─ RSA 演算器          rsa-calc        ⬜ 待实现 (C1)
  ├─ AES 演示            aes-viz         ⬜ 待实现 (C2)
  ├─ DH 密钥交换         dh-viz          ⬜ 待实现 (C3)
  ├─ SHA-256 演示        sha256-viz      ⬜ 待实现 (C4)
  └─ 密码工具箱           crypto-tools    ⬜ 待实现 (C5)

算法 & 数据结构（algo）
  ├─ 排序可视化          sort-viz        ✅ 已实现
  └─ 数据结构可视化      ds-viz          ⬜ 待实现 (规划 §28)

编译原理（compiler）
  ├─ Regex→DFA          regex-dfa       ⬜ 待实现 (D1)
  ├─ LL(1) 分析器        ll1-parser      ⬜ 待实现 (D2)
  ├─ 词法分析器          lexer-viz       ⬜ 待实现 (D3)
  └─ AST 构建器          ast-builder     ⬜ 待实现 (D4)
```

##### 3.3.2 分类标签栏（Category Tabs）

```
[全部工具] [计算机网络] [操作系统] [密码学] [算法&DS] [编译原理]
```

**设计要点**：
- 横向排列，超出屏幕宽度时可左右滑动（`scroll-view` + `scroll-x`）
- 选中态：珊瑚色文字 + 底部 4rpx 珊瑚色下划线
- 未选中态：次要文字色 `#6c6a64`
- 默认选中「全部工具」
- 每个标签旁可选显示该分类已实现工具数（如 `计算机网络 · 2`）

##### 3.3.3 「全部工具」视图

当选中「全部工具」标签时，展示一个 **Bento 网格**：

```
┌─────────────────────────────────────┐
│  计算机网络                          │
│ ┌──────────┬──────────┐             │
│ │ 子网计算器 │ TCP 动画机 │             │  ← 每分类展示最多 4 张（2 行）
│ └──────────┴──────────┘             │
│         查看更多网络工具 ›             │
├─────────────────────────────────────┤
│  算法 & 数据结构                      │
│ ┌──────────┐                        │
│ │ 排序可视化 │                        │  ← 只有 1 个工具时占半宽
│ └──────────┘                        │
├─────────────────────────────────────┤
│  ... 其他分类（仅展示已实现工具的）    │
└─────────────────────────────────────┘
```

**规则**：
- 只展示有已实现工具的分类（无工具的分类不出现，避免空白区）
- 每个分类展示最多 2 行（4 张卡片），超出部分通过"查看更多 ›"链接到分类页
- 如果该分类只有 1 个工具，卡片占半宽（不强制拉伸为全宽）
- 分类标题用 `sub-label` 样式（UPPERCASE 小标签 + letter-spacing）

##### 3.3.4 单一分类视图

当选中具体分类（如「计算机网络」）时，展示完整 2 列网格：

```
┌─────────────────────────────────────┐
│ ┌──────────┬──────────┐             │
│ │ 子网计算器 │ TCP 动画机 │             │
│ │    ✅     │    ✅     │             │
│ ├──────────┼──────────┤             │
│ │ TLS 动画机 │ DNS 解析器 │             │
│ │    ⬜     │    ⬜     │             │
│ ├──────────┼──────────┤             │
│ │ HTTP 解析器│ IP 分片   │             │
│ │    ⬜     │    ⬜     │             │
│ └──────────┴──────────┘             │
└─────────────────────────────────────┘
```

**规则**：
- 2 列等宽网格，`gap: 20rpx`
- 已实现的工具：奶油卡片 `#efe9de`，珊瑚色链接 `进入 ›`
- 未实现的工具（计划中）：降低不透明度 `opacity: 0.4`，标签改为`即将上线`
- 未实现工具**仍展示卡片**，让用户感知产品路线图

##### 3.3.5 工具卡片样式规范

```css
.tool-card {
  background: #efe9de;          /* 奶油卡片 */
  border-radius: 24rpx;          /* 统一圆角 */
  padding: 32rpx 24rpx 28rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  /* 零阴影 — Claude Design 核心原则 */
}

.tool-card:active {
  background: #e8e0d2;          /* 按下态深奶油 */
}

.tool-card.tool-disabled {
  opacity: 0.40;                 /* 未实现工具降低不透明度 */
}
```

卡片内部结构：
```
┌──────────────┐
│ 🌐            │  ← 图标 48rpx
│              │
│ 子网计算器     │  ← 名称 30rpx, weight 500, #141413
│              │
│ 进入 ›        │  ← 链接文字 24rpx, #cc785c
│ (或 即将上线)  │  ← 禁用态用 #6c6a64 + "即将上线"
└──────────────┘
```

#### Zone 4 — 快捷入口

保持现有设计（奶油卡片 + 分割线 + 两行），但文案微调：

- `答题记录 ‹`   → 不变，点击 → `/pages/records/records`
- `错题本 ‹`      → 不变，点击 → `/pages/wrong-questions/wrong-questions`

#### Zone 5 — 备案号

完全不变。

---

## 4. 数据结构设计

### 4.1 工具注册表（`utils/tool-registry.js`）

新建一个工具注册模块，作为所有工具的**单一事实来源**：

```js
/**
 * 工具注册表
 * 
 * 所有工具在此注册。新增工具只需在此文件追加一条记录。
 * 首页、分类页、搜索等全部读取此注册表。
 */

const TOOL_CATEGORIES = [
  {
    id: 'network',
    name: '计算机网络',
    icon: '🌐',
    order: 1
  },
  {
    id: 'os',
    name: '操作系统',
    icon: '💻',
    order: 2
  },
  {
    id: 'crypto',
    name: '密码学',
    icon: '🔐',
    order: 3
  },
  {
    id: 'algo',
    name: '算法 & 数据结构',
    icon: '📊',
    order: 4
  },
  {
    id: 'compiler',
    name: '编译原理',
    icon: '⚙️',
    order: 5
  }
];

const TOOLS = [
  // ── 计算机网络 ──
  {
    id: 'subnet-calc',
    category: 'network',
    name: '子网计算器',
    icon: '🌐',
    description: 'IP/CIDR 计算 · 二进制位可视化 · AND 运算动画',
    route: '/pages/subnet-calc/subnet-calc',
    available: true,
    featured: true,
    order: 1
  },
  {
    id: 'tcp-viz',
    category: 'network',
    name: 'TCP 动画机',
    icon: '🔗',
    description: '三次握手 · 四次挥手 · 滑动窗口 · 丢包重传',
    route: '/pages/tcp-viz/tcp-viz',
    available: true,
    featured: true,
    order: 2
  },
  {
    id: 'tls-viz',
    category: 'network',
    name: 'TLS 动画机',
    icon: '🔒',
    description: 'TLS 1.3 握手 · 证书链 · 密钥交换',
    route: '/pages/tls-viz/tls-viz',
    available: false,
    featured: false,
    order: 3
  },
  // ... 其余工具同理

  // ── 算法 & 数据结构 ──
  {
    id: 'sort-viz',
    category: 'algo',
    name: '排序可视化',
    icon: '📊',
    description: '选择排序 · 冒泡排序 · 快速排序',
    route: '/pages/sort-viz/sort-viz',
    available: true,
    featured: true,
    order: 1
  }
  // ...
];

/**
 * 获取所有已实现的工具
 */
function getAvailableTools() {
  return TOOLS.filter(t => t.available);
}

/**
 * 获取指定分类下的所有工具
 */
function getToolsByCategory(categoryId) {
  return TOOLS
    .filter(t => t.category === categoryId)
    .sort((a, b) => a.order - b.order);
}

/**
 * 获取所有有已实现工具的分类（用于「全部工具」视图）
 */
function getActiveCategories() {
  return TOOL_CATEGORIES.filter(cat =>
    TOOLS.some(t => t.category === cat.id && t.available)
  );
}

/**
 * 获取首页精选工具（featured + available，最多 maxCount 个）
 */
function getFeaturedTools(maxCount) {
  return TOOLS
    .filter(t => t.available && t.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, maxCount);
}

module.exports = {
  TOOL_CATEGORIES,
  TOOLS,
  getAvailableTools,
  getToolsByCategory,
  getActiveCategories,
  getFeaturedTools
};
```

**设计原则**：
- **单一事实来源**：所有工具信息在这里注册，首页 JS 只读取不硬编码
- **新增工具零摩擦**：添加一条 TOOLS 记录即可，首页自动渲染
- **可测试**：纯函数模块，用 Jest 测试分类过滤、排序等逻辑
- **featured 标记**：控制哪些工具在「全部工具」视图中作为代表展示

### 4.2 首页 data 结构（`pages/index/index.js`）

```js
const storage = require('../../utils/storage');
const { buildDashboardData } = require('../../utils/analytics');
const {
  TOOL_CATEGORIES,
  getToolsByCategory,
  getActiveCategories,
  getFeaturedTools
} = require('../../utils/tool-registry');

Page({
  data: {
    // ── 动画 ──
    show: false,
    heroTapped: false,

    // ── Zone 2：学习状态条 ──
    stats: {
      totalQuestions: 0,
      totalSessions: 0,
      averageAccuracy: 0,
      wrongCount: 0,
      hasData: false
    },

    // ── Zone 3：工具箱 ──
    activeCategory: 'all',              // 当前选中的分类 ID 或 'all'
    categories: TOOL_CATEGORIES,         // 所有分类（用于标签栏渲染）
    activeCategories: [],                // 有已实现工具的分类
    currentTools: [],                    // 当前选中分类下的工具列表
    featuredTools: []                    // 「全部工具」视图下的精选工具

    // ── Zone 4/5 不变 ──
  },

  onShow() {
    this.loadStats();
    this.loadTools();
  },

  loadStats() {
    const records = storage.getRecords();
    const wrongQuestions = storage.getWrongQuestions();
    const papers = storage.getPapers();
    const dashboard = buildDashboardData(records, wrongQuestions, papers, new Date());

    this.setData({
      stats: {
        totalQuestions: dashboard.overview.totalQuestions,
        totalSessions: dashboard.overview.totalSessions,
        averageAccuracy: dashboard.overview.averageAccuracy,
        wrongCount: dashboard.overview.wrongCount,
        hasData: dashboard.overview.totalSessions > 0
      }
    });
  },

  loadTools() {
    const activeCategories = getActiveCategories();
    const featuredTools = getFeaturedTools(12);
    const currentTools = getToolsByCategory(this.data.activeCategory);

    this.setData({
      activeCategories,
      featuredTools,
      currentTools
    });
  },

  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    const currentTools = categoryId === 'all'
      ? []
      : getToolsByCategory(categoryId);

    this.setData({
      activeCategory: categoryId,
      currentTools
    });
  },

  onToolTap(e) {
    const { id, available } = e.currentTarget.dataset;
    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    const tool = TOOLS.find(t => t.id === id);
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  },

  // ... 其他已有方法不变
});
```

---

## 5. WXML 结构设计

### 5.1 首页 WXML 骨架

```html
<view class="page">

  <!-- ═══ ZONE 1: HERO（保持） ═══ -->
  <view class="hero-band {{show ? 'anim-in' : ''}}">
    <text class="hero-title">刷个冯题</text>
    <text class="hero-tagline">刷题千万道，考试不怕考</text>
    <view class="hero-cta {{heroTapped ? 'tapped' : ''}}"
          bindtap="onHeroTap"
          hover-class="cta-hover" hover-stay-time="100">
      <text class="cta-text">开始刷题</text>
    </view>
    <text class="hero-sub">导入试题 · 5 种题型 · 练习 / 考试</text>
  </view>

  <!-- ═══ ZONE 2: 学习状态条（新增） ═══ -->
  <view class="stats-band {{show ? 'anim-up' : ''}}"
        bindtap="goDashboard">
    <view class="stats-header">
      <text class="stats-title">学习概览</text>
      <text class="stats-link">进入 ›</text>
    </view>
    <view class="stats-grid" wx:if="{{stats.hasData}}">
      <view class="stats-item">
        <text class="stats-value">{{stats.totalQuestions}}</text>
        <text class="stats-label">累计刷题</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">{{stats.totalSessions}}</text>
        <text class="stats-label">练习次数</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">{{stats.averageAccuracy}}%</text>
        <text class="stats-label">正确率</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">{{stats.wrongCount}}</text>
        <text class="stats-label">错题数</text>
      </view>
    </view>
    <view class="stats-empty" wx:else>
      <text class="stats-empty-text">完成一次练习后查看学习数据</text>
    </view>
  </view>

  <!-- ═══ ZONE 3: 工具箱（重构核心） ═══ -->
  <view class="tools-band {{show ? 'anim-up' : ''}}">
    <text class="band-label">工具箱 Tools</text>

    <!-- 分类标签栏（横向滚动） -->
    <scroll-view class="category-tabs" scroll-x enable-flex>
      <view class="category-tab {{activeCategory === 'all' ? 'active' : ''}}"
            data-id="all" bindtap="onCategoryTap">
        <text>全部工具</text>
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

    <!-- 「全部工具」视图：Bento 网格 -->
    <block wx:if="{{activeCategory === 'all'}}">
      <view wx:for="{{activeCategories}}" wx:key="id" wx:for-item="cat">
        <!-- 仅展示有已实现工具的分类，在此处 wxml 中用 wxs 或已过滤好的数据 -->
        <!-- 每个分类标题 + 至多 4 张卡片 -->
      </view>
    </block>

    <!-- 单一分类视图：2 列完整网格 -->
    <view class="tool-grid" wx:else>
      <view
        class="tool-card {{item.available ? '' : 'tool-disabled'}}"
        wx:for="{{currentTools}}"
        wx:key="id"
        data-id="{{item.id}}"
        data-available="{{item.available}}"
        bindtap="onToolTap"
        hover-class="tool-hover"
        hover-stay-time="100"
      >
        <text class="tool-icon">{{item.icon}}</text>
        <text class="tool-name">{{item.name}}</text>
        <text class="tool-desc">{{item.description}}</text>
        <text class="tool-link" wx:if="{{item.available}}">进入 ›</text>
        <text class="tool-tag" wx:else>即将上线</text>
      </view>
    </view>
  </view>

  <!-- ═══ ZONE 4: 快捷入口（保持） ═══ -->
  <view class="shortcuts-band {{show ? 'anim-up-delay' : ''}}">
    <view class="shortcut-row" bindtap="goToRecords"
          hover-class="row-hover" hover-stay-time="100">
      <text class="shortcut-label">答题记录</text>
      <text class="shortcut-arrow">›</text>
    </view>
    <view class="row-divider"></view>
    <view class="shortcut-row" bindtap="goToWrongQuestions"
          hover-class="row-hover" hover-stay-time="100">
      <text class="shortcut-label">错题本</text>
      <text class="shortcut-arrow">›</text>
    </view>
  </view>

  <!-- ═══ ZONE 5: 备案号（保持） ═══ -->
  <view class="footer">
    <text class="icp">苏ICP备2026036865号-1X</text>
  </view>

</view>
```

---

## 6. WXSS 新增样式设计

### 6.1 学习状态条（Zone 2 新增样式）

```css
/* ── Zone 2: 学习状态条 ── */
.stats-band {
  background: #faf9f5;
  padding: 0 32rpx 48rpx;
  opacity: 0;
}

.stats-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 28rpx 28rpx 24rpx;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.stats-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 26rpx;
  font-weight: 600;
  color: #141413;
}

.stats-link {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 24rpx;
  font-weight: 500;
  color: #cc785c;
}

.stats-grid {
  display: flex;
}

.stats-item {
  flex: 1;
  text-align: center;
}

.stats-value {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 44rpx;
  font-weight: 400;
  color: #cc785c;
  line-height: 1.1;
}

.stats-label {
  display: block;
  margin-top: 8rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20rpx;
  font-weight: 400;
  color: #6c6a64;
}

.stats-empty {
  padding: 16rpx 0;
  text-align: center;
}

.stats-empty-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 24rpx;
  color: #8e8b82;
}
```

### 6.2 分类标签栏（Zone 3 新增样式）

```css
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
  transition: color 0.2s, border-color 0.2s;
}

.category-tab.active {
  color: #cc785c;
  border-bottom-color: #cc785c;
}
```

### 6.3 工具卡片增强样式

```css
/* ── 工具卡片描述新增 ── */
.tool-desc {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20rpx;
  font-weight: 400;
  color: #8e8b82;
  line-height: 1.4;
  margin-bottom: 12rpx;
  /* 单行截断 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 6.4 保留且不修改的样式

以下现有样式**完全不变**：
- `.page`、`.hero-band`、`.hero-title`、`.hero-tagline`、`.hero-cta`、`.cta-text`、`.hero-sub`
- `.shortcuts-band`、`.shortcut-row`、`.row-divider`、`.shortcut-label`、`.shortcut-arrow`
- `.footer`、`.icp`
- `.anim-in`、`.anim-up`、`.anim-up-delay`
- `.tool-grid`、`.tool-card`（卡片基础样式不变，仅追加 `.tool-desc`）
- `.band-label`、`.sub-label`

---

## 7. 视觉节奏（Surface Alternation）

沿用 Claude Design 的 surface 交替节奏：

```
奶油画布 #faf9f5
  │
  ├─ Hero 区（画布上直接放置标题 + CTA）
  │   标题：画布色文字
  │   CTA：珊瑚色块突出
  │
  ├─ 学习状态条（奶油卡片 #efe9de）
  │   指标值：珊瑚色衬线数字
  │   标签：次要文字
  │
  ├─ 工具箱区（画布上直接放置）
  │   分类标签：画布上
  │   工具卡片：奶油卡片 #efe9de
  │     已实现：正常不透明度 + 珊瑚链接
  │     未实现：40% 不透明度 + "即将上线"
  │
  └─ 快捷入口（奶油卡片 #efe9de）
      两行 + 分割线
```

深度通过色块对比实现，不使用阴影。这是 Claude Design 的核心原则。

---

## 8. 边界情况与空状态

### 8.1 Zone 2：无学习数据

```
┌──────────────────────────────────────┐
│  📊 学习概览                  进入 ›  │
│                                      │
│   完成一次练习后查看学习数据            │
│                                      │
└──────────────────────────────────────┘
```

- 不显示 4 个 0 的伪数据
- 引导文案 `#8e8b82`
- 整条仍然可点击 → 跳转 Dashboard（Dashboard 有自己的空状态引导）

### 8.2 Zone 3：某分类无已实现工具

- 在「全部工具」视图中，该分类**完全不出现**
- 在单一分类视图中（用户手动切换到该分类），显示空状态：

```
┌──────────────────────────────────────┐
│                                      │
│       该分类的工具正在开发中            │
│                                      │
└──────────────────────────────────────┘
```

### 8.3 Zone 3：只有 1-2 个已实现工具

- 卡片照常渲染
- 2 列网格中，如果只有 1 个工具，卡片占半宽（不拉伸）
- 如果有 3 个工具，前 2 个占第一行，第 3 个占第二行左半

### 8.4 分类标签栏滚动

- 当分类数量 ≤ 4 时，标签均匀分布，不滚动
- 当分类数量 > 4 时，启用横向滚动
- `scroll-view` 隐藏滚动条（`show-scrollbar="false"`）

---

## 9. 首页工具入口布局的制衡原则

设计首页时遵循以下**制衡规则**（Trade-off Rules），确保视觉上不偏重任何一个分类：

| 规则 | 说明 |
|---|---|
| **R1 — 等宽卡片** | 同一视图内的工具卡片宽度完全相等（`flex: 1` 平分），不因工具重要性改变尺寸 |
| **R2 — 图标等大** | 所有工具图标统一 48rpx，不使用不同大小的图标暗示优先级 |
| **R3 — 描述等长** | 工具描述文字限制在 ~20 字以内，避免某些卡片文字量明显多于其他卡片 |
| **R4 — 分类无排序暗示** | 分类标签栏的顺序是固定的（见 §3.3.1），不代表优先级。不因为某个分类工具多就放大它的视觉比重 |
| **R5 — 精选平等** | 「全部工具」视图中每分类展示至多 2 行（4 张卡片），不因为计算机网络工具多就给它更多空间 |
| **R6 — CTA 唯一** | 全页面只有一个全宽珊瑚色 CTA（`开始刷题`），工具区不使用同级别的视觉强调 |
| **R7 — 新品不喧宾** | 新增工具不获得特殊标记（如 `NEW` 角标）、不加粗、不改变卡片背景色。所有工具在视觉权重上完全平等 |

---

## 10. 与现有代码的兼容性分析

### 10.1 需要修改的文件

| 文件 | 改动内容 | 风险等级 |
|---|---|---|
| `pages/index/index.js` | 重写 data 和 methods，新增 tool-registry 引用、stats 加载、分类切换逻辑 | 🟡 中 |
| `pages/index/index.wxml` | 重写 Zone 2/3 结构，Zone 1/4/5 保持 | 🟡 中 |
| `pages/index/index.wxss` | 新增 stats 样式、category-tabs 样式，保留现有样式 | 🟢 低 |
| `utils/tool-registry.js` | **新建**：所有工具的唯一注册来源 | 🟢 低 |

### 10.2 不需要修改的文件

- `app.json` — 页面路由不变
- `app.wxss` — 全局样式不变
- 所有 `pages/quiz*/`、`pages/dashboard/`、`pages/*-viz/` 等 — 页面内部逻辑完全不变
- `utils/storage.js`、`utils/analytics.js` 等 — 纯函数模块不变

### 10.3 测试影响

- 现有 139 个 Jest 测试**不受影响**（首页无测试，工具路由不变）
- 建议新增：`tests/utils/tool-registry.test.js` — 测试工具注册表的过滤、分类、排序逻辑

---

## 11. 实现路径（Implementation Path）

### Phase 1：基础重构（2-3 天）

**目标**：让首页支持分类体系，但不改工具数量。

```
Day 1:
  1. 新建 utils/tool-registry.js — 注册全部已实现的 4 个工具
  2. 新建 tests/utils/tool-registry.test.js — 测试过滤和分类
  3. 运行 npm test — 确认全量通过

Day 2:
  4. 修改 pages/index/index.js — 引入 tool-registry，实现分类切换
  5. 修改 pages/index/index.wxml — Zone 2 学习状态条 + Zone 3 分类标签 + 工具网格
  6. 修改 pages/index/index.wxss — 新增样式

Day 3:
  7. 在微信开发者工具中预览 — 验证所有入口可点击
  8. npm test — 确认全量通过
  9. 更新 PROJECT_HANDOFF.md — 记录本次改动
  10. git commit
```

### Phase 2：工具扩展（后续开发时自然完成）

每开发一个新工具：
1. 在 `utils/tool-registry.js` 追加一条 TOOLS 记录
2. 首页自动渲染该工具卡片（无需额外改代码）
3. 如果是新分类的第一个工具，分类自动出现在标签栏

---

## 12. 未来可能的方向（不纳入本次实现）

### 12.1 底部 Tab 导航

如果未来功能量进一步增长（20+ 工具），可考虑升级为底部 Tab 结构：

```json
{
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/quiz-list/quiz-list", "text": "刷题" },
      { "pagePath": "pages/tools/tools", "text": "工具" },
      { "pagePath": "pages/dashboard/dashboard", "text": "数据" }
    ]
  }
}
```

这需要：
- 把刷题流程独立为 Tab
- 工具区独立为 Tab
- 数据分析独立为 Tab
- 首页精简为「启动页 + 快捷入口」

这是**大版本架构升级**，不建议在本次改动中实施。

### 12.2 工具搜索

当工具超过 15 个时，可在分类标签栏旁增加搜索图标。本次不做。

### 12.3 使用频率排序

通过埋点统计工具点击次数，在「全部工具」视图中按使用频率排序。本次不做。

---

## 13. 验收标准

以下清单涵盖本文档第 3-12 节中所有设计规范、交互行为、边界情况、视觉细节和制衡规则。标记为「必须」的项是实现底线；标记为「建议」的项是品质保证。

---

### 13.1 测试与代码质量

- [ ] **T1** `npm test` 全量通过，139 个已有测试零失败（必须）
- [ ] **T2** 新建 `utils/tool-registry.js` 有对应的 `tests/utils/tool-registry.test.js`（必须）
- [ ] **T3** `tool-registry.test.js` 覆盖以下场景（必须）：
  - `getAvailableTools()` 正确过滤 `available: true` 的工具
  - `getToolsByCategory('network')` 返回网络分类下所有工具，按 `order` 排序
  - `getToolsByCategory('nonexistent')` 返回空数组
  - `getActiveCategories()` 只返回有已实现工具的分类
  - `getFeaturedTools(N)` 返回数量 ≤ N，且全部 `available && featured`
  - `getFeaturedTools(0)` 返回空数组
  - `TOOLS` 数组不包含未在 `TOOL_CATEGORIES` 中定义的 `category` 值
- [ ] **T4** `npm test` 输出中无 console.error 或 warning（建议）

---

### 13.2 Zone 1 — Hero 区域（保持）

- [ ] **H1** Hero 区域视觉与重构前完全一致：Georgia 衬线标题「刷个冯题」、28rpx tagline、珊瑚色 CTA 按钮、辅助描述文字「导入试题 · 5 种题型 · 练习 / 考试」（必须）
- [ ] **H2** 标题 `font-family: Georgia`、`font-size: 72rpx`、`font-weight: 400`、`letter-spacing: -3rpx`、`color: #141413`（必须）
- [ ] **H3** CTA 按钮背景 `#cc785c`，按下态 `#a9583e`（必须）
- [ ] **H4** 点击 CTA → 跳转 `/pages/quiz-list/quiz-list`（必须）
- [ ] **H5** 从 `/pages/quiz-list/quiz-list` 返回首页时，CTA 不残留 `tapped` 动画状态——`onShow()` 中 `heroTapped: false` 逻辑保留（必须）
- [ ] **H6** Hero 区域入场动画 `anim-in`（fadeSlideIn, 0.5s）正常播放（必须）

---

### 13.3 Zone 2 — 学习状态条（新增）

#### 13.3.1 有数据状态

- [ ] **S1** 学习状态条包裹在奶油卡片中：`background: #efe9de`、`border-radius: 24rpx`（必须）
- [ ] **S2** 卡片顶部显示「📊 学习概览」标题（左）和珊瑚色「进入 ›」链接（右）（必须）
- [ ] **S3** 4 个指标等宽排列（`flex: 1`，`text-align: center`），依次为：累计刷题、练习次数、正确率、错题数（必须）
- [ ] **S4** 指标数值字体为 Georgia 衬线、`font-size: 44rpx`、`font-weight: 400`、`color: #cc785c`（必须）
- [ ] **S5** 指标标签字体为系统无衬线、`font-size: 20rpx`、`color: #6c6a64`（必须）
- [ ] **S6** 数值来源于 `buildDashboardData(records, wrongQuestions, papers, new Date())` 的 `overview.totalQuestions / totalSessions / averageAccuracy / wrongCount`（必须）
- [ ] **S7** 正确率显示为百分比格式（如 `78%`），来自 `overview.averageAccuracy`（必须）
- [ ] **S8** 整条卡片可点击 → 跳转 `/pages/dashboard/dashboard`（必须）
- [ ] **S9** 学习状态条**不再**出现在工具区（Zone 3），dashboard 不再渲染为工具卡片（必须）

#### 13.3.2 空数据状态

- [ ] **S10** 当 `storage.getRecords()` 返回空数组时，`stats.hasData === false`（必须）
- [ ] **S11** 空数据时不显示 4 个指标数值（不出现 4 个「0」的伪数据）（必须）
- [ ] **S12** 空数据时显示引导文案：「完成一次练习后查看学习数据」（`font-size: 24rpx`、`color: #8e8b82`、居中）（必须）
- [ ] **S13** 空数据时整条卡片仍可点击 → 跳转 `/pages/dashboard/dashboard`（Dashboard 页面有自己的空状态引导）（必须）

#### 13.3.3 数据刷新

- [ ] **S14** 每次 `onShow()` 都重新调用 `loadStats()`，从 storage 读取最新数据（必须）
- [ ] **S15** 用户在 quiz 页面完成一次刷题后返回首页，学习状态条数据自动更新（必须）

---

### 13.4 Zone 3 — 工具箱（重构核心）

#### 13.4.1 分类体系

- [ ] **C1** 工具按以下 5 个分类组织，顺序固定（必须）：
  - 计算机网络（`network`, order: 1）
  - 操作系统（`os`, order: 2）
  - 密码学（`crypto`, order: 3）
  - 算法 & 数据结构（`algo`, order: 4）
  - 编译原理（`compiler`, order: 5）
- [ ] **C2** 所有工具在 `utils/tool-registry.js` 的 `TOOLS` 数组中注册，包括 `available: false` 的规划中工具（必须）
- [ ] **C3** 当前已实现的 4 个工具（子网计算器、TCP 动画机、排序可视化）正确注册为 `available: true`（必须）
- [ ] **C4** 脑暴文档中 19 个候选工具全部以 `available: false` 预注册，`description` 字段填入对应的简短描述（建议）
- [ ] **C5** `TOOL_CATEGORIES` 和 `TOOLS` 数组中没有硬编码在首页 JS 中的冗余数据——首页只从 `tool-registry` 读取（必须）
- [ ] **C6** 「单词记忆」工具从首页移除，不再出现在 `TOOLS` 数组或任何页面渲染中（必须）

#### 13.4.2 分类标签栏

- [ ] **TAB1** 标签栏使用 `<scroll-view scroll-x enable-flex>` 实现（必须）
- [ ] **TAB2** 第一个标签永远是「全部工具」（`data-id="all"`），默认选中（必须）
- [ ] **TAB3** 其后依次排列 `activeCategories` 中的所有分类（即有已实现工具的分类）（必须）
- [ ] **TAB4** 选中态：珊瑚色文字 `#cc785c` + 底部 4rpx 珊瑚色下划线（`border-bottom`）（必须）
- [ ] **TAB5** 未选中态：次要文字色 `#6c6a64` + 透明下划线（必须）
- [ ] **TAB6** 标签之间间距 `margin-right: 12rpx`，内边距 `padding: 14rpx 24rpx`（必须）
- [ ] **TAB7** 标签字体 `font-size: 26rpx`、`font-weight: 500`、系统无衬线（必须）
- [ ] **TAB8** 标签切换有 `transition: color 0.2s, border-color 0.2s`（建议）
- [ ] **TAB9** 分类数量 ≤ 4 时，标签均匀分布不滚动（建议）
- [ ] **TAB10** 分类数量 ≥ 5 时，标签栏可横向滚动（必须）
- [ ] **TAB11** 滚动条隐藏（`show-scrollbar="false"`）（必须）
- [ ] **TAB12** 点击标签调用 `onCategoryTap`，更新 `activeCategory` 并切换工具网格内容（必须）

#### 13.4.3 「全部工具」视图

- [ ] **ALL1** 当 `activeCategory === 'all'` 时，渲染「全部工具」Bento 网格视图（必须）
- [ ] **ALL2** 只展示 `activeCategories` 中的分类——没有任何已实现工具的分类不出现（必须）
- [ ] **ALL3** 每个分类有一个分类标题行，使用 `sub-label` 样式（UPPERCASE、letter-spacing、`color: #8e8b82`）（建议）
- [ ] **ALL4** 每个分类标题下展示该分类的已实现 + `featured: true` 工具，最多 2 行（4 张卡片）（必须）
- [ ] **ALL5** 如果该分类只有 1 个已实现工具，卡片占半宽（`flex: 1` 在 2 列网格中的自然行为）——不强制拉伸为全宽（必须）
- [ ] **ALL6** 如果该分类有超过 4 个已实现工具，第 4 张之后不展示，改为显示「查看更多 XX 工具 ›」链接（建议；可在本次实现中暂用分类标签切换代替）
- [ ] **ALL7** 分类之间用 `margin-top: 28rpx` 分隔（必须）

#### 13.4.4 单一分类视图

- [ ] **CAT1** 当 `activeCategory !== 'all'` 时，渲染该分类的完整 2 列工具网格（必须）
- [ ] **CAT2** 网格 `display: flex` + `gap: 20rpx`，每行 2 张卡片（必须）
- [ ] **CAT3** 该分类下的所有工具（含 `available: true` 和 `available: false`）全部渲染（必须）
- [ ] **CAT4** 已实现工具：奶油卡片 `#efe9de`，底部显示珊瑚色 `进入 ›` 链接（必须）
- [ ] **CAT5** 未实现工具：降低不透明度 `opacity: 0.40`，底部显示 `color: #6c6a64` 的「即将上线」标签（必须）
- [ ] **CAT6** 点击未实现工具卡片 → `wx.showToast({ title: '功能开发中', icon: 'none' })`（必须）
- [ ] **CAT7** 该分类没有任何已实现工具时（理论边界：用户通过某种方式切换到全未实现分类），显示空状态：「该分类的工具正在开发中」（建议）

#### 13.4.5 工具卡片样式

- [ ] **CD1** 卡片背景 `#efe9de`，圆角 `24rpx`，`padding: 32rpx 24rpx 28rpx`（必须）
- [ ] **CD2** 零阴影（`box-shadow: none`）——Claude Design 核心原则（必须）
- [ ] **CD3** 按下态背景 `#e8e0d2`（`:active` + `hover-class="tool-hover"`）（必须）
- [ ] **CD4** 卡片内容从上到下：图标 → 名称 → 描述 → 链接/标签（必须）
- [ ] **CD5** 图标 `font-size: 48rpx`，`margin-bottom: 20rpx`（必须）
- [ ] **CD6** 名称 `font-size: 30rpx`、`font-weight: 500`、`color: #141413`（必须）
- [ ] **CD7** 描述 `font-size: 20rpx`、`color: #8e8b82`、单行截断（`text-overflow: ellipsis`）、`margin-bottom: 12rpx`（必须）
- [ ] **CD8** 描述文字 ≤ 20 字（约 2-3 个关键词用「·」分隔），避免卡片文字量差异过大（必须——见制衡规则 R3）
- [ ] **CD9** 已实现工具链接文字 `进入 ›`，`font-size: 24rpx`、`font-weight: 500`、`color: #cc785c`（必须）
- [ ] **CD10** 未实现工具标签文字 `即将上线`，`font-size: 22rpx`、`color: #6c6a64`（必须）
- [ ] **CD11** 已实现卡片和未实现卡片的 `padding`、`border-radius`、图标大小完全一致——仅不透明度不同（必须——见制衡规则 R7）

---

### 13.5 Zone 4 — 快捷入口（保持）

- [ ] **Q1** 快捷入口区域视觉与重构前一致：奶油卡片 `#efe9de`、圆角 `24rpx`、内部两行（必须）
- [ ] **Q2** 第一行「答题记录」+ `›`，点击 → `/pages/records/records`（必须）
- [ ] **Q3** 第二行「错题本」+ `›`，点击 → `/pages/wrong-questions/wrong-questions`（必须）
- [ ] **Q4** 两行之间有分割线 `height: 1rpx`、`background: #e6dfd8`（必须）
- [ ] **Q5** 每行按下态 `opacity: 0.6`（必须）

---

### 13.6 Zone 5 — 备案号（保持）

- [ ] **F1** 备案号文字「苏ICP备2026036865号-1X」、`font-size: 22rpx`、`color: #8e8b82`、居中（必须）
- [ ] **F2** 与 Hero 区背景色一致 `#faf9f5`（必须）

---

### 13.7 视觉规范与设计一致性

#### 13.7.1 Claude Design 风格检查

- [ ] **V1** 全页面背景 `#faf9f5`（暖奶油画布）（必须）
- [ ] **V2** 全页面零阴影——搜索 `box-shadow` 在全站 WXSS 中不出现非零值（除第三方代码外）（必须）
- [ ] **V3** 珊瑚色 `#cc785c` 仅用于 CTA 按钮、选中态标签、指标数值、链接文字、按下态——不用于装饰性背景或大面积色块（必须）
- [ ] **V4** 页面底部 `padding-bottom: env(safe-area-inset-bottom)` 保留（必须）
- [ ] **V5** 所有卡片圆角统一 `24rpx`（必须）

#### 13.7.2 Surface 交替节奏

- [ ] **V6** 视觉层级靠色块对比实现（画布 `#faf9f5` vs 卡片 `#efe9de` vs 深色快捷入口），不依赖阴影（必须）
- [ ] **V7** Hero 区（画布上）→ 学习状态条（奶油卡片上）→ 工具区标签（画布上）→ 工具卡片（奶油卡片上）→ 快捷入口（奶油卡片上）的 surface 交替正确（必须）

#### 13.7.3 入场动画

- [ ] **V8** Hero 区：`anim-in`（fadeSlideIn, 0.5s）（必须）
- [ ] **V9** 学习状态条 + 工具箱区：`anim-up`（fadeSlideUp, 0.5s, 延迟 0.2s）（必须）
- [ ] **V10** 快捷入口：`anim-up-delay`（fadeSlideUp, 0.5s, 延迟 0.35s）（必须）

---

### 13.8 制衡规则逐条验收（§9）

- [ ] **B1**（R1 — 等宽卡片）——同一视图内所有工具卡片宽度完全相等，不因工具重要性改变 `flex` 比例（必须）
- [ ] **B2**（R2 — 图标等大）——所有工具图标统一 `48rpx`，不使用不同大小的图标暗示优先级（必须）
- [ ] **B3**（R3 — 描述等长）——所有工具 `description` 字段 ≤ 20 字，卡片描述行视觉长度一致（必须）
- [ ] **B4**（R4 — 分类无排序暗示）——分类标签栏按 `order` 字段固定排列，不因某分类工具多而将其标签放大、加粗或置于首位（必须）
- [ ] **B5**（R5 — 精选平等）——「全部工具」视图中每个分类最多 2 行（4 张卡片），计算机网络分类不因工具多而获得更多展示空间（必须）
- [ ] **B6**（R6 — CTA 唯一）——全页面只有一个全宽珊瑚色 CTA（`开始刷题` 按钮），工具区不出现任何同等视觉强调的元素（必须）
- [ ] **B7**（R7 — 新品不喧宾）——新增工具卡片与已有工具卡片视觉完全一致：无 `NEW` 角标、无 `font-weight: bold` 加粗、无不同背景色、无不同圆角。仅 `available` 字段区分可点击/不可点击（必须）

---

### 13.9 边界情况（§8）

- [ ] **E1** 无学习数据时 Zone 2 显示引导文案而非 4 个 0（见 S10-S13）（必须）
- [ ] **E2** 某分类无已实现工具时，该分类在「全部工具」视图中完全不出现（必须）
- [ ] **E3** 某分类全为未实现工具时，切换到该分类后显示空状态提示（建议）
- [ ] **E4** 只有 1 个已实现工具时，卡片占半宽不拉伸（必须）
- [ ] **E5** 只有 3 个已实现工具时，第 1 行 2 张、第 2 行 1 张（左对齐）（必须）
- [ ] **E6** 分类数量 ≤ 4 时标签栏不滚动；5 个分类（现状）时标签栏可横向滚动（必须）
- [ ] **E7** 375px 逻辑宽度下无水平溢出、无内容被截断（必须）
- [ ] **E8** `wx.setStorageSync` 存储空间不足时页面不崩溃——storage.js 的 `_set` 函数已有 toast 处理（确认）
- [ ] **E9** `buildDashboardData` 返回的 `averageAccuracy` 在所有边界情况下（0 题、NaN、Infinity）都不导致 WXML 渲染异常（必须）

---

### 13.10 兼容性验证（§10）

- [ ] **COMP1** `app.json` 未被修改——`pages` 数组、`window` 配置与重构前一致（必须）
- [ ] **COMP2** `app.wxss` 未被修改——全局样式不变（必须）
- [ ] **COMP3** 以下文件未被修改（dirty check）：`utils/storage.js`、`utils/analytics.js`、`utils/markdown-parser.js`、`utils/util.js`、`utils/subnet.js`、`utils/tcp-states.js`、`utils/sample-questions.js`（必须）
- [ ] **COMP4** 以下页面目录未被修改：`pages/quiz-list/`、`pages/import-preview/`、`pages/quiz/`、`pages/result/`、`pages/records/`、`pages/record-detail/`、`pages/wrong-questions/`、`pages/dashboard/`、`pages/subnet-calc/`、`pages/sort-viz/`、`pages/tcp-viz/`（必须）
- [ ] **COMP5** 所有现有页面路由可正常跳转——Hero CTA、快捷入口、工具卡片各自跳转到正确的页面（必须）

---

### 13.11 开发者体验（DevEx）

- [ ] **DX1** 新增一个已实现工具：在 `utils/tool-registry.js` 的 `TOOLS` 数组中追加一条 `{ available: true, featured: true, ... }` 记录，首页自动渲染该卡片，无需修改 `index.js` / `index.wxml` / `index.wxss`（必须）
- [ ] **DX2** 新增一个分类：在 `TOOL_CATEGORIES` 中追加一条记录，在 `TOOLS` 中追加至少一条该分类的 `available: true` 工具，分类自动出现在标签栏（必须）
- [ ] **DX3** 修改工具名称或描述：只需修改 `TOOLS` 数组中对应记录，首页自动反映（必须）
- [ ] **DX4** 移除一个工具：在 `TOOLS` 中将 `available` 设为 `false`，首页自动将该卡片置灰为「即将上线」状态，不出现在「全部工具」视图（建议）

---

### 13.12 不在本次范围内的功能（明确不做）

以下功能在 §12 中列为「未来可能的方向」，**本次实现明确不做**。如实现中出现相关代码，视为范围溢出：

- [ ] **NOT1** 底部 Tab 导航（tabBar）——不动 `app.json` 的 `tabBar` 配置
- [ ] **NOT2** 工具搜索框——不在分类标签栏旁或页面任何位置添加搜索图标/输入框
- [ ] **NOT3** 使用频率排序——工具卡片顺序固定为 `TOOL_CATEGORIES.order` + `TOOLS.order`，不根据用户点击行为动态排序
- [ ] **NOT4** 独立工具分类索引页（如 `pages/tools/tools`）——工具浏览全部在首页完成，不新增二级页面

---

### 13.13 微信开发者工具真机预览检查（建议）

- [ ] **PREV1** iPhone 14 Pro（393px 逻辑宽度）竖屏下无溢出、无截断
- [ ] **PREV2** iPhone SE（375px 逻辑宽度）竖屏下无溢出、无截断
- [ ] **PREV3** 横屏模式下布局不崩溃（至少可滚动、不白屏）
- [ ] **PREV4** 增大系统字号（「设置 → 显示与亮度 → 文字大小」拉到最大）后页面不崩溃，文字不重叠
- [ ] **PREV5** 深色模式下页面可读——虽然当前设计浅色为主，但至少不出现白底白字等完全不可读的情况
- [ ] **PREV6** 低端机型（如 iPhone 8）上入场动画流畅、无白屏闪烁

---

### 13.14 Git 提交前最终检查

- [ ] **GIT1** `git status` 只包含预期修改的文件：`pages/index/index.js`、`pages/index/index.wxml`、`pages/index/index.wxss`，以及新建的 `utils/tool-registry.js`、`tests/utils/tool-registry.test.js`（必须）
- [ ] **GIT2** `git diff` 中 Zone 1（Hero）、Zone 4（快捷入口）、Zone 5（备案号）的 WXML/WXSS 无变更（必须）
- [ ] **GIT3** 更新 `PROJECT_HANDOFF.md`，追加本次首页重构的实现记录（必须）
- [ ] **GIT4** `project.config.json` 不包含本次改动引入的无关配置变更（确认）
- [ ] **GIT5** commit message 清晰描述改动，例如：`refactor: redesign homepage with category tabs and tool registry`

---

> **使用说明**：以上清单按类别分为 14 组、共 80+ 检查项。实现时按 Phase 1 路径（§11）逐日推进，每天结束时对照对应组别的检查项自测。最终交付前「必须」项全部通过，「建议」项至少 80% 通过。
>
> 验收清单中所有条目均可追溯到正文对应章节——序号前缀对应：H = Hero（§3.3 Zone 1）、S = Stats Bar（§3.3 Zone 2）、C/CAT/ALL/TAB/CD = Tools（§3.3 Zone 3）、Q = Shortcuts（§3.3 Zone 4）、F = Footer（§3.3 Zone 5）、V = Visual（§7）、B = Balance Rules（§9）、E = Edge Cases（§8）、COMP = Compatibility（§10）、DX = DevEx（§4.1）、NOT = Out of Scope（§12）、T = Testing（§4.1/§10.3）、PREV = Preview、GIT = Git。
