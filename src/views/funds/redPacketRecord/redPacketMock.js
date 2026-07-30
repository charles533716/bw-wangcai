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

function dateText(index, hourOffset = 0) {
  const day = ((index - 1) % 28) + 1
  const hour = (9 + index + hourOffset) % 24
  const minute = (index * 11) % 60
  return `2026-07-${pad(day)} ${pad(hour)}:${pad(minute)}:00`
}

const RED_PACKET_ROWS = Array.from({ length: 100 }, (_, offset) => {
  const index = offset + 1
  const site = SITE_OPTIONS[offset % SITE_OPTIONS.length]
  const sender = SENDERS[offset % SENDERS.length]
  const claimed = index % 3 !== 0
  const scheduled = index % 10 === 0
  return {
    id: 80000 + index,
    redPacketNo: `RP202607${pad(index, 8)}`,
    siteCode: site.siteCode,
    siteName: site.siteName,
    targetMemberName: ['charles03', 'member001', 'testhd020', 'dlwc0011'][offset % 4],
    amount: Number((1 + (index * 9.37) % 1000).toFixed(2)),
    turnoverMultiple: index % 5,
    claimStatus: claimed ? 'CLAIMED' : 'UNCLAIMED',
    claimStatusName: claimed ? '已领取' : '未领取',
    status: scheduled ? 'SCHEDULED' : 'ACTIVE',
    createTime: dateText(index),
    availableTime: scheduled ? dateText(index, 3) : dateText(index, 1),
    expireTime: dateText(index, 8),
    remark: `${sender.senderTypeName}指定会员红包演示数据`,
    ...sender
  }
})

function includesKeyword(row, keyword) {
  if (!keyword) return true
  const target = [
    row.redPacketNo,
    row.targetMemberName,
    row.siteName,
    row.siteCode,
    row.senderDisplayName
  ].join(' ').toLowerCase()
  return target.includes(String(keyword).toLowerCase())
}

function filterRedPacketRows(query = {}) {
  return RED_PACKET_ROWS.filter(row => {
    if (!includesKeyword(row, query.keyword)) return false
    if (query.siteCode && row.siteCode !== query.siteCode) return false
    if (query.senderType && row.senderType !== query.senderType) return false
    if (query.claimStatus && row.claimStatus !== query.claimStatus) return false
    if (query.beginTime && row.createTime < query.beginTime) return false
    if (query.endTime && row.createTime > query.endTime) return false
    return true
  })
}

function listRedPacketMock(query = {}) {
  const filtered = filterRedPacketRows(query)
  const pageNum = Number(query.pageNum || 1)
  const pageSize = Number(query.pageSize || 10)
  const start = (pageNum - 1) * pageSize
  return {
    rows: filtered.slice(start, start + pageSize),
    total: filtered.length
  }
}

function summarizeRedPacketMock(query = {}) {
  const filtered = filterRedPacketRows(query)
  const groups = {
    HEADQUARTERS: { packetCount: 0, totalAmount: 0 },
    SITE_ADMIN: { packetCount: 0, totalAmount: 0 },
    AGENT: { packetCount: 0, totalAmount: 0 }
  }
  filtered.forEach(row => {
    groups[row.senderType].packetCount += 1
    groups[row.senderType].totalAmount += row.amount
  })
  return {
    headquarters: groups.HEADQUARTERS,
    siteAdmin: groups.SITE_ADMIN,
    agent: groups.AGENT
  }
}

function getRedPacketMock(id) {
  return RED_PACKET_ROWS.find(row => String(row.id) === String(id)) || {}
}

function listRedPacketClaimsMock(id) {
  const row = getRedPacketMock(id)
  if (!row.id || row.claimStatus !== 'CLAIMED') return []
  return [{
    id: `claim-${row.id}`,
    memberName: row.targetMemberName,
    amount: row.amount,
    status: 'CLAIMED',
    claimTime: dateText(row.id - 80000, 2)
  }]
}

module.exports = {
  RED_PACKET_ROWS,
  listRedPacketMock,
  summarizeRedPacketMock,
  getRedPacketMock,
  listRedPacketClaimsMock
}
