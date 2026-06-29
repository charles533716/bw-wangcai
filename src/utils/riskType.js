export const LEGACY_RISK_TYPE_OPTIONS = [
  { value: 1, label: '充值失败次数', code: 'recharge_fail_count', mode: 'count', status: 1 },
  { value: 2, label: '游戏记录对刷', code: 'game_record_brush', mode: 'count', status: 1 },
  { value: 3, label: '投注输赢比', code: 'bet_win_loss_ratio', mode: 'scale', status: 1 },
  { value: 4, label: 'IP注册限制次数', code: 'ip_limit_register_number', mode: 'count', status: 1 }
]

const COUNT_HINTS = ['count', 'times', 'brush', 'fail', 'frequency', 'limit', 'register_number', 'ip_limit', '次数', '对刷', '失败']
const SCALE_HINTS = ['scale', 'ratio', 'rate', 'percent', '输赢比', '比例', '占比']

export function getRiskTypeField(source, aliases = []) {
  if (!source || !Array.isArray(aliases)) return ''
  let value = ''
  aliases.some((key) => {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      value = source[key]
      return true
    }
    return false
  })
  return value
}

export function extractRiskTypeRows(response) {
  if (Array.isArray(response.rows)) return response.rows
  if (response.data && Array.isArray(response.data.rows)) return response.data.rows
  if (Array.isArray(response.data)) return response.data
  return []
}

export function normalizeRiskTypeStatus(value, fallback = 1) {
  const status = Number(value)
  if (status === 1) return 1
  if (status === 2 || status === 0) return 2
  return fallback
}

export function resolveRiskTypeId(source) {
  return getRiskTypeField(source, ['id', 'typeId', 'riskTypeId'])
}

export function resolveRiskTypeName(source) {
  return getRiskTypeField(source, ['typeName', 'name', 'riskTypeName'])
}

export function resolveRiskTypeCode(source) {
  return getRiskTypeField(source, ['typeCode', 'code', 'riskTypeCode'])
}

export function resolveRiskTypeModeByText(text, fallback = 'raw') {
  const normalizedText = String(text || '').toLowerCase()
  if (!normalizedText) return fallback
  if (normalizedText.includes('ip_limit_register_number') || normalizedText.includes('register_number')) return 'count'
  if (SCALE_HINTS.some((item) => normalizedText.includes(item))) return 'scale'
  if (COUNT_HINTS.some((item) => normalizedText.includes(item))) return 'count'
  return fallback
}

export function normalizeRiskTypeOption(source) {
  const value = resolveRiskTypeId(source)
  const label = resolveRiskTypeName(source)
  const code = resolveRiskTypeCode(source)
  const mode = source.mode || resolveRiskTypeModeByText(code || label || value)
  return {
    value: value === '' ? undefined : value,
    label: label || '--',
    code: code || '',
    mode,
    status: normalizeRiskTypeStatus(getRiskTypeField(source, ['status', 'state']), 1),
    raw: source
  }
}

export function normalizeRiskTypeOptions(response, fallbackOptions = LEGACY_RISK_TYPE_OPTIONS) {
  const rows = extractRiskTypeRows(response)
  const options = rows
    .map((item) => normalizeRiskTypeOption(item))
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== '')
  return options.length ? options : fallbackOptions.map((item) => ({ ...item }))
}

export function getRiskTypeOption(options, value) {
  return (options || []).find((item) => String(item.value) === String(value))
}

export function getRiskTypeLabel(options, value) {
  const option = getRiskTypeOption(options, value)
  if (option) return option.label
  if (value === undefined || value === null || value === '') return '--'
  return value
}

export function getRiskTypeMode(options, value) {
  const option = getRiskTypeOption(options, value)
  if (option && option.mode) return option.mode
  if (String(value) === '1' || String(value) === '2') return 'count'
  if (String(value) === '3') return 'scale'
  return 'raw'
}
