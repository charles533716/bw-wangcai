import request from '@/utils/request'

// 查询取款列表
export function listWithdraw(query) {
  return request({
    url: '/funds/withdraw/list',
    method: 'get',
    params: query
  })
}

// 查询取款详细
export function getWithdraw(id) {
  return request({
    url: '/funds/withdraw/' + id,
    method: 'get'
  })
}

// 按需查询取款审核查看弹窗统计项
export function getWithdrawMetrics(data) {
  return request({
    url: '/funds/withdraw/metrics',
    method: 'post',
    data: data
  })
}

// 审核通过取款
export function approveWithdraw(data) {
  return request({
    url: '/funds/withdraw/approve',
    method: 'put',
    data: data
  })
}

// 审核拒绝取款
export function rejectWithdraw(data) {
  return request({
    url: '/funds/withdraw/reject',
    method: 'put',
    data: data
  })
}

// 冻结取款平台状态
export function freezeWithdraw(data) {
  return request({
    url: '/funds/withdraw/freeze',
    method: 'put',
    data: data
  })
}

// 重新发起取款代付
export function resubmitWithdraw(data) {
  return request({
    url: '/funds/withdraw/resubmit',
    method: 'put',
    data: data
  })
}

// 失败/拒绝单平台拒绝
export function platformRejectWithdraw(data) {
  return request({
    url: '/funds/withdraw/platform-reject',
    method: 'put',
    data: data
  })
}

// 失败/拒绝单平台审核通过
export function platformPassWithdraw(data) {
  return request({
    url: '/funds/withdraw/platform-pass',
    method: 'put',
    data: data
  })
}

// 开始转账
export function transferWithdraw(data) {
  return request({
    url: '/funds/withdraw/transfer',
    method: 'put',
    data: data
  })
}

// 完成转账
export function completeWithdraw(data) {
  return request({
    url: '/funds/withdraw/complete',
    method: 'put',
    data: data
  })
}
