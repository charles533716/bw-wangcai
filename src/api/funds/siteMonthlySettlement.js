import request from '@/utils/request'
import {
  getMockSiteMonthlySettlementSummary,
  isMasterVenueMockEnabled,
  listMockSiteMonthlySettlement,
  settleMockSiteMonthlySettlement
} from '@/mock/masterVenue'

export function listPendingSiteMonthlySettlement(query) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', ...listMockSiteMonthlySettlement(query, false) })
  }
  return request({
    url: '/funds/siteMonthlySettlement/pending',
    method: 'get',
    params: query
  })
}

export function listHistorySiteMonthlySettlement(query) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', ...listMockSiteMonthlySettlement(query, true) })
  }
  return request({
    url: '/funds/siteMonthlySettlement/history',
    method: 'get',
    params: query
  })
}

export function getSiteMonthlySettlementSummary(query) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', data: getMockSiteMonthlySettlementSummary(query) })
  }
  return request({
    url: '/funds/siteMonthlySettlement/summary',
    method: 'get',
    params: query
  })
}

export function autoSettleSiteMonthlySettlement(id) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', data: settleMockSiteMonthlySettlement(id, 'auto') })
  }
  return request({
    url: `/funds/siteMonthlySettlement/${id}/auto`,
    method: 'post'
  })
}

export function manualSettleSiteMonthlySettlement(id) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', data: settleMockSiteMonthlySettlement(id, 'manual') })
  }
  return request({
    url: `/funds/siteMonthlySettlement/${id}/manual`,
    method: 'post'
  })
}
