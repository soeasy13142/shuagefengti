# Bugatti 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/bugatti-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Bugatti 的设计核心是 **"极致克制的奢华工程"** —— 纯黑画布 + 白色 UPPERCASE 宽间距标题 + 全幅汽车摄影，没有任何强调色、没有装饰元素、没有阴影、没有渐变。品牌能量完全来自摄影、字体和留白。三款自定义字体（Display / Text Regular / Monospace）严格分工，weight 400 贯穿全系统 —— 永不加粗。视觉层级完全靠字号、间距、大小写和字体族对比建立。

### 1.2 视觉 DNA
1. **纯黑画布 #000**：所有页面的唯一底色
2. **零强调色**：全系统唯一的非黑白色是 #c3d9f3（冰蓝链接），且极少出现
3. **永不加粗 weight 400**：所有字体保持 400 regular，靠字号和间距建立层级
4. **宽 letter-spacing**：wordmark 6px、display 2-4px、button 2.5px、nav 2px
5. **三字体严格分工**：Display（标题）/ Text Regular（正文 serif）/ Monospace（按钮/导航）
6. **pill 形透明按钮**：透明底 + 白色轮廓 + pill 圆角，Bugatti 独有
7. **120px section 节奏**：最宽松的 section 间距，因内容以摄影为主
8. **无装饰元素**：无条纹、无徽章、无品牌标识装饰（仅 wordmark）

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 主色（白色） | #ffffff | 标题、CTA 轮廓 |
| 画布（纯黑） | #000000 | 默认页面底色 |
| 表面柔暗 | #0d0d0d | spec 表格 |
| 表面卡片 | #141414 | 卡片 |
| 表面提升 | #1f1f1f | 嵌套卡片 |
| 正文 | #cccccc | 默认正文（非纯白） |
| 正文强调 | #e6e6e6 | 强调正文 |
| 次要文字 | #999999 | footer、日期 |
| 柔灰 | #666666 | 版权行 |
| 分割线 | #262626 | 1px 分割线 |
| 分割线强 | #3a3a3a | 输入框底线 |
| 链接蓝 | #c3d9f3 | 唯一非黑白色，极少使用 |

### 1.4 字体策略
- **Bugatti Display**：标题字体，UPPERCASE，weight 400，宽 tracking（2-6px）
- **Bugatti Text Regular**：正文字体，serif，sentence-case，weight 400，0 tracking
- **Bugatti Monospace**：按钮/导航/说明字体，UPPERCASE，weight 400，2-2.5px tracking
- **永不加粗**：全系统 400 regular，靠字号（4×层级）和间距建立视觉重量
- **serif 正文**：与全 sans-serif 的竞品形成差异

### 1.5 布局与组件模式
- **按钮**：pill 形（9999px）、透明底、白色轮廓、14×32px 内边距
- **圆形图标按钮**：40×40px、透明底、白色轮廓
- **卡片**：0px 圆角、#141414 背景、24px 内边距
- **输入框**：透明底、仅底线边框、0px 圆角
- **间距**：4px 基础、section 120px、卡片间距 40px
- **最大宽度**：~1280px
- **无阴影**：深度完全靠摄影和色块对比

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **宽 letter-spacing 标题**：Bugatti 的"机械精度"间距风格，可在 UPPERCASE 标签中使用 2-3rpx tracking
2. **pill 形透明按钮**：在深色背景上的透明 pill + 白色轮廓，可用于深色区块 CTA
3. **serif 正文字体**：Bugatti 的 serif 正文与暖奶油画布的 Georgia 衬线天然兼容
4. **零强调色策略**：Bugatti 的"全靠字号/间距/大小写建立层级"思路，与暖奶油画布的克制美学一致
5. **三字体分工思路**：标题 serif / 正文 serif / 按钮 mono 的分工可借鉴

### 2.2 需要改造的设计决策

| 原方案做法 | 本项目应该怎么做 | 原因 |
|---|---|---|
| 纯黑画布 #000000 | 暖奶油画布 #faf9f5 为主 | 暖色基调不可变 |
| 零强调色 | 珊瑚色 #cc785c 作为 CTA | 学习工具需要明确的操作信号 |
| weight 400 永不加粗 | 标题可用 500、按钮用 500 | 小程序中 400 在小字号可能不够清晰 |
| 宽 tracking（2-6px） | 收窄为 1-3rpx | rpx 在小程序中 6px 等效过大 |
| 0px 圆角卡片 | 24rpx 圆角卡片 | 暖奶油画布的友好圆角 |
| Bugatti Monospace 按钮 | system-ui 按钮 | 微信小程序无法加载 |
| 120px section 间距 | 96rpx | 适配小程序的紧凑屏幕 |
| 透明输入框底线 | 有边框输入框 | 透明底线在亮色画布上不可见 |

### 2.3 不可迁移的设计决策

1. **零强调色**：学习工具需要明确的 CTA 颜色引导用户操作
2. **0px 圆角**：与暖奶油画布的圆角语言直接冲突
3. **三款 Bugatti 授权字体**：微信小程序无法加载
4. **纯黑画布为默认**：暖奶油画布以暖奶油为基调
5. **透明输入框**：在亮色画布上底线不可见，可用性差
6. **120px 超大 section 间距**：小程序屏幕太小，会浪费空间

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Bugatti 角色 | 原色值 | 本项目色值 | 说明 |
|---|---|---|---|
| 主色（白） | #ffffff | #faf9f5 | 暖白 |
| 画布（纯黑） | #000000 | #181715 | 深海军蓝（仅用于强调区） |
| 表面卡片 | #141414 | #252320 | 深色提升卡片 |
| 表面提升 | #1f1f1f | #1f1e1b | 嵌套卡片 |
| 正文 | #cccccc | #a09d96 | 暖灰正文 |
| 正文强调 | #e6e6e6 | #faf9f5 | 暖白强调 |
| 次要文字 | #999999 | #6c6a64 | 暖灰次要 |
| 柔灰 | #666666 | #8e8b82 | 暖柔灰 |
| 分割线 | #262626 | #252320 | 深色分割线 |
| 链接蓝 | #c3d9f3 | #cc785c | 珊瑚色（替代冰蓝） |

### 3.2 字体映射

| Bugatti Token | Bugatti 参数 | 本项目参数 | 说明 |
|---|---|---|---|
| display-xl | 64px / 400 / 4px | 80rpx / 400 / 3rpx | Georgia 衬线，UPPERCASE |
| display-lg | 48px / 400 / 3px | 64rpx / 400 / 2rpx | 区域标题 |
| display-md | 32px / 400 / 2px | 48rpx / 400 / 2rpx | 小节标题 |
| display-sm | 24px / 400 / 1.5px | 40rpx / 400 / 1rpx | 卡片标题 |
| wordmark | 14px / 400 / 6px | 24rpx / 400 / 4rpx | 品牌标识 |
| title-md | 20px / 400 / 1px | 34rpx / 400 / 1rpx | 列表标题 |
| title-sm | 16px / 400 / 1.5px | 28rpx / 400 / 1rpx | 标注 |
| caption-uppercase | 11px / 400 / 2px | 20rpx / 400 / 2rpx | 说明标签 |
| body-md | 16px / 400 / 0 | 28rpx / 400 / 0 | 正文（Georgia serif） |
| body-sm | 14px / 400 / 0 | 26rpx / 400 / 0 | 辅助正文 |
| button | 14px / 400 / 2.5px | 26rpx / 500 / 2rpx | 按钮（改为 500） |
| nav-link | 12px / 400 / 2px | 22rpx / 400 / 2rpx | 导航 |

### 3.3 组件设计规范

**按钮（深色面上 Pill，Bugatti 风格）**
- 背景：透明，文字：#faf9f5
- 边框：1rpx solid #faf9f5
- 圆角：9999rpx（pill 形）
- 内边距：20rpx 56rpx
- 字号：26rpx / 500 / UPPERCASE / 2rpx tracking

**圆形图标按钮（深色面上）**
- 背景：透明
- 边框：1rpx solid #faf9f5
- 圆角：9999rpx
- 尺寸：72rpx × 72rpx

**深色卡片**
- 背景：#252320
- 圆角：24rpx（非 Bugatti 的 0px）
- 内边距：40rpx
- 文字：#faf9f5 标题、#a09d96 正文

**输入框（亮色画布版）**
- 背景：#faf9f5
- 边框：仅底部 1rpx solid #e6dfd8
- 圆角：0（仅底部边框时可用）
- 内边距：16rpx 0
- 高度：72rpx

**日期/分类标签（caption-uppercase 风格）**
- 字号：20rpx / 400 / UPPERCASE / 2rpx tracking
- 颜色：#6c6a64
- 无背景、无边框

### 3.4 页面布局模板

**Hero 区（Bugatti 暗色 hero 暖化版）**
- 背景：#181715
- 内边距：上下 160rpx，左右 48rpx
- 内容：Georgia 衬线超大标题（UPPERCASE，3rpx tracking）+ 一行说明 + pill CTA
- 极简 —— 标题 + 按钮，无副标题无装饰

**内容展示区（极简暗色卡片）**
- 背景：#181715
- 2 列卡片
- 每卡片：深色卡片 + 标题 + 说明 + 链接

**详情页（spec 风格）**
- 深色背景
- 单列 spec 行
- 每行：数值 + UPPERCASE 标签，分割线分隔

**Footer**
- 背景：#181715
- 文字：#6c6a64
- 极简 —— 品牌标识 + 版权

### 3.5 WXSS 实现示例

**Bugatti 风格 pill 透明按钮（暖化版）**
```css
.btn-bugatti-pill {
  background-color: transparent;
  color: #faf9f5;
  border: 1rpx solid #faf9f5;
  border-radius: 9999rpx;
  padding: 20rpx 56rpx;
  font-size: 26rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  line-height: 1;
  text-align: center;
}
```

**Bugatti 风格 UPPERCASE 宽间距标题**
```css
.heading-bugatti {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  text-transform: uppercase;
  line-height: 1.1;
  color: #faf9f5;
}

.heading-bugatti--xl {
  font-size: 80rpx;
  letter-spacing: 3rpx;
}

.heading-bugatti--lg {
  font-size: 64rpx;
  letter-spacing: 2rpx;
}

.heading-bugatti--md {
  font-size: 48rpx;
  letter-spacing: 2rpx;
}
```

**Bugatti 风格 spec 行**
```css
.spec-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #252320;
}

.spec-row__value {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 34rpx;
  font-weight: 400;
  color: #faf9f5;
}

.spec-row__label {
  font-size: 20rpx;
  font-weight: 400;
  color: #6c6a64;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页 Hero 区**：Bugatti 的极简暗色 hero + 超大标题 + pill CTA 适合首页的"宣言式"第一屏
- **关于/品牌页**：Bugatti 的极简克制风格适合展示项目理念
- **算法可视化**：Bugatti 的暗色 + monospace 风格非常适合代码展示
- **成就/里程碑页**：Bugatti 的 spec 行风格适合展示学习里程碑

### 4.2 不适合用在哪些页面
- **刷题页面**：需要明确的操作引导，Bugatti 的"零强调色"会让用户迷失
- **列表密集页面**：Bugatti 的超大间距浪费小程序空间
- **表单页面**：透明底线输入框在亮色画布上不可见
- **错题本/记录页**：需要温暖鼓励的氛围

### 4.3 混搭建议
- **首页 Hero**：采用 Bugatti 的极简暗色 hero，但加入珊瑚色 CTA
- **功能页面**：保持暖奶油画布的亮色基调
- **UPPERCASE 标签**：采用 Bugatti 的宽间距 UPPERCASE 用于分类标签
- **serif 正文**：采用 Bugatti 的 serif 正文思路，与 Georgia 衬线天然兼容
- **整体基调**：暖奶油画布为主，Bugatti 仅提供暗色 hero 和 UPPERCASE 标签参考

---

## 5. 实施检查清单

- [ ] 纯黑 #000000 替换为深海军蓝 #181715
- [ ] 零强调色改为珊瑚色 #cc785c CTA
- [ ] 0px 圆角替换为 24rpx（卡片）/ 9999rpx（pill 按钮）
- [ ] 所有 px 转换为 rpx
- [ ] letter-spacing 收窄（6px → 4rpx，4px → 3rpx）
- [ ] 透明输入框改为有边框输入框
- [ ] section 间距从 120px 改为 96rpx
- [ ] 按钮 weight 从 400 改为 500（小程序可读性）
- [ ] serif 正文保留（Georgia 衬线）
- [ ] UPPERCASE + tracking 保留用于标签和导航

---

## 6. 参考文件

- 原方案：.claude/skills/bugatti-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
