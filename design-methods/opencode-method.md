# OpenCode 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/opencode.ai-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

OpenCode 的设计哲学是 **"营销页面即 manpage"**。整个系统只用一款等宽字体（Berkeley Mono），页面读起来像终端手册或静态站点 README。视觉身份完全来自这一个排版决策：无衬线字体、无装饰、无图片——整个品牌就是一个等宽字体和一个重量的区别。

核心原则：
- 单一字体决策即品牌身份
- ASCII 方括号标记 `[+]` / `[-]` / `[x]` 替代图标和子弹符号
- 暖奶油画布 + 近黑墨水 = 唯二的色彩事件
- 深色表面仅出现一次（Hero TUI 模拟），是叙事手段而非装饰
- 96px 节奏分隔，无装饰分割线

### 1.2 视觉 DNA

- **100% 等宽排版**：从 38px Hero 标题到 14px 页脚版权，全是 Berkeley Mono
- **暖奶油画布** `#fdfcfc`：唯一页面背景，无灰度交替
- **近黑墨水** `#201d1d`：品牌唯一"颜色"，同时也是深色表面
- **4px 圆角**：所有交互元素，容器 0px
- **ASCII 标记系统**：品牌唯一图标语言
- **96px 节奏**：章节间最大间距，无装饰分割

### 1.3 色彩策略

| 用途 | 色值 | 与暖奶油画布差异 |
|---|---|---|
| 画布 | `#fdfcfc`（微暖白） | 比 `#faf9f5` 更冷，差异极小 |
| 墨水/主色 | `#201d1d`（近黑） | 比 `#141413` 更冷，接近 |
| 深色表面 | `#201d1d`（与墨水相同） | 与 `#181715` 接近 |
| 柔和表面 | `#f8f7f7` | 无对应，介于画布和卡片之间 |
| 卡片表面 | `#f1eeee` | 比 `#efe9de` 冷得多 |
| 线条 | `rgba(15,0,0,0.12)` | 暖色调半透明，无直接对应 |
| 语义色 | Apple HIG 全套（蓝、红、黄、绿） | 仅在 TUI 模拟中使用 |

### 1.4 字体策略

单一等宽字体 Berkeley Mono，三档重量：
- **700**：Hero 标题 38px、章节标签 16px
- **500**：正文强调、按钮 16px
- **400**：正文 16px、链接 16px、版权 14px

行高统一 1.5，按钮 2.0。无字间距调整。

### 1.5 布局与组件模式

- **章节间距**：96px，无装饰分割
- **最大宽度**：~960px 内容列
- **按钮**：4px 圆角，36px 高度，20px 水平内边距
- **输入框**：4px 圆角，40px 高度，8px 12px 内边距
- **卡片**：不存在为抬高表面——章节只是发丝边框文本块
- **深度系统**：无阴影，仅靠深色表面（Hero）和发丝边框表达层次

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **暖奶油画布背景**：OpenCode 的 `#fdfcfc` 与暖奶油画布 `#faf9f5` 极其接近（都是暖白），可直接映射
2. **近黑文字色**：`#201d1d` 与 `#141413` 几乎相同，可直接使用
3. **零阴影哲学**：完全符合暖奶油画布的零阴影规范
4. **发丝边框分隔**：比阴影更适合小程序的轻量感
5. **96px 章节节奏**：可转为 rpx 用于页面区块分隔
6. **单色深色表面策略**：深海军蓝仅用于特定强调区域

### 2.2 需要改造的设计决策

1. **等宽字体 → Georgia 衬线**：OpenCode 的核心是等宽字体，但刷个冯题使用 Georgia 衬线标题。可借鉴其"单一字体决策即品牌"的理念，但字体本身不能迁移。等宽字体可用于代码/数据展示区域（如子网计算器的二进制位）
2. **ASCII 标记系统 → Emoji/文字图标**：小程序无法渲染 ASCII art，但 `[+]` / `[-]` 的简洁精神可用文字标签替代
3. **4px 圆角 → 24rpx**：OpenCode 的 4px 极小圆角不符合暖奶油画布的 24rpx 规范，需调整
4. **36px 按钮高度 → 适配 rpx**：需按 750rpx 设计稿换算
5. **深色 Hero TUI 模拟 → 深色区域卡片**：可借鉴其深色表面仅用一次的策略

### 2.3 不可迁移的设计决策

1. **100% 等宽排版**：与暖奶油画布的 Georgia 衬线风格冲突，不能迁移
2. **Berkeley Mono 字体**：商业字体，小程序无法使用
3. **ASCII block-pixel 品牌标识**：小程序无法渲染
4. **桌面端 960px 最大宽度**：小程序全宽设计，不适用
5. **Apple HIG 语义色全套**：过于复杂，小程序只需少量语义色
6. **无图片策略**：刷个冯题可能需要图标和插图

---

## 3. 具体实施方法

### 3.1 色彩映射表

| OpenCode 原始 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#fdfcfc` canvas | `#faf9f5` 画布 | 页面背景 |
| `#201d1d` ink | `#141413` 暖墨 | 标题、正文 |
| `#201d1d` surface-dark | `#181715` 深海军蓝 | 深色区域 |
| `#f8f7f7` surface-soft | `#efe9de` 奶油卡片 | 卡片背景 |
| `#f1eeee` surface-card | `#efe9de` 奶油卡片 | 卡片背景 |
| `rgba(15,0,0,0.12)` hairline | `#e6dfd8` 浅面分割线 | 分割线 |
| `#646262` mute | `#6c6a64` 次要文字 | 辅助信息 |
| `#9a9898` ash | `#8e8b82` 最次要文字 | 禁用态 |
| `#007aff` accent | `#cc785c` 珊瑚色 | CTA/链接 |
| `#30d158` success | `#34d399` | 成功状态 |
| `#ff3b30` danger | `#ef4444` | 错误状态 |

### 3.2 字体映射（用 rpx）

| OpenCode 原始 | 刷个冯题映射 | 说明 |
|---|---|---|
| `display-xl` 38px/700 | Georgia 76rpx/400/-3rpx | Hero 标题用衬线 |
| `heading-md` 16px/700 | Georgia 32rpx/400/-3rpx | 章节标签 |
| `body-md` 16px/400 | 系统字体 28rpx/400 | 正文 |
| `body-strong` 16px/500 | 系统字体 28rpx/600 | 强调 |
| `button-md` 16px/500 | 系统字体 28rpx/600 | 按钮 |
| `caption-md` 14px/400 | 系统字体 24rpx/400 | 辅助文字 |

代码/数据展示区域可用等宽字体（monospace）：
```css
.mono-text {
  font-family: 'Courier New', Courier, monospace;
}
```

### 3.3 组件设计规范

**按钮（借鉴 OpenCode 的极简风格）**
```css
.btn-primary {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 24rpx; /* 暖奶油画布规范，非 OpenCode 的 4px */
  padding: 16rpx 40rpx;
  height: 72rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-secondary {
  background: transparent;
  color: #141413;
  border: 2rpx solid #6c6a64;
  border-radius: 24rpx;
  padding: 16rpx 40rpx;
  height: 72rpx;
}
```

**发丝边框分割线（OpenCode 特色，可迁移）**
```css
.hairline-divider {
  height: 2rpx;
  background: #e6dfd8;
  margin: 32rpx 0;
}
```

**ASCII 风格标签（借鉴精神，用文字替代）**
```css
.ascii-tag {
  font-family: 'Courier New', monospace;
  font-size: 22rpx;
  color: #6c6a64;
  letter-spacing: 2rpx;
}
/* 使用：[+] 开始刷题  [-] 排序可视化  [x] 单词记忆 */
```

### 3.4 页面布局模板

借鉴 OpenCode 的章节节奏，适配小程序全宽：

```
Zone 1 — Hero 标题区（暖奶油画布）
  标题 + 标语 + CTA
  ↓ 64rpx 间距

Zone 2 — 内容区（发丝边框分隔）
  功能卡片网格
  ↓ 64rpx 间距

Zone 3 — 辅助区（发丝边框分隔）
  快捷入口
  ↓ 48rpx 间距

Zone 4 — 底部区
  备案号/版权
```

### 3.5 WXSS 实现示例

```css
/* OpenCode 风格的发丝边框卡片（适配暖奶油画布） */
.opencode-card {
  background: #faf9f5;
  border: 2rpx solid #e6dfd8;
  border-radius: 24rpx; /* 暖奶油画布规范 */
  padding: 32rpx;
  margin-bottom: 24rpx;
}

/* OpenCode 风格的章节标题 */
.opencode-section-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 32rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 16rpx;
}

/* OpenCode 风格的等宽数据展示（适合子网计算器等） */
.opencode-mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 24rpx;
  color: #141413;
  line-height: 1.5;
}

/* OpenCode 风格的深色区域（仅用于强调） */
.opencode-dark-zone {
  background: #181715;
  color: #faf9f5;
  padding: 48rpx 32rpx;
  border-radius: 24rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

1. **子网计算器**：等宽字体展示二进制位、IP 地址，天然契合 OpenCode 风格
2. **数据结构可视化**：代码展示区域可用等宽字体 + 深色代码块
3. **TCP 动画机**：报文字段展示可用等宽风格
4. **学习驾驶舱**：数据密集型页面，发丝边框分隔比阴影更清晰

### 4.2 不适合用在哪些页面

1. **首页 Hero 区**：暖奶油画布的 Georgia 衬线更适合品牌感
2. **刷题页面**：需要温暖友好的阅读体验，等宽字体太冷
3. **结果页**：需要情感化的成绩展示，不适合极客风格

### 4.3 混搭建议

- **整体保持暖奶油画布**：画布色、卡片色、珊瑚 CTA、Georgia 标题不变
- **数据展示区借用 OpenCode 风格**：等宽字体、发丝边框、深色代码块
- **深色区域谨慎使用**：最多一个全宽深色区块，作为视觉节奏对比
- **ASCII 精神用文字标签实现**：如 `[练习]` `[考试]` 的方括号标签

---

## 5. 实施检查清单

- [ ] 所有颜色值映射到暖奶油画布色板
- [ ] 所有字号用 rpx 单位
- [ ] 圆角统一 24rpx（非 OpenCode 的 4px）
- [ ] 等宽字体仅用于数据/代码展示区域
- [ ] 深色区域最多一个，用 `#181715`
- [ ] 发丝边框用 `#e6dfd8` 或 `rgba(15,0,0,0.12)` 的 rpx 等效
- [ ] 按钮高度适配 72rpx 以上
- [ ] 章节间距 64rpx（对应 OpenCode 的 96px，按比例缩放）
- [ ] 不引入 ASCII art 或 block-pixel 元素
- [ ] 保持暖奶油画布的零阴影规范

---

## 6. 参考文件

- 原始设计：`.claude/skills/opencode.ai-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` § 25 Claude Design 暖奶油画布改造
