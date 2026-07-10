# 排序可视化（Sort Visualization）

> 派生自 `PROJECT_HANDOFF.md` §7.14。

## 概览

提供三种排序算法的柱状图动画演示：选择 / 冒泡 / 快速。已切换至 Claude Design 暖奶油画布风格（参见 `docs/DESIGN.md`）。

## 输入与算法

- 用户输入：数字串（支持逗号、中文逗号、顿号分隔）
- 数字范围：1-99；数量 2-20
- 支持随机生成 5 / 10 / 15 / 20 个数
- 算法步骤生成器当前实现在 `pages/sort-viz/sort-viz.js`，**已知与测试代码重复**，参见 `risks.md` §r.3

## 步骤状态

```text
compare   → swap   → sorted   → pivot   → done
```

## UI 控制

播放 / 暂停 / 上一步 / 下一步 / 重置 / 调速；展示当前步骤描述、比较次数、交换次数。

## 测试

- 测试文件：`tests/pages/sort-viz.test.js`
- 覆盖：选择/冒泡/快速最终排序正确、done 步骤存在、sorted 标记、冒泡对已排序不产生 swap、快速包含 pivot、step 格式、swap 步骤索引数量
- **注**：测试函数目前为复制算法步骤生成器的版本。重构见 `future-plans.md`
