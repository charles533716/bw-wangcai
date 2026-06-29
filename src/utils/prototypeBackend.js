export const BACKEND_STORAGE_KEYS = {
  mode: 'prototype:backendMode',
  siteCode: 'prototype:siteCode',
  agentCode: 'prototype:agentCode'
}

export const BACKEND_OPTIONS = [
  {
    value: 'master',
    title: '总控后台',
    subtitle: '全站运营、站点、财务、资源与系统管理',
    homePath: '/index',
    role: 'admin',
    userName: 'admin',
    nickName: '总控演示管理员'
  },
  {
    value: 'site',
    title: '站点后台',
    subtitle: '演示站点 2222 的会员、代理、财务与站点配置',
    homePath: '/site-admin/index',
    role: 'siteadmin',
    userName: 'site_admin_2222',
    nickName: '站点演示管理员'
  },
  {
    value: 'agent',
    title: '代理后台',
    subtitle: '演示代理 10001 的会员、佣金、代存与报表',
    homePath: '/agent-admin/index',
    role: 'agent',
    userName: 'agent10001',
    nickName: '代理演示账号'
  }
]

export const DEFAULT_SITE_CODE = '2222'
export const DEFAULT_AGENT_CODE = '10001'

function canUseStorage() {
  return typeof window !== 'undefined' && window.localStorage
}

export function normalizeBackendMode(mode) {
  const value = String(mode || '').toLowerCase()
  return BACKEND_OPTIONS.some(item => item.value === value) ? value : 'master'
}

export function getBackendMeta(mode) {
  const normalized = normalizeBackendMode(mode)
  return BACKEND_OPTIONS.find(item => item.value === normalized) || BACKEND_OPTIONS[0]
}

export function resolvePrototypePath(path = '/') {
  if (/^https?:\/\//.test(String(path))) {
    return path
  }
  const rawPath = path || '/'
  const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const base = process.env.BASE_URL || '/'
  if (base === '/' || normalizedPath.startsWith(base)) {
    return normalizedPath
  }
  return `${base.replace(/\/$/, '')}${normalizedPath}`
}

export function getCurrentBackendMode() {
  if (!canUseStorage()) {
    return 'master'
  }
  return normalizeBackendMode(window.localStorage.getItem(BACKEND_STORAGE_KEYS.mode))
}

export function getCurrentSiteCode() {
  if (!canUseStorage()) {
    return DEFAULT_SITE_CODE
  }
  return window.localStorage.getItem(BACKEND_STORAGE_KEYS.siteCode) || DEFAULT_SITE_CODE
}

export function getCurrentAgentCode() {
  if (!canUseStorage()) {
    return DEFAULT_AGENT_CODE
  }
  return window.localStorage.getItem(BACKEND_STORAGE_KEYS.agentCode) || DEFAULT_AGENT_CODE
}

export function setBackendContext(mode, context = {}) {
  if (!canUseStorage()) {
    return getBackendMeta(mode)
  }
  const normalized = normalizeBackendMode(mode)
  const siteCode = context.siteCode || getCurrentSiteCode()
  const agentCode = context.agentCode || getCurrentAgentCode()
  window.localStorage.setItem(BACKEND_STORAGE_KEYS.mode, normalized)
  window.localStorage.setItem(BACKEND_STORAGE_KEYS.siteCode, siteCode)
  window.localStorage.setItem(BACKEND_STORAGE_KEYS.agentCode, agentCode)
  return getBackendMeta(normalized)
}

export function getBackendContext() {
  const mode = getCurrentBackendMode()
  const meta = getBackendMeta(mode)
  return {
    ...meta,
    mode,
    siteCode: getCurrentSiteCode(),
    agentCode: getCurrentAgentCode()
  }
}
