import request from '@/utils/request'

// 查询个人财物信息
export function getFinanceReportData(query) {
  return request({
    url: '/agent/financereport/total',
    method: 'get',
    params: query
  })
}
