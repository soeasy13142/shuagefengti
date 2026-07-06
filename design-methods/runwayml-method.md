# Runway 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/runwayml-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Runway 的设计语言是"电影级暗室编辑器"——全出血摄影和视频本身就是主要 UI 元素，界面退居近乎不可见的位置。核心理念是**视觉内容即设计**：不用图标或图表说明功能，而是展示实际的 AI 生成/增强图像。界面本身刻意隐形：最少边框、零阴影、冷灰文字、深色调色板，让摄影获得最大焦点。

### 1.2 视觉 DNA
- 电影级全出血摄影/视频作为主要 UI 元素
- 单字体系统：abcNormal 处理从 48px display 到 11px 微标签的所有文字
- 深色主调 + 冷灰中性色（`#767d88`、`#7d848e`）
- 零阴影、最少边框——界面刻意不可见
- 紧凑 display 排版（line-height 1.0）+ 负字间距（-0.9px 到 -1.2px）
- 大写标签 + 正字间距用于导航结构
- Weight 450（不常见的中间值）用于小号大写文字——精确工艺感

### 1.3 色彩策略
- **纯黑 `#000000`**：主背景和最大强调文字
- **深黑 `#030303`**：几乎不可察觉的分层深色表面变体
- **暗表面 `#1a1a1a`**：卡片背景和提升的深色容器
- **纯白 `#ffffff`**：深色表面上的主文字
- **冷灰 `#767d88`**：二级文字，明显的蓝灰冷中性
- **冷银 `#c9ccd1`**：浅色边框和分割线
- **无渐变**——视觉丰富度完全来自摄影内容

### 1.4 字体策略
- **单字体**：abcNormal（专有几何无衬线），替代方案 Inter 或 DM Sans
- **display**：48px / weight 400 / line-height 1.0 / letter-spacing -1.2px
- **body**：16px / weight 400-600 / line-height 1.30-1.50
- **标签**：14px / weight 500-600 / uppercase / letter-spacing 0.35px
- **微标签**：11px / weight 450 / line-height 1.30

### 1.5 布局与组件模式
- 最大容器宽度 1600px（电影宽幅）
- Hero：全视口，边到边
- 图片网格：不对称、杂志式混合尺寸
- 边框圆角：4px（锐利）→ 8px（标准）→ 16px（大方）——**不是药丸形**
- 基础间距单位 8px

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
| 设计决策 | 原始参数 | 刷个冯题适配 |
|---|---|---|
| 零阴影原则 | 无 box-shadow | 与暖奶油画布完全兼容 |
| 单字体系统理念 | abcNormal 全场景 | Georgia（标题）+ 系统字体（正文）可覆盖 |
| 紧凑 display 排版 | line-height 1.0 | 可用于大标题 |
| 冷灰中性色 | `#767d88` | 可映射为 `#6c6a64` 暖灰，保持冷暖一致 |
| 小圆角（4-8px） | 非药丸形 | 可用于输入框、小标签（8-16rpx） |
| 大写标签 + 正字间距 | 14px uppercase + 0.35px | 可用于章节标题标签 |

### 2.2 需要改造的设计决策
| 设计决策 | 原始参数 | 改造方案 |
|---|---|---|
| 纯黑画布 | `#000000` | 改为暖奶油 `#faf9f5` 作为默认画布 |
| 深色表面 | `#1a1a1a` | 改为 `#181715` 深海军蓝 |
| 冷灰中性色 | `#767d88` 蓝灰 | 改为 `#6c6a64` 暖灰 |
| 全出血摄影 hero | 满屏图片 | 改为带内边距的卡片式图片展示 |
| 48px display | abcNormal 48px | 缩小到 56rpx Georgia |
| Weight 450 微标签 | 不常见中间值 | 改为 weight 500 或 600 |

### 2.3 不可迁移的设计决策
| 设计决策 | 原因 |
|---|---|
| abcNormal 字体 | 专有字体，无法在小程序使用 |
| 全出血摄影/视频 | 小程序无全宽 viewport，且项目无摄影素材 |
| 不对称杂志式图片网格 | 小程序布局受限于 WXML，复杂网格难以实现 |
| 1600px 最大容器 | 小程序宽度固定 750rpx |
| 杂志式滚动体验 | 小程序页面结构不同于网站 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Runway 原色 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#000000` Runway Black | `#faf9f5` 暖奶油 | 默认画布背景 |
| `#030303` Deep Black | `#181715` 深海军蓝 | 深色表面（暗色模式区域） |
| `#1a1a1a` Dark Surface | `#efe9de` 奶油卡片 | 卡片/容器表面 |
| `#ffffff` Pure White | `#141413` 暖墨 | 主文字（浅色画布上） |
| `#767d88` Cool Slate | `#6c6a64` 暖灰 | 二级文字、辅助信息 |
| `#7d848e` Mid Slate | `#8a8780` | 三级文字、元数据 |
| `#a7a7a7` Muted Gray | `#b0ada6` | 弱化内容、时间戳 |
| `#c9ccd1` Cool Silver | `#d6d0c4` | 浅色边框、分割线 |
| `#27272a` Border Dark | `#2a2927` | 深色边框 |

### 3.2 字体映射（用 rpx）

| Runway token | 刷个冯题实现 |
|---|---|
| Display/Hero 48px/400/1.0/-1.2px | Georgia 56rpx / 400 / line-height 1.0 / letter-spacing -2rpx |
| Section Heading 40px/400/1.0-1.1/-1px | Georgia 48rpx / 400 / line-height 1.1 / letter-spacing -1rpx |
| Sub-heading 36px/400/1.0/-0.9px | Georgia 44rpx / 400 / line-height 1.0 / letter-spacing -1rpx |
| Card Title 24px/400/1.0 | Georgia 36rpx / 400 / line-height 1.2 |
| Body 16px/400-600/1.30-1.50 | 系统字体 28rpx / 400-600 / line-height 1.5 |
| Caption/Label 14px/500-600/1.25-1.43 | 系统字体 26rpx / 500 / line-height 1.3 / uppercase |
| Small 13px/400/1.30 | 系统字体 24rpx / 400 / line-height 1.3 |
| Micro/Tag 11px/450/1.30 | 系统字体 22rpx / 500 / line-height 1.3 / uppercase |

### 3.3 组件设计规范

**紧凑标签（Uppercase）**
```css
.label-uppercase {
  font-size: 26rpx;
  font-weight: 500;
  line-height: 1.3;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: #6c6a64;
}
```

**暗色卡片**
```css
.card-dark {
  background-color: #181715;
  color: #faf9f5;
  border-radius: 16rpx;  /* 8px 小圆角 */
  padding: 40rpx;
  border: 1rpx solid #2a2927;
}
```

**浅色卡片**
```css
.card-light {
  background-color: #efe9de;
  color: #141413;
  border-radius: 16rpx;
  padding: 40rpx;
}
```

**极简按钮**
```css
.btn-minimal {
  background-color: transparent;
  color: #141413;
  border: 1rpx solid #d6d0c4;
  border-radius: 8rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 600;
}
```

### 3.4 页面布局模板

**编辑器风格布局**
```
┌─────────────────────────────┐
│  标签区（uppercase 灰色标签）  │
├─────────────────────────────┤
│  主内容区                     │
│  ┌─────────────────────┐    │
│  │  图片/内容卡片        │    │  ← 小圆角、无阴影
│  │  16rpx 圆角           │    │
│  └─────────────────────┘    │
│  正文文字（紧凑行高）          │
├─────────────────────────────┤
│  操作区（极简按钮）           │
└─────────────────────────────┘
```

### 3.5 WXSS 实现示例

**紧凑 display 标题**
```css
.title-display {
  font-family: Georgia, serif;
  font-size: 56rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -2rpx;
  color: #141413;
}
```

**冷灰二级文字**
```css
.text-secondary {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.5;
  color: #6c6a64;
}
```

**小圆角容器**
```css
.container-subtle {
  border-radius: 16rpx;
  background-color: #efe9de;
  padding: 40rpx;
  border: 1rpx solid #d6d0c4;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具详情页**：紧凑排版 + 小圆角卡片，信息密度高
- **学习记录/历史页**：标签分类 + 列表布局，编辑器风格
- **代码/题目展示区**：单字体系统理念 + 紧凑行高
- **设置页面**：极简按钮 + 小圆角输入框

### 4.2 不适合用在哪些页面
- **首页 hero 区域**：Runway 的全出血摄影风格无法在小程序中实现
- **学习卡片浏览页**：Runway 的杂志式网格不适合小程序的线性布局
- **需要活泼氛围的页面**：Runway 的冷灰调过于克制

### 4.3 混搭建议
- **紧凑排版 + 暖色调**：保留 Runway 的紧凑行高和小圆角，但使用暖奶油画布的色彩
- **标签系统借鉴**：uppercase 标签 + 正字间距可用于工具分类和章节标记
- **极简按钮用于次要操作**：在暖奶油画布上，透明底 + 边框按钮适合"更多"、"取消"等操作

---

## 5. 实施检查清单

- [ ] 默认画布 `#faf9f5`，不是纯黑
- [ ] 深色表面 `#181715`，不是 `#1a1a1a`
- [ ] 中性色使用暖灰 `#6c6a64`，不是冷灰 `#767d88`
- [ ] 卡片圆角 16rpx（对应原 8px），不是药丸形
- [ ] 标题 line-height 1.0-1.1，紧凑排版
- [ ] 标题 letter-spacing 负值（-1rpx 到 -2rpx）
- [ ] Uppercase 标签使用正字间距 1rpx
- [ ] 零阴影
- [ ] 边框 1rpx solid `#d6d0c4`
- [ ] 按钮使用小圆角 8-16rpx，不用药丸
- [ ] 触摸目标最小 80rpx

---

## 6. 参考文件

- 源文件：`.claude/skills/runwayml-design.md`
- 项目设计风格：`CLAUDE.md` § 设计风格约束
- 项目交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
