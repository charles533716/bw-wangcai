import request from '@/utils/request'

export function listCycleSites() {
  return request({
    url: '/agent/commission/cycle/sites',
    method: 'get'
  })
}

export function getCycleConfig(siteCode) {
  return request({
    url: '/agent/commission/cycle/config',
    method: 'get',
    params: { siteCode }
  })
}

export function saveCycleConfig(data) {
  return request({
    url: '/agent/commission/cycle/config',
    method: 'put',
    data
  })
}

export function resetCycleConfig(siteCode) {
  return request({
    url: '/agent/commission/cycle/config/reset',
    method: 'post',
    data: { siteCode }
  })
}
