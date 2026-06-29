import request from '@/utils/request'

// 查询游戏列表
export function listGame(query) {
  return request({
    url: '/game/list',
    method: 'get',
    params: query
  })
}

// 查询游戏详细
export function getGame(id) {
  return request({
    url: '/game/' + id,
    method: 'get'
  })
}

// 新增游戏
export function addGame(data) {
  return request({
    url: '/game',
    method: 'post',
    data: data
  })
}

// 修改游戏
export function updateGame(data) {
  return request({
    url: '/game',
    method: 'put',
    data: data
  })
}

// 删除游戏
export function delGame(id) {
  return request({
    url: '/game/' + id,
    method: 'delete'
  })
}

// 导出游戏
export function exportGame(query) {
  return request({
    url: '/game/export',
    method: 'get',
    params: query
  })
}

// 校验游戏编码是否唯一
export function checkCodeUnique(code, id) {
  return request({
    url: '/game/checkCodeUnique',
    method: 'post',
    params: {
      code: code,
      id: id || ''
    }
  })
}



// 同步游戏列表
export function syncGameList() {
  return request({
    url: '/game/sync',
    method: 'post'
  })
}
