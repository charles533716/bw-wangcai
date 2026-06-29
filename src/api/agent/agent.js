// agent.js (前端API)
import request from '@/utils/request'

// 获取当前登录用户的代理信息
export function getCurrentUserAgentInfo(username) {
  return request({
    url: '/member/agent/currentUserInfo/' + username,
    method: 'get'
  })
}

// 获取当前站点返佣比例
export function getSiteProfitShareRate() {
  return request({
    url: '/member/agent/siteProfitShareRate',
    method: 'get'
  })
}

// 查询代理列表
export function listAgent(query) {
  return request({
    url: '/member/agent/list',
    method: 'get',
    params: query
  })
}

// 查询代理详细
export function getAgent(id) {
  return request({
    url: '/member/agent/' + id,
    method: 'get'
  })
}

// 新增代理
export function addAgent(data) {
  return request({
    url: '/member/agent',
    method: 'post',
    data: data
  })
}

// 修改代理
export function updateAgent(data) {
  return request({
    url: '/member/agent',
    method: 'put',
    data: data
  })
}

// 删除代理
export function delAgent(id) {
  return request({
    url: '/member/agent/' + id,
    method: 'delete'
  })
}

// 导出代理
export function exportAgent(query) {
  return request({
    url: '/member/agent/export',
    method: 'post',
    params: query
  })
}

// 修改代理状态
export function changeAgentStatus(data) {
  return request({
    url: '/member/agent/changeStatus',
    method: 'put',
    data: data
  })
}

// 重置代理密码
export function resetAgentPwd(data) {
  return request({
    url: '/member/agent/resetPwd',
    method: 'put',
    data: data
  })
}

// 查询代理下拉列表
export function listAgentForSelect() {
  return request({
    url: '/member/agent/listForSelect',
    method: 'get'
  })
}

// 查询下属代理
export function listSubAgents(parentId, query) {
  return request({
    url: '/member/agent/subAgents/' + parentId,
    method: 'get',
    params: query
  })
}

// 查询下属会员
export function listSubMembers(parentId, query) {
  return request({
    url: '/member/agent/subMembers/' + parentId,
    method: 'get',
    params: query
  })
}
