import request from '@/utils/request'

// 获取风控规则列表
export function listRule(data) {
  return request({
    url: '/api/admin/risk/getRiskRuleList',
    method: 'post',
    data
  })
}

// 获取风控规则详情
export function getRule(id) {
  return request({
    url: '/api/admin/risk/getRiskRuleInfo',
    method: 'post',
    params: { id }
  })
}

// 新增风控规则
export function addRule(data) {
  return request({
    url: '/api/admin/risk/addRiskRule',
    method: 'post',
    data
  })
}

// 修改风控规则
export function updateRule(data) {
  return request({
    url: '/api/admin/risk/updateRiskRule',
    method: 'post',
    data
  })
}

// 删除风控规则
export function delRule(id) {
  return request({
    url: '/api/admin/risk/deleteRiskRule',
    method: 'post',
    params: { id }
  })
}
