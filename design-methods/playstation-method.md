# PlayStation 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/playstation-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

PlayStation 的设计哲学是 **"章节式预告片"**。页面像游戏发布预告片一样滚动：每个章节是一个全出血色带——纯黑、纯白或 PlayStation 蓝——每个章节拥有一个编辑目的。Chrome 极度安静：PlayStation Blue `#0070d1` 作为全圆角药丸承载所有主 CTA，专有 SST 字体在 display 层使用 300（轻量）带来空气感的高端质感。

核心原则：
- 三画布章节系统：黑/白/蓝交替，章节间无装饰分割
- 轻量 display 字体：300 weight 的 SST 给游戏品牌带来编辑杂志感
- PlayStation Blue 药丸 CTA：全圆角，12px 28px 内边距
- 8px 圆角产品卡片：游戏瓦片和功能面板
- 沉浸式图片：60-90% 章节面积被图片占据

### 1.2 视觉 DNA

- **PlayStation Blue** `#0070d1`：品牌主色，全圆角药丸
- **Commerce Orange** `#d53b00`：购买专用暖色
- **SST 字体 300 weight**：display 标题的空气感
- **黑/白/蓝三画布**：全出血章节交替
- **8px 圆角**：产品卡片和功能面板
- **全圆角药丸**：所有 CTA
- **16:9 游戏瓦片**：深色背景 + 标题叠加

### 1.3 色彩策略

| 用途 | 色值 | 与暖奶油画布差异 |
|---|---|---|
| 深色画布 | `#000000`（纯黑） | 比 `#181715` 更冷更黑 |
| 浅色画布 | `#ffffff`（纯白） | 比 `#faf9f5` 冷 |
| PlayStation Blue | `#0070d1` | 与 `#cc785c` 完全不同色系 |
| Commerce Orange | `#d53b00` | 暖色，接近珊瑚色精神 |
| 墨水 | `#000000` | 纯黑 |
| 正文（浅面） | `rgba(0,0,0,0.6)` | 半透明黑 |
| 正文（深面） | `rgba(255,255,255,0.7)` | 半透明白 |
| 表面卡片 | `#f5f7fa`（冷蓝灰） | 比 `#efe9de` 冷得多 |

### 1.4 字体策略

SST 字体，display 层 300（轻量）是品牌签名：
- **300**：display 54px/44px/35px/28px/22px
- **400**：正文 18px/16px
- **500**：正文强调 18px
- **600**：标题 18px
- **700**：按钮 18px/14px

行高统一 1.25（紧凑）。字间距 +0.1px 到 +0.45px（微开）。

### 1.5 布局与组件模式

- **96px 章节间距**：预告片剪辑间的沉默
- **全圆角药丸 CTA**：9999px 圆角
- **8px 圆角卡片**：产品信息
- **48px 按钮高度**：触控友好
- **16:9 游戏瓦片**：深色背景 + 文字叠加
- **章节交替**：黑→白→蓝→黑→白
- **PS Plus 金色渐变**：唯一的渐变，专用

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **章节交替节奏**：黑/白/蓝三画布交替的概念，可映射为暖奶油画布的深色/浅色区域交替
2. **全圆角药丸 CTA**：与暖奶油画布的按钮风格可融合
3. **96px 章节间距**：与 OpenCode 一致，可转为 rpx
4. **轻量 display 字体理念**：300 weight 的空气感，可借鉴到 Georgia 400 weight
5. **沉浸式内容区**：大面积内容展示的理念

### 2.2 需要改造的设计决策

1. **PlayStation Blue → 珊瑚色**：`#0070d1` 蓝色系完全不适用，需替换为 `#cc785c`
2. **纯黑/纯白画布 → 暖奶油**：`#000000` 和 `#ffffff` 需替换为暖色
3. **SST 300 weight → Georgia 400**：小程序无法用 SST，Georgia 400 已有轻量感
4. **8px 圆角 → 24rpx**：暖奶油画布规范
5. **48px 按钮 → 72rpx+**：适配小程序触控
6. **16:9 游戏瓦片 → 功能图标卡片**：刷个冯题不需要游戏封面

### 2.3 不可迁移的设计决策

1. **SST 字体**：专有字体，小程序无法使用
2. **PlayStation Blue**：品牌专属蓝色
3. **Commerce Orange**：购买专用色
4. **PS Plus 金色渐变**：品牌专属渐变
5. **游戏封面摄影**：不适用
6. **轮播木筏控制**：小程序原生组件不同

---

## 3. 具体实施方法

### 3.1 色彩映射表

| PlayStation 原始 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#000000` canvas-dark | `#181715` 深海军蓝 | 深色章节 |
| `#ffffff` canvas-light | `#faf9f5` 画布 | 浅色章节 |
| `#0070d1` primary | `#cc785c` 珊瑚色 | CTA |
| `#0064b7` primary-pressed | `#a9583e` Active | 按下态 |
| `#d53b00` commerce | `#cc785c` 珊瑚色 | 统一为珊瑚 |
| `#f5f7fa` surface-card | `#efe9de` 奶油卡片 | 卡片背景 |
| `#121314` surface-dark-elevated | `#252320` 深色面分割线 | 深色卡片 |
| `rgba(0,0,0,0.6)` body-light | `#6c6a64` 次要文字 | 辅助信息 |

### 3.2 字体映射（用 rpx）

| PlayStation 原始 | 刷个冯题映射 | 说明 |
|---|---|---|
| `display-xl` 54px/300 | Georgia 80rpx/400/-3rpx | Hero 标题 |
| `display-lg` 44px/300 | Georgia 64rpx/400/-3rpx | 章节标题 |
| `display-md` 35px/300 | Georgia 56rpx/400/-3rpx | 子章节 |
| `heading-xl` 28px/300 | Georgia 48rpx/400/-3rpx | 区块标题 |
| `body-md` 18px/400 | 系统字体 30rpx/400 | 正文 |
| `body-sm` 16px/400 | 系统字体 28rpx/400 | 辅助正文 |
| `button-lg` 18px/700 | 系统字体 30rpx/700 | 按钮 |

### 3.3 组件设计规范

**PlayStation 风格药丸 CTA**
```css
.btn-playstation {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 999rpx;
  padding: 20rpx 48rpx;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}
```

**PlayStation 风格产品卡片（8px→24rpx）**
```css
.ps-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
}

.ps-card-dark {
  background: #181715;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 32rpx;
}
```

**PlayStation 风格章节交替**
```css
.section-light {
  background: #faf9f5;
  padding: 96rpx 48rpx;
}

.section-dark {
  background: #181715;
  color: #faf9f5;
  padding: 96rpx 48rpx;
}
```

### 3.4 页面布局模板

借鉴 PlayStation 的章节预告片节奏：

```
Zone 1 — 深色 Hero 章节（#181715）
  大标题 + CTA
  ↓ 96rpx

Zone 2 — 浅色功能展示章节（#faf9f5）
  功能卡片 + 描述
  ↓ 96rpx

Zone 3 — 深色数据章节（#181715）
  学习驾驶舱入口 / 统计概览
  ↓ 96rpx

Zone 4 — 浅色工具章节（#faf9f5）
  工具卡片网格
  ↓ 64rpx

Zone 5 — 深色底部章节（#181715）
  快捷入口 + 备案号
```

### 3.5 WXSS 实现示例

```css
/* PlayStation 风格的深色 Hero 章节 */
.ps-hero-dark {
  background: #181715;
  color: #faf9f5;
  padding: 96rpx 48rpx;
  text-align: center;
}

.ps-hero-dark .title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 80rpx;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -3rpx;
  color: #faf9f5;
}

/* PlayStation 风格的信息标签 */
.ps-badge {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  font-weight: 700;
}

/* PlayStation 风格的功能网格 */
.ps-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

1. **首页**：章节交替节奏带来强烈的视觉冲击
2. **学习驾驶舱**：深色章节适合数据展示
3. **结果页**：深色背景 + 大数字展示成绩
4. **模块介绍页**：沉浸式章节展示

### 4.2 不适合用在哪些页面

1. **刷题页面**：需要平静阅读，深色交替太刺激
2. **试卷列表**：信息密集，不需要章节戏剧感
3. **设置页面**：纯功能页面不需要视觉节奏

### 4.3 混搭建议

- **首页用 2-3 个章节交替**：深色 Hero → 浅色工具区 → 深色底部
- **深色章节用暖奶油画布的 `#181715`**：不用 PlayStation 的纯黑
- **CTA 统一珊瑚色药丸**：不用 PlayStation Blue
- **内容页保持暖奶油画布**：奶油画布 + Georgia 标题
- **数据展示区可借鉴深色章节**：统计数字在深色背景上更醒目

---

## 5. 实施检查清单

- [ ] 深色章节用 `#181715`（非纯黑）
- [ ] 浅色章节用 `#faf9f5`（非纯白）
- [ ] CTA 用 `#cc785c` 珊瑚色（非 PlayStation Blue）
- [ ] 圆角统一 24rpx（非 8px）
- [ ] 药丸按钮用 999rpx 圆角
- [ ] 标题用 Georgia（非 SST）
- [ ] 章节间距 96rpx
- [ ] 深色章节文字用 `#faf9f5`
- [ ] 按钮高度 88rpx+
- [ ] 章节交替最多 3 个，避免过度刺激

---

## 6. 参考文件

- 原始设计：`.claude/skills/playstation-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` § 25 Claude Design 暖奶油画布改造
