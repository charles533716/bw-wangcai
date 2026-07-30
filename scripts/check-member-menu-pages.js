const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8')

function includesAll(source, values, context) {
  values.forEach(value => {
    if (!source.includes(value)) throw new Error(`${context} 缺少：${value}`)
  })
}

const permission = read('src/store/modules/permission.js')
const router = read('src/router/index.js')
const listTemplate = read('src/views/member/list/index.template.html')
const listScript = read('src/views/member/list/index.script.js')
const sameIp = read('src/views/member/sameIp/index.vue')
const realName = read('src/views/member/realNameReview/index.vue')
const turnover = read('src/views/member/withdrawTurnover/index.vue')

includesAll(permission, [
  '会员列表', '同IP会员列表', 'VIP会员设置', '会员推广邀请奖励设置',
  '会员实名审核列表', '会员提现流水查询'
], '会员管理菜单')
if (!/path:\s*'realNameBinding'[\s\S]*?hidden:\s*true/.test(router)) {
  throw new Error('实名信息绑定记录应保留路由但隐藏菜单入口')
}

includesAll(listTemplate, [
  '所属站点', '用户ID', '用户名', '实名信息', '是否已实名',
  '上级代理', '状态', '谷歌验证', '风控标签'
], '会员列表筛选')
includesAll(listScript, ['length: 50', 'createDemoMemberRows'], '会员列表模拟数据')
includesAll(sameIp, ['length: 20', 'createSameIpSummaries', 'createSameIpMembers'], '同IP会员列表模拟数据')

includesAll(realName, [
  '会员实名审核列表', '总实名申请人数', '认证检测失败', '认证检测通过',
  '人工修正授权', '手动修改', '手动修正/修改实名记录', '确认保存修改'
], '会员实名审核列表')

includesAll(turnover, [
  '会员提现流水查询', '近3个月充值额度', '可提现余额',
  '锁定余额', '查看明细', '充值/彩金提现流水明细', '提现流水列表'
], '会员提现流水查询')

console.log('会员管理菜单及页面静态验收通过')
