import request from '@/utils/request'

// 获取风控类型列表
export function listType(data) {
  return request({
    url: '/api/admin/risk/getRiskTypeList',
    method: 'post',
    data
  })
}

// 获取风控类型详情
export function getType(id) {
  return request({
    url: '/api/admin/risk/getRiskTypeInfo',
    method: 'post',
    params: { id }
  })
}

// 新增风控类型
export function addType(data) {
  return request({
    url: '/api/admin/risk/addRiskType',
    method: 'post',
    data
  })
}

// 修改风控类型
export function updateType(data) {
  return request({
    url: '/api/admin/risk/updateRiskType',
    method: 'post',
    data
  })
}

// 删除风控类型
export function delType(id) {
  return request({
    url: '/api/admin/risk/deleteRiskType',
    method: 'post',
    params: { id }
  })
}
