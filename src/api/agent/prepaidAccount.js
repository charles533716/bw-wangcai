import request from '@/utils/request'

// 查询预付金账户汇总
export function getPrepaidAccountSummary(params) {
  return request({
    url: '/agent/prepaid-account/summary',
    method: 'get',
    params
  })
}

// 查询预付金流水记录
export function getPrepaidAccountRecords(params) {
  return request({
    url: '/agent/prepaid-account/records',
    method: 'get',
    params
  })
}

// 从财务中心可用额度转入预付金账户
export function submitPrepaidTransferIn(data) {
  return request({
    url: '/agent/prepaid-account/transfer-in',
    method: 'post',
    data
  })
}

