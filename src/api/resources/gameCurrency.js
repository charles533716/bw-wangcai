import request from '@/utils/request'

function normalizeIds(ids) {
  if (Array.isArray(ids)) {
    return ids.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0)
  }
  if (typeof ids === 'string') {
    return ids.split(',').map(id => Number(id.trim())).filter(id => Number.isInteger(id) && id > 0)
  }
  if (Number.isInteger(ids) && ids > 0) {
    return [ids]
  }
  return []
}

export function listGameCurrency(query) {
  const pageNum = query && query.pageNum ? query.pageNum : 1
  const pageSize = query && query.pageSize ? query.pageSize : 10
  const data = Object.assign({}, query)
  delete data.pageNum
  delete data.pageSize
  return request({
    url: '/api/admin/game/getGameCurrencyList',
    method: 'post',
    params: { pageNum, pageSize },
    data
  })
}

export function getGameCurrency(id) {
  return request({
    url: '/api/admin/game/getGameCurrencyInfo',
    method: 'post',
    params: { id }
  })
}

export function addGameCurrency(data) {
  return request({
    url: '/api/admin/game/addGameCurrency',
    method: 'post',
    data
  })
}

export function updateGameCurrency(data) {
  return request({
    url: '/api/admin/game/updateGameCurrency',
    method: 'post',
    data
  })
}

export function delGameCurrency(ids) {
  return request({
    url: '/api/admin/game/deleteGameCurrency',
    method: 'post',
    data: normalizeIds(ids)
  })
}
