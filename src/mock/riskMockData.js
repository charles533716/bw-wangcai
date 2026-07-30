export const RISK_MOCK_KEYS = [
  '/risk/type',
  '/risk/rule',
  '/risk/record',
  '/risk/blacklist',
  '/risk/ipWhitelist',
  '/risk/userWhitelist'
]

const sites = [
  { id: 2222, code: '2222', name: '旺财体育' },
  { id: 333333, code: '333333', name: '财神体育' },
  { id: 8888, code: '8888', name: 'DW体育' },
  { id: 6666, code: '6666', name: '星河体育' }
]
const operators = ['admin', 'xiuxiu', 'xiaoyang', 'yolo', 'charles', 'clark', 'mike', 'bill']
const riskTypes = [
  ['大额充值监控', 'LARGE_DEPOSIT', '充值'],
  ['频繁提款监控', 'FREQUENT_WITHDRAW', '提款'],
  ['异常登录监控', 'ABNORMAL_LOGIN', '登录'],
  ['投注异常监控', 'ABNORMAL_BET', '投注'],
  ['同IP多账号', 'SAME_IP_MULTI_ACCOUNT', '会员'],
  ['设备关联监控', 'DEVICE_ASSOCIATION', '会员']
]
const modes = ['记录预警', '限制提款', '冻结账号']

function pad(value, length = 2) {
  return String(value).padStart(length, '0')
}

function dateTime(index, hourOffset = 0) {
  const day = (index % 28) + 1
  const hour = (9 + index + hourOffset) % 24
  return `2026-07-${pad(day)} ${pad(hour)}:${pad((index * 7) % 60)}:${pad((index * 13) % 60)}`
}

function baseRow(index) {
  const site = sites[index % sites.length]
  return {
    id: index + 1,
    siteId: site.id,
    siteCode: site.code,
    siteName: site.name,
    status: index % 7 === 0 ? 2 : 1,
    createTime: dateTime(index),
    updateTime: dateTime(index, 2),
    operator: operators[index % operators.length],
    operatorName: operators[index % operators.length],
    createBy: operators[index % operators.length],
    updateBy: operators[(index + 2) % operators.length]
  }
}

function buildTypeRows() {
  return Array.from({ length: 100 }, (_, index) => {
    const type = riskTypes[index % riskTypes.length]
    return {
      ...baseRow(index),
      typeName: `${type[0]}${Math.floor(index / riskTypes.length) + 1}`,
      riskTypeName: `${type[0]}${Math.floor(index / riskTypes.length) + 1}`,
      typeCode: `${type[1]}_${pad(index + 1, 3)}`,
      riskTypeCode: `${type[1]}_${pad(index + 1, 3)}`,
      typeDesc: `用于${type[2]}场景的风险识别与处置演示`
    }
  })
}

function buildRuleRows() {
  return Array.from({ length: 100 }, (_, index) => {
    const type = riskTypes[index % riskTypes.length]
    return {
      ...baseRow(index),
      type: type[2],
      businessType: type[2],
      ruleName: `${type[0]}规则${pad(index + 1, 3)}`,
      ruleCode: `RULE_${type[1]}_${pad(index + 1, 3)}`,
      ruleValue: JSON.stringify({ threshold: (index + 1) * 1000, count: (index % 5) + 1 }),
      mode: (index % 3) + 1,
      modeName: modes[index % modes.length],
      ruleDesc: `命中阈值后执行${modes[index % modes.length]}`
    }
  })
}

function buildRecordRows() {
  return Array.from({ length: 100 }, (_, index) => {
    const base = baseRow(index)
    const type = riskTypes[index % riskTypes.length]
    const userId = 100001 + index
    const agentId = 8001 + (index % 20)
    return {
      ...base,
      recordId: base.id,
      businessType: type[2],
      type: type[2],
      agentId,
      agentName: `agent${pad(agentId, 4)}`,
      parentAgentId: agentId,
      parentAgentName: `agent${pad(agentId, 4)}`,
      userId,
      memberId: userId,
      userName: `member${pad(index + 1, 4)}`,
      memberName: `member${pad(index + 1, 4)}`,
      userStatus: index % 9 === 0 ? 2 : 1,
      ruleId: 2001 + (index % 30),
      orderNo: `RISK202607${pad(index + 1, 6)}`,
      mode: (index % 3) + 1,
      riskReason: `${type[0]}：检测值超过配置阈值`,
      remark: `${type[0]}风险记录`
    }
  })
}

function buildBlacklistRows() {
  return Array.from({ length: 100 }, (_, index) => {
    const base = baseRow(index)
    const userId = 200001 + index
    const agentId = 9001 + (index % 20)
    return {
      ...base,
      userId,
      memberId: userId,
      userName: `black_member${pad(index + 1, 3)}`,
      memberName: `black_member${pad(index + 1, 3)}`,
      agentId,
      parentAgentId: agentId,
      agentName: `agent${pad(agentId, 4)}`,
      parentAgentName: `agent${pad(agentId, 4)}`,
      vipLevel: `VIP${index % 11}`,
      userStatus: index % 8 === 0 ? 2 : 1,
      triggerCount: (index % 12) + 1,
      riskRecordCount: (index % 12) + 1,
      blackReason: riskTypes[index % riskTypes.length][0],
      remark: `因${riskTypes[index % riskTypes.length][0]}加入黑名单`
    }
  })
}

function buildIpWhitelistRows() {
  return Array.from({ length: 100 }, (_, index) => ({
    ...baseRow(index),
    ip: `10.${(index % 10) + 1}.${Math.floor(index / 10) + 1}.${(index % 200) + 10}`,
    ipAddress: `10.${(index % 10) + 1}.${Math.floor(index / 10) + 1}.${(index % 200) + 10}`,
    whiteIp: `10.${(index % 10) + 1}.${Math.floor(index / 10) + 1}.${(index % 200) + 10}`,
    remark: index % 3 === 0 ? '办公网络白名单' : index % 3 === 1 ? '运维固定IP' : '合作方接口IP'
  }))
}

function buildUserWhitelistRows() {
  return Array.from({ length: 100 }, (_, index) => ({
    ...baseRow(index),
    userId: 300001 + index,
    memberId: 300001 + index,
    userName: `white_member${pad(index + 1, 3)}`,
    memberName: `white_member${pad(index + 1, 3)}`,
    remark: index % 2 === 0 ? '重点会员白名单' : '风控复核豁免用户'
  }))
}

const builders = {
  '/risk/type': buildTypeRows,
  '/risk/rule': buildRuleRows,
  '/risk/record': buildRecordRows,
  '/risk/blacklist': buildBlacklistRows,
  '/risk/ipWhitelist': buildIpWhitelistRows,
  '/risk/userWhitelist': buildUserWhitelistRows
}

export function isSeededRiskMockKey(key) {
  return Object.prototype.hasOwnProperty.call(builders, key)
}

export function buildRiskMockRows(key) {
  return isSeededRiskMockKey(key) ? builders[key]() : []
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function hasSite(row) {
  return hasValue(row.siteCode) && hasValue(row.siteName)
}

const rowValidators = {
  '/risk/type': row =>
    hasValue(row.typeName || row.riskTypeName) &&
    hasValue(row.typeCode || row.riskTypeCode),
  '/risk/rule': row =>
    hasSite(row) &&
    hasValue(row.ruleName) &&
    hasValue(row.ruleCode),
  '/risk/record': row =>
    hasSite(row) &&
    hasValue(row.userId || row.memberId) &&
    hasValue(row.userName || row.memberName) &&
    hasValue(row.ruleId),
  '/risk/blacklist': row =>
    hasSite(row) &&
    hasValue(row.userId || row.memberId) &&
    hasValue(row.userName || row.memberName),
  '/risk/ipWhitelist': row =>
    hasSite(row) &&
    hasValue(row.ipAddress || row.ip || row.whiteIp),
  '/risk/userWhitelist': row =>
    hasSite(row) &&
    hasValue(row.userId || row.memberId) &&
    hasValue(row.userName || row.memberName)
}

export function sanitizeRiskMockRows(key, rows) {
  if (!Array.isArray(rows) || !rowValidators[key]) return rows
  return rows.filter(row => row && rowValidators[key](row))
}
