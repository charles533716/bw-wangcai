const assert = require('assert')
const fs = require('fs')
const path = require('path')

const routerPath = path.resolve(__dirname, '../src/router/index.js')
const viewPath = path.resolve(__dirname, '../src/views/member/realNameBinding/index.vue')
const routerSource = fs.readFileSync(routerPath, 'utf8')

assert(fs.existsSync(viewPath), '缺少实名信息绑定记录页面')

const viewSource = fs.readFileSync(viewPath, 'utf8')
assert(routerSource.includes("path: '/member'"), '缺少会员管理本地菜单扩展')
assert(routerSource.includes("path: 'realNameBinding'"), '缺少实名信息绑定记录路由')
assert(routerSource.includes("meta: { title: '实名信息绑定记录'"), '实名信息绑定记录菜单标题不正确')
assert(routerSource.includes("import('@/views/member/realNameBinding/index')"), '实名信息绑定记录路由未关联页面')

;['站点', '手机号', '银行卡号', '支付宝账号', '微信账号', '用户ID', '当前绑定状态', '首次绑定时间'].forEach(label => {
  assert(viewSource.includes(`label="${label}"`), `缺少查询条件：${label}`)
})

;['实名信息类型', '实名信息', '当前归属用户ID', '会员账号', '历史重复', '最近解绑时间'].forEach(label => {
  assert(viewSource.includes(`label="${label}"`), `缺少列表字段：${label}`)
})

assert(viewSource.includes('Array.from({ length: 300 }'), '必须生成300条假数据')
assert(viewSource.includes(':page-sizes="[20, 50, 100]"'), '分页必须支持20、50、100条')
assert(viewSource.includes("pageSize: 20"), '分页默认必须展示20条')
assert(viewSource.includes('历史绑定记录'), '缺少历史绑定记录弹窗')
assert(!viewSource.includes('删除绑定'), '查询页不应提供删除绑定能力')
assert(!viewSource.includes('<el-tooltip'), '眼睛图标不应展示气泡提示')

;[
  'revealedIdentityIds',
  'displayIdentityValue',
  'toggleIdentityVisibility',
  ':icon-class="isIdentityRevealed(scope.row) ? \'eye\' : \'eye-open\'"',
  '查看全明文',
  '恢复半脱敏'
].forEach(token => {
  assert(viewSource.includes(token), `缺少实名信息显隐交互：${token}`)
})

console.log('PASS 实名信息绑定记录页面检查通过')
