# Lamborghini 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/lamborghini-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Lamborghini 的设计是"黑暗大教堂"——纯黑画布上，白色文字和金色（`#FFC000`）如聚光灯下的展品般浮现。设计语言极度戏剧化、独裁式、不妥协：全大写标题、零圆角、120px 显示字号、全视口视频英雄区。每一个像素都在喊"力量"。

### 1.2 视觉 DNA
- 纯黑 `#000000` 主导画布，白色和金色是唯一救赎色
- Lamborghini Gold `#FFC000` 作为唯一暖色，专用于主 CTA
- 零圆角——所有按钮、卡片、容器都是锐利矩形
- 全大写标题，120px 极端字号，0.92 行高
- LamboType 定制 Neo-Grotesk 字体，12 度斜切终端
- 六边形 UI 元素（暂停按钮、图标系统）
- Bootstrap 网格 + 68 个 Element Plus 组件
- 幽灵按钮：白色描边 50% 透明度

### 1.3 色彩策略

| 角色 | 色值 | 用途 |
|------|------|------|
| 金色 CTA | `#FFC000` | 唯一主 CTA 按钮色 |
| 金色深 | `#917300` | 按钮 hover/pressed |
| 金色文字 | `#FFCE3E` | 内联文字强调 |
| 纯白 | `#FFFFFF` | 主文字、logo、导航 |
| 烟灰 | `#F5F5F5` | 次要文字 |
| 纯黑 | `#000000` | 主画布 |
| 炭灰 | `#202020` | 卡片、面板 |
| 深铁 | `#181818` | 页脚、深层区域 |
| 石墨 | `#494949` | 浅色表面文字 |
| 灰烬 | `#7D7D7D` | 时间戳、元数据 |
| 钢灰 | `#969696` | 禁用文字 |
| 青色脉冲 | `#29ABE2` | 信息强调 |
| 链接蓝 | `#3860BE` | 链接 hover |

### 1.4 字体策略

| 角色 | 字号 | 字重 | 行高 | 字间距 | 说明 |
|------|------|------|------|--------|------|
| Hero | 120px | 400 | 0.92 | normal | 全大写，最大冲击力 |
| Display 2 | 80px | 400 | 1.13 | normal | 全大写 |
| 区块标题 | 54px | 400 | 1.19 | normal | 全大写 |
| 子区块 | 40px | 400 | 1.15 | normal | 全大写 |
| 功能标题 | 27px | 400 | 1.37 | normal | 全大写 |
| 卡片标题 | 24px | 400 | — | normal | |
| 正文大 | 18px | 400 | 1.56 | normal | |
| 正文 | 16px | 400/700 | 1.50 | normal/0.16px | |
| 按钮大 | 16px | 400 | 1.50 | normal | 金色 CTA |
| 按钮标准 | 14.4px | 300/700 | 1.00 | 0.14-0.2px | 全大写幽灵按钮 |
| 标签 | 12px | 400/500 | 1.83 | 0.96px | 全大写 |
| 微型 | 10px | 400 | 1.00-2.00 | 0.225px | 全大写 |

### 1.5 布局与组件模式

- Bootstrap 网格，最大宽度 1440px
- 间距基准：8px，完整刻度：2/4/5/8/10/12/15/16/20/24/32/40/48/56
- 圆角：0px 默认，2px 徽章，20px 开关（唯一圆角元素）
- 深度通过表面颜色层叠实现：`#000000` → `#181818` → `#202020` → `#494949`
- 无阴影——在黑色画布上阴影不可见
- 金色 CTA：0px 圆角，24px padding
- 幽灵按钮：白色描边 50% 透明度，16px padding

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

**金色作为学习激励色**
Lamborghini Gold 的"奖励感"可以迁移到本项目的学习激励系统——比如"连续打卡"、"完成目标"时使用金色强调。

**极端字号对比**
120px → 10px 的 12:1 字号比例创造的戏剧性层级，可以缩小比例后用于首页 Hero 区（如 60rpx → 22rpx）。

**表面颜色层叠的深度模型**
不用阴影、通过微妙的明度差异表达层次——这与暖奶油画布的"零阴影"理念高度一致。

**全大写标签**
12px 全大写 + 正字距的标签系统适合"模块分类"、"难度等级"等元信息展示。

### 2.2 需要改造的设计决策

**黑暗画布 → 暖奶油画布**
- 原方案：纯黑 `#000000` 画布
- 本项目：暖奶油 `#faf9f5` 画布
- 改造方式：保留"表面层叠"的深度哲学，但方向反转——从深到浅变为从暖奶油到奶油白。`#faf9f5`（画布）→ `#efe9de`（卡片）→ `#ffffff`（高亮区）

**零圆角 → 适度圆角**
- 原方案：0px 圆角（锐利矩形）
- 本项目：24rpx 卡片圆角
- 改造方式：Lamborghini 的锐利美学与本项目的温暖感冲突。建议保留"按钮比卡片更方正"的思路：按钮 12rpx，卡片 24rpx

**LamboType → Georgia + system-ui**
- 原方案：定制 Neo-Grotesk
- 本项目：Georgia 衬线 + 系统字体
- 改造方式：Georgia 的衬线特性与 LamboType 的锐利无衬线完全不同。不能做全大写标题（Georgia 全大写会显得笨重），改为正常大小写 + 负字距

**金色 CTA → 珊瑚色 CTA**
- 原方案：Lamborghini Gold `#FFC000`
- 本项目：珊瑚色 `#cc785c`
- 改造方式：金色的"奢华奖励感"可以保留为特殊强调色（成就系统），日常 CTA 仍用珊瑚色

### 2.3 不可迁移的设计决策

**纯黑画布**
与暖奶油画布 `#faf9f5` 完全对立。纯黑背景在学习工具中会造成视觉疲劳，不适合长时间阅读场景。

**全大写标题**
微信小程序中 Georgia 全大写不美观，且中文环境下全大写无意义。

**六边形 UI 元素**
Lamborghini 的六边形暂停按钮等品牌几何元素无法迁移，与本项目无关。

**Bootstrap 网格**
微信小程序不使用 Bootstrap，使用 rpx 自适应布局。

**120px 极端字号**
在 375px 宽的手机屏幕上不现实。最大可用字号约 60rpx。

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|-----------|--------|---------------|------|
| 金色 CTA | `#FFC000` | `#cc785c`（日常）/ `#d4a853`（成就） | 珊瑚色日常 CTA，金色仅用于成就激励 |
| 金色深 | `#917300` | `#a9583e` / `#b8923a` | Active 状态 |
| 纯白文字 | `#FFFFFF` | `#141413` | 暖墨文字（反转：白底黑字） |
| 纯黑画布 | `#000000` | `#faf9f5` | 暖奶油画布 |
| 炭灰表面 | `#202020` | `#efe9de` | 奶油卡片 |
| 深铁 | `#181818` | `#e5dfd4` | 深层卡片 |
| 石墨文字 | `#494949` | `#6c6a64` | 暖灰次要文字 |
| 灰烬 | `#7D7D7D` | `#9a9890` | 更暖的灰 |
| 青色脉冲 | `#29ABE2` | `#4a90d9` | 信息色（稍暖化） |

### 3.2 字体映射

| 角色 | Lamborghini 原值 | 本项目实现 | 说明 |
|------|-----------------|-----------|------|
| Hero | 120px/400/0.92 全大写 | 60rpx/400/1.0/-3rpx | 不做全大写，用紧行高 |
| 区块标题 | 54px/400/1.19 | 40rpx/400/1.15/-2rpx | |
| 子标题 | 40px/400/1.15 | 32rpx/400/1.20/-1rpx | |
| 功能标题 | 27px/400 | 28rpx/400/1.25 | |
| 正文 | 16px/400/1.50 | 28rpx/400/1.6 | |
| 标签 | 12px/700/0.96px 全大写 | 22rpx/700/1.0/1rpx | 可做全大写英文标签 |
| 微型 | 10px/400 | 20rpx/400/1.0 | |

### 3.3 组件设计规范

**金色成就按钮（特殊场景）**
```css
.btn-lambo-achievement {
  background-color: #d4a853;
  color: #141413;
  border: none;
  border-radius: 0;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}
```

**幽灵按钮**
```css
.btn-lambo-ghost {
  background: transparent;
  color: #141413;
  border: 2rpx solid rgba(20,20,19,0.5);
  border-radius: 0;
  padding: 16rpx 32rpx;
  font-size: 24rpx;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}
```

**表面层叠卡片**
```css
.card-lambo-elevated {
  background-color: #efe9de;
  border-radius: 0;
  padding: 32rpx;
  /* 无阴影，靠色差表达层次 */
}
```

**全大写标签**
```css
.label-lambo {
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  line-height: 1.0;
  color: #6c6a64;
}
```

### 3.4 页面布局模板

**成就展示区**
- 使用 Lamborghini 的戏剧性字号对比：成就标题 48rpx，描述 22rpx
- 金色强调色 `#d4a853` 用于成就图标和边框
- 表面层叠：`#faf9f5` → `#efe9de` → `#e5dfd4`

**学习统计页**
- Lamborghini 的信息密度可以借鉴：紧凑的标签 + 数据排列
- 全大写英文标签（COMPLETED / ACCURACY / STREAK）
- 表面色差代替阴影表达层级

**模块选择页**
- 每个模块用不同明度的奶油色表达优先级
- 零圆角卡片（特殊页面可以突破 24rpx 常规）
- 大字号模块名 + 小字号描述的极端对比

### 3.5 WXSS 实现示例

**Lamborghini 风格成就卡片**
```css
.card-lambo-achievement {
  background-color: #efe9de;
  border-radius: 0;
  padding: 48rpx 32rpx;
  position: relative;
}

.card-lambo-achievement::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6rpx;
  background-color: #d4a853;
}

.card-lambo-achievement .title {
  font-family: Georgia, serif;
  font-size: 40rpx;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -2rpx;
  color: #141413;
}

.card-lambo-achievement .label {
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: #6c6a64;
  margin-bottom: 8rpx;
}
```

**Lamborghini 风格全大写标签**
```css
.label-lambo-uppercase {
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  line-height: 1.0;
  color: #6c6a64;
  padding: 6rpx 12rpx;
  background-color: rgba(108,106,100,0.12);
  display: inline-block;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面

- **成就/勋章系统**：Lamborghini Gold 的"奖励"语义完美匹配成就展示
- **学习驾驶舱（统计页）**：信息密度和标签系统适合数据展示
- **模块选择页**：戏剧性字号对比可以突出模块入口

### 4.2 不适合用在哪些页面

- **刷题页面**：零圆角和全大写不适合长时间阅读
- **错题本**：需要温暖感，Lamborghini 的冷硬风格不合适
- **设置页**：过于戏剧化

### 4.3 混搭建议

Lamborghini 适合作为"特殊场景的戏剧性风格"混搭，不适合整体迁移：
- 金色 `#d4a853` 可以作为成就/奖励系统的专用色，与日常珊瑚色 CTA 共存
- 零圆角卡片可以在"成就展示"等特殊页面使用，与常规 24rpx 圆角卡片形成对比
- 全大写标签系统可以用于英文标签（COMPLETED / ACCURACY），不用于中文
- 表面层叠深度模型可以直接融入暖奶油画布：`#faf9f5` → `#efe9de` → `#e5dfd4`

---

## 5. 实施检查清单

- [ ] 日常 CTA 使用珊瑚色 `#cc785c`，金色 `#d4a853` 仅用于成就系统
- [ ] 零圆角仅在特殊页面使用，常规保持 24rpx
- [ ] 不做全大写中文标题，全大写仅用于英文标签
- [ ] 保持暖奶油画布 `#faf9f5` 和奶油卡片 `#efe9de`
- [ ] 表面层叠深度：`#faf9f5` → `#efe9de` → `#e5dfd4`
- [ ] 标题使用 Georgia 衬线，正文使用系统 sans-serif
- [ ] 所有尺寸使用 rpx 单位
- [ ] 不引入任何第三方库
- [ ] 不使用纯黑 `#000000` 作为任何表面颜色

---

## 6. 参考文件

- 原方案：.claude/skills/lamborghini-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
