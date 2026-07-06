# Sanity 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/sanity-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Sanity 的设计语言是"开发者指挥中心"——近黑画布不是"暗色模式开关"，而是工具为终端用户构建的自然状态。核心理念是**结构化内容需要结构化舞台**：纯中性灰度色阶（无冷暖偏移）搭配鲜明的强调色点缀（霓虹绿、电光蓝、珊瑚红 CTA），像暗室控制台上的信号灯。

### 1.2 视觉 DNA
- 近黑画布 `#0b0b0b` 作为默认自然环境
- waldenburgNormal 极端负字间距（-0.32px 到 -4.48px at display），精确工程感
- 纯中性灰度色阶——无冷暖偏移，纯消色差精度
- 鲜明强调色点缀：霓虹绿、电光蓝 `#0052ef`、珊瑚红 `#f36458`
- 药丸形主按钮（9999px radius）对比微妙圆角矩形（3-6px）用于次要操作
- IBM Plex Mono 作为技术配重
- Hover 状态统一变为电光蓝 `#0052ef`——系统级"激活"信号

### 1.3 色彩策略
- **画布**：近黑 `#0b0b0b`，不是纯黑
- **提升表面**：`#212121`（卡片）、`#353535`（边框）
- **CTA**：珊瑚红 `#f36458`，温暖的唯一触感
- **交互 hover**：电光蓝 `#0052ef`，全局统一
- **成功/强调**：霓虹绿 `#19d600`（sRGB 回退）
- **灰度色阶**：`#0b0b0b` → `#212121` → `#353535` → `#797979` → `#b9b9b9` → `#ededed` → `#ffffff`

### 1.4 字体策略
- **标题**：waldenburgNormal，极端负字间距，weight 400-425
- **正文**：waldenburgNormal，line-height 1.50
- **代码/技术标签**：IBM Plex Mono，uppercase
- **替代**：Inter 或 Space Grotesk

### 1.5 布局与组件模式
- 8px 基础单位
- 药丸形主按钮（9999px）vs 小圆角次要操作（3-6px）
- 深度完全通过色彩明度变化表达——无传统阴影
- 段间距 64-120px，暗色画布上需要更多呼吸空间
- 1px 边框作为主要空间分隔符

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
| 设计决策 | 原始参数 | 刷个冯题适配 |
|---|---|---|
| 纯中性灰度色阶 | 无冷暖偏移 | 暖奶油画布有暖偏移，但灰度层级结构可借鉴 |
| 药丸形主按钮 | 9999px | 直接采用 |
| 色彩明度表达深度 | 无阴影 | 与暖奶油画布零阴影原则一致 |
| 1px 边框分隔 | `#212121`/`#353535` | 可映射为暖色调边框 |
| 极端负字间距 display | -2px 到 -4.48px | 可用于大标题 |
| IBM Plex Mono 用于代码标签 | uppercase | 可用于技术标签、题目编号 |

### 2.2 需要改造的设计决策
| 设计决策 | 原始参数 | 改造方案 |
|---|---|---|
| 近黑画布 | `#0b0b0b` | 改为暖奶油 `#faf9f5`，深色区域用 `#181715` |
| 珊瑚红 CTA | `#f36458` | 改为珊瑚色 `#cc785c`，保持温暖感 |
| 电光蓝 hover | `#0052ef` | 改为珊瑚色 active `#a9583e`，保持暖色调一致性 |
| 霓虹绿强调 | `#19d600` | 可保留用于"已完成"状态，或改为暖绿 `#6b8e5a` |
| 纯消色差灰度 | 无冷暖 | 改为暖灰梯度：`#141413` → `#2a2927` → `#6c6a64` → `#b0ada6` → `#efe9de` |
| 极端负字间距 -4.48px | 112px hero | 缩小到 -3rpx 用于 72rpx 标题 |

### 2.3 不可迁移的设计决策
| 设计决策 | 原因 |
|---|---|
| waldenburgNormal 字体 | 专有字体；替代 Georgia（标题）+ 系统字体（正文） |
| 112px hero display | 小程序屏幕宽度限制 |
| display-p3 广色域绿色 | 微信小程序不支持 display-p3 色彩空间 |
| OpenType 特性控制 | 微信小程序 WXSS 不支持 font-feature-settings |
| 全宽暗色段落 120px 间距 | 可缩小到 96rpx |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Sanity 原色 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#0b0b0b` near-black | `#faf9f5` 暖奶油 | 默认画布 |
| `#0b0b0b`（深色模式） | `#181715` 深海军蓝 | 深色区域画布 |
| `#212121` dark gray | `#efe9de` 奶油卡片 | 浅色卡片表面 |
| `#212121`（深色模式） | `#2a2927` | 深色卡片表面 |
| `#353535` medium dark | `#d6d0c4` | 边框、分割线 |
| `#ffffff` white | `#141413` 暖墨 | 浅色画布主文字 |
| `#ffffff`（深色模式） | `#faf9f5` | 深色画布主文字 |
| `#b9b9b9` silver | `#6c6a64` | 二级文字 |
| `#797979` medium gray | `#8a8780` | 三级文字 |
| `#f36458` Sanity Red | `#cc785c` 珊瑚色 | 主 CTA |
| `#0052ef` Electric Blue | `#a9583e` | active/hover 状态 |
| `#19d600` neon green | `#6b8e5a` | 成功状态 |

### 3.2 字体映射（用 rpx）

| Sanity token | 刷个冯题实现 |
|---|---|
| Display/Hero 112px/400/1.0/-4.48px | Georgia 72rpx / 400 / line-height 1.0 / letter-spacing -3rpx |
| Hero Secondary 72px/400/1.05/-2.88px | Georgia 64rpx / 400 / line-height 1.05 / letter-spacing -2rpx |
| Section Heading 48px/400/1.08/-1.68px | Georgia 52rpx / 400 / line-height 1.1 / letter-spacing -1rpx |
| Heading Medium 32px/425/1.24/-0.32px | Georgia 40rpx / 400 / line-height 1.24 |
| Body 16px/400/1.50 | 系统字体 28rpx / 400 / line-height 1.5 |
| Caption 13px/400-500/1.30-1.50 | 系统字体 24rpx / 400 / line-height 1.4 |
| Micro/Label 11px/500-600/1.0-1.50 | 系统字体 22rpx / 500 / uppercase |
| Code Body 15px/400/1.50 | monospace 26rpx / 400 / line-height 1.5 |

### 3.3 组件设计规范

**药丸主 CTA**
```css
.btn-pill-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 400;
}
.btn-pill-primary:active {
  background-color: #a9583e;
}
```

**药丸次要按钮（深色）**
```css
.btn-pill-secondary-dark {
  background-color: #181715;
  color: #b9b9b9;
  border-radius: 9999rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
}
```

**微妙圆角次要操作**
```css
.btn-subtle {
  background-color: #2a2927;
  color: #6c6a64;
  border-radius: 10rpx;  /* 5px */
  padding: 0 24rpx;
  font-size: 26rpx;
  border: 1rpx solid #2a2927;
}
```

**暗色内容卡片**
```css
.card-dark-content {
  background-color: #2a2927;
  border: 1rpx solid #3a3937;
  border-radius: 12rpx;
  padding: 36rpx;
  color: #faf9f5;
}
```

**技术标签（IBM Plex Mono 风格）**
```css
.label-tech {
  font-family: Menlo, Courier, monospace;
  font-size: 22rpx;
  font-weight: 500;
  text-transform: uppercase;
  color: #6c6a64;
  letter-spacing: 1rpx;
}
```

### 3.4 页面布局模板

**指挥中心风格**
```
┌─────────────────────────────┐
│  技术标签（uppercase monospace）│
├─────────────────────────────┤
│  大标题（Georgia 负字间距）    │
│  二级文字（暖灰）              │
├─────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 暗卡片 │ │ 暗卡片 │ │ 暗卡片 │ │  ← 1px 边框
│  │ 技术   │ │ 技术   │ │ 技术   │ │
│  └──────┘ └──────┘ └──────┘ │
├─────────────────────────────┤
│  [珊瑚红药丸 CTA]             │
└─────────────────────────────┘
```

### 3.5 WXSS 实现示例

**深色卡片网格**
```css
.card-grid-dark {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}
.card-dark {
  background-color: #2a2927;
  border: 1rpx solid #3a3937;
  border-radius: 12rpx;
  padding: 36rpx;
  flex: 1;
  min-width: 300rpx;
}
.card-dark .card-title {
  color: #faf9f5;
  font-size: 32rpx;
  font-weight: 400;
  letter-spacing: -1rpx;
}
.card-dark .card-body {
  color: #b9b9b9;
  font-size: 24rpx;
  line-height: 1.5;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **代码展示/题目详情**：技术标签 + monospace + 暗色卡片
- **学习仪表盘**：指挥中心风格的数据展示
- **设置页面**：小圆角输入框 + 1px 边框
- **搜索/筛选**：pill 形筛选标签 + 暗色 surface

### 4.2 不适合用在哪些页面
- **首页 hero**：Sanity 的极端暗色风格与暖奶油画布冲突
- **轻松学习页**：过于"开发者工具"气质
- **儿童/初学者界面**：过于严肃

### 4.3 混搭建议
- **技术标签借鉴**：monospace uppercase 标签可用于题目分类、难度标记
- **1px 边框卡片**：在暖奶油画布上，用 `#d6d0c4` 边框替代阴影
- **药丸 + 小圆角对比**：主操作用药丸，次要用小圆角，形成 Sanity 式的形状层级

---

## 5. 实施检查清单

- [ ] 默认画布 `#faf9f5`，不是 `#0b0b0b`
- [ ] 深色区域用 `#181715`，不是纯黑
- [ ] CTA 珊瑚色 `#cc785c`，active `#a9583e`
- [ ] 灰度使用暖色调梯度
- [ ] 药丸按钮 9999rpx 用于主 CTA
- [ ] 小圆角 10-12rpx 用于次要操作和卡片
- [ ] 1px 边框用 `#d6d0c4`（浅色）或 `#3a3937`（深色）
- [ ] 零阴影
- [ ] display 标题负字间距 -2rpx 到 -3rpx
- [ ] 技术标签使用 monospace + uppercase
- [ ] 触摸目标最小 80rpx

---

## 6. 参考文件

- 源文件：`.claude/skills/sanity-design.md`
- 项目设计风格：`CLAUDE.md` § 设计风格约束
- 项目交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
