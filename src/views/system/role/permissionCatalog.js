import { generatedComponentActions } from './generatedPermissionActions'

const ACTION_ALIASES = {
  add: 'create',
  create: 'create',
  edit: 'edit',
  update: 'edit',
  remove: 'delete',
  delete: 'delete',
  list: 'view',
  query: 'view',
  view: 'view',
  detail: 'detail',
  changeStatus: 'status',
  status: 'status',
  approve: 'approve',
  reject: 'reject',
  audit: 'audit',
  review: 'review',
  import: 'import',
  export: 'export',
  upload: 'upload',
  download: 'download',
  config: 'config',
  assign: 'assign',
  auth: 'assign',
  bind: 'bind',
  unbind: 'unbind',
  freeze: 'freeze',
  unfreeze: 'unfreeze',
  lock: 'lock',
  unlock: 'unlock',
  reset: 'reset',
  resetPwd: 'reset',
  adjust: 'adjust',
  grant: 'grant',
  issue: 'issue',
  send: 'send',
  recall: 'recall',
  release: 'release',
  complete: 'complete',
  transfer: 'transfer',
  recharge: 'recharge',
  activityCash: 'grant',
  remark: 'remark',
  sync: 'sync',
  preview: 'preview',
  code: 'generate',
  forceLogout: 'logout',
  googleAuth: 'auth',
  save: 'save',
  publish: 'publish',
  apply: 'apply',
  sort: 'sort',
  fulltext: 'fulltext',
  masked: 'masked'
}

const ACTION_LABELS = {
  view: '查看',
  detail: '查看详情',
  create: '新增',
  edit: '编辑',
  delete: '删除',
  status: '启用/禁用',
  audit: '审核',
  approve: '审核通过',
  reject: '审核拒绝',
  review: '重新审核',
  import: '导入',
  export: '导出',
  upload: '上传',
  download: '下载',
  config: '配置',
  assign: '分配',
  bind: '绑定',
  unbind: '解绑',
  freeze: '冻结',
  unfreeze: '解冻',
  lock: '锁定',
  unlock: '解锁',
  reset: '重置',
  adjust: '调整余额',
  grant: '发放',
  issue: '补发',
  send: '发送',
  recall: '撤回',
  release: '释放',
  complete: '完成',
  transfer: '转账',
  recharge: '补充额度',
  remark: '备注',
  sync: '同步',
  preview: '预览',
  generate: '生成',
  logout: '强制退出',
  auth: '验证',
  save: '保存',
  publish: '发布',
  apply: '申请',
  sort: '调整排序',
  fulltext: '实名信息全明文',
  masked: '实名信息半脱敏'
}

const TITLE_OVERRIDES = {
  活动列表: [
    ['create', '新增活动'],
    ['edit', '编辑'],
    ['delete', '删除'],
    ['status', '启用/禁用'],
    ['detail', '查看详情'],
    ['sort', '调整排序']
  ],
  手动派彩: [
    ['grant', '手动派彩'],
    ['batch-grant', '批量手动派彩'],
    ['export', '导出']
  ],
  活动奖励明细: [
    ['detail', '查看详情'],
    ['manual-unlock', '人工解锁'],
    ['refresh-turnover', '刷新流水'],
    ['export', '导出']
  ],
  余额宝利息发放记录: [
    ['config', '余额宝规则配置'],
    ['export', '导出']
  ],
  会员列表: [
    ['detail', '查看详情'],
    ['edit', '编辑'],
    ['freeze', '封禁'],
    ['unfreeze', '解封'],
    ['reset-login-password', '修改登录密码'],
    ['reset-withdraw-password', '重置提现密码'],
    ['recycle-balance', '一键回收场馆余额'],
    ['batch-freeze', '批量封禁'],
    ['batch-unfreeze', '批量解封']
  ],
  会员实名审核列表: [
    ['edit', '手动修改'],
    ['approve', '审核通过'],
    ['reject', '审核拒绝']
  ],
  会员提现流水查询: [
    ['detail', '查看明细'],
    ['export', '导出']
  ],
  游戏自动下架日志: [
    ['detail', '查看详情'],
    ['export', '导出']
  ],
  负盈利代理佣金结算: [
    ['export', '导出'],
    ['confirm', '确认发放'],
    ['no-grant', '不发放'],
    ['modify-grant', '修改发放']
  ],
  负盈利代理佣金报表: [
    ['export', '导出']
  ],
  修改代理关系记录: [],
  掉签分析: [
    ['records', '查看掉签记录'],
    ['generate', '生成掉签节点'],
    ['export', '导出']
  ],
  telegram配置: [
    ['create', '新增'],
    ['edit', '编辑'],
    ['delete', '删除'],
    ['status', '启用/禁用'],
    ['export', '导出']
  ],
  角色管理: [
    ['create', '新增角色'],
    ['detail', '查看'],
    ['edit', '编辑'],
    ['copy', '复制'],
    ['delete', '删除'],
    ['status', '启用/禁用'],
    ['permission', '配置权限'],
    ['assign', '分配用户'],
    ['export', '导出']
  ],
  实名信息绑定记录: [
    ['fulltext', '实名信息全明文'],
    ['masked', '实名信息半脱敏']
  ]
}

const PRESET_ROLE_SCOPES = {
  operator: ['运营报表', '活动管理', 'Telegram管理', '下载和推广', '记录管理'],
  finance: ['财务管理', '充提费用管理', '运营报表', '三方场馆管理'],
  risk: ['风控管理', '会员管理', '记录管理'],
  service: ['会员管理', '记录管理', '意见反馈']
}

export const PROTOTYPE_PERMISSION_STORAGE_KEY = 'master-admin-prototype:permission-preview'
export const PROTOTYPE_ROLE_STORAGE_KEY = 'master-admin-prototype:roles'

export function normalizePermissionAction(action = '') {
  return ACTION_ALIASES[action] || String(action).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
}

export function normalizePermissionPath(routePath = '') {
  const segments = String(routePath)
    .split('/')
    .filter(Boolean)
    .filter(segment => !['site-admin', 'agent-admin'].includes(segment))
    .map(segment => segment.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())
  const moduleName = segments[0] || 'dashboard'
  const pageName = segments.slice(1).join('-') || 'index'
  return { moduleName, pageName }
}

export function createPermissionCode(routePath, action = 'view') {
  const { moduleName, pageName } = normalizePermissionPath(routePath)
  return `${moduleName}:${pageName}:${normalizePermissionAction(action)}`
}

function normalizeRoutePath(parentPath, routePath, index) {
  const path = String(routePath || `node-${index}`).replace(/^\/+|\/+$/g, '')
  const parent = String(parentPath || '').replace(/\/$/, '')
  return `${parent}/${path}`.replace(/\/{2,}/g, '/')
}

function visibleRoutes(routes = []) {
  return routes.filter(route => route && !route.hidden && !(route.meta && route.meta.hidden))
}

function resolveComponentActions(component = '', title = '') {
  const generated = generatedComponentActions[component] || []
  const actions = []
  generated.forEach(item => {
    const action = normalizePermissionAction(item.action)
    const existing = actions.find(operation => operation.action === action)
    if (existing) {
      if (item.legacy && !existing.legacyPermissions.includes(item.legacy)) {
        existing.legacyPermissions.push(item.legacy)
      }
      return
    }
    actions.push({
      action,
      label: item.label,
      legacyPermissions: item.legacy ? [item.legacy] : []
    })
  })
  ;(TITLE_OVERRIDES[title] || []).forEach(([action, label]) => {
    if (!actions.some(item => item.action === action)) {
      actions.push({ action, label, legacyPermissions: [] })
    }
  })
  return actions.filter(item => item.action !== 'view')
}

function routeToPermissionNode(route, parentPath = '', index = 0) {
  const children = visibleRoutes(route.children || [])
  const routePath = normalizeRoutePath(parentPath, route.path, index)
  const title = route.meta && route.meta.title

  if (!title && children.length === 1) {
    return routeToPermissionNode(children[0], routePath, 0)
  }

  const nodeTitle = title || route.name || route.path || `菜单${index + 1}`
  if (children.length) {
    return {
      id: `menu:${routePath}`,
      label: nodeTitle,
      title: nodeTitle,
      routePath,
      type: 'directory',
      children: children.map((child, childIndex) => (
        routeToPermissionNode(child, routePath, childIndex)
      )).filter(Boolean)
    }
  }

  const component = route.meta && route.meta.prototypeComponent
  const operations = resolveComponentActions(component, nodeTitle)
  const viewCode = createPermissionCode(routePath, 'view')
  return {
    id: `page:${routePath}`,
    label: nodeTitle,
    title: nodeTitle,
    routePath,
    component,
    type: 'page',
    viewPermission: viewCode,
    children: [
      {
        id: viewCode,
        label: '查看',
        title: '查看',
        type: 'permission',
        permission: viewCode,
        action: 'view',
        routePath
      },
      ...operations.map(operation => {
        const permission = createPermissionCode(routePath, operation.action)
        return {
          id: permission,
          label: operation.label || ACTION_LABELS[operation.action] || operation.action,
          title: operation.label || ACTION_LABELS[operation.action] || operation.action,
          type: 'permission',
          permission,
          action: operation.action,
          legacyPermissions: operation.legacyPermissions,
          routePath
        }
      })
    ]
  }
}

export function buildPermissionTree(routes = []) {
  return visibleRoutes(routes)
    .map((route, index) => routeToPermissionNode(route, '', index))
    .filter(Boolean)
}

export function buildPermissionManifest(nodes = []) {
  const rows = []
  const walk = (items, ancestors = []) => {
    items.forEach(node => {
      if (node.type === 'permission') {
        rows.push({
          firstMenu: ancestors[0] || '',
          page: ancestors[ancestors.length - 1] || ancestors[0] || '',
          permissionName: node.label,
          permissionCode: node.permission
        })
        return
      }
      walk(node.children || [], [...ancestors, node.label])
    })
  }
  walk(nodes)
  return rows
}

export function flattenPermissionTree(nodes = [], result = []) {
  nodes.forEach(node => {
    result.push(node)
    flattenPermissionTree(node.children || [], result)
  })
  return result
}

export function collectPermissionCodes(nodes = [], result = []) {
  nodes.forEach(node => {
    if (node.permission) {
      result.push(node.permission)
    }
    collectPermissionCodes(node.children || [], result)
  })
  return [...new Set(result)]
}

export function collectPageViewPermissions(nodes = [], result = {}) {
  nodes.forEach(node => {
    if (node.type === 'page' && node.routePath) {
      result[node.routePath] = node.viewPermission
    }
    collectPageViewPermissions(node.children || [], result)
  })
  return result
}

export function findPermissionForLegacy(nodes = [], routePath = '', legacyPermission = '') {
  const flat = flattenPermissionTree(nodes, [])
  const page = flat.find(node => node.type === 'page' && (
    routePath === node.routePath ||
    routePath.startsWith(`${node.routePath}/`) ||
    node.routePath.startsWith(`${routePath}/`)
  ))
  if (!page) {
    return ''
  }
  const exact = (page.children || []).find(node => (
    node.legacyPermissions || []
  ).includes(legacyPermission))
  if (exact) {
    return exact.permission
  }
  const legacyAction = String(legacyPermission).split(':').pop()
  const action = normalizePermissionAction(legacyAction)
  const actionNode = (page.children || []).find(node => node.action === action)
  return actionNode ? actionNode.permission : createPermissionCode(page.routePath, action)
}

export function filterPermissionTree(nodes = [], keyword = '') {
  const normalizedKeyword = String(keyword).trim().toLowerCase()
  if (!normalizedKeyword) {
    return JSON.parse(JSON.stringify(nodes))
  }
  return nodes.reduce((result, node) => {
    const children = filterPermissionTree(node.children || [], normalizedKeyword)
    const searchable = `${node.label || ''} ${node.permission || ''} ${(node.legacyPermissions || []).join(' ')}`.toLowerCase()
    if (searchable.includes(normalizedKeyword) || children.length) {
      result.push({ ...node, children })
    }
    return result
  }, [])
}

export function buildPresetPermissions(roleKey, permissionTree) {
  if (roleKey === 'admin') {
    return collectPermissionCodes(permissionTree)
  }
  const scopes = PRESET_ROLE_SCOPES[roleKey] || []
  const scopedNodes = permissionTree.filter(node => scopes.includes(node.title))
  return collectPermissionCodes(scopedNodes)
}

export function validatePermissionTree(permissionTree = []) {
  const flat = flattenPermissionTree(permissionTree, [])
  const permissions = flat.filter(node => node.permission).map(node => node.permission)
  const duplicatePermissions = permissions.filter((item, index) => permissions.indexOf(item) !== index)
  const pagesWithoutView = flat.filter(node => node.type === 'page' && !(
    node.children || []
  ).some(child => child.action === 'view'))
  return {
    valid: duplicatePermissions.length === 0 && pagesWithoutView.length === 0,
    duplicatePermissions: [...new Set(duplicatePermissions)],
    pagesWithoutView: pagesWithoutView.map(node => node.routePath),
    permissionCount: permissions.length,
    pageCount: flat.filter(node => node.type === 'page').length
  }
}
