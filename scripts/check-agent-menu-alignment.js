const fs = require('fs')
const path = require('path')

const menuSource = fs.readFileSync(
  path.resolve(__dirname, '../src/utils/testEnvironmentMenu.js'),
  'utf8'
)
const routerSource = fs.readFileSync(
  path.resolve(__dirname, '../src/router/index.js'),
  'utf8'
)

const expectedMenuItems = [
  ['index', '代理管理'],
  ['comm/index', '返佣方案'],
  ['comm/grant', '代理佣金结算'],
  ['comm/record', '佣金记录'],
  ['reversal/stats', '冲正统计报表'],
  ['reversal/repayment', '冲正回款报表'],
  ['negativeProfitSettlement', '负盈利代理佣金结算'],
  ['negativeProfitReport', '负盈利代理佣金报表'],
  ['teamManagement', '团队代理管理'],
  ['earningBoard', '代理收益看板'],
  ['settlementCycle', '结算周期设置'],
  ['relationChangeRecord', '修改代理关系记录']
]

expectedMenuItems.forEach(([routePath, title]) => {
  if (!menuSource.includes(`${routePath}: '${title}'`) && !menuSource.includes(`'${routePath}': '${title}'`)) {
    throw new Error(`代理菜单缺少映射: ${routePath} -> ${title}`)
  }
})

if (!menuSource.includes("new Set(['advanceRecords'])")) {
  throw new Error('代理预支记录未设置为隐藏')
}

const placeholderPaths = [
  'negativeProfitSettlement',
  'negativeProfitReport',
  'teamManagement',
  'relationChangeRecord'
]

placeholderPaths.forEach(routePath => {
  if (!routerSource.includes(`path: '${routePath}'`)) {
    throw new Error(`缺少代理占位路由: ${routePath}`)
  }
})

console.log('代理管理菜单对齐检查通过')
