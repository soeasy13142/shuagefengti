# 首页重设计 · Design Spec

> **定位：工具箱优先** — 首页以工具集合页为核心，刷题入口精简为顶部模块，去掉学习概览。
> 设计风格：Claude Design 暖奶油画布（`#faf9f5`），珊瑚主色（`#cc785c`），衬线品牌字。

---

## 1. 页面整体结构（从上到下）

```
┌─────────────────────────────┐
│ 顶部品牌 + 刷题入口模块      │  ← 紧凑型头部
├─────────────────────────────┤
│ 分类标签栏（横向滚动）        │  ← 5 个分类 + 全部
├─────────────────────────────┤
│ 工具卡片网格（2 列）          │  ← 核心内容
│  [查看全部 24 个工具 →]      │  ← 底部链接
├─────────────────────────────┤
│ 备案号                       │
└─────────────────────────────┘
```

---

## 2. 顶部品牌 + 刷题入口模块

### 视觉布局

```
"刷个冯题"                    ← Georgia 衬线, 48rpx, #141413
[📝 开始刷题 ▸]               ← 内联按钮, 珊瑚色 #cc785c
答题记录 · 错题本              ← 次要文字链接, #6c6a64
```

### 设计规范

| 元素 | 属性 | 值 |
|---|---|---|
| 容器 | padding | 48rpx 32rpx 32rpx |
| 品牌名 | font-family | Georgia, 'Times New Roman', serif |
| 品牌名 | font-size | 48rpx |
| 品牌名 | font-weight | 400 |
| 品牌名 | color | `#141413`（暖墨） |
| 品牌名 | letter-spacing | -2rpx |
| 品牌名 → 按钮间距 | margin-bottom | 28rpx |
| 按钮 | 背景 | `#cc785c`（珊瑚色） |
| 按钮 | 圆角 | 12rpx |
| 按钮 | padding | 10rpx 28rpx |
| 按钮 | font-size | 26rpx |
| 按钮 | font-weight | 500 |
| 按钮 | color | `#ffffff` |
| 按钮 active | 背景 | `#a9583e` |
| 快捷链接 | font-size | 24rpx |
| 快捷链接 | color | `#6c6a64` |
| 快捷链接 | 分隔符 | ` · `（中点 + 空格） |
| 按钮 → 快捷链接间距 | margin-top | 16rpx |

### 行为

- 点击「开始刷题」→ `onHeroTap()`（跳转 `/pages/quiz-list/quiz-list`），保留点击缩小动画
- 点击「答题记录」→ `goToRecords()`（跳转 `/pages/records/records`）
- 点击「错题本」→ `goToWrongQuestions()`（跳转 `/pages/wrong-questions/wrong-questions`）

### 入场动画

- 整体 `anim-in`：`opacity: 0 → 1` + `translateY(0rpx → 0)`，0.4s ease-out
- 注：不再需要 `heroTapped` 状态的 Tween 缩放，统一用 `hover-class`

---

## 3. 分类标签栏

### 视觉布局

```
 全部 │ 计算机网络 │ 操作系统 │ 密码学 │ 算法&数据结构 │ 编译原理
~~珊瑚色实线~~                                 ← 当前选中「全部」
```

### 设计规范

| 属性 | 值 |
|---|---|
| 容器 | `scroll-view` 横向滚动，`show-scrollbar="{{false}}"` |
| 容器 padding | 0 32rpx |
| 容器 margin-bottom | 16rpx |
| 标签 padding | 14rpx 24rpx |
| 标签 margin-right | 12rpx |
| 标签 font-size | 26rpx |
| 标签 font-weight | 500 |
| 标签默认色 | `#6c6a64` |
| 标签选中色 | `#cc785c`（珊瑚） |
| 标签 active | 底部 4rpx `border-bottom` solid `#cc785c` |
| 标签过渡 | `color 0.2s, border-color 0.2s` |

### 行为

- 点击标签 → `onCategoryTap(e)`，更新 `activeCategory`
- 「全部」视图：展示所有分类的可用工具（每个分类最多 4 个）+ 精选预告
- 单一分类视图：展示该分类下所有可用 + 未上线工具（可用正常、未上线置灰）

---

## 4. 工具卡片网格

### 卡片整体

```
┌───────────────────┐
│ 🌐                │  ← icon: 48rpx
│                   │
│ 子网计算器        │  ← 名称: 28rpx, 500w, #141413
│ IP/CIDR · 二进制  │  ← 描述: 20rpx, #8e8b82, 2行
│ 可视化            │
│                   │
│ 进入 ▸            │  ← 链接: 24rpx, 500w, #cc785c
└───────────────────┘
```

### 设计规范

| 属性 | 值 |
|---|---|
| 网格容器 padding（含标签和网格） | 0 32rpx |
| 网格容器 margin-bottom | 40rpx |
| 列数 | 2（`flex-wrap: wrap`） |
| 卡片间距 | `gap: 20rpx` |
| 卡片背景 | `#efe9de`（奶油色） |
| 卡片圆角 | 24rpx |
| 卡片 padding | 32rpx 24rpx 24rpx |
| 卡片 active | `#e8e0d2` |
| icon | 48rpx, margin-bottom 20rpx |
| 工具名 | 28rpx, 500 weight, `#141413`, line-height 1.35 |
| 工具名 → 描述间距 | 6rpx |
| 描述 | 20rpx, 400 weight, `#8e8b82`, line-height 1.4, `-webkit-line-clamp: 2`（2 行截断） |
| 描述 → 底部链接间距 | 12rpx |
| 「进入 ▸」链接 | 24rpx, 500 weight, `#cc785c` |

### 即将上线工具的差异化

| 属性 | 已上线 | 即将上线 |
|---|---|---|
| 整卡 | 正常 `#efe9de` | `opacity: 0.45` |
| icon | 正常 | 半透明 |
| 操作链接 | 「进入 ▸」珊瑚色 | 「即将上线」灰色 tag `#6c6a64`, 20rpx |
| 数据 | 全部属性可用 | icon + name + description 渲染 |

### 「全部」视图下的展示规则

- 每个分类取前 4 个 **可用 + featured** 工具
- 若某分类可用工具为 0，则跳过该分类
- 每个分类后跟 **最多 2 个**「即将上线」精选预告（半透明卡片）
- 当候选预告 > 2 时，按 `order` 排序取前 2

### 单一分类视图下的展示规则

- 可用工具 → 正常卡片（2 列网格）
- 未上线工具 → 半透明卡片（2 列网格）
- 两个组之间用分类标题区隔
- 全空状态：居中显示「该分类的工具正在开发中」

---

## 5. 「查看全部」链接

| 属性 | 值 |
|---|---|
| 容器 padding | 32rpx 0 |
| 对齐 | 居中 |
| font-size | 26rpx |
| font-weight | 500 |
| color | `#cc785c` |
| 内容 | `查看全部 N 个工具 →` |

当前 `N = 24`，后续新增工具时自动更新。

点击 → 跳转到 `pages/tools-all/tools-all`（全部工具列表页）。

---

## 6. 全部工具列表页 `pages/tools-all/tools-all`

轻量级二级页面，展示所有 24 个工具（已上线 + 即将上线）。

### 布局

```
┌─────────────────────────────┐
│  ← 返回    全部工具          │  ← 顶部导航栏
├─────────────────────────────┤
│ 全部 │ 网络 │ 系统 │…        │  ← 分类标签栏（同首页）
├─────────────────────────────┤
│ ┌──────┐ ┌──────┐          │
│ │ 🌐   │ │ 🔗   │          │
│ │子网..│ │TCP动..│          │
│ │IP/.. │ │三次..│          │
│ │进入 ▸│ │进入 ▸│          │
│ └──────┘ └──────┘          │
│ ┌──────┐ ┌──────┐          │
│ │ 🔒   │ │ 🔢   │          │
│ │TLS动..│ │SHA-..│          │
│ │证书..│ │哈希..│          │
│ │即将..│ │即将..│          │
│ └──────┘ └──────┘          │
│           ...               │
└─────────────────────────────┘
```

### 设计规范

- 全部沿用首页工具卡片的样式规格
- 默认「全部」标签选中，展示全部 24 个工具
- 工具按分类分组展示，每个分类带分类标题（icon + 名称）
- 已上线卡片正常，未上线半透明 + 「即将上线」tag
- 导航栏：微信原生 `navigationBarTitleText = "全部工具"`

### 行为

- 点击已上线工具 → `wx.navigateTo` 对应工具页
- 点击即将上线工具 → `wx.showToast({ title: '功能开发中', icon: 'none' })`
- 返回按钮 → 微信原生返回

---

## 7. 备案号

| 属性 | 值 |
|---|---|
| padding | 48rpx 0 40rpx |
| 对齐 | 居中 |
| font-size | 22rpx |
| color | `#8e8b82` |

内容不变：`苏ICP备2026036865号-1X`

---

## 8. 入场动画

| 区块 | 动画 | 延迟 | 时长 |
|---|---|---|---|
| 顶部品牌+入口 | fadeSlideIn | 0ms | 0.4s |
| 标签栏 + 网格 | fadeSlideUp | 0.2s | 0.5s |
| 备案号 | fadeSlideUp | 0.35s | 0.5s |

```css
.anim-in       { animation: fadeSlideIn 0.4s ease-out both; }
.anim-up       { animation: fadeSlideUp 0.5s ease-out 0.2s both; }
.anim-up-delay { animation: fadeSlideUp 0.5s ease-out 0.35s both; }
```

---

## 9. 涉及文件清单

### 修改文件

| 文件 | 改动类型 | 说明 |
|---|---|---|
| `pages/index/index.wxml` | 重写 | 按新布局重写模板 |
| `pages/index/index.wxss` | 重写 | 按新规范重写样式（含删除/新增类） |
| `pages/index/index.js` | 修改 | 调整 `data` 结构、删 `loadStats` 相关、调整分类逻辑 |
| `app.json` | 修改 | 新增 `pages/tools-all/tools-all` 页面注册 |

### 新增文件

| 文件 | 说明 |
|---|---|
| `pages/tools-all/tools-all.js` | 全部工具列表页 JS |
| `pages/tools-all/tools-all.wxml` | 全部工具列表页模板 |
| `pages/tools-all/tools-all.wxss` | 全部工具列表页样式 |
| `pages/tools-all/tools-all.json` | 页面配置 |

### 无改动

| 文件 | 说明 |
|---|---|
| `utils/tool-registry.js` | 数据源不变 |
| `utils/storage.js` | 不再从首页读取 stats |

---

## 10. 不做的范围（明确排除）

- ❌ 改变刷题流程本身
- ❌ 改变 `utils/tool-registry.js` 的数据结构
- ❌ 工具卡片内嵌统计/进度条等复杂内容

---

## 11. 风险与注意事项

- **数据源依赖**：首页不再展示学习数据，`storage.getRecords()` / `analytics.buildDashboardData()` 不再被首页调用 → 不影响其他页面
- **onShow 生命周期**：去掉 `loadStats()` 调用，仍保留 `loadTools()` + `heroTapped` 重置
- **onReady 动画**：保持 `setTimeout` 触发入场动画
- **「全部」与二级页的关系**：首页「全部」标签展示精选预览（每分类 ≤4 可用 + 2 预告）；二级页展示完整 24 工具列表
- **分类兼容**：全部视图下，当某分类只有 1 个工具时网格自动填充；某分类可用工具为 0 时跳过该分类
- **测试**：如果已有首页测试，需要同步更新
