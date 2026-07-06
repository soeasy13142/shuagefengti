# Miro 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/miro-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Miro 以"AI 驱动的视觉工作空间"定位，设计语言的核心是**白板隐喻**：产品即画布，设计即便签。整体气质是**自信、略带俏皮**，通过彩色便签色板（rose、teal、coral、orange、mint）传达协作与创造力。黑色药丸 CTA 占据营销主导地位，真实的产品白板 mockup 作为特性展示图，形成"展示而非讲述"的策略。

### 1.2 视觉 DNA
- **签名金丝雀黄**（#ffd02f）仅用于 wordmark、顶部促销横幅和黄色标签 chip——从不用于 CTA
- **黑色药丸按钮**（#1c1c1e + rounded.full）是所有交互表面的主导元素
- **彩色便签色板**：rose、teal、coral、yellow、mint 用于特性卡片，呼应真实白板便签颜色
- **Roobert PRO** 贯穿所有 UI 表面，从 80px hero 展示到 11px 微标签
- **真实产品 mockup** 作为特性展示，不用库存摄影
- **4 层定价网格** + 密集特性对比表

### 1.3 色彩策略
- **主色（Primary）**：#1c1c1e（近乎纯黑），用于所有主要 CTA
- **品牌色（Brand）**：#ffd02f（金丝雀黄），仅用于 wordmark 和标签 chip
- **画布色（Canvas）**：#ffffff（纯白），页面背景和主要卡片表面
- **表面色（Surface）**：#f7f8fa，微妙的区域背景
- **便签色板**：#ffd8f4（rose）、#c3faf5（teal）、#ffc6c6（coral）、#fff4c4（yellow-light）、#ffe6cd（orange-light）
- **文字色谱**：#050038（ink-deep）、#1c1c1e（ink）、#555a6a（slate）、#8e91a0（stone）

### 1.4 字体策略
- **唯一字体**：Roobert PRO（自定义几何无衬线）
- **字重缩放**：400（正文）、500（中等强调+标题）、600（badge 和大写）
- **Hero 展示**：80px / weight 500 / line-height 1.05 / letter-spacing -2px
- **紧凑行距**：hero 级别使用 1.05，创建杂志级排版效果
- **负字间距递进**：展示尺寸 -2px ~ -1.5px，较小标题放松到 0

### 1.5 布局与组件模式
- **间距系统**：4px 基础单位，8px 主增量，hero 级别 120px
- **圆角策略**：按钮一律 `{rounded.full}`（药丸形），卡片 `{rounded.xl}`（16px），便签特性卡片 `{rounded.xxxl}`（28px）
- **阴影哲学**：零阴影，靠色块对比表达深度——便签卡片通过饱和背景色承载视觉重量
- **导航**：白色粘性顶栏 + 金丝雀黄 wordmark + 水平链接 + 黑色药丸 CTA

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
| Miro 设计决策 | 刷个冯题适配说明 |
|---|---|
| 便签色板用于特性卡片 | 可直接用于工具模块卡片区分（网络、数据结构、算法等用不同色板） |
| 药丸形按钮（rounded.full） | 暖奶油画布已使用圆角，药丸形可增强互动感 |
| 黑色主 CTA | 与暖墨色 #141413 兼容，可替代珊瑚色用于某些强调场景 |
| 密集特性对比表 | 适合工具功能对比、学习进度对比等场景 |
| Badge/Tag chip 系统 | 适合标签化学习状态、难度标记、分类标识 |
| 单字重缩放（400/500/600） | 简化字体管理，适合小程序场景 |

### 2.2 需要改造的设计决策
| Miro 设计决策 | 改造方案 |
|---|---|
| 白色画布背景 #ffffff | 改为暖奶油 #faf9f5，保持暖色调一致性 |
| 卡片白色背景 #ffffff | 改为奶油卡片 #efe9de，匹配暖奶油画布风格 |
| Roobert PRO 字体 | 替换为 Georgia 衬线（标题）+ 系统无衬线（正文），匹配项目字体约束 |
| 80px hero 展示尺寸 | 缩小到 56-64rpx，适应移动端小屏 |
| 120px hero 间距 | 缩小到 64-80rpx，适应小程序页面节奏 |
| 金丝雀黄品牌色 #ffd02f | 仅参考其"保留品牌色"策略，实际使用珊瑚色 #cc785c |

### 2.3 不可迁移的设计决策
| Miro 设计决策 | 不可迁移原因 |
|---|---|
| 真实白板 mockup 作为特性图 | 项目无后端，无法动态生成产品截图；用纯 WXML/WXSS 实现可视化 |
| 4 层定价网格 | 项目无付费模型，不适合 |
| 1280px 最大宽度 + 12 列网格 | 小程序固定 750rpx 宽度，无响应式网格需求 |
| 密集 80 行特性对比表 | 小程序滚动体验差，需精简为分段展示 |
| 飞入动画/过渡 | 小程序原生不支持复杂 CSS 动画，需用 wx.createAnimation |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Miro Token | 刷个冯题映射值 | 用途 |
|---|---|---|
| `{colors.primary}` #1c1c1e | `#141413`（暖墨） | 主 CTA、强调文字 |
| `{colors.brand-yellow}` #ffd02f | `#cc785c`（珊瑚色） | 品牌标识、wordmark、标签 chip 背景 |
| `{colors.canvas}` #ffffff | `#faf9f5`（暖奶油） | 页面背景 |
| `{colors.surface}` #f7f8fa | `#efe9de`（奶油卡片） | 卡片背景 |
| `{colors.hairline}` #e0e2e8 | `#e5e0d8`（暖分割线） | 1px 分割线 |
| `{colors.coral-light}` #ffc6c6 | `#f5ded0`（暖珊瑚浅） | 工具模块卡片变体 A |
| `{colors.teal-light}` #c3faf5 | `#d4ece6`（暖薄荷） | 工具模块卡片变体 B |
| `{colors.rose-light}` #fde0f0 | `#f0dce8`（暖玫瑰） | 工具模块卡片变体 C |
| `{colors.yellow-light}` #fff4c4 | `#f5ecd0`（暖浅黄） | 工具模块卡片变体 D |
| `{colors.orange-light}` #ffe6cd | `#f5dcc8`（暖橘） | 工具模块卡片变体 E |
| `{colors.ink}` #1c1c1e | `#141413`（暖墨） | 主要文字 |
| `{colors.slate}` #555a6a | `#6c6a64`（暖灰） | 次要文字 |
| `{colors.stone}` #8e91a0 | `#9c9a94`（暖石） | 辅助标签 |
| `{colors.success}` #00b473 | `#4a8c5c`（暖绿） | 成功/完成状态 |

### 3.2 字体映射（用 rpx）

| Miro Token | 刷个冯题映射 | WXSS 属性 |
|---|---|---|
| `{typography.hero-display}` 80px | 64rpx | `font-family: Georgia, serif; font-size: 64rpx; font-weight: 400; line-height: 1.1; letter-spacing: -3rpx;` |
| `{typography.display-lg}` 60px | 52rpx | `font-family: Georgia, serif; font-size: 52rpx; font-weight: 400; line-height: 1.15; letter-spacing: -2rpx;` |
| `{typography.heading-1}` 48px | 44rpx | `font-family: Georgia, serif; font-size: 44rpx; font-weight: 400; line-height: 1.2; letter-spacing: -2rpx;` |
| `{typography.heading-2}` 36px | 36rpx | `font-family: Georgia, serif; font-size: 36rpx; font-weight: 400; line-height: 1.25; letter-spacing: -1rpx;` |
| `{typography.heading-3}` 28px | 32rpx | `font-family: Georgia, serif; font-size: 32rpx; font-weight: 400; line-height: 1.3;` |
| `{typography.heading-4}` 22px | 28rpx | `font-family: Georgia, serif; font-size: 28rpx; font-weight: 400; line-height: 1.35;` |
| `{typography.body-md}` 16px | 28rpx | `font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 28rpx; font-weight: 400; line-height: 1.6;` |
| `{typography.body-sm}` 14px | 24rpx | `font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 24rpx; font-weight: 400; line-height: 1.5;` |
| `{typography.caption}` 13px | 22rpx | `font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 22rpx; font-weight: 400; line-height: 1.4;` |
| `{typography.micro}` 12px | 20rpx | `font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 20rpx; font-weight: 500; line-height: 1.4;` |
| `{typography.button-md}` 14px | 26rpx | `font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 26rpx; font-weight: 500; line-height: 1.3;` |

### 3.3 组件设计规范

**药丸按钮（button-primary）**
```css
.btn-primary {
  background-color: #141413;
  color: #faf9f5;
  font-size: 26rpx;
  font-weight: 500;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
  line-height: 1.3;
}
.btn-primary:active {
  background-color: #2c2c2a;
}
```

**便签特性卡片（card-feature-tint）**
```css
.card-feature {
  border-radius: 48rpx;
  padding: 48rpx;
  /* 不同变体使用不同背景色 */
}
.card-feature--coral { background-color: #f5ded0; }
.card-feature--teal { background-color: #d4ece6; }
.card-feature--rose { background-color: #f0dce8; }
.card-feature--yellow { background-color: #f5ecd0; }
.card-feature--mint { background-color: #d4ece6; }
```

**标签 Chip（badge-tag）**
```css
.badge-tag {
  display: inline-flex;
  align-items: center;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 9999rpx;
  padding: 8rpx 20rpx;
}
.badge-tag--brand {
  background-color: #cc785c;
  color: #faf9f5;
}
.badge-tag--yellow {
  background-color: #f5ecd0;
  color: #6c5a20;
}
.badge-tag--coral {
  background-color: #f5ded0;
  color: #8c3a20;
}
```

**药丸 Tab（pill-tab）**
```css
.pill-tab {
  font-size: 24rpx;
  font-weight: 500;
  border-radius: 9999rpx;
  padding: 12rpx 28rpx;
  border: 1rpx solid #e5e0d8;
  background-color: transparent;
  color: #6c6a64;
}
.pill-tab--active {
  background-color: #141413;
  color: #faf9f5;
  border-color: #141413;
}
```

**基础卡片（card-base）**
```css
.card-base {
  background-color: #efe9de;
  border-radius: 32rpx;
  padding: 36rpx;
  border: 1rpx solid #e5e0d8;
}
```

### 3.4 页面布局模板

**首页工具卡片网格（3 列）**
```
┌─────────────────────────────┐
│  暖奶油背景 #faf9f5          │
│                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ coral │ │ teal │ │ rose │ │ ← 便签色卡片
│  │ 工具A │ │ 工具B │ │ 工具C │ │
│  └──────┘ └──────┘ └──────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │yellow│ │ mint │ │奶白  │ │
│  │ 工具D │ │ 工具E │ │ 工具F │ │
│  └──────┘ └──────┘ └──────┘ │
│                             │
│  ┌─────────────────────────┐ │
│  │   黑色药丸 CTA 按钮     │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

**学习进度对比表**
```
┌─────────────────────────────┐
│  奶油卡片 #efe9de            │
│  ┌─────────────────────────┐ │
│  │ 模块    │ 进度 │ 状态  │ │
│  ├─────────────────────────┤ │
│  │ 网络    │ ████ │ badge │ │
│  │ 数据结构│ ██░░ │ badge │ │
│  │ 算法    │ ░░░░ │ badge │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* Miro 便签色板卡片网格 */
.tool-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 32rpx;
}

.tool-card {
  width: calc(50% - 10rpx);
  border-radius: 48rpx;
  padding: 36rpx;
  box-sizing: border-box;
}

.tool-card--coral { background-color: #f5ded0; }
.tool-card--teal { background-color: #d4ece6; }
.tool-card--rose { background-color: #f0dce8; }
.tool-card--yellow { background-color: #f5ecd0; }

.tool-card__title {
  font-family: Georgia, serif;
  font-size: 32rpx;
  font-weight: 400;
  line-height: 1.3;
  color: #141413;
  letter-spacing: -1rpx;
}

.tool-card__desc {
  font-size: 24rpx;
  color: #6c6a64;
  line-height: 1.5;
  margin-top: 12rpx;
}

.tool-card__badge {
  display: inline-block;
  font-size: 20rpx;
  font-weight: 600;
  border-radius: 9999rpx;
  padding: 6rpx 16rpx;
  margin-top: 16rpx;
  background-color: rgba(0, 0, 0, 0.06);
  color: #141413;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页工具卡片网格**：便签色板完美匹配多模块展示，每种工具一个色板
- **学习进度总览**：药丸 tab 切换不同学科、badge 标记完成状态
- **工具详情页**：特性卡片展示工具功能，使用对应色板区分
- **排行榜/对比页面**：密集表格布局适合成绩对比

### 4.2 不适合用在哪些页面
- **TCP 动画机页面**：已有独立深色背景设计，便签色板会冲突
- **数据结构可视化页面**：已有 beta banner 设计，需保持一致
- **代码展示区域**：需要等宽字体和深色背景，便签色板不适用

### 4.3 混搭建议
- **与暖奶油画布混搭**：将便签色板卡片放在暖奶油背景上，通过色温统一（将 Miro 的冷调便签色调整为暖调变体）
- **与 Claude Design 混搭**：药丸按钮 + 暖奶油画布背景 + Georgia 衬线标题 = Miro 的互动感 + 暖奶油的亲切感
- **避免混搭**：不要同时使用 Miro 的白色画布和项目的暖奶油画布，选择一个统一背景

---

## 5. 实施检查清单

- [ ] 将所有便签色板色值调整为暖色调变体（偏黄/橙基调）
- [ ] 确认药丸按钮圆角使用 `border-radius: 9999rpx` 而非 px
- [ ] 所有字体尺寸使用 rpx 单位，不使用 px
- [ ] 标题字体使用 Georgia 衬线，正文字体使用系统无衬线
- [ ] 卡片背景使用 #efe9de 而非 #ffffff
- [ ] 页面背景使用 #faf9f5 而非 #ffffff
- [ ] 字间距使用 rpx（如 `letter-spacing: -3rpx`）
- [ ] 确认便签色板在暖奶油背景上有足够对比度
- [ ] Badge/Tag 文字在彩色背景上满足可读性要求
- [ ] 便签卡片圆角使用 48rpx（对应 Miro 的 28px）
- [ ] 按钮 padding 使用 rpx 单位
- [ ] 所有颜色值直接写入 WXSS，不使用 CSS 变量（小程序限制）

---

## 6. 参考文件

- 源文件：`.claude/skills/miro-design.md`
- 项目设计风格：`PROJECT_HANDOFF.md` §25（Claude Design 暖奶油画布）
- 色彩规范：暖奶油 #faf9f5、奶油卡片 #efe9de、珊瑚色 #cc785c、暖墨 #141413
- 字体规范：Georgia 衬线标题、系统无衬线正文
- 单位规范：rpx（非 px）
