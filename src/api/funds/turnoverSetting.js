import request from '@/utils/request'

export function getGlobalTurnoverSettings() {
  return request({
    url: '/turnover/setting/global',
    method: 'get'
  })
}

export function updateGlobalTurnoverSettings(data) {
  return request({
    url: '/turnover/setting/global',
    method: 'put',
    data: data
  })
}
