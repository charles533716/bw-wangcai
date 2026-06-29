import request from '@/utils/request'

// 查询站点发布列表
export function listSitePublish(query) {
  return request({
    url: '/site/publish/list',
    method: 'get',
    params: query
  })
}

// 查询站点发布详细
export function getSitePublish(id) {
  return request({
    url: '/site/publish/' + id,
    method: 'get'
  })
}

// 新增站点发布
export function addSitePublish(data) {
  return request({
    url: '/site/publish',
    method: 'post',
    data: data
  })
}

// 删除站点发布
export function delSitePublish(id) {
  return request({
    url: '/site/publish/' + id,
    method: 'delete'
  })
}

// 获取可发布的站点列表
export function getPublishableSites() {
  return request({
    url: '/site/publish/publishableSites',
    method: 'get'
  })
}
