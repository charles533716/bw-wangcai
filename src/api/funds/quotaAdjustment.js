import request from '@/utils/request'

export function listQuotaSites(query) {
  return request({
    url: '/funds/quotaAdjustment/sites',
    method: 'get',
    params: query
  })
}

export function listQuotaAgents(query) {
  return request({
    url: '/funds/quotaAdjustment/agents',
    method: 'get',
    params: query
  })
}

export function listQuotaMembers(query) {
  return request({
    url: '/funds/quotaAdjustment/members',
    method: 'get',
    params: query
  })
}

export function listQuotaRecords(query) {
  return request({
    url: '/funds/quotaAdjustment/records',
    method: 'get',
    params: query
  })
}

export function adjustQuotaSite(data) {
  return request({
    url: '/funds/quotaAdjustment/site',
    method: 'post',
    data
  })
}

export function adjustQuotaAgent(data) {
  return request({
    url: '/funds/quotaAdjustment/agent',
    method: 'post',
    data
  })
}

export function adjustQuotaMember(data) {
  return request({
    url: '/funds/quotaAdjustment/member',
    method: 'post',
    data
  })
}
