import request from '@/utils/request'

// 查询存取款记录列表
export function listDepositWithdrawRecord(query, config = {}) {
  return request({
    url: '/funds/depositWithdrawRecord/list',
    method: 'get',
    params: query,
    ...config
  })
}

// 查询存取款记录汇总
export function getDepositWithdrawRecordSummary(query, config = {}) {
  return request({
    url: '/funds/depositWithdrawRecord/summary',
    method: 'get',
    params: query,
    ...config
  })
}

// 导出存取款记录
export function exportDepositWithdrawRecord(query) {
  return request({
    url: '/funds/depositWithdrawRecord/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}
