# Renault 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/renault-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Renault 的设计哲学是 **"自信的工业极简"**。现代化的菱形标志设定了基调——几何、自信、略带工业感——系统遵循同样的方向。方角统治，发丝边框罕见，深度通过色块而非阴影表达。

核心原则：
- 双画布系统：白色浏览 + 黑色叙事，全出血色带切换
- 单一品牌强调色：Sunlight Yellow `#ffed00`，仅用于 CTA 和 NEW 标签
- NouvelR 字体 everywhere：display 层 700 weight + 0.95 行高 = 紧凑自信
- 方角几何：2px 按钮圆角，0px 卡片圆角
- 摄影优先：车辆照片占 60-90% 章节面积
- 色块深度：无阴影，靠白/黑/黄交替表达层次

### 1.2 视觉 DNA

- **Sunlight Yellow** `#ffed00`：品牌唯一强调色
- **NouvelR 字体**：display 700/0.95 行高 = 紧凑自信
- **方角几何**：2px 按钮、0px 卡片、46px 药丸
- **双画布**：白色浏览 + 黑色叙事
- **发丝线分隔**：`#f2f2f2` 白面上、`rgba(255,255,255,0.16)` 黑面上
- **16:9 摄影**：全出血车辆照片

### 1.3 色彩策略

| 用途 | 色值 | 与暖奶油画布差异 |
|---|---|---|
| 画布（白） | `#ffffff`（纯白） | 比 `#faf9f5` 冷 |
| 画布（黑） | `#000000`（纯黑） | 比 `#181715` 更冷更黑 |
| Sunlight Yellow | `#ffed00` | 与 `#cc785c` 完全不同 |
| Yellow Deep | `#e6d200` | 深黄 |
| 墨水 | `#000000` | 纯黑 |
| 正文 | `#222222` | 比 `#141413` 稍浅 |
| 柔和 | `#666666` | 接近 `#6c6a64` |
| 发丝线（白面） | `#f2f2f2` | 比 `#e6dfd8` 更冷 |
| 发丝线（黑面） | `rgba(255,255,255,0.16)` | 暗色面边框 |

### 1.4 字体策略

NouvelR 字体，display 层 700 + 0.95 行高：
- **700**：display 56px/40px/32px、标题 24px/20px/18px、按钮 16px/14px
- **600**：副标题 19.2px、小按钮 13px
- **400**：正文 18px/16px/14px、版权 12px

行高：display 0.95（极度紧凑），正文 1.4-1.57。按钮字间距 +0.144px（微开）。

### 1.5 布局与组件模式

- **80px 章节间距**：桌面端，移动端 40px
- **2px 按钮圆角**：方角是品牌签名
- **0px 卡片圆角**：方角产品卡片
- **46px 药丸**：仅用于子导航和标签
- **48px 按钮高度**：触控友好
- **全出血色带**：白→黑→黄→黑 交替
- **配置器**：左侧 60% 可视化 + 右侧 40% 选项列表

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **色块深度系统**：白/黑/黄交替表达层次，完全符合暖奶油画布的零阴影理念
2. **单一强调色策略**：Sunlight Yellow 仅用于 CTA 的理念，完美对应珊瑚色
3. **紧凑 display 字体**：0.95 行高的自信感，可借鉴到 Georgia
4. **发丝线分隔**：比阴影更轻量
5. **双画布交替**：白/黑章节节奏可映射为暖色/深色交替

### 2.2 需要改造的设计决策

1. **Sunlight Yellow → 珊瑚色**：`#ffed00` 过于鲜艳，需替换为 `#cc785c`
2. **纯白/纯黑画布 → 暖奶油/深海军蓝**：`#ffffff` → `#faf9f5`，`#000000` → `#181715`
3. **2px 方角按钮 → 24rpx 圆角**：暖奶油画布规范要求圆角
4. **0px 方角卡片 → 24rpx 圆角**：暖奶油画布规范
5. **NouvelR → Georgia + 系统字体**：标题用 Georgia，正文用系统字体
6. **16:9 全出血摄影 → 功能图标**：刷个冯题不需要车辆照片

### 2.3 不可迁移的设计决策

1. **NouvelR 字体**：专有字体，小程序无法使用
2. **Sunlight Yellow**：品牌专属黄色
3. **车辆摄影**：不适用
4. **配置器布局**：不适用
5. **方角几何**：与暖奶油画布的 24rpx 圆角冲突
6. **46px 药丸**：仅用于特定场景

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Renault 原始 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#ffffff` canvas | `#faf9f5` 画布 | 浅色章节 |
| `#000000` surface-dark | `#181715` 深海军蓝 | 深色章节 |
| `#111111` surface-deep | `#252320` 深色面分割线 | 深色卡片 |
| `#ffed00` primary | `#cc785c` 珊瑚色 | CTA |
| `#e6d200` primary-deep | `#a9583e` Active | 按下态 |
| `#222222` body | `#141413` 暖墨 | 正文 |
| `#666666` mute | `#6c6a64` 次要文字 | 辅助信息 |
| `#f2f2f2` hairline | `#e6dfd8` 分割线 | 白面边框 |
| `rgba(255,255,255,0.16)` divider-dark | `#252320` 深色面分割线 | 黑面边框 |

### 3.2 字体映射（用 rpx）

| Renault 原始 | 刷个冯题映射 | 说明 |
|---|---|---|
| `display-xl` 56px/700/0.95 | Georgia 80rpx/400/-3rpx | Hero 标题 |
| `display-lg` 40px/700/0.95 | Georgia 64rpx/400/-3rpx | 章节标题 |
| `display-md` 32px/700/0.95 | Georgia 52rpx/400/-3rpx | 子章节 |
| `heading-lg` 24px/700 | Georgia 40rpx/400/-3rpx | 区块标题 |
| `heading-md` 20px/700 | 系统字体 36rpx/700 | 子标题 |
| `body-md` 16px/400 | 系统字体 28rpx/400 | 正文 |
| `body-sm` 14px/400 | 系统字体 26rpx/400 | 辅助正文 |
| `button-md` 14px/700 | 系统字体 28rpx/700 | 按钮 |

### 3.3 组件设计规范

**Renault 风格 CTA 按钮（方角→圆角适配）**
```css
.btn-renault {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 24rpx; /* 暖奶油画布规范，非 Renault 的 2px */
  padding: 20rpx 40rpx;
  height: 88rpx;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}
```

**Renault 风格双画布章节**
```css
.section-renault-light {
  background: #faf9f5;
  padding: 80rpx 32rpx;
}

.section-renault-dark {
  background: #181715;
  color: #faf9f5;
  padding: 80rpx 32rpx;
}
```

**Renault 风格产品卡片（方角→圆角适配）**
```css
.renault-card {
  background: #faf9f5;
  border: 2rpx solid #e6dfd8;
  border-radius: 24rpx; /* 暖奶油画布规范 */
  padding: 0;
  overflow: hidden;
}

.renault-card-dark {
  background: #181715;
  color: #faf9f5;
  border: 2rpx solid #252320;
  border-radius: 24rpx;
  padding: 32rpx;
}
```

**Renault 风格 NEW 标签**
```css
.badge-new {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
  font-size: 26rpx;
  font-weight: 700;
}
```

### 3.4 页面布局模板

借鉴 Renault 的双画布交替节奏：

```
Zone 1 — 深色 Hero 章节（#181715）
  大标题 + 珊瑚 CTA
  ↓ 80rpx

Zone 2 — 浅色功能展示章节（#faf9f5）
  2 列功能卡片 + NEW 标签
  ↓ 80rpx

Zone 3 — 深色数据章节（#181715）
  学习概览 + 统计数据
  ↓ 80rpx

Zone 4 — 浅色工具章节（#faf9f5）
  工具卡片网格
  ↓ 64rpx

Zone 5 — 深色底部章节（#181715）
  快捷入口 + 备案号
```

### 3.5 WXSS 实现示例

```css
/* Renault 风格的双画布交替 */
.renault-hero {
  background: #181715;
  color: #faf9f5;
  padding: 96rpx 48rpx;
  text-align: center;
}

.renault-hero .title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 80rpx;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -3rpx;
  color: #faf9f5;
}

/* Renault 风格的促销瓦片 */
.promo-tile {
  background: #faf9f5;
  border: 2rpx solid #e6dfd8;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.promo-tile.dark {
  background: #181715;
  border-color: #252320;
  color: #faf9f5;
}

/* Renault 风格的子导航药丸 */
.sub-nav {
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
  padding: 16rpx 0;
}

.sub-nav .pill {
  background: #faf9f5;
  color: #141413;
  border: 2rpx solid #e6dfd8;
  border-radius: 999rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

1. **首页**：双画布交替节奏带来强烈视觉冲击
2. **学习驾驶舱**：深色章节适合数据展示
3. **结果页**：深色背景 + 大数字展示成绩
4. **模块介绍页**：沉浸式章节展示

### 4.2 不适合用在哪些页面

1. **刷题页面**：需要平静阅读，深色交替太刺激
2. **试卷列表**：信息密集，不需要章节戏剧感
3. **设置页面**：纯功能页面不需要视觉节奏

### 4.3 混搭建议

- **首页用 2-3 个章节交替**：深色 Hero → 浅色工具区 → 深色底部
- **深色章节用暖奶油画布的 `#181715`**：不用 Renault 的纯黑
- **CTA 统一珊瑚色**：不用 Sunlight Yellow
- **NEW 标签用珊瑚色**：对应 Renault 的黄色 NEW 标签
- **子导航药丸可借鉴**：全圆角 + 边框风格

---

## 5. 实施检查清单

- [ ] 深色章节用 `#181715`（非纯黑）
- [ ] 浅色章节用 `#faf9f5`（非纯白）
- [ ] CTA 用 `#cc785c` 珊瑚色（非 Sunlight Yellow）
- [ ] 圆角统一 24rpx（非 Renault 的 2px 方角）
- [ ] 标题用 Georgia（非 NouvelR）
- [ ] 行高用暖奶油画布规范（非 0.95）
- [ ] 章节间距 80rpx
- [ ] NEW 标签用珊瑚色药丸
- [ ] 子导航用药丸风格
- [ ] 章节交替最多 3 个

---

## 6. 参考文件

- 原始设计：`.claude/skills/renault-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` § 25 Claude Design 暖奶油画布改造
