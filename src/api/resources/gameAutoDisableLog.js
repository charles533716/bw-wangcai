import request from '@/utils/request'
import { getResourceCatalogPage, getResourceCatalogRecord } from '@/mock/resourceCatalog'

function cleanParams(params) {
  const result = {}
  Object.keys(params || {}).forEach(key => {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value
    }
  })
  return result
}

function buildListRequest(query) {
  const data = Object.assign({}, query)
  const pageNum = data.pageNum || 1
  const pageSize = data.pageSize || 10
  delete data.pageNum
  delete data.pageSize
  return {
    params: { pageNum, pageSize },
    data: cleanParams(data)
  }
}

export function listGameAutoDisableLog(query) {
  const prototypeResponse = getResourceCatalogPage('/resources/gameAutoDisableLog', query)
  if (prototypeResponse) return prototypeResponse

  const { params, data } = buildListRequest(query)
  return request({
    url: '/api/admin/game/autoDisableLog/list',
    method: 'post',
    params,
    data
  })
}

export function getGameAutoDisableLog(id) {
  const prototypeResponse = getResourceCatalogRecord('/resources/gameAutoDisableLog', id)
  if (prototypeResponse) return prototypeResponse

  return request({
    url: '/api/admin/game/autoDisableLog/detail',
    method: 'post',
    params: { id }
  })
}
