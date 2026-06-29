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

// 查询短信发送记录列表
export function listSmsLog(query) {
  const { params, data } = buildListRequest(query)
  return request({
    url: `${baseUrl}/getSmsSendLogList`,
    method: 'post',
    params,
    data
  })
}

// 查询短信发送记录详细
export function getSmsLog(id) {
  return request({
    url: `${baseUrl}/getSmsSendLogInfo`,
    method: 'post',
    params: { id }
  })
}
