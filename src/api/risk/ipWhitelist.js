import request from '@/utils/request'

// 获取风控 IP 白名单列表
export function listRiskIpWhitelist(data) {
  return request({
    url: '/api/admin/risk/getRiskIpWhitelistList',
    method: 'post',
    data
  })
}

// 获取风控 IP 白名单详情
export function getRiskIpWhitelist(id) {
  return request({
    url: '/api/admin/risk/getRiskIpWhitelistInfo',
    method: 'post',
    params: { id }
  })
}

// 新增风控 IP 白名单
export function addRiskIpWhitelist(data) {
  return request({
    url: '/api/admin/risk/addRiskIpWhitelist',
    method: 'post',
    data
  })
}

// 修改风控 IP 白名单
export function updateRiskIpWhitelist(data) {
  return request({
    url: '/api/admin/risk/updateRiskIpWhitelist',
    method: 'post',
    data
  })
}

// 删除风控 IP 白名单
export function delRiskIpWhitelist(id) {
  return request({
    url: '/api/admin/risk/deleteRiskIpWhitelist',
    method: 'post',
    params: { id }
  })
}
