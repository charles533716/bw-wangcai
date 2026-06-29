export const GLOBAL_SITE_CODE = 'GLOBAL'
export const GLOBAL_SITE_NAME = '全局配置（适配所有站点）'

const CONFIG_KEY = 'prototype:settlementCycle:scopeConfigs'
const HISTORY_KEY = 'prototype:settlementCycle:scopeHistory'

export function getGlobalSiteOption() {
  return {
    siteCode: GLOBAL_SITE_CODE,
    siteName: GLOBAL_SITE_NAME
  }
}

export function withGlobalSiteOption(siteOptions = []) {
  const rows = siteOptions.filter(item => item && item.siteCode !== GLOBAL_SITE_CODE)
  return [getGlobalSiteOption(), ...rows]
}

export function isGlobalSite(siteCode) {
  return siteCode === GLOBAL_SITE_CODE
}

export function getDefaultCycleConfig(siteCode = GLOBAL_SITE_CODE) {
  return {
    siteCode,
    cycleType: 'WEEKLY',
    weekInterval: 1,
    weeklySettleDay: 1,
    monthlySettleDay: 1,
    executeTime: '02:00',
    updatedAt: nowText()
  }
}

export function getCycleScopeState(siteCode = GLOBAL_SITE_CODE) {
  const configs = readJson(CONFIG_KEY, {})
  const globalConfig = normalizeCycleConfig({
    ...getDefaultCycleConfig(GLOBAL_SITE_CODE),
    ...(configs[GLOBAL_SITE_CODE] || {}),
    siteCode: GLOBAL_SITE_CODE
  })

  if (isGlobalSite(siteCode)) {
    return {
      mode: 'global',
      hasSiteOverride: false,
      config: globalConfig
    }
  }

  const siteOverride = configs[siteCode]
  if (siteOverride) {
    return {
      mode: 'site',
      hasSiteOverride: true,
      config: normalizeCycleConfig({
        ...globalConfig,
        ...siteOverride,
        siteCode
      })
    }
  }

  return {
    mode: 'inherit',
    hasSiteOverride: false,
    config: normalizeCycleConfig({
      ...globalConfig,
      siteCode
    })
  }
}

export function saveCycleScopeConfig(siteCode, form = {}, siteName = '') {
  const configs = readJson(CONFIG_KEY, {})
  const next = normalizeCycleConfig({
    ...getDefaultCycleConfig(siteCode),
    ...form,
    siteCode,
    siteName,
    updatedAt: nowText()
  })
  configs[siteCode] = next
  writeJson(CONFIG_KEY, configs)
  addCycleHistory(siteCode, isGlobalSite(siteCode) ? '全局结算周期配置已更新' : `${siteName || siteCode} 单站结算周期配置已更新`)
  return next
}

export function resetCycleScopeConfig(siteCode, siteName = '') {
  const configs = readJson(CONFIG_KEY, {})
  if (isGlobalSite(siteCode)) {
    configs[GLOBAL_SITE_CODE] = getDefaultCycleConfig(GLOBAL_SITE_CODE)
    writeJson(CONFIG_KEY, configs)
    addCycleHistory(siteCode, '全局结算周期配置已恢复系统默认')
    return configs[GLOBAL_SITE_CODE]
  }

  delete configs[siteCode]
  writeJson(CONFIG_KEY, configs)
  addCycleHistory(siteCode, `${siteName || siteCode} 已恢复继承全局结算周期配置`)
  return getCycleScopeState(siteCode).config
}

export function listCycleSiteOverrides(siteOptions = []) {
  const configs = readJson(CONFIG_KEY, {})
  return Object.keys(configs)
    .filter(siteCode => siteCode !== GLOBAL_SITE_CODE)
    .map(siteCode => {
      const site = siteOptions.find(item => item.siteCode === siteCode) || {}
      return {
        ...normalizeCycleConfig(configs[siteCode]),
        siteCode,
        siteName: configs[siteCode].siteName || site.siteName || siteCode
      }
    })
}

export function getCycleScopeHistory(siteCode = GLOBAL_SITE_CODE) {
  return readJson(HISTORY_KEY, [])
    .filter(item => isGlobalSite(siteCode) ? item.siteCode === GLOBAL_SITE_CODE : item.siteCode === siteCode || item.siteCode === GLOBAL_SITE_CODE)
    .slice(0, 20)
}

export function buildCycleLabels(config = {}) {
  const normalized = normalizeCycleConfig(config)
  const weekly = normalized.cycleType === 'WEEKLY'
  const cycleLabel = weekly ? '周结算' : '月结算'
  const frequencyLabel = weekly
    ? `每${normalized.weekInterval === 1 ? '周' : `${normalized.weekInterval}周`}一次`
    : '每月一次'
  const nextExecuteText = weekly
    ? `下个周一 ${normalized.executeTime}`
    : `下月1日 ${normalized.executeTime}`

  return {
    activeLabel: cycleLabel,
    activeFrequency: frequencyLabel,
    nextExecuteText
  }
}

function normalizeCycleConfig(config = {}) {
  return {
    siteCode: config.siteCode || GLOBAL_SITE_CODE,
    siteName: config.siteName || '',
    cycleType: config.cycleType === 'MONTHLY' ? 'MONTHLY' : 'WEEKLY',
    weekInterval: Number(config.weekInterval || 1),
    weeklySettleDay: 1,
    monthlySettleDay: 1,
    executeTime: config.executeTime || '02:00',
    updatedAt: config.updatedAt || nowText()
  }
}

function addCycleHistory(siteCode, changeSummary) {
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
