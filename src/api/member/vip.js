import request from '@/utils/request'

function normalizeRebateConfigPayload(data) {
  const payload = { ...(data || {}) }
  if (payload.rebateRate !== undefined && payload.rebateRate !== null) {
    const rate = Number(payload.rebateRate)
    if (Number.isFinite(rate)) {
      payload.rebateRate = Number((rate / 100).toFixed(4))
    }
  }
  return payload
}

// 查询会员VIP等级配置列表
export function listMemberUserVipConfig(query) {
  return request({
    url: '/vip/vipconfig/list',
    method: 'get',
    params: query
  })
}

// 新增会员VIP等级配置
export function addMemberUserVipConfig(data) {
  return request({
    url: '/vip/vipconfig',
    method: 'post',
    data: data
  })
}

// 修改会员VIP等级配置
export function updateMemberUserVipConfig(data) {
  return request({
    url: '/vip/vipconfig',
    method: 'put',
    data: data
  })
}

// 查询返水比例配置列表
export function listMemberUserVipRebateConfig(query) {
  return request({
    url: '/vip/rebateconfig/list',
    method: 'get',
    params: query
  })
}

// 新增返水比例配置
export function addMemberUserVipRebateConfig(data) {
  return request({
    url: '/vip/rebateconfig',
    method: 'post',
    data: normalizeRebateConfigPayload(data)
  })
}

// 修改返水比例配置
export function updateMemberUserVipRebateConfig(data) {
  return request({
    url: '/vip/rebateconfig',
    method: 'put',
    data: normalizeRebateConfigPayload(data)
  })
}
