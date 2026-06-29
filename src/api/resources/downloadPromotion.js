import request from '@/utils/request'

// 查询下载与推广链接列表
export function listDownloadPromotion(query) {
  return request({
    url: '/resources/downloadPromotion/list',
    method: 'get',
    params: query
  })
}
