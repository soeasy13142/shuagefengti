# 工具点击启动卡顿优化计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 消除/减轻点击首页工具卡片后页面跳转的卡顿感

**Architecture:** 精准打击方案 — 只优化消耗最大的 onLoad 热点（DH-viz 本原根计算、Regex→DFA 首次构造），辅以加载动画兜底。纯 JS 改动，不涉及 WXML/WXSS。

**Tech Stack:** 微信小程序原生（JS）

## Global Constraints

- 纯函数 + 不可变风格
- 所有改动必须保持 `npm test` 全绿
- 不引入第三方依赖

---

### Task 1: DH-viz 启动优化 — 缓存本原根计算结果

**问题：** `onLoad` → `_updateAvailableRoots()` → `findPrimitiveRoots(997)` 对 925 个候选值各执行一次 `modPow`，~10,000 次算术运算阻塞首次渲染（估计旧设备 ~10-50ms）。

**优化：** 在 `utils/dh-core.js` 中添加模块级 `_rootCache` Map，缓存已算过的本原根。首次计算后缓存，后续切换素数瞬间命中。

**Files:**
- Modify: `utils/dh-core.js:88-96`

**Interfaces:**
- Consumes: `findPrimitiveRoots(p)` — 已有函数，签名不变
- Produces: `findPrimitiveRoots(p)` — 签名不变，但内部有缓存

- [ ] **Step 1: 为 findPrimitiveRoots 添加缓存**

```js
// 在 findPrimitiveRoots 函数上方添加
const _rootCache = {};

function findPrimitiveRoots(p) {
  if (_rootCache[p] !== undefined) {
    return _rootCache[p];
  }
  const roots = [];
  for (let g = 2; g < p; g++) {
    if (isPrimitiveRoot(g, p)) {
      roots.push(g);
    }
  }
  _rootCache[p] = roots;
  return roots;
}
```

- [ ] **Step 2: 运行测试确认不破坏已有行为**

Run: `npm test`
Expected: 所有测试通过

- [ ] **Step 3: 验证 dh-viz 页面加载后 availableRoots 正常**

Run: 检查 `_rootCache[997]` 在 onLoad 后非空，且 dh-viz 页面中本原根下拉列表正常

- [ ] **Step 4: Commit**

```bash
git add utils/dh-core.js
git commit -m "perf: 缓存 findPrimitiveRoots 计算结果, 消除 DH-viz onLoad 阻塞"
```

---

### Task 2: Regex→DFA 启动优化 — 将首次构造延迟到 onReady

**问题：** `onLoad` → `loadPreset(1)` → `doConstruct()` 执行正则解析、Thompson 构造、子集构造、布局计算、20+ 字段 setData。所有操作阻塞首次渲染。

**优化：** 将 `loadPreset(1)` 从 `onLoad` 移到 `onReady`。页面先渲染空状态（输入区域可见），首次绘制完成后再触发构造。用户感知页面立刻出现。

**Files:**
- Modify: `pages/regex-dfa/regex-dfa.js`

**Interfaces:**
- Consumes: `onLoad()`, `onReady()` — 微信生命周期，签名不变
- Produces: 同上

- [ ] **Step 1: 修改 onLoad，只做轻量初始化**

```js
onLoad: function() {
  // 只检查引导弹窗，不做正则构造
  let showIntro = false;
  try {
    showIntro = !wx.getStorageSync('intro_seen_regex_dfa');
  } catch(e) {}
  this.setData({ showRegexIntro: showIntro });
},

onReady: function() {
  // 首次绘制完成后，再触发正则构造
  this.loadPreset(1);
},
```

- [ ] **Step 2: 运行测试确认不破坏已有行为**

Run: `npm test`
Expected: 所有测试通过

- [ ] **Step 3: 验证页面的加载动画效果**

确认：进入 regex-dfa 页面时先看到输入框和标签页头，然后约 100ms 后 NFA/DFA 图出现

- [ ] **Step 4: Commit**

```bash
git add pages/regex-dfa/regex-dfa.js
git commit -m "perf: 将 Regex→DFA 首次构造从 onLoad 延迟到 onReady, 不阻塞首次渲染"
```

---

### Task 3: 添加导航加载动画（兜底）

**问题：** 即使在 DH-viz 和 regex-dfa 优化后，部分工具或因主包体积（首页 13 个页面 JS 共 ~146KB）导致导航有短暂白屏。

**优化：** 在首页 `onToolTap` / `onIntroEnter` 导航时显示 `wx.showLoading`，并在目标页面 `onLoad` 完成后关闭。如果加载超过 300ms 才显示 loading，避免一闪而过。

**Files:**
- Modify: `pages/index/index.js`

- [ ] **Step 1: 在点击导航时显示 loading**

在 `onToolTap` 中导航前：
```js
// 显示加载提示（定时器：300ms 后才真正显示，避免闪一下）
const loadingTimer = setTimeout(function() {
  wx.showLoading({ title: '加载中...', mask: true });
}, 300);
```

在 `onIntroEnter` 中导航前：
```js
const loadingTimer = setTimeout(function() {
  wx.showLoading({ title: '加载中...', mask: true });
}, 300);
```

- [ ] **Step 2: 确认加载动画正常**

需要在目标页面 `onReady` 中关闭 loading。但为了不影响其他页面，更好的做法是用一个全局标记 + app 级别的 onPageNotFound/onAppShow 处理。

更简单的方式：在 `wx.navigateTo` 的 `complete` 回调中关闭 loading，因为 navigateTo 完成后页面已经加载。

```js
wx.navigateTo({
  url: tool.route,
  complete: function() {
    clearTimeout(loadingTimer);
    wx.hideLoading();
  }
});
```

- [ ] **Step 3: 运行测试**

Run: `npm test`
Expected: 所有测试通过

- [ ] **Step 4: Commit**

```bash
git add pages/index/index.js
git commit -m "feat: 首页导航时添加加载动画兜底, 300ms 延迟避免闪烁"
```

---

### Task 4: 全面验证

- [ ] **Step 1: 运行全量测试**

Run: `npm test`
Expected: 全绿

- [ ] **Step 2: 代码审查**

CLAUDE.md D5 要求完成前验证。检查所有改动是否符合编码风格（纯函数 + 不可变）。

- [ ] **Step 3: `git status` 确认无遗留改动**

```bash
git status
```

- [ ] **Step 4: 记录 handoff**

把本次优化更新追加到 `.claude/HANDOFF.md`。
