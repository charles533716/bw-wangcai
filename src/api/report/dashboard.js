import request from '@/utils/request'

// 获取首页统计数据
export function getDashboardStats(data) {
  return request({
    url: '/report/dashboard/stats',
    method: 'post',
    data: data
  })
}

// 获取在线人数
export function getOnlineUsers() {
  return request({
    url: '/report/dashboard/onlineUsers',
    method: 'get'
  })
}

// 获取注册人数趋势
export function getRegisterTrend(data) {
  return request({
    url: '/report/dashboard/registerTrend',
    method: 'post',
    data: data
  })
}
// 获取会员统计信息
export function getMemberStats(data) {
  return request({
    url: '/report/dashboard/memberstats',
    method: 'post',
    data: data
  })
}

// 获取活跃会员趋势
export function getActiveMembersTrend(data) {
  return request({
    url: '/report/dashboard/activeTrend',
    method: 'post',
    data: data
  })
}

// 获取新增会员趋势
export function getNewMembersTrend(data) {
  return request({
    url: '/report/dashboard/newTrend',
    method: 'post',
    data: data
  })
}

// 获取活跃时间段分布
export function getActiveTimeDistribution(data) {
  return request({
    url: '/report/dashboard/activeTimeDistribution',
    method: 'post',
    data: data
  })
}

// 获取Top活跃会员
export function getTopActiveMembers(data) {
  return request({
    url: '/report/dashboard/topActive',
    method: 'post',
    data: data
  })
}

// 获取总控运营数据看板（Mock/真实均可复用同结构）
export function getOperationsDashboard(params) {
  return request({
    url: '/report/dashboard/operations',
    method: 'get',
    params
  })
}

// 获取总控看板站点下拉
export function getDashboardSiteOptions() {
  return request({
    url: '/report/dashboard/siteOptions',
    method: 'get'
  })
}
