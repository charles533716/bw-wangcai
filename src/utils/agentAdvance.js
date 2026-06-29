import { DEFAULT_AGENT_CODE, DEFAULT_SITE_CODE } from '@/utils/prototypeBackend'
import { GLOBAL_SITE_CODE, GLOBAL_SITE_NAME, isGlobalSite } from '@/utils/settlementCycleScope'

const CONFIG_KEY = 'prototype:agentAdvance:configs'
const AGENT_CONFIG_KEY = 'prototype:agentAdvance:agentConfigs'
const RECORD_KEY = 'prototype:agentAdvance:records'
const HISTORY_KEY = 'prototype:agentAdvance:history'

export const CLAIM_STATUS_OPTIONS = [
  { label: '领取成功', value: 'SUCCESS' },
  { label: '不可领取', value: 'UNAVAILABLE' },
  { label: '已撤销', value: 'REVOKED' }
]

const siteOptions = [
  { siteCode: '2222', siteName: '演示总站' },
  { siteCode: 'SITE001', siteName: '旺财总站' },
  { siteCode: 'SITE002', siteName: '星河体育' },
  { siteCode: 'SITE003', siteName: '蓝海娱乐' }
]

const agentOptions = [
  { agentCode: '10001', agentName: '代理演示账号', siteCode: '2222', parentAgentCode: '-', parentAgentName: '无上级代理' },
  { agentCode: '10002', agentName: '华东总代', siteCode: '2222', parentAgentCode: '10001', parentAgentName: '代理演示账号' },
  { agentCode: '10005', agentName: '旺财代理', siteCode: 'SITE001', parentAgentCode: '10001', parentAgentName: '代理演示账号' },
  { agentCode: '10003', agentName: '星河代理', siteCode: 'SITE002', parentAgentCode: '10002', parentAgentName: '华东总代' },
  { agentCode: '10004', agentName: '蓝海代理', siteCode: 'SITE003', parentAgentCode: '10003', parentAgentName: '星河代理' }
]

const metricMap = {
  '10001': { directCommission: 6600, gapCommission: 2060.88, profitAmount: 42600, settled: true },
  '10002': { directCommission: 4200, gapCommission: 1288.5, profitAmount: 21800, settled: true },
  '10005': { directCommission: 3600, gapCommission: 760.5, profitAmount: 16880, settled: true },
  '10003': { directCommission: 2600, gapCommission: 900, profitAmount: 3600, settled: true },
  '10004': { directCommission: 3100, gapCommission: 620, profitAmount: 13600, settled: false }
}

export function getAdvanceSiteOptions() {
  return siteOptions.map(item => ({ ...item }))
}

export function getAdvanceAgentOptions() {
  return agentOptions.map(item => ({ ...item }))
}

export function getDefaultAdvanceConfig(siteCode = DEFAULT_SITE_CODE) {
  return {
    siteCode,
    siteName: isGlobalSite(siteCode) ? GLOBAL_SITE_NAME : findSiteName(siteCode),
    enabled: true,
    maxRatio: 50,
    includeGapCommission: true,
    maxClaimsPerCycle: 2,
    minProfitAmount: 5000,
    minRemainingCommission: 1000,
    updatedAt: nowText()
  }
}

export function getAdvanceConfig(siteCode = DEFAULT_SITE_CODE) {
  const configs = readJson(CONFIG_KEY, {})
  const globalConfig = {
    ...getDefaultAdvanceConfig(GLOBAL_SITE_CODE),
    ...(configs[GLOBAL_SITE_CODE] || {}),
    siteCode: GLOBAL_SITE_CODE,
    siteName: GLOBAL_SITE_NAME
  }
  if (isGlobalSite(siteCode)) {
    return normalizeAdvanceConfig(globalConfig)
  }
  return normalizeAdvanceConfig({
    ...globalConfig,
    siteCode,
    siteName: findSiteName(siteCode),
    ...(configs[siteCode] || {})
  })
}

export function saveAdvanceConfig(siteCode = DEFAULT_SITE_CODE, config = {}) {
  const configs = readJson(CONFIG_KEY, {})
  const next = {
    ...getDefaultAdvanceConfig(siteCode),
    ...config,
    siteCode,
    siteName: isGlobalSite(siteCode) ? GLOBAL_SITE_NAME : findSiteName(siteCode),
    includeGapCommission: true,
    updatedAt: nowText()
  }
  configs[siteCode] = next
  writeJson(CONFIG_KEY, configs)
  addAdvanceHistory(siteCode, isGlobalSite(siteCode) ? '全局佣金预支配置已更新' : '单站佣金预支配置已更新')
  return next
}

export function resetAdvanceConfig(siteCode = DEFAULT_SITE_CODE) {
  const configs = readJson(CONFIG_KEY, {})
  let next
  if (isGlobalSite(siteCode)) {
    next = getDefaultAdvanceConfig(GLOBAL_SITE_CODE)
    configs[GLOBAL_SITE_CODE] = next
  } else {
    delete configs[siteCode]
    next = getAdvanceConfig(siteCode)
  }
  writeJson(CONFIG_KEY, configs)
  addAdvanceHistory(siteCode, isGlobalSite(siteCode) ? '全局佣金预支配置已恢复系统默认' : '单站佣金预支配置已恢复继承全局')
  return next
}

export function hasAdvanceSiteConfig(siteCode = DEFAULT_SITE_CODE) {
  const configs = readJson(CONFIG_KEY, {})
  return Boolean(configs[siteCode]) && !isGlobalSite(siteCode)
}

export function listAdvanceSiteOverrides(siteOptions = []) {
  const configs = readJson(CONFIG_KEY, {})
  return Object.keys(configs)
    .filter(siteCode => !isGlobalSite(siteCode))
    .map(siteCode => {
      const site = siteOptions.find(item => item.siteCode === siteCode) || {}
      return {
        ...configs[siteCode],
        siteCode,
        siteName: configs[siteCode].siteName || site.siteName || findSiteName(siteCode)
      }
    })
}

export function getEffectiveAdvanceConfig(siteCode = DEFAULT_SITE_CODE, agentCode = DEFAULT_AGENT_CODE) {
  const siteConfig = getAdvanceConfig(siteCode)
  const agentConfig = getAdvanceAgentConfig(siteCode, agentCode)
  return agentConfig ? normalizeAdvanceConfig({ ...siteConfig, ...agentConfig, agentOverride: true }) : siteConfig
}

export function getAdvanceAgentConfig(siteCode = DEFAULT_SITE_CODE, agentCode = DEFAULT_AGENT_CODE) {
  return getAdvanceAgentConfigList(siteCode)
    .find(item => String(item.agentCode) === String(agentCode)) || null
}

export function getAdvanceAgentConfigList(siteCode = DEFAULT_SITE_CODE) {
  const rows = getAllAdvanceAgentConfigs()
  return rows.filter(item => !siteCode || item.siteCode === siteCode)
}

export function saveAdvanceAgentConfig(siteCode = DEFAULT_SITE_CODE, config = {}) {
  const agent = findAgent(config.agentCode, siteCode)
  const base = getAdvanceConfig(agent.siteCode)
  const rows = getAllAdvanceAgentConfigs()
  const oldRow = rows.find(item => item.siteCode === agent.siteCode && item.agentCode === agent.agentCode)
  const nextRow = {
    ...base,
    ...oldRow,
    ...config,
    id: oldRow ? oldRow.id : Date.now(),
    siteCode: agent.siteCode,
    siteName: agent.siteName,
    agentCode: agent.agentCode,
    agentName: agent.agentName,
    includeGapCommission: true,
    updatedAt: nowText()
  }
  const nextRows = oldRow
    ? rows.map(item => item.siteCode === agent.siteCode && item.agentCode === agent.agentCode ? nextRow : item)
    : [nextRow, ...rows]
  writeJson(AGENT_CONFIG_KEY, nextRows)
  addAdvanceHistory(agent.siteCode, `代理 ${agent.agentCode} 单独预支配置已${oldRow ? '更新' : '新增'}`)
  return nextRow
}

export function deleteAdvanceAgentConfig(siteCode = DEFAULT_SITE_CODE, agentCode = DEFAULT_AGENT_CODE) {
  const rows = getAllAdvanceAgentConfigs()
  const nextRows = rows.filter(item => !(item.siteCode === siteCode && String(item.agentCode) === String(agentCode)))
  writeJson(AGENT_CONFIG_KEY, nextRows)
  addAdvanceHistory(siteCode, `代理 ${agentCode} 单独预支配置已删除`)
  return nextRows
}

export function getAdvanceHistory(siteCode = DEFAULT_SITE_CODE) {
  return readJson(HISTORY_KEY, [])
    .filter(item => isGlobalSite(siteCode) ? item.siteCode === GLOBAL_SITE_CODE : item.siteCode === siteCode || item.siteCode === GLOBAL_SITE_CODE)
    .slice(0, 20)
}

export function addAdvanceHistory(siteCode, changeSummary) {
  const rows = readJson(HISTORY_KEY, [])
  rows.unshift({
    id: Date.now(),
    siteCode,
    changeTime: nowText(),
    changeSummary,
    operator: '总控演示管理员'
  })
  writeJson(HISTORY_KEY, rows.slice(0, 80))
}

export function getAdvanceSummary(siteCode = DEFAULT_SITE_CODE, agentCode = DEFAULT_AGENT_CODE) {
  const agent = findAgent(agentCode, siteCode)
  const config = getEffectiveAdvanceConfig(agent.siteCode, agent.agentCode)
  const metrics = buildMetrics(agent.agentCode)
  const records = getAdvanceRecords()
    .filter(item => item.siteCode === agent.siteCode && item.agentCode === agent.agentCode && item.period === metrics.period)
  const successRows = records.filter(item => item.status === 'SUCCESS')
  const claimedAmount = sum(successRows, 'claimAmount')
  const usedCount = successRows.length
  const baseAmount = config.includeGapCommission ? metrics.currentCommission : metrics.directCommission
  const ratioLimitAmount = roundMoney(baseAmount * Number(config.maxRatio || 0) / 100)
  const availableAmount = Math.max(0, roundMoney(ratioLimitAmount - claimedAmount))
  const remainingTimes = Math.max(0, Number(config.maxClaimsPerCycle || 0) - usedCount)
  const remainingCommission = roundMoney(metrics.currentCommission - claimedAmount)
  const blockedReason = getBlockedReason(config, metrics, claimedAmount, availableAmount, remainingTimes, remainingCommission)

  return {
    ...metrics,
    ...agent,
    config,
    claimedAmount,
    availableAmount,
    remainingTimes,
    remainingCommission,
    ratioLimitAmount,
    usedCount,
    canClaim: !blockedReason,
    blockedReason,
    commissionBalance: roundMoney(28880.66 + claimedAmount)
  }
}

export function claimAdvanceCommission(siteCode, agentCode, amount) {
  const summary = getAdvanceSummary(siteCode, agentCode)
  const claimAmount = roundMoney(Number(amount || 0))
  if (!summary.canClaim) {
    return { ok: false, message: summary.blockedReason }
  }
  if (!claimAmount || claimAmount <= 0) {
    return { ok: false, message: '请输入本次预支金额' }
  }
  if (claimAmount > summary.availableAmount) {
    return { ok: false, message: '本次预支金额不能超过可预支佣金' }
  }

  const nextClaimedAmount = roundMoney(summary.claimedAmount + claimAmount)
  const row = {
    id: Date.now(),
    siteCode: summary.siteCode,
    siteName: summary.siteName,
    agentCode: summary.agentCode,
    agentName: summary.agentName,
    period: summary.period,
    currentCommission: summary.currentCommission,
    availableAmount: summary.availableAmount,
    claimAmount,
    claimedAmount: nextClaimedAmount,
    remainingTimes: Math.max(0, summary.remainingTimes - 1),
    includeGapCommission: summary.config.includeGapCommission,
    status: 'SUCCESS',
    claimTime: nowText(),
    remark: '领取成功，已计入佣金余额演示记录',
    directCommission: summary.directCommission,
    gapCommission: summary.gapCommission,
    beforeAvailableAmount: summary.availableAmount,
    afterAvailableAmount: roundMoney(summary.availableAmount - claimAmount),
    ruleSnapshot: buildRuleText(summary.config)
  }
  const rows = getAdvanceRecords()
  rows.unshift(row)
  writeJson(RECORD_KEY, rows)
  return { ok: true, message: '预支佣金领取成功', row, summary: getAdvanceSummary(siteCode, agentCode) }
}

export function listAdvanceRecords(params = {}) {
  const pageNum = Number(params.pageNum || 1)
  const pageSize = Number(params.pageSize || 10)
  let rows = getAdvanceRecords()
  rows = rows.filter(item => matchScope(item, params))
  rows = rows.filter(item => matchFilters(item, params))
  const total = rows.length
  return {
    rows: rows.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    total,
    allRows: rows
  }
}

export function listAgentEarningRows(params = {}) {
  const claimRows = getAdvanceRecords().filter(item => matchEarningRecordFilters(item, params))
  const limitedAgentCodes = hasEarningRecordFilter(params)
    ? Array.from(new Set(claimRows.map(item => String(item.agentCode))))
    : null
  return agentOptions
    .filter(agent => matchEarningAgentFilters(agent, params, limitedAgentCodes))
    .map((agent, index) => buildAgentEarningRow(agent, index))
}

export function getAdvanceRecords() {
  const rows = readJson(RECORD_KEY, null)
  if (Array.isArray(rows)) {
    const coveredRows = ensureSeedCoverage(rows)
    if (coveredRows.length !== rows.length) {
      writeJson(RECORD_KEY, coveredRows)
    }
    return coveredRows
  }
  const seeded = buildSeedRecords()
  writeJson(RECORD_KEY, seeded)
  return seeded
}

export function getStatusText(status) {
  const matched = CLAIM_STATUS_OPTIONS.find(item => item.value === status)
  return matched ? matched.label : status || '-'
}

export function buildRuleText(config = {}) {
  return [
    `最高可预支${Number(config.maxRatio || 0)}%`,
    `每周期${Number(config.maxClaimsPerCycle || 0)}次`,
    `最低盈利${formatMoney(config.minProfitAmount)}`,
    `最低剩余佣金${formatMoney(config.minRemainingCommission)}`
  ].join('，')
}

export function formatMoney(value) {
  const num = Number(value || 0)
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildSeedRecords() {
  const currentAgent = buildBaseSummary('2222', '10001')
  const success = buildBaseSummary('2222', '10002')
  const unavailable = buildBaseSummary('SITE003', '10004')
  return [
    makeRecord(currentAgent, 1200, 'SUCCESS', '代理后台演示领取记录，可用于核对剩余次数', '2026-06-22 11:08:00'),
    makeRecord(success, 1800, 'SUCCESS', '领取成功，已计入佣金余额演示记录', '2026-06-22 10:18:00'),
    makeRecord(unavailable, 0, 'UNAVAILABLE', '未到周结算后，暂不可领取', '2026-06-22 09:20:00'),
    makeRecord({ ...success, agentCode: '10003', agentName: '星河代理', siteCode: 'SITE002', siteName: '星河体育' }, 500, 'REVOKED', '演示撤销记录，用于运营核对', '2026-06-21 16:40:00')
  ]
}

function ensureSeedCoverage(rows) {
  const seedRows = buildSeedRecords()
  const existingKeys = rows.map(seedKey)
  const missingRows = seedRows.filter(row => !existingKeys.includes(seedKey(row)))
  return missingRows.length ? [...missingRows, ...rows] : rows
}

function seedKey(row) {
  return [
    row.siteCode,
    row.agentCode,
    row.period,
    row.status,
    row.claimTime
  ].join('|')
}

function buildBaseSummary(siteCode, agentCode) {
  const agent = findAgent(agentCode, siteCode)
  const config = getEffectiveAdvanceConfig(agent.siteCode, agent.agentCode)
  const metrics = buildMetrics(agent.agentCode)
  const baseAmount = config.includeGapCommission ? metrics.currentCommission : metrics.directCommission
  return {
    ...agent,
    ...metrics,
    availableAmount: roundMoney(baseAmount * Number(config.maxRatio || 0) / 100),
    remainingTimes: Number(config.maxClaimsPerCycle || 0)
  }
}

function makeRecord(summary, claimAmount, status, remark, claimTime) {
  const currentCommission = summary.currentCommission || 5488.5
  return {
    id: Number(String(Date.now()).slice(-8)) + Math.floor(Math.random() * 1000),
    siteCode: summary.siteCode,
    siteName: summary.siteName,
    agentCode: summary.agentCode,
    agentName: summary.agentName,
    period: summary.period || '2026-06-16 ~ 2026-06-22',
    currentCommission,
    availableAmount: summary.availableAmount || 2744.25,
    claimAmount,
    claimedAmount: claimAmount,
    remainingTimes: Math.max(0, (summary.remainingTimes || 2) - (status === 'SUCCESS' ? 1 : 0)),
    includeGapCommission: true,
    status,
    claimTime,
    remark,
    directCommission: summary.directCommission || 4200,
    gapCommission: summary.gapCommission || 1288.5,
    beforeAvailableAmount: summary.availableAmount || 2744.25,
    afterAvailableAmount: Math.max(0, (summary.availableAmount || 2744.25) - claimAmount),
    ruleSnapshot: buildRuleText(getEffectiveAdvanceConfig(summary.siteCode, summary.agentCode))
  }
}

function getAllAdvanceAgentConfigs() {
  const rows = readJson(AGENT_CONFIG_KEY, null)
  if (Array.isArray(rows)) return rows
  const seeded = buildSeedAgentConfigs()
  writeJson(AGENT_CONFIG_KEY, seeded)
  return seeded
}

function buildSeedAgentConfigs() {
  return [
    makeAgentConfig('2222', '10002', {
      maxRatio: 70,
      maxClaimsPerCycle: 3,
      minProfitAmount: 8000,
      minRemainingCommission: 1500,
      remark: '重点代理演示配置'
    }),
    makeAgentConfig('SITE002', '10003', {
      maxRatio: 40,
      maxClaimsPerCycle: 1,
      minProfitAmount: 3000,
      minRemainingCommission: 800,
      remark: '站点专项代理演示配置'
    })
  ]
}

function makeAgentConfig(siteCode, agentCode, overrides = {}) {
  const agent = findAgent(agentCode, siteCode)
  return {
    ...getAdvanceConfig(agent.siteCode),
    ...overrides,
    id: Number(`${Date.now()}${agentCode}`.slice(-10)),
    siteCode: agent.siteCode,
    siteName: agent.siteName,
    agentCode: agent.agentCode,
    agentName: agent.agentName,
    updatedAt: nowText()
  }
}

function normalizeAdvanceConfig(config = {}) {
  return {
    ...config,
    includeGapCommission: true
  }
}

function buildMetrics(agentCode) {
  const item = metricMap[agentCode] || metricMap[DEFAULT_AGENT_CODE]
  const currentCommission = roundMoney(item.directCommission + item.gapCommission)
  return {
    period: '2026-06-16 ~ 2026-06-22',
    directCommission: item.directCommission,
    gapCommission: item.gapCommission,
    currentCommission,
    profitAmount: item.profitAmount,
    settled: item.settled
  }
}

function buildAgentEarningRow(agent, index) {
  const metrics = buildMetrics(agent.agentCode)
  const seed = Number(String(agent.agentCode).slice(-2)) || index + 1
  const multiplier = 1 + (seed % 5) * 0.18
  const totalRecharge = roundMoney((168000 + seed * 8600) * multiplier)
  const totalWithdraw = roundMoney((82000 + seed * 4200) * multiplier)
  const totalBet = roundMoney((888000 + seed * 31800) * multiplier)
  const validBet = roundMoney(totalBet * (0.86 + (seed % 3) * 0.03))
  const totalWinLoss = roundMoney(metrics.profitAmount * multiplier)
  const agentDebtAmount = seed % 4 === 0 ? 0 : roundMoney(metrics.currentCommission * (0.16 + (seed % 3) * 0.09))
  const unrecoveredDebtAmount = roundMoney(agentDebtAmount * (0.42 + (seed % 2) * 0.18))
  const vipBenefit = roundMoney(totalBet * 0.006)
  const activityBenefit = roundMoney(totalBet * 0.008)
  const memberPromotionCommission = roundMoney(totalBet * 0.003)
  const depositFee = roundMoney((totalRecharge + totalWithdraw) * 0.0018)
  const agentBase = Math.max(1, 3 + seed % 8)
  const memberBase = 180 + seed * 18
  return {
    id: agent.agentCode,
    siteCode: agent.siteCode,
    siteName: findSiteName(agent.siteCode),
    agentCode: agent.agentCode,
    agentName: agent.agentName,
    parentAgentCode: agent.parentAgentCode,
    parentAgentName: agent.parentAgentName,
    estimatedCommissionNetProfit: roundMoney(metrics.currentCommission),
    currentBalance: roundMoney(18880 + metrics.currentCommission * 1.4),
    totalPromotionCommission: roundMoney(metrics.currentCommission * (12 + seed % 4)),
    settledCommission: roundMoney(metrics.currentCommission * (8 + seed % 3)),
    totalRecharge,
    totalWithdraw,
    totalBet,
    validBet,
    totalWinLoss,
    agentDebtAmount,
    unrecoveredDebtAmount,
    vipBenefit,
    activityBenefit,
    memberPromotionCommission,
    depositFee,
    totalAgents: agentBase,
    newAgentsMonthly: seed % 4,
    activeAgents: Math.max(1, agentBase - 1),
    totalMembers: memberBase,
    newMembersMonthly: 18 + seed % 36,
    activeMembers: Math.round(memberBase * 0.46),
    paidMembers: Math.round(memberBase * 0.18),
    newPaidMembersMonthly: 6 + seed % 13,
    agentPromotedMembers: 8 + seed % 16,
    memberPromotedMembers: 5 + seed % 12,
    lostMembersMonthly: 3 + seed % 11
  }
}

function matchEarningAgentFilters(agent, params = {}, limitedAgentCodes = null) {
  const keyword = String(params.agentKeyword || '').trim().toLowerCase()
  if (params.scope === 'site' && agent.siteCode !== params.siteCode) return false
  if (params.scope === 'agent' && String(agent.agentCode) !== String(params.agentCode)) return false
  if (params.siteFilter && agent.siteCode !== params.siteFilter) return false
  if (keyword && !`${agent.agentCode} ${agent.agentName}`.toLowerCase().includes(keyword)) return false
  if (limitedAgentCodes && !limitedAgentCodes.includes(String(agent.agentCode))) return false
  return true
}

function matchEarningRecordFilters(row, params = {}) {
  const nextParams = { ...params, status: '' }
  return matchScope(row, nextParams) && matchFilters(row, nextParams)
}

function hasEarningRecordFilter(params = {}) {
  return Boolean(params.period || params.startTime || params.endTime)
}

function findSiteName(siteCode) {
  const site = siteOptions.find(item => item.siteCode === siteCode)
  return site ? site.siteName : siteCode || '-'
}

function getBlockedReason(config, metrics, claimedAmount, availableAmount, remainingTimes, remainingCommission) {
  if (!config.enabled) return '未开启佣金预支'
  if (!metrics.settled) return '未到周结算后'
  if (metrics.profitAmount < Number(config.minProfitAmount || 0)) return '本周期盈利未达最低门槛'
  if (remainingCommission < Number(config.minRemainingCommission || 0)) return '剩余佣金未达最低额度'
  if (remainingTimes <= 0) return '本周期预支次数已用完'
  if (availableAmount <= 0 || claimedAmount / Math.max(metrics.currentCommission, 1) * 100 >= Number(config.maxRatio || 0)) {
    return '已预支比例超过当前可预支上限'
  }
  return ''
}

function matchScope(row, params = {}) {
  if (params.scope === 'site') return row.siteCode === params.siteCode
  if (params.scope === 'agent') return row.siteCode === params.siteCode && row.agentCode === params.agentCode
  return true
}

function matchFilters(row, params = {}) {
  const keyword = String(params.agentKeyword || '').trim().toLowerCase()
  if (params.siteFilter && row.siteCode !== params.siteFilter) return false
  if (keyword && !`${row.agentCode} ${row.agentName}`.toLowerCase().includes(keyword)) return false
  if (params.period && !String(row.period || '').includes(params.period)) return false
  if (params.status && row.status !== params.status) return false
  if (params.startTime && String(row.claimTime || '').slice(0, 10) < params.startTime) return false
  if (params.endTime && String(row.claimTime || '').slice(0, 10) > params.endTime) return false
  return true
}

function findAgent(agentCode, siteCode) {
  const matched = agentOptions.find(item => String(item.agentCode) === String(agentCode)) ||
    agentOptions.find(item => item.siteCode === siteCode) ||
    agentOptions[0]
  const site = siteOptions.find(item => item.siteCode === matched.siteCode) ||
    siteOptions.find(item => item.siteCode === siteCode) ||
    siteOptions[0]
  return { ...matched, siteCode: site.siteCode, siteName: site.siteName }
}

function sum(rows, key) {
  return rows.reduce((total, item) => total + (Number(item[key]) || 0), 0)
}

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
}

function nowText() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function readJson(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (e) {
    window.localStorage.removeItem(key)
    return fallback
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(key, JSON.stringify(value))
}
