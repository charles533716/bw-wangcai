const assert = require('assert')
const fs = require('fs')
const path = require('path')

const {
  cloneConfig,
  createInitialConfig,
  validateCategory
} = require('../src/views/site/config/webVenueDetailConfigModel')

const config = createInitialConfig()
assert.strictEqual(config.categories.length, 8)
assert.deepStrictEqual(
  config.categories.filter(item => item.mode === 'detail').map(item => item.type),
  ['电竞', '棋牌', '真人', '彩票', '体育']
)
assert.deepStrictEqual(
  config.categories.filter(item => item.mode === 'icon').map(item => item.type),
  ['捕鱼', '电子', '哈希']
)
config.categories.forEach(category => assert.strictEqual(validateCategory(category).valid, true))

const duplicate = cloneConfig(config).categories[6]
duplicate.rows[1].venueName = duplicate.rows[0].venueName
assert.strictEqual(validateCategory(duplicate).message, '体育场馆不能重复')

const longDescription = cloneConfig(config).categories[6]
longDescription.rows[0].description = '体'.repeat(151)
assert.strictEqual(validateCategory(longDescription).message, '体育 - IM体育的场馆文案不能超过 150 字')

const missingDetailImage = cloneConfig(config).categories[6]
missingDetailImage.rows[0].gameImage = ''
assert.strictEqual(validateCategory(missingDetailImage).message, '请上传体育 - IM体育的游戏图片')

const missingHoverIcon = cloneConfig(config).categories[4]
missingHoverIcon.rows[0].hoverIcon = ''
assert.strictEqual(validateCategory(missingHoverIcon).message, '请上传电子 - 博雅电子的鼠标悬停后图标')

const emptyRows = cloneConfig(config).categories[0]
emptyRows.rows = []
assert.strictEqual(validateCategory(emptyRows).message, '捕鱼至少保留一个场馆')

const componentSource = fs.readFileSync(
  path.resolve(__dirname, '../src/views/site/config/WebVenueDetailConfig.vue'),
  'utf8'
)
assert.strictEqual(
  componentSource.includes('const ImageField ='),
  false,
  '上传字段不能依赖 Vue 运行时无法编译的字符串模板组件'
)
assert(componentSource.includes('<span>游戏图片</span>'), '详情类型必须直接渲染游戏图片上传字段')
assert(componentSource.includes('鼠标悬停前'), '图标类型必须直接渲染鼠标悬停前上传字段')
assert(componentSource.includes('鼠标悬停后'), '图标类型必须直接渲染鼠标悬停后上传字段')

console.log('WEB 场馆详情配置模型验证通过')
