import request from '@/utils/request'

// 查询App版本配置列表
export function listAppVersion(query) {
  return request({
    url: '/resources/appVersion/list',
    method: 'get',
    params: query
  })
}

// 查询App版本配置详细
export function getAppVersion(id) {
  return request({
    url: '/resources/appVersion/' + id,
    method: 'get'
  })
}

// 新增App版本配置
export function addAppVersion(data) {
  return request({
    url: '/resources/appVersion',
    method: 'post',
    data: data
  })
}

// 修改App版本配置
export function updateAppVersion(data) {
  return request({
    url: '/resources/appVersion',
    method: 'put',
    data: data
  })
}

// 删除App版本配置
export function delAppVersion(ids) {
  return request({
    url: '/resources/appVersion/' + ids,
    method: 'delete'
  })
}

// 生成安卓APK OSS直传签名
export function getApkDirectUploadSign(data) {
  return request({
    url: '/resources/appVersion/apk/direct-upload/sign',
    method: 'post',
    data: data
  })
}

// 删除未保存或已替换的安卓APK
export function deleteApkObject(data) {
  return request({
    url: '/resources/appVersion/apk/delete',
    method: 'post',
    data: data
  })
}
