# Lovable 设计方案 → 刷个冯题 实施方法论

> **参考来源**: `.claude/skills/lovable-design.md` — Lovable 官网设计系统
> **适用项目**: 刷个冯题 微信小程序（WXML + WXSS + JS）
> **生成时间**: 2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Lovable 的设计哲学是**温暖的手作感**。整站建立在奶油色画布上，拒绝冷白，追求"精心制作的笔记本"般的质感。核心理念：

- **暖色调优先**：所有表面都是 tinted 的，从不使用纯白
- **不透明度驱动的灰度系统**：所有灰色都从同一个 `#1c1c1c` 派生，通过不同透明度实现层次，保证视觉统一
- **边框替代阴影**：用暖色边线（`#eceae4`）而非阴影来界定内容区域
- **窄字重范围**：仅用 400（正文/UI）和 600（标题），通过字号和字距建立层次
- **编辑式排版**：大标题使用负字间距（-0.9px ~ -1.5px），营造紧凑、自信的编辑感

### 1.2 视觉 DNA

| 特征 | Lovable 做法 |
|------|-------------|
| 画布色 | `#f7f4ed` 暖奶油纸色，非纯白 |
| 主文字色 | `#1c1c1c` 暖炭黑，非纯黑 |
| 边界表达 | `1px solid #eceae4` 暖色细边线，零阴影 |
| 按钮风格 | 暗色底 + 多层 inset 阴影（白高光上缘 + 暗环下缘） |
| 圆角策略 | 6px 标准按钮、12px 卡片、9999px 药丸形 |
| 深度模型 | 5 级：平面 → 带边框 → inset 阴影 → focus 柔阴影 → 焦点环 |
| 交互反馈 | opacity 0.8 缩减，柔和不突兀 |

### 1.3 色彩策略

Lovable 的色彩极度克制——几乎只有暖奶油和炭黑两个极点，中间靠不透明度过渡：

- **主色对**：`#f7f4ed`（奶油画布） vs `#1c1c1c`（炭黑文字/按钮）
- **辅助白**：`#fcfbf8`，按钮文字、微高光
- **灰色全部由 `#1c1c1c` 派生**：100%、83%、82%、40%、4%、3% 不透明度
- **边线色**：`#eceae4`（被动边界）、`rgba(28,28,28,0.4)`（交互边界）
- **无饱和强调色**：整个系统没有蓝色、红色、绿色作为 UI 色

### 1.4 字体策略

- **字体**：Camera Plain Variable（人文主义无衬线，圆润终端、有机曲线）
- **字重**：400（正文/UI/按钮/链接）和 600（标题/强调），极窄范围
- **特殊字重**：480 用于特殊展示（可变字体支持）
- **字间距**：大标题负字间距 -0.9px ~ -1.5px，正文保持 normal
- **行高**：标题 1.00–1.10（紧凑），正文 1.50（舒适）

### 1.5 布局与组件模式

- **间距基准**：8px，向上扩展至 80px–208px 的大区间间距
- **编辑式留白**：区间间距极大（80px–208px），卡片内部紧凑（12–24px）
- **容器宽度**：约 1200px 居中
- **边角圆角梯度**：4px（微元素）→ 6px（按钮）→ 12px（卡片）→ 16px（大容器）→ 9999px（药丸）
- **卡片**：奶油底 + `#eceae4` 细边框，无阴影
- **导航**：奶油底水平导航，固定定位

---

## 2. 适配分析

### 2.1 可直接迁移

| Lovable 特征 | 刷个冯题对应 | 说明 |
|-------------|------------|------|
| 暖奶油画布 `#f7f4ed` | 当前画布 `#faf9f5` | 极其接近，色差 ΔE<2，可视为同色系 |
| 暖炭黑文字 `#1c1c1c` | 当前文字 `#141413` | 同为暖黑，几乎无差异 |
| 边框替代阴影 | 当前已采用零阴影 | 理念完全一致 |
| 负字间距标题 | 当前 Georgia 已用 -3rpx | 策略一致，数值需微调 |
| 窄字重范围 | 当前 Georgia 400 weight | 理念一致 |
| opacity 反馈 | 可直接采用 | 微信小程序支持 opacity |
| 药丸形按钮（9999px） | 可直接用于特定场景 | 适合标签、筛选器 |

### 2.2 需要改造

| Lovable 特征 | 改造方向 | 原因 |
|-------------|---------|------|
| Camera Plain Variable 字体 | 替换为 Georgia（衬线）+ system-ui fallback | 项目已选定 Georgia 作为标题字体，保持一致性 |
| `#eceae4` 边框色 | 调整为项目边框色 | 当前项目边框色需与 `#faf9f5` 画布协调 |
| 多层 inset 阴影 | 简化为单层或移除 | 微信小程序对复杂 box-shadow 支持有限，且项目已采用零阴影 |
| 6px 按钮圆角 | 调整为 24rpx | 项目标准圆角为 24rpx，更符合小程序视觉 |
| 12px 卡片圆角 | 调整为 24rpx | 同上 |
| 8px 间距基准 | 保留，但转换为 rpx | 微信小程序使用 rpx 单位 |
| 1200px 容器宽度 | 移除固定宽度 | 小程序全屏宽度，无需 max-width |
| Ring Blue 焦点环 | 替换为暖色焦点指示 | `#3b82f6` 蓝色与暖色调冲突 |

### 2.3 不可迁移

| Lovable 特征 | 原因 |
|-------------|------|
| shadcn/ui + Radix UI 组件 | 微信小程序不使用 React/Web 组件库 |
| Tailwind CSS 工具类 | 小程序用 WXSS，不用 Tailwind |
| CSS 变量（`--tw-ring-color`） | 小程序 WXSS 对 CSS 变量支持有限 |
| 可变字体（Variable Font） | 微信小程序对可变字体支持不完整 |
| `ui-sans-serif, system-ui` 字体栈 | 小程序字体系统不同，需用 `font-family` 直接指定 |
| 响应式断点（600px–1536px） | 小程序以 rpx 自适应，无传统断点 |
| hover 状态 | 小程序无 hover，用 active 替代 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 角色 | Lovable 原值 | 刷个冯题映射值 | 说明 |
|------|-------------|---------------|------|
| 画布背景 | `#f7f4ed` | `#faf9f5`（已有） | 项目暖奶油色，几乎一致 |
| 卡片背景 | `#f7f4ed` | `#efe9de`（已有） | 项目奶油卡片色 |
| 主文字 | `#1c1c1c` | `#141413`（已有） | 项目暖墨色 |
| 次要文字 | `#5f5f5d` | `#6c6a64`（已有） | 项目次要文字色 |
| 按钮文字（暗底上） | `#fcfbf8` | `#faf9f5` | 项目画布色用作暗底文字 |
| 主 CTA 背景 | `#1c1c1c` | `#cc785c`（已有） | 项目珊瑚色 CTA（与 Lovable 暗色 CTA 策略不同） |
| 主 CTA Active | opacity 0.8 | `#a9583e`（已有） | 项目 CTA 按下态 |
| 被动边框 | `#eceae4` | `#e8e2d9` | 比项目画布深一度的暖灰，用于卡片边线 |
| 交互边框 | `rgba(28,28,28,0.4)` | `rgba(20,20,19,0.25)` | 项目暖墨色 25% 不透明度 |
| 微灰底（hover/active） | `rgba(28,28,28,0.04)` | `rgba(20,20,19,0.04)` | 保持一致的极淡灰底 |
| 深色表面 | 无 | `#181715`（已有） | 项目深海军蓝，用于深色区域 |

### 3.2 字体映射 rpx

| 角色 | Lovable 原值 | 刷个冯题映射 | 说明 |
|------|-------------|-------------|------|
| 首页大标题 | 60px / 600 / -1.5px | 72rpx / Georgia 400 / -3rpx | 项目标准标题规格 |
| 区间标题 | 48px / 600 / -1.2px | 56rpx / Georgia 400 / -3rpx | 略小于首页标题 |
| 子标题 | 36px / 600 / -0.9px | 40rpx / Georgia 400 / -2rpx | 适中层级 |
| 卡片标题 | 20px / 400 / normal | 32rpx / Georgia 400 / normal | 卡片内部标题 |
| 正文大 | 18px / 400 / normal | 30rpx / -apple-system 400 / normal | 正文引导文字 |
| 正文 | 16px / 400 / normal | 28rpx / -apple-system 400 / normal | 标准阅读文字 |
| 按钮文字 | 16px / 400 / normal | 28rpx / -apple-system 400 / normal | 按钮标签 |
| 小按钮 | 14px / 400 / normal | 24rpx / -apple-system 400 / normal | 紧凑按钮 |
| 说明文字 | 14px / 400 / normal | 24rpx / -apple-system 400 / normal | 元数据、小字 |

### 3.3 组件设计规范

#### 主要按钮（珊瑚 CTA）

```css
/* Lovable 原版：暗底 + inset 阴影 → 刷个冯题：珊瑚底，无阴影 */
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border: none;
  border-radius: 24rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.5;
  /* Lovable 的 inset 阴影简化为无阴影，符合项目零阴影原则 */
}
.btn-primary:active {
  background-color: #a9583e;
  /* Lovable 用 opacity 0.8，项目用具体色值，更精确 */
}
```

#### 幽灵/描边按钮

```css
/* Lovable 原版：透明底 + rgba(28,28,28,0.4) 边框 → 适配项目 */
.btn-ghost {
  background-color: transparent;
  color: #141413;
  border: 2rpx solid rgba(20, 20, 19, 0.25);
  border-radius: 24rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 400;
}
.btn-ghost:active {
  background-color: rgba(20, 20, 19, 0.04);
}
```

#### 药丸标签（Lovable 特色组件）

```css
/* Lovable 的全圆角药丸形 → 用于标签/筛选器 */
.pill-tag {
  display: inline-block;
  background-color: #efe9de;
  color: #141413;
  border: 2rpx solid #e8e2d9;
  border-radius: 9999rpx;
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  font-weight: 400;
}
.pill-tag.active {
  background-color: #cc785c;
  color: #faf9f5;
  border-color: #cc785c;
}
```

#### 卡片

```css
/* Lovable 原版：奶油底 + #eceae4 边框，无阴影 → 直接迁移 */
.card {
  background-color: #efe9de;
  border: 2rpx solid #e8e2d9;
  border-radius: 24rpx;
  padding: 24rpx;
  /* 无 box-shadow，与项目零阴影原则一致 */
}
```

#### 输入框

```css
/* Lovable 原版：奶油底 + 细边框 → 适配项目 */
.input-field {
  background-color: #efe9de;
  color: #141413;
  border: 2rpx solid #e8e2d9;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
}
.input-field:focus {
  border-color: rgba(20, 20, 19, 0.25);
  /* Lovable 用蓝色焦点环，项目改用暖色边框加深 */
}
```

### 3.4 页面布局模板

#### 首页布局（借鉴 Lovable 编辑式留白）

```
┌─────────────────────────────────┐
│  状态栏                          │
├─────────────────────────────────┤
│                                 │
│  区间间距: 48rpx                 │
│                                 │
│  [大标题 - Georgia 72rpx -3rpx] │
│  [副标题 - 30rpx #6c6a64]       │
│                                 │
│  区间间距: 64rpx                 │
│                                 │
│  ┌──────┐  ┌──────┐             │
│  │ 功能 │  │ 功能 │  卡片网格    │
│  │ 卡片 │  │ 卡片 │  24rpx圆角  │
│  │      │  │      │  细边框     │
│  └──────┘  └──────┘             │
│                                 │
│  区间间距: 80rpx（Lovable 式大留白）│
│                                 │
│  [学习状态条]                    │
│                                 │
│  区间间距: 64rpx                 │
│                                 │
│  ┌──────────────────────┐       │
│  │ 工具列表区域          │       │
│  │ 药丸标签筛选器        │       │
│  └──────────────────────┘       │
│                                 │
│  底部导航                        │
└─────────────────────────────────┘
```

#### 内容页布局

```
┌─────────────────────────────────┐
│  返回  标题                      │
├─────────────────────────────────┤
│                                 │
│  48rpx 区间间距                  │
│                                 │
│  [章节标题 - 40rpx Georgia]     │
│  [正文 - 28rpx system]          │
│                                 │
│  32rpx 段落间距                  │
│                                 │
│  ┌──────────────────────┐       │
│  │ 代码块/卡片           │       │
│  │ #efe9de 背景          │       │
│  │ 24rpx 圆角            │       │
│  │ #e8e2d9 细边框        │       │
│  └──────────────────────┘       │
│                                 │
│  64rpx 大留白                    │
│                                 │
│  [下一个章节...]                 │
└─────────────────────────────────┘
```

### 3.5 WXSS 示例

#### Lovable 风格卡片列表页

```css
/* 页面容器 - Lovable 编辑式留白 */
.page-container {
  background-color: #faf9f5;
  padding: 0 32rpx;
  min-height: 100vh;
}

/* 区间标题 - Lovable 式负字间距 */
.section-title {
  font-family: Georgia, serif;
  font-size: 56rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  color: #141413;
  line-height: 1.1;
  margin-bottom: 16rpx;
}

/* 副标题 - Lovable 式柔和灰 */
.section-subtitle {
  font-size: 30rpx;
  font-weight: 400;
  color: #6c6a64;
  line-height: 1.4;
  margin-bottom: 48rpx;
}

/* 卡片 - Lovable 式边框界定，无阴影 */
.feature-card {
  background-color: #efe9de;
  border: 2rpx solid #e8e2d9;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.feature-card__title {
  font-family: Georgia, serif;
  font-size: 32rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 12rpx;
}

.feature-card__desc {
  font-size: 26rpx;
  font-weight: 400;
  color: #6c6a64;
  line-height: 1.5;
}

/* 药丸标签筛选器 - Lovable 特色 */
.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.filter-pill {
  background-color: #efe9de;
  border: 2rpx solid #e8e2d9;
  border-radius: 9999rpx;
  padding: 8rpx 28rpx;
  font-size: 24rpx;
  color: #6c6a64;
}

.filter-pill--active {
  background-color: #cc785c;
  border-color: #cc785c;
  color: #faf9f5;
}

/* 大留白区间 - Lovable 编辑式节奏 */
.spacer-lg {
  height: 80rpx;
}
.spacer-md {
  height: 48rpx;
}

/* 按钮 - Lovable 式简洁 */
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  text-align: center;
}

.btn-primary:active {
  background-color: #a9583e;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 原因 |
|------|------|
| **首页功能卡片区** | Lovable 的边框卡片 + 药丸标签筛选器完美适配工具列表 |
| **学习记录/历史页** | 编辑式留白 + 柔和灰度层次适合时间线类内容 |
| **设置页** | 简洁的表单样式、柔和的交互反馈 |
| **搜索/筛选结果页** | 药丸标签筛选器是 Lovable 的标志性组件 |
| **关于/介绍页** | 编辑式大标题 + 舒适留白适合品牌展示 |

### 4.2 不适合页面

| 页面 | 原因 |
|------|------|
| **刷题/答题页** | 需要高对比、快速反馈，Lovable 的柔和风格可能降低可读性 |
| **计时器/倒计时页** | 需要强烈的视觉紧迫感，Lovable 的暖灰调过于平静 |
| **排行榜/数据密集页** | Lovable 的大留白会浪费屏幕空间，数据展示需要紧凑布局 |
| **深色主题页** | Lovable 系统不含深色主题方案，需额外设计 |

### 4.3 混搭建议

| 组合 | 做法 |
|------|------|
| **Lovable 卡片 + 暖奶油画布** | 直接混用，两者画布色几乎一致，视觉无缝 |
| **Lovable 药丸标签 + 项目珊瑚 CTA** | 标签用 Lovable 药丸形，主操作用项目珊瑚色，层次清晰 |
| **Lovable 留白节奏 + 项目 Georgia 标题** | 用 Lovable 的大区间间距配合 Georgia 衬线标题，编辑感更强 |
| **Lovable 边框卡片 + 项目深色区域** | 浅色区用 Lovable 卡片风格，深色区用项目 `#181715`，形成对比 |

---

## 5. 实施检查清单

### 色彩
- [ ] 画布背景使用 `#faf9f5`，不使用纯白
- [ ] 卡片背景使用 `#efe9de`，边框使用 `#e8e2d9`
- [ ] 文字主色使用 `#141413`，次要文字使用 `#6c6a64`
- [ ] 灰度层次通过 rgba 不透明度派生，不引入独立灰色值
- [ ] CTA 使用 `#cc785c`（珊瑚色），active 使用 `#a9583e`

### 字体
- [ ] 标题使用 Georgia 衬线体，400 weight，负字间距
- [ ] 正文使用 -apple-system / system-ui，400 weight
- [ ] 不引入 Camera Plain Variable 或其他自定义字体
- [ ] 字号使用 rpx 单位，不使用 px

### 组件
- [ ] 按钮圆角使用 24rpx（非 Lovable 的 6px）
- [ ] 卡片圆角使用 24rpx（非 Lovable 的 12px）
- [ ] 药丸标签使用 9999rpx 圆角
- [ ] 无 box-shadow，使用边框界定内容
- [ ] 交互反馈使用 active 色值变化，不用 opacity 0.8
- [ ] 无 hover 状态，所有交互用 active/tap 替代

### 布局
- [ ] 间距使用 rpx 单位
- [ ] 区间大间距使用 64rpx–80rpx（借鉴 Lovable 编辑式留白）
- [ ] 卡片内部间距使用 24rpx–32rpx
- [ ] 无 max-width 限制，全屏布局
- [ ] 无 CSS 变量、无 Tailwind 类名

### 小程序兼容
- [ ] 不使用 box-shadow 多层 inset 效果
- [ ] 不使用 CSS 变量（`var(--xxx)`）
- [ ] 不使用 hover 伪类
- [ ] 所有尺寸使用 rpx，不使用 px/rem
- [ ] 字体栈使用小程序支持的系统字体

---

## 6. 参考文件

| 文件 | 说明 |
|------|------|
| `.claude/skills/lovable-design.md` | Lovable 原始设计系统文档 |
| `PROJECT_HANDOFF.md` §25 | 项目设计风格定义（暖奶油画布） |
| `.claude/skills/claude-design.md` | Claude Design 暖奶油画布风格参考 |
| `pages/index/index.wxss` | 首页现有样式（实现参考） |
| `app.wxss` | 全局样式变量 |
