import request from '@/utils/request'

const baseUrl = '/funds/prepaid-account'

export function listPrepaidAccountBalances(params) {
  return request({
    url: baseUrl + '/balances',
    method: 'get',
    params
  })
}

export function getPrepaidAccountBalanceSummary(params) {
  return request({
    url: baseUrl + '/balances/summary',
    method: 'get',
    params
  })
}

export function listPrepaidAccountRecords(params) {
  return request({
    url: baseUrl + '/records',
    method: 'get',
    params
  })
}
