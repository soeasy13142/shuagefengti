# Airtable 设计方案 → 刷个冯题 实施方法论

> 参考来源：`.claude/skills/airtable-design.md`
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Airtable 的设计语言是"安静的编辑式布局"——白色画布、深墨文字、充裕留白，品牌张力不来自渐变或装饰，而来自**全幅签名色块卡片**在长滚动页面中的节奏性穿插。它信任留白本身就能完成构图，用色块对比而非阴影来表达深度。整体气质像一本排版精良的技术杂志，而非一个堆叠特效的营销模板。

### 1.2 视觉 DNA

- 白色画布为绝对主导页面氛围，Hero 区无渐变、无网格、无背景装饰
- 近黑色（#181d26）作为主色 CTA，而非蓝色或品牌色——自信且终局感
- 全幅签名色块卡片（coral / forest / dark navy）每 2-3 屏穿插一次，制造品牌电压
- 字重克制：display 级标题用 400/500，绝不用 700 粗体做营销强调
- 圆角分级体系：6px 输入 / 10px 内容卡 / 12px 主 CTA 和签名卡 / pill 仅限定价页
- 间距以 4px 为基底网格，section 级垂直节奏固定 96px
- 阴影极简，深度靠白画布与签名色块的对比实现
- 暖色系调色板（cream / peach / mint / yellow / mustard）用于 demo 网格卡，不做主色

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|---|---|---|
| Primary / Ink | `#181d26` | 近黑色，CTA 背景 + 标题文字，同一色值两层角色 |
| Primary Active | `#0d1218` | 按压态，更深的近黑 |
| Canvas | `#ffffff` | 页面画布，绝对白 |
| Surface Soft | `#f8fafc` | 浅灰白，tabbed feature card 和 featured pricing tier |
| Surface Strong | `#e0e2e6` | 中灰，footer 上方 CTA banner |
| Surface Dark | `#181d26` | 深色签名卡，与 primary 同色 |
| Body | `#333840` | 正文文字 |
| Muted | `#41454d` | 次要文字、footer 链接 |
| Hairline | `#dddddd` | 1px 边框、输入框轮廓 |
| Signature Coral | `#aa2d00` | 深珊瑚/氧化红，全幅签名卡 |
| Signature Forest | `#0a2e0e` | 深绿签名卡 |
| Signature Cream | `#f5e9d4` | 暖米色 callout 卡 |
| Signature Peach | `#fcab79` | demo 网格卡底色 |
| Signature Mint | `#a8d8c4` | demo 网格卡底色 |
| Signature Yellow | `#f4d35e` | demo 网格卡底色 |
| Signature Mustard | `#d9a441` | demo 网格卡底色 |
| Link | `#1b61c9` | 内联链接色（非 CTA） |
| Info / Info Border | `#254fad` / `#458fff` | 信息徽章和聚焦输入框 |
| Success / Success Border | `#006400` / `#39bf45` | 确认状态 |

### 1.4 字体策略

- **主字体**：Haas / Haas Groot Disp（Airtable 授权字体），fallback 为系统 sans-serif 栈
- **定价页子系统**：Inter Display，自定义中间字重 475/575
- **字重规则**：display 级 400（非粗体），子标题和按钮 500，法律文本 600（唯一用粗处）
- **层级**：48px → 40px → 32px → 24px → 20px → 18px → 16px → 14px → 13px
- **行高**：display 级 1.1-1.2（紧凑），正文 1.25-1.35
- **字间距**：display 和 body 为 0，caption 和 label 微增 0.12-0.16px
- **核心原则**：强调靠尺寸和色彩对比，不靠加粗

### 1.5 布局与组件模式

- **间距基底**：4px 网格，token: 4/8/12/16/24/32/48/96px
- **Section 垂直节奏**：96px 上下内边距，全页面统一
- **内容最大宽度**：~1280px 居中，48px 水平呼吸空间
- **卡片内边距**：签名卡 48px，feature card 32px，callout 和 demo 卡 24px，密集区 16px
- **Grid gutter**：3-up 卡片间 24px，logo strip 和 footer 列间 16px
- **圆角分级**：xs 2px（法律）/ sm 6px（输入）/ md 10px（内容卡）/ lg 12px（主 CTA + 签名卡）/ pill 9999px（仅定价）/ full 9999px（圆形）
- **按钮配对**：近黑主 CTA + 白描边次 CTA，Airtable 签名按钮组合
- **节奏模式**：白画布 → 签名色卡 → 白正文 → cream callout → 深色 CTA → 浅灰 CTA banner → footer

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 是什么 | 为什么适合本项目 |
|---|---|---|
| **留白即氛围** | Hero 区不加渐变/网格/装饰，靠纯色背景 + 文字呼吸 | 当前暖奶油画布 (#faf9f5) 已是纯色画布，Airtable 的留白哲学与之天然兼容 |
| **圆角分级体系** | 输入 6px / 内容卡 10px / 主 CTA 12px / 圆形 full | 当前项目已有 24rpx 统一圆角，可细化为 3 级（输入 12rpx / 内容卡 20rpx / 主 CTA 24rpx） |
| **4px 间距网格** | 所有间距为 4 的倍数 | rpx 体系下可映射为 8rpx 基底（4px × 2），与当前项目兼容 |
| **色块对比表达深度** | 不靠阴影，靠色块反差 | 当前暖奶油画布已采用此策略（奶油画布 vs 奶油卡片 vs 深海军蓝），零阴影 |
| **按钮配对** | 主 CTA + 描边次 CTA 并排 | 当前项目珊瑚色 CTA 可配白色描边次按钮，适合刷题页的"提交 + 跳过"场景 |
| **Section 节奏交替** | 不连续出现同色表面 | 当前首页已采用：奶油画布 → 奶油卡片 → 深海军蓝快捷入口，节奏正确 |
| **暖色调 demo 卡** | cream / peach / mint 等暖色底的卡片 | 与暖奶油画布体系天然协调，可作为工具卡片的分类色 |

### 2.2 需要改造的设计决策

| 原方案做法 | 本项目应改为 | 原因 |
|---|---|---|
| **近黑 (#181d26) 做主 CTA** | 保持珊瑚色 (#cc785c) 做主 CTA | 暖奶油画布体系中珊瑚色是品牌主色，近黑做 CTA 会与暖墨文字 (#141413) 混淆 |
| **白色画布 (#ffffff)** | 暖奶油 (#faf9f5) | 项目已确立暖奶油为全局画布色，比纯白更有温度感 |
| **Haas / Haas Groot Disp 字体** | Georgia 衬线做标题 + system sans-serif 做正文 | 小程序无法引入授权字体；Georgia 已是项目标题字体，正文用系统无衬线 |
| **96px section 间距** | 48-64rpx section 间距 | 手机屏幕宽度有限，96px (192rpx) 过大；需缩至 48-64rpx 保持节奏但不浪费空间 |
| **1280px 最大内容宽度** | 100% 宽度 + 28-32rpx 水平 padding | 小程序全屏渲染，无 max-width 概念；用 padding 控制内容呼吸 |
| **Signature coral (#aa2d00)** | 可选引入为强调色卡片底色 | 比当前珊瑚 (#cc785c) 更深更重，适合做全幅深色签名卡；但需与暖奶油画布协调 |
| **pill 圆角按钮** | 可用于特殊场景（如标签筛选） | Airtable 仅定价页用 pill；本项目可在分类标签、芯片等辅助元素中使用 |
| **Inter Display 定价子系统** | 不引入 | 本项目无定价页，无需独立字体子系统 |

### 2.3 不可迁移的设计决策

| 决策 | 冲突原因 |
|---|---|
| **近黑 primary CTA (#181d26)** | 与暖奶油画布的暖墨文字 (#141413) 过于接近，CTA 会失去辨识度；珊瑚色是当前体系的品牌锚点 |
| **白色画布 + 深墨 type 的极端对比** | 暖奶油画布追求的是低对比度暖色体系，纯白 + 近黑的极端对比会破坏整体温度 |
| **全幅深色签名卡 (#181d26)** | 与当前深海军蓝 (#181715) 几乎同色但语义不同；直接引入会造成色彩体系混乱 |
| **Haas Groot Disp 授权字体** | 微信小程序无法加载外部授权字体；Georgia + 系统字体已是项目约定 |
| **1px hairline 边框 (#dddddd)** | 暖奶油画布用色块对比而非边框分割；引入 hairline 边框会增加视觉噪声，偏离零阴影零边框的设计语言 |
| **demo 网格卡不等高策略** | 小程序 scroll-view 和 flex 布局下不等高卡片会导致布局跳动；保持等高更稳定 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas (画布) | `#ffffff` | `#faf9f5` (暖奶油) | 全局页面背景，已是当前值 |
| Surface Soft | `#f8fafc` | `#efe9de` (奶油卡片) | 功能卡片背景，已是当前值 |
| Surface Strong | `#e0e2e6` | `#e6dfd8` (浅面分割线色) | 可用于强调区域背景，比奶油卡片略深 |
| Surface Dark | `#181d26` | `#181715` (深海军蓝) | 深色卡片/快捷入口，已是当前值 |
| Primary / Ink | `#181d26` | `#141413` (暖墨) | 标题和正文最深色 |
| Body | `#333840` | `#141413` / `#6c6a64` | 正文用暖墨，次要正文用次要文字色 |
| Muted | `#41454d` | `#8e8b82` (最次要文字) | caption、辅助信息 |
| Hairline | `#dddddd` | `#e6dfd8` (浅面分割线) | 如需边框时使用，但优先用色块对比 |
| Signature Coral | `#aa2d00` | `#cc785c` (珊瑚色) | 保持当前品牌主色，不做替换 |
| Signature Cream | `#f5e9d4` | `#efe9de` (奶油卡片) | 近似暖米色，已覆盖 |
| Signature Peach | `#fcab79` | 可引入为工具分类色 | 比珊瑚色更暖更亮，适合"计算机网络"分类底色 |
| Signature Mint | `#a8d8c4` | 可引入为工具分类色 | 适合"算法&数据结构"分类底色 |
| Signature Yellow | `#f4d35e` | 可引入为工具分类色 | 适合"操作系统"分类底色 |
| Signature Forest | `#0a2e0e` | 不引入 | 与深海军蓝语义重叠，且绿色在暖色体系中突兀 |
| Link | `#1b61c9` | `#cc785c` (珊瑚色) | 链接色复用主色，保持暖色统一 |
| On Primary / On Dark | `#ffffff` | `#faf9f5` (暖奶油) | 深色表面上的文字，比纯白更协调 |
| On Dark Muted | — | `#a09d96` | 深色表面上的次要文字 |

### 3.2 字体映射

| Airtable Token | 原值 | WXSS 映射 | 用途 |
|---|---|---|---|
| display-xl (48px/500) | 48px | `font-size: 48rpx; font-weight: 400; font-family: Georgia, serif; letter-spacing: -3rpx;` | 页面主标题（如首页"刷个冯题"） |
| display-lg (40px/400) | 40px | `font-size: 40rpx; font-weight: 400; font-family: Georgia, serif; letter-spacing: -2rpx;` | Hero 区副标题 |
| display-md (32px/400) | 32px | `font-size: 32rpx; font-weight: 400; font-family: Georgia, serif; letter-spacing: -2rpx;` | 区块标题 |
| title-lg (24px/400) | 24px | `font-size: 28rpx; font-weight: 400; font-family: Georgia, serif; letter-spacing: -1rpx;` | Section 标题 |
| title-md (20px/400) | 20px | `font-size: 26rpx; font-weight: 400;` | 子区块标题 |
| title-sm (18px/500) | 18px | `font-size: 24rpx; font-weight: 500;` | 卡片标题 |
| label-md (16px/500) | 16px | `font-size: 24rpx; font-weight: 500;` | 标签、列表项标题 |
| button (16px/500) | 16px | `font-size: 28rpx; font-weight: 500;` | 按钮文字 |
| body-md (14px/400) | 14px | `font-size: 24rpx; font-weight: 400; line-height: 1.6;` | 正文 |
| caption (14px/500) | 14px | `font-size: 22rpx; font-weight: 500; letter-spacing: 0.5rpx;` | 辅助说明文字 |
| legal (13px/600) | 13px | `font-size: 20rpx; font-weight: 600;` | 法律/协议文字 |

**注意**：Airtable 的 display 级用 400 字重（不加粗），本项目 Georgia 衬线标题同样用 400，两者一致。强调靠尺寸和色彩，不靠加粗。

### 3.3 组件设计规范

#### 主 CTA 按钮

| 属性 | 值 |
|---|---|
| 背景 | `#cc785c` (珊瑚色) |
| 文字 | `#faf9f5` (暖奶油) |
| 字号 | 28rpx |
| 字重 | 500 |
| 圆角 | 24rpx |
| 内边距 | 24rpx 32rpx |
| 最小高度 | 80rpx |
| Active 态 | `#a9583e` |
| 阴影 | 无 |

#### 次 CTA 按钮（描边）

| 属性 | 值 |
|---|---|
| 背景 | `#faf9f5` (暖奶油) |
| 文字 | `#141413` (暖墨) |
| 边框 | 2rpx solid `#e6dfd8` |
| 字号 | 28rpx |
| 字重 | 500 |
| 圆角 | 24rpx |
| 内边距 | 24rpx 32rpx |
| 最小高度 | 80rpx |
| Active 态 | 背景 `#efe9de` |

#### 功能卡片

| 属性 | 值 |
|---|---|
| 背景 | `#efe9de` (奶油卡片) |
| 文字 | `#141413` |
| 圆角 | 24rpx |
| 内边距 | 32rpx |
| Active 态 | `#e8e0d2` |
| 阴影 | 无 |
| 分割 | 色块对比，不用边框 |

#### 深色签名卡

| 属性 | 值 |
|---|---|
| 背景 | `#181715` (深海军蓝) |
| 文字 | `#faf9f5` |
| 次要文字 | `#a09d96` |
| 圆角 | 24rpx |
| 内边距 | 40rpx |
| 用途 | 强调区块、快捷入口、数据驾驶舱 |

#### 标签/芯片

| 属性 | 值 |
|---|---|
| 背景 | `#efe9de` 或签名暖色（peach/mint/yellow） |
| 文字 | `#141413` |
| 圆角 | 999rpx (pill) |
| 内边距 | 8rpx 20rpx |
| 字号 | 22rpx |
| 字重 | 500 |
| Active 态 | `#cc785c` + 白字 |

#### 输入框

| 属性 | 值 |
|---|---|
| 背景 | `#faf9f5` |
| 文字 | `#141413` |
| 边框 | 2rpx solid `#e6dfd8` |
| 圆角 | 12rpx |
| 内边距 | 20rpx 24rpx |
| 高度 | 80rpx |
| 字号 | 24rpx |
| Focus 态 | 边框色 `#cc785c` |
| Placeholder | `#8e8b82` |

### 3.4 页面布局模板

```
┌──────────────────────────────┐
│ Zone 1 — Hero (暖奶油画布)     │
│ 48rpx 顶部留白                 │
│ 衬线标题 (Georgia 40rpx)       │
│ 副标题 (24rpx, #6c6a64)       │
│ [主CTA] [次CTA] 按钮对         │
│ 48rpx 底部留白                 │
├──────────────────────────────┤
│ Zone 2 — 功能卡片区            │
│ 32rpx 内边距                   │
│ 分类标签栏 (pill 标签)          │
│ 2列网格, 20rpx gutter          │
│ 奶油卡片 × N                   │
├──────────────────────────────┤
│ Zone 3 — 深色签名卡 (可选)      │
│ 全幅深海军蓝底                  │
│ 40rpx 内边距                   │
│ 白字标题 + 暖奶油 CTA           │
├──────────────────────────────┤
│ Zone 4 — 列表/详情区            │
│ 奶油卡片列表                    │
│ 每项 24rpx 内边距               │
│ 底部分割线用色块差 (#e6dfd8)    │
├──────────────────────────────┤
│ Zone 5 — 底部操作区             │
│ 固定底部或滚动底部               │
│ 主CTA 全宽 + 次操作文字链接      │
│ 32rpx 安全区                    │
└──────────────────────────────┘
```

**节 rhythm 规则**（借鉴 Airtable 的白→签名→白→cream→深→白节奏）：

```
暖奶油画布 → 奶油卡片 → 暖奶油画布 → 深海军蓝卡 → 暖奶油画布
```

不允许连续两个同色表面相邻。

### 3.5 WXSS 实现示例

#### 示例 1：主 CTA 按钮

```css
/* 主 CTA 按钮 — 珊瑚色，Airtable 风格近黑 CTA 的暖色替代 */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  padding: 0 32rpx;
  background-color: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 24rpx;
  border: none;
}

.btn-primary:active {
  background-color: #a9583e;
}

/* 次 CTA — 白底描边，Airtable button-secondary 的暖色版本 */
.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  padding: 0 32rpx;
  background-color: #faf9f5;
  color: #141413;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 24rpx;
  border: 2rpx solid #e6dfd8;
}

.btn-secondary:active {
  background-color: #efe9de;
}
```

#### 示例 2：功能卡片 + 签名色块卡

```css
/* 奶油功能卡片 — 对应 Airtable feature-card-tabbed */
.card {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
}

.card:active {
  background-color: #e8e0d2;
}

.card-title {
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 400;
  letter-spacing: -1rpx;
  color: #141413;
}

.card-desc {
  font-size: 24rpx;
  color: #6c6a64;
  line-height: 1.6;
  margin-top: 12rpx;
}

/* 深色签名卡 — 对应 Airtable signature-coral-card / hero-card-dark */
.card-signature {
  background-color: #181715;
  border-radius: 24rpx;
  padding: 40rpx;
}

.card-signature .card-title {
  color: #faf9f5;
}

.card-signature .card-desc {
  color: #a09d96;
}
```

#### 示例 3：pill 标签 + 分类色卡

```css
/* Pill 标签 — 借鉴 Airtable pill 按钮，用于分类筛选 */
.tag-pill {
  display: inline-flex;
  align-items: center;
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background-color: #efe9de;
  color: #141413;
  font-size: 22rpx;
  font-weight: 500;
}

.tag-pill.active {
  background-color: #cc785c;
  color: #faf9f5;
}

/* 分类色卡 — 借鉴 Airtable demo-grid-card 暖色调 */
.card-peach {
  background-color: #fcab79;
  color: #141413;
}

.card-mint {
  background-color: #a8d8c4;
  color: #141413;
}

.card-yellow {
  background-color: #f4d35e;
  color: #141413;
}

.card-cream {
  background-color: #f5e9d4;
  color: #141413;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面/模块 | 原因 |
|---|---|
| **首页工具箱 (pages/index)** | Airtable 的编辑式布局 + 签名色块卡节奏非常适合工具箱首页：Hero 白画布 → 工具卡片区 → 深色签名卡（如数据驾驶舱入口） → 快捷入口。当前首页结构已接近此模式 |
| **学习驾驶舱 (pages/dashboard)** | 当前 dashboard 已用深色科技风，可借鉴 Airtable 的深色签名卡风格统一：深海军蓝底 + 白字 + 暖色数据高亮，去掉玻璃拟态的 blur 效果 |
| **数据结构可视化 (pages/ds-viz)** | Airtable 的 demo-grid-card 用暖色底（peach/mint/yellow）承载内容片段，适合数据结构的四种模式切换标签 |
| **工具注册表分类标签** | Airtable 的 pill 按钮 + 分类色体系可直接用于首页工具分类标签栏 |

### 4.2 不适合用在哪些页面

| 页面/模块 | 原因 |
|---|---|
| **刷题页 (pages/quiz)** | 刷题页需要高信息密度和快速交互，Airtable 的杂志式大留白布局会浪费屏幕空间；应保持当前紧凑布局 |
| **子网计算器 (pages/subnet-calc)** | 输入密集型工具页面，需要紧凑的表单布局而非编辑式排版 |
| **TCP 动画机 (pages/tcp-viz)** | 序列图需要最大化可视区域，大留白会压缩动画空间 |
| **答题记录列表 (pages/records)** | 纯列表页，信息密度优先，不需要签名色块卡的节奏穿插 |

### 4.3 混搭建议

如果要与当前暖奶油画布风格混搭，建议按以下策略：

1. **保留暖奶油画布的色板**（#faf9f5 / #efe9de / #cc785c / #181715），不引入 Airtable 的近黑 primary
2. **借鉴 Airtable 的节奏感**：在长页面中每 2-3 个奶油卡片区块后穿插一个深海军蓝签名卡
3. **借鉴圆角分级**：将当前统一的 24rpx 细化为 3 级（输入 12rpx / 内容卡 20rpx / 主 CTA 24rpx）
4. **借鉴 pill 标签**：用于分类筛选、芯片等辅助交互元素
5. **借鉴暖色分类色**：将 peach / mint / yellow / cream 引入为工具分类的标识色
6. **不借鉴**：近黑 CTA、白色画布、hairline 边框、Inter Display 定价子系统

---

## 5. 实施检查清单

- [ ] 确认所有新增页面背景色为 `#faf9f5`（非纯白 `#ffffff`）
- [ ] 确认主 CTA 保持 `#cc785c`（非近黑 `#181d26`）
- [ ] 确认标题字体为 Georgia 衬线 400 weight（非 Haas Groot Disp）
- [ ] 确认圆角使用分级：输入 12rpx / 内容卡 20rpx / 主 CTA 24rpx / pill 999rpx
- [ ] 确认间距基于 8rpx 网格（4px × 2）
- [ ] 确认 section 间距为 48-64rpx（非 96px/192rpx）
- [ ] 确认深色表面使用 `#181715`（非 `#181d26`）
- [ ] 确认深色表面文字使用 `#faf9f5`（非纯白 `#ffffff`）
- [ ] 确认零阴影，深度靠色块对比
- [ ] 确认不连续出现同色表面（节奏交替）
- [ ] 确认 pill 圆角仅用于标签/芯片，不用于主按钮
- [ ] 确认暖色分类色（peach/mint/yellow/cream）仅用于分类标识，不替代品牌主色
- [ ] 确认不引入 hairline 边框作为主要分割手段
- [ ] 确认所有 rpx 单位（非 px）
- [ ] 确认不引入第三方 UI 库或字体文件

---

## 6. 参考文件

- 原方案：`.claude/skills/airtable-design.md`
- 当前设计系统：`PROJECT_HANDOFF.md §25`（Claude Design 暖奶油画布）
- 全局样式：`app.wxss`
- 首页实现：`pages/index/index.wxss`
- 排序可视化：`pages/sort-viz/sort-viz.wxss`
- 数据结构可视化：`pages/ds-viz/ds-viz.wxss`
- 工具注册表：`utils/tool-registry.js`
