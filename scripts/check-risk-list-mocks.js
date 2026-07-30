const fs = require('fs')
const path = require('path')
const vm = require('vm')

const sourcePath = path.resolve(__dirname, '../src/mock/riskMockData.js')
const prototypeSourcePath = path.resolve(__dirname, '../src/mock/prototype.js')

if (!fs.existsSync(sourcePath)) {
  throw new Error('缺少 src/mock/riskMockData.js')
}

const source = fs.readFileSync(sourcePath, 'utf8')
  .replace(/export\s+const\s+/g, 'const ')
  .replace(/export\s+function\s+/g, 'function ')
  .concat('\nmodule.exports = { RISK_MOCK_KEYS, buildRiskMockRows, isSeededRiskMockKey, sanitizeRiskMockRows }\n')

const sandbox = { module: { exports: {} }, exports: {} }
vm.runInNewContext(source, sandbox, { filename: sourcePath })

const {
  RISK_MOCK_KEYS,
  buildRiskMockRows,
  isSeededRiskMockKey,
  sanitizeRiskMockRows
} = sandbox.module.exports

const prototypeSource = fs.readFileSync(prototypeSourcePath, 'utf8')
const normalizePathSource = prototypeSource.match(/function normalizePath\(url=""\)\{.*?\}(?=function parseQuery)/)
const isListPathSource = prototypeSource.match(/function isListPath\(path=""\)\{.*?\}(?=function isSummaryPath)/)

if (!normalizePathSource || !isListPathSource) {
  throw new Error('无法读取 prototype.js 的列表请求识别逻辑')
}

const listPathSandbox = { module: { exports: {} }, URL }
vm.runInNewContext(
  `${normalizePathSource[0]}\n${isListPathSource[0]}\nmodule.exports = { isListPath }\n`,
  listPathSandbox,
  { filename: prototypeSourcePath }
)

const { isListPath } = listPathSandbox.module.exports
const riskListApiPaths = [
  '/api/admin/risk/getRiskTypeList',
  '/api/admin/risk/getRiskRuleList',
  '/api/admin/risk/getUserRiskRecordList',
  '/api/admin/risk/getMemberBlacklistList',
  '/api/admin/risk/getRiskIpWhitelistList',
  '/api/admin/risk/getRiskUserWhitelistList'
]

riskListApiPaths.forEach((apiPath) => {
  if (!isListPath(apiPath)) {
    throw new Error(`${apiPath} 未被识别为列表请求，页面将无法读取 Mock 列表`)
  }
})

if (!Array.isArray(RISK_MOCK_KEYS) || RISK_MOCK_KEYS.length !== 6) {
  throw new Error('风控 Mock 页面必须恰好为 6 个')
}

RISK_MOCK_KEYS.forEach((key) => {
  if (!isSeededRiskMockKey(key)) {
    throw new Error(`${key} 未被识别为风控 Mock 页面`)
  }
  const rows = buildRiskMockRows(key)
  if (!Array.isArray(rows) || rows.length !== 100) {
    throw new Error(`${key} 应生成 100 条数据，实际为 ${rows && rows.length}`)
  }
  const ids = new Set(rows.map((row) => row.id))
  if (ids.size !== 100) {
    throw new Error(`${key} 存在重复 ID`)
  }

  const invalidRows = [
    { id: 101, status: 0, createTime: '2026-07-30 07:38:38' },
    { id: 102, status: 0, createTime: '2026-07-30 07:38:39' }
  ]
  const sanitizedRows = sanitizeRiskMockRows(key, [...invalidRows, ...rows])
  if (sanitizedRows.length !== rows.length) {
    throw new Error(`${key} 清理后应只保留原有 ${rows.length} 条有效数据，实际为 ${sanitizedRows.length}`)
  }
  if (sanitizedRows.some((row) => Number(row.id) >= 101 && !rows.includes(row))) {
    throw new Error(`${key} 未清除缺少业务字段的历史空白数据`)
  }
})

console.log('风控列表 Mock 校验通过：6 个页面均能生成有效数据并清理历史空白行')
