# 死锁模拟器帮助面板重新设计

> 2026-07-21 · 将弹窗式帮助改为可收起底部参考面板 + 操作区微标注

---

## 1. 目标与范围

### 1.1 问题

当前死锁模拟器的使用说明通过 `intro-modal` 组件展示——一个 3 步向导弹窗（📖概述 → 🔧操作指南 → 📊结果解读）。用户反馈"内容藏在弹窗里"，纯文字堆叠，不像一个真正的页面模块。

### 1.2 解决方案

将帮助从阻断式弹窗改为**可收起的底部参考面板（`tool-help-panel` 组件）**+ **操作区微标注**，双层教学体系：

1. **面板层**：底部常驻，随 RAG/银行家模式自动切换内容，分速查 + 完整说明两档
2. **表面层**：空态提示改为分步骤引导，预设按钮加标注

### 1.3 范围

- **新增**：`components/tool-help-panel/`（4 文件）——可复用帮助面板组件
- **修改**：`pages/deadlock/deadlock.{js,wxml,wxss}`——接入新组件，移除弹窗
- **修改**：`app.json`——注册新组件
- **不改变**：`components/intro-modal/` 保留不动（其他页面可能使用）

---

## 2. 组件设计：`tool-help-panel`

### 2.1 属性（Properties）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | Array | `[]` | 帮助内容数据数组 |
| `activeMode` | String | `''` | 当前模式标识，组件自动匹配 |
| `visible` | Boolean | `false` | 面板展开/收起 |

### 2.2 事件（Events）

| 事件 | 触发时机 | detail |
|------|---------|--------|
| `toggle` | 展开/收起状态变化 | `{visible: true/false}` |
| `close` | 用户关闭面板 | `{}` |

### 2.3 数据模型

```js
// content 数组每项
{
  mode: 'rag',                    // 模式标识，与 activeMode 匹配
  title: 'RAG 操作速查',          // trigger 栏标题
  summary: [                      // 速查条目（默认显示）
    '▸ 添加节点：点击 [+进程] 或 [+资源]（各上限 5 个）',
    '▸ 建立连线：选择边类型 → 点起点 → 点终点',
    '▸ 切换边类型：「边: 请求」↔「边: 分配」交替切换',
    '▸ 检测死锁：点击「检测死锁」按钮',
    '▸ 重置/预设：使用「↻ 重置」或内置预设场景'
  ],
  details: [                      // 完整说明（展开后显示）
    '• 请求边需 P→R，分配边需 R→P',
    '• 点击选中节点（高亮环），再次点击取消选中',
    '• 死锁进程标红 + 红色脉冲光晕',
    '• 图例：红虚线=请求边 / 蓝实线=分配边 / 圆=进程 / 方=资源',
    // ...
  ]
}
```

### 2.4 交互逻辑

| 动作 | 行为 |
|------|------|
| 点击 trigger 栏 | 切换 `visible` |
| 切换 `activeMode` | 匹配对应 mode 的内容，fade 过渡 0.15s |
| 点击面板外区域 | 触发 `close` 事件，收起面板 |
| 面板展开/收起 | `translateY` 动画 0.3s ease-out / 0.25s ease-in |
| trigger 箭头 | `▸ / ▾` 指示状态 |

### 2.5 样式 tokens

| 元素 | 值 |
|------|-----|
| trigger 栏 | 88rpx，`#efe9de`，`border-top: 2rpx solid #ddd7cc` |
| 面板容器 | `#efe9de`，`border-radius: 24rpx 24rpx 0 0`，`position: fixed; bottom: 0` |
| 内容卡片 | `#faf9f5`，`border-radius: 16rpx`，`padding: 24rpx` |
| 速查条目 | 26rpx，`#6c6a64`，`line-height: 1.7` |
| 展开 CTA | `#cc785c`，24rpx |
| 详情区 | 24rpx，`#6c6a64`，`line-height: 1.6` |

---

## 3. 死锁页面集成

### 3.1 内容数据

```js
// HELP_CONTENT 替换原有 DEADLOCK_STEPS
const HELP_CONTENT = [
  {
    mode: 'rag',
    title: 'RAG 操作速查',
    summary: [ /* 5 条 */ ],
    details: [ /* 5 条 */ ]
  },
  {
    mode: 'bankers',
    title: '银行家算法操作速查',
    summary: [ /* 5 条 */ ],
    details: [ /* 4 条 */ ]
  }
];
```

### 3.2 新增页面状态

```js
data: {
  // ... 现有字段不变
  helpVisible: false,
  helpContent: HELP_CONTENT,
}
```

### 3.3 新增方法

| 方法 | 说明 |
|------|------|
| `onHelpTrigger()` | 切换 helpVisible |
| `onFirstVisit()` | 首次访问：面板自动展开 5s 后收回+标记已读 |
| `onHelpToggle(e)` | 接收组件 toggle 事件 |

### 3.4 方法替换

| 删除/替换 | 说明 |
|-----------|------|
| 删除 `DEADLOCK_STEPS` | 替换为 `HELP_CONTENT` |
| 删除 `data.introContent` | 不再需要 |
| 删除 `data.showIntro` | 替换为 `helpVisible` |
| 删除 `_checkFirstVisit()` | 替换为 `onFirstVisit()` |
| 删除 `showIntro()` | 替换为 `onHelpTrigger()` |
| 删除 `onIntroClose()` | 不再需要 |

### 3.5 首次访问体验

弹窗（阻断式）→ 面板自动展开（非阻断式）：

```
onLoad:
  if (!wx.getStorageSync('help_seen_deadlock'))
    → helpVisible = true
    → setTimeout(5s) → helpVisible = false
    → wx.setStorageSync('help_seen_deadlock', true)
```

---

## 4. 操作区微标注

### 4.1 空态引导

```
当前：「点击 [+ 进程] 和 [+ 资源] 开始构建资源分配图」
改为：
  ① 点击 [+进程] 添加进程节点
  ② 点击 [+资源] 添加资源节点
  ③ 选择边类型 → 依次点两个节点建立连线
```

### 4.2 预设按钮标注

每个预设按钮下方增加一行小字标注：

```wxml
<view class="preset-btn-wrapper">
  <view class="preset-btn" ...>{{item.name}}</view>
  <text class="preset-hint">{{item.hint}}</text>
</view>
```

预设数据新增 `hint` 字段：
```
[安全状态]     → "无环路"
[死锁示例]     → "2 进程环路"
[三进程循环]   → "3 进程环路"
```

---

## 5. 文件清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `components/tool-help-panel/tool-help-panel.js` | 组件逻辑 |
| 新增 | `components/tool-help-panel/tool-help-panel.wxml` | 组件模板 |
| 新增 | `components/tool-help-panel/tool-help-panel.wxss` | 组件样式 |
| 新增 | `components/tool-help-panel/tool-help-panel.json` | 组件声明 |
| 修改 | `pages/deadlock/deadlock.js` | 替换帮助数据和方法 |
| 修改 | `pages/deadlock/deadlock.wxml` | 替换组件引用 |
| 修改 | `pages/deadlock/deadlock.wxss` | 删除旧样式 |
| 修改 | `app.json` | 注册 tool-help-panel 组件 |
| 不修改 | `components/intro-modal/` | 保留原样 |

---

## 6. 不引入的

- 无第三方库
- 无后端存储
- 无新 npm 依赖
- 不影响其他页面
- 不影响测试（当前无相关测试）

## 7. 测试方案

- 纯 WXML/WXSS 组件改造，无逻辑变更
- `npm test` 保持全绿（变更不涉及工具函数）
- 可追加 `tests/components/tool-help-panel.test.js`（页面渲染 + 模式切换逻辑）——看 plan 阶段决定
