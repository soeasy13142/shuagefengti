# Wise 设计方案 → 刷个冯题 实施方法论

> 参考来源：`.claude/skills/wise-design.md`
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Wise 的设计语言是北欧金融科技杂志式的柔和自信：鼠尾草绿画布 `#e8ebe6` 上放置白色圆角卡片，单一酸橙绿 `#9fe870` CTA pill 贯穿全页，display 字体以惊人的 weight 900 承载 hero 标题。整个系统读起来像一本斯堪的纳维亚金融科技杂志——友好、温暖、不像银行。

核心原则：
- **鼠尾草画布 = 品牌基调**：`#e8ebe6` 淡绿灰画布是品牌的定义性色调
- **酸橙绿 CTA**：`#9fe870` 是唯一的品牌强调色，所有转化目标的签名色
- **Weight 900 = hero 声音**：专有 display 字体在 hero 级别使用 900 超重粗体，品牌的排版签名
- **24px 圆角 = 友好**：所有卡片和按钮使用 24px 大圆角，视觉柔和
- **表面对比 = 深度**：白色卡片在鼠尾草画布上形成自然层次，零阴影设计

### 1.2 视觉 DNA

- 鼠尾草绿画布 `#e8ebe6` + 白色卡片 `#ffffff`
- 酸橙绿 `#9fe870` CTA pill，品牌唯一强调色
- Weight 900 display 字体（64-126px hero），品牌的排版签名
- 24px 大圆角卡片和按钮，从不使用尖角
- 完整语义色系统（正/负/警告各有多个变体）
- 货币转换器卡片作为品牌签名交互组件
- 近黑 ink `#0e0f0c` 带橄榄暖意

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|------|------|------|
| 品牌绿 CTA | `#9fe870` | 酸橙绿，所有转化目标 |
| 品绿激活 | `#cdffad` | hover/active 状态 |
| 品绿中性 | `#c5edab` | 中等饱和度激活填充 |
| 品绿淡 | `#e2f6d5` | 柔和表面/徽章背景 |
| 绿上文字 | `#0e0f0c` | 绿色表面上的文字 |
| 画布 | `#ffffff` | 卡片内部纯白 |
| 画布柔和 | `#e8ebe6` | 鼠尾草页面背景，品牌定义性色调 |
| 文字 ink | `#0e0f0c` | 近黑带橄榄暖意 |
| ink 深 | `#163300` | 正向状态上的深绿墨 |
| Body | `#454745` | 次要文字 |
| Mute | `#868685` | 最次要文字/占位符 |
| 正向 | `#2ead4b` | 成功指示 |
| 正向深 | `#054d28` | 按压正向态 |
| 警告 | `#ffd11a` | 注意事项 |
| 警告深 | `#b86700` | 按压警告态 |
| 警告内容 | `#4a3b1c` | 警告表面文字 |
| 负向 | `#d03238` | 错误/破坏性 |
| 负向深 | `#a72027` | 按压破坏态 |
| 负向最深 | `#a7000d` | 最高强调破坏文字 |
| 负向背景 | `#320707` | 深栗色破坏性背景 |
| 橙色点缀 | `#ffc091` | 插图/定价卡片点缀 |
| 青色点缀 | `#38c8ff` | 插图/定价卡片点缀 |

### 1.4 字体策略

双字体系统，严格角色分离：
- **Wise Sans（专有）**：hero 级别 weight 900（64-126px），品牌的排版签名，从不在 marketing surface 使用更轻字重
- **Inter**：sub-display weight 600，所有 body、表单标签、按钮标签

核心对比：Wise Sans 900 的厚重 vs Inter 600 的中性 = 品牌的排版故事。Weight 900 用于 hero，weight 600 用于其余一切。

### 1.5 布局与组件模式

- 基础单位 4px，间距 token：2px / 4px / 8px / 12px / 16px / 24px / 32px / 48px
- 卡片内边距 24px，section 间距 48px
- 24px 大圆角（`rounded.xl`）贯穿所有卡片和按钮
- Hero：左标题 + 右货币转换器卡片（桌面端），移动端堆叠
- 2-up/3-up 功能网格（桌面端）
- pill 形状态徽章（正/负），9999px 圆角
- 鼠尾草画布上的白色卡片 = 自然深度（表面对比代替阴影）
- 完整语义色系统：正/负/警告各有 content/hover/active 变体
- 深色反转 hero：`#0e0f0c` 背景 + 酸橙绿标题

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|------|------|
| 柔和色调画布 | 鼠尾草绿的柔和感与暖奶油调性一致，"有色画布+白色卡片"的思路完全可用 |
| 大圆角卡片 | 24px/48rpx 圆角的友好感适合学习工具，项目已有 24rpx 基础圆角 |
| 表面对比深度 | 白色/奶油卡片在有色画布上形成层次，零阴影，性能最优 |
| 完整语义色 | 正/负/警告各有多个变体，适合答题场景的多状态反馈 |
| pill 状态徽章 | 适合答题状态（正确/错误/部分正确），9999px 圆角 pill 形 |
| 深色反转 hero | `#141413` 深色面 + 珊瑚色标题，项目已有此模式 |
| 渐进式圆角层级 | 8px/12px/16px/24px 的圆角梯度适合不同组件 |

### 2.2 需要改造的设计决策

| 决策 | 原方案 | 改造方向 |
|------|--------|----------|
| 画布色 | 鼠尾草绿 `#e8ebe6` | 改为暖奶油 `#faf9f5` |
| 品牌绿 CTA | 酸橙绿 `#9fe870` | 改为珊瑚色 `#cc785c` |
| 品绿激活 | `#cdffad` | 改为深珊瑚 `#a9583e` |
| 品绿淡 | `#e2f6d5` | 改为奶油卡片 `#efe9de` |
| 字体 | Wise Sans（专有）+ Inter | 改为 Georgia 衬线标题 + 系统无衬线 |
| 字重 | hero 900，其余 600 | Georgia 标题 400（衬线不需要粗体），正文 400 |
| 圆角 | 24px 统一 | 保持 24rpx 大圆角（与项目规范一致） |
| 货币转换器 | 签名交互组件 | 不采用（与学习工具定位无关） |
| 间距 | 4px 基础单位，px | 改为 rpx 单位，保持比例关系 |
| 语义正向色 | `#2ead4b` Wise 绿 | 不能复用（与品牌 CTA 冲突），改用 `#4caf50` |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|------|------|
| Wise Sans 专有 display 字体 weight 900 | 专有字体不可嵌入小程序，Georgia 衬线可替代品牌感 |
| 126px mega hero / 96px xxl hero | 小程序屏幕 750rpx 宽度限制，最大标题约 56rpx |
| 货币转换器组件 | 与项目学习工具定位无关 |
| 鼠尾草绿画布 `#e8ebe6` | 项目已确定暖奶油画布 `#faf9f5` |
| 酸橙绿 CTA `#9fe870` | 项目已确定珊瑚色 `#cc785c` 为主色 |
| `#0e0f0c` ink（带橄榄暖意） | 项目使用 `#141413` 暖墨（带棕暖意），色相不同 |
| px 单位 | 微信小程序使用 rpx 响应式单位 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Wise 原色 | 刷个冯题映射 | 色值 | 用途 |
|-----------|-------------|------|------|
| `#9fe870`（酸橙绿 CTA） | 珊瑚主色 | `#cc785c` | CTA 按钮、品牌强调 |
| `#cdffad`（品绿激活） | 珊瑚激活 | `#a9583e` | 按钮按下态 |
| `#c5edab`（品绿中性） | 珊瑚中性 | `#b86a52` | 中等强调填充 |
| `#e2f6d5`（品绿淡） | 奶油卡片 | `#efe9de` | 柔和表面/徽章背景 |
| `#e8ebe6`（鼠尾草画布） | 暖奶油画布 | `#faf9f5` | 页面背景 |
| `#ffffff`（白色卡片） | 奶油白卡片 | `#faf9f5` | 卡片内部 |
| `#0e0f0c`（ink 暖黑） | 暖墨文字 | `#141413` | 主文字 |
| `#163300`（ink 深） | 深暖墨 | `#141413` | 正向状态文字 |
| `#454745`（body） | 暖灰 | `#6c6a64` | 次要文字 |
| `#868685`（mute） | 浅暖灰 | `#8e8b82` | 最次要文字/占位符 |
| `#2ead4b`（正向绿） | 成功绿 | `#4caf50` | 正确答案（注意：不能用 `#cc785c`，避免与 CTA 混淆） |
| `#054d28`（正向深） | 成功深绿 | `#388e3c` | 正确答案按压态 |
| `#d03238`（负向红） | 错误红 | `#e74c3c` | 错误答案 |
| `#a72027`（负向深） | 错误深红 | `#c0392b` | 错误答案按压态 |
| `#320707`（负向背景） | 深红背景 | `#3a1515` | 错误徽章背景 |
| `#ffd11a`（警告黄） | 警告橙 | `#ff9800` | 注意事项 |
| `#b86700`（警告深） | 警告深橙 | `#e65100` | 警告按压态 |
| `#4a3b1c`（警告内容） | 警告内容 | `#4a3b1c` | 警告表面文字 |
| `#ffc091`（橙色点缀） | 珊瑚浅 | `#d4917a` | 装饰点缀 |
| `#38c8ff`（青色点缀） | 链接蓝 | `#3b89ff` | 装饰点缀 |

### 3.2 字体映射（用 rpx）

| Wise 层级 | 原参数 | 刷个冯题映射 | rpx 参数 |
|-----------|--------|-------------|----------|
| display-mega | 126px / 900 / Wise Sans | 不采用（超出小程序屏幕） | — |
| display-xxl | 96px / 900 / Wise Sans | 不采用（超出小程序屏幕） | — |
| display-xl | 64px / 900 / Wise Sans | Georgia 衬线 hero | `font-size: 56rpx; font-weight: 400; letter-spacing: -3rpx; line-height: 64rpx;` |
| display-lg | 47px / 400 / Wise Sans | Georgia 衬线副标题 | `font-size: 48rpx; font-weight: 400; line-height: 64rpx; letter-spacing: -1rpx;` |
| display-md | 40px / 900 / Wise Sans | 系统无衬线章节标题 | `font-size: 40rpx; font-weight: 600; line-height: 48rpx;` |
| display-sm | 32px / 600 / -0.96px / Inter | 系统无衬线卡片标题 | `font-size: 36rpx; font-weight: 600; line-height: 44rpx; letter-spacing: -2rpx;` |
| display-xs | 24px / 600 / -0.48px / Inter | 系统无衬线子标题 | `font-size: 28rpx; font-weight: 600; line-height: 36rpx; letter-spacing: -1rpx;` |
| body-lg | 20px / 400 / Inter | 系统无衬线导语 | `font-size: 30rpx; font-weight: 400; line-height: 44rpx;` |
| body-md | 16px / 400 / Inter | 系统无衬线正文 | `font-size: 28rpx; font-weight: 400; line-height: 40rpx;` |
| body-md-strong | 16px / 600 / Inter | 系统无衬线粗正文 | `font-size: 28rpx; font-weight: 600; line-height: 40rpx;` |
| body-sm | 14px / 400 / Inter | 系统无衬线辅助 | `font-size: 24rpx; font-weight: 400; line-height: 34rpx;` |
| body-sm-strong | 14px / 600 / Inter | 系统无衬线粗辅助 | `font-size: 24rpx; font-weight: 600; line-height: 34rpx;` |
| caption | 12px / 400 / Inter | 系统无衬线注释 | `font-size: 22rpx; font-weight: 400; line-height: 30rpx;` |
| button-md | 16px / 600 / Inter | 系统无衬线按钮 | `font-size: 28rpx; font-weight: 600; line-height: 40rpx;` |

### 3.3 组件设计规范

**按钮（Button）— Wise 大圆角 pill 风格**

```
button-primary（Wise 风格一级 CTA）:
  background: #cc785c（替代 #9fe870）
  color: #faf9f5（替代 #0e0f0c）
  font-size: 28rpx / font-weight: 600
  border-radius: 48rpx（Wise 24px 的 rpx 换算）
  padding: 16rpx 40rpx
  注意：Wise 的 CTA 文字是深色（因背景是亮绿），本项目 CTA 文字用浅色（因背景是深珊瑚）

button-secondary（Wise 风格二级）:
  background: #efe9de（替代 #e8ebe6）
  color: #141413
  font-size: 28rpx / font-weight: 600
  border-radius: 48rpx
  padding: 16rpx 40rpx

button-tertiary（Wise 风格三级描边）:
  background: transparent
  color: #141413
  border: 1rpx solid #141413（Wise 用 1px ink 描边）
  border-radius: 48rpx
  padding: 16rpx 40rpx
```

**卡片（Card）— Wise 大圆角 + 表面对比**

```
card-content（Wise 风格白色卡片）:
  background: #faf9f5（替代 #ffffff）
  color: #141413
  border-radius: 48rpx（Wise 24px 的 rpx 换算）
  padding: 40rpx
  无阴影，靠色块对比表达深度

card-feature-sage（Wise 风格鼠尾草底卡片）:
  background: #efe9de（替代 #e8ebe6）
  color: #141413
  border-radius: 48rpx
  padding: 40rpx

card-feature-dark（Wise 风格深色反转卡片）:
  background: #181715（替代 #0e0f0c）
  color: #cc785c（替代 #9fe870 — 用品牌色作标题色）
  border-radius: 48rpx
  padding: 40rpx
  用途：推广/重点内容区域
```

**状态徽章（Badge）— Wise pill 形**

```
badge-positive:
  background: #e8e0d2（替代 #e2f6d5）
  color: #4caf50（替代 #2ead4b，不能用 #cc785c 避免与 CTA 冲突）
  font-size: 24rpx / font-weight: 600
  border-radius: 100rpx（pill 形）
  padding: 8rpx 24rpx

badge-negative:
  background: #3a1515（替代 #320707）
  color: #faf9f5
  font-size: 24rpx / font-weight: 600
  border-radius: 100rpx
  padding: 8rpx 24rpx

badge-warning:
  background: #fff3e0
  color: #4a3b1c
  font-size: 24rpx / font-weight: 600
  border-radius: 100rpx
  padding: 8rpx 24rpx
```

### 3.4 页面布局模板

**柔和 hero（借鉴 Wise 的 hero-band）**

```
soft-hero:
  background: #efe9de（替代 Wise 的 #e8ebe6）
  padding: 64rpx 32rpx
  content:
    headline: Georgia 56rpx / 400 / -3rpx tracking（替代 Wise Sans 900）
    body: 系统无衬线 30rpx / 400
    cta-row: button-primary + button-secondary
```

**功能网格（借鉴 Wise 的 content-band + card grid）**

```
feature-grid:
  background: #faf9f5
  padding: 48rpx 32rpx
  grid: 2-up
  gap: 24rpx
  card: card-content 样式（48rpx 圆角，40rpx 内边距）
```

**深色反转 hero（借鉴 Wise 的 hero-band-dark）**

```
hero-dark:
  background: #181715（替代 Wise 的 #0e0f0c）
  color: #cc785c（替代 Wise 的 #9fe870 — 用品牌色作标题色）
  padding: 64rpx 32rpx
  content:
    headline: Georgia 56rpx / 400 / 珊瑚色
    body: 系统无衬线 30rpx / #efe9de
```

### 3.5 WXSS 实现示例

```css
/* Wise 风格大圆角卡片 */
.card-xl-radius {
  background: #faf9f5;
  color: #141413;
  border-radius: 48rpx;
  padding: 40rpx;
}

/* Wise 风格鼠尾草底卡片（映射为奶油底） */
.card-sage {
  background: #efe9de;
  color: #141413;
  border-radius: 48rpx;
  padding: 40rpx;
}

/* Wise 风格深色反转卡片 */
.card-dark-flip {
  background: #181715;
  color: #cc785c;
  border-radius: 48rpx;
  padding: 40rpx;
}

/* Wise 风格 pill 状态徽章 */
.badge-positive {
  background: #e8e0d2;
  color: #4caf50;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 100rpx;
  padding: 8rpx 24rpx;
  display: inline-block;
}

.badge-negative {
  background: #3a1515;
  color: #faf9f5;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 100rpx;
  padding: 8rpx 24rpx;
  display: inline-block;
}

/* Wise 风格柔和 hero */
.soft-hero {
  background: #efe9de;
  padding: 64rpx 32rpx;
}

.soft-hero .headline {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  line-height: 64rpx;
  color: #141413;
}

/* Wise 风格深色反转 hero */
.hero-dark {
  background: #181715;
  padding: 64rpx 32rpx;
}

.hero-dark .headline {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  line-height: 64rpx;
  color: #cc785c;
}

/* Wise 风格 CTA 按钮（注意：文字色与 Wise 相反） */
.btn-primary {
  background: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 48rpx;
  padding: 16rpx 40rpx;
  text-align: center;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面 | 适用理由 |
|------|----------|
| 刷题页面 | 大圆角卡片 + 柔和背景适合学习沉浸感，表面对比深度不分散注意力 |
| 答题结果 | pill 状态徽章完美映射正确/错误/部分正确状态 |
| 错题本 | 柔和色调 + 大圆角适合学习复盘的轻松感 |
| 首页 hero | 柔和背景 + Georgia 标题适合工具箱入口，Wise 的 hero-band 风格直接可用 |
| 学习驾驶舱 | 柔和色调 + 状态徽章适合数据仪表盘 |
| 试卷列表 | 卡片网格 + 圆角按钮适合列表展示 |

### 4.2 不适合用在哪些页面

| 页面 | 不适用理由 |
|------|-----------|
| 数据结构可视化 | 代码工具需要深色背景，Wise 的柔和色调不适合技术可视化 |
| TCP 动画机 | 协议可视化需要精确感和深色背景，不适合大圆角柔和风格 |
| 子网计算器 | 数值工具需要精确感，大圆角会降低工具感 |

### 4.3 混搭建议

- **Wise 的大圆角 + 暖奶油色板**：48rpx 圆角在暖奶油背景上非常友好，可作为项目的默认卡片风格
- **Wise 的 pill 状态徽章 + 项目答题系统**：正确/错误/部分正确用 pill 徽章，效果优于矩形标签
- **Wise 的柔和 hero + Georgia 标题**：淡奶油背景 + Georgia 衬线标题的组合比 Wise 的 weight 900 更适合小程序
- **Wise 的深色反转 hero + 项目深色 band**：`#181715` 背景 + 珊瑚色标题，保留 Wise 的极性翻转思路
- **Wise 的表面对比深度 + 项目零阴影**：完全匹配，无需修改
- **Wise 的三层按钮 + 项目 CTA 体系**：一级珊瑚/二级奶油/三级描边的层次清晰

---

## 5. 实施检查清单

- [ ] 确认画布色使用 `#faf9f5`（非 Wise 的鼠尾草 `#e8ebe6`）
- [ ] 确认品牌色使用 `#cc785c`（非 Wise 的酸橙绿 `#9fe870`）
- [ ] 确认 CTA 按钮文字色使用 `#faf9f5` 浅色（Wise 用 `#0e0f0c` 深色，因背景不同）
- [ ] 确认圆角使用 48rpx（Wise 24px 的 rpx 换算，与项目 24rpx 基础圆角一致）
- [ ] 确认 pill 徽章使用 100rpx 圆角（保留 Wise 的 pill 形签名）
- [ ] 确认标题使用 Georgia 衬线 400 weight（非 Wise 的专有字体 900）
- [ ] 确认所有尺寸使用 rpx（非 Wise 的 px）
- [ ] 确认状态色使用项目规范色（`#4caf50` / `#e74c3c` / `#ff9800`）
- [ ] 确认深色反转使用 `#181715` + 珊瑚色标题（非 Wise 的 `#0e0f0c` + 酸橙绿）
- [ ] 确认正向色不能使用 `#cc785c`（避免与 CTA 混淆，Wise 的 `#2ead4b` 也独立于 CTA）
- [ ] 确认深色表面文字用 `#faf9f5`（Wise 的 `#e8ebe6` 改为项目规范）

---

## 6. 参考文件

- 原方案：`.claude/skills/wise-design.md`
- 项目设计规范：`design-methods/design-spec.md`
- 项目交接文档：`PROJECT_HANDOFF.md`
