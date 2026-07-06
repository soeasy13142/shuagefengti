# ElevenLabs 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/elevenlabs-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

ElevenLabs 读起来像一本安静的编辑式印刷杂志，碰巧是一个语音 AI 产品。基础画布是米白 `#f5f5f5`，承载暖近黑墨 `#0c0a09`。品牌电压是**摄影性的，而非色度性的**：柔和的粉彩大气渐变光球（薄荷 → 桃 → 薰衣草 → 天蓝）漂浮在页面中，作为唯一的"色彩"时刻。没有霓虹强调色、没有饱和 CTA 颜色、没有开发者工具的暗色画布。排版使用 **Waldenburg Light**（定制 serif，weight 300）配 **Inter** 正文——weight 300 是编辑签名，永远不加粗。

### 1.2 视觉 DNA

- 米白画布 `#f5f5f5`（非纯白）
- 暖近黑墨 `#0c0a09`（非纯黑）
- 无饱和 CTA 色——近黑墨药丸作为主 CTA
- Waldenburg Light serif 标题，weight 300
- Inter 正文，weight 400-500，微妙 letter-spacing (+0.15-0.18px)
- 粉彩渐变光球：薄荷、桃、薰衣草、天蓝、玫瑰
- 药丸几何：CTA 和 badge 使用 pill 圆角
- 卡片圆角 16px (xl)
- 96px section rhythm

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|---|---|---|
| Canvas | `#f5f5f5` | 米白页面底 |
| Canvas Soft | `#fafafa` | 更浅米白 |
| Surface Card | `#ffffff` | 纯白卡片 |
| Primary | `#292524` | 近黑墨 CTA |
| Ink | `#0c0a09` | 暖近黑墨 |
| Body | `#4e4e4e` | 正文灰 |
| Muted | `#777169` | 次要文字 |
| Hairline | `#e7e5e4` | 分割线 |
| Gradient Mint | `#a7e5d3` | 薄荷光球 |
| Gradient Peach | `#f4c5a8` | 桃光球 |
| Gradient Lavender | `#c8b8e0` | 薰衣草光球 |
| Gradient Sky | `#a8c8e8` | 天蓝光球 |
| Gradient Rose | `#e8b8c4` | 玫瑰光球 |

### 1.4 字体策略

- **Display**：Waldenburg Light — serif, weight 300, 负字距
- **Body**：Inter — sans-serif, weight 400-500, +0.15-0.18px letter-spacing
- **Button**：Inter — weight 500
- Display weight 300 是编辑签名——永远不加粗

### 1.5 布局与组件模式

- Section padding：96px
- 卡片圆角：16px (xl)，渐变光球卡 24px (xxl)
- 按钮：药丸形，近黑墨填充
- 粉彩渐变光球作为大气装饰
- Voice row：水平行布局
- Badge pill：小药丸标签

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|---|---|
| 米白画布（非纯白） | 与暖奶油画布 `#faf9f5` 精神一致 |
| 暖近黑墨（非纯黑） | 与暖墨 `#141413` 精神一致 |
| 药丸形 CTA | 可用于重要按钮 |
| 粉彩渐变光球 | 可改造为"学科氛围光球" |
| 96px section rhythm | 与暖奶油画布一致 |
| 负字距标题 | 与暖奶油画布一致 |
| Badge pill 标签 | 直接可用 |
| 药丸几何 | 可用于标签和 badge |

### 2.2 需要改造的设计决策

| 原决策 | 改造方向 |
|---|---|
| 近黑墨 CTA `#292524` | 改为珊瑚色 `#cc785c` |
| Waldenburg Light 300 | 改为 Georgia 400（项目规范） |
| 卡片圆角 16px | 改为 24rpx（暖奶油画布规范） |
| 粉彩光球 5 色 | 重新映射为学科色 |
| Inter +0.15-0.18px tracking | 保持系统 sans 默认 tracking |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|---|---|
| Waldenburg Light 授权字体 | 不可用 |
| Voice library row | 学习工具无语音库场景 |
| Audio waveform card | 学习工具无波形展示 |
| Gradient orb 作为背景 | 小程序中实现复杂，可用色块替代 |
| 纯近黑墨 CTA | 与暖奶油画布的珊瑚色 CTA 冲突 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| ElevenLabs 角色 | 刷个冯题映射 | 色值 |
|---|---|---|
| Canvas `#f5f5f5` | 画布 | `#faf9f5` |
| Surface Card `#ffffff` | 卡片 | `#efe9de` |
| Primary `#292524` | CTA | `#cc785c` |
| Ink `#0c0a09` | 暖墨 | `#141413` |
| Body `#4e4e4e` | 正文 | `#3d3d3a` |
| Muted `#777169` | 次要文字 | `#6c6a64` |
| Hairline `#e7e5e4` | 分割线 | `#e6dfd8` |
| Gradient Mint `#a7e5d3` | 学科-语文 | `#5db8a6` |
| Gradient Peach `#f4c5a8` | 学科-英语 | `#cc785c` |
| Gradient Lavender `#c8b8e0` | 学科-历史 | `#9b8ec4` |
| Gradient Sky `#a8c8e8` | 学科-数学 | `#6b9bd2` |
| Gradient Rose `#e8b8c4` | 学科-化学 | `#e8a55a` |

### 3.2 字体映射（用 rpx）

| ElevenLabs Token | 刷个冯题映射 | rpx 值 |
|---|---|---|
| display-mega (64px, 300) | 首页大标题 | 64rpx Georgia, 400, -3rpx |
| display-xl (48px, 300) | 子标题 | 48rpx Georgia, 400, -2rpx |
| display-lg (36px, 300) | 区块标题 | 48rpx Georgia, 400, -2rpx |
| title-md (20px, 500) | 卡片标题 | 36rpx sans-serif, 500 |
| body-md (16px, 400) | 正文 | 28rpx sans-serif, 400 |
| caption-uppercase (12px, 600) | 标签 | 22rpx sans-serif, 600 |
| button (15px, 500) | 按钮 | 28rpx sans-serif, 500 |

### 3.3 组件设计规范

**学科氛围卡片（借鉴 Gradient Orb Card）**
```css
.subject-atmosphere {
  background: #faf9f5;
  border-radius: 48rpx;
  padding: 48rpx;
  position: relative;
  overflow: hidden;
}
.subject-atmosphere::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  opacity: 0.2;
  /* 颜色通过 inline style 或 modifier class 设置 */
}
.subject-atmosphere--math::before { background: #6b9bd2; }
.subject-atmosphere--chinese::before { background: #5db8a6; }
```

**药丸 CTA（借鉴 Button Primary）**
```css
.btn-pill {
  display: inline-block;
  background: #cc785c;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 500;
  padding: 16rpx 40rpx;
  border-radius: 9999rpx;
}
.btn-pill--outline {
  background: transparent;
  color: #141413;
  border: 1rpx solid #e6dfd8;
}
```

**功能卡片（借鉴 Feature Card）**
```css
.feature-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
}
```

**Badge 标签（借鉴 Badge Pill）**
```css
.badge {
  display: inline-block;
  background: #f5f0e8;
  color: #6c6a64;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  padding: 6rpx 20rpx;
  border-radius: 9999rpx;
}
```

### 3.4 页面布局模板

```
┌───────────────────────────────┐
│ 画布 #faf9f5                  │
│                               │
│  ┌─────────────────────────┐  │
│  │ Georgia 标题 64rpx      │  │
│  │ 副标题                  │  │
│  │ [药丸按钮]              │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 学科氛围卡（光球背景）   │  │
│  │  ·语文  ·数学  ·英语    │  │
│  └─────────────────────────┘  │
│                               │
│  ┌──────┐ ┌──────┐ ┌──────┐  │
│  │功能卡│ │功能卡│ │功能卡│  │
│  └──────┘ └──────┘ └──────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ CTA 区（药丸按钮）       │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* 学科氛围卡片 — 借鉴 ElevenLabs Gradient Orb Card */
.subject-card {
  background: #faf9f5;
  border-radius: 48rpx;
  padding: 48rpx;
  margin-bottom: 32rpx;
  position: relative;
  overflow: hidden;
}
.subject-card__orb {
  position: absolute;
  top: -100rpx;
  right: -80rpx;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  opacity: 0.15;
}
.subject-card__orb--mint { background: #a7e5d3; }
.subject-card__orb--sky { background: #a8c8e8; }
.subject-card__orb--peach { background: #f4c5a8; }
.subject-card__title {
  font-family: Georgia, serif;
  font-size: 48rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -2rpx;
  position: relative;
  z-index: 1;
}
.subject-card__subtitle {
  font-size: 28rpx;
  color: #6c6a64;
  margin-top: 12rpx;
  position: relative;
  z-index: 1;
}

/* 药丸按钮 — 借鉴 ElevenLabs Button Primary */
.action-btn {
  display: inline-block;
  background: #cc785c;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 500;
  padding: 16rpx 40rpx;
  border-radius: 9999rpx;
}
.action-btn--secondary {
  background: transparent;
  color: #141413;
  border: 1rpx solid #e6dfd8;
}

/* 功能卡片 — 借鉴 ElevenLabs Feature Card */
.tool-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

/* Badge — 借鉴 ElevenLabs Badge Pill */
.info-badge {
  display: inline-block;
  background: #f5f0e8;
  color: #6c6a64;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  padding: 6rpx 20rpx;
  border-radius: 9999rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 学科选择/首页 | 氛围卡片 + 光球背景适合学科展示 |
| 工具介绍 | 药丸按钮 + 功能卡片的温和布局 |
| 标签筛选 | Badge pill 标签系统完美适配 |
| CTA 引导 | 药丸按钮的温和感适合学习工具 |

### 4.2 不适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 做题界面 | 氛围光球分散注意力 |
| 信息密度高的列表 | 光球装饰占用空间 |

### 4.3 混搭建议

- **学科氛围卡片**：从 ElevenLabs 的 Gradient Orb Card 迁移，为每个学科创建带有柔和光球背景的选择卡片
- **药丸 CTA**：从 ElevenLabs 的 Button Primary 迁移，用于重要操作按钮
- **Badge 标签**：直接采用，用于难度、状态、分类标签
- **编辑式标题**：借鉴 Waldenburg Light 300 的精神，用 Georgia 400 + 负字距营造编辑感

---

## 5. 实施检查清单

- [ ] 学科氛围卡片组件已实现（光球背景 + 标题）
- [ ] 药丸按钮组件已实现（实心 + 描边）
- [ ] Badge 标签组件已实现
- [ ] 功能卡片组件已实现
- [ ] 标题使用 Georgia 400 + 负字距
- [ ] 所有间距使用 rpx 单位
- [ ] 页面画布使用 `#faf9f5`
- [ ] CTA 使用珊瑚色 `#cc785c`
- [ ] 光球颜色仅用于学科氛围装饰，不作为操作色
- [ ] 无第三方字体引入

---

## 6. 参考文件

- 原始设计规范：`.claude/skills/elevenlabs-design.md`
- 暖奶油画布规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25
