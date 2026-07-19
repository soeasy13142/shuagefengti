#!/usr/bin/env node

/**
 * WeChat DevTools MCP Server
 *
 * Provides tools for Claude Code to interact with WeChat Developer Tools
 * via miniprogram-automator (WebSocket automation protocol).
 *
 * Usage:
 *   1. Enable service port in 微信开发者工具 → 设置 → 安全 → 服务端口
 *   2. Ensure the mini-program project is open in DevTools
 *   3. This server auto-connects via cli auto --auto-port <port>
 *
 * Tools:
 *   - devtools_connect       — Connect to DevTools, return current page info
 *   - devtools_navigate      — Navigate to a page
 *   - devtools_logs          — Read captured console logs
 *   - devtools_get_data      — Get current page data/state
 *   - devtools_call_method   — Call a method on the current page
 *   - devtools_system_info   — Get device/system info
 *   - devtools_screenshot    — Capture simulator screenshot (base64)
 *   - devtools_disconnect    — Disconnect and clean up
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const _require = createRequire(import.meta.url);

// ──────────────────────────────────────────────
// MCP Protocol helpers
// ──────────────────────────────────────────────

const CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
const PROJECT_PATH = resolve(import.meta.dirname || '.', '..');

let automator = null;
let miniProgram = null;
let currentPage = null;
let capturedLogs = [];
let connected = false;
let automationProcess = null;
let currentPort = null;
let pendingCount = 0;

// Try to load miniprogram-automator
try {
  automator = _require('miniprogram-automator');
} catch {
  // Will be handled when tools are called
}

function jsonRpcError(id, code, message) {
  return JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
}

function jsonRpcResult(id, result) {
  return JSON.stringify({ jsonrpc: '2.0', id, result });
}

function jsonRpcNotification(method, params) {
  return JSON.stringify({ jsonrpc: '2.0', method, params });
}

// ──────────────────────────────────────────────
// Find available port
// ──────────────────────────────────────────────

function findAvailablePort(start = 9420) {
  return new Promise((resolve) => {
    const server = createServer();
    server.on('error', () => resolve(findAvailablePort(start + 1)));
    server.listen(start, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.unref();
  });
}

// ──────────────────────────────────────────────
// DevTools connection management
// ──────────────────────────────────────────────

async function ensureConnected(port) {
  if (connected && miniProgram) {
    // Quick check if connection is still alive
    try {
      await miniProgram.currentPage();
      return { connected: true, port: currentPort };
    } catch {
      // Connection lost, reconnect
      connected = false;
    }
  }
  return await connect(port);
}

async function connect(port) {
  if (!automator) {
    try {
      automator = _require('miniprogram-automator');
    } catch {
      return { error: 'miniprogram-automator not installed. Run: npm install --save-dev miniprogram-automator' };
    }
  }

  // Clean up any existing connection and lingering processes
  await disconnect();

  // Kill any leftover cli auto processes from previous sessions
  try {
    spawn('pkill', ['-f', 'cli auto --project'], { stdio: 'ignore' }).unref();
  } catch { /* ok */ }
  await new Promise(r => setTimeout(r, 1000));

  const autoPort = port || await findAvailablePort(9420);

  try {
    // Launch automation via CLI
    const cli = spawn(CLI_PATH, [
      'auto',
      '--project', PROJECT_PATH,
      '--auto-port', String(autoPort)
    ], { stdio: 'ignore' });

    automationProcess = cli;

    // Wait for the WebSocket server to be ready, then connect
    miniProgram = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20000);
      const tryConnect = async () => {
        try {
          const conn = await automator.connect({ wsEndpoint: `ws://127.0.0.1:${autoPort}` });
          clearTimeout(timeout);
          resolve(conn);
        } catch {
          setTimeout(tryConnect, 500);
        }
      };
      tryConnect();
    });
    currentPort = autoPort;
    connected = true;

    // Handle disconnection events
    miniProgram.on('disconnect', () => {
      connected = false;
    });

    // Give the WebSocket server a moment to stabilize
    await new Promise(r => setTimeout(r, 1500));

    // Get current page
    try {
      currentPage = await miniProgram.currentPage();
    } catch {
      currentPage = null;
    }

    // Enable console log capture
    try {
      await miniProgram.send('App.enableLog');
      miniProgram.on('console', (log) => {
        capturedLogs.push(log);
      });
    } catch {
      // Log capture not critical
    }

    return {
      connected: true,
      port: autoPort,
      currentPage: currentPage ? { path: currentPage.path, id: currentPage.id } : null,
      projectPath: PROJECT_PATH
    };
  } catch (err) {
    cleanup();
    return { error: `Failed to connect: ${err.message}` };
  }
}

async function disconnect() {
  if (miniProgram) {
    try { miniProgram.disconnect(); } catch { /* ignore */ }
    miniProgram = null;
  }
  if (automationProcess) {
    try { automationProcess.kill(); } catch { /* ignore */ }
    automationProcess = null;
  }
  currentPage = null;
  capturedLogs = [];
  connected = false;
  currentPort = null;
}

function cleanup() {
  if (automationProcess) {
    try { automationProcess.kill(); } catch { /* ignore */ }
    automationProcess = null;
  }
  connected = false;
}

// ──────────────────────────────────────────────
// Tool implementations
// ──────────────────────────────────────────────

async function toolConnect(params) {
  const result = await connect(params?.port || null);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}

async function toolNavigate(params) {
  if (!params?.url) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'Missing required param: url' }) }] };
  }
  const conn = await ensureConnected();
  if (conn.error) return { content: [{ type: 'text', text: JSON.stringify(conn) }] };

  try {
    const page = await miniProgram.navigateTo(params.url);
    currentPage = page;
    // Wait for page to settle
    await new Promise(r => setTimeout(r, 1500));
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, page: { path: page.path, id: page.id } }, null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: `Navigate failed: ${err.message}` }) }] };
  }
}

async function toolLogs(params) {
  const conn = await ensureConnected();
  if (conn.error) return { content: [{ type: 'text', text: JSON.stringify(conn) }] };

  const logs = [...capturedLogs];
  if (params?.clear) {
    capturedLogs = [];
  }
  return { content: [{ type: 'text', text: JSON.stringify({ count: logs.length, logs }, null, 2) }] };
}

async function toolGetData(params) {
  const conn = await ensureConnected();
  if (conn.error) return { content: [{ type: 'text', text: JSON.stringify(conn) }] };

  if (!currentPage) {
    // Try to get current page
    try {
      currentPage = await miniProgram.currentPage();
    } catch {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'No page available. Navigate to a page first.' }) }] };
    }
  }

  try {
    const data = await currentPage.data(params?.path || '');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: `Get data failed: ${err.message}` }) }] };
  }
}

async function toolCallMethod(params) {
  if (!params?.method) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'Missing required param: method' }) }] };
  }
  const conn = await ensureConnected();
  if (conn.error) return { content: [{ type: 'text', text: JSON.stringify(conn) }] };

  if (!currentPage) {
    try {
      currentPage = await miniProgram.currentPage();
    } catch {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'No page available.' }) }] };
    }
  }

  try {
    const result = await currentPage.callMethod(params.method, ...(params.args || []));
    // Wait briefly for side effects
    await new Promise(r => setTimeout(r, 1000));
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, result }, null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: `Call method '${params.method}' failed: ${err.message}` }) }] };
  }
}

async function toolSystemInfo() {
  const conn = await ensureConnected();
  if (conn.error) return { content: [{ type: 'text', text: JSON.stringify(conn) }] };

  try {
    const info = await miniProgram.systemInfo();
    return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }] };
  }
}

async function toolScreenshot() {
  const conn = await ensureConnected();
  if (conn.error) return { content: [{ type: 'text', text: JSON.stringify(conn) }] };

  try {
    const base64 = await miniProgram.screenshot();
    return { content: [{ type: 'text', text: JSON.stringify({ data: base64 }) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }] };
  }
}

async function toolDisconnect() {
  await disconnect();
  return { content: [{ type: 'text', text: JSON.stringify({ disconnected: true }) }] };
}

// ──────────────────────────────────────────────
// Tool registry
// ──────────────────────────────────────────────

const TOOLS = [
  {
    name: 'devtools_connect',
    description: `Connect to WeChat Developer Tools via WebSocket automation.
Must enable service port in DevTools → 设置 → 安全 → 服务端口 first.
Auto-launches automation on an available port. Returns current page info.`,
    inputSchema: {
      type: 'object',
      properties: {
        port: { type: 'number', description: 'Optional port override (default: auto-detect starting from 9420)' }
      }
    }
  },
  {
    name: 'devtools_navigate',
    description: 'Navigate to a page in the mini-program. Triggers compilation; use after code changes to verify no errors.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Page URL, e.g. /pages/cpu-sched/cpu-sched' }
      },
      required: ['url']
    }
  },
  {
    name: 'devtools_logs',
    description: `Read captured console logs from the running mini-program.
Includes console.log/warn/error output and uncaught exceptions.
Use after navigation or method calls to check for errors.`,
    inputSchema: {
      type: 'object',
      properties: {
        clear: { type: 'boolean', description: 'Clear logs after reading (default: false)' }
      }
    }
  },
  {
    name: 'devtools_get_data',
    description: 'Get current page data (this.data values) from the mini-program page. Useful for verifying state after operations.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Optional data path (e.g. "metrics.avgTATDisplay" or empty for all)' }
      }
    }
  },
  {
    name: 'devtools_call_method',
    description: `Call a method on the current page (e.g., onTogglePlay, onReset, onRandomGenerate).
Useful for triggering actions like running algorithms, adding data, etc.`,
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'Method name to call (e.g., "onTogglePlay", "onReset")' },
        args: { type: 'array', description: 'Optional arguments to pass to the method' }
      },
      required: ['method']
    }
  },
  {
    name: 'devtools_system_info',
    description: 'Get system/device info from the mini-program (brand, model, SDK version, screen size, etc.).'
  },
  {
    name: 'devtools_screenshot',
    description: 'Take a screenshot of the simulator. Returns base64-encoded PNG data.'
  },
  {
    name: 'devtools_disconnect',
    description: 'Disconnect from DevTools and clean up the automation process.'
  }
];

// ──────────────────────────────────────────────
// Tool dispatch
// ──────────────────────────────────────────────

const TOOL_DISPATCH = {
  devtools_connect: toolConnect,
  devtools_navigate: toolNavigate,
  devtools_logs: toolLogs,
  devtools_get_data: toolGetData,
  devtools_call_method: toolCallMethod,
  devtools_system_info: toolSystemInfo,
  devtools_screenshot: toolScreenshot,
  devtools_disconnect: toolDisconnect
};

// ──────────────────────────────────────────────
// MCP Server — stdin/stdout JSON-RPC
// ──────────────────────────────────────────────

let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk.toString();

  // Messages are separated by newlines
  const lines = buffer.split('\n');
  buffer = lines.pop(); // Keep incomplete line in buffer

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let request;
    try {
      request = JSON.parse(trimmed);
    } catch {
      process.stdout.write(jsonRpcError(null, -32700, 'Parse error') + '\n');
      continue;
    }

    const { id, method, params } = request;

    // Handle initialize
    if (method === 'initialize') {
      process.stdout.write(jsonRpcResult(id, {
        protocolVersion: '0.1.0',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'wechat-devtools-mcp',
          version: '1.0.0'
        }
      }) + '\n');
      continue;
    }

    // Handle notifications (no response needed)
    if (method === 'notifications/initialized' || method.startsWith('$/')) {
      continue;
    }

    // Handle tools/list
    if (method === 'tools/list') {
      process.stdout.write(jsonRpcResult(id, { tools: TOOLS }) + '\n');
      continue;
    }

    // Handle tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      if (!toolName || !TOOL_DISPATCH[toolName]) {
        process.stdout.write(jsonRpcError(id, -32601, `Tool not found: ${toolName}`) + '\n');
        continue;
      }

      pendingCount++;
      try {
        const result = await TOOL_DISPATCH[toolName](toolArgs);
        process.stdout.write(jsonRpcResult(id, result) + '\n');
      } catch (err) {
        process.stdout.write(jsonRpcError(id, -32603, `Tool error: ${err.message}`) + '\n');
      } finally {
        pendingCount--;
      }
      continue;
    }

    // Unknown method
    process.stdout.write(jsonRpcError(id, -32601, `Method not found: ${method}`) + '\n');
  }
});

process.stdin.on('end', async () => {
  // Wait for pending operations to finish
  const maxWait = 30000;
  const start = Date.now();
  while (pendingCount > 0 && (Date.now() - start) < maxWait) {
    await new Promise(r => setTimeout(r, 200));
  }
  cleanup();
  process.exit(0);
});

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  // Prevent crash on connection errors
  if (err.message && (
    err.message.includes('connect') ||
    err.message.includes('WebSocket') ||
    err.message.includes('closed')
  )) {
    connected = false;
    return;
  }
  console.error('Uncaught:', err.message);
});

process.on('unhandledRejection', (err) => {
  // Suppress connection-related promise rejections
  if (err?.message && (
    err.message.includes('connect') ||
    err.message.includes('WebSocket') ||
    err.message.includes('closed')
  )) {
    return;
  }
  console.error('Unhandled rejection:', err?.message);
});
