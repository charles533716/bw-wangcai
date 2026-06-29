import request from '@/utils/request'

// 查询存款列表
export function listDeposit(query) {
  return request({
    url: '/funds/deposit/list',
    method: 'get',
    params: query
  })
}

// 查询存款详细
export function getDeposit(id) {
  return request({
    url: '/funds/deposit/' + id,
    method: 'get'
  })
}

// 生成充值单号
export function getDepositNewCode() {
  return request({
    url: '/funds/deposit/new-code',
    method: 'get'
  })
}

// 读取历史本地订单用于同步
export function getDepositSyncSource(code) {
  return request({
    url: '/funds/deposit/sync-source',
    method: 'get',
    params: { code }
  })
}

// 新增关联充值订单
export function addLinkedDeposit(data) {
  return request({
    url: '/funds/deposit/linked-order',
    method: 'post',
    data: data
  })
}

// 审核通过存款
export function approveDeposit(data) {
  return request({
    url: '/funds/deposit/approve',
    method: 'put',
    data: data
  })
}

// 审核拒绝存款
export function rejectDeposit(data) {
  return request({
    url: '/funds/deposit/reject',
    method: 'put',
    data: data
  })
}

// 更新官方备注
export function updateDepositAdminRemark(data) {
  return request({
    url: '/funds/deposit/admin-remark',
    method: 'put',
    data: data
  })
}

// 读取充值待支付失效配置
export function getDepositTimeoutConfig() {
  return request({
    url: '/funds/deposit/timeout-config',
    method: 'get'
  })
}

// 更新充值待支付失效配置
export function updateDepositTimeoutConfig(data) {
  return request({
    url: '/funds/deposit/timeout-config',
    method: 'put',
    data: data
  })
}
