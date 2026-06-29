import request from '@/utils/request'

// 查询充提转账统计列表
export function listWithdrawTransferStats(query) {
  return request({
    url: '/agent/withdrawtransfer/list',
    method: 'get',
    params: query
  })
}

// 查询充提转账统计汇总（全量过滤条件）
export function summaryWithdrawTransferStats(query) {
  return request({
    url: '/agent/withdrawtransfer/summary',
    method: 'get',
    params: query
  })
}
