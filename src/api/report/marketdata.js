import request from '@/utils/request'

// 查询市场数据统计列表
export function listMarketDataReport(query) {
  return request({
    url: '/report/marketdata/list',
    method: 'get',
    params: query
  })
}

// 查询市场数据统计汇总
export function summaryMarketDataReport(query) {
  return request({
    url: '/report/marketdata/summary',
    method: 'get',
    params: query
  })
}
