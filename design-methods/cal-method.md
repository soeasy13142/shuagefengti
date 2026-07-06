# Cal.com 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/cal-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Cal.com 是一个干净、友好的现代 SaaS 界面：白色画布配黑色主 CTA，定制 Cal Sans 展示字体传达自信而不张扬的工程感。系统通过在卡片中直接嵌入产品 UI 片段（日历组件、调度表单）来展示产品，而非使用营销插图。深色海军蓝 footer 为每个长滚动页面提供视觉收束。整体节奏：白色 → 浅灰卡片 → 白色 → 产品 mockup → 白色 → 深色 footer。

### 1.2 视觉 DNA

- 白色画布 `#ffffff` 配近黑 CTA `#111111`
- Cal Sans 展示字体，weight 600，负字距 (-0.5px 到 -2px)
- 浅灰卡片 `#f5f5f5`，圆角 12px
- 深色 footer `#101010` 作为页面收束
- Nav pill group——药丸包裹的分段切换器
- 圆形头像 36px
- 产品 UI 片段直接嵌入营销卡片

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|---|---|---|
| Canvas | `#ffffff` | 白色页面底 |
| Surface Card | `#f5f5f5` | 浅灰卡片 |
| Surface Dark | `#101010` | 深色 footer/特色卡片 |
| Primary | `#111111` | 近黑 CTA |
| Ink | `#111111` | 主文字 |
| Body | `#374151` | 正文灰 |
| Muted | `#6b7280` | 次要文字 |
| Brand Accent | `#3b82f6` | 蓝色链接（极少用） |
| Badge Orange | `#fb923c` | 标签色 |

### 1.4 字体策略

- **Display**：Cal Sans — weight 600，负字距
- **Body/UI**：Inter — weight 400-600
- **Code**：JetBrains Mono
- Cal Sans 只用于标题，Inter 处理其余所有

### 1.5 布局与组件模式

- Section padding：96px
- 卡片圆角层级：md(8px) → lg(12px) → xl(16px)
- 按钮圆角 8px，高度 40px
- Nav pill group：药丸内的药丸切换器
- Badge pill：小药丸标签
- Avatar circle：36px 圆形头像

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|---|---|
| 浅灰卡片 + 白色画布 | 暖奶油画布已有类似结构（`#efe9de` 卡片 + `#faf9f5` 画布） |
| 圆角层级系统 | md/lg/xl 的分层可直接用于暖奶油画布 |
| Nav pill group | 适合用于学科/题型切换器 |
| Badge pill 标签 | 适合用于难度/状态标签 |
| 深色 footer 作为页面收束 | 暖奶油画布已有 `#181715` 深色表面 |
| 负字距标题 | 暖奶油画布的 Georgia 标题已用 -3rpx |

### 2.2 需要改造的设计决策

| 原决策 | 改造方向 |
|---|---|
| 白色画布 `#ffffff` | 改为暖奶油 `#faf9f5` |
| 近黑 CTA `#111111` | 改为珊瑚色 `#cc785c` |
| 浅灰卡片 `#f5f5f5` | 改为奶油卡片 `#efe9de` |
| Cal Sans 字体 | 改为 Georgia（项目规范） |
| 产品 UI 片段嵌入 | 改为学习工具 UI 嵌入（题目预览、公式展示） |
| 36px 圆形头像 | 改为 72rpx（rpx 单位） |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|---|---|
| Cal Sans 授权字体 | 不可用 |
| 日历/调度 UI 嵌入 | 学习工具无此场景 |
| 蓝色品牌强调色 | 暖奶油画布用珊瑚色 |
| 4-up 定价网格 | 小程序无定价页面 |
| JetBrains Mono 代码字体 | 小程序不支持自定义等宽字体 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Cal.com 角色 | 刷个冯题映射 | 色值 |
|---|---|---|
| Canvas `#ffffff` | 画布 | `#faf9f5` |
| Surface Card `#f5f5f5` | 卡片 | `#efe9de` |
| Surface Dark `#101010` | 深色表面 | `#181715` |
| Primary `#111111` | CTA | `#cc785c` |
| Ink `#111111` | 暖墨 | `#141413` |
| Body `#374151` | 正文 | `#3d3d3a` |
| Muted `#6b7280` | 次要文字 | `#6c6a64` |
| Badge Orange `#fb923c` | 标签色 | `#e8a55a` |
| Success `#10b981` | 正确 | `#5db872` |
| Error `#ef4444` | 错误 | `#c64545` |

### 3.2 字体映射（用 rpx）

| Cal.com Token | 刷个冯题映射 | rpx 值 |
|---|---|---|
| display-xl (64px) | 首页大标题 | 64rpx Georgia, 400, -3rpx |
| display-lg (48px) | 区块标题 | 48rpx Georgia, 400, -2rpx |
| display-md (36px) | 子标题 | 36rpx Georgia, 400, -1rpx |
| title-lg (22px) | 卡片标题 | 36rpx Georgia, 400 |
| title-md (18px) | 列表标题 | 32rpx sans-serif, 500 |
| body-md (16px) | 正文 | 28rpx sans-serif, 400 |
| caption (13px) | 标签 | 24rpx sans-serif, 500 |
| button (14px) | 按钮 | 28rpx sans-serif, 500 |

### 3.3 组件设计规范

**学科切换器（借鉴 Nav Pill Group）**
```css
.subject-switcher {
  display: flex;
  background: #f5f0e8;
  border-radius: 9999rpx;
  padding: 6rpx;
}
.subject-switcher__item {
  padding: 12rpx 28rpx;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #6c6a64;
}
.subject-switcher__item--active {
  background: #efe9de;
  color: #141413;
  box-shadow: 0 2rpx 8rpx rgba(20,20,19,0.08);
}
```

**难度标签（借鉴 Badge Pill）**
```css
.difficulty-badge {
  display: inline-block;
  background: #efe9de;
  color: #6c6a64;
  font-size: 24rpx;
  font-weight: 500;
  padding: 6rpx 20rpx;
  border-radius: 9999rpx;
}
.difficulty-badge--easy { background: #e8f5e9; color: #2e7d32; }
.difficulty-badge--hard { background: #fce4ec; color: #c62828; }
```

**功能卡片（借鉴 Feature Card）**
```css
.feature-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 48rpx;
}
.feature-card__icon {
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 24rpx;
}
.feature-card__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 16rpx;
}
.feature-card__desc {
  font-size: 28rpx;
  color: #3d3d3a;
  line-height: 1.6;
}
```

### 3.4 页面布局模板

```
┌───────────────────────────────┐
│ 画布 #faf9f5                  │
│                               │
│  ┌─────────────────────────┐  │
│  │ Georgia 标题 64rpx      │  │
│  │ 副标题                  │  │
│  │ [珊瑚色按钮]            │  │
│  └─────────────────────────┘  │
│                               │
│  ┌──────┐ ┌──────┐ ┌──────┐  │
│  │功能卡│ │功能卡│ │功能卡│  │
│  │#efe9 │ │#efe9 │ │#efe9 │  │
│  └──────┘ └──────┘ └──────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 学科切换器（药丸组）     │  │
│  │ [数学] [物理] [化学]    │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 深色 CTA 区 #181715     │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* 学科切换器 — 借鉴 Nav Pill Group */
.tab-bar {
  display: flex;
  background: #f5f0e8;
  border-radius: 9999rpx;
  padding: 6rpx;
  margin-bottom: 32rpx;
}
.tab-bar__item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #6c6a64;
}
.tab-bar__item--active {
  background: #efe9de;
  color: #141413;
  box-shadow: 0 2rpx 8rpx rgba(20,20,19,0.08);
}

/* 功能卡片网格 — 借鉴 Feature Card */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}
.card-grid__item {
  width: calc(50% - 12rpx);
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
}

/* 深色 CTA 区 — 借鉴 CTA Band Dark */
.cta-dark {
  background: #181715;
  border-radius: 24rpx;
  padding: 64rpx 48rpx;
  text-align: center;
}
.cta-dark__title {
  font-family: Georgia, serif;
  font-size: 40rpx;
  font-weight: 400;
  color: #faf9f5;
  margin-bottom: 24rpx;
}
.cta-dark__btn {
  background: #cc785c;
  color: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 首页功能介绍 | 3-up 功能卡片网格完美适配 |
| 学科/题型切换 | Nav pill group 是理想的选择器模式 |
| 学习工具列表 | 卡片 + 图标 + 描述的标准布局 |
| CTA 引导区 | 深色 CTA 区适合引导用户行动 |

### 4.2 不适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 做题界面 | 需要最大化内容区，不需要营销卡片 |
| 错题本 | 需要列表密度，不需要 3-up 网格 |

### 4.3 混搭建议

- **学科切换器**：直接采用 Nav Pill Group 模式，用于学科/题型/难度切换
- **功能卡片网格**：采用 Feature Card 布局，用于首页工具展示
- **深色 CTA 区**：借鉴 dark footer + CTA band，用于页面底部引导
- **Badge Pill 标签**：直接采用，用于难度、状态、分类标签

---

## 5. 实施检查清单

- [ ] 学科切换器（药丸组）组件已实现
- [ ] 功能卡片网格布局已实现
- [ ] 难度/状态标签（Badge Pill）组件已实现
- [ ] 深色 CTA 区组件已实现
- [ ] 卡片圆角使用 24rpx
- [ ] 按钮圆角使用 16rpx
- [ ] 标题使用 Georgia + 负字距
- [ ] 所有间距使用 rpx 单位
- [ ] 页面画布使用 `#faf9f5`
- [ ] 无第三方字体引入

---

## 6. 参考文件

- 原始设计规范：`.claude/skills/cal-design.md`
- 暖奶油画布规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25
