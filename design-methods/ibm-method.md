# IBM 设计方案 → 刷个冯题 实施方法论

> **参考来源**: `/Users/charliepan/Downloads/my-miniapp/.claude/skills/ibm-design.md`
> **适用项目**: 刷个冯题（微信小程序原生 WXML + WXSS + JS）
> **生成时间**: 2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

IBM 的设计语言源自 **Carbon Design System**——IBM 的开源企业设计系统。核心理念：

- **极端克制**：整个系统只用一个品牌色（IBM Blue `#0f62fe`），其余完全靠黑白灰
- **直角美学**：所有按钮、卡片、输入框、容器一律 0px 圆角，没有任何圆角元素
- **轻量标题**：76px 大标题用 weight 300（极细），这是 IBM 的品牌签名——用"轻"表达权威
- **精密字距**：body 文字统一 `letter-spacing: 0.16px`，这是 Carbon 的精密细节
- **表面分层**：深度靠 1px hairline 边框和 `#f4f4f4` 表面切换表达，完全拒绝阴影
- **工程感而非设计感**：系统读起来像精密工程文档，不像品牌宣传册

### 1.2 视觉DNA

| 特征 | IBM 方案 | 与暖奶油画布差异 |
|---|---|---|
| 画布底色 | 纯白 `#ffffff` | 暖奶油 `#faf9f5`，IBM 更冷更白 |
| 卡片底色 | 纯白 + 1px hairline 边框 | 奶油卡片 `#efe9de`，IBM 卡片与画布同色靠边框区分 |
| 深色面板 | `#161616` charcoal | `#181715` 深海军蓝，IBM 更纯灰黑 |
| 圆角策略 | 全部 0px（直角） | 卡片 24rpx，IBM 完全无圆角 |
| 阴影策略 | 无阴影，靠 1px 边框 | 无阴影，靠色块对比——理念接近 |
| 装饰元素 | 无装饰 | 无装饰——理念一致 |

### 1.3 色彩策略

IBM 的色彩极度克制：

- **品牌色**：`#0f62fe`（IBM Blue），用于 CTA、链接、focus 下划线，是唯一的彩色
- **画布**：`#ffffff` 纯白
- **表面层**：`#f4f4f4`（surface-1）用于输入框、交替行、区域带
- **边框**：`#e0e0e0`（hairline）用于卡片、分隔线
- **文字**：`#161616`（ink）为主，`#525252`（ink-muted）为辅，`#8c8c8c`（ink-subtle）为末
- **语义色**：`#24a148` 成功、`#f1c21b` 警告、`#da1e28` 错误

**关键差异**：暖奶油画布用珊瑚色 `#cc785c` 做 CTA，IBM 用蓝色 `#0f62fe`。暖奶油画布用色块对比分层，IBM 用 1px hairline 边框分层。两者都拒绝阴影，但分层手段不同。

### 1.4 字体策略

IBM 使用 **IBM Plex Sans**（开源免费字体），全文统一：

| 角色 | IBM 方案 | 暖奶油画布 |
|---|---|---|
| 大标题（76px） | IBM Plex Sans **300**（极细） | Georgia 衬线 400 weight |
| 区域标题（42px） | IBM Plex Sans **300** | Georgia 衬线 400 weight |
| 正文 | IBM Plex Sans 400, `letter-spacing: 0.16px` | 系统字体 |
| 按钮 | IBM Plex Sans 400（不用粗体） | 系统字体 |
| 标题间距 | display-xl: `-0.5px` | `-3rpx` |

**关键差异**：

1. IBM 大标题用 300（极细），暖奶油画布用 Georgia 400（衬线正常粗细）。IBM 的"轻标题"是品牌签名，暖奶油画布的"衬线标题"是人文签名。
2. IBM 有精密的 `letter-spacing: 0.16px`，暖奶油画布没有这个细节。
3. IBM 按钮用 400 weight（不加粗），暖奶油画布按钮用 600 weight。

### 1.5 布局与组件模式

- **卡片圆角**：全部 0px（直角），这是 Carbon 的核心签名
- **间距基准**：4px 网格（Carbon 的签名 4 像素网格）
- **阴影**：完全无阴影
- **分层手段**：1px `#e0e0e0` hairline 边框 + `#f4f4f4` 表面切换
- **深色区**：仅页脚用 `#161616` 反色，页面主体保持白色系
- **按钮风格**：实心方角，不用描边按钮（描边只用于 tertiary）

---

## 2. 适配分析

### 2.1 可直接迁移

以下设计元素可以直接用于刷个冯题：

| 元素 | 理由 |
|---|---|
| 无阴影策略 | 与暖奶油画布零阴影规范完全一致 |
| 1px hairline 边框分层 | 可用于奶油卡片的微弱边界感，增强层次 |
| `letter-spacing: 0.16px` 正文细节 | 微妙但有效的排版精致感，无副作用 |
| 4px 间距网格 | rpx 环境下用 8rpx 倍数即可 |
| 语义色（成功/警告/错误） | 直接复用 `#24a148` / `#f1c21b` / `#da1e28` |
| 句子式 eyebrow（不用全大写） | 与暖奶油画布风格一致 |
| 按钮高度 44px（88rpx） | 符合触摸目标规范 |

### 2.2 需要改造

以下元素需要调整后才能使用：

| 元素 | 原方案 | 改造方向 |
|---|---|---|
| 品牌蓝 CTA | `#0f62fe` | 保留为辅助强调色（链接、标签），CTA 主色仍用 `#cc785c` |
| 纯白画布 | `#ffffff` | 改为暖白 `#faf9f5` |
| 纯白卡片 + hairline | `#ffffff` + 1px border | 改为 `#efe9de` 奶油卡片，hairline 可保留作为微弱边界 |
| `#f4f4f4` 交替带 | 冷灰 | 改为暖灰 `#f0ece4` |
| 0px 圆角（全部直角） | Carbon 签名 | 按钮可改为 8rpx 微圆角，卡片保持 24rpx（项目规范） |
| 300 weight 大标题 | IBM 品牌签名 | 改为 Georgia 400（IBM 的"轻标题"与暖奶油画布的"衬线标题"冲突） |
| 400 weight 按钮 | Carbon 规范 | 改为 600 weight（暖奶油画布按钮规范） |
| 0.16px letter-spacing | Carbon 细节 | 正文可保留，标题去掉（改用 Georgia -3rpx） |

### 2.3 不可迁移

以下元素不应在刷个冯题中使用：

| 元素 | 理由 |
|---|---|
| 全部 0px 圆角 | 与暖奶油画布的 24rpx 卡片圆角冲突严重，直角在微信小程序中显得过于冷硬 |
| 300 weight 大标题 | Georgia 衬线在 300 weight 下几乎看不见，且与项目风格冲突 |
| `#0f62fe` 作为主 CTA | 与暖奶油画布的 `#cc785c` 珊瑚色冲突 |
| IBM Plex Sans 字体 | 虽然开源免费，但与项目 Georgia 衬线风格冲突 |
| 纯白画布 + 纯白卡片 | 与暖奶油画布的暖色系冲突 |
| Carbon 的 16 列网格 | 微信小程序用 rpx 自适应，不需要复杂网格系统 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

将 IBM 色彩映射到刷个冯题的实际用色：

| IBM 色彩 | IBM 值 | 刷个冯题映射 | 映射值 | 说明 |
|---|---|---|---|---|
| canvas | `#ffffff` | 页面背景 | `#faf9f5` | 暖白替代纯白 |
| surface-1 | `#f4f4f4` | 交替带/输入框背景 | `#f0ece4` | 暖灰替代冷灰 |
| surface-2 | `#e0e0e0` | 次要表面 | `#e8e3d8` | 暖灰 |
| hairline | `#e0e0e0` | 边框色 | `#d4cfc6` | 暖灰边框 |
| hairline-strong | `#161616` | focus 边框 | `#141413` | 暖墨 focus 下划线 |
| primary | `#0f62fe` | 辅助强调色 | `#4a7ec7` | 用于链接、标签（非 CTA） |
| blue-80 | `#002d9c` | 辅助强调按下态 | `#3a5e97` | 链接按下色 |
| ink | `#161616` | 主文字色 | `#141413` | 暖墨 |
| ink-muted | `#525252` | 次要文字 | `#6c6a64` | 暖灰文字 |
| ink-subtle | `#8c8c8c` | 辅助文字 | `#8a877e` | 更暖的灰 |
| inverse-canvas | `#161616` | 深色表面 | `#181715` | 深海军蓝 |
| inverse-ink | `#ffffff` | 深色面文字 | `#faf9f5` | 暖白 |
| inverse-ink-muted | `#c6c6c6` | 深色面次要文字 | `#a8a59c` | 暖灰 |
| semantic-success | `#24a148` | 成功色 | `#24a148` | 语义色可保留 |
| semantic-warning | `#f1c21b` | 警告色 | `#f1c21b` | 语义色可保留 |
| semantic-error | `#da1e28` | 错误色 | `#da1e28` | 语义色可保留 |

### 3.2 字体映射 (rpx)

将 IBM 的 px 值转换为 rpx，并替换字体族：

| IBM Token | IBM 值 | 刷个冯题 WXSS | 说明 |
|---|---|---|---|
| display-xl | 76px / 300 / 1.17 / -0.5px | `font-size: 72rpx; font-weight: 400; line-height: 1.1; font-family: Georgia, serif; letter-spacing: -3rpx;` | 重量从 300 改为 400，字距改为 -3rpx |
| display-lg | 60px / 300 / 1.17 / -0.4px | `font-size: 56rpx; font-weight: 400; line-height: 1.1; font-family: Georgia, serif; letter-spacing: -3rpx;` | 同上 |
| display-md | 42px / 300 / 1.20 / 0 | `font-size: 44rpx; font-weight: 400; line-height: 1.2; font-family: Georgia, serif; letter-spacing: -2rpx;` | 同上 |
| headline | 32px / 400 / 1.25 / 0 | `font-size: 36rpx; font-weight: 400; line-height: 1.3; font-family: Georgia, serif; letter-spacing: -2rpx;` | 改为衬线 |
| card-title | 24px / 400 / 1.33 / 0 | `font-size: 32rpx; font-weight: 400; line-height: 1.3; font-family: Georgia, serif; letter-spacing: -1rpx;` | 改为衬线 |
| subhead | 20px / 400 / 1.40 / 0 | `font-size: 30rpx; font-weight: 400; line-height: 1.4;` | 正文级 |
| body-lg | 18px / 400 / 1.50 / 0 | `font-size: 30rpx; font-weight: 400; line-height: 1.6;` | 正文级 |
| body | 16px / 400 / 1.50 / 0.16px | `font-size: 28rpx; font-weight: 400; line-height: 1.6; letter-spacing: 0.32rpx;` | 保留 letter-spacing 细节 |
| body-sm | 14px / 400 / 1.29 / 0.16px | `font-size: 24rpx; font-weight: 400; line-height: 1.4; letter-spacing: 0.32rpx;` | 保留 letter-spacing |
| body-emphasis | 14px / 600 / 1.29 / 0.16px | `font-size: 24rpx; font-weight: 600; line-height: 1.4; letter-spacing: 0.32rpx;` | 强调文字 |
| caption | 12px / 400 / 1.33 / 0.32px | `font-size: 22rpx; font-weight: 400; line-height: 1.4; letter-spacing: 0.64rpx;` | 保留 letter-spacing |
| button | 14px / 400 / 1.29 / 0.16px | `font-size: 28rpx; font-weight: 600; line-height: 1.4;` | weight 从 400 提升到 600 |

**关键改造**：
- 所有 display 级标题：weight 300 -> 400，字体改为 Georgia serif
- 所有标题：letter-spacing 改为负值（-1rpx 到 -3rpx），替代 IBM 的负值或零值
- 正文：保留 IBM 的 `letter-spacing` 精密感（0.32rpx 对应 0.16px）
- 按钮：weight 400 -> 600（暖奶油画布规范）

### 3.3 组件设计规范

从 IBM 方案中提取可复用的组件规范，适配到刷个冯题：

#### 主按钮 (button-primary)

```css
.btn-primary {
  background-color: #cc785c;        /* 暖奶油画布主色，替代 IBM #0f62fe */
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 600;                 /* IBM 用 400，这里改为 600 */
  line-height: 1.4;
  border-radius: 8rpx;             /* IBM 用 0px，这里改为 8rpx 微圆角 */
  padding: 24rpx 32rpx;            /* IBM 用 12px 16px */
  border: none;
}
.btn-primary:active {
  background-color: #a9583e;        /* 暖奶油画布 Active 色 */
}
```

#### 次要按钮 (button-secondary)

```css
.btn-secondary {
  background-color: #141413;        /* 暖墨，替代 IBM #161616 */
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  border-radius: 8rpx;
  padding: 24rpx 32rpx;
  border: none;
}
```

#### 描边按钮 (button-tertiary) -- IBM 特色

```css
.btn-tertiary {
  background-color: transparent;
  color: #cc785c;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  border-radius: 8rpx;
  padding: 24rpx 32rpx;
  border: 2rpx solid #cc785c;
}
```

#### 功能卡片 (feature-card) -- IBM 的核心卡片模式

```css
.feature-card {
  background-color: #efe9de;        /* 奶油卡片 */
  border-radius: 24rpx;             /* IBM 用 0px，这里改为 24rpx */
  padding: 48rpx;                   /* IBM 用 24px */
  border: 2rpx solid #d4cfc6;       /* IBM 的 1px hairline，转为 2rpx 暖灰边框 */
}
.feature-card__title {
  font-family: Georgia, serif;
  font-size: 32rpx;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -1rpx;
  color: #141413;
  margin-bottom: 16rpx;
}
.feature-card__body {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.32rpx;         /* IBM 的精密字距细节 */
  color: #6c6a64;
}
```

#### 交替区域卡 (feature-card-elevated) -- IBM 的 surface-1 模式

```css
.feature-card-alt {
  background-color: #f0ece4;        /* 暖灰表面，替代 IBM #f4f4f4 */
  border-radius: 24rpx;
  padding: 48rpx;
  /* 无边框 — 靠表面色差区分 */
}
```

#### 输入框 (text-input) -- IBM 的 Carbon 输入框风格

```css
.input {
  background-color: #f0ece4;        /* IBM 用 surface-1 做输入框底色 */
  color: #141413;
  font-size: 28rpx;
  line-height: 1.6;
  letter-spacing: 0.32rpx;
  border-radius: 8rpx;             /* IBM 用 0px，这里微圆角 */
  padding: 22rpx 32rpx;            /* IBM 用 11px 16px */
  border: none;
  border-bottom: 2rpx solid #d4cfc6; /* IBM 的底部边框 focus 模式 */
}
.input-focus {
  border-bottom-color: #cc785c;     /* IBM 用 primary 做 focus 下划线，这里用主色 */
  border-bottom-width: 4rpx;        /* IBM focus 用 2px，这里 4rpx */
}
```

#### CTA 横幅 (cta-banner) -- IBM 的全宽蓝色 CTA 面板

```css
.cta-banner {
  background-color: #cc785c;        /* 暖奶油画布主色，替代 IBM #0f62fe */
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 96rpx 48rpx;            /* IBM 用 48px */
  text-align: center;
}
.cta-banner__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -2rpx;
  margin-bottom: 24rpx;
}
```

#### Tab 标签栏 (product-tab) -- IBM 的底部下划线 Tab

```css
.tab-bar {
  display: flex;
  border-bottom: 2rpx solid #d4cfc6;
}
.tab-item {
  padding: 32rpx 40rpx;            /* IBM 用 16px 20px */
  font-size: 24rpx;
  font-weight: 400;
  color: #6c6a64;                   /* IBM 用 ink-muted */
  border-bottom: 4rpx solid transparent;
}
.tab-item--active {
  font-weight: 600;                 /* IBM 用 body-emphasis */
  color: #141413;                   /* IBM 用 ink */
  border-bottom-color: #cc785c;     /* IBM 用 primary 做下划线 */
}
```

### 3.4 页面布局模板

基于 IBM 的页面节奏，适配到刷个冯题的典型页面结构：

#### 首页布局（IBM 风格）

```
+------------------------------------------+
|  [工具栏 - 暖灰 #f0ece4 背景, 64rpx]      |
+------------------------------------------+
|  [导航栏 - 96rpx, 奶油卡片背景]             |
+------------------------------------------+
|  [Hero 区域]                              |
|    轻量标题 (Georgia 56rpx)               |
|    正文 (28rpx, letter-spacing: 0.32rpx)  |
|    [主按钮 #cc785c] [描边按钮]             |
+------------------------------------------+
|  [暖灰分隔条 #f0ece4 - 4rpx 高]           |
+------------------------------------------+
|  [工具卡片网格 - 2列]                      |
|    [功能卡片] [功能卡片]                    |
|    [功能卡片] [功能卡片]                    |
+------------------------------------------+
|  [暖灰分隔条]                              |
+------------------------------------------+
|  [学习统计区 - 奶油卡片]                    |
+------------------------------------------+
|  [CTA 横幅 - 珊瑚色 #cc785c 全宽]          |
+------------------------------------------+
|  [深色页脚 #181715]                        |
+------------------------------------------+
```

#### 刷题页面布局（IBM 风格）

```
+------------------------------------------+
|  [Tab 栏 - 全部/已完成/未完成]              |
|    底部下划线指示当前 Tab                   |
+------------------------------------------+
|  [试卷列表]                               |
|  +--------------------------------------+ |
|  | [功能卡片 - 奶油底 + hairline 边框]    | |
|  |   试卷名 (Georgia 32rpx)             | |
|  |   题数 / 难度 / 日期                  | |
|  |   [描边按钮: 开始刷题]                | |
|  +--------------------------------------+ |
|  +--------------------------------------+ |
|  | [功能卡片 - 暖灰底, 无边框]            | |
|  |   ...                                | |
|  +--------------------------------------+ |
+------------------------------------------+
```

### 3.5 WXSS 示例

#### 首页 Hero 区域

```css
.hero-section {
  padding: 96rpx 48rpx;
}
.hero-section__title {
  font-family: Georgia, serif;
  font-size: 56rpx;
  font-weight: 400;                  /* IBM 用 300，这里改为 400 */
  line-height: 1.1;
  letter-spacing: -3rpx;            /* IBM 用 -0.4px，这里改为 -3rpx */
  color: #141413;
  margin-bottom: 24rpx;
}
.hero-section__lead {
  font-size: 30rpx;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.32rpx;          /* IBM 的精密字距 */
  color: #6c6a64;
  margin-bottom: 48rpx;
}
```

#### 功能卡片（交替底色模式）

```css
.feature-card {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 2rpx solid #d4cfc6;       /* IBM 的 hairline 边框 */
  margin-bottom: 24rpx;
}
.feature-card--alt {
  background-color: #f0ece4;
  border: none;                      /* 交替底色时去掉边框 */
}
```

#### Tab 栏（IBM 的底部下划线风格）

```css
.tab-bar {
  display: flex;
  background-color: #faf9f5;
  border-bottom: 2rpx solid #d4cfc6;
  padding: 0 32rpx;
}
.tab-item {
  padding: 32rpx 40rpx;
  font-size: 24rpx;
  font-weight: 400;
  color: #6c6a64;
  position: relative;
}
.tab-item--active {
  font-weight: 600;
  color: #141413;
}
.tab-item--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 40rpx;
  right: 40rpx;
  height: 4rpx;
  background-color: #cc785c;        /* IBM 用 primary 做下划线 */
}
```

#### CTA 横幅

```css
.cta-banner {
  background-color: #cc785c;
  border-radius: 24rpx;
  padding: 96rpx 48rpx;
  margin: 48rpx 32rpx;
  text-align: center;
}
.cta-banner__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -2rpx;
  color: #faf9f5;
  margin-bottom: 24rpx;
}
.cta-banner__text {
  font-size: 28rpx;
  line-height: 1.6;
  letter-spacing: 0.32rpx;
  color: rgba(250, 249, 245, 0.8);
  margin-bottom: 48rpx;
}
```

#### 输入框（Carbon 的底部下划线模式）

```css
.carbon-input {
  background-color: #f0ece4;
  color: #141413;
  font-size: 28rpx;
  line-height: 1.6;
  letter-spacing: 0.32rpx;
  padding: 22rpx 32rpx;
  border: none;
  border-bottom: 2rpx solid #d4cfc6;
  border-radius: 8rpx 8rpx 0 0;     /* 上圆角，下直角（Carbon 风格） */
}
.carbon-input--focus {
  border-bottom-color: #cc785c;
  border-bottom-width: 4rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

IBM 方案的以下特征最适合刷个冯题的这些页面：

| 页面 | 适合的 IBM 特征 | 原因 |
|---|---|---|
| **试卷列表** | 功能卡片 + hairline 边框 + Tab 栏 | IBM 的信息密集型列表展示风格天然适合试卷管理 |
| **学习驾驶舱** | 统计数据展示 + 表面分层 | IBM 的工程感数据展示风格适合统计页面 |
| **子网计算器** | 表单输入框（底部下划线） + 结果区 | Carbon 的输入框风格适合计算类表单 |
| **记录详情** | 信息密度高 + 分层清晰 | IBM 的信息层次处理适合数据详情页 |
| **设置页面** | 表单 + toggle + 列表 | Carbon 的表单组件适合设置页 |

### 4.2 不适合页面

| 页面 | 不适合的 IBM 特征 | 原因 |
|---|---|---|
| **首页** | IBM 的冷硬工程感 | 首页需要温暖亲切感，IBM 风格过于严肃 |
| **刷题页面** | IBM 的信息密度 | 刷题需要沉浸式体验，不需要信息层次的精密处理 |
| **错题本** | IBM 的企业级视觉 | 错题本更偏向教育场景，IBM 风格过于正式 |
| **导入页面** | IBM 的表单风格 | 导入页面需要友好引导，IBM 的表单风格过于冷淡 |

### 4.3 混搭建议

IBM 方案最适合与暖奶油画布混搭的场景：

1. **信息密集页面参考 IBM 的层次处理**：用 1px hairline 边框（暖灰色调）增强奶油卡片的边界感
2. **Tab 栏参考 IBM 的底部下划线模式**：用珊瑚色 `#cc785c` 下划线替代 IBM 蓝色
3. **输入框参考 IBM 的 focus 处理**：底部下划线变色模式，不用光晕效果
4. **CTA 横幅参考 IBM 的全宽色块**：珊瑚色全宽 CTA 面板，替代 IBM 蓝色
5. **正文排版保留 IBM 的精密字距**：`letter-spacing: 0.32rpx`（对应 0.16px）增加精致感
6. **交替区域参考 IBM 的 surface-1 模式**：暖灰 `#f0ece4` 表面用于输入框底色和交替行

---

## 5. 实施检查清单

在使用 IBM 方案元素时，逐项检查：

- [ ] 画布底色是否为 `#faf9f5`（不是纯白 `#ffffff`）
- [ ] 卡片底色是否为 `#efe9de`（不是纯白）
- [ ] CTA 主色是否为 `#cc785c`（不是 `#0f62fe`）
- [ ] 标题字体是否为 Georgia 衬线（不是 IBM Plex Sans）
- [ ] 标题 weight 是否为 400（不是 300——IBM 的轻标题签名不适合暖奶油画布）
- [ ] 按钮 weight 是否为 600（不是 400）
- [ ] 标题 letter-spacing 是否为负值（-1rpx 到 -3rpx），不是 IBM 的 0 或 -0.5px
- [ ] 正文 letter-spacing 是否保留了 0.32rpx（IBM 精密细节，值得保留）
- [ ] 卡片圆角是否为 24rpx（不是 IBM 的 0px）
- [ ] 按钮圆角是否为 8rpx（不是 IBM 的 0px）
- [ ] 交替带是否为暖灰色调 `#f0ece4`（不是冷灰 `#f4f4f4`）
- [ ] 边框色是否为暖灰 `#d4cfc6`（不是冷灰 `#e0e0e0`）
- [ ] 深色面板是否为 `#181715`（不是 `#161616`）
- [ ] 是否有阴影？如果有，去掉（IBM 和暖奶油画布都拒绝阴影）
- [ ] 所有尺寸是否使用 rpx（不是 px）
- [ ] 触摸目标是否 >= 88rpx（44px）
- [ ] 语义色（成功/警告/错误）是否正确复用

---

## 6. 参考文件

| 文件 | 说明 |
|---|---|
| `.claude/skills/ibm-design.md` | IBM / Carbon 设计方案原始文件 |
| `PROJECT_HANDOFF.md` §25 | 暖奶油画布设计规范 |
| `.claude/skills/claude-design.md` | Claude Design 暖奶油画布设计语言 |
| `pages/index/index.wxss` | 首页当前样式参考 |
| `pages/index/index.wxml` | 首页当前布局参考 |
| [Carbon Design System](https://carbondesignsystem.com/) | IBM 开源设计系统文档（IBM Plex Sans 字体可从 Google Fonts 下载） |
