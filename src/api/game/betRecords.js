import request from '@/utils/request'

// 查询投注记录列表
export function listBetRecords(query) {
  return request({
    url: '/bet/records/list',
    method: 'get',
    params: query
  })
}

// 查询投注记录汇总
export function summaryBetRecords(query) {
  return request({
    url: '/bet/records/summary',
    method: 'get',
    params: query
  })
}

// 查询投注记录详细
export function getBetRecords(id) {
  return request({
    url: '/bet/records/' + id,
    method: 'get'
  })
}

// 新增投注记录
export function addBetRecords(data) {
  return request({
    url: '/bet/records',
    method: 'post',
    data: data
  })
}

// 修改投注记录
export function updateBetRecords(data) {
  return request({
    url: '/bet/records',
    method: 'put',
    data: data
  })
}

// 删除投注记录
export function delBetRecords(id) {
  return request({
    url: '/bet/records/' + id,
    method: 'delete'
  })
}

// 导出投注记录
export function exportBetRecords(query) {
  return request({
    url: '/bet/records/export',
    method: 'get',
    params: query
  })
}

// 同步投注记录
export function syncBetRecords(venueCode, currency, startTime, endTime) {
  return request({
    url: '/bet/records/sync',
    method: 'post',
    params: {
      venueCode,
      currency,
      startTime,
      endTime
    }
  })
}

// 根据三方注单号查询
export function getBetRecordsByGeneratedId(generatedId) {
  return request({
    url: '/bet/records/byGeneratedId/' + generatedId,
    method: 'get'
  })
}
