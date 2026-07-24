const fs = require('fs')

const page = fs.readFileSync('src/views/activity/rewardDetail/index.vue', 'utf8')
const permission = fs.readFileSync('src/store/modules/permission.js', 'utf8')

function assertIncludes(source, expected, message) {
  if (!source.includes(expected)) {
    throw new Error(message)
  }
}

assertIncludes(permission, "path: 'manualPayout'", '活动管理缺少手动派彩菜单')
assertIncludes(permission, "title: '手动派彩'", '手动派彩菜单标题不正确')
assertIncludes(permission, "component: 'activity/rewardDetail/index'", '手动派彩未复用奖励明细页面')
assertIncludes(page, "this.$route.path.includes('/activity/manualPayout')", '手动派彩页面缺少路由模式判断')
assertIncludes(page, '手动派彩列表', '手动派彩页面缺少列表标题')
assertIncludes(page, 'Array.from({ length: 280 }', '手动派彩页面未生成280条演示数据')
assertIncludes(page, 'v-if="canManualPayout(row)"', '手动派彩按钮未按领取状态控制')
assertIncludes(page, "Number(row && row.bonusStatus) === 1", '手动派彩按钮未限定已达标状态')
assertIncludes(page, "1: '已达标'", '手动派彩状态缺少已达标')
assertIncludes(page, "2: '已派彩'", '手动派彩状态缺少已派彩')
assertIncludes(page, "3: '已领取'", '手动派彩状态缺少已领取')
assertIncludes(page, "return this.isManualPayout ? '状态' : '领取状态'", '手动派彩筛选未改为状态')
assertIncludes(page, "return this.isManualPayout ? '派彩时间' : '达标时间'", '手动派彩列表未改为派彩时间')
assertIncludes(page, '<el-table-column v-if="!isManualPayout" label="任务名称"', '手动派彩列表仍展示任务名称字段')
assertIncludes(page, "this.$set(row, 'bonusStatusLabel', '已派彩')", '派彩后未更新为已派彩')
assertIncludes(page, "this.$set(row, 'payoutTime', payoutTime)", '派彩后未写入派彩时间')

console.log('manual payout page check passed')
