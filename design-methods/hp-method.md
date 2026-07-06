# HP 设计方案 -> 刷个冯题 实施方法论

> 参考来源：`.claude/skills/hp-design.md`（HP Design Analysis, alpha）
> 适用项目：刷个冯题 微信小程序（WXML + WXSS + JS, 原生框架）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

HP 的设计语言是一种"企业-消费者混合目录"风格。核心理念：

- **极简色彩**：整个系统只用一个品牌色（HP Electric Blue `#024ad8`），其余靠黑白灰完成全部视觉层次
- **商业感留白**：大量白色空间围绕产品摄影，留白不追求"呼吸感"而是追求"目录感"
- **双层圆角哲学**：按钮保持锐利（4px），卡片保持柔和（16px），形成清晰的交互-容器层次
- **暗色收尾**：每个页面节奏以深色面板（`#1a1a1a`）收尾，形成品牌锚点
- **克制的装饰**：唯一的装饰元素是 HP 标志性的蓝色人字形斜杠（chevron），源自 HP logo 的双斜线

### 1.2 视觉DNA

| 特征 | HP 方案 | 与暖奶油画布差异 |
|---|---|---|
| 画布底色 | 纯白 `#ffffff` | 暖奶油 `#faf9f5`，HP 更冷更白 |
| 卡片底色 | 纯白 + hairline 边框或阴影 | 奶油卡片 `#efe9de`，HP 卡片与画布同色靠边框区分 |
| 深色面板 | `#1a1a1a` 近黑 | `#181715` 深海军蓝，HP 更纯黑 |
| 阴影策略 | Soft Lift `0 2px 8px rgba(26,26,26,0.08)` | 零阴影靠色块对比，HP 有轻阴影 |
| 装饰元素 | 蓝色人字形斜杠 | 暖奶油画布无装饰元素 |

### 1.3 色彩策略

HP 的色彩极其克制：

- **品牌色**：`#024ad8`（HP Electric Blue），用于 CTA、链接、装饰斜杠，每屏最多出现两次
- **画布**：`#ffffff` 纯白
- **灰色带**：`#f7f7f7`（cloud）和 `#e8e8e8`（fog）交替使用，形成页面节奏
- **文字**：`#1a1a1a`（ink）为主，`#3d3d3d`（charcoal）和 `#636363`（graphite）为辅
- **强调色**：`#ff5050`（bloom-coral）仅用于促销标签

**关键差异**：暖奶油画布的 CTA 是珊瑚色 `#cc785c`，HP 是蓝色 `#024ad8`。两者都是单色 CTA 策略，但色温完全不同——HP 冷静科技感，暖奶油画布温暖亲切感。

### 1.4 字体策略

HP 使用单一字体族 **Forma DJR Micro**（商用字体），全文统一：

| 角色 | HP 方案 | 暖奶油画布 |
|---|---|---|
| 标题 | Forma DJR Micro 500 weight | Georgia 衬线 400 weight |
| 正文 | Forma DJR Micro 400 weight | 系统字体 |
| 按钮 | Forma DJR Micro 600/700 weight, uppercase | 系统字体 |
| 标题间距 | letter-spacing: 0 | letter-spacing: -3rpx |

**关键差异**：HP 用无衬线几何体（机械感），暖奶油画布用衬线体（人文感）。HP 按钮标签全大写且加宽字距，暖奶油画布不用全大写。

### 1.5 布局与组件模式

- **卡片圆角**：16px（产品卡片），4px（按钮）——两层分明
- **间距基准**：8px 网格，常用 16/24/32px
- **阴影**：Soft Lift `0 2px 8px rgba(26,26,26,0.08)` 仅用于产品卡片和定价卡片
- **深色带**：`#1a1a1a` 背景用于推荐语、帮助区、页脚
- **灰色交替带**：`#f7f7f7` 和 `#e8e8e8` 用于区域节奏分隔

---

## 2. 适配分析

### 2.1 可直接迁移

以下设计元素可以直接用于刷个冯题，无需改造：

| 元素 | 理由 |
|---|---|
| 单色 CTA 策略（每屏最多两处强调色） | 与暖奶油画布理念一致 |
| 深色面板收尾（深色帮助区/页脚） | 暖奶油画布已有 `#181715` 深色面 |
| 灰色交替带节奏 | 可用 `#f7f7f7` 或调整为暖灰 `#f0ece4` |
| 按钮与卡片的圆角分层策略 | 4px 按钮 + 16px 卡片的对比可借鉴 |
| 间距基准（8px 网格） | rpx 环境下用 8rpx 倍数即可 |
| 按钮高度 44px（符合触摸目标规范） | 直接对应 88rpx |

### 2.2 需要改造

以下元素需要调整后才能使用：

| 元素 | 原方案 | 改造方向 |
|---|---|---|
| 品牌蓝色 CTA | `#024ad8` | 保留为辅助强调色（如链接、标签），CTA 主色仍用 `#cc785c` |
| 纯白画布 | `#ffffff` | 改为暖白 `#faf9f5` 保持项目统一 |
| 白色卡片 | `#ffffff` + 边框/阴影 | 改为 `#efe9de` 奶油卡片，去掉阴影 |
| Soft Lift 阴影 | `0 2px 8px rgba(26,26,26,0.08)` | 改为零阴影，靠色块对比（暖奶油画布规范） |
| Forma DJR Micro 字体 | 专用无衬线 | 改为 Georgia（标题）+ 系统字体（正文），保持项目统一 |
| 全大写按钮标签 | `text-transform: uppercase` | 改为正常大小写（微信小程序中文环境下全大写不适用） |
| 人字形装饰斜杠 | HP 品牌专属装饰 | 不迁移，这是 HP logo 的品牌锚点 |

### 2.3 不可迁移

以下元素不应在刷个冯题中使用：

| 元素 | 理由 |
|---|---|
| HP 人字形斜杠（chevron-decoration） | 与 HP logo 强绑定，搬过来会显得突兀 |
| Forma DJR Micro 商用字体 | 版权受限，且与项目 Georgia 衬线风格冲突 |
| Soft Lift 阴影 | 暖奶油画布规范为零阴影 |
| 纯白画布 + 纯白卡片 | 与暖奶油画布的暖色系冲突 |
| `#024ad8` 作为主 CTA | 与暖奶油画布的 `#cc785c` 珊瑚色冲突 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

将 HP 色彩映射到刷个冯题的实际用色：

| HP 色彩 | HP 值 | 刷个冯题映射 | 映射值 | 说明 |
|---|---|---|---|---|
| canvas | `#ffffff` | 页面背景 | `#faf9f5` | 暖白替代纯白 |
| paper | `#ffffff` | 卡片背景 | `#efe9de` | 奶油卡片替代纯白 |
| cloud | `#f7f7f7` | 交替带背景 | `#f0ece4` | 调整为暖灰保持色温统一 |
| fog | `#e8e8e8` | 次要分隔区 | `#e8e3d8` | 暖灰替代冷灰 |
| steel | `#c2c2c2` | 边框色 | `#d4cfc6` | 暖灰边框 |
| primary | `#024ad8` | 辅助强调色 | `#4a7ec7` | 用于链接、标签等非 CTA 元素 |
| primary-deep | `#0e3191` | 辅助强调按下态 | `#3a5e97` | 链接按下色 |
| ink | `#1a1a1a` | 主文字色 | `#141413` | 暖墨替代纯黑 |
| charcoal | `#3d3d3d` | 次要文字 | `#6c6a64` | 暖灰文字 |
| graphite | `#636363` | 辅助文字 | `#8a877e` | 更暖的灰 |
| on-ink | `#ffffff` | 深色面文字 | `#faf9f5` | 暖白文字 |
| ink (深色面板) | `#1a1a1a` | 深色表面 | `#181715` | 深海军蓝 |
| bloom-coral | `#ff5050` | 促销标签 | `#cc785c` | 直接用项目主色做强调 |
| error | `#b3262b` | 错误色 | `#b3262b` | 语义色可保留 |

### 3.2 字体映射 (rpx)

将 HP 的 px 值转换为 rpx，并替换字体族：

| HP Token | HP 值 | 刷个冯题 WXSS | 说明 |
|---|---|---|---|
| display-xxl | 72px / 500 / 1.0 | `font-size: 72rpx; font-weight: 400; line-height: 1.0; font-family: Georgia, serif; letter-spacing: -3rpx;` | 首页大标题 |
| display-xl | 56px / 500 / 1.0 | `font-size: 56rpx; font-weight: 400; line-height: 1.0; font-family: Georgia, serif; letter-spacing: -3rpx;` | 区域标题 |
| display-lg | 44px / 500 / 1.0 | `font-size: 44rpx; font-weight: 400; line-height: 1.1; font-family: Georgia, serif; letter-spacing: -2rpx;` | 子区域标题 |
| display-md | 32px / 500 / 1.0 | `font-size: 32rpx; font-weight: 400; line-height: 1.2; font-family: Georgia, serif; letter-spacing: -2rpx;` | 卡片大标题 |
| display-sm | 24px / 500 / 1.17 | `font-size: 28rpx; font-weight: 400; line-height: 1.3; font-family: Georgia, serif; letter-spacing: -1rpx;` | 卡片标题 |
| body-lg | 18px / 400 / 1.33 | `font-size: 30rpx; font-weight: 400; line-height: 1.6;` | 引导段落 |
| body-md | 16px / 400 / 1.38 | `font-size: 28rpx; font-weight: 400; line-height: 1.6;` | 默认正文 |
| caption-md | 14px / 400 / 1.5 | `font-size: 24rpx; font-weight: 400; line-height: 1.5;` | 元数据、说明文字 |
| caption-sm | 12px / 400 / 1.33 | `font-size: 22rpx; font-weight: 400; line-height: 1.4;` | 脚注、法律文字 |
| button-md | 14px / 600 / 1.4 | `font-size: 28rpx; font-weight: 600; line-height: 1.4;` | 按钮标签（不用 uppercase） |

**注意**：HP 的 weight 500 标题在暖奶油画布中改为 weight 400（Georgia 衬线的 400 已有足够的视觉重量）。

### 3.3 组件设计规范

从 HP 方案中提取可复用的组件规范，适配到刷个冯题：

#### 主按钮 (button-primary)

```css
.btn-primary {
  background-color: #cc785c;        /* 暖奶油画布主色，替代 HP #024ad8 */
  color: #faf9f5;                    /* 暖白文字 */
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  border-radius: 8rpx;              /* HP 用 4px，这里用 8rpx 做微圆角 */
  padding: 24rpx 48rpx;
  height: 88rpx;                    /* 44px 对应 88rpx，符合触摸规范 */
  border: none;
}
.btn-primary:active {
  background-color: #a9583e;        /* 暖奶油画布 Active 色 */
}
```

#### 次要按钮 (button-outline)

```css
.btn-outline {
  background-color: transparent;
  color: #cc785c;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  border-radius: 8rpx;
  padding: 24rpx 48rpx;
  height: 88rpx;
  border: 2rpx solid #cc785c;
}
```

#### 产品卡片 (card-product) -- 题目卡片 / 工具卡片

```css
.card-product {
  background-color: #efe9de;        /* 奶油卡片，替代 HP 纯白 */
  border-radius: 24rpx;             /* HP 用 16px，这里用 24rpx 保持项目风格 */
  padding: 48rpx;                   /* HP 用 24px = 48rpx */
  /* 无阴影 — 暖奶油画布规范 */
  /* 无边框 — 靠色块对比区分层次 */
}
```

#### 深色面板 (promo-strip-dark) -- 帮助区 / 推荐区

```css
.panel-dark {
  background-color: #181715;        /* 深海军蓝，替代 HP #1a1a1a */
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 96rpx 48rpx;            /* HP 用 48px 32px，放大到 rpx */
}
```

#### 标签 (badge-pill)

```css
.badge {
  background-color: #141413;        /* 暖墨填充标签 */
  color: #faf9f5;
  font-size: 24rpx;
  border-radius: 16rpx;            /* HP 用 8px pill，这里用 16rpx */
  padding: 12rpx 24rpx;
}
.badge-outline {
  background-color: transparent;
  color: #141413;
  border: 2rpx solid #141413;
  border-radius: 16rpx;
  padding: 12rpx 24rpx;
}
```

#### 输入框 (text-input)

```css
.input {
  background-color: #faf9f5;
  color: #141413;
  font-size: 28rpx;
  border-radius: 8rpx;
  padding: 24rpx 32rpx;
  height: 88rpx;
  border: 2rpx solid #d4cfc6;
}
.input-focus {
  border-color: #141413;            /* HP focus 用 ink 色边框，这里沿用 */
}
```

#### 交替区域带 (section-band)

```css
.section-band-alt {
  background-color: #f0ece4;        /* 暖灰交替带，替代 HP #f7f7f7 */
  padding: 64rpx 48rpx;
}
```

### 3.4 页面布局模板

基于 HP 的页面节奏，适配到刷个冯题的典型页面结构：

#### 首页布局

```
+------------------------------------------+
|  [顶部导航栏 - 88rpx]                      |
+------------------------------------------+
|  [Hero 卡片 - 奶油卡片 #efe9de]             |
|    标题 (Georgia 56rpx)                    |
|    副标题 (28rpx)                          |
|    [主按钮 #cc785c]                        |
+------------------------------------------+
|  [工具网格 - 2列/3列]                       |
|    [工具卡片] [工具卡片]                     |
|    [工具卡片] [工具卡片]                     |
+------------------------------------------+
|  [学习状态带 - 暖灰 #f0ece4 背景]           |
|    进度条 + 统计数字                        |
+------------------------------------------+
|  [推荐区 - 深色面板 #181715]                |
|    推荐内容 + CTA                          |
+------------------------------------------+
|  [底部导航栏]                              |
+------------------------------------------+
```

#### 刷题页面布局

```
+------------------------------------------+
|  [顶部导航 - 试卷名 + 进度]                 |
+------------------------------------------+
|  [题目卡片 - 奶油卡片 #efe9de]              |
|    题号 + 题干                             |
|    [选项列表]                              |
|      选项 A                               |
|      选项 B                               |
|      选项 C                               |
|      选项 D                               |
+------------------------------------------+
|  [底部操作栏]                              |
|    [上一题] [下一题] [提交]                  |
+------------------------------------------+
```

### 3.5 WXSS 示例

#### 首页 Hero 卡片

```css
.hero-card {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 64rpx 48rpx;
  margin: 32rpx;
}
.hero-card__title {
  font-family: Georgia, serif;
  font-size: 56rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -3rpx;
  color: #141413;
  margin-bottom: 16rpx;
}
.hero-card__subtitle {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.6;
  color: #6c6a64;
  margin-bottom: 48rpx;
}
```

#### 工具卡片网格项

```css
.tool-card {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tool-card__icon {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 24rpx;
}
.tool-card__name {
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
  letter-spacing: -1rpx;
  color: #141413;
}
.tool-card__desc {
  font-size: 24rpx;
  color: #6c6a64;
  margin-top: 8rpx;
  text-align: center;
}
```

#### 深色推荐区

```css
.recommend-band {
  background-color: #181715;
  border-radius: 24rpx;
  padding: 64rpx 48rpx;
  margin: 32rpx;
}
.recommend-band__title {
  font-family: Georgia, serif;
  font-size: 32rpx;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -2rpx;
  color: #faf9f5;
  margin-bottom: 24rpx;
}
.recommend-band__text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #c8c5bd;
  margin-bottom: 48rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

HP 方案的以下特征最适合刷个冯题的这些页面：

| 页面 | 适合的 HP 特征 | 原因 |
|---|---|---|
| **首页工具箱** | 工具卡片网格 + 深色推荐区 + 交替带节奏 | HP 的目录式布局天然适合工具入口展示 |
| **试卷列表** | 产品卡片样式 + 标签系统 | HP 的 card-product 风格适合列表展示 |
| **学习驾驶舱** | 统计数字 + 灰色交替带 | HP 的商业感数据展示风格适合统计页 |
| **子网计算器** | 表单输入框 + 结果卡片 | HP 的输入框和结果展示组件可直接借鉴 |

### 4.2 不适合页面

| 页面 | 不适合的 HP 特征 | 原因 |
|---|---|---|
| **刷题页面** | HP 的商业目录风格 | 刷题需要沉浸式体验，不需要目录感 |
| **错题本** | HP 的产品展示模式 | 错题本更偏向教育场景，不需要商业包装 |
| **考试模式** | HP 的装饰性布局 | 考试模式需要极简、无干扰的界面 |

### 4.3 混搭建议

HP 方案最适合与暖奶油画布混搭的场景：

1. **首页布局参考 HP 的目录节奏**：Hero -> 工具网格 -> 交替带 -> 深色区 -> 底部，但色彩和字体保持暖奶油画布
2. **工具卡片参考 HP 的 card-product**：奶油卡片 + 无阴影 + 圆角 24rpx，但去掉 HP 的边框/阴影
3. **深色面板参考 HP 的 ink slab**：`#181715` 深色区用于推荐、帮助、页脚
4. **按钮参考 HP 的两层分法**：主按钮实心 + 次要按钮描边，但颜色用 `#cc785c` 而非 `#024ad8`
5. **输入框参考 HP 的 focus 处理**：focus 时边框变为文字色，不用光晕效果

---

## 5. 实施检查清单

在使用 HP 方案元素时，逐项检查：

- [ ] 画布底色是否为 `#faf9f5`（不是纯白 `#ffffff`）
- [ ] 卡片底色是否为 `#efe9de`（不是纯白）
- [ ] CTA 主色是否为 `#cc785c`（不是 `#024ad8`）
- [ ] 标题字体是否为 Georgia 衬线（不是 Forma DJR Micro）
- [ ] 标题 weight 是否为 400（不是 500）
- [ ] 是否有阴影？如果有，去掉（暖奶油画布为零阴影）
- [ ] 按钮是否用了 uppercase？如果是，去掉（中文环境不适用）
- [ ] 深色面板是否为 `#181715`（不是 `#1a1a1a`）
- [ ] 交替带是否为暖灰色调（不是冷灰 `#f7f7f7`）
- [ ] 圆角是否符合项目规范（卡片 24rpx，按钮 8rpx）
- [ ] 是否引入了 HP 人字形装饰？如果有，去掉
- [ ] 所有尺寸是否使用 rpx（不是 px）
- [ ] 触摸目标是否 >= 88rpx（44px）
- [ ] 文字色是否为 `#141413`（不是 `#1a1a1a`）

---

## 6. 参考文件

| 文件 | 说明 |
|---|---|
| `.claude/skills/hp-design.md` | HP 设计方案原始文件 |
| `PROJECT_HANDOFF.md` §25 | 暖奶油画布设计规范 |
| `.claude/skills/claude-design.md` | Claude Design 暖奶油画布设计语言 |
| `pages/index/index.wxss` | 首页当前样式参考 |
| `pages/index/index.wxml` | 首页当前布局参考 |
