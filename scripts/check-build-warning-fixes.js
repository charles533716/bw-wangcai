const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const permissionSource = read('src/store/modules/permission.js')
assert(
  permissionSource.includes('`@/views/${normalizedView}.vue`'),
  'loadView must restrict dynamic route imports to .vue files'
)

const vueConfigSource = read('vue.config.js')
assert(
  vueConfigSource.includes('maxAssetSize') && vueConfigSource.includes('maxEntrypointSize'),
  'production performance limits must be explicit'
)

const requiredExports = {
  'src/api/funds/center.js': [
    'createHiPayQuickRechargeOrder',
    'createTronPayQuickRechargeOrder',
    'createXmfPayQuickRechargeOrder',
    'getFinanceCenterRecordTotal',
    'getQuickRechargeChannels',
    'getQuickWithdrawConfig',
    'submitFinanceCenterInternalTransfer',
    'submitQuickAlipayWithdraw',
    'submitQuickUsdtWithdraw',
    'updateFinanceCenterSettlement'
  ],
  'src/api/report/dashboard.js': ['getAgentExpenseDetails'],
  'src/api/system/config.js': ['getConfigKeyObj'],
  'src/api/system/user.js': [
    'getDomain',
    'getGoogleAuthQrCode',
    'getTelegramPromotionLinks',
    'updateUserGoogleAuth',
    'verifyGoogleCode'
  ],
  'src/api/funds/redPacket.js': ['getRedPacketClaims']
}

Object.entries(requiredExports).forEach(([file, exportNames]) => {
  const source = read(file)
  exportNames.forEach(name => {
    assert(
      new RegExp(`export\\s+function\\s+${name}\\s*\\(`).test(source),
      `${file} is missing export ${name}`
    )
  })
})

console.log('Build warning fix checks passed.')
