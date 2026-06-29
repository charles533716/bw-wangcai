import request from '@/utils/request'

export function getGlobalMemberPromotionSettings() {
  return request({
    url: '/member/promotion/setting/global',
    method: 'get'
  })
}

export function updateGlobalMemberPromotionSettings(data) {
  return request({
    url: '/member/promotion/setting/global',
    method: 'put',
    data: data
  })
}
