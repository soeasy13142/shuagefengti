# Nintendo.com (2001) 设计方案 -> 刷个冯题 实施方法论

> 参考来源：Nintendo.com 2001 版本设计语言（硬件面罩式界面、beveled 金属板、Y2K 控制台美学）
> 适用项目：刷个冯题 微信小程序（WXML + WXSS + JS，rpx 单位）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学

Nintendo 2001 的设计将网页渲染为**游戏主机硬件**。每个界面区域都是一块独立的斜角金属板，用亮边和暗线模拟注塑成型的塑料面罩。整个页面是一台机器的控制面板：冷色的薰衣草金属 chrome 承载嵌入式模块，碳黑命令层携带半调网点纹理，温暖色仅用于导航指引——金色标记菜单文字，琥珀色填充工具芯片，橙色标记每一个"前进"动作。

**关键特征：**
- 所有 UI 区域都是**斜角金属板**：薰衣草色面板 + 亮色上边 + 靛蓝色阴影下边
- **切角几何**（45 度切割）而非圆角，强化制造感
- **碳黑命令层**（`#21242e`）携带半调网点纹理，承载导航和操作
- **温暖色严格限于导航指引**：金色 = 菜单文字，琥珀色 = 工具/标记，橙色 = 前进动作
- 粗体描边 + 硬阴影的展示文字，模仿游戏盒封面排版
- 紧凑的模块化网格，最小留白，密度是设计意图

### 1.2 视觉 DNA

| 元素 | Nintendo 2001 原版 | 暖奶油画布（当前） |
|---|---|---|
| 情绪 | 硬件控制台、Y2K 科技感 | 温暖、画布式、编辑式 |
| 深度表达 | 硬斜角 bevel + 1px 阴影线 | 零阴影，靠色块对比 |
| 形状语言 | 锐角/切角为主，少量圆形仅用于 logo 和单选按钮 | 24rpx 圆角卡片为主 |
| 质感 | 注塑塑料面罩 + 半调网点 | 暖奶油画布 |
| 密度 | 极高密度，面板紧贴 | 中等密度舒适留白 |
| 色彩策略 | 冷色薰衣草 chrome + 严格限温的导航色 | 暖奶油 + 珊瑚强调 |

### 1.3 色彩策略

Nintendo 2001 的色彩是**冷色金属底座 + 严格限温的导航信号**。

**三层色彩结构：**
- **薰衣草 chrome 层**（结构性）：`#7a8aba`（主面板）> `#8ba1d4`（提升面板）> `#9fbee7`（浅天面板）> `#acace7`（薰衣草 hero）> `#3d4f97`（bevel 阴影）
- **碳黑命令层**（权威性）：`#21242e`（导航栏、右栏按钮、页脚）— 带半调网点纹理
- **温暖导航信号层**（指引性，严格限温）：
  - `#e48600`（Nav Gold）：仅用于主导航菜单文字
  - `#ecab37`（Amber）：仅用于工具芯片、标记、badge
  - `#f68d1f`（Signal Orange）：仅用于所有"前进/提交"动作
  - `#e60012`（Nintendo Red）：仅用于品牌 logo 和错误状态

### 1.4 字体策略

全部使用 Arial / Helvetica（2001 年无 webfont），通过**处理方式**而非字体选择获得个性：
- **结构标签**：Arial Bold 大写 + 0.5px 字距 — 模拟丝网印刷控制器面板上的图例
- **展示文字**：Arial Black 44px + 粗描边 + 硬偏移阴影 — 模仿游戏盒封面排版
- **正文**：Arial 12px 常规 — 安静不抢镜
- **微标签**：Arial 10px — 带有 2001 年小尺寸位图渲染的像素感

### 1.5 布局与组件模式

- **固定宽度画布**：~780-830px，像应用程序一样居中
- **双导航栏**：碳黑主栏（logo + 5 个金色分区词 + 工具芯片）+ 浅天副栏（工具链接）
- **正文区**：2/3 内容列（堆叠面板）+ 1/3 右操作栏（登录/订阅/帮助按钮）
- **Hero 区域**：全出血摄影 + 页面专属色底 + 描边展示文字
- **斜角 bevel 系统**：每块面板顶部亮边 + 底部 `#3d4f97` 阴影线
- **半调网点纹理**：碳黑区域的标志性质感

---

## 2. 适配分析

### 2.1 可直接迁移

| Nintendo 元素 | 迁移说明 |
|---|---|
| 暖色限温策略（色 = 行动） | 与暖奶油画布的语义色策略高度兼容 |
| 碳黑深色区域 | 暖奶油画布已有 `#181715` 深色面，可直接对应 |
| 描边展示文字效果 | CSS `-webkit-text-stroke` + `text-shadow` 在小程序基础库可实现 |
| 模块化面板堆叠 | 卡片堆叠布局与小程序页面结构兼容 |
| 大写结构标签 | `text-transform: uppercase` 可用 |
| 8px 间距基础单位 | 与暖奶油画布的间距系统兼容 |

### 2.2 需要改造

| Nintendo 元素 | 改造方案 |
|---|---|
| 薰衣草金属面板底色 `#7a8aba` | 改为暖奶油画布奶油色 `#efe9de`，保留"面板"概念但换成暖色调 |
| 斜角 bevel 效果 | 简化为 1px 上亮线 + 1px 下暗线（WXSS border 实现），不用 box-shadow 模拟完整 bevel |
| Arial Black 展示文字 | 改为 Georgia 衬线（项目现有字体），保留描边 + 阴影效果 |
| 0.5px 字距大写标签 | 改为 1rpx 字距（rpx 最小单位），保留 uppercase |
| 2px 圆角按钮 | 改为 8-12rpx（介于 Nintendo 的锐角和暖奶油画布的 24rpx 之间） |
| 半调网点纹理 | 简化为纯色块或极细微的 CSS pattern，避免性能问题 |
| 碳黑命令层 28px 高度 | 改为 72rpx（36px x 2），满足小程序触摸最小区域 |

### 2.3 不可迁移

| Nintendo 元素 | 原因 |
|---|---|
| 固定 780px 画布宽度 | 微信小程序固定 750rpx，无 fluid scaling |
| 双导航栏结构 | 小程序原生 tabbar 替代，无自定义双层导航空间 |
| 左侧旋转标签栏 | 小程序无侧边栏概念，且旋转文字在小屏不可读 |
| 45 度切角面板 | CSS `clip-path` 可实现但性能差，且与暖奶油画布柔和风格冲突 |
| 2001 年位图字体渲染 | 小程序无法禁用字体反锯齿 |
| 精灵图 / 固定像素缩略图 | 小程序用 `image` 组件 + 云裁切 |
| 半调网点真实纹理 | 性能开销大，小程序渲染能力有限 |
| ESRB 评级徽章 | 非游戏场景，无对应需求 |

---

## 3. 具体实施方法

### 3.1 色彩映射表

| Nintendo Token | Nintendo 色值 | 刷个冯题 Token | 刷个冯题色值 | 说明 |
|---|---|---|---|---|
| `canvas`（薰衣草面板） | `#7a8aba` | 奶油卡片 | `#efe9de` | **核心改造**：冷色 chrome 改为暖色面板 |
| `canvas-soft`（浅天面板） | `#9fbee7` | 画布浅色 | `#faf9f5` | 嵌入面板背景改为画布色 |
| `lavender`（hero 底色） | `#acace7` | 深色面 | `#181715` | hero 区域用深色面替代薰衣草 |
| `chrome-indigo`（bevel 阴影） | `#3d4f97` | 分割线深色 | `#b5b0a8` | bevel 阴影简化为暖色分割线 |
| `carbon`（命令层） | `#21242e` | 深色面 | `#181715` | 碳黑命令层直接对应 |
| `ink`（主文字） | `#21242e` | 暖墨 | `#141413` | 主文字色 |
| `ink-soft`（次文字） | `#3d4f97` | 次要文字 | `#6c6a64` | 靛蓝次文字改为暖灰 |
| `on-primary`（深色面文字） | `#ffffff` | 亮面文字 | `#faf9f5` | 纯白改为暖白 |
| `platinum`（列表行表面） | `#dedede` | 奶油卡片 | `#efe9de` | 灰色列表行改为奶油色 |
| `surface`（白内容卡片） | `#ffffff` | 暖奶油画布 | `#faf9f5` | 纯白改为暖白画布 |
| `nav-gold`（导航金） | `#e48600` | 珊瑚 CTA | `#cc785c` | **差异点**：金色导航改为珊瑚色 |
| `amber`（工具琥珀） | `#ecab37` | 珊瑚浅色 | `#e8a88a` | 琥珀色工具改为浅珊瑚 |
| `signal`（前进橙） | `#f68d1f` | 珊瑚 CTA | `#cc785c` | 前进动作统一用珊瑚色 |
| `primary`（品牌红） | `#e60012` | 语义红 | `#d30005` | 品牌红改为语义红 |
| `error` | `#e60012` | 语义红 | `#d30005` | 错误状态保留 |

**核心差异说明：**
Nintendo 2001 的暖色严格限温（金色 = 菜单，琥珀 = 工具，橙 = 前进），刷个冯题将所有暖色行动统一为珊瑚色 `#cc785c` 体系。冷色薰衣草 chrome 全部替换为暖奶油色系。

### 3.2 字体映射（rpx）

| Nintendo Token | Nintendo 参数 | 刷个冯题映射 | rpx 参数 | 适用场景 |
|---|---|---|---|---|
| `display` | Arial Black 44px/900/1.0lh | Georgia 64rpx/400/1.0lh + 描边 + 阴影 | `font-family: Georgia, serif; font-size: 64rpx; font-weight: 400; line-height: 1.0; letter-spacing: -3rpx; -webkit-text-stroke: 2rpx #141413; text-shadow: 4rpx 4rpx 0 #6c6a64` | hero 区域大标题 |
| `hero-tagline` | Arial 15px/700/1.3lh | 系统无衬线 28rpx/500/1.3lh | `font-size: 28rpx; font-weight: 500; line-height: 1.3` | hero 副标题 |
| `nav-link` | Arial 13px/700/1.0lh/0.5px | 系统无衬线 26rpx/700/1.0lh/2rpx | `font-size: 26rpx; font-weight: 700; line-height: 1.0; letter-spacing: 2rpx; text-transform: uppercase` | 导航标签 |
| `ui-label` | Arial 11px/700/1.1lh/0.5px | 系统无衬线 22rpx/700/1.1lh/2rpx | `font-size: 22rpx; font-weight: 700; line-height: 1.1; letter-spacing: 2rpx; text-transform: uppercase` | 面板标题 / 按钮文字 |
| `link` | Arial 12px/700/1.4lh | 系统无衬线 24rpx/700/1.4lh | `font-size: 24rpx; font-weight: 700; line-height: 1.4` | 链接文字 |
| `body` | Arial 12px/400/1.4lh | 系统无衬线 24rpx/400/1.5lh | `font-size: 24rpx; font-weight: 400; line-height: 1.5` | 正文 |
| `micro` | Arial 10px/400/1.3lh | 系统无衬线 20rpx/400/1.3lh | `font-size: 20rpx; font-weight: 400; line-height: 1.3` | 页脚 / 微标签 |

### 3.3 组件设计规范

#### 斜角面板（Bevel Plate）
```
background: #efe9de（暖奶油替代薰衣草）
border-top: 2rpx solid #d5d0c8（亮边，暖色系）
border-bottom: 2rpx solid #b5b0a8（暗线，暖色系替代靛蓝）
border-radius: 8rpx（介于 Nintendo 的锐角和暖奶油画布的 24rpx 之间）
padding: 24rpx
```
**与暖奶油画布差异**：增加上下 bevel 边框线，圆角缩小到 8rpx。

#### 碳黑命令栏
```
background: #181715（深色面对应碳黑）
color: #e8a88a（浅珊瑚对应导航金）
font-size: 26rpx
font-weight: 700
text-transform: uppercase
letter-spacing: 2rpx
padding: 16rpx 24rpx
height: 72rpx（满足触摸最小区域）
```

#### 琥珀工具芯片
```
background: #cc785c（珊瑚色对应琥珀）
color: #faf9f5
font-size: 22rpx
font-weight: 700
text-transform: uppercase
letter-spacing: 2rpx
border-radius: 8rpx
padding: 12rpx 24rpx
```
激活态：`background: #a9583e`（深珊瑚对应 Nav Gold）

#### 前进箭头按钮
```
width: 44rpx
height: 44rpx
border-radius: 9999rpx
background: #cc785c（珊瑚对应 Signal Orange）
color: #faf9f5
display: flex
align-items: center
justify-content: center
```

#### 描边展示文字
```
font-family: Georgia, serif
font-size: 64rpx
font-weight: 400
line-height: 1.0
letter-spacing: -3rpx
color: #faf9f5
-webkit-text-stroke: 2rpx #141413
text-shadow: 4rpx 4rpx 0 rgba(108, 106, 100, 0.5)
```

#### 列表行（对应 news-row）
```
background: #efe9de
border-radius: 8rpx
padding: 16rpx
border-bottom: 1rpx solid #b5b0a8
```

#### 面板标题栏（对应 section-label-bar）
```
background: #efe9de
color: #141413
font-size: 22rpx
font-weight: 700
text-transform: uppercase
letter-spacing: 2rpx
padding: 16rpx
border-bottom: 2rpx solid #b5b0a8
```

#### Hero 面板
```
background: #181715（深色面对应薰衣草 hero 底色）
border-radius: 12rpx
padding: 32rpx
border-top: 2rpx solid #2a2927
border-bottom: 2rpx solid #0e0e0d
```
内含描边展示文字 + 珊瑚色前进箭头。

### 3.4 页面布局模板

#### 首页结构（对应 Nintendo 模块化布局）
```
[碳黑命令栏] 导航标签（大写 + 字距）
  ├── 左：logo
  ├── 中：分区标签 x3-5（珊瑚色文字）
  └── 右：工具芯片（珊瑚底色）
[浅色副栏] 工具链接行
间距：16rpx

[Hero 面板] 深色面 + 描边展示文字 + 前进箭头
  ├── 大标题：Georgia 64rpx + 描边 + 阴影
  ├── 副标题：28rpx/500
  └── 珊瑚色前进箭头按钮
间距：16rpx

[内容区 2列布局]
  左列（2/3 宽度）：
    [面板标题栏] 大写标签
    [内容面板] 堆叠列表行
    [面板标题栏] 大写标签
    [2x2 功能卡片网格]
  右列（1/3 宽度）：
    [操作按钮组] 碳黑按钮 x3-4
    [信息面板] 琥珀色标签头 + 正文
    [推荐卡片] 浅色面板
间距：16rpx（面板紧贴）

[碳黑页脚] 版权 + 微标签
```

#### 题库列表页
```
[碳黑命令栏] 学科标签（大写 + 字距）
[浅色筛选栏] 难度 / 类型筛选芯片
[面板标题栏] "题库列表"
[列表行堆叠] 每行 = 题目标题 + 前进箭头
  ├── 背景 #efe9de
  ├── 底部 1rpx #b5b0a8 分割线
  └── 右侧珊瑚色箭头芯片
```

#### 答题页
```
[碳黑命令栏] 题号进度
[Hero 面板] 题目内容区
  ├── 深色面 #181715
  ├── 描边展示文字（用于题目编号/关键术语）
  └── 正文白色
[选项面板] 堆叠 bevel 面板
  ├── 默认态：#efe9de 底色 + bevel 边框
  ├── 选中态：#cc785c 底色 + 白色文字
  └── 正确态：语义绿 #007d48
[前进按钮] 珊瑚色 "下一题" 按钮
```

### 3.5 WXSS 示例

```css
/* Nintendo 2001 风格斜角面板 + 暖奶油画布配色 */
.nes-panel {
  background: #efe9de;
  border-top: 2rpx solid #d5d0c8;
  border-bottom: 2rpx solid #b5b0a8;
  border-radius: 8rpx;
  padding: 24rpx;
}

/* Nintendo 2001 风格碳黑命令栏 */
.nes-command-bar {
  background: #181715;
  color: #e8a88a;
  font-size: 26rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  height: 72rpx;
}

/* Nintendo 2001 风格导航标签 */
.nes-nav-link {
  color: #cc785c;
  font-size: 26rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  line-height: 1.0;
}

.nes-nav-link--active {
  color: #faf9f5;
  border-bottom: 3rpx solid #cc785c;
}

/* Nintendo 2001 风格工具芯片 */
.nes-tool-chip {
  background: #cc785c;
  color: #faf9f5;
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
}

.nes-tool-chip:active {
  background: #a9583e;
}

/* Nintendo 2001 风格前进箭头 */
.nes-arrow-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 9999rpx;
  background: #cc785c;
  color: #faf9f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

/* Nintendo 2001 风格描边展示文字 */
.nes-display-text {
  font-family: Georgia, serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -3rpx;
  color: #faf9f5;
  -webkit-text-stroke: 2rpx #141413;
  text-shadow: 4rpx 4rpx 0 rgba(108, 106, 100, 0.5);
}

/* Nintendo 2001 风格面板标题栏 */
.nes-section-header {
  background: #efe9de;
  color: #141413;
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  padding: 16rpx;
  border-bottom: 2rpx solid #b5b0a8;
}

/* Nintendo 2001 风格列表行 */
.nes-list-row {
  background: #efe9de;
  padding: 24rpx 16rpx;
  border-bottom: 1rpx solid #b5b0a8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nes-list-row__label {
  font-size: 24rpx;
  font-weight: 700;
  color: #6c6a64;
}

/* Nintendo 2001 风格 Hero 面板 */
.nes-hero-panel {
  background: #181715;
  border-radius: 12rpx;
  padding: 32rpx;
  border-top: 2rpx solid #2a2927;
  border-bottom: 2rpx solid #0e0e0d;
}

.nes-hero-panel__title {
  font-family: Georgia, serif;
  font-size: 64rpx;
  font-weight: 400;
  line-height: 1.0;
  letter-spacing: -3rpx;
  color: #faf9f5;
  -webkit-text-stroke: 2rpx #141413;
  text-shadow: 4rpx 4rpx 0 rgba(108, 106, 100, 0.5);
}

.nes-hero-panel__subtitle {
  font-size: 28rpx;
  font-weight: 500;
  color: #faf9f5;
  margin-top: 16rpx;
}

/* Nintendo 2001 风格选项面板 */
.nes-option-plate {
  background: #efe9de;
  border-top: 2rpx solid #d5d0c8;
  border-bottom: 2rpx solid #b5b0a8;
  border-radius: 8rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
}

.nes-option-plate--selected {
  background: #cc785c;
  border-top-color: #e8a88a;
  border-bottom-color: #a9583e;
  color: #faf9f5;
}

.nes-option-plate--correct {
  background: #007d48;
  border-top-color: #1eaa52;
  border-bottom-color: #005a34;
  color: #faf9f5;
}

/* Nintendo 2001 风格页脚 */
.nes-footer {
  background: #181715;
  color: #6c6a64;
  font-size: 20rpx;
  padding: 32rpx 24rpx;
  border-top: 2rpx solid #2a2927;
}

/* Nintendo 2001 风格信息面板 */
.nes-info-box {
  background: #faf9f5;
  border-radius: 8rpx;
  padding: 24rpx;
  border-top: 2rpx solid #d5d0c8;
  border-bottom: 2rpx solid #b5b0a8;
}

.nes-info-box__header {
  background: #cc785c;
  color: #faf9f5;
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx 8rpx 0 0;
  margin: -24rpx -24rpx 16rpx -24rpx;
}
```

---

## 4. 适用场景建议

### 4.1 最适合页面

| 页面 | 适用原因 |
|---|---|
| **答题页面** | Nintendo 的模块化面板堆叠直接映射题目结构；bevel 面板区分题目区、选项区、操作区 |
| **排行榜 / 成绩页** | 列表行堆叠 + 大写标签头 + 碳黑命令栏适合数据密集的排名展示 |
| **深色模式 / 夜间刷题** | Nintendo 的碳黑命令层 + 深色 hero 天然适合深色主题 |
| **游戏化学习模块** | Y2K 硬件美学天然带有游戏感，适合成就系统、挑战模式 |

### 4.2 不适合页面

| 页面 | 不适合原因 |
|---|---|
| **学习笔记 / Markdown 查看器** | bevel 面板和大写标签会干扰文字阅读体验 |
| **个人资料编辑** | 表单密集页面，斜角面板增加视觉噪音 |
| **搜索结果页** | 需要快速扫描，bevel 边框线会拖慢视觉节奏 |
| **新手引导 / 教程** | 硬件控制台风格过于冷硬，不适合温暖引导 |

### 4.3 混搭建议

**推荐方案：答题场景引入 Nintendo 元素，其余保持暖奶油画布**

| 引入元素 | 位置 | 说明 |
|---|---|---|
| 斜角面板 + bevel 边框 | 答题页面板 | 用 2rpx 上亮下暗边框替代纯色块，增加面板层次感 |
| 碳黑命令栏 | 答题页顶部导航 | 深色面 `#181715` + 珊瑚色标签，强化"控制台"感 |
| 描边展示文字 | 题目编号 / 关键术语 | Georgia + text-stroke + text-shadow，增加视觉冲击 |
| 大写 + 字距标签 | 面板标题栏 | 22rpx/700/uppercase/2rpx 字距，增加结构感 |
| 珊瑚色前进箭头 | 答题页"下一题"按钮 | 圆形珊瑚按钮，替代文字 CTA |
| 1px bevel 分割线 | 列表页行分隔 | 暖色系 bevel 线替代纯色分割线 |

**不建议引入：**
- 薰衣草冷色调（与暖奶油画布冲突）
- 45 度切角几何（破坏柔和感 + 性能问题）
- 半调网点纹理（小程序性能限制）
- 高密度排列（答题需要呼吸空间）
- 双导航栏结构（小程序原生 tabbar 限制）

**混搭优先级：**
1. 答题页：30% Nintendo + 70% 暖奶油画布（面板结构 + bevel 边框）
2. 排行榜：20% Nintendo + 80% 暖奶油画布（列表行 + 大写标签）
3. 其他页面：10% Nintendo + 90% 暖奶油画布（仅引入大写标签风格）

---

## 5. 实施检查清单

- [ ] 确认面板底色为 `#efe9de`（暖奶油），非 Nintendo 的 `#7a8aba`（薰衣草）
- [ ] 确认 bevel 边框用暖色系（`#d5d0c8` 上 / `#b5b0a8` 下），非 `#3d4f97` 靛蓝
- [ ] 确认碳黑命令层用 `#181715`（深色面），非 `#21242e`（碳黑）
- [ ] 确认导航文字用珊瑚色 `#cc785c`，非 `#e48600`（Nav Gold）
- [ ] 确认工具芯片用珊瑚色 `#cc785c`，非 `#ecab37`（琥珀）
- [ ] 确认前进按钮用珊瑚色 `#cc785c`，非 `#f68d1f`（Signal Orange）
- [ ] 确认展示文字用 Georgia 衬线，非 Arial Black
- [ ] 确认描边宽度为 2rpx（适配 rpx），非原始 2px
- [ ] 确认圆角为 8rpx（折中值），非 Nintendo 的 0-2px 或暖奶油画布的 24rpx
- [ ] 确认面板间距为 16rpx，保持适度紧凑但不过于拥挤
- [ ] 确认所有大写标签的 letter-spacing 为 2rpx（rpx 最小可用单位）
- [ ] 确认深色面文字用 `#faf9f5`（暖白），非纯白 `#ffffff`
- [ ] 确认 bevel 效果用 border 实现，不用 box-shadow（性能 + 小程序兼容）
- [ ] 确认 Hero 面板的 text-shadow 不遮挡文字可读性

---

## 6. 参考文件

- 原始设计分析：`.claude/skills/nintendo-2001-design.md`
- 项目交接文档：`PROJECT_HANDOFF.md`（第 25 节 Claude Design 暖奶油画布规范）
- 当前首页实现：`pages/index/index.wxml` + `pages/index/index.wxss`
- 设计风格参考：`.claude/skills/claude-design.md`
- Nike 方法论对照：`design-methods/nike-method.md`
