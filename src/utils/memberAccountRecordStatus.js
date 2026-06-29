const STATUS_LABELS = {
  1: '充值确认中',
  2: '充值确认失败',
  3: '充值确认成功',
  4: '提现审核中',
  5: '提现转账中',
  6: '提现拒绝',
  7: '提现成功',
  15: '充值待支付',
  20: '提现失败'
}

const SUCCESS_STATUS = [3, 7]
const PENDING_STATUS = [1, 4, 5, 15]
const FAILED_STATUS = [2, 6, 20]

function buildOptions(values) {
  return values.map(value => ({
    label: STATUS_LABELS[value],
    value
  }))
}

export const DEPOSIT_STATUS_OPTIONS = buildOptions([1, 2, 3, 15])
export const WITHDRAW_STATUS_OPTIONS = buildOptions([4, 5, 6, 7, 20])
export const DEPOSIT_WITHDRAW_STATUS_OPTIONS = buildOptions([1, 2, 3, 4, 5, 6, 7, 15, 20])

export function formatMemberAccountStatus(status) {
  if (status === null || status === undefined || status === '') {
    return status
  }
  const value = Number(status)
  return STATUS_LABELS[value] || status
}

export function getMemberAccountStatusTagType(status) {
  const value = Number(status)

  if (SUCCESS_STATUS.includes(value)) return 'success'
  if (PENDING_STATUS.includes(value)) return 'warning'
  if (FAILED_STATUS.includes(value)) return 'danger'
  return 'info'
}
