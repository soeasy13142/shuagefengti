# Warp 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/warp-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Warp 的设计语言是终端开发环境的阅读模式美学：暖色调近黑画布 `#2b2622`（带棕色暖意，非纯黑），Inter 无衬线排版保持安静自信，偶尔出现 Instrument Serif 斜体的编辑时刻，终端截图是唯一的装饰系统。整个页面读起来像开发者的阅读模式编辑器——温暖、安静、无营销噪音。

核心原则：
- **暖黑画布**：`#2b2622` 带棕色暖意，是品牌的身份标识
- **无色彩强调**：主色是暖白 `#f7f5f0`，没有彩色品牌色
- **安静自信**：hero display 用 weight 400，不用粗体喊话
- **超窄按钮圆角**：3-4px 圆角，几乎矩形，从不使用 pill
- **终端截图 = 装饰**：唯一的视觉装饰是终端模拟截图

### 1.2 视觉 DNA

- 暖黑画布 `#2b2622` 贯穿全页，带棕色暖意
- 暖白 `#f7f5f0` 作为主色和默认文字
- 所有中性色带暖色调（非中性灰）
- 超窄按钮圆角 3-4px，几乎矩形
- 终端截图作为 hero 和内容区的装饰
- Inter 400 weight display，安静自信
- DM Mono 用于代码块和命令片段
- Instrument Serif 斜体用于偶尔的编辑时刻

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|------|------|------|
| 主色/CTA | `#f7f5f0` | 暖白，按钮填充和默认文字 |
| 画布 | `#2b2622` | 暖黑页面背景（带棕色暖意） |
| 画布柔和 | `#383330` | 卡片、mockup 背景 |
| Hairline | `#3f3a36` | 边框、分割线 |
| 文字 ink | `#f7f5f0` | 默认文字（与主色统一） |
| Body 强调 | `#dad2c1` | 中等强调文字 |
| Body | `#c9c0ad` | 次要文字 |
| Mute | `#aea69c` | 最次要文字 |

### 1.4 字体策略

三字体系统：
- **Inter**：所有 display / body / button 角色，权重 400 / 500
- **DM Mono**：终端模拟、代码块、命令片段，权重 400
- **Instrument Serif**：偶尔的编辑斜体时刻，权重 400

Display 层级使用负字距：`-1.6px`（64px hero）。标题 sentence-case。Weight 400 是 display 天花板。

### 1.5 布局与组件模式

- 基础单位 4px，间距 token 到 96px
- Hero padding 96px top/bottom，卡片内边距 24px
- 按钮圆角 3px（极窄），卡片圆角 4px
- 终端截图 3:2 比例，`4px` 圆角
- 2-up hero 分割（两个终端截图并排）
- Partner logo 5-up flex 行

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|------|------|
| 暖色调深色画布 | `#2b2622` 的暖意与项目暖奶油调性一致 |
| 安静自信的排版 | Georgia 400 weight 与 Inter 400 的克制风格一致 |
| 终端截图装饰 | 适合数据结构可视化、子网计算器等技术工具 |
| 极窄按钮圆角 | 功能型按钮用窄圆角（但项目主色按钮用 pill） |
| 暖色中性色系统 | 所有灰色带暖意的思路与项目一致 |
| DM Mono 代码风格 | 等宽字体用于技术内容 |

### 2.2 需要改造的设计决策

| 决策 | 原方案 | 改造方向 |
|------|--------|----------|
| 画布色 | 暖黑 `#2b2622` | 改为暖奶油 `#faf9f5`（项目默认亮色模式） |
| 主色 | 暖白 `#f7f5f0` | 改为珊瑚色 `#cc785c` |
| 文字色 | 暖白 on 暖黑 | 改为暖墨 `#141413` on 暖奶油 |
| 按钮圆角 | 3px 极窄 | CTA 按钮用 100rpx pill（项目规范），功能按钮用 12rpx |
| 字体 | Inter + DM Mono + Instrument Serif | 改为 Georgia 标题 + 系统字体正文 |
| Hero 终端截图 | 2-up 分割布局 | 改为单列卡片布局（小程序屏幕限制） |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|------|------|
| 暖黑画布模式 | 项目采用暖奶油亮色模式 |
| 无色彩强调 | 项目需要珊瑚色 CTA 强调 |
| 3px 极窄按钮 | 项目规范要求 pill 形 CTA 按钮 |
| Instrument Serif 字体 | 专有/特定字体不可嵌入小程序 |
| 2-up hero 分割 | 小程序屏幕宽度 750rpx 不适合并排 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Warp 原色 | 刷个冯题映射 | 色值 | 用途 |
|-----------|-------------|------|------|
| `#f7f5f0`（暖白主色） | 珊瑚主色 | `#cc785c` | CTA 按钮 |
| `#2b2622`（暖黑画布） | 暖深色 | `#181715` | 深色 band 背景 |
| `#383330`（画布柔和） | 奶油卡片 | `#efe9de` | 卡片背景 |
| `#3f3a36`（hairline） | 暖奶油分割线 | `#e6dfd8` | 边框、分割线 |
| `#f7f5f0`（文字 ink） | 暖墨文字 | `#141413` | 主文字 |
| `#dad2c1`（body 强调） | 暖灰强调 | `#6c6a64` | 中等强调文字 |
| `#c9c0ad`（body） | 暖灰 | `#8e8b82` | 次要文字 |
| `#aea69c`（mute） | 浅暖灰 | `#a09d96` | 最次要文字 |

### 3.2 字体映射（用 rpx）

| Warp 层级 | 原参数 | 刷个冯题映射 | rpx 参数 |
|-----------|--------|-------------|----------|
| display-xl | 64px/400/-1.6px | Georgia 衬线 | `font-size: 56rpx; font-weight: 400; letter-spacing: -3rpx;` |
| display-lg | 48px/400/-1.2px | Georgia 衬线 | `font-size: 48rpx; font-weight: 400; letter-spacing: -2rpx;` |
| display-md | 32px/500/-0.8px | 系统无衬线 | `font-size: 32rpx; font-weight: 500; letter-spacing: -1rpx;` |
| display-sm | 24px/500/-0.4px | 系统无衬线 | `font-size: 28rpx; font-weight: 500; letter-spacing: -1rpx;` |
| display-serif | 48px/400/serif italic | Georgia 衬线 | `font-size: 48rpx; font-style: italic; font-weight: 400;` |
| body-lg | 18px/400 | 系统无衬线 | `font-size: 30rpx; font-weight: 400; line-height: 44rpx;` |
| body-md | 16px/400 | 系统无衬线 | `font-size: 28rpx; font-weight: 400; line-height: 40rpx;` |
| body-sm | 14px/400 | 系统无衬线 | `font-size: 24rpx; font-weight: 400; line-height: 34rpx;` |
| caption | 12px/400 | 系统无衬线 | `font-size: 22rpx; font-weight: 400; line-height: 30rpx;` |
| code | 13px/400 | monospace | `font-family: monospace; font-size: 24rpx; line-height: 34rpx;` |
| code-md | 14px/400 | monospace | `font-family: monospace; font-size: 26rpx; line-height: 36rpx;` |
| button-md | 14px/500 | 系统无衬线 | `font-size: 24rpx; font-weight: 500;` |

### 3.3 组件设计规范

**按钮（Button）**

```
button-primary:
  background: #cc785c
  color: #faf9f5
  font-size: 24rpx
  font-weight: 500
  border-radius: 12rpx (功能级) / 100rpx (CTA 级)
  padding: 16rpx 32rpx

button-secondary-ghost:
  background: transparent
  color: #141413
  font-size: 24rpx
  font-weight: 500
  border-radius: 12rpx
  padding: 16rpx 32rpx
```

**卡片（Card）**

```
card-content:
  background: #efe9de
  color: #141413
  border: 1rpx solid #e6dfd8
  border-radius: 8rpx
  padding: 40rpx

card-mockup:
  background: #efe9de
  color: #141413
  border: 1rpx solid #e6dfd8
  font-family: monospace
  border-radius: 8rpx
  padding: 32rpx
```

**终端模拟（Terminal Mockup）**

```
terminal-mockup:
  background: #181715
  color: #faf9f5
  font-family: monospace
  font-size: 24rpx
  border-radius: 8rpx
  padding: 32rpx
  aspect-ratio: 3:2
```

### 3.4 页面布局模板

**安静 hero（借鉴 Warp 的 hero-band）**

```
quiet-hero:
  background: #faf9f5
  padding: 96rpx 32rpx
  content:
    headline: Georgia 56rpx / 400 / -3rpx tracking
    body: 系统无衬线 30rpx / 400
    cta-row: button-primary + button-secondary-ghost
```

**终端截图卡片（借鉴 Warp 的 card-mockup）**

```
terminal-card:
  background: #181715
  border-radius: 8rpx
  padding: 32rpx
  content:
    header: 红/黄/绿三个圆点
    body: monospace 代码内容
    用于：代码示例、命令行模拟
```

**Partner logo 行（借鉴 Warp 的 partner-logo-tile）**

```
logo-row:
  display: flex
  gap: 16rpx
  wrap: wrap
  tile:
    background: #efe9de
    border-radius: 8rpx
    padding: 32rpx
    logo: 灰度 SVG
```

### 3.5 WXSS 实现示例

```css
/* Warp 风格安静 hero */
.quiet-hero {
  background: #faf9f5;
  padding: 96rpx 32rpx;
}

.quiet-hero .headline {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  line-height: 64rpx;
  color: #141413;
}

/* Warp 风格终端模拟 */
.terminal-mockup {
  background: #181715;
  color: #faf9f5;
  font-family: monospace;
  font-size: 24rpx;
  line-height: 34rpx;
  border-radius: 8rpx;
  padding: 32rpx;
}

.terminal-mockup .header-dots {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.terminal-mockup .dot-red { width: 16rpx; height: 16rpx; border-radius: 50%; background: #e74c3c; }
.terminal-mockup .dot-yellow { width: 16rpx; height: 16rpx; border-radius: 50%; background: #ff9800; }
.terminal-mockup .dot-green { width: 16rpx; height: 16rpx; border-radius: 50%; background: #4caf50; }

/* Warp 风格暖色卡片 */
.card-warm {
  background: #efe9de;
  color: #141413;
  border: 1rpx solid #e6dfd8;
  border-radius: 8rpx;
  padding: 40rpx;
}

/* Warp 风格 italic 编辑时刻 */
.editorial-italic {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 48rpx;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -1rpx;
  color: #141413;
}

/* Warp 风格暖色 hairline */
.warm-hairline {
  height: 1rpx;
  background: #e6dfd8;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 页面 | 适用理由 |
|------|----------|
| 数据结构可视化 | 终端模拟 + monospace + 安静排版完美契合 |
| TCP 动画机 | 终端模拟 + 代码风格适合协议可视化 |
| 子网计算器 | monospace 数值展示 + 安静排版适合计算工具 |
| 首页 hero | 安静自信的 Georgia 标题适合工具箱入口 |

### 4.2 不适合用在哪些页面

| 页面 | 不适用理由 |
|------|-----------|
| 刷题页面 | 安静风格太克制，刷题需要适度的视觉激励 |
| 答题结果 | 成就感展示需要更丰富的色彩层次 |
| 学习驾驶舱 | 数据仪表盘需要更鲜明的色彩对比 |

### 4.3 混搭建议

- **Warp 的终端模拟 + 暖奶油色板**：深色终端卡片在暖奶油背景上形成对比
- **Warp 的 Georgia italic + 项目 serif 标题**：编辑时刻用 Georgia italic 强调
- **Warp 的暖色中性色系统**：所有灰色带暖意，与项目暖调一致
- **Warp 的安静 hero + 珊瑚 CTA**：安静标题 + 珊瑚按钮形成"克制中的一抹暖色"

---

## 5. 实施检查清单

- [ ] 确认画布色使用 `#faf9f5`（非暖黑 `#2b2622`）
- [ ] 确认主色使用 `#cc785c`（非暖白 `#f7f5f0`）
- [ ] 确认深色终端卡片使用 `#181715`（非 `#2b2622`）
- [ ] 确认所有中性色带暖色调
- [ ] 确认标题使用 Georgia 衬线 400 weight
- [ ] 确认 monospace 使用系统 monospace 字体
- [ ] 确认所有尺寸使用 rpx
- [ ] 确认 CTA 按钮使用 pill 形（非 3px 窄圆角）
- [ ] 确认终端模拟卡片保持深色背景
- [ ] 确认 italic 编辑时刻使用 Georgia italic

---

## 6. 参考文件

- 原方案：`.claude/skills/warp-design.md`
- 项目设计规范：`design-methods/design-spec.md`
- 项目交接文档：`PROJECT_HANDOFF.md`
