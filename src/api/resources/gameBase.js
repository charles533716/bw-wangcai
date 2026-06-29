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

export function listGameBase(query) {
  const pageNum = query && query.pageNum ? query.pageNum : 1
  const pageSize = query && query.pageSize ? query.pageSize : 10
  const data = Object.assign({}, query)
  delete data.pageNum
  delete data.pageSize
  return request({
    url: '/api/admin/game/getGameBaseList',
    method: 'post',
    params: { pageNum, pageSize },
    data
  })
}

export function getGameBase(id) {
  return request({
    url: '/api/admin/game/getGameBaseInfo',
    method: 'post',
    params: { id }
  })
}

export function addGameBase(data) {
  return request({
    url: '/api/admin/game/addGameBase',
    method: 'post',
    data
  })
}

export function updateGameBase(data) {
  return request({
    url: '/api/admin/game/updateGameBase',
    method: 'post',
    data
  })
}

export function delGameBase(ids) {
  return request({
    url: '/api/admin/game/deleteGameBase',
    method: 'post',
    data: normalizeIds(ids)
  })
}
