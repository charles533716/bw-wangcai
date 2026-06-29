import request from '@/utils/request'

// 查询意见反馈列表
export function listFeedback(query) {
  return request({
    url: '/system/feedback/list',
    method: 'get',
    params: query
  })
}

// 查询意见反馈统计
export function getFeedbackStats(query) {
  return request({
    url: '/system/feedback/stats',
    method: 'get',
    params: query
  })
}

// 查询意见反馈详细
export function getFeedback(feedbackId) {
  return request({
    url: '/system/feedback/' + feedbackId,
    method: 'get'
  })
}

// 回复意见反馈
export function replyFeedback(feedbackId, data) {
  return request({
    url: '/system/feedback/' + feedbackId + '/reply',
    method: 'post',
    data: data
  })
}

// 撤销回复并恢复为待处理
export function reopenFeedback(feedbackId, data) {
  return request({
    url: '/system/feedback/' + feedbackId + '/reopen',
    method: 'put',
    data: data
  })
}

// 查询快捷回复模板
export function listFeedbackTemplates(query) {
  return request({
    url: '/system/feedback/templates',
    method: 'get',
    params: query
  })
}

// 新增当前账号快捷回复模板
export function addFeedbackTemplate(data) {
  return request({
    url: '/system/feedback/templates',
    method: 'post',
    data: data
  })
}

// 修改当前账号快捷回复模板
export function updateFeedbackTemplate(data) {
  return request({
    url: '/system/feedback/templates',
    method: 'put',
    data: data
  })
}

// 删除当前账号快捷回复模板
export function deleteFeedbackTemplate(templateId) {
  return request({
    url: '/system/feedback/templates/' + templateId,
    method: 'delete'
  })
}

// 导出意见反馈
export function exportFeedback(query) {
  return request({
    url: '/system/feedback/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
