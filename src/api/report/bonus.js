import request from '@/utils/request'

const BONUS_TYPE_OPTIONS = [
  { dictLabel: '活动礼金', dictValue: '0' },
  { dictLabel: '晋升礼金', dictValue: '1' },
  { dictLabel: '周礼金', dictValue: '2' },
  { dictLabel: '月礼金', dictValue: '3' },
  { dictLabel: '活动彩金', dictValue: '4' },
  { dictLabel: '首充彩金', dictValue: '5' },
  { dictLabel: '推广彩金', dictValue: '6' },
  { dictLabel: '平台彩金', dictValue: '7' },
  { dictLabel: '代理线下首存', dictValue: '8' }
]

const SITES = [
  { code: '2222', name: '旺财体育' },
  { code: '333333', name: '财神体育' },
  { code: '8888', name: 'DW体育' },
  { code: '6666', name: '星河体育' }
]

const AGENTS = ['dw666s01', 'dailiwc001', 'agent2026', 'charles-agent', 'clark-team']
const STATUS_VALUES = ['0', '1', '2']

function pad(value) {
  return String(value).padStart(2, '0')
}

function toTimestamp(value, endOfDay = false) {
  if (!value) {
    return null
  }
  const normalized = String(value).length <= 10
    ? `${value} ${endOfDay ? '23:59:59' : '00:00:00'}`
    : value
  const timestamp = new Date(normalized.replace(/-/g, '/')).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

function inRange(value, begin, end) {
  if (!begin && !end) {
    return true
  }
  const current = toTimestamp(value)
  const start = toTimestamp(begin)
  const finish = toTimestamp(end, true)
  if (start && current < start) {
    return false
  }
  if (finish && current > finish) {
    return false
  }
  return true
}

function buildMockBonusRows() {
  return Array.from({ length: 200 }, (_, index) => {
    const seq = index + 1
    const site = SITES[index % SITES.length]
    const type = BONUS_TYPE_OPTIONS[index % BONUS_TYPE_OPTIONS.length]
    const status = STATUS_VALUES[index % STATUS_VALUES.length]
    const day = pad((index % 28) + 1)
    const hour = pad(8 + (index % 12))
    const minute = pad((index * 7) % 60)
    return {
      id: seq,
      statDate: `2026-07-${day}`,
      siteCode: site.code,
      siteName: site.name,
      agentCode: AGENTS[index % AGENTS.length],
      userName: `member${pad(seq)}`,
      memberUserId: 100000 + seq,
      vipLevel: index % 11,
      bonusType: String(type.dictValue),
      bonusAmount: Number((18 + (index % 40) * 12.5 + (index % 3) * 0.88).toFixed(2)),
      status,
      receiveTime: status === '0' ? '' : `2026-07-${day} ${hour}:${minute}:00`
    }
  })
}

const MOCK_BONUS_ROWS = buildMockBonusRows()

function filterMockRows(query = {}) {
  return MOCK_BONUS_ROWS.filter((row) => {
    if (query.siteCode && String(row.siteCode) !== String(query.siteCode)) {
      return false
    }
    if (query.bonusType !== undefined && query.bonusType !== '' && String(row.bonusType) !== String(query.bonusType)) {
      return false
    }
    if (query.status !== undefined && query.status !== '' && String(row.status) !== String(query.status)) {
      return false
    }
    if (query.keyword && !String(row.userName).toLowerCase().includes(String(query.keyword).toLowerCase())) {
      return false
    }
    if (query.agentKeyword && !String(row.agentCode).toLowerCase().includes(String(query.agentKeyword).toLowerCase())) {
      return false
    }
    if (!inRange(row.statDate, query.beginStatDate, query.endStatDate)) {
      return false
    }
    if (row.receiveTime && !inRange(row.receiveTime, query.beginReceiveTime, query.endReceiveTime)) {
      return false
    }
    return true
  })
}

function sumAmount(rows) {
  return Number(rows.reduce((total, row) => total + Number(row.bonusAmount || 0), 0).toFixed(2))
}

// 查询礼金统计报表列表
export function listBonusReport(query) {
  const filteredRows = filterMockRows(query)
  const pageNum = Number(query.pageNum || 1)
  const pageSize = Number(query.pageSize || 10)
  const start = (pageNum - 1) * pageSize
  return Promise.resolve({
    code: 200,
    rows: filteredRows.slice(start, start + pageSize),
    total: filteredRows.length
  })
}

// 查询礼金统计汇总
export function getBonusReportSummary(query) {
  const filteredRows = filterMockRows(query)
  const rowsByType = (types) => filteredRows.filter((row) => types.includes(String(row.bonusType)))
  return Promise.resolve({
    code: 200,
    data: {
      totalBonusAmount: sumAmount(filteredRows),
      activityBonusAmount: sumAmount(rowsByType(['0', '4', '5', '6', '7', '8'])),
      upgradeBonusAmount: sumAmount(rowsByType(['1'])),
      weeklyBonusAmount: sumAmount(rowsByType(['2'])),
      monthlyBonusAmount: sumAmount(rowsByType(['3'])),
      expiredBonusAmount: sumAmount(filteredRows.filter((row) => String(row.status) === '2'))
    }
  })
}

// 导出礼金统计报表
export function exportBonusReport(query) {
  return request({
    url: '/vip/bonus/export',
    method: 'post',
    params: query
  })
}
