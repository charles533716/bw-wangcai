import request from '@/utils/request'

// 游戏线路
export function listGameLine(params, data) {
  return request({
    url: '/api/admin/game/getGameLineList',
    method: 'post',
    params,
    data
  })
}

export function getGameLineInfo(id) {
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

export function deleteGameLine(ids) {
  return request({
    url: '/api/admin/game/deleteGameLine',
    method: 'post',
    data: ids
  })
}

// 游戏厂商
export function listGameFactory(params, data) {
  return request({
    url: '/api/admin/game/getGameFactoryList',
    method: 'post',
    params,
    data
  })
}

export function getGameFactoryInfo(id) {
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

export function deleteGameFactory(ids) {
  return request({
    url: '/api/admin/game/deleteGameFactory',
    method: 'post',
    data: ids
  })
}

// 游戏
export function listGameBase(params, data) {
  return request({
    url: '/api/admin/game/getGameBaseList',
    method: 'post',
    params,
    data
  })
}

export function getGameBaseInfo(id) {
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

export function deleteGameBase(ids) {
  return request({
    url: '/api/admin/game/deleteGameBase',
    method: 'post',
    data: ids
  })
}

// 游戏分组
export function listGameGroup(params, data) {
  return request({
    url: '/api/admin/game/getGameGroupList',
    method: 'post',
    params,
    data
  })
}

export function getGameGroupTree(data) {
  return request({
    url: '/api/admin/game/getGameGroupTree',
    method: 'post',
    data
  })
}

export function getGameGroupInfo(id) {
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

export function deleteGameGroup(ids) {
  return request({
    url: '/api/admin/game/deleteGameGroup',
    method: 'post',
    data: ids
  })
}

export function listGameGroupRel(params, data) {
  return request({
    url: '/api/admin/game/getGameGroupRelList',
    method: 'post',
    params,
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
