import request from '@/utils/request'

// 查询三方场馆代理费用明细
export function listVenueAgentFeeDetail(query) {
  return request({
    url: '/venue/agentFeeDetail/list',
    method: 'get',
    params: query
  })
}

// 查询三方场馆代理费用明细总数
export function getVenueAgentFeeDetailTotal(query) {
  return request({
    url: '/venue/agentFeeDetail/total',
    method: 'get',
    params: query
  })
}

// 查询三方场馆代理费用弹窗明细
export function getVenueAgentFeeDetail(query) {
  return request({
    url: '/venue/agentFeeDetail/detail',
    method: 'get',
    params: query
  })
}

// 导出三方场馆代理费用明细
export function exportVenueAgentFeeDetail(data) {
  return request({
    url: '/venue/agentFeeDetail/export',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}
