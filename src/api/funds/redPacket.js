import request from '@/utils/request'

export function listRedPackets(query) {
  return request({
    url: '/funds/red-packet/list',
    method: 'get',
    params: query
  })
}

export function getRedPacketSummary(query) {
  return request({
    url: '/funds/red-packet/summary',
    method: 'get',
    params: query
  })
}

export function listRedPacketMembers(query) {
  return request({
    url: '/funds/red-packet/members',
    method: 'get',
    params: query
  })
}

export function getRedPacket(id) {
  return request({
    url: `/funds/red-packet/${id}`,
    method: 'get'
  })
}

export function listRedPacketClaims(id) {
  return request({
    url: `/funds/red-packet/${id}/claims`,
    method: 'get'
  })
}

export function createRedPacket(data) {
  return request({
    url: '/funds/red-packet',
    method: 'post',
    data
  })
}

export function activateRedPacket(id) {
  return request({
    url: `/funds/red-packet/${id}/activate`,
    method: 'put'
  })
}
