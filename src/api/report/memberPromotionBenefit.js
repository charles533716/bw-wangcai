import request from '@/utils/request'

// 查询会员推广福利明细列表
export function listMemberPromotionBenefit(query) {
  return request({
    url: '/member/promotion/benefit/list',
    method: 'get',
    params: query
  })
}

// 查询会员推广福利汇总
export function getMemberPromotionBenefitSummary(query) {
  return request({
    url: '/member/promotion/benefit/summary',
    method: 'get',
    params: query
  })
}
