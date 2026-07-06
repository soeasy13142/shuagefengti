# Notion 设计方案 → 刷个冯题 实施方法论

> **参考来源**: `.claude/skills/notion-design.md`（Notion 官网设计系统分析，覆盖 homepage / enterprise / product-ai / product-agents / startups / pricing 六个页面）
> **适用项目**: 刷个冯题 微信小程序（WXML + WXSS + JS，纯本地存储，rpx 单位）
> **生成时间**: 2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Notion 的设计语言围绕 **"全功能工作空间"** 的自信表达展开。核心理念：

- **插画丰富的品牌叙事**：深色 hero band 上散布彩色便利贴圆点 + 网格线插画，营造"工作场景"氛围
- **产品即展示**：将真实的 Notion 工作区 UI 截图嵌入 hero 区域，用产品自身证明价值
- **色彩即属性**：柔和色调的特性卡片（peach / rose / mint / lavender / sky / yellow）呼应产品数据库属性的颜色系统
- **克制的几何感**：按钮使用 8px 圆角矩形（非胶囊形），卡片 12px 圆角，整体偏"编辑器式"冷静感
- **居中英雄布局**：区别于多数 B2B SaaS 的左对齐，Notion hero 内容居中排列

### 1.2 视觉 DNA

| 特征 | Notion 实现 | 刷个冯题适配难度 |
|---|---|---|
| 深色 hero band | `#0a1530` 深海军蓝，full-bleed | 中等（小程序无 full-bleed，需用 rpx 模拟） |
| 紫色胶囊 CTA | `#5645d4` 紫色，pill 形状 | 低（替换为珊瑚色 `#cc785c`） |
| 柔和色调特性卡片 | 9 种 pastel tint 背景 | 低（可直接引入作为分类色） |
| 便利贴圆点装饰 | SVG 插画散布 | 高（小程序不支持自由 SVG 装饰，需简化） |
| 工作区 UI 截图 | 产品截图嵌入 hero | 中等（可用题目预览卡片替代） |
| Notion Sans 字体 | Inter 变体 | 低（小程序用系统字体，Georgia 标题保留） |

### 1.3 色彩策略

Notion 使用 **多色谱系统**，核心是紫色主色 + 大量柔和色调背景色：

- **主色**: `#5645d4`（紫色），仅用于主 CTA
- **深色面**: `#0a1530`（深海军蓝），用于 hero band 和深色区域
- **画布**: `#ffffff`（纯白），页面背景
- **柔和色调背景**: 9 种 pastel tint（peach `#ffe8d4`、rose `#fde0ec`、mint `#d9f3e1` 等）
- **文字色阶**: 从 `#000000`（纯黑强调）到 `#1a1a1a`（主标题）到 `#37352f`（正文暖炭）到 `#787671`（辅助）

**与暖奶油画布的差异**：Notion 使用纯白画布 `#ffffff`，刷个冯题使用暖奶油 `#faf9f5`。Notion 的紫色主色与刷个冯题的珊瑚色 `#cc785c` 完全不同。Notion 的柔和色调系统是其最大特色，可选择性引入。

### 1.4 字体策略

- **主字体**: Notion Sans（基于 Inter 的定制可变字体），覆盖所有 UI 表面
- **字重分布**: 600 用于标题，500 用于按钮和强调，400 用于正文
- **行高特点**: hero display 1.05（极紧），正文 1.55（宽松）
- **字间距**: 大字号负间距（-2px ~ -0.5px），正文无间距

**与刷个冯题的差异**：刷个冯题使用 Georgia 衬线标题（400 weight，-3rpx 间距）+ 系统字体正文。Notion 的全 sans-serif 系统与之风格迥异。Notion 的字重使用更重（600 标题 vs 刷个冯题 400），产生不同气质——Notion 更现代自信，刷个冯题更温和书卷气。

### 1.5 布局与组件模式

- **Hero 居中布局**: 标题、副标题、按钮行居中，workspace mockup 卡片在下方
- **特性卡片网格**: 3 列排列的柔和色调卡片，每张展示一个功能模块
- **定价对比表**: 4 层级横向卡片 + 下方密集功能对比表
- **按钮矩形化**: 所有按钮使用 `rounded.md`（8px），拒绝胶囊形
- **卡片统一体系**: 所有卡片使用 `rounded.lg`（12px），带 `1px solid #e5e3df` 边框
- **层级靠边框**: 零阴影，靠边框和色调差异表达深度

---

## 2. 适配分析

### 2.1 可直接迁移

| 元素 | 迁移方式 | 说明 |
|---|---|---|
| 柔和色调卡片背景 | 直接引入 9 种 pastel tint | 用于题目分类卡片、模块区分 |
| 矩形按钮风格 | 8px 圆角 → `16rpx` | 区别于常见胶囊按钮，建立编辑器气质 |
| 文字色阶体系 | 5 级灰度映射 | `#141413` / `#6c6a64` 替代 Notion 的 ink / slate / steel |
| 边框层级（零阴影） | 直接采用 | 与暖奶油画布的"零阴影"理念一致 |
| 卡片边框分隔 | `1px solid` hairline | 替代阴影表达层级 |
| 按钮字重 500 | 适配为小程序 `font-weight: 500` | 比 Georgia 400 更适合按钮 |

### 2.2 需要改造

| 原方案 | 改造方案 | 原因 |
|---|---|---|
| 紫色主色 `#5645d4` | 替换为珊瑚色 `#cc785c` | 保持刷个冯题品牌一致 |
| 纯白画布 `#ffffff` | 替换为暖奶油 `#faf9f5` | 项目设计规范 |
| 深海军蓝 hero `#0a1530` | 替换为深海军蓝 `#181715` | 项目深色面规范 |
| Notion Sans 字体 | Georgia 标题 + 系统字体正文 | 项目字体规范 |
| 便利贴圆点 SVG 装饰 | 用 emoji / 纯色圆点替代 | 小程序 SVG 支持有限 |
| workspace mockup 截图 | 用题目预览卡片替代 | 展示实际产品内容 |
| 胶囊形 pill 按钮 | 保留矩形 8px | 与 Notion 原方案一致 |
| 80px hero display | 缩小至 `72rpx` 左右 | 小程序屏幕尺寸限制 |

### 2.3 不可迁移

| 元素 | 原因 |
|---|---|
| hero band 全宽深色背景 + 插画 | 小程序无法实现自由定位的 SVG 装饰元素 |
| workspace mockup 深阴影 | 暖奶油画布规范为零阴影 |
| 4 层级定价横向卡片 | 小程序屏幕宽度不够 4 列并排 |
| 6 列 footer 链接网格 | 小程序无传统 footer，用 tabBar 替代 |
| 鼠标 hover 状态 | 微信小程序无 hover 事件 |
| 负字间距（-2px）的 80px display | rpx 单位下效果不同，且小程序字号不宜过大 |
| 复杂 SVG 插画系统 | 小程序不支持自由 SVG 渲染 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Notion 原色 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#5645d4`（紫主色） | `#cc785c`（珊瑚 CTA） | 主按钮、主交互 |
| `#4534b3`（紫按下） | `#a9583e`（珊瑚 Active） | 按钮按下态 |
| `#0a1530`（深海军蓝） | `#181715`（深色面） | 深色区域背景 |
| `#ffffff`（纯白画布） | `#faf9f5`（暖奶油画布） | 页面背景 |
| `#f6f5f4`（表面灰） | `#efe9de`（奶油卡片） | 卡片/区块背景 |
| `#e5e3df`（hairline） | `#e5e3df` 保留 | 卡片边框、分割线 |
| `#1a1a1a`（ink 主文字） | `#141413`（暖墨） | 标题、正文 |
| `#37352f`（charcoal） | `#141413`（暖墨） | 正文强调 |
| `#5d5b54`（slate） | `#6c6a64`（次要文字） | 辅助文字、描述 |
| `#787671`（steel） | `#6c6a64`（次要文字） | 标签、占位符 |
| `#a4a097`（stone） | `#9e9b94`（更浅辅助） | 最低优先级文字 |
| `#ffe8d4`（peach tint） | `#ffe8d4` 保留 | 分类卡片-语文 |
| `#fde0ec`（rose tint） | `#fde0ec` 保留 | 分类卡片-英语 |
| `#d9f3e1`（mint tint） | `#d9f3e1` 保留 | 分类卡片-数学 |
| `#e6e0f5`（lavender tint） | `#e6e0f5` 保留 | 分类卡片-历史 |
| `#dcecfa`（sky tint） | `#dcecfa` 保留 | 分类卡片-地理 |
| `#fef7d6`（yellow tint） | `#fef7d6` 保留 | 分类卡片-政治 |
| `#f9e79f`（yellow-bold） | `#f9e79f` 保留 | 高亮强调区块 |
| `#f8f5e8`（cream tint） | `#f8f5e8` 保留 | 通用柔和底色 |

**关键决策**：Notion 的 9 种柔和色调是其最有价值的设计遗产。建议为"刷个冯题"的学科/题型分类各分配一种 tint，既区分模块又保持统一性。

### 3.2 字体映射（rpx）

| Notion 规格 | 刷个冯题 rpx 映射 | 用途 |
|---|---|---|
| hero-display: 80px/600/-2px | `font-size: 72rpx; font-weight: 400; letter-spacing: -3rpx`（Georgia） | 页面大标题（题库首页） |
| display-lg: 56px/600/-1px | `font-size: 56rpx; font-weight: 400; letter-spacing: -3rpx`（Georgia） | 区块大标题 |
| heading-1: 48px/600/-0.5px | `font-size: 48rpx; font-weight: 400; letter-spacing: -2rpx`（Georgia） | 页面标题 |
| heading-2: 36px/600/-0.5px | `font-size: 36rpx; font-weight: 400; letter-spacing: -2rpx`（Georgia） | 区块标题 |
| heading-3: 28px/600 | `font-size: 32rpx; font-weight: 500`（系统字体） | 卡片标题 |
| heading-4: 22px/600 | `font-size: 28rpx; font-weight: 500`（系统字体） | 子标题 |
| heading-5: 18px/600 | `font-size: 26rpx; font-weight: 500`（系统字体） | 小标题 |
| body-md: 16px/400 | `font-size: 28rpx; font-weight: 400`（系统字体） | 正文 |
| body-sm: 14px/400 | `font-size: 24rpx; font-weight: 400`（系统字体） | 辅助正文 |
| caption: 13px/600 | `font-size: 22rpx; font-weight: 600`（系统字体） | 标签、badge |
| button-md: 14px/500 | `font-size: 28rpx; font-weight: 500`（系统字体） | 按钮文字 |
| micro: 12px/500 | `font-size: 20rpx; font-weight: 500`（系统字体） | 最小文字 |

**说明**：Notion 使用 600 字重标题，刷个冯题 Georgia 标题用 400 字重。Georgia 400 的视觉重量约等于 sans-serif 600，因此不需要额外加粗。按钮和标签使用系统字体 500/600。

### 3.3 组件设计规范

#### 按钮

| 组件 | 规格 |
|---|---|
| 主按钮（CTA） | `background: #cc785c; color: #faf9f5; border-radius: 16rpx; padding: 20rpx 36rpx; font-size: 28rpx; font-weight: 500` |
| 主按钮按下 | `background: #a9583e` |
| 次按钮 | `background: transparent; color: #141413; border: 2rpx solid #c8c4be; border-radius: 16rpx; padding: 20rpx 36rpx` |
| 幽灵按钮 | `background: transparent; color: #141413; border-radius: 12rpx; padding: 16rpx 24rpx` |
| 链接按钮 | `background: transparent; color: #cc785c; font-size: 24rpx; font-weight: 500; padding: 0` |
| 深色面按钮 | `background: #faf9f5; color: #141413; border-radius: 16rpx; padding: 20rpx 36rpx` |

#### 卡片

| 组件 | 规格 |
|---|---|
| 基础卡片 | `background: #efe9de; border-radius: 24rpx; padding: 40rpx; border: 2rpx solid #e5e3df` |
| 特性卡片（白色底） | `background: #faf9f5; border-radius: 24rpx; padding: 48rpx; border: 2rpx solid #e5e3df` |
| tint 分类卡片 | `background: {tint色}; border-radius: 24rpx; padding: 48rpx`（无边框，靠底色区分） |
| 高亮卡片 | `background: #f9e79f; border-radius: 24rpx; padding: 48rpx` |
| 深色卡片 | `background: #181715; color: #faf9f5; border-radius: 24rpx; padding: 48rpx` |

#### Tab 切换

| 组件 | 规格 |
|---|---|
| 胶囊 Tab 默认 | `background: transparent; color: #6c6a64; border: 2rpx solid #e5e3df; border-radius: 999rpx; padding: 12rpx 28rpx; font-size: 24rpx; font-weight: 500` |
| 胶囊 Tab 选中 | `background: #141413; color: #faf9f5; border: 2rpx solid #141413` |
| 下划线 Tab 默认 | `color: #6c6a64; border-bottom: 4rpx solid transparent; font-size: 28rpx; font-weight: 500` |
| 下划线 Tab 选中 | `color: #141413; border-bottom: 4rpx solid #141413` |

#### Badge / 标签

| 组件 | 规格 |
|---|---|
| 主色 badge | `background: #cc785c; color: #faf9f5; font-size: 22rpx; font-weight: 600; border-radius: 999rpx; padding: 8rpx 20rpx` |
| tint 标签（如 lavender） | `background: #e6e0f5; color: #391c57; font-size: 22rpx; font-weight: 600; border-radius: 12rpx; padding: 4rpx 16rpx` |
| 状态标签（成功） | `background: #d9f3e1; color: #1aae39; font-size: 22rpx; font-weight: 600; border-radius: 999rpx; padding: 8rpx 20rpx` |

#### 输入框

| 组件 | 规格 |
|---|---|
| 文本输入 | `background: #faf9f5; color: #141413; border: 2rpx solid #c8c4be; border-radius: 16rpx; padding: 20rpx 28rpx; height: 88rpx; font-size: 28rpx` |
| 输入聚焦 | `border: 4rpx solid #cc785c` |
| 搜索框 | `background: #efe9de; color: #6c6a64; border-radius: 16rpx; padding: 20rpx 28rpx; height: 88rpx; font-size: 28rpx` |

### 3.4 页面布局模板

#### 首页布局（Notion 居中 hero 模式）

```
┌─────────────────────────────┐
│        深色 hero 区域        │  ← 背景 #181715
│    "刷个冯题，刷到停不下来"    │  ← Georgia 72rpx #faf9f5
│     "每天 10 分钟，轻松备考"   │  ← 系统字体 28rpx #9e9b94
│   [ 开始刷题 ]  [ 查看错题 ]  │  ← 珊瑚主按钮 + 深色面次按钮
│                             │
│    ┌─ 题目预览卡片 ────┐     │  ← 模拟 Notion workspace mockup
│    │  今日推荐题目      │     │     #efe9de 卡片，无阴影
│    │  ┌──┐ ┌──┐ ┌──┐  │     │
│    │  │Q1│ │Q2│ │Q3│  │     │
│    │  └──┘ └──┘ └──┘  │     │
│    └────────────────────┘     │
└─────────────────────────────┘

┌─────────────────────────────┐
│  "各科题库，一网打尽"         │  ← Georgia 48rpx
│                             │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │语文│ │数学│ │英语│       │  ← tint 分类卡片
│  │peach│ │mint│ │rose│      │     3 列网格
│  └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │历史│ │地理│ │政治│       │
│  │lav.│ │sky │ │yel.│      │
│  └────┘ └────┘ └────┘      │
└─────────────────────────────┘

┌─────────────────────────────┐
│  ┌─── 高亮区块 ──────────┐  │  ← #f9e79f 黄色高亮卡片
│  │ "今日已刷 42 题"       │  │     模拟 Notion bold yellow banner
│  │ 正确率 78% ↑          │  │
│  └────────────────────────┘  │
└─────────────────────────────┘

┌─────────────────────────────┐
│  ┌─ 深色区块 ─────────────┐ │  ← #181715 深色面
│  │ "加入学习小组"          │ │     #faf9f5 文字
│  │ [ 立即加入 ]            │ │     珊瑚色按钮 on 深色面
│  └────────────────────────┘ │
└─────────────────────────────┘
```

#### 列表页布局

```
┌─────────────────────────────┐
│ [全部] [语文] [数学] [英语]  │  ← 胶囊 Tab 切换
│                             │
│ ┌───────────────────────────┐│
│ │ 题目卡片 1                 ││  ← #efe9de 奶油卡片
│ │ #语文 · 选择题 · 中等      ││  ← tint 标签 + 状态标签
│ │ ───────────────────────── ││  ← hairline 分隔
│ │ 题目内容预览文字...         ││
│ └───────────────────────────┘│
│ ┌───────────────────────────┐│
│ │ 题目卡片 2                 ││
│ │ ...                       ││
│ └───────────────────────────┘│
└─────────────────────────────┘
```

### 3.5 WXSS 示例

```css
/* === Notion 风格基础变量 === */
page {
  --canvas: #faf9f5;          /* 暖奶油画布（替代 Notion 纯白） */
  --surface: #efe9de;         /* 奶油卡片（替代 Notion #f6f5f4） */
  --primary: #cc785c;         /* 珊瑚 CTA（替代 Notion 紫色） */
  --primary-active: #a9583e;  /* 珊瑚按下态 */
  --ink: #141413;             /* 暖墨主文字 */
  --slate: #6c6a64;           /* 次要文字 */
  --stone: #9e9b94;           /* 最浅辅助文字 */
  --hairline: #e5e3df;        /* 边框色 */
  --hairline-strong: #c8c4be; /* 强边框 */
  --dark-surface: #181715;    /* 深色面 */
  --on-dark: #faf9f5;         /* 深色面文字 */

  /* Notion 柔和色调（可选引入） */
  --tint-peach: #ffe8d4;
  --tint-rose: #fde0ec;
  --tint-mint: #d9f3e1;
  --tint-lavender: #e6e0f5;
  --tint-sky: #dcecfa;
  --tint-yellow: #fef7d6;
  --tint-yellow-bold: #f9e79f;
  --tint-cream: #f8f5e8;
}

/* === 矩形按钮（Notion 8px 圆角） === */
.btn-primary {
  background-color: var(--primary);
  color: var(--on-dark);
  border-radius: 16rpx;          /* 8px → 16rpx */
  padding: 20rpx 36rpx;
  font-size: 28rpx;
  font-weight: 500;              /* Notion 按钮字重 */
  line-height: 1.3;
  text-align: center;
  border: none;
}
.btn-primary:active {
  background-color: var(--primary-active);
}

.btn-secondary {
  background-color: transparent;
  color: var(--ink);
  border: 2rpx solid var(--hairline-strong);
  border-radius: 16rpx;
  padding: 20rpx 36rpx;
  font-size: 28rpx;
  font-weight: 500;
}

/* === 卡片（Notion 12px 圆角 + hairline 边框） === */
.card {
  background-color: var(--surface);
  border-radius: 24rpx;          /* 12px → 24rpx */
  padding: 40rpx;
  border: 2rpx solid var(--hairline);
  /* 零阴影 — 与暖奶油画布一致 */
}

.card-tint {
  border-radius: 24rpx;
  padding: 48rpx;
  /* 无边框，靠底色区分 */
}
.card-tint--peach    { background-color: var(--tint-peach); }
.card-tint--rose     { background-color: var(--tint-rose); }
.card-tint--mint     { background-color: var(--tint-mint); }
.card-tint--lavender { background-color: var(--tint-lavender); }
.card-tint--sky      { background-color: var(--tint-sky); }
.card-tint--yellow   { background-color: var(--tint-yellow); }

/* === 深色 hero 区域 === */
.hero-dark {
  background-color: var(--dark-surface);
  padding: 80rpx 48rpx;
  text-align: center;            /* Notion 居中 hero 布局 */
}
.hero-dark .hero-title {
  color: var(--on-dark);
  font-family: Georgia, serif;
  font-size: 72rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  line-height: 1.1;
}
.hero-dark .hero-subtitle {
  color: var(--stone);
  font-size: 28rpx;
  margin-top: 16rpx;
}

/* === 胶囊 Tab（Notion pill-tab） === */
.tab-group {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 0;
}
.tab-pill {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  border: 2rpx solid var(--hairline);
  font-size: 24rpx;
  font-weight: 500;
  color: var(--slate);
  background: transparent;
}
.tab-pill.active {
  background-color: var(--ink);
  color: var(--on-dark);
  border-color: var(--ink);
}

/* === 标签 Badge === */
.badge {
  display: inline-block;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
}
.badge--primary {
  background-color: var(--primary);
  color: var(--on-dark);
}
.badge--tag {
  border-radius: 12rpx;
  padding: 4rpx 16rpx;
}
.badge--tag-peach    { background-color: var(--tint-peach); color: #793400; }
.badge--tag-lavender { background-color: var(--tint-lavender); color: #391c57; }
.badge--tag-mint     { background-color: var(--tint-mint); color: #1aae39; }

/* === 输入框 === */
.input {
  background-color: var(--canvas);
  color: var(--ink);
  border: 2rpx solid var(--hairline-strong);
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  height: 88rpx;
  font-size: 28rpx;
}
.input:focus {
  border: 4rpx solid var(--primary);
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 适配理由 |
|---|---|
| 题库首页 | Notion 居中 hero 布局 + tint 分类卡片天然适合学科分类展示 |
| 学科题库列表 | tint 标签分类 + 矩形卡片列表与 Notion 特性卡片网格一致 |
| 错题本 | tint 标签标记学科 + 矩形卡片堆叠，信息密度适中 |
| 学习统计 | 深色 hero 区域展示核心数据 + 高亮黄色卡片突出关键指标 |
| 搜索页 | Notion search-pill 风格搜索框 + 结果卡片列表 |
| 设置页 | Notion 式表单输入 + 下划线 Tab 切换 |

### 4.2 不适合页面

| 页面 | 不适合原因 |
|---|---|
| 答题页面 | 需要大按钮和清晰的选项布局，Notion 的编辑器气质过于克制 |
| 答题结果页 | 需要强烈的成功/失败视觉反馈，pastel 色调不够醒目 |
| 需要大量动画的页面 | Notion 风格偏静态，不适合需要丰富动效的场景 |

### 4.3 混搭建议

| 混搭方案 | 说明 |
|---|---|
| Notion 布局 + 暖奶油画布配色 | 采用 Notion 的居中 hero + tint 卡片网格布局，但保留 `#faf9f5` / `#efe9de` / `#cc785c` 配色 |
| Notion tint 分类 + NVIDIA 信息密度 | 用 Notion 的柔和色调分类卡片，但采用 NVIDIA 的紧凑排版和信息密度 |
| Notion 深色 hero + 暖奶油画布卡片 | hero 区域使用 `#181715` 深色面，下方内容区使用暖奶油卡片体系 |
| Notion Tab 切换 + 暖奶油整体风格 | 胶囊 Tab 和下划线 Tab 直接采用 Notion 样式，融入暖奶油页面 |

---

## 5. 实施检查清单

- [ ] 主色已替换为 `#cc785c`（珊瑚色），未使用 Notion 紫色 `#5645d4`
- [ ] 画布色已替换为 `#faf9f5`（暖奶油），未使用 Notion 纯白 `#ffffff`
- [ ] 深色面已替换为 `#181715`，未使用 Notion 深海军蓝 `#0a1530`
- [ ] 标题使用 Georgia 衬线，weight 400，未使用 Notion Sans 600
- [ ] 正文使用系统字体，weight 400/500
- [ ] 按钮圆角为 `16rpx`（对应 8px），非胶囊形
- [ ] 卡片圆角为 `24rpx`（对应 12px），带 `2rpx solid #e5e3df` 边框
- [ ] 所有尺寸使用 rpx 单位，未使用 px
- [ ] 零阴影，靠边框和色调差异表达层级
- [ ] 柔和色调（tint）用于学科分类，每科分配一种颜色
- [ ] 深色 hero 区域使用居中布局（Notion 特色）
- [ ] 高亮区块使用 `#f9e79f` 黄色（Notion bold yellow 特色）
- [ ] 无 hover 状态（小程序不支持）
- [ ] 所有交互元素最小点击区域 88rpx
- [ ] 未引入任何第三方库
- [ ] 测试通过：`npm test`

---

## 6. 参考文件

| 文件 | 说明 |
|---|---|
| `.claude/skills/notion-design.md` | Notion 设计系统分析原始文件 |
| `PROJECT_HANDOFF.md` §25 | Claude Design 暖奶油画布规范 |
| `.claude/skills/claude-design.md` | 当前项目设计风格参考 |
| `.claude/skills/ui-ux-pro-max.md` | 综合 UI/UX 设计指南 |
