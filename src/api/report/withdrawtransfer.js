import request from '@/utils/request'

// 查询充提转账统计列表
export function listWithdrawTransferStats(query) {
  return request({
    url: '/report/withdrawtransfer/list',
    method: 'get',
    params: query
  })
}

// 查询充提转账统计汇总
export function summaryWithdrawTransferStats(query) {
  return request({
    url: '/report/withdrawtransfer/summary',
    method: 'get',
    params: query
  })
}
