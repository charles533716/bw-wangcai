import request from '@/utils/request'

// 查询帐变明细信息
export function getChangeDetails(query) {
  return request({
    url: '/agent/changedetails/list',
    method: 'get',
    params: query
  })
}

// 查询帐变明细汇总
export function summaryChangeDetails(query) {
  return request({
    url: '/agent/changedetails/summary',
    method: 'get',
    params: query
  })
}
