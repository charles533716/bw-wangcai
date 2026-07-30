const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../src/views/funds/bonusManagement/index.vue')
const source = fs.readFileSync(file, 'utf8')

const checks = [
  ['场馆钱包支持多选', /v-model="form\.venueCodes"[\s\S]*?multiple/],
  ['佣金钱包使用独立配置分支', /form\.walletType === 'commission'/],
  ['佣金钱包红利类型固定为代理红利', /代理红利/],
  ['佣金钱包单笔发放展示代理账号', /label="代理账号"/],
  ['佣金钱包仅保留无需流水限制', /commission[\s\S]*?无需流水限制/],
  ['佣金钱包批量发放展示导入文件', /commission[\s\S]*?operationType === 'batch'[\s\S]*?导入文件/]
]

const failures = checks.filter(([, pattern]) => !pattern.test(source))

if (failures.length) {
  console.error(`红利管理钱包场景检查失败：${failures.map(([label]) => label).join('、')}`)
  process.exit(1)
}

console.log('红利管理钱包场景检查通过')
