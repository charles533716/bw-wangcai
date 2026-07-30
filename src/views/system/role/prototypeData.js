import {
  buildPermissionTree,
  buildPresetPermissions,
  PROTOTYPE_ROLE_STORAGE_KEY
} from './permissionCatalog'

export const prototypeRoleRows = [
  {
    roleId: 1,
    roleName: '超级管理员',
    roleKey: 'admin',
    roleSort: 1,
    status: '0',
    userCount: 3,
    createTime: '2025-08-27 14:15:38',
    updateTime: '2026-07-29 09:00:00',
    remark: '拥有总站后台全部菜单和操作权限',
    permissionCatalogVersion: 2,
    preset: true,
    locked: true
  },
  {
    roleId: 2,
    roleName: '运营人员',
    roleKey: 'operator',
    roleSort: 2,
    status: '0',
    userCount: 12,
    createTime: '2026-01-12 10:20:00',
    updateTime: '2026-07-28 16:42:18',
    remark: '负责活动、内容、公告和运营报表等业务',
    permissionCatalogVersion: 2,
    preset: true
  },
  {
    roleId: 3,
    roleName: '财务人员',
    roleKey: 'finance',
    roleSort: 3,
    status: '0',
    userCount: 8,
    createTime: '2026-01-15 09:30:00',
    updateTime: '2026-07-28 14:25:36',
    remark: '负责充值、提款、资金审核及财务报表',
    permissionCatalogVersion: 2,
    preset: true
  },
  {
    roleId: 4,
    roleName: '风控人员',
    roleKey: 'risk',
    roleSort: 4,
    status: '0',
    userCount: 6,
    createTime: '2026-02-03 11:10:00',
    updateTime: '2026-07-27 18:15:42',
    remark: '负责会员风控、风险审核和黑名单管理',
    permissionCatalogVersion: 2,
    preset: true
  },
  {
    roleId: 5,
    roleName: '客服人员',
    roleKey: 'service',
    roleSort: 5,
    status: '0',
    userCount: 18,
    createTime: '2026-02-08 13:45:00',
    updateTime: '2026-07-28 11:08:22',
    remark: '负责会员查询、订单查询和客服处理',
    permissionCatalogVersion: 2,
    preset: true
  }
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function buildRoleMenuTree(routes = []) {
  return buildPermissionTree(routes)
}

export function mergeStoredRoles(storedRows = []) {
  const stored = Array.isArray(storedRows) ? storedRows : []
  const mergedPresets = prototypeRoleRows.map(preset => {
    const existing = stored.find(row => (
      row.roleId === preset.roleId || row.roleKey === preset.roleKey
    ))
    if (!existing) return clone(preset)
    const catalogIsCurrent = existing.permissionCatalogVersion === preset.permissionCatalogVersion
    return {
      ...clone(preset),
      ...clone(existing),
      roleId: preset.roleId,
      roleKey: preset.roleKey,
      roleName: preset.roleName,
      preset: true,
      locked: preset.locked || false,
      permissionCatalogVersion: preset.permissionCatalogVersion,
      permissionCodes: catalogIsCurrent ? clone(existing.permissionCodes || []) : undefined
    }
  })
  const customRoles = stored.filter(row => !prototypeRoleRows.some(preset => (
    row.roleId === preset.roleId || row.roleKey === preset.roleKey
  )))
  return [...mergedPresets, ...clone(customRoles)]
}

export function clonePrototypeRoles() {
  try {
    const stored = window.localStorage.getItem(PROTOTYPE_ROLE_STORAGE_KEY)
    return mergeStoredRoles(stored ? JSON.parse(stored) : [])
  } catch (error) {
    return clone(prototypeRoleRows)
  }
}

export function savePrototypeRoles(rows = []) {
  try {
    window.localStorage.setItem(PROTOTYPE_ROLE_STORAGE_KEY, JSON.stringify(rows))
  } catch (error) {
    // Local persistence is best-effort in this prototype.
  }
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

export function getRoleCheckedKeys(role, menuTree) {
  if (role && Array.isArray(role.permissionCodes)) {
    return role.permissionCodes.slice()
  }
  return buildPresetPermissions(role && role.roleKey, menuTree)
}

export function nextRoleId(rows = []) {
  return rows.reduce((maxId, row) => Math.max(maxId, Number(row.roleId) || 0), 0) + 1
}
