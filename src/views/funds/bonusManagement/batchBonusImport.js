const OFFLINE_FIRST_DEPOSIT = 'agentFirstDeposit'

function pad(value, width) {
  return String(value).padStart(width, '0')
}

function accountField(walletType) {
  return walletType === 'commission' ? 'agentAccount' : 'memberAccount'
}

function accountPrefix(walletType) {
  return walletType === 'commission' ? 'agent' : 'member'
}

function createValidRows(walletType, count) {
  const field = accountField(walletType)
  const prefix = accountPrefix(walletType)
  return Array.from({ length: count }, (_, index) => ({
    id: `valid-${walletType}-${index + 1}`,
    rowNo: index + 2,
    [field]: `${prefix}${pad(index + 1, 4)}`,
    amount: 80 + (index % 17) * 12.5
  }))
}

function createWarningRows(walletType, startRow) {
  if (walletType === 'commission') return []
  return Array.from({ length: 6 }, (_, index) => ({
    id: `warning-${walletType}-${index + 1}`,
    rowNo: startRow + index,
    memberAccount: `offline_member${pad(index + 1, 3)}`,
    amount: [688, 500, 300, 200, 168, 100][index]
  }))
}

function createInvalidRows(walletType, startRow) {
  const field = accountField(walletType)
  const label = walletType === 'commission' ? '代理账号' : '会员账号'
  const values = [
    { account: '', amount: 100, reason: `${label}不能为空` },
    { account: 'unknown_001', amount: 100, reason: `查询无此${label === '代理账号' ? '代理' : '会员'}` },
    { account: 'duplicate_001', amount: 100, reason: `${label}与金额重复` },
    { account: 'duplicate_001', amount: 100, reason: `${label}与金额重复` },
    { account: 'invalid_amount_001', amount: '', reason: '金额不能为空' },
    { account: 'invalid_amount_002', amount: 0, reason: '金额必须大于0' },
    { account: 'invalid_amount_003', amount: -20, reason: '金额必须大于0' },
    { account: 'invalid_amount_004', amount: '一百', reason: '金额必须为数字' },
    { account: 'space_account', amount: 88, reason: `${label}格式不正确` },
    { account: 'disabled_001', amount: 120, reason: `${label === '代理账号' ? '代理' : '会员'}状态不可用` },
    { account: 'wrong_site_001', amount: 100, reason: `当前站点下查询无此${label === '代理账号' ? '代理' : '会员'}` },
    { account: 'limit_001', amount: 999999999, reason: '金额超出可发放范围' },
    { account: 'decimal_001', amount: 10.999, reason: '金额最多保留2位小数' },
    { account: 'format_001', amount: 100, reason: '导入数据格式错误' }
  ]

  return values.map((item, index) => ({
    id: `invalid-${walletType}-${index + 1}`,
    rowNo: startRow + index,
    [field]: item.account,
    amount: item.amount,
    errorText: item.reason
  }))
}

function rebuildResult(result, updates) {
  const next = Object.assign({}, result, updates)
  next.validAmount = next.validRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  next.total = next.validRows.length + next.warningRows.length + next.invalidRows.length
  return next
}

function createBonusImportDemo(options) {
  const walletType = options && options.walletType === 'commission' ? 'commission' : (options && options.walletType) || 'center'
  const bonusType = options && options.bonusType
  const validRows = createValidRows(walletType, 230)
  const showWarning = walletType !== 'commission' && bonusType === OFFLINE_FIRST_DEPOSIT
  const warningRows = showWarning ? createWarningRows(walletType, 232) : []
  const invalidRows = createInvalidRows(walletType, 232 + warningRows.length)
  return rebuildResult({ walletType, bonusType, validRows, warningRows, invalidRows }, {})
}

function getBonusTemplateHeaders(walletType) {
  return walletType === 'commission' ? ['代理账号', '金额'] : ['会员账号', '金额']
}

function getBonusTemplateRows(walletType) {
  return walletType === 'commission'
    ? [['agent001', 100], ['agent002', 288.88]]
    : [['member001', 100], ['member002', 288.88]]
}

function markWarningRowNormal(result, id) {
  const target = result.warningRows.find(row => row.id === id)
  if (!target) return result
  const normalRow = Object.assign({}, target, { id: `valid-from-${target.id}` })
  return rebuildResult(result, {
    validRows: [normalRow].concat(result.validRows),
    warningRows: result.warningRows.filter(row => row.id !== id)
  })
}

function deleteWarningRow(result, id) {
  if (!result.warningRows.some(row => row.id === id)) return result
  return rebuildResult(result, {
    warningRows: result.warningRows.filter(row => row.id !== id)
  })
}

function paginateRows(rows, page, pageSize) {
  const start = (Math.max(1, page) - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

module.exports = {
  OFFLINE_FIRST_DEPOSIT,
  createBonusImportDemo,
  getBonusTemplateHeaders,
  getBonusTemplateRows,
  markWarningRowNormal,
  deleteWarningRow,
  paginateRows
}
