# Nginx 配置生成器 · 模块文档

> 最后更新：2026-07-21

## 概述

Nginx 最小配置生成器是一个实用工具：用户填写域名、端口、证书路径等必要信息，一键生成可复制的 nginx server block 配置。

## 文件清单

| 文件 | 说明 |
|------|------|
| `pages/nginx-gen/nginx-gen.js` | 页面逻辑（表单状态、校验、生成、复制） |
| `pages/nginx-gen/nginx-gen.wxml` | 页面模板（3 段折叠表单 + 预览区） |
| `pages/nginx-gen/nginx-gen.wxss` | 页面样式 |
| `pages/nginx-gen/nginx-gen.json` | 页面配置 |
| `utils/nginx-generator.js` | 核心纯函数：generateConfig + validateInputs |
| `tests/utils/nginx-generator.test.js` | 生成器单元测试 |
| `tests/pages/nginx-gen.test.js` | 页面集成测试 |

## 核心逻辑

### `generateConfig(inputs)` → `string`

纯函数，接收表单输入对象，按条件逐行生成 nginx server block 配置。

支持按条件输出：
- SSL 相关行（仅 enableSSL=true 时）
- Root/Index 行（仅 rootDir 有值时）
- Proxy 行（仅 proxyPass 有值时）
- 跳转 block（enableRedirect=true 时额外生成）
- Catch-All block（enableCatchAll=true 时额外生成）
- HTTP/2 语法根据 nginx 版本选择（modern/legacy）

### `validateInputs(inputs)` → `Array<{field, message}>`

校验函数，返回错误数组。校验项：
- 域名格式（无协议/路径/端口，单标签 ≤63 字符）
- 端口范围（1-65535）
- SSL 路径（绝对值 / 开头）
- Root 路径（绝对值 / 开头）
- Proxy URL（http(s):// 开头）
- ClientMaxBodySize 格式（数字+单位）

## 数据流

```
用户输入 → form data → validateInputs → (有误) → 标红错误字段
                                       → (无误) → generateConfig → 显示预览区
                                                                    → 点击复制 → wx.setClipboardData
```

## 表单结构

| 层级 | 内容 | 默认状态 |
|------|------|---------|
| 必填 | 域名、端口、SSL 证书/密钥路径 | 展开 |
| 常用 | Root 目录、索引文件、反向代理 URL、HTTPS 跳转 | 展开 |
| 高级 | Nginx 版本、SSL 配置预设、OCSP、HTTP/2、HSTS、安全头、日志、Catch-All | 收起 |

## 设计决策

- 输入不做实时校验，点击生成时统一校验（减少干扰）
- 端口 443 自动展开 SSL 字段，80 隐藏（简化界面）
- 配置预览深色终端风格，与表单区视觉分离
- 生成后显示部署检查清单（权限、nginx -t 等）

## 测试

- `tests/utils/nginx-generator.test.js`：覆盖 4 种场景 + 条件输出 + 边界值
- `tests/pages/nginx-gen.test.js`：全流程集成测试
- 运行：`npx jest tests/utils/nginx-generator.test.js`
