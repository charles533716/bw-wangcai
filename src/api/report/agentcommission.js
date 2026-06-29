import request from '@/utils/request'

// 待结算列表
export function listPendingAgentCommission(query) {
  return request({
    url: '/report/agentcommission/pending/list',
    method: 'get',
    params: query
  })
}

// 待结算汇总
export function summaryPendingAgentCommission(query) {
  return request({
    url: '/report/agentcommission/pending/summary',
    method: 'get',
    params: query
  })
}

// 执行结算
export function settlePendingAgentCommission(id) {
  return request({
    url: `/report/agentcommission/pending/settle/${id}`,
    method: 'post'
  })
}

// 已结算历史列表
export function listHistoryAgentCommission(query) {
  return request({
    url: '/report/agentcommission/history/list',
    method: 'get',
    params: query
  })
}

// 已结算历史汇总
export function summaryHistoryAgentCommission(query) {
  return request({
    url: '/report/agentcommission/history/summary',
    method: 'get',
    params: query
  })
}
