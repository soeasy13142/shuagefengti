# Cohere 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/cohere-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Cohere 的设计语言是"克制的企业级 AI 界面"——用巨大的留白建立信任感，用白色画布 + 深绿/深海军蓝的全幅色带交替制造页面节奏。字体选择独树一帜：显示字体用 monospaced 感觉的 Unica77，body 也用 Unica77，形成"研究实验室"般的统一节奏。色彩极度克制，品牌色几乎不用于 UI，只通过摄影、珊瑚色标签和蓝色链接注入色彩。

### 1.2 视觉 DNA
- 白色画布为主，深绿（#003c33）/深海军蓝（#071829）全幅色带交替
- 巨大留白作为信任信号
- Monospaced 感觉的显示字体（Unica77），weight 400
- 柔和石材色（#eeece7）用于产品卡片
- 珊瑚色（#ff7759）仅用于博客分类标签
- Pill 形状 CTA 按钮
- 薄线几何插画，非装饰性
- 圆角卡片 8-22px

### 1.3 色彩策略
- 画布：#ffffff（纯白）
- 柔和石材：#eeece7（暖灰）
- 深绿：#003c33（产品色带）
- 深海军蓝：#071829（安全/金融色带）
- 主色/CTA：#17171c（近黑）
- 珊瑚色：#ff7759（博客标签）
- 链接蓝：#1863dc
- 文字：#212121（正文）、#93939f（次要）

### 1.4 字体策略
- 显示：CohereText / Unica77，96/72/60/48/32px，weight 400
- 正文：Unica77，16/18px，weight 400
- 按钮：Unica77 14px，weight 500
- 标签：CohereMono 14px，weight 400，+0.28px tracking

### 1.5 布局与组件模式
- 圆角：按钮 pill（32px），卡片 8-22px
- 间距：8px 基数，section 80px
- Pill CTA 按钮
- 薄线几何图标
- 信任 logo 条带：单色 + 大间距

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **巨大留白策略**：本项目可在首页 Hero 区和工具详情页使用大留白建立清晰感
- **柔和石材色卡片**：#eeece7 与本项目的 #efe9de 奶油卡片色非常接近，可直接使用
- **Pill 形状 CTA**：与本项目的 pill 标签风格一致
- **珊瑚色标签**：Cohere 的珊瑚色 #ff7759 与本项目的珊瑚色 #cc785c 色系接近，可用于分类标签
- **克制的色彩策略**：只用一个强调色做 CTA，与本项目一致
- **薄线几何图标**：适合学习工具的简洁风格

### 2.2 需要改造的设计决策
- **深绿/深海军蓝全幅色带**：在暖奶油体系中过于冷峻，改为用暖深色（#181715 深海军蓝）做局部强调区
- **Monospaced 显示字体**：本项目用 Georgia 衬线，保持温暖感。但可借鉴其 weight 400 的克制策略
- **白色画布**：本项目用暖白 #faf9f5，比纯白更温暖，更适合学习场景
- **80px section 节奏**：小程序页面较短，改为 48-64rpx

### 2.3 不可迁移的设计决策
- **CohereText / Unica77 自定义字体**：微信小程序不支持，用 Georgia + 系统 sans-serif
- **深绿 #003c33 作为产品色带**：与暖奶油基调冲突，除非做深色模式变体
- **研究论文列表式的密集排版**：小程序不适合这种信息密度
- **双列表单布局**：小程序通常单列

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #ffffff | #faf9f5 | 暖白替代纯白 |
| Soft Stone（石材） | #eeece7 | #efe9de | 奶油卡片，极接近 |
| Deep Green（色带） | #003c33 | #181715 | 用暖深色替代冷绿 |
| Dark Navy（色带） | #071829 | #181715 | 统一暖深色 |
| Primary（CTA） | #17171c | #cc785c | 珊瑚色替代近黑 |
| Coral（标签） | #ff7759 | #cc785c | 统一珊瑚色系 |
| Action Blue（链接） | #1863dc | #cc785c | 用珊瑚色做链接色 |
| Ink（正文） | #212121 | #141413 | 暖墨 |
| Muted（次要） | #93939f | #6c6a64 | 暖灰 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 96px/400/-1.92px | 72rpx/400/-3rpx | Georgia 衬线 |
| Section 标题 | 60px/400/-1.2px | 48rpx/400/-2rpx | |
| 卡片标题 | 32px/400/-0.32px | 36rpx/400/-1rpx | |
| Feature 标题 | 24px/400 | 32rpx/400 | |
| 正文大 | 18px/400 | 30rpx/400 | |
| 正文 | 16px/400 | 28rpx/400 | |
| 按钮 | 14px/500 | 26rpx/600 | 保留 600 做按钮强调 |
| 标签 | 14px/400 mono | 24rpx/400 | 系统等宽 |

### 3.3 组件设计规范

**Hero 区**
- 背景：#faf9f5
- 上下留白：96rpx（借鉴 Cohere 的大留白策略）
- 标题：72rpx Georgia，weight 400，-3rpx tracking
- 副标题：28rpx，#6c6a64
- CTA：pill 形状，珊瑚色

**产品卡片（Product Card）**
- 背景：#efe9de（柔和石材色）
- 圆角：16rpx
- 内边距：48rpx
- 包含：pill 标签 + 标题 + 描述 + 链接

**深色色带区（Dark Feature Band）**
- 背景：#181715
- 文字：#faf9f5
- 圆角：24rpx
- 内边距：80rpx
- 用于：重要功能强调区

**Pill CTA 按钮**
- 背景：#cc785c
- 文字：#faf9f5
- 圆角：9999rpx
- 高度：80rpx
- 内边距：24rpx × 48rpx

**标签（Blog Filter Chip）**
- 背景：透明 + 1rpx #cc785c 边框
- 文字：#cc785c
- 圆角：16rpx
- 内边距：8rpx × 24rpx
- Active 状态：背景 #cc785c，文字 #faf9f5

### 3.4 页面布局模板

**Hero 区（大留白风格）**
- 上下 96rpx 留白
- 居中标题 + 居中副标题
- 单个 pill CTA 按钮
- 无插画，纯文字

**功能展示区**
- 3 列卡片网格（桌面），1 列（移动）
- 每张卡片：图标 + 标题 + 描述 + pill 标签
- 卡片间距 24rpx

**深色强调区**
- 全宽深色背景（#181715）
- 白色文字
- 用于：核心功能亮点或数据展示

**信任/数据条带**
- 单行 3-4 个数据点
- 大间距，克制排版
- 数字用珊瑚色

### 3.5 WXSS 实现示例

**大留白 Hero**

```css
.hero-section {
  padding: 96rpx 48rpx;
  text-align: center;
  background-color: #faf9f5;
}
.hero-section__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 72rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  color: #141413;
  line-height: 1.1;
}
.hero-section__subtitle {
  font-size: 28rpx;
  color: #6c6a64;
  margin-top: 24rpx;
  line-height: 1.5;
}
```

**柔和石材色卡片**

```css
.product-card {
  background-color: #efe9de;
  border-radius: 16rpx;
  padding: 48rpx;
}
.product-card__tag {
  display: inline-block;
  border: 1rpx solid #cc785c;
  color: #cc785c;
  border-radius: 16rpx;
  padding: 8rpx 24rpx;
  font-size: 24rpx;
}
.product-card__tag--active {
  background-color: #cc785c;
  color: #faf9f5;
}
```

**深色强调区**

```css
.dark-band {
  background-color: #181715;
  border-radius: 24rpx;
  padding: 80rpx 48rpx;
  color: #faf9f5;
}
.dark-band__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 48rpx;
  font-weight: 400;
  letter-spacing: -2rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具详情页**：Cohere 的大留白 + 柔和石材色卡片适合展示单个工具的详细功能
- **关于页/介绍页**：大留白 + 居中排版适合品牌介绍
- **学习报告页**：深色强调区 + 数据展示适合学习数据总结

### 4.2 不适合用在哪些页面
- **首页功能入口**：Cohere 的克制风格过于冷静，首页需要更温暖活泼的入口卡片
- **错题本列表**：信息密度不够，需要更紧凑的列表排版
- **设置页**：大留白会让设置项显得过于稀疏

### 4.3 混搭建议
- **保留暖奶油画布**作为全局背景
- **借鉴 Cohere 的大留白策略**用于详情页 Hero 区
- **用 #efe9de 奶油卡片**替代 Cohere 的 #eeece7 石材色（极接近）
- **深色强调区**用暖深色 #181715 替代冷绿 #003c33
- **标签系统**借鉴 Cohere 的 pill 标签 + 珊瑚色边框

---

## 5. 实施检查清单

- [ ] 详情页 Hero 区使用大留白（96rpx 上下）
- [ ] 柔和石材色卡片使用 #efe9de，圆角 16rpx
- [ ] 深色强调区使用 #181715，不使用冷绿色
- [ ] Pill CTA 按钮圆角 9999rpx
- [ ] 标签使用 pill 形状 + 珊瑚色边框
- [ ] 留白比例：详情页 > 首页 > 列表页
- [ ] Georgia 标题保持 400 weight
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/cohere-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
