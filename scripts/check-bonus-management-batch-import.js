const fs = require('fs')
const path = require('path')

const helper = require('../src/views/funds/bonusManagement/batchBonusImport')
const componentFile = path.resolve(__dirname, '../src/views/funds/bonusManagement/BatchBonusImportPanel.vue')
const pageFile = path.resolve(__dirname, '../src/views/funds/bonusManagement/index.vue')

if (!fs.existsSync(componentFile)) {
  throw new Error('缺少红利批量导入组件')
}

const memberResult = helper.createBonusImportDemo({
  walletType: 'center',
  bonusType: 'agentFirstDeposit'
})
const standardMemberResult = helper.createBonusImportDemo({
  walletType: 'venue',
  bonusType: 'activity'
})
const agentResult = helper.createBonusImportDemo({
  walletType: 'commission',
  bonusType: 'agentBonus'
})

const expectations = [
  ['代理线下首存正常数据230条', memberResult.validRows.length === 230],
  ['代理线下首存警告数据6条', memberResult.warningRows.length === 6],
  ['代理线下首存异常数据14条', memberResult.invalidRows.length === 14],
  ['普通会员红利不展示警告数据', standardMemberResult.warningRows.length === 0],
  ['佣金钱包正常数据230条', agentResult.validRows.length === 230],
  ['佣金钱包异常数据14条', agentResult.invalidRows.length === 14],
  ['会员模板字段正确', helper.getBonusTemplateHeaders('center').join(',') === '会员账号,金额'],
  ['代理模板字段正确', helper.getBonusTemplateHeaders('commission').join(',') === '代理账号,金额']
]

const componentSource = fs.readFileSync(componentFile, 'utf8')
const pageSource = fs.readFileSync(pageFile, 'utf8')
expectations.push(
  ['上传后切换重新上传', /uploadedFileName\s*\?\s*'重新上传'\s*:\s*'上传文件'/.test(componentSource)],
  ['包含正常待发放红利总额', componentSource.includes('正常待发放红利总额')],
  ['警告数据仅代理线下首存展示', /bonusType\s*===\s*'agentFirstDeposit'/.test(componentSource)],
  ['警告支持标记正常和删除', componentSource.includes('标记正常') && componentSource.includes('删除')],
  ['页面复用批量导入组件', /<batch-bonus-import-panel/.test(pageSource)]
)

const failures = expectations.filter(([, passed]) => !passed)
if (failures.length) {
  console.error(`红利批量导入检查失败：${failures.map(([label]) => label).join('、')}`)
  process.exit(1)
}

console.log('红利批量导入检查通过')
