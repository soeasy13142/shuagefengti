#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const MIN_ELECTRON_VERSION = '2.02.2607152'

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    platform: process.platform,
    installRoot: ''
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (!['--platform', '--install-root'].includes(arg)) {
      throw new Error(`未知参数：${arg}`)
    }

    const value = args[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`参数 ${arg} 缺少值`)
    }

    if (arg === '--platform') {
      options.platform = value.toLowerCase()
    } else {
      options.installRoot = path.resolve(value)
    }
    index += 1
  }

  return options
}

function normalizeWindowsRegistryPath(rawValue) {
  let value = rawValue.trim()
  const quoted = value.match(/^"([^"]+)"/)
  if (quoted) {
    value = quoted[1]
  } else {
    const executable = value.match(/^(.+?\.(?:exe|cmd|bat))(?:\s|,|$)/i)
    if (executable) {
      value = executable[1]
    }
  }

  value = value
    .replace(/,\d+$/, '')
    .replace(/%([^%]+)%/g, (_match, name) => process.env[name] || `%${name}%`)

  return /\.(?:exe|cmd|bat)$/i.test(value) ? path.dirname(value) : value
}

function extractWindowsRegistryPaths(output) {
  const paths = []
  const valuePattern = /^\s+(?:InstallLocation|DisplayIcon|UninstallString|\(Default\))\s+REG_\w+\s+(.+)$/i

  for (const line of output.split(/\r?\n/)) {
    const match = line.match(valuePattern)
    if (match) {
      paths.push(normalizeWindowsRegistryPath(match[1]))
    }
  }

  return paths.filter(Boolean)
}

function queryWindowsRegistryPaths() {
  if (process.platform !== 'win32') {
    return []
  }

  const uninstallKeys = [
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
  ]
  const appNames = [
    'wechatdevtools.exe',
    'wechatwebdevtools.exe',
    '微信开发者工具.exe'
  ]
  const queries = []

  for (const key of uninstallKeys) {
    queries.push([key, '/s', '/reg:32'], [key, '/s', '/reg:64'])
  }
  for (const appName of appNames) {
    const suffix = `Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${appName}`
    queries.push(
      [`HKCU\\${suffix}`, '/reg:32'],
      [`HKCU\\${suffix}`, '/reg:64'],
      [`HKLM\\${suffix}`, '/reg:32'],
      [`HKLM\\${suffix}`, '/reg:64']
    )
  }

  const paths = []
  for (const args of queries) {
    const result = spawnSync('reg', ['query', ...args], {
      encoding: 'utf8',
      timeout: 10_000,
      windowsHide: true
    })
    if (result.status === 0 && result.stdout) {
      paths.push(...extractWindowsRegistryPaths(result.stdout))
    }
  }
  return paths
}

function findRuntimeRoot(platform, candidate) {
  let current = path.resolve(candidate)
  for (let depth = 0; depth < 5; depth += 1) {
    const packagePaths = getPackagePaths(platform, current)
    if (fs.existsSync(packagePaths.nw) || fs.existsSync(packagePaths.electron)) {
      return current
    }
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }
  return ''
}

function getInstallRoots(platform, installRoot) {
  if (installRoot) {
    return [installRoot]
  }

  if (['darwin', 'mac', 'macos'].includes(platform)) {
    return ['/Applications/wechatwebdevtools.app']
  }

  if (['win32', 'windows', 'win'].includes(platform)) {
    const registryRoots = queryWindowsRegistryPaths()
      .map(candidate => findRuntimeRoot(platform, candidate))
      .filter(Boolean)
    const programFilesRoots = [
      process.env['ProgramFiles(x86)'],
      process.env.ProgramFiles,
      'C:\\Program Files (x86)',
      'C:\\Program Files'
    ].filter(Boolean)

    const commonRoots = programFilesRoots
      .map(root => path.join(root, 'Tencent', '微信web开发者工具'))
    return [...new Set([...registryRoots, ...commonRoots])]
  }

  throw new Error(`不支持的系统：${platform}`)
}

function getPackagePaths(platform, installRoot) {
  if (['darwin', 'mac', 'macos'].includes(platform)) {
    const resources = path.join(installRoot, 'Contents', 'Resources')
    return {
      nw: path.join(resources, 'package.nw', 'package.json'),
      electron: path.join(resources, 'app.asar.unpacked', 'package.json')
    }
  }

  return {
    nw: path.join(installRoot, 'code', 'package.nw', 'package.json'),
    electron: path.join(installRoot, 'resources', 'app.asar.unpacked', 'package.json')
  }
}

function readPackageVersion(packagePath) {
  const content = fs.readFileSync(packagePath, 'utf8')
  const packageJson = JSON.parse(content)
  if (typeof packageJson.version !== 'string' || !packageJson.version.trim()) {
    throw new Error(`package.json 缺少 version：${packagePath}`)
  }
  return packageJson.version.trim()
}

function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number)
  const rightParts = right.split('.').map(Number)
  if ([...leftParts, ...rightParts].some(part => !Number.isInteger(part) || part < 0)) {
    throw new Error(`无法比较版本：${left} / ${right}`)
  }

  const length = Math.max(leftParts.length, rightParts.length)
  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0)
    if (difference) {
      return difference
    }
  }
  return 0
}

function checkCli() {
  const result = spawnSync('wechatide', ['-h'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: 10_000,
    windowsHide: true
  })

  return {
    available: !result.error && result.status === 0,
    error: result.error?.message || (result.status === 0
      ? undefined
      : (result.stderr || result.stdout || `exit ${result.status}`).trim())
  }
}

function incompatible(base, reason, extra = {}) {
  return {
    ...base,
    compatible: false,
    mustEnterInstaller: true,
    reason,
    ...extra
  }
}

function inspectInstallation(options) {
  const installRoots = getInstallRoots(options.platform, options.installRoot)
  const installRoot = installRoots.find(root => fs.existsSync(root))
  const cli = checkCli()
  const base = {
    platform: options.platform,
    installRoot: installRoot || null,
    cliAvailable: cli.available,
    minimumElectronVersion: MIN_ELECTRON_VERSION
  }

  if (!installRoot) {
    return incompatible(base, 'not_installed', {
      checkedInstallRoots: installRoots,
      cliError: cli.error
    })
  }

  const packagePaths = getPackagePaths(options.platform, installRoot)
  if (fs.existsSync(packagePaths.nw)) {
    return incompatible(base, 'nw_runtime_incompatible', {
      runtime: 'nw',
      packagePath: packagePaths.nw,
      cliError: cli.error
    })
  }

  if (!fs.existsSync(packagePaths.electron)) {
    return incompatible(base, 'unknown_runtime_incompatible', {
      runtime: 'unknown',
      checkedPackagePaths: packagePaths,
      cliError: cli.error
    })
  }

  let version
  try {
    version = readPackageVersion(packagePaths.electron)
  } catch (error) {
    return incompatible(base, 'electron_version_unreadable', {
      runtime: 'electron',
      packagePath: packagePaths.electron,
      error: error.message,
      cliError: cli.error
    })
  }

  if (compareVersions(version, MIN_ELECTRON_VERSION) < 0) {
    return incompatible(base, 'electron_version_too_old', {
      runtime: 'electron',
      version,
      packagePath: packagePaths.electron,
      cliError: cli.error
    })
  }

  if (!cli.available) {
    return incompatible(base, 'cli_unavailable', {
      runtime: 'electron',
      version,
      packagePath: packagePaths.electron,
      cliError: cli.error
    })
  }

  return {
    ...base,
    compatible: true,
    mustEnterInstaller: false,
    reason: 'compatible',
    runtime: 'electron',
    version,
    packagePath: packagePaths.electron
  }
}

try {
  console.log(JSON.stringify(inspectInstallation(parseArgs()), null, 2))
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
