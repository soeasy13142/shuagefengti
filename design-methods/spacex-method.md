# SpaceX 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/spacex-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
SpaceX 的设计语言是"减法的极致"——纯黑画布、白色大写 D-DIN-Bold 标题、全出血火箭发射摄影或视频，以及每 band 仅一个 ghost 轮廓 pill CTA。没有品牌色（黑与白即是全部），没有装饰形状，没有卡片网格。每个 band 是一张全视口照片/视频配一行 80px 大写标题和一个 ghost pill 按钮。整体构图更像电影字幕卡而非 SaaS 落地页。最强视觉签名是**0.95 行高的 80px 大写标题 + 1.6px positive tracking**——工程美学的极致压缩。

### 1.2 视觉 DNA
- 纯黑画布 #000000，白色大写标题
- D-DIN-Bold 工业无衬线字体（DIN 1451 标准）
- 0.95 行高 + 1.6px positive tracking（工程压缩感）
- 全出血摄影/视频作为唯一装饰
- 每 band 仅一个 ghost 轮廓 pill CTA（32px 圆角）
- 无品牌色，无阴影，无渐变叠加
- 固定顶部导航覆盖在摄影上（透明背景，白字）

### 1.3 色彩策略
- 画布：#000000（纯黑）
- 画布软：#0a0a0a（微亮近黑）
- 画布亮：#ffffff（商店页）
- 画布冷：#f0f0fa（商店页次要表面）
- 文字：#ffffff（深色面）/ #000000（亮色面）
- 文字次要：#f0f0fa（深色面次要）
- hairline 深：#3a3a3f
- hairline 亮：#e0e0e8
- 链接深色面：#ffffff（白字下划线）
- 无品牌色

### 1.4 字体策略
- 显示：D-DIN-Bold，80/60/48px，weight 700
- 正文/按钮：D-DIN，16/13px，weight 400/700
- 全大写显示标题
- 0.95-1.25 行高（极紧凑）
- 0.96-1.6px positive tracking

### 1.5 布局与组件模式
- 圆角：pill 32px，输入 4px
- 间距基数 8px
- 无容器——每个 band 全视口
- 深度语言：零深度，摄影即深度
- 每 band 仅一个 CTA

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **极简主义理念**：每屏一个焦点、一个 CTA 的克制
- **大写标题 + positive tracking**：适合工具类应用的工程感
- **Ghost 轮廓 pill 按钮**：适合次要操作
- **0.95 行高的紧凑标题**：Georgia 衬线可模拟
- **无阴影无渐变的极简深度**：与本项目零阴影策略一致

### 2.2 需要改造的设计决策
- **纯黑画布 #000000**：仅在深色局部区域借鉴
- **D-DIN-Bold 工业字体**：Georgia 衬线无法完全模拟工业感，但可借鉴 tracking
- **全出血摄影**：小程序无全出血概念
- **80px 大写标题**：小程序屏幕有限，最大 64rpx
- **每 band 仅一个 CTA**：小程序页面较短，可适当增加

### 2.3 不可迁移的设计决策
- **D-DIN-Bold 自定义字体**：微信小程序不支持
- **全出血摄影/视频**：小程序布局限制
- **固定透明导航覆盖摄影**：小程序导航栏固定样式
- **1500px 最大宽度**：小程序全屏设计
- **无品牌色的纯黑白系统**：与暖奶油画布冲突

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas Night（深色画布） | #000000 | #181715 | 深海军蓝 |
| Canvas Night Soft | #0a0a0a | #232220 | |
| Canvas Light（亮色画布） | #ffffff | #faf9f5 | 暖奶油 |
| Canvas Cool | #f0f0fa | #f0f0fa | 保留冷色调 |
| On Primary（深色文字） | #ffffff | #faf9f5 | |
| Ink（亮色文字） | #000000 | #141413 | 暖墨 |
| Ink Mute | #5a5a5f | #6c6a64 | 暖灰 |
| Hairline Dark | #3a3a3f | #2a2825 | |
| Hairline Light | #e0e0e8 | #e5dfd4 | 暖化 |
| Link Dark | #ffffff | #faf9f5 | |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 80px/700/0.95/+1.6px | 64rpx/400/-3rpx | Georgia 衬线（不同风格） |
| Section 标题 | 60px/700/1.2/+1.2px | 48rpx/400/-2rpx | |
| Sub 标题 | 48px/700/1.25/+0.96px | 40rpx/400/-1rpx | |
| 正文 | 16px/400/1.5/+0.32px | 28rpx/400 | |
| 按钮大写 | 13px/700/0.94/+1.17px | 26rpx/700/+2rpx | uppercase |
| 标签 | 12px/400/2.0/+0.96px | 22rpx/400/+2rpx | uppercase |

### 3.3 组件设计规范

**Ghost 轮廓 Pill CTA（品牌签名）**
- 背景：透明
- 文字：#faf9f5（深色面）/ #141413（亮色面）
- 边框：1rpx solid #faf9f5 / #141413
- 圆角：64rpx（32px × 2）
- 高度：88rpx
- 内边距：36rpx × 48rpx
- 字号：26rpx，weight 700，uppercase，+2rpx tracking

**Ghost 轮廓 Pill（亮色面）**
- 背景：透明
- 文字：#141413
- 边框：1rpx solid #141413
- 其余同上

**深色全出血 Band**
- 背景：#181715
- 文字：#faf9f5
- 无圆角，无内边距（内容居中叠加）

**商店产品卡片**
- 背景：#faf9f5
- 文字：#141413
- 圆角：16rpx，内边距：32rpx
- 1rpx #e5dfd4 边框

**输入框**
- 背景：#faf9f5，文字：#141413
- 圆角：8rpx，内边距：24rpx × 32rpx
- 1rpx #e5dfd4 边框

### 3.4 页面布局模板

**深色 Hero Band**
- 背景：#181715 全宽
- 大写标题居中 + Ghost Pill CTA
- 无装饰，纯文字

**功能展示 Band**
- 背景：#181715 或 #232220
- 每 band 一个主题 + 一个 CTA

**亮色工具区**
- 背景：#faf9f5
- 产品卡片网格

### 3.5 WXSS 实现示例

**Ghost 轮廓 Pill CTA**

```css
.btn-ghost-pill {
  background-color: transparent;
  color: #faf9f5;
  border: 1rpx solid #faf9f5;
  border-radius: 64rpx;
  height: 88rpx;
  padding: 36rpx 48rpx;
  font-size: 26rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  text-align: center;
  line-height: 88rpx;
}
```

**大写紧凑标题**

```css
.title-uppercase {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 3rpx;
  text-transform: uppercase;
  color: #faf9f5;
}
```

**深色全出血 Band**

```css
.band-dark-full {
  background-color: #181715;
  padding: 128rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

**商店产品卡片**

```css
.card-shop {
  background-color: #faf9f5;
  border: 1rpx solid #e5dfd4;
  border-radius: 16rpx;
  padding: 32rpx;
}
```

**标签大写**

```css
.tag-uppercase {
  font-size: 22rpx;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  color: #6c6a64;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具介绍页**：每屏一个工具 + 一个 CTA 的极简节奏
- **深色代码展示区**：纯黑背景 + 白字大写标题的工程感
- **学习里程碑页**：极简庆祝风格（"恭喜完成" + Ghost CTA）
- **启动/引导页**：每步一个焦点的极简流程

### 4.2 不适合用在哪些页面
- **首页**：过于极简，缺乏暖度
- **工具列表页**：需要多卡片网格，与单焦点理念冲突
- **设置页**：Ghost pill 在表单中不明确
- **错题本列表**：需要暖色调

### 4.3 混搭建议
- **Ghost 轮廓 pill**用于深色区域的次要操作
- **大写标题 + tracking**用于深色区域的 section 标题
- **0.95 行高**仅用于大标题，正文用 1.5
- **每 band 一个 CTA**的理念用于首页 hero 和工具介绍
- **全黑 band**仅用于代码题目展示，不扩展到暖奶油区域

---

## 5. 实施检查清单

- [ ] Ghost 轮廓 pill 使用 64rpx 圆角
- [ ] 深色区域使用 #181715 背景
- [ ] 大写标题使用 uppercase + 2rpx tracking
- [ ] 每个深色 band 仅一个 CTA
- [ ] 0.95 行高仅用于大标题
- [ ] 暖奶油画布 #faf9f5 用于主区域
- [ ] 无阴影无渐变（深色区域）
- [ ] Georgia 衬线标题（非 D-DIN）
- [ ] 亮色区域用暖色 hairline 边框
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/spacex-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
