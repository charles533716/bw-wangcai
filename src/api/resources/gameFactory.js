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

export function listGameFactory(query) {
  const pageNum = query && query.pageNum ? query.pageNum : 1
  const pageSize = query && query.pageSize ? query.pageSize : 10
  const data = Object.assign({}, query)
  delete data.pageNum
  delete data.pageSize
  return request({
    url: '/api/admin/game/getGameFactoryList',
    method: 'post',
    params: { pageNum, pageSize },
    data
  })
}

export function getGameFactory(id) {
  return request({
    url: '/api/admin/game/getGameFactoryInfo',
    method: 'post',
    params: { id }
  })
}

export function addGameFactory(data) {
  return request({
    url: '/api/admin/game/addGameFactory',
    method: 'post',
    data
  })
}

export function updateGameFactory(data) {
  return request({
    url: '/api/admin/game/updateGameFactory',
    method: 'post',
    data
  })
}

export function delGameFactory(ids) {
  return request({
    url: '/api/admin/game/deleteGameFactory',
    method: 'post',
    data: normalizeIds(ids)
  })
}
