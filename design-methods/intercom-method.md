# Intercom 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/intercom-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Intercom 的设计语言是"产品截图主导的编辑式营销画布"——暖奶白色画布（#f5f1ec）上漂浮白色卡片，产品 UI 截图是每个版块的主角，营销 chrome 极度克制。唯一品牌色是 Fin Orange（#ff5600），专属于 AI 产品 CTA，不是系统主色。系统主色是炭灰（#111111），承载所有按钮、标题、正文。整体像一本精心编辑的产品杂志：安静、自信、内容为王。

### 1.2 视觉 DNA
- 暖奶白画布（#f5f1ec），非纯白——这是品牌识别的核心信号
- 白色漂浮卡片（#ffffff）从奶油画布上"浮起"，靠色块对比而非阴影
- 炭灰系统主色（#111111）承载所有按钮和标题
- Fin Orange（#ff5600）仅用于 AI 产品 CTA，极度克制
- Saans 专有几何无衬线字体，display weight 500 + 负 letter-spacing（72px 时 -2.0px）
- 卡片圆角保守：12px（标准卡片）、16px（产品截图卡片），不 pill 不方
- 发丝线边框（#d3cec6）替代阴影
- 产品 UI 截图是每个版块的绝对主角

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 画布 | #f5f1ec | 暖奶白，品牌核心表面 |
| 表面 1 | #ffffff | 白色卡片 |
| 表面 2 | #ebe7e1 | 更深奶油，折扣卡、替代行 |
| 墨水 | #111111 | 炭灰，系统主色 |
| 墨水柔 | #626260 | 次要文字 |
| 墨水淡 | #7b7b78 | 辅助文字 |
| 墨水灰 | #9c9fa5 | 禁用、脚注 |
| 发丝线 | #d3cec6 | 卡片边框 |
| 发丝线软 | #ebe7e1 | 柔和分割线 |
| Fin Orange | #ff5600 | AI 产品 CTA 专用 |
| 反色画布 | #000000 | 引用/推荐语深色条 |
| 反色表面 1 | #313130 | 深色上下文悬浮元素 |
| 语义错误 | #c41c1c | 表单验证 |
| 语义成功 | #0bdf50 | 成功状态 |
| 报告蓝 | #65b5ff | 产品内分析图表 |
| 报告绿 | #0bdf50 | 产品内分析图表 |
| 报告粉 | #ff2067 | 产品内分析图表 |

### 1.4 字体策略
- 字体族：Saans（专有几何无衬线），替代：Inter / Geist Sans
- Display weight：500——自信但不粗，这是品牌签名
- Body weight：400
- 负 letter-spacing 随尺寸缩放：72px 时 -2.0px（约 3%），正文为 0
- 行高从 display 1.05 放松到 body 1.50
- Mono：SaansMono，仅用于产品 mockup 中的代码片段
- Eyebrow 用 sentence case，不用全大写

### 1.5 布局与组件模式
- 间距基准：8px，Token 4/8/12/16/24/32/48/96
- 段落间距：96px
- 圆角：按钮 8px、卡片 12px、产品截图 16px、CTA 横幅 24px、pill 9999px
- 阴影：零阴影——深度靠白色卡片在奶油画布上的色块对比
- 最大内容宽度：~1280px
- 网格：3 列桌面、2 列平板、1 列手机
- 产品截图卡片占满内容宽度，是版块主角

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

**1. 暖奶油画布概念**
Intercom 的 #f5f1ec 画布与本项目的 #faf9f5 同属暖奶油色系，色调非常接近。"白色卡片从暖奶油画布上浮起"的层级策略可以直接沿用。

**2. 零阴影 + 色块对比的深度系统**
Intercom 靠白色卡片 vs 奶油画布的色差表达层级，与本项目零阴影策略完全一致。发丝线边框（#d3cec6）作为"更明确的浮起"也与本项目的 #e5dfd4 边框相近。

**3. 炭灰系统主色策略**
Intercom 用 #111111 炭灰承载所有按钮和标题，不用彩色做主 CTA——这种"单色 chrome"策略与本项目的暖墨 #141413 一脉相承。可以借鉴其"彩色只用于特定功能 CTA"的克制用法。

**4. 产品截图作为内容主角**
每个版块的核心是产品 UI 截图而非装饰——这个理念可以迁移到"刷个冯题"：每个功能卡片内嵌入刷题界面的截图或示意，让用户直观看到功能效果。

**5. 保守圆角系统**
12px 标准卡片、16px 大卡片的圆角策略比 pill 更适合工具类产品，比纯方角更亲和。与本项目的 24rpx（约 12px）卡片圆角高度一致。

### 2.2 需要改造的设计决策

**1. Fin Orange → 珊瑚色**
- 原方案：#ff5600 鲜亮橙色
- 本项目：#cc785c 珊瑚色
- Fin Orange 过于鲜亮，与暖奶油体系不协调。改为珊瑚色保持暖调一致性。Fin Orange 的"仅用于特定功能 CTA"的克制策略保留。

**2. Saans 字体 → Georgia + 系统无衬线**
- 原方案：Saans 专有几何无衬线，全层级统一
- 本项目：Georgia 衬线标题 + 系统 sans-serif 正文
- Saans 的几何无衬线感与 Georgia 衬线完全不同，但 weight 500 display 的"自信不粗"理念可以借鉴——Georgia 400 weight 已经足够自信。

**3. 发丝线边框色值微调**
- 原方案：#d3cec6
- 本项目：#e5dfd4
- 色调一致但本项目更浅，需要统一到 #e5dfd4。

**4. 段落间距压缩**
- 原方案：96px section 间距
- 本项目：48-64rpx
- 小程序屏幕较小，96px 过大，需要压缩但仍保持充裕呼吸感。

**5. 深色反色条 → 深海军蓝**
- 原方案：#000000 纯黑反色画布
- 本项目：#181715 深海军蓝
- 纯黑过于生硬，暖海军蓝更贴合暖奶油体系。

### 2.3 不可迁移的设计决策

**1. Saans / SaansMono 专有字体**
微信小程序不支持自定义字体加载（除极有限场景），必须使用系统字体。

**2. 1280px 最大内容宽度**
小程序是全屏设计，不存在最大宽度概念。

**3. 产品截图作为绝对主角**
小程序页面空间有限，不能像营销页那样用大面积截图。改为卡片内嵌小尺寸功能示意。

**4. 多层响应式断点（1440/1280/1024/768/480）**
小程序只有一种屏幕宽度（750rpx 设计稿），不需要多断点响应式。

**5. 报告调色板（Report Palette）**
蓝色、绿色、粉色、青色等报告色是产品内分析图表用的，不属于营销表面色。在本项目中可用于数据可视化，但不能作为品牌色使用。

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #f5f1ec | #faf9f5 | 暖奶油，色调一致 |
| Surface 1（白色卡片） | #ffffff | #ffffff | 纯白卡片，一致 |
| Surface 2（深奶油） | #ebe7e1 | #efe9de | 奶油色标签/替代行 |
| Ink（炭灰主色） | #111111 | #141413 | 暖墨 |
| Ink Muted（次要文字） | #626260 | #6c6a64 | 暖灰 |
| Ink Subtle（辅助文字） | #7b7b78 | #9a9890 | 浅灰 |
| Ink Tertiary（禁用） | #9c9fa5 | #b5b3ad | |
| Hairline（边框） | #d3cec6 | #e5dfd4 | 暖色发丝线 |
| Hairline Soft（柔和分割） | #ebe7e1 | #efe9de | |
| Fin Orange → CTA | #ff5600 | #cc785c | 珊瑚色替代 |
| Fin Orange Active | — | #a9583e | 深珊瑚 |
| Inverse Canvas（深色条） | #000000 | #181715 | 深海军蓝 |
| Inverse Surface 1 | #313130 | #2a2825 | 深色上下文 |
| Inverse Ink | #ffffff | #faf9f5 | 深色面上的文字 |
| Semantic Error | #c41c1c | #c41c1c | 保留 |
| Semantic Success | #0bdf50 | #0bdf50 | 保留 |
| Report Blue | #65b5ff | #65b5ff | 数据可视化用 |
| Report Green | #0bdf50 | #0bdf50 | 数据可视化用 |
| Report Pink | #ff2067 | #ff2067 | 数据可视化用 |

### 3.2 字体映射

| 层级 | 原方案 Saans | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 72px/500/-2.0px | 64rpx/400/-3rpx | Georgia 衬线，400 已足够自信 |
| Section 标题 | 56px/500/-1.4px | 40rpx/400/-2rpx | |
| Sub 标题 | 40px/500/-0.8px | 36rpx/400/-1rpx | |
| 卡片标题 | 22px/500/-0.3px | 32rpx/400/-1rpx | |
| Lead 正文 | 20px/400/-0.2px | 30rpx/400 | |
| 正文 | 16px/400 | 28rpx/400 | |
| 正文小 | 14px/400 | 24rpx/400 | |
| 说明文字 | 12px/400 | 22rpx/400 | |
| 按钮 | 15px/500 | 26rpx/500 | |
| Eyebrow | 14px/500 | 24rpx/500 | sentence case |
| Mono | 13px/400 | 22rpx/400 | Courier New |

### 3.3 组件设计规范

**主 CTA 按钮（charcoal 风格改造）**
- 背景：#141413（暖墨，替代原方案 #111111）
- 文字：#faf9f5
- 圆角：16rpx（原方案 8px = 16rpx）
- 内边距：20rpx × 36rpx
- 字号：26rpx，weight 500
- 按下态：#181715（深海军蓝）

**功能 CTA 按钮（Fin Orange 改造）**
- 背景：#cc785c（珊瑚色）
- 文字：#faf9f5
- 圆角：16rpx
- 内边距：20rpx × 36rpx
- 仅用于特定功能入口（如"开始刷题"），不做通用 CTA

**二级按钮**
- 背景：#ffffff
- 文字：#141413
- 圆角：16rpx
- 1rpx #e5dfd4 边框
- 内边距：20rpx × 36rpx

**三级按钮**
- 背景：#faf9f5
- 文字：#141413
- 圆角：16rpx
- 内边距：20rpx × 36rpx

**功能卡片（Feature Card）**
- 背景：#ffffff
- 圆角：24rpx（原方案 12px ≈ 24rpx）
- 内边距：48rpx
- 无阴影
- 可选 1rpx #e5dfd4 边框（更明确的浮起）

**产品截图卡片（Mockup Card）**
- 背景：#ffffff
- 圆角：32rpx（原方案 16px ≈ 32rpx）
- 内边距：48rpx
- 内嵌功能截图或示意动画
- 无阴影

**深色叙事条（Quote Strip 改造）**
- 背景：#181715（深海军蓝）
- 文字：#faf9f5
- 次要文字：#9a9890
- 圆角：24rpx
- 内边距：64rpx
- 用于重要引用或激励语

**输入框**
- 背景：#ffffff
- 文字：#141413
- 圆角：16rpx
- 内边距：20rpx × 28rpx
- 聚焦态：2rpx #cc785c 边框

### 3.4 页面布局模板

**Hero 区**
- 背景：#faf9f5
- 上下 80rpx
- 大标题 + 副标题 + charcoal CTA + 功能 CTA
- 下方：产品截图卡片（功能预览）

**功能展示区**
- 白色卡片网格（2 列）
- 每张卡片包含：图标 + 标题 + 简述 + 功能截图缩略图
- 卡片间距 24rpx

**深色引用条**
- 全宽 #181715 深海军蓝条
- 居中引言文字
- 上下各 24rpx 与白色区域分隔

**CTA 横幅区**
- 白色卡片
- 圆角 48rpx（原方案 24px ≈ 48rpx）
- 居中标题 + 按钮

### 3.5 WXSS 实现示例

**Charcoal 主 CTA**

```css
.btn-primary {
  background-color: #141413;
  color: #faf9f5;
  border-radius: 16rpx;
  padding: 20rpx 36rpx;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 1.2;
}
.btn-primary:active {
  background-color: #181715;
}
```

**功能 CTA（珊瑚色）**

```css
.btn-accent {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 16rpx;
  padding: 20rpx 36rpx;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 1.2;
}
.btn-accent:active {
  background-color: #a9583e;
}
```

**白色功能卡片 + Hairline**

```css
.card-feature {
  background-color: #ffffff;
  border: 1rpx solid #e5dfd4;
  border-radius: 24rpx;
  padding: 48rpx;
}
```

**产品截图卡片**

```css
.card-mockup {
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 48rpx;
  overflow: hidden;
}
.card-mockup__image {
  width: 100%;
  border-radius: 16rpx;
}
```

**深色叙事条**

```css
.dark-strip {
  background-color: #181715;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 64rpx;
  text-align: center;
}
.dark-strip__meta {
  color: #9a9890;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页**：暖奶油画布 + 白色卡片 + charcoal CTA 的组合与本项目风格高度一致，产品截图卡片可以展示各功能模块的预览
- **功能介绍页**：产品截图主导的版块布局非常适合展示"刷个冯题"的各功能模块
- **深色叙事条**：适合在首页或功能页中插入激励语或产品理念
- **关于/说明页**：编辑式布局 + 充裕留白适合文字密集的说明内容

### 4.2 不适合用在哪些页面
- **刷题页面**：需要专注答题，不需要产品截图式的装饰
- **错题本列表**：需要紧凑列表布局，截图卡片太占空间
- **设置页**：纯表单页面，不需要营销式布局
- **数据统计页**：需要图表和数据密集展示，Intercom 的"安静 chrome"风格会让数据失去焦点

### 4.3 混搭建议
- **Charcoal CTA + 珊瑚色 CTA 不要在同一视口混用**——借鉴 Intercom 的规则，一个版块只用一种 CTA 风格
- **白色卡片从暖奶油画布浮起**作为标准层级策略，与现有设计系统一致
- **深色叙事条**仅用于重要引用或激励语，不超过一个页面一条
- **产品截图卡片**作为功能预览的专属组件，不用于列表或表单
- **圆角 24rpx 标准 / 32rpx 大卡**保持保守，不用 pill 圆角
- **报告调色板**（蓝/绿/粉）仅用于数据可视化场景，不作为品牌色

---

## 5. 实施检查清单

- [ ] 画布使用 #faf9f5（与 Intercom 的 #f5f1ec 同色系）
- [ ] 白色卡片使用 #ffffff，可选 1rpx #e5dfd4 边框
- [ ] Charcoal CTA 使用 #141413 背景 + #faf9f5 文字
- [ ] 功能 CTA 使用 #cc785c 珊瑚色，仅用于特定功能入口
- [ ] 不在同一视口混用 charcoal CTA 和珊瑚色 CTA
- [ ] 标题保持 Georgia 400 weight + 负 letter-spacing
- [ ] 卡片圆角 24rpx（标准）/ 32rpx（大卡），不用 pill
- [ ] 零阴影，深度靠色块对比
- [ ] 产品截图卡片作为功能预览专属组件
- [ ] 深色叙事条使用 #181715 深海军蓝，不超过每页一条
- [ ] 报告调色板仅用于数据可视化
- [ ] 所有尺寸用 rpx
- [ ] 段落间距 48-64rpx（非原方案 96px）

---

## 6. 参考文件

- 原方案：.claude/skills/intercom-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
