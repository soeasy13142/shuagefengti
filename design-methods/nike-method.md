# Nike 设计方案 -> 刷个冯题 实施方法论

> 参考来源：Nike.com 商务系统（/men、/membership、PDP 等页面分析）
> 适用项目：刷个冯题 微信小程序（WXML + WXSS + JS，rpx 单位）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Nike 商务系统的核心理念：**摄影说话，UI 不说话**。所有视觉能量留给编辑级摄影和价格信号，UI chrome 全部降为中性排版 + 药丸几何形。没有装饰渐变、没有柔和阴影怀旧、没有用于"氛围"的强调色。布局像印刷目录一样堆叠，而非像 SaaS 落地页那样动画化。

**关键特征：**
- 极致排版对比：96px 大写展示标题 vs 12-16px 安静正文
- 药丸几何无处不在：所有 CTA、搜索框、筛选芯片均用 `border-radius: 9999px`
- 产品卡片零圆角零阴影，照片即卡片
- 8px 基础间距系统，48px 区块节奏
- 色彩能量全部保留给摄影，UI chrome 仅用黑白灰

### 1.2 视觉 DNA

| 元素 | Nike 原版 | 暖奶油画布（当前） |
|---|---|---|
| 情绪 | 运动、编辑级、绝对 | 温暖、画布式、编辑式 |
| 深度表达 | 零阴影，靠摄影对比 | 零阴影，靠色块对比 |
| 形状语言 | 药丸（9999px）+ 零圆角卡片 | 24rpx 圆角卡片为主 |
| 质感 | 印刷目录质感 | 暖奶油画布质感 |
| 密度 | 高密度紧凑排列 | 中等密度舒适留白 |

### 1.3 色彩策略

Nike 的色彩极度克制：**95% 的 UI 面积由纯黑 `#111111`、纯白 `#ffffff`、软灰 `#f5f5f5` 承载**。所有饱和色能量保留给编辑摄影。唯一的非中性零售 chrome 色是促销红 `#d30005`。

**色彩层次：**
- 品牌色：纯黑 `#111111`（唯一"颜色"，CTA、色块、激活态）
- 表面层：纯白 `#ffffff` + 软云灰 `#f5f5f5`
- 文字层：Ink `#111111` > Charcoal `#39393b` > Ash `#4b4b4d` > Mute `#707072` > Stone `#9e9ea0`
- 语义色：促销红 `#d30005`、成功绿 `#007d48`、信息蓝 `#1151ff`
- 品类点缀色：粉 `#ed1aa0`、紫 `#beaffd`、青 `#0a7281`（仅用于色块圆点和品类芯片）

### 1.4 字体策略

极端两级对比：
- **展示层**：Nike Futura ND 96px / 500 / line-height 0.9 / uppercase — 仅用于编辑级 campaign hero
- **UI 层**：Helvetica Now Text/Medium 12-16px / 400-500 — 承载所有按钮、正文、说明文字
- **无中间层**：从 32px heading 直接跳到 16px body，刻意制造"广告牌在上，目录在下"的效果

### 1.5 布局与组件模式

- **间距系统**：8px 基础单位，section 节奏 48px
- **产品卡片**：零内边距，照片全出血，元数据直接贴在下方，行间距 8px
- **CTA 双色层级**：黑底白字主 CTA vs 灰底黑字次 CTA，同一视口内不同时出现两个同级 CTA
- **筛选芯片**：默认白底黑字 + 1px hairline 边框，激活态黑底白字完全反转
- **搜索药丸**：`#f5f5f5` 底色，24px 圆角，聚焦态白底 + 2px 黑边框
- **Swatch 圆点**：12px 圆形，激活态加 2px 黑色外环 + 2px 白色内间隙

---

## 2. 适配分析

### 2.1 可直接迁移

| Nike 元素 | 迁移说明 |
|---|---|
| 零阴影设计 | 与暖奶油画布一致，直接复用 |
| 黑白灰为主的 UI 层 | 暖奶油画布已有类似克制，可加强 |
| 药丸形 CTA | 小程序原生支持 `border-radius: 9999rpx` |
| 8px 间距系统 | 可直接用 16rpx 基础单位实现 |
| 筛选芯片反转逻辑 | 默认态/激活态切换，纯 WXSS 可实现 |
| Swatch 圆点选中态 | 12rpx 圆形 + 外环效果，WXSS 可实现 |
| 促销红仅限价格行 | 与暖奶油画布的语义色策略兼容 |

### 2.2 需要改造

| Nike 元素 | 改造方案 |
|---|---|
| 96px 展示标题（Futura） | 改为 Georgia 衬线（项目现有字体），缩小到 64-72rpx，保留 uppercase + 低行高 |
| Helvetica Now 字体族 | 改为系统默认无衬线（PingFang SC / -apple-system），保留 400/500 权重对比 |
| 产品卡片零圆角 | 暖奶油画布用 24rpx 圆角，折中保留 24rpx 以维持项目一致性 |
| 软云灰 `#f5f5f5` 产品背景 | 改为暖奶油画布的奶油卡 `#efe9de`，保留"摄影舞台"概念 |
| 纯黑 `#111111` 主色 | 改为暖奶油画布的暖墨 `#141413`，保留深色 CTA 概念 |
| 高密度排列 | 适当增加间距，适应小程序触摸交互的舒适度 |

### 2.3 不可迁移

| Nike 元素 | 原因 |
|---|---|
| 1440px 最大宽度 + 超宽屏呼吸边距 | 微信小程序固定 750rpx 宽度，无超宽屏场景 |
| PLP 3-up/2-up/1-up 响应式网格 | 小程序固定单列或固定列数，无 CSS 媒体查询断点 |
| 水平滚动运动品类轮播 | 可用 `scroll-view` 部分实现，但无原版的 peek-next-card 效果 |
| 编辑级全出血摄影 hero | 小程序图片加载和裁切限制，难以实现原版的电影级构图 |
| Filter sidebar 220px 固定侧栏 | 小程序无侧栏概念，需改为底部抽屉或顶部展开 |
| Nike Futura ND 专有字体 | 不可用，用 Georgia + 系统无衬线替代 |
| 40x40px 图标按钮的 hover 状态 | 小程序无 hover，仅有 tap 反馈 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Nike Token | Nike 色值 | 刷个冯题 Token | 刷个冯题色值 | 说明 |
|---|---|---|---|---|
| `ink` | `#111111` | 暖墨 | `#141413` | 主文字 / 深色 CTA |
| `canvas` | `#ffffff` | 暖奶油画布 | `#faf9f5` | 页面背景 |
| `soft-cloud` | `#f5f5f5` | 奶油卡片 | `#efe9de` | 卡片 / 产品背景 |
| `on-primary` | `#ffffff` | 亮面文字 | `#faf9f5` | 深色背景上的文字 |
| `charcoal` | `#39393b` | 次要文字 | `#6c6a64` | 副标题 / 描述 |
| `mute` | `#707072` | 辅助文字 | `#6c6a64` | 分类说明 / 页脚 |
| `hairline` | `#cacacb` | 分割线 | `#d5d0c8` | 1px 分隔线 |
| `sale` | `#d30005` | 语义红 | `#d30005` | 直接保留 |
| `success` | `#007d48` | 语义绿 | `#007d48` | 直接保留 |
| `info` | `#1151ff` | 语义蓝 | `#1151ff` | 直接保留 |
| 无（Nike 纯黑 CTA） | `#111111` | 珊瑚 CTA | `#cc785c` | **差异点**：暖奶油画布用珊瑚色做 CTA，不用纯黑 |

**核心差异说明：**
Nike 的 CTA 是纯黑药丸，刷个冯题用珊瑚色 `#cc785c`。如果要在特定页面引入 Nike 风格的"黑底白字 CTA"，建议仅用于深色表面（`#181715`）上的对比按钮，不替换主珊瑚 CTA。

### 3.2 字体映射（rpx）

| Nike Token | Nike 参数 | 刷个冯题映射 | rpx 参数 | 适用场景 |
|---|---|---|---|---|
| `display-campaign` | 96px/500/0.9lh/uppercase | Georgia 72rpx/400/1.0lh | `font-size: 72rpx; font-family: Georgia, serif; font-weight: 400; line-height: 1.0; letter-spacing: -3rpx; text-transform: uppercase` | 仅限首页 hero 大标题 |
| `heading-xl` | 32px/500/1.2lh | Georgia 48rpx/400/1.2lh | `font-size: 48rpx; font-family: Georgia, serif; font-weight: 400; line-height: 1.2; letter-spacing: -3rpx` | 区块标题 |
| `heading-lg` | 24px/500/1.2lh | Georgia 36rpx/400/1.2lh | `font-size: 36rpx; font-family: Georgia, serif; font-weight: 400; line-height: 1.2; letter-spacing: -3rpx` | 子区块标题 / 卡片标题 |
| `heading-md` | 16px/500/1.75lh | 系统无衬线 32rpx/500/1.5lh | `font-size: 32rpx; font-weight: 500; line-height: 1.5` | 列表行标题 |
| `body-md` | 16px/400/1.5lh | 系统无衬线 28rpx/400/1.6lh | `font-size: 28rpx; font-weight: 400; line-height: 1.6` | 正文 |
| `body-strong` | 16px/500/1.5lh | 系统无衬线 28rpx/500/1.5lh | `font-size: 28rpx; font-weight: 500; line-height: 1.5` | 产品名 / 导航链接 |
| `button-md` | 16px/500/1.5lh | 系统无衬线 28rpx/500/1.5lh | `font-size: 28rpx; font-weight: 500; line-height: 1.5` | 按钮文字 |
| `button-sm` | 14px/500/1.5lh | 系统无衬线 24rpx/500/1.5lh | `font-size: 24rpx; font-weight: 500; line-height: 1.5` | 小按钮 / 标签 |
| `caption-md` | 14px/500/1.5lh | 系统无衬线 24rpx/500/1.5lh | `font-size: 24rpx; font-weight: 500; line-height: 1.5` | 副标题 / 分类说明 |
| `caption-sm` | 12px/500/1.5lh | 系统无衬线 22rpx/500/1.5lh | `font-size: 22rpx; font-weight: 500; line-height: 1.5` | 标签文字 / badge |

### 3.3 组件设计规范

#### 药丸主 CTA
```
background: #cc785c（珊瑚色，非 Nike 的纯黑）
color: #faf9f5
font-size: 28rpx
font-weight: 500
border-radius: 9999rpx
padding: 24rpx 48rpx
height: 80rpx
```
**与暖奶油画布差异**：圆角从 24rpx 提升到 9999rpx（药丸形），其余参数保持一致。

#### 药丸次 CTA
```
background: #efe9de（奶油卡片色）
color: #141413
font-size: 28rpx
font-weight: 500
border-radius: 9999rpx
padding: 24rpx 48rpx
height: 80rpx
```

#### 深色面 CTA（Nike 风格纯黑药丸，仅用于深色区域）
```
background: #181715
color: #faf9f5
font-size: 28rpx
font-weight: 500
border-radius: 9999rpx
padding: 24rpx 48rpx
height: 80rpx
```

#### 筛选芯片
```
/* 默认态 */
background: #faf9f5
color: #141413
border: 1rpx solid #d5d0c8
border-radius: 9999rpx
padding: 12rpx 24rpx

/* 激活态 */
background: #141413
color: #faf9f5
border: none
```

#### 产品卡片
```
background: #faf9f5（画布色，非 Nike 的纯白）
border-radius: 24rpx（暖奶油画布标准，非 Nike 的 0）
padding: 0（照片全出血到圆角边缘）
box-shadow: none（与暖奶油画布一致）
```
图片区域背景：`#efe9de`（奶油卡片色，替代 Nike 的 `#f5f5f5`）

#### Swatch 圆点
```
/* 默认态 */
width: 24rpx
height: 24rpx
border-radius: 9999rpx
background: 动态色值
border: 1rpx solid #d5d0c8（浅色色块需可见）

/* 激活态 */
width: 24rpx
height: 24rpx
border-radius: 9999rpx
background: 动态色值
border: 4rpx solid #141413
padding: 4rpx（白色内间隙）
```

#### 搜索药丸
```
background: #efe9de
color: #141413
border-radius: 48rpx
padding: 12rpx 24rpx
height: 72rpx
```
聚焦态：`background: #faf9f5; border: 3rpx solid #141413;`

#### 促销价格行
```
折扣价：color: #d30005; font-weight: 500
原价（删除线）：color: #6c6a64; text-decoration: line-through
优惠百分比：color: #d30005
```
**注意**：促销红仅用于价格行文字，不用于背景或 badge 容器。

### 3.4 页面布局模板

#### 首页 Hero 区
```
[全宽 hero 图片 - 圆角 24rpx]
  ├── 大标题：Georgia 72rpx / 400 / uppercase / -3rpx 字距
  ├── 副标题：系统无衬线 28rpx / 400
  └── 药丸 CTA（珊瑚色）：底部左对齐
间距：48rpx 到下一区块
```

#### 内容网格区（2列）
```
[区块标题] Georgia 48rpx
间距：24rpx
[卡片1] [卡片2]  ← 2列，间距 16rpx
  ├── 产品图片（#efe9de 背景，24rpx 圆角）
  ├── 色块圆点行（12rpx 圆点 x3-6）
  ├── 产品名（28rpx/500）
  ├── 分类说明（24rpx/500/#6c6a64）
  └── 价格行
间距：48rpx 到下一区块
```

#### 列表详情页
```
[区块标题] Georgia 36rpx
[列表行] ← 每行 24rpx 垂直内边距，底部 1px #d5d0c8 分割线
  ├── 左：标题（28rpx/500）
  └── 右：箭头图标
```

### 3.5 WXSS 示例

```css
/* Nike 风格药丸 CTA + 暖奶油画布配色 */
.nike-pill-cta {
  background: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 9999rpx;
  padding: 24rpx 48rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.nike-pill-cta:active {
  background: #a9583e;
  transform: scale(0.96);
}

/* Nike 风格药丸次 CTA */
.nike-pill-cta--secondary {
  background: #efe9de;
  color: #141413;
}

/* Nike 风格筛选芯片 */
.nike-chip {
  background: #faf9f5;
  color: #141413;
  font-size: 28rpx;
  font-weight: 500;
  border: 1rpx solid #d5d0c8;
  border-radius: 9999rpx;
  padding: 12rpx 24rpx;
}

.nike-chip--active {
  background: #141413;
  color: #faf9f5;
  border: none;
}

/* Nike 风格产品卡片 */
.nike-product-card {
  background: #faf9f5;
  border-radius: 24rpx;
  overflow: hidden;
}

.nike-product-card__image {
  background: #efe9de;
  width: 100%;
  aspect-ratio: 1;
}

.nike-product-card__meta {
  padding: 16rpx;
}

.nike-product-card__name {
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.5;
  color: #141413;
}

.nike-product-card__subtitle {
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.5;
  color: #6c6a64;
  margin-top: 8rpx;
}

.nike-product-card__price {
  font-size: 28rpx;
  font-weight: 500;
  color: #141413;
  margin-top: 8rpx;
}

.nike-product-card__price--sale {
  color: #d30005;
}

/* Nike 风格搜索药丸 */
.nike-search-pill {
  background: #efe9de;
  color: #141413;
  font-size: 28rpx;
  border-radius: 48rpx;
  padding: 12rpx 24rpx;
  height: 72rpx;
}

.nike-search-pill--focused {
  background: #faf9f5;
  border: 3rpx solid #141413;
}

/* Nike 风格 Hero 大标题 */
.nike-hero-title {
  font-family: Georgia, serif;
  font-size: 72rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -3rpx;
  text-transform: uppercase;
  color: #faf9f5;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 适用原因 |
|---|---|
| **题库列表页** | Nike 的产品网格 + 药丸筛选芯片 + 零阴影卡片直接映射题库浏览体验 |
| **刷题结果页** | Nike 的价格行层级（原价/折扣价/优惠百分比）可映射为 正确率/错题数/用时 |
| **分类浏览页** | Nike 的品类芯片 + 水平滚动 rail 适合学科/难度筛选 |
| **深色模式页面** | Nike 的碳黑命令层（`#181715`）+ 白色文字直接可用 |

### 4.2 不适合页面

| 页面 | 不适合原因 |
|---|---|
| **学习进度仪表盘** | 需要暖色调鼓励感，Nike 的冷酷中性风不适合 |
| **个人中心** | 需要温暖亲切感，纯黑白灰过于克制 |
| **新手引导页** | 需要轻松氛围，Nike 的运动编辑风太严肃 |
| **成就/勋章页** | 需要庆祝感和色彩，Nike 的色彩克制策略相反 |

### 4.3 混搭建议

**推荐方案：局部引入 Nike 元素，主体保持暖奶油画布**

| 引入元素 | 位置 | 说明 |
|---|---|---|
| 药丸 CTA 形状 | 全局 CTA | 将现有 24rpx 圆角改为 9999rpx，保留珊瑚色 |
| 筛选芯片反转 | 题库筛选栏 | 默认奶油底 + 激活暖墨底，增加交互反馈 |
| 零阴影产品卡片 | 题目卡片 | 去掉现有卡片阴影，靠色块对比 |
| 1px hairline 分割 | 列表页 | 用 `#d5d0c8` 细线替代粗分割线 |
| 8px 间距节奏 | 全局 | 统一 16rpx 基础间距单位 |
| Hero 大写标题 | 首页 | Georgia 72rpx uppercase 作为首屏视觉锚点 |

**不建议引入：**
- 纯黑 CTA（与珊瑚色主色冲突）
- 零圆角卡片（破坏暖奶油画布的柔和感）
- 高密度排列（小程序触摸需要舒适间距）

---

## 5. 实施检查清单

- [ ] 确认药丸 CTA 使用珊瑚色 `#cc785c`，不使用 Nike 纯黑 `#111111`
- [ ] 确认卡片圆角为 24rpx（暖奶油画布标准），非 Nike 的 0px
- [ ] 确认产品图片背景为 `#efe9de`（奶油卡片），非 Nike 的 `#f5f5f5`
- [ ] 确认字体为 Georgia 衬线（标题）+ 系统无衬线（正文），非 Helvetica Now
- [ ] 确认 Hero 大标题为 72rpx（rpx 适配），非 Nike 的 96px
- [ ] 确认间距基于 16rpx 基础单位（8px x 2），section 节奏 96rpx
- [ ] 确认促销红 `#d30005` 仅用于价格行文字，不用于背景
- [ ] 确认筛选芯片激活态用暖墨 `#141413`，非 Nike 纯黑
- [ ] 确认 Swatch 圆点尺寸为 24rpx（2x 原版 12px）
- [ ] 确认所有交互元素最小触摸区域 80rpx（40px x 2）
- [ ] 确认无 drop-shadow，保持暖奶油画布的零阴影原则
- [ ] 确认深色面 `#181715` 仅用于特定深色区域，不替换主画布 `#faf9f5`

---

## 6. 参考文件

- 原始设计分析：`.claude/skills/nike-design.md`
- 项目交接文档：`PROJECT_HANDOFF.md`（第 25 节 Claude Design 暖奶油画布规范）
- 当前首页实现：`pages/index/index.wxml` + `pages/index/index.wxss`
- 设计风格参考：`.claude/skills/claude-design.md`
