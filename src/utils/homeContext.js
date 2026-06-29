const DEFAULT_HOME_PATH = '/index'
const DEFAULT_HOME_TITLE = '首页'

export function normalizeRoleKeys(roles = []) {
  return roles.map(role => {
    if (role && typeof role === 'object') {
      return String(role.roleKey || role.key || '').toLowerCase()
    }
    return String(role || '').toLowerCase()
  })
}

export function normalizeRoutePath(path) {
  const current = String(path || '').trim()
  if (!current) {
    return ''
  }
  return current.startsWith('/') ? current : `/${current}`
}

function isExternalPath(path) {
  const current = String(path || '').trim()
  return /^(https?:|mailto:|tel:)/i.test(current)
}

function joinRoutePath(basePath, routePath) {
  const base = String(basePath || '').trim()
  const current = String(routePath || '').trim()
  if (!current) {
    return normalizeRoutePath(base)
  }
  if (isExternalPath(current)) {
    return current
  }
  if (current.startsWith('/')) {
    return current
  }
  const normalizedBase = normalizeRoutePath(base)
  if (!normalizedBase || normalizedBase === '/') {
    return `/${current}`
  }
  return `${normalizedBase.replace(/\/+$/, '')}/${current.replace(/^\/+/, '')}`
}

function isContainerRoute(route) {
  const componentName = route?.component?.name
  return componentName === 'Layout' || componentName === 'ParentView' || componentName === 'InnerLink'
}

export function findFirstLeafRoute(routes, parentPath = '') {
  if (!Array.isArray(routes)) {
    return null
  }
  for (const route of routes) {
    if (!route || typeof route !== 'object' || route.hidden) {
      continue
    }
    const currentPath = joinRoutePath(parentPath, route.path)
    if (Array.isArray(route.children) && route.children.length) {
      const child = findFirstLeafRoute(route.children, currentPath)
      if (child) {
        return child
      }
      continue
    }
    if (route.component && route.path && !isContainerRoute(route)) {
      return {
        route,
        fullPath: currentPath
      }
    }
  }
  return null
}

export function deriveHomeContext({
  roles = [],
  sidebarRoutes = [],
  staticHomeRoleKeys = []
} = {}) {
  const normalizedRoles = normalizeRoleKeys(roles)
  const keepConstantSidebar = normalizedRoles.some(role => staticHomeRoleKeys.includes(role))
  if (keepConstantSidebar) {
    return {
      keepConstantSidebar,
      homePath: DEFAULT_HOME_PATH,
      homeTitle: DEFAULT_HOME_TITLE
    }
  }

  const firstLeafRoute = findFirstLeafRoute(sidebarRoutes)
  const candidatePath = firstLeafRoute?.fullPath
  const homePath = !candidatePath || isExternalPath(candidatePath)
    ? DEFAULT_HOME_PATH
    : normalizeRoutePath(candidatePath)
  const homeTitle = String(firstLeafRoute?.route?.meta?.title || DEFAULT_HOME_TITLE).trim() || DEFAULT_HOME_TITLE
  return {
    keepConstantSidebar,
    homePath,
    homeTitle
  }
}
