# Vodafone 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/vodafone-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Vodafone 的设计语言是电信超级品牌的广告牌美学：巨大的大写标题覆盖在编辑级人像摄影上，单一猩红色 CTA pill 贯穿全页，深色 hero 与白色内容区交替形成节奏。整个页面读起来像一张活动海报而非企业网站——视觉冲击力优先于信息密度。

核心原则：
- **Weight 800 + 大写 = hero 声音**：品牌的核心识别来自超重粗体大写标题
- **单一红色 CTA**：`#e60000` Vodafone Red 是唯一的品牌强调色
- **Pill 几何**：所有交互元素使用 60px pill 圆角
- **表面对比 = 深度提示**：不使用阴影，靠深色/浅色 band 交替表达层次
- **编辑摄影**：真实人像、城市、线缆是唯一的装饰系统

### 1.2 视觉 DNA

- 巨型大写 display weight 800（144px hero 级别）
- 单一猩红色品牌色 + 近黑 ink + 灰度中性色
- 60px pill CTA 按钮，从不使用方角
- 深色 hero → 白色内容 → 深色 footer 的双 band 节奏
- 无阴影，无渐变，靠表面色彩对比表达深度
- 引号标志 orb（speechmark logo）作为品牌锚点

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|------|------|------|
| 品牌红 CTA | `#e60000` | Vodafone Red，所有转化目标 |
| 近黑 ink | `#25282b` | 深色 hero、nav、footer 背景 |
| 画布 | `#ffffff` | 白色内容背景 |
| 画布柔和 | `#f2f2f2` | badge-chip 背景 |
| 文字墨色 | `#25282b` | 浅色表面上的文字 |
| 次要文字 | `#7e7e7e` | 副标题、说明文字 |
| 最次要 | `#bebebe` | 占位符、细则 |
| 深色文字 | `#ffffff` | 深色表面上的文字 |

### 1.4 字体策略

单一自定义无衬线体贯穿全系统（权重 300 / 400 / 600 / 700 / 800）：
- Hero 级别：weight 800 + 大写 + `-1px` 字距
- 次级 display：weight 300（40-48px），形成"喊话后平静叙述"的对比
- Body：weight 400，中性字距
- 按钮：weight 400，18px

### 1.5 布局与组件模式

- 基础单位 4px，间距 token 到 32px
- Hero band 全幅摄影 + 巨型标题叠加
- 2-up story 卡片网格，移动端 1-up
- Pill 几何贯穿：badge 32px、CTA 60px、icon 9999px
- 深色/浅色 band 交替，无中间灰色

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|------|------|
| 双 band 节奏 | 深色/浅色交替的页面节奏适合小程序页面切换 |
| Pill CTA 按钮 | 60px pill 形状可用 `border-radius: 100rpx` 模拟 |
| Badge-chip 标签 | 32px pill 标签适合分类/状态标签 |
| 单色强调系统 | 只用一个品牌色的思路与项目单色 CTA 一致 |
| 表面对比深度 | 不用阴影、靠色块对比的方案在小程序中性能最优 |
| 编辑式排版 | 大标题 + 简洁内容的节奏适合首页展示 |

### 2.2 需要改造的设计决策

| 决策 | 原方案 | 改造方向 |
|------|--------|----------|
| 品牌色 | Vodafone Red `#e60000` | 改为珊瑚色 `#cc785c` |
| Hero 标题 | weight 800 大写 144px | 改为 Georgia 衬线 400 weight，适度尺寸 |
| 字体 | Vodafone 专有字体 | 改为 Georgia 标题 + 系统无衬线 |
| 深色表面 | `#25282b` 近黑 | 改为 `#181715` 暖深色 |
| Hero 摄影 | 编辑级人像摄影 | 改为图标/插画（小程序无摄影资源） |
| 间距 | 最大 32px | 适配 rpx 系统 |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|------|------|
| 144px 巨型标题 | 小程序屏幕宽度 750rpx，144px 标题会溢出 |
| 编辑级人像摄影 | 项目无摄影资源，且小程序包体限制 |
| Vodafone 专有字体 | 专有字体不可用于小程序 |
| 引号标志 orb | 品牌特定元素，不适用于学习工具 |
| Weight 800 大写标题 | Georgia 衬线不适合大写粗体风格 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Vodafone 原色 | 刷个冯题映射 | 色值 | 用途 |
|---------------|-------------|------|------|
| `#e60000`（品牌红） | 珊瑚主色 | `#cc785c` | CTA 按钮、强调元素 |
| `#25282b`（ink 深色） | 暖深色 | `#181715` | 深色 band 背景 |
| `#ffffff`（画布） | 暖奶油画布 | `#faf9f5` | 页面背景 |
| `#f2f2f2`（画布柔和） | 奶油卡片 | `#efe9de` | 卡片、badge 背景 |
| `#25282b`（文字墨色） | 暖墨文字 | `#141413` | 浅色表面上的文字 |
| `#7e7e7e`（次要文字） | 暖灰 | `#6c6a64` | 次要文字 |
| `#bebebe`（最次要） | 浅暖灰 | `#8e8b82` | 占位符 |
| `#ffffff`（深色文字） | 暖奶油 | `#faf9f5` | 深色表面上的文字 |

### 3.2 字体映射（用 rpx）

| Vodafone 层级 | 原参数 | 刷个冯题映射 | rpx 参数 |
|---------------|--------|-------------|----------|
| display-hero | 144px/800/大写 | 不采用（太大） | — |
| display-xl | 90px/800 | Georgia 衬线 | `font-size: 56rpx; font-weight: 400; letter-spacing: -2rpx;` |
| display-lg | 48px/300 | Georgia 衬线 | `font-size: 48rpx; font-weight: 400; line-height: 56rpx;` |
| display-md | 40px/300 | Georgia 衬线 | `font-size: 40rpx; font-weight: 400; line-height: 48rpx;` |
| display-sm | 32px/700 | 系统无衬线 | `font-size: 32rpx; font-weight: 600; line-height: 40rpx;` |
| body-lg | 22px/400 | 系统无衬线 | `font-size: 30rpx; font-weight: 400; line-height: 44rpx;` |
| body-md | 18px/400 | 系统无衬线 | `font-size: 28rpx; font-weight: 400; line-height: 40rpx;` |
| body-sm | 16px/400 | 系统无衬线 | `font-size: 26rpx; font-weight: 400; line-height: 36rpx;` |
| caption | 14px/400 | 系统无衬线 | `font-size: 24rpx; font-weight: 400; line-height: 32rpx;` |
| caption-uppercase | 12px/600/+0.57px | 系统无衬线 | `font-size: 22rpx; font-weight: 600; letter-spacing: 2rpx; text-transform: uppercase;` |
| button-md | 18px/400 | 系统无衬线 | `font-size: 28rpx; font-weight: 400;` |

### 3.3 组件设计规范

**按钮（Button）**

```
button-primary（红色 pill）:
  background: #cc785c
  color: #faf9f5
  font-size: 28rpx
  font-weight: 400
  border-radius: 100rpx
  padding: 16rpx 40rpx
  border: 1rpx solid #cc785c

button-outline-red:
  background: #faf9f5
  color: #cc785c
  border: 1rpx solid #cc785c
  border-radius: 100rpx
  padding: 16rpx 40rpx

button-outline-dark:
  background: #faf9f5
  color: #141413
  border: 1rpx solid #141413
  border-radius: 100rpx
  padding: 16rpx 40rpx
```

**卡片（Card）**

```
card-content:
  background: #faf9f5
  color: #141413
  border-radius: 12rpx
  padding: 32rpx
  无阴影，靠表面对比

card-hero:
  background: #faf9f5
  color: #141413
  border-radius: 12rpx
  padding: 32rpx
  headline: 32rpx / 600 weight
```

**标签（Badge-chip）**

```
badge-chip:
  background: #efe9de
  color: #141413
  font-size: 24rpx
  font-weight: 700
  border-radius: 64rpx
  padding: 8rpx 24rpx
```

### 3.4 页面布局模板

**深色 hero band（借鉴 Vodafone 的 hero-band-dark）**

```
hero-dark-band:
  background: #181715
  color: #faf9f5
  padding: 64rpx 32rpx
  content:
    eyebrow: 大写标签（22rpx / 600 / uppercase）
    headline: Georgia 56rpx / 400 weight
    body: 系统无衬线 28rpx
    cta: button-primary (pill)
```

**白色内容 band（借鉴 Vodafone 的 content-band-light）**

```
content-light-band:
  background: #faf9f5
  color: #141413
  padding: 64rpx 32rpx
  content:
    headline: Georgia 40rpx / 400 weight
    story-grid: 2-up 卡片
```

**Story 卡片布局**

```
story-card:
  background: #faf9f5
  border-radius: 12rpx
  padding: 32rpx
  content:
    thumbnail: 16:9 圆角图
    category: badge-chip
    headline: 32rpx / 600
    caption: 26rpx / 400 / #6c6a64
```

### 3.5 WXSS 实现示例

```css
/* Vodafone 风格深色 hero band */
.hero-dark-band {
  background: #181715;
  color: #faf9f5;
  padding: 64rpx 32rpx;
}

.hero-dark-band .headline {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56rpx;
  font-weight: 400;
  letter-spacing: -2rpx;
  line-height: 64rpx;
  color: #faf9f5;
}

/* Vodafone 风格大写 eyebrow */
.eyebrow-uppercase {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-transform: uppercase;
  color: #6c6a64;
}

/* Vodafone 风格 pill CTA */
.cta-pill {
  background: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 400;
  border-radius: 100rpx;
  padding: 16rpx 40rpx;
  border: 1rpx solid #cc785c;
}

/* Vodafone 风格 outline pill */
.outline-pill {
  background: transparent;
  color: #cc785c;
  font-size: 28rpx;
  font-weight: 400;
  border-radius: 100rpx;
  padding: 16rpx 40rpx;
  border: 1rpx solid #cc785c;
}

/* Vodafone 风格 badge-chip */
.badge-chip {
  background: #efe9de;
  color: #141413;
  font-size: 24rpx;
  font-weight: 700;
  border-radius: 64rpx;
  padding: 8rpx 24rpx;
}

/* Vodafone 风格深色分割线 */
.divider-on-dark {
  height: 1rpx;
  background: rgba(250, 249, 245, 0.25);
}

/* Vodafone 风格白色内容 band */
.content-light-band {
  background: #faf9f5;
  color: #141413;
  padding: 64rpx 32rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面 | 适用理由 |
|------|----------|
| 首页 hero | 深色 band + 大标题的冲击力适合工具箱入口展示 |
| 工具分类页 | badge-chip 标签 + story-card 布局适合分类展示 |
| 学习驾驶舱 | 深色/浅色 band 交替适合数据仪表盘的节奏 |
| 模块介绍页 | 编辑式排版适合工具功能说明 |

### 4.2 不适合用在哪些页面

| 页面 | 不适用理由 |
|------|-----------|
| 刷题页面 | 刷题需要沉浸感，深色 hero 会分散注意力 |
| 导入预览 | 信息密集型页面不适合大标题排版 |
| 答题记录 | 列表型页面不需要 hero 级别的视觉冲击 |

### 4.3 混搭建议

- **Vodafone 的 pill CTA + 暖奶油色板**：pill 形状保留，色值改为暖调
- **Vodafone 的深色 band + 暖深色**：`#181715` 替代 `#25282b`，保持暖调
- **Vodafone 的 badge-chip + 奶油背景**：分类标签用奶油色 pill
- **Vodafone 的无阴影方案**：在需要极致性能的页面，用表面对比替代阴影

---

## 5. 实施检查清单

- [ ] 确认品牌色已映射为 `#cc785c`（非 Vodafone Red）
- [ ] 确认深色 band 使用 `#181715`（暖深色）
- [ ] 确认标题使用 Georgia 衬线（非大写粗体无衬线）
- [ ] 确认 pill 按钮用 `border-radius: 100rpx` 实现
- [ ] 确认所有尺寸使用 rpx
- [ ] 确认无阴影设计（靠表面对比）
- [ ] 确认 badge-chip 使用奶油色背景
- [ ] 确认 hero 标题尺寸适配 750rpx 屏幕宽度
- [ ] 确认大写标签仅用于小号 eyebrow，不用于大标题

---

## 6. 参考文件

- 原方案：`.claude/skills/vodafone-design.md`
- 项目设计规范：`design-methods/design-spec.md`
- 项目交接文档：`PROJECT_HANDOFF.md`
