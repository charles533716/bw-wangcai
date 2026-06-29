import request from '@/utils/request'

export function getMainBalanceSummary() {
  return request({
    url: '/funds/main-balance/summary',
    method: 'get'
  })
}

export function rechargeMainBalance(data) {
  return request({
    url: '/funds/main-balance/recharge',
    method: 'post',
    data
  })
}

export function createActivityCash(data) {
  return request({
    url: '/funds/main-balance/activity-cash',
    method: 'post',
    data
  })
}

export function listMainBalanceRecords(query) {
  return request({
    url: '/funds/main-balance/records',
    method: 'get',
    params: query
  })
}
