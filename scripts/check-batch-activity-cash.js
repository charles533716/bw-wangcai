const assert = require('assert')
const fs = require('fs')
const path = require('path')

const batchModulePath = path.resolve(__dirname, '../src/views/funds/mainBalance/batchActivityCash.js')
const {
  validateBatchActivityCashRows,
  getBatchActivityCashDemoRows,
  getBatchActivityCashTemplateRows,
  paginateBatchRows,
  getBatchRowSequence
} = require(batchModulePath)

function testDuplicateRule() {
  const differentTypes = validateBatchActivityCashRows([
    { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: 'wc10086', amount: 100, turnoverMultiple: 1 },
    { siteName: '旺财体育', bonusType: '推广彩金', memberAccount: 'wc10086', amount: 100, turnoverMultiple: 1 }
  ])
  assert.strictEqual(differentTypes.validRows.length, 2, '同站点同会员但彩金类型不同不应判重')

  const exactDuplicates = validateBatchActivityCashRows([
    { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: 'wc10086', amount: 100, turnoverMultiple: 1 },
    { siteName: '旺财体育', bonusType: '活动彩金', memberAccount: 'wc10086', amount: 200, turnoverMultiple: 2 }
  ])
  assert.strictEqual(exactDuplicates.validRows.length, 1, '三字段首次出现的数据应保留为正常数据')
  assert.strictEqual(exactDuplicates.invalidRows.length, 1, '三字段完全相同时仅后出现的数据应判重')
  assert(exactDuplicates.invalidRows[0].errorText.includes('重复数据'), '重复行应展示重复原因')
}

function testValidationRules() {
  const result = validateBatchActivityCashRows([
    { siteName: '不存在站点', bonusType: '活动彩金', memberAccount: 'ghost', amount: 100, turnoverMultiple: 1 },
    { siteName: '财神体育', bonusType: '活动彩金', memberAccount: 'unknown_member', amount: 100, turnoverMultiple: 1 },
    { siteName: 'DW体育', bonusType: '推广彩金', memberAccount: 'dw20001', amount: 0, turnoverMultiple: 1 },
    { siteName: '财神体育', bonusType: '平台彩金', memberAccount: 'cs30001', amount: 300, turnoverMultiple: -1 }
  ])
  assert.strictEqual(result.invalidRows.length, 4)
  assert(result.invalidRows[0].errorText.includes('无此站点'))
  assert(result.invalidRows[1].errorText.includes('无此会员'))
  assert(result.invalidRows[2].errorText.includes('金额必须大于0'))
  assert(result.invalidRows[3].errorText.includes('流水倍数不能为负数'))
}

function testDemoAndTemplateRows() {
  const demo = validateBatchActivityCashRows(getBatchActivityCashDemoRows())
  const templateRows = getBatchActivityCashTemplateRows()
  const expectedErrors = [
    '所属站点不能为空',
    '彩金类型不能为空',
    '会员账号不能为空',
    '单会员活动彩金金额不能为空',
    '提现所需流水倍数不能为空',
    '查询无此站点',
    '该站点下查询无此会员',
    '彩金类型仅支持推广彩金、活动彩金、平台彩金',
    '彩金金额必须为数字',
    '彩金金额必须大于0',
    '流水倍数必须为数字',
    '流水倍数不能为负数',
    '所属站点、会员账号、彩金类型重复数据'
  ]
  const actualErrors = demo.invalidRows.map(row => row.errorText)
  assert.strictEqual(demo.validRows.length, 230, '演示导入应包含 230 条正常数据')
  assert.strictEqual(demo.invalidRows.length, 13, '演示导入应保留 13 类异常数据')
  assert.strictEqual(demo.allRows.length, 243, '演示导入总数应为 243 条')
  assert.deepStrictEqual(actualErrors, expectedErrors, '演示异常数据应覆盖全部场景且每类仅展示一次')
  assert(demo.invalidRows.every(row => row.errors.length === 1), '每条演示异常数据只应对应一个异常原因')
  assert.strictEqual(new Set(actualErrors).size, actualErrors.length, '演示异常原因不应重复')
  assert(templateRows.length >= 3, '示例 Excel 应包含至少三条正确示例')
  assert(demo.validAmount > 0, '正常数据应能汇总彩金金额')
}

function testPaginationRules() {
  const demo = validateBatchActivityCashRows(getBatchActivityCashDemoRows())
  assert.strictEqual(paginateBatchRows(demo.validRows, 1, 20).length, 20, '默认每页应展示 20 条')
  assert.strictEqual(paginateBatchRows(demo.validRows, 12, 20).length, 10, '20 条分页最后一页应展示 10 条')
  assert.strictEqual(paginateBatchRows(demo.validRows, 5, 50).length, 30, '50 条分页最后一页应展示 30 条')
  assert.strictEqual(paginateBatchRows(demo.validRows, 3, 100).length, 30, '100 条分页最后一页应展示 30 条')
  assert.strictEqual(getBatchRowSequence(2, 20, 0), 21, '第二页第一条序号应为 21')
}

function testBatchInterfaceCopy() {
  const viewPath = path.resolve(__dirname, '../src/views/funds/mainBalance/index.vue')
  const viewSource = fs.readFileSync(viewPath, 'utf8')
  ;['批量导入', '下载示例Excel', '正常数据', '异常数据', '确认批量发放'].forEach(copy => {
    assert(viewSource.includes(copy), `页面缺少批量导入文案：${copy}`)
  })
  assert.strictEqual((viewSource.match(/label="序号"/g) || []).length, 2, '正常和异常列表都应展示序号')
  assert.strictEqual((viewSource.match(/:page-sizes="\[20, 50, 100\]"/g) || []).length, 2, '正常和异常列表都应支持 20、50、100 条分页')
  assert(viewSource.includes('batchValidPageSize: 20'), '正常数据分页默认应为 20 条')
  assert(viewSource.includes('batchInvalidPageSize: 20'), '异常数据分页默认应为 20 条')
  assert(/<el-upload[\s\S]*?v-if="!batchImportFileName"/.test(viewSource), '导入完成后应隐藏 Excel 上传区域')
  assert(viewSource.includes('class="batch-reupload"'), '导入完成后应保留紧凑的重新导入入口')
  assert(viewSource.includes('重新导入Excel'), '重新导入入口文案应清晰可见')
  assert(viewSource.includes('class="redpacket-dialog__close"'), '单笔发放和批量导入弹窗右上角都应显示醒目的关闭按钮')
  assert(viewSource.includes('aria-label="关闭弹窗"'), '关闭按钮应提供明确的无障碍名称')
  assert(viewSource.includes(':close-on-click-modal="true"'), '点击弹窗外的灰色遮罩应关闭单笔发放和批量导入弹窗')
  assert(viewSource.includes('@click.native.self="redPacketOpen = false"'), '弹窗遮罩应有明确的点击关闭兜底处理')
}

function testRevisionNoteCopy() {
  const notePath = path.resolve(__dirname, '../src/utils/revisionNotes/master.js')
  const noteSource = fs.readFileSync(notePath, 'utf8')
  ;[
    "exact: ['/funds/mainBalance']",
    '所属站点 + 会员账号 + 彩金类型',
    '异常数据不阻断正常数据继续发放',
    '单会员活动彩金金额',
    '提现所需流水倍数',
    '每类异常场景只展示一条',
    '后出现的记录',
    '默认每页 20 条',
    '230 条正常数据',
    '序号位于行号之前'
  ].forEach(copy => {
    assert(noteSource.includes(copy), `业务及需求说明缺少批量规则：${copy}`)
  })
}

testDuplicateRule()
testValidationRules()
testDemoAndTemplateRows()
testPaginationRules()
testBatchInterfaceCopy()
testRevisionNoteCopy()
console.log('PASS 批量活动彩金数据校验通过')
