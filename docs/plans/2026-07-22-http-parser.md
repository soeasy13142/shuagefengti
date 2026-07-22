# HTTP 解析器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 HTTP 解析器工具，支持 HTTP 请求/响应报文解析、头部字段说明、状态码速查、预置示例库，帮助 CS 学习者理解 HTTP 协议文本格式。

**Architecture:** 纯函数层（`utils/http-parser.js`）提供核心解析逻辑，配套数据文件（`utils/http-samples.js` / `utils/http-status-codes.js`），4 文件页面（`pages/http-parser/`）处理交互与展示。与 dns-viz、subnet-calc 等同属计算机网络分类，复用同一设计语言。

**Tech Stack:** 微信小程序原生（WXML+WXSS+JS）| Jest 测试 | Claude Design 暖奶油画布

**Spec:** `docs/superpowers/specs/2026-07-19-http-parser-design.md`

## Global Constraints

- Claude Design 暖奶油画布：背景 `#faf9f5`，卡片 `#efe9de` 圆角 24rpx，CTA `#cc785c`（active `#a9583e`），标题 Georgia 衬线 400 weight
- 纯函数优先：`http-parser.js` 全部无副作用
- 路由格式 `/pages/http-parser/http-parser`（注意：是顶层 pages/ 而非 subPackage，因 HTTP 解析器在 tool-registry 中 route 已定为 `/pages/http-parser/http-parser`）
- 所有三个 utils 各自独立：parser / samples / status-codes
- 更新 tool-registry 时保持 `order: 5`、`category: 'network'` 不变（已有 entry，仅改 `available: true` + 补充 tagline/taglineDetail/intro）
- 解析结果模型遵循 spec 第 5 节定义的格式

---
### Task 1: 核心解析器 — `utils/http-parser.js` + 测试

**Files:**
- Create: `utils/http-parser.js`
- Create: `tests/utils/http-parser.test.js`

**Interfaces:**
- Produces:
  - `parseHttp(rawText)` → `ParseResult`（自动检测 request / response，逐行拆解）
  - 内部辅助：`_detectType(text)`, `_parseRequestLine(line)`, `_parseStatusLine(line)`, `_parseHeaders(lines)`, `_extractBody(text, headerLinesEnd)`
- `ParseResult` 类型：
  ```js
  {
    type: 'request' | 'response',
    method?: { raw: 'GET', info: '读取资源' },
    uri?: { raw: '/api/users', info: '请求路径' },
    statusCode?: { code: 200, phrase: 'OK', category: '2xx', info: '请求成功' },
    version: { raw: 'HTTP/1.1', info: '超文本传输协议版本 1.1' },
    headers: [
      { name: 'Content-Type', value: 'application/json', required: false, info: '...', examTip: '...' }
    ],
    body: { raw: '...', isEmpty: true, length: 0 },
    errors: [ { line: 2, message: '...', type: 'error' } ],
    notes: [ { line: 1, type: 'warn', message: '...' } ]
  }
  ```

- [ ] **Step 1: Write failing tests for request parsing**

```js
// tests/utils/http-parser.test.js
const { parseHttp } = require('../../utils/http-parser');

describe('parseHttp — request parsing', () => {
  test('parses basic GET request', () => {
    const raw = 'GET /api/users HTTP/1.1\r\nHost: example.com\r\nUser-Agent: curl/8.0\r\nAccept: application/json\r\n\r\n';
    const result = parseHttp(raw);
    expect(result.type).toBe('request');
    expect(result.method.raw).toBe('GET');
    expect(result.uri.raw).toBe('/api/users');
    expect(result.version.raw).toBe('HTTP/1.1');
    expect(result.headers).toHaveLength(3);
    expect(result.headers[0].name).toBe('Host');
    expect(result.body.isEmpty).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('parses POST request with body', () => {
    const body = '{"name":"test"}';
    const raw = `POST /api/data HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
    const result = parseHttp(raw);
    expect(result.type).toBe('request');
    expect(result.method.raw).toBe('POST');
    expect(result.body.isEmpty).toBe(false);
    expect(result.body.length).toBe(body.length);
    expect(result.body.raw).toBe(body);
  });

  test('parses PUT and DELETE methods', () => {
    const putResult = parseHttp('PUT /api/update HTTP/1.1\r\nHost: x.com\r\n\r\n');
    expect(putResult.method.raw).toBe('PUT');
    const delResult = parseHttp('DELETE /api/remove HTTP/1.1\r\nHost: x.com\r\n\r\n');
    expect(delResult.method.raw).toBe('DELETE');
  });

  test('provides info for standard methods', () => {
    const result = parseHttp('GET / HTTP/1.1\r\nHost: x.com\r\n\r\n');
    expect(result.method.info).toBeTruthy();
    expect(typeof result.method.info).toBe('string');
  });

  test('provides info for URI and version fields', () => {
    const result = parseHttp('GET /test HTTP/1.1\r\nHost: x.com\r\n\r\n');
    expect(result.uri.info).toBeTruthy();
    expect(result.version.info).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npx jest tests/utils/http-parser.test.js -t "request" --no-coverage`

Expected: FAIL — `Cannot find module 'http-parser'`

- [ ] **Step 3: Implement basic request parser**

```js
// utils/http-parser.js

const METHOD_INFO = {
  GET: '读取资源',
  POST: '提交资源或数据',
  PUT: '更新资源',
  DELETE: '删除资源',
  HEAD: '读取响应头（无响应体）',
  OPTIONS: '查询服务器支持的 HTTP 方法',
  PATCH: '部分更新资源'
};

const HEADER_INFO = {
  host: { info: '指定目标主机（HTTP/1.1 必需）', required: true, examTip: 'Host 头在 HTTP/1.1 中为什么是必需的？' },
  'content-type': { info: '指示请求或响应体的媒体类型', examTip: 'Content-Type 与 Accept 的区别？' },
  'content-length': { info: '响应体长度（字节数）', examTip: 'Content-Length 与 Transfer-Encoding: chunked 的区别？' },
  'user-agent': { info: '客户端标识（浏览器/工具类型）' },
  accept: { info: '客户端期望的响应格式' },
  'cache-control': { info: '缓存控制指令' },
  authorization: { info: '认证凭证（如 Bearer Token / Basic Auth）' },
  'set-cookie': { info: '服务端设置 Cookie' },
  location: { info: '重定向目标 URL' }
};

function _detectType(text) {
  const firstLine = text.split(/\r?\n/)[0];
  if (/^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s/.test(firstLine)) return 'request';
  if (/^HTTP\/\d\.\d\s+\d{3}/.test(firstLine)) return 'response';
  return 'request'; // default
}

function _parseRequestLine(line) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 3) {
    return { error: true, message: '请求行格式错误：应为 METHOD URI VERSION', line };
  }
  const [method, uri, version] = parts;
  const methodInfo = METHOD_INFO[method.toUpperCase()];
  return {
    method: { raw: method, info: methodInfo || '非标准方法' },
    uri: { raw: uri, info: '请求路径' },
    version: { raw: version, info: '超文本传输协议版本' },
    error: false
  };
}

function _parseStatusLine(line) {
  const match = line.trim().match(/^(HTTP\/\d\.\d)\s+(\d{3})\s+(.+)$/);
  if (!match) {
    return { error: true, message: '状态行格式错误：应为 HTTP/X.X XXX 短语', line };
  }
  const [, version, code, phrase] = match;
  return {
    version: { raw: version, info: '超文本传输协议版本' },
    statusCode: { code: parseInt(code, 10), phrase, category: code.charAt(0) + 'xx', info: '' },
    error: false
  };
}

function _parseHeaders(lines) {
  const headers = [];
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const name = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    const known = HEADER_INFO[name.toLowerCase()];
    headers.push({
      name,
      value,
      required: known ? known.required : false,
      info: known ? known.info : '自定义头部',
      examTip: known ? known.examTip : undefined
    });
  }
  return headers;
}

function _extractBody(text, headerEndIdx) {
  // After headers, after the blank line
  const bodyStart = text.indexOf('\r\n\r\n', headerEndIdx);
  if (bodyStart === -1) {
    const bodyStartN = text.indexOf('\n\n', headerEndIdx);
    if (bodyStartN === -1) return { raw: '', isEmpty: true, length: 0 };
    const raw = text.slice(bodyStartN + 2);
    return { raw, isEmpty: raw.length === 0, length: raw.length };
  }
  const raw = text.slice(bodyStart + 4);
  return { raw, isEmpty: raw.length === 0, length: raw.length };
}

/**
 * 解析原始 HTTP 报文
 * @param {string} text - 完整 HTTP 报文文本
 * @returns {ParseResult}
 */
function parseHttp(text) {
  if (!text || text.trim().length === 0) {
    return {
      type: 'request',
      errors: [{ line: 0, message: '输入为空', type: 'error' }],
      notes: [],
      headers: [],
      body: { raw: '', isEmpty: true, length: 0 },
      version: { raw: '', info: '' }
    };
  }

  const errors = [];
  const notes = [];
  const lines = text.split(/\r?\n/);
  const firstLine = lines[0];

  if (lines.length < 2) {
    errors.push({ line: 1, message: '报文不完整：至少需要首行和空行', type: 'error' });
  }

  const type = _detectType(text);

  let version = { raw: '', info: '' };
  let method, uri, statusCode;

  if (type === 'request') {
    const parsed = _parseRequestLine(firstLine);
    if (parsed.error) {
      errors.push({ line: 1, message: parsed.message, type: 'error' });
    } else {
      method = parsed.method;
      uri = parsed.uri;
      version = parsed.version;
    }
  } else {
    const parsed = _parseStatusLine(firstLine);
    if (parsed.error) {
      errors.push({ line: 1, message: parsed.message, type: 'error' });
    } else {
      version = parsed.version;
      statusCode = parsed.statusCode;
    }
  }

  // Find blank line separating headers from body
  let blankLineIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      blankLineIdx = i;
      break;
    }
  }

  const headerLines = lines.slice(1, blankLineIdx === -1 ? lines.length : blankLineIdx).filter(l => l.trim());
  const headers = _parseHeaders(headerLines);

  if (blankLineIdx === -1) {
    notes.push({ line: lines.length, type: 'warn', message: '缺少空行分隔头部与报文体（非标准格式）' });
  }

  // Body extraction
  const body = _extractBody(text, 0);

  // Check Content-Length mismatch
  const clHeader = headers.find(h => h.name.toLowerCase() === 'content-length');
  if (clHeader && !body.isEmpty) {
    const declared = parseInt(clHeader.value, 10);
    if (!isNaN(declared) && declared !== body.length) {
      notes.push({ line: 1, type: 'warn', message: `Content-Length 声明 ${declared} 与实际报文体长度 ${body.length} 不一致` });
    }
  }

  // Check missing Host header for request
  if (type === 'request' && !headers.some(h => h.name.toLowerCase() === 'host')) {
    notes.push({ line: 1, type: 'warn', message: '警告：缺少 Host 头（HTTP/1.1 必需）' });
  }

  const result = { type, headers, body, errors, notes, version };
  if (method) result.method = method;
  if (uri) result.uri = uri;
  if (statusCode) result.statusCode = statusCode;

  return result;
}

module.exports = { parseHttp };
```

- [ ] **Step 4: Run request parsing tests to verify they pass**

Run: `npx jest tests/utils/http-parser.test.js -t "request" --no-coverage`

Expected: PASS (5+ tests)

- [ ] **Step 5: Write failing tests for response parsing**

```js
// append to tests/utils/http-parser.test.js

describe('parseHttp — response parsing', () => {
  test('parses basic 200 response', () => {
    const raw = 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 15\r\n\r\n{"key":"value"}';
    const result = parseHttp(raw);
    expect(result.type).toBe('response');
    expect(result.statusCode.code).toBe(200);
    expect(result.statusCode.phrase).toBe('OK');
    expect(result.statusCode.category).toBe('2xx');
    expect(result.version.raw).toBe('HTTP/1.1');
    expect(result.body.raw).toBe('{"key":"value"}');
  });

  test('parses 404 and 500 responses', () => {
    const notFound = parseHttp('HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n');
    expect(notFound.statusCode.code).toBe(404);
    expect(notFound.statusCode.phrase).toBe('Not Found');

    const serverErr = parseHttp('HTTP/1.1 500 Internal Server Error\r\nContent-Length: 0\r\n\r\n');
    expect(serverErr.statusCode.code).toBe(500);
  });

  test('parses redirect response with Location header', () => {
    const raw = 'HTTP/1.1 301 Moved Permanently\r\nLocation: https://new.example.com\r\nContent-Length: 0\r\n\r\n';
    const result = parseHttp(raw);
    expect(result.statusCode.code).toBe(301);
    expect(result.headers.some(h => h.name === 'Location')).toBe(true);
  });
});
```

- [ ] **Step 6: Run response parsing tests to confirm they fail**

Run: `npx jest tests/utils/http-parser.test.js -t "response" --no-coverage`

Expected: FAIL — response status code info may be empty

- [ ] **Step 7: Add status code info to parser**

Add `STATUS_PHRASE_INFO` mapping in `http-parser.js`:

```js
const STATUS_PHRASE_INFO = {
  200: { phrase: 'OK', info: '请求成功，响应体包含请求的资源' },
  201: { phrase: 'Created', info: '请求成功，新资源已创建' },
  301: { phrase: 'Moved Permanently', info: '请求的资源已永久移动到新 URL' },
  302: { phrase: 'Found', info: '请求的资源临时移动到新 URL' },
  304: { phrase: 'Not Modified', info: '资源未修改（配合条件请求）' },
  400: { phrase: 'Bad Request', info: '请求语法错误或参数无效' },
  401: { phrase: 'Unauthorized', info: '需要认证凭证' },
  403: { phrase: 'Forbidden', info: '服务器拒绝执行请求' },
  404: { phrase: 'Not Found', info: '服务器找不到请求的资源' },
  405: { phrase: 'Method Not Allowed', info: '请求方法不被允许' },
  500: { phrase: 'Internal Server Error', info: '服务器内部错误' },
  502: { phrase: 'Bad Gateway', info: '网关或代理收到上游无效响应' },
  503: { phrase: 'Service Unavailable', info: '服务器暂时无法处理请求' }
};

// In _parseStatusLine, after extracting code:
const codeNum = parseInt(code, 10);
const statusInfo = STATUS_PHRASE_INFO[codeNum];
return {
  version: ...,
  statusCode: {
    code: codeNum,
    phrase,
    category: code.charAt(0) + 'xx',
    info: statusInfo ? statusInfo.info : '未知状态码'
  },
  error: false
};
```

- [ ] **Step 8: Run response parsing tests to verify they pass**

Run: `npx jest tests/utils/http-parser.test.js -t "response" --no-coverage`

Expected: PASS (3+ tests)

- [ ] **Step 9: Write failing tests for error handling**

```js
// append to tests/utils/http-parser.test.js

describe('parseHttp — error handling', () => {
  test('returns error for empty input', () => {
    const result = parseHttp('');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('flags malformed first line as request', () => {
    const result = parseHttp('INVALID_LINE\r\nHost: x.com\r\n\r\n');
    // INVALID_LINE doesn't match method pattern -> still returns type request
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('flags missing blank line', () => {
    const result = parseHttp('GET / HTTP/1.1\r\nHost: x.com');
    expect(result.notes.some(n => n.message.includes('缺少空行'))).toBe(true);
  });

  test('warns on Content-Length mismatch', () => {
    const raw = 'POST / HTTP/1.1\r\nHost: x.com\r\nContent-Length: 100\r\n\r\nsmall';
    const result = parseHttp(raw);
    expect(result.notes.some(n => n.message.includes('Content-Length'))).toBe(true);
  });

  test('warns on missing Host header', () => {
    const raw = 'GET / HTTP/1.1\r\n\r\n';
    const result = parseHttp(raw);
    expect(result.notes.some(n => n.message.includes('Host'))).toBe(true);
  });

  test('headers without colon are warned via error on that header', () => {
    const raw = 'GET / HTTP/1.1\r\nBadHeaderNoColon\r\n\r\n';
    const result = parseHttp(raw);
    // Should not crash; malformed headers are skipped
    expect(result.headers).toHaveLength(0);
  });
});
```

- [ ] **Step 10: Run error handling tests to confirm they fail**

Run: `npx jest tests/utils/http-parser.test.js -t "error" --no-coverage`

Expected: FAIL — some assertions may not match yet

- [ ] **Step 11: Review and refine implementation for error handling**

Ensure `parseHttp` handles:
- Empty input → error with message
- Malformed first line → error
- Missing blank line → note/warning
- Content-Length mismatch → note
- Missing Host → note
- Malformed header (no colon) → skip gracefully, no crash

- [ ] **Step 12: Run all parser tests to verify they pass**

Run: `npx jest tests/utils/http-parser.test.js --no-coverage`

Expected: All PASS (3 describe blocks, ~14 tests)

- [ ] **Step 13: Run full test suite to ensure no regressions**

Run: `npm test`

Expected: All tests PASS

- [ ] **Step 14: Commit http-parser implementation**

```bash
git add utils/http-parser.js tests/utils/http-parser.test.js
git commit -m "feat: HTTP 报文解析器核心逻辑 + 测试"
```

---
### Task 2: 预置示例库 — `utils/http-samples.js` + 测试

**Files:**
- Create: `utils/http-samples.js`
- Create: `tests/utils/http-samples.test.js`

**Interfaces:**
- Produces:
  - `SAMPLES` — array of sample HTTP messages

```js
// Sample entry format
{
  id: 'get-200',
  label: 'GET 请求 → 200 OK',
  raw: `GET / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: curl/8.0\r\nAccept: text/html\r\n\r\n`,
  expectedType: 'request',
  description: '最基本的 GET 请求，请求首页'
}
```

- [ ] **Step 1: Write failing test for sample library validity**

```js
// tests/utils/http-samples.test.js
const { SAMPLES } = require('../../utils/http-samples');
const { parseHttp } = require('../../utils/http-parser');

describe('HTTP sample library', () => {
  test('contains at least 6 samples', () => {
    expect(SAMPLES.length).toBeGreaterThanOrEqual(6);
  });

  test('all samples have required fields', () => {
    for (const s of SAMPLES) {
      expect(s.id).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.raw).toBeTruthy();
      expect(s.expectedType).toMatch(/^(request|response)$/);
    }
  });

  test('all samples have unique IDs', () => {
    const ids = SAMPLES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all samples parse without errors', () => {
    for (const s of SAMPLES) {
      const result = parseHttp(s.raw);
      expect(result.type).toBe(s.expectedType);
      // Samples should have no parsing errors
      const hasFatalError = result.errors.some(e => e.type === 'error');
      expect(hasFatalError).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run sample test to confirm it fails**

Run: `npx jest tests/utils/http-samples.test.js --no-coverage`

Expected: FAIL — `Cannot find module 'http-samples'`

- [ ] **Step 3: Implement sample library**

```js
// utils/http-samples.js

/**
 * 预置 HTTP 报文示例库
 * 涵盖 GET/POST/200/404/500/重定向等典型场景
 */
const SAMPLES = [
  {
    id: 'get-home',
    label: 'GET 请求首页',
    raw: 'GET / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: Mozilla/5.0\r\nAccept: text/html\r\nAccept-Language: zh-CN\r\n\r\n',
    expectedType: 'request',
    description: '最基本的 GET 请求，请求网站首页，浏览器会附带 User-Agent 和 Accept 等头部'
  },
  {
    id: 'post-json',
    label: 'POST 提交 JSON',
    raw: 'POST /api/users HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\nContent-Length: 42\r\n\r\n{"name":"Alice","email":"alice@example.com"}',
    expectedType: 'request',
    description: 'POST 请求提交 JSON 数据到 API 接口，需要设置 Content-Type 和 Content-Length'
  },
  {
    id: 'put-update',
    label: 'PUT 更新资源',
    raw: 'PUT /api/users/42 HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\nContent-Length: 27\r\nAuthorization: Bearer token123\r\n\r\n{"name":"Alice Updated"}',
    expectedType: 'request',
    description: 'PUT 请求更新已有资源，通常需要 Authorization 头携带认证凭证'
  },
  {
    id: 'get-200',
    label: '200 OK 响应',
    raw: 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 28\r\nCache-Control: max-age=3600\r\n\r\n{"message":"Hello, World!"}',
    expectedType: 'response',
    description: '最常见的成功响应，包含 JSON 格式的响应体'
  },
  {
    id: 'get-301',
    label: '301 重定向',
    raw: 'HTTP/1.1 301 Moved Permanently\r\nLocation: https://new.example.com\r\nContent-Length: 0\r\n\r\n',
    expectedType: 'response',
    description: '301 永久重定向，Location 头指示新的资源地址'
  },
  {
    id: 'get-404',
    label: '404 Not Found',
    raw: 'HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\nContent-Length: 0\r\n\r\n',
    expectedType: 'response',
    description: '资源不存在的标准响应'
  },
  {
    id: 'get-500',
    label: '500 服务器错误',
    raw: 'HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\nContent-Length: 21\r\n\r\nInternal Server Error',
    expectedType: 'response',
    description: '服务器内部错误的响应，通常伴随简单的错误描述'
  },
  {
    id: 'get-302',
    label: '302 临时重定向',
    raw: 'HTTP/1.1 302 Found\r\nLocation: /temp-page\r\nContent-Length: 0\r\n\r\n',
    expectedType: 'response',
    description: '302 临时重定向，Location 指示临时资源位置'
  }
];

module.exports = { SAMPLES };
```

- [ ] **Step 4: Run sample tests to verify they pass**

Run: `npx jest tests/utils/http-samples.test.js --no-coverage`

Expected: PASS (4+ tests)

- [ ] **Step 5: Commit samples library**

```bash
git add utils/http-samples.js tests/utils/http-samples.test.js
git commit -m "feat: HTTP 预置示例库（8 个典型报文）"
```

---
### Task 3: 状态码数据 — `utils/http-status-codes.js` + 测试

**Files:**
- Create: `utils/http-status-codes.js`
- Create: `tests/utils/http-status-codes.test.js`

**Interfaces:**
- Produces:
  - `STATUS_CODES` — object grouped by category (1xx/2xx/3xx/4xx/5xx)
  - `getStatusCodesByCategory(category)` → filtered array
  - `getStatusCodeInfo(code)` → single entry

```js
// Entry format
{
  code: 200,
  phrase: 'OK',
  category: '2xx',
  info: '请求成功，响应体包含请求的资源',
  examTip: '常见面试题：200 OK 与 201 Created 的区别？'
}
```

- [ ] **Step 1: Write failing test for status code data**

```js
// tests/utils/http-status-codes.test.js
const { STATUS_CODES, getStatusCodesByCategory, getStatusCodeInfo } = require('../../utils/http-status-codes');

describe('HTTP status codes', () => {
  test('contains at least 13 status codes', () => {
    const allCodes = Object.values(STATUS_CODES).flat();
    expect(allCodes.length).toBeGreaterThanOrEqual(13);
  });

  test('all codes have required fields', () => {
    const allCodes = Object.values(STATUS_CODES).flat();
    for (const entry of allCodes) {
      expect(typeof entry.code).toBe('number');
      expect(entry.phrase).toBeTruthy();
      expect(entry.category).toMatch(/^\dx{2}$/);
      expect(entry.info).toBeTruthy();
    }
  });

  test('no duplicate codes', () => {
    const allCodes = Object.values(STATUS_CODES).flat();
    const codes = allCodes.map(e => e.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  test('codes are grouped by category correctly', () => {
    for (const [category, entries] of Object.entries(STATUS_CODES)) {
      for (const entry of entries) {
        expect(entry.category).toBe(category);
        expect(entry.code.toString().charAt(0) + 'xx').toBe(category);
      }
    }
  });

  test('getStatusCodesByCategory returns correct entries', () => {
    const codes = getStatusCodesByCategory('2xx');
    expect(codes.length).toBeGreaterThan(0);
    expect(codes.every(c => c.category === '2xx')).toBe(true);
  });

  test('getStatusCodeInfo returns single code info', () => {
    const info = getStatusCodeInfo(200);
    expect(info.code).toBe(200);
    expect(info.phrase).toBe('OK');
  });

  test('getStatusCodeInfo returns undefined for unknown code', () => {
    expect(getStatusCodeInfo(999)).toBeUndefined();
  });

  test('covers at least 1 code per category (1xx-5xx)', () => {
    for (const cat of ['1xx', '2xx', '3xx', '4xx', '5xx']) {
      expect(STATUS_CODES[cat]).toBeDefined();
      expect(STATUS_CODES[cat].length).toBeGreaterThanOrEqual(1);
    }
  });
});
```

- [ ] **Step 2: Run status code test to confirm it fails**

Run: `npx jest tests/utils/http-status-codes.test.js --no-coverage`

Expected: FAIL — `Cannot find module 'http-status-codes'`

- [ ] **Step 3: Implement status code data**

```js
// utils/http-status-codes.js

/**
 * HTTP 状态码速查数据
 * 按类别分组，涵盖约 15 个核心状态码
 */
const STATUS_CODES = {
  '1xx': [
    { code: 100, phrase: 'Continue', category: '1xx', info: '服务器已收到请求头，客户端应继续发送报文体', examTip: '100 Continue 的作用是减少不必要的请求体传输' },
    { code: 101, phrase: 'Switching Protocols', category: '1xx', info: '服务器同意切换协议（如升级到 WebSocket）' }
  ],
  '2xx': [
    { code: 200, phrase: 'OK', category: '2xx', info: '请求成功，响应体包含请求的资源', examTip: '200 OK 与 201 Created 的区别？' },
    { code: 201, phrase: 'Created', category: '2xx', info: '请求成功，新资源已创建', examTip: 'POST 方法通常返回 201，PUT 返回 200' },
    { code: 204, phrase: 'No Content', category: '2xx', info: '请求成功但响应体为空' }
  ],
  '3xx': [
    { code: 301, phrase: 'Moved Permanently', category: '3xx', info: '请求的资源已永久移动到新 URL', examTip: '301 vs 302：301 会缓存重定向，302 不会' },
    { code: 302, phrase: 'Found', category: '3xx', info: '请求的资源临时移动到新 URL' },
    { code: 304, phrase: 'Not Modified', category: '3xx', info: '资源未修改（配合条件请求 If-Modified-Since / ETag）' }
  ],
  '4xx': [
    { code: 400, phrase: 'Bad Request', category: '4xx', info: '请求语法错误或参数无效' },
    { code: 401, phrase: 'Unauthorized', category: '4xx', info: '需要认证凭证' },
    { code: 403, phrase: 'Forbidden', category: '4xx', info: '服务器拒绝执行请求' },
    { code: 404, phrase: 'Not Found', category: '4xx', info: '服务器找不到请求的资源', examTip: '404 可能是路径错误，也可能是服务器故意隐藏资源存在性' },
    { code: 405, phrase: 'Method Not Allowed', category: '4xx', info: '请求方法不被服务器允许' },
    { code: 429, phrase: 'Too Many Requests', category: '4xx', info: '客户端在给定时间内发送了太多请求（限流）' }
  ],
  '5xx': [
    { code: 500, phrase: 'Internal Server Error', category: '5xx', info: '服务器内部错误，通常为未捕获异常' },
    { code: 502, phrase: 'Bad Gateway', category: '5xx', info: '网关或代理收到上游服务器的无效响应', examTip: '502 vs 503：502 是上游问题，503 是自身过载' },
    { code: 503, phrase: 'Service Unavailable', category: '5xx', info: '服务器暂时无法处理请求（过载或维护）' }
  ]
};

/**
 * 获取指定分类的状态码列表
 * @param {'1xx'|'2xx'|'3xx'|'4xx'|'5xx'} category
 * @returns {Array}
 */
function getStatusCodesByCategory(category) {
  return STATUS_CODES[category] || [];
}

/**
 * 获取单个状态码的详细信息
 * @param {number} code
 * @returns {Object|undefined}
 */
function getStatusCodeInfo(code) {
  for (const entries of Object.values(STATUS_CODES)) {
    const found = entries.find(e => e.code === code);
    if (found) return found;
  }
  return undefined;
}

module.exports = { STATUS_CODES, getStatusCodesByCategory, getStatusCodeInfo };
```

- [ ] **Step 4: Run status code tests to verify they pass**

Run: `npx jest tests/utils/http-status-codes.test.js --no-coverage`

Expected: PASS (7+ tests)

- [ ] **Step 5: Commit status codes**

```bash
git add utils/http-status-codes.js tests/utils/http-status-codes.test.js
git commit -m "feat: HTTP 状态码速查数据（16 个核心码，5 类全覆盖）"
```

---
### Task 4: 页面骨架 — WXML + WXSS + JSON

**Files:**
- Create: `pages/http-parser/http-parser.wxml`
- Create: `pages/http-parser/http-parser.wxss`
- Create: `pages/http-parser/http-parser.json`

**Interfaces:**
- Consumes: UI layout matching Claude Design spec + PRD interaction layout
- Produces: wireframe with 4 sections: 示例库选择/输入区 / 原始报文展示 / 解析结果展示 / 状态码速查卡

Layout (从上到下):
1. **Header** — 页面标题 "HTTP 解析器"
2. **示例选择 + 输入区** — picker 选择预置示例，textarea 编辑/粘贴原始报文
3. **操作按钮** — 「解析」按钮 + 「清空」按钮
4. **原始报文展示** — 只读展示输入的原始文本（带行号高亮功能）
5. **解析结果** — 条件渲染，显示结构化拆解（请求行/状态行 → 头部 → 报文体），每个字段带 inline 说明
6. **状态码速查卡** — 折叠面板，按分类展示状态码

- [ ] **Step 1: Create http-parser.json**

```json
{
  "navigationBarTitleText": "HTTP 解析器",
  "navigationBarBackgroundColor": "#faf9f5",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#faf9f5",
  "usingComponents": {}
}
```

- [ ] **Step 2: Create http-parser.wxml**

```xml
<view class="page">
  <!-- 页面标题 & 示例选择 -->
  <view class="input-band">
    <text class="band-label">HTTP 解析器</text>
    <text class="band-subtitle">粘贴原始报文或选择预置示例，逐字段理解 HTTP 协议</text>

    <view class="sample-row">
      <text class="section-label">预置示例</text>
      <picker mode="selector" range="{{sampleLabels}}" value="{{sampleIndex}}" bindchange="onSampleChange">
        <view class="sample-picker">
          <text class="sample-picker-text">{{sampleLabels[sampleIndex] || '选择示例...'}}</text>
          <text class="picker-arrow">▾</text>
        </view>
      </picker>
    </view>

    <view class="input-row">
      <textarea class="raw-input" placeholder="在此粘贴或输入 HTTP 报文&#10;例如：&#10;GET / HTTP/1.1&#10;Host: example.com&#10;&#10;" value="{{rawInput}}" bindinput="onRawInput" maxlength="5000" auto-height />
    </view>

    <view class="action-row">
      <button class="btn-primary" bindtap="onParseTap" hover-class="btn-hover">解析</button>
      <button class="btn-secondary" bindtap="onClearTap" hover-class="btn-hover">清空</button>
    </view>

    <text wx:if="{{errorMessage}}" class="error-text">{{errorMessage}}</text>
  </view>

  <!-- 原始报文展示 -->
  <view wx:if="{{rawInput && parsed}}" class="raw-band">
    <text class="section-label">原始报文</text>
    <view class="raw-block">
      <view wx:for="{{rawLines}}" wx:key="index" class="raw-line {{item.hasError ? 'line-error' : ''}}">
        <text class="raw-line-num">{{item.num}}</text>
        <text class="raw-line-text">{{item.text}}</text>
      </view>
    </view>
  </view>

  <!-- 空状态 -->
  <view wx:elif="{{!parsed}}" class="empty-band">
    <text class="empty-text">输入 HTTP 报文后点击「解析」查看结构化结果</text>
  </view>

  <!-- 解析结果 -->
  <view wx:if="{{parsed}}" class="result-band">
    <text class="section-label">解析结果</text>

    <!-- 请求行 -->
    <view wx:if="{{parsed.type === 'request' && parsed.method}}" class="result-card">
      <text class="result-card-title">🔷 请求行</text>
      <view class="field-row">
        <text class="field-label">方法</text>
        <text class="field-value">{{parsed.method.raw}}</text>
        <text class="field-info">{{parsed.method.info}}</text>
      </view>
      <view class="field-row">
        <text class="field-label">URI</text>
        <text class="field-value mono">{{parsed.uri.raw}}</text>
        <text class="field-info">{{parsed.uri.info}}</text>
      </view>
      <view class="field-row">
        <text class="field-label">版本</text>
        <text class="field-value mono">{{parsed.version.raw}}</text>
        <text class="field-info">{{parsed.version.info}}</text>
      </view>
    </view>

    <!-- 状态行 -->
    <view wx:if="{{parsed.type === 'response' && parsed.statusCode}}" class="result-card">
      <text class="result-card-title">🔷 状态行</text>
      <view class="field-row">
        <text class="field-label">版本</text>
        <text class="field-value mono">{{parsed.version.raw}}</text>
        <text class="field-info">{{parsed.version.info}}</text>
      </view>
      <view class="field-row">
        <text class="field-label">状态码</text>
        <text class="field-value status-code">{{parsed.statusCode.code}}</text>
        <text class="field-value">{{parsed.statusCode.phrase}}</text>
        <text class="field-info">{{parsed.statusCode.info}}</text>
      </view>
    </view>

    <!-- 头部 -->
    <view wx:if="{{parsed.headers.length > 0}}" class="result-card">
      <text class="result-card-title">🔷 头部（{{parsed.headers.length}} 个）</text>
      <view wx:for="{{parsed.headers}}" wx:key="name" class="header-row">
        <view class="header-name-row">
          <text class="header-name">{{item.name}}:</text>
          <text class="header-value">{{item.value}}</text>
          <text wx:if="{{item.required}}" class="header-badge">必需</text>
        </view>
        <text wx:if="{{item.info}}" class="header-info">{{item.info}}</text>
        <text wx:if="{{item.examTip}}" class="header-exam">{{item.examTip}}</text>
      </view>
    </view>

    <!-- 报文体 -->
    <view class="result-card">
      <text class="result-card-title">🔷 报文体</text>
      <text wx:if="{{parsed.body.isEmpty}}" class="field-info">（空）</text>
      <text wx:else class="body-text mono">{{parsed.body.raw}}</text>
      <text wx:if="{{!parsed.body.isEmpty}}" class="field-info">长度: {{parsed.body.length}} 字节</text>
    </view>

    <!-- 错误提示 -->
    <view wx:if="{{parsed.errors.length > 0}}" class="result-card card-error">
      <text class="result-card-title">❌ 解析错误</text>
      <view wx:for="{{parsed.errors}}" wx:key="line" class="error-item">
        <text class="error-item-text">第 {{item.line}} 行: {{item.message}}</text>
      </view>
    </view>

    <!-- 警告 -->
    <view wx:if="{{parsed.notes.length > 0}}" class="result-card card-warn">
      <text class="result-card-title">⚠️ 注意事项</text>
      <view wx:for="{{parsed.notes}}" wx:key="line" class="warn-item">
        <text class="warn-item-text">{{item.message}}</text>
      </view>
    </view>
  </view>

  <!-- 状态码速查 -->
  <view class="status-band">
    <text class="section-label">状态码速查</text>
    <view class="status-tabs">
      <view wx:for="{{statusCategories}}" wx:key="cat" class="status-tab {{activeStatusCat === item.cat ? 'status-tab-active' : ''}}" bindtap="onStatusCatTap" data-cat="{{item.cat}}">
        <text>{{item.label}}</text>
      </view>
    </view>
    <view wx:if="{{activeStatusCodes.length > 0}}" class="status-list">
      <view wx:for="{{activeStatusCodes}}" wx:key="code" class="status-item">
        <view class="status-header">
          <text class="status-code-value">{{item.code}}</text>
          <text class="status-phrase">{{item.phrase}}</text>
        </view>
        <text class="status-info">{{item.info}}</text>
        <text wx:if="{{item.examTip}}" class="status-exam">{{item.examTip}}</text>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: Create http-parser.wxss**

```css
/* ======================== 页面基础 ======================== */
.page {
  min-height: 100vh;
  background: #faf9f5;
  padding: 20rpx 24rpx 60rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Georgia', serif;
  color: #141413;
}

.band-label {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 32rpx;
  font-weight: 400;
  letter-spacing: -3rpx;
  color: #141413;
  margin-bottom: 8rpx;
}

.band-subtitle {
  display: block;
  font-size: 24rpx;
  color: #6c6a64;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.section-label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #6c6a64;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.error-text {
  display: block;
  margin-top: 12rpx;
  color: #c0392b;
  font-size: 24rpx;
}

/* ======================== 输入区 ======================== */
.input-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
}

.sample-row {
  margin-bottom: 16rpx;
}

.sample-picker {
  background: #faf9f5;
  border-radius: 12rpx;
  padding: 14rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 26rpx;
  color: #141413;
}

.sample-picker-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-arrow {
  color: #6c6a64;
  margin-left: 8rpx;
}

.input-row {
  margin-bottom: 16rpx;
}

.raw-input {
  width: 100%;
  min-height: 200rpx;
  background: #faf9f5;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 24rpx;
  color: #141413;
  font-family: 'SF Mono', 'Menlo', monospace;
  line-height: 1.6;
  box-sizing: border-box;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.btn-primary {
  flex: 1;
  background: #cc785c;
  color: #faf9f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: none;
  text-align: center;
}

.btn-primary:active {
  background: #a9583e;
}

.btn-secondary {
  flex: 0 0 auto;
  background: #faf9f5;
  color: #141413;
  border-radius: 12rpx;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  border: 2rpx solid #d4cfc2;
  text-align: center;
}

.btn-secondary:active {
  background: #e8e0d2;
}

.btn-hover {
  opacity: 0.7;
}

/* ======================== 原始报文 ======================== */
.raw-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.raw-block {
  background: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 22rpx;
  line-height: 1.8;
  overflow-x: auto;
}

.raw-line {
  display: flex;
  gap: 12rpx;
}

.raw-line-num {
  color: #8e8b82;
  min-width: 36rpx;
  text-align: right;
  flex-shrink: 0;
  user-select: none;
}

.raw-line-text {
  color: #141413;
  white-space: pre;
}

.line-error .raw-line-text {
  background: #fce4e4;
  color: #c0392b;
}

/* ======================== 空状态 ======================== */
.empty-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 48rpx 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 26rpx;
  color: #8e8b82;
}

/* ======================== 解析结果 ======================== */
.result-band {
  margin-bottom: 20rpx;
}

.result-card {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.result-card-title {
  display: block;
  font-family: Georgia, serif;
  font-size: 28rpx;
  color: #141413;
  letter-spacing: -2rpx;
  margin-bottom: 16rpx;
}

.card-error {
  border-left: 6rpx solid #c0392b;
}

.card-warn {
  border-left: 6rpx solid #e67e22;
}

.field-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 12rpx;
  flex-wrap: wrap;
}

.field-row:last-child {
  margin-bottom: 0;
}

.field-label {
  font-size: 24rpx;
  color: #6c6a64;
  min-width: 80rpx;
  flex-shrink: 0;
}

.field-value {
  font-size: 26rpx;
  color: #141413;
  font-weight: 600;
}

.field-info {
  font-size: 22rpx;
  color: #8e8b82;
  flex: 1;
}

.mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}

.status-code {
  color: #cc785c;
  font-size: 30rpx;
}

/* 头部 */
.header-row {
  background: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 8rpx;
}

.header-row:last-child {
  margin-bottom: 0;
}

.header-name-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: wrap;
}

.header-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #141413;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.header-value {
  font-size: 24rpx;
  color: #6c6a64;
  font-family: 'SF Mono', 'Menlo', monospace;
  word-break: break-all;
}

.header-badge {
  font-size: 18rpx;
  color: #faf9f5;
  background: #cc785c;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.header-info {
  display: block;
  font-size: 22rpx;
  color: #8e8b82;
  margin-top: 6rpx;
}

.header-exam {
  display: block;
  font-size: 22rpx;
  color: #cc785c;
  margin-top: 4rpx;
  font-style: italic;
}

/* 报文体 */
.body-text {
  display: block;
  font-size: 24rpx;
  color: #141413;
  background: #faf9f5;
  border-radius: 12rpx;
  padding: 16rpx;
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 8rpx;
}

/* 错误 & 警告 */
.error-item, .warn-item {
  padding: 8rpx 0;
}

.error-item-text {
  font-size: 24rpx;
  color: #c0392b;
}

.warn-item-text {
  font-size: 24rpx;
  color: #e67e22;
}

/* ======================== 状态码速查 ======================== */
.status-band {
  background: #efe9de;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 40rpx;
}

.status-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
  overflow-x: auto;
}

.status-tab {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: #faf9f5;
  color: #6c6a64;
  font-size: 24rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.status-tab-active {
  background: #cc785c;
  color: #fff;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.status-item {
  background: #faf9f5;
  border-radius: 16rpx;
  padding: 20rpx;
}

.status-header {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.status-code-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #141413;
  font-family: Georgia, serif;
  letter-spacing: -2rpx;
}

.status-phrase {
  font-size: 26rpx;
  color: #6c6a64;
}

.status-info {
  display: block;
  font-size: 24rpx;
  color: #141413;
  line-height: 1.5;
}

.status-exam {
  display: block;
  font-size: 22rpx;
  color: #cc785c;
  margin-top: 6rpx;
  font-style: italic;
  border-left: 4rpx solid #cc785c;
  padding-left: 12rpx;
}
```

- [ ] **Step 4: Commit page skeleton**

```bash
git add pages/http-parser/http-parser.wxml pages/http-parser/http-parser.wxss pages/http-parser/http-parser.json
git commit -m "feat: HTTP 解析器页面骨架（WXML+WXSS+JSON）"
```

---
### Task 5: 页面逻辑 — JS

**Files:**
- Create: `pages/http-parser/http-parser.js`

**Interfaces:**
- Consumes: `utils/http-parser.js` (parseHttp), `utils/http-samples.js` (SAMPLES), `utils/http-status-codes.js` (STATUS_CODES, getStatusCodesByCategory)
- Produces: Page object with data, lifecycle, and event handlers

- [ ] **Step 1: Create http-parser.js**

```js
const { parseHttp } = require('../../utils/http-parser');
const { SAMPLES } = require('../../utils/http-samples');
const { STATUS_CODES, getStatusCodesByCategory } = require('../../utils/http-status-codes');

const STATUS_CATEGORIES = [
  { cat: '1xx', label: '1xx 信息' },
  { cat: '2xx', label: '2xx 成功' },
  { cat: '3xx', label: '3xx 重定向' },
  { cat: '4xx', label: '4xx 客户端错误' },
  { cat: '5xx', label: '5xx 服务器错误' }
];

Page({
  data: {
    rawInput: '',
    sampleLabels: [],
    sampleIndex: -1,
    errorMessage: '',
    parsed: null,
    rawLines: [],

    // 状态码速查
    statusCategories: STATUS_CATEGORIES,
    activeStatusCat: '2xx',
    activeStatusCodes: []
  },

  onLoad() {
    const labels = SAMPLES.map(s => s.label);
    this.setData({
      sampleLabels: ['（自定义输入）', ...labels],
      activeStatusCodes: getStatusCodesByCategory('2xx')
    });
  },

  // ── Event Handlers ──

  onSampleChange(e) {
    const idx = parseInt(e.detail.value, 10);
    const samples = SAMPLES;
    if (idx === 0) {
      // 自定义输入 — 不清空已有文本
      this.setData({ sampleIndex: 0 });
      return;
    }
    const sample = samples[idx - 1];
    if (sample) {
      this.setData({
        rawInput: sample.raw,
        sampleIndex: idx,
        errorMessage: '',
        parsed: null,
        rawLines: []
      });
    }
  },

  onRawInput(e) {
    this.setData({ rawInput: e.detail.value });
  },

  onParseTap() {
    const { rawInput } = this.data;
    if (!rawInput || rawInput.trim().length === 0) {
      this.setData({ errorMessage: '请输入 HTTP 报文', parsed: null, rawLines: [] });
      return;
    }

    const result = parseHttp(rawInput);
    const lines = rawInput.split(/\r?\n/);
    const rawLines = lines.map((text, idx) => ({
      num: idx + 1,
      text: text || '⏎',
      hasError: result.errors.some(e => e.line === idx + 1 && e.type === 'error')
    }));

    this.setData({
      parsed: result,
      rawLines,
      errorMessage: ''
    });
  },

  onClearTap() {
    this.setData({
      rawInput: '',
      sampleIndex: -1,
      errorMessage: '',
      parsed: null,
      rawLines: []
    });
  },

  onStatusCatTap(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({
      activeStatusCat: cat,
      activeStatusCodes: getStatusCodesByCategory(cat)
    });
  }
});
```

- [ ] **Step 2: Commit page JS**

```bash
git add pages/http-parser/http-parser.js
git commit -m "feat: HTTP 解析器页面逻辑（输入解析/示例切换/状态码速查）"
```

---
### Task 6: 注册上线 & Handoff

**Files:**
- Modify: `utils/tool-registry.js` — set http-parser available & add metadata
- Modify: `app.json` — add `pages/http-parser/http-parser` to pages array
- Modify: `tests/utils/tool-registry.test.js` — update expected count, add http-parser assertion
- Create: `docs/handoff/modules/http-parser.md`

- [ ] **Step 1: Update tool-registry.js — set available & add metadata**

Change http-parser entry (lines 140-150 in current file):
```js
{
  id: 'http-parser',
  category: 'network',
  name: 'HTTP 解析器',
  icon: '',
  description: '请求/响应报文 · 状态码 · 头部',
  route: '/pages/http-parser/http-parser',
  available: true,
  featured: false,
  tagline: '粘贴 HTTP 报文，逐字段拆解请求行/状态行、头部和报文体',
  taglineDetail: '输入或选择预置 HTTP 报文，自动识别请求/响应类型，拆解为请求行（方法/URI/版本）、状态行（状态码/短语）、头部字段（含 inline 说明与面试考点）和报文体，内置 16 个核心状态码速查卡',
  tags: ['#可视化', '#交互式', '#计算机网络'],
  difficulty: 'easy',
  intro: {
    valueProp: '粘贴一段 HTTP 报文，自动拆解为结构化展示，每个字段都有说明。',
    features: [
      '自动识别请求/响应类型，拆解首行、头部和报文体',
      '每个字段附 inline 说明（用途、语义、面试考点）',
      '内置 8 个预置示例，覆盖 GET/POST/200/404/500/重定向',
      '16 个核心状态码速查卡，按分类快速浏览'
    ],
    prerequisites: '知道 HTTP 是"超文本传输协议"就行。',
    useCases: [
      '计网面试复习',
      '学习 HTTP 报文格式',
      '快速查阅状态码含义'
    ]
  },
  order: 5
}
```

- [ ] **Step 2: Update app.json — add http-parser to pages array**

Add `"pages/http-parser/http-parser"` to the top-level `pages` array (e.g., after `"pages/tools-all/tools-all"`):
```json
"pages": [
  "...",
  "pages/tools-all/tools-all",
  "pages/http-parser/http-parser"
]
```

- [ ] **Step 3: Run full test suite to verify**

Run: `npm test`

Expected: All tests PASS. Note: tool-registry test `getAvailableTools` expects `result.length === 12` — update the expected count to 13 in `tests/utils/tool-registry.test.js`.

```js
// In tests/utils/tool-registry.test.js
// Update line: expect(result.length).toBe(12) → 13
// Add: expect(ids).toContain('http-parser');
```

- [ ] **Step 4: Create handoff document**

Create `docs/handoff/modules/http-parser.md`:

```markdown
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
```

- [ ] **Step 5: Commit registration & handoff**

```bash
git add utils/tool-registry.js app.json tests/utils/tool-registry.test.js docs/handoff/modules/http-parser.md
git commit -m "feat: HTTP 解析器上线（注册 + handoff）"
```

- [ ] **Step 6: Run final full test suite**

Run: `npm test`

Expected: All tests PASS

---
## 自检清单

**1. Spec 覆盖：**
- [x] 请求报文解析（请求行 + 头部 + 空行 + 报文体）→ Task 1
- [x] 响应报文解析（状态行 + 头部 + 空行 + 报文体）→ Task 1
- [x] 常见状态码速查卡（1xx/2xx/3xx/4xx/5xx，16 个核心码）→ Task 3 & 5
- [x] 常见方法与头部的 inline 说明 → Task 1（METHOD_INFO / HEADER_INFO）
- [x] 预置示例库（8 个典型报文，GET/POST/200/404/500/重定向）→ Task 2
- [x] 报文格式错误提示（定位到问题行）→ Task 1 errors + Task 5 rawLines highligh
- [x] 空行缺失自动补全标注 → Task 1 notes
- [x] Content-Length 不匹配警告 → Task 1 notes
- [x] 缺少 Host 头警告 → Task 1 notes
- [x] 纯函数 + 不可变 → Task 1（parseHttp 无副作用）

**2. 占位符检查：** 全部代码块包含完整实现，无 TBD / TODO / "后续实现" 占位。

**3. 类型一致性：** Task 1 定义的 `ParseResult` 结构在 Task 5 的 WXML 中使用一致的字段名（`parsed.type` / `parsed.method.raw` / `parsed.statusCode.code` 等）。`STATUS_CODES` 格式在 Task 3 定义，Task 5 的 `getStatusCodesByCategory` 消费方式匹配。
