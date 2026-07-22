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
