# Kraken 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/kraken-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Kraken 以紫色作为品牌核心色，在白色背景上构建专业、可信赖的加密交易所形象。设计追求"克制的自信"——用单一鲜明的品牌色（Kraken Purple）在冷白色画布上建立识别度，通过极微的阴影和 12px 圆角按钮传递现代感。

### 1.2 视觉 DNA
- Kraken Purple（`#7132f5`）作为唯一品牌色，所有 CTA 和链接均使用
- 近黑文字（`#101114`）配冷灰中性色系
- 12px 圆角按钮（圆润但不做成胶囊）
- 极微阴影（`rgba(0,0,0,0.03) 0px 4px 24px`）——几乎不可见的层次感
- 双字体系统：Kraken-Brand（标题）+ Kraken-Product（正文/UI）
- 绿色语义色（`#149e61`）仅用于成功/正面状态
- 白色主背景 + 紫色点缀的"干净交易所"美学

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| 主色 CTA | `#7132f5` | 按钮、链接、品牌强调 |
| 主色深 | `#5741d8` | 按钮描边、outlined 变体 |
| 主色深沉 | `#5b1ecf` | 最深紫色 |
| 主色浅 | `rgba(133,91,251,0.16)` | 按钮浅底色 |
| 主文字 | `#101114` | 标题、正文 |
| 中性灰 | `#686b82` | 边框、分隔线 |
| 次要文字 | `#9497a9` | 辅助信息 |
| 背景白 | `#ffffff` | 主画布 |
| 边框灰 | `#dedee5` | 分隔线 |
| 成功绿 | `#149e61` | 正面状态 |
| 成功绿深 | `#026b3f` | 徽章文字 |

### 1.4 字体策略

| 角色 | 字体 | 字号 | 字重 | 行高 | 字间距 |
|------|------|------|------|------|--------|
| Hero 标题 | Kraken-Brand | 48px | 700 | 1.17 | -1px |
| 区块标题 | Kraken-Brand | 36px | 700 | 1.22 | -0.5px |
| 子标题 | Kraken-Brand | 28px | 700 | 1.29 | -0.5px |
| 功能标题 | Kraken-Product | 22px | 600 | 1.20 | normal |
| 正文 | Kraken-Product | 16px | 400 | 1.38 | normal |
| 按钮 | Kraken-Product | 16px | 500-600 | 1.38 | normal |
| 辅助文字 | Kraken-Product | 14px | 400-700 | 1.43-1.71 | normal |
| 小字 | Kraken-Product | 12px | 400-500 | 1.33 | normal |

### 1.5 布局与组件模式

- 按钮圆角：12px（不做胶囊形）
- 阴影层级：2 级——Subtle（`rgba(0,0,0,0.03) 0px 4px 24px`）和 Micro（`rgba(16,24,40,0.04) 0px 1px 4px`）
- 间距系统：1px → 2px → 3px → 4px → 5px → 6px → 8px → 10px → 12px → 13px → 15px → 16px → 20px → 24px → 25px
- 圆角系统：3px / 6px / 8px / 10px / 12px / 16px / 9999px / 50%
- 徽章：成功状态用 `rgba(20,158,97,0.16)` 底色 + `#026b3f` 文字，6px 圆角
- 中性徽章：`rgba(104,107,130,0.12)` 底色 + `#484b5e` 文字，8px 圆角

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

**紫色语义色用于学习状态**
Kraken 的绿色（`#149e61`）用于成功状态的思路可以直接迁移。本项目可以用紫色系表示"已掌握"、绿色表示"正确"、红色表示"错误"，与学习场景天然匹配。

**12px 按钮圆角**
Kraken 的 12px 按钮圆角介于锐利和胶囊之间，适合本项目当前暖奶油画布风格。可以作为功能按钮的默认圆角值。

**极微阴影哲学**
Kraken 的 `rgba(0,0,0,0.03)` 级别阴影与暖奶油画布的"零阴影"理念接近，可以作为需要微妙层次感时的折中方案。

**双字重层级策略**
标题用 600-700、正文用 400、按钮用 500-600 的字重层级清晰，可以直接映射到本项目的 Georgia（标题）+ 系统字体（正文）体系。

**徽章设计模式**
成功/中性/警告的徽章系统可以直接用于本项目的学习状态标签（已完成、进行中、未开始）。

### 2.2 需要改造的设计决策

**品牌色替换**
- 原方案：Kraken Purple `#7132f5` 作为主色
- 本项目：珊瑚色 `#cc785c` 作为 CTA
- 改造方式：保留 Kraken 的"单一强品牌色 + 白色画布"策略，但将紫色替换为珊瑚色。Kraken Purple 的深浅变体（`#5741d8`、`#5b1ecf`、`rgba(133,91,251,0.16)`）需要映射到珊瑚色的深浅变体

**字体替换**
- 原方案：Kraken-Brand + Kraken-Product（专有字体）
- 本项目：Georgia 衬线标题 + 系统 sans-serif 正文
- 改造方式：保留 Kraken 的字重和行高策略，但将字体族替换为本项目规范。Georgia 的衬线特性与 Kraken-Brand 的粗壮无衬线风格差异较大，标题需要更大的 letter-spacing 来补偿

**白色画布 vs 暖奶油画布**
- 原方案：白色 `#ffffff` 背景
- 本项目：暖奶油 `#faf9f5` 背景
- 改造方式：Kraken 的白色卡片在暖奶油背景上可能显得太冷。需要将卡片背景调整为奶油色 `#efe9de`，保持暖色调统一

### 2.3 不可迁移的设计决策

**冷灰中性色系**
Kraken 的中性色（`#686b82`、`#9497a9`）带有蓝色冷调，与本项目的暖墨（`#141413`）和暖灰（`#6c6a64`）冲突。直接使用会破坏暖奶油画布的温度统一性。

**Kraken 专有字体**
Kraken-Brand 和 Kraken-Product 是专有字体，无法在微信小程序中使用。Georgia + system-ui 是本项目的固定选择。

**加密交易所的 UI 密度**
Kraken 作为交易所需要高密度信息展示（价格、图表、订单簿），与本项目的学习工具场景差异较大。不应迁移其信息密度策略。

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|-----------|--------|---------------|------|
| 主色 CTA | `#7132f5` | `#cc785c` | 珊瑚色替代紫色 |
| 主色深 | `#5741d8` | `#a9583e` | Active 状态 |
| 主色浅底 | `rgba(133,91,251,0.16)` | `rgba(204,120,92,0.16)` | 浅珊瑚底色 |
| 主文字 | `#101114` | `#141413` | 暖墨文字 |
| 次要文字 | `#9497a9` | `#6c6a64` | 暖灰次要文字 |
| 背景 | `#ffffff` | `#faf9f5` | 暖奶油画布 |
| 卡片背景 | `#ffffff` | `#efe9de` | 奶油卡片 |
| 边框 | `#dedee5` | `rgba(20,20,19,0.08)` | 暖调边框 |
| 成功绿 | `#149e61` | `#27a644`（Meta 绿）或保持 | 学习完成状态 |
| 成功绿深 | `#026b3f` | `#1a7a35` | 徽章文字 |

### 3.2 字体映射

| 角色 | Kraken 原值 | 本项目实现 | 说明 |
|------|------------|-----------|------|
| Hero 标题 | 48px / 700 / -1px | 48rpx / 400 / -3rpx | Georgia 衬线用 400 即可，letter-spacing 更紧 |
| 区块标题 | 36px / 700 / -0.5px | 36rpx / 400 / -2rpx | Georgia 400 = Kraken 700 的视觉重量 |
| 子标题 | 28px / 700 / -0.5px | 28rpx / 400 / -2rpx | |
| 功能标题 | 22px / 600 | 28rpx / 400 / -1rpx | 稍大以补偿 Georgia 的窄字宽 |
| 正文 | 16px / 400 / 1.38 | 28rpx / 400 / 1.6 | 行高稍宽松，适合移动阅读 |
| 按钮 | 16px / 500-600 | 28rpx / 500 / normal | 系统字体用 500 |
| 辅助文字 | 14px / 400 | 24rpx / 400 / normal | |
| 小字 | 12px / 400 | 22rpx / 400 / normal | |

### 3.3 组件设计规范

**主按钮（Primary）**
```css
background: #cc785c;
color: #faf9f5;
border-radius: 12rpx;
padding: 24rpx 32rpx;
font-size: 28rpx;
font-weight: 500;
```

**描边按钮（Outlined）**
```css
background: transparent;
color: #a9583e;
border: 2rpx solid #a9583e;
border-radius: 12rpx;
padding: 24rpx 32rpx;
```

**浅底按钮（Subtle）**
```css
background: rgba(204,120,92,0.16);
color: #cc785c;
border-radius: 12rpx;
padding: 16rpx;
```

**卡片**
```css
background: #efe9de;
border-radius: 24rpx;
box-shadow: rgba(0,0,0,0.03) 0rpx 8rpx 48rpx;
padding: 32rpx;
```

**成功徽章**
```css
background: rgba(39,162,68,0.16);
color: #1a7a35;
border-radius: 6rpx;
padding: 8rpx 16rpx;
font-size: 22rpx;
```

**中性徽章**
```css
background: rgba(108,106,100,0.12);
color: #6c6a64;
border-radius: 8rpx;
padding: 8rpx 16rpx;
font-size: 22rpx;
```

### 3.4 页面布局模板

**Hero 区（首页顶部）**
- 暖奶油背景 `#faf9f5`
- Georgia 标题 48rpx / 400 / -3rpx / `#141413`
- 副标题 28rpx / 400 / `#6c6a64`
- 珊瑚色 CTA 按钮（12rpx 圆角）
- 极微阴影层次

**功能卡片区**
- 2 列网格，16rpx 间距
- 卡片：`#efe9de` 背景，24rpx 圆角
- 图标 + 标题 + 简短描述
- 微阴影 `rgba(0,0,0,0.03) 0rpx 8rpx 48rpx`

**列表区（试卷列表、记录列表）**
- 单列卡片，12rpx 间距
- 左侧状态徽章 + 中间内容 + 右侧箭头
- 分隔线：`rgba(20,20,19,0.08)` 1rpx

**底部操作区**
- 固定底部栏
- `#efe9de` 背景，顶部 1rpx 分隔线
- 主按钮占满宽度，12rpx 圆角

### 3.5 WXSS 实现示例

**Kraken 风格主按钮**
```css
.btn-kraken-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border: none;
  border-radius: 12rpx;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.38;
  box-shadow: rgba(16,24,40,0.04) 0rpx 2rpx 8rpx;
}

.btn-kraken-primary:active {
  background-color: #a9583e;
}
```

**Kraken 风格卡片**
```css
.card-kraken {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: rgba(0,0,0,0.03) 0rpx 8rpx 48rpx;
}
```

**Kraken 风格成功徽章**
```css
.badge-kraken-success {
  display: inline-flex;
  align-items: center;
  background-color: rgba(39,162,68,0.16);
  color: #1a7a35;
  border-radius: 6rpx;
  padding: 6rpx 12rpx;
  font-size: 22rpx;
  font-weight: 500;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

- **答题结果页**：Kraken 的徽章系统（成功/中性/警告）天然适合展示答题状态
- **学习驾驶舱**：Kraken 的数据展示密度适合统计类页面
- **设置页/个人中心**：Kraken 的清晰层级和中性色调适合功能性页面

### 4.2 不适合用在哪些页面

- **首页**：Kraken 的冷白+紫风格与暖奶油画布冲突太大
- **刷题页面**：需要专注阅读的场景，Kraken 的紫色 CTA 可能分散注意力
- **错题本**：暖色调更适合学习回顾的温暖感

### 4.3 混搭建议

Kraken 最适合"提取组件级设计规范"而非整体风格迁移。建议：
- 徽章系统（成功/中性/警告）可以直接采用，只需将绿色调暖
- 按钮的 12rpx 圆角与暖奶油画布的 24rpx 卡片圆角可以共存（按钮比卡片更方正）
- 极微阴影可以作为暖奶油画布"零阴影"的补充，在需要层次感时使用
- 不建议大面积使用紫色，珊瑚色已经是本项目的 CTA 色

---

## 5. 实施检查清单

- [ ] 所有 CTA 使用珊瑚色 `#cc785c`，不用 Kraken Purple
- [ ] 按钮圆角 12rpx，不做胶囊形
- [ ] 阴影使用极微级别 `rgba(0,0,0,0.03)`
- [ ] 成功徽章使用暖绿色 + 浅底色
- [ ] 中性徽章使用暖灰 + 浅底色
- [ ] 保持暖奶油画布 `#faf9f5` 和奶油卡片 `#efe9de`
- [ ] 标题使用 Georgia 衬线，正文使用系统 sans-serif
- [ ] 所有尺寸使用 rpx 单位
- [ ] 不引入任何第三方库

---

## 6. 参考文件

- 原方案：.claude/skills/kraken-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
