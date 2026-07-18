const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/views/dashboard/AdminOperationsDashboard.vue'),
  'utf8'
)

const tooltipText = '统计时间范围内，登录或产生充值、提款、投注等有效行为的去重会员人数。'
const avgDepositTooltipText = '人均充值=单个站点的充值金额/充值人数'
const activeFieldPattern = /key: 'activeUsers', label: '活跃人数', tooltip: ACTIVE_USERS_TOOLTIP/g
const activeFields = source.match(activeFieldPattern) || []

if (!source.includes(`const ACTIVE_USERS_TOOLTIP = '${tooltipText}'`)) {
  throw new Error('缺少活跃人数统一气泡提示文案')
}

if (activeFields.length !== 2) {
  throw new Error(`活跃人数气泡提示应配置2处，当前为${activeFields.length}处`)
}

if (!source.includes(`const AVG_DEPOSIT_TOOLTIP = '${avgDepositTooltipText}'`)) {
  throw new Error('缺少人均充值气泡提示文案')
}

if (!source.includes("{ key: 'avgDeposit', label: '人均充值', tooltip: AVG_DEPOSIT_TOOLTIP }")) {
  throw new Error('今日充值排行的人均充值未配置气泡提示')
}

if (!source.includes("{ key: 'activeMemberCount', label: '活跃会员人数', tooltip: ACTIVE_USERS_TOOLTIP }")) {
  throw new Error('代理发展排行榜缺少活跃会员人数气泡提示')
}

if (!/todayNew:[\s\S]*activeMemberCount:[\s\S]*historyUnsettledCommission:/.test(source)) {
  throw new Error('代理发展排行榜演示数据缺少活跃会员人数或字段位置不正确')
}

console.log('operations dashboard active users tooltips check passed')
