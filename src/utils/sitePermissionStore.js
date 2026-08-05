import { collectPermissionCodes, flattenPermissionTree } from '@/views/system/role/permissionCatalog'

export const SITE_PERMISSION_STORAGE_KEY = 'master-admin-prototype:site-permission-management'
const SITE_PERMISSION_CATALOG_VERSION = 2

export const DEMO_SITES = [
  { code: '2222', name: '旺财体育' },
  { code: '333333', name: '财神体育' },
  { code: '8888', name: 'DW体育' },
  { code: '6666', name: '星河体育' }
]

function canUseStorage() {
  return typeof window !== 'undefined' && window.localStorage
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function now() {
  const date = new Date()
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function codesByRatio(codes, ratio) {
  const keep = Math.max(1, Math.floor(codes.length * ratio))
  return codes.slice(0, keep)
}

function catalogSignature(permissionTree = []) {
  return flattenPermissionTree(permissionTree, [])
    .map(node => `${node.type}:${node.label || ''}:${node.permission || ''}`)
    .sort()
    .join('|')
}

function buildDefaultRoles(siteCode, grantedCodes) {
  return [
    {
      id: `${siteCode}-role-admin`,
      name: '站点管理员',
      description: '站点内全部已授权权限',
      status: true,
      system: true,
      permissionCodes: [...grantedCodes],
      createdAt: '2026-08-01 09:00:00',
      updatedAt: '2026-08-01 09:00:00'
    },
    {
      id: `${siteCode}-role-business`,
      name: '招商人员',
      description: '会员查询及日常运营权限',
      status: true,
      system: false,
      permissionCodes: codesByRatio(grantedCodes, 0.32),
      createdAt: '2026-08-01 10:20:00',
      updatedAt: '2026-08-01 10:20:00'
    },
    {
      id: `${siteCode}-role-finance`,
      name: '财务人员',
      description: '资金及财务报表相关权限',
      status: true,
      system: false,
      permissionCodes: codesByRatio(grantedCodes.slice().reverse(), 0.28),
      createdAt: '2026-08-01 11:10:00',
      updatedAt: '2026-08-01 11:10:00'
    }
  ]
}

function buildDefaultAccounts(siteCode, roles) {
  return [
    { id: `${siteCode}-account-1`, username: 'wcAdmin', nickname: '站点管理员', department: '管理部', status: true, roleIds: [roles[0].id] },
    { id: `${siteCode}-account-2`, username: 'laoli', nickname: '老李', department: '招商部', status: true, roleIds: [roles[1].id] },
    { id: `${siteCode}-account-3`, username: 'xiaoyang', nickname: '小杨', department: '财务部', status: true, roleIds: [roles[2].id] },
    { id: `${siteCode}-account-4`, username: 'yolo', nickname: '运营专员', department: '运营部', status: false, roleIds: [roles[1].id] }
  ]
}

function buildDefaultState(permissionTree = []) {
  const allCodes = collectPermissionCodes(permissionTree)
  const ratios = [1, 0.78, 0.62, 0.48]
  const sites = {}
  const roles = {}
  const accounts = {}
  DEMO_SITES.forEach((site, index) => {
    const permissionCodes = codesByRatio(allCodes, ratios[index])
    sites[site.code] = {
      ...site,
      permissionCodes,
      updatedAt: '2026-08-04 09:30:00',
      updatedBy: 'kaizong'
    }
    roles[site.code] = buildDefaultRoles(site.code, permissionCodes)
    accounts[site.code] = buildDefaultAccounts(site.code, roles[site.code])
  })
  return { version: SITE_PERMISSION_CATALOG_VERSION, catalogTree: clone(permissionTree), sites, roles, accounts }
}

export function readSitePermissionState(permissionTree = []) {
  let state = null
  if (canUseStorage()) {
    try {
      state = JSON.parse(window.localStorage.getItem(SITE_PERMISSION_STORAGE_KEY) || 'null')
    } catch (error) {
      state = null
    }
  }
  const catalogChanged = permissionTree.length && catalogSignature((state && state.catalogTree) || []) !== catalogSignature(permissionTree)
  if (!state || !state.sites || state.version !== SITE_PERMISSION_CATALOG_VERSION || catalogChanged) {
    state = buildDefaultState(permissionTree)
  } else if (permissionTree.length && !(state.catalogTree || []).length) {
    state.catalogTree = clone(permissionTree)
  }
  DEMO_SITES.forEach(site => {
    if (!state.sites[site.code]) {
      state.sites[site.code] = { ...site, permissionCodes: [], updatedAt: now(), updatedBy: 'kaizong' }
    }
    state.roles[site.code] = state.roles[site.code] || buildDefaultRoles(site.code, state.sites[site.code].permissionCodes)
    state.accounts[site.code] = state.accounts[site.code] || buildDefaultAccounts(site.code, state.roles[site.code])
  })
  writeSitePermissionState(state)
  return clone(state)
}

export function writeSitePermissionState(state) {
  if (canUseStorage()) {
    window.localStorage.setItem(SITE_PERMISSION_STORAGE_KEY, JSON.stringify(state))
  }
  return clone(state)
}

export function filterTreeByPermissionCodes(nodes = [], permissionCodes = []) {
  const allowed = new Set(permissionCodes)
  return nodes.reduce((result, node) => {
    const children = filterTreeByPermissionCodes(node.children || [], permissionCodes)
    if ((node.permission && allowed.has(node.permission)) || children.length) {
      result.push({ ...clone(node), children })
    }
    return result
  }, [])
}

export function getPermissionStats(permissionTree = [], permissionCodes = []) {
  const selected = new Set(permissionCodes)
  const flat = flattenPermissionTree(permissionTree, [])
  const pages = flat.filter(node => node.type === 'page' && selected.has(node.viewPermission)).length
  const actions = flat.filter(node => node.type === 'permission' && node.action !== 'view' && selected.has(node.permission)).length
  const menus = flat.filter(node => node.type === 'directory' && collectPermissionCodes(node.children || []).some(code => selected.has(code))).length
  return { menus, pages, actions, total: selected.size }
}

export function saveSitePermissions(siteCodes, permissionCodes, permissionTree = []) {
  const state = readSitePermissionState(permissionTree)
  const validCodes = new Set(collectPermissionCodes(permissionTree.length ? permissionTree : state.catalogTree))
  const normalized = [...new Set(permissionCodes)].filter(code => validCodes.has(code))
  siteCodes.forEach(siteCode => {
    const site = state.sites[siteCode]
    if (!site) return
    site.permissionCodes = [...normalized]
    site.updatedAt = now()
    site.updatedBy = 'kaizong'
    state.roles[siteCode] = (state.roles[siteCode] || []).map(role => ({
      ...role,
      permissionCodes: role.system
        ? [...normalized]
        : (role.permissionCodes || []).filter(code => normalized.includes(code)),
      updatedAt: now()
    }))
  })
  state.catalogTree = clone(permissionTree.length ? permissionTree : state.catalogTree)
  return writeSitePermissionState(state)
}

export function copySitePermissions(sourceSiteCode, targetSiteCodes, permissionTree = []) {
  const state = readSitePermissionState(permissionTree)
  const sourceCodes = (state.sites[sourceSiteCode] && state.sites[sourceSiteCode].permissionCodes) || []
  return saveSitePermissions(targetSiteCodes, sourceCodes, permissionTree.length ? permissionTree : state.catalogTree)
}

export function saveSiteRole(siteCode, role) {
  const state = readSitePermissionState()
  const grants = (state.sites[siteCode] && state.sites[siteCode].permissionCodes) || []
  const roles = state.roles[siteCode] || []
  const nextRole = {
    ...role,
    id: role.id || `${siteCode}-role-${Date.now()}`,
    permissionCodes: (role.permissionCodes || []).filter(code => grants.includes(code)),
    createdAt: role.createdAt || now(),
    updatedAt: now(),
    system: Boolean(role.system)
  }
  const index = roles.findIndex(item => item.id === nextRole.id)
  if (index >= 0) roles.splice(index, 1, nextRole)
  else roles.unshift(nextRole)
  state.roles[siteCode] = roles
  return writeSitePermissionState(state)
}

export function deleteSiteRole(siteCode, roleId) {
  const state = readSitePermissionState()
  state.roles[siteCode] = (state.roles[siteCode] || []).filter(role => role.id !== roleId || role.system)
  state.accounts[siteCode] = (state.accounts[siteCode] || []).map(account => ({
    ...account,
    roleIds: (account.roleIds || []).filter(id => id !== roleId)
  }))
  return writeSitePermissionState(state)
}

export function saveSiteAccount(siteCode, account) {
  const state = readSitePermissionState()
  const validRoleIds = (state.roles[siteCode] || []).filter(role => role.status).map(role => role.id)
  const accounts = state.accounts[siteCode] || []
  const nextAccount = {
    ...account,
    id: account.id || `${siteCode}-account-${Date.now()}`,
    roleIds: (account.roleIds || []).filter(id => validRoleIds.includes(id))
  }
  const index = accounts.findIndex(item => item.id === nextAccount.id)
  if (index >= 0) accounts.splice(index, 1, nextAccount)
  else accounts.unshift(nextAccount)
  state.accounts[siteCode] = accounts
  return writeSitePermissionState(state)
}

export function deleteSiteAccount(siteCode, accountId) {
  const state = readSitePermissionState()
  state.accounts[siteCode] = (state.accounts[siteCode] || []).filter(account => account.id !== accountId)
  return writeSitePermissionState(state)
}

export function getAccountPermissionCodes(state, siteCode, account) {
  const grants = (state.sites[siteCode] && state.sites[siteCode].permissionCodes) || []
  const roles = (state.roles[siteCode] || []).filter(role => role.status && (account.roleIds || []).includes(role.id))
  const codes = roles.reduce((result, role) => result.concat(role.permissionCodes || []), [])
  return [...new Set(codes)].filter(code => grants.includes(code))
}
