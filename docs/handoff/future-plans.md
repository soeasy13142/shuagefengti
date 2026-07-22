# 下一步开发建议（Future Plans）

> 派生自 `PROJECT_HANDOFF.md` §12。优先级来自原 P.H. 分级。

## ~~P0 · 继续前先做~~

1. ~~跑 `npm test`，确认全绿~~
2. ~~`git status --short`，看未提交变更~~
3. ~~判断 `project.config.json` 的未提交变化是否要保留~~

## ~~P1 · 完善刷题模块~~

1. ~~优化错题重做：直接进 quiz 而非走 import-preview，不生成新 paper~~
2. ~~简答题改为自评模式（提交后用户标记对错才入 record）~~
3. ~~增加按试卷筛选记录 / 错题~~
4. ~~增加导入失败时的错误详情（如"第 N 题解析失败"）~~
5. ~~试卷重命名功能~~
6. ~~清空记录、清空错题、导出数据等本地数据管理~~
7. ~~Markdown 解析兼容性增强~~

## P2 · 完善排序可视化

1. ~~抽出排序算法纯函数到 `utils/sort-algorithms.js`（解 r.3）~~
2. 增加插入排序、归并排序、堆排序
3. 算法复杂度说明卡片
4. 每步伪代码高亮
5. 修复上一步回放的原始数组恢复逻辑可靠性
6. 首页卡片加更详细描述

## ~~P3 · 新模块~~

~~首页仍预留 `单词记忆`，可开发方向：~~
- ~~单词卡片~~
- ~~自定义单词本~~
- ~~本地导入 CSV / Markdown~~
- ~~记忆状态~~
- ~~拼写测试~~
- ~~错词复习~~

## ~~P7 · 网络协议族 backlog (已全部上线)~~

所有网络协议族工具（TLS 动画机、HTTP 解析器、IP 分片可视化、NAT 模拟器、Nginx 配置生成器）已于 2026-07-22 前全部上线。

## P4 · 增加测试覆盖

- ~~`utils/tcp-states.js` 纯函数 → 单元测试~~
- ~~`utils/bst.js` 插入/删除/遍历 → 单元测试~~
- ~~`utils/graph.js` BFS/DFS → 单元测试~~
- ~~`utils/hash-table.js` 冲突处理 → 单元测试~~
- ~~解 r.11~~

## P6 · i18n 国际化抽象（来自 2026-07-11 code review）

基于 `docs/review/2026-07-11-full-review.md` §5 的 62 条发现，全项目无 i18n 抽象层。

建议方案：
1. 建 `utils/i18n.js` 模块，key-value 式（`{ 'zh': { title: '刷个冯题' }, 'en': { title: 'Quiz Master' } }`）
2. 替换 62 处硬编码：WXML 文字 / toast / modal / placeholder / app.json title
3. 选手语言存在 `app.globalData.lang`，默认 `zh`
4. 扩展 markdown-parser 正则支持英文 `Question X` 格式 + 判断题 True/False
5. `formatDuration` 支持 locale 参数

影响范围：全项目，涉及所有 `.wxml`、`.js` 的显示文案。建议单独开一个 plan 实施。

`docs/handoff/decisions.md` 已记录"学习数据驾驶舱 + 轻量 AI 学习建议"为收敛方向。本地规则引擎已就位，远期可替换为云端大模型 API。建议设计 API 时保持 suggestions 结构与 `utils/analytics.js` 一致，便于不改动 dashboard 页面即可切换。

## ~~P8 · 密码学 backlog (已全部上线)~~

所有密码学工具（RSA 演算器、AES 演示、DH 密钥交换、密码工具箱）已于 2026-07-22 上线。扩展方向：
- HMAC-SHA256：在 SHA-256 之上增加 keyed-hash

## ~~P9 · OS 模块 backlog (已全部上线)~~

所有 OS 工具（内存分页可视化、死锁模拟器、磁盘调度可视化、同步互斥演示）已于 2026-07-22 前全部上线。
