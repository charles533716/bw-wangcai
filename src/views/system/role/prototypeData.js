export const prototypeRoleRows = [
  {
    roleId: 1,
    roleName: '超级管理员',
    roleKey: 'admin',
    roleSort: 1,
    status: '0',
    createTime: '2025-08-27 14:15:38',
    remark: '拥有总站后台全部权限'
  },
  {
    roleId: 8,
    roleName: '测试角色权限',
    roleKey: '测试',
    roleSort: 2,
    status: '0',
    createTime: '2026-06-25 21:31:46',
    remark: '用于测试菜单及按钮权限'
  },
  {
    roleId: 7,
    roleName: '技术',
    roleKey: 'jishu',
    roleSort: 2,
    status: '0',
    createTime: '2026-02-13 17:56:04',
    remark: '技术维护角色'
  },
  {
    roleId: 4,
    roleName: '超级权限',
    roleKey: '超级权限',
    roleSort: 2,
    status: '0',
    createTime: '2025-12-30 17:21:05',
    remark: '总站业务管理权限'
  },
  {
    roleId: 5,
    roleName: '财务',
    roleKey: 'caiwu',
    roleSort: 3,
    status: '0',
    createTime: '2026-02-12 09:12:34',
    remark: '财务业务处理权限'
  }
]

const menuPrefixes = {
  directory: '[M] ',
  menu: '[C] '
}
const functionPermissions = ['[F] 查询', '[F] 新增', '[F] 修改', '[F] 删除', '[F] 导出']
const realNameBindingPermissions = ['[F] 实名信息全明文', '[F] 实名信息半脱敏']

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function visibleRoutes(routes = []) {
  return routes.filter(route => route && !route.hidden && !(route.meta && route.meta.hidden))
}

function normalizePath(parentPath, routePath, index) {
  const path = String(routePath || `node-${index}`).replace(/^\/+|\/+$/g, '')
  const parent = String(parentPath || '').replace(/\/$/, '')
  return `${parent}/${path}`.replace(/\/{2,}/g, '/')
}

function createFunctionNodes(menuPath, menuTitle) {
  const permissions = menuTitle === '实名信息绑定记录'
    ? functionPermissions.concat(realNameBindingPermissions)
    : functionPermissions
  return permissions.map(action => ({
    id: `permission:${menuPath}:${action}`,
    label: action,
    type: 'function'
  }))
}

function routeToNode(route, parentPath = '', index = 0) {
  const children = visibleRoutes(route.children || [])
  const routePath = normalizePath(parentPath, route.path, index)
  const routeTitle = route.meta && route.meta.title

  if (!routeTitle && children.length === 1) {
    return routeToNode(children[0], routePath, 0)
  }

  const title = routeTitle || route.name || route.path || `菜单${index + 1}`
  const menuChildren = children.map((childRoute, childIndex) => (
    routeToNode(childRoute, routePath, childIndex)
  )).filter(Boolean)
  const isDirectory = menuChildren.length > 0

  return {
    id: `menu:${routePath}`,
    label: `${isDirectory ? menuPrefixes.directory : menuPrefixes.menu}${title}`,
    title,
    type: isDirectory ? 'directory' : 'menu',
    children: isDirectory ? menuChildren : createFunctionNodes(routePath, title)
  }
}

export function buildRoleMenuTree(routes = []) {
  return visibleRoutes(routes)
    .map((route, index) => routeToNode(route, '', index))
    .filter(Boolean)
}

export function clonePrototypeRoles() {
  return clone(prototypeRoleRows)
}

export function filterPrototypeRoles(rows, query = {}, dateRange = []) {
  const roleName = String(query.roleName || '').trim().toLowerCase()
  const roleKey = String(query.roleKey || '').trim().toLowerCase()
  const beginDate = dateRange && dateRange[0]
  const endDate = dateRange && dateRange[1]

  return rows.filter(row => {
    const createdDate = String(row.createTime || '').slice(0, 10)
    return (!roleName || row.roleName.toLowerCase().includes(roleName)) &&
      (!roleKey || row.roleKey.toLowerCase().includes(roleKey)) &&
      (!query.status || row.status === query.status) &&
      (!beginDate || createdDate >= beginDate) &&
      (!endDate || createdDate <= endDate)
  })
}

function collectLeafKeys(nodes, keys = []) {
  nodes.forEach(node => {
    if (node.children && node.children.length) {
      collectLeafKeys(node.children, keys)
    } else {
      keys.push(node.id)
    }
  })
  return keys
}

export function getRoleCheckedKeys(roleKey, menuTree) {
  const allAccessRoles = ['admin', '测试', '超级权限']
  if (allAccessRoles.includes(roleKey)) {
    return collectLeafKeys(menuTree)
  }

  const accessTitles = roleKey === 'caiwu'
    ? ['财务管理', '充提费用管理', '三方场馆管理', '运营报表']
    : ['全站运营数据看板', '站点管理', '系统管理', '系统监控']
  const scopedNodes = menuTree.filter(node => accessTitles.includes(node.title))
  return collectLeafKeys(scopedNodes)
}

export function nextRoleId(rows = []) {
  return rows.reduce((maxId, row) => Math.max(maxId, Number(row.roleId) || 0), 0) + 1
}
