# Claude Design 设计方案 → 刷个冯题 实施方法论

> **参考来源：** `.claude/skills/claude-design.md`（Claude.com 暖奶油画布编辑式设计语言）
> **适用项目：** 刷个冯题 微信小程序（原生 WXML + WXSS + JS）
> **生成时间：** 2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Claude Design 的核心哲学是 **"暖奶油画布编辑式"（Warm Canvas Editorial）**：

- **暖色基调拒绝冷灰**：以 tinted cream（#faf9f5）作为全局画布，刻意区别于 AI 行业普遍使用的冷灰白。画布本身就是品牌差异化信号。
- **文学出版物气质**：衬线 display 字体（Copernicus / Tiempos Headline）搭配人文主义无衬线正文（StyreneB / Inter），整体阅读感像长篇杂志专栏而非 SaaS 营销页。
- **珊瑚色品牌电压**：coral #cc785c 是唯一主色，仅用于 CTA 和全幅 callout 卡片，克制使用——稀缺即品牌。
- **色块对比替代阴影**：深度表达靠 cream / cream-card / dark-navy 三色表面交替，几乎不使用 drop shadow。
- **节奏式布局**：cream → cream-card → dark-mockup → cream → coral-callout → dark-footer 的表面交替构成页面节奏。

### 1.2 视觉 DNA

| 特征 | 描述 |
|---|---|
| 画布色 | #faf9f5 暖奶油，非纯白 |
| 卡片色 | #efe9de 奶油卡片，比画布深一档 |
| 深色面 | #181715 深海军蓝，用于代码展示、产品 mockup、footer |
| 主色 | #cc785c 珊瑚色，仅 CTA 和全幅卡片 |
| 文字色 | #141413 暖墨，非纯黑 |
| 标题字体 | Georgia 衬线，400 weight，负字间距 |
| 正文字体 | 人文主义无衬线（Inter 为替代） |
| 圆角层级 | md=8px / lg=12px / xl=16px / pill=9999px |
| 段落节奏 | section 间距 96px，卡片内边距 32px |
| 阴影策略 | 零阴影，全靠色块对比 |

### 1.3 色彩策略

**三表面模式交替：**
1. **Cream Canvas** #faf9f5 — 默认页面底色
2. **Cream Card** #efe9de — 内容卡片背景
3. **Dark Navy** #181715 — 代码展示、产品 mockup、footer

**珊瑚色使用规则：**
- CTA 按钮背景：#cc785c
- 按钮按下态：#a9583e
- 禁用态：#e6dfd8
- 全幅 callout 卡片：#cc785c 背景 + 白色文字
- 不用于装饰性点缀，仅用于"关键时刻"

**文字色层级：**
- 主文字 #141413（暖墨）
- 强调正文 #252523
- 默认正文 #3d3d3a
- 次要文字 #6c6a64
- 说明文字 #8e8b82

**语义色：**
- 成功 #5db872
- 警告 #d4a017
- 错误 #c64545

### 1.4 字体策略

**双字体分离：**
- **Display**：Georgia 衬线（替代 Copernicus），400 weight，负字间距（-0.3px ~ -1.5px）
- **Body**：系统无衬线（替代 StyreneB/Inter），400-500 weight，零字间距

**关键原则：**
- Display 永远用 400 weight，不用 bold——bold 衬线读感粗暴
- 负字间距是品牌必须——没有负字间距的 Georgia 不是这个品牌
- 衬线用于标题，无衬线用于正文，不可互换

### 1.5 布局与组件模式

**组件类型：**
- **Hero Band**：cream 画布，6:6 栅格，左侧标题+按钮，右侧插图/mockup
- **Feature Card**：#efe9de 背景，12px 圆角，32px 内边距，3 列网格
- **Product Mockup Card Dark**：#181715 背景，展示代码编辑器/终端
- **Callout Card Coral**：#cc785c 全幅卡片，白色文字，CTA 用反色按钮
- **Badge Pill**：#efe9de 背景，pill 圆角，13px/500 字重
- **CTA Band**：珊瑚色或深色全幅条带

---

## 2. 适配分析

### 2.1 可直接迁移

| 元素 | 说明 |
|---|---|
| 暖奶油画布 #faf9f5 | 微信小程序支持 hex 色值，直接使用 |
| 奶油卡片 #efe9de | 直接作为卡片背景色 |
| 珊瑚主色 #cc785c | 直接作为 CTA 按钮色 |
| 暖墨文字 #141413 | 直接作为主文字色 |
| 深色面 #181715 | 直接用于深色卡片/模块标题区 |
| 圆角层级（8/12/16px） | 转为 rpx（16/24/32rpx）直接使用 |
| 色块对比深度策略 | 零阴影 + 色块交替，完美适配小程序性能要求 |
| pill 圆角标签 | 9999px 圆角小程序支持 |
| section 节奏间距 | 96px → 192rpx，可直接映射 |

### 2.2 需要改造

| 原方案 | 改造方式 |
|---|---|
| Copernicus / Tiempos Headline 衬线 | 改用 Georgia（系统内置）或自定义字体 wx.loadFontFace；小程序不支持 web font 预加载 |
| StyreneB 无衬线 | 改用系统默认无衬线（-apple-system, sans-serif）或 Inter 通过 wx.loadFontFace 加载 |
| 12 列栅格 | 改用小程序 flex 布局 + 百分比宽度，小程序无 CSS Grid 完整支持 |
| 96px section 间距 | 转 192rpx，但小程序页面较短，可能需要缩减为 120-160rpx |
| 64px hero padding | 转 128rpx，但小程序首屏高度有限，缩减为 80-100rpx |
| 1200px 最大内容宽度 | 小程序满屏 750rpx，无需 max-width，改为左右 padding 控制 |
| Code Window Card（代码编辑器 mockup） | 用深色卡片 + 等宽字体 `<text>` 模拟，小程序不支持 iframe |
| 鼠标 hover 态 | 小程序无 hover，改用 `active` 态或 `bindtap` 反馈 |
| 1px hairline border | 转 2rpx，小程序 1rpx 在高分屏可能不可见 |

### 2.3 不可迁移

| 元素 | 原因 |
|---|---|
| Anthropic 径向尖刺标志 | 品牌资产，不可用于其他项目 |
| JetBrains Mono 代码字体 | 小程序加载外部等宽字体成本高，改用系统 monospace |
| CSS Grid 复杂布局 | 小程序仅支持部分 Grid 属性，复杂 12 列不可用 |
| `position: sticky` 导航栏 | 小程序原生导航栏不支持 sticky 自定义（需使用自定义导航栏模式） |
| 水平滚动代码块 | 小程序 `<scroll-view>` 可实现但交互体验不同 |
| 动画过渡（typewriter effect 等） | 原文标注为 out of scope，且小程序动画能力有限 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Token | 原值 | 小程序变量名 | 用途 |
|---|---|---|---|
| canvas | #faf9f5 | `--canvas` | 页面背景 |
| surface-card | #efe9de | `--surface-card` | 卡片背景 |
| surface-soft | #f5f0e8 | `--surface-soft` | 分区条带 |
| surface-dark | #181715 | `--surface-dark` | 深色卡片/模块区 |
| surface-dark-elevated | #252320 | `--surface-dark-elevated` | 深色卡片内嵌面板 |
| primary | #cc785c | `--primary` | CTA 按钮、珊瑚标签 |
| primary-active | #a9583e | `--primary-active` | 按钮按下态 |
| primary-disabled | #e6dfd8 | `--primary-disabled` | 按钮禁用态 |
| ink | #141413 | `--ink` | 主文字 |
| body | #3d3d3a | `--body` | 默认正文 |
| body-strong | #252523 | `--body-strong` | 强调正文 |
| muted | #6c6a64 | `--muted` | 次要文字 |
| muted-soft | #8e8b82 | `--muted-soft` | 说明文字 |
| hairline | #e6dfd8 | `--hairline` | 边框线 |
| on-primary | #ffffff | `--on-primary` | 珊瑚按钮上文字 |
| on-dark | #faf9f5 | `--on-dark` | 深色面上文字 |
| on-dark-soft | #a09d96 | `--on-dark-soft` | 深色面次要文字 |
| success | #5db872 | `--success` | 成功状态 |
| warning | #d4a017 | `--warning` | 警告状态 |
| error | #c64545 | `--error` | 错误状态 |
| accent-teal | #5db8a6 | `--accent-teal` | 次要强调色（连接状态等） |
| accent-amber | #e8a55a | `--accent-amber` | 次要暖色（标签高亮） |

### 3.2 字体映射（rpx）

| Token | 原 px | rpx | Weight | Line Height | Letter Spacing | 用途 |
|---|---|---|---|---|---|---|
| display-xl | 64px | 128rpx | 400 | 1.05 | -3rpx | 首页大标题 |
| display-lg | 48px | 96rpx | 400 | 1.1 | -2rpx | 区域标题 |
| display-md | 36px | 72rpx | 400 | 1.15 | -1rpx | 子区域标题 |
| display-sm | 28px | 56rpx | 400 | 1.2 | -0.6rpx | 卡片大标题 |
| title-lg | 22px | 44rpx | 500 | 1.3 | 0 | 定价/分类标题 |
| title-md | 18px | 36rpx | 500 | 1.4 | 0 | 卡片标题 |
| title-sm | 16px | 32rpx | 500 | 1.4 | 0 | 列表标题 |
| body-md | 16px | 32rpx | 400 | 1.55 | 0 | 默认正文 |
| body-sm | 14px | 28rpx | 400 | 1.55 | 0 | 辅助正文 |
| caption | 13px | 26rpx | 500 | 1.4 | 0 | 标签、说明 |
| caption-uppercase | 12px | 24rpx | 500 | 1.4 | 3rpx | 分类标签 |
| button | 14px | 28rpx | 500 | 1 | 0 | 按钮文字 |

**字体栈：**
```css
/* 标题 — Georgia 衬线 */
font-family: Georgia, "Times New Roman", serif;

/* 正文 — 系统无衬线 */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;

/* 代码 — 系统等宽 */
font-family: ui-monospace, "SF Mono", "Cascadia Mono", "Segoe UI Mono", monospace;
```

### 3.3 组件设计规范

#### 按钮

**主按钮（button-primary）**
```css
.btn-primary {
  background-color: var(--primary);     /* #cc785c */
  color: var(--on-primary);             /* #ffffff */
  font-size: 28rpx;
  font-weight: 500;
  padding: 24rpx 40rpx;
  border-radius: 16rpx;                /* rounded.md → 8px → 16rpx */
  line-height: 1;
  text-align: center;
  border: none;
}
.btn-primary:active {
  background-color: var(--primary-active); /* #a9583e */
}
.btn-primary.disabled {
  background-color: var(--primary-disabled); /* #e6dfd8 */
  color: var(--muted);
}
```

**次按钮（button-secondary）**
```css
.btn-secondary {
  background-color: var(--canvas);
  color: var(--ink);
  font-size: 28rpx;
  font-weight: 500;
  padding: 24rpx 40rpx;
  border-radius: 16rpx;
  border: 2rpx solid var(--hairline);
  line-height: 1;
  text-align: center;
}
```

**深色面次按钮（button-secondary-on-dark）**
```css
.btn-secondary-dark {
  background-color: var(--surface-dark-elevated);
  color: var(--on-dark);
  font-size: 28rpx;
  font-weight: 500;
  padding: 24rpx 40rpx;
  border-radius: 16rpx;
  border: none;
  line-height: 1;
  text-align: center;
}
```

**文字链接（text-link）**
```css
.text-link {
  color: var(--primary);
  font-size: 32rpx;
  font-weight: 400;
  background: transparent;
  border: none;
  padding: 0;
}
```

#### 卡片

**奶油内容卡片（feature-card）**
```css
.card-cream {
  background-color: var(--surface-card); /* #efe9de */
  border-radius: 24rpx;                 /* rounded.lg → 12px → 24rpx */
  padding: 64rpx;                       /* spacing.xl → 32px → 64rpx */
}
.card-cream .card-title {
  font-size: 36rpx;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.4;
}
.card-cream .card-body {
  font-size: 32rpx;
  font-weight: 400;
  color: var(--body);
  line-height: 1.55;
  margin-top: 16rpx;
}
```

**深色产品卡片（product-mockup-card-dark）**
```css
.card-dark {
  background-color: var(--surface-dark); /* #181715 */
  border-radius: 24rpx;
  padding: 64rpx;
}
.card-dark .card-title {
  color: var(--on-dark);
  font-size: 36rpx;
  font-weight: 500;
}
.card-dark .card-body {
  color: var(--on-dark-soft);
  font-size: 32rpx;
}
```

**珊瑚 Callout 卡片（callout-card-coral）**
```css
.card-coral {
  background-color: var(--primary); /* #cc785c */
  border-radius: 24rpx;
  padding: 96rpx;                   /* spacing.xxl → 48px → 96rpx */
}
.card-coral .card-title {
  color: var(--on-primary);
  font-size: 56rpx;                 /* display-sm → 28px → 56rpx */
  font-weight: 400;
  font-family: Georgia, serif;
  letter-spacing: -0.6rpx;
}
.card-coral .btn-inverse {
  background-color: var(--canvas);
  color: var(--ink);
}
```

#### 标签 / Badge

**奶油标签（badge-pill）**
```css
.badge-pill {
  background-color: var(--surface-card);
  color: var(--ink);
  font-size: 26rpx;
  font-weight: 500;
  border-radius: 9999rpx;
  padding: 8rpx 24rpx;
  display: inline-block;
}
```

**珊瑚标签（badge-coral）**
```css
.badge-coral {
  background-color: var(--primary);
  color: var(--on-primary);
  font-size: 24rpx;
  font-weight: 500;
  letter-spacing: 3rpx;
  text-transform: uppercase;
  border-radius: 9999rpx;
  padding: 8rpx 24rpx;
  display: inline-block;
}
```

#### 输入框

```css
.input-field {
  background-color: var(--canvas);
  color: var(--ink);
  font-size: 32rpx;
  font-weight: 400;
  padding: 20rpx 28rpx;
  border-radius: 16rpx;
  border: 2rpx solid var(--hairline);
  height: 80rpx;
}
.input-field.focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 6rpx rgba(204, 120, 92, 0.15);
}
```

### 3.4 页面布局模板

#### 首页 Hero 区

```
┌──────────────────────────────────────────┐
│  画布 #faf9f5 · padding: 100rpx 48rpx    │
│                                          │
│  ┌─────────────┐  ┌───────────────────┐  │
│  │ 大标题       │  │                   │  │
│  │ Georgia 衬线 │  │   插图 / Mockup   │  │
│  │ 128rpx/400   │  │   卡片            │  │
│  │              │  │                   │  │
│  │ 副标题       │  │   #efe9de 或      │  │
│  │ 32rpx/400    │  │   #181715         │  │
│  │              │  │                   │  │
│  │ [珊瑚CTA]   │  └───────────────────┘  │
│  └─────────────┘                         │
└──────────────────────────────────────────┘
```

- Hero 区上边距 100rpx（原 96px → 192rpx 缩减，适配小程序首屏）
- 左右 padding 48rpx
- 标题与插图用 flex 布局，小程序端单列堆叠

#### 内容卡片网格

```
┌──────────────────────────────────────────┐
│  画布 #faf9f5 · padding: 0 48rpx         │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ #efe9de  │ │ #efe9de  │ │ #efe9de  │  │
│  │ 圆角24rpx│ │ 圆角24rpx│ │ 圆角24rpx│  │
│  │ padding  │ │ padding  │ │ padding  │  │
│  │ 64rpx    │ │ 64rpx    │ │ 64rpx    │  │
│  │          │ │          │ │          │  │
│  │ 标题     │ │ 标题     │ │ 标题     │  │
│  │ 正文     │ │ 正文     │ │ 正文     │  │
│  └──────────┘ └──────────┘ └──────────┘  │
│                                          │
│  卡片间距: 24rpx                          │
└──────────────────────────────────────────┘
```

- 桌面 3 列 → 小程序 1 列（或 2 列，视内容宽度）
- 卡片间距 24rpx
- flex-wrap: wrap 实现换行

#### 深色模块区

```
┌──────────────────────────────────────────┐
│  深色 #181715 · padding: 80rpx 48rpx     │
│                                          │
│  区域标题（#faf9f5 衬线 72rpx/400）       │
│  区域说明（#a09d96 32rpx/400）            │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  #252320 内嵌面板                  │  │
│  │  代码 / 终端 / 题目展示            │  │
│  │  monospace 28rpx                   │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

- 深色区域用于题目展示、代码高亮、答案解析
- 内嵌面板用 #252320 区分层次

#### 珊瑚 CTA 条带

```
┌──────────────────────────────────────────┐
│  珊瑚 #cc785c · padding: 96rpx 48rpx     │
│                                          │
│  大标题（#ffffff 衬线 56rpx/400）          │
│  副文字（#ffffff 32rpx/400）              │
│                                          │
│  [浅色按钮]  [深色按钮]                   │
│                                          │
└──────────────────────────────────────────┘
```

- 页面底部或章节结尾的行动号召
- 按钮用反色：浅色按钮 #faf9f5 + 暖墨文字

### 3.5 WXSS 示例

#### 全局变量定义（app.wxss）

```css
page {
  /* 表面色 */
  --canvas: #faf9f5;
  --surface-card: #efe9de;
  --surface-soft: #f5f0e8;
  --surface-cream-strong: #e8e0d2;
  --surface-dark: #181715;
  --surface-dark-elevated: #252320;
  --surface-dark-soft: #1f1e1b;

  /* 品牌色 */
  --primary: #cc785c;
  --primary-active: #a9583e;
  --primary-disabled: #e6dfd8;

  /* 文字色 */
  --ink: #141413;
  --body: #3d3d3a;
  --body-strong: #252523;
  --muted: #6c6a64;
  --muted-soft: #8e8b82;

  /* 面上文字 */
  --on-primary: #ffffff;
  --on-dark: #faf9f5;
  --on-dark-soft: #a09d96;

  /* 边框 */
  --hairline: #e6dfd8;
  --hairline-soft: #ebe6df;

  /* 语义色 */
  --success: #5db872;
  --warning: #d4a017;
  --error: #c64545;

  /* 次要强调 */
  --accent-teal: #5db8a6;
  --accent-amber: #e8a55a;

  /* 全局字体 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: var(--ink);
  background-color: var(--canvas);
}
```

#### 首页 Hero 区 WXSS 示例

```css
.hero {
  background-color: var(--canvas);
  padding: 100rpx 48rpx 80rpx;
}

.hero-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 128rpx;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -3rpx;
  color: var(--ink);
  margin-bottom: 32rpx;
}

.hero-subtitle {
  font-size: 32rpx;
  font-weight: 400;
  line-height: 1.55;
  color: var(--body);
  margin-bottom: 48rpx;
}

.hero-card {
  background-color: var(--surface-card);
  border-radius: 32rpx;  /* rounded.xl → 16px → 32rpx */
  padding: 64rpx;
  margin-top: 48rpx;
}
```

#### Feature Card Grid WXSS 示例

```css
.feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  padding: 0 48rpx;
}

.feature-card {
  background-color: var(--surface-card);
  border-radius: 24rpx;
  padding: 64rpx;
  flex: 1;
  min-width: 280rpx;
}

.feature-card__title {
  font-size: 36rpx;
  font-weight: 500;
  line-height: 1.4;
  color: var(--ink);
  margin-bottom: 16rpx;
}

.feature-card__body {
  font-size: 32rpx;
  font-weight: 400;
  line-height: 1.55;
  color: var(--body);
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 理由 |
|---|---|
| 首页 | Hero 区 + feature card 网格 + 深色展示区正好对应原方案的三表面交替节奏 |
| 题目详情页 | 深色卡片展示代码/题目，奶油画布阅读，珊瑚 CTA "下一题" |
| 错题本 | 奶油卡片列表 + 珊瑚标签标记难度/类型 |
| 学习报告页 | 数据展示用深色卡片，行动建议用珊瑚 callout |
| 设置页 | 奶油画布 + hairline 分割的表单区 |

### 4.2 不适合页面

| 页面 | 理由 |
|---|---|
| 纯列表页（如题库浏览） | 大量列表项用奶油卡片会视觉疲劳，考虑用更轻的 surface-soft 或纯画布 |
| 需要高密度信息的页面 | 暖奶油画布的文学气质与高密度信息表格冲突 |
| 需要冷色调数据可视化的页面 | 珊瑚+暖墨色系与蓝/绿图表色可能不协调 |

### 4.3 混搭建议

- **与 HashiCorp 深色风格混搭**：在"代码题目展示"模块引入 HashiCorp 的深色表面系统（#000000 canvas + #15181e surface-1），比 Claude 的 #181715 更黑更沉浸，适合纯代码阅读场景。
- **与极简白色风格混搭**：在"题库浏览"列表页使用更白的底色（#f5f5f5），减少奶油色调的视觉重量，提升列表密度。
- **珊瑚色扩展**：可为不同题目类型（选择题/填空题/编程题）创建珊瑚色的明度变体标签，但不要引入全新色相。

---

## 5. 实施检查清单

- [ ] 全局 CSS 变量已定义在 `app.wxss` 的 `page` 选择器中
- [ ] 所有颜色使用 CSS 变量，不硬编码 hex 值
- [ ] 标题使用 Georgia 衬线字体，400 weight，负字间距
- [ ] 正文使用系统无衬线字体，400-500 weight
- [ ] 卡片圆角 24rpx（12px），按钮圆角 16rpx（8px），标签使用 pill 圆角
- [ ] CTA 按钮仅使用珊瑚色 #cc785c，active 态 #a9583e
- [ ] 深色面仅用于代码/题目展示区，不滥用
- [ ] 色块交替节奏：cream → card → dark → cream → coral
- [ ] 无 drop shadow，深度靠色块对比
- [ ] section 间距 120-160rpx（原 96px → 192rpx 缩减适配）
- [ ] 卡片内边距 64rpx
- [ ] 按钮最小触摸区域 80rpx 高度
- [ ] 边框使用 2rpx solid var(--hairline)
- [ ] 语义色（success/warning/error）已定义
- [ ] 次要强调色（accent-teal / accent-amber）已定义
- [ ] 字体回退栈已配置
- [ ] 所有文字色对比度符合 WCAG AA 标准（#141413 on #faf9f5 = 17.5:1）
- [ ] 深色面上文字对比度符合标准（#faf9f5 on #181715 = 17.5:1）

---

## 6. 参考文件

| 文件 | 说明 |
|---|---|
| `.claude/skills/claude-design.md` | 原方案完整设计规范 |
| `PROJECT_HANDOFF.md` | 项目交接文档（含当前设计风格记录） |
| `CLAUDE.md` | 项目指令文件（含设计风格约束） |
| `pages/index/index.wxss` | 首页现有样式（实施参考） |
| `app.wxss` | 全局样式文件（变量定义位置） |
