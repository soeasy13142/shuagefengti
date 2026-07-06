# Sentry 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/sentry-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Sentry 的设计语言是"穿皮夹克的调试控制台"——深紫午夜画布（#1f1633）搭配电光绿（#c2ef4e）关键词高亮，整体读感是严肃的开发者工具被注入了叛逆个性。品牌最强视觉签名是**显示标题中的绿色高亮 chip**——单个关键词被 lime 色包裹，模拟代码语法高亮的阅读体验。系统采用双极画布：深色用于营销/产品展示，白色用于定价/联系表单，两者绝不混合。

### 1.2 视觉 DNA
- 深紫午夜画布 #1f1633（营销页）+ 纯白画布 #ffffff（交易页）
- 电光绿 #c2ef4e 关键词高亮 chip（品牌签名）
- 热粉 #fa7faa 次要点缀
- 自定义显示字体（chunky, near-condensed）+ Rubik UI 字体 + Monaco 代码字体
- 大写按钮标签 + 0.2px tracking（控制台风格）
- 贴纸风格插画 mascot（宇航员、怪物、交通锥）
- 90px pill 按钮 + 超宽水平内边距（28-30px）
- 显示标题紧凑负 letter-spacing

### 1.3 色彩策略
- 深色画布：#1f1633（紫午夜）
- 深色表面：#150f23（更深紫）
- 亮色画布：#ffffff
- 主色/CTA：#150f23（近黑紫，用于亮色页面按钮）
- 电光绿：#c2ef4e（关键词高亮，非按钮）
- 热粉：#fa7faa（次要装饰）
- 紫色中调：#79628c（标签 chip）
- 深紫：#422082（聚光灯卡片）
- 文字亮面：#ffffff
- 文字暗面：#1f1633
- hairline 暗：#362d59
- hairline 亮：#cfcfdb / #e5e7eb

### 1.4 字体策略
- 显示：Sentri Display / Rubik fallback，88/60px，weight 700/500
- UI/正文：Rubik，16/14px，weight 400/500/600/700
- 代码：Monaco / Menlo，16px，weight 400/700
- 大写标签：14px，weight 700，+0.2px tracking

### 1.5 布局与组件模式
- 圆角：按钮 8px（md），卡片 12px（xl），pill 9999px
- 间距基数 8px，section 96px
- 最大内容宽度 ~1152px
- 深度语言：暗色画布无阴影（靠纹理和插画），亮色画布用 2层阴影
- 贴纸 mascot 跨越 section 边界
- lime squiggly footer 分割线

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **双极画布概念**：深色局部区域（代码区）+ 暖奶油主区域的思路可借鉴
- **关键词高亮 chip**：非常适合标记学习重点/题目关键词
- **大写按钮标签 + tracking**：控制台风格适合工具类应用
- **90px pill 按钮**：与本项目全圆角按钮理念一致
- **紧凑负 letter-spacing 显示标题**：Georgia 衬线同样适用
- **标签 chip 系统**：紫色中调标签适合分类标记

### 2.2 需要改造的设计决策
- **深紫午夜画布 #1f1633**：改为深海军蓝 #181715 保持与暖奶油体系一致
- **电光绿 #c2ef4e**：改为更柔和的暖绿色，避免与暖奶油冲突
- **近黑紫 CTA #150f23**：改为珊瑚色 #cc785c
- **88px 显示标题**：小程序屏幕有限，最大 64rpx
- **贴纸 mascot 插画**：小程序中简化为图标或省略
- **大写按钮**：保留但降低 tracking 值

### 2.3 不可迁移的设计决策
- **Sentri Display 自定义字体**：微信小程序不支持，用 Georgia + 系统 sans-serif
- **Rubik**：用系统 sans-serif 替代
- **Monaco**：用系统等宽字体替代
- **星场纹理背景**：小程序性能限制
- **跨 section 边界的浮动 mascot**：小程序布局限制
- **lime squiggly footer 分割线**：简化为实线

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Dark Canvas（深色画布） | #1f1633 | #181715 | 深海军蓝 |
| Night（深色表面） | #150f23 | #141413 | 暖墨 |
| Light Canvas（亮色画布） | #ffffff | #faf9f5 | 暖奶油 |
| Primary/CTA | #150f23 | #cc785c | 珊瑚色 |
| On Primary | #ffffff | #faf9f5 | |
| Accent Lime（高亮） | #c2ef4e | #c2ef4e | 保留 |
| Accent Pink（装饰） | #fa7faa | #e8a08a | 暖化粉 |
| Violet Mid（标签） | #79628c | #79628c | 保留紫色 |
| Violet Deep（聚光灯） | #422082 | #3a2070 | |
| Ink（亮面文字） | #1f1633 | #141413 | |
| On Dark Muted | rgba(255,255,255,0.72) | rgba(250,249,245,0.72) | |
| Hairline Dark | #362d59 | #2a2825 | |
| Hairline Light | #e5e7eb | #e5dfd4 | |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 88px/700/1.2 | 64rpx/400/-3rpx | Georgia 衬线 |
| Section 标题 | 60px/500/1.1 | 44rpx/400/-1rpx | |
| 卡片标题 | 24px/500/1.25 | 32rpx/600 | |
| 正文 | 16px/400/2.0 | 28rpx/400/1.8 | 营销段落用宽松行高 |
| 正文功能 | 16px/500/1.5 | 28rpx/500 | |
| 按钮大写 | 14px/700/+0.2px | 26rpx/700/+2rpx | uppercase |
| 代码 | 16px/400 mono | 28rpx/400 | Courier New |
| 标签 | 14px/400 | 24rpx/400 | |

### 3.3 组件设计规范

**关键词高亮 Chip（品牌签名）**
- 背景：#c2ef4e
- 文字：#141413
- 圆角：8rpx
- 内边距：0 × 24rpx（水平，垂直 0 紧贴 cap-height）
- 字号：继承父级 display 字号
- 用法：包裹标题中的单个关键词

**CTA 按钮（亮色页面）**
- 背景：#cc785c
- 文字：#faf9f5
- 圆角：16rpx
- 高度：88rpx
- 内边距：24rpx × 32rpx
- 字号：26rpx，weight 700，uppercase，+2rpx tracking

**反转 CTA 按钮（深色页面）**
- 背景：#faf9f5
- 文字：#141413
- 其余同 CTA 按钮

**Ghost 按钮（深色页面）**
- 背景：rgba(250,249,245,0.1)
- 文字：#faf9f5
- 圆角：24rpx
- 内边距：16rpx

**定价卡片（亮色）**
- 背景：#faf9f5
- 文字：#141413
- 圆角：24rpx
- 内边距：64rpx
- 1rpx #e5dfd4 边框

**定价卡片（深色 featured）**
- 背景：#181715
- 文字：#faf9f5
- 其余同上

**紫色标签 Chip**
- 背景：#79628c
- 文字：#faf9f5
- 圆角：8rpx
- 内边距：8rpx × 16rpx
- 字号：24rpx

**深色功能卡片**
- 背景：#141413
- 文字：#faf9f5
- 圆角：36rpx
- 内边距：64rpx

**聚光灯卡片（紫色）**
- 背景：#3a2070
- 文字：#faf9f5
- 圆角：36rpx
- 内边距：64rpx

### 3.4 页面布局模板

**深色 Hero 区**
- 背景：#181715
- 大标题 + lime 关键词高亮 chip
- 副标题 + 反转 CTA
- 下方：深色功能卡片

**亮色定价区**
- 背景：#faf9f5
- 卡片 2 列布局
- 一个深色 featured 卡片

**深色功能展示区**
- 背景：#181715
- 深色卡片 + 紫色聚光灯卡片交替

### 3.5 WXSS 实现示例

**关键词高亮 Chip**

```css
.keyword-chip {
  display: inline;
  background-color: #c2ef4e;
  color: #141413;
  border-radius: 8rpx;
  padding: 0 24rpx;
}
```

**大写按钮**

```css
.btn-uppercase {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 16rpx;
  height: 88rpx;
  padding: 24rpx 32rpx;
  font-size: 26rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  text-align: center;
  line-height: 88rpx;
}
```

**深色功能卡片**

```css
.card-dark-feature {
  background-color: #141413;
  color: #faf9f5;
  border-radius: 36rpx;
  padding: 64rpx;
}
```

**紫色聚光灯卡片**

```css
.card-spotlight {
  background-color: #3a2070;
  color: #faf9f5;
  border-radius: 36rpx;
  padding: 64rpx;
}
```

**紫色标签**

```css
.tag-violet {
  display: inline-block;
  background-color: #79628c;
  color: #faf9f5;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
}
```

**Squiggly 分割线（简化为实线）**

```css
.divider-lime {
  height: 4rpx;
  background-color: #c2ef4e;
  border-radius: 2rpx;
  margin: 48rpx 0;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页 Hero**：lime 关键词高亮 chip 非常适合强调"刷题"等核心词
- **题目分类页**：紫色标签 chip 适合标记题目分类（算法、数据结构、网络等）
- **学习统计页**：深色区域 + 大数字展示适合成绩统计
- **工具介绍页**：双极画布概念（深色展示区 + 暖奶油操作区）

### 4.2 不适合用在哪些页面
- **设置页**：关键词高亮和深色区域在设置表单中无意义
- **错题本列表**：需要暖色调轻量感
- **纯文本阅读**：深色背景长时间阅读疲劳

### 4.3 混搭建议
- **lime 关键词高亮**作为首页标题的签名装饰，不用于正文
- **深色区域 #181715**仅用于代码题目和统计展示
- **紫色标签**用于题目分类标记
- **大写按钮 + tracking**用于主要 CTA，普通按钮不用
- **宽松行高 1.8**用于营销段落，功能区域用 1.5

---

## 5. 实施检查清单

- [ ] lime 关键词高亮 chip 仅用于标题中的单个关键词
- [ ] chip 使用 #c2ef4e 背景 + #141413 文字 + 8rpx 圆角
- [ ] 深色区域使用 #181715 背景
- [ ] 紫色标签 #79628c 用于题目分类
- [ ] 主要 CTA 使用 uppercase + 2rpx tracking
- [ ] 深色 featured 定价卡片区分于亮色卡片
- [ ] 聚光灯卡片 #3a2070 仅用于特殊强调
- [ ] squiggly 分割线简化为 lime 色实线
- [ ] 零阴影（深色区域），亮色区域可用轻阴影
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/sentry-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
