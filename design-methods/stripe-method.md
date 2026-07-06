# Stripe 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/stripe-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Stripe 的设计语言是 **金融基础设施品牌的编辑级密度**。核心理念：
- **渐变网格是品牌**：奶油/橙/薰衣草/靛蓝/宝石粉的水平渐变带占据每个营销页上方 1/3，是品牌最可识别的视觉锚点
- **单一靛蓝 CTA 层级**：`#533afd` 是唯一的填充按钮色，每条带只出现一个填充按钮
- **编辑级字体密度**：Sohne 字体 weight 300（薄体）配负 letter-spacing，从 -1.4px (56px) 到 -0.2px (20px)
- **表格数字用 tnum**：任何包含金额/数字的单元格使用 OpenType `tnum` 特性 + 收紧 tracking
- **深色仪表盘轨道**：深海军蓝 `#1c1e54` 用于 featured 定价层和产品 UI 模拟

### 1.2 视觉 DNA
- 渐变网格背景（奶油 → 橙 → 薰衣草 → 靛蓝 → 宝石粉）
- 药丸按钮（9999px radius），紧凑 8px 16px padding
- 产品 UI 模拟（仪表盘/代码编辑器合成图）作为装饰元素
- 奶油色特征卡 (`#f5e9d4`) 作为蓝色/白色节奏中的暖色间奏

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| Indigo (primary) | `#533afd` | 品牌 CTA、链接强调、渐变锚点 |
| Indigo Deep | `#4434d4` | 渐变中间停靠点、按压态 |
| Indigo Press | `#2e2b8c` | 按下态提升 |
| Brand Dark 900 | `#1c1e54` | Featured 定价层、仪表盘表面 |
| Ruby | `#ea2261` | 渐变强调、图表高亮（非按钮） |
| Ink | `#0d253d` | 默认正文色（深海军蓝，非纯黑） |
| Ink Secondary | `#273951` | 次要正文 |
| Ink Mute | `#64748d` | 辅助文字、表格标签 |
| Canvas | `#ffffff` | 默认页面背景 |
| Canvas Soft | `#f6f9fc` | 微冷灰白，特征带底色 |
| Canvas Cream | `#f5e9d4` | 暖奶油特征卡填充 |
| Hairline | `#e3e8ee` | 1px 边框 |

### 1.4 字体策略
- **Sohne** 专有字体，weight 300（薄体）是品牌签名
- Display 层级用负 letter-spacing：-1.4px (56px) → -0.2px (20px)
- `font-feature-settings: "ss01"` 全局启用（单层 a 等字符变体）
- 金额/数字单元格用 `tnum` + 收紧 tracking (-0.42px)
- 替代字体：Inter weight 300 + `ss01`

### 1.5 布局与组件模式
- 间距基数：8px，token 从 2px 到 64px
- 卡片：12px 圆角，1px hairline 边框，可选 Level 1 阴影
- 按钮：药丸形（9999px），紧凑 8px 16px padding
- 营销页面居中 ~1200px 容器，渐变网格全宽

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **深海军蓝正文色理念**：`#0d253d` 的"非纯黑"哲学与暖奶油画布 `#141413` 一致
- **12px 卡片圆角**：与当前 24rpx 接近
- **紧凑药丸按钮**：8px 16px padding 的紧凑感可映射到 rpx
- **hairline 边框替代阴影**：1px `#e3e8ee` 边框的卡片风格适合学习工具
- **奶油色特征卡**：`#f5e9d4` 与当前 `#efe9de` 气质一致
- **数字/金额用等宽特性**：题号、分数、时间等数字数据可用等宽字体

### 2.2 需要改造的设计决策
- **渐变网格背景** → 改造为单色暖色渐变或色块条纹（小程序不支持复杂 SVG 渐变），或用图片替代
- **靛蓝主色 `#533afd`** → 改造为珊瑚 `#cc785c`，保持"单一 CTA 色"的层级理念
- **薄体 weight 300** → 小程序中 Georgia 400 是当前标题字体，可保持；正文可尝试 300 粗细
- **tnum 表格特性** → 小程序不支持 OpenType 特性，改用等宽字体或固定宽度容器对齐数字
- **Featured 深色定价层** → 改造为深色 `#181715` 的"推荐工具"卡片

### 2.3 不可迁移的设计决策
- **Sohne 专有字体** → 小程序无法加载，保持 Georgia + 系统字体
- **`ss01` OpenType 特性** → 小程序不支持 `font-feature-settings`
- **复杂渐变网格（有机 blob 形状）** → 需 SVG 或图片替代，小程序 CSS 渐变能力有限
- **多层产品 UI 模拟** → 学习工具无需仪表盘模拟图
- **暗色仪表盘轨道** → 当前项目无暗色模式需求

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Stripe 角色 | 刷个冯题映射 | 色值 | 说明 |
|---|---|---|---|
| Indigo (#533afd) | 珊瑚 CTA | `#cc785c` | 主按钮、链接强调 |
| Indigo Deep (#4434d4) | 珊瑚深 | `#a9583e` | 按压态 |
| Brand Dark 900 (#1c1e54) | 深色表面 | `#181715` | 推荐卡片、深色带 |
| Ink (#0d253d) | 暖墨文字 | `#141413` | 正文 |
| Ink Secondary (#273951) | 次要文字 | `#6c6a64` | 辅助信息 |
| Ink Mute (#64748d) | 弱文字 | `#9e9c96` | 占位符、禁用态 |
| Canvas (#ffffff) | 暖奶油画布 | `#faf9f5` | 页面背景 |
| Canvas Soft (#f6f9fc) | 浅灰白 | `#f5f3ef` | 交替区域底色 |
| Canvas Cream (#f5e9d4) | 奶油卡片 | `#efe9de` | 特征卡填充 |
| Hairline (#e3e8ee) | 分割线 | `#e0ddd6` | 卡片边框、分割线 |

### 3.2 字体映射（用 rpx）

| Stripe 层级 | 刷个冯题映射 | 字号 | 粗细 | 行高 | 字间距 |
|---|---|---|---|---|---|
| display-xxl 56px | 页面大标题 | 96rpx | 400 | 1.03 | -3rpx |
| display-xl 48px | 区域标题 | 80rpx | 400 | 1.15 | -2rpx |
| display-lg 32px | 卡片标题 | 56rpx | 400 | 1.1 | -1rpx |
| heading-lg 22px | 子标题 | 40rpx | 400 | 1.2 | 0 |
| body-lg 16px | 引导正文 | 28rpx | 400 | 1.4 | 0 |
| body-md 15px | 默认正文 | 26rpx | 400 | 1.4 | 0 |
| button-md 16px | 按钮标签 | 28rpx | 400 | 1.0 | 0 |
| caption 13px | 辅助说明 | 24rpx | 400 | 1.4 | 0 |

### 3.3 组件设计规范

**主 CTA 药丸按钮**
```css
.btn-stripe-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.0;
  border: none;
}
.btn-stripe-primary:active {
  background-color: #a9583e;
}
```

**特征卡（奶油色）**
```css
.card-cream {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 1rpx solid #e0ddd6;
}
```

**Featured 深色卡**
```css
.card-featured {
  background-color: #181715;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 48rpx;
}
```

**数字等宽展示**
```css
.num-display {
  font-family: 'Courier New', Courier, monospace;
  font-size: 48rpx;
  letter-spacing: -1rpx;
  font-variant-numeric: tabular-nums; /* 小程序中可能不生效，需用等宽字体保证 */
}
```

### 3.4 页面布局模板

**定价/方案对比页（借鉴 Stripe Pricing）**
```
┌──────────────────────────┐
│ 暖奶油画布 #faf9f5        │
│ 区域标题 (80rpx)          │
│ 副标题 (28rpx 次要色)     │
├──────────────────────────┤
│ ┌────────┐ ┌────────┐   │
│ │ 奶油卡  │ │ 深色卡  │   │  ← 标准 vs 推荐
│ │ #efe9de │ │ #181715│   │
│ │ 价格    │ │ 价格    │   │
│ │ 功能列表│ │ 功能列表│   │
│ │ CTA按钮 │ │ CTA按钮 │   │
│ └────────┘ └────────┘   │
├──────────────────────────┤
│ 奶油色特征卡带            │  ← 功能说明
│ #efe9de 背景              │
└──────────────────────────┘
```

### 3.5 WXSS 实现示例

```wxss
/* Stripe 风格的紧凑药丸按钮 */
.btn-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.0;
  border: none;
}
.btn-pill:active {
  background-color: #a9583e;
}

/* Stripe 风格的 hairline 卡片 */
.card-hairline {
  background-color: #faf9f5;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 1rpx solid #e0ddd6;
}

/* 暖色间奏带（类 Canvas Cream） */
.cream-band {
  background-color: #efe9de;
  padding: 64rpx 32rpx;
  border-radius: 24rpx;
}

/* 数字表格单元格 */
.table-num {
  font-family: 'Courier New', Courier, monospace;
  font-size: 26rpx;
  text-align: right;
  min-width: 120rpx; /* 固定宽度保证对齐 */
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具定价/方案页**：Stripe 的定价卡片布局（标准 vs featured 深色层）直接适用
- **数据展示页**：数字等宽对齐 + hairline 卡片适合错题统计、学习数据
- **功能对比页**：奶油色间奏带打断白色节奏，突出功能模块
- **工具列表页**：紧凑药丸标签 + hairline 卡片的网格布局

### 4.2 不适合用在哪些页面
- **纯文本阅读页**：药丸按钮的紧凑 padding 在长阅读中过于克制
- **游戏化/趣味页面**：Stripe 的金融克制气质与趣味学习不匹配
- **设置/配置页**：渐变网格和深色 featured 层对设置页过于隆重

### 4.3 混搭建议
- **Stripe hairline 卡片 + 暖奶油画布背景**：卡片用 1px 边框 + `#faf9f5` 背景，页面用 `#faf9f5` 画布
- **Stripe 紧凑药丸 + 当前珊瑚色**：按钮形态用 Stripe 的紧凑 padding，颜色用暖奶油画布的珊瑚
- **Stripe 奶油间奏带 + Starbucks 深色带**：交替使用暖色块和深色块创造页面节奏

---

## 5. 实施检查清单

- [ ] 所有 CTA 按钮使用药丸形（9999rpx radius）
- [ ] 按钮 padding 保持紧凑（16rpx 32rpx）
- [ ] 卡片使用 1px hairline 边框而非阴影
- [ ] 数字数据使用等宽字体 + 固定宽度容器对齐
- [ ] Featured/推荐卡片使用深色 `#181715` 背景 + 白色文字
- [ ] 奶油色 `#efe9de` 用于特征卡和间奏带
- [ ] 正文使用暖墨 `#141413`，不使用纯黑
- [ ] 每条带/区域最多一个填充 CTA 按钮
- [ ] 标题使用 Georgia 衬线，负 letter-spacing
- [ ] 分割线使用 `#e0ddd6` 1rpx

---

## 6. 参考文件
- 原始设计分析：`.claude/skills/stripe-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
