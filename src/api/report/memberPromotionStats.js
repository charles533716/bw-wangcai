import request from '@/utils/request'

// 查询会员推广统计报表列表
export function listMemberPromotionStats(query) {
  return request({
    url: '/report/memberpromotionstats/list',
    method: 'get',
    params: query
  })
}

// 查询会员推广统计报表汇总
export function getMemberPromotionStatsSummary(query) {
  return request({
    url: '/report/memberpromotionstats/summary',
    method: 'get',
    params: query
  })
}
