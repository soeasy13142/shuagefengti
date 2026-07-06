# Linear 设计方案 → 刷个冯题 实施方法论

> 参考来源：`.claude/skills/linear.app-design.md`
> 适用项目：刷个冯题（微信小程序原生 WXML + WXSS + JS）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Linear 的设计语言有三个核心支柱：

1. **极简画布，内容为王** — 画布本身近乎消失（#010102 纯黑），所有视觉重量交给产品截图和功能内容。营销页面的 chrome（装饰）被压缩到最低限度。
2. **单一强调色克制使用** — 全系统只用一个色相（薰衣草蓝 #5e6ad2）作为品牌色、CTA、焦点环和链接强调。不引入第二个彩色。
3. **靠色阶梯而非阴影表达深度** — 四级 surface 色阶（canvas → surface-1 → surface-2 → surface-3）+ 1px hairline 边框构成全部层次关系，完全不用投影。

**对刷个冯题的启示：** 保持画布克制、单色强调、色阶层次这三个原则，但把暗色调反转为暖奶油色调。

### 1.2 视觉 DNA

| 维度 | Linear 方案 | 核心特征 |
|---|---|---|
| 画布 | #010102 近纯黑 | 深沉、聚焦、科技感 |
| 卡片 | #0f1011 炭灰面板 | 色阶梯度表达层次 |
| 强调色 | #5e6ad2 薰衣草蓝 | 唯一彩色，极度克制 |
| 文字 | #f7f8f8 浅灰 | 高对比度白字 |
| 圆角 | 12px 卡片 / 8px 按钮 | 中等圆角，不 pill |
| 字体 | SF Pro Display 无衬线 | 负字距 -3px@80px |
| 节奏 | 产品截图为主角 | 功能展示驱动 |

### 1.3 色彩策略

Linear 的色彩体系是严格的**暗色单强调色系统**：

- **四级 surface 色阶：** canvas(#010102) → surface-1(#0f1011) → surface-2(#141516) → surface-3(#18191a)
- **三级 hairline 边框：** hairline(#23252a) → hairline-strong(#34343a) → hairline-tertiary(#3e3e44)
- **四级文字色：** ink(#f7f8f8) → ink-muted(#d0d6e0) → ink-subtle(#8a8f98) → ink-tertiary(#62666d)
- **单色强调：** 薰衣草蓝 #5e6ad2，hover #828fff，focus #5e69d1
- **语义色仅一个：** 成功绿 #27a644

### 1.4 字体策略

- **展示字体：** Linear Display（自定义无衬线），weight 500-700，**激进负字距**（-3.0px@80px 约 4% 字号）
- **正文字体：** Linear Text（自定义无衬线），weight 400
- **等宽字体：** Linear Mono，仅用于代码片段
- **层级逻辑：** 展示 600 → 正文 400，同一字族，窄 weight 范围

### 1.5 布局与组件模式

- **间距基准：** 4px（对应小程序 8rpx）
- **卡片内距：** 24px（48rpx）标准 / 32px（64rpx）引言卡 / 48px（96rpx）CTA 横幅
- **按钮内距：** 8px 14px（16rpx 28rpx）
- **圆角阶梯：** xs 4px / sm 6px / md 8px / lg 12px / xl 16px / pill 9999px
- **网格：** 桌面 3 列 → 平板 2 列 → 移动 1 列
- **深度表达：** 零阴影，靠 surface 色阶 + hairline 边框

---

## 2. 适配分析

### 2.1 可直接迁移

以下 Linear 设计元素可以直接迁移到刷个冯题，无需改造：

| 元素 | Linear 原值 | 迁移理由 |
|---|---|---|
| 单一强调色策略 | 仅用薰衣草蓝一处 | 刷个冯题已采用单一珊瑚色 #cc785c，策略一致 |
| 零投影深度系统 | 色阶 + hairline 边框 | 与 Claude Design 暖奶油风格的零阴影约束完全兼容 |
| 圆角阶梯体系 | xs 4px → pill 9999px | 直接换算为 rpx 即可使用 |
| 按钮状态梯度 | default → hover → pressed | 微信小程序有 bindtap 状态，可实现 active 态 |
| 表面层级逻辑 | canvas → surface-1 → surface-2 | 亮色版同理，只需反转色值方向 |
| 间距基准 4px | 4px 基准 | 换算 8rpx，与 rpx 体系兼容 |
| 组件命名体系 | button-primary / feature-card 等 | 语义化命名直接复用 |

### 2.2 需要改造

以下元素需要在保持设计逻辑的前提下，反转或替换参数：

| 元素 | Linear 原方案 | 改造方向 | 理由 |
|---|---|---|---|
| 色彩明暗方向 | 暗色画布 #010102 | 反转为暖奶油画布 #faf9f5 | 刷个冯题采用暖色亮色系 |
| surface 色阶 | 暗→更亮（#0f1011→#18191a） | 亮→更深（#faf9f5→#efe9de→#e5dfd5） | 亮色系中色阶方向反转 |
| 文字色阶 | 浅灰→深灰（#f7f8f8→#62666d） | 深墨→浅灰（#141413→#6c6a64） | 亮色画布上文字需反转 |
| 强调色 | 薰衣草蓝 #5e6ad2 | 珊瑚色 #cc785c | 匹配项目品牌色 |
| 字体家族 | SF Pro Display 无衬线 | Georgia 衬线 | 匹配项目标题字体约束 |
| 字距策略 | 激进负字距 -3px@80px | 轻微负字距 -3rpx@标题 | 衬线体需要更温和的字距处理 |
| hairline 边框色 | 暗色边框 #23252a | 亮色边框 #d9d3c8 | 亮色系中边框需变浅 |
| 产品截图主导 | 全屏高保真产品截图 | 功能卡片图标 + 文字描述 | 小程序无营销截图需求 |

### 2.3 不可迁移

以下 Linear 元素在刷个冯题中不适用：

| 元素 | 原因 |
|---|---|
| 暗色营销画布 | 刷个冯题是学习工具，暖色系更友好 |
| 产品 UI 截图作为视觉主角 | 小程序没有营销页面的截图展示需求 |
| Linear 自定义字体 | 私有字体，不公开分发 |
| 1280px 最大内容宽度 | 小程序以 750rpx 设计稿为基准，全屏 |
| 桌面端 3 列网格 | 小程序为移动端单屏，无桌面断点 |
| 汉堡菜单折叠 | 小程序底部 tabbar 导航，无需汉堡菜单 |
| 逆色系（inverse-canvas 白色） | 暗色营销页面中少量白色反转区块，在暖色系中无意义 |
| Mono 等宽字体用于代码 | 小程序中代码展示场景极少 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

将 Linear 的暗色系完整映射到刷个冯题的暖奶油亮色系：

#### 画布与表面

| 语义角色 | Linear 值 | 刷个冯题值 | 用途 |
|---|---|---|---|
| canvas（画布） | #010102 | **#faf9f5** | 页面全局背景 |
| surface-1 | #0f1011 | **#efe9de** | 默认卡片、功能面板 |
| surface-2 | #141516 | **#e5dfd5** | 高亮卡片、hover 态面板 |
| surface-3 | #18191a | **#dbd5ca** | 次级面板、下拉菜单背景 |
| surface-4 | #191a1b | **#d1cbc0** | 最深层提升面（极少使用） |

#### 边框

| 语义角色 | Linear 值 | 刷个冯题值 | 用途 |
|---|---|---|---|
| hairline | #23252a | **#d9d3c8** | 卡片默认 1px 边框 |
| hairline-strong | #34343a | **#c4bfb4** | 输入框聚焦环、强调边框 |
| hairline-tertiary | #3e3e44 | **#b0ab9f** | 嵌套面边框 |

#### 文字

| 语义角色 | Linear 值 | 刷个冯题值 | 用途 |
|---|---|---|---|
| ink（主文字） | #f7f8f8 | **#141413** | 标题、正文 |
| ink-muted | #d0d6e0 | **#4a4843** | 次要正文、元信息 |
| ink-subtle | #8a8f98 | **#6c6a64** | 辅助文字、标签 |
| ink-tertiary | #62666d | **#9a9690** | 禁用态、脚注 |

#### 强调色

| 语义角色 | Linear 值 | 刷个冯题值 | 用途 |
|---|---|---|---|
| primary | #5e6ad2 | **#cc785c** | 主 CTA、品牌标识 |
| primary-hover | #828fff | **#b86a4f** | CTA hover/pressed 态 |
| primary-focus | #5e69d1 | **#a9583e** | 输入框聚焦环 |
| on-primary | #ffffff | **#ffffff** | CTA 按钮上文字 |

#### 语义色

| 语义角色 | Linear 值 | 刷个冯题值 | 用途 |
|---|---|---|---|
| semantic-success | #27a644 | **#27a644** | 答对标记、成功提示（保留） |
| semantic-error | — | **#d94a4a** | 答错标记、错误提示（新增） |
| semantic-overlay | #000000 | **rgba(0,0,0,0.5)** | 弹窗遮罩 |

### 3.2 字体映射（rpx）

将 Linear 的无衬线字体层级映射到 Georgia 衬线 + 系统无衬线的混合方案：

#### 标题层级（Georgia 衬线）

| 语义角色 | Linear 原始 | 刷个冯题 rpx 值 | 备注 |
|---|---|---|---|
| display-xl | 80px / 600 / 1.05 / -3.0px | **80rpx / 400 / 1.1 / -3rpx** | 首页主标题（极少使用） |
| display-lg | 56px / 600 / 1.10 / -1.8px | **56rpx / 400 / 1.15 / -2rpx** | 页面大标题 |
| display-md | 40px / 600 / 1.15 / -1.0px | **40rpx / 400 / 1.2 / -1rpx** | 区块标题 |
| headline | 28px / 600 / 1.20 / -0.6px | **36rpx / 400 / 1.3 / -1rpx** | 卡片大标题、CTA 标题 |
| card-title | 22px / 500 / 1.25 / -0.4px | **32rpx / 400 / 1.3 / 0** | 功能卡片标题 |

#### 正文层级（系统无衬线 / -apple-system）

| 语义角色 | Linear 原始 | 刷个冯题 rpx 值 | 备注 |
|---|---|---|---|
| subhead | 20px / 400 / 1.40 / -0.2px | **30rpx / 400 / 1.5 / 0** | 引导正文 |
| body-lg | 18px / 400 / 1.50 / -0.1px | **28rpx / 400 / 1.6 / 0** | 题目正文 |
| body | 16px / 400 / 1.50 / -0.05px | **28rpx / 400 / 1.6 / 0** | 默认正文 |
| body-sm | 14px / 400 / 1.50 / 0 | **24rpx / 400 / 1.5 / 0** | 辅助正文 |
| caption | 12px / 400 / 1.40 / 0 | **22rpx / 400 / 1.4 / 0** | 标注、时间戳 |
| button | 14px / 500 / 1.20 / 0 | **28rpx / 500 / 1.2 / 0** | 按钮文字 |
| eyebrow | 13px / 500 / 1.30 / +0.4px | **22rpx / 500 / 1.3 / 1rpx** | 区块小标签 |

#### 字距策略说明

- Linear 使用激进负字距（-3px@80px 约 4%），原因是无衬线大写字距需要收紧
- Georgia 衬线体天然字距较紧，只需**轻微负字距**（约 -1%~-2%）
- 正文使用系统无衬线，字距保持 0 或极微负值

### 3.3 组件设计规范

基于 Linear 组件体系，适配到刷个冯题的 WXSS 实现：

#### 按钮

| 组件名 | 背景 | 文字 | 字体 | 圆角 | 内距 | 用途 |
|---|---|---|---|---|---|---|
| button-primary | #cc785c | #ffffff | button 28rpx/500 | 16rpx | 16rpx 28rpx | 主操作（开始刷题、提交） |
| button-primary-pressed | #a9583e | #ffffff | button 28rpx/500 | 16rpx | 16rpx 28rpx | 主按钮按下态 |
| button-secondary | #efe9de | #141413 | button 28rpx/500 | 16rpx | 16rpx 28rpx | 次要操作（查看解析、返回） |
| button-ghost | transparent | #141413 | button 28rpx/500 | 16rpx | 16rpx 28rpx | 文字链接型操作 |
| button-disabled | #d9d3c8 | #9a9690 | button 28rpx/500 | 16rpx | 16rpx 28rpx | 不可操作状态 |

#### 卡片

| 组件名 | 背景 | 圆角 | 内距 | 边框 | 用途 |
|---|---|---|---|---|---|
| card-default | #efe9de | 24rpx | 32rpx | 1rpx solid #d9d3c8 | 功能入口卡片 |
| card-highlight | #e5dfd5 | 24rpx | 32rpx | 1rpx solid #c4bfb4 | 高亮/推荐卡片 |
| card-flat | #faf9f5 | 16rpx | 24rpx | 无边框 | 列表项、轻量信息 |
| card-question | #efe9de | 24rpx | 40rpx | 1rpx solid #d9d3c8 | 题目展示卡片 |
| card-result | #efe9de | 24rpx | 48rpx | 1rpx solid #d9d3c8 | 结果/统计卡片 |

#### 输入框

| 组件名 | 背景 | 圆角 | 内距 | 边框 | 用途 |
|---|---|---|---|---|---|
| input-default | #efe9de | 16rpx | 16rpx 24rpx | 1rpx solid #d9d3c8 | 搜索框、文本输入 |
| input-focused | #efe9de | 16rpx | 16rpx 24rpx | 2rpx solid #a9583e | 输入框聚焦态 |

#### 标签与徽章

| 组件名 | 背景 | 文字 | 圆角 | 内距 | 用途 |
|---|---|---|---|---|---|
| tag-default | #e5dfd5 | #4a4843 | 9999rpx | 4rpx 16rpx | 分类标签 |
| tag-primary | #cc785c | #ffffff | 9999rpx | 4rpx 16rpx | 强调标签 |
| badge-correct | #27a644 | #ffffff | 9999rpx | 4rpx 12rpx | 答对标记 |
| badge-wrong | #d94a4a | #ffffff | 9999rpx | 4rpx 12rpx | 答错标记 |

#### 状态指示

| 组件名 | 用途 | 样式 |
|---|---|---|
| progress-bar | 刷题进度 | 背景 #d9d3c8，填充 #cc785c，高度 8rpx，圆角 9999rpx |
| status-dot | 在线/完成状态 | 12rpx 圆点，完成=#27a644，进行中=#cc785c |
| divider | 分割线 | 高度 1rpx，颜色 #d9d3c8 |

### 3.4 页面布局模板

基于 Linear 的布局逻辑，适配到小程序 750rpx 设计稿：

#### 通用页面结构

```
+-------------------------------+ 750rpx 全宽
|  状态栏 (系统)               |
|  导航栏 100rpx              |  背景 #faf9f5，文字 #141413
+-------------------------------+
|  页面内容区                  |  padding: 0 32rpx
|  +-------------------------+  |
|  | 区块标题 (headline)    |  |  36rpx Georgia 400, margin-bottom: 24rpx
|  | 副标题 (body-sm)      |  |  24rpx 系统字体, margin-bottom: 32rpx
|  +-------------------------+  |
|  | 内容区                 |  |  卡片间距: 24rpx
|  | +-------------------+  |  |
|  | | 卡片 (card)      |  |  |  #efe9de, 24rpx 圆角, 32rpx 内距
|  | +-------------------+  |  |
|  | +-------------------+  |  |
|  | | 卡片 (card)      |  |  |  同上
|  | +-------------------+  |  |
|  +-------------------------+  |
+-------------------------------+
|  底部安全区                  |  env(safe-area-inset-bottom)
+-------------------------------+
```

#### 刷题页面特殊布局

```
+-------------------------------+
|  顶部进度条                  |  8rpx 高，#d9d3c8 底，#cc785c 填充
|  题号: 3/20    模式: 练习    |  caption 22rpx
+-------------------------------+
|                              |
|  题目卡片                    |  card-question, 40rpx 内距
|  +-------------------------+  |
|  | 题干正文 (body-lg)     |  |  28rpx, 行高 1.6
|  |                        |  |
|  | A. 选项一              |  |  选项卡片: #faf9f5 底
|  | B. 选项二              |  |  选中态: #cc785c 边框 + 浅底
|  | C. 选项三              |  |
|  | D. 选项四              |  |
|  +-------------------------+  |
|                              |
|  [上一题]      [下一题]      |  button-secondary / button-primary
|                              |
+-------------------------------+
```

#### 首页功能网格布局

```
+-------------------------------+
|  欢迎语 (display-lg)        |  56rpx Georgia, margin-bottom: 8rpx
|  学习状态条 (body-sm)       |  #6c6a64, margin-bottom: 32rpx
+-------------------------------+
|  +----------+  +----------+  |  2 列网格
|  | 功能卡   |  | 功能卡   |  |  gap: 24rpx
|  | #efe9de  |  | #efe9de  |  |  每卡: 24rpx 圆角, 32rpx 内距
|  | 图标     |  | 图标     |  |  图标: 48rpx, #cc785c
|  | 标题     |  | 标题     |  |  标题: 32rpx Georgia
|  | 描述     |  | 描述     |  |  描述: 24rpx, #6c6a64
|  +----------+  +----------+  |
|  +----------+  +----------+  |
|  | 功能卡   |  | 功能卡   |  |
|  +----------+  +----------+  |
+-------------------------------+
```

### 3.5 WXSS 示例

#### CSS 变量定义（app.wxss）

```css
/* ========== Linear 方法论 → 刷个冯题 设计 Token ========== */
page {
  /* 画布与表面 */
  --color-canvas: #faf9f5;
  --color-surface-1: #efe9de;
  --color-surface-2: #e5dfd5;
  --color-surface-3: #dbd5ca;

  /* 边框 */
  --color-hairline: #d9d3c8;
  --color-hairline-strong: #c4bfb4;

  /* 文字 */
  --color-ink: #141413;
  --color-ink-muted: #4a4843;
  --color-ink-subtle: #6c6a64;
  --color-ink-tertiary: #9a9690;

  /* 强调色 */
  --color-primary: #cc785c;
  --color-primary-hover: #b86a4f;
  --color-primary-focus: #a9583e;
  --color-on-primary: #ffffff;

  /* 语义色 */
  --color-success: #27a644;
  --color-error: #d94a4a;

  /* 圆角 */
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-pill: 9999rpx;

  /* 间距 */
  --space-xs: 8rpx;
  --space-sm: 16rpx;
  --space-md: 24rpx;
  --space-lg: 32rpx;
  --space-xl: 48rpx;
  --space-section: 64rpx;

  /* 字体 */
  --font-display: Georgia, "Times New Roman", serif;
  --font-body: -apple-system, "Helvetica Neue", sans-serif;
}
```

#### 通用卡片样式

```css
/* 默认卡片 — 对应 Linear 的 feature-card */
.card {
  background: var(--color-surface-1);
  border: 1rpx solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

/* 高亮卡片 — 对应 Linear 的 pricing-card-featured */
.card--highlight {
  background: var(--color-surface-2);
  border: 1rpx solid var(--color-hairline-strong);
}

/* 题目卡片 — 对应 Linear 的 product-screenshot-card */
.card--question {
  background: var(--color-surface-1);
  border: 1rpx solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}
```

#### 按钮样式

```css
/* 主按钮 — 对应 Linear 的 button-primary */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.2;
  border-radius: var(--radius-md);
  padding: 16rpx 28rpx;
  border: none;
  text-align: center;
}

.btn-primary:active {
  background: var(--color-primary-focus);
}

/* 次要按钮 — 对应 Linear 的 button-secondary */
.btn-secondary {
  background: var(--color-surface-1);
  color: var(--color-ink);
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.2;
  border-radius: var(--radius-md);
  padding: 16rpx 28rpx;
  border: 1rpx solid var(--color-hairline);
  text-align: center;
}
```

#### 标题样式

```css
/* 页面标题 — 对应 Linear 的 display-lg */
.heading-lg {
  font-family: var(--font-display);
  font-size: 56rpx;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -2rpx;
  color: var(--color-ink);
}

/* 区块标题 — 对应 Linear 的 headline */
.heading-md {
  font-family: var(--font-display);
  font-size: 36rpx;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -1rpx;
  color: var(--color-ink);
}

/* 卡片标题 — 对应 Linear 的 card-title */
.heading-sm {
  font-family: var(--font-display);
  font-size: 32rpx;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: 0;
  color: var(--color-ink);
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

以下页面最适合应用 Linear 方法论的组件和布局模式：

| 页面 | 适配理由 | 重点使用的 Linear 元素 |
|---|---|---|
| **首页功能网格** | 卡片网格布局 + 功能入口，与 Linear feature-card 逻辑一致 | card-default、heading-sm、2 列网格 |
| **试卷列表** | 列表卡片 + 状态标签，与 Linear changelog-row 逻辑相近 | card-flat、tag-default、status-dot |
| **结果页** | 统计数据展示 + 操作按钮组，与 Linear pricing-card 结构相似 | card-result、badge-correct/wrong、button-primary |
| **学习驾驶舱** | 数据面板 + 趋势指示，适合 surface 层级体系 | card-highlight、progress-bar、ink-muted/ink-subtle 文字层级 |
| **错题本** | 列表 + 筛选标签，适合 tag + card 组合 | tag-default、card-flat、button-ghost |

### 4.2 不适合页面

以下页面应谨慎使用或部分跳过 Linear 方法论：

| 页面 | 不适配原因 | 建议做法 |
|---|---|---|
| **刷题页面** | 题目内容为主，需要最大化阅读区域，减少装饰性元素 | 仅使用色彩 token 和字体层级，简化卡片边框 |
| **Markdown 导入页** | 文件操作为主，UI 极简 | 使用 button-primary + input-default 即可，无需复杂卡片 |
| **子网计算器** | 数字密集型工具页面，需要等宽字体和精确对齐 | 保留 Linear 的 surface 层级逻辑，但引入等宽字体显示数值 |
| **TCP 动画机** | 动画驱动页面，视觉焦点在动画区域而非 UI chrome | 仅用色彩 token 统一基调，动画区域保持最大简洁 |
| **数据结构可视化** | Canvas/SVG 绘图为主，UI 为辅 | 仅在控制面板使用 Linear 组件 |

### 4.3 混搭建议

Linear 方法论与现有 Claude Design 暖奶油画布风格的混搭策略：

**全局层面：** 采用 Linear 的**组件命名体系和 surface 层级逻辑**，保留 Claude Design 的**暖色色值和 Georgia 衬线标题**。

**具体混搭规则：**

1. **色彩用 Claude Design，层级用 Linear** — 保持 #faf9f5 / #efe9de / #cc785c 色值，但用 Linear 的四级 surface 思维组织它们
2. **字体用 Claude Design，字重梯度用 Linear** — 保持 Georgia 衬线标题，但借鉴 Linear 的 weight 递减策略（标题 400 → 正文 400 → 按钮 500 的微妙变化）
3. **圆角用 Claude Design 的 24rpx 卡片，但按钮用 Linear 的 16rpx** — 卡片圆润亲和，按钮稍紧凑
4. **零阴影是两个系统的共识** — 完全兼容，无需调整
5. **间距用 Linear 的 4px 基准换算 rpx** — 8rpx / 16rpx / 24rpx / 32rpx / 48rpx / 64rpx

**不建议混搭的部分：**

- 不要把 Linear 的暗色 surface 值混入暖色系
- 不要把 Linear 的无衬线字体层级直接套用到 Georgia 上（字距逻辑不同）
- 不要引入 Linear 的薰衣草蓝 #5e6ad2（与珊瑚色 #cc785c 冲突）

---

## 5. 实施检查清单

### 新建页面时

- [ ] 画布背景使用 `var(--color-canvas)` #faf9f5
- [ ] 卡片使用 `var(--color-surface-1)` #efe9de + `var(--color-hairline)` 边框
- [ ] 标题使用 Georgia 衬线，weight 400
- [ ] 正文使用系统无衬线，weight 400
- [ ] 按钮文字使用 weight 500
- [ ] 主 CTA 使用 `var(--color-primary)` #cc785c
- [ ] 圆角使用 token：卡片 24rpx / 按钮 16rpx / 标签 pill
- [ ] 间距使用 token：8rpx / 16rpx / 24rpx / 32rpx / 48rpx / 64rpx
- [ ] 无投影、无渐变、无装饰性色彩

### 修改已有页面时

- [ ] 检查是否与现有 Claude Design 暖奶油风格冲突
- [ ] 检查色彩对比度：正文 #141413 on #efe9de >= 7:1（WCAG AAA）
- [ ] 检查按钮最小点击区域 >= 88rpx（44px）
- [ ] 检查文字最小字号 >= 22rpx（11px）
- [ ] 检查页面在 iPhone SE（375px）和 iPhone 15 Pro Max（430px）的显示

### 色彩使用规范

- [ ] 全页仅使用一个强调色系（珊瑚色 #cc785c 及其变体）
- [ ] surface 层级不跳级（surface-1 → surface-2 → surface-3，不直接从 canvas 到 surface-3）
- [ ] 文字色层级正确：标题 #141413 → 正文 #4a4843 → 辅助 #6c6a64 → 禁用 #9a9690
- [ ] 语义色仅用于功能含义（绿=正确，红=错误），不用于装饰

---

## 6. 参考文件

| 文件 | 路径 | 说明 |
|---|---|---|
| Linear 设计技能 | `.claude/skills/linear.app-design.md` | 本方法论的来源文件，Linear 完整设计规范 |
| 项目交接文档 | `PROJECT_HANDOFF.md` | 项目当前状态、已完成内容、技术约束 |
| Claude Design 技能 | `.claude/skills/claude-design.md` | 项目当前使用的暖奶油画布设计语言 |
| app.wxss | `app.wxss` | 全局样式变量定义位置 |
| 首页实现 | `pages/index/index.wxss` | 现有首页样式参考 |
| 刷题页实现 | `pages/quiz/quiz.wxss` | 现有刷题页样式参考 |
