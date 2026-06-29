import request from '@/utils/request'

export function getGlobalOperationExpenseSettings() {
  return request({
    url: '/funds/operation-expense/global',
    method: 'get'
  })
}

export function updateGlobalOperationExpenseSettings(data) {
  return request({
    url: '/funds/operation-expense/global',
    method: 'put',
    data: data
  })
}
