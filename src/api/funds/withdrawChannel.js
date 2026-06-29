import request from '@/utils/request'

// 查询取款通道列表
export function listWithdrawChannel(query) {
  return request({
    url: '/funds/withdrawChannel/list',
    method: 'get',
    params: query
  })
}

// 查询取款通道详细
export function getWithdrawChannel(id) {
  return request({
    url: '/funds/withdrawChannel/' + id,
    method: 'get'
  })
}

// 新增取款通道
export function addWithdrawChannel(data) {
  return request({
    url: '/funds/withdrawChannel',
    method: 'post',
    data: data
  })
}

// 修改取款通道
export function updateWithdrawChannel(data) {
  return request({
    url: '/funds/withdrawChannel',
    method: 'put',
    data: data
  })
}

// 删除取款通道
export function delWithdrawChannel(ids) {
  return request({
    url: '/funds/withdrawChannel/' + ids,
    method: 'delete'
  })
}
