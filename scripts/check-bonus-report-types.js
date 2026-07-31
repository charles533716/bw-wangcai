const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../src/views/report/bonus/index.vue')
const source = fs.readFileSync(file, 'utf8')
const start = source.indexOf('const DEFAULT_BONUS_TYPE_OPTIONS = [')
const end = source.indexOf('const DEFAULT_STATUS_OPTIONS')
const optionsBlock = source.slice(start, end)

if (start < 0 || end < 0) {
  console.error('未找到礼金统计报表礼金类型配置')
  process.exit(1)
}

if (optionsBlock.includes('代理线下首存')) {
  console.error('礼金统计报表仍包含“代理线下首存”类型')
  process.exit(1)
}

const retainedTypes = ['活动礼金', '晋升礼金', '周礼金', '月礼金', '活动彩金', '首充彩金', '推广彩金', '平台彩金']
const missingTypes = retainedTypes.filter(label => !optionsBlock.includes(`dictLabel: '${label}'`))

if (missingTypes.length) {
  console.error(`礼金统计报表误删类型：${missingTypes.join('、')}`)
  process.exit(1)
}

console.log('礼金统计报表礼金类型检查通过')
