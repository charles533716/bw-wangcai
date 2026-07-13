import request from '@/utils/request'

const FIRST_DEPOSIT_DEMO_ID = '9001'
const FIRST_DEPOSIT_DEMO_NAME = '体育首存送68%最高2000元'
const FIRST_DEPOSIT_ACTIVITY_TYPE = '26'

function normalizeFirstDepositDemo(row) {
  if (!row || (String(row.id) !== FIRST_DEPOSIT_DEMO_ID && row.activityName !== '首充活动')) {
    return row
  }
  return {
    ...row,
    activityName: FIRST_DEPOSIT_DEMO_NAME,
    activityType: FIRST_DEPOSIT_ACTIVITY_TYPE
  }
}

export function listActivities(query) {
  return request({
    url: '/activity/manage/list',
    method: 'get',
    params: query
  }).then(res => {
    if (Array.isArray(res && res.rows)) {
      res.rows = res.rows.map(normalizeFirstDepositDemo)
    }
    return res
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
  }).then(res => {
    if (res && res.data) {
      res.data = normalizeFirstDepositDemo(res.data)
    }
    return res
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
