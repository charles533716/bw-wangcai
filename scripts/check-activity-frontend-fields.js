const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function assertIncludes(source, expected, message) {
  if (!source.includes(expected)) {
    throw new Error(message + ': ' + expected)
  }
}

function assertOrder(source, values, message) {
  let previousIndex = -1
  values.forEach(value => {
    const nextIndex = source.indexOf(value, previousIndex + 1)
    if (nextIndex === -1 || nextIndex < previousIndex) {
      throw new Error(message + ': ' + value)
    }
    previousIndex = nextIndex
  })
}

const component = read('src/views/activity/manage/components/ActivityFrontendDisplayFields.vue')
const activityTemplate = read('src/views/activity/manage/components/ActivityForm.template.html')
const activityScript = read('src/views/activity/manage/components/ActivityForm.script.js')
const manageScript = read('src/views/activity/manage/index.script.js')
const manageTemplate = read('src/views/activity/manage/index.template.html')
const manageStyle = read('src/views/activity/manage/index.style.css')
const activityApi = read('src/api/activity/manage.js')
const commonTemplate = read('src/views/activity/manage/components/ActivityCommonForm.template.html')
const commonScript = read('src/views/activity/manage/components/ActivityCommonForm.script.js')
const dynamicSectionsScript = read('src/views/activity/manage/components/ActivityTypeDynamicSections.script.js')
const dynamicSectionsTemplate = read('src/views/activity/manage/components/ActivityTypeDynamicSections.template.html')
const firstDepositForm = read('src/views/activity/manage/components/FirstDepositActivityForm.vue')
const compactCommonScript = commonScript.replace(/\s+/g, '')
const schemas = read('src/views/activity/manage/components/activityTypeSchemas.js')

;['活动分类', '活动标签', '展示设备', '活动周期', '展示时间', '活动时间'].forEach(label => {
  assertIncludes(component, label, '共用展示配置缺少字段')
})
assertIncludes(component, ":type=\"isForeverPeriod ? 'datetime' : 'datetimerange'\"", '新人礼、签到和通用活动时间组件未支持时分秒')
assertIncludes(component, 'format="yyyy-MM-dd HH:mm:ss"', '共用展示配置未显示时分秒')
assertIncludes(component, 'value-format="yyyy-MM-dd HH:mm:ss"', '共用展示配置未提交时分秒')
assertIncludes(firstDepositForm, ":type=\"isForeverPeriod ? 'datetime' : 'datetimerange'\"", '首存、累充和有效投注额活动时间组件未支持时分秒')
assertIncludes(firstDepositForm, 'format="yyyy-MM-dd HH:mm:ss"', '首存类活动配置未显示时分秒')
assertIncludes(firstDepositForm, 'value-format="yyyy-MM-dd HH:mm:ss"', '首存类活动配置未提交时分秒')

assertIncludes(component, 'label="状态"', '共用展示配置缺少状态字段')
assertIncludes(component, 'active-value="0"', '状态开关缺少启用值')
assertIncludes(component, 'inactive-value="1"', '状态开关缺少禁用值')
assertIncludes(component, 'inactive-text="禁用"', '状态开关缺少禁用文案')
assertIncludes(component, 'active-text="启用"', '状态开关缺少启用文案')
assertIncludes(component, 'grid-template-columns: minmax(260px, 1fr) minmax(220px, 340px) max-content max-content;', '展示设备与状态字段间距过大')
assertIncludes(component, 'max-width: 1120px;', '共用展示配置缺少紧凑宽度限制')

;['最新', '体育', '真人', '电竞', '彩票', '棋牌', '电子', '捕鱼', '哈希'].forEach(label => {
  assertIncludes(component, `label: '${label}'`, '活动分类缺少选项')
})

;['全部', 'Web', 'APP/H5'].forEach(label => {
  assertIncludes(component, `label: '${label}'`, '展示设备缺少选项')
})

assertIncludes(activityTemplate, '<activity-frontend-display-fields', '新人礼/签到表单未接入展示配置')
assertIncludes(activityTemplate, ':is-edit="isEdit"', '新人礼/签到状态无法区分新增和编辑')
assertIncludes(activityScript, 'isFrontendDisplayActivity()', '新人礼/签到缺少活动类型限制')
assertIncludes(activityScript, 'NEWCOMER_ACTIVITY_TYPE_VALUE', '新人礼缺少活动类型识别')
assertIncludes(activityScript, 'ActivityFrontendDisplayFields', '新人礼/签到表单未注册共用组件')
assertIncludes(manageScript, "const CREATE_ACTIVITY_TYPE_ORDER = ['新人礼', '签到', '首存活动', COMMON_ACTIVITY_TYPE_LABEL, '累充', '每日投注额度+笔数', '连续每日投注', '连胜', '胜率']", '选择活动类型弹窗排序不正确')
assertIncludes(manageScript, "const ENABLED_CREATE_ACTIVITY_TYPES = new Set(['新人礼', '签到', '首存活动', COMMON_ACTIVITY_TYPE_LABEL, '累充', '每日投注额度+笔数'])", '累充或每日投注额度+笔数仍处于禁用状态')
assertIncludes(manageScript, "'累充': '累充活动'", '选择活动类型弹窗中的累充名称不正确')
assertIncludes(manageScript, "'每日投注额度+笔数': '有效投注额'", '选择活动类型弹窗中的有效投注额名称不正确')
;[
  "{ value: '25', label: '新人礼' }",
  "{ value: '27', label: '签到' }",
  "{ value: '26', label: '首存活动' }",
  "{ value: COMMON_ACTIVITY_TYPE, label: COMMON_ACTIVITY_TYPE_LABEL }",
  "{ value: '21', label: '累充活动' }",
  "{ value: '24', label: '有效投注额' }"
].forEach(option => {
  assertIncludes(manageScript, option, '活动列表筛选缺少指定活动类型')
})
assertIncludes(manageTemplate, '<el-autocomplete', '活动名称筛选未使用可搜索建议框')
assertIncludes(manageTemplate, ':fetch-suggestions="queryActivityNameSuggestions"', '活动名称筛选缺少关键词建议')
assertIncludes(manageTemplate, 'v-model="queryParams.siteCode"', '活动列表缺少站点筛选')
assertIncludes(manageTemplate, 'v-model="queryParams.activityTag"', '活动列表缺少活动标签筛选')
assertIncludes(manageTemplate, 'v-for="item in activityTagOptions"', '活动标签筛选缺少可选项')
assertIncludes(manageTemplate, 'multiple', '活动列表筛选缺少多选能力')
assertIncludes(manageTemplate, '展示时间', '活动列表缺少展示时间筛选')
assertIncludes(manageTemplate, '活动时间', '活动列表缺少活动时间筛选')
assertIncludes(manageTemplate, 'type="datetimerange"', '活动列表时间筛选未精确到时分秒')
assertIncludes(manageTemplate, 'format="yyyy-MM-dd HH:mm:ss"', '活动列表时间筛选界面未显示时分秒')
assertIncludes(manageTemplate, 'value-format="yyyy-MM-dd HH:mm:ss"', '活动列表时间筛选缺少秒级格式')
assertIncludes(manageTemplate, '>重置</el-button>', '活动列表缺少独立重置按钮')
const filterActionsTemplate = manageTemplate.slice(
  manageTemplate.indexOf('<div class="filter-actions">'),
  manageTemplate.indexOf('</div>', manageTemplate.indexOf('<div class="filter-actions">'))
)
assertOrder(filterActionsTemplate, ['>重置</el-button>', '>查询</el-button>', '>新增活动</el-button>'], '筛选区按钮顺序不正确')
if (filterActionsTemplate.includes('icon="el-icon-plus"')) {
  throw new Error('新增活动按钮仍展示加号图标')
}
assertIncludes(manageStyle, 'margin-left: auto;', '筛选区操作按钮未统一右对齐')
assertIncludes(manageStyle, 'width: 88px;', '筛选区三个按钮大小未统一')
assertIncludes(manageScript, 'displayTimeRange: []', '活动列表缺少展示时间查询状态')
assertIncludes(manageScript, 'activityTimeRange: []', '活动列表缺少活动时间查询状态')
assertIncludes(manageScript, 'queryActivityNameSuggestions', '活动名称筛选缺少建议查询方法')
assertIncludes(manageTemplate, 'label-width="80px"', '活动列表筛选项未使用常规标签表单布局')
assertIncludes(manageTemplate, 'class="filter-form__row filter-form__row--primary"', '活动列表筛选项缺少第一行布局')
assertIncludes(manageTemplate, 'class="filter-form__row filter-form__row--secondary"', '活动列表筛选项缺少第二行布局')
assertIncludes(manageStyle, '.filter-item--date', '活动列表时间筛选未设置加宽样式')
assertIncludes(manageStyle, 'width: 460px;', '活动列表时间筛选项宽度仍然过小')
assertIncludes(manageStyle, '.filter-item--date ::v-deep .el-range-editor.el-input__inner', '活动列表时间筛选缺少完整外框样式')
assertIncludes(manageStyle, 'background: transparent;', '活动列表时间筛选内部输入框仍会遮挡外框')
const primaryFilterRow = manageTemplate.slice(
  manageTemplate.indexOf('class="filter-form__row filter-form__row--primary"'),
  manageTemplate.indexOf('class="filter-form__row filter-form__row--secondary"')
)
assertOrder(primaryFilterRow, ['label="站点"', 'label="活动标题"', 'label="活动类型"', 'label="活动标签"', 'label="展示时间"'], '活动标题、活动标签或展示时间位置不正确')
assertIncludes(manageTemplate, 'placeholder="输入活动标题"', '活动标题筛选提示文案不正确')
if (manageStyle.includes('.filter-item,\n  .filter-item--date {\n    width: 100%;')) {
  throw new Error('活动列表筛选项仍会被强制拉满整行')
}
assertIncludes(activityApi, 'PROTOTYPE_ACTIVITY_ROWS', '活动列表缺少独立假数据')
assertIncludes(activityApi, 'ACTIVITY_DEMO_NAMES.length !== 20', '活动列表假数据数量不是20条')
assertIncludes(activityApi, 'buildPrototypeListResponse', '活动列表假数据未接入筛选和分页')
const activityTableTemplate = manageTemplate.slice(manageTemplate.indexOf('<el-table'), manageTemplate.indexOf('<div class="table-card__pagination">'))
assertOrder(activityTableTemplate, [
  'label="序号"',
  'label="站点"',
  'label="活动标题"',
  'label="活动类型"',
  'label="活动标签"',
  'label="展示时间"',
  'label="活动时间"',
  'label="排序"',
  'label="最后操作时间"',
  'label="最后操作人"',
  'label="状态"',
  'label="操作"'
], '活动列表字段顺序不正确')
assertIncludes(activityTableTemplate, 'label="序号" align="center" width="72" fixed="left"', '序号列未固定在左侧')
assertIncludes(activityTableTemplate, 'label="站点" align="center" min-width="110" fixed="left"', '站点列未固定在左侧')
assertIncludes(activityTableTemplate, 'label="活动标题" align="center" prop="activityName" min-width="220" fixed="left"', '活动标题列未固定在左侧')
assertIncludes(activityTableTemplate, 'label="状态" align="center" prop="status" min-width="120" fixed="right"', '状态列未固定在右侧')
assertIncludes(manageTemplate, '>编辑</el-button>', '活动列表操作项缺少编辑按钮')
assertIncludes(manageTemplate, '{{ activityTypeLabels(scope.row)[0].label }}', '活动列表未默认展示第一个活动类型')
assertIncludes(manageTemplate, '@click="showActivityTypes(scope.row)"', '活动列表缺少更多活动类型入口')
assertIncludes(manageTemplate, 'title="全部活动类型"', '活动列表缺少全部活动类型弹窗')
assertIncludes(manageTemplate, '<el-table-column label="序号"', '全部活动类型弹窗缺少序号字段')
assertIncludes(manageTemplate, '<el-table-column label="活动类型"', '全部活动类型弹窗缺少活动类型字段')
assertIncludes(manageScript, 'activityTypeLabels(row)', '活动列表缺少多活动类型转换方法')
assertIncludes(manageScript, 'showActivityTypes(row)', '活动列表缺少全部活动类型弹窗方法')
assertIncludes(manageStyle, '.activity-type-text', '活动列表缺少普通活动类型文字样式')
assertIncludes(manageStyle, 'color: #303133;', '活动标题或活动类型未使用黑色文字')
assertIncludes(activityApi, 'activityTag:', '活动列表假数据缺少活动标签')
assertIncludes(activityApi, 'splitQueryValues(query.activityTag)', '活动列表假数据未接入活动标签筛选')
assertIncludes(activityApi, 'activityTypes,', '活动列表假数据缺少多活动类型')
assertIncludes(activityApi, 'index % 5 === 0', '活动列表未限制为20%的活动展示多个活动类型')
assertIncludes(activityApi, 'operatorName:', '活动列表假数据缺少最后操作人')
assertIncludes(activityApi, "['admin', 'xiuxiu', 'xiaoyang', 'yolo', 'charles', 'clark', 'mike', 'bill']", '活动列表最后操作人未使用指定系统账号')
assertIncludes(activityApi, "name: '旺财体育'", '活动列表假数据缺少旺财体育站点')
assertIncludes(activityApi, "name: '财神体育'", '活动列表假数据缺少财神体育站点')
assertIncludes(activityApi, "name: 'DW体育'", '活动列表假数据缺少DW体育站点')
assertIncludes(activityApi, "name: '星河体育'", '活动列表假数据缺少星河体育站点')
if (activityApi.includes("name: '演示总站'")) {
  throw new Error('活动列表假数据仍包含演示总站')
}
assertIncludes(schemas, '在活动期间有效投注额达标，按档位发放奖励', '选择活动类型弹窗中的有效投注额副标题不正确')
assertIncludes(activityScript, 'normalizedType === CUMULATIVE_RECHARGE_ACTIVITY_TYPE_LABEL', '累充活动未接入前端展示配置')
assertIncludes(activityScript, 'normalizedType === DAILY_AMOUNT_ACTIVITY_TYPE_LABEL', '每日投注额度+笔数未接入前端展示配置')
assertIncludes(activityScript, 'requestType === CUMULATIVE_RECHARGE_ACTIVITY_TYPE_VALUE', '累充活动缺少编码识别')
assertIncludes(activityScript, 'requestType === DAILY_AMOUNT_ACTIVITY_TYPE_VALUE', '每日投注额度+笔数缺少编码识别')
assertIncludes(activityScript, 'usesFirstDepositLayout()', '累充活动和有效投注额未复用首存活动页面布局')
assertIncludes(activityTemplate, ':use-first-deposit-rules="isFirstDepositActivity"', '首存活动页面布局缺少可替换规则区域')
assertIncludes(activityTemplate, ':show-activity-editor="false"', '累充活动和有效投注额仍重复展示旧活动文案编辑器')
assertIncludes(activityTemplate, ':show-rule-switches="false"', '累充活动和有效投注额仍展示规则开关模块')
assertIncludes(activityTemplate, ':show-site-venue-rules="usesSharedSiteVenueRules"', '累充活动和有效投注额未共用站点、场馆及奖励档位配置')
assertIncludes(activityTemplate, ':is-cumulative-recharge-rules="isCumulativeRechargeActivity"', '累充活动规则配置缺少类型标识')
const sharedRewardRules = firstDepositForm.slice(
  firstDepositForm.indexOf('v-if="showSiteVenueRules"'),
  firstDepositForm.indexOf('<slot name="rules"')
)
assertIncludes(sharedRewardRules, 'label="提现流水倍数"', '累充活动和有效投注额缺少统一提现流水倍数字段')
assertIncludes(sharedRewardRules, 'v-model="extra.withdrawTurnoverMultiple"', '提现流水倍数未绑定共享配置')
assertIncludes(sharedRewardRules, '提现所需有效投注 = 奖金 × 倍数', '提现流水倍数说明文案不正确')
assertIncludes(sharedRewardRules, 'class="shared-claim-fields"', '提现流水倍数和领取时间未并排展示')
assertIncludes(sharedRewardRules, 'label="达标后可领取时间（天）"', '累充活动和有效投注额缺少达标后可领取时间')
assertIncludes(sharedRewardRules, 'v-model="extra.claimValidDays"', '达标后可领取时间未绑定共享配置')
assertIncludes(sharedRewardRules, '超过此天数奖励过期，不可领取', '达标后可领取时间提示文案不正确')
assertIncludes(sharedRewardRules, 'label="派发规则"', '累充活动和有效投注额缺少派发规则')
assertIncludes(sharedRewardRules, 'label="提现流水倍数" label-width="128px"', '提现流水倍数未与统计周期左对齐')
assertIncludes(sharedRewardRules, 'label="达标后可领取时间（天）" label-width="160px"', '达标后可领取时间标签宽度不合适')
assertIncludes(sharedRewardRules, 'label="派发规则" label-width="80px"', '派发规则标签宽度不合适')
assertIncludes(sharedRewardRules, 'v-model="extra.dispatchRule"', '派发规则未绑定共享配置')
assertIncludes(sharedRewardRules, 'label="系统自动派发"', '派发规则缺少系统自动派发选项')
assertIncludes(sharedRewardRules, 'label="手动派发"', '派发规则缺少手动派发选项')
if (sharedRewardRules.includes('label="流水要求（倍）"')) {
  throw new Error('累充活动和有效投注额奖励档位仍包含流水要求字段')
}
assertIncludes(firstDepositForm, '.withdraw-turnover-field {\n  width: 260px;', '提现流水倍数输入框未与统计周期保持相同宽度')
assertIncludes(firstDepositForm, '.withdraw-turnover-hint,', '提现流水倍数缺少提示样式')
assertIncludes(firstDepositForm, 'color: #a0a6b1;', '提现流水倍数提示文字颜色不够弱')
assertIncludes(firstDepositForm, '.claim-valid-days-field {\n  width: 260px;', '达标后可领取时间输入框未与提现流水倍数保持相同宽度')
assertIncludes(firstDepositForm, '.dispatch-rule-select {\n  width: 260px;', '派发规则下拉框未与统计周期保持相同宽度')
assertIncludes(firstDepositForm, 'flex-wrap: nowrap;', '共享领取规则字段未固定在同一行')
assertIncludes(firstDepositForm, 'white-space: nowrap;', '共享领取规则字段名称仍可能换行')
assertIncludes(activityTemplate, 'v-if="!isFirstDepositActivity && !usesSharedSiteVenueRules"', '累充活动或有效投注额仍展示旧规则配置')
assertIncludes(activityScript, 'isCumulativeRechargeActivity()', '累充活动缺少独立类型判断')
assertIncludes(activityScript, 'isDailyAmountActivity()', '有效投注额缺少独立类型判断')
assertIncludes(activityScript, 'usesSharedSiteVenueRules()', '累充活动和有效投注额缺少共享规则区判断')
assertIncludes(firstDepositForm, '<slot name="rules" />', '首存活动页面布局缺少专属规则插槽')
assertIncludes(firstDepositForm, 'v-if="useFirstDepositRules"', '首存活动专属规则未与共用页面布局分离')
assertIncludes(firstDepositForm, 'showSiteVenueRules', '首存活动共用页面缺少站点和场馆显示开关')
assertIncludes(firstDepositForm, 'v-if="showSiteVenueRules"', '有效投注额规则配置未渲染站点和场馆')
assertIncludes(firstDepositForm, 'isCumulativeRechargeRules', '共享规则组件无法区分累充活动')
assertIncludes(firstDepositForm, 'v-if="!isCumulativeRechargeRules"', '累充活动仍展示有效投注统计场馆')
assertIncludes(firstDepositForm, ':label="rewardThresholdLabel"', '累充活动奖励档位无法切换门槛字段名称')
assertIncludes(firstDepositForm, 'rewardThresholdLabel()', '累充活动奖励档位缺少门槛字段名称映射')
assertIncludes(firstDepositForm, "'有效累计存款（元）'", '累充活动奖励档位字段名称不正确')
assertIncludes(firstDepositForm, 'rewardThresholdPeriodPrefix()', '奖励档位字段名称未关联统计周期')
;["day: '当日'", "week: '当周'", "month: '当月'"].forEach(mapping => {
  assertIncludes(firstDepositForm, mapping, '奖励档位字段名称缺少统计周期映射')
})
assertIncludes(firstDepositForm, 'label="有效投注统计场馆"', '有效投注额场馆字段名称不正确')
assertIncludes(firstDepositForm, 'label="统计周期"', '有效投注额规则配置缺少统计周期')
assertIncludes(firstDepositForm, '<el-select v-model="extra.validBetStatPeriod"', '有效投注额统计周期未使用下拉框')
;['按自然日统计', '按自然周统计', '按自然月统计'].forEach(label => {
  assertIncludes(firstDepositForm, label, '有效投注额统计周期缺少选项')
})
assertIncludes(firstDepositForm, "validBetStatPeriod: 'day'", '有效投注额统计周期缺少默认值')
;['（次日0点统计）', '（次周一0点统计）', '（次月1日0点统计）'].forEach(label => {
  assertIncludes(firstDepositForm, label, '有效投注额统计周期缺少动态提示')
})
assertIncludes(firstDepositForm, 'validBetStatPeriodHint()', '有效投注额统计周期缺少提示映射')
assertIncludes(firstDepositForm, 'class="valid-bet-period-hint"', '有效投注额统计周期提示未显示在下拉框右侧')
assertIncludes(firstDepositForm, 'gap: 14px;', '有效投注额统计周期提示与下拉框间距不正确')
assertIncludes(firstDepositForm, 'color: #f5222d;', '有效投注额统计周期提示未使用红色')
assertIncludes(firstDepositForm, 'font-size: 12px;', '有效投注额统计周期提示字号过大')
assertIncludes(firstDepositForm, 'class="valid-bet-reward-heading"', '有效投注额规则配置缺少奖励档位标题区域')
assertIncludes(firstDepositForm, '>奖励档位</div>', '有效投注额规则配置缺少奖励档位标题')
assertIncludes(firstDepositForm, '@click="handleAddReward">增加档位</el-button>', '有效投注额规则配置缺少增加档位按钮')
;['有效投注金额（元）', '奖励金额（元）', '操作'].forEach(label => {
  assertIncludes(firstDepositForm, label, '有效投注额奖励档位表格缺少字段')
})
assertIncludes(firstDepositForm, 'class="valid-bet-threshold-input"', '有效投注金额输入框缺少起投条件展示')
assertIncludes(firstDepositForm, '<span class="valid-bet-threshold-input__symbol">≥</span>', '有效投注金额输入框前缺少大于等于符号')
assertIncludes(firstDepositForm, 'overflow-x: hidden;', '有效投注额奖励档位表格仍可能显示横向滚动条')
assertIncludes(firstDepositForm, '{{ $index + 1 }}', '有效投注额奖励档位序号未自动生成')
assertIncludes(firstDepositForm, ':disabled="rewardItems.length <= 1"', '有效投注额奖励档位最后一行仍可删除')
assertIncludes(firstDepositForm, 'if (this.showSiteVenueRules) {', '有效投注额奖励档位默认行未限定在对应活动类型')
assertIncludes(firstDepositForm, 'if (!this.isEdit || !Array.isArray(this.form.rewardItems) || !this.form.rewardItems.length)', '新增有效投注额活动未默认仅展示一条空白档位')
assertIncludes(firstDepositForm, 'this.$set(this.form, \'rewardItems\', [cloneRewardItem(0)])', '有效投注额奖励档位缺少默认行')
assertIncludes(dynamicSectionsTemplate, 'v-if="showActivityEditor"', '活动类型规则组件无法隐藏重复文案编辑器')
assertIncludes(dynamicSectionsTemplate, 'v-if="showRuleSwitches', '活动类型规则组件无法隐藏规则开关模块')
assertIncludes(dynamicSectionsScript, "'每日投注额度+笔数': '有效投注额'", '有效投注额规则区仍展示旧活动类型名称')
assertIncludes(dynamicSectionsScript, "'累充': '累充活动'", '累充活动规则区仍展示旧活动类型名称')
assertIncludes(manageScript, "CREATE_ACTIVITY_TYPE_DISPLAY_LABELS[routeTypeLabel] || routeTypeLabel", '新增活动页面标题未使用活动类型展示名称')
assertIncludes(manageScript, "return '新增' + routeTypeLabel", '新增活动页面未展示已选活动类型')
assertIncludes(activityScript, 'label: "通用"', '签到活动主题缺少通用选项')
assertIncludes(activityScript, 'label: "世界杯"', '签到活动主题缺少世界杯选项')
;['全体会员', 'VIP会员', '7天内注册用户', '代理'].forEach(label => {
  assertIncludes(activityScript, `label: "${label}"`, '新人礼/签到活动对象缺少选项')
  assertIncludes(commonScript, `label:"${label}"`, '通用活动对象缺少选项')
})
assertIncludes(schemas, '"新人礼": {', '缺少新人礼配置模型')
assertIncludes(schemas, '"签到": {', '缺少签到配置模型')
assertIncludes(schemas, 'createSwitchOption("ipUniquenessCheck", "IP唯一性校验", "同一IP只能参与一次")', '新人礼规则缺少IP唯一性校验')
assertIncludes(schemas, 'var result = Object.assign({}, schema.defaults.ruleSwitches || {});', '活动模板规则未继承新增开关默认值')
assertIncludes(dynamicSectionsScript, 'this.currentSchema.ruleOptions.forEach', '活动模板未补齐内置规则开关')

assertIncludes(commonTemplate, '<activity-frontend-display-fields', '通用活动表单未接入展示配置')
assertIncludes(commonTemplate, ':is-edit="isEdit"', '通用活动状态无法区分新增和编辑')
assertIncludes(commonScript, 'ActivityFrontendDisplayFields', '通用活动表单未注册共用组件')
assertIncludes(compactCommonScript, 'next.baseConfigExtra=Object.assign({},data.baseConfigExtra||{})', '通用活动编辑未回显展示配置')
assertIncludes(compactCommonScript, 'baseConfigExtra:Object.assign({},this.form.baseConfigExtra||{})', '通用活动保存未提交展示配置')

console.log('activity frontend display fields check passed')
