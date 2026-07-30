const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function requireText(source, text, context) {
  if (!source.includes(text)) {
    throw new Error(`${context} 缺少：${text}`)
  }
}

const permission = read('src/store/modules/permission.js')
const gameReport = read('src/views/report/venueGame/index.vue')
const memberReport = read('src/views/report/venueMemberProfit/index.vue')

requireText(permission, "route.meta.icon = 'chart'", '场馆游戏报表一级菜单')

;[
  '选择站点', '场馆名称', '游戏名称', '货币种类', '日期范围',
  '投注人数', '场馆', '站点', '注单数', '投注总额', '投注总盈亏',
  '353'
].forEach(text => requireText(gameReport, text, '场馆游戏报表'))

;[
  '选择站点', '场馆名称', '游戏名称', '会员名称/ID', '上级代理',
  '风控标签', '货币种类', '日期范围', 'VIP等级',
  '投注总额', '投注总盈亏', '50'
].forEach(text => requireText(memberReport, text, '场馆游戏会员盈亏报表'))

console.log('场馆游戏报表页面静态验收通过')
