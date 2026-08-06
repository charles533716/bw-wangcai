import {
  collectPageViewPermissions,
  findPermissionForLegacy,
  flattenPermissionTree,
  PROTOTYPE_PERMISSION_STORAGE_KEY
} from '@/views/system/role/permissionCatalog'
import { getCurrentBackendMode, getCurrentSiteCode } from '@/utils/prototypeBackend'
import { buildSitePermissionTree } from '@/utils/sitePermissionCatalog'
import { readSitePermissionState } from '@/utils/sitePermissionStore'

const TREE_KEY = `${PROTOTYPE_PERMISSION_STORAGE_KEY}:tree`

function readJson(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) || fallback
  } catch (error) {
    return fallback
  }
}

export function getPermissionPreview() {
  return readJson(PROTOTYPE_PERMISSION_STORAGE_KEY, null)
}

export function getStoredPermissionTree() {
  return readJson(TREE_KEY, [])
}

export function applyPermissionPreview(role, permissionTree) {
  window.localStorage.setItem(TREE_KEY, JSON.stringify(permissionTree || []))
  window.localStorage.setItem(PROTOTYPE_PERMISSION_STORAGE_KEY, JSON.stringify({
    roleId: role.roleId,
    roleName: role.roleName,
    roleKey: role.roleKey,
    permissionCodes: role.permissionCodes || []
  }))
}

export function clearPermissionPreview() {
  window.localStorage.removeItem(PROTOTYPE_PERMISSION_STORAGE_KEY)
}

function normalizePath(path = '') {
  const segments = String(path)
    .split('/')
    .filter(Boolean)
    .filter(segment => !['site-admin', 'agent-admin'].includes(segment))
  return `/${segments.join('/')}`
}

function matchingPage(path, tree) {
  const target = normalizePath(path)
  return flattenPermissionTree(tree, [])
    .filter(node => node.type === 'page')
    .sort((a, b) => b.routePath.length - a.routePath.length)
    .find(node => target === normalizePath(node.routePath) ||
      target.startsWith(`${normalizePath(node.routePath)}/`))
}

function getEffectivePermissionScope() {
  const preview = getPermissionPreview()
  if (getCurrentBackendMode() === 'site') {
    const state = readSitePermissionState(buildSitePermissionTree())
    const site = state.sites && state.sites[getCurrentSiteCode()]
    if (site) {
      let permissionCodes = site.permissionCodes || []
      if (preview && preview.roleKey !== 'admin') {
        const previewCodes = new Set(preview.permissionCodes || [])
        permissionCodes = permissionCodes.filter(code => previewCodes.has(code))
      }
      return {
        permissionCodes,
        permissionTree: state.catalogTree || []
      }
    }
  }
  if (!preview || preview.roleKey === 'admin') return null
  return {
    permissionCodes: preview.permissionCodes || [],
    permissionTree: getStoredPermissionTree()
  }
}

export function hasPrototypePageAccess(path) {
  const scope = getEffectivePermissionScope()
  if (!scope) return true
  const page = matchingPage(path, scope.permissionTree)
  return !page || scope.permissionCodes.includes(page.viewPermission)
}

export function hasPrototypePermission(requiredPermissions, routePath) {
  const scope = getEffectivePermissionScope()
  if (!scope) return true
  const tree = scope.permissionTree
  const granted = scope.permissionCodes
  return requiredPermissions.some(required => {
    const mapped = findPermissionForLegacy(tree, routePath, required)
    return mapped && granted.includes(mapped)
  })
}

export function filterRoutesForPreview(routes = []) {
  const scope = getEffectivePermissionScope()
  if (!scope) return routes
  const views = Object.entries(collectPageViewPermissions(scope.permissionTree))
    .reduce((result, [path, permission]) => {
      result[normalizePath(path)] = permission
      return result
    }, {})
  const allowed = new Set(scope.permissionCodes)

  function filter(nodes, parent = '') {
    return nodes.reduce((result, route) => {
      const path = `${parent}/${String(route.path || '').replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/')
      const next = { ...route, meta: route.meta ? { ...route.meta } : route.meta }
      if (route.children && route.children.length) {
        next.children = filter(route.children, path)
        if (next.children.length) result.push(next)
        return result
      }
      const view = views[normalizePath(path)]
      if (!view || allowed.has(view)) result.push(next)
      return result
    }, [])
  }

  return filter(routes)
}
