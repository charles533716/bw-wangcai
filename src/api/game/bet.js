import request from '@/utils/request'

// 查询游戏下注列表
export function listGameBet(query) {
  return request({
    url: '/game/bet/list',
    method: 'get',
    params: query
  })
}

// 查询游戏下注详细
export function getGameBet(id) {
  return request({
    url: '/game/bet/' + id,
    method: 'get'
  })
}

// 新增游戏下注
export function addGameBet(data) {
  return request({
    url: '/game/bet',
    method: 'post',
    data: data
  })
}

// 修改游戏下注
export function updateGameBet(data) {
  return request({
    url: '/game/bet',
    method: 'put',
    data: data
  })
}

// 删除游戏下注
export function delGameBet(ids) {
  return request({
    url: '/game/bet/' + ids,
    method: 'delete'
  })
}

// 导出游戏下注
export function exportGameBet(query) {
  return request({
    url: '/game/bet/export',
    method: 'get',
    params: query
  })
}

// 根据游戏编号查询下注记录
export function getBetsByGameCode(gameCode) {
  return request({
    url: '/game/bet/gameCode/' + gameCode,
    method: 'get'
  })
}

// 根据会员ID查询下注记录
export function getBetsByMemberId(memberId) {
  return request({
    url: '/game/bet/member/' + memberId,
    method: 'get'
  })
}

// 下注操作
export function placeBet(data) {
  return request({
    url: '/game/gameBet/place',
    method: 'post',
    data: data
  })
}
