import request from '@/utils/request'

// 查询会员报表列表
export function listMemberReport(query) {
  return request({
    url: '/report/member/list',
    method: 'get',
    params: query
  })
}

// 导出会员报表
export function exportMemberReport(query) {
  return request({
    url: '/report/member/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}
