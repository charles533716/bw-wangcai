const assert = require('assert')
const fs = require('fs')
const path = require('path')

const modelPath = path.resolve(__dirname, '../src/views/resources/venueManagement/model')
const {
  createInitialState,
  cloneState,
  validateVenue,
  validateGame,
  validateGameBatch,
  validateWallet,
  filterVenues,
  filterGames,
  filterWallets,
  filterMaintenanceLogs,
  paginate,
  getVenueStats,
  appendMaintenanceLog,
  loadState,
  saveState,
  STORAGE_KEY
} = require(modelPath)

const state = createInitialState()
assert.strictEqual(new Set(state.venues.map(item => item.type)).size, 8, '初始数据必须覆盖 8 类场馆')
assert.strictEqual(state.venues.find(item => item.nameZh === 'PM体育').type, '体育', 'PM体育的场馆类型必须匹配名称')
assert.strictEqual(state.venues.find(item => item.nameZh === '博雅电子').type, '电子', '博雅电子的场馆类型必须匹配名称')
assert(state.venues.length >= 10, '场馆列表至少需要 10 条演示数据')
assert(state.games.length >= 12, '游戏列表至少需要 12 条演示数据')
assert(state.wallets.length >= 8, '钱包列表至少需要 8 条演示数据')
assert(state.maintenanceLogs.length >= 3, '维护日志至少需要 3 条演示数据')

const duplicateVenue = cloneState(state.venues[0])
duplicateVenue.id = state.venues[1].id
assert.strictEqual(validateVenue(duplicateVenue, state.venues, state.venues[0].id).valid, false)
duplicateVenue.id = 999
duplicateVenue.code = state.venues[1].code
assert.strictEqual(validateVenue(duplicateVenue, state.venues, state.venues[0].id).valid, false)

const duplicateGame = cloneState(state.games[0])
duplicateGame.id = 999
duplicateGame.code = state.games[1].code
assert.strictEqual(validateGame(duplicateGame, state.games).valid, false)
assert.strictEqual(validateGameBatch([
  { ...cloneState(state.games[0]), id: 901, code: 'BATCH-X' },
  { ...cloneState(state.games[0]), id: 902, code: 'BATCH-X' }
], state.games).valid, false)

const duplicateWallet = cloneState(state.wallets[0])
duplicateWallet.id = 999
duplicateWallet.code = state.wallets[1].code
assert.strictEqual(validateWallet(duplicateWallet, state.wallets).valid, false)

assert(filterVenues(state.venues, { name: '体育' }).length > 0)
assert(filterGames(state.games, { platform: 'H5' }).every(item => item.platforms.includes('H5')))
assert(filterWallets(state.wallets, { direct: 'yes' }).every(item => item.direct))
assert(filterMaintenanceLogs(state.maintenanceLogs, state, { keyword: '维护' }).length > 0)

const paged = paginate(Array.from({ length: 21 }, (_, index) => index), 5, 10)
assert.deepStrictEqual({ total: paged.total, pageNum: paged.pageNum, size: paged.rows.length }, { total: 21, pageNum: 3, size: 1 })

const venue = state.venues[0]
const stats = getVenueStats(state, venue.id)
assert.strictEqual(stats.gameCount, state.games.filter(item => item.venueId === venue.id).length)
assert.strictEqual(stats.authCount, venue.authCount)

const logCount = state.maintenanceLogs.length
appendMaintenanceLog(state, { venueId: venue.id, reason: '平台维护', operator: '演示管理员' })
assert.strictEqual(state.maintenanceLogs.length, logCount + 1)

const memory = new Map()
const storage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: key => memory.delete(key)
}
saveState(storage, state)
assert.strictEqual(loadState(storage).maintenanceLogs.length, state.maintenanceLogs.length)
memory.set(STORAGE_KEY, JSON.stringify({ version: -1, venues: [] }))
assert.strictEqual(loadState(storage).venues.length, createInitialState().venues.length)

function read(relativePath) {
  const target = path.resolve(__dirname, '..', relativePath)
  assert(fs.existsSync(target), `缺少文件：${relativePath}`)
  return fs.readFileSync(target, 'utf8')
}

const routerSource = read('src/router/index.js')
assert(routerSource.includes("path: 'venueManagement'"), '缺少场馆管理路由')
assert(routerSource.includes("path: 'gameList'"), '必须保留原游戏列表路由')

const menuSource = read('src/utils/testEnvironmentMenu.js')
assert(menuSource.includes("const RESOURCE_VENUE_MANAGEMENT_PATH = 'venueManagement'"), '资源菜单缺少场馆管理定位')
assert(
  menuSource.indexOf('...(venueManagement ? [venueManagement] : [])') < menuSource.indexOf('...(gameList ? [gameList] : [])'),
  '场馆管理必须排在原游戏列表之前'
)

const parentSource = read('src/views/resources/venueManagement/index.vue')
;['场馆列表', '游戏列表', '钱包列表', '维护日志', 'VenueList', 'GameList', 'WalletList', 'MaintenanceLog'].forEach(text => {
  assert(parentSource.includes(text), `父页面缺少 ${text}`)
})

const venueSource = read('src/views/resources/venueManagement/VenueList.vue')
;['场馆名称', '场馆类型', '状态', '备注', '场馆ID', '场馆CODE', '中文名称', '场馆钱包', '场馆佣金比例', '最后更新时间', '游戏数', '授权数', '详情', '编辑', '切换场馆状态', '授权', '取消授权', '新增场馆'].forEach(text => assert(venueSource.includes(text), `场馆列表缺少 ${text}`))

const gameSource = read('src/views/resources/venueManagement/GameList.vue')
;['游戏名称', '支持平台', '游戏场馆', '场馆类型', '游戏CODE', '品牌', 'WEB游戏图片', 'H5游戏图片', '创建人', '创建时间', '最后编辑人', '最后编辑时间', '新增游戏', '批量新增游戏', '取消授权'].forEach(text => assert(gameSource.includes(text), `游戏列表缺少 ${text}`))

const walletSource = read('src/views/resources/venueManagement/WalletList.vue')
;['钱包名称', '是否直投', '钱包code', '钱包场馆', '新增钱包', '锁定钱包', '解锁钱包', '删除', '站点状态调整'].forEach(text => assert(walletSource.includes(text), `钱包列表缺少 ${text}`))

const logSource = read('src/views/resources/venueManagement/MaintenanceLog.vue')
;['维护场馆/游戏', '维护场馆', '维护游戏', '维护时间', '操作人', '操作时间', '维护原因'].forEach(text => assert(logSource.includes(text), `维护日志缺少 ${text}`))

const permissionSource = read('src/views/system/role/permissionCatalog.js')
;['场馆管理', '状态切换', '授权', '取消授权', '站点状态调整'].forEach(text => assert(permissionSource.includes(text), `权限目录缺少 ${text}`))

console.log('场馆管理模型检查通过')
