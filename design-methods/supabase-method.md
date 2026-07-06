# Supabase 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/supabase-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Supabase 的设计语言是 **为清晰而工程化**。核心理念：
- **单一翡翠绿是唯一色彩事件**：`#3ecf8e` 是唯一的填充 CTA 色，其余全部是灰度梯度
- **白色画布承诺**：营销表面始终在纯白上，无大气渐变、无暗色背景
- **产品 UI 模拟是装饰**：仪表盘表格、SQL 编辑器、查询构建器的合成截图是品牌的论据——"看实际产品"
- **方形按钮圆角**：6px radius 是签名按钮形状，技术感、非药丸
- **近黑非纯黑**：`#171717` 作为默认正文色

### 1.2 视觉 DNA
- 翡翠绿 `#3ecf8e` 按钮上使用 **近黑文字** (`#171717`) 而非白色——绿色读作"发光表面配深色文字"
- 6px 按钮圆角（方形、技术感）
- 12px 卡片圆角
- 产品 UI 模拟（仪表盘/编辑器）在 12px 容器中，配 Level 2 阴影
- 灰度梯度从 `#ededed` 到 `#171717`

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| Emerald (primary) | `#3ecf8e` | 填充 CTA、品牌文字标记、圆点指示器 |
| Emerald Deep | `#24b47e` | 按压态 |
| Ink | `#171717` | 默认正文（近黑，非纯黑） |
| Ink Secondary | `#212121` | 正文强调 |
| Ink Mute | `#707070` | 次要文字 |
| Ink Mute 2 | `#9a9a9a` | 三级文字 |
| Ink Faint | `#b2b2b2` | 禁用/占位符 |
| On Primary | `#171717` | 翡翠绿按钮上的文字（近黑，非白） |
| Canvas | `#ffffff` | 默认页面背景 |
| Canvas Soft | `#fafafa` | 交替区域底色 |
| Canvas Night | `#1c1c1c` | 代码块、暗色卡片 |
| Hairline | `#dfdfdf` | 1px 边框 |

### 1.4 字体策略
- **Circular** 专有字体（Lineto），weight 500 用于 display，400 用于 body
- Display 层级用负 letter-spacing：-1.92px (64px) → -0.42px (28px)
- 替代字体：Inter weight 500 + 负 letter-spacing
- 代码块使用系统等宽字体（ui-monospace, Menlo, Monaco）

### 1.5 布局与组件模式
- 间距基数：8px，token 从 2px 到 64px
- 按钮：6px 圆角（方形），8px 16px padding
- 卡片：12px 圆角，1px hairline 边框
- 代码块：`#1c1c1c` 背景 + 系统等宽字体

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **近黑非纯黑正文色**：`#171717` 与暖奶油画布 `#141413` 理念一致
- **12px 卡片圆角**：与当前 24rpx 接近
- **灰度梯度层级**：从 hairline 到 ink 的 5-6 级灰度适合信息层次
- **代码块暗色表面**：`#1c1c1c` 可直接用于代码/答案展示
- **产品即装饰的理念**：学习工具的功能截图/操作预览可作为页面装饰

### 2.2 需要改造的设计决策
- **翡翠绿 CTA** → 改造为珊瑚 `#cc785c`
- **翡翠绿按钮上的近黑文字** → 改造为珊瑚按钮上的暖奶油文字 `#faf9f5`（当前规范）
- **6px 方形按钮圆角** → 改造为 12rpx（介于 Supabase 的 6px 和当前暖奶油画布的圆润之间）
- **纯白画布** → 改造为暖奶油 `#faf9f5`
- **weight 500 display** → 改造为 Georgia 400 衬线（当前标题字体规范）

### 2.3 不可迁移的设计决策
- **Circular 专有字体** → 小程序无法加载，保持 Georgia + 系统字体
- **产品 UI 模拟截图** → 学习工具无需仪表盘/SQL 编辑器模拟
- **暗色 canvas-night 代码块** → 可部分采用，但需注意与暖奶油画布的协调
- **integration logo 彩色条** → 学习工具无此需求

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Supabase 角色 | 刷个冯题映射 | 色值 | 说明 |
|---|---|---|---|
| Emerald (#3ecf8e) | 珊瑚 CTA | `#cc785c` | 主按钮 |
| Emerald Deep (#24b47e) | 珊瑚深 | `#a9583e` | 按压态 |
| Ink (#171717) | 暖墨文字 | `#141413` | 正文 |
| Ink Secondary (#212121) | 正文强调 | `#1a1918` | 加粗正文 |
| Ink Mute (#707070) | 次要文字 | `#6c6a64` | 辅助信息 |
| Ink Mute 2 (#9a9a9a) | 弱文字 | `#9e9c96` | 占位符 |
| Ink Faint (#b2b2b2) | 极弱文字 | `#c8c6c0` | 禁用态 |
| On Primary (#171717) | 按钮文字 | `#faf9f5` | CTA 按钮文字（改为暖奶油） |
| Canvas (#ffffff) | 暖奶油画布 | `#faf9f5` | 页面背景 |
| Canvas Soft (#fafafa) | 浅灰白 | `#f5f3ef` | 交替区域 |
| Canvas Night (#1c1c1c) | 深色代码区 | `#181715` | 代码块、答案展示 |
| Hairline (#dfdfdf) | 分割线 | `#e0ddd6` | 卡片边框 |

### 3.2 字体映射（用 rpx）

| Supabase 层级 | 刷个冯题映射 | 字号 | 粗细 | 行高 | 字间距 |
|---|---|---|---|---|---|
| display-xxl 64px | 页面大标题 | 112rpx | 400 | 1.1 | -4rpx |
| display-xl 48px | 区域标题 | 80rpx | 400 | 1.1 | -3rpx |
| display-lg 36px | 子区域标题 | 64rpx | 400 | 1.15 | -1rpx |
| display-md 28px | 卡片标题 | 48rpx | 400 | 1.2 | -1rpx |
| heading-lg 22px | 紧凑标题 | 40rpx | 400 | 1.2 | 0 |
| body-lg 18px | 引导正文 | 32rpx | 400 | 1.55 | 0 |
| body-md 16px | 默认正文 | 28rpx | 400 | 1.5 | 0 |
| button-md 14px | 按钮标签 | 26rpx | 400 | 1.0 | 0 |
| caption 13px | 辅助说明 | 24rpx | 400 | 1.45 | 0 |
| code 14px | 代码文字 | 26rpx | 400 | 1.5 | 0 |

### 3.3 组件设计规范

**主 CTA 按钮（方形圆角）**
```css
.btn-supabase {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  font-weight: 400;
  line-height: 1.0;
  border: none;
}
.btn-supabase:active {
  background-color: #a9583e;
}
```

**Hairline 卡片**
```css
.card-supabase {
  background-color: #faf9f5;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 1rpx solid #e0ddd6;
}
```

**代码/答案展示块**
```css
.code-block {
  background-color: #181715;
  color: #faf9f5;
  font-family: 'Courier New', Courier, monospace;
  font-size: 26rpx;
  line-height: 1.5;
  padding: 32rpx;
  border-radius: 12rpx;
}
```

**标签药丸**
```css
.tag-pill {
  display: inline-flex;
  background-color: #faf9f5;
  color: #141413;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 9999rpx;
}
.tag-pill-accent {
  background-color: #cc785c;
  color: #faf9f5;
}
```

### 3.4 页面布局模板

**工具展示页（借鉴 Supabase 产品页）**
```
┌──────────────────────────┐
│ 暖奶油画布 #faf9f5        │
│ 区域标题 (80rpx)          │
│ 引导正文 (32rpx)          │
├──────────────────────────┤
│ ┌──────┐  ┌──────┐      │
│ │功能卡1│  │功能卡2│      │  ← 2-up 功能网格
│ │hairline│ │hairline│     │
│ │边框卡片│  │边框卡片│     │
│ └──────┘  └──────┘      │
├──────────────────────────┤
│ 深色代码展示块             │  ← 答案/解析展示
│ #181715 背景              │
│ 等宽字体                  │
└──────────────────────────┘
```

### 3.5 WXSS 实现示例

```wxss
/* Supabase 风格的方形圆角按钮 */
.btn-square {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  font-weight: 400;
  line-height: 1.0;
  text-align: center;
}
.btn-square:active {
  background-color: #a9583e;
}

/* Supabase 风格的 hairline 边框卡片 */
.card-hairline {
  background-color: #faf9f5;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 1rpx solid #e0ddd6;
}

/* 深色代码展示区 */
.code-display {
  background-color: #181715;
  color: #faf9f5;
  font-family: 'Courier New', Courier, monospace;
  font-size: 26rpx;
  line-height: 1.5;
  padding: 32rpx;
  border-radius: 12rpx;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Supabase 风格的灰度标签 */
.tag {
  display: inline-block;
  background-color: #f5f3ef;
  color: #141413;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 9999rpx;
  border: 1rpx solid #e0ddd6;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **代码/答案展示页**：深色 `#181715` 代码块 + 暖色卡片的对比非常适合编程题解析
- **工具功能介绍页**：Supabase 的"产品即装饰"理念，用功能截图替代插图
- **数据密集页**：灰度梯度层级 + hairline 边框适合错题统计、学习数据表格
- **标签/分类页**：标签药丸 + 灰度梯度适合题目标签系统

### 4.2 不适合用在哪些页面
- **游戏化页面**：Supabase 的技术克制气质与趣味学习不匹配
- **情感化页面**（如学习成就庆祝）：过于冷静
- **纯文本阅读页**：方形按钮和 hairline 边框在长阅读中过于冷硬

### 4.3 混搭建议
- **Supabase 代码块 + 暖奶油画布卡片**：深色代码展示区嵌入暖色卡片中，形成冷暖对比
- **Supabase hairline 边框 + Starbucks 药丸按钮**：卡片形态用 Supabase，按钮形态用 Starbucks
- **Supabase 灰度标签 + 暖奶油画布背景**：标签系统用灰度，页面保持暖色

---

## 5. 实施检查清单

- [ ] CTA 按钮使用 12rpx 方形圆角（非药丸）
- [ ] 按钮文字使用暖奶油 `#faf9f5`（非 Supabase 的近黑）
- [ ] 卡片使用 1px hairline 边框，12rpx 圆角
- [ ] 代码/答案展示使用深色 `#181715` 背景 + 等宽字体
- [ ] 标签使用药丸形（9999rpx）+ 灰度背景
- [ ] 灰度梯度层级：hairline → canvas-soft → canvas → ink（4-5 级）
- [ ] 正文使用暖墨 `#141413`，不使用纯黑
- [ ] 标题使用 Georgia 衬线字体
- [ ] 页面背景使用暖奶油 `#faf9f5`（非纯白）
- [ ] 每个可见区域最多一个填充 CTA 按钮

---

## 6. 参考文件
- 原始设计分析：`.claude/skills/supabase-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
