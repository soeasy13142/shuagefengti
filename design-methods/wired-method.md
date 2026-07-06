# Wired 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/wired-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Wired 的设计语言是旗舰科技杂志的编辑美学：严格黑白二色，无彩色强调，三字体分层（高对比衬线 display + 人文衬线 body + 人文无衬线 metadata），方角按钮从不软化。整个页面读起来像一本印刷杂志被搬上了屏幕——排版即身份，内容即装饰。

核心原则：
- **黑白二色 = 品牌**：`#000000` 纯黑 + `#ffffff` 纯白，唯一的彩色是链接蓝 `#057dbc`
- **衬线即声音**：display 用高对比窄衬线，body 用人文衬线，metadata 用无衬线
- **方角 = 身份**：所有按钮和输入框使用 `0px` 圆角，从不软化
- **无阴影**：靠 hairline 边框和表面对比表达层次
- **杂志式网格**：大 feature card + 2-up secondary + 垂直 story stack

### 1.2 视觉 DNA

- 严格黑白二色，无彩色装饰
- 高对比窄衬线 display 字体（64px hero）
- 人文衬线 body 字体（16-19px，行高 1.45-1.50）
- 人文无衬线 metadata 字体（14px，权重 700）
- 方角按钮 `0px` 圆角
- 1px hairline 分割线
- 薄黑 masthead band（品牌签名装饰）
- 编辑式 byline 行（作者头像 + 名字 + 日期）

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|------|------|------|
| 主色 | `#000000` | 纯黑，wordmark、CTA、footer |
| 画布 | `#ffffff` | 页面背景 |
| 画布柔和 | `#f5f5f5` | 评论区、hover 状态（极少用） |
| Hairline | `#e0e0e0` | story 行分割线 |
| 文字 ink | `#000000` | 所有标题和正文 |
| ink 柔和 | `#1a1a1a` | caption 强调 |
| Body | `#757575` | byline、时间戳、支持文字 |
| 链接蓝 | `#057dbc` | 仅用于长文内链接 |

### 1.4 字体策略

三字体分层系统：
- **高对比窄衬线 display**：hero/section 标题，64px→26px，权重 400
- **人文衬线 body**：长文正文和 byline，16-19px，行高 1.45-1.50
- **人文无衬线 metadata**：nav、button、category eyebrow、caption，权重 400/700

核心原则：衬线叙事，无衬线结构。display weight 400 是天花板。

### 1.5 布局与组件模式

- 基础单位 4px，间距 token 到 48px
- Hero padding 48px top/bottom
- 杂志式网格：1 大 + 2 中 + 垂直 stack
- Story 行用 1px hairline 分割
- Masthead band：薄黑条 + 居中 wordmark
- 纯黑 footer band

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|------|------|
| 衬线 display + 无衬线 metadata | Georgia 标题 + 系统无衬线的分层与项目一致 |
| Hairline 分割线 | 1px 分割线在小程序中性能最优 |
| 无阴影方案 | 靠表面对比和 hairline 表达层次 |
| 杂志式网格 | 大 + 小的卡片布局适合内容展示 |
| 编辑式排版 | 大标题 + 简洁内容的节奏 |
| Byline 行设计 | 作者信息 + 时间的展示模式 |

### 2.2 需要改造的设计决策

| 决策 | 原方案 | 改造方向 |
|------|--------|----------|
| 色彩系统 | 纯黑白 | 改为暖奶油调（非纯白纯黑） |
| 主色 | 纯黑 `#000000` | 改为珊瑚色 `#cc785c` |
| 按钮圆角 | `0px` 方角 | CTA 用 100rpx pill（项目规范） |
| 链接蓝 | `#057dbc` | 可保留或改为珊瑚色 |
| 字体 | 三专有字体 | 改为 Georgia + 系统字体 |
| Masthead band | 薄黑条 + wordmark | 改为暖深色条（如需要） |

### 2.3 不可迁移的设计决策

| 决策 | 原原因 |
|------|--------|
| 高对比窄衬线 display 字体 | 专有字体不可嵌入小程序 |
| 人文衬线 body 字体 | 专有字体不可嵌入小程序 |
| 人文无衬线 metadata 字体 | 专有字体不可嵌入小程序 |
| 0px 方角按钮 | 项目规范要求 pill 形 CTA |
| 80px hero display | 小程序屏幕 750rpx 宽度限制 |
| 16:9 全幅 hero 图 | 项目无摄影资源 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Wired 原色 | 刷个冯题映射 | 色值 | 用途 |
|------------|-------------|------|------|
| `#000000`（纯黑主色） | 暖深色 | `#181715` | 深色 band、footer |
| `#ffffff`（画布） | 暖奶油画布 | `#faf9f5` | 页面背景 |
| `#f5f5f5`（画布柔和） | 奶油卡片 | `#efe9de` | 卡片背景 |
| `#e0e0e0`（hairline） | 暖奶油分割线 | `#e6dfd8` | 分割线 |
| `#000000`（文字 ink） | 暖墨文字 | `#141413` | 主文字 |
| `#1a1a1a`（ink 柔和） | 暖墨强调 | `#141413` | 强调文字 |
| `#757575`（body） | 暖灰 | `#6c6a64` | 次要文字 |
| `#057dbc`（链接蓝） | 珊瑚主色 | `#cc785c` | 链接文字 |

### 3.2 字体映射（用 rpx）

| Wired 层级 | 原参数 | 刷个冯题映射 | rpx 参数 |
|------------|--------|-------------|----------|
| display-hero | 64px/衬线/400/-0.5px | Georgia 衬线 | `font-size: 56rpx; font-weight: 400; letter-spacing: -2rpx; line-height: 64rpx;` |
| display-lg | 48px/衬线/400/-0.4px | Georgia 衬线 | `font-size: 48rpx; font-weight: 400; letter-spacing: -1rpx; line-height: 56rpx;` |
| display-md | 32px/衬线/400/-0.3px | Georgia 衬线 | `font-size: 36rpx; font-weight: 400; line-height: 44rpx;` |
| display-sm | 26px/衬线/400 | Georgia 衬线 | `font-size: 32rpx; font-weight: 400; line-height: 40rpx;` |
| display-xs | 20px/无衬线/700/-0.28px | 系统无衬线 | `font-size: 28rpx; font-weight: 600; line-height: 36rpx; letter-spacing: -1rpx;` |
| body-serif-lg | 19px/衬线/400/+0.108px | Georgia 衬线 | `font-size: 28rpx; font-weight: 400; line-height: 40rpx; letter-spacing: 1rpx;` |
| body-serif-md | 16px/衬线/400/+0.09px | Georgia 衬线 | `font-size: 26rpx; font-weight: 400; line-height: 38rpx;` |
| body-md | 17px/无衬线/400 | 系统无衬线 | `font-size: 26rpx; font-weight: 400; line-height: 36rpx;` |
| body-md-strong | 17px/无衬线/700 | 系统无衬线 | `font-size: 26rpx; font-weight: 600; line-height: 36rpx;` |
| body-sm | 14px/无衬线/400/+0.4px | 系统无衬线 | `font-size: 24rpx; font-weight: 400; line-height: 32rpx;` |
| byline | 12.73px/衬线/700/行高2.2 | Georgia 衬线 | `font-size: 22rpx; font-weight: 700; line-height: 48rpx;` |
| caption | 12px/无衬线/400 | 系统无衬线 | `font-size: 22rpx; font-weight: 400; line-height: 30rpx;` |
| button-md | 16px/无衬线/700/+0.3px | 系统无衬线 | `font-size: 26rpx; font-weight: 600; letter-spacing: 1rpx;` |

### 3.3 组件设计规范

**按钮（Button）— 适配为圆角**

```
button-primary:
  background: #cc785c
  color: #faf9f5
  font-size: 26rpx
  font-weight: 600
  border-radius: 100rpx (CTA级) / 8rpx (功能级)
  padding: 16rpx 32rpx

button-outline:
  background: transparent
  color: #141413
  border: 1rpx solid #141413
  border-radius: 100rpx / 8rpx
  padding: 16rpx 32rpx
```

**Story 卡片（借鉴 Wired 的 story-card）**

```
story-card-large:
  background: #faf9f5
  color: #141413
  padding: 32rpx
  headline: Georgia 36rpx / 400

story-card:
  background: #faf9f5
  color: #141413
  padding: 24rpx
  headline: 系统无衬线 28rpx / 600
```

**Story 行（借鉴 Wired 的 story-row）**

```
story-row:
  background: #faf9f5
  color: #141413
  border-bottom: 1rpx solid #e6dfd8
  padding: 32rpx 0
  headline: 系统无衬线 26rpx / 600
  byline: Georgia 22rpx / 700 / 行高 48rpx
```

**Category Eyebrow**

```
category-eyebrow:
  color: #141413
  font-size: 24rpx
  font-weight: 600
  text-transform: uppercase
```

### 3.4 页面布局模板

**杂志式首页（借鉴 Wired 的 hero-band + story grid）**

```
magazine-hero:
  padding: 48rpx 32rpx
  content:
    cover-story: story-card-large
    secondary-grid: 2-up story-card
    story-stack: story-row × N（hairline 分割）
```

**Masthead band（借鉴 Wired 的 masthead-band）**

```
masthead:
  background: #faf9f5
  padding: 16rpx 32rpx
  content:
    center: 应用标题（Georgia 26rpx / 600）
    sides: 导航链接
```

**深色 footer（借鉴 Wired 的 footer）**

```
footer-dark:
  background: #181715
  color: #faf9f5
  padding: 64rpx 32rpx
  content:
    columns: 链接列表
    wordmark: 应用标题重复
```

### 3.5 WXSS 实现示例

```css
/* Wired 风格杂志 hero 标题 */
.magazine-hero-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56rpx;
  font-weight: 400;
  letter-spacing: -2rpx;
  line-height: 64rpx;
  color: #141413;
}

/* Wired 风格 serif body */
.body-serif {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 26rpx;
  font-weight: 400;
  line-height: 38rpx;
  letter-spacing: 1rpx;
  color: #141413;
}

/* Wired 风格 byline */
.byline {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 48rpx;
  color: #6c6a64;
}

/* Wired 风格 hairline 分割 story 行 */
.story-row {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #e6dfd8;
}

/* Wired 风格 category eyebrow */
.category-eyebrow {
  font-size: 24rpx;
  font-weight: 600;
  text-transform: uppercase;
  color: #141413;
}

/* Wired 风格 masthead band */
.masthead-band {
  background: #faf9f5;
  padding: 16rpx 32rpx;
  text-align: center;
}

.masthead-band .wordmark {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 26rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-transform: uppercase;
  color: #141413;
}

/* Wired 风格深色 footer */
.footer-dark {
  background: #181715;
  color: #faf9f5;
  padding: 64rpx 32rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面 | 适用理由 |
|------|----------|
| 首页 hero | 杂志式大标题 + story 网格适合工具箱入口 |
| 模块介绍页 | 编辑式排版适合功能说明和文档 |
| 学习驾驶舱 | story-row 列表适合数据记录展示 |
| 答题记录 | story-row + byline 模式适合记录列表 |

### 4.2 不适合用在哪些页面

| 页面 | 不适用理由 |
|------|-----------|
| 刷题页面 | 杂志式排版太强调视觉，刷题需要沉浸感 |
| 数据结构可视化 | 代码工具需要 monospace，不适合 serif 排版 |
| 子网计算器 | 数值工具需要精确排版，不适合编辑式风格 |

### 4.3 混搭建议

- **Wired 的 Georgia serif body + 项目暖奶油色板**：serif 正文在暖奶油背景上非常舒适
- **Wired 的 hairline story-row + 暖奶油分割线**：列表型页面用暖色 hairline
- **Wired 的 category eyebrow + 项目标签系统**：大写标签用于 section 标题
- **Wired 的 masthead band + 项目标题**：薄条标题栏作为页面导航

---

## 5. 实施检查清单

- [ ] 确认画布色使用 `#faf9f5`（非纯白 `#ffffff`）
- [ ] 确认深色 band 使用 `#181715`（非纯黑 `#000000`）
- [ ] 确认标题使用 Georgia 衬线 400 weight
- [ ] 确认 body 使用 Georgia 衬线（长文场景）或系统无衬线（UI 场景）
- [ ] 确认 CTA 按钮使用 pill 形（非方角）
- [ ] 确认所有尺寸使用 rpx
- [ ] 确认 hairline 使用 `#e6dfd8`（非 `#e0e0e0`）
- [ ] 确认链接色使用 `#cc785c`（珊瑚色）
- [ ] 确认 byline 使用 Georgia 700 weight + 高行高

---

## 6. 参考文件

- 原方案：`.claude/skills/wired-design.md`
- 项目设计规范：`design-methods/design-spec.md`
- 项目交接文档：`PROJECT_HANDOFF.md`
