import request from '@/utils/request'

export function getFinanceCenterPanel(params) {
  return request({
    url: '/funds/fundpool/center/panel',
    method: 'get',
    params
  })
}

export function getFinanceCenterRecords(params) {
  return request({
    url: '/funds/fundpool/center/records',
    method: 'get',
    params
  })
}

export function getFinanceCenterRecordDetail(params) {
  return request({
    url: '/funds/fundpool/center/records/detail',
    method: 'get',
    params
  })
}

export function getFinanceCenterRecordTotal(params) {
  return request({
    url: '/funds/fundpool/center/records/total',
    method: 'get',
    params
  })
}

export function updateFinanceCenterSettlement(data) {
  return request({
    url: '/funds/fundpool/center/settlement',
    method: 'put',
    data
  })
}

export function submitFinanceCenterInternalTransfer(data) {
  return request({
    url: '/funds/fundpool/center/internal-transfer',
    method: 'post',
    data
  })
}

export function getQuickRechargeChannels(params) {
  return request({
    url: '/funds/fundpool/center/quick-recharge/channels',
    method: 'get',
    params
  })
}

function createQuickRechargeOrder(provider, data) {
  return request({
    url: `/funds/fundpool/center/quick-recharge/${provider}/order`,
    method: 'post',
    data
  })
}

export function createHiPayQuickRechargeOrder(data) {
  return createQuickRechargeOrder('hipay', data)
}

export function createTronPayQuickRechargeOrder(data) {
  return createQuickRechargeOrder('tronpay', data)
}

export function createXmfPayQuickRechargeOrder(data) {
  return createQuickRechargeOrder('xmfpay', data)
}

export function getQuickWithdrawConfig(params) {
  return request({
    url: '/funds/fundpool/center/quick-withdraw/config',
    method: 'get',
    params
  })
}

export function submitQuickUsdtWithdraw(data) {
  return request({
    url: '/funds/fundpool/center/quick-withdraw/usdt',
    method: 'post',
    data
  })
}

export function submitQuickAlipayWithdraw(data) {
  return request({
    url: '/funds/fundpool/center/quick-withdraw/alipay',
    method: 'post',
    data
  })
}
