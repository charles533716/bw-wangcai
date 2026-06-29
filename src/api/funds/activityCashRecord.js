import request from '@/utils/request'

export function listActivityCashRecords(query) {
  return request({
    url: '/funds/activity-cash-record/list',
    method: 'get',
    params: query
  })
}

export function getActivityCashSummary(query) {
  return request({
    url: '/funds/activity-cash-record/summary',
    method: 'get',
    params: query
  })
}

export function getActivityCashRecord(id) {
  return request({
    url: `/funds/activity-cash-record/${id}`,
    method: 'get'
  })
}

export function listActivityCashClaims(id) {
  return request({
    url: `/funds/activity-cash-record/${id}/claims`,
    method: 'get'
  })
}
