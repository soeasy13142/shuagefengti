# HTTP 解析器 — 模块文档

**上线日期:** 2026-07-22

## 概述

HTTP 报文解析教学工具：用户输入原始 HTTP 请求或响应文本，解析器逐行拆解为结构化展示（请求行/状态行、头部字段、空行、报文体），并附带关键字段解析说明与常见状态码速查。

## 页面

`pages/http-parser/http-parser`

## 核心逻辑

| 文件 | 说明 |
|---|---|
| `utils/http-parser.js` | `parseHttp(rawText)` — 纯函数解析原始报文 → 结构化 `ParseResult` |
| `utils/http-samples.js` | `SAMPLES` — 8 个预置示例报文 |
| `utils/http-status-codes.js` | `STATUS_CODES` / `getStatusCodesByCategory(cat)` / `getStatusCodeInfo(code)` |

### parseHttp 返回结构

```js
{
  type: 'request' | 'response',
  method: { raw, info },      // 仅 request
  uri: { raw, info },          // 仅 request
  statusCode: { code, phrase, category, info }, // 仅 response
  version: { raw, info },
  headers: [{ name, value, required, info, examTip }],
  body: { raw, isEmpty, length },
  errors: [{ line, message, type }],
  notes: [{ line, type, message }]
}
```

## 交互

- 下拉选择 8 个预置示例（GET/POST/PUT/200/301/302/404/500）
- textarea 编辑/粘贴原始报文
- 「解析」→ 原始报文保持展示 + 结构化解析结果
- 状态码速查卡：5 类标签切换，16 个核心码
- 解析错误行在原始报文标红高亮
- Content-Length 不匹配 / 缺少 Host 头 / 缺少空行 自动警告

## 数据约束

- 单次输入 max 5000 字符
- 仅 HTTP/1.1 文本协议（不处理 HTTP/2 二进制帧）
- 纯本地解析，不联网

## 测试

| 测试文件 | 覆盖 |
|---|---|
| `tests/utils/http-parser.test.js` | 请求/响应解析正确性、错误格式、警告检测 |
| `tests/utils/http-samples.test.js` | 示例完整性、唯一性、可解析性 |
| `tests/utils/http-status-codes.test.js` | 状态码分类、字段完整、无重复 |
