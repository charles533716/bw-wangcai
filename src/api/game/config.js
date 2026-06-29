import request from '@/utils/request'

// 查询游戏配置数据列表
export function listConfigData(query) {
  return request({
    url: '/game/config/data/list',
    method: 'get',
    params: query
  })
}

// 查询游戏配置数据详细
export function getConfigData(configCode) {
  return request({
    url: '/game/config/data/' + configCode,
    method: 'get'
  })
}

// 根据配置类型查询配置数据
export function getConfigByType(configType) {
  return request({
    url: '/game/config/data/type/' + configType,
    method: 'get'
  })
}

// 新增游戏配置数据
export function addConfigData(data) {
  return request({
    url: '/game/config/data',
    method: 'post',
    data: data
  })
}

// 修改游戏配置数据
export function updateConfigData(data) {
  return request({
    url: '/game/config/data',
    method: 'put',
    data: data
  })
}

// 删除游戏配置数据
export function delConfigData(configCode) {
  return request({
    url: '/game/config/data/' + configCode,
    method: 'delete'
  })
}

// 导出游戏配置数据
export function exportConfigData(query) {
  return request({
    url: '/game/config/data/export',
    method: 'get',
    params: query
  })
}

// 查询游戏配置类型列表
export function listConfigType(query) {
  return request({
    url: '/game/config/type/list',
    method: 'get',
    params: query
  })
}

// 查询游戏配置类型详细
export function getConfigType(configId) {
  return request({
    url: '/game/config/type/' + configId,
    method: 'get'
  })
}

// 根据配置类型查询详细
export function getConfigTypeByType(configType) {
  return request({
    url: '/game/config/type/type/' + configType,
    method: 'get'
  })
}

// 新增游戏配置类型
export function addConfigType(data) {
  return request({
    url: '/game/config/type',
    method: 'post',
    data: data
  })
}

// 修改游戏配置类型
export function updateConfigType(data) {
  return request({
    url: '/game/config/type',
    method: 'put',
    data: data
  })
}

// 删除游戏配置类型
export function delConfigType(configId) {
  return request({
    url: '/game/config/type/' + configId,
    method: 'delete'
  })
}

// 导出游戏配置类型
export function exportConfigType(query) {
  return request({
    url: '/game/config/type/export',
    method: 'get',
    params: query
  })
}
