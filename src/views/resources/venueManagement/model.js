const VERSION = 5
const STORAGE_KEY = 'master-admin-prototype:venue-management:v5'
const LEGACY_STORAGE_KEYS = ['master-admin-prototype:venue-management:v4', 'master-admin-prototype:venue-management:v3', 'master-admin-prototype:venue-management:v2']
const INITIAL_SITE_CODES = ['2222', 'SITE001', 'SITE002', 'SITE003', 'SITE004']
const DEMO_IMAGE = '/profile/prototype-image.svg'
const TYPES = ['体育', '真人', '电子', '棋牌', '彩票', '电竞', '捕鱼', '哈希']
const MAINTENANCE_OPERATORS = ['admin', 'test', 'kai01', 'Bill', 'operator01']

function cloneState(value) {
  return JSON.parse(JSON.stringify(value))
}

function defaultMaintenanceConfig() {
  return { startDate: '', endDate: '', reason: '', showMaintenanceTime: true }
}

function isValidMaintenanceDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function validateMaintenanceConfig(config = {}) {
  if (!config.startDate) return { valid: false, message: '请选择维护起始时间' }
  if (!config.endDate) return { valid: false, message: '请选择维护结束时间' }
  if (!isValidMaintenanceDate(config.startDate)) return { valid: false, message: '维护起始时间格式不正确' }
  if (!isValidMaintenanceDate(config.endDate)) return { valid: false, message: '维护结束时间格式不正确' }
  if (config.endDate < config.startDate) return { valid: false, message: '维护结束时间不能早于维护起始时间' }
  if ((config.reason || '').length > 50) return { valid: false, message: '原因备注不能超过50字' }
  if (typeof config.showMaintenanceTime !== 'boolean') return { valid: false, message: '请选择是否展示维护时间' }
  return { valid: true }
}

function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function createMaintenanceLogs(venues = [], games = []) {
  const reasons = ['平台例行维护', '游戏版本升级', '线路优化调整', '供应商临时维护', '系统安全更新', '维护时间到期', '提前结束维护', '数据同步维护']
  const baseTime = Date.UTC(2026, 7, 6, 18, 0, 0)
  const formatTime = value => new Date(value).toISOString().slice(0, 19).replace('T', ' ')
  return Array.from({ length: 200 }, (_, index) => {
    const game = games.length && index % 3 !== 0 ? games[index % games.length] : null
    const venue = (game && venues.find(item => item.id === game.venueId)) || venues[index % Math.max(venues.length, 1)] || {}
    const startTime = baseTime - index * 6 * 60 * 60 * 1000
    const endTime = startTime + (1 + index % 5) * 30 * 60 * 1000
    return {
      id: 4001 + index,
      venueId: venue.id || null,
      gameId: game ? game.id : null,
      startAt: formatTime(startTime),
      endAt: formatTime(endTime),
      operator: MAINTENANCE_OPERATORS[index % MAINTENANCE_OPERATORS.length],
      operatedAt: formatTime(startTime - 10 * 60 * 1000),
      reason: reasons[index % reasons.length]
    }
  })
}

function normalizeMaintenanceOperators(logs = []) {
  const replacedOperators = new Set(['演示管理员', 'louis', 'zhangsan'])
  return logs.map((log, index) => replacedOperators.has(log.operator) ? { ...log, operator: MAINTENANCE_OPERATORS[index % MAINTENANCE_OPERATORS.length] } : log)
}

function createInitialState() {
  const venueTypes = TYPES.map((name, index) => ({
    id: 501 + index,
    name,
    inactiveIcon: DEMO_IMAGE,
    activeIcon: DEMO_IMAGE,
    sort: index + 1
  }))
  const names = [
    ['AG捕鱼', 'AGFISH', 'AG Fishing', '捕鱼'], ['IM电竞', 'IMES', 'IM Esports', '电竞'],
    ['DB棋牌', 'DBCHESS', 'DB Chess', '棋牌'], ['AG真人', 'AGLIVE', 'AG Live', '真人'],
    ['PG电子', 'PGSLOT', 'PG Slot', '电子'], ['VR彩票', 'VRLOTTO', 'VR Lottery', '彩票'],
    ['IM体育', 'IMSPORT', 'IM Sports', '体育'], ['哈希竞猜', 'HASH', 'Hash Games', '哈希'],
    ['PM体育', 'PMSPORT', 'PM Sports', '体育'], ['博雅电子', 'BOYASLOT', 'Boya Slot', '电子']
  ]
  const venues = names.map((item, index) => {
    const authorizedSiteCodes = INITIAL_SITE_CODES.slice(0, index % 4)
    return {
    id: 1001 + index,
    code: item[1],
    name: item[2],
    nameZh: item[0],
    type: item[3],
    walletId: 2001 + (index % 8),
    commissionRate: Number((5 + index * 0.5).toFixed(2)),
    sort: index + 1,
    status: index === 2 ? 'maintenance' : (index === 7 ? 'disabled' : 'enabled'),
    authCount: authorizedSiteCodes.length,
    authorizedSiteCodes,
    billingRateConfiguredSiteCodes: authorizedSiteCodes.slice(0, Math.max(0, authorizedSiteCodes.length - (index % 2 === 0 ? 1 : 0))),
    maintenanceConfig: defaultMaintenanceConfig(),
    remark: index === 2 ? '例行维护中' : (index === 7 ? '暂未开放' : ''),
    updatedAt: `2026-08-${String(1 + (index % 5)).padStart(2, '0')} 10:0${index}:00`
    }
  })
  const games = Array.from({ length: 16 }, (_, index) => {
    const venue = venues[index % venues.length]
    return {
      id: 3001 + index,
      name: [`捕鱼达人${index + 1}`, `电竞冠军赛${index + 1}`, `欢乐棋牌${index + 1}`, `旗舰厅${index + 1}`][index % 4],
      venueId: venue.id,
      code: `GAME${String(index + 1).padStart(3, '0')}`,
      platforms: index % 3 === 0 ? ['PC', 'H5', 'APP'] : (index % 3 === 1 ? ['H5', 'APP'] : ['PC', 'H5']),
      sort: index + 1,
      webImage: DEMO_IMAGE,
      h5Image: DEMO_IMAGE,
      authCount: venue.authorizedSiteCodes.slice(0, index % 6).length,
      authorizedSiteCodes: venue.authorizedSiteCodes.slice(0, index % 6),
      status: index === 4 ? 'maintenance' : (index === 7 ? 'disabled' : 'enabled'),
      maintenanceConfig: defaultMaintenanceConfig(),
      brand: ['MG', 'IMSG', 'PG', 'AG'][index % 4],
      creator: '演示管理员',
      createdAt: `2026-07-${String(10 + (index % 9)).padStart(2, '0')} 09:00:00`,
      editor: '演示管理员',
      editedAt: `2026-08-${String(1 + (index % 5)).padStart(2, '0')} 11:00:00`
    }
  })
  const wallets = Array.from({ length: 8 }, (_, index) => ({
    id: 2001 + index,
    name: `${venues[index].nameZh}钱包`,
    code: `WALLET${String(index + 1).padStart(2, '0')}`,
    venueIds: [venues[index].id].concat(index === 0 ? [venues[8].id] : []),
    direct: index % 3 === 0,
    locked: index === 2,
    siteStatuses: { '2222': true, SITE001: index % 2 === 0, SITE002: false, SITE003: index % 3 === 0 }
  }))
  return {
    version: VERSION,
    venueTypes,
    venues,
    games,
    wallets,
    maintenanceLogs: createMaintenanceLogs(venues, games)
  }
}

function required(value) { return value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length) }
function duplicate(rows, field, value, currentId) { return rows.some(row => String(row.id) !== String(currentId || '') && String(row[field]).toLowerCase() === String(value).toLowerCase()) }
function invalid(message) { return { valid: false, message } }

function validateVenue(payload, rows, currentId) {
  for (const [field, label] of [['id', '场馆ID'], ['code', '场馆CODE'], ['nameZh', '中文名称'], ['type', '场馆类型'], ['walletId', '场馆钱包'], ['commissionRate', '场馆佣金比例'], ['sort', '排序']]) {
    if (!required(payload[field])) return invalid(`请填写${label}`)
  }
  if (duplicate(rows, 'id', payload.id, currentId)) return invalid('场馆ID不能重复')
  if (duplicate(rows, 'code', payload.code, currentId)) return invalid('场馆CODE不能重复')
  if (Number(payload.commissionRate) < 0 || Number(payload.commissionRate) > 100) return invalid('场馆佣金比例必须为 0-100')
  return { valid: true, message: '' }
}

function validateGame(payload, rows, currentId) {
  for (const [field, label] of [['name', '游戏名称'], ['venueId', '游戏场馆'], ['code', '游戏CODE'], ['platforms', '支持平台'], ['sort', '排序']]) {
    if (!required(payload[field])) return invalid(`请填写${label}`)
  }
  if (duplicate(rows, 'code', payload.code, currentId)) return invalid('游戏CODE不能重复')
  return { valid: true, message: '' }
}

function validateGameBatch(payloads, rows) {
  if (!payloads.length) return invalid('至少添加一行游戏')
  const codes = new Set()
  for (let index = 0; index < payloads.length; index++) {
    const result = validateGame(payloads[index], rows)
    if (!result.valid) return invalid(`第${index + 1}行：${result.message}`)
    const code = String(payloads[index].code).toLowerCase()
    if (codes.has(code)) return invalid(`第${index + 1}行：游戏CODE不能重复`)
    codes.add(code)
  }
  return { valid: true, message: '' }
}

function validateWallet(payload, rows, currentId) {
  for (const [field, label] of [['name', '钱包名称'], ['code', '钱包CODE'], ['venueIds', '钱包场馆']]) {
    if (!required(payload[field])) return invalid(`请填写${label}`)
  }
  if (duplicate(rows, 'code', payload.code, currentId)) return invalid('钱包CODE不能重复')
  return { valid: true, message: '' }
}

function validateVenueType(payload, rows, currentId) {
  for (const [field, label] of [['name', '类型名称'], ['inactiveIcon', '未选中图标'], ['activeIcon', '已选中图标'], ['sort', '排序']]) {
    if (!required(payload[field])) return invalid(`请填写${label}`)
  }
  if (duplicate(rows, 'name', payload.name, currentId)) return invalid('类型名称不能重复')
  if (Number(payload.sort) < 1) return invalid('排序必须大于0')
  return { valid: true, message: '' }
}

function contains(value, keyword) { return String(value || '').toLowerCase().includes(String(keyword || '').toLowerCase()) }
function filterVenueTypes(rows, query = {}) { return rows.filter(row => (!query.name || contains(row.name, query.name))) }
function filterVenues(rows, query = {}) { return rows.filter(row => (!query.name || contains(`${row.name} ${row.nameZh} ${row.code}`, query.name)) && (!query.type || row.type === query.type) && (!query.status || row.status === query.status) && (!query.remark || contains(row.remark, query.remark))) }
function filterGames(rows, query = {}) { return rows.filter(row => (!query.name || contains(row.name, query.name)) && (!query.platform || row.platforms.includes(query.platform)) && (!query.status || row.status === query.status) && (!query.venueId || String(row.venueId) === String(query.venueId)) && (!query.venueType || row.venueType === query.venueType) && (!query.code || contains(row.code, query.code)) && (!query.brand || contains(row.brand, query.brand))) }
function filterWallets(rows, query = {}) { return rows.filter(row => (!query.name || contains(`${row.name} ${row.code}`, query.name)) && (!query.direct || (query.direct === 'yes') === Boolean(row.direct))) }
function filterMaintenanceLogs(rows, state, query = {}) { return rows.filter(row => { const venue = state.venues.find(item => item.id === row.venueId); const game = state.games.find(item => item.id === row.gameId); return !query.keyword || contains(`${venue ? venue.nameZh : ''} ${game ? game.name : ''} ${row.reason}`, query.keyword) }) }

function paginate(rows, pageNum = 1, pageSize = 10) {
  const total = rows.length
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, Number(pageNum) || 1), maxPage)
  return { rows: rows.slice((safePage - 1) * pageSize, safePage * pageSize), total, pageNum: safePage, pageSize }
}

function uniqueCodes(values = []) { return Array.from(new Set(values.map(value => String(value)).filter(Boolean))) }
function normalizeSiteRows(rows = []) { return rows.filter(row => row && row.code).map(row => ({ id: Number(row.id), databaseId: Number(row.id), code: String(row.code), name: row.nameZn || row.name || row.siteName || String(row.code), status: String(row.status === undefined ? '' : row.status) })) }
function filterAuthorizationSites(rows, query = {}) { const startId = query.startId === '' || query.startId === null || query.startId === undefined ? null : Number(query.startId); const endId = query.endId === '' || query.endId === null || query.endId === undefined ? null : Number(query.endId); return rows.filter(row => (!query.keyword || contains(`${row.id} ${row.code}`, query.keyword)) && (!query.name || contains(row.name, query.name)) && (startId === null || row.id >= startId) && (endId === null || row.id <= endId) && (!query.databaseId || String(row.databaseId) === String(query.databaseId))) }
function authorizeVenueSites(venue, siteCodes = []) { venue.authorizedSiteCodes = uniqueCodes([...(venue.authorizedSiteCodes || []), ...siteCodes]); venue.authCount = venue.authorizedSiteCodes.length; return venue }
function authorizeGameSites(game, venue, siteCodes = []) { const allowed = new Set(uniqueCodes(venue && venue.authorizedSiteCodes)); game.authorizedSiteCodes = uniqueCodes([...(game.authorizedSiteCodes || []), ...siteCodes]).filter(code => allowed.has(code)); game.authCount = game.authorizedSiteCodes.length; return game }
function revokeGameSites(game, siteCodes = []) { const revoked = new Set(uniqueCodes(siteCodes)); game.authorizedSiteCodes = uniqueCodes(game.authorizedSiteCodes).filter(code => !revoked.has(code)); game.authCount = game.authorizedSiteCodes.length; return game }
function getGameAuthCount(game = {}) { return Array.isArray(game.authorizedSiteCodes) ? uniqueCodes(game.authorizedSiteCodes).length : Number(game.authCount) || 0 }
function revokeVenueSites(venue, siteCodes = [], games = []) { const revokedCodes = uniqueCodes(siteCodes); const revoked = new Set(revokedCodes); venue.authorizedSiteCodes = uniqueCodes(venue.authorizedSiteCodes).filter(code => !revoked.has(code)); venue.billingRateConfiguredSiteCodes = uniqueCodes(venue.billingRateConfiguredSiteCodes).filter(code => venue.authorizedSiteCodes.includes(code)); venue.authCount = venue.authorizedSiteCodes.length; games.filter(game => String(game.venueId) === String(venue.id)).forEach(game => revokeGameSites(game, revokedCodes)); return venue }
function getVenueBillingStats(venue = {}) { const authorized = uniqueCodes(venue.authorizedSiteCodes); const configured = uniqueCodes(venue.billingRateConfiguredSiteCodes).filter(code => authorized.includes(code)); return { configured: configured.length, total: authorized.length, missing: Math.max(0, authorized.length - configured.length) } }
function canEnableVenue(venue) { return getVenueBillingStats(venue).missing === 0 }
function migrateState(state) { const next = cloneState(state); next.version = VERSION; const fallbackTypes = TYPES.map((name, index) => ({ id: 501 + index, name, inactiveIcon: DEMO_IMAGE, activeIcon: DEMO_IMAGE, sort: index + 1 })); next.venueTypes = Array.isArray(next.venueTypes) && next.venueTypes.length ? next.venueTypes.map((item, index) => ({ id: item.id || 501 + index, name: item.name || TYPES[index] || '', inactiveIcon: item.inactiveIcon || DEMO_IMAGE, activeIcon: item.activeIcon || DEMO_IMAGE, sort: Number(item.sort) || index + 1 })).filter(item => item.name) : fallbackTypes; next.venues = (next.venues || []).map((venue, index) => { const authorized = Array.isArray(venue.authorizedSiteCodes) ? uniqueCodes(venue.authorizedSiteCodes) : INITIAL_SITE_CODES.slice(0, Math.max(0, Number(venue.authCount) || 0)); const configured = Array.isArray(venue.billingRateConfiguredSiteCodes) ? uniqueCodes(venue.billingRateConfiguredSiteCodes).filter(code => authorized.includes(code)) : authorized.slice(0, Math.max(0, authorized.length - (index % 2 === 0 && authorized.length ? 1 : 0))); return { ...venue, authCount: authorized.length, authorizedSiteCodes: authorized, billingRateConfiguredSiteCodes: configured, maintenanceConfig: { ...defaultMaintenanceConfig(), ...(venue.maintenanceConfig || {}) } } }); next.games = (next.games || []).map(game => { const venue = next.venues.find(item => String(item.id) === String(game.venueId)); const allowed = uniqueCodes(venue && venue.authorizedSiteCodes); const requested = Array.isArray(game.authorizedSiteCodes) ? uniqueCodes(game.authorizedSiteCodes) : allowed.slice(0, Math.max(0, Number(game.authCount) || 0)); const authorized = requested.filter(code => allowed.includes(code)); return { ...game, authCount: authorized.length, authorizedSiteCodes: authorized, maintenanceConfig: { ...defaultMaintenanceConfig(), ...(game.maintenanceConfig || {}) } } }); return next }
function getVenueStats(state, venueId) { const venue = state.venues.find(item => item.id === venueId) || {}; return { gameCount: state.games.filter(item => item.venueId === venueId).length, authCount: Array.isArray(venue.authorizedSiteCodes) ? venue.authorizedSiteCodes.length : Number(venue.authCount) || 0 } }
function appendMaintenanceLog(state, payload) { state.maintenanceLogs.unshift({ id: Math.max(0, ...state.maintenanceLogs.map(item => Number(item.id))) + 1, venueId: payload.venueId || null, gameId: payload.gameId || null, startAt: payload.startAt || now(), endAt: payload.endAt || '', operator: payload.operator || '演示管理员', operatedAt: now(), reason: payload.reason || '切换维护状态' }) }
function loadState(storage) { for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) { try { const parsed = JSON.parse(storage.getItem(key)); if (parsed && Array.isArray(parsed.venues) && parsed.venues.length) { const migrated = migrateState(parsed); if (!Array.isArray(migrated.maintenanceLogs) || migrated.maintenanceLogs.length < 200) migrated.maintenanceLogs = createMaintenanceLogs(migrated.venues, migrated.games); migrated.maintenanceLogs = normalizeMaintenanceOperators(migrated.maintenanceLogs); saveState(storage, migrated); return migrated } } catch (error) {} } const state = createInitialState(); saveState(storage, state); return state }
function saveState(storage, state) { if (storage && storage.setItem) storage.setItem(STORAGE_KEY, JSON.stringify(state)) }

module.exports = { VERSION, STORAGE_KEY, TYPES, DEMO_IMAGE, createInitialState, cloneState, defaultMaintenanceConfig, validateMaintenanceConfig, validateVenue, validateGame, validateGameBatch, validateWallet, validateVenueType, filterVenueTypes, filterVenues, filterGames, filterWallets, filterMaintenanceLogs, filterAuthorizationSites, normalizeSiteRows, paginate, authorizeVenueSites, revokeVenueSites, authorizeGameSites, revokeGameSites, getGameAuthCount, getVenueBillingStats, canEnableVenue, migrateState, getVenueStats, appendMaintenanceLog, loadState, saveState }
