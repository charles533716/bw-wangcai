import request from '@/utils/request'

// 查询礼金统计报表列表
export function listBonusReport(query) {
  return request({
    url: '/vip/bonus/list',
    method: 'get',
    params: query
  })
}

// 查询礼金统计汇总
export function getBonusReportSummary(query) {
  return request({
    url: '/vip/bonus/summary',
    method: 'get',
    params: query
  })
}

// 导出礼金统计报表
export function exportBonusReport(query) {
  return request({
    url: '/vip/bonus/export',
    method: 'post',
    params: query
  })
}
