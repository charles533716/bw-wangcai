import request from '@/utils/request'

export function listVenue() {
  return request({
    url: '/bet/records/listVenue',
    method: 'get'
  })
}

// 查询【请填写功能名称】列表
export function list(query) {
  return request({
    url: '/bet/records/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function get(id) {
  return request({
    url: '/bet/records/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function add(data) {
  return request({
    url: '/bet/records',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function update(data) {
  return request({
    url: '/bet/records',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function del(id) {
  return request({
    url: '/bet/records/' + id,
    method: 'delete'
  })
}
