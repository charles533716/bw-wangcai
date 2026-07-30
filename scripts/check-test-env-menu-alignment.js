const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const routerSource = fs.readFileSync(path.join(rootDir, 'src/router/index.js'), 'utf8')
const alignmentSource = fs.readFileSync(
  path.join(rootDir, 'src/utils/testEnvironmentMenu.js'),
  'utf8'
)

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

assert(
  !routerSource.includes("path: '/revisionNotes'"),
  '本周需求说明一级菜单仍然存在'
)

const expectedTitles = ['开站申请', '站点列表', '站点场馆管理', '站点素材管理']

expectedTitles.forEach(title => {
  assert(alignmentSource.includes(`'${title}'`), `站点管理缺少菜单：${title}`)
})

const siteMenuBlock = alignmentSource.match(/const SITE_MENU_ITEMS = \{([\s\S]*?)\n\}/)
const configuredItems = siteMenuBlock
  ? siteMenuBlock[1].match(/^\s{2}(apply|site|venue|resource):/gm) || []
  : []
assert(configuredItems.length === 4, `站点管理应保留 4 个子菜单，当前为 ${configuredItems.length} 个`)
assert(
  alignmentSource.includes("const SITE_MENU_ORDER = ['apply', 'site', 'venue', 'resource']"),
  '站点管理子菜单顺序与测试环境不一致'
)
assert(
  alignmentSource.includes("route.path !== '/revisionNotes'"),
  '菜单对齐层没有过滤本周需求说明'
)

assert(
  alignmentSource.includes("const RESOURCE_MENU_FIRST_COMPONENT = 'resources/template/index'"),
  '资源管理未指定站内信页面为首项'
)
assert(
  alignmentSource.includes("title: '站内信'"),
  '资源管理首项未更名为站内信'
)
assert(
  alignmentSource.includes("const RESOURCE_GAME_LIST_PATH = 'gameList'"),
  '资源管理未指定游戏列表二级菜单'
)
assert(
  alignmentSource.indexOf('...(gameList ? [gameList] : [])') >
    alignmentSource.indexOf("title: '站内信'"),
  '游戏列表未排在站内信下方'
)
assert(
  alignmentSource.includes("const RESOURCE_SKIN_PATH = 'skin'") &&
    alignmentSource.includes("title: '前端皮肤'"),
  '资源管理未将皮肤管理更名为前端皮肤'
)
assert(
  alignmentSource.indexOf("title: '前端皮肤'") >
    alignmentSource.indexOf('...(gameList ? [gameList] : [])'),
  '前端皮肤未排在游戏列表下方'
)
const resourceMenuNames = [
  'App版本管理',
  '三方游戏币种配置',
  '短信通道管理',
  '区号配置',
  '短信发送记录',
  '游戏线路管理',
  '游戏厂商管理',
  '游戏管理',
  '游戏分组管理'
]
resourceMenuNames.forEach(title => {
  assert(alignmentSource.includes(`'${title}'`), `资源管理缺少菜单：${title}`)
})
assert(
  alignmentSource.includes(
    "const RESOURCE_MENU_ORDER = Object.keys(RESOURCE_MENU_ITEMS)"
  ),
  '资源管理未按测试环境配置二级菜单顺序'
)

assert(
  routerSource.includes("path: 'gameList'") &&
    routerSource.includes("component: () => import('@/views/game/index')"),
  '资源管理未复用现有游戏列表页面'
)

const resourceMockSource = fs.readFileSync(
  path.join(rootDir, 'src/mock/resourceCatalog.js'),
  'utf8'
)
const expectedMockCounts = {
  smsChannel: 2,
  areaCode: 4,
  smsLog: 200,
  gameLine: 3,
  gameFactory: 25,
  gameBase: 150,
  gameGroup: 50
}
Object.entries(expectedMockCounts).forEach(([key, count]) => {
  const directArray = new RegExp(`'/resources/${key}':\\s*make\\w+\\(${count}\\)`)
  const noArgFactory = new RegExp(`'/resources/${key}':\\s*make\\w+\\(\\)`)
  assert(
    directArray.test(resourceMockSource) || (count <= 4 && noArgFactory.test(resourceMockSource)),
    `${key} 未配置 ${count} 条原型数据`
  )
})

console.log('测试环境菜单对齐检查通过')
