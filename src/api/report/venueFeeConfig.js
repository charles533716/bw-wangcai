import request from '@/utils/request'
import {
  getMockVenueFeeConfig,
  isMasterVenueMockEnabled,
  updateMockVenueFeeConfig
} from '@/mock/masterVenue'

// 查询三方场馆手续费站点配置
export function getVenueFeeConfig(siteCode) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', data: getMockVenueFeeConfig(siteCode) })
  }
  return request({
    url: '/venue/feeConfig/site',
    method: 'get',
    params: { siteCode }
  })
}

// 保存三方场馆手续费站点配置
export function updateVenueFeeConfig(siteCode, data) {
  if (isMasterVenueMockEnabled()) {
    return Promise.resolve({ code: 200, msg: '操作成功', data: updateMockVenueFeeConfig(siteCode, data) })
  }
  return request({
    url: '/venue/feeConfig/site',
    method: 'put',
    params: { siteCode },
    data: data
  })
}
