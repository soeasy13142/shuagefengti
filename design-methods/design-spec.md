# 设计系统规范 — 刷个冯题

> 适用项目：刷个冯题（微信小程序学习工具箱）
> 版本：v1.0
> 更新时间：2025 年

---

## 1. 设计哲学

刷个冯题是一个面向学习者的微信小程序工具箱，设计理念强调：

- **温暖亲切**：使用暖色调画布，避免冷硬的纯白背景，营造舒适的学习氛围
- **内容优先**：设计服务于内容展示，不喧宾夺主
- **简洁高效**：工具类产品，操作路径要短，信息层级要清晰
- **一致性**：所有页面、组件遵循统一的设计语言

---

## 2. 色彩系统

### 2.1 基础色板

| 角色 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#faf9f5` | 所有页面的底层背景（暖奶油色） |
| 卡片背景 | `#efe9de` | 卡片、面板、浮层的背景 |
| 卡片激活态 | `#e8e0d2` | 卡片按下/hover 状态 |
| 主色 CTA | `#cc785c` | 主要按钮、强调元素、链接 |
| 主色激活态 | `#a9583e` | 按钮按下状态 |
| 深色表面 | `#181715` | 深色背景区域、夜间模式元素 |
| 深色表面文字 | `#faf9f5` | 深色背景上的主要文字 |
| 深色表面次要文字 | `#a09d96` | 深色背景上的辅助文字 |

### 2.2 文字色

| 角色 | 色值 | 用途 |
|------|------|------|
| 标题/正文 | `#141413` | 所有标题和主要正文（暖墨色） |
| 次要文字 | `#6c6a64` | 副标题、描述文字、时间戳 |
| 最次要文字 | `#8e8b82` | 占位符、禁用态文字 |
| 浅色背景分割线 | `#e6dfd8` | 卡片之间、区域之间的分隔 |

### 2.3 语义色

| 角色 | 色值 | 用途 |
|------|------|------|
| 成功 | `#4caf50` | 操作成功、正确答案 |
| 错误 | `#e74c3c` | 操作失败、错误答案 |
| 警告 | `#ff9800` | 注意事项、部分正确 |
| 信息 | `#2196f3` | 提示信息、帮助文字 |

---

## 3. 字体系统

### 3.1 字体族

```css
/* 标题字体 */
font-family: Georgia, 'Times New Roman', serif;

/* 正文字体 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 3.2 字号层级

| 层级 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| H1 | 36rpx | 400 | 1.4 | 页面主标题 |
| H2 | 32rpx | 400 | 1.4 | 区域标题 |
| H3 | 28rpx | 400 | 1.5 | 卡片标题 |
| Body | 28rpx | 400 | 1.6 | 正文内容 |
| Caption | 24rpx | 400 | 1.5 | 辅助说明、时间戳 |
| Small | 22rpx | 400 | 1.4 | 标签、徽章文字 |
| Micro | 20rpx | 400 | 1.3 | 极小文字、角标 |

### 3.3 字重使用

- **400 (Regular)**：默认字重，用于标题和正文
- **500 (Medium)**：用于强调文字、按钮文字
- **600 (Semi-bold)**：用于重要标签、导航激活态

---

## 4. 间距系统

### 4.1 基础单位

- 基础间距单位：`8rpx`
- 所有间距均为 `8rpx` 的倍数

### 4.2 间距 Token

| Token | 值 | 用途 |
|------|------|------|
| `--space-xs` | 8rpx | 紧凑间距（图标与文字之间） |
| `--space-sm` | 16rpx | 小间距（列表项内部） |
| `--space-md` | 24rpx | 中间距（卡片内部 padding） |
| `--space-lg` | 32rpx | 大间距（区域之间） |
| `--space-xl` | 48rpx | 超大间距（区块之间） |
| `--space-xxl` | 64rpx | 页面级间距（首尾留白） |

---

## 5. 圆角系统

| Token | 值 | 用途 |
|------|------|------|
| `--radius-sm` | 8rpx | 小元素（标签、小按钮） |
| `--radius-md` | 16rpx | 中等元素（输入框、普通按钮） |
| `--radius-lg` | 24rpx | 大元素（卡片、面板） |
| `--radius-xl` | 32rpx | 特大元素（弹窗、底部抽屉） |
| `--radius-full` | 999rpx | 胶囊形（药丸按钮、搜索框） |

---

## 6. 阴影系统

刷个冯题采用**零阴影**设计，通过色块对比表达深度层次：

| 层级 | 实现方式 |
|------|----------|
| 底层 | 页面背景 `#faf9f5` |
| 中层 | 卡片背景 `#efe9de` |
| 高层 | 激活态 `#e8e0d2` 或深色表面 `#181715` |
| 浮层 | 弹窗/Toast 使用深色表面 `#181715` + 圆角 |

---

## 7. 组件规范

### 7.1 按钮

#### 主要按钮 (Primary)
```css
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  font-size: 28rpx;
  font-weight: 500;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
  border: none;
  text-align: center;
}

.btn-primary:active {
  background-color: #a9583e;
}
```

#### 次要按钮 (Secondary)
```css
.btn-secondary {
  background-color: #efe9de;
  color: #141413;
  font-size: 28rpx;
  font-weight: 500;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
  border: none;
}

.btn-secondary:active {
  background-color: #e8e0d2;
}
```

#### 文字按钮 (Text)
```css
.btn-text {
  background: transparent;
  color: #cc785c;
  font-size: 28rpx;
  font-weight: 400;
  padding: 8rpx 0;
  border: none;
}

.btn-text:active {
  color: #a9583e;
}
```

#### 胶囊按钮 (Pill)
```css
.btn-pill {
  background-color: #cc785c;
  color: #faf9f5;
  font-size: 24rpx;
  font-weight: 500;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  border: none;
}

.btn-pill:active {
  background-color: #a9583e;
}
```

### 7.2 卡片

```css
.card {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  /* 无阴影 */
}

.card:active {
  background-color: #e8e0d2;
}
```

#### 卡片变体

| 类型 | 背景 | 场景 |
|------|------|------|
| 标准卡片 | `#efe9de` | 题目卡片、工具入口 |
| 深色卡片 | `#181715` | 高对比展示区、夜间模式 |
| 透明卡片 | transparent | 列表项、无边框场景 |

### 7.3 输入框

```css
.input {
  background-color: #efe9de;
  color: #141413;
  font-size: 28rpx;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
}

.input:focus {
  border-color: #cc785c;
}

.input-placeholder {
  color: #8e8b82;
}
```

### 7.4 标签 (Tag)

```css
.tag {
  background-color: #efe9de;
  color: #6c6a64;
  font-size: 22rpx;
  font-weight: 500;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}

.tag-active {
  background-color: #cc785c;
  color: #faf9f5;
}
```

### 7.5 分割线

```css
.divider {
  height: 1rpx;
  background-color: #e6dfd8;
  margin: 16rpx 0;
}
```

### 7.6 导航栏

```css
/* 微信小程序导航栏配置 */
/* app.json 中的 window 配置 */
{
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTitleText": "刷个冯题",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#faf9f5"
}
```

### 7.7 Tab Bar

```css
/* 自定义 Tab Bar 样式 */
.tab-bar {
  background-color: #faf9f5;
  border-top: 1rpx solid #e6dfd8;
}

.tab-item {
  color: #8e8b82;
}

.tab-item-active {
  color: #cc785c;
}
```

---

## 8. 图标规范

- **风格**：线性图标 (Outlined)，2rpx 描边
- **尺寸**：
  - 小图标：32rpx × 32rpx
  - 中图标：48rpx × 48rpx
  - 大图标：64rpx × 64rpx
- **颜色**：继承父元素 `color`，默认 `#141413`
- **可点击区域**：最小 80rpx × 80rpx（含 padding）

---

## 9. 动画规范

### 9.1 时长

| 类型 | 时长 | 缓动 |
|------|------|------|
| 微交互（按钮反馈） | 150ms | ease |
| 状态切换 | 250ms | ease-in-out |
| 页面转场 | 300ms | ease-in-out |
| 弹窗动画 | 350ms | cubic-bezier(0.4, 0, 0.2, 1) |

### 9.2 规则

- 所有动画使用 `transform` 和 `opacity`，避免触发 layout
- 列表项入场使用 stagger，每项延迟 50ms
- 按钮按下反馈：`scale(0.98)` + 颜色变深

---

## 10. 页面布局模板

### 10.1 标准页面结构

```
┌─────────────────────────┐
│      Navigation Bar      │  ← 暖奶油背景 + 黑字
├─────────────────────────┤
│                          │
│        Hero 区域         │  ← 页面标题 + 简要说明
│                          │
├─────────────────────────┤
│                          │
│      功能卡片区          │  ← 工具入口网格
│                          │
├─────────────────────────┤
│                          │
│        内容区            │  ← 列表 / 详情 / 表单
│                          │
├─────────────────────────┤
│       Tab Bar            │  ← 底部导航
└─────────────────────────┘
```

### 10.2 间距规则

- 页面水平 padding：`32rpx`
- 区域之间间距：`48rpx`
- 卡片之间间距：`24rpx`
- 卡片内部 padding：`24rpx`

---

## 11. 微信小程序特殊适配

### 11.1 rpx 单位

所有尺寸使用 `rpx` 单位（responsive pixel），750rpx = 屏幕宽度。

### 11.2 安全区域

```css
/* 底部安全区 */
.page-bottom {
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

/* iPhone X 系列适配 */
.tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 11.3 微信组件覆盖

部分微信原生组件样式无法直接覆盖，需要使用：
- 自定义导航栏：`"navigationStyle": "custom"`
- 自定义 Tab Bar：`"custom": true`（在 tabBar 配置中）
- 自定义按钮：使用 `view` 模拟 `button`

---

## 12. 无障碍设计

- 文字与背景对比度 ≥ 4.5:1（WCAG AA）
- 可点击元素最小尺寸 80rpx × 80rpx
- 重要操作提供文字说明，不依赖颜色区分
- 图标按钮添加 `aria-label` 属性

---

## 13. 暗色模式适配（预留）

| 浅色模式 | 暗色模式 |
|----------|----------|
| `#faf9f5` | `#1a1a1a` |
| `#efe9de` | `#2a2a2a` |
| `#141413` | `#f0f0f0` |
| `#6c6a64` | `#a0a0a0` |
| `#cc785c` | `#d4896e` |

---

## 附录：设计资产清单

| 资产类型 | 说明 |
|----------|------|
| 色板 | 本文档 §2 |
| 字体层级 | 本文档 §3 |
| 间距 Token | 本文档 §4 |
| 圆角 Token | 本文档 §5 |
| 组件库 | 本文档 §7 |
| 图标库 | 线性图标，2rpx 描边 |
| 动画曲线 | 本文档 §9 |

---

*文档维护：每次设计变更后同步更新此文档*
