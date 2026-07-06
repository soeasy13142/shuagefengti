# Ollama 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/ollama-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Ollama 的设计是"文档即系统"的极致表达——整个页面如同一份精心排版的 Markdown README：纯白画布、36px 居中标题、一个黑色 pill CTA、一段终端安装命令、一个手绘羊驼吉祥物作为唯一装饰元素。无渐变、无英雄图、无营销炫技。色彩工具箱仅含纯黑、纯白和三个中性灰。每个交互元素都是 `{rounded.full}`（9999px）药丸形状。定价、FAQ 和隐私承诺全部放在同一张平面画布上、使用细边框卡片。系统的克制本身就是品牌。

### 1.2 视觉 DNA
- 纯白画布 `#ffffff`，全页无表面交替，整页是一张连续纸面
- 居中 hero + `{typography.display-xl}` SF Pro Rounded 标题，无眉眼、无副标题
- 药丸几何体无处不在：所有按钮和输入框 `{rounded.full}`；卡片 `{rounded.lg}`（12px）；除 section 分割线外无尖角
- 单色 CTA 体系：纯黑 `{colors.primary}` 药丸承载所有操作
- 内联 `curl` 安装命令以药丸形态呈现——页面最具辨识度的元素
- 终端模拟卡片含 macOS 红绿灯圆点和命令示例——首页唯一的"产品预览"
- 深色翻转卡片 `{component.pricing-card-dark}` 用于最高档位——全系统唯一的注意力引导手段
- 手绘羊驼吉祥物是唯一插图

### 1.3 色彩策略
- 画布：`#ffffff`（纯白），几乎每个表面
- 画布软：`#fafafa`（安装命令 pill、搜索 pill、次要 chip 背景）
- 深色面：`#171717`（定价 Max 卡片、深色 CTA 条带——全系统唯一的反转面）
- 分割线：`#e5e5e5`（1px 卡片边框、FAQ 行分割）
- 分割线强：`#d4d4d4`（需要更强分隔时使用）
- 文字墨：`#000000`（标题、导航、按钮文字、价格）
- 文字墨深：`#090909`（按钮按下态）
- 炭灰：`#525252`（列表项、禁用态次要文字）
- 正文灰：`#737373`（段落、FAQ 答案、页脚——系统最常用文字色）
- 静音灰：`#a3a3a3`（说明文字、终端注释、最低优先级）
- 深色面文字：`#ffffff`、`rgba(255,255,255,0.7)`
- 焦点环：`rgba(59,130,246,0.5)`——系统中唯一的蓝色
- 终端红绿灯：红 `#ff5f56`、黄 `#ffbd2e`、绿 `#27c93f`

### 1.4 字体策略
- 标题：SF Pro Rounded，500/600 weight，36→30→24→20→18px 递减
- 正文/按钮/链接/说明：系统默认 sans-serif（`ui-sans-serif`），12→20px
- 代码：系统默认等宽（`ui-monospace`），14→16px
- 设计意图：字体决策是"不做字体决策"——标题的圆润感（SF Pro Rounded）是唯一品牌表达，其余全部回退到操作系统默认字体，呈现文档原生感
- 开源替代：标题 Nunito、正文 Inter、代码 JetBrains Mono / Fira Code

### 1.5 布局与组件模式
- 圆角：`{rounded.full}`（9999px）用于所有交互元素；`{rounded.lg}`（12px）用于卡片；`{rounded.sm}`（6px）用于内联 code chip
- 间距基数：8px；section 节奏 88px
- 内容列宽：~720px（桌面），单列阅读流
- 深度系统：零阴影，仅 1px hairline 边框或深色反转面
- 组件核心：pill 按钮（黑底白字）、pill 输入框、pill 安装命令、终端模拟卡片、定价卡片（含深色翻转变体）、FAQ 行

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **零阴影策略**：Ollama 与本项目完全一致，不使用阴影表达深度
- **1px hairline 边框卡片**：与本项目的卡片边界表达方式一致
- **单色 CTA 体系**：纯黑药丸 CTA 的克制感适合工具类应用
- **药丸几何体（rounded.full）**：所有交互元素 9999rpx 圆角，适合小程序触控
- **section 节奏靠空白而非装饰分割**：与本项目一致
- **正文灰色 `#737373`**：与本项目的 `#6c6a64` 接近
- **深色反转面作为唯一注意力引导**：适合标记重要/高级功能

### 2.2 需要改造的设计决策
- **纯白画布 `#ffffff`**：本项目用暖奶油 `#faf9f5`，需替换
- **纯黑 CTA `#000000`**：本项目用珊瑚色 `#cc785c`，需替换以保持暖调
- **SF Pro Rounded 标题字体**：本项目用 Georgia 衬线，保留 Georgia
- **88px section 节奏**：小程序页面较短，压缩为 48-64rpx
- **720px 内容列宽**：小程序全屏，改为 padding 控制
- **终端模拟卡片**：小程序无终端概念，改造为代码展示卡片或学习命令卡片
- **定价卡片结构**：改造为功能模块卡片或学习统计卡片
- **macOS 红绿灯圆点**：改为装饰性状态指示或学习进度点

### 2.3 不可迁移的设计决策
- **SF Pro Rounded 字体**：Apple 授权字体，微信小程序无法使用，Georgia 替代
- **`ui-sans-serif` / `ui-monospace` 系统字体声明**：小程序用 `system-ui` 或具体字体名
- **浏览器焦点环 `rgba(59,130,246,0.5)`**：小程序无 CSS focus-visible
- **`curl` 安装命令 pill**：小程序无终端安装场景，需改造为学习入口 pill
- **手绘羊驼吉祥物**：非通用组件，需本项目自定义吉祥物或图标
- **1280px 桌面断点**：小程序无桌面响应式

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #ffffff | #faf9f5 | 暖奶油替代纯白 |
| Surface Soft | #fafafa | #f5f0e8 | 更浅暖色 |
| Surface Dark | #171717 | #181715 | 深海军蓝，几乎一致 |
| Hairline | #e5e5e5 | #e5dfd4 | 暖色分割线 |
| Hairline Strong | #d4d4d4 | #d4cec2 | 暖色强分割线 |
| Ink（标题/按钮） | #000000 | #141413 | 暖墨替代纯黑 |
| Ink Deep（按下态） | #090909 | #0f0f0e | 暖墨深 |
| Charcoal | #525252 | #6c6a64 | 暖灰 |
| Body（正文） | #737373 | #8a8880 | 暖正文灰 |
| Muted（静音） | #a3a3a3 | #b5b2aa | 暖静音灰 |
| Primary（CTA） | #000000 | #cc785c | 珊瑚色替代纯黑 |
| Primary Active | #090909 | #a9583e | 深珊瑚 |
| On Primary | #ffffff | #faf9f5 | 暖白文字 |
| On Dark | #ffffff | #faf9f5 | 深色面文字 |
| On Dark Mute | rgba(255,255,255,0.7) | rgba(250,249,245,0.7) | 暖白 70% |
| Focus Ring | rgba(59,130,246,0.5) | — | 小程序不适用 |
| Terminal Red | #ff5f56 | #ff5f56 | 保留（装饰用） |
| Terminal Yellow | #ffbd2e | #ffbd2e | 保留（装饰用） |
| Terminal Green | #27c93f | #27c93f | 保留（装饰用） |

### 3.2 字体映射（rpx）

| 层级 | 原方案（px/weight） | 本项目 WXSS（rpx/weight） | 说明 |
|---|---|---|---|
| Hero 大标题 | 36px/500/SF Pro Rounded | 56rpx/400/Georgia/-3rpx | 衬线 + 负 tracking |
| Section 标题 | 30px/500/SF Pro Rounded | 40rpx/400/Georgia/-1rpx | |
| 子标题 | 24px/600/SF Pro Rounded | 34rpx/400/Georgia/-1rpx | |
| 卡片标题 | 20px/500/sans-serif | 32rpx/600/system-ui | |
| FAQ 问题 | 18px/500/sans-serif | 30rpx/500/system-ui | |
| 正文 | 16px/400/sans-serif | 28rpx/400/system-ui | |
| 正文强调 | 16px/500/sans-serif | 28rpx/500/system-ui | |
| 正文小字 | 14px/400/sans-serif | 26rpx/400/system-ui | |
| 说明文字 | 12px/400/sans-serif | 22rpx/400/system-ui | |
| 代码 | 16px/400/monospace | 26rpx/400/Courier New | |
| 代码小字 | 14px/400/monospace | 24rpx/400/Courier New | |
| 按钮标签 | 14px/500/sans-serif | 26rpx/600/system-ui | |

### 3.3 组件设计规范

**主 CTA Pill（原 button-primary）**
- 背景：#cc785c（珊瑚色，替代原纯黑）
- 文字：#faf9f5
- 圆角：9999rpx（完全药丸）
- 高度：72rpx
- 内边距：16rpx × 40rpx
- 字号：26rpx，weight 600
- 按下态：背景 #a9583e

**次级 Pill（原 button-secondary）**
- 背景：#faf9f5
- 文字：#141413
- 圆角：9999rpx
- 高度：72rpx
- 内边距：16rpx × 40rpx
- 字号：26rpx，weight 600
- 1rpx solid #d4cec2 边框

**深色面 Pill（原 button-pill-on-dark）**
- 背景：#faf9f5
- 文字：#141413
- 圆角：9999rpx
- 高度：72rpx
- 内边距：16rpx × 40rpx
- 字号：26rpx，weight 600
- 用于深色 #181715 表面上的 CTA

**禁用 Pill（原 button-disabled）**
- 背景：#f5f0e8
- 文字：#b5b2aa
- 圆角：9999rpx
- 高度：72rpx

**搜索/命令 Pill（原 search-pill）**
- 背景：#f5f0e8
- 文字：#141413
- 圆角：9999rpx
- 高度：72rpx
- 内边距：16rpx × 32rpx
- 字号：26rpx
- 聚焦态：背景 #faf9f5

**安装命令 Pill（原 install-snippet → 学习入口 Pill）**
- 背景：#f5f0e8
- 文字：#141413
- 圆角：9999rpx
- 高度：96rpx
- 内边距：24rpx × 40rpx
- 字号：26rpx，等宽字体
- 用途改造：从 curl 安装命令改为学习快捷入口（如"开始刷题"、"查看错题"）

**内联命令 Tag（原 command-tag）**
- 背景：#f5f0e8
- 文字：#141413
- 圆角：9999rpx
- 内边距：12rpx × 24rpx
- 字号：24rpx，等宽字体

**功能模块卡片（原 pricing-card）**
- 背景：#faf9f5
- 圆角：24rpx（原 12px，放大以适配暖调）
- 内边距：64rpx
- 1rpx solid #e5dfd4 边框
- 无阴影
- 布局：图标 → 标题 → 一行描述 → CTA → 分割线 → 功能列表

**深色功能卡片（原 pricing-card-dark）**
- 背景：#181715
- 文字：#faf9f5
- 次要文字：rgba(250,249,245,0.7)
- 圆角：24rpx
- 内边距：64rpx
- CTA：深色面 Pill 样式
- 仅用于一个"重点推荐"功能——每页最多一张

**功能列表项（原 feature-bullet）**
- 前缀：文字色 #141413 的对勾符号
- 文字：#6c6a64，26rpx
- 无背景，行间距 16rpx

**FAQ 行（原 faq-row）**
- 背景：#faf9f5
- 内边距：32rpx 0
- 底部 1rpx solid #e5dfd4 分割线
- 问题：30rpx/500/#141413
- 答案：28rpx/400/#8a8880，与问题间距 8rpx
- 始终展开，无折叠

**终端/代码展示卡片（原 terminal-card）**
- 背景：#faf9f5
- 圆角：24rpx
- 内边距：32rpx
- 1rpx solid #e5dfd4 边框
- 头部：三个装饰圆点（红 #ff5f56、黄 #ffbd2e、绿 #27c93f），各 24rpx 直径，间距 8rpx
- 正文：等宽字体 24rpx，注释用 #b5b2aa，命令用 #141413

**深色 CTA 条带（原 cta-strip-dark）**
- 背景：#181715
- 文字：#faf9f5
- 圆角：24rpx
- 内边距：48rpx × 64rpx
- 标题字号：34rpx/400/Georgia
- 用于页面中的号召性区域——每页最多一条

### 3.4 页面布局模板

**Hero 区**
- 背景：#faf9f5
- 上下 80rpx 内边距
- 居中大标题（56rpx Georgia 400 -3rpx）
- 下方：学习入口 Pill（替代安装命令 pill）
- 再下方：主 CTA Pill

**功能展示区**
- 单列布局，左右 32rpx padding
- 2-3 张功能模块卡片纵向排列
- 卡片间距 32rpx
- 可含一张深色卡片作为重点推荐

**代码/示例区**
- 代码展示卡片（含红绿灯装饰）
- 与文字说明左右分栏（桌面）或上下堆叠（窄屏）

**FAQ 区**
- 单列纵向排列
- 行间 1rpx 分割线
- 无外框卡片

**底部 CTA 区**
- 深色 CTA 条带
- 居中标题 + CTA Pill

### 3.5 WXSS 实现示例

**主 CTA Pill**

```css
.cta-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  padding: 16rpx 40rpx;
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  font-size: 26rpx;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
}
.cta-primary:active {
  background-color: #a9583e;
}
```

**次级 Pill**

```css
.cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  padding: 16rpx 40rpx;
  background-color: #faf9f5;
  color: #141413;
  border: 1rpx solid #d4cec2;
  border-radius: 9999rpx;
  font-size: 26rpx;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
}
```

**功能模块卡片**

```css
.card-module {
  background-color: #faf9f5;
  border: 1rpx solid #e5dfd4;
  border-radius: 24rpx;
  padding: 64rpx;
}
.card-module__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 34rpx;
  font-weight: 400;
  letter-spacing: -1rpx;
  color: #141413;
}
.card-module__desc {
  font-size: 28rpx;
  font-weight: 400;
  color: #8a8880;
  line-height: 1.5;
}
```

**深色功能卡片**

```css
.card-module--dark {
  background-color: #181715;
  border: none;
  border-radius: 24rpx;
  padding: 64rpx;
}
.card-module--dark .card-module__title {
  color: #faf9f5;
}
.card-module--dark .card-module__desc {
  color: rgba(250, 249, 245, 0.7);
}
```

**代码展示卡片**

```css
.code-card {
  background-color: #faf9f5;
  border: 1rpx solid #e5dfd4;
  border-radius: 24rpx;
  padding: 32rpx;
}
.code-card__dots {
  display: flex;
  gap: 8rpx;
  margin-bottom: 24rpx;
}
.code-card__dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 9999rpx;
}
.code-card__dot--red { background-color: #ff5f56; }
.code-card__dot--yellow { background-color: #ffbd2e; }
.code-card__dot--green { background-color: #27c93f; }
.code-card__body {
  font-family: 'Courier New', Courier, monospace;
  font-size: 24rpx;
  color: #141413;
  line-height: 1.5;
}
.code-card__comment {
  color: #b5b2aa;
}
```

**学习入口 Pill（替代安装命令）**

```css
.entry-pill {
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 24rpx 40rpx;
  background-color: #f5f0e8;
  color: #141413;
  border-radius: 9999rpx;
  font-family: 'Courier New', Courier, monospace;
  font-size: 26rpx;
  line-height: 1;
}
.entry-pill__icon {
  margin-right: 16rpx;
}
```

**FAQ 行**

```css
.faq-row {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #e5dfd4;
}
.faq-row__question {
  font-size: 30rpx;
  font-weight: 500;
  color: #141413;
  font-family: system-ui, -apple-system, sans-serif;
}
.faq-row__answer {
  font-size: 28rpx;
  font-weight: 400;
  color: #8a8880;
  margin-top: 8rpx;
  line-height: 1.5;
}
```

**深色 CTA 条带**

```css
.cta-strip-dark {
  background-color: #181715;
  border-radius: 24rpx;
  padding: 48rpx 64rpx;
  text-align: center;
}
.cta-strip-dark__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 34rpx;
  font-weight: 400;
  letter-spacing: -1rpx;
  color: #faf9f5;
  margin-bottom: 32rpx;
}
```

**Section 间距**

```css
.section {
  padding: 64rpx 32rpx;
}
.section--first {
  padding-top: 80rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页**：Ollama 的"文档即系统"哲学与工具类首页高度契合——纯色画布 + 居中标题 + 药丸 CTA + 功能卡片列表
- **模块详情页**：如排序可视化、数据结构可视化的入口页，用功能卡片 + 代码展示卡片呈现
- **学习报告/统计页**：深色卡片突出关键数据，其余用浅色卡片平铺
- **关于/帮助页**：FAQ 行 + 正文段落的 Markdown 文档式排版

### 4.2 不适合用在哪些页面
- **刷题页面**：需要紧凑的选项列表和答题交互，药丸按钮和大间距不适合高频操作
- **错题本列表**：需要紧凑列表，Ollama 的大间距卡片风格过于松散
- **导入/设置表单**：需要表单控件，Ollama 几乎无表单设计参考
- **考试模式**：需要沉浸式答题，装饰性元素应最少化

### 4.3 混搭建议
- **药丸几何体（9999rpx）**作为本项目所有按钮和输入框的默认圆角，与暖奶油风格搭配自然
- **深色卡片**仅用于每页一个"重点推荐"区域，不重复使用
- **代码展示卡片**（含红绿灯装饰）适合所有需要展示代码/命令的场景
- **FAQ 行样式**可用于任何展开式问答列表
- **section 节奏 64rpx**（非原方案 88px）适配小程序屏幕
- **标题保持 Georgia 400 -3rpx**，不用 SF Pro Rounded
- **CTA 保持珊瑚色 #cc785c**，不用纯黑——暖调体系不变

---

## 5. 实施检查清单

- [ ] 画布使用 #faf9f5（暖奶油），不用 Ollama 的纯白 #ffffff
- [ ] CTA 使用珊瑚色 #cc785c，不用 Ollama 的纯黑 #000000
- [ ] 标题使用 Georgia 400 weight + 负 tracking，不用 SF Pro Rounded
- [ ] 所有交互元素圆角 9999rpx（药丸）
- [ ] 卡片圆角 24rpx（非 Ollama 的 12px/24rpx）
- [ ] 深色面使用 #181715，文字 #faf9f5
- [ ] 每页最多一张深色卡片 + 一条深色 CTA 条带
- [ ] 分割线使用 1rpx solid #e5dfd4
- [ ] 零阴影，仅 hairline 深度
- [ ] section 间距 64rpx（非 88px）
- [ ] 代码卡片含红绿灯装饰圆点
- [ ] 学习入口 Pill 替代安装命令 Pill
- [ ] 所有尺寸使用 rpx 单位
- [ ] 按钮高度 72rpx（触控友好）
- [ ] 正文色 #8a8880，次要色 #6c6a64

---

## 6. 参考文件

- 原方案：.claude/skills/ollama-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
- 项目风格：Claude Design 暖奶油画布（#faf9f5 画布、#efe9de 卡片、#cc785c 珊瑚 CTA、#141413 暖墨、#181715 深色面）
