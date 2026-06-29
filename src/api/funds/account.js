import request from '@/utils/request'

// 获取人工上分原因
export function getUpReasons() {
  return request({
    url: '/funds/account/upReasons',
    method: 'get'
  })
}

// 获取人工下分原因
export function getDownReasons() {
  return request({
    url: '/funds/account/downReasons',
    method: 'get'
  })
}

// 获取会员详情
export function getMemberDetail(userName) {
  return request({
    url: '/member/user/detail/' + userName,
    method: 'get'
  })
}

// 人工上分
export function manualAddAmount(data) {
  return request({
    url: '/funds/account/manualAdd',
    method: 'post',
    data: data
  })
}

// 人工下分
export function manualSubtractAmount(data) {
  return request({
    url: '/funds/account/manualSubtract',
    method: 'post',
    data: data
  })
}

// 查询调分审核记录列表
export function listAuditRecord(query) {
  return request({
    url: '/funds/record/auditList',
    method: 'get',
    params: query
  })
}

// 审核通过
export function approveRecord(data) {
  return request({
    url: '/funds/record/approve',
    method: 'post',
    data: data
  })
}

// 审核拒绝
export function rejectRecord(data) {
  return request({
    url: '/funds/record/reject',
    method: 'post',
    data: data
  })
}

// 获取记录详情
export function getRecordDetail(id) {
  return request({
    url: '/funds/record/' + id,
    method: 'get'
  })
}

// 查询会员账户列表
export function listAccount(query) {
  return request({
    url: '/funds/account/list',
    method: 'get',
    params: query
  })
}

// 查询会员账户详细
export function getAccount(id) {
  return request({
    url: '/funds/account/' + id,
    method: 'get'
  })
}

// 新增会员账户
export function addAccount(data) {
  return request({
    url: '/funds/account',
    method: 'post',
    data: data
  })
}

// 修改会员账户
export function updateAccount(data) {
  return request({
    url: '/funds/account',
    method: 'put',
    data: data
  })
}

// 删除会员账户
export function delAccount(ids) {
  return request({
    url: '/funds/account/' + ids,
    method: 'delete'
  })
}
