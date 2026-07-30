const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../src/views/funds/bonusManagement/index.vue')
const source = fs.readFileSync(file, 'utf8')

const requiredText = [
  'historyFilters',
  'filteredHistoryRows',
  '订单号',
  '代理账号',
  '钱包名称',
  '红利标题',
  '会员标签',
  '派发时间',
  '申请备注',
  '流水要求',
  '过期时间',
  'handleHistoryQuery',
  'handleHistoryReset',
  'handleHistoryExport'
]

const missing = requiredText.filter(text => !source.includes(text))

if (missing.length) {
  console.error(`历史记录页面缺少：${missing.join('、')}`)
  process.exit(1)
}

console.log('红利管理历史记录检查通过')
