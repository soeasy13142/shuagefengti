# Mintlify 设计方案 → 刷个冯题 实施方法论

> - **参考来源**: `.claude/skills/mintlify-design.md`
> - **适用项目**: 刷个冯题（微信小程序原生 · WXML + WXSS + JS）
> - **生成时间**: 2026-06-15
> - **基础风格**: Claude Design 暖奶油画布（#faf9f5 / #efe9de / #cc785c）

---

## 1. 原方案核心提取

### 1.1 设计哲学

Mintlify 的设计定位是 **"开发者工具 + 营销级视觉"** 的双模式系统：

- 营销面：大气的天空渐变 Hero Band（天蓝→奶油色），配合云彩插画，营造电影级首屏
- 文档面：密集的三栏文档布局（侧边栏 / 正文 / 目录），14px 正文配 1.50 行高，面向长文阅读
- 品牌签名：Mintlify 绿（#00d4a4）仅用于关键 CTA 和激活态，用得少但用得准

**核心原则：**
- 极度克制的品牌色使用 —— 绿色只在"该出现"的时刻出现
- 黑色药丸按钮（pill button）是营销面的主导 CTA
- 渐变 Hero 只用于首页和 Startup 两个页面，内部页面保持平坦密集
- Inter（UI 正文）+ Geist Mono（代码）的双字体配对 = 开发者信任信号

### 1.2 视觉 DNA

| 特征 | 描述 |
|---|---|
| 色调倾向 | 冷调白底 + 极少量薄荷绿点缀 |
| 对比度 | 高对比 —— 黑底白字 Hero + 白底黑字文档 |
| 圆角策略 | 药丸按钮用 full（9999px），卡片统一 12px（lg），输入框 8px（md） |
| 阴影策略 | 以边框为主，阴影极少使用，仅产品预览图有深层扩散阴影 |
| 间距节奏 | 营销页面大气（96-120px 段间距），文档页面紧凑（32px 段间距） |
| 装饰手法 | 渐变 Hero Band 作为唯一的"大气"手段，其余全靠色块和边框 |

### 1.3 色彩策略

**品牌 & 强调色：**
| 原方案色 | 色值 | 用途 |
|---|---|---|
| Mintlify Mint | #00d4a4 | 签名绿 —— Hero CTA、定价卡边框、激活指示器 |
| Deep Mint | #00b48a | 按压/激活态 |
| Soft Mint | #7cebcb | 成功态淡底 |
| Brand Tag | #3772cf | 文档标签蓝色 |
| Testimonial Orange | #f55a3c | 情感卡片（打破色彩节奏） |

**表面色：**
| 原方案色 | 色值 | 用途 |
|---|---|---|
| Canvas White | #ffffff | 页面 & 卡片底色 |
| Surface | #f7f7f7 | 次级区域背景 |
| Surface Code | #1c1c1e | 代码块深色背景 |
| Hairline | #e5e5e5 | 1px 边框 & 分割线 |

**文字色：**
| 原方案色 | 色值 | 用途 |
|---|---|---|
| Ink | #0a0a0a | 标题 & 主要文字 |
| Charcoal | #1c1c1e | 正文 |
| Slate | #3a3a3c | 次要文字 |
| Steel | #5a5a5c | 三级文字、侧边栏、页脚 |
| Stone | #888888 | 标注、弱化文字 |
| Muted | #a8a8aa | 禁用态 |

### 1.4 字体策略

| 原方案 | 用途 | 特点 |
|---|---|---|
| Inter | 全部 UI 文字 | 现代无衬线，UI 可读性最优 |
| Geist Mono | 代码块、类型标注 | 等宽字体，开发者信号 |

**层级要点：**
- Hero Display：72px / 600weight / 1.05 行高 / -2px 字距 —— 杂志级展示
- 负字距随尺寸递减：72px 用 -2px，36px 用 -0.5px，16px 以下为 0
- 大写字母微标签（11px / 600weight / +0.5px 字距）用于侧边栏分组标题

### 1.5 布局与组件模式

**间距系统：** 基础单位 4px，主增量 8px
- 营销页面段间距：96px（section-lg）
- 文档页面段间距：32px（xxl）
- 卡片内边距：标准 24px（xl），定价卡 32px（xxl）

**按钮模式：**
- 所有按钮 pill 形（rounded.full = 9999px）
- 主要 CTA：黑底白字药丸
- 品牌强调：薄荷绿药丸
- 次要：透明底 + 边框药丸
- 幽灵：透明底 + 8px 圆角矩形

**卡片模式：**
- 标准卡：白底 + 12px 圆角 + 1px hairline 边框
- 功能卡：f7f7f7 底 + 12px 圆角 + 无边框
- 定价特色卡：白底 + 2px 薄荷绿边框 + 品牌色阴影

---

## 2. 适配分析

### 2.1 可直接迁移

| 元素 | 原方案 | 迁移说明 |
|---|---|---|
| 间距节奏 | 4px 基础单位 | rpx 等比换算（1rpx = 0.5px @ 750 设计稿），直接可用 |
| 圆角策略 | 卡片 12px / 按钮 full / 输入框 8px | rpx 换算后直接使用：卡片 24rpx / 按钮 999rpx / 输入框 16rpx |
| 分割线策略 | 1px hairline 边框替代阴影 | 完美契合暖奶油画布的"零阴影"原则 |
| 卡片结构 | 白底 + 边框 + 圆角 | 映射为暖奶油卡片底（#efe9de）即可 |
| 按钮层级 | primary > accent > secondary > ghost | 层级关系可直接复用 |
| 信息密度分级 | 营销页大气 / 内容页紧凑 | 适合小程序：首页大气，子页面紧凑 |

### 2.2 需要改造

| 元素 | 原方案 | 改造方向 |
|---|---|---|
| 渐变 Hero Band | 天空蓝→奶油色大气渐变 | 改为暖色调渐变：#faf9f5→#efe9de，或保留纯色 #faf9f5 画布底 |
| 品牌签名色 | 薄荷绿 #00d4a4 | 替换为珊瑚色 #cc785c（项目 CTA 色） |
| 按钮主色 | 黑底白字 pill | 替换为 #cc785c 珊瑚底白字 pill |
| 输入框激活色 | 薄荷绿边框 | 替换为 #cc785c 珊瑚边框 |
| 标签蓝 #3772cf | 文档标签 | 替换为项目内已有的标签色或暖色调标签 |
| 测试imonial 橙 #f55a3c | 情感破色卡 | 保留或微调为更暖的 #cc785c 系列 |
| 代码块深色 | #1c1c1e 纯黑底 | 改为 #181715（项目深色面） |
| Inter 字体 | 全局 UI 字体 | 标题改为 Georgia 衬线（400weight / -3rpx 字距），正文用系统默认无衬线 |

### 2.3 不可迁移

| 元素 | 原因 |
|---|---|
| Geist Mono 等宽字体 | 微信小程序不支持自定义字体加载（除企业资质的 font-face），代码展示用系统等宽字体 |
| 72px Hero Display | 小程序屏幕宽度 750rpx，72px（约 144rpx）过大，需缩至 72-80rpx |
| 三栏文档布局 | 小程序无桌面端，单栏布局为主 |
| atmospheric 渐变插画 | 小程序性能和包体积限制，不引入复杂渐变插画 |
| 阴影层级（4级） | 暖奶油画布原则"零阴影"，所有深度靠色块对比 |
| 大写微标签 +0.5px 字距 | 微信小程序 letter-spacing 支持不稳定，需 rpx 单位测试 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Mintlify 原色 | 刷个冯题映射 | 用途 |
|---|---|---|
| #0a0a0a（Ink 标题） | #141413（暖墨） | 主标题、主要文字 |
| #1c1c1e（Charcoal 正文） | #141413（暖墨） | 正文（合并为单色） |
| #3a3a3c（Slate 次要） | #6c6a64（次要文字） | 副标题、描述文字 |
| #5a5a5c（Steel 三级） | #6c6a64（次要文字） | 标签、辅助信息 |
| #888888（Stone 标注） | #9e9c96（新增弱化色） | 禁用态、极弱文字 |
| #ffffff（Canvas 白底） | #faf9f5（暖奶油画布） | 页面背景 |
| #f7f7f7（Surface 次级底） | #efe9de（奶油卡片） | 卡片背景 |
| #e5e5e5（Hairline 边框） | #ddd8ce（新增暖边框） | 分割线、边框 |
| #00d4a4（品牌绿 CTA） | #cc785c（珊瑚色） | 主要 CTA、激活态 |
| #00b48a（Deep Mint 按压） | #a9583e（珊瑚深色） | 按钮按压态 |
| #7cebcb（Soft Mint 淡底） | #f5e6de（新增淡珊瑚底） | 成功/提示淡底 |
| #1c1c1e（Surface Code） | #181715（深海军蓝） | 代码块、深色面 |
| #ffffff（On Dark 白字） | #faf9f5（暖奶油字） | 深色面上的文字 |
| #f55a3c（Testimonial 橙） | #cc785c（珊瑚色） | 情感破色卡片（复用 CTA 色） |

### 3.2 字体映射（rpx）

| Mintlify 层级 | 原值（px） | 刷个冯题映射 | 说明 |
|---|---|---|---|
| hero-display | 72px / Inter 600 | **48rpx / Georgia 400 / -3rpx** | 小程序首页主标题，衬线风格 |
| display-lg | 56px / Inter 600 | **40rpx / Georgia 400 / -2rpx** | 大节标题 |
| heading-1 | 48px / Inter 600 | **36rpx / Georgia 400 / -2rpx** | 页面级标题 |
| heading-2 | 36px / Inter 600 | **32rpx / Georgia 400 / -2rpx** | 段落标题 |
| heading-3 | 28px / Inter 600 | **28rpx / Georgia 400 / -1rpx** | 卡片标题 |
| heading-4 | 22px / Inter 600 | **24rpx / Georgia 400 / -1rpx** | 小节标题 |
| heading-5 | 18px / Inter 600 | **20rpx / Georgia 400** | 微标题 |
| subtitle | 18px / Inter 400 | **28rpx / 系统默认 400** | 副标题 |
| body-md | 16px / Inter 400 | **28rpx / 系统默认 400 / 1.6 行高** | 主要正文 |
| body-sm | 14px / Inter 400 | **24rpx / 系统默认 400 / 1.5 行高** | 次要正文 |
| caption | 13px / Inter 400 | **22rpx / 系统默认 400** | 标注文字 |
| micro | 12px / Inter 500 | **20rpx / 系统默认 500** | 微型标签 |
| button-md | 14px / Inter 500 | **28rpx / 系统默认 500** | 按钮文字 |
| code-md | 14px / Geist Mono | **24rpx / SF Mono / Menlo（系统等宽）** | 代码块 |

**关键差异：** Mintlify 用 Inter 无衬线统一全局，刷个冯题用 Georgia 衬线标题 + 系统默认无衬线正文的混搭，更偏人文气质。

### 3.3 组件设计规范

**按钮 — 药丸形（pill）**

| 组件 | Mintlify | 刷个冯题 | WXSS |
|---|---|---|---|
| 主 CTA | 黑底白字 pill | **#cc785c 白字 pill** | `background:#cc785c; color:#faf9f5; border-radius:999rpx; padding:20rpx 40rpx;` |
| 主 CTA 按压 | #1c1c1e | **#a9583e** | `background:#a9583e;` |
| 次要按钮 | 透明 + hairline 边框 pill | **透明 + #ddd8ce 边框 pill** | `background:transparent; color:#141413; border:1rpx solid #ddd8ce; border-radius:999rpx;` |
| 幽灵按钮 | 透明 + 8px 圆角 | **透明 + 16rpx 圆角** | `background:transparent; color:#141413; border-radius:16rpx;` |
| 深色面按钮 | 白底黑字 pill | **#faf9f5 底 #141413 字 pill** | `background:#faf9f5; color:#141413; border-radius:999rpx;` |

**卡片**

| 组件 | Mintlify | 刷个冯题 | WXSS |
|---|---|---|---|
| 标准卡 | 白底 / 12px 圆角 / hairline 边框 | **#efe9de 底 / 24rpx 圆角 / 无边框** | `background:#efe9de; border-radius:24rpx; padding:48rpx;` |
| 功能卡 | #f7f7f7 底 / 12px 圆角 | **#efe9de 底 / 24rpx 圆角** | 同上 |
| 特色卡（带强调） | 白底 / 2px 绿边框 / 绿阴影 | **#efe9de 底 / 3rpx #cc785c 边框 / 零阴影** | `background:#efe9de; border:3rpx solid #cc785c; border-radius:24rpx;` |

**输入框**

| 组件 | Mintlify | 刷个冯题 | WXSS |
|---|---|---|---|
| 默认 | 白底 / hairline 边框 / 8px 圆角 | **#faf9f5 底 / #ddd8ce 边框 / 16rpx 圆角** | `background:#faf9f5; border:1rpx solid #ddd8ce; border-radius:16rpx; padding:24rpx 32rpx;` |
| 聚焦 | 2px 薄荷绿边框 | **3rpx #cc785c 边框** | `border:3rpx solid #cc785c;` |

**标签 / Badge**

| 组件 | Mintlify | 刷个冯题 | WXSS |
|---|---|---|---|
| 分类标签 | #3772cf 蓝底标签 | **#cc785c 珊瑚底标签** | `background:#cc785c; color:#faf9f5; border-radius:12rpx; padding:4rpx 16rpx; font-size:22rpx;` |
| 状态标签 | #00d4a4 绿底标签 | **#cc785c 珊瑚底标签** | 同上（暖奶油画布无独立绿） |
| 淡底标签 | rgba(蓝, 0.15) 底蓝字 | **#f5e6de 底 #cc785c 字** | `background:#f5e6de; color:#cc785c; border-radius:999rpx;` |

### 3.4 页面布局模板

**首页（营销级大气布局）**

```
┌─────────────────────────────┐
│  导航栏 64rpx               │  ← #faf9f5 底
├─────────────────────────────┤
│                             │
│  Hero 区域                  │  ← #faf9f5 底，上下 120rpx 内边距
│  主标题 Georgia 48rpx       │
│  副标题 28rpx               │
│  [珊瑚 CTA 药丸按钮]        │
│                             │
├─────────────────────────────┤
│  功能卡片区                  │  ← #efe9de 底卡片，24rpx 圆角
│  3 列 / 2 列网格             │
│  卡片间距 24rpx             │
├─────────────────────────────┤
│  学习状态条                  │  ← #181715 深色面，#faf9f5 字
├─────────────────────────────┤
│  底部导航                    │
└─────────────────────────────┘
```

**子页面（紧凑文档级布局）**

```
┌─────────────────────────────┐
│  返回 + 页面标题             │  ← #faf9f5 底
├─────────────────────────────┤
│  内容区域                    │  ← 上下 32rpx 段间距
│  正文 28rpx / 1.6 行高       │
│  小节标题 Georgia 32rpx      │
│  代码块 #181715 底           │
│  分割线 #ddd8ce 1rpx         │
├─────────────────────────────┤
│  底部操作区                  │
└─────────────────────────────┘
```

**列表页（卡片网格布局）**

```
┌─────────────────────────────┐
│  搜索 pill（#faf9f5 底）     │
├─────────────────────────────┤
│  分类标签横向滚动             │  ← 药丸标签
├─────────────────────────────┤
│  ┌──────┐  ┌──────┐         │
│  │ 卡片1 │  │ 卡片2 │         │  ← #efe9de 底，24rpx 圆角
│  └──────┘  └──────┘         │
│  ┌──────┐  ┌──────┐         │
│  │ 卡片3 │  │ 卡片4 │         │
│  └──────┘  └──────┘         │
└─────────────────────────────┘
```

### 3.5 WXSS 示例

**全局色板变量（可在 app.wxss 中定义 class）**

```css
/* === 刷个冯题 × Mintlify 适配色板 === */

/* 画布 & 表面 */
.canvas        { background: #faf9f5; }
.surface       { background: #efe9de; }
.surface-code  { background: #181715; }

/* 文字 */
.ink           { color: #141413; }
.secondary     { color: #6c6a64; }
.muted         { color: #9e9c96; }
.on-dark       { color: #faf9f5; }

/* 边框 */
.hairline      { border: 1rpx solid #ddd8ce; }

/* 品牌 CTA */
.cta           { background: #cc785c; color: #faf9f5; }
.cta-pressed   { background: #a9583e; color: #faf9f5; }
.cta-soft      { background: #f5e6de; color: #cc785c; }
```

**药丸按钮组件**

```css
/* 主 CTA 药丸 */
.btn-primary {
  display: inline-block;
  background: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.3;
  padding: 20rpx 48rpx;
  border-radius: 999rpx;
  text-align: center;
}
.btn-primary:active {
  background: #a9583e;
}

/* 次要药丸 */
.btn-secondary {
  display: inline-block;
  background: transparent;
  color: #141413;
  font-size: 28rpx;
  font-weight: 500;
  padding: 20rpx 48rpx;
  border: 1rpx solid #ddd8ce;
  border-radius: 999rpx;
}
```

**标准卡片组件**

```css
.card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 48rpx;
  margin-bottom: 24rpx;
}

/* 特色强调卡 */
.card-featured {
  background: #efe9de;
  border: 3rpx solid #cc785c;
  border-radius: 24rpx;
  padding: 48rpx;
}
```

**输入框组件**

```css
.input {
  background: #faf9f5;
  border: 1rpx solid #ddd8ce;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: #141413;
}
.input-focus {
  border: 3rpx solid #cc785c;
}
```

**深色面组件（学习状态条等）**

```css
.dark-surface {
  background: #181715;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 48rpx;
}
.dark-surface .secondary {
  color: #9e9c96;
}
```

**标签 Badge**

```css
.tag {
  display: inline-block;
  background: #cc785c;
  color: #faf9f5;
  font-size: 22rpx;
  font-weight: 600;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}
.tag-soft {
  background: #f5e6de;
  color: #cc785c;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 适配理由 |
|---|---|
| **首页** | Mintlify 的 Hero + 功能卡 + CTA 结构与项目首页 5 区布局高度吻合 |
| **题库列表页** | 药丸分类标签 + 卡片网格 = 标准 Mintlify 列表模式 |
| **搜索页** | 搜索 pill + 结果列表 = Mintlify 文档搜索模式 |
| **设置/个人中心页** | 表单输入框 + 设置项列表 = Mintlify 文档表单模式 |
| **代码题展示页** | 深色代码块 + 浅色说明文字 = Mintlify 文档代码展示 |

### 4.2 不适合页面

| 页面 | 不适配原因 |
|---|---|
| **纯刷题页** | 需要沉浸式阅读体验，Mintlify 的密集文档风格过于"工具感" |
| **排行榜页** | 需要强视觉冲击力，Mintlify 的克制风格不够"燃" |
| **社交/讨论页** | 需要更活泼的视觉语言，Mintlify 偏严肃 |

### 4.3 混搭建议

| 混搭组合 | 方案 |
|---|---|
| Mintlify 结构 + 暖奶油画布色调 | 保留 Mintlify 的药丸按钮、卡片层级、间距节奏，全部替换为暖色调色板 |
| Mintlify 深色代码块 + 暖奶油正文 | 代码展示区域用 #181715 深色面，正文区域保持 #faf9f5 画布底 |
| Mintlify 标签系统 + 珊瑚色品牌 | 药丸标签的形状和尺寸保留，颜色从蓝/绿替换为 #cc785c 珊瑚系 |

---

## 5. 实施检查清单

### 色彩
- [ ] 所有薄荷绿（#00d4a4 / #00b48a / #7cebcb）已替换为珊瑚色系（#cc785c / #a9583e / #f5e6de）
- [ ] 所有白底（#ffffff）已替换为暖奶油底（#faf9f5）
- [ ] 所有次级灰底（#f7f7f7）已替换为奶油卡片底（#efe9de）
- [ ] 所有 hairline 边框（#e5e5e5）已替换为暖边框（#ddd8ce）
- [ ] 深色面使用 #181715（非 #1c1c1e）
- [ ] 文字色使用 #141413 暖墨（非 #0a0a0a 纯黑）

### 字体
- [ ] 标题全部使用 Georgia 衬线 / 400weight / 负字距（-1rpx ~ -3rpx）
- [ ] 正文使用系统默认无衬线 / 28rpx / 1.6 行高
- [ ] 按钮文字 28rpx / 500weight
- [ ] 代码块使用系统等宽字体（SF Mono / Menlo）
- [ ] 未引入自定义字体文件（小程序限制）

### 组件
- [ ] 所有按钮使用 pill 形（border-radius: 999rpx）
- [ ] 卡片使用 24rpx 圆角（非 12px/24px 混用）
- [ ] 零阴影 —— 所有深度靠色块对比和边框
- [ ] 输入框激活态使用 3rpx #cc785c 边框
- [ ] 分割线使用 1rpx #ddd8ce

### 布局
- [ ] 所有尺寸使用 rpx 单位（非 px / rem）
- [ ] 首页段间距 96rpx，子页面段间距 32rpx
- [ ] 卡片内边距 48rpx（标准），32rpx（紧凑）
- [ ] 卡片间距 24rpx
- [ ] 最小触摸区域 88rpx（44px @ 2x）

### 微信小程序兼容
- [ ] 未使用 CSS 自定义属性（var()）—— 部分旧版基础库不支持
- [ ] 未使用 backdrop-filter / clip-path 等高级 CSS
- [ ] 未引入外部字体文件
- [ ] 渐变使用 linear-gradient 语法（微信支持）

---

## 6. 参考文件

| 文件 | 说明 |
|---|---|
| `.claude/skills/mintlify-design.md` | 原始 Mintlify 设计分析文档 |
| `PROJECT_HANDOFF.md` §25 | Claude Design 暖奶油画布风格规范 |
| `CLAUDE.md` 设计风格约束 | 项目全局设计 token 定义 |
| `pages/index/index.wxss` | 首页实际实现（验证映射效果） |
| `app.wxss` | 全局样式（注入色板变量） |
