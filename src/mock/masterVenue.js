const STORAGE_PREFIX = 'master-admin-prototype:venue:'

const sites = [
  { code: '2222', name: '演示总站' },
  { code: 'SITE001', name: '旺财总站' },
  { code: 'SITE002', name: '星河体育' },
  { code: 'SITE003', name: '蓝海娱乐' }
]

const venues = [
  { venueId: 1, venueCode: 'SABA', venueName: '沙巴体育', venueSort: 1 },
  { venueId: 2, venueCode: 'AG', venueName: 'AG真人', venueSort: 2 },
  { venueId: 3, venueCode: 'PG', venueName: 'PG电子', venueSort: 3 },
  { venueId: 4, venueCode: 'JILI', venueName: 'JILI电子', venueSort: 4 },
  { venueId: 5, venueCode: 'CQ9', venueName: 'CQ9电子', venueSort: 5 }
]

const agents = [
  { agentId: 10001, agentName: '华东总代', parentAgentName: '平台直属', siteCode: '2222', siteName: '演示总站', level: '总代', rate: '35%' },
  { agentId: 10002, agentName: '旺财代理A', parentAgentName: '华东总代', siteCode: 'SITE001', siteName: '旺财总站', level: '一级代理', rate: '28%' },
  { agentId: 10003, agentName: '星河代理B', parentAgentName: '华东总代', siteCode: 'SITE002', siteName: '星河体育', level: '一级代理', rate: '26%' },
  { agentId: 10004, agentName: '蓝海代理C', parentAgentName: '旺财代理A', siteCode: 'SITE003', siteName: '蓝海娱乐', level: '二级代理', rate: '18%' }
]

function storageAvailable() {
  return typeof window !== 'undefined' && window.localStorage
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getStored(key, fallback) {
  if (!storageAvailable()) {
    return clone(fallback)
  }
  const fullKey = STORAGE_PREFIX + key
  const cached = window.localStorage.getItem(fullKey)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch (error) {
      window.localStorage.removeItem(fullKey)
    }
  }
  const value = clone(fallback)
  window.localStorage.setItem(fullKey, JSON.stringify(value))
  return value
}

function setStored(key, value) {
  if (storageAvailable()) {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  }
}

function normalizeMoney(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0
}

function paginate(rows, query = {}) {
  const pageNum = Number(query.pageNum || 1)
  const pageSize = Number(query.pageSize || 10)
  const start = (pageNum - 1) * pageSize
  return {
    rows: rows.slice(start, start + pageSize),
    total: rows.length
  }
}

function monthRange(startMonth, endMonth) {
  const start = startMonth || '2026-06'
  const end = endMonth || start
  const months = []
  const cursor = new Date(`${start}-01T00:00:00`)
  const last = new Date(`${end}-01T00:00:00`)
  while (cursor <= last && months.length < 12) {
    const month = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    months.push(month)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months.length ? months : [start]
}

function defaultFeeConfig(siteCode) {
  const base = siteCode === 'SITE002' ? 0.35 : 0.28
  const configured = venues.slice(0, 3).map((venue, index) => ({
    ...venue,
    ranges: [
      { id: `${siteCode}-${venue.venueCode}-1`, startAmount: 0, endAmount: 50000, feeRate: normalizeMoney(base + index * 0.08), sortOrder: 1 },
      { id: `${siteCode}-${venue.venueCode}-2`, startAmount: 50001, endAmount: 200000, feeRate: normalizeMoney(base + index * 0.1 + 0.12), sortOrder: 2 },
      { id: `${siteCode}-${venue.venueCode}-3`, startAmount: 200001, endAmount: null, feeRate: normalizeMoney(base + index * 0.12 + 0.2), sortOrder: 3 }
    ]
  }))
  return {
    venueItems: configured,
    availableVenues: venues.filter(venue => !configured.some(item => item.venueId === venue.venueId))
  }
}

function buildVenueFeeItem(month, venue, monthIndex, venueIndex) {
  const seed = (monthIndex + 1) * 26000 + (venueIndex + 1) * 11800
  const selfFee = normalizeMoney(seed * (0.018 + venueIndex * 0.002))
  const overrideKey = `${month}|${venue.venueCode}`
  const overrides = getStored('officialFeeOverrides', {})
  const officialFee = overrides[overrideKey] != null
    ? Number(overrides[overrideKey])
    : normalizeMoney(selfFee * (0.86 + venueIndex * 0.03))
  return {
    venueCode: venue.venueCode,
    venueName: venue.venueName,
    monthlyWinLoss: normalizeMoney(seed),
    feeRate: normalizeMoney(1.8 + venueIndex * 0.2),
    selfFee,
    officialFee,
    diffFee: normalizeMoney(selfFee - officialFee)
  }
}

function buildSettlementRows() {
  return sites.slice(0, 3).map((site, index) => {
    const base = 180000 + index * 65000
    const venueFee = normalizeMoney(base * (0.018 + index * 0.002))
    const operationExpense = normalizeMoney(base * 0.12)
    const mainGrossProfit = normalizeMoney(base - operationExpense - venueFee)
    const mainOperationExpense = normalizeMoney(operationExpense * 0.35)
    const mainNetProfit = normalizeMoney(mainGrossProfit - mainOperationExpense)
    const monthlyRentAmount = index === 0 ? 0 : 8000 + index * 2000
    return {
      id: 7000 + index,
      billNo: `VENUE-MONTH-${index + 1}`,
      statMonth: '2026-05',
      statMonthText: '2026-05',
      siteCode: site.code,
      siteName: site.name,
      totalWinLoss: base,
      operationExpense,
      mainVenueFee: venueFee,
      mainGrossProfit,
      mainOperationExpense,
      mainNetProfit,
      mainActualProfitAmount: normalizeMoney(mainNetProfit * 0.8),
      monthlyRentWaived: index === 0,
      monthlyRentAmount,
      settlementAmount: normalizeMoney(mainNetProfit - monthlyRentAmount),
      siteFundPoolBalance: 360000 + index * 80000,
      status: index === 2 ? 2 : 1,
      statusText: index === 2 ? '已结算' : '待结算'
    }
  })
}

export function isMasterVenueMockEnabled() {
  return process.env.VUE_APP_PROTOTYPE_MOCK !== 'false'
}

export function mockExportBlob(title = '三方场馆演示导出') {
  const content = `模块,说明\n${title},当前文件为本地演示数据\n`
  return new Blob([content], { type: 'text/csv;charset=utf-8' })
}

export function getMockVenueFeeConfig(siteCode = '2222') {
  return getStored(`feeConfig:${siteCode || '2222'}`, defaultFeeConfig(siteCode || '2222'))
}

export function updateMockVenueFeeConfig(siteCode = '2222', data = {}) {
  const next = {
    venueItems: data.venueItems || [],
    availableVenues: venues.filter(venue => !(data.venueItems || []).some(item => item.venueId === venue.venueId))
  }
  setStored(`feeConfig:${siteCode || '2222'}`, next)
  return next
}

export function listMockVenueFeeDetail(query = {}) {
  const rows = monthRange(query.startMonth, query.endMonth).map((month, monthIndex) => {
    const venueFeeMap = {}
    venues.slice(0, 4).forEach((venue, venueIndex) => {
      venueFeeMap[venue.venueCode] = buildVenueFeeItem(month, venue, monthIndex, venueIndex)
    })
    const values = Object.values(venueFeeMap)
    return {
      statMonth: month,
      supplierName: 'SmartAPI',
      venueFeeMap,
      totalSelfFee: normalizeMoney(values.reduce((sum, item) => sum + item.selfFee, 0)),
      totalOfficialFee: normalizeMoney(values.reduce((sum, item) => sum + item.officialFee, 0)),
      totalDiffFee: normalizeMoney(values.reduce((sum, item) => sum + item.diffFee, 0))
    }
  })
  return {
    venueColumns: venues.slice(0, 4).map(venue => ({ venueCode: venue.venueCode, venueName: venue.venueName })),
    rows
  }
}

export function saveMockVenueFeeOfficial(data = {}) {
  const overrides = getStored('officialFeeOverrides', {})
  const key = `${data.statMonth}|${data.venueCode}`
  overrides[key] = normalizeMoney(data.officialFee)
  setStored('officialFeeOverrides', overrides)
  const selfFee = normalizeMoney(data.selfFee || Number(data.officialFee || 0) * 1.12)
  return {
    venueCode: data.venueCode,
    venueName: data.venueName,
    selfFee,
    officialFee: overrides[key],
    diffFee: normalizeMoney(selfFee - overrides[key]),
    feeRate: data.feeRate || 2,
    monthlyWinLoss: data.monthlyWinLoss || normalizeMoney(selfFee / 0.02)
  }
}

export function listMockVenueAgentFeeDetail(query = {}) {
  let rows = agents.map((agent, index) => {
    const directShareFee = normalizeMoney(1688 + index * 620)
    const levelShareFee = normalizeMoney(688 + index * 280)
    return {
      periodRange: `${query.startDate || '2026-06-15'} 至 ${query.endDate || '2026-06-21'}`,
      siteName: agent.siteName,
      siteCode: agent.siteCode,
      parentAgentName: agent.parentAgentName,
      agentName: agent.agentName,
      agentId: agent.agentId,
      agentLevelLabel: agent.level,
      profitShareRateText: agent.rate,
      venueCount: 3 + (index % 2),
      directShareFee,
      levelShareFee,
      totalShareFee: normalizeMoney(directShareFee + levelShareFee),
      cycleNo: `2026W${25 + index}`
    }
  })
  if (query.siteCode) {
    rows = rows.filter(row => row.siteCode === query.siteCode)
  }
  if (query.agentName) {
    const keyword = String(query.agentName).toLowerCase()
    rows = rows.filter(row => String(row.agentName).toLowerCase().includes(keyword))
  }
  return paginate(rows, query)
}

export function getMockVenueAgentFeeDetail(query = {}) {
  const agentIndex = Math.max(0, agents.findIndex(agent => String(agent.agentId) === String(query.agentId)))
  const items = venues.slice(0, 4).map((venue, index) => {
    const winLossAmount = normalizeMoney(58000 + agentIndex * 18000 + index * 9200)
    const feeAmount = normalizeMoney(winLossAmount * (0.012 + index * 0.002))
    return {
      venueCode: venue.venueCode,
      venueName: venue.venueName,
      winLossAmount,
      feeRateText: `${normalizeMoney(1.2 + index * 0.2)}%`,
      feeAmount,
      directShareFee: normalizeMoney(feeAmount * 0.68),
      levelShareFee: normalizeMoney(feeAmount * 0.32)
    }
  })
  return {
    items,
    totalFeeAmount: normalizeMoney(items.reduce((sum, item) => sum + item.feeAmount, 0))
  }
}

export function listMockSiteMonthlySettlement(query = {}, settledOnly = false) {
  let rows = getStored('siteMonthlySettlementRows', buildSettlementRows())
    .filter(row => settledOnly ? row.status === 2 : row.status !== 2)
  if (query.siteCode) {
    rows = rows.filter(row => row.siteCode === query.siteCode)
  }
  if (query.siteName) {
    const keyword = String(query.siteName).toLowerCase()
    rows = rows.filter(row => String(row.siteName).toLowerCase().includes(keyword))
  }
  if (query.startMonth && query.endMonth) {
    rows = rows.filter(row => row.statMonth >= query.startMonth && row.statMonth <= query.endMonth)
  }
  return paginate(rows, query)
}

export function getMockSiteMonthlySettlementSummary(query = {}) {
  const list = listMockSiteMonthlySettlement({ ...query, pageNum: 1, pageSize: 1000 }, query.settledOnly === true || query.settledOnly === 'true').rows
  const summary = {}
  ;[
    'totalWinLoss',
    'operationExpense',
    'mainVenueFee',
    'mainGrossProfit',
    'mainOperationExpense',
    'mainNetProfit',
    'mainActualProfitAmount',
    'monthlyRentAmount',
    'settlementAmount',
    'siteFundPoolBalance'
  ].forEach(key => {
    summary[key] = normalizeMoney(list.reduce((sum, row) => sum + Number(row[key] || 0), 0))
  })
  return summary
}

export function settleMockSiteMonthlySettlement(id, type = 'auto') {
  const rows = getStored('siteMonthlySettlementRows', buildSettlementRows())
  const index = rows.findIndex(row => String(row.id) === String(id))
  if (index < 0) {
    return {}
  }
  if (type === 'auto' && Number(rows[index].siteFundPoolBalance || 0) < Number(rows[index].settlementAmount || 0)) {
    throw new Error('站点资金池余额不足，无法自动结算')
  }
  rows[index] = {
    ...rows[index],
    status: 2,
    statusText: type === 'manual' ? '人工已结算' : '已结算'
  }
  setStored('siteMonthlySettlementRows', rows)
  return rows[index]
}
