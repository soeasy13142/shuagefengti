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
    const raw = 'POST /api/data HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\nContent-Length: ' + body.length + '\r\n\r\n' + body;
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

describe('parseHttp — error handling', () => {
  test('returns error for empty input', () => {
    const result = parseHttp('');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('flags malformed first line as request', () => {
    const result = parseHttp('INVALID_LINE\r\nHost: x.com\r\n\r\n');
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

  test('headers without colon are skipped gracefully', () => {
    const raw = 'GET / HTTP/1.1\r\nBadHeaderNoColon\r\n\r\n';
    const result = parseHttp(raw);
    expect(result.headers).toHaveLength(0);
  });
});
