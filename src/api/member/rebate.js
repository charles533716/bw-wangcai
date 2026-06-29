import request from '@/utils/request'

// 查询返水设置列表
export function listRebateConfig(query) {
  return request({
    url: '/member/rebate/list',
    method: 'get',
    params: query
  })
}

// 查询返水设置详细
export function getRebateConfig(id) {
  return request({
    url: '/member/rebate/' + id,
    method: 'get'
  })
}

// 新增返水设置
export function addRebateConfig(data) {
  return request({
    url: '/member/rebate',
    method: 'post',
    data: data
  })
}

// 修改返水设置
export function updateRebateConfig(data) {
  return request({
    url: '/member/rebate',
    method: 'put',
    data: data
  })
}

// 删除返水设置
export function delRebateConfig(id) {
  return request({
    url: '/member/rebate/' + id,
    method: 'delete'
  })
}

// 导出返水设置
export function exportRebateConfig(query) {
  return request({
    url: '/member/rebate/export',
    method: 'post',
    data: query
  })
}

// 修改状态
export function changeStatus(id, status) {
  const data = {
    id,
    isActive: status
  }
  return request({
    url: '/member/rebate/changeStatus',
    method: 'put',
    data: data
  })
}
