# 刷个冯题 · 交接索引

> **Handoff/会话交接** → [`.claude/HANDOFF.md`](.claude/HANDOFF.md)
> **变更日志** → [`docs/changelog.md`](docs/changelog.md)
> **模块文档** → [`docs/handoff/`](docs/handoff/architecture.md)
> **指令** → [`CLAUDE.md`](CLAUDE.md)

**最后更新：** 2026-07-21 — 按社区规范拆分 handoff/changelog

### 2026-07-21 · 死锁模拟器帮助面板——弹窗改底部面板

**变更内容**
- 移除 `intro-modal` 弹窗式使用说明，替换为 `tool-help-panel` 可收起底部参考面板
- 面板内容随 RAG/银行家模式自动切换，分「速查参考」+「完整说明」两档
- 首次访问非阻断式：面板自动展开 5s 后收回 + 标记已读
- 空态引导改为 3 步分条指引；RAG 预设按钮新增 hint 标注
- 新增 `components/tool-help-panel/` 可复用组件（4 文件）

**涉及文件**
| 操作 | 文件 |
|------|------|
| 新增 | `components/tool-help-panel/tool-help-panel.{js,wxml,wxss,json}` |
| 修改 | `pages/deadlock/deadlock.js` — HELP_CONTENT 替换，方法替换 |
| 修改 | `pages/deadlock/deadlock.wxml` — 替换组件引用 + 微标注 |
| 修改 | `pages/deadlock/deadlock.wxss` — 删除旧样式 + 新增微标注样式 |
| 修改 | `pages/deadlock/deadlock.json` — 注册 tool-help-panel |
| 修改 | `app.json` — 全局注册 tool-help-panel |
| 不修改 | `components/intro-modal/`（保留，其他页面可能使用） |

**验证**
- commits: 4452ac3, 944744e, 4a8df7e, <next-commit>
- `npm test` 全绿，44 suites, 705 tests
