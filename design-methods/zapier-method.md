# Zapier 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/zapier-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Zapier 的设计语言定位为"自信成熟"（confidently-mature）。核心是通过暖色调中性色传达温度，而非冷酷科技感。品牌声音是"温暖自信"（confident-warm rather than cool-tech）。单一饱和橙色 CTA 是转化签名，暖奶油画布是品牌温度信号。

### 1.2 视觉 DNA

- **暖色调优先**：所有中性色都携带暖意，没有冷灰
- **单一强调色**：只用一个饱和橙（`#ff4f00`）作为 CTA，不引入第二色彩强调
- **咖啡墨取代纯黑**：`#201515` 替代 `#000000`，温暖贯穿文字
- **双字体体系**：展示字体（Degular Display）用于英雄级标题，工作字体（Inter）用于其余所有
- **中间圆角**：12px 是品牌签名，不走极端圆角也不走方角
- **零阴影深度**：通过表面色差（canvas vs canvas-soft）表达层次，不用 box-shadow

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|---|---|---|
| 主强调（CTA） | `#ff4f00` | 饱和橙，品牌转化签名 |
| 画布 | `#fffefb` | 暖白，不是纯白 |
| 画布柔和 | `#f8f4f0` | 奶油色调卡片/嵌入区域 |
| 墨 | `#201515` | 深咖啡，标题和主文字 |
| 墨柔 | `#2f2a26` | 近黑带棕暖 |
| 墨中 | `#36342e` | 中等强调文字 |
| 正文 | `#605d52` | 默认正文色 |
| 正文中 | `#939084` | 次要正文/元数据 |
| 静音 | `#c5c0b1` | 最低优先级文字 |

关键特征：整个中性色阶梯都携带暖意，没有任何冷灰。

### 1.4 字体策略

双字体分层：
1. **Degular Display**（500 weight）— 英雄标题和 eyebrow，品牌字体签名
2. **Inter**（400/500/600/700）— 子展示、正文、按钮、链接、眉毛

字重阶梯：
- 英雄标题：56px / 500
- 子英雄：48px / 500
- 区域标题：32px / 500 / +1px letter-spacing
- 卡片标题：24px / 600 / -0.6px tracking
- 正文：18px / 400 / 27px line-height
- 小正文：16px / 400
- 说明文字：14px / 400
- 按钮：18px / 600（中）/ 14.4px / 700（小）

### 1.5 布局与组件模式

**间距系统**：4px 基础单位，阶梯从 2px 到 64px

**圆角阶梯**：
- 0px：全出血 band
- 6px：内联 pill、表单输入
- 12px：按钮 + 卡片（品牌签名）
- 9999px：状态 pill、徽章、圆形图标

**卡片模式**：统一 12px 圆角 + 24px 内边距，用 canvas-soft 奶油填充对比 canvas 背景表达层次

**按钮层级**：
- Primary：橙底白字
- Secondary：咖啡墨底白字
- Tertiary：画布底 + 墨边框
- Text：纯文字

**深度系统**：零阴影，靠 surface 颜色对比（canvas-soft vs canvas）和 1px 墨色边框表达层次

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 理由 |
|---|---|
| 暖色调中性色阶梯 | 与刷个冯题的暖奶油画布风格天然契合，温度一致 |
| 零阴影深度系统 | 与 Claude Design 的零阴影约束完全一致 |
| 12px 圆角作为默认 | 与暖奶油画布的 24rpx（约 12px）卡片圆角一致 |
| 单一 CTA 强调色策略 | 简洁有力，适合小程序的小屏幕 |
| canvas vs canvas-soft 表面对比 | 与 #faf9f5 / #efe9de 的画布-卡片对比逻辑一致 |
| 按钮层级（Primary / Secondary / Tertiary） | 通用性好，直接适用 |
| 4px 基础间距单位 | 小程序 rpx 体系下可映射为 8rpx 基础单位 |

### 2.2 需要改造的设计决策

| 原决策 | 改造方式 |
|---|---|
| Degular Display 展示字体 | 替换为 Georgia 衬线（项目当前标题字体），保持"品牌有自己的展示字体"的角色分工 |
| Inter 正文字体 | 替换为系统默认无衬线字体（-apple-system, PingFang SC），微信小程序不支持自定义字体加载 |
| 56px 英雄标题 | 缩小至 48rpx~56rpx，小程序屏幕小，56px 过大 |
| 48px 子英雄 | 缩小至 36rpx~40rpx |
| 24px 卡片标题 | 映射为 32rpx |
| 18px 正文 | 映射为 28rpx~30rpx |
| 16px 小正文 | 映射为 24rpx~26rpx |
| 14px 说明文字 | 映射为 22rpx~24rpx |
| `#ff4f00` 橙色 CTA | 替换为项目珊瑚色 `#cc785c`，保持暖调但与项目品牌一致 |
| `#fffefb` 暖白画布 | 替换为项目暖奶油 `#faf9f5` |
| `#f8f4f0` 柔和卡片 | 替换为项目奶油卡片 `#efe9de` |
| `#201515` 咖啡墨 | 替换为项目暖墨 `#141413` |
| 12px 圆角 | 映射为 24rpx（项目标准） |
| 24px 卡片内边距 | 映射为 32rpx~40rpx |
| 64px section padding | 缩小至 48rpx~64rpx，适配小屏幕 |
| 深色反转卡片（ink 底白字） | 用项目深色表面 `#181715` + `#faf9f5` 文字 |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|---|---|
| Degular Display 专有字体 | 专有字体不可用，且小程序无法加载自定义字体文件 |
| Inter 可变字重 | 微信小程序系统字体不支持精确 weight 控制（仅 bold/normal） |
| 1280px 宽容器布局 | 小程序全屏宽度，无容器概念 |
| 桌面端分栏布局（hero split、3/4-up grid） | 小程序是移动端单列 |
| 响应式断点（768/1024） | 小程序不需要桌面断点 |
| SVG 插画系统 | 小程序不支持内联 SVG，需用图片或 Canvas |
| Pricing card 组件 | 学习工具箱无定价场景 |
| Footer 暗色底栏 | 小程序使用原生 tabBar，无需自定义 footer |
| Modal / Toast 自定义样式 | 小程序有原生 modal/toast API |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Zapier 原色 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#ff4f00`（Zapier Orange） | `#cc785c`（珊瑚 CTA） | 主按钮、强调元素 |
| `#fffefb`（Canvas） | `#faf9f5`（暖奶油画布） | 页面背景 |
| `#f8f4f0`（Canvas Soft） | `#efe9de`（奶油卡片） | 卡片、嵌入区域 |
| `#201515`（Ink） | `#141413`（暖墨） | 标题、主文字 |
| `#2f2a26`（Ink Soft） | `#141413`（暖墨） | 合并到暖墨，减少色阶 |
| `#36342e`（Ink Mid） | `#2c2b28`（暖墨次级） | 中等强调文字 |
| `#605d52`（Body） | `#6c6a64`（次要文字） | 正文 |
| `#939084`（Body Mid） | `#9e9b94`（更浅次要） | 元数据、时间戳 |
| `#c5c0b1`（Mute） | `#c5c0b1`（保持） | 最低优先级文字 |
| 深色反转（ink 底） | `#181715`（深海军蓝）底 + `#faf9f5` 文字 | 深色卡片、强调区域 |

### 3.2 字体映射（用 rpx）

| Zapier Token | 刷个冯题实现 | 说明 |
|---|---|---|
| `display-xl`（56px/500） | Georgia, 48rpx, 400, line-height 52rpx, letter-spacing -3rpx | 英雄标题，缩小适配小屏 |
| `display-lg`（48px/500） | Georgia, 40rpx, 400, line-height 44rpx, letter-spacing -2rpx | 区域大标题 |
| `display-md`（32px/500） | Georgia, 36rpx, 400, line-height 40rpx, letter-spacing -2rpx | 区域标题 |
| `display-sub-sm`（24px/600） | -apple-system, 32rpx, bold, line-height 40rpx | 卡片标题 |
| `body-lg`（20px/400） | -apple-system, 30rpx, normal, line-height 44rpx | 引导段落 |
| `body-md`（18px/400） | -apple-system, 28rpx, normal, line-height 40rpx | 默认正文 |
| `body-md-strong`（18px/600） | -apple-system, 28rpx, bold, line-height 40rpx | 加粗正文 |
| `body-sm`（16px/400） | -apple-system, 26rpx, normal, line-height 36rpx | 次要正文 |
| `body-sm-strong`（16px/600） | -apple-system, 26rpx, bold, line-height 36rpx | 加粗次要 |
| `caption`（14px/400） | -apple-system, 24rpx, normal, line-height 32rpx | 说明文字 |
| `eyebrow-uppercase`（14px/500） | -apple-system, 22rpx, bold, line-height 22rpx, letter-spacing 2rpx, text-transform uppercase | 标签/分类 |
| `button-md`（18px/600） | -apple-system, 28rpx, bold, line-height 28rpx | 主按钮文字 |
| `button-sm`（14.4px/700） | -apple-system, 24rpx, bold, line-height 24rpx | 小按钮文字 |

### 3.3 组件设计规范

#### 按钮

**Primary Button**
```css
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: bold;
  line-height: 28rpx;
  padding: 24rpx 48rpx;
  border-radius: 24rpx;
  border: none;
  text-align: center;
}
.btn-primary:active {
  background-color: #a9583e;
}
```

**Secondary Button**
```css
.btn-secondary {
  background-color: #141413;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: bold;
  line-height: 28rpx;
  padding: 24rpx 48rpx;
  border-radius: 24rpx;
  border: none;
  text-align: center;
}
```

**Tertiary Button**
```css
.btn-tertiary {
  background-color: #faf9f5;
  color: #141413;
  font-size: 28rpx;
  font-weight: bold;
  line-height: 28rpx;
  padding: 24rpx 48rpx;
  border-radius: 24rpx;
  border: 2rpx solid #141413;
  text-align: center;
}
```

**Text Button**
```css
.btn-text {
  background-color: transparent;
  color: #141413;
  font-size: 24rpx;
  font-weight: bold;
  line-height: 24rpx;
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  border: none;
}
```

#### 卡片

**Content Card（默认奶油卡片）**
```css
.card-content {
  background-color: #efe9de;
  color: #141413;
  padding: 40rpx;
  border-radius: 24rpx;
  border: none;
  box-shadow: none;
}
```

**Feature Card Dark（深色反转卡片）**
```css
.card-feature-dark {
  background-color: #181715;
  color: #faf9f5;
  padding: 40rpx;
  border-radius: 24rpx;
  border: none;
  box-shadow: none;
}
```

#### 标签/徽章

**Pill Badge**
```css
.badge-pill {
  background-color: #efe9de;
  color: #141413;
  font-size: 26rpx;
  padding: 8rpx 24rpx;
  border-radius: 9999rpx;
}
```

**Eyebrow Label**
```css
.eyebrow {
  font-size: 22rpx;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  color: #141413;
  line-height: 22rpx;
}
```

#### 输入框

```css
.text-input {
  background-color: #faf9f5;
  color: #141413;
  font-size: 28rpx;
  padding: 24rpx 32rpx;
  border-radius: 12rpx;
  border: 2rpx solid #141413;
}
```

### 3.4 页面布局模板

#### Hero 区域（首页顶部）
```
┌─────────────────────────┐
│  padding: 64rpx 40rpx   │
│  background: #faf9f5    │
│                         │
│  [eyebrow label]        │  ← 22rpx uppercase
│  [英雄标题 Georgia]      │  ← 48rpx
│  [副标题 body-lg]        │  ← 30rpx
│  [Primary CTA 按钮]      │
│                         │
└─────────────────────────┘
```

#### 内容 Band（交替背景）
```
┌─────────────────────────┐
│  padding: 64rpx 40rpx   │
│  background: #efe9de    │  ← 奶油色交替
│                         │
│  [区域标题 Georgia]      │  ← 36rpx
│  [内容区域]              │
│                         │
└─────────────────────────┘

┌─────────────────────────┐
│  padding: 64rpx 40rpx   │
│  background: #faf9f5    │  ← 画布色交替
│                         │
│  [区域标题 Georgia]      │
│  [内容区域]              │
│                         │
└─────────────────────────┘
```

#### 工具卡片网格
```
┌─────────────────────────┐
│  flex-wrap: wrap        │
│  gap: 24rpx             │
│                         │
│  ┌───────┐ ┌───────┐   │
│  │ Card  │ │ Card  │   │  ← 2 列
│  │ #efe9 │ │ #efe9 │   │
│  │ 24rpx │ │ 24rpx │   │
│  └───────┘ └───────┘   │
│                         │
└─────────────────────────┘
```

### 3.5 WXSS 实现示例

#### 页面基础样式
```css
/* 页面容器 — Zapier 暖画布 */
.page-canvas {
  background-color: #faf9f5;
  min-height: 100vh;
  padding: 0 40rpx;
}

/* 内容 Band — 奶油交替 */
.band-cream {
  background-color: #efe9de;
  padding: 64rpx 40rpx;
  margin: 0 -40rpx;
}

/* 内容 Band — 画布 */
.band-light {
  background-color: #faf9f5;
  padding: 64rpx 40rpx;
}

/* 深色 Band */
.band-dark {
  background-color: #181715;
  padding: 64rpx 40rpx;
  margin: 0 -40rpx;
}
.band-dark .band-title {
  color: #faf9f5;
}
.band-dark .band-body {
  color: #efe9de;
}
```

#### 标题层级
```css
/* 英雄标题 */
.heading-hero {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 48rpx;
  font-weight: 400;
  line-height: 52rpx;
  letter-spacing: -3rpx;
  color: #141413;
}

/* 区域标题 */
.heading-section {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 36rpx;
  font-weight: 400;
  line-height: 40rpx;
  letter-spacing: -2rpx;
  color: #141413;
}

/* 卡片标题 */
.heading-card {
  font-size: 32rpx;
  font-weight: bold;
  line-height: 40rpx;
  color: #141413;
}

/* 正文 */
.body-text {
  font-size: 28rpx;
  font-weight: normal;
  line-height: 40rpx;
  color: #6c6a64;
}

/* 说明文字 */
.caption-text {
  font-size: 24rpx;
  font-weight: normal;
  line-height: 32rpx;
  color: #9e9b94;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面 | 适用理由 |
|---|---|
| 首页（index） | Hero band + 工具卡片网格 + 交替 band 布局，与 Zapier 营销页结构高度吻合 |
| 学习驾驶舱 | 统计数据展示 + 深色强调卡片，适合 Zapier 的 surface 对比深度系统 |
| 工具详情/介绍页 | 标签 eyebrow + 标题 + 正文 + CTA 按钮的标准内容结构 |
| 导入预览页 | 表单输入 + 主/次按钮层级 |
| 错题本 | 列表卡片 + pill 标签分类 |

### 4.2 不适合用在哪些页面

| 页面 | 原因 |
|---|---|
| 刷题页面（quiz） | 需要高度专注的答题界面，Zapier 的营销式 band 布局过于分散注意力 |
| 考试模式 | 极简计时界面，不需要品牌表达 |
| 子网计算器 | 纯工具界面，输入-输出模式，Zapier 的内容营销布局不适用 |
| TCP 动画机 | 动画可视化为主，布局需求不同 |

### 4.3 混搭建议

- **Zapier 布局 + 暖奶油画布色板**：使用 Zapier 的 band 交替结构和组件层级，但保持项目现有的 `#faf9f5` / `#efe9de` / `#cc785c` 色板
- **Zapier 按钮层级 + 项目圆角**：采用 Primary/Secondary/Tertiary 三级按钮，但使用 24rpx 圆角而非 12px
- **Zapier 深度系统 + 项目深色表面**：用 `#181715` 替代 `#201515` 做深色卡片，保持零阴影
- **Zapier eyebrow 标签**：直接迁移 uppercase 小标签样式，用于工具分类和状态标记

---

## 5. 实施检查清单

- [ ] 色板替换完成：所有 Zapier 色值已映射到项目色值
- [ ] 字体替换完成：Degular Display → Georgia，Inter → 系统字体
- [ ] rpx 单位转换完成：所有 px 值已转换为 rpx（×2）
- [ ] 按钮组件三级样式就绪：Primary / Secondary / Text
- [ ] 卡片组件两种样式就绪：奶油卡片 / 深色卡片
- [ ] Hero band 模板可用：eyebrow + Georgia 标题 + 正文 + CTA
- [ ] 交替 band 布局可用：cream / light 交替
- [ ] 零阴影约束确认：无 box-shadow 使用
- [ ] 圆角统一为 24rpx：卡片、按钮、输入框
- [ ] Pill 标签组件可用：9999rpx 圆角
- [ ] 输入框样式就绪：12rpx 圆角 + 2rpx 墨色边框
- [ ] 深色区域文字色确认：`#faf9f5` 标题 + `#efe9de` 正文
- [ ] Active/Pressed 状态：Primary 按钮 active 为 `#a9583e`

---

## 6. 参考文件

- 原方案：`.claude/skills/zapier-design.md`
- 项目设计规范：`design-methods/design-spec.md`
- 项目交接文档：`PROJECT_HANDOFF.md`（§25 设计风格）
- Claude Design 技能：`.claude/skills/claude-design.md`
