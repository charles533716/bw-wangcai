import request from '@/utils/request'


// 查询代存记录列表
export function listAgentAccountrecord(query) {
  return request({
    url: '/agent/agentaccount/list',
    method: 'get',
    params: query
  })
}

// 查询代理佣金金额
export function getAgentCommission(query) {
  return request({
    url: '/agent/agentaccount/agentamount',
    method: 'get',
    params: query
  })
}

// 查询代理余额
export function getAgentBalance(query) {
  return request({
    url: '/agent/agentaccount/agentamount',
    method: 'get',
    params: query
  })
}

// 新增佣金代存记录
export function addAgentCommission(data) {
  return request({
    url: '/agent/agentaccount/agentPayAdd',
    method: 'post',
    data: data
  })
}

// 新增代理余额代存记录
export function addAgentBalance(data) {
  return request({
    url: '/agent/agentaccount/agentPayAdd',
    method: 'post',
    data: data
  })
}
