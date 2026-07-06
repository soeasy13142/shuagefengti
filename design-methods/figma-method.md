# Figma 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/figma-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Figma 的设计语言是"黑白编辑框架 + 超大粉彩色块"的对比美学。严格的单色 chrome（黑色 CTA、白色背景、pill 按钮）与页面中突然出现的饱和粉彩色块（石灰、薰衣草、奶油、薄荷、粉色）形成戏剧性对比——像设计师在干净桌面上贴巨型便利贴。结果是既技术又快乐的系统。

### 1.2 视觉 DNA
- 单色 chrome：纯黑 + 纯白承载所有 CTA、正文、页脚
- 粉彩色块段落：lime #dceeb1、lilac #c5b0f4、cream #f4ecd6、mint #c8e6cd、pink #efd4d4、coral #f3c9b6、navy #1f1d3d
- Pill 是唯一按钮形状——所有 CTA 都是 pill
- figmaSans 变量字体——极细 weight 增量（320/330/340/450/480/540）
- 负 letter-spacing 随尺寸缩放：86px 时 -1.72px
- figmaMono 用于分类标签——全大写 + 正 tracking
- 粉彩色块即深度设备——替代传统阴影
- 白色画布在粉彩色块之间回归——每个色块都像刻意放置

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 主色 | #000000 | 纯黑，所有主 CTA |
| 画布 | #ffffff | 纯白页面底色 |
| 反色画布 | #000000 | 页脚、跑马灯 |
| 表面柔 | #f7f7f5 | 图标按钮、模板卡 |
| 石灰块 | #dceeb1 | 系统/FAQ/联系表单 |
| 薰衣草块 | #c5b0f4 | 设计页 Hero、Release Notes |
| 奶油块 | #f4ecd6 | FigJam Hero、模板网格 |
| 薄荷块 | #c8e6cd | FigJam 段落 |
| 粉色块 | #efd4d4 | FigJam 段落 |
| 珊瑚块 | #f3c9b6 | 首页"Ship products"段落 |
| 深蓝块 | #1f1d3d | 深色叙事段落 |
| 洋红强调 | #ff3d8b | 促销 CTA（极克制） |
| 发丝线 | #e6e6e6 | 1px 分割线 |

### 1.4 字体策略
- 字体族：figmaSans（专有变量字体），替代：Inter / Geist
- Display weight：340（极细！）——这是品牌签名
- Body weight：320-330（极细正文）
- Headline weight：540
- Card title weight：700
- 负 letter-spacing：86px 时 -1.72px，64px 时 -0.96px
- figmaMono：仅用于 eyebrow 和 caption，全大写 + 正 tracking

### 1.5 布局与组件模式
- 间距基准：8px，Token 1/4/8/12/16/24/32/48/96
- 段落间距：96px
- 圆角：CTA pill 50px、卡片 24px、输入框 8px
- 阴影：几乎无阴影——粉彩色块替代深度
- 最大内容宽度：~1280px
- 网格：3-4 列，粉彩色块突破列网格

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

**1. 粉彩色块段落概念**
Figma 用饱和粉彩色块作为叙事容器的理念非常适合本项目——可以用不同颜色的功能区块来区分不同的学习模块（如"数据结构"用石灰块、"算法"用薰衣草块）。

**2. 权重而非大小承载层级**
Figma 用 weight 320 vs 480 来区分正文和链接（同尺寸），这个策略可以用在本项目：通过 font-weight 变化而非 font-size 变化来表达强调。

**3. 单色 chrome + 彩色内容区**
黑白按钮 + 彩色内容区的对比策略可以直接应用：珊瑚色 CTA 保持单色，功能区用暖色调粉彩块。

**4. Pill 按钮形状**
Figma 的 pill 按钮（50px 圆角）可以用于本项目的关键 CTA，增加亲和力。

### 2.2 需要改造的设计决策

**1. 纯白画布 → 暖奶油画布**
- 原方案：纯白 #ffffff
- 本项目：#faf9f5 暖奶油
- 改造：保留"画布在色块之间回归"的节奏，但画布色用暖奶油。

**2. 纯黑 CTA → 珊瑚色 CTA**
- 原方案：#000000 纯黑 pill
- 本项目：#cc785c 珊瑚色
- 改造：保留 pill 形状，但颜色换成珊瑚色。

**3. figmaSans 极细 weight → Georgia + 系统无衬线**
- 原方案：figmaSans 320-340 极细 weight
- 本项目：Georgia 400 标题 + 系统无衬线正文
- 改造：Georgia 本身就是中等 weight，无法做到 320 的极细感。但可以借鉴"weight 变化承载层级"的策略。

**4. 冷调粉彩 → 暖调粉彩**
- 原方案：lime #dceeb1、lilac #c5b0f4 等冷调粉彩
- 本项目：需要暖调粉彩以匹配暖奶油画布
- 改造：将粉彩色块调整为暖色调版本。

### 2.3 不可迁移的设计决策

**1. figmaSans / figmaMono 专有字体**
不可引入，使用 Georgia + 系统字体替代。

**2. 纯黑 + 纯白单色 chrome**
暖奶油画布不允许纯黑按钮，必须使用珊瑚色。

**3. 86px 极大 Display 字号**
微信小程序屏幕有限，64rpx 已是合理上限。

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas 画布 | #ffffff | #faf9f5 | 暖奶油画布 |
| Primary CTA | #000000 | #cc785c | 珊瑚色 CTA |
| Surface Soft | #f7f7f5 | #efe9de | 奶油卡片 |
| Hairline 发丝线 | #e6e6e6 | #e8e2d6 | 暖调发丝线 |
| Block Lime 石灰 | #dceeb1 | #e8dfc4 | 暖调石灰（替代） |
| Block Lilac 薰衣草 | #c5b0f4 | #d4c4b8 | 暖调薰衣草（替代） |
| Block Cream 奶油 | #f4ecd6 | #efe9de | 暖奶油（近似） |
| Block Mint 薄荷 | #c8e6cd | #d6dcc4 | 暖调薄荷（替代） |
| Block Pink 粉色 | #efd4d4 | #e8d4c8 | 暖调粉色（替代） |
| Block Coral 珊瑚 | #f3c9b6 | #e8c8b8 | 暖调珊瑚（替代） |
| Block Navy 深蓝 | #1f1d3d | #181715 | 深海军蓝 |
| Accent Magenta | #ff3d8b | #cc785c | 用珊瑚色替代 |
| Ink 文字 | #000000 | #141413 | 暖墨文字 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 | 说明 |
|---|---|---|---|
| Display XL | figmaSans 86px/340/-1.72px | Georgia 64rpx/400/-3rpx | 衬线标题 |
| Display LG | figmaSans 64px/340/-0.96px | Georgia 48rpx/400/-3rpx | 节段标题 |
| Headline | figmaSans 26px/540/-0.26px | Georgia 36rpx/400/-2rpx | 叙事块标题 |
| Subhead | figmaSans 26px/340/-0.26px | 系统无衬线 32rpx/400/0 | 长文引导段 |
| Card Title | figmaSans 24px/700/0 | Georgia 32rpx/400/-2rpx | 卡片标题 |
| Body | figmaSans 18px/320/-0.26px | 系统无衬线 28rpx/400/0 | 默认正文 |
| Body SM | figmaSans 16px/330/-0.14px | 系统无衬线 24rpx/400/0 | 小正文 |
| Button | figmaSans 20px/480/-0.10px | 系统无衬线 28rpx/500/0 | 按钮标签 |
| Eyebrow | figmaMono 18px/400/0.54px | 系统无衬线 24rpx/600/2rpx | 分类标签（大写） |
| Caption | figmaMono 12px/400/0.60px | 系统无衬线 22rpx/400/0 | 说明文字 |

### 3.3 组件设计规范

**Pill CTA 按钮**
```css
.btn-pill {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}
```

**粉彩色块段落**
```css
.color-block {
  border-radius: 48rpx;
  padding: 96rpx 48rpx;
  margin: 0 -48rpx; /* 突破内容边距 */
}

.color-block--warm-cream {
  background: #efe9de;
}

.color-block--warm-sand {
  background: #e8dfc4;
}

.color-block--warm-rose {
  background: #e8d4c8;
}

.color-block--dark {
  background: #181715;
  color: #faf9f5;
}
```

**分类标签（Eyebrow）**
```css
.eyebrow {
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-transform: uppercase;
  color: #6c6a64;
}
```

**功能卡（在色块内）**
```css
.card-in-block {
  background: rgba(250, 249, 245, 0.6); /* 半透明白 */
  border-radius: 24rpx;
  padding: 32rpx;
}
```

### 3.4 页面布局模板

**首页节奏（借鉴 Figma 的色块交替）**
```
白色 Hero 区（暖奶油）
  ↓ 96rpx 间距
暖色功能卡片区（#efe9de 色块）
  ↓ 96rpx 间距 回归暖奶油画布
学习模块区（#e8dfc4 暖砂色块）
  ↓ 96rpx 间距 回归暖奶油画布
成就展示区（#181715 深色块）
  ↓ 96rpx 间距 回归暖奶油画布
底部操作区
```

**色块段落内部布局**
- 标题：Georgia 36rpx / 400 / -2rpx
- 分类标签：系统无衬线 24rpx / 600 / 大写 / #6c6a64
- 正文：系统无衬线 28rpx / 400 / 0
- 色块内边距：96rpx 上下，48rpx 左右

### 3.5 WXSS 实现示例

**色块段落**
```css
.color-section {
  border-radius: 48rpx;
  padding: 96rpx 48rpx;
  position: relative;
}

.color-section--cream {
  background: #efe9de;
}

.color-section--sand {
  background: #e8dfc4;
}

.color-section--dark {
  background: #181715;
}

.color-section__eyebrow {
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-transform: uppercase;
  color: #6c6a64;
  margin-bottom: 16rpx;
}

.color-section__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 36rpx;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -2rpx;
  color: #141413;
  margin-bottom: 24rpx;
}

.color-section--dark .color-section__title {
  color: #faf9f5;
}

.color-section--dark .color-section__eyebrow {
  color: #9c9a94;
}
```

**Pill 按钮**
```css
.btn-pill-primary {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
}

.btn-pill-secondary {
  background: #efe9de;
  color: #141413;
  border-radius: 9999rpx;
  padding: 16rpx 36rpx;
  font-size: 28rpx;
  font-weight: 500;
  height: 80rpx;
}
```

**白色画布回归间距**
```css
.canvas-return {
  padding-top: 96rpx;
  padding-bottom: 96rpx;
  background: #faf9f5;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页**：Figma 的色块交替节奏非常适合首页的模块化布局
- **学习模块列表页**：不同模块可以用不同暖调色块区分
- **工具分类页**：色块段落可作为分类容器

### 4.2 不适合用在哪些页面
- **做题页**：需要专注，色块会分散注意力
- **设置页**：过于装饰性，设置页需要简洁
- **详情页**：色块段落适合概览，不适合详情展开

### 4.3 混搭建议
- 色块段落仅用于页面的 2-3 个关键区域，不要铺满
- 每个色块之间必须回归暖奶油画布（96rpx 间距）
- 深色块（#181715）每页最多 1 个
- Pill 按钮可用于首页主 CTA，其他页面用 16rpx 圆角按钮
- 暖调色块建议：#efe9de（奶油）、#e8dfc4（暖砂）、#e8d4c8（暖玫瑰）

---

## 5. 实施检查清单

- [ ] 色块使用暖色调版本，不使用 Figma 原始冷调粉彩
- [ ] 每个色块之间必须回归暖奶油画布 #faf9f5
- [ ] CTA 使用珊瑚色 pill，不使用纯黑 pill
- [ ] 深色块每页最多 1 个
- [ ] 分类标签使用大写 + 2rpx tracking
- [ ] 色块圆角 48rpx，卡片圆角 24rpx
- [ ] 不引入 figmaSans / figmaMono
- [ ] 标题使用 Georgia 衬线
- [ ] 间距使用 rpx 单位，基于 8rpx 倍数

---

## 6. 参考文件

- 原方案：.claude/skills/figma-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
