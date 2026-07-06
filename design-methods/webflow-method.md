# Webflow 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/webflow-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Webflow 的设计语言是视觉化网页开发平台的专业自信：白色画布上以近黑 `#080808` 为主色 CTA，配合五色类别调色板（紫/粉/蓝/橙/绿）映射产品分类，排版克制在 500/600 weight 从不越界。整个系统读起来像一个精心打磨的专业工具——自信、有序、不喧哗。

核心原则：
- **近黑即转化**：`#080808` 是所有主 CTA 和标题的颜色
- **五色类别系统**：紫/粉/蓝/橙/绿五色映射产品分类，用作全填充卡片
- **Weight 天花板 600**：从不使用 700+，自信而非喊叫
- **Tight 按钮圆角**：4px 圆角，不使用 pill
- **多层阴影**：5 层微偏移阴影是品牌特色的提升系统

### 1.2 视觉 DNA

- 白色画布 `#ffffff` + 近黑 `#080808` 双色主调
- 五色类别调色板作为全填充卡片（非按钮色）
- 80px hero display weight 600 + `-0.8px` 负字距
- 15px 大写 eyebrow 标签 + `1.5px` 正字距
- 4px 按钮圆角，8px 卡片圆角
- 5 层堆叠阴影用于 featured 卡片
- 单一字体家族贯穿全系统

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|------|------|------|
| 主色 CTA | `#080808` | 近黑，所有转化目标 |
| 画布 | `#ffffff` | 页面背景 |
| Hairline | `#d8d8d8` | 边框、分割线 |
| 文字 ink | `#080808` | 默认文字 |
| ink 强调 | `#222222` | 近黑强调 |
| Body | `#363636` | 默认正文 |
| Body 中等 | `#5a5a5a` | 次要文字 |
| Mute | `#898989` | 低优先级文字 |
| Mute 柔和 | `#ababab` | 占位符 |
| 紫色 | `#7a3dff` | 类别：设计/构建 |
| 粉色 | `#ed52cb` | 类别：动画/交互 |
| 蓝色 | `#3b89ff` | 类别：SEO/分析 |
| 橙色 | `#ff6b00` | 类别：托管/基础设施 |
| 绿色 | `#00d722` | 类别：电商/成功 |
| 黄色 | `#ffae13` | 警告 |
| 红色 | `#ee1d36` | 错误 |

### 1.4 字体策略

单一专有字体家族（WF Visual Sans Variable）贯穿全系统：
- 权重 400 / 500 / 550 / 600，从不使用 700+
- Hero 80px weight 600 + `-0.8px` 负字距
- 15px 大写 eyebrow + `1.5px` 正字距是品牌签名标签风格
- 等宽变体 WFVisualSans-Mono 用于技术 caption

### 1.5 布局与组件模式

- 基础单位 4px，间距 token 到 32px
- 卡片内边距 32px，section 间距 32px + 慷慨垂直间距
- 2/3-up 类别卡片网格，部分大卡片跨 2 列
- 3-up 定价卡片网格
- 多层阴影（5 层微偏移）用于 featured 卡片

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|------|------|
| 五色类别系统 | 紫/粉/蓝/橙/绿五色可映射到工具分类 |
| 大写 eyebrow 标签 | 15px/500/+1.5px 的标签风格适合 section 标题 |
| 多层阴影方案 | 5 层堆叠阴影在 WXSS 中可实现 |
| Tight 按钮圆角 | 4-8px 圆角适合功能型按钮 |
| 单一字体家族 | 简化字体管理 |
| Weight 天花板 600 | 克制的排版策略 |

### 2.2 需要改造的设计决策

| 决策 | 原方案 | 改造方向 |
|------|--------|----------|
| 色彩系统 | 冷灰白调 | 改为暖奶油调 |
| 主色 CTA | 近黑 `#080808` | 改为珊瑚色 `#cc785c` |
| 字体 | WF Visual Sans Variable | 改为 Georgia 标题 + 系统无衬线 |
| 按钮圆角 | 4px tight | CTA 用 100rpx pill（项目规范） |
| 五色类别 | 全填充卡片 | 改为奶油底 + 彩色点缀（暖调适配） |
| 阴影色温 | 冷灰阴影 | 改为暖色阴影 |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|------|------|
| WF Visual Sans Variable | 专有字体不可嵌入小程序 |
| 80px hero display | 小程序屏幕 750rpx 宽度限制 |
| 3-up 定价网格 | 小程序屏幕宽度不适合 3 列 |
| 全填充彩色卡片 | 暖奶油风格下纯色填充过于强烈 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Webflow 原色 | 刷个冯题映射 | 色值 | 用途 |
|--------------|-------------|------|------|
| `#080808`（近黑 CTA） | 珊瑚主色 | `#cc785c` | CTA 按钮、强调元素 |
| `#ffffff`（画布） | 暖奶油画布 | `#faf9f5` | 页面背景 |
| `#d8d8d8`（hairline） | 暖奶油分割线 | `#e6dfd8` | 边框、分割线 |
| `#080808`（文字 ink） | 暖墨文字 | `#141413` | 主文字 |
| `#363636`（body） | 暖灰正文 | `#6c6a64` | 正文 |
| `#5a5a5a`（body mid） | 中暖灰 | `#8e8b82` | 次要文字 |
| `#898989`（mute） | 浅暖灰 | `#a09d96` | 低优先级文字 |
| `#7a3dff`（紫色类别） | 深紫点缀 | `#7a3dff` | 工具分类标识 |
| `#ed52cb`（粉色类别） | 深粉点缀 | `#ed52cb` | 工具分类标识 |
| `#3b89ff`（蓝色类别） | 深蓝点缀 | `#3b89ff` | 工具分类标识 |
| `#ff6b00`（橙色类别） | 深橙点缀 | `#ff6b00` | 工具分类标识 |
| `#00d722`（绿色类别） | 深绿点缀 | `#00d722` | 工具分类标识 |

### 3.2 字体映射（用 rpx）

| Webflow 层级 | 原参数 | 刷个冯题映射 | rpx 参数 |
|--------------|--------|-------------|----------|
| display-xxl | 80px/600/-0.8px | Georgia 衬线 | `font-size: 64rpx; font-weight: 400; letter-spacing: -3rpx;` |
| display-xl | 56px/600 | Georgia 衬线 | `font-size: 56rpx; font-weight: 400; letter-spacing: -2rpx;` |
| display-lg | 44.8px/600 | Georgia 衬线 | `font-size: 48rpx; font-weight: 400; line-height: 56rpx;` |
| display-md | 32px/500 | 系统无衬线 | `font-size: 32rpx; font-weight: 500; line-height: 40rpx;` |
| display-sm | 24px/500 | 系统无衬线 | `font-size: 28rpx; font-weight: 500; line-height: 36rpx;` |
| display-xs | 20px/500 | 系统无衬线 | `font-size: 28rpx; font-weight: 500; line-height: 36rpx;` |
| eyebrow-uppercase | 15px/500/+1.5px | 系统无衬线 | `font-size: 24rpx; font-weight: 500; letter-spacing: 3rpx; text-transform: uppercase;` |
| body-lg | 28.8px/400 | 系统无衬线 | `font-size: 32rpx; font-weight: 400; line-height: 48rpx;` |
| body-md | 16px/400/-0.16px | 系统无衬线 | `font-size: 28rpx; font-weight: 400; line-height: 40rpx;` |
| body-sm | 14px/400 | 系统无衬线 | `font-size: 24rpx; font-weight: 400; line-height: 34rpx;` |
| caption | 12.8px/550 | 系统无衬线 | `font-size: 22rpx; font-weight: 550; line-height: 28rpx;` |
| button-md | 16px/500/-0.16px | 系统无衬线 | `font-size: 28rpx; font-weight: 500;` |

### 3.3 组件设计规范

**按钮（Button）**

```
button-primary:
  background: #cc785c
  color: #faf9f5
  font-size: 28rpx
  font-weight: 500
  border-radius: 100rpx (CTA级) / 8rpx (功能级)
  padding: 16rpx 32rpx

button-secondary:
  background: #faf9f5
  color: #141413
  border: 1rpx solid #e6dfd8
  font-size: 28rpx
  font-weight: 500
  border-radius: 100rpx / 8rpx
  padding: 16rpx 32rpx

button-text-arrow:
  background: transparent
  color: #141413
  font-size: 28rpx
  font-weight: 500
  padding: 24rpx 0
  text-decoration: underline
```

**卡片（Card）**

```
card-feature:
  background: #faf9f5
  color: #141413
  border: 1rpx solid #e6dfd8
  border-radius: 16rpx
  padding: 48rpx

card-feature-shadow（featured）:
  同上 + 5层堆叠阴影
```

**类别卡片（Category Card）— 点缀式**

```
category-card:
  background: #efe9de
  color: #141413
  border-radius: 16rpx
  padding: 48rpx
  accent: 左侧 4rpx 彩色边框 或 顶部彩色条纹

category-card-purple: accent #7a3dff
category-card-blue: accent #3b89ff
category-card-orange: accent #ff6b00
category-card-green: accent #00d722
category-card-pink: accent #ed52cb
```

**Badge**

```
badge-info:
  background: #3b89ff
  color: #faf9f5
  font-size: 22rpx
  font-weight: 550
  border-radius: 8rpx
  padding: 8rpx 16rpx

badge-info-soft:
  background: #faf9f5
  color: #3b89ff
  border: 1rpx solid #3b89ff
  border-radius: 8rpx
  padding: 8rpx 16rpx
```

### 3.4 页面布局模板

**工具分类网格（借鉴 Webflow 的 category-card grid）**

```
category-grid:
  padding: 48rpx 32rpx
  grid: 2-up
  gap: 24rpx
  card: category-card 样式
  每个工具有独立的类别色标识
```

**Feature section（借鉴 Webflow 的 content-band）**

```
feature-section:
  background: #faf9f5
  padding: 48rpx 32rpx
  content:
    eyebrow: 大写标签 (24rpx / 500 / +3rpx tracking)
    headline: Georgia 48rpx / 400
    body: 系统无衬线 32rpx / 400
    cta: button-primary + button-secondary
```

**Featured 卡片（带多层阴影）**

```
featured-card:
  background: #faf9f5
  border-radius: 16rpx
  padding: 48rpx
  box-shadow:
    0 168rpx 48rpx rgba(0,0,0,0),
    0 108rpx 44rpx rgba(0,0,0,0.01),
    0 60rpx 36rpx rgba(0,0,0,0.04),
    0 26rpx 26rpx rgba(0,0,0,0.08),
    0 6rpx 14rpx rgba(0,0,0,0.09);
```

### 3.5 WXSS 实现示例

```css
/* Webflow 风格 eyebrow 标签 */
.eyebrow-uppercase {
  font-size: 24rpx;
  font-weight: 500;
  letter-spacing: 3rpx;
  text-transform: uppercase;
  color: #6c6a64;
}

/* Webflow 风格 5 层堆叠阴影 */
.card-shadow-featured {
  box-shadow:
    0 168rpx 48rpx rgba(0, 0, 0, 0),
    0 108rpx 44rpx rgba(0, 0, 0, 0.01),
    0 60rpx 36rpx rgba(0, 0, 0, 0.04),
    0 26rpx 26rpx rgba(0, 0, 0, 0.08),
    0 6rpx 14rpx rgba(0, 0, 0, 0.09);
}

/* Webflow 风格类别卡片（点缀式） */
.category-card {
  background: #efe9de;
  color: #141413;
  border-radius: 16rpx;
  padding: 48rpx;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6rpx;
}

.category-card-purple::before { background: #7a3dff; }
.category-card-blue::before { background: #3b89ff; }
.category-card-orange::before { background: #ff6b00; }
.category-card-green::before { background: #00d722; }
.category-card-pink::before { background: #ed52cb; }

/* Webflow 风格 tight 按钮（功能级） */
.button-tight {
  background: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 8rpx;
  padding: 16rpx 32rpx;
  border: none;
}

/* Webflow 风格 text-arrow 按钮 */
.button-text-arrow {
  background: transparent;
  color: #141413;
  font-size: 28rpx;
  font-weight: 500;
  text-decoration: underline;
  padding: 24rpx 0;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面 | 适用理由 |
|------|----------|
| 首页工具分类 | 五色类别卡片完美映射工具分类 |
| 工具卡片网格 | 类别色 + 多层阴影适合工具列表展示 |
| 模块介绍页 | 大写 eyebrow + feature section 适合功能说明 |
| 首页 hero | 克制的 Georgia 标题 + 珊瑚 CTA 适合入口 |

### 4.2 不适合用在哪些页面

| 页面 | 不适用理由 |
|------|-----------|
| 刷题页面 | 类别色系统在刷题沉浸感中会分散注意力 |
| 错题本 | 列表型页面不需要类别色系统 |
| 答题记录 | 简单列表不需要多层阴影 |

### 4.3 混搭建议

- **Webflow 的类别色系统 + 暖奶油色板**：类别色用作点缀（顶部条纹/左侧边框），不全填充
- **Webflow 的多层阴影 + 暖奶油色板**：阴影色温改为暖调
- **Webflow 的 eyebrow 标签 + Georgia 标题**：section 标题用 eyebrow + Georgia 组合
- **Webflow 的 tight 按钮 + 项目 pill CTA**：功能按钮用 tight 圆角，主 CTA 用 pill

---

## 5. 实施检查清单

- [ ] 确认主色 CTA 使用 `#cc785c`（非近黑 `#080808`）
- [ ] 确认画布色使用 `#faf9f5`（非纯白 `#ffffff`）
- [ ] 确认类别色用作点缀（非全填充）
- [ ] 确认标题使用 Georgia 衬线（非 WF Visual Sans）
- [ ] 确认 eyebrow 标签使用 `24rpx / 500 / +3rpx tracking / uppercase`
- [ ] 确认所有尺寸使用 rpx
- [ ] 确认多层阴影使用暖色温
- [ ] 确认功能按钮用 8rpx 圆角，CTA 用 100rpx pill
- [ ] 确认类别卡片使用奶油底 + 彩色点缀

---

## 6. 参考文件

- 原方案：`.claude/skills/webflow-design.md`
- 项目设计规范：`design-methods/design-spec.md`
- 项目交接文档：`PROJECT_HANDOFF.md`
