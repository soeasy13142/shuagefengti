# Tesla 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/tesla-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Tesla 的设计语言是 **激进减法——产品即一切，界面几乎不存在**。核心理念：
- **全视口 Hero 摄影**：每个主要内容块填满整个屏幕，一张车、一个型号名、一对 CTA
- **近乎零 UI 装饰**：无阴影、无渐变、无边框、无图案
- **单一蓝色 CTA**：`#3E6AE1` 是整个界面唯一的色彩，仅用于主按钮
- **摄影承载全部情感重量**：UI 铬合金溶解在影像中
- **透明导航**：导航栏无可见背景、边框或阴影，漂浮在 Hero 上
- **0.33s 统一过渡时间**：所有交互状态变化使用相同时长

### 1.2 视觉 DNA
- 全视口 (100vh) 区块，每屏一个信息
- 4px 圆角按钮——极克制的圆角
- 透明 PNG 产品图在白色背景上
- 轮播驱动的 Hero + 圆点指示器
- 白色空间作为奢华信号

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| Electric Blue | `#3E6AE1` | 唯一主 CTA 按钮色 |
| Pure White | `#FFFFFF` | 所有表面、面板、导航 |
| Light Ash | `#F4F4F4` | 微妙交替表面 |
| Carbon Dark | `#171A20` | 主标题、导航文字 |
| Graphite | `#393C41` | 正文 |
| Pewter | `#5C5E62` | 三级文字、子链接 |
| Silver Fog | `#8E8E8E` | 占位符、禁用态 |
| Cloud Gray | `#EEEEEE` | 分割线 |
| Frosted Glass | `rgba(255,255,255,0.75)` | 导航毛玻璃效果 |

### 1.4 字体策略
- **Universal Sans** 分为 Display（标题）和 Text（UI）两个变体
- 仅使用 400 和 500 两个字重——无 bold、无 light
- **所有层级使用"normal" letter-spacing**——不使用负 tracking
- Display 用于 Hero 级文字（40px），Text 用于其他所有
- 无大写文本变换——全部小写自信
- 替代字体：Inter 或 SF Pro

### 1.5 布局与组件模式
- 间距基数：8px
- 按钮：4px 圆角（极克制）
- 卡片：~12px 圆角（分类卡片）
- 每屏一个信息，白色空间是奢华信号
- 无阴影、无渐变、无边框

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **极简色彩哲学**：单一 CTA 色 + 灰度梯度，与暖奶油画布的珊瑚 + 暖灰一致
- **无阴影/无渐变**：与暖奶油画布的零阴影偏好完全一致
- **400/500 双字重**：Georgia 在当前系统中使用 400，可增加 500 用于强调
- **normal letter-spacing**：当前 Georgia 标题使用 -3rpx，Tesla 风格则完全不调整——可选择性借鉴
- **白色空间作为奢华信号**：学习工具的简洁界面天然适合此理念
- **统一过渡时间**：0.33s 的一致性可直接采用

### 2.2 需要改造的设计决策
- **全视口 Hero 摄影** → 改造为全宽色块 Hero + 大标题（小程序无 100vh 概念，用 `height: 100vh` 或百分比）
- **Electric Blue CTA** → 改造为珊瑚 `#cc785c`
- **4px 极小圆角** → 改造为 8-12rpx（小程序中 4rpx 过于尖锐）
- **透明导航** → 小程序自定义导航栏需特殊配置，或使用默认导航栏
- **轮播 Hero** → 可直接使用 `swiper` 组件

### 2.3 不可迁移的设计决策
- **Universal Sans 专有字体** → 保持 Georgia + 系统字体
- **毛玻璃导航效果** → 小程序不支持 `backdrop-filter`
- **全视口摄影** → 学习工具无需车辆摄影
- **"Ask a Question" 底部聊天栏** → 小程序有 tabBar 限制

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Tesla 角色 | 刷个冯题映射 | 色值 | 说明 |
|---|---|---|---|
| Electric Blue (#3E6AE1) | 珊瑚 CTA | `#cc785c` | 唯一主按钮色 |
| Pure White (#FFFFFF) | 暖奶油画布 | `#faf9f5` | 所有表面 |
| Light Ash (#F4F4F4) | 浅暖灰 | `#f5f3ef` | 交替区域 |
| Carbon Dark (#171A20) | 暖墨文字 | `#141413` | 标题、导航 |
| Graphite (#393C41) | 正文色 | `#2a2927` | 正文（如需比 #141413 浅） |
| Pewter (#5C5E62) | 次要文字 | `#6c6a64` | 子链接、辅助 |
| Silver Fog (#8E8E8E) | 弱文字 | `#9e9c96` | 占位符 |
| Cloud Gray (#EEEEEE) | 分割线 | `#e0ddd6` | 边框、分割 |

### 3.2 字体映射（用 rpx）

| Tesla 层级 | 刷个冯题映射 | 字号 | 粗细 | 行高 | 字间距 |
|---|---|---|---|---|---|
| Hero Title 40px | Hero 大标题 | 72rpx | 400 | 1.2 | 0 |
| Product Name 17px | 工具名称 | 30rpx | 500 | 1.18 | 0 |
| Nav Item 14px | 导航标签 | 26rpx | 500 | 1.2 | 0 |
| Body Text 14px | 正文 | 26rpx | 400 | 1.43 | 0 |
| Button Label 14px | 按钮标签 | 26rpx | 500 | 1.2 | 0 |
| Promo Text 22px | 提示文字 | 40rpx | 400 | 0.91 | 0 |

### 3.3 组件设计规范

**主 CTA 按钮（极简矩形）**
```css
.btn-tesla {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 8rpx;
  padding: 8rpx 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 1.2;
  min-height: 72rpx;
  min-width: 360rpx;
  text-align: center;
  border: none;
  transition: background-color 0.33s;
}
.btn-tesla:active {
  background-color: #a9583e;
}
```

**次级 CTA（白色矩形）**
```css
.btn-tesla-secondary {
  background-color: #faf9f5;
  color: #141413;
  border-radius: 8rpx;
  padding: 8rpx 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  min-height: 72rpx;
  min-width: 360rpx;
  text-align: center;
  border: none;
  transition: background-color 0.33s;
}
```

**全宽 Hero 区块**
```css
.hero-full {
  width: 100%;
  min-height: 600rpx;
  background-color: #141413;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 48rpx;
}
.hero-full .title {
  font-family: Georgia, serif;
  font-size: 72rpx;
  font-weight: 400;
  color: #faf9f5;
  text-align: center;
}
.hero-full .actions {
  display: flex;
  gap: 16rpx;
  margin-top: 48rpx;
}
```

**分类卡片（无边框无阴影）**
```css
.category-card {
  border-radius: 24rpx;
  overflow: hidden;
  background-color: #f5f3ef;
  position: relative;
}
.category-card .label {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #faf9f5;
  background-color: rgba(20, 20, 19, 0.6);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}
```

### 3.4 页面布局模板

**首页（借鉴 Tesla 一屏一信息）**
```
┌──────────────────────────┐
│ Hero 区块（全宽深色）      │  ← 工具名称 + 简介
│ Georgia 大标题 72rpx      │
│ 双按钮组（珊瑚 + 白色）    │
├──────────────────────────┤
│ 工具卡片 1（全宽）        │  ← 每个工具占一屏
│ 浅暖灰背景               │
│ 工具名称 + 描述 + CTA     │
├──────────────────────────┤
│ 工具卡片 2（全宽）        │
│ 白色背景                 │
│ 工具名称 + 描述 + CTA     │
└──────────────────────────┘
```

### 3.5 WXSS 实现示例

```wxss
/* Tesla 风格的极简按钮对 */
.btn-group {
  display: flex;
  gap: 16rpx;
  margin-top: 48rpx;
}
.btn-primary-tesla {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 8rpx;
  padding: 16rpx 48rpx;
  font-size: 26rpx;
  font-weight: 500;
  min-height: 72rpx;
  text-align: center;
  border: none;
}
.btn-secondary-tesla {
  background-color: #faf9f5;
  color: #141413;
  border-radius: 8rpx;
  padding: 16rpx 48rpx;
  font-size: 26rpx;
  font-weight: 500;
  min-height: 72rpx;
  text-align: center;
  border: none;
}

/* Tesla 风格的全宽区块 */
.section-full {
  width: 100%;
  min-height: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 48rpx;
}
.section-full.light {
  background-color: #faf9f5;
}
.section-full.dark {
  background-color: #141413;
}

/* Tesla 风格的导航标签 */
.nav-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #141413;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background: transparent;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页/工具导航页**：一屏一个工具的全宽布局，信息层次极清晰
- **工具介绍页**：极简 Hero + 双按钮 + 产品描述，无干扰
- **轮播展示**：`swiper` 组件天然适合 Tesla 的轮播 Hero 风格
- **成就展示页**：全宽深色区块 + 大标题的仪式感

### 4.2 不适合用在哪些页面
- **做题/答题页**：一屏一信息的节奏在答题流程中过于打断
- **数据密集页**（错题统计）：极简风格无法承载复杂数据
- **设置页**：无边框无阴影的风格在表单场景缺乏引导

### 4.3 混搭建议
- **Tesla 全宽区块 + Starbucks 深色带**：统一为 `#181715` 深色表面
- **Tesla 极简按钮 + 当前珊瑚色**：按钮形态用 Tesla 的 8rpx 圆角，颜色用珊瑚
- **Tesla 无阴影卡片 + 暖奶油画布背景**：卡片无阴影靠背景色对比分层

---

## 5. 实施检查清单

- [ ] 每个主要内容块占满屏幕宽度
- [ ] 每屏最多两个 CTA 按钮（主 + 次）
- [ ] 按钮圆角使用 8rpx（极克制）
- [ ] 所有过渡使用 0.33s 统一时长
- [ ] 无阴影、无渐变、无边框
- [ ] 交替使用深色/浅色区块分隔内容
- [ ] 标题使用 Georgia 400，不使用 letter-spacing（或极微调）
- [ ] 正文使用暖墨 `#141413`，不使用纯黑
- [ ] 按钮对齐居中于内容下方
- [ ] 使用 `swiper` 实现轮播 Hero

---

## 6. 参考文件
- 原始设计分析：`.claude/skills/tesla-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
