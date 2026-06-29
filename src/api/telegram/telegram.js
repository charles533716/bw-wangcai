import request from '@/utils/request'

// 查询Telegram机器人管理配置列表
export function listTelegram(query) {
  return request({
    url: '/telegram/config/list',
    method: 'get',
    params: query
  })
}

// 查询Telegram机器人管理配置详细
export function getTelegram(id) {
  return request({
    url: '/telegram/config/' + id,
    method: 'get'
  })
}

// 新增Telegram机器人管理配置
export function addTelegram(data) {
  return request({
    url: '/telegram/config',
    method: 'post',
    data: data
  })
}

// 修改Telegram机器人管理配置
export function updateTelegram(data) {
  return request({
    url: '/telegram/config',
    method: 'put',
    data: data
  })
}

// 删除Telegram机器人管理配置
export function delTelegram(id) {
  return request({
    url: '/telegram/config/' + id,
    method: 'delete'
  })
}

// 导出Telegram机器人管理配置
export function exportTelegram(query) {
  return request({
    url: '/telegram/config/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
