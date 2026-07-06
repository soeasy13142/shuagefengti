# Airbnb 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/airbnb-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Airbnb 的设计核心是 **"摄影驱动的温暖市集"** —— 以纯白画布为底，单一品牌色 Rausch (#ff385c) 作为唯一的视觉电压，信任摄影和慷慨留白而非字体粗细来传递视觉重量。设计语言表达的是"友好、人性、可接近"。

### 1.2 视觉 DNA
1. **单色电压**：Rausch (#ff385c) 承载所有主 CTA、搜索按钮、收藏心形
2. **摄影优先**：卡片以图片为主角，文字信息退居其次
3. **全圆角语言**：按钮 8px、卡片 14px、搜索栏全圆角(9999px)，无硬角
4. **轻字重显示**：标题 500-700，正文 400，信任图片而非粗字
5. **稀疏阴影**：仅一个阴影层级，用于卡片悬浮和下拉菜单
6. **密集网格市集**：卡片间距 16px，区域间距 64px，"开放 hero + 密集内容"
7. **pill 形搜索栏**：品牌标志性的全圆角搜索组件
8. **信息层级靠图片**：评分数字 64px/700 是系统中唯一靠字号主导的元素

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 主色 CTA | #ff385c (Rausch) | 按钮、搜索、收藏 |
| 主色 Active | #e00b41 | 按下态 |
| 主色 Disabled | #ffd1da | 禁用态 |
| 正文墨色 | #222222 | 标题、正文 |
| 次要文字 | #6a6a6a | 副标题、标签 |
| 画布 | #ffffff | 页面底色 |
| 表面柔和 | #f7f7f7 | 禁用字段、次导航 |
| 表面卡片 | #ffffff | 卡片底色 |
| 分割线 | #dddddd | 1px 边框 |
| 错误文字 | #c13515 | 表单验证 |

### 1.4 字体策略
- **字体族**：Airbnb Cereal VF（自定义可变字体），回退 Circular → system-ui
- **显示字重**：500-700，刻意轻量
- **正文字重**：400
- **字号范围**：标题 22-28px、正文 16px、卡片 meta 14px、徽章 11px
- **行高**：标题 1.18-1.43、正文 1.5
- **无负 letter-spacing**：Airbnb 不使用紧缩追踪

### 1.5 布局与组件模式
- **按钮**：8px 圆角、48px 高度、14×24px 内边距
- **卡片**：14px 圆角、白色底、图片优先
- **搜索栏**：全圆角 pill 形、64px 高、分段式
- **间距系统**：4px 基础，8/12/16/24/32/48/64px 梯度
- **区域间距**：64px（比典型 SaaS 的 80-96px 更紧凑，因市集需要更高卡片密度）
- **阴影**：仅一层 —— `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px`

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **单色 CTA 策略**：Airbnb 用一个颜色承载所有主操作，与暖奶油画布的珊瑚色 (#cc785c) 策略完全一致 —— 一个品牌色做所有 CTA
2. **轻字重显示标题**：Airbnb 标题 500-700 的"不抢摄影风头"思路，与暖奶油画布 Georgia 衬线 400 weight 的"谦逊标题"哲学高度吻合
3. **卡片圆角层级**：Airbnb 的 8px 按钮 / 14px 卡片，可映射为本项目的 8rpx 按钮 / 24rpx 卡片（当前规范）
4. **密集网格布局**：市集式卡片密度（16px 间距）适合工具箱首页的功能卡片区
5. **无阴影/低阴影哲学**：Airbnb 仅一层阴影，暖奶油画布零阴影 —— 精神一致
6. **间距系统**：4px 基础单位与 rpx 体系天然兼容

### 2.2 需要改造的设计决策

| 原方案做法 | 本项目应该怎么做 | 原因 |
|---|---|---|
| 白色画布 #ffffff | 暖奶油画布 #faf9f5 | 暖奶油画布是本项目核心设计语言，白色画布会破坏温暖感 |
| 纯黑墨色 #222222 | 暖墨 #141413 | 配合暖色画布，需使用带暖调的深色 |
| Rausch 珊瑚 #ff385c | 珊瑚 CTA #cc785c | 本项目的珊瑚更暖、更沉稳，适合学习工具而非消费市集 |
| Airbnb Cereal VF 字体 | Georgia 衬线 + system-ui | 微信小程序无法加载自定义字体，Georgia 是最接近的衬线替代 |
| pill 形搜索栏 | 可采用，但改为 9999rpx 圆角 | 微信小程序中可用 border-radius 实现 pill 形 |
| 摄影优先的卡片 | 图标/emoji + 文字优先 | 学习工具无大量摄影素材，用图标和色块代替 |
| 64px 区域间距 | 64rpx（基本一致） | 直接映射 |

### 2.3 不可迁移的设计决策

1. **摄影驱动的视觉层级**：本项目是学习工具，没有大量高质量摄影素材，无法依赖图片建立视觉重量
2. **Airbnb Cereal VF 可变字体**：微信小程序不支持加载外部可变字体，且该字体为 Airbnb 授权字体
3. **"NEW" 标签和产品导航三栏**：本项目是单体小程序，不需要多产品线导航
4. **64px 评分显示数字**：学习工具的评分/正确率展示不需要如此夸张的字号
5. **子品牌色（Luxe 紫、Plus 品红）**：本项目无子品牌体系

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Airbnb 角色 | 原色值 | 本项目色值 | 说明 |
|---|---|---|---|
| 主色 CTA | #ff385c | #cc785c | 珊瑚色，更暖更沉稳 |
| 主色 Active | #e00b41 | #a9583e | 深珊瑚按下态 |
| 主色 Disabled | #ffd1da | #e6dfd8 | 暖奶油禁用态 |
| 正文墨色 | #222222 | #141413 | 暖墨文字 |
| 次要文字 | #6a6a6a | #6c6a64 | 暖灰次要文字 |
| 画布 | #ffffff | #faf9f5 | 暖奶油画布 |
| 表面卡片 | #ffffff | #efe9de | 奶油卡片底色 |
| 表面柔和 | #f7f7f7 | #f5f0e8 | 柔和分隔区 |
| 分割线 | #dddddd | #e6dfd8 | 暖调分割线 |
| 错误文字 | #c13515 | #c64545 | 暖调错误色 |
| 深色表面 | 无 | #181715 | 深海军蓝（Airbnb 无此概念） |

### 3.2 字体映射

| Airbnb Token | Airbnb 参数 | 本项目参数 | 说明 |
|---|---|---|---|
| display-xl | 28px / 700 / 1.43 | 48rpx / 400 / 1.1 / -3rpx | Georgia 衬线，负 letter-spacing |
| display-lg | 22px / 500 / 1.18 | 40rpx / 400 / 1.1 / -2rpx | 段标题 |
| display-md | 21px / 700 / 1.43 | 36rpx / 400 / 1.15 | 小节标题 |
| body-md | 16px / 400 / 1.5 | 28rpx / 400 / 1.6 | 正文 |
| body-sm | 14px / 400 / 1.43 | 26rpx / 400 / 1.5 | 卡片 meta |
| caption | 14px / 500 / 1.29 | 24rpx / 500 / 1.4 | 标签 |
| button-md | 16px / 500 / 1.25 | 28rpx / 500 / 1 | 按钮文字 |
| badge | 11px / 600 / 1.18 | 20rpx / 600 / 1.2 | 小徽章 |

### 3.3 组件设计规范

**按钮（Primary）**
- 背景：#cc785c，文字：#ffffff
- 圆角：8rpx（Airbnb 8px → 8rpx）
- 内边距：24rpx 40rpx
- 高度：80rpx
- 字号：28rpx / 500

**按钮（Secondary）**
- 背景：#faf9f5，文字：#141413
- 边框：1rpx solid #e6dfd8
- 圆角：8rpx

**卡片**
- 背景：#efe9de
- 圆角：24rpx（比 Airbnb 的 14px 稍大，符合暖奶油画布规范）
- 内边距：32rpx
- 无阴影

**标签（Badge / Pill）**
- 背景：#efe9de，文字：#141413
- 圆角：9999rpx（pill 形）
- 内边距：6rpx 16rpx
- 字号：20rpx / 600

**搜索栏（如需要）**
- 背景：#faf9f5
- 圆角：9999rpx（pill 形）
- 高度：80rpx
- 内边距：24rpx 40rpx
- 参考 Airbnb 的分段式搜索思路，可改为单行搜索

### 3.4 页面布局模板

**Hero 区**
- 高度：自适应，最小 200rpx
- 内边距：上下 96rpx，左右 48rpx
- 内容：Georgia 衬线标题 + 一行副标题 + 主 CTA

**功能卡片区（首页工具网格）**
- 采用 Airbnb 市集密集网格思路
- 卡片间距：24rpx（比 Airbnb 的 16px 略大，因 rpx 在小屏需要更大触控区）
- 2 列布局，每卡片：图标 + 标题 + 简短描述
- 参考 Airbnb 的 property-card 结构

**列表区（试卷列表、记录列表）**
- 列表项间距：16rpx
- 每项：标题 + meta 信息行（日期、题数、正确率）
- 参考 Airbnb 的 amenity-row 简洁列表风格

**底部操作区**
- 固定底部或页面底部
- 主 CTA 全宽
- 参考 Airbnb 的 sticky bottom bar 模式

### 3.5 WXSS 实现示例

**Airbnb 风格卡片（适配暖奶油画布）**
```css
.card-airbnb {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  /* 无阴影 —— 暖奶油画布规范 */
}

.card-airbnb__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.4;
  color: #141413;
}

.card-airbnb__meta {
  font-size: 24rpx;
  font-weight: 400;
  line-height: 1.5;
  color: #6c6a64;
  margin-top: 8rpx;
}
```

**Airbnb 风格 pill 按钮**
```css
.btn-pill-airbnb {
  background-color: #cc785c;
  color: #ffffff;
  border-radius: 9999rpx;
  padding: 16rpx 32rpx;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1;
  text-align: center;
}

.btn-pill-airbnb:active {
  background-color: #a9583e;
}
```

**Airbnb 风格密集网格**
```css
.grid-airbnb {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  padding: 0 32rpx;
}

.grid-airbnb__item {
  width: calc(50% - 12rpx);
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页功能卡片区**：Airbnb 的密集市集网格非常适合工具箱的 2 列功能卡片布局
- **试卷列表页**：Airbnb 的 property-card 结构（图片 + 标题 + meta）可改造为（图标 + 标题 + 题数/日期）
- **搜索/筛选场景**：pill 形搜索栏和 filter chip 适合试题搜索

### 4.2 不适合用在哪些页面
- **刷题页面**：需要高信息密度和快速操作，Airbnb 的"留白优先"不适合
- **数据可视化页面**（排序、数据结构）：需要精确的数值展示，非市集式浏览
- **暗色模式页面**：Airbnb 无暗色模式设计，无法参考

### 4.3 混搭建议
- **首页 Hero 区**：采用 Claude Design 的暖奶油画布 serif 标题风格
- **功能卡片区**：采用 Airbnb 的密集网格 + 圆角卡片
- **刷题页面**：保持当前的简洁风格，不引入 Airbnb 的市集感
- **整体色彩**：始终使用暖奶油画布的色板，Airbnb 仅提供布局和组件形态参考

---

## 5. 实施检查清单

- [ ] 所有颜色替换为暖奶油画布色板（#faf9f5 画布、#efe9de 卡片、#cc785c CTA）
- [ ] 字体替换为 Georgia 衬线 + system-ui，weight 400 为主
- [ ] 所有 px 单位转换为 rpx（1:1 映射）
- [ ] 卡片圆角统一为 24rpx（非 Airbnb 的 14px）
- [ ] 阴影移除（暖奶油画布零阴影规范）
- [ ] pill 形元素使用 9999rpx border-radius
- [ ] 间距系统对齐 4rpx 基础单位
- [ ] 按钮高度至少 80rpx（微信小程序触控友好）
- [ ] 密集网格间距不小于 24rpx

---

## 6. 参考文件

- 原方案：.claude/skills/airbnb-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
