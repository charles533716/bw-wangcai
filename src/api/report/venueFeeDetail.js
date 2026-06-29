import request from '@/utils/request'
import {
  isMasterVenueMockEnabled,
  listMockVenueFeeDetail,
  mockExportBlob,
  saveMockVenueFeeOfficial
} from '@/mock/masterVenue'

// 查询三方场馆费用明细
export function listVenueFeeDetail(query) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', data: listMockVenueFeeDetail(query) })
  }
  return request({
    url: '/venue/feeDetail/list',
    method: 'get',
    params: query
  })
}

// 保存真实三方场馆费用
export function saveVenueFeeOfficial(data) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', data: saveMockVenueFeeOfficial(data) })
  }
  return request({
    url: '/venue/feeDetail/official',
    method: 'put',
    data: data
  })
}

// 导出三方场馆费用明细
export function exportVenueFeeDetail(data) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve(mockExportBlob('三方场馆费用明细'))
  }
  return request({
    url: '/venue/feeDetail/export',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}
