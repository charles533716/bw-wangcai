import request from '@/utils/request'

// 查询站点报表列表
export function listSiteReport(query) {
  return request({
    url: '/report/sitereport/list',
    method: 'get',
    params: query
  })
}

// 查询站点报表汇总（全量筛选条件）
export function summarySiteReport(query) {
  return request({
    url: '/report/sitereport/summary',
    method: 'get',
    params: query
  })
}

// 查询站点报表每日详情
export function listSiteReportDaily(query) {
  return request({
    url: '/report/sitereport/daily/list',
    method: 'get',
    params: query
  })
}

// 查询站点报表每日详情汇总
export function summarySiteReportDaily(query) {
  return request({
    url: '/report/sitereport/daily/summary',
    method: 'get',
    params: query
  })
}
