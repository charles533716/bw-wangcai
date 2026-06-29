import request from '@/utils/request'

export function listActivities(query) {
  return request({
    url: '/activity/manage/list',
    method: 'get',
    params: query
  })
}

export function getActivityMeta() {
  return request({
    url: '/activity/manage/meta',
    method: 'get'
  })
}

export function listActivityAgents(siteCode) {
  return request({
    url: '/activity/manage/agent-tree',
    method: 'get',
    params: { siteCode }
  })
}

export function getActivity(id, params) {
  return request({
    url: '/activity/manage/' + id,
    method: 'get',
    params
  })
}

export function addActivity(data) {
  return request({
    url: '/activity/manage',
    method: 'post',
    data
  })
}

export function updateActivity(data) {
  return request({
    url: '/activity/manage',
    method: 'put',
    data
  })
}

export function updateActivityStatus(id, status) {
  return request({
    url: '/activity/manage/' + id + '/status/' + status,
    method: 'put'
  })
}
