# Shopify 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/shopify-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Shopify 运行两条平行设计轨道，共享字体 DNA 和单一按钮词汇，但在画布极性上分道扬镳。营销轨道活在近黑画布上——全出血商户摄影、巨型 Neue Haas Grotesk Display 细体标题、白色描边黑色药丸 CTA，像高端印刷杂志的跨页。交易轨道翻转到奶油薄荷画布——定价表、对比表、注册流程，同一个药丸按钮系统但极性反转。**两条轨道从不混合**——这个选择本身就是品牌。

### 1.2 视觉 DNA
- 双轨道：近黑画布（电影营销）vs 奶油/薄荷画布（交易功能）
- 药丸形是唯一按钮形状，从不使用圆角矩形
- 细体（weight 330）display 排版是签名——巨型尺寸 + 极细字重 = 安静的编辑感
- 薄荷绿 `#c1fbd4` 和开心果绿 `#d4f9e0` 仅出现在浅色轨道
- 全出血摄影在电影轨道上——图片逃逸容器
- OpenType ss03 特性集全局启用（字符级签名）

### 1.3 色彩策略
- **纯黑 `#000000`**：电影营销画布
- **奶油 `#fbfbf5`**：交易画布（几乎不可察觉的暖调）
- **薄荷 `#c1fbd4`**：精选 tier 和"增长"强调
- **开心果 `#d4f9e0`**：比薄荷柔和，用于功能分类 band
- **冷链接色** `#9dabad` / `#9797a2`：暗色表面上的三级链接
- **灰度梯度**：`#d4d4d8` → `#a1a1aa` → `#71717a` → `#52525b` → `#3f3f46`

### 1.4 字体策略
- **Display**：Neue Haas Grotesk Display，weight 330（极细），96px hero + 2.4px 正字间距
- **Body/UI**：Inter Variable，weight 420-550
- **Code**：ui-monospace
- **原则**：display 永远 330 weight，从不 400+；body 永远用 Inter，不用 NHGD

### 1.5 布局与组件模式
- 药丸按钮（`rounded.pill` 9999px）——唯一按钮形状
- 卡片 `rounded.lg` 12px
- 电影页面 128-192px 段间距（极端负空间）
- 交易页面 48-64px 段间距（密度优先）
- 堆叠微阴影（4 层 1-8px Y offset）用于浅色卡片深度

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
| 设计决策 | 原始参数 | 刷个冯题适配 |
|---|---|---|
| 药丸唯一按钮形状 | 9999px | 直接采用，与暖奶油画布兼容 |
| 双轨道概念 | 暗色营销 vs 浅色交易 | 暗色 hero vs 暖奶油功能区 |
| 细体 display 理念 | weight 330 | Georgia 400 weight 本身就有细体感 |
| 奶油画布 | `#fbfbf5` | 与当前 `#faf9f5` 几乎一致 |
| 卡片圆角 12px | `rounded.lg` | 24rpx，与当前一致 |
| 堆叠微阴影 | 4 层小阴影 | 可选用于精选卡片 |

### 2.2 需要改造的设计决策
| 设计决策 | 原始参数 | 改造方案 |
|---|---|---|
| 纯黑画布 | `#000000` | 改为 `#181715` 深海军蓝 |
| 薄荷绿强调 | `#c1fbd4` | 改为暖色调替代或保留用于"推荐"标记 |
| 开心果绿 band | `#d4f9e0` | 改为 `#efe9de` 奶油卡片色 |
| NHGD weight 330 | 专有字体 | Georgia 400 weight 已有类似细体感 |
| 96px + 2.4px tracking | 巨型 display | 缩小到 72rpx，tracking 1rpx |
| ss03 OpenType 特性 | 字体特性 | 微信小程序不支持，跳过 |

### 2.3 不可迁移的设计决策
| 设计决策 | 原因 |
|---|---|
| Neue Haas Grotesk Display | 专有字体 |
| Inter Variable 可变字重 420/550 | 小程序系统字体不支持精确子字重 |
| ss03 OpenType 特性集 | 微信小程序不支持 |
| 全出血摄影逃逸容器 | 小程序无全宽 viewport |
| 1600px 最大容器 | 小程序宽度固定 750rpx |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Shopify 原色 | 刷个冯题映射 | 用途 |
|---|---|---|
| `#000000` canvas-night | `#181715` 深海军蓝 | 深色画布 |
| `#0a0a0a` canvas-night-elevated | `#2a2927` | 深色卡片 |
| `#ffffff` canvas-light | `#faf9f5` 暖奶油 | 默认画布 |
| `#fbfbf5` canvas-cream | `#faf9f5` | 与当前画布一致 |
| `#c1fbd4` aloe-10 | `#d4e8a0` 暖黄绿 | 精选/推荐标记 |
| `#d4f9e0` pistachio-10 | `#efe9de` 奶油卡片 | 功能分类 band |
| `#d4d4d8` shade-30 | `#d6d0c4` | 标签背景、边框 |
| `#71717a` shade-50 | `#6c6a64` | 二级文字 |
| `#3f3f46` shade-70 | `#2a2927` | 按钮 pressed 状态 |
| `#e4e4e7` hairline-light | `#d6d0c4` | 浅色边框 |

### 3.2 字体映射（用 rpx）

| Shopify token | 刷个冯题实现 |
|---|---|
| Display XXL 96px/330/1.0/2.4px | Georgia 72rpx / 400 / line-height 1.0 / letter-spacing 1rpx |
| Display XL 70px/330/1.0/0 | Georgia 56rpx / 400 / line-height 1.0 |
| Display LG 55px/330/1.16/0 | Georgia 48rpx / 400 / line-height 1.16 |
| Display MD 48px/330/1.14/0 | Georgia 44rpx / 400 / line-height 1.14 |
| Heading XL 28px/500/1.28/0.42px | Georgia 36rpx / 400 / line-height 1.28 |
| Body MD 16px/420/1.5/0 | 系统字体 28rpx / 400 / line-height 1.5 |
| Body Strong 16px/550/1.5/0 | 系统字体 28rpx / 600 / line-height 1.5 |
| Caption 14px/500/1.49/0.28px | 系统字体 26rpx / 500 / line-height 1.5 |
| Eyebrow Cap 12px/400/1.2/0.72px | 系统字体 24rpx / 400 / uppercase / letter-spacing 2rpx |

### 3.3 组件设计规范

**药丸主 CTA（通用）**
```css
.btn-pill {
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  text-align: center;
}
```

**药丸 CTA（浅色画布）**
```css
.btn-pill-on-light {
  background-color: #141413;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
}
.btn-pill-on-light:active {
  background-color: #2a2927;
}
```

**药丸 CTA（深色画布，描边）**
```css
.btn-pill-outline-on-dark {
  background-color: transparent;
  color: #faf9f5;
  border: 2rpx solid #faf9f5;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
}
```

**推荐药丸 CTA（薄荷色）**
```css
.btn-pill-featured {
  background-color: #d4e8a0;
  color: #141413;
  border-radius: 9999rpx;
  padding: 20rpx 40rpx;
}
```

**定价卡片（标准）**
```css
.card-pricing {
  background-color: #faf9f5;
  border: 1rpx solid #d6d0c4;
  border-radius: 24rpx;
  padding: 48rpx;
}
```

**定价卡片（精选）**
```css
.card-pricing-featured {
  background-color: #d4e8a0;
  color: #141413;
  border-radius: 24rpx;
  padding: 48rpx;
}
```

**堆叠微阴影（可选）**
```css
.card-elevated {
  box-shadow:
    0 2rpx 4rpx rgba(0,0,0,0.04),
    0 4rpx 8rpx rgba(0,0,0,0.04),
    0 8rpx 16rpx rgba(0,0,0,0.04),
    0 16rpx 32rpx rgba(0,0,0,0.04);
}
```

### 3.4 页面布局模板

**双轨道页面**
```
┌─────────────────────────────┐
│  深色电影 hero               │  ← 大标题（细体 Georgia）+ 描边药丸 CTA
│  Georgia 72rpx 白字          │
│  [描边白药丸 CTA]            │
├─────────────────────────────┤
│  暖奶油功能区                 │  ← 卡片网格 / 列表
│  标准卡片 + 边框              │
│  [黑底白字药丸 CTA]          │
├─────────────────────────────┤
│  暖黄绿推荐 band             │  ← 精选内容
│  [暖黄绿药丸 CTA]            │
└─────────────────────────────┘
```

### 3.5 WXSS 实现示例

**细体 display 标题（模拟 NHGD 330）**
```css
.title-display {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 72rpx;
  font-weight: 400;  /* Georgia 400 ≈ NHGD 330 细体感 */
  line-height: 1.0;
  letter-spacing: 1rpx;
  color: #faf9f5;
}
```

**Eyebrow 大写标签**
```css
.eyebrow-cap {
  font-size: 24rpx;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  color: #6c6a64;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页 hero**：细体大标题 + 描边药丸 CTA，编辑感强
- **学习计划/进度页**：定价卡片式布局用于学习阶段展示
- **工具推荐/精选**：暖黄绿 band 标记推荐内容
- **注册/设置流程**：浅色轨道的交易风格

### 4.2 不适合用在哪些页面
- **纯暗色工具页**：Shopify 的浅色轨道更适合学习工具
- **高密度数据页**：极细字重在小尺寸下可读性差
- **需要活泼氛围的页面**：细体排版过于克制

### 4.3 混搭建议
- **细体标题 + 暖奶油画布**：Georgia 400 weight 在暖奶油背景上呈现编辑感
- **药丸按钮全面采用**：所有 CTA 统一药丸，与当前风格兼容
- **暖黄绿推荐标记**：在暖奶油画布上，暖黄绿 `#d4e8a0` 作为推荐/精选的视觉信号
- **描边药丸用于次要操作**：在深色 band 上，描边白药丸作为次要 CTA

---

## 5. 实施检查清单

- [ ] 深色画布 `#181715`，不是纯黑
- [ ] 浅色画布 `#faf9f5`，与当前一致
- [ ] 药丸按钮 9999rpx，唯一按钮形状
- [ ] 标题 Georgia 400 weight，模拟细体感
- [ ] display line-height 1.0
- [ ] display letter-spacing 正值 1rpx（96px 原为 2.4px）
- [ ] 卡片圆角 24rpx
- [ ] 推荐标记用暖黄绿 `#d4e8a0`
- [ ] Eyebrow 标签 uppercase + 2rpx tracking
- [ ] 描边药丸用于深色画布次要 CTA
- [ ] 堆叠微阴影可选用于精选卡片
- [ ] 触摸目标最小 80rpx

---

## 6. 参考文件

- 源文件：`.claude/skills/shopify-design.md`
- 项目设计风格：`CLAUDE.md` § 设计风格约束
- 项目交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
