const MAIN_BALANCE_DEMO_RECORDS = [
  {
    id: 6101,
    transactionId: 'SM-202606-333333',
    transactionTypeName: '站点月结',
    transactionTypes: '30',
    subjectName: '站点月结-333333',
    relatedSiteName: '财神客栈',
    siteCode: 'SITE003',
    remark: '站点月结人工入账：SM-202606-333333',
    amount: 1000,
    balanceBefore: 9954.1,
    balanceAfter: 10954.1,
    createTime: '2026-07-17 13:50:50'
  },
  {
    id: 6102,
    transactionId: '264d9f4124a448e4a87ef86c34f9a111',
    transactionTypeName: '会员充值',
    transactionTypes: '5',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: '会员充值支付回调入账',
    amount: 331.24,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-17 13:09:31'
  },
  {
    id: 6103,
    transactionId: '123123123',
    transactionTypeName: '会员充值',
    transactionTypes: '5',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: '会员充值支付回调入账',
    amount: 123123,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-16 11:41:39'
  },
  {
    id: 6104,
    transactionId: '36d415f4518c4bf29bb57f13c5903333',
    transactionTypeName: '会员充值',
    transactionTypes: '5',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: '会员充值支付回调入账',
    amount: 2368.7,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-16 00:59:53'
  },
  {
    id: 6105,
    transactionId: '345bc4935bf6466e8fe3837469ed5555',
    transactionTypeName: '会员充值',
    transactionTypes: '5',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: '会员充值支付回调入账',
    amount: 900,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-15 18:40:03'
  },
  {
    id: 6106,
    transactionId: 'f80864d4bdbd4105a9bc617782d66666',
    transactionTypeName: '会员充值',
    transactionTypes: '5',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: '会员充值支付回调入账',
    amount: 900,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-15 15:51:47'
  },
  {
    id: 6107,
    transactionId: '457641afe9c045e3959708ec58cc7777',
    transactionTypeName: '会员充值',
    transactionTypes: '5',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: '会员充值支付回调入账',
    amount: 64896,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-14 13:05:17'
  },
  {
    id: 6108,
    transactionId: 'd10a5dabaa0a440e8b847d092b488888',
    transactionTypeName: '会员充值',
    transactionTypes: '5',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: '会员充值支付回调入账',
    amount: 6757.3,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-13 17:23:04'
  },
  {
    id: 6109,
    transactionId: '4756373a83b04c11869bc41550a99999',
    transactionTypeName: '会员充值',
    transactionTypes: '5',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: '会员充值支付回调入账',
    amount: 331.24,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-12 00:33:28'
  },
  {
    id: 6110,
    transactionId: 'WD1783787161497649',
    transactionTypeName: '会员提现',
    transactionTypes: '6',
    subjectName: '总站',
    relatedSiteName: '旺财体育',
    siteCode: 'SITE001',
    remark: 'USDT提现',
    amount: 204,
    balanceBefore: 9954.1,
    balanceAfter: 9954.1,
    createTime: '2026-07-12 00:31:40'
  }
]

function matchesKeyword(row, keyword) {
  if (!keyword) return true
  const searchText = [
    row.transactionId,
    row.transactionTypeName,
    row.subjectName,
    row.relatedSiteName,
    row.remark
  ].join(' ').toLowerCase()
  return searchText.includes(String(keyword).trim().toLowerCase())
}

export function listMainBalanceDemoRecords(params = {}) {
  const filteredRows = MAIN_BALANCE_DEMO_RECORDS.filter(row => {
    if (!matchesKeyword(row, params.keyword)) return false
    if (params.transactionTypes && row.transactionTypes !== String(params.transactionTypes)) return false
    if (params.siteCode && row.siteCode !== params.siteCode) return false
    if (params.beginTime && row.createTime < params.beginTime) return false
    if (params.endTime && row.createTime > params.endTime) return false
    return true
  })
  const pageNum = Number(params.pageNum || 1)
  const pageSize = Number(params.pageSize || 10)
  const start = (pageNum - 1) * pageSize
  return {
    rows: filteredRows.slice(start, start + pageSize),
    total: filteredRows.length
  }
}

