# MiniMax 设计方案 → 刷个冯题 实施方法论

> 参考来源：`.claude/skills/minimax-design.md`（MiniMax 官网设计系统分析）
> 适用项目：刷个冯题微信小程序（WXML + WXSS + JS，纯本地存储，无后端）
> 生成时间：2026-06-15
> 当前基础风格：Claude Design 暖奶油画布（#faf9f5 / #efe9de / #cc785c / Georgia 衬线）

---

## 1. 原方案核心提取

### 1.1 设计哲学

MiniMax 的设计语言建立在**极端对比**之上：

- **黑白锚定**：营销页面以纯白画布（#ffffff）+ 近黑文字（#0a0a0a）为基底，形成杂志级 editorial 气质
- **色彩爆发**：每个产品线拥有独立的渐变色身份卡片（M2.7 珊瑚红、Music 品红、Hailuo 深蓝、Speech 紫），像专辑封面陈列在首页
- **胶囊按钮**：所有按钮一律 `rounded-full`（9999px），这是品牌最可识别的交互元素
- **DM Sans 单字体策略**：从 80px hero 展示到 12px 微标签，全系统只用一个无衬线字体
- **扁平优先**：白色卡片靠边框分隔而非阴影，彩色卡片靠自身渐变产生深度

核心矛盾：MiniMax 是**高端 AI 基础设施品牌**，面向企业开发者和研究者；刷个冯题是**学习工具箱小程序**，面向学生和自学者。直接照搬会产生品牌调性错位。

### 1.2 视觉 DNA

| 特征 | MiniMax 实现 | 视觉效果 |
|---|---|---|
| Hero 展示 | 80px DM Sans / 600 / 行高 1.10 / 字距 -2px | 杂志封面级冲击力 |
| 胶囊按钮 | `rounded-full`（9999px）+ 11px 24px 内边距 | 统一、现代、可触达 |
| 产品卡片 | 32px 圆角 + 品牌色渐变背景 + 白色文字 | 每张卡片是一个产品"身份" |
| 文档卡片 | 16px 圆角 + 白色背景 + 1px 边框 | 安静、信息密集 |
| 色彩编码 | 每个产品线一个专属品牌色 | 视觉区分度极高 |
| 标签系统 | 胶囊形 badge（success-green / new-coral / beta-blue） | 状态一目了然 |

### 1.3 色彩策略

**主色调：**

- 画布白 `#ffffff` — 页面背景、卡片表面
- 近黑 `#0a0a0a` — 主要 CTA、标题文字、页脚
- 表面灰 `#f7f8fa` — 次级区块背景、搜索框
- 分割线 `#e5e7eb` — 1px 边框、输入框边框

**品牌色系（产品身份色）：**

- 珊瑚 `#ff5530` — M2.7 产品卡片、NEW badge、促销 CTA
- 品红 `#ea5ec1` — Music 产品卡片
- 蓝 `#1456f0` — Hailuo 产品卡片、表单聚焦
- 深蓝 `#1d4ed8` — 链接强调、代码标签
- 紫 `#a855f7` — Speech 产品卡片

**文字色阶：**

- 墨黑 `#0a0a0a` — 标题、CTA
- 炭灰 `#222222` — 正文
- 石板 `#45515e` — 次要文字、元数据
- 钢灰 `#5f5f5f` — 三级文字、表头
- 石灰 `#8e8e93` — 弱化标签
- 柔灰 `#a8aab2` — 页脚链接、禁用态

**语义色：**

- 成功背景 `#e8ffea` / 成功文字 `#1ba673`
- 错误边框 `#d45656`

### 1.4 字体策略

MiniMax 使用 **DM Sans** 单字体，全角色覆盖：

| 层级 | 字号 | 字重 | 行高 | 字距 | 用途 |
|---|---|---|---|---|---|
| hero-display | 80px | 600 | 1.10 | -2px | 首页 hero |
| display-lg | 56px | 600 | 1.10 | -1.5px | 章节大标题 |
| heading-lg | 40px | 600 | 1.20 | -1px | 子页面标题 |
| heading-md | 32px | 600 | 1.25 | -0.5px | 小节标题 |
| heading-sm | 24px | 600 | 1.30 | 0 | 卡片标题 |
| card-title | 20px | 600 | 1.40 | 产品卡标题 |
| subtitle | 18px | 500 | 1.50 | 0 | 引导正文 |
| body-md | 16px | 400 | 1.50 | 0 | 主要正文 |
| body-sm | 14px | 400 | 1.50 | 0 | 次要正文、表格 |
| caption | 13px | 400 | 1.70 | 0 | 说明文字 |
| micro | 12px | 400 | 1.50 | 0 | 微标签 |

**关键原则：**
- hero 层级必须保持 1.10 行高 + 负字距，不可妥协
- 字重阶梯：400（正文）→ 500（中等强调）→ 600（标题/按钮）→ 700（行内强强调）
- 不使用斜体，强调靠字重变化

### 1.5 布局与组件模式

**间距系统（4px 基础单位）：**

- xxs: 4px / xs: 8px / sm: 12px / md: 16px / lg: 20px / xl: 24px / xxl: 32px / xxxl: 40px
- section-sm: 48px / section: 64px / section-lg: 80px / hero: 96px

**圆角系统：**

- xs: 4px（代码标签）/ sm: 6px / md: 8px（输入框）/ lg: 12px（文档卡片）
- xl: 16px（功能卡片）/ xxl: 20px / xxxl: 24px / hero: 32px（产品卡片）
- full: 9999px（所有按钮、标签、badge）

**组件家族：**

1. **按钮**：primary（黑胶囊）、secondary（描边胶囊）、tertiary（白底胶囊）、link（文字链接）
2. **产品卡片**：coral / magenta / blue / purple / photo，32px 圆角 + 品牌色背景
3. **文档卡片**：card-base（白底 + 边框 16px）、card-feature（灰底 16px）
4. **输入框**：白底 + 1px 边框 + 8px 圆角，聚焦时 2px 蓝色边框
5. **标签页**：segmented（下划线式）、pill（胶囊式）
6. **Badge**：success（绿底）、new（珊瑚底）、beta（蓝底）、code（蓝底小标签）

---

## 2. 适配分析

### 2.1 可直接迁移

| 元素 | MiniMax 原值 | 刷个冯题直接用法 | 理由 |
|---|---|---|---|
| 胶囊按钮 | `rounded-full` + 11px 24px padding | 所有 CTA 按钮 | 微信小程序原生支持 `border-radius: 999rpx`，触控友好 |
| 间距系统 | 4px 基础，8px 递增 | 全局间距 token | rpx 等比缩放即可，结构完全复用 |
| 圆角系统 | xs~hero 8 级 | 卡片、按钮、输入框 | 微信小程序完全支持 |
| Badge 标签 | 胶囊形 + 品牌色底 | 状态标签（已完成/新题/练习中） | 视觉轻量，适配无障碍 |
| 输入框 | 白底 + 边框 + 圆角 | Markdown 导入、搜索 | 与当前设计无冲突 |
| 分割线色 | `#e5e7eb` | 列表分隔、区块边界 | 比当前暖奶油画布的分割线更中性 |
| 状态色 | success-bg/text / error-border | 答题正确/错误反馈 | 语义明确 |

### 2.2 需要改造

| 元素 | MiniMax 原值 | 需改造原因 | 改造方案 |
|---|---|---|---|
| 画布色 | `#ffffff` 纯白 | 刷个冯题使用暖奶油 `#faf9f5`，突然切纯白会破坏整体一致性 | 保留 `#faf9f5` 作为画布，MiniMax 的 `#f7f8fa` 表面灰映射为 `#efe9de` |
| 文字色 | `#0a0a0a` 近黑 | 当前使用暖墨 `#141413`，纯黑在暖底上显得生硬 | 保留 `#141413` 作为主文字色 |
| CTA 色 | `#0a0a0a` 黑色胶囊 | 黑色 CTA 在暖奶油画布上缺乏温度，与学习工具调性不符 | 替换为当前珊瑚色 `#cc785c`，保留胶囊形态 |
| 字体 | DM Sans（无衬线） | 当前使用 Georgia 衬线标题 + 系统无衬线正文，突然换字体会破坏品牌 | 保留 Georgia 标题，正文可引入 DM Sans 风格的系统无衬线 |
| hero 字号 | 80px（桌面端） | 微信小程序无 80px hero 场景，最大标题通常 40-48rpx | 等比缩放：hero → 48rpx，display-lg → 40rpx |
| 产品卡片渐变 | 品牌色渐变背景 | 刷个冯题无"产品线"概念，没有 M2.7/Music/Hailuo 这样的子品牌 | 渐变卡片降级为功能入口卡片，用单一品牌色 + 微渐变 |
| 3 列文档布局 | sidebar + prose + TOC | 微信小程序是单列竖屏，无桌面端多列场景 | 提取单列内容区的排版规范（max-width 思路转为 padding 控制） |
| 页脚 | 深色多列页脚 | 小程序无传统页脚，tabBar 替代 | 提取深色面 `#181715` 的使用场景（如深色卡片、弹窗背景） |

### 2.3 不可迁移

| 元素 | 原因 |
|---|---|
| 桌面端 1280px 容器 | 微信小程序以 750rpx 设计稿为基准，无 max-width 概念 |
| 3 列文档网格 | 小程序竖屏单列，sidebar/TOC 需用抽屉或底部弹出替代 |
| 80px hero 展示 | 移动端无需如此大的展示型标题，会挤压内容空间 |
| hover 状态 | 微信小程序无 hover 交互，只有 tap/longpress |
| 水平滚动产品矩阵 | 可用 swiper 替代，但原版的 4 列并排在小程序上不可行 |
| 品牌色编码系统 | 刷个冯题无多产品线，无法复用"每个产品一个颜色"的逻辑 |
| 桌面端 promo banner | 小程序顶部无全局 sticky banner 位置 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

将 MiniMax 色彩语义映射到刷个冯题的实际色值：

**表面色：**

| MiniMax Token | MiniMax 值 | 刷个冯题映射 | 映射值 | 用途 |
|---|---|---|---|---|
| `canvas` | `#ffffff` | 画布背景 | `#faf9f5` | 全局页面背景 |
| `surface` | `#f7f8fa` | 卡片表面 | `#efe9de` | 功能卡片、区块背景 |
| `surface-soft` | `#f2f3f5` | 次级表面 | `#e8e0d4` | 更安静的区块分隔 |
| `hairline` | `#e5e7eb` | 分割线 | `#ddd5c8` | 1px 边框、列表分隔 |
| `hairline-soft` | `#eaecf0` | 弱分割线 | `#e8e0d4` | 表格行分隔 |

**文字色：**

| MiniMax Token | MiniMax 值 | 刷个冯题映射 | 映射值 | 用途 |
|---|---|---|---|---|
| `ink` | `#0a0a0a` | 主文字 | `#141413` | 标题、CTA 文字 |
| `charcoal` | `#222222` | 正文 | `#2c2a27` | 段落正文 |
| `slate` | `#45515e` | 次要文字 | `#6c6a64` | 元数据、说明 |
| `steel` | `#5f5f5f` | 三级文字 | `#8a8780` | 表头、弱标签 |
| `stone` | `#8e8e93` | 弱化文字 | `#a5a29c` | 禁用态标签 |
| `muted` | `#a8aab2` | 极弱文字 | `#b5b2ac` | 页脚链接、占位符 |

**品牌/强调色：**

| MiniMax Token | MiniMax 值 | 刷个冯题映射 | 映射值 | 用途 |
|---|---|---|---|---|
| `brand-coral` | `#ff5530` | 主 CTA | `#cc785c` | 按钮、重要标签、进度条 |
| `brand-coral-active` | — | 按下态 | `#a9583e` | 按钮 pressed |
| `brand-blue` | `#1456f0` | 信息色 | `#5b8fd9` | 链接、信息 badge、输入聚焦 |
| `brand-blue-deep` | `#1d4ed8` | 深信息色 | `#3a6fbf` | 强调链接 |
| `brand-purple` | `#a855f7` | 辅助色 | `#9b7ec8` | 特殊标签、装饰 |

**语义色：**

| 语义 | MiniMax 值 | 刷个冯题映射 | 映射值 |
|---|---|---|---|
| 成功背景 | `#e8ffea` | 答对反馈 | `#e8f5e4` |
| 成功文字 | `#1ba673` | 答对文字 | `#3a7d3e` |
| 错误边框 | `#d45656` | 答错反馈 | `#c4504a` |
| 错误背景 | — | 答错背景 | `#fde8e8` |
| 警告 | — | 注意事项 | `#e8a838` |

**深色面（用于深色卡片、弹窗）：**

| 用途 | 色值 |
|---|---|
| 深色背景 | `#181715` |
| 深色面文字 | `#faf9f5` |
| 深色面次要文字 | `#a5a29c` |

### 3.2 字体映射（rpx）

MiniMax 使用 px（桌面端），刷个冯题使用 rpx（750 设计稿基准）。映射关系：

| 层级 | MiniMax px | 刷个冯题 rpx | 字重 | 行高 | 字距 | 用途 |
|---|---|---|---|---|---|---|
| hero-display | 80px | 48rpx | 600 | 1.20 | -1rpx | 页面大标题（仅首页） |
| display-lg | 56px | 40rpx | 600 | 1.20 | -1rpx | 模块标题 |
| heading-lg | 40px | 36rpx | 600 | 1.25 | 0 | 页面标题 |
| heading-md | 32px | 32rpx | 600 | 1.30 | 0 | 小节标题 |
| heading-sm | 24px | 28rpx | 600 | 1.35 | 0 | 卡片标题 |
| card-title | 20px | 26rpx | 600 | 1.40 | 0 | 功能卡片标题 |
| subtitle | 18px | 24rpx | 500 | 1.50 | 0 | 引导文字 |
| body-md | 16px | 28rpx | 400 | 1.60 | 0 | 主要正文 |
| body-sm | 14px | 24rpx | 400 | 1.60 | 0 | 次要正文 |
| caption | 13px | 22rpx | 400 | 1.70 | 0 | 说明文字 |
| micro | 12px | 20rpx | 400 | 1.50 | 0 | 微标签、badge |

**字体族映射：**

| 角色 | MiniMax | 刷个冯题 |
|---|---|---|
| 标题 | DM Sans 600 | Georgia 衬线 400（保持现有） |
| 正文 | DM Sans 400 | system-ui, -apple-system, sans-serif |
| 代码/标签 | system monospace | SF Mono, Menlo, monospace |

**重要约束：**
- 标题保留 Georgia 衬线 + 400 weight + -3rpx 字距（项目现有规范），不改为 DM Sans
- 正文字体使用系统无衬线，保持小程序轻量
- 字重阶梯保持：400 → 500 → 600，不使用 700（与 MiniMax 一致）

### 3.3 组件设计规范

#### 按钮

**主按钮（CTA）：**
```css
.btn-primary {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 999rpx;
  padding: 22rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.40;
  text-align: center;
  border: none;
}
.btn-primary:active {
  background: #a9583e;
}
.btn-primary.disabled {
  background: #ddd5c8;
  color: #a5a29c;
}
```

**次要按钮（描边胶囊）：**
```css
.btn-secondary {
  background: transparent;
  color: #141413;
  border-radius: 999rpx;
  padding: 22rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: 2rpx solid #141413;
}
```

**三级按钮（白底胶囊）：**
```css
.btn-tertiary {
  background: #faf9f5;
  color: #141413;
  border-radius: 999rpx;
  padding: 22rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: 2rpx solid #ddd5c8;
}
```

**文字按钮：**
```css
.btn-link {
  background: transparent;
  color: #141413;
  font-size: 24rpx;
  font-weight: 500;
  padding: 16rpx 0;
  border: none;
  text-decoration: underline;
}
```

#### 卡片

**功能卡片（对应 MiniMax card-base）：**
```css
.card-base {
  background: #efe9de;
  border-radius: 32rpx;
  padding: 40rpx;
  border: none; /* 暖色卡片无需边框，靠色块对比 */
}
```

**安静卡片（对应 MiniMax card-feature）：**
```css
.card-quiet {
  background: #faf9f5;
  border-radius: 24rpx;
  padding: 32rpx;
  border: 2rpx solid #ddd5c8;
}
```

**深色卡片（对应 MiniMax footer-region）：**
```css
.card-dark {
  background: #181715;
  color: #faf9f5;
  border-radius: 32rpx;
  padding: 40rpx;
}
```

**功能入口卡片（对应 MiniMax product-card，简化版）：**
```css
.card-feature-entry {
  background: linear-gradient(135deg, #cc785c 0%, #e8a088 100%);
  color: #faf9f5;
  border-radius: 32rpx;
  padding: 40rpx;
}
```

#### 输入框

```css
.input-field {
  background: #faf9f5;
  color: #141413;
  border: 2rpx solid #ddd5c8;
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  font-size: 28rpx;
  height: 88rpx;
}
.input-field:focus {
  border-color: #5b8fd9;
  border-width: 3rpx;
}
.input-field.error {
  border-color: #c4504a;
}
```

#### Badge 标签

```css
.badge-success {
  background: #e8f5e4;
  color: #3a7d3e;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 999rpx;
  padding: 6rpx 20rpx;
}
.badge-new {
  background: #cc785c;
  color: #faf9f5;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 999rpx;
  padding: 6rpx 20rpx;
}
.badge-info {
  background: #dce8f5;
  color: #3a6fbf;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 999rpx;
  padding: 6rpx 20rpx;
}
```

#### 标签页（胶囊式）

```css
.pill-tab {
  background: #faf9f5;
  color: #8a8780;
  font-size: 24rpx;
  font-weight: 500;
  border-radius: 999rpx;
  padding: 12rpx 28rpx;
  border: 2rpx solid #ddd5c8;
}
.pill-tab.active {
  background: #cc785c;
  color: #faf9f5;
  border-color: #cc785c;
}
```

### 3.4 页面布局模板

**模板 A：工具列表页（首页、模块选择）**
```
┌─────────────────────────┐
│  页面标题（heading-lg）    │  ← 36rpx Georgia 400
│  副标题（subtitle）       │  ← 24rpx sans 500
│                         │
│  ┌───────────────────┐  │
│  │  功能入口卡片 A     │  │  ← card-feature-entry（渐变底）
│  │  标题 + 描述       │  │     32rpx 圆角
│  └───────────────────┘  │
│                         │
│  ┌─────────┐ ┌─────────┐│
│  │ 功能卡片B │ │ 功能卡片C ││  ← card-base（奶油底）
│  │ 标题     │ │ 标题     ││     32rpx 圆角，两列网格
│  └─────────┘ └─────────┘│
│                         │
│  ┌───────────────────┐  │
│  │  深色卡片（统计）    │  │  ← card-dark
│  │  数字 + 标签        │  │
│  └───────────────────┘  │
│                         │
│  [主按钮 CTA]           │  ← btn-primary（胶囊）
└─────────────────────────┘
  padding: 40rpx 左右
  卡片间距: 24rpx
```

**模板 B：内容阅读页（刷题、详情）**
```
┌─────────────────────────┐
│  ← 返回   页面标题        │  ← heading-md 32rpx
│─────────────────────────│
│                         │
│  进度条（珊瑚色）          │  ← background: #cc785c
│  3 / 20 题               │  ← caption 22rpx
│                         │
│  ┌───────────────────┐  │
│  │  题目内容卡片       │  │  ← card-base
│  │  body-md 正文       │  │     28rpx 行高 1.60
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │  选项 A            │  │  ← pill-tab 风格
│  │  选项 B            │  │     未选: 奶油底 + 边框
│  │  选项 C            │  │     已选: 珊瑚底
│  │  选项 D            │  │     正确: 绿底
│  └───────────────────┘  │     错误: 红底
│                         │
│  [上一题]  [下一题]       │  ← btn-tertiary + btn-primary
└─────────────────────────┘
  padding: 32rpx 左右
  卡片间距: 20rpx
```

**模板 C：结果/统计页**
```
┌─────────────────────────┐
│  大数字展示               │  ← 64rpx Georgia 400
│  得分 / 完成率            │     hero-display 缩小版
│                         │
│  ┌───────────────────┐  │
│  │  深色统计卡片       │  │  ← card-dark
│  │  正确率  错题数 用时  │  │     3 组数字 + 标签
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │  7 天趋势条形图     │  │  ← card-base + 纯 CSS 条形
│  │  ▓▓▓▓░░░          │  │
│  └───────────────────┘  │
│                         │
│  [查看错题]  [再来一轮]   │  ← btn-secondary + btn-primary
└─────────────────────────┘
```

### 3.5 WXSS 示例

**全局变量定义（app.wxss）：**
```css
page {
  /* 表面色 */
  --color-canvas: #faf9f5;
  --color-surface: #efe9de;
  --color-surface-soft: #e8e0d4;
  --color-hairline: #ddd5c8;
  --color-hairline-soft: #e8e0d4;

  /* 文字色 */
  --color-ink: #141413;
  --color-charcoal: #2c2a27;
  --color-slate: #6c6a64;
  --color-steel: #8a8780;
  --color-stone: #a5a29c;
  --color-muted: #b5b2ac;

  /* 品牌色 */
  --color-primary: #cc785c;
  --color-primary-active: #a9583e;
  --color-info: #5b8fd9;
  --color-info-deep: #3a6fbf;

  /* 语义色 */
  --color-success-bg: #e8f5e4;
  --color-success-text: #3a7d3e;
  --color-error-bg: #fde8e8;
  --color-error-text: #c4504a;

  /* 深色面 */
  --color-dark: #181715;
  --color-on-dark: #faf9f5;

  /* 圆角 */
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 999rpx;

  /* 间距 */
  --space-xs: 8rpx;
  --space-sm: 12rpx;
  --space-md: 16rpx;
  --space-lg: 24rpx;
  --space-xl: 32rpx;
  --space-xxl: 48rpx;

  /* 字体 */
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Menlo, monospace;

  /* 页面背景 */
  background: var(--color-canvas);
}
```

**功能入口卡片 WXSS 示例：**
```css
.feature-card-hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, #e8a088 100%);
  color: var(--color-on-dark);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}
.feature-card-hero .card-title {
  font-family: var(--font-serif);
  font-size: 36rpx;
  font-weight: 400;
  letter-spacing: -1rpx;
  line-height: 1.25;
  margin-bottom: var(--space-xs);
}
.feature-card-hero .card-desc {
  font-family: var(--font-sans);
  font-size: 24rpx;
  font-weight: 400;
  opacity: 0.85;
  line-height: 1.50;
}
```

**刷题选项按钮 WXSS 示例：**
```css
.option-btn {
  background: var(--color-canvas);
  color: var(--color-ink);
  border-radius: var(--radius-full);
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: 2rpx solid var(--color-hairline);
  margin-bottom: var(--space-sm);
  text-align: left;
}
.option-btn.selected {
  background: var(--color-primary);
  color: var(--color-on-dark);
  border-color: var(--color-primary);
}
.option-btn.correct {
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-color: var(--color-success-text);
}
.option-btn.wrong {
  background: var(--color-error-bg);
  color: var(--color-error-text);
  border-color: var(--color-error-text);
}
```

**深色统计卡片 WXSS 示例：**
```css
.stat-card-dark {
  background: var(--color-dark);
  color: var(--color-on-dark);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--space-lg);
}
.stat-item .stat-number {
  font-family: var(--font-serif);
  font-size: 48rpx;
  font-weight: 400;
  letter-spacing: -1rpx;
  text-align: center;
}
.stat-item .stat-label {
  font-size: 22rpx;
  font-weight: 400;
  color: var(--color-stone);
  text-align: center;
  margin-top: var(--space-xs);
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 理由 | 重点借鉴 |
|---|---|---|
| 首页工具列表 | 功能入口卡片天然适配 MiniMax 的产品卡片形态 | 渐变入口卡片 + 胶囊按钮 + 深色统计卡 |
| 刷题选项页 | 胶囊形选项按钮比普通列表更触控友好 | pill-tab 选项态 + 正确/错误语义色 |
| 结果页 | 大数字展示 + 统计卡片与 MiniMax testimonial-stat-row 同构 | hero 数字 + 深色统计面 + 胶囊 CTA |
| 学习驾驶舱 | 数据密集页面，MiniMax 的文档/表格风格可复用 | 表格卡片 + badge 状态 + 分割线系统 |
| 模块介绍页 | 每个工具模块可用独立品牌色卡片展示 | product-card 风格的模块入口 |

### 4.2 不适合页面

| 页面 | 理由 |
|---|---|
| Markdown 导入页 | 纯功能页面，不需要视觉冲击，简洁表单即可 |
| 错题详情页 | 内容密集，应以可读性优先，避免装饰干扰 |
| 设置页 | 标准表单页面，MiniMax 的设计语言过于"营销" |

### 4.3 混搭建议

**保持现有 Claude Design 的部分：**
- 页面背景 `#faf9f5`（暖奶油）— 不改为纯白
- 标题 Georgia 衬线 400 weight -3rpx — 不改为 DM Sans
- 零阴影策略 — 色块对比表达深度

**从 MiniMax 引入的部分：**
- 胶囊按钮系统 — 统一所有 CTA 为 `rounded-full`
- Badge 标签系统 — 状态标签统一为胶囊形
- 间距 token 化 — 4px 基础单位 + 语义化 token 名
- 深色统计卡片 — 用于数据展示场景
- 功能入口卡片渐变 — 用于首页突出核心功能

**渐进式引入路径：**
1. 第一阶段：全局按钮改为胶囊形 + 间距 token 化（影响范围小，视觉提升大）
2. 第二阶段：首页卡片改为渐变入口卡 + 深色统计卡（首页视觉升级）
3. 第三阶段：刷题页面选项改为胶囊形 + 语义色反馈（交互体验提升）
4. 第四阶段：Badge 系统 + 表格卡片规范化（细节打磨）

---

## 5. 实施检查清单

- [ ] **全局变量**：在 `app.wxss` 中定义所有 CSS 变量（色彩、圆角、间距、字体）
- [ ] **按钮统一**：所有页面的 CTA 按钮改为胶囊形 `border-radius: 999rpx`
- [ ] **间距 token**：将硬编码的 margin/padding 替换为 CSS 变量引用
- [ ] **首页入口卡**：至少 1 个核心功能使用渐变入口卡片
- [ ] **深色统计卡**：学习驾驶舱或结果页使用 `#181715` 深色面
- [ ] **Badge 标签**：在试卷列表或记录页引入胶囊形状态标签
- [ ] **刷题选项**：选项按钮改为胶囊形 + 语义色（正确绿/错误红）
- [ ] **输入框**：导入页和搜索框使用统一的输入框样式
- [ ] **标签页**：如有分类切换，使用胶囊式 pill-tab
- [ ] **测试验证**：确保所有现有 218 个测试用例仍然通过
- [ ] **视觉一致性**：检查暖奶油底 + 珊瑚 CTA + Georgia 标题的整体协调性
- [ ] **触控测试**：所有按钮最小高度 88rpx（44px），最小宽度 88rpx

---

## 6. 参考文件

| 文件 | 用途 |
|---|---|
| `.claude/skills/minimax-design.md` | MiniMax 设计系统原始分析（本方法论的数据来源） |
| `PROJECT_HANDOFF.md` | 项目交接文档（当前进度、技术约束、已有设计规范） |
| `CLAUDE.md` | 项目指令（技能路由、设计风格约束、开发工作流） |
| `app.wxss` | 全局样式（CSS 变量定义位置） |
| `pages/index/index.wxss` | 首页样式（功能入口卡片实施位置） |
| `pages/quiz-engine/quiz-engine.wxss` | 刷题页样式（选项按钮改造位置） |
| `pages/result/result.wxss` | 结果页样式（深色统计卡实施位置） |
