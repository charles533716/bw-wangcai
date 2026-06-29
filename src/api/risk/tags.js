import request from '@/utils/request'

// 获取风控标签列表
export function listRiskTags(data) {
  return request({
    url: '/api/admin/risk/getRiskTagList',
    method: 'post',
    data
  })
}

// 获取风控标签详情
export function getRiskTag(id) {
  return request({
    url: '/api/admin/risk/getRiskTagInfo',
    method: 'post',
    params: { id }
  })
}

// 新增风控自定义标签
export function addRiskTag(data) {
  return request({
    url: '/api/admin/risk/addRiskTag',
    method: 'post',
    data
  })
}

// 修改风控标签
export function updateRiskTag(data) {
  return request({
    url: '/api/admin/risk/updateRiskTag',
    method: 'post',
    data
  })
}

// 删除风控自定义标签
export function delRiskTag(id) {
  return request({
    url: '/api/admin/risk/deleteRiskTag',
    method: 'post',
    params: { id }
  })
}

// 获取风控标签操作记录
export function listRiskTagLogs(data) {
  return request({
    url: '/api/admin/risk/getRiskTagLogList',
    method: 'post',
    data
  })
}
