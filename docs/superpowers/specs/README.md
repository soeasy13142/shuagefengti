# `docs/superpowers/specs/` — 设计文档目录

本目录存放「刷个冯题」项目所有设计文档（specs），由 `superpowers:brainstorming` → `superpowers:writing-plans` 流程产出。

每份 spec 包含：目标与范围、文件变更清单、核心交互与布局、数据模型、错误处理、测试方案。工具类 spec 统一遵循 Claude Design 暖奶油画布风格。

---

## 一、项目级设计文档（7 份）

与具体工具无关，涉及项目整体架构、规范、代码清理。

| 文件 | 内容 | 状态 |
|---|---|---|
| `2026-05-31-brushfengti-design.md` | 小程序原始设计 | ✅ 已实施 |
| `2026-07-10-docs-cleanup-design.md` | 文档目录结构整理 | ✅ 已实施 |
| `2026-07-11-normalization-design.md` | 文件结构规范化 + 代码风格统一 | ✅ 已实施 |
| `2026-07-11-var-cleanup-design.md` | `var` → `const`/`let` 全量迁移 | ✅ 已实施 |
| `2026-07-11-code-review-design.md` | 全项目 6 维度代码审查方案 | ✅ 已实施 |
| `2026-07-12-homepage-redesign.md` | 首页重设计（工具箱优先布局） | ✅ 已实施 |
| `2026-07-19-card-simplification-design.md` | 首页卡片简化（简洁/详细双模式） | ✅ 已实施 |

---

## 二、工具级设计文档

### ✅ 已实现（12 份）

对应 spec 已完成、页面已上线、`tool-registry.js` 中 `available: true`。

| 文件 | 工具 | 分类 |
|---|---|---|
| `2026-07-12-dns-resolver-design.md` | DNS 解析器 | 计算机网络 |
| `2026-07-19-http-parser-design.md` | HTTP 解析器 | 计算机网络 |
| `2026-07-19-ip-fragment-design.md` | IP 分片可视化 | 计算机网络 |
| `2026-07-19-nat-viz-design.md` | NAT 模拟器 | 计算机网络 |
| `2026-07-21-nginx-config-generator-design.md` | Nginx 配置生成器 | 计算机网络 |
| `2026-07-19-tls-viz-design.md` | TLS 动画机 | 计算机网络 |
| `2026-07-12-cpu-scheduling-design.md` | 进程调度可视化 | 操作系统 |
| `2026-07-19-deadlock-design.md` | 死锁模拟器 | 操作系统 |
| `2026-07-19-disk-sched-design.md` | 磁盘调度可视化 | 操作系统 |
| `2026-07-19-mem-paging-design.md` | 内存分页可视化 | 操作系统 |
| `2026-07-12-bplus-tree-design.md` | B+ 树可视化 | 算法 & 数据结构 |
| `2026-07-12-sha256-design.md` | SHA-256 演示 | 密码学 |

另外 4 个已上线工具（subnet-calc、tcp-viz、sort-viz、ds-viz）在本目录没有独立的 spec 文件——它们是在 brainstorming 工作流建立之前开发的。

### 📋 待实现（9 份）

对应 spec 已就绪、但软件尚未开发、`tool-registry.js` 中 `available: false`。

#### 操作系统

| 文件 | 工具 | 备注 |
|---|---|---|
| `2026-07-19-sync-viz-design.md` | 同步互斥演示 | 生产者-消费者 + PV 操作 |

#### 密码学

| 文件 | 工具 | 备注 |
|---|---|---|
| `2026-07-19-rsa-calc-design.md` | RSA 演算器 | 密钥生成 + 加解密 + 数论步骤 |
| `2026-07-19-aes-viz-design.md` | AES 演示 | AES-128 逐轮四步 + 密钥扩展 |
| `2026-07-19-dh-viz-design.md` | DH 密钥交换 | Diffie-Hellman + MITM 模拟 |
| `2026-07-19-crypto-tools-design.md` | 密码工具箱 | 凯撒/维吉尼亚/栅栏 + 频率分析 |

#### 编译原理

| 文件 | 工具 | 备注 |
|---|---|---|
| `2026-07-19-regex-dfa-design.md` | Regex→DFA | 正则→NFA→DFA + 状态图 |
| `2026-07-19-ll1-parser-design.md` | LL(1) 分析器 | FIRST/FOLLOW + 预测分析表 |
| `2026-07-19-lexer-viz-design.md` | 词法分析器 | Token 化 + 正则匹配 + 符号表 |
| `2026-07-19-ast-builder-design.md` | AST 构建器 | 语法分析树 + 语法制导翻译 |

---

## 三、如何开始实施

1. 选一个待实现工具 → 读对应的 spec 文件
2. 运行 `superpowers:writing-plans` 产出实施 plan
3. 走 TDD 流程：RED → GREEN → IMPROVE
4. 改 `tool-registry.js` 中对应 `available` 为 `true`
5. 更新 `app.json` 注册页面
6. 新建 `docs/handoff/modules/<tool>.md`
7. 更新本 README 将该行移至「已实现」表格
