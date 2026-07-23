const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const dataPath = path.join(root, 'src/views/system/role/prototypeData.js')
const viewPath = path.join(root, 'src/views/system/role/index.vue')

const dataSource = fs.readFileSync(dataPath, 'utf8')
const viewSource = fs.readFileSync(viewPath, 'utf8')

const expectedRoles = [
  ['1', '超级管理员', 'admin', '2025-08-27 14:15:38'],
  ['8', '测试角色权限', '测试', '2026-06-25 21:31:46'],
  ['7', '技术', 'jishu', '2026-02-13 17:56:04'],
  ['4', '超级权限', '超级权限', '2025-12-30 17:21:05'],
  ['5', '财务', 'caiwu', '2026-02-12 09:12:34']
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
  "[M] ",
  "[C] ",
  "[F] 查询",
  "[F] 新增",
  "[F] 修改",
  "[F] 删除",
  "[F] 导出",
  "实名信息绑定记录",
  "[F] 实名信息全明文",
  "[F] 实名信息半脱敏"
]

requiredDataTokens.forEach(token => {
  if (!dataSource.includes(token)) {
    throw new Error(`Missing role-menu prototype token: ${token}`)
  }
})

const requiredViewTokens = [
  'prototypeRoleRows',
  'buildRoleMenuTree',
  'role-dialog',
  'permission-tree',
  '菜单权限'
]

requiredViewTokens.forEach(token => {
  if (!viewSource.includes(token)) {
    throw new Error(`Role view is missing: ${token}`)
  }
})

console.log('Role management prototype checks passed.')
