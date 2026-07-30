const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const dataPath = path.join(root, 'src/views/system/role/prototypeData.js')
const viewPath = path.join(root, 'src/views/system/role/index.vue')
const catalogPath = path.join(root, 'src/views/system/role/permissionCatalog.js')
const manifestPath = path.join(root, 'docs/permissions/role-permission-list.md')
const userViewPath = path.join(root, 'src/views/system/user/index.vue')

const dataSource = fs.readFileSync(dataPath, 'utf8')
const viewSource = fs.readFileSync(viewPath, 'utf8')
const catalogSource = fs.readFileSync(catalogPath, 'utf8')
const userViewSource = fs.readFileSync(userViewPath, 'utf8')

const expectedRoles = [
  ['超级管理员', 'admin', '拥有总站后台全部菜单和操作权限'],
  ['运营人员', 'operator', '负责活动、内容、公告和运营报表等业务'],
  ['财务人员', 'finance', '负责充值、提款、资金审核及财务报表'],
  ['风控人员', 'risk', '负责会员风控、风险审核和黑名单管理'],
  ['客服人员', 'service', '负责会员查询、订单查询和客服处理']
]

expectedRoles.forEach(values => {
  values.forEach(value => {
    if (!dataSource.includes(value)) {
      throw new Error(`Missing role prototype value: ${value}`)
    }
  })
})

const requiredDataTokens = [
  'buildRoleMenuTree',
  'mergeStoredRoles',
  'buildPresetPermissions'
]

requiredDataTokens.forEach(token => {
  if (!dataSource.includes(token)) {
    throw new Error(`Missing role-menu prototype token: ${token}`)
  }
})

const requiredViewTokens = [
  'prototypeRoleRows',
  'buildRoleMenuTree',
  'permission-tree',
  '权限配置',
  '序号',
  '权限字符',
  '角色顺序',
  '搜索菜单、页面或权限名称',
  '全选',
  '取消全选',
  '展开全部',
  '收起全部',
  '已选择：',
  '查看权限清单',
  'permissionManifestVisible',
  'syncPermissionCodesFromTree',
  'getCheckedNodes',
  '查看',
  '编辑',
  '复制',
  '删除',
  '启用',
  '导出权限清单'
]

requiredViewTokens.forEach(token => {
  if (!viewSource.includes(token)) {
    throw new Error(`Role view is missing: ${token}`)
  }
})

;[
  'label="角色名称" prop="roleName"',
  'key="roleName"',
  'queryParams.roleName',
  'columns.roleName',
  'fallbackRoles'
].forEach(token => {
  if (!userViewSource.includes(token)) {
    throw new Error(`User view is missing: ${token}`)
  }
})

if (!catalogSource.includes('buildPermissionManifest')) {
  throw new Error('Permission catalog must expose a unified manifest builder.')
}

if (!dataSource.includes('permissionCatalogVersion: 3')) {
  throw new Error('Preset roles must use the latest permission catalog version.')
}

if (!fs.existsSync(manifestPath)) {
  throw new Error('Permission manifest document is missing.')
}

const manifestSource = fs.readFileSync(manifestPath, 'utf8')
;[
  '| 一级菜单 | 二级菜单/页面 | 权限名称 | 权限标识 |',
  '活动列表',
  '会员列表',
  '奖励发放记录',
  '游戏自动下架日志',
  '负盈利代理佣金结算',
  '修改代理关系记录'
].forEach(token => {
  if (!manifestSource.includes(token)) {
    throw new Error(`Permission manifest is missing: ${token}`)
  }
})

console.log('Role management prototype checks passed.')
