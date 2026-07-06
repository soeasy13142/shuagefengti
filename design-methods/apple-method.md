# Apple 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/apple-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Apple 的设计核心是 **"产品即展品的博物馆画廊"** —— UI 隐退，让产品（摄影）成为唯一主角。边到边的产品 tile 交替明暗画布，单一 Action Blue (#0066cc) 作为唯一交互色。无装饰渐变、无阴影（仅产品图有一层签名阴影），通过色块对比而非 chrome 表达深度。

### 1.2 视觉 DNA
1. **摄影优先、UI 隐退**：页面像博物馆展厅，产品是唯一的视觉焦点
2. **明暗 tile 交替**：白/灰 ↔ 近黑色，色块变化本身就是分隔线
3. **单色 Action Blue**：#0066cc 承载所有交互元素，无第二品牌色
4. **负 letter-spacing 标题**：-0.12 到 -0.374px 的紧缩追踪，"Apple tight" 标志性感觉
5. **pill 形 CTA**：全圆角按钮是 Apple 的品牌动作信号
6. **仅一层产品阴影**：`rgba(0,0,0,0.22) 3px 5px 30px`，仅用于产品渲染图
7. **极低密度**：每个 tile 约占一个视口，无装饰 chrome
8. **双字体系统**：SF Pro Display（标题）+ SF Pro Text（正文/UI）

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 主色 Action Blue | #0066cc | 链接、pill CTA、焦点环 |
| 主色 Focus | #0071e3 | 键盘焦点环 |
| 深色面链接蓝 | #2997ff | 深色 tile 上的链接 |
| 正文墨色 | #1d1d1f | 标题、正文（非纯黑） |
| 深色正文 | #ffffff | 深色 tile 上的文字 |
| 画布白 | #ffffff | 主画布 |
| 画布灰 | #f5f5f7 | 交替 tile、footer |
| 珍珠白 | #fafafc | 幽灵按钮底色 |
| 近黑 tile 1 | #272729 | 深色 tile 主色 |
| 近黑 tile 2 | #2a2a2c | 微调深色 tile |
| 毛发线 | #e0e0e0 | 1px 边框 |
| 半透明灰 | #d2d2d7 | 浮动控制按钮底色（64% alpha） |

### 1.4 字体策略
- **Display**：SF Pro Display，weight 600，负 letter-spacing
- **Body**：SF Pro Text，weight 400，17px（非 16px）
- **weight 300 为真实存在**：用于 button-large 和 lead-airy，"空气感"提示
- **weight 500 被刻意排除**：阶梯为 300/400/600/700
- **行高**：标题 1.07-1.19（极紧凑）、正文 1.47、footer 链接 2.41（刻意松弛）
- **body 17px 而非 16px**：多出的 1px 定义了品牌的"阅读节奏"

### 1.5 布局与组件模式
- **按钮**：pill 形（9999px）为主 CTA，8px 为工具按钮
- **tile**：无圆角（0px），边到边，色块变化即分隔
- **商店卡片**：18px 圆角、白底、1px hairline 边框
- **间距**：8px 基础、section 80px
- **最大内容宽度**：~980px（文字页）到 ~1440px（产品网格）

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **负 letter-spacing 标题**：Apple 的紧缩追踪标题风格，与暖奶油画布 Georgia 衬线的 -3rpx letter-spacing 理念一致 —— 都追求"紧凑而不拥挤"的标题感
2. **pill 形 CTA**：全圆角按钮作为主操作信号，可直接用于本项目的主 CTA
3. **明暗交替的页面节奏**：暖奶油画布的奶油底 → 深海军蓝 (#181715) 暗色区块，与 Apple 的白/灰 ↔ 近黑 tile 交替逻辑一致
4. **极简阴影哲学**：Apple 仅一层产品阴影，暖奶油画布零阴影 —— 精神高度一致
5. **17px body（对应 28rpx+）**：Apple 刻意用 17px 而非 16px 的"阅读节奏"思路，可在本项目中用 28rpx 体现

### 2.2 需要改造的设计决策

| 原方案做法 | 本项目应该怎么做 | 原因 |
|---|---|---|
| 纯白画布 + 灰色交替 tile | 暖奶油画布 + 奶油卡片交替 | 保持暖色调，不用冷灰 |
| Action Blue #0066cc | 珊瑚 CTA #cc785c | 本项目用暖珊瑚而非冷蓝 |
| SF Pro Display/Text 字体 | Georgia 衬线 + system-ui | 微信小程序不支持 SF Pro |
| 产品 tile 无圆角 (0px) | 卡片 24rpx 圆角 | 暖奶油画布的圆角语言更"友好" |
| body 17px | 28rpx（≈14px @2x）| 微信小程序的 rpx 体系不同 |
| weight 300 用于空气感 | 保持 400 为主 | 微信小程序中 300 weight 可能在低分辨率屏幕显示模糊 |
| 80px section 间距 | 96rpx | 适配 rpx 单位 |

### 2.3 不可迁移的设计决策

1. **边到边无圆角 tile**：与暖奶油画布的圆角卡片语言冲突，0px 圆角在学习工具中显得过于冷硬
2. **SF Pro 字体族**：Apple 专有字体，微信小程序无法加载
3. **weight 300 用于大号文字**：在微信小程序低分辨率屏幕上可能显示不清晰
4. **backdrop-filter 毛玻璃效果**：微信小程序原生不支持 backdrop-filter
5. **产品渲染图签名阴影**：本项目无产品摄影，无需此阴影
6. **56px hero 标题**：在小程序 375px 宽的屏幕上过于巨大

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Apple 角色 | 原色值 | 本项目色值 | 说明 |
|---|---|---|---|
| Action Blue | #0066cc | #cc785c | 珊瑚色替代蓝色 |
| Focus Blue | #0071e3 | #a9583e | 深珊瑚焦点态 |
| 深色面链接 | #2997ff | #faf9f5 | 暖奶油色在深色面上 |
| 正文墨色 | #1d1d1f | #141413 | 暖墨 |
| 画布白 | #ffffff | #faf9f5 | 暖奶油 |
| 画布灰 | #f5f5f7 | #f5f0e8 | 暖灰 |
| 珍珠白 | #fafafc | #efe9de | 奶油卡片 |
| 近黑 tile | #272729 | #181715 | 深海军蓝 |
| 毛发线 | #e0e0e0 | #e6dfd8 | 暖调分割线 |
| 深色面文字 | #ffffff | #faf9f5 | 暖白 |

### 3.2 字体映射

| Apple Token | Apple 参数 | 本项目参数 | 说明 |
|---|---|---|---|
| hero-display | 56px / 600 / -0.28px | 72rpx / 400 / -3rpx | Georgia 衬线，weight 400 |
| display-lg | 40px / 600 / 0 | 64rpx / 400 / -2rpx | 区域标题 |
| display-md | 34px / 600 / -0.374px | 56rpx / 400 / -1rpx | 小节标题 |
| lead | 28px / 400 / 0.196px | 44rpx / 400 / 0 | 引导文字 |
| tagline | 21px / 600 / 0.231px | 36rpx / 500 / 0 | 副标题 |
| body | 17px / 400 / -0.374px | 28rpx / 400 / 0 | 正文 |
| caption | 14px / 400 / -0.224px | 24rpx / 400 / 0 | 说明文字 |
| button | 18px / 300 / 0 | 28rpx / 500 / 0 | 按钮（改为 500） |
| nav-link | 12px / 400 / -0.12px | 22rpx / 400 / 0 | 导航 |

### 3.3 组件设计规范

**按钮（Primary Pill）**
- 背景：#cc785c，文字：#ffffff
- 圆角：9999rpx（pill 形，Apple 签名）
- 内边距：20rpx 40rpx
- 字号：28rpx / 500

**按钮（Secondary Pill）**
- 背景：透明，文字：#cc785c
- 边框：1rpx solid #cc785c
- 圆角：9999rpx

**工具卡片（Store Utility Card 风格）**
- 背景：#faf9f5（暖奶油）
- 边框：1rpx solid #e6dfd8
- 圆角：24rpx（比 Apple 的 18px 稍大）
- 内边距：40rpx
- 内容：图标 + 标题（Georgia） + 描述

**深色 tile 区块**
- 背景：#181715（深海军蓝）
- 文字：#faf9f5（暖白）
- 圆角：24rpx
- 内边距：上下 96rpx，左右 48rpx
- 用于：代码展示、重点功能介绍

**导航标签（Category Tab）**
- 活跃态：#141413 文字 + 2rpx 底部下划线
- 非活跃态：#6c6a64 文字

### 3.4 页面布局模板

**Hero 区（Apple tile 风格，暖化版）**
- 背景：#faf9f5（暖奶油）
- 内边距：上下 96rpx，左右 48rpx
- 内容：Georgia 衬线大标题（-3rpx letter-spacing）+ 一行 tagline + 双 pill CTA
- 可选：右侧放功能预览卡片

**功能展示区（明暗交替）**
- 交替使用奶油底 (#faf9f5) 和深海军蓝底 (#181715)
- 每个区块：标题 + 描述 + 功能预览/操作按钮
- 色块变化即分隔线，无需额外分割符

**工具网格区**
- 3 列（桌面）/ 2 列（平板）/ 1 列（手机），但小程序固定 2 列
- 卡片间距：24rpx
- 每卡片：图标 + 标题 + 简述

**Footer 区**
- 背景：#181715（深色）
- 文字：#a09d96（柔灰）
- 简洁版权信息

### 3.5 WXSS 实现示例

**Apple 风格 pill CTA（暖化版）**
```css
.btn-apple-pill {
  background-color: #cc785c;
  color: #ffffff;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1;
  text-align: center;
  display: inline-block;
}

.btn-apple-pill:active {
  transform: scale(0.95); /* Apple 签名微交互 */
}

.btn-apple-ghost {
  background-color: transparent;
  color: #cc785c;
  border: 1rpx solid #cc785c;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}
```

**Apple 风格明暗交替 tile（暖化版）**
```css
.tile-light {
  background-color: #faf9f5;
  padding: 96rpx 48rpx;
}

.tile-dark {
  background-color: #181715;
  padding: 96rpx 48rpx;
}

.tile-dark .tile__title {
  color: #faf9f5;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -2rpx;
}

.tile-dark .tile__link {
  color: #faf9f5;
  font-size: 28rpx;
}
```

**Apple 风格负 letter-spacing 标题**
```css
.heading-apple {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  letter-spacing: -3rpx; /* Apple tight 的暖奶油画布版本 */
  line-height: 1.1;
  color: #141413;
}

.heading-apple--xl {
  font-size: 72rpx;
}

.heading-apple--lg {
  font-size: 64rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页 Hero 区**：Apple 的 tile 式大标题 + 双 CTA 布局非常适合小程序首页的第一屏
- **模块介绍页**：明暗交替的展示方式适合介绍各个学习工具的功能
- **关于/帮助页**：Apple 的编辑式排版适合长内容阅读
- **深色代码展示**：Apple 的近黑 tile 非常适合代码/算法可视化背景

### 4.2 不适合用在哪些页面
- **刷题页面**：需要高密度信息布局，Apple 的极低密度不适合
- **错题本/记录列表**：需要紧凑列表，Apple 的大留白浪费空间
- **表单密集页面**（导入试题）：Apple 的表单风格过于简约

### 4.3 混搭建议
- **标题风格**：采用 Apple 的负 letter-spacing + Georgia 衬线，与暖奶油画布天然兼容
- **CTA 形状**：pill 形按钮可用于首页主操作，方形按钮用于刷题页面的操作按钮
- **页面节奏**：首页采用 Apple 的明暗交替节奏（奶油 ↔ 深海军蓝），刷题页面保持单色奶油底
- **深色区块**：仅在需要强调的模块（如代码展示、算法可视化）使用 #181715 深色

---

## 5. 实施检查清单

- [ ] 标题使用 Georgia 衬线 + 负 letter-spacing (-2rpx 到 -3rpx)
- [ ] 主 CTA 可选 pill 形 (9999rpx) 或方形 (8rpx)
- [ ] 明暗交替区块使用 #faf9f5 ↔ #181715
- [ ] 深色面上的文字使用 #faf9f5（暖白，非纯白）
- [ ] 所有交互元素使用珊瑚色 #cc785c，不引入蓝色
- [ ] 移除 backdrop-filter（小程序不支持）
- [ ] body 字号不小于 26rpx（小程序可读性）
- [ ] 按钮 weight 使用 500（非 Apple 的 300，因小程序屏幕限制）
- [ ] 移除产品渲染图阴影（本项目无产品摄影）
- [ ] section 间距使用 96rpx

---

## 6. 参考文件

- 原方案：.claude/skills/apple-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
