const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../src/views/funds/bonusManagement/index.vue')
const source = fs.readFileSync(file, 'utf8')

const checks = [
  ['场馆钱包仅支持单选', /v-model="form\.venueCode"[\s\S]*?<el-option/],
  ['场馆钱包不再使用多选', source => !/v-model="form\.venueCode"[\s\S]{0,240}?\bmultiple\b/.test(source)],
  ['操作类型使用单笔发放', /label="single">单笔发放<\/el-radio-button>/],
  ['站点金额使用今日口径', /今日可发放金额[\s\S]*?今日已发放金额[\s\S]*?今日剩余可发放金额/],
  ['今日剩余金额按减法计算', /siteRemainingAmount/],
  ['中心和场馆钱包支持红利标题类型', /label="红利标题类型"[\s\S]*?选择活动[\s\S]*?自定义/],
  ['红利标题默认自定义', /bonusTitleType:\s*'custom'/],
  ['自定义标题限制30字', /placeholder="请输入红利标题，最多30字"[\s\S]*?maxlength="30"/],
  ['活动标题支持关键词搜索', /v-model="form\.bonusTitle"[\s\S]*?filterable[\s\S]*?currentActivityOptions/],
  ['佣金钱包使用独立配置分支', /form\.walletType === 'commission'/],
  ['佣金钱包红利类型固定为代理红利', /代理红利/],
  ['佣金钱包单笔发放展示代理账号', /label="代理账号"/],
  ['佣金钱包仅保留无需流水限制', /commission[\s\S]*?无需流水限制/],
  ['佣金钱包批量发放展示导入文件', /commission[\s\S]*?operationType === 'batch'[\s\S]*?导入文件/],
  ['批量导入组件暴露提交后重置引用', /ref="batchImportPanel"/],
  ['提交后更新今日已发放金额', /currentSite\.todayIssued\s*=\s*Number\(\(currentSite\.todayIssued\s*\+\s*submitAmount\)\.toFixed\(2\)\)/],
  ['提交后同步今日剩余可发放金额', /currentSite\.remaining\s*=\s*Math\.max\(0,\s*currentSite\.fundPool\s*-\s*currentSite\.todayIssued\)/],
  ['单笔提交后清空账号和金额', /resetSingleGrantFields\(\)[\s\S]*?memberAccount\s*=\s*''[\s\S]*?agentAccount\s*=\s*''[\s\S]*?amount\s*=\s*''/],
  ['批量提交后移除上传文件', /resetBatchImport\(\)[\s\S]*?batchImportPanel\.resetUpload\(\)/]
]

const failures = checks.filter(([, check]) => typeof check === 'function' ? !check(source) : !check.test(source))

if (failures.length) {
  console.error(`红利管理钱包场景检查失败：${failures.map(([label]) => label).join('、')}`)
  process.exit(1)
}

console.log('红利管理钱包场景检查通过')
