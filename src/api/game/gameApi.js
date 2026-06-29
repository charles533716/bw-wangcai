import request from '@/utils/request'

// 获取最新游戏记录
export function getLatestGameRecord(memberId = 0) {
  return request({
    url: '/api/game/latest',
    method: 'get',
    params: { member_id: memberId }
  })
}

// 下注操作
export function placeBet(data) {
  return request({
    url: '/api/game/placeBet',
    method: 'post',
    data: data
  })
}

// 获取赔率配置
export function getBetOdds() {
  return request({
    url: '/api/game/betnumber',
    method: 'get'
  })
}
