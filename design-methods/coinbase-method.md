# Coinbase 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/coinbase-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Coinbase 的设计语言是"机构级金融品牌的安静自信"——纯白画布 + 唯一品牌蓝（#0052ff）做所有 CTA，显示字体 weight 400（非 700）传达编辑式冷静而非交易软件的紧迫感。页面节奏在白色编辑区、灰色提升带和深色产品 Hero 之间交替。Pill 形状是所有交互元素的统一几何语言。

### 1.2 视觉 DNA
- 纯白画布 + 灰色提升带交替
- 唯一品牌蓝 #0052ff 用于所有 CTA
- 显示字体 weight 400，编辑式冷静
- Pill 形状贯穿所有 CTA、搜索框、标签
- 深色 Hero 带 + 浮动产品 UI 卡片层叠
- 柔和阴影，极浅（0 4px 12px rgba(0,0,0,0.04)）
- 大圆角：卡片 24px，按钮 pill（100px）
- 96px section 节奏

### 1.3 色彩策略
- 画布：#ffffff
- 灰色提升：#f7f7f7、#eef0f3
- 品牌蓝/CTA：#0052ff
- 深色 Hero：#0a0b0d
- 文字：#0a0b0d（标题）、#5b616e（正文）、#7c828a（次要）
- 语义色：上涨 #05b169、下跌 #cf202f

### 1.4 字体策略
- 显示：CoinbaseDisplay，80/64/52/44/36px，weight 400
- 正文：CoinbaseSans，16/14px，weight 400/600
- 数字：CoinbaseMono，18px，weight 500
- 按钮：16px，weight 600

### 1.5 布局与组件模式
- 圆角：卡片 24px，按钮 pill（100px），输入框 12px
- 间距：4px 基数，section 96px
- 按钮高度 44px
- 搜索框 pill 形状
- 资产图标：32px 圆形

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **Pill 形状交互元素**：所有按钮、搜索框、标签统一 pill 形状，非常适合学习工具的友好感
- **白色画布 + 灰色提升带交替**：与暖奶油体系兼容，灰色带改为暖灰色
- **显示字体 weight 400**：与本项目的 Georgia 400 完全一致
- **大圆角卡片（24px）**：与本项目的 24rpx 卡片圆角匹配
- **语义色仅用于文字**：上涨/下跌色只做文字不做背景，适合正确/错误标记
- **深色 Hero + 浮动卡片层叠**：可用于首页重点功能展示

### 2.2 需要改造的设计决策
- **品牌蓝 #0052ff**：改为珊瑚色 #cc785c 保持暖调一致性
- **纯白画布**：改为暖白 #faf9f5
- **灰色提升带 #f7f7f7**：改为暖灰 #f5f0e8
- **深色 Hero #0a0b0d**：改为暖深色 #181715
- **pill 圆角 100px**：微信小程序中 pill 圆角用 9999rpx
- **按钮 16px weight 600**：本项目按钮用 26rpx weight 600

### 2.3 不可迁移的设计决策
- **CoinbaseDisplay/CoinbaseSans 自定义字体**：微信小程序不支持，用 Georgia + 系统 sans-serif
- **CoinbaseMono 等宽数字字体**：用系统等宽字体替代
- **1280px 最大宽度**：小程序全屏设计
- **6 列 Footer**：小程序无传统 footer

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #ffffff | #faf9f5 | 暖白 |
| Surface Soft（灰色带） | #f7f7f7 | #f5f0e8 | 暖灰提升带 |
| Surface Strong | #eef0f3 | #efe9de | 奶油卡片 |
| Primary（CTA） | #0052ff | #cc785c | 珊瑚色 |
| Primary Active | #003ecc | #a9583e | 深珊瑚 |
| Surface Dark（Hero） | #0a0b0d | #181715 | 暖深色 |
| Surface Dark Elevated | #16181c | #252320 | 浮动深色卡 |
| Ink（标题） | #0a0b0d | #141413 | 暖墨 |
| Body（正文） | #5b616e | #6c6a64 | 暖灰 |
| Muted（次要） | #7c828a | #9a9890 | |
| Semantic Up | #05b169 | #22c55e | 正确标记 |
| Semantic Down | #cf202f | #ef4444 | 错误标记 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 80px/400/-2px | 72rpx/400/-3rpx | Georgia 衬线 |
| Section 标题 | 52px/400/-1.3px | 48rpx/400/-2rpx | |
| Sub 标题 | 44px/400/-1px | 36rpx/400/-1rpx | |
| 卡片标题 | 18px/600 | 32rpx/600 | |
| 正文 | 16px/400 | 28rpx/400 | |
| 数字 | 18px/500 mono | 28rpx/500 | 系统等宽 |
| 按钮 | 16px/600 | 28rpx/600 | |

### 3.3 组件设计规范

**Pill CTA 按钮**
- 背景：#cc785c
- 文字：#faf9f5
- 圆角：9999rpx（pill）
- 高度：88rpx
- 内边距：24rpx × 40rpx
- 字号：28rpx，weight 600

**Pill 搜索框**
- 背景：#efe9de
- 文字：#141413
- 圆角：9999rpx
- 高度：88rpx
- 内边距：24rpx × 40rpx

**Pill 标签（Badge）**
- 背景：#efe9de
- 文字：#141413
- 圆角：9999rpx
- 内边距：8rpx × 24rpx
- 字号：24rpx，weight 600

**功能卡片**
- 背景：#faf9f5（白色画布上）或 #efe9de（灰色带上）
- 圆角：48rpx（原方案 24px × 2）
- 内边距：48rpx
- 1rpx #e5dfd4 边框可选

**深色 Hero 区**
- 背景：#181715
- 文字：#faf9f5
- 内边距：96rpx 上下
- 包含：浮动产品 UI 卡片层叠

**浮动深色卡片（产品 UI 模拟）**
- 背景：#252320
- 圆角：48rpx
- 内边距：48rpx
- 可层叠 2-3 张，轻微旋转

### 3.4 页面布局模板

**深色 Hero 区（首页重点）**
- 背景 #181715，上下 96rpx
- 左侧：大标题 + 副标题 + CTA
- 右侧：2-3 张浮动深色卡片层叠（模拟产品 UI）
- 移动端：卡片堆叠在标题下方

**灰色提升带**
- 背景 #f5f0e8
- 包含：3 列功能卡片
- 卡片间距 24rpx

**白色编辑区**
- 背景 #faf9f5
- 包含：数据展示、文字内容
- section 间距 64rpx

### 3.5 WXSS 实现示例

**Pill CTA 按钮**

```css
.btn-pill {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
}
.btn-pill:active {
  background-color: #a9583e;
}
.btn-pill--large {
  height: 112rpx;
  line-height: 112rpx;
  padding: 0 64rpx;
  font-size: 32rpx;
}
```

**Pill 搜索框**

```css
.search-pill {
  background-color: #efe9de;
  border-radius: 9999rpx;
  height: 88rpx;
  padding: 0 40rpx;
  font-size: 28rpx;
  color: #141413;
  display: flex;
  align-items: center;
}
```

**深色 Hero + 浮动卡片**

```css
.hero-dark {
  background-color: #181715;
  padding: 96rpx 48rpx;
  color: #faf9f5;
}
.hero-dark__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 72rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  line-height: 1.1;
}
.floating-card {
  background-color: #252320;
  border-radius: 48rpx;
  padding: 48rpx;
  margin-top: 48rpx;
}
.floating-card--offset {
  transform: rotate(-2deg);
  margin-top: -24rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页**：深色 Hero + 浮动卡片层叠可作为首页重点展示区
- **搜索功能**：Pill 搜索框非常适合题目搜索
- **学习数据页**：数字展示 + 语义色（正确/错误）标记
- **工具导航**：Pill 标签 + 功能卡片的组合

### 4.2 不适合用在哪些页面
- **错题本列表**：Coinbase 的机构风格过于冷静，错题本需要更温暖的回顾感
- **设置页**：Pill 按钮在设置表单中不够紧凑

### 4.3 混搭建议
- **保留暖奶油画布**作为白色编辑区背景
- **深色 Hero 区**用于首页重点功能展示，与暖奶油形成对比
- **Pill 形状**统一用于所有交互元素（按钮、搜索框、标签）
- **灰色提升带**用暖灰 #f5f0e8 替代冷灰
- **数字展示**借鉴 Coinbase 的等宽数字风格

---

## 5. 实施检查清单

- [ ] 所有 CTA 按钮使用 pill 形状（9999rpx 圆角）
- [ ] 搜索框使用 pill 形状
- [ ] 标签使用 pill 形状
- [ ] 深色 Hero 使用 #181715，不使用纯黑
- [ ] 灰色提升带使用暖灰 #f5f0e8
- [ ] 浮动卡片使用 #252320，圆角 48rpx
- [ ] 语义色仅用于文字（正确绿、错误红），不做背景
- [ ] 数字展示使用等宽字体 + 500 weight
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/coinbase-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
