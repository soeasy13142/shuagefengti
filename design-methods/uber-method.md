# Uber 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/uber-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Uber 的设计语言是 **黑白二重奏 + 药丸签名形状**。核心理念：
- **双色 CTA 层级**：黑色药丸用于主转化，白色药丸用于次级，灰色药丸用于三级/标签
- **药丸是唯一签名形状**：`rounded.pill` 999px 应用于每个交互元素（按钮、标签、徽章）
- **Sentence-case 是声音**：无全大写标题，仅极少数眉毛标签用 UPPERCASE
- **无装饰系统**：无渐变、无大气背景，只有编辑级 4:3 插画
- **黑白交替带节奏**：白色功能卡 → 黑色促销带 → 白色功能卡 → 黑色页脚
- **编辑级 4:3 插画**是唯一的装饰系统

### 1.2 视觉 DNA
- 黑色药丸按钮（999px radius）——品牌的几何签名
- 16px 圆角卡片
- 黑白交替带节奏（白色 → 黑色 → 白色 → 黑色页脚）
- 编辑级 4:3 插画（骑手、司机、城市物体）
- 无阴影、无渐变、无装饰背景
- UberMove weight 700 标题 + UberMoveText 400/500 正文

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| Ink Black (primary) | `#000000` | 唯一转化色、页脚、深色带 |
| On Primary | `#ffffff` | 深色表面文字 |
| Canvas | `#ffffff` | 默认页面背景 |
| Canvas Soft | `#efefef` | 标签、表单输入、次级按钮 |
| Canvas Softer | `#f3f3f3` | 嵌套输入填充 |
| Surface Pressed | `#e2e2e2` | 按压态 |
| Ink | `#000000` | 标题/正文 |
| Body | `#5e5e5e` | 次要文字 |
| Mute | `#afafaf` | 占位符、低优先级 |
| Link | `#0000ee` | 法律/页脚内联链接 |

### 1.4 字体策略
- **UberMove**：专有几何 display sans，仅 weight 700，无 letter-spacing
- **UberMoveText**：专有 text sans，weight 400/500
- Sentence-case 是声音，无全大写 display
- 替代字体：Inter 700 (display) + Inter 400/500 (text)

### 1.5 布局与组件模式
- 间距基数：4px，token 从 4px 到 32px
- 按钮：999px 药丸（签名形状）
- 卡片：16px 圆角
- 层级阴影：Level 0 平坦（默认）→ Level 1 微阴影 → Level 2 卡片阴影 → Level 3 浮动药丸阴影

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **药丸签名形状**：999px 药丸与当前暖奶油画布的 48rpx 药丸按钮一致
- **双色 CTA 层级**：珊瑚药丸（主）+ 白色药丸（次）+ 浅灰药丸（三级/标签）
- **16px 圆角卡片**：与当前 24rpx 接近，可选择性采用
- **Sentence-case 声音**：与当前 Georgia 标题的小写自信一致
- **黑白交替带节奏**：可映射为暖色/深色交替
- **无装饰系统**：与暖奶油画布的克制一致
- **Level 0 平坦默认**：零阴影偏好一致

### 2.2 需要改造的设计决策
- **黑色 CTA** → 改造为珊瑚 `#cc785c`
- **黑色促销带/页脚** → 改造为深色 `#181715`
- **`#efefef` 浅灰标签** → 改造为 `#efe9de` 奶油色（匹配暖奶油画布）
- **UberMove weight 700 标题** → Georgia 400 + 更大字号模拟重量感
- **编辑级 4:3 插画** → 学习工具可用图标/emoji 替代
- **ride-request 表单卡** → 改造为"快速开始学习"表单卡

### 2.3 不可迁移的设计决策
- **UberMove / UberMoveText 专有字体** → 保持 Georgia + 系统字体
- **`#0000ee` 浏览器默认链接蓝** → 小程序中链接用珊瑚色
- **ride-request 地图集成** → 学习工具无需地图
- **全屏汉堡菜单** → 小程序有 tabBar

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Uber 角色 | 刷个冯题映射 | 色值 | 说明 |
|---|---|---|---|
| Ink Black (#000000) | 珊瑚 CTA | `#cc785c` | 主按钮 |
| Canvas (#ffffff) | 暖奶油画布 | `#faf9f5` | 页面背景 |
| Canvas Soft (#efefef) | 奶油标签 | `#efe9de` | 标签、次级按钮 |
| Canvas Softer (#f3f3f3) | 浅奶油 | `#f5f3ef` | 嵌套输入 |
| Surface Pressed (#e2e2e2) | 按压灰 | `#e0ddd6` | 按压态 |
| Ink (#000000) | 暖墨文字 | `#141413` | 正文 |
| Body (#5e5e5e) | 次要文字 | `#6c6a64` | 辅助信息 |
| Mute (#afafaf) | 弱文字 | `#9e9c96` | 占位符 |
| On Dark (#ffffff) | 深色文字 | `#faf9f5` | 深色表面文字 |
| Black Elevated (#282828) | 深色表面 | `#181715` | 促销带、页脚 |

### 3.2 字体映射（用 rpx）

| Uber 层级 | 刷个冯题映射 | 字号 | 粗细 | 行高 | 字间距 |
|---|---|---|---|---|---|
| display-xxl 52px | Hero 大标题 | 88rpx | 400 | 1.23 | 0 |
| display-xl 36px | 区域标题 | 64rpx | 400 | 1.22 | 0 |
| display-lg 32px | 促销卡标题 | 56rpx | 400 | 1.25 | 0 |
| display-md 24px | 卡片标题 | 40rpx | 400 | 1.33 | 0 |
| display-sm 20px | 子标题 | 36rpx | 400 | 1.4 | 0 |
| body-lg 18px | 引导正文 | 32rpx | 500 | 1.33 | 0 |
| body-md 16px | 默认正文 | 28rpx | 400 | 1.5 | 0 |
| body-sm 14px | 辅助正文 | 26rpx | 400 | 1.43 | 0 |
| caption 12px | 细节文字 | 22rpx | 400 | 1.67 | 0 |
| button-md 16px | 按钮标签 | 28rpx | 500 | 1.25 | 0 |

### 3.3 组件设计规范

**主 CTA 药丸（珊瑚版）**
```css
.btn-uber-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 24rpx 24rpx;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;
  border: none;
}
.btn-uber-primary:active {
  background-color: #a9583e;
}
```

**次级白色药丸**
```css
.btn-uber-secondary {
  background-color: #faf9f5;
  color: #141413;
  border-radius: 9999rpx;
  padding: 24rpx 24rpx;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;
  border: none;
}
```

**三级灰色药丸/标签**
```css
.btn-uber-subtle {
  background-color: #efe9de;
  color: #141413;
  border-radius: 9999rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 500;
}
```

**内容卡片（16px 圆角）**
```css
.card-uber {
  background-color: #faf9f5;
  border-radius: 32rpx;
  padding: 48rpx;
}
.card-uber-elevated {
  background-color: #faf9f5;
  border-radius: 32rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12);
}
```

**黑色促销带**
```css
.promo-dark {
  background-color: #181715;
  color: #faf9f5;
  padding: 48rpx;
  border-radius: 32rpx;
}
.promo-dark .promo-title {
  font-family: Georgia, serif;
  font-size: 40rpx;
  font-weight: 400;
  line-height: 1.33;
  color: #faf9f5;
}
.promo-dark .btn-promo {
  background-color: #faf9f5;
  color: #181715;
  border-radius: 9999rpx;
  padding: 24rpx 24rpx;
  font-size: 28rpx;
  font-weight: 500;
  margin-top: 32rpx;
}
```

**快速开始表单卡（类 ride-request）**
```css
.quickstart-card {
  background-color: #faf9f5;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.16);
}
.quickstart-input {
  background-color: #efe9de;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}
.quickstart-input .input-icon {
  margin-right: 16rpx;
}
.quickstart-input .input-label {
  font-size: 28rpx;
  font-weight: 400;
  color: #6c6a64;
}
```

**分类标签行**
```css
.category-row {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding: 16rpx 0;
}
.category-chip {
  background-color: #efe9de;
  color: #141413;
  border-radius: 9999rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  white-space: nowrap;
}
```

### 3.4 页面布局模板

**首页（借鉴 Uber 黑白交替节奏）**
```
┌──────────────────────────┐
│ 暖奶油画布 #faf9f5        │  ← Hero 区
│ Georgia 大标题 88rpx      │
│ ┌────────────────────┐   │
│ │ 快速开始表单卡      │   │  ← 浮动卡片 + 阴影
│ │ [选择科目]          │   │
│ │ [选择难度]          │   │
│ │ [开始学习] 珊瑚药丸  │   │
│ └────────────────────┘   │
├──────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐    │  ← 分类标签行
│ │TCP │ │UDP │ │HTTP│    │
│ └────┘ └────┘ └────┘    │
├──────────────────────────┤
│ 深色促销带 #181715        │  ← 推荐工具
│ 标题 + 描述 + 白色药丸    │
├──────────────────────────┤
│ 暖奶油画布 #faf9f5        │  ← 功能卡片区
│ ┌──────────┐ ┌──────────┐│
│ │ 功能卡 1  │ │ 功能卡 2  ││
│ │ 编辑插画  │ │ 编辑插画  ││
│ └──────────┘ └──────────┘│
├──────────────────────────┤
│ 深色页脚 #181715          │
│ "刷个冯题" + 链接         │
└──────────────────────────┘
```

### 3.5 WXSS 实现示例

```wxss
/* Uber 风格的快速开始表单 */
.quickstart {
  background-color: #faf9f5;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.16);
}
.quickstart .input-row {
  background-color: #efe9de;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}
.quickstart .input-row .icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}
.quickstart .input-row .text {
  font-size: 28rpx;
  color: #6c6a64;
}
.quickstart .btn-go {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 28rpx;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
  margin-top: 8rpx;
}

/* Uber 风格的黑白交替促销带 */
.promo-band {
  background-color: #181715;
  color: #faf9f5;
  padding: 48rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
}
.promo-band .content {
  flex: 1;
}
.promo-band .title {
  font-family: Georgia, serif;
  font-size: 40rpx;
  line-height: 1.33;
  color: #faf9f5;
  margin-bottom: 16rpx;
}
.promo-band .desc {
  font-size: 28rpx;
  color: rgba(250, 249, 245, 0.70);
}
.promo-band .btn-white {
  background-color: #faf9f5;
  color: #181715;
  border-radius: 9999rpx;
  padding: 24rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}

/* Uber 风格的编辑插画卡片 */
.feature-card {
  background-color: #faf9f5;
  border-radius: 32rpx;
  padding: 48rpx;
  margin-bottom: 24rpx;
}
.feature-card .illustration {
  width: 100%;
  height: 320rpx;
  background-color: #efe9de;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
}
.feature-card .title {
  font-family: Georgia, serif;
  font-size: 40rpx;
  line-height: 1.33;
  margin-bottom: 12rpx;
}
.feature-card .desc {
  font-size: 28rpx;
  color: #6c6a64;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页**：快速开始表单卡 + 分类标签行 + 黑白交替带的节奏
- **工具导航页**：药丸标签行水平滚动选择工具类别
- **推荐/精选页**：黑色促销带打断白色节奏，突出推荐工具
- **页脚**：深色 `#181715` 页脚 + 白色链接

### 4.2 不适合用在哪些页面
- **做题/答题页**：药丸标签在密集答题中过于占据空间
- **数据密集页**（错题统计）：Uber 的极简风格无法承载复杂数据
- **纯文本阅读页**：药丸按钮的圆润感在长阅读中过于活泼

### 4.3 混搭建议
- **Uber 药丸按钮 + 暖奶油画布卡片**：按钮用 Uber 的 9999rpx 药丸，卡片用暖色
- **Uber 黑白交替 + Starbucks 深色带**：统一深色为 `#181715`
- **Uber 快速开始表单 + Together AI 等宽眉毛**：表单结构用 Uber，标签用等宽 UPPERCASE
- **Uber 分类标签行 + The Verge 正确/错误色块**：标签用药丸，反应用薄荷/紫

---

## 5. 实施检查清单

- [ ] 所有交互元素使用 9999rpx 药丸圆角（按钮、标签、徽章）
- [ ] 卡片使用 32rpx 圆角
- [ ] 主 CTA 使用珊瑚色药丸，次级用白色药丸，三级用奶油灰药丸
- [ ] 黑色促销带使用 `#181715` + 白色文字 + 白色药丸按钮
- [ ] 深色页脚使用 `#181715`
- [ ] 标题使用 Georgia sentence-case（无全大写）
- [ ] 标题不使用 letter-spacing（保持默认 tracking）
- [ ] 仅在必要时使用 Level 1-3 阴影（默认 Level 0 平坦）
- [ ] 分类标签行支持水平滚动
- [ ] 快速开始表单卡使用阴影提升层级

---

## 6. 参考文件
- 原始设计分析：`.claude/skills/uber-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
