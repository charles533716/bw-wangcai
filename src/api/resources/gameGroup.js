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

export function listGameGroup(query) {
  const pageNum = query && query.pageNum ? query.pageNum : 1
  const pageSize = query && query.pageSize ? query.pageSize : 10
  const data = Object.assign({}, query)
  delete data.pageNum
  delete data.pageSize
  return request({
    url: '/api/admin/game/getGameGroupList',
    method: 'post',
    params: { pageNum, pageSize },
    data
  })
}

export function listGameGroupTree(query) {
  return request({
    url: '/api/admin/game/getGameGroupTree',
    method: 'post',
    data: query || {}
  })
}

export function getGameGroup(id) {
  return request({
    url: '/api/admin/game/getGameGroupInfo',
    method: 'post',
    params: { id }
  })
}

export function addGameGroup(data) {
  return request({
    url: '/api/admin/game/addGameGroup',
    method: 'post',
    data
  })
}

export function updateGameGroup(data) {
  return request({
    url: '/api/admin/game/updateGameGroup',
    method: 'post',
    data
  })
}

export function delGameGroup(ids) {
  return request({
    url: '/api/admin/game/deleteGameGroup',
    method: 'post',
    data: normalizeIds(ids)
  })
}

export function listGameGroupRel(query) {
  const pageNum = query && query.pageNum ? query.pageNum : 1
  const pageSize = query && query.pageSize ? query.pageSize : 10
  const data = Object.assign({}, query)
  delete data.pageNum
  delete data.pageSize
  return request({
    url: '/api/admin/game/getGameGroupRelList',
    method: 'post',
    params: { pageNum, pageSize },
    data
  })
}

export function bindGameGroupGames(data) {
  return request({
    url: '/api/admin/game/bindGameGroupGames',
    method: 'post',
    data
  })
}

export function removeGameGroupRel(id) {
  return request({
    url: '/api/admin/game/removeGameGroupRel',
    method: 'post',
    params: { id }
  })
}
