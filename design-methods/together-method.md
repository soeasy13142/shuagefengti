# Together AI 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/together.ai-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Together AI 的设计语言是 **AI 基础设施的双模态表面**。核心理念：
- **单一黑色 CTA 是整个转化故事**：`#000000` 药丸承载每个"Sign in"、"Contact sales"、"Get started"
- **三色渐变是全部品牌装饰**：橙 → 洋红 → 浅蓝紫渐变色带是唯一的品牌 chrome，从不缩小到图标尺寸
- **等宽大写眉毛是技术声音**：每个区域标题、按钮标签、表格头都用等宽 UPPERCASE
- **深浅交替带节奏**：`#010120` 暗色带 → `#ffffff` 白色带 → 暗色带，表面对比承载深度
- **轻圆角 4px**：`rounded.sm` 是规范圆角，技术感、非药丸

### 1.2 视觉 DNA
- 暗色 Hero + 三色渐变色带 + 白色产品/定价区
- 黑色药丸按钮 + 等宽 UPPERCASE 标签
- 薄荷色 `#c8f6f9` 统计卡片点缀白色中间区
- 巨型 `together.ai` 字标横幅作为页脚签名
- 4px 轻圆角卡片 + hairline 边框，无阴影

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| Ink Black (primary) | `#000000` | 唯一主 CTA、页脚填充 |
| Brand Orange | `#fc4c02` | 渐变第一停靠点（非 UI 色） |
| Brand Magenta | `#ef2cc1` | 渐变第二停靠点（非 UI 色） |
| Brand Periwinkle | `#bdbbff` | 渐变第三停靠点、统计卡片 |
| Brand Mint | `#c8f6f9` | Hero 次级 CTA、统计卡片 |
| Canvas | `#ffffff` | 默认白色表面 |
| Canvas Dark | `#010120` | 暗色 Hero/研究带 |
| Surface Dark Soft | `#313641` | 暗色卡片内嵌 |
| Ink | `#000000` | 标题/正文 |
| Body | `#959494` | 次要文字 |
| Hairline | `#959494` | 1px 边框 |

### 1.4 字体策略
- **The Future**（专有几何 display sans）：weight 400/500，负 letter-spacing（-1.92px at 64px → -0.16px at 16px）
- **PP Neue Montreal Mono**（专有等宽）：weight 500，11-16px，UPPERCASE，正 letter-spacing (0.05-0.55px)
- 两句对比是品牌声音：display sans 叙事 vs 等宽技术标签
- 替代字体：Inter 400/500 + JetBrains Mono 500

### 1.5 布局与组件模式
- 间距基数：4px，token 从 2px 到 80px (section)
- 按钮：4px 圆角，4px 24px padding
- 卡片：4px 圆角，1px hairline 边框
- 区域 padding：80px top/bottom

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **等宽 UPPERCASE 标签**：题号、分类、状态标签可用等宽大写增强技术感
- **轻圆角卡片**：4px (8rpx) 的技术感可作为特定组件风格
- **hairline 边框无阴影**：与暖奶油画布零阴影一致
- **深浅交替带节奏**：可映射为深色 `#181715` 与暖奶油 `#faf9f5` 交替
- **薄荷色统计卡片**：`#c8f6f9` 可用于学习统计点缀
- **巨型字标横幅**：可改造为"刷个冯题"品牌签名横幅

### 2.2 需要改造的设计决策
- **黑色 CTA 药丸** → 改造为珊瑚 `#cc785c`（当前规范 CTA 色）
- **三色渐变色带** → 改造为暖色渐变（珊瑚 → 暖橙 → 金），或用单色条带替代
- **`#010120` 暗色 Hero** → 改造为 `#181715`（匹配暖奶油画布深色表面）
- **等宽按钮标签** → 保留等宽用于标签，按钮正文用 Georgia/系统字体
- **4px 极轻圆角** → 改造为 8-12rpx（小程序中 4rpx 过于尖锐）

### 2.3 不可迁移的设计决策
- **The Future 专有字体** → 保持 Georgia + 系统字体
- **PP Neue Montreal Mono 专有字体** → 替代为 Courier New / 系统等宽
- **三色渐变的有机 blob 形状** → 小程序 CSS 渐变能力有限
- **chat-launcher 浮动 orb** → 小程序有 tabBar 限制
- **巨型字标 fluid scaling** → 需用 rpx 固定尺寸替代

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Together AI 角色 | 刷个冯题映射 | 色值 | 说明 |
|---|---|---|---|
| Ink Black (#000000) | 珊瑚 CTA | `#cc785c` | 主按钮（非黑色） |
| Brand Orange (#fc4c02) | 渐变暖端 | `#cc785c` | 品牌渐变起点 |
| Brand Magenta (#ef2cc1) | 渐变中点 | `#e8a088` | 品牌渐变中间 |
| Brand Periwinkle (#bdbbff) | 渐变冷端 | `#cba258` | 品牌渐变终点（用金色） |
| Brand Mint (#c8f6f9) | 统计点缀 | `#c8f6f9` | 统计卡片背景 |
| Canvas (#ffffff) | 暖奶油画布 | `#faf9f5` | 白色表面 |
| Canvas Dark (#010120) | 深色表面 | `#181715` | 暗色带 |
| Surface Dark Soft (#313641) | 次深色 | `#2a2927` | 暗色卡片 |
| Ink (#000000) | 暖墨文字 | `#141413` | 正文 |
| Body (#959494) | 次要文字 | `#6c6a64` | 辅助信息 |
| Hairline (#959494) | 分割线 | `#e0ddd6` | 边框 |

### 3.2 字体映射（用 rpx）

| Together AI 层级 | 刷个冯题映射 | 字号 | 粗细 | 行高 | 字间距 | 说明 |
|---|---|---|---|---|---|---|
| display-xxl 64px | Hero 大标题 | 112rpx | 400 | 1.1 | -4rpx | Georgia 衬线 |
| display-xl 40px | 区域标题 | 72rpx | 400 | 1.2 | -2rpx | |
| display-lg 28px | 子标题 | 48rpx | 400 | 1.15 | -1rpx | |
| display-md 22px | 卡片标题 | 40rpx | 400 | 1.15 | 0 | |
| body-lg 18px | 引导正文 | 32rpx | 400 | 1.3 | 0 | |
| body-md 16px | 默认正文 | 28rpx | 400 | 1.3 | 0 | |
| mono-caps-button 16px | 按钮标签 | 28rpx | 500 | 1.0 | 1rpx | 等宽 UPPERCASE |
| mono-caps-eyebrow 11px | 眉毛标签 | 20rpx | 500 | 1.0 | 1rpx | 等宽 UPPERCASE |
| caption 14px | 辅助说明 | 26rpx | 400 | 1.4 | 0 | |

### 3.3 组件设计规范

**主 CTA 按钮（珊瑚 + 等宽标签）**
```css
.btn-together {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 8rpx;
  padding: 8rpx 48rpx;
  font-family: 'Courier New', Courier, monospace;
  font-size: 28rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  line-height: 1.0;
  border: none;
}
.btn-together:active {
  background-color: #a9583e;
}
```

**等宽眉毛标签**
```css
.eyebrow-mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 20rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: #6c6a64;
}
```

**薄荷色统计卡**
```css
.stat-card {
  background-color: #c8f6f9;
  color: #141413;
  border-radius: 8rpx;
  padding: 48rpx;
}
.stat-card .stat-number {
  font-family: Georgia, serif;
  font-size: 72rpx;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -2rpx;
}
.stat-card .stat-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 20rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: #6c6a64;
  margin-top: 12rpx;
}
```

**深色研究带**
```css
.dark-band {
  background-color: #181715;
  color: #faf9f5;
  padding: 128rpx 48rpx;
}
.dark-band .band-title {
  font-family: Georgia, serif;
  font-size: 72rpx;
  line-height: 1.1;
  letter-spacing: -2rpx;
  color: #faf9f5;
}
.dark-band .band-card {
  background-color: #181715;
  border: 1rpx solid #2a2927;
  border-radius: 8rpx;
  padding: 32rpx;
  color: #faf9f5;
}
```

**巨型字标横幅**
```css
.wordmark-banner {
  background-color: #faf9f5;
  padding: 80rpx 0;
  text-align: center;
  overflow: hidden;
}
.wordmark-banner .wordmark {
  font-family: Georgia, serif;
  font-size: 160rpx;
  font-weight: 400;
  color: #e0ddd6;
  letter-spacing: -4rpx;
  white-space: nowrap;
}
```

### 3.4 页面布局模板

**学习统计页（借鉴 Together AI 产品页）**
```
┌──────────────────────────┐
│ 深色 Hero #181715         │  ← 学习概况
│ 等宽眉毛 "LEARNING STATS" │
│ Georgia 大标题 112rpx     │
│ 珊瑚 CTA 药丸             │
├──────────────────────────┤
│ 暖奶油画布 #faf9f5        │  ← 统计卡片区
│ ┌────┐ ┌────┐ ┌────┐    │
│ │薄荷 │ │薄荷 │ │薄荷 │   │  ← 3-up 统计
│ │120 │ │85% │ │45m │    │
│ │题目 │ │正确 │ │时长 │    │
│ └────┘ └────┘ └────┘    │
├──────────────────────────┤
│ 深色带 #181715            │  ← 详细数据
│ 等宽眉毛 "RECENT ACTIVITY"│
│ 数据表格                  │
├──────────────────────────┤
│ 巨型字标横幅              │  ← "刷个冯题" 签名
│ "刷个冯题" 160rpx 浅色    │
└──────────────────────────┘
```

### 3.5 WXSS 实现示例

```wxss
/* Together AI 风格的等宽眉毛 + 标题组合 */
.section-header {
  margin-bottom: 48rpx;
}
.section-header .eyebrow {
  font-family: 'Courier New', Courier, monospace;
  font-size: 20rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: #6c6a64;
  margin-bottom: 16rpx;
}
.section-header .title {
  font-family: Georgia, serif;
  font-size: 72rpx;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -2rpx;
  color: #141413;
}

/* Together AI 风格的 3-up 统计网格 */
.stats-grid {
  display: flex;
  gap: 16rpx;
}
.stats-grid .stat-item {
  flex: 1;
  background-color: #c8f6f9;
  border-radius: 8rpx;
  padding: 32rpx;
  text-align: center;
}
.stats-grid .stat-num {
  font-family: Georgia, serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.1;
}
.stats-grid .stat-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: #6c6a64;
  margin-top: 8rpx;
}

/* Together AI 风格的品牌渐变条（暖色版） */
.gradient-ribbon {
  height: 8rpx;
  background: linear-gradient(90deg, #cc785c, #e8a088, #cba258);
  border-radius: 4rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **学习统计/数据页**：薄荷统计卡 + 等宽标签 + 深色带的组合天然适合数据展示
- **首页 Hero**：深色 Hero + 等宽眉毛 + Georgia 大标题 + 品牌渐变条
- **功能介绍页**：深浅交替带节奏 + 等宽区域标题
- **页脚签名**：巨型"刷个冯题"字标横幅作为品牌签名

### 4.2 不适合用在哪些页面
- **暖色安静页面**（如纯文本阅读）：等宽 UPPERCASE 标签过于技术感
- **游戏化页面**：Together AI 的企业技术气质与趣味学习不匹配
- **密集表单页**：4px 极轻圆角在表单场景缺乏亲和力

### 4.3 混搭建议
- **Together AI 等宽眉毛 + Starbucks 药丸按钮**：标签用等宽，按钮用药丸
- **Together AI 薄荷统计卡 + 暖奶油画布背景**：统计区用薄荷点缀，其他保持暖色
- **Together AI 深浅交替 + Superhuman 收尾带**：两者都用深色中断，统一为 `#181715`
- **品牌渐变条**：暖色版（珊瑚 → 暖橙 → 金）作为区域分隔装饰

---

## 5. 实施检查清单

- [ ] 区域标题使用等宽 UPPERCASE 眉毛 + Georgia 大标题组合
- [ ] 等宽眉毛 letter-spacing 1rpx，字号 20rpx
- [ ] 主 CTA 使用珊瑚色 + 等宽 UPPERCASE 标签
- [ ] 统计卡片使用薄荷 `#c8f6f9` 背景
- [ ] 深色带使用 `#181715` + 白色文字
- [ ] 卡片圆角 8rpx（轻圆角技术感）
- [ ] 1px hairline 边框替代阴影
- [ ] 品牌渐变条用暖色版（珊瑚 → 暖橙 → 金）
- [ ] 巨型字标横幅用浅色 Georgia + 负 letter-spacing
- [ ] 深浅交替节奏：每 2-3 个白色带后接一个深色带

---

## 6. 参考文件
- 原始设计分析：`.claude/skills/together.ai-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
