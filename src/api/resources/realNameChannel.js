import request from '@/utils/request'

const baseUrl = '/api/admin/sms'

function buildListRequest(query) {
  const data = query ? { ...query } : {}
  const params = {}
  ;['pageNum', 'pageSize', 'orderByColumn', 'isAsc'].forEach(key => {
    if (data[key] !== undefined) {
      params[key] = data[key]
      delete data[key]
    }
  })
  return { params, data }
}

export function listRealNameChannel(query) {
  const { params, data } = buildListRequest(query)
  return request({
    url: `${baseUrl}/getRealNameChannelList`,
    method: 'post',
    params,
    data
  })
}

export function getRealNameChannel(id) {
  return request({
    url: `${baseUrl}/getRealNameChannelInfo`,
    method: 'post',
    params: { id }
  })
}

export function addRealNameChannel(data) {
  return request({
    url: `${baseUrl}/addRealNameChannel`,
    method: 'post',
    data
  })
}

export function updateRealNameChannel(data) {
  return request({
    url: `${baseUrl}/updateRealNameChannel`,
    method: 'post',
    data
  })
}

export function delRealNameChannel(ids) {
  const data = Array.isArray(ids) ? ids : [ids]
  return request({
    url: `${baseUrl}/deleteRealNameChannel`,
    method: 'post',
    data
  })
}
