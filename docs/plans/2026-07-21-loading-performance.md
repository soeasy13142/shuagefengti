# Plan: 页面加载性能优化

## 背景

用户反馈小程序页面打开时有可感知的卡顿。经分析主要三个原因：

| 原因 | 影响面 | 触发时机 |
|------|--------|----------|
| **同步 wx.getStorageSync**（读多数据时阻塞 JS 线程） | 6 个页面 | 页面跳转时 |
| **全部 20 页在主包**（无分包） | 首屏 | 冷启动 |
| **顶部 require 重 Utils**（module parse 阻塞渲染） | 3 个可视化页面 | 页面跳转时 |

**无**大图片、无网络请求、无页面内重计算——卡顿 100% 来自「代码加载和 Storage I/O」。

---

## 方案选型

### 对比

| 方案 | 收益 | 风险 | 工作量 |
|------|------|------|--------|
| **A. 异步 Storage + Loading 动画** | 消除跳转卡顿 | 低（不改接口） | ~3 文件改、1 新组件 |
| **B. 分包** | 消除首屏卡顿 | 中（文件移动、路径更新） | ~15 文件改 |
| **C. 动态 require** | 减毫秒级 parse | 低 | ~3 文件改 |
| **D. A+B+C 全做** | 最大收益 | 中 | 需分批实施 |

**推荐 D：全做，分两阶段。** A+C 低风险先上，B 作为第二阶段。

---

## 步骤分解

### Phase 1：同步 Storage → 异步（低风险，3 步）

#### Step 1.1: storage.js 添加异步 API

不改动现有同步 API（破坏面太大），新增同名 `*Async` 方法：

| 新增 | 行为 |
|------|------|
| `getPapersAsync()` | 返回 Promise\<Paper[]\> |
| `getRecordsAsync()` | 返回 Promise\<Record[]\> |
| `getWrongQuestionsAsync()` | 返回 Promise\<WrongQ[]\> |
| `getPaperByIdAsync(id)` | 返回 Promise\<Paper\|null\> |
| 等 | |

底层用 `wx.getStorage`（异步回调 → Promise 包装）。保留同步版供其他调用方。

> 改动：`utils/storage.js` + 对应测试 `tests/utils/storage.test.js`

#### Step 1.2: 关键页面改为异步加载 + Loading 状态

按优先级改造：

| 页面 | 当前问题 | 改造方式 |
|------|----------|----------|
| `dashboard` | 3 次同步读（onShow） | 先显示骨架 → 异步读 → setData |
| `records` | 全记录同步读 | 同上 |
| `wrong-questions` | 全错题同步读 | 同上 |
| `record-detail` | 全记录同步读 | 同上 |
| `quiz` | 单试卷同步读 | 同上 |
| `import-preview` | temp 数据同步读 | 同上 |

每个页面增加 `data.loading = true` → WXML 中条件渲染骨架/loading → 数据到齐后 `loading: false`。

> 改动：每页 .js + .wxml

#### Step 1.3: 通用 loading 组件

添加 `components/loading-skeleton/` 组件：
- 简单的脉冲动画色块
- 用 slot 支持自定义骨架内容
- 暖奶油色系适配现有设计

> 新增：`components/loading-skeleton/` 4 文件

---

### Phase 2: 动态 require（低风险，1 步）

#### Step 2.1: 可视化页面延迟加载 Utils

| 页面 | 当前顶部 require | 改为 |
|------|-----------------|------|
| `ds-viz` | `bst.js`, `graph.js`, `hash-table.js` | `onLoad` 内 require (或 `onReady` 后) |
| `deadlock` | `rag.js` | `onLoad` 内 require |
| `bplus-viz` | `bplus-tree.js`, `bplus-node.js` | `onLoad` 内 require |

> 改动：`pages/ds-viz/ds-viz.js`, `pages/deadlock/deadlock.js`, `pages/bplus-viz/bplus-viz.js`

---

### Phase 3: 分包（中风险，3 步）

#### Step 3.1: 确定分包结构

将 10 个工具/可视化页面移入分包 `package-tools`：

```
主包（保留）:
  index, quiz-list, import-preview, quiz, result,
  records, record-detail, wrong-questions,
  dashboard, tools-all

分包 package-tools（按需加载）:
  bplus-viz, cpu-sched, dns-viz, subnet-calc,
  sort-viz, tcp-viz, ds-viz, sha256-viz,
  deadlock, nginx-gen
```

#### Step 3.2: 移动文件 + 更新 app.json

```
mkdir package-tools/
mv pages/{bplus-viz,cpu-sched,dns-viz,subnet-calc,sort-viz,tcp-viz,ds-viz,sha256-viz,deadlock,nginx-gen} package-tools/
```

`app.json` 增加：
```json
{
  "subPackages": [{
    "root": "package-tools",
    "pages": [
      "bplus-viz/bplus-viz",
      "cpu-sched/cpu-sched",
      ...
    ]
  }]
}
```

#### Step 3.3: 更新 tool-registry.js 路由路径

所有移入分包的 tool route 改为 `/package-tools/xxx/xxx`。

> 改动：`utils/tool-registry.js`

---

## 受影响文件清单

| 文件 | 改动类型 | 所属 Phase |
|------|----------|-----------|
| `utils/storage.js` | 新增异步 API | P1 |
| `utils/storage.test.js` | 追加异步 API 测试 | P1 |
| `pages/dashboard/dashboard.js` | 异步加载 + loading | P1 |
| `pages/dashboard/dashboard.wxml` | 骨架屏条件渲染 | P1 |
| `pages/records/records.js` | 异步加载 + loading | P1 |
| `pages/records/records.wxml` | 骨架屏条件渲染 | P1 |
| `pages/wrong-questions/wrong-questions.js` | 异步加载 + loading | P1 |
| `pages/wrong-questions/wrong-questions.wxml` | 骨架屏条件渲染 | P1 |
| `pages/record-detail/record-detail.js` | 异步加载 + loading | P1 |
| `pages/record-detail/record-detail.wxml` | 骨架屏条件渲染 | P1 |
| `pages/quiz/quiz.js` | 异步加载 + loading | P1 |
| `pages/quiz/quiz.wxml` | 骨架屏条件渲染 | P1 |
| `pages/import-preview/import-preview.js` | 异步加载 + loading | P1 |
| `pages/import-preview/import-preview.wxml` | 骨架屏条件渲染 | P1 |
| `components/loading-skeleton/` | **新增** 4 文件 | P1 |
| `pages/ds-viz/ds-viz.js` | require 后移 | P2 |
| `pages/deadlock/deadlock.js` | require 后移 | P2 |
| `pages/bplus-viz/bplus-viz.js` | require 后移 | P2 |
| `app.json` | subPackages 配置 | P3 |
| `package-tools/*/` | **移动** 10 个页面目录 | P3 |
| `utils/tool-registry.js` | 路由路径更新 | P3 |

---

## 风险与注意事项

1. **Storage 异步改造**：Promise 包装 `wx.getStorage` 需注意回调的 success/fail 边界。同步 API 保留不改，避免回归。
2. **分包文件移动**：`require('../../utils/xxx')` 相对路径不变（package-tools 和 pages 同级）。但 `wx.navigateTo` 路径必须更新。
3. **分包后路由变化**：未使用 `tabBar`，均为 `navigateTo`，仅需改 tool-registry 中的 route。
4. **分包预加载**：可在首页 `onReady` 后 `wx.preloadSubpackage('package-tools')` 提前加载常用工具包。
5. **测试**：所有纯逻辑测试应不受影响（jest 模拟 wx API）。涉及 page 的测试需验证 loading 状态切换。

---

## 验证标准

- [ ] `npm test` 全绿
- [ ] 页面跳转无明显卡顿（模拟器 + 真机）
- [ ] Loading 动画在数据到齐前正确显示，数据到齐后消失
- [ ] 分包后首次加载主包变小，网络耗时缩短
- [ ] 工具页面路由正常工作
