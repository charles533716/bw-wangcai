import request from '@/utils/request'

// 获取风控用户白名单列表
export function listRiskUserWhitelist(data) {
  return request({
    url: '/api/admin/risk/getRiskUserWhitelistList',
    method: 'post',
    data
  })
}

// 获取风控用户白名单详情
export function getRiskUserWhitelist(id) {
  return request({
    url: '/api/admin/risk/getRiskUserWhitelistInfo',
    method: 'post',
    params: { id }
  })
}

// 新增风控用户白名单
export function addRiskUserWhitelist(data) {
  return request({
    url: '/api/admin/risk/addRiskUserWhitelist',
    method: 'post',
    data
  })
}

// 修改风控用户白名单
export function updateRiskUserWhitelist(data) {
  return request({
    url: '/api/admin/risk/updateRiskUserWhitelist',
    method: 'post',
    data
  })
}

// 删除风控用户白名单
export function delRiskUserWhitelist(id) {
  return request({
    url: '/api/admin/risk/deleteRiskUserWhitelist',
    method: 'post',
    params: { id }
  })
}
