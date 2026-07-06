# Dell 1996 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/dell-1996-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Dell 1996 是目录时代企业网页设计的完美化石：一个 Fortune-100 品牌认为 web 足够重要值得投资，但比 CSS 广泛采用早两年，比"设计系统"这个词出现早三年。每个视觉选择都是约束的下游后果：HTML 表格布局、浏览器内置字体栈（Arial Black / Helvetica / Times Roman）、8-bit 安全纯色填充、手工裁剪 GIF 贴纸（NEW! 爆炸、圆形奖章、斜面产品照片）。页面被边框包围——字面意义上的黑色 HTML 表格边框——内部每个产品线获得一条"色带卡片"：白色标题栏 + 锐利黑色下划线 + 八种目录色之一的着色主体块。

### 1.2 视觉 DNA

- 纯白画布 `#ffffff` 配纯黑文字 `#000000`
- 黑色页面边框 ~8px 包围整个视口
- 八种色带卡片色调：橄榄、鼠尾草、鲑鱼、桃、酸橙、天蓝、钢蓝、长春花
- Arial Black 36px / weight 900 区域标题
- Helvetica Bold 16px 产品行标题
- Times Roman 14px 正文
- 手工 GIF 贴纸：BUY a DELL 黄色标签、NEW! 爆炸、PC Magazine 圆形奖章
- 零圆角（仅奖章用 full）
- 零阴影——硬 1px 边框和手工斜面

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|---|---|---|
| Canvas | `#ffffff` | 纯白页面底 |
| Frame Ink | `#000000` | 纯黑边框 |
| Primary | `#e91d2a` | Dell 红（仅 CTA 面板和电话） |
| Yellow Sticker | `#fcc20f` | 贴纸黄 |
| Link | `#0000ee` | 经典 Mosaic 蓝链接 |
| Tint Olive | `#8e8a25` | 色带-橄榄 |
| Tint Sage | `#b3bd95` | 色带-鼠尾草 |
| Tint Salmon | `#d77a7a` | 色带-鲑鱼 |
| Tint Peach | `#e6915d` | 色带-桃 |
| Tint Lime | `#c0d4a7` | 色带-酸橙 |
| Tint Sky | `#9ab6c8` | 色带-天蓝 |
| Tint Steel | `#a5b8c0` | 色带-钢蓝 |
| Tint Periwinkle | `#8c9ae0` | 色带-长春花 |

### 1.4 字体策略

- **Display**：Arial Black — weight 900，全大写
- **Heading**：Helvetica — weight 700，全大写
- **Body**：Times New Roman — weight 400
- **Button/Label**：Helvetica — weight 700
- Sans 用于 UI，serif 用于正文——与现代惯例相反，是 90 年代排版的标志

### 1.5 布局与组件模式

- 固定宽度 ~760px（800x600 显示器时代）
- 黑色页面边框 8px
- 色带卡片：白色标题栏 + 着色主体 + 产品照片凹槽
- 斜面 GIF 贴纸作为装饰叠加
- 红色 CTA 面板仅用于首页
- Footer：图标-标签导航行

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|---|---|
| 八种色带色调作为分类系统 | 可改造为"学科/题型色带"——每个学科分配专属色调 |
| 信息密度优先的布局 | 学习工具需要高信息密度，Dell 1996 的紧凑布局有参考价值 |
| 色块+边框的卡片模式 | 可改造为色带+分割线的知识点卡片 |
| 纯文字驱动的设计 | 学习工具以文字为主，不需要大图 |

### 2.2 需要改造的设计决策

| 原决策 | 改造方向 |
|---|---|
| 黑色页面边框 | 改为暖奶油画布 + 奶油卡片 |
| Arial Black 900 标题 | 改为 Georgia 400（项目规范） |
| Times New Roman 正文 | 改为系统 sans-serif |
| 零圆角 | 改为 24rpx |
| 纯白画布 | 改为暖奶油 `#faf9f5` |
| 纯黑文字 | 改为暖墨 `#141413` |
| 八色调为产品线 | 改为学科色：数学、物理、化学、英语、语文等 |
| GIF 贴纸 | 改为 CSS 实现的标签/徽章 |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|---|---|
| 黑色页面边框 8px | 与暖奶油画布冲突，且浪费屏幕空间 |
| Arial Black / Helvetica 字体 | 过于粗犷，与温暖风格冲突 |
| GIF 贴纸装饰 | 小程序不支持 GIF 动画叠加 |
| 固定宽度 760px | 小程序需要响应式 |
| 红色电话号码 | 学习工具无此场景 |
| 斜面阴影 | 与零阴影设计规范冲突 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Dell 1996 角色 | 刷个冯题映射 | 色值 | 用途 |
|---|---|---|---|
| Canvas `#ffffff` | 画布 | `#faf9f5` | 页面底 |
| Frame Ink `#000000` | 暖墨 | `#141413` | 主文字 |
| Primary `#e91d2a` | CTA | `#cc785c` | 珊瑚色按钮 |
| Tint Olive `#8e8a25` | 学科-数学 | `#5b8c5a` | 数学色带 |
| Tint Sage `#b3bd95` | 学科-物理 | `#6b9bd2` | 物理色带 |
| Tint Salmon `#d77a7a` | 学科-化学 | `#e8a55a` | 化学色带 |
| Tint Peach `#e6915d` | 学科-英语 | `#cc785c` | 英语色带 |
| Tint Lime `#c0d4a7` | 学科-语文 | `#5db8a6` | 语文色带 |
| Tint Sky `#9ab6c8` | 学科-生物 | `#7bc47f` | 生物色带 |
| Tint Periwinkle `#8c9ae0` | 学科-历史 | `#9b8ec4` | 历史色带 |
| Tint Steel `#a5b8c0` | 学科-地理 | `#8bb8c4` | 地理色带 |

### 3.2 字体映射（用 rpx）

| Dell 1996 Token | 刷个冯题映射 | rpx 值 |
|---|---|---|
| display (36px, 900) | 区域标题 | 48rpx Georgia, 400, -2rpx |
| heading-1 (24px, 900) | 子区域标题 | 36rpx Georgia, 400, -1rpx |
| heading-2 (16px, 700) | 卡片标题 | 32rpx sans-serif, 600 |
| body (14px, 400) | 正文 | 28rpx sans-serif, 400 |
| button (12px, 700) | 按钮 | 24rpx sans-serif, 600 |
| ui-label (12px, 700) | 导航标签 | 24rpx sans-serif, 600 |

### 3.3 组件设计规范

**学科色带卡片（借鉴 Ribbon Card）**
```css
.subject-card {
  background: #faf9f5;
  border: 1rpx solid #e6dfd8;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}
.subject-card__header {
  background: #efe9de;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #e6dfd8;
}
.subject-card__header-text {
  font-family: Georgia, serif;
  font-size: 32rpx;
  font-weight: 600;
  color: #141413;
}
.subject-card__body {
  padding: 24rpx;
  border-left: 8rpx solid; /* 学科色通过 inline style 设置 */
}
```

**学科色带进度条（借鉴 Section Eyebrow Block）**
```css
.subject-banner {
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
}
.subject-banner--math { background: rgba(91,140,90,0.15); border-left: 8rpx solid #5b8c5a; }
.subject-banner--physics { background: rgba(107,155,210,0.15); border-left: 8rpx solid #6b9bd2; }
.subject-banner--chemistry { background: rgba(232,165,90,0.15); border-left: 8rpx solid #e8a55a; }
.subject-banner__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
}
```

**标签贴纸（借鉴 NEW! Burst Sticker，用 CSS 实现）**
```css
.sticker {
  display: inline-block;
  background: #fcc20f;
  color: #141413;
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  transform: rotate(-3deg);
}
.sticker--new { background: #fcc20f; }
.sticker--hot { background: #e91d2a; color: #ffffff; }
```

### 3.4 页面布局模板

```
┌───────────────────────────────┐
│ 画布 #faf9f5                  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 学科色带条（数学蓝）     │  │
│  │ 标题                     │  │
│  │ [NEW!] 标签              │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 学科色带条（物理绿）     │  │
│  │ 标题                     │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 学科色带条（化学橙）     │  │
│  │ 标题                     │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ CTA 珊瑚色面板           │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* 学科色带卡片 — 借鉴 Dell 1996 Ribbon Card */
.subject-ribbon {
  background: #faf9f5;
  border: 1rpx solid #e6dfd8;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}
.subject-ribbon__header {
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #e6dfd8;
}
.subject-ribbon__title {
  font-family: Georgia, serif;
  font-size: 32rpx;
  font-weight: 600;
  color: #141413;
}
.subject-ribbon__content {
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.subject-ribbon__desc {
  flex: 1;
  font-size: 28rpx;
  color: #3d3d3a;
  line-height: 1.6;
}
.subject-ribbon__accent {
  width: 8rpx;
  align-self: stretch;
  border-radius: 4rpx;
}

/* 学科色定义 */
.subject-ribbon--math .subject-ribbon__accent { background: #5b8c5a; }
.subject-ribbon--physics .subject-ribbon__accent { background: #6b9bd2; }
.subject-ribbon--chemistry .subject-ribbon__accent { background: #e8a55a; }
.subject-ribbon--english .subject-ribbon__accent { background: #cc785c; }
.subject-ribbon--chinese .subject-ribbon__accent { background: #5db8a6; }

/* 标签贴纸 — 借鉴 Dell 1996 NEW! Sticker */
.tag-sticker {
  display: inline-block;
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}
.tag-sticker--new {
  background: #fcc20f;
  color: #141413;
  transform: rotate(-3deg);
}
.tag-sticker--hot {
  background: #cc785c;
  color: #ffffff;
}

/* 信息密集型行 — 借鉴 Dell 1996 产品行 */
.info-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e6dfd8;
}
.info-row:last-child {
  border-bottom: none;
}
.info-row__label {
  font-size: 24rpx;
  font-weight: 600;
  color: #6c6a64;
  width: 160rpx;
}
.info-row__value {
  flex: 1;
  font-size: 28rpx;
  color: #141413;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 学科导航 | 色带系统完美适配学科分类 |
| 知识点目录 | 高信息密度的行式布局适合目录展示 |
| 错题分类 | 色带 + 标签的分类系统 |
| 题库浏览 | 信息密集型布局适合列表展示 |

### 4.2 不适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 首页 | 过于复古，与暖奶油画布冲突 |
| 学习激励 | Dell 1996 的工业感不适合鼓励场景 |
| 个人中心 | 需要现代感，不需要复古感 |

### 4.3 混搭建议

- **学科色带系统**：从 Dell 1996 的八色色带迁移，为每个学科分配专属色调，用于分类导航
- **信息密集型行**：从 Dell 1996 的产品行迁移，用于知识点列表和错题展示
- **标签贴纸**：从 Dell 1996 的 NEW! 贴纸迁移，用 CSS 实现旋转标签，用于标记新题/热门题
- **色块强调**：从 Dell 1996 的 CTA 红面板迁移，用珊瑚色面板引导用户行动

---

## 5. 实施检查清单

- [ ] 学科色带系统已定义（至少 5 个学科色）
- [ ] 色带卡片组件已实现（header + accent + content）
- [ ] 标签贴纸组件已实现（CSS 旋转 + 背景色）
- [ ] 信息密集型行组件已实现
- [ ] 标题使用 Georgia 400（非 Arial Black 900）
- [ ] 正文使用系统 sans-serif（非 Times New Roman）
- [ ] 所有圆角使用 24rpx（非 0px）
- [ ] 所有间距使用 rpx 单位
- [ ] 页面画布使用 `#faf9f5`（非 `#ffffff`）
- [ ] 无黑色页面边框
- [ ] 无 GIF 贴纸（用 CSS 实现）

---

## 6. 参考文件

- 原始设计规范：`.claude/skills/dell-1996-design.md`
- 暖奶油画布规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25
