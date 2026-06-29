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

export function listGameLine(query) {
  const pageNum = query && query.pageNum ? query.pageNum : 1
  const pageSize = query && query.pageSize ? query.pageSize : 10
  const data = Object.assign({}, query)
  delete data.pageNum
  delete data.pageSize
  return request({
    url: '/api/admin/game/getGameLineList',
    method: 'post',
    params: { pageNum, pageSize },
    data
  })
}

export function getGameLine(id) {
  return request({
    url: '/api/admin/game/getGameLineInfo',
    method: 'post',
    params: { id }
  })
}

export function addGameLine(data) {
  return request({
    url: '/api/admin/game/addGameLine',
    method: 'post',
    data
  })
}

export function updateGameLine(data) {
  return request({
    url: '/api/admin/game/updateGameLine',
    method: 'post',
    data
  })
}

export function delGameLine(ids) {
  return request({
    url: '/api/admin/game/deleteGameLine',
    method: 'post',
    data: normalizeIds(ids)
  })
}
