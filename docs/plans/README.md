# 项目级实施计划（Plans）

> 目录用途：本目录存放**项目级**实施计划（complex task 的实施步骤）。
> 区别于 `docs/superpowers/specs/` 的设计 spec，`docs/superpowers/plans/` 已停止使用。

## 命名约定

- 格式：`YYYY-MM-DD-<feature-or-fix-name>.md`
- 例：`2026-07-11-normalization.md`

## 当前内容（共 27 份计划）

- `2026-05-31-brushfengti.md` —— 项目初始实施计划
- `2026-07-10-docs-cleanup.md` —— 文档清理实施计划
- `2026-07-11-full-code-review.md` —— 代码全面审查计划
- `2026-07-11-normalization.md` —— 规范化实施计划
- `2026-07-11-var-cleanup.md` —— var→let/const 清理计划
- `2026-07-12-bplus-tree.md` —— B+ 树可视化实现计划
- `2026-07-12-cpu-scheduling.md` —— CPU 调度可视化实现计划
- `2026-07-12-dns-resolver.md` —— DNS 解析器实现计划
- `2026-07-12-homepage-redesign.md` —— 首页改版计划
- `2026-07-12-sha256.md` —— SHA-256 可视化实现计划
- `2026-07-21-disk-sched.md` —— 磁盘调度可视化实现计划
- `2026-07-21-loading-performance.md` —— 加载性能优化计划
- `2026-07-21-mem-paging.md` —— 内存分页可视化实现计划
- `2026-07-22-aes-viz.md` —— AES 可视化实现计划
- `2026-07-22-ast-builder.md` —— AST 构建器实现计划
- `2026-07-22-crypto-tools.md` —— 密码工具箱实现计划
- `2026-07-22-dh-viz.md` —— DH 密钥交换实现计划
- `2026-07-22-http-parser.md` —— HTTP 解析器实现计划
- `2026-07-22-ip-fragment.md` —— IP 分片可视化实现计划
- `2026-07-22-lexer-viz.md` —— 词法分析器实现计划
- `2026-07-22-ll1-parser.md` —— LL(1) 分析器实现计划
- `2026-07-22-nat-viz.md` —— NAT 模拟器实现计划
- `2026-07-22-regex-dfa.md` —— Regex→DFA 实现计划
- `2026-07-22-rsa-calc.md` —— RSA 演算器实现计划
- `2026-07-22-sync-viz.md` —— 同步互斥演示实现计划
- `2026-07-22-tls-viz.md` —— TLS 动画机实现计划

## 与 specs 的关系

每个 plan 都关联一个或多个 spec：
- 写 plan 前先有 spec：`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- plan 内首行明示 spec 路径

## 何时新建

按 CLAUDE.md § D1：复杂任务（≥3 步骤 / 涉及 ≥2 文件 / 涉及架构或约定决策）必须先有 spec，再写 plan，才能动手。
