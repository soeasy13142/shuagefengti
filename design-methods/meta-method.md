# Meta 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/meta-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Meta 的设计核心是 **"产品商品化的自信展示"** —— 硬件产品（Quest VR、Ray-Ban Meta AI 眼镜）通过全出血摄影卡片成为页面唯一主角，UI 用极简的双 CTA 模式（黑色主按钮 + 描边次按钮）和钴蓝色购买动作支撑商业转化。设计语言是"零售自信"——让产品图片承载所有情感，UI 只提供清晰的购买路径。

### 1.2 视觉 DNA
1. **白画布 + 全出血产品摄影**：纯白背景让产品图片成为唯一视觉焦点
2. **双 CTA Hero 模式**：黑色主按钮 + 描边次按钮，信息架构清晰
3. **钴蓝购买色**：#0064E0 专用于产品购买动作，从不装饰性使用
4. **100px pill 形按钮**：签名级圆角，所有交互元素统一 pill 形
5. **24-32px 卡片圆角**：慷慨的圆角营造友好的商业感
6. **Optimistic VF 可变字体**：weight 300-700，紧凑三层文字层级
7. **产品配置器**：内嵌式购买流程，不跳转
8. **语义色克制**：success/attention/warning/critical 仅用于状态反馈

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 钴蓝主色 | #0064E0 | 产品购买按钮、in-product 操作 |
| 钴蓝深色 | #0457cb | hover/press 状态 |
| 钴蓝浅色 | #0091ff | 辅助链接 |
| 黑色按钮 | #000000 | Hero 主 CTA |
| Facebook 蓝 | #1876f2 | 品牌关联 |
| 成功绿 | #31a24c | 正确状态 |
| 注意橙 | #f2a918 | 警告状态 |
| 危险红 | #e41e3f | 错误状态 |
| 画布白 | #ffffff | 主画布 |
| 柔灰面 | #f1f4f7 | 次级表面 |
| 深墨 | #0a1317 | 标题文字 |
| 正墨 | #1c1e21 | 正文文字 |
| 灰钢 | #5d6c7b | 次要文字 |
| 毛发线 | #ced0d4 | 分割线 |

### 1.4 字体策略
- **Optimistic VF**：可变字体，weight 300-700
- **Hero Display**：64px / 500 / 1.16 — 产品页主标题
- **Display LG**：48px / 500 / 1.17 — 区域标题
- **Heading LG**：36px / 500 / 1.28 — 卡片标题
- **Heading MD**：28px / 300 / 1.21 — 副标题（注意 weight 300）
- **Body**：16px / 400 / 1.50 — 正文
- **Caption**：14px / 400 / 1.43 — 说明文字
- **三层紧凑层级**：标题 500 → 副标题 300 → 正文 400，通过 weight 变化而非 size 变化表达层级

### 1.5 布局与组件模式
- **按钮**：pill 形（100px radius），黑色主 CTA + 描边次 CTA
- **卡片**：24-32px 圆角，全出血产品图 + 底部文字区
- **Hero**：双 CTA 模式，产品图占 60%+ 视口
- **配置器**：内嵌式购买流程，步骤化展示
- **间距**：16px 基础网格，24-32px 卡片间距
- **阴影**：最小化，仅用于浮动元素

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
1. **双 CTA Hero 模式**：主操作（开始刷题）+ 次操作（导入试题），信息架构清晰
2. **pill 形按钮**：100px radius 在小程序中完全可行，品牌感强
3. **24-32px 卡片圆角**：与暖奶油画布的 24rpx 圆角天然契合
4. **三层文字层级**：通过 weight 变化而非 size 变化表达层级，适合小程序有限屏幕空间
5. **语义色克制**：success/attention/warning/critical 仅用于状态反馈，不装饰

### 2.2 需要改造的设计决策
1. **钴蓝购买色 #0064E0**：需要替换为珊瑚色 #cc785c，保持"购买/行动"语义
2. **纯白画布 #ffffff**：需要替换为暖奶油 #faf9f5，保持温暖感
3. **黑色按钮 #000000**：需要替换为深海军蓝 #181715，与暖色系协调
4. **Optimistic VF 字体**：需要替换为 Georgia 衬线（标题）+ 系统字体（正文）
5. **64px Hero 标题**：在小程序 375px 宽屏幕上过于巨大，需要缩小到 56-64rpx
6. **全出血产品图**：本项目无产品摄影，需要用图标+文字替代

### 2.3 不可迁移的设计决策
1. **产品配置器**：本项目无购买流程，无法迁移
2. **全出血摄影卡片**：本项目无产品摄影资源
3. **Facebook 蓝 #1876f2**：品牌关联色，与本项目无关
4. **VR/AR 产品展示**：硬件产品展示逻辑不适用于学习工具

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Meta 角色 | 原色值 | 本项目色值 | 说明 |
|---|---|---|---|
| 钴蓝主色 | #0064E0 | #cc785c | 珊瑚色替代蓝色 |
| 钴蓝深色 | #0457cb | #a9583e | 深珊瑚 hover 态 |
| 钴蓝浅色 | #0091ff | #e8c4b8 | 浅珊瑚辅助 |
| 黑色按钮 | #000000 | #181715 | 深海军蓝 |
| 成功绿 | #31a24c | #31a24c | 保持不变 |
| 注意橙 | #f2a918 | #f2a918 | 保持不变 |
| 危险红 | #e41e3f | #e41e3f | 保持不变 |
| 画布白 | #ffffff | #faf9f5 | 暖奶油 |
| 柔灰面 | #f1f4f7 | #efe9de | 奶油卡片 |
| 深墨 | #0a1317 | #141413 | 暖墨 |
| 正墨 | #1c1e21 | #141413 | 暖墨 |
| 灰钢 | #5d6c7b | #6c6a64 | 暖灰 |
| 毛发线 | #ced0d4 | #e6dfd8 | 暖调分割线 |

### 3.2 字体映射

| Meta Token | Meta 参数 | 本项目参数 | 说明 |
|---|---|---|---|
| hero-display | 64px / 500 / 1.16 | 64rpx / 400 / -3rpx | Georgia 衬线，weight 400 |
| display-lg | 48px / 500 / 1.17 | 56rpx / 400 / -2rpx | 区域标题 |
| heading-lg | 36px / 500 / 1.28 | 44rpx / 400 / -1rpx | 卡片标题 |
| heading-md | 28px / 300 / 1.21 | 36rpx / 400 / 0 | 副标题 |
| heading-sm | 24px / 500 / 1.25 | 32rpx / 400 / 0 | 小节标题 |
| subtitle | 18px / 700 / 1.44 | 28rpx / 500 / 0 | 强调文字 |
| body | 16px / 400 / 1.50 | 28rpx / 400 / 0 | 正文 |
| caption | 14px / 400 / 1.43 | 24rpx / 400 / 0 | 说明文字 |

### 3.3 组件设计规范

**按钮（Primary Pill — Meta 签名）**
- 背景：#cc785c，文字：#ffffff
- 圆角：100rpx（Meta 签名 pill 形）
- 内边距：24rpx 48rpx
- 字号：28rpx / 500

**按钮（Secondary Outline）**
- 背景：透明，文字：#cc785c
- 边框：2rpx solid #cc785c
- 圆角：100rpx

**产品卡片（工具卡片）**
- 背景：#efe9de（奶油卡片）
- 圆角：24rpx（与 Meta 的 24-32px 一致）
- 内边距：32rpx
- 上部：图标/插图区（全宽）
- 下部：标题 + 描述 + CTA

**Hero 区（首页）**
- 背景：#faf9f5（暖奶油）
- 标题：64rpx Georgia 400
- 副标题：28rpx 400
- 双 CTA：pill 形主按钮 + 描边次按钮

### 3.4 页面布局模板

**首页 Hero（Meta 双 CTA 模式）**
```
┌─────────────────────────┐
│ 奶油画布 #faf9f5         │
│                         │
│   [品牌图标]             │
│                         │
│   刷个冯题               │  ← 64rpx Georgia
│   你的学习工具箱         │  ← 28rpx 暖灰
│                         │
│   [开始刷题] [导入试题]  │  ← pill 主 + pill 次
│                         │
└─────────────────────────┘
```

**工具卡片网格**
```
┌─────────────────────────┐
│ 奶油卡片 #efe9de         │
│ ┌─────────┐ ┌─────────┐ │
│ │ [图标]  │ │ [图标]  │ │
│ │ 排序    │ │ 子网    │ │
│ │ 可视化  │ │ 计算器  │ │
│ │ [进入→] │ │ [进入→] │ │
│ └─────────┘ └─────────┘ │
└─────────────────────────┘
```

### 3.5 WXSS 实现示例

```css
/* Meta 风格 pill 按钮 */
.meta-pill-primary {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 100rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
  border: none;
}

.meta-pill-secondary {
  background: transparent;
  color: #cc785c;
  border: 2rpx solid #cc785c;
  border-radius: 100rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
}

/* Meta 风格产品卡片 */
.meta-product-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.meta-product-card .card-image {
  width: 100%;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.meta-product-card .card-title {
  font-family: Georgia, serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -1rpx;
  margin-bottom: 12rpx;
}

.meta-product-card .card-desc {
  font-size: 28rpx;
  color: #6c6a64;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

/* Meta 风格 Hero 区 */
.meta-hero {
  background: #faf9f5;
  padding: 80rpx 40rpx;
  text-align: center;
}

.meta-hero .hero-title {
  font-family: Georgia, serif;
  font-size: 64rpx;
  font-weight: 400;
  color: #141413;
  letter-spacing: -3rpx;
  margin-bottom: 16rpx;
}

.meta-hero .hero-subtitle {
  font-size: 28rpx;
  color: #6c6a64;
  margin-bottom: 48rpx;
}

.meta-hero .hero-ctas {
  display: flex;
  gap: 24rpx;
  justify-content: center;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页**：Meta 的双 CTA Hero 模式完美适合首页"开始刷题"+"导入试题"
- **工具卡片网格**：Meta 的产品卡片布局适合首页工具箱展示
- **学习驾驶舱**：Meta 的三层文字层级适合数据密集的统计页面

### 4.2 不适合用在哪些页面
- **刷题页**：需要专注的答题界面，Meta 的零售风格过于商业化
- **错题本**：文字密集的列表页，不需要产品卡片
- **导入预览**：功能性页面，不需要品牌化展示

### 4.3 混搭建议
- **保留 Meta 的 pill 形按钮**：100rpx 圆角是强品牌信号，可以全局使用
- **保留 Meta 的双 CTA 模式**：适合所有需要明确主次操作的场景
- **替换色彩系统**：钴蓝 → 珊瑚色，白画布 → 暖奶油
- **替换字体**：Optimistic VF → Georgia 衬线
- **保留卡片圆角**：24rpx 与暖奶油画布天然契合
- **简化 Hero**：去掉产品摄影，用图标+文字替代

---

## 5. 实施检查清单

- [ ] 检查所有 pill 形按钮是否使用 100rpx 圆角
- [ ] 检查 Hero 区是否采用双 CTA 模式（主 + 次）
- [ ] 检查卡片圆角是否为 24rpx
- [ ] 检查文字层级是否通过 weight 变化（400/500）而非 size 变化表达
- [ ] 检查语义色是否仅用于状态反馈（success/attention/warning/critical）
- [ ] 检查是否避免使用纯白 #ffffff 画布（应使用暖奶油 #faf9f5）
- [ ] 检查是否避免使用钴蓝 #0064E0（应使用珊瑚色 #cc785c）
- [ ] 检查产品卡片是否采用"上图下文"布局
- [ ] 检查 Hero 标题是否使用 Georgia 衬线 64rpx

---

## 6. 参考文件

- 原方案：`.claude/skills/meta-design.md`
- 当前设计系统：`PROJECT_HANDOFF.md §25`
- 全局样式：`app.wxss`
- 首页实现：`pages/index/index.wxss`
