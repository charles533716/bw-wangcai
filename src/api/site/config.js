import request from '@/utils/request'

// 通过域名自动检测站点
export function autoDetectSite() {
  return request({
    url: '/site/auto-detect',
    method: 'get'
  })
}

// 通过 siteCode 获取站点配置
export function getSiteConfig(siteCode) {
  return request({
    url: '/site/getSiteConfig',
    method: 'get',
    params: { siteCode }
  })
}

// 获取站点配置信息（兼容站点后台旧调用）
export function getSiteConfigInfo() {
  return request({
    url: '/site/getSiteConfig',
    method: 'get'
  })
}

// 站点维护操作
export function maintainSite(data) {
  return request({
    url: '/site/config/update/maintain',
    method: 'post',
    data: data
  })
}

// 站点恢复运营
export function operateSite(id) {
  return request({
    url: '/site/config/update/operate/' + id,
    method: 'post'
  })
}

// 查询维护日志列表
export function listSiteUpdateLog(query) {
  return request({
    url: '/site/config/update/log/list',
    method: 'get',
    params: query
  })
}
// 站点游戏配置
export function listSiteGame(query) {
  return request({
    url: '/site/game/list',
    method: 'get',
    params: query
  })
}
// 站点游戏配置
export function listSiteManageGame(query, config = {}) {
  return request({
    url: '/site/game/managelist',
    method: 'get',
    params: query,
    ...config
  })
}
// 获取站点游戏详细信息
export function getSiteGame(id) {
  return request({
    url: '/site/game/game/' + id,
    method: 'get'
  })
}
export function addSiteGame(data) {
  return request({
    url: '/site/game',
    method: 'post',
    data: data
  })
}

export function updateSiteGame(data) {
  return request({
    url: '/site/game',
    method: 'put',
    data: data
  })
}

export function delSiteGame(ids) {
  return request({
    url: '/site/game/' + ids,
    method: 'delete'
  })
}
// 切换游戏授权状态
export function toggleGameAuth(data) {
  return request({
    url: '/site/game/toggleAuth',
    method: 'put',
    data: data
  })
}

export function batchAuthGame(data) {
  return request({
    url: '/site/game/batchAuth',
    method: 'post',
    data: data
  })
}
// 站点游戏配置初始化
export function initSiteGames(siteCode) {
  return request({
    url: '/site/game/init/' + siteCode,
    method: 'post'
  })
}
// 站点域名配置
export function listSiteDomain(query) {
  return request({
    url: '/site/config/domain/list',
    method: 'get',
    params: query
  })
}

export function addSiteDomain(data) {
  return request({
    url: '/site/config/domain',
    method: 'post',
    data: data
  })
}

export function updateSiteDomain(data) {
  return request({
    url: '/site/config/domain',
    method: 'put',
    data: data
  })
}

export function delSiteDomain(ids) {
  return request({
    url: '/site/config/domain/' + ids,
    method: 'delete'
  })
}

// 站点维护配置
export function listSiteUpdate(query) {
  return request({
    url: '/site/config/update/list',
    method: 'get',
    params: query
  })
}

export function addSiteUpdate(data) {
  return request({
    url: '/site/config/update',
    method: 'post',
    data: data
  })
}

export function updateSiteUpdate(data) {
  return request({
    url: '/site/config/update',
    method: 'put',
    data: data
  })
}

export function delSiteUpdate(ids) {
  return request({
    url: '/site/config/update/' + ids,
    method: 'delete'
  })
}

// 站点基本信息
export function getSiteBaseInfo(siteCode) {
  return request({
    url: '/site/config/base/' + siteCode,
    method: 'get'
  })
}

export function updateSiteBaseInfo(data) {
  return request({
    url: '/site/config/base',
    method: 'put',
    data: data
  })
}

// 站点综合配置
export function getSiteComprehensiveConfig(siteCode) {
  return request({
    url: '/site/config/comprehensive/' + siteCode,
    method: 'get'
  })
}

export function updateSiteComprehensiveConfig(data) {
  return request({
    url: '/site/config/comprehensive',
    method: 'put',
    data: data
  })
}

// 查询站点专用返佣方案配置
export function listSiteCommissionPlanOverrides(siteCode) {
  return request({
    url: '/site/config/commission-plan/' + siteCode,
    method: 'get'
  })
}

// 新增站点专用返佣方案配置
export function addSiteCommissionPlanOverride(data) {
  return request({
    url: '/site/config/commission-plan',
    method: 'post',
    data: data
  })
}

// 修改站点专用返佣方案配置
export function updateSiteCommissionPlanOverride(id, data) {
  return request({
    url: '/site/config/commission-plan/' + id,
    method: 'put',
    data: data
  })
}

// 删除站点专用返佣方案配置
export function delSiteCommissionPlanOverride(id) {
  return request({
    url: '/site/config/commission-plan/' + id,
    method: 'delete'
  })
}

// 站点场馆配置
export function listSiteVenue(query) {
  return request({
    url: '/site/config/venue/list',
    method: 'get',
    params: query
  })
}

// 站点场馆配置
export function listSiteManageVenue(query, config = {}) {
  return request({
    url: '/site/config/venue/managelist',
    method: 'get',
    params: query,
    ...config
  })
}

export function getSiteVenue(id) {
  return request({
    url: '/site/config/venue/' + id,
    method: 'get'
  })
}

export function addSiteVenue(data) {
  return request({
    url: '/site/config/venue',
    method: 'post',
    data: data
  })
}

export function updateSiteVenue(data) {
  return request({
    url: '/site/config/venue',
    method: 'put',
    data: data
  })
}

// 新增：修改场馆维护信息接口
export function updateVenueMaintainInfo(data) {
  return request({
    url: '/site/config/venue/maintain',
    method: 'put',
    data: data
  })
}

export function delSiteVenue(ids) {
  return request({
    url: '/site/config/venue/' + ids,
    method: 'delete'
  })
}

export function batchUpdateVenueStatus(data) {
  return request({
    url: '/site/config/venue/batchStatus',
    method: 'put',
    data: data
  })
}

// 新增：批量更新钱包锁定状态接口
export function batchUpdateWalletLocked(data) {
  return request({
    url: '/site/config/venue/batchWalletLocked',
    method: 'put',
    data: data
  })
}

// 批量授权场馆
export function batchAuthVenues(data) {
  return request({
    url: '/site/config/venue/batchAuth',
    method: 'post',
    data: data
  })
}

export function initSiteVenues(siteCode) {
  return request({
    url: '/site/config/venue/init/' + siteCode,
    method: 'post'
  })
}

// ==================== 新增的接口方法 ====================

/**
 * 批量锁定钱包（新增加）
 */
export function batchLockWallet(data) {
  return request({
    url: '/site/config/venue/batchLockWallet',
    method: 'put',
    data: data
  })
}

/**
 * 批量解锁钱包（新增加）
 */
export function batchUnlockWallet(data) {
  return request({
    url: '/site/config/venue/batchUnlockWallet',
    method: 'put',
    data: data
  })
}

/**
 * 单个场馆钱包锁定状态修改（新增加）
 */
export function updateWalletLockStatus(data) {
  return request({
    url: '/site/config/venue/walletLock',
    method: 'put',
    data: data
  })
}

/**
 * 获取场馆维护详情（新增加）
 */
export function getVenueMaintainInfo(id) {
  return request({
    url: '/site/config/venue/maintain/' + id,
    method: 'get'
  })
}

/**
 * 清除场馆维护信息（新增加）
 */
export function clearVenueMaintain(id) {
  return request({
    url: '/site/config/venue/clearMaintain/' + id,
    method: 'put'
  })
}

/**
 * 批量设置场馆维护（新增加）
 */
export function batchSetVenueMaintain(data) {
  return request({
    url: '/site/config/venue/batchMaintain',
    method: 'post',
    data: data
  })
}

/**
 * 查询场馆维护状态（新增加）
 */
export function checkVenueMaintainStatus(query) {
  return request({
    url: '/site/config/venue/checkMaintain',
    method: 'get',
    params: query
  })
}

/**
 * 更新场馆跳转设置（新增加）
 */
export function updateVenueRedirect(data) {
  return request({
    url: '/site/config/venue/redirect',
    method: 'put',
    data: data
  })
}

/**
 * 导出场馆配置（新增加）
 */
export function exportVenueConfig(query) {
  return request({
    url: '/site/config/venue/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 导入场馆配置（新增加）
 */
export function importVenueConfig(data) {
  return request({
    url: '/site/config/venue/import',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 同步场馆配置到所有站点（新增加）
 */
export function syncVenueConfigToAllSites(venueCode) {
  return request({
    url: '/site/config/venue/sync/' + venueCode,
    method: 'post'
  })
}

/**
 * 获取可跳转的场馆列表（新增加）
 */
export function getRedirectVenueList(siteCode) {
  return request({
    url: '/site/config/venue/redirectList/' + siteCode,
    method: 'get'
  })
}

/**
 * 批量复制场馆配置（新增加）
 */
export function batchCopyVenueConfig(data) {
  return request({
    url: '/site/config/venue/batchCopy',
    method: 'post',
    data: data
  })
}

/**
 * 批量重置场馆配置（新增加）
 */
export function batchResetVenueConfig(ids) {
  return request({
    url: '/site/config/venue/batchReset/' + ids,
    method: 'put'
  })
}

/**
 * 获取场馆统计信息（新增加）
 */
export function getVenueStatistics(query) {
  return request({
    url: '/site/config/venue/statistics',
    method: 'get',
    params: query
  })
}

/**
 * 批量更新场馆排序（新增加）
 */
export function batchUpdateVenueSort(data) {
  return request({
    url: '/site/config/venue/batchSort',
    method: 'put',
    data: data
  })
}

/**
 * 批量更新场馆费率（新增加）
 */
export function batchUpdateVenueFeeRate(data) {
  return request({
    url: '/site/config/venue/batchFeeRate',
    method: 'put',
    data: data
  })
}

/**
 * 批量更新场馆自定义名称（新增加）
 */
export function batchUpdateVenueCustomName(data) {
  return request({
    url: '/site/config/venue/batchCustomName',
    method: 'put',
    data: data
  })
}

/**
 * 检测场馆维护冲突（新增加）
 */
export function checkMaintainConflict(data) {
  return request({
    url: '/site/config/venue/checkConflict',
    method: 'post',
    data: data
  })
}

/**
 * 获取维护计划列表（新增加）
 */
export function listMaintainSchedule(query) {
  return request({
    url: '/site/config/venue/maintainSchedule',
    method: 'get',
    params: query
  })
}

/**
 * 添加维护计划（新增加）
 */
export function addMaintainSchedule(data) {
  return request({
    url: '/site/config/venue/maintainSchedule',
    method: 'post',
    data: data
  })
}

/**
 * 删除维护计划（新增加）
 */
export function deleteMaintainSchedule(id) {
  return request({
    url: '/site/config/venue/maintainSchedule/' + id,
    method: 'delete'
  })
}

/**
 * 执行维护计划（新增加）
 */
export function executeMaintainSchedule(id) {
  return request({
    url: '/site/config/venue/executeSchedule/' + id,
    method: 'post'
  })
}
