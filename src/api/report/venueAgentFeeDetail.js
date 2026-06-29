import request from '@/utils/request'
import {
  getMockVenueAgentFeeDetail,
  isMasterVenueMockEnabled,
  listMockVenueAgentFeeDetail,
  mockExportBlob
} from '@/mock/masterVenue'

// 查询三方场馆代理费用明细
export function listVenueAgentFeeDetail(query) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', ...listMockVenueAgentFeeDetail(query) })
  }
  return request({
    url: '/venue/agentFeeDetail/list',
    method: 'get',
    params: query
  })
}

// 查询三方场馆代理费用弹窗明细
export function getVenueAgentFeeDetail(query) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', data: getMockVenueAgentFeeDetail(query) })
  }
  return request({
    url: '/venue/agentFeeDetail/detail',
    method: 'get',
    params: query
  })
}

// 导出三方场馆代理费用明细
export function exportVenueAgentFeeDetail(data) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve(mockExportBlob('三方场馆代理费用明细'))
  }
  return request({
    url: '/venue/agentFeeDetail/export',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}
