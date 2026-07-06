# BMW M 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/bmw-m-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

BMW M 的设计语言建立在"工程精确感"之上：近乎纯黑的画布、大写加粗标题、全出血汽车摄影作为唯一的视觉电压。系统没有装饰性元素——所有能量来自摄影内容本身和 M 三色条纹（浅蓝 → 深蓝 → 红）的品牌标识。排版保持轻到中等字重，传达欧洲工程美学，而非美式夸张。

### 1.2 视觉 DNA

- 纯黑画布 `#000000` 配白色文字
- 大写标题，weight 700，零字间距
- 正文 weight 300（Light），与标题形成强烈对比
- M 三色条纹作为品牌签名元素
- 零圆角（工业精度）
- 零阴影，靠色块对比和摄影表达深度

### 1.3 色彩策略

| 角色 | 色值 | 说明 |
|---|---|---|
| Canvas | `#000000` | 纯黑页面底 |
| Surface Card | `#1a1a1a` | 卡片背景 |
| Surface Elevated | `#262626` | 嵌套卡片 |
| Ink / On Dark | `#ffffff` | 主文字 |
| Body | `#bbbbbb` | 正文灰 |
| Muted | `#7e7e7e` | 次要文字 |
| Hairline | `#3c3c3c` | 分割线 |
| M Blue Light | `#0066b1` | M 三色-蓝1 |
| M Blue Dark | `#1c69d4` | M 三色-蓝2 |
| M Red | `#e22718` | M 三色-红 |

### 1.4 字体策略

- **显示字体**：BMWTypeNextLatin, sans-serif — weight 700，大写
- **正文**：BMWTypeNextLatin Light — weight 300
- **按钮/标签**：weight 700，1.5px letter-spacing
- 显示与正文的字重对比（700 vs 300）是编辑签名

### 1.5 布局与组件模式

- 间距基准：4px
- Section padding：96px
- 卡片内边距：24px
- 圆角：几乎全部 0px，仅圆形图标按钮用 full
- 按钮：矩形、大写、无圆角、1px 白色描边
- 卡片：无阴影，靠表面色差区分层级

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

| 决策 | 说明 |
|---|---|
| 标题与正文的字重对比 | 暖奶油画布已有 Georgia 400 标题 + 系统 sans 正文，可借鉴 700/300 的对比思路，但需保持 400 |
| 深色表面用于代码/技术内容 | `#181715` 已是暖奶油画布的深色表面，可直接用于代码展示区 |
| 零阴影靠色块对比 | 暖奶油画布本身就是这样做的 |
| generous section padding（96px） | 与暖奶油画布的 section spacing 一致 |
| M 三色条纹作为品牌签名 | 可借鉴为"学科标识色条"——不同学科用不同色条 |

### 2.2 需要改造的设计决策

| 原决策 | 改造方向 |
|---|---|
| 纯黑画布 `#000000` | 改为暖奶油 `#faf9f5`（项目主画布） |
| 白色主文字 | 改为暖墨 `#141413` |
| 全部零圆角 | 改为 24rpx 卡片圆角（暖奶油画布规范） |
| 大写标题 | 改为正常大小写（学习工具不需要工业感） |
| weight 700 标题 | 改为 weight 400 Georgia（项目规范） |
| M 三色条纹 | 改为"冯题学科色条"——数学蓝、物理绿、化学橙等 |
| 1px 白色描边按钮 | 改为实心珊瑚色 `#cc785c` 按钮 |

### 2.3 不可迁移的设计决策

| 决策 | 原因 |
|---|---|
| 全出血汽车摄影 | 微信小程序无此场景，学习工具以文字/图表为主 |
| BMWTypeNextLatin 字体 | 授权字体不可用，且风格过于工程化 |
| 1.5px letter-spacing 按钮标签 | 学习工具不需要"机加工感" |
| 轮播箭头等圆形控制 | 小程序原生组件已覆盖此功能 |
| 0px 圆角的矩形按钮 | 与暖奶油画布的温和风格冲突 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| BMW M 角色 | 刷个冯题映射 | 色值 |
|---|---|---|
| Canvas `#000000` | 画布 | `#faf9f5` |
| Surface Card `#1a1a1a` | 卡片 | `#efe9de` |
| Ink `#ffffff` | 暖墨 | `#141413` |
| Body `#bbbbbb` | 次要文字 | `#6c6a64` |
| Muted `#7e7e7e` | 弱文字 | `#8e8b82` |
| M Blue Light `#0066b1` | 学科色-数学 | `#0066b1` |
| M Red `#e22718` | 学科色-物理 | `#e22718` |
| M Blue Dark `#1c69d4` | 学科色-化学 | `#1c69d4` |
| Hairline `#3c3c3c` | 分割线 | `#e6dfd8` |

### 3.2 字体映射（用 rpx）

| BMW M Token | 刷个冯题映射 | rpx 值 |
|---|---|---|
| display-xl (80px) | 首页大标题 | 64rpx Georgia, 400, -3rpx |
| display-lg (56px) | 区块标题 | 48rpx Georgia, 400, -2rpx |
| title-lg (24px) | 卡片标题 | 36rpx Georgia, 400, -1rpx |
| body-md (16px) | 正文 | 28rpx sans-serif, 400 |
| caption (12px) | 标签 | 22rpx sans-serif, 500 |
| button (14px) | 按钮 | 28rpx sans-serif, 500 |

### 3.3 组件设计规范

**学科标识条（借鉴 M 三色条）**

```css
.subject-stripe {
  height: 8rpx;
  border-radius: 4rpx;
  /* 每个学科不同颜色 */
}
.subject-stripe--math { background: #0066b1; }
.subject-stripe--physics { background: #e22718; }
.subject-stripe--chemistry { background: #1c69d4; }
```

**题目卡片（借鉴 feature-photo-card）**

```css
.question-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  /* 零阴影，靠色块对比 */
}
```

**深色代码/解析区（借鉴 spec-cell）**

```css
.explanation-dark {
  background: #181715;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 32rpx;
}
```

### 3.4 页面布局模板

```
┌─────────────────────────┐
│ 画布 #faf9f5            │
│  ┌───────────────────┐  │
│  │ 学科色条 (8rpx)    │  │
│  │ 区块标题 Georgia   │  │
│  │ 正文 sans-serif    │  │
│  └───────────────────┘  │
│  ┌──────┐ ┌──────┐     │
│  │题目卡│ │题目卡│     │
│  │#efe9 │ │#efe9 │     │
│  └──────┘ └──────┘     │
│  ┌───────────────────┐  │
│  │ 解析区 #181715     │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* 学科标识条 — 借鉴 M Stripe Divider */
.subject-divider {
  display: flex;
  height: 8rpx;
  margin-bottom: 24rpx;
  border-radius: 4rpx;
  overflow: hidden;
}
.subject-divider__segment {
  flex: 1;
  height: 100%;
}

/* 题目卡片 — 借鉴 feature-photo-card */
.q-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.q-card__title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 16rpx;
}
.q-card__body {
  font-size: 28rpx;
  color: #3d3d3a;
  line-height: 1.6;
}

/* 深色解析区 — 借鉴 spec-cell */
.explanation-block {
  background: #181715;
  border-radius: 24rpx;
  padding: 32rpx;
  color: #faf9f5;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 学科分类导航 | 借鉴 M 三色条为每个学科分配标识色 |
| 深色代码/公式展示区 | BMW M 的深色表面 + 白色文字完美适配 |
| 技术规格型内容（公式、定理） | spec-cell 的信息密度适合展示知识点 |

### 4.2 不适合用在哪些页面

| 场景 | 理由 |
|---|---|
| 首页 | 纯黑风格与暖奶油画布冲突 |
| 用户个人中心 | 工业感过强，不够亲切 |
| 学习进度展示 | 需要温暖鼓励感，而非冷峻工程感 |

### 4.3 混搭建议

- **学科色条系统**：从 BMW M 三色条迁移，为每个学科/知识模块分配专属色条，用于分类导航和进度标识
- **深色解析面板**：从 BMW M 的深色卡片迁移，用于代码展示、公式推导等需要高对比度的场景
- **信息密度卡片**：借鉴 spec-cell 的紧凑布局，用于知识点速查卡

---

## 5. 实施检查清单

- [ ] 学科色条系统已定义（至少 5 个学科色）
- [ ] 深色解析面板圆角使用 24rpx（非 0px）
- [ ] 标题使用 Georgia 400（非 700 sans）
- [ ] 正文使用系统 sans-serif（非 BMWTypeNextLatin Light）
- [ ] 所有间距使用 rpx 单位
- [ ] 按钮使用珊瑚色 `#cc785c` 实心填充（非白色描边）
- [ ] 卡片背景使用 `#efe9de`（非 `#1a1a1a`）
- [ ] 页面画布使用 `#faf9f5`（非 `#000000`）
- [ ] 分割线使用 `#e6dfd8`（非 `#3c3c3c`）
- [ ] 无第三方字体引入

---

## 6. 参考文件

- 原始设计规范：`.claude/skills/bmw-m-design.md`
- 暖奶油画布规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25
