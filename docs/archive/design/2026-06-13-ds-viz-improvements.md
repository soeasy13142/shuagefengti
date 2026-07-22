# 数据结构可视化模块（ds-viz）— 问题诊断与改进方案

> 生成时间：2026-06-13
> 项目：刷个冯题微信小程序
> 目标：诊断 `pages/ds-viz/` + `utils/bst.js` 当前存在的 UI/UX 问题，给出多种有针对性的改进方案，供 agent 按优先级实现。
> 状态：交接文档，待用户审阅后进入实现。

---

## 0. 当前文件清单

```
pages/ds-viz/
  ds-viz.js      (738 行 — 四种数据结构的全部逻辑)
  ds-viz.wxml    (177 行 — 四种模式的 UI 结构)
  ds-viz.wxss    (187 行 — 全局样式 + 各模式样式)
  ds-viz.json    (导航栏配置)

utils/
  bst.js         (435 行 — BST 纯函数)
  hash-table.js  (哈希表纯函数)
  graph.js       (图搜索纯函数)

tests/utils/
  bst.test.js    (358 行 — BST 测试)
```

**utils 层质量**：三个纯函数模块逻辑正确、测试充分。本次改进**不动 utils 层**。

**问题集中在 pages 层**：渲染方式、交互设计、页面结构。

---

## 1. 问题诊断

### 1.1 核心问题：Canvas 渲染是整个模块的阿喀琉斯之踵

BST 树形图和 Graph 图搜索都使用微信 Canvas API（`wx.createCanvasContext`）做渲染。这是当前所有「图像显示不全 / 使用难受」问题的**根因**。

具体表现：

| # | 现象 | 根因 |
|---|---|---|
| P1 | 树节点重叠/文字被截断 | Canvas 固定 600×500 逻辑像素，`_computeScale` 压缩比例后节点过小。14px 字号被 scale 压缩后 < 8px，肉眼无法辨识 |
| P2 | 拖动不跟手/跳变 | `dragX = this._dragOriginX + dx * 2` — 乘 2 的硬编码放大系数导致拖拽加速度异常 |
| P3 | Canvas 撑不满卡片宽度 | `.viz-canvas { width: 600rpx; height: 500rpx }` — 写死尺寸，大屏手机右侧留白，小屏手机横向溢出 |
| P4 | 无缩放/缩放手势 | 只有单指拖拽（pan），没有双指缩放（pinch）。深树（如 10 层）无法通过缩放看清全部节点 |
| P5 | Canvas 内容不可访问 | 屏幕阅读器完全无法感知 Canvas 内容；Canvas 内容也不可被微信 devtools 的 WXML 面板检查 |
| P6 | Canvas 绘制是即抛的 | 每次 `_drawCanvas()` 清空重绘，无增量更新。连续拖拽时每帧全量重绘，低端机掉帧 |
| P7 | 硬编码常量不随屏幕适配 | `NODE_R=20, CANVAS_W=600, CANVAS_H=500` 全部写死，不同设备上表现不一致 |

### 1.2 页面架构问题：四种模式挤在一个 Page 里

| # | 现象 | 根因 |
|---|---|---|
| P8 | 切换模式丢失状态 | `onModeChange` 中 `bstRoot`、`sqElements`、`hashTable` 等全部重置。用户插了 10 个 BST 节点后看栈 → BST 全丢 |
| P9 | JS 文件 738 行，单一职责崩溃 | 四种完全不同的可视化挤在一个 Page 对象里：BST 的 canvas 逻辑、S/Q 的 WXML 逻辑、Hash 的数据逻辑、Graph 的 canvas 逻辑全部混在一起 |
| P10 | 新增第五种数据结构时 | 需要在 `modes` 数组加一条、在 `data` 里加一组字段、在 `onModeChange` 加一个 if 分支、在 `_applyStep` / `_resetPlayback` / `onReset` 各加一个分支。扩展性为 0 |

### 1.3 栈 & 队列渲染：视觉语义混乱

| # | 现象 | 根因 |
|---|---|---|
| P11 | 栈元素重叠/散开 | `.stack-items` 用 `flex-direction: column-reverse`，每个 `.sq-item` 用 `translateY({{(sqElements.length - 1 - index) * -70}}rpx)` 做绝对偏移。5+ 元素时项之间出现大片空白或重叠 |
| P12 | 队列换行后失去语义 | `.queue-items` 用 `flex-wrap: wrap`。超过屏幕宽度的队列元素换到第二行，"队列"变成"堆"，视觉语义完全错误 |
| P13 | Pop/Dequeue 动画生硬 | `onSqPop` 中先改 state 再 setData 再 pop 再 setData，无过渡动画。元素直接消失 |

### 1.4 哈希表渲染：纵向过长 + 链表溢出

| # | 现象 | 根因 |
|---|---|---|
| P14 | 桶链表溢出视口 | `.bucket-chain` 用 `flex-wrap: wrap`。长链表（如桶 [3] 有 5 个 entry）换行后难以阅读，哈希冲突可视化效果差 |
| P15 | 纵向空间浪费 | 7 个桶纵向排列，每桶高度 ~60rpx。占 420rpx+，但内容稀疏（多数桶只有 1 个 entry 或 null）。 |
| P16 | 无交互 | 不能点击桶查看详情，不能调整桶数量，不能删除 entry |

### 1.5 交互设计问题

| # | 现象 | 根因 |
|---|---|---|
| P17 | 按钮排布不一致 | BST 有 4+2+4 个按钮分三行。栈/队列有 2+2+2 个按钮。哈希表有 2+2 个。图搜索只有 2 个。用户在四种模式间切换时操作心智模型断裂 |
| P18 | 批量操作无进度反馈 | `onBstRandomBatch()` 同步插入 5 个节点，期间页面卡住无任何反馈 |
| P19 | 遍历结果不可见 | BST 四种遍历只高亮当前节点，访问序列不持久化。用户看完 8 个节点的中序遍历动画后，想知道"刚才的序列是什么？"——无答案 |
| P20 | 无撤销 | 插入 10 个节点后发现插错了一个，只能重置全部 |
| P21 | 树统计数据缺失 | 不知树高、节点数、是否平衡。对学习目的的用户来说，这些是核心信息 |
| P22 | Canvas 中点击节点无反馈 | 触摸区是整块透明 view 覆盖 Canvas，无法区分"拖拽"和"点击节点"。用户无法在树中直接点击节点来选中/高亮 |

### 1.6 视觉一致性问题

| # | 现象 | 根因 |
|---|---|---|
| P23 | 部分模式溢出卡片 | Hash 模式用 `overflow-x: auto`，BST/Graph 用固定 Canvas，栈/队列用 flex。四种模式的"可视化区域"视觉边界不一致 |
| P24 | 步进控件在底部 | 操作按钮在顶部（input-area），播放控制在底部（controls），步数描述在中间（step-info）。用户手在页面中间上下跳动 |
| P25 | Canvas 拖拽与页面滚动冲突 | Canvas 上的 touch 事件消费了所有触摸，用户在 Canvas 区域无法上下滚动页面 |

---

## 2. 改进方案

以下按问题域分组，每组给出 2-3 种可选方案。每个方案标注**改动范围**（大/中/小）和**效果预估**。

---

### 2.1 BST 树形图渲染（解决 P1-P7、P22、P25）

#### 方案 A：抛弃 Canvas，改用 WXML 绝对定位 + CSS 过渡（推荐）

**思路**：不再用 Canvas API 画树。改用 `<view>` 节点 + 绝对定位 + CSS `transition`。每个节点是一个 `<view class="tree-node">`，边用 `<view>` 模拟斜线或使用 SVG（微信小程序支持）。动画通过切换 CSS class 实现（WXML 数据绑定自动触发重渲染 + `transition` 做平滑过渡）。

**改动范围**：中。需重写 `_drawTree` 和 `_drawGraphOnCanvas` 为 WXML 模板。Canvas 相关代码全部删除（约 150 行）。`_highlightPath` 改为直接 `setData({ bstNodes: updatedNodes })`。

**WXML 结构示意**：
```html
<view class="tree-container" 
  bindtouchstart="onTreeTouchStart"
  bindtouchmove="onTreeTouchMove"
  bindtouchend="onTreeTouchEnd">
  
  <!-- 边 -->
  <view wx:for="{{bstEdges}}" wx:key="index" class="tree-edge {{item.state}}"
    style="left: {{item.x1}}px; top: {{item.y1}}px; width: {{item.len}}px; transform: rotate({{item.angle}}deg);">
  </view>
  
  <!-- 节点 -->
  <view wx:for="{{bstNodes}}" wx:key="value" class="tree-node {{item.state}}"
    data-value="{{item.value}}"
    bindtap="onNodeTap"
    style="left: {{item.x}}px; top: {{item.y}}px;">
    <text>{{item.value}}</text>
  </view>
</view>
```

**优点**：
- 节点可被 WXML 调试面板检查
- 自适应屏幕宽度（`tree-container` 用百分比宽）
- 拖拽改 `scroll-view` 或 `transform: translate` 的容器，手势流畅
- 动画由 CSS `transition` 驱动，GPU 加速
- 节点可点击（`bindtap`），天然支持节点选中
- 双指缩放可用 `<scroll-view>` 的缩放能力或自行实现

**缺点**：
- 边用 CSS 旋转模拟不够精确，建议改用 SVG `<line>` 或在 `<canvas>` 中只画边（混合方案）
- 大量节点（50+）时 WXML 节点数多，性能需实测
- `layoutTree` 返回的 x/y 坐标需转换为容器内的相对坐标

**实现要点**：
1. `layoutTree` 返回值不变，但需要将坐标从逻辑坐标映射到容器像素坐标
2. 容器尺寸用 `wx.getSystemInfoSync().windowWidth` 动态计算
3. 边用 CSS `border-top` + `transform: rotate()` 模拟，或用内联 SVG
4. 拖拽改为 `<movable-view>` 或外层 `<scroll-view>` 包住树容器
5. 缩放改为 `<scroll-view scale>` 或双指手势

---

#### 方案 B：保留 Canvas，修复核心问题（保守方案）

**思路**：不动渲染架构，只修 Canvas 的具体 bug。

**改动范围**：小。修改 `ds-viz.js` 中 Canvas 相关代码约 50 行。

**具体修改**：
1. `CANVAS_W` / `CANVAS_H` 改为从 `wx.getSystemInfoSync().windowWidth` 动态计算
2. `_computeScale` 中加最小节点尺寸保护：`scale = Math.min(scale, 1.0)` 防止节点被压到 0
3. 去除 `dragX * 2` 的硬编码乘数，改为 1:1 拖动
4. 加双指缩放手势（`bindtouchstart` 判断 `e.touches.length`）
5. `ctx.setFontSize(14)` 改为随 scale 动态调整：`Math.max(10, 14 / scale)`
6. Canvas 中节点添加命中检测（`_hitTest(x, y)`），实现节点点击

**优点**：改动量最小，风险最低。
**缺点**：Canvas 的固有问题（不可访问、调试困难、重绘开销）仍然存在。

---

#### 方案 C：混合方案 — 静态树用 WXML，动画路径用 Canvas

**思路**：树的主体结构用 WXML 渲染（方案 A），但查找/插入/删除的路径高亮动画在 Canvas 上叠加渲染。Canvas 只画高亮指示（脉冲圈、路径箭头），不清空 WXML 层。

**改动范围**：大。需要两层渲染协同。

**优点**：结合两者优势——WXML 的可访问性 + Canvas 的动画表现力。
**缺点**：实现复杂度最高，维护成本高。**不推荐**在本次改进中使用。

---

### 2.2 页面架构拆分（解决 P8-P10）

#### 方案 A：拆为 4 个独立页面 + 1 个着陆页（推荐）

**思路**：当前 4 个模式各自独立为页面。新增一个 `pages/ds-hub/ds-hub` 作为着陆页（卡片选择入口）。

```
pages/ds-hub/ds-hub       ← 新建：四张卡片入口
pages/ds-bst/ds-bst       ← 从 ds-viz 拆出 BST 逻辑
pages/ds-stack-queue/ds-stack-queue  ← 从 ds-viz 拆出 栈&队列
pages/ds-hash/ds-hash     ← 从 ds-viz 拆出 哈希表
pages/ds-graph/ds-graph   ← 从 ds-viz 拆出 图搜索
```

保留 `pages/ds-viz/` 作为兼容重定向（deprecated）。

**改动范围**：中。每个新页面约 150-250 行 JS，结构清晰。`app.json` 注册 5 个新页面。首页 `tool-registry.js` 中的入口可改为先到 hub 页。

**Hub 页设计**：
```
┌─────────────────────────────────┐
│     数据结构可视化                │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │  BST 树   │  │ 栈 & 队列 │    │
│  │  🌲       │  │  📚       │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │  哈希表   │  │  图搜索   │    │
│  │  #️⃣       │  │  🕸️      │    │
│  └──────────┘  └──────────┘    │
└─────────────────────────────────┘
```

**优点**：
- 每个页面短小精悍（200 行以内）
- 切换不丢状态（各自独立 Page 实例）
- 扩展新 DS 只需新建页面 + hub 加卡片
- 每个页面有自己的导航栏标题（`BST 二叉搜索树` vs `栈 & 队列`）

**缺点**：
- `app.json` 多 4 个页面注册
- BST 和 Graph 共享 Canvas 渲染逻辑需抽取为公共模块（`utils/canvas-tree-renderer.js`）

---

#### 方案 B：保留单页，用 Component 隔离

**思路**：不动页面架构，但将四种模式各自封装为微信自定义组件（Component）。页面只做路由分发。

```
pages/ds-viz/
  ds-viz.js       (精简到 80 行：模式切换 + 组件通信)
  ds-viz.wxml     (精简到 30 行：<bst-view> / <sq-view> / <hash-view> / <graph-view>)
  ds-viz.wxss     (精简到公共样式)
  components/
    bst-view/     (BST 的 JS + WXML + WXSS 独立)
    sq-view/      (栈&队列)
    hash-view/    (哈希表)
    graph-view/   (图搜索)
```

**改动范围**：中。需要将现有代码拆入 4 个 Component 的 `methods`、`data`、`lifetimes`。

**优点**：
- 代码隔离，每个 Component 独立维护
- 不增加页面注册数
- 模式切换可不丢状态（Component 实例保留，只切换 `wx:if` → `hidden`）

**缺点**：
- 所有 Component 仍加载在同一页面，内存占用不变
- Component 间共享播放控件需要 props 透传

---

#### 方案 C：保持单页，只做轻量重构

**思路**：不动架构。只把 `onModeChange` 中的状态重置去掉（改为缓存 `this._stateCache = {}`），把四种模式的 JS 方法用注释分区隔开。

**改动范围**：很小。约 30 行修改。

**优点**：最快，零风险。
**缺点**：文件仍然 700+ 行，不解决根本问题。

---

### 2.3 栈 & 队列渲染（解决 P11-P13）

#### 方案 A：纯 WXML + CSS transition 动画（推荐）

**思路**：彻底重写栈和队列的渲染，不再用 transform 偏移。栈用 `flex-direction: column-reverse` 自然堆叠，队列用水平 `flex` + `overflow-x: auto`。入/出操作使用 CSS `transition: all 0.3s ease` + WXML 条件渲染 + `wx:if` 配合 `animation` 实现。

**栈结构**：
```html
<view class="stack-visual">
  <view class="stack-top-label">栈顶 ↓</view>
  <view class="stack-body">
    <view class="stack-item {{item.state}}" wx:for="{{sqElements}}" wx:key="index"
      style="animation: {{item.entering ? 'slideDown 0.3s ease' : ''}}">
      <text>{{item.value}}</text>
    </view>
  </view>
  <view class="stack-bottom-label">栈底</view>
</view>
```

**CSS 关键**：
```css
.stack-body { display: flex; flex-direction: column-reverse; }
.stack-item { transition: all 0.3s ease; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-40rpx); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes popOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.8) translateY(20rpx); }
}
```

**Pop 逻辑**：先 `setData` 标记最后一个元素 `state: 'removing'`（触发 CSS 缩小+淡出），300ms 后用 `setTimeout` 真正 `pop()` 并更新数组。

**队列结构**：水平 `flex` + `overflow-x: auto`。队首标记始终在最左，队尾在最后。Enqueue 元素从右滑入，Dequeue 元素从左滑出。

**优点**：
- 动画流畅（CSS transition，GPU 加速）
- 栈的垂直语义和队列的水平语义视觉清晰
- 不依赖 transform 偏移，元素不重叠

**缺点**：
- 队列元素多时需要横向滚动（但比换行好得多）

---

#### 方案 B：Canvas 渲染 + 逐帧动画

**思路**：用 Canvas 画栈和队列的方块，用 `requestAnimationFrame` 做逐帧位置插值。

**不推荐**。栈和队列是非常简单的方块排列，用 Canvas 是杀鸡用牛刀。而且无法做 CSS 过渡。

---

### 2.4 哈希表渲染（解决 P14-P16）

#### 方案 A：网格布局 + 可折叠桶（推荐）

**思路**：哈希桶改为 2 列网格（或 `flex-wrap` 的横向流），每个桶是一个卡片。链地址法的链表在桶内展开，冲突超过 3 个时出现「+N more」折叠。

**WXML 结构**：
```html
<view class="hash-grid">
  <view class="hash-cell" wx:for="{{hashBuckets}}" wx:key="index">
    <view class="cell-header">
      <text class="cell-index">桶 [{{index}}]</text>
      <text class="cell-count">×{{item.entries.length}}</text>
    </view>
    <view class="cell-entries">
      <view class="hash-kv" wx:for="{{item.entries}}" wx:key="key"
        wx:if="{{index < 3 || cellExpanded[index]}}">
        <text>{{entry.key}}</text>
      </view>
      <view class="cell-more" wx:if="{{item.entries.length > 3 && !cellExpanded[index]}}"
        bindtap="onExpandCell" data-index="{{index}}">
        +{{item.entries.length - 3}} more
      </view>
    </view>
  </view>
</view>
```

**额外改进**：
- 顶部加一个「桶数量」滑块（5/7/11/13），动态调整 tableSize 并 rehash
- 加一个「负载因子」指示条：`已用桶数 / 总桶数`
- 加一个「冲突次数」统计

**优点**：
- 视觉紧凑，空间利用率高
- 支持大表（13/17 桶也不会纵向过长）
- 点击展开查看冲突详情

**缺点**：
- 2 列网格在小屏幕上卡片较窄

---

#### 方案 B：横向滚动桶列表

**思路**：桶改为横向排列（`flex` + `overflow-x: auto`），类似数组横条。每个桶的链表纵向展开。

**适用于教学展示**（哈希表 = 数组 + 链表的结构非常直观），但不适合大量桶。

---

### 2.5 交互体验统一（解决 P17-P21）

#### 2.5.1 统一操作栏布局

四种模式统一使用以下操作区结构：

```
┌─────────────────────────────────────┐
│  [input________________] [插入] [查找] [删除]  │  ← 输入行
│  [🎲随机] [📦批量]     [前序] [中序] [后序] [层序] │  ← 快捷行（模式相关）
├─────────────────────────────────────┤
│  树统计：节点 8 | 高度 4 | 叶子 3               │  ← 统计条（新增）
│  遍历序列：[50, 30, 20, 40, 70, 60, 80]        │  ← 遍历结果条（新增）
└─────────────────────────────────────┘
```

**关键**：
- 输入行永远在第一行，四个模式统一风格
- 快捷行动态变化（BST 显示遍历按钮，栈/队列不显示，哈希表不显示，图显示图类型选择）
- 统计条和遍历结果条是新增的固定区域

#### 2.5.2 播放控件固定在可视区底部

当前控件在页面底部，但页面很长（四种模式的内容堆积）。改为：

- 使用 `position: sticky; bottom: 0` 让播放控件始终固定在可视区底部
- 或者把页面改为固定高度布局：可视化区 `flex: 1`，控件区固定高度

```css
.controls {
  position: sticky;
  bottom: 0;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}
```

#### 2.5.3 增加树统计信息面板

在 BST 操作区上方或侧边加一个紧凑的信息条：

```
节点数: 8  |  高度: 4  |  最小值: 20  |  最大值: 80
```

数据来源：`bst.treeHeight(root)` + `bst.inOrderValues(root)` + 已有 root 结构。

#### 2.5.4 遍历结果持久化

遍历完成后，在统计条下方显示遍历序列：

```
中序遍历序列：20 → 30 → 40 → 50 → 60 → 70 → 80
```

每个数字高亮 2 秒后恢复。遍历结束后序列仍可见。

#### 2.5.5 批量操作加 loading 反馈

`onBstRandomBatch` 等批量操作前设置 `loading: true`，显示骨架/转圈。操作完成后恢复。避免页面假死感。

#### 2.5.6 增加「撤销上一步」按钮

在操作栏加一个 `↩ 撤销` 按钮。实现方式：维护一个 `operationHistory` 栈，每次插入/删除前 push 当前 root 的快照（`cloneTree`）。

---

### 2.6 图搜索渲染（解决 Graph 的 Canvas 问题）

Graph 的 Canvas 问题与 BST 完全一致（P1-P7）。改进方案与 BST 相同：

- **推荐**：方案 A（WXML 绝对定位节点 + 内联 SVG 边）
- **保守**：方案 B（修复 Canvas 具体 bug）

---

## 3. 推荐实施路径

以下按**优先级**和**独立性**排序，每个改动可独立交付。

### 阶段 1：止血（1-2 天，解决最影响使用的 4 个问题）

| 顺序 | 改动 | 解决 |
|---|---|---|
| 1.1 | Canvas 动态尺寸适配（方案 B-1/2/3） | P3, P7 |
| 1.2 | 去除 dragX * 2（方案 B-4） | P2 |
| 1.3 | 修复栈元素重叠 | P11 |
| 1.4 | 播放控件 sticky 底部（方案 2.5.2） | P24 |

**验收**：375px 和 414px 宽度下 Canvas 均满宽显示，栈元素正常堆叠，播放控件始终可见。

### 阶段 2：改善体验（2-3 天，解决剩余交互问题）

| 顺序 | 改动 | 解决 |
|---|---|---|
| 2.1 | 栈/队列 WXML 重写 + CSS 动画（方案 2.3-A） | P11-P13 |
| 2.2 | 哈希表网格布局（方案 2.4-A） | P14-P16 |
| 2.3 | 统一操作栏 + 树统计 + 遍历结果（方案 2.5） | P17-P21 |
| 2.4 | 模式切换缓存状态（方案 2.2-C） | P8 |

**验收**：四种模式的操作区结构一致，树统计和遍历序列可见，切换模式不丢数据。

### 阶段 3：架构优化（3-4 天，解决架构债）

| 顺序 | 改动 | 解决 |
|---|---|---|
| 3.1 | BST 树改用 WXML 渲染（方案 2.1-A） | P1-P7, P22, P25 |
| 3.2 | Graph 改用 WXML 渲染（同上） | 同上 |
| 3.3 | 拆分为独立页面（方案 2.2-A） | P8-P10 |

**验收**：树节点可点击、可被 WXML 面板检查、拖动流畅、双指可缩放。

### 阶段 4：锦上添花（按需，每项 0.5-1 天）

| 改动 | 说明 |
|---|---|
| 哈希表加桶数量滑块 + 负载因子 | 交互增强 |
| BST 撤销按钮 | `cloneTree` 已有 |
| 批量操作 loading 态 | UX 细节 |
| 节点点击高亮 + 详情弹窗 | BST/Graph 节点可点击后，展示节点信息 |

---

## 4. 推荐方案速查

| 问题域 | 推荐方案 | 理由 |
|---|---|---|
| BST/Graph 渲染 | 阶段 3 做方案 A（WXML），阶段 1 先修 Canvas bug（方案 B） | 渐进迁移，降低风险 |
| 页面架构 | 方案 A（4 独立页 + hub） | 可维护性质的飞跃 |
| 栈&队列 | 方案 A（WXML + CSS animation） | 动画流畅，语义正确 |
| 哈希表 | 方案 A（网格 + 折叠） | 空间利用好，支持交互 |
| 交互统一 | 全部采纳 | 每项改动都很小 |

---

## 5. 与项目其他模块的关系

- **不动 `utils/bst.js`、`utils/hash-table.js`、`utils/graph.js`** — 三个纯函数模块逻辑正确、测试充分。除非需要新增导出函数（如统计信息），否则不修改。
- **首页入口**：如果方案 2.2-A 实施（拆分页面），需修改 `utils/tool-registry.js` 中的路由指向（或在首页保留一个入口 → hub 页）。
- **测试**：现有 `bst.test.js` 不受影响。如果新增 animation/logic 纯函数，需补测试。

---

## 6. 验收标准（按阶段）

### 阶段 1 验收

- [ ] 375px 宽度下 Canvas 无水平溢出，宽度 = 屏幕宽 - 64rpx（padding）
- [ ] 414px 宽度下同上
- [ ] Canvas 拖拽 1:1 跟手，无跳变
- [ ] 栈元素在 1-8 个时无重叠、间距均匀
- [ ] 播放控件始终在屏幕底部可见（不随页面滚动消失）

### 阶段 2 验收

- [ ] 栈 Push 有滑入动画（0.3s），Pop 有缩小淡出动画（0.3s）
- [ ] 队列 Enqueue 从右侧滑入，Dequeue 从左侧滑出
- [ ] 队列元素超出屏幕宽度时横向滚动（不换行）
- [ ] 哈希表桶数量正确显示，冲突 > 3 时折叠
- [ ] 四种模式的操作区顶部结构一致：标题行 + 输入行 + 快捷行
- [ ] BST 显示节点数、高度
- [ ] 遍历完成后序列仍可见
- [ ] 从 BST 切换到哈希表再切回 BST，树数据不变

### 阶段 3 验收

- [ ] BST 树不使用 Canvas，全部用 WXML 渲染
- [ ] 树节点可点击（toast 显示节点值）
- [ ] 查找/插入/删除/遍历动画正常（路径高亮、节点闪烁）
- [ ] 双指缩放可用
- [ ] WXML 面板可见所有树节点 view
- [ ] 存在 `pages/ds-hub/ds-hub` 并可导航到四种 DS 页面
- [ ] 四种 DS 各自是独立 Page

---

> **给 agent 的提示**：阶段 1-2 可在当前 `pages/ds-viz/` 内完成，不新建文件。阶段 3 需要新建页面和 hub。每个阶段完成后运行 `npm test` 确认全量通过。
