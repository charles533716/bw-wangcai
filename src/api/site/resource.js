import request from '@/utils/request'

// 查询站点资源列表
export function listSiteResource(query) {
  return request({
    url: '/site/resource/list',
    method: 'get',
    params: query
  })
}

// 查询站点资源详细
export function getSiteResource(id) {
  return request({
    url: '/site/resource/' + id,
    method: 'get'
  })
}

// 新增站点资源
export function addSiteResource(data) {
  return request({
    url: '/site/resource',
    method: 'post',
    data: data
  })
}

// 修改站点资源
export function updateSiteResource(data) {
  return request({
    url: '/site/resource',
    method: 'put',
    data: data
  })
}

// 删除站点资源
export function delSiteResource(id) {
  return request({
    url: '/site/resource/' + id,
    method: 'delete'
  })
}

// 导出站点资源
export function exportSiteResource(query) {
  return request({
    url: '/site/resource/export',
    method: 'post',
    params: query
  })
}

// 根据站点编码和平台类型查询资源
export function getResourcesBySiteAndPlatform(siteCode, platType) {
  return request({
    url: '/site/resource/getBySiteAndPlatform',
    method: 'get',
    params: {
      siteCode: siteCode,
      platType: platType
    }
  })
}
