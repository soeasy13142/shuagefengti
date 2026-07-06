# Mastercard 设计方案 → 刷个冯题 实施方法论

> **参考来源**: `.claude/skills/mastercard-design.md` — Mastercard 官网设计系统
> **适用项目**: 刷个冯题 微信小程序（WXML + WXSS + JS）
> **生成时间**: 2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Mastercard 的设计哲学是**编辑式机构感**——像一本高端年报的网页版。核心理念：

- **极端圆角作为设计语言**：40px、99px、1000px 主导，几乎不存在方形边角
- **轨道与轨迹**：圆形头像由纤细的手绘感橙色弧线连接，暗示服务之间的运动关系
- **卫星式微 CTA**：白色圆形小按钮附着在圆形头像边缘，像卫星绕行星
- **幽灵水印标题**：奶油色上叠奶油色的大字标题，营造压纹纸张质感
- **三色面层次**：画布奶油 → 提亮奶油 → 墨黑页脚，三个色面构成页面节奏
- **宽松叙事留白**：每个服务区块只展示一个圆形头像，周围保留 300–500px 空白

### 1.2 视觉 DNA

| 特征 | Mastercard 做法 |
|------|----------------|
| 画布色 | `#F3F0EE` 暖灰奶油，永不纯白 |
| 主文字色 | `#141413` 暖墨黑（与项目完全一致） |
| 圆角策略 | 极端：20px（按钮）、40px（英雄媒体）、50%（圆形头像）、999px（药丸导航） |
| 按钮风格 | 墨黑药丸底 + 奶油文字，20px 圆角 |
| 导航 | 浮动白色药丸导航栏，999px 圆角，带柔阴影 |
| 图像处理 | 圆形裁切，附白色卫星 CTA |
| 页脚 | `#141413` 深色底，白色文字，四栏链接 |
| 深度模型 | 4 级：无阴影 → 极柔浮起 → 柔光晕 → 戏剧性提升 |

### 1.3 色彩策略

Mastercard 的色彩比 Lovable 更有层次——保留暖奶油基调，但增加了信号橙和深墨两个极点：

- **画布三色面**：`#F3F0EE`（画布奶油）→ `#FCFBFA`（提亮奶油）→ `#141413`（墨黑页脚）
- **品牌色仅用于 Logo**：`#EB001B`（红）和 `#F79E1B`（黄）不进入 UI 调色板
- **信号橙仅用于合规**：`#CF4500` 用于 cookie 同意等法律场景，绝不用作营销 CTA
- **装饰弧线用浅橙**：`#F37338` 用于轨道弧线和轮播指示器
- **深灰层次**：`#262627`（炭灰）、`#696969`（石板灰）、`#555555`（花岗灰）
- **链接蓝**：`#3860BE` 用于内联链接，有质感不刺眼

### 1.4 字体策略

- **字体**：MarkForMC（专有几何无衬线），fallback SofiaSans, Arial
- **字重**：450（正文，比 400 柔和比 500 轻盈）、500（标题/按钮）、700（标签/大写追踪）
- **字间距**：标题 -2% 负字距，正文 normal，标签 +4% 正字距大写
- **行高**：H1 为 1:1 极紧凑，H3 为 1.2，正文为 1.4
- **标签文字**：14px / 700 / 大写 / +4% 字距 + 小圆点前缀

### 1.5 布局与组件模式

- **间距基准**：8px，向上扩展至 96–128px 区间间距
- **容器宽度**：1200–1280px 居中，48–100px 水平边距
- **圆角梯度**：3–6px（微元素）→ 20px（按钮）→ 40px（英雄媒体）→ 50%（圆形）→ 999px（药丸）
- **网格**：12 列隐含，实际用 2 列不对称、全宽、交错单头像布局
- **页脚**：墨黑底 + 白字 + 四栏链接 + 大对话式 H2

---

## 2. 适配分析

### 2.1 可直接迁移

| Mastercard 特征 | 刷个冯题对应 | 说明 |
|----------------|------------|------|
| 暖墨黑 `#141413` | 当前文字色 `#141413` | 完全一致，无需调整 |
| 暖灰奶油画布 `#F3F0EE` | 当前画布 `#faf9f5` | 同为暖奶油系，色差小 |
| 深色页脚 `#141413` | 当前深色面 `#181715` | 理念一致，色值接近 |
| 三色面层次 | 项目已有此模式 | `#faf9f5` → `#efe9de` → `#181715` |
| 极端圆角药丸形 | 可直接用于标签/导航 | 999rpx 在小程序中完全支持 |
| 轮播圆形指示器 | 可直接迁移 | 圆形 dot 指示器是通用组件 |
| 宽松叙事留白 | 可用于详情/介绍页 | 适合内容展示型页面 |
| 20px 圆角按钮 | 可直接迁移 | 40rpx 在小程序中表现良好 |

### 2.2 需要改造

| Mastercard 特征 | 改造方向 | 原因 |
|----------------|---------|------|
| 圆形头像裁切 | 用 `border-radius: 50%` 实现 | 小程序支持，但需注意 image 组件的裁切行为 |
| 卫星式微 CTA | 简化定位方式 | `overflow: visible` + 负定位在小程序中需测试兼容性 |
| 浮动药丸导航 | 改为小程序原生导航或自定义顶部栏 | 小程序有原生导航栏限制，浮动定位需用 `position: fixed` |
| 幽灵水印标题 | 降低字号适配小屏 | 72–128px 在手机屏幕上过大，需缩至 80–120rpx |
| 轨道弧线装饰 | 简化或用 canvas 替代 | CSS 弧线在小程序中实现复杂，可用 SVG 或 canvas |
| 40px 英雄媒体圆角 | 调整为 32–48rpx | 40px=80rpx 过大，需根据小程序屏幕比例调整 |
| 450 字重 | 替换为 400 | 小程序不支持 450 字重，用 400 + 微调字距补偿 |
| -2% 字间距 | 转换为 rpx 负值 | 小程序用 rpx，需计算对应值 |

### 2.3 不可迁移

| Mastercard 特征 | 原因 |
|----------------|------|
| MarkForMC 专有字体 | 项目已选定 Georgia（标题）+ system-ui（正文） |
| CSS box-shadow 复杂阴影 | 小程序对多层阴影支持有限，且项目采用零阴影 |
| `rgba(0,0,0,0.08) 0px 24px 48px` 大面积柔阴影 | 与项目零阴影原则冲突 |
| 12 列 CSS Grid | 小程序用 flex 布局，无 CSS Grid |
| 响应式断点（≤767 / 768–1023 / ≥1024） | 小程序用 rpx 自适应，无传统断点 |
| hover 状态 | 小程序无 hover |
| `loading="lazy"` 图片懒加载 | 小程序有自己的懒加载机制（`lazy-load` 属性） |
| cookie 合规橙色系统 | 小程序无 cookie 概念，信号橙色无用武之地 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 角色 | Mastercard 原值 | 刷个冯题映射值 | 说明 |
|------|----------------|---------------|------|
| 画布背景 | `#F3F0EE` | `#faf9f5`（已有） | 暖奶油色，色差极小 |
| 提亮面 | `#FCFBFA` | `#efe9de`（已有） | 项目卡片色，比画布深一度（与 Mastercard 相反方向，但效果类似） |
| 深色表面 | `#141413`（页脚） | `#181715`（已有） | 项目深海军蓝 |
| 主文字 | `#141413` | `#141413`（已有） | 完全一致 |
| 次要文字 | `#696969` | `#6c6a64`（已有） | 同为中性灰，差异可忽略 |
| 标签/大写文字 | `#696969` | `#6c6a64` | 用于 eyebrow 标签 |
| 主 CTA | `#141413`（墨黑） | `#cc785c`（珊瑚色） | **关键差异**：Mastercard 用墨黑 CTA，项目用珊瑚色 |
| CTA 文字 | `#F3F0EE`（奶油） | `#faf9f5` | 暖白底上深色按钮的文字 |
| 边框 | `1px #141413 at 50%` | `2rpx rgba(20,20,19,0.15)` | 项目用更淡的边框 |
| 链接色 | `#3860BE`（深蓝） | `#cc785c` | 项目用珊瑚色替代蓝色链接 |
| 装饰弧线 | `#F37338`（浅橙） | `#cc785c`（珊瑚色） | 用项目 CTA 色替代，统一色调 |

### 3.2 字体映射 rpx

| 角色 | Mastercard 原值 | 刷个冯题映射 | 说明 |
|------|----------------|-------------|------|
| H1 英雄标题 | 64px / 500 / -2% | 80rpx / Georgia 400 / -4rpx | Georgia 衬线替代 MarkForMC，400 weight |
| H2 区间标题 | 36px / 500 / -2% | 56rpx / Georgia 400 / -3rpx | 项目标准区间标题 |
| H3 卡片标题 | 24px / 500 / -2% | 36rpx / Georgia 400 / -2rpx | 卡片内部标题 |
| Eyebrow 标签 | 14px / 700 / +4% / 大写 | 22rpx / -apple-system 700 / +1rpx / 大写 | 小程序中用 `text-transform: uppercase` |
| 正文 | 16px / 450 / normal | 28rpx / -apple-system 400 / normal | 450 替换为 400 |
| 按钮文字 | 16px / 500 / -3% | 28rpx / -apple-system 400 / normal | 简化字重和字距 |
| 页脚链接 | 14px / 450 / normal | 24rpx / -apple-system 400 / normal | 深色底上的轻盈文字 |
| 页脚栏标题 | 12–14px / 700 / +4% | 22rpx / -apple-system 700 / +1rpx | 大写，短字距 |

### 3.3 组件设计规范

#### 主要按钮（药丸形，借鉴 Mastercard）

```css
/* Mastercard 原版：墨黑药丸 20px 圆角 → 刷个冯题：珊瑚药丸 */
.btn-pill-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border: 2rpx solid #cc785c;
  border-radius: 9999rpx;          /* Mastercard 的全药丸风格 */
  padding: 16rpx 48rpx;            /* 宽松水平内距 */
  font-size: 28rpx;
  font-weight: 400;
  text-align: center;
}
.btn-pill-primary:active {
  background-color: #a9583e;
  border-color: #a9583e;
}
```

#### 描边药丸按钮

```css
/* Mastercard 原版：白底 + 墨黑描边药丸 → 适配项目 */
.btn-pill-outline {
  background-color: #faf9f5;
  color: #141413;
  border: 2rpx solid #141413;
  border-radius: 9999rpx;
  padding: 16rpx 48rpx;
  font-size: 28rpx;
  font-weight: 400;
}
.btn-pill-outline:active {
  background-color: #efe9de;
}
```

#### Eyebrow 标签（Mastercard 特色组件）

```css
/* Mastercard 的小圆点 + 大写标签 → 可用于章节分类标识 */
.eyebrow-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: #6c6a64;
  margin-bottom: 16rpx;
}
.eyebrow-label::before {
  content: '';
  display: inline-block;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #cc785c;  /* Mastercard 用信号橙，项目用珊瑚色 */
}
```

#### 圆形头像卡片（Mastercard 特色组件）

```css
/* Mastercard 的圆形服务头像 + 卫星 CTA → 简化版 */
.circle-portrait {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}
.circle-portrait image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* 卫星 CTA - 简化为右下角小圆形按钮 */
.satellite-cta {
  position: absolute;
  right: -8rpx;
  bottom: -8rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #faf9f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e8e2d9;
}
```

#### 幽灵水印标题（Mastercard 特色效果）

```css
/* Mastercard 的奶油叠奶油大字 → 适配小屏 */
.ghost-watermark {
  font-family: Georgia, serif;
  font-size: 100rpx;          /* 从 72–128px 缩小适配 */
  font-weight: 400;
  letter-spacing: -4rpx;
  color: rgba(250, 249, 245, 0.6);  /* 画布色微透明，奶油叠奶油 */
  line-height: 1.0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}
```

#### 深色页脚区域

```css
/* Mastercard 的墨黑页脚 → 项目深色面 */
.footer-dark {
  background-color: #181715;
  padding: 64rpx 32rpx 96rpx;
}
.footer-dark__headline {
  font-family: Georgia, serif;
  font-size: 48rpx;
  font-weight: 400;
  color: #faf9f5;
  letter-spacing: -2rpx;
  line-height: 1.2;
  margin-bottom: 48rpx;
}
.footer-dark__links {
  display: flex;
  flex-wrap: wrap;
  gap: 32rpx;
}
.footer-dark__link {
  font-size: 24rpx;
  color: rgba(250, 249, 245, 0.7);
}
.footer-dark__column-title {
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: rgba(250, 249, 245, 0.4);
  margin-bottom: 24rpx;
}
```

#### 轮播指示器（圆形 dot）

```css
/* Mastercard 的圆形指示器风格 */
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-top: 24rpx;
}
.carousel-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: rgba(20, 20, 19, 0.2);
}
.carousel-dot--active {
  background-color: #cc785c;
  width: 24rpx;               /* 活动态拉长为胶囊 */
  border-radius: 9999rpx;
}
```

### 3.4 页面布局模板

#### 首页布局（借鉴 Mastercard 三色面层次）

```
┌─────────────────────────────────┐
│  状态栏                          │
├─────────────────────────────────┤  ┐
│                                 │  │
│  #faf9f5 画布面                 │  │ 色面 1
│                                 │  │ 画布奶油
│  [Eyebrow: ● 功能区]            │  │
│  [大标题 Georgia 80rpx -4rpx]   │  │
│  [副标题 28rpx #6c6a64]         │  │
│                                 │  │
│  ┌──────────────────────┐       │  │
│  │ 功能卡片轮播          │       │  │
│  │ 圆形指示器            │       │  │
│  └──────────────────────┘       │  │
│                                 │  │
├─────────────────────────────────┤  ┤
│                                 │  │
│  #efe9de 提亮面                 │  │ 色面 2
│                                 │  │ 提亮奶油
│  [Eyebrow: ● 学习进度]          │  │
│  [圆形头像 + 卫星 CTA]          │  │
│  [幽灵水印标题背景]              │  │
│                                 │  │
├─────────────────────────────────┤  ┤
│                                 │  │
│  #181715 深色面                 │  │ 色面 3
│                                 │  │ 深海军蓝
│  [对话式大标题]                  │  │
│  [白色链接网格]                  │  │
│  [版权信息]                     │  │
│                                 │  │
└─────────────────────────────────┘  ┘
```

#### 内容详情页（借鉴 Mastercard 宽松叙事）

```
┌─────────────────────────────────┐
│  返回  标题                      │
├─────────────────────────────────┤
│                                 │
│  [Eyebrow: ● 章节名]            │  ← 标签式章节标识
│                                 │
│  [章节标题 Georgia 56rpx]       │
│  [正文 28rpx]                   │
│                                 │
│  80rpx 宽松间距（叙事节奏）       │  ← Mastercard 式大留白
│                                 │
│  ┌──────────────────────┐       │
│  │ 圆形图示 + 说明文字    │       │  ← 不对称布局
│  │ （偏左或偏右放置）     │       │
│  └──────────────────────┘       │
│                                 │
│  80rpx 宽松间距                  │
│                                 │
│  [下一个 Eyebrow + 章节]        │
│                                 │
└─────────────────────────────────┘
```

### 3.5 WXSS 示例

#### Mastercard 风格三色面首页

```css
/* ===== 色面 1：画布奶油区 ===== */
.hero-section {
  background-color: #faf9f5;
  padding: 48rpx 32rpx 64rpx;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: #6c6a64;
  margin-bottom: 20rpx;
}
.eyebrow::before {
  content: '';
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #cc785c;
}

.hero-title {
  font-family: Georgia, serif;
  font-size: 80rpx;
  font-weight: 400;
  letter-spacing: -4rpx;
  color: #141413;
  line-height: 1.0;
  margin-bottom: 24rpx;
}

.hero-subtitle {
  font-size: 28rpx;
  font-weight: 400;
  color: #6c6a64;
  line-height: 1.4;
  margin-bottom: 48rpx;
}

/* ===== 色面 2：提亮奶油区 ===== */
.feature-section {
  background-color: #efe9de;
  padding: 64rpx 32rpx;
  position: relative;
  overflow: hidden;
}

/* 幽灵水印标题 */
.feature-section__watermark {
  font-family: Georgia, serif;
  font-size: 100rpx;
  font-weight: 400;
  letter-spacing: -4rpx;
  color: rgba(250, 249, 245, 0.5);
  line-height: 1.0;
  position: absolute;
  top: 32rpx;
  left: 32rpx;
  z-index: 0;
  pointer-events: none;
}

.feature-section__content {
  position: relative;
  z-index: 1;
}

/* 圆形头像 + 卫星 CTA */
.portrait-container {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 32rpx;
}
.portrait-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.portrait-circle image {
  width: 100%;
  height: 100%;
}
.satellite-btn {
  position: absolute;
  right: -6rpx;
  bottom: -6rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #faf9f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e8e2d9;
}

.portrait-text {
  flex: 1;
}
.portrait-text__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -2rpx;
  margin-bottom: 8rpx;
}
.portrait-text__desc {
  font-size: 26rpx;
  color: #6c6a64;
  line-height: 1.4;
}

/* ===== 色面 3：深色面 ===== */
.dark-section {
  background-color: #181715;
  padding: 64rpx 32rpx 96rpx;
}

.dark-section__headline {
  font-family: Georgia, serif;
  font-size: 48rpx;
  font-weight: 400;
  color: #faf9f5;
  letter-spacing: -2rpx;
  line-height: 1.2;
  margin-bottom: 48rpx;
}

.dark-section__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 48rpx 32rpx;
}
.dark-section__column {
  flex: 1;
  min-width: 200rpx;
}
.dark-section__column-title {
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: rgba(250, 249, 245, 0.4);
  margin-bottom: 24rpx;
}
.dark-section__link {
  display: block;
  font-size: 24rpx;
  color: rgba(250, 249, 245, 0.7);
  margin-bottom: 16rpx;
}
```

#### 药丸按钮系统（Mastercard 特色）

```css
/* 药丸按钮 - 大号 */
.btn-pill-lg {
  background-color: #cc785c;
  color: #faf9f5;
  border: 2rpx solid #cc785c;
  border-radius: 9999rpx;
  padding: 20rpx 56rpx;
  font-size: 30rpx;
  font-weight: 400;
  text-align: center;
  display: inline-block;
}
.btn-pill-lg:active {
  background-color: #a9583e;
  border-color: #a9583e;
}

/* 药丸按钮 - 小号描边 */
.btn-pill-sm {
  background-color: transparent;
  color: #141413;
  border: 2rpx solid #141413;
  border-radius: 9999rpx;
  padding: 12rpx 32rpx;
  font-size: 24rpx;
  font-weight: 400;
  text-align: center;
  display: inline-block;
}
.btn-pill-sm:active {
  background-color: rgba(20, 20, 19, 0.04);
}

/* 轮播指示器 */
.carousel-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  margin-top: 32rpx;
}
.indicator-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: rgba(20, 20, 19, 0.15);
  transition: all 0.3s ease;
}
.indicator-dot--active {
  width: 28rpx;
  border-radius: 9999rpx;
  background-color: #cc785c;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 原因 |
|------|------|
| **首页英雄区** | Mastercard 的三色面层次 + eyebrow 标签 + 大标题适合首页品牌展示 |
| **功能介绍/About 页** | 宽松叙事留白 + 圆形头像 + 幽灵水印适合讲故事 |
| **学习模块选择页** | 圆形头像卡片 + 卫星 CTA 适合展示不同学习模块 |
| **深色页脚/关于区** | Mastercard 的深色页脚风格完美适配项目 `#181715` 区域 |
| **成就/徽章展示页** | 圆形裁切 + 松散排列适合展示成就图标 |
| **轮播/推荐位** | 药丸指示器 + 宽松卡片间距 |

### 4.2 不适合页面

| 页面 | 原因 |
|------|------|
| **刷题/答题页** | 需要紧凑布局和高信息密度，Mastercard 的大留白浪费空间 |
| **代码编辑/输入页** | 功能导向，不需要叙事式设计 |
| **列表/表格页** | 数据密集，Mastercard 的宽松风格降低信息效率 |
| **设置/配置页** | 表单密集，圆形头像和水印标题无用武之地 |

### 4.3 混搭建议

| 组合 | 做法 |
|------|------|
| **Mastercard 三色面 + 项目卡片** | 首页用三色面结构，每个色面内的卡片用项目 `#efe9de` 标准卡片 |
| **Mastercard eyebrow 标签 + Lovable 药丸筛选** | 章节标题用 Mastercard 式圆点标签，列表筛选用 Lovable 药丸形 |
| **Mastercard 圆形头像 + 项目珊瑚 CTA** | 头像区用圆形裁切，操作按钮用项目珊瑚色药丸形 |
| **Mastercard 深色页脚 + 项目暖奶油画布** | 页面主体用暖奶油，底部深色区用 Mastercard 页脚风格 |
| **Mastercard 幽灵水印 + Georgia 标题** | 水印用 Georgia 衬线 + 画布色透明度，正文标题用正常 Georgia |

---

## 5. 实施检查清单

### 色彩
- [ ] 画布背景使用 `#faf9f5`，不使用纯白
- [ ] 提亮面使用 `#efe9de`，与画布形成层次
- [ ] 深色面使用 `#181715`，文字使用 `#faf9f5`
- [ ] 主文字使用 `#141413`，与 Mastercard 原值一致
- [ ] CTA 使用 `#cc785c` 珊瑚色（非 Mastercard 的墨黑）
- [ ] eyebrow 圆点使用 `#cc785c`（非 Mastercard 的信号橙）
- [ ] 不引入 `#CF4500` 信号橙或 `#3860BE` 链接蓝

### 字体
- [ ] 标题使用 Georgia 衬线体，400 weight
- [ ] 正文使用 -apple-system / system-ui，400 weight
- [ ] 不使用 450 字重（小程序不支持），用 400 替代
- [ ] 大标题字间距使用 -4rpx（对应 Mastercard 的 -2%）
- [ ] eyebrow 标签使用 22rpx / 700 / 大写 / +1rpx
- [ ] 字号全部使用 rpx 单位

### 组件
- [ ] 主按钮使用药丸形 9999rpx 圆角
- [ ] eyebrow 标签使用 `::before` 伪元素 + 圆点
- [ ] 圆形头像使用 `border-radius: 50%` + `overflow: hidden`
- [ ] 卫星 CTA 使用绝对定位 + 圆形白底
- [ ] 幽灵水印使用画布色低透明度
- [ ] 轮播指示器使用圆形 dot，活跃态拉长为胶囊
- [ ] 无 box-shadow，使用边框或色块对比表达深度

### 布局
- [ ] 三色面结构：画布 → 提亮 → 深色
- [ ] 区间大间距使用 64rpx–96rpx（Mastercard 叙事式留白）
- [ ] 不对称布局：头像偏左/偏右，文字在另一侧
- [ ] 幽灵水印放在区块左上角，z-index 低于内容
- [ ] 页脚深色面使用四栏 flex 布局

### 小程序兼容
- [ ] 不使用 CSS Grid（用 flex 替代）
- [ ] 不使用 hover 伪类
- [ ] 不使用 box-shadow 复杂阴影
- [ ] 圆形头像注意 image 组件的 `mode` 属性（建议 `aspectFill`）
- [ ] 卫星 CTA 的负定位需在真机测试兼容性
- [ ] 幽灵水印的 `pointer-events: none` 在小程序中可能不生效，需测试
- [ ] 所有尺寸使用 rpx，不使用 px/rem

---

## 6. 参考文件

| 文件 | 说明 |
|------|------|
| `.claude/skills/mastercard-design.md` | Mastercard 原始设计系统文档 |
| `PROJECT_HANDOFF.md` §25 | 项目设计风格定义（暖奶油画布） |
| `.claude/skills/claude-design.md` | Claude Design 暖奶油画布风格参考 |
| `pages/index/index.wxss` | 首页现有样式（实现参考） |
| `app.wxss` | 全局样式变量 |
