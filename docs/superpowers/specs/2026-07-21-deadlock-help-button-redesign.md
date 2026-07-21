# 死锁模拟器帮助按钮重设计

## 目标

将死锁模拟器页面右上角 `ℹ︎` 浮动按钮改为底部固定栏 `? 使用说明`，消除视觉突兀感，与页面布局自然融合。

## 变更概览

| 变更 | 说明 |
|------|------|
| 删除 | `pages/deadlock/deadlock.wxml` 中 `.info-btn` 整块 |
| 删除 | `pages/deadlock/deadlock.wxss` 中 `.info-btn` / `.info-btn-icon` 全部样式 |
| 新增 | `pages/deadlock/deadlock.wxml` 中底部固定栏 |
| 新增 | `pages/deadlock/deadlock.wxss` 中 `.bottom-help-bar` 相关样式 |
| 修改 | `pages/deadlock/deadlock.wxss` 中 `.page` 的 `padding-bottom` |

## 设计规范

### 底部帮助栏

```
┌── 页面 ─────────────────────────┐
│  ...                             │
│  [结果面板 / 步骤追踪]           │
│                                  │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤  ← 2rpx #ddd7cc 分割线
│         ?   使用说明              │  ← 88rpx, #efe9de
└──────────────────────────────────┘
```

| 属性 | 值 |
|------|-----|
| `position` | `fixed`，`bottom: 0`，`left: 0`，`right: 0` |
| `height` | 88rpx |
| `background` | `#efe9de` |
| `border-top` | `2rpx solid #ddd7cc` |
| `z-index` | 100 |
| 内容 | 居中（flex），`?` 图标 + "使用说明" |
| 图标大小 | 30rpx |
| 文字大小 | 24rpx |
| 图标/文字颜色 | `#6c6a64` |
| 点击态 | `opacity: 0.6` |

### 页面补偿

`.page` 增加 `padding-bottom: 88rpx`，防止底部内容被固定栏遮挡。

### 交互行为

- 首次进入页面 → 自动弹 `intro-modal`（原有逻辑不变）
- 点击「? 使用说明」→ 调用 `showIntro()` → 弹组件
- 关闭弹窗 → 标记已读（`intro_seen_deadlock`），不再自动弹出
- 之后随时点击底栏重新查看

### 删除

- `deadlock.wxml` 中 `info-btn` 整块（L3-L6）
- `deadlock.wxss` 中所有 `info-btn` 和 `info-btn-icon` 样式（L385-L408）

## 涉及文件

| 操作 | 文件 |
|------|------|
| 修改 | `pages/deadlock/deadlock.wxml` |
| 修改 | `pages/deadlock/deadlock.wxss` |

仅修改 WXML 和 WXSS，不涉及 JS 逻辑变更（`showIntro` 等方法保持不动）。

## 验证

- `npm test` 全绿
- 模拟器截图确认底部栏显示
- 点击底部栏 → intro-modal 弹出
- 首次进入 → 自动弹窗（未读时）
- 页面滚动到底部不被底栏遮挡
