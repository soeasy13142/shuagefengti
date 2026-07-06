# Starbucks 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/starbucks-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Starbucks 的设计语言是 **温暖、自信的零售旗舰**。核心理念：
- **多层品牌色系统**：四层绿色（Starbucks Green / Accent / House / Uplift）各映射到不同表面角色，而非单一品牌绿
- **暖色中性画布**：用 `#f2f0eb` / `#edebe9` 奶油色代替冷白，呼应咖啡馆材质（纸巾、墙壁、木质）
- **色彩块节奏**：奶油 Hero → 白色内容区 → 深绿色特征带 → 奶油工具区 → 深绿页脚，形成"浓缩咖啡深色书挡"
- **克制的深度**：阴影永远是耳语级（alpha 0.14/0.24），通过 2-3 层低透明度叠加实现，从不使用单一重阴影

### 1.2 视觉 DNA
- 全圆角药丸按钮（50px radius），`scale(0.95)` 按压缩放是签名微交互
- 浮动圆形 CTA（Frap 按钮，56px 直径，Green Accent 填充，分层阴影栈）
- 12px 卡片圆角 + 耳语级阴影 = "平面上微抬"
- 礼品卡表面是 **实拍物理产品照片**，而非生成图形

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| Starbucks Green | `#006241` | H1 标题、主品牌信号 |
| Green Accent | `#00754A` | 主 CTA 按钮、浮动按钮填充 |
| House Green | `#1E3932` | 页脚、特征带背景、深色表面 |
| Gold | `#cba258` | 仅限 Rewards 状态仪式，非通用强调色 |
| Neutral Warm | `#f2f0eb` | 主页面画布 |
| Ceramic | `#edebe9` | 区域分隔、柔和页面分区 |
| Text Black | `rgba(0,0,0,0.87)` | 主标题/正文（非纯黑） |
| Text Black Soft | `rgba(0,0,0,0.58)` | 次要/元数据文字 |

### 1.4 字体策略
- **主字体**：SoDoSans（星巴克专有），tight `-0.01em` letter-spacing 全局应用
- **层级靠粗细而非字号**：H1 和 H2 同为 24px/36px，仅靠 600 vs 400 粗细 + 颜色区分
- **场景化字体切换**：Rewards 页用衬线（Lander Tall / Georgia），Careers 页用手写体（Kalam）
- **正文永不纯黑**：`rgba(0,0,0,0.87)` 匹配暖色画布温度

### 1.5 布局与组件模式
- 间距基数：1.6rem (16px) = `--space-3`，步进到 6.4rem (64px)
- 卡片：12px 圆角 + 耳语阴影
- 按钮：50px 全药丸 + `scale(0.95)` active
- 浮动 Frap 按钮：56px 圆形，固定右下，分层阴影栈

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **暖色中性画布**：`#f2f0eb` 与当前暖奶油画布 `#faf9f5` 气质一致，可直接借鉴温度感
- **正文不使用纯黑**：`rgba(0,0,0,0.87)` 的理念与当前 `#141413`（暖墨）一致
- **12px 卡片圆角**：与当前 24rpx 接近，可直接采用
- **耳语级阴影哲学**：2-3 层低 alpha 叠加替代单一重阴影，符合暖奶油画布的零阴影偏好
- **scale(0.95) 按压缩放**：签名微交互，可直接迁移到所有 CTA 按钮
- **间距系统**：16px 基数步进与 rpx 系统兼容

### 2.2 需要改造的设计决策
- **四层绿色系统** → 改造为暖色系多层系统：珊瑚主色 `#cc785c` + 深色变体用于特征带 + 浅色变体用于标记
- **50px 全药丸按钮** → 改造为 48rpx 圆角（微信小程序中 50rpx 接近全药丸，但需适配不同按钮高度）
- **浮动 Frap 按钮** → 改造为微信小程序浮动操作按钮，固定定位需用 `position: fixed`，注意小程序安全区
- **场景化字体切换** → Georgia 已是当前标题字体，可直接用；手写体场景需评估是否适合学习工具
- **Gold 奖励色** → 可改造为学习成就/积分系统的专属色，如 `#cba258` 用于"已完成"状态

### 2.3 不可迁移的设计决策
- **SoDoSans 专有字体** → 小程序不支持自定义字体加载（除非用 `wx.loadFontFace`），当前 Georgia 方案更实际
- **渐变系统** → 原方案明确"无渐变"，但暖奶油画布也无渐变，这一点一致
- **礼品卡实拍照片** → 学习工具无需此组件
- **Rewards 三列状态面板** → 需重新设计为学习进度面板，但布局思路可参考
- **100vh 全视口 Hero** → 小程序无 viewport 概念，需用 `100vh` 或百分比替代

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Starbucks 角色 | 刷个冯题映射 | 色值 | 说明 |
|---|---|---|---|
| Starbucks Green (#006241) | 暖墨标题色 | `#141413` | 主标题，保持暖奶油画布规范 |
| Green Accent (#00754A) | 珊瑚 CTA | `#cc785c` | 主按钮、浮动按钮填充 |
| House Green (#1E3932) | 深色表面 | `#181715` | 特征带、深色卡片背景 |
| Gold (#cba258) | 学习成就色 | `#cba258` | "已完成"标记、积分展示 |
| Neutral Warm (#f2f0eb) | 暖奶油画布 | `#faf9f5` | 页面背景 |
| Ceramic (#edebe9) | 奶油卡片 | `#efe9de` | 卡片背景、区域分隔 |
| Text Black (0.87) | 暖墨文字 | `#141413` | 正文主色 |
| Text Black Soft (0.58) | 次要文字 | `#6c6a64` | 元数据、辅助信息 |
| Green Light (#d4e9e2) | 浅绿标记 | `#d4e9e2` | 正确答案标记、表单验证通过 |

### 3.2 字体映射（用 rpx）

| Starbucks 层级 | 刷个冯题映射 | 字号 | 粗细 | 行高 | 字间距 |
|---|---|---|---|---|---|
| Display (10) 80px | 页面大标题 | 64rpx | 400 | 1.2 | -3rpx |
| H1 24px/600 | 区域标题 | 40rpx | 600 | 1.3 | -2rpx |
| H2 24px/400 | 区域副标题 | 40rpx | 400 | 1.3 | -2rpx |
| Body Large 19px | 引导文案 | 32rpx | 400 | 1.6 | 0 |
| Body 16px | 正文 | 28rpx | 400 | 1.5 | 0 |
| Small 14px | 按钮标签、元数据 | 26rpx | 400-600 | 1.4 | 0 |
| Micro 13px | 辅助说明 | 24rpx | 400 | 1.4 | 0 |

### 3.3 组件设计规范

**主 CTA 按钮（珊瑚药丸）**
```css
.btn-primary {
  background-color: #cc785c;
  color: #faf9f5;
  border-radius: 48rpx;
  padding: 14rpx 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 0;
  transition: transform 0.2s ease;
}
.btn-primary:active {
  transform: scale(0.95);
}
```

**浮动操作按钮（类 Frap）**
```css
.fab {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx; /* 避开 tabBar */
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background-color: #cc785c;
  box-shadow: 0 0 12rpx rgba(0,0,0,0.24), 0 16rpx 24rpx rgba(0,0,0,0.14);
  z-index: 999;
}
.fab:active {
  transform: scale(0.95);
  box-shadow: 0 0 12rpx rgba(0,0,0,0.24);
}
```

**内容卡片**
```css
.card {
  background-color: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 0 2rpx rgba(0,0,0,0.14), 0 4rpx 4rpx rgba(0,0,0,0.24);
}
```

**深色特征带**
```css
.feature-band {
  background-color: #181715;
  padding: 64rpx 32rpx;
  color: #faf9f5;
}
.feature-band .subtitle {
  color: rgba(250, 249, 245, 0.70);
}
```

### 3.4 页面布局模板

**学习工具详情页（借鉴 Starbucks PDP）**
```
┌──────────────────────────┐
│ 深色特征带 (#181715)      │  ← 工具名称 + 简介
│ 面包屑导航               │
│ 大标题 (Georgia 48rpx)    │
│ 副标题 (rgba 白 0.7)     │
└──────────────────────────┘
┌──────────────────────────┐
│ 奶油卡片 (#efe9de)        │  ← 工具操作区
│ 输入区 + 选项区           │
│ 主 CTA 珊瑚药丸按钮       │
└──────────────────────────┘
┌──────────────────────────┐
│ 结果展示区                │  ← 深色表面或白色
│ 学习进度条（Gold 标记）    │
└──────────────────────────┘
```

### 3.5 WXSS 实现示例

```wxss
/* 星巴克风格的学习进度条 */
.progress-bar {
  display: flex;
  align-items: center;
  height: 16rpx;
  background-color: #efe9de;
  border-radius: 8rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background-color: #cba258; /* Gold = 已完成 */
  border-radius: 8rpx;
  transition: width 0.3s ease;
}
.progress-label {
  font-family: Georgia, serif;
  font-size: 24rpx;
  color: #6c6a64;
  margin-left: 16rpx;
}

/* 深色特征带中的双按钮组 */
.band-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}
.band-btn-primary {
  background-color: #faf9f5;
  color: #cc785c;
  border: 2rpx solid #faf9f5;
  border-radius: 48rpx;
  padding: 14rpx 40rpx;
  font-size: 28rpx;
  font-weight: 600;
}
.band-btn-secondary {
  background-color: transparent;
  color: #faf9f5;
  border: 2rpx solid #faf9f5;
  border-radius: 48rpx;
  padding: 14rpx 40rpx;
  font-size: 28rpx;
  font-weight: 400;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具详情页**：深色 Hero 带 + 奶油操作区的双层结构，信息层次清晰
- **学习成就/积分页**：Gold 色奖励系统与 Starbucks Rewards 同源，视觉语言天然匹配
- **首页特征带**：深色 `#181715` 特征带打断暖色节奏，突出重点工具推荐
- **浮动快捷入口**：Frap 风格浮动按钮适合"快速开始学习"等高频操作

### 4.2 不适合用在哪些页面
- **设置页/表单页**：过于装饰性，简洁表单不需要深色特征带
- **列表页（题库浏览）**：卡片阴影系统会让长列表显得沉重
- **纯文本内容页**：深色带 + 双按钮组在纯阅读场景过于打断节奏

### 4.3 混搭建议
- **Starbucks 深色带 + 暖奶油画布卡片**：特征带用 `#181715`，卡片区用 `#efe9de`，两者之间用 `#faf9f5` 呼吸
- **Starbucks 药丸按钮 + 当前卡片圆角**：按钮用 48rpx 全药丸，卡片保持 24rpx
- **Gold 奖励色 + 珊瑚 CTA**：Gold 仅用于"已完成/已掌握"状态标记，珊瑚用于行动号召

---

## 5. 实施检查清单

- [ ] 所有 CTA 按钮使用 `scale(0.95)` active 状态 + `0.2s ease` transition
- [ ] 浮动按钮使用分层阴影（base + ambient），active 时 ambient 消失
- [ ] 深色特征带文字主色 `#faf9f5`，次要色 `rgba(250,249,245,0.70)`
- [ ] 卡片阴影使用 2 层低 alpha 叠加，不用单一重阴影
- [ ] Gold 色 `#cba258` 仅用于学习成就/完成状态，不作为通用强调色
- [ ] 正文不使用纯黑，使用暖墨 `#141413`
- [ ] 标题使用 Georgia 衬线字体
- [ ] 按钮圆角 ≥ 48rpx（全药丸风格）
- [ ] 深色带与暖色区之间有 `#faf9f5` 呼吸空间
- [ ] 所有间距基于 16rpx 步进

---

## 6. 参考文件
- 原始设计分析：`.claude/skills/starbucks-design.md`
- 项目设计规范：`CLAUDE.md` § 设计风格约束
- 交接文档：`PROJECT_HANDOFF.md` §25 Claude Design 暖奶油画布
