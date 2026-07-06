# Ferrari 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/ferrari-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Ferrari 的设计语言是"电影级编辑美学"——接近奢侈杂志跨页而非传统汽车 OEM 网站。近黑画布承载纯白展示字体，Rosso Corsa 赛车红作为唯一的品牌电压色，克制地用于 CTA、品牌标识和 F1 赛事亮点。排版自信但不粗暴（Display 500 weight），间距遵循显式 8px Token 梯度。

### 1.2 视觉 DNA
- 近黑画布（#181818）——永不纯黑，带微暖
- Rosso Corsa 赛车红（#da291c）——唯一的品牌色，极度克制
- 纯白展示字体——Display 500 weight，不加粗
- CTA 标签全大写 + 1.4px tracking——奢侈精准感
- 0px 锐利圆角——所有 CTA、卡片、段落
- 全出血电影级 Hero 摄影——照片即深度
- 8px 显式间距 Token 梯度（xxxs 4px → super 128px）
- 发丝线 + 摄影深度——无投影层级

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 品牌主色 | #da291c | Rosso Corsa 赛车红 |
| 主色 Active | #b01e0a | 按压态 |
| 墨色文字（深色面） | #ffffff | 深色面上的白色文字 |
| 正文灰（深色面） | #969696 | 深色面上的正文 |
| 画布 | #181818 | 近黑页面底色 |
| 画布提升 | #303030 | 卡片、面板 |
| 浅色画布 | #ffffff | 编辑白段（二手车、定价） |
| 发丝线 | #303030 | 深色面上的分割线 |
| 语义信息 | #4c98b9 | 信息徽章 |
| 语义成功 | #03904a | 确认状态 |

### 1.4 字体策略
- 字体族：FerrariSans（专有），替代：Inter 500 / Söhne
- Display weight：500——永不粗体，摄影做视觉重活
- Body weight：400
- CTA 标签：全大写 + 1.4px tracking
- Nav 标签：全大写 + 0.65px tracking
- 负 letter-spacing：仅 Display 层级 -0.36px ~ -1.6px

### 1.5 布局与组件模式
- 间距基准：4px，Token 4/8/16/24/32/48/64/96/128
- 段落间距：96px（主段），128px（Hero 深度）
- 圆角：全部 0px 锐利——品牌签名
- 阴影：无投影，靠摄影 + 亮度梯度表达深度
- 最大内容宽度：~1280px
- 网格：12 列，特性卡 2/3/4-up

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

**1. 克制的品牌色策略**
Ferrari 将 Rosso Corsa 限制在 CTA、品牌标识和赛事亮点——极度克制。本项目可借鉴：珊瑚色 #cc785c 仅用于 CTA、重要链接和关键状态指示。

**2. Display 500 weight 不加粗的哲学**
Ferrari 的 Display 500 weight 策略（让摄影做视觉重活）可以转化为本项目的理念：让内容本身（学习工具卡片、题目预览）做视觉重活，标题用 400 weight Georgia 即可。

**3. 显式间距 Token 梯度**
8px 基准的命名间距梯度（4/8/16/24/32/48/64/96/128）可直接映射为 rpx（8/16/32/48/64/96/128/192/256rpx）。

**4. 全大写 CTA 标签**
Ferrari 的 CTA 全大写 + tracking 策略可以用于本项目的关键 CTA（如"开始刷题"），增加仪式感。

### 2.2 需要改造的设计决策

**1. 近黑画布 → 暖奶油画布**
- 原方案：#181818 近黑画布
- 本项目：#faf9f5 暖奶油画布
- 改造：Ferrari 的深色美学与暖奶油画布完全相反。但可以借鉴其"画布永不纯黑/纯白"的理念——#faf9f5 正是"永不纯白"的暖奶油。

**2. 0px 锐利圆角 → 24rpx 柔和圆角**
- 原方案：全部 0px 锐利圆角
- 本项目：卡片 24rpx，CTA 16rpx
- 改造：Ferrari 的锐利圆角是汽车奢侈品牌的精准感，但暖奶油画布需要柔和圆角来表达亲和力。保留"CTA 比卡片更锐利"的分层逻辑。

**3. 全出血电影摄影 → 学习场景插图**
- 原方案：全出血汽车摄影作为 Hero
- 本项目：学习主题插图或图标组合
- 改造：保留"Hero 区占据大量视觉空间"的理念，但内容换成学习相关元素。

**4. 深色为主 → 浅色为主**
- 原方案：深色画布 + 浅色编辑段交替
- 本项目：浅色画布为主，深色仅用于底部操作区
- 改造：可借鉴 Ferrari 的"深色段落节奏"，在页面底部或特定功能区使用 #181715 深色面。

### 2.3 不可迁移的设计决策

**1. 全大写 Nav 标签**
微信小程序的导航由系统控制，无法自定义 Nav 标签样式。

**2. FerrariSans 专有字体**
不可引入专有字体，Georgia 衬线已是本项目的标题字体选择。

**3. 纯深色画布模式**
暖奶油画布以浅色为主，不可切换为深色画布模式。

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas 画布 | #181818 | #faf9f5 | 暖奶油（反向映射） |
| Canvas Elevated 提升面 | #303030 | #efe9de | 奶油卡片 |
| Canvas Light 浅色段 | #ffffff | #faf9f5 | 暖奶油 |
| Rosso Corsa 品牌色 | #da291c | #cc785c | 珊瑚色 |
| Rosso Corsa Active | #b01e0a | #a9583e | 珊瑚色按压态 |
| Ink 文字（深色面） | #ffffff | #141413 | 暖墨（反向映射） |
| Body 正文（深色面） | #969696 | #6c6a64 | 暖灰正文 |
| Body On Light | #181818 | #141413 | 暖墨文字 |
| Hairline 发丝线 | #303030 | #e8e2d6 | 暖调发丝线 |
| Inverse Canvas 深色面 | #181818 | #181715 | 深海军蓝 |
| On Dark 深色面文字 | #ffffff | #faf9f5 | 暖白 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 | 说明 |
|---|---|---|---|
| Display Mega | FerrariSans 80px/500/-1.6px | Georgia 64rpx/400/-3rpx | 衬线标题 |
| Display XL | FerrariSans 56px/500/-1.12px | Georgia 48rpx/400/-3rpx | 衬线标题 |
| Display LG | FerrariSans 36px/500/-0.36px | Georgia 36rpx/400/-3rpx | 节段标题 |
| Title MD | FerrariSans 18px/700/0 | Georgia 32rpx/400/-2rpx | 组件标题 |
| Body MD | FerrariSans 14px/400/0 | 系统无衬线 28rpx/400/0 | 默认正文 |
| Button | FerrariSans 14px/700/1.4px 大写 | 系统无衬线 28rpx/600/2rpx | 按钮标签（可选大写） |
| Caption Upper | FerrariSans 11px/600/1.1px 大写 | 系统无衬线 22rpx/600/2rpx | 分类标签 |
| Number Display | FerrariSans 80px/700/-1.6px | Georgia 64rpx/700/-3rpx | 数据展示 |

### 3.3 组件设计规范

**卡片**
```css
background: #efe9de;
border-radius: 24rpx; /* 暖奶油柔和圆角，非 Ferrari 的 0px */
padding: 48rpx;
```

**主按钮 CTA（可选大写模式）**
```css
background: #cc785c;
color: #faf9f5;
border-radius: 16rpx;
padding: 28rpx 64rpx;
height: 96rpx;
font-size: 28rpx;
font-weight: 600;
letter-spacing: 2rpx;
text-transform: uppercase; /* 可选，增加仪式感 */
```
按压态：background: #a9583e;

**深色面 CTA**
```css
background: #cc785c;
color: #faf9f5;
border-radius: 16rpx;
padding: 28rpx 64rpx;
height: 96rpx;
```

**深色段落**
```css
background: #181715;
color: #faf9f5;
padding: 192rpx 48rpx;
```

**数据展示卡**
```css
.data-card__value {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -3rpx;
  color: #cc785c; /* 品牌色高亮数据 */
}

.data-card__label {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-transform: uppercase;
  color: #6c6a64;
}
```

### 3.4 页面布局模板

**Hero 区（借鉴 Ferrari 的大面积留白）**
- 背景：#faf9f5
- 标题：Georgia 64rpx / 400 / -3rpx / #141413
- 副标题：系统无衬线 28rpx / 400 / 0 / #6c6a64
- Hero 高度：至少 60vh 的视觉空间
- 单一珊瑚色 CTA
- 大量留白——让内容本身做视觉重活

**数据展示区（借鉴 Ferrari 的 spec-cell）**
- 数据值：Georgia 64rpx / 700 / -3rpx / #cc785c
- 数据标签：系统无衬线 22rpx / 600 / 大写 / #6c6a64
- 排列：3 列网格

**深色段落区（借鉴 Ferrari 的 livery-band）**
- 背景：#181715
- 文字：#faf9f5
- 间距：192rpx 上下
- 用于"成就展示"或"学习统计"等强调段落

### 3.5 WXSS 实现示例

**大面积 Hero**
```css
.hero {
  background: #faf9f5;
  padding: 192rpx 48rpx;
  min-height: 600rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -3rpx;
  color: #141413;
  margin-bottom: 24rpx;
}

.hero__subtitle {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.5;
  color: #6c6a64;
  margin-bottom: 48rpx;
}
```

**数据展示网格**
```css
.stats-grid {
  display: flex;
  gap: 32rpx;
  padding: 96rpx 48rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -3rpx;
  color: #cc785c;
}

.stat-label {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-transform: uppercase;
  color: #6c6a64;
  margin-top: 12rpx;
}
```

**深色段落**
```css
.dark-section {
  background: #181715;
  padding: 192rpx 48rpx;
}

.dark-section__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 48rpx;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -3rpx;
  color: #faf9f5;
  margin-bottom: 24rpx;
}

.dark-section__body {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.5;
  color: #9c9a94;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **学习成就/统计页**：Ferrari 的数据展示风格（大数字 + 标签）非常适合展示学习数据
- **深色主题功能区**：Ferrari 的深色段落节奏可用于页面底部的强调区域
- **工具详情 Hero**：大面积留白 + 克制排版适合工具介绍页

### 4.2 不适合用在哪些页面
- **首页**：暖奶油画布的暖色调与 Ferrari 的深色电影美学冲突
- **设置页**：过于极简，设置页需要更多交互元素
- **题库浏览页**：需要密集信息展示，Ferrari 的大面积留白不适合

### 4.3 混搭建议
- 深色段落（#181715）可用于页面底部的"学习成就"展示区
- 数据展示风格（大数字 Georgia + 大写标签）可融入任何页面
- 全大写 CTA 标签可仅用于首页主 CTA，其他页面用普通大小写
- 保留暖奶油画布的柔和圆角，不引入 Ferrari 的 0px 锐利角

---

## 5. 实施检查清单

- [ ] 画布色使用 #faf9f5，不使用 #181818
- [ ] 品牌色使用 #cc785c，不使用 #da291c
- [ ] 圆角使用 24rpx（卡片）/ 16rpx（CTA），不使用 0px
- [ ] 深色面仅用于页面底部强调区，不作为主画布
- [ ] 标题使用 Georgia 400 weight，不使用 500/700
- [ ] 数据展示可使用 Georgia 700 weight（例外情况）
- [ ] 全大写 CTA 标签仅用于首页主 CTA
- [ ] 大面积留白策略可用于 Hero 区
- [ ] 间距使用 rpx 单位，基于 8rpx 倍数

---

## 6. 参考文件

- 原方案：.claude/skills/ferrari-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
