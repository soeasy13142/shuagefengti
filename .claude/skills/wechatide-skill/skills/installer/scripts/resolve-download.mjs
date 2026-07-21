#!/usr/bin/env node

import https from 'node:https'

const DOWNLOAD_PAGE = 'https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html'
const REQUEST_TIMEOUT = 20_000
const MIN_DOWNLOAD_VERSION = '2.02.2607152'
const MIN_DOWNLOAD_VERSION_NUMBER = 2022607152n

function getText(url, redirects = 0) {
  if (redirects > 5) {
    return Promise.reject(new Error(`重定向次数过多：${url}`))
  }

  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'wechatide-skill'
      }
    }, response => {
      const status = response.statusCode || 0
      const location = response.headers.location

      if (status >= 300 && status < 400 && location) {
        response.resume()
        resolve(getText(new URL(location, url).toString(), redirects + 1))
        return
      }

      if (status < 200 || status >= 300) {
        response.resume()
        reject(new Error(`请求失败：HTTP ${status} ${url}`))
        return
      }

      response.setEncoding('utf8')
      let body = ''
      response.on('data', chunk => {
        body += chunk
      })
      response.on('end', () => resolve(body))
    })

    request.setTimeout(REQUEST_TIMEOUT, () => {
      request.destroy(new Error(`请求超时：${url}`))
    })
    request.on('error', reject)
  })
}

function resolveRedirectTarget(url, redirects = 0) {
  if (redirects > 10) {
    return Promise.reject(new Error(`下载链接重定向次数过多：${url}`))
  }

  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'wechatide-skill'
      }
    }, response => {
      const status = response.statusCode || 0
      const location = response.headers.location

      response.resume()
      if (status >= 300 && status < 400 && location) {
        const nextUrl = new URL(location, url)
        if (nextUrl.protocol !== 'https:') {
          reject(new Error(`下载链接重定向到非 HTTPS 地址：${nextUrl}`))
          return
        }
        resolve(resolveRedirectTarget(nextUrl.toString(), redirects + 1))
        return
      }

      if (status < 200 || status >= 300) {
        reject(new Error(`下载链接探测失败：HTTP ${status} ${url}`))
        return
      }

      resolve(new URL(url))
    })

    request.setTimeout(REQUEST_TIMEOUT, () => {
      request.destroy(new Error(`下载链接探测超时：${url}`))
    })
    request.on('error', reject)
    request.end()
  })
}

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    platform: process.platform,
    arch: process.arch,
    channel: 'stable',
    urlOnly: false
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (['--platform', '--arch', '--channel'].includes(arg)) {
      const value = args[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error(`参数 ${arg} 缺少值`)
      }

      if (arg === '--platform') {
        options.platform = value
      } else if (arg === '--arch') {
        options.arch = value
      } else {
        options.channel = value.toLowerCase()
      }
      index += 1
    } else if (arg === '--url-only') {
      options.urlOnly = true
    } else {
      throw new Error(`未知参数：${arg}`)
    }
  }

  if (options.channel === 'nightly') {
    options.channel = 'latest'
  }
  if (!['stable', 'latest'].includes(options.channel)) {
    throw new Error(`不支持的 channel：${options.channel}，仅支持 stable、latest 或 nightly`)
  }

  return options
}

function getPreferredTypes(platform, arch) {
  const normalizedPlatform = platform.toLowerCase()
  const normalizedArch = arch.toLowerCase()

  if (['darwin', 'mac', 'macos'].includes(normalizedPlatform)) {
    return ['arm64', 'aarch64'].includes(normalizedArch)
      ? ['darwin_arm64', 'darwin_arm']
      : ['darwin_x64']
  }

  if (['win32', 'windows', 'win'].includes(normalizedPlatform)) {
    return ['x64', 'amd64'].includes(normalizedArch)
      ? ['win32_x64']
      : ['win32_ia32']
  }

  throw new Error(`官方下载页不提供该系统安装包：${platform}/${arch}`)
}

function isMacPlatform(platform) {
  return ['darwin', 'mac', 'macos'].includes(platform.toLowerCase())
}

function extractScriptUrls(html) {
  const urls = []
  const pattern = /<script[^>]+src=["']([^"']+)["']/gi
  let match

  while ((match = pattern.exec(html))) {
    urls.push(new URL(match[1], DOWNLOAD_PAGE).toString())
  }

  return urls
}

function extractConfigUrls(contents) {
  const urls = new Set()
  const pattern = /https:\/\/[^"'\\\s]+\/config\.json/g

  for (const content of contents) {
    for (const match of content.matchAll(pattern)) {
      urls.add(match[0])
    }
  }

  return [...urls]
}

function isAllowedDownloadUrl(value, channel) {
  try {
    const url = new URL(value)
    if (channel === 'latest') {
      return url.origin === 'https://devtools.wxqcloud.qq.com.cn'
        && url.pathname.startsWith('/WechatWebDev/nightly/')
    }

    return url.origin === 'https://servicewechat.com'
      && url.pathname === '/wxa-dev-logic/download_redirect'
  } catch {
    return false
  }
}

function collectUrls(value, channel, result = []) {
  if (typeof value === 'string') {
    if (isAllowedDownloadUrl(value, channel)) {
      result.push(value)
    }
    return result
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectUrls(item, channel, result)
    }
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      collectUrls(item, channel, result)
    }
  }

  return result
}

function selectStableDownload(urls, preferredTypes) {
  const candidates = urls
    .map(value => new URL(value))
    .filter(url => preferredTypes.includes(url.searchParams.get('type')))
    .filter(url => /^\d+$/.test(url.searchParams.get('download_version') || ''))
    .filter(url => BigInt(url.searchParams.get('download_version')) > MIN_DOWNLOAD_VERSION_NUMBER)
    .sort((left, right) => {
      const leftVersion = BigInt(left.searchParams.get('download_version'))
      const rightVersion = BigInt(right.searchParams.get('download_version'))
      return leftVersion === rightVersion ? 0 : leftVersion > rightVersion ? -1 : 1
    })

  const selected = candidates[0] || null
  if (!selected) {
    return null
  }
  selected.searchParams.set('from', 'skillauto')
  return selected
}

function getPathVersion(url) {
  const match = url.pathname.match(/wechat_devtools_(\d+(?:\.\d+)+)_/)
  return match ? match[1] : ''
}

function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number)
  const rightParts = right.split('.').map(Number)
  const length = Math.max(leftParts.length, rightParts.length)

  for (let index = 0; index < length; index += 1) {
    const difference = (rightParts[index] || 0) - (leftParts[index] || 0)
    if (difference) {
      return difference
    }
  }

  return 0
}

function isVersionGreater(candidate, baseline) {
  return compareVersions(candidate, baseline) < 0
}

function isAboveMinimumVersion(version) {
  const normalized = version.replace(/\./g, '')
  return /^\d+$/.test(normalized) && BigInt(normalized) > MIN_DOWNLOAD_VERSION_NUMBER
}

function selectNightlyDownload(urls, preferredTypes, requirePkg = false) {
  const candidates = urls
    .map(value => new URL(value))
    .filter(url => preferredTypes.some(type => url.pathname.includes(`_${type}.`)))
    .filter(url => !requirePkg || url.pathname.toLowerCase().endsWith('.pkg'))
    .filter(url => getPathVersion(url))
    .filter(url => isAboveMinimumVersion(getPathVersion(url)))
    .sort((left, right) => compareVersions(getPathVersion(left), getPathVersion(right)))

  if (!candidates.length) {
    throw new Error(
      `未找到版本大于 ${MIN_DOWNLOAD_VERSION} 的匹配安装包：${preferredTypes.join(', ')}`
    )
  }

  return candidates[0]
}

async function main() {
  const options = parseArgs()
  const html = await getText(DOWNLOAD_PAGE)
  const scriptUrls = extractScriptUrls(html)
  const scriptResults = await Promise.allSettled(scriptUrls.map(url => getText(url)))
  const scripts = scriptResults
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value)
  const configUrls = extractConfigUrls([html, ...scripts])

  if (!configUrls.length) {
    throw new Error('官方下载页中未找到下载配置')
  }

  const configResults = await Promise.allSettled(
    configUrls.map(async url => JSON.parse(await getText(url)))
  )
  const configs = configResults
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value)
  if (!configs.length) {
    throw new Error('官方下载配置获取或解析失败')
  }

  const preferredTypes = getPreferredTypes(options.platform, options.arch)
  const isLatest = options.channel === 'latest'
  const urls = configs.flatMap(config => collectUrls(config, options.channel))
  let selected = isLatest
    ? selectNightlyDownload(urls, preferredTypes, isMacPlatform(options.platform))
    : selectStableDownload(urls, preferredTypes)
  let selectedChannel = options.channel
  let fallbackReason

  if (!selected) {
    const latestUrls = configs.flatMap(config => collectUrls(config, 'latest'))
    selected = selectNightlyDownload(
      latestUrls,
      preferredTypes,
      isMacPlatform(options.platform)
    )
    selectedChannel = 'latest'
    fallbackReason = `稳定版版本不大于 ${MIN_DOWNLOAD_VERSION}，改用更高版本`
  }

  if (!isLatest && isMacPlatform(options.platform)) {
    if (selectedChannel === 'stable') {
      const redirectTarget = await resolveRedirectTarget(selected.toString())
      if (!redirectTarget.pathname.toLowerCase().endsWith('.pkg')) {
        const latestUrls = configs.flatMap(config => collectUrls(config, 'latest'))
        const pkgCandidate = selectNightlyDownload(latestUrls, preferredTypes, true)
        const redirectVersion = getPathVersion(redirectTarget)
        const pkgVersion = getPathVersion(pkgCandidate)

        if (!redirectVersion || !isVersionGreater(pkgVersion, redirectVersion)) {
          throw new Error(`稳定版重定向为非 PKG，且未找到更高版本的 macOS PKG：${redirectTarget}`)
        }

        selected = pkgCandidate
        selectedChannel = 'latest'
        fallbackReason = `稳定版重定向为 ${redirectTarget.pathname.split('.').pop()}，改用更高版本 PKG`
      }
    }
  }

  const version = selectedChannel === 'latest'
    ? getPathVersion(selected)
    : selected.searchParams.get('download_version')

  if (options.urlOnly) {
    console.log(selected.toString())
    return
  }

  console.log(JSON.stringify({
    platform: options.platform,
    arch: options.arch,
    requestedChannel: options.channel,
    channel: selectedChannel,
    type: selectedChannel === 'latest'
      ? preferredTypes.find(type => selected.pathname.includes(`_${type}.`))
      : selected.searchParams.get('type'),
    downloadVersion: version,
    minimumDownloadVersion: MIN_DOWNLOAD_VERSION,
    url: selected.toString(),
    ...(fallbackReason ? { fallbackReason } : {}),
    source: DOWNLOAD_PAGE
  }, null, 2))
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
