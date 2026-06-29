
export const RECORD_STATUS_MAP = {
  1: '充值确认中',
  2: '充值确认失败',
  3: '充值确认成功',
  4: '提现审核中',
  5: '提现转账中',
  6: '提现拒绝',
  7: '提现成功',
  8: '其他',
  9: '人工加分审核中',
  10: '人工加分审核成功',
  11: '人工加分审核失败',
  12: '人工减分审核中',
  13: '人工减分审核失败',
  14: '人工减分审核成功',
  15: '充值待支付',
  16: '场馆上分成功',
  17: '场馆上分失败',
  18: '场馆下分成功',
  19: '场馆下分失败',
  20: '提现失败',
  21: '佣金发放成功',
  22: '佣金转账成功（上级代理向下级转账）'
}

export const RECORD_TYPE_MAP = {
  1: '充值',
  2: '提现',
  3: '下注',
  4: '收益',
  5: '场馆上分',
  6: '场馆下分',
  7: '人工加分',
  8: '人工减分',
  9: '转赠支出',
  10: '主钱包转出',
  11: '主钱包转入',
  15: '代理佣金收入',
  16: '佣金转账类型（上级代理向下级代理转账）'
}

export const PAY_TYPE_DICT = {
  alipay: '支付宝',
  wechat: '微信',
  bank: '银行卡',
  usdt: 'USDT'
}

export function formatByDict(dictMap) {
  return (row, column, value) => {
    return dictMap[value] || `未知(${value})`
  }
}

// 专用封装（可读性好）
export const formatRecordStatus = formatByDict(RECORD_STATUS_MAP)
export const formatRecordType = formatByDict(RECORD_TYPE_MAP)

export function formatMoney(row, column, cellValue) {
    if (cellValue === null || cellValue === undefined || cellValue === '') {
    return 'U 0.00';
    }
    return 'U ' + Number(cellValue).toFixed(2);
}


export function formatMoneyCNY(row, column, cellValue) {
    if (cellValue === null || cellValue === undefined || cellValue === '') {
    return 'CNY 0.00';
    }
    return 'CNY ' + Number(cellValue).toFixed(2);
}

export function getWinLoseColor(value) {
    if (value < 0) {
      return '#f56c6c'; // 红色（输）
    } else if (value > 0) {
      return '#67c23a'; // 绿色（赢）
    } else {
      return 'default';
    }
  }

export function formatDateTime(row, column, cellValue) {
    if (!cellValue) return '--';
    const d = new Date(cellValue);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds())
    );
}

export function getDictLabel(dict, value) {
  if (value === undefined || value === null) return ''
  return dict[value] || value
}

// 字典转 el-select 可用的 options
export function dictToOptions(dict, { includeAll = false } = {}) {
  const options = Object.keys(dict).map(key => ({
    label: dict[key],
    value: isNaN(key) ? key : Number(key)
  }))

  if (includeAll) {
    options.unshift({ label: '全部', value: '' })
  }

  return options
}