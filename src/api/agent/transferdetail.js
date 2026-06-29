import request from '@/utils/request'

// 查询代理/站点转账明细列表
export function listTransferDetail(query) {
  return request({
    url: '/agent/transferdetail/list',
    method: 'get',
    params: query
  })
}

// 查询代理/站点转账明细汇总（全过滤条件）
export function summaryTransferDetail(query) {
  return request({
    url: '/agent/transferdetail/summary',
    method: 'get',
    params: query
  })
}

