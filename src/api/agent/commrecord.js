// agent/commission.js
import request from '@/utils/request'

// 查询佣金记录列表
export function listCommissionRecord(query) {
  return request({
    url: '/agent/commrecord/list',
    method: 'get',
    params: query
  })
}

// 查询待发放佣金列表（发放页面专用）
export function listGrantCommission(query) {
  return request({
    url: '/agent/commrecord/grant/list',
    method: 'get',
    params: {
      ...query,
      status: '1' // 固定查询待发放状态
    }
  })
}

// 获取佣金记录详情
export function getCommissionRecord(id) {
  return request({
    url: '/agent/commrecord/' + id,
    method: 'get'
  })
}

// 发放单条佣金
export function grantCommission(id) {
  return request({
    url: '/agent/commrecord/grant/' + id,
    method: 'post'
  })
}

// 批量发放佣金
export function batchGrantCommission(ids) {
  return request({
    url: '/agent/commrecord/batchGrant',
    method: 'post',
    data: ids
  })
}

// 重新计算佣金
export function recalculateCommission(id) {
  return request({
    url: '/agent/commrecord/recalculate/' + id,
    method: 'post'
  })
}

// 导出佣金记录
export function exportCommissionRecord(query) {
  return request({
    url: '/agent/commrecord/export',
    method: 'post',
    params: query
  })
}

// 查询佣金方案列表
export function listCommission(commType) {
  return request({
    url: '/agent/commission/list',
    method: 'get',
    params: { commType }
  })
}

// 查询代理统计数据
export function getAgentStats(agentId, startDate, endDate) {
  return request({
    url: '/agent/commrecord/stats/' + agentId,
    method: 'get',
    params: { startDate, endDate }
  })
}

// 自动计算所有佣金
export function autoCalculateCommissions(commissionDate) {
  return request({
    url: '/agent/commrecord/calculate',
    method: 'post',
    data: { commissionDate }
  })
}

// 查询佣金汇总
export function getCommissionSummary(query) {
  return request({
    url: '/agent/commrecord/summary',
    method: 'get',
    params: query
  })
}

// 查询当前代理游戏账号标识，演示版由 mock 返回固定数据
export function getGameAgentId(query) {
  return request({
    url: '/agent/commrecord/gameAgentId',
    method: 'get',
    params: query
  })
}
