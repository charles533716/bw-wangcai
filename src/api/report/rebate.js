import request from '@/utils/request'

// 查询会员投注返水报表列表
export function listRebateReport(query) {
  return request({
    url: '/vip/rebate/report/list',
    method: 'get',
    params: query
  })
}
