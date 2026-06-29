import request from '@/utils/request'

// 查询充提手续费模版列表
export function listDepositWithdrawFeeTemplates() {
  return request({
    url: '/funds/depositWithdrawFee/templates',
    method: 'get'
  })
}

// 新增充提手续费模版
export function addDepositWithdrawFeeTemplate(data) {
  return request({
    url: '/funds/depositWithdrawFee/templates',
    method: 'post',
    data: data
  })
}

// 修改充提手续费模版名称
export function updateDepositWithdrawFeeTemplate(id, data) {
  return request({
    url: '/funds/depositWithdrawFee/templates/' + id,
    method: 'put',
    data: data
  })
}

// 删除充提手续费模版
export function delDepositWithdrawFeeTemplate(id) {
  return request({
    url: '/funds/depositWithdrawFee/templates/' + id,
    method: 'delete'
  })
}

// 查询充提手续费配置
export function getDepositWithdrawFeeConfig(query) {
  return request({
    url: '/funds/depositWithdrawFee/config',
    method: 'get',
    params: query
  })
}

// 保存充提手续费配置
export function saveDepositWithdrawFeeConfig(data) {
  return request({
    url: '/funds/depositWithdrawFee/config',
    method: 'put',
    data: data
  })
}
