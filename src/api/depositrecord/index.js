import request from '@/utils/request'

export function listVenue() {
  return request({
    url: '/funds/record/listVenue',
    method: 'get'
  })
}


export function dictListData(query) {
  return request({
    url: '/funds/record/sysdictlist',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】列表
export function list(query) {
  return request({
    url: '/funds/record/list',
    method: 'get',
    params: query
  })
}

export function total(query) {
  return request({
    url: '/funds/record/total',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function get(id) {
  return request({
    url: '/funds/record/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function add(data) {
  return request({
    url: '/funds/record',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function update(data) {
  return request({
    url: '/funds/record',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function del(id) {
  return request({
    url: '/funds/record/' + id,
    method: 'delete'
  })
}
