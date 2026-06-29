import request from '@/utils/request'

export function getActivityReportMeta() {
  return request({
    url: '/activity/report/meta',
    method: 'get'
  })
}

export function listActivityReports(query) {
  return request({
    url: '/activity/report/list',
    method: 'get',
    params: query
  })
}

export function getActivityReportSummary(query) {
  return request({
    url: '/activity/report/summary',
    method: 'get',
    params: query
  })
}
