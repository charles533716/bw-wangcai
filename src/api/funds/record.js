import request from '@/utils/request'

export function listRecord(query) {
  return request({
    url: '/funds/record/list',
    method: 'get',
    params: query
  })
}

export function totalRecord(query) {
  return request({
    url: '/funds/record/total',
    method: 'get',
    params: query
  })
}

export function summaryRecord(query) {
  return request({
    url: '/funds/record/summary',
    method: 'get',
    params: query
  })
}

// 导出账户记录
export function exportRecord(query) {
  return request({
    url: '/funds/record/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}
