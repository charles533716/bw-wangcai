// file name: bill.js
import request from '@/utils/request'

// 查询佣金账单列表
export function listCommissionBill(query) {
  return request({
    url: '/agent/commission/bill/list',
    method: 'get',
    params: query
  })
}

// 查询待发放佣金列表
export function listPendingCommissions() {
  return request({
    url: '/agent/commission/bill/pending/list',
    method: 'get'
  })
}

// 获取佣金账单详细
export function getCommissionBill(id) {
  return request({
    url: '/agent/commission/bill/' + id,
    method: 'get'
  })
}

// 获取账单运营费用明细
export function getCommissionBillExpenseDetail(id) {
  return request({
    url: '/agent/commission/bill/' + id + '/expense-details',
    method: 'get'
  })
}

// 生成代理佣金账单
export function generateCommissionBill(agentId) {
  return request({
    url: '/agent/commission/bill/generate/' + agentId,
    method: 'post'
  })
}

// 批量生成佣金账单
export function batchGenerateCommissionBills(agentIds) {
  return request({
    url: '/agent/commission/bill/batchGenerate',
    method: 'post',
    data: agentIds
  })
}

// 发放佣金账单
export function grantCommissionBill(id) {
  return request({
    url: '/agent/commission/bill/grant/' + id,
    method: 'post'
  })
}

// 批量发放佣金账单
export function batchGrantCommissionBills(ids) {
  return request({
    url: '/agent/commission/bill/batchGrant',
    method: 'post',
    data: ids
  })
}

// 取消佣金账单
export function cancelCommissionBill(id) {
  return request({
    url: '/agent/commission/bill/cancel/' + id,
    method: 'post'
  })
}

// 获取代理待发放佣金汇总数据
export function getPendingCommission(agentId) {
  return request({
    url: '/agent/commission/bill/pending/' + agentId,
    method: 'get'
  })
}

// 获取代理佣金统计
export function getAgentStats(agentId) {
  return request({
    url: '/agent/commission/bill/stats/' + agentId,
    method: 'get'
  })
}
