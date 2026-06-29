import request from '@/utils/request'
// 查询游戏报表列表
export function listGameReport(query) {
  return request({
    url: '/game/report/list',
    method: 'get',
    params: query
  })
}

// 查询游戏报表总计
export function getGameReportTotal(query) {
  return request({
    url: '/game/report/total',
    method: 'get',
    params: query
  })
}

// 导出游戏报表
export function exportGameReport(query) {
  return request({
    url: '/game/report/export',
    method: 'get',
    params: query
  })
}
