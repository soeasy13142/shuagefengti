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
  const allEntries = Object.values(STATUS_CODES);
  for (let i = 0; i < allEntries.length; i++) {
    const entries = allEntries[i];
    for (let j = 0; j < entries.length; j++) {
      if (entries[j].code === code) return entries[j];
    }
  }
  return undefined;
}

module.exports = { STATUS_CODES, getStatusCodesByCategory, getStatusCodeInfo };
