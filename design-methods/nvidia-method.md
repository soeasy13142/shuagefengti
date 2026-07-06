# NVIDIA 设计方案 → 刷个冯题 实施方法论

> **参考来源**: `.claude/skills/nvidia-design.md`（NVIDIA 官网设计系统分析，覆盖 tr-tr homepage / healthcare-life-sciences / ai solutions / ai foundry 四个页面）
> **适用项目**: 刷个冯题 微信小程序（WXML + WXSS + JS，纯本地存储，rpx 单位）
> **生成时间**: 2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

NVIDIA 的设计系统如同一份学会了平面设计的工程文档。核心理念：

- **单色极致主义**：整个系统只有一种强调色——NVIDIA Green `#76b900`，承载所有 CTA、激活态、装饰方块。其余全部是黑白灰。
- **双模态表面架构**：深黑 canvas 用于 hero/footer 章节，纯白 canvas 用于正文内容，交替出现形成可预测的页面节奏。
- **工程级几何**：所有元素 `rounded.sm`（2px）圆角——刚好消除锯齿感，但绝不柔和。没有胶囊按钮，没有圆角卡片。
- **密度即品质**：信息密度极高，多列技术网格堆叠 6-10 张卡片，靠 hairline 边框分隔，不靠装饰性留白。
- **字重即层级**：层级几乎完全由字号和字重（400 vs 700）建立，不依赖色彩渐变。

### 1.2 视觉 DNA

| 特征 | NVIDIA 实现 | 刷个冯题适配难度 |
|---|---|---|
| 单强调色系统 | `#76b900` 绿色承载一切交互 | 低（替换为珊瑚色 `#cc785c`） |
| 黑白双模态表面 | `#000000` hero / `#ffffff` body | 中（需替换为 `#181715` / `#faf9f5`） |
| 2px 极小圆角 | 所有交互元素 `2px` | 高（与暖奶油 24rpx 圆角冲突） |
| 角落方块装饰 | 12px 绿色方块在卡片角落 | 低（可直接迁移为珊瑚色方块） |
| 零阴影平面 | 卡片仅 hairline 边框，无阴影 | 低（与暖奶油画布一致） |
| 信息密度网格 | 4 列卡片 + 密集 footer | 中（小程序屏幕限制列数） |
| NVIDIA-EMEA 字体 | 400/700 双字重 sans-serif | 低（用系统字体替代） |

### 1.3 色彩策略

NVIDIA 使用 **极简直色系统**，只有黑/白/灰/绿：

- **强调色**: `#76b900`（NVIDIA Green），唯一品牌色，用于所有 CTA 和激活态
- **强调色按下**: `#5a8d00`（更深一档绿色）
- **深色面**: `#000000`（纯黑），hero / footer / 导航
- **浅色面**: `#ffffff`（纯白），正文内容区
- **软表面**: `#f7f7f7`，面包屑、子导航
- **边框**: `#cccccc`（hairline）/ `#5e5e5e`（hairline-strong）
- **文字**: `#000000`（ink）/ `#1a1a1a`（body）/ `#757575`（mute）/ `#898989`（stone）
- **编辑色**: 仅紫 `#952fc6`、黄 `#feeeb2` 用于长文编辑点缀，极其克制

**与暖奶油画布的差异**：NVIDIA 使用纯黑 `#000000` 和纯白 `#ffffff`，刷个冯题使用暖调 `#181715` 和 `#faf9f5`。NVIDIA 的绿色强调色与刷个冯题的珊瑚色气质完全不同——绿色偏冷硬科技，珊瑚色偏温暖人文。NVIDIA 系统中几乎没有彩色，而刷个冯题可以引入 Notion 风格的柔和色调。

### 1.4 字体策略

- **唯一字体**: NVIDIA-EMEA（专有 sans-serif），400 和 700 两个字重
- **层级手段**: 几乎完全靠字号 + 字重，不靠色彩区分
- **字重分布**: 700 用于标题、按钮、标签大写；400 用于正文和链接
- **行高特点**: 标题 1.25，正文 1.5-1.67，按钮 1.25
- **大写标签**: caption-md 使用 `text-transform: uppercase`，标签类文字大写处理

**与刷个冯题的差异**：NVIDIA 全 sans-serif 系统，刷个冯题 Georgia 衬线标题。NVIDIA 用 700 字重建立强对比，刷个冯题用 400 Georgia 的自然衬线气质。NVIDIA 的 uppercase 标签风格偏工程化，与刷个冯题的温和调性不符，建议改为常规大小写。

### 1.5 布局与组件模式

- **双模态页面节奏**：深黑 hero → 白色内容区 → 深黑 CTA strip → 白色内容区 → 深黑 footer
- **信息密度网格**：4 列产品卡片 / 特性卡片，32px 间距
- **角方块装饰**：每张卡片角落固定一个 12px 绿色方块，系统唯一的装饰元素
- **hairline 边框**：所有卡片用 1px `#cccccc` 边框，零阴影
- **2px 圆角**：所有按钮、卡片、输入框统一 2px，极致锐利
- **44px 触控目标**：所有交互元素保证 ≥44px 高度
- **紧凑间距**：基础单位 8px，section 间距 64px

---

## 2. 适配分析

### 2.1 可直接迁移

| 元素 | 迁移方式 | 说明 |
|---|---|---|
| 角方块装饰 | 12rpx 珊瑚色方块 | 系统最有辨识度的装饰元素，可直接迁移 |
| 零阴影平面 | 直接采用 | 与暖奶油画布规范完全一致 |
| hairline 边框卡片 | `1px solid` 边框 | 与暖奶油画布一致 |
| 44rpx 最小触控目标 | 直接采用 | 小程序无障碍最佳实践 |
| 双模态表面切换 | 深色/浅色区域交替 | 适合首页模块化布局 |
| 信息密度网格 | 2 列（小程序适配） | 保留紧凑感，列数从 4 降为 2 |
| 按钮字重 700 | 适配为 `font-weight: 700` | 比 Georgia 400 更适合按钮 |
| 密集 footer 链接 | 用 tabBar + 页面内链接替代 | 信息组织方式可迁移 |

### 2.2 需要改造

| 原方案 | 改造方案 | 原因 |
|---|---|---|
| 绿色强调色 `#76b900` | 替换为珊瑚色 `#cc785c` | 保持刷个冯题品牌一致 |
| 纯黑深色面 `#000000` | 替换为暖黑 `#181715` | 项目深色面规范，暖调更舒适 |
| 纯白画布 `#ffffff` | 替换为暖奶油 `#faf9f5` | 项目设计规范 |
| 2px 圆角 | 提升至 `8rpx`~`16rpx` | 2px 在小程序上过于锐利，暖奶油风格需柔和 |
| NVIDIA-EMEA 字体 | Georgia 标题 + 系统字体正文 | 项目字体规范 |
| 48px hero display | 缩小至 `64rpx`~`72rpx` | 小程序屏幕限制 |
| uppercase 标签 | 改为常规大小写 | 与暖奶油温和调性不符 |
| 6 列 footer | 用 tabBar + 设置页替代 | 小程序无传统 footer |

### 2.3 不可迁移

| 元素 | 原因 |
|---|---|
| hero 全幅摄影/3D 渲染背景 | 小程序图片处理能力有限，且与暖奶油风格冲突 |
| 4 列产品卡片网格 | 小程序屏幕宽度不够，最多 2 列 |
| sticky 导航栏 | 小程序有原生导航栏，不可自定义 sticky 行为 |
| 60/40 双栏长文布局 | 小程序屏幕窄，双栏文字可读性差 |
| 16:9 hero 图片裁切 | 小程序图片组件行为不同 |
| hover 状态 | 微信小程序无 hover 事件 |
| 5px 阴影（唯一允许的阴影） | 暖奶油画布规范为零阴影 |
| Font Awesome 图标 | 小程序不支持 Font Awesome，用 iconfont 或 emoji |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| NVIDIA 原色 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#76b900`（NVIDIA Green） | `#cc785c`（珊瑚 CTA） | 主按钮、激活态、角方块 |
| `#5a8d00`（Green Dark） | `#a9583e`（珊瑚 Active） | 按钮按下态 |
| `#000000`（纯黑） | `#181715`（暖黑深色面） | hero 区域、深色区块 |
| `#1a1a1a`（surface-elevated） | `#2a2825`（稍浅暖黑） | 深色面内嵌套面板 |
| `#ffffff`（纯白画布） | `#faf9f5`（暖奶油画布） | 页面背景 |
| `#f7f7f7`（soft surface） | `#efe9de`（奶油卡片） | 卡片、区块背景 |
| `#cccccc`（hairline） | `#e5e3df`（暖调 hairline） | 卡片边框、分割线 |
| `#5e5e5e`（hairline-strong） | `#c8c4be`（强边框） | 深色面内边框、输入框边框 |
| `#000000`（ink 文字） | `#141413`（暖墨） | 标题、正文 |
| `#1a1a1a`（body 文字） | `#141413`（暖墨） | 正文段落 |
| `#757575`（mute） | `#6c6a64`（次要文字） | 辅助文字、元数据 |
| `#898989`（stone） | `#9e9b94`（更浅辅助） | 禁用态、最低优先级 |
| `#a7a7a7`（ash） | `#b5b2ac`（最浅灰） | 禁用图标 |
| `#ffffff`（on-dark） | `#faf9f5`（暖奶文字） | 深色面文字 |
| `rgba(255,255,255,0.7)`（on-dark-mute） | `rgba(250,249,245,0.7)` | 深色面次要文字 |
| `#0046a4`（link-blue） | `#cc785c`（珊瑚色） | 行内链接（统一用主色） |
| `#e52020`（error） | `#e03131`（错误红） | 验证错误 |
| `#df6500`（warning） | `#dd5b00`（警告橙） | 警告提示 |
| `#3f8500`（success-deep） | `#1aae39`（成功绿） | 成功确认 |
| `#952fc6`（accent-purple） | `#e6e0f5`（lavender tint） | 编辑点缀（柔化处理） |
| `#feeeb2`（accent-yellow-pale） | `#fef7d6`（yellow tint） | 提示/高亮区块 |

### 3.2 字体映射（rpx）

| NVIDIA 规格 | 刷个冯题 rpx 映射 | 用途 |
|---|---|---|
| display-xl: 48px/700 | `font-size: 64rpx; font-weight: 400; letter-spacing: -3rpx`（Georgia） | 页面大标题 |
| display-lg: 36px/700 | `font-size: 52rpx; font-weight: 400; letter-spacing: -3rpx`（Georgia） | 区块大标题 |
| heading-xl: 24px/700 | `font-size: 36rpx; font-weight: 400; letter-spacing: -2rpx`（Georgia） | 章节标题 |
| heading-lg: 22px/400 | `font-size: 32rpx; font-weight: 400`（Georgia） | 长文引导段落 |
| heading-md: 20px/700 | `font-size: 32rpx; font-weight: 500`（系统字体） | 卡片组标题 |
| heading-sm: 18px/700 | `font-size: 28rpx; font-weight: 500`（系统字体） | 小节标题 |
| card-title: 17px/700 | `font-size: 28rpx; font-weight: 600`（系统字体） | 卡片标题 |
| body-md: 16px/400 | `font-size: 28rpx; font-weight: 400`（系统字体） | 正文 |
| body-strong: 16px/700 | `font-size: 28rpx; font-weight: 600`（系统字体） | 正文强调 |
| body-sm: 15px/400 | `font-size: 26rpx; font-weight: 400`（系统字体） | 卡片描述 |
| button-lg: 18px/700 | `font-size: 32rpx; font-weight: 600`（系统字体） | 大按钮 |
| button-md: 16px/700 | `font-size: 28rpx; font-weight: 600`（系统字体） | 标准按钮 |
| button-sm: 14.4px/700 | `font-size: 26rpx; font-weight: 600`（系统字体） | 小按钮/Tab |
| caption-md: 14px/700 uppercase | `font-size: 24rpx; font-weight: 600`（系统字体，常规大小写） | 标签、分类标识 |
| caption-sm: 12px/400 | `font-size: 22rpx; font-weight: 400`（系统字体） | 脚注、元数据 |
| caption-xs: 11px/700 | `font-size: 20rpx; font-weight: 600`（系统字体） | 最小标签 |

**说明**：NVIDIA 全系统使用 sans-serif 700 字重，刷个冯题 Georgia 标题用 400。NVIDIA 的 700 标题视觉重量约等于 Georgia 400 衬线，因此 Georgia 标题保持 400。按钮和标签使用系统字体 600。NVIDIA 的 `text-transform: uppercase` 标签风格不迁移，改为常规大小写。

### 3.3 组件设计规范

#### 按钮

| 组件 | 规格 |
|---|---|
| 主按钮（CTA） | `background: #cc785c; color: #faf9f5; border-radius: 8rpx; padding: 22rpx 48rpx; font-size: 28rpx; font-weight: 600; height: 88rpx` |
| 主按钮按下 | `background: #a9583e` |
| 轮廓按钮 | `background: transparent; color: #cc785c; border: 4rpx solid #cc785c; border-radius: 8rpx; padding: 22rpx 26rpx` |
| 轮廓按钮（深色面） | `background: transparent; color: #faf9f5; border: 2rpx solid rgba(250,249,245,0.7); border-radius: 8rpx` |
| 箭头链接 | `color: #cc785c; font-size: 28rpx; font-weight: 600; padding: 0` + 右箭头 `→` |
| 禁用按钮 | `background: #efe9de; color: #b5b2ac; border-radius: 8rpx` |

#### Tab 切换

| 组件 | 规格 |
|---|---|
| Tab 默认 | `background: transparent; color: #141413; font-size: 26rpx; font-weight: 600; border-radius: 8rpx; padding: 20rpx 36rpx` |
| Tab 选中 | `background: #141413; color: #faf9f5`（反色切换，NVIDIA 特色） |

#### 卡片

| 组件 | 规格 |
|---|---|
| 产品卡片 | `background: #faf9f5; border: 2rpx solid #e5e3df; border-radius: 8rpx; padding: 48rpx` + 左上角 `12rpx` 珊瑚色方块 |
| 特性卡片 | `background: #faf9f5; border: 2rpx solid #e5e3df; border-radius: 8rpx; padding: 64rpx` + 左上角角方块 |
| 资源卡片 | `background: #faf9f5; border: 2rpx solid #e5e3df; border-radius: 8rpx; padding: 48rpx` + 顶部标签 + 底部箭头链接 |
| 统计卡片 | `background: #faf9f5; border: 2rpx solid #e5e3df; border-radius: 8rpx; padding: 64rpx`，大数字用 `52rpx 700` 珊瑚色 |
| 深色 hero 卡片 | `background: #181715; color: #faf9f5; border-radius: 0; padding: 160rpx 96rpx` |
| 深色 CTA 条 | `background: #181715; color: #faf9f5; border-radius: 0; padding: 128rpx 96rpx` |

#### 角方块装饰

| 组件 | 规格 |
|---|---|
| 角方块 | `width: 24rpx; height: 24rpx; background: #cc785c; border-radius: 0`（NVIDIA 签名装饰元素） |
| 位置 | 锚定在卡片左上角或右下角，尺寸和颜色恒定 |

#### 输入框

| 组件 | 规格 |
|---|---|
| 文本输入 | `background: #faf9f5; color: #141413; border: 2rpx solid #e5e3df; border-radius: 8rpx; padding: 24rpx 32rpx; height: 88rpx; font-size: 28rpx` |
| 输入聚焦 | `border: 4rpx solid #cc785c`（绿色边框 → 珊瑚色边框，唯一的聚焦信号） |

#### 标签 Badge

| 组件 | 规格 |
|---|---|
| 分类标签 | `background: #efe9de; color: #141413; font-size: 24rpx; font-weight: 600; border-radius: 8rpx; padding: 8rpx 20rpx` |

#### 导航

| 组件 | 规格 |
|---|---|
| 深色导航栏 | `background: #181715; color: #faf9f5; height: 128rpx`（小程序自定义导航栏） |
| 面包屑 | `background: #efe9de; color: #141413; height: 96rpx; font-size: 24rpx; font-weight: 600` |

### 3.4 页面布局模板

#### 首页布局（NVIDIA 双模态节奏）

```
┌─────────────────────────────┐
│        深色 hero 区域        │  ← 背景 #181715
│                             │
│  "刷个冯题"                  │  ← Georgia 64rpx #faf9f5 左对齐
│  "工程级刷题系统"             │  ← 系统字体 32rpx #faf9f5
│                             │
│  [ 开始刷题 ]                │  ← 珊瑚色主按钮（唯一 CTA）
│  [ 查看错题 → ]              │  ← 箭头链接
│                             │
│  ┌─────────────────────────┐│
│  │ ▊ 今日推荐题目           ││  ← 深色面内嵌卡片
│  │   Q1  Q2  Q3            ││     左上角角方块
│  └─────────────────────────┘│
└─────────────────────────────┘

┌─────────────────────────────┐
│  科目选择                    │  ← Georgia 48rpx
│                             │
│  ┌─────┐ ┌─────┐           │  ← 2 列网格（小程序适配）
│  │▊语文│ │▊数学│            │     每张卡片左上角角方块
│  │120题│ │85题 │            │     hairline 边框
│  └─────┘ └─────┘           │
│  ┌─────┐ ┌─────┐           │
│  │▊英语│ │▊历史│            │
│  │96题 │ │64题 │            │
│  └─────┘ └─────┘           │
└─────────────────────────────┘

┌─────────────────────────────┐
│  ┌─ 深色 CTA 条 ──────────┐ │  ← #181715 全宽
│  │ "准备好挑战了吗？"       │ │     Georgia 48rpx #faf9f5
│  │ [ 立即开始 ]             │ │     珊瑚色按钮
│  └────────────────────────┘ │
└─────────────────────────────┘

┌─────────────────────────────┐
│  学习统计                    │  ← Georgia 48rpx
│                             │
│  ┌──────┐ ┌──────┐         │  ← 统计卡片
│  │ ▊42  │ │ ▊78% │         │     大数字珊瑚色
│  │已刷题│ │正确率│          │     底部描述文字
│  └──────┘ └──────┘         │
└─────────────────────────────┘
```

#### 列表页布局

```
┌─────────────────────────────┐
│ [全部] [语文] [数学] [英语]  │  ← Tab 反色切换（NVIDIA 特色）
│                             │
│ ┌───────────────────────────┐│
│ │ ▊ 选择题 · 中等           ││  ← 左上角角方块 + 分类标签
│ │                           ││
│ │ 题目内容预览文字...        ││  ← hairline 边框卡片
│ │                           ││
│ │ 查看详情 →                ││  ← 珊瑚色箭头链接
│ └───────────────────────────┘│
│ ┌───────────────────────────┐│
│ │ ▊ 填空题 · 简单           ││
│ │ ...                       ││
│ │ 查看详情 →                ││
│ └───────────────────────────┘│
└─────────────────────────────┘
```

### 3.5 WXSS 示例

```css
/* === NVIDIA 风格基础变量（暖奶油适配版） === */
page {
  --canvas: #faf9f5;           /* 暖奶油画布（替代 NVIDIA 纯白） */
  --surface: #efe9de;          /* 奶油卡片（替代 NVIDIA #f7f7f7） */
  --primary: #cc785c;          /* 珊瑚 CTA（替代 NVIDIA Green） */
  --primary-active: #a9583e;   /* 珊瑚按下态 */
  --ink: #141413;              /* 暖墨主文字 */
  --body: #141413;             /* 正文 */
  --mute: #6c6a64;             /* 辅助文字 */
  --stone: #9e9b94;            /* 最浅辅助 */
  --ash: #b5b2ac;              /* 禁用色 */
  --hairline: #e5e3df;         /* 暖调边框（替代 NVIDIA #cccccc） */
  --hairline-strong: #c8c4be;  /* 强边框 */
  --dark-surface: #181715;     /* 暖黑深色面（替代 NVIDIA 纯黑） */
  --dark-elevated: #2a2825;    /* 深色面内嵌套 */
  --on-dark: #faf9f5;          /* 深色面文字 */
  --on-dark-mute: rgba(250, 249, 245, 0.7);
  --error: #e03131;
  --warning: #dd5b00;
  --success: #1aae39;
}

/* === NVIDIA 风格角方块（签名装饰元素） === */
.corner-square {
  position: absolute;
  top: 0;
  left: 0;
  width: 24rpx;                /* 12px → 24rpx */
  height: 24rpx;
  background-color: var(--primary);
  border-radius: 0;            /* NVIDIA 特色：绝对方正 */
}

/* === 卡片（NVIDIA 极简平面） === */
.card {
  position: relative;          /* 为角方块定位 */
  background-color: var(--canvas);
  border: 2rpx solid var(--hairline);
  border-radius: 8rpx;         /* 2px → 8rpx（暖奶油适配，比 NVIDIA 原版柔和） */
  padding: 48rpx;
  /* 零阴影 — 与 NVIDIA 原方案和暖奶油画布一致 */
}

.card-feature {
  padding: 64rpx;
  /* 同 card，更大内边距 */
}

.card-stat {
  padding: 64rpx;
  text-align: center;
}
.card-stat .stat-number {
  font-size: 52rpx;
  font-weight: 400;            /* Georgia 400 */
  color: var(--primary);       /* 大数字用珊瑚色，NVIDIA 用绿色 */
  font-family: Georgia, serif;
}
.card-stat .stat-label {
  font-size: 28rpx;
  font-weight: 400;
  color: var(--mute);
  margin-top: 8rpx;
}

/* === 深色 hero 区域（NVIDIA 双模态核心） === */
.hero-dark {
  background-color: var(--dark-surface);
  padding: 160rpx 96rpx 128rpx;
  /* 左对齐（NVIDIA 特色，区别于 Notion 居中） */
}
.hero-dark .hero-title {
  color: var(--on-dark);
  font-family: Georgia, serif;
  font-size: 64rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  line-height: 1.25;
}
.hero-dark .hero-subtitle {
  color: var(--on-dark-mute);
  font-size: 32rpx;
  margin-top: 16rpx;
}

/* === 深色 CTA 条（NVIDIA 章节桥接） === */
.cta-dark {
  background-color: var(--dark-surface);
  padding: 128rpx 96rpx;
  text-align: left;            /* NVIDIA 左对齐 */
}
.cta-dark .cta-title {
  color: var(--on-dark);
  font-family: Georgia, serif;
  font-size: 48rpx;
  font-weight: 400;
  letter-spacing: -2rpx;
}

/* === 按钮（NVIDIA 700 字重 + 8rpx 圆角） === */
.btn-primary {
  background-color: var(--primary);
  color: var(--on-dark);
  border-radius: 8rpx;
  padding: 22rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  height: 88rpx;
  border: none;
}
.btn-primary:active {
  background-color: var(--primary-active);
}

.btn-outline {
  background-color: transparent;
  color: var(--primary);
  border: 4rpx solid var(--primary);
  border-radius: 8rpx;
  padding: 22rpx 26rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-outline-on-dark {
  background-color: transparent;
  color: var(--on-dark);
  border: 2rpx solid var(--on-dark-mute);
  border-radius: 8rpx;
  padding: 22rpx 26rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-arrow {
  color: var(--primary);
  font-size: 28rpx;
  font-weight: 600;
  padding: 0;
  background: none;
  border: none;
}
.btn-arrow::after {
  content: " →";
}

/* === Tab 反色切换（NVIDIA 特色） === */
.tab-group {
  display: flex;
  gap: 8rpx;
  padding: 16rpx 0;
}
.tab {
  padding: 20rpx 36rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--ink);
  background: transparent;
}
.tab.active {
  background-color: var(--ink);
  color: var(--on-dark);
  /* NVIDIA 特色：反色切换，不是下划线 */
}

/* === 标签 Badge === */
.badge {
  display: inline-block;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 8rpx;
  padding: 8rpx 20rpx;
  background-color: var(--surface);
  color: var(--body);
  /* 注意：不使用 uppercase，与 NVIDIA 原方案不同 */
}

/* === 输入框 === */
.input {
  background-color: var(--canvas);
  color: var(--ink);
  border: 2rpx solid var(--hairline);
  border-radius: 8rpx;
  padding: 24rpx 32rpx;
  height: 88rpx;
  font-size: 28rpx;
}
.input:focus {
  border: 4rpx solid var(--primary);
  /* NVIDIA 特色：绿色（→珊瑚色）边框是唯一的聚焦信号 */
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 适配理由 |
|---|---|
| 题库首页 | NVIDIA 双模态 hero + 信息密度网格天然适合数据驱动的题目展示 |
| 学习统计页 | 统计卡片（大数字 + 角方块）是 NVIDIA 的经典组件，数据展示效果极佳 |
| 错题本 | 信息密集列表 + hairline 分隔 + 箭头链接，NVIDIA 的信息架构优势 |
| 题目详情页 | 左对齐布局 + 深色 CTA 条桥接，适合题目-答案的结构化展示 |
| 搜索结果页 | 密集卡片网格 + 标签分类 + 紧凑间距，信息密度高 |
| 设置页 | NVIDIA 式表单 + 聚焦边框，工程感强 |

### 4.2 不适合页面

| 页面 | 不适合原因 |
|---|---|
| 需要温暖氛围的页面 | NVIDIA 风格偏冷硬，暖奶油画布已修正但仍偏克制 |
| 答题页面 | 2px→8rpx 圆角过于锐利，答题需要更友好的视觉反馈 |
| 引导/教程页面 | NVIDIA 风格缺乏亲和力，不适合新手引导 |
| 社交/分享页面 | NVIDIA 系统无社交元素设计，需从其他方案补充 |

### 4.3 混搭建议

| 混搭方案 | 说明 |
|---|---|
| NVIDIA 信息密度 + Notion 柔和色调 | 用 NVIDIA 的紧凑卡片网格和角方块，但用 Notion 的 tint 背景色软化 |
| NVIDIA 双模态 + 暖奶油画布配色 | 保留深色/浅色交替节奏，但用 `#181715` / `#faf9f5` 暖调替代纯黑白 |
| NVIDIA 角方块 + 暖奶油卡片体系 | 在暖奶油 24rpx 圆角卡片上叠加 NVIDIA 角方块装饰，兼顾温暖和辨识度 |
| NVIDIA 统计卡片 + Notion 首页布局 | 首页用 Notion 居中 hero，但统计模块用 NVIDIA 大数字卡片风格 |
| NVIDIA Tab 反色 + 暖奶油整体 | Tab 切换用 NVIDIA 反色风格（`#141413` 底 + `#faf9f5` 文字），融入暖奶油页面 |

---

## 5. 实施检查清单

- [ ] 强调色已替换为 `#cc785c`（珊瑚色），未使用 NVIDIA Green `#76b900`
- [ ] 画布色已替换为 `#faf9f5`（暖奶油），未使用 NVIDIA 纯白 `#ffffff`
- [ ] 深色面已替换为 `#181715`（暖黑），未使用 NVIDIA 纯黑 `#000000`
- [ ] 标题使用 Georgia 衬线，weight 400，未使用 NVIDIA-EMEA 700
- [ ] 正文使用系统字体，weight 400/600
- [ ] 按钮圆角为 `8rpx`（比 NVIDIA 原版 2px 柔和，比暖奶油标准 16rpx 锐利）
- [ ] 卡片圆角为 `8rpx`（保留 NVIDIA 工程感，但不使用 2px 原版）
- [ ] 角方块装饰：`24rpx` 珊瑚色方块，`border-radius: 0`，锚定在卡片左上角
- [ ] 所有尺寸使用 rpx 单位，未使用 px
- [ ] 零阴影，靠 hairline 边框和色调差异表达层级
- [ ] Tab 切换使用反色风格（NVIDIA 特色），非下划线
- [ ] 深色 hero 区域使用左对齐布局（NVIDIA 特色）
- [ ] 深色 CTA 条用于模块间桥接（NVIDIA 双模态节奏）
- [ ] 标签不使用 uppercase（与暖奶油温和调性不符）
- [ ] 输入框聚焦信号为珊瑚色边框（NVIDIA 风格唯一聚焦信号）
- [ ] 无 hover 状态（小程序不支持）
- [ ] 所有交互元素最小点击区域 88rpx
- [ ] 未引入任何第三方库（Font Awesome 不迁移）
- [ ] 测试通过：`npm test`

---

## 6. 参考文件

| 文件 | 说明 |
|---|---|
| `.claude/skills/nvidia-design.md` | NVIDIA 设计系统分析原始文件 |
| `PROJECT_HANDOFF.md` §25 | Claude Design 暖奶油画布规范 |
| `.claude/skills/claude-design.md` | 当前项目设计风格参考 |
| `design-methods/notion-method.md` | Notion 实施方法论（混搭参考） |
| `.claude/skills/ui-ux-pro-max.md` | 综合 UI/UX 设计指南 |
