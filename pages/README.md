# Pages

[English](README_EN.md)

小程序页面目录，每个子目录对应一个页面，包含 `.js` / `.wxml` / `.wxss` / `.json` 四个文件。

## 页面列表（共 13 个）

| 页面 | 路径 | 说明 |
|---|---|---|
| 首页 / 工具箱 | `index/` | 品牌区、Hero 卡片、功能入口卡片、快捷入口 |
| 试卷列表 | `quiz-list/` | 已导入试卷列表、导入新试卷入口 |
| 导入预览 | `import-preview/` | 确认导入：题型统计、题目预览 |
| 刷题 | `quiz/` | 一题一页，支持练习和考试两种模式 |
| 交卷结果 | `result/` | 正确率、每题详情、时间统计 |
| 答题记录 | `records/` | 历史答题记录列表 |
| 记录详情 | `record-detail/` | 单次作答的完整详情 |
| 错题本 | `wrong-questions/` | 错题汇总、错题重做入口 |
| 学习驾驶舱 | `dashboard/` | 学习统计、7 天趋势、智能建议 |
| 排序可视化 | `sort-viz/` | 排序算法动画演示 |
| 子网计算器 | `subnet-calc/` | IP/CIDR 计算、二进制可视化 |
| TCP 动画机 | `tcp-viz/` | TCP 状态机动画 |
| 数据结构可视化 | `ds-viz/` | BST、栈队列、哈希表、图搜索 |

## 页面间数据流动

```text
index（首页）
  ├─→ quiz-list（试卷列表）
  │     ├─→ import-preview（导入预览）
  │     └─→ quiz（开始刷题）
  │           └─→ result（交卷）├→ record-detail
  ├─→ records（答题记录）├→ record-detail├→ quiz（重做）
  ├─→ wrong-questions（错题本）├→ quiz（错题重做）
  ├─→ dashboard / sort-viz / subnet-calc / tcp-viz / ds-viz（直接入口）
```

## 约定

- 页面间数据通过 `wx.setStorageSync('key', data)` 传递
- 页面逻辑尽量抽到 `utils/`，页面只负责生命周期和 UI 绑定
- 设计风格遵循 Claude Design 暖奶油画布

## 详细说明

各模块实现细节见 [`docs/handoff/modules/`](../docs/handoff/modules/)：

- `quiz.md` 刷题主链路
- `dashboard.md` 学习驾驶舱
- `subnet-calc.md` 子网计算器
- `tcp-viz.md` TCP 状态机动画
- `ds-viz.md` 数据结构可视化
- `sort-viz.md` 排序可视化

架构全局见 [`docs/handoff/architecture.md`](../docs/handoff/architecture.md)。
