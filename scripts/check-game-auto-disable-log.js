const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const menu = read('src/utils/testEnvironmentMenu.js')
const catalog = read('src/mock/resourceCatalog.js')
const api = read('src/api/resources/gameAutoDisableLog.js')
const page = read('src/views/resources/gameAutoDisableLog/index.vue')

const checks = [
  ['隐藏实名通道', /RESOURCE_HIDDEN_PATHS[\s\S]*realNameChannel/.test(menu)],
  ['资源管理展示游戏自动下架日志', menu.includes("title: '游戏自动下架日志'")],
  ['自动下架日志位于游戏分组之后', /orderedResourceChildren[\s\S]*gameAutoDisableLogRoute/.test(menu)],
  ['生成50条自动下架日志', /makeGameAutoDisableLogs\(50\)/.test(catalog)],
  ['自动下架日志使用本地分页数据', api.includes("getResourceCatalogPage('/resources/gameAutoDisableLog'")],
  ['保留详情弹窗', page.includes('title="自动下架日志详情"') && page.includes('@click="handleDetail(scope.row)"')]
]

const failed = checks.filter(([, passed]) => !passed)
if (failed.length) {
  failed.forEach(([name]) => console.error(`FAIL: ${name}`))
  process.exit(1)
}

checks.forEach(([name]) => console.log(`PASS: ${name}`))
