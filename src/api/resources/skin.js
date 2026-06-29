import request from '@/utils/request'

// 查询皮肤列表
export function listSkin(query) {
  return request({
    url: '/resources/skin/list',
    method: 'get',
    params: query
  })
}

// 查询皮肤详细
export function getSkin(id) {
  return request({
    url: '/resources/skin/' + id,
    method: 'get'
  })
}

// 新增皮肤
export function addSkin(data) {
  return request({
    url: '/resources/skin',
    method: 'post',
    data: data
  })
}

// 修改皮肤
export function updateSkin(data) {
  return request({
    url: '/resources/skin',
    method: 'put',
    data: data
  })
}

// 删除皮肤
export function delSkin(ids) {
  return request({
    url: '/resources/skin/' + ids,
    method: 'delete'
  })
}

// 导出皮肤
export function exportSkin(query) {
  return request({
    url: '/resources/skin/export',
    method: 'get',
    params: query
  })
}
