const ALLOWED_BONUS_TYPES = ['推广彩金', '活动彩金', '平台彩金']

const DEMO_SITE_CONFIGS = [
  { siteName: '旺财体育', memberPrefix: 'wc_batch_' },
  { siteName: 'DW体育', memberPrefix: 'dw_batch_' },
  { siteName: '财神体育', memberPrefix: 'cs_batch_' }
]

function createGeneratedDemoValidRows(count) {
  return Array.from({ length: count }, (_, index) => {
    const site = DEMO_SITE_CONFIGS[index % DEMO_SITE_CONFIGS.length]
    return {
      siteName: site.siteName,
      bonusType: ALLOWED_BONUS_TYPES[index % ALLOWED_BONUS_TYPES.length],
      memberAccount: `${site.memberPrefix}${String(index + 1).padStart(4, '0')}`,
      amount: 100 + (index % 20) * 10,
      turnoverMultiple: index % 13
    }
  })
}

const DEMO_VALID_ROWS = [
  { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: 'wc10086', amount: 500, turnoverMultiple: 12 },
  { siteName: '旺财体育', bonusType: '推广彩金', memberAccount: 'wc10086', amount: 80, turnoverMultiple: 1 },
  { siteName: 'DW体育', bonusType: '平台彩金', memberAccount: 'dw20008', amount: 120, turnoverMultiple: 0 }
].concat(createGeneratedDemoValidRows(227))

const SITE_MEMBERS = {
  旺财体育: ['wc10001', 'wc10086', 'wc88888'],
  DW体育: ['dw20001', 'dw20008', 'dw_repeat'],
  财神体育: ['cs30001', 'cs30009', 'cs88888']
}

DEMO_VALID_ROWS.forEach(row => {
  if (!SITE_MEMBERS[row.siteName].includes(row.memberAccount)) {
    SITE_MEMBERS[row.siteName].push(row.memberAccount)
  }
})

const TEMPLATE_ROWS = [
  { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: 'wc10086', amount: 500, turnoverMultiple: 12 },
  { siteName: 'DW体育', bonusType: '推广彩金', memberAccount: 'dw20008', amount: 100.5, turnoverMultiple: 1 },
  { siteName: '财神体育', bonusType: '平台彩金', memberAccount: 'cs30001', amount: 200, turnoverMultiple: 0 }
]

const DEMO_INVALID_ROWS = [
  { siteName: '', bonusType: '活动彩金', memberAccount: 'wc10001', amount: 100, turnoverMultiple: 1 },
  { siteName: '旺财体育', bonusType: '', memberAccount: 'wc10001', amount: 100, turnoverMultiple: 1 },
  { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: '', amount: 100, turnoverMultiple: 1 },
  { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: 'wc10001', amount: '', turnoverMultiple: 1 },
  { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: 'wc88888', amount: 100, turnoverMultiple: '' },
  { siteName: '不存在站点', bonusType: '活动彩金', memberAccount: 'no_site_01', amount: 100, turnoverMultiple: 2 },
  { siteName: '财神体育', bonusType: '活动彩金', memberAccount: 'unknown_member', amount: 100, turnoverMultiple: 1 },
  { siteName: '财神体育', bonusType: '节日彩金', memberAccount: 'cs30009', amount: 100, turnoverMultiple: 1 },
  { siteName: 'DW体育', bonusType: '活动彩金', memberAccount: 'dw20001', amount: '一百', turnoverMultiple: 1 },
  { siteName: 'DW体育', bonusType: '推广彩金', memberAccount: 'dw20001', amount: 0, turnoverMultiple: 1 },
  { siteName: '财神体育', bonusType: '活动彩金', memberAccount: 'cs88888', amount: 100, turnoverMultiple: '十二' },
  { siteName: '财神体育', bonusType: '平台彩金', memberAccount: 'cs30001', amount: 300, turnoverMultiple: -1 },
  { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: 'wc10086', amount: 260, turnoverMultiple: 5 }
]

const DEMO_IMPORT_ROWS = DEMO_VALID_ROWS.concat(DEMO_INVALID_ROWS)

function text(value) {
  return String(value === undefined || value === null ? '' : value).trim()
}

function duplicateKey(row) {
  return [text(row.siteName), text(row.memberAccount), text(row.bonusType)].join('::')
}

function normalizeRow(row, index) {
  return {
    rowNo: index + 2,
    siteName: text(row.siteName),
    bonusType: text(row.bonusType),
    memberAccount: text(row.memberAccount),
    amount: row.amount,
    turnoverMultiple: row.turnoverMultiple
  }
}

function validateBatchActivityCashRows(rows) {
  const normalizedRows = (Array.isArray(rows) ? rows : []).map(normalizeRow)
  const seenKeys = new Set()

  const allRows = normalizedRows.map(row => {
    const errors = []
    if (!row.siteName) errors.push('所属站点不能为空')
    if (!row.bonusType) errors.push('彩金类型不能为空')
    if (!row.memberAccount) errors.push('会员账号不能为空')
    if (text(row.amount) === '') errors.push('单会员活动彩金金额不能为空')
    if (text(row.turnoverMultiple) === '') errors.push('提现所需流水倍数不能为空')

    const members = SITE_MEMBERS[row.siteName]
    if (row.siteName && !members) {
      errors.push('查询无此站点')
    } else if (members && row.memberAccount && !members.includes(row.memberAccount)) {
      errors.push('该站点下查询无此会员')
    }
    if (row.bonusType && !ALLOWED_BONUS_TYPES.includes(row.bonusType)) {
      errors.push('彩金类型仅支持推广彩金、活动彩金、平台彩金')
    }

    const amount = Number(row.amount)
    if (text(row.amount) !== '') {
      if (!Number.isFinite(amount)) {
        errors.push('彩金金额必须为数字')
      } else if (amount <= 0) {
        errors.push('彩金金额必须大于0')
      }
    }

    const turnoverMultiple = Number(row.turnoverMultiple)
    if (text(row.turnoverMultiple) !== '') {
      if (!Number.isFinite(turnoverMultiple)) {
        errors.push('流水倍数必须为数字')
      } else if (turnoverMultiple < 0) {
        errors.push('流水倍数不能为负数')
      }
    }

    const key = duplicateKey(row)
    const hasCompleteDuplicateKey = row.siteName && row.memberAccount && row.bonusType
    if (hasCompleteDuplicateKey && seenKeys.has(key)) {
      errors.push('所属站点、会员账号、彩金类型重复数据')
    }
    if (hasCompleteDuplicateKey) seenKeys.add(key)

    return Object.assign({}, row, {
      amount: Number.isFinite(amount) ? amount : row.amount,
      turnoverMultiple: Number.isFinite(turnoverMultiple) ? turnoverMultiple : row.turnoverMultiple,
      errors,
      errorText: errors.join('；'),
      valid: errors.length === 0
    })
  })

  const validRows = allRows.filter(row => row.valid)
  const invalidRows = allRows.filter(row => !row.valid)
  const validAmount = validRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  return { allRows, validRows, invalidRows, validAmount }
}

function paginateBatchRows(rows, page, pageSize) {
  const source = Array.isArray(rows) ? rows : []
  const currentPage = Math.max(1, Number(page) || 1)
  const size = Math.max(1, Number(pageSize) || 20)
  const start = (currentPage - 1) * size
  return source.slice(start, start + size)
}

function getBatchRowSequence(page, pageSize, pageIndex) {
  const currentPage = Math.max(1, Number(page) || 1)
  const size = Math.max(1, Number(pageSize) || 20)
  return (currentPage - 1) * size + Number(pageIndex || 0) + 1
}

function getBatchActivityCashDemoRows() {
  return DEMO_IMPORT_ROWS.map(row => Object.assign({}, row))
}

function getBatchActivityCashTemplateRows() {
  return TEMPLATE_ROWS.map(row => Object.assign({}, row))
}

module.exports = {
  ALLOWED_BONUS_TYPES,
  validateBatchActivityCashRows,
  getBatchActivityCashDemoRows,
  getBatchActivityCashTemplateRows,
  paginateBatchRows,
  getBatchRowSequence
}
