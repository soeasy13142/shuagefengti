# Voltagent 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/voltagent-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Voltagent 的设计语言是开发者 AI 平台的暗黑极简主义：纯黑画布 `#101010` 上只有一抹电光绿 `#00d992` 作为品牌强调，所有卡片用 hairline 边框而非阴影，排版像精心打磨的文档站点而非营销页面。整个系统读起来像"卖东西的文档"——克制、精确、技术感。

核心原则：
- **暗黑画布唯一**：只有 `#101010` 一种表面模式，无亮色切换
- **单一电光绿强调**：`#00d992` 是唯一的品牌色，用于 CTA、状态指示、品牌标志
- **Hairline = 提升系统**：所有卡片用 1px 边框，无阴影
- **Inter + SF Mono 双字体**：Inter 叙事，SF Mono 技术标签
- **大写 eyebrow 标签**：`2.52px` 正字距的 mono-cap 标签是品牌签名

### 1.2 视觉 DNA

- 近黑画布 `#101010` 贯穿全页，无亮色模式
- 电光绿 `#00d992` 仅用于 CTA 和状态指示
- Hairline 边框卡片（`#3d3a39`），无阴影无填充
- 代码编辑器模拟作为 hero 装饰
- 大写 mono eyebrow 标签（`2.52px` tracking）
- 等宽字体用于代码块、命令片段、数值计数器

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|------|------|------|
| 品牌绿 CTA | `#00d992` | 所有转化目标和状态指示 |
| 品牌绿柔和 | `#2fd6a1` | ghost 按钮、tooltip |
| 品牌绿深 | `#10b981` | 内联链接 |
| 绿色文字 | `#101010` | 绿色表面上的文字 |
| 画布 | `#101010` | 页面背景（唯一表面） |
| 画布柔和 | `#1a1a1a` | 代码块、输入框背景 |
| Hairline | `#3d3a39` | 边框、分割线 |
| 文字 ink | `#f2f2f2` | 主文字（略低于纯白） |
| ink 强调 | `#ffffff` | Hero 标题 |
| 次要文字 | `#bdbdbd` | 支持性文字 |
| 最次要 | `#8b949e` | 细则、脚注 |

### 1.4 字体策略

双字体系统：
- **Inter**：所有 display / body / button / link 角色，权重 400 / 500 / 600 / 700
- **SF Mono**：代码块、命令片段、数值计数器，权重 400 / 549 / 550 / 700

Display 层级使用负字距但不激进：`-0.65px`（60px hero）。标题为 sentence-case。大写 eyebrow 使用 Inter weight 600 + `2.52px` 正字距。

### 1.5 布局与组件模式

- 基础单位 4px，间距 token 到 64px
- Hero padding 48px top/bottom，卡片内边距 24px
- 按钮圆角 6px（非 pill），仅状态标签用 9999px pill
- 2-up 到 3-up 功能卡片网格
- 绿色 hairline divider 作为 section 间的品牌节奏

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|------|------|
| Hairline 边框卡片 | 无阴影的 hairline 方案在小程序中性能最优 |
| 大写 eyebrow 标签 | 技术标签风格适合代码类工具 |
| 代码编辑器模拟 | 适合数据结构可视化、子网计算器等技术工具 |
| 等宽字体用于技术内容 | 代码片段、命令行模拟可直接使用 |
| 紧凑按钮圆角 | 6px 圆角适合功能型按钮（非营销） |
| 绿色 hairline divider | 品牌色分割线可作为模块间的节奏提示 |

### 2.2 需要改造的设计决策

| 决策 | 原方案 | 改造方向 |
|------|--------|----------|
| 画布色 | 纯黑 `#101010` | 改为暖奶油 `#faf9f5`（项目默认亮色模式） |
| 品牌绿 | `#00d992` 电光绿 | 改为珊瑚色 `#cc785c` |
| 文字色 | 白色 on 黑色 | 改为暖墨 `#141413` on 暖奶油 |
| Hairline 色 | `#3d3a39` 暗灰 | 改为 `#e6dfd8` 暖奶油分割线 |
| 卡片背景 | `#1a1a1a` 暗灰 | 改为 `#efe9de` 奶油卡片 |
| 字体 | Inter + SF Mono | 改为 Georgia 标题 + 系统字体正文 |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|------|------|
| 纯黑画布模式 | 项目采用暖奶油亮色模式，不切换为暗黑 |
| SF Mono 字体 | 系统 monospace 可替代，但 SF Mono 本身不可直接嵌入小程序 |
| 代码编辑器复制功能 | 小程序无剪贴板 API 的复杂交互（可部分实现） |
| Dashed divider CSS | 部分 CSS 属性在小程序 WebView 中支持有限 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Voltagent 原色 | 刷个冯题映射 | 色值 | 用途 |
|----------------|-------------|------|------|
| `#00d992`（电光绿） | 珊瑚主色 | `#cc785c` | CTA、强调元素 |
| `#2fd6a1`（绿柔和） | 珊瑚柔和 | `#d4917a` | ghost 按钮、hover |
| `#10b981`（绿深） | 珊瑚深 | `#a9583e` | 链接、激活态 |
| `#101010`（画布） | 暖奶油画布 | `#faf9f5` | 页面背景 |
| `#1a1a1a`（画布柔和） | 奶油卡片 | `#efe9de` | 卡片背景 |
| `#3d3a39`（hairline） | 暖奶油分割线 | `#e6dfd8` | 边框、分割线 |
| `#f2f2f2`（文字 ink） | 暖墨文字 | `#141413` | 主文字 |
| `#ffffff`（ink 强调） | 暖墨强调 | `#141413` | 标题（亮色模式下不需要纯白） |
| `#bdbdbd`（次要文字） | 暖灰 | `#6c6a64` | 次要文字 |
| `#8b949e`（最次要） | 浅暖灰 | `#8e8b82` | 细则 |

### 3.2 字体映射（用 rpx）

| Voltagent 层级 | 原参数 | 刷个冯题映射 | rpx 参数 |
|----------------|--------|-------------|----------|
| display-xl | 60px/400/-0.65px | Georgia 衬线 | `font-size: 56rpx; font-weight: 400; letter-spacing: -2rpx;` |
| display-lg | 36px/400/-0.9px | Georgia 衬线 | `font-size: 42rpx; font-weight: 400; letter-spacing: -1rpx;` |
| display-md | 24px/700/-0.6px | 系统无衬线 | `font-size: 32rpx; font-weight: 600; letter-spacing: -1rpx;` |
| display-sm | 20px/600 | 系统无衬线 | `font-size: 28rpx; font-weight: 600; line-height: 36rpx;` |
| eyebrow-mono | 14px/600/+2.52px | monospace | `font-family: monospace; font-size: 24rpx; font-weight: 600; letter-spacing: 4rpx; text-transform: uppercase;` |
| eyebrow-uppercase | 18px/600/+0.45px | 系统无衬线 | `font-size: 28rpx; font-weight: 600; letter-spacing: 1rpx; text-transform: uppercase;` |
| body-lg | 18px/400 | 系统无衬线 | `font-size: 30rpx; font-weight: 400; line-height: 44rpx;` |
| body-md | 16px/400 | 系统无衬线 | `font-size: 28rpx; font-weight: 400; line-height: 40rpx;` |
| body-sm | 14px/400 | 系统无衬线 | `font-size: 24rpx; font-weight: 400; line-height: 34rpx;` |
| caption | 12px/400 | 系统无衬线 | `font-size: 22rpx; font-weight: 400; line-height: 30rpx;` |
| code | 13px/400 | monospace | `font-family: monospace; font-size: 24rpx; line-height: 34rpx;` |
| button-md | 16px/600 | 系统无衬线 | `font-size: 28rpx; font-weight: 600;` |

### 3.3 组件设计规范

**按钮（Button）**

```
button-primary:
  background: #cc785c
  color: #faf9f5
  font-size: 28rpx
  font-weight: 600
  border-radius: 12rpx
  padding: 16rpx 32rpx

button-outline:
  background: transparent
  color: #141413
  border: 1rpx solid #e6dfd8
  border-radius: 12rpx
  padding: 16rpx 32rpx

button-ghost:
  background: transparent
  color: #d4917a
  border-radius: 12rpx
  padding: 16rpx 32rpx

button-pill-tag:
  background: transparent
  color: #141413
  border: 1rpx solid #e6dfd8
  border-radius: 100rpx
  padding: 8rpx 24rpx
  font-size: 24rpx
```

**卡片（Card）**

```
card-feature:
  background: #faf9f5
  color: #141413
  border: 1rpx solid #e6dfd8
  border-radius: 16rpx
  padding: 40rpx

card-feature-emphasized:
  background: #faf9f5
  color: #141413
  border: 3rpx solid #e6dfd8
  border-radius: 16rpx
  padding: 40rpx
```

**代码模拟（Code Mockup）**

```
code-mockup:
  background: #efe9de
  color: #141413
  border: 1rpx solid #e6dfd8
  font-family: monospace
  font-size: 24rpx
  border-radius: 16rpx
  padding: 32rpx

code-inline-chip:
  background: #efe9de
  color: #6c6a64
  font-family: monospace
  font-size: 24rpx
  border-radius: 12rpx
  padding: 4rpx 16rpx
```

### 3.4 页面布局模板

**功能卡片网格（借鉴 Voltagent 的 content-band）**

```
feature-grid:
  padding: 48rpx 32rpx
  grid: 2-up
  gap: 24rpx
  card: card-feature 样式
  eyebrow: monospace 大写标签
```

**代码模拟 hero（借鉴 Voltagent 的 hero-band + code-mockup）**

```
code-hero:
  padding: 48rpx 32rpx
  content:
    eyebrow: monospace 大写标签
    headline: Georgia 56rpx / 400
    code-mockup: 代码编辑器模拟卡片
    cta: button-primary
```

**状态标签行（借鉴 Voltagent 的 button-pill-tag）**

```
status-row:
  display: flex
  gap: 12rpx
  tag: button-pill-tag 样式
  用于：模块分类、难度标签、状态指示
```

### 3.5 WXSS 实现示例

```css
/* Voltagent 风格 hairline 卡片 */
.card-hairline {
  background: #faf9f5;
  color: #141413;
  border: 1rpx solid #e6dfd8;
  border-radius: 16rpx;
  padding: 40rpx;
}

/* Voltagent 风格强调卡片（加粗边框） */
.card-hairline-emphasis {
  background: #faf9f5;
  color: #141413;
  border: 3rpx solid #cc785c;
  border-radius: 16rpx;
  padding: 40rpx;
}

/* Voltagent 风格 mono eyebrow */
.eyebrow-mono {
  font-family: monospace;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  color: #6c6a64;
}

/* Voltagent 风格代码模拟 */
.code-mockup {
  background: #efe9de;
  color: #141413;
  font-family: monospace;
  font-size: 24rpx;
  line-height: 34rpx;
  border: 1rpx solid #e6dfd8;
  border-radius: 16rpx;
  padding: 32rpx;
}

/* Voltagent 风格 inline code chip */
.code-chip {
  background: #efe9de;
  color: #6c6a64;
  font-family: monospace;
  font-size: 24rpx;
  border-radius: 12rpx;
  padding: 4rpx 16rpx;
  display: inline-block;
}

/* Voltagent 风格 pill tag */
.pill-tag {
  background: transparent;
  color: #141413;
  font-size: 24rpx;
  border: 1rpx solid #e6dfd8;
  border-radius: 100rpx;
  padding: 8rpx 24rpx;
  display: inline-block;
}

/* Voltagent 风格品牌色分割线 */
.brand-divider {
  height: 2rpx;
  background: #cc785c;
  margin: 32rpx 0;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面 | 适用理由 |
|------|----------|
| 数据结构可视化 | 代码模拟 + hairline 卡片 + mono 标签完美契合 |
| 子网计算器 | 技术标签 + 代码模拟 + 精确排版适合数值工具 |
| TCP 动画机 | 代码模拟 + pill tag 状态标签适合协议可视化 |
| 工具卡片网格 | hairline 卡片 + eyebrow 标签适合工具列表 |

### 4.2 不适合用在哪些页面

| 页面 | 不适用理由 |
|------|-----------|
| 刷题页面 | 刷题需要温暖沉浸感，hairline 风格太技术化 |
| 错题本 | 学习复盘页面需要暖色调，不适合冷灰标签 |
| 学习驾驶舱 | 数据仪表盘需要更丰富的色彩层次 |

### 4.3 混搭建议

- **Voltagent 的 hairline 卡片 + 暖奶油色板**：边框风格保留，色值改为暖调
- **Voltagent 的 mono eyebrow + Georgia 标题**：技术标签用 monospace，大标题用 Georgia
- **Voltagent 的 pill tag + 奶油背景**：分类标签用暖调 pill
- **Voltagent 的品牌色分割线**：在工具页面间使用珊瑚色分割线作为节奏提示

---

## 5. 实施检查清单

- [ ] 确认画布色使用 `#faf9f5`（非纯黑 `#101010`）
- [ ] 确认品牌色使用 `#cc785c`（非电光绿 `#00d992`）
- [ ] 确认 hairline 使用 `#e6dfd8`（非暗灰 `#3d3a39`）
- [ ] 确认文字色使用 `#141413`（非白色 `#f2f2f2`）
- [ ] 确认标题使用 Georgia 衬线（非 Inter）
- [ ] 确认 monospace 标签使用系统 monospace 字体
- [ ] 确认所有尺寸使用 rpx
- [ ] 确认按钮圆角使用 12rpx（非 6px）
- [ ] 确认卡片无阴影（hairline 边框方案）
- [ ] 确认 pill tag 仅用于分类/状态标签

---

## 6. 参考文件

- 原方案：`.claude/skills/voltagent-design.md`
- 项目设计规范：`design-methods/design-spec.md`
- 项目交接文档：`PROJECT_HANDOFF.md`
