import request from '@/utils/request'

// 查询账变记录列表
export function listMemberChangeRecord(query) {
  return request({
    url: '/report/memberchangerecord/list',
    method: 'get',
    params: query
  })
}

// 查询账变记录汇总
export function summaryMemberChangeRecord(query) {
  return request({
    url: '/report/memberchangerecord/summary',
    method: 'get',
    params: query
  })
}

// 查询总站下拉选项
export function listMemberChangeMainSites() {
  return request({
    url: '/report/memberchangerecord/mainsites',
    method: 'get'
  })
}
