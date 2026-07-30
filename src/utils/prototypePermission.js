import {
  collectPageViewPermissions,
  findPermissionForLegacy,
  flattenPermissionTree,
  PROTOTYPE_PERMISSION_STORAGE_KEY
} from '@/views/system/role/permissionCatalog'

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
  return `/${String(path).replace(/^\/+|\/+$/g, '')}`
}

function matchingPage(path, tree) {
  const target = normalizePath(path)
  return flattenPermissionTree(tree, [])
    .filter(node => node.type === 'page')
    .sort((a, b) => b.routePath.length - a.routePath.length)
    .find(node => target === normalizePath(node.routePath) ||
      target.startsWith(`${normalizePath(node.routePath)}/`))
}

export function hasPrototypePageAccess(path) {
  const preview = getPermissionPreview()
  if (!preview || preview.roleKey === 'admin') return true
  const page = matchingPage(path, getStoredPermissionTree())
  return !page || (preview.permissionCodes || []).includes(page.viewPermission)
}

export function hasPrototypePermission(requiredPermissions, routePath) {
  const preview = getPermissionPreview()
  if (!preview || preview.roleKey === 'admin') return true
  const tree = getStoredPermissionTree()
  const granted = preview.permissionCodes || []
  return requiredPermissions.some(required => {
    const mapped = findPermissionForLegacy(tree, routePath, required)
    return mapped && granted.includes(mapped)
  })
}

export function filterRoutesForPreview(routes = []) {
  const preview = getPermissionPreview()
  if (!preview || preview.roleKey === 'admin') return routes
  const views = collectPageViewPermissions(getStoredPermissionTree())
  const allowed = new Set(preview.permissionCodes || [])

  function filter(nodes, parent = '') {
    return nodes.reduce((result, route) => {
      const path = `${parent}/${String(route.path || '').replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/')
      const next = { ...route, meta: route.meta ? { ...route.meta } : route.meta }
      if (route.children && route.children.length) {
        next.children = filter(route.children, path)
        if (next.children.length) result.push(next)
        return result
      }
      const view = views[path]
      if (!view || allowed.has(view)) result.push(next)
      return result
    }, [])
  }

  return filter(routes)
}
