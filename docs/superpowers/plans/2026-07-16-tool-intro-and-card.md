# 工具介绍页 & 首页卡片重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 7 个已上线硬核工具添加居中模态介绍弹窗（首次访问展示，后续直接进入），同时将首页 & 工具大全页的工具卡片放大并展示 tagline、标签、难度等级。

**Architecture:** 两个独立分支并行推进：(1) intro-modal 自定义组件 + 首次访问 wx.setStorageSync 标记 + 工具页 ℹ︎ 回看入口；(2) tool-registry 扩展数据字段 + 首页/工具大全页 WXML/WXSS 重设计。

**Tech Stack:** 微信小程序原生框架（WXML + WXSS + JS），自定义组件，wx.setStorageSync 本地存储。

## Global Constraints

- 不修改刷题链路、dashboard、存储层、测试文件
- 不修改 `app.json` 页面注册（无新页面）
- 不改 `utils/tool-registry.js` 的导出函数签名（只加数据字段）
- 不改现有工具页面的核心功能（只加 ℹ︎ 按钮）
- 遵循 Claude Design 暖奶油画布风格：背景 #faf9f5，卡片/模态背景 #efe9de，主色 #cc785c，正文字色 #141413，次要文字 #6c6a64，Georgia 衬线标题
- `npm test` 必须在每一步前后保持全绿

---

### Task 1: Extend tool-registry.js — 7 个工具新增 tagline / tags / difficulty / intro 数据

**Files:**
- Modify: `utils/tool-registry.js` — 7 条工具记录各新增 4 个字段 + 1 个辅助函数

**Interfaces:**
- Produces: 7 条工具记录新增 `tagline`(String), `tags`(String[]), `difficulty`(String), `intro`(Object) 字段；新增导出函数 `getDifficultyInfo(code)` → `{ label, stars }`

- [ ] **Step 1: 在 tool-registry.js 末尾添加辅助函数**

```js
// ── 难度等级映射 ──
const DIFFICULTY_MAP = {
  easy: { label: '简单', stars: '★☆☆' },
  medium: { label: '中等', stars: '★★☆' },
  advanced: { label: '进阶', stars: '★★★' }
};

/**
 * 获取难度等级的中文标签和星级显示
 * @param {'easy'|'medium'|'advanced'} code
 * @returns {{ label: string, stars: string }}
 */
function getDifficultyInfo(code) {
  return DIFFICULTY_MAP[code] || DIFFICULTY_MAP.medium;
}
```

- [ ] **Step 2: 在 module.exports 末尾追加导出**

```js
module.exports = {
  // ... 现有导出 ...
  getDifficultyInfo
};
```

- [ ] **Step 3: 给 `subnet-calc` 添加 intro 数据**

找到 `subnet-calc` 记录（约第 43 行），在 `order: 1` 后面插入：

```js
    tagline: 'IP 地址和子网掩码到底怎么算？一张图看明白',
    tags: ['#可视化', '#交互式'],
    difficulty: 'medium',
    intro: {
      valueProp: '子网划分是网络工程师的基本功，也是计网面试的必考题。',
      features: [
        '输入 IP 和前缀长度，实时计算网络号、广播地址、可用主机范围',
        '逐位展示二进制与十进制转换，理解 CIDR 编址原理',
        '完整显示子网掩码、通配符掩码、主机数量等关键信息'
      ],
      prerequisites: '了解 IP 地址和子网掩码的基本概念即可，无需深入二进制计算。',
      useCases: [
        '计网面试：子网划分、CIDR 相关题目练习',
        '网络排障：快速确认 IP 配置是否正确',
        '学习辅助：可视化位运算，理解「与」操作的含义'
      ]
    },
```

- [ ] **Step 4: 给 `tcp-viz` 添加 intro 数据**

```js
    tagline: '三次握手、四次挥手、丢包重传——TCP 的每个细节一看就懂',
    tags: ['#可视化', '#交互式', '#面试必考'],
    difficulty: 'medium',
    intro: {
      valueProp: 'TCP 是互联网的基石协议，也是面试中的高频考点。',
      features: [
        '动画演示三次握手与四次挥手的完整交互过程',
        '模拟数据传输与丢包重传机制',
        '直观展示 SEQ/ACK 号变化与状态迁移'
      ],
      prerequisites: '了解 TCP 是"面向连接的可靠传输协议"即可。',
      useCases: [
        '计网面试：TCP 连接管理、可靠传输相关题目',
        '学习辅助：直观理解状态机与序列号机制',
        '教学演示：向他人解释 TCP 工作原理'
      ]
    },
```

- [ ] **Step 5: 给 `dns-viz` 添加 intro 数据**

找到 `dns-viz` 记录，在 `order: 4` 后插入：

```js
    tagline: '输入一个域名，看 DNS 是怎么一步步找到它的服务器的',
    tags: ['#可视化', '#交互式'],
    difficulty: 'medium',
    intro: {
      valueProp: 'DNS 是互联网的"电话本"，理解它的工作原理是网络工程师的基本素养。',
      features: [
        '模拟完整递归查询过程：根→顶级域→权威服务器',
        '展示缓存机制如何加速域名解析',
        '支持普通查询、缓存命中、CNAME 链三种场景'
      ],
      prerequisites: '了解域名层级结构（如 .com → example.com）即可。',
      useCases: [
        '计网面试：DNS 递归/迭代查询相关题目',
        '排障辅助：理解 DNS 解析延迟的根源',
        '学习辅助：直观对比递归与迭代查询的差异'
      ]
    },
```

- [ ] **Step 6: 给 `sort-viz` 添加 intro 数据**

找到 `sort-viz` 记录，在 `order: 1` 后插入：

```js
    tagline: '选择排序、冒泡排序、快速排序——看动画理解每种算法的思路',
    tags: ['#可视化', '#交互式'],
    difficulty: 'easy',
    intro: {
      valueProp: '排序算法是数据结构与算法的入门必修课，理解它们的执行过程比背代码更重要。',
      features: [
        '三种排序算法的逐步骤动画演示',
        '可调速播放，看清每一步的比较与交换',
        '直观对比不同算法的时间复杂度与行为差异'
      ],
      prerequisites: '了解基本的数组概念即可，无需算法基础。',
      useCases: [
        '数据结构课程：排序算法章节的辅助学习工具',
        '面试准备：理解算法的时间复杂度与稳定性',
        '教学演示：向初学者解释排序的执行过程'
      ]
    },
```

- [ ] **Step 7: 给 `ds-viz` 添加 intro 数据**

找到 `ds-viz` 记录，在 `order: 2` 后插入：

```js
    tagline: 'BST 增删、栈队列、哈希表、图搜索——交互式探索每种结构的运作方式',
    tags: ['#可视化', '#交互式', '#面试必考'],
    difficulty: 'medium',
    intro: {
      valueProp: '数据结构是程序的骨架，理解它们的内部机制能帮你写出更高效的代码。',
      features: [
        '交互式操作 BST、栈队列、哈希表、图四种数据结构',
        '每一步操作后实时展示内部状态变化',
        '图搜索支持 BFS 与 DFS 的可视化对比'
      ],
      prerequisites: '了解树、栈、队列、哈希表、图的基本概念即可。',
      useCases: [
        '数据结构课程：理论知识的配套实操练习',
        '面试准备：复习各数据结构的核心操作',
        '学习辅助：建立数据结构的空间直觉'
      ]
    },
```

- [ ] **Step 8: 给 `bplus-viz` 添加 intro 数据**

找到 `bplus-viz` 记录，在 `order: 3` 后插入：

```js
    tagline: 'B+ 树是数据库索引的基石——调整阶数，观察节点如何分裂与合并',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: 'B+ 树是关系型数据库索引的核心数据结构，理解它对掌握数据库性能调优至关重要。',
      features: [
        '支持 4~32 阶可调，观察不同阶数下的树形变化',
        '插入操作时展示节点分裂的完整过程',
        '支持单key查询与范围查询的路径高亮'
      ],
      prerequisites: '建议先了解二叉搜索树（BST）的基本概念，熟悉"阶数"的含义。',
      useCases: [
        '数据库课程：索引原理章节的配套学习工具',
        '系统设计面试：加深对 B+ 树的理解',
        '学习辅助：可视化树形结构的平衡机制'
      ]
    },
```

- [ ] **Step 9: 给 `sha256-viz` 添加 intro 数据**

找到 `sha256-viz` 记录，在 `order: 4` 后插入：

```js
    tagline: '输入任意文本，逐轮追踪 SHA-256 如何将它变成不可逆的摘要',
    tags: ['#可视化', '#进阶'],
    difficulty: 'advanced',
    intro: {
      valueProp: 'SHA-256 是比特币和 HTTPS 的基石，理解它的压缩函数是理解密码学哈希的关键。',
      features: [
        '展示完整的 64 轮压缩函数运算过程',
        '雪崩效应对比：单 bit 差异如何扩散到整个摘要',
        '逐字节显示消息填充、初始向量、轮常数的变化'
      ],
      prerequisites: '了解哈希函数的基本概念（输入→固定长度摘要），熟悉十六进制表示法。',
      useCases: [
        '密码学课程：哈希函数章节的配套学习工具',
        '面试准备：理解 SHA-256 的内部工作机制',
        '学习辅助：直观感受雪崩效应与压缩函数的迭代过程'
      ]
    },
```

- [ ] **Step 10: 运行测试确认不破坏现有功能**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```
Expected: 全绿（新增数据字段不影响已有逻辑）

- [ ] **Step 11: Commit**

```bash
git add utils/tool-registry.js
git commit -m "feat: 为 7 个硬核工具添加 intro 介绍数据字段"
```

---

### Task 2: 创建 intro-modal 自定义组件

**Files:**
- Create: `components/intro-modal/intro-modal.js`
- Create: `components/intro-modal/intro-modal.wxml`
- Create: `components/intro-modal/intro-modal.wxss`
- Create: `components/intro-modal/intro-modal.json`

**Interfaces:**
- Consumes: `toolId`(String), `show`(Boolean) 属性；`registry.TOOLS`, `registry.getDifficultyInfo()` 数据
- Produces: `close` 事件 `{ toolId }`，`enter` 事件 `{ toolId }`

- [ ] **Step 1: 创建 `components/intro-modal/intro-modal.json`**

```json
{
  "component": true,
  "usingComponents": {}
}
```

- [ ] **Step 2: 创建 `components/intro-modal/intro-modal.js`**

```js
const registry = require('../../utils/tool-registry');

Component({
  properties: {
    toolId: {
      type: String,
      value: '',
      observer: '_loadToolData'
    },
    show: {
      type: Boolean,
      value: false,
      observer: '_onShowChange'
    }
  },

  data: {
    tool: null,
    toolData: null,
    difficultyLabel: '',
    difficultyStars: '',
    animClass: ''
  },

  methods: {
    _loadToolData(toolId) {
      if (!toolId) return;
      const tool = registry.TOOLS.find(function(t) { return t.id === toolId; });
      if (!tool || !tool.intro) return;

      const diff = registry.getDifficultyInfo(tool.difficulty);
      this.setData({
        tool: tool,
        toolData: tool.intro,
        difficultyLabel: diff.label,
        difficultyStars: diff.stars
      });
    },

    _onShowChange(show) {
      if (show) {
        // 触发入场动画
        const self = this;
        self.setData({ animClass: '' });
        setTimeout(function() {
          self.setData({ animClass: 'modal-visible' });
        }, 30);
      } else {
        this.setData({ animClass: '' });
      }
    },

    onClose() {
      this.triggerEvent('close', { toolId: this.properties.toolId });
    },

    onMaskTap() {
      this.onClose();
    },

    onEnter() {
      this.triggerEvent('enter', { toolId: this.properties.toolId });
    },

    _noop() {
      // 阻止遮罩层点击穿透到内容区
    }
  }
});
```

- [ ] **Step 3: 创建 `components/intro-modal/intro-modal.wxml`**

```html
<view class="modal-mask {{animClass}}" wx:if="{{show}}" bindtap="onMaskTap">
  <view class="modal-card {{animClass}}" catchtap="_noop">

    <!-- 关闭按钮 -->
    <view class="modal-close" bindtap="onClose">
      <text class="close-icon">✕</text>
    </view>

    <!-- 内容区域（滚动） -->
    <scroll-view class="modal-body" scroll-y>

      <!-- 工具名称 -->
      <text class="modal-tool-name">{{tool.name || ''}}</text>

      <!-- tagline -->
      <text class="modal-tagline" wx:if="{{tool.tagline}}">{{tool.tagline}}</text>

      <!-- valueProp -->
      <text class="modal-value-prop" wx:if="{{toolData.valueProp}}">{{toolData.valueProp}}</text>

      <!-- 功能列表 -->
      <view class="modal-section" wx:if="{{toolData.features && toolData.features.length > 0}}">
        <text class="modal-section-title">功能</text>
        <view class="modal-list">
          <view class="modal-list-item" wx:for="{{toolData.features}}" wx:key="*this">
            <text class="modal-bullet">•</text>
            <text class="modal-item-text">{{item}}</text>
          </view>
        </view>
      </view>

      <!-- 前置知识 -->
      <view class="modal-section" wx:if="{{toolData.prerequisites}}">
        <text class="modal-section-title">前置知识</text>
        <text class="modal-section-body">{{toolData.prerequisites}}</text>
      </view>

      <!-- 适合场景 -->
      <view class="modal-section" wx:if="{{toolData.useCases && toolData.useCases.length > 0}}">
        <text class="modal-section-title">适合场景</text>
        <view class="modal-list">
          <view class="modal-list-item" wx:for="{{toolData.useCases}}" wx:key="*this">
            <text class="modal-bullet">•</text>
            <text class="modal-item-text">{{item}}</text>
          </view>
        </view>
      </view>

    </scroll-view>

    <!-- CTA 按钮 -->
    <view class="modal-footer">
      <view class="modal-btn" bindtap="onEnter" hover-class="modal-btn-hover">
        <text class="modal-btn-text">开始体验 →</text>
      </view>
      <text class="modal-hint">下次进入将直接打开工具</text>
    </view>

  </view>
</view>
```

- [ ] **Step 4: 创建 `components/intro-modal/intro-modal.wxss`**

```css
/* ── 遮罩层 ── */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  transition: opacity 200ms ease;
}
.modal-mask.modal-visible {
  opacity: 1;
}

/* ── 弹窗卡片 ── */
.modal-card {
  width: 560rpx;
  max-height: 85vh;
  background: #efe9de;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  transform: scale(0.9);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-card.modal-visible {
  transform: scale(1);
}

/* ── 关闭按钮 ── */
.modal-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.close-icon {
  font-size: 28rpx;
  color: #6c6a64;
  line-height: 1;
}

/* ── 内容区域 ── */
.modal-body {
  padding: 40rpx 36rpx 0;
  max-height: 60vh;
  overflow-y: auto;
  box-sizing: border-box;
}

/* ── 工具名 ── */
.modal-tool-name {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16rpx;
  font-weight: 400;
  color: #6c6a64;
  margin-bottom: 12rpx;
}

/* ── tagline ── */
.modal-tagline {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 28rpx;
  font-weight: 700;
  color: #141413;
  line-height: 1.4;
  margin-bottom: 16rpx;
}

/* ── valueProp ── */
.modal-value-prop {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 14rpx;
  font-weight: 400;
  color: #141413;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

/* ── 区块 ── */
.modal-section {
  margin-bottom: 20rpx;
}
.modal-section-title {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 12rpx;
  font-weight: 600;
  color: #cc785c;
  letter-spacing: 1rpx;
  text-transform: uppercase;
  margin-bottom: 8rpx;
}
.modal-section-body {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14rpx;
  font-weight: 400;
  color: #141413;
  line-height: 1.6;
}

/* ── 列表 ── */
.modal-list {
  display: flex;
  flex-direction: column;
}
.modal-list-item {
  display: flex;
  flex-direction: row;
  margin-bottom: 4rpx;
}
.modal-bullet {
  font-size: 14rpx;
  color: #cc785c;
  margin-right: 8rpx;
  line-height: 1.8;
}
.modal-item-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14rpx;
  color: #141413;
  line-height: 1.8;
  flex: 1;
}

/* ── 底部 ── */
.modal-footer {
  padding: 20rpx 36rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-btn {
  width: 100%;
  height: 88rpx;
  background: #cc785c;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}
.modal-btn-hover {
  background: #a9583e;
}
.modal-btn-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}
.modal-hint {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 12rpx;
  color: #6c6a64;
}
```

- [ ] **Step 5: 创建目录**

```bash
mkdir -p /Users/charliepan/Downloads/my-miniapp/components/intro-modal
```

- [ ] **Step 6: Commit**

```bash
git add components/intro-modal/
git commit -m "feat: 创建 intro-modal 工具介绍模态弹窗组件"
```

---

### Task 3: app.json 全局注册 intro-modal 组件

**Files:**
- Modify: `app.json`

- [ ] **Step 1: 在 app.json 中添加 usingComponents**

找到 `app.json` 末尾的 `}` 之前，添加：

```json
  "usingComponents": {
    "intro-modal": "/components/intro-modal/intro-modal"
  }
```

注意：如果 `app.json` 中已有 `usingComponents`，在已有对象中添加条目。

- [ ] **Step 2: Commit**

```bash
git add app.json
git commit -m "feat: 全局注册 intro-modal 组件"
```

---

### Task 4: 首页（index）— 模态导航逻辑 + 卡片重设计

**Files:**
- Modify: `pages/index/index.js` — onToolTap 首次判断 + onIntroEnter/onIntroClose
- Modify: `pages/index/index.wxml` — 添加 intro-modal 标签 + 卡片模板改版
- Modify: `pages/index/index.wxss` — 新卡片样式

- [ ] **Step 1: 修改 index.js — 引入 modal 逻辑**

在 `onToolTap` 方法中增加首次访问判断：

```js
  onToolTap(e) {
    const id = e.currentTarget.dataset.id;
    const available = e.currentTarget.dataset.available;

    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }

    const tool = registry.TOOLS.find(function(t) { return t.id === id; });
    if (!tool || !tool.route) return;

    // ★ 首次访问：展示介绍模态弹窗
    if (tool.intro) {
      const seen = wx.getStorageSync('intro_v2_' + id);
      if (!seen) {
        this.setData({ pendingToolId: id, showIntro: true });
        return;
      }
    }

    wx.navigateTo({ url: tool.route });
  },

  // ★ 新增：点「开始体验」
  onIntroEnter(e) {
    const toolId = e.detail.toolId;
    const tool = registry.TOOLS.find(function(t) { return t.id === toolId; });
    wx.setStorageSync('intro_v2_' + toolId, true);
    this.setData({ showIntro: false, pendingToolId: null });
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  },

  // ★ 新增：关闭模态
  onIntroClose() {
    this.setData({ showIntro: false, pendingToolId: null });
  },
```

- [ ] **Step 2: 修改 index.wxml — 添加 intro-modal + 卡片改版**

在文件末尾（`</view>` 闭合前）添加 intro-modal 使用：

```html
  <!-- ═══ 工具介绍模态弹窗 ═══ -->
  <intro-modal
    toolId="{{pendingToolId}}"
    show="{{showIntro}}"
    bind:close="onIntroClose"
    bind:enter="onIntroEnter"
  />
```

修改卡片模板（约第 44-58 行，`tool-card` 内的内容）：

将原有的：
```html
          <view
            class="tool-card"
            wx:for="{{section.tools}}"
            wx:key="id"
            wx:for-item="tool"
            data-id="{{tool.id}}"
            data-available="true"
            bindtap="onToolTap"
            hover-class="tool-hover"
            hover-stay-time="100"
          >
            <text class="tool-name">{{tool.name}}</text>
            <text class="tool-desc">{{tool.description}}</text>
            <text class="tool-link">进入 →</text>
          </view>
```

替换为：
```html
          <view
            class="tool-card"
            wx:for="{{section.tools}}"
            wx:key="id"
            wx:for-item="tool"
            data-id="{{tool.id}}"
            data-available="true"
            bindtap="onToolTap"
            hover-class="tool-hover"
            hover-stay-time="100"
          >
            <text class="tool-name">{{tool.name}}</text>
            <text class="tool-tagline">{{tool.tagline || tool.description}}</text>
            <view class="tool-meta-row" wx:if="{{tool.tags && tool.tags.length > 0}}">
              <view class="tool-tags">
                <text class="tool-tag-item" wx:for="{{tool.tags}}" wx:key="*this">{{item}}</text>
              </view>
              <text class="tool-difficulty" wx:if="{{tool.difficulty}}">
                {{getDiffStars(tool.difficulty)}} {{getDiffLabel(tool.difficulty)}}
              </text>
            </view>
            <text class="tool-link">进入 →</text>
          </view>
```

同样修改单一分类视图下的卡片（约第 88-102 行），替换方式同上。

- [ ] **Step 3: 修改 index.js — 添加模板辅助函数**

在 `Page({` 内部、`data` 之后添加两个辅助方法（供 WXML 调用）：

```js
  // 微信小程序 WXML 不支持直接调函数，需要先在 JS 中预计算
  // 实际在 _buildAllViewData 中预处理时附带难度展示信息
```

修改 `_buildAllViewData` 方法，在返回前给每个工具附上难度展示字段：

```js
  _buildAllViewData(activeCategories) {
    const self = this;
    return activeCategories.map(function(cat) {
      const featured = registry.getFeaturedToolsByCategory(cat.id, 4);
      let tools;
      if (featured.length === 0) {
        tools = registry.getToolsByCategory(cat.id).filter(function(t) { return t.available; });
      } else {
        tools = featured;
      }

      const previews = registry.getToolsByCategory(cat.id).filter(function(t) { return !t.available; }).slice(0, 2);

      // ★ 预处理难度显示字段
      const enrichedTools = tools.map(function(t) {
        return self._enrichTool(t);
      });

      return {
        category: cat,
        tools: enrichedTools.slice(0, 4),
        previews: previews
      };
    });
  },

  // ★ 新增：为工具对象补充难度展示字段
  _enrichTool(tool) {
    if (!tool.difficulty) return tool;
    const info = registry.getDifficultyInfo(tool.difficulty);
    return Object.assign({}, tool, {
      _diffStars: info.stars,
      _diffLabel: info.label
    });
  },
```

然后在 `onCategoryTap` 的回调中也做同样处理，对 `availableTools` 进行 enrich。将现有 `onCategoryTap` 整体替换为：

```js
  onCategoryTap(e) {
    const self = this;
    const categoryId = e.currentTarget.dataset.id;
    let currentTools = [];
    let availableTools = [];
    let unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter(function(t) { return t.available; });
      unavailableTools = currentTools.filter(function(t) { return !t.available; });
      // ★ 为可用工具补充难度显示字段
      availableTools = availableTools.map(function(t) { return self._enrichTool(t); });
    }

    this.setData({
      activeCategory: categoryId,
      currentTools: currentTools,
      availableTools: availableTools,
      unavailableTools: unavailableTools
    });
  },
```

（注意添加 `const self = this;` 在函数顶部。）

更新 WXML 中困难度部分使用 `_diffStars` 和 `_diffLabel`：

```html
              <text class="tool-difficulty" wx:if="{{tool.difficulty}}">
                {{tool._diffStars}} {{tool._diffLabel}}
              </text>
```

- [ ] **Step 4: 修改 index.wxss — 新卡片样式**

在 `.tool-card` 样式后调整 / 追加样式：

```css
/* ── 大卡片 —— 替换原 tool-card 样式 ── */
.tool-card {
  flex: 0 0 48%;
  margin-bottom: 20rpx;
  background: #efe9de;
  border-radius: 24rpx;
  padding: 28rpx 24rpx 20rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

/* ── tagline 替代原 description ── */
.tool-tagline {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20rpx;
  font-weight: 400;
  color: #6c6a64;
  line-height: 1.4;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ── 元信息行：标签 + 难度 ── */
.tool-meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

/* ── 标签列表 ── */
.tool-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6rpx;
}
.tool-tag-item {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18rpx;
  font-weight: 400;
  color: #6c6a64;
  background: #faf9f5;
  border: 1rpx solid #d0ccc0;
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
  line-height: 1.4;
}

/* ── 难度标签 ── */
.tool-difficulty {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18rpx;
  font-weight: 400;
  color: #8e8b82;
  line-height: 1.4;
  flex-shrink: 0;
}
```

保留原有 `.tool-name` 样式不变。删除原有的 `.tool-desc` 样式（被 `.tool-tagline` 替代）。

- [ ] **Step 5: 运行测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```
Expected: 全绿

- [ ] **Step 6: Commit**

```bash
git add pages/index/index.js pages/index/index.wxml pages/index/index.wxss
git commit -m "feat: 首页添加模态导航逻辑并放大工具卡片"
```

---

### Task 5: 工具大全页（tools-all）— 模态导航逻辑 + 卡片重设计

**Files:**
- Modify: `pages/tools-all/tools-all.js` — onToolTap 首次判断 + 数据 enrich
- Modify: `pages/tools-all/tools-all.wxml` — 添加 intro-modal + 卡片改版
- Modify: `pages/tools-all/tools-all.wxss` — 新卡片样式

- [ ] **Step 1: 修改 tools-all.js**

在 `onToolTap` 中增加首次访问判断，并导入 registry：

```js
  onToolTap(e) {
    const id = e.currentTarget.dataset.id;
    const available = e.currentTarget.dataset.available;

    if (!available) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }

    const tool = registry.TOOLS.find(function(t) { return t.id === id; });
    if (!tool || !tool.route) return;

    // ★ 首次访问：展示介绍模态弹窗
    if (tool.intro) {
      const seen = wx.getStorageSync('intro_v2_' + id);
      if (!seen) {
        this.setData({ pendingToolId: id, showIntro: true });
        return;
      }
    }

    wx.navigateTo({ url: tool.route });
  },

  // ★ 新增
  onIntroEnter(e) {
    const toolId = e.detail.toolId;
    const tool = registry.TOOLS.find(function(t) { return t.id === toolId; });
    wx.setStorageSync('intro_v2_' + toolId, true);
    this.setData({ showIntro: false, pendingToolId: null });
    if (tool && tool.route) {
      wx.navigateTo({ url: tool.route });
    }
  },

  // ★ 新增
  onIntroClose() {
    this.setData({ showIntro: false, pendingToolId: null });
  },
```

添加 enrich 辅助方法：

```js
  // ★ 新增
  _enrichTool(tool) {
    if (!tool.difficulty) return tool;
    const info = registry.getDifficultyInfo(tool.difficulty);
    return Object.assign({}, tool, {
      _diffStars: info.stars,
      _diffLabel: info.label
    });
  },
```

在 `_buildAllSections` 中对工具进行 enrich：

```js
  _buildAllSections(categories) {
    const self = this;
    return categories.map(function(cat) {
      const allTools = registry.getToolsByCategory(cat.id);
      const enrichedTools = allTools.map(function(t) { return self._enrichTool(t); });
      return {
        category: cat,
        tools: enrichedTools
      };
    });
  },
```

在 `onCategoryTap` 中也对 availableTools 做 enrich：

```js
  onCategoryTap(e) {
    const self = this;
    const categoryId = e.currentTarget.dataset.id;
    let currentTools = [];
    let availableTools = [];
    let unavailableTools = [];

    if (categoryId !== 'all') {
      currentTools = registry.getToolsByCategory(categoryId);
      availableTools = currentTools.filter(function(t) { return t.available; }).map(function(t) { return self._enrichTool(t); });
      unavailableTools = currentTools.filter(function(t) { return !t.available; });
    }

    this.setData({
      activeCategory: categoryId,
      currentTools: currentTools,
      availableTools: availableTools,
      unavailableTools: unavailableTools
    });
  },
```

- [ ] **Step 2: 修改 tools-all.wxml**

在文件末尾 `</view>` 前添加 intro-modal：

```html
  <!-- ═══ 工具介绍模态弹窗 ═══ -->
  <intro-modal
    toolId="{{pendingToolId}}"
    show="{{showIntro}}"
    bind:close="onIntroClose"
    bind:enter="onIntroEnter"
  />
```

修改卡片模板（将原有 tool-desc 替换为 tool-tagline，添加 meta-row）：

替换：
```html
          <text class="tool-name">{{tool.name}}</text>
          <text class="tool-desc">{{tool.description}}</text>
```
为：
```html
          <text class="tool-name">{{tool.name}}</text>
          <text class="tool-tagline">{{tool.tagline || tool.description}}</text>
          <view class="tool-meta-row" wx:if="{{tool.tags && tool.tags.length > 0}}">
            <view class="tool-tags">
              <text class="tool-tag-item" wx:for="{{tool.tags}}" wx:key="*this">{{item}}</text>
            </view>
            <text class="tool-difficulty" wx:if="{{tool.difficulty}}">
              {{tool._diffStars}} {{tool._diffLabel}}
            </text>
          </view>
```

- [ ] **Step 3: 修改 tools-all.wxss**

调整卡片相关样式（与 index.wxss 一致）：

追加：
```css
/* ── tagline ── */
.tool-tagline {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20rpx;
  font-weight: 400;
  color: #6c6a64;
  line-height: 1.4;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ── 元信息行 ── */
.tool-meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

/* ── 标签列表 ── */
.tool-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6rpx;
}
.tool-tag-item {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18rpx;
  font-weight: 400;
  color: #6c6a64;
  background: #faf9f5;
  border: 1rpx solid #d0ccc0;
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
  line-height: 1.4;
}

/* ── 难度标签 ── */
.tool-difficulty {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18rpx;
  font-weight: 400;
  color: #8e8b82;
  line-height: 1.4;
  flex-shrink: 0;
}
```

- [ ] **Step 4: 运行测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```
Expected: 全绿

- [ ] **Step 5: Commit**

```bash
git add pages/tools-all/
git commit -m "feat: 工具大全页添加模态导航逻辑并放大卡片"
```

---

### Task 6: 7 个工具页面添加 ℹ︎ 回看入口

**Files:**
- Modify: `pages/subnet-calc/subnet-calc.wxml` + `subnet-calc.js`
- Modify: `pages/tcp-viz/tcp-viz.wxml` + `tcp-viz.js`
- Modify: `pages/dns-viz/dns-viz.wxml` + `dns-viz.js`
- Modify: `pages/sort-viz/sort-viz.wxml` + `sort-viz.js`
- Modify: `pages/ds-viz/ds-viz.wxml` + `ds-viz.js`
- Modify: `pages/bplus-viz/bplus-viz.wxml` + `bplus-viz.js`
- Modify: `pages/sha256-viz/sha256-viz.wxml` + `sha256-viz.js`

- [ ] **Step 1a: 修改 subnet-calc.js**

在 Page 的 data 中添加：

```js
    toolId: 'subnet-calc',
    showIntro: false,
```

添加三个方法：

```js
  showIntro() {
    this.setData({ showIntro: true });
  },
  onIntroClose() {
    this.setData({ showIntro: false });
  },
  onIntroEnter() {
    // 已在工具页内，关闭模态即可
    this.setData({ showIntro: false });
  },
```

- [ ] **Step 1b: 修改 subnet-calc.wxml**

在文件顶部 `<view class="page">` 后立即添加：

```html
  <!-- 工具介绍入口 -->
  <view class="info-btn" bindtap="showIntro">
    <text class="info-btn-icon">ℹ︎</text>
  </view>

  <!-- 模态弹窗 -->
  <intro-modal
    toolId="{{toolId}}"
    show="{{showIntro}}"
    bind:close="onIntroClose"
    bind:enter="onIntroEnter"
  />
```

- [ ] **Step 2: 修改 subnet-calc.wxss**

在文件末尾追加：

```css
/* ── ℹ︎ 介绍按钮 ── */
.info-btn {
  position: fixed;
  top: 16rpx;
  right: 16rpx;
  width: 56rpx;
  height: 56rpx;
  background: #efe9de;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0.8;
}
.info-btn:active {
  opacity: 0.5;
}
.info-btn-icon {
  font-size: 28rpx;
  color: #6c6a64;
}
```

- [ ] **Step 3: 重复上述修改到其余 6 个工具页**

对以下每个工具页，重复 Step 1a、1b、2：

3a. `pages/tcp-viz/tcp-viz.js` — `toolId: 'tcp-viz'`
3b. `pages/dns-viz/dns-viz.js` — `toolId: 'dns-viz'`
3c. `pages/sort-viz/sort-viz.js` — `toolId: 'sort-viz'`
3d. `pages/ds-viz/ds-viz.js` — `toolId: 'ds-viz'`
3e. `pages/bplus-viz/bplus-viz.js` — `toolId: 'bplus-viz'`
3f. `pages/sha256-viz/sha256-viz.js` — `toolId: 'sha256-viz'`

每个工具页的 .wxml + .wxss 修改内容与 subnet-calc 完全一致（ℹ︎ 按钮 + intro-modal 标签 + info-btn 样式）。

- [ ] **Step 4: 运行测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```
Expected: 全绿

- [ ] **Step 5: Commit**

```bash
git add pages/subnet-calc/ pages/tcp-viz/ pages/dns-viz/ pages/sort-viz/ pages/ds-viz/ pages/bplus-viz/ pages/sha256-viz/
git commit -m "feat: 7 个工具页添加 ℹ︎ 介绍回看入口"
```

---

### 最终验证

- [ ] **运行全量测试**

```bash
cd /Users/charliepan/Downloads/my-miniapp && npm test
```
Expected: 全绿

- [ ] **更新 PROJECT_HANDOFF.md**

在 `PROJECT_HANDOFF.md` 的「最近重大变更」部分追加本次变更记录。
