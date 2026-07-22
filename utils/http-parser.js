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

function _detectType(text) {
  const firstLine = text.split(/\r?\n/)[0];
  if (/^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s/.test(firstLine)) return 'request';
  if (/^HTTP\/\d\.\d\s+\d{3}/.test(firstLine)) return 'response';
  return 'request';
}

function _parseRequestLine(line) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 3) {
    return { error: true, message: '请求行格式错误：应为 METHOD URI VERSION', line: line };
  }
  const method = parts[0];
  const uri = parts[1];
  const version = parts[2];
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
    return { error: true, message: '状态行格式错误：应为 HTTP/X.X XXX 短语', line: line };
  }
  const version = match[1];
  const code = match[2];
  const phrase = match[3];
  const codeNum = parseInt(code, 10);
  const statusInfo = STATUS_PHRASE_INFO[codeNum];
  return {
    version: { raw: version, info: '超文本传输协议版本' },
    statusCode: {
      code: codeNum,
      phrase: phrase,
      category: code.charAt(0) + 'xx',
      info: statusInfo ? statusInfo.info : '未知状态码'
    },
    error: false
  };
}

function _parseHeaders(lines) {
  const headers = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const name = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    const known = HEADER_INFO[name.toLowerCase()];
    headers.push({
      name: name,
      value: value,
      required: known ? known.required : false,
      info: known ? known.info : '自定义头部',
      examTip: known ? known.examTip : undefined
    });
  }
  return headers;
}

function _extractBody(text) {
  const bodyStart = text.indexOf('\r\n\r\n');
  if (bodyStart === -1) {
    const bodyStartN = text.indexOf('\n\n');
    if (bodyStartN === -1) return { raw: '', isEmpty: true, length: 0 };
    const raw = text.slice(bodyStartN + 2);
    return { raw: raw, isEmpty: raw.length === 0, length: raw.length };
  }
  const raw = text.slice(bodyStart + 4);
  return { raw: raw, isEmpty: raw.length === 0, length: raw.length };
}

/**
 * 解析原始 HTTP 报文
 * @param {string} text - 完整 HTTP 报文文本
 * @returns {ParseResult}
 */
function _parseFirstLine(type, firstLine, errors) {
  let version = { raw: '', info: '' };
  let method;
  let uri;
  let statusCode;

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

  return { version: version, method: method, uri: uri, statusCode: statusCode };
}

function _parseBlankLineAndHeaders(lines, errors, notes) {
  // Find blank line separating headers from body
  let blankLineIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      blankLineIdx = i;
      break;
    }
  }

  const headerLines = lines.slice(1, blankLineIdx === -1 ? lines.length : blankLineIdx).filter(function(l) { return l.trim(); });
  const headers = _parseHeaders(headerLines);

  if (blankLineIdx === -1) {
    notes.push({ line: lines.length, type: 'warn', message: '缺少空行分隔头部与报文体（非标准格式）' });
  }

  return { headers: headers, blankLineIdx: blankLineIdx };
}

function _validateHeaders(type, headers, body, notes) {
  // Check Content-Length mismatch
  let clHeader = null;
  for (let j = 0; j < headers.length; j++) {
    if (headers[j].name.toLowerCase() === 'content-length') {
      clHeader = headers[j];
      break;
    }
  }
  if (clHeader && !body.isEmpty) {
    const declared = parseInt(clHeader.value, 10);
    if (!isNaN(declared) && declared !== body.length) {
      notes.push({ line: 1, type: 'warn', message: 'Content-Length 声明 ' + declared + ' 与实际报文体长度 ' + body.length + ' 不一致' });
    }
  }

  // Check missing Host header for request
  if (type === 'request') {
    let hasHost = false;
    for (let k = 0; k < headers.length; k++) {
      if (headers[k].name.toLowerCase() === 'host') {
        hasHost = true;
        break;
      }
    }
    if (!hasHost) {
      notes.push({ line: 1, type: 'warn', message: '警告：缺少 Host 头（HTTP/1.1 必需）' });
    }
  }
}

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

  const firstLineResult = _parseFirstLine(type, firstLine, errors);
  const version = firstLineResult.version;
  const method = firstLineResult.method;
  const uri = firstLineResult.uri;
  const statusCode = firstLineResult.statusCode;

  const blankLineResult = _parseBlankLineAndHeaders(lines, errors, notes);
  const headers = blankLineResult.headers;

  // Body extraction
  const body = _extractBody(text);

  _validateHeaders(type, headers, body, notes);

  const result = { type: type, headers: headers, body: body, errors: errors, notes: notes, version: version };
  if (method) result.method = method;
  if (uri) result.uri = uri;
  if (statusCode) result.statusCode = statusCode;

  return result;
}

module.exports = { parseHttp };
