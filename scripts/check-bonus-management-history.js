const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../src/views/funds/bonusManagement/index.vue')
const source = fs.readFileSync(file, 'utf8')

const requiredText = [
  'historyFilters',
  'filteredHistoryRows',
  '订单号',
  '账号类型',
  '上级代理',
  '场馆名称',
  '领取时间',
  'filterable',
  'historyFilters.account',
  'historyFilters.accountType',
  'historyFilters.parentAgent',
  'historyFilters.venueName',
  'historyFilters.claimTime',
  "const HISTORY_VENUE_OPTIONS = ['熊猫体育', 'IM体育', '旺财体育', '旺财真人']",
  "venueName: walletType === 'venue' ? HISTORY_VENUE_OPTIONS",
  'prop="account" label="账号"',
  'prop="accountTypeName" label="账号类型"',
  'prop="parentAgent" label="上级代理"',
  'prop="venueName" label="场馆名称"',
  'prop="claimTime" label="领取时间"',
  'prop="siteName" label="站点" width="110" fixed="left"',
  'prop="account" label="账号" width="140" fixed="left"',
  'prop="accountTypeName" label="账号类型" width="95" fixed="left"',
  "{ value: 'vipGift', label: 'VIP礼金'",
  "{ value: 'agentBonus', label: '代理红利'",
  'const HISTORY_BONUS_INFO_OPTIONS = {',
  "vipGift: ['周礼金', '月礼金', '生日礼金'",
  'bonusInfo: bonusInfoOptions[bonusInfoIndex]',
  ':summary-method="getHistorySummaries"',
  'show-summary',
  "row.turnoverRequired ? row.turnoverMultiple : 0",
  'label="红利金额（元）"',
  'getHistorySummaries({ columns })',
  "sums[0] = '总计'",
  'this.filteredHistoryRows.reduce((total, row) => total + Number(row.amount || 0), 0)',
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

const forbiddenHistoryText = [
  'v-model="historyFilters.memberAccount"',
  'v-model="historyFilters.agentAccount"',
  'v-model="historyFilters.walletName"',
  'prop="memberAccount" label="会员账号"',
  'prop="agentAccount" label="代理账号"',
  'prop="walletName" label="钱包名称"',
  'prop="orderNo" label="订单号" width="210" fixed="left"',
  "`${row.turnoverMultiple}倍`",
  "¥{{ formatAmount(row.amount) }}",
  'label="红利金额" width="120"'
]

const retainedOldFields = forbiddenHistoryText.filter(text => source.includes(text))

if (retainedOldFields.length) {
  console.error(`历史记录页面仍保留旧字段：${retainedOldFields.join('、')}`)
  process.exit(1)
}

const columnMarkers = [
  'prop="siteName" label="站点" width="110" fixed="left"',
  'prop="account" label="账号" width="140" fixed="left"',
  'prop="accountTypeName" label="账号类型" width="95" fixed="left"',
  'prop="orderNo" label="订单号" width="210"',
  'prop="parentAgent" label="上级代理" width="130"'
]
const columnPositions = columnMarkers.map(marker => source.indexOf(marker))
const columnsInOrder = columnPositions.every((position, index) => (
  position >= 0 && (index === 0 || position > columnPositions[index - 1])
))

if (!columnsInOrder) {
  console.error('历史记录列顺序必须为：站点、账号、账号类型、订单号、上级代理')
  process.exit(1)
}

const bonusTypeBlock = source.slice(
  source.indexOf('const HISTORY_BONUS_TYPES = ['),
  source.indexOf('const HISTORY_VENUE_OPTIONS')
)
const requiredBonusTypes = ['推广彩金', '活动彩金', '平台彩金', '代理线下首存', 'VIP礼金', '代理红利']
const missingBonusTypes = requiredBonusTypes.filter(label => !bonusTypeBlock.includes(`label: '${label}'`))

if (missingBonusTypes.length) {
  console.error(`历史记录红利类型缺少：${missingBonusTypes.join('、')}`)
  process.exit(1)
}

console.log('红利管理历史记录检查通过')
