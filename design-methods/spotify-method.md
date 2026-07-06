# Spotify 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/spotify-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Spotify 的网页界面是一个沉浸式暗色音乐播放器，用近黑色茧房（#121212、#181818、#1f1f1f）包裹用户，让内容成为主要色彩来源。核心理念是**内容优先的黑暗**：UI 退入阴影中，让音乐、播客和播放列表发光。每个表面都是炭灰色调，营造剧院般环境，唯一真正色彩来自标志性 Spotify Green 和专辑封面本身。最强视觉签名是**pill 形状按钮 + 重度阴影 + 大写宽 tracking 按钮标签**。

### 1.2 视觉 DNA
- 近黑沉浸式暗色主题（#121212-#1f1f1f）
- Spotify Green #1ed760 作为唯一品牌强调色——从不装饰，永远功能性
- 药丸按钮（500px-9999px）和圆形控制（50%）
- 大写按钮标签 + 宽字间距（1.4px-2px）
- 重度阴影（rgba(0,0,0,0.5) 0px 8px 24px）用于提升元素
- 专辑封面作为主要色彩来源——UI 本身是消色差的
- 紧凑排版（10px-24px 范围）
- 语义色：负红 #f3727f、警告橙 #ffa42b、公告蓝 #539df5

### 1.3 色彩策略
- 最深背景：#121212
- 暗表面：#181818（卡片、容器、侧边栏）
- 中暗：#1f1f1f（按钮背景、交互表面）
- 品牌绿：#1ed760（播放按钮、活跃状态、主 CTA）
- 白色：#ffffff（主文字）
- 银灰：#b3b3b3（二级文字、非活跃导航）
- 近白：#cbcbcb（稍亮二级文字）
- 语义红：#f3727f
- 语义橙：#ffa42b
- 语义蓝：#539df5
- 边框灰：#4d4d4d / #7c7c7c

### 1.4 字体策略
- 标题：SpotifyMixUITitle，24px，weight 700
- UI/正文：SpotifyMixUI，16/14/12px，weight 400/600/700
- 大写按钮：14px，weight 600-700，+1.4-2px tracking
- 紧凑尺寸范围 10px-24px

### 1.5 布局与组件模式
- 圆角：pill 500-9999px，圆形 50%，卡片 6-8px
- 间距基数 8px
- 深度语言：重度阴影（0.3-0.5 opacity）
- 内容密度优先于留白
- 侧边栏 + 主内容区 + 底部播放栏

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **pill 按钮 + 大写宽 tracking**：适合工具类应用的系统化标签感
- **紧凑排版**：10-24px 范围适合小程序的密集信息展示
- **语义色系统**：红/橙/蓝用于状态标记
- **圆形控制按钮**：适合播放/暂停类操作
- **内容密度优先**：小程序同样需要密集信息展示

### 2.2 需要改造的设计决策
- **近黑沉浸式主题 #121212**：改为暖奶油主色 + 深色局部区域
- **Spotify Green #1ed760**：改为珊瑚色 #cc785c
- **重度阴影**：与本项目零阴影策略冲突，仅在深色区域借鉴
- **专辑封面色彩**：改为题目图标/分类色彩
- **侧边栏布局**：小程序无侧边栏，改为底部 tab

### 2.3 不可迁移的设计决策
- **SpotifyMixUI/SpotifyMixUITitle 自定义字体**：微信小程序不支持
- **侧边栏导航**：小程序使用底部 tab bar
- **底部播放栏**：小程序无全局播放栏概念
- **沉浸式暗色全页**：与暖奶油画布冲突
- **50% 圆形按钮**：小程序中可用但需谨慎

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Near Black（最深背景） | #121212 | #181715 | 深海军蓝 |
| Dark Surface（暗表面） | #181818 | #232220 | |
| Mid Dark（中暗） | #1f1f1f | #2a2927 | |
| Brand Green（品牌绿） | #1ed760 | #cc785c | 珊瑚色 |
| White（主文字） | #ffffff | #faf9f5 | |
| Silver（次要文字） | #b3b3b3 | #9a9890 | |
| Near White | #cbcbcb | #b0aea6 | |
| Negative Red | #f3727f | #f3727f | 保留 |
| Warning Orange | #ffa42b | #ffa42b | 保留 |
| Announcement Blue | #539df5 | #539df5 | 保留 |
| Border Gray | #4d4d4d | #3a3835 | |
| Light Border | #7c7c7c | #6c6a64 | |
| Canvas（暖奶油主色） | — | #faf9f5 | 本项目画布 |
| Surface Card | — | #efe9de | 本项目卡片色 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Section 标题 | 24px/700 | 36rpx/600 | |
| Feature 标题 | 18px/600/1.3 | 32rpx/600 | |
| 正文 Bold | 16px/700 | 28rpx/600 | |
| 正文 | 16px/400 | 28rpx/400 | |
| 按钮大写 | 14px/700/+1.4px | 26rpx/700/+2rpx | uppercase |
| 按钮 | 14px/700/+0.14px | 26rpx/700 | |
| 导航 Bold | 14px/700 | 26rpx/600 | |
| 导航 | 14px/400 | 26rpx/400 | |
| 标签 | 12px/700 | 22rpx/600 | |
| 微型 | 10px/400 | 20rpx/400 | |

### 3.3 组件设计规范

**Pill CTA 按钮（品牌签名）**
- 背景：#cc785c，文字：#faf9f5
- 圆角：9999rpx
- 高度：80rpx
- 内边距：16rpx × 32rpx
- 字号：26rpx，weight 700，uppercase，+2rpx tracking
- Active：背景 #a9583e

**Dark Pill 按钮（深色区域）**
- 背景：#2a2927，文字：#faf9f5
- 圆角：9999rpx
- 内边距：16rpx × 32rpx

**Outlined Pill 按钮**
- 背景：透明，文字：#faf9f5
- 边框：1rpx solid #6c6a64
- 圆角：9999rpx
- 内边距：8rpx × 32rpx

**圆形控制按钮**
- 背景：#cc785c，图标：#faf9f5
- 圆角：50%（圆形）
- 尺寸：80rpx × 80rpx

**深色卡片**
- 背景：#181818（深色区域）/ #efe9de（暖奶油区域）
- 圆角：12rpx
- 无边框
- 悬停/提升：重度阴影 rgba(0,0,0,0.3) 0 16rpx 16rpx

**搜索输入框（pill）**
- 背景：#2a2927（深色）/ #faf9f5（亮色）
- 文字：#faf9f5 / #141413
- 圆角：9999rpx（pill）
- 内边距：24rpx × 96rpx 24rpx 48rpx（图标预留）

**导航项**
- 活跃：26rpx，weight 600，#141413
- 非活跃：26rpx，weight 400，#6c6a64

**语义状态标签**
- 错误：#f3727f
- 警告：#ffa42b
- 信息：#539df5
- 成功：#2b9a66

### 3.4 页面布局模板

**首页（暖奶油 + 深色局部）**
- 背景：#faf9f5
- 功能卡片网格（2-3 列）
- 深色代码展示区（#181715）

**工具详情页（深色沉浸）**
- 背景：#181715
- 内容密集排列
- 珊瑚色 CTA + 圆形控制

**学习列表页**
- 背景：#faf9f5
- 紧凑列表（14-16px）
- Pill 标签过滤

### 3.5 WXSS 实现示例

**Pill CTA 按钮**

```css
.btn-pill-green {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  height: 80rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  text-align: center;
  line-height: 80rpx;
}
.btn-pill-green:active {
  background-color: #a9583e;
}
```

**Dark Pill 按钮**

```css
.btn-pill-dark {
  background-color: #2a2927;
  color: #faf9f5;
  border-radius: 9999rpx;
  height: 80rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
  line-height: 80rpx;
}
```

**Outlined Pill 按钮**

```css
.btn-pill-outline {
  background-color: transparent;
  color: #faf9f5;
  border: 1rpx solid #6c6a64;
  border-radius: 9999rpx;
  height: 80rpx;
  padding: 8rpx 32rpx;
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
  line-height: 80rpx;
}
```

**圆形控制按钮**

```css
.btn-circle {
  background-color: #cc785c;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**深色卡片 + 重度阴影**

```css
.card-dark {
  background-color: #181818;
  border-radius: 12rpx;
  padding: 32rpx;
  box-shadow: rgba(0,0,0,0.3) 0 16rpx 16rpx;
}
```

**搜索输入框（pill）**

```css
.search-pill {
  background-color: #faf9f5;
  color: #141413;
  border-radius: 9999rpx;
  height: 80rpx;
  padding: 24rpx 96rpx 24rpx 48rpx;
  font-size: 28rpx;
}
```

**紧凑列表项**

```css
.list-item {
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #e5dfd4;
}
.list-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #141413;
}
.list-item__meta {
  font-size: 22rpx;
  color: #6c6a64;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具列表页**：紧凑列表 + pill 标签过滤的密集信息展示
- **深色代码展示区**：深色卡片 + 重度阴影的沉浸感
- **学习播放/操作页**：圆形控制按钮适合"开始刷题"等操作
- **搜索页**：pill 搜索输入框

### 4.2 不适合用在哪些页面
- **首页**：沉浸式暗色与暖奶油画布冲突
- **设置页**：pill 按钮在表单中过于活泼
- **错题本详情**：需要暖色调阅读感

### 4.3 混搭建议
- **pill 按钮（9999rpx）+ uppercase + wide tracking**用于主要 CTA
- **圆形控制按钮**用于"开始刷题"等核心操作
- **深色卡片 + 重度阴影**仅用于代码展示区
- **紧凑排版（20-28rpx）**用于列表和密集信息
- **语义色**用于状态标记（错误、警告、成功）

---

## 5. 实施检查清单

- [ ] Pill 按钮使用 9999rpx 圆角 + uppercase + 2rpx tracking
- [ ] 珊瑚色 #cc785c 替代 Spotify Green
- [ ] 圆形控制按钮 50% 圆角用于核心操作
- [ ] 深色卡片使用 12rpx 圆角 + 重度阴影
- [ ] 暖奶油画布 #faf9f5 用于主区域
- [ ] 紧凑排版 20-28rpx 用于列表
- [ ] 语义色保留：红 #f3727f、橙 #ffa42b、蓝 #539df5
- [ ] pill 搜索输入框 9999rpx
- [ ] 导航项区分活跃/非活跃状态
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/spotify-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
