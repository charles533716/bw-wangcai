import request from '@/utils/request'

// 查询游戏场馆报表列表
export function listGameVenueReport(query) {
  return request({
    url: '/game/venueReport/list',
    method: 'get',
    params: query
  })
}

// 导出游戏场馆报表
export function exportGameVenueReport(query) {
  return request({
    url: '/game/venueReport/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}
