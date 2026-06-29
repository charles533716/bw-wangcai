import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listIncome(query) {
  return request({
    url: '/agentfunds/record/listIncome',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getCommissionAmount() {
  return request({
    url: '/agentfunds/record/commissionAmount',
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addRecord(data) {
  return request({
    url: '/agentfunds/record',
    method: 'post',
    data: data
  })
}
