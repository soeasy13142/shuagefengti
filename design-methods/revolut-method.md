# Revolut 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/revolut-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Revolut 的设计语言是"金融科技遇上产品手册"——黑色叙事画布与白色目录画布交替出现，形成杂志版式的视觉节奏。核心理念是**双模式画布系统**：近黑画布用于故事叙述（hero 区域、产品展示），白色画布用于浏览和比较（FAQ、下载、对比表）。两种模式在全宽 band 之间硬切换，没有柔和过渡。

### 1.2 视觉 DNA
- 高对比度双模式：纯黑 `#000000` vs 纯白 `#ffffff`
- 钴紫品牌色 `#494fdf` 极度克制使用，仅用于精选卡片和品牌标识
- 白色药丸按钮在黑色画布上作为最亮像素成为主 CTA
- 八种饱和辅助色仅存在于产品插图中，从不作为按钮表面
- 零阴影，靠色块对比表达深度

### 1.3 色彩策略
- **品牌主色**：钴紫 `#494fdf`，极度克制，仅用于 featured plan card 和品牌标识
- **主 CTA 实际是白色药丸**：白底黑字在黑画布上
- **画布**：纯黑 `#000000`（叙事）vs 纯白 `#ffffff`（目录）
- **文字层级**：Ink `#191c1f` → Body `#1f2226` → Charcoal `#3a3d40` → Mute `#505a63` → Stone `#8d969e`
- **辅助色**：teal `#00a87e`、light-blue `#007bc2`、pink `#e61e49`、light-green `#428619`、warning `#ec7e00` 等

### 1.4 字体策略
- **标题**：Aeonik Pro（专有字体），weight 500，display 系列 80-136px，line-height 1.0，大尺寸负字间距
- **正文/UI**：Inter（开源），weight 400/600，正字间距 0.24px
- **原则**：标题永远 500 weight + line-height 1.0；正文永远 400 或 600，不用 500

### 1.5 布局与组件模式
- 药丸按钮（`rounded.full` = 9999px）适用于所有按钮
- 内容卡片 `rounded.lg`（20px），输入框 `rounded.md`（12px）
- 段落间距 88-120px（section/band 级别）
- 卡片内部 padding 32px

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
| 设计决策 | 原始参数 | 刷个冯题适配 |
|---|---|---|
| 药丸按钮形状 | `rounded.full` 9999px | 可直接用于 CTA 按钮，符合小程序触摸标准 |
| 卡片圆角 20px | `rounded.lg` | 接近当前 24rpx，可微调 |
| 文字层级：warm ink | `#191c1f` 比纯黑柔和 | 与当前暖墨 `#141413` 理念一致 |
| 零阴影原则 | 无 box-shadow | 与当前暖奶油画布风格完全兼容 |
| 段间距节奏 | 88-120px | 可换算为 176-240rpx，适合小程序页面 |
| 辅助色仅用于图标/插图 | 不作为按钮表面 | 与当前珊瑚色 CTA 策略不冲突 |

### 2.2 需要改造的设计决策
| 设计决策 | 原始参数 | 改造方案 |
|---|---|---|
| 双模式画布（黑/白） | 纯黑 `#000000` + 纯白 `#ffffff` | 改为暖奶油 `#faf9f5` + 深海军蓝 `#181715` 双模式，保留切换节奏但色调更暖 |
| 钴紫品牌色 | `#494fdf` | 改为珊瑚色 `#cc785c` 作为"精选标记"色，克制使用 |
| 白色药丸 CTA | 白底黑字 | 在深色 band 上改为奶油底暖墨字，在浅色 band 上改为珊瑚色底白字 |
| 大尺寸 display 字体 | 80-136px Aeonik Pro | 缩小到 56-80rpx Georgia 衬线，保留 line-height 1.0 和负字间距 |
| Inter 正文正字间距 | 0.24px | 去掉正字间距，小程序默认即可 |

### 2.3 不可迁移的设计决策
| 设计决策 | 原因 |
|---|---|
| Aeonik Pro 字体 | 专有字体，微信小程序无法使用；替代方案 Georgia 衬线已用于当前项目 |
| 136px hero 标题 | 微信小程序屏幕宽度仅 750rpx，136px（272rpx）过大 |
| 全宽 product mockup band | 小程序无全宽 viewport 概念，卡片需有边距 |
| 八色辅助调色板用于产品插图 | 项目无产品插图，辅助色需重新定义用途 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Revolut 原色 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#000000` canvas-dark | `#181715` 深海军蓝 | 深色 band 背景、暗色卡片 |
| `#ffffff` canvas-light | `#faf9f5` 暖奶油 | 画布背景 |
| `#f4f4f4` surface-soft | `#efe9de` 奶油卡片 | 浅色卡片、软按钮 |
| `#494fdf` primary | `#cc785c` 珊瑚色 | 精选标记、品牌强调（克制使用） |
| `#191c1f` ink | `#141413` 暖墨 | 主文字 |
| `#505a63` mute | `#6c6a64` 次要文字 | 辅助文字、元数据 |
| `#ffffff` on-dark | `#faf9f5` | 深色表面文字 |
| `#e2e2e7` hairline-light | `#d6d0c4` | 浅色分割线 |
| `rgba(255,255,255,0.12)` hairline-dark | `rgba(250,249,245,0.12)` | 深色分割线 |

### 3.2 字体映射（用 rpx）

| Revolut token | 刷个冯题实现 |
|---|---|
| `display-xl` 80px/500/1.0/-0.8px | Georgia 80rpx / 400 / line-height 1.0 / letter-spacing -2rpx |
| `display-lg` 48px/500/1.21/-0.48px | Georgia 64rpx / 400 / line-height 1.2 / letter-spacing -1rpx |
| `heading-lg` 32px/500/1.19/-0.32px | Georgia 44rpx / 400 / line-height 1.2 / letter-spacing -1rpx |
| `heading-md` 24px/500/1.33/0 | Georgia 36rpx / 400 / line-height 1.33 |
| `body-md` 16px/400/1.5/0.24px | 系统字体 28rpx / 400 / line-height 1.5 |
| `body-sm` 14px/400/1.43 | 系统字体 26rpx / 400 / line-height 1.43 |
| `button-md` 16px/600/1.5/0.24px | 系统字体 28rpx / 600 / line-height 1.5 |
| `caption` 13px/400/1.4 | 系统字体 24rpx / 400 / line-height 1.4 |

### 3.3 组件设计规范

**药丸 CTA 按钮**
```css
.btn-pill-cta {
  background-color: #cc785c;  /* 珊瑚色 */
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 20rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
  height: 80rpx;
  line-height: 80rpx;
}
.btn-pill-cta:active {
  background-color: #a9583e;
}
```

**药丸 CTA（深色 band 上）**
```css
.btn-pill-cta-on-dark {
  background-color: #faf9f5;
  color: #141413;
  border-radius: 9999rpx;
  padding: 20rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  height: 80rpx;
  line-height: 80rpx;
}
```

**Feature 卡片（浅色）**
```css
.card-feature-light {
  background-color: #efe9de;
  color: #141413;
  border-radius: 40rpx;  /* rounded.lg 约 20px → 40rpx */
  padding: 48rpx;
  border: 1rpx solid #d6d0c4;
}
```

**Feature 卡片（深色）**
```css
.card-feature-dark {
  background-color: #1e1d1a;  /* surface-elevated */
  color: #faf9f5;
  border-radius: 40rpx;
  padding: 48rpx;
}
```

**精选卡片（品牌色）**
```css
.card-featured {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 40rpx;
  padding: 48rpx;
}
```

**Badge 标签**
```css
.badge-tag {
  background-color: #efe9de;
  color: #141413;
  font-size: 24rpx;
  border-radius: 9999rpx;
  padding: 6rpx 20rpx;
}
```

### 3.4 页面布局模板

**双模式 Band 切换模板**
```
┌─────────────────────────────┐
│  深色 band（#181715）        │  ← 叙述区：标题 + 说明 + CTA
│  Georgia 64rpx 白字          │
│  药丸按钮（奶油底黑字）       │
├─────────────────────────────┤
│  浅色 band（#faf9f5）        │  ← 浏览区：卡片网格 + 列表
│  奶油卡片 40rpx 圆角          │
│  药丸按钮（珊瑚底白字）       │
├─────────────────────────────┤
│  深色 band（#181715）        │  ← 下一个叙述区
│  ...                         │
└─────────────────────────────┘
```

**卡片网格布局**
- 首页功能卡片：2 列网格，间距 24rpx
- 学习工具列表：单列卡片，间距 16rpx
- 统计数据展示：3 列网格

### 3.5 WXSS 实现示例

**双模式 band 切换**
```css
.band-dark {
  background-color: #181715;
  padding: 96rpx 48rpx;
}
.band-dark .band-title {
  font-family: Georgia, serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -2rpx;
  color: #faf9f5;
}
.band-light {
  background-color: #faf9f5;
  padding: 96rpx 48rpx;
}
.band-light .band-title {
  font-family: Georgia, serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -2rpx;
  color: #141413;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页 hero 区域**：深色 band + 大标题 + 药丸 CTA，形成强烈视觉冲击
- **学习工具卡片展示**：浅色 band 上的 feature card 网格
- **数据统计页面**：深色 band 上的数字展示（如学习进度、题库统计）
- **设置/个人中心**：深浅 band 交替的信息架构

### 4.2 不适合用在哪些页面
- **纯内容阅读页**（如题目详情）：双模式切换会分散注意力
- **表单密集页面**：深色背景上的表单可读性差
- **微信小程序 tabbar 页面**：底部 tabbar 与深色 band 视觉冲突

### 4.3 混搭建议
- **与暖奶油画布混搭**：首页 hero 用深色 band，其余区域保持暖奶油画布，仅在关键节点使用深色 band 作为视觉锚点
- **珊瑚色克制使用**：参照 Revolut 对钴紫的克制，珊瑚色仅用于精选/推荐标记和主 CTA，不超过每屏 1 个
- **药丸按钮全面采用**：所有 CTA 按钮统一使用药丸形状，与暖奶油画布风格兼容

---

## 5. 实施检查清单

- [ ] 深色 band 使用 `#181715`，不是纯黑 `#000000`
- [ ] 浅色 band 使用 `#faf9f5`，不是纯白 `#ffffff`
- [ ] 药丸按钮圆角 9999rpx，不用中间值
- [ ] 卡片圆角 40rpx（对应原 20px）
- [ ] 标题字体 Georgia，weight 400，line-height 1.0-1.2
- [ ] 正文字体系统默认，weight 400/600
- [ ] 珊瑚色 `#cc785c` 每屏最多 1 个元素使用
- [ ] 辅助色仅用于图标/徽章，不用于按钮表面
- [ ] 段间距 96-240rpx（对应原 48-120px）
- [ ] 卡片内部 padding 48rpx（对应原 32px）
- [ ] 所有触摸目标最小 80rpx 高度
- [ ] 零阴影，深度通过色块对比表达
- [ ] 分割线使用 1rpx，颜色 `#d6d0c4`（浅）或 `rgba(250,249,245,0.12)`（深）

---

## 6. 参考文件

- 源文件：`.claude/skills/revolut-design.md`
- 项目设计风格：`CLAUDE.md` § 设计风格约束
- 项目交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
