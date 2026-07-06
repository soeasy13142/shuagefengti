# Mistral AI 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/mistral.ai-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Mistral AI 以"前沿 AI，触手可及"定位，设计语言的核心是**电影级大气感**：日落渐变（芥末黄、橙色、深红）叠加在山脉摄影之上，配合水平"日落条纹"带作为每页的品牌签名收尾。整体气质是**优雅、知性、略带古典**——PP Editorial Old 衬线展示字体与 Inter 无衬线的对比就是品牌声音本身。奶油黄表面（#fff8e0）用于表单面板和特性卡片，饱和橙色（#fa520f）承载所有主要 CTA。

### 1.2 视觉 DNA
- **大气山脉日落 hero 摄影**：橙红黄渐变天空叠加山脉景观
- **水平日落条纹带**（sunset stripe band）：每页底部的品牌签名元素，从红到橙到黄到奶油的多段渐变
- **奶油黄表面**（#fff8e0）：表单面板、特性卡片、页脚的标志性背景色
- **PP Editorial Old + Inter 双字体系统**：衬线展示 + 无衬线 UI，对比即品牌
- **方形圆角按钮**（rounded.md = 8px）：非药丸形，比 Miro 更沉稳
- **方形圆角卡片**（rounded.lg = 12px）：编辑式几何感

### 1.3 色彩策略
- **主色（Primary）**：#fa520f（饱和橙），所有主要 CTA 和 active 状态
- **主色深（Primary Deep）**：#cc3a05，按压状态
- **奶油色（Cream）**：#fff8e0，表单面板、特性卡片、页脚的标志性表面
- **奶油浅（Cream Light）**：#fffaeb，更浅的奶油变体
- **奶油深（Cream Deeper）**：#fff0c2，badge/tag chip 背景
- **米色深（Beige Deep）**：#e6d5a8，奶油表面的 1px 边框色
- **阳光色谱**：#ffd06a（300）、#ffb83e（500）、#ffa110（700）、#ff8105（800）、#ff8a00（900）
- **墨色（Ink）**：#1f1f1f，主要文字
- **画布色（Canvas）**：#ffffff，页面背景和卡片表面

### 1.4 字体策略
- **展示字体**：PP Editorial Old（近衬线优雅展示字体），用于 hero 展示、大数字、编辑式区域开头
- **UI 字体**：Inter（可变字体），用于正文、导航、按钮、标签、说明
- **代码字体**：JetBrains Mono，用于代码块和 IDE mockup
- **字重分配**：400（正文）、500（中等强调+标题）、600（badge 和大写）
- **Hero 展示**：84px / weight 400 / line-height 1.05 / letter-spacing -1.5px

### 1.5 布局与组件模式
- **间距系统**：4px 基础单位，8px 主增量，hero 级别 120px
- **圆角策略**：按钮 `{rounded.md}`（8px），卡片 `{rounded.lg}`（12px），badge `{rounded.full}`
- **阴影哲学**：零阴影，靠色块和渐变表达深度——日落条纹带通过多段渐变承载视觉重量
- **分段式 tab**：下划线风格的 tab 导航（segmented-tab），active 状态用橙色底部边框

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
| Mistral 设计决策 | 刷个冯题适配说明 |
|---|---|
| 奶油黄表面（#fff8e0） | 与暖奶油画布 #faf9f5 高度兼容，可直接用于卡片/面板 |
| 方形圆角按钮（8px） | 比药丸形更适合学习工具的"认真感"，可增强专业气质 |
| 分段式 tab 导航 | 适合工具切换、学科分类等场景 |
| 奶油色 badge 系统 | 适合标记学习状态、难度等级 |
| 代码块深色表面 | 适合代码展示区域（TCP 动画、算法示例） |
| 编辑式排版（衬线+无衬线对比） | 与项目 Georgia 衬线标题 + 系统无衬线正文的方案完全吻合 |

### 2.2 需要改造的设计决策
| Mistral 设计决策 | 改造方案 |
|---|---|
| 日落条纹带（sunset stripe band） | 简化为单一珊瑚色渐变条，或用暖奶油渐变替代 |
| PP Editorial Old 字体 | 替换为 Georgia 衬线，保持编辑式气质 |
| 饱和橙色 CTA #fa520f | 调整为珊瑚色 #cc785c，保持暖色调一致性 |
| 84px hero 展示尺寸 | 缩小到 56-64rpx，适应移动端 |
| 山脉日落 hero 摄影 | 用纯色渐变背景替代，或用抽象几何图案 |
| 1280px 最大宽度 | 小程序固定 750rpx 宽度 |

### 2.3 不可迁移的设计决策
| Mistral 设计决策 | 不可迁移原因 |
|---|---|
| 大气山脉摄影 hero | 项目约束无第三方库，无法加载外部图片资源 |
| 摄影深度效果 | 小程序不支持复杂 CSS 背景混合模式 |
| JetBrains Mono 代码字体 | 小程序不支持自定义等宽字体，使用系统默认 |
| PP Editorial Old 商业字体 | 不可免费使用，Georgia 是最佳替代 |
| 1280px 响应式网格 | 小程序固定宽度 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Mistral Token | 刷个冯题映射值 | 用途 |
|---|---|---|
| `{colors.primary}` #fa520f | `#cc785c`（珊瑚色） | 主 CTA、active 状态、链接 |
| `{colors.primary-deep}` #cc3a05 | `#a9583e`（珊瑚深） | 按压状态 |
| `{colors.cream}` #fff8e0 | `#faf5eb`（暖奶油变体） | 表单面板、特性卡片背景 |
| `{colors.cream-light}` #fffaeb | `#faf9f5`（暖奶油） | 页面背景 |
| `{colors.cream-deeper}` #fff0c2 | `#f0e8d4`（暖米深） | badge/tag 背景 |
| `{colors.beige-deep}` #e6d5a8 | `#d8ccba`（暖米边框） | 奶油表面边框 |
| `{colors.sunshine-700}` #ffa110 | `#e8a868`（暖阳光） | 渐变强调色 |
| `{colors.ink}` #1f1f1f | `#141413`（暖墨） | 主要文字 |
| `{colors.charcoal}` #2c2c2c | `#2c2c2a`（暖炭） | 强调文字 |
| `{colors.slate}` #4a4a4a | `#6c6a64`（暖灰） | 次要文字 |
| `{colors.steel}` #6a6a6a | `#9c9a94`（暖钢） | 辅助文字 |
| `{colors.surface-code}` #1c1c1e | `#181715`（深海军蓝） | 代码块背景 |
| `{colors.hairline}` #e5e5e5 | `#e5e0d8`（暖分割线） | 1px 边框 |

### 3.2 字体映射（用 rpx）

| Mistral Token | 刷个冯题映射 | WXSS 属性 |
|---|---|---|
| `{typography.hero-display}` 84px | 64rpx | `font-family: Georgia, serif; font-size: 64rpx; font-weight: 400; line-height: 1.05; letter-spacing: -3rpx;` |
| `{typography.display-lg}` 64px | 52rpx | `font-family: Georgia, serif; font-size: 52rpx; font-weight: 400; line-height: 1.1; letter-spacing: -2rpx;` |
| `{typography.heading-1}` 52px | 44rpx | `font-family: Georgia, serif; font-size: 44rpx; font-weight: 400; line-height: 1.15; letter-spacing: -2rpx;` |
| `{typography.heading-2}` 36px | 36rpx | `font-family: -apple-system, sans-serif; font-size: 36rpx; font-weight: 500; line-height: 1.2; letter-spacing: -1rpx;` |
| `{typography.heading-3}` 28px | 32rpx | `font-family: -apple-system, sans-serif; font-size: 32rpx; font-weight: 500; line-height: 1.25;` |
| `{typography.body-md}` 16px | 28rpx | `font-family: -apple-system, sans-serif; font-size: 28rpx; font-weight: 400; line-height: 1.6;` |
| `{typography.body-sm}` 14px | 24rpx | `font-family: -apple-system, sans-serif; font-size: 24rpx; font-weight: 400; line-height: 1.5;` |
| `{typography.caption}` 13px | 22rpx | `font-family: -apple-system, sans-serif; font-size: 22rpx; font-weight: 400; line-height: 1.4;` |
| `{typography.button-md}` 14px | 26rpx | `font-family: -apple-system, sans-serif; font-size: 26rpx; font-weight: 500; line-height: 1.3;` |
| `{typography.code-md}` 14px | 24rpx | `font-family: monospace; font-size: 24rpx; font-weight: 400; line-height: 1.5;` |

### 3.3 组件设计规范

**方形按钮（button-primary）**
```css
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  font-size: 26rpx;
  font-weight: 500;
  border-radius: 16rpx;
  padding: 20rpx 40rpx;
  line-height: 1.3;
}
.btn-primary:active {
  background-color: #a9583e;
}
```

**奶油卡片（card-cream）**
```css
.card-cream {
  background-color: #faf5eb;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 1rpx solid #d8ccba;
}
```

**分段式 Tab（segmented-tab）**
```css
.segmented-tab {
  font-size: 24rpx;
  font-weight: 500;
  padding: 16rpx 28rpx;
  border-bottom: 4rpx solid transparent;
  color: #9c9a94;
  background: transparent;
}
.segmented-tab--active {
  color: #cc785c;
  border-bottom-color: #cc785c;
}
```

**代码块（code-block）**
```css
.code-block {
  background-color: #181715;
  color: #faf9f5;
  font-family: monospace;
  font-size: 24rpx;
  line-height: 1.5;
  border-radius: 16rpx;
  padding: 28rpx;
}
```

**奶油 Badge（badge-cream）**
```css
.badge-cream {
  display: inline-flex;
  align-items: center;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 9999rpx;
  padding: 8rpx 20rpx;
  background-color: #f0e8d4;
  color: #141413;
}
```

**日落条纹带简化版（sunset-stripe）**
```css
.sunset-stripe {
  height: 8rpx;
  background: linear-gradient(to right, #cc785c, #e8a868, #f0d8a0, #faf5eb);
}
```

### 3.4 页面布局模板

**工具详情页（编辑式布局）**
```
┌─────────────────────────────┐
│  暖奶油背景 #faf9f5          │
│                             │
│  ┌─────────────────────────┐ │
│  │ Georgia 标题（大）       │ │ ← 编辑式 hero
│  │ 副标题正文               │ │
│  │ [珊瑚色 CTA] [次要按钮]  │ │
│  └─────────────────────────┘ │
│                             │
│  ┌─────────┐ ┌─────────────┐ │
│  │ 奶油面板 │ │  代码块     │ │ ← 左右分栏
│  │ 功能说明 │ │  深色背景   │ │
│  └─────────┘ └─────────────┘ │
│                             │
│  ═══════════════════════════ │ ← 渐变条纹
└─────────────────────────────┘
```

**学习页面 Tab 切换**
```
┌─────────────────────────────┐
│  [网络] [数据结构] [算法]    │ ← 分段式 tab
│  ═══════                    │
│                             │
│  ┌─────────────────────────┐ │
│  │ 奶油卡片内容区域         │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* Mistral 编辑式 hero 区域 */
.hero-section {
  padding: 64rpx 32rpx;
  text-align: center;
}

.hero-title {
  font-family: Georgia, serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -3rpx;
  color: #141413;
}

.hero-subtitle {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.6;
  color: #6c6a64;
  margin-top: 20rpx;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 36rpx;
}

/* 奶油面板 */
.cream-panel {
  background-color: #faf5eb;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 1rpx solid #d8ccba;
}

/* 日落条纹（页面底部签名） */
.sunset-stripe {
  height: 8rpx;
  margin-top: 64rpx;
  background: linear-gradient(
    to right,
    #cc785c 0%,
    #e8a868 33%,
    #f0d8a0 66%,
    #faf5eb 100%
  );
  border-radius: 4rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具详情页**：编辑式 hero + 奶油面板 + 代码块的布局模式
- **学习内容页面**：分段式 tab 切换不同学科/章节
- **设置/配置页面**：奶油面板作为表单容器，温暖且易读
- **关于/帮助页面**：编辑式排版适合长文本内容
- **TCP 动画机详情**：代码块深色表面 + 编辑式排版

### 4.2 不适合用在哪些页面
- **首页工具网格**：编辑式布局不适合密集卡片网格
- **数据结构可视化页面**：已有独立设计，日落风格会冲突
- **排行榜页面**：需要紧凑布局，编辑式间距过大

### 4.3 混搭建议
- **与暖奶油画布混搭**：奶油面板 #faf5eb 与暖奶油 #faf9f5 几乎同色温，可无缝混用
- **与 Miro 便签色板混搭**：Miro 的彩色卡片 + Mistral 的奶油面板 = 既有活力又有温度
- **与 Claude Design 混搭**：Georgia 衬线 + 暖奶油画布 + 珊瑚色 CTA = 完美匹配
- **日落条纹带**：可作为页面底部的品牌签名元素，但不要过度使用

---

## 5. 实施检查清单

- [ ] 将饱和橙色 #fa520f 替换为珊瑚色 #cc785c
- [ ] 按钮圆角使用 16rpx（非药丸形），卡片使用 24rpx
- [ ] 奶油面板背景使用 #faf5eb 而非 #fff8e0（微调为更暖的色调）
- [ ] 标题使用 Georgia 衬线，正文使用系统无衬线
- [ ] 分段式 tab 的 active 底部边框使用珊瑚色
- [ ] 代码块背景使用 #181715（深海军蓝），文字使用 #faf9f5
- [ ] 日落条纹带高度控制在 8-12rpx，作为装饰元素
- [ ] 奶油面板边框使用 #d8ccba
- [ ] 所有尺寸使用 rpx 单位
- [ ] 确认编辑式排版在小屏上的可读性
- [ ] 奶油面板与暖奶油画布的色温一致性检查
- [ ] 代码块字体使用 monospace 系统默认

---

## 6. 参考文件

- 源文件：.claude/skills/mistral.ai-design.md
- 项目设计风格：PROJECT_HANDOFF.md §25（Claude Design 暖奶油画布）
- 色彩规范：暖奶油 #faf9f5、奶油卡片 #efe9de、珊瑚色 #cc785c、暖墨 #141413
- 字体规范：Georgia 衬线标题、系统无衬线正文
- 单位规范：rpx（非 px）
