import request from '@/utils/request'

// 查询站内信模板列表
export function listTemplate(query) {
  return request({
    url: '/resources/messageTemplate/list',
    method: 'get',
    params: query
  })
}

// 查询站内信模板详细
export function getTemplate(id) {
  return request({
    url: '/resources/messageTemplate/' + id,
    method: 'get'
  })
}

// 新增站内信模板
export function addTemplate(data) {
  return request({
    url: '/resources/messageTemplate',
    method: 'post',
    data: data
  })
}

// 修改站内信模板
export function updateTemplate(data) {
  return request({
    url: '/resources/messageTemplate',
    method: 'put',
    data: data
  })
}

// 删除站内信模板
export function delTemplate(ids) {
  return request({
    url: '/resources/messageTemplate/' + ids,
    method: 'delete'
  })
}

// 授权站点
export function authSites(data) {
  return request({
    url: '/resources/messageTemplate/authSites',
    method: 'put',
    data: data
  })
}

// 回收站点授权
export function revokeSiteAuth(templateId, siteCode) {
  return request({
    url: '/resources/messageTemplate/revokeSiteAuth/' + templateId + '/' + siteCode,
    method: 'delete'
  })
}

// 查询已授权站点
export function getAuthSites(templateId) {
  return request({
    url: '/resources/messageTemplate/authSites/' + templateId,
    method: 'get'
  })
}

// 查询已授权站点详情
export function getAuthSiteDetail(templateId) {
  return request({
    url: '/resources/messageTemplate/siteDetail/' + templateId,
    method: 'get'
  })
}
