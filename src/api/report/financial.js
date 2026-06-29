import request from '@/utils/request'

// 查询财务报表列表
export function listFinancialReport(query) {
  return request({
    url: '/report/financial/list',
    method: 'get',
    params: query
  })
}

// 导出财务报表
export function exportFinancialReport(query) {
  return request({
    url: '/report/financial/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}
