const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/utils/testEnvironmentMenu.js'),
  'utf8'
)

const expectations = [
  ["sourceTitle: '游戏记录'", '游戏记录来源菜单'],
  ["title: '投注记录'", '投注记录目标名称'],
  ["sourceTitle: '资金账变'", '资金账变来源菜单'],
  ["title: '账户调整记录'", '账户调整记录目标名称'],
  ["new Set(['消息列表'])", '消息列表隐藏规则'],
  ['...orderedRecordChildren', '记录菜单固定排序'],
  ['...remainingRecordChildren', '记录菜单其余项目保留']
]

expectations.forEach(([needle, label]) => {
  if (!source.includes(needle)) {
    throw new Error(`缺少${label}: ${needle}`)
  }
})

console.log('记录管理菜单对齐检查通过')
