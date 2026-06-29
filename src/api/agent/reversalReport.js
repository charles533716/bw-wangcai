import request from '@/utils/request'

export function getReversalStatsSummary(params) {
  return request({
    url: '/agent/reversal/report/stats/summary',
    method: 'get',
    params
  })
}

export function listReversalStats(params) {
  return request({
    url: '/agent/reversal/report/stats/list',
    method: 'get',
    params
  })
}

export function getReversalStatsTotal(params) {
  return request({
    url: '/agent/reversal/report/stats/total',
    method: 'get',
    params
  })
}

export function exportReversalStats(params) {
  return request({
    url: '/agent/reversal/report/stats/export',
    method: 'post',
    params
  })
}

export function listReversalRepayment(params) {
  return request({
    url: '/agent/reversal/report/repayment/list',
    method: 'get',
    params
  })
}

export function exportReversalRepayment(params) {
  return request({
    url: '/agent/reversal/report/repayment/export',
    method: 'post',
    params
  })
}
