# Replicate 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/replicate-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Replicate 是一个"AI 实验室笔记本遇上印刷杂志"风格的开发者平台。核心理念是用暖奶油画布（#f9f7f3）取代典型白底/黑底，搭配大胆的热橙品牌色（#ea2804），制造"独立 ML 工作坊"的亲切感。品牌最强视觉签名是**巨大的显示标题**（最高 128px），使用紧凑行高（1.0）和负 letter-spacing，让多行标题像几何方块一样堆叠。系统整体读感是"友好的精确"——每个交互元素都是全圆角，内容卡片用中等圆角，没有尖角。

### 1.2 视觉 DNA
- 暖奶油画布 #f9f7f3，非纯白
- 热橙品牌色 #ea2804，仅用于 CTA + hero band + 链接
- 三字体系统：rb-freigeist-neue（显示）+ basier-square（正文）+ JetBrains Mono（代码）
- 显示标题 72-128px，lineHeight 1.0，负 letter-spacing
- 所有交互元素全圆角（9999px），内容卡片中圆角（10px）
- 深色代码区 #202020，模拟印刷 pull-quote
- 节奏：奶油 → 橙色 hero → 奶油 → 深色代码故事 → 奶油 → 黑色 footer

### 1.3 色彩策略
- 画布：#f9f7f3（暖奶油）
- 画布骨：#f3f0e8（深一级奶油，用于卡片组背景）
- 卡片：#ffffff（纯白，仅用于单个卡片和输入框）
- 品牌橙/CTA：#ea2804
- 品牌橙 Active：#c01f00
- 文字：#202020（暖墨，比纯黑暖）
- 正文：#3a3a3a
- 次要：#575757 / #646464
- 深色表面：#202020（代码区）
- 纯黑：#000000（footer）
- hairline：rgba(32,32,32,0.12)
- 成功：#2b9a66

### 1.4 字体策略
- 显示：rb-freigeist-neue，128/72/48/30px，weight 700/600，lineHeight 1.0
- 正文/UI：basier-square，18/16/14/12px，weight 400/600
- 代码：JetBrains Mono，14/11px，weight 400
- 负 letter-spacing 与字号成正比（-3px @ 128px → -0.3px @ 20px）

### 1.5 布局与组件模式
- 圆角：交互元素 9999px（full），卡片 10px（md），代码区 10px（md）
- 间距基数 4px，section 96px，band 160px
- 最大内容宽度 1280px，hero band 全宽
- 模型卡片网格：4列桌面 → 3列平板大 → 2列平板 → 1列手机
- 深度语言：零阴影，靠色块对比（奶油 vs 骨色 vs 深色）
- Hero atmospheric mesh：橙→粉径向渐变

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **暖奶油画布**：#f9f7f3 与本项目的 #faf9f5 极度接近，可直接使用
- **暖墨文字**：#202020 与本项目的 #141413 同为暖调深色
- **三字体分层理念**：显示（衬线）、正文（无衬线）、代码（等宽）的分层逻辑与本项目一致
- **显示标题紧凑行高 1.0 + 负 tracking**：Georgia 衬线同样适用
- **零阴影深度策略**：与本项目完全一致
- **全圆角交互元素 + 中圆角内容卡片**：与本项目圆角体系一致
- **hairline 分割线**：与本项目边框策略一致

### 2.2 需要改造的设计决策
- **品牌橙 #ea2804**：改为珊瑚色 #cc785c 保持暖调一致性
- **代码区深色 #202020**：小程序中代码块用深色背景过于沉重，改为 #181715（深海军蓝表面）
- **hero band 全宽橙色区域**：小程序无全宽概念，改为首页顶部品牌区
- **128px 显示标题**：小程序屏幕有限，最大 64rpx
- **4列模型卡片网格**：小程序单列或双列布局
- **atmospheric mesh 渐变**：小程序中简化为纯色或简单渐变

### 2.3 不可迁移的设计决策
- **rb-freigeist-neue / basier-square 自定义字体**：微信小程序不支持，用 Georgia + 系统 sans-serif
- **JetBrains Mono**：用系统等宽字体替代
- **1280px 最大宽度**：小程序全屏设计
- **全宽 hero band + atmospheric mesh**：小程序布局限制
- **4列网格布局**：小程序单列为主

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #f9f7f3 | #faf9f5 | 极接近，暖奶油 |
| Surface Bone（骨色） | #f3f0e8 | #efe9de | 奶油卡片色 |
| Surface Card | #ffffff | #ffffff | 纯白卡片 |
| Primary/CTA | #ea2804 | #cc785c | 珊瑚色 |
| Primary Active | #c01f00 | #a9583e | 深珊瑚 |
| Ink（标题） | #202020 | #141413 | 暖墨 |
| Body（正文） | #3a3a3a | #6c6a64 | 暖灰 |
| Charcoal（次要） | #575757 | #9a9890 | |
| Mute | #646464 | #b0aea6 | |
| Surface Dark（代码区） | #202020 | #181715 | 深海军蓝 |
| Surface Deep（footer） | #000000 | #181715 | 深色表面 |
| Hairline | rgba(32,32,32,0.12) | #e5dfd4 | 暖色分割线 |
| Badge Success | #2b9a66 | #2b9a66 | 保留绿色 |
| Hero Glow | #ff6a3d | #e8a08a | 暖光晕（淡化） |
| Hero Pink | #f4a8a0 | #f0c8b8 | 暖粉（淡化） |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 128px/700/-3px | 64rpx/400/-3rpx | Georgia 衬线 |
| Section 标题 | 72px/700/-1.8px | 48rpx/400/-2rpx | |
| Sub 标题 | 48px/700/-1px | 36rpx/400/-1rpx | |
| 卡片标题 | 30px/600/-0.5px | 32rpx/400/-1rpx | |
| 正文 | 16px/400 | 28rpx/400 | |
| 按钮 | 16px/600 | 28rpx/600 | |
| 代码 | 14px/400 mono | 24rpx/400 | Courier New |
| 标签 | 12px/400 | 22rpx/400 | |

### 3.3 组件设计规范

**CTA 按钮（全圆角）**
- 背景：#cc785c
- 文字：#faf9f5
- 圆角：9999rpx（full pill）
- 高度：88rpx
- 内边距：24rpx × 48rpx
- 字号：28rpx，weight 600
- Active 状态：背景 #a9583e

**暗色 CTA 按钮**
- 背景：#181715
- 文字：#faf9f5
- 圆角：9999rpx
- 其余同 CTA 按钮

**Ghost 按钮**
- 背景：#faf9f5
- 文字：#141413
- 圆角：9999rpx
- 内边距：16rpx × 32rpx

**功能卡片**
- 背景：#ffffff
- 圆角：20rpx
- 内边距：32rpx
- 无阴影，无边框（靠画布色对比）

**代码区（Code Well）**
- 背景：#181715
- 文字：#faf9f5
- 圆角：20rpx
- 内边距：48rpx
- 字体：'Courier New', Courier, monospace，24rpx

**状态标签（Badge）**
- 成功：背景 #2b9a66，文字 #faf9f5
- 通用：背景 #faf9f5，文字 #141413，1rpx #e5dfd4 边框
- 圆角：9999rpx
- 内边距：8rpx × 20rpx
- 字号：22rpx，weight 400

**输入框**
- 背景：#ffffff
- 文字：#141413
- 圆角：9999rpx（pill 形状）
- 内边距：24rpx × 40rpx
- 高度：88rpx
- 1rpx #e5dfd4 边框

### 3.4 页面布局模板

**首页 Hero 区**
- 背景：#faf9f5
- 上下 80rpx
- 大标题（Georgia 64rpx/400/-3rpx）+ 副标题 + 珊瑚色 CTA
- 下方：功能卡片网格（2列，间距 24rpx）

**深色代码故事区**
- 背景：#181715 全宽
- 文字 #faf9f5
- 左侧说明文字 + 右侧代码块
- 小程序中改为上下堆叠

**功能卡片区**
- 背景：#efe9de（骨色 band）
- 内含纯白卡片
- 2列网格，间距 24rpx

### 3.5 WXSS 实现示例

**全圆角 CTA 按钮**

```css
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  height: 88rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
  line-height: 88rpx;
}
.btn-primary:active {
  background-color: #a9583e;
}
```

**暗色 CTA 按钮**

```css
.btn-dark {
  background-color: #181715;
  color: #faf9f5;
  border-radius: 9999rpx;
  height: 88rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
  line-height: 88rpx;
}
```

**纯白卡片（无阴影）**

```css
.card-white {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
}
```

**代码区（Code Well）**

```css
.code-well {
  background-color: #181715;
  color: #faf9f5;
  border-radius: 20rpx;
  padding: 48rpx;
  font-family: 'Courier New', Courier, monospace;
  font-size: 24rpx;
}
```

**状态标签**

```css
.badge {
  display: inline-block;
  border-radius: 9999rpx;
  padding: 8rpx 20rpx;
  font-size: 22rpx;
}
.badge--success {
  background-color: #2b9a66;
  color: #faf9f5;
}
.badge--neutral {
  background-color: #faf9f5;
  color: #141413;
  border: 1rpx solid #e5dfd4;
}
```

**Hero 标题（杂志式）**

```css
.hero-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  line-height: 1.0;
  color: #141413;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页**：暖奶油画布 + 杂志式大标题 + 全圆角 CTA 的组合非常匹配
- **工具详情页**：代码区（Code Well）深色背景 + 白字适合展示代码题目
- **学习报告页**：状态标签（Badge）适合标记学习进度和成就
- **搜索/输入场景**：pill 形状输入框符合 Replicate 的搜索风格

### 4.2 不适合用在哪些页面
- **设置页**：全圆角按钮在表单场景中过于活泼
- **错题本列表**：需要紧凑列表，深色代码区过重
- **密排表格**：全圆角风格与密集数据展示冲突

### 4.3 混搭建议
- **全圆角 CTA（9999rpx）**作为品牌签名，用于主要操作按钮
- **代码区深色 #181715**专用于代码题目展示，不用于普通卡片
- **杂志式标题 Georgia 400 + 负 tracking**与本项目完全一致
- **骨色 band #efe9de**作为功能区背景，区分于画布 #faf9f5
- **状态标签全圆角**用于学习状态，普通标签用 20rpx 圆角

---

## 5. 实施检查清单

- [ ] CTA 按钮使用 9999rpx 全圆角（pill 形状）
- [ ] 暗色 CTA 和亮色 CTA 配对使用
- [ ] 代码区使用 #181715 深色背景 + #faf9f5 白字
- [ ] 纯白卡片无阴影，靠画布色对比
- [ ] Hero 标题 Georgia 400 weight + -3rpx tracking + lineHeight 1.0
- [ ] 状态标签 9999rpx 全圆角
- [ ] 输入框 pill 形状（9999rpx）
- [ ] 骨色 band #efe9de 作为功能区背景
- [ ] 零阴影，仅色块对比深度
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/replicate-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
