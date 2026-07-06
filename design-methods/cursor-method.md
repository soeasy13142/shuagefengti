# Cursor 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/cursor-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Cursor 是一个安静自信的开发者品牌，用编辑式的温暖奶油画布 `#f7f7f4` 替代了典型的暗色 IDE 氛围。近黑暖墨 `#26251e` 承载正文和标题——标题 weight 400 配负字距，传达杂志感而非科技夸张感。唯一的品牌电压是 **Cursor Orange** `#f54e00`，保留给主 CTA 和品牌字标。最强视觉签名是 **AI 时间线药丸色板**：五个粉彩色药丸（桃、薄荷、蓝、薰衣草、金）标记 AI 操作阶段，仅在产品时间线中使用。

### 1.2 视觉 DNA

- 暖奶油画布 `#f7f7f4`（非纯白）
- 暖近黑墨 `#26251e`（非纯黑）
- Cursor Orange `#f54e00` 作为唯一品牌色
- 标题 weight 400，负字距——杂志编辑感
- 单一 sans 字体家族（CursorGothic）
- JetBrains Mono 用于所有代码表面
- AI 时间线粉彩药丸：5 个专用 token
- Hairline-only 深度——无阴影
- 80px section rhythm
- 按钮圆角 8px

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|---|---|---|
| Canvas | `#f7f7f4` | 暖奶油页面底 |
| Canvas Soft | `#fafaf7` | 更浅暖奶油 |
| Surface Card | `#ffffff` | 纯白卡片 |
| Primary | `#f54e00` | Cursor Orange CTA |
| Ink | `#26251e` | 暖近黑墨 |
| Body | `#5a5852` | 正文灰 |
| Muted | `#807d72` | 次要文字 |
| Hairline | `#e6e5e0` | 分割线 |
| Timeline Thinking | `#dfa88f` | 桃色 |
| Timeline Grep | `#9fc9a2` | 薄荷色 |
| Timeline Read | `#9fbbe0` | 蓝色 |
| Timeline Edit | `#c0a8dd` | 薰衣草色 |
| Timeline Done | `#c08532` | 金色 |

### 1.4 字体策略

- **单一字体**：CursorGothic — sans-serif
- 显示：weight 400，负字距 (-0.11px 到 -2.16px)
- 正文：weight 400
- 按钮/标签：weight 500
- 代码：JetBrains Mono

### 1.5 布局与组件模式

- Section spacing：80px
- 按钮圆角：8px (md)
- 卡片圆角：12px (lg)
- 药丸标签：pill 圆角
- Hairline-only 深度，无阴影
- IDE mockup 卡片作为 hero 元素

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|---|---|
| 暖奶油画布（非纯白） | 与暖奶油画布 `#faf9f5` 精神一致 |
| 暖近黑墨（非纯黑） | 与暖墨 `#141413` 精神一致 |
| weight 400 标题 | 与暖奶油画布的 Georgia 400 一致 |
| 负字距标题 | 与暖奶油画布的 -3rpx 一致 |
| Hairline-only 深度 | 暖奶油画布也是零阴影 |
| 80px section rhythm | 可直接使用（80rpx） |
| AI 时间线粉彩药丸 | 可改造为"学习状态时间线" |
| 单一字体家族 | 简化实现，减少依赖 |

### 2.2 需要改造的设计决策

| 原决策 | 改造方向 |
|---|---|
| Cursor Orange `#f54e00` | 改为珊瑚色 `#cc785c` |
| 暖奶油 `#f7f7f4` | 改为暖奶油 `#faf9f5` |
| 暖墨 `#26251e` | 改为暖墨 `#141413` |
| CursorGothic 字体 | 改为 Georgia 标题 + 系统 sans 正文 |
| IDE mockup 卡片 | 改为题目/公式展示卡片 |
| 代码块大量使用 | 保留代码展示能力但减少比重 |
| JetBrains Mono | 改为系统等宽字体 |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|---|---|
| CursorGothic 授权字体 | 不可用 |
| IDE multi-pane mockup | 学习工具无此场景 |
| JetBrains Mono | 小程序不支持自定义等宽字体 |
| Download CTA 按钮 | 小程序无下载场景 |
| 72px hero 标题 | 小程序屏幕较小，需缩减 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Cursor 角色 | 刷个冯题映射 | 色值 |
|---|---|---|
| Canvas `#f7f7f4` | 画布 | `#faf9f5` |
| Surface Card `#ffffff` | 卡片 | `#efe9de` |
| Primary `#f54e00` | CTA | `#cc785c` |
| Ink `#26251e` | 暖墨 | `#141413` |
| Body `#5a5852` | 正文 | `#3d3d3a` |
| Muted `#807d72` | 次要文字 | `#6c6a64` |
| Hairline `#e6e5e0` | 分割线 | `#e6dfd8` |
| Timeline Thinking `#dfa88f` | 思考中 | `#dfa88f` |
| Timeline Grep `#9fc9a2` | 搜索中 | `#9fc9a2` |
| Timeline Read `#9fbbe0` | 阅读中 | `#9fbbe0` |
| Timeline Edit `#c0a8dd` | 编辑中 | `#c0a8dd` |
| Timeline Done `#c08532` | 完成 | `#c08532` |

### 3.2 字体映射（用 rpx）

| Cursor Token | 刷个冯题映射 | rpx 值 |
|---|---|---|
| display-mega (72px) | 首页大标题 | 64rpx Georgia, 400, -3rpx |
| display-lg (36px) | 区块标题 | 48rpx Georgia, 400, -2rpx |
| display-md (26px) | 子标题 | 36rpx Georgia, 400, -1rpx |
| title-md (18px) | 卡片标题 | 32rpx sans-serif, 600 |
| body-md (16px) | 正文 | 28rpx sans-serif, 400 |
| caption-uppercase (11px) | 标签 | 22rpx sans-serif, 600 |
| button (14px) | 按钮 | 28rpx sans-serif, 500 |

### 3.3 组件设计规范

**学习状态时间线（借鉴 AI Timeline Pills）**

```css
.timeline {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}
.timeline__pill {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 9999rpx;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}
.timeline__pill--thinking { background: #dfa88f; color: #141413; }
.timeline__pill--reading  { background: #9fbbe0; color: #141413; }
.timeline__pill--solving  { background: #c0a8dd; color: #141413; }
.timeline__pill--done     { background: #c08532; color: #ffffff; }
```

**功能卡片（借鉴 Feature Card）**

```css
.feature-card {
  background: #efe9de;
  border: 1rpx solid #e6dfd8;
  border-radius: 24rpx;
  padding: 32rpx;
}
```

**代码块（借鉴 Code Block）**

```css
.code-block {
  background: #efe9de;
  border: 1rpx solid #e6dfd8;
  border-radius: 24rpx;
  padding: 32rpx;
  font-family: -apple-system, monospace;
  font-size: 24rpx;
  line-height: 1.6;
  color: #141413;
}
```

**Featured 卡片（借鉴 Pricing Tier Featured）**

```css
.card--featured {
  background: #181715;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 48rpx;
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
│  学习状态：                    │
│  [思考中] [阅读中] [解题中]   │
│                               │
│  ┌──────┐ ┌──────┐           │
│  │功能卡│ │功能卡│           │
│  └──────┘ └──────┘           │
│                               │
│  ┌─────────────────────────┐  │
│  │ 代码/公式块              │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ Featured 深色卡 #181715  │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* 学习状态时间线 — 借鉴 Cursor AI Timeline */
.progress-timeline {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 32rpx;
}
.progress-pill {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 9999rpx;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}
.progress-pill--pending { background: #efe9de; color: #6c6a64; }
.progress-pill--active  { background: #dfa88f; color: #141413; }
.progress-pill--done    { background: #c08532; color: #ffffff; }

/* 功能卡片 — 借鉴 Cursor Feature Card */
.tool-card {
  background: #efe9de;
  border: 1rpx solid #e6dfd8;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.tool-card__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 16rpx;
}
.tool-card__desc {
  font-size: 28rpx;
  color: #3d3d3a;
  line-height: 1.6;
}

/* 代码/公式块 — 借鉴 Cursor Code Block */
.formula-block {
  background: #efe9de;
  border: 1rpx solid #e6dfd8;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.formula-block__content {
  font-family: -apple-system, monospace;
  font-size: 24rpx;
  color: #141413;
  line-height: 1.6;
}

/* Featured 深色卡片 — 借鉴 Cursor Pricing Featured */
.highlight-card {
  background: #181715;
  border-radius: 24rpx;
  padding: 48rpx;
  color: #faf9f5;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 学习进度追踪 | 时间线药丸完美表达学习状态流转 |
| 做题界面 | 代码块 + 卡片的信息密度适合题目展示 |
| 工具列表 | Feature card 网格布局适配 |
| 公式/代码展示 | Code block 组件直接可用 |
| 首页 | Hero + 卡片 + Featured 深色卡的节奏完整 |

### 4.2 不适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 纯文字阅读界面 | 代码块风格不适合纯文本内容 |
| 儿童界面 | 过于开发者导向 |

### 4.3 混搭建议

- **学习状态时间线**：从 Cursor 的 AI 时间线迁移，用于标记学习进度（未开始 → 思考中 → 已完成）
- **描边卡片**：从 Cursor 的 Feature Card 迁移，用于需要轻量感的内容区
- **代码/公式块**：从 Cursor 的 Code Block 迁移，用于理科题目展示
- **深色 Featured 卡**：从 Cursor 的 Pricing Featured 迁移，用于重要内容高亮

---

## 5. 实施检查清单

- [ ] 学习状态时间线组件已实现（5 色药丸）
- [ ] 描边卡片样式已定义
- [ ] 代码/公式块组件已实现
- [ ] Featured 深色卡片组件已实现
- [ ] 标题使用 Georgia 400 + 负字距
- [ ] 所有间距使用 rpx 单位
- [ ] 页面画布使用 `#faf9f5`
- [ ] CTA 使用珊瑚色 `#cc785c`
- [ ] 时间线颜色仅用于学习状态，不作为系统操作色
- [ ] 无第三方字体引入

---

## 6. 参考文件

- 原始设计规范：`.claude/skills/cursor-design.md`
- 暖奶油画布规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25
