# BMW 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/bmw-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
BMW 企业站的设计核心是 **"克制的欧洲工程美学"** —— 浅色画布搭配 BMW 蓝 (#1c69d4) 作为唯一主操作色，重 700 显示标题与轻 300 正文形成鲜明对比。按钮矩形 0px 圆角（"工业精度"），模型卡片无阴影靠色块对比，整体比 BMW M 更实用、更经销商友好。

### 1.2 视觉 DNA
1. **单色 BMW 蓝**：#1c69d4 承载所有主 CTA
2. **700/300 字重对比**：重显示 + 轻正文 = 编辑签名
3. **矩形按钮 0px 圆角**：工业精度，与 SaaS 的圆角形成鲜明对比
4. **浅色画布 + 深色 hero 交替**：白色 ↔ 深海军蓝的节奏
5. **无阴影**：深度完全靠摄影和色块对比
6. **UPPERCASE 内联链接**："LEARN MORE" 大写 + 1.5px tracking
7. **4 列模型卡片网格**：白底 + 照片 + 标题 + 链接
8. **80px section 节奏**：比 BMW M 的 96px 更紧凑

### 1.3 色彩策略
| 角色 | 色值 | 说明 |
|---|---|---|
| 主色 BMW 蓝 | #1c69d4 | 所有主 CTA |
| 蓝色 Active | #0653b6 | 按下态 |
| 蓝色 Disabled | #d6d6d6 | 禁用态 |
| 正文墨色 | #262626 | 标题、正文 |
| 正文深色 | #1a1a1a | 强调正文 |
| 次要文字 | #6b6b6b | footer、面包屑 |
| 柔灰 | #9a9a9a | 禁用文字 |
| 画布 | #ffffff | 默认页面底色 |
| 表面柔和 | #f7f7f7 | footer 底色 |
| 表面卡片 | #fafafa | 卡片照片底板 |
| 深色表面 | #1a2129 | hero band |
| 深色提升 | #262e38 | 嵌套卡片 |
| 分割线 | #e6e6e6 | 1px 边框 |
| 成功 | #22c55e | 确认信息 |
| 警告 | #f59e0b | 警告 |
| 错误 | #dc2626 | 验证错误 |

### 1.4 字体策略
- **字体族**：BMW Type Next Latin（授权字体）
- **Display**：weight 700，letter-spacing 0
- **Body**：weight 300（Light），letter-spacing 0
- **weight 500 被刻意排除**：阶梯为 300/400/700
- **UPPERCASE 链接**：13px / 700 / 1.5px tracking
- **按钮**：14px / 700 / 0.5px tracking
- **Caption**：12px / 400 / 0.5px tracking

### 1.5 布局与组件模式
- **按钮**：0px 圆角（矩形）、48px 高度、14×32px 内边距
- **卡片**：0px 圆角、白底、照片在 #fafafa 底板上
- **输入框**：0px 圆角、48px 高度
- **间距**：8px 基础、section 80px、卡片内边距 24px
- **最大宽度**：~1440px
- **无阴影**：深度完全靠色块对比

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策

1. **700/300 字重对比思路**：BMW 的"重标题 + 轻正文"编辑签名，可在本项目中用 Georgia 400 + 正文 300 的思路（但 300 在小程序可能模糊）
2. **浅色画布 + 深色 hero 交替**：与暖奶油画布的奶油底 + 深海军蓝 hero 逻辑一致
3. **无阴影哲学**：BMW 完全无阴影，与暖奶油画布的零阴影规范完美匹配
4. **80px section 节奏**：适合学习工具的紧凑布局需求
5. **UPPERCASE 内联链接风格**：可在标签、分类导航中使用大写 + letter-spacing

### 2.2 需要改造的设计决策

| 原方案做法 | 本项目应该怎么做 | 原因 |
|---|---|---|
| BMW 蓝 #1c69d4 | 珊瑚色 #cc785c | 保持暖色调 |
| 0px 圆角矩形按钮 | 8rpx 圆角按钮 | 暖奶油画布的圆角语言更友好 |
| 0px 圆角卡片 | 24rpx 圆角卡片 | 同上 |
| 纯白画布 | 暖奶油画布 #faf9f5 | 保持品牌一致性 |
| BMW Type Next Latin | Georgia 衬线 + system-ui | 微信小程序无法加载 |
| 300 weight 正文 | 400 weight 正文 | 300 在低分辨率屏幕可能模糊 |
| 48px 按钮高度 | 80rpx 按钮高度 | 适配 rpx 和触控需求 |
| 1.5px UPPERCASE tracking | 2rpx UPPERCASE tracking | rpx 单位转换 |

### 2.3 不可迁移的设计决策

1. **0px 圆角矩形按钮**：与暖奶油画布的"友好圆角"语言直接冲突，矩形在学习工具中显得过于冷硬
2. **BMW Type Next Latin 字体**：BMW 授权字体，微信小程序无法加载
3. **300 weight 正文**：在微信小程序低分辨率屏幕上显示模糊
4. **weight 500 缺失**：本项目的 Georgia 衬线 + system-ui 体系中 500 是有用的中间字重
5. **M 三色条纹**：品牌特定装饰元素，与本项目无关

---

## 3. 具体实施方法

### 3.1 色彩映射表

| BMW 角色 | 原色值 | 本项目色值 | 说明 |
|---|---|---|---|
| BMW 蓝 | #1c69d4 | #cc785c | 珊瑚色 |
| 蓝色 Active | #0653b6 | #a9583e | 深珊瑚 |
| 蓝色 Disabled | #d6d6d6 | #e6dfd8 | 暖奶油禁用 |
| 正文墨色 | #262626 | #141413 | 暖墨 |
| 正文深色 | #1a1a1a | #252523 | 暖深墨 |
| 次要文字 | #6b6b6b | #6c6a64 | 暖灰 |
| 画布 | #ffffff | #faf9f5 | 暖奶油 |
| 表面柔和 | #f7f7f7 | #f5f0e8 | 暖灰 |
| 表面卡片 | #fafafa | #efe9de | 奶油卡片 |
| 深色表面 | #1a2129 | #181715 | 深海军蓝 |
| 分割线 | #e6e6e6 | #e6dfd8 | 暖调分割线 |
| 成功 | #22c55e | #5db872 | 暖调成功 |
| 错误 | #dc2626 | #c64545 | 暖调错误 |

### 3.2 字体映射

| BMW Token | BMW 参数 | 本项目参数 | 说明 |
|---|---|---|---|
| display-xl | 64px / 700 / 0 | 72rpx / 400 / -3rpx | Georgia 衬线 |
| display-lg | 48px / 700 / 0 | 64rpx / 400 / -2rpx | 区域标题 |
| display-md | 32px / 700 / 0 | 56rpx / 400 / -1rpx | 小节标题 |
| display-sm | 24px / 700 / 0 | 44rpx / 400 / 0 | CTA 标题 |
| title-lg | 20px / 700 | 36rpx / 500 | 卡片组标题 |
| title-md | 18px / 700 | 32rpx / 500 | 模型卡片标题 |
| title-sm | 16px / 700 | 28rpx / 500 | 列表标签 |
| body-md | 16px / 300 | 28rpx / 400 | 正文（改为 400） |
| body-sm | 14px / 300 | 26rpx / 400 | 辅助正文 |
| caption | 12px / 400 / 0.5px | 22rpx / 400 / 1rpx | 照片说明 |
| label-uppercase | 13px / 700 / 1.5px | 24rpx / 700 / 2rpx | 大写标签 |
| button | 14px / 700 / 0.5px | 26rpx / 500 / 1rpx | 按钮 |

### 3.3 组件设计规范

**按钮（Primary）**
- 背景：#cc785c，文字：#ffffff
- 圆角：8rpx（非 BMW 的 0px）
- 内边距：24rpx 56rpx
- 高度：80rpx
- 字号：26rpx / 500

**按钮（Secondary）**
- 背景：#faf9f5，文字：#141413
- 边框：1rpx solid #e6dfd8
- 圆角：8rpx

**大写链接标签（LEARN MORE 风格）**
- 字号：24rpx / 700
- letter-spacing: 2rpx
- text-transform: uppercase
- 颜色：#141413
- 后缀：› 箭头

**功能卡片**
- 背景：#efe9de
- 圆角：24rpx（非 BMW 的 0px）
- 内边距：40rpx
- 照片区底色：#f5f0e8
- 标题：Georgia 衬线 32rpx / 500
- 描述：26rpx / 400

**Hero Band（深色）**
- 背景：#181715
- 文字：#faf9f5
- 内边距：上下 96rpx，左右 48rpx
- 标题：Georgia 衬线 72rpx / 400

**Category Tab**
- 活跃态：#141413 文字 + 2rpx 底部下划线 + UPPERCASE
- 非活跃态：#6c6a64 文字 + UPPERCASE

### 3.4 页面布局模板

**Hero 区（BMW 深色 hero 暖化版）**
- 背景：#181715
- 内边距：96rpx
- 内容：Georgia 衬线大标题 + 副标题 + 珊瑚色 CTA
- 右侧/下方：功能预览区域

**功能卡片区（BMW 4 列网格暖化版）**
- 2 列布局（小程序）
- 卡片间距：24rpx
- 每卡片：功能图标底板 (#f5f0e8) + 标题 + 描述 + UPPERCASE 链接

**内容展示区**
- 浅色画布交替深色 hero
- section 间距：96rpx
- 每个 section：标题 + 内容 + 操作

**Footer**
- 背景：#f5f0e8（暖灰）
- 文字：#6c6a64
- 简洁链接列表

### 3.5 WXSS 实现示例

**BMW 风格大写链接（暖化版）**
```css
.link-uppercase {
  font-size: 24rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  color: #141413;
  text-decoration: none;
}

.link-uppercase::after {
  content: ' ›';
  margin-left: 4rpx;
}
```

**BMW 风格深色 Hero Band（暖化版）**
```css
.hero-band-dark {
  background-color: #181715;
  padding: 96rpx 48rpx;
}

.hero-band-dark__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 72rpx;
  font-weight: 400;
  color: #faf9f5;
  line-height: 1.05;
  letter-spacing: -3rpx;
}

.hero-band-dark__subtitle {
  font-size: 28rpx;
  font-weight: 400;
  color: #a09d96;
  margin-top: 16rpx;
  line-height: 1.5;
}
```

**BMW 风格功能卡片网格**
```css
.card-grid-bmw {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.card-grid-bmw__item {
  width: calc(50% - 12rpx);
  background-color: #efe9de;
  border-radius: 24rpx;
  overflow: hidden;
}

.card-grid-bmw__photo {
  background-color: #f5f0e8;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-grid-bmw__body {
  padding: 32rpx;
}

.card-grid-bmw__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 32rpx;
  font-weight: 500;
  color: #141413;
}

.card-grid-bmw__desc {
  font-size: 24rpx;
  font-weight: 400;
  color: #6c6a64;
  margin-top: 8rpx;
  line-height: 1.5;
}
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **首页功能网格**：BMW 的 4 列模型卡片网格（暖化为 2 列）非常适合工具箱首页
- **模块详情页**：BMW 的 hero + spec + photo 交替节奏适合展示工具功能
- **分类导航**：BMW 的 UPPERCASE category-tab 适合工具分类切换
- **深色展示区**：BMW 的深海军蓝 hero band 适合首页的重点展示

### 4.2 不适合用在哪些页面
- **刷题页面**：BMW 的"展示感"布局密度太低，刷题需要紧凑操作界面
- **表单页面**：BMW 的 0px 圆角表单风格过于冷硬
- **数据密集页面**：BMW 的大留白不适合数据表格

### 4.3 混搭建议
- **卡片结构**：采用 BMW 的"图标底板 + 标题 + 描述 + 链接"结构，但用暖色和圆角
- **Hero 节奏**：采用 BMW 的浅/深交替，但用暖奶油和暖海军蓝
- **链接风格**：BMW 的 UPPERCASE + arrow 链接可用于"查看更多"类操作
- **整体基调**：保持暖奶油画布的温暖感，BMW 仅提供网格布局和页面节奏参考

---

## 5. 实施检查清单

- [ ] BMW 蓝 #1c69d4 替换为珊瑚色 #cc785c
- [ ] 0px 圆角替换为 8rpx（按钮）/ 24rpx（卡片）
- [ ] 300 weight 正文改为 400 weight
- [ ] 纯白画布替换为暖奶油 #faf9f5
- [ ] UPPERCASE 链接保留，但 letter-spacing 转换为 rpx
- [ ] 所有 px 转换为 rpx
- [ ] M 三色条纹移除（与本项目无关）
- [ ] 深色 hero 使用 #181715（非 BMW 的 #1a2129）
- [ ] section 间距使用 96rpx

---

## 6. 参考文件

- 原方案：.claude/skills/bmw-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
