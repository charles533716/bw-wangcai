import request from '@/utils/request'

export function getFinanceCenterPanel(params) {
  return request({
    url: '/funds/fundpool/center/panel',
    method: 'get',
    params
  })
}

export function getFinanceCenterRecords(params) {
  return request({
    url: '/funds/fundpool/center/records',
    method: 'get',
    params
  })
}

export function getFinanceCenterRecordDetail(params) {
  return request({
    url: '/funds/fundpool/center/records/detail',
    method: 'get',
    params
  })
}
