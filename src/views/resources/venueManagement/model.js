const VERSION = 2
const STORAGE_KEY = 'master-admin-prototype:venue-management:v2'
const DEMO_IMAGE = '/profile/prototype-image.svg'
const TYPES = ['捕鱼', '电竞', '棋牌', '真人', '电子', '彩票', '体育', '哈希']

function cloneState(value) {
  return JSON.parse(JSON.stringify(value))
}

function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function createInitialState() {
  const names = [
    ['AG捕鱼', 'AGFISH', 'AG Fishing', '捕鱼'], ['IM电竞', 'IMES', 'IM Esports', '电竞'],
    ['DB棋牌', 'DBCHESS', 'DB Chess', '棋牌'], ['AG真人', 'AGLIVE', 'AG Live', '真人'],
    ['PG电子', 'PGSLOT', 'PG Slot', '电子'], ['VR彩票', 'VRLOTTO', 'VR Lottery', '彩票'],
    ['IM体育', 'IMSPORT', 'IM Sports', '体育'], ['哈希竞猜', 'HASH', 'Hash Games', '哈希'],
    ['PM体育', 'PMSPORT', 'PM Sports', '体育'], ['博雅电子', 'BOYASLOT', 'Boya Slot', '电子']
  ]
  const venues = names.map((item, index) => ({
    id: 1001 + index,
    code: item[1],
    name: item[2],
    nameZh: item[0],
    type: item[3],
    walletId: 2001 + (index % 8),
    commissionRate: Number((5 + index * 0.5).toFixed(2)),
    sort: index + 1,
    status: index === 2 ? 'maintenance' : (index === 7 ? 'disabled' : 'enabled'),
    authCount: index % 4,
    remark: index === 2 ? '例行维护中' : (index === 7 ? '暂未开放' : ''),
    updatedAt: `2026-08-${String(1 + (index % 5)).padStart(2, '0')} 10:0${index}:00`
  }))
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
      authCount: index % 6,
      status: index === 4 ? 'maintenance' : (index === 7 ? 'disabled' : 'enabled'),
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
    venues,
    games,
    wallets,
    maintenanceLogs: [
      { id: 4001, venueId: venues[2].id, gameId: null, startAt: '2026-08-05 10:00:00', endAt: '2026-08-05 12:00:00', operator: 'louis', operatedAt: '2026-08-05 09:50:00', reason: '平台维护' },
      { id: 4002, venueId: venues[4].id, gameId: games[4].id, startAt: '2026-08-04 08:00:00', endAt: '2026-08-04 09:00:00', operator: 'zhangsan', operatedAt: '2026-08-04 09:00:00', reason: '维护时间到期' },
      { id: 4003, venueId: venues[6].id, gameId: games[6].id, startAt: '2026-08-03 14:00:00', endAt: '2026-08-03 15:30:00', operator: 'zhangsan', operatedAt: '2026-08-03 15:10:00', reason: '提前结束维护' }
    ]
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

function contains(value, keyword) { return String(value || '').toLowerCase().includes(String(keyword || '').toLowerCase()) }
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

function getVenueStats(state, venueId) { return { gameCount: state.games.filter(item => item.venueId === venueId).length, authCount: (state.venues.find(item => item.id === venueId) || {}).authCount || 0 } }
function appendMaintenanceLog(state, payload) { state.maintenanceLogs.unshift({ id: Math.max(0, ...state.maintenanceLogs.map(item => Number(item.id))) + 1, venueId: payload.venueId || null, gameId: payload.gameId || null, startAt: payload.startAt || now(), endAt: payload.endAt || '', operator: payload.operator || '演示管理员', operatedAt: now(), reason: payload.reason || '切换维护状态' }) }
function loadState(storage) { try { const parsed = JSON.parse(storage.getItem(STORAGE_KEY)); if (parsed && parsed.version === VERSION && Array.isArray(parsed.venues)) return parsed } catch (error) {} const state = createInitialState(); saveState(storage, state); return state }
function saveState(storage, state) { if (storage && storage.setItem) storage.setItem(STORAGE_KEY, JSON.stringify(state)) }

module.exports = { VERSION, STORAGE_KEY, TYPES, DEMO_IMAGE, createInitialState, cloneState, validateVenue, validateGame, validateGameBatch, validateWallet, filterVenues, filterGames, filterWallets, filterMaintenanceLogs, paginate, getVenueStats, appendMaintenanceLog, loadState, saveState }
