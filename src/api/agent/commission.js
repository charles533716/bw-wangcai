import request from '@/utils/request'

// 查询佣金方案列表
export function listCommission(query) {
  return request({
    url: '/agent/commission/list',
    method: 'get',
    params: query
  })
}

// 根据类型查询佣金方案列表
export function listCommissionByType(commType) {
  return request({
    url: '/agent/commission/listByType/' + commType,
    method: 'get'
  })
}

// 查询佣金方案详细
export function getCommission(id) {
  return request({
    url: '/agent/commission/' + id,
    method: 'get'
  })
}

// 新增佣金方案
export function addCommission(data) {
  return request({
    url: '/agent/commission',
    method: 'post',
    data: data
  })
}

// 修改佣金方案
export function updateCommission(data) {
  return request({
    url: '/agent/commission',
    method: 'put',
    data: data
  })
}

// 删除佣金方案
export function delCommission(ids) {
  return request({
    url: '/agent/commission/' + ids,
    method: 'delete'
  })
}

// 导出佣金方案
export function exportCommission(query) {
  return request({
    url: '/agent/commission/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
