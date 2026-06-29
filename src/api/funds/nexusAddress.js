import request from '@/utils/request'

const baseUrl = '/funds/nexus/address'

// 查询NEXUS地址列表
export function listNexusAddress(query) {
  return request({
    url: baseUrl + '/list',
    method: 'get',
    params: query
  })
}

// 查询NEXUS地址统计
export function getNexusAddressStats(query) {
  return request({
    url: baseUrl + '/stats',
    method: 'get',
    params: query
  })
}

// 查询NEXUS地址详情
export function getNexusAddress(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'get'
  })
}

// 批量导入NEXUS地址
export function importNexusAddress(data) {
  return request({
    url: baseUrl + '/import',
    method: 'post',
    data: data
  })
}

// 修改NEXUS地址元数据
export function updateNexusAddress(data) {
  return request({
    url: baseUrl,
    method: 'put',
    data: data
  })
}

// 启用NEXUS地址
export function enableNexusAddress(id) {
  return request({
    url: baseUrl + '/' + id + '/enable',
    method: 'put'
  })
}

// 禁用NEXUS地址
export function disableNexusAddress(id) {
  return request({
    url: baseUrl + '/' + id + '/disable',
    method: 'put'
  })
}

// 手动释放NEXUS地址
export function releaseNexusAddress(id) {
  return request({
    url: baseUrl + '/' + id + '/release',
    method: 'post'
  })
}

// 删除NEXUS地址
export function delNexusAddress(ids) {
  return request({
    url: baseUrl + '/' + ids,
    method: 'delete'
  })
}
