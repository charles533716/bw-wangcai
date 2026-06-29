import request from '@/utils/request'

export function getActivityRewardDetailMeta() {
  return request({
    url: '/activity/reward-detail/meta',
    method: 'get'
  })
}

export function listActivityRewardDetails(query) {
  return request({
    url: '/activity/reward-detail/list',
    method: 'get',
    params: query
  })
}

export function getActivityRewardDetailSummary(query) {
  return request({
    url: '/activity/reward-detail/summary',
    method: 'get',
    params: query
  })
}
