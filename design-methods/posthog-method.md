# PostHog 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/posthog-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

PostHog 的设计哲学是 **"友好的工程速写本"**。严肃的开源产品分析平台，渲染得像一本友好的工程速写本：暖奶油画布上散布着手绘刺猬吉祥物，IBM Plex Sans 字体在紧凑的 1.43 行高中排列，唯一的饱和色——黄橙色 `#f7a501` 药丸——承载所有主操作。

核心原则：
- 暖奶油画布端到端：`#eeefe9`，无白/黑交替
- 单一黄橙 CTA：`#f7a501`，品牌唯一饱和色
- 手绘吉祥物系统：刺猬角色是整个装饰系统
- 4-8px 圆角卡片词汇：6px 为主，8px 为辅
- 柔和彩色标注带：蓝/绿/红/紫四色用于文档提示
- IBM Plex Sans Variable：400/500/600/700/800 五档重量

### 1.2 视觉 DNA

- **暖奶油画布** `#eeefe9`：比暖奶油画布 `#faf9f5` 更灰
- **黄橙 CTA** `#f7a501`：品牌唯一饱和色
- **深橄榄墨水** `#23251d`：比纯黑更暖
- **6px 圆角**：组件默认
- **白卡片** `#ffffff`：在奶油画布上的标准卡片
- **柔和彩色标注**：蓝 `#dceaf6` / 绿 `#d9eddf` / 红 `#f7d6d3` / 紫 `#e7d8ee`
- **手绘刺猬**：平面彩色插图，非照片

### 1.3 色彩策略

| 用途 | 色值 | 与暖奶油画布差异 |
|---|---|---|
| 画布 | `#eeefe9`（暖灰奶油） | 比 `#faf9f5` 灰得多 |
| 卡片 | `#ffffff`（纯白） | 与 `#efe9de` 不同，纯白卡片 |
| 文档卡片 | `#fcfcfa`（微暖白） | 接近 `#faf9f5` |
| 深色表面 | `#23251d`（深橄榄） | 比 `#181715` 更绿 |
| 墨水 | `#23251d`（深橄榄） | 比 `#141413` 更绿 |
| 正文 | `#4d4f46`（橄榄灰） | 比 `#6c6a64` 更深 |
| 柔和 | `#6c6e63`（橄榄灰） | 接近 `#6c6a64` |
| 黄橙 CTA | `#f7a501` | 完全不同于珊瑚色 |
| 柔和蓝 | `#dceaf6` | 无直接对应 |
| 柔和绿 | `#d9eddf` | 无直接对应 |
| 柔和红 | `#f7d6d3` | 无直接对应 |
| 柔和紫 | `#e7d8ee` | 无直接对应 |

### 1.4 字体策略

IBM Plex Sans Variable，五档重量：
- **800**：display 标题 24px / -0.6px 字间距
- **700**：标题 36px/21px/20px/18px、按钮 14px
- **600**：正文强调 16px/15px、标签 12px
- **500**：正文 14px、标签 13px
- **400**：正文 16px/15px、链接 16px

行高：1.33-1.71 不等。大写转换用于章节眉毛。

### 1.5 布局与组件模式

- **80px 章节间距**：比 96px 稍紧凑
- **6px 圆角**：组件默认，8px 用于大容器
- **全圆角药丸**：仅用于粘性 CTA 和芯片
- **16px 内边距**：标准卡片
- **24px 内边距**：产品卡片
- **32px 内边距**：定价卡片
- **1px 发丝边框**：`#bfc1b7` 分割
- **240px 文档侧边栏**：桌面端固定

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **暖奶油画布**：PostHog 的 `#eeefe9` 与暖奶油画布 `#faf9f5` 理念一致（都是暖色画布）
2. **单一饱和 CTA**：黄橙色仅用于 CTA 的策略，完美对应珊瑚色 CTA
3. **白卡片在奶油画布上**：卡片层次表达方式可直接迁移
4. **柔和彩色标注系统**：蓝/绿/红/紫四色提示，非常适合学习应用的状态提示
5. **6-8px 圆角卡片**：比 24rpx 更紧凑，但精神一致
6. **80px 章节间距**：紧凑但有节奏

### 2.2 需要改造的设计决策

1. **黄橙 CTA → 珊瑚色**：`#f7a501` 需替换为 `#cc785c`
2. **暖灰画布 → 暖奶油**：`#eeefe9` 比 `#faf9f5` 灰，需调亮
3. **深橄榄墨水 → 暖墨**：`#23251d` 需替换为 `#141413`
4. **6px 圆角 → 24rpx**：暖奶油画布规范
5. **IBM Plex Sans → Georgia + 系统字体**：标题用 Georgia，正文用系统字体
6. **手绘吉祥物 → 学习主题图标**：刺猬不适用，可借鉴其插图风格

### 2.3 不可迁移的设计决策

1. **IBM Plex Sans Variable**：开源字体可用，但与暖奶油画布风格不搭
2. **手绘刺猬吉祥物**：品牌专属
3. **240px 文档侧边栏**：小程序无侧边栏
4. **代码块深色表面**：PostHog 的 `#23251d` 与暖奶油画布的 `#181715` 不同
5. **800 weight display**：太重，不适合暖奶油画布的 Georgia 400

---

## 3. 具体实施方法

### 3.1 色彩映射表

| PostHog 原始 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#eeefe9` canvas | `#faf9f5` 画布 | 页面背景 |
| `#ffffff` surface-card | `#efe9de` 奶油卡片 | 卡片背景 |
| `#fcfcfa` surface-doc | `#faf9f5` 画布 | 文档区域 |
| `#23251d` ink | `#141413` 暖墨 | 标题文字 |
| `#4d4f46` body | `#141413` 暖墨 | 正文 |
| `#6c6e63` mute | `#6c6a64` 次要文字 | 辅助信息 |
| `#f7a501` primary | `#cc785c` 珊瑚色 | CTA |
| `#dd9001` primary-pressed | `#a9583e` Active | 按下态 |
| `#23251d` surface-dark | `#181715` 深海军蓝 | 深色区域 |
| `#bfc1b7` hairline | `#e6dfd8` 分割线 | 边框 |
| `#dceaf6` accent-blue-soft | `rgba(125,211,252,0.15)` | 提示蓝 |
| `#d9eddf` accent-green-soft | `rgba(52,211,153,0.15)` | 成功绿 |
| `#f7d6d3` accent-red-soft | `rgba(239,68,68,0.15)` | 警告红 |
| `#e7d8ee` accent-purple-soft | `rgba(168,85,247,0.15)` | 信息紫 |

### 3.2 字体映射（用 rpx）

| PostHog 原始 | 刷个冯题映射 | 说明 |
|---|---|---|
| `display-xl` 36px/700 | Georgia 72rpx/400/-3rpx | Hero 标题 |
| `display-lg` 24px/800 | Georgia 48rpx/400/-3rpx | 章节标题 |
| `heading-lg` 21px/700 | Georgia 40rpx/400/-3rpx | 子标题 |
| `heading-md` 20px/700 | 系统字体 36rpx/700 | 区块标题 |
| `body-md` 16px/400 | 系统字体 28rpx/400 | 正文 |
| `body-strong` 16px/600 | 系统字体 28rpx/600 | 强调 |
| `button-md` 14px/700 | 系统字体 28rpx/700 | 按钮 |
| `caption-xs` 12px/600/uppercase | 系统字体 22rpx/700/大写 | 标签 |

### 3.3 组件设计规范

**PostHog 风格 CTA 按钮**
```css
.btn-posthog {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 16rpx; /* PostHog 的 6px，适当放大 */
  padding: 16rpx 32rpx;
  height: 72rpx;
  font-size: 28rpx;
  font-weight: 700;
}
```

**PostHog 风格产品卡片**
```css
.posthog-card {
  background: #efe9de;
  border: 2rpx solid #e6dfd8;
  border-radius: 16rpx;
  padding: 32rpx;
}

.posthog-card-white {
  background: #faf9f5;
  border: 2rpx solid #e6dfd8;
  border-radius: 16rpx;
  padding: 32rpx;
}
```

**PostHog 风格柔和彩色标注（学习应用核心）**
```css
.callout-tip {
  background: rgba(125,211,252,0.15);
  border-left: 6rpx solid #7dd3fc;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
}

.callout-success {
  background: rgba(52,211,153,0.15);
  border-left: 6rpx solid #34d399;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
}

.callout-warning {
  background: rgba(239,68,68,0.15);
  border-left: 6rpx solid #ef4444;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
}

.callout-info {
  background: rgba(168,85,247,0.15);
  border-left: 6rpx solid #a855f7;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
}
```

**PostHog 风格章节眉毛标签**
```css
.section-eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  color: #6c6a64;
  margin-bottom: 16rpx;
}
```

### 3.4 页面布局模板

借鉴 PostHog 的紧凑但有节奏的布局：

```
Zone 1 — Hero 区（Georgia 大标题 + 珊瑚 CTA）
  标题 + 描述 + CTA
  ↓ 64rpx

Zone 2 — 学习概览区（PostHog 风格指标卡片）
  2x2 指标网格 + 柔和彩色标注
  ↓ 64rpx

Zone 3 — 工具区（PostHog 风格功能瓦片）
  2 列功能卡片 + 图标 + 描述
  ↓ 64rpx

Zone 4 — 智能建议区（柔和彩色标注系统）
  蓝色提示 / 绿色成功 / 红色警告 / 紫色信息
  ↓ 48rpx

Zone 5 — 快捷入口区
  答题记录 | 错题本
```

### 3.5 WXSS 实现示例

```css
/* PostHog 风格的指标卡片 */
.metric-card-posthog {
  background: #efe9de;
  border: 2rpx solid #e6dfd8;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
}

.metric-card-posthog .value {
  font-size: 48rpx;
  font-weight: 800;
  color: #141413;
  letter-spacing: -2rpx;
}

.metric-card-posthog .label {
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  color: #6c6a64;
  margin-top: 8rpx;
}

/* PostHog 风格的智能建议卡片 */
.suggestion-card {
  background: rgba(125,211,252,0.15);
  border-left: 6rpx solid #7dd3fc;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.suggestion-card.warning {
  background: rgba(239,68,68,0.15);
  border-left-color: #ef4444;
}

.suggestion-card.success {
  background: rgba(52,211,153,0.15);
  border-left-color: #34d399;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

1. **学习驾驶舱**：PostHog 的指标卡片 + 柔和彩色标注完美适合数据展示
2. **智能建议区**：四色标注系统（提示/成功/警告/信息）天然适合学习建议
3. **结果页**：指标卡片展示成绩
4. **错题本**：状态标注（已掌握/未掌握）

### 4.2 不适合用在哪些页面

1. **首页 Hero**：PostHog 的紧凑风格不如暖奶油画布有品牌感
2. **刷题页面**：需要专注阅读，不需要彩色标注干扰
3. **代码/数据展示**：PostHog 的风格不够技术化

### 4.3 混搭建议

- **学习驾驶舱用 PostHog 的指标卡片风格**：紧凑的 2x2 网格
- **智能建议用 PostHog 的四色标注**：蓝/绿/红/紫对应不同建议级别
- **首页保持暖奶油画布**：Georgia 标题 + 奶油画布
- **章节眉毛标签可借鉴**：大写 + 字间距的标签风格
- **深色代码块可借鉴**：`#181715` 深色背景展示数据

---

## 5. 实施检查清单

- [ ] 所有颜色映射到暖奶油画布色板
- [ ] 圆角用 24rpx（非 PostHog 的 6px）
- [ ] CTA 用珊瑚色（非黄橙色）
- [ ] 标题用 Georgia（非 IBM Plex Sans）
- [ ] 正文用系统字体（非 IBM Plex Sans）
- [ ] 柔和彩色标注适配暖奶油画布色板
- [ ] 章节间距 64rpx（非 80px）
- [ ] 卡片背景用 `#efe9de`
- [ ] 大写标签保留，但用暖奶油画布配色
- [ ] 不引入手绘吉祥物

---

## 6. 参考文件

- 原始设计：`.claude/skills/posthog-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` § 25 Claude Design 暖奶油画布改造
