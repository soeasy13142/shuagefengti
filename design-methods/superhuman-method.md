# Superhuman 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/superhuman-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Superhuman 的设计语言是 **编辑级暗色英雄 + 安静白色正文** 的二元对立。核心理念：
- **三画布系统**：靛蓝海军蓝 Hero (#1b1938) → 白色正文 → 深青色收尾 CTA 带 (#0e3030)
- **每次只有一个 CTA**：营销页面从不堆叠操作，每个区域只有一个圆角矩形按钮
- **亚默认字重是签名**：460 / 540 / 600 而非 400 / 500 / 700，字体的温暖感来自这些中间字重
- **极紧凑行高**：display 层级 0.96 行高，垂直压缩作为编辑密度
- **暖灰非纯黑正文**：`#292827` 是品牌安静的温暖信号

### 1.2 视觉 DNA
- 暗色 Hero + 半身肖像 + 紫罗兰天空大气背景
- 圆角矩形按钮（8px radius），Hero 上用药丸（9999px）
- 深青色收尾带作为页面"解决和弦"
- 功能行交替白色/微暖灰白 (`#fafaf8`)
- 定价层 featured 翻转为靛蓝深色

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| Primary Indigo Navy | `#1b1938` | Hero 画布、填充按钮、Featured 定价层 |
| Indigo Deep | `#0e0c1f` | 按压态、Hero 渐变停靠点 |
| Surface Violet Soft | `#c9b4fa` | Hero 药丸按钮填充 |
| Surface Teal Deep | `#0e3030` | 收尾 CTA 带签名色 |
| Canvas | `#ffffff` | 默认正文背景 |
| Canvas Soft | `#fafaf8` | 交替功能行底色 |
| Ink | `#292827` | 默认正文（暖灰，非纯黑） |
| Ink Mute | `#73706d` | 次要文字、标题 |
| Ink Faint | `#9a9794` | 三级/禁用文字 |
| Hairline | `#e8e4dd` | 1px 边框（微暖灰） |
| On Primary | `#ffffff` | 暗色表面文字 |

### 1.4 字体策略
- **Super Sans VF** 专有变量字体，使用亚默认字重 460 / 540 / 600
- Display 层级负 letter-spacing：-1.32px (48px) → -0.315px (22px)
- 0.96 行高在 48-64px display 上——异常紧凑
- 替代字体：Inter Variable weight 460 / 540 / 600

### 1.5 布局与组件模式
- 间距基数：8px，token 从 2px 到 64px
- 按钮：8px 圆角（圆角矩形），12px 20px padding
- 卡片：12px 圆角，1px hairline 边框
- 收尾带：96-128px 垂直 padding

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **暖灰非纯黑正文**：`#292827` 与暖奶油画布 `#141413` 理念完全一致
- **三画布节奏**（暗 → 亮 → 暗）：可映射为深色 Hero → 暖色正文 → 深色收尾
- **每次只有一个 CTA**：极简操作层级适合学习工具（避免选择困难）
- **交替功能行**：白色/微暖灰白交替适合工具列表
- **0.96 极紧凑行高**：Georgia 标题可借鉴此紧凑感
- **微暖 hairline**：`#e8e4dd` 与暖奶油画布的 `#e0ddd6` 气质一致

### 2.2 需要改造的设计决策
- **靛蓝海军蓝 Hero** → 改造为深色 `#181715` Hero（匹配暖奶油画布深色表面）
- **紫罗兰天空背景** → 改造为暖色渐变或纯色深色背景（小程序渐变能力有限）
- **亚默认字重 460/540/600** → Georgia 不支持变量字重，改用 400 + letter-spacing 模拟紧凑感
- **深青色收尾带** → 改造为深色 `#181715` 收尾带，或用珊瑚 `#cc785c` 作为收尾 CTA
- **圆角矩形按钮 8px** → 改造为 16rpx（介于方形和药丸之间）

### 2.3 不可迁移的设计决策
- **Super Sans VF 变量字体** → 小程序无法加载变量字体
- **紫罗兰大气背景 + 半身肖像** → 学习工具无需人物摄影
- **0.96 行高在小程序中** → 过于紧凑可能导致文字裁剪，建议最低 1.0
- **`font-variation-settings: "wght" 540`** → 小程序不支持

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Superhuman 角色 | 刷个冯题映射 | 色值 | 说明 |
|---|---|---|---|
| Primary (#1b1938) | 深色表面 | `#181715` | Hero、深色卡片 |
| Indigo Deep (#0e0c1f) | 极深色 | `#0f0e0d` | 按压态背景 |
| Violet Soft (#c9b4fa) | 暖色强调 | `#cc785c` | Hero CTA 按钮（改用珊瑚） |
| Teal Deep (#0e3030) | 深色收尾 | `#181715` | 收尾 CTA 带 |
| Canvas (#ffffff) | 暖奶油画布 | `#faf9f5` | 正文背景 |
| Canvas Soft (#fafaf8) | 浅暖灰 | `#f5f3ef` | 交替行底色 |
| Ink (#292827) | 暖墨文字 | `#141413` | 正文 |
| Ink Mute (#73706d) | 次要文字 | `#6c6a64` | 辅助信息 |
| Ink Faint (#9a9794) | 弱文字 | `#9e9c96` | 占位符 |
| Hairline (#e8e4dd) | 分割线 | `#e0ddd6` | 边框 |

### 3.2 字体映射（用 rpx）

| Superhuman 层级 | 刷个冯题映射 | 字号 | 粗细 | 行高 | 字间距 |
|---|---|---|---|---|---|
| display-xxl 64px | Hero 大标题 | 112rpx | 400 | 1.0 | -3rpx |
| display-xl 48px | 区域标题 | 80rpx | 400 | 1.0 | -2rpx |
| display-lg 28px | 子标题 | 48rpx | 400 | 1.14 | -1rpx |
| display-md 22px | 卡片标题 | 40rpx | 400 | 1.1 | -1rpx |
| heading-lg 20px | 紧凑标题 | 36rpx | 400 | 1.2 | 0 |
| body-lg 18px | 引导正文 | 32rpx | 400 | 1.5 | 0 |
| body-md 16px | 默认正文 | 28rpx | 400 | 1.5 | 0 |
| button-md 16px | 按钮标签 | 28rpx | 700 | 1.0 | 0 |
| caption 14px | 辅助说明 | 26rpx | 400 | 1.4 | 0 |

### 3.3 组件设计规范

**主 CTA 圆角矩形按钮**
```css
.btn-superhuman {
  background-color: #181715;
  color: #faf9f5;
  border-radius: 16rpx;
  padding: 24rpx 40rpx;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.0;
  border: none;
}
.btn-superhuman:active {
  background-color: #0f0e0d;
}
```

**Hero 药丸 CTA**
```css
.btn-hero-pill {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 24rpx 40rpx;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.0;
}
```

**深色 Hero 带**
```css
.hero-dark {
  background-color: #181715;
  color: #faf9f5;
  padding: 96rpx 48rpx;
  text-align: center;
}
.hero-dark .hero-title {
  font-family: Georgia, serif;
  font-size: 112rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -3rpx;
  color: #faf9f5;
}
.hero-dark .hero-subtitle {
  font-size: 28rpx;
  color: rgba(250, 249, 245, 0.60);
  margin-top: 24rpx;
}
```

**深色收尾 CTA 带**
```css
.closing-band {
  background-color: #181715;
  color: #faf9f5;
  padding: 128rpx 48rpx;
  text-align: center;
  border-radius: 24rpx;
}
.closing-band .closing-title {
  font-family: Georgia, serif;
  font-size: 48rpx;
  line-height: 1.14;
  letter-spacing: -1rpx;
}
.closing-band .btn-closing {
  background-color: #faf9f5;
  color: #181715;
  border-radius: 16rpx;
  padding: 24rpx 40rpx;
  margin-top: 48rpx;
  font-weight: 700;
}
```

**交替功能行**
```css
.feature-row {
  background-color: #faf9f5;
  padding: 32rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}
.feature-row:nth-child(even) {
  background-color: #f5f3ef;
}
```

### 3.4 页面布局模板

**学习工具详情页（借鉴 Superhuman 三画布节奏）**
```
┌──────────────────────────┐
│ 深色 Hero #181715         │  ← 工具名称 + 简介
│ Georgia 大标题 112rpx     │
│ 珊瑚药丸 CTA             │
│ 暖色背景微光效果（可选）   │
├──────────────────────────┤
│ 暖奶油画布 #faf9f5        │  ← 功能说明区
│ 功能行 1（白色）          │
│ 功能行 2（浅暖灰）        │
│ 功能行 3（白色）          │
├──────────────────────────┤
│ 深色收尾带 #181715        │  ← "开始使用" CTA
│ Georgia 标题 48rpx        │
│ 白色圆角矩形按钮          │
└──────────────────────────┘
```

### 3.5 WXSS 实现示例

```wxss
/* Superhuman 风格的极紧凑标题 */
.title-tight {
  font-family: Georgia, serif;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -3rpx;
}

/* 深色 Hero 带 */
.hero-section {
  background-color: #181715;
  padding: 96rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-section .title {
  font-family: Georgia, serif;
  font-size: 96rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -3rpx;
  color: #faf9f5;
  text-align: center;
}
.hero-section .subtitle {
  font-size: 28rpx;
  color: rgba(250, 249, 245, 0.60);
  margin-top: 24rpx;
  text-align: center;
}

/* 收尾 CTA 带 */
.closing-cta {
  background-color: #181715;
  padding: 128rpx 48rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.closing-cta .title {
  font-family: Georgia, serif;
  font-size: 48rpx;
  line-height: 1.14;
  letter-spacing: -1rpx;
  color: #faf9f5;
  text-align: center;
}
.closing-cta .btn {
  margin-top: 48rpx;
  background-color: #faf9f5;
  color: #181715;
  border-radius: 16rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.0;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具详情/介绍页**：三画布节奏（暗 → 亮 → 暗）创造强烈信息层次
- **学习路径页**：深色 Hero 开头 + 交替功能行 + 深色收尾，引导用户完成整个流程
- **成就/完成页**：深色收尾带的仪式感适合"恭喜完成"场景
- **首页 Hero**：深色 `#181715` Hero + Georgia 大标题 + 珊瑚 CTA

### 4.2 不适合用在哪些页面
- **长列表/题库浏览**：深色带在滚动列表中过于打断节奏
- **设置/配置页**：三画布节奏对简单表单过于隆重
- **频繁交互页**（如做题中）：深色背景长时间阅读可能造成视觉疲劳

### 4.3 混搭建议
- **Superhuman 深色 Hero + 暖奶油画布正文**：Hero 用 `#181715`，正文区用 `#faf9f5`
- **Superhuman 收尾带 + Starbucks 特征带**：两者都是深色中断，可统一为 `#181715`
- **Superhuman 极紧凑行高 + 当前 Georgia 标题**：行高从 1.3 收紧到 1.0-1.1，增强编辑感

---

## 5. 实施检查清单

- [ ] 页面遵循三画布节奏：深色 Hero → 暖色正文 → 深色收尾
- [ ] 深色表面使用 `#181715`，文字使用 `#faf9f5`
- [ ] 每个区域最多一个 CTA 按钮
- [ ] Hero CTA 使用珊瑚药丸，正文区 CTA 使用深色圆角矩形
- [ ] 收尾带使用白色按钮（反转对比）
- [ ] 功能行交替白色/浅暖灰白底色
- [ ] 标题行高收紧到 1.0-1.14
- [ ] 标题 letter-spacing 使用负值（-1rpx 到 -3rpx）
- [ ] 正文使用暖墨 `#141413`，不使用纯黑
- [ ] Hero 副标题使用半透明白色 `rgba(250,249,245,0.60)`

---

## 6. 参考文件
- 原始设计分析：`.claude/skills/superhuman-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
