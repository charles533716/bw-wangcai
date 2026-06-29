import request from '@/utils/request'

// 查询场馆列表
export function listVenue(query) {
  return request({
    url: '/venue/list',
    method: 'get',
    params: query
  })
}

export function venueList() {
  return request({
    url: '/venue/listVenue',
    method: 'get'
  })
}

// 查询场馆详细
export function getVenue(id) {
  return request({
    url: '/venue/' + id,
    method: 'get'
  })
}

// 新增场馆
export function addVenue(data) {
  return request({
    url: '/venue',
    method: 'post',
    data: data
  })
}

// 修改场馆
export function updateVenue(data) {
  return request({
    url: '/venue',
    method: 'put',
    data: data
  })
}

// 删除场馆
export function delVenue(id) {
  return request({
    url: '/venue/' + id,
    method: 'delete'
  })
}

// 导出场馆
export function exportVenue(query) {
  return request({
    url: '/venue/export',
    method: 'get',
    params: query
  })
}

// 校验场馆编码是否唯一
export function checkVenueCodeUnique(code, id) {
  return request({
    url: '/venue/checkCodeUnique',
    method: 'get',
    params: {
      code: code,
      id: id || ''
    }
  })
}
