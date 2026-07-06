# Slack 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/slack-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Slack 的设计语言以深茄子紫品牌主色（#4a154b）为中心——这是品牌最持久的视觉资产，被复用于 CTA、精选定价 tier、页脚 band 和品牌标识。围绕茄子紫，系统构建了一个精致的生态：奶油薰衣草 hero 画布上柔和的粉彩网格渐变（桃橙、薰衣草、灰绿）脉动在浮动产品 UI 模型背后。核心理念是**单色神教**：一种主色贯穿所有关键元素，通过粉彩渐变提供深度而非阴影。

### 1.2 视觉 DNA
- 单一茄子紫品牌色 #4a154b 贯穿 CTA、精选 tier、页脚、品牌标识
- 奶油薰衣草 hero 画布 + 粉彩网格渐变背景
- 药丸按钮 90px 圆角 + 超大水平 padding（28-30px）
- Display 字体 700 weight + 负 letter-spacing，编辑密度感
- 蓝色内联链接 #1264a3——唯一非茄子紫的色彩偏离
- 统计卡片：巨大茄子紫数字（50px）在白色背景上
- 粉彩网格渐变提供"无阴影的深度"

### 1.3 色彩策略
- 茄子紫：#4a154b（品牌主色，CTA、精选 tier、页脚）
- 茄子紫 Active：#611f69
- 奶油：#f4ede4（hero 渐变和功能 band）
- 薰衣草：#f9f0ff（次要按钮表面和软 band）
- 蓝色链接：#1264a3（内联链接，唯一非紫色彩）
- 墨色：#1d1d1d（主文字）
- 墨灰：#696969（二级文字）
- 纯白画布：#ffffff
- hairline：#e6e6e6
- 错误：#cc4117
- 成功：#007a5a

### 1.4 字体策略
- 显示：Salesforce Avant Garde / system-ui fallback，64/58/50/32px，weight 600/700
- UI/正文：Salesforce Sans / system-ui fallback，18/16/14/12px，weight 400/700
- 负 letter-spacing on display（-0.768px @ 64px）
- 正文行高 1.55（略宽松）

### 1.5 布局与组件模式
- 圆角：按钮 90px（pill），卡片 16px（xl），输入 4px（sm）
- 间距基数 8px，section 64-96px
- 最大内容宽度 ~1240px
- 深度语言：粉彩网格渐变取代阴影
- 统计卡片：50px 茄子紫数字

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **单色神教理念**：一种主色贯穿所有关键元素，与暖奶油画布 + 珊瑚色 CTA 的策略一致
- **药丸按钮（90px）**：与本项目全圆角按钮理念一致
- **粉彩网格渐变背景**：可简化为暖色调柔和渐变
- **统计大数字卡片**：非常适合学习数据展示
- **薰衣草次要按钮**：柔和的次要操作色
- **负 letter-spacing 显示标题**：Georgia 衬线同样适用

### 2.2 需要改造的设计决策
- **茄子紫 #4a154b**：改为珊瑚色 #cc785c 保持暖调一致性
- **薰衣草 #f9f0ff**：改为更暖的薰衣草色或保留作为学习主题色
- **奶油 #f4ede4**：与 #faf9f5 极接近，可直接使用
- **64px 显示标题**：小程序屏幕有限，最大 64rpx
- **粉彩网格渐变**：小程序中简化为单色柔和渐变
- **蓝色链接 #1264a3**：保留作为内联链接色

### 2.3 不可迁移的设计决策
- **Salesforce Avant Garde / Salesforce Sans 自定义字体**：微信小程序不支持
- **产品 UI 截图浮动合成**：小程序布局限制
- **1240px 最大宽度**：小程序全屏设计
- **粉彩网格渐变的精确实现**：简化为 CSS radial-gradient

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Primary（茄子紫） | #4a154b | #cc785c | 珊瑚色 |
| Primary Active | #611f69 | #a9583e | 深珊瑚 |
| Canvas（白色画布） | #ffffff | #faf9f5 | 暖奶油 |
| Canvas Cream | #f4ede4 | #efe9de | 奶油卡片色 |
| Canvas Lavender | #f9f0ff | #f0e8f5 | 暖薰衣草 |
| Surface Aubergine | #4a154b | #181715 | 深海军蓝（深色区域） |
| Ink（主文字） | #1d1d1d | #141413 | 暖墨 |
| Ink Mute（次要） | #696969 | #6c6a64 | 暖灰 |
| On Primary | #ffffff | #faf9f5 | |
| Link Blue | #1264a3 | #1264a3 | 保留蓝色链接 |
| Hairline | #e6e6e6 | #e5dfd4 | 暖色分割线 |
| Semantic Error | #cc4117 | #cc4117 | 保留 |
| Semantic Success | #007a5a | #007a5a | 保留 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 64px/700/-0.768px | 64rpx/400/-3rpx | Georgia 衬线 |
| Section 标题 | 58px/600/-0.464px | 48rpx/400/-2rpx | |
| 统计数字 | 50px/700/-0.6px | 48rpx/700 | 茄子紫→珊瑚色 |
| 卡片标题 | 32px/700/-0.256px | 32rpx/600 | |
| 正文 | 16px/400 | 28rpx/400 | |
| 按钮 | 16px/700/+0.2px | 28rpx/700 | |
| 标签 | 12px/700/+0.96px | 22rpx/700/+2rpx | uppercase |

### 3.3 组件设计规范

**药丸 CTA 按钮（品牌签名）**
- 背景：#cc785c，文字：#faf9f5
- 圆角：90rpx（非 9999rpx，保留 Slack 的 90px 签名）
- 高度：88rpx
- 内边距：28rpx × 56rpx（超大水平 padding）
- 字号：28rpx，weight 700
- Active：背景 #a9583e

**薰衣草次要按钮**
- 背景：#f0e8f5，文字：#141413
- 圆角：90rpx
- 内边距：20rpx × 60rpx

**轮廓按钮（茄子紫→珊瑚色）**
- 背景：#faf9f5，文字：#cc785c
- 边框：2rpx solid #cc785c
- 圆角：90rpx

**统计卡片**
- 背景：#faf9f5
- 数字：#cc785c，48rpx，weight 700
- 说明文字：#6c6a64，24rpx
- 圆角：32rpx，内边距：64rpx

**功能卡片（奶油）**
- 背景：#efe9de，文字：#141413
- 圆角：32rpx，内边距：64rpx

**深色 Band 卡片**
- 背景：#181715，文字：#faf9f5
- 圆角：32rpx，内边距：96rpx

**标签 Pill**
- 背景：#efe9de，文字：#141413
- 圆角：90rpx
- 内边距：8rpx × 24rpx
- 字号：22rpx，weight 700，uppercase，+2rpx tracking

**输入框**
- 背景：#faf9f5，文字：#141413
- 圆角：8rpx，内边距：20rpx × 24rpx
- 1rpx #e5dfd4 边框

### 3.4 页面布局模板

**首页 Hero 区（粉彩渐变）**
- 背景：暖奶油 + 柔和暖色径向渐变
- 大标题 Georgia 衬线 + 副标题
- 药丸 CTA 按钮
- 下方：产品 UI 截图（简化为功能卡片）

**统计展示区**
- 3 列统计卡片
- 巨大珊瑚色数字 + 说明文字

**功能展示区（奶油 band）**
- 背景：#efe9de
- 功能卡片 2 列

**深色 CTA Band**
- 背景：#181715
- 白色大标题 + CTA

### 3.5 WXSS 实现示例

**药丸 CTA 按钮**

```css
.btn-pill-aubergine {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 90rpx;
  height: 88rpx;
  padding: 28rpx 56rpx;
  font-size: 28rpx;
  font-weight: 700;
  text-align: center;
  line-height: 88rpx;
}
.btn-pill-aubergine:active {
  background-color: #a9583e;
}
```

**薰衣草次要按钮**

```css
.btn-pill-lavender {
  background-color: #f0e8f5;
  color: #141413;
  border-radius: 90rpx;
  height: 88rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  font-weight: 700;
  text-align: center;
  line-height: 88rpx;
}
```

**统计卡片**

```css
.stat-card {
  background-color: #faf9f5;
  border-radius: 32rpx;
  padding: 64rpx;
  text-align: center;
}
.stat-card__number {
  font-size: 48rpx;
  font-weight: 700;
  color: #cc785c;
  line-height: 1.12;
  letter-spacing: -1rpx;
}
.stat-card__label {
  font-size: 24rpx;
  color: #6c6a64;
  margin-top: 16rpx;
}
```

**粉彩网格渐变背景**

```css
.hero-gradient {
  background-color: #faf9f5;
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(232,160,138,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 30%, rgba(200,180,220,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(180,210,180,0.1) 0%, transparent 50%);
}
```

**深色 Band 卡片**

```css
.band-dark {
  background-color: #181715;
  color: #faf9f5;
  border-radius: 32rpx;
  padding: 96rpx;
}
```

**标签 Pill**

```css
.tag-pill-shade {
  display: inline-block;
  background-color: #efe9de;
  color: #141413;
  border-radius: 90rpx;
  padding: 8rpx 24rpx;
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页 Hero**：粉彩渐变背景 + 药丸 CTA 非常温暖亲切
- **学习统计页**：巨大珊瑚色数字统计卡片非常适合成绩展示
- **工具介绍页**：奶油 band + 功能卡片的交替节奏
- **深色 CTA 区**：深海军蓝 band 上的白色标题 + 珊瑚色 CTA

### 4.2 不适合用在哪些页面
- **代码题目详情**：粉彩渐变与代码阅读场景冲突
- **错题本列表**：需要紧凑列表，统计卡片过重
- **设置页**：药丸按钮在表单中过于活泼

### 4.3 混搭建议
- **药丸按钮 90rpx**作为品牌签名（区别于 9999rpx 全圆角）
- **粉彩渐变**仅用于首页 Hero，不扩展到其他页面
- **统计大数字**用于学习数据展示，不用于普通标题
- **薰衣草 #f0e8f5**作为次要按钮色
- **蓝色链接 #1264a3**作为内联链接色

---

## 5. 实施检查清单

- [ ] 药丸按钮使用 90rpx 圆角（非 9999rpx）
- [ ] CTA 使用珊瑚色 #cc785c（非茄子紫）
- [ ] 薰衣草次要按钮 #f0e8f5
- [ ] 统计卡片使用 48rpx 珊瑚色大数字
- [ ] 粉彩渐变仅用于首页 Hero
- [ ] 深色 band 使用 #181715
- [ ] 蓝色链接 #1264a3 用于内联链接
- [ ] 标签 pill 90rpx 圆角 + uppercase
- [ ] 暖奶油画布 #faf9f5
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/slack-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
