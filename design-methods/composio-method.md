# Composio 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/composio-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Composio 的设计语言是"严肃的开发者基础设施"——近乎纯黑的画布（#0f0f0f）上用唯一深电光蓝（#0007cd）做品牌电压。全站深色模式，靠亮度阶梯（#0f0f0f → #181818 → #222222）分层而非阴影。品牌最强视觉签名是四格终端风格 mockup——2x2 深色代码/输出面板网格 + 中央蓝色聚光灯辉光。

### 1.2 视觉 DNA
- 纯黑画布（#0f0f0f），全站深色模式
- 深电光蓝（#0007cd）作为唯一品牌色
- 单一 sans 字体族（abcDiatype）贯穿显示/正文/UI
- 显示 weight 500（自信但不粗暴）
- 亮度阶梯分层：#0f0f0f → #181818 → #222222
- 紧凑 CTA 圆角 8px（开发者风格，非 pill）
- JetBrains Mono 等宽字体用于代码
- 蓝色聚光灯辉光作为大气层效果
- 96px section 节奏

### 1.3 色彩策略
- 画布：#0f0f0f（近黑）
- 卡片：#181818
- 卡片提升：#222222
- 品牌蓝/CTA：#0007cd
- 聚光灯蓝：#1a26ff
- 文字：#ffffff（标题）、#a8a8a8（正文）
- 青色点缀：#00d4ff（数据流可视化）
- 语义色：成功 #33d17a、错误 #ff4d4d

### 1.4 字体策略
- 统一 abcDiatype，weight 400/500/600
- 显示：72/56/44/32/24px，weight 500
- 正文：16/14px，weight 400
- 代码：JetBrains Mono 13px
- 大写标签：11px，weight 600，+0.88px tracking

### 1.5 布局与组件模式
- 圆角：CTA 8px，卡片 12-16px，pill 标签 9999px
- 间距：4px 基数，section 96px
- 按钮高度 40px
- 无阴影，靠亮度阶梯 + 蓝色辉光分层

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **大写标签（caption-uppercase）**：11px weight 600 + 0.88px tracking 的大写标签非常适合学习工具的分类标记
- **紧凑 CTA 圆角（8px）**：比 pill 更紧凑的开发者风格，适合工具类应用
- **亮度阶梯分层思路**：可在暖奶油体系中用 #faf9f5 → #efe9de → #e5dfd4 的奶油色阶梯
- **单一字体族策略**：本项目也用 Georgia 做显示 + 系统 sans 做正文，思路一致
- **代码等宽字体**：适合代码题展示

### 2.2 需要改造的设计决策
- **全站深色模式**：改为暖奶油浅色模式，但保留深色代码区
- **深电光蓝 #0007cd**：改为珊瑚色 #cc785c
- **蓝色聚光灯辉光**：改为暖色渐变辉光（珊瑚色 → 桃色）
- **亮度阶梯 #0f0f0f → #181818 → #222222**：改为奶油色阶梯 #faf9f5 → #efe9de → #e5dfd4
- **8px CTA 圆角**：本项目用 24rpx（约 12px），保持暖感

### 2.3 不可迁移的设计决策
- **abcDiatype 自定义字体**：微信小程序不支持
- **JetBrains Mono 等宽字体**：用 'Courier New', Courier, monospace 替代
- **四格终端 mockup**：微信小程序无法实现 2x2 网格终端模拟，改为单个代码块
- **蓝色聚光灯 radial-gradient 辉光**：微信小程序 CSS 支持 radial-gradient，可部分实现
- **全黑画布**：与暖奶油基调完全冲突

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #0f0f0f | #faf9f5 | 暖白替代近黑 |
| Surface Card | #181818 | #efe9de | 奶油卡片 |
| Surface Card Elevated | #222222 | #e5dfd4 | 提升卡片 |
| Primary（CTA） | #0007cd | #cc785c | 珊瑚色 |
| Primary Active | #0005a3 | #a9583e | 深珊瑚 |
| Spotlight Glow | #1a26ff | #e8917a（暖光） | 暖色辉光替代蓝光 |
| Ink（标题） | #ffffff | #141413 | 暖墨 |
| Body（正文） | #a8a8a8 | #6c6a64 | 暖灰 |
| Muted（次要） | #888888 | #9a9890 | |
| Accent Cyan | #00d4ff | #7ab8c8（降饱和） | 数据可视化点缀 |
| Success | #33d17a | #22c55e | |
| Error | #ff4d4d | #ef4444 | |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 72px/500/-2.16px | 64rpx/400/-3rpx | Georgia 衬线 |
| Section 标题 | 56px/500/-1.68px | 48rpx/400/-2rpx | |
| Sub 标题 | 44px/500/-1.32px | 36rpx/400/-1rpx | |
| 卡片标题 | 18px/600 | 32rpx/600 | |
| 正文 | 16px/400 | 28rpx/400 | |
| 代码 | 13px/400 mono | 24rpx/400 | Courier New |
| 大写标签 | 11px/600/+0.88px | 22rpx/600/+2rpx | **保留大写 + tracking** |
| 按钮 | 14px/500 | 26rpx/600 | |

### 3.3 组件设计规范

**大写标签（Caption Uppercase）**
- 字号：22rpx，weight 600
- 字母间距：+2rpx
- 文字转换：uppercase
- 用于：分类标签、状态标记、工具类型

**功能卡片**
- 背景：#efe9de
- 圆角：24rpx（原方案 16px × 1.5）
- 内边距：48rpx
- 无阴影

**代码块**
- 背景：#181715（深色）
- 文字：#a8a8a8
- 圆角：24rpx
- 内边距：32rpx
- 字体：'Courier New', Courier, monospace，24rpx

**CTA 按钮**
- 背景：#cc785c
- 文字：#faf9f5
- 圆角：16rpx（紧凑开发者风格）
- 高度：80rpx
- 内边距：20rpx × 36rpx

**工具卡片（Toolkit Card）**
- 背景：#efe9de
- 圆角：24rpx
- 内边距：32rpx
- 包含：48rpx 方形图标区 + 标题 + 描述

### 3.4 页面布局模板

**Hero 区 + 暖色辉光**
- 背景：#faf9f5 + 中央暖色 radial-gradient 辉光
- 标题：64rpx Georgia，居中
- 副标题：28rpx，居中
- 两个 CTA 按钮

**工具网格区**
- 4 列（桌面）→ 2 列（平板）→ 1 列（移动端）
- 工具卡片：图标 + 标题 + 描述
- 间距 24rpx

**代码展示区**
- 深色背景 #181715
- 等宽字体
- 模拟终端输出

### 3.5 WXSS 实现示例

**大写标签**

```css
.caption-uppercase {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-transform: uppercase;
  color: #6c6a64;
}
.caption-uppercase--accent {
  color: #cc785c;
}
```

**暖色辉光 Hero**

```css
.hero-glow {
  background-color: #faf9f5;
  background-image: radial-gradient(
    circle at 50% 50%,
    rgba(232, 145, 122, 0.15) 0%,
    rgba(232, 145, 122, 0.05) 40%,
    transparent 70%
  );
  padding: 96rpx 48rpx;
  text-align: center;
}
```

**代码块（深色）**

```css
.code-block {
  background-color: #181715;
  border-radius: 24rpx;
  padding: 32rpx;
  color: #a8a8a8;
  font-family: 'Courier New', Courier, monospace;
  font-size: 24rpx;
  line-height: 1.6;
}
.code-block__prompt {
  color: #cc785c;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具列表页**：Toolkit Card 网格适合展示多个学习工具
- **代码题展示区**：深色代码块 + 等宽字体
- **分类筛选区**：大写标签适合做分类筛选
- **工具详情 Hero**：暖色辉光 + 大标题的组合

### 4.2 不适合用在哪些页面
- **首页**：暖色辉光效果可能分散注意力，首页应保持简洁
- **错题本**：需要温暖回顾感，不适合开发者风格
- **设置页**：大写标签在设置项中过于正式

### 4.3 混搭建议
- **保留暖奶油画布**作为全局背景
- **暖色辉光**仅用于 Hero 区，不扩散到全页
- **大写标签**用于分类标记，正文保持正常大小写
- **深色代码块**仅在代码题展示区使用
- **CTA 圆角**用 24rpx 保持暖感，不采用 8px 紧凑风格

---

## 5. 实施检查清单

- [ ] 大写标签使用 22rpx weight 600 + 2rpx tracking + uppercase
- [ ] 暖色辉光仅用于 Hero 区，使用 radial-gradient
- [ ] 深色代码块使用 #181715，文字 #a8a8a8
- [ ] 等宽字体使用 'Courier New', Courier, monospace
- [ ] 工具卡片使用 48rpx 方形图标区
- [ ] CTA 按钮保持 24rpx 圆角（暖感），不用 8px
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/composio-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
