# The Verge 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/theverge-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
The Verge 的设计语言是 **暗色编辑画布 + 酸性霓虹危险色带**。核心理念：
- **近黑画布是产品**：`#131313` 是默认表面，无浅色模式
- **色彩即深度**：不使用阴影，用饱和色块（薄荷绿、紫色、黄色、粉色）提升层级
- **危险色带强调**：酸性薄荷 `#3cffd0` + 紫外 `#5200ff` 如同安全警示带，不是安静的背景色
- **StoryStream 时间线**：垂直 feed 中每个帖子是圆角矩形，用单色等宽时间戳标记
- **方形 vs 药丸的嵌套节奏**：2px 标签 → 20px 卡片 → 40px 按钮，每个组件通过圆角宣布层级

### 1.2 视觉 DNA
- 近黑画布 `#131313` + 饱和色块故事卡片
- Manuka 超重 display 字体（107px，900 weight）——科技媒体最大声的字体
- PolySans Mono 等宽字体用于所有 UPPERCASE 标签/时间戳/按钮
- 1px hairline 边框替代阴影（白色、薄荷色、紫色）
- 20-40px 大圆角卡片，从不使用方形

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| Jelly Mint | `#3cffd0` | 主 CTA、链接下划线、活跃标签边框 |
| Verge Ultraviolet | `#5200ff` | 次级危险色、促销按钮、错误态 |
| Canvas Black | `#131313` | 默认暗色表面 |
| Surface Slate | `#2d2d2d` | 次级卡片背景 |
| Hazard White | `#ffffff` | 主文字、按钮边框、故事填充 |
| Secondary Text | `#949494` | 次要文字、时间戳 |
| Muted Text | `#e9e9e9` | 暗色按钮文字 |
| Deep Link Blue | `#3860be` | 链接 hover 色 |
| Absolute Black | `#000000` | 薄荷/黄色卡片上的文字 |

### 1.4 字体策略
- **Manuka**（Klim）：超重 display，仅 ≥60px 使用，从不用于 UI
- **PolySans**（PanGram）：UI 和次级标题主力，300/500/700 三个字重
- **PolySans Mono**：等宽，仅用于 UPPERCASE 标签/时间戳/按钮
- **FK Roman Standard**：衬线，仅用于长文 body/caption
- 薄体 300 PolySans 19-20px + 1.9px tracking = "时尚杂志耳语"

### 1.5 布局与组件模式
- 间距基数：8px，micro-scale 2/4/5/6/9/10px 用于按钮/标签内部
- 卡片：20px（标准）/ 24px（特征）圆角
- 按钮：24px 药丸 / 40px 轮廓药丸
- 1px hairline 边框替代所有阴影

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **色彩即深度理念**：用饱和色块而非阴影提升层级，与暖奶油画布零阴影一致
- **1px hairline 边框**：替代阴影的轻量分层方式
- **等宽字体用于标签**：题号、分类、时间戳可用等宽字体增强技术感
- **大圆角卡片**：20-24px 圆角与当前 24rpx 一致
- **StoryStream 时间线**：可改造为学习进度时间线

### 2.2 需要改造的设计决策
- **近黑画布 `#131313`** → 改造为仅在特定深色区块使用（如代码展示、成就页），默认保持暖奶油画布
- **酸性薄荷 `#3cffd0`** → 改造为珊瑚 `#cc785c` 作为 CTA，薄荷可用于"正确答案"标记
- **紫外 `#5200ff`** → 改造为"错误答案"标记或次要强调
- **Manuka 超重字体** → Georgia 无法达到 900 weight，改用 Georgia 400 + 更大字号模拟冲击力
- **PolySans Mono UPPERCASE** → 小程序中可用 `text-transform: uppercase` + 系统等宽字体
- **薄体 300 + 1.9px tracking** → Georgia 不支持 300 weight，用 400 + 正 tracking 模拟

### 2.3 不可迁移的设计决策
- **Manuka 专有字体** → 小程序无法加载
- **PolySans 专有字体** → 替代为系统字体
- **全暗色画布模式** → 暖奶油画布是当前规范，默认不用暗色
- **饱和色块故事卡片**（黄/粉/橙）→ 可部分用于"已掌握"/"待复习"状态标记
- **`box-shadow: none` 的绝对平坦** → 当前规范已采用零阴影

---

## 3. 具体实施方法

### 3.1 色彩映射表

| The Verge 角色 | 刷个冯题映射 | 色值 | 说明 |
|---|---|---|---|
| Jelly Mint (#3cffd0) | 正确标记 | `#3cffd0` | 答案正确、已掌握 |
| Ultraviolet (#5200ff) | 错误标记 | `#5200ff` | 答案错误、需复习 |
| Canvas Black (#131313) | 深色表面 | `#181715` | 代码展示、成就页 |
| Surface Slate (#2d2d2d) | 次深色 | `#2a2927` | 次级暗色卡片 |
| Hazard White (#ffffff) | 暖奶油画布 | `#faf9f5` | 默认背景 |
| Secondary (#949494) | 次要文字 | `#6c6a64` | 时间戳、元数据 |
| Muted (#e9e9e9) | 暗色按钮文字 | `#faf9f5` | 深色表面上的文字 |
| Deep Link Blue (#3860be) | 链接色 | `#cc785c` | 链接 hover（用珊瑚替代） |

### 3.2 字体映射（用 rpx）

| The Verge 层级 | 刷个冯题映射 | 字号 | 粗细 | 行高 | 字间距 | 说明 |
|---|---|---|---|---|---|---|
| Hero Manuka 107px | 页面大标题 | 160rpx | 400 | 0.85 | 1rpx | Georgia 无法 900w，用大字号补偿 |
| Heading PolySans 34px | 区域标题 | 56rpx | 400 | 1.0 | 0 | Georgia 标题 |
| Heading 24px | 卡片标题 | 40rpx | 400 | 1.0 | 0 | |
| Thin Label 19px | 眉毛标签 | 32rpx | 400 | 1.2 | 3rpx | 薄体耳语效果 |
| Body 16px | 正文 | 28rpx | 400 | 1.6 | 0 | |
| Mono Button 12px | 按钮标签 | 22rpx | 600 | 2.0 | 2rpx | 等宽 UPPERCASE |
| Mono Timestamp 11px | 时间戳 | 20rpx | 500 | 1.2 | 2rpx | 等宽 UPPERCASE |

### 3.3 组件设计规范

**主 CTA 薄荷药丸（映射为珊瑚）**
```css
.btn-verge-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 48rpx;
  padding: 20rpx 48rpx;
  font-size: 22rpx;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  font-family: 'Courier New', Courier, monospace;
  border: none;
}
.btn-verge-primary:active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #141413;
}
```

**StoryStream 时间线条目**
```css
.stream-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}
.stream-rail {
  width: 2rpx;
  background-color: #cc785c;
  margin-right: 24rpx;
  min-height: 100%;
}
.stream-timestamp {
  font-family: 'Courier New', Courier, monospace;
  font-size: 20rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  color: #6c6a64;
  min-width: 120rpx;
}
.stream-card {
  flex: 1;
  background-color: #faf9f5;
  border: 1rpx solid #e0ddd6;
  border-radius: 40rpx;
  padding: 32rpx;
}
```

**正确/错误状态色块卡**
```css
.status-card-correct {
  background-color: #3cffd0;
  color: #000000;
  border-radius: 40rpx;
  padding: 32rpx;
}
.status-card-wrong {
  background-color: #5200ff;
  color: #ffffff;
  border-radius: 40rpx;
  padding: 32rpx;
}
```

**等宽 UPPERCASE 标签**
```css
.tag-mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 20rpx;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  color: #6c6a64;
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  background-color: #faf9f5;
  border: 1rpx solid #e0ddd6;
}
```

### 3.4 页面布局模板

**学习进度时间线（借鉴 StoryStream）**
```
┌──────────────────────────┐
│ 暖奶油画布 #faf9f5        │
│                          │
│ │ 时间戳  │ 卡片标题      │  ← rail + timestamp + card
│ │ 14:30   │ 第1题：TCP... │
│ │ ──────  │ [正确 ✓]     │
│ │         │              │
│ │ 14:32   │ 第2题：UDP... │
│ │ ──────  │ [错误 ✗]     │
│ │         │              │
│ │ 14:35   │ 第3题：HTTP.. │
│ │         │ [正确 ✓]     │
└──────────────────────────┘
```

### 3.5 WXSS 实现示例

```wxss
/* The Verge 风格的时间线 feed */
.timeline {
  padding: 32rpx;
}
.timeline-item {
  display: flex;
  margin-bottom: 24rpx;
}
.timeline-rail {
  width: 2rpx;
  background-color: #cc785c;
  margin-right: 24rpx;
}
.timeline-content {
  flex: 1;
}
.timeline-time {
  font-family: 'Courier New', Courier, monospace;
  font-size: 20rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  color: #6c6a64;
  margin-bottom: 8rpx;
}
.timeline-card {
  background-color: #faf9f5;
  border: 1rpx solid #e0ddd6;
  border-radius: 40rpx;
  padding: 32rpx;
}
.timeline-card.correct {
  background-color: #3cffd0;
  border-color: #3cffd0;
  color: #000000;
}
.timeline-card.wrong {
  background-color: #5200ff;
  border-color: #5200ff;
  color: #ffffff;
}

/* The Verge 风格的眉毛标签 */
.eyebrow {
  font-family: 'Courier New', Courier, monospace;
  font-size: 20rpx;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 3rpx;
  color: #6c6a64;
  margin-bottom: 12rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **学习进度/答题历史页**：StoryStream 时间线天然适合展示答题记录
- **答案反馈页**：薄荷绿（正确）/ 紫色（错误）的饱和色块反馈极具辨识度
- **题目标签/分类页**：等宽 UPPERCASE 标签适合技术题目分类
- **成就/排行榜页**：深色画布 + 饱和色块的视觉冲击力适合成就展示

### 4.2 不适合用在哪些页面
- **暖奶油画布主页**：The Verge 的暗色画布与当前暖色规范冲突
- **纯文本阅读页**：等宽 UPPERCASE 标签在长阅读中过于吵闹
- **设置/配置页**：饱和色块在表单场景过于视觉干扰
- **安静的工具操作页**：The Verge 的"俱乐部夜"气质不适合专注做题

### 4.3 混搭建议
- **The Verge 时间线 + 暖奶油画布卡片**：时间线结构用 The Verge，卡片内容用暖色
- **The Verge 正确/错误色块 + 当前珊瑚 CTA**：状态反馈用薄荷/紫，行动用珊瑚
- **The Verge 等宽标签 + 当前 Georgia 标题**：标签用等宽 UPPERCASE，标题用 Georgia 衬线
- **仅在反馈/成就场景使用 The Verge 暗色画布**，其他页面保持暖奶油画布

---

## 5. 实施检查清单

- [ ] 正确状态使用薄荷绿 `#3cffd0` + 黑色文字
- [ ] 错误状态使用紫外 `#5200ff` + 白色文字
- [ ] 时间线使用 2rpx 竖线 rail + 等宽 UPPERCASE 时间戳
- [ ] 标签使用等宽字体 + UPPERCASE + 2-3rpx letter-spacing
- [ ] 卡片使用 40rpx 大圆角（The Verge 标准）
- [ ] 1px hairline 边框替代所有阴影
- [ ] 眉毛标签使用薄体 32rpx + 3rpx tracking
- [ ] 深色画布仅用于特定场景（代码展示、成就页）
- [ ] 链接 hover 使用珊瑚色 `#cc785c`（替代 Deep Link Blue）
- [ ] 薄荷绿文字不在 < 28rpx 使用（对比度振动问题）

---

## 6. 参考文件
- 原始设计分析：`.claude/skills/theverge-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
