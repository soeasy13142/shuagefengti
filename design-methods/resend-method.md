# Resend 设计方案 → 刷个冯题 实施方法论

> 参考来源：.claude/skills/resend-design.md
> 适用项目：刷个冯题（微信小程序学习工具箱）
> 生成时间：2026-06-15

---

## 1. 原方案核心提取

### 1.1 设计哲学
Resend 的设计语言是"拥有印刷杂志排版的开发者工具"——纯黑画布（#000000）上用 96px 衬线 Domaine Display 标题创造自信、沉稳、略带文学气质的品牌调性。系统的核心矛盾是：工具属性（技术、功能导向）与编辑气质（大衬线标题、宽松留白）的并存。品牌最强视觉签名是**白底 CTA 按钮在纯黑画布上的反差**——白色成为最亮的像素，橙色/蓝色/绿色仅作为低透明度 atmospheric glow 装饰。

### 1.2 视觉 DNA
- 纯黑画布 #000000，非近黑
- 白色文字 #fcfdff（微微偏蓝冷调）
- 衬线显示标题 76-96px，lineHeight 1.0，OpenType 特性
- 白色 pill CTA 是页面最亮元素
- 六色 atmospheric glow（橙、黄、蓝、绿、红）仅用于低透明度背景装饰
- 12px 圆角卡片 + 8px 圆角按钮
- 半透明白色 hairline 边框取代阴影
- 代码窗口带三色交通灯圆点

### 1.3 色彩策略
- 画布：#000000（纯黑）
- 卡片：#0a0a0c（微亮于画布）
- 提升面：#101012
- 深层：#06060a（代码窗口）
- 主色/CTA：#fcfdff（白色）
- 文字：#fcfdff / rgba(252,253,255,0.86) / rgba(252,253,255,0.7)
- 次要文字：#a1a4a5 / #888e90
- hairline：rgba(255,255,255,0.06) / rgba(255,255,255,0.14)
- atmospheric glow：橙 #ff801f / 蓝 #3b9eff / 绿 #11ff99 / 红 #ff2047 / 黄 #ffc53d
- 链接：#3b9eff

### 1.4 字体策略
- 显示：Domaine Display，96/76.8px，weight 400，ss01/ss04/ss11
- 正文营销：ABC Favorit，16/20px，weight 400
- UI/按钮：Inter，14/12px，weight 500
- 代码：Geist Mono，13px，weight 400

### 1.5 布局与组件模式
- 圆角：按钮 8px（md），卡片 12px（lg），pill 9999px
- 间距基数 4px，section 96px，band 128px
- 最大内容宽度 1200px
- 深度语言：零阴影，半透明白色 hairline 边框
- atmospheric glow：低透明度径向渐变锚定在 section 顶部
- 代码窗口三色交通灯（红/黄/绿圆点）

---

## 2. 适配分析：哪些能用、哪些不能用

### 2.1 可直接迁移的设计决策
- **零阴影 + hairline 边框深度策略**：与本项目完全一致
- **三字体分层理念**：显示衬线 + 正文无衬线 + 代码等宽
- **紧凑圆角（8-12px）**：比全圆角更克制，适合工具类应用
- **白色 CTA 在深色背景上的反差逻辑**：可借鉴用于深色主题场景
- **代码窗口样式**：深色背景 + 交通灯装饰适合代码题目展示

### 2.2 需要改造的设计决策
- **纯黑画布 #000000**：与本项目暖奶油画布 #faf9f5 完全相反，仅在深色局部区域借鉴
- **白底 CTA**：改为珊瑚色 #cc785c 保持暖调一致性
- **atmospheric glow 装饰**：小程序中简化为暖色调柔和渐变
- **96px 显示标题**：小程序屏幕有限，最大 64rpx
- **代码窗口交通灯**：保留装饰但简化实现

### 2.3 不可迁移的设计决策
- **Domaine Display / ABC Favorit 自定义字体**：微信小程序不支持
- **Geist Mono**：用系统等宽字体替代
- **纯黑画布全页风格**：与暖奶油画布冲突，仅局部借鉴
- **OpenType ss01/ss04/ss11 特性**：小程序不支持
- **6 色 atmospheric glow 全页装饰**：小程序性能和风格限制

---

## 3. 具体实施方法

### 3.1 色彩映射表

| 原方案角色 | 原色值 | 本项目对应色值 | 说明 |
|---|---|---|---|
| Canvas（画布） | #000000 | #181715 | 仅深色局部使用 |
| Surface Card | #0a0a0c | #232220 | 深色卡片 |
| Surface Elevated | #101012 | #2a2927 | |
| Surface Deep（代码） | #06060a | #181715 | 深海军蓝 |
| Primary/CTA | #fcfdff | #cc785c | 珊瑚色（暖化） |
| Ink（文字） | #fcfdff | #faf9f5 | 本项目深色文字 |
| Body | rgba(252,253,255,0.86) | rgba(250,249,245,0.86) | |
| Charcoal | rgba(252,253,255,0.7) | rgba(250,249,245,0.7) | |
| Mute | #a1a4a5 | #9a9890 | |
| Hairline | rgba(255,255,255,0.06) | rgba(250,249,245,0.08) | |
| Hairline Strong | rgba(255,255,255,0.14) | rgba(250,249,245,0.15) | |
| Accent Glow Orange | rgba(255,89,0,0.22) | rgba(204,120,92,0.15) | 暖化 |
| Accent Glow Blue | rgba(0,117,255,0.34) | rgba(59,158,255,0.2) | 保留 |
| Accent Green | #11ff99 | #2b9a66 | 成功色 |
| Link | #3b9eff | #3b9eff | 保留蓝色链接 |

### 3.2 字体映射

| 层级 | 原方案 | 本项目 WXSS | 说明 |
|---|---|---|---|
| Hero 标题 | 96px/400/-0.96px | 64rpx/400/-3rpx | Georgia 衬线 |
| Section 标题 | 76.8px/400/-0.768px | 48rpx/400/-2rpx | |
| Sub 标题 | 56px/400/-2.8px | 40rpx/400/-1rpx | |
| 卡片标题 | 24px/500/-0.4px | 32rpx/600 | |
| 正文 | 16px/400 | 28rpx/400 | |
| 按钮 | 14px/500 | 26rpx/500 | |
| 代码 | 13px/400 mono | 24rpx/400 | Courier New |
| 标签 | 12px/400 | 22rpx/400 | |

### 3.3 组件设计规范

**深色代码窗口（带交通灯）**
- 背景：#181715
- 文字：rgba(250,249,245,0.86)
- 圆角：24rpx
- 内边距：48rpx
- 顶部：3 个 16rpx 圆点（红 #ff2047 / 黄 #ffc53d / 绿 #2b9a66）
- 字体：'Courier New', Courier, monospace，24rpx

**深色功能卡片**
- 背景：#232220
- 文字：#faf9f5
- 圆角：24rpx
- 内边距：64rpx
- 1rpx rgba(250,249,245,0.15) 边框
- 无阴影

**深色 Hero 区**
- 背景：#181715
- 文字：#faf9f5
- 大标题 Georgia 衬线
- 下方带珊瑚色 atmospheric glow（淡化）

**CTA 按钮（深色场景）**
- 背景：#faf9f5（白色）
- 文字：#141413
- 圆角：16rpx
- 高度：72rpx
- 内边距：16rpx × 32rpx
- 小程序主场景下改为珊瑚色 CTA

**标签 Pill**
- 背景：rgba(250,249,245,0.1)
- 文字：#faf9f5
- 圆角：9999rpx
- 内边距：8rpx × 20rpx
- 字号：22rpx

**状态圆点**
- 尺寸：16rpx 圆形
- 成功：#2b9a66
- 错误：#ff2047
- 警告：#ffc53d

### 3.4 页面布局模板

**深色代码展示区（局部使用）**
- 背景：#181715 全宽
- 上下 64rpx
- 交通灯代码窗口居中
- 周围暖奶油画布形成强烈对比

**暖奶油主页面**
- 背景：#faf9f5
- 标题 Georgia 衬线
- 借鉴 Resend 的紧凑圆角（16rpx）和 hairline 边框

### 3.5 WXSS 实现示例

**代码窗口（带交通灯）**

```css
.code-window {
  background-color: #181715;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 1rpx solid rgba(250,249,245,0.15);
}
.code-window__traffic {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.code-window__dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}
.code-window__dot--red { background-color: #ff2047; }
.code-window__dot--yellow { background-color: #ffc53d; }
.code-window__dot--green { background-color: #2b9a66; }
.code-window__code {
  color: rgba(250,249,245,0.86);
  font-family: 'Courier New', Courier, monospace;
  font-size: 24rpx;
  line-height: 1.6;
}
```

**深色功能卡片**

```css
.card-dark {
  background-color: #232220;
  color: #faf9f5;
  border-radius: 24rpx;
  padding: 64rpx;
  border: 1rpx solid rgba(250,249,245,0.15);
}
```

**Atmospheric Glow 背景**

```css
.glow-section {
  position: relative;
  background-color: #181715;
}
.glow-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600rpx;
  height: 400rpx;
  background: radial-gradient(
    ellipse at center top,
    rgba(204,120,92,0.15) 0%,
    transparent 70%
  );
  pointer-events: none;
}
```

**状态圆点**

```css
.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  display: inline-block;
}
.status-dot--success { background-color: #2b9a66; }
.status-dot--error { background-color: #ff2047; }
.status-dot--warning { background-color: #ffc53d; }
```

---

## 4. 适用场景建议

### 4.1 最适合用在哪些页面
- **代码题目详情页**：深色代码窗口 + 交通灯装饰非常适合展示代码
- **学习报告深色主题**：借鉴 Resend 的深色局部区域设计
- **工具介绍页**：紧凑圆角 + hairline 边框的克制风格

### 4.2 不适合用在哪些页面
- **首页**：纯黑画布与暖奶油画布冲突
- **设置页**：深色主题过于沉重
- **错题本列表**：需要暖色调轻量感

### 4.3 混搭建议
- **深色代码窗口**作为代码题目的专属容器，在暖奶油页面中形成"岛屿"
- **紧凑圆角 16rpx**用于代码相关卡片，区别于暖奶油画布的 24rpx
- **atmospheric glow**仅在深色代码区使用，不扩展到暖奶油区域
- **交通灯圆点**作为代码窗口的装饰签名，不用于其他组件
- **hairline 边框**用于深色区域，暖奶油区域用 #e5dfd4 实线边框

---

## 5. 实施检查清单

- [ ] 深色代码窗口使用 #181715 背景 + 交通灯装饰
- [ ] 交通灯圆点 16rpx：红 #ff2047、黄 #ffc53d、绿 #2b9a66
- [ ] 深色区域文字使用 rgba(250,249,245,0.86)
- [ ] 深色卡片 24rpx 圆角 + hairline 边框
- [ ] atmospheric glow 仅用于深色局部区域
- [ ] 暖奶油页面保持 #faf9f5 画布
- [ ] CTA 按钮使用珊瑚色 #cc785c（非白色）
- [ ] 紧凑圆角 16rpx 用于代码相关元素
- [ ] 零阴影，仅 hairline/色块对比深度
- [ ] 所有尺寸用 rpx

---

## 6. 参考文件

- 原方案：.claude/skills/resend-design.md
- 当前设计系统：PROJECT_HANDOFF.md §25
- 全局样式：app.wxss
