# Nginx 最小配置生成器 · Design Spec

> 2026-07-21 · 设计文档（brainstorming → writing-plans）

## 1. 概述

在微信小程序中提供一个实用工具：用户填写域名、端口、证书路径等必要信息，一键生成可复制的 nginx server block 配置文本。

**定位**：纯实用工具（非教学），快速产出、复制即用。

**目标用户**：开发者/运维需要快速配 nginx 时，不用查文档手写，填表即出。

## 2. 范围

### In scope

- 单 server block 配置生成（非完整 nginx.conf）
- 支持 HTTPS 站点 / HTTP 站点 / 反向代理 / HTTP→HTTPS 跳转 四种场景
- 可选生成 default_server catch-all 安全配置
- 必填→常用→高级 三层折叠式表单
- 生成配置的代码块预览 + 一键复制
- 输入实时校验（域名格式、端口范围、路径格式）
- 配置格式化（缩进、空行分隔）

### Out of scope

- 多 server block / upstream / load balancing 配置
- 配置文件下载
- nginx 语法高亮（纯 monospace 文本）
- 历史配置保存

## 3. 数据模型

```javascript
// 输入数据结构
{
  // ── 必填 ──
  serverName: '',       // string, "example.com"（支持 *.example.com / _）
  listenPort: '443',    // string, "443" | "80" | custom
  enableSSL: true,       // boolean, port=443 时自动 true
  sslCertPath: '',      // string, "/etc/ssl/certs/example.crt"
  sslKeyPath: '',       // string, "/etc/ssl/private/example.key"

  // ── 常用 ──
  rootDir: '',          // string, "/var/www/html"
  indexFiles: 'index.html index.htm',  // string, 空格分隔
  proxyPass: '',        // string, "http://localhost:3000"
  enableRedirect: false, // boolean, HTTP→HTTPS 跳转 block

  // ── 高级 ──
  nginxVersion: 'modern',   // 'modern'（≥1.25.1）| 'legacy'（<1.25.1）, 影响 http2 语法
  sslCipherProfile: 'intermediate',  // 'intermediate' | 'modern', 影响 cipher 套件
  sslProtocols: 'TLSv1.2 TLSv1.3',   // string
  sslCiphers: '',                    // string，留空=根据 profile 自动填，填了=覆盖
  http2Enabled: true,                // boolean, port=443 时生效
  enableOCSPStapling: false,         // boolean
  clientMaxBodySize: '',             // string, "10m"
  enableHSTS: false,                 // boolean
  hstsPreload: false,                // boolean, enableHSTS=true 时可选
  enableXContentTypeOptions: true,   // boolean，X-Content-Type-Options: nosniff
  enableXFrameOptions: true,         // boolean，X-Frame-Options: SAMEORIGIN
  enableReferrerPolicy: true,        // boolean，Referrer-Policy: strict-origin-when-cross-origin
  accessLogPath: '',                 // string, "on" | "off" | 路径
  errorLogPath: '',                  // string, 路径/级别
  enableCatchAll: false,             // boolean，额外生成 default_server catch-all
}
```
```

### 字段依赖规则

| 条件 | 行为 |
|------|------|
| `listenPort === '443'` | 自动 `enableSSL = true` |
| `enableSSL === false` | 隐藏 sslCertPath / sslKeyPath / sslProtocols / sslCiphers / http2Enabled / OCSP |
| `sslCipherProfile` 且 `sslCiphers === ''` | 按 profile 自动填入 cipher 字符串 |
| `nginxVersion === 'modern'` | http2 用独立 `http2 on;` 指令 |
| `nginxVersion === 'legacy'` | http2 用 `listen 443 ssl http2;` 参数形式 |
| `!rootDir && !proxyPass` | 不输出 root/index/location 行 |
| `rootDir && !proxyPass` | 输出 root/index + `try_files`location block |
| `proxyPass 有值` | 输出 location / block 含 proxy_pass + headers |
| `rootDir && proxyPass` | 同时输出 root/index + proxy location（共存场景） |
| `enableRedirect === true` | 额外生成一个 `listen 80` 的 `return 301` server block |
| `enableHSTS === true` | 输出 `add_header Strict-Transport-Security ...` |
| `enableOCSPStapling === true` | 输出 stapling 相关指令 |
| `enableCatchAll === true` | 额外生成 default_server catch-all block |
| `clientMaxBodySize === ''` | 不输出该行 |

## 4. UI 布局

### 4.1 整体结构

```
┌─────────────────────────────┐
│  🔒 Nginx 配置生成器        │  ← 标题
├─────────────────────────────┤
│                             │
│  ┌─ 必填 ──────────────┐   │  ← 默认展开
│  │  域名 *          ── │   │
│  │  端口        [443▼] │   │
│  │  SSL 证书路径 *  ── │   │
│  │  SSL 密钥路径 *  ── │   │
│  └─────────────────────┘   │
│                             │
│  ┌─ ▼ 常用 ────────────┐   │  ← 可折叠，默认展开
│  │  Root 目录       ──  │   │
│  │  索引文件    ──────  │   │
│  │  反向代理 URL   ──  │   │
│  │  自动跳转 HTTPS  [ ] │   │
│  └─────────────────────┘   │
│                             │
│  ┌─ ▶ 高级 ────────────┐   │  ← 可折叠，默认收起
│  │  Nginx 版本 [modern▼] │   │
│  │  SSL 配置预设[中阶▼] │   │
│  │  SSL 协议    [TLSv1.2│ │
│  │  OCSP Stapling  [ ]   │   │
│  │  HTTP/2         [✓]  │   │
│  │  Client Body [10m  ] │   │
│  │  HSTS           [✓]  │   │
│  │  HSTS Preload   [ ]  │   │
│  │  X-Content-Type [✓]  │   │
│  │  X-Frame-Options [✓] │   │
│  │  Referrer-Policy [✓] │   │
│  │  Access Log  [auto  ]│   │
│  │  Error Log   [auto  ]│   │
│  │  Catch-All    [ ]    │   │
│  └─────────────────────┘   │
│                             │
│  [🔄 生成配置] [📋 复制]   │  ← 按钮行
│                             │
│  ┌─ 配置预览 ────────────┐ │
│  │  server {              │ │  ← scrollable, monospace
│  │    listen 443 ssl;     │ │
│  │    server_name ...;    │ │
│  │    ...                 │ │
│  │  }                     │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

### 4.2 组件样式

遵循 Claude Design 暖奶油画布规范，与 subnet-calc 等表单式页面保持一致：

分组容器沿用项目 `section` 模式（`.section` 容器 + `section-label` 标签）：
- 容器：`background: #efe9de; border-radius: 24rpx; padding: 28rpx; margin-bottom: 20rpx;`
- 折叠行为：`bindtap` 切换 `wx:if`/`` hidden``，与 subnet-calc 帮助区一致

| 元素 | 样式 |
|------|------|
| 表单标签 | 16rpx `#6c6a64`，上方对齐 |
| 输入框 | `#efe9de` 底色，24rpx 圆角，28rpx 内边距，`#141413` 文字 |
| 选择器 | 原生 picker，风格与输入框一致 |
| 必填标记 | 红色 `*` |
| 折叠标题 | `#141413` 衬线/Sans，左右 padding，点击切换 |
| 主按钮（生成） | `#cc785c` 底色，白字，34rpx 圆角 |
| 次按钮（复制） | `#efe9de` 底色，`#141413` 字，34rpx 圆角 |
| 预览区 | `#181715` 底色，`#faf9f5` 字，28rpx 字，monospace，scroll-y |
| 输入错误提示 | 红色小字 24rpx，input 下方 |

### 4.3 交互细节

- **输入时不做校验**（避免频繁提示），点击「生成」时统一校验
- **必填校验失败**：对应输入框边框变红 + 下方出现错误提示文字
- **端口切换**：picker 选项为 「443 (HTTPS)」「80 (HTTP)」「自定义」，选 443 自动 enableSSL
- **复制成功**：toast 提示「已复制到剪贴板」
- **折叠动画**：WXSS transition，与项目中其他折叠行为一致

## 5. 配置生成逻辑

### 5.1 核心函数

**`generateConfig(inputs)` → `string`**

纯函数，接收输入对象，返回格式化后的 nginx 配置字符串。

### 5.2 模板结构

```nginx
server {
    listen 443 ssl${http2Suffix};
    listen [::]:443 ssl${http2Suffix};
    server_name ${serverName};

    # SSL
    ssl_certificate ${sslCertPath};
    ssl_certificate_key ${sslKeyPath};
    ssl_protocols ${sslProtocols};
    ssl_ciphers ${sslCiphers};
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ${ocspStaplingBlock}

    # Root / Proxy
    root ${rootDir};
    index ${indexFiles};
    location / {
        ${tryFilesOrProxyPass}
        ${proxyHeadersBlock}
    }

    # Security
    client_max_body_size ${clientMaxBodySize};
    ${hstsHeader}
    ${xContentTypeOptions}
    ${xFrameOptions}
    ${referrerPolicy}

    # Logging
    access_log ${accessLogPath};
    error_log ${errorLogPath};
}
```

> 每行根据输入是否有值条件输出。缩进 4 空格。IPv6 listen 行始终跟随 IPv4 行同步生成。
>
> **变量说明**：
> - `${http2Suffix}` = `http2Enabled ? ' http2' : ''`（legacy 模式）或 `\nhttp2 on;`（modern 模式，独立指令）
> - `${ocspStaplingBlock}` = `enableOCSPStapling ? ssl_stapling on;\nssl_stapling_verify on;\nssl_trusted_certificate ${sslCertPath};\nresolver 8.8.8.8 1.1.1.1;` : ''
> - `${tryFilesOrProxyPass}` = `proxyPass 有值 ? proxy_pass ${proxyPass};` : `try_files $uri $uri/ =404;`
> - `${proxyHeadersBlock}` = `proxyPass 有值 ? proxy_set_header Host $host;\nproxy_set_header X-Real-IP $remote_addr;\nproxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\nproxy_set_header X-Forwarded-Proto $scheme;` : ''
> - `${hstsHeader}` / `${xContentTypeOptions}` / `${xFrameOptions}` / `${referrerPolicy}` = 各开关对应的 add_header 行

### 5.3 跳转 block（enableRedirect === true 时额外生成）

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ${serverName};
    return 301 https://${serverName}$request_uri;
}
```

### 5.4 生成步骤

```
1. 校验所有输入 → 有误则返回错误信息，不生成
2. 根据 enableRedirect 决定是否先渲染跳转 block
3. 渲染主 server block（按 listen → server_name → ssl → root → location → security → logging 顺序）
4. 格式化（去掉空行、统一缩进）
5. 返回完整字符串
```

### 5.5 条件输出规则

| 条件 | 输出 |
|------|------|
| listenPort === '443' | `listen 443 ssl;` + IPv6 行 + http2 |
| listenPort === '80' | `listen 80;` + IPv6 行 |
| 自定义端口 | `listen <port> ssl;` 或 `listen <port>;` + IPv6 行 |
| nginxVersion === 'modern' + http2 | 独立 `http2 on;` 指令 |
| nginxVersion === 'legacy' + http2 | `listen ... ssl http2;` 参数形式 |
| proxyPass 有值 | 生成 location / block：proxy_pass + 4 个 proxy_set_header |
| rootDir 有值 + proxyPass 无值 | 生成 root + index + `try_files $uri $uri/ =404;` location |
| rootDir 有值 + proxyPass 有值 | 同时输出 root/index + proxy location |
| enableSSL && sslCiphers === '' | 按 sslCipherProfile 填入默认 cipher 字符串 |
| enableOCSPStapling | 输出 ssl_stapling on/verify + trusted_certificate + resolver |
| enableCatchAll | 单独生成 default_server block（return 444） |

### 5.6 边界情况

- 所有字段为空 → 空 server block，校验错误
- 端口 443 + 无 SSL 路径 → 校验错误（提示「请填写 SSL 证书路径」）
- 端口 80 + enableSSL → warning 提示「端口 80 通常不用 SSL」
- proxyPass 无协议前缀 → 自动补 `http://`
- 域名含 `https://` 前缀 → 自动去除
- 域名含端口号 → 自动去除端口部分
- 多个域名以空格/逗号分隔 → 自动转化为 `server_name` 多项
- sslCiphers 用户填了自定义 → 覆盖 profile 默认值
- enforceCatchAll → 额外输出两个 default_server block（80 + 443）

## 6. 验证规则

| 字段 | 规则 | 错误提示 |
|------|------|---------|
| serverName | 非空，无协议/路径/端口；单标签 ≤63 字；支持 `*` `_` | 「请输入有效域名，如 example.com」 |
| listenPort | 1-65535 整数 | 「端口范围 1-65535」 |
| sslCertPath | enableSSL=true 时必填，以 `/` 开头 | 「请输入证书文件绝对路径」 |
| sslKeyPath | enableSSL=true 时必填，以 `/` 开头 | 「请输入私钥文件绝对路径」 |
| rootDir | 如填，以 `/` 开头；自动去尾斜杠 | 「请输入绝对路径，如 /var/www/html」 |
| indexFiles | 如填，空格分隔的文件名列表 | — |
| proxyPass | 如填，须 `http://` 或 `https://` 开头；推荐含端口 | 「请输入有效 URL，如 http://localhost:3000」 |
| clientMaxBodySize | 如填，数字+单位（`10m` `50k` `1g`） | 「格式如 10m / 50k / 1g」 |
| accessLogPath | `on`/`off`/路径 | — |
| errorLogPath | 路径/级别（`error` `warn` `info`） | — |

## 7. 文件清单

### 新增

| 文件 | 说明 |
|------|------|
| `pages/nginx-gen/nginx-gen.js` | 页面逻辑：表单状态、校验、生成、复制 |
| `pages/nginx-gen/nginx-gen.wxml` | 页面模板 |
| `pages/nginx-gen/nginx-gen.wxss` | 页面样式 |
| `pages/nginx-gen/nginx-gen.json` | 页面配置 |
| `utils/nginx-generator.js` | 核心纯函数：配置生成逻辑 |
| `tests/utils/nginx-generator.test.js` | 生成器单元测试 |
| `tests/pages/nginx-gen.test.js` | 页面行为测试 |

### 修改

| 文件 | 变更 |
|------|------|
| `utils/tool-registry.js` | 新增 `nginx-gen` 工具记录 |
| `app.json` | 注册 `pages/nginx-gen/nginx-gen` |
| `docs/handoff/modules/nginx-gen.md` | 模块文档 |

## 8. 错误处理

| 场景 | 处理方式 |
|------|---------|
| 必填字段为空 | 点击生成时集中校验，对应输入框标红 + 底部提示文字 |
| 域名格式错误 | 校验失败，提示「请输入有效域名，如 example.com」 |
| 路径不以 / 开头 | 校验失败，提示要求绝对路径 |
| 端口 443 + enableSSL + 无证书路径 | 校验失败，提示「HTTPS 需要 SSL 证书路径」 |
| 端口 80 + enableSSL | 警告提示「端口 80 通常不启用 SSL」，但允许生成 |
| 代理 URL 缺协议 | 自动补 `http://` |
| 配置生成成功但为空 | 不会发生（校验兜底），但兜底显示错误消息 |
| wx.setClipboardData 失败 | catch 错误，toast 提示「复制失败，请手动复制」 |

### 8.1 已知陷阱提示（显示在预览区下方）

配置生成后，在预览区下方显示一条实用提醒：

> **部署前检查**：
> - 私钥文件权限应为 `600` 或 `640`
> - 确认 `nginx -t` 测试通过后再 reload
> - 证书路径建议用 Let's Encrypt `live/` 目录（而非 `archive/`）
> - 如端口 < 1024，nginx 需要 root 权限启动

## 9. 测试策略

**单元测试（utils/nginx-generator.js）**：
- 各类场景生成正确性：HTTPS 站点 / HTTP 站点 / 反代 / 跳转 / 混合
- 条件输出：仅填写必填 vs 填写全部
- 边界值：自定义端口、无 root/proxy、HSTS 开关
- 校验函数：合法/非法域名、端口范围、路径格式

**页面测试（tests/pages/nginx-gen.test.js）**：
- 表单渲染
- 点击生成按钮触发校验
- 复制按钮调用 clipboard API
- 折叠面板展开/收起

## 10. 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 输入校验时机 | 点击生成时统一校验 | 不打扰输入过程，聚焦填写体验 |
| SSL 显示控制 | 端口选 443 时自动展开，80 时隐藏 | 减少多余字段，简化界面 |
| 跳转 block 形式 | 额外生成完整 server block | 与主流 nginx 配置风格一致 |
| 预览区样式 | 深色底 + 浅色字 monospace | 模拟终端风格，视觉区分于表单 |
| 配置格式化 | 4 空格缩进，分类空行分隔 | 最常见的 nginx 缩进风格 |

---

*下一阶段：writing-plans 撰写实施计划。*
