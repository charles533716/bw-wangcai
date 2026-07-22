const assert = require('assert')
const fs = require('fs')
const path = require('path')

const indexPath = path.resolve(__dirname, '../src/views/site/config/index.vue')
const securityPath = path.resolve(__dirname, '../src/views/site/config/SecuritySettings.vue')
const indexSource = fs.readFileSync(indexPath, 'utf8')
const securitySource = fs.readFileSync(securityPath, 'utf8')

assert(indexSource.includes('label="安全设置"'), '站点配置页缺少安全设置 Tab')
assert(indexSource.includes('name="security"'), '安全设置 Tab 缺少稳定名称')
assert(indexSource.includes('SecuritySettings'), '站点配置页未注册安全设置组件')

;['手机号唯一绑定', '银行卡唯一绑定', '支付宝唯一绑定', '微信唯一绑定'].forEach(label => {
  assert(securitySource.includes(label), `缺少配置项：${label}`)
})

assert(
  securitySource.includes('开启后，同一实名信息在当前站点内只能归属一个用户。用户解绑、删除收款方式或注销账号后，历史归属关系仍保留，不允许其他用户绑定。'),
  '安全设置页缺少统一说明'
)
assert.strictEqual((securitySource.match(/defaultValue: true/g) || []).length, 4, '四个开关必须默认开启')
assert(securitySource.includes('安全设置保存成功'), '安全设置页缺少保存成功提示')
assert(securitySource.includes('localStorage'), '安全设置页缺少本地状态保存行为')

console.log('PASS 站点安全设置页面检查通过')
