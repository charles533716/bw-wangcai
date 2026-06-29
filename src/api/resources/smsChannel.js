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

// 查询短信通道列表
export function listSmsChannel(query) {
  const { params, data } = buildListRequest(query)
  return request({
    url: `${baseUrl}/getSmsChannelList`,
    method: 'post',
    params,
    data
  })
}

// 查询短信通道详细
export function getSmsChannel(id) {
  return request({
    url: `${baseUrl}/getSmsChannelInfo`,
    method: 'post',
    params: { id }
  })
}

// 新增短信通道
export function addSmsChannel(data) {
  return request({
    url: `${baseUrl}/addSmsChannel`,
    method: 'post',
    data
  })
}

// 修改短信通道
export function updateSmsChannel(data) {
  return request({
    url: `${baseUrl}/updateSmsChannel`,
    method: 'post',
    data
  })
}

// 删除短信通道
export function delSmsChannel(ids) {
  const data = Array.isArray(ids) ? ids : [ids]
  return request({
    url: `${baseUrl}/deleteSmsChannel`,
    method: 'post',
    data
  })
}
