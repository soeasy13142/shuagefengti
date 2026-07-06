# HashiCorp 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/hashicorp-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

HashiCorp 的营销画布是一个近乎纯黑的地面，服务于多产品组合而不显得通用。主导表面是 `{colors.canvas}`（纯黑）分层为 `{colors.surface-1}` 炭色卡片和 1px 半透明灰色发丝线。Chrome 是单色的——白色药丸圆角按钮、白色文字、灰色次要文字——但系统由**每产品强调色**维系：Terraform 紫、Vault 黄、Consul 红、Waypoint 青、Vagrant 蓝、Nomad 绿、Boundary 珊瑚。每个色不是装饰调色板，而是身份令牌。

### 1.2 视觉 DNA

- 纯黑画布 `#000000` 配白色文字
- 炭色卡片层级：surface-1 → surface-2 → surface-3
- 每产品强调色系统（7 个产品色）
- Display hashicorpSans 600/700，tight line-height (1.17-1.21)
- Body hashicorpSans 500，relaxed line-height (1.50-1.71)
- CTA 圆角 8px (md)——非药丸
- 1px 半透明灰色发丝线
- 无阴影，靠表面色差区分层级
- Eyebrow 大写标签 12px, 0.6px tracking

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|---|---|---|
| Canvas | `#000000` | 纯黑页面底 |
| Surface 1 | `#15181e` | 炭色卡片 |
| Surface 2 | `#1f232b` | 更亮炭色 |
| Surface 3 | `#3b3d45` | 芯片/标签 |
| Ink | `#ffffff` | 白色主文字 |
| Ink Muted | `#b2b6bd` | 次要文字 |
| Ink Subtle | `#656a76` | 弱文字 |
| Inverse Canvas | `#ffffff` | 按钮表面 |
| Inverse Ink | `#000000` | 按钮文字 |
| Terraform | `#7b42bc` | 产品-紫 |
| Vault | `#ffcf25` | 产品-黄 |
| Consul | `#e62b1e` | 产品-红 |
| Waypoint | `#14c6cb` | 产品-青 |
| Vagrant | `#1868f2` | 产品-蓝 |
| Nomad | `#00ca8e` | 产品-绿 |
| Boundary | `#f24c53` | 产品-珊瑚 |

### 1.4 字体策略

- **单一字体**：hashicorpSans — 几何 humanist sans
- Display：600/700 weight, tight line-height (1.17-1.21)
- Body：500 weight, relaxed line-height (1.50-1.71)
- Eyebrow：12px, 600 weight, 0.6px tracking, uppercase
- 没有等宽字体——代码声音保留给产品内表面

### 1.5 布局与组件模式

- Section spacing：96px
- 卡片圆角：12px (lg)
- 按钮圆角：8px (md)
- 产品色卡片：每产品专属背景色
- Eyebrow 标签：每区块顶部的大写小标签
- CTA banner：24px (xxl) 圆角大面板
- 1px 半透明发丝线定义边界

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|---|---|
| 每产品/学科强调色系统 | 可改造为"每学科强调色"——每个学科分配专属色 |
| Eyebrow 大写标签 | 可用于学科/章节/难度标签 |
| 炭色卡片层级 | 暖奶油画布的深色表面已有类似层级 |
| Tight display + relaxed body 对比 | 可借鉴 line-height 对比策略 |
| CTA banner 圆角面板 | 可用于页面底部引导 |
| 零阴影靠表面色差 | 暖奶油画布本身就是这样做的 |

### 2.2 需要改造的设计决策

| 原决策 | 改造方向 |
|---|---|
| 纯黑画布 | 改为暖奶油 `#faf9f5` |
| 炭色卡片 | 改为奶油卡片 `#efe9de` |
| 白色主文字 | 改为暖墨 `#141413` |
| hashicorpSans 字体 | 改为 Georgia 标题 + 系统 sans 正文 |
| 8px 按钮圆角 | 改为 16rpx |
| 12px 卡片圆角 | 改为 24rpx |
| 产品色系统 | 改为学科色系统 |
| Eyebrow 0.6px tracking | 保持但缩减为 1rpx |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|---|---|
| 纯黑营销画布 | 与暖奶油画布冲突 |
| hashicorpSans 授权字体 | 不可用 |
| 半透明发丝线 `rgba()` | 小程序不支持 rgba 边框颜色（部分版本） |
| 3D 产品插图 | 学习工具无此场景 |
| 多产品色在同一页面 | 学习工具不需要如此复杂的色系统 |
| Comparison table | 学习工具无定价对比场景 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| HashiCorp 角色 | 刷个冯题映射 | 色值 | 用途 |
|---|---|---|---|
| Canvas `#000000` | 画布 | `#faf9f5` | 页面底 |
| Surface 1 `#15181e` | 卡片 | `#efe9de` | 功能卡片 |
| Surface 2 `#1f232b` | 强调卡片 | `#e8e0d2` | Featured 卡片 |
| Ink `#ffffff` | 暖墨 | `#141413` | 主文字 |
| Ink Muted `#b2b6bd` | 次要文字 | `#6c6a64` | 次要信息 |
| Inverse Canvas `#ffffff` | CTA 表面 | `#cc785c` | 珊瑚色按钮 |
| Terraform `#7b42bc` | 学科-数学 | `#6b9bd2` | 数学色 |
| Vault `#ffcf25` | 学科-物理 | `#5b8c5a` | 物理色 |
| Consul `#e62b1e` | 学科-化学 | `#e8a55a` | 化学色 |
| Waypoint `#14c6cb` | 学科-英语 | `#cc785c` | 英语色 |
| Vagrant `#1868f2` | 学科-语文 | `#5db8a6` | 语文色 |
| Nomad `#00ca8e` | 学科-生物 | `#7bc47f` | 生物色 |
| Boundary `#f24c53` | 学科-历史 | `#9b8ec4` | 历史色 |

### 3.2 字体映射（用 rpx）

| HashiCorp Token | 刷个冯题映射 | rpx 值 |
|---|---|---|
| display-xl (80px, 700) | 首页大标题 | 64rpx Georgia, 400, -3rpx |
| display-lg (56px, 700) | 区块标题 | 48rpx Georgia, 400, -2rpx |
| display-md (40px, 600) | 子标题 | 36rpx Georgia, 400, -1rpx |
| headline (28px, 600) | 小标题 | 36rpx sans-serif, 600 |
| card-title (22px, 600) | 卡片标题 | 36rpx sans-serif, 600 |
| body (16px, 500) | 正文 | 28rpx sans-serif, 500 |
| body-sm (14px, 500) | 小正文 | 24rpx sans-serif, 500 |
| caption (13px, 500) | 标签 | 24rpx sans-serif, 500 |
| button (14px, 600) | 按钮 | 28rpx sans-serif, 600 |
| eyebrow (12px, 600) | 区块标签 | 22rpx sans-serif, 600, 1rpx |

### 3.3 组件设计规范

**学科卡片（借鉴 Product Card）**
```css
.subject-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.subject-card--featured {
  background: #e8e0d2;
}
```

**学科色卡片（借鉴 Product Card Terraform/Vault/Waypoint）**
```css
.subject-card--math {
  background: rgba(107,155,210,0.15);
  border-left: 8rpx solid #6b9bd2;
  border-radius: 24rpx;
  padding: 32rpx;
}
.subject-card--physics {
  background: rgba(91,140,90,0.15);
  border-left: 8rpx solid #5b8c5a;
}
.subject-card--chemistry {
  background: rgba(232,165,90,0.15);
  border-left: 8rpx solid #e8a55a;
}
```

**Eyebrow 标签（借鉴 Typography Eyebrow）**
```css
.section-label {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  color: #6c6a64;
  text-transform: uppercase;
  margin-bottom: 16rpx;
}
```

**CTA Banner（借鉴 CTA Banner）**
```css
.cta-banner {
  background: #efe9de;
  border-radius: 48rpx;
  padding: 64rpx;
  text-align: center;
}
.cta-banner__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 24rpx;
}
```

**产品 Pill 标签（借鉴 Product Pill）**
```css
.subject-pill {
  display: inline-block;
  background: #efe9de;
  color: #6c6a64;
  font-size: 24rpx;
  font-weight: 500;
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
│  │ EYEBROW: 数学            │  │
│  │ Georgia 标题             │  │
│  │ 正文                     │  │
│  │ [珊瑚色按钮]             │  │
│  └─────────────────────────┘  │
│                               │
│  ┌────────┐ ┌────────┐       │
│  │数学色卡│ │物理色卡│       │
│  │蓝边框  │ │绿边框  │       │
│  └────────┘ └────────┘       │
│                               │
│  ┌────────┐ ┌────────┐       │
│  │化学色卡│ │英语色卡│       │
│  │橙边框  │ │珊瑚边框│       │
│  └────────┘ └────────┘       │
│                               │
│  ┌─────────────────────────┐  │
│  │ CTA Banner（大圆角）     │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* Eyebrow 区块标签 — 借鉴 HashiCorp Eyebrow */
.section-eyebrow {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  color: #6c6a64;
  margin-bottom: 16rpx;
}

/* 学科色卡片 — 借鉴 HashiCorp Product Card */
.subject-tile {
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border-left: 8rpx solid;
}
.subject-tile--math {
  background: rgba(107,155,210,0.12);
  border-left-color: #6b9bd2;
}
.subject-tile--physics {
  background: rgba(91,140,90,0.12);
  border-left-color: #5b8c5a;
}
.subject-tile--chemistry {
  background: rgba(232,165,90,0.12);
  border-left-color: #e8a55a;
}
.subject-tile--english {
  background: rgba(204,120,92,0.12);
  border-left-color: #cc785c;
}
.subject-tile--chinese {
  background: rgba(93,184,166,0.12);
  border-left-color: #5db8a6;
}
.subject-tile__name {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 12rpx;
}
.subject-tile__desc {
  font-size: 28rpx;
  font-weight: 500;
  color: #3d3d3a;
  line-height: 1.6;
}

/* CTA Banner — 借鉴 HashiCorp CTA Banner */
.cta-panel {
  background: #efe9de;
  border-radius: 48rpx;
  padding: 64rpx 48rpx;
  text-align: center;
  margin-top: 48rpx;
}
.cta-panel__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 24rpx;
}
.cta-panel__btn {
  display: inline-block;
  background: #cc785c;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  padding: 16rpx 40rpx;
  border-radius: 16rpx;
}

/* 学科 Pill — 借鉴 HashiCorp Product Pill */
.subject-tag {
  display: inline-block;
  background: #efe9de;
  color: #6c6a64;
  font-size: 24rpx;
  font-weight: 500;
  padding: 6rpx 20rpx;
  border-radius: 9999rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

/* Featured 卡片 — 借鉴 HashiCorp Pricing Card Featured */
.card--highlight {
  background: #e8e0d2;
  border-radius: 24rpx;
  padding: 48rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 学科导航 | 每学科色卡片系统完美适配 |
| 首页 | Eyebrow + 标题 + 学科色卡 + CTA Banner 的完整布局 |
| 知识模块浏览 | 色彩标识的卡片网格适合模块化展示 |
| 工具列表 | Pill 标签 + 卡片的信息架构适配 |

### 4.2 不适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 做题界面 | 学科色装饰分散注意力 |
| 纯文字阅读 | 不需要色块强调 |

### 4.3 混搭建议

- **学科色系统**：从 HashiCorp 的每产品色迁移，为每个学科分配专属色，用于卡片左边框和背景色
- **Eyebrow 标签**：直接采用，用于每区块顶部的学科/章节/难度标识
- **CTA Banner**：从 HashiCorp 的 CTA Banner 迁移，用大圆角奶油面板引导用户行动
- **Pill 标签**：从 HashiCorp 的 Product Pill 迁移，用于学科/状态标签

---

## 5. 实施检查清单

- [ ] 学科色系统已定义（至少 5 个学科色 + 左边框 + 半透明背景）
- [ ] Eyebrow 标签组件已实现（大写 + 1rpx tracking）
- [ ] 学科色卡片组件已实现（左边框 + 半透明背景）
- [ ] CTA Banner 组件已实现（48rpx 大圆角）
- [ ] Pill 标签组件已实现
- [ ] Featured 卡片组件已实现（`#e8e0d2` 强调背景）
- [ ] 标题使用 Georgia 400 + 负字距
- [ ] 正文使用系统 sans-serif, 500 weight
- [ ] 所有间距使用 rpx 单位
- [ ] 页面画布使用 `#faf9f5`
- [ ] 无第三方字体引入

---

## 6. 参考文件

- 原始设计规范：`.claude/skills/hashicorp-design.md`
- 暖奶油画布规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25
