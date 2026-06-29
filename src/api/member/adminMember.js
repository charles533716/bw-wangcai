import request from '@/utils/request'

export function listAdminMember(params, data) {
  return request({
    url: '/api/admin/member/getMemberList',
    method: 'post',
    params,
    data
  })
}

export function getAdminMemberInfo(id) {
  return request({
    url: '/api/admin/member/getMemberInfo',
    method: 'post',
    params: { id }
  })
}

export function listAdminSameIpSummaries(params, data) {
  return request({
    url: '/api/admin/member/getSameIpSummaryList',
    method: 'post',
    params,
    data
  })
}

export function listAdminSameIpMembers(params, data) {
  return request({
    url: '/api/admin/member/getSameIpMemberList',
    method: 'post',
    params,
    data
  })
}

export function updateAdminMember(data) {
  return request({
    url: '/api/admin/member/updateMember',
    method: 'post',
    data
  })
}

export function banAdminMember(id) {
  return request({
    url: '/api/admin/member/banMember',
    method: 'post',
    params: { id }
  })
}

export function batchBanMember(data) {
  return request({
    url: '/api/admin/member/batchBanMember',
    method: 'post',
    data
  })
}

export function batchUnbanMember(data) {
  return request({
    url: '/api/admin/member/batchUnbanMember',
    method: 'post',
    data
  })
}

export function resetAdminMemberPassword(data) {
  return request({
    url: '/api/admin/member/resetMemberPassword',
    method: 'post',
    data
  })
}

export function resetAdminMemberWithdrawPassword(data) {
  return request({
    url: '/api/admin/member/resetMemberWithdrawPassword',
    method: 'post',
    data
  })
}

export function getAdminMemberOverview(data) {
  return request({
    url: '/api/admin/member/getMemberOverview',
    method: 'post',
    data
  })
}

export function getAdminMemberWalletBalances(data) {
  return request({
    url: '/api/admin/member/getMemberWalletBalances',
    method: 'post',
    data
  })
}

export function getAdminMemberAdjustWalletInfo(data) {
  return request({
    url: '/api/admin/member/getMemberAdjustWalletInfo',
    method: 'post',
    data
  })
}

export function getAdminMemberWithdrawMethods(data) {
  return request({
    url: '/api/admin/member/getMemberWithdrawMethods',
    method: 'post',
    data
  })
}

export function listAdminMemberRiskRecords(params, data) {
  return request({
    url: '/api/admin/member/getMemberRiskRecordList',
    method: 'post',
    params,
    data
  })
}

export function listAdminMemberRiskTags(data) {
  return request({
    url: '/api/admin/member/getMemberRiskTagList',
    method: 'post',
    data
  })
}

export function addAdminMemberRiskTag(data) {
  return request({
    url: '/api/admin/member/addMemberRiskTag',
    method: 'post',
    data
  })
}

export function deleteAdminMemberRiskTag(data) {
  return request({
    url: '/api/admin/member/deleteMemberRiskTag',
    method: 'post',
    data
  })
}

export function listAdminMemberLoginLogs(params, data) {
  return request({
    url: '/api/admin/member/getMemberLoginLogList',
    method: 'post',
    params,
    data
  })
}

export function recoverAdminMemberVenueBalances(data) {
  return request({
    url: '/api/admin/member/recoverMemberVenueBalances',
    method: 'post',
    data
  })
}

export function recoverAdminMemberVenueBalancesById(id) {
  return request({
    url: '/api/admin/member/recoverMemberVenueBalancesById',
    method: 'post',
    params: { id }
  })
}

export function listAdminMemberBetRecords(params, data) {
  return request({
    url: '/api/admin/member/getMemberBetRecordList',
    method: 'post',
    params,
    data
  })
}

export function listAdminMemberDepositRecords(params, data) {
  return request({
    url: '/api/admin/member/getMemberDepositRecordList',
    method: 'post',
    params,
    data
  })
}

export function listAdminMemberWithdrawRecords(params, data) {
  return request({
    url: '/api/admin/member/getMemberWithdrawRecordList',
    method: 'post',
    params,
    data
  })
}

export function listAdminMemberChangeRecords(params, data) {
  return request({
    url: '/api/admin/member/getMemberChangeRecordList',
    method: 'post',
    params,
    data
  })
}

export function submitAdminMemberAccountAdjust(data) {
  return request({
    url: '/api/admin/member/submitMemberAccountAdjust',
    method: 'post',
    data
  })
}
