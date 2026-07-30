const BONUS_TYPE_OPTIONS = [
  { label: '推广彩金', value: 11 },
  { label: '活动彩金', value: 31 },
  { label: '平台彩金', value: 41 },
  { label: '代理线下首存', value: 51 }
]

const OFFLINE_FIRST_DEPOSIT_TOP_TEN = new Set([1, 3, 6, 9])
const SITE_OPTIONS = [
  { siteCode: 'SITE001', siteName: '旺财体育' },
  { siteCode: 'SITE002', siteName: '财神体育' },
  { siteCode: 'SITE003', siteName: 'DW体育' },
  { siteCode: 'SITE004', siteName: '星河体育' }
]
const SENDERS = [
  { senderType: 'HEADQUARTERS', senderTypeName: '总站', senderDisplayName: '总站运营中心' },
  { senderType: 'SITE_ADMIN', senderTypeName: '站点管理员', senderDisplayName: '站点财务管理员' },
  { senderType: 'AGENT', senderTypeName: '代理', senderDisplayName: '代理运营账号' }
]

function pad(value, length = 2) {
  return String(value).padStart(length, '0')
}

function bonusTypeAt(index) {
  if (index <= 10 && OFFLINE_FIRST_DEPOSIT_TOP_TEN.has(index)) {
    return BONUS_TYPE_OPTIONS[3]
  }
  const pool = index <= 10 ? BONUS_TYPE_OPTIONS.slice(0, 3) : BONUS_TYPE_OPTIONS
  return pool[(index * 7 + 3) % pool.length]
}

function dateText(index, hourOffset = 0) {
  const day = ((index - 1) % 28) + 1
  const hour = (8 + index + hourOffset) % 24
  const minute = (index * 7) % 60
  return `2026-07-${pad(day)} ${pad(hour)}:${pad(minute)}:00`
}

const ACTIVITY_CASH_ROWS = Array.from({ length: 200 }, (_, offset) => {
  const index = offset + 1
  const bonusType = bonusTypeAt(index)
  const site = SITE_OPTIONS[offset % SITE_OPTIONS.length]
  const sender = SENDERS[offset % SENDERS.length]
  const claimed = index % 3 !== 0
  return {
    id: 90000 + index,
    activityCashNo: `ACB202607${pad(index, 6)}`,
    siteCode: site.siteCode,
    siteName: site.siteName,
    bonusType: bonusType.value,
    bonusTypeName: bonusType.label,
    targetMemberName: `member${pad(index, 4)}`,
    bonusAmount: 50 + (index % 20) * 25,
    turnoverMultiple: index % 6,
    claimStatus: claimed ? 'CLAIMED' : 'UNCLAIMED',
    claimStatusName: claimed ? '已领取' : '未领取',
    createTime: dateText(index),
    availableTime: dateText(index, 1),
    receiveDeadline: dateText(index, 6),
    remark: `${bonusType.label}发放演示数据`,
    ...sender
  }
})

function includesKeyword(row, keyword) {
  if (!keyword) return true
  const target = [
    row.activityCashNo,
    row.targetMemberName,
    row.siteName,
    row.siteCode,
    row.senderDisplayName
  ].join(' ').toLowerCase()
  return target.includes(String(keyword).toLowerCase())
}

function filterActivityCashRows(query = {}) {
  return ACTIVITY_CASH_ROWS.filter(row => {
    if (!includesKeyword(row, query.keyword)) return false
    if (query.siteCode && row.siteCode !== query.siteCode) return false
    if (query.senderType && row.senderType !== query.senderType) return false
    if (query.claimStatus && row.claimStatus !== query.claimStatus) return false
    if (query.bonusType !== '' && query.bonusType !== undefined && Number(row.bonusType) !== Number(query.bonusType)) return false
    if (query.beginTime && row.createTime < query.beginTime) return false
    if (query.endTime && row.createTime > query.endTime) return false
    return true
  })
}

function listActivityCashMock(query = {}) {
  const filtered = filterActivityCashRows(query)
  const pageNum = Number(query.pageNum || 1)
  const pageSize = Number(query.pageSize || 10)
  const start = (pageNum - 1) * pageSize
  return {
    rows: filtered.slice(start, start + pageSize),
    total: filtered.length
  }
}

function summarizeActivityCashMock(query = {}) {
  const filtered = filterActivityCashRows(query)
  const groups = {
    HEADQUARTERS: { packetCount: 0, totalAmount: 0 },
    SITE_ADMIN: { packetCount: 0, totalAmount: 0 },
    AGENT: { packetCount: 0, totalAmount: 0 }
  }
  filtered.forEach(row => {
    groups[row.senderType].packetCount += 1
    groups[row.senderType].totalAmount += row.bonusAmount
  })
  return {
    headquarters: groups.HEADQUARTERS,
    siteAdmin: groups.SITE_ADMIN,
    agent: groups.AGENT
  }
}

module.exports = {
  BONUS_TYPE_OPTIONS,
  ACTIVITY_CASH_ROWS,
  listActivityCashMock,
  summarizeActivityCashMock
}
