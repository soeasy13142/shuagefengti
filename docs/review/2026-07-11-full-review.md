# 全项目综合审查报告 · 2026-07-11

> **审查时间**：2026-07-11
> **审查范围**：全量 `pages/`（13 页面）+ `utils/`（14 模块）+ `app.*` + `tests/__mocks__/wx.js`
> **审查方式**：6 维度 Workflow 并行 fan-out（SEC / COR / PERF / BUS / I18N / QUAL）+ 主 agent 汇总 + 交叉验证
> **审查模型**：6 个 Sonnet 级并行审查 agent，248 tool calls，571k tokens
> **测试状态**：12 suites, 236 tests, 全部通过 ✅
> **参考基准**：与前次 `docs/review/2026-06-15-full-project-review.md` 逐项对照
> **审查结论**：**条件通过（1 Critical 须修复，50 High 建议修复，含 06-15 遗留项回归）**

---

## 一、安全审查结果（SEC）

| 编号 | 严重级 | 文件:行号 | 问题 | 修复建议 | vs 06-15 |
|---|---|---|---|---|---|
| SEC-14 | 🔴 High | `pages/result/result.js:14` | `JSON.parse(decodeURIComponent(options.data))` 无 try-catch，URL 参数被篡改或缺失时崩溃 | `try { ... } catch (e) { wx.showToast(...); return; }` | **still** |
| SEC-16a | 🔴 High | `pages/quiz/quiz.js:22` | `onLoad(options)` 无 `options` 空值校验，options.paperId 在缺失时崩溃 | 添加 `if (!options \|\| !options.paperId)` 守卫 | n/a |
| SEC-16b | 🔴 High | `pages/result/result.js:14` | `onLoad(options)` 中 `options.data` 无空值校验 | 添加 `if (!options \|\| !options.data)` 守卫 | n/a |
| SEC-16c | 🔴 High | `pages/record-detail/record-detail.js:37` | `onLoad(options)` 中 `options.recordId` 无空值校验 | 添加 `if (!options \|\| !options.recordId)` 守卫 | n/a |
| BUG-01 | 🔴 High | `pages/ds-viz/ds-viz.js:473` | `const key = ''` 后再 `key += chars[...]`——var→const 迁移引入的 TypeError | 改为 `let key = ''` | **regressed** |
| SEC-09 | 🟡 Medium | `pages/quiz-list/quiz-list.js:27` | `readFileSync` 前未检查文件大小，大文件(>10MB) 阻塞主线程 | 加 `if (file.size > MAX_FILE_BYTES)` 守卫 | **still** |
| SEC-04 | 🟡 Medium | `utils/storage.js:19` | `setStorageSync` 写入前无大小预估，超 1MB/key 静默丢失 | `_byteSize(str)` 预估后预警 | n/a |
| COR-01 | 🟡 Medium | `utils/storage.js:13` | `_get()` 静默返回 `[]`，损坏数据无感 | `console.warn` 异常 | **still** |
| COR-02 | 🟡 Medium | `utils/storage.js:29` | `savePaper` 不校验 `paper.id`，空 id 导致重复条目 | `if (!paper \|\| !paper.id) return;` | **still** |
| COR-04 | 🟡 Medium | `utils/storage.js:77` | `addWrongQuestion` 不校验 `questionId`，空 id 存入 storage | `if (!questionId) return;` | **still** |
| PERF-01 | 🟢 Low | `utils/storage.js:18` | `setStorageSync` 同步阻塞 UI 线程 | 大数据建议异步 | **still** |
| PERF-02 | 🟢 Low | `pages/index/index.js:30` | `onShow` 触发三次全量 storage 读取 | 缓存 + 懒刷新 | **still** |
| PERF-03 | 🟢 Low | `pages/wrong-questions/wrong-questions.js:16` | 全量读取错题，用户量大时阻塞 | 分页 | **still** |
| PERF-04 | 🟢 Low | `pages/quiz-list/quiz-list.js:28` | 大文件同步解析超 2 秒 | setTimeout 分片 | **still** |
| PERF-07 | 🟢 Low | `pages/sort-viz/sort-viz.js:113` | setData 每步传输整个 bars 数组 | 路径更新 `bars[${idx}]` | **still** |
| SEC-17 | ℹ️ Info | `package.json:9` | 无 lint/audit 工具 | 建议 eslint-plugin-security | n/a |
| SEC-12 | ℹ️ Info | `utils/markdown-parser.js:20` | 正则用户输入无长度上限 | 加 input size guard | n/a |

### 安全总结

- **需修复**：SEC-14 / SEC-16a,b,c（4 处 High，onLoad 参数校验缺失）
- **回归**：BUG-01（ds-viz `const key` TypeError，var→const 迁移引入）
- **仍存**：SEC-09（文件大小检查）/ SEC-04（存储容量预估）/ COR-01~04（storage 参数校验）

---

## 二、正确性与健壮性审查结果（COR）

| 编号 | 严重级 | 文件:行号 | 问题 | 修复建议 | vs 06-15 |
|---|---|---|---|---|---|
| COR-32 | 🔴 **Critical** | `pages/ds-viz/ds-viz.js:473` | `const key = ''` 后用 `+=` 赋值，运行时 TypeError | 改为 `let key = ''` | **regressed** |
| SEC-14 | 🔴 High | `pages/result/result.js:14` | `JSON.parse(decodeURIComponent(...))` 无 try-catch | 包裹 try-catch | **still** |
| SEC-09 | 🔴 High | `pages/quiz-list/quiz-list.js:27` | `readFileSync` 无文件大小检查 | `file.size` 检查 | **still** |
| COR-01 | 🟡 Medium | `utils/storage.js:12` | `_get()` 静默返回 `[]`，损坏数据无感 | 日志记录 | **still** |
| COR-02 | 🟡 Medium | `utils/storage.js:29` | `savePaper` 不校验 `paper.id`，空 id 重复 | `if (!paper \|\| !paper.id)` | **still** |
| COR-04 | 🟡 Medium | `utils/storage.js:77` | `addWrongQuestion` 不校验 `questionId` | `if (!questionId) return;` | **still** |
| COR-12 | 🟡 Medium | `pages/quiz/quiz.js:17` | `startTime` 默认 null，_doFinishQuiz 时 duration=NaN | 守卫 `startTime \|\| Date.now()` | **still** |
| COR-19 | 🟡 Medium | `utils/analytics.js:165` | 试卷修改后旧记录题型统计丢失 | record 中快照题型 | **still** |
| COR-15 | 🟡 Medium | `pages/quiz/quiz.js:134` | `_autoSave()` 未绑定 onHide/onUnload，切后台答案丢失 | `onHide() { this._autoSave(); }` | n/a |
| COR-03 | 🟢 Low | `utils/storage.js:44` | `deletePaper` 不校验 id | `if (!id) return;` | **still** |
| COR-05 | 🟢 Low | `utils/storage.js:96` | `markMastered` 静默无操作 | 返回 boolean | **still** |
| COR-06 | 🟢 Low | `utils/markdown-parser.js:21` | 无题号时整篇文本作为 1 个 block | 校验 blocks 长度 | **still** |
| COR-24 | 🟢 Low | `utils/subnet.js:125` | `/31` 网络无广播地址 (RFC 3021) | /31 时两个地址均可用 | **still** |
| COR-27 | 🟢 Low | `pages/index/index.js:114` | navigateTo 无 fail 回调 | 加 fail: ()=>{toast} | **still** |
| PERF-01 | 🟢 Low | `utils/storage.js:19` | setStorageSync 同步阻塞 | 异步 setStorage | **still** |
| PERF-02 | 🟢 Low | `pages/index/index.js:43` | onShow 三次 storage 全量读取 | 缓存 | **still** |
| PERF-07 | 🟢 Low | `pages/sort-viz/sort-viz.js:113` | setData 传输整个 bars 数组 | 路径增量更新 | **still** |

### 正确性总结

- **Critical**：COR-32（var→const 迁移引入的 runtime TypeError）—— **本次新发现的最严重问题**
- **High**：SEC-09 / SEC-14 —— 06-15 仍存
- **Medium**：COR-01/02/04/12/19/15 —— 6 项需逐一决定

---

## 三、性能审查结果（PERF）

| 编号 | 严重级 | 文件:行号 | 问题 | 修复建议 | vs 06-15 |
|---|---|---|---|---|---|
| PERF-02 | 🔴 High | `pages/index/index.js:43` | `onShow` 每次全量读取 records/wrongQuestions/papers | 缓存 + 懒加载 | **still** |
| PERF-07 | 🔴 High | `pages/sort-viz/sort-viz.js:113` | setData 传输整个 bars/nodes/edges 数组 | 路径更新 `bars[${idx}].color` | **still** |
| PERF-01 | 🟡 Medium | `utils/storage.js:10` | setStorageSync 同步 API 阻塞 UI | 异步 setStorage | **still** |
| PERF-03 | 🟡 Medium | `pages/index/index.js:44` | getWrongQuestions 全量反序列化 | 缓存 count | **still** |
| PERF-09 | 🟡 Medium | `pages/sort-viz/sort-viz.js:167` | 排序动画每步 setData 全数组，20 项~390 次调用 | 批处理 + 路径更新 | **new** |
| PERF-10 | 🟡 Medium | `pages/ds-viz/ds-viz.js:243` | BST/Graph/Hash 动画每步全数组 setData | 路径更新 | **new** |
| PERF-11 | 🟡 Medium | `pages/tcp-viz/tcp-viz.js:163` | 动画每步 O(n²) 重建 visibleArrows | 追加替换重建 | **new** |
| PERF-04 | 🟢 Low | `utils/markdown-parser.js:3` | parseMarkdown 同步处理无大小守卫 | 加文件大小检查 | **still** |
| PERF-05 | 🟢 Low | `utils/markdown-parser.js:20` | splitIntoBlocks 无长度上限 | 500KB 上限 | **still** |
| PERF-08 | 🟢 Low | `pages/subnet-calc/subnet-calc.js:241` | AND 动画 32 次 setData，每次 96 个数组元素 | 批处理 | **still** |
| PERF-06 | ℹ️ Info | `pages/index/index.wxml:48` | 全视图 DOM >100 节点 | 懒渲染 | **still** |
| PERF-12 | ℹ️ Info | `pages/index/index.js:31` | onShow 中 loadTools 读取 tool-registry（in-memory，无性能影响） | 无需修复 | **new** |

### 性能总结

- **High 仍存**：PERF-02（首页全量读）/ PERF-07（setData 全数组）
- **新发现 Medium**：PERF-09/10/11 —— 三个动画模块的 setData 效率
- 当前数据规模下无紧迫性能问题，数据量增长后需要优先处理

---

## 四、业务一致性审查结果（BUS）

### 🔴 需修复

| 编号 | 严重级 | 文件:行号 | 问题 | 修复建议 | vs 06-15 |
|---|---|---|---|---|---|
| BUS-06-01 | 🔴 High | `pages/quiz/quiz.js:187` | `finishQuiz()` 不调用 `_autoSave()`——考试模式最后一题答案丢失 | 在 `finishQuiz()` 开头加 `this._autoSave()` | n/a |
| BUS-08-01 | 🟡 Medium | `pages/import-preview/import-preview.js:13` | `!paperData.questions` 不能拒绝空数组 `[]`，创建 0 题试卷 | 改为 `!paperData.questions \|\| paperData.questions.length === 0` | n/a |
| BUS-10-01 | 🟢 Low | `pages/records/records.js:9` | 排序比较器永不返回 0，不稳定排序 | `b.endTime.localeCompare(a.endTime)` | n/a |

### ✅ 已验证通过

| 编号 | 说明 |
|---|---|
| BUS-01 | ✅ `markMastered` → dashboard 弱项统计 链路完整 |
| BUS-02 | ✅ `deletePaper` 三级联清理正确 |
| BUS-03 | ✅ 错题重做 tempImportData 无竞态 |
| BUS-04 | ✅ tool-registry 4 个可用工具 ↔ app.json 注册一致 |
| BUS-05 | ✅ setData 键名与 WXML `{{}}` 交叉验证通过 |
| BUS-06-02 | ✅ 练习/考试模式切换逻辑一致 |
| BUS-07 | ✅ record-detail 试卷删除分支处理优雅 |
| BUS-09 | ✅ sort-viz 与刷题数据完全隔离 |

---

## 五、i18n 兼容性审查结果（I18N）

### 汇总

| 类别 | 严重级 | 数量 | 说明 |
|---|---|---|---|
| I18N-01 | 🔴 Critical | 1 | quiz.wxml 判断题按钮 `对/错` 无法切英文（真实数据值 A/B 但显示永远中文） |
| I18N-01 | 🔴 High | 13 | 各页面 WXML 标题/标签/按钮硬编码中文 |
| I18N-02 | 🔴 High | 2 | 解析器正则仅含中文；`第X题` 格式不兼容英文 `Question X` |
| I18N-03 | 🔴 High | 1 | `formatDuration` 返回 `${m}分${s}秒` 英文下不可读 |
| I18N-04 | 🔴 High | 2 | 判断题按钮 + answer 映射仅支持 A/B 不支持 True/False |
| I18N-05 | 🟢 Low | 1 | 备案号硬编码（已知） |
| I18N-07 | 🔴 High | 19 | 全项目 toast/modal 文案硬编码中文 |
| I18N-08 | 🔴 High | 6 | WXML placeholder 属性硬编码中文 |
| I18N-06/03 | ℹ️ Info | 4 | formatTime(_formatDay) 跨 locale 安全 |

### 完整发现表（62 条）

**I18N-01: WXML 文字硬编码（14 条）**

| 编号 | 严重级 | 位置 | 内容 |
|---|---|---|---|
| I18N-01-001 | 🔴 **Critical** | quiz.wxml:55 | 判断题按钮 `对`/`错` 无法切英文 |
| I18N-01-002 | 🔴 High | quiz.wxml:18 | `第 X / Y 题` 模板 |
| I18N-01-003 | 🔴 High | index.wxml:5 | hero 区标题/副标题/CTA |
| I18N-01-004 | 🔴 High | quiz.wxml:4 | 模式选择：`练习模式`/`考试模式` |
| I18N-01-005 | 🔴 High | quiz.wxml:95 | 导航按钮：`上一题`/`下一题`/`提交`/`交卷` |
| I18N-01-006 | 🔴 High | index.wxml:154 | ICP 备案号硬编码 |
| I18N-01-007 | 🔴 High | index.wxml:17 | 学习概览标签（累计刷题/练习次数/正确率/错题数） |
| I18N-01-008 | 🔴 High | app.json:19 | `navigationBarTitleText` 硬编码 |
| I18N-01-009 | 🟡 Medium | sort-viz.wxml:66 | 输入区域提示 |
| I18N-01-010 | 🟡 Medium | subnet-calc.wxml:4 | 计算器标签/帮助文字 |
| I18N-01-011 | 🟡 Medium | result.wxml:7 | 结果页标签 |
| I18N-01-012 | 🟡 Medium | wrong-questions.wxml:4 | 错题本页标签 |
| I18N-01-013 | 🟡 Medium | quiz-list.wxml:4 | 试卷列表文字 |
| I18N-01-014 | 🟡 Medium | import-preview.wxml:3 | 导入预览标签 |
| I18N-01-015 | 🟡 Medium | records.wxml:13 | 答题记录标签 |
| I18N-01-016 | 🟡 Medium | record-detail.wxml:4 | 记录详情标签 |
| I18N-01-017 | 🟡 Medium | dashboard.wxml:4 | 驾驶舱全部标签 |
| I18N-01-018 | 🟡 Medium | ds-viz.wxml:18 | 数据结构可视化标签 |
| I18N-01-019 | ℹ️ Info | tcp-viz.wxml:5 | TCP 可视化 tab 标签 |

**I18N-02: 解析器 i18n 兼容（2 条）**

| 编号 | 严重级 | 位置 | 问题 |
|---|---|---|---|
| I18N-02-001 | 🔴 High | markdown-parser.js:70 | 判断题检测正则仅含中文 `[对错是否真假]`，不含 True/False |
| I18N-02-002 | 🔴 High | markdown-parser.js:20 | block 分割正则 `第?\d+题` 不兼容英文 `Question \d+` |

**I18N-03: 格式化函数（2 条）**

| 编号 | 严重级 | 位置 | 问题 |
|---|---|---|---|
| I18N-03-001 | 🔴 High | util.js:18 | `formatDuration` 返回 `X分Y秒` 中文单位 |
| I18N-03-002 | 🟡 Medium | result.js:19 | 重复实现 `X分Y秒` |
| I18N-03-003 | ℹ️ Info | util.js:5 | `formatTime` 格式 YYYY-MM-DD（跨 locale 安全）✅ |

**I18N-04: 判断题英文支持（2 条）**

| 编号 | 严重级 | 位置 | 问题 |
|---|---|---|---|
| I18N-04-001 | 🔴 High | quiz.wxml:55 | 判断题按钮永远显示 `对`/`错` |
| I18N-04-002 | 🟡 Medium | markdown-parser.js:89 | answer 为 True/False 时不映射为 A/B → 判分错误 |

**I18N-05: 备案号（1 条）**

| 编号 | 严重级 | 位置 | 问题 |
|---|---|---|---|
| I18N-05-001 | 🟢 Low | index.wxml:155 | `苏ICP备2026036865号-1X` 硬编码 |

**I18N-06: 数字/日期格式（2 条）**

| 编号 | 严重级 | 位置 | 问题 |
|---|---|---|---|
| I18N-06-001 | ℹ️ Info | analytics.js:22 | `_formatDay` 返回 MM-DD 跨 locale 安全 ✅ |
| I18N-06-002 | ℹ️ Info | analytics.js:41 | 7天趋势 slice(5,10) 格式一致 ✅ |

**I18N-07: 用户可见文案（25 条）**

| 编号 | 严重级 | 位置 | 内容 |
|---|---|---|---|
| I18N-07-001 | 🔴 High | index.js:108 | `功能开发中` |
| I18N-07-002 | 🔴 High | quiz-list.js:30 | `未识别到题目` |
| I18N-07-003 | 🔴 High | quiz-list.js:39 | `文件读取失败` |
| I18N-07-004 | 🔴 High | quiz-list.js:68 | `确认删除` / `删除后不可恢复` / ... |
| I18N-07-005 | 🔴 High | quiz.js:24 | `试卷不存在` |
| I18N-07-006 | 🔴 High | quiz.js:111 | `请先作答` |
| I18N-07-007 | 🔴 High | quiz.js:129 | `答案已保存` |
| I18N-07-008 | 🔴 High | quiz.js:193 | 交卷弹窗（`确认交卷` / ...） |
| I18N-07-009 | 🔴 High | import-preview.js:14 | `数据加载失败` |
| I18N-07-010 | 🔴 High | import-preview.js:42 | `导入成功` |
| I18N-07-011 | 🔴 High | wrong-questions.js:49 | `已标记掌握` |
| I18N-07-012 | 🔴 High | wrong-questions.js:55 | `没有未掌握的错题` |
| I18N-07-013 | 🔴 High | subnet-calc.js:78 | `IP 地址格式不正确` |
| I18N-07-014 | 🔴 High | subnet-calc.js:92 | `计算失败，请检查输入` |
| I18N-07-015 | 🔴 High | sort-viz.js:154 | `请先输入数字` |
| I18N-07-016 | 🔴 High | sort-viz.js:326 | `请输入数字` |
| I18N-07-017 | 🔴 High | sort-viz.js:335 | `请输入有效数字` |
| I18N-07-018 | 🟡 Medium | sort-viz.js:339 | `数字范围 1-99` |
| I18N-07-019 | 🔴 High | ds-viz.js:284 | `请输入 1-99 的数字` |
| I18N-07-020 | 🟡 Medium | ds-viz.js:296 | `树为空` |
| I18N-07-021 | 🟡 Medium | ds-viz.js:431 | `栈为空` |
| I18N-07-022 | 🟡 Medium | ds-viz.js:457 | `队列为空` |
| I18N-07-023 | 🟡 Medium | ds-viz.js:517 | `请输入 key` |
| I18N-07-024 | 🟡 Medium | ds-viz.js:528 | `表为空` |
| I18N-07-025 | 🟡 Medium | storage.js:21 | `存储空间不足` |

**I18N-08: WXML placeholder 硬编码（6 条）**

| 编号 | 严重级 | 位置 | 内容 |
|---|---|---|---|
| I18N-08-001 | 🔴 High | quiz.wxml:66 | `placeholder="请输入答案"` |
| I18N-08-002 | 🔴 High | quiz.wxml:75 | `placeholder="请输入你的答案"` |
| I18N-08-003 | 🔴 High | sort-viz.wxml:71 | `placeholder="输入数字，逗号分隔"` |
| I18N-08-004 | 🔴 High | ds-viz.wxml:34 | `placeholder="输入数字 1-99"` |
| I18N-08-005 | 🔴 High | ds-viz.wxml:86 | `placeholder="输入数字 1-99"` |
| I18N-08-006 | 🔴 High | ds-viz.wxml:121 | `placeholder="输入 key（如 apple）"` |

---

## 六、测试覆盖缺口

| 编号 | 缺口 | 严重级 | 当前状态 | 说明 |
|---|---|---|---|---|
| GAP-14 | `pages/ds-viz/ds-viz.js` 核心逻辑无测试 | 🔴 Critical | ⚠️ 新增 | 744 行最大文件，零测试覆盖。特别是 `_hashRandomKey` 的 const TypeError 未被测试捕获 |
| GAP-15 | `utils/sort-algorithms.js` 无专用测试 | 🟠 High | ⚠️ 新增 | 3 个纯函数抽取后，测试仍在 `tests/pages/sort-viz.test.js` 中 |
| GAP-01 | `pages/quiz/quiz.js` 核心逻辑未直接测试 | 🔴 Critical | ⚠️ 未修 | 06-15 GAP-01 仍存 |
| GAP-02 | `checkAnswer` null 防御未测试 | 🔴 Critical | ✅ 已修 | 实现有防御但无测试 |
| GAP-03 | `_buildSevenDayTrend` 日期边界未测试 | 🟠 High | ⚠️ 未修 | |
| GAP-04 | `deletePaper` 级联删除完整性未测试 | 🟠 High | ⚠️ 未修 | |
| GAP-05 | 存储容量不足场景无测试 | 🟠 High | ⚠️ 未修 | |
| GAP-06 | `parseMarkdown` 输入边界缺失 | 🟡 Medium | ⚠️ 未修 | |
| GAP-07 | `import-preview` 损坏数据无测试 | 🟡 Medium | ⚠️ 未修 | |
| GAP-08 | 错题重做流程无测试 | 🟡 Medium | ⚠️ 未修 | |
| GAP-09 | `averageAccuracy` NaN 无测试 | 🟡 Medium | ⚠️ 未修 | |
| GAP-11 | WXML/WXSS 零自动化测试 | 🟡 Medium | ⚠️ 未修 | |
| GAP-12 | mock 行为一致性无测试 | 🟢 Low | ⚠️ 未修 | |

---

## 七、代码质量审查（QUAL）

### Critical

| 编号 | 严重级 | 文件:行号 | 问题 | 修复建议 |
|---|---|---|---|---|
| QUAL-02-001 | 🔴 **Critical** | `pages/ds-viz/ds-viz.js:473` | `const key = ''` 后用 `+=` 赋值——var→const 迁移回归，运行时 TypeError | 改为 `let key = ''` |

### High

| 编号 | 严重级 | 文件:行号 | 问题 | 修复建议 |
|---|---|---|---|---|
| QUAL-03-001 | 🔴 High | `utils/storage.js:122` | `catch (e) {}` 空块吞掉 removeStorageSync 异常 | 加处理或移除 try-catch |
| QUAL-01-001 | 🔴 High | `app.js:3` | `console.log('刷个冯题 启动')` 生产代码残留 | 删除或条件日志 |
| QUAL-14-001 | 🔴 High | `tests/utils/` | `utils/sort-algorithms.js` 无专用测试文件，测试在 pages/ 下 | 创 `tests/utils/sort-algorithms.test.js` |

### Medium

| 编号 | 严重级 | 文件:行号 | 问题 | 修复建议 |
|---|---|---|---|---|
| QUAL-13-001 | 🟡 Medium | `utils/tcp-states.js:194` | `getDataTransferSteps` 155 行（限 50 行） | 抽取 helper |
| QUAL-13-002 | 🟡 Medium | `utils/analytics.js:136` | `buildDashboardData` 83 行 | 抽取 helper |
| QUAL-13-003 | 🟡 Medium | `utils/subnet.js:223` | `generateAndSteps` 77 行 | 抽取 helper |
| QUAL-13-004 | 🟡 Medium | `utils/markdown-parser.js:25` | `parseBlock` 72 行 | 抽取 helper |
| QUAL-13-005 | 🟡 Medium | `utils/bst.js:176` | `_delete` 81 行 | 抽取 helper |
| QUAL-08-001 | 🟡 Medium | `pages/sort-viz/sort-viz.js:69` | `_applyStep` 与 `_replayToIndex` 重复步骤逻辑 | 抽取 `_applyStepToBars` |
| QUAL-08-002 | 🟡 Medium | `pages/quiz/quiz.js:144` | `goNext` 与 `goPrev` 重复答案恢复逻辑 | 抽取 `_navigateToQuestion` |
| QUAL-10-001 | 🟡 Medium | `pages/sort-viz/sort-viz.js:50` | 80/320/68 棒图尺寸魔数 | 命名常量 |
| QUAL-10-002 | 🟡 Medium | `pages/sort-viz/sort-viz.js:179` | 800/80/50 动画速度魔数 | 命名常量 |
| QUAL-10-003 | 🟡 Medium | `pages/tcp-viz/tcp-viz.js:156` | 1500/150/200 动画速度魔数 | 命名常量 |
| QUAL-10-004 | 🟡 Medium | `pages/subnet-calc/subnet-calc.js:252` | 800/200 AND 动画延迟魔数 | 命名常量 |
| QUAL-02-002 | 🟡 Medium | `tests/utils/graph.test.js:10` | **42 个** `var` 残留 | 改为 const/let |
| QUAL-02-003 | 🟡 Medium | `tests/utils/bst.test.js:19` | **79 个** `var` 残留 | 改为 const/let |
| QUAL-02-004 | 🟡 Medium | `tests/utils/hash-table.test.js:17` | **51 个** `var` 残留 | 改为 const/let |
| QUAL-02-005 | 🟡 Medium | `tests/utils/tool-registry.test.js:21` | **27 个** `var` 残留 | 改为 const/let |
| QUAL-02-006 | 🟡 Medium | `tests/utils/analytics.test.js:1` | **17 个** `var` 残留 | 改为 const/let |
| QUAL-02-007 | 🟡 Medium | `tests/pages/sort-viz.test.js:10` | **6 个** `var` 残留 | 改为 const/let |

### Low

| 编号 | 严重级 | 文件:行号 | 问题 |
|---|---|---|---|
| QUAL-05-001 | 🟢 Low | `utils/sort-algorithms.js:111` | 内部 `quickSort(low, high)` 阴影外部同名函数 |
| QUAL-06-001 | 🟢 Low | `utils/util.js:1` | 3 个公开函数缺 JSDoc |
| QUAL-06-002 | 🟢 Low | `utils/storage.js:25` | 13 个公开函数缺 JSDoc |
| QUAL-06-003 | 🟢 Low | `utils/analytics.js:136` | `buildDashboardData` 缺 JSDoc |
| QUAL-06-004 | 🟢 Low | `utils/markdown-parser.js:3` | `parseMarkdown` 缺 JSDoc |
| QUAL-06-005 | 🟢 Low | `utils/tcp-states.js:40` | 3 个公开函数缺 JSDoc |
| QUAL-05-002 | 🟢 Low | `pages/tcp-viz/tcp-viz.js:2` | 模块导入方式不一致（同时用 tcpStates. 和解构） |
| QUAL-09-001 | 🟢 Low | `utils/bst.js:375` | 6 层深度嵌套 |
| QUAL-09-002 | 🟢 Low | `pages/quiz/quiz.js:196` | 5 层深度嵌套 |

---

## 八、未修复问题回归对照（vs 2026-06-15）

| 06-15 编号 | 06-15 描述 | 06-15 严重级 | 当前状态 | 本次变化 |
|---|---|---|---|---|
| SEC-09 | readFileSync 前无文件大小检查 | 🟠 High | **still** | 无变化 |
| SEC-14 | result.js JSON.parse 无 try-catch | 🟡 Medium | **still** | 无变化 |
| COR-01 | storage.js _get() 静默返回 [] | 🟡 Medium | **still** | 无变化 |
| COR-02 | savePaper 不校验 paper.id | 🟠 High | **still** | 无变化 |
| COR-03 | deletePaper 不校验 id | 🟠 High | **still** | 无变化 |
| COR-04 | addWrongQuestion 不校验 questionId | 🟡 Medium | **still** | 无变化 |
| COR-05 | markMastered 找不到时静默 | 🟢 Low | **still** | 无变化 |
| COR-12 | startTime 未初始化→duration 极大值 | 🟡 Medium | **still** | 无变化 |
| COR-19 | 试卷修改后旧记录题型统计丢失 | 🟡 Medium | **still** | 无变化 |
| COR-27 | navigateTo 无 fail 回调 | 🟡 Medium | **still** | 无变化 |
| PERF-01 | setStorageSync 同步大试卷阻塞 | 🟠 High | **still** | 无变化 |
| PERF-02 | 首页 onShow 三次全量读取 | 🟡 Medium | **still** | 无变化 |
| PERF-03 | 错题全量读取 | 🟢 Low | **still** | 无变化 |
| PERF-04 | 大文件解析可能超 2 秒 | 🟡 Medium | **still** | 无变化 |
| PERF-07 | setData 每步传输整个数组 | 🟡 Medium | **still** | 无变化 |
| GAP-01 | quiz.js 核心逻辑未直接测试 | 🔴 Critical | **still** | 无变化 |
| GAP-03 | _buildSevenDayTrend 日期边界未测试 | 🟠 High | **still** | 无变化 |
| GAP-04 | deletePaper 级联删除完整性未测试 | 🟠 High | **still** | 无变化 |
| GAP-05 | 存储容量不足场景无测试 | 🟠 High | **still** | 无变化 |
| GAP-06 | parseMarkdown 输入边界缺失 | 🟡 Medium | **still** | 无变化 |
| GAP-07 | import-preview 损坏数据无测试 | 🟡 Medium | **still** | 无变化 |
| GAP-08 | 错题重做流程无测试 | 🟡 Medium | **still** | 无变化 |
| GAP-09 | averageAccuracy NaN 无测试 | 🟡 Medium | **still** | 无变化 |
| GAP-11 | WXML/WXSS 零自动化测试 | 🟡 Medium | **still** | 无变化 |
| app.js:3 | `console.log` 残留 | 🟢 Low | **still** | 无变化 |

### 06-15 已修复项确认

| 06-15 编号 | 描述 | 06-15 状态 | 当前验证 |
|---|---|---|---|
| GAP-10 | 排序步骤生成器是复制的 | 已修 | ✅ `utils/sort-algorithms.js` 已抽取，sort-viz.test.js 已 import 该模块 |
| GAP-13 | tool-registry.js 无测试 | 已修 | ✅ `tests/utils/tool-registry.test.js` 存在，18 用例 |
| COR-13 | checkAnswer null 防御 | 已修 | ✅ L85 的 `if (!userAnswer)` 防御存在 |
| COR-20 | _buildSevenDayTrend 日期匹配 | 已修 | ✅ slice(5,10) 对 formatTime 输出一致 |

---

## 九、var→const/let 迁移专项回归

| 检查项 | 结果 | 证据 |
|---|---|---|
| `var` 残留（pages/ + utils/） | ✅ 零 var | `grep -rn '\bvar\b' pages/ utils/` 仅报 test 文件 |
| `var` 残留（tests/） | ⚠️ 222 个 var | 6 个测试文件（graph/bst/hash-table/tool-registry/analytics/sort-viz）仍在使用 var |
| const 二次赋值导致的 TypeError | 🔴 **1 处回归** | `pages/ds-viz/ds-viz.js:473` `const key = ''` → `key += chars[...]` |
| 闭包/hoisting 回归 | ✅ 无 | 所有 `for` 循环 var 改为 `let` 后未发现 hoisting 依赖断掉 |
| this 绑定回归 | ✅ 无 | `setTimeout` 中 `var self = this` 或箭头函数模式正确 |

### 回归详情

**`pages/ds-viz/ds-viz.js:473` — const 二次赋值 (Critical)**

```javascript
// 第 473 行：var→const 迁移误改
const key = '';           // 原为 var key = ''
// 第 475 行：循环中重新赋值
key += chars[Math.floor(Math.random() * chars.length)];
// → TypeError: Assignment to constant variable
```

**影响**：点击 Hash 模式的"随机"按钮时崩溃，Hash 功能不可用。

---

## 十、审查结论

### 统计表

| 类别 | Critical | High | Medium | Low | Info | 合计 |
|---|---|---|---|---|---|---|
| 安全 | 0 | 4 | 3 | 5 | 2 | 14 |
| 正确性 | **1** | 2 | 6 | 8 | 0 | 17 |
| 性能 | 0 | 2 | 5 | 3 | 2 | 12 |
| 业务一致性 | 0 | 1 | 1 | 1 | 8 | 11 |
| i18n | 1 | 35 | 21 | 1 | 4 | 62 |
| 代码质量 | **1** | 3 | 17 | 9 | 0 | 30 |
| **合计** | **2** | **47** | **53** | **27** | **16** | **154** |

### 总览

本审查发现 **154 条发现**，其中 **2 Critical**（均为同一根因：`pages/ds-viz/ds-viz.js:473` 的 `const key` TypeError）、**47 High**、**53 Medium**。与 06-15 报告相比：06-15 遗留的 25 项中，24 项仍存，GAP-10/GAP-13/COR-13/COR-20 确认已修复。

**本次新发现最重要的问题**：
1. 🔴 **ds-viz `const key` TypeError**（COR-32 / QUAL-02-001）—— var→const 迁移引入的运行时崩溃
2. 🔴 **exam mode 最后一题答案丢失**（BUS-06-01）—— `finishQuiz()` 不调用 `_autoSave()`
3. 🔴 **62 处中文硬编码**（I18N）—— 全项目无 i18n 抽象层
4. 🔴 **200+ var 残留到测试文件**（QUAL-02-002~007）

### 需修复项（Critical + High）

| 优先级 | 编号 | 文件:行号 | 问题 | 预估成本 |
|---|---|---|---|---|
| **P0** | COR-32 / QUAL-02-001 | `ds-viz.js:473` | `const key` TypeError ← 1 字符改动 | 1 秒 |
| **P1** | BUS-06-01 | `quiz.js:187` | exam 模式最后一题答案丢失，加 `this._autoSave()` | 1 行 |
| **P1** | SEC-14 / SEC-16b | `result.js:14` | onLoad options 无 try-catch + 空值校验 | 3 行 |
| **P1** | SEC-16a | `quiz.js:22` | onLoad options.paperId 无空值校验 | 2 行 |
| **P1** | SEC-16c | `record-detail.js:37` | onLoad options.recordId 无空值校验 | 2 行 |
| **P1** | QUAL-03-001 | `storage.js:122` | catch {} 空块 | 1 行 |
| **P1** | QUAL-01-001 | `app.js:3` | console.log 残留 | 1 行 |
| **P1** | QUAL-14-001 | `tests/utils/` | sort-algorithms.js 无专用测试 | 30 行 |
| **P2** | BUS-08-01 | `import-preview.js:13` | `[]` 空题通过校验 | 1 行 |
| **P2** | SEC-09 | `quiz-list.js:27` | readFileSync 无大小检查 | 5 行 |
| **P2** | COR-02/03/04 | `storage.js:29,44,77` | storage 函数缺参数校验 | 3 行 |
| **-N** | I18N-* | 全项目 | 62 处中文硬编码（独立 follow-up） | 大 |

### 建议修复项（Medium）

共 **53 项 Medium**，建议按以下分类分批修复：

- **优先**（影响用户体验/正确性）：COR-12（startTime 守卫）、COR-15（onHide autoSave）、COR-19（记录题型快照）
- **代码结构**（65≤行≤155 的 5 个超过 50 行函数）：QUAL-13-001~005
- **DRY 提取**：QUAL-08-001（sort-viz 重复步骤）、QUAL-08-002（goNext/goPrev 重复）
- **魔数清理**：QUAL-10-001~004（4 处）
- **测试文件 var 迁移**：QUAL-02-002~007（222 个 var，可参考 b9a543b 规范化方案）

### 代码质量优化项（Low）

共 **27 项 Low**（JSDoc 缺失 / 命名不一致 / 深度嵌套 / 注释），建议在功能开发中顺手修复。

### 审查结论

- [ ] 通过（无阻塞性问题）
- [x] **条件通过（1 Critical 必须修 + 47 High 建议修 + 53 Medium）**
- [ ] 阻止合并

**最低要求**：修复 P0（ds-viz `const key` TypeError，1 字符改动）后方可认为"安全运行"。

**建议**：优先修 P0-P1 共 9 项（约 50 行代码），然后做一轮 LOW 自动修复，62 条 I18N 和 53 条 Medium 拆成独立 follow-up 再处理。

---

## 修复记录（Low 级别自动修）

| 编号 | 文件:行号 | 修复内容 | Commit |
|---|---|---|---|
| QUAL-01-001 | `app.js:3` | 删除 `console.log('刷个冯题 启动')` 生产代码残留 | `7dec744` |
| COR-01 | `utils/storage.js:12` | `_get()` catch 增加 `console.warn` 日志 | `7dec744` |
| COR-03 | `utils/storage.js:44` | `deletePaper` 增加 `if (!id) return;` 守卫 | `7dec744` |
| COR-05 | `utils/storage.js:96` | `markMastered` 返回 boolean，调用方可判断 | `7dec744` |
| BUS-10-01 | `pages/records/records.js:9` | sort 比较器修复为返回 -1/0/1 | `7dec744` |
| QUAL-05-001 | `utils/sort-algorithms.js:111` | 内层 `quickSort` 重命名为 `_quickSortRecursive` 消除阴影 | `7dec744` |

## 用户决策记录（Medium 及以上）
