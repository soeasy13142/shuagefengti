# HTTP 解析器 · 设计文档

> 日期：2026-07-19
> 阶段：brainstorming → spec
> 状态：待用户审核
> 关联：`utils/tool-registry.js`（`http-parser.available = false` → `true`）、`app.json`

## 1. 目标

为「刷个冯题」小程序新增一个 **HTTP 报文解析** 的教学工具：用户输入原始 HTTP 请求或响应文本，解析器逐行拆解为结构化展示（请求行/状态行、头部字段、空行、报文体），并附带关键字段解析说明与常见状态码速查。帮助 CS 学习者理解 HTTP 协议的文本格式与通信语义。

## 2. 范围

包含：
- HTTP 请求报文解析（请求行 + 头部 + 空行 + 报文体）
- HTTP 响应报文解析（状态行 + 头部 + 空行 + 报文体）
- 常见状态码速查卡（1xx/2xx/3xx/4xx/5xx，共约 15 个核心状态码）
- 常见请求方法与头部的 inline 说明（GET/POST/PUT/DELETE、Content-Type/Cache-Control 等）
- 预置示例库（约 6 个典型 HTTP 报文，涵盖 GET/POST/200/404/500/重定向）
- 报文格式错误提示（定位到问题行）

不包含（明确不做）：
- HTTP/2 或 HTTP/3 解析（聚焦 HTTP/1.1 文本协议）
- 实际 HTTP 请求发送（纯本地解析，不联网）
- HTTPS 抓包（与 tls-viz 独立）
- 请求重放或构造报文（第一版只解析，不生成）

## 3. 架构

| 路径 | 类型 | 说明 |
|---|---|---|
| `pages/http-parser/http-parser.{js,wxml,wxss,json}` | 新增 | 4 文件页面 |
| `utils/http-parser.js` | 新增 | 纯函数：解析原始报文 → 结构化 Result |
| `utils/http-samples.js` | 新增 | 预置示例报文库 |
| `utils/http-status-codes.js` | 新增 | 状态码数据（code → 短语 + 说明） |
| `utils/tool-registry.js` | 修改 | `http-parser.available = true` |
| `app.json` | 修改 | 注册 `pages/http-parser/http-parser` |
| `tests/utils/http-parser.test.js` | 新增 | 解析正确性、错误处理 |
| `tests/utils/http-samples.test.js` | 新增 | 示例数据完整性 |
| `docs/handoff/modules/http-parser.md` | 新增 | 模块专题文档 |

## 4. 核心交互

```
┌─────────────────────────────────────────────────────────────┐
│ [示例库: GET /index.html ▼] [粘贴/编辑报文] [▶ 解析]       │
├─────────────────────────────────────────────────────────────┤
│ ┌─ 原始报文 ───────────────────────────────────────────────┐│
│ │ GET /api/users HTTP/1.1                                  ││
│ │ Host: example.com                                        ││
│ │ User-Agent: curl/8.0                                     ││
│ │ Accept: application/json                                 ││
│ │                                                          ││
│ │ (空行)                                                   ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ 解析结果 ───────────────────────────────────────────────┐│
│ │ 🔷 请求行                                                ││
│ │   方法: GET (读取资源)                                   ││
│ │   URI:  /api/users                                       ││
│ │   版本: HTTP/1.1                                         ││
│ │                                                          ││
│ │ 🔷 头部 (3 个)                                           ││
│ │   Host: example.com          ← 必需（HTTP/1.1）          ││
│ │   User-Agent: curl/8.0       ← 客户端标识                ││
│ │   Accept: application/json   ← 期望响应格式              ││
│ │                                                          ││
│ │ 🔷 报文体 (空)                                           ││
│ └──────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  状态码速查: [1xx] [2xx] [3xx] [4xx] [5xx]                 │
│  200 OK ── 请求成功，响应体包含请求的资源                   │
│  404 Not Found ── 服务器找不到请求的资源                    │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

用户操作流程：
1. 从下拉选择预置示例，或直接在文本框粘贴/输入 HTTP 报文
2. 点击「解析」，报文在左/上半部分保持原始展示，右/下半部分显示结构化解析
3. 每个字段旁边附 inline 说明（用途、语义、考点）
4. 展开「HTTP Messages」速查卡快速参照常见状态码

## 5. 数据模型 / 核心逻辑

```js
// 解析结果
{
  type: 'request' | 'response',
  // 请求特有
  method?: { raw: 'GET', info: '读取资源' },
  uri?: { raw: '/api/users', info: '请求路径' },
  // 响应特有
  statusCode?: { code: 200, phrase: 'OK', category: '2xx', info: '请求成功' },
  version: { raw: 'HTTP/1.1', info: '超文本传输协议版本 1.1' },
  // 公共
  headers: [
    {
      name: 'Content-Type',
      value: 'application/json',
      required: false,
      info: '指示响应体的媒体类型',
      examTip?: 'Content-Type 与 Accept 的区别？'
    }
  ],
  body: {
    raw: '...',
    isEmpty: true,
    length: 0
  },
  // 元信息
  errors: [                    // 解析错误列表
    { line: 2, message: '首行格式错误：缺少 HTTP 版本', type: 'error' }
  ],
  notes: [{ line: 1, type: 'warn', message: '警告：缺少 Host 头' }]
}

// 示例报文
{
  id: 'get-200',
  label: 'GET 请求 → 200 OK',
  raw: `GET / HTTP/1.1\r\nHost: example.com\r\n\r\n`,
  expectedType: 'request'
}
```

## 6. 错误处理

| 场景 | 处理 |
|---|---|
| 空输入 | toast "请输入 HTTP 报文" |
| 首行格式错误 | 标红首行 + 定位错误 + 提示正确格式模板 |
| 缺少空行 | 自动补全（不报错），但标注"非标准格式" 黄色警告 |
| 报文体长度与 Content-Length 不匹配 | warning："Content-Length 与实际报文体长度不一致" |
| 头部字段无冒号分隔 | 红色标出行号，提示 "头部应遵循 `Name: Value` 格式" |

## 7. 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/http-parser.test.js` | 请求/响应解析正确性、空行检测、头部字段提取、错误格式恢复 |
| `tests/utils/http-samples.test.js` | 所有预置示例 valid、字段完整 |
| `tests/utils/http-status-codes.test.js` | 状态码列表完整（13+）、code 不重复 |
