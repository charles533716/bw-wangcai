import request from '@/utils/request'

// 查询站内信列表
export function listMessage(query) {
  return request({
    url: '/system/message/list',
    method: 'get',
    params: query
  })
}

// 查询站内信详细
export function getMessage(id) {
  return request({
    url: '/system/message/' + id,
    method: 'get'
  })
}

// 新增站内信
export function addMessage(data) {
  return request({
    url: '/system/message',
    method: 'post',
    data: data
  })
}

// 修改站内信
export function updateMessage(data) {
  return request({
    url: '/system/message',
    method: 'put',
    data: data
  })
}

// 删除站内信
export function delMessage(id) {
  return request({
    url: '/system/message/' + id,
    method: 'delete'
  })
}

// 导出站内信
export function exportMessage(query) {
  return request({
    url: '/system/message/export',
    method: 'post',
    data: query
  })
}

// 发送消息
export function sendMessage(id) {
  return request({
    url: '/system/message/send/' + id,
    method: 'post'
  })
}

// 撤回消息
export function recallMessage(id) {
  return request({
    url: '/system/message/recall/' + id,
    method: 'post'
  })
}
