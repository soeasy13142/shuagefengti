# Raycast 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/raycast-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Raycast 的设计哲学是 **"营销页面即产品截图"**。整个网站读起来像是 Raycast 产品 UI 的放大版：纯近黑背景、1px 发丝边框、命令面板风格卡片、Inter 字体配合 ss03 风格集（替代 `g` 字形）、白色 CTA 药丸——整个页面就是一个连续的暗色模式。

核心原则：
- 单一暗色模式：整个网站只有一种表面模式——深色
- 白色 CTA 药丸：`#ffffff` 是品牌唯一亮色操作色
- 4 步表面阶梯：`#07080a` → `#0d0d0d` → `#101111` → `#121212`，靠色温变化表达深度
- Inter + ss03：品牌签名的替代 `g` 字形
- 1px 发丝边框：`#242728`，无阴影
- 饱和类别色：黄/红/绿/蓝仅用于扩展插图，不在 chrome 上

### 1.2 视觉 DNA

- **纯近黑画布** `#07080a`：整个页面背景
- **白色 CTA** `#ffffff`：品牌唯一亮色
- **4 步表面阶梯**：靠色温而非阴影表达层次
- **Inter + ss03**：替代 `g` 字形是品牌签名
- **6-16px 圆角**：6px 键帽、8px 按钮、10px 卡片、16px 大容器
- **红色对角条纹渐变**：Hero 唯一装饰，每页仅一次
- **命令面板模拟**：产品 UI 即品牌装饰

### 1.3 色彩策略

| 用途 | 色值 | 与暖奶油画布差异 |
|---|---|---|
| 画布 | `#07080a`（纯近黑） | 与 `#faf9f5` 完全对立 |
| 表面 | `#0d0d0d` | 暗色阶梯第一步 |
| 表面提升 | `#101111` | 暗色阶梯第二步 |
| 表面卡片 | `#121212` | 暗色阶梯第三步 |
| 白色 CTA | `#ffffff` | 与 `#cc785c` 珊瑚色完全不同 |
| 墨水 | `#f4f4f6`（微冷白） | 暗色面文字 |
| 正文 | `#cdcdcd`（中灰） | 暗色面正文 |
| 柔和 | `#9c9c9d` | 暗色面辅助 |
| 发丝线 | `#242728` | 暗色面边框 |
| 蓝色强调 | `#57c1ff` | 信息色 |
| 红色强调 | `#ff6161` | 错误/Slack |
| 绿色强调 | `#59d499` | 成功 |
| 黄色强调 | `#ffc533` | Hacker News |
| 红色条纹 | `#ff5757` → `#a1131a` | Hero 装饰 |

### 1.4 字体策略

Inter + ss03 风格集，品牌签名：
- **600**：display 64px、56px
- **500**：标题 24px/22px/20px/18px、正文强调 16px/14px、按钮 14px
- **400**：正文 18px/16px/14px、标注 13px/12px

行高：display 1.1-1.17（紧凑），正文 1.6（宽松）。字间距微正 0-0.4px。

`font-feature-settings: "calt", "kern", "liga", "ss03"` 全站启用。

### 1.5 布局与组件模式

- **96px 章节间距**：暗色画布连续
- **6-16px 多级圆角**：6px 键帽、8px 按钮、10px 卡片、16px 大容器
- **36px 按钮高度**：紧凑
- **1px 发丝边框**：`#242728`
- **命令面板卡片**：产品 UI 模拟
- **键帽徽章**：`⌘ K` 风格键盘快捷键提示

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **表面阶梯深度系统**：靠色温变化而非阴影表达层次，完全符合暖奶油画布的零阴影理念
2. **1px 发丝边框**：比阴影更轻量，适合小程序
3. **紧凑按钮**：36px 高度适合信息密集型页面
4. **多级圆角系统**：6-16px 的精细分级比单一 24rpx 更灵活
5. **命令面板风格卡片**：适合工具类应用的交互模式

### 2.2 需要改造的设计决策

1. **纯近黑画布 → 暖奶油**：`#07080a` 完全不适用，需用 `#faf9f5`
2. **白色 CTA → 珊瑚色**：`#ffffff` 需替换为 `#cc785c`
3. **Inter + ss03 → Georgia + 系统字体**：标题用 Georgia，正文用系统字体
4. **暗色表面阶梯 → 暖色表面阶梯**：需重新定义暖色系阶梯
5. **红色条纹渐变 → 不适用**：暖奶油画布无此装饰需求
6. **键帽徽章 → 文字标签**：小程序无法渲染键盘图标

### 2.3 不可迁移的设计决策

1. **单一暗色模式**：与暖奶油画布完全对立
2. **Inter + ss03**：风格集在小程序中无法精确控制
3. **命令面板模拟**：需要产品 UI 截图，不适用
4. **红色对角条纹渐变**：品牌专属装饰
5. **app-icon-tile**：需要应用图标资源

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Raycast 原始 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#07080a` canvas | `#faf9f5` 画布 | 页面背景 |
| `#0d0d0d` surface | `#efe9de` 奶油卡片 | 卡片背景 |
| `#101111` surface-elevated | `#e8e0d2` 卡片 Active | 提升态 |
| `#121212` surface-card | `#efe9de` 奶油卡片 | 卡片背景 |
| `#ffffff` primary | `#cc785c` 珊瑚色 | CTA |
| `#f4f4f6` ink | `#141413` 暖墨 | 标题文字 |
| `#cdcdcd` body | `#141413` 暖墨 | 正文 |
| `#9c9c9d` mute | `#6c6a64` 次要文字 | 辅助信息 |
| `#242728` hairline | `#e6dfd8` 分割线 | 边框 |
| `#57c1ff` accent-blue | `#7dd3fc` 浅蓝 | 信息色 |
| `#ff6161` accent-red | `#ef4444` 红色 | 错误 |
| `#59d499` accent-green | `#34d399` 绿色 | 成功 |
| `#ffc533` accent-yellow | `#f59e0b` 黄色 | 警告 |

### 3.2 字体映射（用 rpx）

| Raycast 原始 | 刷个冯题映射 | 说明 |
|---|---|---|
| `display-xl` 64px/600 | Georgia 96rpx/400/-3rpx | Hero 标题 |
| `display-lg` 56px/500 | Georgia 80rpx/400/-3rpx | 章节标题 |
| `heading-xl` 24px/500 | Georgia 40rpx/400/-3rpx | 子标题 |
| `heading-lg` 22px/500 | 系统字体 36rpx/500 | 区块标题 |
| `body-md` 16px/400 | 系统字体 28rpx/400 | 正文 |
| `body-strong` 16px/500 | 系统字体 28rpx/500 | 强调 |
| `button-md` 14px/500 | 系统字体 28rpx/600 | 按钮 |
| `caption-sm` 12px/400 | 系统字体 22rpx/400 | 标注 |

### 3.3 组件设计规范

**Raycast 风格紧凑按钮**
```css
.btn-raycast {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 16rpx; /* Raycast 的 8px */
  padding: 12rpx 24rpx;
  height: 64rpx; /* 紧凑 */
  font-size: 28rpx;
  font-weight: 600;
}
```

**Raycast 风格表面阶梯卡片（暖色版）**
```css
.raycast-card-0 {
  background: #faf9f5; /* 画布 */
  border: 2rpx solid #e6dfd8;
  border-radius: 20rpx; /* Raycast 的 10px */
}

.raycast-card-1 {
  background: #efe9de; /* 表面 */
  border: 2rpx solid #e6dfd8;
  border-radius: 20rpx;
}

.raycast-card-2 {
  background: #e8e0d2; /* 提升 */
  border: 2rpx solid #e6dfd8;
  border-radius: 20rpx;
}
```

**Raycast 风格标签徽章**
```css
.raycast-badge {
  background: #efe9de;
  color: #6c6a64;
  border-radius: 8rpx; /* Raycast 的 4px */
  padding: 4rpx 12rpx;
  font-size: 22rpx;
  font-weight: 600;
}
```

**Raycast 风格状态标签**
```css
.raycast-pill {
  background: transparent;
  color: #6c6a64;
  border: 2rpx solid #e6dfd8;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
}

.raycast-pill.active {
  background: #141413;
  color: #faf9f5;
  border-color: #141413;
}
```

### 3.4 页面布局模板

借鉴 Raycast 的表面阶梯深度系统（暖色版）：

```
Zone 1 — Hero 区（画布 #faf9f5）
  大标题 + 珊瑚 CTA
  ↓ 64rpx

Zone 2 — 功能展示区（表面阶梯 #efe9de）
  2 列功能卡片网格
  每张卡片用不同阶梯色区分层次
  ↓ 64rpx

Zone 3 — 数据区（提升阶梯 #e8e0d2）
  学习概览指标
  ↓ 64rpx

Zone 4 — 工具区（画布 #faf9f5）
  工具卡片 + 标签
  ↓ 48rpx

Zone 5 — 底部区
  快捷入口 + 备案号
```

### 3.5 WXSS 实现示例

```css
/* Raycast 风格的表面阶梯深度系统（暖色版） */
.surface-ladder-demo {
  padding: 32rpx;
  background: #faf9f5; /* 画布 */
}

.surface-ladder-demo .step-1 {
  background: #efe9de;
  border: 2rpx solid #e6dfd8;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.surface-ladder-demo .step-2 {
  background: #e8e0d2;
  border: 2rpx solid #e6dfd8;
  border-radius: 20rpx;
  padding: 24rpx;
}

/* Raycast 风格的筛选标签栏 */
.filter-strip {
  display: flex;
  gap: 12rpx;
  padding: 16rpx 0;
}

.filter-strip .pill {
  background: transparent;
  color: #6c6a64;
  border: 2rpx solid #e6dfd8;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
}

.filter-strip .pill.active {
  background: #141413;
  color: #faf9f5;
  border-color: #141413;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

1. **子网计算器**：数据密集型页面，表面阶梯深度系统适合
2. **数据结构可视化**：紧凑的信息展示 + 标签系统
3. **TCP 动画机**：状态标签 + 紧凑控制栏
4. **学习驾驶舱**：指标卡片 + 表面阶梯

### 4.2 不适合用在哪些页面

1. **首页 Hero**：暖奶油画布的 Georgia 标题更有品牌感
2. **刷题页面**：需要温暖阅读，Raycast 风格太冷
3. **结果页**：需要情感化展示

### 4.3 混搭建议

- **数据密集页面用 Raycast 的表面阶梯**：多级色温变化表达层次
- **筛选标签用 Raycast 的药丸风格**：比传统 tab 更现代
- **紧凑按钮用于工具栏**：64rpx 高度适合信息密集
- **首页保持暖奶油画布**：Georgia 标题 + 奶油卡片
- **状态标签借鉴 Raycast**：药丸 + 选中态反转

---

## 5. 实施检查清单

- [ ] 所有颜色映射到暖奶油画布色板
- [ ] 表面阶梯用暖色系（#faf9f5 → #efe9de → #e8e0d2）
- [ ] 圆角用 24rpx（非 Raycast 的 6-16px 多级）
- [ ] CTA 用珊瑚色（非白色）
- [ ] 标题用 Georgia（非 Inter）
- [ ] 不启用 ss03 风格集
- [ ] 按钮高度 72rpx+（非 64rpx，适配触控）
- [ ] 筛选标签保留药丸风格
- [ ] 发丝边框用 `#e6dfd8`
- [ ] 不引入命令面板模拟

---

## 6. 参考文件

- 原始设计：`.claude/skills/raycast-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` § 25 Claude Design 暖奶油画布改造
