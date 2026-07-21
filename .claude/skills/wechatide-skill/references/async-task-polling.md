# 异步任务轮询

任何 toolCall 返回 `status: pending` 和 `taskId` 时，停在当前步骤等待用户完成授权、扫码或操作确认。

每 10 秒调用：

```bash
wechatide -c <clientName> polling_task_result --task-id <taskId>
```

状态不再是 `pending` 时立即停止，最多轮询 10 次：

- 仅 `success` 表示原 toolCall 成功，可以继续依赖步骤
- `failed`、`cancelled`、`expired` 均不得继续依赖步骤
- 第 10 次仍为 `pending` 时停止本轮轮询，告知用户交互尚未完成，并保留任务上下文供后续恢复
- 用户拒绝、取消或超时后，不要自动重试原写操作

## 保留任务上下文

轮询超限或会话需要移交时，保留：

- `taskId`
- 原工具名
- 可用于识别同一操作的非敏感参数摘要（不得记录访问令牌）
- 最后状态与已轮询次数

根 SKILL 移交时写入 `pendingTask`。`pending` 不是失败，不得因为本轮停止轮询而重发上传、删除、部署等原操作。

## 恢复与重发

后续准备执行与 `pendingTask` 相同的操作时，必须先用旧 `taskId` 调用 `polling_task_result`：

| 旧任务状态 | 处理 |
|------------|------|
| `pending` | 不得重发；继续查询旧任务 |
| `success` | 原操作已经成功，不得重发；直接使用原结果继续 |
| `failed` | 允许重新发起，但仍须遵守原工具的参数、确认和安全规则 |
| `cancelled` / `expired` | 不自动重发；用户仍明确要求时才重新发起 |
| 无法查询 / 状态不明 | 不得重发可能产生副作用的操作，先向用户说明旧任务状态无法确认 |

只有旧任务进入明确的非 `pending` 终态，并且按上表允许时，才真正重发原操作。
