import request from '@/utils/request'


// 获取用户风控记录列表
export function listUserRiskRecord(data) {
  return request({
    url: '/api/admin/risk/getUserRiskRecordList',
    method: 'post',
    data
  })
}

// 获取用户风控记录详情
export function getUserRiskRecordInfo(id) {
  return request({
    url: '/api/admin/risk/getUserRiskRecordInfo',
    method: 'post',
    params: { id }
  })
}

// 获取会员黑名单列表
export function listMemberBlacklist(data) {
  return request({
    url: '/api/admin/risk/getMemberBlacklistList',
    method: 'post',
    data
  })
}
