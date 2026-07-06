# Pinterest 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/pinterest-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Pinterest 的设计哲学是 **"让图片说话"**。整个 chrome 系统安静地退到照片后面：暖灰色中性调色板、友好的 Pin Sans 字体、全圆角药丸按钮，唯一的高饱和色——Pinterest Red `#e60023`——仅用于注册 CTA。设计系统有两个明显模式：Hero/CTA chrome（大标题 + 左右交替图文卡片）和内容瀑布流（列式网格 + 8px 间距 + 无内边距图片卡片）。

核心原则：
- 单一强调色策略：Pinterest Red 仅用于 CTA
- 图片即卡片：Pin 卡片无内边距，图片就是卡片本身
- 16px 圆角统治：几乎所有组件都用 16px 圆角
- 安静的暖灰 chrome：不与图片竞争注意力
- 负字间距的自信感：70px 标题用 -1.2px 字间距

### 1.2 视觉 DNA

- **Pinterest Red** `#e60023`：唯一的高饱和色，仅用于 CTA
- **Pin Sans** 几何无衬线：400/500/600/700 四档重量
- **16px 圆角**：组件默认圆角，32px 用于大卡片和模态框
- **暖灰调色板**：`#f6f6f3` 卡片底色，`#fbfbf9` 柔和表面
- **8px 网格间距**：图片几乎互相接触
- **全圆角药丸**：搜索栏、筛选芯片、头像

### 1.3 色彩策略

| 用途 | 色值 | 与暖奶油画布差异 |
|---|---|---|
| 画布 | `#ffffff`（纯白） | 比 `#faf9f5` 冷，无暖调 |
| 柔和表面 | `#fbfbf9`（微暖白） | 接近 `#faf9f5` |
| 卡片表面 | `#f6f6f3`（暖灰） | 比 `#efe9de` 冷 |
| Pinterest Red | `#e60023` | 比 `#cc785c` 更饱和更红 |
| Red Pressed | `#cc001f` | 深红 |
| 墨水 | `#000000`（纯黑） | 比 `#141413` 更冷 |
| 正文 | `#33332e`（暖深灰） | 接近 `#141413` |
| 柔和 | `#62625b`（暖灰） | 接近 `#6c6a64` |
| 发丝线 | `#dadad3` | 接近 `#e6dfd8` |

### 1.4 字体策略

Pin Sans 几何无衬线，四档重量：
- **700**：按钮 14px、小标题 14px
- **600**：标题 28px/22px/18px、正文强调 16px
- **500**：正文强调 16px、标签 12px
- **400**：正文 16px/14px、链接 16px

负字间距：`-1.2px` 在 70px 和 28px 标题，`-0.8px` 在 44px 标题。

### 1.5 布局与组件模式

- **瀑布流网格**：列式布局，8px 间距，图片保持原始比例
- **16px 圆角**：按钮、输入框、卡片、图片
- **32px 圆角**：大 Pin 卡片、模态框
- **全圆角药丸**：搜索栏、筛选芯片、覆盖标签
- **64px 章节间距**：营销区域之间
- **模态覆盖**：50% 不透明度遮罩 + 16px 柔和阴影

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **单一强调色策略**：Pinterest Red 仅用于 CTA 的理念，完美对应暖奶油画布的珊瑚色 CTA 策略
2. **暖灰调色板**：Pinterest 的暖灰系统与暖奶油画布的奶油色调高度一致
3. **16px 圆角统治**：与暖奶油画布的 24rpx（约 12px）接近，可参考
4. **负字间距标题**：暖奶油画布已有 -3rpx 字间距，理念一致
5. **全圆角药丸按钮**：搜索栏、筛选芯片可直接迁移
6. **安静的 chrome**：不与内容竞争的设计理念

### 2.2 需要改造的设计决策

1. **Pinterest Red → 珊瑚色**：`#e60023` 过于鲜艳，需替换为 `#cc785c`
2. **16px 圆角 → 24rpx**：暖奶油画布规范要求 24rpx
3. **纯白画布 → 暖奶油**：`#ffffff` 需替换为 `#faf9f5`
4. **瀑布流网格 → 功能卡片网格**：小程序不适合瀑布流，用固定网格
5. **70px 标题 → 适配 rpx**：需按 750rpx 设计稿缩放
6. **模态框 → 页面跳转**：小程序无原生模态覆盖

### 2.3 不可迁移的设计决策

1. **Pin Sans 字体**：专有字体，小程序无法使用
2. **瀑布流布局**：小程序原生不支持瀑布流组件
3. **图片即卡片**：刷个冯题是工具类，不是图片类
4. **Pin 覆盖标签**：需要图片叠加，小程序复杂
5. **无限滚动加载**：小程序有页面栈限制

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Pinterest 原始 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#ffffff` canvas | `#faf9f5` 画布 | 页面背景 |
| `#fbfbf9` surface-soft | `#faf9f5` 画布 | 柔和区域 |
| `#f6f6f3` surface-card | `#efe9de` 奶油卡片 | 卡片背景 |
| `#e60023` primary | `#cc785c` 珊瑚色 | CTA |
| `#cc001f` primary-pressed | `#a9583e` Active | 按下态 |
| `#000000` ink | `#141413` 暖墨 | 标题文字 |
| `#33332e` body | `#141413` 暖墨 | 正文 |
| `#62625b` mute | `#6c6a64` 次要文字 | 辅助信息 |
| `#dadad3` hairline | `#e6dfd8` 分割线 | 边框/分割 |

### 3.2 字体映射（用 rpx）

| Pinterest 原始 | 刷个冯题映射 | 说明 |
|---|---|---|
| `display-xl` 70px/600/-1.2px | Georgia 80rpx/400/-3rpx | Hero 标题 |
| `heading-xl` 28px/700/-1.2px | Georgia 48rpx/400/-3rpx | 章节标题 |
| `heading-lg` 22px/600 | Georgia 40rpx/400/-3rpx | 子标题 |
| `body-md` 16px/400 | 系统字体 28rpx/400 | 正文 |
| `body-strong` 16px/600 | 系统字体 28rpx/600 | 强调 |
| `button-md` 14px/700 | 系统字体 28rpx/700 | 按钮 |
| `caption-md` 12px/500 | 系统字体 22rpx/500 | 标签 |

### 3.3 组件设计规范

**CTA 按钮（Pinterest 风格药丸）**
```css
.btn-pinterest-primary {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 999rpx; /* 全圆角药丸 */
  padding: 16rpx 32rpx;
  height: 80rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.btn-pinterest-secondary {
  background: #efe9de;
  color: #141413;
  border-radius: 999rpx;
  padding: 16rpx 32rpx;
  height: 80rpx;
}
```

**筛选芯片（Pinterest 风格）**
```css
.filter-chip {
  background: #efe9de;
  color: #141413;
  border-radius: 999rpx;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.filter-chip.active {
  background: #141413;
  color: #faf9f5;
}
```

**功能卡片（Pinterest 风格 16px→24rpx）**
```css
.pinterest-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 0; /* 图片无内边距 */
  overflow: hidden;
}

.pinterest-card-content {
  padding: 32rpx;
}
```

### 3.4 页面布局模板

借鉴 Pinterest 的双模式交替：

```
Zone 1 — Hero 区（大标题 + CTA）
  Georgia 衬线标题 + 珊瑚色药丸 CTA
  ↓ 64rpx

Zone 2 — 功能卡片区（左文右图交替）
  功能 1：左文字 + 右图标/预览
  功能 2：右文字 + 左图标/预览
  ↓ 64rpx

Zone 3 — 工具网格区（Pinterest 网格精神）
  2 列卡片网格，16rpx 间距
  ↓ 48rpx

Zone 4 — 快捷入口区
  答题记录 | 错题本
```

### 3.5 WXSS 实现示例

```css
/* Pinterest 风格的功能卡片交替布局 */
.feature-row {
  display: flex;
  gap: 32rpx;
  margin-bottom: 64rpx;
}

.feature-row.reverse {
  flex-direction: row-reverse;
}

.feature-text {
  flex: 1;
  padding: 32rpx 0;
}

.feature-visual {
  flex: 1;
  border-radius: 24rpx;
  overflow: hidden;
}

/* Pinterest 风格的搜索/筛选栏 */
.search-bar {
  background: #efe9de;
  border-radius: 999rpx;
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

/* Pinterest 风格的工具网格 */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx; /* Pinterest 的 8px 换算 */
}

.tool-grid-item {
  background: #efe9de;
  border-radius: 24rpx;
  overflow: hidden;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

1. **首页工具卡片区**：Pinterest 的网格布局 + 安静 chrome 适合工具展示
2. **试卷列表页**：卡片式列表 + 操作按钮的布局
3. **学习驾驶舱**：数据卡片交替布局
4. **筛选/分类页面**：Pinterest 的筛选芯片风格

### 4.2 不适合用在哪些页面

1. **刷题页面**：需要专注阅读，不适合 Pinterest 的浏览式布局
2. **结果页**：需要情感化展示，Pinterest 风格太平静
3. **代码/数据展示**：Pinterest 的美学不适合技术内容

### 4.3 混搭建议

- **首页用 Pinterest 网格精神**：2 列卡片 + 16rpx 间距
- **CTA 用药丸风格**：全圆角按钮比矩形更友好
- **筛选用芯片风格**：比传统 tab 更现代
- **内容页保持暖奶油画布**：Georgia 标题 + 奶油卡片
- **深色区域用暖奶油画布的深海军蓝**：不用 Pinterest 的纯黑

---

## 5. 实施检查清单

- [ ] 所有颜色映射到暖奶油画布色板
- [ ] 圆角统一 24rpx（非 Pinterest 的 16px）
- [ ] CTA 按钮用药丸风格（全圆角）
- [ ] 筛选芯片用全圆角
- [ ] 网格间距 16rpx（非 8px，适配 rpx）
- [ ] 标题用 Georgia 衬线（非 Pin Sans）
- [ ] 负字间距保留 -3rpx
- [ ] 章节间距 64rpx
- [ ] 卡片背景用 `#efe9de`
- [ ] 不引入瀑布流布局

---

## 6. 参考文件

- 原始设计：`.claude/skills/pinterest-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` § 25 Claude Design 暖奶油画布改造
