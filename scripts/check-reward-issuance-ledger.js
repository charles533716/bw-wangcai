const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const menuSource = fs.readFileSync(path.join(rootDir, 'src/utils/testEnvironmentMenu.js'), 'utf8')
const pageSource = fs.readFileSync(path.join(rootDir, 'src/views/funds/redPacketRecord/index.vue'), 'utf8')
const interestComponentPath = path.join(rootDir, 'src/views/funds/redPacketRecord/YuebaoInterestLedger.vue')
const activityCashMockPath = path.join(rootDir, 'src/views/funds/redPacketRecord/activityCashMock.js')
const redPacketMockPath = path.join(rootDir, 'src/views/funds/redPacketRecord/redPacketMock.js')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

assert(menuSource.includes("redPacketRecord: '奖励发放记录'"), '财务菜单未更名为奖励发放记录')
assert(pageSource.includes("switchLedgerTab('yuebaoInterest')"), '缺少余额宝利息发放记录 Tab')
assert(pageSource.includes('<yuebao-interest-ledger'), '未接入余额宝利息发放记录页面')
assert(fs.existsSync(interestComponentPath), '缺少余额宝利息发放记录组件')
assert(fs.existsSync(activityCashMockPath), '缺少彩金发放记录 Mock 数据模块')
assert(fs.existsSync(redPacketMockPath), '缺少红包发放记录 Mock 数据模块')

const redPacketMock = fs.existsSync(redPacketMockPath)
  ? require(redPacketMockPath)
  : {}
const redPacketRows = redPacketMock.RED_PACKET_ROWS || []
assert(redPacketRows.length === 100, `红包发放记录应为 100 条，当前为 ${redPacketRows.length} 条`)
assert(
  new Set(redPacketRows.map(row => row.senderType)).size === 3,
  '红包发放记录应覆盖总站、站点管理员和代理三类发放主体'
)
assert(
  new Set(redPacketRows.map(row => row.claimStatus)).size === 2,
  '红包发放记录应同时包含已领取和未领取状态'
)

const activityCashMock = fs.existsSync(activityCashMockPath)
  ? require(activityCashMockPath)
  : {}

const bonusTypeNames = (activityCashMock.BONUS_TYPE_OPTIONS || []).map(item => item.label)
;['推广彩金', '活动彩金', '平台彩金', '代理线下首存'].forEach(name => {
  assert(bonusTypeNames.includes(name), `彩金类型缺少选项：${name}`)
})

const activityCashRows = activityCashMock.ACTIVITY_CASH_ROWS || []
assert(activityCashRows.length === 200, `彩金发放记录应为 200 条，当前为 ${activityCashRows.length} 条`)
assert(
  activityCashRows.slice(0, 10).filter(row => row.bonusTypeName === '代理线下首存').length === 4,
  '彩金发放记录前 10 条中应恰好有 4 条代理线下首存'
)
assert(
  new Set(activityCashRows.slice(10).map(row => row.bonusTypeName)).size === 4,
  '彩金发放记录第 11 至 200 条应随机覆盖四种彩金类型'
)

const interestSource = fs.existsSync(interestComponentPath)
  ? fs.readFileSync(interestComponentPath, 'utf8')
  : ''

;[
  '余额宝利息发放记录',
  '利息结算单号',
  '本金快照',
  '历史利息快照',
  '计息基数',
  '年化利率',
  '派发利息',
  '发放状态',
  '利息发放时间'
].forEach(text => assert(interestSource.includes(text), `余额宝记录缺少字段：${text}`))

console.log('奖励发放记录检查通过')
