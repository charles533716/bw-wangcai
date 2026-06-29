import request from '@/utils/request'

// 查询游戏记录列表
export function listGameRecord(query) {
  return request({
    url: '/game/record/list',
    method: 'get',
    params: query
  })
}
export function getGameRecordDetail(id) {
  return request({
    url: '/game/record/' + id,
    method: 'get'
  })
}

// 查询游戏收益率数据
export function getGameYields(gameCode) {
  return request({
    url: '/game/record/yields/' + gameCode,
    method: 'get'
  })
}
// 查询游戏记录详细
export function getGameRecord(id) {
  return request({
    url: '/game/record/' + id,
    method: 'get'
  })
}

// 新增游戏记录
export function addGameRecord(data) {
  return request({
    url: '/game/record',
    method: 'post',
    data: data
  })
}

// 修改游戏记录
export function updateGameRecord(data) {
  return request({
    url: '/game/record',
    method: 'put',
    data: data
  })
}

// 删除游戏记录
export function delGameRecord(ids) {
  return request({
    url: '/game/record/' + ids,
    method: 'delete'
  })
}

// 导出游戏记录
export function exportGameRecord(query) {
  return request({
    url: '/game/record/export',
    method: 'get',
    params: query
  })
}

// 开奖操作
export function drawLottery(data) {
  return request({
    url: '/game/record/drawLottery',
    method: 'post',
    data: data
  })
}

// 作废游戏记录
export function invalidateGameRecord(gameCode) {
  return request({
    url: '/game/record/invalidate',
    method: 'post',
    data: {
      gameCode: gameCode
    }
  })
}

// 创建下一轮游戏
export function createNextGameRecord() {
  return request({
    url: '/game/record/createNext',
    method: 'post'
  })
}
