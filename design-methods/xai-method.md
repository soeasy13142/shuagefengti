# xAI 设计方案 → 刷个冯题 实施方法论

> 参考来源：`.claude/skills/x.ai-design.md`
> 适用项目：刷个冯题 微信小程序（WXML + WXSS + JS，rpx 单位）
> 当前风格基线：Claude Design 暖奶油画布（#faf9f5 画布、#efe9de 卡片、#cc785c 珊瑚 CTA）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

xAI 的设计语言是 **"工程师宇宙感"（engineered-cosmic, unmarketed）**。核心主张：

- **极简画布**：单一近黑画布 `#0a0a0a` 铺满全页，不设渐变 Hero、不放产品截图
- **形状即品牌**：所有交互元素统一 pill 形状（`border-radius: 9999px`），pill 是唯一的形状词汇
- **字重克制**：全局只用 weight 400，靠字号层级 + 负字间距做视觉强调，绝不 bold
- **双字体对比**：Universal Sans（正文/标题）+ GeistMono 大写等距（标签/眉毛），两字体的对比就是品牌声音
- **深度靠边线**：零阴影，靠 1px hairline 边框 + 色阶差表达层级
- **点缀色稀释**：sunset-orange / dusk-purple 等点缀色仅用于插画，不在营销面上大面积使用

### 1.2 视觉 DNA

| 特征 | xAI 原案 | 视觉效果 |
|---|---|---|
| 画布 | `#0a0a0a` 近黑 | 压倒性的暗色沉浸 |
| 文字 | `#ffffff` 纯白 | 高对比、冷峻 |
| 次要文字 | `#dadbdf` 灰白 | 降低信息密度 |
| 静音文字 | `#7d8187` 中灰 | 退隐式信息层次 |
| 边框 | `#212327` hairline | 极淡的结构线 |
| 按钮 | 白色描边 pill | 统一交互形状 |
| 卡片 | `#191919` 炭灰 + 8px 圆角 | 紧凑、几何感 |
| 标签 | GeistMono 大写 + 1.4px 正间距 | 代码注释感 |

### 1.3 色彩策略

xAI 的色彩是 **"暗色画布 + 白描边 + 稀释点缀"** 三明治结构：

- **表面层**：近黑 `#0a0a0a` → 微亮黑 `#1a1c20` → 炭灰 `#191919` → 中暗 `#363a3f`，四级暗色阶
- **文字层**：纯白 `#ffffff` → 灰白 `#dadbdf` → 中灰 `#7d8187`，三级文字层次
- **边框层**：`#212327` 单一 hairline，半透明白 `rgba(255,255,255,0.25)` 用于按钮描边
- **点缀层**：`#ff7a17` sunset / `#7c3aed` dusk / `#c4b5fd` twilight / `#a0c3ec` breeze，仅用于插画

**核心理念**：整个品牌的"颜色"就是白色。白色是 primary，近黑是 canvas，其余全是结构辅助。

### 1.4 字体策略

**双字体体系**：

| 角色 | 字体 | 字重 | 字间距 | 效果 |
|---|---|---|---|---|
| 显示标题 | Universal Sans | 400 | -2.4px（96px）至 -0.6px（32px） | 精确、内收、工程感 |
| 正文/按钮 | Universal Sans | 400 | 0 | 中性可读 |
| 标签/眉毛 | GeistMono | 400 | +1.4px（14px）/ +1.2px（12px） | 代码注释感、技术标签 |

**关键规则**：
- 全局 weight 400，不使用 bold
- 显示字号使用负字间距（`letter-spacing: -2.4px` 起），是品牌签名
- 标签用等宽字体大写 + 正字间距，读起来像代码里的注释

### 1.5 布局与组件模式

**间距系统**：4px 基准，`2 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px` 梯度

**圆角系统**：

| 用途 | 圆角 |
|---|---|
| 全出血区域 | 0px |
| 卡片 | 8px |
| 按钮 | 9999px（pill） |
| 圆形容器 | 9999px |

**组件模式**：
- **按钮**：pill 形状，1px 半透明白描边，无填充（除唯一白色实心主按钮）
- **卡片**：8px 圆角，微亮背景，1px hairline 边框，24px 内边距
- **Hero 区**：全屏暗色，96px 显示标题，64px 上下内边距
- **内容区**：section headline 前必有 GeistMono 大写眉毛标签
- **导航**：暗色背景 + 白色文字 + 紧凑间距
- **输入框**：微亮背景 + hairline 边框 + 8px 圆角

---

## 2. 适配分析

### 2.1 可直接迁移

以下 xAI 设计元素可直接应用到刷个冯题，无需改造：

| 元素 | xAI 原案 | 迁移理由 |
|---|---|---|
| weight 400 全局克制 | 全局不 bold | 与 Claude Design 的 Georgia 400 weight 一致 |
| 负字间距标题 | display -2.4px ~ -0.6px | Claude Design 已用 -3rpx，理念相同 |
| 零阴影原则 | 靠色阶和边线表达深度 | 与当前项目"零阴影，靠色块对比"完全一致 |
| 间距系统思路 | 4px 基准梯度 | rpx 版可直接映射 |
| pill 形状按钮 | 9999px 圆角 | 可作为特殊 CTA 的变体形状 |
| 眉毛标签模式 | UPPERCASE + 正字间距 | 可用等宽字体实现技术标签感 |
| 内容区结构 | 眉毛 + 标题 + 正文 | 信息架构通用 |

### 2.2 需要改造

以下元素需要从暗色体系反转到暖奶油体系：

| 元素 | xAI 原案 | 改造方向 |
|---|---|---|
| 画布色 | `#0a0a0a` 近黑 | → `#faf9f5` 暖奶油（保留现有） |
| 文字色 | `#ffffff` 白 | → `#141413` 暖墨（保留现有） |
| 卡片色 | `#191919` 炭灰 | → `#efe9de` 奶油卡片（保留现有） |
| 边框色 | `#212327` 暗 hairline | → `#e6dfd8` 浅暖 hairline |
| 次要文字 | `#dadbdf` 灰白 | → `#6c6a64` 暖灰（保留现有） |
| 按钮描边 | 半透明白 `rgba(255,255,255,0.25)` | → `#cc785c` 珊瑚描边或实心珊瑚 |
| 点缀色 | `#ff7a17` sunset 等暗面点缀色 | → 暖面上需降低饱和度或仅用于深色区域 |
| 字体 | Universal Sans（无衬线） | → Georgia（衬线），保持现有 |

### 2.3 不可迁移

以下元素与刷个冯题的设计语言冲突，不应迁移：

| 元素 | xAI 原案 | 冲突原因 |
|---|---|---|
| 暗色画布模式 | 整站 `#0a0a0a` | 刷个冯题定位学习工具，暖色系更友好 |
| GeistMono 作为主标签字体 | 等宽大写标签 | 微信小程序无法可靠加载自定义等宽字体；Georgia 已是品牌签名 |
| 白色实心 pill 主按钮 | 白底黑字 | 在暖奶油画布上对比度不足 |
| 全页面暗色导航 | 暗底白字导航栏 | 与暖奶油全局风格冲突 |
| 极大显示字号（96px） | 桌面端 Hero | 小程序为移动端，750rpx 视口不适用 |
| 纯 SVG 插画策略 | 无摄影、纯几何 SVG | 与学习工具的亲和力定位不符 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

将 xAI 色彩角色映射到刷个冯题暖色体系：

| 角色 | xAI 色值 | 刷个冯题色值 | 说明 |
|---|---|---|---|
| 画布 | `#0a0a0a` | `#faf9f5` | 暖奶油画布 |
| 画布次级 | `#1a1c20` | `#f3ede4` | 微暖灰（hover / 次级区域） |
| 卡片 | `#191919` | `#efe9de` | 奶油卡片 |
| 卡片 Active | — | `#e8e0d2` | 卡片按下态 |
| 深色表面 | — | `#181715` | 深海军蓝（用于对比节奏） |
| 深色面文字 | `#ffffff` | `#faf9f5` | 暖白 |
| 深色面次要 | — | `#a09d96` | 暖灰 |
| 主文字 | `#ffffff` | `#141413` | 暖墨 |
| 次要文字 | `#dadbdf` | `#6c6a64` | 暖灰 |
| 静音文字 | `#7d8187` | `#8e8b82` | 最淡暖灰 |
| 边框 | `#212327` | `#e6dfd8` | 浅暖分割线 |
| 深色面边框 | `rgba(255,255,255,0.25)` | `#252320` | 深面分割线 |
| 主色 CTA | `#ffffff`（实心 pill） | `#cc785c` | 珊瑚色 |
| 主色 Active | — | `#a9583e` | 珊瑚按下态 |
| 点缀 sunset | `#ff7a17` | `#cc785c` | 珊瑚（已在主色中复用） |
| 点缀 dusk | `#7c3aed` | — | 暂不引入，保持暖色纯度 |
| 点缀 breeze | `#a0c3ec` | — | 暂不引入 |

**设计决策**：xAI 的点缀色体系（sunset / dusk / breeze）在暗色面上有表现力，但在暖奶油面上会显得杂乱。建议仅保留与珊瑚同色系的暖色延伸，不引入冷色点缀。

### 3.2 字体映射（rpx）

xAI 的 px 字号映射到小程序 rpx，以及与现有 Claude Design 字体的对照：

| 角色 | xAI 原案 | xAI → rpx | 刷个冯题实际 | 建议 |
|---|---|---|---|---|
| 显示 XL | 96px / -2.4px | 192rpx / -4.8rpx | 不适用（移动端过大） | 不迁移 |
| 显示 LG | 72px / -1.8px | 144rpx / -3.6rpx | 不适用 | 不迁移 |
| 显示 MD | 48px / -1.2px | 96rpx / -2.4rpx | Georgia 56rpx / -3rpx | 保持现有，可用 80-96rpx 做大标题 |
| 显示 SM | 32px / -0.6px | 64rpx / -1.2rpx | Georgia 40rpx / -3rpx | 保持现有 |
| 显示 XS | 20px / 0 | 40rpx / 0 | Georgia 32rpx | 可对齐 |
| 正文 LG | 18px / 0 | 36rpx / 0 | 30rpx | 可在引言段使用 36rpx |
| 正文 MD | 16px / 0 | 32rpx / 0 | 28rpx | 可对齐 32rpx |
| 正文 SM | 14px / 0 | 28rpx / 0 | 24rpx | 保持现有 |
| 标签 Mono | 14px / +1.4px | 28rpx / +2.8rpx | — | 用 `font-family: Georgia` + `text-transform: uppercase` + `letter-spacing: 3rpx` 替代 |
| 按钮 | 14px / 0 | 28rpx / 0 | 28rpx | 对齐 |

**字体映射总结**：

```
xAI Universal Sans (geometric sans, 400) → Georgia (serif, 400)
  - 保持 weight 400 不变
  - 保持负字间距策略（-3rpx 起）
  - Georgia 的衬线感在暖奶油面上比无衬线更和谐

xAI GeistMono (monospace, uppercase, +1.4px) → Georgia + uppercase + letter-spacing: 3rpx
  - 微信小程序无法加载 GeistMono
  - 用 Georgia 大写 + 正字间距模拟"代码注释感"
  - 如需更强技术感，可考虑系统等宽字体 SFMono / Menlo
```

### 3.3 组件设计规范

#### 3.3.1 按钮

**主按钮（珊瑚实心 pill）**
```css
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border: 1rpx solid #cc785c;
  border-radius: 9999rpx;
  padding: 12rpx 32rpx;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
  letter-spacing: 0;
  text-align: center;
}
.btn-primary:active {
  background-color: #a9583e;
  border-color: #a9583e;
}
```

**描边按钮（暖墨描边 pill）** — xAI 白描边 pill 的暖色版
```css
.btn-outline {
  background-color: transparent;
  color: #141413;
  border: 1rpx solid #e6dfd8;
  border-radius: 9999rpx;
  padding: 12rpx 32rpx;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
}
.btn-outline:active {
  background-color: #efe9de;
  border-color: #cc785c;
  color: #cc785c;
}
```

**深色面上的描边按钮** — 最接近 xAI 原版
```css
.btn-outline-on-dark {
  background-color: transparent;
  color: #faf9f5;
  border: 1rpx solid rgba(250, 249, 245, 0.25);
  border-radius: 9999rpx;
  padding: 12rpx 32rpx;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
}
.btn-outline-on-dark:active {
  background-color: rgba(250, 249, 245, 0.1);
}
```

#### 3.3.2 卡片

**标准卡片** — xAI `card-content` 的暖色版
```css
.card {
  background-color: #efe9de;
  border: 1rpx solid #e6dfd8;
  border-radius: 24rpx;
  padding: 48rpx;
  color: #141413;
}
```

**深色卡片** — 最接近 xAI 原版 `card-content`
```css
.card-dark {
  background-color: #181715;
  border: 1rpx solid #252320;
  border-radius: 24rpx;
  padding: 48rpx;
  color: #faf9f5;
}
```

**说明**：xAI 用 8px（16rpx）圆角，但刷个冯题已有 24rpx 圆角规范，保持一致性优先于还原 xAI。

#### 3.3.3 眉毛标签（Eyebrow）

xAI 的 GeistMono UPPERCASE 标签，暖色版实现：
```css
.eyebrow {
  font-family: Georgia, serif;
  font-size: 24rpx;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 3rpx;
  color: #6c6a64;
  margin-bottom: 12rpx;
}
```

深色面上的眉毛标签：
```css
.eyebrow-on-dark {
  font-family: Georgia, serif;
  font-size: 24rpx;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 3rpx;
  color: #a09d96;
}
```

#### 3.3.4 分割线

```css
/* 浅面分割线 */
.divider {
  height: 1rpx;
  background-color: #e6dfd8;
  border: none;
}

/* 深面分割线 */
.divider-dark {
  height: 1rpx;
  background-color: #252320;
  border: none;
}
```

#### 3.3.5 输入框

xAI `text-input` 的暖色版：
```css
.input {
  background-color: #f3ede4;
  color: #141413;
  border: 1rpx solid #e6dfd8;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
}
.input:focus {
  border-color: #cc785c;
}
```

### 3.4 页面布局模板

#### 3.4.1 内容页模板（xAI `content-band` 的暖色版）

```
┌─────────────────────────────┐
│  #faf9f5 暖奶油画布          │
│                             │
│  EYEBROW LABEL              │  ← Georgia 24rpx uppercase +3rpx，#6c6a64
│  页面主标题                   │  ← Georgia 56rpx 400 -3rpx，#141413
│  ─────────────────          │  ← 1rpx #e6dfd8 分割线
│                             │
│  ┌───────────────────────┐  │
│  │  #efe9de 奶油卡片       │  │  ← 24rpx 圆角，48rpx 内边距
│  │                       │  │
│  │  正文内容               │  │  ← Georgia 28rpx 400，#141413
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  #181715 深色卡片       │  │  ← 深海军蓝，对比节奏
│  │                       │  │
│  │  EYEBROW ON DARK      │  │  ← Georgia 24rpx uppercase，#a09d96
│  │  深色区标题              │  │  ← Georgia 40rpx 400 -3rpx，#faf9f5
│  │                       │  │
│  │  [描边 pill 按钮]       │  │  ← rgba(250,249,245,0.25) 描边
│  │                       │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

#### 3.4.2 工具卡片列表模板

```
┌─────────────────────────────┐
│  #faf9f5                    │
│                             │
│  TOOLS                      │  ← eyebrow 标签
│                             │
│  ┌──────────┐ ┌──────────┐ │
│  │ 奶油卡片  │ │ 奶油卡片  │ │  ← 2-up grid
│  │ 工具名    │ │ 工具名    │ │
│  │ 描述      │ │ 描述      │ │
│  │ [pill 按钮]│ │ [pill 按钮]│ │  ← 珊瑚实心 pill
│  └──────────┘ └──────────┘ │
│                             │
│  ┌──────────┐ ┌──────────┐ │
│  │ 奶油卡片  │ │ 奶油卡片  │ │
│  └──────────┘ └──────────┘ │
│                             │
└─────────────────────────────┘
```

#### 3.4.3 数据展示页模板（可视化 / 计算器）

```
┌─────────────────────────────┐
│  #faf9f5                    │
│                             │
│  MODULE NAME                │  ← eyebrow
│  模块标题                    │  ← 56rpx
│                             │
│  ┌───────────────────────┐  │
│  │  #efe9de 控制面板卡片   │  │
│  │  [pill 按钮] [pill 按钮]│  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  #181715 可视化区域     │  │  ← 深色面承载可视化
│  │                       │  │
│  │  数据图形 / 动画        │  │  ← 白/暖色图形元素
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  #efe9de 结果面板       │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**说明**：此模板特别适合排序可视化、数据结构可视化等模块——深色可视化区域 + 浅色控制面板，视觉层次清晰，且深色面上的图形元素对比度最佳。

### 3.5 WXSS 示例

#### 3.5.1 完整页面样式（内容页）

```css
/* pages/example/example.wxss */

.page {
  background-color: #faf9f5;
  min-height: 100vh;
  padding: 48rpx 32rpx;
}

/* 眉毛标签 */
.page-eyebrow {
  font-family: Georgia, serif;
  font-size: 24rpx;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 3rpx;
  color: #6c6a64;
  margin-bottom: 16rpx;
}

/* 页面标题 */
.page-title {
  font-family: Georgia, serif;
  font-size: 56rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  color: #141413;
  margin-bottom: 32rpx;
}

/* 分割线 */
.page-divider {
  height: 1rpx;
  background-color: #e6dfd8;
  margin: 32rpx 0;
}

/* 标准卡片 */
.card {
  background-color: #efe9de;
  border: 1rpx solid #e6dfd8;
  border-radius: 24rpx;
  padding: 48rpx;
  margin-bottom: 24rpx;
}

/* 深色卡片（对比节奏） */
.card-dark {
  background-color: #181715;
  border: 1rpx solid #252320;
  border-radius: 24rpx;
  padding: 48rpx;
  margin-bottom: 24rpx;
}

.card-dark .card-eyebrow {
  font-family: Georgia, serif;
  font-size: 24rpx;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 3rpx;
  color: #a09d96;
  margin-bottom: 12rpx;
}

.card-dark .card-title {
  font-family: Georgia, serif;
  font-size: 40rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  color: #faf9f5;
  margin-bottom: 24rpx;
}

/* 珊瑚实心 pill 按钮 */
.btn-primary {
  display: inline-block;
  background-color: #cc785c;
  color: #faf9f5;
  border: 1rpx solid #cc785c;
  border-radius: 9999rpx;
  padding: 12rpx 32rpx;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
  text-align: center;
  line-height: 1.5;
}

.btn-primary:active {
  background-color: #a9583e;
  border-color: #a9583e;
}

/* 描边 pill 按钮 */
.btn-outline {
  display: inline-block;
  background-color: transparent;
  color: #141413;
  border: 1rpx solid #e6dfd8;
  border-radius: 9999rpx;
  padding: 12rpx 32rpx;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
  text-align: center;
  line-height: 1.5;
}

.btn-outline:active {
  background-color: #efe9de;
  border-color: #cc785c;
  color: #cc785c;
}

/* 深色面上的描边 pill 按钮 */
.btn-outline-on-dark {
  display: inline-block;
  background-color: transparent;
  color: #faf9f5;
  border: 1rpx solid rgba(250, 249, 245, 0.25);
  border-radius: 9999rpx;
  padding: 12rpx 32rpx;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
  text-align: center;
  line-height: 1.5;
}

.btn-outline-on-dark:active {
  background-color: rgba(250, 249, 245, 0.1);
}
```

#### 3.5.2 状态标签样式

```css
/* 状态 pill 标签（如"已完成""进行中"） */
.status-pill {
  display: inline-block;
  border-radius: 9999rpx;
  padding: 4rpx 16rpx;
  font-family: Georgia, serif;
  font-size: 22rpx;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.status-pill--done {
  background-color: #cc785c;
  color: #faf9f5;
}

.status-pill--active {
  background-color: transparent;
  color: #cc785c;
  border: 1rpx solid #cc785c;
}

.status-pill--muted {
  background-color: transparent;
  color: #8e8b82;
  border: 1rpx solid #e6dfd8;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

以下页面/场景最适合引入 xAI 设计元素：

| 页面 | 适合的 xAI 元素 | 原因 |
|---|---|---|
| **数据结构可视化** | 深色可视化区 + pill 按钮 + 眉毛标签 | 深色面对算法可视化天然友好，pill 按钮适合"运行/暂停/重置"操作 |
| **排序可视化** | 深色可视化区 + 描边 pill | 同上，深色面让彩色柱状图对比度最佳 |
| **TCP 动画机** | 深色动画区 + 眉毛标签 + pill 按钮 | 网络协议动画在深色面上最有"控制台"感 |
| **子网计算器** | 眉毛标签 + 深色结果面板 + pill 按钮 | 计算器工具感，UPPERCASE 标签增强技术属性 |
| **学习驾驶舱 — 统计区** | 深色统计卡片 + 眉毛标签 | 数据密集区域，深色面可降低视觉噪声 |

### 4.2 不适合页面

以下页面应保持纯暖奶油风格，不引入 xAI 暗色元素：

| 页面 | 不适合的元素 | 原因 |
|---|---|---|
| **首页** | 暗色画布、全页面 pill 按钮 | 首页是暖奶油品牌门面，暗色元素会破坏一致性 |
| **刷题页面** | 深色背景、pill 按钮 | 刷题需要长时间阅读，暖色系更护眼 |
| **导入页面** | 暗色卡片、技术标签 | 导入流程需要亲和力，不是技术感 |
| **错题本** | 深色面、眉毛标签 | 错题复盘需要温和的视觉环境 |
| **记录列表** | pill 形状操作按钮 | 列表操作需要紧凑的矩形按钮，pill 太占空间 |

### 4.3 混搭建议

**推荐策略：暖奶油基底 + 深色面点缀**

```
页面整体：#faf9f5 暖奶油画布（不变）
  ↓
控制/操作区：#efe9de 奶油卡片 + pill 按钮（引入 xAI pill 形状）
  ↓
可视化/数据区：#181715 深色卡片 + 白色/暖色内容（引入 xAI 暗色面）
  ↓
标签/眉毛：UPPERCASE + letter-spacing: 3rpx（引入 xAI 标签模式）
```

**节奏比例建议**：
- 暖奶油区域：60-70%（页面主体）
- 奶油卡片区域：20-25%（操作面板、信息卡片）
- 深色区域：10-15%（可视化区、重点数据展示）

**按钮选择指南**：
- 主操作（提交、开始、确认）→ 珊瑚实心 pill `btn-primary`
- 次操作（返回、取消、更多）→ 描边 pill `btn-outline`
- 深色面上的操作 → 半透明白描边 pill `btn-outline-on-dark`
- 列表内紧凑操作（编辑、删除）→ 保持现有矩形按钮，不强制 pill

---

## 5. 实施检查清单

### 5.1 新建页面时

- [ ] 页面背景使用 `#faf9f5`（暖奶油）
- [ ] 标题使用 Georgia 400 weight，负字间距 `-3rpx`
- [ ] 正文使用 Georgia 400 weight，28rpx
- [ ] 如有技术标签，使用 UPPERCASE + `letter-spacing: 3rpx`
- [ ] 如有可视化区域，使用 `#181715` 深色卡片
- [ ] 主操作按钮使用珊瑚 pill `#cc785c`
- [ ] 次操作按钮使用描边 pill `#e6dfd8` 边框
- [ ] 卡片圆角使用 24rpx（非 xAI 的 16rpx）
- [ ] 分割线使用 `#e6dfd8`（浅面）或 `#252320`（深面）

### 5.2 深色面使用时

- [ ] 深色面背景使用 `#181715`（非 xAI 的 `#0a0a0a`）
- [ ] 深色面文字使用 `#faf9f5`（非纯白 `#ffffff`）
- [ ] 深色面次要文字使用 `#a09d96`
- [ ] 深色面分割线使用 `#252320`
- [ ] 深色面按钮使用 `rgba(250, 249, 245, 0.25)` 描边
- [ ] 深色面占比不超过页面总面积的 15%

### 5.3 pill 按钮使用时

- [ ] pill 圆角使用 `9999rpx`
- [ ] 内边距使用 `12rpx 32rpx`
- [ ] 字号使用 28rpx Georgia 400
- [ ] 主按钮填充 `#cc785c`，文字 `#faf9f5`
- [ ] 描边按钮使用 `1rpx solid #e6dfd8`
- [ ] 按钮最小高度满足 88rpx 触摸区域（WCAG 44px x 2）

### 5.4 眉毛标签使用时

- [ ] 字号 24rpx，Georgia 400
- [ ] `text-transform: uppercase`
- [ ] `letter-spacing: 3rpx`
- [ ] 浅面上颜色 `#6c6a64`
- [ ] 深面上颜色 `#a09d96`
- [ ] 标签与下方标题间距 12-16rpx

### 5.5 与现有风格一致性

- [ ] 不引入 `#0a0a0a` 近黑画布（保留 `#faf9f5`）
- [ ] 不引入 Universal Sans / GeistMono 字体（保留 Georgia）
- [ ] 不引入冷色点缀（dusk purple / breeze blue）
- [ ] 卡片圆角保持 24rpx（不改用 xAI 的 16rpx）
- [ ] 全局 weight 400 不变，不引入 bold

---

## 6. 参考文件

| 文件 | 用途 |
|---|---|
| `.claude/skills/x.ai-design.md` | xAI 设计语言源文件 |
| `.claude/skills/claude-design.md` | 当前项目基线设计风格 |
| `PROJECT_HANDOFF.md` §25 | Claude Design 暖奶油画布改造记录 |
| `CLAUDE.md` | 设计风格约束（暖奶油 + Georgia + 珊瑚 CTA） |
| `pages/index/index.wxss` | 首页样式实现参考 |
| `pages/sort-viz/sort-viz.wxss` | 排序可视化深色面实现参考 |
