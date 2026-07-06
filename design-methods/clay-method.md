# Clay 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/clay-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Clay 的设计核心是"暖色画布 + 饱和彩色卡片"——用奶油色暖白画布区别于竞品的冷灰色调，用 6 色饱和色卡片（粉、青、薰衣草、桃、赭、奶）作为页面视觉节奏的核心驱动力。品牌温度来自 3D 粘土动画插画和圆润的自定义字体，而非传统 SaaS 的渐变或阴影。

### 1.2 视觉 DNA
- 奶油色暖白画布（#fffaf0），区别于冷灰白
- 6 色饱和单色功能卡片循环排列
- 3D 粘土动画风格插画（山、角色、吉祥物）
- 自定义圆润显示字体（Plain Black），weight 500 + 负 letter-spacing
- 大圆角：功能卡 24px，内容卡 16px，按钮 12px
- 零阴影，靠色块对比表达深度
- 奶油色页脚（非深色），暖色贯穿全页

### 1.3 色彩策略
- 主色/CTA：#0a0a0a（近黑）
- 画布：#fffaf0（暖白）
- 卡片：#f5f0e0（奶油）
- 品牌色组：#ff4d8b（粉）、#1a3a3a（青）、#b8a4ed（薰衣草）、#ffb084（桃）、#e8b94a（赭）、#a4d4c5（薄荷）
- 语义色：成功 #22c55e、警告 #f59e0b、错误 #ef4444

### 1.4 字体策略
- 显示字体：Plain Black（替代方案 Inter weight 500, -0.05em tracking）
- 正文字体：Inter
- 显示层级：72/56/40/32px，weight 500，负 letter-spacing
- 正文层级：16/14px，weight 400
- 标签/按钮：14px，weight 600

### 1.5 布局与组件模式
- 卡片圆角：功能卡 24px，内容卡 16px，按钮/输入框 12px
- 间距系统：4px 基数，section 节奏 96px
- 按钮高度 44px，padding 12×20px
- 无阴影，纯色块对比
- 标签/Tab 用 pill 形状（9999px 圆角）

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **奶油色暖白画布**：与本项目当前暖奶油画布（#faf9f5）高度契合，色调接近，可直接参考
- **零阴影策略**：本项目已采用零阴影靠色块对比，完全一致
- **大圆角卡片**：24rpx 功能卡圆角与本项目 24rpx 卡片圆角完全匹配
- **pill 形状标签**：本项目可直接用于分类标签、学习状态标记
- **饱和色卡片循环排列**：非常适合工具箱首页的功能入口卡片，每种工具一个颜色
- **间距系统 4px 基数**：与 rpx 系统兼容，可直接映射

### 2.2 需要改造的设计决策
- **显示字体 weight 500 + 负 tracking**：原方案用 Plain Black 圆润字体，本项目用 Georgia 衬线。Georgia 的 weight 400 + -3rpx tracking 已有类似温暖感，无需改为 500
- **6 色饱和色卡片**：原方案用高饱和粉/青/薰衣草，本项目主色为珊瑚色 #cc785c。建议将饱和色降低 15-20% 明度，使其与暖奶油画布更和谐
- **3D 粘土动画插画**：微信小程序无法使用 3D 渲染，改为扁平化手绘风格图标或 CSS 渐变色块模拟
- **按钮 12px 圆角**：本项目用 24rpx（约 12px），可直接采用，但需确认与珊瑚色 CTA 的视觉协调

### 2.3 不可迁移的设计决策
- **Plain Black 自定义字体**：微信小程序不支持自定义字体加载（除系统字体外），必须用 Georgia 或系统 sans-serif
- **96px section 节奏**：小程序页面通常较短，96px 节奏过大，建议改为 48-64rpx
- **1280px 最大宽度**：小程序全屏设计，无需考虑最大宽度
- **7-5 分栏 Hero 布局**：小程序单栏布局，Hero 区改为全宽

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #fffaf0 | #faf9f5 | 极接近，可直接使用或微调 |
| Surface Card（卡片） | #f5f0e0 | #efe9de | 本项目略深，保持一致 |
| Primary（CTA） | #0a0a0a | #cc785c | 本项目用珊瑚色，非近黑 |
| Brand Pink | #ff4d8d | #e8917a（降饱和） | 功能卡色1 |
| Brand Teal | #1a3a3a | #5a8a8a（提亮） | 功能卡色2 |
| Brand Lavender | #b8a4ed | #a894cc（降饱和） | 功能卡色3 |
| Brand Peach | #ffb084 | #e8a878（降饱和） | 功能卡色4 |
| Brand Ochre | #e8b94a | #c8a040（降饱和） | 功能卡色5 |
| On Primary | #ffffff | #faf9f5 | 暖白文字在深色上 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 72px/500/-2.5px | 64rpx/400/-3rpx | Georgia 衬线，保持暖感 |
| Section 标题 | 56px/500/-2px | 48rpx/400/-2rpx | |
| Sub 标题 | 40px/500/-1px | 36rpx/400/-1rpx | |
| 卡片标题 | 18px/600 | 32rpx/400 | 本项目标题统一 400 weight |
| 正文 | 16px/400 | 28rpx/400 | |
| 小字 | 14px/400 | 24rpx/400 | |
| 标签 | 12px/600 | 22rpx/600 | 保留 weight 600 做标签强调 |
| 按钮 | 14px/600 | 26rpx/600 | |

### 3.3 组件设计规范

**功能卡片（Feature Card）**
- 背景：饱和色（5 色循环）
- 文字：#faf9f5（深色卡片上）或 #141413（浅色卡片上）
- 圆角：24rpx
- 内边距：48rpx
- 无阴影

**主按钮（Button Primary）**
- 背景：#cc785c（珊瑚色）
- 文字：#faf9f5
- 圆角：24rpx
- 高度：88rpx（44px × 2）
- 内边距：24rpx × 40rpx

**标签（Badge Pill）**
- 背景：#efe9de（奶油卡片色）
- 文字：#141413
- 圆角：9999rpx（pill）
- 内边距：8rpx × 24rpx

**输入框（Text Input）**
- 背景：#faf9f5
- 文字：#141413
- 圆角：24rpx
- 高度：88rpx
- 内边距：24rpx × 32rpx

### 3.4 页面布局模板

**Hero 区**
- 全宽，上下内边距 64rpx
- 标题 64rpx Georgia，-3rpx tracking
- 副标题 28rpx
- 按钮行居中

**功能卡片区**
- 2 列网格，间距 24rpx
- 每张卡片 48rpx 内边距
- 5 色循环排列

**列表区**
- 单列，行高 88rpx
- 左侧图标 + 右侧文字

**底部操作区**
- 全宽，上下 48rpx
- 珊瑚色 CTA 按钮

### 3.5 WXSS 实现示例

**功能卡片（饱和色变体）**

```css
.feature-card {
  border-radius: 24rpx;
  padding: 48rpx;
  margin-bottom: 24rpx;
}
.feature-card--pink {
  background-color: #e8917a;
  color: #faf9f5;
}
.feature-card--teal {
  background-color: #5a8a8a;
  color: #faf9f5;
}
.feature-card--lavender {
  background-color: #a894cc;
  color: #141413;
}
```

**主按钮**

```css
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 24rpx;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 40rpx;
  font-size: 26rpx;
  font-weight: 600;
  text-align: center;
}
.btn-primary:active {
  background-color: #a9583e;
}
```

**Pill 标签**

```css
.badge-pill {
  background-color: #efe9de;
  color: #141413;
  border-radius: 9999rpx;
  padding: 8rpx 24rpx;
  font-size: 22rpx;
  font-weight: 600;
  display: inline-block;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页功能入口区**：Clay 的饱和色卡片循环排列非常适合展示工具箱的多个功能模块，每个工具一个颜色
- **学习进度展示**：不同学习阶段用不同饱和色卡片区分，视觉层次清晰
- **工具详情页 Hero**：Clay 的大标题 + 色彩卡片组合适合突出单个工具的核心功能

### 4.2 不适合用在哪些页面
- **设置页/表单页**：Clay 的饱和色卡片不适合大量表单元素，会分散注意力
- **深色主题页面**：Clay 的暖奶油体系与深色模式冲突
- **密集数据展示页**：如错题统计，需要冷静的中性色调而非饱和色

### 4.3 混搭建议
- **保留暖奶油画布**（#faf9f5）作为全局背景，与 Clay 的 #fffaf0 几乎一致
- **引入 Clay 的饱和色卡片系统**用于首页功能入口，但将珊瑚色 #cc785c 保持为唯一 CTA 色
- **功能卡 5 色循环**与暖奶油画布搭配时，降低饱和度 15-20% 避免过于跳跃
- **正文排版保持 Georgia**，不引入 Plain Black，但借鉴其负 tracking 策略

---

## 5. 实施检查清单

- [ ] 确认饱和色卡片在暖奶油画布上的对比度（WCAG AA 4.5:1）
- [ ] 5 色功能卡循环排列，相邻两张不重复同色
- [ ] 所有卡片保持 24rpx 圆角，零阴影
- [ ] 按钮/输入框保持 24rpx 圆角
- [ ] 标签用 pill 形状（9999rpx）
- [ ] Georgia 标题保持 400 weight，不加粗
- [ ] section 节奏控制在 48-64rpx，不使用 96px
- [ ] 所有尺寸用 rpx，不用 px

---

## 6. 参考文件

- 原方案：.claude/skills/clay-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
