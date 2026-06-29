import request from '@/utils/request'

// 查询站点利润明细列表
export function listSiteProfitDetail(query) {
  return request({
    url: '/agent/siteprofit/list',
    method: 'get',
    params: query
  })
}

// 查询站点利润明细汇总（全过滤条件）
export function summarySiteProfitDetail(query) {
  return request({
    url: '/agent/siteprofit/summary',
    method: 'get',
    params: query
  })
}

