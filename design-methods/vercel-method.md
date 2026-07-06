# Vercel 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/vercel-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Vercel 的设计语言是开发者平台的极致克制美学：近白画布上以墨黑文字为主角，唯一的装饰系统是一组多色渐变（cyan / blue / magenta / amber），仅在 hero 级别使用。整个页面读起来像一份精心排版的技术文档——干净、精确、无冗余装饰。

核心原则：
- **墨即品牌**：`#171717` 近黑墨色既是主色 CTA，也是所有标题文字
- **渐变即装饰**：唯一的装饰元素是多色 mesh gradient，且仅用于 hero 级别
- **堆叠阴影**：用多层微偏移阴影模拟自然光，而非单一重阴影
- **Mono 即技术语言**：等宽字体专用于技术标签、代码块

### 1.2 视觉 DNA

- 200 步灰色刻度系统，每个分割线、边框、禁用态都有精确色阶
- 近白画布 `#fafafa` 上的纯白卡片 `#ffffff`，靠色阶差表达层次
- 极简装饰——渐变是唯一的品牌装饰手段
- 字重天花板 600——永远不用 700/800

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|------|------|------|
| 主色/CTA | `#171717` | 墨黑，所有转化目标 |
| 画布 | `#ffffff` | 纯白卡片表面 |
| 画布柔和 | `#fafafa` | 页面背景（98% 白） |
| 画布柔和 2 | `#f5f5f5` | 内嵌区域（95% 白） |
| 文字墨色 | `#171717` | 标题和正文 |
| 次要文字 | `#4d4d4d` | 副标题、说明文字 |
| 最次要 | `#888888` | 占位符、细则 |
| 链接蓝 | `#0070f3` | 链接和成功态 |
| 错误红 | `#ee0000` | 表单验证 |
| 警告黄 | `#f5a623` | 注意事项 |
| 分割线 | `#ebebeb` | 1px 边框 |

渐变系统（仅 hero 级别）：
- Develop: `#007cf0` → `#00dfd8`（蓝→青）
- Preview: `#7928ca` → `#ff0080`（紫→粉）
- Ship: `#ff4d4d` → `#f9cb28`（红→琥珀）

### 1.4 字体策略

双字体系统：
- **Geist**（几何无衬线）：所有 display / body / button / link 角色，权重 400 / 500 / 600
- **Geist Mono**（等宽）：技术标签、代码块、终端模拟，权重 400

Display 层级使用激进负字距：`-2.4px`（48px hero）到 `-0.6px`（20px）。标题为 sentence-case，常以句号结尾。

### 1.5 布局与组件模式

- 基础单位 4px，所有间距为 4 的倍数
- 卡片内边距 24-32px，section 间距 64-96px
- 按钮双尺度：营销级 100px pill + 导航级 6px 圆角
- 卡片阴影为多层堆叠（3-5 层微偏移）+ 内嵌 hairline 边框
- 深色反转 band 作为 section 间的深度提示

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|------|------|
| 多层灰色刻度 | Vercel 的 200 步灰阶系统可直接映射到暖色调灰阶 |
| 卡片阴影方案 | 多层微偏移 + hairline 的阴影方案在 WXSS 中可实现 |
| 间距系统（4px 基础） | 与暖奶油系统兼容，直接用 rpx 换算 |
| 按钮双尺度思路 | 营销级大 pill + 功能级小圆角的分层思路适用 |
| 等宽字体用于技术标签 | 代码类工具页面的技术标签可用 monospace |
| Sentence-case 排版 | 适合英文技术术语展示 |

### 2.2 需要改造的设计决策

| 决策 | 原方案 | 改造方向 |
|------|--------|----------|
| 色彩系统 | 冷灰白调 | 改为暖奶油调 `#faf9f5` / `#efe9de` |
| 主色 CTA | 墨黑 `#171717` | 改为珊瑚色 `#cc785c`（项目主色） |
| 字体 | Geist 无衬线 | 改为 Georgia 衬线标题 + 系统无衬线正文 |
| 字重 | 400-600 | 标题 400（Georgia），正文 400 |
| 字距 | 激进负字距 | Georgia 标题用 `-3rpx`，正文用 `0` |
| 渐变装饰 | 多色 mesh gradient | 简化为单色渐变或移除（小程序性能限制） |
| 深色 band | `#171717` 全黑反转 | 改为 `#181715`（暖深色） |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|------|------|
| Mesh gradient 实现 | 小程序不支持 SVG/canvas 渐变的复杂 mesh，性能开销大 |
| Geist / Geist Mono 字体 | 专有字体不可用于小程序，需用系统字体替代 |
| 100px pill CTA | 小程序按钮组件不支持超大 pill 形状，需用 `border-radius` 模拟 |
| 响应式断点系统 | 微信小程序固定 750rpx 宽度，无桌面端断点 |
| Stack shadow CSS 语法 | 部分阴影语法在小程序 WebView 中兼容性差 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Vercel 原色 | 刷个冯题映射 | 色值 | 用途 |
|-------------|-------------|------|------|
| `#171717`（墨黑 CTA） | 珊瑚主色 | `#cc785c` | CTA 按钮、强调元素 |
| `#ffffff`（画布） | 暖奶油画布 | `#faf9f5` | 页面背景 |
| `#fafafa`（画布柔和） | 奶油卡片 | `#efe9de` | 卡片背景 |
| `#f5f5f5`（画布柔和 2） | 淡奶油 | `#e8e0d2` | 卡片激活态 |
| `#171717`（墨色文字） | 暖墨文字 | `#141413` | 标题和正文 |
| `#4d4d4d`（次要文字） | 暖灰 | `#6c6a64` | 次要文字 |
| `#888888`（最次要） | 浅暖灰 | `#8e8b82` | 占位符文字 |
| `#ebebeb`（分割线） | 暖奶油分割线 | `#e6dfd8` | 卡片边框、分割线 |
| `#0070f3`（链接蓝） | 保持蓝 | `#0070f3` | 链接文字（可选） |
| `#ee0000`（错误红） | 错误红 | `#e74c3c` | 表单验证、错误答案 |
| `#f5a623`（警告黄） | 警告橙 | `#ff9800` | 注意事项 |

### 3.2 字体映射（用 rpx）

| Vercel 层级 | 原参数 | 刷个冯题映射 | rpx 参数 |
|-------------|--------|-------------|----------|
| display-xl (hero) | 48px/600/-2.4px | Georgia 衬线 | `font-size: 64rpx; font-weight: 400; letter-spacing: -3rpx;` |
| display-lg | 32px/600/-1.28px | Georgia 衬线 | `font-size: 42rpx; font-weight: 400; letter-spacing: -2rpx;` |
| display-md | 24px/600/-0.96px | Georgia 衬线 | `font-size: 32rpx; font-weight: 400; letter-spacing: -1rpx;` |
| body-lg | 18px/400 | 系统无衬线 | `font-size: 30rpx; font-weight: 400; line-height: 44rpx;` |
| body-md | 16px/400 | 系统无衬线 | `font-size: 28rpx; font-weight: 400; line-height: 40rpx;` |
| body-sm | 14px/400/-0.28px | 系统无衬线 | `font-size: 24rpx; font-weight: 400; line-height: 34rpx;` |
| caption | 12px/400 | 系统无衬线 | `font-size: 22rpx; font-weight: 400; line-height: 30rpx;` |
| caption-mono | 12px/400/mono | monospace | `font-family: monospace; font-size: 22rpx;` |
| button-lg | 16px/500 | 系统无衬线 | `font-size: 28rpx; font-weight: 600;` |
| button-md | 14px/500 | 系统无衬线 | `font-size: 24rpx; font-weight: 600;` |

### 3.3 组件设计规范

**按钮（Button）**

```
button-primary:
  background: #cc785c
  color: #faf9f5
  font-size: 28rpx
  font-weight: 600
  border-radius: 100rpx (营销级) / 12rpx (功能级)
  padding: 16rpx 24rpx
  height: 88rpx

button-secondary:
  background: #efe9de
  color: #141413
  font-size: 28rpx
  font-weight: 600
  border-radius: 100rpx / 12rpx
  padding: 16rpx 24rpx
  height: 88rpx

button-ghost:
  background: transparent
  color: #cc785c
  font-size: 24rpx
  font-weight: 600
  border-radius: 100rpx
  padding: 8rpx 16rpx
```

**卡片（Card）**

```
card-default:
  background: #efe9de
  border: 1rpx solid #e6dfd8
  border-radius: 24rpx
  padding: 32rpx
  shadow: 多层微偏移阴影（见 WXSS 示例）

card-feature:
  background: #faf9f5
  border: 1rpx solid #e6dfd8
  border-radius: 16rpx
  padding: 48rpx
```

**标签（Badge）**

```
badge-secondary:
  background: #efe9de
  color: #6c6a64
  font-size: 22rpx
  border-radius: 100rpx
  padding: 4rpx 16rpx
```

### 3.4 页面布局模板

**首页 hero 模板（借鉴 Vercel 的 hero-band）**

```
hero-section:
  background: #faf9f5
  padding: 96rpx 32rpx
  content:
    eyebrow: monospace 标签（技术感）
    headline: Georgia 42rpx, weight 400, -2rpx tracking
    body: 系统无衬线 28rpx
    cta-row: button-primary + button-ghost 并排
```

**工具卡片网格（借鉴 Vercel 的 feature-mesh-band）**

```
feature-grid:
  padding: 64rpx 32rpx
  grid: 2 列（小程序屏幕宽度限制，不做 3 列）
  gap: 24rpx
  card: card-default 样式
```

**深色反转 section（借鉴 Vercel 的 showcase-band-dark）**

```
dark-band:
  background: #181715
  color: #faf9f5
  padding: 64rpx 32rpx
  用于：学习驾驶舱等需要对比的模块
```

### 3.5 WXSS 实现示例

```css
/* 多层堆叠阴影 — Vercel 风格 */
.card-shadow {
  box-shadow:
    0 2rpx 2rpx rgba(0, 0, 0, 0.02),
    0 4rpx 4rpx rgba(0, 0, 0, 0.04),
    inset 0 0 0 1rpx #e6dfd8;
}

/* Vercel 风格 hero 标题 */
.hero-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 42rpx;
  font-weight: 400;
  letter-spacing: -2rpx;
  line-height: 52rpx;
  color: #141413;
}

/* Vercel 风格 monospace 标签 */
.eyebrow-label {
  font-family: monospace;
  font-size: 22rpx;
  font-weight: 400;
  letter-spacing: 2rpx;
  color: #6c6a64;
  text-transform: uppercase;
}

/* Vercel 风格 CTA pill */
.cta-pill {
  background: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 100rpx;
  padding: 16rpx 32rpx;
  border: none;
}

/* Vercel 风格深色反转 band */
.dark-band {
  background: #181715;
  color: #faf9f5;
  padding: 64rpx 32rpx;
}

/* Vercel 风格分割线 */
.divider-hairline {
  height: 1rpx;
  background: #e6dfd8;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面 | 适用理由 |
|------|----------|
| 首页 hero section | Vercel 的 hero-band 布局适合展示工具箱入口 |
| 工具卡片网格 | Vercel 的 feature-card 布局适合展示多个工具入口 |
| 数据结构可视化 | 技术感 monospace 标签 + 深色 band 适合代码类工具 |
| 子网计算器 | monospace 技术标签 + 精确排版适合数值计算工具 |
| TCP 动画机 | 深色 band + 技术标签适合网络协议可视化 |

### 4.2 不适合用在哪些页面

| 页面 | 不适用理由 |
|------|-----------|
| 刷题页面 | 刷题需要暖色调沉浸感，Vercel 的冷白太技术化 |
| 错题本 | 需要温暖的学习氛围，不适合冷灰调 |
| 答题记录 | 列表型页面不需要 hero 级别的排版张力 |

### 4.3 混搭建议

- **Vercel 的多层阴影 + 暖奶油色板**：卡片阴影用 Vercel 的堆叠方案，但色值改为暖调
- **Vercel 的 monospace 标签 + Georgia 标题**：技术标签用 monospace，大标题用 Georgia 衬线
- **Vercel 的深色 band 模式**：在学习驾驶舱等数据展示页面使用 `#181715` 深色反转
- **Vercel 的间距节奏**：section 间距 64-96rpx，卡片内边距 32rpx，但不做 3 列网格

---

## 5. 实施检查清单

- [ ] 确认所有色值已映射到暖奶油色板（非冷灰白）
- [ ] 确认主色 CTA 使用 `#cc785c`（非墨黑）
- [ ] 确认标题使用 Georgia 衬线 + 400 weight
- [ ] 确认 monospace 标签使用系统 monospace 字体
- [ ] 确认阴影使用多层微偏移方案（非单一重阴影）
- [ ] 确认所有尺寸使用 rpx（非 px）
- [ ] 确认渐变装饰已简化或移除（小程序性能限制）
- [ ] 确认按钮圆角用 `border-radius` 模拟（非 100px pill 组件）
- [ ] 确认响应式已适配 750rpx 固定宽度（非桌面断点）
- [ ] 确认深色 band 使用 `#181715`（非纯黑）

---

## 6. 参考文件

- 原方案：`.claude/skills/vercel-design.md`
- 项目设计规范：`design-methods/design-spec.md`
- 项目交接文档：`PROJECT_HANDOFF.md`
