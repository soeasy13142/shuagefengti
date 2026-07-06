# Framer 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/framer-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Framer 的设计语言是"黑色画布上的海报级排版"——近纯黑底色承载超大白色展示字体，letter-spacing 拉到极端负值（110px 时 -5.5px）。页面节奏靠"渐变聚光灯卡片"打破——洋红、紫罗兰、橙色的渐变大气卡片嵌入单色网格中，像暗房里的发光海报。品牌 IS 暗色，没有亮色模式。

### 1.2 视觉 DNA
- 近纯黑画布（#090909）——品牌身份就是暗色
- 超大负 letter-spacing——110px 时 -5.5px（5% 字号）
- 白色 pill CTA——唯一的主按钮形状
- 渐变聚光灯卡片——magenta、violet、orange、coral 嵌入暗色网格
- GT Walsheim Medium 展示字体 + Inter Variable 正文
- 表面梯度：canvas → surface-1 → surface-2 表达层级
- 单一蓝色强调 #0099ff——仅用于链接、焦点、选择态
- Body line-height 1.30——比典型 SaaS 更紧凑

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 主色 | #ffffff | 纯白，所有主 CTA |
| 蓝色强调 | #0099ff | 仅链接、焦点、选择态 |
| 画布 | #090909 | 近纯黑页面底色 |
| 表面 1 | #141414 | 卡片、次级按钮 |
| 表面 2 | #1c1c1c | 特色卡片、选中态 |
| 发丝线 | #262626 | 分割线 |
| 墨色文字 | #ffffff | 纯白文字 |
| 柔灰文字 | #999999 | 次要信息 |
| 渐变洋红 | #d44df0 | 聚光灯卡片 |
| 渐变紫罗兰 | #6a4cf5 | 聚光灯卡片 |
| 渐变橙色 | #ff7a3d | 聚光灯卡片 |
| 渐变珊瑚 | #ff5577 | 聚光灯卡片 |

### 1.4 字体策略
- 展示字体：GT Walsheim Medium（专有），替代：Mona Sans / Geist / Inter 600-700
- 正文字体：Inter Variable + OpenType 字符变体
- Display weight：500
- Body weight：400
- Body-sm / Caption weight：500
- 负 letter-spacing：110px 时 -5.5px，85px 时 -4.25px，62px 时 -3.1px
- Body line-height：1.30（紧凑）
- Body letter-spacing：-0.15px（15px 时）

### 1.5 布局与组件模式
- 间距基准：5px（非标准！），Token 4/8/12/15/20/30/40/96
- 段落间距：96px
- 圆角：CTA pill 100px、卡片 15-20px、大气卡片 30px
- 阴影：多层——1px 微投影 + 半透明蓝环 + 深色投影
- 最大内容宽度：~1199px
- 网格：2-up 桌面，1-up 移动

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

**1. 渐变聚光灯卡片概念**
Framer 的渐变大气卡片嵌入单色网格的理念可以用在本项目——在暖奶油网格中嵌入暖色调渐变卡片作为"学习亮点"展示。不需要暗色画布也能借鉴这个概念。

**2. 紧凑 line-height**
Framer 的 body 1.30 line-height 比典型 SaaS 更紧凑，适合信息密集的学习工具。本项目可以借鉴：正文 line-height 1.4-1.5（比 Framer 稍松，但比典型 1.8 紧凑）。

**3. 表面梯度表达层级**
canvas → surface-1 → surface-2 的层级表达可以用在暖色调中：#faf9f5 → #efe9de → #e8e2d6。

**4. 单一蓝色强调**
"单一 chromatic accent 仅用于链接/焦点/选择态"的策略可以借鉴：珊瑚色仅用于 CTA 和关键链接，不用作装饰。

### 2.2 需要改造的设计决策

**1. 近纯黑画布 → 暖奶油画布**
- 原方案：#090909 近纯黑
- 本项目：#faf9f5 暖奶油
- 改造：完全反转。但可以借鉴"画布即留白"的理念——暖奶油画布本身就是留白。

**2. 超大负 letter-spacing → 适度负 tracking**
- 原方案：110px 时 -5.5px（5% 字号）
- 本项目：64rpx 时 -3rpx（约 4.7% 字号）
- 改造：保留"tracking 随尺寸缩放"的理念，但幅度适配 rpx 单位。

**3. 白色 pill CTA → 珊瑚色 pill CTA**
- 原方案：#ffffff 白色 pill
- 本项目：#cc785c 珊瑚色 pill
- 改造：保留 pill 形状，颜色换为珊瑚色。

**4. 暗色渐变聚光灯 → 暖色渐变卡片**
- 原方案：magenta、violet、orange 暗色渐变
- 本项目：暖色调渐变卡片
- 改造：用暖奶油渐变（如 #efe9de → #e8d4c8）替代冷调渐变。

### 2.3 不可迁移的设计决策

**1. GT Walsheim Medium 专有字体**
不可引入，使用 Georgia + 系统字体替代。

**2. Inter Variable OpenType 字符变体**
微信小程序不支持 OpenType 字符变体（cv01/cv05/cv09/cv11/ss03/ss07/dlig）。

**3. 纯暗色模式**
暖奶油画布以浅色为主，不可切换为暗色模式。

**4. 5px 非标准间距基准**
本项目使用 8rpx 倍数的间距体系，不引入 5px 基准。

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas 画布 | #090909 | #faf9f5 | 暖奶油（反向映射） |
| Surface 1 | #141414 | #efe9de | 奶油卡片 |
| Surface 2 | #1c1c1c | #e8e2d6 | 提升卡片 |
| Primary CTA | #ffffff | #cc785c | 珊瑚色 CTA |
| Accent Blue | #0099ff | #cc785c | 用珊瑚色替代蓝色强调 |
| Ink 文字 | #ffffff | #141413 | 暖墨（反向映射） |
| Ink Muted | #999999 | #6c6a64 | 暖灰正文 |
| Hairline | #262626 | #e8e2d6 | 暖调发丝线 |
| Gradient Violet | #6a4cf5 | #d4c4b8 | 暖调紫罗兰（替代） |
| Gradient Magenta | #d44df0 | #e8d4c8 | 暖调洋红（替代） |
| Gradient Orange | #ff7a3d | #e8dfc4 | 暖调橙色（替代） |
| Gradient Coral | #ff5577 | #e8c8b8 | 暖调珊瑚（替代） |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 | 说明 |
|---|---|---|---|
| Display XXL | GT Walsheim 110px/500/-5.5px | Georgia 64rpx/400/-3rpx | 衬线标题 |
| Display XL | GT Walsheim 85px/500/-4.25px | Georgia 48rpx/400/-3rpx | 节段标题 |
| Display LG | GT Walsheim 62px/500/-3.1px | Georgia 40rpx/400/-3rpx | 子节段标题 |
| Display MD | GT Walsheim 32px/500/-1.0px | Georgia 32rpx/400/-2rpx | 卡片标题 |
| Headline | Inter 22px/700/-0.8px | 系统无衬线 32rpx/600/0 | 定价标题 |
| Subhead | Inter 24px/400/-0.01px | 系统无衬线 32rpx/400/0 | 引导正文 |
| Body | Inter 15px/400/-0.15px | 系统无衬线 28rpx/400/0 | 默认正文 |
| Body SM | Inter 14px/500/-0.14px | 系统无衬线 24rpx/500/0 | 密集数据 |
| Caption | Inter 13px/500/-0.13px | 系统无衬线 22rpx/500/0 | 元数据 |
| Button | Inter 14px/500/-0.14px | 系统无衬线 28rpx/500/0 | 按钮标签 |

### 3.3 组件设计规范

**暖色渐变卡片（聚光灯卡片）**
```css
.spotlight-card {
  border-radius: 48rpx; /* 大气圆角 */
  padding: 64rpx;
}

.spotlight-card--warm-rose {
  background: linear-gradient(135deg, #efe9de, #e8d4c8);
}

.spotlight-card--warm-sand {
  background: linear-gradient(135deg, #efe9de, #e8dfc4);
}

.spotlight-card--warm-mauve {
  background: linear-gradient(135deg, #efe9de, #d4c4b8);
}
```

**主按钮（pill）**
```css
.btn-pill {
  background: #cc785c;
  color: #faf9f5;
  border-radius: 9999rpx;
  padding: 20rpx 30rpx;
  height: 80rpx;
  font-size: 28rpx;
  font-weight: 500;
}
```

**次级按钮（charcoal pill 替代为奶油 pill）**
```css
.btn-pill-secondary {
  background: #efe9de;
  color: #141413;
  border-radius: 9999rpx;
  padding: 20rpx 30rpx;
  height: 80rpx;
  font-size: 28rpx;
  font-weight: 500;
}
```

**内容卡片**
```css
.content-card {
  background: #efe9de;
  border-radius: 32rpx;
  padding: 48rpx;
}
```

### 3.4 页面布局模板

**首页节奏（借鉴 Framer 的"暗房海报"理念，转为暖色调）**
```
暖奶油 Hero 区
  标题：Georgia 64rpx / 400 / -3rpx
  大量留白——标题像海报一样悬浮
  ↓
功能卡片网格（2 列）
  大部分是奶油卡片 #efe9de
  嵌入 1-2 个暖色渐变聚光灯卡片
  ↓
学习模块区
  奶油卡片网格
  ↓
底部操作区
```

**渐变卡片使用规则**
- 每页最多 2 个渐变聚光灯卡片
- 渐变卡片用于"推荐学习"或"热门模块"等高亮区域
- 渐变方向：135deg（左上到右下）

### 3.5 WXSS 实现示例

**海报级 Hero**
```css
.poster-hero {
  background: #faf9f5;
  padding: 192rpx 48rpx;
  text-align: center;
}

.poster-hero__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -3rpx;
  color: #141413;
  margin-bottom: 32rpx;
}

.poster-hero__subtitle {
  font-size: 32rpx;
  font-weight: 400;
  line-height: 1.3;
  color: #6c6a64;
  margin-bottom: 48rpx;
}
```

**暖色渐变聚光灯卡片**
```css
.spotlight-card {
  border-radius: 48rpx;
  padding: 64rpx;
  position: relative;
  overflow: hidden;
}

.spotlight-card--rose {
  background: linear-gradient(135deg, #efe9de 0%, #e8d4c8 100%);
}

.spotlight-card--sand {
  background: linear-gradient(135deg, #efe9de 0%, #e8dfc4 100%);
}

.spotlight-card__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 40rpx;
  font-weight: 400;
  line-height: 1.13;
  letter-spacing: -2rpx;
  color: #141413;
  margin-bottom: 24rpx;
}

.spotlight-card__body {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.4;
  color: #6c6a64;
}
```

**紧凑正文**
```css
.body-compact {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.4; /* 比典型 1.5 更紧凑 */
  color: #141413;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页 Hero**：Framer 的海报级排版理念适合首页的视觉冲击
- **推荐学习模块**：渐变聚光灯卡片适合高亮推荐内容
- **工具展示页**：卡片网格 + 1-2 个渐变卡片的布局

### 4.2 不适合用在哪些页面
- **做题页**：需要专注，渐变卡片会分散注意力
- **设置页**：过于装饰性
- **学习统计页**：需要数据密度，海报级留白不适合

### 4.3 混搭建议
- 渐变聚光灯卡片每页最多 2 个，不要过度使用
- 渐变色用暖色调（#efe9de → #e8d4c8 等），不用 Framer 原始冷调
- 保留暖奶油画布的 24rpx 卡片圆角，渐变卡片可用 48rpx 大气圆角作为例外
- 紧凑 line-height（1.4）可用于信息密集区域，宽松 line-height（1.5）用于阅读区

---

## 5. 实施检查清单

- [ ] 画布色使用 #faf9f5，不使用 #090909
- [ ] CTA 使用珊瑚色 pill，不使用白色 pill
- [ ] 渐变卡片使用暖色调，不使用 magenta/violet/orange
- [ ] 渐变卡片每页最多 2 个
- [ ] 不引入 GT Walsheim Medium
- [ ] 不使用 5px 间距基准，使用 8rpx 倍数
- [ ] 标题 letter-spacing 使用 -3rpx（64rpx 时），不使用 -5.5px
- [ ] 正文 line-height 使用 1.4-1.5，不使用 1.30
- [ ] 不引入 OpenType 字符变体

---

## 6. 参考文件

- 原方案：.claude/skills/framer-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
