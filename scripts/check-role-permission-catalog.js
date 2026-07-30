const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const catalogPath = path.join(root, 'src/views/system/role/permissionCatalog.js')
const generatedPath = path.join(root, 'src/views/system/role/generatedPermissionActions.js')
const rolePath = path.join(root, 'src/views/system/role/index.vue')

const catalog = fs.readFileSync(catalogPath, 'utf8')
const generated = fs.readFileSync(generatedPath, 'utf8')
const roleView = fs.readFileSync(rolePath, 'utf8')

const requiredCatalogTokens = [
  'buildPermissionTree',
  'buildPermissionManifest',
  'createPermissionCode',
  'filterPermissionTree',
  'collectPermissionCodes',
  'findPermissionForLegacy',
  'validatePermissionTree',
  'PROTOTYPE_PERMISSION_STORAGE_KEY',
  '活动列表',
  '手动派彩',
  '实名信息全明文',
  '实名信息半脱敏'
]

requiredCatalogTokens.forEach(token => {
  if (!catalog.includes(token)) {
    throw new Error(`Permission catalog is missing: ${token}`)
  }
})

if (!generated.includes('generatedComponentActions')) {
  throw new Error('Generated component permission mapping is missing.')
}

const requiredRoleTokens = [
  '搜索菜单、页面或权限名称',
  '已选择',
  '全选',
  '取消全选',
  '展开全部',
  '收起全部',
  '应用此角色预览'
]

requiredRoleTokens.forEach(token => {
  if (!roleView.includes(token)) {
    throw new Error(`Role permission UI is missing: ${token}`)
  }
})

const latestPageTokens = [
  '活动奖励明细',
  '手动派彩',
  '余额宝利息发放记录',
  '会员实名审核列表',
  '会员提现流水查询',
  '游戏自动下架日志',
  '负盈利代理佣金结算',
  '负盈利代理佣金报表',
  '修改代理关系记录'
]

latestPageTokens.forEach(token => {
  if (!catalog.includes(token)) {
    throw new Error(`Latest page permission override is missing: ${token}`)
  }
})

console.log('Role permission catalog checks passed.')
