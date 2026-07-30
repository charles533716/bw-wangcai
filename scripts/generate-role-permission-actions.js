const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const viewsRoot = path.join(root, 'src/views')
const outputPath = path.join(viewsRoot, 'system/role/generatedPermissionActions.js')

const actionLabels = {
  view: '查看',
  list: '查看',
  query: '查看',
  detail: '查看详情',
  add: '新增',
  create: '新增',
  edit: '编辑',
  update: '编辑',
  remove: '删除',
  delete: '删除',
  changeStatus: '启用/禁用',
  status: '启用/禁用',
  approve: '审核通过',
  reject: '审核拒绝',
  audit: '审核',
  review: '重新审核',
  import: '导入',
  export: '导出',
  upload: '上传',
  download: '下载',
  config: '配置',
  assign: '分配',
  auth: '授权',
  bind: '绑定',
  unbind: '解绑',
  freeze: '冻结',
  unfreeze: '解冻',
  lock: '锁定',
  unlock: '解锁',
  reset: '重置',
  resetPwd: '重置密码',
  adjust: '调整余额',
  grant: '发放',
  issue: '发放',
  send: '发送',
  recall: '撤回',
  release: '释放',
  complete: '完成',
  transfer: '转账',
  recharge: '补充额度',
  activityCash: '发活动彩金',
  remark: '备注',
  sync: '同步',
  preview: '预览',
  code: '生成代码',
  forceLogout: '强制退出',
  googleAuth: '谷歌验证',
  save: '保存',
  publish: '发布',
  apply: '申请',
  sort: '调整排序',
  fulltext: '实名信息全明文',
  masked: '实名信息半脱敏',
  'batch-grant': '批量手动派彩',
  'manual-unlock': '人工解锁',
  'refresh-turnover': '刷新流水',
  'batch-start-maintenance': '批量开启维护',
  'batch-stop-maintenance': '批量停止维护',
  'start-maintenance': '开启维护',
  'stop-maintenance': '停止维护',
  'create-whitelist': '新增系统维护白名单用户',
  'authorize-site': '授权站点',
  'revoke-site': '取消授权',
  'batch-import': '批量导入',
  'download-template': '下载模板',
  'grant-bonus': '发放红利',
  generate: '生成',
  records: '查看记录',
  'mark-normal': '标记正常',
  'no-grant': '不发放',
  'modify-grant': '修改发放'
}

const buttonPatterns = [
  ['批量手动派彩', 'batch-grant'],
  ['人工解锁', 'manual-unlock'],
  ['刷新流水', 'refresh-turnover'],
  ['批量开启维护', 'batch-start-maintenance'],
  ['批量停止维护', 'batch-stop-maintenance'],
  ['开启维护', 'start-maintenance'],
  ['停止维护', 'stop-maintenance'],
  ['新增系统维护白名单用户', 'create-whitelist'],
  ['授权站点', 'authorize-site'],
  ['取消授权', 'revoke-site'],
  ['批量导入', 'batch-import'],
  ['下载模板', 'download-template'],
  ['发放红利', 'grant-bonus'],
  ['生成掉签节点', 'generate'],
  ['掉签记录', 'records'],
  ['标记正常', 'mark-normal'],
  ['不发放', 'no-grant'],
  ['修改发放', 'modify-grant'],
  ['查看详情', 'detail'],
  ['新增活动', 'create'],
  ['新增', 'create'],
  ['编辑', 'edit'],
  ['修改', 'edit'],
  ['删除', 'delete'],
  ['启用', 'status'],
  ['禁用', 'status'],
  ['审核通过', 'approve'],
  ['通过', 'approve'],
  ['审核拒绝', 'reject'],
  ['拒绝', 'reject'],
  ['重新审核', 'review'],
  ['导入', 'import'],
  ['导出', 'export'],
  ['上传', 'upload'],
  ['下载', 'download'],
  ['配置', 'config'],
  ['分配', 'assign'],
  ['绑定', 'bind'],
  ['解绑', 'unbind'],
  ['冻结', 'freeze'],
  ['解冻', 'unfreeze'],
  ['锁定', 'lock'],
  ['解锁', 'unlock'],
  ['重置密码', 'resetPwd'],
  ['调整余额', 'adjust'],
  ['手动派彩', 'grant'],
  ['发放', 'grant'],
  ['撤回', 'recall'],
  ['补发', 'issue'],
  ['发布', 'publish'],
  ['同步', 'sync']
]

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return walk(entryPath)
    }
    return /\.(vue|html|js)$/.test(entry.name) ? [entryPath] : []
  })
}

function componentKey(filePath) {
  let relative = path.relative(viewsRoot, filePath).replace(/\\/g, '/')
  relative = relative
    .replace(/\.template\.html$/, '')
    .replace(/\.script\.js$/, '')
    .replace(/\.(vue|html|js)$/, '')
  const componentsIndex = relative.indexOf('/components/')
  if (componentsIndex >= 0) {
    relative = `${relative.slice(0, componentsIndex)}/index`
  }
  return relative
}

function actionFromPermission(permission) {
  const raw = permission.split(':').pop()
  const normalized = Object.prototype.hasOwnProperty.call(actionLabels, raw)
    ? raw
    : raw.replace(/^get/, 'view').replace(/^list.*/, 'list')
  return {
    action: normalized,
    label: actionLabels[normalized] || raw
  }
}

function extractDirectivePermissions(source) {
  const permissions = []
  const directivePattern = /v-hasPermi\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  for (const directiveMatch of source.matchAll(directivePattern)) {
    const expression = directiveMatch[1] || directiveMatch[2] || ''
    for (const permissionMatch of expression.matchAll(/['"]([A-Za-z][\w-]*(?::[\w-]+){2,})['"]/g)) {
      if (!permissionMatch[1].includes('*')) {
        permissions.push(permissionMatch[1])
      }
    }
  }
  return permissions
}

const components = {}

walk(viewsRoot).forEach(filePath => {
  const source = fs.readFileSync(filePath, 'utf8')
  const key = componentKey(filePath)
  const permissions = extractDirectivePermissions(source)
  const operations = permissions.map(permission => ({
    ...actionFromPermission(permission),
    legacy: permission
  }))

  buttonPatterns.forEach(([text, action]) => {
    const buttonPattern = new RegExp(`<el-(?:button|dropdown-item)[^>]*>[\\s\\S]{0,120}${text}[\\s\\S]{0,40}<\\/el-(?:button|dropdown-item)>`)
    if (buttonPattern.test(source)) {
      operations.push({
        action,
        label: actionLabels[action],
        legacy: ''
      })
    }
  })

  if (!operations.length) {
    return
  }

  components[key] = components[key] || []
  operations.forEach(operation => {
    const signature = `${operation.action}|${operation.legacy}`
    if (!components[key].some(item => `${item.action}|${item.legacy}` === signature)) {
      components[key].push(operation)
    }
  })
})

Object.keys(components).forEach(key => {
  components[key].sort((left, right) => (
    left.label.localeCompare(right.label, 'zh-CN') ||
    left.legacy.localeCompare(right.legacy)
  ))
})

const output = `// This file is generated by scripts/generate-role-permission-actions.js.\n` +
  `// It records actual page operations discovered from existing components.\n` +
  `export const generatedComponentActions = ${JSON.stringify(components, null, 2)}\n`

fs.writeFileSync(outputPath, output)
console.log(`Generated ${Object.keys(components).length} component permission mappings.`)
