import request from '@/utils/request'

// 查询充提手续费报表
export function listDepositWithdrawFeeReport(query) {
  return request({
    url: '/funds/depositWithdrawFee/report/list',
    method: 'get',
    params: query
  })
}

// 导出充提手续费报表
export function exportDepositWithdrawFeeReport(data) {
  return request({
    url: '/funds/depositWithdrawFee/report/export',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}
