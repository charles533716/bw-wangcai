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

// 查询区号配置列表
export function listAreaCode(query) {
  const { params, data } = buildListRequest(query)
  return request({
    url: `${baseUrl}/getSmsAreaCodeList`,
    method: 'post',
    params,
    data
  })
}

// 查询区号配置详细
export function getAreaCode(id) {
  return request({
    url: `${baseUrl}/getSmsAreaCodeInfo`,
    method: 'post',
    params: { id }
  })
}

// 新增区号配置
export function addAreaCode(data) {
  return request({
    url: `${baseUrl}/addSmsAreaCode`,
    method: 'post',
    data
  })
}

// 修改区号配置
export function updateAreaCode(data) {
  return request({
    url: `${baseUrl}/updateSmsAreaCode`,
    method: 'post',
    data
  })
}

// 删除区号配置
export function delAreaCode(ids) {
  const data = Array.isArray(ids) ? ids : [ids]
  return request({
    url: `${baseUrl}/deleteSmsAreaCode`,
    method: 'post',
    data
  })
}
