import request from '@/utils/request'

// 查询支付通道列表
export function listPayChannel(query) {
  return request({
    url: '/funds/payChannel/list',
    method: 'get',
    params: query
  })
}

// 查询支付通道详细
export function getPayChannel(id) {
  return request({
    url: '/funds/payChannel/' + id,
    method: 'get'
  })
}

// 新增支付通道
export function addPayChannel(data) {
  return request({
    url: '/funds/payChannel/add',
    method: 'post',
    data: data
  })
}

// 修改支付通道
export function updatePayChannel(data) {
  return request({
    url: '/funds/payChannel/edit',
    method: 'post',
    data: data
  })
}

// 删除支付通道
export function delPayChannel(ids) {
  return request({
    url: '/funds/payChannel/remove',
   method: 'post',
      data: `ids=${ids}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
  })
}

// 获取数据字典
export function getDicts(dictType) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}
