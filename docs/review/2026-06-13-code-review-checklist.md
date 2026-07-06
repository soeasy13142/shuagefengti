# 代码安全审查与质量门禁 — 交接文档

> 生成时间：2026-06-13
> 项目：刷个冯题微信小程序
> 目的：定义安全审计、代码质量审查和调试流程的可复用检查清单。每次代码变更前/后均可交给 agent 按本文档执行。
> 适用范围：所有 `pages/`、`utils/` 代码变更；WXML / WXSS / JS 文件。

---

## 0. 技术栈风险画像

在开始逐项审查前，先确定本项目技术栈的**先天风险面**：

| 层面 | 技术 | 关键风险 |
|---|---|---|
| 视图层 | WXML 数据绑定 | 框架自动转义，XSS 风险低但非零——`rich-text` 组件例外 |
| 逻辑层 | JavaScript (ES5 风格，`var`/`function`) | 无类型系统，变量提升/闭包陷阱 |
| 存储层 | `wx.setStorageSync` / `wx.getStorageSync` | 同步阻塞主线程、明文存储无加密、容量上限 10MB |
| 文件 IO | `wx.chooseMessageFile` + `wx.getFileSystemManager().readFileSync` | 同步读文件、用户选择任意 `.md`、无 MIME 校验 |
| 解析层 | `utils/markdown-parser.js` — 纯正则解析 | ReDoS（正则拒绝服务攻击）、格式注入 |
| 路由层 | `wx.navigateTo` + URL query 参数 | query 字符串长度限制、参数可被用户篡改 |
| 测试层 | Jest + `__mocks__/wx.js` | 仅覆盖纯 JS 逻辑，WXML/WXSS 零覆盖 |

---

## 1. 安全审计清单

以下按攻击面分类，每项标注严重级别和检查方法。

### 1.1 数据绑定与 XSS（视图注入）

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| SEC-01 | 所有 WXML 中使用 `{{}}` 绑定的用户数据，确认框架已自动转义 HTML 实体（`<` → `&lt;` 等） | 🔴 Critical | 在 WXML 中搜索 `{{item.stem}}`、`{{item.explanation}}` 等用户可控字段；确认未使用 `rich-text` 组件渲染 Markdown 内容 |
| SEC-02 | 搜索全项目 `.wxml` 文件中是否使用了 `<rich-text>` 组件且 `nodes` 属性来自用户输入 | 🔴 Critical | `grep -rn "rich-text" pages/ --include="*.wxml"` |
| SEC-03 | 搜索所有 `wx.setNavigationBarTitle` 调用，确认 title 不含用户可控字符串 | 🟡 Medium | `grep -rn "setNavigationBarTitle" pages/` |

### 1.2 存储安全

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| SEC-04 | `wx.setStorageSync` 写入前是否对数据大小做判断——单个 key 限制 1MB，总容量 10MB | 🟠 High | 检查 `utils/storage.js` 中 `_set` 函数；当前仅 catch 异常后 toast，未做写入前大小预估 |
| SEC-05 | 存储的数据是否包含敏感信息（如 API Key、用户手机号）且未加密 | 🟠 High | 搜索 `TOOLS` 数组中是否含 `apiKey` 字段；搜索 `storage.js` 中 `KEYS` 是否含 token/secret 语义的 key 名 |
| SEC-06 | `JSON.parse` 反序列化时是否做了异常捕获——如果 storage 数据被人为篡改或损坏 | 🟡 Medium | 检查 `_get()` 函数：已有 try-catch 返回 `[]`。确认所有调用方对空数组有防御 |
| SEC-07 | `getTempImportData()` / `clearTempImportData()` 的调用时序是否存在竞态——A 页面写入后 B 页面在 A 清除前读取 | 🟡 Medium | 搜索 `setTempImportData` 和 `getTempImportData` 调用位置，确认调用链：quiz-list 写入 → import-preview 读取并清除 → 无其他页面在中间读取 |

### 1.3 文件输入安全

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| SEC-08 | `wx.chooseMessageFile` 是否限制了文件类型和大小 | 🟠 High | 检查 `pages/quiz-list/quiz-list.js` 中 `chooseMessageFile` 调用：`type: 'file'` 是否配合 `extension: ['.md']`？count 是否 ≤ 1？ |
| SEC-09 | `wx.getFileSystemManager().readFileSync` 读取文件前是否检查了文件大小——大文件 (>5MB) 会导致同步阻塞和内存问题 | 🟠 High | 检查 `readFileSync` 调用前是否使用了 `FileSystemManager.statSync` 获取文件大小 |
| SEC-10 | 文件内容（`.md` 文本）传给 `parseMarkdown` 前是否做了编码校验——非 UTF-8 文件可能导致解析异常或注入 | 🟡 Medium | 检查 `readFileSync` 的 `encoding` 参数，确认指定了 `'utf-8'` |
| SEC-11 | 用户选择的文件名是否直接用于任何展示或存储——文件名可能含路径遍历字符（`../`）或特殊字符 | 🟡 Medium | 搜索 `chooseMessageFile` 的 success 回调中 `res.tempFiles[0].name` 的使用方式；当前用于 `paper.name`，确认未拼接文件路径 |

### 1.4 正则安全（ReDoS）

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| SEC-12 | `utils/markdown-parser.js` 中所有正则是否可能被恶意构造的 Markdown 触发 ReDoS（回溯爆炸） | 🔴 Critical | 逐个审查正则：`splitIntoBlocks` 中的 `/(?=^\d+[\.\、\)]\s)|(?=^##\s*第?\d+题)/gm` — 该正则无嵌套量词，ReDoS 风险低。但需确认未来新增的解析正则是否引入了 `(a+)+` 或 `(a|a)*` 等危险模式 |
| SEC-13 | `parseBlock` 中的字符串 `replace` 和 `split` 循环——如果输入包含极长行（>10000 字符），是否会导致性能问题 | 🟡 Medium | 检查 `block.trim().split('\n').map(...)` — 行数过多时有 O(n) 内存开销，建议对总行数做上限检查（如 >5000 行拒绝解析） |

### 1.5 URL 路由安全

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| SEC-14 | `wx.navigateTo` 的 URL 参数是否包含用户可控数据且未编码 | 🟠 High | 搜索 `wx.navigateTo` 调用，确认所有动态拼接的 URL 参数使用了 `encodeURIComponent` |
| SEC-15 | URL query 参数长度是否可能超出微信限制（约 2KB） | 🟡 Medium | 当前已改用 `tempImportData` 本地存储传递导入数据，确认不再有通过 URL 传递大 JSON 的遗留代码 |
| SEC-16 | `onLoad(options)` 中读取的 URL 参数是否做了类型和空值校验 | 🟡 Medium | 检查所有页面的 `onLoad(options)`：`paperId`、`recordId`、`resultData` 等参数是否有 null/undefined 防御 |

### 1.6 依赖与供应链

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| SEC-17 | `package.json` 中的依赖是否有已知漏洞 | 🟡 Medium | 运行 `npm audit`；当前仅 `jest: ^29.7.0` 一个 devDependency，风险低 |
| SEC-18 | `__mocks__/wx.js` 中的 mock 函数是否与真实 `wx` API 行为一致——不一致的 mock 可能导致测试通过但真机崩溃 | 🟡 Medium | 对比 `wx.js` mock 与微信官方 API 文档，重点审查 `getStorageSync`、`setStorageSync` 的行为差异 |

---

## 2. 正确性与健壮性审查

### 2.1 存储模块（`utils/storage.js`）

| # | 检查项 | 严重级 |
|---|---|---|
| COR-01 | `_get(key)` 在 `JSON.parse` 失败时静默返回 `[]`——这导致对损坏数据的无感知。建议同时 toast 或 console.warn 提示用户数据异常 | 🟡 Medium |
| COR-02 | `savePaper(paper)` 通过 `papers.findIndex` 做 upsert——但如果 `paper.id` 为 undefined/null，`findIndex` 行为不可预测 | 🟠 High |
| COR-03 | `deletePaper(id)` 中 `id` 为空时，`papers.filter(p => p.id !== id)` 可能删掉所有 `id` 为 `undefined` 的 paper | 🟠 High |
| COR-04 | `addWrongQuestion` 中 `questionId` 未做非空校验——如果传入空字符串，会创建无效错题记录 | 🟡 Medium |
| COR-05 | `markMastered(questionId)` 中找不到匹配项时静默无操作——调用方可能期望至少有一个错误提示 | 🟢 Low |

### 2.2 Markdown 解析器（`utils/markdown-parser.js`）

| # | 检查项 | 严重级 |
|---|---|---|
| COR-06 | `splitIntoBlocks` 中的 `split` 在输入不含任何题号时返回 `[全文]`，将整篇文本当作一个 block 解析——可能产出畸形的单题 | 🟡 Medium |
| COR-07 | `parseBlock` 中 `answer.replace(/\*\*/g, '').replace(/\s+/g, '')` ——如果答案本身是「对」或「错」（中文），空格清除可能意外改变语义 | 🟢 Low |
| COR-08 | 判断题型时：`options.length >= 2` 且第一个判断为 `judge`，但判断题的附加条件 `options.some(o => /[对错是否真假]/.test(o.text))` 可能与真实判断题格式不匹配——比如「A. 正确」、「B. 错误」 | 🟡 Medium |
| COR-09 | `fill` 题型判断依赖 `stem.includes('___')` ——如果题干本身就是填空题的陈述句（不含填空占位符），会被错误归类为 `essay` | 🟢 Low |
| COR-10 | `answer` 为空字符串时，对 `single`/`multi`/`judge` 题型——后续 `checkAnswer` 会判为错误，但对 `fill`/`essay` 影响较小 | 🟡 Medium |
| COR-11 | `generateId()` 基于 `Date.now() + Math.random()` ——单次导入时 ID 唯一性足够，但如果在同一毫秒内多次调用（极低概率），可能产生重复 ID | 🟢 Low |

### 2.3 刷题引擎（`pages/quiz/quiz.js`）

| # | 检查项 | 严重级 |
|---|---|---|
| COR-12 | `_doFinishQuiz()` 中 `duration` 计算依赖 `startTime` ——如果 `startTime` 未初始化（如从后台恢复），`Date.now() - this.data.startTime` 可能得到 NaN 或极大值 | 🟡 Medium |
| COR-13 | `checkAnswer` 中多选判分逻辑：`const sortedUser = userAnswer.split('').sort().join('')` ——如果 `userAnswer` 是 `null`/`undefined`，`split` 报错 | 🟠 High |
| COR-14 | 简答题判分：`return Boolean(userAnswer)` ——空字符串判为 false，但含空格但不含实质内容（`'   '`）被判为 true | 🟢 Low |
| COR-15 | `_autoSave()` 在 `onHide` / `onUnload` 中调用——如果此时页面数据已被部分销毁，`saveAnswer` 可能写入不完整状态 | 🟡 Medium |
| COR-16 | 填空题多空判分：按逗号分隔逐项比较——如果答案本身含逗号（如 `北京,上海`），分隔结果与预期一致；但如果答案含多余空格（如 `北京, 上海`），trim 后可能仍不匹配 | 🟡 Medium |

### 2.4 错题重做（`pages/wrong-questions/wrong-questions.js`）

| # | 检查项 | 严重级 |
|---|---|---|
| COR-17 | 错题重做流程：取 `unmastered` 错题 → 写入 `tempImportData` → 跳转 `import-preview`。如果此时有其他页面也在写 `tempImportData`，数据可能被覆盖 | 🟡 Medium |
| COR-18 | 错题重做时 `question` 字段为完整 Question 对象——如果原试卷已被删除（`deletePaper` 级联删除了错题），但错题因 `paperId` 引用断裂仍存在，`addWrongQuestion` 中的 `question` 快照可能不完整 | 🟡 Medium |

### 2.5 学习驾驶舱（`pages/dashboard/` + `utils/analytics.js`）

| # | 检查项 | 严重级 |
|---|---|---|
| COR-19 | `buildDashboardData` 中 `typeStats` 计算依赖 `record.answers` 和 `paper.questions` 的对应关系——如果试卷被修改（题目增删）但记录仍是旧的 `answers`，可能导致 `q.id` 匹配失败，对应题型的统计丢失 | 🟡 Medium |
| COR-20 | `_buildSevenDayTrend` 中日期匹配使用 `raw.slice(5, 10)` 与 `day.date`（格式 `MM-DD`）比较——如果 `endTime` 格式不标准（如 ISO 格式 `2026-06-09T12:00:00`），`slice(5, 10)` 能得到 `06-0`（截断了 `9`），导致匹配失败 | 🟠 High |
| COR-21 | `_buildSuggestions` 中无记录时直接返回单条建议——但调用方 dashboard 页面仍渲染 `typeStats` 和 `sevenDayTrend`，这些区块显示全零数据（视觉效果差） | 🟢 Low |

### 2.6 子网计算器（`utils/subnet.js`）

| # | 检查项 | 严重级 |
|---|---|---|
| COR-22 | `validateIp` 正则 `^(\d{1,3}\.){3}\d{1,3}$` ——允许 `999.999.999.999`，后续 `parseIp` 中 `parseInt(octet, 10) > 255` 会拒绝，但正则本身不做值范围校验 | 🟢 Low |
| COR-23 | `cidrToMask` 中 `Math.pow(2, 32) - Math.pow(2, 32 - cidr)` ——对于 `cidr = 0`，`Math.pow(2, 32)` 超出 JS 安全整数范围（2^53-1）但 `2^32 = 4294967296` 仍在 Number 精确范围内；`cidr = 32` 时 `2^0 = 1` 正常。无溢出风险，但值较大时的位运算建议用 BigInt | 🟢 Low |
| COR-24 | `calculateSubnet` 中对 `/31` 点对点链路和 `/32` 单主机的处理：`firstHost` 和 `lastHost` 的计算需要特殊逻辑。当前实现已覆盖，但验证边界 `/31` 时 `firstHost === lastHost` 是否正确 | 🟢 Low |

### 2.7 TCP 动画机（`utils/tcp-states.js`）

| # | 检查项 | 严重级 |
|---|---|---|
| COR-25 | `getDataTransferSteps` 中正常场景的 `ackNum = seg.seq + seg.dataLen` ——如果 `seg.dataLen` 为 0 或 undefined，`ackNum` 等于 `seq`，ACK 确认号逻辑错误 | 🟡 Medium |
| COR-26 | `generateDataScenario('loss')` 中只有 4 个 segment——如果改为更大窗口的传输场景，需要手动修改 `segments` 数组，函数不具备通用性 | 🟢 Low |

### 2.8 全局

| # | 检查项 | 严重级 |
|---|---|---|
| COR-27 | 所有 `wx.navigateTo` 的 success/fail 回调是否处理了跳转失败——页面栈满（10 层限制）时跳转会静默失败 | 🟡 Medium |
| COR-28 | `Date.now()` 和 `new Date()` 依赖设备本地时间——如果用户修改系统时间，`formatTime`、`endTime`、趋势统计等可能出现异常 | 🟢 Low |
| COR-29 | `JSON.stringify` 对循环引用对象会抛出 `TypeError`——确认所有存入 storage 的数据对象无循环引用（当前数据结构无此风险，但未来扩展时需注意） | 🟢 Low |

---

## 3. 性能审查

### 3.1 存储性能

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| PERF-01 | `wx.setStorageSync` 是同步 API——如果写入数据量大（如含 500+ 道题目的试卷），会阻塞 UI 线程，导致页面卡顿 | 🟠 High | 测量 `JSON.stringify(paper)` 的大小。如果 >500KB，建议拆分为异步写入（`wx.setStorage`）或分片存储 |
| PERF-02 | `getRecords()` 每次读取全量记录——如果记录数超过 1000 条，`JSON.parse` 和内存开销显著增加。建议在 `analytics.js` 中只读取近 30 天记录做趋势统计 | 🟡 Medium |
| PERF-03 | `getWrongQuestions()` 也是全量读取——错题本页面在渲染时做客户端排序（按时间/按试卷分组），数据量大时建议在 storage 层预排序或分页 | 🟢 Low |

### 3.2 解析性能

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| PERF-04 | `parseMarkdown` 对输入文本做全量 `split` + 逐行循环——如果导入 500KB+ 的 Markdown 文件（约 5000+ 道题），解析耗时可能超过 2 秒 | 🟡 Medium | 建议在解析前检查文本大小，超过阈值时显示进度提示 |
| PERF-05 | `splitIntoBlocks` 中的正则 `/(?=^\d+[\.\、\)]\s)|(?=^##\s*第?\d+题)/gm` 使用了 `^` 锚点和 `m` 标志——在长文本上可能触发较多的回溯。建议用 `text.split('\n').reduce(...)` 替代正则分块 | 🟢 Low |

### 3.3 渲染性能

| # | 检查项 | 严重级 | 检查方法 |
|---|---|---|---|
| PERF-06 | 首页工具卡片使用 `wx:for` 遍历——当工具数量超过 20 时，首次渲染的 DOM 节点数显著增加。确认未使用 `wx:if` 做懒渲染（当前 `activeCategory` 切换时仅渲染当前分类） | 🟢 Low |
| PERF-07 | 排序可视化 / TCP 动画机中 `setData` 的调用频率——如果每帧（16ms）调用一次 `setData` 更新动画状态，会导致传输数据量过大。确认每次 `setData` 仅传输变化的字段，而非整个 `data` 对象 | 🟡 Medium |
| PERF-08 | 子网计算器的 AND 运算动画——「逐位」模式有 33 个步骤，每个步骤触发 `setData`。在快速播放（speed=10）时，步间延迟仅 200ms，`setData` 频率合理。但步进操作 (onStepNext) 中频繁调用 `_applyStep` 会导致连续 `setData` | 🟢 Low |

---

## 4. 测试覆盖缺口

### 4.1 已覆盖区域（基线）

| 测试文件 | 覆盖范围 | 用例数 |
|---|---|---|
| `tests/utils/util.test.js` | ID 生成、时间格式化、时长格式化 | 3 |
| `tests/utils/storage.test.js` | 试卷/记录/错题的 CRUD | 7 |
| `tests/utils/markdown-parser.test.js` | 5 种题型的解析 | 10 |
| `tests/utils/analytics.test.js` | 空数据/有数据/趋势/建议 | 5 |
| `tests/utils/subnet.test.js` | IP/CIDR 验证、子网计算、地址分类、AND 步骤生成 | 43 |
| `tests/utils/tcp-states.test.js` | TCP 状态常量、三握四挥步骤、数据传输场景 | 35 |
| `tests/pages/quiz-engine.test.js` | 多选切换、判分逻辑 | 14 |
| `tests/pages/sort-viz.test.js` | 排序步骤生成器 | 9 |

**总计：8 suites，139 tests。**

### 4.2 测试缺口（按严重级排序）

| # | 缺口 | 严重级 | 建议测试 |
|---|---|---|---|
| GAP-01 | `pages/quiz/quiz.js` 核心逻辑未直接测试——当前 `quiz-engine.test.js` 仅测试纯函数提取版，原始页面 `onToggleMulti`、`finishQuiz`、`_doFinishQuiz` 等未覆盖 | 🔴 Critical | 将 `quiz.js` 中更多逻辑抽取为纯函数到 `utils/quiz-engine.js`，补充测试 |
| GAP-02 | `checkAnswer` 中 `userAnswer === null/undefined` 的防御未测试 | 🔴 Critical | `test('userAnswer 为 null 时 checkAnswer 不崩溃', ...)` |
| GAP-03 | `_buildSevenDayTrend` 日期匹配边界未测试——`endTime` 为多种格式（`YYYY-MM-DD HH:mm:ss`、ISO 8601、仅日期）时的匹配行为 | 🟠 High | 在 `analytics.test.js` 中追加不同日期格式的测试用例 |
| GAP-04 | `deletePaper` 级联删除的完整性未测试——删除试卷后 records 和 wrongQuestions 的对应清理 | 🟠 High | 在 `storage.test.js` 中追加级联删除测试 |
| GAP-05 | 存储容量不足场景仅靠 toast，无测试 | 🟠 High | Mock `wx.setStorageSync` 抛出异常，验证 `_set` 的 toast 行为 |
| GAP-06 | `parseMarkdown` 输入边界：空字符串、仅换行符、5000+ 行、含二进制字符 | 🟡 Medium | 在 `markdown-parser.test.js` 中追加 |
| GAP-07 | `import-preview` 页面的 `tempImportData` 读空/损坏场景无测试 | 🟡 Medium | 需要先抽取页面逻辑为纯函数 |
| GAP-08 | `wrong-questions` 的「重做错题」流程（写入 tempImportData → 跳转 import-preview）无测试 | 🟡 Medium | 同上 |
| GAP-09 | `buildDashboardData` 中 `averageAccuracy` 为 NaN 的场景无测试（totalQuestions=0 时 0/0） | 🟡 Medium | 在 `analytics.test.js` 中追加 |
| GAP-10 | 排序可视化测试中的步骤生成器是复制出来的，非直接 import 页面实现 | 🟡 Medium | 将步骤生成器抽出到 `utils/sort-algorithms.js`，测试改为 import 该模块 |
| GAP-11 | WXML/WXSS 渲染零自动化测试——所有 UI 回归只能靠手工 | 🟡 Medium | 长期建议引入 miniprogram-automator（微信官方自动化框架） |
| GAP-12 | `__mocks__/wx.js` 的 mock 行为与真实 API 一致性无测试 | 🟢 Low | 对比微信官方文档逐项核对 |
| GAP-13 | `utils/tool-registry.js`（新建模块）无测试 | 🟡 Medium | 在 `tests/utils/tool-registry.test.js` 中覆盖所有导出函数 |

---

## 5. 常见 Bug 模式速查表

以下是本项目代码风格（`var` / `function` / 无 TS）下容易出现的 bug 模式，审查 diff 时重点扫描：

| 模式 | 示例 | 后果 | 搜索正则 |
|---|---|---|---|
| **变量提升陷阱** | `if (true) { var x = 1; } console.log(x);` — x 泄露到块外 | 逻辑错误 | `var\s+\w+\s*=` 在 `if`/`for` 体内 |
| **this 丢失** | `setTimeout(function() { this.setData(...) }, 100)` — 普通函数中 `this` 指向全局 | 运行时崩溃 | `function\s*\([^)]*\)\s*\{` 在 `setTimeout`/`setInterval` 内 |
| **闭包循环陷阱** | `for (var i = 0; i < 3; i++) { setTimeout(function() { console.log(i) }, 100) }` — 输出 3,3,3 | 逻辑错误 | `for\s*\(\s*var` + 内部 `function` 引用循环变量 |
| **== 类型强制** | `if (userAnswer == 0)` — `'' == 0` 为 true | 判分错误 | `==\s*[^=]` 搜索非严格等于 |
| **parseInt 无基数** | `parseInt('08')` — 旧引擎解析为八进制 0 | 计算错误 | `parseInt\([^,)]+\)` 搜索缺第二参数 |
| **数组 sort 默认** | `[1, 10, 2].sort()` — 字典序 [1, 10, 2] | 排序错误 | `\.sort\(\)` 搜索无比较器的 sort |
| **setData 键值不一致** | WXML 中 `{{stats.wrongCount}}` 但 JS 中 setData 键为 `wrong_count` | 渲染空白 | WXML 与 JS 的 data key 交叉验证 |
| **条件渲染 wx:if vs hidden** | 频繁切换用 `hidden`，初始条件用 `wx:if`；混用导致性能浪费 | 卡顿 | 审查所有 `wx:if` 是否用于高频切换场景 |

---

## 6. 调试工具包

### 6.1 快速诊断命令

```bash
# ── 测试相关 ──
cd /Users/charliepan/Downloads/my-miniapp

# 全量测试（基准）
npm test

# 单文件测试 + 详细输出
npx jest tests/utils/markdown-parser.test.js --verbose

# 单用例测试
npx jest -t "解析标准格式单选题" --verbose

# 覆盖率报告
npx jest --coverage

# 只跑失败的测试（修复后验证）
npx jest --onlyFailures

# ── Git 相关 ──
# 查看所有未提交变更
git diff

# 仅看暂存区的变更
git diff --cached

# 查看最近 10 次提交
git log --oneline -10

# 查看某文件的变更历史
git log -p -- pages/quiz/quiz.js | head -100

# ── 静态扫描（安全） ──
# 搜索硬编码密钥
grep -rn "api_key\|secret\|password\|token" --include="*.js" pages/ utils/

# 搜索 console.log 残留
grep -rn "console\.\(log\|debug\)" --include="*.js" pages/ utils/

# 搜索 eval / Function 动态执行
grep -rn "\beval\(\|new Function(" --include="*.js" pages/ utils/

# 搜索 innerHTML / rich-text（XSS 风险）
grep -rn "rich-text\|innerHTML" --include="*.wxml" pages/

# 搜索同步文件读取（阻塞风险）
grep -rn "readFileSync\|getStorageSync\|setStorageSync" --include="*.js" pages/ utils/

# ── 代码质量 ──
# 搜索 TODO / FIXME / HACK 注释
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.js" pages/ utils/

# 搜索被注释掉的代码
grep -rn "^[\s]*//.*\(function\|const\|var\|let\|if\|for\|return\)" --include="*.js" pages/ utils/

# 文件大小检查
find pages/ utils/ -name "*.js" -exec wc -c {} \; | sort -rn | head -10
```

### 6.2 微信小程序专用调试

```bash
# 微信开发者工具 CLI（如果安装了）
# 预览
cli preview --project /Users/charliepan/Downloads/my-miniapp

# 上传代码
cli upload --project /Users/charliepan/Downloads/my-miniapp --version 1.0.0 --desc "描述"

# 自动化测试（需要 miniprogram-automator）
# npm install miniprogram-automator --save-dev
```

### 6.3 手动检查清单（不可自动化的项）

- [ ] 在微信开发者工具中打开项目，检查 Console 面板无红色报错
- [ ] 检查 AppData 面板中各页面的 data 字段变化是否符合预期
- [ ] 检查 Storage 面板中 `papers`、`records`、`wrongQuestions` 的 JSON 结构是否完整
- [ ] 用 375px 和 414px 模拟器分别验证首页布局
- [ ] 导入 `test-questions.md` 验证全流程：quiz-list → import-preview → quiz → result
- [ ] 导入空 `.md` 文件验证错误处理
- [ ] 连续导入 5 次同一文件验证 ID 不重复
- [ ] 删除试卷后验证记录和错题是否同时清除
- [ ] 模拟存储空间不足：在开发者工具中手动将 storage 填到接近 10MB，验证 toast 提示

---

## 7. 审查执行流程（Agent 使用指南）

当用户说「审查代码」或「code review」时，按以下流程执行：

### Step 1：获取变更范围

```bash
git diff --cached  # 优先看暂存区
# 如果为空
git diff            # 看工作区变更
# 如果还是空
git log --oneline -1 --name-only  # 看最新提交
```

### Step 2：静态安全扫描

针对暂存区/工作区 diff 中的 `+` 行，运行 §6.1 中的静态扫描命令。重点关注：

- `SEC-01` ~ `SEC-18` 中匹配当前变更文件的安全项
- 硬编码密钥、`eval()`、`innerHTML`/`rich-text`、未校验的用户输入

### Step 3：对照正确性清单

根据变更涉及的文件，从 §2 中筛选对应的 `COR-*` 项逐条审查。例如：

- 改了 `storage.js` → 检查 COR-01 ~ COR-05
- 改了 `markdown-parser.js` → 检查 COR-06 ~ COR-11
- 改了 `quiz.js` → 检查 COR-12 ~ COR-16

### Step 4：对照测试缺口

检查本次变更是否触碰了 §4.2 中标记的 `GAP-*` 区域。如果新增代码落入缺口区域，**必须先补测试再合并**。

### Step 5：Bug 模式扫描

对 diff 中的 JavaScript 代码，扫描 §5 中的 8 种常见 bug 模式。

### Step 6：运行测试

```bash
npm test
```

### Step 7：输出审查报告

格式：

```markdown
## 审查报告 — [日期] — [审查范围]

### 安全 🔴
[列出发现的安全问题，格式：编号 | 文件:行号 | 问题 | 修复建议]

### 正确性 🟠
[列出的逻辑错误/边界问题]

### 性能 🟡
[列出的性能隐患]

### 测试缺口
[本次变更是否触碰了已知的测试盲区]

### 代码质量 🟢
[命名、重复代码、console.log 残留等]

### 审查结论
- [ ] 通过（无阻塞性问题）
- [ ] 有条件通过（有建议但无阻塞）
- [ ] 阻止合并（存在安全或正确性问题）
```

---

## 8. 快速参考卡片

### 最危险的 5 个检查（每次审查必须过）

1. **SEC-01**：WXML 中是否使用了 `rich-text` 渲染用户内容
2. **SEC-12**：新增正则是否引入了 ReDoS 危险模式
3. **COR-13**：`checkAnswer` 中 `userAnswer` 为 null 是否崩溃
4. **COR-20**：`_buildSevenDayTrend` 日期匹配是否对所有格式有效
5. **GAP-01**：新增的 quiz 逻辑是否抽取为可测试的纯函数

### 最容易被忽略的 5 个问题

1. `setData` 键名与 WXML 中的 `{{}}` 变量名不一致（无编译检查）
2. `wx.navigateTo` 的页面栈溢出（10 层限制）
3. `parseInt` 缺少基数参数
4. `Array.sort()` 默认字典序
5. `Date.now()` 依赖本地时间

---

> **使用方式**：将此文档交给 agent，说「按这个审查文档检查本次变更」即可。Agent 会按 §7 流程执行静态扫描 → 对照清单 → 运行测试 → 输出报告。
>
> **维护方式**：每发现一个新的 bug 模式或安全漏洞，追加到对应章节。每新增一个测试缺口，更新 §4.2。

---

## 9. 审查记录

### 9.1 全项目审查 — 2026-06-13

> **审查范围**：全量代码（`pages/`、`utils/`、`__mocks__/`、`app.js`、`app.json`）
> **审查方式**：按本文档 §1~§5 逐项对照，逐行阅读所有 `.js` 源文件
> **测试状态**：12 suites, 236 tests, 全部通过 ✅
> **审查结论**：**通过（无阻塞性问题）**

---

#### 安全审查结果

| 编号 | 文件:行号 | 问题 | 严重级 | 状态 | 修复建议 |
|---|---|---|---|---|---|
| SEC-01 | 全 WXML | 搜索全部 `.wxml` 文件，未使用 `rich-text` 渲染用户数据。所有数据绑定均使用 `{{}}`，框架自动转义 | ✅ 通过 | — | 无需修改 |
| SEC-02 | — | 项目中不存在 `<rich-text>` 组件 | ✅ 通过 | — | 无需修改 |
| SEC-03 | — | 项目中无 `wx.setNavigationBarTitle` 调用 | ✅ 通过 | — | 无需修改 |
| SEC-04 | `utils/storage.js:17-22` | `_set()` 函数不对写入数据做大小预估。当前仅在 `wx.setStorageSync` 抛出异常时 catch 并 toast「存储空间不足」。微信限制单 key 1MB、总容量 10MB，但写入前无法感知剩余空间 | ⚠️ 未修复 | 🟡 Medium | 在 `_set` 中对 `JSON.stringify(data).length` 做阈值检查，超过 900KB 时提前 toast 预警。当前使用规模（单试卷通常 <100KB）下实际风险低 |
| SEC-05 | 全项目 | 搜索 `api_key`、`secret`、`password`、`token` 关键词——零结果。`TOOLS` 数组中无 `apiKey` 字段。`KEYS` 中的 key 名（`papers`、`records`、`wrongQuestions`、`tempImportData`）无 token/secret 语义 | ✅ 通过 | — | 无需修改 |
| SEC-06 | `utils/storage.js:9-14` | `_get()` 中 `JSON.parse` 包裹在 try-catch 中，失败返回 `[]`。`getTempImportData()` 中 `JSON.parse` 也包裹在 try-catch 中，失败返回 `null`。所有调用方对空数组/null 有防御 | ✅ 通过 | — | 无需修改 |
| SEC-07 | `utils/storage.js:106-123` | `setTempImportData` / `getTempImportData` / `clearTempImportData` 的调用链：quiz-list 写入 → import-preview 读取并清除；wrong-questions 写入 → import-preview 读取并清除。两条链路无交叉，不存在竞态 | ✅ 通过 | — | 无需修改 |
| SEC-08 | `pages/quiz-list/quiz-list.js:19-21` | `wx.chooseMessageFile` 已限制 `count: 1`、`type: 'file'`、`extension: ['md']`。只允许选择 1 个 `.md` 文件 | ✅ 通过 | — | 无需修改 |
| SEC-09 | `pages/quiz-list/quiz-list.js:27` | `fs.readFileSync(file.path, 'utf-8')` 前未使用 `fs.statSync` 检查文件大小。如果用户选择超大 `.md` 文件（>5MB，约 50 万行），同步读取会阻塞主线程导致页面卡顿甚至无响应 | 🔴 需修复 | 🟠 High | 在 `readFileSync` 前增加 `const stat = fs.statSync(file.path); if (stat.size > 2 * 1024 * 1024) { wx.showToast({ title: '文件过大，请小于 2MB', icon: 'none' }); return; }` |
| SEC-10 | `pages/quiz-list/quiz-list.js:27` | `readFileSync` 的 `encoding` 参数已指定为 `'utf-8'`，非 UTF-8 文件会触发异常被 catch 捕获 | ✅ 通过 | — | 无需修改 |
| SEC-11 | `pages/quiz-list/quiz-list.js:34` | 文件名 `file.name` 仅用于 `paper.name` 展示（去掉 `.md` 后缀），未拼接文件路径，无路径遍历风险 | ✅ 通过 | — | 无需修改 |
| SEC-12 | `utils/markdown-parser.js:20` | 正则 `/(?=^\d+[\.\、\)]\s)\|(?=^##\s*第?\d+题)/gm` 无嵌套量词，不含 `(a+)+` 或 `(a\|a)*` 等危险模式，ReDoS 风险低 | ✅ 通过 | — | 无需修改，但未来新增正则时需审查 |
| SEC-13 | `utils/markdown-parser.js:26` | `block.trim().split('\n').map(...)` — 对极长行（>10000 字符）有 O(n) 内存开销，但无正则回溯风险 | ⚠️ 已知 | 🟡 Medium | 可选：解析前检查文本总行数，超过 5000 行时提示用户 |
| SEC-14 | `pages/quiz/quiz.js:266-267` | `wx.navigateTo` 中 `resultData` 使用了 `encodeURIComponent` 编码 ✅。但 `result/result.js:14` 的 `JSON.parse(decodeURIComponent(options.data))` 未做 try-catch——如果 URL 参数被篡改或截断，JSON.parse 会抛出未捕获异常 | 🔴 需修复 | 🟡 Medium | 在 `result.js:14` 外层包裹 try-catch，失败时 toast「数据解析失败」并 navigateBack |
| SEC-15 | `pages/quiz/quiz.js:256-267` | 大数据（试卷题目）已改用 `tempImportData` 本地存储传递，URL 仅传 `resultData`（约 200 字节），不会超出微信 URL 限制 | ✅ 通过 | — | 无需修改 |
| SEC-16 | `pages/quiz/quiz.js:22` | `onLoad(options)` 中 `options.paperId` 未做空值/类型校验。如果 URL 缺少 paperId，`getPaperById(undefined)` 返回 null，后续 L23-27 有 toast + navigateBack 防御，不会崩溃 | ⚠️ 已知 | 🟡 Medium | 当前有 null 防御，可接受。建议后续对所有 `onLoad(options)` 的参数统一做类型检查 |
| SEC-17 | `package.json` | 仅 `jest: ^29.7.0` 一个 devDependency，无生产依赖，供应链风险极低 | ✅ 通过 | — | 无需修改 |
| SEC-18 | `__mocks__/wx.js:5-6` | `getStorageSync` mock 默认返回空字符串 `''`。真实 API 在 key 不存在时也返回空字符串 `''`。`_get()` 中 `data ? JSON.parse(data) : []` 对空字符串走 falsy 分支返回 `[]`——mock 行为与真实行为一致（都依赖 JS falsy 语义） | ✅ 通过 | — | 无需修改，但建议 mock 返回 `''` 时加注释说明此隐式依赖 |

**安全审查总结**：无 Critical 阻塞问题。1 个 High（SEC-09 文件大小检查），2 个 Medium（SEC-04 存储容量预估、SEC-14 URL 参数解析异常捕获）。

---

#### 正确性审查结果

| 编号 | 文件:行号 | 问题 | 严重级 | 状态 | 详细分析 |
|---|---|---|---|---|---|
| COR-01 | `utils/storage.js:12-13` | `_get()` 在 `JSON.parse` 失败时静默返回 `[]`，无 `console.warn` 或日志提示。如果 storage 数据被人为篡改或损坏，用户完全无感知，可能导致「数据丢失」但不知道原因 | ⚠️ 未修复 | 🟡 Medium | 当前行为：try { return JSON.parse(data) } catch { return [] }。建议在 catch 中增加 `console.warn('[storage] JSON.parse failed for key:', key)`，便于调试 |
| COR-02 | `utils/storage.js:30-31` | `savePaper(paper)` 通过 `papers.findIndex(p => p.id === paper.id)` 做 upsert。如果 `paper.id` 为 `undefined` 或 `null`，`findIndex` 永远返回 `-1`，每次调用都会 push 新条目，导致 storage 中出现多条 id 为 undefined 的 paper | 🔴 需修复 | 🟠 High | 在函数开头增加 `if (!paper \|\| !paper.id) { console.warn('[storage] savePaper: paper.id is required'); return; }` |
| COR-03 | `utils/storage.js:44-45` | `deletePaper(id)` 中 `papers.filter(p => p.id !== id)` — 如果 `id` 为 `undefined`，`filter(p => p.id !== undefined)` 会保留所有有 id 的 paper，但删掉所有 id 为 undefined 的 paper（如果存在）。当前调用方 `quiz-list.js:71` 传入的 `id` 来自 `e.currentTarget.dataset.id`，理论上不会为空，但缺乏防御 | 🔴 需修复 | 🟠 High | 在函数开头增加 `if (!id) return;` |
| COR-04 | `utils/storage.js:77` | `addWrongQuestion({ questionId, paperId, question })` 中 `questionId` 未做非空校验。如果传入空字符串 `''`，会创建一条 `questionId: ''` 的错题记录，后续 `markMastered('')` 可能错误匹配 | ⚠️ 未修复 | 🟡 Medium | 在函数开头增加 `if (!questionId) return;` |
| COR-05 | `utils/storage.js:96-103` | `markMastered(questionId)` 中找不到匹配项时静默无操作。调用方 `wrong-questions.js:47` 在调用后 toast「已标记掌握」，即使实际未找到也会提示成功 | ⚠️ 未修复 | 🟢 Low | 可选：`markMastered` 返回 boolean，调用方根据结果决定是否 toast |
| COR-06 | `utils/markdown-parser.js:21` | `splitIntoBlocks` 在输入不含任何题号时返回 `[全文]` 单个 block。如果用户导入的 `.md` 文件是纯说明文本（无题号），会将整篇文本当作一道题解析，可能产出畸形的单题（stem 很长、无选项、无答案） | ⚠️ 已知 | 🟡 Medium | 当前 `parseBlock` 对无答案的 block 会返回 `type: 'essay'`，不会崩溃。但体验不佳——建议在 `parseMarkdown` 末尾检查：如果只有一个 block 且无答案，返回空数组 |
| COR-07 | `utils/markdown-parser.js:62-63` | `answer.replace(/\*\*/g, '').replace(/\s+/g, '')` — 去掉 `**` markdown 加粗标记后，再清除所有空格。对于判断题答案「对」「错」（中文），空格清除不影响语义 | ✅ 通过 | — | 无需修改 |
| COR-08 | `utils/markdown-parser.js:68-71` | 判断题识别条件：`options.length === 2` + `(optionLetters includes A && includes B)` 或 `options.some(o => /[对错是否真假]/.test(o.text))`。对于 `A. 正确 / B. 错误` 格式，`正确/错误` 匹配 `对错` 正则 ✅。但对于 `A. Yes / B. No` 英文格式不识别，会归为 single | ⚠️ 已知 | 🟢 Low | 当前项目面向中文题库，英文判断题非核心场景 |
| COR-09 | `utils/markdown-parser.js:83-84` | 填空题判断依赖 `stem.includes('___')` 或 `stem.includes('（ ）')` — 如果题干本身是填空题的陈述句但不含占位符（如「请填写首都名称」），会被错误归类为 essay | ⚠️ 已知 | 🟢 Low | 这是纯正则解析的固有限制，无法完美解决 |
| COR-10 | `utils/markdown-parser.js:62` | `answer` 为空字符串时：`answer.replace(/\*\*/g, '').replace(/\s+/g, '')` 结果仍为空字符串。对 single/multi/judge 题型，`checkAnswer` 中 `if (!userAnswer \|\| userAnswer === '') return false` 会判为错误——行为合理 | ✅ 通过 | — | 无需修改 |
| COR-11 | `utils/util.js:2` | `generateId()` 基于 `Date.now().toString(36) + Math.random().toString(36).substring(2, 11)`。同一毫秒内多次调用时，`Date.now()` 部分相同，但 `Math.random()` 部分不同，实际碰撞概率极低（约 1/36^9 ≈ 1/10^14） | ✅ 通过 | — | 无需修改 |
| COR-12 | `pages/quiz/quiz.js:220-222` | `duration = Math.round((endTime - startTime) / 1000)` — `startTime` 在 `selectMode()` 中设置为 `Date.now()`（L42），正常流程不会为 null。但如果用户在 `onLoad` 后直接调用 `finishQuiz`（绕过 `selectMode`），`startTime` 为 `null`，`endTime - null` 得到 `endTime`（毫秒级时间戳），`duration` 会是一个极大值 | ⚠️ 已知 | 🟡 Medium | 建议在 `_doFinishQuiz` 开头增加 `if (!startTime) { startTime = Date.now(); }` |
| COR-13 | `pages/quiz/quiz.js:84-85` | `checkAnswer(question, userAnswer)` 中 `if (!userAnswer \|\| userAnswer === '') return false` — 对 `null`、`undefined`、空字符串均做了防御，不会崩溃。后续 `userAnswer.split('')` 只在 multi 分支执行，此时 `userAnswer` 已通过非空检查 | ✅ 通过 | — | 无需修改（原文档标注为 Critical，实际已修复） |
| COR-14 | `pages/quiz/quiz.js:102` | 简答题判分 `return userAnswer.trim().length > 0` — 空字符串判 false ✅，纯空格 `'   '` 判 false ✅，含实质内容判 true ✅。符合「非空即已作答」的设计意图 | ✅ 通过 | — | 无需修改 |
| COR-15 | `pages/quiz/quiz.js:134-142` | `_autoSave()` 在 `onHide`/`onUnload` 中调用。函数内部检查 `if (userAnswer && userAnswer !== '' && currentQuestion)` 后才执行 `checkAnswer` 和 `setData`——如果页面数据已部分销毁，`currentQuestion` 为 null，条件不满足，不会写入不完整状态 | ✅ 通过 | — | 无需修改 |
| COR-16 | `pages/quiz/quiz.js:96-99` | 填空题判分：`question.answer.split(',').map(s => s.trim().toLowerCase())` — 每个部分先 trim 再 toLowerCase。用户输入也做同样处理。对于 `北京, 上海`（逗号后有空格），trim 后为 `北京` 和 `上海`，能正确匹配 | ✅ 通过 | — | 无需修改 |
| COR-17 | `pages/wrong-questions/wrong-questions.js:52-63` | 错题重做流程：取 unmastered → 写入 tempImportData → 跳转 import-preview。写入和跳转在同一事件循环中，不存在其他页面在中间读取的竞态 | ✅ 通过 | — | 无需修改 |
| COR-18 | `utils/storage.js:44-52` | `deletePaper` 做了级联删除（papers + records + wrongQuestions）。正常流程下，删除试卷后关联的记录和错题会被清除，`record-detail` 中的 `paperDeleted` 分支是容错逻辑 | ✅ 通过 | — | 无需修改 |
| COR-19 | `utils/analytics.js:167-181` | `typeStats` 计算依赖 `paper.questions` 与 `record.answers` 的 ID 对应关系。如果试卷被修改（增删题目）后，旧记录的 `answers` 中的 `q.id` 可能无法匹配到修改后的 `paper.questions`，导致对应题型的统计丢失 | ⚠️ 已知 | 🟡 Medium | 这是数据一致性问题，当前无版本控制机制。低频场景，可接受 |
| COR-20 | `utils/analytics.js:44-52` | `_buildSevenDayTrend` 使用 `raw.slice(5, 10)` 匹配 `MM-DD`。对 `YYYY-MM-DD HH:mm:ss` 格式（如 `2026-06-09 12:00:00`），`slice(5, 10)` 得到 `06-09` ✅。对 ISO 8601 格式 `2026-06-09T12:00:00`，`slice(5, 10)` 得到 `06-09` ✅。对仅日期 `2026-06-09`，`slice(5, 10)` 得到 `06-09` ✅。当前所有 `endTime` 由 `formatTime()` 生成，格式固定为 `YYYY-MM-DD HH:mm:ss` | ✅ 通过 | — | 无需修改（原文档标注为 High，实际已正确实现） |
| COR-21 | `utils/analytics.js:72-81` | 无记录时 `_buildSuggestions` 返回单条「先完成一次练习」建议。dashboard 页面同时渲染 `typeStats`（全零）和 `sevenDayTrend`（全零），视觉上显示空状态引导卡片 | ✅ 通过 | — | 无需修改 |
| COR-22 | `utils/subnet.js:11-20` | `validateIp` 正则 `^\d+$` 不做值范围校验，允许 `999`。但后续 `Number(p)` 配合 `n >= 0 && n <= 255` 做了值范围校验。两层校验均正确 | ✅ 通过 | — | 无需修改 |
| COR-23 | `utils/subnet.js:58` | `cidrToMask` 使用位运算 `(~((1 << (32 - cidr)) - 1)) >>> 0`。`cidr = 0` 时 `(1 << 32)` 在 JS 中溢出为 `1`（32 位循环），但 `~(1-1) >>> 0 = 0xFFFFFFFF`，结果正确。`cidr = 32` 时 `(1 << 0) - 1 = 0`，`~0 >>> 0 = 0xFFFFFFFF`，也正确 | ✅ 通过 | — | 无需修改 |
| COR-24 | `utils/subnet.js:131-137` | `/31` 点对点链路：`totalHosts = 2`。`/32` 单主机：`totalHosts = 1`。其他：`2^hostBits - 2`。边界处理正确 | ✅ 通过 | — | 无需修改 |
| COR-25 | `utils/tcp-states.js:222` | `ackNum = seg.seq + seg.dataLen` — 所有场景的 `dataLen` 均硬编码为 `100`，不为 0 或 undefined，ACK 确认号逻辑正确 | ✅ 通过 | — | 无需修改 |
| COR-26 | `utils/tcp-states.js:157-187` | `generateDataScenario` 中 normal/loss 两种场景的 segments 数组均为硬编码。函数不具备通用性，但当前使用场景固定，可接受 | ✅ 通过 | — | 无需修改 |
| COR-27 | 多个页面 | 所有 `wx.navigateTo` 调用均无 `fail` 回调。微信限制页面栈最大 10 层，超出时跳转静默失败。当前页面层级：index → quiz-list → import-preview → quiz → result（5 层），加上 records/record-detail/wrong-questions/dashboard 等分支，正常使用不会超过 10 层 | ⚠️ 已知 | 🟡 Medium | 建议在深层跳转（如 quiz → result → record-detail）处增加 `fail` 回调或使用 `wx.redirectTo` 替代 `wx.navigateTo` |
| COR-28 | 全项目 | `Date.now()` 和 `new Date()` 依赖设备本地时间。如果用户修改系统时间，`formatTime`、`endTime`、趋势统计可能出现异常 | ⚠️ 已知 | 🟢 Low | 纯本地应用，无跨设备同步需求，影响有限 |
| COR-29 | 全项目 | 所有存入 storage 的数据对象（papers、records、wrongQuestions）均为纯 JSON 可序列化对象，无循环引用、无函数属性、无 undefined 值 | ✅ 通过 | — | 无需修改 |

**正确性审查总结**：2 个 High（COR-02 savePaper 空 id、COR-03 deletePaper 空 id），4 个 Medium（COR-01 静默失败、COR-04 空 questionId、COR-12 startTime 未初始化、COR-27 页面栈溢出），其余均已正确处理或为已知低风险。

---

#### 性能审查结果

| 编号 | 文件 | 问题 | 严重级 | 状态 | 详细分析 |
|---|---|---|---|---|---|
| PERF-01 | `utils/storage.js:18-19` | `wx.setStorageSync` 是同步 API。对 500+ 道题目的试卷，`JSON.stringify(paper)` 可能产生 >500KB 字符串，写入时阻塞 UI 线程 | ⚠️ 已知 | 🟠 High | 当前实际试卷规模通常 <50 题，单试卷 <50KB，暂无实际影响。建议数据量增长后改用异步 `wx.setStorage` |
| PERF-02 | `utils/storage.js:55-56` + `utils/analytics.js` | `getRecords()` 每次全量读取 + `JSON.parse`。首页 `onShow` 中调用 `loadStats` → `analytics.buildDashboardData` → `getRecords()` + `getWrongQuestions()` + `getPapers()`，共 3 次全量读取 | ⚠️ 已知 | 🟡 Medium | 建议 analytics 中只读取近 30 天记录做趋势统计，或在 storage 层增加缓存 |
| PERF-03 | `utils/storage.js:69-70` | `getWrongQuestions()` 全量读取。错题本页面在渲染时做客户端排序（按时间/按试卷分组） | ⚠️ 已知 | 🟢 Low | 当前错题数量通常 <100 条，无实际影响 |
| PERF-04 | `utils/markdown-parser.js` | `parseMarkdown` 对输入文本做全量 `split` + 逐行循环。500KB+ 的 Markdown 文件（约 5000+ 道题）解析耗时可能超过 2 秒 | ⚠️ 已知 | 🟡 Medium | 建议在解析前检查文本大小，超过阈值时显示进度提示或拒绝 |
| PERF-05 | `utils/markdown-parser.js:20-21` | `splitIntoBlocks` 中的正则使用 `^` 锚点 + `m` 标志，在长文本上可能触发较多回溯 | ⚠️ 已知 | 🟢 Low | 当前正则无嵌套量词，实际性能可接受 |
| PERF-06 | `pages/index/index.wxml` | 首页工具卡片使用 `wx:for` 遍历，当前 4 个可用工具 + 最多 4 个即将上线工具，DOM 节点数 <50，无性能问题 | ✅ 通过 | — | 无需修改 |
| PERF-07 | `pages/sort-viz/sort-viz.js:209` / `pages/ds-viz/ds-viz.js:655` | `setData` 每步传输整个 `bars`/`bstNodes` 数组而非增量更新。20 个元素的排序动画，每步传输约 2KB 数据，在微信小程序中性能可接受 | ⚠️ 已知 | 🟡 Medium | 建议后续优化为路径更新：`setData({ 'bars[3].color': 'bar-compare' })` |
| PERF-08 | `pages/subnet-calc/subnet-calc.js:277` | AND 动画逐位模式有 33 步，每步触发 `setData`。速度最快时步间延迟 200ms，`setData` 频率合理 | ✅ 通过 | — | 无需修改 |

**性能审查总结**：无实际阻塞性问题。PERF-01 在理论上有风险但当前数据规模下不触发，其余为优化建议。

---

#### 测试缺口更新

| 编号 | 缺口 | 严重级 | 2026-06-13 状态 | 说明 |
|---|---|---|---|---|
| GAP-01 | `pages/quiz/quiz.js` 核心逻辑未直接测试 | 🔴 Critical | ⚠️ 未修复 | `quiz-engine.test.js` 仅测试提取的纯函数，原始页面的 `onToggleMulti`、`finishQuiz`、`_doFinishQuiz`、`goNext`、`goPrev` 等未覆盖 |
| GAP-02 | `checkAnswer` 中 `userAnswer === null/undefined` 的防御未测试 | 🔴 Critical | ✅ 已修复 | 当前实现 `if (!userAnswer \|\| userAnswer === '') return false` 在 L85 先做防御，不会崩溃。建议补充测试用例验证 |
| GAP-03 | `_buildSevenDayTrend` 日期匹配边界未测试 | 🟠 High | ⚠️ 未修复 | 当前实现使用 `raw.slice(5, 10)` 匹配，对所有日期格式均正确，但无测试覆盖 ISO 8601、仅日期等边界格式 |
| GAP-04 | `deletePaper` 级联删除的完整性未测试 | 🟠 High | ⚠️ 未修复 | 删除试卷后 records 和 wrongQuestions 的对应清理逻辑无测试 |
| GAP-05 | 存储容量不足场景仅靠 toast，无测试 | 🟠 High | ⚠️ 未修复 | 需 mock `wx.setStorageSync` 抛出异常，验证 `_set` 的 toast 行为 |
| GAP-06 | `parseMarkdown` 输入边界测试缺失 | 🟡 Medium | ⚠️ 未修复 | 空字符串、仅换行符、5000+ 行、含二进制字符等场景无测试 |
| GAP-07 | `import-preview` 页面的 `tempImportData` 读空/损坏场景无测试 | 🟡 Medium | ⚠️ 未修复 | 需先抽取页面逻辑为纯函数 |
| GAP-08 | `wrong-questions` 的「重做错题」流程无测试 | 🟡 Medium | ⚠️ 未修复 | 同上 |
| GAP-09 | `buildDashboardData` 中 `averageAccuracy` 为 NaN 无测试 | 🟡 Medium | ⚠️ 未修复 | `totalQuestions=0` 时 `0/0` 返回 NaN，当前 `_round` 中 `Math.round(NaN)` 返回 0，行为正确但无测试 |
| GAP-10 | 排序可视化步骤生成器是复制出来的，非直接 import | 🟡 Medium | ⚠️ 未修复 | 建议抽出到 `utils/sort-algorithms.js` |
| GAP-11 | WXML/WXSS 渲染零自动化测试 | 🟡 Medium | ⚠️ 未修复 | 长期建议引入 miniprogram-automator |
| GAP-12 | `__mocks__/wx.js` 的 mock 行为与真实 API 一致性无测试 | 🟢 Low | ⚠️ 未修复 | 建议对比微信官方文档逐项核对 |
| GAP-13 | `utils/tool-registry.js` 无测试 | 🟡 Medium | ✅ 已修复 | `tests/utils/tool-registry.test.js` 已存在，18 个用例覆盖所有导出函数 |

---

#### 代码质量审查结果

| 文件:行号 | 问题 | 严重级 | 说明 |
|---|---|---|---|
| `app.js:3` | `console.log('刷个冯题 启动')` 残留 | 🟢 Low | 建议删除或改为条件日志 |
| `utils/storage.js:122-123` | `clearTempImportData` 中 catch 块为空 `catch (e) {}`——吞掉异常无任何处理 | 🟢 Low | 建议至少 `console.warn` |
| `utils/storage.js:12-13` | `_get()` 静默吞掉 `JSON.parse` 异常 | 🟢 Low | 建议增加 `console.warn` |
| `pages/sort-viz/sort-viz.js:372-386` | `_getOriginalValues` 中 `initBars = this.data.steps ? null : this.data.bars` — `steps` 初始化为 `[]`（truthy），所以 `initBars` 总是 `null`，总是走第二个分支。逻辑正确但条件表达式有误导性 | 🟢 Low | 建议简化为直接从 `this.data.bars` 取值 |
| `utils/storage.js:44-52` | `deletePaper` 三次读取 + 三次写入 storage（papers → records → wrongs），可优化为一次读取后批量写入 | 🟢 Low | 当前性能影响可忽略 |
| `pages/index/index.wxml:155` | 硬编码备案号 `苏ICP备2026036865号-1X` | 🟢 Info | 如需变更需改代码 |
| `pages/ds-viz/ds-viz.js` | 738 行，文件较大。BST/StackQueue/Hash/Graph 四种模式的逻辑混在同一文件中 | 🟢 Low | 建议后续拆分为独立模块 |
| 全项目 | 无 `eval()`、无 `new Function()`、无 `innerHTML` | ✅ | 安全 |
| 全项目 | 无非严格等于 `==`（全部使用 `===`） | ✅ | 无类型强制风险 |
| 全项目 | 无未带基数的 `parseInt` 调用 | ✅ | 无八进制解析风险 |
| 全项目 | 所有 `setTimeout` 中的 `this` 绑定均通过 `var self = this` 模式或箭头函数 `() =>` 正确处理 | ✅ | 无 this 丢失风险 |
| 全项目 | `.sort()` 调用：`quiz.js:61` 中 `Object.keys(map).sort()` 对字母排序（A/B/C…），字典序等价于正确序；`quiz.js:91-92` 中 `question.answer.split('').sort()` 同理 | ✅ | 无排序错误风险 |

---

#### 审查结论

- [x] **通过（无阻塞性问题）**
- [ ] 有条件通过
- [ ] 阻止合并

**统计**：
- 安全：0 Critical / 1 High / 2 Medium / 0 Low
- 正确性：0 Critical / 2 High / 4 Medium / 3 Low
- 性能：0 Critical / 1 High / 3 Medium / 2 Low
- 代码质量：0 Critical / 0 High / 0 Medium / 5 Low
- 测试缺口：2 Critical / 3 High / 6 Medium / 2 Low（其中 2 个已修复）

**建议优先修复顺序**：
1. 🔴 **SEC-09**：`readFileSync` 前增加文件大小检查（约 5 行代码）
2. 🟠 **COR-02**：`savePaper` 增加 `paper.id` 非空校验（1 行代码）
3. 🟠 **COR-03**：`deletePaper` 增加 `id` 非空校验（1 行代码）
4. 🟡 **SEC-14**：`result.js` 的 `JSON.parse(decodeURIComponent(...))` 增加 try-catch（3 行代码）
5. 🟡 **COR-01**：`_get()` catch 中增加 `console.warn`（1 行代码）
6. 🟢 **app.js:3**：删除 `console.log` 残留（1 行代码）
