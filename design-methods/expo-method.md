# Expo 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/expo-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Expo 的设计语言是一种"安静自信"的开发者工具美学。白色画布 + 天蓝渐变大气背景营造出干净、专业的技术品牌感。纯黑 CTA 搭配 Inter 无衬线字体，传递出编辑级的克制与精准——不张扬，但绝对自信。

### 1.2 视觉 DNA
- 纯白画布 + 天蓝渐变大气层（仅 Hero 区）
- 纯黑 CTA（#000000）——唯一的品牌行动色
- 蓝色文字链接（#0d74ce）——仅用于行内链接，绝不在 CTA 上
- Inter 无衬线字体——单一字体族承载全部层级
- JetBrains Mono 代码字体——所有代码表面
- 设备模型 Hero——MacBook + iPhone 合成图作为页面标识
- 柔和阴影 + 发丝边框——无大气品牌装饰
- 96px 节段节奏

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 主色 CTA | #000000 | 纯黑，仅用于主要 CTA |
| 主色 Active | #1a1a1a | 按压态 |
| 文字链接蓝 | #0d74ce | 行内链接专用 |
| 画布 | #ffffff | 纯白页面底色 |
| 卡片面 | #ffffff | 纯白卡片 |
| 强表面 | #f0f0f3 | 徽章、次级按钮 |
| 深色面 | #171717 | 深色特性卡、代码块 |
| 墨色文字 | #171717 | 标题、正文强调 |
| 正文灰 | #60646c | 默认正文 |
| 柔灰 | #999999 | 副标题 |
| 天蓝渐变 | #cfe7ff → #a8c8e8 | Hero 大气背景 |

### 1.4 字体策略
- 字体族：Inter（无衬线）
- Display weight：600（自信但不粗暴）
- Body weight：400
- 负 letter-spacing：Display -0.5px ~ -1.92px，Body 0
- 代码：JetBrains Mono 13px / 400
- 层级通过 size + weight 区分，不通过字体族切换

### 1.5 布局与组件模式
- 间距基准：4px，Token 4/8/12/16/20/24/32/48/96
- 段落间距：96px
- 圆角：CTA 8px、卡片 12px、徽章 pill 9999px
- 阴影：单一柔和投影 `0 4px 12px rgba(0,0,0,0.04)`
- 最大内容宽度：~1200px
- 网格：12 列，特性卡 2-up / 3-up

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

**1. 单一字体族策略**
Expo 用 Inter 一个字体承载所有层级，本项目用 Georgia 衬线做标题 + 系统无衬线做正文。Expo 的层级逻辑（size + weight 区分）可以直接借鉴，不需要额外字体族。

**2. 间距 Token 体系**
4px 基准的间距 Token（4/8/12/16/24/32/48/96）与本项目当前的 rpx 间距体系高度兼容，可直接映射为 8/16/24/32/48/64/96/192rpx。

**3. 圆角分层策略**
CTA 用较小圆角（8px → 16rpx），卡片用中等圆角（12px → 24rpx），徽章用 pill。这种"按钮锐利、卡片柔和"的分层与暖奶油画布的 24rpx 卡片圆角一致。

**4. 柔和阴影策略**
单一柔和投影层级（不用多层阴影）与暖奶油画布"零阴影，靠色块对比"的理念部分兼容——可在需要时引入一个极轻阴影层级。

**5. 行内链接与 CTA 的角色分离**
蓝色仅用于行内链接、不在 CTA 上的策略，可以借鉴到本项目：珊瑚色 CTA 保持唯一，其他交互色用于文字链接。

### 2.2 需要改造的设计决策

**1. 纯白画布 → 暖奶油画布**
- 原方案：纯白 #ffffff 画布
- 本项目：暖奶油 #faf9f5
- 改造：保留 Expo 的"干净克制"感，但画布色必须用 #faf9f5，不能用纯白。卡片用 #efe9de 而非纯白。

**2. 纯黑 CTA → 珊瑚色 CTA**
- 原方案：#000000 纯黑 CTA
- 本项目：#cc785c 珊瑚色 CTA
- 改造：保留 Expo 的 CTA 克制策略（单一主色、不滥用），但色值换成珊瑚色。

**3. Inter 无衬线 → Georgia 衬线标题**
- 原方案：Inter 600/400
- 本项目：Georgia 400 标题 + 系统无衬线正文
- 改造：保留 Expo 的负 letter-spacing 策略用于标题（-3rpx），正文用无衬线 400 weight。

**4. 天蓝渐变大气层 → 暖色调装饰**
- 原方案：#cfe7ff → #a8c8e8 天蓝渐变仅在 Hero 区
- 本项目：暖奶油体系不允许冷色调渐变
- 改造：如需大气层效果，用暖色调（如 #efe9de → #faf9f5 的浅暖渐变）替代。

**5. 设备模型 Hero → 学习场景 Hero**
- 原方案：MacBook + iPhone 合成图
- 本项目：微信小程序，无设备模型需求
- 改造：Hero 区用学习主题插图或图标组合替代设备模型。

### 2.3 不可迁移的设计决策

**1. JetBrains Mono 代码字体**
本项目不引入第三方字体库（技术栈约束），代码展示用系统等宽字体即可。

**2. 天蓝渐变品牌色**
#0d74ce 蓝色与暖奶油画布的暖色系冲突，不可引入。

**3. 12 列网格系统**
微信小程序没有 CSS Grid 的 12 列系统，需用 flex 布局替代。

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas 画布 | #ffffff | #faf9f5 | 暖奶油画布 |
| Surface Card 卡片 | #ffffff | #efe9de | 奶油卡片 |
| Surface Strong 强表面 | #f0f0f3 | #e8e2d6 | 用于徽章、次级元素 |
| Primary CTA | #000000 | #cc785c | 珊瑚色 CTA |
| Primary Active | #1a1a1a | #a9583e | 珊瑚色按压态 |
| Text Link | #0d74ce | #cc785c | 沿用珊瑚色做链接色 |
| Ink 文字 | #171717 | #141413 | 暖墨文字 |
| Body 正文 | #60646c | #6c6a64 | 暖灰正文 |
| Muted 柔灰 | #999999 | #9c9a94 | 更暖的柔灰 |
| Surface Dark 深色面 | #171717 | #181715 | 深海军蓝 |
| On Dark 深色面文字 | #ffffff | #faf9f5 | 暖白文字 |
| Hairline 发丝线 | #f0f0f3 | #e8e2d6 | 暖调发丝线 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 | 说明 |
|---|---|---|---|
| Display Mega | Inter 64px/600/-1.92px | Georgia 64rpx/400/-3rpx | 衬线标题 |
| Display XL | Inter 48px/600/-1.44px | Georgia 48rpx/400/-3rpx | 衬线标题 |
| Display LG | Inter 36px/600/-1.08px | Georgia 36rpx/400/-3rpx | 节段标题 |
| Title MD | Inter 18px/600/0 | Georgia 32rpx/400/-2rpx | 组件标题 |
| Body MD | Inter 16px/400/0 | 系统无衬线 28rpx/400/0 | 默认正文 |
| Body SM | Inter 14px/400/0 | 系统无衬线 24rpx/400/0 | 小正文 |
| Caption | Inter 13px/400/0 | 系统无衬线 22rpx/400/0 | 说明文字 |
| Button | Inter 14px/500/0 | 系统无衬线 28rpx/500/0 | 按钮标签 |
| Code | JetBrains Mono 13px/400 | 系统等宽 24rpx/400/0 | 代码块 |

### 3.3 组件设计规范

**卡片**
```css
background: #efe9de;
border-radius: 24rpx;
padding: 32rpx;
border: 1rpx solid #e8e2d6; /* 可选发丝线 */
```

**主按钮 CTA**
```css
background: #cc785c;
color: #faf9f5;
border-radius: 16rpx;
padding: 20rpx 36rpx;
height: 80rpx;
font-size: 28rpx;
font-weight: 500;
```
按压态：background: #a9583e;

**次级按钮**
```css
background: #efe9de;
color: #141413;
border-radius: 16rpx;
padding: 18rpx 34rpx;
height: 80rpx;
border: 1rpx solid #e8e2d6;
```

**文字链接**
```css
color: #cc785c;
font-size: 28rpx;
font-weight: 400;
text-decoration: none;
```

**标签徽章**
```css
background: #e8e2d6;
color: #141413;
border-radius: 9999rpx;
padding: 8rpx 20rpx;
font-size: 22rpx;
font-weight: 600;
```

**输入框**
```css
background: #faf9f5;
color: #141413;
border-radius: 16rpx;
padding: 24rpx 32rpx;
height: 88rpx;
border: 1rpx solid #e8e2d6;
```

### 3.4 页面布局模板

**Hero 区**
- 背景：#faf9f5（画布色）
- 标题：Georgia 64rpx / 400 / -3rpx / #141413
- 副标题：系统无衬线 28rpx / 400 / 0 / #6c6a64
- 间距：标题下方 24rpx，副标题下方 48rpx
- 单一珊瑚色 CTA 按钮

**功能卡片区**
- 网格：2 列（手机端 1 列）
- 卡片间距：24rpx
- 卡片背景：#efe9de，圆角 24rpx
- 段落间距：96rpx

**列表区**
- 列表项背景：#faf9f5
- 分割线：1rpx #e8e2d6
- 项间距：0（靠分割线分隔）

**底部操作区**
- 背景：#181715（深色面）
- 文字：#faf9f5
- 间距：64rpx 上下

### 3.5 WXSS 实现示例

**Hero 标题**
```css
.hero-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -3rpx;
  color: #141413;
}
```

**功能卡片**
```css
.feature-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 32rpx;
}

.feature-card__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 32rpx;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -2rpx;
  color: #141413;
  margin-bottom: 16rpx;
}

.feature-card__body {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.5;
  color: #6c6a64;
}
```

**CTA 按钮组**
```css
.btn-primary {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 16rpx;
  padding: 20rpx 36rpx;
  height: 80rpx;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:active {
  background: #a9583e;
}

.btn-secondary {
  background: #efe9de;
  color: #141413;
  border-radius: 16rpx;
  padding: 18rpx 34rpx;
  height: 80rpx;
  border: 1rpx solid #e8e2d6;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **工具详情页**：Expo 的"特性卡片区"布局非常适合展示单个工具的功能点
- **设置页**：Expo 的表单组件（输入框、标签）风格干净，适合设置界面
- **关于页**：Expo 的编辑式排版适合文字密集的介绍页面

### 4.2 不适合用在哪些页面
- **首页**：暖奶油画布的暖色调与 Expo 的冷白 + 天蓝渐变不匹配，首页应坚持暖奶油风格
- **学习进度页**：需要更多情感化设计，Expo 的冷静技术风不适合

### 4.3 混搭建议
- 卡片样式（#efe9de 背景 + 24rpx 圆角）可直接融入暖奶油画布
- 按钮的圆角策略（CTA 16rpx、卡片 24rpx）与现有风格兼容
- 间距 Token 可统一为 8rpx 倍数的 rpx 体系
- 保留暖奶油画布的零阴影策略，不引入 Expo 的柔和投影

---

## 5. 实施检查清单

- [ ] 所有颜色值使用暖奶油画布色值，不引入 Expo 原始色值
- [ ] CTA 使用珊瑚色 #cc785c，不使用纯黑
- [ ] 标题使用 Georgia 衬线，不使用 Inter
- [ ] 间距使用 rpx 单位，基于 8rpx 倍数
- [ ] 卡片圆角 24rpx，CTA 圆角 16rpx
- [ ] 不引入 JetBrains Mono，代码用系统等宽字体
- [ ] 不引入天蓝渐变，如需渐变用暖色调
- [ ] 所有组件使用暖墨 #141413 和暖灰 #6c6a64 文字色
- [ ] 深色面使用 #181715，文字用 #faf9f5

---

## 6. 参考文件

- 原方案：.claude/skills/expo-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
