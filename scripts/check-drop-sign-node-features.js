const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/views/report/dropSignAnalysis/index.vue'),
  'utf8'
)

const requiredTexts = [
  '掉签记录',
  '导出数据',
  '掉签时间输入',
  '掉签站点',
  '生成掉签节点',
  '命中会员数',
  '创建人',
  '创建时间'
]

requiredTexts.forEach(text => {
  if (!source.includes(text)) {
    throw new Error(`掉签分析缺少功能或字段：${text}`)
  }
})

if (!source.includes('generateDropSignNode')) {
  throw new Error('掉签节点生成交互未实现')
}

console.log('掉签分析节点功能检查通过')
