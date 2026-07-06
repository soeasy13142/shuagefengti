# MongoDB 设计方案 -> 刷个冯题 实施方法论

> 参考来源：`.claude/skills/mongodb-design.md`（MongoDB 官网视觉分析）
> 适用项目：刷个冯题 微信小程序（WXML + WXSS + JS，原生框架）
> 当前设计基线：Claude Design 暖奶油画布（见 PROJECT_HANDOFF.md S25）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

MongoDB 的视觉系统采用 **双模式对比** 策略：

- **深色英雄区**：深海军蓝/青色（brand-teal-deep #001e2b）作为大面积暗色背景，营造专业、技术感
- **亮色内容区**：纯白画布（#ffffff）承载文档、定价、课程等信息密集内容
- **标志性 CTA**：亮绿色药丸按钮（brand-green #00ed64）在暗色和亮色表面上均作为唯一主操作色
- **克制的点缀色**：课程分类标签使用紫/橙/粉/蓝四种强调色，仅用于信息分类编码，不用于装饰

核心理念：**用高对比暗-亮分区建立视觉层次，用单一高饱和 CTA 色引导操作，用中性色承载信息**。

### 1.2 视觉 DNA

| 特征 | MongoDB 方案 |
|---|---|
| 画布底色 | 纯白 #ffffff（亮面）/ 深青 #001e2b（暗面） |
| 卡片风格 | 白底 + 1px hairline 边框 + 12px 圆角，无阴影（扁平） |
| 按钮签名 | 药丸形（full-radius），亮绿底 + 深色文字 |
| 阴影策略 | 极度克制，仅代码模拟卡片和模态框使用阴影 |
| 间距节奏 | 4px 基础单位，8px 主增量；营销区留白豪放（120px hero padding） |
| 排版气质 | Euclid Circular A 几何无衬线，标题紧凑行距（1.10-1.25），正文宽松（1.55） |

### 1.3 色彩策略

MongoDB 使用 **品牌绿 + 深青双色锚** 系统：

**主色组**
- brand-green #00ed64 —— 主 CTA、品牌识别色
- brand-green-dark #00684a —— 链接、次级绿
- brand-green-soft #c3f0d2 —— 浅绿底（成功态、特色定价卡）

**暗色组**
- brand-teal-deep #001e2b —— 英雄区、页脚、代码块背景
- brand-teal #003d4f —— 中间调青色
- brand-teal-mid #00684a —— 英雄区平台卡片

**分类强调色（仅课程标签）**
- accent-purple #7b3ff2
- accent-orange #fa6e39
- accent-pink #f06bb8
- accent-blue #3d4f9f

**中性色阶**
- ink #001e2b / charcoal #1c2d38 / slate #3d4f5b / steel #5c6c7a / stone #7c8c9a / muted #a8b3bc
- canvas #ffffff / surface #f9fbfa / surface-soft #f4f7f6
- hairline #e1e5e8 / hairline-soft #eceff1 / hairline-strong #c1ccd6

### 1.4 字体策略

- 主字体：Euclid Circular A（几何无衬线），fallback: -apple-system, BlinkMacSystemFont, sans-serif
- 代码字体：Source Code Pro，fallback: SF Mono, Menlo, monospace
- 标题层级：72px / 56px / 48px / 36px / 28px / 22px / 18px，weight 500-600
- 正文层级：18px / 16px / 14px / 13px / 12px / 11px，weight 400-600
- 标题使用负字间距（-1.5px 到 -0.5px），正文和小字号字间距为 0
- 按钮文字：14px / 600 weight

### 1.5 布局与组件模式

**布局**
- 1280px 最大宽度，32px gutters
- 课程目录：3 列卡片网格（平板 2 列，手机 1 列）
- 定价：3 列对比卡片
- 英雄区：居中标题 + 副标题 + 按钮行 + 代码模拟卡

**组件模式**
- 药丸按钮（rounded.full）—— 所有按钮统一
- 12px 圆角卡片（rounded.lg）—— 所有卡片统一
- Pill Tab / Segmented Tab 两种导航切换
- 彩色药丸徽章（分类标签、状态标签）
- 深色 CTA Banner（页面底部行动号召区）
- 代码模拟卡片（终端风格深色块）

---

## 2. 适配分析

### 2.1 可直接迁移

| MongoDB 元素 | 迁移理由 |
|---|---|
| 卡片 + hairline 边框模式 | 刷个冯题已有类似卡片系统（#efe9de 底色 + 圆角），可叠加 hairline |
| Pill Tab 导航切换 | 适用于刷题模式切换（练习/考试）、可视化模块切换 |
| Segmented Tab 底线切换 | 适用于题目类型筛选、数据结构模式选择 |
| 彩色分类徽章 | 适用于题型标签（单选/多选/判断）、难度标签、模块分类标签 |
| 间距节奏（4px 基础，8px 增量） | 与 rpx 体系天然兼容，直接换算 |
| 药丸按钮形态 | 已有圆角按钮，可统一为 full-radius 药丸形 |
| 信息层级（标题-正文-辅助-禁用） | 四级文字色阶可直接映射到暖墨体系 |
| 代码块深色风格 | 适用于子网计算器的二进制展示、TCP 报文展示 |

### 2.2 需要改造

| MongoDB 元素 | 改造方向 |
|---|---|
| 画布纯白 #ffffff | 改为暖奶油 #faf9f5，保持温暖基调 |
| 深青英雄区 #001e2b | 改为深海军蓝 #181715（项目暗色面） |
| 亮绿 CTA #00ed64 | 改为珊瑚色 #cc785c（项目主色），按下态 #a9583e |
| Euclid Circular A 字体 | 改为 Georgia 衬线标题 + 系统无衬线正文 |
| 标题负字间距 -1.5px | 改为 -3rpx（项目签名间距） |
| 12px 卡片圆角 | 改为 24rpx（约 12px @2x，保持视觉一致） |
| 1280px 最大宽度布局 | 改为小程序全宽 750rpx 设计稿 |
| 阴影层级系统 | 改为零阴影，靠色块对比表达深度（项目规范） |
| 代码字体 Source Code Pro | 改为等宽系统字体（小程序不支持自定义字体加载） |

### 2.3 不可迁移

| MongoDB 元素 | 原因 |
|---|---|
| 大面积英雄区深色带（120px padding） | 小程序屏幕高度有限，不适用超大留白营销布局 |
| 12 列网格系统 | 小程序使用 rpx 流式布局，无 CSS Grid |
| 悬停态（hover） | 小程序无 hover 交互，仅支持 tap/longpress |
| 代码模拟卡片终端美学 | 小程序内嵌代码展示能力有限，仅能做简化版 |
| 3 列定价对比布局 | 小程序屏幕窄，需改为纵向堆叠或横向滑动 |
| 6 列页脚链接网格 | 小程序无传统页脚，改为底部 TabBar |
| CSS 变量 / Design Token 语法 | WXSS 不支持 CSS 自定义属性，需硬编码值 |
| 16:9 全出血大气插图 | 小程序图片加载策略不同，需适配 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

将 MongoDB 色彩角色映射到刷个冯题的实际色值：

| 角色 | MongoDB 色值 | 刷个冯题色值 | 用途 |
|---|---|---|---|
| 画布底色 | #ffffff | **#faf9f5** | 页面背景 |
| 卡片底色 | #ffffff + hairline | **#efe9de** | 内容卡片 |
| 暗色面 | #001e2b | **#181715** | 深色卡片、代码块、强调区 |
| 主 CTA | #00ed64 | **#cc785c** | 主按钮、重要操作 |
| CTA 按下态 | #008c34 | **#a9583e** | 按钮按下态 |
| CTA 禁用态 | hairline #e1e5e8 | **#d4cfc7** | 禁用按钮 |
| 主文字 | #001e2b | **#141413** | 标题、正文 |
| 次级文字 | #3d4f5b | **#6c6a64** | 辅助说明、时间戳 |
| 三级文字 | #5c6c7a | **#9a9890** | 占位符、禁用态文字 |
| 暗面文字 | #ffffff | **#faf9f5** | 深色卡片上的文字 |
| 暗面次要文字 | #a8b3bc | **#a8a69e** | 深色卡片上的辅助文字 |
| 边框线 | #e1e5e8 | **#e5dfd6** | 卡片边框、分割线 |
| 强边框线 | #c1ccd6 | **#ccc6ba** | 输入框聚焦边框 |
| 强调色-紫 | #7b3ff2 | **#7b3ff2** | 题型标签：数据库/安全类 |
| 强调色-橙 | #fa6e39 | **#e8874a** | 题型标签：搜索/网络类 |
| 强调色-蓝 | #3d4f9f | **#4a6fa5** | 题型标签：算法/结构类 |
| 成功底色 | #c3f0d2 | **#d4edda** | 答对提示、正确标签 |
| 警告底色 | #fff8e0 | **#fff3cd** | 错题提示、注意标签 |
| 信息底色 | #e3fcef | **#e8f0f8** | 特色卡片背景 |

### 3.2 字体映射（rpx）

MongoDB 使用 Euclid Circular A 无衬线，刷个冯题使用 Georgia 衬线标题 + 系统无衬线正文。字号从 px 换算为 rpx（1px = 2rpx @2x 基准）：

| 层级 | MongoDB | 刷个冯题 | 字号 | 字重 | 行高 | 字间距 |
|---|---|---|---|---|---|---|
| Hero 标题 | 72px / 500 / 1.10 / -1.5px | **页面大标题** | 64rpx | 400 | 1.15 | -3rpx |
| 大标题 | 56px / 500 / 1.15 / -1px | **模块标题** | 52rpx | 400 | 1.20 | -3rpx |
| 标题 1 | 48px / 500 / 1.20 / -0.5px | **区域标题** | 44rpx | 400 | 1.25 | -2rpx |
| 标题 2 | 36px / 500 / 1.25 / -0.5px | **卡片标题** | 36rpx | 400 | 1.30 | -2rpx |
| 标题 3 | 28px / 500 / 1.30 | **列表项标题** | 32rpx | 400 | 1.35 | 0 |
| 标题 4 | 22px / 500 / 1.35 | **小组标题** | 28rpx | 400 | 1.40 | 0 |
| 标题 5 | 18px / 600 / 1.40 | **强调小标题** | 28rpx | 600 | 1.40 | 0 |
| 副标题 | 18px / 400 / 1.50 | **引导文字** | 30rpx | 400 | 1.50 | 0 |
| 正文中 | 16px / 400 / 1.55 | **正文** | 28rpx | 400 | 1.60 | 0 |
| 正文小 | 14px / 400 / 1.50 | **辅助正文** | 26rpx | 400 | 1.55 | 0 |
| 正文小-中 | 14px / 500 / 1.50 | **强调辅助** | 26rpx | 500 | 1.55 | 0 |
| 标注-粗 | 13px / 600 / 1.40 | **徽章文字** | 22rpx | 600 | 1.40 | 0 |
| 微标-大写 | 11px / 600 / 1.40 / 1px | **分类标签** | 20rpx | 600 | 1.40 | 1rpx |
| 按钮 | 14px / 600 / 1.30 | **按钮文字** | 28rpx | 600 | 1.30 | 0 |
| 代码 | 14px / 400 / 1.55 | **代码/等宽** | 24rpx | 400 | 1.55 | 0 |

字体栈：
- 标题：`Georgia, 'Times New Roman', serif`
- 正文：`-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`
- 代码：`'SF Mono', Menlo, Consolas, 'Courier New', monospace`

### 3.3 组件设计规范

以下将 MongoDB 组件映射为刷个冯题 WXSS 实现规范。

#### 3.3.1 按钮

**主按钮（对应 button-primary）**
```
背景色：#cc785c
文字色：#faf9f5
字体：28rpx / 600 / Georgia
圆角：999rpx（药丸形）
内边距：20rpx 44rpx
按下态背景色：#a9583e
禁用态背景色：#d4cfc7，文字色：#9a9890
```

**次按钮（对应 button-secondary）**
```
背景色：transparent
文字色：#141413
边框：2rpx solid #ccc6ba
圆角：999rpx
内边距：20rpx 44rpx
```

**暗面主按钮（对应 button-on-dark）**
```
背景色：#cc785c
文字色：#faf9f5
圆角：999rpx
内边距：20rpx 44rpx
```

**暗面次按钮（对应 button-secondary-on-dark）**
```
背景色：transparent
文字色：#faf9f5
边框：2rpx solid #3a3832
圆角：999rpx
内边距：20rpx 44rpx
```

**幽灵按钮（对应 button-ghost）**
```
背景色：transparent
文字色：#141413
圆角：16rpx
内边距：16rpx 24rpx
```

**链接按钮（对应 button-link）**
```
背景色：transparent
文字色：#a9583e（珊瑚深色，替代 brand-green-dark）
内边距：0
无边框，下划线可选
```

#### 3.3.2 卡片

**基础卡片（对应 card-base）**
```
背景色：#efe9de
圆角：24rpx
内边距：40rpx
边框：2rpx solid #e5dfd6
无阴影
```

**功能卡片（对应 card-feature）**
```
背景色：#efe9de
圆角：24rpx
内边距：48rpx
边框：2rpx solid #e5dfd6
```

**深色卡片（对应 card-feature-dark）**
```
背景色：#181715
文字色：#faf9f5
圆角：24rpx
内边距：48rpx
无边框
```

**课程/工具卡片（对应 card-course）**
```
背景色：#efe9de
圆角：24rpx
内边距：40rpx
边框：2rpx solid #e5dfd6
顶部：分类标签徽章
标题：32rpx / Georgia / 400
描述：26rpx / 系统无衬线 / 400 / #6c6a64
```

**特色卡片（对应 pricing-card-featured，用于推荐/热门项）**
```
背景色：#e8f0f8（浅蓝信息底色）
圆角：24rpx
内边距：48rpx
边框：4rpx solid #cc785c（珊瑚色强调边框）
```

#### 3.3.3 输入框

**文本输入（对应 text-input）**
```
背景色：#faf9f5
文字色：#141413
字体：28rpx / 400
圆角：16rpx
内边距：24rpx 28rpx
边框：2rpx solid #ccc6ba
高度：88rpx
聚焦态边框：4rpx solid #a9583e
```

**搜索框（对应 search-pill）**
```
背景色：#efe9de
文字色：#9a9890
字体：28rpx / 400
圆角：16rpx
内边距：24rpx 28rpx
高度：88rpx
边框：2rpx solid #e5dfd6
```

#### 3.3.4 标签页

**Pill Tab（对应 pill-tab，适用于模式切换）**
```
未选中：背景 transparent，文字 #9a9890，边框 2rpx solid #e5dfd6，圆角 999rpx，内边距 16rpx 28rpx
选中：背景 #141413，文字 #faf9f5，边框 2rpx solid #141413
```

**Segmented Tab（对应 segmented-tab，适用于内容筛选）**
```
未选中：文字 #9a9890，底部边框 transparent
选中：文字 #a9583e，底部边框 4rpx solid #a9583e
```

#### 3.3.5 徽章与标签

**主徽章（对应 badge-green）**
```
背景色：#cc785c
文字色：#faf9f5
字体：22rpx / 600
圆角：8rpx
内边距：4rpx 16rpx
```

**浅底徽章（对应 badge-green-soft）**
```
背景色：#d4edda（成功绿底）
文字色：#2d6a3f
字体：22rpx / 600
圆角：999rpx
内边距：8rpx 20rpx
```

**分类标签-紫（对应 badge-purple）**
```
背景色：#7b3ff2
文字色：#faf9f5
字体：22rpx / 600
圆角：8rpx
内边距：4rpx 16rpx
```

**分类标签-橙（对应 badge-orange）**
```
背景色：#e8874a
文字色：#faf9f5
字体：22rpx / 600
圆角：8rpx
内边距：4rpx 16rpx
```

**分类标签-蓝（对应 accent-blue）**
```
背景色：#4a6fa5
文字色：#faf9f5
字体：22rpx / 600
圆角：8rpx
内边距：4rpx 16rpx
```

**热门/推荐标签（对应 badge-popular）**
```
背景色：#181715
文字色：#cc785c
字体：22rpx / 600
圆角：999rpx
内边距：8rpx 20rpx
```

#### 3.3.6 代码块

**代码容器（对应 code-block）**
```
背景色：#181715
文字色：#faf9f5
字体：24rpx / 'SF Mono', Menlo, monospace
圆角：16rpx
内边距：28rpx
行高：1.60
```

#### 3.3.7 分割线与边框

```
常规分割线：2rpx solid #e5dfd6
柔和分割线：2rpx solid #efe9de
强分割线：2rpx solid #ccc6ba
深色面分割线：2rpx solid #3a3832
```

### 3.4 页面布局模板

#### 3.4.1 首页/工具箱布局

借鉴 MongoDB 首页的 **英雄区 + 功能网格** 结构，适配小程序：

```
[状态栏]
[导航栏：标题 "刷个冯题" / 28rpx Georgia]
----------------------------------
[英雄区 - 暗色卡片]
  背景：#181715，圆角 24rpx，内边距 48rpx
  大标题：44rpx Georgia 400 #faf9f5，字间距 -3rpx
  副标题：28rpx 系统字体 400 #a8a69e
  主按钮：珊瑚色药丸 "开始刷题"
----------------------------------
[工具网格 - 2列]
  卡片：#efe9de 底色，24rpx 圆角
  图标 + 标题 + 简介
  分类徽章标签（紫/橙/蓝）
----------------------------------
[学习状态条]
  连续天数 / 今日做题 / 正确率
  进度条：#cc785c
----------------------------------
```

#### 3.4.2 刷题页面布局

借鉴 MongoDB 课程详情页的 **标签筛选 + 卡片列表** 结构：

```
[导航栏：试卷名称]
----------------------------------
[Pill Tab 切换]
  "练习模式" / "考试模式"
----------------------------------
[题目卡片]
  背景：#efe9de，24rpx 圆角
  题号徽章：#cc785c 药丸
  题型标签：紫/橙/蓝 徽章
  题目文字：28rpx Georgia
  选项列表：28rpx，选中态边框 #cc785c
----------------------------------
[底部操作栏 - 固定]
  背景：#faf9f5，上边框 #e5dfd6
  "上一题" 次按钮 + "下一题/提交" 主按钮
```

#### 3.4.3 数据结构可视化布局

借鉴 MongoDB University 的 **分类标签 + 内容网格** 结构：

```
[导航栏：数据结构可视化]
----------------------------------
[Segmented Tab]
  "BST" / "栈&队列" / "哈希表" / "图搜索"
----------------------------------
[可视化画布区]
  背景：#181715（深色面），24rpx 圆角
  节点/元素：#efe9de 底色，文字 #141413
  连线/箭头：#cc785c
  已访问节点：#d4edda 底色
----------------------------------
[操作面板]
  输入框 + 操作按钮行
  "插入" "删除" "搜索" 按钮
  动画速度滑块
----------------------------------
[说明卡片]
  背景：#efe9de，算法说明文字
```

#### 3.4.4 子网计算器/TCP 动画机布局

借鉴 MongoDB 的 **代码模拟卡片** 风格：

```
[导航栏：工具名称]
----------------------------------
[输入区卡片]
  背景：#efe9de，24rpx 圆角
  输入框 + 计算按钮
----------------------------------
[结果展示 - 深色卡片]
  背景：#181715
  二进制位可视化 / TCP 报文字段
  每组位用 #efe9de 小药丸标注
  高亮位用 #cc785c
----------------------------------
[详细信息卡片]
  背景：#efe9de
  键值对列表：标签 #6c6a64 / 值 #141413
```

### 3.5 WXSS 示例

#### 3.5.1 基础变量（注释形式，WXSS 不支持 CSS 变量）

```css
/* === 刷个冯题 x MongoDB 方法论 色彩映射 === */
/* 画布底色 #faf9f5 | 卡片底色 #efe9de | 暗色面 #181715 */
/* 主CTA #cc785c | CTA按下 #a9583e | CTA禁用 #d4cfc7 */
/* 主文字 #141413 | 次文字 #6c6a64 | 三级文字 #9a9890 */
/* 暗面文字 #faf9f5 | 暗面次文字 #a8a69e */
/* 边框 #e5dfd6 | 强边框 #ccc6ba | 深色边框 #3a3832 */
```

#### 3.5.2 主按钮

```css
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.30;
  border-radius: 999rpx;
  padding: 20rpx 44rpx;
  border: none;
  text-align: center;
}
.btn-primary:active {
  background-color: #a9583e;
}
.btn-primary[disabled] {
  background-color: #d4cfc7;
  color: #9a9890;
}
```

#### 3.5.3 基础卡片

```css
.card {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 40rpx;
  border: 2rpx solid #e5dfd6;
}
```

#### 3.5.4 深色卡片

```css
.card-dark {
  background-color: #181715;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 48rpx;
}
```

#### 3.5.5 特色/推荐卡片

```css
.card-featured {
  background-color: #e8f0f8;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 4rpx solid #cc785c;
}
```

#### 3.5.6 分类徽章

```css
.badge {
  display: inline-block;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 8rpx;
  padding: 4rpx 16rpx;
  line-height: 1.40;
}
.badge-coral {
  background-color: #cc785c;
  color: #faf9f5;
}
.badge-purple {
  background-color: #7b3ff2;
  color: #faf9f5;
}
.badge-orange {
  background-color: #e8874a;
  color: #faf9f5;
}
.badge-blue {
  background-color: #4a6fa5;
  color: #faf9f5;
}
.badge-success {
  background-color: #d4edda;
  color: #2d6a3f;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
}
.badge-hot {
  background-color: #181715;
  color: #cc785c;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
}
```

#### 3.5.7 Pill Tab 切换

```css
.pill-tab-bar {
  display: flex;
  gap: 16rpx;
}
.pill-tab {
  background-color: transparent;
  color: #9a9890;
  font-size: 26rpx;
  font-weight: 500;
  border: 2rpx solid #e5dfd6;
  border-radius: 999rpx;
  padding: 16rpx 28rpx;
}
.pill-tab.active {
  background-color: #141413;
  color: #faf9f5;
  border-color: #141413;
}
```

#### 3.5.8 代码块

```css
.code-block {
  background-color: #181715;
  color: #faf9f5;
  font-family: 'SF Mono', Menlo, Consolas, 'Courier New', monospace;
  font-size: 24rpx;
  line-height: 1.60;
  border-radius: 16rpx;
  padding: 28rpx;
}
```

#### 3.5.9 输入框

```css
.input-field {
  background-color: #faf9f5;
  color: #141413;
  font-size: 28rpx;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  border: 2rpx solid #ccc6ba;
  height: 88rpx;
  box-sizing: border-box;
}
.input-field:focus {
  border-width: 4rpx;
  border-color: #a9583e;
}
```

#### 3.5.10 文字层级

```css
.text-hero {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -3rpx;
  color: #141413;
}
.text-h1 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 44rpx;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -2rpx;
  color: #141413;
}
.text-h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 36rpx;
  font-weight: 400;
  line-height: 1.30;
  letter-spacing: -2rpx;
  color: #141413;
}
.text-body {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.60;
  color: #141413;
}
.text-caption {
  font-size: 26rpx;
  font-weight: 400;
  line-height: 1.55;
  color: #6c6a64;
}
.text-muted {
  font-size: 26rpx;
  font-weight: 400;
  line-height: 1.55;
  color: #9a9890;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

以下页面/场景最适合采用 MongoDB 方法论的元素：

| 页面 | 适用元素 | 理由 |
|---|---|---|
| 首页工具箱 | 暗色英雄卡片 + 功能网格 + 分类徽章 | MongoDB 首页的暗-亮双区结构天然适合工具箱入口展示 |
| 数据结构可视化 | Segmented Tab + 深色画布 + 节点标签 | 可视化需要深色背景突出图形元素，类似 MongoDB 的代码模拟卡 |
| 子网计算器 | 深色代码块 + 二进位药丸 + 输入卡片 | 二进制展示天然适合终端美学风格 |
| TCP 动画机 | 深色报文展示 + 字段高亮 + Pill Tab | 协议字段可视化需要深底高亮 |
| 题库/试卷列表 | 课程卡片网格 + 分类标签 | MongoDB University 的课程目录布局可直接映射 |
| 学习驾驶舱 | 数据卡片 + 进度标签 | 适合信息密集的统计面板 |

### 4.2 不适合页面

| 页面 | 不适用原因 |
|---|---|
| 刷题主页面（逐题作答） | 需要大面积浅色背景专注阅读，深色英雄区会分散注意力 |
| Markdown 导入预览 | 纯信息确认页，不需要品牌化视觉 |
| 错题本 | 信息列表为主，简洁优先 |
| 答题记录详情 | 数据回顾页，暖奶油底色 + 简洁卡片更舒适 |

### 4.3 混搭建议

**推荐混搭策略：亮面主导 + 暗面点缀**

1. **全局保持暖奶油基调**（#faf9f5 画布），不照搬 MongoDB 的大面积纯白
2. **将 MongoDB 的深色英雄区缩小为深色卡片**，作为首页顶部亮点或可视化区域，而非全页暗色带
3. **CTA 色替换为珊瑚色**（#cc785c），保持暖色调一致性，不引入亮绿色
4. **分类徽章系统可完整采用**，紫/橙/蓝三色 + 珊瑚色构成完整的题型/模块分类色板
5. **药丸按钮形态可全站统一**，这是 MongoDB 方案中最具辨识度的组件签名
6. **阴影策略遵循项目规范（零阴影）**，不引入 MongoDB 的多层阴影系统
7. **间距节奏可采用 4px/8px 体系**，与 rpx 天然兼容

**混搭公式：**
```
刷个冯题页面 = 暖奶油画布 + 奶油卡片(可选hairline)
             + 珊瑚色药丸CTA
             + 深色点缀卡片(可视化/代码区)
             + 分类彩色徽章
             + Georgia 衬线标题
```

---

## 5. 实施检查清单

实施 MongoDB 方法论元素时，逐项检查：

- [ ] 色值是否全部使用刷个冯题映射色（非 MongoDB 原色）
- [ ] CTA 按钮是否为珊瑚色 #cc785c（非亮绿色 #00ed64）
- [ ] 画布是否为 #faf9f5（非纯白 #ffffff）
- [ ] 卡片是否为 #efe9de（非纯白 + hairline）
- [ ] 暗色面是否为 #181715（非 #001e2b）
- [ ] 标题字体是否为 Georgia 衬线（非 Euclid Circular A）
- [ ] 标题字间距是否为 -3rpx / -2rpx（非 -1.5px / -1px）
- [ ] 按钮圆角是否为 999rpx 药丸形
- [ ] 卡片圆角是否为 24rpx
- [ ] 所有尺寸是否使用 rpx 单位（非 px）
- [ ] 阴影是否为零（靠色块对比表达深度）
- [ ] 是否避免了大面积深色英雄区（改为深色卡片点缀）
- [ ] 药丸徽章是否使用了正确的分类色映射
- [ ] 输入框高度是否为 88rpx（小程序触摸友好尺寸）
- [ ] WXSS 中是否硬编码色值（不使用 CSS 变量语法）
- [ ] 完成后是否调用 code-reviewer 审查
- [ ] 完成后是否更新 PROJECT_HANDOFF.md

---

## 6. 参考文件

| 文件 | 说明 |
|---|---|
| `.claude/skills/mongodb-design.md` | MongoDB 设计方案原始分析（本方法论来源） |
| `PROJECT_HANDOFF.md` S25 | Claude Design 暖奶油画布设计规范（项目当前基线） |
| `CLAUDE.md` | 项目设计风格约束、技术栈约束、开发工作流 |
| `.claude/skills/ui-ux-pro-max.md` | 综合 UI/UX 设计指南（50+ 风格、色板、字体对） |
| `.claude/skills/claude-design.md` | Claude.com 暖奶油画布设计语言详情 |
| `pages/index/index.wxss` | 首页现有样式（实施时对照） |
| `pages/quiz/quiz.wxss` | 刷题页现有样式（实施时对照） |
