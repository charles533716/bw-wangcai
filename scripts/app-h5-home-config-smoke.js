const assert = require('assert')

const {
  cloneGroups,
  createInitialGroups,
  validateGroups
} = require('../src/views/site/config/appH5HomeConfigModel')

function expectInvalid(groups, expectedMessage) {
  const result = validateGroups(groups)
  assert.strictEqual(result.valid, false)
  assert.strictEqual(result.message, expectedMessage)
}

const initialGroups = createInitialGroups()
assert.strictEqual(initialGroups.length, 8, '应创建 8 个场馆类型')
assert.strictEqual(
  initialGroups.reduce((total, group) => total + group.venues.length, 0),
  30,
  '应创建 30 个场馆'
)
assert.strictEqual(validateGroups(initialGroups).valid, true, '初始数据应通过校验')

const invalidTypeRange = cloneGroups(initialGroups)
invalidTypeRange[0].sort = 9
expectInvalid(invalidTypeRange, '哈希的类型排序必须为 1-8 的整数')

const duplicateTypeSort = cloneGroups(initialGroups)
duplicateTypeSort[1].sort = 1
expectInvalid(duplicateTypeSort, '场馆类型排序不能重复')

const invalidVenueRange = cloneGroups(initialGroups)
invalidVenueRange[0].venues[0].sort = 3
expectInvalid(invalidVenueRange, '哈希 - 哈希分分彩的场馆排序必须为 1-2 的整数')

const duplicateVenueSort = cloneGroups(initialGroups)
duplicateVenueSort[2].venues[1].sort = 1
expectInvalid(duplicateVenueSort, '真人的场馆排序不能重复')

const missingImage = cloneGroups(initialGroups)
missingImage[7].venues[0].image = ''
expectInvalid(missingImage, '请上传捕鱼 - AG捕鱼的场馆图片')

const savedSnapshot = cloneGroups(initialGroups)
initialGroups[0].sort = 8
assert.strictEqual(savedSnapshot[0].sort, 1, '已保存快照不应被当前编辑联动修改')

console.log('APP/H5 首页配置模型验证通过')
