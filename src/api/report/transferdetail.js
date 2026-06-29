import request from '@/utils/request'

// 查询站点/代理转账明细列表
export function listTransferDetail(query) {
  return request({
    url: '/report/transferdetail/list',
    method: 'get',
    params: query
  })
}

// 查询站点/代理转账明细汇总
export function summaryTransferDetail(query) {
  return request({
    url: '/report/transferdetail/summary',
    method: 'get',
    params: query
  })
}

