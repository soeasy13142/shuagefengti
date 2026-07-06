# Binance 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/binance-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Binance 的设计核心是 **"自信的金融交易平台"** —— 深近黑画布搭配标志性黄色 (#FCD535) 作为唯一的品牌电压。系统信任黄色的稀缺性和色块对比来建立层级，而非阴影或装饰。营销页面默认暗色主题，交易页面切换亮色主题，但黄色 CTA 和绿/红交易色贯穿两种模式。

### 1.2 视觉 DNA
1. **单色黄色电压**：#FCD535 承载所有主 CTA、品牌标识、价值主张标题
2. **双主题系统**：营销暗色 / 交易亮色，共享黄色 CTA
3. **双字体系统**：BinanceNova（编辑文字）+ BinancePlex（数字/金融数据）
4. **显示字重 700**：比多数营销系统更重，因交易平台需要数字一目了然
5. **小到中等圆角**：按钮 6px、输入框 8px、卡片 12px，比 SaaS 系统更紧凑
6. **色块对比深度**：无重阴影，靠 canvas-dark vs surface-card-dark 的明度差表达层级
7. **交易语义色**：绿涨 (#0ecb81) / 红跌 (#f6465d) 贯穿全系统
8. **密集布局**：section 间距 80px，比典型营销站更紧凑

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 主色黄色 | #FCD535 | CTA、品牌标识、价值标题 |
| 黄色 Active | #f0b90b | 按下态 |
| 黄色 Disabled | #3a3a1f | 暗底禁用态 |
| 亮色画布 | #ffffff | 交易页底色 |
| 暗色画布 | #0b0e11 | 营销页底色 |
| 暗色卡片 | #1e2329 | 暗色提升卡片 |
| 暗色提升 | #2b3139 | 嵌套卡片 |
| 亮色柔和 | #fafafa | footer、禁用态 |
| 墨色 | #181a20 | 亮色面文字 |
| 暗色正文 | #eaecef | 暗色面文字 |
| 次要文字 | #707a8a | 通用次要文字 |
| 交易涨 | #0ecb81 | 价格上涨 |
| 交易跌 | #f6465d | 价格下跌 |
| 信息蓝 | #3b82f6 | 焦点环、信息徽章 |

### 1.4 字体策略
- **BinanceNova**：编辑字体（标题、段落、按钮、导航）
- **BinancePlex**：数字字体（价格、交易量、统计数字）
- **显示字重**：600-700，比一般营销系统更重
- **正文字重**：400
- **数字字重**：500
- **字号范围**：hero 64px、显示 32-48px、正文 14px、caption 12px

### 1.5 布局与组件模式
- **按钮**：6px 圆角、40px 高度、12×24px 内边距；pill 形用于顶部注册
- **卡片**：12px 圆角、暗色面 #1e2329、无阴影
- **间距**：4px 基础、section 80px
- **最大宽度**：1280-1440px
- **footer**：亮色底 (#fafafa)，即使页面主体是暗色 —— 刻意的"营销重置"

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **双主题思路**：Binance 的"营销暗色 / 交易亮色"可映射为本项目的"首页/展示暗色 / 刷题/工具亮色"
2. **数字专用字体思路**：BinancePlex 的"数字用专门字体"理念，可在本项目中用等宽字体展示代码/数值
3. **色块对比深度**：Binance 靠 canvas-dark vs surface-card-dark 明度差表达层级，与暖奶油画布的零阴影哲学一致
4. **footer 亮色反转**：暗色页面结尾用亮色 footer 的"重置"技巧，可借鉴
5. **密集 section 节奏**：80px section 间距适合学习工具的高信息密度需求

### 2.2 需要改造的设计决策

| 原方案做法 | 本项目应该怎么做 | 原因 |
|---|---|---|
| 暗色画布 #0b0e11 | 暖奶油画布 #faf9f5 为主 | 本项目以暖色为基调，暗色仅用于强调区块 |
| 黄色 CTA #FCD535 | 珊瑚 CTA #cc785c | 暖珊瑚更适合学习工具的温暖感 |
| 黄底黑字 CTA | 珊瑚底白字 CTA | 黄底黑字在学习工具中显得过于"交易" |
| BinanceNova/BinancePlex 字体 | Georgia 衬线 + system-ui | 微信小程序无法加载自定义字体 |
| 6px 按钮圆角 | 8rpx 按钮圆角 | 暖奶油画布的圆角语言更友好 |
| 12px 卡片圆角 | 24rpx 卡片圆角 | 与暖奶油画布保持一致 |
| 交易绿/红语义色 | 正确/错误语义色 | 学习工具用 success/error 替代涨跌 |
| 正文 14px | 26rpx（≈13px @2x）| 适配小程序屏幕 |

### 2.3 不可迁移的设计决策

1. **黄底黑字 CTA**：与暖奶油画布的珊瑚底白字冲突，且在学习工具中显得过于金融化
2. **BinancePlex 数字字体**：授权字体，微信小程序无法加载
3. **交易绿/红语义色**：学习工具不需要涨跌语义，会造成功能混淆
4. **暗色为默认主题**：暖奶油画布以暖奶油为基调，暗色仅作辅助
5. **营销/交易双主题切换**：本项目无此需求，复杂度过高

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Binance 角色 | 原色值 | 本项目色值 | 说明 |
|---|---|---|---|
| 主色黄色 | #FCD535 | #cc785c | 珊瑚色 |
| 黄色 Active | #f0b90b | #a9583e | 深珊瑚 |
| 暗色画布 | #0b0e11 | #181715 | 深海军蓝 |
| 暗色卡片 | #1e2329 | #252320 | 深色提升卡片 |
| 亮色画布 | #ffffff | #faf9f5 | 暖奶油 |
| 亮色柔和 | #fafafa | #f5f0e8 | 暖灰 |
| 墨色 | #181a20 | #141413 | 暖墨 |
| 暗色正文 | #eaecef | #faf9f5 | 暖白 |
| 次要文字 | #707a8a | #6c6a64 | 暖灰 |
| 交易涨 | #0ecb81 | #5db872 | 成功绿（正确） |
| 交易跌 | #f6465d | #c64545 | 错误红（错误） |
| 信息蓝 | #3b82f6 | #5db8a6 | 信息青（可选） |

### 3.2 字体映射

| Binance Token | Binance 参数 | 本项目参数 | 说明 |
|---|---|---|---|
| hero-display | 64px / 700 / -1px | 72rpx / 400 / -3rpx | Georgia 衬线 |
| display-lg | 48px / 700 / -0.5px | 64rpx / 400 / -2rpx | 区域标题 |
| display-md | 40px / 600 / -0.3px | 56rpx / 400 / -1rpx | 小节标题 |
| title-lg | 24px / 600 | 40rpx / 500 | 卡片标题 |
| title-md | 20px / 600 | 34rpx / 500 | 中等标题 |
| title-sm | 16px / 600 | 28rpx / 500 | 小标题 |
| body-md | 14px / 400 / 1.5 | 26rpx / 400 / 1.6 | 正文 |
| body-sm | 13px / 400 / 1.5 | 24rpx / 400 / 1.5 | 辅助正文 |
| caption | 12px / 500 | 22rpx / 500 | 标签 |
| button | 14px / 600 | 26rpx / 500 | 按钮 |
| number-display | 40px / 700 | 56rpx / 700 | 大数字（等宽字体） |
| number-md | 16px / 500 | 28rpx / 500 | 数字 |

### 3.3 组件设计规范

**按钮（Primary）**
- 背景：#cc785c，文字：#ffffff
- 圆角：8rpx
- 内边距：20rpx 40rpx
- 高度：72rpx
- 字号：26rpx / 500

**按钮（Primary Pill）**
- 同 Primary，圆角改为 9999rpx
- 用于首页顶部重要操作

**卡片（亮色模式）**
- 背景：#efe9de
- 圆角：24rpx
- 内边距：40rpx
- 无阴影

**卡片（暗色模式，用于强调区块）**
- 背景：#252320
- 圆角：24rpx
- 内边距：40rpx
- 文字：#faf9f5

**数字展示（Stat Callout）**
- 使用等宽字体（如 monospace）
- 字号：56rpx / 700
- 颜色：#cc785c（珊瑚色，替代 Binance 黄色）
- 用于：答题统计、正确率、学习天数

**输入框**
- 背景：#faf9f5
- 边框：1rpx solid #e6dfd8
- 圆角：8rpx
- 高度：72rpx
- 内边距：16rpx 24rpx

### 3.4 页面布局模板

**Hero 区（Binance 暗色 hero 暖化版）**
- 背景：#181715（深海军蓝）
- 内边距：上下 96rpx，左右 48rpx
- 内容：大标题（Georgia 衬线，#faf9f5）+ 统计数字（珊瑚色，等宽）+ pill CTA
- 可放：学习天数、总题数、正确率等关键数字

**统计展示区**
- 3 列数字展示卡片
- 每个数字用等宽字体 + 珊瑚色
- 下方配简短标签

**工具网格区**
- 亮色奶油底
- 2 列卡片网格
- 每卡片：图标 + 标题 + 描述 + 简短统计

**Footer（亮色反转）**
- 背景：#f5f0e8（暖灰）
- 文字：#6c6a64
- 即使页面主体有暗色区块，footer 始终亮色

### 3.5 WXSS 实现示例

**Binance 风格暗色 Hero（暖化版）**
```css
.hero-dark {
  background-color: #181715;
  padding: 96rpx 48rpx;
  text-align: center;
}

.hero-dark__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 72rpx;
  font-weight: 400;
  color: #faf9f5;
  line-height: 1.1;
  letter-spacing: -3rpx;
}

.hero-dark__stat {
  font-family: 'Courier New', monospace;
  font-size: 56rpx;
  font-weight: 700;
  color: #cc785c;
  margin-top: 24rpx;
}

.hero-dark__stat-label {
  font-size: 24rpx;
  color: #6c6a64;
  margin-top: 8rpx;
}
```

**Binance 风格统计数字卡片**
```css
.stat-card {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  text-align: center;
}

.stat-card__value {
  font-family: 'Courier New', monospace;
  font-size: 48rpx;
  font-weight: 700;
  color: #cc785c;
  line-height: 1.1;
}

.stat-card__label {
  font-size: 22rpx;
  font-weight: 500;
  color: #6c6a64;
  margin-top: 8rpx;
}
```

**Binance 风格密集列表行**
```css
.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e6dfd8;
}

.list-row__primary {
  font-size: 28rpx;
  font-weight: 500;
  color: #141413;
}

.list-row__secondary {
  font-family: 'Courier New', monospace;
  font-size: 26rpx;
  font-weight: 500;
  color: #6c6a64;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **学习驾驶舱**：Binance 的统计数字展示（大号等宽数字 + 标签）非常适合学习数据仪表盘
- **首页 Hero 区**：暗色 hero + 大数字 + pill CTA 的组合适合展示学习概览
- **答题记录列表**：Binance 的密集列表行（左标题右数字）适合记录列表
- **排行榜/成就页**：Binance 的 trust-badge 和 stat-callout 适合成就展示

### 4.2 不适合用在哪些页面
- **刷题页面**：需要专注的亮色环境，暗色会增加视觉疲劳
- **导入试题页**：纯功能表单，不需要 Binance 的"展示感"
- **错题本**：需要温暖鼓励的氛围，Binance 的金融感不适合

### 4.3 混搭建议
- **数字展示**：采用 Binance 的等宽大数字风格，但用珊瑚色替代黄色
- **暗色区块**：仅在首页 Hero 和学习驾驶舱使用 #181715 暗色
- **列表密度**：采用 Binance 的紧凑列表行风格，适合答题记录
- **整体基调**：保持暖奶油画布的温暖感，Binance 仅提供数据展示和暗色区块参考

---

## 5. 实施检查清单

- [ ] 黄色 #FCD535 全部替换为珊瑚色 #cc785c
- [ ] 暗色画布 #0b0e11 替换为 #181715（深海军蓝）
- [ ] 交易绿/红替换为 success/error 语义色
- [ ] 数字展示使用等宽字体 + 珊瑚色
- [ ] 暗色区块仅用于 Hero 和数据仪表盘
- [ ] footer 始终使用亮色暖灰底
- [ ] 所有 px 转换为 rpx
- [ ] 卡片圆角统一为 24rpx
- [ ] 按钮圆角统一为 8rpx（pill 形除外）
- [ ] 字重显示标题使用 400（非 Binance 的 700）

---

## 6. 参考文件

- 原方案：.claude/skills/binance-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
