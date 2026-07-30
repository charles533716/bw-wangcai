const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/utils/testEnvironmentMenu.js'),
  'utf8'
)

const expectedItems = [
  ['marketdata', '市场数据统计表'],
  ['withdrawtransfer', '充提转账统计'],
  ['siteprofitdetail', '站点利润明细'],
  ['site', '站点报表'],
  ['memberchangerecord', '账变记录'],
  ['transferdetail', '站点/代理转账明细报表'],
  ['memberpromotionbenefit', '会员推广福利明细'],
  ['memberpromotionstats', '会员推广统计报表'],
  ['rebate', '会员投注返水报表'],
  ['bonus', '礼金统计报表'],
  ['dropSignAnalysis', '掉签分析']
]

expectedItems.forEach(([routePath, title]) => {
  if (!source.includes(`${routePath}: '${title}'`)) {
    throw new Error(`运营报表菜单缺少或名称不正确: ${routePath} -> ${title}`)
  }
})

if (!source.includes("nextRoute.path === '/report'")) {
  throw new Error('运营报表菜单未接入测试环境对齐逻辑')
}

console.log('运营报表菜单对齐检查通过')
