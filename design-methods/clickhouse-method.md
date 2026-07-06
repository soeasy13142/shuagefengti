# ClickHouse 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/clickhouse-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
ClickHouse 的设计语言是"纯黑画布 + 电光黄点缀"——用近乎纯黑的深色背景建立高对比度的工程感，用唯一的品牌色（电光黄 #faff69）作为所有视觉焦点。这是一种极度克制的单色策略：黄色只出现在 CTA、统计数字和全幅黄色卡片上，其余全部是白字黑底。没有装饰性插画，代码本身就是品牌电压。

### 1.2 视觉 DNA
- 纯黑画布（#0a0a0a），全站深色模式
- 电光黄（#faff69）作为唯一品牌色，极度克制使用
- Inter 字体 weight 700 + 负 letter-spacing 作为显示字体
- 深色卡片（#1a1a1a）仅比画布亮一点点，靠微妙色差分层
- JetBrains Mono 等宽字体用于代码块
- 统计数字用黄色大号 sans-700 展示（"779+", "47k+"）
- 圆角偏小：按钮 8px，卡片 12px
- 零阴影，靠亮度阶梯分层

### 1.3 色彩策略
- 画布：#0a0a0a（纯黑）
- 卡片：#1a1a1a（深灰）
- 主色/CTA：#faff69（电光黄）
- 文字：#ffffff（白）、#cccccc（正文灰）
- 语义色：成功 #22c55e、错误 #ef4444、信息 #3b82f6

### 1.4 字体策略
- 统一使用 Inter，无 serif 反衬
- 显示：72/56/40/32px，weight 700，-1 到 -2.5px tracking
- 正文：16/14px，weight 400
- 代码：JetBrains Mono 14px

### 1.5 布局与组件模式
- 圆角：按钮 8px，卡片 12px，pill 标签 9999px
- 间距：4px 基数，section 96px
- 按钮高度 40px
- 无阴影，深度靠 #0a0a0a → #1a1a1a → #242424 亮度阶梯

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **统计数字大号展示**：学习数据（如"已刷 128 题"、"正确率 85%"）用大号粗体数字展示，非常适合学习工具
- **单色强调策略**：只用一个强调色（珊瑚色 #cc785c）做所有 CTA，与 ClickHouse 的黄色克制用法一致
- **代码等宽字体**：如果项目展示代码题或代码片段，可用等宽字体
- **圆角偏小的开发者风格**：8-12rpx 圆角比 24rpx 更紧凑，适合工具类应用

### 2.2 需要改造的设计决策
- **全站深色模式**：本项目使用暖奶油画布（#faf9f5），不能改为纯黑。但可以在特定页面（如代码题展示区）使用深色卡片作为局部强调
- **电光黄 → 珊瑚色**：黄色在暖奶油背景上不够醒目，改用珊瑚色 #cc785c 保持暖调一致性
- **Inter weight 700 显示字体**：本项目用 Georgia，保持 400 weight。但可借鉴其负 tracking 策略
- **深色卡片亮度阶梯**：暖奶油体系下改为奶油色阶梯（#faf9f5 → #efe9de → #e5dfd4）

### 2.3 不可迁移的设计决策
- **纯黑画布**：与本项目暖奶油画布完全冲突
- **白字黑底的全站深色模式**：本项目已确定暖奶油浅色基调
- **JetBrains Mono 等宽字体**：微信小程序不支持自定义字体加载，需用系统等宽字体替代
- **代码块语法高亮**：本项目不引入第三方库，需用纯 WXML/WXSS 模拟

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #0a0a0a | #faf9f5 | 暖奶油替代纯黑 |
| Surface Card（卡片） | #1a1a1a | #efe9de | 奶油卡片 |
| Surface Elevated | #242424 | #e5dfd4 | 更深的奶油强调 |
| Primary（CTA） | #faff69 | #cc785c | 珊瑚色替代电光黄 |
| Primary Active | #e6eb52 | #a9583e | 深珊瑚 |
| Text Ink | #ffffff | #141413 | 暖墨替代白 |
| Text Body | #cccccc | #6c6a64 | 次要文字 |
| Muted | #888888 | #9a9890 | 更暖的灰 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 72px/700/-2.5px | 64rpx/400/-3rpx | Georgia 衬线，保持项目风格 |
| Section 标题 | 56px/700/-2px | 48rpx/400/-2rpx | |
| 统计数字 | 56px/700/-1.5px | 80rpx/700/-2rpx | **保留 700 weight**，数字需要粗体强调 |
| 卡片标题 | 18px/600 | 32rpx/600 | 保留 600 做标题强调 |
| 正文 | 16px/400 | 28rpx/400 | |
| 代码 | 14px/400 mono | 24rpx/400 | 用 system-ui 等宽替代 |

### 3.3 组件设计规范

**统计数字卡片（Stat Callout）**
- 数字：80rpx，weight 700，#cc785c（珊瑚色）
- 标签：24rpx，weight 400，#6c6a64
- 背景：透明或 #efe9de
- 圆角：24rpx（卡片形式）

**功能卡片（Feature Card）**
- 背景：#efe9de（奶油卡片）
- 文字：#141413
- 圆角：24rpx
- 内边距：48rpx
- 无阴影，1rpx #e5dfd4 边框可选

**主按钮**
- 背景：#cc785c
- 文字：#faf9f5
- 圆角：16rpx（原方案 8px × 2）
- 高度：80rpx（原方案 40px × 2）

**标签（Badge）**
- 背景：#efe9de
- 文字：#141413
- 圆角：9999rpx
- 内边距：8rpx × 24rpx

### 3.4 页面布局模板

**学习数据展示区（Hero）**
- 全宽，上下 64rpx
- 2-3 个统计数字并排（已刷题数、正确率、连续天数）
- 数字用珊瑚色大号粗体

**功能卡片区**
- 2 列网格，间距 24rpx
- 奶油卡片背景
- 图标 + 标题 + 简短描述

**代码/题目展示区**
- 深色卡片（#181715）局部使用
- 白色文字 + 等宽字体
- 模拟代码块的行号和语法高亮

### 3.5 WXSS 实现示例

**统计数字展示**

```css
.stat-callout {
  text-align: center;
  padding: 32rpx;
}
.stat-callout__number {
  font-size: 80rpx;
  font-weight: 700;
  color: #cc785c;
  letter-spacing: -2rpx;
  line-height: 1;
}
.stat-callout__label {
  font-size: 24rpx;
  font-weight: 400;
  color: #6c6a64;
  margin-top: 8rpx;
}
```

**深色代码卡片（局部使用）**

```css
.code-card {
  background-color: #181715;
  border-radius: 24rpx;
  padding: 32rpx;
  color: #faf9f5;
}
.code-card__line {
  font-family: 'Courier New', Courier, monospace;
  font-size: 24rpx;
  line-height: 1.6;
}
.code-card__line-number {
  color: #6c6a64;
  margin-right: 16rpx;
}
```

**奶油色阶梯卡片**

```css
.card-base {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 48rpx;
}
.card-elevated {
  background-color: #e5dfd4;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **学习数据统计页**：ClickHouse 的统计数字展示风格（大号粗体 + 品牌色）非常适合展示刷题数据
- **代码题展示区**：深色代码卡片 + 等宽字体的组合适合展示编程题
- **工具详情页**：紧凑的开发者风格适合技术类工具

### 4.2 不适合用在哪些页面
- **首页**：暖奶油画布风格与 ClickHouse 的纯黑基调冲突，首页应保持温暖友好
- **设置页**：深色卡片会让设置表单显得过于严肃
- **错题本**：需要温暖的回顾感，而非冷峻的工程感

### 4.3 混搭建议
- **全局保持暖奶油画布**，仅在代码展示区使用深色卡片（#181715）
- **统计数字借鉴 ClickHouse 的展示方式**，但用珊瑚色替代黄色
- **按钮圆角保持 24rpx**，不采用 ClickHouse 的 8px 紧凑风格（与暖奶油风格冲突）
- **标签用 pill 形状**，与暖奶油风格一致

---

## 5. 实施检查清单

- [ ] 统计数字使用 700 weight 粗体，珊瑚色
- [ ] 深色代码卡片仅在代码展示区使用，不扩大到全页
- [ ] 深色卡片使用 #181715，文字使用 #faf9f5
- [ ] 等宽字体使用 'Courier New', Courier, monospace 系统字体
- [ ] 保持暖奶油画布全局基调，不引入全站深色模式
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/clickhouse-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
